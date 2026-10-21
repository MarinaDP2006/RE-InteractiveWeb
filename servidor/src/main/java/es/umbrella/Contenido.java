/*
 * ============================================================================
 *  Contenido.java — Carga en memoria el contenido de la wiki (carpeta contenido/)
 * ============================================================================
 *  · configuracion.json  → secciones del menú (orden, títulos, descripciones)
 *                          y textos de la portada.
 *  · <seccion>.json      → las fichas de esa sección: { "id": { ...campos } }.
 *
 *  Se lee una sola vez al arrancar: si cambias un JSON, reinicia el servidor.
 * ============================================================================
 */
package es.umbrella;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class Contenido {

    private final List<Map<String, Object>> secciones = new ArrayList<>();
    private final Map<String, Object> portada;
    /** id de sección → (id de ficha → ficha), en el orden del campo «orden». */
    private final Map<String, Map<String, Map<String, Object>>> fichas = new LinkedHashMap<>();

    @SuppressWarnings("unchecked")
    Contenido(Path carpeta) throws IOException {
        Map<String, Object> cfg = leer(carpeta.resolve("configuracion.json"));
        Map<String, Object> wiki = Json.objeto(cfg, "wiki");
        portada = wiki != null && wiki.get("portada") instanceof Map<?, ?> p ? (Map<String, Object>) p : Map.of();

        // Secciones visibles, en el orden en que aparecen en configuracion.json.
        if (wiki != null && wiki.get("secciones") instanceof List<?> lista) {
            for (Object o : lista) {
                if (o instanceof Map<?, ?> m && Json.logico((Map<String, Object>) m, "visible", true)) {
                    secciones.add((Map<String, Object>) m);
                }
            }
        }

        // Fichas de cada sección: se añade su id y se ordenan por «orden».
        for (Map<String, Object> s : secciones) {
            String id = Json.texto(s, "id", "");
            Path archivo = carpeta.resolve(id + ".json");
            List<Map<String, Object>> lista = new ArrayList<>();
            if (Files.exists(archivo)) {
                for (Map.Entry<String, Object> e : leer(archivo).entrySet()) {
                    if (e.getValue() instanceof Map<?, ?> f) {
                        Map<String, Object> ficha = new LinkedHashMap<>();
                        ficha.put("id", e.getKey());
                        ficha.putAll((Map<String, Object>) f);
                        if (Json.logico(ficha, "publicado", true)) {
                            lista.add(ficha);
                        }
                    }
                }
            }
            lista.sort(Comparator.comparingLong((Map<String, Object> f) -> Json.numero(f, "orden", 9999)));
            Map<String, Map<String, Object>> porId = new LinkedHashMap<>();
            lista.forEach((f) -> porId.put((String) f.get("id"), f));
            fichas.put(id, porId);
            System.out.println("[CONTENIDO] " + id + ": " + porId.size() + " fichas");
        }
    }

    private static Map<String, Object> leer(Path archivo) throws IOException {
        return Json.leerObjeto(Files.readString(archivo, StandardCharsets.UTF_8));
    }

    List<Map<String, Object>> secciones() {
        return secciones;
    }

    Map<String, Object> portada() {
        return portada;
    }

    boolean existe(String seccion) {
        return fichas.containsKey(seccion);
    }

    /** Todas las fichas de una sección (lista nueva: se puede modificar sin tocar el original). */
    List<Map<String, Object>> fichas(String seccion) {
        return new ArrayList<>(fichas.getOrDefault(seccion, Map.of()).values());
    }

    /** Una ficha, o null si no existe. */
    Map<String, Object> ficha(String seccion, String id) {
        return fichas.getOrDefault(seccion, Map.of()).get(id);
    }
}
