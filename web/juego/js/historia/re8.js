/* ============================================================================
 *  ARCHIVO VII · RESIDENT EVIL VILLAGE (2021-2037) — Ethan · Chris · Rose
 *  Soluciones: Puzzles.java (re8, re8_ethan_donna, re8_chris_bomba, re8_rose_michael)
 * ========================================================================== */

"use strict";

Object.assign(DOCUMENTOS, {
  carta_duque: {
    titulo: "Carta del Duque",
    estilo: "papel",
    texto: `Querido cliente:

El altar de la aldea exige los cuatro blasones en el orden
en que el viajero cruza los dominios de los señores:

Primero, las torres donde el vino y la sangre son lo mismo.
Después, la casa de las muñecas, donde el miedo te habla.
Luego, el embalse podrido donde nada algo enorme.
Y por último, la fábrica de humo, hierro y engranajes.

La quinta figura, la de los cuervos, no pertenece al altar:
ella es la dueña de todo esto.

Un placer hacer negocios, Ethan. Ehh-heh-heh.`
  },
  diario_doncella: {
    titulo: "Diario de una doncella del castillo",
    estilo: "sangre",
    texto: `Me contrataron como doncella. Buen sueldo, decían.

Hoy he bajado a la bodega. El vino de la Señora no es vino.
Hay chicas colgadas boca abajo sobre las barricas, con el
cuello abierto. Gotean despacio. Algunas siguen vivas.

Las hijas de la Señora se convierten en moscas cuando quieren.
Me han olido. Bela me ha lamido la mejilla y ha dicho:
«Tú vas a ser una buena cosecha».

Dicen que el frío las debilita. Que se esconden de las
ventanas abiertas. Si alguien encuentra esto: abrid todas
las ventanas del castillo. Y no bajéis a la bodega.`
  },
  diario_donna: {
    titulo: "Diario de Donna Beneviento",
    estilo: "papel",
    texto: `Angie dice que no tenga miedo. Angie siempre tiene razón.

Papá cerró el sótano el día de mi primer recuerdo feliz:
el día que Angie me habló por primera vez. Yo tenía seis años.
Fue el 3 de noviembre. Lo pongo como lo escribía papá:
primero el día, luego el mes. Cuatro cifras.

Abajo está mi bebé. El que Madre Miranda me dio para que
asustara a los invitados. Llora mucho. Tiene hambre.
Es más grande que la puerta. No sé cómo salió del frasco.

Si un invitado baja al sótano, no saldrá.
O saldrá en trozos pequeños, como le gustan a Angie.`
  },
  orden_hound: {
    titulo: "Orden de operaciones · Hound Wolf",
    estilo: "informe",
    texto: `ESCUADRÓN HOUND WOLF · ALTO SECRETO

Objetivo: destruir la raíz del Megamycete bajo la aldea.
Carga: bomba de alto poder, suficiente para borrar el valle.

Código de armado: el año en que perdimos Raccoon City,
escrito al revés. Capitán Redfield, usted no lo olvidará.

Nota: Ethan Winters no debe saber que su esposa Mia sigue
viva en manos de Miranda. Su reacción es impredecible.
Nota 2: Ethan Winters no es exactamente humano.
Murió en 2017. El moho lo mantiene en pie.

Esto debe permanecer en secreto. Rose Winters es la
prioridad absoluta. Cueste lo que cueste.`
  },
  mensajes_m: {
    titulo: "Mensajes firmados por «M.»",
    estilo: "papel",
    texto: `[Mensajes escritos en letras doradas que aparecen en las
paredes del mundo del Megamycete]

«No tengas miedo, Rose. Sigue la luz dorada.»

«Te he estado buscando mucho tiempo. Más del que crees.»

«Tu madre te ha contado historias de tu padre. Algunas son
verdad. Era un hombre corriente. Le gustaba cocinar fatal.»

«Cuando eras un bebé, te dividieron en cuatro frascos.
Él cruzó un pueblo entero para volver a juntarte.»

«Cuando sepas quién soy, dilo en voz alta.»

— M.

[La letra es idéntica a la de las cartas que Ethan Winters
le escribía a Mia. Mia las guarda en una caja. Tú las has leído.]`
  }
});

HISTORIA.capitulos.push({
  id: "re8",
  juego: "Resident Evil Village",
  titulo: "La aldea",
  anio: "Febrero de 2021 – 2037",
  lugar: "Una aldea en Europa del Este",
  tema: "tema-re8",
  fondoImagen: "img/escenarios/re8.webp",
  variantes: {chris: "chris_re8"},
  rutas: [

    /* ======================================================================
     *  ETHAN WINTERS
     * ==================================================================== */
    {
      id: "ethan",
      protagonista: "ethan",
      titulo: "Un padre",
      resumen: "Tres años de paz. Hasta que Chris Redfield entra por la ventana, acribilla a Mia y se lleva a tu hija. Despiertas en una aldea con cuatro señores monstruosos que quieren tu cabeza.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Tres años de paz. Tú, Mia y vuestra hija Rose, en Europa.",
          "Hasta que Chris Redfield entra por la ventana y acribilla a Mia delante de ti. Doce disparos. Se lleva a Rose.",
          "Despiertas en la nieve. Una aldea. Cuervos. Cadáveres colgados de ganchos como reses en una carnicería.",
          "Y aullidos. Muchos aullidos."
        ] },
        { tipo: "chat", titulo: "Carruaje del Duque", guion: [
          { de: "duque", t: "Ah, un cliente. Bienvenido, Ethan. Soy el Duque. Vendo de todo: armas, munición... información." },
          { opciones: [
            { t: "¿Dónde está mi hija?", resp: [{ de: "duque", t: "Madre Miranda la tiene. La ha dividido en cuatro frascos, uno por cada señor. Qué desagradable." }] },
            { t: "¿Qué demonios es este sitio?", resp: [{ de: "duque", t: "Una aldea que adora a Madre Miranda. Cuatro señores la gobiernan. Y todos quieren tu cabeza." }] }
          ] },
          { de: "duque", t: "Te he dejado una carta junto al altar. Por los viejos tiempos. Ehh-heh-heh." },
          { de: "miranda", t: "Rose será mía. Es el recipiente perfecto. Tú solo eres... un hombre muerto que camina." }
        ] },
        { tipo: "explorar", titulo: "La aldea nevada", imagen: "img/escenarios/re8_aldea.webp", escenario: "nieve", ancho: 24, fondo: 28, sangre: 6,
          descripcion: "Nieve sucia de sangre, casas en ruinas y cuervos en cada rama. Los licántropos saltan desde los tejados. Busca la carta del Duque en el altar.",
          salida: { x: 0, z: -14, texto: "Ir al castillo Dimitrescu" },
          props: [
            ["casa", -8.5, -6], ["casa", 8.5, 5, 1.57], ["casa", -8.5, 8, 3.14], ["arbol", 9, -10], ["arbol", -10.5, 1], ["arbol_seco", 4, 11], ["arbol_seco", -4, -11],
            ["colgado", 4, -4, 0, "carne"], ["colgado", 5, -3, 0, "carne"], ["colgado", 3.2, -2.6, 0, "zombi"], ["hoguera", -3, 5], ["valla", 7, -12], ["tumba", -6, 11]
          ],
          puntos: [
            { x: 0, z: -2, nombre: "Carta en el altar", prop: ["altar", 0], texto: "Papel caro. Huele a perfume y a tabaco. La firma del Duque. Sobre el altar, una figura encapuchada con alas de cuervo.", requerido: true, accion: { documento: "carta_duque" } },
            { x: 4.2, z: -3.4, nombre: "Ganchos de carne", texto: "Cuerpos de aldeanos colgados como reses, abiertos en canal. Les han sacado el hígado. Los licántropos guardan aquí su despensa.", accion: { sangre: true } },
            { x: 8.5, z: 2.4, nombre: "Casa en ruinas", texto: "¡Un licántropo salta desde el tejado y te muerde el hombro!", accion: { susto: "licantropo", dano: 20, muerte: "Los licántropos te arrastraron al bosque. Encontraron tus huesos en primavera.", aparecen: [{ id: "licantropo", x: 6, z: 0 }, { id: "licantropo", x: 4, z: 2 }] } },
            { x: -8.5, z: 5.4, nombre: "Despensa abandonada", texto: "Un spray de primeros auxilios, munición y una cinta de tinta.", accion: { objetos: { spray: 1, municion: 18, cinta: 1 } } },
            { x: -3, z: 6.2, nombre: "Hoguera", texto: "Un brazo asándose en las brasas. Lleva un anillo de boda. Alguien estaba cenando.", accion: { sangre: true } }
          ],
          npcs: [{ id: "duque", x: -10.5, z: -4, lineas: ["Bienvenido, Ethan. ¿Qué va a ser hoy?", "Los licántropos odian la luz. Y las balas. Sobre todo las balas.", "Lady Dimitrescu mide casi tres metros. Te advierto: le gusta la sangre... joven.", "Ehh-heh-heh. Vuelve pronto."] }],
          enemigos: [{ id: "licantropo", x: -3, z: -4 }, { id: "licantropo", x: 3, z: -8 }, { id: "licantropo", x: -6, z: -9 }] },
        { tipo: "explorar", titulo: "Castillo Dimitrescu", imagen: "img/escenarios/re8_castillo.webp", escenario: "castillo", ancho: 16, fondo: 24, sangre: 6,
          descripcion: "Mármol, oro y sangre. Las hijas de Dimitrescu revolotean convertidas en enjambres de moscas. Y la Señora, de casi tres metros, recorre los pasillos. Encuentra el diario de la doncella.",
          salida: { x: 0, z: -12, texto: "Huir por el tejado" },
          props: [
            ["pilar", -5, -6], ["pilar", 5, -6], ["pilar", -5, 3], ["pilar", 5, 3], ["piano", -6, 8, 1.57], ["mesa", 4, 7], ["cuadro", 0, -11.95, 0, "dimitrescu"],
            ["barril", -6.8, -9], ["barril", -6.2, -9.6], ["barril", -7, -8.3], ["colgado", -5.5, -8, 0, "zombi"], ["colgado", -6.5, -10, 0, "zombi"], ["sangre", 0, 0, 0, 4]
          ],
          puntos: [
            { x: -6.4, z: -7, nombre: "La bodega", texto: "Las barricas no tienen vino. Tienen sangre. Sobre ellas cuelgan doncellas boca abajo, con el cuello abierto, goteando. Una te mira. Sigue viva.", accion: { sangre: true } },
            { x: 4, z: 7.4, nombre: "Mesa de la cocina", texto: "El diario de una doncella, bajo una bandeja con dedos glaseados.", requerido: true, accion: { documento: "diario_doncella" } },
            { x: 6.4, z: -4, nombre: "Ventana", texto: "Rompes la ventana. El aire helado entra. Las hijas chillan: el frío las debilita. Detrás de una cortina, munición.", requerido: true, accion: { objetos: { municion: 18, hierba_mixta: 1 } } }
          ],
          enemigos: [
            { id: "hija", x: -2, z: -4, vida: 5, vel: 2, dano: 25, rango: 14, muerte: "Las hijas de Dimitrescu te desollaron con sus hoces. Bela se hizo un vestido con tu piel." },
            { id: "hija", x: 3, z: -6, vida: 5, vel: 2, dano: 25, rango: 14 },
            { id: "dimitrescu", x: 0, z: -10, vel: 1.15, rango: 18, aturdido: "se tambalea y se lleva la mano al pecho. Ríe con los colmillos teñidos de rojo. «¡Qué descarado!»", ataque: "Sus garras te abren la espalda como un sobre.", muerte: "Lady Dimitrescu te colgó boca abajo y llenó una copa con tu sangre. Brindó a tu salud." }
          ] },
        { tipo: "encuentro", enemigo: "dimitrescu", modo: "esquiva", rondas: 4, velocidad: 1.3, dano: 40,
          texto: "En el tejado, Lady Dimitrescu se transforma en un dragón de carne con alas de murciélago y una boca vertical. Te persigue entre las torres. ¡Usa la Hoja de la Muerte!",
          exito: "Esquivas sus embestidas y le hundes la Hoja de la Muerte en la garganta. Se convierte en sal y se desmorona en el patio.",
          fallo: "Sus garras te arrancan media oreja. Le clavas la hoja igualmente. Se convierte en sal.",
          muerte: "Lady Dimitrescu te tragó entero en su forma de dragón. Su estómago estaba lleno de doncellas." },
        { tipo: "maquina" },
        { tipo: "explorar", titulo: "Casa Beneviento", imagen: "img/escenarios/re8_beneviento.webp", escenario: "casa", ancho: 14, fondo: 20, sangre: 2, lamparas: 1, ambiente: { ambiente: 0.25 },
          descripcion: "Una casa de muñecas al borde de una cascada. Te han quitado las armas. Solo se oye un llanto de bebé... muy grave. Encuentra el diario de Donna.",
          salida: { x: 0, z: -10, texto: "Ir a la puerta del sótano" },
          props: [
            ["muneca", -5, 6, 0, "angie"], ["muneca", 5, 6, 0, "angie"], ["muneca", -5, -2, 0, "angie"], ["muneca", 5.5, -4, 0, "angie"], ["estanteria", -6.2, 2, 1.57],
            ["cama", 4.6, 1, -1.57], ["piano", -4.8, -7, 1.57], ["cuadro", 0, -9.95, 0, "donna"], ["silla", 0, 3]
          ],
          puntos: [
            { x: 0, z: 3.4, nombre: "Silla con Angie", texto: "Una muñeca vestida de novia, sentada mirándote. Parpadea. Las muñecas no parpadean. Debajo de ella, el diario de Donna.", requerido: true, accion: { documento: "diario_donna" } },
            { x: 4.6, z: 1, nombre: "La cama", texto: "Las sábanas están empapadas de un líquido amniótico que huele a leche agria. Hay un cordón umbilical que va hacia el sótano.", requerido: true, accion: { aparecen: [{ id: "bebe", x: 0, z: -7, invencible: true, vida: 6, vel: 0.95, dano: 50, rango: 30, aturdido: "se detiene y llora con un sonido grave que te revienta los tímpanos.", ataque: "El bebé gigante te muerde con sus dientes de leche del tamaño de dedos.", muerte: "El bebé te cogió con sus manitas enormes y te metió en su boca. Tus huesos crujieron como galletas." }] } },
            { x: -6.2, z: 4, nombre: "Estantería", texto: "Tus armas no están. Pero alguien dejó un spray escondido.", accion: { objeto: "spray", cantidad: 1 } }
          ],
          enemigos: [] },
        { tipo: "puzzle", id: "re8_ethan_donna", ui: "codigo", digitos: 4,
          titulo: "Cerradura del sótano Beneviento",
          enunciado: "Cuatro cifras. Donna escribió en su diario la fecha de su primer recuerdo feliz. El bebé está cerca. Muy cerca.",
          danoFallo: 10, muerte: "El bebé te alcanzó mientras tecleabas. Te mordió la cabeza como si fuera una manzana.",
          pista: "El 3 de noviembre, primero el día y luego el mes: 0311." },
        { tipo: "encuentro", enemigo: "moreau", modo: "esquiva", rondas: 4, velocidad: 1.35, dano: 40,
          texto: "En el embalse, Salvatore Moreau se transforma en un pez gigante con su cara deforme en la punta. Salta del agua para tragarte entero.",
          exito: "Esquivas sus saltos y le disparas al tumor de la boca. Revienta. Moreau se arrastra llamando a «Madre Miranda» hasta que deja de moverse.",
          fallo: "Te traga hasta la cintura. Le disparas desde dentro a quemarropa. Te escupe junto con medio aldeano a medio digerir.",
          muerte: "Moreau te tragó entero. Sus jugos gástricos te deshicieron mientras él lloraba por su madre." },
        { tipo: "puzzle", id: "re8", ui: "orden", huecos: 4,
          titulo: "Los blasones de los señores",
          enunciado: "Coloca los blasones en el altar en el orden en que se cruzan los dominios. La carta del Duque lo explica.",
          opciones: [
            { id: "HEISENBERG", t: "Heisenberg", icono: "⚙️" },
            { id: "MIRANDA", t: "Miranda", icono: "🐦‍⬛" },
            { id: "MOREAU", t: "Moreau", icono: "🐟" },
            { id: "DIMITRESCU", t: "Dimitrescu", icono: "🍷" },
            { id: "BENEVIENTO", t: "Beneviento", icono: "🪆" }
          ],
          danoFallo: 10, muerte: "Los cuervos del altar te sacaron los ojos. Los licántropos se encargaron del resto.",
          pista: "Vino y sangre = castillo Dimitrescu. Muñecas = casa Beneviento. Embalse = Moreau. Fábrica = Heisenberg. Miranda no va en el altar." },
        { tipo: "maquina" },
        { tipo: "chat", titulo: "Chris Redfield · radio", guion: [
          { de: "heisenberg", t: "Winters. Ethan Winters. El hombre que no se muere. Únete a mí y juntos acabaremos con esa vieja bruja." },
          { opciones: [
            { t: "No pienso usar a mi hija como arma.", resp: [{ de: "heisenberg", t: "Entonces muere como un perro. ¡A la fábrica!" }] },
            { t: "¿Y después qué? ¿Tú serás el nuevo dios?", resp: [{ de: "heisenberg", t: "Después seré libre. Y tú serás chatarra." }] }
          ] },
          { de: "chris", t: "Ethan. Siento lo de Mia. La que maté no era Mia: era Miranda disfrazada." },
          { de: "chris", t: "Y hay algo más que tienes que saber. Moriste en la casa Baker hace tres años. El moho te mantiene en pie." },
          { opciones: [
            { t: "Me da igual lo que sea. Voy a por Rose.", resp: [{ de: "chris", t: "Lo sé. Por eso te ayudaré. Esta vez de verdad." }] },
            { t: "¿Estoy... muerto?", resp: [{ de: "chris", t: "Eres más fuerte que cualquier cosa que haya visto. Ve a por tu hija." }] }
          ] }
        ] },
        { tipo: "encuentro", enemigo: "heisenberg", modo: "machaca", veces: 24, tiempo: 6, dano: 45, boton: "¡A TODA MÁQUINA!",
          texto: "Heisenberg se funde con toda la chatarra de su fábrica: un gigante de hierro de veinte metros con una sierra circular por brazo. Tú vas en un tanque que te ha construido el Duque.",
          exito: "Embistes con el tanque y le metes el cañón en el pecho. Heisenberg revienta entre hierros y grita: «¡Te veré en el infierno, Winters!».",
          fallo: "La sierra te arranca el blindaje y un trozo de pierna. Disparas igualmente. Heisenberg explota en chatarra y sangre.",
          muerte: "La sierra de Heisenberg cortó el tanque por la mitad. Contigo dentro." },
        { tipo: "encuentro", enemigo: "miranda", modo: "esquiva", rondas: 5, velocidad: 1.5, dano: 45,
          texto: "Madre Miranda te arranca el corazón con la mano desnuda. Y aun así, te levantas. El moho te ha reconstruido. Ahora ella se transforma en un ángel de raíces negras. Última pelea.",
          exito: "Esquivas sus raíces y le metes el cargador entero en el corazón. Miranda se marchita como una flor muerta.",
          fallo: "Una raíz te atraviesa el estómago. La arrancas. Disparas. Miranda se seca y cae.",
          muerte: "Madre Miranda te absorbió en el Megamycete. Rose creció sin padre." },
        { tipo: "narracion", lineas: [
          "Rose, por fin, en brazos de Mia. Viva. Entera.",
          "Tu cuerpo empieza a convertirse en ceniza blanca, desde las manos. El moho que te mantenía en pie se está muriendo.",
          "Te quedas atrás para detonar la bomba. «Cuida de ella», le dices a Chris. «Cuéntale que su padre...». No terminas la frase.",
          "Ethan Winters muere como vivió: siendo un padre. La aldea desaparece en una bola de fuego."
        ] }
      ]
    },

    /* ======================================================================
     *  CHRIS REDFIELD
     * ==================================================================== */
    {
      id: "chris",
      protagonista: "chris",
      titulo: "Hound Wolf",
      resumen: "Has tenido que disparar a la mujer de tu amigo delante de él. Era Miranda disfrazada, pero Ethan no lo sabe. Ahora asaltas la aldea con tu escuadrón para destruir la raíz de todo.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Tres años vigilando a los Winters. Tres años sabiendo que Miranda andaba cerca.",
          "Esta noche le has disparado a «Mia» doce veces delante de su marido. Era Miranda. Ethan te mira como a un asesino.",
          "No puedes contárselo. No todavía. Tu escuadrón, Hound Wolf, te espera en la montaña.",
          "Abajo, en el valle, la aldea arde. Los licántropos aúllan. Y Miranda se prepara para usar a Rose."
        ] },
        { tipo: "chat", titulo: "Hound Wolf · canal táctico", guion: [
          { de: "lobo", t: "Capitán, el equipo está en posición. Los licántropos son cientos. Esto va a ser una carnicería." },
          { opciones: [
            { t: "Pues que lo sea. Por Rose.", marca: "re8_chris_duro", resp: [{ de: "lobo", t: "Por Rose. A sus órdenes." }] },
            { t: "Que nadie muera por mí. Prioridad: salir vivos.", resp: [{ de: "lobo", t: "Entendido, capitán. Haremos lo posible." }] }
          ] },
          { de: "miranda", t: "Christopher. Llevas tantos años persiguiéndome. ¿Sabes lo que he aprendido de ti? Que siempre llegas tarde." }
        ] },
        { tipo: "explorar", titulo: "Asalto a la aldea", imagen: "img/escenarios/re8_aldea.webp", escenario: "nieve", ancho: 24, fondo: 30, sangre: 7, matar: true, ambiente: { ambiente: 0.5, niebla: "#3a3f48", cielo: "#2a2f38" },
          descripcion: "Nieve, fuego y una manada de licántropos. Tu escuadrón te cubre. Encuentra la orden de operaciones en el puesto de mando y limpia la plaza.",
          salida: { x: 0, z: -15, texto: "Bajar a la cueva del Megamycete" },
          props: [
            ["casa", -9, -7], ["casa", 9, 6, 1.57], ["casa", -9, 9, 3.14], ["coche", 6, -8, 0.8, "#2a3a2a"], ["hoguera", 0, 3], ["arbol", 10, -12], ["arbol", -10.5, 0],
            ["colgado", -4, -4, 0, "lobo"], ["cadaver", 3, 8, 1, "lobo"], ["visceras", 3.5, 8.6], ["valla", -5, 12]
          ],
          puntos: [
            { x: 4.6, z: -6.4, nombre: "Puesto de mando", prop: ["mesa", 0.8], texto: "La orden de operaciones, con el código de armado de la bomba.", requerido: true, accion: { documento: "orden_hound" } },
            { x: 3, z: 8, nombre: "Soldado caído", texto: "Uno de los tuyos, Lobo. Los licántropos le han comido la cara y el vientre. Sus placas están dentro de su boca. Te las llevas. Y su munición.", requerido: true, accion: { objetos: { municion: 25 } } },
            { x: -9, z: 6.4, nombre: "Casa del herrero", texto: "Spray, hierbas mezcladas y munición de los aldeanos.", accion: { objetos: { spray: 1, hierba_mixta: 1, municion: 15 } } }
          ],
          npcs: [{ id: "lobo", x: 2, z: 12, sigue: true, lineas: ["¡Capitán, a las seis!", "¡Son demasiados!", "Esto es por los de la casa Baker, capitán.", "Ethan no sabe nada, ¿verdad? Pobre desgraciado."] }],
          enemigos: [
            { id: "licantropo", x: -3, z: 0 }, { id: "licantropo", x: 4, z: -2 }, { id: "licantropo", x: -6, z: -6 }, { id: "licantropo", x: 2, z: -9 },
            { id: "licantropo", x: 6, z: -12 }, { id: "licantropo", figura: "licantropo", x: 0, z: -12, escala: 1.5, vida: 8, dano: 30, remate: "Urias, el licántropo gigante, cae con la cabeza abierta. El martillo que llevaba aplasta a dos de los suyos." }
          ] },
        { tipo: "encuentro", enemigo: "licantropo", modo: "esquiva", rondas: 4, velocidad: 1.45, dano: 35,
          texto: "En la entrada de la cueva, una manada entera te rodea. El alfa, con el pelaje blanco y cicatrices de bala, te salta a la garganta.",
          exito: "Esquivas sus fauces y le vuelas la mandíbula con la escopeta. La manada huye aullando.",
          fallo: "Te muerde el antebrazo y sacude la cabeza. Oyes el radio partirse. Le metes el cañón en el ojo.",
          muerte: "El licántropo alfa te arrancó la garganta de un mordisco. La manada se peleó por el resto." },
        { tipo: "explorar", titulo: "Cueva del Megamycete", imagen: "img/escenarios/re8_embalse.webp", escenario: "mina", ancho: 18, fondo: 24, sangre: 4, ambiente: { cPared: "#2a2018", luz: "#ff8a5a" },
          descripcion: "Una caverna orgánica que late. Las paredes respiran. Al fondo, la raíz del Megamycete, una masa de moho del tamaño de una catedral. Coloca las tres cargas.",
          salida: { x: 0, z: -12, texto: "Armar la bomba" },
          props: [["escombros", -6, -6], ["escombros", 6, 4], ["visceras", 0, 0], ["visceras", -4, -8], ["capsula", 6, -8, 0, "moldeado"], ["colgado", -2, 3, 0, "zombi"], ["pintada", -8.95, 0, 1.57, "MADRE"]],
          puntos: [
            { x: -6, z: -3, nombre: "Primera carga", texto: "Colocas la carga sobre una vena de moho del grosor de un tronco. Late contra tu mano como un corazón.", requerido: true },
            { x: 6, z: 1, nombre: "Segunda carga", texto: "Colocas la segunda carga. La pared se abre en una boca y escupe un Moldeado.", requerido: true, accion: { aparecen: [{ id: "moldeado", x: 4, z: -2 }, { id: "moldeado", x: 5, z: -4 }] } },
            { x: 0, z: -8, nombre: "Tercera carga", texto: "La raíz principal. Dentro se ven cuerpos fosilizados de siglos, envueltos en moho, con la boca abierta.", requerido: true },
            { x: -7, z: 8, nombre: "Mochila de un soldado", texto: "Munición y un spray.", accion: { objetos: { municion: 20, spray: 1 } } }
          ],
          npcs: [{ id: "lobo", x: -2, z: 10, sigue: true, lineas: ["Esto está vivo, capitán. Todo esto.", "Coloque las cargas. Le cubro.", "Diez minutos después de armarla, todo el valle desaparece."] }],
          enemigos: [{ id: "moldeado", x: -2, z: -2 }, { id: "moldeado", x: 2, z: -6 }] },
        { tipo: "puzzle", id: "re8_chris_bomba", ui: "codigo", digitos: 4,
          titulo: "Código de armado",
          enunciado: "Cuatro cifras. La orden de operaciones dice: el año en que perdisteis Raccoon City, escrito al revés.",
          danoFallo: 5,
          pista: "Raccoon City fue destruida en 1998. Al revés: 8991." },
        { tipo: "maquina" },
        { tipo: "encuentro", enemigo: "miranda", modo: "machaca", veces: 22, tiempo: 5, dano: 40, boton: "¡CUBRE A ROSE!",
          texto: "Miranda aparece en la cueva con Rose en brazos, envuelta en moho. Intenta fundirla con el Megamycete. Mia, viva, aparece a tu lado. ¡Dispara a las raíces mientras ella coge a la niña!",
          exito: "Revientas las raíces una a una. Mia coge a Rose. Miranda grita como un pájaro herido y se hunde en el moho.",
          fallo: "Una raíz te azota la cara y te abre la ceja hasta el hueso. Sigues disparando con un ojo. Mia consigue a Rose.",
          muerte: "Miranda te atravesó con una raíz y te absorbió. Mia tuvo que huir sola con la niña." },
        { tipo: "narracion", lineas: [
          "Ethan aparece detrás de ti, cubierto de sangre y de ceniza blanca. Se está muriendo. Lleva muerto tres años.",
          "«Cuida de ella», te dice. Se queda para detonar la bomba. No puedes impedírselo. No quieres.",
          "Desde el helicóptero, con Mia y Rose, ves el valle desaparecer en una cúpula de fuego.",
          "Prometes contárselo a Rose cuando crezca. Que su padre fue el hombre más valiente que has conocido. Más que tú."
        ] }
      ]
    },

    /* ======================================================================
     *  ROSE WINTERS · LA SOMBRA DE ROSE (2037)
     * ==================================================================== */
    {
      id: "rose",
      protagonista: "rose",
      titulo: "La sombra de Rose",
      resumen: "Dieciséis años después. Tienes poderes que no pediste y un padre al que no recuerdas. Para librarte del moho, entras en la conciencia del Megamycete. Alguien sin rostro te guía.",
      pasos: [
        { tipo: "narracion", lineas: [
          "2037. Eres Rose Winters. Dieciséis años. En el instituto te llaman «monstruo». Tienen razón: cuando te enfadas, las cosas se congelan.",
          "Llevas el moho de Miranda en la sangre. El mismo que mantuvo en pie a tu padre, al que no recuerdas.",
          "Dicen que hay un cristal que puede curarte. Está dentro de la conciencia del Megamycete: un mundo de recuerdos muertos.",
          "Tocas la raíz. Abres los ojos dentro de un castillo que conoces de las pesadillas de tu madre."
        ] },
        { tipo: "chat", titulo: "Letras doradas en la pared", guion: [
          { de: "michael", t: "Rose. No tengas miedo. Sigue la luz dorada." },
          { opciones: [
            { t: "¿Quién eres?", resp: [{ de: "michael", t: "Llámame Michael. Estoy aquí para protegerte." }] },
            { t: "¿Por qué debería fiarme de ti?", resp: [{ de: "michael", t: "Porque siempre te he protegido. Aunque no lo recuerdes." }] }
          ] },
          { de: "duque", t: "¡Señorita Winters! Qué alegría. Conocí a su padre. Un cliente excelente. Pagaba siempre." },
          { de: "duque", t: "Los Rostros Vacíos vagan por este castillo. Están hechos del moho de los muertos. Tenga cuidado." }
        ] },
        { tipo: "explorar", titulo: "Castillo de los recuerdos", imagen: "img/escenarios/re8_castillo.webp", escenario: "castillo", ancho: 16, fondo: 24, sangre: 4, ambiente: { cPared: "#4a3a3a", luz: "#ffd8a0", niebla: "#140c0c" },
          descripcion: "El castillo Dimitrescu, pero deformado: las paredes sangran moho y las sombras no tienen dueño. Los Rostros Vacíos te buscan. Sigue las letras doradas de M.",
          salida: { x: 0, z: -12, texto: "Seguir la luz dorada" },
          props: [
            ["pilar", -5, -6], ["pilar", 5, -6], ["pilar", -5, 3], ["pilar", 5, 3], ["cuadro", 0, -11.95, 0, "ethan"], ["cuadro", -7.95, 0, 1.57, "dimitrescu"],
            ["sangre", 0, 0, 0, 3], ["colgado", 3, -2, 0, "moldeado"], ["piano", -6, 8, 1.57]
          ],
          puntos: [
            { x: 0, z: -11.2, nombre: "Letras doradas", texto: "Mensajes escritos en la pared con luz. Todos firmados «M.».", requerido: true, altura: 1.9, accion: { documento: "mensajes_m" } },
            { x: -6.2, z: 7, nombre: "Piano", texto: "Toca sola una nana. Tu madre te la cantaba. Encima, una hierba que brilla.", accion: { objetos: { hierba_mixta: 1, municion: 18 } } },
            { x: 3, z: -2, nombre: "Rostro Vacío colgado", texto: "Tiene la cara lisa como un huevo. Cuando te acercas, se le abre una boca vertical llena de dientes.", accion: { susto: "moldeado", dano: 12, muerte: "Los Rostros Vacíos te absorbieron. Te convertiste en un recuerdo más del Megamycete." } }
          ],
          enemigos: [{ id: "moldeado", x: -3, z: -2 }, { id: "moldeado", x: 3, z: -7 }, { id: "moldeado", x: 0, z: -9 }] },
        { tipo: "encuentro", enemigo: "dimitrescu", modo: "esquiva", rondas: 4, velocidad: 1.35, dano: 35,
          texto: "Un recuerdo de Lady Dimitrescu, hecha de moho y de odio, te persigue por el salón. «La hija de Winters... ¡qué sangre tan dulce debes de tener!».",
          exito: "Esquivas sus garras y la congelas con tus poderes. Se resquebraja en cristales de moho que caen como nieve negra.",
          fallo: "Sus garras te arañan el cuello. Sangras de verdad, aunque estés en un sueño. La congelas al fin.",
          muerte: "El recuerdo de Dimitrescu te bebió hasta dejarte vacía. En el mundo real, tu cuerpo dejó de respirar." },
        { tipo: "maquina" },
        { tipo: "explorar", titulo: "Casa Beneviento (recuerdo)", imagen: "img/escenarios/re8_beneviento.webp", escenario: "casa", ancho: 14, fondo: 20, sangre: 2, lamparas: 1, matar: true, ambiente: { ambiente: 0.25 },
          descripcion: "La casa de las muñecas, cubierta de una niebla de moho. Michael dice que aquí hay algo de tu padre. Las muñecas te observan... y se mueven.",
          salida: { x: 0, z: -10, texto: "Abrir la puerta de la luz" },
          props: [["muneca", -5, 6, 0, "angie"], ["muneca", 5, 6, 0, "angie"], ["muneca", 5.5, -4, 0, "angie"], ["estanteria", -6.2, 2, 1.57], ["cama", 4.6, 1, -1.57], ["cuadro", 0, -9.95, 0, "mia"]],
          puntos: [
            { x: -6.2, z: 2, nombre: "Caja de cartas", texto: "Las cartas que tu padre escribía a tu madre. Mia las guarda en casa. La letra... es la de los mensajes dorados.", requerido: true, accion: { marca: "re8_rose_sabe" } },
            { x: 4.6, z: 1, nombre: "Foto en la cama", texto: "Una foto: un hombre sin rostro visible sostiene a un bebé. Detrás: «Ethan y Rose, 2021».", requerido: true },
            { x: 0, z: 5, nombre: "Baúl", texto: "Un spray y munición mental, sea lo que sea eso aquí dentro.", accion: { objetos: { spray: 1, municion: 15 } } }
          ],
          enemigos: [
            { id: "moldeado", figura: "angie", x: -3, z: -3, escala: 0.6, completo: false, vida: 3, vel: 2.2, dano: 15, ataque: "La muñeca te muerde el tobillo con dientes de porcelana." },
            { id: "moldeado", figura: "angie", x: 3, z: -5, escala: 0.6, completo: false, vida: 3, vel: 2.2, dano: 15 },
            { id: "moldeado", x: 0, z: -7 }
          ] },
        { tipo: "puzzle", id: "re8_rose_michael", ui: "texto",
          titulo: "¿Quién es Michael?",
          enunciado: "Michael aparece delante de ti, sin rostro, en la luz dorada. «Cuando sepas quién soy, dilo en voz alta».",
          pista: "La letra de los mensajes es la de las cartas de tu padre. Michael es Ethan Winters. Tu padre.",
          placeholder: "Su nombre" },
        { tipo: "chat", titulo: "Luz dorada", guion: [
          { de: "michael", t: "Hola, cielo." },
          { opciones: [
            { t: "Papá...", resp: [{ de: "ethan", t: "Mírate. Eres preciosa. Tienes los ojos de tu madre." }] },
            { t: "¿Por qué no me lo dijiste antes?", resp: [{ de: "ethan", t: "Porque quería que lo descubrieras tú. Eres más lista que yo. Eso no era difícil." }] }
          ] },
          { de: "ethan", t: "Tus poderes no son una maldición, Rose. Son un regalo. Y eres tú quien decide qué hacer con ellos." },
          { de: "eveline", t: "Ella es MÍA. Todos sois MÍOS. ¡Esta es mi familia!", efecto: { susto: "eveline" } }
        ] },
        { tipo: "encuentro", enemigo: "eveline_vieja", modo: "machaca", veces: 24, tiempo: 6, dano: 40, boton: "¡LIBERA TU PODER!",
          texto: "La conciencia de Eveline, que dormía dentro del Megamycete, despierta: una masa de moho con mil brazos y su cara de niña en el centro. Tu padre te sujeta la mano. Libera todo tu poder.",
          exito: "Una onda de luz dorada sale de ti y convierte a Eveline en ceniza. El mundo de los recuerdos se resquebraja como un espejo.",
          fallo: "Un brazo de moho te arranca un mechón de pelo con piel. Tu padre te abraza. Juntos liberáis la luz. Eveline arde.",
          muerte: "Eveline te absorbió. Ahora tiene una hija. Para siempre." },
        { tipo: "narracion", lineas: [
          "Tu padre te acompaña hasta la salida del sueño. «Tengo que quedarme, cielo. Este es mi sitio».",
          "Despiertas en el laboratorio de la B.S.A.A. Chris está a tu lado. Tienes la cara llena de lágrimas.",
          "Decides no destruir tus poderes. Te unes a Chris. Vas a proteger a la gente, como hizo tu padre contigo.",
          "En el coche, de vuelta a casa, ves un destello dorado en la ventanilla: «Estoy orgulloso de ti. — M.»."
        ] }
      ]
    }
  ]
});
