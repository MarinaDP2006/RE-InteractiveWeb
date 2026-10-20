/* ============================================================================
 *  ARCHIVO II · RESIDENT EVIL 3 (1998) — Jill Valentine · Carlos Oliveira
 *  Soluciones: Puzzles.java (re3, re3_jill_reloj, re3_carlos_*)
 * ========================================================================== */

"use strict";

Object.assign(DOCUMENTOS, {
  contestador_jill: {
    titulo: "Contestador automático",
    estilo: "papel",
    texto: `[Mensaje 1 · 28 de septiembre · 03:12]
«Jill, soy Brad. Lo he visto en la emisora de la policía.
Hay algo cazando a los S.T.A.R.S. Rebecca no contesta.
Barry se fue con su familia. Tú eres la siguiente.»

[Mensaje 2 · 03:40]
«Jill... han encontrado a Forest. O lo que quedaba.
Lo colgaron del tejado de la comisaría. Le habían arrancado
los ojos y le crecían... cosas... de las cuencas.»

[Mensaje 3 · 04:05]
«Sal de tu piso. Ya. Lleva gabardina. Es enorme.
Dice nuestro nombre. Jill, por favor, coge el telé—»

[Ruido de cristales. Fin de los mensajes.]`
  },
  informe_arklay: {
    titulo: "Informe clasificado · S.T.A.R.S.",
    estilo: "informe",
    texto: `DEPARTAMENTO DE POLICÍA DE RACCOON CITY
INFORME INTERNO — CONFIDENCIAL

Asunto: Incidente de la mansión Spencer, montes Arklay.

La noche del 24 de julio de 1998 el equipo Alpha de S.T.A.R.S.
entró en la mansión en busca del equipo Bravo desaparecido.
Supervivientes: Redfield, Valentine, Burton, Chambers, Vickers.
El jefe de equipo, Albert Wesker, consta como fallecido.

[Nota manuscrita al margen, con la letra temblorosa de Brad]
«Jill: el código del almacén del metro es el MES y el DÍA de
aquella noche maldita. Cuatro cifras, como lo escriben los
yanquis. No se me ocurrió nada mejor. Perdóname.»`
  },
  inscripcion_reloj: {
    titulo: "Placa de la torre del reloj",
    estilo: "informe",
    texto: `IGLESIA DE SAN MIGUEL · TORRE DEL RELOJ

«Para que las campanas vuelvan a sonar,
el tiempo debe ordenarse en tres piedras.

Primero el pasado, del color de la miel antigua,
donde quedan atrapados los insectos que ya no vuelan.

Después el presente, negro como la noche
que ahora cae sobre esta ciudad.

Y al final el futuro: transparente como el agua,
porque nadie puede verlo.»

La piedra roja es la sangre de los que no llegaron.
No pertenece al reloj.`
  },
  orden_misil: {
    titulo: "Orden presidencial · Clasificado",
    estilo: "email",
    texto: `DE: Casa Blanca · Consejo de Seguridad Nacional
PARA: Mando Estratégico
ASUNTO: Esterilización de Raccoon City

Confirmada la pérdida total de la población civil.
Se autoriza el lanzamiento de un misil termobárico
sobre Raccoon City el 1 de octubre a las 06:00.

Versión oficial: accidente en la central nuclear.

[Copia reenviada a Umbrella Europa por N. Zinoviev]
«Datos de combate del Némesis recogidos. Pelotón U.B.C.S.
neutralizado según lo previsto. Solicito extracción
para uno.»`
  },
  orden_ubcs: {
    titulo: "Orden de despliegue · U.B.C.S.",
    estilo: "informe",
    texto: `UMBRELLA BIOHAZARD COUNTERMEASURE SERVICE
Pelotón Delta · Compañía A

Misión oficial: rescate de civiles en Raccoon City.
Prioridad real: recuperar datos sobre el arma B.O.W.
designada «Némesis» y sus capacidades frente a objetivos
de los S.T.A.R.S.

Supervisores de campo asignados: 4. Sus órdenes
prevalecen sobre las del capitán Victor.

Nota del cuartel general: las bajas son aceptables.
Se recuerda que los mercenarios firmaron la renuncia
a repatriar los restos.`
  },
  grabacion_bard: {
    titulo: "Grabadora del Dr. Nathaniel Bard",
    estilo: "papel",
    texto: `[Transcripción · Hospital Spencer Memorial]

«Soy el doctor Bard. He sintetizado una vacuna contra el
virus T. Una dosis. Solo una. Umbrella la quiere destruir.

La he guardado en el frigorífico de vacunas del ala este.
El código es la fecha en que Umbrella cerró la ciudad y
cortó los puentes: el 28 de septiembre. Día y mes, como lo
escribimos los que no somos de aquí.

Si me pasa algo... no me dejéis levantarme. Quemadme.
Los Hunters huelen el miedo. Dios, ahí está. Está en la
ventilación. Está mirándome con esos ojos amarillos y—»

[Gritos. Desgarro húmedo. Algo que mastica.]`
  },
  lista_supervisores: {
    titulo: "Expedientes de supervisores U.B.C.S.",
    estilo: "email",
    texto: `TERMINAL U.B.C.S. · ACCESO RESTRINGIDO

Supervisor 1: Murphy Seeker (fallecido)
Supervisor 2: Tyrell Patrick → no es supervisor (error de registro)
Supervisor 3: ************ (registro borrado manualmente)
Supervisor 4: Mikhail Victor → capitán, no supervisor

Registro de accesos del supervisor 3:
· 22:14 — descarga de datos de combate del Némesis
· 22:40 — transferencia a cuenta en Suiza
· 23:02 — orden de voladura del puente de Moon Street
  con el pelotón Bravo encima

Firma digital del supervisor 3: «N. Z.»
Ruso. Ex Spetsnaz. El que siempre dice «Oliveira».`
  }
});

HISTORIA.capitulos.push({
  id: "re3",
  juego: "Resident Evil 3",
  titulo: "Némesis",
  anio: "28 de septiembre – 1 de octubre de 1998",
  lugar: "Calles de Raccoon City · Hospital · NEST 2",
  tema: "tema-re3",
  fondoImagen: "img/escenarios/re3.webp",
  rutas: [

    /* ======================================================================
     *  JILL VALENTINE
     * ==================================================================== */
    {
      id: "jill",
      protagonista: "jill",
      titulo: "La última S.T.A.R.S.",
      resumen: "Sobreviviste a la mansión Spencer. Ahora Umbrella ha enviado algo a por ti. Algo que dice tu nombre y no se detiene nunca.",
      pasos: [
        { tipo: "narracion", lineas: [
          "28 de septiembre de 1998. Llevas dos meses sin dormir. Desde la mansión, cada sombra tiene dientes.",
          "La radio dice que hay disturbios en Raccoon City. La radio miente. Tú sabes lo que es esto.",
          "El contestador parpadea. Tres mensajes de Brad Vickers. El último termina con cristales rotos.",
          "Entonces, la pared de tu apartamento explota hacia dentro."
        ] },
        { tipo: "explorar", titulo: "Apartamento de Jill", imagen: "img/escenarios/re3_calles.webp", escenario: "casa", ancho: 10, fondo: 13, sangre: 1, lamparas: 1,
          descripcion: "Tu piso. Fotos de los S.T.A.R.S., una pistola en la mesilla y el contestador parpadeando. Escucha los mensajes antes de que sea tarde.",
          salida: { x: 0, z: -6.5, texto: "Huir por el pasillo" },
          props: [
            ["cama", -3.6, 3.5, 1.57], ["sofa", 3.6, 2, -1.57], ["escritorio", 3, -4.2], ["nevera", -4.4, -5.5],
            ["cuadro", 0, -6.45, 0, "brad"], ["estanteria", -4.7, -1.5, 1.57], ["lampara", 4.4, 5.6]
          ],
          puntos: [
            { x: 3, z: -3.8, nombre: "Contestador", texto: "Tres mensajes de Brad. Al terminar el tercero, oyes una respiración pesada al otro lado de la pared. Y una voz: «S.T.A.R.S.».", requerido: true, accion: { documento: "contestador_jill", aparecen: [{ id: "nemesis", x: 3.6, z: 5.5, aturdido: "se tambalea, con el ojo reventado... y sonríe con sus dientes de cadáver." }] } },
            { x: -3.5, z: 1.5, nombre: "Mesilla de noche", texto: "Tu pistola Samurai Edge y munición. La foto del equipo Alpha, todos vivos todavía.", requerido: true, accion: { objetos: { municion: 15, hierba_verde: 1 } } },
            { x: -4.4, z: -4.6, nombre: "Nevera", texto: "Leche caducada, cerveza y una hierba verde que compraste en el mercado. Te llevas la hierba." , accion: { objeto: "hierba_verde", cantidad: 1 } },
            { x: -4.7, z: -1.5, nombre: "Estantería", texto: "Tus libros de cerrajería y una foto de tu padre, Dick Valentine, el mejor ladrón de Nueva York." }
          ],
          enemigos: [] },
        { tipo: "chat", titulo: "Radio S.T.A.R.S. · cifrada", guion: [
          { de: "brad", t: "¡Jill! ¡Jill, contesta! Viene a por nosotros... a por todos los S.T.A.R.S." },
          { opciones: [
            { t: "Brad, cálmate. ¿Dónde estás?", resp: [{ de: "brad", t: "En la puerta de la comisaría. Me mordieron en el hombro. Jill, te dejé el código del almacén del metro en un informe." }] },
            { t: "Acaba de reventar la pared de mi casa, Brad.", resp: [{ de: "brad", t: "Entonces ya lo has visto. Lleva gabardina y... dice nuestro nombre. Te dejé el código del almacén del metro en un informe." }] }
          ] },
          { de: "brad", t: "Está aquí. Dios, está aquí. Jill, corre, c—" },
          { sistema: "Interferencias. Un sonido húmedo. Un grito que se apaga.", efecto: "sangre" },
          { de: "brad", t: "SSSS... TTTT... AAAA... RRRR... SSSS", efecto: { susto: "nemesis" } },
          { sistema: "Conexión perdida." }
        ] },
        { tipo: "narracion", lineas: [
          "Llegas a la comisaría justo a tiempo de verlo.",
          "Un tentáculo atraviesa la nuca de Brad y le sale por la boca, arrancándole la mandíbula. Los dientes caen al suelo como granos de maíz.",
          "El monstruo deja caer el cuerpo como un muñeco roto y gira hacia ti su único ojo blanco."
        ] },
        { tipo: "encuentro", enemigo: "nemesis", modo: "machaca", veces: 20, tiempo: 5, dano: 50, boton: "¡CORRE!",
          texto: "«S.T.A.R.S.!!» Némesis carga contra ti. Corre. CORRE.",
          exito: "Te lanzas por una ventana y caes sobre un contenedor. Némesis ruge desde arriba. Por ahora estás viva.",
          fallo: "Su puño te alcanza en la espalda. Sientes algo romperse. Escapas entre los coches en llamas, meando sangre.",
          muerte: "Némesis te atravesó el pecho con su tentáculo y te levantó como un trofeo. «S.T.A.R.S.» fue lo último que oíste." },
        { tipo: "chat", titulo: "U.B.C.S. · Escuadrón Delta", guion: [
          { de: "carlos", t: "¡Eh! ¿Eres la policía de los S.T.A.R.S.? Carlos Oliveira, U.B.C.S. Trabajamos para Umbrella, pero nadie nos dijo que esto sería un matadero." },
          { opciones: [
            { t: "Trabajas para Umbrella. ¿Por qué debería fiarme de ti?", resp: [{ de: "carlos", t: "Porque tengo un tren y tú tienes una ciudad que se está comiendo a sí misma. Mal trato no es." }] },
            { t: "Me alegro de ver a alguien vivo. ¿Qué plan tenéis?", marca: "re3_jill_carlos", resp: [{ de: "carlos", t: "Evacuar civiles en tren. Pero el almacén del metro tiene un bloqueo con código." }] }
          ] },
          { de: "mikhail", t: "Soy el capitán Victor. Mis hombres están muertos. Todos. Ese monstruo los fue arrancando uno a uno de los tejados." },
          { de: "nikolai", t: "Oliveira, deja de ligar. Si la policía no abre el almacén, nos vamos sin ella. Y sin los civiles." },
          { de: "carlos", t: "No le hagas caso a Nikolai. Es un témpano. Jill, busca el código. Te cubro." }
        ] },
        { tipo: "explorar", titulo: "Subestación del metro", imagen: "img/escenarios/re3_metro.webp", escenario: "metro", ancho: 16, fondo: 24, sangre: 6,
          descripcion: "Luces de emergencia rojas, vagones abandonados y un zumbido eléctrico constante. Carlos te cubre. Busca el informe de Brad... y no te quedes quieta: algo grande camina por los túneles.",
          salida: { x: 0, z: -12, texto: "Ir al panel del almacén" },
          props: [
            ["vagon", -5.6, 0], ["caja", 6.5, 9], ["caja", 6.5, 7.8], ["barril", 7, -10], ["generador", 6.8, -4, -1.57],
            ["pintada", 7.95, 3, -1.57, "S.T.A.R.S."], ["visceras", 2, 3], ["colgado", 3, -7, 0, "zombi"]
          ],
          puntos: [
            { x: 1.8, z: 6, nombre: "Cadáver de Brad", prop: ["cadaver", 0.5, "brad"], texto: "Alguien ha arrastrado aquí lo que queda de Brad. Le falta la mandíbula; la lengua le cuelga hasta el cuello. En su chaleco, un informe doblado.", requerido: true, accion: { documento: "informe_arklay" } },
            { x: -2.5, z: -3, nombre: "Mercenario U.B.C.S.", prop: ["cadaver", 1.8, "zombi"], texto: "Destripado de arriba abajo. Sus intestinos cuelgan del andén como guirnaldas. Tiene munición y un spray en el cinturón.", accion: { objetos: { municion: 12, spray: 1 } } },
            { x: 6.8, z: -6, nombre: "Mapa del metro", texto: "Las líneas forman una telaraña. La salida de la ciudad está tachada en rojo... con sangre." },
            { x: -2.6, z: 6, nombre: "Puerta del vagón", texto: "Algo se mueve dentro. ¡Un perro zombi sin piel salta hacia tu cara!", accion: { susto: "perro", dano: 15, muerte: "Los perros de Umbrella te despedazaron entre los vagones.", aparecen: [{ id: "perro", x: -2, z: 3 }, { id: "perro", x: -1, z: 1 }] } },
            { x: 6.4, z: 8.4, nombre: "Caja de herramientas", texto: "Hierbas verdes envueltas en un trapo. Algún mercenario previsor.", accion: { objeto: "hierba_verde", cantidad: 2 } }
          ],
          npcs: [
            { id: "carlos", x: 2, z: 10, sigue: true, lineas: ["Te cubro, Jill. ¡Muévete!", "Este tío de la gabardina... ¿es cosa de Umbrella?", "Cuando salgamos de esta, te invito a una cerveza. Bueno, a diez."] }
          ],
          enemigos: [
            { id: "zombi", x: 3, z: 0 }, { id: "zombi", x: -1, z: -6 },
            { id: "nemesis", x: 0, z: -11, rango: 14, vel: 1.6, aturdido: "cae de rodillas con el tentáculo colgando. Se levantará. Siempre se levanta.", muerte: "Némesis te agarró de la cabeza y te la aplastó contra el andén hasta que dejó de tener forma." }
          ] },
        { tipo: "puzzle", id: "re3", ui: "codigo", digitos: 4,
          titulo: "Panel del almacén del metro",
          enunciado: "Introduce el código de 4 cifras. Brad te dejó una pista en su informe.",
          danoFallo: 5,
          pista: "La noche de la mansión Spencer fue el 24 de julio. Al estilo americano: primero el mes (07), luego el día (24)." },
        { tipo: "maquina" },
        { tipo: "susto", enemigo: "nemesis", texto: "El techo del vagón se abolla desde arriba. ¡NÉMESIS! El tren descarrila contra la iglesia de San Miguel.", dano: 20, muerte: "Némesis arrancó el techo del vagón y te arrancó a ti con él." },
        { tipo: "explorar", titulo: "Torre del reloj", imagen: "img/escenarios/re3_torre.webp", escenario: "torre", ancho: 12, fondo: 16, sangre: 4, lamparas: 1,
          descripcion: "Engranajes gigantes, cuervos y el eco de tu respiración. Si haces sonar las campanas, el helicóptero de rescate os encontrará. El mecanismo pide tres gemas.",
          salida: { x: 0, z: -8, texto: "Ir al mecanismo del reloj" },
          props: [
            ["pilar", -4, -4], ["pilar", 4, -4], ["pilar", -4, 3], ["pilar", 4, 3], ["piano", -4.8, 6.6, 1.57], ["banco", 3.5, 6.4],
            ["cruz", 0, -7.4, 0, "zombi"], ["colgado", -2, 0, 0, "zombi"], ["sangre", 1, 2, 0, 3]
          ],
          puntos: [
            { x: 0, z: -6.4, nombre: "Placa del mecanismo", texto: "Una placa de bronce con una inscripción sobre el tiempo.", requerido: true, accion: { documento: "inscripcion_reloj" } },
            { x: -5.2, z: -6, nombre: "Gema ámbar", texto: "Una gema color miel con un mosquito atrapado dentro, junto al cadáver de un sacerdote al que le han comido la cara.", requerido: true, accion: { aparecen: [{ id: "zombi", x: -3, z: 1 }, { id: "zombi", x: 3, z: 0 }] } },
            { x: 5.2, z: 0, nombre: "Gema obsidiana", texto: "Negra como la noche. Estaba dentro de la boca de un cuervo muerto.", requerido: true },
            { x: 5, z: 6.4, nombre: "Gema de cristal", texto: "Transparente. Al cogerla, ves tu reflejo... y detrás, un ojo blanco en la ventana.", requerido: true, accion: { susto: "nemesis", dano: 10, muerte: "Némesis atravesó la vidriera y te arrastró al vacío desde la torre." } },
            { x: -4.6, z: 6.4, nombre: "Atril del piano", texto: "Munición escondida en el banco del piano.", accion: { objetos: { municion: 12 } } }
          ],
          npcs: [
            { id: "carlos", x: 1.5, z: 6, sigue: true, lineas: ["Las campanas... buena idea. Que nos oiga hasta Dios.", "Estás sangrando, Jill. Deja que mire eso.", "Nicholai no contesta a la radio. No me gusta."] }
          ],
          enemigos: [{ id: "zombi", x: 0, z: -2 }] },
        { tipo: "puzzle", id: "re3_jill_reloj", ui: "orden", huecos: 3,
          titulo: "El reloj de San Miguel",
          enunciado: "Coloca las gemas en el mecanismo: pasado, presente y futuro. La placa de bronce lo describe.",
          opciones: [
            { id: "AMBAR", t: "Ámbar", icono: "🟠" }, { id: "OBSIDIANA", t: "Obsidiana", icono: "⚫" },
            { id: "CRISTAL", t: "Cristal", icono: "💎" }, { id: "RUBI", t: "Rubí", icono: "🔴" }
          ],
          danoFallo: 8, muerte: "Los engranajes te atraparon la manga. Te arrastraron dentro. Salió muy poco de ti por el otro lado.",
          pista: "Pasado = color miel (ámbar). Presente = negro (obsidiana). Futuro = transparente (cristal). El rubí no pertenece al reloj." },
        { tipo: "encuentro", enemigo: "nemesis", modo: "esquiva", rondas: 4, velocidad: 1.35, dano: 35,
          texto: "Las campanas repican. El helicóptero llega... y un cohete de Némesis lo derriba en llamas. El monstruo salta a la plaza con un lanzacohetes al hombro.",
          exito: "Esquivas cada cohete. Le vuelas media cara con una granada. Pero su tentáculo te alcanza la espalda antes de caer: te ha inyectado algo.",
          fallo: "La metralla te abre la pierna. Y su tentáculo se te clava entre los omóplatos. Notas cómo te inyecta algo frío. El virus.",
          muerte: "El cohete de Némesis te alcanzó de lleno. Encontraron tu bota. Con el pie dentro." },
        { tipo: "narracion", lineas: [
          "Te desmayas en la escalera de la torre. El virus T te quema las venas.",
          "Durante dos días deliras. Ves a Forest sin ojos, a Brad sin mandíbula, a Wesker sonriendo.",
          "Carlos te arrastra hasta el hospital Spencer Memorial y te inyecta la vacuna. Le cuesta la sangre de medio pelotón conseguirla.",
          "Despiertas el 1 de octubre. La ciudad será bombardeada al amanecer. Y Némesis sigue ahí fuera."
        ] },
        { tipo: "maquina" },
        { tipo: "explorar", titulo: "NEST 2 · Laboratorio de Umbrella", imagen: "img/escenarios/re3_nest2.webp", escenario: "laboratorio", ancho: 18, fondo: 22, sangre: 6, matar: true,
          descripcion: "El laboratorio donde fabricaron a Némesis. Nicholai os ha traicionado y ha soltado a los Hunters. Mátalos a todos y encuentra la orden del misil.",
          salida: { x: 0, z: -11, texto: "Ir a la plataforma de lanzamiento" },
          props: [
            ["capsula", -6, -6, 0, "nemesis"], ["capsula", -6, -2, 0, "hunter"], ["capsula", 6, -6, 0, "hunter"], ["capsula", 6, -2, 0, "zombi"],
            ["consola", -3, -9.5], ["generador", 7.8, 8.6], ["tanque", -7.6, 8.6], ["visceras", 2, 3], ["camilla", 3, 5, 0.3, "mikhail"]
          ],
          puntos: [
            { x: -3, z: -8.6, nombre: "Terminal de Nicholai", texto: "Nicholai se ha dejado la sesión abierta. Una orden presidencial y su mensaje a Umbrella Europa.", requerido: true, accion: { documento: "orden_misil" } },
            { x: 3, z: 5.4, nombre: "Camilla", texto: "El capitán Mikhail Victor. Murió reventándose con una granada para frenar a Némesis. Le quedaba munición.", accion: { objetos: { municion: 15, spray: 1 } } },
            { x: 7.6, z: 4, nombre: "Armario de armas", prop: ["archivador", -1.57], texto: "Hierbas mezcladas y munición del laboratorio.", accion: { objetos: { hierba_mixta: 1, municion: 10 } } }
          ],
          npcs: [
            { id: "carlos", x: 0, z: 9, sigue: true, lineas: ["¡Hunters! ¡Apunta a la cabeza!", "Nicholai, cabrón... nos vendió a todos.", "Tenemos hasta el amanecer. Luego, boom."] }
          ],
          enemigos: [
            { id: "hunter", x: -3, z: -3 }, { id: "hunter", x: 3, z: -4 }, { id: "hunter", x: 0, z: -7 },
            { id: "zombi", x: -6, z: 3 }
          ] },
        { tipo: "encuentro", enemigo: "nemesis", modo: "machaca", veces: 24, tiempo: 6, dano: 50, boton: "¡CAÑÓN DE RAÍLES!",
          texto: "Némesis muta en su forma final: una masa de carne de seis metros que se arrastra sobre tentáculos, con la boca abierta hasta el estómago. El cañón de raíles de Umbrella está cargado. ¡Dispara!",
          exito: "El rayo atraviesa a Némesis de lado a lado. La masa de carne se cocina por dentro y revienta, empapando el laboratorio. Le pegas un último tiro a lo que queda: «Ya tienes tus S.T.A.R.S.».",
          fallo: "Un tentáculo te rompe el brazo antes del disparo. Disparas con la otra mano. Némesis revienta en una lluvia de carne humeante.",
          muerte: "Némesis te engulló entera. Durante unos segundos, todavía se oyó tu pistola disparando desde dentro." },
        { tipo: "narracion", lineas: [
          "1 de octubre de 1998, 06:00. Barry Burton aparece en un helicóptero en el último segundo. Carlos y tú saltáis a bordo.",
          "El misil cae. Raccoon City desaparece en una bola de fuego. Cien mil personas, vivas y muertas, borradas del mapa.",
          "La versión oficial hablará de un accidente nuclear. Tú sabes la verdad. Y vas a contarla, aunque nadie te crea.",
          "Desde el helicóptero, ves la columna de fuego. Juras que Umbrella pagará por esto."
        ] }
      ]
    },

    /* ======================================================================
     *  CARLOS OLIVEIRA
     * ==================================================================== */
    {
      id: "carlos",
      protagonista: "carlos",
      titulo: "El mercenario",
      resumen: "Umbrella te mandó a «rescatar civiles». Era mentira. Tu pelotón muere en la primera hora, la mujer que te gusta se está convirtiendo en zombi y uno de los tuyos es un traidor.",
      pasos: [
        { tipo: "narracion", lineas: [
          "Eres Carlos Oliveira, cabo de la U.B.C.S. Ex guerrillero sudamericano. Umbrella te contrató por tu puntería y te prometió un trabajo fácil.",
          "Os sueltan en Raccoon City desde helicópteros. Doscientos mercenarios. «Rescate de civiles».",
          "En la primera hora, una horda os rodea en un restaurante. Ves a tu compañero Murphy con la cara metida en la boca de un zombi, que le mastica la nariz.",
          "Cuando amanece, de tu pelotón quedan cuatro hombres. Y uno de ellos sonríe demasiado."
        ] },
        { tipo: "explorar", titulo: "Restaurante Grill 13", imagen: "img/escenarios/re3_calles.webp", escenario: "calle", ancho: 14, fondo: 20, sangre: 7,
          descripcion: "El punto de reunión del pelotón. Mesas volcadas, mercenarios muertos y zombis que aún tienen hambre. Tyrell te cubre. Encuentra la radio y la orden de despliegue.",
          salida: { x: 0, z: -10, texto: "Salir hacia el centro" },
          props: [
            ["mesa", -3.5, 4], ["mesa", 3.5, 4], ["mesa", -3.5, -1], ["silla", -2.5, 3.5, 1], ["silla", 4.5, 4.4, -2],
            ["mostrador", 0, -6.5], ["coche", 5, -2.5, 0.3, "ardiendo"], ["visceras", 0, 1], ["cadaver", -5, 7, 0.6, "zombi"], ["pintada", -6.95, 0, 1.57, "UBCS RIP"]
          ],
          puntos: [
            { x: -3.5, z: -1, nombre: "Radio del pelotón", texto: "Entre platos rotos y un brazo con el tatuaje de la U.B.C.S., la orden de despliegue. Y una nota: «prioridad real».", requerido: true, accion: { documento: "orden_ubcs" } },
            { x: -5, z: 7, nombre: "Murphy", texto: "Murphy Seeker. Le han comido la cara hasta dejarle solo los dientes. Tiene la mano agarrotada sobre un cargador. Te lo llevas. Lo siento, hermano.", accion: { objetos: { municion: 14 } } },
            { x: 0, z: -5.8, nombre: "Cocina", texto: "La cocina. Ollas con algo hirviendo que tiene dedos. ¡Los cocineros, zombis, saltan del mostrador!", requerido: true, accion: { aparecen: [{ id: "zombi", x: -2, z: -4 }, { id: "zombi", x: 2, z: -4 }, { id: "zombi", x: 0, z: -3 }] } },
            { x: 5.8, z: 8, nombre: "Botiquín", texto: "Hierbas y un spray. Alguien en este restaurante era precavido.", accion: { objetos: { hierba_verde: 1, spray: 1 } } }
          ],
          npcs: [
            { id: "tyrell", x: 2, z: 8, sigue: true, lineas: ["Carlos, este sitio es un cementerio con menú del día.", "He hablado con la base. No contestan. Nadie contesta.", "Ese Nicholai... ¿lo has visto disparar? Nunca falla. Y nunca ayuda."] }
          ],
          enemigos: [{ id: "zombi", x: -2, z: 1 }, { id: "zombi", x: 3, z: 0 }] },
        { tipo: "chat", titulo: "Radio U.B.C.S.", guion: [
          { de: "mikhail", t: "Oliveira, aquí el capitán Victor. Estoy herido. Una cosa gigante con gabardina nos ha despedazado en el puente." },
          { de: "nikolai", t: "El capitán exagera. Sigamos con la misión. El tren, los civiles... y lo que haga falta." },
          { de: "jill", t: "Carlos, soy Jill. Me... me ha infectado. Némesis. Tengo fiebre. Veo cosas que no están." },
          { opciones: [
            { t: "Aguanta, Jill. Te traeré una vacuna aunque tenga que robarla del infierno.", marca: "re3_carlos_promesa", resp: [{ de: "jill", t: "No hagas promesas que... que no puedas... cumplir..." }, { de: "tyrell", t: "El hospital Spencer Memorial. Allí había un doctor de Umbrella trabajando en una vacuna." }] },
            { t: "Nicholai, ¿qué sabes tú de todo esto?", resp: [{ de: "nikolai", t: "Sé que la gente sentimental muere primero, Oliveira." }, { de: "tyrell", t: "Ignóralo. Vamos al hospital Spencer Memorial. Había un doctor allí trabajando en una vacuna." }] }
          ] }
        ] },
        { tipo: "explorar", titulo: "Hospital Spencer Memorial", imagen: "img/escenarios/re3_hospital.webp", escenario: "hospital", ancho: 16, fondo: 24, sangre: 7, matar: true,
          descripcion: "Pasillos verdes, camillas volcadas y un olor a formol que no tapa el de la carne podrida. Algo con garras se mueve por los conductos. Encuentra la grabación del doctor Bard y limpia la planta.",
          salida: { x: 0, z: -12, texto: "Ir al frigorífico de vacunas" },
          props: [
            ["camilla", -5.5, 7, 1.57, "zombi"], ["camilla", -5.5, 3, 1.57], ["camilla", 5.5, 5, -1.57, "zombi"], ["cama", 5.6, -3, -1.57, "sangre"],
            ["archivador", -7.3, -6], ["archivador", -7.3, -4.8], ["mesa", 2, -8], ["visceras", 0, 2], ["pintada", 7.95, 0, -1.57, "NO RESUCITAR"]
          ],
          puntos: [
            { x: 2, z: -7.5, nombre: "Despacho del Dr. Bard", texto: "Una minigrabadora sobre el escritorio, junto a una mano cortada que aún la sujeta.", requerido: true, accion: { documento: "grabacion_bard" } },
            { x: -5.5, z: 3, nombre: "Camilla vacía", texto: "Correas rotas desde dentro. Restos de piel en las hebillas. Munición de un guardia muerto debajo.", accion: { objetos: { municion: 12 } } },
            { x: 5.5, z: -6, nombre: "Morgue", texto: "Las cámaras frigoríficas están abiertas. Todas vacías. Los cadáveres se han ido caminando.", accion: { aparecen: [{ id: "zombi", x: 3, z: -9 }, { id: "zombi", x: 5, z: -10 }] } },
            { x: -6.5, z: -9.5, nombre: "Farmacia", texto: "Spray y hierbas mezcladas.", accion: { objetos: { spray: 1, hierba_mixta: 1 } } }
          ],
          npcs: [
            { id: "tyrell", x: 1, z: 10, sigue: true, lineas: ["¡Hunters! ¡Esos bichos te arrancan la cabeza de un zarpazo!", "Bard... el doctor. Era un buen tipo. Más o menos.", "Date prisa, Carlos. Tu chica no tiene toda la noche."] }
          ],
          enemigos: [
            { id: "hunter", x: -3, z: -2, muerte: "El Hunter te decapitó de un zarpazo. Tu cabeza rodó hasta la puerta de la morgue." },
            { id: "hunter", x: 3, z: -5 }, { id: "zombi", x: 0, z: 4 }
          ] },
        { tipo: "puzzle", id: "re3_carlos_vacuna", ui: "codigo", digitos: 4,
          titulo: "Frigorífico de vacunas",
          enunciado: "Cuatro cifras. El doctor Bard lo dijo en su grabación.",
          danoFallo: 5,
          pista: "El 28 de septiembre, en formato día-mes: 2809." },
        { tipo: "encuentro", enemigo: "hunter", modo: "esquiva", rondas: 3, velocidad: 1.35, dano: 35,
          texto: "Con la vacuna en el bolsillo, un Hunter γ —una rana del tamaño de un oso— sale del depósito de agua y abre una boca que te cabría entero.",
          exito: "Ruedas bajo su lengua y le metes una granada en la garganta. Revienta como un globo lleno de sangre.",
          fallo: "Te traga hasta la cintura. Notas sus jugos gástricos quemándote las piernas. Le disparas desde dentro y te escupe.",
          muerte: "El Hunter γ te tragó entero. Su estómago tardó tres días en digerirte." },
        { tipo: "maquina" },
        { tipo: "chat", titulo: "Hospital · habitación 402", guion: [
          { de: "jill", t: "...Carlos... has venido..." },
          { sistema: "Le inyectas la vacuna. Jill grita, se arquea y vomita sangre negra. Luego respira." },
          { de: "jill", t: "Gracias. De verdad. No sé cómo voy a pagártelo.", si: "re3_carlos_promesa" },
          { de: "jill", t: "Gracias, Carlos. Pensé que no volvería a abrir los ojos.", siNo: "re3_carlos_promesa" },
          { de: "tyrell", t: "Carlos. Nicholai ha volado el puente con el pelotón Bravo encima. Lo he visto con mis propios ojos." },
          { opciones: [
            { t: "Lo sabía. Voy a por él.", resp: [{ de: "tyrell", t: "Primero necesitamos pruebas. La comisaría tiene un terminal de la U.B.C.S." }] },
            { t: "¿Por qué haría algo así?", resp: [{ de: "tyrell", t: "Por dinero. Umbrella paga por cada dato de combate. Y los muertos no cobran. Vamos a la comisaría." }] }
          ] }
        ] },
        { tipo: "explorar", titulo: "Comisaría de Raccoon City", imagen: "img/escenarios/re2_vestibulo.webp", escenario: "comisaria", ancho: 16, fondo: 20, sangre: 6,
          descripcion: "La R.P.D., un día antes de que llegue Leon. Ya huele a muerte. El terminal de la U.B.C.S. está en la sala de archivos. Hay algo en el techo.",
          salida: { x: -5, z: -10, texto: "Ir al terminal" },
          props: [
            ["estatua", 0, -3], ["mostrador", -4.6, 3, 1.57], ["banco", 6, 0, 1.57], ["archivador", 7.2, -8], ["archivador", 7.2, -6.8],
            ["cadaver", 3, 5, 1, "zombi"], ["colgado", -3, -7, 0, "zombi"], ["pintada", 0, -9.95, 0, "S.T.A.R.S. RIP"]
          ],
          puntos: [
            { x: 6.6, z: -4, nombre: "Terminal U.B.C.S.", prop: ["consola", -1.57], texto: "El terminal de enlace de la U.B.C.S. con los expedientes de los supervisores. Uno está borrado. Pero los registros no mienten.", requerido: true, accion: { documento: "lista_supervisores" } },
            { x: -4.6, z: 6, nombre: "Armario de la entrada", texto: "Munición de la policía y una cinta de tinta.", accion: { objetos: { municion: 12, cinta: 1 } } },
            { x: 3, z: 5, nombre: "Agente muerto", texto: "Lleva la placa de Marvin Branagh en la mano. Marvin vive... por ahora. Este pobre no: le han sacado los ojos a mordiscos.", accion: { sangre: true } }
          ],
          npcs: [
            { id: "marvin", x: -6, z: 7.5, lineas: ["¿U.B.C.S.? ¿Umbrella? Vuestra empresa ha matado esta ciudad.", "Hay lickers en el ala este. Cosas sin piel que te arrancan la cabeza con la lengua.", "Si ves a una chica de los S.T.A.R.S., Jill... dile que la R.P.D. lo siente."] }
          ],
          enemigos: [
            { id: "licker", x: 2, z: -6 }, { id: "zombi", x: -3, z: 0 }, { id: "zombi", x: 4, z: 2 }
          ] },
        { tipo: "puzzle", id: "re3_carlos_traidor", ui: "texto",
          titulo: "Identificar al supervisor 3",
          enunciado: "El terminal pide el nombre del supervisor cuyo registro fue borrado. Los registros de acceso lo delatan.",
          pista: "Firma «N. Z.», ruso, ex Spetsnaz, siempre te llama «Oliveira»: Nikolai (Nicholai) Zinoviev.",
          placeholder: "Nombre del traidor" },
        { tipo: "encuentro", enemigo: "nikolai", modo: "esquiva", rondas: 4, velocidad: 1.4, dano: 30,
          texto: "Nicholai te espera en la torre de comunicaciones con un rifle de francotirador. «Oliveira. Siempre tan sentimental». Tyrell ya está en el suelo con un agujero en la frente.",
          exito: "Esquivas cada disparo y te lanzas sobre él. Le rompes la nariz de un cabezazo. Huye en un helicóptero, sangrando, pero sin los datos.",
          fallo: "Una bala te atraviesa el hombro y te parte la escápula. Aun así, le quitas el disco con los datos. Huye maldiciendo en ruso.",
          muerte: "Nicholai te disparó entre los ojos. Luego cobró por ello." },
        { tipo: "narracion", lineas: [
          "Tyrell muere en tus brazos en la planta de NEST 2, con el pecho aplastado por el puño de Némesis. Su última palabra es «corre».",
          "Jill acaba con Némesis con el cañón de raíles. Tú la cubres hasta que no te quedan balas.",
          "Barry Burton os recoge en un helicóptero al amanecer. Debajo, el misil convierte Raccoon City en un sol blanco.",
          "Dejas la U.B.C.S. Te quedas con Jill y con Barry. Algún día, juras, encontrarás a Nicholai. Y no fallarás."
        ] }
      ]
    }
  ]
});
