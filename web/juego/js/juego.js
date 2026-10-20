/* ============================================================================
 *  juego.js — Motor del escape room
 * ============================================================================
 *
 *  Lee HISTORIA (historia.js) y la ejecuta paso a paso:
 *     narración → sala → chat → encuentro → puzzle → máquina de escribir → ...
 *
 *  Conceptos clave:
 *   · E (estado): todo lo que define la partida (capítulo, paso, salud,
 *     inventario, documentos, muertes, tiempo). Se serializa a JSON para
 *     guardar en el navegador (localStorage) y en el servidor Java.
 *   · token: número que se incrementa cada vez que cambia el paso. Las tareas
 *     asíncronas (texto que se escribe, chats con retardo, QTE...) comprueban
 *     su token y se detienen si ya no es el actual. Evita que una pantalla
 *     "vieja" siga ejecutándose tras morir o cambiar de paso.
 *   · puntoControl: copia del estado al empezar el capítulo (reintentar).
 *   · ultimoGuardado: copia del estado de la última máquina de escribir.
 * ========================================================================== */

"use strict";

const Juego = (() => {
  /* ------------------------------------------------------------------
   *  Constantes y estado interno
   * ---------------------------------------------------------------- */
  const CLAVE_PARTIDA = "archivos_umbrella_partida";   // localStorage: partida
  const CLAVE_OPCIONES = "archivos_umbrella_opciones"; // localStorage: opciones
  const CLAVE_AVISO = "archivos_umbrella_aviso18";     // localStorage: aviso aceptado
  const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const SALUD_MAX = 100;

  let E = null;               // Estado de la partida en curso
  let puntoControl = null;    // JSON del estado al inicio del capítulo
  let ultimoGuardado = null;  // JSON de la última máquina de escribir
  let sesionDesde = 0;        // Marca de tiempo desde la que corre el reloj
  let token = 0;              // Invalida tareas asíncronas obsoletas
  // Gráficos (render3d.js): calidad bajo|alto|ultra|auto, escalado UMBRA-SR, transiciones y FPS.
  let opciones = { sonido: true, reducir: false, calidad: "auto", escalado: "auto", transiciones: true, fps: false };

  /* ------------------------------------------------------------------
   *  Utilidades
   * ---------------------------------------------------------------- */
  const $ = (selector, raiz = document) => raiz.querySelector(selector);
  const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

  /** Escapa texto para insertarlo en HTML sin riesgo (nombres de jugador, etc.). */
  const escapar = (texto) => String(texto ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  /** Lectura/escritura segura de localStorage (puede estar bloqueado en modo privado). */
  const almacen = {
    leer(clave) { try { return localStorage.getItem(clave); } catch { return null; } },
    escribir(clave, valor) { try { localStorage.setItem(clave, valor); } catch { /* sin almacenamiento */ } },
    borrar(clave) { try { localStorage.removeItem(clave); } catch { /* sin almacenamiento */ } }
  };

  /** Segundos → "1 h 05 min 09 s" / "05:09". */
  function formatearTiempo(segundos, largo = false) {
    const s = Math.floor(segundos % 60);
    const m = Math.floor((segundos / 60) % 60);
    const h = Math.floor(segundos / 3600);
    const dos = (n) => String(n).padStart(2, "0");
    if (largo) return `${h ? h + " h " : ""}${dos(m)} min ${dos(s)} s`;
    return h ? `${h}:${dos(m)}:${dos(s)}` : `${dos(m)}:${dos(s)}`;
  }

  /** Mezcla un array (Fisher–Yates) sin modificar el original. */
  function mezclar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  const capActual = () => HISTORIA.capitulos[E.capitulo];
  /** Personajes jugables de un capítulo (cada uno con su propia historia). */
  const rutasDe = (cap) => cap.rutas || [{ id: cap.protagonista, protagonista: cap.protagonista, pasos: cap.pasos }];
  const rutaActual = () => rutasDe(capActual())[E.ruta ?? 0];
  const pasosActuales = () => rutaActual().pasos;
  const protagonista = () => rutaActual().protagonista;
  const nombreDe = (id) => (PERSONAJES[id] ? PERSONAJES[id].nombre : id);
  /** Un paso o línea con condición ("si" / "siNo") solo aparece según tus decisiones. */
  const cumple = (x) => (!x.si || Boolean(E.marcas[x.si])) && (!x.siNo || !E.marcas[x.siNo]);

  /** Tiempo total jugado (acumulado + sesión actual), en segundos. */
  const tiempoTotal = () => (E ? E.tiempo + (Date.now() - sesionDesde) / 1000 : 0);

  /** Crea un estado de partida nuevo. */
  function nuevoEstado(nombre, capitulo = 0, modo = "campana") {
    return {
      version: 2,
      id: null,                 // código de guardado en el servidor (ABCD-1234)
      nombre,
      modo,                     // "campana" (RE2 → Requiem) o "suelto" (un solo archivo)
      capitulo,
      ruta: null,               // índice del personaje elegido en el capítulo
      paso: 0,
      salud: SALUD_MAX,
      inventario: { hierba_verde: 2, cinta: 1, municion: 24 },
      documentos: [],
      marcas: {},               // decisiones tomadas (afectan a pasos y diálogos)
      muertes: 0,
      pistas: 0,
      tiempo: 0
    };
  }

  /** Copia serializada del estado (consolidando el tiempo de la sesión). */
  function instantanea() {
    E.tiempo = tiempoTotal();
    sesionDesde = Date.now();
    return JSON.stringify(E);
  }

  /** Comprueba que un estado cargado tiene sentido antes de usarlo. */
  function estadoValido(est) {
    if (!(est && typeof est === "object"
      && Number.isInteger(est.capitulo) && est.capitulo >= 0 && est.capitulo < HISTORIA.capitulos.length
      && Number.isInteger(est.paso) && est.paso >= 0
      && typeof est.salud === "number" && est.inventario && Array.isArray(est.documentos))) return false;
    // Partidas de la versión anterior (sin elección de personaje): se reanuda el capítulo desde el principio.
    if (est.version !== 2) { est.version = 2; est.ruta = null; est.paso = 0; }
    est.marcas = est.marcas || {};
    est.modo = est.modo || "campana";
    const rutas = rutasDe(HISTORIA.capitulos[est.capitulo]);
    if (est.ruta !== null && !(Number.isInteger(est.ruta) && est.ruta >= 0 && est.ruta < rutas.length)) { est.ruta = null; est.paso = 0; }
    if (est.ruta === null) est.paso = 0;
    return true;
  }

  /* ------------------------------------------------------------------
   *  Pantallas, modales y avisos
   * ---------------------------------------------------------------- */

  /** Muestra una pantalla (<section class="pantalla">) y oculta las demás. */
  function mostrarPantalla(id) {
    const antes = document.querySelector(".pantalla.activa");
    document.querySelectorAll(".pantalla").forEach((p) => p.classList.toggle("activa", p.id === id));
    // Cambio de pantalla: corte a negro y la imagen aparece quemando la película.
    if (antes && antes.id !== id) Render3D.Transicion.revelar(id === "pantalla-muerte" ? 1600 : 950);
  }

  function abrirModal(id) {
    const modal = document.getElementById(id);
    modal.hidden = false;
    const enfocable = modal.querySelector("input, button:not(.modal-cerrar)") || modal.querySelector("button");
    if (enfocable) setTimeout(() => enfocable.focus(), 50);
  }

  function cerrarModal(id) {
    document.getElementById(id).hidden = true;
  }

  /** Mensaje flotante breve ("Has obtenido: Hierba verde"). */
  function aviso(texto, tipo = "") {
    const caja = $("#avisos");
    const el = document.createElement("div");
    el.className = `aviso ${tipo}`;
    el.textContent = texto;
    caja.appendChild(el);
    setTimeout(() => el.classList.add("saliendo"), 2600);
    setTimeout(() => el.remove(), 3200);
  }

  /**
   * Vacía la zona central del juego y devuelve el contenedor.
   * La clase lleva el prefijo "paso-" para no chocar con los estilos del
   * propio contenido (.chat, .puzzle, .sala...).
   */
  function limpiarEscena(clase) {
    const cont = $("#escena-contenido");
    cont.className = `escena-contenido paso-${clase || "vacio"}`;
    cont.innerHTML = "";
    cont.scrollTop = 0;
    return cont;
  }

  /** Crea un botón que solo se puede pulsar una vez (evita dobles clics). */
  function botonUnaVez(boton, accion) {
    boton.addEventListener("click", () => {
      boton.disabled = true;
      accion();
    }, { once: true });
  }

  /* ------------------------------------------------------------------
   *  HUD: salud, reloj, capítulo
   * ---------------------------------------------------------------- */
  function estadoSalud(salud) {
    if (salud <= 0) return "muerto";
    if (salud >= 67) return "bien";
    if (salud >= 34) return "precaucion";
    return "peligro";
  }

  const TEXTO_SALUD = { bien: "BIEN", precaucion: "PRECAUCIÓN", peligro: "PELIGRO", muerto: "—" };

  function actualizarHUD() {
    if (!E) return;
    const est = estadoSalud(E.salud);
    Efectos.ECG.setEstado(est);
    const etiqueta = $("#hud-salud-texto");
    etiqueta.textContent = TEXTO_SALUD[est];
    etiqueta.dataset.estado = est;
    // Clases en <body> para la viñeta roja y otros efectos de CSS.
    document.body.classList.toggle("salud-precaucion", est === "precaucion");
    document.body.classList.toggle("salud-peligro", est === "peligro");
    // Latido audible solo en peligro.
    if (est === "peligro") Sonido.latidoOn(700);
    else Sonido.latidoOff();

    const cap = capActual();
    const prota = E.ruta === null ? "" : ` · ${nombreDe(protagonista())}`;
    $("#hud-capitulo").textContent = `Archivo ${ROMANOS[E.capitulo]} · ${cap.juego}${prota}`;
    $("#hud-cintas").textContent = E.inventario.cinta || 0;
    $("#hud-municion").textContent = E.inventario.municion || 0;
  }

  /** Reloj del HUD, actualizado cada segundo. */
  setInterval(() => {
    if (E && $("#pantalla-juego").classList.contains("activa")) {
      $("#hud-tiempo").textContent = formatearTiempo(tiempoTotal());
    }
  }, 1000);

  /** Aplica el tema visual del capítulo (colores, niebla, imagen de fondo). */
  function aplicarTema(cap) {
    const fondo = $("#escena-fondo");
    fondo.className = `escena-fondo ${cap.tema || ""}${cap.fondoImagen ? " con-imagen" : ""}`;
    fondo.style.backgroundImage = cap.fondoImagen ? `url("${cap.fondoImagen}")` : "";
  }

  /* ------------------------------------------------------------------
   *  Salud, daño, objetos y documentos
   * ---------------------------------------------------------------- */

  /**
   * Resta salud con efectos gore. Si llega a 0, el jugador muere.
   * @returns {boolean} true si sigue vivo.
   */
  function herir(cantidad, causaMuerte) {
    if (!E || cantidad <= 0) return true;
    E.salud = Math.max(0, E.salud - cantidad);
    Sonido.golpe();
    Efectos.salpicar(Math.min(1.4, 0.4 + cantidad / 40));
    Efectos.temblor();
    actualizarHUD();
    if (E.salud <= 0) {
      morir(causaMuerte);
      return false;
    }
    return true;
  }

  function curar(cantidad) {
    E.salud = Math.min(SALUD_MAX, E.salud + cantidad);
    Sonido.curar();
    actualizarHUD();
  }

  /** Añade objetos al inventario: { hierba_verde: 1, cinta: 1 } */
  function darObjetos(objetos) {
    for (const [id, cantidad] of Object.entries(objetos)) {
      if (!OBJETOS[id]) continue;
      E.inventario[id] = (E.inventario[id] || 0) + cantidad;
      aviso(`Has obtenido: ${OBJETOS[id].icono} ${OBJETOS[id].nombre}${cantidad > 1 ? ` ×${cantidad}` : ""}`, "objeto");
    }
    actualizarHUD();
  }

  function anadirDocumento(id) {
    if (!DOCUMENTOS[id] || E.documentos.includes(id)) return;
    E.documentos.push(id);
    aviso(`Nuevo archivo: ${DOCUMENTOS[id].titulo}`, "documento");
  }

  /** Muestra un documento con su estilo (papel, informe, email, sangre). */
  function abrirDocumento(id) {
    const doc = DOCUMENTOS[id];
    if (!doc) return;
    const caja = $("#documento-papel");
    caja.className = `documento-papel estilo-${doc.estilo || "papel"}`;
    $("#documento-titulo").textContent = doc.titulo;
    $("#documento-texto").textContent = doc.texto;
    Sonido.tecla();
    abrirModal("modal-documento");
  }

  /**
   * Efectos especiales asociados a mensajes de chat u opciones.
   * Admite cadenas ("sangre", "temblor") u objetos ({dano, susto, objeto, documento}).
   * @returns {boolean} false si el efecto ha matado al jugador.
   */
  function aplicarEfecto(efecto) {
    const ef = typeof efecto === "string" ? { [efecto]: true } : efecto;
    if (ef.sangre) Efectos.salpicar(0.6);
    if (ef.temblor) { Efectos.temblor(); Sonido.grunido(); }
    if (ef.susto) Efectos.susto(ef.susto);
    if (ef.objeto) darObjetos(ef.objeto);
    if (ef.documento) anadirDocumento(ef.documento);
    if (ef.marca) E.marcas[ef.marca] = true;
    if (ef.curar) curar(ef.curar);
    if (ef.dano) return herir(ef.dano, ef.muerte);
    return true;
  }

  /**
   * Acción de un punto examinado en una sala (2D o 3D).
   * accion: {documento} | {objeto, cantidad} | {objetos} | {sangre} | {susto, dano, muerte} | {marca} | {curar}
   * @returns {boolean} false si el jugador ha muerto.
   */
  function aplicarAccion(accion, mio) {
    if (accion.objeto) darObjetos({ [accion.objeto]: accion.cantidad || 1 });
    if (accion.objetos) darObjetos(accion.objetos);
    if (accion.sangre) { Efectos.salpicar(0.5); Sonido.golpe(); }
    if (accion.marca) E.marcas[accion.marca] = true;
    if (accion.curar) curar(accion.curar);
    if (accion.documento) {
      anadirDocumento(accion.documento);
      setTimeout(() => { if (mio === token) abrirDocumento(accion.documento); }, 450);
    }
    if (accion.susto) {
      Efectos.susto(accion.susto);
      if (accion.dano && !herir(accion.dano, accion.muerte)) return false;
    }
    return true;
  }

  /* ------------------------------------------------------------------
   *  Flujo principal: capítulos y pasos
   * ---------------------------------------------------------------- */

  /** Arranca (o reanuda) el capítulo actual mostrando su tarjeta de título. */
  function iniciarCapitulo() {
    const mio = ++token;
    const cap = capActual();
    mostrarPantalla("pantalla-juego");
    aplicarTema(cap);
    Render3D.Transicion.revelar(1300);
    Retratos.setVariantes(cap.variantes);
    actualizarHUD();
    Sonido.ambienteOn(cap.id);
    if (E.paso === 0 || !puntoControl) puntoControl = instantanea();

    const cont = limpiarEscena("tarjeta");
    const cabecera = `
        <p class="tc-numero">Archivo ${ROMANOS[E.capitulo]} de ${ROMANOS[HISTORIA.capitulos.length - 1]}</p>
        <h1 class="tc-juego">${escapar(cap.juego)}</h1>
        <h2 class="tc-titulo">${escapar(cap.titulo)}</h2>
        <p class="tc-lugar">${escapar(cap.lugar)}<br><span>${escapar(cap.anio)}</span></p>`;
    Sonido.campana();

    // Personaje ya elegido (partida reanudada): botón de continuar.
    if (E.ruta !== null) {
      const ruta = rutaActual();
      cont.innerHTML = `
        <div class="tarjeta-capitulo">${cabecera}
          <div class="tc-prota">
            <img src="${Retratos.de(ruta.protagonista)}" alt="">
            <span>Juegas como<br><strong>${escapar(nombreDe(ruta.protagonista))}</strong>${ruta.titulo ? `<br><em>${escapar(ruta.titulo)}</em>` : ""}</span>
          </div>
          <button class="btn btn-principal" type="button">${E.paso === 0 ? "Entrar" : "Continuar"} ▸</button>
        </div>`;
      botonUnaVez($("button", cont), () => { if (mio === token) ejecutarPaso(); });
      return;
    }

    // Elección de personaje: cada uno vive su propia versión de los hechos.
    const rutas = rutasDe(cap);
    cont.innerHTML = `
      <div class="tarjeta-capitulo">${cabecera}
        <p class="tc-elige">Elige con quién vivir esta pesadilla</p>
        <div class="tc-rutas">${rutas.map((r, i) => `
          <button class="tc-ruta" type="button" data-i="${i}" style="--ruta-color:${(PERSONAJES[r.protagonista] || {}).color || "#c1121f"}">
            <img src="${Retratos.de(r.protagonista)}" alt="">
            <strong>${escapar(nombreDe(r.protagonista))}</strong>
            ${r.titulo ? `<span class="tc-ruta-titulo">${escapar(r.titulo)}</span>` : ""}
            ${r.resumen ? `<span class="tc-ruta-resumen">${escapar(r.resumen)}</span>` : ""}
          </button>`).join("")}
        </div>
      </div>`;
    cont.querySelectorAll(".tc-ruta").forEach((b) => b.addEventListener("click", () => {
      if (mio !== token) return;
      E.ruta = Number(b.dataset.i);
      E.paso = 0;
      Sonido.golpe();
      Efectos.salpicar(0.3);
      puntoControl = instantanea();
      actualizarHUD();
      ejecutarPaso();
    }, { once: true }));
  }

  /** Ejecuta el paso actual del capítulo según su tipo. */
  function ejecutarPaso() {
    const mio = ++token;
    const pasos = pasosActuales();
    // Se saltan los pasos que dependen de decisiones que no has tomado.
    while (E.paso < pasos.length && !cumple(pasos[E.paso])) E.paso++;
    if (E.paso >= pasos.length) {
      finCapitulo();
      return;
    }
    const paso = pasos[E.paso];
    const renderizar = PASOS[paso.tipo];
    if (!renderizar) {
      console.warn("Tipo de paso desconocido:", paso.tipo);
      avanzar();
      return;
    }
    // Entrar en una sala: la pantalla se cubre de sangre, se monta la sala y se descubre.
    if (paso.tipo === "explorar" && Render3D.Transicion.activas()) {
      Render3D.Transicion.cubrir(300).then(() => {
        if (mio === token) renderizar(paso, mio);
        Render3D.Transicion.descubrir(950);
      });
      return;
    }
    renderizar(paso, mio);
  }

  /** Pasa al siguiente paso. */
  function avanzar() {
    E.paso++;
    ejecutarPaso();
  }

  /** Escribe un texto letra a letra (efecto máquina de escribir). */
  async function escribir(elemento, texto, saltar, mio, velocidad = 20, conSonido = velocidad === 20) {
    for (let i = 1; i <= texto.length; i++) {
      if (mio !== token) return;
      if (saltar()) { elemento.textContent = texto; return; }
      elemento.textContent = texto.slice(0, i);
      if (conSonido && i % 3 === 0) Sonido.tecla();
      await esperar(velocidad);
    }
  }

  /* ------------------------------------------------------------------
   *  RENDERIZADORES DE CADA TIPO DE PASO
   * ---------------------------------------------------------------- */
  const PASOS = {

    /* ── NARRACIÓN: líneas que se escriben solas ── */
    async narracion(paso, mio) {
      const cont = limpiarEscena("narracion");
      cont.innerHTML = `
        <div class="narracion caja-texto" tabindex="0" aria-live="polite">
          <div class="narracion-lineas"></div>
          <p class="narracion-ayuda">Toca el texto para saltar</p>
          <button class="btn btn-principal oculto" type="button">Continuar ▸</button>
        </div>`;
      const caja = $(".narracion", cont);
      const lineas = $(".narracion-lineas", cont);
      const boton = $("button", cont);
      let saltar = false;
      caja.addEventListener("click", (e) => { if (e.target !== boton) saltar = true; });

      for (const texto of paso.lineas) {
        const p = document.createElement("p");
        lineas.appendChild(p);
        await escribir(p, texto, () => saltar, mio);
        if (mio !== token) return;
        await esperar(saltar ? 0 : 380);
      }
      if (paso.dar) darObjetos(paso.dar);
      $(".narracion-ayuda", cont).remove();
      boton.classList.remove("oculto");
      boton.focus();
      botonUnaVez(boton, avanzar);
    },

    /* ── EXPLORAR: sala 2D con el escenario real y el personaje recorriéndola (motor2d.js) ── */
    explorar(paso, mio) {
      const cont = limpiarEscena("explorar");
      // NPC, puntos y enemigos también pueden depender de tus decisiones.
      const sala = {
        ...paso,
        npcs: (paso.npcs || []).filter(cumple),
        puntos: (paso.puntos || []).filter(cumple),
        enemigos: (paso.enemigos || []).filter(cumple)
      };
      Motor2D.crear(cont, sala, {
        protagonista: protagonista(),
        imagen: (id) => Retratos.de(id),
        cuerpo: (id) => Retratos.cuerpo(id),
        personaje: (id) => PERSONAJES[id],
        fondo: capActual().fondoImagen,
        tema: capActual().tema,
        reducir: opciones.reducir,
        salud: () => (E ? E.salud / SALUD_MAX : 1),
        activo: () => mio === token && E && E.salud > 0,
        pausado: () => Boolean(document.querySelector(".modal:not([hidden])")),
        examinar: (punto) => aplicarAccion(punto.accion || {}, mio),
        herir: (dano, causa) => herir(dano, causa),
        municion: () => E.inventario.municion || 0,
        gastarMunicion: () => {
          if (!((E.inventario.municion || 0) > 0)) return false;
          E.inventario.municion--;
          $("#hud-municion").textContent = E.inventario.municion;
          return true;
        },
        salir: () => { if (mio === token) avanzar(); }
      });
    },

    /* ── RADIO: los personajes hablan en inglés (voz) con subtítulos en español ── */
    async chat(paso, mio) {
      const cont = limpiarEscena("radio");
      const prota = protagonista();
      const frecuencia = (137 + (paso.titulo.length * 7.3) % 20).toFixed(2);
      cont.innerHTML = `
        <div class="radio">
          <div class="radio-aparato">
            <div class="radio-antena" aria-hidden="true"></div>
            <div class="radio-pantalla">
              <span class="radio-freq">${frecuencia} MHz</span>
              <span class="radio-canal">${escapar(paso.titulo)}</span>
              <span class="radio-led" aria-hidden="true"></span>
            </div>
            <div class="radio-rejilla" aria-hidden="true">${"<i></i>".repeat(14)}</div>
          </div>
          <div class="radio-interlocutor" aria-live="polite">
            <img class="radio-retrato" src="" alt="">
            <div class="radio-bocadillo">
              <strong class="radio-nombre"></strong>
              <p class="radio-subtitulo">Sintonizando…</p>
            </div>
          </div>
          <p class="radio-ayuda">Toca para pasar a la siguiente frase</p>
          <ol class="radio-registro" aria-label="Transcripción"></ol>
          <div class="radio-opciones"></div>
        </div>`;
      const caja = $(".radio", cont);
      const retrato = $(".radio-retrato", cont);
      const nombre = $(".radio-nombre", cont);
      const subtitulo = $(".radio-subtitulo", cont);
      const registro = $(".radio-registro", cont);
      const zonaOpciones = $(".radio-opciones", cont);
      let saltar = false;
      $(".radio-interlocutor", cont).addEventListener("click", () => { saltar = true; });

      Sonido.radioEstatica(true);
      Sonido.radioClic();
      const fin = () => { Sonido.radioEstatica(false); };

      function anotar(de, texto, sistema) {
        const li = document.createElement("li");
        li.className = sistema ? "sistema" : de === prota ? "propio" : "";
        li.innerHTML = sistema ? escapar(texto) : `<b style="color:${(PERSONAJES[de] || {}).color || "#ccc"}">${escapar(nombreDe(de))}:</b> ${escapar(texto)}`;
        registro.prepend(li);
      }

      /** Una frase: retrato y subtítulo escribiéndose. */
      async function decir(linea) {
        saltar = false;
        if (linea.sistema) {
          caja.classList.remove("hablando");
          retrato.src = "";
          retrato.hidden = true;
          nombre.textContent = "";
          subtitulo.textContent = `— ${linea.sistema} —`;
          subtitulo.classList.add("sistema");
          Sonido.radioClic(true);
          anotar(null, linea.sistema, true);
          if (linea.efecto && !aplicarEfecto(linea.efecto)) return false;
          await esperar(1400);
          return mio === token;
        }
        const p = PERSONAJES[linea.de] || {};
        retrato.hidden = false;
        retrato.src = Retratos.de(linea.de);
        nombre.textContent = nombreDe(linea.de);
        nombre.style.color = p.color || "#ccc";
        subtitulo.classList.remove("sistema");
        subtitulo.textContent = "";
        caja.classList.add("hablando");
        caja.classList.toggle("propio", linea.de === prota);
        Sonido.radioClic();
        await escribir(subtitulo, linea.t, () => saltar, mio, 24);
        if (mio !== token) return false;
        if (!saltar) await esperar(Math.min(2600, 500 + linea.t.length * 28));
        subtitulo.textContent = linea.t;
        caja.classList.remove("hablando");
        Sonido.radioClic(true);
        anotar(linea.de, linea.t);
        if (linea.efecto && !aplicarEfecto(linea.efecto)) return false;
        await esperar(saltar ? 120 : 380);
        return mio === token;
      }

      function elegir(opciones) {
        return new Promise((resolver) => {
          zonaOpciones.innerHTML = "";
          opciones.forEach((opcion) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "radio-opcion";
            b.textContent = opcion.t;
            b.addEventListener("click", () => { zonaOpciones.innerHTML = ""; resolver(opcion); });
            zonaOpciones.appendChild(b);
          });
          zonaOpciones.querySelector("button")?.focus();
        });
      }

      for (const linea of paso.guion) {
        if (mio !== token) return fin();
        if (!cumple(linea)) continue;
        if (linea.opciones) {
          caja.classList.add("eligiendo");
          const elegida = await elegir(linea.opciones.filter(cumple));
          caja.classList.remove("eligiendo");
          if (mio !== token) return fin();
          if (!(await decir({ de: prota, t: elegida.t }))) return fin();
          if (elegida.marca) E.marcas[elegida.marca] = true;
          if (elegida.efecto && !aplicarEfecto(elegida.efecto)) return fin();
          for (const respuesta of elegida.resp || []) {
            if (!cumple(respuesta)) continue;
            if (!(await decir(respuesta))) return fin();
          }
        } else if (!(await decir(linea))) {
          return fin();
        }
      }

      fin();
      Sonido.radioClic(true);
      subtitulo.textContent = "— Fin de la transmisión —";
      subtitulo.classList.add("sistema");
      zonaOpciones.innerHTML = `<button class="btn btn-principal" type="button">Cortar la radio ▸</button>`;
      botonUnaVez($("button", zonaOpciones), avanzar);
    },

    /* ── ENCUENTRO: QTE contra un monstruo (machacar botón o esquivar) ── */
    encuentro(paso, mio) {
      const cont = limpiarEscena("encuentro");
      const enemigo = PERSONAJES[paso.enemigo] || { nombre: "???" };
      cont.innerHTML = `
        <div class="encuentro">
          <div class="enemigo-marco"><img class="enemigo-retrato" src="${Retratos.de(paso.enemigo)}" alt=""></div>
          <h2 class="enemigo-nombre">${escapar(enemigo.nombre)}</h2>
          <p class="encuentro-texto">${escapar(paso.texto)}</p>
          <div class="qte">
            <p class="qte-ayuda">${paso.modo === "machaca"
              ? `Pulsa el botón <strong>${paso.veces}</strong> veces en <strong>${paso.tiempo} s</strong> (o la barra espaciadora).`
              : `Pulsa <strong>ESQUIVAR</strong> cuando el marcador esté en la zona roja. <strong>${paso.rondas}</strong> ataques.`}</p>
            <button class="btn btn-peligro" type="button">¡Enfrentarse!</button>
          </div>
        </div>`;
      Sonido.grunido();
      Efectos.temblor();
      const qte = $(".qte", cont);

      botonUnaVez($("button", qte), async () => {
        let vivo = true;
        let limpio = true;
        if (paso.modo === "machaca") {
          const ok = await qteMachacar(paso, qte, mio);
          if (mio !== token) return;
          if (!ok) { limpio = false; vivo = herir(paso.dano, paso.muerte); }
        } else {
          const fallos = await qteEsquivar(paso, qte, mio);
          if (mio !== token) return;
          limpio = fallos === 0;
          vivo = E.salud > 0;
        }
        if (!vivo || mio !== token) return;
        if (limpio) Sonido.exito();
        qte.innerHTML = `
          <p class="encuentro-resultado ${limpio ? "bien" : "mal"}">${escapar(limpio ? paso.exito : paso.fallo)}</p>
          <button class="btn btn-principal" type="button">Continuar ▸</button>`;
        botonUnaVez($("button", qte), avanzar);
      });
    },

    /* ── PUZZLE: se valida en el servidor Java ── */
    puzzle(paso, mio) {
      const cont = limpiarEscena("puzzle");
      cont.innerHTML = `
        <div class="puzzle caja-texto">
          <h2>${escapar(paso.titulo)}</h2>
          <p class="puzzle-enunciado">${escapar(paso.enunciado)}</p>
          ${paso.tiempoLimite ? `<div class="barra barra-tiempo puzzle-tiempo"><div class="relleno"></div><span class="barra-texto"></span></div>` : ""}
          <div class="puzzle-ui"></div>
          <p class="puzzle-mensaje" aria-live="polite"></p>
          <div class="puzzle-acciones">
            <button class="btn btn-secundario" type="button" data-accion="archivos">📁 Archivos</button>
            <button class="btn btn-secundario" type="button" data-accion="pista">💡 Pista (+60 s)</button>
          </div>
          <p class="puzzle-pista oculto"></p>
        </div>`;
      const ui = $(".puzzle-ui", cont);
      const mensaje = $(".puzzle-mensaje", cont);
      let resuelto = false;
      let comprobando = false;
      let reloj = null;

      $('[data-accion="archivos"]', cont).addEventListener("click", abrirArchivos);
      $('[data-accion="pista"]', cont).addEventListener("click", (e) => {
        const pista = $(".puzzle-pista", cont);
        if (!pista.classList.contains("oculto")) return;
        E.pistas++;
        E.tiempo += 60; // Penalización de un minuto
        pista.textContent = `💡 ${paso.pista}`;
        pista.classList.remove("oculto");
        e.currentTarget.disabled = true;
        aviso("Pista usada: +60 segundos", "aviso-pista");
      });

      /** Envía la respuesta al servidor y reacciona al resultado. */
      async function comprobar(respuesta) {
        if (comprobando || resuelto) return;
        comprobando = true;
        mensaje.className = "puzzle-mensaje";
        mensaje.textContent = "Comprobando…";
        try {
          const r = await Api.verificar(paso.id, respuesta);
          if (mio !== token) return;
          mensaje.textContent = r.mensaje;
          if (r.correcto) {
            resuelto = true;
            cancelAnimationFrame(reloj);
            mensaje.classList.add("bien");
            Sonido.exito();
            ui.classList.add("resuelto");
            const boton = document.createElement("button");
            boton.className = "btn btn-principal";
            boton.type = "button";
            boton.textContent = "Continuar ▸";
            mensaje.after(boton);
            botonUnaVez(boton, avanzar);
            boton.focus();
          } else {
            mensaje.classList.add("mal");
            Sonido.error();
            Efectos.temblor();
            controles.reiniciar();
            if (paso.danoFallo && !herir(paso.danoFallo, paso.muerte)) return;
          }
        } catch (err) {
          mensaje.classList.add("mal");
          mensaje.textContent = err.message;
          controles.reiniciar();
        } finally {
          comprobando = false;
        }
      }

      const controles = { orden: uiOrden, codigo: uiCodigo, texto: uiTexto }[paso.ui](paso, ui, comprobar);

      // Cuenta atrás opcional (bomba de RE6). Si llega a cero, daño y se reinicia.
      if (paso.tiempoLimite) {
        const barra = $(".puzzle-tiempo .relleno", cont);
        const textoBarra = $(".puzzle-tiempo .barra-texto", cont);
        let inicio = performance.now();
        const tic = (ahora) => {
          if (mio !== token || resuelto) return;
          const restante = paso.tiempoLimite - (ahora - inicio) / 1000;
          barra.style.width = `${Math.max(0, restante / paso.tiempoLimite) * 100}%`;
          textoBarra.textContent = formatearTiempo(Math.max(0, Math.ceil(restante)));
          if (restante <= 0) {
            mensaje.className = "puzzle-mensaje mal";
            mensaje.textContent = "¡BOOM! La onda expansiva te lanza contra la pared. El temporizador se reinicia...";
            if (!herir(paso.danoTiempo || 25, paso.muerte)) return;
            inicio = performance.now();
          }
          reloj = requestAnimationFrame(tic);
        };
        reloj = requestAnimationFrame(tic);
      }
    },

    /* ── MÁQUINA DE ESCRIBIR: guardar partida con una cinta de tinta ── */
    maquina(paso, mio) {
      const cont = limpiarEscena("maquina");
      Sonido.salaSegura(true);
      cont.innerHTML = `
        <div class="maquina caja-texto">
          <svg class="maquina-dibujo" viewBox="0 0 120 70" aria-hidden="true">
            <rect x="22" y="6" width="76" height="20" rx="3" fill="#e8e0d0"/>
            <rect x="10" y="22" width="100" height="10" rx="4" fill="#2a2a2a"/>
            <path d="M8 34 h104 l8 30 h-120 z" fill="#1a1a1a" stroke="#444"/>
            ${Array.from({ length: 30 }, (_, i) => `<circle cx="${20 + (i % 10) * 9 + Math.floor(i / 10) * 3}" cy="${42 + Math.floor(i / 10) * 7}" r="2.6" fill="#cfc6b0"/>`).join("")}
          </svg>
          <h2>Una máquina de escribir</h2>
          <p>Un rincón tranquilo. Por un momento, nada intenta matarte.</p>
          <p>¿Quieres registrar tu progreso? <strong>Cintas de tinta: <span class="maquina-cintas">${E.inventario.cinta || 0}</span></strong></p>
          <div class="maquina-acciones">
            <button class="btn btn-principal" type="button" data-accion="guardar">🎞️ Guardar partida</button>
            <button class="btn btn-secundario" type="button" data-accion="seguir">Seguir sin guardar</button>
          </div>
          <p class="maquina-resultado" aria-live="polite"></p>
        </div>`;
      const resultado = $(".maquina-resultado", cont);
      const acciones = $(".maquina-acciones", cont);

      const salir = (accion) => { Sonido.salaSegura(false); accion(); };

      $('[data-accion="seguir"]', cont).addEventListener("click", () => salir(avanzar), { once: true });
      // Sin {once:true}: si no hay cintas, el botón debe seguir respondiendo.
      $('[data-accion="guardar"]', cont).addEventListener("click", async (e) => {
        if (e.currentTarget.disabled) return;
        if ((E.inventario.cinta || 0) < 1) {
          resultado.textContent = "No tienes cintas de tinta. Búscalas en las salas.";
          Sonido.error();
          return;
        }
        e.currentTarget.disabled = true;
        E.inventario.cinta--;
        E.paso++; // Al cargar, se reanuda DESPUÉS de la máquina de escribir.
        const datos = instantanea();
        ultimoGuardado = datos;
        almacen.escribir(CLAVE_PARTIDA, datos);
        actualizarHUD();
        resultado.textContent = "Guardando…";
        for (let i = 0; i < 6; i++) { Sonido.tecla(); await esperar(70); }
        try {
          const r = await Api.guardar(E.id, datos);
          E.id = r.id;
          ultimoGuardado = JSON.stringify(E);
          almacen.escribir(CLAVE_PARTIDA, ultimoGuardado);
          resultado.innerHTML = `Partida guardada. Tu código de partida es <strong class="codigo-partida">${escapar(r.id)}</strong>.<br>Apúntalo para continuar en otro dispositivo.`;
        } catch (err) {
          resultado.textContent = `Guardado solo en este navegador (${err.message}).`;
        }
        if (mio !== token) return;
        acciones.innerHTML = `<button class="btn btn-principal" type="button">Continuar ▸</button>`;
        botonUnaVez($("button", acciones), () => salir(ejecutarPaso));
      });
    },

    /* ── SUSTO: jump scare con posible daño ── */
    async susto(paso, mio) {
      const cont = limpiarEscena("susto-paso");
      cont.innerHTML = `<div class="caja-texto susto-texto"><p>Silencio. Demasiado silencio...</p></div>`;
      await esperar(1400);
      if (mio !== token) return;
      Efectos.susto(paso.enemigo);
      $(".susto-texto p", cont).textContent = paso.texto;
      if (paso.dano && !herir(paso.dano, paso.muerte)) return;
      await esperar(1000);
      if (mio !== token) return;
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "btn btn-principal";
      boton.textContent = "Huir ▸";
      $(".susto-texto", cont).appendChild(boton);
      botonUnaVez(boton, avanzar);
    }
  };

  /* ------------------------------------------------------------------
   *  QTE (eventos de pulsación rápida)
   * ---------------------------------------------------------------- */

  /** Machacar botón: N pulsaciones antes de que se acabe el tiempo. */
  function qteMachacar(paso, qte, mio) {
    return new Promise((resolver) => {
      qte.innerHTML = `
        <div class="barra barra-fuerza"><div class="relleno"></div></div>
        <div class="barra barra-tiempo"><div class="relleno"></div></div>
        <button class="btn-qte" type="button">${escapar(paso.boton || "¡FORCEJEA!")}</button>`;
      const fuerza = $(".barra-fuerza .relleno", qte);
      const tiempo = $(".barra-tiempo .relleno", qte);
      const boton = $(".btn-qte", qte);
      const total = paso.veces;
      const duracion = paso.tiempo * 1000;
      const inicio = performance.now();
      let cuenta = 0;
      let terminado = false;

      function terminar(ok) {
        if (terminado) return;
        terminado = true;
        document.removeEventListener("keydown", tecla);
        boton.disabled = true;
        resolver(ok);
      }

      function pulsar() {
        if (terminado) return;
        cuenta++;
        fuerza.style.width = `${Math.min(100, (cuenta / total) * 100)}%`;
        boton.classList.remove("golpe");
        void boton.offsetWidth;
        boton.classList.add("golpe");
        Sonido.golpeSeco();
        if (navigator.vibrate) navigator.vibrate(15);
        if (cuenta >= total) terminar(true);
      }

      function tecla(e) {
        if ((e.code === "Space" || e.code === "Enter") && !e.repeat) {
          e.preventDefault();
          pulsar();
        }
      }

      // pointerdown responde mejor que click en móviles (sin retardo).
      boton.addEventListener("pointerdown", (e) => { e.preventDefault(); pulsar(); });
      document.addEventListener("keydown", tecla);
      boton.focus();

      (function tic(ahora) {
        if (terminado) return;
        if (mio !== token) { terminar(false); return; }
        const restante = 1 - (ahora - inicio) / duracion;
        tiempo.style.width = `${Math.max(0, restante) * 100}%`;
        if (restante <= 0) terminar(false);
        else requestAnimationFrame(tic);
      })(inicio);
    });
  }

  /** Esquivar: pulsar cuando el marcador cruza la zona. Devuelve nº de fallos. */
  function qteEsquivar(paso, qte, mio) {
    return new Promise((resolver) => {
      qte.innerHTML = `
        <p class="qte-ronda"></p>
        <div class="esquiva-pista"><div class="esquiva-zona"></div><div class="esquiva-marcador"></div></div>
        <button class="btn-qte" type="button">¡ESQUIVAR!</button>`;
      const textoRonda = $(".qte-ronda", qte);
      const zona = $(".esquiva-zona", qte);
      const marcador = $(".esquiva-marcador", qte);
      const boton = $(".btn-qte", qte);
      const anchoZona = paso.zona || 20;
      const velocidad = paso.velocidad || 1;
      let ronda = 0;
      let fallos = 0;
      let inicioZona = 0;
      let posicion = 0;
      let inicioRonda = 0;
      let esperandoPulsacion = false;
      let animacion = null;

      function nuevaRonda() {
        if (mio !== token || E.salud <= 0) { terminar(); return; }
        if (ronda >= paso.rondas) { terminar(); return; }
        ronda++;
        textoRonda.textContent = `Ataque ${ronda} de ${paso.rondas}`;
        inicioZona = 12 + Math.random() * (76 - anchoZona);
        zona.style.left = `${inicioZona}%`;
        zona.style.width = `${anchoZona}%`;
        inicioRonda = performance.now();
        esperandoPulsacion = true;
        boton.disabled = false;
        animacion = requestAnimationFrame(mover);
      }

      function mover(ahora) {
        if (!esperandoPulsacion) return;
        if (mio !== token) { terminar(); return; }
        // El marcador va y viene (onda triangular). Con el tiempo acelera.
        const t = ((ahora - inicioRonda) / 1000) * velocidad * (0.9 + ronda * 0.15);
        const fase = t % 2;
        posicion = (fase < 1 ? fase : 2 - fase) * 100;
        marcador.style.left = `${posicion}%`;
        // Si tarda demasiado (3 pasadas), el ataque le alcanza.
        if (t > 3) { resolverRonda(false); return; }
        animacion = requestAnimationFrame(mover);
      }

      function resolverRonda(acierto) {
        esperandoPulsacion = false;
        cancelAnimationFrame(animacion);
        boton.disabled = true;
        if (acierto) {
          Sonido.golpeSeco();
          zona.classList.add("acierto");
          textoRonda.textContent = "¡Esquivado!";
        } else {
          fallos++;
          zona.classList.add("fallo");
          textoRonda.textContent = "¡Te ha alcanzado!";
          if (!herir(paso.dano, paso.muerte)) { terminar(); return; }
        }
        setTimeout(() => {
          zona.classList.remove("acierto", "fallo");
          nuevaRonda();
        }, 900);
      }

      function pulsar() {
        if (!esperandoPulsacion) return;
        resolverRonda(posicion >= inicioZona && posicion <= inicioZona + anchoZona);
      }

      function tecla(e) {
        if ((e.code === "Space" || e.code === "Enter") && !e.repeat) {
          e.preventDefault();
          pulsar();
        }
      }

      let terminado = false;
      function terminar() {
        if (terminado) return;
        terminado = true;
        esperandoPulsacion = false;
        cancelAnimationFrame(animacion);
        document.removeEventListener("keydown", tecla);
        resolver(fallos);
      }

      boton.addEventListener("pointerdown", (e) => { e.preventDefault(); pulsar(); });
      document.addEventListener("keydown", tecla);
      boton.focus();
      setTimeout(nuevaRonda, 500);
    });
  }

  /* ------------------------------------------------------------------
   *  Interfaces de puzzle
   *  Cada una recibe (paso, contenedor, enviar) y devuelve {reiniciar}.
   * ---------------------------------------------------------------- */

  /** Ordenar fichas (medallones, cables, blasones). */
  function uiOrden(paso, el, enviar) {
    const seleccion = [];
    const opcionesMezcladas = mezclar(paso.opciones);
    el.innerHTML = `
      <div class="orden-huecos">${Array.from({ length: paso.huecos }, (_, i) => `<button class="hueco" type="button" data-i="${i}" aria-label="Hueco ${i + 1}"><span>${i + 1}</span></button>`).join("")}</div>
      <div class="orden-fichas">${opcionesMezcladas.map((o) => `
        <button class="ficha" type="button" data-id="${escapar(o.id)}" ${o.color ? `style="--ficha-color:${o.color}"` : ""}>
          ${o.icono ? `<span class="ficha-icono">${o.icono}</span>` : ""}${o.color ? `<span class="ficha-cable"></span>` : ""}
          <span>${escapar(o.t)}</span>
        </button>`).join("")}</div>
      <p class="orden-ayuda">Pulsa las fichas en orden. Pulsa un hueco para quitar su ficha.</p>`;

    const huecos = [...el.querySelectorAll(".hueco")];
    const fichas = [...el.querySelectorAll(".ficha")];
    const porId = Object.fromEntries(paso.opciones.map((o) => [o.id, o]));

    function pintar() {
      huecos.forEach((h, i) => {
        const id = seleccion[i];
        const o = id && porId[id];
        h.classList.toggle("lleno", Boolean(o));
        h.innerHTML = o
          ? `${o.icono ? `<span class="ficha-icono">${o.icono}</span>` : ""}<span style="${o.color ? `color:${o.color}` : ""}">${escapar(o.t)}</span>`
          : `<span>${i + 1}</span>`;
      });
      fichas.forEach((f) => { f.disabled = seleccion.includes(f.dataset.id); });
    }

    fichas.forEach((f) => f.addEventListener("click", () => {
      if (seleccion.length >= paso.huecos || seleccion.includes(f.dataset.id)) return;
      seleccion.push(f.dataset.id);
      Sonido.golpeSeco();
      pintar();
      if (seleccion.length === paso.huecos) enviar(seleccion.join(","));
    }));
    huecos.forEach((h, i) => h.addEventListener("click", () => {
      if (i < seleccion.length) { seleccion.splice(i, 1); pintar(); }
    }));

    return { reiniciar() { setTimeout(() => { seleccion.length = 0; pintar(); }, 700); } };
  }

  /** Teclado numérico (candados y paneles). */
  function uiCodigo(paso, el, enviar) {
    let codigo = "";
    el.innerHTML = `
      <div class="teclado">
        <div class="teclado-pantalla" aria-live="polite"></div>
        <div class="teclado-teclas">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-t="${n}">${n}</button>`).join("")}
          <button type="button" data-t="borrar" aria-label="Borrar">⌫</button>
          <button type="button" data-t="0">0</button>
          <button type="button" data-t="ok" class="ok" aria-label="Confirmar">✓</button>
        </div>
      </div>`;
    const pantalla = $(".teclado-pantalla", el);

    const pintar = () => {
      pantalla.textContent = codigo.padEnd(paso.digitos, "_").split("").join(" ");
    };

    function pulsar(t) {
      if (t === "borrar") codigo = codigo.slice(0, -1);
      else if (t === "ok") { if (codigo.length === paso.digitos) enviar(codigo); }
      else if (codigo.length < paso.digitos) codigo += t;
      Sonido.tecla();
      pintar();
    }

    el.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => pulsar(b.dataset.t)));

    // Teclado físico: números, retroceso e Intro (solo mientras este puzzle esté en pantalla).
    const tecla = (e) => {
      if (!document.body.contains(el)) { document.removeEventListener("keydown", tecla); return; }
      if (document.querySelector(".modal:not([hidden])")) return;
      if (/^[0-9]$/.test(e.key)) pulsar(e.key);
      else if (e.key === "Backspace") pulsar("borrar");
      else if (e.key === "Enter") pulsar("ok");
    };
    document.addEventListener("keydown", tecla);
    pintar();

    return { reiniciar() { setTimeout(() => { codigo = ""; pintar(); }, 700); } };
  }

  /** Campo de texto libre (contraseñas y palabras). */
  function uiTexto(paso, el, enviar) {
    el.innerHTML = `
      <form class="texto-form" autocomplete="off">
        <input type="text" maxlength="40" placeholder="${escapar(paso.placeholder || "Respuesta")}" aria-label="Respuesta" autocapitalize="characters" spellcheck="false">
        <button class="btn btn-principal" type="submit">Probar</button>
      </form>`;
    const form = $("form", el);
    const input = $("input", el);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value.trim()) enviar(input.value.trim());
    });
    setTimeout(() => input.focus(), 100);
    return { reiniciar() { input.select(); } };
  }

  /* ------------------------------------------------------------------
   *  Fin de capítulo, muerte y final
   * ---------------------------------------------------------------- */
  function finCapitulo() {
    const mio = ++token;
    const cap = capActual();
    const suelto = E.modo === "suelto";
    const ultimo = E.capitulo >= HISTORIA.capitulos.length - 1;
    const otros = rutasDe(cap).filter((_, i) => i !== E.ruta).map((r) => nombreDe(r.protagonista));
    const cont = limpiarEscena("fin-capitulo");
    cont.innerHTML = `
      <div class="fin-capitulo caja-texto">
        <p class="sello">ARCHIVO ${ROMANOS[E.capitulo]} · COMPLETADO</p>
        <h2>${escapar(cap.juego)}</h2>
        <p class="fin-prota">Superviviente: <strong>${escapar(nombreDe(protagonista()))}</strong></p>
        <ul class="estadisticas">
          <li><span>Tiempo total</span><strong>${formatearTiempo(tiempoTotal(), true)}</strong></li>
          <li><span>Muertes</span><strong>${E.muertes}</strong></li>
          <li><span>Archivos encontrados</span><strong>${E.documentos.length}</strong></li>
        </ul>
        ${otros.length ? `<p class="modal-nota">Esta historia también puede vivirse como ${escapar(otros.join(", ").replace(/, ([^,]*)$/, " o $1"))}. Pruébalo desde «Elegir archivo» en el menú principal.</p>` : ""}
        <button class="btn btn-principal" type="button">${suelto ? "Volver al título" : ultimo ? "Ver el final" : "Abrir el siguiente archivo"} ▸</button>
      </div>`;
    Sonido.exito();
    botonUnaVez($("button", cont), () => {
      if (mio !== token) return;
      if (suelto) { almacen.borrar(CLAVE_PARTIDA); E = null; ultimoGuardado = null; volverAlTitulo(); return; }
      if (ultimo) { pantallaFinal(); return; }
      E.capitulo++;
      E.paso = 0;
      E.ruta = null;
      E.salud = Math.min(SALUD_MAX, E.salud + 30); // Un respiro entre capítulos
      E.inventario.municion = (E.inventario.municion || 0) + 18;
      puntoControl = null;
      // Autoguardado local al cambiar de capítulo.
      ultimoGuardado = instantanea();
      almacen.escribir(CLAVE_PARTIDA, ultimoGuardado);
      Efectos.limpiar();
      iniciarCapitulo();
    });
  }

  /** Muerte del jugador: pantalla gore de "HAS MUERTO". */
  function morir(causa) {
    token++; // Detiene cualquier tarea en curso
    E.muertes++;
    E.salud = 0;
    actualizarHUD();
    Sonido.latidoOff();
    Sonido.tension(false);
    Sonido.radioEstatica(false);
    Sonido.muerte();
    Efectos.salpicar(1.6, true);
    $("#muerte-causa").textContent = causa || "Tu cuerpo se une a los miles de cadáveres de esta pesadilla.";
    $("#muerte-contador").textContent = `Muertes: ${E.muertes}`;
    $("#btn-cargar-ultimo").hidden = !ultimoGuardado;
    setTimeout(() => mostrarPantalla("pantalla-muerte"), 1100);
  }

  /** Restaura un estado guardado, conservando muertes y tiempo acumulados. */
  function restaurar(json) {
    const muertes = E.muertes;
    const tiempo = tiempoTotal();
    E = JSON.parse(json);
    E.muertes = muertes;
    E.tiempo = tiempo;
    sesionDesde = Date.now();
    Efectos.limpiar();
    iniciarCapitulo();
  }

  /** Pantalla final: epílogo, rango y ranking. */
  async function pantallaFinal() {
    token++;
    const segundos = Math.round(tiempoTotal());
    const rango = E.muertes === 0 && segundos < 3 * 3600 ? "S"
      : E.muertes <= 3 && segundos < 5 * 3600 ? "A"
      : E.muertes <= 8 ? "B" : "C";
    Sonido.ambienteOff();
    Sonido.latidoOff();
    Efectos.limpiar();
    document.body.classList.remove("salud-precaucion", "salud-peligro");
    almacen.borrar(CLAVE_PARTIDA);

    $("#final-nombre").textContent = E.nombre;
    $("#final-rango").textContent = rango;
    $("#final-stats").innerHTML = `
      <li><span>Tiempo</span><strong>${formatearTiempo(segundos, true)}</strong></li>
      <li><span>Muertes</span><strong>${E.muertes}</strong></li>
      <li><span>Pistas usadas</span><strong>${E.pistas}</strong></li>
      <li><span>Archivos</span><strong>${E.documentos.length} / ${Object.keys(DOCUMENTOS).length}</strong></li>`;
    mostrarPantalla("pantalla-final");
    Sonido.campana();

    const lista = $("#final-ranking");
    lista.innerHTML = "<li>Enviando tu expediente a la B.S.A.A.…</li>";
    try {
      const r = await Api.enviarRanking(E.nombre, segundos, E.muertes);
      pintarRanking(lista, r.ranking, E.nombre);
    } catch (err) {
      lista.innerHTML = `<li>${escapar(err.message)}</li>`;
    }
  }

  /** Dibuja una lista de ranking. */
  function pintarRanking(lista, ranking, resaltar) {
    if (!ranking.length) {
      lista.innerHTML = "<li>Aún no hay supervivientes. ¿Serás el primero?</li>";
      return;
    }
    lista.innerHTML = ranking.map((r, i) => `
      <li class="${r.nombre === resaltar ? "yo" : ""}">
        <span class="pos">${i + 1}</span>
        <span class="nom">${escapar(r.nombre)}</span>
        <span class="t">${formatearTiempo(r.segundos)}</span>
        <span class="m">☠ ${r.muertes}</span>
      </li>`).join("");
  }

  /* ------------------------------------------------------------------
   *  Modales del juego: inventario y archivos
   * ---------------------------------------------------------------- */
  function abrirInventario() {
    if (!E) return;
    const lista = $("#inventario-lista");
    const entradas = Object.entries(E.inventario).filter(([, n]) => n > 0);
    $("#inventario-salud").textContent = `Salud: ${Math.round(E.salud)} / ${SALUD_MAX}`;
    lista.innerHTML = entradas.length ? entradas.map(([id, n]) => {
      const o = OBJETOS[id];
      return `
        <li class="objeto">
          <span class="objeto-icono" aria-hidden="true">${o.icono}</span>
          <div class="objeto-info"><strong>${escapar(o.nombre)} <em>×${n}</em></strong><p>${escapar(o.desc)}</p></div>
          ${o.cura ? `<button class="btn btn-secundario" type="button" data-usar="${id}">Usar</button>` : ""}
        </li>`;
    }).join("") : "<li class='vacio'>Tus bolsillos están vacíos.</li>";

    lista.querySelectorAll("[data-usar]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.usar;
      if (E.salud >= SALUD_MAX) { aviso("Ya estás en plena forma.", ""); return; }
      if (E.salud <= 0 || !(E.inventario[id] > 0)) return;
      E.inventario[id]--;
      curar(OBJETOS[id].cura);
      aviso(`Has usado: ${OBJETOS[id].nombre}`, "objeto");
      abrirInventario(); // Repinta la lista
    }));
    abrirModal("modal-inventario");
  }

  function abrirArchivos() {
    if (!E) return;
    const lista = $("#archivos-lista");
    lista.innerHTML = E.documentos.length
      ? E.documentos.map((id) => `<li><button class="archivo" type="button" data-doc="${id}">📄 ${escapar(DOCUMENTOS[id].titulo)}</button></li>`).join("")
      : "<li class='vacio'>Todavía no has encontrado ningún archivo.</li>";
    lista.querySelectorAll("[data-doc]").forEach((b) => b.addEventListener("click", () => abrirDocumento(b.dataset.doc)));
    abrirModal("modal-archivos");
  }

  /* ------------------------------------------------------------------
   *  Arranque de partida: nueva, continuar, cargar código
   * ---------------------------------------------------------------- */
  function empezar(estado) {
    E = estado;
    sesionDesde = Date.now();
    puntoControl = null;
    ultimoGuardado = JSON.stringify(E);
    Efectos.limpiar();
    iniciarCapitulo();
  }

  /** Capítulo elegido en «Elegir archivo» (null = campaña completa). */
  let capituloSuelto = null;

  function nuevaPartida(nombre) {
    const limpio = nombre.trim().slice(0, 20) || "Superviviente";
    empezar(capituloSuelto === null ? nuevoEstado(limpio) : nuevoEstado(limpio, capituloSuelto, "suelto"));
  }

  /** Rejilla con los 8 archivos para jugar uno suelto con cualquier personaje. */
  function abrirSelectorArchivos() {
    const lista = $("#selector-lista");
    lista.innerHTML = HISTORIA.capitulos.map((cap, i) => `
      <li>
        <button class="selector-archivo" type="button" data-cap="${i}">
          <span class="selector-num">${ROMANOS[i]}</span>
          <span class="selector-info">
            <strong>${escapar(cap.juego)}</strong>
            <em>${escapar(cap.titulo)}</em>
            <span class="selector-caras">${rutasDe(cap).map((r) => `<img src="${Retratos.de(r.protagonista)}" alt="" title="${escapar(nombreDe(r.protagonista))}">`).join("")}</span>
          </span>
        </button>
      </li>`).join("");
    lista.querySelectorAll("[data-cap]").forEach((b) => b.addEventListener("click", () => {
      capituloSuelto = Number(b.dataset.cap);
      cerrarModal("modal-selector");
      $("#input-nombre").value = "";
      abrirModal("modal-nombre");
    }));
    abrirModal("modal-selector");
  }

  function continuarLocal() {
    try {
      const est = JSON.parse(almacen.leer(CLAVE_PARTIDA));
      if (!estadoValido(est)) throw new Error("Partida dañada");
      empezar(est);
    } catch {
      aviso("La partida local está dañada. Empieza una nueva.", "aviso-error");
      almacen.borrar(CLAVE_PARTIDA);
      actualizarTitulo();
    }
  }

  async function cargarCodigo(codigo) {
    const mensaje = $("#cargar-mensaje");
    mensaje.textContent = "Buscando en los archivos de Umbrella…";
    try {
      const r = await Api.cargar(codigo.trim().toUpperCase());
      const est = JSON.parse(r.estado);
      if (!estadoValido(est)) throw new Error("La partida guardada está dañada");
      est.id = r.id;
      cerrarModal("modal-cargar");
      empezar(est);
    } catch (err) {
      mensaje.textContent = err.message;
      Sonido.error();
    }
  }

  async function mostrarRanking() {
    const lista = $("#ranking-lista");
    lista.innerHTML = "<li>Consultando…</li>";
    abrirModal("modal-ranking");
    try {
      const r = await Api.ranking();
      pintarRanking(lista, r.ranking);
    } catch (err) {
      lista.innerHTML = `<li>${escapar(err.message)}</li>`;
    }
  }

  /** Muestra u oculta "Continuar" en el título según haya partida local. */
  function actualizarTitulo() {
    $("#btn-continuar").hidden = !almacen.leer(CLAVE_PARTIDA);
  }

  function volverAlTitulo() {
    token++;
    if (E) almacen.escribir(CLAVE_PARTIDA, ultimoGuardado || JSON.stringify(E));
    E = null;
    Sonido.ambienteOff();
    Sonido.latidoOff();
    Sonido.salaSegura(false);
    Sonido.radioEstatica(false);
    Retratos.setVariantes({});
    Efectos.limpiar();
    document.body.classList.remove("salud-precaucion", "salud-peligro");
    document.querySelectorAll(".modal").forEach((m) => { m.hidden = true; });
    Sonido.ambienteOn("titulo");
    actualizarTitulo();
    mostrarPantalla("pantalla-titulo");
  }

  /* ------------------------------------------------------------------
   *  Opciones (sonido y reducir destellos)
   * ---------------------------------------------------------------- */
  function aplicarOpciones() {
    Sonido.setActivo(opciones.sonido);
    Efectos.setReducir(opciones.reducir);
    $("#opt-sonido").checked = opciones.sonido;
    $("#opt-reducir").checked = opciones.reducir;
    $("#hud-sonido").textContent = opciones.sonido ? "🔊" : "🔇";
    Render3D.setConfig({
      calidad: opciones.calidad, escalado: opciones.escalado,
      transiciones: opciones.transiciones, fps: opciones.fps, reducir: opciones.reducir
    });
    $("#opt-calidad").value = opciones.calidad;
    $("#opt-escalado").value = opciones.escalado;
    $("#opt-escalado").disabled = !Render3D.avanzado();
    $("#opt-transiciones").checked = opciones.transiciones;
    $("#opt-fps").checked = opciones.fps;
    $("#opt-graficos-info").textContent = Render3D.hayWebGL
      ? `Salida: ${Math.round(innerWidth * Render3D.dprSalida())}×${Math.round(innerHeight * Render3D.dprSalida())} px · ${Render3D.avanzado() ? "WebGL activo" : "modo 2D clásico"}`
      : "Tu navegador no tiene WebGL: se usa el modo 2D clásico.";
    almacen.escribir(CLAVE_OPCIONES, JSON.stringify(opciones));
  }

  /* ------------------------------------------------------------------
   *  Conexión de todos los botones y teclas
   * ---------------------------------------------------------------- */
  function iniciar() {
    Efectos.iniciar();
    Efectos.ECG.iniciar($("#hud-ecg"));

    try { opciones = { ...opciones, ...JSON.parse(almacen.leer(CLAVE_OPCIONES) || "{}") }; } catch { /* opciones por defecto */ }
    aplicarOpciones();
    Render3D.iniciarTitulo();
    actualizarTitulo();

    // Aviso de contenido +18 (solo la primera vez).
    if (!almacen.leer(CLAVE_AVISO)) abrirModal("modal-aviso");
    $("#btn-aviso-aceptar").addEventListener("click", () => {
      almacen.escribir(CLAVE_AVISO, "1");
      Sonido.iniciar();
      cerrarModal("modal-aviso");
    });

    // El audio se desbloquea con la primera interacción; en el menú suena el tema principal.
    const arrancarAudio = () => {
      Sonido.iniciar();
      if (!E) Sonido.ambienteOn("titulo");
    };
    document.addEventListener("pointerdown", arrancarAudio, { once: true });
    document.addEventListener("keydown", arrancarAudio, { once: true });

    // Pantalla de título
    $("#btn-nueva").addEventListener("click", () => {
      Sonido.iniciar();
      if (almacen.leer(CLAVE_PARTIDA) && !confirm("Ya tienes una partida guardada en este navegador. ¿Empezar una nueva igualmente?")) return;
      capituloSuelto = null;
      $("#input-nombre").value = "";
      abrirModal("modal-nombre");
    });
    $("#btn-elegir").addEventListener("click", () => {
      Sonido.iniciar();
      if (almacen.leer(CLAVE_PARTIDA) && !confirm("Jugar un archivo suelto sustituirá la partida guardada en este navegador. ¿Seguir?")) return;
      abrirSelectorArchivos();
    });
    $("#form-nombre").addEventListener("submit", (e) => {
      e.preventDefault();
      cerrarModal("modal-nombre");
      nuevaPartida($("#input-nombre").value);
    });
    $("#btn-continuar").addEventListener("click", () => { Sonido.iniciar(); continuarLocal(); });
    $("#btn-cargar").addEventListener("click", () => {
      $("#cargar-mensaje").textContent = "";
      $("#input-codigo").value = "";
      abrirModal("modal-cargar");
    });
    $("#form-cargar").addEventListener("submit", (e) => {
      e.preventDefault();
      Sonido.iniciar();
      cargarCodigo($("#input-codigo").value);
    });
    $("#btn-ranking").addEventListener("click", mostrarRanking);
    $("#btn-opciones").addEventListener("click", () => abrirModal("modal-opciones"));

    // Opciones
    $("#opt-sonido").addEventListener("change", (e) => { opciones.sonido = e.target.checked; aplicarOpciones(); });
    $("#opt-reducir").addEventListener("change", (e) => { opciones.reducir = e.target.checked; aplicarOpciones(); });
    $("#opt-calidad").addEventListener("change", (e) => { opciones.calidad = e.target.value; aplicarOpciones(); });
    $("#opt-escalado").addEventListener("change", (e) => { opciones.escalado = e.target.value; aplicarOpciones(); });
    $("#opt-transiciones").addEventListener("change", (e) => { opciones.transiciones = e.target.checked; aplicarOpciones(); });
    $("#opt-fps").addEventListener("change", (e) => { opciones.fps = e.target.checked; aplicarOpciones(); });

    // HUD
    $("#hud-inventario").addEventListener("click", abrirInventario);
    $("#hud-archivos").addEventListener("click", abrirArchivos);
    $("#hud-sonido").addEventListener("click", () => { opciones.sonido = !opciones.sonido; aplicarOpciones(); });
    $("#hud-menu").addEventListener("click", () => abrirModal("modal-menu"));
    $("#btn-menu-titulo").addEventListener("click", volverAlTitulo);
    $("#btn-menu-opciones").addEventListener("click", () => { cerrarModal("modal-menu"); abrirModal("modal-opciones"); });

    // Pantalla de muerte
    $("#btn-cargar-ultimo").addEventListener("click", () => { if (ultimoGuardado) restaurar(ultimoGuardado); });
    $("#btn-reintentar").addEventListener("click", () => restaurar(puntoControl || ultimoGuardado));
    $("#btn-muerte-titulo").addEventListener("click", volverAlTitulo);

    // Pantalla final
    $("#btn-final-titulo").addEventListener("click", () => { E = null; volverAlTitulo(); });

    // Cerrar modales: botón ✕, clic en el fondo oscuro o tecla Escape.
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (modal.id === "modal-aviso") return; // El aviso +18 es obligatorio
        if (e.target === modal || e.target.closest(".modal-cerrar")) modal.hidden = true;
      });
    });

    // Atajos de teclado
    document.addEventListener("keydown", (e) => {
      const escribiendo = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
      if (e.key === "Escape") {
        document.querySelectorAll(".modal:not([hidden]):not(#modal-aviso)").forEach((m) => { m.hidden = true; });
        return;
      }
      if (escribiendo || !E || !$("#pantalla-juego").classList.contains("activa")) return;
      if (e.key.toLowerCase() === "i") abrirInventario();
      if (e.key.toLowerCase() === "r") abrirArchivos();
    });

    // Comprobación del servidor: si no responde, avisamos en el título.
    Api.estado().catch(() => {
      $("#aviso-servidor").hidden = false;
    });
  }

  return { iniciar };
})();

// ¡Que empiece la pesadilla!
document.addEventListener("DOMContentLoaded", Juego.iniciar);
