/*
 * ============================================================================
 *  PanelResumen.java — Panel principal: estado del servidor y estadísticas.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import java.awt.BorderLayout;
import java.awt.Font;
import java.awt.GridLayout;
import java.util.List;
import java.util.Map;

final class PanelResumen extends JPanel implements VentanaPrincipal.Seccion {

    private static final long serialVersionUID = 1L;

    private final Cliente cliente;
    private final JLabel[] cifras = new JLabel[4];
    private final JLabel[] pies = new JLabel[4];
    private final JLabel servidor = new JLabel();
    private final JLabel aviso = new JLabel();
    private final Grafico grafico = new Grafico();
    private final JLabel populares = new JLabel();
    private final JLabel ranking = new JLabel();
    private final JLabel contenido = new JLabel();

    PanelResumen(Cliente cliente) {
        super(new BorderLayout(0, 14));
        this.cliente = cliente;
        setOpaque(false);
        JButton refrescar = Tema.boton("Actualizar");
        refrescar.addActionListener(e -> refrescar());
        add(Tema.cabecera("Panel", "Estado del servidor, visitas de los últimos 30 días y contenido de la base de datos.", refrescar), BorderLayout.NORTH);

        JPanel cuerpo = new JPanel(new BorderLayout(0, 14));
        cuerpo.setOpaque(false);

        aviso.setOpaque(true);
        aviso.setBackground(new java.awt.Color(0x3a2a06));
        aviso.setForeground(new java.awt.Color(0xffd76a));
        aviso.setBorder(BorderFactory.createCompoundBorder(BorderFactory.createLineBorder(Tema.AMBAR), Tema.margen(10)));
        aviso.setVisible(false);

        JPanel fila = new JPanel(new GridLayout(1, 4, 12, 0));
        fila.setOpaque(false);
        String[] titulos = {"VISITAS HOY", "ÚNICOS HOY", "FICHAS DE LA WIKI", "SUPERVIVIENTES"};
        for (int i = 0; i < 4; i++) {
            JPanel t = Tema.tarjeta();
            t.setLayout(new BorderLayout(0, 4));
            JLabel cab = new JLabel(titulos[i]);
            cab.setFont(Tema.fuente(Font.BOLD, 10.5f));
            cab.setForeground(Tema.TEXTO_SUAVE);
            cifras[i] = new JLabel("—");
            cifras[i].setFont(Tema.fuente(Font.BOLD, 30));
            cifras[i].setForeground(Tema.TEXTO);
            pies[i] = Tema.etiqueta(" ");
            pies[i].setFont(Tema.PEQUENA);
            t.add(cab, BorderLayout.NORTH);
            t.add(cifras[i], BorderLayout.CENTER);
            t.add(pies[i], BorderLayout.SOUTH);
            fila.add(t);
        }

        JPanel arriba = new JPanel(new BorderLayout(0, 12));
        arriba.setOpaque(false);
        arriba.add(aviso, BorderLayout.NORTH);
        arriba.add(fila, BorderLayout.CENTER);
        cuerpo.add(arriba, BorderLayout.NORTH);

        JPanel graf = Tema.tarjeta();
        graf.setLayout(new BorderLayout(0, 8));
        JLabel tg = new JLabel("Visitas · últimos 30 días");
        tg.setFont(Tema.SUBTITULO);
        tg.setForeground(Tema.TEXTO);
        graf.add(tg, BorderLayout.NORTH);
        graf.add(grafico, BorderLayout.CENTER);

        JPanel abajo = new JPanel(new GridLayout(1, 4, 12, 0));
        abajo.setOpaque(false);
        abajo.add(caja("Servidor", servidor));
        abajo.add(caja("Contenido", contenido));
        abajo.add(caja("Fichas más vistas", populares));
        abajo.add(caja("Mejores supervivientes", ranking));

        JPanel medio = new JPanel(new BorderLayout(0, 12));
        medio.setOpaque(false);
        medio.add(graf, BorderLayout.CENTER);
        medio.add(abajo, BorderLayout.SOUTH);
        cuerpo.add(medio, BorderLayout.CENTER);

        JScrollPane sc = new JScrollPane(cuerpo);
        sc.setBorder(null);
        sc.setOpaque(false);
        sc.getViewport().setOpaque(false);
        sc.getVerticalScrollBar().setUnitIncrement(18);
        add(sc, BorderLayout.CENTER);
    }

    private static JPanel caja(String titulo, JLabel contenido) {
        JPanel t = Tema.tarjeta();
        t.setLayout(new BorderLayout(0, 8));
        JLabel l = new JLabel(titulo);
        l.setFont(Tema.SUBTITULO);
        l.setForeground(Tema.TEXTO);
        t.add(l, BorderLayout.NORTH);
        contenido.setVerticalAlignment(JLabel.TOP);
        contenido.setForeground(Tema.TEXTO_SUAVE);
        contenido.setFont(Tema.fuente(Font.PLAIN, 12));
        t.add(contenido, BorderLayout.CENTER);
        return t;
    }

    @Override
    public void refrescar() {
        Tarea.ejecutar(this, "Cargando el panel…", () -> cliente.get("/api/admin/resumen"), this::pintar);
    }

    @SuppressWarnings("unchecked")
    private void pintar(Map<String, Object> r) {
        List<Map<String, Object>> dias = Cliente.lista(r, "dias");
        grafico.datos(dias);
        Map<String, Object> hoy = dias.isEmpty() ? Map.of() : dias.get(dias.size() - 1);
        long visitas = Json.numero(hoy, "portal", 0) + Json.numero(hoy, "wiki", 0) + Json.numero(hoy, "juego", 0);
        long total30 = 0;
        for (Map<String, Object> d : dias) {
            total30 += Json.numero(d, "portal", 0) + Json.numero(d, "wiki", 0) + Json.numero(d, "juego", 0);
        }
        cifras[0].setText(String.valueOf(visitas));
        pies[0].setText(total30 + " en 30 días");
        cifras[1].setText(String.valueOf(Json.numero(hoy, "unicos", 0)));
        pies[1].setText("Puzzles resueltos hoy: " + Json.numero(hoy, "puzzlesResueltos", 0));

        Map<String, Object> cols = Json.objeto(r, "colecciones");
        long fichas = 0;
        StringBuilder sb = new StringBuilder("<html>");
        for (Map<String, Object> s : Cliente.lista(r, "secciones")) {
            String id = Json.texto(s, "id", "");
            long n = Json.numero(cols, id, 0);
            fichas += n;
            sb.append(Tarea.escapar(Json.texto(s, "titulo", id))).append(": <b style='color:#e8e2d6'>").append(n).append("</b><br>");
        }
        sb.append("Puzzles: <b style='color:#e8e2d6'>").append(Json.numero(cols, "puzzles", 0)).append("</b><br>");
        sb.append("Partidas guardadas: <b style='color:#e8e2d6'>").append(Json.numero(cols, "partidas", 0)).append("</b>");
        contenido.setText(sb.append("</html>").toString());
        cifras[2].setText(String.valueOf(fichas));
        pies[2].setText(Cliente.lista(r, "secciones").size() + " secciones");
        cifras[3].setText(String.valueOf(Json.numero(cols, "ranking", 0)));
        pies[3].setText("en el ranking");

        Map<String, Object> acceso = Json.objeto(r, "acceso");
        boolean wiki = Json.logico(Json.objeto(acceso, "wiki"), "publica", true);
        boolean juego = Json.logico(Json.objeto(acceso, "juego"), "publico", true);
        long seg = Json.numero(r, "segundosActivo", 0);
        servidor.setText("<html>Versión: <b style='color:#e8e2d6'>" + Json.texto(r, "version", "?") + "</b><br>"
                + "Activo desde hace: <b style='color:#e8e2d6'>" + (seg / 3600) + " h " + (seg % 3600 / 60) + " min</b><br>"
                + "Memoria: " + Json.numero(r, "memoriaUsadaMB", 0) + " / " + Json.numero(r, "memoriaMaxMB", 0) + " MB<br>"
                + "Java " + Tarea.escapar(Json.texto(r, "java", "")) + "<br>"
                + "Datos: " + Tarea.escapar(Json.texto(r, "almacenamiento", "")) + "<br>"
                + "Wiki: " + (wiki ? "<b style='color:#4cc46a'>PÚBLICA</b>" : "<b style='color:#ff2a3d'>CERRADA</b>")
                + " · Juego: " + (juego ? "<b style='color:#4cc46a'>PÚBLICO</b>" : "<b style='color:#ff2a3d'>CERRADO</b>") + "<br>"
                + "Copias en el servidor: " + Json.numero(r, "copias", 0) + "</html>");

        boolean enRender = Json.logico(r, "enRender", false);
        boolean persistente = Json.logico(r, "persistente", true);
        if (enRender && !persistente) {
            aviso.setText("<html><b>⚠ Los datos de Render no son permanentes.</b> El plan gratuito borra el disco en cada reinicio o despliegue. "
                    + "Configura una base de datos PostgreSQL gratuita (variable DATABASE_URL) — mira el README — o restaura tu copia desde «Copias de seguridad».</html>");
            aviso.setVisible(true);
        } else {
            aviso.setVisible(false);
        }

        StringBuilder pop = new StringBuilder("<html>");
        List<Map<String, Object>> lp = Cliente.lista(r, "populares");
        if (lp.isEmpty()) {
            pop.append("Todavía no hay visitas a fichas.");
        }
        for (int i = 0; i < Math.min(8, lp.size()); i++) {
            Map<String, Object> p = lp.get(i);
            pop.append(i + 1).append(". ").append(Tarea.escapar(Json.texto(p, "ficha", ""))).append(" · <b style='color:#e8e2d6'>").append(Json.numero(p, "vistas", 0)).append("</b><br>");
        }
        populares.setText(pop.append("</html>").toString());

        StringBuilder rk = new StringBuilder("<html>");
        List<Map<String, Object>> lr = Cliente.lista(r, "ranking");
        if (lr.isEmpty()) {
            rk.append("Nadie ha completado aún la campaña.");
        }
        for (int i = 0; i < lr.size(); i++) {
            Map<String, Object> e = lr.get(i);
            long s = Json.numero(e, "segundos", 0);
            rk.append(i + 1).append(". <b style='color:#e8e2d6'>").append(Tarea.escapar(Json.texto(e, "nombre", ""))).append("</b> · ")
                    .append(s / 3600).append("h ").append(s % 3600 / 60).append("m · ☠ ").append(Json.numero(e, "muertes", 0)).append("<br>");
        }
        ranking.setText(rk.append("</html>").toString());
    }
}
