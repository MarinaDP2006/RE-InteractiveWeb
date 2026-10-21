/*
 * ============================================================================
 *  App.java — UMBRELLA ADMIN · Aplicación de escritorio de administración
 * ============================================================================
 *  Gestiona desde Windows todo el proyecto:
 *    · Panel con estadísticas de visitas y estado del servidor.
 *    · Acceso público: abrir o cerrar la wiki (mantenimiento).
 *    · Wiki: crear, editar, ocultar y borrar fichas; secciones y portada.
 *    · Archivos multimedia: subir imágenes y vídeos.
 *    · Base de datos completa, copias de seguridad, registro y contraseña.
 *    · Servidor local integrado para trabajar sin Internet.
 *
 *  Se conecta al servidor (tu PC o Render) con el ÚNICO usuario administrador.
 * ============================================================================
 */
package es.umbrella.admin;

import javax.swing.JLabel;
import javax.swing.SwingUtilities;
import java.awt.Image;
import java.util.List;

public final class App {

    static final String VERSION = "1.0.0";
    static final Preferencias PREFS = new Preferencias();
    private static JLabel barraEstado;

    private App() {
    }

    public static void main(String[] args) {
        System.setProperty("awt.useSystemAAFontSettings", "on");
        System.setProperty("sun.java2d.uiScale.enabled", "true");
        SwingUtilities.invokeLater(() -> {
            Tema.aplicar();
            new VentanaLogin().setVisible(true);
        });
    }

    static List<Image> iconos() {
        return List.of(Tema.logo(16), Tema.logo(32), Tema.logo(64), Tema.logo(128));
    }

    static void barra(JLabel l) {
        barraEstado = l;
    }

    /** Mensaje en la barra de estado de la ventana principal. */
    static void estado(String mensaje) {
        if (barraEstado != null) {
            SwingUtilities.invokeLater(() -> barraEstado.setText("  " + mensaje));
        }
    }
}
