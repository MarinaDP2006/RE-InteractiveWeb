/*
 * ============================================================================
 *  Servidor.java — Punto de entrada de UMBRELLA ARCHIVES (Wiki + Juego).
 * ============================================================================
 *  Servidor HTTP de la librería estándar de Java 21 con hilos virtuales.
 *  No necesita ninguna dependencia (solo el driver de PostgreSQL si se usa
 *  DATABASE_URL, que el Dockerfile ya incluye).
 *
 *  Uso:  java -cp build es.umbrella.Servidor [carpeta-del-proyecto]
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
 *
 *  La app de administración también puede arrancarlo dentro de sí misma
 *  (servidor local) con Servidor.arrancar(...).
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

    /** Servidor en marcha (para poder pararlo desde la app de administración). */
    public static final class Instancia {
        private final HttpServer http;
        private final ScheduledExecutorService tareas;
        private final Actividad actividad;
        private final String almacen;
        private final int puerto;

        private Instancia(HttpServer http, ScheduledExecutorService tareas, Actividad actividad, String almacen, int puerto) {
            this.http = http;
            this.tareas = tareas;
            this.actividad = actividad;
            this.almacen = almacen;
            this.puerto = puerto;
        }

        public void detener() {
            actividad.volcar();
            tareas.shutdownNow();
            http.stop(1);
        }

        public String almacenamiento() {
            return almacen;
        }

        public int puerto() {
            return puerto;
        }
    }

    private Servidor() {
    }

    public static void main(String[] args) {
        Path raiz = Path.of("").toAbsolutePath();
        if (args.length > 0 && !args[0].isBlank()) {
            raiz = Path.of(args[0]).toAbsolutePath().normalize();
        }
        int puerto = Integer.parseInt(env("PORT", "8080"));
        Path web = carpeta(raiz, "WEB_DIR", "web");
        Path datos = raiz.resolve(env("DATA_DIR", "data")).toAbsolutePath().normalize();
        Path semilla = carpeta(raiz, "SEED_DIR", "semilla");
        try {
            Instancia s = arrancar(web, datos, semilla, puerto);
            Runtime.getRuntime().addShutdownHook(new Thread(s::detener));
            System.out.println("""

                     ██╗   ██╗███╗   ███╗██████╗ ██████╗ ███████╗██╗     ██╗      █████╗
                     ██║   ██║████╗ ████║██╔══██╗██╔══██╗██╔════╝██║     ██║     ██╔══██╗
                     ██║   ██║██╔████╔██║██████╔╝██████╔╝█████╗  ██║     ██║     ███████║
                     ██║   ██║██║╚██╔╝██║██╔══██╗██╔══██╗██╔══╝  ██║     ██║     ██╔══██║
                     ╚██████╔╝██║ ╚═╝ ██║██████╔╝██║  ██║███████╗███████╗███████╗██║  ██║
                      ╚═════╝ ╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝
                                        A R C H I V E S  ·  v""" + Api.VERSION);
            System.out.println("  Web:    " + web);
            System.out.println("  Datos:  " + s.almacenamiento());
            System.out.println("  Abre    http://localhost:" + s.puerto() + "   (Wiki: /wiki/  ·  Juego: /juego/)");
        } catch (IOException e) {
            System.err.println("ERROR al arrancar el servidor: " + e.getMessage());
            System.exit(1);
        }
    }

    /** Arranca el servidor y devuelve la instancia en marcha. */
    public static Instancia arrancar(Path web, Path datos, Path semilla, int puerto) throws IOException {
        Files.createDirectories(datos);
        if (!Files.isDirectory(web)) {
            throw new IOException("No encuentro la carpeta de la web: " + web);
        }
        BaseDatos db = new BaseDatos(Almacenamiento.crear(datos), datos, semilla);
        Seguridad seguridad = new Seguridad(db, datos);
        Actividad actividad = new Actividad(db);
        Juego juego = new Juego(db);
        Subidas subidas = new Subidas(db.almacen());
        Api api = new Api(db, seguridad, actividad, juego, subidas);

        HttpServer servidor = crearHttp(puerto);
        puerto = servidor.getAddress().getPort();
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

        servidor.start();
        return new Instancia(servidor, tareas, actividad, db.descripcionAlmacen(), puerto);
    }

    /**
     * Abre el puerto pedido. Si está ocupado (otro servidor ya en marcha), prueba el
     * puerto de reserva (+10) y luego los siguientes. En Render (variable RENDER)
     * no se cambia nunca: allí el puerto lo impone la plataforma.
     */
    private static HttpServer crearHttp(int puerto) throws IOException {
        if (System.getenv("RENDER") != null) {
            return HttpServer.create(new InetSocketAddress(puerto), 256);
        }
        int[] candidatos = {puerto, puerto + 10, puerto + 1, puerto + 11, puerto + 2};
        IOException ultimo = null;
        for (int p : candidatos) {
            try {
                HttpServer s = HttpServer.create(new InetSocketAddress(p), 256);
                if (p != puerto) {
                    System.out.println("[SERVIDOR] El puerto " + puerto + " está ocupado: uso el " + p + ".");
                }
                return s;
            } catch (java.net.BindException e) {
                ultimo = e;
            }
        }
        throw new IOException("Los puertos " + puerto + ", " + (puerto + 10) + ", " + (puerto + 1) + "... están ocupados. Cierra el otro servidor.", ultimo);
    }

    private static String env(String nombre, String porDefecto) {
        String v = System.getenv(nombre);
        return v == null || v.isBlank() ? porDefecto : v.trim();
    }

    /** Busca la carpeta en la raíz y, si no está, en la carpeta de arriba. */
    private static Path carpeta(Path raiz, String variable, String nombre) {
        String v = System.getenv(variable);
        if (v != null && !v.isBlank()) {
            return Path.of(v).toAbsolutePath().normalize();
        }
        Path aqui = raiz.resolve(nombre).normalize();
        if (Files.isDirectory(aqui)) {
            return aqui;
        }
        Path arriba = raiz.resolve("..").resolve(nombre).normalize();
        return Files.isDirectory(arriba) ? arriba : aqui;
    }
}
