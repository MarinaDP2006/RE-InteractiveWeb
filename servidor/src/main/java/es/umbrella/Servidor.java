/*
 * ============================================================================
 *  Servidor.java — Punto de entrada de UMBRELLA ARCHIVES (Wiki + Juego).
 * ============================================================================
 *  Servidor HTTP de la librería estándar de Java 21 con hilos virtuales.
 *  No necesita ninguna dependencia (solo el driver de PostgreSQL si se usa
 *  DATABASE_URL, que el Dockerfile ya incluye).
 *
 *  Variables de entorno (todas opcionales):
 *    PORT            puerto HTTP (por defecto 8080; Render la define sola)
 *    WEB_DIR         carpeta de la web          (por defecto ./web)
 *    DATA_DIR        carpeta de datos           (por defecto ./data)
 *    SEED_DIR        carpeta de datos iniciales (por defecto ./semilla)
 *    DATABASE_URL    postgres://usuario:clave@host/bd → guarda todo en PostgreSQL
 *    ADMIN_USER      usuario del administrador  (por defecto "admin")
 *    ADMIN_PASSWORD  contraseña inicial del administrador
 *    ADMIN_RESET     "true" para restablecer la contraseña con ADMIN_PASSWORD
 * ============================================================================
 */
package es.umbrella;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public final class Servidor {

    private Servidor() {
    }

    public static void main(String[] args) throws IOException {
        int puerto = Integer.parseInt(env("PORT", "8080"));
        Path web = carpeta("WEB_DIR", "web");
        Path datos = Path.of(env("DATA_DIR", "data")).toAbsolutePath().normalize();
        Path semilla = carpeta("SEED_DIR", "semilla");
        Files.createDirectories(datos);

        if (!Files.isDirectory(web)) {
            System.err.println("ERROR: no encuentro la carpeta de la web: " + web);
            System.exit(1);
        }

        BaseDatos db;
        try {
            db = new BaseDatos(Almacenamiento.crear(datos), datos, semilla);
        } catch (IOException e) {
            System.err.println("ERROR al abrir la base de datos: " + e.getMessage());
            System.exit(1);
            return;
        }
        Seguridad seguridad = new Seguridad(db, datos);
        Actividad actividad = new Actividad(db);
        Juego juego = new Juego(db);
        Subidas subidas = new Subidas(db.almacen());
        Api api = new Api(db, seguridad, actividad, juego, subidas);

        HttpServer servidor = HttpServer.create(new InetSocketAddress(puerto), 256);
        servidor.createContext("/api/", api);
        servidor.createContext("/", new Estaticos(web, api, subidas));
        servidor.setExecutor(Executors.newVirtualThreadPerTaskExecutor());

        // Tareas periódicas: guardar estadísticas cada minuto y copia de seguridad diaria.
        ScheduledExecutorService tareas = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "tareas");
            t.setDaemon(true);
            return t;
        });
        tareas.scheduleAtFixedRate(actividad::volcar, 60, 60, TimeUnit.SECONDS);
        tareas.scheduleAtFixedRate(() -> {
            try {
                if (db.tocaCopiaAutomatica()) {
                    System.out.println("[DB] Copia automática: " + db.copiaSeguridad("auto"));
                }
            } catch (Exception e) {
                System.err.println("[DB] Fallo en la copia automática: " + e.getMessage());
            }
        }, 30, 3600, TimeUnit.SECONDS);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            actividad.volcar();
            servidor.stop(1);
        }));

        servidor.start();
        System.out.println("""

                 ██╗   ██╗███╗   ███╗██████╗ ██████╗ ███████╗██╗     ██╗      █████╗
                 ██║   ██║████╗ ████║██╔══██╗██╔══██╗██╔════╝██║     ██║     ██╔══██╗
                 ██║   ██║██╔████╔██║██████╔╝██████╔╝█████╗  ██║     ██║     ███████║
                 ██║   ██║██║╚██╔╝██║██╔══██╗██╔══██╗██╔══╝  ██║     ██║     ██╔══██║
                 ╚██████╔╝██║ ╚═╝ ██║██████╔╝██║  ██║███████╗███████╗███████╗██║  ██║
                  ╚═════╝ ╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝
                                    A R C H I V E S  ·  v""" + Api.VERSION);
        System.out.println("  Web:    " + web);
        System.out.println("  Datos:  " + db.descripcionAlmacen());
        System.out.println("  Abre    http://localhost:" + puerto + "   (Wiki: /wiki/  ·  Juego: /juego/)");
    }

    private static String env(String nombre, String porDefecto) {
        String v = System.getenv(nombre);
        return v == null || v.isBlank() ? porDefecto : v.trim();
    }

    /** Busca la carpeta en ./ y, si no está, en ../ (por si se arranca desde servidor/). */
    private static Path carpeta(String variable, String nombre) {
        String v = System.getenv(variable);
        if (v != null && !v.isBlank()) {
            return Path.of(v).toAbsolutePath().normalize();
        }
        Path aqui = Path.of(nombre).toAbsolutePath().normalize();
        if (Files.isDirectory(aqui)) {
            return aqui;
        }
        Path arriba = Path.of("..", nombre).toAbsolutePath().normalize();
        return Files.isDirectory(arriba) ? arriba : aqui;
    }
}
