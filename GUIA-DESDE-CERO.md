# GUÍA COMPLETA DESDE CERO · UMBRELLA ARCHIVES

Esta guía está pensada para alguien que empieza desde cero en **Windows con PowerShell y Visual Studio Code**. Haz cada paso en orden. Nunca copies comandos sin comprobar en qué carpeta estás.

## 0. Qué vamos a conseguir

Primero arrancaremos la web Angular, después la API Node, luego publicaremos Angular en Netlify. **JavaFX queda para el final**. La carpeta `web/` contiene la maqueta original y no debe borrarse. El proyecto nuevo es una base inicial: aún no incluye todas las fichas ni usuarios reales.

## 1. Instalar los programas

1. Instala Git desde https://git-scm.com/downloads
2. Instala VS Code desde https://code.visualstudio.com/
3. Instala Node.js **22 LTS** desde https://nodejs.org/ (Angular 19 admite Node 22). npm viene incluido.
4. Abre VS Code. Menú **Terminal → Nuevo terminal** y selecciona PowerShell.
5. Ejecuta, una línea cada vez:

```powershell
git --version
node --version
npm --version
```

Si algún comando no existe, cierra y vuelve a abrir VS Code después de instalarlo. No necesitas Java, Maven, Docker ni MySQL para esta fase.

## 2. Descargar el repositorio

En PowerShell:

```powershell
cd $HOME
mkdir Proyectos -ErrorAction SilentlyContinue
cd Proyectos
git clone https://github.com/MarinaDP2006/archivos-umbrella.git
cd archivos-umbrella
code .
```

Si ya tienes el repositorio, **no vuelvas a clonarlo encima**. Entra en su carpeta y ejecuta `git pull origin main`, siempre después de guardar o confirmar tus cambios locales.

La raíz es la carpeta que contiene `README.md`, `angular-app/`, `api-node/` y `web/`. Puedes comprobarlo con:

```powershell
pwd
dir
git status
```

## 3. Ejecutar Angular

En la terminal, desde la raíz:

```powershell
cd angular-app
npm install
npm start
```

Abre **http://localhost:4200**. Deja esa terminal abierta. Prueba Inicio, Wiki, Buscar y una ficha. La búsqueda actual trabaja con registros de ejemplo almacenados en `src/app.ts`, no con una base de datos.

Para detener el servidor, pulsa **Ctrl+C**. Para generar la web de producción:

```powershell
npm run build
node ../scripts/copiar-legado.mjs
```

Angular genera `angular-app/dist/umbrella/browser/`. El segundo comando copia `web/` a `legado/` y las imágenes originales a `img/` dentro de esa salida. No edites `dist/`: se regenera.

### Qué modificar en Angular

- `angular-app/src/app.ts`: rutas, páginas, componentes y expedientes de muestra.
- `angular-app/src/styles.css`: colores, tamaños y adaptación móvil.
- `angular-app/src/index.html`: título y metadatos.
- `angular-app/public/_redirects`: recarga de rutas en Netlify.
- `web/`: maqueta de referencia. **No modificar ni borrar**.

Para ampliar el proyecto, separa los componentes de `app.ts` en archivos individuales y migra las páginas originales una a una. Para generar componentes nuevos desde `angular-app/`:

```powershell
npx ng generate component pages/cronologia
npx ng generate component pages/mapa
npx ng generate component pages/acceso
```

Después debes añadir las rutas y enlazar las nuevas pantallas. Generar un componente no lo conecta automáticamente al menú.

## 4. Ejecutar la API Node

Abre una **segunda terminal** en VS Code, sin cerrar Angular. Desde la raíz del repositorio:

```powershell
cd api-node
npm install
Copy-Item .env.example .env
npm run dev
```

Si la terminal anterior sigue dentro de `angular-app/`, escribe primero `cd ..` y después `cd api-node`.

Abre estas direcciones en el navegador:

- http://localhost:3000/api/estado
- http://localhost:3000/api/archivos
- http://localhost:3000/api/archivos?q=leon
- http://localhost:3000/api/archivos/leon

El archivo `api-node/server.js` contiene el servidor y las rutas. `api-node/.env` contiene ajustes **locales**, y debe quedar fuera de Git. No almacenes contraseñas ni claves en el código ni en `.env.example`.

La API actual solo devuelve datos de demostración. Angular todavía usa su propio catálogo local; conectarlos es el siguiente trabajo de integración. No existe registro ni autenticación real.

## 5. Conectar Angular con la API (siguiente fase)

En producción, el navegador no puede llamar a `localhost:3000`: esa dirección sería el ordenador del visitante. Cuando la API esté desplegada, configura su URL pública en Angular y utiliza `HttpClient` para consultar `/api/archivos`.

En `api-node/.env`, establece `ALLOWED_ORIGINS` con el dominio exacto de tu web Netlify. Reinicia el servidor tras cambiar variables.

No publiques rutas privadas antes de implementar validación, autenticación, autorización, limitación de peticiones y almacenamiento seguro. CORS **no** es un sistema de autenticación.

## 6. Publicar la web original en Netlify (configuración actual)

El sitio público **rewikifan.netlify.app** utiliza directamente la carpeta `web/`, con sus archivos HTML, CSS, imágenes y páginas `wiki/*.html`. No necesitas compilar Angular para actualizarlo.

1. Edita los archivos de `web/` en VS Code.
2. Comprueba que `web/index.html`, `web/comun/estilos.css` y `web/img/` siguen presentes.
3. En la raíz del repositorio ejecuta `git status`, `git add web`, `git commit -m "Actualiza web original"` y `git push origin main`.
4. En Netlify abre el sitio **rewikifan**, conectado a `MarinaDP2006/archivos-umbrella` y rama `main`.
5. La configuración de `netlify.toml` debe tener `publish = "web"`, sin carpeta base ni comando de compilación.
6. Comprueba `https://rewikifan.netlify.app/`, `/wiki/index.html` y `/img/logo.svg`.
7. Si no se actualiza, abre el registro de despliegues y usa **Trigger deploy** en el sitio existente.

**Importante:** Angular sigue guardado en `angular-app/` como proyecto de desarrollo, pero no está publicado en este sitio. Para publicarlo en el futuro se deberá decidir si sustituye a la web original o si tendrá un sitio independiente. No borres `web/`.

## 7. Publicar API Node en Render (opcional, cuando esté preparada)

1. En https://dashboard.render.com/ comprueba si ya existe un servicio para esta API. No lo dupliques.
2. Crea o reutiliza un **Web Service** conectado al mismo repositorio y rama `main`.
3. Root Directory: `api-node`.
4. Build Command: `npm install`.
5. Start Command: `npm start`.
6. Configura `ALLOWED_ORIGINS=https://TU-SITIO.netlify.app` como variable de entorno. No añadas barra final.
7. El servicio utiliza `process.env.PORT`; Render asigna el puerto.
8. Tras desplegar, prueba `https://TU-API.onrender.com/api/estado` con el dominio real que te proporcione Render.

Comprueba las condiciones y límites actuales del plan antes de activarlo. El plan gratuito puede suspender servicios inactivos. No publiques endpoints de administración sin controles de seguridad.

## 8. Guardar cambios en GitHub

Abre una terminal **en la raíz** (`archivos-umbrella/`):

```powershell
git status
git add angular-app api-node scripts netlify.toml README.md GUIA-DESDE-CERO.md
git commit -m "Actualiza Umbrella Archives"
git push origin main
```

Si no has cambiado nada, Git indicará que no hay cambios que confirmar. Nunca subas `node_modules/`, `dist/` ni `.env`. Comprueba `git status` antes de hacer commit.

## 9. Solucionar errores frecuentes

- **npm no reconocido:** reinstala Node LTS, reinicia la terminal.
- **Puerto 4200 ocupado:** cierra otro `ng serve` o usa `npm start -- --port 4201`.
- **Puerto 3000 ocupado:** cambia `PORT=3001` en `api-node/.env`.
- **Imágenes no aparecen en Angular local:** las imágenes originales se copian al compilar para Netlify; para desarrollo local copia manualmente `web/img/` a `angular-app/public/img/` (no borres el original).
- **404 al recargar una ruta:** revisa `angular-app/public/_redirects` y el despliegue.
- **Error CORS:** revisa que `ALLOWED_ORIGINS` contenga el origen exacto del navegador, incluyendo protocolo y puerto.
- **Netlify falla:** abre el log, busca el primer error real y verifica la versión de Node y el directorio base.

## 10. Pruebas antes de entregar

Comprueba en móvil y escritorio la navegación, búsqueda, fichas, imágenes, enlaces, accesibilidad de teclado, recarga de rutas y mensajes de error. Después prueba API, CORS y despliegue. Anota qué funciona y qué está pendiente, sin presentar funciones de muestra como definitivas.

## 11. JavaFX, ÚLTIMA ETAPA (NO IMPLEMENTADA)

Cuando Angular y la API funcionen, instala **JDK 21**, **Maven**, **JavaFX** y, si quieres, **Scene Builder**. Verifica:

```powershell
java -version
javac -version
mvn -version
```

Entonces crea `escritorio-javafx/` con Maven y OpenJFX. Primero haz una ventana con un botón que abra la URL publicada de Netlify en el navegador predeterminado. Después añade estado del sitio, configuración y empaquetado con `jpackage`. No es necesario construir JavaFX para publicar Angular.

## 12. Orden recomendado para continuar

1. Ejecutar y corregir la compilación Angular.
2. Migrar completamente los diseños y fichas de `web/`.
3. Añadir datos y buscador completo.
4. Integrar Angular y API Node.
5. Incorporar autenticación y persistencia, si se necesitan.
6. Validar Netlify y, cuando corresponda, el alojamiento de la API.
7. Probar seguridad, móviles y accesibilidad.
8. Crear el escritorio JavaFX al final.

No confundas una base de proyecto con una aplicación terminada. Esta guía sirve para avanzar con comprobaciones en cada fase.
