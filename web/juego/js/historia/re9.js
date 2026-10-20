/* ============================================================================
 *  ARCHIVO VIII · RESIDENT EVIL REQUIEM (2026) — Grace Ashcroft · Leon S. Kennedy
 *  Interpretación fan de la historia. Soluciones: Puzzles.java (re9, re9_*)
 * ========================================================================== */

"use strict";

Object.assign(DOCUMENTOS, {
  diario_alyssa: {
    titulo: "Cuaderno de Alyssa Ashcroft",
    estilo: "papel",
    texto: `Grace, cariño:

Si lees esto, es que no he vuelto de Wrenwood.
No confíes en nadie que hable de «la llave».
Te buscan a ti, aunque no sepan por qué.

Spencer escondió algo en el ARK. Lo llaman arma.
Yo creo que se equivocan.

¿Te acuerdas del cuento que te leía de pequeña?
Cuando Pandora abrió la caja, todos los males escaparon.
Solo una cosa se quedó en el fondo.
Ese es el nombre de lo que esconden. En griego, Grace.

Te quiero. Sobrevive.
— Mamá`
  },
  registro_wrenwood: {
    titulo: "Libro de registro del Hotel Wrenwood",
    estilo: "papel",
    texto: `HOTEL WRENWOOD · REGISTRO DE HUÉSPEDES

Hab. 112 — Sr. y Sra. Doyle — salida: [en blanco]
Hab. 204 — R. Kowalski — salida: [en blanco]
Hab. 307 — A. Ashcroft (+ hija) — salida: NUNCA
Hab. 410 — «V. G.» — residente permanente

[Nota del recepcionista, pegada con cinta]
«El doctor de la 410 ha cambiado el código de la puerta de
servicio. Dice que lo elija la "invitada especial". Ha puesto
el número de la habitación de la periodista muerta... al revés.
No sé qué le pasa con esa habitación. Sube cada noche
y se queda dentro, a oscuras, oliendo la moqueta.»`
  },
  expediente_gideon: {
    titulo: "Expediente del Dr. Victor Gideon",
    estilo: "informe",
    texto: `ANTIGUO EMPLEADO DE UMBRELLA · DIVISIÓN «ARK»

Victor Gideon trabajó a las órdenes directas de Ozwell Spencer
en el proyecto ARK, bajo el orfanato de Raccoon City.
Superviviente de 1998. Nadie sabe cómo salió de la ciudad.

Desde 2018 «colecciona» supervivientes de Raccoon City.
Cuerpos encontrados en el sótano del Wrenwood: 23.
Todos con el cráneo abierto y el cerebro extraído.
Todos con una etiqueta: «No compatible».

Su objetivo: la «llave» del ARK. Un ser humano concreto,
nacido con una alteración genética provocada por la exposición
de su madre al virus en 1998.

Nombre en clave del sujeto: «GRACE».`
  },
  notas_zeno: {
    titulo: "Notas de laboratorio de Zeno",
    estilo: "email",
    texto: `DE: Z.
PARA: V. Gideon
ASUNTO: Elpis

Victor, sigues sin entenderlo. Spencer no llamó «Elpis» a su
último proyecto por capricho. En la caja de Pandora, Elpis es
lo único que no escapó. No es un mal. Es lo contrario.

Elpis no controla. Elpis cura. Revierte cualquier infección
derivada del Progenitor: T, G, Plagas, Uroboros, moho.

Spencer se arrepintió al final. Por eso lo escondió.
Y por eso solo se abre con la sangre de alguien nacido
del desastre de Raccoon City: la hija de Alyssa Ashcroft.

Si la usas como arma, Victor, la matarás para nada.`
  },
  articulo_alyssa: {
    titulo: "Artículo inédito de Alyssa Ashcroft (1998)",
    estilo: "informe",
    texto: `RACCOON PRESS · BORRADOR NO PUBLICADO
Por Alyssa Ashcroft

«LA NOCHE EN QUE UN NOVATO SALVÓ A UNA NIÑA»

La noche del 29 de septiembre de 1998, mientras Raccoon City
ardía, un agente de policía en su primer día de trabajo
—llegó tarde, me dicen— atravesó la comisaría infestada
para llegar hasta el laboratorio de Umbrella.

Se llamaba Leon Scott Kennedy.

Esa misma noche yo escapaba por las alcantarillas con un
virus en la sangre que aún no sabía que tenía. Nueve meses
después, nacería mi hija. Nunca le he contado esto a nadie.

[Al margen, a mano:] «Si Leon sigue vivo, que proteja a Grace.»`
  },
  poema_quemado: {
    titulo: "Inscripción del pedestal (quemada)",
    estilo: "sangre",
    texto: `TRES GUARDIANES DEVUELVEN LA LUZ A LA DIOSA.

[El texto original está quemado. Alguien ha rascado encima,
con un cuchillo, otra inscripción:]

«Lo que en Raccoon empezó, en Raccoon termina.
Todo vuelve, pero todo vuelve AL REVÉS.
Primero reza la doncella. Luego galopa el cuerno de plata.
El león, que abría, ahora cierra.

Bienvenido a casa, Leon. — V. G.»`
  },
  registro_orfanato: {
    titulo: "Registro del orfanato de Raccoon City",
    estilo: "informe",
    texto: `ORFANATO DE RACCOON CITY · ALA ESPECIAL (ARK)
Supervisión: O. Spencer / V. Gideon

Los «niños» del ala especial no son huérfanos: son clones
y sujetos de prueba. Ninguno ha superado los doce años.

La puerta del ala infantil se abre con una fecha que Spencer
consideraba «el principio del fin»: la noche en que Umbrella
perdió el control de Raccoon City y llegó a la comisaría el
último policía novato. Día y mes. Cuatro cifras.

[Nota de Gideon:] «El chico de esa noche sigue vivo.
Leon Kennedy. Qué ironía que venga él a abrir esta puerta.»`
  }
});

HISTORIA.capitulos.push({
  id: "re9",
  juego: "Resident Evil Requiem",
  titulo: "Réquiem por Raccoon City",
  anio: "En la actualidad",
  lugar: "Hotel Wrenwood · Ruinas de Raccoon City · El ARK",
  tema: "tema-re9",
  fondoImagen: "img/escenarios/re9.webp",
  variantes: {leon: "leon_re9", chris: "chris_re8"},
  rutas: [

    /* ======================================================================
     *  GRACE ASHCROFT
     * ==================================================================== */
    {
      id: "grace",
      protagonista: "grace",
      titulo: "La hija de Alyssa",
      resumen: "Analista del FBI. Hace ocho años viste morir a tu madre en el Hotel Wrenwood. Ahora te envían a investigar cadáveres imposibles. Al mismo hotel. A la misma habitación.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Eres Grace Ashcroft, analista del FBI. Hija de Alyssa Ashcroft, periodista y superviviente de Raccoon City.",
          "Hace ocho años, tu madre fue asesinada en el Hotel Wrenwood. Tú estabas allí. Nunca encontraron al culpable.",
          "Ahora aparecen cadáveres imposibles cerca de las ruinas de la ciudad: personas a las que les han sacado el cerebro por la nariz.",
          "Tu jefe te envía a investigar. Al Wrenwood. Las luces parpadean. El papel pintado está hinchado de humedad. Y en algún lugar, algo respira."
        ] },
        { tipo: "explorar", titulo: "Vestíbulo del Hotel Wrenwood", imagen: "img/escenarios/re9_hotel.webp", escenario: "hotel", ancho: 16, fondo: 20, sangre: 6,
          descripcion: "Moqueta carmesí, lámparas de araña polvorientas y un recepcionista que no se mueve. Encuentra el libro de registro. Y no hagas ruido: algo se arrastra por los pasillos de arriba.",
          salida: { x: 5, z: -10, texto: "Ir a la puerta de servicio" },
          props: [
            ["mostrador", 0, -4], ["sofa", -5.6, 4, 1.57], ["sofa", 5.6, 4, -1.57], ["lampara", -6.8, -8], ["lampara", 6.8, 8.6], ["piano", -5.8, -7, 1.57],
            ["cuadro", -3, -9.95, 0, "alyssa"], ["cuadro", 2, -9.95, 0, "gideon"], ["cadaver", 3, 2, 1, "zombi"], ["pintada", 7.95, 0, -1.57, "GRACE"]
          ],
          puntos: [
            { x: 0, z: -3.2, nombre: "Libro de registro", texto: "El recepcionista sigue sentado, con la cabeza apoyada en el libro. Al tocarle, la cabeza rueda: le habían vaciado el cráneo. Debajo, el registro.", requerido: true, accion: { documento: "registro_wrenwood", aparecen: [{ id: "criatura", x: -5, z: -8, invencible: true, vel: 1.25, rango: 30, aturdido: "chilla con todas sus bocas a la vez y se encoge en el suelo. No va a durar.", ataque: "Una de sus bocas te muerde el hombro y arranca un trozo.", muerte: "La criatura del Wrenwood te devoró en el vestíbulo. Tu madre murió tres pisos más arriba." }] } },
            { x: 3, z: 2, nombre: "Huésped muerto", texto: "Un hombre en pijama con agujeros en las sienes. Por los agujeros asoman tubos de goma. Alguien le sacó el cerebro con una bomba de succión.", accion: { sangre: true } },
            { x: -5.6, z: 6.6, nombre: "Maletín del FBI", texto: "Tu kit de campo: munición, un spray médico y una cinta de tinta, por si acaso.", accion: { objetos: { municion: 18, spray: 1, cinta: 1 } } },
            { x: -5.8, z: -5, nombre: "Piano", texto: "Una partitura: el réquiem de Mozart. Alguien ha subrayado en rojo «Lacrimosa».", accion: { objeto: "hierba_verde", cantidad: 1 } }
          ],
          enemigos: [{ id: "zombi", x: -2, z: 4 }, { id: "zombi", x: 4, z: -6 }] },
        { tipo: "puzzle", id: "re9_grace_hotel", ui: "codigo", digitos: 3,
          titulo: "Puerta de servicio del Wrenwood",
          enunciado: "Tres cifras. El recepcionista dejó escrito cómo eligió el código el doctor de la 410.",
          danoFallo: 8, muerte: "La criatura te alcanzó mientras tecleabas. Te arrastró al hueco del ascensor.",
          pista: "La habitación de tu madre era la 307. Al revés: 703." },
        { tipo: "explorar", titulo: "Habitación 307", imagen: "img/escenarios/re9_pasillo.webp", escenario: "hotel", ancho: 10, fondo: 12, sangre: 3, lamparas: 1,
          descripcion: "La habitación donde murió tu madre. Nadie la ha vuelto a alquilar. El suelo cruje bajo una mancha oscura. Te tiemblan las manos.",
          salida: { x: 0, z: -6, texto: "Salir al pasillo" },
          props: [["cama", -3, 2, 1.57], ["sofa", 3.6, 3, -1.57], ["escritorio", 3, -4.2], ["sangre", 1, 1, 0, 2.5], ["cuadro", -4.95, -2, 1.57, "alyssa"], ["lampara", -4.2, -5]],
          puntos: [
            { x: -3.6, z: -1.2, nombre: "Mesilla de noche", prop: ["archivador", 1.57], texto: "Bajo el cajón, pegado con cinta adhesiva vieja: el cuaderno de tu madre.", requerido: true, accion: { documento: "diario_alyssa" } },
            { x: 1, z: 1, nombre: "Mancha en la moqueta", texto: "Ocho años y aún no se ha ido. Recuerdas el olor. Recuerdas el grito. Recuerdas una mano de hombre con guante de látex.", accion: { sangre: true } },
            { x: 3.6, z: -5.4, nombre: "Espejo del baño", texto: "Tu reflejo... sonríe. Tú no. ¡Algo sale del espejo roto y te araña la cara!", accion: { susto: "criatura", dano: 15, muerte: "Lo que vivía detrás del espejo te arrastró dentro. Nadie volvió a verte." } },
            { x: 0, z: -5.2, nombre: "Ventana", texto: "Al otro lado, las ruinas de Raccoon City. El cráter del misil sigue ahí. Las grúas parecen huesos." }
          ],
          enemigos: [] },
        { tipo: "chat", titulo: "Teléfono del hotel · línea interna", guion: [
          { de: "gideon", t: "Grace. Grace Ashcroft. Por fin vuelves a casa." },
          { de: "gideon", t: "Soy el doctor Victor Gideon. Conocí a tu madre. Se resistió mucho. Tú no lo harás." },
          { opciones: [
            { t: "Tú la mataste.", marca: "re9_grace_odio", resp: [{ de: "gideon", t: "Ella eligió proteger un secreto antes que su vida. Tú eres ese secreto, Grace. Eres la llave de Elpis." }] },
            { t: "¿Qué quieres de mí?", resp: [{ de: "gideon", t: "Lo que Spencer escondió en el ARK. Y tú, querida, eres la llave de Elpis." }] }
          ] },
          { sistema: "Línea cortada. Pasos en el techo." },
          { de: "leon", t: "Agente Ashcroft. Leon S. Kennedy. Llevo años siguiendo el rastro de Umbrella. Gideon es el último cabo suelto." },
          { de: "leon", t: "Estuve en Raccoon City la noche que se fue al infierno. Conocí a gente como tu madre. No estás sola." },
          { opciones: [
            { t: "No necesito niñera, Kennedy.", resp: [{ de: "leon", t: "Lo sé. Yo tampoco la tuve. Por eso estoy aquí." }] },
            { t: "Gracias, Leon. Vamos a terminar con esto.", marca: "re9_grace_leon", resp: [{ de: "leon", t: "Esa es la actitud. Te veo en el sótano. No toques nada que palpite." }] }
          ] }
        ] },
        { tipo: "encuentro", enemigo: "criatura", modo: "machaca", veces: 22, tiempo: 5, dano: 50, boton: "¡EMPÚJALA!",
          texto: "La cosa del Wrenwood se descuelga del hueco del ascensor: un cuerpo cosido a otros cuerpos, demasiadas bocas. Te aplasta contra el suelo y una de sus lenguas te busca la oreja.",
          exito: "La empujas al hueco del ascensor. Cae seis pisos. El crujido final retumba en todo el hotel.",
          fallo: "Te muerde el antebrazo y te arranca un trozo. Leon llega a tiempo y le vacía el cargador en la cara.",
          muerte: "La criatura del Wrenwood te devoró en el mismo pasillo donde murió tu madre." },
        { tipo: "maquina" },
        { tipo: "explorar", titulo: "Sótano del Wrenwood · Quirófano", imagen: "img/escenarios/re9_sotano.webp", escenario: "sotano", ancho: 16, fondo: 20, sangre: 8, matar: true, lamparas: 2,
          descripcion: "Azulejos blancos, desagües atascados de pelo y tarros con cerebros etiquetados. Aquí trabaja Gideon. Sus «no compatibles» siguen moviéndose. Acaba con ellos y encuentra su expediente.",
          salida: { x: 0, z: -10, texto: "Bajar al túnel del ARK" },
          props: [
            ["camilla", -4, 2, 0.3, "zombi"], ["camilla", 4, 2, -0.3, "zombi"], ["camilla", 0, 6, 1.57, "alyssa"], ["estanteria", -7.7, -4, 1.57], ["estanteria", 7.7, -4, -1.57],
            ["mesa", 0, -5], ["visceras", -2, -2], ["visceras", 3, -1], ["colgado", -5, 7, 0, "zombi"], ["pintada", 0, -9.95, 0, "NO COMPATIBLE"]
          ],
          puntos: [
            { x: 0, z: -4.6, nombre: "Mesa de Gideon", texto: "Un expediente sobre él mismo, escrito por alguien que lo odia. Y una sierra de cráneos todavía caliente.", requerido: true, accion: { documento: "expediente_gideon" } },
            { x: 0, z: 6, nombre: "La camilla del fondo", texto: "Un maniquí con la cara de tu madre pegada con grapas. Es su cara de verdad. Gideon se la quedó.", requerido: true, accion: { sangre: true, marca: "re9_grace_cara" } },
            { x: -7.4, z: -1, nombre: "Estantería de tarros", texto: "Cerebros etiquetados. Uno dice «Kowalski, 204». Entre los tarros, munición y un spray.", accion: { objetos: { municion: 20, spray: 1 } } }
          ],
          npcs: [{ id: "leon", x: 2, z: 8, sigue: true, si: "re9_grace_leon", lineas: ["Respira, Grace. Mírame a mí, no a eso.", "He visto cosas así antes. No te acostumbras.", "Tu madre fue muy valiente. Tú también lo eres."] }],
          enemigos: [
            { id: "zombi", figura: "zombi", x: -3, z: -3, vida: 4, remate: "El «no compatible» cae y su cráneo vacío suena hueco contra el suelo." },
            { id: "zombi", x: 3, z: -6, vida: 4 }, { id: "zombi", x: -5, z: -7, vida: 4 }, { id: "criatura", x: 4, z: -8, vida: 7, escala: 0.9, vel: 1.4, dano: 28, invencible: false }
          ] },
        { tipo: "narracion", lineas: [
          "Bajo el orfanato de Raccoon City y sus experimentos de clonación, Spencer construyó un último laboratorio: el ARK.",
          "Gideon cree que Elpis es un arma de control mental. Te ha perseguido toda la vida por ella. Mató a tu madre por ella.",
          "El túnel desemboca en una sala circular con un terminal en el centro. Huele a ozono y a sangre vieja."
        ] },
        { tipo: "explorar", titulo: "El ARK", imagen: "img/escenarios/re9_sotano.webp", escenario: "laboratorio", ancho: 20, fondo: 24, sangre: 6, matar: true,
          descripcion: "El último laboratorio de Spencer. Cápsulas con cuerpos de niños que nunca crecieron. Zeno, el científico que trabajaba con Gideon, dejó notas. Los guardianes del ARK despiertan.",
          salida: { x: 0, z: -12, texto: "Acceder al terminal central" },
          props: [
            ["capsula", -7, -7, 0, "huerfano"], ["capsula", -7, -2, 0, "huerfano"], ["capsula", 7, -7, 0, "huerfano"], ["capsula", 7, -2, 0, "grace"],
            ["consola", 0, -10], ["generador", -8.6, 9.6], ["tanque", 8.6, 9.4], ["visceras", 0, 2], ["pintada", -9.95, 3, 1.57, "ELPIS"]
          ],
          puntos: [
            { x: -3, z: 5, nombre: "Terminal de Zeno", prop: ["consola", 0], texto: "Correos entre Zeno y Gideon. Zeno parece el único que entendió a Spencer.", requerido: true, accion: { documento: "notas_zeno" } },
            { x: 7, z: -0.6, nombre: "Cápsula con tu cara", texto: "Una chica idéntica a ti, de unos doce años, flota dentro. La etiqueta dice: «GRACE · intento 9». Abre los ojos. Te mira.", requerido: true, accion: { susto: "huerfano", dano: 5 } },
            { x: 3, z: 5, nombre: "Armario del ARK", prop: ["archivador", 0], texto: "Munición, hierbas mezcladas y un spray.", accion: { objetos: { municion: 20, hierba_mixta: 1, spray: 1 } } }
          ],
          npcs: [{ id: "leon", x: -2, z: 10, sigue: true, lineas: ["Así que esto era el final de todo. Un sótano.", "Grace, lo que haya en ese terminal... decide tú.", "Llevo veintiocho años esperando cerrar esta puerta."] }],
          enemigos: [
            { id: "huerfano", x: -3, z: -4, vida: 2, vel: 2.4, dano: 14, rango: 14, ataque: "El niño sin boca te muerde con una boca que se le abre en la garganta." },
            { id: "huerfano", x: 3, z: -5, vida: 2, vel: 2.4, dano: 14, rango: 14 }, { id: "huerfano", x: 0, z: -7, vida: 2, vel: 2.4, dano: 14, rango: 14 },
            { id: "criatura", x: 0, z: -2, vida: 9, vel: 1.4, dano: 32 }
          ] },
        { tipo: "puzzle", id: "re9", ui: "texto",
          titulo: "Terminal del ARK",
          enunciado: "«INTRODUZCA EL NOMBRE DEL PROYECTO». Recuerda el cuaderno de tu madre y el cuento que te leía.",
          pista: "En el mito, lo único que quedó en el fondo de la caja de Pandora fue la esperanza. En griego, esperanza se dice «elpis».",
          placeholder: "Nombre del proyecto" },
        { tipo: "chat", titulo: "Canal abierto · B.S.A.A.", guion: [
          { de: "grace", t: "Leon... Elpis no es un arma. Es un antiviral. Cura a los sujetos de Umbrella." },
          { de: "leon", t: "Tu madre lo sabía. Por eso lo protegió." },
          { de: "gideon", t: "¡NO! ¡Era MÍO! ¡Todo esto era MÍO!", efecto: "temblor" },
          { de: "chris", t: "Aquí Redfield. El ARK se está viniendo abajo. Os tenemos en el radar. Salid YA." },
          { opciones: [
            { t: "Primero Gideon. Mi madre no descansará mientras él respire.", si: "re9_grace_odio", marca: "re9_grace_venganza", resp: [{ de: "leon", t: "Entonces lo hacemos juntos." }] },
            { t: "Leon, vámonos. Mi madre no murió para que yo muera aquí.", resp: [{ de: "leon", t: "Detrás de ti. Siempre." }] },
            { t: "Chris, ¿cuánto tiempo tenemos?", resp: [{ de: "chris", t: "Noventa segundos. Corred." }] }
          ] }
        ] },
        { tipo: "encuentro", enemigo: "gideon", modo: "esquiva", rondas: 5, velocidad: 1.5, dano: 40,
          texto: "Gideon se inyecta todas las muestras del ARK a la vez. Su piel se raja, sus costillas se abren como una boca y de su espalda salen brazos de los cadáveres que coleccionó. Lleva la cara de tu madre cosida en el pecho.",
          exito: "Esquivas cada zarpazo y le disparas a la cara de tu madre, a lo que él le hizo. Gideon cae gritando. Leon remata. Le quitas la cara de tu madre y la guardas.",
          fallo: "Una mano muerta te agarra el cuello. Leon te la corta con el cuchillo. Disparas los dos a la vez. Gideon revienta.",
          muerte: "Gideon te abrió el cráneo con sus nuevos dedos. Por fin tenía su llave." },
        { tipo: "narracion", lineas: [
          "Liberas Elpis. Por los conductos del ARK fluye la cura que Umbrella quiso convertir en arma.",
          "El laboratorio se desintegra. Gideon y Zeno quedan sepultados bajo toneladas de hormigón y carne.",
          "El helicóptero de Chris os saca del infierno. Abajo, lo que queda de Raccoon City se hunde por última vez.",
          "Abres el cuaderno de tu madre. En la última página, una frase: «Sobrevive». Lo has hecho, mamá. Lo hemos hecho todos."
        ] }
      ]
    },

    /* ======================================================================
     *  LEON S. KENNEDY
     * ==================================================================== */
    {
      id: "leon",
      protagonista: "leon",
      titulo: "Vuelta a casa",
      resumen: "Veintiocho años después de tu primer día como policía, vuelves a Raccoon City. Las ruinas, la comisaría, la estatua de la diosa... Todo lo que empezó aquella noche termina hoy.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Has perdido la cuenta de los monstruos que has matado. Raccoon, España, China. Siempre el mismo virus con distinto nombre.",
          "Ahora alguien está matando a los supervivientes de Raccoon City uno a uno. Les sacan el cerebro. Los etiquetan.",
          "El rastro te lleva a casa. A las ruinas de la ciudad donde empezó todo. Al cráter del misil, cubierto de maleza.",
          "Entras por la misma calle que aquella noche. Llegas tarde, otra vez. Pero esta vez nadie te espera vivo."
        ] },
        { tipo: "explorar", titulo: "Ruinas de Raccoon City", imagen: "img/escenarios/re9_ruinas.webp", escenario: "ruinas", ancho: 22, fondo: 28, sangre: 4,
          descripcion: "Hormigón quemado, coches oxidados y la silueta de la comisaría al fondo. Los muertos de 1998 siguen aquí: momificados, pero no quietos. Busca la armería de Kendo.",
          salida: { x: 0, z: -14, texto: "Ir a la comisaría" },
          props: [
            ["coche", -6, 6, 0.3, "policia"], ["coche", 6, -4, -0.6, "#3a2a1a"], ["coche", -5, -8, 1.3, "#2a2a2a"], ["escombros", 7, 8], ["escombros", -8, -1], ["escombros", 4, -11],
            ["arbol_seco", 9, -10], ["arbol_seco", -9, 10], ["cadaver", 2, 3, 1, "zombi"], ["pintada", 10.95, 0, -1.57, "RPD 1998"], ["tumba", 8, 11]
          ],
          puntos: [
            { x: -6, z: 4.2, nombre: "Tu coche patrulla", texto: "El mismo modelo. Puede que el mismo coche. En la guantera, tu placa de 1998, derretida. No sabías que la habías perdido aquí.", requerido: true, accion: { objetos: { municion: 15 } } },
            { x: 7.5, z: 5, nombre: "Armería de Kendo (en ruinas)", texto: "El cartel de Kendo, quemado. Dentro, un esqueleto abrazado a otro pequeño: Robert y su hija Emma. Entre los huesos, un periódico de 1998 con un artículo nunca publicado.", requerido: true, accion: { documento: "articulo_alyssa", marca: "re9_leon_articulo" } },
            { x: 2, z: 3, nombre: "Momia", texto: "Un zombi de 1998, seco como cecina, con el uniforme de la R.P.D. Se mueve. Abre la boca: le quedan tres dientes.", accion: { susto: "zombi", dano: 8, muerte: "Los muertos de 1998 te comieron en la misma calle donde empezaste. Llegaste tarde una vez más.", aparecen: [{ id: "zombi", x: 0, z: 0, vel: 0.7 }, { id: "zombi", x: 4, z: 1, vel: 0.7 }] } },
            { x: -8, z: 1.4, nombre: "Escombros", texto: "Hierbas verdes creciendo entre los cascotes, como en los viejos tiempos.", accion: { objeto: "hierba_verde", cantidad: 2 } }
          ],
          enemigos: [{ id: "zombi", x: -3, z: -3, vel: 0.7 }, { id: "zombi", x: 3, z: -6, vel: 0.7 }, { id: "perro", x: 0, z: -9 }] },
        { tipo: "explorar", titulo: "R.P.D. en ruinas", imagen: "img/escenarios/re9_rpd.webp", escenario: "comisaria", ancho: 16, fondo: 20, sangre: 4, ambiente: { cPared: "#4a4e52", ambiente: 0.35 },
          descripcion: "El vestíbulo de tu primer día. El techo se ha caído. La diosa de mármol sigue en pie, ennegrecida. Alguien ha rascado algo nuevo en su pedestal.",
          salida: { x: 0, z: -10, texto: "Ir a la estatua" },
          props: [
            ["estatua", 0, -3], ["escombros", -5, 5], ["escombros", 5, -6], ["mostrador", -4.6, 2, 1.57], ["banco", 6, 3, 1.57], ["pilar", -4.5, -6], ["pilar", 4.5, -6],
            ["cadaver", -5.6, 7, 1, "marvin"], ["pintada", 0, -9.95, 0, "BIENVENIDO A CASA"]
          ],
          puntos: [
            { x: 0, z: -1.4, nombre: "Pedestal de la diosa", texto: "La inscripción original está quemada. Encima, alguien ha grabado otra con un cuchillo. Firmada: «V. G.».", requerido: true, accion: { documento: "poema_quemado" } },
            { x: -5.6, z: 7, nombre: "Marvin", texto: "Un esqueleto con el uniforme de teniente, apoyado en la pared donde lo dejaste. Le prometiste una bala. Tiene un agujero en la frente. Alguien cumplió.", requerido: true, accion: { sangre: true } },
            { x: -4.6, z: 4.2, nombre: "Recepción", texto: "Munición de la R.P.D. de 1998. Todavía sirve.", accion: { objetos: { municion: 18, cinta: 1 } } }
          ],
          enemigos: [{ id: "licker", x: 3, z: -6 }, { id: "licker", x: -3, z: -8, alerta: false }, { id: "zombi", x: 4, z: 4 }] },
        { tipo: "puzzle", id: "re9_leon_estatua", ui: "orden", huecos: 3,
          titulo: "La diosa, veintisiete años después",
          enunciado: "Los mismos tres medallones. Pero Gideon ha cambiado las reglas. Lee la nueva inscripción.",
          opciones: [
            { id: "LEON", t: "León", icono: "♌" }, { id: "UNICORNIO", t: "Unicornio", icono: "🦄" },
            { id: "DONCELLA", t: "Doncella", icono: "♍" }, { id: "SERPIENTE", t: "Serpiente", icono: "🐍" }
          ],
          danoFallo: 10, muerte: "Un licker cayó del techo mientras dudabas. Esta vez no fuiste lo bastante rápido.",
          pista: "Todo vuelve al revés: doncella, unicornio y león." },
        { tipo: "chat", titulo: "Comunicador · Grace Ashcroft", guion: [
          { de: "grace", t: "¿Agente Kennedy? Soy Grace Ashcroft, FBI. Gideon me está buscando. Dice que soy una «llave»." },
          { opciones: [
            { t: "Tu madre escribió sobre mí. Ahora entiendo por qué.", si: "re9_leon_articulo", resp: [{ de: "grace", t: "¿Mi madre? ¿Tú... la conociste?" }, { de: "leon", t: "No. Pero ella me conocía a mí. Y me pidió que te protegiera." }] },
            { t: "Quédate donde estás. Voy a por ti.", resp: [{ de: "grace", t: "Estoy en el Wrenwood. Y no pienso quedarme quieta." }] }
          ] },
          { de: "gideon", t: "Leon. El policía novato. ¿Sabes cuántas noches he soñado con tu cerebro en un tarro? Tú también eres compatible. Un poco." }
        ] },
        { tipo: "maquina" },
        { tipo: "explorar", titulo: "Orfanato de Spencer · Ala infantil", imagen: "img/escenarios/re9_pasillo.webp", escenario: "casa", ancho: 16, fondo: 22, sangre: 5, matar: true, lamparas: 1,
          descripcion: "Bajo el pasadizo de la diosa, el viejo orfanato. Cunas, juguetes y niños que no crecieron. No son niños. Son lo que Spencer y Gideon hicieron con ellos.",
          salida: { x: 0, z: -11, texto: "Ir a la puerta del ala especial" },
          props: [
            ["cama", -6, 6, 1.57, "huerfano"], ["cama", -6, 2, 1.57], ["cama", 6, 6, -1.57], ["cama", 6, 2, -1.57, "huerfano"], ["muneca", -6, -4, 0, "huerfano"],
            ["cuadro", 0, -10.95, 0, "zeno"], ["pintada", -7.95, -6, 1.57, "SPENCER NOS AMA"], ["visceras", 0, 0], ["jaula", 5, -6, 0, "huerfano"]
          ],
          puntos: [
            { x: -3, z: -9, nombre: "Despacho de la directora", prop: ["escritorio", 0], texto: "Un registro con el sello de Spencer y notas de Gideon.", requerido: true, accion: { documento: "registro_orfanato" } },
            { x: 5, z: -4.6, nombre: "La jaula", texto: "Un niño de unos ocho años, sin boca. Donde debería estar la boca hay piel lisa. Se arranca la piel con las uñas para gritar.", accion: { sangre: true } },
            { x: 6, z: 8, nombre: "Baúl de juguetes", texto: "Munición, un spray y hierbas mezcladas. Alguien sobrevivió aquí abajo un tiempo.", accion: { objetos: { municion: 20, spray: 1, hierba_mixta: 1 } } }
          ],
          enemigos: [
            { id: "huerfano", x: -3, z: -2, vida: 2, vel: 2.5, dano: 14, rango: 14, ataque: "Los dientes del niño se te clavan en el muslo." },
            { id: "huerfano", x: 3, z: -3, vida: 2, vel: 2.5, dano: 14, rango: 14 }, { id: "huerfano", x: 0, z: -6, vida: 2, vel: 2.5, dano: 14, rango: 14 },
            { id: "huerfano", x: -4, z: -8, vida: 2, vel: 2.5, dano: 14, rango: 14 }, { id: "licker", x: 4, z: -9 }
          ] },
        { tipo: "puzzle", id: "re9_leon_fecha", ui: "codigo", digitos: 4,
          titulo: "Puerta del ala especial",
          enunciado: "Cuatro cifras. La noche en que llegó a la comisaría el último policía novato. Tú.",
          danoFallo: 5,
          pista: "Llegaste a Raccoon City el 29 de septiembre de 1998. Día y mes: 2909." },
        { tipo: "encuentro", enemigo: "zeno", modo: "esquiva", rondas: 4, velocidad: 1.45, dano: 35,
          texto: "Zeno te espera en el ala especial, rodeado de clones. Se ríe: «Gideon cree que Elpis es un arma. Yo sé que es una cura. Y no pienso dejar que nadie se cure». Se inyecta algo y su piel se vuelve blanca como la porcelana.",
          exito: "Esquivas sus ataques, más rápidos que los de cualquier humano, y le revientas la rodilla. Huye cojeando hacia el ARK.",
          fallo: "Te parte dos costillas de una patada. A sus cincuenta años, Leon Kennedy escupe sangre y sigue en pie.",
          muerte: "Zeno te partió el cuello con una sola mano. «Un réquiem para el novato», dijo." },
        { tipo: "encuentro", enemigo: "gideon", modo: "machaca", veces: 26, tiempo: 6, dano: 45, boton: "¡PROTEGE A GRACE!",
          texto: "En el ARK, Gideon tiene a Grace sujeta, con una aguja de extracción en la nuca. Se ha inyectado todo lo que había en el laboratorio: le salen brazos de los costados y bocas en el cuello. ¡Llega hasta ella!",
          exito: "Le disparas a cada boca y le clavas el cuchillo en el ojo. Grace se libera y le pega el tiro de gracia. «Por mi madre».",
          fallo: "Una mano muerta te desgarra la mejilla. Llegas igualmente. Grace dispara. Gideon revienta como un globo de carne.",
          muerte: "Gideon te atravesó el pecho con un brazo nuevo. Grace gritó tu nombre mientras le extraían la médula." },
        { tipo: "narracion", lineas: [
          "Grace libera Elpis. La cura fluye por los conductos. Lo que Spencer creó para destruir, al final, sanará.",
          "Salís del ARK mientras se hunde. Chris os espera en el helicóptero. Te da una palmada en el hombro. Nadie dice nada.",
          "Desde el aire, miras Raccoon City por última vez. Ves la comisaría hundirse en el cráter.",
          "Aquella noche de 1998 llegaste tarde. Esta vez llegaste a tiempo. Te quitas la placa vieja y la dejas caer al vacío. Se acabó."
        ] }
      ]
    }
  ]
});
