/* ============================================================================
 *  ARCHIVO VIII · RESIDENT EVIL VILLAGE (2021) — La aldea
 * ============================================================================
 *  Ethan Winters busca a su hija Rose. Aldea nevada (licántropos) → casa del
 *  Duque → castillo Dimitrescu (la señora del castillo te persigue) → casa
 *  Beneviento (el diario de Donna) → altar de los cuatro señores → la cueva
 *  del Megamiceto: Madre Miranda.
 * ========================================================================== */
const P = Math.PI;

export default {
  id: "re8", juego: "Resident Evil Village", titulo: "La aldea", lugar: "Aldea de Europa del Este", anio: "Febrero de 2021",
  protagonista: "ethan", tema: "tema-re8", temaMusica: "re8", fondo: "img/escenarios/re8_aldea.webp", tiempoPar: 1000,
  variantes: { chris: "chris_re8" },
  inicio: { x: 3, z: 14.5, yaw: -P / 6 },
  objetivo: "Encuentra a Rose",
  ambiente: { cielo: "#14181e", niebla: "#1c2028", densidad: 0.06, ambiente: 0.12, luzCielo: "#6a7890", luzSuelo: "#1a1a20", luna: 0.6, colorLuna: "#8aa0c8" },

  salas: [
    { id: "aldea", nombre: "La aldea", x: 0, z: 0, w: 20, d: 16, exterior: true, suelo: "nieve", pared: "piedra",
      props: [["arbol", 2, 2, 0, { nieve: true }], ["arbol", 17.5, 14, 0, { nieve: true }], ["arbol_seco", 15, 3], ["cruz", 9, 6], ["colgado", 12.5, 8, 0, { figura: "licantropo", alto: 4 }], ["carro", 5, 9, 0.6],
        ["heno", 16, 9], ["valla", 6, 13.5, 0, { largo: 4 }], ["lapida", 2.5, 6], ["lapida", 3.3, 6.4], ["hoguera", 10, 12, 0, {}], ["farola", 18, 2]] },
    { id: "casa_aldea", nombre: "Tienda del Duque", segura: true, x: 20, z: 4, w: 8, d: 8, alto: 3, suelo: "madera", pared: "madera", techo: "madera_oscura",
      props: [["mostrador", 26.5, 8, -P / 2, { ancho: 3 }], ["estanteria", 27.6, 5, -P / 2], ["chimenea", 24, 11.65, P], ["baul", 21, 11.3, P], ["lampara_techo", 24, 8, 0, { intensidad: 5, parpadeo: 0.1 }]] },
    { id: "castillo", nombre: "Castillo Dimitrescu · Gran salón", x: 0, z: -16, w: 20, d: 16, alto: 7, suelo: "moqueta_roja", pared: "papel_rojo", techo: "madera_oscura",
      props: [["columna", 4, -12, 0, { alto: 7, material: "piedra" }], ["columna", 16, -12, 0, { alto: 7, material: "piedra" }], ["columna", 4, -4, 0, { alto: 7, material: "piedra" }], ["columna", 16, -4, 0, { alto: 7, material: "piedra" }],
        ["piano", 17, -14.8, 0], ["mesa_larga", 10, -8, 0, { mantel: "#e8e0d0" }], ["silla", 8.5, -9.1, 0], ["silla", 11.5, -9.1, 0], ["candelabro", 6, -15.4], ["candelabro", 14, -15.4],
        ["lampara_techo", 10, -8, 0, { techo: 7, intensidad: 16, parpadeo: 0.05 }], ["cuadro", 10, -15.94, 0, { imagen: "img/escenarios/re8_castillo.webp", ancho: 3, alto: 2, y: 3.6 }], ["estatua", 1.2, -14.6, 0], ["sangre", 12, -3, 0, { tam: 2 }]] },
    { id: "beneviento", nombre: "Casa Beneviento", x: 20, z: -16, w: 10, d: 10, alto: 3, suelo: "parquet", pared: "papel_verde", techo: "yeso",
      props: [["figura", 28.5, -15, 0, { figura: "angie", alto: 0.8 }], ["figura", 22, -15, 0, { figura: "angie", alto: 0.8, color: "#a09080" }], ["estanteria", 29.6, -10, -P / 2], ["escritorio", 25, -15.4, 0], ["cama", 28.6, -7.6, P / 2],
        ["lampara_techo", 25, -11, 0, { intensidad: 4, parpadeo: 0.4 }], ["papeles", 23, -9]] },
    { id: "altar", nombre: "Altar de los cuatro señores", x: -10, z: -16, w: 10, d: 12, alto: 5, suelo: "piedra", pared: "piedra", techo: "piedra",
      props: [["estatua", -8.6, -5.4, 0, { color: "#6a6058" }], ["candelabro", -8, -15.3], ["candelabro", -2, -15.3], ["cruz", -9.5, -8], ["lampara_techo", -5, -10, 0, { techo: 5, intensidad: 7, color: "#ffb060", parpadeo: 0.3 }]] },
    { id: "cueva", nombre: "Cueva del Megamiceto", x: -10, z: -34, w: 20, d: 18, alto: 7, suelo: "roca", pared: "roca", techo: "roca",
      props: [["escombros", -6, -30], ["escombros", 6, -22], ["arbol_seco", -7, -20], ["arbol_seco", 7, -31], ["hoguera", 0, -25, 0, {}], ["sangre", -2, -28, 0, { tam: 2.6 }]] }
  ],

  puertas: [
    { id: "p_duque", x: 20, z: 8, eje: "z", nombre: "Tienda del Duque" },
    { id: "p_castillo", x: 10, z: 0, eje: "x", tipo: "metal", ancho: 2.4, alto: 3.4, nombre: "Castillo Dimitrescu" },
    { id: "p_beneviento", x: 20, z: -11, eje: "z", nombre: "Pasaje a la casa Beneviento" },
    { id: "p_altar", x: 0, z: -10, eje: "z", tipo: "reja", ancho: 1.6, bloqueada: true, nombre: "Altar" },
    { id: "p_cueva", x: -5, z: -16, eje: "x", tipo: "reja", ancho: 2, alto: 3, bloqueada: true, nombre: "Bajada a la cueva" }
  ],

  documentos: {
    nota_altar: { titulo: "Inscripción del altar", estilo: "informe", texto: "QUIEN BUSQUE A LA MADRE\nDEBERÁ CRUZAR LOS CUATRO DOMINIOS\nEN EL ORDEN EN QUE SE ALZAN DESDE LA ALDEA:\n\nPrimero el castillo de la señora alta, donde el vino es rojo.\nDespués la casa de las muñecas, junto a la cascada.\nLuego el embalse, donde se esconde el pez.\nY por último la fábrica, donde rugen las máquinas.\n\nEl quinto sello no se toca: la Madre no es un dominio. Es el final." }
  },

  objetos: [
    { id: "mun1", tipo: "objeto", objeto: "municion", cantidad: 12, x: 1, z: 15 },
    { id: "hv1", tipo: "objeto", objeto: "hierba_verde", x: 19, z: 1 },
    { id: "duque", tipo: "npc", personaje: "duque", nombre: "El Duque", x: 26.2, z: 6, da: { municion: 20, cartuchos: 6 },
      lineas: ["Ah, el señor Winters. Bienvenido a mi humilde establecimiento.", "Su hija está repartida entre los cuatro señores de la aldea. Un frasco por cada uno.", "La señora del castillo no tolera visitas. Y tiene hijas… muy hambrientas.", "Un regalo de la casa. Volverá usted, estoy seguro."] },
    { id: "maquina_duque", tipo: "maquina", x: 21.2, z: 5, rot: 0 },
    { id: "cinta1", tipo: "objeto", objeto: "cinta", cantidad: 2, x: 23, z: 4.8 },
    { id: "mapa_aldea", tipo: "mapa", x: 26.5, z: 9.2, y: 1.08 },
    { id: "doc_duque", tipo: "documento", doc: "carta_duque", x: 22, z: 8 },
    { id: "escopeta", tipo: "arma", arma: "escopeta", x: 18.6, z: 15 },
    { id: "doc_doncella", tipo: "documento", doc: "diario_doncella", x: 10.8, z: -8, enMesa: true },
    { id: "mun2", tipo: "objeto", objeto: "municion", cantidad: 15, x: 19, z: -1 },
    { id: "hr1", tipo: "objeto", objeto: "hierba_roja", x: 1, z: -1 },
    { id: "doc_donna", tipo: "documento", doc: "diario_donna", x: 25, z: -15.4, enMesa: true },
    { id: "candado_donna", tipo: "puzzle", puzzle: "re8_ethan_donna", nombre: "Cerrojo del sótano de Donna", x: 29.3, z: -13,
      acciones: [{ desbloquear: ["p_altar"] }, { texto: "Algo cae al otro lado de la casa… La reja del altar se ha abierto." }, { objetivo: "Ve al altar de los cuatro señores" }] },
    { id: "cart1", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: 21, z: -6.8 },
    { id: "doc_altar", tipo: "documento", doc: "nota_altar", x: -9.2, z: -11 },
    { id: "altar", tipo: "puzzle", puzzle: "re8", nombre: "Altar de los cuatro frascos", x: -5, z: -13.8,
      acciones: [{ desbloquear: ["p_cueva"] }, { texto: "Los cuatro frascos brillan. La reja del fondo se abre hacia una cueva." }, { objetivo: "Baja a la cueva" }] },
    { id: "spray1", tipo: "objeto", objeto: "spray", x: -9.3, z: -5 },
    { id: "salida_re8", tipo: "salida", nombre: "Salir con Rose", x: 9.2, z: -33.2, si: "jefe_re8", requiere: "jefe_re8" }
  ],

  enemigos: [
    { tipo: "licantropo", x: 12, z: 4 }, { tipo: "licantropo", x: 16, z: 12 }, { tipo: "licantropo", x: 6, z: 3 },
    { tipo: "hija", x: 3, z: -8 }, { tipo: "hija", x: 15, z: -14 },
    { tipo: "moldeado", x: 25, z: -8 },
    { tipo: "licantropo", x: -4, z: -28 }, { tipo: "licantropo", x: 5, z: -20 }
  ],

  eventos: [
    { id: "aldea", cuando: "entrar", sala: "aldea", acciones: [{ sonido: "gritoLejano" }, { texto: "Aullidos. Desde todas partes a la vez." }] },
    { id: "dimitrescu", cuando: "entrar", sala: "castillo", acciones: [
      { cine: { titulo: "Castillo Dimitrescu", imagen: "img/escenarios/re8_castillo.webp", guion: [
        { sistema: "Unos pasos enormes resuenan sobre el mármol. Una mujer de casi tres metros se agacha para cruzar el arco." },
        { de: "dimitrescu", t: "Vaya, vaya. Un hombrecito en mi castillo. ¿Has venido a ver a mis hijas?" },
        { de: "ethan", t: "He venido a por mi hija." },
        { de: "dimitrescu", t: "Qué conmovedor. Tu sangre sabrá dulce." }
      ] } },
      { perseguidor: { id: "dimitrescu_p", tipo: "dimitrescu", x: 10, z: -13.5 } }, { objetivo: "Huye por el pasaje hacia la casa Beneviento" }] },
    { id: "beneviento", cuando: "entrar", sala: "beneviento", acciones: [{ apagon: 6 }, { texto: "Las muñecas te miran. Una de ellas acaba de girar la cabeza." }, { sonido: "llanto" }] },
    { id: "miranda", cuando: "entrar", sala: "cueva", acciones: [
      { quitarPerseguidores: true },
      { cine: { titulo: "La cueva del Megamiceto", imagen: "img/escenarios/re8_embalse.webp", guion: [
        { sistema: "Raíces negras laten en las paredes. En el centro, una mujer con alas de cuervo sostiene un capullo con la forma de un bebé." },
        { de: "miranda", t: "Ethan. Has traído a Rose hasta mí. Gracias." },
        { de: "ethan", t: "Devuélvemela, Miranda." },
        { de: "miranda", t: "Rose renacerá como mi Eva. Y tú, que ya estás muerto, no puedes impedirlo." }
      ] } },
      { jefe: { id: "miranda_final", tipo: "miranda", x: 0, z: -30 } }, { objetivo: "Acaba con Madre Miranda" }] },
    { id: "miranda_muerta", cuando: "marca", marca: "jefe_re8", acciones: [{ texto: "El capullo se abre. Dentro, Rose respira." }, { objetivo: "Sal de la cueva con Rose" }] }
  ],

  intro: { titulo: "Febrero de 2021", imagen: "img/escenarios/re8.webp", guion: [
    { sistema: "Tres años después de Luisiana. Ethan, Mia y su bebé, Rose, viven en paz en Europa." },
    { sistema: "Una noche, Chris Redfield entra en tu casa y dispara a Mia. Se lleva a Rose.", efecto: "sangre" },
    { de: "ethan", t: "¡Chris! ¡¿Por qué?!" },
    { sistema: "Despiertas en la nieve, junto a un camión volcado. A lo lejos, una aldea y un castillo." }
  ] },
  final: { titulo: "Amanecer", imagen: "img/escenarios/re8_aldea.webp", guion: [
    { de: "chris", t: "Ethan. Lo has conseguido. Rose está a salvo." },
    { de: "ethan", t: "Cuídala, Chris. Dile… dile que su padre la quería." },
    { sistema: "El Megamiceto estalla tras vosotros. Rose crecerá sin conocer a Ethan Winters. Pero nunca lo olvidará." }
  ] }
};
