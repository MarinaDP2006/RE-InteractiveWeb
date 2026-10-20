/*
 * ============================================================================
 *  Juego.java — Lógica del juego en el servidor.
 * ============================================================================
 *  · Puzzles: las soluciones están en la colección "puzzles" (editable desde
 *    la app). El navegador solo envía la respuesta y recibe correcto / no.
 *  · Partidas: código ABCD-1234 → estado de la partida (colección "partidas").
 *  · Ranking: colección "ranking", ordenado por tiempo + 2 min por muerte.
 * ============================================================================
 */
package es.umbrella;

import java.io.IOException;
import java.security.SecureRandom;
import java.text.Normalizer;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

final class Juego {

    static final Pattern FORMATO_ID = Pattern.compile("[A-Z0-9]{4}-[A-Z0-9]{4}");
    private static final char[] ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int MAX_PARTIDAS = 20_000;
    private static final int MAX_RANKING = 300;

    private final BaseDatos db;
    private final SecureRandom azar = new SecureRandom();

    Juego(BaseDatos db) {
        this.db = db;
    }

    // ------------------------------------------------------------------
    //  Configuración
    // ------------------------------------------------------------------

    /** Configuración pública del juego (archivos activos, vídeos, mensaje...). */
    Map<String, Object> config() {
        Map<String, Object> c = db.obtener("_config", "juego");
        if (c == null) {
            c = new LinkedHashMap<>();
        }
        c.remove("id");
        c.remove("_actualizado");
        return c;
    }

    // ------------------------------------------------------------------
    //  Puzzles
    // ------------------------------------------------------------------

    /** {correcto, mensaje} */
    Map<String, Object> verificar(String puzzle, String respuesta) {
        Map<String, Object> p = puzzle == null || !BaseDatos.NOMBRE.matcher(puzzle).matches() ? null : db.obtener("puzzles", puzzle);
        if (p == null) {
            throw new Peticion.ErrorHttp(404, "Puzzle desconocido");
        }
        String intento = normalizar(respuesta);
        boolean correcto = false;
        if (p.get("soluciones") instanceof List<?> sols) {
            for (Object s : sols) {
                if (s != null && normalizar(s.toString()).equals(intento) && !intento.isEmpty()) {
                    correcto = true;
                    break;
                }
            }
        }
        Map<String, Object> r = Peticion.ok();
        r.put("correcto", correcto);
        r.put("mensaje", Json.texto(p, correcto ? "exito" : "fallo", correcto ? "Correcto." : "Incorrecto."));
        return r;
    }

    /** Sin tildes, en mayúsculas y solo [A-Z0-9,]: " León, Unicornio " → "LEON,UNICORNIO". */
    static String normalizar(String texto) {
        if (texto == null) {
            return "";
        }
        String sinTildes = Normalizer.normalize(texto, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return sinTildes.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9,]", "");
    }

    // ------------------------------------------------------------------
    //  Partidas guardadas
    // ------------------------------------------------------------------

    String guardar(String id, String estado, String nombre) throws IOException {
        if (estado == null || estado.isBlank()) {
            throw new Peticion.ErrorHttp(400, "Falta el estado de la partida");
        }
        if (estado.length() > 60_000) {
            throw new Peticion.ErrorHttp(413, "La partida es demasiado grande");
        }
        if (id == null || !FORMATO_ID.matcher(id).matches()) {
            id = nuevoId();
        }
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("estado", estado);
        doc.put("nombre", limpiarNombre(nombre));
        Map<String, Object> anterior = db.obtener("partidas", id.toLowerCase(Locale.ROOT));
        doc.put("creada", anterior == null ? Instant.now().toString() : Json.texto(anterior, "creada", Instant.now().toString()));
        db.guardar("partidas", id.toLowerCase(Locale.ROOT), doc);
        db.recortar("partidas", MAX_PARTIDAS);
        return id;
    }

    String cargar(String id) {
        if (id == null || !FORMATO_ID.matcher(id).matches()) {
            throw new Peticion.ErrorHttp(400, "El código debe tener el formato ABCD-1234");
        }
        Map<String, Object> doc = db.obtener("partidas", id.toLowerCase(Locale.ROOT));
        return doc == null ? null : Json.texto(doc, "estado", null);
    }

    private synchronized String nuevoId() {
        while (true) {
            StringBuilder sb = new StringBuilder(9);
            for (int i = 0; i < 8; i++) {
                if (i == 4) {
                    sb.append('-');
                }
                sb.append(ALFABETO[azar.nextInt(ALFABETO.length)]);
            }
            String id = sb.toString();
            if (!db.existe("partidas", id.toLowerCase(Locale.ROOT))) {
                return id;
            }
        }
    }

    // ------------------------------------------------------------------
    //  Ranking
    // ------------------------------------------------------------------

    static String limpiarNombre(String nombre) {
        String limpio = nombre == null ? "" : nombre.replaceAll("[\\p{Cntrl}<>]", " ").strip();
        if (limpio.isEmpty()) {
            limpio = "Superviviente anónimo";
        }
        return limpio.length() > 20 ? limpio.substring(0, 20) : limpio;
    }

    void anadirRanking(String nombre, long segundos, long muertes, String personaje) throws IOException {
        Map<String, Object> config = config();
        if (!Json.logico(config, "rankingAbierto", true)) {
            throw new Peticion.ErrorHttp(403, "El ranking está cerrado temporalmente");
        }
        if (segundos < 60 || segundos > 30L * 24 * 3600 || muertes < 0 || muertes > 10_000) {
            throw new Peticion.ErrorHttp(400, "Datos de ranking no válidos");
        }
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("nombre", limpiarNombre(nombre));
        e.put("segundos", segundos);
        e.put("muertes", muertes);
        e.put("puntuacion", segundos + muertes * 120);
        e.put("personaje", personaje == null ? "" : personaje.replaceAll("[^a-z0-9_]", ""));
        e.put("fecha", LocalDate.now().toString());
        String id = "r" + System.currentTimeMillis() + "-" + azar.nextInt(1000);
        db.guardar("ranking", id, e);
        // Se descartan las peores puntuaciones si hay demasiadas.
        List<Map<String, Object>> todas = ordenado();
        for (int i = MAX_RANKING; i < todas.size(); i++) {
            db.borrar("ranking", (String) todas.get(i).get("id"));
        }
    }

    List<Map<String, Object>> ordenado() {
        List<Map<String, Object>> lista = new ArrayList<>(db.listar("ranking"));
        lista.sort(Comparator.comparingLong(m -> Json.numero(m, "puntuacion", Long.MAX_VALUE)));
        return lista;
    }

    List<Map<String, Object>> top(int n) {
        List<Map<String, Object>> lista = ordenado();
        List<Map<String, Object>> top = new ArrayList<>();
        for (int i = 0; i < Math.min(n, lista.size()); i++) {
            Map<String, Object> e = lista.get(i);
            e.remove("_actualizado");
            e.remove("id");
            top.add(e);
        }
        return top;
    }
}
