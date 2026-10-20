/*
 * ============================================================================
 *  Multimedia.java — Subir imágenes y vídeos al servidor y elegirlos.
 * ============================================================================
 *  Los archivos subidos se sirven en  /subidas/<nombre>  y se pueden usar en
 *  cualquier ficha de la wiki (imagen, vídeo) o en el juego (vídeos de
 *  introducción de cada archivo).
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.DefaultListModel;
import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JFileChooser;
import javax.swing.JList;
import javax.swing.JPanel;
import javax.swing.ListSelectionModel;
import javax.swing.SwingUtilities;
import javax.swing.filechooser.FileNameExtensionFilter;
import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.FlowLayout;
import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Consumer;

final class Multimedia {

    static final long MAX_BYTES = 80L * 1024 * 1024;

    private Multimedia() {
    }

    static String tipo(String nombre) {
        String n = nombre.toLowerCase(Locale.ROOT);
        if (n.endsWith(".webp")) {
            return "image/webp";
        }
        if (n.endsWith(".png")) {
            return "image/png";
        }
        if (n.endsWith(".jpg") || n.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (n.endsWith(".gif")) {
            return "image/gif";
        }
        if (n.endsWith(".avif")) {
            return "image/avif";
        }
        if (n.endsWith(".mp4")) {
            return "video/mp4";
        }
        if (n.endsWith(".webm")) {
            return "video/webm";
        }
        if (n.endsWith(".mp3")) {
            return "audio/mpeg";
        }
        if (n.endsWith(".ogg")) {
            return "audio/ogg";
        }
        if (n.endsWith(".wav")) {
            return "audio/wav";
        }
        return "application/octet-stream";
    }

    /** Selector de archivos del PC (varios a la vez). */
    static File[] elegirDelPC(Component padre, boolean soloVideo, boolean varios) {
        JFileChooser fc = new JFileChooser();
        fc.setMultiSelectionEnabled(varios);
        fc.setDialogTitle(soloVideo ? "Elige un vídeo" : "Elige imágenes o vídeos");
        fc.setFileFilter(soloVideo ? new FileNameExtensionFilter("Vídeos (mp4, webm)", "mp4", "webm")
                : new FileNameExtensionFilter("Imágenes, vídeos y audio", "webp", "png", "jpg", "jpeg", "gif", "avif", "mp4", "webm", "mp3", "ogg", "wav"));
        if (fc.showOpenDialog(SwingUtilities.getWindowAncestor(padre)) != JFileChooser.APPROVE_OPTION) {
            return new File[0];
        }
        return varios ? fc.getSelectedFiles() : new File[]{fc.getSelectedFile()};
    }

    /** Sube varios archivos y devuelve la lista de URLs. */
    static void subir(Component padre, Cliente cliente, File[] archivos, Consumer<List<String>> alTerminar) {
        if (archivos.length == 0) {
            return;
        }
        for (File f : archivos) {
            if (f.length() > MAX_BYTES) {
                Tarea.error(padre, "«" + f.getName() + "» pesa " + Tema.bytes(f.length()) + ". El máximo es 80 MB. "
                        + "Para vídeos largos es mejor subirlos a YouTube y poner su enlace.");
                return;
            }
        }
        Tarea.ejecutar(padre, "Subiendo " + archivos.length + " archivo(s)…", () -> {
            List<String> urls = new ArrayList<>();
            for (File f : archivos) {
                byte[] datos = Files.readAllBytes(f.toPath());
                Map<String, Object> r = cliente.subir("PUT", "/api/admin/subidas/" + Cliente.codificar(f.getName()), datos, tipo(f.getName()));
                urls.add(Json.texto(r, "url", ""));
            }
            return urls;
        }, alTerminar);
    }

    static void elegirYSubir(Component padre, Cliente cliente, boolean soloVideo, Consumer<String> alTerminar) {
        subir(padre, cliente, elegirDelPC(padre, soloVideo, false), urls -> {
            if (!urls.isEmpty()) {
                alTerminar.accept(urls.get(0));
            }
        });
    }

    /** Ventana con los archivos ya subidos para escoger uno. */
    static void elegirDeGaleria(Component padre, Cliente cliente, Consumer<String> alTerminar) {
        Tarea.ejecutar(padre, "Cargando la galería…", () -> cliente.get("/api/admin/subidas"), r -> {
            List<Map<String, Object>> archivos = Cliente.lista(r, "archivos");
            JDialog d = new JDialog(SwingUtilities.getWindowAncestor(padre), "Galería de archivos subidos", JDialog.ModalityType.APPLICATION_MODAL);
            DefaultListModel<String> modelo = new DefaultListModel<>();
            for (Map<String, Object> a : archivos) {
                modelo.addElement(Json.texto(a, "url", ""));
            }
            JList<String> lista = new JList<>(modelo);
            lista.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
            lista.setFont(Tema.MONO);
            JPanel p = new JPanel(new BorderLayout(0, 10));
            p.setBorder(Tema.margen(14));
            p.add(Tema.etiqueta(archivos.isEmpty()
                    ? "<html>Aún no has subido nada. Usa «Subir…» o la sección «Imágenes y vídeos».<br>"
                    + "También puedes escribir rutas de imágenes del juego, p. ej. <b>/juego/img/personajes/leon.webp</b></html>"
                    : "Elige un archivo:"), BorderLayout.NORTH);
            p.add(Tema.scroll(lista), BorderLayout.CENTER);
            JPanel b = new JPanel(new FlowLayout(FlowLayout.RIGHT));
            JButton usar = Tema.botonRojo("Usar");
            usar.addActionListener(e -> {
                if (lista.getSelectedValue() != null) {
                    alTerminar.accept(lista.getSelectedValue());
                    d.dispose();
                }
            });
            JButton cancelar = Tema.boton("Cancelar");
            cancelar.addActionListener(e -> d.dispose());
            b.add(cancelar);
            b.add(usar);
            p.add(b, BorderLayout.SOUTH);
            d.setContentPane(p);
            d.setSize(560, 460);
            d.setLocationRelativeTo(padre);
            d.setVisible(true);
        });
    }
}
