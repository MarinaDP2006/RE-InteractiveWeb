/*
 * ============================================================================
 *  Miembros.java — Inicio de sesión con Google para ver los expedientes ocultos
 * ============================================================================
 *  · El navegador muestra el botón oficial de Google («Únete para ver lo
 *    oculto») y recibe un token firmado por Google (un JWT, "credential").
 *  · El servidor comprueba ese token con Google (tokeninfo): que sea para
 *    nuestra web (aud = GOOGLE_CLIENT_ID), que no haya caducado y que el
 *    correo esté verificado.
 *  · Si es válido, crea una sesión de miembro (cookie HttpOnly, 30 días) y
 *    guarda el miembro en datos/miembros.json (nombre, correo, fechas).
 *  · Sin GOOGLE_CLIENT_ID el acceso queda desactivado y los expedientes
 *    ocultos no se pueden abrir.
 * ============================================================================
 */
package es.umbrella;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
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

    private final String clientId;
    private final AlmacenMiembros persistente = new AlmacenMiembros();
    private final Path archivo;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
    private final SecureRandom azar = new SecureRandom();
    /** id de Google → datos del miembro (se guarda en datos/miembros.json). */
    private final Map<String, Map<String, Object>> registro = new ConcurrentHashMap<>();
    /** token de sesión → [id de Google, caducidad en ms]. Se pierden al reiniciar. */
    private final Map<String, Object[]> sesiones = new ConcurrentHashMap<>();

    @SuppressWarnings("unchecked")
    Miembros(Path carpetaDatos) throws IOException {
        String id = System.getenv("GOOGLE_CLIENT_ID");
        this.clientId = id == null ? "" : id.trim();
        if (!persistente.activo()) Files.createDirectories(carpetaDatos);
        this.archivo = carpetaDatos.resolve("miembros.json");
        if (!persistente.activo() && Files.exists(archivo)) {
            for (Map.Entry<String, Object> e : Json.leerObjeto(Files.readString(archivo, StandardCharsets.UTF_8)).entrySet()) {
                if (e.getValue() instanceof Map<?, ?> v) {
                    registro.put(e.getKey(), (Map<String, Object>) v);
                }
            }
        }
    }

    /** Id de cliente público de Google (vacío = acceso desactivado). */
    String clientId() {
        return clientId;
    }

    /** Comprueba el token de Google y abre una sesión. Devuelve el token de la sesión. */
    String entrar(String credencial) throws Exception {
        if (clientId.isEmpty()) {
            throw new Peticion.ErrorHttp(503, "El acceso con Google no está configurado.");
        }
        if (credencial == null || credencial.length() > 4096) {
            throw new Peticion.ErrorHttp(400, "Falta el token de Google.");
        }
        // Google comprueba la firma del token y nos devuelve su contenido.
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

        // Alta o actualización del miembro.
        String id = Json.texto(info, "sub", correo);
        Map<String, Object> m = registro.computeIfAbsent(id, (k) -> {
            Map<String, Object> nuevo = new LinkedHashMap<>();
            nuevo.put("alta", Instant.now().toString());
            return nuevo;
        });
        m.put("correo", correo);
        m.put("nombre", Json.texto(info, "name", correo));
        m.put("foto", Json.texto(info, "picture", ""));
        m.put("ultimoAcceso", Instant.now().toString());
        String token = aleatorio();
        if (persistente.activo()) {
            persistente.guardarMiembro(id, m);
            persistente.guardarSesion(token, id, Instant.now().plusSeconds(DURACION_SEG));
        } else {
            guardar();
            sesiones.put(token, new Object[] {id, System.currentTimeMillis() + DURACION_SEG * 1000L});
        }
        return token;
    }

    /** Miembro con sesión abierta en esta petición (nombre y foto), o null. */
    Map<String, Object> actual(Peticion p) throws IOException {
        String c = p.cookie(COOKIE);
        if (persistente.activo()) return persistente.obtenerMiembro(c);
        Object[] s = c == null ? null : sesiones.get(c);
        if (s == null || (long) s[1] < System.currentTimeMillis()) {
            return null;
        }
        Map<String, Object> m = registro.get((String) s[0]);
        if (m == null) {
            return null;
        }
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("nombre", Json.texto(m, "nombre", ""));
        r.put("foto", Json.texto(m, "foto", ""));
        return r;
    }

    /** Cierra la sesión de esta petición. */
    void salir(Peticion p) throws IOException {
        String c = p.cookie(COOKIE);
        if (persistente.activo()) {
            persistente.revocar(c);
            return;
        }
        if (c != null) {
            sesiones.remove(c);
        }
    }

    /** Escribe el registro de miembros en disco. */
    private synchronized void guardar() throws IOException {
        Files.writeString(archivo, Json.bonito(new LinkedHashMap<>(registro)), StandardCharsets.UTF_8);
    }

    private String aleatorio() {
        byte[] b = new byte[32];
        azar.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
}
