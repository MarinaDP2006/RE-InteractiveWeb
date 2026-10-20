/*
 * ============================================================================
 *  Estaticos.java — Sirve la web (carpeta web/) y los archivos subidos.
 * ============================================================================
 *  · /            → portal (elige Wiki o Juego)
 *  · /wiki/...    → la wiki     (si está cerrada al público: página de mantenimiento)
 *  · /juego/...   → el juego    (ídem)
 *  · /subidas/... → imágenes y vídeos subidos desde la app de administración
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
    private final Api api;
    private final Subidas subidas;

    Estaticos(Path raiz, Api api, Subidas subidas) {
        this.raiz = raiz;
        this.api = api;
        this.subidas = subidas;
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

            if (ruta.startsWith("/subidas/")) {
                subidas.servir(p, ruta.substring("/subidas/".length()));
                return;
            }
            // /wiki → /wiki/  (las rutas relativas de la página dependen de la barra final)
            if (ruta.equals("/wiki") || ruta.equals("/juego") || ruta.equals("/admin")) {
                p.redirigir(ruta + "/");
                return;
            }
            // Secciones cerradas al público (el admin con "Ver como admin" sí entra).
            boolean esHtml = ruta.endsWith("/") || ruta.endsWith(".html");
            if (ruta.startsWith("/wiki/") && !api.wikiAbierta(p) && esHtml) {
                cerrado(p, "wiki");
                return;
            }
            if (ruta.startsWith("/juego/") && !api.juegoAbierto(p) && esHtml) {
                cerrado(p, "juego");
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

    private Path resolver(String ruta) {
        try {
            String decodificada = java.net.URLDecoder.decode(ruta.replace("+", "%2B"), StandardCharsets.UTF_8);
            Path candidato = raiz.resolve(decodificada.substring(1)).normalize();
            return candidato.startsWith(raiz) ? candidato : null;
        } catch (IllegalArgumentException e) { // incluye InvalidPathException
            return null;
        }
    }

    private static String extension(String nombre) {
        int punto = nombre.lastIndexOf('.');
        return punto < 0 ? "" : nombre.substring(punto + 1).toLowerCase(Locale.ROOT);
    }

    /** Página de mantenimiento (web/cerrado.html con el mensaje del admin). */
    private void cerrado(Peticion p, String seccion) throws IOException {
        Map<String, Object> a = api.acceso();
        String mensaje = Json.texto(Json.objeto(a, seccion), "mensaje", "");
        if (mensaje.isBlank()) {
            mensaje = "Esta sección está cerrada temporalmente. Vuelve pronto, superviviente.";
        }
        Path plantilla = raiz.resolve("cerrado.html");
        String html = Files.exists(plantilla) ? Files.readString(plantilla, StandardCharsets.UTF_8)
                : "<!doctype html><meta charset=utf-8><title>Cerrado</title><h1>{{SECCION}}</h1><p>{{MENSAJE}}</p>";
        html = html.replace("{{SECCION}}", "wiki".equals(seccion) ? "La Wiki" : "El Juego")
                .replace("{{MENSAJE}}", escapar(mensaje));
        p.ex.getResponseHeaders().set("Cache-Control", "no-store");
        p.ex.getResponseHeaders().set("Retry-After", "600");
        p.enviar(503, "text/html; charset=utf-8", html.getBytes(StandardCharsets.UTF_8));
    }

    private void noEncontrado(Peticion p) throws IOException {
        Path pagina = raiz.resolve("404.html");
        byte[] html = Files.exists(pagina) ? Files.readAllBytes(pagina)
                : "<!doctype html><meta charset=utf-8><title>404</title><h1>404 — Archivo perdido</h1><a href=\"/\">Volver</a>".getBytes(StandardCharsets.UTF_8);
        p.enviar(404, "text/html; charset=utf-8", html);
    }

    static String escapar(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
