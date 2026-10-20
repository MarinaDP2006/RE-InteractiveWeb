/* ============================================================================
 *  retratos.js — Generador de "fotos" de personajes en SVG
 * ============================================================================
 *
 *  Para no depender de imágenes con copyright, cada personaje tiene un retrato
 *  dibujado por código a partir de sus rasgos (pelo, piel, ropa, extras...).
 *  El resultado se aplica un filtro de grano y viñeta para parecer una foto
 *  vieja de expediente policial.
 *
 *  Si un personaje tiene la propiedad "foto" (ruta a una imagen real en
 *  public/img/personajes/), se usa esa imagen en lugar del dibujo.
 *
 *  Uso:   <img src="${Retratos.de('leon')}">
 *  Todo el SVG se dibuja en un lienzo de 100 × 100 unidades.
 * ========================================================================== */

"use strict";

const Retratos = (() => {
  /** Caché: cada retrato se genera una sola vez. */
  const cache = new Map();

  /* ------------------------------------------------------------------
   *  Utilidades de color
   * ---------------------------------------------------------------- */

  /** Oscurece (factor < 1) o aclara (factor > 1) un color hexadecimal. */
  function tono(hex, factor) {
    const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
    const canal = (desplazamiento) => {
      const v = Math.round(((n >> desplazamiento) & 255) * factor);
      return Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
    };
    return `#${canal(16)}${canal(8)}${canal(0)}`;
  }

  /* ------------------------------------------------------------------
   *  Piezas del dibujo. Cada función devuelve una cadena SVG.
   * ---------------------------------------------------------------- */

  /** Pelo que queda DETRÁS de la cabeza (melenas largas). */
  function peloDetras(p) {
    if (p.peinado === "largo") return `<path d="M29 40 Q26 82 33 92 L67 92 Q74 82 71 40 Z" fill="${p.pelo}"/>`;
    if (p.peinado === "coleta") return `<path d="M64 32 Q84 40 76 76 Q72 56 63 46 Z" fill="${p.pelo}"/>`;
    return "";
  }

  /** Pelo que queda DELANTE (flequillos, tupés, gorros de pelo...). */
  function peloDelante(p) {
    const c = p.pelo;
    switch (p.peinado) {
      case "corto":
        return `<path d="M32 42 Q31 19 50 18 Q69 19 68 42 Q64 30 50 29 Q36 30 32 42 Z" fill="${c}"/>`;
      case "flequillo": // Flequillo cortina al estilo Leon
        return `<path d="M32 44 Q30 18 51 17 Q71 18 68 42 L65 34 Q57 26 48 29 Q40 34 34 48 Z" fill="${c}"/>
                <path d="M47 24 Q62 30 60 54 Q55 40 43 33 Z" fill="${tono(c, 1.15)}"/>`;
      case "largo":
        return `<path d="M31 44 Q30 17 50 17 Q70 17 69 44 Q66 30 50 28 Q34 30 31 44 Z" fill="${c}"/>`;
      case "melena": // Media melena hasta la barbilla (bob)
        return `<path d="M31 46 Q29 17 50 17 Q71 17 69 46 L70 62 Q64 58 64 46 Q62 29 50 29 Q38 29 36 46 Q36 58 30 62 Z" fill="${c}"/>`;
      case "coleta":
        return `<path d="M32 42 Q31 18 50 18 Q69 18 68 42 Q63 29 50 28 Q37 29 32 42 Z" fill="${c}"/>`;
      case "rapado":
        return `<path d="M33 40 Q33 22 50 22 Q67 22 67 40 Q60 31 50 31 Q40 31 33 40 Z" fill="${c}" opacity=".75"/>`;
      case "mono": // Moño alto
        return `<circle cx="50" cy="16" r="8" fill="${c}"/>
                <path d="M32 42 Q31 19 50 19 Q69 19 68 42 Q63 29 50 28 Q37 29 32 42 Z" fill="${c}"/>`;
      case "repeinado": // Hacia atrás, engominado (Wesker, Simmons)
        return `<path d="M32 42 Q30 18 50 17 Q70 18 68 42 Q67 27 50 25 Q33 27 32 42 Z" fill="${c}"/>
                <path d="M38 22 Q50 19 62 22" stroke="${tono(c, 1.3)}" stroke-width="1" fill="none" opacity=".6"/>`;
      default: // calvo
        return "";
    }
  }

  /** Accesorios y rasgos especiales. */
  function extras(p) {
    const lista = p.extras || [];
    const tiene = (e) => lista.includes(e);
    let svg = "";

    if (tiene("barba")) svg += `<path d="M34 50 Q35 68 50 69 Q65 68 66 50 Q63 61 50 62 Q37 61 34 50 Z" fill="${p.pelo}" opacity=".85"/>`;
    if (tiene("perilla")) svg += `<path d="M45 60 Q50 67 55 60 Q50 63 45 60 Z" fill="${p.pelo}"/><path d="M44 56 Q50 54 56 56" stroke="${p.pelo}" stroke-width="1.6" fill="none"/>`;
    if (tiene("cicatriz")) svg += `<path d="M58 36 L64 54" stroke="#7a2020" stroke-width="1.6" stroke-linecap="round"/><path d="M59 41 l3 -1 M60 45 l3 -1 M61 49 l3 -1" stroke="#7a2020" stroke-width=".8"/>`;
    if (tiene("labios")) svg += `<path d="M44 57 Q50 54 56 57 Q50 61 44 57 Z" fill="#a3001b"/>`;
    if (tiene("gafas")) svg += `<rect x="36" y="40" width="12" height="7" rx="2" fill="#050505"/><rect x="52" y="40" width="12" height="7" rx="2" fill="#050505"/><path d="M48 43 L52 43" stroke="#050505" stroke-width="1.5"/><path d="M38 41 l4 0" stroke="#444" stroke-width=".8"/>`;
    if (tiene("gafas_redondas")) svg += `<circle cx="43" cy="44" r="5" fill="#1a1a1a" stroke="#777" stroke-width=".8"/><circle cx="57" cy="44" r="5" fill="#1a1a1a" stroke="#777" stroke-width=".8"/><path d="M48 44 L52 44" stroke="#777" stroke-width=".8"/>`;
    if (tiene("gafas_finas")) svg += `<rect x="37" y="41" width="11" height="6" rx="1.5" fill="none" stroke="#222" stroke-width=".9"/><rect x="52" y="41" width="11" height="6" rx="1.5" fill="none" stroke="#222" stroke-width=".9"/><path d="M48 44 L52 44" stroke="#222" stroke-width=".9"/>`;
    if (tiene("gorra")) svg += `<path d="M31 36 Q31 16 50 16 Q69 16 69 36 Z" fill="#5a3a1a"/><path d="M31 35 L76 37 Q72 41 52 39 Z" fill="#3a2410"/>`;
    if (tiene("sombrero")) {
      const s = p.sombrero || "#151515";
      svg += `<ellipse cx="50" cy="25" rx="27" ry="5" fill="${s}"/><path d="M35 25 Q35 6 50 6 Q65 6 65 25 Z" fill="${s}"/><rect x="35" y="19" width="30" height="3" fill="${tono(s, 1.8)}" opacity=".5"/>`;
    }
    if (tiene("sombrero_ancho")) {
      const s = p.sombrero || "#eeeeee";
      svg += `<ellipse cx="50" cy="24" rx="44" ry="8" fill="${s}"/><path d="M33 24 Q34 4 50 4 Q66 4 67 24 Z" fill="${s}"/><ellipse cx="50" cy="24" rx="44" ry="8" fill="none" stroke="#999" stroke-width=".6"/>`;
    }
    if (tiene("capucha")) svg += `<path d="M24 72 Q20 10 50 8 Q80 10 76 72 Q70 34 50 28 Q30 34 24 72 Z" fill="#0b0b0b"/>`;
    if (tiene("panuelo")) svg += `<path d="M33 50 Q50 46 67 50 L66 64 Q50 72 34 64 Z" fill="#3a2e20"/>`;
    if (tiene("p30")) svg += `<circle cx="50" cy="84" r="4.5" fill="#ff1a1a"/><circle cx="50" cy="84" r="8" fill="#ff1a1a" opacity=".25"/>`;
    if (tiene("cosido")) svg += `<path d="M38 58 L62 58" stroke="#2a0a0a" stroke-width="2"/><path d="M40 55 l0 6 M44 55 l0 6 M48 55 l0 6 M52 55 l0 6 M56 55 l0 6 M60 55 l0 6" stroke="#2a0a0a" stroke-width="1"/>`;
    if (tiene("cerebro")) svg += `<path d="M33 34 Q33 14 50 14 Q67 14 67 34 Q60 28 50 30 Q40 28 33 34 Z" fill="#e88aa0"/><path d="M38 24 q4 -4 8 0 q4 4 8 0 q4 -4 8 0 M40 30 q4 -3 8 0 q4 3 8 0" stroke="#9a3050" stroke-width="1" fill="none"/>`;
    if (tiene("lengua")) svg += `<path d="M48 60 Q46 78 60 86 Q72 92 84 84 Q70 86 62 80 Q54 72 53 60 Z" fill="#c2405a"/>`;
    if (tiene("saco")) {
      svg += `<ellipse cx="50" cy="44" rx="20" ry="24" fill="#8a6e46"/>`;
      svg += `<path d="M34 30 L66 34 M32 42 L68 44 M34 54 L66 56" stroke="#5a4426" stroke-width=".8"/>`;
      svg += `<ellipse cx="43" cy="43" rx="3" ry="2.2" fill="#000"/><ellipse cx="57" cy="43" rx="3" ry="2.2" fill="#000"/>`;
      svg += `<path d="M34 64 Q50 70 66 64" stroke="#3a2a14" stroke-width="2.5" fill="none"/>`;
    }
    if (tiene("sangre")) {
      svg += `<path d="M58 30 Q60 38 58 46 Q57 52 59 58 L60 58 Q61 50 61 44 Q62 36 58 30 Z" fill="#8a0303"/>`;
      svg += `<circle cx="40" cy="56" r="2" fill="#8a0303"/><circle cx="44" cy="62" r="1.2" fill="#8a0303"/><circle cx="64" cy="62" r="1.6" fill="#6a0202"/>`;
      svg += `<path d="M20 80 Q30 76 34 86 Q28 84 26 92 Q22 86 20 80 Z" fill="#7a0202" opacity=".9"/>`;
    }
    return svg;
  }

  /** Ojos según el tipo de personaje. */
  function ojos(p) {
    const lista = p.extras || [];
    if (lista.includes("sin_ojos") || lista.includes("saco")) return "";
    if (lista.includes("sin_rostro")) return ""; // Ethan: nunca se le ve la cara
    if (lista.includes("ojo_blanco")) {
      return `<ellipse cx="43" cy="44" rx="3.2" ry="2.4" fill="#f4f4f4"/><ellipse cx="57" cy="44" rx="2.4" ry="1.8" fill="#d8d8d8"/>`;
    }
    const brillo = lista.includes("ojos_rojos")
      ? `<circle cx="43" cy="44" r="5" fill="${p.ojos}" opacity=".35"/><circle cx="57" cy="44" r="5" fill="${p.ojos}" opacity=".35"/>`
      : "";
    return `${brillo}
      <ellipse cx="43" cy="44" rx="3.2" ry="1.9" fill="#f2ede6"/><ellipse cx="57" cy="44" rx="3.2" ry="1.9" fill="#f2ede6"/>
      <circle cx="43" cy="44" r="1.5" fill="${p.ojos}"/><circle cx="57" cy="44" r="1.5" fill="${p.ojos}"/>
      <circle cx="43" cy="44" r=".6" fill="#000"/><circle cx="57" cy="44" r=".6" fill="#000"/>
      <path d="M38 39.5 Q43 37.5 47 39.5 M53 39.5 Q57 37.5 62 39.5" stroke="${tono(p.pelo || "#333", .8)}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
  }

  /* ------------------------------------------------------------------
   *  Composición final del retrato
   * ---------------------------------------------------------------- */
  function dibujar(p) {
    const lista = p.extras || [];
    // Piel: más pálida si el personaje está "palido" o es un monstruo.
    let piel = p.piel || "#e0b89a";
    if (lista.includes("palido")) piel = tono(piel, 1.08);
    const sombraPiel = tono(piel, .78);
    const ropa = p.ropa || "#222";
    const fondo = p.fondo || "#200";
    const sinRostro = lista.includes("sin_rostro");
    const monstruo = lista.includes("monstruo");

    // Rasgos de la cara (nariz y boca); los monstruos tienen boca dentada.
    const boca = monstruo
      ? `<path d="M38 57 Q50 64 62 57 Q50 70 38 57 Z" fill="#2a0505"/><path d="M41 58 l2 3 l2 -3 l2 3 l2 -3 l2 3 l2 -3 l2 3 l2 -3" stroke="#e8e0c8" stroke-width=".8" fill="none"/>`
      : `<path d="M50 46 Q48 52 49 53.5 Q50 54.5 52 53.5" stroke="${sombraPiel}" stroke-width="1.1" fill="none"/>
         <path d="M45 58 Q50 60 55 58" stroke="${tono(piel, .6)}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;

    const cara = sinRostro
      ? `<ellipse cx="50" cy="44" rx="17" ry="21" fill="#000" opacity=".82"/>`
      : `${ojos(p)}${boca}`;

    // Deformaciones de monstruo: venas y bultos.
    const deformacion = monstruo
      ? `<path d="M36 30 Q40 36 36 44 M64 28 Q60 36 65 42 M44 24 Q47 30 44 34" stroke="#3a1a1a" stroke-width="1.2" fill="none"/>
         <circle cx="62" cy="33" r="4" fill="${tono(piel, .85)}"/>`
      : "";

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="fondo" cx="50%" cy="40%" r="70%">
      <stop offset="0" stop-color="${tono(fondo, 1.9)}"/>
      <stop offset="1" stop-color="${tono(fondo, .35)}"/>
    </radialGradient>
    <radialGradient id="vineta" cx="50%" cy="45%" r="65%">
      <stop offset=".55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".75"/>
    </radialGradient>
    <linearGradient id="luz" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity=".12"/>
      <stop offset=".55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".35"/>
    </linearGradient>
    <filter id="grano">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${(p.nombre || "x").length * 7}"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <rect width="100" height="100" fill="url(#fondo)"/>
  ${peloDetras(p)}
  <!-- Hombros y ropa -->
  <path d="M8 100 Q12 74 37 69 L63 69 Q88 74 92 100 Z" fill="${ropa}"/>
  <path d="M40 69 L50 80 L60 69" fill="${tono(ropa, .7)}"/>
  <!-- Cuello -->
  <rect x="43" y="58" width="14" height="13" fill="${sombraPiel}"/>
  <!-- Orejas y cabeza -->
  <ellipse cx="33" cy="46" rx="3" ry="5" fill="${sombraPiel}"/>
  <ellipse cx="67" cy="46" rx="3" ry="5" fill="${sombraPiel}"/>
  <ellipse cx="50" cy="44" rx="17" ry="21" fill="${piel}"/>
  ${deformacion}
  ${cara}
  ${peloDelante(p)}
  ${extras(p)}
  <!-- Iluminación lateral dramática + viñeta + grano fotográfico -->
  <rect width="100" height="100" fill="url(#luz)"/>
  <rect width="100" height="100" fill="url(#vineta)"/>
  <rect width="100" height="100" fill="#fff" filter="url(#grano)"/>
</svg>`;
  }

  /**
   * Variantes por capítulo: el mismo personaje con el aspecto de cada juego
   * (p. ej. { leon: "leon_re2" } → img/personajes/leon_re2.webp y img/cuerpos/leon_re2.webp).
   */
  let variantes = {};
  function setVariantes(mapa) { variantes = mapa || {}; }

  /**
   * Devuelve la URL del retrato (cara) del personaje: foto real o SVG generado.
   * @param {string} id clave del personaje en PERSONAJES.
   */
  function de(id) {
    if (variantes[id]) return `img/personajes/${variantes[id]}.webp`;
    if (cache.has(id)) return cache.get(id);
    const p = PERSONAJES[id] || { nombre: "?", piel: "#888", pelo: "#222", peinado: "corto" };
    const url = p.foto || `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dibujar(p).trim())}`;
    cache.set(id, url);
    return url;
  }

  /** Imagen de cuerpo entero (salas 2D). Si no hay, se usa el retrato. */
  function cuerpo(id) {
    if (variantes[id]) return `img/cuerpos/${variantes[id]}.webp`;
    const p = PERSONAJES[id] || {};
    return p.cuerpo || de(id);
  }

  return { de, cuerpo, setVariantes };
})();
