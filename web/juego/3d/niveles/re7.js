/* ============================================================================
 *  ARCHIVO VII · RESIDENT EVIL 7 (2017) — La casa de los Baker
 * ============================================================================
 *  Ethan Winters busca a su mujer, Mia. Recibidor → comedor (la cena de la
 *  familia) → pasillo (Jack Baker te persigue) → dormitorio de Lucas (la
 *  combinación de cumpleaños) → sótano (Mia, los nidos de Marguerite) →
 *  garaje: Jack, motosierra en mano.
 * ========================================================================== */
const P = Math.PI;

export default {
  id: "re7", juego: "Resident Evil 7", titulo: "Bienvenido a la familia", lugar: "Dulvey, Luisiana", anio: "Julio de 2017",
  protagonista: "ethan", tema: "tema-re7", temaMusica: "re7", fondo: "img/escenarios/re7_comedor.webp", tiempoPar: 900,
  variantes: { chris: "chris_re7" },
  inicio: { x: 5, z: 7, yaw: 0 },
  objetivo: "Encuentra a Mia",
  ambiente: { niebla: "#0b0a06", densidad: 0.08, ambiente: 0.05, luzCielo: "#3a3a28", luzSuelo: "#0a0804" },
  llaves: { llave_serpiente: { nombre: "Llave de la Serpiente", color: "#6a8a3a" } },

  salas: [
    { id: "recibidor", nombre: "Recibidor", x: 0, z: 0, w: 10, d: 8, alto: 3, suelo: "madera", pared: "papel", techo: "madera_oscura",
      props: [["sofa", 2, 7.3, P], ["armario", 9.4, 7.4, -P / 2], ["reloj", 0.4, 2, P / 2], ["cuadro", 5, 7.94, P, { imagen: "img/escenarios/re7_casa_vieja.webp", ancho: 1.2, alto: 0.8, y: 1.6 }], ["lampara_techo", 5, 4, 0, { intensidad: 4, parpadeo: 0.5 }], ["sangre", 7, 3, 0], ["papeles", 3, 4]] },
    { id: "comedor", nombre: "Comedor", x: 0, z: -10, w: 10, d: 10, alto: 3, suelo: "madera", pared: "papel_verde", techo: "madera_oscura",
      props: [["mesa_larga", 5, -5, 0, { mantel: "#7a6a5a" }], ["silla", 3.5, -6.1, 0], ["silla", 6.5, -6.1, 0], ["silla", 3.5, -3.9, P], ["silla", 6.5, -3.9, P], 
        ["chimenea", 5, -9.65, 0], ["lampara_techo", 5, -5, 0, { intensidad: 6, parpadeo: 0.25 }], ["sangre", 2, -8, 0, { tam: 1.6 }], ["cadaver", 1.5, -2, 0.3, { figura: "moldeado" }]] },
    { id: "pasillo", nombre: "Pasillo principal", x: 10, z: -10, w: 4, d: 18, alto: 3, suelo: "madera", pared: "papel", techo: "madera_oscura",
      props: [["lampara_techo", 12, -6, 0, { intensidad: 4, parpadeo: 0.6 }], ["lampara_techo", 12, 3, 0, { intensidad: 3, parpadeo: 0.4 }], ["cuadro", 13.94, -9, -P / 2, { imagen: "img/escenarios/re7_pasillo.webp", ancho: 0.9, alto: 0.6, y: 1.6 }], ["sangre", 12, -1, 0]] },
    { id: "sala_segura", nombre: "Habitación del reloj", segura: true, x: 14, z: -2, w: 6, d: 6, alto: 3, suelo: "madera", pared: "papel", techo: "yeso",
      props: [["baul", 19.2, 3.2, P], ["estanteria", 19.6, -0.5, -P / 2], ["lampara_techo", 17, 1, 0, { intensidad: 5, parpadeo: 0.05 }]] },
    { id: "dormitorio", nombre: "Dormitorio de Lucas", x: 14, z: 4, w: 6, d: 6, alto: 3, suelo: "moqueta", pared: "papel_rojo", techo: "yeso",
      props: [["cama", 18.8, 8.2, 0], ["escritorio", 15.4, 9.4, P], ["estanteria", 19.6, 5, -P / 2], ["papeles", 17, 6], ["lampara_techo", 17, 7, 0, { intensidad: 3, parpadeo: 0.5 }]] },
    { id: "sotano", nombre: "Sótano", x: 14, z: -12, w: 10, d: 10, alto: 2.8, suelo: "barro", pared: "hormigon", techo: "hormigon",
      props: [["camilla", 21, -10.5, 0], ["jaula", 22.6, -4, 0], ["barril", 15, -11.3], ["barril", 15.8, -11.4], ["tuberia", 23.7, -11, -P / 2], ["colgado", 18, -5, 0, { figura: "zombi", alto: 2.8 }], ["fluorescente", 19, -7, 0, { techo: 2.8, parpadeo: 0.7 }], ["sangre", 18, -9, 0, { tam: 2 }]] },
    { id: "garaje", nombre: "Garaje", x: 24, z: -12, w: 12, d: 12, alto: 4, suelo: "hormigon", pared: "madera", techo: "madera",
      props: [["coche", 30, -6, P / 2], ["estanteria", 35.6, -10, -P / 2], ["barril", 25, -1.6], ["cajas", 34, -1.6], ["lampara_techo", 30, -6, 0, { techo: 4, intensidad: 8, parpadeo: 0.3 }]] }
  ],

  puertas: [
    { id: "p_comedor", x: 5, z: 0, eje: "x", nombre: "Comedor" },
    { id: "p_pas1", x: 10, z: 4, eje: "z" },
    { id: "p_pas2", x: 10, z: -5, eje: "z" },
    { id: "p_segura", x: 14, z: 1, eje: "z", nombre: "Habitación del reloj" },
    { id: "p_dormitorio", x: 14, z: 6, eje: "z", nombre: "Dormitorio de Lucas" },
    { id: "p_sotano", x: 14, z: -7, eje: "z", llave: "llave_serpiente", colorLlave: "#6a8a3a", nombre: "Sótano" },
    { id: "p_garaje", x: 24, z: -7, eje: "z", tipo: "metal", bloqueada: true, nombre: "Garaje" }
  ],

  objetos: [
    { id: "mapa_baker", tipo: "mapa", x: 8.6, z: 1 },
    { id: "hv1", tipo: "objeto", objeto: "hierba_verde", x: 0.8, z: 7.2 },
    { id: "doc_lucas", tipo: "documento", doc: "nota_lucas", x: 6.2, z: -5, enMesa: true },
    { id: "mun1", tipo: "objeto", objeto: "municion", cantidad: 10, x: 9.2, z: -9.2 },
    { id: "maquina_baker", tipo: "maquina", x: 15.2, z: -1.2, rot: 0 },
    { id: "cinta1", tipo: "objeto", objeto: "cinta", cantidad: 2, x: 17, z: 3.3 },
    { id: "hr1", tipo: "objeto", objeto: "hierba_roja", x: 19.2, z: 1.2 },
    { id: "escopeta", tipo: "arma", arma: "escopeta", x: 12, z: -9.3 },
    { id: "candado_lucas", tipo: "puzzle", puzzle: "re7", nombre: "Caja de Lucas", x: 15.4, z: 8.6,
      acciones: [{ clave: "llave_serpiente" }, { texto: "Dentro de la caja: una llave con una serpiente grabada… y un dedo cortado." }, { objetivo: "Baja al sótano con la Llave de la Serpiente" }] },
    { id: "mun2", tipo: "objeto", objeto: "municion", cantidad: 12, x: 19.3, z: 9.3 },
    { id: "doc_marguerite", tipo: "documento", doc: "diario_marguerite", x: 21, z: -10.5, y: 0.9 },
    { id: "candado_marguerite", tipo: "puzzle", puzzle: "re7_ethan_marguerite", nombre: "Candado del garaje", x: 23.3, z: -8.5,
      acciones: [{ desbloquear: ["p_garaje"] }, { objetivo: "Sal por el garaje" }] },
    { id: "cart1", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: 15, z: -3 },
    { id: "spray1", tipo: "objeto", objeto: "spray", x: 22.6, z: -2.6 },
    { id: "salida_re7", tipo: "salida", nombre: "Puerta trasera del garaje", x: 35.2, z: -6, si: "jefe_re7", requiere: "jefe_re7" }
  ],

  enemigos: [
    { tipo: "moldeado", x: 2, z: -2, dormido: true },
    { tipo: "moldeado", x: 12, z: 6 },
    { tipo: "moldeado", x: 17, z: -10 }, { tipo: "moldeado", x: 21, z: -6 }, { tipo: "moldeado", x: 16, z: -4, dormido: true }
  ],

  eventos: [
    { id: "cena", cuando: "entrar", sala: "comedor", acciones: [
      { cine: { titulo: "La cena", imagen: "img/escenarios/re7_comedor.webp", guion: [
        { sistema: "Una mesa servida con vísceras. Moscas. Un hombre enorme con camisa sucia mastica algo que se mueve." },
        { de: "jack", t: "Bienvenido a la familia, hijo." },
        { de: "ethan", t: "¿Dónde está Mia? ¿Qué le habéis hecho?" },
        { de: "jack", t: "Siéntate y come. No es de buena educación rechazar la comida de mamá." },
        { sistema: "Jack se levanta. La silla cae al suelo. Tú ya estás corriendo.", efecto: "temblor" }
      ] } },
      { perseguidor: { id: "jack_p", tipo: "jack", x: 8.6, z: -5 } }, { objetivo: "Escapa de Jack y encuentra la forma de bajar al sótano" }] },
    { id: "mia", cuando: "entrar", sala: "sotano", acciones: [
      { cine: { titulo: "Sótano", imagen: "img/escenarios/re7_casa_vieja.webp", guion: [
        { de: "mia", t: "¿Ethan…? Dios mío, Ethan. No deberías haber venido." },
        { de: "ethan", t: "Tres años, Mia. Tres años creyendo que estabas muerta." },
        { de: "mia", t: "Te lo explicaré todo. Pero ahora tenemos que salir de aquí antes de que vuelva Jack." }
      ] } },
      { companero: "mia" }, { objetivo: "Abre el candado del garaje (lee el diario de Marguerite)" }] },
    { id: "jack_jefe", cuando: "entrar", sala: "garaje", acciones: [
      { quitarPerseguidores: true }, { bloquear: ["p_garaje"] },
      { cine: { titulo: "Garaje", imagen: "img/escenarios/re7_garaje.webp", guion: [
        { sistema: "Las luces del coche se encienden. Un motor ruge. Jack está al volante." },
        { de: "jack", t: "¡Aquí estás, Ethan! ¡Te has perdido la mejor parte de la fiesta!" },
        { de: "mia", t: "¡Ethan, no se va a parar! ¡Tienes que matarlo!" }
      ] } },
      { jefe: { id: "jack_final", tipo: "jack_jefe", x: 31, z: -2 } }, { objetivo: "Acaba con Jack Baker" }] },
    { id: "jack_muerto", cuando: "marca", marca: "jefe_re7", acciones: [{ texto: "Jack se deshace en moho negro. Por fin, silencio." }, { objetivo: "Sal por la puerta trasera" }] }
  ],

  intro: { titulo: "Dulvey, Luisiana · 2017", imagen: "img/escenarios/re7.webp", guion: [
    { sistema: "Hace tres años que Mia desapareció. Hoy has recibido un correo suyo: «Ven a buscarme. Dulvey. Granja Baker»." },
    { de: "ethan", t: "Mia… ¿de verdad eres tú?" },
    { sistema: "La casa de los Baker se pudre entre los pantanos. La puerta está abierta. Huele a carne podrida." }
  ] },
  final: { titulo: "El muelle del pantano", imagen: "img/escenarios/re7_granero.webp", guion: [
    { sistema: "Amanece sobre el pantano. Un helicóptero con el logo de Umbrella aterriza en el muelle." },
    { de: "chris", t: "Ethan Winters. Chris Redfield. Vengo a sacaros de aquí." },
    { de: "ethan", t: "¿Umbrella? ¿En serio?" },
    { de: "chris", t: "Es una larga historia." }
  ] }
};
