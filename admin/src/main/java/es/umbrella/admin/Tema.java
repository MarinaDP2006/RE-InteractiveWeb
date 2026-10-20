/*
 * ============================================================================
 *  Tema.java — Aspecto visual de la app (oscuro, estilo Umbrella).
 * ============================================================================
 *  Usa el look and feel Nimbus del propio Java con una paleta oscura, y
 *  fábricas de componentes (botones, tarjetas, títulos...) para que todos los
 *  paneles se vean iguales.
 * ============================================================================
 */
package es.umbrella.admin;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JComponent;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.UIManager;
import javax.swing.border.Border;
import javax.swing.table.DefaultTableCellRenderer;
import java.awt.BasicStroke;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GradientPaint;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Insets;
import java.awt.RenderingHints;
import java.awt.geom.Path2D;
import java.awt.image.BufferedImage;

final class Tema {

    private Tema() {
    }

    static final Color FONDO = new Color(0x0c0c0f);
    static final Color PANEL = new Color(0x15151a);
    static final Color PANEL_2 = new Color(0x1c1c23);
    static final Color BORDE = new Color(0x2c2c36);
    static final Color TEXTO = new Color(0xe8e2d6);
    static final Color TEXTO_SUAVE = new Color(0x9c968c);
    static final Color ROJO = new Color(0xc8102e);
    static final Color ROJO_VIVO = new Color(0xff2a3d);
    static final Color VERDE = new Color(0x4cc46a);
    static final Color AMBAR = new Color(0xd4a020);
    static final Color AZUL = new Color(0x48a8e8);

    static Font fuente(int estilo, float tam) {
        return new Font("Segoe UI", estilo, Math.round(tam));
    }

    static final Font TITULO = fuente(Font.BOLD, 22);
    static final Font SUBTITULO = fuente(Font.BOLD, 15);
    static final Font NORMAL = fuente(Font.PLAIN, 13);
    static final Font PEQUENA = fuente(Font.PLAIN, 11);
    static final Font MONO = new Font("Consolas", Font.PLAIN, 13);

    /** Configura Nimbus en modo oscuro para toda la aplicación. */
    static void aplicar() {
        try {
            for (UIManager.LookAndFeelInfo info : UIManager.getInstalledLookAndFeels()) {
                if ("Nimbus".equals(info.getName())) {
                    UIManager.setLookAndFeel(info.getClassName());
                    break;
                }
            }
        } catch (Exception ignorado) {
            // Si Nimbus no está, se usa el aspecto por defecto.
        }
        UIManager.put("control", PANEL);
        UIManager.put("info", PANEL_2);
        UIManager.put("nimbusBase", new Color(0x2a0a10));
        UIManager.put("nimbusAlertYellow", AMBAR);
        UIManager.put("nimbusDisabledText", new Color(0x666666));
        UIManager.put("nimbusFocus", ROJO);
        UIManager.put("nimbusGreen", VERDE);
        UIManager.put("nimbusInfoBlue", AZUL);
        UIManager.put("nimbusLightBackground", new Color(0x101014));
        UIManager.put("nimbusOrange", AMBAR);
        UIManager.put("nimbusRed", ROJO);
        UIManager.put("nimbusSelectedText", Color.WHITE);
        UIManager.put("nimbusSelectionBackground", new Color(0x7a0a1a));
        UIManager.put("nimbusBlueGrey", new Color(0x2a2a33));
        UIManager.put("text", TEXTO);
        UIManager.put("menu", PANEL);
        UIManager.put("ToolTip.background", PANEL_2);
        UIManager.put("defaultFont", NORMAL);
        UIManager.put("Table.alternateRowColor", new Color(0x131318));
        UIManager.put("Table.gridColor", BORDE);
        UIManager.put("ScrollPane.background", FONDO);
        UIManager.put("TitledBorder.titleColor", TEXTO_SUAVE);
    }

    // ------------------------------------------------------------------
    //  Fábricas
    // ------------------------------------------------------------------

    static JButton boton(String texto) {
        JButton b = new JButton(texto);
        b.setFont(fuente(Font.BOLD, 12.5f));
        b.setFocusPainted(false);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        b.setMargin(new Insets(6, 14, 6, 14));
        return b;
    }

    /** Botón principal (rojo). */
    static JButton botonRojo(String texto) {
        JButton b = boton(texto);
        b.putClientProperty("Nimbus.Overrides.InheritDefaults", Boolean.TRUE);
        b.setBackground(ROJO);
        b.setForeground(Color.WHITE);
        return b;
    }

    static JLabel titulo(String texto) {
        JLabel l = new JLabel(texto);
        l.setFont(TITULO);
        l.setForeground(TEXTO);
        return l;
    }

    static JLabel etiqueta(String texto) {
        JLabel l = new JLabel(texto);
        l.setForeground(TEXTO_SUAVE);
        l.setFont(NORMAL);
        return l;
    }

    static Border margen(int px) {
        return BorderFactory.createEmptyBorder(px, px, px, px);
    }

    /** Panel con fondo y borde redondeado (tarjeta). */
    static JPanel tarjeta() {
        JPanel p = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2 = (Graphics2D) g.create();
                g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setPaint(new GradientPaint(0, 0, PANEL_2, 0, getHeight(), PANEL));
                g2.fillRoundRect(0, 0, getWidth() - 1, getHeight() - 1, 12, 12);
                g2.setColor(BORDE);
                g2.drawRoundRect(0, 0, getWidth() - 1, getHeight() - 1, 12, 12);
                g2.dispose();
            }
        };
        p.setOpaque(false);
        p.setBorder(margen(16));
        return p;
    }

    /** Cabecera de un panel: título + descripción + zona de acciones a la derecha. */
    static JPanel cabecera(String titulo, String descripcion, JComponent... acciones) {
        JPanel p = new JPanel(new BorderLayout(10, 4));
        p.setOpaque(false);
        JPanel textos = new JPanel(new BorderLayout(0, 4));
        textos.setOpaque(false);
        textos.add(titulo(titulo), BorderLayout.NORTH);
        if (descripcion != null) {
            JLabel d = etiqueta("<html>" + descripcion + "</html>");
            textos.add(d, BorderLayout.CENTER);
        }
        p.add(textos, BorderLayout.CENTER);
        if (acciones.length > 0) {
            JPanel der = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 0));
            der.setOpaque(false);
            for (JComponent a : acciones) {
                der.add(a);
            }
            p.add(der, BorderLayout.EAST);
        }
        p.setBorder(BorderFactory.createEmptyBorder(0, 0, 14, 0));
        return p;
    }

    static JScrollPane scroll(Component c) {
        JScrollPane s = new JScrollPane(c);
        s.setBorder(BorderFactory.createLineBorder(BORDE));
        s.getViewport().setBackground(new Color(0x101014));
        s.getVerticalScrollBar().setUnitIncrement(18);
        return s;
    }

    /** Ajustes comunes de las tablas. */
    static void tabla(JTable t) {
        t.setRowHeight(28);
        t.setFillsViewportHeight(true);
        t.setShowHorizontalLines(true);
        t.setShowVerticalLines(false);
        t.setAutoCreateRowSorter(true);
        t.getTableHeader().setReorderingAllowed(false);
        t.getTableHeader().setFont(fuente(Font.BOLD, 12));
        DefaultTableCellRenderer r = new DefaultTableCellRenderer();
        r.setBorder(BorderFactory.createEmptyBorder(0, 8, 0, 8));
        t.setDefaultRenderer(Object.class, r);
    }

    /** Espaciador fijo. */
    static Component hueco(int w, int h) {
        JPanel p = new JPanel();
        p.setOpaque(false);
        p.setPreferredSize(new Dimension(w, h));
        return p;
    }

    /** Logotipo de Umbrella dibujado por código (8 gajos rojos y blancos). */
    static BufferedImage logo(int tam) {
        BufferedImage img = new BufferedImage(tam, tam, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        double c = tam / 2.0, r = tam * 0.48;
        for (int i = 0; i < 8; i++) {
            double a1 = Math.toRadians(i * 45 - 90 - 22.5), a2 = Math.toRadians(i * 45 - 90 + 22.5), am = Math.toRadians(i * 45 - 90);
            Path2D p = new Path2D.Double();
            p.moveTo(c, c);
            p.lineTo(c + r * Math.cos(a1), c + r * Math.sin(a1));
            p.quadTo(c + r * 0.83 * Math.cos(am), c + r * 0.83 * Math.sin(am), c + r * Math.cos(a2), c + r * Math.sin(a2));
            p.closePath();
            g.setColor(i % 2 == 0 ? ROJO : new Color(0xf2efe9));
            g.fill(p);
        }
        g.setColor(new Color(0x0a0a0a));
        g.setStroke(new BasicStroke(1));
        g.fillOval((int) (c - tam * 0.035), (int) (c - tam * 0.035), (int) (tam * 0.07), (int) (tam * 0.07));
        g.dispose();
        return img;
    }

    static String bytes(long b) {
        if (b < 1024) {
            return b + " B";
        }
        if (b < 1024 * 1024) {
            return String.format("%.1f KB", b / 1024.0);
        }
        return String.format("%.1f MB", b / (1024.0 * 1024));
    }
}
