# UMBRELLA ARCHIVES · RE Wiki + Juego

Proyecto fan de **Resident Evil** con tres piezas:

| Pieza | Qué es | Dónde |
|---|---|---|
| **Wiki** | Toda la saga canon: 17 juegos, 9 películas y series, 68 personajes, 46 criaturas, 13 agentes biológicos, 14 organizaciones, 47 ubicaciones, cronología de 1919 a hoy, mapa mundial y plano de Raccoon City, 23 tráileres oficiales. | `/wiki/` |
| **Juego** | Escape room de terror en 3D (motor UMBRA), de RE2 a Requiem, 20 personajes jugables, cinemáticas al estilo RE, director del miedo, linterna, láser, agarres, puzzles validados en el servidor. | `/juego/` |
| **Umbrella Admin** | App de Windows para gestionarlo todo con un único administrador: wiki, juego, acceso público, imágenes y vídeos, base de datos y copias de seguridad. | `UmbrellaAdmin.exe` |

> ⚠ El juego contiene violencia explícita y gore. +18.

---

## 1. Ejecutarlo en tu PC

Requisito: **Java JDK 21** (`winget install EclipseAdoptium.Temurin.21.JDK`).

1. Doble clic en **`iniciar.bat`** → se abre `http://localhost:8080`.
2. La primera vez se crea el administrador: el usuario y la contraseña salen en la ventana negra y se guardan en `data\ADMIN_INICIAL.txt`.
3. Para gestionar la web: doble clic en **`admin.bat`** (o usa el `.exe`, abajo), servidor `http://localhost:8080`.

Los datos locales se guardan en la carpeta `data\` (no se sube a GitHub).

## 2. Descargar la app de administración (.exe)

**👉 [Descargar UmbrellaAdmin-windows.zip](https://github.com/MarinaDP2006/RE_Wiki-Game/releases/latest/download/UmbrellaAdmin-windows.zip)**

Descomprímelo donde quieras y abre **`UmbrellaAdmin.exe`**. Lleva Java dentro: **no hay que instalar nada**.
GitHub la vuelve a construir sola cada vez que subes cambios (pestaña *Actions*).

Para construirla tú: doble clic en `construir-admin.bat` → `dist\UmbrellaAdmin\UmbrellaAdmin.exe`.

### Qué puedes hacer con la app

| Sección | Funciones |
|---|---|
| **Panel** | Visitas de los últimos 30 días (portal, wiki, juego, únicos), fichas más vistas, ranking, estado del servidor y avisos. |
| **Acceso público** | Abrir o cerrar la wiki y el juego al público con un mensaje de mantenimiento. Anuncio en el portal. |
| **Wiki** | Crear, editar, duplicar, ocultar y borrar fichas de cada sección; subir su imagen o vídeo; secciones del menú y portada; recuperar el contenido original. |
| **Juego** | Abrir/cerrar archivos, vídeo de introducción de cada archivo, mensaje del día, puzzles (soluciones y mensajes, con probador), partidas guardadas y ranking. |
| **Imágenes y vídeos** | Subir archivos (también arrastrándolos), copiar su dirección, borrarlos. |
| **Base de datos** | Explorador completo de todas las colecciones con editor JSON. |
| **Copias de seguridad** | Copias en el servidor y en tu PC (completas, con imágenes), restaurar desde archivo. La app hace una copia automática en `Documentos\UmbrellaAdmin\copias` cada vez que te conectas. |
| **Registro** | Historial de acciones del administrador e intentos de acceso fallidos. |
| **Ajustes** | Cambiar usuario y contraseña. Servidor local integrado (la app lleva la web dentro). |

Con **«Ver como admin»** abres la web en el navegador aunque esté cerrada al público.

## 3. Publicarla gratis en Render

### 3.1 Base de datos permanente (recomendado, gratis)

El plan gratuito de Render **borra el disco en cada reinicio**. Para que tus cambios no se pierdan, usa una base de datos PostgreSQL gratuita:

1. Entra en **[neon.tech](https://neon.tech)** y crea una cuenta gratuita (puedes usar la de GitHub).
2. Crea un proyecto (región Europa). Copia la **connection string**: `postgresql://usuario:clave@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

Sin `DATABASE_URL` la web funciona igual, pero los datos vuelven a los originales en cada reinicio (la app de administración te avisará en el Panel; podrás restaurar tu última copia del PC).

### 3.2 Crear el servicio

1. Entra en **[render.com](https://render.com)** con tu cuenta de GitHub.
2. **New → Blueprint** → elige el repositorio **RE_Wiki-Game** → **Apply**.
3. Te pedirá:
   - `ADMIN_PASSWORD`: la contraseña del administrador (mínimo 10 caracteres).
   - `DATABASE_URL`: la de Neon del paso anterior (o vacío).
4. Espera a que termine el despliegue (unos minutos). Tu web estará en `https://re-wiki-game.onrender.com` (o el nombre que te asigne Render).
5. Abre **Umbrella Admin** y entra con esa dirección, usuario `admin` y tu contraseña.

Cada `git push` vuelve a publicar la web sola. El plan gratuito «duerme» el servidor tras 15 minutos sin visitas: la primera visita tarda hasta un minuto en despertarlo.

**¿Olvidaste la contraseña?** En Render → Environment: pon `ADMIN_RESET` = `true` y una nueva `ADMIN_PASSWORD`, guarda (se reinicia), entra, y después borra `ADMIN_RESET`.

## 4. Estructura

```
servidor/   Servidor Java 21 sin dependencias: API, base de datos UmbraDB (JSON o PostgreSQL),
            admin único (PBKDF2), estadísticas, subidas, copias de seguridad
web/        Portal (index.html), wiki/, juego/, comun/ (estilos y efectos compartidos)
semilla/    Datos iniciales: wiki, puzzles y configuración (se cargan la primera vez)
admin/      App de escritorio Umbrella Admin (Java Swing)
Dockerfile, render.yaml           Despliegue en Render
iniciar.bat, admin.bat            Ejecutar en el PC
construir-admin.bat               Crear el .exe
.github/workflows/                Construcción automática del .exe en GitHub
```

### Variables de entorno del servidor

| Variable | Para qué |
|---|---|
| `PORT` | Puerto (Render la pone sola). |
| `DATABASE_URL` | PostgreSQL para guardar los datos de forma permanente. |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Administrador inicial. |
| `ADMIN_RESET` | `true` para restablecer la contraseña con `ADMIN_PASSWORD`. |

### Seguridad

- Un único administrador; contraseña con hash PBKDF2-SHA256 (210.000 iteraciones) y sal.
- Bloqueo de 15 minutos tras 5 intentos fallidos; sesiones que caducan a las 8 h.
- Las soluciones de los puzzles nunca llegan al navegador.
- Protección contra *path traversal* y cabeceras de seguridad.

