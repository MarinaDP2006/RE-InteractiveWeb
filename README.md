# UMBRELLA ARCHIVES

Wiki de la saga *Resident Evil*. Proyecto Final individual: entrega en mayo de 2027.

## Explorar la saga

- Juegos
- Películas y series
- Personajes
- Bestiario
- Agentes biológicos
- Organizaciones
- Ubicaciones
- Cronología
- Mapa

## Únete para ver lo oculto

Los expedientes más peligrosos solo se abren al entrar con una cuenta de Google.

## Abrirla en tu PC

1. Instala Java 21: `winget install EclipseAdoptium.Temurin.21.JDK`
2. Doble clic en **`arrancar-web.bat`**. Se abre `http://localhost:8080`.

La web funciona solo en tu ordenador: no está publicada en ningún sitio.

## Qué es cada cosa

```
├── arrancar-web.bat          Compila el servidor y abre la web en el navegador
│
├── contenido/                TEXTOS DE LA WIKI (un archivo JSON por sección)
│   ├── configuracion.json      menú de secciones y textos de la portada
│   ├── juegos.json · peliculas.json · personajes.json · criaturas.json
│   └── virus.json · organizaciones.json · ubicaciones.json · cronologia.json
│
├── web/                      LO QUE VE EL VISITANTE
│   ├── index.html              portal de entrada (Wiki · Cronología · Mapa)
│   ├── 404.html                página de «archivo perdido»
│   ├── comun/                  compartido por el portal y la wiki
│   │   ├── estilos.css           colores, tipografías y botones
│   │   └── ambiente.js           lluvia, relámpagos, sonido y logotipo
│   ├── wiki/
│   │   ├── index.html            esqueleto de la wiki (cabecera, pie, ventanas)
│   │   ├── wiki.css              estilos de la wiki
│   │   └── js/                   código de la wiki, por partes:
│   │       ├── nucleo.js           datos y utilidades compartidas
│   │       ├── piezas.js           tarjetas, galerías, tráileres
│   │       ├── vistas/             una pantalla por archivo:
│   │       │   portada · seccion · ficha · cronologia · mapa · buscar
│   │       ├── miembros.js         «Únete para ver lo oculto» (Google)
│   │       ├── cabecera.js         menú, buscador y navegación
│   │       └── arranque.js         pone todo en marcha
│   └── img/
│       ├── retratos/             fotos de personajes y criaturas
│       ├── cuerpo-entero/        personajes de cuerpo entero (fichas)
│       ├── escenarios/           fondos de juegos y lugares
│       ├── ilustraciones/        dibujos propios para las fichas sin foto
│       └── logo.svg              logotipo (también icono de la pestaña)
│
├── servidor/src/main/java/es/umbrella/   PROGRAMA QUE SIRVE LA WEB (Java 21)
│   ├── Servidor.java           arranque
│   ├── Estaticos.java          entrega los archivos de web/
│   ├── Api.java                entrega los datos de contenido/ a la web
│   ├── Contenido.java          lee los JSON de contenido/
│   ├── Miembros.java           acceso con Google
│   └── Json.java · Peticion.java   utilidades
```

---

UMBRELLA ARCHIVES · 2026
