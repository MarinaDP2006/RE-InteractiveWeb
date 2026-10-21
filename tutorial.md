# Tutorial · Cómo construir UMBRELLA ARCHIVES paso a paso

Guía para hacer el Proyecto Final completo desde cero hasta la **entrega en mayo de 2027**.
Cada paso dice **qué hacer**, **en qué archivos** y **cómo comprobar que funciona**.
El resultado final es exactamente lo que hay en este repositorio: si te atascas, compara con él.

---

## Calendario (octubre 2026 → mayo 2027)

| Cuándo | Objetivo | Pasos |
|---|---|---|
| **Finales de octubre – mediados de noviembre** | Equipo preparado, repositorio creado y propuesta aprobada | 1, 2 |
| **Noviembre** | Formato del contenido y primeras secciones escritas · bocetos del diseño | 3, 4 |
| **Diciembre** | Servidor funcionando y portal de entrada | 5, 6 |
| **Enero** | La wiki: portada, secciones y fichas · terminar de escribir el contenido | 7 |
| **Febrero** | Cronología, mapa y buscador | 8 |
| **Marzo** | Imágenes, ilustraciones, carteles y tráileres · «Únete para ver lo oculto» | 9, 10 |
| **Abril** | Pruebas, accesibilidad y ajustes · borrador de la memoria | 11, 12 |
| **Mayo** | Memoria final, presentación y ensayo de la defensa · **entrega** | 12, 13 |

Ritmo recomendado: **4 o 5 sesiones de trabajo por semana**. Deja libres las vacaciones de Navidad y Semana Santa como margen para recuperar retrasos.

> Regla de oro: al acabar cada sesión, guarda el trabajo en Git (paso 2.4). Así nunca pierdes nada y el historial demuestra tu trabajo.

---

## 1. Preparar el equipo · *finales de octubre*

Instala estos programas (en Windows, desde una terminal):

```bash
winget install EclipseAdoptium.Temurin.21.JDK
winget install Git.Git
winget install Microsoft.VisualStudioCode
winget install OpenJS.NodeJS.LTS
```

| Programa | Para qué |
|---|---|
| Java 21 (JDK) | Ejecutar el servidor de la web |
| Git | Guardar versiones y subirlas a GitHub |
| Visual Studio Code | Escribir el código y el contenido |
| Node.js | Solo para generar las ilustraciones (paso 9) |
| Google Chrome o Edge | Probar la web |

**Comprobación:** cierra y abre la terminal y escribe `java -version`, `git --version` y `node --version`. Las tres deben responder con un número de versión.

Extensiones útiles de VS Code: *Spanish Language Pack*, *Prettier* y *Live Server* (opcional).

---

## 2. Crear el repositorio y las carpetas · *finales de octubre*

### 2.1 Repositorio en GitHub

1. Crea una cuenta en GitHub (si no la tienes).
2. Pulsa **New repository**, ponle nombre (por ejemplo `RE_Wiki-Game`) y márcalo como **público** o **privado**, según prefiera tu tutor.
3. Clónalo en tu PC:

```bash
git clone https://github.com/TU_USUARIO/RE_Wiki-Game.git
```

### 2.2 Estructura de carpetas

Crea esta estructura vacía (el `README.md` explica qué va en cada sitio):

```
contenido/        textos de la wiki en JSON
web/
  comun/          estilos y efectos compartidos
  wiki/js/vistas/ código de la wiki
  img/            retratos/ cuerpo-entero/ escenarios/ ilustraciones/
servidor/src/main/java/es/umbrella/
herramientas/
```

### 2.3 Archivos de configuración de Git

- **`.gitignore`**: evita subir lo que se genera solo (`build/`, `datos/`, `node_modules/`).
- **`.gitattributes`**: obliga a que los `.bat` usen finales de línea de Windows.

Copia los dos tal cual están en este repositorio.

### 2.4 Guardar el trabajo (hazlo al final de cada sesión)

```bash
git add -A
git commit -m "Qué he hecho hoy, en una frase"
git push
```

---

## 3. El contenido de la wiki · *noviembre (y hasta enero)*

Toda la información está en la carpeta **`contenido/`**: un archivo JSON por sección. Escribir el contenido es la parte más larga del proyecto, así que empieza pronto y avanza un poco cada semana.

### 3.1 `configuracion.json`: el menú y la portada

```json
{
  "wiki": {
    "secciones": [
      { "id": "juegos", "titulo": "Juegos", "descripcion": "Todos los juegos canon de la saga.", "visible": true }
    ],
    "portada": {
      "titulo": "UMBRELLA ARCHIVES",
      "lema": "Nuestro negocio es la vida misma.",
      "intro": "Archivo clasificado de la saga Resident Evil…",
      "destacados": [{ "seccion": "juegos", "id": "re2" }]
    }
  }
}
```

- El orden de `secciones` es el orden del menú.
- Cada `id` de sección tiene que coincidir con el nombre de su archivo (`juegos` → `juegos.json`).

### 3.2 Formato de una sección

Cada archivo es un objeto en el que **la clave es el id de la ficha** (minúsculas, sin tildes, con guiones):

```json
{
  "rebecca": {
    "titulo": "Rebecca Chambers",
    "alias": "La novata de Bravo",
    "rol": "Protagonista",
    "estado": "Viva",
    "primeraAparicion": "re1",
    "apariciones": ["re0", "re1"],
    "resumen": "Una o dos frases que salen en la tarjeta.",
    "cuerpo": ["Primer párrafo.", "## Un subtítulo", "Otro párrafo con **negrita**."],
    "imagen": "/img/retratos/rebecca.webp",
    "color": "#3a6a5a",
    "orden": 120
  }
}
```

Campos comunes a todas las secciones:

| Campo | Para qué |
|---|---|
| `titulo` | Nombre de la ficha |
| `resumen` | Texto corto de la tarjeta y del buscador |
| `cuerpo` | Texto completo: una lista de párrafos (`## ` = subtítulo, `> ` = cita) |
| `imagen` | Ruta de la imagen (paso 9) |
| `video` | Id del tráiler de YouTube (las 11 letras del final del enlace) |
| `color` | Color de acento de la ficha |
| `orden` | Posición dentro de la sección (de menor a mayor) |
| `etiquetas` | Palabras para el buscador |
| `oculto` | `true` = solo se ve tras «Únete» (paso 10) |

Campos propios de cada sección (los que muestra el dossier lateral):

| Sección | Campos |
|---|---|
| `juegos` | `anio`, `tipo`, `canon`, `lanzamiento`, `plataformas`, `ambientacion`, `lugar`, `protagonistas`, `antagonistas`, `amenazas`, `virus`, `ubicaciones`, `curiosidades` |
| `peliculas` | `anio`, `tipo`, `canon`, `director`, `duracion`, `ambientacion`, `protagonistas`, `ubicaciones` |
| `personajes` | `alias`, `nacimiento`, `estado`, `rol`, `afiliaciones`, `primeraAparicion`, `apariciones`, `peliculas`, `cuerpoImagen` |
| `criaturas` | `tipo`, `origen` (id del virus), `peligrosidad` (1 a 5), `debilidad`, `primeraAparicion`, `apariciones` |
| `virus` | `tipo`, `creador`, `anio`, `efectos`, `primeraAparicion`, `derivados` |
| `organizaciones` | `tipo`, `fundacion`, `disolucion`, `lema`, `miembros` |
| `ubicaciones` | `tipo`, `pais`, `region`, `anio`, `estado`, `juegos`, `peliculas`, y para el mapa: `lat`, `lng` (mundo) o `mapa: "raccoon"`, `x`, `y` (plano de la ciudad) |
| `cronologia` | `anio`, `fecha`, `era`, `tipo` (`juego`, `pelicula` o `hito`), `relacionados` (lista de `{seccion, id}`), `orden` |

### 3.3 Consejos para escribir

- **Textos propios**: resume con tus palabras, nunca copies de otras wikis.
- **Relaciones por id**: en `apariciones`, `miembros`, `protagonistas`… se ponen ids, no nombres. Así la web enlaza las fichas solas.
- **Comprueba que el JSON es válido** cada vez que guardes: VS Code subraya en rojo los errores (falta una coma o sobra una).
- Orden de trabajo recomendado: juegos → personajes → criaturas → virus → organizaciones → ubicaciones → películas → cronología.

---

## 4. Diseño visual · *noviembre*

1. **Bocetos en Figma** (cuenta gratuita): portal, portada de la wiki, listado de una sección, ficha y ventana «Únete».
2. **Paleta** de la web, inspirada en Umbrella:

| Uso | Color |
|---|---|
| Fondo | `#050506` |
| Rojo Umbrella | `#c8102e` |
| Texto principal (hueso) | `#e8e2d6` |
| Texto secundario | `#a59f94` |
| Ámbar (avisos) | `#e0a43a` |

3. **Tipografías de Google Fonts**: *Cinzel* (títulos), *Crimson Pro* (texto), *Oswald* (botones y menús), *Share Tech Mono* y *Special Elite* (detalles de «expediente»).
4. **Reglas de estilo**: sin emojis (solo el logotipo del paraguas), sin cifras ni numeraciones en la interfaz, y pie «UMBRELLA ARCHIVES · 2026».
5. **Logotipo**: el paraguas de 8 gajos rojos y blancos (`web/img/logo.svg`, dibujado también por código en `web/comun/ambiente.js`).

---

## 5. El servidor · *diciembre*

Es un programa Java pequeño que hace dos cosas: **entregar los archivos de `web/`** y **entregar el contenido de `contenido/`** en formato JSON. No necesita librerías externas.

Crea estos archivos en `servidor/src/main/java/es/umbrella/`, en este orden:

| Orden | Archivo | Qué hace |
|---|---|---|
| 1 | `Json.java` | Lee y escribe JSON (Java no trae lector de JSON) |
| 2 | `Peticion.java` | Facilita leer la petición del navegador y responder |
| 3 | `Contenido.java` | Lee los JSON de `contenido/` al arrancar y los ordena por `orden` |
| 4 | `Estaticos.java` | Devuelve los archivos de `web/` (HTML, CSS, JS, imágenes) y la página 404 |
| 5 | `Api.java` | Responde a `/api/wiki`, `/api/wiki/{seccion}` y `/api/miembro` |
| 6 | `Miembros.java` | Acceso con Google (puedes dejarlo para marzo, paso 10) |
| 7 | `Servidor.java` | Arranca todo en el puerto 8080 |

Las rutas de la API que usará la web:

| Ruta | Devuelve |
|---|---|
| `GET /api/wiki` | Las secciones del menú y los textos de la portada |
| `GET /api/wiki/personajes` | Todas las fichas de esa sección |
| `GET /api/wiki/personajes/rebecca` | Una ficha |

**Comprobación:**

1. Haz doble clic en `arrancar-web.bat` (compila el servidor y lo arranca).
2. Abre `http://localhost:8080/api/wiki/juegos`: tienes que ver el JSON de los juegos.
3. Para pararlo, cierra la ventana negra.

> Si cambias algo de `contenido/`, **reinicia el servidor**: los JSON se leen solo al arrancar.

---

## 6. Portal y estilos comunes · *diciembre*

1. **`web/comun/estilos.css`**: variables de color, tipografías, botones (`.btn`, `.btn-rojo`), chips y la animación de aparición (`.revelar`).
2. **`web/comun/ambiente.js`**: el objeto `Umbra` con el logotipo, la lluvia en un `<canvas>`, los relámpagos, el sonido ambiente opcional y la función `Umbra.api()` para pedir datos al servidor.
3. **`web/index.html`**: el portal con tres «puertas» (Wiki, Cronología y Mapa) que se ensanchan al pasar el ratón.
4. **`web/404.html`**: página de «archivo perdido».

**Comprobación:** `http://localhost:8080` muestra el portal con lluvia, y en el móvil (o con la vista de móvil del navegador, `F12`) las puertas se apilan.

---

## 7. La wiki · *enero*

La wiki es una **aplicación de una sola página**: `web/wiki/index.html` es solo el esqueleto (cabecera, `<main>` vacío, pie y ventanas) y el JavaScript pinta cada pantalla según la ruta que hay después de `#` en la dirección.

| Dirección | Pantalla | Archivo |
|---|---|---|
| `#/` | Portada | `js/vistas/portada.js` |
| `#/s/personajes` | Listado de una sección | `js/vistas/seccion.js` |
| `#/f/personajes/rebecca` | Ficha | `js/vistas/ficha.js` |
| `#/cronologia` | Cronología | `js/vistas/cronologia.js` |
| `#/mapa` | Mapa | `js/vistas/mapa.js` |
| `#/buscar/texto` | Resultados de búsqueda | `js/vistas/buscar.js` |

Construye los archivos de `web/wiki/js/` en este orden (es también el orden de los `<script>` del HTML):

1. **`nucleo.js`**: crea el objeto `Wiki`, carga todas las secciones con `/api/wiki` y monta un índice para enlazar fichas por su id. Incluye `pintar()`, que pone una pantalla en `<main>`.
2. **`piezas.js`**: lo que se repite: tarjeta de ficha, tarjeta sellada, galerías de relacionados, texto con formato y visor de tráileres.
3. **`vistas/portada.js`**, **`vistas/seccion.js`** (con filtros), **`vistas/ficha.js`** (texto + dossier lateral + relacionados).
4. **`cabecera.js`**: menú, buscador con sugerencias y el **enrutador** (`enrutar()` lee `location.hash` y llama a la vista).
5. **`arranque.js`**: lo pone todo en marcha.

Y **`web/wiki/wiki.css`** para los estilos propios (tarjetas con inclinación 3D, dossier de papel, cronología, mapa).

**Comprobación:** navega por todas las secciones, abre fichas, usa «Anterior / Siguiente» y los enlaces entre fichas; prueba el botón «atrás» del navegador.

---

## 8. Cronología, mapa y buscador · *febrero*

- **Cronología** (`vistas/cronologia.js`): ordena los eventos por `orden`, los agrupa por `era` y colorea el punto según `tipo`.
- **Mapa del mundo** (`vistas/mapa.js`): usa la librería **Leaflet** (se carga desde internet en `wiki/index.html`) con un mapa base oscuro gratuito. Cada ubicación con `lat` y `lng` es un marcador.
- **Plano de Raccoon City**: un SVG dibujado a mano dentro de `mapa.js`; las ubicaciones con `mapa: "raccoon"` se colocan con sus `x` e `y` (de 0 a 1000 y de 0 a 700).
- **Buscador** (`vistas/buscar.js`): busca en el navegador entre todas las fichas cargadas y puntúa más si la palabra está en el título. La cabecera muestra sugerencias mientras escribes; la tecla `/` salta al buscador.

**Comprobación:** busca «wesker», abre la cronología y pulsa un lugar en la lista del mapa: el mapa debe volar hasta él.

---

## 9. Imágenes, ilustraciones, carteles y tráileres · *marzo*

| Tipo | Carpeta | Cómo |
|---|---|---|
| Retratos | `web/img/retratos/` | Imágenes cuadradas en `.webp` (ligeras). Ruta en `imagen` |
| Cuerpo entero | `web/img/cuerpo-entero/` | Personaje recortado con fondo transparente. Ruta en `cuerpoImagen` |
| Escenarios | `web/img/escenarios/` | Fondos apaisados de juegos y lugares |
| Ilustraciones propias | `web/img/ilustraciones/` | Para las fichas sin foto: las dibuja el script de abajo |
| Carteles de juegos y películas | — | La miniatura oficial del tráiler: `https://i.ytimg.com/vi/ID/maxresdefault.jpg` |
| Tráileres | — | Solo el id de YouTube en el campo `video` |

Para generar las ilustraciones de todas las fichas que tengan `"imagen": ""`:

```bash
node herramientas/generar-ilustraciones.js
```

El script dibuja un SVG distinto según la sección (expediente con silueta, espécimen en un tanque, muestra al microscopio, insignia, plano topográfico…) y escribe la ruta en el JSON. Con `--todas` vuelve a dibujar también las que ya hizo.

> Derechos: las imágenes y tráileres de *Resident Evil* son de Capcom. Úsalos solo como proyecto educativo, enlaza los tráileres desde sus canales oficiales y cita las fuentes en la memoria.

---

## 10. «Únete para ver lo oculto» con Google · *marzo*

Las fichas con `"oculto": true` (criaturas de peligro extremo, los agentes más peligrosos y los grandes enemigos) solo se ven después de entrar con Google. **El servidor no las envía** si no hay sesión: solo manda `{id, oculto}` y la web pinta un candado.

### 10.1 Conseguir el id de cliente de Google (gratis)

1. Entra en **console.cloud.google.com** con tu cuenta de Google y crea un proyecto («Umbrella Archives»).
2. Menú **APIs y servicios → Pantalla de consentimiento de OAuth**: tipo **Externo**, nombre de la aplicación y tu correo. Guarda.
3. Menú **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de OAuth**:
   - Tipo: **Aplicación web**.
   - **Orígenes de JavaScript autorizados**: `http://localhost` y `http://localhost:8080`.
4. Copia el **ID de cliente** (termina en `.apps.googleusercontent.com`).

### 10.2 Activarlo

Abre `arrancar-web.bat` y pon el id en esta línea:

```bat
set GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

> Ese id no es secreto (va en la web), pero no subas nunca a GitHub ninguna «clave secreta de cliente»: este proyecto no la necesita.

### 10.3 Cómo funciona

1. `web/wiki/js/miembros.js` muestra el botón oficial de Google en la ventana «Únete para ver lo oculto».
2. Google devuelve un token firmado; la web lo envía a `/api/miembro/google`.
3. `Miembros.java` lo comprueba con Google, guarda al miembro en `datos/miembros.json` y deja una cookie de sesión de 30 días.
4. La wiki recarga los datos, ahora con los expedientes ocultos.

**Comprobación:** sin entrar, el Tyrant sale con candado; tras entrar con Google, se abre su ficha; «Salir» lo vuelve a cerrar.

---

## 11. Pruebas y ajustes · *abril*

Lista de comprobación (apunta los fallos y corrígelos de uno en uno):

- [ ] Todas las secciones cargan y todas las fichas se abren.
- [ ] Ningún enlace entre fichas lleva a «Archivo perdido».
- [ ] Todas las fichas tienen imagen (foto, cartel o ilustración).
- [ ] Los tráileres se abren y se cierran con `Esc`.
- [ ] En el móvil se lee bien: menú desplegable, tarjetas en una columna, mapa usable.
- [ ] Se puede navegar con el teclado (`Tab`, `Intro`, `Esc`, `/`).
- [ ] Sin emojis ni cifras en la interfaz; pie «UMBRELLA ARCHIVES · 2026».
- [ ] La zona oculta: cerrada sin sesión, abierta con sesión.
- [ ] Probado en Chrome y en Firefox o Edge.
- [ ] El código está comentado (JavaScript, HTML y Java).

---

## 12. La memoria · *abril (borrador) y mayo (final)*

Estructura recomendada:

1. Portada, índice y resumen.
2. Introducción y motivación.
3. Objetivos.
4. Antecedentes y referentes (los de la propuesta).
5. Diseño: bocetos, paleta, tipografías y logotipo.
6. Contenido: cómo se organizó y se escribió.
7. Desarrollo: estructura del proyecto, servidor, wiki, cronología, mapa, buscador y acceso con Google.
8. Pruebas y resultados (capturas de pantalla).
9. Temporalización real frente a la prevista.
10. Presupuesto.
11. Conclusiones y mejoras futuras.
12. Fuentes y créditos (tráileres, imágenes, tipografías, librerías).

Haz capturas de pantalla durante todo el curso: son la mejor prueba del proceso.

---

## 13. Defensa y entrega · *mayo*

1. **Presentación** (unos 10 minutos): problema → propuesta → demostración en vivo → resultados → conclusiones.
2. **Demostración**: lleva la web arrancada antes de empezar (`arrancar-web.bat`) y un vídeo de respaldo por si falla el ordenador o internet.
3. **Ensaya** en voz alta al menos dos veces con el tiempo medido.
4. **Entrega**: memoria en PDF, presentación y el repositorio (o un `.zip` del proyecto sin las carpetas `build/` ni `datos/`).

---

UMBRELLA ARCHIVES · 2026
