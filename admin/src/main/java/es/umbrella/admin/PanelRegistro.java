/*
 * ============================================================================
 *  PanelRegistro.java — Historial de acciones del administrador.
 * ============================================================================
 *  Inicios de sesión (también los fallidos), cambios en la base de datos,
 *  copias, subidas... Sirve para saber quién ha hecho qué y cuándo.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import javax.swing.JButton;
import javax.swing.JPanel;
import javax.swing.JTable;
import javax.swing.JTextField;
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.util.List;

final class PanelRegistro extends JPanel implements VentanaPrincipal.Seccion {

    private static final long serialVersionUID = 1L;

    private final Cliente cliente;
    private final ModeloTabla modelo = new ModeloTabla(List.of(
            ModeloTabla.col("Fecha", d -> Json.texto(d, "fecha", "").replace("T", " ").replaceAll("\\..*", ""), 160),
            ModeloTabla.col("Acción", d -> d.get("accion"), 130),
            ModeloTabla.col("Detalle", d -> d.get("detalle")),
            ModeloTabla.col("IP", d -> d.get("ip"), 130)));
    private final JTable tabla = modelo.crearTabla();

    PanelRegistro(Cliente cliente) {
        super(new BorderLayout(0, 10));
        this.cliente = cliente;
        setOpaque(false);
        JButton actualizar = Tema.boton("Actualizar");
        actualizar.addActionListener(e -> refrescar());
        add(Tema.cabecera("Registro de acciones", "Las últimas 500 acciones de administración. Los intentos de acceso fallidos aparecen como «login-fallido».", actualizar), BorderLayout.NORTH);
        JPanel barra = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 0));
        barra.setOpaque(false);
        JTextField buscar = new JTextField(20);
        buscar.getDocument().addDocumentListener(new javax.swing.event.DocumentListener() {
            public void insertUpdate(javax.swing.event.DocumentEvent e) { ModeloTabla.filtrar(tabla, buscar.getText()); }
            public void removeUpdate(javax.swing.event.DocumentEvent e) { ModeloTabla.filtrar(tabla, buscar.getText()); }
            public void changedUpdate(javax.swing.event.DocumentEvent e) { }
        });
        barra.add(Tema.etiqueta("Filtrar:"));
        barra.add(buscar);
        JPanel centro = new JPanel(new BorderLayout(0, 8));
        centro.setOpaque(false);
        centro.add(barra, BorderLayout.NORTH);
        centro.add(Tema.scroll(tabla), BorderLayout.CENTER);
        add(centro, BorderLayout.CENTER);
    }

    @Override
    public void refrescar() {
        Tarea.ejecutar(this, "Cargando el registro…", () -> cliente.get("/api/admin/registro?n=500"), r -> modelo.datos(Cliente.lista(r, "registro")));
    }
}
