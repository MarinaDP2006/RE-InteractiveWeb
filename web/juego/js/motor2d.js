/* ============================================================================
 *  motor2d.js — Salas explorables en 2D
 * ============================================================================
 *
 *  Convierte un paso { tipo: "explorar", ... } en una escena jugable:
 *   · Fondo: una imagen real del escenario (img/escenarios/*.webp).
 *   · Personajes: imágenes de cuerpo entero (img/cuerpos/*.webp) que caminan
 *     sobre el suelo con perspectiva: más pequeñas cuanto más al fondo.
 *   · Linterna: la escena está a oscuras salvo alrededor del personaje.
 *   · Puntos que brillan (E / clic), aliados, enemigos que te persiguen,
 *     disparos (Espacio / clic en el enemigo), cuchillo (C), sangre y
 *     decapitaciones.
 *
 *  Coordenadas de la historia (metros):
 *   x ∈ [-ancho/2, ancho/2] → izquierda/derecha de la pantalla
 *   z ∈ [-fondo/2, fondo/2] → fondo de la imagen (arriba) / primer plano (abajo)
 *
 *  Cámara 3D (si los gráficos no están en «Bajo»): sigue al personaje con un
 *  ligero zoom, respira como una cámara al hombro y el fondo se desplaza más
 *  despacio que el primer plano (paralaje de profundidad). Después, el
 *  fotograma pasa por el post-procesado de render3d.js (niebla volumétrica,
 *  profundidad de campo, rayos de luz, super-resolución hasta 4K...).
 *
 *  Se publica como window.Motor2D = { crear } y lo usa juego.js.
 * ========================================================================== */

"use strict";

const Motor2D = (() => {
  const PI = Math.PI;
  /** Motor gráfico UMBRA (render3d.js), si está cargado. */
  const R3D = typeof Render3D !== "undefined" ? Render3D : null;

  /** Enemigos por defecto (vida en balazos, vel en m/s). */
  const TIPOS_ENEMIGO = {
    zombi:      { vida: 3, vel: 0.85, dano: 14, rango: 9 },
    perro:      { vida: 2, vel: 3.4, dano: 10, rango: 12, escala: 0.6 },
    licker:     { vida: 5, vel: 2.8, dano: 22, rango: 11, escala: 0.55 },
    mrx:        { vida: 8, vel: 1.25, dano: 35, rango: 30, escala: 1.25, invencible: true },
    nemesis:    { vida: 10, vel: 1.9, dano: 40, rango: 30, escala: 1.25, invencible: true },
    hunter:     { vida: 5, vel: 2.6, dano: 28, rango: 12, escala: 0.75 },
    ganado:     { vida: 3, vel: 1.6, dano: 16, rango: 12 },
    salvador:   { vida: 9, vel: 1.4, dano: 45, rango: 16, escala: 1.05 },
    majini:     { vida: 3, vel: 1.7, dano: 18, rango: 13 },
    monje:      { vida: 3, vel: 1.4, dano: 18, rango: 12 },
    verdugo:    { vida: 12, vel: 1.1, dano: 50, rango: 16, escala: 1.3 },
    ustanak:    { vida: 14, vel: 1.4, dano: 45, rango: 20, escala: 1.3, invencible: true },
    jack:       { vida: 9, vel: 1.4, dano: 35, rango: 20, escala: 1.05, invencible: true },
    moldeado:   { vida: 4, vel: 1.2, dano: 22, rango: 12, escala: 1.1 },
    licantropo: { vida: 4, vel: 3, dano: 22, rango: 14 },
    dimitrescu: { vida: 12, vel: 1.2, dano: 40, rango: 25, escala: 1.6, invencible: true },
    criatura:   { vida: 10, vel: 1.6, dano: 35, rango: 20, escala: 1.2 },
    g_adulto:   { escala: 0.9 },
    regenerador:{ escala: 1.1 },
    gigante:    { escala: 2 },
    huerfano:   { escala: 0.65 }
  };
  const ENEMIGO_BASE = { vida: 3, vel: 1.2, dano: 18, rango: 12 };
  /** Filtro que tiñe de rojo sangre una figura (destello al recibir un disparo). */
  const TINTE_ROJO = "brightness(0.5) sepia(1) saturate(9) hue-rotate(-45deg)";

  const REMATES = [
    "Le revientas el cráneo. Trozos de hueso y sesos salpican la pared.",
    "Cae de bruces y sigue mordiendo el suelo hasta que deja de moverse.",
    "Se desploma en un charco de sangre negra que no para de crecer.",
    "El impacto le abre el pecho. Se derrumba con un gorgoteo húmedo.",
    "Le arrancas media cara de un disparo. Aun así, intenta arrastrarse hacia ti.",
    "Se convulsiona en el suelo, vomitando sangre coagulada, y por fin se queda quieto."
  ];
  const DECAPITACIONES = [
    "¡DISPARO A LA CABEZA! La cabeza sale volando y rebota contra el suelo.",
    "¡Decapitado! Un chorro de sangre brota del cuello como una fuente.",
    "La cabeza revienta como un melón podrido. El cuerpo da dos pasos más y cae.",
    "Le separas la cabeza del cuerpo. Los ojos aún parpadean en el suelo."
  ];

  const escapar = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
  const elegir = (l) => l[Math.floor(Math.random() * l.length)];

  /** Caché de imágenes (se comparten entre salas). */
  const cache = new Map();
  function imagen(url) {
    if (!cache.has(url)) {
      const i = new Image();
      i.decoding = "async";
      i.src = url;
      cache.set(url, i);
    }
    return cache.get(url);
  }
  const lista = (i) => i && i.complete && i.naturalWidth > 0;

  /* ==========================================================================
   *  crear(contenedor, paso, ctx) → { destruir }
   *  ctx: protagonista, imagen(id), cuerpo(id), personaje(id), fondo, reducir,
   *       activo(), pausado(), examinar(punto), herir(d, causa), municion(),
   *       gastarMunicion(), salir()
   * ======================================================================== */
  function crear(contenedor, paso, ctx) {
    const W = paso.ancho || 14;
    const D = paso.fondo || 16;
    const HORIZONTE = paso.horizonte ?? 0.5;   // dónde empieza el suelo (fracción de la altura)
    const OSCURIDAD = paso.oscuridad ?? 0.86;   // negrura fuera de la linterna
    const esMovil = window.matchMedia("(pointer: coarse)").matches;

    contenedor.innerHTML = `
      <div class="exp" tabindex="-1">
        <canvas class="exp-lienzo"></canvas>
        <header class="exp-cabecera">
          <h2>${escapar(paso.titulo)}</h2>
          <p class="exp-objetivo"></p>
        </header>
        <div class="exp-estado">
          <div class="exp-arma"><span class="exp-arma-nombre">PISTOLA</span><span class="exp-municion" title="Munición"><b>0</b></span></div>
        </div>
        <div class="exp-aviso" aria-live="polite"></div>
        <div class="exp-texto caja-texto oculto" aria-live="polite"></div>
        <div class="exp-agarre" hidden><p>¡TE HA AGARRADO!</p><strong>FORCEJEA</strong><span>Pulsa <kbd>E</kbd> / <kbd>Espacio</kbd> rápido</span><div class="exp-agarre-barra"><i></i></div></div>
        <p class="exp-ayuda">WASD: moverse · Shift: correr · <b>Q</b> o clic derecho (mantener): apuntar · <b>Espacio</b>: disparar · <b>C</b>: cuchillo · <b>E</b>: examinar</p>
        <div class="exp-tactil" ${esMovil ? "" : "hidden"}>
          <div class="exp-joystick"><div class="exp-palanca"></div></div>
          <div class="exp-botones">
            <button type="button" data-b="accion" class="exp-b-accion"><span>Usar</span></button>
            <button type="button" data-b="apuntar" class="exp-b-apuntar"><span>Apuntar</span></button>
            <button type="button" data-b="disparar" class="exp-b-disparar"><span>Disparar</span></button>
            <button type="button" data-b="cuchillo"><span>Cuchillo</span></button>
          </div>
        </div>
      </div>`;
    const raiz = contenedor.querySelector(".exp");
    const canvas = contenedor.querySelector(".exp-lienzo");
    const g = canvas.getContext("2d");
    const domObjetivo = contenedor.querySelector(".exp-objetivo");
    const domMunicion = contenedor.querySelector(".exp-municion b");
    const domAviso = contenedor.querySelector(".exp-aviso");
    const domTexto = contenedor.querySelector(".exp-texto");
    const domAccion = contenedor.querySelector(".exp-b-accion span");
    const domAgarre = contenedor.querySelector(".exp-agarre");
    const domAgarreBarra = contenedor.querySelector(".exp-agarre-barra i");

    // Capa de oscuridad (se recorta con la linterna en cada fotograma).
    const sombra = document.createElement("canvas");
    const gs = sombra.getContext("2d");

    const fondo = imagen(paso.imagen || ctx.fondo || "");
    let CW = 1, CH = 1, DPR = 1;

    // Post-procesado WebGL (render3d.js). Si no hay WebGL, se queda en 2D.
    const post = R3D ? Render3D.crearPostSala(raiz, canvas, { tema: ctx.tema, reducir: ctx.reducir }) : { activo: false, render() {}, destruir() {} };
    const conCamara = Boolean(R3D && Render3D.avanzado());

    /* ---------------- Cámara 3D ----------------
     * cam.x / cam.y: punto de la escena (en px) que queda en el centro de la pantalla. */
    const cam = { x: 0, y: 0, zoom: 1, listo: false };
    function aVista(sx, sy) { return [(sx - cam.x) * cam.zoom + CW / 2, (sy - cam.y) * cam.zoom + CH / 2]; }
    function deVista(px, py) { return [(px - CW / 2) / cam.zoom + cam.x, (py - CH / 2) / cam.zoom + cam.y]; }

    /* ---------------- Proyección mundo → pantalla ---------------- */
    const yHorizonte = () => CH * HORIZONTE;
    const ySuelo = () => CH * 0.97;
    /** t: 0 al fondo, 1 en primer plano. */
    const profundidad = (z) => limitar((z + D / 2) / D, 0, 1);
    const escalaEn = (z) => 0.38 + 0.62 * profundidad(z);
    function aPantalla(x, z) {
      const t = profundidad(z);
      const sy = yHorizonte() + (ySuelo() - yHorizonte()) * t;
      const sx = CW / 2 + (x / (W / 2)) * (CW * 0.46) * (0.62 + 0.38 * t);
      return [sx, sy, escalaEn(z)];
    }
    function aMundo(sx, sy) {
      const t = limitar((sy - yHorizonte()) / (ySuelo() - yHorizonte()), 0, 1);
      const z = t * D - D / 2;
      const x = ((sx - CW / 2) / ((CW * 0.46) * (0.62 + 0.38 * t))) * (W / 2);
      return [limitar(x, -W / 2 + 0.3, W / 2 - 0.3), limitar(z, -D / 2 + 0.3, D / 2 - 0.3)];
    }
    /** Píxeles por metro en primer plano: una persona ocupa ~44 % de la altura. */
    const pxMetro = () => (CH * 0.44) / 1.8;

    /* ---------------- Figuras ---------------- */
    function crearFigura(id, op = {}) {
      const p = ctx.personaje(id) || {};
      const url = ctx.cuerpo(id);
      return {
        id,
        img: imagen(url),
        // Sin imagen de cuerpo entero: se usa el retrato (busto) como una aparición.
        busto: url === ctx.imagen(id),
        escala: op.escala || p.escala || 1,
        x: 0, z: 0, fase: Math.random() * 6, mira: 1, destello: 0,
        muerto: false, caida: 0, alpha: 1
      };
    }
    /** Dibuja una figura apoyada en el suelo. sinCabeza: recorta la parte superior. */
    /** Busto difuminado por abajo (o retrato SVG difuminado en círculo), preparado una vez. */
    const bustos = new Map();
    function lienzoBusto(img) {
      if (bustos.has(img)) return bustos.get(img);
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const b = c.getContext("2d");
      b.drawImage(img, 0, 0);
      b.globalCompositeOperation = "destination-in";
      // Óvalo difuminado: borra cualquier fondo cuadrado y funde el pecho con la oscuridad.
      b.translate(c.width / 2, c.height * 0.42);
      b.scale(1, c.height / c.width);
      const gr = b.createRadialGradient(0, 0, c.width * 0.18, 0, 0, c.width * 0.5);
      gr.addColorStop(0, "rgba(0,0,0,1)");
      gr.addColorStop(0.65, "rgba(0,0,0,.9)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      b.fillStyle = gr;
      b.fillRect(-c.width, -c.width, c.width * 2, c.width * 2);
      bustos.set(img, c);
      return c;
    }

    function dibujarFigura(f, extra = {}) {
      if (!lista(f.img)) return null;
      if (f.busto) return dibujarBusto(f, extra);
      const [sx, sy, esc] = aPantalla(f.x, f.z);
      const iw = f.img.naturalWidth, ih = f.img.naturalHeight;
      const alto = pxMetro() * 1.8 * esc * f.escala;
      const ancho = alto * iw / ih;
      const bob = extra.bob || 0;
      g.save();
      g.globalAlpha = f.alpha;
      // Sombra en el suelo
      g.fillStyle = "rgba(0,0,0,.45)";
      g.beginPath();
      g.ellipse(sx, sy, ancho * 0.32, alto * 0.035, 0, 0, PI * 2);
      g.fill();
      g.translate(sx, sy);
      if (f.caida > 0) g.rotate((f.mira > 0 ? -1 : 1) * (PI / 2) * f.caida);
      g.rotate(extra.giro || 0);
      g.scale(f.mira, 1);
      const corte = f.sinCabeza ? 0.16 : 0;
      const srcY = ih * corte;
      g.drawImage(f.img, 0, srcY, iw, ih - srcY, -ancho / 2, -alto + alto * corte - bob, ancho, alto * (1 - corte));
      if (f.destello > 0) {
        // Destello rojo al recibir un impacto: la misma silueta, teñida.
        g.globalAlpha = Math.min(1, f.destello * 5);
        g.filter = TINTE_ROJO;
        g.drawImage(f.img, 0, srcY, iw, ih - srcY, -ancho / 2, -alto + alto * corte - bob, ancho, alto * (1 - corte));
      }
      g.restore();
      return { sx, sy, alto, ancho };
    }

    function dibujarBusto(f, extra) {
      const [sx, sy, esc] = aPantalla(f.x, f.z);
      const lienzoB = lienzoBusto(f.img);
      const alto = pxMetro() * 1.05 * esc * f.escala;
      const ancho = alto * lienzoB.width / lienzoB.height;
      const elevacion = pxMetro() * 0.7 * esc * f.escala;
      g.save();
      g.globalAlpha = f.alpha * 0.95;
      g.fillStyle = "rgba(0,0,0,.35)";
      g.beginPath(); g.ellipse(sx, sy, ancho * 0.25, alto * 0.04, 0, 0, PI * 2); g.fill();
      g.translate(sx, sy - elevacion - (extra.bob || 0));
      if (f.caida > 0) { g.translate(0, elevacion * f.caida); g.rotate((f.mira > 0 ? -1 : 1) * (PI / 2) * f.caida); }
      g.rotate(extra.giro || 0);
      g.scale(f.mira, 1);
      const corte = f.sinCabeza ? 0.45 : 0;
      g.drawImage(lienzoB, 0, lienzoB.height * corte, lienzoB.width, lienzoB.height * (1 - corte), -ancho / 2, -alto + alto * corte, ancho, alto * (1 - corte));
      if (f.destello > 0) {
        g.globalAlpha = Math.min(1, f.destello * 5);
        g.filter = TINTE_ROJO;
        g.drawImage(lienzoB, 0, lienzoB.height * corte, lienzoB.width, lienzoB.height * (1 - corte), -ancho / 2, -alto + alto * corte, ancho, alto * (1 - corte));
      }
      g.restore();
      return { sx, sy, alto, ancho };
    }

    /* ---------------- Jugador ---------------- */
    const jugador = crearFigura(ctx.protagonista);
    const [ix, iz] = paso.inicio || [0, D / 2 - 1.6];
    jugador.x = ix; jugador.z = iz;
    let invulnerable = 0;
    let destino = null;           // {x, z, alLlegar?}
    const empuje = { x: 0, z: 0 };

    /* ---------------- Decorado gore (cadáveres, sangre, colgados) ---------------- */
    const decorado = [];
    for (const [tipo, x, z, , op] of paso.props || []) {
      if (tipo === "cadaver") decorado.push({ tipo, x, z, img: imagen(ctx.cuerpo(op || "zombi")) });
      else if (tipo === "colgado" && op !== "carne") decorado.push({ tipo, x, z, img: imagen(ctx.cuerpo(op || "zombi")), fase: Math.random() * 6 });
      else if (tipo === "sangre" || tipo === "visceras") decorado.push({ tipo, x, z, tam: op || 2 });
    }
    const charcos = [];
    function charco(x, z, tam) {
      if (charcos.length > 50) charcos.shift();
      charcos.push({ x, z, tam, crece: 0, forma: Array.from({ length: 7 }, () => 0.6 + Math.random() * 0.6) });
    }
    for (const d of decorado) if (d.tipo !== "colgado") charco(d.x, d.z, d.tipo === "cadaver" ? 1.6 : d.tam);
    charcos.forEach((c) => { c.crece = 1; });
    for (let i = 0; i < (paso.sangre ?? 4); i++) charco((Math.random() - 0.5) * W * 0.8, (Math.random() - 0.5) * D * 0.8, 0.6 + Math.random() * 1.4);
    charcos.forEach((c) => { c.crece = 1; });

    /* ---------------- Partículas de sangre (en pantalla) ---------------- */
    const gotas = [];
    function emitir(x, z, alturaM, n, fuerza = 1, arriba = 1) {
      const [sx, sy, esc] = aPantalla(x, z);
      const k = pxMetro() * esc;
      for (let i = 0; i < n && gotas.length < 600; i++) {
        gotas.push({
          x: sx, y: sy - alturaM * k, suelo: sy + (Math.random() - 0.3) * 18 * esc,
          vx: (Math.random() - 0.5) * 320 * fuerza * esc, vy: -(Math.random() * 300 * arriba + 60) * esc,
          r: (1.5 + Math.random() * 3.5) * esc, vida: 1.5 + Math.random()
        });
      }
    }
    const cabezas = [];   // cabezas que salen volando

    /* ---------------- Puntos, NPC, enemigos ---------------- */
    const visitados = new Set();
    const puntos = (paso.puntos || []).map((p, i) => ({ def: p, i, fase: i * 1.3 }));

    const salida = { x: 0, z: -D / 2, texto: "Seguir adelante", ...(paso.salida || {}) };
    const posPuerta = { x: limitar(salida.x, -W / 2 + 0.6, W / 2 - 0.6), z: limitar(salida.z, -D / 2 + 0.4, D / 2 - 0.4) };

    const npcs = (paso.npcs || []).map((n) => {
      const f = crearFigura(n.id, n);
      f.x = n.x; f.z = n.z;
      return { def: n, f, linea: 0, cd: 1 + Math.random() * 2, vel: 0 };
    });

    const enemigos = [];
    function crearEnemigo(def, susto = false) {
      const tipo = { ...ENEMIGO_BASE, ...(TIPOS_ENEMIGO[def.id] || {}), ...def };
      const f = crearFigura(def.figura || def.id, { escala: tipo.escala });
      f.x = def.x; f.z = def.z;
      const e = { def: tipo, f, vida: tipo.vida, cd: 1, aturdido: susto ? 0.6 : 0, alerta: Boolean(def.alerta || susto), muerto: false, vel: 0, gruñido: Math.random() * 4, pisada: 0 };
      // Algunos zombis están tirados en el suelo, como cadáveres... hasta que te acercas.
      const puedeDormir = ["zombi", "moldeado", "ganado", "majini"].includes(def.id);
      if (!susto && (def.dormido ?? (puedeDormir && Math.random() < 0.35))) {
        e.dormido = true;
        e.alerta = false;
        f.caida = 1;
      }
      enemigos.push(e);
      if (susto) { Efectos.susto(def.figura || def.id); emitir(def.x, def.z, 1.2, 30, 1, 1.5); }
      return e;
    }
    for (const def of paso.enemigos || []) crearEnemigo(def);

    const nombreDe = (id) => (ctx.personaje(id) || {}).nombre || id;

    /* ---------------- Textos y objetivo ---------------- */
    let temporizadorTexto = 0;
    function mostrarTexto(html, segundos = 7) {
      domTexto.innerHTML = html;
      domTexto.classList.remove("oculto");
      temporizadorTexto = segundos;
    }
    const enemigosVivos = () => enemigos.filter((e) => !e.muerto && !e.def.invencible).length;
    const requeridosPendientes = () => puntos.filter((p) => p.def.requerido && !visitados.has(p.i)).length;
    const puertaAbierta = () => requeridosPendientes() === 0 && (!paso.matar || enemigosVivos() === 0);
    function actualizarObjetivo() {
      const total = puntos.filter((p) => p.def.requerido).length;
      const partes = [];
      if (total) partes.push(`Pistas clave: ${total - requeridosPendientes()}/${total}`);
      if (paso.matar) partes.push(`Enemigos: ${enemigosVivos()}`);
      partes.push(puertaAbierta() ? `▸ ${salida.texto}` : "Salida bloqueada");
      domObjetivo.textContent = partes.join(" · ");
      domObjetivo.classList.toggle("abierta", puertaAbierta());
      domMunicion.textContent = ctx.municion();
    }

    /* ---------------- Entrada ---------------- */
    const teclas = new Set();
    const joy = { x: 0, y: 0, activo: false };
    const escribiendo = () => ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
    const MOVER = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"];
    function alPulsar(e) {
      if (escribiendo() || ctx.pausado()) return;
      // Agarrado: cualquier tecla de acción sirve para forcejear.
      if (agarre) {
        if (!e.repeat && ["KeyE", "Space", "Enter", "KeyF"].includes(e.code)) { e.preventDefault(); forcejear(); }
        return;
      }
      if (MOVER.includes(e.code)) { teclas.add(e.code); destino = null; e.preventDefault(); }
      if (e.repeat) return;
      if (e.code === "KeyQ") { apuntando = true; destino = null; }
      if (e.code === "KeyE" || e.code === "Enter") { e.preventDefault(); interactuar(); }
      if (e.code === "Space" || e.code === "KeyF") { e.preventDefault(); disparar(); }
      if (e.code === "KeyC") cuchillada();
    }
    const alSoltar = (e) => { teclas.delete(e.code); if (e.code === "KeyQ") apuntando = false; };
    const alPerderFoco = () => { teclas.clear(); apuntando = false; };
    // Clic derecho mantenido: apuntar (como en los Resident Evil modernos).
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("pointerdown", (e) => { if (e.button === 2) { apuntando = true; destino = null; } }, true);
    window.addEventListener("pointerup", (e) => { if (e.button === 2) apuntando = false; });
    document.addEventListener("keydown", alPulsar);
    document.addEventListener("keyup", alSoltar);
    window.addEventListener("blur", alPerderFoco);

    // Clic / toque en la escena: enemigo → disparar; punto, aliado o puerta → ir y usar; suelo → ir.
    canvas.addEventListener("pointerdown", (e) => {
      if (ctx.pausado() || e.button === 2) return;
      if (agarre) { forcejear(); return; }
      if (apuntando) { disparar(); return; }
      const r = canvas.getBoundingClientRect();
      const [px, py] = deVista((e.clientX - r.left) * CW / (r.width || 1), (e.clientY - r.top) * CH / (r.height || 1));
      const enemigo = elementoBajo(px, py, enemigos.filter((x) => !x.muerto).map((x) => ({ ref: x, f: x.f })));
      if (enemigo) { disparar(enemigo.ref); return; }
      for (const p of puntos) {
        const [sx, sy, esc] = aPantalla(p.def.x, p.def.z);
        const yb = sy - (p.def.altura ?? 0.7) * pxMetro() * esc * 0.6;
        if (Math.hypot(px - sx, py - yb) < 34 * Math.max(0.7, esc)) { irA(p.def.x, p.def.z, () => usar({ tipo: "punto", ref: p })); return; }
      }
      const npc = elementoBajo(px, py, npcs.map((n) => ({ ref: n, f: n.f })));
      if (npc) { irA(npc.ref.f.x, npc.ref.f.z, () => usar({ tipo: "npc", ref: npc.ref })); return; }
      const [dx, dy] = aPantalla(posPuerta.x, posPuerta.z);
      if (Math.abs(px - dx) < 60 && py < dy + 30 && py > dy - pxMetro() * 0.9) { irA(posPuerta.x, posPuerta.z, () => usar({ tipo: "puerta" })); return; }
      if (py > yHorizonte()) { const [wx, wz] = aMundo(px, py); irA(wx, wz); }
    });
    function elementoBajo(px, py, elementos) {
      let mejor = null, zMax = -Infinity;
      for (const el of elementos) {
        if (!lista(el.f.img)) continue;
        const [sx, sy, esc] = aPantalla(el.f.x, el.f.z);
        const alto = pxMetro() * 1.8 * esc * el.f.escala;
        const ancho = alto * el.f.img.naturalWidth / el.f.img.naturalHeight;
        if (px > sx - ancho * 0.4 && px < sx + ancho * 0.4 && py < sy && py > sy - alto && el.f.z > zMax) { zMax = el.f.z; mejor = el; }
      }
      return mejor;
    }
    function irA(x, z, alLlegar) {
      destino = { x: limitar(x, -W / 2 + 0.3, W / 2 - 0.3), z: limitar(z, -D / 2 + 0.3, D / 2 - 0.3), alLlegar };
    }

    // Joystick táctil
    const zonaJoy = contenedor.querySelector(".exp-joystick");
    const palanca = contenedor.querySelector(".exp-palanca");
    let idJoy = null;
    function moverJoy(e) {
      const r = zonaJoy.getBoundingClientRect();
      let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      const m = Math.hypot(x, y);
      if (m > 1) { x /= m; y /= m; }
      joy.x = x; joy.y = y;
      palanca.style.transform = `translate(${x * 40}px, ${y * 40}px)`;
    }
    zonaJoy.addEventListener("pointerdown", (e) => { idJoy = e.pointerId; joy.activo = true; destino = null; zonaJoy.setPointerCapture(e.pointerId); moverJoy(e); e.preventDefault(); });
    zonaJoy.addEventListener("pointermove", (e) => { if (e.pointerId === idJoy) moverJoy(e); });
    const soltarJoy = (e) => { if (e.pointerId !== idJoy) return; idJoy = null; joy.activo = false; joy.x = joy.y = 0; palanca.style.transform = ""; };
    zonaJoy.addEventListener("pointerup", soltarJoy);
    zonaJoy.addEventListener("pointercancel", soltarJoy);
    contenedor.querySelectorAll(".exp-botones button").forEach((b) => b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (ctx.pausado()) return;
      if (agarre) { forcejear(); return; }
      if (b.dataset.b === "apuntar") { apuntando = !apuntando; b.classList.toggle("activo", apuntando); return; }
      ({ accion: interactuar, disparar: () => disparar(), cuchillo: cuchillada })[b.dataset.b]();
    }));
    domAgarre.addEventListener("pointerdown", (e) => { e.preventDefault(); forcejear(); });

    /* ---------------- Interacción ---------------- */
    function objetivoCercano() {
      let mejor = null, dMin = 1.7;
      const probar = (tipo, ref, x, z, extra = 0) => {
        const d = Math.hypot(x - jugador.x, (z - jugador.z) * 1.3) + extra;
        if (d < dMin) { dMin = d; mejor = { tipo, ref }; }
      };
      for (const p of puntos) probar("punto", p, p.def.x, p.def.z, visitados.has(p.i) ? 0.6 : 0);
      for (const n of npcs) probar("npc", n, n.f.x, n.f.z, 0.2);
      probar("puerta", null, posPuerta.x, posPuerta.z, 0);
      return mejor;
    }
    function interactuar() {
      const o = objetivoCercano();
      if (o) usar(o);
    }
    function usar(o) {
      if (!activo) return;
      if (o.tipo === "punto") {
        const p = o.ref;
        const primera = !visitados.has(p.i);
        mostrarTexto(`<p><strong>${escapar(p.def.nombre)}.</strong> ${escapar(p.def.texto)}</p>`);
        Sonido.tecla();
        if (!primera) return;
        visitados.add(p.i);
        terror.subir(0.12);
        const accion = p.def.accion || {};
        if (accion.sangre) { emitir(p.def.x, p.def.z, 0.8, 25, 0.7, 1); charco(p.def.x, p.def.z, 1.2); Sonido.golpe(); }
        if (ctx.examinar(p.def) === false) return;
        if (accion.aparecen) { for (const d of accion.aparecen) crearEnemigo(d, true); Efectos.temblor(); }
        actualizarObjetivo();
      } else if (o.tipo === "npc") {
        const n = o.ref;
        const lineas = n.def.lineas || [n.def.texto || "..."];
        const t = lineas[n.linea % lineas.length];
        n.linea++;
        const p = ctx.personaje(n.def.id) || {};
        mostrarTexto(`<div class="exp-dialogo"><img src="${escapar(ctx.imagen(n.def.id))}" alt=""><p><strong style="color:${p.color || "#ccc"}">${escapar(nombreDe(n.def.id))}:</strong> «${escapar(t)}»</p></div>`, 8);
        if (ctx.hablar) ctx.hablar(n.def.id, t);
        Sonido.mensaje(false);
      } else if (o.tipo === "puerta") {
        if (!puertaAbierta()) {
          const faltan = requeridosPendientes();
          const motivo = faltan ? `Te faltan ${faltan} pista${faltan > 1 ? "s" : ""} clave por examinar (brillan en dorado).` : "Aún quedan enemigos con vida. Acaba con ellos.";
          mostrarTexto(`<p><strong>La salida está bloqueada.</strong> ${motivo}</p>`, 4);
          Sonido.error();
          return;
        }
        Sonido.tecla();
        terminar();
        ctx.salir();
      }
    }

    /* ---------------- Combate ---------------- */
    let cdDisparo = 0, cdCuchillo = 0, fogonazo = 0, sacudida = 0, retroceso = 0, apuntando = false;
    function enemigoEnMira(alcance, soloDelante) {
      let mejor = null, dMin = alcance;
      for (const e of enemigos) {
        if (e.muerto) continue;
        const dx = e.f.x - jugador.x, d = Math.hypot(dx, e.f.z - jugador.z);
        if (soloDelante && Math.sign(dx) !== jugador.mira && Math.abs(dx) > 0.8) continue;
        if (d < dMin) { dMin = d; mejor = e; }
      }
      return mejor || (soloDelante ? enemigoEnMira(alcance, false) : null);
    }
    function disparar(objetivo) {
      if (cdDisparo > 0) return;
      cdDisparo = 0.38;
      if (!ctx.gastarMunicion()) {
        mostrarTexto("<p><strong>*Clic*</strong> Sin munición. Usa el cuchillo (C) o busca balas.</p>", 3);
        Sonido.error();
        return;
      }
      Sonido.disparo();
      fogonazo = 1;
      domMunicion.textContent = ctx.municion();
      retroceso = 1;
      const e = objetivo && !objetivo.muerto ? objetivo : enemigoEnMira(17, true);
      if (!e) return;
      jugador.mira = e.f.x >= jugador.x ? 1 : -1;
      const d = Math.hypot(e.f.x - jugador.x, e.f.z - jugador.z);
      // Apuntando con el láser se acierta mucho más a la cabeza (y se tarda más en disparar).
      const prob = apuntando ? (d < 12 ? 0.62 : 0.4) : (d < 4 ? 0.3 : 0.14);
      if (apuntando) cdDisparo = 0.55;
      const cabeza = Math.random() < prob;
      herirEnemigo(e, cabeza ? 3 : 1, cabeza);
    }

    /* ---------------- Agarres (forcejeo) ---------------- */
    let agarre = null;   // { e, t, pulsos, meta }
    function iniciarAgarre(e) {
      agarre = { e, t: 2.2, pulsos: 0, meta: 7 + Math.floor(Math.random() * 3) };
      teclas.clear(); destino = null; apuntando = false;
      domAgarre.hidden = false;
      domAgarreBarra.style.width = "0%";
      Sonido.stinger();
      Sonido.gemido();
      sacudida = 0.5;
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
    }
    function forcejear() {
      if (!agarre) return;
      agarre.pulsos++;
      Sonido.golpeSeco();
      domAgarreBarra.style.width = `${Math.min(100, (agarre.pulsos / agarre.meta) * 100)}%`;
      sacudida = 0.12;
      if (agarre.pulsos >= agarre.meta) terminarAgarre(true);
    }
    function terminarAgarre(libre) {
      if (!agarre) return;
      const e = agarre.e;
      agarre = null;
      domAgarre.hidden = true;
      const dx = e.f.x - jugador.x, dz = e.f.z - jugador.z, d = Math.hypot(dx, dz) || 1;
      if (libre) {
        // Te lo quitas de encima de un empujón: queda aturdido unos segundos.
        mover(e.f, (dx / d) * 1.4, (dz / d) * 1.4);
        e.aturdido = 1.6;
        invulnerable = 1.2;
        mostrarTexto("<p><strong>Te lo quitas de encima de un empujón.</strong> Ahora: dispárale a la cabeza.</p>", 3);
      } else {
        emitir(jugador.x, jugador.z, 1.5, 50, 1.2, 1.4);
        charco(jugador.x, jugador.z, 1.1);
        Efectos.salpicar(0.9);
        mostrarTexto(`<p class="exp-gore">${escapar(e.def.mordisco || "Te hunde los dientes en el cuello y arranca un trozo de carne. Notas la sangre caliente bajando por la espalda.")}</p>`, 4);
        invulnerable = 1.4;
        e.aturdido = 0.8;
        if (!ctx.herir(Math.round(e.def.dano * 1.5), e.def.muerte || "Te mordió el cuello hasta llegar al hueso. Te desangraste en el suelo mientras seguía comiendo.")) { terminar(); }
      }
    }
    function cuchillada() {
      if (cdCuchillo > 0) return;
      cdCuchillo = 0.5;
      Sonido.golpeSeco();
      const e = enemigoEnMira(1.9, true);
      if (e) herirEnemigo(e, 0.6, false);
    }
    function herirEnemigo(e, dano, cabeza) {
      if (e.dormido) despertar(e);
      e.alerta = true;
      e.f.destello = 0.15;
      e.aturdido = Math.max(e.aturdido, cabeza ? 0.8 : 0.35);
      emitir(e.f.x, e.f.z, cabeza ? 1.65 * e.f.escala : 1.1 * e.f.escala, cabeza ? 45 : 20, cabeza ? 1.3 : 0.9, 1.2);
      if (Math.random() < 0.5) charco(e.f.x + (Math.random() - 0.5), e.f.z + (Math.random() - 0.5) * 0.6, 0.6 + Math.random() * 0.5);
      Sonido.golpe();
      e.vida -= dano;
      if (e.vida > 0) return;
      if (e.def.invencible) {
        e.vida = e.def.vida;
        e.aturdido = 4.5;
        mostrarTexto(`<p><strong>${escapar(nombreDe(e.def.figura || e.def.id))}</strong> ${escapar(e.def.aturdido || "hinca una rodilla, chorreando sangre... pero se volverá a levantar. ¡CORRE!")}</p>`, 4);
        return;
      }
      matarEnemigo(e, cabeza);
    }
    function matarEnemigo(e, cabeza) {
      e.muerto = true;
      if (cabeza && lista(e.f.img)) {
        // Decapitación: la parte superior de la imagen sale volando.
        const [sx, sy, esc] = aPantalla(e.f.x, e.f.z);
        const alto = pxMetro() * 1.8 * esc * e.f.escala;
        e.f.sinCabeza = true;
        cabezas.push({
          img: e.f.img, x: sx, y: sy - alto * 0.92, suelo: sy, alto: alto * 0.16, mira: e.f.mira,
          vx: (Math.random() - 0.5) * 260 * esc, vy: -(280 + Math.random() * 200) * esc, giro: 0, vgiro: (Math.random() - 0.5) * 14
        });
        e.fuente = 1.6;
        mostrarTexto(`<p class="exp-gore">${escapar(elegir(DECAPITACIONES))}</p>`, 4);
      } else {
        mostrarTexto(`<p class="exp-gore">${escapar(e.def.remate || elegir(REMATES))}</p>`, 4);
      }
      emitir(e.f.x, e.f.z, 1, 60, 1.2, 1.5);
      charco(e.f.x, e.f.z, 1.6 + e.f.escala * 0.5);
      Efectos.salpicar(0.35);
      actualizarObjetivo();
      if (paso.matar && enemigosVivos() === 0 && requeridosPendientes() === 0) {
        setTimeout(() => { if (activo) mostrarTexto("<p><strong>La sala está despejada.</strong> El silencio vuelve... por ahora. La salida está abierta.</p>", 5); }, 1800);
      }
    }

    /** Un "cadáver" del suelo se levanta. */
    function despertar(e) {
      e.dormido = false;
      e.levantando = 1.3;
      e.alerta = true;
      Sonido.stinger();
      Sonido.gemido();
      sacudida = 0.25;
      terror.subir(0.3);
      mostrarTexto("<p class=\"exp-gore\">El cadáver del suelo se mueve. Gira la cabeza hacia ti con un crujido de vértebras... y se levanta.</p>", 3.5);
    }

    /* ---------------- Movimiento ---------------- */
    function mover(f, dx, dz) {
      f.x = limitar(f.x + dx, -W / 2 + 0.3, W / 2 - 0.3);
      f.z = limitar(f.z + dz, -D / 2 + 0.3, D / 2 - 0.3);
    }

    /* ---------------- Ambiente de terror ---------------- */
    let quieto = 0, apagonTerror = 0, polvoTecho = 0;
    const siluetas = [];   // figuras que cruzan al fondo, en la oscuridad
    const ojos = [];       // ojos que te miran desde la negrura
    const motas = [];      // polvo en suspensión iluminado por la linterna
    const figuraSombra = imagen(ctx.cuerpo(paso.sombra || "zombi"));
    const terror = typeof Terror !== "undefined" ? Terror.crear({
      tema: ctx.tema, reducir: ctx.reducir,
      sala: {
        apagon: (s) => { apagonTerror = s; },
        silueta: (lado) => siluetas.push({ lado, t: 0, dur: 0.85 + Math.random() * 0.4, z: -D / 2 + 1 + Math.random() * 2 }),
        ojos: () => {
          const lejos = jugador.x > 0 ? -1 : 1;
          ojos.push({ x: lejos * (W * 0.25 + Math.random() * W * 0.2), z: -D / 2 + 1 + Math.random() * D * 0.35, t: 0, dur: 2.2 + Math.random(), color: Math.random() < 0.5 ? "255,40,30" : "255,200,60" });
        },
        sacudir: (v) => { sacudida = Math.max(sacudida, v); },
        polvo: () => { polvoTecho = 2.5; }
      }
    }) : { actualizar() {}, subir() {}, destruir() {} };

    /* ---------------- Bucle ---------------- */
    let tensionActiva = false;
    let activo = true, raf = 0, ultimo = performance.now(), reloj = 0, avisoAnterior = "", parpadeo = 1, apagon = 0;

    function actualizar(dt) {
      reloj += dt;
      cdDisparo -= dt; cdCuchillo -= dt; invulnerable -= dt;
      fogonazo = Math.max(0, fogonazo - dt * 8);

      /* Jugador */
      let mx = 0, mz = 0;
      if (teclas.has("KeyW") || teclas.has("ArrowUp")) mz -= 1;
      if (teclas.has("KeyS") || teclas.has("ArrowDown")) mz += 1;
      if (teclas.has("KeyA") || teclas.has("ArrowLeft")) mx -= 1;
      if (teclas.has("KeyD") || teclas.has("ArrowRight")) mx += 1;
      let correr = teclas.has("ShiftLeft") || teclas.has("ShiftRight");
      if (joy.activo) { mx = joy.x; mz = joy.y; correr = Math.hypot(joy.x, joy.y) > 0.85; }
      // Agarrado o apuntando: no te puedes mover (como en los RE clásicos).
      if (agarre) {
        agarre.t -= dt;
        if (agarre.t <= 0) terminarAgarre(false);
        mx = mz = 0; destino = null;
        if (!activo) return;
      }
      if (apuntando) {
        mx = mz = 0; destino = null;
        const blanco = enemigoEnMira(17, true);
        if (blanco) jugador.mira = blanco.f.x >= jugador.x ? 1 : -1;
      }
      if (!mx && !mz && destino) {
        const dx = destino.x - jugador.x, dz = destino.z - jugador.z, d = Math.hypot(dx, dz);
        if (d < 0.5) { const cb = destino.alLlegar; destino = null; if (cb) cb(); }
        else { mx = dx / d; mz = dz / d; correr = d > 4; }
      }
      const m = Math.hypot(mx, mz);
      const vel = m > 0.1 ? (correr ? 4.2 : 2.4) : 0;
      if (m > 0.1) {
        mover(jugador, (mx / Math.max(1, m)) * vel * dt, (mz / Math.max(1, m)) * vel * dt * 0.8);
        if (Math.abs(mx) > 0.2) jugador.mira = mx > 0 ? 1 : -1;
        const antes = Math.floor(jugador.fase / PI);
        jugador.fase += dt * (4 + vel * 2.5);
        if (Math.floor(jugador.fase / PI) !== antes) Sonido.paso();
      }
      jugador.vel = vel;
      mover(jugador, empuje.x * dt, empuje.z * dt);
      empuje.x *= Math.exp(-dt * 6); empuje.z *= Math.exp(-dt * 6);

      /* NPC */
      for (const n of npcs) {
        const f = n.f;
        n.vel = 0;
        if (n.def.sigue) {
          const dx = jugador.x - f.x, dz = jugador.z - f.z, d = Math.hypot(dx, dz);
          if (d > 1.8) { n.vel = Math.min(4, d * 1.2); mover(f, (dx / d) * n.vel * dt, (dz / d) * n.vel * dt); if (Math.abs(dx) > 0.2) f.mira = dx > 0 ? 1 : -1; f.fase += dt * (4 + n.vel * 2.5); }
          n.cd -= dt;
          if (n.def.dispara !== false && n.cd <= 0) {
            let blanco = null, dB = 9;
            for (const e of enemigos) { if (e.muerto) continue; const de = Math.hypot(e.f.x - f.x, e.f.z - f.z); if (de < dB) { dB = de; blanco = e; } }
            if (blanco) { n.cd = 1.6 + Math.random() * 1.2; f.mira = blanco.f.x > f.x ? 1 : -1; Sonido.disparo(0.5); herirEnemigo(blanco, 1, Math.random() < 0.15); }
            else n.cd = 0.5;
          }
        } else {
          f.mira = jugador.x > f.x ? 1 : -1;
        }
      }

      /* Enemigos */
      for (const e of enemigos) {
        const f = e.f;
        if (e.muerto) {
          if (f.caida < 1) f.caida = Math.min(1, f.caida + dt * 2.4);
          if (e.fuente > 0) { e.fuente -= dt; emitir(f.x, f.z, 1.5 * f.escala * (1 - f.caida * 0.8), 4, 0.4, 1.8); }
          continue;
        }
        const dx = jugador.x - f.x, dz = jugador.z - f.z, d = Math.hypot(dx, dz);
        // Tirado en el suelo: no se mueve hasta que pasas cerca.
        if (e.dormido) {
          if (d < 2.4) despertar(e);
          continue;
        }
        if (e.levantando > 0) {
          e.levantando -= dt;
          f.caida = Math.max(0, e.levantando / 1.3);
          continue;
        }
        if (agarre && agarre.e === e) continue;
        if (!e.alerta && d < e.def.rango) { e.alerta = true; Sonido.grunido(); }
        e.cd -= dt;
        e.vel = 0;
        // Pasos del perseguidor (Mr. X, Némesis, Jack...): retumban por la sala aunque no lo veas.
        if (e.def.invencible && e.alerta) {
          e.pisada -= dt;
          if (e.pisada <= 0) { e.pisada = 0.7; Sonido.golpeSordo(limitar(-dx / (W / 2), -1, 1)); if (d < 5) sacudida = Math.max(sacudida, 0.06); }
        }
        if (e.aturdido > 0) {
          e.aturdido -= dt;
        } else if (e.alerta && d > 0.85 + f.escala * 0.15) {
          e.vel = e.def.vel * (d > 6 && e.def.vel < 1.5 ? 1.25 : 1);
          mover(f, (dx / d) * e.vel * dt, (dz / d) * e.vel * dt);
          for (const o of enemigos) {
            if (o === e || o.muerto) continue;
            const sx = f.x - o.f.x, sz = f.z - o.f.z, s = Math.hypot(sx, sz);
            if (s < 0.7 && s > 0.001) mover(f, (sx / s) * dt, (sz / s) * dt);
          }
          f.mira = dx > 0 ? 1 : -1;
          f.fase += dt * (4 + e.vel * 2.5);
        } else if (e.alerta && e.cd <= 0 && invulnerable <= 0 && ctx.activo() && !agarre
          && !e.def.invencible && ["zombi", "ganado", "majini", "moldeado", "monje", "jo", "licantropo"].includes(e.def.id) && Math.random() < 0.45) {
          // Te agarra: hay que forcejear para soltarse (o te muerde).
          e.cd = (e.def.cadencia || 1.5) + 1;
          iniciarAgarre(e);
        } else if (e.alerta && e.cd <= 0 && invulnerable <= 0 && ctx.activo() && !agarre) {
          e.cd = e.def.cadencia || 1.5;
          invulnerable = 0.8;
          sacudida = 0.35;
          emitir(jugador.x, jugador.z, 1.3, 30, 1, 1);
          charco(jugador.x, jugador.z, 0.8);
          empuje.x = -dx / d * 6; empuje.z = -dz / d * 6;
          if (e.def.ataque) mostrarTexto(`<p class="exp-gore">${escapar(e.def.ataque)}</p>`, 3);
          if (!ctx.herir(e.def.dano, e.def.muerte)) { terminar(); return; }
        }
        e.gruñido -= dt;
        if (e.alerta && d < 7 && e.gruñido <= 0) { e.gruñido = 3 + Math.random() * 4; Sonido.gemido(); }
      }

      /* Música de tensión mientras algo te persigue */
      const persiguen = enemigos.some((e) => !e.muerto && e.alerta && !e.dormido);
      if (persiguen !== tensionActiva) { tensionActiva = persiguen; Sonido.tension(persiguen); }

      /* Director del miedo + efectos de ambiente */
      quieto = jugador.vel > 0 ? 0 : quieto + dt;
      terror.actualizar(dt, { persiguen, salud: ctx.salud ? ctx.salud() : 1, quieto });
      retroceso = Math.max(0, retroceso - dt * 7);
      if (apagonTerror > 0) apagonTerror -= dt;
      for (let i = siluetas.length - 1; i >= 0; i--) { const s = siluetas[i]; s.t += dt; if (s.t > s.dur) siluetas.splice(i, 1); }
      for (let i = ojos.length - 1; i >= 0; i--) { const o = ojos[i]; o.t += dt; if (o.t > o.dur) ojos.splice(i, 1); }
      if (!motas.length && CW > 10) {
        for (let i = 0; i < (ctx.reducir ? 30 : 90); i++) motas.push({ x: Math.random() * CW, y: Math.random() * CH, vx: (Math.random() - 0.5) * 8, vy: -2 - Math.random() * 7, r: 0.6 + Math.random() * 1.6, f: Math.random() * 6 });
      }
      for (const m of motas) {
        m.x += (m.vx + Math.sin(reloj * 0.4 + m.f) * 4) * dt; m.y += m.vy * dt;
        if (m.y < -10 || m.x < -10 || m.x > CW + 10) { m.x = Math.random() * CW; m.y = CH + 5; }
      }
      if (polvoTecho > 0) polvoTecho -= dt;

      /* Partículas y cabezas */
      for (let i = gotas.length - 1; i >= 0; i--) {
        const p = gotas[i];
        p.vida -= dt;
        if (p.y < p.suelo) { p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
        else { p.y = p.suelo; p.vx = 0; p.vida = Math.min(p.vida, 2); }
        if (p.vida <= 0) gotas.splice(i, 1);
      }
      for (const c of cabezas) {
        if (c.vy === null) continue;
        c.vy += 900 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.giro += c.vgiro * dt;
        if (c.y >= c.suelo - c.alto * 0.4) { c.y = c.suelo - c.alto * 0.4; c.vy = null; Sonido.golpeSeco(); }
      }
      for (const c of charcos) if (c.crece < 1) c.crece = Math.min(1, c.crece + dt * 0.5);

      /* Luz: parpadeo de la escena */
      if (apagon > 0) { apagon -= dt; parpadeo = 0.35; }
      else { if (Math.random() < dt * 0.25) apagon = 0.05 + Math.random() * 0.2; parpadeo = 0.92 + Math.random() * 0.08; }

      /* Aviso de interacción */
      const o = objetivoCercano();
      let aviso = "";
      if (o) {
        if (o.tipo === "punto") aviso = `${visitados.has(o.ref.i) ? "Volver a mirar" : "Examinar"}: ${o.ref.def.nombre}`;
        else if (o.tipo === "npc") aviso = `Hablar con ${nombreDe(o.ref.def.id)}`;
        else aviso = puertaAbierta() ? salida.texto : "Salida bloqueada";
      }
      if (aviso !== avisoAnterior) {
        avisoAnterior = aviso;
        domAviso.innerHTML = aviso ? `<kbd>${esMovil ? "✋" : "E"}</kbd> ${escapar(aviso)}` : "";
        domAviso.classList.toggle("visible", Boolean(aviso));
        domAccion.textContent = o ? (o.tipo === "npc" ? "Hablar" : o.tipo === "puerta" ? "Salir" : "Examinar") : "Usar";
      }
      if (temporizadorTexto > 0) { temporizadorTexto -= dt; if (temporizadorTexto <= 0) domTexto.classList.add("oculto"); }
    }

    /* ---------------- Dibujo ---------------- */
    function dibujarFondo() {
      g.fillStyle = "#050505";
      g.fillRect(0, 0, CW, CH);
      if (lista(fondo)) {
        const s = Math.max(CW / fondo.naturalWidth, CH / fondo.naturalHeight);
        const w = fondo.naturalWidth * s, h = fondo.naturalHeight * s;
        // Ligerísimo desplazamiento según la posición del jugador (paralaje).
        const px = -jugador.x / W * Math.max(0, w - CW) * 0.6, py = -(jugador.z / D) * Math.max(0, h - CH) * 0.3;
        // Con la cámara 3D, la pared del fondo se mueve más despacio que el suelo (profundidad).
        const lejos = conCamara ? 0.3 : 0;
        const ox = (cam.x - CW / 2) * lejos, oy = (cam.y - CH / 2) * lejos * 0.5;
        const extra = conCamara ? 1.06 : 1;
        g.drawImage(fondo, (CW - w * extra) / 2 + px + ox, (CH - h * extra) / 2 + py + oy, w * extra, h * extra);
      }
      // El suelo se oscurece un poco para que las figuras destaquen.
      const grad = g.createLinearGradient(0, yHorizonte() - 40, 0, CH);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,.45)");
      g.fillStyle = grad;
      g.fillRect(0, yHorizonte() - 40, CW, CH);
    }

    function dibujarCharco(c) {
      const [sx, sy, esc] = aPantalla(c.x, c.z);
      const r = c.tam * c.crece * pxMetro() * esc * 0.5;
      // Sangre espesa: centro casi negro, borde rojo y un brillo húmedo de la luz.
      const gr = g.createRadialGradient(sx - r * 0.2, sy - r * 0.08, r * 0.05, sx, sy, r * 1.1);
      gr.addColorStop(0, "rgba(20,0,0,.92)");
      gr.addColorStop(0.7, "rgba(75,0,0,.85)");
      gr.addColorStop(1, "rgba(110,4,4,.55)");
      g.fillStyle = gr;
      g.beginPath();
      c.forma.forEach((k, i) => {
        const a = (i / c.forma.length) * PI * 2;
        const x = sx + Math.cos(a) * r * k, y = sy + Math.sin(a) * r * k * 0.3;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      });
      g.closePath();
      g.fill();
      if (r > 4) {
        g.fillStyle = "rgba(255,190,170,.16)";
        g.beginPath(); g.ellipse(sx - r * 0.25, sy - r * 0.06, r * 0.28, r * 0.05, -0.1, 0, PI * 2); g.fill();
      }
    }

    function dibujarDecorado(d) {
      const [sx, sy, esc] = aPantalla(d.x, d.z);
      if (d.tipo === "cadaver" && lista(d.img)) {
        const alto = pxMetro() * 1.7 * esc, ancho = alto * d.img.naturalWidth / d.img.naturalHeight;
        g.save(); g.translate(sx, sy); g.rotate(-PI / 2); g.filter = "brightness(.55) sepia(.3)";
        g.drawImage(d.img, -ancho / 2, -alto * 0.95, ancho, alto); g.restore();
      } else if (d.tipo === "colgado" && lista(d.img)) {
        const alto = pxMetro() * 1.6 * esc, ancho = alto * d.img.naturalWidth / d.img.naturalHeight;
        const oscila = Math.sin(reloj * 0.9 + d.fase) * 0.05;
        const top = sy - alto * 1.5;
        g.save(); g.strokeStyle = "#3a2a18"; g.lineWidth = 2 * esc; g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx, top); g.stroke();
        g.translate(sx, top); g.rotate(oscila); g.filter = "brightness(.55) sepia(.4)";
        g.drawImage(d.img, -ancho / 2, 0, ancho, alto); g.restore();
      } else if (d.tipo === "visceras") {
        g.fillStyle = "#6a0a0a";
        for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(sx + Math.sin(i * 7) * 30 * esc, sy + Math.cos(i * 5) * 8 * esc, 8 * esc, 4 * esc, i, 0, PI * 2); g.fill(); }
      }
    }

    function dibujarBrillo(p) {
      if (visitados.has(p.i)) return;
      const [sx, sy, esc] = aPantalla(p.def.x, p.def.z);
      const y = sy - (p.def.altura ?? 0.7) * pxMetro() * esc * 0.6;
      const r = (10 + Math.sin(reloj * 3 + p.fase) * 3) * Math.max(0.7, esc) * (p.def.requerido ? 1.3 : 1);
      const color = p.def.requerido ? "255,207,74" : "190,230,255";
      const grad = g.createRadialGradient(sx, y, 0, sx, y, r * 3);
      grad.addColorStop(0, `rgba(${color},.95)`);
      grad.addColorStop(0.25, `rgba(${color},.45)`);
      grad.addColorStop(1, `rgba(${color},0)`);
      g.fillStyle = grad;
      g.beginPath(); g.arc(sx, y, r * 3, 0, PI * 2); g.fill();
      g.save(); g.translate(sx, y); g.rotate(reloj * 0.8 + p.fase);
      g.fillStyle = `rgba(${color},1)`;
      g.fillRect(-r * 2, -1, r * 4, 2); g.fillRect(-1, -r * 2, 2, r * 4);
      g.restore();
    }

    function dibujarPuerta() {
      const [sx, sy, esc] = aPantalla(posPuerta.x, posPuerta.z);
      const abierta = puertaAbierta();
      const pulso = 0.6 + Math.sin(reloj * 4) * 0.4;
      const color = abierta ? `rgba(60,255,107,${0.5 + pulso * 0.4})` : "rgba(220,30,30,.55)";
      const alto = pxMetro() * 2.1 * esc, ancho = alto * 0.5;
      g.save();
      g.strokeStyle = color; g.lineWidth = 3; g.shadowColor = color; g.shadowBlur = 18;
      g.strokeRect(sx - ancho / 2, sy - alto, ancho, alto);
      g.fillStyle = abierta ? "rgba(60,255,107,.08)" : "rgba(220,30,30,.06)";
      g.fillRect(sx - ancho / 2, sy - alto, ancho, alto);
      g.shadowBlur = 0;
      g.font = `600 ${Math.round(13 * Math.max(0.8, esc))}px Oswald, sans-serif`;
      g.textAlign = "center";
      g.fillStyle = color;
      g.fillText(abierta ? "▲ SALIDA" : "🔒", sx, sy - alto - 8);
      g.restore();
    }

    /** Posición en pantalla de la mano del jugador (de donde salen la linterna y el láser). */
    function manoJugador() {
      const [sx, sy, esc] = aPantalla(jugador.x, jugador.z);
      const alto = pxMetro() * 1.8 * esc * jugador.escala;
      return [sx + jugador.mira * alto * 0.13, sy - alto * 0.6, esc, alto];
    }
    /** Ángulo del haz: hacia donde mira, inclinado hacia el suelo, con temblor de pulso. */
    function anguloHaz() {
      const base = jugador.mira > 0 ? 0.12 : PI - 0.12;
      return base + Math.sin(reloj * 1.3) * 0.03 + Math.sin(reloj * 3.7) * 0.012 * (1 + jugador.vel * 0.3);
    }

    /** Niebla baja que se arrastra por el suelo. */
    function dibujarNiebla() {
      const y0 = yHorizonte();
      g.save();
      g.globalCompositeOperation = "screen";
      for (let i = 0; i < 3; i++) {
        const k = (reloj * (8 + i * 5) + i * 400) % (CW * 2) - CW * 0.5;
        const y = y0 + (CH - y0) * (0.25 + i * 0.28);
        const gr = g.createRadialGradient(k, y, 0, k, y, CW * 0.6);
        gr.addColorStop(0, `rgba(140,150,165,${0.07 - i * 0.012})`);
        gr.addColorStop(1, "rgba(140,150,165,0)");
        g.fillStyle = gr;
        g.fillRect(k - CW * 0.6, y - CH * 0.25, CW * 1.2, CH * 0.5);
      }
      g.restore();
    }

    function dibujarLinterna() {
      if (sombra.width !== canvas.width || sombra.height !== canvas.height) { sombra.width = canvas.width; sombra.height = canvas.height; }
      gs.setTransform(DPR, 0, 0, DPR, 0, 0);
      gs.globalCompositeOperation = "source-over";
      gs.clearRect(0, 0, CW, CH);
      // Apagón del director del miedo: oscuridad casi total y la linterna falla.
      const fallo = apagonTerror > 0;
      const negrura = fallo ? 0.975 : Math.min(0.97, OSCURIDAD * (2 - parpadeo));
      gs.fillStyle = `rgba(0,0,0,${negrura * (1 - fogonazo * 0.55)})`;
      gs.fillRect(0, 0, CW, CH);
      gs.globalCompositeOperation = "destination-out";
      const [sx, sy, esc] = aPantalla(jugador.x, jugador.z);
      const [hx, hy] = manoJugador();
      const potencia = fallo ? (Math.random() < 0.15 ? 0.6 : 0.08) : 1;
      // 1) Halo tenue alrededor del cuerpo (luz rebotada del suelo).
      const r1 = pxMetro() * 1.5 * esc;
      let gr = gs.createRadialGradient(sx, sy - r1 * 0.6, 0, sx, sy - r1 * 0.6, r1);
      gr.addColorStop(0, `rgba(0,0,0,${0.85 * potencia})`); gr.addColorStop(1, "rgba(0,0,0,0)");
      gs.fillStyle = gr; gs.beginPath(); gs.arc(sx, sy - r1 * 0.6, r1, 0, PI * 2); gs.fill();
      // 2) Cono de la linterna: tres capas con apertura creciente para un borde suave.
      const ang = anguloHaz();
      const largo = CW * 0.62;
      for (const [abre, alfa] of [[0.16, 0.9], [0.26, 0.5], [0.38, 0.22]]) {
        gr = gs.createRadialGradient(hx, hy, 0, hx, hy, largo);
        gr.addColorStop(0, `rgba(0,0,0,${alfa * potencia})`);
        gr.addColorStop(0.55, `rgba(0,0,0,${alfa * 0.7 * potencia})`);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        gs.fillStyle = gr;
        gs.beginPath();
        gs.moveTo(hx, hy);
        gs.arc(hx, hy, largo, ang - abre, ang + abre);
        gs.closePath();
        gs.fill();
      }
      // 3) Mancha de luz donde el haz toca el suelo.
      const px = hx + Math.cos(ang) * largo * 0.42, py = hy + Math.sin(ang) * largo * 0.42 + pxMetro() * esc * 0.5;
      gr = gs.createRadialGradient(px, py, 0, px, py, largo * 0.3);
      gr.addColorStop(0, `rgba(0,0,0,${0.6 * potencia})`); gr.addColorStop(1, "rgba(0,0,0,0)");
      gs.fillStyle = gr; gs.beginPath(); gs.ellipse(px, py, largo * 0.3, largo * 0.12, 0, 0, PI * 2); gs.fill();
      // Los puntos que brillan se ven siempre un poco
      for (const p of puntos) {
        if (visitados.has(p.i)) continue;
        const [px, py, pe] = aPantalla(p.def.x, p.def.z);
        gr = gs.createRadialGradient(px, py - 30 * pe, 0, px, py - 30 * pe, 60 * pe);
        gr.addColorStop(0, "rgba(0,0,0,.7)"); gr.addColorStop(1, "rgba(0,0,0,0)");
        gs.fillStyle = gr; gs.beginPath(); gs.arc(px, py - 30 * pe, 60 * pe, 0, PI * 2); gs.fill();
      }
      g.drawImage(sombra, 0, 0, CW, CH);
    }

    /** Lo que se ve DENTRO de la oscuridad: haz volumétrico, polvo, siluetas, ojos y láser. */
    function dibujarAtmosfera() {
      const [hx, hy, esc] = manoJugador();
      const ang = anguloHaz();
      const largo = CW * 0.62;
      const fallo = apagonTerror > 0;
      g.save();
      // Haz volumétrico: el aire se ilumina un poco dentro del cono.
      if (!fallo) {
        g.globalCompositeOperation = "lighter";
        const gr = g.createRadialGradient(hx, hy, 0, hx, hy, largo);
        gr.addColorStop(0, "rgba(255,236,200,.10)"); gr.addColorStop(0.6, "rgba(255,230,190,.035)"); gr.addColorStop(1, "rgba(255,230,190,0)");
        g.fillStyle = gr;
        g.beginPath(); g.moveTo(hx, hy); g.arc(hx, hy, largo, ang - 0.17, ang + 0.17); g.closePath(); g.fill();
        // Motas de polvo: solo brillan si están dentro del haz.
        for (const m of motas) {
          const dx = m.x - hx, dy = m.y - hy, d = Math.hypot(dx, dy);
          if (d > largo || d < 10) continue;
          let da = Math.atan2(dy, dx) - ang;
          da = Math.atan2(Math.sin(da), Math.cos(da));
          if (Math.abs(da) > 0.24) continue;
          const a = (1 - d / largo) * (1 - Math.abs(da) / 0.24) * 0.85;
          g.fillStyle = `rgba(255,240,215,${a})`;
          g.beginPath(); g.arc(m.x, m.y, m.r, 0, PI * 2); g.fill();
        }
      }
      g.globalCompositeOperation = "source-over";
      // Polvo que cae del techo tras un golpe.
      if (polvoTecho > 0) {
        g.fillStyle = `rgba(180,170,150,${Math.min(0.5, polvoTecho * 0.2)})`;
        for (let i = 0; i < 40; i++) {
          const x = ((i * 97.3) % CW) + Math.sin(reloj + i) * 6;
          const y = ((reloj * 120 + i * 53) % (CH * 0.6));
          g.fillRect(x, y, 1.5, 3);
        }
      }
      // Siluetas que cruzan el fondo a toda velocidad.
      for (const s of siluetas) {
        if (!lista(figuraSombra)) continue;
        const k = s.t / s.dur;
        const x = (s.lado * (W / 2 + 1)) * (1 - 2 * k);
        const [px, py, pe] = aPantalla(x, s.z);
        const alto = pxMetro() * 1.8 * pe, ancho = alto * figuraSombra.naturalWidth / figuraSombra.naturalHeight;
        g.save();
        g.globalAlpha = Math.sin(k * PI) * 0.75;
        g.filter = "brightness(0) blur(1.5px)";
        g.translate(px, py - Math.abs(Math.sin(k * 18)) * 4);
        g.scale(-s.lado, 1);
        g.drawImage(figuraSombra, -ancho / 2, -alto, ancho, alto);
        g.restore();
      }
      // Ojos en la oscuridad.
      for (const o of ojos) {
        const [px, py, pe] = aPantalla(o.x, o.z);
        const y = py - pxMetro() * 1.62 * pe;
        const parpadea = (o.t % 1.6) > 1.45;
        const a = Math.min(1, o.t * 2, (o.dur - o.t) * 2) * (parpadea ? 0 : 1);
        const sep = 7 * pe + 2;
        g.shadowColor = `rgba(${o.color},1)`; g.shadowBlur = 10;
        g.fillStyle = `rgba(${o.color},${a})`;
        g.beginPath(); g.ellipse(px - sep, y, 2.4 * pe + 1, 1.3 * pe + 0.6, 0, 0, PI * 2); g.ellipse(px + sep, y, 2.4 * pe + 1, 1.3 * pe + 0.6, 0, 0, PI * 2); g.fill();
        g.shadowBlur = 0;
      }
      // Láser de la mira (RE4): del arma al objetivo, con un punto rojo.
      if (apuntando) {
        const blanco = enemigoEnMira(17, true);
        let tx, ty;
        if (blanco) {
          const [bx, by, be] = aPantalla(blanco.f.x, blanco.f.z);
          const alto = pxMetro() * 1.8 * be * blanco.f.escala;
          tx = bx + Math.sin(reloj * 7) * 2; ty = by - alto * (blanco.dormido ? 0.1 : 0.9) + Math.cos(reloj * 5) * 2;
        } else {
          tx = hx + Math.cos(ang) * CW * 0.5; ty = hy + Math.sin(ang) * CW * 0.5 * 0.4;
        }
        g.strokeStyle = "rgba(255,30,30,.55)"; g.lineWidth = 1.2; g.shadowColor = "#ff1a1a"; g.shadowBlur = 8;
        g.beginPath(); g.moveTo(hx, hy); g.lineTo(tx, ty); g.stroke();
        g.fillStyle = "rgba(255,60,60,.95)";
        g.beginPath(); g.arc(tx, ty, 2.8, 0, PI * 2); g.fill();
        g.shadowBlur = 0;
      }
      // Fogonazo del disparo en la boca del arma.
      if (retroceso > 0.2) {
        const fx = hx + jugador.mira * 14 * esc, fy = hy;
        const gr = g.createRadialGradient(fx, fy, 0, fx, fy, 40 * esc * retroceso);
        gr.addColorStop(0, "rgba(255,240,200,.95)"); gr.addColorStop(0.3, "rgba(255,170,60,.6)"); gr.addColorStop(1, "rgba(255,120,20,0)");
        g.globalCompositeOperation = "lighter";
        g.fillStyle = gr; g.beginPath(); g.arc(fx, fy, 40 * esc * retroceso, 0, PI * 2); g.fill();
      }
      g.restore();
    }

    /** Viñeta y fogonazo: en coordenadas de pantalla (fuera de la cámara). */
    function dibujarLente() {
      if (post.activo) return;   // el post-procesado ya pone su propia viñeta de lente
      const v = g.createRadialGradient(CW / 2, CH / 2, Math.min(CW, CH) * 0.35, CW / 2, CH / 2, Math.max(CW, CH) * 0.75);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.7)");
      g.fillStyle = v; g.fillRect(0, 0, CW, CH);
      if (fogonazo > 0) { g.fillStyle = `rgba(255,200,120,${fogonazo * 0.18})`; g.fillRect(0, 0, CW, CH); }
    }

    /** La cámara sigue al personaje con suavidad y "respira" como una cámara al hombro. */
    function actualizarCamara(dt) {
      if (!conCamara) { cam.x = CW / 2; cam.y = CH / 2; cam.zoom = 1; return; }
      const [sx, sy, esc] = aPantalla(jugador.x, jugador.z);
      const corre = jugador.vel > 3;
      const zoomObj = 1.16 - (corre ? 0.04 : 0) + (enemigos.some((e) => !e.muerto && e.alerta) ? 0.03 : 0);
      const ox = sx + jugador.mira * CW * 0.05;
      const oy = sy - pxMetro() * esc * 0.85;
      const k = cam.listo ? Math.min(1, dt * 2.2) : 1;
      cam.zoom += (zoomObj - cam.zoom) * (cam.listo ? Math.min(1, dt * 1.5) : 1);
      cam.x += (ox - cam.x) * k;
      cam.y += (oy - cam.y) * k;
      cam.listo = true;
    }
    /** Centro de la cámara con el balanceo "al hombro", sin salirse de la escena. */
    function centroCamara() {
      let x = cam.x, y = cam.y;
      if (conCamara && !ctx.reducir) {
        x += Math.sin(reloj * 0.63) * CW * 0.0025 + Math.sin(jugador.fase) * Math.min(1, jugador.vel / 3) * CW * 0.0015;
        y += Math.cos(reloj * 0.47) * CH * 0.003 + Math.abs(Math.cos(jugador.fase)) * Math.min(1, jugador.vel / 3) * CH * 0.003;
      }
      const mx = CW / (2 * cam.zoom), my = CH / (2 * cam.zoom);
      return [limitar(x, mx, CW - mx), limitar(y, my, CH - my)];
    }

    function dibujar() {
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
      g.fillStyle = "#050505";
      g.fillRect(0, 0, CW, CH);
      g.save();
      if (sacudida > 0) { sacudida -= 1 / 60; const s = ctx.reducir ? 2 : 9; g.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s); }
      // Cámara: zoom y encuadre centrados en el personaje.
      const [ccx, ccy] = centroCamara();
      const camX = cam.x, camY = cam.y;
      cam.x = ccx; cam.y = ccy;
      g.translate(CW / 2, CH / 2);
      g.scale(cam.zoom, cam.zoom);
      g.translate(-cam.x, -cam.y);
      dibujarFondo();
      charcos.forEach(dibujarCharco);
      dibujarPuerta();
      // Todo lo que tiene profundidad, ordenado de fondo a primer plano.
      const capas = [];
      for (const d of decorado) capas.push({ z: d.z - (d.tipo === "colgado" ? 0 : 0.01), fn: () => dibujarDecorado(d) });
      for (const p of puntos) capas.push({ z: p.def.z + 0.01, fn: () => dibujarBrillo(p) });
      for (const n of npcs) capas.push({ z: n.f.z, fn: () => dibujarFigura(n.f, animacion(n.f, n.vel)) });
      for (const e of enemigos) capas.push({ z: e.f.z, fn: () => dibujarFigura(e.f, e.muerto || e.dormido || e.levantando > 0 ? {} : animacion(e.f, e.vel, e.aturdido > 3)) });
      capas.push({ z: jugador.z, fn: () => dibujarFigura(jugador, animacion(jugador, jugador.vel)) });
      capas.sort((a, b) => a.z - b.z).forEach((c) => c.fn());
      // Cabezas cortadas
      for (const c of cabezas) {
        if (!lista(c.img)) continue;
        const iw = c.img.naturalWidth, ih = c.img.naturalHeight;
        const ancho = c.alto / 0.16 * iw / ih;
        g.save(); g.translate(c.x, c.y); g.rotate(c.giro); g.scale(c.mira, 1);
        g.drawImage(c.img, 0, 0, iw, ih * 0.16, -ancho / 2, -c.alto / 2, ancho, c.alto);
        g.restore();
      }
      // Gotas de sangre
      g.fillStyle = "#8a0000";
      for (const p of gotas) { g.beginPath(); g.arc(p.x, p.y, p.r, 0, PI * 2); g.fill(); }
      dibujarNiebla();
      dibujarLinterna();
      dibujarAtmosfera();
      g.restore();
      dibujarLente();
      // Datos para el post-procesado: horizonte y linterna en coordenadas de pantalla.
      if (post.activo) {
        const [lx, ly] = aPantalla(jugador.x, jugador.z);
        const [vx, vy] = aVista(lx + jugador.mira * CW * 0.12, ly - pxMetro() * 1.1);
        const [, hy] = aVista(0, yHorizonte());
        datosPost = { horizonte: limitar(hy / CH, 0.02, 0.95), luz: [vx / CW, vy / CH], salud: ctx.salud ? ctx.salud() : 1, fogonazo };
      }
      cam.x = camX; cam.y = camY;
      for (const f of [jugador, ...enemigos.map((e) => e.f), ...npcs.map((n) => n.f)]) if (f.destello > 0) f.destello -= 1 / 60;
    }
    /** Balanceo al andar (sin piernas: la figura entera se mece). */
    function animacion(f, vel, derribado) {
      if (derribado) return { giro: 0.5 * f.mira, bob: -pxMetro() * 0.3 };
      const k = Math.min(1, vel / 2.5);
      return { bob: Math.abs(Math.sin(f.fase)) * 6 * k + Math.sin(reloj * 1.7 + f.fase) * 1.2, giro: Math.sin(f.fase) * 0.035 * k };
    }

    function bucle(ahora) {
      if (!activo) return;
      raf = requestAnimationFrame(bucle);
      if (!ctx.activo()) { terminar(); return; }
      const dt = limitar((ahora - ultimo) / 1000, 0, 0.05);
      ultimo = ahora;
      if (!ctx.pausado()) actualizar(dt);
      if (!activo) return;
      // Resolución dinámica: si render3d.js cambia la resolución interna, se adapta el lienzo.
      if (R3D && Math.abs(Render3D.dprInterno() - DPR) > 0.01) ajustarTamano();
      actualizarCamara(dt);
      dibujar();
      if (post.activo && datosPost) post.render({ ...datosPost, dt });
    }
    let datosPost = null;

    function ajustarTamano() {
      // clientWidth/Height: tamaño de maquetación (no le afectan las animaciones 3D con transform).
      const r = { width: raiz.clientWidth, height: raiz.clientHeight };
      if (!r.width || !r.height) return;
      DPR = R3D ? Render3D.dprInterno() : Math.min(window.devicePixelRatio || 1, 2);
      if (r.width !== CW || r.height !== CH) cam.listo = false;
      CW = r.width; CH = r.height;
      canvas.width = Math.round(CW * DPR);
      canvas.height = Math.round(CH * DPR);
    }
    const observador = new ResizeObserver(ajustarTamano);
    observador.observe(raiz);
    ajustarTamano();

    function terminar() {
      if (!activo) return;
      activo = false;
      cancelAnimationFrame(raf);
      terror.destruir();
      agarre = null;
      post.destruir();
      Sonido.tension(false);
      observador.disconnect();
      document.removeEventListener("keydown", alPulsar);
      document.removeEventListener("keyup", alSoltar);
      window.removeEventListener("blur", alPerderFoco);
    }

    window.__sala = { jugador, enemigos, puntos, npcs };
    actualizarObjetivo();
    mostrarTexto(`<p>${escapar(paso.descripcion || "")}</p>`, 8);
    raf = requestAnimationFrame(bucle);
    setTimeout(() => raiz.focus({ preventScroll: true }), 50);
    return { destruir: terminar };
  }

  return { crear };
})();
