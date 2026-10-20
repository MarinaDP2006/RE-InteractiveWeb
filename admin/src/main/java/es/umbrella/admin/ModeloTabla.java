/*
 * ============================================================================
 *  ModeloTabla.java — Tabla genérica sobre una lista de documentos JSON.
 * ============================================================================
 *  new ModeloTabla(List.of(col("Título", d -> d.get("titulo")), ...))
 *  Con filtro de texto (busca en todas las columnas, sin tildes).
 * ============================================================================
 */
package es.umbrella.admin;

import javax.swing.JTable;
import javax.swing.RowFilter;
import javax.swing.table.AbstractTableModel;
import javax.swing.table.TableRowSorter;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;

final class ModeloTabla extends AbstractTableModel {

    private static final long serialVersionUID = 1L;

    record Columna(String titulo, Function<Map<String, Object>, Object> valor, int ancho) {
    }

    static Columna col(String titulo, Function<Map<String, Object>, Object> valor) {
        return new Columna(titulo, valor, -1);
    }

    static Columna col(String titulo, Function<Map<String, Object>, Object> valor, int ancho) {
        return new Columna(titulo, valor, ancho);
    }

    private final List<Columna> columnas;
    private List<Map<String, Object>> filas = new ArrayList<>();

    ModeloTabla(List<Columna> columnas) {
        this.columnas = columnas;
    }

    void datos(List<Map<String, Object>> filas) {
        this.filas = new ArrayList<>(filas);
        fireTableDataChanged();
    }

    List<Map<String, Object>> datos() {
        return filas;
    }

    Map<String, Object> fila(int i) {
        return i >= 0 && i < filas.size() ? filas.get(i) : null;
    }

    @Override
    public int getRowCount() {
        return filas.size();
    }

    @Override
    public int getColumnCount() {
        return columnas.size();
    }

    @Override
    public String getColumnName(int c) {
        return columnas.get(c).titulo();
    }

    @Override
    public Class<?> getColumnClass(int c) {
        for (Map<String, Object> f : filas) {
            Object v = columnas.get(c).valor().apply(f);
            if (v != null) {
                return v instanceof Number ? Long.class : v instanceof Boolean ? Boolean.class : String.class;
            }
        }
        return String.class;
    }

    @Override
    public Object getValueAt(int r, int c) {
        Object v = columnas.get(c).valor().apply(filas.get(r));
        if (v instanceof Number n && !(v instanceof Long)) {
            return n.longValue();
        }
        return v instanceof Boolean || v instanceof Long ? v : v == null ? "" : v.toString();
    }

    /** Monta la tabla con anchos de columna y ordenación. */
    JTable crearTabla() {
        JTable t = new JTable(this);
        Tema.tabla(t);
        t.setRowSorter(new TableRowSorter<>(this));
        for (int i = 0; i < columnas.size(); i++) {
            int a = columnas.get(i).ancho();
            if (a > 0) {
                t.getColumnModel().getColumn(i).setPreferredWidth(a);
                t.getColumnModel().getColumn(i).setMaxWidth(a * 2);
            }
        }
        return t;
    }

    /** Documento de la fila seleccionada (teniendo en cuenta el orden y el filtro). */
    static Map<String, Object> seleccion(JTable t) {
        int v = t.getSelectedRow();
        if (v < 0) {
            return null;
        }
        return ((ModeloTabla) t.getModel()).fila(t.convertRowIndexToModel(v));
    }

    static List<Map<String, Object>> selecciones(JTable t) {
        List<Map<String, Object>> l = new ArrayList<>();
        for (int v : t.getSelectedRows()) {
            l.add(((ModeloTabla) t.getModel()).fila(t.convertRowIndexToModel(v)));
        }
        return l;
    }

    static String plano(String s) {
        return Normalizer.normalize(s == null ? "" : s, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
    }

    @SuppressWarnings("unchecked")
    static void filtrar(JTable t, String texto) {
        TableRowSorter<ModeloTabla> s = (TableRowSorter<ModeloTabla>) t.getRowSorter();
        String q = plano(texto).trim();
        if (q.isEmpty()) {
            s.setRowFilter(null);
            return;
        }
        s.setRowFilter(new RowFilter<>() {
            @Override
            public boolean include(Entry<? extends ModeloTabla, ? extends Integer> e) {
                for (int i = 0; i < e.getValueCount(); i++) {
                    if (plano(String.valueOf(e.getValue(i))).contains(q)) {
                        return true;
                    }
                }
                return false;
            }
        });
    }
}
