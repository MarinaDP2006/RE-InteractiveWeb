/* ============================================================================
 *  ARCHIVO II · RESIDENT EVIL 2 (1998) — Comisaría de Raccoon City
 * ============================================================================
 *  Leon S. Kennedy, primer día de trabajo. Vestíbulo de la diosa → oficina
 *  oeste (mapa) → pasillo del Licker → biblioteca (poema y Llave de Picas) →
 *  archivo (escopeta) → la estatua se abre → Mr. X → garaje (Ada) →
 *  depuradora (tapones de ajedrez) → NEST → William Birkin.
 * ========================================================================== */
const P = Math.PI;

export default {
  id: "re2", juego: "Resident Evil 2", titulo: "Primer día de trabajo", lugar: "Comisaría de Raccoon City", anio: "29 de septiembre de 1998",
  protagonista: "leon", tema: "tema-re2", temaMusica: "re2", fondo: "img/escenarios/re2_vestibulo.webp", tiempoPar: 1100,
  variantes: { leon: "leon_re2" },
  inicio: { x: 8, z: 12.6, yaw: 0 },
  objetivo: "Busca supervivientes en la comisaría",
  ambiente: { niebla: "#05070a", densidad: 0.065, ambiente: 0.07, luzCielo: "#34405a" },
  llaves: { llave_pica: { nombre: "Llave de Picas", color: "#3a6ac8" } },

  salas: [
    { id: "vestibulo", nombre: "Vestíbulo principal", x: 0, z: 0, w: 16, d: 14, alto: 7, suelo: "baldosa", pared: "yeso", techo: "madera_oscura",
      props: [["estatua", 8, 5, 0, { color: "#c8c0b0" }], ["columna", 3, 3, 0, { alto: 7 }], ["columna", 13, 3, 0, { alto: 7 }], ["columna", 3, 11, 0, { alto: 7 }], ["columna", 13, 11, 0, { alto: 7 }],
        ["mostrador", 4.6, 8, P / 2, { ancho: 3 }], ["lampara_techo", 8, 8, 0, { techo: 7, intensidad: 16 }], ["ventana", 15.94, 11, -P / 2, { ancho: 1.6, alto: 3, y: 1.6 }],
        ["escombros", 14.3, 12.6], ["sangre", 6, 10, 0, { tam: 2 }], ["papeles", 4, 12], ["cuadro", 8, 13.94, P, { imagen: "img/escenarios/re2_calle.webp", ancho: 2.4, alto: 1.4, y: 3.4 }]] },
    { id: "oficina_oeste", nombre: "Oficina oeste", x: -10, z: 2, w: 10, d: 10, alto: 3, suelo: "moqueta", pared: "yeso", techo: "yeso",
      props: [["escritorio", -7.5, 4.5, 0], ["escritorio", -3.5, 4.5, 0], ["escritorio", -7.5, 8.5, 0], ["silla", -7.5, 5.4, P], ["silla", -3.5, 5.4, P], ["ordenador", -3.5, 8.6], ["taquillas", -5, 11.65, P],
        ["fluorescente", -5, 5], ["fluorescente", -5, 9, 0, { parpadeo: 0.7 }], ["papeles", -2, 10], ["sangre", -6, 7, 0]] },
    { id: "pasillo_este", nombre: "Pasillo este", x: 16, z: 4, w: 14, d: 3, alto: 3, suelo: "baldosa", pared: "yeso", techo: "yeso",
      props: [["fluorescente", 20, 5.5, 0, { parpadeo: 0.8 }], ["fluorescente", 27, 5.5], ["cadaver", 23, 5.7, P / 2, { figura: "zombi" }], ["sangre", 21, 5, 0, { tam: 1.8 }]] },
    { id: "cuarto_oscuro", nombre: "Cuarto oscuro", segura: true, x: 22, z: -2, w: 6, d: 6, alto: 3, suelo: "baldosa", pared: "papel_verde", techo: "yeso",
      props: [["baul", 27.2, 2.8, -P / 2], ["estanteria", 22.4, 1, P / 2], ["lampara_techo", 25, 1, 0, { intensidad: 4, color: "#ff5040", parpadeo: 0.03 }]] },
    { id: "biblioteca", nombre: "Biblioteca", x: 16, z: 7, w: 10, d: 9, alto: 4, suelo: "parquet", pared: "papel_rojo", techo: "madera_oscura",
      props: [["estanteria", 17, 15.6, P], ["estanteria", 19, 15.6, P], ["estanteria", 21, 15.6, P], ["estanteria", 25.6, 10, -P / 2], ["estanteria", 25.6, 13, -P / 2],
        ["mesa", 20.5, 11.5, 0, { ancho: 1.8, fondo: 1 }], ["silla", 20.5, 12.4, P], ["lampara_techo", 20.5, 11.5, 0, { intensidad: 7 }], ["papeles", 23, 9]] },
    { id: "archivo", nombre: "Sala de archivos", x: 30, z: 1, w: 8, d: 9, alto: 3, suelo: "hormigon", pared: "yeso", techo: "yeso",
      props: [["estanteria", 31, 1.4, 0], ["estanteria", 33, 1.4, 0], ["estanteria", 35, 1.4, 0], ["taquillas", 36.5, 9.6, P], ["mesa", 34, 6, 0, { ancho: 1.4, fondo: 0.8 }], ["fluorescente", 34, 5]] },
    { id: "escalera_sotano", nombre: "Pasadizo de la estatua", x: 5, z: -6, w: 6, d: 6, alto: 3, suelo: "piedra", pared: "piedra", techo: "piedra",
      props: [["candelabro", 6, -5.4], ["sangre", 8, -3, 0]] },
    { id: "garaje", nombre: "Garaje subterráneo", x: -6, z: -22, w: 18, d: 16, alto: 4, suelo: "hormigon", pared: "hormigon", techo: "hormigon",
      props: [["coche", 0, -14, 0], ["coche", 6.5, -17, P / 2], ["contenedor", -3.5, -20, 0], ["barril", 10.5, -8], ["barril", 10.8, -9], ["fluorescente", 2, -10, 0, { techo: 4, parpadeo: 0.6 }], ["fluorescente", 2, -18, 0, { techo: 4 }],
        ["jaula", -4, -8, 0, { figura: "perro" }], ["sangre", 4, -12, 0, { tam: 2 }], ["cadaver", 8, -20, 0, { figura: "zombi" }]] },
    { id: "depuradora", nombre: "Planta depuradora", x: -6, z: -34, w: 18, d: 12, alto: 5, suelo: "metal", pared: "oxido", techo: "metal",
      props: [["tuberia", -5.7, -28, P / 2], ["tuberia", 11.7, -28, -P / 2], ["tanque", -2, -31, 0, {}], ["tanque", 8, -31, 0, {}], ["barril", 0, -24], ["barril", 6, -24], ["fluorescente", 3, -28, 0, { techo: 5, parpadeo: 0.5 }], ["escombros", 9, -25]] },
    { id: "nest_pasillo", nombre: "NEST · Acceso", x: -2, z: -42, w: 10, d: 8, alto: 3.2, suelo: "metal", pared: "azulejo", techo: "metal",
      props: [["estante_lab", -1.6, -38, P / 2], ["ordenador", 6, -41.5], ["fluorescente", 3, -38, 0, { techo: 3.2 }], ["camilla", 6, -37, 0], ["sangre", 2, -39, 0]] },
    { id: "nest_nucleo", nombre: "NEST · Núcleo", x: -8, z: -60, w: 22, d: 18, alto: 6, suelo: "metal", pared: "metal", techo: "metal",
      props: [["tanque", -4, -57, 0, { figura: "g_adulto" }], ["tanque", 10, -57, 0, { figura: "licker" }], ["tuberia", -7.7, -50, P / 2], ["tuberia", 13.7, -50, -P / 2], ["ordenador", 3, -59.4],
        ["fluorescente", 3, -46, 0, { techo: 6 }], ["fluorescente", 3, -54, 0, { techo: 6, parpadeo: 0.6 }], ["escombros", -4, -46], ["sangre", 3, -50, 0, { tam: 2.5 }]] }
  ],

  puertas: [
    { id: "p_oficina", x: 0, z: 6, eje: "z", nombre: "Oficina oeste" },
    { id: "p_pasillo", x: 16, z: 5.5, eje: "z" },
    { id: "p_oscuro", x: 25, z: 4, eje: "x", nombre: "Cuarto oscuro" },
    { id: "p_biblioteca", x: 19, z: 7, eje: "x", nombre: "Biblioteca" },
    { id: "p_archivo", x: 30, z: 5.5, eje: "z", llave: "llave_pica", colorLlave: "#3a6ac8", nombre: "Archivo" },
    { id: "p_sotano", x: 8, z: 0, eje: "x", tipo: "metal", bloqueada: true, nombre: "Pasadizo de la diosa" },
    { id: "p_garaje", x: 8, z: -6, eje: "x", tipo: "metal" },
    { id: "p_depuradora", x: 3, z: -22, eje: "x", tipo: "metal", ancho: 1.6 },
    { id: "p_nest_a", x: 3, z: -34, eje: "x", tipo: "metal", ancho: 1.6, bloqueada: true, nombre: "Compuerta de la depuradora" },
    { id: "p_nest_b", x: 3, z: -42, eje: "x", tipo: "metal", ancho: 2, alto: 2.8, bloqueada: true, nombre: "Núcleo de NEST" }
  ],

  documentos: {
    nota_nest: { titulo: "Pósit en el terminal", estilo: "nota", texto: "Annette:\n\nHe cambiado la clave del núcleo. Ya sabes que no me fío de la U.S.S.\n\nEs el nombre de nuestra hija… escrito como se ve en un espejo: de la última letra a la primera.\n\nNo se lo digas a nadie. Ni siquiera a ella.\n\n— W." }
  },

  objetos: [
    { id: "estatua", tipo: "puzzle", puzzle: "re2", nombre: "Estatua de la diosa", x: 8, z: 6.3,
      acciones: [{ desbloquear: ["p_sotano"] }, { objetivo: "Baja por el pasadizo de la estatua" }] },
    { id: "hv1", tipo: "objeto", objeto: "hierba_verde", x: 1, z: 1 },
    { id: "mun1", tipo: "objeto", objeto: "municion", cantidad: 12, x: 4.6, z: 9.6, enMesa: true, y: 1.08 },
    { id: "mapa_rpd", tipo: "mapa", x: -3.5, z: 4.5, enMesa: true },
    { id: "doc_guardia", tipo: "documento", doc: "diario_guardia", x: -7.5, z: 8.5, enMesa: true },
    { id: "mun2", tipo: "objeto", objeto: "municion", cantidad: 10, x: -9.2, z: 2.8 },
    { id: "maquina_rpd", tipo: "maquina", x: 23, z: -1.4, rot: 0 },
    { id: "cinta1", tipo: "objeto", objeto: "cinta", cantidad: 2, x: 27, z: -1.3 },
    { id: "hv2", tipo: "objeto", objeto: "hierba_verde", x: 22.8, z: 3.2 },
    { id: "hr1", tipo: "objeto", objeto: "hierba_roja", x: 24, z: 3.3 },
    { id: "doc_poema", tipo: "documento", doc: "poema_diosa", x: 20.2, z: 11.4, enMesa: true },
    { id: "llave_pica", tipo: "llave", llave: "llave_pica", nombre: "Llave de Picas", color: "#3a6ac8", x: 24.6, z: 15.2 },
    { id: "escopeta", tipo: "arma", arma: "escopeta", x: 34, z: 6, enMesa: true },
    { id: "cart1", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: 31, z: 9.2 },
    { id: "doc_periodico", tipo: "documento", doc: "periodico_raccoon", x: 36.8, z: 4 },
    { id: "doc_ben", tipo: "documento", doc: "notas_ben", x: -4.5, z: -12 },
    { id: "doc_depuradora", tipo: "documento", doc: "nota_depuradora", x: 10.6, z: -12.5 },
    { id: "mun3", tipo: "objeto", objeto: "municion", cantidad: 15, x: -5, z: -16 },
    { id: "spray1", tipo: "objeto", objeto: "spray", x: 11, z: -21.2 },
    { id: "ajedrez", tipo: "puzzle", puzzle: "re2_leon_ajedrez", nombre: "Panel de los tapones de ajedrez", x: 3, z: -33.2,
      acciones: [{ desbloquear: ["p_nest_a"] }, { objetivo: "Entra en NEST, el laboratorio de Umbrella" }] },
    { id: "cart2", tipo: "objeto", objeto: "cartuchos", cantidad: 6, x: -5.2, z: -33 },
    { id: "doc_birkin", tipo: "documento", doc: "diario_birkin", x: 6, z: -37, enMesa: true },
    { id: "doc_nest", tipo: "documento", doc: "nota_nest", x: 6.4, z: -41.2 },
    { id: "terminal_nest", tipo: "puzzle", puzzle: "re2_leon_nest", nombre: "Terminal del núcleo", x: 3, z: -41.3,
      acciones: [{ desbloquear: ["p_nest_b"] }, { objetivo: "Encuentra a William Birkin" }] },
    { id: "hv3", tipo: "objeto", objeto: "hierba_verde", x: -1.3, z: -41.3 },
    { id: "salida_re2", tipo: "salida", nombre: "Tren de emergencia", x: 13, z: -59, si: "jefe_re2", requiere: "jefe_re2", bloqueo: "El tren no arranca." }
  ],

  enemigos: [
    { tipo: "zombi", x: -7, z: 10.5, dormido: true },
    { tipo: "zombi", x: -2.5, z: 7 },
    { tipo: "zombi", x: 12, z: 1.5 },
    { tipo: "zombi", x: 24.5, z: 13.5, dormido: true },
    { tipo: "zombi", x: 36, z: 8 },
    { tipo: "perro", x: 0, z: -9 },
    { tipo: "perro", x: 8, z: -11 },
    { tipo: "zombi", x: 9, z: -19.5 },
    { tipo: "zombi", x: -3, z: -27 },
    { tipo: "licker", x: 9, z: -28 }
  ],

  eventos: [
    { id: "licker", cuando: "entrar", sala: "pasillo_este", acciones: [
      { sonido: "gemido" }, { texto: "Algo gotea del techo… y no es agua." },
      { aparecen: [{ tipo: "licker", x: 28.5, z: 5.5 }] }] },
    { id: "biblioteca", cuando: "entrar", sala: "biblioteca", acciones: [{ objetivo: "Descifra la inscripción de la diosa" }] },
    { id: "mr_x", cuando: "marca", marca: "puzzle_re2", acciones: [
      { cine: { titulo: "Vestíbulo principal", guion: [
        { sistema: "Un rugido de rotores sobre el tejado. El helicóptero de Umbrella suelta algo enorme. El suelo tiembla.", efecto: "temblor" },
        { de: "leon", t: "¿Qué demonios ha sido eso…?" },
        { sistema: "Pasos. Pesados. Lentos. Acercándose por el pasillo este." }
      ] } },
      { perseguidor: { id: "mr_x", tipo: "mrx", x: 28.5, z: 5.5 } }, { objetivo: "Huye de Mr. X por el pasadizo de la estatua" }] },
    { id: "ada", cuando: "entrar", sala: "garaje", acciones: [
      { cine: { titulo: "Garaje subterráneo", imagen: "img/escenarios/re2_cloacas.webp", guion: [
        { de: "ada", t: "Baja el arma, novato. Si quisiera matarte, ya estarías muerto." },
        { de: "leon", t: "¿Quién eres?" },
        { de: "ada", t: "Ada Wong. FBI. Busco a Ben Bertolucci… y a un científico llamado William Birkin." },
        { de: "leon", t: "Entonces vamos juntos. Nadie debería estar solo esta noche." },
        { de: "ada", t: "Qué caballeroso. Intenta no morirte." }
      ] } },
      { companero: "ada" }, { objetivo: "Cruza la depuradora hacia NEST" }] },
    { id: "g", cuando: "entrar", sala: "nest_nucleo", acciones: [
      { bloquear: ["p_nest_b"] }, { quitarPerseguidores: true },
      { cine: { titulo: "NEST · Núcleo", imagen: "img/escenarios/re2_nest.webp", guion: [
        { sistema: "Algo respira detrás de los tanques. Un ojo enorme se abre en un hombro que no es humano." },
        { de: "birkin", t: "Sherry… ¿dónde está… Sherry…?" },
        { de: "ada", t: "Es Birkin. Se ha inyectado el virus G." },
        { de: "leon", t: "Ya no queda nada de él. ¡Dispara!" }
      ] } },
      { jefe: { id: "g_birkin", tipo: "g_birkin", x: 3, z: -56 } }, { objetivo: "Sobrevive a William Birkin" }] },
    { id: "g_muerto", cuando: "marca", marca: "jefe_re2", acciones: [
      { texto: "Cae. Por ahora. El tren de emergencia está al fondo." }, { desbloquear: ["p_nest_b"] }, { objetivo: "Llega al tren de emergencia" }] }
  ],

  intro: { titulo: "Raccoon City · 29 de septiembre de 1998", imagen: "img/escenarios/re2_calle.webp", guion: [
    { sistema: "Tu primer día como agente de la R.P.D. Llegas tarde. La ciudad está en llamas." },
    { de: "leon", t: "Esto no puede estar pasando…" },
    { sistema: "Un camión arrolla la gasolinera. Las llamas te separan de una chica en moto: Claire Redfield.", efecto: "temblor" },
    { sistema: "Corres hacia la comisaría. Por radio, el teniente Marvin Branagh: «Busca supervivientes. Y sal de aquí, chaval»." },
    { de: "leon", t: "La comisaría. Alguien tiene que seguir vivo ahí dentro." }
  ] },
  final: { titulo: "Tren de emergencia", imagen: "img/escenarios/re2_nest.webp", guion: [
    { sistema: "El tren arranca mientras NEST se autodestruye. Ada no ha llegado a subir." },
    { de: "leon", t: "Ada… Lo siento." },
    { sistema: "Al amanecer, un misil borrará Raccoon City del mapa. Pero antes, otra superviviente intentará escapar." }
  ] }
};
