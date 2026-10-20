/* ============================================================================
 *  ARCHIVO I · RESIDENT EVIL 2 (1998) — Leon (Escenario A) · Claire (Escenario B)
 *  Soluciones de los puzzles: Puzzles.java (re2, re2_leon_*, re2_claire_*)
 * ========================================================================== */

"use strict";

Object.assign(DOCUMENTOS, {
  periodico_raccoon: {
    titulo: "Raccoon Press · 28 de septiembre",
    estilo: "informe",
    texto: `RACCOON PRESS — EDICIÓN DE EMERGENCIA

¿CANIBALISMO EN LOS ARRABALES?

Se multiplican los casos de «enfermedad caníbal». Testigos
afirman que los afectados atacan a sus vecinos a mordiscos.
Anoche, en Ennerdale Street, un hombre devoró parcialmente a su
esposa delante de sus hijos antes de ser abatido por la policía.
Recibió seis disparos en el pecho. Siguió caminando.

El alcalde Michael Warren pide calma. El jefe de policía Brian
Irons asegura que «la situación está bajo control».

Umbrella Corporation, principal empleador de la ciudad,
declina hacer comentarios.`
  },
  poema_diosa: {
    titulo: "Inscripción del pedestal",
    estilo: "informe",
    texto: `TRES GUARDIANES DEVUELVEN LA LUZ A LA DIOSA.

Primero ruge el rey de las bestias,
el que guarda la entrada con melena de oro.

Después galopa quien lleva
un cuerno de plata en la frente.

Por último reza la doncella,
con las manos juntas sobre el pecho.

La serpiente miente. No la escuches.`
  },
  diario_guardia: {
    titulo: "Diario de un agente de la R.P.D.",
    estilo: "sangre",
    texto: `26 de septiembre.
Tres civiles mordidos en Ennerdale Street. Hospitalizados.

27 de septiembre.
Los mordidos han muerto. Luego se han levantado.
El jefe Irons ha cerrado las puertas de la comisaría.

28 de septiembre.
Me mordió uno en el brazo. Pica. Tengo hambre todo el rato.
He soñado que me comía a mi hija. Me he despertado salivando.
Si alguien lee esto: no confíes en Irons.
Hay una salida bajo la estatua de la diosa.

29 de septi`
  },
  notas_ben: {
    titulo: "Grabadora de Ben Bertolucci",
    estilo: "papel",
    texto: `[Transcripción de una minigrabadora encontrada junto a la celda]

«Me llamo Ben Bertolucci, periodista. Irons me ha encerrado
"por mi seguridad". Mentira. Sé demasiado.

Umbrella le paga desde hace años. A cambio, Irons hizo
desaparecer pruebas, testigos... y chicas. La hija del
alcalde, Katherine, lleva tres días sin aparecer.

Umbrella tiene un laboratorio bajo la ciudad: NEST.
Su científico estrella, William Birkin, creó algo peor que el
virus T. Lo llaman G. Te reescribe. Te convierte en un
recipiente para meter... huevos.

Hace una hora alguien gigante y lleno de ojos pasó por el
pasillo. Me miró. Me noto el pecho raro. Me muevo... por
dentro. Dios mío, algo se me está movien—»

[La grabación termina con un sonido de costillas partiéndose.]`
  },
  nota_depuradora: {
    titulo: "Nota del operario de la depuradora",
    estilo: "sangre",
    texto: `Los tapones de las compuertas llevan piezas de ajedrez.
Si alguien baja después de mí, que lo haga en este orden
o el agua negra le arrastrará hasta los filtros:

El peón siempre abre la marcha.
La torre guarda el agua y va justo detrás.
El alfil bendice el paso, en tercer lugar.
Y la reina cierra la compuerta.

El rey nunca baja a las cloacas. Ni el caballo.

Algo grande vive en el agua. Tiene un ojo en el hombro.
Se llevó a Paco de un tirón. Solo quedó su bota.
Con el pie dentro.`
  },
  diario_birkin: {
    titulo: "Diario de William Birkin",
    estilo: "informe",
    texto: `Umbrella quiere robarme el G. Mi G. Quince años de trabajo.

Han enviado a un escuadrón de la U.S.S. Esta noche vendrán.
Annette dice que exagero. Annette no ve lo que yo veo.

Si me disparan, me lo inyectaré. El G regenera. El G mejora.
El G se reproduce implantando embriones en un huésped
genéticamente compatible: un familiar directo.

Sherry.
No. No pienso en eso. No lo escribiré otra vez.

P. D. La clave del ascensor al núcleo es su nombre, escrito
como ella lo escribía de pequeña en el espejo: al revés.`
  },
  correo_annette: {
    titulo: "Correo de Annette Birkin",
    estilo: "email",
    texto: `DE: a.birkin@nest.umbrella
PARA: seguridad-nucleo@nest.umbrella
ASUNTO: Acceso de emergencia

He cambiado la clave del núcleo. William ya no es William.
Ha atravesado a cuatro guardias de seguridad con las garras.
A uno le abrió el cráneo y le sorbió... no puedo escribirlo.

La nueva clave sigue la manía de William: el nombre de nuestra
hija en espejo. Seis letras.

Si alguien lee esto, que active la autodestrucción. NEST no
puede salir de aquí abajo.
— A.`
  },
  postal_chris: {
    titulo: "Postal de Chris Redfield",
    estilo: "papel",
    texto: `Claire:

Me voy unos días. No preguntes a dónde ni con quién.
Lo que vimos en la mansión Spencer no fue una pesadilla:
Umbrella lo hizo. Y Wesker sigue vivo, lo sé.

En la comisaría nadie me cree. Irons me odia. Ojo con él:
cobra de Umbrella, estoy seguro.

Si vienes a Raccoon a buscarme, no lo hagas.
Si vienes de todas formas (te conozco), ve a la R.P.D.
y busca mi mesa en la oficina de los S.T.A.R.S.

Te quiero, hermanita.
— Chris`
  },
  diario_irons: {
    titulo: "Diario personal de Brian Irons",
    estilo: "papel",
    texto: `Mi colección crece. Los ciervos, los lobos y el oso de la
sala de caza son preciosos, pero no tanto como mis otras piezas.

Umbrella me paga por mirar hacia otro lado. Y yo miro.
Miro mucho. Miro a Katherine, la hija del alcalde, que ahora
duerme en mi mesa de trabajo. Quedará perfecta disecada.

He cambiado la combinación de la caja fuerte. Esta vez es
fácil de recordar: cuántos ciervos, cuántos lobos, cuántos osos
y cuántas «chicas» guardo en la cámara. En ese orden.

Que se pudran todos ahí fuera. Yo tengo mi museo.`
  },
  carta_annette: {
    titulo: "Carta de Annette a Sherry",
    estilo: "papel",
    texto: `Sherry, cariño:

Siento no haber estado. Papá y mamá trabajan mucho.
Lleva siempre puesto el colgante que te regalé.
No lo abras. Nunca. Pase lo que pase.

Dentro hay una muestra de lo que hizo papá. Si Umbrella
la encuentra, te harán daño para quitártela.

Si ves a papá... ya no es papá. Escóndete.
Es muy grande. Tiene un ojo enorme en el hombro.
Y te está buscando porque quiere meter algo dentro de ti.

Corre al orfanato. Allí estarás a salvo.
— Mamá`
  },
  receta_devil: {
    titulo: "Protocolo D.E.V.I.L. (Annette Birkin)",
    estilo: "informe",
    texto: `PROTOCOLO DE SÍNTESIS · VACUNA D.E.V.I.L. CONTRA EL VIRUS G

Solo eficaz antes de que el embrión eclosione (≈ 3 horas).

Orden de carga en la estación de síntesis:
1. Primero, la BASE de cultivo.
2. Después, el CATALIZADOR, para despertar la reacción.
3. Luego, la MUESTRA de G, de la que nace el antídoto.
4. Finalmente, el ESTABILIZADOR.

ADVERTENCIA: no utilizar sangre del huésped. La de
Sherry ya está contaminada. La mezcla resultante haría
eclosionar el embrión dentro del brazo del paciente.`
  }
});

HISTORIA.capitulos.push({
  id: "re2",
  juego: "Resident Evil 2",
  titulo: "Bienvenido a Raccoon City",
  anio: "29 de septiembre de 1998",
  lugar: "Raccoon City · Comisaría (R.P.D.) · Laboratorio NEST",
  tema: "tema-re2",
  fondoImagen: "img/escenarios/re2.webp",
  variantes: {leon: "leon_re2"},
  rutas: [

    /* ======================================================================
     *  LEON · ESCENARIO A
     * ==================================================================== */
    {
      id: "leon",
      protagonista: "leon",
      titulo: "Escenario A · El novato",
      resumen: "Tu primer día como policía. La comisaría, las alcantarillas, Ada Wong y un gigante con sombrero que no deja de seguirte.",
      pasos: [
        { tipo: "narracion", lineas: [
          "29 de septiembre de 1998. Tu primer día como agente de la R.P.D. Llegas tarde: te quedaste dormido después de la fiesta de despedida.",
          "En la gasolinera de las afueras, el dependiente está de rodillas sobre un camionero. Le arranca la tráquea a mordiscos y la mastica como un chicle.",
          "Una chica en moto, Claire Redfield, te salva de otro de ellos. Huis juntos en tu coche patrulla.",
          "Un camión cisterna sin conductor os embiste. El fuego os separa. Claire grita desde el otro lado: «¡Nos vemos en la comisaría!».",
          "Raccoon City arde. Y los muertos caminan entre las llamas."
        ] },
        { tipo: "explorar", titulo: "Calles de Raccoon City", imagen: "img/escenarios/re2_calle.webp", escenario: "calle", ancho: 16, fondo: 26, sangre: 6,
          descripcion: "Coches en llamas, escaparates reventados y gemidos por todas partes. La comisaría está al final de la calle. Muévete con WASD o haciendo clic en el suelo. Examina lo que brilla con E y dispara con Espacio o haciendo clic sobre un enemigo.",
          salida: { x: 0, z: -13, texto: "Entrar en la comisaría" },
          props: [
            ["coche", -5, 6, 0.3, "ardiendo"], ["coche", 5, -2, -0.2, "policia"], ["coche", -4.5, -7, 1.4],
            ["bidon", 6.5, 9], ["bidon", -6.6, -1], ["escombros", 6, -8], ["cadaver", 2, 8, 0.4, "zombi"],
            ["cadaver", -2, -3, 2], ["colgado", 7, 2, 0, "zombi"], ["pintada", 0, -12.95, 0, "R.P.D. AYUDA"],
            ["valla", -6.4, -11, 1.57]
          ],
          puntos: [
            { x: 3.6, z: -0.4, nombre: "Coche patrulla abierto", texto: "Un compañero murió aquí con la radio en la mano. Le falta la cara: se la comieron hasta el hueso. En la guantera, una caja de munición.", accion: { objeto: "municion", cantidad: 12 } },
            { x: -6.5, z: 4, nombre: "Quiosco de prensa", texto: "Un periódico de ayer, salpicado de sangre. El titular habla de «caníbales».", requerido: true, accion: { documento: "periodico_raccoon" } },
            { x: 6.8, z: -5, nombre: "Armería de Kendo", texto: "El escaparate está reventado. Robert Kendo te dejó munición en el mostrador antes de encerrarse con su hija... que ya no es su hija.", requerido: true, accion: { objeto: "municion", cantidad: 10, aparecen: [{ id: "zombi", x: 3, z: -9 }, { id: "zombi", x: -3, z: -10 }] } },
            { x: -1.6, z: 9.5, nombre: "Hierbas del parterre", texto: "Hierba verde entre colillas y un dedo con anillo de casado.", accion: { objeto: "hierba_verde", cantidad: 1 } },
            { x: 2, z: 8, nombre: "Camionero muerto", texto: "Lo que queda del camionero de la gasolinera. Le han vaciado el abdomen. Los intestinos están esparcidos como confeti por la acera.", accion: { sangre: true } }
          ],
          npcs: [
            { id: "kendo", x: 7.2, z: -7.2, lineas: ["Soy Robert Kendo. La armería es mía. O lo era.", "Mi hija Emma... la mordieron. Está atada en la trastienda. Sigue gruñendo mi nombre.", "Llévate la munición. Yo ya no la voy a necesitar. Me queda una bala. Es para mí."] }
          ],
          enemigos: [
            { id: "zombi", x: -3, z: 1 }, { id: "zombi", x: 4, z: 3 }, { id: "zombi", x: 0, z: -6 }
          ] },
        { tipo: "chat", titulo: "Radio R.P.D. · Canal 3", guion: [
          { sistema: "Señal encontrada. Canal de emergencias abierto." },
          { de: "marvin", t: "¿Hay alguien...? ¿Un novato? Dios... por fin alguien vivo." },
          { de: "marvin", t: "Soy el teniente Marvin Branagh. Estoy en el vestíbulo principal. Me han mordido." },
          { opciones: [
            { t: "Aguanta, Marvin. Voy a por ti.", resp: [
              { de: "marvin", t: "No. Escúchame, chaval. Ya no hay nada que hacer por mí. Siento la fiebre. Siento... hambre." },
              { de: "marvin", t: "Tienes que salir de aquí. Hay un pasadizo bajo la estatua de la diosa." }
            ] },
            { t: "¿Qué demonios ha pasado en esta ciudad?", resp: [
              { de: "marvin", t: "Empezaron a llegar ciudadanos heridos. Mordían. Morían. Y luego... se levantaban." },
              { de: "marvin", t: "Los compañeros también. Vi a Elliot comerse la cara de Rita en el aparcamiento. Le sorbía los ojos. Hay un pasadizo bajo la estatua." }
            ] }
          ] },
          { de: "marvin", t: "La inscripción del pedestal te dirá cómo abrirlo. Y no hagas ruido: hay algo en los techos.", efecto: "temblor" },
          { de: "claire", t: "¿Hola? ¿Este canal funciona? Soy Claire Redfield, estoy en el ala oeste." },
          { de: "claire", t: "Busco a mi hermano, Chris. Era de los S.T.A.R.S. ¿Lo has visto?" },
          { opciones: [
            { t: "No, pero te ayudaré a buscarlo. Nos vemos en el vestíbulo.", marca: "re2_leon_claire", resp: [
              { de: "claire", t: "Gracias, poli. Cuidado con los cadáveres del pasillo. Uno me ha agarrado el tobillo. Sin piernas." }
            ] },
            { t: "Aquí solo quedan muertos, Claire.", resp: [
              { de: "claire", t: "Pues entonces soy la única viva y cabezota de la ciudad. Nos vemos en el vestíbulo." }
            ] }
          ] }
        ] },
        { tipo: "explorar", titulo: "Vestíbulo de la R.P.D.", imagen: "img/escenarios/re2_vestibulo.webp", escenario: "comisaria", ancho: 16, fondo: 20, sangre: 5,
          descripcion: "Mármol, sangre seca y una diosa de piedra que te observa desde el centro. Marvin está tirado junto a la pared, apretándose la herida. Busca la inscripción del pedestal.",
          salida: { x: 5, z: -10, texto: "Ir al ala este" },
          props: [
            ["estatua", 0, -3], ["banco", -5.5, 6, 1.57], ["banco", 5.8, -1, 1.57], ["archivador", -7.2, -8], ["archivador", -7.2, -6.8],
            ["lampara", -6.8, 8.5], ["pintada", 0, -9.95, 0, "NO HAY SALIDA"], ["cadaver", 3, 4, 1.2], ["sangre", -2, 1, 0, 3],
            ["pilar", -4.5, -6], ["pilar", 4.5, -6]
          ],
          puntos: [
            { x: -4.5, z: 2, nombre: "Mostrador de recepción", prop: ["mostrador", 1.57], texto: "Entre fichas policiales empapadas encuentras una copia de la inscripción del pedestal.", requerido: true, accion: { documento: "poema_diosa" } },
            { x: 6.3, z: 6.6, nombre: "Agente muerto", prop: ["cadaver", 0.6, "zombi"], texto: "Le falta la mitad inferior de la mandíbula: la lengua le cuelga sobre el pecho como una corbata. En el bolsillo, un diario empapado.", requerido: true, accion: { documento: "diario_guardia", aparecen: [{ id: "zombi", x: -6, z: -8 }, { id: "zombi", x: 6.5, z: -8 }] } },
            { x: 0, z: -1.4, nombre: "Pedestal de la diosa", texto: "Tres huecos. Arriba hay grabados un león, un unicornio, una doncella... y una serpiente." },
            { x: -7, z: -3.5, nombre: "Taquilla", prop: ["archivador", 1.57], texto: "Una cinta de tinta y munición. Alguien pensaba volver.", accion: { objetos: { cinta: 1, municion: 8 } } },
            { x: 7, z: 1.5, nombre: "Maceta rota", texto: "Una hierba verde crece entre restos de cristal y un dedo arrancado.", accion: { objeto: "hierba_verde", cantidad: 1 } }
          ],
          npcs: [
            { id: "marvin", x: -6.3, z: 6.8, lineas: ["Bien hecho, novato... sigues vivo. Ya es más de lo que puedo decir de mí.", "El pedestal... la inscripción está en recepción.", "Si me levanto con los ojos blancos... no dudes. Una bala. En la frente.", "Tengo tanta hambre, Leon... tu cuello huele... vete. VETE."] }
          ],
          enemigos: [{ id: "zombi", x: 2, z: -7 }] },
        { tipo: "encuentro", enemigo: "licker", modo: "esquiva", rondas: 3, velocidad: 1.1, dano: 30,
          texto: "En el pasillo del ala este, un chasquido húmedo en el techo. Un Licker —cerebro al aire, sin piel, sin ojos— se descuelga. Su lengua corta el aire como un látigo de carne.",
          exito: "Esquivas cada latigazo. Le vacías el cargador en el cerebro expuesto, que revienta contra la pared como fruta podrida.",
          fallo: "La lengua te ha abierto el hombro hasta el hueso. Sangras, pero el Licker cae con el cráneo reventado.",
          muerte: "La lengua del Licker te atravesó la garganta y salió por la nuca. Te arrastró al techo para comer tranquilo." },
        { tipo: "puzzle", id: "re2", ui: "orden", huecos: 3,
          titulo: "La estatua de la diosa",
          enunciado: "Coloca los medallones en el pedestal en el orden correcto. Revisa la inscripción en tus ARCHIVOS.",
          opciones: [
            { id: "LEON", t: "León", icono: "♌" },
            { id: "UNICORNIO", t: "Unicornio", icono: "🦄" },
            { id: "DONCELLA", t: "Doncella", icono: "♍" },
            { id: "SERPIENTE", t: "Serpiente", icono: "🐍" }
          ],
          danoFallo: 8, muerte: "Mientras dudabas, algo cayó del techo y te abrió la espalda en canal.",
          pista: "Lee la inscripción del pedestal: el rey de las bestias abre; quien lleva un cuerno en la frente va en medio; la doncella cierra. La serpiente es un señuelo." },
        { tipo: "maquina" },
        { tipo: "chat", titulo: "Comunicador · frecuencia desconocida", guion: [
          { de: "ada", t: "Un poli novato en mitad del apocalipsis. Qué suerte la mía." },
          { de: "ada", t: "Soy Ada. FBI. Busco a un tal Ben Bertolucci, periodista. Lo tienen encerrado en los calabozos del garaje." },
          { opciones: [
            { t: "¿FBI? No te creo, pero vamos juntos.", marca: "re2_ada_confia", resp: [{ de: "ada", t: "Chico listo. Sigue así y quizá vivas hasta el amanecer." }] },
            { t: "¿Umbrella ha provocado todo esto?", resp: [{ de: "ada", t: "El virus G de Birkin, el virus T... Raccoon City es su placa de Petri, Leon." }] }
          ] },
          { de: "ada", t: "Una cosa más. Ese gigante con gabardina que recorre los pasillos... no se cansa. Nunca. Si lo ves, corre.", efecto: "temblor" }
        ] },
        { tipo: "explorar", titulo: "Calabozos y alcantarillas", imagen: "img/escenarios/re2_cloacas.webp", escenario: "alcantarilla", ancho: 14, fondo: 22, sangre: 6,
          descripcion: "Huele a mierda, a óxido y a muerte. Ada te cubre con su pistola. En el fondo, la celda del periodista y la compuerta de los tapones de ajedrez.",
          salida: { x: 0, z: -11, texto: "Ir a la compuerta" },
          props: [
            ["tuberia", -6.8, -2, 1.57], ["tuberia", 6.8, 3, 1.57], ["barril", 5.8, 8], ["barril", 6.2, 7], ["caja", -6, 9],
            ["colgado", 0, 2, 0, "carne"], ["escombros", -5.5, -6], ["pintada", -6.95, 4, 1.57, "BIRKIN NOS MATÓ"], ["visceras", 1.5, -5]
          ],
          puntos: [
            { x: 5.4, z: -2, nombre: "Celda de Ben", prop: ["jaula", 0, "ben"], texto: "Ben Bertolucci está sentado contra los barrotes. Tiene el pecho abierto desde dentro: las costillas apuntan hacia fuera como dedos. Algo salió de él. En su mano, una grabadora.", requerido: true, accion: { documento: "notas_ben" } },
            { x: -5.4, z: -9.5, nombre: "Operario muerto", prop: ["cadaver", 2.2, "zombi"], texto: "Un operario de la depuradora, partido por la cintura. La mitad inferior no aparece. Tiene una nota en el bolsillo de la camisa.", requerido: true, accion: { documento: "nota_depuradora" } },
            { x: -6, z: 9, nombre: "Caja de herramientas", texto: "Munición del equipo S.W.A.T. y una hierba mezclada.", accion: { objetos: { municion: 10, hierba_mixta: 1 } } },
            { x: 0, z: -4, nombre: "Algo en el agua", texto: "Una masa enorme se mueve bajo el agua negra. Un ojo amarillo del tamaño de una pelota de fútbol te mira desde un hombro. Desaparece.", accion: { susto: "birkin_g", dano: 10, muerte: "Una garra salió del agua y te arrastró a los colectores." } }
          ],
          npcs: [
            { id: "ada", x: -2, z: 8, sigue: true, lineas: ["No te pares, Leon. Los muertos no se cansan; nosotros sí.", "Ben sabía demasiado. Umbrella no deja cabos sueltos.", "Esa cosa del agua es Birkin. O lo que queda de él."] }
          ],
          enemigos: [
            { id: "zombi", x: -3, z: 0 }, { id: "zombi", x: 4, z: -7 },
            { id: "g_adulto", x: 0, z: -8, vida: 5, vel: 1.4, dano: 24, muerte: "El G adulto te inyectó un embrión por la boca. Notaste cómo bajaba por tu garganta, retorciéndose." }
          ] },
        { tipo: "puzzle", id: "re2_leon_ajedrez", ui: "orden", huecos: 4,
          titulo: "Los tapones de la compuerta",
          enunciado: "Cuatro huecos en la compuerta de la depuradora. Coloca los tapones de ajedrez en orden. El operario lo dejó escrito.",
          opciones: [
            { id: "PEON", t: "Peón", icono: "♟" }, { id: "TORRE", t: "Torre", icono: "♜" }, { id: "ALFIL", t: "Alfil", icono: "♝" },
            { id: "REINA", t: "Reina", icono: "♛" }, { id: "REY", t: "Rey", icono: "♚" }, { id: "CABALLO", t: "Caballo", icono: "♞" }
          ],
          danoFallo: 10, muerte: "La compuerta se abrió de golpe. El agua negra te arrastró hasta los filtros, que te cortaron en dados.",
          pista: "Peón, torre, alfil y reina. El rey y el caballo no bajan a las cloacas." },
        { tipo: "chat", titulo: "Pasarela de la planta de tratamiento", guion: [
          { sistema: "Disparo. Un grito. Ada cae al vacío." },
          { de: "annette", t: "¡No te muevas! Esa mujer era una espía. Venía a robar el trabajo de mi marido." },
          { opciones: [
            { t: "¡Ada! ¡¿Por qué has disparado?!", resp: [{ de: "annette", t: "Porque Umbrella la envió. O peor. Y tú eres un poli idiota que se ha creído su sonrisa." }] },
            { t: "¿Quién es usted?", resp: [{ de: "annette", t: "Annette Birkin. Mi marido creó el virus G. Y ahora el virus G es mi marido." }] }
          ] },
          { de: "annette", t: "Si quieres salvar algo de esta ciudad, baja a NEST y actívame la autodestrucción. Yo tengo que encontrar a mi hija." },
          { de: "ada", t: "...Leon... estoy viva. Más o menos. Me he roto algo. Sigue sin mí. Te encontraré.", si: "re2_ada_confia", efecto: "sangre" }
        ] },
        { tipo: "encuentro", enemigo: "mrx", modo: "machaca", veces: 18, tiempo: 5, dano: 45, boton: "¡SUÉLTATE!",
          texto: "PUM. PUM. PUM. Pasos que hacen temblar las pasarelas. El Tyrant atraviesa la pared como si fuera papel, te agarra del cuello y te levanta. Forcejea o te romperá la tráquea.",
          exito: "Le clavas el cuchillo en la muñeca y te sueltas. Ruedas escaleras abajo con el sabor de tu propia sangre en la boca.",
          fallo: "Te estampa contra la barandilla. Oyes crujir tus costillas. Escapas arrastrándote, escupiendo sangre y un diente.",
          muerte: "Mr. X te aplastó el cráneo contra la pasarela. Tu cerebro goteó al agua. Luego se ajustó el sombrero y siguió caminando." },
        { tipo: "explorar", titulo: "NEST · Laboratorio de Umbrella", imagen: "img/escenarios/re2_nest.webp", escenario: "laboratorio", ancho: 18, fondo: 22, sangre: 5, matar: true,
          descripcion: "Blanco quirúrgico manchado de rojo. Cápsulas con cosas que aún se mueven. Las plantas experimentales han roto sus contenedores. Limpia la sala y encuentra la clave del núcleo.",
          salida: { x: 0, z: -11, texto: "Ascensor al núcleo" },
          props: [
            ["capsula", -6, -6, 0, "licker"], ["capsula", -6, -1, 0, "zombi"], ["capsula", 6, -6, 0, "birkin"], ["capsula", 6, -1, 0, "zombi"],
            ["camilla", -3, 6, 0.3, "zombi"], ["mesa", 3, 5], ["estanteria", -8.7, 8, 1.57], ["generador", 7.8, 8.6], ["visceras", 0, 1], ["pintada", 0, -10.95, 0, "G"]
          ],
          puntos: [
            { x: 3.4, z: -9, nombre: "Terminal de William", prop: ["consola", 0], texto: "El diario personal de Birkin sigue abierto en pantalla. Hay sangre en el teclado.", requerido: true, accion: { documento: "diario_birkin" } },
            { x: -3.4, z: -9, nombre: "Terminal de seguridad", prop: ["consola", 0], texto: "Un correo enviado hace dos horas por Annette Birkin.", requerido: true, accion: { documento: "correo_annette" } },
            { x: 3, z: 5.2, nombre: "Mesa de autopsias", texto: "Un guardia de seguridad abierto en canal. Le han extraído algo del pecho con mucho cuidado. Munición y un spray en su cinturón.", accion: { objetos: { municion: 12, spray: 1 } } },
            { x: -8, z: 3, nombre: "Muestra G", texto: "Un vial púrpura que late como un corazón. No lo toques. Ni siquiera lo mires demasiado." }
          ],
          npcs: [],
          enemigos: [
            { id: "ivy", x: -4, z: -4, vida: 5, vel: 0.7, dano: 25, rango: 8, muerte: "La planta 43 te inyectó su veneno. Te pudriste por dentro en treinta segundos." },
            { id: "ivy", x: 4, z: -3, vida: 5, vel: 0.7, dano: 25, rango: 8 },
            { id: "licker", x: 0, z: -7 }, { id: "zombi", figura: "zombi", x: -6, z: 4 }
          ] },
        { tipo: "puzzle", id: "re2_leon_nest", ui: "texto",
          titulo: "Ascensor al núcleo de NEST",
          enunciado: "«INTRODUZCA CLAVE DE EMERGENCIA». Birkin y Annette dejaron pistas sobre ella.",
          pista: "El nombre de su hija, Sherry, escrito en espejo (al revés).",
          placeholder: "Clave de seis letras" },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "mrx", modo: "esquiva", rondas: 4, velocidad: 1.4, dano: 35,
          texto: "En el andén del tren de evacuación, Mr. X cae al fuego... y se levanta. Su piel arde y se desprende. Debajo hay músculo rojo y unas garras largas como espadas. Super Tyrant.",
          exito: "Desde una pasarela, Ada te lanza un lanzacohetes. «¡Leon!». El cohete le revienta el pecho y la cabeza a la vez. Llueve carne caliente.",
          fallo: "Una garra te abre el muslo. Ada te lanza un lanzacohetes. El disparo convierte al Tyrant en una lluvia de vísceras humeantes.",
          muerte: "El Super Tyrant te atravesó el torso con la garra y te levantó como un pincho moruno." },
        { tipo: "narracion", lineas: [
          "La cuenta atrás de autodestrucción resuena por todo NEST. Encuentras a Claire y a una niña, Sherry Birkin, en el andén.",
          "En el tren, algo enorme cae sobre el techo. Lo que fue William Birkin ya es solo una masa de dientes y ojos que busca a su hija.",
          "Desenganchas el vagón. Birkin queda atrapado en la explosión de NEST, que levanta una columna de fuego bajo la ciudad.",
          "Ada ha desaparecido con la muestra G. Te deja un mensaje en el comunicador: «Gracias, Leon». No sabrás de ella en años."
        ] }
      ]
    },

    /* ======================================================================
     *  CLAIRE · ESCENARIO B
     * ==================================================================== */
    {
      id: "claire",
      protagonista: "claire",
      titulo: "Escenario B · La hermana",
      resumen: "Buscas a tu hermano Chris. Encuentras a una niña perseguida por su propio padre, un jefe de policía psicópata y un monstruo que quiere implantarle sus huevos.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Hace semanas que Chris no contesta al teléfono. Su última postal decía: «No vengas». Así que has venido.",
          "Paras tu moto en una gasolinera para pedir indicaciones. El dependiente no contesta. Está ocupado comiéndose los intestinos de un camionero.",
          "Un policía novato, Leon, te salva la vida. Un camión en llamas os separa minutos después.",
          "Tienes una pistola, una chaqueta roja y muy mal carácter. Raccoon City no sabe con quién se ha metido."
        ] },
        { tipo: "explorar", titulo: "Gasolinera de las afueras", imagen: "img/escenarios/re2_calle.webp", escenario: "calle", ancho: 14, fondo: 18, sangre: 6,
          descripcion: "Fluorescentes que zumban, un charco de gasolina y uno de sangre. El dependiente se tambalea entre los surtidores. Tu moto está al fondo.",
          salida: { x: 0, z: -9, texto: "Coger la moto hacia la comisaría" },
          props: [
            ["coche", 4.5, 2, 0, "#7a2020"], ["bidon", -5.8, -6], ["bidon", 6, -7], ["estanteria", -6.6, 4, 1.57], ["estanteria", -6.6, 0, 1.57],
            ["cadaver", 1, 4, 2.2, "zombi"], ["visceras", 1.6, 4.6], ["pintada", 6.95, -2, -1.57, "NO ENTRES"]
          ],
          puntos: [
            { x: -3.4, z: 6.2, nombre: "Mostrador", prop: ["mostrador", 0], texto: "La caja registradora está abierta. Debajo, una postal manchada de café que se te ha caído del bolsillo... y munición de la escopeta del dueño (a ti te sirve la de la pistola).", requerido: true, accion: { documento: "postal_chris", objeto: "municion", cantidad: 10 } },
            { x: -6, z: -3.5, nombre: "Puerta del aseo", texto: "Arañazos en la puerta, por dentro. La abres. Tres cadáveres se levantan del suelo de baldosas.", requerido: true, accion: { aparecen: [{ id: "zombi", x: -4, z: -5 }, { id: "zombi", x: -2.5, z: -6.5 }, { id: "zombi", x: -5, z: -7 }] } },
            { x: 5.8, z: 6.4, nombre: "Nevera de bebidas", prop: ["nevera", -1.57], texto: "Entre los refrescos, alguien guardó una hierba verde y la cabeza de un gato. Te llevas la hierba.", accion: { objeto: "hierba_verde", cantidad: 1 } },
            { x: 1, z: 4, nombre: "Camionero", texto: "El abdomen abierto como una maleta. Le falta el hígado. Hay huellas de dientes en las costillas." }
          ],
          enemigos: [{ id: "zombi", figura: "zombi", x: 2, z: 0 }, { id: "zombi", x: -1, z: -3 }] },
        { tipo: "chat", titulo: "Radio de la comisaría", guion: [
          { sistema: "Has llegado a la R.P.D. Una radio policial cruje en el suelo del vestíbulo." },
          { de: "leon", t: "¿Claire? ¡Estás viva! Estoy en el ala este. Esto es un matadero." },
          { opciones: [
            { t: "¿Has visto a Chris?", resp: [{ de: "leon", t: "No. Pero Marvin dice que los S.T.A.R.S. se fueron hace semanas. Investigaban a Umbrella... y al jefe Irons." }] },
            { t: "Me alegro de oírte, poli.", resp: [{ de: "leon", t: "Lo mismo digo. Ten cuidado con el jefe Irons. Marvin dice que está... raro." }] }
          ] },
          { de: "irons", t: "Señorita Redfield. Qué alegría tener visitas. La hermanita del héroe de los S.T.A.R.S." },
          { de: "irons", t: "Su hermano me desobedecía. Me humillaba. Venga a mi despacho. Le enseñaré mi... colección.", efecto: "temblor" },
          { sistema: "Una niña corre por el pasillo de arriba. Pelo rubio. Tiene un colgante en el cuello. Desaparece por un conducto de ventilación." }
        ] },
        { tipo: "explorar", titulo: "Despacho del jefe Irons", imagen: "img/escenarios/re2_vestibulo.webp", escenario: "oficina", ancho: 12, fondo: 14, sangre: 4, lamparas: 1,
          descripcion: "Madera noble, olor a formol y animales disecados que te miran con ojos de cristal. En la mesa de trabajo hay algo cubierto con una sábana. Irons no está... de momento.",
          salida: { x: 0, z: -7, texto: "Ir a la caja fuerte" },
          props: [
            ["escritorio", 0, -4.5], ["silla", 0, -3.6, 3.14], ["estanteria", -5.4, -2, 1.57], ["sofa", 4.6, 4, -1.57],
            ["cuadro", 0, -6.95, 0, "irons"], ["sangre", 2, 1, 0, 2.5], ["lampara", -5.2, 5.6]
          ],
          puntos: [
            { x: -3.5, z: -6.6, nombre: "Pared norte", texto: "DOS cabezas de ciervo disecadas. Una tiene un ojo humano incrustado en la cuenca.", requerido: true, altura: 2.1 },
            { x: 5.6, z: -1.5, nombre: "Vitrina de lobos", texto: "TRES lobos disecados en posición de ataque. Bajo sus patas, ropa interior de mujer.", requerido: true, prop: ["caja", 0] },
            { x: -5.4, z: 3, nombre: "Rincón del oso", texto: "UN oso enorme, de pie. Alguien le ha metido una mano humana en la boca.", requerido: true, prop: ["pilar", 0] },
            { x: 2.5, z: 2.8, nombre: "Mesa de taxidermia", prop: ["camilla", 0.4, "katherine"], texto: "Bajo la sábana, Katherine Warren, la hija del alcalde. Está abierta del cuello al pubis, rellena de serrín. Irons le ha cosido los párpados abiertos. Debajo de la mesa, una cámara frigorífica: CUATRO bolsas con forma de chica.", requerido: true, accion: { sangre: true } },
            { x: 0, z: -4.2, nombre: "Escritorio de Irons", texto: "Un diario con tapas de piel. Prefieres no pensar de qué piel.", requerido: true, accion: { documento: "diario_irons" } }
          ],
          enemigos: [] },
        { tipo: "puzzle", id: "re2_claire_trofeos", ui: "codigo", digitos: 4,
          titulo: "Caja fuerte de Irons",
          enunciado: "Cuatro cifras. Irons escribió en su diario cómo recordarlas. Los trofeos de la sala te dan los números.",
          danoFallo: 0,
          pista: "Ciervos (2), lobos (3), osos (1) y chicas en la cámara (4): 2314." },
        { tipo: "chat", titulo: "Conducto de ventilación", guion: [
          { de: "sherry_nina", t: "...¿hola? ¿Eres policía?" },
          { opciones: [
            { t: "No, pero soy de las buenas. ¿Cómo te llamas?", marca: "re2_sherry_confia", resp: [{ de: "sherry_nina", t: "Sherry. Sherry Birkin. Mi mamá me dijo que no hablara con nadie. Pero tú tienes cara de buena." }] },
            { t: "Sal de ahí, es peligroso.", resp: [{ de: "sherry_nina", t: "¡No! Ahí fuera está el monstruo. Me busca a mí. Tiene la voz de... de papá." }] }
          ] },
          { de: "irons", t: "Ahí estás, pequeña Birkin. Tu papá tenía algo que me pertenece. Y tú lo llevas colgado del cuello.", efecto: { susto: "irons" } },
          { de: "sherry_nina", t: "¡CLAIRE! ¡Me ha cogido del pelo! ¡AYÚDAME!", efecto: "sangre" }
        ] },
        { tipo: "encuentro", enemigo: "irons", modo: "esquiva", rondas: 3, velocidad: 1.15, dano: 30,
          texto: "Irons sale del despacho con un bisturí de taxidermista y a Sherry bajo el brazo. «¡Serás la joya de mi colección, Redfield!».",
          exito: "Esquivas sus cuchilladas y le disparas en la rodilla. Suelta a Sherry, pero huye por las alcantarillas cojeando y gritando.",
          fallo: "El bisturí te abre la mejilla hasta la oreja. Notas el aire frío en las muelas. Irons huye arrastrando a Sherry.",
          muerte: "Irons te degolló de oreja a oreja. Esa noche empezó a rellenarte de serrín." },
        { tipo: "maquina" },
        { tipo: "narracion", lineas: [
          "Sigues el rastro de sangre de Irons hasta las alcantarillas. Lo encuentras de rodillas, solo. Sherry ha escapado.",
          "Irons se ríe. Luego deja de reírse. Algo le empuja el pecho desde dentro.",
          "Sus costillas se abren como una flor. Un embrión de G, rosado y húmedo, asoma la cabeza entre sus pulmones y chilla.",
          "Birkin le implantó una larva al pasar. El jefe de policía de Raccoon City muere atragantado con su propia sangre."
        ] },
        { tipo: "explorar", titulo: "Orfanato de Raccoon City", imagen: "img/escenarios/re2_orfanato.webp", escenario: "casa", ancho: 14, fondo: 20, sangre: 5, lamparas: 1,
          descripcion: "Camas pequeñas, juguetes rotos y dibujos infantiles en las paredes. Sherry corrió hasta aquí, como le dijo su madre. Algo más corrió detrás de ella.",
          salida: { x: 0, z: -10, texto: "Bajar al pasadizo de Umbrella" },
          props: [
            ["cama", -5, 6, 1.57], ["cama", -5, 2, 1.57, "sangre"], ["cama", -5, -2, 1.57], ["cama", 5, 6, -1.57, "huerfano"], ["cama", 5, 2, -1.57],
            ["muneca", 5.6, -4, 0, "angie"], ["pintada", -6.95, -6, 1.57, "MAMÁ VIENE"], ["piano", 4.8, -8, 3.14], ["cuadro", -3, -9.95, 0, "huerfano"], ["visceras", 0, 0]
          ],
          puntos: [
            { x: 0, z: 0, nombre: "Lo que queda de Irons", texto: "No es Irons. Es otro cadáver: el conserje del orfanato, con el pecho reventado igual que Irons. Las larvas de G se reproducen. Hay rastro de baba hacia los dormitorios.", accion: { sangre: true } },
            { x: -3, z: -9.2, nombre: "Despacho de la directora", prop: ["escritorio", 0], texto: "Una carta escrita por Annette Birkin para su hija, con la letra temblorosa.", requerido: true, accion: { documento: "carta_annette" } },
            { x: 5, z: 2, nombre: "Armario de los dormitorios", texto: "¡Las larvas salen del armario! Tres embriones de G, chillando como recién nacidos, se te tiran a la cara.", requerido: true, accion: { aparecen: [{ id: "g_larva", figura: "g_adulto", x: 3, z: 0, escala: 0.5, vida: 2, vel: 2.4, dano: 12 }, { id: "g_larva", figura: "g_adulto", x: 4, z: -2, escala: 0.5, vida: 2, vel: 2.4, dano: 12 }, { id: "g_larva", figura: "g_adulto", x: 2, z: -3, escala: 0.5, vida: 2, vel: 2.4, dano: 12 }] } },
            { x: -5.5, z: 8.4, nombre: "Baúl de juguetes", texto: "Munición escondida entre ositos de peluche. Alguien preparaba una defensa aquí.", accion: { objetos: { municion: 12, hierba_verde: 1 } } }
          ],
          npcs: [
            { id: "sherry_nina", x: -2, z: 8, sigue: true, dispara: false, lineas: ["Claire... no me dejes sola.", "Mamá dice que el colgante es un secreto. Pesa mucho.", "Me duele la tripa. Mucho. Como si algo se moviera...", "¿Papá ya no es papá, verdad?"] }
          ],
          enemigos: [{ id: "zombi", x: 3, z: 6 }, { id: "perro", x: -3, z: -5 }] },
        { tipo: "chat", titulo: "Canal de NEST · Annette", guion: [
          { de: "annette", t: "¿Quién eres? ¿Por qué tienes a mi hija?" },
          { opciones: [
            { t: "La he estado protegiendo mientras usted no estaba.", resp: [{ de: "annette", t: "...Gracias. Supongo que me lo merezco." }] },
            { t: "Su marido la persigue. ¿Qué le ha hecho a su propia hija?", resp: [{ de: "annette", t: "William ya no razona. El G busca un huésped compatible. Su sangre." }] }
          ] },
          { de: "annette", t: "Escúchame. William le ha implantado un embrión a Sherry. Si no le pones la vacuna DEVIL en las próximas horas, eclosionará." },
          { de: "sherry_nina", t: "Claire... me duele... estoy vomitando algo negro...", efecto: "sangre" },
          { de: "annette", t: "La receta está en el ala oeste de NEST. Hazlo por ella. Yo voy a ocuparme de William." }
        ] },
        { tipo: "encuentro", enemigo: "birkin_g", modo: "esquiva", rondas: 3, velocidad: 1.3, dano: 40,
          texto: "En el tren de mercancías, el techo se abolla. Birkin en su segunda forma entra a zarpazos: un brazo nuevo le crece del pecho y otro ojo se abre en su espalda. «Sheeerryyy...».",
          exito: "Esquivas sus garras y le vacías el cargador en el ojo del hombro, que revienta como una uva gigante. Cae del tren aullando.",
          fallo: "Una garra te arranca un trozo de hombro. Ves tu propia clavícula. Birkin cae del tren, pero volverá.",
          muerte: "Birkin te partió en dos de un zarpazo. Las dos mitades cayeron del tren por lados distintos." },
        { tipo: "explorar", titulo: "NEST · Ala oeste", imagen: "img/escenarios/re2_nest.webp", escenario: "laboratorio", ancho: 16, fondo: 22, sangre: 6, matar: true,
          descripcion: "Sherry está tumbada en la enfermería, ardiendo de fiebre. La estación de síntesis está al fondo. Limpia el laboratorio y consigue el protocolo DEVIL.",
          salida: { x: 0, z: -11, texto: "Ir a la estación de síntesis" },
          props: [
            ["camilla", -5.5, 7, 1.57, "sherry_nina"], ["capsula", 6, -6, 0, "g_adulto"], ["capsula", 6, -2, 0, "licker"], ["estanteria", -7.7, -3, 1.57],
            ["mesa", 0, 2], ["generador", -6.8, -9], ["visceras", 3, 4], ["pintada", 7.95, 4, -1.57, "PROYECTO G"]
          ],
          puntos: [
            { x: 0, z: 2.2, nombre: "Notas de Annette", texto: "El protocolo DEVIL, escrito a mano por Annette. Hay manchas de lágrimas.", requerido: true, accion: { documento: "receta_devil" } },
            { x: -5.5, z: 5.6, nombre: "Sherry en la camilla", texto: "Sherry delira. Bajo la piel de su vientre, algo del tamaño de un puño se mueve. Le das la mano. Está ardiendo.", requerido: true },
            { x: 4, z: 8.5, nombre: "Taquilla del personal", prop: ["archivador", -1.57], texto: "Munición, un spray y una hierba mezclada.", accion: { objetos: { municion: 14, spray: 1 } } }
          ],
          enemigos: [
            { id: "licker", x: 0, z: -6 }, { id: "licker", x: -4, z: -8 },
            { id: "zombi", x: 4, z: -4 }, { id: "zombi", x: -3, z: -2 }
          ] },
        { tipo: "puzzle", id: "re2_claire_devil", ui: "orden", huecos: 4,
          titulo: "Estación de síntesis · DEVIL",
          enunciado: "Carga los componentes en el orden del protocolo de Annette. Sherry no aguantará mucho más.",
          tiempoLimite: 90, danoTiempo: 20,
          opciones: [
            { id: "BASE", t: "Base de cultivo", icono: "🧪" }, { id: "CATALIZADOR", t: "Catalizador", icono: "⚗️" },
            { id: "MUESTRA", t: "Muestra de G", icono: "🧬" }, { id: "ESTABILIZADOR", t: "Estabilizador", icono: "💉" },
            { id: "SANGRE", t: "Sangre de Sherry", icono: "🩸" }
          ],
          danoFallo: 15, muerte: "La mezcla estalló. El vapor de G te derritió la cara hasta dejarte el hueso a la vista.",
          pista: "Base, catalizador, muestra de G y estabilizador. Nunca la sangre de Sherry." },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "birkin_g", modo: "machaca", veces: 22, tiempo: 6, dano: 45, boton: "¡INYECTA LA VACUNA!",
          texto: "Le pones la vacuna a Sherry... y el andén tiembla. Birkin, convertido en una masa de carne de diez metros con cientos de dientes, se arrastra hacia vosotras. ¡Sujeta a Sherry y aguanta!",
          exito: "La vacuna hace efecto: Sherry vomita el embrión muerto. Desenganchas el vagón y Birkin queda atrás, gritando el nombre de su hija entre las llamas.",
          fallo: "Un tentáculo te arranca dos dedos. Aun así, la vacuna funciona y logras desenganchar el vagón.",
          muerte: "Birkin os absorbió a las dos. Durante horas, desde dentro de esa masa, todavía se oyó a Sherry llamar a su madre." },
        { tipo: "narracion", lineas: [
          "Annette Birkin muere en tus brazos, con un pedazo de su marido clavado en el estómago. «Cuida de ella», susurra.",
          "El tren sale de NEST segundos antes de que todo explote. Leon está a bordo. También Sherry, temblando y viva.",
          "No has encontrado a Chris. Pero al amanecer, mirando la ciudad en llamas, sabes que está vivo. Y que irás a buscarlo a Europa.",
          "Sherry se queda dormida en tu regazo. Aún no lo sabes, pero el virus G nunca saldrá del todo de su sangre."
        ] }
      ]
    }
  ]
});
