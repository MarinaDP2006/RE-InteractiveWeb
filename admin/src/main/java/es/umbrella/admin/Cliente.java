/*
 * ============================================================================
 *  Cliente.java — Conexión de la app con el servidor (local o Render).
 * ============================================================================
 *  Todas las peticiones llevan el token del administrador (Bearer). Los
 *  errores del servidor se convierten en ErrorApi con su mensaje en español.
 *  El plan gratuito de Render "duerme" el servidor: la primera petición puede
 *  tardar hasta un minuto en despertarlo, por eso los tiempos son generosos.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class Cliente {

    /** Error devuelto por el servidor (o de conexión), con un mensaje legible. */
    static final class ErrorApi extends Exception {
        private static final long serialVersionUID = 1L;
        final int codigo;

        ErrorApi(int codigo, String mensaje) {
            super(mensaje);
            this.codigo = codigo;
        }
    }

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(25))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();
    private final String base;
    private String token;
    private String usuario = "";
    /** Se llama cuando la sesión caduca (para volver a la pantalla de acceso). */
    Runnable alCaducar = () -> { };

    Cliente(String base) {
        String b = base.trim();
        if (!b.startsWith("http://") && !b.startsWith("https://")) {
            b = (b.startsWith("localhost") || b.startsWith("127.") ? "http://" : "https://") + b;
        }
        this.base = b.replaceAll("/+$", "");
    }

    String base() {
        return base;
    }

    String usuario() {
        return usuario;
    }

    static String codificar(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8).replace("+", "%20");
    }

    // ------------------------------------------------------------------
    //  Sesión
    // ------------------------------------------------------------------

    /** Comprueba que el servidor responde (lo despierta si estaba dormido). */
    Map<String, Object> estado() throws ErrorApi {
        return enviar("GET", "/api/estado", null, Duration.ofSeconds(90), false);
    }

    void iniciarSesion(String usuario, String clave) throws ErrorApi {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("usuario", usuario);
        cuerpo.put("clave", clave);
        Map<String, Object> r = enviar("POST", "/api/admin/login", cuerpo, Duration.ofSeconds(90), false);
        token = Json.texto(r, "token", null);
        this.usuario = Json.texto(r, "usuario", usuario);
        if (token == null) {
            throw new ErrorApi(500, "El servidor no ha devuelto un token de sesión");
        }
    }

    void cerrarSesion() {
        try {
            enviar("POST", "/api/admin/logout", Map.of(), Duration.ofSeconds(10), true);
        } catch (ErrorApi ignorado) {
            // Da igual: el token caducará solo.
        }
        token = null;
    }

    // ------------------------------------------------------------------
    //  Peticiones JSON
    // ------------------------------------------------------------------

    Map<String, Object> get(String ruta) throws ErrorApi {
        return enviar("GET", ruta, null, Duration.ofSeconds(60), true);
    }

    Map<String, Object> put(String ruta, Object cuerpo) throws ErrorApi {
        return enviar("PUT", ruta, cuerpo, Duration.ofSeconds(60), true);
    }

    Map<String, Object> post(String ruta, Object cuerpo) throws ErrorApi {
        return enviar("POST", ruta, cuerpo == null ? Map.of() : cuerpo, Duration.ofSeconds(120), true);
    }

    Map<String, Object> delete(String ruta) throws ErrorApi {
        return enviar("DELETE", ruta, null, Duration.ofSeconds(60), true);
    }

    @SuppressWarnings("unchecked")
    static List<Map<String, Object>> lista(Map<String, Object> r, String clave) {
        Object o = r.get(clave);
        return o instanceof List ? (List<Map<String, Object>>) o : List.of();
    }

    private Map<String, Object> enviar(String metodo, String ruta, Object cuerpo, Duration tiempo, boolean conToken) throws ErrorApi {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(base + ruta)).timeout(tiempo)
                .header("Accept", "application/json").header("User-Agent", "UmbrellaAdmin/" + App.VERSION);
        if (conToken && token != null) {
            b.header("Authorization", "Bearer " + token);
        }
        if (cuerpo == null) {
            b.method(metodo, HttpRequest.BodyPublishers.noBody());
        } else {
            b.header("Content-Type", "application/json; charset=utf-8");
            b.method(metodo, HttpRequest.BodyPublishers.ofString(Json.escribir(cuerpo), StandardCharsets.UTF_8));
        }
        HttpResponse<String> resp = ejecutar(b.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        return interpretar(resp.statusCode(), resp.body());
    }

    private Map<String, Object> interpretar(int codigo, String cuerpo) throws ErrorApi {
        Map<String, Object> r;
        try {
            r = Json.leerObjeto(cuerpo == null || cuerpo.isBlank() ? "{}" : cuerpo);
        } catch (IllegalArgumentException e) {
            throw new ErrorApi(codigo, codigo >= 500
                    ? "El servidor no responde correctamente (código " + codigo + "). Si está en Render, puede estar arrancando: espera un minuto."
                    : "Respuesta inesperada del servidor (código " + codigo + ")");
        }
        if (codigo == 401 && token != null) {
            token = null;
            alCaducar.run();
        }
        if (codigo >= 400 || Boolean.FALSE.equals(r.get("ok"))) {
            throw new ErrorApi(codigo, Json.texto(r, "error", "Error del servidor (" + codigo + ")"));
        }
        return r;
    }

    private <T> HttpResponse<T> ejecutar(HttpRequest req, HttpResponse.BodyHandler<T> manejador) throws ErrorApi {
        try {
            return http.send(req, manejador);
        } catch (java.net.http.HttpTimeoutException e) {
            throw new ErrorApi(0, "El servidor tarda demasiado en responder. Si está en Render, puede estar despertando: inténtalo otra vez.");
        } catch (java.net.ConnectException e) {
            throw new ErrorApi(0, "No se puede conectar con " + base + ". ¿Está arrancado el servidor? ¿La dirección es correcta?");
        } catch (IOException e) {
            throw new ErrorApi(0, "Error de conexión: " + (e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage()));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ErrorApi(0, "Operación cancelada");
        }
    }

    // ------------------------------------------------------------------
    //  Binarios (copias ZIP, imágenes, vídeos)
    // ------------------------------------------------------------------

    byte[] descargar(String ruta) throws ErrorApi {
        HttpRequest req = HttpRequest.newBuilder(URI.create(base + ruta)).timeout(Duration.ofMinutes(5))
                .header("Authorization", "Bearer " + token).GET().build();
        HttpResponse<byte[]> r = ejecutar(req, HttpResponse.BodyHandlers.ofByteArray());
        if (r.statusCode() >= 400) {
            interpretar(r.statusCode(), new String(r.body(), StandardCharsets.UTF_8));
        }
        return r.body();
    }

    Map<String, Object> subir(String metodo, String ruta, byte[] datos, String tipo) throws ErrorApi {
        HttpRequest req = HttpRequest.newBuilder(URI.create(base + ruta)).timeout(Duration.ofMinutes(10))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", tipo)
                .method(metodo, HttpRequest.BodyPublishers.ofByteArray(datos)).build();
        HttpResponse<String> r = ejecutar(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        return interpretar(r.statusCode(), r.body());
    }

    /** URL pública absoluta de una ruta del servidor (para abrirla en el navegador). */
    String url(String ruta) {
        return ruta.startsWith("http") ? ruta : base + (ruta.startsWith("/") ? ruta : "/" + ruta);
    }
}
