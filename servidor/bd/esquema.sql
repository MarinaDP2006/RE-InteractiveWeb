-- ============================================================
-- UMBRELLA ARCHIVES · Esquema de la base de datos (MySQL 8)
-- Se ejecuta con:  npm run bd:crear   (desde la carpeta servidor/)
-- Borra y vuelve a crear las tablas: úsalo solo para instalar o reiniciar.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS juego_protagonistas, pelicula_protagonistas,
  personaje_imagenes, criatura_imagenes,
  juegos, personajes, criaturas, virus, organizaciones, lugares, peliculas, cronologia,
  expedientes, usuarios, sesiones;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- 1) WIKI PÚBLICA
-- Una tabla por sección. Todas comparten las columnas comunes:
--   id          identificador legible que va en la URL (ficha.html?c=personajes&id=leon)
--   nombre      título de la ficha
--   resumen     frase corta para la tarjeta
--   descripcion texto largo de la ficha
--   imagen      ruta desde web/, p. ej. img/retratos/leon.webp
--   orden       posición en los listados
-- y añaden sus propias columnas.
-- ------------------------------------------------------------

CREATE TABLE juegos (
  id            VARCHAR(60)  PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  resumen       VARCHAR(300) NOT NULL,
  descripcion   TEXT         NOT NULL,
  imagen        VARCHAR(200),
  orden         INT          NOT NULL,
  categoria     ENUM('Principal', 'Remake', 'Spin-off', 'Multijugador') NOT NULL,
  anio          SMALLINT     NOT NULL,
  plataforma    VARCHAR(120),
  ambientacion  VARCHAR(150),
  INDEX idx_juegos_orden (orden)
);

CREATE TABLE personajes (
  id                VARCHAR(60)  PRIMARY KEY,
  nombre            VARCHAR(150) NOT NULL,
  resumen           VARCHAR(300) NOT NULL,
  descripcion       TEXT         NOT NULL,
  imagen            VARCHAR(200),
  orden             INT          NOT NULL,
  primera_aparicion VARCHAR(120),
  afiliacion        VARCHAR(150),
  estado            VARCHAR(60),
  nacimiento        VARCHAR(30),   -- texto: puede ser un año o "Desconocido"
  INDEX idx_personajes_orden (orden)
);

CREATE TABLE criaturas (
  id                VARCHAR(60)  PRIMARY KEY,
  nombre            VARCHAR(150) NOT NULL,
  resumen           VARCHAR(300) NOT NULL,
  descripcion       TEXT         NOT NULL,
  imagen            VARCHAR(200),
  orden             INT          NOT NULL,
  origen            VARCHAR(120),
  primera_aparicion VARCHAR(120),
  peligrosidad      TINYINT CHECK (peligrosidad BETWEEN 1 AND 5),
  INDEX idx_criaturas_orden (orden)
);

CREATE TABLE virus (
  id                VARCHAR(60)  PRIMARY KEY,
  nombre            VARCHAR(150) NOT NULL,
  resumen           VARCHAR(300) NOT NULL,
  descripcion       TEXT         NOT NULL,
  imagen            VARCHAR(200),
  orden             INT          NOT NULL,
  tipo              ENUM('Virus', 'Parásito', 'Hongo') NOT NULL,
  creador           VARCHAR(150),
  primera_aparicion VARCHAR(120),
  INDEX idx_virus_orden (orden)
);

CREATE TABLE organizaciones (
  id          VARCHAR(60)  PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  resumen     VARCHAR(300) NOT NULL,
  descripcion TEXT         NOT NULL,
  imagen      VARCHAR(200),
  orden       INT          NOT NULL,
  tipo        VARCHAR(80),
  fundacion   VARCHAR(30),   -- texto: "1968", "Años 60", "Siglo XIX"...
  lider       VARCHAR(150),
  estado      VARCHAR(60),
  INDEX idx_organizaciones_orden (orden)
);

CREATE TABLE lugares (
  id                VARCHAR(60)  PRIMARY KEY,
  nombre            VARCHAR(150) NOT NULL,
  resumen           VARCHAR(300) NOT NULL,
  descripcion       TEXT         NOT NULL,
  imagen            VARCHAR(200),
  orden             INT          NOT NULL,
  region            VARCHAR(80),
  primera_aparicion VARCHAR(120),
  anio              SMALLINT,
  INDEX idx_lugares_orden (orden)
);

CREATE TABLE peliculas (
  id          VARCHAR(60)  PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  resumen     VARCHAR(300) NOT NULL,
  descripcion TEXT         NOT NULL,
  imagen      VARCHAR(200),
  orden       INT          NOT NULL,
  anio        SMALLINT     NOT NULL,
  formato     VARCHAR(60),
  INDEX idx_peliculas_orden (orden)
);

CREATE TABLE cronologia (
  id          VARCHAR(60)  PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  resumen     VARCHAR(300) NOT NULL,
  descripcion TEXT         NOT NULL,
  imagen      VARCHAR(200),
  orden       INT          NOT NULL,
  periodo     VARCHAR(60),
  anio        SMALLINT,
  juego       VARCHAR(120),
  INDEX idx_cronologia_orden (orden)
);

-- ------------------------------------------------------------
-- 2) LISTAS DENTRO DE UNA FICHA (relaciones 1 a N)
-- Un juego tiene varios protagonistas y un personaje varias imágenes.
-- En vez de guardar listas dentro de una celda, cada elemento es una fila
-- que apunta a su ficha con una clave ajena (FOREIGN KEY).
-- ON DELETE CASCADE: si se borra la ficha, se borran también sus filas.
-- ------------------------------------------------------------

CREATE TABLE juego_protagonistas (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  juego_id VARCHAR(60)  NOT NULL,
  nombre   VARCHAR(120) NOT NULL,
  orden    INT          NOT NULL,
  FOREIGN KEY (juego_id) REFERENCES juegos(id) ON DELETE CASCADE
);

CREATE TABLE pelicula_protagonistas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  pelicula_id VARCHAR(60)  NOT NULL,
  nombre      VARCHAR(120) NOT NULL,
  orden       INT          NOT NULL,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

CREATE TABLE personaje_imagenes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  personaje_id VARCHAR(60)  NOT NULL,
  imagen       VARCHAR(200) NOT NULL,
  orden        INT          NOT NULL,
  FOREIGN KEY (personaje_id) REFERENCES personajes(id) ON DELETE CASCADE
);

CREATE TABLE criatura_imagenes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  criatura_id VARCHAR(60)  NOT NULL,
  imagen      VARCHAR(200) NOT NULL,
  orden       INT          NOT NULL,
  FOREIGN KEY (criatura_id) REFERENCES criaturas(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 3) CONTENIDO RESTRINGIDO
-- La API solo devuelve esta tabla si hay sesión iniciada.
-- ------------------------------------------------------------

CREATE TABLE expedientes (
  id      VARCHAR(60)  PRIMARY KEY,
  titulo  VARCHAR(150) NOT NULL,
  nivel   VARCHAR(40)  NOT NULL,
  resumen VARCHAR(300) NOT NULL,
  texto   TEXT,
  imagen  VARCHAR(200),
  orden   INT          NOT NULL
);

-- ------------------------------------------------------------
-- 4) USUARIOS
-- Se crea una fila al registrarse con email o al entrar por primera vez con Google.
-- La contraseña NUNCA se guarda: solo su hash bcrypt (60 caracteres).
-- Las cuentas de Google no tienen contraseña (password_hash es NULL).
-- ------------------------------------------------------------

CREATE TABLE usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  nombre        VARCHAR(100) NOT NULL,
  foto          VARCHAR(500),
  proveedor     ENUM('email', 'google') NOT NULL,
  password_hash CHAR(60),
  google_id     VARCHAR(64) UNIQUE,
  rol           ENUM('miembro', 'admin') NOT NULL DEFAULT 'miembro',
  creado        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso DATETIME
);

-- ------------------------------------------------------------
-- 5) SESIONES
-- Guarda las sesiones abiertas para que sobrevivan a un reinicio del servidor.
-- La gestiona la librería express-mysql-session.
-- ------------------------------------------------------------

CREATE TABLE sesiones (
  session_id VARCHAR(128) NOT NULL PRIMARY KEY,
  expires    INT UNSIGNED NOT NULL,
  data       MEDIUMTEXT
);
