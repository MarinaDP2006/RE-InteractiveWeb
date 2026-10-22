# Umbrella Archives · Estado de la maqueta y próxima versión

## Completado en la rama main
- [x] Archivar el backend Java, Docker, configuración Render, datos JSON y scripts antiguos en la rama `archivo-backend-previo-maqueta-2026-10` antes de retirarlos.
- [x] Mantener **todas las 293 imágenes** originales en `web/img/`.
- [x] Mantener el CSS original `web/comun/estilos.css` y `web/wiki/wiki.css`.
- [x] Conservar los archivos HTML existentes y añadir pantallas estáticas para todas las secciones.
- [x] Añadir `web/wiki/maqueta.css` para la visualización estática sin backend.
- [x] Conectar la navegación básica mediante enlaces HTML, sin JavaScript.
- [x] Redactar `README.md` desde cero con tutorial VS Code, Angular, Node.js, JavaFX, Firebase y alojamiento gratis con cuotas.

## Pendiente (futura aplicación, todavía no funcional)
- [ ] Reproducir los diseños de esta maqueta en componentes Angular.
- [ ] Construir contenido real, navegación, buscador y fichas con Angular.
- [ ] Conectar Firebase Authentication y Cloud Firestore con reglas seguras y plan gratuito.
- [ ] Publicar Angular en Firebase Hosting Spark o Cloudflare Pages Free.
- [ ] Crear el lanzador JavaFX de Windows y empaquetarlo con jpackage.
- [ ] Incorporar API Node.js únicamente si surgen funciones que requieran servidor propio.
- [ ] Comprobar visualmente cada pestaña en Chrome/Firefox y en pantallas móviles.
- [ ] Sustituir el antiguo servicio Docker de Render por alojamiento estático si se desea conservar un dominio de Render.

## Advertencias
`main` es únicamente una **maqueta visual**. Ni el acceso de usuarios ni la búsqueda son operativos. Nunca escribir contraseñas reales en una maqueta. Los servidores y secretos antiguos ya no forman parte del código actual; sus versiones históricas pueden consultarse en la rama de respaldo. El servicio Render anterior no puede compilar esta rama sin cambiar de servicio Docker a Static Site.

**No borrar ni reescribir las imágenes, HTML, ni CSS existentes.**
