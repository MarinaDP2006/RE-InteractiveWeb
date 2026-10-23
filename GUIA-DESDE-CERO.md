# GUÍA DESDE CERO · UMBRELLA ARCHIVES

**Actualizada el 23 de octubre de 2026.** La configuración Render está preparada en una PR hasta que se fusione con `main`.

Esta guía explica cómo retomar, desarrollar y entregar **Umbrella Archives**, una wiki no oficial del universo Resident Evil, desde un ordenador Windows con PowerShell y Visual Studio Code. Distingue lo que **ya existe**, lo que **es solo diseño** y lo que **todavía falta implementar**. No se debe confundir una página dibujada con una función operativa.

## 0. Situación real del proyecto

Repositorio correcto: https://github.com/MarinaDP2006/archivos-umbrella

**Lo que existe en main:**
- Una portada estática en 'web/index.html' con tres accesos: wiki, cronología y mapa.
- Las páginas HTML de la wiki en 'web/wiki/': inicio, juegos, personajes, criaturas, virus, organizaciones, lugares, películas, cronología, mapa, búsqueda, acceso y ficha.
- Estilos en 'web/comun/estilos.css', 'web/wiki/wiki.css' y 'web/wiki/estilos-archivos.css'.
- Numerosos recursos gráficos en 'web/img/' y 'src/img/' (retratos, escenarios, ilustraciones, etc.).
- 'render.yaml' configurado para publicar directamente la carpeta 'web/' sin paso de compilación.
- 'README.md', 'tutorial.md' y esta guía.
- La PR #1, que retiró la implementación anterior del juego y dejó la wiki como objetivo principal, ya está fusionada.

**Lo que no existe actualmente en main:**
- 'angular-app/', 'api-node/', 'scripts/' y 'escritorio-javafx/'. Aunque se describan en documentos antiguos, NO están presentes: no ejecutes comandos dentro de esas carpetas.
- 'package.json' en la raíz: la web actual no necesita 'npm install' ni 'npm start' para funcionar.
- Una base de datos, API propia, fichas alimentadas por registros reales, registro de usuarios operativo o aplicación JavaFX.

**Maquetas o funciones todavía incompletas:**
- 'web/wiki/buscar.html' anuncia un buscador futuro y muestra resultados de ejemplo. No es un buscador operativo.
- 'web/wiki/acceso.html' muestra un formulario ficticio; no hay autenticación de usuarios.
- 'web/wiki/ficha.html' es una ficha de muestra, no una ficha dinámica por ID.
- 'web/wiki/mapa.html' tiene etiquetas de lugares en un mapa visual; no hay filtros ni navegación interactiva completa.
- 'web/wiki/cronologia.html' tiene acontecimientos de ejemplo y filtros previstos, sin filtrado implementado.
- La navegación de categorías está maquetada; sus fichas, enlaces y contenidos tienen que comprobarse uno a uno.

**Importante:** la web estática actual se sirve desde `web/` en https://umbrella-archives-static.onrender.com/. El Angular y la API descritos en documentos antiguos son planes de futuro, no requisitos para desplegar la web.

## 1. Qué se pretende entregar

Una wiki de Resident Evil con diseño de archivo secreto, visualmente coherente, usable desde móvil y ordenador: portada, categorías, fichas completas y relacionadas, buscador funcional, cronología, mapa, y opcionalmente acceso de usuarios. Para un proyecto académico, además prepara documentación, capturas, decisiones técnicas y pruebas. JavaFX es la última fase; la publicación de la web no depende de JavaFX.

**Prioridad:** una wiki completa, navegable y comprobada antes de añadir tecnologías que no sean necesarias.

## 2. Instalar solo las herramientas necesarias

1. Instala Git: https://git-scm.com/downloads
2. Instala Visual Studio Code: https://code.visualstudio.com/
3. Usa Chrome, Edge o Firefox para las pruebas.
4. Opcional: extensión Live Server en VS Code para previsualizar HTML estático.
5. Node.js LTS solo será necesario cuando se creen herramientas de desarrollo, Angular o un servidor Node. No hace falta para ver la web actual.
6. JDK 21, Maven y JavaFX solo cuando comience la fase de escritorio.

En VS Code, abre Terminal > Nuevo terminal y comprueba:

~~~~powershell
git --version
code --version
~~~~

Si más adelante instalas Node:

~~~~powershell
node --version
npm --version
~~~~

No instales Angular, Express, Firebase, MySQL o JavaFX por adelantado si aún no los necesitas.

## 3. Descargar la versión correcta (primera vez)

En PowerShell:

~~~~powershell
cd $HOME
New-Item -ItemType Directory -Force -Path Proyectos | Out-Null
cd Proyectos
git clone https://github.com/MarinaDP2006/archivos-umbrella.git
cd archivos-umbrella
code .
~~~~

La raíz debe contener 'web/', 'src/img/', 'README.md', 'render.yaml' y 'GUIA-DESDE-CERO.md'. Verifica:

~~~~powershell
pwd
Get-ChildItem
git status
git branch --show-current
~~~~

Si ya lo descargaste, no lo clones de nuevo encima. Antes de actualizar:

~~~~powershell
git status
git pull --ff-only origin main
~~~~

Si tienes cambios locales, guárdalos o haz commit primero. No uses 'git reset --hard' para solucionar un conflicto sin copia de seguridad.

## 4. Abrir la web actual sin compilar

Desde VS Code, instala Live Server si quieres y abre 'web/index.html' con **Open with Live Server**. Alternativa con Python, si está instalado:

~~~~powershell
cd web
python -m http.server 5500
~~~~

Visita http://localhost:5500/. Si usas Live Server, abre la dirección que te muestre. Desde la portada entra a 'wiki/index.html', 'wiki/cronologia.html' y 'wiki/mapa.html'.

No abras 'localhost:4200' ni 'localhost:3000' esperando encontrar Angular o una API: hoy no existen esos servidores en este repositorio.

**Comprobación:** la portada carga, las imágenes aparecen, los enlaces internos van a sus páginas y no hay errores de recursos en las herramientas de desarrollo del navegador (F12 > Console/Network).

## 5. Conocer las carpetas antes de editar

~~~~text
archivos-umbrella/
├── web/
│   ├── index.html                Portada real
│   ├── 404.html
│   ├── comun/estilos.css         Estilos globales
│   ├── img/                      Imágenes servidas en la web
│   └── wiki/
│       ├── index.html            Inicio de la wiki
│       ├── juegos.html, personajes.html, criaturas.html...
│       ├── ficha.html            Ficha de demostración
│       ├── buscar.html           Buscador de demostración
│       ├── acceso.html           Acceso de demostración
│       ├── cronologia.html       Cronología de ejemplo
│       ├── mapa.html             Mapa de ejemplo
│       ├── wiki.css
│       └── estilos-archivos.css
├── src/img/                     Colección adicional de arte
├── render.yaml                  Publica web/
├── README.md
├── tutorial.md                   Documento histórico: verificar rutas
└── GUIA-DESDE-CERO.md            Esta guía
~~~~

Para que una imagen cargue en Render tiene que estar dentro de 'web/' (o copiarse allí mediante un proceso explícito). Los archivos de 'src/img/' NO se publican automáticamente con 'publish = "web"'. No borres ni muevas las imágenes originales hasta verificar todas sus referencias.

## 6. Primera fase: estabilizar la maqueta

Antes de añadir grandes funciones:
1. Recorre todas las páginas con el navegador y anota qué funciona, qué no enlaza y qué es solo un ejemplo.
2. Comprueba desde móvil o con las herramientas responsive de Chrome que menús, textos y tarjetas caben en pantalla.
3. Corrige enlaces rotos, textos de relleno, rutas a imágenes inexistentes, contrastes y navegación por teclado.
4. Haz que cada tarjeta importante sea un enlace accesible real; no basta con que parezca pulsable.
5. Conserva el estilo Umbrella Archives y el aviso de proyecto de fans.

**Resultado esperado:** navegación coherente y diseño estable, incluso aunque las fichas sigan siendo estáticas.

## 7. Segunda fase: preparar los datos reales de la wiki

Se recomienda empezar con **un único catálogo estructurado** (JSON o módulos JavaScript) para evitar copiar información en docenas de páginas. No es obligatorio adoptar Angular para hacer esto.

Ejemplo de esquema de contenido:

~~~~json
{
  "id": "leon-s-kennedy",
  "tipo": "personaje",
  "nombre": "Leon S. Kennedy",
  "resumen": "Descripción revisada y documentada",
  "imagen": "../img/retratos/leon.webp",
  "relacionados": ["resident-evil-2"],
  "fuentes": []
}
~~~~

El ejemplo es orientativo: antes de usar esa ruta comprueba si el archivo existe exactamente en 'web/img/'. Define IDs únicos, campos obligatorios, fuentes de información y categoría para juegos, personajes, criaturas, virus, organizaciones, ubicaciones y películas. Diferencia juegos, adaptaciones audiovisuales y líneas temporales; no mezcles canon sin explicarlo.

Empieza por unas pocas fichas reales para validar el formato; después amplía el catálogo por secciones. Si reutilizas recursos oficiales, ten en cuenta los derechos de autor y mantén el carácter no oficial.

## 8. Tercera fase: convertir las páginas de muestra en funciones reales

**Fichas:** 'ficha.html' debe leer un ID (por ejemplo mediante un parámetro de URL), buscarlo en el catálogo, mostrar descripción, imagen, fuentes y relacionados. Si el ID no existe, mostrar un error comprensible y un enlace para volver.

**Buscador:** sustituir el texto de ejemplo en 'buscar.html' por un campo real que filtre el catálogo por nombre, alias, tipo y, opcionalmente, etiquetas. Permitir limpiar filtros, manejar cero resultados y funcionar con teclado.

**Categorías:** leer el mismo catálogo y enlazar cada tarjeta a su ficha, sin duplicar sus datos.

**Cronología:** convertir los acontecimientos de ejemplo en registros con fechas, referencias y filtros por juego, año o tipo de suceso. Indicar las fechas aproximadas.

**Mapa:** convertir los puntos decorativos en enlaces o controles accesibles asociados a fichas de ubicaciones; después implementar filtros, zoom y controles táctiles si el tiempo lo permite.

**Acceso:** mantenerlo como demostración hasta que exista autenticación REAL. No aceptar contraseñas en un formulario casero ni guardar contraseñas en localStorage.

**Comprobación:** cada ficha se encuentra desde el buscador, se abre desde su categoría, y enlaza a otras fichas sin errores.

## 9. Elegir arquitectura sin tirar el trabajo existente

**Ruta recomendada para terminar antes:** ampliar la web estática con JavaScript modular y JSON. Es suficiente para una wiki pública con búsqueda y fichas, sin servidor.

**Ruta alternativa si el proyecto requiere Angular:** crear 'angular-app/' desde cero solo tras decidir la migración; pasar estilos y pantallas gradualmente, dejando 'web/' intacta hasta verificar paridad. Escribir el proyecto en Angular NO está hecho a fecha de esta guía.

**Backend Node / base de datos:** añadirlos únicamente cuando sean imprescindibles para cuentas, edición de contenidos o información privada. Una wiki pública de solo lectura puede funcionar sin API propia.

La tecnología final debe justificarse en la memoria: qué problema resuelve y cómo se prueba.

## 10. Autenticación y zona restringida (fase opcional posterior)

Si hacen falta usuarios, primero define exactamente qué podrán hacer. Firebase Authentication u otro proveedor gestionado puede encargarse del inicio de sesión; los datos protegidos requieren reglas de autorización en el servidor o en la base de datos. Ocultar botones en el navegador **no protege** datos. No publiques secretos, claves administrativas ni perfiles privados en GitHub. Si no hay una necesidad real de cuentas, entrega una wiki pública funcional y explica que el acceso es ampliación futura.

## 11. Publicar en Render

La configuración versionada actual es:

~~~~toml
[build]
  publish = "web"
~~~~

No hay 'build command', ni despliegue Angular, ni redirección SPA global. Los archivos HTML se publican como rutas reales.

1. En https://app.Render.com/ abre el **sitio ya conectado al repositorio**; verifica el nombre y dominio en el panel antes de actuar. No crees otro sitio por error.
2. Confirma repositorio 'MarinaDP2006/archivos-umbrella', rama 'main' y directorio de publicación 'web'.
3. Guarda los cambios mediante Git y súbelos a 'main' tras revisarlos. Render debería desplegar con la integración Git, si está configurada.
4. Revisa el registro de despliegue. Si falla, busca el primer error.
5. Prueba la portada, '/wiki/index.html', '/wiki/buscar.html', '/wiki/cronologia.html', '/wiki/mapa.html' y '/img/logo.svg' en el **dominio real**.
6. Comprueba enlaces, imágenes, versión móvil y ausencia de errores en consola.

No presupongas que un dominio mencionado en README o en un tutorial antiguo es el dominio definitivo. Tampoco añadas un proxy o Render sin una API que desplegar.

## 12. Guardar cambios sin perder nada

Desde la raíz del repositorio:

~~~~powershell
git status
git add web GUIA-DESDE-CERO.md README.md
git commit -m "Actualizar wiki y documentacion"
git push origin main
~~~~

Añade solo los archivos que hayas editado. Si colaboras con Claude, Copilot u otras personas, lo más seguro es crear una rama por tarea y revisar una Pull Request antes de fusionar. No editéis simultáneamente el mismo archivo sin sincronizar las ramas. No subas contraseñas, tokens, 'node_modules/', archivos '.env' ni materiales privados.

## 13. Pruebas y requisitos de entrega

Para cada fase, anota **fecha, archivo cambiado, qué se ha probado, resultado y captura**. Comprueba al menos:
- Portada y navegación entre todas las categorías.
- Enlaces a fichas, imágenes reales y páginas de error.
- Búsqueda sin resultados, búsqueda con tildes y nombres alternativos.
- Móvil, tableta y escritorio, teclado y lector de pantalla en los flujos críticos.
- Carga sin errores 404, accesibilidad básica (contraste, etiquetas, foco) y tiempos razonables.
- Publicación después de cada cambio significativo.
- Seguridad y permisos si finalmente hay cuentas.

No marques una característica como 'completa' por la mera presencia de una página HTML; demuestra el comportamiento.

## 14. JavaFX (solo al final)

**No existe todavía 'escritorio-javafx/' en main.** Cuando la web esté funcional y publicada:
1. Instala JDK 21 y Maven y verifica 'java -version' y 'mvn -version'.
2. Crea un proyecto JavaFX/OpenJFX separado en 'escritorio-javafx/'.
3. Haz una ventana sencilla, con identidad visual Umbrella Archives y un botón para abrir la URL pública en el navegador predeterminado.
4. Implementa estado, ayuda y empaquetado con 'jpackage' solo si los necesitas para la entrega.
5. Prueba el ejecutable en Windows y documenta requisitos e instalación.

Un lanzador JavaFX no reemplaza la web; es un complemento. No lo uses para ocultar funcionalidades pendientes.

## 15. Plan de trabajo recomendado (en orden)

| Fase | Situación actual | Qué hay que terminar |
| --- | --- | --- |
| Recuperación del proyecto | Repositorio y web estática presentes | Clonar, abrir y validar rutas |
| Diseño / navegación | Portada y páginas HTML presentes | Corregir enlaces, móvil y accesibilidad |
| Catálogo de la wiki | Imágenes y vistas de ejemplo | Datos estructurados, fichas reales y enlaces |
| Buscador | Solo maqueta | Búsqueda real y filtros |
| Cronología | Acontecimientos de ejemplo | Datos contrastados, navegación y filtros |
| Mapa | Puntos visuales | Controles interactivos y fichas asociadas |
| Usuarios | Acceso de demostración | Autenticación segura solo si es necesaria |
| Publicación | Configuración Render presente | Verificar despliegue y dominio real |
| Pruebas / memoria | Documentación inicial | Capturas, pruebas, incidencias y conclusiones |
| JavaFX | No iniciado | Crear al final y empaquetar |

## 16. Problemas frecuentes

- **'cd angular-app' o 'cd api-node' falla:** esas carpetas no existen en main. Sigue esta guía, no los comandos históricos.
- **'npm start' falla:** el proyecto actual es HTML/CSS estático y no tiene 'package.json' de arranque.
- **La portada funciona pero una imagen falla:** comprueba mayúsculas y minúsculas, ruta relativa y que la imagen esté publicada en 'web/img/'.
- **Una tarjeta no hace nada:** puede ser un elemento visual sin enlace; hay que implementarlo.
- **El buscador o inicio de sesión no funcionan:** son maquetas, no fallos del navegador.
- **Render muestra una web antigua:** verifica sitio, rama, commit y directorio 'web' en el registro de despliegue.
- **Git rechaza 'push':** actualiza tu rama, revisa el conflicto y evita sobrescribir el trabajo de otra persona.
- **Los cambios no se ven:** usa recarga forzada, comprueba el despliegue y descarta caché.

## 17. Regla para continuar

Antes de empezar cada tarea: **verificar lo que existe → definir comportamiento → implementar → probar localmente → revisar en GitHub → desplegar → registrar resultado**. Mantén los diseños originales hasta que su sustituto esté probado. No presentes Angular, API, usuarios ni JavaFX como terminados: actualmente son objetivos futuros.
