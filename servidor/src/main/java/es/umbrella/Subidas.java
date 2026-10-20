/*
 * ============================================================================
 *  Subidas.java — Imágenes, vídeos, texturas y audio subidos desde la app.
 * ============================================================================
 *  Se sirven en  /subidas/<nombre>  y se guardan en el almacenamiento elegido
 *  (carpeta data/subidas o PostgreSQL), con una caché en memoria.
 *  Admiten peticiones Range para que los vídeos se puedan adelantar.
 * ============================================================================
 */
package es.umbrella;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

final class Subidas {

    /** Tamaño máximo de un archivo subido. */
    static final int MAX_BYTES = 80 * 1024 * 1024;
    /** Memoria máxima dedicada a la caché. */
    private static final long MAX_CACHE = 96L * 1024 * 1024;

    private static final Pattern NOMBRE = Pattern.compile("[a-z0-9][a-z0-9._-]{0,120}");

    static final Map<String, String> TIPOS = Map.ofEntries(
            Map.entry("webp", "image/webp"),
            Map.entry("png", "image/png"),
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"),
            Map.entry("gif", "image/gif"),
            Map.entry("avif", "image/avif"),
            Map.entry("mp4", "video/mp4"),
            Map.entry("webm", "video/webm"),
            Map.entry("mp3", "audio/mpeg"),
            Map.entry("ogg", "audio/ogg"),
            Map.entry("wav", "audio/wav"));

    private final Almacenamiento almacen;
    private long bytesCache;
    private final LinkedHashMap<String, byte[]> cache = new LinkedHashMap<>(16, 0.75f, true);

    Subidas(Almacenamiento almacen) {
        this.almacen = almacen;
    }

    static boolean nombreValido(String nombre) {
        return nombre != null && NOMBRE.matcher(nombre).matches() && !nombre.contains("..") && TIPOS.containsKey(extension(nombre));
    }

    static String extension(String nombre) {
        int punto = nombre.lastIndexOf('.');
        return punto < 0 ? "" : nombre.substring(punto + 1).toLowerCase(Locale.ROOT);
    }

    /** Convierte un nombre cualquiera ("Mapa Raccoon (1).PNG") en uno válido ("mapa-raccoon-1.png"). */
    static String normalizar(String nombre) {
        if (nombre == null) {
            return "";
        }
        String n = java.text.Normalizer.normalize(nombre, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).trim();
        String ext = extension(n);
        String base = n.substring(0, Math.max(0, n.length() - ext.length() - (ext.isEmpty() ? 0 : 1)));
        base = base.replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        if (base.isEmpty()) {
            base = "archivo";
        }
        if (base.length() > 100) {
            base = base.substring(0, 100);
        }
        return base + "." + ext;
    }

    void guardar(String nombre, byte[] datos) throws IOException {
        if (!nombreValido(nombre)) {
            throw new Peticion.ErrorHttp(400, "Nombre o tipo de archivo no admitido. Tipos: " + TIPOS.keySet());
        }
        if (datos.length == 0) {
            throw new Peticion.ErrorHttp(400, "El archivo está vacío");
        }
        almacen.guardarArchivo(nombre, datos);
        synchronized (cache) {
            quitar(nombre);
        }
    }

    boolean borrar(String nombre) throws IOException {
        synchronized (cache) {
            quitar(nombre);
        }
        return nombreValido(nombre) && almacen.borrarArchivo(nombre);
    }

    Map<String, Long> listar() throws IOException {
        return almacen.listarArchivos();
    }

    private void quitar(String nombre) {
        byte[] b = cache.remove(nombre);
        if (b != null) {
            bytesCache -= b.length;
        }
    }

    private byte[] leer(String nombre) throws IOException {
        synchronized (cache) {
            byte[] b = cache.get(nombre);
            if (b != null) {
                return b;
            }
        }
        byte[] datos = almacen.leerArchivo(nombre);
        if (datos != null && datos.length < MAX_CACHE / 4) {
            synchronized (cache) {
                cache.put(nombre, datos);
                bytesCache += datos.length;
                var it = cache.entrySet().iterator();
                while (bytesCache > MAX_CACHE && it.hasNext()) {
                    bytesCache -= it.next().getValue().length;
                    it.remove();
                }
            }
        }
        return datos;
    }

    /** Sirve /subidas/<nombre> (con soporte de Range para vídeo y audio). */
    void servir(Peticion p, String nombre) throws IOException {
        if (!nombreValido(nombre)) {
            p.enviar(404, "text/plain; charset=utf-8", "No encontrado".getBytes());
            return;
        }
        byte[] datos = leer(nombre);
        if (datos == null) {
            p.enviar(404, "text/plain; charset=utf-8", "No encontrado".getBytes());
            return;
        }
        p.enviarConRango(TIPOS.get(extension(nombre)), datos, "public, max-age=3600");
    }
}
