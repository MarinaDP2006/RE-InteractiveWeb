/*
 * ============================================================================
 *  VentanaLogin.java — Acceso del administrador.
 * ============================================================================
 *  · Servidor: tu web en Render (https://...onrender.com) o tu PC.
 *  · «Usar el servidor de este PC»: arranca el servidor integrado y rellena
 *    los datos de la primera vez automáticamente.
 * ============================================================================
 */
package es.umbrella.admin;

import javax.swing.BorderFactory;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.WindowConstants;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GradientPaint;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.RadialGradientPaint;
import java.awt.geom.Point2D;

final class VentanaLogin extends JFrame {

    private static final long serialVersionUID = 1L;

    private final JComboBox<String> servidor = new JComboBox<>();
    private final JTextField usuario = new JTextField(18);
    private final JPasswordField clave = new JPasswordField(18);
    private final JLabel mensaje = new JLabel(" ");
    private final JButton entrar = Tema.botonRojo("Entrar");
    private final JButton local = Tema.boton("Usar el servidor de este PC");

    VentanaLogin() {
        super("Umbrella Admin · Acceso");
        setIconImages(App.iconos());
        setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        setResizable(false);

        JPanel fondo = new JPanel(new BorderLayout()) {
            private static final long serialVersionUID = 1L;

            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g;
                g2.setPaint(new GradientPaint(0, 0, new Color(0x120507), 0, getHeight(), Tema.FONDO));
                g2.fillRect(0, 0, getWidth(), getHeight());
                g2.setPaint(new RadialGradientPaint(new Point2D.Float(getWidth() / 2f, 90), 260,
                        new float[]{0f, 1f}, new Color[]{new Color(200, 16, 46, 60), new Color(0, 0, 0, 0)}));
                g2.fillRect(0, 0, getWidth(), getHeight());
            }
        };
        fondo.setBorder(BorderFactory.createEmptyBorder(28, 40, 24, 40));
        setContentPane(fondo);

        JPanel cab = new JPanel(new BorderLayout(0, 6));
        cab.setOpaque(false);
        JLabel logo = new JLabel(new ImageIcon(Tema.logo(96)));
        cab.add(logo, BorderLayout.NORTH);
        JLabel t = new JLabel("UMBRELLA ADMIN", SwingConstants.CENTER);
        t.setFont(Tema.fuente(Font.BOLD, 24));
        t.setForeground(Tema.TEXTO);
        cab.add(t, BorderLayout.CENTER);
        JLabel s = new JLabel("Gestión de la Wiki · acceso restringido", SwingConstants.CENTER);
        s.setForeground(Tema.ROJO_VIVO);
        s.setFont(Tema.PEQUENA);
        cab.add(s, BorderLayout.SOUTH);
        fondo.add(cab, BorderLayout.NORTH);

        JPanel form = new JPanel(new GridBagLayout());
        form.setOpaque(false);
        form.setBorder(BorderFactory.createEmptyBorder(22, 0, 8, 0));
        GridBagConstraints c = new GridBagConstraints();
        c.insets = new Insets(5, 4, 5, 4);
        c.fill = GridBagConstraints.HORIZONTAL;
        servidor.setEditable(true);
        for (String u : App.PREFS.servidores()) {
            servidor.addItem(u);
        }
        servidor.setPreferredSize(new Dimension(330, 30));
        usuario.setText(App.PREFS.usuario());
        fila(form, c, 0, "Servidor", servidor);
        fila(form, c, 1, "Usuario", usuario);
        fila(form, c, 2, "Contraseña", clave);
        c.gridx = 0;
        c.gridy = 3;
        c.gridwidth = 2;
        JLabel ayuda = Tema.etiqueta("<html><span style='font-size:9px'>En Render: la dirección de tu web (https://umbrella-archives.onrender.com).<br>"
                + "Si estaba dormido, la primera conexión puede tardar hasta un minuto.</span></html>");
        form.add(ayuda, c);
        c.gridy = 4;
        mensaje.setForeground(Tema.AMBAR);
        form.add(mensaje, c);
        fondo.add(form, BorderLayout.CENTER);

        JPanel botones = new JPanel(new BorderLayout(8, 8));
        botones.setOpaque(false);
        entrar.setPreferredSize(new Dimension(0, 38));
        botones.add(entrar, BorderLayout.NORTH);
        botones.add(local, BorderLayout.SOUTH);
        fondo.add(botones, BorderLayout.SOUTH);

        entrar.addActionListener(e -> entrar());
        clave.addActionListener(e -> entrar());
        local.addActionListener(e -> usarLocal());
        getRootPane().setDefaultButton(entrar);

        pack();
        setLocationRelativeTo(null);
        if (!usuario.getText().isBlank()) {
            clave.requestFocusInWindow();
        }
    }

    private static void fila(JPanel p, GridBagConstraints c, int y, String etiqueta, java.awt.Component campo) {
        c.gridx = 0;
        c.gridy = y;
        c.gridwidth = 1;
        c.weightx = 0;
        JLabel l = Tema.etiqueta(etiqueta);
        p.add(l, c);
        c.gridx = 1;
        c.weightx = 1;
        p.add(campo, c);
    }

    private void bloquear(boolean si, String texto) {
        entrar.setEnabled(!si);
        local.setEnabled(!si);
        mensaje.setText(texto == null ? " " : texto);
    }

    private void entrar() {
        String url = String.valueOf(servidor.getEditor().getItem()).trim();
        String u = usuario.getText().trim();
        String k = new String(clave.getPassword());
        if (url.isEmpty() || u.isEmpty() || k.isEmpty()) {
            mensaje.setText("Rellena el servidor, el usuario y la contraseña.");
            return;
        }
        Cliente cliente = new Cliente(url);
        bloquear(true, "Conectando con " + cliente.base() + "…");
        Tarea.ejecutar(this, "Conectando…", () -> {
            cliente.estado();          // despierta el servidor si estaba dormido
            cliente.iniciarSesion(u, k);
            return cliente;
        }, cli -> {
            App.PREFS.usarServidor(cli.base());
            App.PREFS.usuario(u);
            clave.setText("");
            dispose();
            new VentanaPrincipal(cli).setVisible(true);
        }, err -> bloquear(false, "<html>" + Tarea.escapar(err.getMessage()) + "</html>"));
    }

    private void usarLocal() {
        bloquear(true, "Arrancando el servidor local…");
        Tarea.ejecutar(this, "Arrancando el servidor local…", () -> ServidorLocal.arrancar(ServidorLocal.PUERTO), inst -> {
            servidor.getEditor().setItem("http://localhost:" + inst.puerto());
            String[] cred = ServidorLocal.credencialesIniciales();
            if (cred != null) {
                usuario.setText(cred[0]);
                clave.setText(cred[1]);
                bloquear(false, "<html>Servidor local en marcha. Contraseña inicial cargada: cámbiala en Ajustes.</html>");
            } else {
                bloquear(false, "Servidor local en marcha en http://localhost:" + inst.puerto());
                clave.requestFocusInWindow();
            }
        }, err -> bloquear(false, "<html>No se pudo arrancar: " + Tarea.escapar(err.getMessage())
                + "<br>Los puertos 8081 y 8091 están ocupados por otro programa.</html>"));
    }
}
