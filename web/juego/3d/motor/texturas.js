/* ============================================================================
 *  3d/motor/texturas.js — Texturas procedurales realistas (sin archivos)
 * ============================================================================
 *  Cada material se genera por código en un <canvas>: color (albedo), relieve
 *  (mapa de normales calculado con Sobel a partir de una altura) y rugosidad.
 *  Todas las texturas son "tileables" (se repiten sin costuras).
 *
 *  material(tipo) → THREE.MeshStandardMaterial listo para usar, en caché.
 *  Tipos: madera, madera_oscura, parquet, baldosa, azulejo, azulejo_verde,
 *  papel, papel_rojo, papel_verde, yeso, hormigon, asfalto, ladrillo, piedra,
 *  metal, oxido, tierra, barro, hierba, nieve, moqueta, moqueta_roja, roca.
 * ========================================================================== */
import * as THREE from "../lib/three.module.min.js";

let TAM = 512;
let anisotropia = 8;
export function configurar(op) { if (op.anisotropia) anisotropia = op.anisotropia; if (op.tam) TAM = op.tam; }

/* ---------------- Ruido de valor tileable ---------------- */
function generadorRuido(semilla) {
  let s = semilla >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  return function capa(periodo) {
    const g = new Float32Array(periodo * periodo);
    for (let i = 0; i < g.length; i++) g[i] = rnd();
    return (x, y) => {
      // x, y en [0,1): interpolación suave con envoltura
      const fx = x * periodo, fy = y * periodo;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = fx - x0, ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const i = (a, b) => g[((b % periodo + periodo) % periodo) * periodo + ((a % periodo + periodo) % periodo)];
      const a = i(x0, y0) + (i(x0 + 1, y0) - i(x0, y0)) * sx;
      const b = i(x0, y0 + 1) + (i(x0 + 1, y0 + 1) - i(x0, y0 + 1)) * sx;
      return a + (b - a) * sy;
    };
  };
}
function fbm(semilla, octavas = 5, base = 4) {
  const gen = generadorRuido(semilla);
  const capas = [];
  for (let o = 0; o < octavas; o++) capas.push(gen(base << o));
  return (x, y) => {
    let v = 0, amp = 0.5, tot = 0;
    for (const c of capas) { v += c(x, y) * amp; tot += amp; amp *= 0.5; }
    return v / tot;
  };
}

const mezclar = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const lim = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/**
 * Genera una textura con una función por píxel: f(u, v) → { c:[r,g,b] (0-255), h (0-1), r (0-1) }
 */
function crear(f, tam = TAM) {
  const albedo = new Uint8ClampedArray(tam * tam * 4);
  const altura = new Float32Array(tam * tam);
  const rug = new Uint8ClampedArray(tam * tam * 4);
  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      const p = f(x / tam, y / tam);
      const i = y * tam + x;
      albedo[i * 4] = p.c[0]; albedo[i * 4 + 1] = p.c[1]; albedo[i * 4 + 2] = p.c[2]; albedo[i * 4 + 3] = 255;
      altura[i] = p.h;
      const r = lim(p.r) * 255;
      rug[i * 4] = r; rug[i * 4 + 1] = r; rug[i * 4 + 2] = r; rug[i * 4 + 3] = 255;
    }
  }
  // Normales con Sobel (envolviendo los bordes para que sea tileable)
  const nor = new Uint8ClampedArray(tam * tam * 4);
  const H = (x, y) => altura[((y + tam) % tam) * tam + ((x + tam) % tam)];
  const fuerza = 2.4;
  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      const dx = (H(x + 1, y - 1) + 2 * H(x + 1, y) + H(x + 1, y + 1)) - (H(x - 1, y - 1) + 2 * H(x - 1, y) + H(x - 1, y + 1));
      const dy = (H(x - 1, y + 1) + 2 * H(x, y + 1) + H(x + 1, y + 1)) - (H(x - 1, y - 1) + 2 * H(x, y - 1) + H(x + 1, y - 1));
      let nx = -dx * fuerza, ny = -dy * fuerza, nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l; ny /= l; nz /= l;
      const i = (y * tam + x) * 4;
      nor[i] = (nx * 0.5 + 0.5) * 255; nor[i + 1] = (ny * 0.5 + 0.5) * 255; nor[i + 2] = (nz * 0.5 + 0.5) * 255; nor[i + 3] = 255;
    }
  }
  const tex = (datos, srgb) => {
    const t = new THREE.DataTexture(datos, tam, tam, THREE.RGBAFormat);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.anisotropy = anisotropia;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  };
  return { map: tex(albedo, true), normalMap: tex(nor, false), roughnessMap: tex(rug, false) };
}

/* ---------------- Recetas de cada material ---------------- */
const RECETAS = {
  madera(ext = {}) {
    const n = fbm(11, 5, 4), veta = fbm(23, 4, 2), d = fbm(31, 3, 8);
    const claro = ext.claro || [120, 82, 52], oscuro = ext.oscuro || [62, 38, 22];
    const tablas = ext.tablas || 6;
    return (u, v) => {
      const fila = Math.floor(v * tablas);
      const desfase = ((fila * 37) % 10) / 10;
      const uu = (u + desfase) % 1;
      const junta = Math.min(v * tablas - fila, 1 - (v * tablas - fila)) < 0.03 || ((uu * 2) % 1) < 0.006;
      const vt = Math.sin((uu * 60 + veta(uu, v * 0.3 + fila * 0.17) * 18) + fila) * 0.5 + 0.5;
      const t = lim(vt * 0.55 + n(u, v) * 0.45);
      let c = mezclar(oscuro, claro, t);
      const sucio = d(u, v);
      c = c.map((k) => k * (0.8 + sucio * 0.35));
      if (junta) c = c.map((k) => k * 0.35);
      return { c, h: junta ? 0 : 0.5 + vt * 0.15, r: 0.55 + n(u, v) * 0.3 };
    };
  },
  madera_oscura() { return RECETAS.madera({ claro: [78, 48, 30], oscuro: [32, 18, 12], tablas: 5 }); },
  parquet() {
    const n = fbm(5, 5, 6);
    return (u, v) => {
      const cx = Math.floor(u * 8), cy = Math.floor(v * 8);
      const horiz = (cx + cy) % 2 === 0;
      const lu = (u * 8) % 1, lv = (v * 8) % 1;
      const linea = horiz ? (lv * 3) % 1 : (lu * 3) % 1;
      const borde = linea < 0.05 || lu < 0.02 || lv < 0.02;
      const veta = Math.sin((horiz ? lu : lv) * 40 + n(u, v) * 10) * 0.5 + 0.5;
      let c = mezclar([70, 40, 22], [140, 92, 54], veta * 0.6 + n(u, v) * 0.4);
      if (borde) c = c.map((k) => k * 0.4);
      return { c, h: borde ? 0.1 : 0.5, r: 0.4 + n(u, v) * 0.2 };
    };
  },
  baldosa() {
    // Mármol blanco y negro en damero (vestíbulos clásicos)
    const n = fbm(41, 6, 4), vena = fbm(43, 5, 3);
    return (u, v) => {
      const cx = Math.floor(u * 4), cy = Math.floor(v * 4);
      const lu = (u * 4) % 1, lv = (v * 4) % 1;
      const junta = lu < 0.012 || lv < 0.012;
      const negro = (cx + cy) % 2 === 0;
      const m = Math.abs(Math.sin((u + vena(u, v) * 0.6) * 18));
      let c = negro ? mezclar([18, 18, 20], [58, 56, 60], m * 0.4 + n(u, v) * 0.3) : mezclar([170, 165, 155], [222, 218, 208], 1 - m * 0.35);
      c = c.map((k) => k * (0.82 + n(u * 2 % 1, v * 2 % 1) * 0.25));
      if (junta) c = [40, 36, 32];
      return { c, h: junta ? 0 : 0.6, r: junta ? 0.9 : 0.18 + n(u, v) * 0.15 };
    };
  },
  azulejo(ext = {}) {
    const n = fbm(51, 5, 8), d = fbm(57, 4, 3);
    const base = ext.base || [200, 200, 192];
    const porFila = ext.n || 8;
    return (u, v) => {
      const lu = (u * porFila) % 1, lv = (v * porFila) % 1;
      const junta = lu < 0.04 || lv < 0.04;
      let c = base.map((k) => k * (0.88 + n(u, v) * 0.15));
      const mancha = d(u, v);
      if (mancha > 0.62) c = mezclar(c, [90, 70, 40], (mancha - 0.62) * 1.6);
      if (junta) c = [70, 66, 58].map((k) => k * (0.7 + mancha * 0.4));
      return { c, h: junta ? 0.1 : 0.55, r: junta ? 0.95 : 0.2 };
    };
  },
  azulejo_verde() { return RECETAS.azulejo({ base: [96, 128, 108], n: 10 }); },
  papel(ext = {}) {
    // Papel pintado con damasco, envejecido, con manchas de humedad
    const n = fbm(61, 5, 4), hum = fbm(67, 4, 2);
    const fondo = ext.fondo || [92, 70, 52], dibujo = ext.dibujo || [128, 102, 72];
    return (u, v) => {
      const pu = (u * 4) % 1, pv = (v * 3) % 1;
      const dx = pu - 0.5, dy = pv - 0.5;
      const r = Math.hypot(dx * 1.4, dy);
      const flor = Math.abs(Math.sin(Math.atan2(dy, dx) * 4 + r * 18)) * (r < 0.42 ? 1 : 0) * (1 - r * 1.6);
      const raya = Math.abs(Math.sin(u * Math.PI * 16)) > 0.985;
      let c = mezclar(fondo, dibujo, lim(flor * 1.2));
      if (raya) c = mezclar(c, dibujo, 0.6);
      const h = hum(u, v);
      c = c.map((k) => k * (0.75 + n(u, v) * 0.3) * (h > 0.6 ? 1 - (h - 0.6) * 1.4 : 1));
      return { c, h: 0.4 + flor * 0.08 + n(u, v) * 0.05, r: 0.85 };
    };
  },
  papel_rojo() { return RECETAS.papel({ fondo: [82, 18, 20], dibujo: [128, 40, 36] }); },
  papel_verde() { return RECETAS.papel({ fondo: [40, 58, 44], dibujo: [70, 92, 64] }); },
  yeso() {
    const n = fbm(71, 6, 3), g = fbm(73, 4, 6);
    return (u, v) => {
      const k = n(u, v), m = g(u, v);
      let c = mezclar([150, 144, 132], [196, 190, 176], k);
      if (m > 0.64) c = mezclar(c, [96, 84, 66], (m - 0.64) * 2.4);
      const grieta = Math.abs(n(u * 0.5, v) - 0.5) < 0.006;
      if (grieta) c = c.map((x) => x * 0.5);
      return { c, h: 0.5 + k * 0.1 - (grieta ? 0.2 : 0), r: 0.92 };
    };
  },
  hormigon() {
    const n = fbm(81, 6, 4), p = fbm(83, 3, 16), m = fbm(87, 4, 2);
    return (u, v) => {
      const k = n(u, v), poro = p(u, v) > 0.78;
      let c = mezclar([72, 72, 70], [128, 126, 120], k).map((x) => x * (0.85 + m(u, v) * 0.25));
      if (poro) c = c.map((x) => x * 0.55);
      const junta = (v * 2) % 1 < 0.008;
      if (junta) c = c.map((x) => x * 0.5);
      return { c, h: 0.5 + k * 0.2 - (poro ? 0.25 : 0) - (junta ? 0.3 : 0), r: 0.9 };
    };
  },
  asfalto() {
    const n = fbm(91, 6, 16), m = fbm(93, 4, 2);
    return (u, v) => {
      const k = n(u, v);
      let c = mezclar([30, 30, 32], [70, 68, 66], k);
      const charco = m(u, v) > 0.66;
      if (charco) c = c.map((x) => x * 0.55);
      return { c, h: charco ? 0.3 : 0.4 + k * 0.3, r: charco ? 0.08 : 0.85 };
    };
  },
  ladrillo() {
    const n = fbm(101, 5, 8), m = fbm(103, 4, 3);
    return (u, v) => {
      const filas = 8, cols = 4;
      const fila = Math.floor(v * filas);
      const uu = (u * cols + (fila % 2) * 0.5) % 1;
      const lv = (v * filas) % 1;
      const junta = lv < 0.1 || uu < 0.05;
      const id = Math.floor(u * cols + (fila % 2) * 0.5) * 13 + fila * 7;
      const tono = ((id * 9301 + 49297) % 233280) / 233280;
      let c = mezclar([96, 40, 28], [150, 70, 48], tono * 0.6 + n(u, v) * 0.4);
      c = c.map((x) => x * (0.78 + m(u, v) * 0.3));
      if (junta) c = [70, 66, 60].map((x) => x * (0.7 + n(u, v) * 0.4));
      return { c, h: junta ? 0.1 : 0.6 + n(u, v) * 0.1, r: 0.9 };
    };
  },
  piedra() {
    // Sillares de castillo
    const n = fbm(111, 6, 4), m = fbm(113, 4, 3), musgo = fbm(117, 4, 2);
    return (u, v) => {
      const filas = 4, cols = 3;
      const fila = Math.floor(v * filas);
      const uu = (u * cols + (fila % 2) * 0.5) % 1;
      const lv = (v * filas) % 1;
      const borde = Math.min(lv, 1 - lv, uu * 1.3, (1 - uu) * 1.3);
      const junta = borde < 0.04;
      let c = mezclar([62, 60, 56], [120, 114, 104], n(u, v)).map((x) => x * (0.8 + m(u, v) * 0.3));
      const mm = musgo(u, v);
      if (mm > 0.62) c = mezclar(c, [48, 64, 36], (mm - 0.62) * 2);
      if (junta) c = c.map((x) => x * 0.35);
      return { c, h: junta ? 0 : 0.4 + lim(borde * 4) * 0.3 + n(u, v) * 0.2, r: 0.88 };
    };
  },
  metal() {
    const n = fbm(121, 5, 8), r = fbm(123, 4, 3);
    return (u, v) => {
      const lu = (u * 2) % 1, lv = (v * 2) % 1;
      const junta = lu < 0.01 || lv < 0.01;
      const remache = [0.06, 0.94].some((a) => [0.06, 0.94].some((b) => Math.hypot(lu - a, lv - b) < 0.018));
      let c = mezclar([70, 74, 78], [120, 124, 128], n(u, v));
      const ox = r(u, v);
      if (ox > 0.6) c = mezclar(c, [110, 60, 30], (ox - 0.6) * 2);
      if (junta) c = c.map((x) => x * 0.4);
      return { c, h: remache ? 0.9 : junta ? 0.1 : 0.5, r: 0.35 + ox * 0.4 };
    };
  },
  oxido() {
    const n = fbm(131, 6, 4);
    return (u, v) => {
      const k = n(u, v);
      return { c: mezclar([70, 32, 16], [150, 78, 36], k), h: k, r: 0.9 };
    };
  },
  tierra() {
    const n = fbm(141, 6, 4), p = fbm(143, 3, 24);
    return (u, v) => {
      const k = n(u, v), piedra = p(u, v) > 0.8;
      let c = mezclar([48, 36, 24], [104, 82, 56], k);
      if (piedra) c = mezclar(c, [120, 112, 100], 0.6);
      return { c, h: k * 0.6 + (piedra ? 0.4 : 0), r: 0.95 };
    };
  },
  barro() {
    const n = fbm(151, 6, 4), m = fbm(153, 4, 2);
    return (u, v) => {
      const k = n(u, v), agua = m(u, v) > 0.6;
      return { c: mezclar([34, 28, 18], [76, 62, 40], k).map((x) => x * (agua ? 0.6 : 1)), h: agua ? 0.2 : k * 0.5, r: agua ? 0.1 : 0.9 };
    };
  },
  hierba() {
    const n = fbm(161, 6, 6), b = fbm(163, 3, 32);
    return (u, v) => {
      const k = n(u, v), brizna = b(u, v);
      return { c: mezclar([26, 40, 18], [70, 92, 40], k * 0.6 + brizna * 0.4), h: brizna, r: 0.95 };
    };
  },
  nieve() {
    const n = fbm(171, 6, 4), h = fbm(173, 3, 16);
    return (u, v) => {
      const k = n(u, v);
      return { c: mezclar([170, 178, 190], [232, 236, 242], k), h: k * 0.5 + h(u, v) * 0.2, r: 0.7 };
    };
  },
  moqueta(ext = {}) {
    const n = fbm(181, 4, 64), p = fbm(183, 4, 3);
    const a = ext.a || [60, 22, 26], b = ext.b || [104, 70, 40];
    return (u, v) => {
      const du = (u * 4) % 1 - 0.5, dv = (v * 4) % 1 - 0.5;
      const rombo = Math.abs(du) + Math.abs(dv) < 0.3 && Math.abs(du) + Math.abs(dv) > 0.24;
      let c = rombo ? b : a;
      c = c.map((x) => x * (0.75 + n(u, v) * 0.35) * (0.8 + p(u, v) * 0.3));
      return { c, h: n(u, v) * 0.3, r: 0.98 };
    };
  },
  moqueta_roja() { return RECETAS.moqueta({ a: [92, 12, 16], b: [150, 110, 50] }); },
  roca() {
    const n = fbm(191, 7, 3);
    return (u, v) => {
      const k = n(u, v);
      return { c: mezclar([46, 42, 38], [104, 98, 90], k), h: k, r: 0.9 };
    };
  }
};

const cache = new Map();

/** Material PBR de un tipo, compartido (las paredes ajustan sus UV al tamaño real). */
export function material(tipo, extra = {}) {
  const clave = tipo + JSON.stringify(extra);
  if (cache.has(clave)) return cache.get(clave);
  const receta = RECETAS[tipo] || RECETAS.yeso;
  const t = crear(receta());
  const m = new THREE.MeshStandardMaterial({
    map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap,
    roughness: 1, metalness: tipo === "metal" ? 0.55 : 0,
    normalScale: new THREE.Vector2(1, 1),
    ...extra
  });
  cache.set(clave, m);
  return m;
}

/** Texturas sueltas (para decals de sangre, etc.) */
export function texturaSangre() {
  if (cache.has("_sangre")) return cache.get("_sangre");
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const n = fbm(201, 5, 4);
  const img = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const dx = x / 256 - 0.5, dy = y / 256 - 0.5;
    const r = Math.hypot(dx, dy) * 2;
    const borde = 0.55 + n(x / 256, y / 256) * 0.55;
    const a = r < borde ? lim((borde - r) * 6) : 0;
    const salp = n((x * 3 % 256) / 256, (y * 3 % 256) / 256) > 0.74 && r < 1 ? 0.8 : 0;
    const al = Math.max(a, salp);
    const i = (y * 256 + x) * 4;
    img.data[i] = 70 + n(x / 256, y / 256) * 40; img.data[i + 1] = 4; img.data[i + 2] = 6; img.data[i + 3] = al * 235;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  cache.set("_sangre", t);
  return t;
}

/** Ajusta las UV de una geometría para que 1 repetición = "metros" metros. */
export function escalarUV(geo, ancho, alto, metros = 2) {
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * ancho / metros, uv.getY(i) * alto / metros);
  uv.needsUpdate = true;
  return geo;
}
