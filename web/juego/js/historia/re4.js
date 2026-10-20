/* ============================================================================
 *  ARCHIVO III · RESIDENT EVIL 4 (2004) — Leon S. Kennedy · Ada Wong
 *  Soluciones: Puzzles.java (re4, re4_leon_castillo, re4_ada_wesker)
 * ========================================================================== */

"use strict";

Object.assign(DOCUMENTOS, {
  nota_luis: {
    titulo: "Nota arrugada de Luis Sera",
    estilo: "papel",
    texto: `Amigo:

Antes de que me encuentren, escondí la muestra donde nadie mira.
Mis antiguos colegas de Umbrella pagarían cualquier cosa por ella.
Bajo la iglesia la Plaga duerme, esperando un huésped.
Ashley no tiene mucho tiempo: el parásito crece dentro de ella.
Recuerda: la palabra está donde empieza cada línea.

— L.S.`
  },
  leyenda_castillo: {
    titulo: "Pergamino de la familia Salazar",
    estilo: "papel",
    texto: `Ocho generaciones de Salazar han guardado este castillo.
Ocho generaciones han mantenido encerrados a Los Iluminados...
hasta que el pequeño Ramón abrió la puerta al Lord Saddler.

Para cruzar al ala del castellano, las tres bestias de piedra
deben despertar en el orden de su leyenda:

El halcón se alza el primero, con el alba.
El lobo aúlla al mediodía, cuando el sol quema.
La serpiente repta la última, en la oscuridad.

La cabra es el animal del sacrificio. No despierta.
Se degüella.`
  },
  notas_regenerador: {
    titulo: "Notas de laboratorio: Regenerador",
    estilo: "informe",
    texto: `PROYECTO REGENERADOR · ISLA DE LOS ILUMINADOS

El sujeto regenera cualquier extremidad amputada en segundos.
Disparos en la cabeza, el torso o las piernas: inútiles.
Se le han amputado los dos brazos 14 veces. Crecen de nuevo.

Ruido característico: respiración asmática, sibilante.
Si lo oyes y no lo ves, ya está a tu espalda.

Debilidad: las Plagas parasitarias de su interior. Un número
suficiente de impactos acaba matándolo. Gasta munición.
Mucha munición.

Personal muerto esta semana: 7. Todos abrazados por él.
Al abrazarte, te muerde la cara hasta llegar al hueso.`
  },
  correos_wesker: {
    titulo: "Correos de Wesker",
    estilo: "email",
    texto: `DE: A.W.
PARA: Ada
ASUNTO: (1) Instrucciones
Recupera la muestra de Plaga dominante antes que Krauser.
Quiero UNO de estos especímenes vivo. Solo uno.

DE: A.W.
PARA: Ada
ASUNTO: (2) Sobre Kennedy
El agente del gobierno está en la isla. Déjalo vivir si quieres.
Tu debilidad por él es tan grande como NUEVE mares.

DE: A.W.
PARA: Ada
ASUNTO: (3) Laboratorio
La puerta del laboratorio de Saddler usa un código. Lo he
cambiado por algo que nunca olvidarás: la ciudad que nos unió.
Piénsalo en NUEVE segundos. Luego en OCHO. Ya me entiendes.

— A.W.
P. D. Las mayúsculas no son casualidad. Nunca lo son.`
  },
  carta_mendez: {
    titulo: "Carta de Bitores Méndez",
    estilo: "sangre",
    texto: `A todos los aldeanos:

El extranjero ha venido a por la hija del presidente.
El Lord Saddler ha dicho que lo traigáis vivo. O lo que quede.

Al que lo atrape le daré su ojo izquierdo para la colección.
Los dos policías que vinieron con él ya están en la hoguera.
Uno todavía gritaba cuando le clavamos la horca.

Sed fuertes. La Plaga os hace fuertes.
Cuando os arranquen la cabeza, ella saldrá a seguir luchando.

— El jefe`
  }
});

HISTORIA.capitulos.push({
  id: "re4",
  juego: "Resident Evil 4",
  titulo: "Los Iluminados",
  anio: "Otoño de 2004",
  lugar: "Una aldea rural de Europa · Castillo · Isla",
  tema: "tema-re4",
  fondoImagen: "img/escenarios/re4.webp",
  variantes: {ada: "ada_re4", wesker: "wesker_re4"},
  rutas: [

    /* ======================================================================
     *  LEON S. KENNEDY
     * ==================================================================== */
    {
      id: "leon",
      protagonista: "leon",
      titulo: "Misión: rescatar a Ashley",
      resumen: "Seis años después de Raccoon City, ahora eres agente del Presidente. Su hija ha sido secuestrada por una secta. Los aldeanos no son zombis: piensan, se organizan... y tienen parásitos.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Seis años después de Raccoon City, Umbrella ha caído. Tú, Leon, sobreviviste al infierno y el gobierno te reclutó.",
          "Tu misión: rescatar a Ashley Graham, la hija del Presidente, secuestrada por una secta: Los Iluminados.",
          "Los dos policías locales que te acompañaban ya no contestan. Ves humo en la plaza de la aldea.",
          "Los aldeanos no son zombis. Hablan. Trabajan. Te miran. Y en sus nucas se retuerce un parásito: Las Plagas."
        ] },
        { tipo: "chat", titulo: "Enlace · Hunnigan", guion: [
          { de: "hunnigan", t: "Leon, ¿me recibes? Los policías locales que te acompañaban han perdido el contacto." },
          { opciones: [
            { t: "Están muertos. Los aldeanos han quemado a uno en una hoguera.", resp: [{ de: "hunnigan", t: "...Entendido. Ten cuidado. Te enviaremos refuerzos en cuanto podamos." }], efecto: "sangre" },
            { t: "Aquí nadie es muy hospitalario, Hunnigan.", resp: [{ de: "hunnigan", t: "Ahórrate las bromas. Hay movimiento hostil en tu posición." }] }
          ] },
          { de: "hunnigan", t: "Un contacto local, Luis Sera, ex investigador de Umbrella, podría ayudarte. Te ha dejado algo en la aldea." },
          { de: "luis", t: "Hola, amigo. Soy Luis. Esa gente me ató y casi me inyecta... bueno, cosas. Te dejé una nota en el granero. Léela bien." },
          { de: "luis", t: "Escondí una muestra de la Plaga dominante en una caja. La contraseña está en la nota, escrita de una forma... curiosa." }
        ] },
        { tipo: "explorar", titulo: "La plaza de la aldea", imagen: "img/escenarios/re4_plaza.webp", escenario: "aldea", ancho: 22, fondo: 28, sangre: 5,
          descripcion: "Una hoguera, la campana de la iglesia y aldeanos con horcas, hoces y hachas. «¡Un forastero!». Encuentra la nota de Luis en el granero... y no te dejes rodear.",
          salida: { x: 0, z: -14, texto: "Ir a la iglesia" },
          props: [
            ["hoguera", 0, 0, 0, "zombi"], ["casa", -7.5, -7], ["casa", 7.5, 6, 1.57], ["casa", -7.5, 8, 3.14], ["arbol", 9, -10], ["arbol", -9.5, -1],
            ["arbol_seco", 4, 11], ["barril", 3.5, -4], ["barril", 4.2, -3.4], ["valla", 6, -11], ["colgado", -3, -11, 0, "zombi"], ["caja", -4, 4]
          ],
          puntos: [
            { x: -3.6, z: 11.5, nombre: "Granero", prop: ["caja", 0.3], texto: "Entre el heno, una nota arrugada con la letra de Luis.", requerido: true, accion: { documento: "nota_luis" } },
            { x: 0, z: 1.2, nombre: "La hoguera", texto: "Un policía atado a una estaca, aún humeante. La piel se le despega como papel quemado. Le clavaron una horca en el pecho antes de prenderle fuego. Huele a cerdo asado.", accion: { sangre: true } },
            { x: 7.5, z: 3.6, nombre: "Casa del jefe", texto: "Una carta clavada en la puerta con un cuchillo. Y un ojo humano clavado en el mismo cuchillo.", requerido: true, accion: { documento: "carta_mendez", aparecen: [{ id: "salvador", x: 5, z: -6, muerte: "La motosierra del Dr. Salvador te separó la cabeza del cuerpo. Los aldeanos se la pasaron como un balón.", ataque: "¡BRRRAAAMMM! La motosierra te muerde la carne." }] } },
            { x: 4, z: -3.8, nombre: "Barril", texto: "Lo rompes de una patada: una hierba verde y munición.", accion: { objetos: { hierba_verde: 1, municion: 10 } } },
            { x: -7.5, z: -4.5, nombre: "Ventana de la casa", texto: "¡Un aldeano salta por la ventana con una hoz! «¡Te voy a matar!». Te corta la mejilla.", accion: { susto: "ganado", dano: 12, muerte: "La hoz te abrió el cuello de lado a lado. Los aldeanos aplaudieron." } },
            { x: -9.5, z: 4, nombre: "El hombre de la capucha", texto: "«¿Qué vas a comprar, extranjero?». Te vende munición y una cinta de tinta... aceptando tus últimas pesetas.", accion: { objetos: { cinta: 1, municion: 15 } } }
          ],
          npcs: [
            { id: "comerciante", x: -10, z: 5.5, lineas: ["¿Qué vas a comprar, extranjero?", "Ehh-heh-heh. ¡Gracias!", "Tengo cosas muy raras, extranjero. Y muy caras.", "No vayas a la iglesia sin munición, extranjero. Créeme."] }
          ],
          enemigos: [
            { id: "ganado", x: -3, z: 2 }, { id: "ganado", x: 4, z: 3 }, { id: "ganado", x: -5, z: -4 }, { id: "ganado", x: 2, z: -8 }, { id: "ganado", x: 7, z: -2 }
          ] },
        { tipo: "puzzle", id: "re4", ui: "texto",
          titulo: "La caja de Luis",
          enunciado: "Una caja de madera con un candado de letras. ¿Cuál es la palabra? Lee la nota de Luis en tus ARCHIVOS.",
          pista: "Luis dice que la palabra está «donde empieza cada línea». Lee la primera letra de cada frase de su nota, de arriba abajo.",
          placeholder: "Palabra secreta" },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "mendez", modo: "esquiva", rondas: 4, velocidad: 1.3, dano: 35,
          texto: "En el granero, Bitores Méndez se quita la camisa. Su columna se parte, sus piernas se separan del tronco y se alza sobre un esqueleto de dos metros. Se cuelga de las vigas como una araña.",
          exito: "Esquivas sus zarpazos y le revientas la columna a tiros. Se desploma sobre el heno en llamas. Te llevas su ojo falso: abre la puerta.",
          fallo: "Su espina dorsal te golpea como un látigo de hueso. Te deja un surco en el pecho. Aun así, cae entre las llamas.",
          muerte: "Méndez te cogió del cuello con su mano gigante y apretó hasta que tus ojos salieron de las cuencas." },
        { tipo: "chat", titulo: "Iglesia de la aldea", guion: [
          { de: "ashley", t: "¿Quién eres? ¡No te acerques! ¡Me han inyectado algo!" },
          { opciones: [
            { t: "Leon Kennedy. Me envía tu padre. Vámonos a casa.", resp: [{ de: "ashley", t: "¿Mi padre? ¿De verdad? Vale... vale. Pero no me sueltes la mano." }] },
            { t: "Tranquila. Ya lo sé. Te sacaremos esa cosa.", marca: "re4_ashley_tranquila", resp: [{ de: "ashley", t: "Tose sangre... yo también. Y a veces oigo una voz en mi cabeza que no es mía." }] }
          ] },
          { de: "saddler", t: "Señor Kennedy. Ahora ella es mía. Y pronto... usted también." },
          { de: "salazar", t: "Jo, jo, jo. Bienvenidos a mi castillo. Que lo disfruten. Es su tumba." }
        ] },
        { tipo: "explorar", titulo: "Castillo de Salazar", imagen: "img/escenarios/re4_castillo.webp", escenario: "castillo", ancho: 16, fondo: 24, sangre: 5,
          descripcion: "Tapices, armaduras y monjes encapuchados con ballestas. Ashley va pegada a ti. Busca el pergamino de la familia Salazar para abrir la puerta de las bestias.",
          salida: { x: 0, z: -12, texto: "Ir a la puerta de las bestias" },
          props: [
            ["pilar", -5, -6], ["pilar", 5, -6], ["pilar", -5, 2], ["pilar", 5, 2], ["altar", 0, -9], ["cuadro", -3, -11.95, 0, "salazar"], ["cuadro", 3, -11.95, 0, "saddler"],
            ["banco", -5.8, 7, 1.57], ["jaula", 6, 8, 0, "zombi"], ["visceras", 1, 0], ["colgado", 0, 5, 0, "carne"]
          ],
          puntos: [
            { x: -6.4, z: -2, nombre: "Atril de la biblioteca", prop: ["estanteria", 1.57], texto: "Un pergamino con el escudo de los Salazar.", requerido: true, accion: { documento: "leyenda_castillo" } },
            { x: 6, z: 6.6, nombre: "La jaula", texto: "Dentro hay un hombre al que le han arrancado la piel de la espalda en tiras. Aún respira. Te suplica que le mates. La Plaga sale de su boca y te escupe.", accion: { susto: "monje", dano: 10, muerte: "La Plaga saltó de la jaula a tu boca. Notaste cómo se agarraba a tu columna." } },
            { x: 0, z: -8.2, nombre: "Cáliz del altar", texto: "Lleno de sangre caliente y una lengua. Detrás, munición y una hierba.", accion: { objetos: { municion: 14, hierba_verde: 1 } } },
            { x: 6.8, z: -4, nombre: "Armadura", texto: "¡La armadura se mueve! Dentro hay una Plaga que la mueve como una marioneta. Te golpea con la maza.", accion: { susto: "monje", dano: 12, muerte: "La armadura te aplastó la cabeza con una maza de veinte kilos.", aparecen: [{ id: "monje", x: 4, z: -2, vida: 4 }] } }
          ],
          npcs: [
            { id: "ashley", x: -1.5, z: 9, sigue: true, dispara: false, lineas: ["¡Leon! ¡No me dejes sola aquí!", "Ese enano del sombrero me da más miedo que los monstruos.", "Me duele... algo se mueve dentro de mí.", "Mi padre te va a dar una medalla. O dos."] }
          ],
          enemigos: [
            { id: "monje", x: -2, z: -3, vida: 3, vel: 1.4, dano: 18 }, { id: "monje", x: 3, z: -5, vida: 3, vel: 1.4, dano: 18 }, { id: "monje", x: 0, z: 0, vida: 3, vel: 1.4, dano: 18 }
          ] },
        { tipo: "puzzle", id: "re4_leon_castillo", ui: "orden", huecos: 3,
          titulo: "La puerta de las tres bestias",
          enunciado: "Tres pedestales con bestias de piedra. Despiértalas en el orden de la leyenda de los Salazar.",
          opciones: [
            { id: "HALCON", t: "Halcón", icono: "🦅" }, { id: "LOBO", t: "Lobo", icono: "🐺" },
            { id: "SERPIENTE", t: "Serpiente", icono: "🐍" }, { id: "CABRA", t: "Cabra", icono: "🐐" }
          ],
          danoFallo: 12, muerte: "Una cuchilla de péndulo te partió por la mitad. Ashley gritó durante una hora.",
          pista: "Halcón (alba), lobo (mediodía), serpiente (oscuridad). La cabra no despierta." },
        { tipo: "encuentro", enemigo: "verdugo", modo: "esquiva", rondas: 4, velocidad: 1.35, dano: 40,
          texto: "Salazar te tira por una trampilla. Abajo te espera su guardaespaldas, el Verdugo: una cola con aguijón de hueso y un caparazón que no atraviesan las balas.",
          exito: "Esquivas su aguijón y lo congelas con nitrógeno líquido. Lo revientas a tiros como si fuera de cristal.",
          fallo: "El aguijón te atraviesa el muslo y te levanta del suelo. Te sueltas desgarrándote la carne. Lo congelas por fin.",
          muerte: "La cola del Verdugo te atravesó la garganta y te sacó la lengua por el agujero." },
        { tipo: "maquina" },
        { tipo: "explorar", titulo: "Isla · Laboratorio de Saddler", imagen: "img/escenarios/re4_isla.webp", escenario: "laboratorio", ancho: 18, fondo: 22, sangre: 6, matar: true,
          descripcion: "Han vuelto a llevarse a Ashley. Este laboratorio huele a desinfectante y a algo que respira con asma. Lee las notas antes de que te encuentren los Regeneradores.",
          salida: { x: 0, z: -11, texto: "Ir a la sala de Krauser" },
          props: [
            ["capsula", -6.5, -6, 0, "regenerador"], ["capsula", 6.5, -6, 0, "regenerador"], ["camilla", -4, 5, 0.4, "zombi"], ["camilla", 4, 5, -0.4, "ganado"],
            ["mesa", 0, -3], ["generador", 7.8, 8.6], ["estanteria", -8.7, 0, 1.57], ["visceras", 3, 0]
          ],
          puntos: [
            { x: 0, z: -2.6, nombre: "Informe del laboratorio", texto: "Notas sobre el Regenerador. La letra se vuelve más temblorosa al final.", requerido: true, accion: { documento: "notas_regenerador" } },
            { x: -4, z: 5.4, nombre: "Camilla de disección", texto: "Un soldado de los Iluminados abierto en canal. Dentro, la Plaga aún se retuerce entre sus pulmones. Munición en su chaleco.", accion: { objetos: { municion: 18 } } },
            { x: 7.6, z: 0, nombre: "Botiquín", prop: ["archivador", -1.57], texto: "Spray y hierbas mezcladas.", accion: { objetos: { spray: 1, hierba_mixta: 1 } } }
          ],
          npcs: [],
          enemigos: [
            { id: "regenerador", x: -3, z: -6, vida: 9, vel: 0.75, dano: 35, rango: 10, muerte: "El Regenerador te abrazó y te mordió la cara hasta llegar al cráneo. Seguía respirando con asma mientras masticaba." },
            { id: "regenerador", x: 3, z: -7, vida: 9, vel: 0.75, dano: 35, rango: 10 },
            { id: "ganado", figura: "jo", x: 0, z: -9, vida: 3 }
          ] },
        { tipo: "encuentro", enemigo: "krauser", modo: "machaca", veces: 22, tiempo: 5, dano: 40, boton: "¡CUCHILLO!",
          texto: "Jack Krauser. Tu antiguo compañero, el que diste por muerto. Su brazo izquierdo muta en una cuchilla de hueso de un metro. «¿Te acuerdas de mí, camarada?». Cuchillo contra cuchillo.",
          exito: "Paras cada tajo y le hundes el cuchillo bajo la barbilla, hasta el mango. Krauser muere con una sonrisa de dientes ensangrentados.",
          fallo: "Su cuchilla te abre el antebrazo hasta el hueso. Le clavas el cuchillo en el ojo con la otra mano. Cae.",
          muerte: "Krauser te abrió de la garganta al ombligo. «Siempre fuiste el blando», te dijo mientras te vaciabas." },
        { tipo: "chat", titulo: "Isla · comunicador robado", guion: [
          { de: "ashley", t: "¿Leon? ¡LEON! Estoy en el altar de Saddler. Hay cosas que se mueven bajo mi piel. ¡Sácame de aquí!" },
          { de: "saddler", t: "La Plaga dentro de ti, agente, ya me obedece. Sólo tienes que dejar de resistirte." },
          { opciones: [
            { t: "Ya he oído discursos peores. En Raccoon City.", resp: [{ de: "saddler", t: "Raccoon City fue un juguete de Umbrella. Lo mío es una religión." }] },
            { t: "Ashley, aguanta. Voy a sacarte la Plaga.", resp: [{ de: "ashley", t: "¡Date prisa! Noto cómo me muerde por dentro..." }] }
          ] },
          { de: "luis", t: "Leon... tengo... la muestra. Saddler me ha... atravesado. Toma. Es... para Ashley. Y para ti.", efecto: "sangre" },
          { de: "ada", t: "Siempre metido en líos, Leon. Te dejo un regalo: un lanzacohetes. Úsalo bien.", efecto: "temblor" }
        ] },
        { tipo: "encuentro", enemigo: "saddler", modo: "esquiva", rondas: 4, velocidad: 1.4, dano: 40,
          texto: "Saddler se transforma: un ojo gigante en el centro de una araña de patas de carne de diez metros. Las patas tienen ojos. Los ojos te miran. Dispárales y remata con el cohete de Ada.",
          exito: "Revientas los ojos de sus patas uno a uno y le metes el cohete en el ojo central. Saddler explota en una lluvia de tejido caliente que te empapa de pies a cabeza.",
          fallo: "Una pata te aplasta contra el suelo y te rompe dos costillas. Disparas el cohete desde el suelo. Saddler revienta encima de ti.",
          muerte: "Saddler te atravesó con una pata y te llevó a su boca. Ashley lo vio todo." },
        { tipo: "narracion", lineas: [
          "Con un láser de quirófano os arrancáis las Plagas. La de Ashley se retuerce en el suelo como un gusano de sangre de un palmo. La pisas.",
          "Luis muere sujetando la muestra de ámbar hasta el final. «Por fin hago algo bueno», dice.",
          "Ada se lleva la muestra y se marcha en helicóptero, como siempre. Te tira las llaves de una moto acuática.",
          "Escapáis mientras la isla explota detrás de vosotros. Ashley pregunta si te apetece «un tour por la casa». Le dices que no."
        ] }
      ]
    },

    /* ======================================================================
     *  ADA WONG · CAMINOS SEPARADOS
     * ==================================================================== */
    {
      id: "ada",
      protagonista: "ada",
      titulo: "Caminos separados",
      resumen: "Trabajas para Wesker. Tu objetivo: la muestra de Plaga dominante. Leon no debe saber nada. Krauser te vigila. Y el único aliado que tienes, Luis, tiene los días contados.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Eres Ada Wong. Espía. Mercenaria. Nadie sabe para quién trabajas. A veces, ni tú.",
          "Esta vez el cliente es Albert Wesker, que sobrevivió a la mansión Spencer y quiere construir su propia Umbrella.",
          "El objetivo: una muestra de la Plaga dominante, el parásito que Lord Saddler usa para controlar a sus fieles.",
          "Llegas a la aldea de noche. Por los prismáticos ves a Leon Kennedy, rodeado de aldeanos. Sonríes. Seis años y sigue metiéndose en líos."
        ] },
        { tipo: "chat", titulo: "Canal cifrado · A.W.", guion: [
          { de: "wesker", t: "Ada. Krauser también está en la isla. Trabaja para mí... de momento. No le des la espalda." },
          { de: "wesker", t: "Y no te distraigas con el agente Kennedy. Sé que tienes... debilidad." },
          { opciones: [
            { t: "Mi única debilidad es el dinero, Wesker.", marca: "re4_ada_wesker_leal", resp: [{ de: "wesker", t: "Eso espero. Por tu bien." }] },
            { t: "Lo que yo haga con Leon no es asunto tuyo.", resp: [{ de: "wesker", t: "Todo es asunto mío, Ada. Siempre." }] }
          ] },
          { de: "luis", t: "¿La señorita del vestido rojo? Wesker me dijo que vendrías. Tengo la muestra escondida. Necesito salir de aquí vivo." }
        ] },
        { tipo: "explorar", titulo: "La aldea de noche", imagen: "img/escenarios/re4_granja.webp", escenario: "aldea", ancho: 22, fondo: 26, sangre: 6, ambiente: { ambiente: 0.35, niebla: "#07080a", cielo: "#0a0c10" },
          descripcion: "Antorchas, perros sin piel y aldeanos que rezan a gritos. Luis te dejó una nota en el escondite de la herrería. Y algo enorme está encadenado detrás del granero.",
          salida: { x: 0, z: -13, texto: "Ir al castillo" },
          props: [
            ["casa", -7.5, -6], ["casa", 7.5, 5, 1.57], ["hoguera", 0, 2], ["arbol", -9, 8], ["arbol", 9, -9], ["arbol_seco", -3, -10],
            ["jaula", 6, -8, 0, "gigante"], ["valla", -6, 10], ["colgado", 2, -6, 0, "zombi"], ["bidon", -2, 8]
          ],
          puntos: [
            { x: -7.5, z: -3.6, nombre: "Herrería", texto: "Bajo el yunque, la nota de Luis. Y un dedo que no es de Luis.", requerido: true, accion: { documento: "nota_luis" } },
            { x: 6, z: -6.6, nombre: "Jaula del Gigante", texto: "Un gigante de tres metros encadenado. Tiene a un aldeano en la mano y se lo está comiendo como si fuera un muslo de pollo. Te ve. Rompe las cadenas.", requerido: true, accion: { susto: "gigante", dano: 10, muerte: "El Gigante te pisó. Una vez. Fue suficiente." } },
            { x: 7.5, z: 2.4, nombre: "Escondite del comerciante", texto: "«Una dama. Qué raro por aquí, extranjera». Munición y una cinta de tinta.", accion: { objetos: { municion: 18, cinta: 1 } } },
            { x: -2, z: 7.6, nombre: "Bidón ardiendo", texto: "Alguien quemó documentos aquí. Queda una hierba verde chamuscada.", accion: { objeto: "hierba_verde", cantidad: 1 } }
          ],
          npcs: [
            { id: "comerciante", x: 8.5, z: 1.5, lineas: ["¿Qué vas a comprar, extranjera?", "Ehh-heh-heh. Las damas pagan igual.", "El gigante tiene un parásito en la espalda. Si lo ves, dispárale ahí."] }
          ],
          enemigos: [
            { id: "ganado", x: -3, z: 0 }, { id: "ganado", x: 3, z: -2 }, { id: "perro", x: 0, z: -7 }, { id: "ganado", x: -5, z: -9 }
          ] },
        { tipo: "encuentro", enemigo: "gigante", modo: "machaca", veces: 22, tiempo: 5, dano: 45, boton: "¡TREPA!",
          texto: "El Gigante te arrincona contra el granero. Una Plaga del tamaño de un perro le sale de la espalda, latiendo. Trepa por su brazo y córtala.",
          exito: "Le subes por el brazo y le cortas la Plaga con el cuchillo. El Gigante cae de rodillas vomitando sangre por la boca y la espalda.",
          fallo: "Te agarra la pierna y te estampa contra el suelo antes de que llegues. Le cortas la Plaga con la clavícula rota.",
          muerte: "El Gigante te cogió con las dos manos y te partió como una barra de pan." },
        { tipo: "explorar", titulo: "Castillo · Biblioteca de Salazar", imagen: "img/escenarios/re4_biblioteca.webp", escenario: "castillo", ancho: 14, fondo: 20, sangre: 4,
          descripcion: "Estanterías hasta el techo y monjes rezando ante una Plaga en un frasco. Wesker te ha enviado varios correos al comunicador: el código del laboratorio está escondido en ellos.",
          salida: { x: 0, z: -10, texto: "Ir al muelle de la isla" },
          props: [
            ["estanteria", -6.2, -6, 1.57], ["estanteria", -6.2, -2, 1.57], ["estanteria", 6.2, -6, -1.57], ["estanteria", 6.2, -2, -1.57],
            ["mesa", 0, 0], ["altar", 0, -8], ["cuadro", 0, -9.95, 0, "salazar"], ["capsula", 5, 6, 0, "monje"], ["sangre", -2, 3, 0, 3]
          ],
          puntos: [
            { x: 0, z: 0.4, nombre: "Comunicador", texto: "Tres correos de Wesker. Siempre tan críptico.", requerido: true, accion: { documento: "correos_wesker" } },
            { x: -4, z: 7, nombre: "Luis", prop: ["silla", 0], texto: "Luis Sera, atado a una silla. Le han arrancado tres uñas. Te sonríe con los dientes llenos de sangre: «Señorita... llega tarde a nuestra cita».", requerido: true, accion: { marca: "re4_ada_luis" } },
            { x: 0, z: -7.2, nombre: "Altar", texto: "Un frasco con una Plaga adulta flotando. Tiene dientes. Detrás, munición de los monjes.", accion: { objetos: { municion: 12, hierba_verde: 1 } } }
          ],
          npcs: [
            { id: "luis", x: -2.5, z: 8, sigue: true, lineas: ["Gracias por la ayuda, señorita. Le debo una cena. O dos.", "La muestra está en el laboratorio de Saddler. Yo os la consigo.", "Wesker... trabajé para Umbrella con él. No te fíes de ese hombre.", "Cuando esto acabe, me voy a Madrid. Tapas y vino. Nada de parásitos."] }
          ],
          enemigos: [
            { id: "monje", x: -2, z: -5, vida: 3, vel: 1.4 }, { id: "monje", x: 2, z: -6, vida: 3, vel: 1.4 }, { id: "monje", x: 0, z: -3, vida: 3, vel: 1.4 }
          ] },
        { tipo: "puzzle", id: "re4_ada_wesker", ui: "codigo", digitos: 4,
          titulo: "Puerta del laboratorio de Saddler",
          enunciado: "Cuatro cifras. Wesker las escondió en sus correos: «las mayúsculas no son casualidad».",
          danoFallo: 5,
          pista: "UNO de estos especímenes, NUEVE mares, NUEVE segundos, OCHO: 1-9-9-8. La ciudad que os unió: Raccoon City, 1998." },
        { tipo: "maquina" },
        { tipo: "chat", titulo: "Laboratorio de la isla", guion: [
          { de: "luis", t: "¡Señorita Wong! ¡La tengo! ¡La muestra de Plaga dominante! Corra, yo..." },
          { sistema: "Un tentáculo atraviesa el pecho de Luis por la espalda. Sale por delante, entre las costillas, con su corazón todavía latiendo enganchado.", efecto: "sangre" },
          { de: "saddler", t: "Gracias por recuperarla, señor Sera. Ya no le necesito." },
          { opciones: [
            { t: "¡Luis!", si: "re4_ada_luis", resp: [{ de: "luis", t: "Ada... dile a Leon... que la muestra... es para él... y para la chica..." }] },
            { t: "Saddler. Te voy a arrancar ese ojo.", resp: [{ de: "saddler", t: "La araña ya tiene a la mosca, señorita. Y la mosca es usted." }] }
          ] },
          { de: "krauser", t: "Ada Wong. Wesker no confía en ti. Y yo tampoco. Ven a la ruina del este. Hablemos como profesionales." }
        ] },
        { tipo: "encuentro", enemigo: "krauser", modo: "esquiva", rondas: 4, velocidad: 1.45, dano: 35,
          texto: "Krauser te espera entre las ruinas. Su brazo muta en un escudo de hueso con una cuchilla. «Wesker me prometió tu muestra. Y tu cabeza, si me apetecía».",
          exito: "Esquivas cada tajo con tu gancho y le revientas el brazo mutado con una granada. Lo dejas sangrando para que Leon lo remate.",
          fallo: "Su cuchilla te abre el costado. El vestido rojo se oscurece. Te escapas con el gancho, pero él también vive.",
          muerte: "Krauser te clavó contra una columna con su brazo de hueso. «Nada personal, Ada»." },
        { tipo: "explorar", titulo: "Isla · Cámara de Saddler", imagen: "img/escenarios/re4_isla.webp", escenario: "laboratorio", ancho: 18, fondo: 22, sangre: 6, matar: true,
          descripcion: "Leon está en el altar luchando contra Saddler. La muestra de ámbar está en la cámara contigua, rodeada de Regeneradores. Mátalos y llévatela.",
          salida: { x: 0, z: -11, texto: "Subir a la grúa sobre el altar" },
          props: [
            ["capsula", -6, -6, 0, "regenerador"], ["capsula", 6, -6, 0, "ganado"], ["consola", 0, -9], ["camilla", -4, 4, 0.4, "luis"],
            ["generador", 7.8, 8.6], ["tanque", -7.8, 8.4], ["visceras", 2, 2]
          ],
          puntos: [
            { x: -4, z: 4.6, nombre: "El cuerpo de Luis", texto: "Lo han traído aquí para diseccionarlo. Le cierras los ojos. En su bolsillo, la muestra de ámbar. «Gracias, Luis».", requerido: true, accion: { marca: "re4_ada_muestra" } },
            { x: 0, z: -8.2, nombre: "Terminal de Saddler", texto: "Datos de la Plaga. Los copias en un disco. Wesker estará contento. Y tú, rica.", requerido: true },
            { x: 7.6, z: 0, nombre: "Armario", prop: ["archivador", -1.57], texto: "Munición y un spray.", accion: { objetos: { municion: 15, spray: 1 } } }
          ],
          enemigos: [
            { id: "regenerador", x: -3, z: -4, vida: 8, vel: 0.8, dano: 35, rango: 10, muerte: "El Regenerador te abrazó y te comió la cara. Tu pintalabios rojo se mezcló con tu sangre." },
            { id: "regenerador", x: 3, z: -5, vida: 8, vel: 0.8, dano: 35, rango: 10 }, { id: "ganado", figura: "jo", x: 0, z: -2 }
          ] },
        { tipo: "encuentro", enemigo: "saddler", modo: "machaca", veces: 20, tiempo: 5, dano: 35, boton: "¡LANZA EL COHETE!",
          texto: "Desde la grúa ves a Leon en el suelo, con Saddler encima. Tienes un lanzacohetes especial. Rompe el cristal de la cabina y lánzaselo.",
          exito: "El lanzacohetes cae a los pies de Leon. Un segundo después, Saddler revienta en una lluvia de carne. Leon mira hacia arriba. Ya te has ido.",
          fallo: "Una pata de Saddler destroza la grúa y caes medio piso. Aun así, el lanzacohetes llega a Leon. Saddler muere.",
          muerte: "Saddler arrancó la cabina de la grúa contigo dentro y la estrujó como una lata de refresco." },
        { tipo: "narracion", lineas: [
          "En el helicóptero, Leon te encañona: «Dame la muestra». Le tiras unas llaves y te vas. Siempre te vas.",
          "Con la muestra de ámbar en el bolsillo, llamas a Wesker. «Misión cumplida». Él te paga. Tú finges que no te importa lo que hará con ella.",
          "Antes de colgar, miras por la ventanilla la isla en llamas. Piensas en Luis y en sus tapas en Madrid. No lloras. Las espías no lloran."
        ] },
        { tipo: "narracion", si: "re4_ada_wesker_leal", lineas: [
          "Cinco años después, en África, la Plaga de esa muestra convertirá a miles de personas en Majini. Wesker te mandará una postal. No la abrirás."
        ] },
        { tipo: "narracion", siNo: "re4_ada_wesker_leal", lineas: [
          "Lo que Wesker no sabe es que la muestra que le has dado está incompleta. La buena, la tienes tú. Nunca se sabe cuándo hará falta un seguro de vida."
        ] }
      ]
    }
  ]
});
