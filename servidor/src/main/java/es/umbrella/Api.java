/*
 * ============================================================================
 *  Api.java — Rutas de datos de la web (todas bajo /api/)
 * ============================================================================
 *    GET  /api/estado                    el servidor está en marcha
 *    GET  /api/wiki                      secciones del menú + textos de portada
 *    GET  /api/wiki/{seccion}            fichas de una sección
 *    GET  /api/wiki/{seccion}/{id}       una ficha
 *    GET  /api/miembro                   ¿hay sesión de miembro? + id de Google
 *    POST /api/miembro/google            {"credential"} → abre la sesión (cookie)
 *    POST /api/miembro/salir             cierra la sesión
 *
 *  Expedientes ocultos: las fichas con "oculto": true solo se envían
 *  completas a quien tiene sesión de miembro. Al resto les llega solo
 *  {id, oculto, orden}, y la web muestra «Únete para ver lo oculto».
 * ============================================================================
 */
package es.umbrella;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class Api implements HttpHandler {

    private final Contenido contenido;
    private final Miembros miembros;

    Api(Contenido contenido, Miembros miembros) {
        this.contenido = contenido;
        this.miembros = miembros;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        Peticion p = new Peticion(ex);
        try {
            String ruta = p.metodo + " " + (p.parte(1) == null ? "" : p.parte(1));
            switch (ruta) {
                case "GET estado" -> p.responderJson(200, Peticion.ok());
                case "GET wiki" -> wiki(p);
                case "GET miembro", "POST miembro" -> miembro(p);
                default -> throw new Peticion.ErrorHttp(404, "Ruta de API desconocida: " + p.ruta);
            }
        } catch (Peticion.ErrorHttp e) {
            error(p, e.codigo, e.getMessage());
        } catch (IllegalArgumentException e) {
            error(p, 400, e.getMessage());
        } catch (Exception e) {
            System.err.println("[API] Error en " + p.metodo + " " + p.ruta + ": " + e);
            error(p, 500, "Error interno del servidor");
        } finally {
            ex.close();
        }
    }

    private static void error(Peticion p, int codigo, String mensaje) {
        try {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("ok", false);
            m.put("error", mensaje);
            p.responderJson(codigo, m);
        } catch (IOException ignorado) {
            // El navegador ya se fue.
        }
    }

    // ------------------------------------------------------------------
    //  Wiki
    // ------------------------------------------------------------------

    private void wiki(Peticion p) throws IOException {
        String seccion = p.parte(2);
        String id = p.parte(3);
        boolean ver = miembros.actual(p) != null;

        // Sin sección: el índice de la wiki.
        if (seccion == null) {
            Map<String, Object> r = Peticion.ok("secciones", contenido.secciones());
            r.put("portada", contenido.portada());
            p.responderJson(200, r);
            return;
        }
        if (!contenido.existe(seccion)) {
            throw new Peticion.ErrorHttp(404, "Sección de la wiki desconocida");
        }

        // Sección completa: las fichas ocultas van «selladas» si no hay sesión.
        if (id == null) {
            List<Map<String, Object>> lista = new ArrayList<>();
            for (Map<String, Object> f : contenido.fichas(seccion)) {
                lista.add(ver || !Json.logico(f, "oculto", false) ? f : sellada(f));
            }
            p.responderJson(200, Peticion.ok("fichas", lista));
            return;
        }

        // Una ficha.
        Map<String, Object> f = contenido.ficha(seccion, id);
        if (f == null) {
            throw new Peticion.ErrorHttp(404, "Ficha no encontrada");
        }
        if (!ver && Json.logico(f, "oculto", false)) {
            throw new Peticion.ErrorHttp(403, "Únete para ver lo oculto");
        }
        p.responderJson(200, Peticion.ok("ficha", f));
    }

    /** Lo único que se envía de una ficha oculta sin sesión de miembro. */
    private static Map<String, Object> sellada(Map<String, Object> f) {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("id", f.get("id"));
        s.put("oculto", true);
        s.put("orden", f.getOrDefault("orden", 9999));
        return s;
    }

    // ------------------------------------------------------------------
    //  Miembros (acceso con Google)
    // ------------------------------------------------------------------

    private void miembro(Peticion p) throws Exception {
        String accion = p.metodo + " " + (p.parte(2) == null ? "" : p.parte(2));
        switch (accion) {
            case "GET " -> {
                Map<String, Object> r = Peticion.ok("miembro", miembros.actual(p));
                r.put("google", miembros.clientId());
                p.responderJson(200, r);
            }
            case "POST google" -> {
                Map<String, Object> d = p.json(8192);
                String token = miembros.entrar(Json.texto(d, "credential", null));
                p.ex.getResponseHeaders().add("Set-Cookie", Miembros.COOKIE + "=" + token
                        + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + Miembros.DURACION_SEG);
                p.responderJson(200, Peticion.ok());
            }
            case "POST salir" -> {
                miembros.salir(p);
                p.ex.getResponseHeaders().add("Set-Cookie", Miembros.COOKIE + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
                p.responderJson(200, Peticion.ok());
            }
            default -> throw new Peticion.ErrorHttp(404, "Ruta de API desconocida: " + p.ruta);
        }
    }
}
