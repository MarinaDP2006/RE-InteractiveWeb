# UMBRELLA ARCHIVES · Resident Evil Wiki

Proyecto final individual: wiki de *Resident Evil* con Java 21, HTML, CSS y JavaScript. Incluye portal, wiki, búsqueda, cronología, mapa, fotografías y expedientes restringidos mediante Google.

> **Imágenes**: se conservan todas las imágenes y recursos gráficos existentes. No es necesario descargarlas de fuentes externas si clonas el repositorio completo.

## 1. Crear y arrancar el proyecto desde cero (Windows y VS Code)

Esta guía sirve para preparar un ordenador nuevo, descargar el código del proyecto y ponerlo a funcionar desde cero. **No hace falta crear una aplicación Angular, instalar Node.js, Maven ni ninguna base de datos para la versión local.**

### Paso 1: instalar herramientas

1. Instala [Visual Studio Code](https://code.visualstudio.com/).
2. Instala [Git para Windows](https://git-scm.com/download/win).
3. Instala Java **JDK 21**, no solo el JRE. En PowerShell:

```powershell
winget install EclipseAdoptium.Temurin.21.JDK
```

4. Cierra y abre PowerShell y comprueba:

```powershell
git --version
java -version
javac -version
```

Si `javac` no aparece, comprueba que el JDK esté instalado y añadido al PATH; vuelve a abrir la terminal.

### Paso 2: obtener el proyecto completo

Abre PowerShell en la carpeta donde quieras trabajar y ejecuta:

```powershell
git clone https://github.com/MarinaDP2006/RE-InteractiveWeb.git
cd RE-InteractiveWeb
code .
```

Así obtienes el servidor, el contenido, los estilos y todas las imágenes versionadas. Para futuras actualizaciones, ejecuta `git pull origin main` desde la misma carpeta.

### Paso 3: entender la estructura antes de modificarla

```text
RE-InteractiveWeb/
├── arrancar-web.bat              Ejecuta localmente el proyecto
├── web/
│   ├── index.html                Portada pública
│   ├── comun/                    Estilos y efectos comunes
│   ├── wiki/                     Páginas y scripts de la wiki
│   └── img/                      Imágenes y logotipo (CONSERVAR)
├── contenido/                     Archivos JSON con las fichas y secciones
├── servidor/src/main/java/es/umbrella/
│   ├── Servidor.java             Inicia el servidor y lee el puerto
│   ├── Api.java                  API de contenido y miembros
│   ├── Miembros.java             Autenticación con Google
│   └── Estaticos.java            Sirve HTML, CSS, JavaScript e imágenes
├── Dockerfile                     Empaquetado Java para Render
└── render.yaml                    Plantilla de despliegue Render
```

La portada se edita en `web/index.html`; los estilos compartidos en `web/comun/estilos.css`; los estilos de la wiki en `web/wiki/wiki.css`; los datos en `contenido/*.json`. **No borres imágenes existentes ni cambies sus rutas sin actualizar las referencias.**

### Paso 4: compilar y abrir en local

La forma más sencilla es hacer doble clic en **`arrancar-web.bat`** desde la raíz del proyecto.

Alternativamente, en PowerShell:

```powershell
New-Item -ItemType Directory -Force build | Out-Null
javac -encoding UTF-8 -d build servidor/src/main/java/es/umbrella/*.java
java -cp build es.umbrella.Servidor .
```

Si el comando `javac` con comodines no se expande correctamente en tu terminal, utiliza el archivo `.bat`, que compila automáticamente todos los `.java` del paquete.

Abre **http://localhost:8080**. La wiki está en **http://localhost:8080/wiki/**. Para detener el servidor, pulsa `Ctrl+C` en la consola.

### Paso 5: probar antes de editar

- Abre la portada, la wiki, una ficha, la cronología y el mapa.
- Comprueba que carguen las fotografías desde `/img/...`.
- Prueba el buscador y las rutas internas.
- Para editar, cambia el HTML/CSS/JS y recarga; si cambias Java, reinicia y recompila con `arrancar-web.bat`.
- Si el puerto 8080 está ocupado, desde CMD ejecuta `arrancar-web.bat 9090` y abre `http://localhost:9090`.

## 2. Configurar inicio de sesión con Google

Google Login no funciona solo con clonar el repositorio. Debes configurar un **ID de cliente OAuth** en un proyecto de Google Cloud:

1. Entra en [Google Cloud Console](https://console.cloud.google.com/), crea un proyecto y configura Google Auth Platform (pantalla de consentimiento, usuarios de prueba si corresponde).
2. En **Clients / Credenciales**, crea un cliente OAuth **Aplicación web**.
3. Añade el origen JavaScript autorizado **http://localhost:8080** para uso local. Si usas otro puerto, regístralo también.
4. Cuando Render te dé un dominio, añade asimismo **https://TU-SERVICIO.onrender.com** como origen autorizado. Google Sign-In con respuesta JavaScript no necesita redirección para este flujo.
5. Copia el **Client ID** acabado en `.apps.googleusercontent.com`. No publiques secretos de cliente ni credenciales privadas.
6. En PowerShell, si arrancas manualmente con Java:

```powershell
$env:GOOGLE_CLIENT_ID = 'TU_CLIENT_ID.apps.googleusercontent.com'
java -cp build es.umbrella.Servidor .
```

**Atención:** `arrancar-web.bat` conserva el valor de `GOOGLE_CLIENT_ID` que hayas definido previamente en tu terminal o en las variables de entorno de Windows. Para arrancarlo con ese valor desde PowerShell, ejecuta `cmd /c arrancar-web.bat` en la misma terminal. El Client ID no es una contraseña, pero **nunca** guardes secretos privados en Git.

La aplicación valida el ID token en Java, crea una cookie y protege expedientes ocultos desde la API. **Pendiente de endurecimiento antes de producción:** cookies con `Secure` bajo HTTPS, sesiones persistentes, control de origen/CSRF y pruebas completas del login.

## 3. Publicar en Render

El repositorio incluye **`Dockerfile`** y **`render.yaml`**. Render debe ejecutar **un servicio web Docker**, no un Static Site: la wiki necesita la API Java para servir contenido y validar a los miembros.

1. Abre [Render Dashboard](https://dashboard.render.com/) e inicia sesión.
2. Conecta tu cuenta GitHub a Render, otorgando acceso al repositorio `MarinaDP2006/RE-InteractiveWeb`.
3. Elige **New → Blueprint** y selecciona este repositorio. Render leerá `render.yaml`. Como alternativa, crea un **Web Service** con runtime Docker, rama `main` y Dockerfile de la raíz.
4. Introduce `GOOGLE_CLIENT_ID` como variable de entorno en Render (si ya has configurado Google OAuth). `PORT` está definido como `10000`.
5. Revisa la configuración del plan y sus posibles costes antes de confirmar el despliegue. Render construirá la imagen Java y mostrará un dominio real terminado en `.onrender.com`.
6. Una vez creado el servicio, prueba `https://TU-SERVICIO.onrender.com/`, `/wiki/`, `/api/miembro` y las rutas de las imágenes.
7. Añade el dominio exacto en los **orígenes JavaScript autorizados** de Google Cloud y vuelve a desplegar si cambiaste variables.
8. Comprueba los registros (Logs) si la compilación o el arranque fallan.

### Limitaciones importantes de publicación

- En servicios sin disco persistente, **`datos/miembros.json` se pierde** al recrear el contenedor. El token de sesión también se pierde al reiniciar el proceso. Para usuarios reales, migra registro y sesiones a una base de datos persistente o servicio equivalente.
- La configuración inicial permite publicar la wiki, pero **no garantiza que Google Login esté listo para producción** hasta completar las mejoras de seguridad indicadas.
- Nunca inventes la URL publicada: cópiala del panel de Render tras un despliegue correcto.
- Todas las imágenes versionadas se copian al contenedor mediante `COPY web/`; no se han eliminado ni sustituido.

## 4. Actualizar el proyecto

Desde la carpeta del repositorio:

```powershell
git pull origin main
```

Edita archivos, verifica la web localmente y sube tus cambios mediante Git. Los pushes a `main` pueden desencadenar un redeploy si activas Auto-Deploy en Render.

## 5. Estado de trabajo

Consulta [TAREAS-PENDIENTES.md](TAREAS-PENDIENTES.md) para las tareas terminadas y pendientes de verificación.

---

Proyecto de fans no oficial, realizado con fines educativos. Resident Evil pertenece a sus respectivos titulares.
