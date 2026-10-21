/*
 * ============================================================================
 *  Miembros.java — Inicio de sesión con Google para ver los expedientes ocultos.
 * ============================================================================
 *  · El navegador muestra el botón oficial de Google («Únete para ver lo
 *    oculto») y recibe un token firmado por Google (un JWT, "credential").
 *  · El servidor comprueba ese token con Google (tokeninfo): que sea para
 *    nuestra web (aud = GOOGLE_CLIENT_ID), que no haya caducado y que el
 *    correo esté verificado.
 *  · Si es válido, crea una sesión de miembro (cookie HttpOnly, 30 días) y
 *    guarda el miembro en la colección "miembros" (nombre, correo, fechas).
 *  · Sin GOOGLE_CLIENT_ID el inicio de sesión queda desactivado y los
 *    expedientes ocultos solo los ve el administrador.
 * ============================================================================
 */
package es.umbrella;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

final class Miembros {

    static final String COOKIE = "umbrella_miembro";
    static final int DURACION_SEG = 30 * 24 * 3600;

    private final BaseDatos db;
    private final String clientId;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
    private final SecureRandom azar = new SecureRandom();
    /** token de sesión → [correo, caducidad en ms] */
    private final Map<String, Object[]> sesiones = new ConcurrentHashMap<>();

    Miembros(BaseDatos db) {
        this.db = db;
        String id = System.getenv("GOOGLE_CLIENT_ID");
        this.clientId = id == null ? "" : id.trim();
    }

    /** Id de cliente público de Google (vacío = inicio de sesión desactivado). */
    String clientId() {
        return clientId;
    }

    /**
     * Comprueba el token de Google y abre una sesión.
     * Devuelve el token de sesión, o lanza ErrorHttp si no es válido.
     */
    String entrar(String credencial) throws Exception {
        if (clientId.isEmpty()) {
            throw new Peticion.ErrorHttp(503, "El acceso con Google no está configurado.");
        }
        if (credencial == null || credencial.length() > 4096) {
            throw new Peticion.ErrorHttp(400, "Falta el token de Google.");
        }
        HttpRequest pet = HttpRequest.newBuilder(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token="
                + URLEncoder.encode(credencial, StandardCharsets.UTF_8))).timeout(Duration.ofSeconds(10)).GET().build();
        HttpResponse<String> r = http.send(pet, HttpResponse.BodyHandlers.ofString());
        if (r.statusCode() != 200) {
            throw new Peticion.ErrorHttp(401, "Google no ha validado el acceso.");
        }
        Map<String, Object> info = Json.leerObjeto(r.body());
        String aud = Json.texto(info, "aud", "");
        String iss = Json.texto(info, "iss", "");
        long caduca = Long.parseLong(Json.texto(info, "exp", "0"));
        boolean verificado = "true".equals(String.valueOf(info.get("email_verified")));
        String correo = Json.texto(info, "email", "");
        if (!clientId.equals(aud) || !(iss.equals("accounts.google.com") || iss.equals("https://accounts.google.com"))
                || caduca * 1000 < System.currentTimeMillis() || !verificado || correo.isBlank()) {
            throw new Peticion.ErrorHttp(401, "Google no ha validado el acceso.");
        }

        // Ficha del miembro en la base de datos (se ve desde la app de administración).
        String id = Json.texto(info, "sub", correo);
        Map<String, Object> m = db.obtener("miembros", id);
        if (m == null) {
            m = new LinkedHashMap<>();
            m.put("alta", Instant.now().toString());
        }
        m.remove("id");
        m.remove("_actualizado");
        m.put("correo", correo);
        m.put("nombre", Json.texto(info, "name", correo));
        m.put("foto", Json.texto(info, "picture", ""));
        m.put("ultimoAcceso", Instant.now().toString());
        db.guardar("miembros", id, m);

        String token = aleatorio();
        sesiones.put(token, new Object[] {id, System.currentTimeMillis() + DURACION_SEG * 1000L});
        return token;
    }

    /** Miembro con sesión abierta en esta petición, o null. */
    Map<String, Object> actual(Peticion p) {
        String c = p.cookie(COOKIE);
        Object[] s = c == null ? null : sesiones.get(c);
        if (s == null || (long) s[1] < System.currentTimeMillis()) {
            return null;
        }
        Map<String, Object> m = db.obtener("miembros", (String) s[0]);
        if (m == null) {
            return null;
        }
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("nombre", Json.texto(m, "nombre", ""));
        r.put("foto", Json.texto(m, "foto", ""));
        return r;
    }

    /** Cierra la sesión de esta petición. */
    void salir(Peticion p) {
        String c = p.cookie(COOKIE);
        if (c != null) {
            sesiones.remove(c);
        }
    }

    private String aleatorio() {
        byte[] b = new byte[32];
        azar.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
}
