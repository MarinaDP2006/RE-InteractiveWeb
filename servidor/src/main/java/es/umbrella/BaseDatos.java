/*
 * ============================================================================
 *  BaseDatos.java — "UmbraDB": base de datos documental (JSON).
 * ============================================================================
 *  Cada COLECCIÓN es un conjunto de documentos  { "id": { ...campos... } }.
 *
 *  · Todo se mantiene en memoria (rápido) y cada cambio se escribe en el
 *    almacenamiento elegido: archivos JSON o PostgreSQL (ver Almacenamiento).
 *  · La primera vez se rellena con los datos de la carpeta semilla/ (la wiki,
 *    los puzzles, la configuración del juego...).
 *  · Copias de seguridad en ZIP, automáticas cada 24 h y manuales desde la
 *    app de administración (que además se las descarga a tu PC).
 *
 *  Colecciones del sistema (nunca salen por la API pública):
 *    _config, puzzles, partidas, ranking, estadisticas, registro
 * ============================================================================
 */
package es.umbrella;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public final class BaseDatos {

    /** Nombres válidos de colección y de documento. */
    public static final Pattern NOMBRE = Pattern.compile("[a-z0-9_][a-z0-9_-]{0,63}");

    private static final int MAX_COPIAS = 30;
    private static final DateTimeFormatter FORMATO_COPIA = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private final Almacenamiento almacen;
    private final Path carpetaCopias;
    private final Path carpetaSemilla;

    /** coleccion → (id → documento). */
    private final Map<String, Map<String, Map<String, Object>>> colecciones = new TreeMap<>();

    public BaseDatos(Almacenamiento almacen, Path carpetaDatos, Path carpetaSemilla) throws IOException {
        this.almacen = almacen;
        this.carpetaCopias = carpetaDatos.resolve("copias");
        this.carpetaSemilla = carpetaSemilla;
        Files.createDirectories(carpetaCopias);
        cargarTodo();
        sembrar();
        System.out.println("[DB] " + colecciones.size() + " colecciones · " + almacen.descripcion());
    }

    public String descripcionAlmacen() {
        return almacen.descripcion();
    }

    /** Acceso a los archivos subidos (imágenes, vídeos...). */
    public Almacenamiento almacen() {
        return almacen;
    }

    // =====================================================================
    //  Arranque
    // =====================================================================

    private synchronized void cargarTodo() throws IOException {
        colecciones.clear();
        for (Map.Entry<String, String> e : almacen.cargarTodo().entrySet()) {
            if (!NOMBRE.matcher(e.getKey()).matches()) {
                continue;
            }
            try {
                colecciones.put(e.getKey(), convertir(Json.leerObjeto(e.getValue())));
            } catch (RuntimeException ex) {
                System.err.println("[DB] ¡La colección " + e.getKey() + " está dañada y se ignora! " + ex.getMessage());
            }
        }
    }

    /** Crea desde semilla/ las colecciones que todavía no existan. */
    private synchronized void sembrar() throws IOException {
        if (carpetaSemilla == null || !Files.isDirectory(carpetaSemilla)) {
            System.out.println("[DB] Sin carpeta semilla.");
            return;
        }
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(carpetaSemilla, "*.json")) {
            for (Path p : ds) {
                String col = p.getFileName().toString().replaceFirst("\\.json$", "");
                if (!NOMBRE.matcher(col).matches()) {
                    continue;
                }
                if (colecciones.containsKey(col)) {
                    // Los puzzles nuevos de una actualización del juego se añaden
                    // solos (sin tocar los que el administrador haya editado).
                    if ("puzzles".equals(col)) {
                        try {
                            Map<String, Map<String, Object>> semilla = convertir(Json.leerObjeto(Files.readString(p, StandardCharsets.UTF_8)));
                            Map<String, Map<String, Object>> c = colecciones.get(col);
                            int n = 0;
                            for (Map.Entry<String, Map<String, Object>> e : semilla.entrySet()) {
                                if (!c.containsKey(e.getKey())) {
                                    c.put(e.getKey(), e.getValue());
                                    n++;
                                }
                            }
                            if (n > 0) {
                                persistir(col);
                                System.out.println("[DB] Puzzles nuevos añadidos desde la semilla: " + n);
                            }
                        } catch (RuntimeException ex) {
                            System.err.println("[DB] Semilla no válida " + p.getFileName() + ": " + ex.getMessage());
                        }
                    }
                    continue;
                }
                try {
                    colecciones.put(col, convertir(Json.leerObjeto(Files.readString(p, StandardCharsets.UTF_8))));
                    persistir(col);
                    System.out.println("[DB] Colección creada desde la semilla: " + col);
                } catch (RuntimeException ex) {
                    System.err.println("[DB] Semilla no válida " + p.getFileName() + ": " + ex.getMessage());
                }
            }
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Map<String, Object>> convertir(Map<String, Object> crudo) {
        Map<String, Map<String, Object>> col = new LinkedHashMap<>();
        for (Map.Entry<String, Object> e : crudo.entrySet()) {
            if (e.getValue() instanceof Map && NOMBRE.matcher(e.getKey()).matches()) {
                col.put(e.getKey(), (Map<String, Object>) e.getValue());
            }
        }
        return col;
    }

    // =====================================================================
    //  Lectura
    // =====================================================================

    public synchronized List<String> colecciones() {
        return new ArrayList<>(colecciones.keySet());
    }

    public synchronized int contar(String coleccion) {
        Map<String, Map<String, Object>> c = colecciones.get(coleccion);
        return c == null ? 0 : c.size();
    }

    /** Todos los documentos de una colección (copias), cada uno con su "id". */
    public synchronized List<Map<String, Object>> listar(String coleccion) {
        Map<String, Map<String, Object>> c = colecciones.get(coleccion);
        List<Map<String, Object>> lista = new ArrayList<>();
        if (c != null) {
            for (Map.Entry<String, Map<String, Object>> e : c.entrySet()) {
                lista.add(conId(e.getKey(), e.getValue()));
            }
        }
        return lista;
    }

    public synchronized Map<String, Object> obtener(String coleccion, String id) {
        Map<String, Map<String, Object>> c = colecciones.get(coleccion);
        if (c == null || id == null) {
            return null;
        }
        Map<String, Object> doc = c.get(id);
        return doc == null ? null : conId(id, doc);
    }

    public synchronized boolean existe(String coleccion, String id) {
        Map<String, Map<String, Object>> c = colecciones.get(coleccion);
        return c != null && c.containsKey(id);
    }

    private static Map<String, Object> conId(String id, Map<String, Object> doc) {
        Map<String, Object> copia = new LinkedHashMap<>();
        copia.put("id", id);
        for (Map.Entry<String, Object> e : doc.entrySet()) {
            if (!"id".equals(e.getKey())) {
                copia.put(e.getKey(), Json.copia(e.getValue()));
            }
        }
        return copia;
    }

    // =====================================================================
    //  Escritura
    // =====================================================================

    /** Crea o reemplaza un documento. Devuelve el documento guardado. */
    public synchronized Map<String, Object> guardar(String coleccion, String id, Map<String, Object> doc) throws IOException {
        validarNombre(coleccion, "colección");
        validarNombre(id, "documento");
        Map<String, Object> limpio = Json.copia(doc);
        limpio.remove("id");
        limpio.put("_actualizado", Instant.now().toString());
        colecciones.computeIfAbsent(coleccion, k -> new LinkedHashMap<>()).put(id, limpio);
        persistir(coleccion);
        return conId(id, limpio);
    }

    public synchronized boolean borrar(String coleccion, String id) throws IOException {
        Map<String, Map<String, Object>> c = colecciones.get(coleccion);
        if (c == null || c.remove(id) == null) {
            return false;
        }
        persistir(coleccion);
        return true;
    }

    /** Vacía una colección entera (p. ej. reiniciar el ranking). */
    public synchronized void vaciar(String coleccion) throws IOException {
        validarNombre(coleccion, "colección");
        colecciones.put(coleccion, new LinkedHashMap<>());
        persistir(coleccion);
    }

    /** Elimina los documentos más antiguos si la colección supera el máximo. */
    public synchronized void recortar(String coleccion, int maximo) throws IOException {
        Map<String, Map<String, Object>> c = colecciones.get(coleccion);
        if (c == null || c.size() <= maximo) {
            return;
        }
        var it = c.keySet().iterator();
        int sobran = c.size() - maximo;
        while (sobran-- > 0 && it.hasNext()) {
            it.next();
            it.remove();
        }
        persistir(coleccion);
    }

    private void persistir(String coleccion) throws IOException {
        almacen.escribir(coleccion, Json.bonito(colecciones.getOrDefault(coleccion, Map.of())));
    }

    private static void validarNombre(String nombre, String que) {
        if (nombre == null || !NOMBRE.matcher(nombre).matches()) {
            throw new IllegalArgumentException("Nombre de " + que + " no válido (solo a-z, 0-9, _ y -; máx. 64): " + nombre);
        }
    }

    // =====================================================================
    //  Semilla: volver a importar los datos originales
    // =====================================================================

    /**
     * Añade desde semilla/ los documentos que falten en una colección.
     * Si sobrescribir = true, también reemplaza los existentes por la versión original.
     */
    public synchronized int reimportarSemilla(String coleccion, boolean sobrescribir) throws IOException {
        validarNombre(coleccion, "colección");
        Path p = carpetaSemilla == null ? null : carpetaSemilla.resolve(coleccion + ".json");
        if (p == null || !Files.exists(p)) {
            throw new IllegalArgumentException("No hay semilla para la colección " + coleccion);
        }
        Map<String, Map<String, Object>> semilla = convertir(Json.leerObjeto(Files.readString(p, StandardCharsets.UTF_8)));
        Map<String, Map<String, Object>> c = colecciones.computeIfAbsent(coleccion, k -> new LinkedHashMap<>());
        int n = 0;
        for (Map.Entry<String, Map<String, Object>> e : semilla.entrySet()) {
            if (sobrescribir || !c.containsKey(e.getKey())) {
                c.put(e.getKey(), e.getValue());
                n++;
            }
        }
        persistir(coleccion);
        return n;
    }

    public List<String> coleccionesSemilla() throws IOException {
        List<String> lista = new ArrayList<>();
        if (carpetaSemilla != null && Files.isDirectory(carpetaSemilla)) {
            try (DirectoryStream<Path> ds = Files.newDirectoryStream(carpetaSemilla, "*.json")) {
                for (Path p : ds) {
                    lista.add(p.getFileName().toString().replaceFirst("\\.json$", ""));
                }
            }
        }
        lista.sort(null);
        return lista;
    }

    // =====================================================================
    //  Exportar / importar todo
    // =====================================================================

    /** Toda la base de datos en un único objeto { coleccion: { id: doc } }. */
    public synchronized Map<String, Object> exportar() {
        Map<String, Object> todo = new LinkedHashMap<>();
        for (Map.Entry<String, Map<String, Map<String, Object>>> e : colecciones.entrySet()) {
            todo.put(e.getKey(), Json.copia(e.getValue()));
        }
        return todo;
    }

    // =====================================================================
    //  Copias de seguridad (ZIP con un .json por colección)
    // =====================================================================

    /** ZIP en memoria con todas las colecciones (y, si se pide, los archivos subidos en subidas/). */
    public synchronized byte[] zip(boolean conArchivos) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(bytes, StandardCharsets.UTF_8)) {
            for (Map.Entry<String, Map<String, Map<String, Object>>> e : colecciones.entrySet()) {
                zos.putNextEntry(new ZipEntry(e.getKey() + ".json"));
                zos.write(Json.bonito(e.getValue()).getBytes(StandardCharsets.UTF_8));
                zos.closeEntry();
            }
            if (conArchivos) {
                for (String nombre : almacen.listarArchivos().keySet()) {
                    byte[] datos = almacen.leerArchivo(nombre);
                    if (datos != null) {
                        zos.putNextEntry(new ZipEntry("subidas/" + nombre));
                        zos.write(datos);
                        zos.closeEntry();
                    }
                }
            }
        }
        return bytes.toByteArray();
    }

    public byte[] zip() throws IOException {
        return zip(false);
    }

    /** Guarda una copia en data/copias. Devuelve el nombre del archivo. */
    public synchronized String copiaSeguridad(String motivo) throws IOException {
        String sufijo = motivo == null || motivo.isBlank() ? "manual" : motivo.toLowerCase().replaceAll("[^a-z0-9-]", "");
        String nombre = "copia-" + LocalDateTime.now().format(FORMATO_COPIA) + "-" + sufijo + ".zip";
        Files.write(carpetaCopias.resolve(nombre), zip());
        limpiarCopias();
        return nombre;
    }

    public synchronized List<Map<String, Object>> listarCopias() throws IOException {
        List<Map<String, Object>> lista = new ArrayList<>();
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(carpetaCopias, "copia-*.zip")) {
            for (Path p : ds) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("nombre", p.getFileName().toString());
                m.put("bytes", Files.size(p));
                m.put("fecha", Files.getLastModifiedTime(p).toInstant().toString());
                lista.add(m);
            }
        }
        lista.sort(Comparator.comparing((Map<String, Object> m) -> (String) m.get("nombre")).reversed());
        return lista;
    }

    public Path rutaCopia(String nombre) {
        if (nombre == null || !nombre.matches("copia-[0-9]{8}-[0-9]{6}-[a-z0-9-]*\\.zip")) {
            throw new IllegalArgumentException("Nombre de copia no válido");
        }
        return carpetaCopias.resolve(nombre);
    }

    public synchronized void borrarCopia(String nombre) throws IOException {
        Files.deleteIfExists(rutaCopia(nombre));
    }

    /** Restaura una copia guardada en el servidor. */
    public synchronized int restaurar(String nombre) throws IOException {
        Path zip = rutaCopia(nombre);
        if (!Files.exists(zip)) {
            throw new IllegalArgumentException("No existe la copia " + nombre);
        }
        try (InputStream in = Files.newInputStream(zip)) {
            return restaurarDesde(in);
        }
    }

    /**
     * Restaura desde un ZIP (p. ej. subido desde la app). Las colecciones del ZIP
     * sustituyen a las actuales; las que no vengan en el ZIP no se tocan.
     * @return número de colecciones restauradas.
     */
    public synchronized int restaurarDesde(InputStream zipStream) throws IOException {
        // 1) Leer y validar TODO antes de tocar nada.
        Map<String, Map<String, Map<String, Object>>> nuevas = new LinkedHashMap<>();
        Map<String, byte[]> archivos = new LinkedHashMap<>();
        try (ZipInputStream zis = new ZipInputStream(zipStream, StandardCharsets.UTF_8)) {
            ZipEntry e;
            while ((e = zis.getNextEntry()) != null) {
                String n = e.getName();
                if (!e.isDirectory() && n.startsWith("subidas/")) {
                    String archivo = n.substring(8);
                    if (Subidas.nombreValido(archivo)) {
                        archivos.put(archivo, zis.readNBytes(Subidas.MAX_BYTES));
                    }
                    continue;
                }
                if (e.isDirectory() || !n.endsWith(".json") || n.contains("/") || n.contains("\\")) {
                    continue;
                }
                String col = n.substring(0, n.length() - 5);
                validarNombre(col, "colección");
                byte[] datos = zis.readNBytes(64 * 1024 * 1024 + 1);
                if (datos.length > 64 * 1024 * 1024) {
                    throw new IllegalArgumentException("Colección demasiado grande en el ZIP: " + col);
                }
                nuevas.put(col, convertir(Json.leerObjeto(new String(datos, StandardCharsets.UTF_8))));
            }
        }
        if (nuevas.isEmpty() && archivos.isEmpty()) {
            throw new IllegalArgumentException("El archivo no es una copia válida (no contiene colecciones .json)");
        }
        // 2) Copia del estado actual por si acaso.
        copiaSeguridad("antes-de-restaurar");
        // 3) Sustituir.
        for (Map.Entry<String, Map<String, Map<String, Object>>> e : nuevas.entrySet()) {
            colecciones.put(e.getKey(), e.getValue());
            persistir(e.getKey());
        }
        for (Map.Entry<String, byte[]> e : archivos.entrySet()) {
            almacen.guardarArchivo(e.getKey(), e.getValue());
        }
        return nuevas.size() + archivos.size();
    }

    private void limpiarCopias() throws IOException {
        List<Map<String, Object>> copias = listarCopias();
        for (int i = MAX_COPIAS; i < copias.size(); i++) {
            Files.deleteIfExists(carpetaCopias.resolve((String) copias.get(i).get("nombre")));
        }
    }

    /** ¿Hace más de 24 h de la última copia? (para la copia automática diaria) */
    public synchronized boolean tocaCopiaAutomatica() throws IOException {
        List<Map<String, Object>> copias = listarCopias();
        if (copias.isEmpty()) {
            return true;
        }
        Instant ultima = Instant.parse((String) copias.get(0).get("fecha"));
        return ultima.isBefore(Instant.now().minusSeconds(24 * 3600));
    }

    /** Tamaño aproximado de los datos (JSON). */
    public synchronized long bytesDatos() {
        long total = 0;
        for (Map<String, Map<String, Object>> c : colecciones.values()) {
            total += Json.escribir(c).length();
        }
        return total;
    }
}
