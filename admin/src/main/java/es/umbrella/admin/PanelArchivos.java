/*
 * ============================================================================
 *  PanelArchivos.java — Imágenes, vídeos y audio subidos al servidor.
 * ============================================================================
 *  Sube archivos (también arrastrándolos a la ventana), copia su dirección
 *  para usarla en una ficha, ábrelos en el navegador o bórralos.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTable;
import javax.swing.SwingConstants;
import javax.swing.TransferHandler;
import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Image;
import java.awt.Toolkit;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.StringSelection;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;
import javax.swing.ImageIcon;

final class PanelArchivos extends JPanel implements VentanaPrincipal.Seccion {

    private static final long serialVersionUID = 1L;

    private final Cliente cliente;
    private final ModeloTabla modelo = new ModeloTabla(List.of(
            ModeloTabla.col("Archivo", d -> d.get("nombre")),
            ModeloTabla.col("Tipo", d -> d.get("tipo"), 110),
            ModeloTabla.col("Tamaño", d -> Tema.bytes(Json.numero(d, "bytes", 0)), 90),
            ModeloTabla.col("Dirección para usar en las fichas", d -> d.get("url"), 320)));
    private final JTable tabla = modelo.crearTabla();
    private final JLabel vista = new JLabel("Selecciona una imagen para verla", SwingConstants.CENTER);
    private final JLabel total = Tema.etiqueta(" ");

    PanelArchivos(Cliente cliente) {
        super(new BorderLayout(0, 10));
        this.cliente = cliente;
        setOpaque(false);
        JButton subir = Tema.botonRojo("Subir archivos…");
        subir.addActionListener(e -> Multimedia.subir(this, cliente, Multimedia.elegirDelPC(this, false, true), urls -> {
            refrescar();
            Tarea.info(this, urls.size() + " archivo(s) subido(s). Ya puedes usarlos en las fichas:<br><b>" + String.join("<br>", urls) + "</b>");
        }));
        add(Tema.cabecera("Imágenes y vídeos",
                "Sube imágenes (webp, png, jpg, gif), vídeos (mp4, webm) o audio. También puedes arrastrarlos aquí. "
                        + "Después copia su dirección y pégala en el campo «imagen» o «vídeo» de una ficha.", subir), BorderLayout.NORTH);

        JPanel barra = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 0));
        barra.setOpaque(false);
        JButton copiar = Tema.boton("Copiar dirección");
        JButton abrir = Tema.boton("Abrir en el navegador");
        JButton borrar = Tema.boton("Borrar");
        barra.add(copiar);
        barra.add(abrir);
        barra.add(borrar);
        barra.add(total);

        JPanel centro = new JPanel(new BorderLayout(12, 8));
        centro.setOpaque(false);
        centro.add(barra, BorderLayout.NORTH);
        centro.add(Tema.scroll(tabla), BorderLayout.CENTER);
        JPanel caja = Tema.tarjeta();
        caja.setLayout(new BorderLayout());
        caja.setPreferredSize(new Dimension(340, 0));
        vista.setForeground(Tema.TEXTO_SUAVE);
        caja.add(vista, BorderLayout.CENTER);
        centro.add(caja, BorderLayout.EAST);
        add(centro, BorderLayout.CENTER);

        copiar.addActionListener(e -> {
            Map<String, Object> d = ModeloTabla.seleccion(tabla);
            if (d != null) {
                Toolkit.getDefaultToolkit().getSystemClipboard().setContents(new StringSelection(Json.texto(d, "url", "")), null);
                App.estado("Copiado: " + d.get("url"));
            }
        });
        abrir.addActionListener(e -> {
            Map<String, Object> d = ModeloTabla.seleccion(tabla);
            if (d != null) {
                VentanaPrincipal.abrir(cliente.url(Json.texto(d, "url", "")));
            }
        });
        borrar.addActionListener(e -> {
            List<Map<String, Object>> sel = ModeloTabla.selecciones(tabla);
            if (sel.isEmpty() || !Tarea.confirmar(this, "¿Borrar " + sel.size() + " archivo(s)? Las fichas que los usen se quedarán sin imagen.")) {
                return;
            }
            Tarea.ejecutar(this, "Borrando…", () -> {
                for (Map<String, Object> d : sel) {
                    cliente.delete("/api/admin/subidas/" + Cliente.codificar(Json.texto(d, "nombre", "")));
                }
                return true;
            }, r -> refrescar());
        });
        tabla.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                previsualizar();
            }
        });

        // Arrastrar y soltar archivos desde el Explorador de Windows.
        setTransferHandler(new TransferHandler() {
            private static final long serialVersionUID = 1L;

            @Override
            public boolean canImport(TransferSupport s) {
                return s.isDataFlavorSupported(DataFlavor.javaFileListFlavor);
            }

            @Override
            @SuppressWarnings("unchecked")
            public boolean importData(TransferSupport s) {
                try {
                    List<File> files = (List<File>) s.getTransferable().getTransferData(DataFlavor.javaFileListFlavor);
                    Multimedia.subir(PanelArchivos.this, cliente, files.toArray(new File[0]), urls -> refrescar());
                    return true;
                } catch (Exception ex) {
                    return false;
                }
            }
        });
        tabla.setTransferHandler(getTransferHandler());
    }

    private void previsualizar() {
        Map<String, Object> d = ModeloTabla.seleccion(tabla);
        if (d == null) {
            return;
        }
        String tipo = Json.texto(d, "tipo", "");
        String nombre = Json.texto(d, "nombre", "");
        if (!tipo.startsWith("image/") || tipo.contains("webp") || tipo.contains("avif")) {
            vista.setIcon(null);
            vista.setText("<html><center>" + Tarea.escapar(nombre) + "<br><br>"
                    + (tipo.startsWith("image/") ? "Vista previa no disponible para este formato." : "Archivo de " + (tipo.startsWith("video") ? "vídeo" : "audio"))
                    + "<br>Usa «Abrir en el navegador».</center></html>");
            return;
        }
        vista.setText("Cargando…");
        Tarea.ejecutar(this, "Cargando la vista previa…", () -> ImageIO.read(new ByteArrayInputStream(cliente.descargar("/subidas/" + Cliente.codificar(nombre)))), img -> {
            if (img == null) {
                vista.setText("No se pudo mostrar.");
                return;
            }
            int w = 300, h = img.getHeight() * 300 / Math.max(1, img.getWidth());
            if (h > 420) {
                h = 420;
                w = img.getWidth() * 420 / Math.max(1, img.getHeight());
            }
            vista.setText("");
            vista.setIcon(new ImageIcon(img.getScaledInstance(w, h, Image.SCALE_SMOOTH)));
        });
    }

    @Override
    public void refrescar() {
        Tarea.ejecutar(this, "Cargando archivos…", () -> cliente.get("/api/admin/subidas"), r -> {
            List<Map<String, Object>> l = Cliente.lista(r, "archivos");
            modelo.datos(l);
            long t = 0;
            for (Map<String, Object> a : l) {
                t += Json.numero(a, "bytes", 0);
            }
            total.setText("   " + l.size() + " archivos · " + Tema.bytes(t));
        });
    }
}
