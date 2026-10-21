/*
 * ============================================================================
 *  generar-ilustraciones.js — Ilustraciones originales para las fichas sin imagen.
 *  Las ilustraciones no llevan el nombre escrito: la web ya lo pone encima.
 * ============================================================================
 *  Recorre contenido/*.json y, a cada ficha con "imagen" vacía, le dibuja una
 *  ilustración SVG propia según su sección y le asigna la ruta:
 *
 *    juegos          → carátula con emblema, título y año
 *    peliculas       → póster con tira de película
 *    personajes      → expediente con silueta y sello de «clasificado»
 *    criaturas       → espécimen en un tanque de cultivo
 *    virus           → muestra al microscopio
 *    organizaciones  → insignia con las siglas
 *    ubicaciones     → plano topográfico con coordenadas
 *
 *  Son dibujos originales (sin material de terceros), ligeros y
 *  deterministas: la misma ficha produce siempre la misma ilustración.
 *  Para cambiar una por una foto, pon su ruta en el campo «imagen» del JSON.
 *
 *  Uso (desde la carpeta del proyecto):   node herramientas/generar-ilustraciones.js
 *  Con --todas regenera también las ilustraciones ya asignadas por este script.
 * ============================================================================
 */
"use strict";
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const SEMILLA = path.join(RAIZ, "contenido");
const DESTINO = path.join(RAIZ, "web", "img", "ilustraciones");
const RUTA_WEB = "/img/ilustraciones";
const TODAS = process.argv.includes("--todas");

const W = 800, H = 1000;
const F_TITULO = "Cinzel, 'Trajan Pro', Georgia, 'Times New Roman', serif";
const F_UI = "Oswald, 'Arial Narrow', 'Segoe UI', Arial, sans-serif";
const F_MONO = "'Share Tech Mono', Consolas, 'Courier New', monospace";

// ---------------------------------------------------------------------------
//  Utilidades
// ---------------------------------------------------------------------------

/** Generador pseudoaleatorio con semilla (mulberry32). */
function azar(texto) {
  let a = [...texto].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0, 1779033703);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const r1 = (n) => Math.round(n * 10) / 10;

/** Corta un texto en líneas de como mucho `max` caracteres. */
function lineas(texto, max) {
  const out = [];
  let act = "";
  for (const p of String(texto).split(/\s+/)) {
    if ((act + " " + p).trim().length > max && act) {
      out.push(act);
      act = p;
    } else {
      act = (act + " " + p).trim();
    }
  }
  if (act) out.push(act);
  return out;
}

/** Título sin el prefijo «Resident Evil:», que ya lo dice la portada. */
const tituloCorto = (t) => String(t).replace(/^Resident Evil\s*[:–-]?\s*/i, "").trim() || String(t);

/** Iniciales o siglas («B.S.A.A.» → «BSAA», «Umbrella Corporation» → «UC»). */
function siglas(t) {
  const limpio = String(t).replace(/\(.*?\)/g, "").trim();
  if (/^([A-Z]\.){2,}/.test(limpio)) return limpio.replace(/[^A-Z]/g, "").slice(0, 4);
  const pal = limpio.split(/[\s-]+/).filter((p) => /^[A-ZÁÉÍÓÚÑ]/.test(p) && !/^(De|La|El|Los|Las|Il|The)$/.test(p));
  return (pal.length > 1 ? pal.map((p) => p[0]).join("") : limpio.slice(0, 2)).toUpperCase().slice(0, 4);
}

/** Aclara (+) u oscurece (-) un color hexadecimal. */
function tono(hex, k) {
  const n = parseInt(String(hex).replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k))));
  return "#" + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, "0")).join("");
}

/** Bloque de texto centrado, con tamaño ajustado a la línea más larga. */
function textoCentrado(texto, { y, max = 16, tam = 74, min = 40, fuente = F_TITULO, color = "#f2ecdf", peso = 900, espacio = 4, alto = 1.08, x = W / 2 }) {
  const ls = lineas(texto.toUpperCase(), max);
  const largo = Math.max(...ls.map((l) => l.length));
  // Las mayúsculas de Cinzel/Georgia ocupan ~0,8 em, más el espaciado entre letras.
  const t = Math.max(min, Math.min(tam, Math.floor((W - 140 - largo * espacio) / (largo * 0.8))));
  return ls.map((l, i) => `<text x="${x}" y="${r1(y + i * t * alto)}" text-anchor="middle" font-family="${fuente}" font-size="${t}" font-weight="${peso}" letter-spacing="${espacio}" fill="${color}">${esc(l)}</text>`).join("");
}

/** Contorno orgánico cerrado alrededor de (cx, cy). */
function mancha(rnd, cx, cy, radio, puntos = 14, var_ = 0.35) {
  const pts = [];
  for (let i = 0; i < puntos; i++) {
    const a = (i / puntos) * Math.PI * 2;
    const r = radio * (1 - var_ / 2 + rnd() * var_);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  let d = `M${r1((pts[0][0] + pts[1][0]) / 2)} ${r1((pts[0][1] + pts[1][1]) / 2)}`;
  for (let i = 1; i <= puntos; i++) {
    const p = pts[i % puntos], q = pts[(i + 1) % puntos];
    d += ` Q${r1(p[0])} ${r1(p[1])} ${r1((p[0] + q[0]) / 2)} ${r1((p[1] + q[1]) / 2)}`;
  }
  return d + "Z";
}

const BIOHAZARD = `<g fill="none" stroke-width="10"><circle r="20"/><circle cy="-33" r="33"/><circle cx="28.6" cy="16.5" r="33"/><circle cx="-28.6" cy="16.5" r="33"/><circle r="52" stroke-width="6" stroke-dasharray="14 10"/></g>`;

/** Fondo común: degradado, grano y viñeta. */
function base(id, color, extraDefs = "") {
  return `<defs>
    <radialGradient id="fondo" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="${tono(color, -0.35)}"/><stop offset=".6" stop-color="${tono(color, -0.78)}"/><stop offset="1" stop-color="#050506"/></radialGradient>
    <radialGradient id="vineta" cx="50%" cy="50%" r="72%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
    <filter id="grano" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 97}"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0"/></filter>
    <filter id="brillo"><feGaussianBlur stdDeviation="14"/></filter>
    ${extraDefs}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fondo)"/>`;
}
const acabado = () => `<rect width="${W}" height="${H}" filter="url(#grano)"/><rect width="${W}" height="${H}" fill="url(#vineta)"/>`;
const svg = (titulo, cuerpo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(titulo)}"><title>${esc(titulo)}</title>${cuerpo}</svg>\n`;

// ---------------------------------------------------------------------------
//  Plantillas por sección
// ---------------------------------------------------------------------------

function juego(id, f) {
  const c = f.color || "#8a1020";
  const rnd = azar(id);
  let rayos = "";
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, l = 300 + rnd() * 500;
    rayos += `<line x1="400" y1="430" x2="${r1(400 + Math.cos(a) * l)}" y2="${r1(430 + Math.sin(a) * l)}" stroke="${tono(c, 0.2)}" stroke-width="${r1(1 + rnd() * 3)}" opacity="${r1(0.05 + rnd() * 0.12)}"/>`;
  }
  const subt = f.subtitulo ? textoCentrado(f.subtitulo, { y: 760, max: 30, tam: 30, min: 22, fuente: F_UI, peso: 500, espacio: 3, color: tono(c, 0.55) }) : "";
  return svg(f.titulo, base(id, c) + rayos + `
    <g transform="translate(400 400) scale(2.4)" stroke="${tono(c, 0.25)}" opacity=".35">${BIOHAZARD}</g>
    <g transform="translate(400 400) scale(2.4)" stroke="${tono(c, 0.5)}" opacity=".5" filter="url(#brillo)">${BIOHAZARD}</g>
    <text x="400" y="150" text-anchor="middle" font-family="${F_UI}" font-size="34" font-weight="600" letter-spacing="14" fill="${tono(c, 0.6)}">RESIDENT EVIL</text>
    <line x1="230" y1="175" x2="570" y2="175" stroke="${tono(c, 0.3)}" stroke-width="2"/>
    ${textoCentrado(tituloCorto(f.titulo), { y: 610, max: 14, tam: 96, min: 50 })}
    ${subt}
    <rect x="300" y="845" width="200" height="54" rx="4" fill="none" stroke="${tono(c, 0.4)}" stroke-width="2"/>
    <text x="400" y="883" text-anchor="middle" font-family="${F_MONO}" font-size="30" letter-spacing="6" fill="#f2ecdf">${esc(f.anio || "")}</text>
    <text x="400" y="950" text-anchor="middle" font-family="${F_MONO}" font-size="18" letter-spacing="5" fill="${tono(c, 0.35)}">${esc((f.tipo || "").toUpperCase())}</text>
  ` + acabado());
}

function pelicula(id, f) {
  const c = f.color || "#3a5a7a";
  const rnd = azar(id);
  let perfs = "";
  for (let y = 20; y < H; y += 46) perfs += `<rect x="18" y="${y}" width="22" height="28" rx="4"/><rect x="${W - 40}" y="${y}" width="22" height="28" rx="4"/>`;
  let ciudad = "";
  let x = 60;
  while (x < W - 60) {
    const an = 30 + rnd() * 70, al = 80 + rnd() * 260;
    ciudad += `<rect x="${r1(x)}" y="${r1(780 - al)}" width="${r1(an)}" height="${r1(al)}"/>`;
    for (let v = 0; v < al / 30; v++) if (rnd() < 0.18) ciudad += `<rect x="${r1(x + 6 + rnd() * (an - 16))}" y="${r1(790 - al + v * 28)}" width="6" height="9" fill="${tono(c, 0.6)}" opacity=".7"/>`;
    x += an + 4;
  }
  const extra = `<linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tono(c, -0.85)}"/><stop offset=".7" stop-color="${tono(c, -0.2)}"/><stop offset="1" stop-color="${tono(c, -0.6)}"/></linearGradient>`;
  const meta = [f.director ? "DIR. " + f.director.toUpperCase() : "", f.duracion || ""].filter(Boolean).join("  ·  ");
  return svg(f.titulo, base(id, c, extra) + `
    <rect x="60" y="0" width="${W - 120}" height="${H}" fill="url(#cielo)"/>
    <circle cx="${r1(200 + rnd() * 400)}" cy="330" r="110" fill="${tono(c, 0.5)}" opacity=".35" filter="url(#brillo)"/>
    <g fill="#050506">${ciudad}<rect x="60" y="778" width="${W - 120}" height="230"/></g>
    <g fill="#0d0d10">${perfs}</g><rect x="0" y="0" width="60" height="${H}" fill="#050506" opacity=".55"/><rect x="${W - 60}" y="0" width="60" height="${H}" fill="#050506" opacity=".55"/>
    <g fill="#d8d0c0" opacity=".85">${perfs}</g>
    <text x="400" y="120" text-anchor="middle" font-family="${F_UI}" font-size="28" font-weight="600" letter-spacing="12" fill="${tono(c, 0.6)}">RESIDENT EVIL</text>
    ${textoCentrado(tituloCorto(f.titulo), { y: 830, max: 18, tam: 70, min: 38 })}
    <text x="400" y="965" text-anchor="middle" font-family="${F_MONO}" font-size="20" letter-spacing="4" fill="#a8a094">${esc(meta)}</text>
    <text x="400" y="175" text-anchor="middle" font-family="${F_MONO}" font-size="30" letter-spacing="8" fill="#f2ecdf">${esc(f.anio || "")}</text>
  ` + acabado());
}

function personaje(id, f) {
  const c = f.color || "#5a4a3a";
  const rnd = azar(id);
  const ladeo = r1((rnd() - 0.5) * 8);
  let rejilla = "";
  for (let y = 120; y < 760; y += 40) rejilla += `<line x1="140" y1="${y}" x2="660" y2="${y}"/>`;
  const estado = (f.estado || "").toUpperCase();
  const sello = /MUERT|FALLEC/.test(estado) ? "FALLECIDO" : /DESAPAREC|DESCONOC/.test(estado) ? "PARADERO DESCONOCIDO" : "CLASIFICADO";
  return svg(f.titulo, base(id, c, `<linearGradient id="luz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${tono(c, 0.5)}" stop-opacity=".9"/><stop offset=".4" stop-color="#0b0b0e" stop-opacity="0"/></linearGradient>`) + `
    <rect x="120" y="100" width="560" height="680" fill="#0b0b0e" stroke="${tono(c, 0.2)}" stroke-width="3"/>
    <g stroke="${tono(c, 0.1)}" stroke-width="1" opacity=".35">${rejilla}</g>
    <g font-family="${F_MONO}" font-size="16" fill="${tono(c, 0.4)}" opacity=".8"><text x="138" y="752">6'0"</text><text x="138" y="472">5'0"</text><text x="138" y="192">4'0"</text></g>
    <circle cx="400" cy="380" r="210" fill="${tono(c, 0.3)}" opacity=".35" filter="url(#brillo)"/>
    <g transform="rotate(${ladeo} 400 560)">
      <path d="M190 780 C200 650 270 600 340 585 L350 540 C320 520 300 470 300 400 C300 320 345 270 400 270 C455 270 500 320 500 400 C500 470 480 520 450 540 L460 585 C530 600 600 650 610 780 Z" fill="#050506"/>
      <path d="M190 780 C200 650 270 600 340 585 L350 540 C320 520 300 470 300 400 C300 320 345 270 400 270 C455 270 500 320 500 400 C500 470 480 520 450 540 L460 585 C530 600 600 650 610 780 Z" fill="url(#luz)" opacity=".55"/>
    </g>
    <g transform="rotate(-12 560 210)"><rect x="${640 - sello.length * 17 - 40}" y="180" width="${sello.length * 17 + 40}" height="56" fill="none" stroke="#c8102e" stroke-width="5" opacity=".85"/><text x="${640 - sello.length * 17 - 20}" y="218" textLength="${sello.length * 17}" lengthAdjust="spacingAndGlyphs" font-family="${F_UI}" font-size="28" font-weight="600" fill="#c8102e" opacity=".9">${esc(sello)}</text></g>
  ` + acabado());
}

function criatura(id, f) {
  const c = f.color || "#4a7a3a";
  const rnd = azar(id);
  const cuerpo = mancha(rnd, 400, 470, 130 + rnd() * 40, 16, 0.5);
  let tent = "";
  const n = 4 + Math.floor(rnd() * 5);
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, l = 150 + rnd() * 120;
    const x1 = 400 + Math.cos(a) * 110, y1 = 470 + Math.sin(a) * 110;
    const x2 = 400 + Math.cos(a) * l * 1.4, y2 = 470 + Math.sin(a) * l * 1.4;
    const cx = (x1 + x2) / 2 + (rnd() - 0.5) * 160, cy = (y1 + y2) / 2 + (rnd() - 0.5) * 160;
    tent += `<path d="M${r1(x1)} ${r1(y1)} Q${r1(cx)} ${r1(cy)} ${r1(x2)} ${r1(y2)}" stroke-width="${r1(14 + rnd() * 18)}"/>`;
  }
  let burbujas = "";
  for (let i = 0; i < 26; i++) burbujas += `<circle cx="${r1(230 + rnd() * 340)}" cy="${r1(200 + rnd() * 560)}" r="${r1(2 + rnd() * 9)}"/>`;
  const ojos = rnd() < 0.7 ? `<circle cx="${r1(370 + rnd() * 20)}" cy="${r1(440 + rnd() * 20)}" r="9" fill="${tono(c, 0.85)}"/><circle cx="${r1(420 + rnd() * 20)}" cy="${r1(440 + rnd() * 20)}" r="6" fill="${tono(c, 0.85)}"/>` : `<circle cx="400" cy="450" r="16" fill="${tono(c, 0.85)}"/>`;
  const extra = `<linearGradient id="liquido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tono(c, 0.15)}" stop-opacity=".55"/><stop offset="1" stop-color="${tono(c, -0.5)}" stop-opacity=".9"/></linearGradient>
    <linearGradient id="vidrio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".15" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>
    <clipPath id="tanque"><rect x="210" y="150" width="380" height="640" rx="60"/></clipPath>`;
  return svg(f.titulo, base(id, c, extra) + `
    <rect x="180" y="100" width="440" height="60" rx="10" fill="#1a1a1f" stroke="#2c2c34" stroke-width="3"/>
    <rect x="180" y="780" width="440" height="70" rx="10" fill="#1a1a1f" stroke="#2c2c34" stroke-width="3"/>
    <g clip-path="url(#tanque)">
      <rect x="210" y="150" width="380" height="640" fill="url(#liquido)"/>
      <circle cx="400" cy="470" r="200" fill="${tono(c, 0.4)}" opacity=".35" filter="url(#brillo)"/>
      <g stroke="#08080a" fill="none" stroke-linecap="round" opacity=".92">${tent}</g>
      <path d="${cuerpo}" fill="#08080a" opacity=".95"/>
      ${ojos}
      <g fill="#fff" opacity=".25">${burbujas}</g>
      <rect x="210" y="150" width="380" height="640" fill="url(#vidrio)"/>
    </g>
    <rect x="210" y="150" width="380" height="640" rx="60" fill="none" stroke="${tono(c, 0.35)}" stroke-width="4" opacity=".6"/>
  ` + acabado());
}

function virus(id, f) {
  const c = f.color || "#4a8a5a";
  const rnd = azar(id);
  const hongo = /moho|micet|cadou|hongo/i.test(id + " " + (f.tipo || ""));
  const plaga = /plaga/i.test(id);
  let celulas = "";
  for (let i = 0; i < 46; i++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 300;
    const x = 400 + Math.cos(a) * d, y = 440 + Math.sin(a) * d, r = 10 + rnd() * 34;
    if (hongo) {
      celulas += `<path d="${mancha(rnd, x, y, r, 10, 0.6)}" fill="${tono(c, -0.2)}" stroke="${tono(c, 0.4)}" stroke-width="2" opacity=".75"/>`;
      celulas += `<path d="M${r1(x)} ${r1(y)} q${r1((rnd() - 0.5) * 120)} ${r1((rnd() - 0.5) * 120)} ${r1((rnd() - 0.5) * 200)} ${r1((rnd() - 0.5) * 200)}" fill="none" stroke="${tono(c, 0.3)}" stroke-width="2" opacity=".5"/>`;
    } else if (plaga) {
      celulas += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(r * 1.5)}" ry="${r1(r * 0.6)}" transform="rotate(${Math.floor(rnd() * 180)} ${r1(x)} ${r1(y)})" fill="${tono(c, -0.3)}" stroke="${tono(c, 0.45)}" stroke-width="2" opacity=".8"/>`;
    } else {
      let picos = "";
      const np = 10 + Math.floor(rnd() * 6);
      for (let k = 0; k < np; k++) {
        const b = (k / np) * Math.PI * 2;
        picos += `<line x1="${r1(x + Math.cos(b) * r)}" y1="${r1(y + Math.sin(b) * r)}" x2="${r1(x + Math.cos(b) * r * 1.35)}" y2="${r1(y + Math.sin(b) * r * 1.35)}"/><circle cx="${r1(x + Math.cos(b) * r * 1.4)}" cy="${r1(y + Math.sin(b) * r * 1.4)}" r="${r1(r * 0.08 + 1)}"/>`;
      }
      celulas += `<g stroke="${tono(c, 0.45)}" fill="${tono(c, 0.45)}" stroke-width="2" opacity=".8">${picos}</g><circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${tono(c, -0.35)}" stroke="${tono(c, 0.5)}" stroke-width="2.5" opacity=".9"/><circle cx="${r1(x - r * 0.25)}" cy="${r1(y - r * 0.25)}" r="${r1(r * 0.35)}" fill="${tono(c, 0.2)}" opacity=".5"/>`;
    }
  }
  const extra = `<clipPath id="lente"><circle cx="400" cy="440" r="330"/></clipPath><radialGradient id="campo" cx="50%" cy="45%" r="50%"><stop offset="0" stop-color="${tono(c, -0.4)}"/><stop offset="1" stop-color="${tono(c, -0.9)}"/></radialGradient>`;
  let marcas = "";
  for (let i = -300; i <= 300; i += 30) marcas += `<line x1="${400 + i}" y1="${i % 150 === 0 ? 425 : 432}" x2="${400 + i}" y2="440"/>`;
  return svg(f.titulo, base(id, c, extra) + `
    <circle cx="400" cy="440" r="350" fill="#111114" stroke="#26262c" stroke-width="16"/>
    <g clip-path="url(#lente)"><rect width="${W}" height="${H}" fill="url(#campo)"/>${celulas}
      <g stroke="#fff" stroke-width="1.5" opacity=".35">${marcas}<line x1="70" y1="440" x2="730" y2="440"/></g>
      <circle cx="400" cy="440" r="330" fill="none" stroke="#000" stroke-width="60" opacity=".5" filter="url(#brillo)"/></g>
  ` + acabado());
}

function organizacion(id, f) {
  const c = f.color || "#2a4a7a";
  const rnd = azar(id);
  const s = siglas(f.titulo);
  const forma = Math.floor(rnd() * 3);
  const insignia = forma === 0
    ? `<path d="M400 190 L620 280 C620 470 540 600 400 680 C260 600 180 470 180 280 Z"/>`
    : forma === 1
      ? `<polygon points="400,180 625,310 625,570 400,700 175,570 175,310"/>`
      : `<circle cx="400" cy="440" r="250"/>`;
  const lema = f.lema || f.tipo || "";
  let radios = "";
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    radios += `<line x1="${r1(400 + Math.cos(a) * 285)}" y1="${r1(440 + Math.sin(a) * 285)}" x2="${r1(400 + Math.cos(a) * 300)}" y2="${r1(440 + Math.sin(a) * 300)}"/>`;
  }
  const t = s.length <= 2 ? 190 : s.length === 3 ? 150 : 118;
  return svg(f.titulo, base(id, c) + `
    <g stroke="${tono(c, 0.3)}" stroke-width="3" opacity=".45">${radios}</g>
    <circle cx="400" cy="440" r="270" fill="${tono(c, 0.2)}" opacity=".25" filter="url(#brillo)"/>
    <g fill="${tono(c, -0.55)}" stroke="${tono(c, 0.45)}" stroke-width="10">${insignia}</g>
    <g fill="none" stroke="${tono(c, 0.2)}" stroke-width="3" opacity=".7" transform="translate(400 440) scale(.88) translate(-400 -440)">${insignia}</g>
    <text x="400" y="${440 + t * 0.35}" text-anchor="middle" font-family="${F_TITULO}" font-size="${t}" font-weight="900" letter-spacing="6" fill="#f2ecdf">${esc(s)}</text>
  ` + acabado());
}

function ubicacion(id, f) {
  const c = f.color || "#3a6a5a";
  const rnd = azar(id);
  let curvas = "";
  for (let k = 0; k < 3; k++) {
    const cx = 150 + rnd() * 500, cy = 200 + rnd() * 450;
    for (let i = 1; i <= 9; i++) curvas += `<path d="${mancha(rnd, cx, cy, i * (24 + rnd() * 10), 18, 0.25)}" stroke-width="${i % 3 === 0 ? 2.5 : 1.2}"/>`;
  }
  let rejilla = "";
  for (let x = 0; x <= W; x += 80) rejilla += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 0; y <= H; y += 80) rejilla += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  const mx = 280 + rnd() * 240, my = 330 + rnd() * 220;
  const lat = typeof f.lat === "number" ? `${Math.abs(f.lat).toFixed(2)}°${f.lat >= 0 ? "N" : "S"}` : "??.??°";
  const lng = typeof f.lng === "number" ? `${Math.abs(f.lng).toFixed(2)}°${f.lng >= 0 ? "E" : "O"}` : "??.??°";
  let ruta = `M${r1(60 + rnd() * 80)} ${r1(780 - rnd() * 100)}`;
  for (let i = 0; i < 4; i++) ruta += ` Q${r1(100 + rnd() * 600)} ${r1(200 + rnd() * 600)} ${r1(i === 3 ? mx : 100 + rnd() * 600)} ${r1(i === 3 ? my : 200 + rnd() * 600)}`;
  return svg(f.titulo, base(id, c) + `
    <rect width="${W}" height="${H}" fill="${tono(c, -0.82)}" opacity=".6"/>
    <g stroke="${tono(c, 0.15)}" stroke-width="1" opacity=".25">${rejilla}</g>
    <g fill="none" stroke="${tono(c, 0.35)}" opacity=".55">${curvas}</g>
    <path d="${ruta}" fill="none" stroke="#c8102e" stroke-width="4" stroke-dasharray="14 10" opacity=".8"/>
    <circle cx="${r1(mx)}" cy="${r1(my)}" r="70" fill="#c8102e" opacity=".3" filter="url(#brillo)"/>
    <g stroke="#ff2a3d" stroke-width="3" fill="none"><circle cx="${r1(mx)}" cy="${r1(my)}" r="34"/><circle cx="${r1(mx)}" cy="${r1(my)}" r="6" fill="#ff2a3d"/>
      <line x1="${r1(mx - 60)}" y1="${r1(my)}" x2="${r1(mx - 40)}" y2="${r1(my)}"/><line x1="${r1(mx + 40)}" y1="${r1(my)}" x2="${r1(mx + 60)}" y2="${r1(my)}"/>
      <line x1="${r1(mx)}" y1="${r1(my - 60)}" x2="${r1(mx)}" y2="${r1(my - 40)}"/><line x1="${r1(mx)}" y1="${r1(my + 40)}" x2="${r1(mx)}" y2="${r1(my + 60)}"/></g>
    <g transform="translate(700 110)" fill="none" stroke="${tono(c, 0.5)}" stroke-width="2"><circle r="40"/><path d="M0 -52 L10 0 L0 52 L-10 0 Z" fill="${tono(c, 0.3)}"/></g><text x="700" y="64" text-anchor="middle" font-family="${F_MONO}" font-size="18" fill="${tono(c, 0.6)}">N</text>
    <text x="60" y="110" font-family="${F_MONO}" font-size="22" letter-spacing="4" fill="${tono(c, 0.6)}">${esc(lat)}  ${esc(lng)}</text>
    <text x="60" y="140" font-family="${F_MONO}" font-size="18" letter-spacing="4" fill="#a8a094">${esc(((f.region || f.pais || "") + "").toUpperCase().slice(0, 38))}</text>
  ` + acabado());
}

const PLANTILLAS = { juegos: juego, peliculas: pelicula, personajes: personaje, criaturas: criatura, virus, organizaciones: organizacion, ubicaciones: ubicacion };

// ---------------------------------------------------------------------------
//  Programa
// ---------------------------------------------------------------------------

let total = 0;
for (const [seccion, dibujar] of Object.entries(PLANTILLAS)) {
  const archivo = path.join(SEMILLA, seccion + ".json");
  if (!fs.existsSync(archivo)) continue;
  let texto = fs.readFileSync(archivo, "utf8");
  const datos = JSON.parse(texto);
  let n = 0;
  for (const [id, f] of Object.entries(datos)) {
    const propia = `${RUTA_WEB}/${seccion}/${id}.svg`;
    if (f.imagen && !(TODAS && f.imagen === propia)) continue;
    const carpeta = path.join(DESTINO, seccion);
    fs.mkdirSync(carpeta, { recursive: true });
    fs.writeFileSync(path.join(carpeta, id + ".svg"), dibujar(id, f));
    if (!f.imagen) {
      // Solo se toca el campo "imagen" de esa ficha: el resto del archivo queda como estaba.
      const inicio = texto.indexOf(JSON.stringify(id) + ":");
      const campo = texto.indexOf('"imagen": ""', inicio);
      texto = texto.slice(0, campo) + `"imagen": ${JSON.stringify(propia)}` + texto.slice(campo + '"imagen": ""'.length);
    }
    n++;
  }
  if (n) {
    fs.writeFileSync(archivo, texto);
    JSON.parse(texto); // comprobación: el archivo sigue siendo JSON válido
  }
  console.log(`${seccion.padEnd(15)} ${n} ilustraciones`);
  total += n;
}
console.log(`Total: ${total} ilustraciones en web/img/ilustraciones/`);
