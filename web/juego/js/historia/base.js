/* ============================================================================
 *  historia/base.js — Personajes, objetos y estructura común de la historia
 * ============================================================================
 *
 *  La historia está repartida en un archivo por juego (re2.js … re9.js).
 *  Este archivo se carga PRIMERO y define:
 *    PERSONAJES · OBJETOS · DOCUMENTOS (vacío, cada juego añade los suyos)
 *    HISTORIA.capitulos (vacío, cada juego añade su capítulo con push)
 *
 *  ─── Estructura de un capítulo ────────────────────────────────────────────
 *   { id, juego, titulo, anio, lugar, tema, fondoImagen,
 *     rutas: [ { id, protagonista, titulo, resumen, pasos: [...] }, ... ] }
 *   Cada RUTA es un personaje jugable con su propia historia: el jugador
 *   elige uno al empezar el capítulo.
 *
 *  ─── Tipos de paso ────────────────────────────────────────────────────────
 *   narracion  { lineas: [..], dar?: {objeto: cantidad} }
 *   explorar   Sala 2D que se recorre con el personaje (motor2d.js): imagen real del
 *              escenario de fondo y personajes de cuerpo entero caminando por ella.
 *              { titulo, descripcion, imagen: "img/escenarios/...webp", ancho, fondo,
 *                horizonte?: 0.5 (altura donde empieza el suelo), oscuridad?: 0.72,
 *                inicio?: [x, z], salida?: {x, z, texto}, matar?: true, sangre?: n,
 *                props: [["tipo", x, z, rotación?, opción?], ...],
 *                puntos: [{x, z, nombre, texto, requerido?, accion?, prop?, altura?}],
 *                npcs: [{id, x, z, lineas: [..], sigue?, dispara?}],
 *                enemigos: [{id, x, z, figura?, vida?, vel?, dano?, rango?, muerte?, ataque?, invencible?, alerta?}] }
 *              Coordenadas en metros: x ∈ [-ancho/2, ancho/2], z ∈ [-fondo/2, fondo/2].
 *              z = -fondo/2 es el fondo de la imagen y z = +fondo/2 el primer plano: el jugador
 *              empieza en primer plano y la salida está, por defecto, al fondo (z = -fondo/2).
 *              accion de un punto: {documento} | {objeto, cantidad} | {objetos} | {sangre}
 *                | {susto, dano, muerte} | {aparecen: [enemigos]} | {marca} | {curar}
 *              props (decorado gore que se dibuja en la sala): ["cadaver", x, z, 0, id],
 *                ["colgado", x, z, 0, id], ["sangre", x, z, 0, tamaño], ["visceras", x, z]
 *                (el resto de tipos de la versión 3D se ignoran: el fondo ya es una imagen real)
 *   chat       { titulo, guion: [ {de, t, efecto?} | {sistema} | {opciones:[{t, resp, efecto?, marca?}]} ] }
 *   encuentro  { enemigo, texto, modo:"machaca"|"esquiva", veces/tiempo | rondas/velocidad, dano, exito, fallo, muerte }
 *   puzzle     { id, ui:"orden"|"codigo"|"texto", titulo, enunciado, pista, ... }  (solución en Puzzles.java)
 *   maquina    { }   ← máquina de escribir para guardar
 *   susto      { enemigo, texto, dano?, muerte? }
 *
 *  Cualquier paso, línea de chat u opción admite  si: "marca"  o  siNo: "marca"
 *  para aparecer solo según las decisiones del jugador (las marcas se ponen
 *  con  marca: "nombre"  en opciones de chat, efectos o acciones de puntos).
 *
 *  Efectos de chat: "sangre" | "temblor" | {dano, muerte} | {objeto:{id:n}} | {documento} | {susto} | {marca} | {curar}
 * ========================================================================== */

"use strict";

/* ----------------------------------------------------------------------------
 *  PERSONAJES
 *  foto: imagen recortada con fondo transparente (img/personajes/). Si no hay
 *  foto, retratos.js dibuja uno en SVG con los rasgos indicados.
 *  En las salas 3D: escala (tamaño), completo (la imagen es el cuerpo entero,
 *  sin piernas 3D) y cuello (fracción de la imagen que es cuerpo: el resto es
 *  la cabeza que sale volando en las decapitaciones).
 * -------------------------------------------------------------------------- */
const PERSONAJES = {
  /* ── Protagonistas y aliados ── */
  leon:      { nombre: "Leon S. Kennedy", color: "#7fb2ff", piel: "#e8c4a2", pelo: "#8b6a3d", peinado: "flequillo", ojos: "#3d6fa8", ropa: "#2b3a52", fondo: "#16243a", foto: "img/personajes/leon.webp", cuerpo: "img/cuerpos/leon.webp" },
  claire:    { nombre: "Claire Redfield", color: "#ff7a7a", piel: "#efcaa8", pelo: "#7b2e1c", peinado: "coleta", ojos: "#5b7ba2", ropa: "#7a1d1d", fondo: "#2a1212", foto: "img/personajes/claire.webp", cuerpo: "img/cuerpos/claire.webp" },
  marvin:    { nombre: "Marvin Branagh", color: "#9fd18b", piel: "#7a5238", pelo: "#151515", peinado: "rapado", ojos: "#2a1a10", ropa: "#25314d", fondo: "#1b2236", extras: ["sangre"], foto: "img/personajes/marvin.webp" },
  ada:       { nombre: "Ada Wong", color: "#ff4d6d", piel: "#efd3bb", pelo: "#0d0d0d", peinado: "melena", ojos: "#2a1a10", ropa: "#7d0b16", fondo: "#260509", extras: ["labios"], foto: "img/personajes/ada.webp", cuerpo: "img/cuerpos/ada.webp" },
  jill:      { nombre: "Jill Valentine", color: "#7fd4ff", piel: "#ecc8a8", pelo: "#2b1a12", peinado: "melena", ojos: "#4f86b5", ropa: "#1e3a5a", fondo: "#10202e", foto: "img/personajes/jill.webp", cuerpo: "img/cuerpos/jill.webp" },
  carlos:    { nombre: "Carlos Oliveira", color: "#ffc46b", piel: "#c99a72", pelo: "#1a120c", peinado: "coleta", ojos: "#2a1a10", ropa: "#3f4a2e", fondo: "#1d2214", extras: ["perilla"], foto: "img/personajes/carlos.webp", cuerpo: "img/cuerpos/carlos.webp" },
  brad:      { nombre: "Brad Vickers", color: "#c7c7c7", piel: "#eac6a6", pelo: "#7a5a3a", peinado: "corto", ojos: "#4a3a2a", ropa: "#3a4a3a", fondo: "#1c1c1c", extras: ["sangre"], foto: "img/personajes/brad.webp" },
  nikolai:   { nombre: "Nikolai Zinoviev", color: "#b0b0b0", piel: "#e2c0a4", pelo: "#b9b9b9", peinado: "rapado", ojos: "#5a6a7a", ropa: "#2f3a2a", fondo: "#151a15", extras: ["barba"], foto: "img/personajes/nikolai.webp", cuerpo: "img/cuerpos/nikolai.webp" },
  hunnigan:  { nombre: "Ingrid Hunnigan", color: "#c9a7ff", piel: "#c99f7e", pelo: "#111111", peinado: "mono", ojos: "#2a1a10", ropa: "#2a2a3a", fondo: "#181828", extras: ["gafas_finas"], foto: "img/personajes/hunnigan.webp", cuerpo: "img/cuerpos/hunnigan.webp" },
  ashley:    { nombre: "Ashley Graham", color: "#ffd27a", piel: "#f1d0b2", pelo: "#e3c27a", peinado: "melena", ojos: "#4a6a8a", ropa: "#b4682a", fondo: "#2a1a0a", foto: "img/personajes/ashley.webp" },
  luis:      { nombre: "Luis Sera", color: "#ffb38a", piel: "#d9b08c", pelo: "#2a1a10", peinado: "largo", ojos: "#2a1a10", ropa: "#4a3a2a", fondo: "#22170f", extras: ["barba"], foto: "img/personajes/luis.webp", cuerpo: "img/cuerpos/luis.webp" },
  comerciante:{ nombre: "El Comerciante", color: "#a6e3a1", piel: "#5a4a3a", pelo: "#1a1a1a", peinado: "calvo", ojos: "#ffdd55", ropa: "#2a2418", fondo: "#120f08", extras: ["capucha", "panuelo", "ojos_rojos"], foto: "img/personajes/comerciante.webp" },
  salazar:   { nombre: "Ramón Salazar", color: "#d9a6ff", piel: "#efdccc", pelo: "#3a2a20", peinado: "repeinado", ojos: "#3a2a20", ropa: "#3d1d4d", fondo: "#1d0d26", extras: ["sombrero"], sombrero: "#2a0d3a", foto: "img/personajes/salazar.webp", escala: 0.8 },
  saddler:   { nombre: "Osmund Saddler", color: "#ff6a6a", piel: "#d8c8b8", pelo: "#bbbbbb", peinado: "largo", ojos: "#cc0000", ropa: "#2a0a0a", fondo: "#1a0505", extras: ["capucha", "ojos_rojos"], foto: "img/personajes/saddler.webp", cuerpo: "img/cuerpos/saddler.webp" },
  chris:     { nombre: "Chris Redfield", color: "#8fd18b", piel: "#e2b48e", pelo: "#3a2a1a", peinado: "corto", ojos: "#4a6a4a", ropa: "#3f4f33", fondo: "#151f12", foto: "img/personajes/chris.webp", cuerpo: "img/cuerpos/chris.webp" },
  sheva:     { nombre: "Sheva Alomar", color: "#ffcf6b", piel: "#7a5038", pelo: "#1a1010", peinado: "coleta", ojos: "#2a1a10", ropa: "#6a5a3a", fondo: "#2a1d0a", foto: "img/personajes/sheva.webp", cuerpo: "img/cuerpos/sheva.webp" },
  wesker:    { nombre: "Albert Wesker", color: "#ffe066", piel: "#ecd2bb", pelo: "#e3cb7a", peinado: "repeinado", ojos: "#cc8800", ropa: "#0f0f0f", fondo: "#260808", extras: ["gafas"], foto: "img/personajes/wesker.webp", cuerpo: "img/cuerpos/wesker.webp" },
  excella:   { nombre: "Excella Gionne", color: "#ffd700", piel: "#d9b392", pelo: "#1a1010", peinado: "largo", ojos: "#2a1a10", ropa: "#e8e0d0", fondo: "#2a220a", extras: ["labios"], foto: "img/personajes/excella.webp", cuerpo: "img/cuerpos/excella.webp" },
  jill_p30:  { nombre: "Jill Valentine (P30)", color: "#ff5c5c", piel: "#f0dcd0", pelo: "#ece4c8", peinado: "melena", ojos: "#cc2222", ropa: "#16161f", fondo: "#14060a", extras: ["p30", "palido"], foto: "img/personajes/jill_p30.webp", cuerpo: "img/cuerpos/jill_p30.webp" },
  helena:    { nombre: "Helena Harper", color: "#b1e1ff", piel: "#ecc9ab", pelo: "#3a1a10", peinado: "mono", ojos: "#3a5a7a", ropa: "#1a2030", fondo: "#0f1622", foto: "img/personajes/helena.webp", cuerpo: "img/cuerpos/helena.webp" },
  piers:     { nombre: "Piers Nivans", color: "#9fe6c8", piel: "#e8c2a0", pelo: "#2a1a10", peinado: "corto", ojos: "#3a2a20", ropa: "#3a4a3a", fondo: "#121c16", foto: "img/personajes/piers.webp", cuerpo: "img/cuerpos/piers.webp" },
  jake:      { nombre: "Jake Muller", color: "#ff9f5a", piel: "#ecc8a8", pelo: "#a8653a", peinado: "rapado", ojos: "#4a6a8a", ropa: "#202020", fondo: "#1a1410", extras: ["cicatriz"], foto: "img/personajes/jake.webp", cuerpo: "img/cuerpos/jake.webp" },
  sherry:    { nombre: "Sherry Birkin", color: "#ffe28a", piel: "#f1d2b4", pelo: "#d8b56a", peinado: "corto", ojos: "#4a7aa8", ropa: "#2a3448", fondo: "#141b28", foto: "img/personajes/sherry.webp", cuerpo: "img/cuerpos/sherry.webp" },
  simmons:   { nombre: "Derek C. Simmons", color: "#bbbbbb", piel: "#e6cbb3", pelo: "#9a9a9a", peinado: "repeinado", ojos: "#4a4a4a", ropa: "#1a1a1a", fondo: "#121212", foto: "img/personajes/simmons.webp" },
  ethan:     { nombre: "Ethan Winters", color: "#d0d0d0", piel: "#e8c8a8", pelo: "#3a2a1a", peinado: "corto", ojos: "#3a2a1a", ropa: "#3a3a3a", fondo: "#151515", extras: ["sin_rostro"], foto: "img/personajes/ethan.webp", cuerpo: "img/cuerpos/ethan.webp" },
  mia:       { nombre: "Mia Winters", color: "#f5c38a", piel: "#e8c8a8", pelo: "#c49a5e", peinado: "coleta", ojos: "#4a6a5a", ropa: "#3a3028", fondo: "#1a140e", extras: ["sangre"], foto: "img/personajes/mia.webp", cuerpo: "img/cuerpos/mia.webp" },
  zoe:       { nombre: "Zoe Baker", color: "#c3e88d", piel: "#e6c2a2", pelo: "#2a1a10", peinado: "coleta", ojos: "#3a2a20", ropa: "#6b7a4a", fondo: "#171c10", foto: "img/personajes/zoe.webp" },
  jack:      { nombre: "Jack Baker", color: "#ff8a65", piel: "#d8b08c", pelo: "#4a4a4a", peinado: "rapado", ojos: "#2a1a10", ropa: "#3a2a1a", fondo: "#1d120a", extras: ["sangre", "cicatriz"], foto: "img/personajes/jack.webp" },
  lucas:     { nombre: "Lucas Baker", color: "#ffd166", piel: "#e2bfa0", pelo: "#3a2a1a", peinado: "corto", ojos: "#2a1a10", ropa: "#5a4a2a", fondo: "#1d1a0a", extras: ["gorra"], foto: "img/personajes/lucas.webp" },
  eveline:   { nombre: "Eveline", color: "#e0e0e0", piel: "#f2e6e0", pelo: "#0d0d0d", peinado: "largo", ojos: "#1a1a1a", ropa: "#1a1a1a", fondo: "#0a0a0a", extras: ["palido"], foto: "img/personajes/eveline.webp", escala: 0.75 },
  duque:     { nombre: "El Duque", color: "#f4d58d", piel: "#e6c7a8", pelo: "#cccccc", peinado: "rapado", ojos: "#2a1a10", ropa: "#4a2a1a", fondo: "#24160c", extras: ["barba"], foto: "img/personajes/duque.webp", escala: 1.2, cuerpo: "img/cuerpos/duque.webp" },
  heisenberg:{ nombre: "Karl Heisenberg", color: "#ffb74d", piel: "#e0bc9a", pelo: "#5a4a3a", peinado: "largo", ojos: "#3a2a20", ropa: "#3a3a2a", fondo: "#1c1a10", extras: ["sombrero", "gafas_redondas", "perilla"], sombrero: "#2a2620", foto: "img/personajes/heisenberg.webp", cuerpo: "img/cuerpos/heisenberg.webp" },
  miranda:   { nombre: "Madre Miranda", color: "#ff3b3b", piel: "#efe2da", pelo: "#e8e0d0", peinado: "largo", ojos: "#ffffff", ropa: "#0d0d0d", fondo: "#100404", extras: ["capucha", "palido"], foto: "img/personajes/miranda.webp", cuerpo: "img/cuerpos/miranda.webp" },
  grace:     { nombre: "Grace Ashcroft", color: "#9ad1ff", piel: "#efd0b6", pelo: "#c8a06a", peinado: "largo", ojos: "#5a7a6a", ropa: "#2f3442", fondo: "#121620", foto: "img/personajes/grace.webp", cuerpo: "img/cuerpos/grace.webp" },
  alyssa:    { nombre: "Alyssa Ashcroft", color: "#e6b3ff", piel: "#ecc8aa", pelo: "#5a3a2a", peinado: "melena", ojos: "#3a5a4a", ropa: "#4a2a3a", fondo: "#1d1018", foto: "img/personajes/alyssa.webp", cuerpo: "img/cuerpos/alyssa.webp" },
  gideon:    { nombre: "Dr. Victor Gideon", color: "#ff5252", piel: "#e2cdbd", pelo: "#8a8a8a", peinado: "repeinado", ojos: "#2a2a2a", ropa: "#ededed", fondo: "#1a0a0a", extras: ["gafas_finas", "sangre"], foto: "img/personajes/gideon.webp", cuerpo: "img/cuerpos/gideon.webp" },

  /* ── Personajes nuevos (retrato dibujado en SVG) ── */
  sherry_nina:{ nombre: "Sherry Birkin (12 años)", color: "#ffe28a", piel: "#f3d6bc", pelo: "#e0c070", peinado: "corto", ojos: "#4a7aa8", ropa: "#3a5a8a", fondo: "#141b28", escala: 0.72, foto: "img/personajes/sherry_nina.webp", cuerpo: "img/cuerpos/sherry_nina.webp" },
  annette:   { nombre: "Annette Birkin", color: "#e8d0ff", piel: "#efd6c2", pelo: "#d8c088", peinado: "mono", ojos: "#4a6a8a", ropa: "#e8e8e8", fondo: "#1a1a22", extras: ["sangre"] },
  birkin:    { nombre: "William Birkin", color: "#ffe9a0", piel: "#e8ccb2", pelo: "#d8c088", peinado: "repeinado", ojos: "#4a6a8a", ropa: "#d8d8d8", fondo: "#1a1a1a", foto: "img/personajes/birkin.webp", cuerpo: "img/cuerpos/birkin.webp" },
  birkin_g:  { nombre: "G · William Birkin", piel: "#a07a6a", pelo: "#3a2a1a", peinado: "largo", ojos: "#ff2020", ropa: "#5a2a2a", fondo: "#1a0505", extras: ["monstruo", "ojos_rojos", "sangre", "cosido"], escala: 1.35 },
  irons:     { nombre: "Jefe Brian Irons", color: "#c8a27a", piel: "#e0b896", pelo: "#3a2a1a", peinado: "repeinado", ojos: "#2a1a10", ropa: "#5a4a3a", fondo: "#1d150d", extras: ["perilla"], escala: 1.1 },
  ben:       { nombre: "Ben Bertolucci", color: "#bcd0e0", piel: "#e2c0a0", pelo: "#3a2a1a", peinado: "corto", ojos: "#3a2a1a", ropa: "#4a4a5a", fondo: "#14161c", extras: ["gafas", "barba"] },
  kendo:     { nombre: "Robert Kendo", color: "#d0b090", piel: "#e2bc98", pelo: "#6a5a4a", peinado: "corto", ojos: "#3a2a1a", ropa: "#3a3a2a", fondo: "#181610", extras: ["barba", "gorra"] },
  tyrell:    { nombre: "Tyrell Patrick", color: "#d8b58a", piel: "#6a4a34", pelo: "#111", peinado: "rapado", ojos: "#2a1a10", ropa: "#3a4a2a", fondo: "#151a10", extras: ["barba"], foto: "img/personajes/tyrell.webp", cuerpo: "img/cuerpos/tyrell.webp" },
  mikhail:   { nombre: "Mikhail Victor", color: "#b8c8a8", piel: "#e0c0a0", pelo: "#888", peinado: "corto", ojos: "#4a5a6a", ropa: "#2f3a2a", fondo: "#121610", extras: ["barba", "sangre"], foto: "img/personajes/mikhail.webp", cuerpo: "img/cuerpos/mikhail.webp" },
  dario:     { nombre: "Dario Rosso", color: "#d0c0b0", piel: "#e6c8aa", pelo: "#2a1a10", peinado: "repeinado", ojos: "#2a1a10", ropa: "#5a5a6a", fondo: "#16161a", extras: ["perilla"] },
  krauser:   { nombre: "Jack Krauser", color: "#c8b088", piel: "#d8b08c", pelo: "#a88a5a", peinado: "rapado", ojos: "#3a4a3a", ropa: "#3a3a2a", fondo: "#141410", extras: ["cicatriz"], foto: "img/personajes/krauser.webp", cuerpo: "img/cuerpos/krauser.webp" },
  mendez:    { nombre: "Bitores Méndez", color: "#c09060", piel: "#c8a888", pelo: "#111", peinado: "calvo", ojos: "#ff3020", ropa: "#3a2a1a", fondo: "#1a0c04", extras: ["barba", "ojos_rojos"], escala: 1.25, foto: "img/personajes/mendez.webp", cuerpo: "img/cuerpos/mendez.webp" },
  gigante:   { nombre: "El Gigante", piel: "#8a7a6a", pelo: "#000", peinado: "calvo", ojos: "#ff3020", ropa: "#3a2a1a", fondo: "#120a04", extras: ["monstruo", "ojos_rojos", "sangre"], escala: 2.2, foto: "img/personajes/gigante.webp", cuerpo: "img/cuerpos/gigante.webp" },
  ganado:    { nombre: "Ganado", piel: "#c8a888", pelo: "#3a2a1a", peinado: "corto", ojos: "#ff2a1a", ropa: "#4a3a2a", fondo: "#1a1208", extras: ["ojos_rojos", "barba", "sangre"], foto: "img/personajes/ganado.webp", cuerpo: "img/cuerpos/ganado.webp" },
  monje:     { nombre: "Zealot de Los Iluminados", piel: "#c8a888", pelo: "#000", peinado: "calvo", ojos: "#ff2a1a", ropa: "#3a0a0a", fondo: "#120404", extras: ["capucha", "ojos_rojos"], foto: "img/personajes/monje.webp", cuerpo: "img/cuerpos/monje.webp" },
  regenerador:{ nombre: "Regenerador", piel: "#9a9a8a", pelo: "#000", peinado: "calvo", ojos: "#000", ropa: "#4a4a4a", fondo: "#0a0a0a", extras: ["monstruo", "sin_ojos", "cosido"], escala: 1.1, foto: "img/personajes/regenerador.webp", cuerpo: "img/cuerpos/regenerador.webp" },
  irving:    { nombre: "Ricardo Irving", color: "#e0c080", piel: "#d8b08c", pelo: "#1a1010", peinado: "repeinado", ojos: "#2a1a10", ropa: "#6a5a4a", fondo: "#1d1608", extras: ["gafas", "perilla"] },
  josh:      { nombre: "Josh Stone", color: "#9ad0a0", piel: "#5a3a28", pelo: "#111", peinado: "rapado", ojos: "#2a1a10", ropa: "#4a4a3a", fondo: "#151810", extras: ["perilla"], foto: "img/personajes/josh.webp", cuerpo: "img/cuerpos/josh.webp" },
  majini:    { nombre: "Majini", piel: "#6a4a34", pelo: "#111", peinado: "rapado", ojos: "#ff2a1a", ropa: "#5a4a2a", fondo: "#1a0e04", extras: ["ojos_rojos", "sangre", "panuelo"], foto: "img/personajes/majini.webp", cuerpo: "img/cuerpos/majini.webp" },
  uroboros:  { nombre: "Sujeto Uroboros", piel: "#1a1a1a", pelo: "#000", peinado: "calvo", ojos: "#ff4020", ropa: "#0a0a0a", fondo: "#000", extras: ["monstruo", "ojos_rojos", "lengua"], escala: 1.3 },
  benford:   { nombre: "Presidente Adam Benford", piel: "#a8b098", pelo: "#bbb", peinado: "repeinado", ojos: "#fff", ropa: "#1a1a2a", fondo: "#0a0a10", extras: ["palido", "ojo_blanco", "sangre"], foto: "img/personajes/benford.webp", cuerpo: "img/cuerpos/benford.webp" },
  carla:     { nombre: "Carla Radames", color: "#ff6688", piel: "#efd3bb", pelo: "#0d0d0d", peinado: "melena", ojos: "#2a1a10", ropa: "#3a0a16", fondo: "#260509", extras: ["labios"], foto: "img/personajes/ada.webp", cuerpo: "img/cuerpos/carla.webp" },
  deborah:   { nombre: "Deborah Harper", color: "#c8e0ff", piel: "#ecc9ab", pelo: "#5a2a1a", peinado: "melena", ojos: "#3a5a7a", ropa: "#2a2030", fondo: "#0f1622", extras: ["palido", "sangre"] },
  jo:        { nombre: "Soldado de la J'avo", piel: "#c8a888", pelo: "#111", peinado: "rapado", ojos: "#ff2a1a", ropa: "#3a3a2a", fondo: "#121208", extras: ["ojos_rojos", "cicatriz", "gorra"], foto: "img/personajes/jo.webp", cuerpo: "img/cuerpos/jo.webp" },
  marguerite:{ nombre: "Marguerite Baker", color: "#c8b0a0", piel: "#b8a898", pelo: "#6a6a6a", peinado: "mono", ojos: "#ffffff", ropa: "#3a3028", fondo: "#14100a", extras: ["palido", "ojo_blanco", "sangre"] },
  eveline_vieja:{ nombre: "Eveline (anciana)", piel: "#c8b8b0", pelo: "#ddd", peinado: "largo", ojos: "#fff", ropa: "#2a2a2a", fondo: "#0a0a0a", extras: ["palido", "ojo_blanco"] },
  capitan:   { nombre: "Capitán del Annabelle", color: "#a8c0d8", piel: "#e0c0a0", pelo: "#ccc", peinado: "corto", ojos: "#3a4a5a", ropa: "#1a2a3a", fondo: "#0a1018", extras: ["barba", "gorra"] },
  moldeado:  { nombre: "Moldeado", piel: "#1e1a14", pelo: "#000", peinado: "calvo", ojos: "#000", ropa: "#0e0c08", fondo: "#000", extras: ["monstruo", "sin_rostro", "lengua"], escala: 1.1, foto: "img/personajes/moldeado.webp", cuerpo: "img/cuerpos/moldeado.webp" },
  rose:      { nombre: "Rose Winters", color: "#f0a8c8", piel: "#f0d6c0", pelo: "#2a1a10", peinado: "melena", ojos: "#4a6a5a", ropa: "#3a3a4a", fondo: "#1a1018", foto: "img/personajes/rose.webp", cuerpo: "img/cuerpos/rose.webp" },
  michael:   { nombre: "«Michael»", color: "#d0d0d0", piel: "#e8c8a8", pelo: "#3a2a1a", peinado: "corto", ojos: "#3a2a1a", ropa: "#3a3a3a", fondo: "#101010", extras: ["sin_rostro"] },
  donna:     { nombre: "Donna Beneviento", color: "#b8a8c8", piel: "#efe2da", pelo: "#2a1a1a", peinado: "largo", ojos: "#000", ropa: "#1a1a1a", fondo: "#0a080c", extras: ["capucha", "palido"], foto: "img/personajes/donna.webp", cuerpo: "img/cuerpos/donna.webp" },
  angie:     { nombre: "Angie", color: "#ffd0e0", piel: "#f8f0e8", pelo: "#c8a060", peinado: "coleta", ojos: "#2a2a6a", ropa: "#e8e0d0", fondo: "#1a1010", extras: ["labios", "sombrero"], sombrero: "#e8e0d0", escala: 0.6, foto: "img/personajes/angie.webp", cuerpo: "img/cuerpos/angie.webp" },
  bebe:      { nombre: "La cosa del sótano", piel: "#e8d0c8", pelo: "#000", peinado: "calvo", ojos: "#000", ropa: "#c8a8a0", fondo: "#100404", extras: ["monstruo", "sin_ojos", "palido", "lengua", "sangre"], escala: 2.2, completo: true },
  moreau:    { nombre: "Salvatore Moreau", color: "#a8c890", piel: "#a8b098", pelo: "#000", peinado: "calvo", ojos: "#fff", ropa: "#3a3a2a", fondo: "#0a100a", extras: ["monstruo", "ojo_blanco", "lengua", "capucha"], foto: "img/personajes/moreau.webp", cuerpo: "img/cuerpos/moreau.webp" },
  licantropo:{ nombre: "Licántropo", piel: "#8a7a6a", pelo: "#3a2a1a", peinado: "largo", ojos: "#ffcc00", ropa: "#3a2a1a", fondo: "#0a0804", extras: ["monstruo", "ojos_rojos", "sangre"], foto: "img/personajes/licantropo.webp", cuerpo: "img/cuerpos/licantropo.webp" },
  hija:      { nombre: "Hija de Dimitrescu", piel: "#efe2da", pelo: "#d8b878", peinado: "melena", ojos: "#d4a000", ropa: "#1a1a1a", fondo: "#100404", extras: ["capucha", "labios", "palido", "sangre"], foto: "img/personajes/hija.webp", cuerpo: "img/cuerpos/hija.webp" },
  lobo:      { nombre: "Soldado Hound Wolf", color: "#a8b8a8", piel: "#d8b08c", pelo: "#3a2a1a", peinado: "rapado", ojos: "#3a3a3a", ropa: "#2a3a2a", fondo: "#101410", extras: ["gorra", "perilla"] },
  soldado:   { nombre: "Soldado de la B.S.A.A.", color: "#a8b8c8", piel: "#d8b08c", pelo: "#2a1a10", peinado: "rapado", ojos: "#3a3a3a", ropa: "#2a3a4a", fondo: "#10141a", extras: ["gorra"] },
  zeno:      { nombre: "Zeno", color: "#d0d0ff", piel: "#efe6e0", pelo: "#e8e8e8", peinado: "repeinado", ojos: "#8a0000", ropa: "#ececec", fondo: "#0a0a12", extras: ["palido", "gafas_finas"], foto: "img/personajes/zeno.webp", cuerpo: "img/cuerpos/zeno.webp" },
  katherine: { nombre: "Katherine Warren", piel: "#d8c8c0", pelo: "#3a2a1a", peinado: "melena", ojos: "#fff", ropa: "#e8e0e8", fondo: "#0a0a0a", extras: ["palido", "ojo_blanco", "sangre", "labios"] },
  g_adulto:  { nombre: "G adulto", piel: "#7a5a5a", pelo: "#000", peinado: "calvo", ojos: "#ffcc00", ropa: "#4a2a2a", fondo: "#100404", extras: ["monstruo", "ojos_rojos", "lengua", "sangre"], completo: true, escala: 1.1, foto: "img/personajes/g_adulto.webp", cuerpo: "img/cuerpos/g_adulto.webp" },
  huerfano:  { nombre: "Niño del orfanato", piel: "#d8c8c0", pelo: "#2a1a10", peinado: "corto", ojos: "#fff", ropa: "#c8c0b0", fondo: "#0a0a0a", extras: ["palido", "ojo_blanco", "sangre"], escala: 0.65 },

  /* ── Criaturas (encuentros, sustos y enemigos de las salas 3D) ── */
  zombi:     { nombre: "Zombi", piel: "#9aa58c", pelo: "#2a2a2a", peinado: "rapado", ojos: "#ffffff", ropa: "#2a2a3a", fondo: "#0a0f0a", extras: ["sangre", "ojo_blanco", "palido"], foto: "img/personajes/zombi.webp", cuello: 0.36, cuerpo: "img/cuerpos/zombi.webp" },
  perro:     { nombre: "Cerbero", piel: "#6a3a2a", pelo: "#000", peinado: "calvo", ojos: "#ff2020", ropa: "#5a1a10", fondo: "#100000", extras: ["monstruo", "ojos_rojos", "sangre", "lengua"], foto: "img/personajes/perro.webp", cuerpo: "img/cuerpos/perro.webp" },
  licker:    { nombre: "Licker", piel: "#8a2a2a", pelo: "#000", peinado: "calvo", ojos: "#000", ropa: "#5a1010", fondo: "#100000", extras: ["cerebro", "lengua", "sin_ojos"], foto: "img/personajes/licker.webp", cuello: 0.62, cuerpo: "img/cuerpos/licker.webp" },
  mrx:       { nombre: "Tyrant T-00 «Mr. X»", piel: "#8b8b8b", pelo: "#000", peinado: "calvo", ojos: "#222", ropa: "#232323", fondo: "#0c0c0c", extras: ["sombrero"], sombrero: "#1a1a1a", foto: "img/personajes/mrx.webp", cuello: 0.48, cuerpo: "img/cuerpos/mrx.webp" },
  nemesis:   { nombre: "NÉMESIS", piel: "#7a6a6a", pelo: "#000", peinado: "calvo", ojos: "#ffffff", ropa: "#1a1a1a", fondo: "#140000", extras: ["monstruo", "cosido", "ojo_blanco", "sangre"], foto: "img/personajes/nemesis.webp", cuerpo: "img/cuerpos/nemesis.webp" },
  hunter:    { nombre: "Hunter β", piel: "#5a6a3a", pelo: "#000", peinado: "calvo", ojos: "#ffcc00", ropa: "#3a4a2a", fondo: "#0a1004", extras: ["monstruo", "ojos_rojos", "lengua"], foto: "img/personajes/hunter.webp", cuerpo: "img/cuerpos/hunter.webp" },
  ivy:       { nombre: "Planta 43 «Ivy»", piel: "#4a6a3a", pelo: "#2a4a1a", peinado: "largo", ojos: "#ff2020", ropa: "#2a4a1a", fondo: "#041004", extras: ["monstruo", "sin_ojos", "lengua"], foto: "img/personajes/ivy.webp", cuerpo: "img/cuerpos/ivy.webp" },
  salvador:  { nombre: "Dr. Salvador", piel: "#8a6a4a", pelo: "#000", peinado: "calvo", ojos: "#000", ropa: "#3a2a1a", fondo: "#120a04", extras: ["saco", "sangre"], foto: "img/personajes/salvador.webp" },
  verdugo:   { nombre: "Verdugo Majini", piel: "#4a3020", pelo: "#000", peinado: "calvo", ojos: "#000", ropa: "#2a1a0a", fondo: "#1a0c02", extras: ["saco", "sangre"], foto: "img/personajes/verdugo.webp" },
  ustanak:   { nombre: "Ustanak", piel: "#9a8f8f", pelo: "#000", peinado: "calvo", ojos: "#ff2020", ropa: "#2a2a2a", fondo: "#0c0606", extras: ["monstruo", "ojos_rojos", "cicatriz"], foto: "img/personajes/ustanak.webp", cuerpo: "img/cuerpos/ustanak.webp" },
  dimitrescu:{ nombre: "Lady Dimitrescu", piel: "#ece0da", pelo: "#111111", peinado: "melena", ojos: "#d4a000", ropa: "#ececec", fondo: "#1a0a0a", extras: ["sombrero_ancho", "labios", "palido"], sombrero: "#f2f2f2", foto: "img/personajes/dimitrescu.webp", cuerpo: "img/cuerpos/dimitrescu.webp" },
  criatura:  { nombre: "Criatura del Wrenwood", piel: "#6a5a5a", pelo: "#000", peinado: "calvo", ojos: "#ff2020", ropa: "#1a0a0a", fondo: "#0a0000", extras: ["monstruo", "ojos_rojos", "sangre", "lengua"], foto: null }
};

/* ----------------------------------------------------------------------------
 *  OBJETOS del inventario
 *   cura: puntos de vida que recupera al usarse (máximo 100).
 * -------------------------------------------------------------------------- */
const OBJETOS = {
  hierba_verde: { nombre: "Hierba verde", icono: "🌿", desc: "Planta medicinal típica de la región de Raccoon. Restaura algo de salud.", cura: 35 },
  hierba_mixta: { nombre: "Hierbas mezcladas (V+R)", icono: "🍀", desc: "Hierba verde y roja machacadas juntas. Restauran casi toda la salud.", cura: 80 },
  spray:        { nombre: "Spray de primeros auxilios", icono: "🩹", desc: "Aerosol médico. Restaura toda la salud.", cura: 100 },
  municion:     { nombre: "Munición de pistola", icono: "🔫", desc: "Balas de 9 mm. En las salas 3D, dispara con Espacio (o el botón 🔫). Sin balas, solo te queda el cuchillo." },
  cinta:        { nombre: "Cinta de tinta", icono: "🎞️", desc: "Necesaria para guardar la partida en una máquina de escribir." }
};

/* ----------------------------------------------------------------------------
 *  DOCUMENTOS: cada archivo de juego añade los suyos con Object.assign.
 *   estilo: "papel" (nota manuscrita), "informe" (mecanografiado),
 *           "email" (pantalla de ordenador), "sangre" (nota manchada).
 * -------------------------------------------------------------------------- */
const DOCUMENTOS = {};

/* ----------------------------------------------------------------------------
 *  LA HISTORIA: cada archivo re2.js … re9.js añade su capítulo en orden.
 * -------------------------------------------------------------------------- */
const HISTORIA = {
  titulo: "Archivos Umbrella",
  capitulos: []
};
