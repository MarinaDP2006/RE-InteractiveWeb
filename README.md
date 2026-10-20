# UMBRELLA ARCHIVES · RE Wiki + Juego

Proyecto fan de **Resident Evil** con dos partes y una app de gestión:

1. **Wiki** (`/wiki/`): la historia completa de la saga (juegos y películas canon), personajes, bestiario, virus, organizaciones, cronología y mapa interactivo de ubicaciones.
2. **Juego** (`/juego/`): escape room interactivo 3D (motor UMBRA), de Raccoon City a Requiem.
3. **App de administración para Windows**: gestiona la base de datos de la wiki, el juego (puzzles, partidas, ranking), el acceso público y las copias de seguridad, con un único administrador.

> 🚧 En desarrollo: este README se completará con las instrucciones de instalación, despliegue en Render y descarga de la app.

## Estructura

```
servidor/   Servidor Java 21 sin dependencias (API + base de datos UmbraDB)
web/        Portal, wiki y juego (HTML/CSS/JS)
semilla/    Datos iniciales de la base de datos (wiki, puzzles, configuración)
admin/      App de escritorio de administración (Windows)
```