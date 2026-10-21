/*
 * ============================================================================
 *  Servidor.java — Punto de entrada de UMBRELLA ARCHIVES
 * ============================================================================
 *  Pone en marcha un servidor web en tu PC con la librería estándar de
 *  Java 21 (sin dependencias externas):
 *    · /api/...  → datos de la wiki y acceso de miembros (Api.java)
 *    · resto     → archivos de la carpeta web/ (Estaticos.java)
 *
 *  Uso:  java -cp build es.umbrella.Servidor [carpeta-del-proyecto]
 *
 *  Variables de entorno (opcionales):
 *    PORT              puerto (por defecto 8080)
 *    GOOGLE_CLIENT_ID  id de cliente de Google para «Únete para ver lo oculto»
 * ============================================================================
 */
package es.umbrella;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.Executors;

public final class Servidor {

    private Servidor() {
    }

    public static void main(String[] args) throws IOException {
        // Carpeta del proyecto: la que se pasa como argumento o la actual.
        Path raiz = (args.length > 0 && !args[0].isBlank() ? Path.of(args[0]) : Path.of("")).toAbsolutePath().normalize();
        Path web = raiz.resolve("web");
        if (!Files.isDirectory(web)) {
            System.err.println("ERROR: no encuentro la carpeta web/ en " + raiz);
            System.exit(1);
        }
        String puertoTexto = System.getenv("PORT");
        int puerto = puertoTexto == null || puertoTexto.isBlank() ? 8080 : Integer.parseInt(puertoTexto.trim());

        Contenido contenido = new Contenido(raiz.resolve("contenido"));
        Miembros miembros = new Miembros(raiz.resolve("datos"));

        HttpServer http = HttpServer.create(new InetSocketAddress(puerto), 64);
        http.createContext("/api/", new Api(contenido, miembros));
        http.createContext("/", new Estaticos(web));
        // Un hilo virtual por petición: ligero y suficiente para una web local.
        http.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        http.start();

        System.out.println();
        System.out.println("  UMBRELLA ARCHIVES en marcha en http://localhost:" + puerto);
        System.out.println("  Acceso con Google: " + (miembros.clientId().isEmpty() ? "desactivado (falta GOOGLE_CLIENT_ID)" : "activado"));
        System.out.println("  Para pararlo, cierra esta ventana o pulsa Ctrl+C.");
    }
}
