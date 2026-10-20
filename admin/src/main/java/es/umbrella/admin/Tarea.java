/*
 * ============================================================================
 *  Tarea.java — Ejecuta trabajo de red en segundo plano sin congelar la app.
 * ============================================================================
 *  Tarea.ejecutar(componente, "Guardando…", () -> cliente.put(...), r -> {...});
 *  · Mientras trabaja: cursor de espera y mensaje en la barra de estado.
 *  · Si falla: ventana de error con el mensaje del servidor.
 * ============================================================================
 */
package es.umbrella.admin;

import javax.swing.JOptionPane;
import javax.swing.SwingUtilities;
import javax.swing.SwingWorker;
import java.awt.Component;
import java.awt.Cursor;
import java.util.concurrent.ExecutionException;
import java.util.function.Consumer;

final class Tarea {

    private Tarea() {
    }

    @FunctionalInterface
    interface Trabajo<T> {
        T hacer() throws Exception;
    }

    static <T> void ejecutar(Component padre, String mensaje, Trabajo<T> trabajo, Consumer<T> alTerminar) {
        ejecutar(padre, mensaje, trabajo, alTerminar, null);
    }

    static <T> void ejecutar(Component padre, String mensaje, Trabajo<T> trabajo, Consumer<T> alTerminar, Consumer<Exception> alFallar) {
        Component raiz = padre == null ? null : SwingUtilities.getRoot(padre);
        if (raiz != null) {
            raiz.setCursor(Cursor.getPredefinedCursor(Cursor.WAIT_CURSOR));
        }
        App.estado(mensaje);
        new SwingWorker<T, Void>() {
            @Override
            protected T doInBackground() throws Exception {
                return trabajo.hacer();
            }

            @Override
            protected void done() {
                if (raiz != null) {
                    raiz.setCursor(Cursor.getDefaultCursor());
                }
                try {
                    T r = get();
                    App.estado("Listo");
                    if (alTerminar != null) {
                        alTerminar.accept(r);
                    }
                } catch (ExecutionException e) {
                    Exception causa = e.getCause() instanceof Exception ex ? ex : e;
                    App.estado("Error: " + causa.getMessage());
                    if (alFallar != null) {
                        alFallar.accept(causa);
                    } else {
                        error(padre, causa.getMessage());
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }.execute();
    }

    static void error(Component padre, String mensaje) {
        JOptionPane.showMessageDialog(padre == null ? null : SwingUtilities.getWindowAncestor(padre),
                "<html><body style='width:380px'>" + escapar(mensaje == null ? "Error desconocido" : mensaje) + "</body></html>",
                "Umbrella Admin · Error", JOptionPane.ERROR_MESSAGE);
    }

    static void info(Component padre, String mensaje) {
        JOptionPane.showMessageDialog(padre == null ? null : SwingUtilities.getWindowAncestor(padre),
                "<html><body style='width:380px'>" + mensaje + "</body></html>", "Umbrella Admin", JOptionPane.INFORMATION_MESSAGE);
    }

    static boolean confirmar(Component padre, String mensaje) {
        return JOptionPane.showConfirmDialog(padre == null ? null : SwingUtilities.getWindowAncestor(padre),
                "<html><body style='width:380px'>" + mensaje + "</body></html>", "Umbrella Admin · Confirmar",
                JOptionPane.YES_NO_OPTION, JOptionPane.WARNING_MESSAGE) == JOptionPane.YES_OPTION;
    }

    static String escapar(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
