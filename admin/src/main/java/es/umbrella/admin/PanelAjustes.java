/*
 * ============================================================================
 *  PanelAjustes.java — Contraseña del administrador y servidor local.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import java.awt.BorderLayout;
import java.awt.Desktop;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.GridLayout;
import java.awt.Insets;
import java.nio.file.Files;
import java.util.LinkedHashMap;
import java.util.Map;

final class PanelAjustes extends JPanel implements VentanaPrincipal.Seccion {

    private static final long serialVersionUID = 1L;

    private final Cliente cliente;
    private final JPasswordField actual = new JPasswordField(20);
    private final JTextField usuario = new JTextField(20);
    private final JPasswordField nueva = new JPasswordField(20);
    private final JPasswordField repetir = new JPasswordField(20);
    private final JLabel estadoLocal = Tema.etiqueta(" ");

    PanelAjustes(Cliente cliente, VentanaPrincipal ventana) {
        super(new BorderLayout(0, 14));
        this.cliente = cliente;
        setOpaque(false);
        add(Tema.cabecera("Ajustes", "Credenciales del único administrador y servidor local de este PC."), BorderLayout.NORTH);

        JPanel cuerpo = new JPanel(new GridLayout(1, 2, 16, 0));
        cuerpo.setOpaque(false);

        // ---------------- Contraseña ----------------
        JPanel cred = Tema.tarjeta();
        cred.setLayout(new GridBagLayout());
        GridBagConstraints c = new GridBagConstraints();
        c.insets = new Insets(6, 6, 6, 6);
        c.fill = GridBagConstraints.HORIZONTAL;
        c.gridx = 0;
        c.gridy = 0;
        c.gridwidth = 2;
        JLabel t = new JLabel("Usuario y contraseña del administrador");
        t.setFont(Tema.SUBTITULO);
        t.setForeground(Tema.TEXTO);
        cred.add(t, c);
        c.gridy++;
        cred.add(Tema.etiqueta("<html><span style='font-size:10px'>Solo existe un administrador para la wiki y el juego. "
                + "Al cambiar la contraseña se cierran las demás sesiones abiertas.<br>Mínimo 10 caracteres. Usa letras, números y símbolos.</span></html>"), c);
        c.gridwidth = 1;
        fila(cred, c, "Contraseña actual", actual);
        fila(cred, c, "Nuevo usuario (opcional)", usuario);
        fila(cred, c, "Nueva contraseña", nueva);
        fila(cred, c, "Repite la nueva", repetir);
        c.gridy++;
        c.gridx = 1;
        JButton cambiar = Tema.botonRojo("Cambiar credenciales");
        cambiar.addActionListener(e -> cambiar());
        cred.add(cambiar, c);
        c.gridy++;
        c.weighty = 1;
        cred.add(new JLabel(), c);
        cuerpo.add(cred);

        // ---------------- Servidor local ----------------
        JPanel local = Tema.tarjeta();
        local.setLayout(new BorderLayout(0, 10));
        JLabel tl = new JLabel("Servidor local (este PC)");
        tl.setFont(Tema.SUBTITULO);
        tl.setForeground(Tema.TEXTO);
        local.add(tl, BorderLayout.NORTH);
        JPanel bl = new JPanel(new GridLayout(0, 1, 0, 8));
        bl.setOpaque(false);
        bl.add(Tema.etiqueta("<html>La app lleva dentro la web completa. Puedes arrancarla en tu PC para trabajar sin Internet o probar cambios. "
                + "Sus datos son independientes de los de Render (usa las copias de seguridad para pasar datos de uno a otro).</html>"));
        JButton arrancar = Tema.botonRojo("Arrancar en http://localhost:8080");
        JButton detener = Tema.boton("Detener");
        JButton abrir = Tema.boton("Abrir en el navegador");
        JButton carpeta = Tema.boton("Abrir la carpeta de datos local");
        bl.add(arrancar);
        bl.add(detener);
        bl.add(abrir);
        bl.add(carpeta);
        bl.add(estadoLocal);
        local.add(bl, BorderLayout.CENTER);
        JLabel info = Tema.etiqueta("<html><span style='font-size:10px'>Umbrella Admin v" + App.VERSION + " · Java " + System.getProperty("java.version")
                + "<br>Preferencias: " + Tarea.escapar(System.getProperty("user.home")) + "\\.umbrella-admin</span></html>");
        local.add(info, BorderLayout.SOUTH);
        cuerpo.add(local);

        arrancar.addActionListener(e -> Tarea.ejecutar(this, "Arrancando el servidor local…", () -> ServidorLocal.arrancar(8080), i -> {
            pintarLocal();
            String[] cr = ServidorLocal.credencialesIniciales();
            Tarea.info(this, "Servidor local en marcha en <b>http://localhost:" + i.puerto() + "</b>."
                    + (cr != null ? "<br><br>Primer acceso:<br>Usuario: <b>" + Tarea.escapar(cr[0]) + "</b><br>Contraseña: <b>" + Tarea.escapar(cr[1]) + "</b>" : ""));
        }));
        detener.addActionListener(e -> {
            ServidorLocal.detener();
            pintarLocal();
        });
        abrir.addActionListener(e -> VentanaPrincipal.abrir("http://localhost:" + (ServidorLocal.enMarcha() ? ServidorLocal.puerto() : 8080)));
        carpeta.addActionListener(e -> {
            try {
                Files.createDirectories(ServidorLocal.carpetaDatos());
                Desktop.getDesktop().open(ServidorLocal.carpetaDatos().toFile());
            } catch (Exception ex) {
                Tarea.error(this, ex.getMessage());
            }
        });
        add(cuerpo, BorderLayout.CENTER);
    }

    private static void fila(JPanel p, GridBagConstraints c, String etiqueta, java.awt.Component campo) {
        c.gridy++;
        c.gridx = 0;
        c.weightx = 0;
        p.add(Tema.etiqueta(etiqueta), c);
        c.gridx = 1;
        c.weightx = 1;
        p.add(campo, c);
    }

    private void pintarLocal() {
        estadoLocal.setText(ServidorLocal.enMarcha()
                ? "<html><b style='color:#4cc46a'>● En marcha</b> en http://localhost:" + ServidorLocal.puerto() + "</html>"
                : "<html><b style='color:#9c968c'>○ Detenido</b></html>");
    }

    private void cambiar() {
        String a = new String(actual.getPassword());
        String n = new String(nueva.getPassword());
        if (!n.equals(new String(repetir.getPassword()))) {
            Tarea.error(this, "Las dos contraseñas nuevas no coinciden.");
            return;
        }
        if (n.length() < 10) {
            Tarea.error(this, "La nueva contraseña debe tener al menos 10 caracteres.");
            return;
        }
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("actual", a);
        cuerpo.put("usuario", usuario.getText().trim());
        cuerpo.put("nueva", n);
        Tarea.ejecutar(this, "Cambiando las credenciales…", () -> cliente.put("/api/admin/clave", cuerpo), r -> {
            actual.setText("");
            nueva.setText("");
            repetir.setText("");
            App.PREFS.usuario(Json.texto(r, "usuario", cliente.usuario()));
            if (cliente.base().contains("localhost") || cliente.base().contains("127.0.0.1")) {
                ServidorLocal.borrarCredencialesIniciales();
            }
            Tarea.info(this, "Credenciales cambiadas. Usuario: <b>" + Tarea.escapar(Json.texto(r, "usuario", "")) + "</b>. Úsalas la próxima vez que entres.");
        });
    }

    @Override
    public void refrescar() {
        usuario.setText(cliente.usuario());
        pintarLocal();
    }
}
