/*
 * ============================================================================
 *  PanelBaseDatos.java — Explorador completo de la base de datos.
 * ============================================================================
 *  Todas las colecciones (wiki, juego y sistema) y todos sus documentos, con
 *  editor JSON, creación, borrado, vaciado y recuperación de la semilla.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.DefaultListModel;
import javax.swing.JButton;
import javax.swing.JList;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JSplitPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class PanelBaseDatos extends JPanel implements VentanaPrincipal.Seccion {

    private static final long serialVersionUID = 1L;

    private final Cliente cliente;
    private final DefaultListModel<String> mColecciones = new DefaultListModel<>();
    private final JList<String> colecciones = new JList<>(mColecciones);
    private final List<Map<String, Object>> infoColecciones = new ArrayList<>();
    private final ModeloTabla modelo = new ModeloTabla(List.of(
            ModeloTabla.col("Documento", d -> d.get("id"), 220),
            ModeloTabla.col("Título / contenido", d -> {
                Object t = d.getOrDefault("titulo", d.getOrDefault("nombre", d.getOrDefault("accion", d.getOrDefault("descripcion", ""))));
                return t == null ? "" : t.toString();
            }),
            ModeloTabla.col("Campos", d -> (long) d.size() - 1, 70),
            ModeloTabla.col("Modificado", d -> Json.texto(d, "_actualizado", "").replace("T", " ").replaceAll("\\..*", ""), 160)));
    private final JTable tabla = modelo.crearTabla();
    private final JTextField buscar = new JTextField(16);

    PanelBaseDatos(Cliente cliente) {
        super(new BorderLayout(0, 10));
        this.cliente = cliente;
        setOpaque(false);
        add(Tema.cabecera("Base de datos",
                "Acceso directo a todas las colecciones. Útil para cambios avanzados. Las colecciones que empiezan por «_» son de configuración del sistema."),
                BorderLayout.NORTH);

        colecciones.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        colecciones.setFont(Tema.MONO);
        colecciones.setFixedCellHeight(26);
        colecciones.addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                cargarDocumentos();
            }
        });

        JPanel izq = new JPanel(new BorderLayout(0, 6));
        izq.add(Tema.etiqueta("Colecciones"), BorderLayout.NORTH);
        izq.add(Tema.scroll(colecciones), BorderLayout.CENTER);
        JPanel bi = new JPanel(new java.awt.GridLayout(0, 1, 0, 4));
        JButton nuevaCol = Tema.boton("Nueva colección…");
        JButton semilla = Tema.boton("Recuperar semilla…");
        JButton vaciar = Tema.boton("Vaciar colección…");
        bi.add(nuevaCol);
        bi.add(semilla);
        bi.add(vaciar);
        izq.add(bi, BorderLayout.SOUTH);

        JPanel der = new JPanel(new BorderLayout(0, 6));
        JPanel barra = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 0));
        JButton nuevo = Tema.botonRojo("+ Nuevo documento");
        JButton editar = Tema.boton("Editar");
        JButton borrar = Tema.boton("Borrar");
        barra.add(nuevo);
        barra.add(editar);
        barra.add(borrar);
        barra.add(Tema.etiqueta("  Buscar:"));
        barra.add(buscar);
        der.add(barra, BorderLayout.NORTH);
        der.add(Tema.scroll(tabla), BorderLayout.CENTER);

        JSplitPane split = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, izq, der);
        split.setDividerLocation(260);
        split.setBorder(null);
        add(split, BorderLayout.CENTER);

        buscar.getDocument().addDocumentListener(new javax.swing.event.DocumentListener() {
            public void insertUpdate(javax.swing.event.DocumentEvent e) { ModeloTabla.filtrar(tabla, buscar.getText()); }
            public void removeUpdate(javax.swing.event.DocumentEvent e) { ModeloTabla.filtrar(tabla, buscar.getText()); }
            public void changedUpdate(javax.swing.event.DocumentEvent e) { }
        });
        tabla.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                if (e.getClickCount() == 2) {
                    editar();
                }
            }
        });
        nuevo.addActionListener(e -> {
            String col = coleccion();
            if (col != null) {
                EditorDocumento.abrir(this, cliente, col, null, new LinkedHashMap<>(), d -> cargarDocumentos());
            }
        });
        editar.addActionListener(e -> editar());
        borrar.addActionListener(e -> borrar());
        nuevaCol.addActionListener(e -> {
            String n = JOptionPane.showInputDialog(this, "Nombre de la nueva colección (minúsculas, sin espacios):");
            if (n != null && !n.isBlank()) {
                EditorDocumento.abrir(this, cliente, n.trim().toLowerCase(), null, new LinkedHashMap<>(), d -> refrescar());
            }
        });
        semilla.addActionListener(e -> semilla());
        vaciar.addActionListener(e -> {
            String col = coleccion();
            if (col != null && Tarea.confirmar(this, "¿Vaciar la colección «" + col + "»? Se borrarán TODOS sus documentos (antes se hace una copia de seguridad en el servidor).")) {
                Tarea.ejecutar(this, "Vaciando…", () -> cliente.delete("/api/admin/db/" + col), r -> refrescar());
            }
        });
    }

    private String coleccion() {
        int i = colecciones.getSelectedIndex();
        return i >= 0 && i < infoColecciones.size() ? Json.texto(infoColecciones.get(i), "nombre", null) : null;
    }

    @Override
    public void refrescar() {
        String antes = coleccion();
        Tarea.ejecutar(this, "Cargando colecciones…", () -> cliente.get("/api/admin/db"), r -> {
            infoColecciones.clear();
            mColecciones.clear();
            int sel = -1;
            for (Map<String, Object> c : Cliente.lista(r, "colecciones")) {
                infoColecciones.add(c);
                String n = Json.texto(c, "nombre", "");
                mColecciones.addElement(String.format("%-16s %5d", n, Json.numero(c, "documentos", 0)) + (Json.logico(c, "wiki", false) ? "  wiki" : ""));
                if (n.equals(antes)) {
                    sel = infoColecciones.size() - 1;
                }
            }
            if (sel < 0 && !infoColecciones.isEmpty()) {
                sel = 0;
            }
            if (sel >= 0) {
                colecciones.setSelectedIndex(sel);
            }
        });
    }

    private void cargarDocumentos() {
        String col = coleccion();
        if (col == null) {
            return;
        }
        Tarea.ejecutar(this, "Cargando " + col + "…", () -> cliente.get("/api/admin/db/" + col), r -> {
            modelo.datos(Cliente.lista(r, "documentos"));
            ModeloTabla.filtrar(tabla, buscar.getText());
        });
    }

    private void editar() {
        Map<String, Object> d = ModeloTabla.seleccion(tabla);
        if (d != null) {
            EditorDocumento.abrir(this, cliente, coleccion(), Json.texto(d, "id", ""), d, x -> cargarDocumentos());
        }
    }

    private void borrar() {
        List<Map<String, Object>> sel = ModeloTabla.selecciones(tabla);
        String col = coleccion();
        if (sel.isEmpty() || col == null || !Tarea.confirmar(this, "¿Borrar " + sel.size() + " documento(s) de «" + col + "»?")) {
            return;
        }
        Tarea.ejecutar(this, "Borrando…", () -> {
            for (Map<String, Object> d : sel) {
                cliente.delete("/api/admin/db/" + col + "/" + Json.texto(d, "id", ""));
            }
            return true;
        }, r -> cargarDocumentos());
    }

    private void semilla() {
        String col = coleccion();
        if (col == null) {
            return;
        }
        String[] op = {"Añadir lo que falte", "Restablecer al original", "Cancelar"};
        int r = JOptionPane.showOptionDialog(this, "¿Recuperar los datos originales de «" + col + "»?", "Semilla",
                JOptionPane.DEFAULT_OPTION, JOptionPane.QUESTION_MESSAGE, null, op, op[0]);
        if (r == 0 || r == 1) {
            Tarea.ejecutar(this, "Recuperando…", () -> cliente.post("/api/admin/db/" + col + "/semilla?sobrescribir=" + (r == 1), null),
                    x -> {
                        Tarea.info(this, Json.numero(x, "documentos", 0) + " documentos recuperados.");
                        refrescar();
                    });
        }
    }
}
