/*
 * ============================================================================
 *  Grafico.java — Gráfico de barras apiladas de las visitas (30 días).
 * ============================================================================
 *  Cada día: portal + wiki apilados, y una línea con los visitantes
 *  únicos. Al pasar el ratón por encima se ve el detalle del día.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.JComponent;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.geom.Path2D;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

final class Grafico extends JComponent {

    private static final long serialVersionUID = 1L;
    private static final String[] SERIES = {"portal", "wiki"};
    private static final Color[] COLORES = {new Color(0x8a8a96), new Color(0xc8102e)};

    private List<Map<String, Object>> dias = new ArrayList<>();
    private int resaltado = -1;

    Grafico() {
        setPreferredSize(new Dimension(600, 230));
        MouseAdapter m = new MouseAdapter() {
            @Override
            public void mouseMoved(MouseEvent e) {
                int n = dias.size();
                if (n == 0) {
                    return;
                }
                int izq = 44, ancho = getWidth() - izq - 12;
                int i = (int) ((e.getX() - izq) / (ancho / (double) n));
                resaltado = i >= 0 && i < n ? i : -1;
                repaint();
            }

            @Override
            public void mouseExited(MouseEvent e) {
                resaltado = -1;
                repaint();
            }
        };
        addMouseMotionListener(m);
        addMouseListener(m);
    }

    void datos(List<Map<String, Object>> d) {
        dias = d == null ? new ArrayList<>() : d;
        repaint();
    }

    @Override
    protected void paintComponent(Graphics g0) {
        Graphics2D g = (Graphics2D) g0.create();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        int w = getWidth(), h = getHeight();
        int izq = 44, arriba = 14, abajo = 28, der = 12;
        int alto = h - arriba - abajo, ancho = w - izq - der;
        long max = 1;
        for (Map<String, Object> d : dias) {
            long t = 0;
            for (String s : SERIES) {
                t += Json.numero(d, s, 0);
            }
            max = Math.max(max, Math.max(t, Json.numero(d, "unicos", 0)));
        }
        max = (long) Math.ceil(max * 1.15);
        // Líneas guía
        g.setFont(Tema.PEQUENA);
        for (int i = 0; i <= 4; i++) {
            int y = arriba + alto - alto * i / 4;
            g.setColor(new Color(255, 255, 255, 14));
            g.drawLine(izq, y, w - der, y);
            g.setColor(Tema.TEXTO_SUAVE);
            String v = String.valueOf(max * i / 4);
            g.drawString(v, izq - 8 - g.getFontMetrics().stringWidth(v), y + 4);
        }
        int n = dias.size();
        if (n == 0) {
            g.setColor(Tema.TEXTO_SUAVE);
            g.drawString("Aún no hay visitas registradas.", izq + 10, arriba + alto / 2);
            g.dispose();
            return;
        }
        double paso = ancho / (double) n;
        int barra = Math.max(3, (int) (paso * 0.62));
        Path2D linea = new Path2D.Double();
        for (int i = 0; i < n; i++) {
            Map<String, Object> d = dias.get(i);
            int x = (int) (izq + i * paso + (paso - barra) / 2);
            int base = arriba + alto;
            for (int s = 0; s < SERIES.length; s++) {
                long v = Json.numero(d, SERIES[s], 0);
                int hh = (int) Math.round(alto * v / (double) max);
                if (hh > 0) {
                    Color c = COLORES[s];
                    g.setColor(i == resaltado ? c.brighter() : c);
                    g.fillRoundRect(x, base - hh, barra, hh, 3, 3);
                    base -= hh;
                }
            }
            double yu = arriba + alto - alto * Json.numero(d, "unicos", 0) / (double) max;
            double xu = izq + i * paso + paso / 2;
            if (i == 0) {
                linea.moveTo(xu, yu);
            } else {
                linea.lineTo(xu, yu);
            }
            if (i % 5 == 0 || i == n - 1) {
                String dia = Json.texto(d, "dia", "");
                String etq = dia.length() >= 10 ? dia.substring(8, 10) + "/" + dia.substring(5, 7) : dia;
                g.setColor(Tema.TEXTO_SUAVE);
                g.drawString(etq, (int) xu - g.getFontMetrics().stringWidth(etq) / 2, h - 8);
            }
        }
        g.setColor(new Color(0x48a8e8));
        g.setStroke(new BasicStroke(2f));
        g.draw(linea);
        // Leyenda
        int lx = izq + 6;
        String[] nombres = {"Portal", "Wiki"};
        for (int s = 0; s < nombres.length; s++) {
            g.setColor(COLORES[s]);
            g.fillRect(lx, 4, 10, 10);
            g.setColor(Tema.TEXTO_SUAVE);
            g.drawString(nombres[s], lx + 14, 13);
            lx += 70;
        }
        g.setColor(new Color(0x48a8e8));
        g.fillRect(lx, 8, 12, 3);
        g.setColor(Tema.TEXTO_SUAVE);
        g.drawString("Visitantes únicos", lx + 16, 13);
        // Detalle del día bajo el ratón
        if (resaltado >= 0) {
            Map<String, Object> d = dias.get(resaltado);
            String txt = Json.texto(d, "dia", "") + " · portal " + Json.numero(d, "portal", 0) + " · wiki " + Json.numero(d, "wiki", 0) + " · únicos " + Json.numero(d, "unicos", 0);
            g.setFont(Tema.fuente(Font.BOLD, 11));
            int tw = g.getFontMetrics().stringWidth(txt) + 16;
            int tx = Math.min(w - tw - 4, Math.max(izq, (int) (izq + resaltado * paso) - tw / 2));
            g.setColor(new Color(0, 0, 0, 220));
            g.fillRoundRect(tx, arriba + 4, tw, 22, 8, 8);
            g.setColor(Color.WHITE);
            g.drawString(txt, tx + 8, arriba + 19);
        }
        g.dispose();
    }
}
