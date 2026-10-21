/*
 * ============================================================================
 *  VentanaPrincipal.java — El gestor: menú lateral + paneles + barra de estado.
 * ============================================================================
 */
package es.umbrella.admin;

import javax.swing.BorderFactory;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JComponent;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JToggleButton;
import javax.swing.ButtonGroup;
import javax.swing.SwingConstants;
import javax.swing.WindowConstants;
import java.awt.BorderLayout;
import java.awt.CardLayout;
import java.awt.Color;
import java.awt.Cursor;
import java.awt.Desktop;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridLayout;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class VentanaPrincipal extends JFrame {

    private static final long serialVersionUID = 1L;

    /** Un panel del gestor. refrescar() se llama cada vez que se muestra. */
    interface Seccion {
        void refrescar();
    }

    private final Cliente cliente;
    private final CardLayout tarjetas = new CardLayout();
    private final JPanel centro = new JPanel(tarjetas);
    private final Map<String, JComponent> paneles = new LinkedHashMap<>();
    private final List<JToggleButton> botonesMenu = new ArrayList<>();

    VentanaPrincipal(Cliente cliente) {
        super("Umbrella Admin · " + cliente.base());
        this.cliente = cliente;
        setIconImages(App.iconos());
        setDefaultCloseOperation(WindowConstants.DO_NOTHING_ON_CLOSE);
        setMinimumSize(new Dimension(1100, 700));
        setSize(1360, 860);
        setLocationRelativeTo(null);
        addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                salir();
            }
        });
        cliente.alCaducar = () -> javax.swing.SwingUtilities.invokeLater(() -> {
            Tarea.error(this, "La sesión ha caducado. Vuelve a iniciar sesión.");
            dispose();
            new VentanaLogin().setVisible(true);
        });

        JPanel raiz = new JPanel(new BorderLayout());
        raiz.setBackground(Tema.FONDO);
        setContentPane(raiz);

        // ---------------- Menú lateral ----------------
        JPanel lateral = new JPanel(new BorderLayout());
        lateral.setBackground(new Color(0x09090b));
        lateral.setPreferredSize(new Dimension(236, 0));
        lateral.setBorder(BorderFactory.createMatteBorder(0, 0, 0, 1, Tema.BORDE));

        JPanel marca = new JPanel(new BorderLayout(10, 0));
        marca.setOpaque(false);
        marca.setBorder(BorderFactory.createEmptyBorder(18, 16, 18, 12));
        marca.add(new JLabel(new ImageIcon(Tema.logo(40))), BorderLayout.WEST);
        JLabel nombre = new JLabel("<html><b style='font-size:13px'>UMBRELLA</b><br><span style='color:#ff2a3d;font-size:9px'>ADMIN · v" + App.VERSION + "</span></html>");
        nombre.setForeground(Tema.TEXTO);
        marca.add(nombre, BorderLayout.CENTER);
        lateral.add(marca, BorderLayout.NORTH);

        JPanel menu = new JPanel(new GridLayout(0, 1, 0, 2));
        menu.setOpaque(false);
        menu.setBorder(BorderFactory.createEmptyBorder(4, 10, 4, 10));
        ButtonGroup grupo = new ButtonGroup();

        anadir(menu, grupo, "resumen", "◉  Panel", new PanelResumen(cliente));
        anadir(menu, grupo, "acceso", "⛨  Acceso público", new PanelAcceso(cliente));
        anadir(menu, grupo, "wiki", "☰  Wiki", new PanelWiki(cliente));
        anadir(menu, grupo, "archivos", "▣  Imágenes y vídeos", new PanelArchivos(cliente));
        anadir(menu, grupo, "db", "⛁  Base de datos", new PanelBaseDatos(cliente));
        anadir(menu, grupo, "copias", "⟲  Copias de seguridad", new PanelCopias(cliente));
        anadir(menu, grupo, "registro", "≡  Registro de acciones", new PanelRegistro(cliente));
        anadir(menu, grupo, "ajustes", "⚙  Ajustes", new PanelAjustes(cliente, this));
        JPanel envoltorio = new JPanel(new BorderLayout());
        envoltorio.setOpaque(false);
        envoltorio.add(menu, BorderLayout.NORTH);
        lateral.add(envoltorio, BorderLayout.CENTER);

        JPanel pie = new JPanel(new GridLayout(0, 1, 0, 6));
        pie.setOpaque(false);
        pie.setBorder(BorderFactory.createEmptyBorder(10, 14, 16, 14));
        JButton verWeb = Tema.boton("Abrir la web");
        verWeb.addActionListener(e -> abrir(cliente.url("/")));
        JButton verAdmin = Tema.boton("Ver como admin");
        verAdmin.setToolTipText("Abre la web en el navegador aunque esté cerrada al público");
        verAdmin.addActionListener(e -> verComoAdmin("/"));
        JButton cerrar = Tema.boton("Cerrar sesión");
        cerrar.addActionListener(e -> {
            Tarea.ejecutar(this, "Cerrando sesión…", () -> {
                cliente.cerrarSesion();
                return true;
            }, r -> {
                dispose();
                new VentanaLogin().setVisible(true);
            });
        });
        JLabel quien = Tema.etiqueta("<html><span style='font-size:9px'>Conectado como <b>" + Tarea.escapar(cliente.usuario()) + "</b><br>" + Tarea.escapar(cliente.base()) + "</span></html>");
        pie.add(quien);
        pie.add(verWeb);
        pie.add(verAdmin);
        pie.add(cerrar);
        lateral.add(pie, BorderLayout.SOUTH);
        raiz.add(lateral, BorderLayout.WEST);

        // ---------------- Centro ----------------
        centro.setBackground(Tema.FONDO);
        for (Map.Entry<String, JComponent> e : paneles.entrySet()) {
            centro.add(e.getValue(), e.getKey());
        }
        raiz.add(centro, BorderLayout.CENTER);

        // ---------------- Barra de estado ----------------
        JLabel estado = new JLabel("  Listo");
        estado.setFont(Tema.PEQUENA);
        estado.setForeground(Tema.TEXTO_SUAVE);
        estado.setOpaque(true);
        estado.setBackground(new Color(0x08080a));
        estado.setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Tema.BORDE));
        estado.setPreferredSize(new Dimension(0, 24));
        App.barra(estado);
        raiz.add(estado, BorderLayout.SOUTH);

        mostrar("resumen");
        copiaAlConectar();
    }

    private void anadir(JPanel menu, ButtonGroup grupo, String id, String texto, JComponent panel) {
        JToggleButton b = new JToggleButton(texto);
        b.setHorizontalAlignment(SwingConstants.LEFT);
        b.setFont(Tema.fuente(Font.PLAIN, 13.5f));
        b.setFocusPainted(false);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        b.setPreferredSize(new Dimension(0, 38));
        b.addActionListener(e -> mostrar(id));
        b.putClientProperty("id", id);
        grupo.add(b);
        botonesMenu.add(b);
        menu.add(b);
        JPanel envoltorio = new JPanel(new BorderLayout());
        envoltorio.setBackground(Tema.FONDO);
        envoltorio.setBorder(BorderFactory.createEmptyBorder(22, 26, 18, 26));
        envoltorio.add(panel, BorderLayout.CENTER);
        envoltorio.putClientProperty("seccion", panel);
        paneles.put(id, envoltorio);
    }

    void mostrar(String id) {
        tarjetas.show(centro, id);
        for (JToggleButton b : botonesMenu) {
            b.setSelected(id.equals(b.getClientProperty("id")));
        }
        Object s = paneles.get(id).getClientProperty("seccion");
        if (s instanceof Seccion sec) {
            sec.refrescar();
        }
    }

    static void abrir(String url) {
        try {
            Desktop.getDesktop().browse(URI.create(url));
        } catch (Exception e) {
            Tarea.error(null, "No se pudo abrir el navegador: " + e.getMessage() + "\n" + url);
        }
    }

    /** Abre la web con permiso de administrador (ticket de un solo uso). */
    void verComoAdmin(String destino) {
        Tarea.ejecutar(this, "Pidiendo acceso de vista previa…", () -> cliente.post("/api/admin/ticket", null), r ->
                abrir(cliente.url("/api/vista?ticket=" + Cliente.codificar(String.valueOf(r.get("ticket"))) + "&destino=" + Cliente.codificar(destino))));
    }

    /** Copia de seguridad automática al conectar (en Documentos\UmbrellaAdmin\copias). */
    private void copiaAlConectar() {
        if (!App.PREFS.copiaAlConectar()) {
            return;
        }
        Tarea.ejecutar(this, "Copia de seguridad automática en tu PC…", () -> {
            byte[] zip = cliente.descargar("/api/admin/exportar?archivos=true");
            Path carpeta = App.PREFS.carpetaCopias();
            Files.createDirectories(carpeta);
            String host = URI.create(cliente.base()).getHost().replaceAll("[^a-zA-Z0-9.-]", "_");
            Path f = carpeta.resolve("umbrella-" + host + "-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".zip");
            Files.write(f, zip);
            // Se conservan las 25 últimas copias automáticas de este servidor.
            try (var s = Files.list(carpeta)) {
                List<Path> mias = s.filter(p -> p.getFileName().toString().startsWith("umbrella-" + host + "-")).sorted().toList();
                for (int i = 0; i < mias.size() - 25; i++) {
                    Files.deleteIfExists(mias.get(i));
                }
            }
            return f;
        }, f -> App.estado("Copia de seguridad guardada en tu PC: " + f), err -> App.estado("No se pudo hacer la copia automática: " + err.getMessage()));
    }

    private void salir() {
        if (ServidorLocal.enMarcha() && !Tarea.confirmar(this, "El servidor local está en marcha. Si cierras la app, se detendrá. ¿Salir?")) {
            return;
        }
        ServidorLocal.detener();
        dispose();
        System.exit(0);
    }
}
