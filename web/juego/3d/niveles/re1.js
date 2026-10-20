/* ============================================================================
 *  ARCHIVO I · RESIDENT EVIL (1996) — La mansión Spencer
 * ============================================================================
 *  Jill Valentine. Vestíbulo → comedor → pasillo del primer zombi → dormitorio
 *  (Llave de la Espada) → galería (escopeta y escudos) → patio de los perros →
 *  caseta (contraseña) → laboratorio subterráneo → celdas (Chris) → Tyrant.
 * ========================================================================== */
const P = Math.PI;

export default {
  id: "re1", juego: "Resident Evil", titulo: "La mansión", lugar: "Montañas Arklay", anio: "24 de julio de 1998",
  protagonista: "jill", tema: "tema-re2", temaMusica: "re2", fondo: "img/escenarios/re2_vestibulo.webp", tiempoPar: 900,
  inicio: { x: 7, z: 10.6, yaw: 0 },
  objetivo: "Explora la mansión y encuentra al equipo Alpha",
  ambiente: { niebla: "#06070b", densidad: 0.07, ambiente: 0.07, luzCielo: "#3a4256", luna: 0.45, colorLuna: "#7a92c8" },
  llaves: { llave_espada: { nombre: "Llave de la Espada", color: "#b8c0d0" } },

  salas: [
    { id: "vestibulo", nombre: "Vestíbulo principal", x: 0, z: 0, w: 14, d: 12, alto: 6, suelo: "baldosa", pared: "papel_rojo", techo: "madera_oscura",
      props: [["alfombra", 7, 6, 0, { ancho: 3, fondo: 9 }], ["columna", 3, 3, 0, { alto: 6 }], ["columna", 11, 3, 0, { alto: 6 }], ["columna", 3, 9, 0, { alto: 6 }], ["columna", 11, 9, 0, { alto: 6 }],
        ["candelabro", 4.4, 0.6], ["candelabro", 9.6, 0.6], ["lampara_techo", 7, 6, 0, { intensidad: 14 }], ["cuadro", 3.5, 11.94, P, { imagen: "img/escenarios/re2_vestibulo.webp", ancho: 2, alto: 1.4, y: 2.6 }],
        ["ventana", 13.94, 9.6, -P / 2, { ancho: 1.4, alto: 2.4 }], ["reloj", 13.4, 1.2, -P / 2], ["sangre", 9, 8, 0, { tam: 1.6 }]] },
    { id: "comedor", nombre: "Comedor", x: -12, z: 0, w: 12, d: 10, alto: 4, suelo: "parquet", pared: "papel_verde", techo: "madera_oscura",
      props: [["mesa_larga", -6, 5, 0], ["silla", -7.5, 3.9, 0], ["silla", -4.5, 3.9, 0], ["silla", -7.5, 6.1, P], ["silla", -4.5, 6.1, P], ["chimenea", -11.65, 5, P / 2],
        ["reloj", -1, 9.4, P], ["lampara_techo", -6, 5, 0, { intensidad: 9 }], ["cuadro", -6, 9.94, P, { imagen: "img/escenarios/re8_castillo.webp", ancho: 1.6, alto: 1.1, y: 1.9 }], ["sangre", -10, 5, 0, { tam: 1.2 }]] },
    { id: "pasillo_oeste", nombre: "Pasillo oeste", x: -12, z: -3, w: 12, d: 3, alto: 3, suelo: "madera", pared: "papel", techo: "yeso",
      props: [["cadaver", -9.2, -1.5, P / 2, { figura: "zombi" }], ["ventana", -4, -2.94, 0, { ancho: 1.2, alto: 1.6 }], ["ventana", -10.5, -2.94, 0, { ancho: 1.2, alto: 1.6 }], ["lampara_techo", -6, -1.5, 0, { intensidad: 6, parpadeo: 0.5 }]] },
    { id: "dormitorio", nombre: "Dormitorio de invitados", x: -12, z: -10, w: 8, d: 7, alto: 3, suelo: "moqueta", pared: "papel", techo: "yeso",
      props: [["cama", -10.6, -8.2, 0], ["armario", -5, -9.5, P], ["escritorio", -5, -6.2, -P / 2], ["lampara_techo", -8, -6.5, 0, { intensidad: 5, parpadeo: 0.3 }], ["sangre", -7, -8.4, 0]] },
    { id: "galeria", nombre: "Galería de arte", x: 0, z: -10, w: 14, d: 10, alto: 4, suelo: "parquet", pared: "papel_rojo", techo: "madera_oscura",
      props: [["estatua", 2, -2.5], ["estatua", 12, -2.5], ["cuadro", 0.06, -5, P / 2, { imagen: "img/escenarios/re4_castillo.webp", ancho: 1.6, alto: 1.1, y: 1.8 }], ["cuadro", 13.94, -5, -P / 2, { imagen: "img/escenarios/re8_beneviento.webp", ancho: 1.6, alto: 1.1, y: 1.8 }],
        ["mesa", 2.6, -7.6, 0, { ancho: 1.4, fondo: 0.8 }], ["lampara_techo", 7, -5, 0, { intensidad: 9 }], ["candelabro", 4.4, -9.4], ["candelabro", 9.6, -9.4], ["alfombra", 7, -5, 0, { ancho: 2.4, fondo: 8 }]] },
    { id: "patio", nombre: "Patio de los perros", x: 0, z: -24, w: 14, d: 14, exterior: true, suelo: "hierba", pared: "piedra",
      props: [["arbol", 2.5, -21], ["arbol", 11.5, -12.5], ["arbol_seco", 2, -13], ["farola", 4, -17], ["farola", 11, -21], ["lapida", 9, -14], ["lapida", 10.5, -14.3], ["valla", 7, -12.2, 0, { largo: 4 }], ["jaula", 12, -17, 0, { figura: "perro" }]] },
    { id: "caseta", nombre: "Caseta del guarda", x: 14, z: -20, w: 6, d: 6, alto: 2.8, suelo: "madera", pared: "madera", techo: "madera_oscura",
      props: [["mesa", 17, -15.3, 0, { ancho: 1.4, fondo: 0.7 }], ["estanteria", 19.6, -18, -P / 2], ["barril", 15, -19.2], ["lampara_techo", 17, -17, 0, { techo: 2.8, intensidad: 5, parpadeo: 0.4 }], ["papeles", 16, -18]] },
    { id: "laboratorio", nombre: "Laboratorio subterráneo", x: 2, z: -36, w: 10, d: 12, alto: 3.4, suelo: "metal", pared: "azulejo", techo: "metal",
      props: [["tanque", 4, -33, 0, { figura: "hunter" }], ["tanque", 4, -29, 0, { figura: "zombi" }], ["estante_lab", 11.6, -26, -P / 2], ["ordenador", 9, -35.5], ["tuberia", 7, -35.8, 0], ["fluorescente", 7, -27], ["fluorescente", 7, -33, 0, { parpadeo: 0.6 }], ["sangre", 8, -30, 0, { tam: 1.8 }]] },
    { id: "celdas", nombre: "Celdas de aislamiento", x: 12, z: -36, w: 6, d: 8, alto: 3, suelo: "hormigon", pared: "hormigon", techo: "hormigon",
      props: [["jaula", 16.5, -34.5, 0], ["fluorescente", 15, -32, 0, { parpadeo: 0.5 }], ["cadaver", 16, -29.5, 0, { figura: "zombi" }]] },
    { id: "sala_tyrant", nombre: "Sala del Tyrant", x: -10, z: -38, w: 12, d: 14, alto: 4.5, suelo: "metal", pared: "metal", techo: "metal",
      props: [["tanque", -4, -36.6, 0, {}], ["tuberia", -9.7, -31, P / 2], ["ordenador", -8, -37.5], ["ordenador", 0, -37.5], ["fluorescente", -4, -31, 0, { techo: 4.5 }], ["fluorescente", -4, -27, 0, { techo: 4.5, parpadeo: 0.7 }]] },
    { id: "sala_segura", nombre: "Sala segura", segura: true, x: 14, z: 2, w: 6, d: 6, alto: 3, suelo: "madera", pared: "papel_verde", techo: "yeso",
      props: [["baul", 19.2, 7.2, P], ["lampara_techo", 17, 5, 0, { intensidad: 5, parpadeo: 0.05 }], ["estanteria", 16, 2.4, 0]] }
  ],

  puertas: [
    { id: "p_comedor", x: 0, z: 4, eje: "z", ancho: 1.6, nombre: "Comedor" },
    { id: "p_pasillo", x: -3, z: 0, eje: "x" },
    { id: "p_dormitorio", x: -8, z: -3, eje: "x" },
    { id: "p_segura", x: 14, z: 5, eje: "z", nombre: "Sala segura" },
    { id: "p_galeria", x: 7, z: 0, eje: "x", ancho: 1.6, llave: "llave_espada", colorLlave: "#b8c0d0", nombre: "Galería" },
    { id: "p_patio", x: 7, z: -10, eje: "x", ancho: 1.6, bloqueada: true, nombre: "Puerta del patio" },
    { id: "p_caseta", x: 14, z: -17, eje: "z" },
    { id: "p_lab", x: 7, z: -24, eje: "x", tipo: "metal", ancho: 1.8, alto: 2.6, bloqueada: true, nombre: "Ascensor del laboratorio" },
    { id: "p_celdas", x: 12, z: -32, eje: "z", tipo: "reja" },
    { id: "p_tyrant", x: 2, z: -30, eje: "z", tipo: "metal", ancho: 1.8, bloqueada: true, nombre: "Compuerta B-3" }
  ],

  documentos: {
    diario_guardian: { titulo: "Diario del guarda", estilo: "diario", texto: "9 de mayo, 1998\nJugamos al póquer con Scott y Alias. Alias ganó, pero fue Scott el que se llevó la bronca por hacer trampas.\n\n10 de mayo\nUn investigador me ha pedido que me ocupe de un monstruo nuevo. Parece un gorila despellejado. Nos dijeron que le diéramos de comer animales vivos.\n\n11 de mayo\nScott me ha despertado a las cinco de la mañana. Llevaba un traje protector. Me ha dado uno para mí. Ha habido un accidente en el laboratorio.\n\n14 de mayo\nTengo una ampolla en la espalda. Me pica muchísimo.\n\n16 de mayo\nHe intentado escapar, pero me han disparado. La ampolla de la espalda está cada vez peor.\n\n19 de mayo\nFiebre. Me pica todo. Tengo hambre y he comido comida para perros.\n\n21 de mayo\nPica. Pica. Scott ha venido. Le he matado. Feo. Sabía bien.\n\n4\nPica.\nRico." },
    nota_escudos: { titulo: "Nota de Lord Spencer", estilo: "carta", texto: "A quien custodie la puerta del jardín:\n\nLos escudos se ofrecen en el orden en que transcurre una noche en Arklay.\n\nPrimero se levanta el VIENTO entre los abetos.\nDespués asoma la LUNA sobre el lago.\nLuego se encienden, una a una, las ESTRELLAS.\nY por último, cuando todo ha terminado, sale el SOL.\n\nQuien altere el orden despertará a los perros.\n\n— O. S." },
    nota_mole: { titulo: "Memorándum del laboratorio", estilo: "informe", texto: "UMBRELLA · INSTALACIÓN ARKLAY · NIVEL B\n\nPor razones de seguridad, la contraseña del ascensor ha cambiado.\n\nLa anterior (JOHN) queda anulada. La nueva contraseña es el nombre en clave del investigador que filtró los datos a la competencia y que seguimos sin encontrar:\n\n             M · O · L · E\n\n(Topo. Muy gracioso, doctor Wesker.)\n\nSi el sistema no responde, informe a seguridad. No baje por la escalera de servicio: el espécimen T-002 no está sedado." }
  },

  objetos: [
    { id: "mapa_mansion", tipo: "mapa", x: -6.8, z: 5, enMesa: true },
    { id: "doc_arklay", tipo: "documento", doc: "informe_arklay", x: -4.7, z: 5.1, enMesa: true },
    { id: "hv1", tipo: "objeto", objeto: "hierba_verde", x: -11.3, z: 9.2 },
    { id: "mun1", tipo: "objeto", objeto: "municion", cantidad: 15, x: 12.8, z: 10.8 },
    { id: "maquina_segura", tipo: "maquina", x: 18.9, z: 3, rot: P },
    { id: "cinta_segura", tipo: "objeto", objeto: "cinta", cantidad: 2, x: 15, z: 7.2 },
    { id: "hv2", tipo: "objeto", objeto: "hierba_verde", x: 15, z: 2.8 },
    { id: "llave_espada", tipo: "llave", llave: "llave_espada", nombre: "Llave de la Espada", color: "#b8c0d0", x: -10.6, z: -8.2, y: 0.62 },
    { id: "doc_guardian", tipo: "documento", doc: "diario_guardian", x: -5, z: -6.2, enMesa: true },
    { id: "mun2", tipo: "objeto", objeto: "municion", cantidad: 10, x: -11.3, z: -3.6 },
    { id: "doc_escudos", tipo: "documento", doc: "nota_escudos", x: 2.6, z: -7.6, enMesa: true },
    { id: "escopeta", tipo: "arma", arma: "escopeta", x: 12, z: -8.6 },
    { id: "cart1", tipo: "objeto", objeto: "cartuchos", cantidad: 6, x: 11, z: -9.3 },
    { id: "escudos", tipo: "puzzle", puzzle: "re1", nombre: "Puerta de los cuatro escudos", x: 7, z: -9.2,
      def: { titulo: "La puerta de los cuatro escudos", ui: "orden", huecos: 4, enunciado: "Cuatro huecos tallados en la puerta del patio. Tienes cinco escudos de bronce: Viento, Luna, Estrella, Sol y Tierra. La nota de Spencer habla de una noche en Arklay.", pista: "Una noche: primero sopla algo entre los árboles, luego asoma algo en el cielo, luego muchas cosas pequeñas brillan... y al final amanece.",
        opciones: [{ id: "SOL", t: "Sol", icono: "☀" }, { id: "LUNA", t: "Luna", icono: "☾" }, { id: "TIERRA", t: "Tierra", icono: "⛰" }, { id: "VIENTO", t: "Viento", icono: "🌬" }, { id: "ESTRELLA", t: "Estrella", icono: "✦" }] },
      acciones: [{ desbloquear: ["p_patio"] }, { objetivo: "Cruza el patio y busca el acceso al laboratorio" }] },
    { id: "hr1", tipo: "objeto", objeto: "hierba_roja", x: 3, z: -22.6 },
    { id: "hv3", tipo: "objeto", objeto: "hierba_verde", x: 12.6, z: -23 },
    { id: "doc_mole", tipo: "documento", doc: "nota_mole", x: 17, z: -15.3, enMesa: true },
    { id: "mun3", tipo: "objeto", objeto: "municion", cantidad: 15, x: 19.2, z: -14.7 },
    { id: "cinta2", tipo: "objeto", objeto: "cinta", x: 15, z: -15 },
    { id: "terminal_lab", tipo: "puzzle", puzzle: "re1_lab", nombre: "Terminal del ascensor", x: 9, z: -23.3,
      def: { titulo: "Terminal del ascensor B", ui: "texto", placeholder: "CONTRASEÑA", enunciado: "Un terminal empotrado en la caseta del ascensor. La pantalla verde parpadea: INTRODUZCA CONTRASEÑA (4 LETRAS). La anterior era «JOHN».", pista: "El memorándum de la caseta del guarda dice el nombre en clave del topo." },
      acciones: [{ desbloquear: ["p_lab"] }, { objetivo: "Baja al laboratorio y encuentra a Chris" }] },
    { id: "spray_lab", tipo: "objeto", objeto: "spray", x: 11.3, z: -35.3 },
    { id: "cart2", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: 3, z: -25 },
    { id: "salida_re1", tipo: "salida", nombre: "Ascensor al helipuerto", x: -9.2, z: -25, si: "jefe_re1", requiere: "jefe_re1", bloqueo: "El ascensor no tiene corriente." }
  ],

  enemigos: [
    { id: "kenneth", tipo: "zombi", x: -9.9, z: -1.4 },
    { tipo: "zombi", x: -7, z: -8.6, dormido: true },
    { tipo: "zombi", x: -2, z: 7.5 },
    { tipo: "zombi", x: 10, z: -3.5 },
    { tipo: "perro", x: 5, z: -20 },
    { tipo: "perro", x: 9, z: -18 },
    { tipo: "hunter", x: 9, z: -31 },
    { tipo: "zombi", x: 15, z: -29.5, dormido: true }
  ],

  eventos: [
    { id: "kenneth", cuando: "entrar", sala: "pasillo_oeste", acciones: [
      { cine: { titulo: "Pasillo oeste", imagen: "img/escenarios/re7_pasillo.webp", guion: [
        { sistema: "Un ruido húmedo. Masticar. Alguien arrodillado al fondo del pasillo." },
        { de: "jill", t: "¿Kenneth…?" },
        { sistema: "La cabeza se gira despacio. Tiene la boca llena de Kenneth.", efecto: "sangre" },
        { de: "jill", t: "Dios mío…" }
      ] } },
      { objetivo: "Sobrevive. Busca una forma de abrir la galería" }] },
    { id: "perros_ventana", cuando: "recoger", objeto: "llave_espada", acciones: [
      { sonido: "cristal" }, { susto: "perro" },
      { aparecen: [{ tipo: "perro", x: -4, z: -1.6 }, { tipo: "perro", x: -10.5, z: -1.6 }] },
      { texto: "¡Las ventanas! ¡Algo ha entrado por las ventanas del pasillo!" }] },
    { id: "trampa_escopeta", cuando: "recoger", objeto: "escopeta", acciones: [
      { sonido: "golpeSordo" }, { apagon: 4 },
      { texto: "Al quitar la escopeta, algo ha hecho clic en la pared…" },
      { aparecen: [{ tipo: "zombi", x: 2, z: -0.8 }, { tipo: "zombi", x: 12, z: -0.8 }] }] },
    { id: "galeria", cuando: "entrar", sala: "galeria", acciones: [{ objetivo: "Descifra la puerta de los cuatro escudos" }] },
    { id: "patio", cuando: "entrar", sala: "patio", acciones: [{ texto: "Aullidos. Más de uno. Y vienen hacia aquí." }, { sonido: "gritoLejano" }] },
    { id: "chris", cuando: "entrar", sala: "celdas", acciones: [
      { cine: { titulo: "Celdas de aislamiento", imagen: "img/escenarios/re5_laboratorio.webp", guion: [
        { de: "chris", t: "¡Jill! ¡Aquí dentro! Wesker me encerró… Dijo que yo sería «un buen sujeto de control»." },
        { de: "jill", t: "Aguanta, Chris. Ya está. Fuera de ahí." },
        { de: "chris", t: "Wesker trabaja para Umbrella. Todo esto ha sido una trampa para los S.T.A.R.S. Está en la sala B-3." },
        { de: "jill", t: "Entonces vamos a hacerle una visita." }
      ] } },
      { companero: "chris" }, { desbloquear: ["p_tyrant"] }, { objetivo: "Encuentra a Wesker en la sala B-3" }] },
    { id: "tyrant", cuando: "entrar", sala: "sala_tyrant", acciones: [
      { bloquear: ["p_tyrant"] },
      { cine: { titulo: "Sala B-3", imagen: "img/escenarios/re5_laboratorio.webp", guion: [
        { de: "wesker", t: "Jill. Chris. Llegáis justo a tiempo para presenciar la obra maestra de Umbrella." },
        { de: "jill", t: "¿Por qué, Wesker? ¡Eran tus hombres!" },
        { de: "wesker", t: "Los S.T.A.R.S. eran un experimento más. Y este es el resultado: el Tyrant. Una forma de vida perfecta." },
        { sistema: "El cristal del tanque estalla. Una garra atraviesa el pecho de Wesker.", efecto: "temblor" },
        { de: "chris", t: "¡Jill, apártate! ¡Dispárale!" }
      ] } },
      { jefe: { id: "tyrant_re1", tipo: "tyrant", x: -4, z: -34 } }, { objetivo: "Destruye al Tyrant" }] },
    { id: "tyrant_muerto", cuando: "marca", marca: "jefe_re1", acciones: [
      { texto: "Se acabó… Está muerto. Ahora, ¡fuera de aquí antes de que se active la autodestrucción!" },
      { desbloquear: ["p_tyrant"] }, { objetivo: "Sube al helipuerto por el ascensor" }] }
  ],

  intro: { titulo: "Bosque de Arklay · 24 de julio de 1998", imagen: "img/escenarios/re8_aldea.webp", guion: [
    { sistema: "El equipo Bravo de los S.T.A.R.S. no responde desde hace horas. El equipo Alpha aterriza en el bosque." },
    { sistema: "Joseph cae bajo los colmillos de unos perros sin piel. Brad despega y os abandona.", efecto: "sangre" },
    { de: "wesker", t: "¡A la mansión! ¡Vamos, vamos!" },
    { sistema: "Cerráis la puerta. Silencio. Un disparo resuena en algún lugar de la mansión." },
    { de: "wesker", t: "Jill, ve a investigar ese disparo. Chris, conmigo." },
    { de: "jill", t: "Entendido, capitán." }
  ] },
  final: { titulo: "Helipuerto", imagen: "img/escenarios/re8_aldea.webp", guion: [
    { sistema: "Las hélices de Brad rompen la niebla. La mansión Spencer arde detrás de vosotros." },
    { de: "chris", t: "Se acabó, Jill." },
    { de: "jill", t: "No, Chris. Esto solo acaba de empezar. Umbrella no se va a quedar quieta." },
    { sistema: "Dos meses después, el virus T llegará a Raccoon City." }
  ] }
};
