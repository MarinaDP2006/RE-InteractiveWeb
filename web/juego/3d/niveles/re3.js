/* ============================================================================
 *  ARCHIVO III · RESIDENT EVIL 3 (1999) — La última huida de Raccoon City
 * ============================================================================
 *  Jill Valentine. Su apartamento → calles en llamas → almacén (sala segura)
 *  → teclado del metro (código del contestador) → oficina del metro (Carlos y
 *  la Llave de la torre) → Némesis la caza → plaza de la torre del reloj →
 *  gemas del reloj → Némesis, cara a cara.
 * ========================================================================== */
const P = Math.PI;

export default {
  id: "re3", juego: "Resident Evil 3", titulo: "Última huida", lugar: "Centro de Raccoon City", anio: "28 de septiembre de 1998",
  protagonista: "jill", tema: "tema-re3", temaMusica: "re3", fondo: "img/escenarios/re3_calles.webp", tiempoPar: 900,
  inicio: { x: 4, z: 2.2, yaw: P },
  objetivo: "Sal de tu apartamento y busca una salida de la ciudad",
  ambiente: { niebla: "#120a08", densidad: 0.045, ambiente: 0.1, luzCielo: "#5a3a2a", luzSuelo: "#1a0a04", luna: 0.5, colorLuna: "#ff9a60" },
  llaves: { llave_torre: { nombre: "Llave de la torre del reloj", color: "#c8a030" } },

  salas: [
    { id: "apartamento", nombre: "Apartamento de Jill", x: 0, z: 0, w: 8, d: 7, alto: 2.8, suelo: "parquet", pared: "papel", techo: "yeso",
      props: [["cama", 1.2, 1.4, 0], ["sofa", 6.5, 1, 0], ["mesa", 4, 4, 0, { ancho: 1.2, fondo: 0.7 }], ["estanteria", 7.6, 4.5, -P / 2], ["ventana", 0.06, 4.5, P / 2, { ancho: 1.2, alto: 1.4 }],
        ["lampara_techo", 4, 3.5, 0, { techo: 2.8, intensidad: 5, parpadeo: 0.2 }], ["cuadro", 4, 0.06, 0, { imagen: "img/escenarios/re3.webp", ancho: 1, alto: 0.7, y: 1.5 }]] },
    { id: "calle_a", nombre: "Calle Ennerdale", x: -6, z: 7, w: 20, d: 8, exterior: true, suelo: "asfalto", pared: "ladrillo",
      props: [["coche", -2, 12, P / 2, { ardiendo: true }], ["farola", 1, 8], ["farola", 11, 14], ["escombros", 9, 9.5], ["valla", -4.5, 14.6, 0, { largo: 3 }], ["cadaver", 6, 13, 0.4, { figura: "zombi" }], ["sangre", 3, 10, 0, { tam: 2 }], ["contenedor", -5, 8.5, P / 2]] },
    { id: "almacen", nombre: "Almacén", segura: true, x: 14, z: 7, w: 8, d: 8, alto: 3.5, suelo: "hormigon", pared: "ladrillo", techo: "metal",
      props: [["cajas", 20.5, 8.5], ["cajas", 20.5, 13.5], ["estanteria", 17, 14.6, P], ["baul", 15, 14.4, P], ["fluorescente", 18, 11, 0, { techo: 3.5, parpadeo: 0.05 }]] },
    { id: "calle_b", nombre: "Avenida del metro", x: -6, z: 15, w: 20, d: 12, exterior: true, suelo: "asfalto", pared: "ladrillo",
      props: [["coche", 0, 19, 0.2], ["coche", 8, 24, P / 2 + 0.3, { ardiendo: true }], ["farola", -4, 17], ["farola", 12, 18], ["escombros", -3, 25], ["barril", 12.6, 25.5], ["cadaver", 4, 22, 1, { figura: "zombi" }], ["sangre", 6, 18, 0, { tam: 2.2 }]] },
    { id: "metro", nombre: "Oficina del metro", x: 14, z: 17, w: 8, d: 8, alto: 3, suelo: "baldosa", pared: "azulejo", techo: "yeso",
      props: [["escritorio", 20, 19, -P / 2], ["taquillas", 21.6, 23, -P / 2], ["mesa", 17, 23.6, 0, { ancho: 1.4, fondo: 0.7 }], ["fluorescente", 18, 21, 0, { parpadeo: 0.4 }], ["papeles", 16, 19]] },
    { id: "plaza", nombre: "Plaza de la torre del reloj", x: -6, z: 27, w: 20, d: 16, exterior: true, cerradaA: ["calle_b"], suelo: "piedra", pared: "ladrillo",
      props: [["estatua", 4, 35, 0, { color: "#8a8478" }], ["arbol_seco", -3, 30], ["arbol_seco", 11, 30], ["arbol_seco", -3, 40], ["farola", 0, 32], ["farola", 8, 38], ["coche", 10.5, 40, 0.5], ["escombros", -2.5, 36], ["lapida", 12, 34]] },
    { id: "torre", nombre: "Torre del reloj", x: 0, z: 43, w: 8, d: 8, alto: 6, suelo: "piedra", pared: "piedra", techo: "madera_oscura",
      props: [["reloj", 4, 50.6, P], ["candelabro", 1, 50.3], ["candelabro", 7, 50.3], ["mesa", 1.4, 46, P / 2, { ancho: 1.2, fondo: 0.7 }], ["cruz", 7.3, 45], ["lampara_techo", 4, 47, 0, { techo: 6, intensidad: 8 }]] }
  ],

  puertas: [
    { id: "p_apto", x: 4, z: 7, eje: "x", nombre: "Salir a la calle" },
    { id: "p_almacen", x: 14, z: 11, eje: "z", tipo: "metal", nombre: "Almacén" },
    { id: "p_metro", x: 14, z: 21, eje: "z", tipo: "metal", bloqueada: true, nombre: "Oficina del metro" },
    { id: "p_plaza", x: 4, z: 27, eje: "x", tipo: "reja", ancho: 2, llave: "llave_torre", colorLlave: "#c8a030", nombre: "Verja de la plaza" },
    { id: "p_torre", x: 4, z: 43, eje: "x", ancho: 1.6, alto: 2.8, nombre: "Torre del reloj" }
  ],

  objetos: [
    { id: "doc_contestador", tipo: "documento", doc: "contestador_jill", x: 4, z: 4, enMesa: true },
    { id: "hv1", tipo: "objeto", objeto: "hierba_verde", x: 7.3, z: 6.3 },
    { id: "mun1", tipo: "objeto", objeto: "municion", cantidad: 10, x: 0.8, z: 6.3 },
    { id: "mun2", tipo: "objeto", objeto: "municion", cantidad: 12, x: -5.2, z: 14.3 },
    { id: "maquina_almacen", tipo: "maquina", x: 15.2, z: 8, rot: 0 },
    { id: "cinta1", tipo: "objeto", objeto: "cinta", cantidad: 2, x: 17, z: 8 },
    { id: "mapa_ciudad", tipo: "mapa", x: 19, z: 11 },
    { id: "hv2", tipo: "objeto", objeto: "hierba_verde", x: 21.2, z: 11 },
    { id: "hr1", tipo: "objeto", objeto: "hierba_roja", x: 21.2, z: 10.2 },
    { id: "teclado_metro", tipo: "puzzle", puzzle: "re3", nombre: "Teclado de la oficina del metro", x: 13.4, z: 22.4,
      acciones: [{ desbloquear: ["p_metro"] }] },
    { id: "mun3", tipo: "objeto", objeto: "municion", cantidad: 10, x: -5, z: 26 },
    { id: "escopeta", tipo: "arma", arma: "escopeta", x: 20, z: 19, enMesa: true },
    { id: "cart1", tipo: "objeto", objeto: "cartuchos", cantidad: 8, x: 21.3, z: 17.6 },
    { id: "doc_ubcs", tipo: "documento", doc: "orden_ubcs", x: 17, z: 23.6, enMesa: true },
    { id: "llave_torre", tipo: "llave", llave: "llave_torre", nombre: "Llave de la torre del reloj", color: "#c8a030", x: 15, z: 24.3 },
    { id: "spray1", tipo: "objeto", objeto: "spray", x: 12.6, z: 28.2 },
    { id: "cart2", tipo: "objeto", objeto: "cartuchos", cantidad: 6, x: -5, z: 42 },
    { id: "doc_reloj", tipo: "documento", doc: "inscripcion_reloj", x: 1.4, z: 46, enMesa: true },
    { id: "gemas", tipo: "puzzle", puzzle: "re3_jill_reloj", nombre: "Mecanismo del reloj", x: 4, z: 49.8,
      acciones: [{ sonido: "campana" }, { texto: "Las campanas suenan sobre Raccoon City. El helicóptero de rescate ya viene." }] },
    { id: "salida_re3", tipo: "salida", nombre: "Huir por la avenida norte", x: -5.2, z: 35, si: "jefe_re3", requiere: "jefe_re3", bloqueo: "Todavía no." }
  ],

  enemigos: [
    { tipo: "zombi", x: 0, z: 10 }, { tipo: "zombi", x: 9, z: 12 }, { tipo: "zombi", x: 3, z: 13.8, dormido: true },
    { tipo: "zombi", x: 2, z: 24 }, { tipo: "zombi", x: 10, z: 17 }, { tipo: "zombi", x: -4, z: 20 },
    { tipo: "perro", x: 0, z: 38 }, { tipo: "zombi", x: 9, z: 33 }, { tipo: "zombi", x: -2, z: 41, dormido: true }
  ],

  eventos: [
    { id: "calle", cuando: "entrar", sala: "calle_a", acciones: [{ sonido: "gritoLejano" }, { objetivo: "Busca la forma de entrar en la oficina del metro" }] },
    { id: "carlos", cuando: "entrar", sala: "metro", acciones: [
      { cine: { titulo: "Oficina del metro", imagen: "img/escenarios/re3_metro.webp", guion: [
        { de: "carlos", t: "¡Eh, eh! ¡No dispares! Soy Carlos Oliveira, de la U.B.C.S. Umbrella nos ha enviado a rescatar civiles." },
        { de: "jill", t: "¿Umbrella? ¿Ahora queréis rescatar a la gente que habéis matado?" },
        { de: "carlos", t: "Yo solo sigo órdenes… Mira, tengo un tren preparado. Necesitamos que las campanas de la torre suenen: es la señal para el helicóptero." },
        { de: "jill", t: "Está bien. Pero no te separes." }
      ] } },
      { companero: "carlos" }, { objetivo: "Coge la llave y abre la verja de la plaza" }] },
    { id: "nemesis", cuando: "recoger", objeto: "llave_torre", acciones: [
      { sonido: "cristal" },
      { cine: { titulo: "S.T.A.R.S.", imagen: "img/escenarios/re3_calles.webp", guion: [
        { sistema: "La pared de la oficina revienta. Una mole de dos metros y medio, con gabardina negra y un lanzacohetes, se yergue entre el humo.", efecto: "temblor" },
        { sistema: "«S… T… A… R… S…»" },
        { de: "carlos", t: "¡¿Qué es esa cosa?!" },
        { de: "jill", t: "Viene a por mí. ¡Corre!" }
      ] } },
      { perseguidor: { id: "nemesis_p", tipo: "nemesis", x: 8, z: 20 } }, { objetivo: "Huye de Némesis hasta la torre del reloj" }] },
    { id: "torre", cuando: "entrar", sala: "torre", acciones: [{ objetivo: "Coloca las gemas en el reloj" }] },
    { id: "nemesis_jefe", cuando: "marca", marca: "puzzle_re3_jill_reloj", acciones: [
      { quitarPerseguidores: true },
      { cine: { titulo: "Plaza de la torre del reloj", imagen: "img/escenarios/re3_torre.webp", guion: [
        { sistema: "El helicóptero aparece entre el humo… y un cohete lo parte en dos. Los restos caen ardiendo sobre la plaza.", efecto: "temblor" },
        { de: "carlos", t: "¡No! ¡Era nuestra salida!" },
        { sistema: "Némesis cruza las llamas. Ya no lleva gabardina. Le han crecido tentáculos." },
        { de: "jill", t: "Se acabó huir. Si quieres a los S.T.A.R.S., ven a por mí." }
      ] } },
      { jefe: { id: "nemesis_final", tipo: "nemesis_jefe", x: 4, z: 31 } }, { objetivo: "Derrota a Némesis" }] },
    { id: "nemesis_muerto", cuando: "marca", marca: "jefe_re3", acciones: [{ texto: "Ha caído. La avenida norte está despejada: es ahora o nunca." }, { objetivo: "Huye por la avenida norte" }] }
  ],

  intro: { titulo: "Apartamento de Jill · 28 de septiembre", imagen: "img/escenarios/re3.webp", guion: [
    { sistema: "Dos meses después de la mansión. Nadie creyó a los S.T.A.R.S. Ahora el virus ha llegado a la ciudad." },
    { de: "jill", t: "Sabía que esto iba a pasar. Umbrella lo ha dejado escapar." },
    { sistema: "Suena el contestador. Una explosión sacude el edificio.", efecto: "temblor" },
    { de: "jill", t: "Tengo que salir de Raccoon City. Hoy." }
  ] },
  final: { titulo: "Avenida norte", imagen: "img/escenarios/re3_nest2.webp", guion: [
    { sistema: "Amanece. Un misil termobárico cae sobre Raccoon City. La onda expansiva os alcanza cuando ya estáis en el puente." },
    { de: "carlos", t: "Lo hemos conseguido, Jill. Estamos vivos." },
    { de: "jill", t: "Raccoon City ya no existe. Pero Umbrella sí. Y voy a acabar con ella." }
  ] }
};
