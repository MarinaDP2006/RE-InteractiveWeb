/* ============================================================================
 *  ARCHIVO V · RESIDENT EVIL 5 (2009) — Kijuju
 * ============================================================================
 *  Chris Redfield y Sheva Alomar (B.S.A.A.). Mercado de Kijuju → refugio
 *  (Josh) → casa de Irving (albarán y llave del muelle) → muelle (contenedor
 *  4-7-2-1) → laboratorio de Tricell (proyecto Uroboros) → hangar: Wesker.
 * ========================================================================== */
const P = Math.PI;

export default {
  id: "re5", juego: "Resident Evil 5", titulo: "Bajo el sol de Kijuju", lugar: "Kijuju, África occidental", anio: "Marzo de 2009",
  protagonista: "chris", companero: "sheva", tema: "tema-re5", temaMusica: "re5", fondo: "img/escenarios/re5_kijuju.webp", tiempoPar: 1000,
  variantes: { jill: "jill_re5" },
  inicio: { x: 3, z: 12, yaw: -P / 4 },
  objetivo: "Encuentra a Ricardo Irving antes de que venda el arma biológica",
  ambiente: { cielo: "#c89a62", niebla: "#a07a50", densidad: 0.03, ambiente: 0.6, luzCielo: "#e8c898", luzSuelo: "#5a3818", luna: 2.6, colorLuna: "#ffe2b0" },
  llaves: { llave_muelle: { nombre: "Llave del muelle", color: "#3a8ac8" } },

  salas: [
    { id: "mercado", nombre: "Mercado de Kijuju", x: 0, z: 0, w: 20, d: 14, exterior: true, suelo: "tierra", pared: "ladrillo",
      props: [["carro", 5, 4, 0.4], ["cajas", 14, 3], ["cajas", 2, 7], ["barril", 17.5, 11], ["barril", 18, 12], ["mesa", 10, 7, 0, { ancho: 2, fondo: 1, mantel: "#a0602a" }], ["mesa", 14, 9.5, 0, { ancho: 2, fondo: 1, mantel: "#6a8a3a" }],
        ["arbol_seco", 1.5, 1.5], ["coche", 9, 1.8, P / 2], ["sangre", 11, 11, 0, { tam: 2 }], ["cadaver", 7, 10, 2, { figura: "majini" }]] },
    { id: "refugio", nombre: "Refugio de la B.S.A.A.", segura: true, x: 20, z: 2, w: 8, d: 8, alto: 3, suelo: "hormigon", pared: "yeso", techo: "yeso",
      props: [["mesa", 25, 6, 0, { ancho: 1.6, fondo: 0.8 }], ["cajas", 27, 3], ["estanteria", 27.6, 8, -P / 2], ["ordenador", 22.4, 2.4], ["lampara_techo", 24, 6, 0, { intensidad: 5, parpadeo: 0.05 }]] },
    { id: "calle_puerto", nombre: "Calle del puerto", x: 0, z: 14, w: 20, d: 10, exterior: true, suelo: "tierra", pared: "ladrillo",
      props: [["coche", 14, 19, 0.3, { ardiendo: true }], ["cajas", 4, 22], ["barril", 18.5, 15.5], ["escombros", 8, 18], ["farola", 2, 15.5], ["farola", 18, 22.5], ["sangre", 10, 20, 0, { tam: 2 }]] },
    { id: "casa_irving", nombre: "Escondite de Irving", x: -8, z: 14, w: 8, d: 10, alto: 2.8, suelo: "madera", pared: "yeso", techo: "madera",
      props: [["escritorio", -6, 22.5, P], ["cama", -6.6, 15.5, 0], ["estanteria", -0.4, 22, -P / 2], ["cajas", -2, 15], ["papeles", -4, 19], ["lampara_techo", -4, 19, 0, { techo: 2.8, intensidad: 5, parpadeo: 0.3 }]] },
    { id: "muelle", nombre: "Muelle de Tricell", x: 0, z: 24, w: 20, d: 12, exterior: true, cerradaA: ["calle_puerto"], suelo: "hormigon", pared: "oxido",
      props: [["contenedor", 4, 29, 0, { color: "#8a3a1a" }], ["contenedor", 4, 33.5, 0, { color: "#2a5a8a" }], ["contenedor", 15, 33.5, 0, { color: "#3a6a2a" }], ["barril", 10, 34.5], ["barril", 10.8, 34.6], ["cajas", 15, 27], ["farola", 9, 30]] },
    { id: "laboratorio", nombre: "Laboratorio de Tricell", x: 20, z: 24, w: 12, d: 12, alto: 3.4, suelo: "metal", pared: "azulejo", techo: "metal",
      props: [["tanque", 22, 34.5, 0, { figura: "majini" }], ["tanque", 30, 34.5, 0, { figura: "g_adulto" }], ["estante_lab", 31.6, 30, -P / 2], ["ordenador", 31.5, 26, -P / 2], ["camilla", 28, 30, 0], ["fluorescente", 26, 27, 0, { techo: 3.4 }], ["fluorescente", 26, 33, 0, { techo: 3.4, parpadeo: 0.5 }]] },
    { id: "nave", nombre: "Hangar del bombardero", x: 20, z: 36, w: 14, d: 14, alto: 7, suelo: "metal", pared: "metal", techo: "metal",
      props: [["contenedor", 23.5, 48, 0], ["cajas", 31, 39], ["barril", 32.5, 47], ["tuberia", 33.7, 43, -P / 2], ["fluorescente", 27, 40, 0, { techo: 7 }], ["fluorescente", 27, 46, 0, { techo: 7, parpadeo: 0.4 }]] }
  ],

  puertas: [
    { id: "p_refugio", x: 20, z: 6, eje: "z", tipo: "metal", nombre: "Refugio" },
    { id: "p_irving", x: 0, z: 19, eje: "z", nombre: "Escondite de Irving" },
    { id: "p_muelle", x: 10, z: 24, eje: "x", tipo: "reja", ancho: 2.4, llave: "llave_muelle", colorLlave: "#3a8ac8", nombre: "Verja del muelle" },
    { id: "p_lab", x: 20, z: 30, eje: "z", tipo: "metal", ancho: 1.6, bloqueada: true, nombre: "Laboratorio de Tricell" },
    { id: "p_nave", x: 26, z: 36, eje: "x", tipo: "metal", ancho: 2.4, alto: 3, bloqueada: true, nombre: "Hangar" }
  ],

  objetos: [
    { id: "mun1", tipo: "objeto", objeto: "municion", cantidad: 15, x: 10, z: 7, enMesa: true },
    { id: "hv1", tipo: "objeto", objeto: "hierba_verde", x: 1, z: 12.8 },
    { id: "josh", tipo: "npc", personaje: "josh", nombre: "Josh Stone", x: 22, z: 8.6, da: { municion: 20, hierba_verde: 1 },
      lineas: ["Chris, Sheva. Me alegro de veros con vida.", "Irving se esconde en una casa junto al puerto. Ha dejado huellas por todas partes.", "Los Majini no son zombis: piensan, se organizan… y usan armas.", "Coged esto. Lo vais a necesitar."] },
    { id: "maquina_refugio", tipo: "maquina", x: 25, z: 2.8, rot: 0 },
    { id: "cinta1", tipo: "objeto", objeto: "cinta", cantidad: 2, x: 25, z: 6, enMesa: true },
    { id: "mapa_kijuju", tipo: "mapa", x: 27, z: 5 },
    { id: "doc_fisher", tipo: "documento", doc: "diario_fisher", x: 4, z: 21.2 },
    { id: "escopeta", tipo: "arma", arma: "escopeta", x: 18.6, z: 21 },
    { id: "cart1", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: 1, z: 23 },
    { id: "doc_irving", tipo: "documento", doc: "recibo_irving", x: -6, z: 22.5, enMesa: true },
    { id: "llave_muelle", tipo: "llave", llave: "llave_muelle", nombre: "Llave del muelle", color: "#3a8ac8", x: -2, z: 17.5 },
    { id: "hr1", tipo: "objeto", objeto: "hierba_roja", x: -7.4, z: 18.5 },
    { id: "contenedor", tipo: "puzzle", puzzle: "re5_chris_muelle", nombre: "Cerradura del contenedor de Irving", x: 18.8, z: 29.5,
      acciones: [{ texto: "El contenedor se abre: dentro hay una tarjeta del laboratorio… y un cadáver con bata de Tricell." }, { desbloquear: ["p_lab"] }, { objetivo: "Entra en el laboratorio de Tricell" }] },
    { id: "mun2", tipo: "objeto", objeto: "municion", cantidad: 15, x: 1, z: 35 },
    { id: "spray1", tipo: "objeto", objeto: "spray", x: 18.8, z: 35 },
    { id: "doc_excella", tipo: "documento", doc: "email_excella", x: 28, z: 30, y: 0.9 },
    { id: "doc_p30", tipo: "documento", doc: "informe_p30", x: 21, z: 25 },
    { id: "consola", tipo: "puzzle", puzzle: "re5", nombre: "Consola del proyecto", x: 31, z: 27.3,
      acciones: [{ desbloquear: ["p_nave"] }, { objetivo: "Detén a Wesker en el hangar" }] },
    { id: "cart2", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: 21, z: 35.2 },
    { id: "salida_re5", tipo: "salida", nombre: "Helicóptero de la B.S.A.A.", x: 29, z: 49.2, si: "jefe_re5", requiere: "jefe_re5" }
  ],

  enemigos: [
    { tipo: "majini", x: 15, z: 5 }, { tipo: "majini", x: 6, z: 2 }, { tipo: "majini", x: 17, z: 9 },
    { tipo: "majini", x: 6, z: 19 }, { tipo: "majini", x: 12, z: 22 }, { tipo: "criatura", x: 16, z: 16 },
    { tipo: "majini", x: 8, z: 31 }, { tipo: "majini", x: 13, z: 28 }, { tipo: "majini", x: 2, z: 26.5 },
    { tipo: "criatura", x: 24, z: 29 }
  ],

  eventos: [
    { id: "mercado", cuando: "entrar", sala: "mercado", acciones: [{ sonido: "gritoLejano" }] },
    { id: "puerto", cuando: "entrar", sala: "calle_puerto", acciones: [
      { texto: "Han rodeado la calle. Ojos rojos tras cada ventana." },
      { aparecen: [{ tipo: "majini", x: 3.5, z: 17.5 }, { tipo: "majini", x: 16.5, z: 22 }] }] },
    { id: "muelle", cuando: "entrar", sala: "muelle", acciones: [{ objetivo: "Abre el contenedor de Irving (lee el albarán)" }] },
    { id: "wesker", cuando: "entrar", sala: "nave", acciones: [
      { bloquear: ["p_nave"] },
      { cine: { titulo: "Hangar del bombardero", imagen: "img/escenarios/re5_barco.webp", guion: [
        { de: "wesker", t: "Chris. Siempre llegas tarde a todas partes." },
        { de: "chris", t: "Wesker. ¿Dónde está Jill?" },
        { de: "wesker", t: "Jill se sacrificó por ti. Ahora es mía. Igual que el mundo, dentro de unas horas." },
        { de: "sheva", t: "Chris, el bombardero lleva misiles con Uroboros. ¡Si despega, se acabó!" },
        { de: "wesker", t: "Siete minutos. Es todo lo que puedo dedicaros." }
      ] } },
      { jefe: { id: "wesker_re5", tipo: "wesker", x: 27, z: 41 } }, { objetivo: "Derrota a Albert Wesker" }] },
    { id: "wesker_muerto", cuando: "marca", marca: "jefe_re5", acciones: [{ texto: "Wesker se tambalea, se arranca las gafas… y huye entre las llamas." }, { objetivo: "Sube al helicóptero" }] }
  ],

  intro: { titulo: "Kijuju · Marzo de 2009", imagen: "img/escenarios/re5_kijuju.webp", guion: [
    { sistema: "Diez años después de la caída de Umbrella, sus armas se venden en el mercado negro." },
    { de: "sheva", t: "Sheva Alomar, B.S.A.A. de África occidental. Seré tu compañera." },
    { de: "chris", t: "Chris Redfield. Bienvenida al infierno, Sheva." },
    { sistema: "En el mercado, los lugareños os miran en silencio. Alguien arrastra un saco que se mueve." }
  ] },
  final: { titulo: "Atardecer", imagen: "img/escenarios/re5_campos.webp", guion: [
    { sistema: "El helicóptero se eleva sobre los campos. El bombardero arde en el hangar." },
    { de: "sheva", t: "¿Y ahora qué, Chris?" },
    { de: "chris", t: "Ahora encontramos a Jill. Y acabamos con él de una vez." }
  ] }
};
