/*
 * ============================================================================
 *  PanelJuego.java — Gestión del juego.
 * ============================================================================
 *  Pestañas:
 *   · Configuración: qué archivos están abiertos, vídeo de introducción de
 *     cada archivo, mensaje del día y ranking.
 *   · Puzzles: soluciones y mensajes (se validan en el servidor).
 *   · Partidas guardadas (códigos ABCD-1234).
 *   · Ranking de supervivientes.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTabbedPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class PanelJuego extends JPanel implements VentanaPrincipal.Seccion {

    private static final long serialVersionUID = 1L;

    /** Los 9 archivos del juego (id → nombre). */
    private static final String[][] ARCHIVOS = {
            {"re1", "I · Resident Evil"}, {"re2", "II · Resident Evil 2"}, {"re3", "III · Resident Evil 3"}, {"re4", "IV · Resident Evil 4"},
            {"re5", "V · Resident Evil 5"}, {"re6", "VI · Resident Evil 6"}, {"re7", "VII · Resident Evil 7"}, {"re8", "VIII · Resident Evil Village"},
            {"re9", "IX · Resident Evil Requiem"}};

    private final Cliente cliente;
    private final JTabbedPane pestanas = new JTabbedPane();

    // Configuración
    private Map<String, Object> config = new LinkedHashMap<>();
    private final Map<String, JCheckBox> activos = new LinkedHashMap<>();
    private final Map<String, JTextField> videos = new LinkedHashMap<>();
    private final JTextField mensajeDia = new JTextField();
    private final JCheckBox rankingAbierto = new JCheckBox("El ranking está abierto (se pueden registrar nuevas campañas)");

    // Tablas
    private final ModeloTabla mPuzzles = new ModeloTabla(List.of(
            ModeloTabla.col("Puzzle", d -> d.get("id"), 170),
            ModeloTabla.col("Juego", d -> d.get("juego"), 160),
            ModeloTabla.col("Descripción", d -> d.get("descripcion")),
            ModeloTabla.col("Soluciones", d -> d.get("soluciones") instanceof List<?> l ? String.join(" | ", l.stream().map(String::valueOf).toList()) : "", 260)));
    private final JTable tPuzzles = mPuzzles.crearTabla();
    private final ModeloTabla mPartidas = new ModeloTabla(List.of(
            ModeloTabla.col("Código", d -> String.valueOf(d.get("id")).toUpperCase(), 110),
            ModeloTabla.col("Jugador", d -> d.get("nombre"), 160),
            ModeloTabla.col("Archivo", d -> resumenPartida(d), 260),
            ModeloTabla.col("Creada", d -> fecha(Json.texto(d, "creada", "")), 150),
            ModeloTabla.col("Último guardado", d -> fecha(Json.texto(d, "_actualizado", "")), 150)));
    private final JTable tPartidas = mPartidas.crearTabla();
    private final ModeloTabla mRanking = new ModeloTabla(List.of(
            ModeloTabla.col("#", d -> Json.numero(d, "_pos", 0), 40),
            ModeloTabla.col("Superviviente", d -> d.get("nombre")),
            ModeloTabla.col("Tiempo", d -> tiempo(Json.numero(d, "segundos", 0)), 110),
            ModeloTabla.col("Muertes", d -> Json.numero(d, "muertes", 0), 70),
            ModeloTabla.col("Puntuación", d -> Json.numero(d, "puntuacion", 0), 90),
            ModeloTabla.col("Personaje", d -> d.get("personaje"), 110),
            ModeloTabla.col("Fecha", d -> d.get("fecha"), 110)));
    private final JTable tRanking = mRanking.crearTabla();

    PanelJuego(Cliente cliente) {
        super(new BorderLayout(0, 10));
        this.cliente = cliente;
        setOpaque(false);
        JButton abrir = Tema.boton("Abrir el juego");
        abrir.addActionListener(e -> VentanaPrincipal.abrir(cliente.url("/juego/")));
        add(Tema.cabecera("Juego", "Archivos activos, vídeos, puzzles, partidas guardadas y ranking.", abrir), BorderLayout.NORTH);
        pestanas.addTab("Configuración", pestanaConfig());
        pestanas.addTab("Puzzles", pestanaPuzzles());
        pestanas.addTab("Partidas guardadas", pestanaPartidas());
        pestanas.addTab("Ranking", pestanaRanking());
        pestanas.addChangeListener(e -> refrescar());
        add(pestanas, BorderLayout.CENTER);
    }

    private static String fecha(String iso) {
        return iso.replace("T", " ").replaceAll("\\..*|Z$", "");
    }

    private static String tiempo(long s) {
        return String.format("%d:%02d:%02d", s / 3600, s % 3600 / 60, s % 60);
    }

    private static String resumenPartida(Map<String, Object> d) {
        try {
            Map<String, Object> e = Json.leerObjeto(Json.texto(d, "estado", "{}"));
            // Juego 3D (version 3): "nivel" 0-8 desde RE1 · juego clásico: "capitulo" 0-7 desde RE2.
            long cap = Json.numero(e, "version", 0) == 3 ? Json.numero(e, "nivel", 0) : Json.numero(e, "capitulo", 0) + 1;
            return (cap >= 0 && cap < ARCHIVOS.length ? ARCHIVOS[(int) cap][1] : "Archivo " + cap)
                    + " · salud " + Json.numero(e, "salud", 0) + " · ☠ " + Json.numero(e, "muertes", 0);
        } catch (IllegalArgumentException ex) {
            return "(dañada)";
        }
    }

    // ------------------------------------------------------------------
    //  Configuración
    // ------------------------------------------------------------------

    private JScrollPane pestanaConfig() {
        JPanel p = new JPanel(new GridBagLayout());
        p.setBorder(Tema.margen(16));
        GridBagConstraints c = new GridBagConstraints();
        c.insets = new Insets(5, 6, 5, 6);
        c.fill = GridBagConstraints.HORIZONTAL;
        c.gridy = 0;
        c.gridx = 0;
        c.gridwidth = 4;
        p.add(seccion("Archivos abiertos y vídeo de introducción"), c);
        c.gridy++;
        p.add(Tema.etiqueta("<html>Desmarca un archivo para cerrarlo temporalmente (la campaña lo salta). El vídeo se reproduce antes de empezar el archivo: "
                + "pega un enlace o ID de YouTube, o sube un .mp4.</html>"), c);
        c.gridwidth = 1;
        List<String[]> todos = new ArrayList<>();
        todos.add(new String[]{"intro", "Vídeo de introducción general (opcional)"});
        for (String[] a : ARCHIVOS) {
            todos.add(a);
        }
        for (String[] a : todos) {
            c.gridy++;
            c.gridx = 0;
            c.weightx = 0;
            if (!a[0].equals("intro")) {
                JCheckBox cb = new JCheckBox(a[1]);
                cb.setFont(Tema.fuente(Font.BOLD, 13));
                activos.put(a[0], cb);
                p.add(cb, c);
            } else {
                p.add(Tema.etiqueta(a[1]), c);
            }
            c.gridx = 1;
            c.weightx = 1;
            JTextField v = new JTextField();
            v.setToolTipText("Enlace de YouTube, ID de 11 caracteres o /subidas/video.mp4");
            videos.put(a[0], v);
            p.add(v, c);
            c.gridx = 2;
            c.weightx = 0;
            JButton subir = Tema.boton("Subir vídeo…");
            subir.addActionListener(e -> Multimedia.elegirYSubir(this, cliente, true, v::setText));
            p.add(subir, c);
            c.gridx = 3;
            JButton probar = Tema.boton("Probar");
            probar.addActionListener(e -> {
                String t = v.getText().trim();
                if (!t.isEmpty()) {
                    VentanaPrincipal.abrir(t.matches("[\\w-]{11}") ? "https://www.youtube.com/watch?v=" + t : cliente.url(t));
                }
            });
            p.add(probar, c);
        }
        c.gridy++;
        c.gridx = 0;
        c.gridwidth = 4;
        p.add(seccion("Mensaje del día"), c);
        c.gridy++;
        p.add(Tema.etiqueta("Aparece en la pantalla de título del juego. Déjalo vacío para no mostrar nada."), c);
        c.gridy++;
        p.add(mensajeDia, c);
        c.gridy++;
        p.add(seccion("Ranking"), c);
        c.gridy++;
        p.add(rankingAbierto, c);
        c.gridy++;
        JPanel botones = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton guardar = Tema.botonRojo("Guardar configuración");
        guardar.addActionListener(e -> guardarConfig());
        botones.add(guardar);
        p.add(botones, c);
        c.gridy++;
        c.weighty = 1;
        p.add(new JLabel(), c);
        JScrollPane s = Tema.scroll(p);
        s.setBorder(null);
        return s;
    }

    private static JLabel seccion(String t) {
        JLabel l = new JLabel(t);
        l.setFont(Tema.SUBTITULO);
        l.setForeground(Tema.TEXTO);
        l.setBorder(BorderFactory.createEmptyBorder(14, 0, 2, 0));
        return l;
    }

    private void cargarConfig() {
        Tarea.ejecutar(this, "Cargando la configuración del juego…", () -> Json.objeto(cliente.get("/api/admin/db/_config/juego"), "documento"), d -> {
            config = d == null ? new LinkedHashMap<>() : d;
            Map<String, Object> arch = Json.objeto(config, "archivos");
            Map<String, Object> vids = Json.objeto(config, "videos");
            for (Map.Entry<String, JCheckBox> e : activos.entrySet()) {
                e.getValue().setSelected(Json.logico(arch, e.getKey(), true));
            }
            for (Map.Entry<String, JTextField> e : videos.entrySet()) {
                e.getValue().setText(Json.texto(vids, e.getKey(), ""));
            }
            mensajeDia.setText(Json.texto(config, "mensajeDia", ""));
            rankingAbierto.setSelected(Json.logico(config, "rankingAbierto", true));
        });
    }

    private void guardarConfig() {
        Map<String, Object> c = new LinkedHashMap<>(config);
        c.remove("id");
        c.remove("_actualizado");
        Map<String, Object> arch = new LinkedHashMap<>();
        for (Map.Entry<String, JCheckBox> e : activos.entrySet()) {
            arch.put(e.getKey(), e.getValue().isSelected());
        }
        Map<String, Object> vids = new LinkedHashMap<>();
        for (Map.Entry<String, JTextField> e : videos.entrySet()) {
            vids.put(e.getKey(), e.getValue().getText().trim());
        }
        c.put("archivos", arch);
        c.put("videos", vids);
        c.put("mensajeDia", mensajeDia.getText().trim());
        c.put("rankingAbierto", rankingAbierto.isSelected());
        Tarea.ejecutar(this, "Guardando la configuración…", () -> cliente.put("/api/admin/db/_config/juego", c), r -> {
            config = Json.objeto(r, "documento");
            Tarea.info(this, "Configuración del juego guardada.");
        });
    }

    // ------------------------------------------------------------------
    //  Puzzles
    // ------------------------------------------------------------------

    private JPanel pestanaPuzzles() {
        JPanel p = new JPanel(new BorderLayout(0, 8));
        p.setBorder(Tema.margen(10));
        JPanel b = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 0));
        JButton nuevo = Tema.botonRojo("+ Nuevo puzzle");
        JButton editar = Tema.boton("Editar");
        JButton probar = Tema.boton("Probar una respuesta…");
        JButton borrar = Tema.boton("Borrar");
        b.add(nuevo);
        b.add(editar);
        b.add(probar);
        b.add(borrar);
        p.add(b, BorderLayout.NORTH);
        p.add(Tema.scroll(tPuzzles), BorderLayout.CENTER);
        p.add(Tema.etiqueta("<html><span style='font-size:10px'>Las respuestas se comparan sin tildes, en mayúsculas y sin espacios: «León, Unicornio» = «LEON,UNICORNIO». "
                + "El identificador debe coincidir con el «id» del paso de puzzle en la historia del juego.</span></html>"), BorderLayout.SOUTH);
        nuevo.addActionListener(e -> {
            Map<String, Object> pl = new LinkedHashMap<>();
            pl.put("juego", "");
            pl.put("descripcion", "");
            pl.put("soluciones", new ArrayList<>(List.of("")));
            pl.put("exito", "");
            pl.put("fallo", "");
            pl.put("orden", (long) (mPuzzles.getRowCount() + 1));
            EditorDocumento.abrir(this, cliente, "puzzles", null, pl, d -> cargarPuzzles());
        });
        editar.addActionListener(e -> editarPuzzle());
        probar.addActionListener(e -> probarPuzzle());
        borrar.addActionListener(e -> borrarSeleccion(tPuzzles, "puzzles", this::cargarPuzzles));
        tPuzzles.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                if (e.getClickCount() == 2) {
                    editarPuzzle();
                }
            }
        });
        return p;
    }

    private void editarPuzzle() {
        Map<String, Object> d = ModeloTabla.seleccion(tPuzzles);
        if (d != null) {
            EditorDocumento.abrir(this, cliente, "puzzles", Json.texto(d, "id", ""), d, x -> cargarPuzzles());
        }
    }

    private void probarPuzzle() {
        Map<String, Object> d = ModeloTabla.seleccion(tPuzzles);
        if (d == null) {
            Tarea.info(this, "Selecciona un puzzle.");
            return;
        }
        String resp = JOptionPane.showInputDialog(this, "Respuesta a probar en «" + d.get("id") + "»:");
        if (resp == null) {
            return;
        }
        Map<String, Object> cuerpo = Map.of("puzzle", Json.texto(d, "id", ""), "respuesta", resp);
        Tarea.ejecutar(this, "Probando…", () -> cliente.post("/api/juego/verificar", cuerpo), r ->
                Tarea.info(this, (Json.logico(r, "correcto", false) ? "<b style='color:#4cc46a'>✔ CORRECTO</b>" : "<b style='color:#ff2a3d'>✘ INCORRECTO</b>")
                        + "<br><br>" + Tarea.escapar(Json.texto(r, "mensaje", ""))));
    }

    private void cargarPuzzles() {
        Tarea.ejecutar(this, "Cargando puzzles…", () -> cliente.get("/api/admin/db/puzzles"), r -> {
            List<Map<String, Object>> l = new ArrayList<>(Cliente.lista(r, "documentos"));
            l.sort((a, b) -> Long.compare(Json.numero(a, "orden", 0), Json.numero(b, "orden", 0)));
            mPuzzles.datos(l);
        });
    }

    // ------------------------------------------------------------------
    //  Partidas
    // ------------------------------------------------------------------

    private JPanel pestanaPartidas() {
        JPanel p = new JPanel(new BorderLayout(0, 8));
        p.setBorder(Tema.margen(10));
        JPanel b = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 0));
        JTextField buscar = new JTextField(16);
        buscar.addActionListener(e -> ModeloTabla.filtrar(tPartidas, buscar.getText()));
        buscar.getDocument().addDocumentListener(new javax.swing.event.DocumentListener() {
            public void insertUpdate(javax.swing.event.DocumentEvent e) { ModeloTabla.filtrar(tPartidas, buscar.getText()); }
            public void removeUpdate(javax.swing.event.DocumentEvent e) { ModeloTabla.filtrar(tPartidas, buscar.getText()); }
            public void changedUpdate(javax.swing.event.DocumentEvent e) { }
        });
        JButton ver = Tema.boton("Ver datos");
        JButton borrar = Tema.boton("Borrar");
        b.add(Tema.etiqueta("Buscar código o jugador:"));
        b.add(buscar);
        b.add(ver);
        b.add(borrar);
        p.add(b, BorderLayout.NORTH);
        p.add(Tema.scroll(tPartidas), BorderLayout.CENTER);
        ver.addActionListener(e -> {
            Map<String, Object> d = ModeloTabla.seleccion(tPartidas);
            if (d != null) {
                EditorDocumento.abrir(this, cliente, "partidas", Json.texto(d, "id", ""), d, x -> cargarPartidas());
            }
        });
        borrar.addActionListener(e -> borrarSeleccion(tPartidas, "partidas", this::cargarPartidas));
        return p;
    }

    private void cargarPartidas() {
        Tarea.ejecutar(this, "Cargando partidas…", () -> cliente.get("/api/admin/db/partidas"), r -> {
            List<Map<String, Object>> l = new ArrayList<>(Cliente.lista(r, "documentos"));
            l.sort((a, b) -> Json.texto(b, "_actualizado", "").compareTo(Json.texto(a, "_actualizado", "")));
            mPartidas.datos(l);
        });
    }

    // ------------------------------------------------------------------
    //  Ranking
    // ------------------------------------------------------------------

    private JPanel pestanaRanking() {
        JPanel p = new JPanel(new BorderLayout(0, 8));
        p.setBorder(Tema.margen(10));
        JPanel b = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 0));
        JButton borrar = Tema.boton("Borrar seleccionados");
        JButton vaciar = Tema.boton("Reiniciar el ranking…");
        b.add(borrar);
        b.add(vaciar);
        p.add(b, BorderLayout.NORTH);
        p.add(Tema.scroll(tRanking), BorderLayout.CENTER);
        borrar.addActionListener(e -> borrarSeleccion(tRanking, "ranking", this::cargarRanking));
        vaciar.addActionListener(e -> {
            if (Tarea.confirmar(this, "¿Borrar TODO el ranking? Se hará antes una copia de seguridad en el servidor.")) {
                Tarea.ejecutar(this, "Reiniciando el ranking…", () -> cliente.delete("/api/admin/db/ranking"), r -> cargarRanking());
            }
        });
        return p;
    }

    private void cargarRanking() {
        Tarea.ejecutar(this, "Cargando el ranking…", () -> cliente.get("/api/admin/db/ranking"), r -> {
            List<Map<String, Object>> l = new ArrayList<>(Cliente.lista(r, "documentos"));
            l.sort((a, b) -> Long.compare(Json.numero(a, "puntuacion", Long.MAX_VALUE), Json.numero(b, "puntuacion", Long.MAX_VALUE)));
            for (int i = 0; i < l.size(); i++) {
                l.get(i).put("_pos", (long) (i + 1));
            }
            mRanking.datos(l);
        });
    }

    private void borrarSeleccion(JTable t, String coleccion, Runnable despues) {
        List<Map<String, Object>> sel = ModeloTabla.selecciones(t);
        if (sel.isEmpty()) {
            Tarea.info(this, "Selecciona una o varias filas.");
            return;
        }
        if (!Tarea.confirmar(this, "¿Borrar " + sel.size() + " elemento(s) de «" + coleccion + "»?")) {
            return;
        }
        Tarea.ejecutar(this, "Borrando…", () -> {
            for (Map<String, Object> d : sel) {
                cliente.delete("/api/admin/db/" + coleccion + "/" + Json.texto(d, "id", ""));
            }
            return sel.size();
        }, n -> despues.run());
    }

    @Override
    public void refrescar() {
        switch (pestanas.getSelectedIndex()) {
            case 0 -> cargarConfig();
            case 1 -> cargarPuzzles();
            case 2 -> cargarPartidas();
            case 3 -> cargarRanking();
            default -> { }
        }
    }
}
