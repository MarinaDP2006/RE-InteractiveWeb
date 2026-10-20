/* ============================================================================
 *  3d/niveles/comun.js — Enemigos, compañeros y objetos del juego 3D
 * ============================================================================
 *  ENEMIGOS: estadísticas y figura (foto de cuerpo entero de img/cuerpos/).
 *  Donde no hay foto propia se usa otra figura con un tinte (zombis, Jack...).
 *  OBJETOS: lo que se puede recoger, su icono y su efecto.
 * ========================================================================== */

/** vida en puntos (pistola: 22 · cabeza ×3) · vel en m/s · alcance de ataque en m */
export const ENEMIGOS = {
  zombi:      { nombre: "Zombi", figuras: ["zombi"], alto: 1.78, vida: 110, vel: 0.75, velPersecucion: 1.05, dano: 18, agarra: true, oido: 10, vista: 13, sonido: "gemido" },
  perro:      { nombre: "Cerbero", figuras: ["perro"], alto: 0.95, ancho: 1.3, vida: 55, vel: 1.2, velPersecucion: 4.3, dano: 12, oido: 16, vista: 18, sonido: "grunido" },
  licker:     { nombre: "Licker", figuras: ["licker"], alto: 1.15, ancho: 1.6, vida: 170, vel: 0.8, velPersecucion: 3.2, dano: 28, ciego: true, oido: 14, sonido: "grunido" },
  hunter:     { nombre: "Hunter", figuras: ["hunter"], alto: 1.9, vida: 210, vel: 1.2, velPersecucion: 3.1, dano: 38, decapita: true, oido: 14, vista: 16, sonido: "grunido" },
  ganado:     { nombre: "Ganado", figuras: ["ganado"], alto: 1.75, vida: 120, vel: 1, velPersecucion: 1.7, dano: 22, agarra: true, oido: 14, vista: 18, sonido: "gemido", frases: ["¡Agárrenlo!", "¡Mátalo!", "Se lo comerán…", "¡Un forastero!"] },
  motosierra: { nombre: "Dr. Salvador", figuras: ["ganado"], tinte: "#6a5048", alto: 1.95, vida: 380, vel: 1.1, velPersecucion: 1.7, dano: 70, oido: 16, vista: 18, sonido: "motosierra" },
  majini:     { nombre: "Majini", figuras: ["majini"], alto: 1.78, vida: 120, vel: 1, velPersecucion: 1.8, dano: 22, agarra: true, oido: 14, vista: 18, sonido: "gemido" },
  javo:       { nombre: "J'avo", figuras: ["majini", "ganado"], tinte: "#8a9a8a", alto: 1.8, vida: 150, vel: 1.2, velPersecucion: 2.2, dano: 25, oido: 16, vista: 20, sonido: "grunido" },
  moldeado:   { nombre: "Moldeado", figuras: ["moldeado"], alto: 1.95, vida: 160, vel: 0.9, velPersecucion: 1.5, dano: 26, agarra: true, oido: 12, vista: 10, sonido: "grunido" },
  licantropo: { nombre: "Licántropo", figuras: ["licantropo"], alto: 1.85, vida: 140, vel: 1.3, velPersecucion: 3.6, dano: 24, oido: 16, vista: 20, sonido: "grunido" },
  monje:      { nombre: "Zealot", figuras: ["monje"], alto: 1.8, vida: 120, vel: 1, velPersecucion: 1.6, dano: 22, agarra: true, oido: 14, vista: 18, sonido: "gemido" },
  regenerador:{ nombre: "Regenerador", figuras: ["regenerador"], alto: 2, vida: 260, vel: 0.6, velPersecucion: 0.95, dano: 40, agarra: true, oido: 10, vista: 12, sonido: "respiracion" },
  hija:       { nombre: "Hija de Dimitrescu", figuras: ["hija"], alto: 1.8, vida: 220, vel: 1.4, velPersecucion: 2.6, dano: 26, oido: 16, vista: 18, sonido: "susurro" },
  criatura:   { nombre: "Criatura", figuras: ["g_adulto"], alto: 2.1, vida: 240, vel: 1, velPersecucion: 2.2, dano: 32, oido: 16, vista: 18, sonido: "grunido" },

  // Perseguidores: no mueren, solo caen aturdidos unos segundos.
  mrx:        { nombre: "Mr. X", figuras: ["mrx"], alto: 2.25, vida: 420, vel: 1.25, velPersecucion: 1.35, dano: 38, invencible: true, oido: 30, vista: 30, pasos: true, sonido: "grunido" },
  nemesis:    { nombre: "Némesis", figuras: ["nemesis"], alto: 2.3, vida: 480, vel: 1.4, velPersecucion: 2.1, dano: 42, invencible: true, oido: 30, vista: 30, pasos: true, sonido: "grunido", frases: ["S.T.A.R.S…"] },
  jack:       { nombre: "Jack Baker", figuras: ["mendez"], tinte: "#7a6a5a", alto: 1.95, vida: 400, vel: 1.2, velPersecucion: 1.45, dano: 34, invencible: true, oido: 30, vista: 30, pasos: true, sonido: "grunido", frases: ["Bienvenido a la familia, hijo.", "¡Ethan! ¿Dónde te escondes?", "No puedes huir de la familia."] },
  dimitrescu: { nombre: "Lady Dimitrescu", figuras: ["dimitrescu"], alto: 2.9, vida: 500, vel: 1.1, velPersecucion: 1.3, dano: 40, invencible: true, oido: 30, vista: 30, pasos: true, sonido: "grunido", frases: ["¿Dónde estás, hombrecito?", "Tienes una sangre muy dulce…"] },
  ustanak:    { nombre: "Ustanak", figuras: ["ustanak"], alto: 2.35, vida: 460, vel: 1.3, velPersecucion: 1.7, dano: 40, invencible: true, oido: 30, vista: 30, pasos: true, sonido: "grunido" },

  // Jefes finales de cada archivo.
  tyrant:     { nombre: "Tyrant T-002", figuras: ["mrx"], tinte: "#b8a6a0", alto: 2.4, vida: 1400, vel: 1.2, velPersecucion: 2, dano: 40, jefe: true, embestida: true, oido: 40, vista: 40, sonido: "grunido" },
  g_birkin:   { nombre: "G (William Birkin)", figuras: ["birkin"], tinte: "#c8a090", alto: 2.3, vida: 1500, vel: 1.1, velPersecucion: 1.9, dano: 42, jefe: true, embestida: true, oido: 40, vista: 40, sonido: "grunido" },
  nemesis_jefe:{ nombre: "Némesis", figuras: ["nemesis"], alto: 2.4, vida: 1700, vel: 1.3, velPersecucion: 2.3, dano: 45, jefe: true, embestida: true, oido: 40, vista: 40, sonido: "grunido" },
  mendez:     { nombre: "Bitores Méndez", figuras: ["mendez"], alto: 2.3, vida: 1500, vel: 1.2, velPersecucion: 2, dano: 40, jefe: true, embestida: true, oido: 40, vista: 40, sonido: "grunido" },
  wesker:     { nombre: "Albert Wesker", figuras: ["wesker"], alto: 1.86, vida: 1600, vel: 2, velPersecucion: 4.2, dano: 35, jefe: true, esquiva: true, oido: 40, vista: 40, sonido: "golpe", frases: ["Siete minutos. Es todo lo que puedo dedicarte.", "Tu tiempo se ha acabado, Chris."] },
  ustanak_jefe:{ nombre: "Ustanak", figuras: ["ustanak"], alto: 2.4, vida: 1700, vel: 1.4, velPersecucion: 2.4, dano: 44, jefe: true, embestida: true, oido: 40, vista: 40, sonido: "grunido" },
  jack_jefe:  { nombre: "Jack Baker", figuras: ["mendez"], tinte: "#6a5040", alto: 2.1, vida: 1500, vel: 1.3, velPersecucion: 2.1, dano: 40, jefe: true, embestida: true, oido: 40, vista: 40, sonido: "grunido" },
  miranda:    { nombre: "Madre Miranda", figuras: ["miranda"], alto: 2.2, vida: 1800, vel: 1.6, velPersecucion: 2.8, dano: 42, jefe: true, esquiva: true, oido: 40, vista: 40, sonido: "susurro" },
  gideon:     { nombre: "Dr. Victor Gideon", figuras: ["gideon"], tinte: "#c8b0b0", alto: 2.1, vida: 1700, vel: 1.4, velPersecucion: 2.4, dano: 42, jefe: true, embestida: true, oido: 40, vista: 40, sonido: "grunido" }
};

/** Compañeros: disparan a los enemigos y te siguen. */
export const COMPANEROS = {
  chris: { figura: "chris", arma: "pistola", frases: ["Cúbreme.", "¡Detrás de ti!", "Seguimos juntos, Jill.", "Hay algo moviéndose ahí."] },
  ada: { figura: "ada", arma: "pistola", frases: ["No te separes, Leon.", "Yo me encargo.", "Interesante…", "¿Siempre atraes a tantos admiradores?"] },
  carlos: { figura: "carlos", arma: "fusil", frases: ["¡Jill, a tu izquierda!", "Tranquila, te cubro.", "¡Vamos, vamos!", "Esto es una locura."] },
  luis: { figura: "luis", arma: "pistola", frases: ["Amigo, esto se pone feo.", "¡Detrás!", "Te lo dije: no son zombis.", "Esa gente no está bien."] },
  sheva: { figura: "sheva", arma: "pistola", frases: ["¡Chris, cuidado!", "Te cubro.", "Socio, por aquí.", "Son muchos…"] },
  sherry: { figura: "sherry", arma: "pistola", frases: ["Jake, a tu derecha.", "No te pares.", "Lo tengo.", "¿Siempre eres así de simpático?"] },
  mia: { figura: "mia", arma: "pistola", frases: ["Ethan… lo siento.", "Detrás de ti.", "Tenemos que salir de aquí.", "Ella nos está oyendo."] },
  leon: { figura: "leon_re9", arma: "pistola", frases: ["Mantente detrás de mí, Grace.", "Ya he estado aquí. Nada ha cambiado.", "Buen tiro.", "Respira. Sigue andando."] },
  helena: { figura: "helena", arma: "pistola", frases: ["Leon, por aquí.", "Te cubro.", "Esto es culpa mía…", "¡Detrás!"] }
};

/** Objetos que se recogen. icono: clave de ICONOS. */
export const OBJETOS = {
  hierba_verde: { nombre: "Hierba verde", icono: "hierba", color: "#3aa04a", desc: "Hierba medicinal de la zona. Cura un poco.", cura: 35 },
  hierba_roja: { nombre: "Hierba roja", icono: "hierba", color: "#c03030", desc: "Sola no sirve. Combinada con una verde, cura del todo.", combina: "hierba_verde" },
  hierba_mixta: { nombre: "Hierba mixta", icono: "hierba", color: "#c8a030", desc: "Verde y roja combinadas. Cura por completo.", cura: 100 },
  spray: { nombre: "Spray de primeros auxilios", icono: "spray", color: "#e8e8e8", desc: "Restaura toda la salud.", cura: 100 },
  municion: { nombre: "Balas de pistola", icono: "balas", color: "#c8a060", desc: "Munición de 9 mm.", municion: "pistola" },
  cartuchos: { nombre: "Cartuchos de escopeta", icono: "cartuchos", color: "#c03020", desc: "Munición de calibre 12.", municion: "escopeta" },
  cinta: { nombre: "Cinta de tinta", icono: "cinta", color: "#3a3a3a", desc: "Para guardar en una máquina de escribir." },
  escopeta: { nombre: "Escopeta", icono: "escopeta", color: "#5a4a3a", desc: "Devastadora a corta distancia.", arma: "escopeta" },
  mapa: { nombre: "Mapa de la zona", icono: "mapa", color: "#d8c8a0", desc: "Muestra todas las salas de la zona.", mapa: true }
};

/** Iconos SVG de los objetos (estilo inventario de RE). */
export const ICONOS = {
  hierba: (c) => `<svg viewBox="0 0 48 48"><path d="M24 44V22" stroke="#2a4a20" stroke-width="2.5"/><path d="M24 26c-10-2-14-10-12-18 8 1 13 8 12 18zM24 30c9-1 14-8 13-16-8 0-13 7-13 16zM24 22c-3-6-1-14 4-18 4 5 2 13-4 18z" fill="${c}"/><rect x="14" y="38" width="20" height="8" rx="2" fill="#6a4a2a"/></svg>`,
  spray: () => `<svg viewBox="0 0 48 48"><rect x="15" y="14" width="18" height="30" rx="3" fill="#e8e8e8"/><rect x="19" y="6" width="10" height="8" fill="#888"/><path d="M21 25h6M24 22v6" stroke="#c00" stroke-width="3"/></svg>`,
  balas: () => `<svg viewBox="0 0 48 48"><rect x="8" y="16" width="32" height="24" rx="2" fill="#6a5a3a"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${11 + i * 6}" y="8" width="4" height="14" rx="2" fill="#d8b060"/>`).join("")}<text x="24" y="33" font-size="8" fill="#e8d8b0" text-anchor="middle" font-family="monospace">9mm</text></svg>`,
  cartuchos: () => `<svg viewBox="0 0 48 48">${[0, 1, 2].map((i) => `<rect x="${10 + i * 10}" y="10" width="8" height="28" rx="2" fill="#b02818"/><rect x="${10 + i * 10}" y="32" width="8" height="7" fill="#c8a040"/>`).join("")}</svg>`,
  cinta: () => `<svg viewBox="0 0 48 48"><rect x="8" y="14" width="32" height="20" rx="3" fill="#2a2a2a"/><circle cx="17" cy="24" r="5" fill="#666"/><circle cx="31" cy="24" r="5" fill="#666"/></svg>`,
  escopeta: () => `<svg viewBox="0 0 48 48"><path d="M3 22h30l4 2h8v4H22l-6 8h-6l3-8H3z" fill="#3a3a3a"/><path d="M22 28l-6 8h-6l3-8z" fill="#6a4a2a"/></svg>`,
  mapa: () => `<svg viewBox="0 0 48 48"><path d="M6 10l12-4 12 4 12-4v32l-12 4-12-4-12 4z" fill="#d8c8a0"/><path d="M18 6v32M30 10v32" stroke="#8a7a5a"/><path d="M10 20h6v6h-6z" fill="none" stroke="#a03020"/></svg>`,
  llave: (c) => `<svg viewBox="0 0 48 48"><circle cx="15" cy="24" r="8" fill="none" stroke="${c}" stroke-width="4"/><path d="M23 24h20M37 24v7M42 24v5" stroke="${c}" stroke-width="4"/></svg>`,
  documento: () => `<svg viewBox="0 0 48 48"><path d="M12 6h18l8 8v28H12z" fill="#e8dcc0"/><path d="M16 18h16M16 24h16M16 30h12" stroke="#8a7a5a"/></svg>`,
  gema: (c) => `<svg viewBox="0 0 48 48"><path d="M24 6l14 12-14 24-14-24z" fill="${c}" stroke="#fff4" /></svg>`,
  medallon: (c) => `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="${c}"/><circle cx="24" cy="24" r="10" fill="none" stroke="#0006" stroke-width="2"/></svg>`
};
