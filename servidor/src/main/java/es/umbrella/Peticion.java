/*
 * ============================================================================
 *  Peticion.java — Envoltorio cómodo sobre HttpExchange.
 * ============================================================================
 *  Lectura del cuerpo con límite de tamaño, parámetros de la URL, cookies,
 *  IP del visitante y respuestas JSON comprimidas.
 * ============================================================================
 */
package es.umbrella;

import com.sun.net.httpserver.HttpExchange;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.zip.GZIPOutputStream;

final class Peticion {

    /** Error con código HTTP: se convierte en {"ok":false,"error":...}. */
    static final class ErrorHttp extends RuntimeException {
        private static final long serialVersionUID = 1L;
        final int codigo;

        ErrorHttp(int codigo, String mensaje) {
            super(mensaje);
            this.codigo = codigo;
        }
    }

    final HttpExchange ex;
    final String metodo;
    final String ruta;
    /** Ruta partida por "/" sin vacíos: /api/wiki/juegos → [api, wiki, juegos] */
    final List<String> partes;
    private Map<String, String> parametros;

    Peticion(HttpExchange ex) {
        this.ex = ex;
        this.metodo = ex.getRequestMethod().toUpperCase(Locale.ROOT);
        String r = ex.getRequestURI().getPath();
        this.ruta = r == null || r.isEmpty() ? "/" : r;
        this.partes = Arrays.stream(this.ruta.split("/")).filter(s -> !s.isEmpty()).toList();
    }

    String parte(int i) {
        return i < partes.size() ? partes.get(i) : null;
    }

    // ------------------------------------------------------------------
    //  Entrada
    // ------------------------------------------------------------------

    Map<String, String> parametros() {
        if (parametros == null) {
            parametros = new HashMap<>();
            String q = ex.getRequestURI().getRawQuery();
            if (q != null) {
                for (String par : q.split("&")) {
                    int igual = par.indexOf('=');
                    String k = igual < 0 ? par : par.substring(0, igual);
                    String v = igual < 0 ? "" : par.substring(igual + 1);
                    try {
                        parametros.put(URLDecoder.decode(k, StandardCharsets.UTF_8), URLDecoder.decode(v, StandardCharsets.UTF_8));
                    } catch (IllegalArgumentException ignorado) {
                        // Parámetro mal codificado: se ignora.
                    }
                }
            }
        }
        return parametros;
    }

    String parametro(String nombre, String porDefecto) {
        String v = parametros().get(nombre);
        return v == null ? porDefecto : v;
    }

    String cabecera(String nombre) {
        return ex.getRequestHeaders().getFirst(nombre);
    }

    /** Valor de una cookie de la petición, o null. */
    String cookie(String nombre) {
        List<String> cookies = ex.getRequestHeaders().get("Cookie");
        if (cookies == null) {
            return null;
        }
        for (String linea : cookies) {
            for (String c : linea.split(";")) {
                String[] kv = c.trim().split("=", 2);
                if (kv.length == 2 && kv[0].equals(nombre)) {
                    return kv[1];
                }
            }
        }
        return null;
    }

    /** Lee el cuerpo completo; lanza 413 si supera el máximo. */
    byte[] cuerpo(int maximo) throws IOException {
        String largo = cabecera("Content-Length");
        if (largo != null) {
            try {
                if (Long.parseLong(largo.trim()) > maximo) {
                    throw new ErrorHttp(413, "Petición demasiado grande (máx. " + (maximo / 1024) + " KB)");
                }
            } catch (NumberFormatException ignorado) {
                // Se comprueba igualmente al leer.
            }
        }
        InputStream in = ex.getRequestBody();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[16384];
        int n;
        long total = 0;
        while ((n = in.read(buf)) != -1) {
            total += n;
            if (total > maximo) {
                throw new ErrorHttp(413, "Petición demasiado grande (máx. " + (maximo / 1024) + " KB)");
            }
            out.write(buf, 0, n);
        }
        return out.toByteArray();
    }

    Map<String, Object> json(int maximo) throws IOException {
        String texto = new String(cuerpo(maximo), StandardCharsets.UTF_8);
        if (texto.isBlank()) {
            throw new ErrorHttp(400, "Falta el cuerpo JSON de la petición");
        }
        try {
            return Json.leerObjeto(texto);
        } catch (IllegalArgumentException e) {
            throw new ErrorHttp(400, e.getMessage());
        }
    }

    // ------------------------------------------------------------------
    //  Salida
    // ------------------------------------------------------------------

    static void cabecerasSeguridad(HttpExchange ex) {
        var h = ex.getResponseHeaders();
        h.set("X-Content-Type-Options", "nosniff");
        h.set("Referrer-Policy", "strict-origin-when-cross-origin");
        h.set("X-Frame-Options", "SAMEORIGIN");
        h.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    }

    boolean aceptaGzip() {
        String ae = cabecera("Accept-Encoding");
        return ae != null && ae.toLowerCase(Locale.ROOT).contains("gzip");
    }

    void responderJson(int codigo, Object datos) throws IOException {
        ex.getResponseHeaders().set("Cache-Control", "no-store");
        enviar(codigo, "application/json; charset=utf-8", Json.escribir(datos).getBytes(StandardCharsets.UTF_8));
    }

    /** Envía bytes, comprimidos con gzip si el cliente lo admite y compensa. */
    void enviar(int codigo, String tipo, byte[] datos) throws IOException {
        cabecerasSeguridad(ex);
        ex.getResponseHeaders().set("Content-Type", tipo);
        boolean comprimible = datos.length > 1024 && aceptaGzip()
                && (tipo.startsWith("text/") || tipo.contains("json") || tipo.contains("javascript") || tipo.contains("svg"));
        if (comprimible) {
            ByteArrayOutputStream b = new ByteArrayOutputStream(datos.length / 3);
            try (GZIPOutputStream gz = new GZIPOutputStream(b)) {
                gz.write(datos);
            }
            datos = b.toByteArray();
            ex.getResponseHeaders().set("Content-Encoding", "gzip");
            ex.getResponseHeaders().add("Vary", "Accept-Encoding");
        }
        if ("HEAD".equals(metodo)) {
            ex.sendResponseHeaders(codigo, -1);
            return;
        }
        ex.sendResponseHeaders(codigo, datos.length == 0 ? -1 : datos.length);
        if (datos.length > 0) {
            try (OutputStream os = ex.getResponseBody()) {
                os.write(datos);
            }
        }
    }

    /** Envía bytes binarios (imágenes, vídeo, audio) admitiendo peticiones Range. */
    void enviarConRango(String tipo, byte[] datos, String cacheControl) throws IOException {
        var h = ex.getResponseHeaders();
        cabecerasSeguridad(ex);
        h.set("Content-Type", tipo);
        h.set("Accept-Ranges", "bytes");
        h.set("Cache-Control", cacheControl);
        String rango = cabecera("Range");
        int inicio = 0;
        int fin = datos.length - 1;
        int codigo = 200;
        if (rango != null && rango.startsWith("bytes=") && datos.length > 0) {
            try {
                String[] r = rango.substring(6).split(",")[0].trim().split("-", 2);
                if (r[0].isEmpty()) {           // bytes=-500 → los últimos 500
                    inicio = Math.max(0, datos.length - Integer.parseInt(r[1]));
                } else {
                    inicio = Integer.parseInt(r[0]);
                    if (r.length > 1 && !r[1].isEmpty()) {
                        fin = Math.min(fin, Integer.parseInt(r[1]));
                    }
                }
                if (inicio > fin || inicio >= datos.length) {
                    h.set("Content-Range", "bytes */" + datos.length);
                    ex.sendResponseHeaders(416, -1);
                    return;
                }
                codigo = 206;
                h.set("Content-Range", "bytes " + inicio + "-" + fin + "/" + datos.length);
            } catch (NumberFormatException e) {
                inicio = 0;
                fin = datos.length - 1;
            }
        }
        int largo = fin - inicio + 1;
        if ("HEAD".equals(metodo) || largo <= 0) {
            h.set("Content-Length", String.valueOf(Math.max(0, largo)));
            ex.sendResponseHeaders(codigo, -1);
            return;
        }
        ex.sendResponseHeaders(codigo, largo);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(datos, inicio, largo);
        } catch (IOException cortado) {
            // El navegador cancela peticiones de vídeo al adelantar: es normal.
        }
    }

    void redirigir(String destino) throws IOException {
        cabecerasSeguridad(ex);
        ex.getResponseHeaders().set("Location", destino);
        ex.sendResponseHeaders(302, -1);
    }

    static Map<String, Object> ok() {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("ok", true);
        return m;
    }

    static Map<String, Object> ok(String clave, Object valor) {
        Map<String, Object> m = ok();
        m.put(clave, valor);
        return m;
    }
}
