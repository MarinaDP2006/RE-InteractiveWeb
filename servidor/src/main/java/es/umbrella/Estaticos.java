/*
 * ============================================================================
 *  Estaticos.java — Sirve los archivos de la carpeta web/
 * ============================================================================
 *  · /            → portal de entrada a la wiki
 *  · /wiki/...    → la wiki     (si está cerrada al público: página de mantenimiento)
 *  · /img/...     → imágenes de las fichas
 *
 *  Protección contra "path traversal", caché del navegador (imágenes 7 días,
 *  HTML/CSS/JS revalidados), gzip y peticiones Range para vídeo.
 * ============================================================================
 */
package es.umbrella;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;

final class Estaticos implements HttpHandler {

    private static final Map<String, String> TIPOS = Map.ofEntries(
            Map.entry("html", "text/html; charset=utf-8"),
            Map.entry("css", "text/css; charset=utf-8"),
            Map.entry("js", "text/javascript; charset=utf-8"),
            Map.entry("mjs", "text/javascript; charset=utf-8"),
            Map.entry("json", "application/json; charset=utf-8"),
            Map.entry("svg", "image/svg+xml"),
            Map.entry("png", "image/png"),
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"),
            Map.entry("webp", "image/webp"),
            Map.entry("avif", "image/avif"),
            Map.entry("gif", "image/gif"),
            Map.entry("ico", "image/x-icon"),
            Map.entry("mp3", "audio/mpeg"),
            Map.entry("ogg", "audio/ogg"),
            Map.entry("wav", "audio/wav"),
            Map.entry("mp4", "video/mp4"),
            Map.entry("webm", "video/webm"),
            Map.entry("vtt", "text/vtt; charset=utf-8"),
            Map.entry("woff2", "font/woff2"),
            Map.entry("txt", "text/plain; charset=utf-8"),
            Map.entry("webmanifest", "application/manifest+json"));

    private final Path raiz;

    /** Fija la raíz real del sitio para evitar escapes mediante enlaces simbólicos. */
    Estaticos(Path raiz) throws IOException {
        this.raiz = raiz.toRealPath();
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        Peticion p = new Peticion(ex);
        try {
            if (!"GET".equals(p.metodo) && !"HEAD".equals(p.metodo)) {
                p.enviar(405, "text/plain; charset=utf-8", "Método no permitido".getBytes(StandardCharsets.UTF_8));
                return;
            }
            String ruta = p.ruta;

            // /wiki → /wiki/  (las rutas relativas de la página dependen de la barra final)
            if (ruta.equals("/wiki")) {
                p.redirigir(ruta + "/");
                return;
            }
            if (ruta.endsWith("/")) {
                ruta += "index.html";
            }
            Path archivo = resolver(ruta);
            if (archivo != null && Files.isDirectory(archivo)) {
                p.redirigir(p.ruta + "/");
                return;
            }
            if (archivo == null || !Files.isRegularFile(archivo)) {
                noEncontrado(p);
                return;
            }
            String extension = extension(archivo.getFileName().toString());
            String tipo = TIPOS.getOrDefault(extension, "application/octet-stream");

            String modificado = DateTimeFormatter.RFC_1123_DATE_TIME.format(
                    Files.getLastModifiedTime(archivo).toInstant().truncatedTo(ChronoUnit.SECONDS).atZone(ZoneOffset.UTC));
            boolean binario = tipo.startsWith("image/") || tipo.startsWith("video/") || tipo.startsWith("audio/") || tipo.startsWith("font/");
            ex.getResponseHeaders().set("Last-Modified", modificado);
            if (modificado.equals(p.cabecera("If-Modified-Since"))) {
                ex.getResponseHeaders().set("Cache-Control", binario ? "public, max-age=604800" : "no-cache");
                ex.sendResponseHeaders(304, -1);
                return;
            }
            byte[] datos = Files.readAllBytes(archivo);
            if (binario) {
                p.enviarConRango(tipo, datos, "public, max-age=604800");
            } else {
                ex.getResponseHeaders().set("Cache-Control", "no-cache");
                p.enviar(200, tipo, datos);
            }
        } catch (Peticion.ErrorHttp e) {
            p.enviar(e.codigo, "text/plain; charset=utf-8", e.getMessage().getBytes(StandardCharsets.UTF_8));
        } finally {
            ex.close();
        }
    }

    /** Resuelve archivos únicamente dentro de web/, incluso si existen enlaces simbólicos. */
    private Path resolver(String ruta) {
        try {
            String decodificada = java.net.URLDecoder.decode(ruta.replace("+", "%2B"), StandardCharsets.UTF_8);
            Path candidato = raiz.resolve(decodificada.substring(1)).normalize();
            if (!candidato.startsWith(raiz) || !Files.exists(candidato)) return null;
            Path real = candidato.toRealPath();
            return real.startsWith(raiz) ? real : null;
        } catch (IllegalArgumentException | IOException e) { // incluye rutas ilegales y enlaces rotos
            return null;
        }
    }

    private static String extension(String nombre) {
        int punto = nombre.lastIndexOf('.');
        return punto < 0 ? "" : nombre.substring(punto + 1).toLowerCase(Locale.ROOT);
    }

    private void noEncontrado(Peticion p) throws IOException {
        Path pagina = raiz.resolve("404.html");
        byte[] html = Files.exists(pagina) ? Files.readAllBytes(pagina)
                : "<!doctype html><meta charset=utf-8><title>404</title><h1>404 — Archivo perdido</h1><a href=\"/\">Volver</a>".getBytes(StandardCharsets.UTF_8);
        p.enviar(404, "text/html; charset=utf-8", html);
    }
}
