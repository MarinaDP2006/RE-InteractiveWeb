/*
 * ============================================================================
 *  GenerarIcono.java — Crea el icono .ico de Windows con el logotipo.
 * ============================================================================
 *  Lo usa construir-admin.bat (y GitHub Actions) para el .exe:
 *    java -cp build-admin es.umbrella.admin.GenerarIcono admin/umbrella.ico
 *  Formato ICO con imágenes PNG dentro (16, 24, 32, 48, 64, 128 y 256 px).
 * ============================================================================
 */
package es.umbrella.admin;

import javax.imageio.ImageIO;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public final class GenerarIcono {

    private GenerarIcono() {
    }

    public static void main(String[] args) throws IOException {
        Path destino = Path.of(args.length > 0 ? args[0] : "umbrella.ico");
        int[] tamanos = {16, 24, 32, 48, 64, 128, 256};
        List<byte[]> pngs = new ArrayList<>();
        for (int t : tamanos) {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            ImageIO.write(Tema.logo(t), "png", b);
            pngs.add(b.toByteArray());
        }
        int cabecera = 6 + 16 * tamanos.length;
        int total = cabecera;
        for (byte[] p : pngs) {
            total += p.length;
        }
        ByteBuffer buf = ByteBuffer.allocate(total).order(ByteOrder.LITTLE_ENDIAN);
        buf.putShort((short) 0).putShort((short) 1).putShort((short) tamanos.length);
        int desplazamiento = cabecera;
        for (int i = 0; i < tamanos.length; i++) {
            int t = tamanos[i];
            buf.put((byte) (t >= 256 ? 0 : t)).put((byte) (t >= 256 ? 0 : t)).put((byte) 0).put((byte) 0);
            buf.putShort((short) 1).putShort((short) 32);
            buf.putInt(pngs.get(i).length).putInt(desplazamiento);
            desplazamiento += pngs.get(i).length;
        }
        for (byte[] p : pngs) {
            buf.put(p);
        }
        if (destino.getParent() != null) {
            Files.createDirectories(destino.getParent());
        }
        Files.write(destino, buf.array());
        System.out.println("Icono creado: " + destino.toAbsolutePath());
    }
}
