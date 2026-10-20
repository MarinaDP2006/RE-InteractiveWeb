/* ============================================================================
 *  3d/motor/props.js — Mobiliario y decorado modelado por código
 * ============================================================================
 *  crearProp(tipo, op, ctx) → { obj, ancho, fondo, luz?, solido }
 *   · obj: THREE.Object3D centrado en (0,0,0) y apoyado en el suelo (y = 0).
 *   · ancho/fondo: huella en metros (para las colisiones).
 *   · luz: { color, intensidad, distancia, y, parpadeo } si emite luz.
 *   · solido: false si se puede atravesar (alfombras, sangre, papeles...).
 *  ctx.imagen(url) devuelve una textura (fotos de personajes, cuadros...).
 * ========================================================================== */
import * as THREE from "../lib/three.module.min.js";
import { material, texturaSangre, escalarUV } from "./texturas.js";

const cacheMat = new Map();
/** Material liso (tela, cristal, pintura...). */
function liso(color, op = {}) {
  const k = color + JSON.stringify(op);
  if (!cacheMat.has(k)) cacheMat.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...op }));
  return cacheMat.get(k);
}
function caja(w, h, d, mat, x = 0, y = 0, z = 0, uvm = 1) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (uvm) escalarUV(g, Math.max(w, d), h, uvm);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function cilindro(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y + h / 2, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}
const grupo = (...hijos) => { const g = new THREE.Group(); hijos.forEach((h) => g.add(h)); return g; };

/** Plano con una imagen recortada (personaje, cadáver, cuadro). */
function plano(tex, w, h, op = {}) {
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: false, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, ...op });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
  return m;
}

const F = {
  mesa(op) {
    const mad = material("madera_oscura");
    const w = op.ancho || 1.6, d = op.fondo || 0.9;
    const g = grupo(caja(w, 0.06, d, mad, 0, 0.74, 0));
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(caja(0.07, 0.74, 0.07, mad, x * (w / 2 - 0.08), 0, z * (d / 2 - 0.08)));
    if (op.mantel) g.add(caja(w + 0.06, 0.02, d + 0.06, liso(op.mantel, { roughness: 1 }), 0, 0.8, 0, 0));
    return { obj: g, ancho: w, fondo: d };
  },
  mesa_larga(op) { return F.mesa({ ancho: 4, fondo: 1.2, mantel: "#d8d0c0", ...op }); },
  silla() {
    const mad = material("madera_oscura");
    const g = grupo(caja(0.45, 0.05, 0.45, mad, 0, 0.45, 0), caja(0.45, 0.55, 0.05, mad, 0, 0.5, -0.2));
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(caja(0.04, 0.45, 0.04, mad, x * 0.19, 0, z * 0.19));
    return { obj: g, ancho: 0.5, fondo: 0.5 };
  },
  estanteria(op) {
    const mad = material("madera_oscura");
    const w = op.ancho || 1.8, h = op.alto || 2.4, d = 0.4;
    const g = grupo(caja(w, h, 0.03, mad, 0, 0, -d / 2 + 0.02), caja(0.05, h, d, mad, -w / 2, 0, 0), caja(0.05, h, d, mad, w / 2, 0, 0));
    const colores = ["#5a1a14", "#1f3a2a", "#2a2a46", "#6a4a20", "#3a2418", "#4a1010"];
    for (let i = 0; i <= 4; i++) {
      const y = i * (h / 4.4);
      g.add(caja(w, 0.04, d, mad, 0, y, 0));
      if (i < 4) {
        let x = -w / 2 + 0.06;
        while (x < w / 2 - 0.1) {
          const lw = 0.04 + Math.random() * 0.05, lh = 0.24 + Math.random() * 0.12;
          if (Math.random() > 0.12) g.add(caja(lw, lh, 0.22, liso(colores[(Math.random() * colores.length) | 0], { roughness: 0.9 }), x + lw / 2, y + 0.04, 0.02, 0));
          x += lw + 0.005;
        }
      }
    }
    return { obj: g, ancho: w, fondo: d };
  },
  armario() {
    const mad = material("madera_oscura");
    const g = grupo(caja(1.2, 2.1, 0.6, mad), caja(0.02, 1.9, 0.01, liso("#111"), 0, 0.1, 0.305, 0));
    return { obj: g, ancho: 1.2, fondo: 0.6 };
  },
  sofa(op) {
    const tela = liso(op.color || "#3a1416", { roughness: 1 });
    const g = grupo(caja(2, 0.45, 0.9, tela), caja(2, 0.5, 0.2, tela, 0, 0.45, -0.35), caja(0.2, 0.3, 0.9, tela, -0.9, 0.45, 0), caja(0.2, 0.3, 0.9, tela, 0.9, 0.45, 0));
    return { obj: g, ancho: 2, fondo: 0.9 };
  },
  cama(op) {
    const mad = material("madera_oscura");
    const g = grupo(caja(1.1, 0.45, 2.1, mad), caja(1.05, 0.18, 2, liso(op.sabanas || "#b8b0a0", { roughness: 1 }), 0, 0.45, 0), caja(1.1, 0.9, 0.06, mad, 0, 0, -1.05));
    if (op.sangre) g.add(caja(0.8, 0.01, 0.9, liso("#4a0006", { roughness: 0.3 }), 0, 0.64, 0.2, 0));
    return { obj: g, ancho: 1.1, fondo: 2.1 };
  },
  camilla(op) {
    const met = material("metal");
    const g = grupo(caja(0.8, 0.08, 2, met, 0, 0.8, 0), caja(0.75, 0.1, 1.9, liso("#c8c4b8", { roughness: 1 }), 0, 0.88, 0));
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(caja(0.04, 0.8, 0.04, met, x * 0.35, 0, z * 0.9));
    if (op.sangre !== false) g.add(caja(0.5, 0.01, 0.7, liso("#4a0006", { roughness: 0.3 }), 0.05, 0.99, 0.3, 0));
    return { obj: g, ancho: 0.8, fondo: 2 };
  },
  escritorio() {
    const mad = material("madera");
    const g = grupo(caja(1.5, 0.06, 0.75, mad, 0, 0.74, 0), caja(0.45, 0.74, 0.7, mad, -0.5, 0, 0), caja(0.05, 0.74, 0.7, mad, 0.7, 0, 0));
    g.add(caja(0.3, 0.02, 0.22, liso("#d8d0bc"), 0.2, 0.8, 0.05, 0));
    return { obj: g, ancho: 1.5, fondo: 0.75 };
  },
  maquina() {
    // Máquina de escribir sobre una mesita, con una lámpara cálida: la sala segura.
    const mad = material("madera_oscura");
    const met = liso("#1a1a1a", { roughness: 0.4, metalness: 0.6 });
    const g = grupo(caja(0.9, 0.05, 0.6, mad, 0, 0.75, 0));
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(caja(0.05, 0.75, 0.05, mad, x * 0.4, 0, z * 0.25));
    g.add(caja(0.42, 0.14, 0.32, met, 0, 0.8, 0.02), caja(0.46, 0.06, 0.06, met, 0, 0.94, -0.1), caja(0.3, 0.2, 0.01, liso("#efe8d8"), 0, 0.96, -0.12, 0));
    for (let i = 0; i < 12; i++) g.add(caja(0.022, 0.02, 0.022, liso("#c8c0a8"), -0.15 + (i % 6) * 0.06, 0.94, 0.06 + Math.floor(i / 6) * 0.05, 0));
    return { obj: g, ancho: 0.9, fondo: 0.6, luz: { color: "#ffcf8a", intensidad: 6, distancia: 6, y: 1.6, parpadeo: 0.05 } };
  },
  baul() {
    const mad = material("madera_oscura");
    const g = grupo(caja(1, 0.5, 0.6, mad), caja(1.02, 0.08, 0.62, material("metal"), 0, 0.5, 0));
    return { obj: g, ancho: 1, fondo: 0.6 };
  },
  cuadro(op, ctx) {
    // Cuadro colgado en la pared: op.imagen (url), se coloca pegado a la pared con rot.
    const w = op.ancho || 1.2, h = op.alto || 0.9;
    const marco = liso("#4a3410", { roughness: 0.5, metalness: 0.4 });
    const g = grupo(caja(w + 0.12, h + 0.12, 0.05, marco, 0, 0, 0, 0));
    if (op.imagen) {
      const lienzo = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: ctx.imagen(op.imagen), roughness: 0.7 }));
      lienzo.position.set(0, (h + 0.12) / 2, 0.03);
      g.add(lienzo);
    }
    g.children[0].castShadow = false;
    g.position.y = op.y ?? 1.5;
    const ex = new THREE.Group();
    ex.add(g);
    return { obj: ex, ancho: w, fondo: 0.1, solido: false };
  },
  reloj() {
    const mad = material("madera_oscura");
    const g = grupo(caja(0.55, 2.1, 0.4, mad), cilindro(0.18, 0.18, 0.02, liso("#e8e0c8"), 0, 1.65, 0.21));
    g.children[1].rotation.x = Math.PI / 2;
    return { obj: g, ancho: 0.55, fondo: 0.4 };
  },
  piano() {
    const neg = liso("#0a0a0a", { roughness: 0.25 });
    const g = grupo(caja(1.6, 1.2, 0.6, neg), caja(1.5, 0.05, 0.25, liso("#eee", { roughness: 0.3 }), 0, 0.72, 0.38, 0));
    return { obj: g, ancho: 1.6, fondo: 0.9 };
  },
  chimenea() {
    const pie = material("piedra");
    const g = grupo(caja(2, 1.4, 0.6, pie), caja(1, 0.8, 0.3, liso("#050505"), 0, 0.1, 0.16, 0), caja(2.2, 0.12, 0.7, pie, 0, 1.4, 0));
    return { obj: g, ancho: 2, fondo: 0.6, luz: { color: "#ff7a2a", intensidad: 12, distancia: 7, y: 0.5, z: 0.6, parpadeo: 0.35 } };
  },
  estatua(op) {
    const marm = liso(op.color || "#b8b2a6", { roughness: 0.5 });
    const g = grupo(caja(1, 0.9, 1, material("piedra")));
    const base = new THREE.Mesh(new THREE.LatheGeometry([0, 0.35, 0.3, 0.28, 0.32, 0.18, 0.22, 0.16, 0.2, 0].map((r, i) => new THREE.Vector2(r, i * 0.22))), marm);
    base.position.y = 0.9;
    base.castShadow = base.receiveShadow = true;
    const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), marm);
    cabeza.position.y = 0.9 + 2.1;
    cabeza.castShadow = true;
    g.add(base, cabeza);
    return { obj: g, ancho: 1, fondo: 1 };
  },
  columna(op) {
    const h = op.alto || 3;
    const mat = material(op.material || "piedra");
    const g = grupo(cilindro(0.28, 0.32, h, mat), caja(0.8, 0.2, 0.8, mat), caja(0.8, 0.2, 0.8, mat, 0, h - 0.2, 0));
    return { obj: g, ancho: 0.7, fondo: 0.7 };
  },
  barril(op) {
    const mat = op.metal ? material("oxido") : material("madera");
    const g = grupo(cilindro(0.3, 0.3, 0.9, mat));
    if (!op.metal) { g.add(cilindro(0.31, 0.31, 0.04, liso("#2a2a2a", { metalness: 0.6 }), 0, 0.15, 0), cilindro(0.31, 0.31, 0.04, liso("#2a2a2a", { metalness: 0.6 }), 0, 0.7, 0)); }
    return { obj: g, ancho: 0.6, fondo: 0.6 };
  },
  caja(op) {
    const s = op.tam || 0.8;
    return { obj: grupo(caja(s, s, s, material("madera"), 0, 0, 0, 0.8)), ancho: s, fondo: s };
  },
  cajas() {
    const m = material("madera");
    const g = grupo(caja(0.9, 0.9, 0.9, m, -0.3, 0, 0, 0.9), caja(0.8, 0.8, 0.8, m, 0.55, 0, 0.1, 0.8), caja(0.7, 0.7, 0.7, m, -0.2, 0.9, 0.05, 0.7));
    g.children[2].rotation.y = 0.4;
    return { obj: g, ancho: 1.8, fondo: 1 };
  },
  coche(op) {
    const pint = liso(op.color || "#2a3440", { roughness: 0.35, metalness: 0.6 });
    const cris = liso("#0a1018", { roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.8 });
    const g = grupo(caja(1.8, 0.7, 4.3, pint, 0, 0.3, 0, 0), caja(1.6, 0.55, 2.2, cris, 0, 1, -0.2, 0));
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const r = cilindro(0.33, 0.33, 0.25, liso("#0a0a0a"), x * 0.85, 0.33, z * 1.35);
      r.rotation.z = Math.PI / 2;
      r.position.y = 0.33;
      g.add(r);
    }
    if (op.ardiendo) return { obj: g, ancho: 1.9, fondo: 4.3, luz: { color: "#ff6a1a", intensidad: 25, distancia: 12, y: 1.5, parpadeo: 0.5 } };
    if (op.luces) g.add(caja(1.6, 0.12, 0.05, liso("#fff6d0", { emissive: "#fff2c0", emissiveIntensity: 2 }), 0, 0.75, 2.16, 0));
    return { obj: g, ancho: 1.9, fondo: 4.3 };
  },
  farola(op) {
    const met = liso("#1a1c1e", { metalness: 0.7, roughness: 0.5 });
    const g = grupo(cilindro(0.07, 0.1, 4.5, met), caja(0.6, 0.15, 0.3, met, 0.25, 4.4, 0, 0), caja(0.4, 0.04, 0.2, liso("#fff0c0", { emissive: "#ffd890", emissiveIntensity: op.apagada ? 0 : 3 }), 0.3, 4.38, 0, 0));
    return { obj: g, ancho: 0.3, fondo: 0.3, luz: op.apagada ? null : { color: "#ffc070", intensidad: 30, distancia: 14, y: 4.2, x: 0.3, parpadeo: op.parpadeo ?? 0.15 } };
  },
  arbol(op) {
    const tronco = liso("#2a1e14", { roughness: 1 });
    const hoja = liso(op.nieve ? "#cfd6dc" : "#1c2a16", { roughness: 1 });
    const g = grupo(cilindro(0.15, 0.25, 3, tronco));
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(new THREE.ConeGeometry(1.6 - i * 0.4, 1.8, 10), hoja);
      c.position.y = 2.6 + i * 1.1;
      c.castShadow = true;
      g.add(c);
    }
    return { obj: g, ancho: 0.5, fondo: 0.5 };
  },
  arbol_seco() {
    const tronco = liso("#1e1610", { roughness: 1 });
    const g = grupo(cilindro(0.1, 0.22, 4, tronco));
    for (let i = 0; i < 5; i++) {
      const r = cilindro(0.03, 0.06, 1.6, tronco, 0, 0, 0, 6);
      r.position.set(0, 2.2 + i * 0.4, 0);
      r.rotation.set(0.9 + Math.random() * 0.5, i * 1.3, 0);
      g.add(r);
    }
    return { obj: g, ancho: 0.4, fondo: 0.4 };
  },
  valla(op) {
    const mad = material("madera");
    const w = op.ancho || 3;
    const g = grupo(caja(w, 0.08, 0.06, mad, 0, 0.5, 0), caja(w, 0.08, 0.06, mad, 0, 0.9, 0));
    for (let x = -w / 2; x <= w / 2; x += 0.5) g.add(caja(0.08, 1.1, 0.08, mad, x, 0, 0));
    return { obj: g, ancho: w, fondo: 0.2 };
  },
  lapida() {
    const p = material("piedra");
    const g = grupo(caja(0.6, 0.9, 0.15, p));
    g.rotation.z = (Math.random() - 0.5) * 0.15;
    return { obj: g, ancho: 0.6, fondo: 0.3 };
  },
  hoguera(op, ctx) {
    const g = grupo(cilindro(0.5, 0.6, 0.15, liso("#151010")));
    for (let i = 0; i < 6; i++) {
      const t = cilindro(0.06, 0.06, 1.1, material("madera_oscura"), 0, 0.2, 0, 6);
      t.rotation.set(0.6, i, 0);
      g.add(t);
    }
    if (op.figura) {
      const tex = ctx.imagen(ctx.cuerpo(op.figura));
      const fig = plano(tex, 0.8, 1.8, { color: "#3a2a20" });
      fig.position.y = 1.1;
      g.add(cilindro(0.06, 0.06, 2.5, material("madera_oscura")), fig);
    }
    return { obj: g, ancho: 1.2, fondo: 1.2, luz: { color: "#ff6018", intensidad: 30, distancia: 12, y: 0.8, parpadeo: 0.5 } };
  },
  tanque(op, ctx) {
    // Tanque de cultivo de Umbrella: cristal con líquido verde y un espécimen dentro.
    const met = material("metal");
    const g = grupo(cilindro(0.7, 0.7, 0.3, met), cilindro(0.7, 0.7, 0.3, met, 0, 2.5, 0));
    const liquido = cilindro(0.6, 0.6, 2.2, liso("#1a6a3a", { transparent: true, opacity: 0.55, emissive: "#0c4a22", emissiveIntensity: 1.4, roughness: 0.05 }), 0, 0.3, 0, 24);
    liquido.castShadow = false;
    g.add(liquido);
    if (op.figura) {
      const fig = plano(ctx.imagen(ctx.cuerpo(op.figura)), 0.75, 1.9, { color: "#9fcfa8" });
      fig.position.y = 1.35;
      fig.userData.billboard = true;
      g.add(fig);
    }
    return { obj: g, ancho: 1.4, fondo: 1.4, luz: { color: "#4aff8a", intensidad: 5, distancia: 5, y: 1.4, parpadeo: 0.08 } };
  },
  ordenador() {
    const g = grupo(caja(1.2, 0.75, 0.6, material("metal")), caja(0.5, 0.4, 0.4, liso("#2a2a2a"), 0, 0.75, 0, 0), caja(0.42, 0.3, 0.01, liso("#0a2a1a", { emissive: "#2aff7a", emissiveIntensity: 0.7 }), 0, 0.8, 0.205, 0));
    return { obj: g, ancho: 1.2, fondo: 0.6, luz: { color: "#4affa0", intensidad: 1.5, distancia: 3, y: 1, z: 0.4 } };
  },
  estante_lab() {
    const met = material("metal");
    const g = grupo(caja(1.6, 1.9, 0.45, met, 0, 0, 0, 1));
    const cols = ["#3a8a5a", "#8a2a2a", "#2a5a8a", "#c8b030"];
    for (let i = 0; i < 14; i++) g.add(cilindro(0.04, 0.04, 0.16, liso(cols[i % 4], { transparent: true, opacity: 0.7, roughness: 0.1 }), -0.65 + (i % 7) * 0.2, 0.5 + Math.floor(i / 7) * 0.65, 0.05, 8));
    return { obj: g, ancho: 1.6, fondo: 0.45 };
  },
  tuberia(op) {
    const l = op.largo || 4;
    const t = cilindro(0.12, 0.12, l, material("oxido"), 0, 0, 0, 10);
    t.rotation.z = Math.PI / 2;
    t.position.y = op.y ?? 2.6;
    return { obj: grupo(t), ancho: l, fondo: 0.3, solido: false };
  },
  contenedor(op) {
    const m = liso(op.color || "#5a2a1a", { roughness: 0.7, metalness: 0.5 });
    return { obj: grupo(caja(2.4, 2.6, 6, m, 0, 0, 0, 0)), ancho: 2.4, fondo: 6 };
  },
  jaula(op, ctx) {
    const met = liso("#1a1a1a", { metalness: 0.7, roughness: 0.6 });
    const g = grupo(caja(1.4, 0.06, 1.4, met), caja(1.4, 0.06, 1.4, met, 0, 2, 0));
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      g.add(cilindro(0.015, 0.015, 2, met, Math.cos(a) * 0.68, 0, Math.sin(a) * 0.68, 4));
    }
    if (op.figura) { const f = plano(ctx.imagen(ctx.cuerpo(op.figura)), 0.6, 1.5, { color: "#7a7068" }); f.position.y = 0.8; g.add(f); }
    return { obj: g, ancho: 1.4, fondo: 1.4 };
  },
  cadaver(op, ctx) {
    // Cuerpo tendido en el suelo sobre un charco de sangre.
    const tex = ctx.imagen(ctx.cuerpo(op.figura || "zombi"));
    const f = plano(tex, 0.75, 1.75, { color: "#5a4a44" });
    f.rotation.x = -Math.PI / 2;
    f.position.y = 0.04;
    const s = F.sangre({ tam: 1.8 }).obj;
    return { obj: grupo(s, f), ancho: 0.8, fondo: 1.8, solido: false };
  },
  colgado(op, ctx) {
    const tex = ctx.imagen(ctx.cuerpo(op.figura || "zombi"));
    const f = plano(tex, 0.75, 1.75, { color: "#5a4a44" });
    f.position.y = (op.alto || 3) - 1.25;
    f.userData.balanceo = true;
    const cuerda = cilindro(0.01, 0.01, 0.5, liso("#3a2a18"), 0, (op.alto || 3) - 0.5, 0, 4);
    return { obj: grupo(f, cuerda), ancho: 0.5, fondo: 0.5, solido: false };
  },
  figura(op, ctx) {
    // Personaje inmóvil (muñeca, estatua viviente...).
    const tex = ctx.imagen(ctx.cuerpo(op.figura));
    const h = op.alto || 1.75;
    const f = plano(tex, h * 0.45, h, op.color ? { color: op.color } : {});
    f.position.y = h / 2;
    f.userData.billboard = true;
    return { obj: grupo(f), ancho: 0.5, fondo: 0.5 };
  },
  sangre(op) {
    const s = op.tam || 1.4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshStandardMaterial({ map: texturaSangre(), transparent: true, roughness: 0.15, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = Math.random() * 6;
    m.position.y = 0.012;
    m.receiveShadow = true;
    return { obj: grupo(m), ancho: s, fondo: s, solido: false };
  },
  papeles() {
    const g = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.29), liso("#d8d0b8", { roughness: 1 }));
      p.rotation.set(-Math.PI / 2, 0, Math.random() * 6);
      p.position.set((Math.random() - 0.5) * 1.2, 0.01 + i * 0.001, (Math.random() - 0.5) * 1.2);
      p.receiveShadow = true;
      g.add(p);
    }
    return { obj: g, ancho: 1, fondo: 1, solido: false };
  },
  alfombra(op) {
    const w = op.ancho || 3, d = op.fondo || 2;
    const m = new THREE.Mesh(escalarUV(new THREE.PlaneGeometry(w, d), w, d, 2), material(op.material || "moqueta_roja"));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.01;
    m.receiveShadow = true;
    return { obj: grupo(m), ancho: w, fondo: d, solido: false };
  },
  candelabro() {
    const oro = liso("#6a5020", { metalness: 0.8, roughness: 0.4 });
    const g = grupo(cilindro(0.15, 0.2, 0.05, oro), cilindro(0.02, 0.03, 1.2, oro));
    for (let i = 0; i < 3; i++) g.add(cilindro(0.025, 0.025, 0.15, liso("#e8e0c8", { emissive: "#ffb050", emissiveIntensity: 0.6 }), (i - 1) * 0.15, 1.2, 0, 6));
    return { obj: g, ancho: 0.4, fondo: 0.4, luz: { color: "#ffa850", intensidad: 3, distancia: 5, y: 1.45, parpadeo: 0.3 } };
  },
  lampara_techo(op) {
    const h = op.techo || 3;
    const g = grupo(cilindro(0.005, 0.005, 0.8, liso("#111"), 0, h - 0.8, 0, 4), cilindro(0.08, 0.25, 0.2, liso("#2a2a2a", { metalness: 0.5 }), 0, h - 1, 0, 12));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), liso("#fff2d0", { emissive: "#ffe0a0", emissiveIntensity: 3 })));
    g.children[2].position.y = h - 1.02;
    g.userData.balanceo = true;
    return { obj: g, ancho: 0.1, fondo: 0.1, solido: false, luz: { color: op.color || "#ffd8a0", intensidad: op.intensidad || 10, distancia: 9, y: h - 1.1, parpadeo: op.parpadeo ?? 0.12 } };
  },
  fluorescente(op) {
    const h = op.techo || 3;
    const g = grupo(caja(1.2, 0.06, 0.15, liso("#e8f0ff", { emissive: "#d8e8ff", emissiveIntensity: 2.5 }), 0, h - 0.06, 0, 0));
    return { obj: g, ancho: 0.1, fondo: 0.1, solido: false, luz: { color: "#d8e6ff", intensidad: op.intensidad || 12, distancia: 9, y: h - 0.3, parpadeo: op.parpadeo ?? 0.25, fluorescente: true } };
  },
  ventana(op) {
    // Ventana con luz de luna (se coloca en la pared, como los cuadros).
    const w = op.ancho || 1.4, h = op.alto || 1.8;
    const marco = material("madera_oscura");
    const cristal = new THREE.Mesh(new THREE.PlaneGeometry(w, h), liso("#3a5a8a", { emissive: "#4a6a9a", emissiveIntensity: 0.6, roughness: 0.1 }));
    cristal.position.set(0, (op.y ?? 1) + h / 2, 0.02);
    const g = grupo(cristal, caja(w + 0.1, 0.08, 0.1, marco, 0, op.y ?? 1, 0, 0), caja(w + 0.1, 0.08, 0.1, marco, 0, (op.y ?? 1) + h, 0, 0), caja(0.06, h, 0.08, marco, 0, op.y ?? 1, 0, 0));
    return { obj: g, ancho: w, fondo: 0.1, solido: false, luz: { color: "#7aa0ff", intensidad: 4, distancia: 7, y: (op.y ?? 1) + h / 2, z: 0.8 } };
  },
  cruz() {
    const m = material("madera_oscura");
    return { obj: grupo(caja(0.12, 2.4, 0.12, m), caja(1, 0.12, 0.12, m, 0, 1.7, 0)), ancho: 0.3, fondo: 0.3 };
  },
  heno() {
    const m = liso("#8a7034", { roughness: 1 });
    return { obj: grupo(caja(1.2, 0.6, 0.8, m, 0, 0, 0, 0), caja(1.2, 0.6, 0.8, m, 0.3, 0.6, 0, 0)), ancho: 1.6, fondo: 0.8 };
  },
  carro() {
    const m = material("madera");
    const g = grupo(caja(1.4, 0.5, 2.4, m, 0, 0.5, 0));
    for (const z of [-0.8, 0.8]) for (const x of [-0.75, 0.75]) {
      const r = cilindro(0.45, 0.45, 0.08, m, x, 0.45, z, 12);
      r.rotation.z = Math.PI / 2;
      r.position.y = 0.45;
      g.add(r);
    }
    return { obj: g, ancho: 1.6, fondo: 2.4 };
  },
  escombros() {
    const m = material("hormigon");
    const g = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const s = 0.3 + Math.random() * 0.6;
      const b = caja(s, s * 0.6, s * 0.8, m, (Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2, 0.6);
      b.rotation.set(Math.random(), Math.random(), Math.random() * 0.4);
      g.add(b);
    }
    return { obj: g, ancho: 2.2, fondo: 2.2 };
  },
  mostrador(op) {
    const w = op.ancho || 3;
    const mad = material("madera_oscura");
    return { obj: grupo(caja(w, 1.05, 0.6, mad), caja(w + 0.1, 0.05, 0.7, liso("#2a2420", { roughness: 0.3 }), 0, 1.05, 0, 0)), ancho: w, fondo: 0.6 };
  },
  taquillas() {
    const m = material("metal");
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) g.add(caja(0.45, 1.9, 0.5, m, -0.7 + i * 0.47, 0, 0, 1));
    return { obj: g, ancho: 1.9, fondo: 0.5 };
  }
};

export function crearProp(tipo, op, ctx) {
  const f = F[tipo];
  if (!f) { console.warn("Prop desconocido:", tipo); return null; }
  const r = f(op || {}, ctx);
  if (r.solido === undefined) r.solido = true;
  return r;
}
export const TIPOS_PROP = Object.keys(F);
