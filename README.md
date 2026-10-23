# UMBRELLA ARCHIVES · Resident Evil
## Estado
- **Angular**: base inicial creada, con portada, categorías, búsqueda local y fichas de ejemplo. No es todavía una migración completa de la wiki.
- **API Node.js / Express**: prototipo independiente con endpoints de estado y expedientes de ejemplo. Sin autenticación, base de datos ni panel administrativo.
- **Render**: publica directamente `web/` (HTML, CSS, imágenes y wiki) en la raíz del dominio. Angular se conserva para desarrollo futuro.
- **JavaFX**: pendiente para la fase final.
- **Web original**: `web/` es la web pública actual; sus rutas se publican sin prefijo `/legado/`.

## Estructura
```text
archivos-umbrella/
├── angular-app/         # Frontend Angular
│   ├── src/             # Componentes, rutas y estilos
│   └── public/          # Recursos públicos y redirecciones
├── api-node/            # API Express independiente
├── scripts/             # Copia de imágenes y maqueta al compilar
├── web/                 # Maqueta original, sin modificar
├── src/img/             # Recursos originales adicionales
├── render.yaml          # Publicación estática en Render
├── GUIA-DESDE-CERO.md   # Tutorial completo para principiantes
└── README.md
```

## Desarrollo rápido
Requisitos: Git, Node.js compatible con Angular 19 (recomendado Node 22 LTS) y npm.

```powershell
git clone https://github.com/MarinaDP2006/archivos-umbrella.git
cd archivos-umbrella
cd angular-app
npm install
npm start
```

Abre http://localhost:4200. Para compilar:
```powershell
npm run build
node ../scripts/copiar-legado.mjs
```

En otra terminal:
```powershell
cd archivos-umbrella/api-node
npm install
npm run dev
```

API local: http://localhost:3000/api/estado y http://localhost:3000/api/archivos.

## Publicación

La web pública se genera directamente desde `web/`, sin compilar Angular. En Render, crea un **Static Site** conectado a `main` o usa `render.yaml` como Blueprint; directorio de publicación: `web`. La cuenta de Render debe seleccionar el workspace correcto. El servicio gratuito tiene límites de ancho de banda y minutos de build.

**Sitio estático en Render:** https://umbrella-archives-static.onrender.com/ (servicio creado; comprobar estado de despliegue en Render). El antiguo servicio Docker `umbrella-archives.onrender.com` es independiente.

## Siguientes etapas
Completar la migración de cada pantalla, ampliar datos, añadir pruebas y accesibilidad, conectar Angular a la API mediante una URL de entorno, incorporar autenticación y almacenamiento con reglas seguras, validar Render y finalmente construir JavaFX.

**Tutorial detallado:** [GUIA-DESDE-CERO.md](GUIA-DESDE-CERO.md)
