/*
 * ============================================================================
 *  EditorDocumento.java — Editor de cualquier documento de la base de datos.
 * ============================================================================
 *  Dos pestañas sincronizadas:
 *   · FORMULARIO: un campo por cada dato del documento, generado solo:
 *       texto corto → caja de texto · texto largo → área · número → número
 *       sí/no → casilla · lista de textos → «uno, dos, tres»
 *     Campos especiales: imagen (subir o elegir de la galería), vídeo
 *     (probar), color (selector), cuerpo y curiosidades (un párrafo por línea).
 *   · JSON: el documento completo, para campos avanzados (listas de objetos).
 *  Al guardar se valida y se envía al servidor.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JColorChooser;
import javax.swing.JComponent;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTabbedPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.Window;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.regex.Pattern;

final class EditorDocumento extends JDialog {

    private static final long serialVersionUID = 1L;
    private static final Pattern ID = Pattern.compile("[a-z0-9_][a-z0-9_-]{0,63}");

    /** Orden preferido de los campos en el formulario (el resto, detrás). */
    private static final List<String> PRIMEROS = List.of("titulo", "subtitulo", "alias", "tipo", "resumen", "imagen", "cuerpoImagen", "video",
            "cuerpo", "curiosidades", "etiquetas", "color", "orden", "publicado", "canon");
    /** Campos que se editan como texto largo con un elemento por línea. */
    private static final List<String> LINEAS = List.of("cuerpo", "curiosidades", "soluciones", "lineas");
    /** Nombres legibles para los campos más comunes. */
    private static final Map<String, String> NOMBRES = Map.ofEntries(
            Map.entry("titulo", "Título"), Map.entry("subtitulo", "Subtítulo"), Map.entry("resumen", "Resumen"),
            Map.entry("cuerpo", "Texto (un párrafo por línea · «## » para títulos)"), Map.entry("curiosidades", "Curiosidades (una por línea)"),
            Map.entry("imagen", "Imagen"), Map.entry("cuerpoImagen", "Imagen de cuerpo entero"), Map.entry("video", "Vídeo (YouTube o .mp4)"),
            Map.entry("etiquetas", "Etiquetas (separadas por comas)"), Map.entry("color", "Color"), Map.entry("orden", "Orden"),
            Map.entry("publicado", "Publicado (visible en la web)"), Map.entry("canon", "Canon"), Map.entry("anio", "Año"),
            Map.entry("soluciones", "Soluciones aceptadas (una por línea)"), Map.entry("exito", "Mensaje al acertar"), Map.entry("fallo", "Mensaje al fallar"),
            Map.entry("descripcion", "Descripción"), Map.entry("juego", "Juego"), Map.entry("alias", "Alias"), Map.entry("tipo", "Tipo"));

    private final Cliente cliente;
    private final String coleccion;
    private final boolean nuevo;
    private final JTextField campoId = new JTextField(24);
    private final JTextArea json = new JTextArea();
    private final JPanel formulario = new JPanel();
    private final JTabbedPane pestanas = new JTabbedPane();
    private final Map<String, JComponent> campos = new LinkedHashMap<>();
    private Map<String, Object> doc;
    private final Consumer<Map<String, Object>> alGuardar;

    EditorDocumento(Window padre, Cliente cliente, String coleccion, String id, Map<String, Object> documento, Consumer<Map<String, Object>> alGuardar) {
        super(padre, (id == null ? "Nuevo documento" : "Editar " + id) + " · " + coleccion, ModalityType.APPLICATION_MODAL);
        this.cliente = cliente;
        this.coleccion = coleccion;
        this.nuevo = id == null;
        this.alGuardar = alGuardar;
        this.doc = documento == null ? new LinkedHashMap<>() : Json.copia(documento);
        doc.remove("_actualizado");
        doc.remove("id");
        setIconImages(App.iconos());
        setSize(980, 780);
        setLocationRelativeTo(padre);

        JPanel raiz = new JPanel(new BorderLayout(0, 10));
        raiz.setBorder(Tema.margen(16));
        setContentPane(raiz);

        JPanel cab = new JPanel(new BorderLayout(10, 0));
        cab.setOpaque(false);
        JLabel t = Tema.titulo(nuevo ? "Nuevo en «" + coleccion + "»" : Json.texto(doc, "titulo", id));
        cab.add(t, BorderLayout.NORTH);
        JPanel idp = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 6));
        idp.setOpaque(false);
        idp.add(Tema.etiqueta("Identificador (en la URL):"));
        campoId.setText(id == null ? "" : id);
        campoId.setEditable(nuevo);
        campoId.setFont(Tema.MONO);
        idp.add(campoId);
        idp.add(Tema.etiqueta(nuevo ? "solo minúsculas, números y guiones · ej. «jill-valentine»" : "no se puede cambiar"));
        cab.add(idp, BorderLayout.SOUTH);
        raiz.add(cab, BorderLayout.NORTH);

        formulario.setLayout(new BoxLayout(formulario, BoxLayout.Y_AXIS));
        formulario.setBorder(Tema.margen(12));
        JScrollPane sf = Tema.scroll(formulario);
        sf.getVerticalScrollBar().setUnitIncrement(22);
        json.setFont(Tema.MONO);
        json.setTabSize(2);
        pestanas.addTab("Formulario", sf);
        pestanas.addTab("Todos los campos (JSON)", Tema.scroll(json));
        pestanas.addChangeListener(e -> {
            try {
                if (pestanas.getSelectedIndex() == 1) {
                    leerFormulario();
                    json.setText(Json.bonito(doc));
                } else {
                    doc = Json.leerObjeto(json.getText());
                    doc.remove("id");
                    construirFormulario();
                }
            } catch (IllegalArgumentException ex) {
                Tarea.error(this, "El JSON no es válido: " + ex.getMessage());
                pestanas.setSelectedIndex(1);
            }
        });
        raiz.add(pestanas, BorderLayout.CENTER);

        JPanel pie = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
        pie.setOpaque(false);
        JButton nuevoCampo = Tema.boton("Añadir campo…");
        nuevoCampo.addActionListener(e -> anadirCampo());
        JButton cancelar = Tema.boton("Cancelar");
        cancelar.addActionListener(e -> dispose());
        JButton guardar = Tema.botonRojo(nuevo ? "Crear" : "Guardar");
        guardar.addActionListener(e -> guardar());
        pie.add(nuevoCampo);
        pie.add(cancelar);
        pie.add(guardar);
        raiz.add(pie, BorderLayout.SOUTH);
        getRootPane().setDefaultButton(null);

        construirFormulario();
    }

    // ------------------------------------------------------------------
    //  Formulario dinámico
    // ------------------------------------------------------------------

    private void construirFormulario() {
        formulario.removeAll();
        campos.clear();
        List<String> claves = new ArrayList<>();
        for (String k : PRIMEROS) {
            if (doc.containsKey(k)) {
                claves.add(k);
            }
        }
        for (String k : doc.keySet()) {
            if (!claves.contains(k)) {
                claves.add(k);
            }
        }
        for (String k : claves) {
            formulario.add(fila(k, doc.get(k)));
            formulario.add(Box.createVerticalStrut(10));
        }
        if (claves.isEmpty()) {
            formulario.add(Tema.etiqueta("Este documento no tiene campos. Usa «Añadir campo…» o la pestaña JSON."));
        }
        formulario.revalidate();
        formulario.repaint();
    }

    private JPanel fila(String clave, Object valor) {
        JPanel f = new JPanel(new BorderLayout(0, 4));
        f.setOpaque(false);
        f.setAlignmentX(0f);
        JLabel l = new JLabel(NOMBRES.getOrDefault(clave, clave));
        l.setFont(Tema.fuente(Font.BOLD, 12));
        l.setForeground(Tema.TEXTO_SUAVE);
        f.add(l, BorderLayout.NORTH);
        JComponent c;
        if (valor instanceof Boolean b) {
            JCheckBox cb = new JCheckBox("Sí", b);
            c = cb;
            f.add(cb, BorderLayout.CENTER);
        } else if (valor instanceof List<?> lista && esListaSimple(lista)) {
            if (LINEAS.contains(clave)) {
                JTextArea a = area(String.join(clave.equals("cuerpo") ? "\n\n" : "\n", textos(lista)), clave.equals("cuerpo") ? 14 : 5);
                c = a;
                f.add(Tema.scroll(a), BorderLayout.CENTER);
            } else {
                JTextField tf = new JTextField(String.join(", ", textos(lista)));
                c = tf;
                f.add(tf, BorderLayout.CENTER);
            }
        } else if (valor instanceof Map || valor instanceof List) {
            JTextArea a = area(Json.bonito(valor).trim(), 4);
            a.setFont(Tema.MONO);
            a.putClientProperty("json", Boolean.TRUE);
            c = a;
            f.add(Tema.scroll(a), BorderLayout.CENTER);
        } else if (valor instanceof Number n) {
            JTextField tf = new JTextField(n instanceof Double d && d != Math.rint(d) ? String.valueOf(d) : String.valueOf(n.longValue()));
            tf.putClientProperty("numero", Boolean.TRUE);
            tf.setColumns(10);
            c = tf;
            JPanel p = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
            p.setOpaque(false);
            p.add(tf);
            f.add(p, BorderLayout.CENTER);
        } else {
            String s = valor == null ? "" : valor.toString();
            if (LINEAS.contains(clave) || s.length() > 90 || s.contains("\n") || clave.equals("resumen")) {
                JTextArea a = area(s, clave.equals("cuerpo") ? 14 : 4);
                c = a;
                f.add(Tema.scroll(a), BorderLayout.CENTER);
            } else {
                JTextField tf = new JTextField(s);
                c = tf;
                f.add(conAcciones(clave, tf), BorderLayout.CENTER);
            }
        }
        campos.put(clave, c);
        JButton quitar = new JButton("✕");
        quitar.setToolTipText("Quitar este campo");
        quitar.setMargin(new java.awt.Insets(0, 6, 0, 6));
        quitar.addActionListener(e -> {
            leerFormulario();
            doc.remove(clave);
            construirFormulario();
        });
        JPanel der = new JPanel(new BorderLayout());
        der.setOpaque(false);
        der.add(quitar, BorderLayout.NORTH);
        f.add(der, BorderLayout.EAST);
        f.setMaximumSize(new Dimension(Integer.MAX_VALUE, f.getPreferredSize().height + 40));
        return f;
    }

    /** Botones extra para imagen, vídeo y color. */
    private JComponent conAcciones(String clave, JTextField tf) {
        boolean esImagen = clave.toLowerCase().contains("imagen") || clave.equals("foto") || clave.equals("fondoImagen");
        boolean esVideo = clave.toLowerCase().contains("video");
        boolean esColor = clave.equals("color");
        if (!esImagen && !esVideo && !esColor) {
            return tf;
        }
        JPanel p = new JPanel(new BorderLayout(6, 0));
        p.setOpaque(false);
        p.add(tf, BorderLayout.CENTER);
        JPanel b = new JPanel(new FlowLayout(FlowLayout.RIGHT, 4, 0));
        b.setOpaque(false);
        if (esImagen || esVideo) {
            JButton subir = Tema.boton("Subir…");
            subir.addActionListener(e -> Multimedia.elegirYSubir(this, cliente, esVideo, url -> tf.setText(url)));
            JButton galeria = Tema.boton("Galería…");
            galeria.addActionListener(e -> Multimedia.elegirDeGaleria(this, cliente, url -> tf.setText(url)));
            b.add(subir);
            b.add(galeria);
        }
        if (esImagen || esVideo) {
            JButton ver = Tema.boton("Ver");
            ver.addActionListener(e -> {
                String v = tf.getText().trim();
                if (v.isEmpty()) {
                    return;
                }
                if (esVideo && v.matches("[\\w-]{11}")) {
                    VentanaPrincipal.abrir("https://www.youtube.com/watch?v=" + v);
                } else {
                    VentanaPrincipal.abrir(cliente.url(v));
                }
            });
            b.add(ver);
        }
        if (esColor) {
            JButton elegir = Tema.boton("Elegir…");
            elegir.addActionListener(e -> {
                Color actual;
                try {
                    actual = Color.decode(tf.getText().trim());
                } catch (NumberFormatException ex) {
                    actual = Tema.ROJO;
                }
                Color c = JColorChooser.showDialog(this, "Color de la ficha", actual);
                if (c != null) {
                    tf.setText(String.format("#%02x%02x%02x", c.getRed(), c.getGreen(), c.getBlue()));
                }
            });
            b.add(elegir);
        }
        p.add(b, BorderLayout.EAST);
        return p;
    }

    private static JTextArea area(String texto, int filas) {
        JTextArea a = new JTextArea(texto, filas, 40);
        a.setLineWrap(true);
        a.setWrapStyleWord(true);
        a.setFont(Tema.NORMAL);
        a.setBorder(BorderFactory.createEmptyBorder(6, 8, 6, 8));
        return a;
    }

    private static boolean esListaSimple(List<?> l) {
        for (Object o : l) {
            if (o instanceof Map || o instanceof List) {
                return false;
            }
        }
        return true;
    }

    private static List<String> textos(List<?> l) {
        List<String> r = new ArrayList<>();
        for (Object o : l) {
            r.add(o == null ? "" : o.toString());
        }
        return r;
    }

    /** Vuelca los campos del formulario al documento, respetando los tipos originales. */
    private void leerFormulario() {
        for (Map.Entry<String, JComponent> e : campos.entrySet()) {
            String k = e.getKey();
            JComponent c = e.getValue();
            Object antes = doc.get(k);
            if (c instanceof JCheckBox cb) {
                doc.put(k, cb.isSelected());
            } else if (c instanceof JTextArea a && Boolean.TRUE.equals(a.getClientProperty("json"))) {
                doc.put(k, Json.leer(a.getText()));
            } else if (c instanceof JTextArea a) {
                String txt = a.getText();
                if (antes instanceof List || LINEAS.contains(k)) {
                    List<String> partes = new ArrayList<>();
                    String separador = k.equals("cuerpo") ? "\\n\\s*\\n|\\n" : "\\n";
                    for (String p : txt.split(separador)) {
                        if (!p.isBlank()) {
                            partes.add(p.trim());
                        }
                    }
                    doc.put(k, partes);
                } else {
                    doc.put(k, txt);
                }
            } else if (c instanceof JTextField tf) {
                String txt = tf.getText().trim();
                if (Boolean.TRUE.equals(tf.getClientProperty("numero"))) {
                    try {
                        doc.put(k, txt.contains(".") ? (Object) Double.parseDouble(txt) : (Object) Long.parseLong(txt.isEmpty() ? "0" : txt));
                    } catch (NumberFormatException ex) {
                        throw new IllegalArgumentException("El campo «" + k + "» debe ser un número");
                    }
                } else if (antes instanceof List) {
                    List<String> partes = new ArrayList<>();
                    for (String p : txt.split(",")) {
                        if (!p.isBlank()) {
                            partes.add(p.trim());
                        }
                    }
                    doc.put(k, partes);
                } else {
                    doc.put(k, txt);
                }
            }
        }
    }

    private void anadirCampo() {
        String nombre = javax.swing.JOptionPane.showInputDialog(this, "Nombre del nuevo campo (ej. «director», «anio», «etiquetas»):");
        if (nombre == null || nombre.isBlank()) {
            return;
        }
        String[] tipos = {"Texto", "Texto largo", "Número", "Sí / No", "Lista de textos"};
        int t = javax.swing.JOptionPane.showOptionDialog(this, "Tipo de dato:", "Nuevo campo", 0, javax.swing.JOptionPane.QUESTION_MESSAGE, null, tipos, tipos[0]);
        if (t < 0) {
            return;
        }
        leerFormulario();
        Object valor = switch (t) {
            case 1 -> "\n";
            case 2 -> 0L;
            case 3 -> Boolean.TRUE;
            case 4 -> new ArrayList<>();
            default -> "";
        };
        doc.put(nombre.trim(), valor);
        construirFormulario();
    }

    private void guardar() {
        String id = campoId.getText().trim().toLowerCase();
        if (!ID.matcher(id).matches()) {
            Tarea.error(this, "El identificador solo puede tener minúsculas sin tildes, números, «-» y «_» (máx. 64). Ejemplo: «jill-valentine».");
            return;
        }
        try {
            if (pestanas.getSelectedIndex() == 1) {
                doc = Json.leerObjeto(json.getText());
                doc.remove("id");
            } else {
                leerFormulario();
            }
        } catch (IllegalArgumentException ex) {
            Tarea.error(this, ex.getMessage());
            return;
        }
        Map<String, Object> enviar = doc;
        Tarea.ejecutar(this, "Guardando " + coleccion + "/" + id + "…", () -> {
            if (nuevo) {
                try {
                    cliente.get("/api/admin/db/" + coleccion + "/" + id);
                    throw new Cliente.ErrorApi(409, "Ya existe un documento con el identificador «" + id + "». Elige otro.");
                } catch (Cliente.ErrorApi e) {
                    if (e.codigo != 404) {
                        throw e;
                    }
                }
            }
            return cliente.put("/api/admin/db/" + coleccion + "/" + id, enviar);
        }, r -> {
            App.estado("Guardado " + coleccion + "/" + id);
            dispose();
            if (alGuardar != null) {
                alGuardar.accept(Json.objeto(r, "documento"));
            }
        });
    }

    /** Abre el editor (atajo). */
    static void abrir(JComponent desde, Cliente cliente, String coleccion, String id, Map<String, Object> doc, Consumer<Map<String, Object>> alGuardar) {
        new EditorDocumento(SwingUtilities.getWindowAncestor(desde), cliente, coleccion, id, doc, alGuardar).setVisible(true);
    }
}
