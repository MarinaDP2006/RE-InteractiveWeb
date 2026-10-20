/* ============================================================================
 *  ARCHIVO IV · RESIDENT EVIL 5 (2009) — Chris Redfield · Sheva Alomar
 *  Soluciones: Puzzles.java (re5, re5_chris_muelle, re5_sheva_ndipaya)
 * ========================================================================== */

"use strict";

Object.assign(DOCUMENTOS, {
  email_excella: {
    titulo: "Correo interno de Tricell",
    estilo: "email",
    texto: `DE: Excella Gionne <e.gionne@tricell.int>
PARA: Albert Wesker
ASUNTO: Proyecto U _ O _ O _ O S

Albert:
Los sujetos de prueba siguen rechazando el virus.
Uno de cada mil sobrevive. El resto... ya has visto las fotos.
Se deshacen en una masa de gusanos negros que se come
todo lo que tiene cerca. Incluido el personal.

Insistes en el nombre del proyecto: la serpiente que se muerde
la cola, símbolo de renacimiento eterno. Me parece teatral,
pero será también la contraseña de tu consola privada.

Por cierto, la mujer rubia del dispositivo P30 obedece cada
vez mejor. Qué ironía que fuera compañera de Redfield.

— E.`
  },
  diario_fisher: {
    titulo: "Diario de Reynard Fisher (B.S.A.A.)",
    estilo: "sangre",
    texto: `Día 1. Kijuju. Los vecinos me miran raro. Como si me midieran.

Día 2. He visto a un hombre al que le salía un manojo de
tentáculos de la boca, como una flor de carne. Se lo comió
a un perro. Entero. Con collar.

Día 3. Irving, el contacto de Tricell, vende algo en los
muelles. Le he seguido. Cajas con el logo de Umbrella.
Umbrella está muerta, dicen. Mentira.

Día 4. Me han visto. Hay una turba en la puerta. Tienen un
hacha gigante y un hombre con un saco en la cabeza.
Si la B.S.A.A. encuentra esto: no vengáis con menos de
un batallón. Y matad a Irving.`
  },
  recibo_irving: {
    titulo: "Albarán ensangrentado de Irving",
    estilo: "papel",
    texto: `TRICELL AFRICA · DEPARTAMENTO DE RECURSOS

Envío especial para el señor R. Irving.
Mercancía: «material biológico de prueba».

Ubicación en el muelle:
  LOTE ............... 4
  CONTENEDOR ......... 7
  MUELLE ............. 2
  SUJETOS VIVOS ...... 1

Código del candado: lote, contenedor, muelle y sujetos,
en ese orden. No lo apuntes en ningún sitio, Ricardo.

[Alguien ha escrito encima con un rotulador:]
«Ups. Ja, ja. — R.I.»`
  },
  inscripcion_ndipaya: {
    titulo: "Inscripción de las ruinas Ndipaya",
    estilo: "informe",
    texto: `[Traducción de la piedra, hecha a mano por Sheva]

«Al principio fue el SOL, que da la vida.
Después, la TIERRA, que la recibe y la guarda.
Luego la LUNA, que la vela mientras duerme.
Y al final la ESTRELLA, que guía a los muertos
hacia la escalera del sol.

Quien ponga a la serpiente en el camino
no volverá a ver ninguna de las cuatro.»

Nota de Sheva: Los Ndipaya cuidaban unas flores
que crecen en estas cuevas. Umbrella vino en los
años 60 y los mató a todos por ellas.`
  },
  notas_flores: {
    titulo: "Notas de campo de Spencer (1966)",
    estilo: "informe",
    texto: `EXPEDICIÓN A LAS CUEVAS NDIPAYA · O. SPENCER

Las flores llamadas «Escalera al Sol» contienen un virus
sin precedentes. Lo llamaremos Progenitor.
Los Ndipaya las usaban para elegir a sus reyes: quien
sobrevivía al veneno, reinaba. Morían diecinueve de cada veinte.

Hemos adquirido los derechos de la cueva. Los Ndipaya no
estaban dispuestos a negociar, así que hemos negociado
con ellos a nuestra manera. Las fosas están al este.

De este virus nacerán el T, el G y todo lo demás.
Es el principio de la humanidad nueva. Mi humanidad.`
  },
  informe_p30: {
    titulo: "Informe médico · Sujeto P30",
    estilo: "informe",
    texto: `SUJETO: Jill Valentine (ex S.T.A.R.S., ex B.S.A.A.)
ESTADO: Operativa. Control mental: 100 %.

Tras caer de un acantilado con A. Wesker en 2006, la sujeto
permaneció en coma. El virus T-Veronica que portaba produjo
anticuerpos únicos: la base del virus Uroboros.

El dispositivo P30, implantado en el esternón, inyecta el
compuesto de forma continua. La sujeto obedece cualquier orden.
Efectos secundarios: decoloración del cabello, palidez, llanto
espontáneo durante el combate. Ignorar.

Si se retira el dispositivo bruscamente: dolor extremo.
Probable supervivencia.`
  }
});

HISTORIA.capitulos.push({
  id: "re5",
  juego: "Resident Evil 5",
  titulo: "Uroboros",
  anio: "Marzo de 2009",
  lugar: "Kijuju, África · Pantanos · Laboratorio de Tricell",
  tema: "tema-re5",
  fondoImagen: "img/escenarios/re5.webp",
  variantes: {jill: "jill_re5"},
  rutas: [

    /* ======================================================================
     *  CHRIS REDFIELD
     * ==================================================================== */
    {
      id: "chris",
      protagonista: "chris",
      titulo: "Once años después de la mansión",
      resumen: "Hace tres años perdiste a Jill en una pelea contra Wesker. Ahora la B.S.A.A. te envía a África tras un traficante de armas biológicas. Wesker está vivo. Jill... nadie encontró su cuerpo.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Eres Chris Redfield, de la B.S.A.A. Hace tres años perdiste a Jill Valentine en una pelea contra Albert Wesker.",
          "Wesker está vivo. Jill... nadie encontró su cuerpo. Tú no has dejado de buscarla.",
          "En Kijuju el sol abrasa. Los vecinos te miran como si te midieran para un ataúd.",
          "En la plaza, una multitud golpea algo dentro de un saco. El saco se mueve. Y grita."
        ] },
        { tipo: "chat", titulo: "B.S.A.A. · Equipo Alfa", guion: [
          { de: "sheva", t: "Chris, soy Sheva Alomar, tu compañera. Tricell oculta un laboratorio bajo los pantanos." },
          { de: "sheva", t: "He visto a un hombre al que le salían patas de insecto de la boca. Esto no es una enfermedad, es un arma." },
          { opciones: [
            { t: "Lo sé. Llevo media vida luchando contra esto.", resp: [{ de: "sheva", t: "Entonces lideras tú. Pero no me dejes atrás." }] },
            { t: "¿Has visto a una mujer rubia con un dispositivo en el pecho?", marca: "re5_chris_jill", resp: [{ de: "sheva", t: "Una mujer encapuchada con Wesker... sí. Peleaba como una máquina." }] }
          ] },
          { de: "josh", t: "Aquí Josh Stone, equipo Delta. Irving, el traficante, está en el pueblo. Tened cuidado: los Majini no son zombis. Usan armas. Y estrategia." }
        ] },
        { tipo: "explorar", titulo: "Kijuju · Plaza pública", imagen: "img/escenarios/re5_kijuju.webp", escenario: "africa", ancho: 22, fondo: 28, sangre: 6,
          descripcion: "Polvo, moscas y un charco de sangre en el centro de la plaza. Los vecinos se giran hacia ti a la vez. Sheva te cubre. Encuentra el diario del agente Fisher.",
          salida: { x: 0, z: -14, texto: "Ir hacia los muelles" },
          props: [
            ["casa", -8, -6], ["casa", 8, 4, 1.57], ["casa", -8, 9, 3.14], ["coche", 5, -9, 0.4, "#6a5a3a"], ["barril", 3, 6], ["barril", 3.6, 6.6],
            ["arbol_seco", 9, -11], ["arbol_seco", -4, 12], ["bidon", -2, -5], ["valla", -6, -12]
          ],
          puntos: [
            { x: 0, z: 0, nombre: "La ejecución", prop: ["sangre", 0, 3.5], texto: "En el saco había un hombre. Le han molido a palos hasta que la cabeza se le ha quedado plana. Uno de los Majini levanta la cabeza del charco y te mira. Sonríe con la boca llena de dientes ajenos.", requerido: true, accion: { aparecen: [{ id: "verdugo", x: 0, z: -10, vida: 12, muerte: "El Verdugo te cortó en dos de un solo hachazo. Sheva gritó tu nombre.", ataque: "El hacha del Verdugo te roza las costillas y abre la carne." }] } },
            { x: -8, z: -3.6, nombre: "Casa del agente Fisher", texto: "El agente de la B.S.A.A. Reynard Fisher, clavado a la pared con una lanza. Le han vaciado la cuenca de los ojos. Su diario está en el suelo.", requerido: true, accion: { documento: "diario_fisher" } },
            { x: 3.2, z: 6.8, nombre: "Barriles", texto: "Munición de la B.S.A.A. escondida por Fisher.", accion: { objetos: { municion: 18 } } },
            { x: 8, z: 1.6, nombre: "Puesto del mercado", texto: "Fruta podrida, carne de dudosa procedencia y una hierba verde.", accion: { objeto: "hierba_verde", cantidad: 1 } }
          ],
          npcs: [
            { id: "sheva", x: 2, z: 11, sigue: true, lineas: ["¡Chris, cuidado! ¡Van armados!", "Esta era mi tierra. Ahora mira lo que han hecho.", "Te cubro. ¡Muévete!", "Si te muerden, te pego un tiro. Lo digo en serio."] }
          ],
          enemigos: [
            { id: "majini", x: -3, z: 3 }, { id: "majini", x: 4, z: 1 }, { id: "majini", x: -5, z: -4 }, { id: "majini", x: 2, z: -6 }, { id: "majini", x: 6, z: -3 }
          ] },
        { tipo: "chat", titulo: "Canal de la B.S.A.A.", guion: [
          { de: "josh", t: "Chris... el equipo Alfa ha caído. Todos. Una cosa gigante salió de debajo de la tierra y se los tragó." },
          { de: "irving", t: "¡Hola, hola! ¿La B.S.A.A.? Me encantan los soldaditos. Se rompen igual que los demás." },
          { opciones: [
            { t: "Irving, te voy a encontrar.", resp: [{ de: "irving", t: "Estoy en los muelles. Te espero con un regalito. Pista: tiene muchos tentáculos. Ja, ja, ja." }] },
            { t: "¿Quién te paga, Irving?", resp: [{ de: "irving", t: "Una señora muy guapa y un señor con gafas de sol. Pagan bien. Matan mejor." }] }
          ] },
          { de: "sheva", t: "Los muelles están en los pantanos. Iré contigo. No pienso dejar que ese cerdo se escape." }
        ] },
        { tipo: "explorar", titulo: "Muelles de los pantanos", imagen: "img/escenarios/re5_campos.webp", escenario: "pantano", ancho: 20, fondo: 26, sangre: 5,
          descripcion: "Agua verde, barcazas oxidadas y contenedores de Tricell. Los Majini del pantano llevan pinturas de guerra y ballestas. Busca el albarán de Irving: abre su contenedor.",
          salida: { x: 0, z: -13, texto: "Ir al contenedor de Irving" },
          props: [
            ["barca", -7, 6, 0.3], ["barca", 7.5, -3, -0.2], ["caja", -6, -6], ["caja", -6, -7.1], ["caja", -4.9, -6.5], ["vagon", 6, 8, 0],
            ["arbol", -9, -11], ["arbol", 9, -11], ["colgado", 0, 4, 0, "majini"], ["hoguera", -2, -2]
          ],
          puntos: [
            { x: -4, z: -4.8, nombre: "Caseta del capataz", prop: ["mesa", 0], texto: "Un albarán de Tricell manchado de sangre... y el capataz, sentado, con la cabeza en el regazo. Literalmente.", requerido: true, accion: { documento: "recibo_irving" } },
            { x: 7.5, z: -1, nombre: "Barcaza", texto: "Munición y una hierba mezclada entre redes de pesca y dedos.", accion: { objetos: { municion: 15, hierba_mixta: 1 } } },
            { x: -7, z: 3.6, nombre: "Barca hundida", texto: "¡Algo sale del agua! Un perro Adjule, con la cabeza abierta en flor de tentáculos.", accion: { susto: "perro", dano: 12, muerte: "La Plaga del perro te envolvió la cabeza y tiró. Tu cuello no aguantó.", aparecen: [{ id: "perro", x: -5, z: 1 }, { id: "perro", x: -4, z: 2 }] } }
          ],
          npcs: [
            { id: "sheva", x: 2, z: 10, sigue: true, lineas: ["Este agua huele a cadáver.", "Irving está cerca. Lo noto.", "Chris... ¿de verdad crees que Jill está viva?"] }
          ],
          enemigos: [
            { id: "majini", x: -2, z: 2 }, { id: "majini", x: 3, z: -2 }, { id: "majini", x: 0, z: -8 }, { id: "majini", x: 5, z: -9 }
          ] },
        { tipo: "puzzle", id: "re5_chris_muelle", ui: "codigo", digitos: 4,
          titulo: "Candado del contenedor",
          enunciado: "Cuatro cifras. El albarán de Irving dice exactamente cómo formar el código.",
          danoFallo: 5,
          pista: "Lote 4, contenedor 7, muelle 2, 1 sujeto vivo: 4721." },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "irving", modo: "esquiva", rondas: 4, velocidad: 1.35, dano: 40,
          texto: "Irving se inyecta una Plaga dominante. Su cuerpo revienta y se funde con un calamar gigante del pantano: una masa de tentáculos de veinte metros con su cara gritando en el centro.",
          exito: "Esquivas sus tentáculos y Sheva le dispara al ojo. Le metes una granada en la boca. Irving revienta y llueven trozos de calamar y de traficante.",
          fallo: "Un tentáculo te rodea la pierna y te arrastra al agua. Sheva corta el tentáculo. Irving muere gritando «¡No es justo!».",
          muerte: "Irving te arrastró bajo el agua del pantano. Te comió a trocitos durante una semana." },
        { tipo: "explorar", titulo: "Laboratorio de Tricell", imagen: "img/escenarios/re5_laboratorio.webp", escenario: "laboratorio", ancho: 18, fondo: 22, sangre: 6, matar: true,
          descripcion: "Cápsulas con cuerpos flotando en líquido verde. Pantallas parpadeantes. Gritos lejanos. Limpia el laboratorio y accede a la consola de Wesker.",
          salida: { x: 0, z: -11, texto: "Acceder a la consola" },
          props: [
            ["capsula", -6, -6, 0, "majini"], ["capsula", -6, -1, 0, "uroboros"], ["capsula", 6, -6, 0, "jill_p30"], ["capsula", 6, -1, 0, "majini"],
            ["camilla", 3, 6, -0.3, "majini"], ["generador", -7.8, 8.6], ["estanteria", 8.7, 4, -1.57], ["visceras", -2, 3]
          ],
          puntos: [
            { x: -3, z: -9, nombre: "Terminal de Excella", prop: ["consola", 0], texto: "Un correo abierto, sin cerrar sesión. Descuidada.", requerido: true, accion: { documento: "email_excella" } },
            { x: 6, z: -4.7, nombre: "Cápsula de la mujer rubia", texto: "Está vacía. Pero la etiqueta dice: «Sujeto P30». Y hay un pelo largo, rubio, pegado al cristal.", requerido: true, accion: { documento: "informe_p30" } },
            { x: -6, z: 0.3, nombre: "Cápsula de incubación", texto: "Un hombre flota dentro, con la caja torácica abierta en flor. Gusanos negros le salen de los ojos. Uroboros.", accion: { sangre: true } },
            { x: 3, z: 6.6, nombre: "Camilla", texto: "Un Majini atado con la cabeza abierta. Munición y spray en la bandeja del instrumental.", accion: { objetos: { municion: 15, spray: 1 } } }
          ],
          npcs: [
            { id: "sheva", x: 0, z: 9, sigue: true, lineas: ["Esto es... un matadero.", "Mira esas cápsulas. Hay niños, Chris.", "Si Wesker está aquí, lo mato yo."] }
          ],
          enemigos: [
            { id: "uroboros", x: 0, z: -4, vida: 10, vel: 1.1, dano: 35, rango: 12, muerte: "Uroboros te envolvió en gusanos negros y te absorbió. Tu cara quedó flotando en su superficie, todavía gritando." },
            { id: "majini", x: -4, z: -6 }, { id: "majini", x: 4, z: -7 }
          ] },
        { tipo: "puzzle", id: "re5", ui: "texto",
          titulo: "Consola privada de Wesker",
          enunciado: "Introduce la contraseña. Excella mencionó algo en su correo...",
          pista: "El nombre del proyecto es la serpiente que se muerde la cola. El correo muestra U _ O _ O _ O S. Es el nombre del virus de Wesker.",
          placeholder: "Contraseña" },
        { tipo: "chat", titulo: "Canal abierto · Jill", guion: [
          { de: "jill_p30", t: "..." },
          { de: "jill_p30", t: "Chris... no puedo... controlar... mi cuerpo." },
          { de: "jill_p30", t: "El dispositivo... en mi pecho... arráncalo." },
          { opciones: [
            { t: "Jill, aguanta. Voy a sacarte de esto.", resp: [{ de: "jill_p30", t: "Date prisa... me obliga a apuntarte..." }] },
            { t: "Te hemos buscado durante tres años, compañera.", resp: [{ de: "jill_p30", t: "Lo sé... lo vi todo... a través de sus ojos..." }] }
          ] },
          { de: "wesker", t: "Qué escena tan conmovedora. Jill, mata a tu compañero. Despacio.", efecto: "temblor" }
        ] },
        { tipo: "encuentro", enemigo: "jill_p30", modo: "machaca", veces: 18, tiempo: 5, dano: 30, boton: "¡ARRANCA EL P30!",
          texto: "Jill ataca a una velocidad imposible. Sheva la inmoviliza. ¡Arranca el dispositivo P30 de su pecho!",
          exito: "El dispositivo se suelta con un chasquido de carne. Jill cae en tus brazos, temblando. «Chris... gracias».",
          fallo: "Jill te patea la cara antes de que lo consigas. Al final el dispositivo cede, con sangre en tus nudillos.",
          muerte: "Jill, controlada por el P30, te rompió el cuello sin dejar de llorar." },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "wesker", modo: "esquiva", rondas: 5, velocidad: 1.5, dano: 35,
          texto: "En el corazón de un volcán, Wesker, medio fundido con Uroboros, sale de la lava. Tentáculos negros brotan de su espalda. «¡Chris! ¡Siete minutos! ¡Siete minutos es todo lo que puedo darte!».",
          exito: "Esquivas cada embestida. Sheva y tú le disparáis dos cohetes a la cara a la vez. La cabeza de Wesker estalla dentro del magma. Fin del hombre que quiso ser dios.",
          fallo: "Un tentáculo te abre el costado. Sangras sobre la roca ardiente. Aun así, los dos cohetes le arrancan la cabeza.",
          muerte: "Wesker te arrancó el corazón con la mano desnuda y lo aplastó delante de tu cara." },
        { tipo: "narracion", lineas: [
          "Excella muere devorada por su propio virus, convertida en una montaña de tentáculos que grita en italiano.",
          "Wesker se hunde en la lava. Dos cohetes en la cara. Fin.",
          "Jill está a salvo. Sheva te pregunta si merece la pena seguir luchando en un mundo así.",
          "Le dices que quieres vivir en un mundo por el que merezca la pena luchar. Ninguno de los dos sabe si existe."
        ] }
      ]
    },

    /* ======================================================================
     *  SHEVA ALOMAR
     * ==================================================================== */
    {
      id: "sheva",
      protagonista: "sheva",
      titulo: "La hija de Kijuju",
      resumen: "Umbrella mató a tus padres cuando eras niña. Creciste huérfana, guerrillera y luego agente de la B.S.A.A. Ahora vuelves a casa. Y descubres de dónde salió todo esto: unas flores en una cueva.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Eres Sheva Alomar. Naciste en Kijuju. Tenías siete años cuando una fuga de Umbrella convirtió a tus padres en monstruos.",
          "Los viste morir. Los viste levantarse. Viste cómo los soldados de Umbrella los quemaban vivos.",
          "Te criaste en la calle. Luego en la guerrilla. Luego en la B.S.A.A. Todo para volver aquí.",
          "Tu compañero es un yanqui con bíceps del tamaño de tu cabeza, Chris Redfield. Parece buena persona. Todos lo parecen."
        ] },
        { tipo: "chat", titulo: "B.S.A.A. · Equipo Delta", guion: [
          { de: "chris", t: "Sheva, ¿conoces la zona?" },
          { opciones: [
            { t: "Es mi casa. O lo era. Conozco cada callejón.", marca: "re5_sheva_casa", resp: [{ de: "chris", t: "Entonces tú lideras. Yo disparo." }] },
            { t: "Lo suficiente para saber que no deberías estar aquí.", resp: [{ de: "chris", t: "Nadie debería estar aquí, Sheva. Por eso vinimos." }] }
          ] },
          { de: "josh", t: "Sheva. Soy Josh. He encontrado unas ruinas Ndipaya al sur. Tricell ha estado excavando. Hay algo bajo las ruinas." },
          { de: "josh", t: "La entrada tiene un mecanismo de losas. Tu abuela te enseñó las leyendas, ¿no? Te espero allí." }
        ] },
        { tipo: "explorar", titulo: "Aldea Ndipaya", imagen: "img/escenarios/re5_kijuju.webp", escenario: "africa", ancho: 22, fondo: 26, sangre: 5, ambiente: { niebla: "#3a2010", cielo: "#6a3a1a" },
          descripcion: "Chozas de barro, máscaras rituales y guerreros Majini con lanzas y escudos. Josh te espera junto a las ruinas. Copia la inscripción de la piedra.",
          salida: { x: 0, z: -13, texto: "Entrar en las ruinas" },
          props: [
            ["casa", -8, -5], ["casa", 8, 6, 1.57], ["casa", 8, -7, -1.57], ["hoguera", 0, 3], ["arbol_seco", -9, 9], ["arbol_seco", 4, 10],
            ["altar", 0, -10], ["cruz", -5, -10, 0, "majini"], ["tumba", 5, -10], ["visceras", 3, 0]
          ],
          puntos: [
            { x: 0, z: -9.2, nombre: "Piedra de las ruinas", texto: "Una losa con símbolos Ndipaya. Los traduces de memoria: tu abuela te los cantaba para dormir.", requerido: true, accion: { documento: "inscripcion_ndipaya" } },
            { x: -5, z: -9, nombre: "El crucificado", texto: "Un hombre clavado a una cruz con espinas. La Plaga le ha salido por la boca y cuelga hasta el ombligo, latiendo. Todavía está vivo. Le disparas.", accion: { sangre: true } },
            { x: -8, z: -2.6, nombre: "Choza del chamán", texto: "Munición de la B.S.A.A. y unas hierbas que reconoces: tu abuela las usaba para todo.", accion: { objetos: { municion: 16, hierba_verde: 2 } } },
            { x: 8, z: 3.6, nombre: "Choza grande", texto: "¡Dentro hay un Majini gigante encadenado! Rompe la cadena.", accion: { susto: "gigante", dano: 10, muerte: "El gigante Ndesu te aplastó el cráneo con su puño.", aparecen: [{ id: "majini", x: 6, z: 1 }, { id: "majini", x: 5, z: 3 }] } }
          ],
          npcs: [
            { id: "josh", x: -2, z: 10, sigue: true, lineas: ["Sheva. Me alegro de verte viva.", "Tricell sacó cientos de cajas de estas ruinas.", "Te entrené yo, ¿recuerdas? Apunta a la cabeza.", "Chris es buen tipo. Pero está obsesionado. Cuida de él."] }
          ],
          enemigos: [
            { id: "majini", x: -3, z: 0 }, { id: "majini", x: 3, z: -3 }, { id: "majini", x: -1, z: -6 }, { id: "majini", x: 5, z: -1 }
          ] },
        { tipo: "puzzle", id: "re5_sheva_ndipaya", ui: "orden", huecos: 4,
          titulo: "Las losas de las ruinas",
          enunciado: "Cuatro losas en el suelo de la entrada. Písalas en el orden de la inscripción Ndipaya.",
          opciones: [
            { id: "SOL", t: "Sol", icono: "☀️" }, { id: "TIERRA", t: "Tierra", icono: "🌍" }, { id: "LUNA", t: "Luna", icono: "🌙" },
            { id: "ESTRELLA", t: "Estrella", icono: "⭐" }, { id: "SERPIENTE", t: "Serpiente", icono: "🐍" }
          ],
          danoFallo: 12, muerte: "Las losas se abrieron. Caíste sobre estacas de hueso. Una te entró por la barbilla y te salió por la coronilla.",
          pista: "Sol, tierra, luna y estrella. La serpiente es una trampa." },
        { tipo: "encuentro", enemigo: "gigante", modo: "machaca", veces: 20, tiempo: 5, dano: 40, boton: "¡CORTA LA PLAGA!",
          texto: "Ndesu, el gigante Majini, te sigue dentro de las ruinas. Una Plaga enorme le asoma por la espalda. Trepa y córtala mientras Josh lo distrae.",
          exito: "Le cortas la Plaga de raíz. Ndesu se desploma y aplasta la escalera. Josh te choca la mano.",
          fallo: "Te agarra del tobillo y te golpea contra la pared. Cortas la Plaga con la nariz rota.",
          muerte: "Ndesu te aplastó contra la escalera de piedra hasta que dejaste de ser una persona." },
        { tipo: "maquina" },
        { tipo: "chat", titulo: "Cuevas · señal débil", guion: [
          { de: "chris", t: "Sheva, he encontrado a Jill. Viva. La controlan con un dispositivo. Wesker está aquí." },
          { de: "excella", t: "Qué valiente la niña de Kijuju. ¿Sabes qué hay en esas cuevas, querida? El origen de todo. Mi herencia." },
          { opciones: [
            { t: "Lo que hay es la tumba de mi pueblo, bruja.", resp: [{ de: "excella", t: "Tu pueblo era un estorbo. Igual que tú." }] },
            { t: "¿Qué queréis hacer con el virus?", resp: [{ de: "excella", t: "Albert quiere un mundo nuevo. Yo quiero ser su reina. ¿Ves? Ambiciones sencillas." }] }
          ] }
        ] },
        { tipo: "explorar", titulo: "Cuevas de la Escalera al Sol", imagen: "img/escenarios/re5_ruinas.webp", escenario: "mina", ancho: 18, fondo: 24, sangre: 4, matar: true, ambiente: { luz: "#ffd27a" },
          descripcion: "Una caverna inmensa llena de flores doradas que brillan en la oscuridad. Aquí empezó todo: el virus Progenitor. Los sujetos de Uroboros vagan entre las flores.",
          salida: { x: 0, z: -12, texto: "Seguir al barco de Tricell" },
          props: [
            ["escombros", -6, -7], ["escombros", 6, 5], ["altar", 0, -9], ["tumba", -6, 6], ["tumba", -5, 8], ["tumba", -7, 9],
            ["capsula", 6, -6, 0, "uroboros"], ["visceras", 2, -2], ["pintada", -8.95, 0, 1.57, "UMBRELLA 1966"]
          ],
          puntos: [
            { x: 0, z: -8.2, nombre: "Campamento de Spencer", texto: "Restos de una expedición de los años 60. Unas notas firmadas por Ozwell Spencer. Y fosas comunes al lado.", requerido: true, accion: { documento: "notas_flores" } },
            { x: -6, z: 7, nombre: "Fosas Ndipaya", texto: "Huesos. Cientos. Cráneos de niños con agujeros de bala en la nuca. Tu pueblo.", requerido: true, accion: { sangre: true } },
            { x: 6, z: 3, nombre: "Mochila de Josh", texto: "Josh dejó munición y un spray para ti. «Volveré», ha escrito.", accion: { objetos: { municion: 18, spray: 1 } } }
          ],
          enemigos: [
            { id: "uroboros", x: -2, z: -4, vida: 8, vel: 1, dano: 30, muerte: "Uroboros te tragó entre las flores doradas. Las flores crecieron sobre ti." },
            { id: "uroboros", x: 3, z: -6, vida: 8, vel: 1, dano: 30 }, { id: "majini", x: 0, z: 2 }
          ] },
        { tipo: "encuentro", enemigo: "uroboros", modo: "esquiva", rondas: 4, velocidad: 1.35, dano: 40,
          texto: "En el barco, Excella se inyecta Uroboros por traición de Wesker. Su cuerpo explota en una montaña de tentáculos negros de cuarenta metros. Su torso desnudo sigue gritando en lo alto.",
          exito: "Disparas a los ojos de luz de la masa. Chris le revienta el núcleo con un cañón solar. Excella se derrite gritando «¡Albert!».",
          fallo: "Un tentáculo te azota y te parte el brazo. Chris te cubre y revienta el núcleo. Excella se derrite.",
          muerte: "La masa de Excella te absorbió. Durante un segundo, sentiste todos sus pensamientos. Eran de Wesker." },
        { tipo: "explorar", titulo: "Barco de Tricell · Puente de mando", imagen: "img/escenarios/re5_barco.webp", escenario: "barco", ancho: 14, fondo: 18, sangre: 5,
          descripcion: "El buque de Excella navega hacia el bombardero de Wesker. Su consola privada controla el lanzamiento de Uroboros. Encuentra la contraseña.",
          salida: { x: 0, z: -9, texto: "Acceder a la consola de Wesker" },
          props: [["consola", -3, -7.5], ["consola", 3, -7.5], ["mesa", 0, 0], ["silla", 1, 0.8, 3], ["tuberia", 6.8, 0, 1.57], ["cadaver", -4, 4, 1, "majini"], ["visceras", 3, 4]],
          puntos: [
            { x: -3, z: -6.6, nombre: "Terminal de Excella", texto: "Un correo para Wesker, enviado antes de... la transformación.", requerido: true, accion: { documento: "email_excella" } },
            { x: 3, z: 3.5, nombre: "Taquilla de la tripulación", prop: ["archivador", 3.14], texto: "Munición y hierbas mezcladas.", accion: { objetos: { municion: 15, hierba_mixta: 1 } } }
          ],
          enemigos: [{ id: "majini", figura: "jo", x: -2, z: -3 }, { id: "majini", figura: "jo", x: 2, z: -4 }] },
        { tipo: "puzzle", id: "re5", ui: "texto",
          titulo: "Consola privada de Wesker",
          enunciado: "Introduce la contraseña. Excella mencionó algo en su correo...",
          pista: "La serpiente que se muerde la cola: U _ O _ O _ O S.",
          placeholder: "Contraseña" },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "wesker", modo: "esquiva", rondas: 5, velocidad: 1.5, dano: 35,
          texto: "En el volcán, Wesker agarra a Chris y lo estrangula con un tentáculo. Tienes un lanzacohetes. Tienes un solo disparo. «¡Sheva, AHORA!».",
          exito: "Esquivas las embestidas y disparas. El cohete le entra por la boca y le sale por la nuca. Wesker se hunde en la lava gritando. Chris te abraza.",
          fallo: "Un tentáculo te atraviesa el muslo. Disparas de rodillas. La cabeza de Wesker revienta dentro del magma.",
          muerte: "Wesker te partió el cuello de una patada y lanzó tu cuerpo a la lava." },
        { tipo: "narracion", lineas: [
          "Desde el helicóptero, ves el volcán escupir humo negro sobre la sabana. Tu casa. Lo que queda de ella.",
          "Chris te pregunta qué vas a hacer ahora. Le dices que seguir luchando. Que alguien tiene que hacerlo por los niños de las fosas.",
          "Josh aparece en el último helicóptero, herido pero vivo. «Te dije que volvería».",
          "Esa noche sueñas con tu madre. Por primera vez en veinte años, en el sueño no se levanta del suelo."
        ] }
      ]
    }
  ]
});
