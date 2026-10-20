/*
 * ============================================================================
 *  PanelWiki.java — Gestión del contenido de la wiki.
 * ============================================================================
 *  Elige una sección (Juegos, Personajes, Bestiario...) y crea, edita,
 *  duplica, oculta o borra sus fichas. También se editan las secciones del
 *  menú y los textos de la portada.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPopupMenu;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class PanelWiki extends JPanel implements VentanaPrincipal.Seccion {

    private static final long serialVersionUID = 1L;

    private final Cliente cliente;
    private final JComboBox<String> secciones = new JComboBox<>();
    private final List<Map<String, Object>> listaSecciones = new ArrayList<>();
    private final JTextField buscar = new JTextField(18);
    private final ModeloTabla modelo = new ModeloTabla(List.of(
            ModeloTabla.col("Identificador", d -> d.get("id"), 150),
            ModeloTabla.col("Título", d -> d.get("titulo")),
            ModeloTabla.col("Datos", d -> {
                Object a = d.getOrDefault("anio", d.getOrDefault("alias", d.getOrDefault("tipo", d.getOrDefault("fecha", ""))));
                return a == null ? "" : a.toString();
            }, 200),
            ModeloTabla.col("Visible", d -> Json.logico(d, "publicado", true), 60),
            ModeloTabla.col("Imagen", d -> Json.texto(d, "imagen", "").isEmpty() ? "—" : "sí", 60),
            ModeloTabla.col("Vídeo", d -> Json.texto(d, "video", "").isEmpty() ? "—" : "sí", 60),
            ModeloTabla.col("Orden", d -> Json.numero(d, "orden", 0), 60),
            ModeloTabla.col("Modificado", d -> Json.texto(d, "_actualizado", "").replace("T", " ").replaceAll("\\..*", ""), 150)));
    private final JTable tabla = modelo.crearTabla();
    private boolean cargando;

    PanelWiki(Cliente cliente) {
        super(new BorderLayout(0, 10));
        this.cliente = cliente;
        setOpaque(false);

        JButton secc = Tema.boton("Secciones y portada…");
        secc.addActionListener(e -> editarSecciones());
        JButton original = Tema.boton("Contenido original…");
        original.addActionListener(e -> restaurarOriginal());
        add(Tema.cabecera("Wiki", "Crea y edita las fichas de cada sección. Los cambios se ven al momento en la web.", original, secc), BorderLayout.NORTH);

        JPanel barra = new JPanel(new BorderLayout(10, 0));
        barra.setOpaque(false);
        JPanel izq = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 0));
        izq.setOpaque(false);
        izq.add(Tema.etiqueta("Sección:"));
        secciones.setPrototypeDisplayValue("Agentes biológicos (99)  ");
        izq.add(secciones);
        izq.add(Tema.etiqueta("  Buscar:"));
        izq.add(buscar);
        barra.add(izq, BorderLayout.WEST);
        JPanel der = new JPanel(new FlowLayout(FlowLayout.RIGHT, 6, 0));
        der.setOpaque(false);
        JButton nueva = Tema.botonRojo("+ Nueva ficha");
        JButton editar = Tema.boton("Editar");
        JButton duplicar = Tema.boton("Duplicar");
        JButton visible = Tema.boton("Mostrar / ocultar");
        JButton ver = Tema.boton("Ver en la web");
        JButton borrar = Tema.boton("Borrar");
        for (JButton b : new JButton[]{nueva, editar, duplicar, visible, ver, borrar}) {
            der.add(b);
        }
        barra.add(der, BorderLayout.EAST);

        JPanel centro = new JPanel(new BorderLayout(0, 8));
        centro.setOpaque(false);
        centro.add(barra, BorderLayout.NORTH);
        centro.add(Tema.scroll(tabla), BorderLayout.CENTER);
        centro.add(Tema.etiqueta("<html><span style='font-size:10px'>Doble clic para editar · Clic derecho para más opciones · "
                + "El «orden» decide la posición en la web (de menor a mayor).</span></html>"), BorderLayout.SOUTH);
        add(centro, BorderLayout.CENTER);

        secciones.addActionListener(e -> {
            if (!cargando) {
                cargarFichas();
            }
        });
        buscar.getDocument().addDocumentListener(new DocumentListener() {
            public void insertUpdate(DocumentEvent e) { ModeloTabla.filtrar(tabla, buscar.getText()); }
            public void removeUpdate(DocumentEvent e) { ModeloTabla.filtrar(tabla, buscar.getText()); }
            public void changedUpdate(DocumentEvent e) { ModeloTabla.filtrar(tabla, buscar.getText()); }
        });
        nueva.addActionListener(e -> nueva());
        editar.addActionListener(e -> editar());
        duplicar.addActionListener(e -> duplicar());
        visible.addActionListener(e -> alternarVisible());
        ver.addActionListener(e -> verEnWeb());
        borrar.addActionListener(e -> borrar());
        tabla.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                if (e.getClickCount() == 2) {
                    editar();
                }
            }

            @Override
            public void mousePressed(MouseEvent e) {
                menu(e);
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                menu(e);
            }

            private void menu(MouseEvent e) {
                if (!e.isPopupTrigger()) {
                    return;
                }
                int fila = tabla.rowAtPoint(e.getPoint());
                if (fila >= 0) {
                    tabla.setRowSelectionInterval(fila, fila);
                }
                JPopupMenu m = new JPopupMenu();
                m.add("Editar").addActionListener(a -> editar());
                m.add("Duplicar").addActionListener(a -> duplicar());
                m.add("Mostrar / ocultar en la web").addActionListener(a -> alternarVisible());
                m.add("Ver en la web").addActionListener(a -> verEnWeb());
                m.addSeparator();
                m.add("Borrar…").addActionListener(a -> borrar());
                m.show(tabla, e.getX(), e.getY());
            }
        });
    }

    private String seccionActual() {
        int i = secciones.getSelectedIndex();
        return i >= 0 && i < listaSecciones.size() ? Json.texto(listaSecciones.get(i), "id", null) : null;
    }

    @Override
    public void refrescar() {
        Tarea.ejecutar(this, "Cargando las secciones…", () -> {
            Map<String, Object> cfg = Json.objeto(cliente.get("/api/admin/db/_config/wiki"), "documento");
            Map<String, Object> cols = cliente.get("/api/admin/db");
            return new Object[]{cfg, cols};
        }, r -> {
            @SuppressWarnings("unchecked")
            Map<String, Object> cfg = (Map<String, Object>) r[0];
            @SuppressWarnings("unchecked")
            Map<String, Object> cols = (Map<String, Object>) r[1];
            Map<String, Long> cuenta = new LinkedHashMap<>();
            for (Map<String, Object> c : Cliente.lista(cols, "colecciones")) {
                cuenta.put(Json.texto(c, "nombre", ""), Json.numero(c, "documentos", 0));
            }
            String antes = seccionActual();
            cargando = true;
            secciones.removeAllItems();
            listaSecciones.clear();
            if (cfg != null && cfg.get("secciones") instanceof List<?> l) {
                for (Object o : l) {
                    if (o instanceof Map<?, ?> m) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> s = (Map<String, Object>) m;
                        listaSecciones.add(s);
                        String id = Json.texto(s, "id", "");
                        secciones.addItem(Json.texto(s, "titulo", id) + " (" + cuenta.getOrDefault(id, 0L) + ")"
                                + (Json.logico(s, "visible", true) ? "" : " · oculta"));
                    }
                }
            }
            int sel = 0;
            for (int i = 0; i < listaSecciones.size(); i++) {
                if (Json.texto(listaSecciones.get(i), "id", "").equals(antes)) {
                    sel = i;
                }
            }
            if (!listaSecciones.isEmpty()) {
                secciones.setSelectedIndex(sel);
            }
            cargando = false;
            cargarFichas();
        });
    }

    private void cargarFichas() {
        String sec = seccionActual();
        if (sec == null) {
            modelo.datos(List.of());
            return;
        }
        Tarea.ejecutar(this, "Cargando " + sec + "…", () -> cliente.get("/api/admin/db/" + sec), r -> {
            List<Map<String, Object>> docs = new ArrayList<>(Cliente.lista(r, "documentos"));
            docs.sort((a, b) -> Long.compare(Json.numero(a, "orden", 9999), Json.numero(b, "orden", 9999)));
            modelo.datos(docs);
            ModeloTabla.filtrar(tabla, buscar.getText());
        });
    }

    private Map<String, Object> seleccionada() {
        Map<String, Object> d = ModeloTabla.seleccion(tabla);
        if (d == null) {
            Tarea.info(this, "Selecciona primero una ficha de la tabla.");
        }
        return d;
    }

    /** Plantilla de ficha nueva: mismos campos que las demás de la sección, vacíos. */
    private Map<String, Object> plantilla() {
        Map<String, Object> p = new LinkedHashMap<>();
        long maxOrden = 0;
        Map<String, Object> ejemplo = modelo.datos().isEmpty() ? null : modelo.datos().get(0);
        for (Map<String, Object> d : modelo.datos()) {
            maxOrden = Math.max(maxOrden, Json.numero(d, "orden", 0));
        }
        if (ejemplo != null) {
            for (Map.Entry<String, Object> e : ejemplo.entrySet()) {
                String k = e.getKey();
                if (k.equals("id") || k.startsWith("_")) {
                    continue;
                }
                Object v = e.getValue();
                p.put(k, v instanceof String ? "" : v instanceof Number ? (Object) 0L : v instanceof Boolean ? Boolean.TRUE : v instanceof List ? new ArrayList<>() : v instanceof Map ? new LinkedHashMap<>() : "");
            }
        } else {
            p.put("titulo", "");
            p.put("subtitulo", "");
            p.put("resumen", "");
            p.put("imagen", "");
            p.put("video", "");
            p.put("cuerpo", new ArrayList<>());
            p.put("curiosidades", new ArrayList<>());
            p.put("etiquetas", new ArrayList<>());
            p.put("color", "#c8102e");
        }
        p.put("publicado", Boolean.TRUE);
        p.put("orden", maxOrden + 10);
        return p;
    }

    private void nueva() {
        String sec = seccionActual();
        if (sec != null) {
            EditorDocumento.abrir(this, cliente, sec, null, plantilla(), d -> cargarFichas());
        }
    }

    private void editar() {
        Map<String, Object> d = seleccionada();
        if (d != null) {
            EditorDocumento.abrir(this, cliente, seccionActual(), Json.texto(d, "id", ""), d, x -> cargarFichas());
        }
    }

    private void duplicar() {
        Map<String, Object> d = seleccionada();
        if (d == null) {
            return;
        }
        Map<String, Object> copia = Json.copia(d);
        copia.put("titulo", Json.texto(d, "titulo", "") + " (copia)");
        copia.put("publicado", Boolean.FALSE);
        EditorDocumento.abrir(this, cliente, seccionActual(), null, copia, x -> cargarFichas());
    }

    private void alternarVisible() {
        Map<String, Object> d = seleccionada();
        if (d == null) {
            return;
        }
        String sec = seccionActual();
        String id = Json.texto(d, "id", "");
        Map<String, Object> nuevo = Json.copia(d);
        nuevo.put("publicado", !Json.logico(d, "publicado", true));
        Tarea.ejecutar(this, "Guardando…", () -> cliente.put("/api/admin/db/" + sec + "/" + id, nuevo), r -> cargarFichas());
    }

    private void verEnWeb() {
        Map<String, Object> d = seleccionada();
        if (d != null) {
            VentanaPrincipal.abrir(cliente.url("/wiki/#/f/" + seccionActual() + "/" + Json.texto(d, "id", "")));
        }
    }

    private void borrar() {
        List<Map<String, Object>> sel = ModeloTabla.selecciones(tabla);
        if (sel.isEmpty()) {
            Tarea.info(this, "Selecciona primero una o varias fichas.");
            return;
        }
        String nombres = sel.size() == 1 ? "«" + Tarea.escapar(Json.texto(sel.get(0), "titulo", "")) + "»" : sel.size() + " fichas";
        if (!Tarea.confirmar(this, "¿Borrar " + nombres + " de la wiki? Esta acción no se puede deshacer (salvo restaurando una copia de seguridad).")) {
            return;
        }
        String sec = seccionActual();
        Tarea.ejecutar(this, "Borrando…", () -> {
            for (Map<String, Object> d : sel) {
                cliente.delete("/api/admin/db/" + sec + "/" + Json.texto(d, "id", ""));
            }
            return sel.size();
        }, n -> cargarFichas());
    }

    private void editarSecciones() {
        Tarea.ejecutar(this, "Cargando…", () -> Json.objeto(cliente.get("/api/admin/db/_config/wiki"), "documento"), cfg ->
                EditorDocumento.abrir(this, cliente, "_config", "wiki", cfg, d -> refrescar()));
    }

    private void restaurarOriginal() {
        String sec = seccionActual();
        if (sec == null) {
            return;
        }
        String[] opciones = {"Añadir solo las fichas que falten", "Restablecer TODA la sección al original", "Cancelar"};
        int r = JOptionPane.showOptionDialog(this,
                "<html><body style='width:380px'>Puedes recuperar el contenido original de la sección <b>" + sec + "</b> que venía con el proyecto.<br><br>"
                        + "• <b>Añadir las que falten</b>: no toca tus cambios.<br>"
                        + "• <b>Restablecer todo</b>: sobrescribe las fichas originales con su versión inicial (se hace antes una copia de seguridad).</body></html>",
                "Contenido original", JOptionPane.DEFAULT_OPTION, JOptionPane.QUESTION_MESSAGE, null, opciones, opciones[0]);
        if (r != 0 && r != 1) {
            return;
        }
        boolean sobrescribir = r == 1;
        Tarea.ejecutar(this, "Recuperando el contenido original…", () -> cliente.post("/api/admin/db/" + sec + "/semilla?sobrescribir=" + sobrescribir, null),
                x -> {
                    Tarea.info(this, Json.numero(x, "documentos", 0) + " fichas " + (sobrescribir ? "restablecidas" : "añadidas") + ".");
                    refrescar();
                });
    }
}
