/* ============================================================================
 *  ARCHIVO V · RESIDENT EVIL 6 (2012-2013) — Leon · Chris · Jake · Ada
 *  Soluciones: Puzzles.java (re6, re6_chris_carla, re6_jake_wesker, re6_ada_clones)
 * ========================================================================== */

"use strict";

Object.assign(DOCUMENTOS, {
  discurso_benford: {
    titulo: "Discurso no pronunciado del Presidente Benford",
    estilo: "informe",
    texto: `«Ciudadanos de los Estados Unidos:

Hace quince años, nuestro gobierno destruyó Raccoon City
con un misil y os dijo que fue un accidente nuclear.
Fue una mentira. Yo formé parte de esa mentira.

Umbrella Corporation creó un virus que convirtió a
cien mil personas en monstruos. Y algunos miembros de este
gobierno lo sabían, y lo financiaron.

Esta noche voy a revelarlo todo. Los nombres. Las cuentas.
Empezando por el de mi asesor de seguridad nacional,
Derek C. Simmons, y su organización: La Familia.»

[El texto termina con una mancha de sangre en forma de mano.]`
  },
  nota_artificiero: {
    titulo: "Nota de un artificiero muerto",
    estilo: "sangre",
    texto: `Si lees esto, yo ya no estoy.

El detonador de Neo-Umbrella tiene cuatro cables:
ROJO, AZUL, VERDE y AMARILLO. Hay que cortarlos TODOS,
en el orden correcto, o volamos todos por los aires.

· El AMARILLO va SIEMPRE el último.
· NUNCA empieces por el ROJO.
· El AZUL va justo detrás del VERDE, sin nada en medio.

Tengo frío. Ya no siento las piern`
  },
  diario_deborah: {
    titulo: "Diario de Deborah Harper",
    estilo: "papel",
    texto: `Helena dice que vendrá a buscarme. Me lo promete cada noche
por teléfono. Pero Simmons dice que si ella no le obedece,
yo seré «la siguiente fase».

Hoy me han inyectado algo. Me pica la espalda. Las enfermeras
me miran con asco. Una ha vomitado al verme sin camisa.

Tengo algo debajo de la piel de los omóplatos. Se mueve
cuando duermo. Creo que son... alas. O patas.

Helena, si lees esto: no me salves. Mátame.
Hazlo antes de que yo te mate a ti.`
  },
  informe_edonia: {
    titulo: "Informe de bajas · Edonia",
    estilo: "informe",
    texto: `B.S.A.A. · EQUIPO ALFA · REPÚBLICA DE EDONIA

Operación contra la célula bioterrorista de «Ada Wong».

Bajas confirmadas: 74 de 75.
Superviviente: capitán Chris Redfield (amnesia severa).

Causa de las bajas: la sospechosa inyectó el virus C a los
miembros del equipo con un dispositivo de jeringas. Los
soldados se transformaron en crisálidas en cuestión de
minutos. Al eclosionar, se devoraron entre sí.

Nota personal del teniente Nivans:
«El capitán no recuerda nada. Bebe en un bar de Edonia.
Le encontraré. Le traeré de vuelta. Se lo debo a Finn.»`
  },
  proyecto_ada: {
    titulo: "Expediente secreto · Proyecto Ada",
    estilo: "email",
    texto: `LA FAMILIA · NIVEL DE ACCESO: D. C. SIMMONS

Proyecto: recrear a Ada Wong, la mujer que el Sr. Simmons ama.

Voluntaria: la investigadora de Neo-Umbrella con más talento
de la división. Nombre real: CARLA RADAMES.
Procedimiento: virus C + cirugía + reprogramación de memoria.

Resultado: la sujeto adquiere el rostro, la voz y los recuerdos
de Ada Wong. Efecto secundario no previsto: odio absoluto hacia
D. C. Simmons y deseo de destruir el mundo entero para vengarse.

Recomendación: eliminar. El Sr. Simmons se niega.`
  },
  expediente_jake: {
    titulo: "Expediente: Jake Muller",
    estilo: "informe",
    texto: `NEO-UMBRELLA · SUJETO DE INTERÉS PRIORITARIO

Nombre: Jake Muller. Edad: 20 años. Mercenario.
Madre: ciudadana de Edonia, fallecida de enfermedad (pobreza).
Padre: nunca conoció a su hijo. Murió en 2009 en un volcán
de África. Apellido: el mismo que la palabra clave de este
panel. Nombre de pila: Albert.

La sangre del sujeto contiene anticuerpos contra el virus C,
heredados del virus Uroboros de su padre.
Valor estimado de su sangre: incalculable.
El sujeto ha pedido 50 millones de dólares. Ja.`
  },
  bitacora_clones: {
    titulo: "Bitácora de clonación de Carla",
    estilo: "papel",
    texto: `Lotes de clones de «Ada» fallidos esta semana:

LOTE A ... 3 fallidos (se derritieron dentro de la cápsula).
LOTE B ... 1 fallido (despertó, se arrancó la cara a uñas).
LOTE C ... 9 fallidos (fusionados en una sola masa).

Código de la cámara de clonación: los fallidos de cada lote,
en orden alfabético de lote. Me divierte. Simmons lo odia.

Cada clon que muere tiene mi cara. Y la suya, la de ella,
la de la verdadera Ada. Algún día la encontraré.
Y me pondré su piel encima de la mía.

— C.`
  },
  diario_carla: {
    titulo: "Grabación de Carla Radames",
    estilo: "sangre",
    texto: `«Hola, Ada. Sé que estás escuchando.

Yo era Carla. Era brillante. Simmons me convirtió en ti
porque no podía tenerte. Me abrió la cara y me puso la tuya.
Me arrancó los recuerdos y me metió los tuyos.

¿Sabes lo que es despertar enamorada de un hombre al que
odias? ¿Sabes lo que es mirarte al espejo y ver a otra?

Por eso voy a destruirlo todo. Su gobierno. Su Familia.
Su mundo. El virus C llegará a todas las ciudades.

Y a ti, mi querida original, te dejaré para el final.»`
  }
});

HISTORIA.capitulos.push({
  id: "re6",
  juego: "Resident Evil 6",
  titulo: "Virus C",
  anio: "Diciembre de 2012 – 29 de junio de 2013",
  lugar: "Tall Oaks · Edonia · Lanshiang, China",
  tema: "tema-re6",
  fondoImagen: "img/escenarios/re6.webp",
  variantes: {leon: "leon_re6", chris: "chris_re6", ada: "ada_re6"},
  rutas: [

    /* ======================================================================
     *  LEON S. KENNEDY (con Helena Harper)
     * ==================================================================== */
    {
      id: "leon",
      protagonista: "leon",
      titulo: "Tall Oaks",
      resumen: "Tu amigo, el Presidente, iba a revelar la verdad sobre Raccoon City. Ahora es un zombi y tienes que dispararle tú. Una agente del Servicio Secreto sabe por qué.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Tall Oaks, 29 de junio de 2013. El presidente Adam Benford, tu amigo, iba a revelar la verdad sobre Raccoon City esta noche.",
          "Nunca llegó a dar el discurso. Lo encuentras en la universidad Ivy, inclinado sobre el cuerpo de su secretaria, comiéndole el estómago.",
          "Levanta la cabeza. Tiene trozos de ella entre los dientes. Te reconoce. No le importa.",
          "Una agente del Servicio Secreto, Helena Harper, te mira temblando. Dice que todo es culpa suya."
        ] },
        { tipo: "explorar", titulo: "Universidad Ivy · Despacho presidencial", imagen: "img/escenarios/re6_universidad.webp", escenario: "oficina", ancho: 14, fondo: 18, sangre: 6, matar: true,
          descripcion: "Moqueta empapada de sangre y el escudo presidencial pisoteado. Lo que fue Adam Benford se tambalea hacia ti. Haz lo que tengas que hacer.",
          salida: { x: 0, z: -9, texto: "Salir hacia la ciudad" },
          props: [
            ["escritorio", 0, -6], ["silla", 0, -5.1, 3.14], ["sofa", -5, 3, 1.57], ["sofa", 5, 3, -1.57], ["estanteria", -6.2, -5, 1.57],
            ["cadaver", 2, -2, 0.7, "zombi"], ["visceras", 2.4, -1.4], ["cuadro", 0, -8.95, 0, "benford"], ["lampara", 5.8, -7]
          ],
          puntos: [
            { x: 0, z: -5.6, nombre: "Escritorio del Presidente", texto: "El discurso que nunca dio, manchado con una huella ensangrentada.", requerido: true, accion: { documento: "discurso_benford" } },
            { x: 2, z: -2, nombre: "La secretaria", texto: "Le han vaciado el abdomen. El collar de perlas se le ha metido dentro de la herida. Benford la quería mucho.", accion: { sangre: true } },
            { x: -5.6, z: 6, nombre: "Maletín del Servicio Secreto", texto: "Munición, un spray y una cinta de tinta.", accion: { objetos: { municion: 18, spray: 1, cinta: 1 } } }
          ],
          npcs: [
            { id: "helena", x: -2, z: 7, sigue: true, lineas: ["Leon... lo siento. Lo siento mucho.", "Simmons me chantajeó. Con mi hermana. Te lo contaré todo.", "Dispárale, Leon. Él no querría ser esto."] }
          ],
          enemigos: [
            { id: "zombi", figura: "benford", x: 0, z: -3, vida: 3, vel: 0.7, alerta: true, remate: "El Presidente Benford cae. Tu amigo. Le cierras los ojos con la mano manchada de su sangre.", muerte: "El Presidente te mordió en la yugular. Murió como vivió: rodeado de su seguridad." },
            { id: "zombi", x: -3, z: -6 }, { id: "zombi", x: 4, z: -7 }
          ] },
        { tipo: "chat", titulo: "Agentes · canal seguro", guion: [
          { de: "helena", t: "Leon... Simmons me chantajeó con mi hermana Deborah. Me obligó a retirar la seguridad del Presidente." },
          { opciones: [
            { t: "Me lo cuentas todo. Ahora. Y luego vamos a por Simmons.", marca: "re6_leon_confia", resp: [{ de: "helena", t: "Te llevaré a la catedral. Allí está la prueba. Y mi hermana Deborah..." }] },
            { t: "Por tu culpa ha muerto el Presidente.", resp: [{ de: "helena", t: "Lo sé. Déjame arreglarlo antes de que me detengas." }] }
          ] },
          { de: "chris", t: "Leon, aquí Chris. Estoy en Lanshiang con Piers. Hay una mujer que se hace llamar Ada Wong detrás del ataque." },
          { de: "piers", t: "Capitán, no se distraiga. Aquí las crisálidas revientan cada minuto." },
          { de: "jake", t: "¿Sois los de la B.S.A.A.? Mi sangre vale 50 millones de dólares. Hablad con mi agente. Ah, no, que no tengo." },
          { de: "sherry", t: "Jake, compórtate. Leon... soy Sherry. ¿Te acuerdas de mí? Ahora trabajo para el gobierno." }
        ] },
        { tipo: "explorar", titulo: "Catedral de Tall Oaks", imagen: "img/escenarios/re6_catacumbas.webp", escenario: "catedral", ancho: 18, fondo: 26, sangre: 6,
          descripcion: "Vidrieras rotas. Bancos volcados. Algo palpita colgado del techo. Bajo el altar está el laboratorio secreto de Simmons. Encuentra lo que dejó el artificiero.",
          salida: { x: 0, z: -13, texto: "Bajar a las catacumbas" },
          props: [
            ["banco", -4, 6], ["banco", 4, 6], ["banco", -4, 3], ["banco", 4, 3], ["banco", -4, 0, 0.3], ["banco", 4, 0],
            ["altar", 0, -9], ["cruz", 0, -12, 0, "benford"], ["pilar", -7, -5], ["pilar", 7, -5], ["pilar", -7, 5], ["pilar", 7, 5], ["colgado", 0, -3, 0, "carne"]
          ],
          puntos: [
            { x: -7.4, z: 9, nombre: "Confesionario", prop: ["archivador", 1.57], texto: "Un artificiero de la B.S.A.A., con la cara mordida, sostiene una nota ensangrentada.", requerido: true, accion: { documento: "nota_artificiero" } },
            { x: 0, z: -3, nombre: "Crisálida del techo", texto: "Un capullo de carne del tamaño de un coche. Dentro se ve una silueta con demasiados brazos. Gotea sangre caliente sobre tu cara.", accion: { sangre: true } },
            { x: 4, z: 0.6, nombre: "Banco volcado", texto: "Una hierba verde y munición. Gracias, quien seas.", accion: { objetos: { hierba_verde: 1, municion: 15 } } },
            { x: -4, z: 0.6, nombre: "Feligrés tendido", texto: "¡Abre los ojos! Se levanta y te muerde la mano hasta el hueso.", accion: { susto: "zombi", dano: 15, muerte: "Los feligreses de Tall Oaks te devoraron en el altar.", aparecen: [{ id: "zombi", x: -2, z: -2 }, { id: "zombi", x: 2, z: -3 }, { id: "zombi", x: 0, z: -6 }] } },
            { x: 0, z: -8.2, nombre: "Altar", texto: "Un cáliz lleno de algo que no es vino. Espeso. Templado. Y un diario de mujer escondido bajo el mantel.", requerido: true, accion: { documento: "diario_deborah" } }
          ],
          npcs: [
            { id: "helena", x: 2, z: 10, sigue: true, lineas: ["Deborah está aquí abajo. Lo sé.", "Esa cosa del techo... no la mires.", "Si mi hermana es... uno de ellos... yo me encargo."] }
          ],
          enemigos: [{ id: "zombi", x: -3, z: 4 }, { id: "zombi", x: 3, z: -1 }] },
        { tipo: "encuentro", enemigo: "deborah", modo: "esquiva", rondas: 4, velocidad: 1.35, dano: 35,
          texto: "En las catacumbas encontráis a Deborah dentro de una crisálida. Se abre. Su espalda revienta en alas de carne y su brazo se convierte en una lanza de hueso. Sigue teniendo la cara de Helena.",
          exito: "Esquivas sus lanzadas. Helena, llorando, le dispara en la cabeza. Deborah cae al abismo mientras dice «gracias».",
          fallo: "La lanza te atraviesa el hombro y te clava contra un ataúd. Helena dispara. Deborah cae al vacío.",
          muerte: "Deborah te atravesó el corazón con su brazo-lanza. Helena tuvo que dispararos a los dos." },
        { tipo: "puzzle", id: "re6", ui: "orden", huecos: 4, tiempoLimite: 75, danoTiempo: 25,
          titulo: "¡Bomba de Neo-Umbrella!",
          enunciado: "Bajo la catedral, el laboratorio de Simmons tiene una bomba. El detonador pita. Corta los cuatro cables en orden. Lee la nota del artificiero.",
          opciones: [
            { id: "ROJO", t: "Rojo", color: "#d62828" },
            { id: "AZUL", t: "Azul", color: "#1d6fd6" },
            { id: "VERDE", t: "Verde", color: "#2ea44f" },
            { id: "AMARILLO", t: "Amarillo", color: "#e0b000" }
          ],
          danoFallo: 15, muerte: "La bomba de Neo-Umbrella os convirtió en una nube roja que salpicó las vidrieras.",
          pista: "Amarillo va al final. El rojo no puede ir primero. Si el azul va JUSTO detrás del verde, la única opción es: verde, azul, rojo, amarillo." },
        { tipo: "maquina" },
        { tipo: "chat", titulo: "Lanshiang · canal abierto", guion: [
          { de: "simmons", t: "Agente Kennedy. Benford era un idealista. El mundo necesita orden. La Familia es orden." },
          { de: "ada", t: "Leon. La mujer que dicen que soy yo no soy yo. Se llama Carla. Y Simmons la creó." },
          { opciones: [
            { t: "Te creo, Ada. Siempre te he creído.", resp: [{ de: "ada", t: "Eres un encanto. Y un idiota. Pero un encanto." }] },
            { t: "Simmons, te voy a arrastrar ante un tribunal.", resp: [{ de: "simmons", t: "Yo soy el tribunal, agente." }] }
          ] },
          { de: "helena", t: "Leon, Simmons se ha inyectado el virus C. Se está... transformando en algo enorme." }
        ] },
        { tipo: "explorar", titulo: "Lanshiang · Mercado de Waterfront", imagen: "img/escenarios/re6_lanshiang.webp", escenario: "ciudad", ancho: 20, fondo: 26, sangre: 6, matar: true,
          descripcion: "Neones, lluvia y una ciudad china infestada. Los J'avo mutan cuando les disparas: les salen patas, alas o escudos. Despeja la calle hasta la torre.",
          salida: { x: 0, z: -13, texto: "Subir a la torre" },
          props: [
            ["coche", -6, 4, 0.4, "#8a2020"], ["coche", 6, -4, -0.3, "#203a8a"], ["coche", -5, -8, 1.3, "ardiendo"], ["caja", 7, 8], ["caja", 7, 9.1],
            ["bidon", -8, -2], ["bidon", 8, 2], ["escombros", 2, -10], ["colgado", 0, 6, 0, "jo"], ["pintada", -9.95, 0, 1.57, "C-VIRUS"]
          ],
          puntos: [
            { x: 7, z: 6.8, nombre: "Puesto de fideos", texto: "Fideos y sangre en el mismo caldo. Munición escondida por un policía chino muerto.", accion: { objetos: { municion: 20, hierba_mixta: 1 } } },
            { x: -5, z: -6, nombre: "Coche en llamas", texto: "Dentro, una familia carbonizada. Los niños aún tienen el cinturón puesto.", accion: { sangre: true } }
          ],
          npcs: [{ id: "helena", x: 2, z: 11, sigue: true, lineas: ["¡A la cabeza, Leon!", "¡Están mutando!", "Por Deborah."] }],
          enemigos: [
            { id: "jo", x: -3, z: 2, vida: 4, vel: 1.6, dano: 20 }, { id: "jo", x: 3, z: 0, vida: 4, vel: 1.6, dano: 20 },
            { id: "jo", x: 0, z: -5, vida: 4, vel: 1.6, dano: 20 }, { id: "jo", x: -4, z: -8, vida: 4, vel: 1.6, dano: 20 }, { id: "zombi", x: 5, z: -9 }
          ] },
        { tipo: "encuentro", enemigo: "simmons", modo: "esquiva", rondas: 5, velocidad: 1.5, dano: 40,
          texto: "Simmons ya no es un hombre: una bestia que cambia de forma. Mosca gigante, tiranosaurio de carne, tren de huesos. En lo alto de un rascacielos, se lanza a por ti.",
          exito: "Esquivas cada embestida. Helena y tú le disparáis a la vez a la cabeza. Simmons se derrumba, empalado en la antena del edificio, convertido en papilla.",
          fallo: "Un zarpazo te abre la espalda. Helena te cubre. Simmons cae empalado y revienta en una masa de carne.",
          muerte: "Simmons te tragó entero en su forma de tiranosaurio. Lo último que viste fueron sus dientes cerrándose." },
        { tipo: "narracion", lineas: [
          "Simmons muere empalado en lo alto de un rascacielos, convertido en un amasijo de carne que todavía intenta hablar.",
          "Helena queda libre de cargos. La verdad sobre Raccoon City, por fin, sale a la luz.",
          "En la cubierta de un barco, Ada te mira desde lejos. Te deja una nota: «Hasta la próxima, Leon».",
          "Le has prometido a Benford que harías lo correcto. Esta noche, al menos, lo has hecho."
        ] }
      ]
    },

    /* ======================================================================
     *  CHRIS REDFIELD (con Piers Nivans)
     * ==================================================================== */
    {
      id: "chris",
      protagonista: "chris",
      titulo: "El capitán que olvidó",
      resumen: "Perdiste a todo tu equipo en Edonia y no lo recuerdas. Piers te saca de un bar. Ahora vas a por la mujer que lo hizo: «Ada Wong». Aunque quizá no sea quien crees.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Edonia, Europa del Este. Despiertas en un bar con una botella en la mano y sin recuerdos de los últimos seis meses.",
          "Un chico de la B.S.A.A., Piers Nivans, te encuentra. «Capitán. Le necesitamos». No sabes quién es. Él sí sabe quién eres tú.",
          "Te enseña una foto: tu equipo. Setenta y cuatro hombres. Todos muertos. Por tu culpa, dice tu mirada en la foto.",
          "Vuelves a Edonia. Los J'avo, soldados infectados con el virus C, te esperan entre la lluvia y los tanques en llamas."
        ] },
        { tipo: "explorar", titulo: "Edonia · Calles en guerra", imagen: "img/escenarios/re6_tallaoks.webp", escenario: "ciudad", ancho: 20, fondo: 26, sangre: 7, ambiente: { niebla: "#0a0a0c", cielo: "#0c0c10", luz: "#a0b0c8" },
          descripcion: "Lluvia, tanques en llamas y J'avo con fusiles de asalto. Piers te cubre. Busca el informe de bajas de tu equipo.",
          salida: { x: 0, z: -13, texto: "Ir al cuartel enemigo" },
          props: [
            ["coche", -6, 3, 0.5, "#3a4a2a"], ["coche", 6, -6, -0.6, "ardiendo"], ["escombros", -7, -8], ["escombros", 5, 7], ["bidon", 0, -4],
            ["valla", -4, 9], ["cruz", 7, 10, 0, "soldado"], ["colgado", -3, -4, 0, "soldado"], ["visceras", 2, 2]
          ],
          puntos: [
            { x: -6, z: 5.4, nombre: "Puesto de mando", prop: ["mesa", 0.2], texto: "La tienda de mando de la B.S.A.A. Un informe con tu nombre. Lo lees. No recuerdas nada. Y eso es lo peor.", requerido: true, accion: { documento: "informe_edonia" } },
            { x: 7, z: 9, nombre: "El crucificado", texto: "Un soldado de la B.S.A.A. clavado a un poste. Le han inyectado el virus C y ha empezado a convertirse en crisálida desde los pies. Lleva tu emblema.", accion: { sangre: true } },
            { x: 5, z: -3, nombre: "Caja de munición", texto: "Munición de la B.S.A.A. y una hierba mezclada.", accion: { objetos: { municion: 20, hierba_mixta: 1 } } }
          ],
          npcs: [{ id: "piers", x: 2, z: 10, sigue: true, lineas: ["¡Capitán, a cubierto!", "Usted era el mejor. Lo sigue siendo. Solo tiene que recordarlo.", "Finn era un crío. Le quería como a un hermano.", "Le cubro, capitán. Siempre."] }],
          enemigos: [
            { id: "jo", x: -3, z: 0, vida: 4, vel: 1.6, dano: 20 }, { id: "jo", x: 4, z: -1, vida: 4, vel: 1.6, dano: 20 },
            { id: "jo", x: 0, z: -7, vida: 4, vel: 1.6, dano: 20 }, { id: "jo", x: -5, z: -10, vida: 4, vel: 1.6, dano: 20 }
          ] },
        { tipo: "chat", titulo: "Recuerdo · seis meses antes", guion: [
          { sistema: "La lluvia te devuelve un recuerdo. Edonia. Tu equipo. Una mujer de rojo." },
          { de: "carla", t: "Capitán Redfield. Qué hombres tan fuertes tiene. Me encantaría verlos... cambiar." },
          { de: "piers", t: "¡Capitán, es Ada Wong! ¡Tiene a Finn!" },
          { opciones: [
            { t: "¡Suéltalo!", resp: [{ de: "carla", t: "Como quieras." }] },
            { t: "Dispara, Piers. ¡Ya!", resp: [{ de: "carla", t: "Demasiado tarde, cariño." }] }
          ] },
          { sistema: "La mujer le clava una jeringa a Finn en el cuello. Finn grita. Su cabeza se hincha, revienta, y de dentro sale algo con tentáculos.", efecto: "sangre" },
          { de: "piers", t: "...Capitán. Ya lo recuerda, ¿verdad? Vamos a por ella." }
        ] },
        { tipo: "encuentro", enemigo: "jo", modo: "esquiva", rondas: 4, velocidad: 1.4, dano: 35,
          texto: "Un J'avo gigante, mutado con el virus C, te carga: un brazo es una pinza de cangrejo y su cara se abre en cuatro como una flor. Lleva puesto el uniforme de Finn.",
          exito: "Esquivas sus pinzas y le revientas la cabeza abierta. Cae. En el suelo queda la placa de Finn Macauley. Te la guardas.",
          fallo: "La pinza te aprieta la pierna hasta crujir el hueso. Piers te salva. Cae sobre la placa de Finn.",
          muerte: "La pinza del J'avo te cortó por la cintura. Piers no pudo hacer nada." },
        { tipo: "explorar", titulo: "Lanshiang · Torre Quad", imagen: "img/escenarios/re6_lanshiang.webp", escenario: "base", ancho: 16, fondo: 22, sangre: 5, matar: true,
          descripcion: "El laboratorio de Neo-Umbrella en lo alto de un rascacielos. Crisálidas por todas partes. Encuentra el expediente secreto: quiero saber quién es esa mujer.",
          salida: { x: 0, z: -11, texto: "Ir al terminal de identificación" },
          props: [
            ["capsula", -5.5, -6, 0, "ada"], ["capsula", 5.5, -6, 0, "ada"], ["capsula", -5.5, -1, 0, "jo"], ["consola", 0, -9],
            ["mesa", 3, 4], ["generador", -6.8, 8.6], ["visceras", 0, 2], ["pintada", 7.95, 0, -1.57, "LA FAMILIA"]
          ],
          puntos: [
            { x: 3, z: 4.4, nombre: "Archivador de La Familia", texto: "Un expediente secreto con el sello de Simmons.", requerido: true, accion: { documento: "proyecto_ada" } },
            { x: -5.5, z: -4.6, nombre: "Cápsula de «Ada»", texto: "Una mujer idéntica a Ada Wong flota dentro. Tiene la piel de la cara cosida por detrás de las orejas.", accion: { susto: "carla", dano: 0 } },
            { x: 6.8, z: 6, nombre: "Armería", prop: ["archivador", -1.57], texto: "Munición y un spray.", accion: { objetos: { municion: 20, spray: 1 } } }
          ],
          npcs: [{ id: "piers", x: 0, z: 9, sigue: true, lineas: ["Capitán, mire esas cápsulas. Hay muchas Adas.", "Sea quien sea, la vamos a encontrar.", "Esto no es venganza. Es justicia."] }],
          enemigos: [
            { id: "jo", x: -2, z: -3, vida: 4, vel: 1.7 }, { id: "jo", x: 3, z: -5, vida: 4, vel: 1.7 }, { id: "jo", x: 0, z: -7, vida: 4, vel: 1.7 }
          ] },
        { tipo: "puzzle", id: "re6_chris_carla", ui: "texto",
          titulo: "Terminal de identificación",
          enunciado: "«IDENTIFIQUE A LA SUJETO DEL PROYECTO ADA». Escribe su nombre real.",
          pista: "El expediente lo dice: la voluntaria era la investigadora Carla Radames.",
          placeholder: "Nombre real" },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "uroboros", modo: "machaca", veces: 24, tiempo: 6, dano: 45, boton: "¡DISPARA AL NÚCLEO!",
          texto: "En la base submarina, Carla ha liberado su obra maestra: Haos, un titán de carne de cien metros que está naciendo de su crisálida. Si sale a la superficie, el virus C llegará a todo el mundo.",
          exito: "Revientas su núcleo con todo lo que tienes. Haos se desploma dentro de la crisálida, ahogándose en su propio líquido amniótico.",
          fallo: "Un tentáculo te aplasta contra una mampara. Piers te arrastra. Haos se derrumba igualmente, con el núcleo destrozado.",
          muerte: "Haos te aplastó con un brazo del tamaño de un edificio. Piers recogió tus placas." },
        { tipo: "chat", titulo: "Base submarina · inundándose", guion: [
          { de: "piers", t: "Capitán... me ha atravesado el brazo. No voy a llegar." },
          { opciones: [
            { t: "No digas tonterías. Te saco de aquí aunque sea a cuestas.", resp: [{ de: "piers", t: "Lo sé. Por eso voy a hacer esto." }] },
            { t: "Piers, ¿qué haces con esa jeringa?", resp: [{ de: "piers", t: "Lo único que puede salvarle a usted." }] }
          ] },
          { sistema: "Piers se clava una jeringa de virus C en el muslo. Su brazo derecho revienta, se hincha y empieza a soltar descargas eléctricas.", efecto: "sangre" },
          { de: "piers", t: "Hay cosas que solo usted puede hacer, capitán. El mundo le necesita. Váyase." }
        ] },
        { tipo: "narracion", lineas: [
          "Piers termina de matar a Haos con el rayo de su brazo mutado y te mete en la cápsula de escape. Cierra la escotilla desde fuera.",
          "Lo último que ves es su cara, medio infectada, sonriendo, mientras el agua inunda la base.",
          "Llegas a la superficie solo. Con la placa de Finn y la de Piers en el bolsillo.",
          "Vuelves a la B.S.A.A. Entrenas a los novatos. Les cuentas quién fue Piers Nivans. Lo haces todos los días."
        ] }
      ]
    },

    /* ======================================================================
     *  JAKE MULLER (con Sherry Birkin)
     * ==================================================================== */
    {
      id: "jake",
      protagonista: "jake",
      titulo: "El hijo de Wesker",
      resumen: "Eres un mercenario que solo cree en el dinero. Tu sangre es la cura del virus C. Una agente del gobierno te protege, una mole de carne con un brazo mecánico te caza... y no sabes quién fue tu padre.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Eres Jake Muller. Mercenario en Edonia. Te pagan por matar y tú matas. Tu madre murió pobre. Tu padre nunca apareció.",
          "Los rebeldes que te contrataron se inyectan el virus C. Se convierten en J'avo. Tú no. Tu sangre no lo acepta.",
          "Una rubia del gobierno de EE. UU. te encuentra: Sherry Birkin. «Tu sangre puede salvar el mundo». Le dices tu precio: 50 millones.",
          "Entonces la pared revienta. Una mole de tres metros con un brazo mecánico te busca a ti. Se llama Ustanak."
        ] },
        { tipo: "explorar", titulo: "Edonia · Fábrica abandonada", imagen: "img/escenarios/re6_bar.webp", escenario: "fabrica", ancho: 18, fondo: 24, sangre: 5,
          descripcion: "Hierro oxidado, cadenas colgantes y J'avo por todas partes. Ustanak te sigue. Busca tu expediente en la oficina del capataz y sal de aquí.",
          salida: { x: 0, z: -12, texto: "Huir por el muelle de carga" },
          props: [
            ["tanque", -6.5, -6], ["tanque", 6.5, -6], ["caja", 7, 8], ["caja", 7, 6.9], ["caja", 5.9, 8], ["generador", -7.6, 8.6],
            ["tuberia", -8.8, 0, 1.57], ["colgado", 0, 0, 0, "carne"], ["colgado", 3, 3, 0, "carne"], ["bidon", -3, -8]
          ],
          puntos: [
            { x: -4, z: 3, nombre: "Oficina del capataz", prop: ["escritorio", 1.57], texto: "Un expediente de Neo-Umbrella con tu foto. Y una frase subrayada sobre tu padre.", requerido: true, accion: { documento: "expediente_jake", marca: "re6_jake_sabe" } },
            { x: 6.4, z: 5.6, nombre: "Cajas de munición", texto: "Munición de los rebeldes y una hierba.", accion: { objetos: { municion: 20, hierba_verde: 1 } } },
            { x: -6.5, z: -3.8, nombre: "Tanque de ácido", texto: "Dentro flota medio rebelde. La otra mitad está en el suelo.", accion: { sangre: true } }
          ],
          npcs: [{ id: "sherry", x: 2, z: 10, sigue: true, lineas: ["Jake, tu sangre puede salvar a millones de personas.", "Yo también tengo un virus dentro. El G. Me regenera. Duele.", "Mi padre también fue un monstruo. No eres el único.", "¿50 millones? ¿En serio?"] }],
          enemigos: [
            { id: "jo", x: -3, z: -2, vida: 4, vel: 1.6 }, { id: "jo", x: 3, z: -4, vida: 4, vel: 1.6 },
            { id: "ustanak", x: 0, z: -10, vel: 1.3, rango: 14, aturdido: "se tambalea y gruñe. Su brazo mecánico se recarga con un chasquido.", muerte: "Ustanak te metió en su cápsula de captura. Te desangraste dentro mientras te llevaba a Simmons." }
          ] },
        { tipo: "chat", titulo: "Sherry · canal seguro", guion: [
          { de: "sherry", t: "Jake, ¿estás bien? Esa cosa no se cansa." },
          { opciones: [
            { t: "Mi padre era Albert Wesker. ¿Tú lo sabías?", si: "re6_jake_sabe", marca: "re6_jake_pregunta", resp: [{ de: "sherry", t: "...Sí. Lo siento. Pero tú no eres él, Jake. Tú decides quién eres." }] },
            { t: "Estoy bien. Lo que no estoy es pagado.", resp: [{ de: "sherry", t: "Sigues con lo de los 50 millones. Eres incorregible." }] }
          ] },
          { de: "jake", t: "Si salimos de esta, me invitas a una cerveza. Una. Ya negociaremos lo demás." },
          { de: "sherry", t: "Trato hecho. Ahora corre. Viene por el tejado." }
        ] },
        { tipo: "encuentro", enemigo: "ustanak", modo: "machaca", veces: 22, tiempo: 5, dano: 50, boton: "¡LIBÉRATE!",
          texto: "El Ustanak irrumpe a través del muro. Su brazo mecánico te agarra del cuello y empieza a apretar.",
          exito: "Sherry le dispara en el ojo. Te suelta. Le partes la rodilla de una patada y huís por la ventana.",
          fallo: "Te lanza contra un pilar. Algo se rompe dentro de ti. Sherry te arrastra fuera.",
          muerte: "El Ustanak te arrancó la cabeza con su brazo mecánico y se la llevó a Simmons como prueba." },
        { tipo: "explorar", titulo: "Montañas de Edonia", imagen: "img/escenarios/re6_tallaoks.webp", escenario: "nieve", ancho: 22, fondo: 28, sangre: 3,
          descripcion: "Una ventisca a treinta bajo cero. Los J'avo con ropa de invierno os persiguen en motos de nieve. Al fondo, una cabaña. Allí os capturarán... pero antes, sobrevive.",
          salida: { x: 0, z: -14, texto: "Ir a la cabaña" },
          props: [
            ["arbol", -8, 8], ["arbol", 8, 6], ["arbol", -6, -6], ["arbol", 7, -9], ["arbol", -9, -1], ["casa", 0, -10.5], ["coche", 5, 2, 0.8, "#2a2a2a"],
            ["hoguera", -3, 4], ["cadaver", 3, 6, 1, "jo"], ["tumba", -6, 10]
          ],
          puntos: [
            { x: -3, z: 5.2, nombre: "Hoguera abandonada", texto: "Unos rebeldes acamparon aquí. Se comieron a uno de ellos. Los huesos están roídos. Munición en sus mochilas.", accion: { objetos: { municion: 18, hierba_mixta: 1 } } },
            { x: 5, z: 4, nombre: "Moto de nieve volcada", texto: "El conductor sigue sentado. Sin cabeza. Un spray en el asiento trasero.", accion: { objeto: "spray", cantidad: 1 } },
            { x: 0, z: -7.5, nombre: "Puerta de la cabaña", requerido: true, texto: "¡Un J'avo con alas de insecto sale volando desde el tejado!", accion: { susto: "jo", dano: 12, muerte: "El J'avo volador te llevó al cielo y te soltó a cien metros sobre las rocas.", aparecen: [{ id: "jo", x: 3, z: -6, vida: 4, vel: 2.2 }, { id: "jo", x: -3, z: -6, vida: 4, vel: 2.2 }] } }
          ],
          npcs: [{ id: "sherry", x: -2, z: 11, sigue: true, lineas: ["Me congelo... el G me calienta, pero duele.", "Jake, ¿qué harás con el dinero?", "Te tienes a ti mismo. Y ahora me tienes a mí."] }],
          enemigos: [
            { id: "jo", x: -4, z: 0, vida: 4, vel: 1.6 }, { id: "jo", x: 4, z: -2, vida: 4, vel: 1.6 }, { id: "jo", x: 0, z: -5, vida: 4, vel: 1.6 }
          ] },
        { tipo: "narracion", lineas: [
          "En la cabaña, Ustanak os atrapa. Despertáis seis meses después en un laboratorio de Neo-Umbrella en China, encerrados por separado.",
          "Os han sacado sangre cada día. Litros. Tienes los brazos llenos de agujeros, como un yonqui.",
          "Tu celda se abre con una contraseña. Recuerdas el expediente. El apellido de tu padre."
        ] },
        { tipo: "puzzle", id: "re6_jake_wesker", ui: "texto",
          titulo: "Panel de la celda",
          enunciado: "«CONTRASEÑA DEL SUJETO». El expediente decía que la palabra clave era el apellido de tu padre.",
          pista: "Tu padre se llamaba Albert. Murió en un volcán de África en 2009. Albert Wesker.",
          placeholder: "Contraseña" },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "ustanak", modo: "esquiva", rondas: 5, velocidad: 1.5, dano: 45,
          texto: "En el núcleo del laboratorio, Ustanak se ha inyectado una dosis masiva de virus C. Su brazo mecánico se ha fundido con la carne y le han crecido cuchillas por toda la espalda. Es la última vez.",
          exito: "Esquivas cada golpe y le revientas el brazo. Lo rematas a puñetazos, como tu padre. Le aplastas la cabeza contra el suelo hasta que no queda cabeza.",
          fallo: "Una cuchilla te abre el pecho. Le revientas la cabeza a puñetazos de todos modos, escupiendo sangre.",
          muerte: "El Ustanak te partió la columna sobre su rodilla. Sherry lo vio desde la cápsula." },
        { tipo: "narracion", lineas: [
          "Ustanak muere cayendo al núcleo del laboratorio. Escapáis en el último segundo.",
          "Donas tu sangre para la vacuna del virus C. Le dices a Sherry tu precio final: 50 dólares. «Es una oferta especial».",
          "Te vas a Edonia a ayudar a los niños de la guerra. Sherry te despide en el aeropuerto.",
          "Nadie lo sabrá nunca: el hijo de Albert Wesker salvó el mundo que su padre quiso destruir."
        ] }
      ]
    },

    /* ======================================================================
     *  ADA WONG
     * ==================================================================== */
    {
      id: "ada",
      protagonista: "ada",
      titulo: "La sombra de Ada",
      resumen: "Alguien con tu cara ha desatado el virus C en medio mundo. La B.S.A.A. te busca, Simmons te desea y tú solo quieres una cosa: encontrar a la mujer que te ha robado la identidad.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Eres Ada Wong. Llevas una semana viendo tu cara en todos los telediarios del mundo: «la terrorista del virus C».",
          "No has sido tú. Alguien con tu rostro, tu voz y tu forma de caminar ha matado a miles de personas.",
          "Una pista te lleva a un submarino de Neo-Umbrella hundido frente a la costa de China.",
          "Dentro encuentras cápsulas. Y en cada cápsula, tu propia cara mirándote."
        ] },
        { tipo: "explorar", titulo: "Submarino de Neo-Umbrella", imagen: "img/escenarios/re6_catacumbas.webp", escenario: "barco", ancho: 12, fondo: 22, sangre: 6,
          descripcion: "Pasillos estrechos, agua hasta los tobillos y luces de emergencia rojas. Algo arrastra los pies por el casco. Busca la bitácora de clonación.",
          salida: { x: 0, z: -11, texto: "Ir a la cámara de clonación" },
          props: [
            ["capsula", -4.6, 6, 0, "ada"], ["capsula", 4.6, 6, 0, "ada"], ["capsula", -4.6, 1, 0, "ada"], ["capsula", 4.6, 1, 0, "carla"],
            ["tuberia", -5.8, -4, 1.57], ["tuberia", 5.8, -6, 1.57], ["consola", 0, -9], ["visceras", 0, 3], ["cadaver", 3, -4, 1, "ada"]
          ],
          puntos: [
            { x: 0, z: -8.1, nombre: "Puesto del oficial", texto: "Un cuaderno con la letra de alguien que escribe igual que tú.", requerido: true, accion: { documento: "bitacora_clones" } },
            { x: 3, z: -4, nombre: "Clon muerto", texto: "Una Ada desnuda, muerta en el suelo, con la cara arrancada a uñas. Debajo de la cara no había músculo: solo moho negro. Tenía munición en la mano.", accion: { objetos: { municion: 18 } } },
            { x: -4.6, z: 2.4, nombre: "Cápsula rota", texto: "¡Un clon fallido sale arrastrándose! Una masa con tres caras tuyas.", accion: { susto: "carla", dano: 12, muerte: "Tus clones fallidos te devoraron. Al menos, murió una Ada rodeada de Adas.", aparecen: [{ id: "jo", figura: "carla", x: -3, z: 0, vida: 3, vel: 1.2 }, { id: "jo", figura: "carla", x: -2, z: -2, vida: 3, vel: 1.2 }] } },
            { x: 4.6, z: -1.2, nombre: "Taquilla", prop: ["archivador", -1.57], texto: "Munición, un spray y una cinta de tinta.", accion: { objetos: { municion: 12, spray: 1, cinta: 1 } } }
          ],
          enemigos: [{ id: "jo", x: 0, z: -3, vida: 4, vel: 1.4 }, { id: "zombi", x: -2, z: -7 }] },
        { tipo: "puzzle", id: "re6_ada_clones", ui: "codigo", digitos: 3,
          titulo: "Cámara de clonación",
          enunciado: "Tres cifras. La bitácora dice cómo formar el código: los fallidos de cada lote, en orden alfabético.",
          danoFallo: 8,
          pista: "Lote A: 3, lote B: 1, lote C: 9 → 319." },
        { tipo: "chat", titulo: "Mensaje entrante · número oculto", guion: [
          { de: "carla", t: "Hola, Ada. Me alegra que hayas encontrado a mis... hermanas." },
          { opciones: [
            { t: "¿Quién eres?", resp: [{ de: "carla", t: "Soy tú. Mejor que tú. Simmons me hizo así porque no podía tenerte." }] },
            { t: "Te voy a arrancar mi cara.", marca: "re6_ada_furia", resp: [{ de: "carla", t: "Qué violenta. Me encanta. Es lo que yo habría dicho." }] }
          ] },
          { de: "simmons", t: "Ada. Mi Ada. La de verdad. Ven conmigo. Lo tendremos todo." },
          { de: "carla", t: "¿Oyes eso, Ada? Hasta su voz suplica. Por eso voy a destruirle. A él y a todo su mundo." }
        ] },
        { tipo: "explorar", titulo: "Lanshiang · Laboratorio de Carla", imagen: "img/escenarios/re6_universidad.webp", escenario: "laboratorio", ancho: 18, fondo: 22, sangre: 6, matar: true,
          descripcion: "Aquí nació el virus C. Paredes cubiertas de fotos tuyas con los ojos tachados. Carla ha soltado a sus mascotas. Encuentra su grabación.",
          salida: { x: 0, z: -11, texto: "Subir al helipuerto" },
          props: [
            ["capsula", -6, -6, 0, "jo"], ["capsula", 6, -6, 0, "ada"], ["consola", 0, -9], ["camilla", -4, 4, 0.3, "carla"], ["mesa", 4, 4],
            ["pintada", -8.95, 0, 1.57, "ADA ADA ADA"], ["pintada", 8.95, 0, -1.57, "SIMMONS MORIRÁ"], ["visceras", 0, 0]
          ],
          puntos: [
            { x: 0, z: -8.1, nombre: "Grabadora de Carla", texto: "Un mensaje grabado. Para ti.", requerido: true, accion: { documento: "diario_carla" } },
            { x: -4, z: 4.6, nombre: "La camilla", texto: "Un clon a medio operar: le han quitado la cara y la tienen en una bandeja al lado, como una máscara de goma.", accion: { sangre: true } },
            { x: 4, z: 4.4, nombre: "Mesa de Carla", texto: "Munición y hierbas mezcladas. Y una foto tuya con Leon, sacada de lejos.", accion: { objetos: { municion: 18, hierba_mixta: 1 } } }
          ],
          enemigos: [
            { id: "jo", x: -3, z: -3, vida: 4, vel: 1.7 }, { id: "jo", x: 3, z: -5, vida: 4, vel: 1.7 }, { id: "licker", x: 0, z: -7 }, { id: "jo", x: 0, z: 2, vida: 4, vel: 1.7 }
          ] },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "carla", modo: "machaca", veces: 22, tiempo: 5, dano: 45, boton: "¡GANCHO!",
          texto: "Simmons dispara a Carla en la cabeza. Pero Carla se inyecta el virus C y muta: su cuerpo se hincha hasta llenar la sala, una masa de carne con tu cara deformada en el centro. Usa tu gancho y sube a la cúpula.",
          exito: "Subes con el gancho y le disparas a la cara —a tu cara— hasta que revienta. Carla se derrumba gritando tu nombre.",
          fallo: "Un tentáculo te raja el muslo. Disparas colgada del gancho, sangrando. Tu cara revienta. La de ella.",
          muerte: "Carla te absorbió. Durante un segundo, las dos fuisteis la misma persona. Luego, ninguna." },
        { tipo: "narracion", lineas: [
          "Carla muere sobre el suelo del laboratorio. Te mira con tus propios ojos y susurra: «Ahora... solo quedas tú».",
          "Pones explosivos en cada cápsula. Ninguna Ada sobrevive. Excepto una: tú.",
          "Le dejas a Leon pruebas suficientes para limpiar tu nombre. Luego desapareces, como siempre.",
          "Un nuevo cliente te llama esa misma noche. Tiene la voz grave. Te ofrece un trabajo. Sonríes. Nunca dices que no."
        ] }
      ]
    }
  ]
});
