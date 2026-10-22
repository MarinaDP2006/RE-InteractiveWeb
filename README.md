# UMBRELLA ARCHIVES · Resident Evil
**Estado actual:** este repositorio conserva el diseño del portal y de la wiki, los archivos **HTML, CSS y todas las imágenes**. La versión en la rama `main` es **solo una maqueta visual**: no hay JavaScript funcional, servidor Java, API, registro, búsqueda real ni base de datos. No se deben introducir credenciales reales en estas pantallas.

## Parte A. Ver el diseño actual en Windows y Visual Studio Code
1. Instala [Visual Studio Code](https://code.visualstudio.com/) y [Git](https://git-scm.com/downloads).
2. Abre PowerShell y ejecuta:

```powershell
git clone https://github.com/MarinaDP2006/RE-InteractiveWeb.git
cd RE-InteractiveWeb
code .
```

3. Abre `web/index.html`. Para navegar por los enlaces desde el navegador, es preferible usar **Live Server** de VS Code: instálalo desde Extensiones, haz clic derecho en `web/index.html` y selecciona **Open with Live Server**. La URL puede ser `http://127.0.0.1:5500/` o `http://127.0.0.1:5500/web/` dependiendo de la carpeta raíz seleccionada.
4. Si Live Server toma la raíz del repositorio, abre `http://127.0.0.1:5500/web/index.html`. Si toma `web/`, abre `http://127.0.0.1:5500/index.html`.
5. Comprueba también `web/wiki/index.html`.

No hay que instalar Node.js ni Java para **ver la maqueta**, y no hay que arrancar Docker ni un servidor Java.

### Páginas que puedes previsualizar
- `web/index.html`: portal original adaptado a la maqueta.
- `web/wiki/index.html`: portada de secciones.
- `web/wiki/juegos.html`, `personajes.html`, `criaturas.html`, `virus.html`, `organizaciones.html`, `lugares.html` y `peliculas.html`.
- `web/wiki/cronologia.html`, `mapa.html`, `buscar.html`, `acceso.html` y `ficha.html`.

Las tarjetas contienen **textos de muestra**, conservan imágenes del repositorio y enlazan por HTML. Ni la búsqueda ni el registro almacenan información.

## Parte B. Arquitectura definitiva que vamos a construir
La nueva aplicación se hará desde cero y **en carpetas nuevas**, conservando `web/` como la referencia visual:

```RE-InteractiveWeb/
├── web/                    # Maqueta y recursos originales: NO TOCAR/NO BORRAR
├── angular-app/            # Frontend Angular: se creará
├── api-node/               # API Node.js opcional: se creará
├── escritorio-javafx/      # Aplicación Windows con JavaFX: se creará
└── README.md
```

- **Angular**: interfaz web real, pestañas, componentes, navegación, búsqueda y fichas.
- **Node.js**: herramienta de compilación y entorno de Angular; un servidor Express opcional para procesos privados que no deban ejecutarse en el navegador.
- **JavaFX**: una aplicación de escritorio en Windows para gestionar, iniciar o abrir la wiki, presentar un panel de estado y lanzar la página publicada. JavaFX no reemplaza a Node.js ni a Firebase.
- **Firebase Authentication + Cloud Firestore**: registro por correo/contraseña (y Google si se decide activarlo después), datos de perfil y preferencias con reglas de seguridad.
- **Hosting gratuito**: publicar Angular como web estática en Firebase Hosting (Spark) o Cloudflare Pages (Free), según cuotas y requisitos. Si usas solamente Firebase cliente, **no necesitas mantener un servidor Node público encendido**.

Es importante: *gratis* significa **plan gratuito sujeto a límites y condiciones**, no recursos ilimitados de por vida. Nunca habilites facturación ni una opción que genere costes sin revisarla antes.

## Parte C. Instalar herramientas en VS Code
Instala, de fuentes oficiales:
1. Git y Visual Studio Code.
2. **Node.js LTS** con npm. Verifica `node --version` y `npm --version`.
3. **JDK 21** de Eclipse Temurin. Verifica `java -version` y `javac -version`.
4. **Apache Maven** para JavaFX. Verifica `mvn -version`.
5. Extensiones VS Code: **Angular Language Service**, **Extension Pack for Java**, **Maven for Java** y **Live Server**.

No hace falta instalar MySQL local para empezar. La base de datos inicial será Cloud Firestore, con cuota gratuita y persistencia gestionada.

## Parte D. Crear Angular desde cero
Abre la terminal integrada de VS Code en la raíz del repositorio:

```powershell
npm install -g @angular/cli
ng new angular-app --routing --style=scss --standalone --skip-git
cd angular-app
ng serve --open
```

Angular abre `http://localhost:4200`. Para el proyecto vamos a crear rutas y componentes:

```powershell
ng generate component pages/inicio
ng generate component pages/juegos
ng generate component pages/personajes
ng generate component pages/criaturas
ng generate component pages/virus
ng generate component pages/organizaciones
ng generate component pages/lugares
ng generate component pages/peliculas
ng generate component pages/cronologia
ng generate component pages/mapa
ng generate component pages/buscar
ng generate component pages/ficha
ng generate component pages/acceso
ng generate component components/layout/navbar
ng generate component components/layout/footer
ng generate service services/auth
ng generate service services/archives
```

**Rutas** en `src/app/app.routes.ts` (ajusta la ruta real según la versión instalada de Angular):

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/inicio/inicio').then(m => m.Inicio) },
  { path: 'juegos', loadComponent: () => import('./pages/juegos/juegos').then(m => m.Juegos) },
  { path: 'personajes', loadComponent: () => import('./pages/personajes/personajes').then(m => m.Personajes) },
  { path: 'criaturas', loadComponent: () => import('./pages/criaturas/criaturas').then(m => m.Criaturas) },
  { path: 'cronologia', loadComponent: () => import('./pages/cronologia/cronologia').then(m => m.Cronologia) },
  { path: 'mapa', loadComponent: () => import('./pages/mapa/mapa').then(m => m.Mapa) },
  { path: '**', redirectTo: '' },
];
```

**Nota:** Angular puede cambiar los nombres de sus clases y archivos según la versión. Comprueba las clases generadas antes de copiar los imports.

### Conservar el diseño antiguo
Usa `web/index.html`, `web/wiki/index.html`, `web/wiki/maqueta.css` y el resto de CSS como referencia para crear las plantillas y los estilos SCSS de Angular. Copia los recursos desde `web/img/` a la carpeta pública de Angular (habitualmente `public/img/`) sin borrar los originales. No copies `/api/` ni scripts obsoletos: el diseño estático **no tiene backend**.

Para imágenes en Angular usarás rutas como `/img/escenarios/re2_vestibulo.webp`. Comienza por el componente de portada y después reproduce las tarjetas, filtros, ficha, cronología y mapa.

## Parte E. Registro e inicio de sesión gratis con Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/). Elige **Spark (sin coste)** y revisa la cuota disponible.
2. Registra una aplicación web y copia la configuración pública que muestra Firebase.
3. En **Authentication → Sign-in method**, habilita **Correo electrónico/contraseña**. No actives Google hasta que lo decidamos.
4. En **Firestore Database**, crea la base de datos en el plan gratuito y selecciona la región con cuidado. **No utilices reglas abiertas** en producción.
5. Dentro de `angular-app/`, instala las dependencias:

```powershell
npm install firebase @angular/fire
```

Puedes inicializar con AngularFire usando las instrucciones actuales de su documentación oficial, ya que sus APIs pueden cambiar.

### Modelo de datos recomendado
```text
usuarios/{uid}
  nombre: string
  fechaAlta: timestamp
  favoritos: string[]
  idioma: "es"
```

No almacenes contraseñas en Firestore: **Firebase Authentication administra las contraseñas**, no tu aplicación.

### Reglas mínimas para perfiles privados
```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Estas reglas son un punto de partida. Antes de publicar habrá que limitar campos, validar tipos, separar escrituras administrativas y revisar las consultas.

### Flujo de acceso
En `acceso`: formularios de registro, entrar, recuperar contraseña y cerrar sesión. Valida campos y errores; guarda el perfil bajo el `uid` que proporciona Firebase; usa guardias Angular para páginas privadas; **nunca confíes solo en los guardias del navegador para proteger datos**, porque la seguridad real está en las reglas de Firestore. Firebase puede tener límites de usuarios, operaciones y tráfico. Comprueba siempre las cuotas del plan Spark antes de activar funcionalidades adicionales.

## Parte F. API Node.js (solo si se necesita)
Angular necesita Node para compilar, **pero no exige un servidor Node en producción** si las operaciones se hacen de forma segura desde Firebase y el contenido es estático. Para una API de administración propia en el futuro:

```powershell
cd ..
mkdir api-node
cd api-node
npm init -y
npm install express cors dotenv
```

Crea `server.js`:

```javascript
const express = require('express');
const app = express();
app.use(express.json());
app.get('/api/estado', (_req, res) => res.json({ ok: true }));
const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log('API en puerto ' + port));
```

Ejecuta `node server.js`. Antes de añadir rutas de administración, implementa verificación de tokens de Firebase, autorización de roles, CORS restringido, rate limiting, validación de entradas y registro seguro de errores.

Si  necesitas un servidor remoto, **Render Free** puede ejecutar Node dentro de sus condiciones y cuotas, pero se suspende por inactividad y no es adecuado para tareas siempre encendidas. **No es necesario para la primera versión**.

## Parte G. Aplicación Windows con JavaFX
La aplicación JavaFX tendrá su propia ventana para gestionar el proyecto: botones **Abrir Umbrella Archives**, **Estado del sitio**, **Abrir carpeta del proyecto** y **Configuración**. El inicio de sesión seguirá ocurriendo de forma segura en Angular/Firebase, no mediante contraseñas guardadas por JavaFX.

1. Comprueba JDK 21 y Maven.
2. Crea `escritorio-javafx/` y genera un proyecto Maven JavaFX siguiendo el [tutorial oficial de OpenJFX](https://openjfx.io/openjfx-docs/).
3. Declara las dependencias `javafx-controls` y `javafx-fxml` y el plugin `javafx-maven-plugin` para una versión de JavaFX compatible con JDK 21.
4. Crea el punto de entrada JavaFX, por ejemplo:

```java
package es.umbrella;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import java.awt.Desktop;
import java.net.URI;

public class UmbrellaLauncher extends Application {
    @Override
    public void start(Stage stage) {
        Button abrir = new Button("Abrir Umbrella Archives");
        abrir.setOnAction(e -> {
            try {
                Desktop.getDesktop().browse(new URI("https://TU-SITIO.web.app"));
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        });
        VBox root = new VBox(16, abrir);
        root.setStyle("-fx-padding: 30;");
        stage.setScene(new Scene(root, 480, 250));
        stage.setTitle("Umbrella Archives · Panel de control");
        stage.show();
    }
    public static void main(String[] args) { launch(args); }
}
```

La URL de ejemplo debe sustituirse **después del despliegue real**. El navegador del sistema garantiza mejor compatibilidad con Angular moderno y el inicio de sesión que un `WebView` antiguo. En una fase posterior se puede evaluar `javafx-web`, pero hay que probar sus limitaciones con Firebase.

5. Ejecuta en la carpeta del proyecto JavaFX:
```powershell
mvn clean javafx:run
```

6. Para distribuir en Windows, estudia `jpackage` (incluido en el JDK), creando una imagen de aplicación y un instalador `.exe` con su runtime. Antes tendrás que empaquetar el proyecto Java y resolver sus dependencias JavaFX. No basta con renombrar un `.jar` a `.exe`.

**Importante:** si el sitio Angular está alojado gratis, la ventana JavaFX no necesita dejar un servidor local siempre encendido. Si eliges un modo completamente local, JavaFX puede iniciar un proceso Node mediante `ProcessBuilder` y detenerlo al cerrar, pero requiere controlar rutas, puertos, errores y evitar lanzar múltiples procesos. No confundas ese servidor local con el hosting público.

## Parte H. Publicar sin pagar (con límites)

### Opción recomendada: Angular + Firebase
1. Instala Firebase CLI: `npm install -g firebase-tools`.
2. Inicia sesión: `firebase login`.
3. Compila desde `angular-app`: `ng build`.
4. Ejecuta `firebase init hosting` y selecciona el proyecto Spark.
5. Indica como directorio público la carpeta **de salida del navegador** mostrada tras `ng build` (en versiones recientes suele ser `dist/angular-app/browser`).
6. Para Angular Router, configura la opción SPA y una regla de reescritura a `index.html`.
7. Publica: `firebase deploy --only hosting`.

El plan Spark tiene cuotas de Hosting, Authentication y Firestore. No añadas productos que exijan facturación sin verificarlo. Si cambias a otro proveedor, Cloudflare Pages Free es una alternativa para los archivos estáticos, mientras Firebase sigue sirviendo el login y los perfiles.

### ¿Y MySQL?
MySQL es gratuito como software, pero **un servidor MySQL público y persistente no tiene por qué ser gratuito**. Para evitar costes inesperados, empieza con Firestore bajo Spark. Si más adelante necesitas SQL relacional, valora Supabase Free/Postgres u otro proveedor y sus límites; no conectes nunca Angular directamente con una contraseña de base de datos.

## Parte I. Orden real de construcción
1. Conservar y verificar el diseño HTML/CSS e imágenes.
2. Instalar herramientas y generar el proyecto Angular.
3. Migrar pantalla a pantalla sin perder la estética original.
4. Modelar fichas, juegos, criaturas, cronología y mapas.
5. Añadir búsqueda, navegación y pruebas Angular.
6. Configurar Firebase Auth y Firestore con reglas restrictivas.
7. Publicar en Hosting gratuito comprobando las cuotas.
8. Crear el panel de escritorio JavaFX y enlazarlo con el sitio.
9. Usar Node/Express solo si surge una funcionalidad privada que lo exija.
10. Realizar pruebas de accesibilidad, seguridad, móviles y Windows antes de llamar al proyecto terminado.

## Sobre Render y la antigua aplicación Java
La maqueta actual **no tiene Dockerfile, render.yaml ni servidor**. El servicio Render antiguo que ejecutaba Java deja de ser compatible con el código nuevo de `main`. Si está conectado con autodespliegue, hay que **desactivar su autodespliegue o sustituirlo por un Static Site** para evitar errores al hacer push. No crees servidores duplicados por inercia. El backend anterior, incluidos sus archivos y tutoriales, está en la rama de respaldo. No lo utilices como backend público sin revisar su seguridad.

---
