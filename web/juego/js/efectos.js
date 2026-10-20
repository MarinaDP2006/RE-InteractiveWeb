/* ============================================================================
 *  efectos.js — Efectos visuales: sangre, temblores, destellos, sustos y ECG
 * ============================================================================
 *
 *  - salpicar(): dibuja manchas de sangre procedurales en un <canvas> que
 *    cubre toda la pantalla y luego se desvanecen.
 *  - temblor(): sacude la interfaz (animación CSS "temblor").
 *  - destello(): flash de color a pantalla completa.
 *  - susto(): jump scare con el retrato del monstruo + chirrido.
 *  - ECG: el monitor cardíaco clásico del menú de estado de Resident Evil.
 *
 *  "Reducir destellos" (opciones) suaviza flashes y sacudidas para personas
 *  sensibles a la luz o al movimiento.
 * ========================================================================== */

"use strict";

const Efectos = (() => {
  let lienzo = null;     // <canvas> de sangre
  let ctx = null;        // contexto 2D
  let reducir = false;   // modo "reducir destellos"
  let fundido = null;    // temporizador del desvanecimiento

  /** Prepara el canvas y lo ajusta al tamaño de la ventana. */
  function iniciar() {
    lienzo = document.getElementById("lienzo-sangre");
    ctx = lienzo.getContext("2d");
    ajustar();
    window.addEventListener("resize", ajustar);
  }

  /** Redimensiona el canvas teniendo en cuenta pantallas retina (devicePixelRatio). */
  function ajustar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    lienzo.width = innerWidth * dpr;
    lienzo.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ------------------------------------------------------------------
   *  Sangre procedural
   * ---------------------------------------------------------------- */

  const azar = (min, max) => min + Math.random() * (max - min);

  /** Dibuja una mancha: cuerpo irregular + gotas satélite + chorretones. */
  function mancha(x, y, radio) {
    // Degradado: centro más oscuro y brillante, bordes casi negros.
    const grad = ctx.createRadialGradient(x - radio * 0.2, y - radio * 0.2, radio * 0.1, x, y, radio * 1.2);
    grad.addColorStop(0, "rgba(150,0,0,0.95)");
    grad.addColorStop(0.6, "rgba(110,0,0,0.92)");
    grad.addColorStop(1, "rgba(50,0,0,0.85)");
    ctx.fillStyle = grad;

    // Cuerpo principal: polígono de radio irregular suavizado con curvas.
    const puntos = 16;
    ctx.beginPath();
    for (let i = 0; i <= puntos; i++) {
      const ang = (i / puntos) * Math.PI * 2;
      const r = radio * azar(0.65, 1.2);
      const px = x + Math.cos(ang) * r;
      const py = y + Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.quadraticCurveTo(x + Math.cos(ang - 0.2) * r * 1.15, y + Math.sin(ang - 0.2) * r * 1.15, px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Gotas satélite alrededor.
    const gotas = Math.floor(azar(8, 18));
    for (let i = 0; i < gotas; i++) {
      const ang = azar(0, Math.PI * 2);
      const d = radio * azar(1.1, 2.8);
      ctx.beginPath();
      ctx.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d, azar(1, radio * 0.14), 0, Math.PI * 2);
      ctx.fill();
    }

    // Chorretones que caen hacia abajo.
    const chorros = Math.floor(azar(1, 4));
    for (let i = 0; i < chorros; i++) {
      const cx = x + azar(-radio * 0.7, radio * 0.7);
      const largo = azar(radio * 0.8, radio * 3);
      const ancho = azar(2, radio * 0.18);
      ctx.fillRect(cx - ancho / 2, y, ancho, largo);
      ctx.beginPath();
      ctx.arc(cx, y + largo, ancho * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Salpica la pantalla de sangre.
   * @param {number} intensidad 0.3 (rasguño) … 1.5 (muerte)
   * @param {boolean} persistente si es true, la sangre no se desvanece.
   */
  function salpicar(intensidad = 1, persistente = false) {
    if (!ctx) return;
    clearTimeout(fundido);
    lienzo.classList.remove("desvanecer");
    const n = Math.round(2 + intensidad * 4);
    for (let i = 0; i < n; i++) {
      // Más manchas en los bordes (como sangre en la "cámara").
      const borde = Math.random() < 0.7;
      const x = borde ? (Math.random() < 0.5 ? azar(0, innerWidth * 0.25) : azar(innerWidth * 0.75, innerWidth)) : azar(0, innerWidth);
      const y = azar(0, innerHeight * 0.9);
      mancha(x, y, azar(25, 70) * intensidad * (innerWidth < 600 ? 0.7 : 1));
    }
    destello("rgba(150,0,0,.45)");
    if (!persistente) {
      fundido = setTimeout(() => {
        lienzo.classList.add("desvanecer");
        fundido = setTimeout(limpiar, 2500);
      }, 1400);
    }
  }

  /** Borra toda la sangre del canvas. */
  function limpiar() {
    clearTimeout(fundido);
    if (ctx) ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    if (lienzo) lienzo.classList.remove("desvanecer");
  }

  /* ------------------------------------------------------------------
   *  Temblor, destello y susto
   * ---------------------------------------------------------------- */

  /** Sacude la aplicación reiniciando la animación CSS. */
  function temblor() {
    const app = document.getElementById("app");
    app.classList.remove("temblor", "temblor-suave");
    void app.offsetWidth; // Truco: fuerza al navegador a reiniciar la animación.
    app.classList.add(reducir ? "temblor-suave" : "temblor");
  }

  /** Flash de color a pantalla completa. */
  function destello(color = "rgba(255,255,255,.6)") {
    if (reducir) return;
    const capa = document.getElementById("capa-destello");
    capa.style.background = color;
    capa.classList.remove("activo");
    void capa.offsetWidth;
    capa.classList.add("activo");
  }

  /**
   * Jump scare: el retrato del monstruo ocupa la pantalla un instante.
   * @param {string} id personaje (ver PERSONAJES)
   */
  function susto(id) {
    const capa = document.getElementById("capa-susto");
    capa.querySelector("img").src = Retratos.de(id);
    capa.querySelector(".susto-nombre").textContent = (PERSONAJES[id] && PERSONAJES[id].nombre) || "";
    capa.classList.remove("activo", "suave");
    void capa.offsetWidth;
    capa.classList.add("activo");
    if (reducir) capa.classList.add("suave");
    Sonido.susto();
    temblor();
    setTimeout(() => capa.classList.remove("activo"), reducir ? 700 : 950);
  }

  function setReducir(valor) {
    reducir = valor;
    document.body.classList.toggle("reducir-destellos", valor);
  }

  /* ------------------------------------------------------------------
   *  Monitor ECG (estado de salud)
   * ---------------------------------------------------------------- */
  const ECG = (() => {
    let c = null;
    let g = null;
    let x = 0;
    let yPrevio = null;
    let estado = "bien";
    let animando = false;

    // Color y ritmo según el estado, como en los Resident Evil clásicos.
    const ESTADOS = {
      bien:       { color: "#3cff6b", periodo: 1100, amplitud: 0.42 },
      precaucion: { color: "#ffc400", periodo: 800,  amplitud: 0.36 },
      peligro:    { color: "#ff2a2a", periodo: 520,  amplitud: 0.3 },
      muerto:     { color: "#ff2a2a", periodo: 1e9,  amplitud: 0 }
    };

    /** Forma de un latido (onda P, complejo QRS, onda T). fase: 0..1 */
    function forma(fase) {
      if (fase < 0.08) return 0.08 * Math.sin((fase / 0.08) * Math.PI); // onda P
      if (fase < 0.14) return 0;
      if (fase < 0.16) return -0.2;      // Q
      if (fase < 0.19) return 1;         // R (pico)
      if (fase < 0.22) return -0.45;     // S
      if (fase < 0.32) return 0;
      if (fase < 0.44) return 0.2 * Math.sin(((fase - 0.32) / 0.12) * Math.PI); // onda T
      return 0;
    }

    function iniciar(canvas) {
      c = canvas;
      g = c.getContext("2d");
      if (!animando) {
        animando = true;
        requestAnimationFrame(dibujar);
      }
    }

    function dibujar(t) {
      if (!c) return;
      const ancho = c.width;
      const alto = c.height;
      const cfg = ESTADOS[estado];
      const fase = (t % cfg.periodo) / cfg.periodo;
      const y = alto / 2 - forma(fase) * alto * cfg.amplitud * 2;

      // Borramos una franja por delante del trazo (efecto "barrido" del monitor).
      g.clearRect(x, 0, 14, alto);
      g.strokeStyle = cfg.color;
      g.lineWidth = 2;
      g.shadowColor = cfg.color;
      g.shadowBlur = 6;
      g.beginPath();
      g.moveTo(x - 2, yPrevio ?? y);
      g.lineTo(x, y);
      g.stroke();

      yPrevio = y;
      x += 2;
      if (x > ancho) {
        x = 0;
        yPrevio = null;
      }
      requestAnimationFrame(dibujar);
    }

    function setEstado(nuevo) {
      estado = ESTADOS[nuevo] ? nuevo : "bien";
    }

    return { iniciar, setEstado };
  })();

  return { iniciar, salpicar, limpiar, temblor, destello, susto, setReducir, ECG };
})();
