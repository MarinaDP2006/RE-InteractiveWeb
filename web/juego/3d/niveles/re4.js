/* ============================================================================
 *  ARCHIVO IV · RESIDENT EVIL 4 (2004) — El pueblo de los Ganados
 * ============================================================================
 *  Leon, agente del Gobierno. Casa del aldeano → camino → plaza del pueblo
 *  (la hoguera, el Dr. Salvador y la campana) → casa del jefe (Luis, la nota
 *  del acróstico) → granero (Bitores Méndez) → castillo Salazar (las tres
 *  bestias) → pasadizo hacia el muelle.
 * ========================================================================== */
const P = Math.PI;

export default {
  id: "re4", juego: "Resident Evil 4", titulo: "Un forastero", lugar: "Pueblo rural de España", anio: "Otoño de 2004",
  protagonista: "leon", companero: null, tema: "tema-re4", temaMusica: "re4", fondo: "img/escenarios/re4_plaza.webp", tiempoPar: 1000,
  variantes: { ada: "ada_re4", wesker: "wesker_re4" },
  inicio: { x: 2, z: 3, yaw: -P / 2 },
  objetivo: "Busca a Ashley Graham, la hija del presidente",
  ambiente: { niebla: "#14130f", densidad: 0.04, ambiente: 0.14, luzCielo: "#6a6a5a", luzSuelo: "#2a2010", luna: 1.2, colorLuna: "#c8c0a8" },
  llaves: { llave_granero: { nombre: "Llave del granero", color: "#8a6a3a" }, ojo_mendez: { nombre: "Ojo de Méndez", color: "#c03020", icono: "gema" } },

  salas: [
    { id: "casa_inicio", nombre: "Casa del aldeano", x: 0, z: 0, w: 8, d: 6, alto: 2.8, suelo: "madera", pared: "madera", techo: "madera_oscura",
      props: [["chimenea", 0.35, 3, P / 2], ["mesa", 4.5, 1.6, 0, { ancho: 1.4, fondo: 0.8 }], ["silla", 4.5, 2.4, P], ["estanteria", 6, 0.4, 0], ["barril", 7.4, 5.4], ["colgado", 5, 4.5, 0, { figura: "zombi", alto: 2.8 }]] },
    { id: "camino", nombre: "Camino del bosque", x: 8, z: -6, w: 24, d: 14, exterior: true, suelo: "tierra", pared: "roca",
      props: [["arbol_seco", 11, -3], ["arbol_seco", 29, -3], ["arbol", 14, 5], ["arbol", 28, 3], ["carro", 24, 1, 0.3], ["valla", 18, 6.5, 0, { largo: 4 }], ["heno", 11, 6], ["lapida", 30, 6]] },
    { id: "plaza", nombre: "Plaza del pueblo", x: 8, z: 8, w: 24, d: 16, exterior: true, suelo: "tierra", pared: "piedra",
      props: [["hoguera", 20, 16, 0, { figura: "zombi" }], ["carro", 12, 12, 1.2], ["heno", 28, 11], ["heno", 11, 21], ["barril", 30.5, 22], ["barril", 30, 21.3], ["cruz", 26, 22.5], ["valla", 26, 9.2, 0, { largo: 3 }], ["arbol_seco", 29, 18]] },
    { id: "casa_jefe", nombre: "Casa del jefe", segura: true, x: 32, z: 10, w: 10, d: 10, alto: 3, suelo: "madera", pared: "madera", techo: "madera_oscura",
      props: [["mesa", 38, 13, 0, { ancho: 1.6, fondo: 0.9 }], ["silla", 38, 13.9, P], ["estanteria", 41.6, 17, -P / 2], ["cama", 40.5, 18.6, P / 2], ["chimenea", 37, 19.65, P], ["baul", 33, 19.2, P], ["lampara_techo", 37, 15, 0, { intensidad: 5, parpadeo: 0.2 }]] },
    { id: "granero", nombre: "Granero", x: 8, z: 24, w: 14, d: 12, alto: 6, suelo: "tierra", pared: "madera", techo: "madera",
      props: [["heno", 10, 34.5], ["heno", 19.5, 34], ["heno", 10.5, 27], ["carro", 19.5, 28, 0.2], ["barril", 13, 35.3], ["colgado", 15, 30, 0, { figura: "zombi", alto: 6 }], ["lampara_techo", 15, 30, 0, { techo: 6, intensidad: 9, parpadeo: 0.4 }]] },
    { id: "castillo", nombre: "Castillo Salazar · Gran salón", x: 12, z: -22, w: 16, d: 16, alto: 8, suelo: "piedra", pared: "piedra", techo: "madera_oscura",
      props: [["alfombra", 20, -14, 0, { ancho: 3, fondo: 14 }], ["columna", 15, -18, 0, { alto: 8 }], ["columna", 25, -18, 0, { alto: 8 }], ["columna", 15, -10, 0, { alto: 8 }], ["columna", 25, -10, 0, { alto: 8 }],
        ["estatua", 13.2, -21, 0], ["candelabro", 17, -21.4], ["candelabro", 23, -21.4], ["mesa", 26.5, -14, P / 2, { ancho: 1.4, fondo: 0.8 }], ["lampara_techo", 20, -14, 0, { techo: 8, intensidad: 16 }],
        ["cuadro", 20, -21.94, 0, { imagen: "img/escenarios/re4_castillo.webp", ancho: 2.6, alto: 1.6, y: 4 }], ["cuadro", 12.06, -14, P / 2, { imagen: "img/escenarios/re4_biblioteca.webp", ancho: 1.6, alto: 1, y: 2.4 }]] }
  ],

  puertas: [
    { id: "p_casa", x: 8, z: 3, eje: "z", nombre: "Salir" },
    { id: "p_jefe", x: 32, z: 15, eje: "z", nombre: "Casa del jefe" },
    { id: "p_granero", x: 15, z: 24, eje: "x", ancho: 2, alto: 3, llave: "llave_granero", colorLlave: "#8a6a3a", nombre: "Granero" },
    { id: "p_castillo", x: 20, z: -6, eje: "x", tipo: "metal", ancho: 2.4, alto: 3.4, llave: "ojo_mendez", colorLlave: "#c03020", nombre: "Puerta del castillo" }
  ],

  objetos: [
    { id: "doc_mendez", tipo: "documento", doc: "carta_mendez", x: 4.5, z: 1.6, enMesa: true },
    { id: "mapa_pueblo", tipo: "mapa", x: 6, z: 1.2 },
    { id: "mun1", tipo: "objeto", objeto: "municion", cantidad: 12, x: 7.3, z: 0.6 },
    { id: "hv1", tipo: "objeto", objeto: "hierba_verde", x: 30.5, z: -4.5 },
    { id: "mun2", tipo: "objeto", objeto: "municion", cantidad: 10, x: 9, z: 7 },
    { id: "hr1", tipo: "objeto", objeto: "hierba_roja", x: 9.5, z: 9.5 },
    { id: "escopeta", tipo: "arma", arma: "escopeta", x: 30.5, z: 9.5 },
    { id: "cart1", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: 30.8, z: 10.5 },
    { id: "maquina_jefe", tipo: "maquina", x: 33, z: 11, rot: 0 },
    { id: "cinta1", tipo: "objeto", objeto: "cinta", cantidad: 2, x: 34.5, z: 10.8 },
    { id: "doc_luis", tipo: "documento", doc: "nota_luis", x: 38, z: 13, enMesa: true },
    { id: "caja_luis", tipo: "puzzle", puzzle: "re4", nombre: "Caja cerrada con candado de letras", x: 41.2, z: 11,
      acciones: [{ clave: "llave_granero" }, { objetivo: "El granero: ahí tienen a Ashley… o algo peor" }] },
    { id: "hv2", tipo: "objeto", objeto: "hierba_verde", x: 41.2, z: 13.5 },
    { id: "mun3", tipo: "objeto", objeto: "municion", cantidad: 15, x: 21, z: 35.3 },
    { id: "spray1", tipo: "objeto", objeto: "spray", x: 8.8, z: 25 },
    { id: "doc_leyenda", tipo: "documento", doc: "leyenda_castillo", x: 26.5, z: -14, enMesa: true },
    { id: "doc_wesker", tipo: "documento", doc: "correos_wesker", x: 13, z: -7 },
    { id: "cart2", tipo: "objeto", objeto: "cartuchos", cantidad: 6, x: 27, z: -7 },
    { id: "bestias", tipo: "puzzle", puzzle: "re4_leon_castillo", nombre: "Puerta de las tres bestias", x: 20, z: -21.2,
      acciones: [{ texto: "Las tres bestias de piedra rugen a la vez. El muro se desliza y aparece un pasadizo." }, { objetivo: "Baja por el pasadizo hacia el muelle" }] },
    { id: "salida_re4", tipo: "salida", nombre: "Pasadizo hacia el muelle", x: 26.6, z: -21.2, si: "puzzle_re4_leon_castillo", requiere: "puzzle_re4_leon_castillo" }
  ],

  enemigos: [
    { tipo: "ganado", x: 18, z: -2 }, { tipo: "ganado", x: 26, z: 4 },
    { tipo: "ganado", x: 14, z: 15 }, { tipo: "ganado", x: 25, z: 13 },
    { tipo: "monje", x: 16, z: -14 }, { tipo: "monje", x: 24, z: -16 }, { tipo: "monje", x: 20, z: -9 }
  ],

  eventos: [
    { id: "plaza", cuando: "entrar", sala: "plaza", acciones: [
      { cine: { titulo: "Plaza del pueblo", imagen: "img/escenarios/re4_plaza.webp", guion: [
        { sistema: "Una hoguera en el centro de la plaza. Lo que arde, atado a un poste, lleva un uniforme de policía." },
        { de: "leon", t: "Dios…" },
        { de: "ganado", t: "¡Un forastero! ¡Agárrenlo!" },
        { sistema: "Decenas de aldeanos se giran a la vez. Hoces. Horcas. Y el rugido de una motosierra.", efecto: "temblor" }
      ] } },
      { aparecen: [{ tipo: "ganado", x: 12, z: 20 }, { tipo: "ganado", x: 27, z: 19 }, { tipo: "ganado", x: 16, z: 22 }, { id: "salvador", tipo: "motosierra", x: 28, z: 21 }] },
      { objetivo: "Sobrevive a los aldeanos" }] },
    { id: "campana", cuando: "matar", enemigo: "salvador", acciones: [
      { sonido: "campana" }, { texto: "Una campana suena en la iglesia. Los aldeanos que quedan se marchan… rezando." }, { objetivo: "Entra en la casa del jefe" }] },
    { id: "luis", cuando: "entrar", sala: "casa_jefe", acciones: [
      { cine: { titulo: "Casa del jefe", imagen: "img/escenarios/re4_granja.webp", guion: [
        { de: "luis", t: "Vaya, vaya. Un yanqui. ¿Vienes a buscar a la chica rubia, amigo?" },
        { de: "leon", t: "¿Dónde está Ashley?" },
        { de: "luis", t: "Luis Sera. Antiguo investigador. Y ahora tu mejor amigo en este pueblo de locos." },
        { de: "luis", t: "Dejé una nota para quien no fuera uno de ellos. La caja de ahí tiene la llave del granero." }
      ] } },
      { companero: "luis" }, { objetivo: "Abre la caja de Luis: lee su nota con atención" }] },
    { id: "mendez", cuando: "entrar", sala: "granero", acciones: [
      { bloquear: ["p_granero"] },
      { cine: { titulo: "Granero", imagen: "img/escenarios/re4_granja.webp", guion: [
        { sistema: "Las puertas se cierran solas. Un hombre gigantesco, con barba, emerge de la penumbra." },
        { de: "mendez", t: "Ya estás aquí, forastero. Lord Saddler te espera… pero antes, la Plaga." },
        { de: "luis", t: "¡Es Méndez, el jefe! ¡Leon, no dejes que te agarre!" }
      ] } },
      { jefe: { id: "mendez_jefe", tipo: "mendez", x: 15, z: 32 } }, { objetivo: "Mata a Bitores Méndez" }] },
    { id: "mendez_muerto", cuando: "marca", marca: "jefe_re4", acciones: [
      { texto: "Méndez se deshace en el suelo. Entre los restos, su ojo prostético todavía brilla." },
      { clave: "ojo_mendez" }, { desbloquear: ["p_granero"] }, { objetivo: "Usa el ojo de Méndez en la puerta del castillo" }] },
    { id: "castillo", cuando: "entrar", sala: "castillo", acciones: [
      { texto: "Cánticos en latín. Encapuchados. Esto ya no es un pueblo: es una secta." }, { objetivo: "Despierta a las tres bestias de piedra" }] }
  ],

  intro: { titulo: "España · 2004", imagen: "img/escenarios/re4.webp", guion: [
    { sistema: "Seis años después de Raccoon City. Umbrella ha caído. Leon Kennedy trabaja ahora para el presidente de los Estados Unidos." },
    { sistema: "Misión: rescatar a Ashley Graham, secuestrada y vista por última vez en un pueblo perdido de Europa." },
    { de: "hunnigan", t: "Leon, los policías locales han perdido el contacto. Ten cuidado ahí fuera." },
    { de: "leon", t: "Esos aldeanos no son normales, Hunnigan. Intentaron matarme con un hacha." }
  ] },
  final: { titulo: "El muelle", imagen: "img/escenarios/re4_isla.webp", guion: [
    { sistema: "El pasadizo desemboca en un embarcadero. Al otro lado del lago, una isla con un complejo militar." },
    { de: "luis", t: "Ahí la tienen. Saddler la usará para infectar al presidente." },
    { de: "leon", t: "Entonces habrá que ir a buscarla." }
  ] }
};
