/*
 * ============================================================================
 *  Preferencias.java — Ajustes locales de la app (en tu PC).
 * ============================================================================
 *  Se guardan en  %USERPROFILE%\.umbrella-admin\preferencias.json :
 *  servidores usados, último usuario, carpeta de copias de seguridad y si se
 *  hace copia automática al conectar. La contraseña NUNCA se guarda.
 * ============================================================================
 */
package es.umbrella.admin;

import es.umbrella.Json;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class Preferencias {

    private static final Path CARPETA = Path.of(System.getProperty("user.home"), ".umbrella-admin");
    private static final Path ARCHIVO = CARPETA.resolve("preferencias.json");

    private Map<String, Object> datos = new LinkedHashMap<>();

    Preferencias() {
        try {
            if (Files.exists(ARCHIVO)) {
                datos = Json.leerObjeto(Files.readString(ARCHIVO, StandardCharsets.UTF_8));
            }
        } catch (IOException | IllegalArgumentException e) {
            datos = new LinkedHashMap<>();
        }
    }

    void guardar() {
        try {
            Files.createDirectories(CARPETA);
            Files.writeString(ARCHIVO, Json.bonito(datos), StandardCharsets.UTF_8);
        } catch (IOException e) {
            System.err.println("No se pudieron guardar las preferencias: " + e.getMessage());
        }
    }

    /** Servidores usados (el más reciente primero). */
    @SuppressWarnings("unchecked")
    List<String> servidores() {
        List<String> l = new ArrayList<>();
        if (datos.get("servidores") instanceof List<?> lista) {
            for (Object o : lista) {
                l.add(String.valueOf(o));
            }
        }
        // Los dos servidores locales: iniciar.bat (8080) y el integrado en la app (8081).
        for (String local : new String[]{"http://localhost:8080", "http://localhost:8081"}) {
            if (!l.contains(local)) {
                l.add(local);
            }
        }
        return l;
    }

    void usarServidor(String url) {
        List<String> l = servidores();
        l.remove(url);
        l.add(0, url);
        while (l.size() > 8) {
            l.remove(l.size() - 1);
        }
        datos.put("servidores", l);
        guardar();
    }

    String usuario() {
        return Json.texto(datos, "usuario", "admin");
    }

    void usuario(String u) {
        datos.put("usuario", u);
        guardar();
    }

    Path carpetaCopias() {
        String c = Json.texto(datos, "carpetaCopias", null);
        return c == null ? Path.of(System.getProperty("user.home"), "Documents", "UmbrellaAdmin", "copias") : Path.of(c);
    }

    void carpetaCopias(Path p) {
        datos.put("carpetaCopias", p.toString());
        guardar();
    }

    boolean copiaAlConectar() {
        return Json.logico(datos, "copiaAlConectar", true);
    }

    void copiaAlConectar(boolean b) {
        datos.put("copiaAlConectar", b);
        guardar();
    }
}
