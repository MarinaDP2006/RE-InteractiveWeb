/*
 * ============================================================================
 *  Api.java — Todos los endpoints REST (bajo /api/).
 * ============================================================================
 *  PÚBLICOS
 *    GET  /api/estado                    servidor vivo + qué secciones están abiertas
 *    GET  /api/portal                    datos de la portada (secciones, contadores)
 *    POST /api/visita                    {"seccion":"wiki"} → estadísticas
 *    GET  /api/wiki                      secciones de la wiki con nº de fichas
 *    GET  /api/wiki/buscar?q=texto       búsqueda en todas las secciones
 *    GET  /api/wiki/{seccion}            fichas de una sección
 *    GET  /api/wiki/{seccion}/{id}       una ficha
 *    GET  /api/juego/config              archivos activos, vídeos, mensaje del día...
 *    POST /api/juego/verificar           {"puzzle","respuesta"} → {"correcto","mensaje"}
 *    POST /api/juego/guardar             {"id","estado","nombre"} → {"id":"ABCD-1234"}
 *    GET  /api/juego/cargar?id=ABCD-1234
 *    GET  /api/juego/ranking             top 10
 *    POST /api/juego/ranking             {"nombre","segundos","muertes","personaje"}
 *    GET  /api/vista?ticket=..&destino=/wiki/   vista previa del admin (cookie)
 *
 *  ADMINISTRACIÓN (cabecera Authorization: Bearer <token>)
 *    POST   /api/admin/login             {"usuario","clave"} → {"token"}
 *    POST   /api/admin/logout
 *    GET    /api/admin/resumen           panel principal
 *    GET|PUT /api/admin/acceso           abrir / cerrar la wiki y el juego al público
 *    GET    /api/admin/db                colecciones
 *    GET    /api/admin/db/{col}          documentos
 *    DELETE /api/admin/db/{col}          vaciar colección
 *    POST   /api/admin/db/{col}/semilla?sobrescribir=true|false
 *    GET|PUT|DELETE /api/admin/db/{col}/{id}
 *    GET    /api/admin/copias            ·  POST /api/admin/copias (crear)
 *    GET    /api/admin/copias/{nombre}   descargar  ·  DELETE  ·  POST .../restaurar
 *    GET    /api/admin/exportar?archivos=true   ZIP con todo (copia en tu PC)
 *    POST   /api/admin/restaurar         cuerpo = ZIP
 *    GET    /api/admin/subidas           ·  PUT|DELETE /api/admin/subidas/{nombre}
 *    PUT    /api/admin/clave             {"actual","usuario","nueva"}
 *    GET    /api/admin/registro?n=200
 *    POST   /api/admin/ticket            → {"ticket"} para "Ver como admin"
 * ============================================================================
 */
package es.umbrella;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

final class Api implements HttpHandler {

    static final String VERSION = "1.0.0";

    private static final int MAX_JSON = 2 * 1024 * 1024;
    private static final int MAX_JSON_PUBLICO = 96 * 1024;
    private static final int MAX_ZIP = 300 * 1024 * 1024;
    private static final long RETRASO_FALLO_MS = 300;

    /** Colecciones que la app no puede leer ni tocar por la API genérica. */
    private static final Set<String> PROTEGIDOS = Set.of("_config/admin");

    private final BaseDatos db;
    private final Seguridad seguridad;
    private final Actividad actividad;
    private final Juego juego;
    private final Subidas subidas;
    private final long arranque = System.currentTimeMillis();

    Api(BaseDatos db, Seguridad seguridad, Actividad actividad, Juego juego, Subidas subidas) {
        this.db = db;
        this.seguridad = seguridad;
        this.actividad = actividad;
        this.juego = juego;
        this.subidas = subidas;
    }

    @Override
    public void handle(HttpExchange ex) throws IOException {
        Peticion p = new Peticion(ex);
        try {
            if ("admin".equals(p.parte(1))) {
                admin(p);
            } else {
                publica(p);
            }
        } catch (Peticion.ErrorHttp e) {
            error(p, e.codigo, e.getMessage());
        } catch (IllegalArgumentException e) {
            error(p, 400, e.getMessage());
        } catch (Exception e) {
            System.err.println("[API] Error inesperado en " + p.metodo + " " + p.ruta + ": " + e);
            e.printStackTrace();
            error(p, 500, "Error interno del servidor: " + e.getMessage());
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
            // El cliente se fue.
        }
    }

    // =====================================================================
    //  Acceso público
    // =====================================================================

    Map<String, Object> acceso() {
        Map<String, Object> a = db.obtener("_config", "acceso");
        if (a == null) {
            a = new LinkedHashMap<>();
        }
        a.remove("id");
        a.remove("_actualizado");
        return a;
    }

    boolean wikiAbierta(Peticion p) {
        return Json.logico(Json.objeto(acceso(), "wiki"), "publica", true) || seguridad.esVistaAdmin(p);
    }

    boolean juegoAbierto(Peticion p) {
        return Json.logico(Json.objeto(acceso(), "juego"), "publico", true) || seguridad.esVistaAdmin(p);
    }

    private void exigir(boolean abierto, String seccion) {
        if (!abierto) {
            String mensaje = Json.texto(Json.objeto(acceso(), seccion), "mensaje", "");
            throw new Peticion.ErrorHttp(503, mensaje.isBlank() ? "Esta sección está cerrada temporalmente por mantenimiento." : mensaje);
        }
    }

    private Map<String, Object> estadoPublico(Peticion p) {
        Map<String, Object> a = acceso();
        Map<String, Object> r = Peticion.ok();
        r.put("servidor", "Umbrella Archives");
        r.put("version", VERSION);
        r.put("wiki", Map.of("publica", Json.logico(Json.objeto(a, "wiki"), "publica", true),
                "mensaje", Json.texto(Json.objeto(a, "wiki"), "mensaje", "")));
        r.put("juego", Map.of("publico", Json.logico(Json.objeto(a, "juego"), "publico", true),
                "mensaje", Json.texto(Json.objeto(a, "juego"), "mensaje", "")));
        r.put("anuncio", Json.texto(a, "anuncio", ""));
        r.put("vistaAdmin", seguridad.esVistaAdmin(p));
        return r;
    }

    // =====================================================================
    //  Rutas públicas
    // =====================================================================

    private void publica(Peticion p) throws Exception {
        String s1 = p.parte(1);
        String clave = p.metodo + " " + (s1 == null ? "" : s1);
        switch (clave) {
            case "GET estado", "HEAD estado" -> p.responderJson(200, estadoPublico(p));
            case "GET portal" -> p.responderJson(200, portal(p));
            case "POST visita" -> {
                Map<String, Object> d = p.json(4096);
                String sec = Json.texto(d, "seccion", "");
                if (Set.of("portal", "wiki", "juego").contains(sec)) {
                    actividad.visita(sec, p.ip());
                }
                p.responderJson(200, Peticion.ok());
            }
            case "GET wiki" -> wiki(p);
            case "GET juego", "POST juego" -> juegoPublico(p);
            case "GET vista" -> vista(p);
            default -> throw new Peticion.ErrorHttp(404, "Ruta de API desconocida: " + p.ruta);
        }
    }

    private Map<String, Object> portal(Peticion p) {
        Map<String, Object> r = estadoPublico(p);
        List<Map<String, Object>> secciones = new ArrayList<>();
        int fichas = 0;
        for (Map<String, Object> sec : seccionesWiki()) {
            int n = publicados(Json.texto(sec, "id", "")).size();
            fichas += n;
            Map<String, Object> s = new LinkedHashMap<>(sec);
            s.put("fichas", n);
            secciones.add(s);
        }
        r.put("secciones", secciones);
        r.put("fichas", fichas);
        r.put("supervivientes", db.contar("ranking"));
        r.put("puzzles", db.contar("puzzles"));
        return r;
    }

    /** Secciones visibles de la wiki, según _config/wiki → "secciones". */
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> seccionesWiki() {
        Map<String, Object> cfg = db.obtener("_config", "wiki");
        List<Map<String, Object>> lista = new ArrayList<>();
        if (cfg != null && cfg.get("secciones") instanceof List<?> l) {
            for (Object o : l) {
                if (o instanceof Map<?, ?> m && Json.logico((Map<String, Object>) m, "visible", true)) {
                    lista.add((Map<String, Object>) m);
                }
            }
        }
        return lista;
    }

    private boolean esSeccionWiki(String col) {
        for (Map<String, Object> s : seccionesWiki()) {
            if (col.equals(Json.texto(s, "id", null))) {
                return true;
            }
        }
        return false;
    }

    private List<Map<String, Object>> publicados(String col) {
        List<Map<String, Object>> lista = new ArrayList<>();
        for (Map<String, Object> d : db.listar(col)) {
            if (Json.logico(d, "publicado", true)) {
                d.remove("_actualizado");
                lista.add(d);
            }
        }
        lista.sort(Comparator.comparingLong((Map<String, Object> d) -> Json.numero(d, "orden", 9999)));
        return lista;
    }

    private void wiki(Peticion p) throws IOException {
        exigir(wikiAbierta(p), "wiki");
        String col = p.parte(2);
        String id = p.parte(3);
        if (col == null) {
            Map<String, Object> r = Peticion.ok();
            List<Map<String, Object>> secciones = new ArrayList<>();
            for (Map<String, Object> sec : seccionesWiki()) {
                Map<String, Object> s = new LinkedHashMap<>(sec);
                s.put("fichas", publicados(Json.texto(sec, "id", "")).size());
                secciones.add(s);
            }
            r.put("secciones", secciones);
            Map<String, Object> cfg = db.obtener("_config", "wiki");
            r.put("portada", cfg == null ? Map.of() : cfg.getOrDefault("portada", Map.of()));
            p.responderJson(200, r);
            return;
        }
        if ("buscar".equals(col)) {
            p.responderJson(200, Peticion.ok("resultados", buscar(p.parametro("q", ""))));
            return;
        }
        if (!esSeccionWiki(col)) {
            throw new Peticion.ErrorHttp(404, "Sección de la wiki desconocida");
        }
        if (id == null) {
            p.responderJson(200, Peticion.ok("fichas", publicados(col)));
            return;
        }
        Map<String, Object> doc = db.obtener(col, id);
        if (doc == null || !Json.logico(doc, "publicado", true)) {
            throw new Peticion.ErrorHttp(404, "Ficha no encontrada");
        }
        doc.remove("_actualizado");
        actividad.fichaVista(col, id);
        p.responderJson(200, Peticion.ok("ficha", doc));
    }

    private static String plano(String s) {
        return Normalizer.normalize(s == null ? "" : s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
    }

    /** Búsqueda simple por texto en título, alias, resumen y etiquetas, con puntuación. */
    private List<Map<String, Object>> buscar(String q) {
        String consulta = plano(q).trim();
        List<Map<String, Object>> resultados = new ArrayList<>();
        if (consulta.length() < 2) {
            return resultados;
        }
        String[] palabras = consulta.split("\\s+");
        for (Map<String, Object> sec : seccionesWiki()) {
            String col = Json.texto(sec, "id", "");
            for (Map<String, Object> d : publicados(col)) {
                String titulo = plano(Json.texto(d, "titulo", ""));
                String resto = plano(Json.texto(d, "alias", "") + " " + Json.texto(d, "resumen", "") + " "
                        + String.valueOf(d.getOrDefault("etiquetas", "")) + " " + Json.texto(d, "subtitulo", ""));
                String cuerpo = plano(String.valueOf(d.getOrDefault("cuerpo", "")));
                int puntos = 0;
                boolean todas = true;
                for (String w : palabras) {
                    int pw = 0;
                    if (titulo.contains(w)) {
                        pw += titulo.startsWith(w) ? 12 : 8;
                    }
                    if (resto.contains(w)) {
                        pw += 4;
                    }
                    if (cuerpo.contains(w)) {
                        pw += 1;
                    }
                    if (pw == 0) {
                        todas = false;
                    }
                    puntos += pw;
                }
                if (todas && puntos > 0) {
                    Map<String, Object> r = new LinkedHashMap<>();
                    r.put("seccion", col);
                    r.put("seccionTitulo", Json.texto(sec, "titulo", col));
                    r.put("id", d.get("id"));
                    r.put("titulo", d.get("titulo"));
                    r.put("subtitulo", d.getOrDefault("subtitulo", ""));
                    r.put("imagen", d.getOrDefault("imagen", ""));
                    r.put("puntos", puntos);
                    resultados.add(r);
                }
            }
        }
        resultados.sort(Comparator.comparingLong((Map<String, Object> r) -> -Json.numero(r, "puntos", 0)));
        return resultados.size() > 40 ? new ArrayList<>(resultados.subList(0, 40)) : resultados;
    }

    private void juegoPublico(Peticion p) throws Exception {
        String accion = p.metodo + " " + p.parte(2);
        if ("GET config".equals(accion)) {
            // La configuración se sirve siempre (el juego necesita saber si está cerrado).
            Map<String, Object> r = Peticion.ok("config", juego.config());
            r.put("abierto", juegoAbierto(p));
            r.put("mensaje", Json.texto(Json.objeto(acceso(), "juego"), "mensaje", ""));
            p.responderJson(200, r);
            return;
        }
        exigir(juegoAbierto(p), "juego");
        switch (accion) {
            case "POST verificar" -> {
                Map<String, Object> d = p.json(MAX_JSON_PUBLICO);
                Map<String, Object> r = juego.verificar(Json.texto(d, "puzzle", null), Json.texto(d, "respuesta", ""));
                if (Boolean.TRUE.equals(r.get("correcto"))) {
                    actividad.contar("puzzlesResueltos");
                } else {
                    actividad.contar("puzzlesFallados");
                    Thread.sleep(RETRASO_FALLO_MS);
                }
                p.responderJson(200, r);
            }
            case "POST guardar" -> {
                Map<String, Object> d = p.json(MAX_JSON_PUBLICO);
                String id = juego.guardar(Json.texto(d, "id", null), Json.texto(d, "estado", null), Json.texto(d, "nombre", ""));
                actividad.contar("partidasGuardadas");
                p.responderJson(200, Peticion.ok("id", id));
            }
            case "GET cargar" -> {
                String id = p.parametro("id", "").trim().toUpperCase(Locale.ROOT);
                String estado = juego.cargar(id);
                if (estado == null) {
                    throw new Peticion.ErrorHttp(404, "No existe ninguna partida con ese código");
                }
                Map<String, Object> r = Peticion.ok("id", id);
                r.put("estado", estado);
                p.responderJson(200, r);
            }
            case "GET ranking" -> p.responderJson(200, Peticion.ok("ranking", juego.top(10)));
            case "POST ranking" -> {
                Map<String, Object> d = p.json(4096);
                juego.anadirRanking(Json.texto(d, "nombre", ""), Json.numero(d, "segundos", 0),
                        Json.numero(d, "muertes", 0), Json.texto(d, "personaje", ""));
                actividad.contar("campanasCompletadas");
                p.responderJson(200, Peticion.ok("ranking", juego.top(10)));
            }
            default -> throw new Peticion.ErrorHttp(404, "Ruta de API desconocida: " + p.ruta);
        }
    }

    /** Canjea el ticket de la app por la cookie de vista previa y redirige. */
    private void vista(Peticion p) throws IOException {
        String token = seguridad.canjearTicket(p.parametro("ticket", null));
        String destino = p.parametro("destino", "/");
        if (!destino.startsWith("/") || destino.startsWith("//") || destino.contains("\\")) {
            destino = "/";
        }
        if (token == null) {
            p.redirigir(destino);
            return;
        }
        boolean https = "https".equalsIgnoreCase(p.cabecera("X-Forwarded-Proto"));
        p.ex.getResponseHeaders().add("Set-Cookie", Seguridad.COOKIE_VISTA + "=" + token
                + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=14400" + (https ? "; Secure" : ""));
        actividad.registrar(p.ip(), "vista-previa", destino);
        p.redirigir(destino);
    }

    // =====================================================================
    //  Rutas de administración
    // =====================================================================

    private void admin(Peticion p) throws Exception {
        String s2 = p.parte(2);
        if ("POST".equals(p.metodo) && "login".equals(s2)) {
            Map<String, Object> d = p.json(4096);
            try {
                String token = seguridad.iniciarSesion(Json.texto(d, "usuario", ""), Json.texto(d, "clave", ""), p.ip());
                actividad.registrar(p.ip(), "login", "Inicio de sesión correcto");
                Map<String, Object> r = Peticion.ok("token", token);
                r.put("usuario", seguridad.usuario());
                r.put("version", VERSION);
                p.responderJson(200, r);
            } catch (Peticion.ErrorHttp e) {
                actividad.registrar(p.ip(), "login-fallido", e.getMessage());
                throw e;
            }
            return;
        }
        String token = seguridad.tokenValido(p);
        if (token == null) {
            throw new Peticion.ErrorHttp(401, "Sesión no válida o caducada. Vuelve a iniciar sesión.");
        }
        String ip = p.ip();
        String m = p.metodo;
        String s3 = p.parte(3);
        String s4 = p.parte(4);
        String s5 = p.parte(5);

        switch (s2 == null ? "" : s2) {
            case "logout" -> {
                seguridad.cerrarSesion(token);
                p.responderJson(200, Peticion.ok());
            }
            case "sesion" -> {
                Map<String, Object> r = Peticion.ok("usuario", seguridad.usuario());
                r.put("version", VERSION);
                p.responderJson(200, r);
            }
            case "resumen" -> p.responderJson(200, resumen());
            case "acceso" -> {
                if ("PUT".equals(m)) {
                    Map<String, Object> d = p.json(MAX_JSON);
                    db.guardar("_config", "acceso", d);
                    actividad.registrar(ip, "acceso", "Wiki pública: " + Json.logico(Json.objeto(d, "wiki"), "publica", true)
                            + " · Juego público: " + Json.logico(Json.objeto(d, "juego"), "publico", true));
                }
                p.responderJson(200, Peticion.ok("acceso", acceso()));
            }
            case "db" -> baseDatos(p, ip, s3, s4, s5);
            case "copias" -> copias(p, ip, s3, s4);
            case "exportar" -> {
                boolean conArchivos = "true".equals(p.parametro("archivos", "false"));
                byte[] zip = db.zip(conArchivos);
                p.ex.getResponseHeaders().set("Content-Disposition",
                        "attachment; filename=\"umbrella-" + LocalDate.now() + (conArchivos ? "-completa" : "") + ".zip\"");
                actividad.registrar(ip, "exportar", (zip.length / 1024) + " KB" + (conArchivos ? " (con archivos)" : ""));
                p.enviar(200, "application/zip", zip);
            }
            case "restaurar" -> {
                exigirMetodo(m, "POST");
                int n = db.restaurarDesde(new ByteArrayInputStream(p.cuerpo(MAX_ZIP)));
                actividad.registrar(ip, "restaurar", n + " elementos restaurados desde archivo subido");
                p.responderJson(200, Peticion.ok("restaurados", n));
            }
            case "subidas" -> archivos(p, ip, s3);
            case "clave" -> {
                exigirMetodo(m, "PUT");
                Map<String, Object> d = p.json(4096);
                seguridad.cambiar(Json.texto(d, "actual", ""), Json.texto(d, "usuario", ""), Json.texto(d, "nueva", ""), token);
                actividad.registrar(ip, "clave", "Credenciales del administrador cambiadas");
                p.responderJson(200, Peticion.ok("usuario", seguridad.usuario()));
            }
            case "registro" -> {
                int n = (int) Math.min(1000, Math.max(1, Long.parseLong(p.parametro("n", "200"))));
                List<Map<String, Object>> reg = db.listar("registro");
                List<Map<String, Object>> ultimos = new ArrayList<>();
                for (int i = reg.size() - 1; i >= 0 && ultimos.size() < n; i--) {
                    Map<String, Object> e = reg.get(i);
                    e.remove("_actualizado");
                    ultimos.add(e);
                }
                p.responderJson(200, Peticion.ok("registro", ultimos));
            }
            case "ticket" -> {
                exigirMetodo(m, "POST");
                p.responderJson(200, Peticion.ok("ticket", seguridad.crearTicket()));
            }
            default -> throw new Peticion.ErrorHttp(404, "Ruta de administración desconocida: " + p.ruta);
        }
    }

    private static void exigirMetodo(String metodo, String esperado) {
        if (!esperado.equals(metodo)) {
            throw new Peticion.ErrorHttp(405, "Método no permitido; usa " + esperado);
        }
    }

    private Map<String, Object> resumen() throws IOException {
        Map<String, Object> r = Peticion.ok();
        Runtime rt = Runtime.getRuntime();
        r.put("version", VERSION);
        r.put("usuario", seguridad.usuario());
        r.put("arrancado", ManagementFactory.getRuntimeMXBean().getStartTime());
        r.put("segundosActivo", (System.currentTimeMillis() - arranque) / 1000);
        r.put("memoriaUsadaMB", (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024));
        r.put("memoriaMaxMB", rt.maxMemory() / (1024 * 1024));
        r.put("java", System.getProperty("java.version"));
        r.put("almacenamiento", db.descripcionAlmacen());
        r.put("persistente", db.descripcionAlmacen().startsWith("PostgreSQL") || System.getenv("RENDER") == null);
        r.put("enRender", System.getenv("RENDER") != null);
        r.put("bytesDatos", db.bytesDatos());
        r.put("sesiones", seguridad.sesionesActivas());
        r.put("acceso", acceso());

        Map<String, Object> cols = new LinkedHashMap<>();
        for (String c : db.colecciones()) {
            cols.put(c, db.contar(c));
        }
        r.put("colecciones", cols);
        r.put("secciones", seccionesWiki());

        // Visitas de los últimos 30 días.
        List<Map<String, Object>> dias = new ArrayList<>();
        LocalDate hoy = LocalDate.now();
        actividad.volcar();
        for (int i = 29; i >= 0; i--) {
            String d = hoy.minusDays(i).toString();
            Map<String, Object> e = db.obtener("estadisticas", d);
            Map<String, Object> dia = new LinkedHashMap<>();
            dia.put("dia", d);
            for (String campo : List.of("portal", "wiki", "juego", "unicos", "partidasGuardadas", "puzzlesResueltos", "puzzlesFallados", "campanasCompletadas")) {
                dia.put(campo, Json.numero(e, campo, 0));
            }
            dias.add(dia);
        }
        r.put("dias", dias);

        Map<String, Object> pop = db.obtener("estadisticas", "_populares");
        List<Map<String, Object>> populares = new ArrayList<>();
        if (pop != null) {
            pop.remove("id");
            pop.remove("_actualizado");
            for (Map.Entry<String, Object> e : pop.entrySet()) {
                populares.add(new LinkedHashMap<>(Map.of("ficha", e.getKey(), "vistas", e.getValue())));
            }
            populares.sort(Comparator.comparingLong((Map<String, Object> x) -> -Json.numero(x, "vistas", 0)));
        }
        r.put("populares", populares.size() > 15 ? populares.subList(0, 15) : populares);
        r.put("ranking", juego.top(5));
        r.put("copias", db.listarCopias().size());
        return r;
    }

    private void baseDatos(Peticion p, String ip, String col, String id, String extra) throws IOException {
        String m = p.metodo;
        if (col == null) {
            List<Map<String, Object>> lista = new ArrayList<>();
            List<String> semillas = db.coleccionesSemilla();
            List<String> todas = new ArrayList<>(db.colecciones());
            for (String s : semillas) {
                if (!todas.contains(s)) {
                    todas.add(s);
                }
            }
            todas.sort(null);
            for (String c : todas) {
                Map<String, Object> e = new LinkedHashMap<>();
                e.put("nombre", c);
                e.put("documentos", db.contar(c));
                e.put("semilla", semillas.contains(c));
                e.put("wiki", esSeccionWiki(c));
                lista.add(e);
            }
            p.responderJson(200, Peticion.ok("colecciones", lista));
            return;
        }
        if (!BaseDatos.NOMBRE.matcher(col).matches()) {
            throw new Peticion.ErrorHttp(400, "Nombre de colección no válido");
        }
        if (id == null) {
            if ("DELETE".equals(m)) {
                if (col.equals("_config")) {
                    throw new Peticion.ErrorHttp(403, "La colección _config no se puede vaciar");
                }
                db.copiaSeguridad("antes-de-vaciar-" + col);
                db.vaciar(col);
                actividad.registrar(ip, "vaciar", col);
                p.responderJson(200, Peticion.ok());
                return;
            }
            List<Map<String, Object>> docs = db.listar(col);
            if ("_config".equals(col)) {
                docs.removeIf(d -> "admin".equals(d.get("id")));
            }
            p.responderJson(200, Peticion.ok("documentos", docs));
            return;
        }
        if ("semilla".equals(id) && "POST".equals(m) && extra == null) {
            boolean sobrescribir = "true".equals(p.parametro("sobrescribir", "false"));
            if (sobrescribir) {
                db.copiaSeguridad("antes-de-semilla-" + col);
            }
            int n = db.reimportarSemilla(col, sobrescribir);
            actividad.registrar(ip, "semilla", col + ": " + n + " documentos" + (sobrescribir ? " (sobrescribiendo)" : ""));
            p.responderJson(200, Peticion.ok("documentos", n));
            return;
        }
        if (PROTEGIDOS.contains(col + "/" + id)) {
            throw new Peticion.ErrorHttp(403, "Este documento solo se cambia desde Ajustes → Contraseña");
        }
        switch (m) {
            case "GET" -> {
                Map<String, Object> d = db.obtener(col, id);
                if (d == null) {
                    throw new Peticion.ErrorHttp(404, "No existe " + col + "/" + id);
                }
                p.responderJson(200, Peticion.ok("documento", d));
            }
            case "PUT", "POST" -> {
                Map<String, Object> d = p.json(MAX_JSON);
                boolean nuevo = !db.existe(col, id);
                Map<String, Object> guardado = db.guardar(col, id, d);
                actividad.registrar(ip, nuevo ? "crear" : "editar", col + "/" + id);
                p.responderJson(200, Peticion.ok("documento", guardado));
            }
            case "DELETE" -> {
                if (!db.borrar(col, id)) {
                    throw new Peticion.ErrorHttp(404, "No existe " + col + "/" + id);
                }
                actividad.registrar(ip, "borrar", col + "/" + id);
                p.responderJson(200, Peticion.ok());
            }
            default -> throw new Peticion.ErrorHttp(405, "Método no permitido");
        }
    }

    private void copias(Peticion p, String ip, String nombre, String accion) throws IOException {
        String m = p.metodo;
        if (nombre == null) {
            if ("POST".equals(m)) {
                String n = db.copiaSeguridad("manual");
                actividad.registrar(ip, "copia", n);
                p.responderJson(200, Peticion.ok("nombre", n));
                return;
            }
            p.responderJson(200, Peticion.ok("copias", db.listarCopias()));
            return;
        }
        if ("restaurar".equals(accion) && "POST".equals(m)) {
            int n = db.restaurar(nombre);
            actividad.registrar(ip, "restaurar", nombre + " (" + n + " colecciones)");
            p.responderJson(200, Peticion.ok("restaurados", n));
            return;
        }
        switch (m) {
            case "GET" -> {
                java.nio.file.Path ruta = db.rutaCopia(nombre);
                if (!java.nio.file.Files.exists(ruta)) {
                    throw new Peticion.ErrorHttp(404, "No existe la copia");
                }
                p.ex.getResponseHeaders().set("Content-Disposition", "attachment; filename=\"" + nombre + "\"");
                p.enviar(200, "application/zip", java.nio.file.Files.readAllBytes(ruta));
            }
            case "DELETE" -> {
                db.borrarCopia(nombre);
                actividad.registrar(ip, "borrar-copia", nombre);
                p.responderJson(200, Peticion.ok());
            }
            default -> throw new Peticion.ErrorHttp(405, "Método no permitido");
        }
    }

    private void archivos(Peticion p, String ip, String nombre) throws IOException {
        String m = p.metodo;
        if (nombre == null) {
            List<Map<String, Object>> lista = new ArrayList<>();
            for (Map.Entry<String, Long> e : subidas.listar().entrySet()) {
                Map<String, Object> a = new LinkedHashMap<>();
                a.put("nombre", e.getKey());
                a.put("bytes", e.getValue());
                a.put("url", "/subidas/" + e.getKey());
                a.put("tipo", Subidas.TIPOS.getOrDefault(Subidas.extension(e.getKey()), ""));
                lista.add(a);
            }
            p.responderJson(200, Peticion.ok("archivos", lista));
            return;
        }
        String limpio = Subidas.normalizar(nombre);
        switch (m) {
            case "PUT", "POST" -> {
                byte[] datos = p.cuerpo(Subidas.MAX_BYTES);
                subidas.guardar(limpio, datos);
                actividad.registrar(ip, "subir", limpio + " (" + (datos.length / 1024) + " KB)");
                Map<String, Object> r = Peticion.ok("nombre", limpio);
                r.put("url", "/subidas/" + limpio);
                p.responderJson(200, r);
            }
            case "DELETE" -> {
                if (!subidas.borrar(limpio)) {
                    throw new Peticion.ErrorHttp(404, "No existe el archivo");
                }
                actividad.registrar(ip, "borrar-archivo", limpio);
                p.responderJson(200, Peticion.ok());
            }
            default -> throw new Peticion.ErrorHttp(405, "Método no permitido");
        }
    }
}
