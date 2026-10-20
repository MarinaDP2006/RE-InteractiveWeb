/* ============================================================================
 *  ARCHIVO VI · RESIDENT EVIL 7: BIOHAZARD (2017) — Ethan · Mia · Chris
 *  Soluciones: Puzzles.java (re7, re7_ethan_marguerite, re7_mia_barco, re7_chris_lucas)
 * ========================================================================== */

"use strict";

Object.assign(DOCUMENTOS, {
  nota_lucas: {
    titulo: "Tarjeta de cumpleaños de Lucas",
    estilo: "papel",
    texto: `¡¡FELIZ CUMPLEAÑOS, ETHAN!!
¿Quieres salir de la casa, primito? Juguemos.
La combinación tiene TRES cifras:

1ª → Cuántos Baker salimos en la foto de familia.
2ª → Cuántas cabezas tiene el perro de la puerta.
3ª → Cuántas niñas nos arruinaron la vida.

Si fallas... bueno, papá tiene hambre. :)

— Lucas`
  },
  diario_marguerite: {
    titulo: "Diario de Marguerite Baker",
    estilo: "sangre",
    texto: `Mis bebés tienen hambre. Siempre tienen hambre.

He contado los nidos: TRES en el invernadero, entre las
tomateras. OCHO en el sótano, donde guardamos a los invitados.
Y DOS dentro de mí. Los noto. Me hacen cosquillas en el vientre.

He cerrado el invernadero con mis números favoritos:
los nidos del invernadero, los del sótano y los míos.
En ese orden. Como una buena madre.

Jack dice que estoy rara. Jack se come los ojos de los invitados
como si fueran aceitunas. ¿Quién está raro?

La niña dice que ahora somos una familia.
La niña tiene razón.`
  },
  bitacora_annabelle: {
    titulo: "Cuaderno de bitácora del Annabelle",
    estilo: "sangre",
    texto: `PETROLERO ANNABELLE · RUTA: GOLFO DE MÉXICO

Día 1. Llevamos una carga especial: una niña y dos escoltas.
Órdenes de no hablar con ella.

Día 6. La niña ha pedido a un marinero que sea su papá.
Él se ha reído. Esta mañana tosía moho negro.

Día 9. Seis hombres enfermos. Hablan solos. Dicen que la niña
les habla dentro de la cabeza.

Día 14. Esta noche la niña ha matado al capitán. No le ha
tocado. Le ha mirado. El capitán se ha deshecho en moho.
Quedamos 3.

Si alguien encuentra esto: el contenedor de la niña se abre
con el día en que mató al capitán y los que quedamos vivos.

Que Dios nos perdone por traerla.`
  },
  acertijo_lucas: {
    titulo: "Nota de Lucas en la mina",
    estilo: "papel",
    texto: `¡Hola, soldadito de Umbrella!

Te he dejado una trampa muy divertida. Hay una sierra
debajo de tus pies. Si quieres desactivarla, contesta:

«Soy tan frágil que, si dices mi nombre,
me rompes.»

¿Lo sabes? ¿No? Pues piensa en tus amiguitos de Umbrella
que entraron antes que tú. No dijeron nada... porque
ya no tenían lengua.

— Tu amigo Lucas :)`
  },
  informe_connections: {
    titulo: "Informe de Lucas Baker para The Connections",
    estilo: "email",
    texto: `DE: L. Baker
PARA: The Connections
ASUNTO: Datos del sujeto E-001

Os mando los datos de comportamiento de la mocosa (Eveline)
y de todos los «invitados» que hemos tenido en casa.

Ethan Winters es especial: el moho lo regenera mejor que a
nadie. Le han cortado la mano dos veces y la pierna una.
Le han pegado los trozos con grapas. Sigue funcionando.

A cambio quiero lo prometido: dinero y una salida segura
antes de que la B.S.A.A. o Umbrella vengan a limpiar.

P. D. A mi madre le salen insectos de la boca. A mi padre
no se le cierra la cabeza. Mi hermana se esconde en un
tráiler. Yo soy el único normal de esta familia.`
  }
});

HISTORIA.capitulos.push({
  id: "re7",
  juego: "Resident Evil 7: Biohazard",
  titulo: "Bienvenido a la familia",
  anio: "2014 – 2017",
  lugar: "Finca Baker · Dulvey, Luisiana",
  tema: "tema-re7",
  fondoImagen: "img/escenarios/re7.webp",
  variantes: {chris: "chris_re7"},
  rutas: [

    /* ======================================================================
     *  ETHAN WINTERS
     * ==================================================================== */
    {
      id: "ethan",
      protagonista: "ethan",
      titulo: "El hombre corriente",
      resumen: "Tu esposa Mia desapareció hace tres años. Hoy te ha enviado un vídeo: «Ethan, no vengas». Has venido. La familia Baker te espera para cenar.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Eres Ethan Winters, un hombre corriente. Hace tres años que tu esposa Mia desapareció.",
          "Hoy recibiste un vídeo suyo: «Ethan, no vengas a buscarme».",
          "Por supuesto, viniste. La finca Baker huele a moho, a carne podrida y a pantano.",
          "Encontraste a Mia en el sótano. Y Mia te cortó la mano izquierda con una motosierra. Oíste los huesos antes de sentir el dolor."
        ] },
        { tipo: "chat", titulo: "Teléfono de la casa · llamada entrante", guion: [
          { de: "zoe", t: "¿Ethan? No hables, escucha. Soy Zoe. Vivo... vivía aquí. Puedo ayudarte." },
          { de: "zoe", t: "Tu mano está en el suelo, ¿verdad? Mójala con el líquido estabilizador. Vuelve a pegarse. No preguntes." },
          { opciones: [
            { t: "¿Pegar mi mano? ¿¡Qué está pasando aquí!?", resp: [{ de: "zoe", t: "El moho. Está en todos nosotros. Te curas. Pero también te cambia. Muévete." }], efecto: { dano: 10, muerte: "Te desangraste en el suelo de la cocina de los Baker." } },
            { t: "Vale. Lo hago. ¿Y luego?", resp: [{ de: "zoe", t: "Luego tienes que salir de la casa principal. Mi hermano Lucas cerró las puertas con uno de sus jueguecitos." }] }
          ] },
          { de: "jack", t: "¡BIENVENIDO A LA FAMILIA, HIJO!", efecto: { susto: "jack" } },
          { de: "zoe", t: "Es mi padre. No puede morir. Lo he visto levantarse con la cabeza abierta. ¡Escóndete!" }
        ] },
        { tipo: "explorar", titulo: "Casa Baker · Comedor", imagen: "img/escenarios/re7_comedor.webp", escenario: "casa", ancho: 14, fondo: 18, sangre: 5, lamparas: 1,
          descripcion: "Una cena servida hace semanas. Moscas. Y la familia mirándote desde los retratos. Jack Baker recorre la casa con una pala. No puedes matarlo: escóndete y busca la tarjeta de Lucas.",
          salida: { x: 4, z: -9, texto: "Ir a la puerta de Lucas" },
          props: [
            ["cuadro", -4, -8.95, 0, "jack"], ["cuadro", -1.5, -8.95, 0, "marguerite"], ["cuadro", 1, -8.95, 0, "lucas"], ["cuadro", -6.95, 2, 1.57, "zoe"],
            ["silla", -1.2, 1, 1.57], ["silla", 1.2, 1, -1.57], ["silla", 0, 2.2, 3.14], ["estanteria", 6.2, 3, -1.57], ["piano", -5.8, 6, 1.57],
            ["visceras", 0, 0.2], ["lampara", 6, 7.6], ["cadaver", 5, -5, 2, "zombi"]
          ],
          puntos: [
            { x: 0, z: 0.4, nombre: "Mesa del comedor", prop: ["mesa", 0], texto: "Vísceras en una sopera. Un dedo en el puré. Un brazo humano asado en la bandeja principal, con el reloj todavía en la muñeca. Sigue dando la hora.", accion: { sangre: true } },
            { x: -4, z: -8.2, nombre: "Foto de familia", texto: "Jack, Marguerite, Lucas y Zoe sonríen frente a la casa. Detrás de la foto, una tarjeta de cumpleaños.", requerido: true, altura: 1.9, accion: { documento: "nota_lucas" } },
            { x: 4, z: -8.2, nombre: "Puerta grabada", texto: "Una puerta con un grabado de un perro de TRES cabezas. Cerrada a cal y canto. Tiene un candado de tres cifras.", requerido: true, altura: 1.3 },
            { x: -5.5, z: -5, nombre: "Nevera", prop: ["nevera", 1.57], texto: "Dentro, la cabeza de un policía con los ojos abiertos y la boca llena de gusanos. En el cajón de las verduras, una hierba verde.", accion: { objeto: "hierba_verde", cantidad: 1 } },
            { x: 5.5, z: 6, nombre: "Niña en la esquina", texto: "Una niña pálida de pelo negro. Parpadeas... y ya no está. Solo queda moho en la pared con forma de manos.", accion: { susto: "eveline", dano: 0 } },
            { x: 6, z: 1, nombre: "Estantería", texto: "Detrás de unos tarros con ojos en formol: munición de escopeta... y de pistola. Y una cinta de tinta.", accion: { objetos: { municion: 12, cinta: 1 } } }
          ],
          enemigos: [
            { id: "jack", x: -4, z: -5, rango: 12, vel: 1.15, aturdido: "cae de espaldas con media cabeza colgando... y se ríe. «¡Eso ha dolido, hijo!».", ataque: "¡CLANG! La pala te parte la clavícula.", muerte: "Jack te abrió la cabeza con la pala y te sirvió de segundo plato. «¡Cómetelo todo, hijo!»" }
          ] },
        { tipo: "puzzle", id: "re7", ui: "codigo", digitos: 3,
          titulo: "Candado de Lucas",
          enunciado: "Un candado de 3 cifras en la puerta del perro. Lucas dejó un acertijo en su tarjeta de cumpleaños.",
          danoFallo: 5,
          pista: "En la foto hay 4 Baker (Jack, Marguerite, Lucas, Zoe). El perro de la puerta tiene 3 cabezas. Y una sola niña: Eveline." },
        { tipo: "encuentro", enemigo: "jack", modo: "esquiva", rondas: 4, velocidad: 1.25, dano: 40,
          texto: "En el garaje, Jack se sube a un coche y arranca. «¡Vamos a dar una vuelta, Ethan!». Te embiste contra la pared una y otra vez.",
          exito: "Esquivas el coche, te subes tú y le aplastas contra un pilar. Jack queda partido en dos. La mitad de arriba te sigue hablando.",
          fallo: "El parachoques te parte la pierna. La vuelves a pegar con estabilizador, gritando. Aplastas a Jack contra la pared.",
          muerte: "Jack te pasó por encima con el coche. Varias veces. Riendo." },
        { tipo: "maquina" },
        { tipo: "explorar", titulo: "Casa vieja · Invernadero de Marguerite", imagen: "img/escenarios/re7_casa_vieja.webp", escenario: "casa", ancho: 16, fondo: 22, sangre: 5, matar: true, ambiente: { cPared: "#3a3a20", luz: "#c8d088" },
          descripcion: "Plantas podridas, zumbido de insectos y nidos de carne pegados a las paredes. Marguerite Baker ya no es humana: le salen avispas del cuerpo. Mátala y abre el invernadero.",
          salida: { x: 0, z: -11, texto: "Ir al candado del invernadero" },
          props: [
            ["mesa", -4, 4], ["mesa", 4, 4], ["cama", -6.2, -4, 1.57, "sangre"], ["visceras", 0, 0], ["visceras", -3, -6], ["colgado", 3, -4, 0, "carne"],
            ["arbol_seco", -6, 8], ["pintada", 7.95, 0, -1.57, "MIS BEBÉS"], ["lampara", 6.4, 8.6]
          ],
          puntos: [
            { x: -4, z: 4.4, nombre: "Diario de Marguerite", texto: "Un diario con manchas de algo que no es tinta. Huele a miel podrida.", requerido: true, accion: { documento: "diario_marguerite" } },
            { x: -6.2, z: -4, nombre: "Cama de matrimonio", texto: "Las sábanas se mueven. Debajo hay un nido de larvas del tamaño de un brazo. Comiendo a un hombre que sigue vivo.", accion: { susto: "marguerite", dano: 10, muerte: "Las larvas te entraron por los oídos. Marguerite te arropó." } },
            { x: 4, z: 4.4, nombre: "Despensa", texto: "Munición, un spray y hierbas. Y tarros con dientes clasificados por tamaño.", accion: { objetos: { municion: 15, spray: 1 } } }
          ],
          enemigos: [
            { id: "marguerite", x: 0, z: -7, vida: 12, vel: 1.1, dano: 30, rango: 16, escala: 1.1, muerte: "Marguerite te metió el brazo en la boca hasta el codo y te llenó el estómago de huevos.", remate: "Marguerite revienta como una colmena. De su vientre salen cientos de avispas muertas y un olor dulce, nauseabundo." },
            { id: "moldeado", x: -3, z: -3 }, { id: "moldeado", x: 4, z: -2 }
          ] },
        { tipo: "puzzle", id: "re7_ethan_marguerite", ui: "codigo", digitos: 3,
          titulo: "Candado del invernadero",
          enunciado: "Tres cifras. Marguerite escribió sus «números favoritos» en el diario.",
          danoFallo: 5,
          pista: "3 nidos en el invernadero, 8 en el sótano, 2 dentro de ella: 382." },
        { tipo: "encuentro", enemigo: "lucas", modo: "esquiva", rondas: 4, velocidad: 1.4, dano: 30,
          texto: "Lucas te encierra en su granero: «¡Happy Birthday!». Una sala con trampas, un pastel con una vela-bomba y un invitado muerto atado a la mesa. Esquiva los cables y sal antes de que explote.",
          exito: "Esquivas las trampas y escapas por el conducto justo cuando el pastel explota. El invitado muerto vuela en pedazos por toda la habitación.",
          fallo: "Una trampa de cuchillas te arranca dos dedos. Los recoges, los pegas con estabilizador y escapas.",
          muerte: "La vela-bomba te reventó la cara. Lucas lo grabó todo para su canal privado." },
        { tipo: "chat", titulo: "Zoe · última llamada", guion: [
          { de: "zoe", t: "Ethan, tengo dos dosis de suero. No, perdón... solo UNA. Y estamos Mia y yo infectadas." },
          { opciones: [
            { t: "Se la doy a Mia. He venido a por ella.", marca: "re7_suero_mia", resp: [
              { de: "mia", t: "Ethan... lo siento. Lo siento tanto. Yo trabajaba para ellos. Eveline era mi responsabilidad." },
              { de: "zoe", t: "Lo entiendo. Id con cuidado. Yo... me quedaré aquí." }
            ] },
            { t: "Se la doy a Zoe. Me ha salvado la vida.", marca: "re7_suero_zoe", resp: [
              { de: "zoe", t: "Gracias, Ethan... ¿y Mia?" },
              { de: "mia", t: "Ethan... no... no me dejes con ella...", efecto: "sangre" }
            ] }
          ] },
          { de: "eveline", t: "Ahora... somos... una familia. ¿Verdad, papá?", efecto: { susto: "eveline" } }
        ] },
        { tipo: "explorar", titulo: "Petrolero varado", imagen: "img/escenarios/re7_granero.webp", escenario: "barco", ancho: 12, fondo: 22, sangre: 6, matar: true,
          descripcion: "El barco donde todo empezó. Moho negro en cada pared. Los Moldeados salen de las paredes como si nacieran de ellas. Llega hasta el laboratorio de Eveline.",
          salida: { x: 0, z: -11, texto: "Ir al laboratorio de Eveline" },
          props: [
            ["tuberia", -5.8, 0, 1.57], ["tuberia", 5.8, -4, 1.57], ["caja", 4.6, 8], ["caja", 4.6, 6.9], ["cama", -4.6, -6, 1.57], ["camilla", 4.4, -6, -1.57, "zombi"],
            ["visceras", 0, 2], ["pintada", -5.95, 4, 1.57, "MAMÁ"], ["cadaver", -3, 5, 1, "capitan"]
          ],
          puntos: [
            { x: -3, z: 5, nombre: "El capitán", texto: "El capitán del barco, convertido en una estatua de moho negro. Cuando lo tocas, se deshace en polvo y deja caer munición.", accion: { objetos: { municion: 15 } } },
            { x: -4.6, z: -6, nombre: "Camarote de la niña", texto: "Dibujos infantiles en las paredes: una familia de palotes. Todos con los ojos tachados menos uno: tú.", requerido: true },
            { x: 4.6, z: 7, nombre: "Cajas de suministros", texto: "Un spray y hierbas mezcladas.", accion: { objetos: { spray: 1, hierba_mixta: 1 } } }
          ],
          npcs: [{ id: "mia", x: -1.5, z: 9, sigue: true, si: "re7_suero_mia", lineas: ["Ethan, aquí la tuvimos encerrada. Aquí se escapó.", "Perdóname. Te mentí sobre mi trabajo. Sobre todo.", "Ella me controlaba. Te corté la mano, Ethan. Te corté la mano."] }],
          enemigos: [{ id: "moldeado", x: -2, z: -2 }, { id: "moldeado", x: 2, z: -5 }, { id: "moldeado", x: 0, z: -8, figura: "moldeado", escala: 1.3, vida: 6 }] },
        { tipo: "encuentro", enemigo: "eveline_vieja", modo: "machaca", veces: 24, tiempo: 6, dano: 45, boton: "¡INYÉCTALE LA NECROTOXINA!",
          texto: "Eveline no es una niña: es una anciana consumida en una silla de ruedas, la verdadera forma del arma. Al inyectarle la E-Necrotoxina, explota en una montaña de moho, carne y brazos que te agarra. ¡Clávale la jeringa!",
          exito: "La jeringa entra hasta el fondo. Eveline se resquebraja como una estatua de ceniza y se deshace gritando «¡papá!».",
          fallo: "Una mano de moho te arranca un trozo de mejilla. Le clavas la jeringa igualmente. Eveline se convierte en ceniza.",
          muerte: "Eveline te absorbió en su masa de moho. Ahora sí eres parte de su familia. Para siempre." },
        { tipo: "narracion", si: "re7_suero_mia", lineas: [
          "Un helicóptero llega con un logotipo de Umbrella... azul. Un soldado baja: «Chris Redfield. Vamos, os saco de aquí».",
          "Mia te coge de la mano. Está curada. Lloráis los dos sin decir nada.",
          "Zoe se queda atrás, petrificada en moho en el pantano. Algún día alguien irá a buscarla.",
          "Pensabas que todo había acabado. Pero el moho ya estaba dentro de ti."
        ] },
        { tipo: "narracion", si: "re7_suero_zoe", lineas: [
          "Zoe y tú salís en barca por el pantano. Una mano de moho gigante voltea la barca. Zoe se convierte en piedra delante de ti.",
          "Mia, abandonada, se deshace en el moho de Eveline. Tienes que matarla tú mismo cuando te ataca convertida en un monstruo.",
          "Un helicóptero de Umbrella azul llega al final. «Chris Redfield». Te subes solo.",
          "Has sobrevivido. Has perdido a todos. Y el moho ya estaba dentro de ti."
        ] }
      ]
    },

    /* ======================================================================
     *  MIA WINTERS · EL ANNABELLE (2014)
     * ==================================================================== */
    {
      id: "mia",
      protagonista: "mia",
      titulo: "La cinta del Annabelle",
      resumen: "2014. No eres ama de casa: eres agente de una organización secreta. Escoltas a un arma biológica con forma de niña en un petrolero. Ella quiere una familia. Y tú vas a ser su madre.",
      pasos: [
        { tipo: "narracion", lineas: [
          "2014. Eres Mia Winters. Ethan cree que trabajas en una empresa de envíos. Le mientes desde el primer día.",
          "Trabajas para The Connections, unos traficantes de armas biológicas. Tu misión: escoltar al sujeto E-001 en el petrolero Annabelle.",
          "El sujeto E-001 es una niña de diez años, pálida, de pelo negro. Se llama Eveline. Te mira fijamente durante horas.",
          "Al décimo día, la tripulación empieza a toser moho. Al decimocuarto, la niña mata al capitán con la mirada."
        ] },
        { tipo: "explorar", titulo: "Annabelle · Bodega de carga", imagen: "img/escenarios/re7_granero.webp", escenario: "barco", ancho: 12, fondo: 22, sangre: 5,
          descripcion: "Contenedores, tuberías y marineros muertos cubiertos de moho. Eveline te sigue a todas partes. Encuentra el cuaderno de bitácora y el contenedor de la niña.",
          salida: { x: 0, z: -11, texto: "Ir al contenedor de Eveline" },
          props: [
            ["caja", -4.4, 8], ["caja", -4.4, 6.9], ["caja", 4.4, 3], ["vagon", 3.5, -3], ["tuberia", -5.8, -2, 1.57], ["cadaver", -3, 2, 0.4, "capitan"],
            ["cadaver", 2, 7, 2, "zombi"], ["visceras", -1, 4], ["pintada", -5.95, -6, 1.57, "ELLA NOS OYE"]
          ],
          puntos: [
            { x: -3.4, z: -6, nombre: "Puesto del oficial", prop: ["mesa", 1.57], texto: "El cuaderno de bitácora, con las últimas páginas escritas a toda prisa.", requerido: true, accion: { documento: "bitacora_annabelle" } },
            { x: -3, z: 2, nombre: "El capitán", texto: "El capitán del Annabelle. Moho negro le sale de los ojos, la nariz y la boca como raíces. Tiene la mano agarrada a un cargador.", accion: { objetos: { municion: 15 } } },
            { x: 2, z: 7, nombre: "Marinero", texto: "Le falta la mandíbula. Se la arrancó él mismo, dicen las marcas de sus uñas. Para no oír la voz.", accion: { sangre: true } },
            { x: -4.4, z: 5.8, nombre: "Botiquín de a bordo", texto: "Un spray y una cinta de tinta. Y una foto de Ethan que llevas siempre encima.", accion: { objetos: { spray: 1, cinta: 1 } } }
          ],
          npcs: [{ id: "eveline", x: -1.5, z: 9, sigue: true, dispara: false, lineas: ["¿Quieres ser mi mamá?", "Los marineros no querían ser mi familia. Ahora están dormidos.", "¿Por qué no me quieres? Todos tienen que quererme.", "Si eres mi mamá, no te pasará nada. Te lo prometo."] }],
          enemigos: [{ id: "moldeado", x: 0, z: -4 }, { id: "zombi", figura: "capitan", x: 2, z: -8 }] },
        { tipo: "chat", titulo: "Bodega · a solas con Eveline", guion: [
          { de: "eveline", t: "Mia. ¿Tú me quieres?" },
          { opciones: [
            { t: "Claro que sí, cariño. Ven aquí.", marca: "re7_mia_miente", resp: [{ de: "eveline", t: "¡Bien! Entonces serás mi mamá. Y tu marido será mi papá. Lo traeré. Algún día." }] },
            { t: "Eres un arma, Eveline. No eres mi hija.", resp: [{ de: "eveline", t: "...Eso duele, Mia. Las cosas que duelen... hacen que la gente se duerma.", efecto: { dano: 15, muerte: "Eveline te miró. Te deshiciste en moho en mitad de la bodega." } }] }
          ] },
          { de: "eveline", t: "Ya no hay barco. Vamos a una casa. Con una familia de verdad. Los Baker. ¿Te gustan los nombres sureños?" }
        ] },
        { tipo: "puzzle", id: "re7_mia_barco", ui: "codigo", digitos: 4,
          titulo: "Contenedor de Eveline",
          enunciado: "Cuatro cifras. El cuaderno de bitácora dice cómo abrir el contenedor de la niña.",
          danoFallo: 8,
          pista: "El día en que mató al capitán (14) y los supervivientes (03): 1403." },
        { tipo: "encuentro", enemigo: "moldeado", modo: "esquiva", rondas: 4, velocidad: 1.3, dano: 35,
          texto: "Un Moldeado sale de la pared del contenedor. Se forma delante de ti: brazos de moho negro, una boca que se abre hasta el pecho y dientes como cristales.",
          exito: "Esquivas sus zarpazos y le vacías el cargador en la boca. Se deshace en una masa negra que huele a podredumbre dulce.",
          fallo: "Sus garras te abren el muslo. La herida se cierra sola, con moho. Eso es peor que la herida.",
          muerte: "El Moldeado te arrancó la cara de un mordisco. Eveline lloró: «¡Era mi mamá!»." },
        { tipo: "maquina" },
        { tipo: "explorar", titulo: "Annabelle · Cubierta inferior", imagen: "img/escenarios/re7_garaje.webp", escenario: "barco", ancho: 14, fondo: 22, sangre: 6, matar: true,
          descripcion: "Tu compañero Alan está aquí abajo, convertido en algo que todavía lleva su placa. El barco se hunde. Despeja el camino a los botes.",
          salida: { x: 0, z: -11, texto: "Ir a los botes salvavidas" },
          props: [["tanque", -5.6, -6], ["generador", 5.8, -7], ["tuberia", 6.8, 3, 1.57], ["caja", -5.8, 7], ["visceras", 0, 0], ["cadaver", 2, 4, 1, "zombi"], ["colgado", -2, -3, 0, "zombi"]],
          puntos: [
            { x: 2, z: 4, nombre: "Alan Droney", texto: "Tu compañero de The Connections. Se ha disparado en la cabeza antes de convertirse. La mitad de su cara está en la pared. Te deja su munición.", requerido: true, accion: { objetos: { municion: 18 } } },
            { x: -5.8, z: 7, nombre: "Taquilla", texto: "Una hierba mezclada y un spray.", accion: { objetos: { hierba_mixta: 1, spray: 1 } } }
          ],
          enemigos: [{ id: "moldeado", x: -2, z: -4 }, { id: "moldeado", x: 3, z: -5 }, { id: "moldeado", x: 0, z: -8 }] },
        { tipo: "encuentro", enemigo: "eveline", modo: "machaca", veces: 22, tiempo: 5, dano: 40, boton: "¡RESISTE!",
          texto: "Eveline entra en tu mente. Ves a Ethan. Ves un hogar. Ves una niña en la mesa. «Quédate conmigo, mamá». Resiste o te quedarás dentro de su cabeza para siempre.",
          exito: "Te arrancas de su control a gritos. Te arañas los brazos hasta sangrar para sentir algo tuyo. El barco se hunde. Llegas a un bote.",
          fallo: "Te quedas dentro de su sueño demasiado tiempo. Cuando despiertas, tienes moho bajo las uñas y no recuerdas una hora.",
          muerte: "Te quedaste en el sueño de Eveline. Tu cuerpo siguió moviéndose. Tú no." },
        { tipo: "narracion", lineas: [
          "El Annabelle naufraga en el pantano de Dulvey, Luisiana. Una familia que pasaba por allí, los Baker, os encuentra a ti y a la niña.",
          "Durante tres años, Eveline convierte a los Baker en sus marionetas. Y a ti, en su madre.",
          "Grabas un vídeo para Ethan en tus momentos de lucidez: «Ethan, no vengas». Sabes que vendrá. Siempre viene.",
          "Cuando lo veas cruzar la puerta, Eveline te obligará a cortarle la mano. Y tú lo harás."
        ] }
      ]
    },

    /* ======================================================================
     *  CHRIS REDFIELD · NOT A HERO
     * ==================================================================== */
    {
      id: "chris",
      protagonista: "chris",
      titulo: "No soy un héroe",
      resumen: "Ethan y Mia están a salvo. Pero Lucas Baker escapó, y trabaja para The Connections. Con la nueva Umbrella, ahora aliada de la B.S.A.A., entras en las minas de sal a por él.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Julio de 2017. Ethan y Mia están a salvo en el helicóptero. Pero Lucas Baker ha huido a las minas de sal bajo la finca.",
          "Lucas no estaba controlado por Eveline. Lo hacía todo por gusto. Y vendía los datos a The Connections.",
          "Te acompaña un escuadrón de la nueva Umbrella, la «azul», la que dice haber cambiado. Tú no te lo crees del todo.",
          "En la entrada de la mina, el primer soldado pisa algo. Se oye un clic. Luego, nada de él."
        ] },
        { tipo: "chat", titulo: "Escuadrón Umbrella · radio", guion: [
          { de: "lucas", t: "¡Hola, hola! ¡Chris Redfield en mi casita! Mamá estaría tan contenta... si no la hubieran matado." },
          { de: "lucas", t: "He capturado a tus amiguitos de Umbrella. Están por la mina. Algunos enteros." },
          { opciones: [
            { t: "Lucas, ríndete y saldrás vivo.", resp: [{ de: "lucas", t: "¿Rendirme? Ja. Yo ya gané. The Connections tiene mis datos. Ahora solo me estoy divirtiendo." }] },
            { t: "Voy a por ti, Lucas.", marca: "re7_chris_rabia", resp: [{ de: "lucas", t: "¡Así me gusta! ¡Juguemos al escondite! Cuento hasta tres: uno... dos... ¡BOOM!", efecto: "temblor" }] }
          ] },
          { de: "soldado", t: "Capitán Redfield... me ha cortado las piernas... estoy en el túnel B... por favor..." }
        ] },
        { tipo: "explorar", titulo: "Minas de sal", imagen: "img/escenarios/re7_casa_vieja.webp", escenario: "mina", ancho: 16, fondo: 24, sangre: 5,
          descripcion: "Galerías de sal blanca, lámparas de minero y cuerpos de soldados de Umbrella colgados como adornos de Navidad. Lucas ha dejado una nota junto a una trampa.",
          salida: { x: 0, z: -12, texto: "Desactivar la trampa de Lucas" },
          props: [
            ["pilar", -4, -6], ["pilar", 4, -6], ["pilar", -4, 4], ["pilar", 4, 4], ["colgado", 0, 0, 0, "soldado"], ["colgado", -2, -8, 0, "soldado"],
            ["caja", 6.8, 9], ["barril", -6.8, 9], ["escombros", 6, -9], ["pintada", -7.95, 0, 1.57, "JAJAJA"]
          ],
          puntos: [
            { x: 0, z: -10, nombre: "Nota junto a la sierra", texto: "Una nota con la letra de Lucas, sujeta con la lengua de un soldado clavada a la pared.", requerido: true, accion: { documento: "acertijo_lucas" } },
            { x: -6, z: 0, nombre: "Soldado del túnel B", prop: ["cadaver", 1.57, "soldado"], texto: "El soldado de la radio. Le han serrado las piernas a la altura de las rodillas. Se desangró pidiendo ayuda. Munición en su chaleco.", requerido: true, accion: { objetos: { municion: 20 } } },
            { x: 6.6, z: 7.6, nombre: "Caja de suministros", texto: "Spray, hierbas y una cinta de tinta.", accion: { objetos: { spray: 1, hierba_verde: 1, cinta: 1 } } },
            { x: 4, z: -3, nombre: "Pared de sal", texto: "¡La sal se agrieta y sale un Moldeado cubierto de cristales!", accion: { susto: "moldeado", dano: 15, muerte: "El Moldeado de sal te arrastró dentro de la pared. Te encontraron conservado en salazón meses después.", aparecen: [{ id: "moldeado", x: 3, z: -1 }] } }
          ],
          enemigos: [{ id: "moldeado", x: -2, z: -3 }, { id: "moldeado", x: 2, z: -7 }] },
        { tipo: "puzzle", id: "re7_chris_lucas", ui: "texto",
          titulo: "La trampa de Lucas",
          enunciado: "«Soy tan frágil que, si dices mi nombre, me rompes». Escribe la respuesta antes de que la sierra suba.",
          pista: "Si lo nombras, lo rompes: el silencio.",
          placeholder: "Respuesta" },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "moldeado", modo: "esquiva", rondas: 4, velocidad: 1.4, dano: 40,
          texto: "Un Moldeado gordo, hinchado como un globo de bilis, bloquea la galería. Vomita ácido negro. Si revienta cerca de ti, te deshace la piel.",
          exito: "Lo esquivas y le disparas desde lejos. Revienta y baña la galería de ácido. La sal se tiñe de negro.",
          fallo: "Te salpica el ácido en el brazo. La manga y la piel se derriten juntas. Te vendas y sigues.",
          muerte: "El Moldeado gordo te explotó encima. Te derretiste hasta los huesos." },
        { tipo: "explorar", titulo: "Laboratorio de Lucas", imagen: "img/escenarios/re7_pasillo.webp", escenario: "sotano", ancho: 16, fondo: 20, sangre: 7, matar: true,
          descripcion: "Monitores, cables, cámaras y soldados de Umbrella atados a sillas con la cabeza abierta. Lucas lo graba todo. Encuentra su informe para The Connections.",
          salida: { x: 0, z: -10, texto: "Ir a por Lucas" },
          props: [
            ["consola", -4, -8], ["consola", 4, -8], ["silla", -4, 2, 0.4], ["silla", 4, 2, -0.4], ["camilla", 0, 4, 1.57, "soldado"],
            ["jaula", -6, 7, 0, "soldado"], ["visceras", 0, 0], ["pintada", 0, -9.95, 0, "SONRÍE A LA CÁMARA"]
          ],
          puntos: [
            { x: -4, z: -7, nombre: "Ordenador de Lucas", texto: "Un correo enviado. Lucas se cree muy listo.", requerido: true, accion: { documento: "informe_connections" } },
            { x: -4, z: 2.4, nombre: "Soldado atado", texto: "Le han abierto el cráneo y le han metido electrodos en el cerebro. Cada vez que Lucas pulsa un botón, el soldado ríe.", accion: { sangre: true } },
            { x: 6, z: 6, nombre: "Armario de armas", prop: ["archivador", -1.57], texto: "Munición de Umbrella y un spray.", accion: { objetos: { municion: 20, spray: 1 } } }
          ],
          enemigos: [{ id: "moldeado", x: -3, z: -4 }, { id: "moldeado", x: 3, z: -5 }, { id: "moldeado", x: 0, z: -2 }, { id: "moldeado", x: -5, z: -7 }] },
        { tipo: "encuentro", enemigo: "lucas", modo: "machaca", veces: 24, tiempo: 6, dano: 45, boton: "¡DISPARA AL OJO!",
          texto: "Lucas se inyecta el moho que le queda. Su cuerpo se hincha, se le abre un ojo enorme en el pecho y le crecen brazos de moho. «¡Esto no es justo! ¡YO GANÉ!».",
          exito: "Le revientas el ojo del pecho. Lucas se cristaliza en moho y se rompe en pedazos. Te llevas su cabeza de cristal como prueba.",
          fallo: "Un brazo de moho te parte la nariz. Disparas medio ciego. El ojo revienta. Lucas se rompe como un jarrón.",
          muerte: "Lucas te absorbió y te convirtió en su nueva marioneta. La grabó y la subió a su canal." },
        { tipo: "narracion", si: "re7_chris_rabia", lineas: [
          "Lucas muere convertido en una estatua de moho. Le rompes la cara de una patada. No te sientes mejor.",
          "Fuera, el sol de Luisiana quema. Un soldado de Umbrella te pregunta si eres un héroe. «No», dices. «No soy un héroe»."
        ] },
        { tipo: "narracion", siNo: "re7_chris_rabia", lineas: [
          "Lucas muere convertido en una estatua de moho. Le cierras los ojos, aunque no lo merezca.",
          "Fuera, el sol de Luisiana quema. Un soldado de Umbrella te pregunta si eres un héroe. «No», dices. «Solo hago mi trabajo»."
        ] },
        { tipo: "narracion", lineas: [
          "En el helicóptero, recibes un informe: The Connections tiene una nueva arma basada en el moho. Y una mujer al mando: Miranda.",
          "Faltan tres años para que vuelvas a ver a Ethan Winters. Y la próxima vez, tendrás que dispararle a su mujer."
        ] }
      ]
    }
  ]
});
