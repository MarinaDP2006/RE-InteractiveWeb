/*
 * ============================================================================
 *  Seguridad.java — El ÚNICO administrador de la web.
 * ============================================================================
 *  · La contraseña se guarda como hash PBKDF2-SHA256 (210.000 iteraciones)
 *    con sal aleatoria, en la colección _config (documento "admin").
 *  · Primera vez: se usa la variable ADMIN_PASSWORD; si no existe, se genera
 *    una contraseña aleatoria que se muestra en la consola y se guarda en
 *    data/ADMIN_INICIAL.txt (bórralo después de cambiarla).
 *  · ¿Contraseña olvidada? Arranca con ADMIN_RESET=true y ADMIN_PASSWORD=nueva.
 *  · Sesiones con token aleatorio (cabecera Authorization: Bearer ...), que
 *    caducan tras 8 h sin uso.
 *  · Fuerza bruta: 5 fallos desde la misma IP → bloqueada 15 minutos.
 *  · "Ver como admin": la app pide un ticket de un solo uso (60 s) y abre el
 *    navegador; el servidor lo canjea por una cookie que permite ver la web
 *    aunque esté cerrada al público.
 * ============================================================================
 */
package es.umbrella;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

final class Seguridad {

    private static final int ITERACIONES = 210_000;
    private static final long DURACION_SESION_MS = 8L * 3600 * 1000;
    private static final long DURACION_VISTA_MS = 4L * 3600 * 1000;
    private static final long DURACION_TICKET_MS = 60_000;
    private static final int MAX_FALLOS = 5;
    private static final long BLOQUEO_MS = 15L * 60 * 1000;
    static final String COOKIE_VISTA = "umbrella_vista";

    private final BaseDatos db;
    private final SecureRandom azar = new SecureRandom();
    private final Map<String, Long> sesiones = new ConcurrentHashMap<>();
    private final Map<String, Long> vistas = new ConcurrentHashMap<>();
    private final Map<String, Long> tickets = new ConcurrentHashMap<>();
    private final Map<String, long[]> fallos = new ConcurrentHashMap<>(); // ip → [nº fallos, instante del primero]

    Seguridad(BaseDatos db, Path carpetaDatos) throws IOException {
        this.db = db;
        inicializar(carpetaDatos);
    }

    private void inicializar(Path carpetaDatos) throws IOException {
        String usuarioEnv = env("ADMIN_USER", "admin");
        String claveEnv = System.getenv("ADMIN_PASSWORD");
        boolean reset = "true".equalsIgnoreCase(System.getenv("ADMIN_RESET"));
        Map<String, Object> actual = db.obtener("_config", "admin");

        if (actual != null && !(reset && claveEnv != null && !claveEnv.isBlank())) {
            return; // Ya hay administrador.
        }
        String clave = claveEnv;
        boolean generada = false;
        if (clave == null || clave.isBlank()) {
            clave = generarClave();
            generada = true;
        }
        establecer(usuarioEnv, clave);
        if (generada) {
            Path aviso = carpetaDatos.resolve("ADMIN_INICIAL.txt");
            Files.writeString(aviso, "Usuario: " + usuarioEnv + "\nContraseña: " + clave
                    + "\n\nCámbiala desde la app de administración (Ajustes) y borra este archivo.\n", StandardCharsets.UTF_8);
            System.out.println("""
                    ╔══════════════════════════════════════════════════════════════╗
                    ║  ADMINISTRADOR CREADO                                        ║
                    ╚══════════════════════════════════════════════════════════════╝""");
            System.out.println("   Usuario:    " + usuarioEnv);
            System.out.println("   Contraseña: " + clave);
            System.out.println("   (también guardada en " + aviso.toAbsolutePath() + ")");
        } else {
            System.out.println("[SEGURIDAD] Administrador '" + usuarioEnv + "' " + (reset ? "restablecido" : "creado") + " con ADMIN_PASSWORD.");
        }
    }

    private static String env(String nombre, String porDefecto) {
        String v = System.getenv(nombre);
        return v == null || v.isBlank() ? porDefecto : v.trim();
    }

    private String generarClave() {
        final char[] alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789".toCharArray();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            if (i > 0 && i % 4 == 0) {
                sb.append('-');
            }
            sb.append(alfabeto[azar.nextInt(alfabeto.length)]);
        }
        return sb.toString();
    }

    // ------------------------------------------------------------------
    //  Contraseña
    // ------------------------------------------------------------------

    private void establecer(String usuario, String clave) throws IOException {
        byte[] sal = new byte[16];
        azar.nextBytes(sal);
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("usuario", usuario);
        doc.put("sal", Base64.getEncoder().encodeToString(sal));
        doc.put("hash", hash(clave, sal, ITERACIONES));
        doc.put("iteraciones", (long) ITERACIONES);
        doc.put("cambiada", Instant.now().toString());
        db.guardar("_config", "admin", doc);
    }

    private static String hash(String clave, byte[] sal, int iteraciones) {
        try {
            PBEKeySpec spec = new PBEKeySpec(clave.toCharArray(), sal, iteraciones, 256);
            byte[] h = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
            spec.clearPassword();
            return HexFormat.of().formatHex(h);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("PBKDF2 no disponible", e);
        }
    }

    private boolean credencialesValidas(String usuario, String clave) {
        Map<String, Object> admin = db.obtener("_config", "admin");
        if (admin == null || usuario == null || clave == null) {
            return false;
        }
        byte[] sal = Base64.getDecoder().decode(Json.texto(admin, "sal", ""));
        int it = (int) Json.numero(admin, "iteraciones", ITERACIONES);
        String esperado = Json.texto(admin, "hash", "");
        boolean claveOk = MessageDigest.isEqual(
                hash(clave, sal, it).getBytes(StandardCharsets.UTF_8), esperado.getBytes(StandardCharsets.UTF_8));
        boolean usuarioOk = MessageDigest.isEqual(
                usuario.trim().getBytes(StandardCharsets.UTF_8), Json.texto(admin, "usuario", "").getBytes(StandardCharsets.UTF_8));
        return claveOk && usuarioOk;
    }

    String usuario() {
        return Json.texto(db.obtener("_config", "admin"), "usuario", "admin");
    }

    /** Cambia usuario y/o contraseña. Cierra todas las demás sesiones. */
    void cambiar(String claveActual, String nuevoUsuario, String nuevaClave, String tokenQueSeConserva) throws IOException {
        if (!credencialesValidas(usuario(), claveActual)) {
            throw new Peticion.ErrorHttp(403, "La contraseña actual no es correcta");
        }
        if (nuevaClave == null || nuevaClave.length() < 10) {
            throw new Peticion.ErrorHttp(400, "La nueva contraseña debe tener al menos 10 caracteres");
        }
        String u = nuevoUsuario == null || nuevoUsuario.isBlank() ? usuario() : nuevoUsuario.trim();
        if (!u.matches("[A-Za-z0-9._-]{3,32}")) {
            throw new Peticion.ErrorHttp(400, "Usuario no válido (3-32 caracteres: letras, números, . _ -)");
        }
        establecer(u, nuevaClave);
        sesiones.keySet().removeIf(t -> !t.equals(tokenQueSeConserva));
        vistas.clear();
    }

    // ------------------------------------------------------------------
    //  Inicio de sesión
    // ------------------------------------------------------------------

    /** Devuelve un token o lanza ErrorHttp (401 / 429). */
    String iniciarSesion(String usuario, String clave, String ip) throws InterruptedException {
        long ahora = System.currentTimeMillis();
        long[] f = fallos.get(ip);
        if (f != null && f[0] >= MAX_FALLOS) {
            long restante = f[1] + BLOQUEO_MS - ahora;
            if (restante > 0) {
                throw new Peticion.ErrorHttp(429, "Demasiados intentos fallidos. Espera " + (restante / 60000 + 1) + " minutos.");
            }
            fallos.remove(ip);
        }
        if (!credencialesValidas(usuario, clave)) {
            fallos.compute(ip, (k, v) -> {
                if (v == null || ahora - v[1] > BLOQUEO_MS) {
                    return new long[]{1, ahora};
                }
                v[0]++;
                return v;
            });
            Thread.sleep(600); // ralentiza los ataques de diccionario
            throw new Peticion.ErrorHttp(401, "Usuario o contraseña incorrectos");
        }
        fallos.remove(ip);
        limpiarCaducadas();
        String token = aleatorio(32);
        sesiones.put(token, ahora + DURACION_SESION_MS);
        return token;
    }

    void cerrarSesion(String token) {
        if (token != null) {
            sesiones.remove(token);
        }
    }

    /** Token de la cabecera Authorization si es válido (renueva la caducidad); si no, null. */
    String tokenValido(Peticion p) {
        String auth = p.cabecera("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return null;
        }
        String token = auth.substring(7).trim();
        Long caduca = sesiones.get(token);
        long ahora = System.currentTimeMillis();
        if (caduca == null || caduca < ahora) {
            sesiones.remove(token);
            return null;
        }
        sesiones.put(token, ahora + DURACION_SESION_MS);
        return token;
    }

    int sesionesActivas() {
        limpiarCaducadas();
        return sesiones.size();
    }

    // ------------------------------------------------------------------
    //  Vista previa en el navegador (ticket → cookie)
    // ------------------------------------------------------------------

    String crearTicket() {
        limpiarCaducadas();
        String t = aleatorio(24);
        tickets.put(t, System.currentTimeMillis() + DURACION_TICKET_MS);
        return t;
    }

    /** Canjea un ticket por un token de vista (cookie). Null si no es válido. */
    String canjearTicket(String ticket) {
        if (ticket == null) {
            return null;
        }
        Long caduca = tickets.remove(ticket);
        if (caduca == null || caduca < System.currentTimeMillis()) {
            return null;
        }
        String vista = aleatorio(32);
        vistas.put(vista, System.currentTimeMillis() + DURACION_VISTA_MS);
        return vista;
    }

    /** ¿La petición viene del admin (cookie de vista previa)? */
    boolean esVistaAdmin(Peticion p) {
        String c = p.cookie(COOKIE_VISTA);
        if (c == null) {
            return false;
        }
        Long caduca = vistas.get(c);
        return caduca != null && caduca > System.currentTimeMillis();
    }

    private void limpiarCaducadas() {
        long ahora = System.currentTimeMillis();
        sesiones.values().removeIf(c -> c < ahora);
        vistas.values().removeIf(c -> c < ahora);
        tickets.values().removeIf(c -> c < ahora);
    }

    private String aleatorio(int bytes) {
        byte[] b = new byte[bytes];
        azar.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
}
