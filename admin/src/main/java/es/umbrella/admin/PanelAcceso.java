/*
 * ============================================================================
 *  PanelAcceso.java — Abrir o cerrar la wiki al público.
 * ============================================================================
 *  Cerrado = el público ve una página de mantenimiento con tu mensaje.
 *  Tú sigues pudiendo verlo con «Ver como admin».
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Font;
import java.awt.GridLayout;
import java.util.LinkedHashMap;
import java.util.Map;

final class PanelAcceso extends JPanel implements VentanaPrincipal.Seccion {

    private static final long serialVersionUID = 1L;

    private final Cliente cliente;
    private final JCheckBox wiki = interruptor("La wiki está abierta al público");
    private final JTextArea msgWiki = area();
    private final JTextField anuncio = new JTextField();
    private Map<String, Object> actual = new LinkedHashMap<>();

    PanelAcceso(Cliente cliente) {
        super(new BorderLayout(0, 14));
        this.cliente = cliente;
        setOpaque(false);
        JButton guardar = Tema.botonRojo("Guardar cambios");
        guardar.addActionListener(e -> guardar());
        add(Tema.cabecera("Acceso público",
                "Abre o cierra la wiki. Cuando está cerrada, los visitantes ven una página de mantenimiento con tu mensaje. "
                        + "Tú puedes seguir viéndola con «Ver como admin».", guardar), BorderLayout.NORTH);

        JPanel cuerpo = new JPanel(new GridLayout(1, 1, 16, 0));
        cuerpo.setOpaque(false);
        cuerpo.add(bloque("WIKI", wiki, msgWiki, "/wiki/"));

        JPanel pie = Tema.tarjeta();
        pie.setLayout(new BorderLayout(10, 8));
        JLabel t = new JLabel("Anuncio en el portal (opcional)");
        t.setFont(Tema.SUBTITULO);
        t.setForeground(Tema.TEXTO);
        pie.add(t, BorderLayout.NORTH);
        pie.add(anuncio, BorderLayout.CENTER);
        pie.add(Tema.etiqueta("<html><span style='font-size:10px'>Aparece arriba en la página de inicio. Ej.: «¡Nuevo archivo de Requiem disponible!». Déjalo vacío para no mostrar nada.</span></html>"), BorderLayout.SOUTH);

        JPanel todo = new JPanel(new BorderLayout(0, 16));
        todo.setOpaque(false);
        todo.add(cuerpo, BorderLayout.CENTER);
        todo.add(pie, BorderLayout.SOUTH);
        add(todo, BorderLayout.CENTER);
    }

    private JPanel bloque(String titulo, JCheckBox interruptor, JTextArea mensaje, String ruta) {
        JPanel t = Tema.tarjeta();
        t.setLayout(new BorderLayout(0, 12));
        JLabel l = new JLabel(titulo);
        l.setFont(Tema.fuente(Font.BOLD, 26));
        l.setForeground(Tema.TEXTO);
        JPanel arriba = new JPanel(new BorderLayout(0, 10));
        arriba.setOpaque(false);
        arriba.add(l, BorderLayout.NORTH);
        arriba.add(interruptor, BorderLayout.CENTER);
        t.add(arriba, BorderLayout.NORTH);
        JPanel medio = new JPanel(new BorderLayout(0, 6));
        medio.setOpaque(false);
        medio.add(Tema.etiqueta("Mensaje de mantenimiento (lo que verá el público si está cerrado):"), BorderLayout.NORTH);
        medio.add(Tema.scroll(mensaje), BorderLayout.CENTER);
        t.add(medio, BorderLayout.CENTER);
        JPanel botones = new JPanel(new GridLayout(1, 2, 8, 0));
        botones.setOpaque(false);
        JButton ver = Tema.boton("Ver en el navegador");
        ver.addActionListener(e -> VentanaPrincipal.abrir(cliente.url(ruta)));
        JButton admin = Tema.boton("Ver como admin");
        admin.addActionListener(e -> {
            if (javax.swing.SwingUtilities.getWindowAncestor(this) instanceof VentanaPrincipal v) {
                v.verComoAdmin(ruta);
            }
        });
        botones.add(ver);
        botones.add(admin);
        t.add(botones, BorderLayout.SOUTH);
        interruptor.addActionListener(e -> pintarInterruptor(interruptor));
        return t;
    }

    private static JCheckBox interruptor(String texto) {
        JCheckBox c = new JCheckBox(texto);
        c.setFont(Tema.fuente(Font.BOLD, 15));
        c.setOpaque(true);
        c.setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));
        c.setBorderPainted(true);
        return c;
    }

    private static void pintarInterruptor(JCheckBox c) {
        boolean on = c.isSelected();
        c.setBackground(on ? new Color(0x123a1c) : new Color(0x3a0d12));
        c.setForeground(on ? new Color(0x8ef0a6) : new Color(0xffb3bb));
        String base = c.getText().replaceAll(" (abierta|abierto|CERRADA|CERRADO).*$", "");
        boolean fem = base.contains("wiki");
        c.setText(base + (on ? (fem ? " abierta al público" : " abierto al público") : (fem ? " CERRADA (mantenimiento)" : " CERRADO (mantenimiento)")));
    }

    private static JTextArea area() {
        JTextArea a = new JTextArea(4, 30);
        a.setLineWrap(true);
        a.setWrapStyleWord(true);
        a.setFont(Tema.NORMAL);
        return a;
    }

    @Override
    public void refrescar() {
        Tarea.ejecutar(this, "Cargando el acceso…", () -> cliente.get("/api/admin/acceso"), r -> {
            actual = Json.objeto(r, "acceso");
            if (actual == null) {
                actual = new LinkedHashMap<>();
            }
            wiki.setSelected(Json.logico(Json.objeto(actual, "wiki"), "publica", true));
            msgWiki.setText(Json.texto(Json.objeto(actual, "wiki"), "mensaje", ""));
            anuncio.setText(Json.texto(actual, "anuncio", ""));
            pintarInterruptor(wiki);
        });
    }

    private void guardar() {
        Map<String, Object> a = new LinkedHashMap<>(actual);
        a.remove("id");
        a.remove("_actualizado");
        a.remove("juego");
        Map<String, Object> w = new LinkedHashMap<>();
        w.put("publica", wiki.isSelected());
        w.put("mensaje", msgWiki.getText().trim());
        a.put("wiki", w);
        a.put("anuncio", anuncio.getText().trim());
        Tarea.ejecutar(this, "Guardando el acceso…", () -> cliente.put("/api/admin/acceso", a), r -> {
            actual = Json.objeto(r, "acceso");
            Tarea.info(this, "Cambios guardados. La web ya muestra el nuevo estado.<br>Wiki: <b>" + (wiki.isSelected() ? "abierta" : "cerrada") + "</b>");
        });
    }
}
