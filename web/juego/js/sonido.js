/* ============================================================================
 *  sonido.js — Audio 100 % sintetizado con la Web Audio API
 * ============================================================================
 *
 *  No hay ni un solo archivo de audio: todos los sonidos (ambiente, latidos,
 *  gritos de susto, golpes, máquina de escribir...) se generan en tiempo real
 *  con osciladores y ruido filtrado. Ventajas: cero copyright, cero descargas.
 *
 *  Los navegadores bloquean el audio hasta que el usuario interactúa con la
 *  página, por eso hay que llamar a Sonido.iniciar() tras el primer clic.
 * ========================================================================== */

"use strict";

const Sonido = (() => {
  let ctx = null;          // AudioContext (se crea tras el primer clic)
  let maestro = null;      // Volumen general (para silenciar todo de golpe)
  let activo = true;       // ¿Sonido encendido?
  let ambiente = null;     // Nodos del zumbido ambiental
  let crujidos = null;     // Temporizador de crujidos aleatorios
  let latido = null;       // Temporizador del latido (salud en peligro)
  let pad = null;          // Nodos de la música de "sala segura"

  /** Crea el contexto de audio (o lo reanuda si estaba suspendido). */
  function iniciar() {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return;
    }
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return; // Navegador sin Web Audio: el juego sigue en silencio.
    ctx = new Contexto();
    maestro = ctx.createGain();
    maestro.gain.value = activo ? 0.8 : 0;
    maestro.connect(ctx.destination);
  }

  const listo = () => ctx && activo;

  /* ------------------------------------------------------------------
   *  Bloques básicos de síntesis
   * ---------------------------------------------------------------- */

  /** Búfer de ruido blanco de la duración indicada (segundos). */
  function bufferRuido(duracion) {
    const muestras = Math.max(1, Math.floor(ctx.sampleRate * duracion));
    const buffer = ctx.createBuffer(1, muestras, ctx.sampleRate);
    const datos = buffer.getChannelData(0);
    for (let i = 0; i < muestras; i++) datos[i] = Math.random() * 2 - 1;
    return buffer;
  }

  /**
   * Tono con envolvente: sube rápido y decae exponencialmente.
   * f2 permite un "glissando" (deslizar la frecuencia de f a f2).
   */
  function tono({ tipo = "sine", f = 440, f2 = null, dur = 0.3, vol = 0.3, retraso = 0, filtro = null }) {
    if (!listo()) return;
    const t = ctx.currentTime + retraso;
    const osc = ctx.createOscillator();
    const ganancia = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(f, t);
    if (f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t + dur);
    ganancia.gain.setValueAtTime(0.0001, t);
    ganancia.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let salida = osc;
    if (filtro) {
      const bq = ctx.createBiquadFilter();
      bq.type = filtro.tipo || "lowpass";
      bq.frequency.value = filtro.f || 800;
      osc.connect(bq);
      salida = bq;
    }
    salida.connect(ganancia).connect(maestro);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  /** Ráfaga de ruido filtrado (golpes, salpicaduras, viento, chasquidos). */
  function rafaga({ dur = 0.2, vol = 0.4, tipo = "lowpass", f = 1000, f2 = null, q = 1, retraso = 0 }) {
    if (!listo()) return;
    const t = ctx.currentTime + retraso;
    const fuente = ctx.createBufferSource();
    fuente.buffer = bufferRuido(dur);
    const bq = ctx.createBiquadFilter();
    bq.type = tipo;
    bq.frequency.setValueAtTime(f, t);
    if (f2) bq.frequency.exponentialRampToValueAtTime(f2, t + dur);
    bq.Q.value = q;
    const ganancia = ctx.createGain();
    ganancia.gain.setValueAtTime(vol, t);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    fuente.connect(bq).connect(ganancia).connect(maestro);
    fuente.start(t);
  }

  /* ------------------------------------------------------------------
   *  Efectos del juego
   * ---------------------------------------------------------------- */

  /** Tecla de máquina de escribir (texto que aparece letra a letra). */
  const tecla = () => {
    rafaga({ dur: 0.03, vol: 0.12, tipo: "highpass", f: 2500 });
    tono({ tipo: "square", f: 1600 + Math.random() * 300, dur: 0.02, vol: 0.02 });
  };

  /** Aviso de mensaje de chat (agudo para los demás, grave para ti). */
  const mensaje = (propio) => tono({ f: propio ? 520 : 880, f2: propio ? 440 : 1100, dur: 0.14, vol: 0.09 });

  /** Golpe con salpicadura: impacto grave + chapoteo húmedo. */
  function golpe() {
    tono({ f: 110, f2: 35, dur: 0.35, vol: 0.7 });
    rafaga({ dur: 0.3, vol: 0.6, tipo: "lowpass", f: 900, f2: 150 });
    rafaga({ dur: 0.25, vol: 0.35, tipo: "bandpass", f: 400, q: 3, retraso: 0.05 });
  }

  /** Golpe seco y corto (cada pulsación del QTE). */
  const golpeSeco = () => {
    tono({ f: 160, f2: 60, dur: 0.08, vol: 0.25 });
    rafaga({ dur: 0.05, vol: 0.15, f: 1500 });
  };

  /** Chirrido de susto (jump scare): agudo desafinado + ruido. */
  function susto() {
    tono({ tipo: "sawtooth", f: 280, f2: 1600, dur: 0.6, vol: 0.28 });
    tono({ tipo: "square", f: 2300, f2: 1900, dur: 0.5, vol: 0.08 });
    tono({ tipo: "sawtooth", f: 70, f2: 40, dur: 0.8, vol: 0.4 });
    rafaga({ dur: 0.8, vol: 0.45, tipo: "highpass", f: 2500 });
  }

  /** Trueno lejano (relámpagos del título 3D): chasquido + retumbar largo. */
  function trueno() {
    rafaga({ dur: 0.35, vol: 0.18, tipo: "highpass", f: 1800, f2: 400, retraso: 0.25 });
    rafaga({ dur: 3.2, vol: 0.42, tipo: "lowpass", f: 320, f2: 40, retraso: 0.35 });
    tono({ tipo: "sawtooth", f: 48, f2: 30, dur: 2.6, vol: 0.12, retraso: 0.4, filtro: { f: 120 } });
  }

  /** Gruñido grave de monstruo (dos sierras desafinadas filtradas). */
  function grunido() {
    tono({ tipo: "sawtooth", f: 62, f2: 45, dur: 1.4, vol: 0.32, filtro: { f: 350 } });
    tono({ tipo: "sawtooth", f: 65, f2: 48, dur: 1.4, vol: 0.32, filtro: { f: 350 } });
    rafaga({ dur: 1.2, vol: 0.18, tipo: "bandpass", f: 220, q: 4 });
  }

  /** Arpegio de acierto. */
  const exito = () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tono({ tipo: "triangle", f, dur: 0.5, vol: 0.14, retraso: i * 0.09 }));

  /** Zumbido de error. */
  const error = () => {
    tono({ tipo: "square", f: 140, dur: 0.18, vol: 0.12 });
    tono({ tipo: "square", f: 110, dur: 0.25, vol: 0.12, retraso: 0.2 });
  };

  /** Campana lejana (inicio de capítulo). */
  function campana() {
    [220, 440.5, 661, 880.7].forEach((f, i) => tono({ f, dur: 3.5 - i * 0.6, vol: 0.12 / (i + 1) }));
  }

  /** Curación. */
  const curar = () => {
    tono({ f: 600, f2: 900, dur: 0.35, vol: 0.12 });
    tono({ f: 900, f2: 1200, dur: 0.4, vol: 0.08, retraso: 0.15 });
  };

  /** Muerte: caída grave larga + estertor de ruido. */
  function muerte() {
    tono({ tipo: "sawtooth", f: 220, f2: 30, dur: 2.5, vol: 0.35, filtro: { f: 600 } });
    rafaga({ dur: 2, vol: 0.3, tipo: "lowpass", f: 600, f2: 80 });
    tono({ f: 55, dur: 3, vol: 0.4, retraso: 0.4 });
  }

  /** Disparo de pistola: chasquido seco + estampido grave. vol: 1 = el tuyo, menos = aliado. */
  function disparo(vol = 1) {
    rafaga({ dur: 0.18, vol: 0.55 * vol, tipo: "highpass", f: 900 });
    rafaga({ dur: 0.35, vol: 0.5 * vol, tipo: "lowpass", f: 600, f2: 90 });
    tono({ f: 140, f2: 40, dur: 0.22, vol: 0.45 * vol });
  }

  /** Paso sobre el suelo (muy suave). */
  const paso = () => rafaga({ dur: 0.07, vol: 0.06, tipo: "lowpass", f: 380 + Math.random() * 120 });

  /** Gemido de zombi: sierra grave que sube y baja, filtrada. */
  function gemido() {
    const f = 85 + Math.random() * 40;
    tono({ tipo: "sawtooth", f, f2: f * 0.7, dur: 1.1, vol: 0.12, filtro: { f: 500 } });
    tono({ tipo: "sawtooth", f: f * 1.02, f2: f * 0.8, dur: 0.9, vol: 0.08, retraso: 0.15, filtro: { f: 420 } });
  }

  /* ------------------------------------------------------------------
   *  SONIDOS DE TERROR ESPACIALES (director del miedo, terror.js)
   *  Con panorámica estéreo y una reverberación generada por código:
   *  suenan "en la habitación", a tu izquierda, detrás de una pared...
   * ---------------------------------------------------------------- */
  let reverbSala = null;
  /** Reverberación de sala: respuesta al impulso de ruido que decae (2,8 s). */
  function salaReverb() {
    if (reverbSala || !ctx) return reverbSala;
    const dur = 2.8, n = Math.floor(ctx.sampleRate * dur);
    const ir = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2);
    }
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    const gHumedo = ctx.createGain();
    gHumedo.gain.value = 0.55;
    conv.connect(gHumedo).connect(maestro);
    reverbSala = conv;
    return reverbSala;
  }
  /** Nodo de salida con panorámica (-1 izquierda … 1 derecha) y envío a la reverberación. */
  function espacio(pan = 0, humedad = 0.6) {
    const entrada = ctx.createGain();
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (p.pan) p.pan.value = Math.max(-1, Math.min(1, pan));
    entrada.connect(p).connect(maestro);
    const envio = ctx.createGain();
    envio.gain.value = humedad;
    entrada.connect(envio).connect(salaReverb());
    return entrada;
  }
  /** Ruido filtrado enviado a un nodo concreto (versión espacial de rafaga). */
  function rafagaEn(destino, { dur = 0.2, vol = 0.4, tipo = "lowpass", f = 1000, f2 = null, q = 1, retraso = 0 }) {
    const t = ctx.currentTime + retraso;
    const fuente = ctx.createBufferSource();
    fuente.buffer = bufferRuido(dur);
    const bq = ctx.createBiquadFilter();
    bq.type = tipo; bq.frequency.setValueAtTime(f, t);
    if (f2) bq.frequency.exponentialRampToValueAtTime(f2, t + dur);
    bq.Q.value = q;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    fuente.connect(bq).connect(gn).connect(destino);
    fuente.start(t);
  }
  function tonoEn(destino, { tipo = "sine", f = 440, f2 = null, dur = 0.3, vol = 0.3, retraso = 0, filtro = null, ataque = 0.01 }) {
    const t = ctx.currentTime + retraso;
    const osc = ctx.createOscillator();
    osc.type = tipo; osc.frequency.setValueAtTime(f, t);
    if (f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t + dur);
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(vol, t + ataque);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let s = osc;
    if (filtro) { const bq = ctx.createBiquadFilter(); bq.type = filtro.tipo || "lowpass"; bq.frequency.value = filtro.f; bq.Q.value = filtro.q || 1; osc.connect(bq); s = bq; }
    s.connect(gn).connect(destino);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  /** Pasos pesados que se acercan o se alejan (Mr. X, Jack Baker...). */
  function pasosPesados(pan = 0, n = 6, acercandose = true) {
    if (!listo()) return;
    const d = espacio(pan, 0.8);
    for (let i = 0; i < n; i++) {
      const k = acercandose ? (i + 1) / n : 1 - i / n;
      const v = 0.12 + k * 0.5;
      tonoEn(d, { f: 70, f2: 38, dur: 0.32, vol: v, retraso: i * 0.62 });
      rafagaEn(d, { dur: 0.16, vol: v * 0.6, tipo: "lowpass", f: 420, f2: 120, retraso: i * 0.62 });
    }
  }
  /** Pasos rápidos de alguien que corre en la oscuridad. */
  function carrera(pan = 0) {
    if (!listo()) return;
    const d = espacio(pan, 0.7);
    for (let i = 0; i < 9; i++) rafagaEn(d, { dur: 0.06, vol: 0.18 + Math.random() * 0.1, tipo: "lowpass", f: 700, retraso: i * 0.17 });
  }
  /** Portazo lejano. */
  function portazo(pan = 0) {
    if (!listo()) return;
    const d = espacio(pan, 1);
    tonoEn(d, { f: 90, f2: 30, dur: 0.6, vol: 0.7 });
    rafagaEn(d, { dur: 0.4, vol: 0.6, tipo: "lowpass", f: 1400, f2: 120 });
    rafagaEn(d, { dur: 0.08, vol: 0.4, tipo: "highpass", f: 2600 });
  }
  /** Susurro ininteligible muy cerca del oído. */
  function susurro(pan = 0) {
    if (!listo()) return;
    const d = espacio(pan, 0.25);
    const silabas = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < silabas; i++) {
      const f = 1200 + Math.random() * 2400;
      rafagaEn(d, { dur: 0.12 + Math.random() * 0.15, vol: 0.05 + Math.random() * 0.05, tipo: "bandpass", f, f2: f * (0.7 + Math.random() * 0.6), q: 6, retraso: i * 0.16 + Math.random() * 0.05 });
    }
  }
  /** Metal arrastrado por el suelo (una tubería, un hacha...). */
  function arrastre(pan = 0) {
    if (!listo()) return;
    const d = espacio(pan, 0.9);
    tonoEn(d, { tipo: "sawtooth", f: 1900, f2: 1300, dur: 1.8, vol: 0.05, ataque: 0.3, filtro: { tipo: "bandpass", f: 2200, q: 8 } });
    tonoEn(d, { tipo: "sawtooth", f: 2470, f2: 2100, dur: 1.6, vol: 0.03, ataque: 0.3, filtro: { tipo: "bandpass", f: 2600, q: 10 } });
    rafagaEn(d, { dur: 1.8, vol: 0.12, tipo: "bandpass", f: 3000, q: 2 });
  }
  /** Respiración ronca a tu espalda. */
  function respiracion(pan = 0) {
    if (!listo()) return;
    const d = espacio(pan, 0.2);
    for (let i = 0; i < 3; i++) {
      rafagaEn(d, { dur: 0.9, vol: 0.09, tipo: "bandpass", f: 520, f2: 380, q: 1.5, retraso: i * 1.7 });
      tonoEn(d, { tipo: "sawtooth", f: 60, f2: 52, dur: 0.8, vol: 0.03, retraso: i * 1.7 + 0.1, filtro: { f: 300 } });
    }
  }
  /** Golpe sordo en el techo o detrás de la pared. */
  function golpeSordo(pan = 0) {
    if (!listo()) return;
    const d = espacio(pan, 1);
    tonoEn(d, { f: 58, f2: 30, dur: 0.5, vol: 0.55 });
    rafagaEn(d, { dur: 0.25, vol: 0.3, tipo: "lowpass", f: 300 });
  }
  /** Grito humano lejano que se corta. */
  function gritoLejano(pan = 0) {
    if (!listo()) return;
    const d = espacio(pan, 1);
    const base = 520 + Math.random() * 200;
    tonoEn(d, { tipo: "sawtooth", f: base, f2: base * 1.6, dur: 1.1, vol: 0.05, ataque: 0.15, filtro: { tipo: "bandpass", f: 1400, q: 3 } });
    tonoEn(d, { tipo: "sawtooth", f: base * 1.01, f2: base * 1.5, dur: 1.0, vol: 0.04, ataque: 0.15, filtro: { tipo: "bandpass", f: 2600, q: 4 } });
  }
  /** Chisporroteo de un fluorescente que falla. */
  function chispazo() {
    if (!listo()) return;
    const d = espacio((Math.random() - 0.5) * 1.2, 0.3);
    for (let i = 0; i < 4; i++) rafagaEn(d, { dur: 0.03, vol: 0.12, tipo: "highpass", f: 3500, retraso: i * 0.05 + Math.random() * 0.03 });
    tonoEn(d, { tipo: "square", f: 120, dur: 0.3, vol: 0.02 });
  }
  /** Golpe orquestal disonante (aparece una amenaza). */
  function stinger() {
    if (!listo()) return;
    const d = espacio(0, 0.9);
    [65.4, 69.3, 98, 103.8, 138.6, 146.8].forEach((f, i) => tonoEn(d, { tipo: i % 2 ? "sawtooth" : "square", f, f2: f * 0.98, dur: 2.2, vol: 0.08, filtro: { f: 1800 } }));
    rafagaEn(d, { dur: 1.4, vol: 0.5, tipo: "lowpass", f: 3000, f2: 200 });
    tonoEn(d, { tipo: "sine", f: 40, f2: 28, dur: 2.5, vol: 0.6 });
  }
  /** Cuerdas que suben hasta romper (antes de un susto). */
  function crescendo(segundos = 2.5) {
    if (!listo()) return;
    const d = espacio(0, 0.6);
    [311, 329.6, 349.2].forEach((f) => tonoEn(d, { tipo: "sawtooth", f, f2: f * 1.12, dur: segundos, vol: 0.05, ataque: segundos * 0.9, filtro: { tipo: "bandpass", f: 900, q: 2 } }));
  }
  /** Cristal que se rompe. */
  function cristal(pan = 0) {
    if (!listo()) return;
    const d = espacio(pan, 0.8);
    rafagaEn(d, { dur: 0.5, vol: 0.4, tipo: "highpass", f: 4000 });
    for (let i = 0; i < 6; i++) tonoEn(d, { f: 2500 + Math.random() * 3000, dur: 0.25, vol: 0.05, retraso: 0.05 + Math.random() * 0.3 });
  }
  /** Llanto de bebé muy lejano (Beneviento, orfanato...). */
  function llanto(pan = 0) {
    if (!listo()) return;
    const d = espacio(pan, 1);
    for (let i = 0; i < 3; i++) tonoEn(d, { tipo: "triangle", f: 480, f2: 380, dur: 0.7, vol: 0.04, ataque: 0.1, retraso: i * 0.9, filtro: { tipo: "bandpass", f: 900, q: 2 } });
  }

  /* ------------------------------------------------------------------
   *  Capas continuas: ambiente, latido y sala segura
   * ---------------------------------------------------------------- */

  /** Zumbido ambiental de terror + viento + crujidos + la música del juego indicado. */
  function ambienteOn(tema) {
    if (!ctx) return;
    if (tema && (!musicaActual || musicaActual.tema !== tema)) { musica(tema); musicaActual.tema = tema; }
    if (ambiente) return;
    const salida = ctx.createGain();
    salida.gain.value = 0.0001;
    salida.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 3);
    salida.connect(maestro);

    // Dron: dos osciladores graves ligeramente desafinados (efecto "batido").
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 240;
    const gDron = ctx.createGain();
    gDron.gain.value = 0.05;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    o1.type = o2.type = "sawtooth";
    o1.frequency.value = 55;
    o2.frequency.value = 55.6;
    o1.connect(lp);
    o2.connect(lp);
    lp.connect(gDron).connect(salida);

    // Viento: ruido en bucle con un filtro que oscila lentamente (LFO).
    const viento = ctx.createBufferSource();
    viento.buffer = bufferRuido(4);
    viento.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 400;
    bp.Q.value = 0.8;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 250;
    lfo.connect(lfoG).connect(bp.frequency);
    const gViento = ctx.createGain();
    gViento.gain.value = 0.035;
    viento.connect(bp).connect(gViento).connect(salida);

    [o1, o2, viento, lfo].forEach((n) => n.start());
    ambiente = { salida, nodos: [o1, o2, viento, lfo] };

    // Crujidos de madera / pasos lejanos cada 6–14 segundos.
    const programar = () => {
      crujidos = setTimeout(() => {
        tono({ tipo: "triangle", f: 140 + Math.random() * 60, f2: 70, dur: 0.6, vol: 0.06 });
        programar();
      }, 6000 + Math.random() * 8000);
    };
    programar();
  }

  function ambienteOff() {
    pararMusica();
    tension(false);
    if (!ambiente) return;
    const { salida, nodos } = ambiente;
    salida.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
    setTimeout(() => nodos.forEach((n) => n.stop()), 1100);
    ambiente = null;
    clearTimeout(crujidos);
  }

  /** Latido "lub-dub" cuando la salud está en PELIGRO. */
  function latidoOn(intervalo = 900) {
    latidoOff();
    latido = setInterval(() => {
      tono({ f: 60, f2: 40, dur: 0.15, vol: 0.5 });
      tono({ f: 55, f2: 38, dur: 0.15, vol: 0.35, retraso: 0.22 });
    }, intervalo);
  }

  function latidoOff() {
    clearInterval(latido);
    latido = null;
  }

  /** Música tranquila de "sala segura" junto a la máquina de escribir: arpegio sereno. */
  function salaSegura(encender) {
    if (!ctx) return;
    if (encender && !pad) {
      if (musicaActual) musicaActual.salida.gain.setTargetAtTime(0.15, ctx.currentTime, 0.8);
      tension(false);
      const acordes = [[60, 64, 67, 71], [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65]];
      let k = 0;
      const tocar = () => {
        const a = acordes[Math.floor(k / 4) % acordes.length];
        nota(a[k % 4], { dur: 4, vol: 0.05, timbre: "piano" });
        if (k % 4 === 0) nota(a[0] - 12, { dur: 6, vol: 0.04, timbre: "piano" });
        k++;
      };
      tocar();
      pad = { intervalo: setInterval(tocar, 700) };
    } else if (!encender && pad) {
      clearInterval(pad.intervalo);
      pad = null;
      if (musicaActual) musicaActual.salida.gain.setTargetAtTime(1, ctx.currentTime, 1.5);
    }
  }

  /* ------------------------------------------------------------------
   *  Reverberación (sala grande y húmeda) para la música
   * ---------------------------------------------------------------- */
  let reverb = null;
  function nodoReverb() {
    if (reverb) return reverb;
    reverb = ctx.createConvolver();
    const largo = Math.floor(ctx.sampleRate * 3.2);
    const ir = ctx.createBuffer(2, largo, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < largo; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / largo, 2.8);
    }
    reverb.buffer = ir;
    const g = ctx.createGain();
    g.gain.value = 0.55;
    reverb.connect(g).connect(maestro);
    return reverb;
  }

  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  /**
   * Nota "instrumental" con envolvente y envío a reverberación.
   * timbre: piano | caja (caja de música) | punteo (guitarra) | coro
   */
  function nota(midi, { cuando = 0, dur = 2.5, vol = 0.06, timbre = "piano", salida } = {}) {
    if (!listo()) return;
    const t = ctx.currentTime + cuando;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    const ataque = timbre === "coro" ? 0.6 : 0.01;
    g.gain.exponentialRampToValueAtTime(vol, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const destino = salida || maestro;
    g.connect(destino);
    g.connect(nodoReverb());
    const f = hz(midi);
    const capas = {
      piano: [["sine", 1, 1], ["triangle", 2, 0.25], ["sine", 3, 0.08]],
      caja: [["sine", 2, 1], ["sine", 4.01, 0.35], ["triangle", 6.02, 0.1]],
      punteo: [["sawtooth", 1, 0.5], ["square", 0.5, 0.2]],
      coro: [["sawtooth", 1, 0.4], ["sawtooth", 1.006, 0.4], ["sawtooth", 0.994, 0.4]]
    }[timbre];
    let entrada = g;
    if (timbre === "punteo" || timbre === "coro") {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(timbre === "coro" ? 900 : 2400, t);
      if (timbre === "punteo") lp.frequency.exponentialRampToValueAtTime(300, t + dur);
      lp.connect(g);
      entrada = lp;
    }
    for (const [tipo, mult, v] of capas) {
      const o = ctx.createOscillator();
      const gv = ctx.createGain();
      o.type = tipo;
      o.frequency.value = f * mult;
      gv.gain.value = v;
      o.connect(gv).connect(entrada);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
  }

  /** Golpe de percusión grave (tambor / timbal). */
  function tambor(cuando = 0, vol = 0.18, f = 70) {
    if (!listo()) return;
    tono({ f, f2: f * 0.5, dur: 0.35, vol, retraso: cuando });
    rafaga({ dur: 0.08, vol: vol * 0.4, tipo: "lowpass", f: 900, retraso: cuando });
  }

  /* ------------------------------------------------------------------
   *  Música procedural: un tema distinto para cada juego
   *   raiz: nota MIDI · escala: semitonos · acordes: grados de la escala
   *   paso: segundos por pulso · melodia/percusion: carácter de cada tema
   * ---------------------------------------------------------------- */
  const MENOR = [0, 2, 3, 5, 7, 8, 10];
  const TEMAS = {
    titulo: { raiz: 45, escala: MENOR, acordes: [0, 5, 3, 4], paso: 1.6, timbre: "piano", pad: 0.035 },
    re2:    { raiz: 45, escala: MENOR, acordes: [0, 5, 3, 4], paso: 1.5, timbre: "piano", pad: 0.035 },
    re3:    { raiz: 43, escala: MENOR, acordes: [0, 3, 5, 4], paso: 1.0, timbre: "piano", pad: 0.03, percusion: [1, 0, 0, 1, 0, 0, 1, 0] },
    re4:    { raiz: 50, escala: [0, 1, 3, 5, 7, 8, 10], acordes: [0, 1, 0, 6], paso: 1.3, timbre: "punteo", pad: 0.03 },
    re5:    { raiz: 47, escala: MENOR, acordes: [0, 5, 6, 4], paso: 0.9, timbre: "punteo", pad: 0.025, percusion: [1, 0, 1, 0, 1, 1, 0, 1] },
    re6:    { raiz: 48, escala: MENOR, acordes: [0, 5, 2, 6], paso: 0.8, timbre: "piano", pad: 0.03, percusion: [1, 0, 0, 0, 1, 0, 1, 0] },
    re7:    { raiz: 53, escala: [0, 1, 3, 5, 6, 8, 10], acordes: [0, 4, 0, 1], paso: 1.9, timbre: "caja", pad: 0.025 },
    re8:    { raiz: 45, escala: [0, 2, 3, 5, 7, 8, 11], acordes: [0, 5, 3, 4], paso: 1.6, timbre: "coro", pad: 0.035 },
    re9:    { raiz: 44, escala: MENOR, acordes: [0, 5, 2, 4], paso: 1.8, timbre: "piano", pad: 0.035 }
  };
  let musicaActual = null;

  function musica(nombre) {
    if (!ctx) return;
    pararMusica();
    const tema = TEMAS[nombre] || TEMAS.titulo;
    const salida = ctx.createGain();
    salida.gain.value = 0.0001;
    salida.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 4);
    salida.connect(maestro);
    const estado = { salida, timers: [], nodos: [], vivo: true };
    musicaActual = estado;

    // Pad: acorde menor sostenido que cambia cada 8 pulsos (sierras filtradas que respiran).
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 260;
    lfo.connect(lfoG).connect(lp.frequency);
    lfo.start();
    const gPad = ctx.createGain();
    gPad.gain.value = tema.pad;
    lp.connect(gPad).connect(salida);
    gPad.connect(nodoReverb());
    const voces = [0, 1, 2, 3].map(() => {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.connect(lp);
      o.start();
      return o;
    });
    estado.nodos.push(lfo, ...voces);
    const grado = (g, oct = 0) => tema.raiz + tema.escala[((g % 7) + 7) % 7] + 12 * (Math.floor(g / 7) + oct);
    let compas = 0;
    const cambiarAcorde = () => {
      if (!estado.vivo) return;
      const g0 = tema.acordes[compas % tema.acordes.length];
      [grado(g0, -1), grado(g0), grado(g0 + 2), grado(g0 + 4)].forEach((m, i) => {
        voces[i].frequency.setTargetAtTime(hz(m) * (1 + (i - 1.5) * 0.002), ctx.currentTime, 0.8);
      });
      compas++;
      estado.timers.push(setTimeout(cambiarAcorde, tema.paso * 8000));
    };
    cambiarAcorde();

    // Melodía: notas sueltas de la escala, con silencios, que vagan arriba y abajo.
    let g = 7;
    const melodia = () => {
      if (!estado.vivo) return;
      if (Math.random() > 0.3) {
        g = Math.max(4, Math.min(16, g + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)]));
        nota(grado(g, tema.timbre === "caja" ? 1 : 0), { dur: tema.timbre === "punteo" ? 1.4 : 3.5, vol: tema.timbre === "caja" ? 0.03 : 0.045, timbre: tema.timbre, salida });
        if (tema.timbre === "caja" && Math.random() < 0.3) nota(grado(g, 1) + 0.4, { cuando: 0.03, dur: 2, vol: 0.015, timbre: "caja", salida }); // desafinada
      }
      estado.timers.push(setTimeout(melodia, tema.paso * 1000 * (Math.random() < 0.25 ? 2 : 1)));
    };
    estado.timers.push(setTimeout(melodia, 2500));

    // Percusión (RE3, RE5, RE6): patrón de 8 pulsos muy grave.
    if (tema.percusion) {
      let i = 0;
      const ritmo = () => {
        if (!estado.vivo) return;
        if (tema.percusion[i % 8]) tambor(0, 0.12, 60 + (i % 4 === 0 ? 0 : 15));
        i++;
        estado.timers.push(setTimeout(ritmo, tema.paso * 500));
      };
      estado.timers.push(setTimeout(ritmo, 4000));
    }
  }

  function pararMusica() {
    if (!musicaActual) return;
    const m = musicaActual;
    musicaActual = null;
    m.vivo = false;
    m.timers.forEach(clearTimeout);
    m.salida.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.6);
    setTimeout(() => { m.nodos.forEach((n) => { try { n.stop(); } catch { /* ya parado */ } }); m.salida.disconnect(); }, 2500);
  }

  /* ------------------------------------------------------------------
   *  Tensión: cuando algo te persigue (cuerdas disonantes + pulso)
   * ---------------------------------------------------------------- */
  let tensionNodos = null;
  function tension(encender) {
    if (!ctx) return;
    if (encender && !tensionNodos) {
      const g = ctx.createGain();
      g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 1.2);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1200;
      bp.Q.value = 0.7;
      bp.connect(g).connect(maestro);
      const trem = ctx.createOscillator();
      trem.frequency.value = 9;
      const tremG = ctx.createGain();
      tremG.gain.value = 0.4;
      trem.connect(tremG).connect(g.gain);
      const oscs = [hz(70), hz(71), hz(76), hz(77)].map((f) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        o.connect(bp);
        o.start();
        return o;
      });
      trem.start();
      const pulso = setInterval(() => tambor(0, 0.16, 55), 520);
      tensionNodos = { g, oscs: [...oscs, trem], pulso };
    } else if (!encender && tensionNodos) {
      const { g, oscs, pulso } = tensionNodos;
      tensionNodos = null;
      clearInterval(pulso);
      g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);
      setTimeout(() => oscs.forEach((o) => o.stop()), 2000);
    }
  }

  /* ------------------------------------------------------------------
   *  Radio: chasquido de transmisión y estática de fondo
   * ---------------------------------------------------------------- */
  function radioClic(fin = false) {
    if (!listo()) return;
    rafaga({ dur: 0.12, vol: 0.22, tipo: "bandpass", f: 2200, q: 2 });
    tono({ tipo: "square", f: fin ? 900 : 1300, dur: 0.07, vol: 0.05, retraso: 0.05 });
  }
  let estatica = null;
  function radioEstatica(encender) {
    if (!ctx) return;
    if (encender && !estatica) {
      const fuente = ctx.createBufferSource();
      fuente.buffer = bufferRuido(3);
      fuente.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 3000;
      bp.Q.value = 0.5;
      const g = ctx.createGain();
      g.gain.value = 0.012;
      fuente.connect(bp).connect(g).connect(maestro);
      fuente.start();
      const chispas = setInterval(() => { if (Math.random() < 0.4) rafaga({ dur: 0.03, vol: 0.05, tipo: "highpass", f: 4000 }); }, 300);
      estatica = { fuente, chispas };
    } else if (!encender && estatica) {
      estatica.fuente.stop();
      clearInterval(estatica.chispas);
      estatica = null;
    }
  }

  /** Enciende / apaga todo el sonido. */
  function setActivo(valor) {
    activo = valor;
    if (maestro) maestro.gain.setTargetAtTime(valor ? 0.8 : 0, ctx.currentTime, 0.05);
  }

  return {
    iniciar, tecla, mensaje, golpe, golpeSeco, susto, grunido, exito, error, campana, curar, muerte,
    disparo, paso, gemido, trueno, ambienteOn, ambienteOff, latidoOn, latidoOff, salaSegura, setActivo,
    musica, pararMusica, tension, radioClic, radioEstatica,
    pasosPesados, carrera, portazo, susurro, arrastre, respiracion, golpeSordo, gritoLejano,
    chispazo, stinger, crescendo, cristal, llanto,
    get activo() { return activo; }
  };
})();
