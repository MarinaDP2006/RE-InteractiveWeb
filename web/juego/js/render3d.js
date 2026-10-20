/* ============================================================================
 *  render3d.js — Motor gráfico "UMBRA": 3D, realismo y 4K (WebGL)
 * ============================================================================
 *
 *  Capa gráfica por encima del juego, sin librerías externas (WebGL puro):
 *
 *   · Título 3D: el logo de Umbrella en 3D (raymarching) sobre Raccoon City
 *     de noche, con lluvia, niebla volumétrica y relámpagos.
 *   · Post-procesado de las salas (estilo RE Engine / Requiem): profundidad
 *     de campo, niebla volumétrica por profundidad, rayos de luz de la
 *     linterna, bloom, aberración cromática, distorsión de lente, etalonaje
 *     por juego, grano de película y desaturación al estar herido.
 *   · Super-resolución UMBRA-SR (inspirada en DLSS / FSR): la sala se dibuja
 *     a una resolución interna menor y se reescala a la de salida (hasta 4K)
 *     con un filtro de nitidez adaptativo al contraste (CAS). Modos Nativo,
 *     Calidad, Equilibrado, Rendimiento, Ultra rendimiento y Dinámico (ajusta
 *     la resolución interna para mantener 60 FPS).
 *   · Ultra 4K: la salida se renderiza a 3840×2160 aunque la pantalla sea
 *     1080p (superresolución / supersampling: el navegador reduce la imagen
 *     y se ve más nítida, sin dientes de sierra).
 *   · Transiciones cinematográficas: la pantalla se cubre con un fundido de
 *     sangre y película quemada entre pantallas y al entrar en las salas.
 *
 *  Si el navegador no tiene WebGL, todo vuelve al modo 2D clásico.
 *
 *  Se publica como window.Render3D y lo usan motor2d.js y juego.js.
 * ========================================================================== */

"use strict";

const Render3D = (() => {
  const esMovil = window.matchMedia("(pointer: coarse)").matches;

  /* ------------------------------------------------------------------
   *  Configuración gráfica
   * ---------------------------------------------------------------- */
  /** Factor de resolución interna de cada modo de escalado. */
  const ESCALADOS = {
    nativo: 1,               // DLAA: resolución interna = salida
    calidad: 0.667,
    equilibrado: 0.58,
    rendimiento: 0.5,
    ultra: 0.333,
    dinamico: 0.75           // valor inicial; luego se ajusta solo
  };
  const NOMBRES_ESCALADO = {
    nativo: "Nativo", calidad: "Calidad", equilibrado: "Equilibrado",
    rendimiento: "Rendimiento", ultra: "Ultra rendimiento", dinamico: "Dinámico"
  };

  let cfg = { calidad: "auto", escalado: "auto", transiciones: true, fps: false, reducir: false };
  let dinamico = ESCALADOS.dinamico;

  /** ¿Funciona WebGL en este navegador? (se comprueba una sola vez) */
  const hayWebGL = (() => {
    try {
      const c = document.createElement("canvas");
      return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch { return false; }
  })();

  const calidad = () => {
    if (!hayWebGL) return "bajo";
    if (cfg.calidad === "auto") return esMovil ? "alto" : "ultra";
    return cfg.calidad;
  };
  const escalado = () => (cfg.escalado === "auto" ? (esMovil ? "rendimiento" : "dinamico") : cfg.escalado);
  const avanzado = () => calidad() !== "bajo";

  /**
   * Píxeles de salida por píxel CSS.
   *  bajo  → la pantalla tal cual (máx. 1,5)
   *  alto  → resolución nativa de la pantalla (máx. 2, retina)
   *  ultra → 4K: hasta 3840×2160 píxeles reales aunque la pantalla sea menor
   */
  function dprSalida() {
    const dpr = window.devicePixelRatio || 1;
    const q = calidad();
    if (q === "bajo") return Math.min(dpr, 1.5);
    if (q === "alto") return Math.min(dpr, 2);
    const s = Math.sqrt((3840 * 2160) / Math.max(1, innerWidth * innerHeight));
    return Math.max(Math.min(dpr, 2), Math.min(s, Math.max(dpr, 2)));
  }

  /** Píxeles internos por píxel CSS (antes de la super-resolución). */
  function dprInterno() {
    if (!avanzado()) return dprSalida();
    const e = escalado();
    const f = e === "dinamico" ? dinamico : ESCALADOS[e] || 1;
    return Math.max(0.5, dprSalida() * f);
  }

  function setConfig(parcial) {
    cfg = { ...cfg, ...parcial };
    document.body.classList.toggle("graficos-bajo", !avanzado());
    document.body.classList.toggle("graficos-ultra", calidad() === "ultra");
    document.body.classList.toggle("sin-transiciones", !cfg.transiciones);
    Titulo.ajustar();
  }

  /* ------------------------------------------------------------------
   *  Paralaje 3D del interfaz: el ratón (o el giroscopio) inclina menús,
   *  textos y fondos. El CSS lee --tilt-x / --tilt-y (de -1 a 1).
   * ---------------------------------------------------------------- */
  function inclinar(x, y) {
    const raiz = document.documentElement.style;
    raiz.setProperty("--tilt-x", x.toFixed(3));
    raiz.setProperty("--tilt-y", y.toFixed(3));
  }
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") inclinar((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2);
  }, { passive: true });

  /* ------------------------------------------------------------------
   *  Utilidades WebGL
   * ---------------------------------------------------------------- */
  const VERTICE = `
    attribute vec2 p;
    varying vec2 uv;
    void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

  const CABECERA = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    varying vec2 uv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    float ruido(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { v += a * ruido(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
      return v;
    }
    float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
  `;

  /** Crea un contexto WebGL con un triángulo que cubre la pantalla. */
  function contexto(canvas, opciones = {}) {
    const op = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: "high-performance", ...opciones };
    const gl = canvas.getContext("webgl2", op) || canvas.getContext("webgl", op);
    if (!gl) return null;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    return gl;
  }

  /** Compila un programa y devuelve { prog, u: {uniforms} }. */
  function programa(gl, fuente, uniforms) {
    const sh = (tipo, src) => {
      const s = gl.createShader(tipo);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERTICE));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, CABECERA + fuente));
    gl.bindAttribLocation(prog, 0, "p");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
    const u = {};
    for (const n of uniforms) u[n] = gl.getUniformLocation(prog, n);
    return { prog, u };
  }

  function usar(gl, p) {
    gl.useProgram(p.prog);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  function textura(gl) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  /** Framebuffer con su textura (para las pasadas de desenfoque). */
  function fbo(gl, w, h) {
    const tex = textura(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fb, w, h };
  }

  function liberarFbo(gl, f) {
    if (!f) return;
    gl.deleteTexture(f.tex);
    gl.deleteFramebuffer(f.fb);
  }

  /* ------------------------------------------------------------------
   *  Etalonaje por juego: tinte, color de la niebla y de la luz
   * ---------------------------------------------------------------- */
  const GRADOS = {
    "tema-re2": { tinte: [0.86, 0.95, 1.12], niebla: [0.22, 0.30, 0.42], luz: [0.85, 0.92, 1.0] },
    "tema-re3": { tinte: [1.12, 0.94, 0.80], niebla: [0.45, 0.22, 0.10], luz: [1.0, 0.75, 0.5] },
    "tema-re4": { tinte: [1.04, 1.00, 0.84], niebla: [0.30, 0.30, 0.20], luz: [1.0, 0.88, 0.65] },
    "tema-re5": { tinte: [1.12, 1.00, 0.80], niebla: [0.45, 0.33, 0.18], luz: [1.0, 0.85, 0.6] },
    "tema-re6": { tinte: [0.88, 1.04, 1.02], niebla: [0.12, 0.30, 0.28], luz: [0.8, 1.0, 0.95] },
    "tema-re7": { tinte: [1.02, 1.00, 0.82], niebla: [0.24, 0.24, 0.14], luz: [1.0, 0.92, 0.7] },
    "tema-re8": { tinte: [0.92, 0.97, 1.08], niebla: [0.45, 0.48, 0.55], luz: [0.92, 0.95, 1.0] },
    "tema-re9": { tinte: [1.06, 0.90, 0.98], niebla: [0.30, 0.10, 0.18], luz: [1.0, 0.85, 0.9] }
  };
  const GRADO_BASE = { tinte: [1, 0.97, 0.94], niebla: [0.2, 0.2, 0.22], luz: [1, 0.92, 0.8] };

  /* ==================================================================
   *  1. POST-PROCESADO DE LAS SALAS + SUPER-RESOLUCIÓN
   * ================================================================ */
  const FS_REDUCIR = `
    uniform sampler2D uSrc;
    uniform vec2 uTexel;
    void main() {
      vec3 c = texture2D(uSrc, uv + uTexel * vec2(-1.0, -1.0)).rgb
             + texture2D(uSrc, uv + uTexel * vec2( 1.0, -1.0)).rgb
             + texture2D(uSrc, uv + uTexel * vec2(-1.0,  1.0)).rgb
             + texture2D(uSrc, uv + uTexel * vec2( 1.0,  1.0)).rgb;
      gl_FragColor = vec4(c * 0.25, 1.0);
    }`;

  const FS_DESENFOQUE = `
    uniform sampler2D uSrc;
    uniform vec2 uDir;
    void main() {
      vec3 c = texture2D(uSrc, uv).rgb * 0.227;
      c += (texture2D(uSrc, uv + uDir * 1.385).rgb + texture2D(uSrc, uv - uDir * 1.385).rgb) * 0.316;
      c += (texture2D(uSrc, uv + uDir * 3.231).rgb + texture2D(uSrc, uv - uDir * 3.231).rgb) * 0.070;
      gl_FragColor = vec4(c, 1.0);
    }`;

  const FS_FINAL = `
    uniform sampler2D uSrc, uBlur;
    uniform vec2 uSrcRes, uRes, uLuz;
    uniform float uT, uHor, uSalud, uFlash, uGrano, uCA, uNitidez, uDof, uRayos, uBloom;
    uniform vec3 uTinte, uNiebla, uColorLuz;

    // Nitidez adaptativa al contraste (CAS): realza los bordes al reescalar sin halos.
    vec3 cas(vec2 c) {
      vec2 px = 1.0 / uSrcRes;
      vec3 a = texture2D(uSrc, c + vec2(0.0, -px.y)).rgb;
      vec3 b = texture2D(uSrc, c + vec2(-px.x, 0.0)).rgb;
      vec3 e = texture2D(uSrc, c).rgb;
      vec3 f = texture2D(uSrc, c + vec2(px.x, 0.0)).rgb;
      vec3 h = texture2D(uSrc, c + vec2(0.0, px.y)).rgb;
      vec3 mn = min(min(min(a, b), min(f, h)), e);
      vec3 mx = max(max(max(a, b), max(f, h)), e);
      vec3 amp = sqrt(clamp(min(mn, 1.0 - mx) / max(mx, vec3(1e-4)), 0.0, 1.0));
      vec3 w = -amp * mix(0.125, 0.2, uNitidez);
      return clamp((e + (a + b + f + h) * w) / (1.0 + 4.0 * w), 0.0, 1.0);
    }

    void main() {
      vec2 cc = uv - 0.5;
      // Distorsión de lente (barril muy suave) con un leve zoom para no ver bordes.
      vec2 d = 0.5 + cc * (0.975 + 0.06 * dot(cc, cc));
      float yTop = 1.0 - d.y;

      // Profundidad reconstruida: pared del fondo lejos, el suelo se acerca hacia abajo.
      float prof = yTop < uHor ? 1.0 - 0.15 * (uHor - yTop) / max(uHor, 0.01)
                               : 1.0 - clamp((yTop - uHor) / max(0.97 - uHor, 0.05), 0.0, 1.0);

      vec3 col = cas(d);
      // Aberración cromática hacia los bordes.
      vec2 ca = cc * uCA * (0.4 + dot(cc, cc) * 2.0);
      col.r = mix(col.r, texture2D(uSrc, d + ca).r, 0.85);
      col.b = mix(col.b, texture2D(uSrc, d - ca).b, 0.85);

      vec3 blur = texture2D(uBlur, d).rgb;
      // Profundidad de campo: el fondo lejano y el primerísimo plano, desenfocados.
      float dof = uDof * (smoothstep(0.6, 1.0, prof) * 0.55 + smoothstep(0.9, 1.0, yTop) * 0.35);
      col = mix(col, blur, dof);

      // Niebla volumétrica: más densa al fondo, se mueve y se ilumina con la linterna.
      vec2 pn = vec2(d.x * uRes.x / uRes.y, d.y) * 2.5;
      float n = fbm(pn + vec2(uT * 0.05, uT * 0.02)) * 0.7 + fbm(pn * 2.0 - vec2(uT * 0.08, 0.0)) * 0.3;
      vec2 aL = vec2((d.x - uLuz.x) * uRes.x / uRes.y, d.y - uLuz.y);
      float cerca = exp(-dot(aL, aL) * 7.0);
      float densidad = (0.05 + prof * prof * 0.16) * (0.55 + n * 0.9);
      col = mix(col, uNiebla * (0.12 + cerca * 1.5), clamp(densidad, 0.0, 0.4));

      // Rayos de luz (god rays) desde la linterna.
      vec2 paso = (uLuz - d) / 14.0;
      vec2 s = d;
      float acc = 0.0, peso = 1.0;
      for (int i = 0; i < 14; i++) {
        s += paso;
        acc += max(lum(texture2D(uBlur, s).rgb) - 0.32, 0.0) * peso;
        peso *= 0.9;
      }
      col += uColorLuz * acc * 0.09 * uRayos * (0.6 + n * 0.6);

      // Bloom: lo brillante "sangra" luz alrededor.
      col += max(blur - 0.5, 0.0) * 1.3 * uBloom;

      // Fogonazo del disparo.
      col += vec3(1.0, 0.75, 0.45) * uFlash * 0.22 * (1.0 - length(cc));

      // Etalonaje cinematográfico: curva en S, tinte del juego y sombras frías.
      col = mix(col, col * col * (3.0 - 2.0 * col), 0.35);
      col *= uTinte;
      col += vec3(0.0, 0.006, 0.014) * (1.0 - lum(col));
      // Herido: se va el color y late el rojo.
      float herida = smoothstep(0.75, 0.1, uSalud);
      col = mix(col, vec3(lum(col)) * vec3(1.15, 0.85, 0.85), herida * 0.65);
      col += vec3(0.25, 0.0, 0.0) * herida * herida * (0.6 + 0.4 * sin(uT * 7.0)) * smoothstep(0.25, 0.75, length(cc));

      // Viñeta de lente.
      col *= mix(1.0, smoothstep(0.85, 0.2, length(cc * vec2(1.05, 1.15))), 0.55);

      // Grano de película (más visible en las sombras) y tramado anti-bandas.
      float g = hash(uv * uRes + fract(uT * 7.13) * 91.7) - 0.5;
      col += g * uGrano * (0.9 - lum(col) * 0.6);
      col += (hash(uv * uRes.yx + 3.1) - 0.5) / 255.0;
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }`;

  /**
   * Prepara el post-procesado para una sala.
   * @param {HTMLElement} raiz contenedor .exp
   * @param {HTMLCanvasElement} lienzo2d canvas donde dibuja motor2d.js
   * @param {object} op { tema, reducir }
   * @returns {{activo:boolean, render(fn), destruir()}}
   */
  function crearPostSala(raiz, lienzo2d, op = {}) {
    const nulo = { activo: false, render() {}, destruir() {} };
    if (!avanzado()) return nulo;
    const lienzo = document.createElement("canvas");
    lienzo.className = "exp-gl";
    lienzo.setAttribute("aria-hidden", "true");
    const gl = contexto(lienzo);
    if (!gl) return nulo;

    let pFinal, pReducir, pBlur;
    try {
      pFinal = programa(gl, FS_FINAL, ["uSrc", "uBlur", "uSrcRes", "uRes", "uLuz", "uT", "uHor", "uSalud", "uFlash", "uGrano", "uCA", "uNitidez", "uDof", "uRayos", "uBloom", "uTinte", "uNiebla", "uColorLuz"]);
      pReducir = programa(gl, FS_REDUCIR, ["uSrc", "uTexel"]);
      pBlur = programa(gl, FS_DESENFOQUE, ["uSrc", "uDir"]);
    } catch (err) {
      console.warn("UMBRA: sin post-procesado", err);
      return nulo;
    }

    raiz.insertBefore(lienzo, lienzo2d);
    raiz.classList.add("con-gl");

    const grado = GRADOS[op.tema] || GRADO_BASE;
    const tex = textura(gl);
    let A = null, B = null;
    let activo = true;
    let perdido = false;
    const medidor = crearMedidor(raiz);

    lienzo.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      perdido = true;
      raiz.classList.remove("con-gl");
    });

    function tamanos() {
      const r = { width: raiz.clientWidth, height: raiz.clientHeight };
      const dpr = dprSalida();
      const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (lienzo.width !== w || lienzo.height !== h) { lienzo.width = w; lienzo.height = h; }
      const bw = Math.max(16, Math.round(lienzo2d.width / 4)), bh = Math.max(16, Math.round(lienzo2d.height / 4));
      if (!A || A.w !== bw || A.h !== bh) {
        liberarFbo(gl, A); liberarFbo(gl, B);
        A = fbo(gl, bw, bh); B = fbo(gl, bw, bh);
      }
    }

    /**
     * Dibuja un fotograma.
     * @param {object} p { horizonte, luz:[x,y] (0..1 desde arriba), salud 0..1, fogonazo 0..1, dt }
     */
    function render(p) {
      if (!activo || perdido || !lienzo2d.width) return;
      tamanos();
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lienzo2d);

      // 1) Reducción a 1/4 y desenfoque gaussiano separable (para DoF, bloom y rayos).
      usar(gl, pReducir);
      gl.bindFramebuffer(gl.FRAMEBUFFER, A.fb);
      gl.viewport(0, 0, A.w, A.h);
      gl.uniform1i(pReducir.u.uSrc, 0);
      gl.uniform2f(pReducir.u.uTexel, 1.5 / lienzo2d.width, 1.5 / lienzo2d.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      usar(gl, pBlur);
      gl.uniform1i(pBlur.u.uSrc, 0);
      for (let i = 0; i < 2; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, B.fb);
        gl.bindTexture(gl.TEXTURE_2D, A.tex);
        gl.uniform2f(pBlur.u.uDir, (1 + i) / A.w, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, A.fb);
        gl.bindTexture(gl.TEXTURE_2D, B.tex);
        gl.uniform2f(pBlur.u.uDir, 0, (1 + i) / A.h);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      // 2) Composición final a la resolución de salida (super-resolución + efectos).
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, lienzo.width, lienzo.height);
      usar(gl, pFinal);
      const u = pFinal.u;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(u.uSrc, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, A.tex);
      gl.uniform1i(u.uBlur, 1);
      gl.activeTexture(gl.TEXTURE0);
      const suave = cfg.reducir || op.reducir;
      const ultra = calidad() === "ultra";
      const factor = lienzo2d.width / lienzo.width;
      gl.uniform2f(u.uSrcRes, lienzo2d.width, lienzo2d.height);
      gl.uniform2f(u.uRes, lienzo.width, lienzo.height);
      gl.uniform2f(u.uLuz, p.luz[0], 1 - p.luz[1]);
      gl.uniform1f(u.uT, performance.now() / 1000);
      gl.uniform1f(u.uHor, p.horizonte);
      gl.uniform1f(u.uSalud, Math.max(0, Math.min(1, p.salud)));
      gl.uniform1f(u.uFlash, suave ? 0 : p.fogonazo);
      gl.uniform1f(u.uGrano, suave ? 0.02 : 0.055);
      gl.uniform1f(u.uCA, suave ? 0.001 : 0.0045);
      gl.uniform1f(u.uNitidez, Math.min(1, Math.max(0, (1 - factor) * 2.2)));
      gl.uniform1f(u.uDof, ultra ? 0.85 : 0.6);
      gl.uniform1f(u.uRayos, ultra ? 1 : 0.7);
      gl.uniform1f(u.uBloom, ultra ? 1 : 0.8);
      gl.uniform3fv(u.uTinte, grado.tinte);
      gl.uniform3fv(u.uNiebla, grado.niebla);
      gl.uniform3fv(u.uColorLuz, grado.luz);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      medidor.marcar(p.dt, lienzo2d, lienzo);
    }

    function destruir() {
      if (!activo) return;
      activo = false;
      medidor.destruir();
      liberarFbo(gl, A); liberarFbo(gl, B);
      gl.deleteTexture(tex);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      lienzo.remove();
    }

    return { get activo() { return activo && !perdido; }, render, destruir };
  }

  /**
   * Contador de FPS + resolución dinámica: si el equipo no llega a ~50 FPS
   * se baja la resolución interna, y si va sobrado se sube (como DLSS dinámico).
   */
  function crearMedidor(raiz) {
    const el = document.createElement("div");
    el.className = "exp-fps";
    el.hidden = !cfg.fps;
    raiz.appendChild(el);
    let media = 16.7, acumulado = 0, cuadros = 0, lento = 0, rapido = 0, antes = performance.now();
    return {
      marcar(dt, interno, salida) {
        const ahora = performance.now();
        const ms = Math.max(1, Math.min(250, ahora - antes));
        antes = ahora;
        media += (ms - media) * 0.05;
        if (escalado() === "dinamico") {
          if (media > 21) { lento += ms; rapido = 0; } else if (media < 17.6) { rapido += ms; lento = 0; } else { lento = rapido = 0; }
          if (lento > 1200) { dinamico = Math.max(0.5, dinamico - 0.07); lento = 0; }
          if (rapido > 4000) { dinamico = Math.min(1, dinamico + 0.04); rapido = 0; }
        }
        acumulado += ms; cuadros++;
        el.hidden = !cfg.fps;
        if (cfg.fps && acumulado > 500) {
          const fps = Math.round(1000 / (acumulado / cuadros));
          el.textContent = `${fps} FPS · ${salida.width}×${salida.height} · interna ${interno.width}×${interno.height} · UMBRA-SR ${NOMBRES_ESCALADO[escalado()]}`;
          acumulado = 0; cuadros = 0;
        }
      },
      destruir() { el.remove(); }
    };
  }

  /* ==================================================================
   *  2. TÍTULO 3D: logo de Umbrella sobre Raccoon City (raymarching)
   * ================================================================ */
  const FS_TITULO = `
    uniform vec2 uRes, uRaton, uCentro;
    uniform float uT, uRayo, uTamano, uAtenuar, uPasos;

    mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
    const float PI = 3.14159265;
    const float SEG = PI / 4.0;

    // Paraguas octogonal: casquete con 8 gajos que se hunden entre varillas.
    float logo(vec3 p, out float gajo) {
      float a = atan(p.y, p.x) + PI;
      gajo = mod(floor(a / SEG), 2.0);
      float am = mod(a, SEG) - SEG * 0.5;
      float r = length(p.xy);
      float apot = r * cos(am);
      float t = clamp(apot / 0.95, 0.0, 1.0);
      float h = 0.24 * (1.0 - t * t) - 0.035 * (1.0 - abs(am) / (SEG * 0.5)) * t;
      float capa = abs(p.z - h) - 0.03;
      float borde = apot - 0.95;
      float punta = length(p - vec3(0.0, 0.0, 0.27)) - 0.045;   // remate central
      return min(max(capa, borde), punta);
    }

    float escena(vec3 p, out float gajo) {
      return logo(p, gajo);
    }

    vec3 normal(vec3 p) {
      float g; vec2 e = vec2(0.0015, 0.0);
      return normalize(vec3(
        escena(p + e.xyy, g) - escena(p - e.xyy, g),
        escena(p + e.yxy, g) - escena(p - e.yxy, g),
        escena(p + e.yyx, g) - escena(p - e.yyx, g)));
    }

    // Cielo de tormenta, skyline de Raccoon City, lluvia y niebla.
    vec3 fondo(vec2 q, vec2 s) {
      vec3 col = mix(vec3(0.035, 0.0, 0.0), vec3(0.0, 0.0, 0.01), clamp(q.y * 0.9 + 0.5, 0.0, 1.0));
      float nubes = fbm(vec2(q.x * 1.2 + uT * 0.01, q.y * 2.0 - uT * 0.005) * 2.0);
      col += vec3(0.09, 0.012, 0.015) * nubes * nubes * (0.6 + 0.4 * q.y);
      col += vec3(0.6, 0.65, 0.8) * uRayo * nubes * 0.9;
      // Edificios: tres capas de profundidad con ventanas encendidas.
      for (int k = 0; k < 3; k++) {
        float fk = float(k);
        float esc = 9.0 + fk * 7.0;
        float x = q.x * esc + fk * 13.7 + uRaton.x * (0.4 + fk * 0.5);
        float id = floor(x);
        float alto = -0.62 + fk * 0.08 + hash(vec2(id, fk)) * (0.32 - fk * 0.06);
        if (q.y < alto) {
          vec3 ed = mix(vec3(0.012, 0.004, 0.006), vec3(0.003, 0.0, 0.002), fk / 2.0);
          vec2 w = vec2(fract(x) * 6.0, (q.y - alto) * esc * 3.0);
          float vent = step(0.55, fract(w.x)) * step(0.5, fract(w.y)) * step(0.82, hash(floor(w) + id * 3.1 + fk));
          ed += vec3(0.5, 0.28, 0.08) * vent * (0.4 + 0.6 * hash(floor(w) + floor(uT * 0.3 + id)));
          ed += vec3(0.35, 0.4, 0.5) * uRayo * 0.08;
          col = ed;
        }
      }
      // Niebla baja roja del incendio.
      float niebla = fbm(vec2(q.x * 2.0 - uT * 0.03, q.y * 3.0)) * smoothstep(-0.2, -0.75, q.y);
      col += vec3(0.25, 0.04, 0.02) * niebla;
      // Lluvia: trazos finos inclinados en dos capas.
      for (int k = 0; k < 2; k++) {
        float fk = float(k);
        vec2 r = s * vec2(1.0, 0.035) * (1.0 + fk * 0.6) + vec2(s.y * 0.0035, -uT * (1.4 + fk * 0.6));
        vec2 celda = floor(r * vec2(260.0, 28.0));
        float gota = step(0.975, hash(celda + fk * 7.0));
        float fy = fract(r.y * 28.0);
        float trazo = gota * smoothstep(0.0, 0.5, fy) * (1.0 - smoothstep(0.5, 1.0, fy));
        col += vec3(0.3, 0.33, 0.4) * trazo * (0.25 + fk * 0.15);
      }
      return col;
    }

    void main() {
      vec2 s = uv;
      vec2 q = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 2.0;
      vec3 col = fondo(q * 0.5, s);

      // Cámara que mira al logo; el ratón inclina la escena (paralaje 3D).
      vec2 pl = (q - uCentro) / uTamano;
      vec3 ro = vec3(0.0, 0.0, 3.2);
      vec3 rd = normalize(vec3(pl, -2.4));
      mat2 inc = rot(0.35 + uRaton.y * 0.25 + sin(uT * 0.4) * 0.05);
      mat2 gir = rot(uRaton.x * 0.35 + sin(uT * 0.3) * 0.12);
      ro.yz = inc * ro.yz; rd.yz = inc * rd.yz;
      ro.xz = gir * ro.xz; rd.xz = gir * rd.xz;
      float spin = uT * 0.18;

      float t = 0.0, gajo = 0.0, golpe = 0.0;
      vec3 p;
      for (int i = 0; i < 90; i++) {
        if (float(i) >= uPasos) break;
        p = ro + rd * t;
        vec3 pr = p; pr.xy = rot(spin) * pr.xy;
        float d = escena(pr, gajo);
        if (d < 0.0012) { golpe = 1.0; break; }
        t += d * 0.7;
        if (t > 7.0) break;
      }

      if (golpe > 0.5) {
        vec3 pr = p; pr.xy = rot(spin) * pr.xy;
        vec3 n = normal(pr);
        n.xy = rot(-spin) * n.xy;
        vec3 base = gajo > 0.5 ? vec3(0.62, 0.015, 0.02) : vec3(0.86, 0.83, 0.78);
        if (length(pr - vec3(0.0, 0.0, 0.27)) < 0.06) base = vec3(0.7);
        vec3 L1 = normalize(vec3(-0.6, 0.8, 0.9));
        vec3 L2 = normalize(vec3(0.8, -0.2, 0.4));
        vec3 V = -rd;
        float dif = max(dot(n, L1), 0.0);
        float esp = pow(max(dot(reflect(-L1, n), V), 0.0), 60.0);
        float esp2 = pow(max(dot(reflect(-L2, n), V), 0.0), 24.0);
        float fres = pow(1.0 - max(dot(n, V), 0.0), 4.0);
        vec3 c = base * (0.07 + dif * 0.9) + vec3(1.0, 0.95, 0.9) * esp * 1.2 + vec3(0.9, 0.1, 0.1) * esp2 * 0.35;
        c += vec3(0.8, 0.12, 0.1) * fres * 0.6;
        c += vec3(0.7, 0.75, 0.9) * uRayo * (0.4 + fres);
        // Gotas de lluvia sobre el logo.
        float moja = step(0.93, hash(floor(pr.xy * 70.0) + floor(uT * 2.0)));
        c += vec3(0.5) * moja * esp2;
        col = mix(col, c, uAtenuar);
      } else {
        // Halo rojo detrás del logo.
        float halo = exp(-length(pl) * 1.6) * 0.18;
        col += vec3(0.5, 0.02, 0.02) * halo * uAtenuar;
      }

      // Viñeta, grano y tramado.
      vec2 cc = uv - 0.5;
      col *= smoothstep(0.95, 0.25, length(cc * vec2(1.0, 1.2)));
      col = mix(col, col * col * (3.0 - 2.0 * col), 0.25);
      col += (hash(uv * uRes + fract(uT) * 50.0) - 0.5) * 0.045;
      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }`;

  const Titulo = (() => {
    let lienzo = null, gl = null, prog = null, raf = 0, activo = false;
    const raton = { x: 0, y: 0, ox: 0, oy: 0 };
    let rayo = 0, proximoRayo = 3;
    let ultimo = performance.now();

    function iniciar() {
      const pantalla = document.getElementById("pantalla-titulo");
      if (!pantalla || !avanzado() || lienzo) return;
      lienzo = document.createElement("canvas");
      lienzo.className = "titulo-3d";
      lienzo.setAttribute("aria-hidden", "true");
      gl = contexto(lienzo);
      if (!gl) { lienzo = null; return; }
      try {
        prog = programa(gl, FS_TITULO, ["uRes", "uRaton", "uCentro", "uT", "uRayo", "uTamano", "uAtenuar", "uPasos"]);
      } catch (err) {
        console.warn("UMBRA: título 3D no disponible", err);
        lienzo = null; gl = null;
        return;
      }
      pantalla.prepend(lienzo);
      pantalla.classList.add("con-3d");
      // El ratón (o el giroscopio) inclina el logo y el menú: paralaje 3D.
      window.addEventListener("pointermove", (e) => {
        raton.x = (e.clientX / innerWidth - 0.5) * 2;
        raton.y = (e.clientY / innerHeight - 0.5) * 2;
      });
      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma == null) return;
        raton.x = Math.max(-1, Math.min(1, e.gamma / 30));
        raton.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      });
      document.addEventListener("visibilitychange", vigilar);
      new MutationObserver(vigilar).observe(pantalla, { attributes: true, attributeFilter: ["class"] });
      lienzo.addEventListener("webglcontextlost", (e) => { e.preventDefault(); detener(); pantalla.classList.remove("con-3d"); });
      vigilar();
    }

    function vigilar() {
      const pantalla = document.getElementById("pantalla-titulo");
      const debe = Boolean(lienzo) && pantalla.classList.contains("activa") && !document.hidden && avanzado();
      if (debe && !activo) { activo = true; ultimo = performance.now(); raf = requestAnimationFrame(cuadro); }
      if (!debe) detener();
    }

    function detener() {
      activo = false;
      cancelAnimationFrame(raf);
    }

    function ajustar() {
      if (!lienzo && avanzado()) iniciar();
      if (lienzo) {
        lienzo.hidden = !avanzado();
        document.getElementById("pantalla-titulo").classList.toggle("con-3d", avanzado());
      }
      vigilar();
    }

    function cuadro(ahora) {
      if (!activo) return;
      raf = requestAnimationFrame(cuadro);
      const dt = Math.min(0.05, (ahora - ultimo) / 1000);
      ultimo = ahora;
      // El raymarching es caro: el título se dibuja a resolución interna y se reescala.
      const tope = calidad() === "ultra" ? 2160 : 1080;
      const factor = Math.min(dprInterno() * 0.8, tope / Math.max(1, innerHeight));
      const w = Math.max(1, Math.round(innerWidth * factor)), h = Math.max(1, Math.round(innerHeight * factor));
      if (lienzo.width !== w || lienzo.height !== h) { lienzo.width = w; lienzo.height = h; }

      raton.ox += (raton.x - raton.ox) * Math.min(1, dt * 3);
      raton.oy += (raton.y - raton.oy) * Math.min(1, dt * 3);

      // Relámpagos aleatorios (desactivados con "Reducir destellos").
      proximoRayo -= dt;
      if (proximoRayo <= 0 && !cfg.reducir) {
        rayo = 1;
        proximoRayo = 5 + Math.random() * 9;
        if (typeof Sonido !== "undefined" && Sonido.trueno) Sonido.trueno();
      }
      rayo = Math.max(0, rayo - dt * (rayo > 0.5 ? 3 : 1.2));
      const destello = rayo > 0.05 ? rayo * (0.6 + 0.4 * Math.sin(ahora * 0.09)) : 0;

      const aspecto = innerWidth / innerHeight;
      const ancho = aspecto > 1.25;
      gl.viewport(0, 0, w, h);
      usar(gl, prog);
      gl.uniform2f(prog.u.uRes, w, h);
      gl.uniform2f(prog.u.uRaton, raton.ox, -raton.oy);
      gl.uniform2f(prog.u.uCentro, ancho ? aspecto * 0.58 : 0, ancho ? 0.02 : 0.5);
      gl.uniform1f(prog.u.uTamano, ancho ? 0.68 : Math.min(0.7, aspecto * 0.95));
      gl.uniform1f(prog.u.uAtenuar, ancho ? 1 : 0.5);
      gl.uniform1f(prog.u.uPasos, calidad() === "ultra" ? 90 : 60);
      gl.uniform1f(prog.u.uT, ahora / 1000);
      gl.uniform1f(prog.u.uRayo, destello);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    return { iniciar, ajustar };
  })();

  /* ==================================================================
   *  3. TRANSICIONES CINEMATOGRÁFICAS (sangre + película quemada)
   * ================================================================ */
  const FS_TRANSICION = `
    uniform vec2 uRes;
    uniform float uP, uSemilla, uT;
    void main() {
      float yTop = 1.0 - uv.y;
      vec2 q = vec2(uv.x * uRes.x / uRes.y, uv.y);
      // Chorretones de sangre que bajan desde arriba + mancha irregular.
      float chorro = pow(ruido(vec2(uv.x * 38.0, uSemilla)), 3.0) * 0.6 + ruido(vec2(uv.x * 9.0, uSemilla + 4.0)) * 0.15;
      float v = yTop * 0.55 + fbm(q * 3.2 + uSemilla) * 0.45 - chorro * (1.0 - yTop) * 0.6;
      float e = uP * 1.55 - 0.2;
      float cubre = smoothstep(e + 0.015, e - 0.015, v);
      float borde = smoothstep(e + 0.09, e, v) * (1.0 - cubre);
      vec3 sangre = mix(vec3(0.35, 0.0, 0.0), vec3(0.75, 0.04, 0.03), fbm(q * 9.0 + uT));
      vec3 c = mix(vec3(0.0), sangre * 0.35, (1.0 - uP) * 0.4) * cubre;
      c += sangre * borde * 1.2;
      // Quemado de película en el frente del corte.
      c += vec3(1.0, 0.55, 0.2) * pow(borde, 6.0) * 0.8;
      float a = clamp(cubre + borde, 0.0, 1.0);
      gl_FragColor = vec4(c * a, a);
    }`;

  const Transicion = (() => {
    let lienzo = null, gl = null, prog = null, css = null;
    let p = 0, objetivo = 0, raf = 0, semilla = 0;
    let pendientes = [];

    function preparar() {
      if (lienzo || css) return;
      if (hayWebGL) {
        lienzo = document.createElement("canvas");
        lienzo.id = "capa-transicion";
        lienzo.setAttribute("aria-hidden", "true");
        gl = contexto(lienzo, { alpha: true, premultipliedAlpha: true });
        try { if (gl) prog = programa(gl, FS_TRANSICION, ["uRes", "uP", "uSemilla", "uT"]); } catch { gl = null; }
        if (gl && prog) { document.body.appendChild(lienzo); return; }
        lienzo = null;
      }
      css = document.createElement("div");
      css.id = "capa-transicion";
      css.className = "transicion-css";
      document.body.appendChild(css);
    }

    function pintar() {
      if (css) { css.style.opacity = p.toFixed(3); return; }
      const factor = Math.min(1, 720 / Math.max(1, innerHeight));   // efecto barato: 720p basta
      const w = Math.max(1, Math.round(innerWidth * factor)), h = Math.max(1, Math.round(innerHeight * factor));
      if (lienzo.width !== w || lienzo.height !== h) { lienzo.width = w; lienzo.height = h; }
      lienzo.style.visibility = p > 0.001 ? "visible" : "hidden";
      if (p <= 0.001) return;
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      usar(gl, prog);
      gl.uniform2f(prog.u.uRes, w, h);
      gl.uniform1f(prog.u.uP, p);
      gl.uniform1f(prog.u.uSemilla, semilla);
      gl.uniform1f(prog.u.uT, performance.now() / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    let desde = 0, t0 = 0, duracion = 1;
    function cuadro(ahora) {
      // Basado en el tiempo real: dura lo mismo aunque el equipo vaya lento.
      const k = Math.min(1, Math.max(0, (ahora - t0) / duracion));
      p = desde + (objetivo - desde) * k;
      pintar();
      if (k < 1) raf = requestAnimationFrame(cuadro);
      else { raf = 0; const r = pendientes; pendientes = []; r.forEach((f) => f()); }
    }

    function animar(hasta, ms) {
      preparar();
      const r = pendientes; pendientes = []; r.forEach((f) => f());   // la anterior se da por acabada
      desde = p;
      objetivo = hasta;
      duracion = Math.max(16, ms);
      t0 = performance.now();
      return new Promise((resolver) => {
        pendientes.push(resolver);
        if (!raf) raf = requestAnimationFrame(cuadro);
      });
    }

    const activas = () => cfg.transiciones;

    /** Cubre la pantalla de sangre (resuelve cuando está totalmente cubierta). */
    function cubrir(ms = 320) {
      if (!activas()) return Promise.resolve();
      if (p === 0) semilla = Math.random() * 50;
      return animar(1, ms * (1 - p));
    }

    /** Descubre la pantalla quemando la película. */
    function descubrir(ms = 850) {
      if (!activas()) { if (p) { p = objetivo = 0; pintar(); } return Promise.resolve(); }
      semilla = Math.random() * 50;
      return animar(0, ms);
    }

    /** Corte a negro instantáneo y revelado (cambio de pantalla). */
    function revelar(ms = 900) {
      if (!activas()) return Promise.resolve();
      preparar();
      p = 1;
      pintar();
      return descubrir(ms);
    }

    return { cubrir, descubrir, revelar, activas };
  })();

  return {
    get hayWebGL() { return hayWebGL; },
    config: () => ({ ...cfg }),
    calidad, escalado, avanzado, setConfig,
    dprSalida, dprInterno,
    crearPostSala,
    iniciarTitulo: () => Titulo.iniciar(),
    Transicion
  };
})();
