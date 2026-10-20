/* ============================================================================
 *  ARCHIVO VI · RESIDENT EVIL 6 (2012-2013) — Edonia
 * ============================================================================
 *  Jake Muller y Sherry Birkin. Calles nevadas de la guerra civil → bar
 *  (sala segura) → plaza (el Ustanak) → puesto de Neo-Umbrella (el apellido
 *  de tu padre) → laboratorio (el detonador de cuatro cables) → la mina.
 * ========================================================================== */
const P = Math.PI;

export default {
  id: "re6", juego: "Resident Evil 6", titulo: "La sangre de Wesker", lugar: "Edonia, Europa del Este", anio: "Diciembre de 2012",
  protagonista: "jake", companero: "sherry", tema: "tema-re6", temaMusica: "re6", fondo: "img/escenarios/re6.webp", tiempoPar: 900,
  variantes: { leon: "leon_re6", chris: "chris_re6", ada: "ada_re6" },
  inicio: { x: 2, z: 6, yaw: -P / 2 },
  objetivo: "Sal de la zona de guerra con Sherry",
  ambiente: { cielo: "#1a1e24", niebla: "#2a2e36", densidad: 0.05, ambiente: 0.18, luzCielo: "#8090a8", luzSuelo: "#2a2a30", luna: 0.9, colorLuna: "#b8c8e0" },

  salas: [
    { id: "calle_nieve", nombre: "Calles de Edonia", x: 0, z: 0, w: 18, d: 12, exterior: true, suelo: "nieve", pared: "ladrillo",
      props: [["coche", 7, 3, 0.4, { ardiendo: true }], ["coche", 13, 9, P / 2], ["arbol", 1.5, 1.5, 0, { nieve: true }], ["arbol", 16.5, 1.5, 0, { nieve: true }], ["escombros", 10, 6], ["farola", 4, 10.5], ["hoguera", 15, 4, 0, {}], ["valla", 5, 0.6, 0, { largo: 4 }], ["cadaver", 9, 10, 1.2, { figura: "majini" }]] },
    { id: "bar", nombre: "Bar abandonado", segura: true, x: 18, z: 2, w: 8, d: 8, alto: 3, suelo: "madera", pared: "papel_verde", techo: "madera_oscura",
      props: [["mostrador", 24.5, 6, -P / 2, { ancho: 4 }], ["mesa", 21, 4, 0, { ancho: 1, fondo: 1 }], ["silla", 21, 4.9, P], ["mesa", 21, 8, 0, { ancho: 1, fondo: 1 }], ["lampara_techo", 21, 6, 0, { intensidad: 5, parpadeo: 0.1 }], ["barril", 25.3, 9.3]] },
    { id: "plaza_nieve", nombre: "Plaza de la estación", x: 0, z: 12, w: 18, d: 14, exterior: true, suelo: "nieve", pared: "hormigon",
      props: [["estatua", 9, 19, 0, { color: "#6a6e72" }], ["coche", 3, 15, -0.3], ["coche", 15, 23, 0.6, { ardiendo: true }], ["escombros", 13, 15], ["escombros", 4, 23], ["farola", 16, 13.5], ["arbol_seco", 1.5, 25], ["contenedor", 16, 19, P / 2]] },
    { id: "edificio", nombre: "Puesto de Neo-Umbrella", x: -10, z: 12, w: 10, d: 10, alto: 3, suelo: "hormigon", pared: "hormigon", techo: "hormigon",
      props: [["escritorio", -8, 14, 0], ["ordenador", -3, 12.5], ["taquillas", -9.6, 18, P / 2], ["cajas", -2, 20.5], ["fluorescente", -5, 17, 0, { parpadeo: 0.5 }], ["papeles", -6, 19]] },
    { id: "laboratorio", nombre: "Laboratorio móvil", x: -10, z: 22, w: 10, d: 10, alto: 3, suelo: "metal", pared: "metal", techo: "metal",
      props: [["estante_lab", -9.6, 27, P / 2], ["camilla", -5, 30.5, P / 2], ["tanque", -2, 30.3, 0, { figura: "ustanak" }], ["ordenador", -8, 31.5], ["fluorescente", -5, 27]] },
    { id: "mina", nombre: "Mina abandonada", x: 0, z: 26, w: 18, d: 14, alto: 6, suelo: "roca", pared: "roca", techo: "roca",
      props: [["carro", 5, 30, P / 2], ["tuberia", 17.7, 33, -P / 2], ["escombros", 13, 29], ["escombros", 6, 37], ["barril", 16.5, 38.5], ["lampara_techo", 9, 31, 0, { techo: 6, intensidad: 9, parpadeo: 0.4 }], ["lampara_techo", 9, 37, 0, { techo: 6, intensidad: 7, parpadeo: 0.5 }]] }
  ],

  puertas: [
    { id: "p_bar", x: 18, z: 6, eje: "z", nombre: "Bar" },
    { id: "p_edificio", x: 0, z: 17, eje: "z", tipo: "metal", nombre: "Puesto de Neo-Umbrella" },
    { id: "p_lab", x: -5, z: 22, eje: "x", tipo: "metal", bloqueada: true, nombre: "Laboratorio" },
    { id: "p_mina", x: 0, z: 29, eje: "z", tipo: "metal", ancho: 1.8, bloqueada: true, nombre: "Ascensor de la mina" }
  ],

  objetos: [
    { id: "mun1", tipo: "objeto", objeto: "municion", cantidad: 15, x: 1, z: 11 },
    { id: "hv1", tipo: "objeto", objeto: "hierba_verde", x: 17, z: 0.8 },
    { id: "maquina_bar", tipo: "maquina", x: 19.2, z: 2.8, rot: 0 },
    { id: "cinta1", tipo: "objeto", objeto: "cinta", cantidad: 2, x: 21, z: 4, enMesa: true },
    { id: "mapa_edonia", tipo: "mapa", x: 21, z: 8, enMesa: true },
    { id: "doc_jake", tipo: "documento", doc: "expediente_jake", x: 24.5, z: 4.8, y: 1.08 },
    { id: "hr1", tipo: "objeto", objeto: "hierba_roja", x: 25, z: 9.3 },
    { id: "escopeta", tipo: "arma", arma: "escopeta", x: 1, z: 13 },
    { id: "cart1", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: 17, z: 25 },
    { id: "doc_artificiero", tipo: "documento", doc: "nota_artificiero", x: -8, z: 14, enMesa: true },
    { id: "doc_edonia", tipo: "documento", doc: "informe_edonia", x: -2, z: 14 },
    { id: "panel", tipo: "puzzle", puzzle: "re6_jake_wesker", nombre: "Panel de identificación", x: -5, z: 21.3,
      acciones: [{ desbloquear: ["p_lab"] }, { texto: "IDENTIDAD CONFIRMADA. Mi padre… Wesker. Genial." }, { objetivo: "Desactiva el detonador del laboratorio" }] },
    { id: "mun2", tipo: "objeto", objeto: "municion", cantidad: 15, x: -9.2, z: 21.2 },
    { id: "detonador", tipo: "puzzle", puzzle: "re6", nombre: "Detonador de Neo-Umbrella", x: -0.7, z: 25,
      acciones: [{ desbloquear: ["p_mina"] }, { texto: "Clic. El temporizador se apaga. Y el ascensor de la mina se pone en marcha." }, { objetivo: "Huye por la mina" }] },
    { id: "spray1", tipo: "objeto", objeto: "spray", x: -9.2, z: 31.2 },
    { id: "cart2", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: 1, z: 39 },
    { id: "salida_re6", tipo: "salida", nombre: "Ascensor de la mina", x: 17.2, z: 26.8, si: "jefe_re6", requiere: "jefe_re6" }
  ],

  enemigos: [
    { tipo: "javo", x: 12, z: 3 }, { tipo: "javo", x: 11, z: 10.5 }, { tipo: "zombi", x: 5, z: 8, dormido: true },
    { tipo: "javo", x: 6, z: 20 }, { tipo: "javo", x: 11, z: 24.5 }, { tipo: "javo", x: -5, z: 15 },
    { tipo: "javo", x: 5, z: 33 }, { tipo: "javo", x: 12, z: 36 }
  ],

  eventos: [
    { id: "ustanak", cuando: "entrar", sala: "plaza_nieve", acciones: [
      { cine: { titulo: "Plaza de la estación", imagen: "img/escenarios/re6.webp", guion: [
        { sistema: "Un helicóptero de Neo-Umbrella deja caer algo en mitad de la plaza. La nieve se levanta.", efecto: "temblor" },
        { de: "sherry", t: "Jake… ¿qué es eso?" },
        { sistema: "Dos metros y medio de músculo. Un brazo mecánico con garras. Ojos fijos en ti." },
        { de: "jake", t: "Me da igual lo que sea. Si sangra, se le puede matar." },
        { de: "sherry", t: "Ese no sangra, Jake. ¡Corre!" }
      ] } },
      { perseguidor: { id: "ustanak_p", tipo: "ustanak", x: 9, z: 23 } }, { objetivo: "Entra en el puesto de Neo-Umbrella" }] },
    { id: "edificio", cuando: "entrar", sala: "edificio", acciones: [{ texto: "Un panel pide «la palabra clave del sujeto». Mi expediente está por aquí…" }] },
    { id: "mina", cuando: "entrar", sala: "mina", acciones: [
      { quitarPerseguidores: true }, { bloquear: ["p_mina"] },
      { cine: { titulo: "Mina abandonada", imagen: "img/escenarios/re6_catacumbas.webp", guion: [
        { sistema: "El techo revienta. El Ustanak cae justo delante del ascensor." },
        { de: "jake", t: "Se acabó correr. Sherry, cúbreme." },
        { de: "sherry", t: "Siempre." }
      ] } },
      { jefe: { id: "ustanak_final", tipo: "ustanak_jefe", x: 12, z: 32 } }, { objetivo: "Acaba con el Ustanak" }] },
    { id: "ustanak_muerto", cuando: "marca", marca: "jefe_re6", acciones: [{ texto: "Cae por el pozo de la mina. Esta vez no se levanta." }, { desbloquear: ["p_mina"] }, { objetivo: "Sube al ascensor" }] }
  ],

  intro: { titulo: "Edonia · Diciembre de 2012", imagen: "img/escenarios/re6.webp", guion: [
    { sistema: "Guerra civil en Edonia. Los rebeldes usan el virus C. Jake Muller, mercenario, solo quiere su paga." },
    { de: "sherry", t: "Jake Muller. Soy Sherry Birkin, agente del Gobierno de Estados Unidos. Tu sangre puede salvar el mundo." },
    { de: "jake", t: "Mi sangre vale cincuenta millones de dólares, princesa. No es nada personal." },
    { de: "sherry", t: "Entonces cóbralos vivo." }
  ] },
  final: { titulo: "Amanecer en la nieve", imagen: "img/escenarios/re6_lanshiang.webp", guion: [
    { sistema: "El ascensor sube hasta la superficie. Amanece sobre Edonia." },
    { de: "jake", t: "Cincuenta millones de dólares… Deja que lo piense. Mejor cincuenta dólares." },
    { de: "sherry", t: "Gracias, Jake." },
    { sistema: "La sangre de Jake permitió crear la vacuna contra el virus C." }
  ] }
};
