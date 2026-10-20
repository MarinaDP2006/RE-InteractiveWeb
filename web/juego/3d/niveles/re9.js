/* ============================================================================
 *  ARCHIVO IX · RESIDENT EVIL REQUIEM (2026) — Hotel Wrenwood
 * ============================================================================
 *  Grace Ashcroft, analista del FBI, vuelve al hotel donde murió su madre.
 *  Recepción (el libro de registro) → pasillo del tercer piso → habitación
 *  307 (los cuadernos de Alyssa) → puerta de servicio 7-0-3 (Leon) → sótano
 *  (los Regeneradores, las notas de Zeno) → laboratorio Elpis: Victor Gideon.
 * ========================================================================== */
const P = Math.PI;

export default {
  id: "re9", juego: "Resident Evil Requiem", titulo: "Requiem", lugar: "Hotel Wrenwood, Medio Oeste", anio: "2026",
  protagonista: "grace", tema: "tema-re9", temaMusica: "re9", fondo: "img/escenarios/re9_hotel.webp", tiempoPar: 1000,
  variantes: { leon: "leon_re9", chris: "chris_re8" },
  inicio: { x: 7, z: 9, yaw: 0 },
  objetivo: "Descubre qué le pasó a tu madre en el Hotel Wrenwood",
  ambiente: { niebla: "#07060a", densidad: 0.075, ambiente: 0.05, luzCielo: "#3a3048", luzSuelo: "#0a0608" },

  salas: [
    { id: "recepcion", nombre: "Recepción del Wrenwood", x: 0, z: 0, w: 14, d: 10, alto: 4, suelo: "moqueta_roja", pared: "papel_rojo", techo: "madera_oscura",
      props: [["mostrador", 10, 3, 0, { ancho: 4 }], ["sofa", 3, 8.8, P], ["sofa", 0.8, 5.5, P / 2], ["columna", 5, 3, 0, { alto: 4, material: "madera_oscura" }], ["columna", 9, 7, 0, { alto: 4, material: "madera_oscura" }],
        ["lampara_techo", 7, 5, 0, { techo: 4, intensidad: 8, parpadeo: 0.35 }], ["reloj", 13.4, 8, -P / 2], ["cuadro", 13.94, 4.5, -P / 2, { imagen: "img/escenarios/re9_hotel.webp", ancho: 1.6, alto: 1, y: 1.9 }], ["escritorio", 11, 0.5, 0], ["sangre", 6, 6, 0]] },
    { id: "pasillo_hotel", nombre: "Pasillo del tercer piso", x: 0, z: -14, w: 4, d: 14, alto: 3, suelo: "moqueta", pared: "papel", techo: "yeso",
      props: [["lampara_techo", 2, -3, 0, { intensidad: 3, parpadeo: 0.6 }], ["lampara_techo", 2, -11, 0, { intensidad: 3, parpadeo: 0.3 }], ["cuadro", 0.06, -5, P / 2, { imagen: "img/escenarios/re9_pasillo.webp", ancho: 0.9, alto: 0.6, y: 1.6 }], ["sangre", 2, -12.5, 0]] },
    { id: "hab306", nombre: "Habitación 306", x: 4, z: -7, w: 8, d: 7, alto: 3, suelo: "moqueta", pared: "papel_verde", techo: "yeso",
      props: [["cama", 9.6, -5, P / 2], ["armario", 11.5, -1, -P / 2], ["escritorio", 6, -6.6, 0], ["ventana", 11.94, -4, -P / 2, { ancho: 1.2, alto: 1.4 }], ["cadaver", 8, -2, 1, { figura: "zombi" }], ["lampara_techo", 8, -3.5, 0, { intensidad: 3, parpadeo: 0.5 }]] },
    { id: "hab307", nombre: "Habitación 307", x: 4, z: -14, w: 8, d: 7, alto: 3, suelo: "moqueta", pared: "papel", techo: "yeso",
      props: [["cama", 9.6, -10.5, P / 2], ["escritorio", 6, -13.6, 0], ["estanteria", 11.6, -13, -P / 2], ["ventana", 11.94, -9, -P / 2, { ancho: 1.2, alto: 1.4 }], ["papeles", 7, -9], ["lampara_techo", 8, -10.5, 0, { intensidad: 3, parpadeo: 0.2 }]] },
    { id: "servicio", nombre: "Zona de servicio", segura: true, x: -8, z: -14, w: 8, d: 10, alto: 3, suelo: "baldosa", pared: "azulejo", techo: "yeso",
      props: [["estanteria", -7.6, -8, P / 2], ["carro", -3, -12, P / 2], ["taquillas", -4, -4.4, P], ["fluorescente", -4, -9, 0, { parpadeo: 0.1 }]] },
    { id: "sotano", nombre: "Sótano del hotel", x: -8, z: -28, w: 14, d: 14, alto: 3.2, suelo: "hormigon", pared: "hormigon", techo: "hormigon",
      props: [["tuberia", -7.7, -21, P / 2], ["barril", -6, -27], ["barril", -5.2, -27.2], ["cajas", 4, -26.5], ["camilla", -1, -24, 0], ["jaula", 3.5, -16.5, 0, { figura: "regenerador" }], ["fluorescente", -1, -18, 0, { techo: 3.2, parpadeo: 0.6 }], ["fluorescente", -1, -25, 0, { techo: 3.2, parpadeo: 0.8 }], ["sangre", -3, -20, 0, { tam: 2 }]] },
    { id: "laboratorio", nombre: "Laboratorio Elpis", x: 6, z: -28, w: 14, d: 14, alto: 5, suelo: "metal", pared: "azulejo", techo: "metal",
      props: [["tanque", 9, -26, 0, { figura: "g_adulto" }], ["tanque", 17, -26, 0, { figura: "regenerador" }], ["estante_lab", 19.6, -20, -P / 2], ["ordenador", 13, -27.5], ["camilla", 13, -17, 0], ["fluorescente", 13, -21, 0, { techo: 5 }], ["fluorescente", 13, -25, 0, { techo: 5, parpadeo: 0.4 }]] }
  ],

  puertas: [
    { id: "p_pasillo", x: 2, z: 0, eje: "x", nombre: "Escaleras al tercer piso" },
    { id: "p_306", x: 4, z: -3.5, eje: "z", nombre: "Habitación 306" },
    { id: "p_307", x: 4, z: -10.5, eje: "z", nombre: "Habitación 307" },
    { id: "p_servicio", x: 0, z: -9, eje: "z", tipo: "metal", bloqueada: true, nombre: "Puerta de servicio" },
    { id: "p_sotano", x: -4, z: -14, eje: "x", tipo: "metal", nombre: "Sótano" },
    { id: "p_lab", x: 6, z: -21, eje: "z", tipo: "metal", ancho: 1.8, alto: 2.6, bloqueada: true, nombre: "Laboratorio Elpis" }
  ],

  objetos: [
    { id: "doc_registro", tipo: "documento", doc: "registro_wrenwood", x: 10, z: 3, y: 1.08 },
    { id: "mun1", tipo: "objeto", objeto: "municion", cantidad: 12, x: 11, z: 0.5, enMesa: true },
    { id: "hv1", tipo: "objeto", objeto: "hierba_verde", x: 0.8, z: 9.2 },
    { id: "doc_alyssa_art", tipo: "documento", doc: "articulo_alyssa", x: 6, z: -6.6, enMesa: true },
    { id: "susto_306", tipo: "examinar", nombre: "Armario entreabierto", texto: "Hay algo dentro…", x: 10.8, z: -1, unaVez: true,
      acciones: [{ susto: "zombi", dano: 12, causa: "Algo dentro del armario" }, { aparecen: [{ tipo: "zombi", x: 10.5, z: -2.2 }] }] },
    { id: "doc_alyssa", tipo: "documento", doc: "diario_alyssa", x: 6, z: -13.6, enMesa: true },
    { id: "hr1", tipo: "objeto", objeto: "hierba_roja", x: 11.3, z: -7.6 },
    { id: "mun2", tipo: "objeto", objeto: "municion", cantidad: 10, x: 4.8, z: -8 },
    { id: "teclado", tipo: "puzzle", puzzle: "re9_grace_hotel", nombre: "Teclado de la puerta de servicio", x: 0.6, z: -7.4,
      acciones: [{ desbloquear: ["p_servicio"] }] },
    { id: "maquina_servicio", tipo: "maquina", x: -6.8, z: -13.2, rot: 0 },
    { id: "cinta1", tipo: "objeto", objeto: "cinta", cantidad: 2, x: -1, z: -13.3 },
    { id: "mapa_hotel", tipo: "mapa", x: -6.8, z: -5 },
    { id: "escopeta", tipo: "arma", arma: "escopeta", x: -1, z: -5 },
    { id: "cart1", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: -7.2, z: -10.5 },
    { id: "doc_gideon", tipo: "documento", doc: "expediente_gideon", x: -1, z: -24, y: 0.9 },
    { id: "doc_zeno", tipo: "documento", doc: "notas_zeno", x: 4.2, z: -27.3 },
    { id: "spray1", tipo: "objeto", objeto: "spray", x: -7.2, z: -15 },
    { id: "puerta_elpis", tipo: "puzzle", puzzle: "re9", nombre: "Terminal del proyecto", x: 5.3, z: -22.5,
      acciones: [{ desbloquear: ["p_lab"] }, { objetivo: "Detén a Victor Gideon" }] },
    { id: "cart2", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: -7.2, z: -18 },
    { id: "salida_re9", tipo: "salida", nombre: "Ascensor de carga", x: 19.2, z: -15, si: "jefe_re9", requiere: "jefe_re9" }
  ],

  enemigos: [
    { tipo: "zombi", x: 2, z: -6 }, { tipo: "zombi", x: 2, z: -12.5, dormido: true },
    { tipo: "zombi", x: 9, z: -12.5, dormido: true },
    { tipo: "regenerador", x: -5, z: -18 }, { tipo: "zombi", x: 2, z: -25 }, { tipo: "regenerador", x: 3, z: -21 },
    { tipo: "licker", x: 16, z: -20 }
  ],

  eventos: [
    { id: "pasillo", cuando: "entrar", sala: "pasillo_hotel", acciones: [{ apagon: 5 }, { sonido: "susurro" }, { texto: "Mamá… ¿estuviste aquí?" }, { objetivo: "Busca la habitación 307" }] },
    { id: "h307", cuando: "entrar", sala: "hab307", acciones: [
      { cine: { titulo: "Habitación 307", imagen: "img/escenarios/re9_hotel.webp", guion: [
        { sistema: "La cama sin deshacer. Una taza de café con una mancha de pintalabios seca. Ocho años sin que nadie toque nada." },
        { de: "grace", t: "Mamá… Aquí escribiste tu último artículo." },
        { de: "alyssa", t: "(grabadora) «Grace, si encuentras esto: no confíes en Gideon. Y no bajes al sótano sola»." },
        { de: "grace", t: "La puerta de servicio. Pedía su número de habitación… al revés." }
      ] } },
      { objetivo: "Abre la puerta de servicio" }] },
    { id: "leon", cuando: "entrar", sala: "servicio", acciones: [
      { cine: { titulo: "Zona de servicio", imagen: "img/escenarios/re9_sotano.webp", guion: [
        { de: "leon", t: "Baja el arma. FBI, ¿no? Yo también he estado en un hotel lleno de cosas que deberían estar muertas." },
        { de: "grace", t: "Leon S. Kennedy. Leí sobre usted. Raccoon City. 1998." },
        { de: "leon", t: "No creas todo lo que lees. Tu madre me entrevistó una vez. Era la mejor." },
        { de: "grace", t: "Entonces ayúdeme a terminar lo que ella empezó." }
      ] } },
      { companero: "leon" }, { objetivo: "Baja al sótano" }] },
    { id: "gideon", cuando: "entrar", sala: "laboratorio", acciones: [
      { bloquear: ["p_lab"] },
      { cine: { titulo: "Laboratorio Elpis", imagen: "img/escenarios/re9_ruinas.webp", guion: [
        { de: "gideon", t: "Grace Ashcroft. Tienes los ojos de tu madre. Ella también llegó hasta aquí." },
        { de: "grace", t: "¿Qué le hiciste?" },
        { de: "gideon", t: "La convertí en historia. Elpis no es una cura, querida. Es una evolución. Mírame." },
        { sistema: "Gideon se clava la jeringuilla en el cuello. Su piel se abre como una flor.", efecto: "sangre" },
        { de: "leon", t: "¡Grace, apártate de él!" }
      ] } },
      { jefe: { id: "gideon_final", tipo: "gideon", x: 13, z: -22 } }, { objetivo: "Acaba con Victor Gideon" }] },
    { id: "gideon_muerto", cuando: "marca", marca: "jefe_re9", acciones: [{ texto: "Se acabó, mamá. Por fin." }, { desbloquear: ["p_lab"] }, { objetivo: "Sube por el ascensor de carga" }] }
  ],

  intro: { titulo: "Hotel Wrenwood · 2026", imagen: "img/escenarios/re9.webp", guion: [
    { sistema: "Ocho años después de la muerte de su madre, la periodista Alyssa Ashcroft, Grace recibe un caso: muertes inexplicables en un hotel abandonado." },
    { de: "grace", t: "El Hotel Wrenwood. Aquí murió ella." },
    { sistema: "La puerta giratoria chirría. Huele a moho, a lirios podridos y a algo más. Algo que respira." }
  ] },
  final: { titulo: "Amanecer en el Medio Oeste", imagen: "img/escenarios/re9_rpd.webp", guion: [
    { sistema: "El ascensor sube. El hotel arde tras vosotros." },
    { de: "leon", t: "Lo has hecho bien, Grace. Tu madre estaría orgullosa." },
    { de: "grace", t: "Esto no ha terminado, ¿verdad?" },
    { de: "leon", t: "Nunca termina. Pero hoy hemos ganado." },
    { sistema: "FIN DE LOS ARCHIVOS UMBRELLA." }
  ] }
};
