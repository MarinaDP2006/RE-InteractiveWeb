# UMBRELLA ARCHIVES · RE Wiki + Juego

Proyecto fan de **Resident Evil** con tres piezas:

| Pieza | Qué es | Dónde |
|---|---|---|
| **Wiki** | Toda la saga canon: 17 juegos, 9 películas y series, 68 personajes, 46 criaturas, 13 agentes biológicos, 14 organizaciones, 47 ubicaciones, cronología de 1919 a hoy, mapa mundial y plano de Raccoon City, 23 tráileres oficiales. | `/wiki/` |
| **Juego 3D** | Survival horror en primera persona (Three.js) con los **9 Resident Evil principales**, de la mansión Spencer (RE1) a Requiem: salas en 3D con texturas PBR, linterna con sombras, zombis y B.O.W. con IA, perseguidores (Mr. X, Némesis, Jack, Dimitrescu, Ustanak), jefes finales, compañeros que disparan, llaves, documentos, puzzles validados en el servidor, mapa, inventario, máquinas de escribir y ranking. | `/juego/` |
| **Juego clásico** | La versión anterior en 2.5D (escape room con 20 personajes y cinemáticas). | `/juego/clasico.html` |
| **Umbrella Admin** | App de Windows para gestionarlo todo con un único administrador: wiki, juego, acceso público, imágenes y vídeos, base de datos y copias de seguridad. | `UmbrellaAdmin.exe` |

> ⚠ El juego contiene violencia explícita y gore. +18.

---

## 1. Ejecutarlo en tu PC

Requisito: **Java JDK 21** (`winget install EclipseAdoptium.Temurin.21.JDK`).

1. Doble clic en **`iniciar.bat`** → se abre `http://localhost:8080` (si ese puerto está ocupado, usa el de reserva `http://localhost:8090`).
2. La primera vez se crea el administrador: el usuario y la contraseña salen en la ventana negra y se guardan en `data\ADMIN_INICIAL.txt`.
3. Para gestionar la web: doble clic en **`admin.bat`** (o usa el `.exe`, abajo), servidor `http://localhost:8080`.

Mira el apartado **[Servidores y contraseñas](#servidores-y-contraseñas)** para saber qué contraseña usar en cada caso.

## Servidores y contraseñas

Hay **un administrador distinto en cada servidor**, porque cada uno guarda sus propios datos. La contraseña depende de **por dónde entras**:

| Cómo entras | Dirección (servidor) | Si está ocupado | Usuario | Dónde está la contraseña |
|---|---|---|---|---|
| **`iniciar.bat`** (web en tu PC) | `http://localhost:8080` | `http://localhost:8090` | `admin` | En la ventana negra la primera vez y en `data\ADMIN_INICIAL.txt` (carpeta del proyecto) |
| **App · «Usar el servidor de este PC»** | `http://localhost:8081` | `http://localhost:8091` | `admin` | La app la rellena sola. También en `Documentos\UmbrellaAdmin\servidor-local\data\ADMIN_INICIAL.txt` |
| **Web publicada en Render** | `https://re-wiki-game.onrender.com` | — | `admin` | La que escribiste en `ADMIN_PASSWORD` al crear el servicio (Render → *Environment*) |

- Los dos servidores del PC pueden estar abiertos a la vez sin molestarse (8080 y 8081). Si un puerto ya lo usa otro programa, cada servidor salta solo a su puerto de reserva y lo dice en pantalla.
- 🔐 **Las contraseñas no se suben a GitHub** (el repositorio es público). Para tenerlas a mano, el archivo **`CONTRASEÑAS.txt`** de la carpeta del proyecto las recoge en tu PC; está excluido de Git.
- **Cambiarla**: entra en Umbrella Admin con ese servidor → **Ajustes** → *Usuario y contraseña del administrador* (mínimo 10 caracteres). Después borra el `ADMIN_INICIAL.txt` correspondiente (en el servidor de la app se borra solo) y apunta la nueva en `CONTRASEÑAS.txt`.
- **¿La olvidaste?** En el PC: cierra el servidor, borra `_config.json` de su carpeta `data\db` (la configuración de acceso, la wiki y el juego vuelven a la original; las fichas no se tocan) y vuelve a arrancar: se crea un administrador nuevo. En Render: mira el apartado 3.

Los datos locales se guardan en la carpeta `data\` (no se sube a GitHub).

## 2. Instalar la app de gestión (Umbrella Admin) en tu PC

La app lleva Java dentro: **no hay que instalar Java ni nada más**. Funciona en Windows 10 y 11 (64 bits).

### 2.1 Descargar

**👉 [Descargar UmbrellaAdmin-windows.zip](https://github.com/MarinaDP2006/RE_Wiki-Game/releases/latest/download/UmbrellaAdmin-windows.zip)** (unos 50 MB)

También está en la página del repositorio → **Releases** → *Umbrella Admin · última versión*.

### 2.2 Instalar

1. Abre la carpeta **Descargas**, haz clic derecho en `UmbrellaAdmin-windows.zip` → **Extraer todo…**
2. Como destino, escribe una carpeta fija, por ejemplo `C:\Users\TU_USUARIO\Programas` (no la dejes en Descargas para no borrarla sin querer) → **Extraer**.
3. Dentro aparece la carpeta **`UmbrellaAdmin`**. **No saques el `.exe` de esa carpeta**: necesita las carpetas `app` y `runtime` que hay a su lado.
4. Crea un acceso directo en el escritorio: clic derecho en **`UmbrellaAdmin.exe`** → **Mostrar más opciones** → **Enviar a** → **Escritorio (crear acceso directo)**.
   Si quieres, arrástralo también a la barra de tareas o al menú Inicio.

### 2.3 Primer arranque

1. Abre **Umbrella Admin** desde el acceso directo.
2. Si Windows muestra **«Windows protegió su PC»** (SmartScreen), es porque la app no está firmada con un certificado de pago: pulsa **Más información** → **Ejecutar de todas formas**. Solo pasa la primera vez.
3. En la ventana de acceso:
   - **Web publicada en Render**: en *Servidor* escribe su dirección (p. ej. `https://re-wiki-game.onrender.com`), usuario `admin` y la contraseña que pusiste en `ADMIN_PASSWORD`. Si la web estaba dormida, la primera conexión tarda hasta un minuto.
   - **Sin Internet / para probar**: pulsa **«Usar el servidor de este PC»**. La app arranca la web dentro de tu PC (`http://localhost:8081`) y rellena sola el usuario y la contraseña de la primera vez. Cámbiala después en **Ajustes**.
4. La app recuerda los servidores y el usuario (nunca la contraseña).

### 2.4 Dónde guarda las cosas

| Qué | Carpeta |
|---|---|
| Copias de seguridad automáticas (cada vez que te conectas) | `Documentos\UmbrellaAdmin\copias` (se puede cambiar en *Copias de seguridad*) |
| Datos del servidor local del PC | `Documentos\UmbrellaAdmin\servidor-local\data` |
| Preferencias de la app | `C:\Users\TU_USUARIO\.umbrella-admin` |

### 2.5 Actualizar y desinstalar

- **Actualizar**: cierra la app, descarga de nuevo el zip y extráelo **en la misma carpeta**, aceptando reemplazar los archivos. Tus copias, datos y preferencias no se tocan (están en otras carpetas).
- **Desinstalar**: borra la carpeta `UmbrellaAdmin` y el acceso directo. Si quieres borrarlo todo, borra también `Documentos\UmbrellaAdmin` y `.umbrella-admin`.

### 2.6 Problemas frecuentes

| Problema | Solución |
|---|---|
| «No se puede conectar con …» | Revisa la dirección (con `https://`). En Render, espera un minuto y vuelve a intentarlo. |
| «Usuario o contraseña incorrectos» | Tras 5 fallos se bloquea 15 minutos. Si la olvidaste, mira el apartado 3 (*¿Olvidaste la contraseña?*). |
| «No se pudo arrancar… puertos 8081 y 8091 ocupados» | Otro programa usa esos puertos. Ciérralo, o conéctate a la web de `iniciar.bat` en `http://localhost:8080`. |
| No arranca al hacer doble clic | Comprueba que extrajiste el zip completo y que `app` y `runtime` están junto al `.exe`. |

### 2.7 Construirla tú (opcional)

GitHub la construye sola cada vez que subes cambios (pestaña *Actions*). Si prefieres hacerlo en tu PC (necesitas el JDK 21):
doble clic en `construir-admin.bat` → `dist\UmbrellaAdmin\UmbrellaAdmin.exe` y `dist\UmbrellaAdmin-windows.zip`.
Sin construir nada, también puedes abrirla con `admin.bat` si tienes Java 21 instalado.

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

## El juego 3D

Abre `/juego/`. **Nueva partida** juega la campaña completa (archivo I → IX); **Elegir archivo** juega uno suelto. El administrador puede cerrar archivos o poner un vídeo de introducción desde la app (pestaña *Juego*).

| Archivo | Juego | Protagonista | Lugar | Jefe |
|---|---|---|---|---|
| I | Resident Evil | Jill (+ Chris) | Mansión Spencer | Tyrant T-002 |
| II | Resident Evil 2 | Leon (+ Ada) | Comisaría de Raccoon City · NEST | G (William Birkin) |
| III | Resident Evil 3 | Jill (+ Carlos) | Calles de Raccoon · torre del reloj | Némesis |
| IV | Resident Evil 4 | Leon (+ Luis) | Pueblo de los Ganados · castillo Salazar | Bitores Méndez |
| V | Resident Evil 5 | Chris (+ Sheva) | Kijuju · muelle · laboratorio de Tricell | Albert Wesker |
| VI | Resident Evil 6 | Jake (+ Sherry) | Edonia | Ustanak |
| VII | Resident Evil 7 | Ethan (+ Mia) | Casa de los Baker | Jack Baker |
| VIII | Resident Evil Village | Ethan | La aldea · castillo Dimitrescu · casa Beneviento | Madre Miranda |
| IX | Resident Evil Requiem | Grace (+ Leon) | Hotel Wrenwood | Victor Gideon |

**Controles (teclado y ratón)**

| Tecla | Acción |
|---|---|
| Ratón | Mirar (haz clic en la pantalla para capturar el ratón) |
| W A S D · Mayús | Moverse · correr |
| Clic derecho · clic izquierdo | Apuntar con láser · disparar (apuntando quieto, la mira se cierra y el tiro es más preciso; la cabeza hace triple daño) |
| R · V · F | Recargar · cuchillo · linterna |
| 1 · 2 | Pistola · escopeta |
| E | Abrir puertas, recoger, leer, examinar, usar la máquina de escribir. Si un enemigo te agarra: pulsa E o Espacio muy rápido |
| H | Curarse con lo que tengas |
| Tab / I · M · J | Inventario (usar y combinar hierbas) · mapa · archivos leídos |
| Esc | Pausa (opciones: calidad hasta *Ultra* con supermuestreo 4K, brillo, campo de visión, sensibilidad, sonido, reducir destellos) |

En móvil aparecen un joystick y botones táctiles. Las partidas se guardan en la máquina de escribir (gasta una cinta de tinta) en el navegador y en el servidor: el **código** que te da sirve para seguir en otro dispositivo (*Cargar con código*).

## 4. Estructura

```
servidor/   Servidor Java 21 sin dependencias: API, base de datos UmbraDB (JSON o PostgreSQL),
            admin único (PBKDF2), estadísticas, subidas, copias de seguridad
web/        Portal (index.html), wiki/, juego/ (3D: index.html + 3d/motor y 3d/niveles;
            clásico 2.5D: clasico.html + js/), comun/ (estilos y efectos compartidos)
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

