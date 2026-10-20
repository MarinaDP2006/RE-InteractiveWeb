/*
 * ============================================================================
 *  PanelCopias.java — Copias de seguridad.
 * ============================================================================
 *  · En el servidor: crear, descargar, restaurar y borrar (el servidor hace
 *    además una automática cada 24 h).
 *  · En tu PC: copia completa (con imágenes y vídeos) y restauración desde
 *    un archivo. La app guarda una copia automática cada vez que te conectas.
 *
 *  IMPORTANTE en Render gratuito sin PostgreSQL: el disco se borra en cada
 *  reinicio. Las copias de tu PC son las que te salvan: restaura la última.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JFileChooser;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTable;
import javax.swing.SwingUtilities;
import javax.swing.filechooser.FileNameExtensionFilter;
import java.awt.BorderLayout;
import java.awt.Desktop;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

final class PanelCopias extends JPanel implements VentanaPrincipal.Seccion {

    private static final long serialVersionUID = 1L;

    private final Cliente cliente;
    private final ModeloTabla modelo = new ModeloTabla(List.of(
            ModeloTabla.col("Copia en el servidor", d -> d.get("nombre")),
            ModeloTabla.col("Fecha", d -> Json.texto(d, "fecha", "").replace("T", " ").replaceAll("\\..*|Z$", ""), 170),
            ModeloTabla.col("Tamaño", d -> Tema.bytes(Json.numero(d, "bytes", 0)), 100)));
    private final JTable tabla = modelo.crearTabla();
    private final JLabel carpeta = Tema.etiqueta("");
    private final JCheckBox auto = new JCheckBox("Hacer una copia completa en mi PC cada vez que me conecto");

    PanelCopias(Cliente cliente) {
        super(new BorderLayout(0, 12));
        this.cliente = cliente;
        setOpaque(false);
        add(Tema.cabecera("Copias de seguridad",
                "Guarda y recupera toda la base de datos (wiki, juego, configuración) y, si quieres, también las imágenes y vídeos subidos."), BorderLayout.NORTH);

        JPanel servidor = new JPanel(new BorderLayout(0, 8));
        servidor.setOpaque(false);
        JPanel bs = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 0));
        bs.setOpaque(false);
        JButton crear = Tema.botonRojo("Crear copia ahora");
        JButton descargar = Tema.boton("Descargar a mi PC");
        JButton restaurar = Tema.boton("Restaurar esta copia…");
        JButton borrar = Tema.boton("Borrar");
        bs.add(crear);
        bs.add(descargar);
        bs.add(restaurar);
        bs.add(borrar);
        servidor.add(bs, BorderLayout.NORTH);
        servidor.add(Tema.scroll(tabla), BorderLayout.CENTER);

        JPanel pc = Tema.tarjeta();
        pc.setLayout(new BorderLayout(0, 10));
        JLabel t = new JLabel("En tu PC");
        t.setFont(Tema.SUBTITULO);
        t.setForeground(Tema.TEXTO);
        pc.add(t, BorderLayout.NORTH);
        JPanel bp = new JPanel(new GridLayout(0, 1, 0, 8));
        bp.setOpaque(false);
        JButton completa = Tema.botonRojo("Descargar copia COMPLETA (con imágenes y vídeos)…");
        JButton soloDatos = Tema.boton("Descargar solo los datos (más ligera)…");
        JButton desdeArchivo = Tema.boton("Restaurar desde un archivo de mi PC…");
        JButton abrirCarpeta = Tema.boton("Abrir la carpeta de copias automáticas");
        JButton cambiarCarpeta = Tema.boton("Cambiar la carpeta…");
        bp.add(completa);
        bp.add(soloDatos);
        bp.add(desdeArchivo);
        bp.add(auto);
        bp.add(carpeta);
        bp.add(abrirCarpeta);
        bp.add(cambiarCarpeta);
        pc.add(bp, BorderLayout.CENTER);
        pc.add(Tema.etiqueta("<html><span style='font-size:10px'>Restaurar sustituye las colecciones incluidas en la copia. Antes, el servidor guarda una copia del estado actual por si te equivocas.</span></html>"), BorderLayout.SOUTH);

        JPanel centro = new JPanel(new BorderLayout(16, 0));
        centro.setOpaque(false);
        centro.add(servidor, BorderLayout.CENTER);
        pc.setPreferredSize(new java.awt.Dimension(420, 0));
        centro.add(pc, BorderLayout.EAST);
        add(centro, BorderLayout.CENTER);

        crear.addActionListener(e -> Tarea.ejecutar(this, "Creando copia…", () -> cliente.post("/api/admin/copias", null), r -> {
            App.estado("Copia creada: " + r.get("nombre"));
            refrescar();
        }));
        descargar.addActionListener(e -> {
            Map<String, Object> d = ModeloTabla.seleccion(tabla);
            if (d != null) {
                String n = Json.texto(d, "nombre", "copia.zip");
                guardarEnPC(n, () -> cliente.descargar("/api/admin/copias/" + Cliente.codificar(n)));
            }
        });
        restaurar.addActionListener(e -> {
            Map<String, Object> d = ModeloTabla.seleccion(tabla);
            if (d == null) {
                return;
            }
            String n = Json.texto(d, "nombre", "");
            if (Tarea.confirmar(this, "¿Restaurar la copia <b>" + Tarea.escapar(n) + "</b>? Los datos actuales se sustituirán por los de esa copia.")) {
                Tarea.ejecutar(this, "Restaurando…", () -> cliente.post("/api/admin/copias/" + Cliente.codificar(n) + "/restaurar", null), r -> {
                    Tarea.info(this, "Copia restaurada (" + Json.numero(r, "restaurados", 0) + " colecciones).");
                    refrescar();
                });
            }
        });
        borrar.addActionListener(e -> {
            Map<String, Object> d = ModeloTabla.seleccion(tabla);
            if (d != null && Tarea.confirmar(this, "¿Borrar la copia del servidor?")) {
                Tarea.ejecutar(this, "Borrando…", () -> cliente.delete("/api/admin/copias/" + Cliente.codificar(Json.texto(d, "nombre", ""))), r -> refrescar());
            }
        });
        completa.addActionListener(e -> guardarEnPC("umbrella-completa-" + LocalDate.now() + ".zip", () -> cliente.descargar("/api/admin/exportar?archivos=true")));
        soloDatos.addActionListener(e -> guardarEnPC("umbrella-datos-" + LocalDate.now() + ".zip", () -> cliente.descargar("/api/admin/exportar?archivos=false")));
        desdeArchivo.addActionListener(e -> restaurarDesdePC());
        auto.addActionListener(e -> App.PREFS.copiaAlConectar(auto.isSelected()));
        abrirCarpeta.addActionListener(e -> {
            try {
                Files.createDirectories(App.PREFS.carpetaCopias());
                Desktop.getDesktop().open(App.PREFS.carpetaCopias().toFile());
            } catch (Exception ex) {
                Tarea.error(this, ex.getMessage());
            }
        });
        cambiarCarpeta.addActionListener(e -> {
            JFileChooser fc = new JFileChooser(App.PREFS.carpetaCopias().toFile());
            fc.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
            if (fc.showOpenDialog(SwingUtilities.getWindowAncestor(this)) == JFileChooser.APPROVE_OPTION) {
                App.PREFS.carpetaCopias(fc.getSelectedFile().toPath());
                pintarCarpeta();
            }
        });
    }

    private void pintarCarpeta() {
        carpeta.setText("<html><span style='font-size:10px'>Carpeta: " + Tarea.escapar(App.PREFS.carpetaCopias().toString()) + "</span></html>");
        auto.setSelected(App.PREFS.copiaAlConectar());
    }

    private void guardarEnPC(String nombre, Tarea.Trabajo<byte[]> descarga) {
        JFileChooser fc = new JFileChooser(App.PREFS.carpetaCopias().toFile());
        fc.setSelectedFile(new File(App.PREFS.carpetaCopias().toFile(), nombre));
        if (fc.showSaveDialog(SwingUtilities.getWindowAncestor(this)) != JFileChooser.APPROVE_OPTION) {
            return;
        }
        Path destino = fc.getSelectedFile().toPath();
        Tarea.ejecutar(this, "Descargando la copia…", () -> {
            byte[] zip = descarga.hacer();
            if (destino.getParent() != null) {
                Files.createDirectories(destino.getParent());
            }
            Files.write(destino, zip);
            return zip.length;
        }, n -> Tarea.info(this, "Copia guardada (" + Tema.bytes(n) + "):<br><b>" + Tarea.escapar(destino.toString()) + "</b>"));
    }

    private void restaurarDesdePC() {
        JFileChooser fc = new JFileChooser(App.PREFS.carpetaCopias().toFile());
        fc.setFileFilter(new FileNameExtensionFilter("Copias de seguridad (.zip)", "zip"));
        if (fc.showOpenDialog(SwingUtilities.getWindowAncestor(this)) != JFileChooser.APPROVE_OPTION) {
            return;
        }
        File f = fc.getSelectedFile();
        if (!Tarea.confirmar(this, "¿Restaurar <b>" + Tarea.escapar(f.getName()) + "</b> en el servidor " + Tarea.escapar(cliente.base()) + "?<br>"
                + "Las colecciones de la copia sustituirán a las actuales.")) {
            return;
        }
        Tarea.ejecutar(this, "Subiendo y restaurando la copia…", () -> cliente.subir("POST", "/api/admin/restaurar", Files.readAllBytes(f.toPath()), "application/zip"), r -> {
            Tarea.info(this, "Restauración completada: " + Json.numero(r, "restaurados", 0) + " elementos.");
            refrescar();
        });
    }

    @Override
    public void refrescar() {
        pintarCarpeta();
        Tarea.ejecutar(this, "Cargando copias…", () -> cliente.get("/api/admin/copias"), r -> modelo.datos(Cliente.lista(r, "copias")));
    }
}
