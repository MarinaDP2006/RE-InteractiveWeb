/* ============================================================================
 *  comun/ambiente.js — Efectos de ambiente compartidos por el portal y la wiki
 * ============================================================================
 *  · Grano de película generado por código (sin imágenes).
 *  · Lluvia en un <canvas> con profundidad (gotas lejanas lentas y finas).
 *  · Relámpagos aleatorios con trueno sintetizado.
 *  · Ambiente sonoro opcional (lluvia + zumbido grave) con Web Audio.
 *  · Utilidades: logotipo de Umbrella en SVG, peticiones a la API, aparición
 *    de elementos al hacer scroll.
 * ========================================================================== */
"use strict";

const Umbra = (() => {
  const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const almacen = {
    leer(k) { try { return localStorage.getItem(k); } catch { return null; } },
    escribir(k, v) { try { localStorage.setItem(k, v); } catch { /* modo privado */ } }
  };

  /* ---------------- Logotipo (paraguas de 8 gajos rojos y blancos) ---------------- */
  function logo(tam = 1) {
    let gajos = "";
    for (let i = 0; i < 8; i++) {
      const a1 = (i * 45 - 90 - 22.5) * Math.PI / 180;
      const a2 = (i * 45 - 90 + 22.5) * Math.PI / 180;
      const x1 = 50 + 48 * Math.cos(a1), y1 = 50 + 48 * Math.sin(a1);
      const x2 = 50 + 48 * Math.cos(a2), y2 = 50 + 48 * Math.sin(a2);
      // Cada gajo tiene el borde exterior ligeramente cóncavo, como el emblema original.
      const am = (i * 45 - 90) * Math.PI / 180;
      const cx = 50 + 40 * Math.cos(am), cy = 50 + 40 * Math.sin(am);
      gajos += `<path d="M50 50 L${x1.toFixed(2)} ${y1.toFixed(2)} Q${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${i % 2 ? "#f2efe9" : "#c8102e"}"/>`;
    }
    return `<svg class="logo-umbrella" viewBox="0 0 100 100"${tam !== 1 ? ` style="font-size:${tam}em"` : ""} aria-hidden="true">${gajos}
      <circle cx="50" cy="50" r="3.2" fill="#0a0a0a"/></svg>`;
  }

  /* ---------------- Grano de película ---------------- */
  function texturaGrano() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL("image/png");
  }

  /* ---------------- Lluvia ---------------- */
  function lluvia(canvas) {
    const g = canvas.getContext("2d");
    let gotas = [];
    let ancho = 0, alto = 0, activo = true;
    function medir() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      ancho = innerWidth; alto = innerHeight;
      canvas.width = ancho * dpr; canvas.height = alto * dpr;
      canvas.style.width = ancho + "px"; canvas.style.height = alto + "px";
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(ancho * alto / 5200);
      gotas = Array.from({ length: n }, () => nueva(true));
    }
    function nueva(inicio) {
      const z = Math.random(); // 0 = lejos, 1 = cerca
      return { x: Math.random() * (ancho + 200) - 100, y: inicio ? Math.random() * alto : -30, z, v: 9 + z * 16, l: 8 + z * 22 };
    }
    function cuadro() {
      if (!activo) return;
      g.clearRect(0, 0, ancho, alto);
      g.lineCap = "round";
      for (const d of gotas) {
        g.strokeStyle = `rgba(170,190,215,${0.08 + d.z * 0.32})`;
        g.lineWidth = 0.5 + d.z * 1.1;
        g.beginPath();
        g.moveTo(d.x, d.y);
        g.lineTo(d.x - d.l * 0.18, d.y + d.l);
        g.stroke();
        d.y += d.v; d.x -= d.v * 0.18;
        if (d.y > alto) Object.assign(d, nueva(false));
      }
      requestAnimationFrame(cuadro);
    }
    medir();
    addEventListener("resize", medir);
    document.addEventListener("visibilitychange", () => {
      activo = !document.hidden;
      if (activo) requestAnimationFrame(cuadro);
    });
    requestAnimationFrame(cuadro);
  }

  /* ---------------- Sonido ambiente ---------------- */
  const Audio = (() => {
    let ctx = null, maestro = null, encendido = false;
    function crear() {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      maestro = ctx.createGain();
      maestro.gain.value = 0;
      maestro.connect(ctx.destination);
      // Lluvia: ruido rosa filtrado.
      const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < d.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11;
      }
      const ruido = ctx.createBufferSource();
      ruido.buffer = buf; ruido.loop = true;
      const paso = ctx.createBiquadFilter(); paso.type = "bandpass"; paso.frequency.value = 1400; paso.Q.value = 0.4;
      const gLluvia = ctx.createGain(); gLluvia.gain.value = 0.55;
      ruido.connect(paso).connect(gLluvia).connect(maestro);
      ruido.start();
      // Zumbido grave e inquietante (dos osciladores desafinados).
      [55, 55.7, 82.4].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = i === 2 ? "triangle" : "sine"; o.frequency.value = f;
        const gO = ctx.createGain(); gO.gain.value = i === 2 ? 0.015 : 0.05;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + i * 0.03;
        const gL = ctx.createGain(); gL.gain.value = 0.02;
        lfo.connect(gL).connect(gO.gain);
        o.connect(gO).connect(maestro); o.start(); lfo.start();
      });
    }
    function trueno(distancia = 1) {
      if (!ctx || !encendido) return;
      const dur = 3.5;
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let ultimo = 0;
      for (let i = 0; i < d.length; i++) {
        const t = i / ctx.sampleRate;
        const env = Math.exp(-t * (1.2 + distancia)) * (t < 0.05 ? t / 0.05 : 1) * (0.6 + 0.4 * Math.sin(t * 9));
        ultimo = ultimo * 0.97 + (Math.random() * 2 - 1) * 0.03;
        d[i] = ultimo * env * 9;
      }
      const s = ctx.createBufferSource(); s.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 380 / distancia;
      const gT = ctx.createGain(); gT.gain.value = 0.9 / distancia;
      s.connect(f).connect(gT).connect(maestro);
      s.start(ctx.currentTime + 0.25 + distancia * 0.6);
    }
    function poner(si) {
      encendido = si;
      almacen.escribir("umbrella_ambiente", si ? "1" : "0");
      if (si) { crear(); ctx.resume(); }
      if (maestro) maestro.gain.setTargetAtTime(si ? 0.5 : 0, ctx.currentTime, 0.6);
    }
    return { poner, trueno, get encendido() { return encendido; } };
  })();

  /* ---------------- Relámpagos ---------------- */
  function relampagos(capa) {
    function siguiente() {
      setTimeout(() => {
        if (!document.hidden) {
          capa.classList.remove("activo");
          void capa.offsetWidth;
          capa.classList.add("activo");
          Audio.trueno(1 + Math.random() * 1.5);
        }
        siguiente();
      }, 14000 + Math.random() * 26000);
    }
    siguiente();
  }

  /* ---------------- Montaje de las capas ---------------- */
  function iniciar(opciones = {}) {
    const { conLluvia = true, conRelampagos = true } = opciones;
    const capas = [];
    if (conLluvia && !reducir) capas.push('<canvas id="fx-lluvia" class="fx" aria-hidden="true"></canvas>');
    if (conRelampagos && !reducir) capas.push('<div id="fx-relampago" class="fx" aria-hidden="true"></div>');
    capas.push('<div id="fx-lineas" class="fx" aria-hidden="true"></div>', '<div id="fx-vineta" class="fx" aria-hidden="true"></div>', '<div id="fx-grano" class="fx" aria-hidden="true"></div>');
    document.body.insertAdjacentHTML("afterbegin", capas.join(""));
    const grano = document.getElementById("fx-grano");
    grano.style.backgroundImage = `url(${texturaGrano()})`;
    grano.style.inset = "-50%";
    const cl = document.getElementById("fx-lluvia");
    if (cl) lluvia(cl);
    const rel = document.getElementById("fx-relampago");
    if (rel) relampagos(rel);
    observarRevelar();
  }

  /* ---------------- Aparición al hacer scroll ---------------- */
  let observador = null;
  function observarRevelar(raiz = document) {
    if (!("IntersectionObserver" in window)) {
      raiz.querySelectorAll(".revelar").forEach((e) => e.classList.add("visible"));
      return;
    }
    observador = observador || new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) { e.target.classList.add("visible"); observador.unobserve(e.target); }
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    raiz.querySelectorAll(".revelar:not(.visible)").forEach((e) => observador.observe(e));
  }

  /* ---------------- API ---------------- */
  async function api(ruta, cuerpo) {
    const op = cuerpo === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) };
    let r;
    try { r = await fetch(ruta, op); } catch { throw new Error("No hay conexión con el servidor de Umbrella."); }
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.ok === false) {
      const e = new Error(d.error || `Error del servidor (${r.status})`);
      e.codigo = r.status;
      throw e;
    }
    return d;
  }

  /** Escapa texto para insertarlo como HTML. */
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  return { iniciar, logo, api, esc, Audio, almacen, observarRevelar, reducir };
})();
