package es.umbrella;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Almacenamiento persistente opcional en Supabase/PostgREST.
 * La clave de servicio se utiliza exclusivamente en el backend Java.
 * En la base de datos SOLO se guarda el hash SHA-256 de la cookie de sesión.
 */
final class AlmacenMiembros {
    private final String url;
    private final String key;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();

    AlmacenMiembros() {
        String u = System.getenv("SUPABASE_URL");
        String k = System.getenv("SUPABASE_SERVICE_ROLE_KEY");
        if ((u == null || u.isBlank()) != (k == null || k.isBlank())) {
            throw new IllegalStateException("Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY conjuntamente.");
        }
        url = u == null ? "" : u.replaceAll("/+$", "").trim();
        key = k == null ? "" : k.trim();
        if (!url.isEmpty() && (!url.startsWith("https://") || URI.create(url).getHost() == null)) {
            throw new IllegalStateException("SUPABASE_URL debe ser una URL HTTPS válida.");
        }
    }

    boolean activo() {
        return !url.isEmpty();
    }

    private static String query(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private Object llamar(String tabla, String metodo, String consulta, Object datos, String prefer) throws IOException {
        try {
            URI uri = URI.create(url + "/rest/v1/" + tabla + (consulta.isEmpty() ? "" : "?" + consulta));
            HttpRequest.Builder b = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(12))
                    .header("apikey", key)
                    .header("Authorization", "Bearer " + key)
                    .header("Accept", "application/json");
            if (prefer != null) b.header("Prefer", prefer);
            if (datos == null) {
                b.method(metodo, HttpRequest.BodyPublishers.noBody());
            } else {
                b.header("Content-Type", "application/json");
                b.method(metodo, HttpRequest.BodyPublishers.ofString(Json.escribir(datos)));
            }
            HttpResponse<String> r = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
            if (r.statusCode() < 200 || r.statusCode() >= 300) {
                throw new IOException("Error de almacenamiento (HTTP " + r.statusCode() + ")");
            }
            return r.body().isBlank() ? List.of() : Json.leer(r.body());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Solicitud a la base de datos interrumpida", e);
        }
    }

    private static String hash(String token) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    void guardarMiembro(String id, Map<String, Object> datos) throws IOException {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("google_sub", id);
        row.put("correo", datos.get("correo"));
        row.put("nombre", datos.get("nombre"));
        row.put("foto", datos.get("foto"));
        row.put("ultimo_acceso", datos.get("ultimoAcceso"));
        llamar("miembros", "POST", "on_conflict=google_sub", row, "resolution=merge-duplicates,return=minimal");
    }

    void guardarSesion(String token, String googleSub, Instant expira) throws IOException {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("token_hash", hash(token));
        row.put("google_sub", googleSub);
        row.put("expira", expira.toString());
        llamar("sesiones", "POST", "", row, "return=minimal");
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> obtenerMiembro(String token) throws IOException {
        if (token == null || token.length() != 43) return null;
        String filter = "token_hash=eq." + query(hash(token)) + "&select=google_sub,expira,miembros(nombre,foto)";
        Object rows = llamar("sesiones", "GET", filter, null, null);
        if (!(rows instanceof List<?> lista) || lista.isEmpty()) return null;
        Map<String, Object> sesion = (Map<String, Object>) lista.get(0);
        Instant caduca = Instant.parse(Json.texto(sesion, "expira", "1970-01-01T00:00:00Z"));
        if (!caduca.isAfter(Instant.now())) return null;
        Object perfil = sesion.get("miembros");
        if (!(perfil instanceof Map<?, ?> m)) return null;
        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("nombre", m.get("nombre"));
        resultado.put("foto", m.get("foto"));
        return resultado;
    }

    void revocar(String token) throws IOException {
        if (token == null || token.length() != 43) return;
        llamar("sesiones", "DELETE", "token_hash=eq." + query(hash(token)), null, "return=minimal");
    }
}
