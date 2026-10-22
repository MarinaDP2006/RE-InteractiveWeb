# Lista de trabajo · Umbrella Archives

Actualizado: 22 de octubre de 2026. Estado revisado sobre `main`.

## Hecho (código confirmado)
- [x] Implementación inicial de inicio con Google: botón web, validación de credenciales en Java y sesión de miembro.
- [x] Restricción desde API de las fichas marcadas como ocultas.
- [x] Manejar mejor el fallo al cerrar sesión sin ocultar el mensaje.
- [x] Simplificar el portal: navegación rápida a secciones, tarjetas de tamaño estable y CTA principal.
- [x] Mejorar la adaptación a móvil y teclado; respetar preferencia de movimiento reducido en la portada.
- [x] Aclarar los errores cuando el acceso con Google no está configurado.

## Preparación de Render y tutorial (22/10/2026)
- [x] Añadidos Dockerfile, .dockerignore y render.yaml; se preservan todas las imágenes de web/img/.
- [x] README ampliado con configuración desde ordenador limpio, desarrollo local, Google OAuth y despliegue en Render.
- [x] El lanzador local ya no borra GOOGLE_CLIENT_ID; cookies de sesión con Secure si el servidor está alojado en Render.
- [ ] Conectar cuenta Render, crear el servicio y verificar URL real publicada.
- [ ] Completar seguridad del login y persistencia de miembros en hosting.

## Implementado en esta revisión
- [x] Clase `AlmacenMiembros.java` para perfiles y sesiones persistentes mediante la API REST de Supabase, guardando hashes de tokens.
- [x] Integrada la persistencia opcional en `Miembros.java`; respaldo local de desarrollo si no hay configuración.
- [x] Esquema SQL privado con tablas de miembros y sesiones en `database/supabase.sql`.
- [x] README ampliado con preparación del proyecto desde cero, Google OAuth, Supabase Free y alojamiento alternativo sin Render.
- [x] Workflow Java 21 para compilación y comprobación básica de rutas HTTP.
- [x] Ninguna imagen del proyecto eliminada.
- [ ] Ejecutar y revisar una compilación de GitHub Actions completa.
- [ ] Configurar un proyecto real en Supabase y probar persistencia de usuarios, reinicios y cierre de sesión.
- [ ] Configurar alojamiento siempre disponible dentro de un plan gratuito, sin garantías de uptime.
- [ ] Auditoría de CSRF, rate limiting, almacenamiento y políticas de privacidad.

## Pendiente prioritario
- [ ] Crear/configurar el cliente OAuth 2.0 de Google y establecer `GOOGLE_CLIENT_ID` para el origen real.
- [ ] Probar en navegador todo el flujo Google: entrar, refrescar, abrir fichas ocultas y salir.
- [ ] Persistir sesiones entre reinicios con caducidad y revocación segura; actualmente se guardan en memoria.
- [ ] Revisar seguridad de cookies HTTPS/Secure y protección de solicitudes sensibles (CSRF, origen).
- [ ] Validar errores y estados de carga en la wiki (API no disponible, conexión lenta, sesión caducada).
- [ ] Revisar exhaustivamente navegación, enlaces rápidos, secciones y contraste con teclado/móvil.
- [ ] Revisar diseño de la wiki interior para simplificar menús, fichas y filtros sin perder contenidos.
- [ ] Compilar y probar el servidor Java 21 mediante `arrancar-web.bat`.

## Para entrega
- [ ] Manual de puesta en marcha, configuración OAuth y uso para evaluación.
- [ ] Pruebas funcionales reproducibles (API, interfaz, autenticación y persistencia).

**Nota:** se ha simplificado la portada y mejorado la experiencia de errores; el inicio de sesión aún no se considera validado de extremo a extremo.
