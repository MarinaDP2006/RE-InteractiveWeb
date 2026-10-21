/*
 * ============================================================================
 *  Actividad.java — Estadísticas de visitas y registro de acciones del admin.
 * ============================================================================
 *  · Estadísticas: contadores por día (visitas al portal y a la wiki,
 *    visitantes únicos...) y las fichas de la
 *    wiki más vistas. Se acumulan en memoria y se guardan cada minuto en la
 *    colección "estadisticas" (así no se escribe en disco con cada visita).
 *  · Registro: cada acción del administrador (inicio de sesión, cambios en la
 *    base de datos, copias...) queda anotada en la colección "registro".
 *    Se conservan las 1.000 últimas.
 * ============================================================================
 */
package es.umbrella;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

final class Actividad {

    private static final DateTimeFormatter ID_REGISTRO = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss-SSS");
    private static final int MAX_REGISTRO = 1000;
    private static final int MAX_DIAS = 400;

    private final BaseDatos db;
    private final AtomicInteger secuencia = new AtomicInteger();

    // Contadores pendientes de guardar (día → campo → cantidad).
    private final Map<String, Map<String, Long>> pendientes = new HashMap<>();
    private final Map<String, Long> popularesPendientes = new HashMap<>();
    private final Set<String> unicosHoy = new HashSet<>();
    private String diaUnicos = "";

    Actividad(BaseDatos db) {
        this.db = db;
    }

    // ------------------------------------------------------------------
    //  Estadísticas
    // ------------------------------------------------------------------

    /** Suma 1 al contador "campo" de hoy. */
    synchronized void contar(String campo) {
        contar(campo, 1);
    }

    synchronized void contar(String campo, long cantidad) {
        String hoy = LocalDate.now().toString();
        pendientes.computeIfAbsent(hoy, k -> new HashMap<>()).merge(campo, cantidad, Long::sum);
    }

    /** Registra una visita a una sección, contando visitantes únicos por día (IP anonimizada con hash). */
    synchronized void visita(String seccion, String ip) {
        contar(seccion);
        String hoy = LocalDate.now().toString();
        if (!hoy.equals(diaUnicos)) {
            unicosHoy.clear();
            diaUnicos = hoy;
        }
        if (unicosHoy.size() < 200_000 && unicosHoy.add(huella(ip + hoy))) {
            contar("unicos");
        }
    }

    synchronized void fichaVista(String coleccion, String id) {
        popularesPendientes.merge(coleccion + "/" + id, 1L, Long::sum);
    }

    private static String huella(String s) {
        try {
            byte[] h = MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(h, 0, 12);
        } catch (NoSuchAlgorithmException e) {
            return s;
        }
    }

    /** Vuelca los contadores a la base de datos (lo llama un temporizador cada minuto). */
    void volcar() {
        Map<String, Map<String, Long>> copia;
        Map<String, Long> populares;
        synchronized (this) {
            if (pendientes.isEmpty() && popularesPendientes.isEmpty()) {
                return;
            }
            copia = new HashMap<>(pendientes);
            populares = new HashMap<>(popularesPendientes);
            pendientes.clear();
            popularesPendientes.clear();
        }
        try {
            for (Map.Entry<String, Map<String, Long>> dia : copia.entrySet()) {
                Map<String, Object> doc = db.obtener("estadisticas", dia.getKey());
                if (doc == null) {
                    doc = new LinkedHashMap<>();
                }
                doc.remove("id");
                for (Map.Entry<String, Long> c : dia.getValue().entrySet()) {
                    doc.put(c.getKey(), Json.numero(doc, c.getKey(), 0) + c.getValue());
                }
                db.guardar("estadisticas", dia.getKey(), doc);
            }
            if (!populares.isEmpty()) {
                Map<String, Object> doc = db.obtener("estadisticas", "_populares");
                if (doc == null) {
                    doc = new LinkedHashMap<>();
                }
                doc.remove("id");
                doc.remove("_actualizado");
                for (Map.Entry<String, Long> c : populares.entrySet()) {
                    doc.put(c.getKey(), Json.numero(doc, c.getKey(), 0) + c.getValue());
                }
                db.guardar("estadisticas", "_populares", doc);
            }
            db.recortar("estadisticas", MAX_DIAS);
        } catch (IOException e) {
            System.err.println("[ESTADÍSTICAS] No se pudieron guardar: " + e.getMessage());
        }
    }

    // ------------------------------------------------------------------
    //  Registro de acciones
    // ------------------------------------------------------------------

    void registrar(String ip, String accion, String detalle) {
        Map<String, Object> e = new LinkedHashMap<>();
        e.put("fecha", LocalDateTime.now().toString());
        e.put("ip", ip);
        e.put("accion", accion);
        e.put("detalle", detalle == null ? "" : detalle);
        String id = LocalDateTime.now().format(ID_REGISTRO) + "-" + (secuencia.incrementAndGet() % 1000);
        try {
            db.guardar("registro", id, e);
            db.recortar("registro", MAX_REGISTRO);
        } catch (IOException ex) {
            System.err.println("[REGISTRO] " + accion + " · " + detalle + " (no guardado: " + ex.getMessage() + ")");
        }
        System.out.println("[ADMIN] " + ip + " · " + accion + (detalle == null || detalle.isEmpty() ? "" : " · " + detalle));
    }
}
