/*
 * ============================================================================
 *  Json.java — Lector y escritor JSON completo (sin librerías externas).
 * ============================================================================
 *  Tipos Java que produce y acepta:
 *    objeto  → LinkedHashMap<String,Object>  (mantiene el orden de las claves)
 *    array   → ArrayList<Object>
 *    texto   → String
 *    número  → Long (si es entero) o Double
 *    boolean → Boolean
 *    null    → null
 *
 */
package es.umbrella;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class Json {

    private Json() {
    }

    /** Profundidad máxima de anidación: evita desbordar la pila con JSON malicioso. */
    private static final int MAX_PROFUNDIDAD = 64;

    // =====================================================================
    //  LECTURA
    // =====================================================================

    /** Convierte un texto JSON en objetos Java. Lanza IllegalArgumentException si no es válido. */
    public static Object leer(String texto) {
        if (texto == null) {
            throw new IllegalArgumentException("JSON vacío");
        }
        Lector l = new Lector(texto);
        l.espacios();
        Object valor = l.valor(0);
        l.espacios();
        if (l.pos != texto.length()) {
            throw l.error("Contenido sobrante tras el JSON");
        }
        return valor;
    }

    /** Lee un JSON que debe ser un objeto. */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> leerObjeto(String texto) {
        Object o = leer(texto);
        if (!(o instanceof Map)) {
            throw new IllegalArgumentException("Se esperaba un objeto JSON");
        }
        return (Map<String, Object>) o;
    }

    private static final class Lector {
        private final String s;
        private int pos;

        Lector(String s) {
            this.s = s;
        }

        IllegalArgumentException error(String msg) {
            return new IllegalArgumentException("JSON no válido (posición " + pos + "): " + msg);
        }

        void espacios() {
            while (pos < s.length()) {
                char c = s.charAt(pos);
                if (c == ' ' || c == '\t' || c == '\n' || c == '\r' || c == '﻿') {
                    pos++;
                } else {
                    break;
                }
            }
        }

        Object valor(int prof) {
            if (prof > MAX_PROFUNDIDAD) {
                throw error("Anidación excesiva");
            }
            if (pos >= s.length()) {
                throw error("Fin inesperado");
            }
            char c = s.charAt(pos);
            return switch (c) {
                case '{' -> objeto(prof);
                case '[' -> array(prof);
                case '"' -> texto();
                case 't' -> literal("true", Boolean.TRUE);
                case 'f' -> literal("false", Boolean.FALSE);
                case 'n' -> literal("null", null);
                default -> {
                    if (c == '-' || (c >= '0' && c <= '9')) {
                        yield numero();
                    }
                    throw error("Carácter inesperado '" + c + "'");
                }
            };
        }

        Object literal(String palabra, Object valor) {
            if (!s.startsWith(palabra, pos)) {
                throw error("Se esperaba " + palabra);
            }
            pos += palabra.length();
            return valor;
        }

        Map<String, Object> objeto(int prof) {
            Map<String, Object> m = new LinkedHashMap<>();
            pos++; // {
            espacios();
            if (pos < s.length() && s.charAt(pos) == '}') {
                pos++;
                return m;
            }
            while (true) {
                espacios();
                if (pos >= s.length() || s.charAt(pos) != '"') {
                    throw error("Se esperaba una clave entre comillas");
                }
                String clave = texto();
                espacios();
                if (pos >= s.length() || s.charAt(pos) != ':') {
                    throw error("Se esperaba ':'");
                }
                pos++;
                espacios();
                m.put(clave, valor(prof + 1));
                espacios();
                if (pos >= s.length()) {
                    throw error("Objeto sin cerrar");
                }
                char c = s.charAt(pos++);
                if (c == '}') {
                    return m;
                }
                if (c != ',') {
                    throw error("Se esperaba ',' o '}'");
                }
            }
        }

        List<Object> array(int prof) {
            List<Object> lista = new ArrayList<>();
            pos++; // [
            espacios();
            if (pos < s.length() && s.charAt(pos) == ']') {
                pos++;
                return lista;
            }
            while (true) {
                espacios();
                lista.add(valor(prof + 1));
                espacios();
                if (pos >= s.length()) {
                    throw error("Array sin cerrar");
                }
                char c = s.charAt(pos++);
                if (c == ']') {
                    return lista;
                }
                if (c != ',') {
                    throw error("Se esperaba ',' o ']'");
                }
            }
        }

        String texto() {
            pos++; // "
            StringBuilder sb = new StringBuilder();
            while (true) {
                if (pos >= s.length()) {
                    throw error("Texto sin cerrar");
                }
                char c = s.charAt(pos++);
                if (c == '"') {
                    return sb.toString();
                }
                if (c == '\\') {
                    if (pos >= s.length()) {
                        throw error("Escape incompleto");
                    }
                    char e = s.charAt(pos++);
                    switch (e) {
                        case '"' -> sb.append('"');
                        case '\\' -> sb.append('\\');
                        case '/' -> sb.append('/');
                        case 'b' -> sb.append('\b');
                        case 'f' -> sb.append('\f');
                        case 'n' -> sb.append('\n');
                        case 'r' -> sb.append('\r');
                        case 't' -> sb.append('\t');
                        case 'u' -> {
                            if (pos + 4 > s.length()) {
                                throw error("Escape \\u incompleto");
                            }
                            try {
                                sb.append((char) Integer.parseInt(s.substring(pos, pos + 4), 16));
                            } catch (NumberFormatException ex) {
                                throw error("Escape \\u no válido");
                            }
                            pos += 4;
                        }
                        default -> throw error("Escape desconocido \\" + e);
                    }
                } else {
                    sb.append(c);
                }
            }
        }

        Object numero() {
            int inicio = pos;
            if (s.charAt(pos) == '-') {
                pos++;
            }
            boolean decimal = false;
            while (pos < s.length()) {
                char c = s.charAt(pos);
                if (c >= '0' && c <= '9') {
                    pos++;
                } else if (c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-') {
                    decimal = true;
                    pos++;
                } else {
                    break;
                }
            }
            String n = s.substring(inicio, pos);
            try {
                if (!decimal) {
                    return Long.parseLong(n);
                }
                return Double.parseDouble(n);
            } catch (NumberFormatException e) {
                throw error("Número no válido: " + n);
            }
        }
    }

    // =====================================================================
    //  ESCRITURA
    // =====================================================================

    /** Serializa en una sola línea (para la red). */
    public static String escribir(Object valor) {
        StringBuilder sb = new StringBuilder();
        escribir(sb, valor, -1, 0);
        return sb.toString();
    }

    /** Serializa con sangría de 2 espacios (para los archivos en disco). */
    public static String bonito(Object valor) {
        StringBuilder sb = new StringBuilder();
        escribir(sb, valor, 2, 0);
        return sb.append('\n').toString();
    }

    private static void escribir(StringBuilder sb, Object v, int sangria, int nivel) {
        if (v == null) {
            sb.append("null");
        } else if (v instanceof String str) {
            cadena(sb, str);
        } else if (v instanceof Boolean b) {
            sb.append(b);
        } else if (v instanceof Double d) {
            if (d.isNaN() || d.isInfinite()) {
                sb.append("null");
            } else if (d == Math.rint(d) && Math.abs(d) < 1e15) {
                sb.append(d.longValue());
            } else {
                sb.append(d);
            }
        } else if (v instanceof Float f) {
            escribir(sb, f.doubleValue(), sangria, nivel);
        } else if (v instanceof Number n) {
            sb.append(n.longValue());
        } else if (v instanceof Map<?, ?> m) {
            if (m.isEmpty()) {
                sb.append("{}");
                return;
            }
            sb.append('{');
            Iterator<? extends Map.Entry<?, ?>> it = m.entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry<?, ?> e = it.next();
                salto(sb, sangria, nivel + 1);
                cadena(sb, String.valueOf(e.getKey()));
                sb.append(sangria >= 0 ? ": " : ":");
                escribir(sb, e.getValue(), sangria, nivel + 1);
                if (it.hasNext()) {
                    sb.append(',');
                }
            }
            salto(sb, sangria, nivel);
            sb.append('}');
        } else if (v instanceof Iterable<?> lista) {
            Iterator<?> it = lista.iterator();
            if (!it.hasNext()) {
                sb.append("[]");
                return;
            }
            // Arrays de valores simples cortos en una sola línea (más legible en disco).
            boolean simple = true;
            for (Object o : lista) {
                if (o instanceof Map || o instanceof Iterable) {
                    simple = false;
                    break;
                }
            }
            sb.append('[');
            while (it.hasNext()) {
                if (!simple) {
                    salto(sb, sangria, nivel + 1);
                }
                escribir(sb, it.next(), sangria, nivel + 1);
                if (it.hasNext()) {
                    sb.append(simple && sangria >= 0 ? ", " : ",");
                }
            }
            if (!simple) {
                salto(sb, sangria, nivel);
            }
            sb.append(']');
        } else if (v instanceof Object[] arr) {
            escribir(sb, List.of(arr), sangria, nivel);
        } else {
            cadena(sb, v.toString());
        }
    }

    private static void salto(StringBuilder sb, int sangria, int nivel) {
        if (sangria >= 0) {
            sb.append('\n');
            sb.append(" ".repeat(sangria * nivel));
        }
    }

    /** Texto JSON entre comillas, con los caracteres especiales escapados. */
    public static String cadena(String s) {
        StringBuilder sb = new StringBuilder(s.length() + 2);
        cadena(sb, s);
        return sb.toString();
    }

    private static void cadena(StringBuilder sb, String s) {
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                case '\b' -> sb.append("\\b");
                case '\f' -> sb.append("\\f");
                case '<' -> sb.append("\\u003c"); // evita cerrar un <script> si se incrusta en HTML
                case ' ' -> sb.append("\\u2028");
                case ' ' -> sb.append("\\u2029");
                default -> {
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        sb.append('"');
    }

    // =====================================================================
    //  AYUDAS DE ACCESO
    // =====================================================================

    public static String texto(Map<String, Object> m, String clave, String porDefecto) {
        Object v = m == null ? null : m.get(clave);
        return v == null ? porDefecto : v.toString();
    }

    public static long numero(Map<String, Object> m, String clave, long porDefecto) {
        Object v = m == null ? null : m.get(clave);
        if (v instanceof Number n) {
            return n.longValue();
        }
        if (v instanceof String s) {
            try {
                return Long.parseLong(s.trim());
            } catch (NumberFormatException e) {
                return porDefecto;
            }
        }
        return porDefecto;
    }

    public static boolean logico(Map<String, Object> m, String clave, boolean porDefecto) {
        Object v = m == null ? null : m.get(clave);
        if (v instanceof Boolean b) {
            return b;
        }
        if (v instanceof String s) {
            return Boolean.parseBoolean(s);
        }
        return porDefecto;
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> objeto(Map<String, Object> m, String clave) {
        Object v = m == null ? null : m.get(clave);
        return v instanceof Map ? (Map<String, Object>) v : null;
    }

    /** Copia profunda (los documentos de la base de datos nunca se comparten por referencia). */
    @SuppressWarnings("unchecked")
    public static <T> T copia(T valor) {
        if (valor instanceof Map<?, ?> m) {
            Map<String, Object> c = new LinkedHashMap<>();
            for (Map.Entry<?, ?> e : m.entrySet()) {
                c.put(String.valueOf(e.getKey()), copia(e.getValue()));
            }
            return (T) c;
        }
        if (valor instanceof List<?> l) {
            List<Object> c = new ArrayList<>(l.size());
            for (Object o : l) {
                c.add(copia(o));
            }
            return (T) c;
        }
        return valor;
    }
}
