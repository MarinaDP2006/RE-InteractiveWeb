/*
 * ============================================================================
 *  ServidorLocal.java — El servidor de la web, integrado en la app.
 * ============================================================================
 *  La app lleva dentro la web, la semilla de la base de datos y el servidor.
 *  Con un clic se arranca en tu PC (http://localhost:8080) para trabajar sin
 *  Internet o probar cambios antes de subirlos a Render.
 *  Los datos se guardan en  Documentos\UmbrellaAdmin\servidor-local\data
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Servidor;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

final class ServidorLocal {

    private static Servidor.Instancia instancia;

    private ServidorLocal() {
    }

    static Path carpetaDatos() {
        return Path.of(System.getProperty("user.home"), "Documents", "UmbrellaAdmin", "servidor-local", "data");
    }

    /** Busca la carpeta que contiene web/ y semilla/ (junto a la app o en el proyecto). */
    static Path recursos() throws IOException {
        List<Path> candidatos = new ArrayList<>();
        try {
            Path jar = Path.of(ServidorLocal.class.getProtectionDomain().getCodeSource().getLocation().toURI());
            Path dir = Files.isDirectory(jar) ? jar : jar.getParent();
            candidatos.add(dir);
            candidatos.add(dir.resolve("recursos"));
            candidatos.add(dir.getParent());
            if (dir.getParent() != null) {
                candidatos.add(dir.getParent().getParent());
            }
        } catch (URISyntaxException | SecurityException ignorado) {
            // Seguimos con la carpeta actual.
        }
        Path actual = Path.of("").toAbsolutePath();
        candidatos.add(actual);
        candidatos.add(actual.getParent());
        for (Path c : candidatos) {
            if (c != null && Files.isDirectory(c.resolve("web")) && Files.isDirectory(c.resolve("semilla"))) {
                return c;
            }
        }
        throw new IOException("No encuentro las carpetas web/ y semilla/ junto a la aplicación.");
    }

    static synchronized boolean enMarcha() {
        return instancia != null;
    }

    static synchronized int puerto() {
        return instancia == null ? 0 : instancia.puerto();
    }

    static synchronized Servidor.Instancia arrancar(int puerto) throws IOException {
        if (instancia != null) {
            return instancia;
        }
        Path r = recursos();
        instancia = Servidor.arrancar(r.resolve("web"), carpetaDatos(), r.resolve("semilla"), puerto);
        return instancia;
    }

    static synchronized void detener() {
        if (instancia != null) {
            instancia.detener();
            instancia = null;
        }
    }

    /** Contraseña generada la primera vez (si aún existe el archivo). [usuario, clave] o null. */
    static String[] credencialesIniciales() {
        Path f = carpetaDatos().resolve("ADMIN_INICIAL.txt");
        try {
            if (!Files.exists(f)) {
                return null;
            }
            String u = null, c = null;
            for (String l : Files.readAllLines(f, StandardCharsets.UTF_8)) {
                if (l.startsWith("Usuario:")) {
                    u = l.substring(8).trim();
                } else if (l.startsWith("Contraseña:")) {
                    c = l.substring(11).trim();
                }
            }
            return u != null && c != null ? new String[]{u, c} : null;
        } catch (IOException e) {
            return null;
        }
    }

    static void borrarCredencialesIniciales() {
        try {
            Files.deleteIfExists(carpetaDatos().resolve("ADMIN_INICIAL.txt"));
        } catch (IOException ignorado) {
            // No es grave.
        }
    }
}
