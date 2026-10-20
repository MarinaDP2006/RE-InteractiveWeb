/*
 * ============================================================================
 *  Almacenamiento.java — Dónde se guardan físicamente las colecciones.
 * ============================================================================
 *  · Archivos   → data/db/<coleccion>.json (por defecto, ideal en tu PC).
 *  · PostgreSQL → si existe la variable DATABASE_URL (Render, Neon, Supabase…).
 *                 Así los datos sobreviven a los reinicios del plan gratuito de
 *                 Render, cuyo disco se borra en cada despliegue.
 *
 *  El driver JDBC de PostgreSQL solo hace falta en el modo PostgreSQL; el
 *  Dockerfile lo descarga automáticamente.
 * ============================================================================
 */
package es.umbrella;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;

interface Almacenamiento {

    /** Nombre legible para el panel de administración. */
    String descripcion();

    /** Todas las colecciones: nombre → texto JSON. */
    Map<String, String> cargarTodo() throws IOException;

    /** Escribe (o reemplaza) una colección completa. */
    void escribir(String coleccion, String json) throws IOException;

    // --- Archivos subidos (imágenes, vídeos, texturas) ---

    void guardarArchivo(String nombre, byte[] datos) throws IOException;

    /** null si no existe. */
    byte[] leerArchivo(String nombre) throws IOException;

    boolean borrarArchivo(String nombre) throws IOException;

    /** nombre → tamaño en bytes. */
    Map<String, Long> listarArchivos() throws IOException;

    /** Elige el almacenamiento según las variables de entorno. */
    static Almacenamiento crear(Path carpetaDatos) throws IOException {
        String url = System.getenv("DATABASE_URL");
        if (url != null && !url.isBlank()) {
            return new Postgres(url.trim());
        }
        return new Archivos(carpetaDatos.resolve("db"));
    }

    // =====================================================================
    //  Archivos JSON en disco
    // =====================================================================
    final class Archivos implements Almacenamiento {
        private final Path carpeta;
        private final Path subidas;

        Archivos(Path carpeta) throws IOException {
            this.carpeta = carpeta;
            this.subidas = carpeta.resolveSibling("subidas");
            Files.createDirectories(carpeta);
            Files.createDirectories(subidas);
        }

        @Override
        public void guardarArchivo(String nombre, byte[] datos) throws IOException {
            Path tmp = subidas.resolve(nombre + ".tmp");
            Files.write(tmp, datos);
            Files.move(tmp, subidas.resolve(nombre), StandardCopyOption.REPLACE_EXISTING);
        }

        @Override
        public byte[] leerArchivo(String nombre) throws IOException {
            Path p = subidas.resolve(nombre);
            return Files.isRegularFile(p) ? Files.readAllBytes(p) : null;
        }

        @Override
        public boolean borrarArchivo(String nombre) throws IOException {
            return Files.deleteIfExists(subidas.resolve(nombre));
        }

        @Override
        public Map<String, Long> listarArchivos() throws IOException {
            Map<String, Long> m = new java.util.TreeMap<>();
            try (DirectoryStream<Path> ds = Files.newDirectoryStream(subidas)) {
                for (Path p : ds) {
                    String n = p.getFileName().toString();
                    if (Files.isRegularFile(p) && !n.endsWith(".tmp")) {
                        m.put(n, Files.size(p));
                    }
                }
            }
            return m;
        }

        @Override
        public String descripcion() {
            return "Archivos JSON en " + carpeta.toAbsolutePath();
        }

        @Override
        public Map<String, String> cargarTodo() throws IOException {
            Map<String, String> todo = new LinkedHashMap<>();
            try (DirectoryStream<Path> ds = Files.newDirectoryStream(carpeta, "*.json")) {
                for (Path p : ds) {
                    String nombre = p.getFileName().toString().replaceFirst("\\.json$", "");
                    todo.put(nombre, Files.readString(p, StandardCharsets.UTF_8));
                }
            }
            return todo;
        }

        @Override
        public void escribir(String coleccion, String json) throws IOException {
            Path destino = carpeta.resolve(coleccion + ".json");
            Path temporal = carpeta.resolve(coleccion + ".json.tmp");
            Files.writeString(temporal, json, StandardCharsets.UTF_8);
            try {
                Files.move(temporal, destino, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException e) {
                Files.move(temporal, destino, StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }

    // =====================================================================
    //  PostgreSQL (una fila por colección, con el JSON completo)
    // =====================================================================
    final class Postgres implements Almacenamiento {
        private final String jdbc;
        private final Properties props = new Properties();
        private final String host;

        Postgres(String databaseUrl) throws IOException {
            // Acepta postgres://usuario:clave@host:puerto/bd?sslmode=require
            // y también una URL jdbc:postgresql://... ya preparada.
            try {
                Class.forName("org.postgresql.Driver");
            } catch (ClassNotFoundException e) {
                throw new IOException("DATABASE_URL está definida pero falta el driver de PostgreSQL (lib/postgresql.jar)");
            }
            if (databaseUrl.startsWith("jdbc:")) {
                jdbc = databaseUrl;
                host = "PostgreSQL";
            } else {
                URI u = URI.create(databaseUrl.replaceFirst("^postgres(ql)?://", "http://"));
                String info = u.getRawUserInfo();
                if (info != null) {
                    String[] partes = info.split(":", 2);
                    props.setProperty("user", decodificar(partes[0]));
                    if (partes.length > 1) {
                        props.setProperty("password", decodificar(partes[1]));
                    }
                }
                int puerto = u.getPort() > 0 ? u.getPort() : 5432;
                String consulta = u.getRawQuery() == null ? "" : u.getRawQuery();
                // Los proveedores externos (Neon, Supabase…) exigen SSL; el interno de Render no.
                if (!consulta.contains("sslmode") && u.getHost() != null && u.getHost().contains(".")) {
                    consulta = (consulta.isEmpty() ? "" : consulta + "&") + "sslmode=require";
                }
                jdbc = "jdbc:postgresql://" + u.getHost() + ":" + puerto + u.getRawPath()
                        + (consulta.isEmpty() ? "" : "?" + consulta);
                host = u.getHost();
            }
            props.setProperty("connectTimeout", "15");
            try (Connection c = conectar(); Statement st = c.createStatement()) {
                st.execute("""
                        CREATE TABLE IF NOT EXISTS umbrella_colecciones (
                            nombre      VARCHAR(64) PRIMARY KEY,
                            datos       TEXT NOT NULL,
                            actualizado TIMESTAMPTZ NOT NULL DEFAULT now()
                        )""");
                st.execute("""
                        CREATE TABLE IF NOT EXISTS umbrella_archivos (
                            nombre      VARCHAR(128) PRIMARY KEY,
                            datos       BYTEA NOT NULL,
                            actualizado TIMESTAMPTZ NOT NULL DEFAULT now()
                        )""");
            } catch (SQLException e) {
                throw new IOException("No se puede conectar con PostgreSQL: " + e.getMessage(), e);
            }
        }

        private static String decodificar(String s) {
            return java.net.URLDecoder.decode(s, StandardCharsets.UTF_8);
        }

        private Connection conectar() throws SQLException {
            return DriverManager.getConnection(jdbc, props);
        }

        @Override
        public String descripcion() {
            return "PostgreSQL en " + host;
        }

        @Override
        public Map<String, String> cargarTodo() throws IOException {
            Map<String, String> todo = new LinkedHashMap<>();
            try (Connection c = conectar(); Statement st = c.createStatement();
                 ResultSet rs = st.executeQuery("SELECT nombre, datos FROM umbrella_colecciones")) {
                while (rs.next()) {
                    todo.put(rs.getString(1), rs.getString(2));
                }
            } catch (SQLException e) {
                throw new IOException("Error leyendo PostgreSQL: " + e.getMessage(), e);
            }
            return todo;
        }

        @Override
        public void escribir(String coleccion, String json) throws IOException {
            // Reintento único: las conexiones a bases gratuitas a veces se cortan tras un rato inactivas.
            for (int intento = 1; ; intento++) {
                try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement("""
                        INSERT INTO umbrella_colecciones (nombre, datos, actualizado) VALUES (?, ?, now())
                        ON CONFLICT (nombre) DO UPDATE SET datos = EXCLUDED.datos, actualizado = now()""")) {
                    ps.setString(1, coleccion);
                    ps.setString(2, json);
                    ps.executeUpdate();
                    return;
                } catch (SQLException e) {
                    if (intento >= 2) {
                        throw new IOException("Error escribiendo en PostgreSQL: " + e.getMessage(), e);
                    }
                }
            }
        }

        @Override
        public void guardarArchivo(String nombre, byte[] datos) throws IOException {
            try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement("""
                    INSERT INTO umbrella_archivos (nombre, datos, actualizado) VALUES (?, ?, now())
                    ON CONFLICT (nombre) DO UPDATE SET datos = EXCLUDED.datos, actualizado = now()""")) {
                ps.setString(1, nombre);
                ps.setBytes(2, datos);
                ps.executeUpdate();
            } catch (SQLException e) {
                throw new IOException("Error guardando archivo en PostgreSQL: " + e.getMessage(), e);
            }
        }

        @Override
        public byte[] leerArchivo(String nombre) throws IOException {
            try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(
                    "SELECT datos FROM umbrella_archivos WHERE nombre = ?")) {
                ps.setString(1, nombre);
                try (ResultSet rs = ps.executeQuery()) {
                    return rs.next() ? rs.getBytes(1) : null;
                }
            } catch (SQLException e) {
                throw new IOException("Error leyendo archivo de PostgreSQL: " + e.getMessage(), e);
            }
        }

        @Override
        public boolean borrarArchivo(String nombre) throws IOException {
            try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(
                    "DELETE FROM umbrella_archivos WHERE nombre = ?")) {
                ps.setString(1, nombre);
                return ps.executeUpdate() > 0;
            } catch (SQLException e) {
                throw new IOException("Error borrando archivo de PostgreSQL: " + e.getMessage(), e);
            }
        }

        @Override
        public Map<String, Long> listarArchivos() throws IOException {
            Map<String, Long> m = new java.util.TreeMap<>();
            try (Connection c = conectar(); Statement st = c.createStatement();
                 ResultSet rs = st.executeQuery("SELECT nombre, octet_length(datos) FROM umbrella_archivos")) {
                while (rs.next()) {
                    m.put(rs.getString(1), rs.getLong(2));
                }
            } catch (SQLException e) {
                throw new IOException("Error listando archivos de PostgreSQL: " + e.getMessage(), e);
            }
            return m;
        }
    }
}
