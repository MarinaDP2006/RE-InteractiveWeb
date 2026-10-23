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

## Base de datos (Firebase Firestore)

La wiki lee sus datos de **Cloud Firestore**. Todo el acceso está en `web/comun/firebase.js` (configuración, lectura, usuarios y datos iniciales); cada página solo importa lo que necesita. Mientras la configuración tenga los marcadores `TU_...`, la web funciona igual con los datos locales de `SEMILLA`, así que nunca se queda vacía.

### Puesta en marcha
1. En https://console.firebase.google.com crea un proyecto, añade una **app web** y copia su `firebaseConfig` en `web/comun/firebase.js`.
2. **Firestore Database → Crear base de datos** (modo producción, ubicación `eur3`).
3. **Firestore → Reglas**: pega las reglas de abajo y publica.
4. **Authentication**: activa *Google* y *Correo electrónico/contraseña*, y añade el dominio de Render en *Dominios autorizados*.
5. Entra en la web con tu cuenta. En **Firestore → usuarios → (tu uid)** cambia `rol` de `miembro` a `admin` a mano (las reglas impiden hacerlo desde la web).
6. Abre `wiki/index.html?sembrar=1`: copia los 239 documentos de `SEMILLA` a Firestore.
7. Crea a mano en la consola los documentos de `expedientes` (no van en el código porque es contenido privado).

### Modelo de datos
| Colección | Documento (id) | Campos | Quién lee | Quién escribe |
|---|---|---|---|---|
| `juegos` | `re2` | comunes + `anio` (número), `plataforma`, `protagonistas` (array), `ambientacion` | todos | admin |
| `personajes` | `leon` | comunes + `primeraAparicion`, `afiliacion`, `estado`, `nacimiento` | todos | admin |
| `criaturas` | `licker` | comunes + `origen`, `primeraAparicion`, `peligrosidad` (1-5) | todos | admin |
| `virus` | `virus-t` | comunes + `tipo`, `creador`, `primeraAparicion` | todos | admin |
| `organizaciones` | `umbrella` | comunes + `tipo`, `fundacion`, `lider`, `estado` | todos | admin |
| `lugares` | `raccoon-city` | comunes + `region`, `primeraAparicion`, `anio` | todos | admin |
| `peliculas` | `vendetta` | comunes + `anio`, `formato`, `protagonistas` (array) | todos | admin |
| `cronologia` | `raccoon-1998` | comunes + `periodo`, `anio`, `juego` | todos | admin |
| `expedientes` | `informe-arklay` | `titulo`, `nivel`, `resumen`, `texto`, `imagen`, `orden` | con sesión | admin |
| `usuarios` | uid de Firebase Auth | `uid`, `nombre`, `email`, `foto`, `proveedor`, `rol`, `creado`, `ultimoAcceso` | su dueño y admin | su dueño (sin tocar `rol`) |

**Campos comunes** de la wiki: `nombre`, `resumen` (frase para la tarjeta), `descripcion` (texto de la ficha), `imagen` (ruta desde `web/`, p. ej. `img/retratos/leon.webp`) y `orden` (número para ordenar con `orderBy`).

Decisiones:
- **Una colección por sección** en lugar de una única tabla: cada página lee solo lo suyo y cada tipo tiene sus propios campos (Firestore no exige un esquema fijo).
- **Ids legibles** (`leon`, `virus-t`) para que la URL de la ficha sea clara: `ficha.html?c=personajes&id=leon`.
- **Búsqueda en el navegador**: Firestore no busca texto dentro de los campos, así que `buscar.html` lee las colecciones públicas (son pequeñas) y filtra en el cliente.
- **Usuarios con el uid como id**: así las reglas comparan `request.auth.uid == uid` sin consultas extra.

Ejemplo de documento `expedientes/informe-arklay`:
```json
{ "titulo": "Informe del laboratorio de Arklay", "nivel": "ALTO SECRETO", "orden": 1,
  "resumen": "Registro interno sobre la fuga del Virus-T en la mansión.",
  "texto": "Texto completo del expediente…", "imagen": "img/escenarios/re2_nest.webp" }
```

### Reglas de seguridad
Ocultar un botón no protege nada: lo que decide quién lee o escribe son estas reglas, que se ejecutan en los servidores de Google.
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function conSesion() {
      return request.auth != null;
    }

    function esDueno(uid) {
      return conSesion() && request.auth.uid == uid;
    }

    function esAdmin() {
      return conSesion()
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }

    // 1) Wiki pública: cualquiera lee; solo administración escribe.
    match /{coleccion}/{id} {
      allow read: if coleccion in ['juegos', 'personajes', 'criaturas', 'virus',
                                   'organizaciones', 'lugares', 'peliculas', 'cronologia'];
      allow write: if coleccion in ['juegos', 'personajes', 'criaturas', 'virus',
                                    'organizaciones', 'lugares', 'peliculas', 'cronologia']
                   && esAdmin();
    }

    // 2) Expedientes clasificados: solo con sesión iniciada.
    match /expedientes/{id} {
      allow read: if conSesion();
      allow write: if esAdmin();
    }

    // 3) Usuarios: cada persona solo ve y edita su propio documento.
    match /usuarios/{uid} {
      allow read: if esDueno(uid) || esAdmin();

      // Al registrarse: el documento es suyo y siempre empieza como "miembro".
      allow create: if esDueno(uid)
                    && request.resource.data.uid == uid
                    && request.resource.data.rol == 'miembro'
                    && request.resource.data.keys().hasOnly(
                         ['uid', 'nombre', 'email', 'foto', 'proveedor', 'rol', 'creado', 'ultimoAcceso']);

      // Al volver a entrar: puede cambiar sus datos, pero nunca uid, rol ni creado.
      allow update: if esDueno(uid)
                    && !request.resource.data.diff(resource.data).affectedKeys()
                         .hasAny(['uid', 'rol', 'creado'])
                    && request.resource.data.keys().hasOnly(
                         ['uid', 'nombre', 'email', 'foto', 'proveedor', 'rol', 'creado', 'ultimoAcceso']);

      allow delete: if esAdmin();
    }
  }
}
```
- Wiki: lectura pública; escritura solo con `rol == 'admin'` (se comprueba leyendo el documento del usuario con `get()`).
- Expedientes: hace falta sesión iniciada; sin ella Firestore responde *permission-denied*.
- Usuarios: cada uno solo ve el suyo, se crea siempre como `miembro` y no puede cambiar `uid`, `rol` ni `creado`, ni añadir campos inventados.

Estas reglas se han probado con el emulador de Firestore (`@firebase/rules-unit-testing`): 22 casos permitidos/denegados y la carga inicial de los 239 documentos como admin.

## Siguientes etapas
Completar la migración de cada pantalla, ampliar datos, añadir pruebas y accesibilidad, conectar Angular a la API mediante una URL de entorno, incorporar autenticación y almacenamiento con reglas seguras, validar Render y finalmente construir JavaFX.

**Tutorial detallado:** [GUIA-DESDE-CERO.md](GUIA-DESDE-CERO.md)
