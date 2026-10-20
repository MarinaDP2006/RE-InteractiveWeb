/* ============================================================================
 *  3d/motor/mundo.js — Construye un nivel 3D a partir de su descripción
 * ============================================================================
 *  Un nivel son SALAS rectangulares (en metros, x → derecha, z → abajo) unidas
 *  por PUERTAS situadas sobre la pared compartida.
 *
 *   sala:   { id, nombre, x, z, w, d, alto=3, suelo, pared, techo, exterior,
 *             abiertaA:[ids], cerradaA:[ids] (exteriores con muro entre ellos), zocalo, props:[[tipo, x, z, rot, op]], luces:[...] }
 *   puerta: { id, x, z, eje: "x"|"z", ancho=1.2, alto=2.3, llave, tipo:
 *             "madera"|"metal"|"reja"|"arco", abierta, nombre }
 *     eje "x": la puerta está en una pared horizontal (z constante).
 *     eje "z": en una pared vertical (x constante).
 *
 *  Devuelve el "mundo": escena, colisiones, puertas, luces, rayos contra
 *  paredes (línea de visión, disparos) y rejilla de navegación para la IA.
 * ========================================================================== */
import * as THREE from "../lib/three.module.min.js";
import { material, escalarUV } from "./texturas.js";
import { crearProp } from "./props.js";

const GROSOR = 0.12;
const MAX_LUCES = 7;   // luces puntuales simultáneas (el resto se reasignan por cercanía)

export function crearMundo(def, ctx) {
  const escena = new THREE.Scene();
  const amb = def.ambiente || {};
  escena.background = new THREE.Color(amb.cielo || "#020203");
  escena.fog = new THREE.FogExp2(amb.niebla || "#030304", amb.densidad ?? 0.07);

  const solidos = [];        // mallas que bloquean balas y visión (paredes, puertas)
  const cajas = [];          // AABB de colisión { x0, z0, x1, z1, puerta? }
  const fuentesLuz = [];     // { pos, color, intensidad, distancia, parpadeo, sala }
  const animados = [];       // objetos que miran a cámara o se balancean
  const salasPorId = {};
  def.salas.forEach((s) => { salasPorId[s.id] = s; s.alto = s.alto || (s.exterior ? 7 : 3); });

  /* ---------------- Utilidades ---------------- */
  const cerca = (a, b) => Math.abs(a - b) < 0.05;
  /** Resta intervalos [a,b] a un intervalo base → lista de tramos. */
  function restar(base, huecos) {
    let tramos = [base];
    for (const [h0, h1] of huecos) {
      const nuevos = [];
      for (const [t0, t1] of tramos) {
        if (h1 <= t0 || h0 >= t1) { nuevos.push([t0, t1]); continue; }
        if (h0 > t0) nuevos.push([t0, h0]);
        if (h1 < t1) nuevos.push([h1, t1]);
      }
      tramos = nuevos;
    }
    return tramos.filter(([a, b]) => b - a > 0.02);
  }

  function pared(x0, z0, x1, z1, alto, y0, mat, normal, sala) {
    // Plano vertical de (x0,z0) a (x1,z1), cara visible hacia "normal".
    const largo = Math.hypot(x1 - x0, z1 - z0);
    const geo = escalarUV(new THREE.PlaneGeometry(largo, alto), largo, alto, 2);
    const m = new THREE.Mesh(geo, mat);
    m.position.set((x0 + x1) / 2, y0 + alto / 2, (z0 + z1) / 2);
    m.rotation.y = Math.atan2(normal.x, normal.z);
    m.receiveShadow = true;
    m.castShadow = true;
    m.userData.sala = sala;
    escena.add(m);
    solidos.push(m);
    return m;
  }

  /* ---------------- Puertas ---------------- */
  const puertas = (def.puertas || []).map((p, i) => ({
    id: p.id || "p" + i, ancho: 1.2, alto: 2.3, tipo: "madera", ...p,
    abierta: p.abierta ?? (p.tipo === "arco"), angulo: 0, malla: null, caja: null
  }));

  /* ---------------- Salas: suelo, techo y paredes ---------------- */
  for (const s of def.salas) {
    const mSuelo = material(s.suelo || (s.exterior ? "asfalto" : "madera"));
    const suelo = new THREE.Mesh(escalarUV(new THREE.PlaneGeometry(s.w, s.d), s.w, s.d, s.exterior ? 4 : 2), mSuelo);
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.set(s.x + s.w / 2, 0, s.z + s.d / 2);
    suelo.receiveShadow = true;
    escena.add(suelo);
    if (!s.exterior) {
      const techo = new THREE.Mesh(escalarUV(new THREE.PlaneGeometry(s.w, s.d), s.w, s.d, 2), material(s.techo || "yeso"));
      techo.rotation.x = Math.PI / 2;
      techo.position.set(s.x + s.w / 2, s.alto, s.z + s.d / 2);
      techo.receiveShadow = true;
      techo.castShadow = true;   // tapa la luz del sol/luna en los interiores
      escena.add(techo);
    }

    const bordes = [
      { eje: "x", fijo: s.z, desde: s.x, hasta: s.x + s.w, normal: { x: 0, z: 1 } },          // norte
      { eje: "x", fijo: s.z + s.d, desde: s.x, hasta: s.x + s.w, normal: { x: 0, z: -1 } },    // sur
      { eje: "z", fijo: s.x, desde: s.z, hasta: s.z + s.d, normal: { x: 1, z: 0 } },           // oeste
      { eje: "z", fijo: s.x + s.w, desde: s.z, hasta: s.z + s.d, normal: { x: -1, z: 0 } }     // este
    ];
    const mPared = material(s.pared || (s.exterior ? "ladrillo" : "yeso"));
    for (const b of bordes) {
      // Tramos abiertos: compartidos con salas abiertas (o entre dos exteriores).
      const abiertos = [];
      for (const o of def.salas) {
        if (o === s) continue;
        const cerrada = (s.cerradaA || []).includes(o.id) || (o.cerradaA || []).includes(s.id);
        const abierta = (s.abiertaA || []).includes(o.id) || (o.abiertaA || []).includes(s.id) || (s.exterior && o.exterior && !cerrada);
        if (!abierta) continue;
        if (b.eje === "x" && (cerca(o.z, b.fijo) || cerca(o.z + o.d, b.fijo))) abiertos.push([Math.max(b.desde, o.x), Math.min(b.hasta, o.x + o.w)]);
        if (b.eje === "z" && (cerca(o.x, b.fijo) || cerca(o.x + o.w, b.fijo))) abiertos.push([Math.max(b.desde, o.z), Math.min(b.hasta, o.z + o.d)]);
      }
      const huecosPuerta = [];
      for (const p of puertas) {
        if (p.eje !== b.eje) continue;
        const fijoP = b.eje === "x" ? p.z : p.x, centro = b.eje === "x" ? p.x : p.z;
        if (!cerca(fijoP, b.fijo) || centro < b.desde || centro > b.hasta) continue;
        huecosPuerta.push([centro - p.ancho / 2, centro + p.ancho / 2, p]);
      }
      const tramos = restar([b.desde, b.hasta], [...abiertos.filter(([a, c]) => c > a), ...huecosPuerta.map(([a, c]) => [a, c])]);
      const off = (n) => (b.eje === "x" ? b.normal.z : b.normal.x) * n;
      for (const [a, c] of tramos) {
        if (b.eje === "x") pared(a, b.fijo + off(0.001), c, b.fijo + off(0.001), s.alto, 0, mPared, b.normal, s.id);
        else pared(b.fijo + off(0.001), a, b.fijo + off(0.001), c, s.alto, 0, mPared, b.normal, s.id);
        // Colisión de la pared (lado de esta sala)
        if (b.eje === "x") cajas.push({ x0: a, x1: c, z0: Math.min(b.fijo, b.fijo + off(GROSOR)), z1: Math.max(b.fijo, b.fijo + off(GROSOR)) });
        else cajas.push({ z0: a, z1: c, x0: Math.min(b.fijo, b.fijo + off(GROSOR)), x1: Math.max(b.fijo, b.fijo + off(GROSOR)) });
        // Zócalo de madera
        if (!s.exterior && s.zocalo !== false) {
          const z = escalarUV(new THREE.BoxGeometry(c - a, 0.14, 0.03), c - a, 0.14, 1);
          const mz = new THREE.Mesh(z, material("madera_oscura"));
          if (b.eje === "x") { mz.position.set((a + c) / 2, 0.07, b.fijo + off(0.015)); }
          else { mz.position.set(b.fijo + off(0.015), 0.07, (a + c) / 2); mz.rotation.y = Math.PI / 2; }
          mz.receiveShadow = true;
          escena.add(mz);
        }
      }
      // Dinteles sobre las puertas
      for (const [a, c, p] of huecosPuerta) {
        const hp = Math.min(p.alto, s.alto);
        if (s.alto - hp > 0.02) {
          if (b.eje === "x") pared(a, b.fijo + off(0.001), c, b.fijo + off(0.001), s.alto - hp, hp, mPared, b.normal, s.id);
          else pared(b.fijo + off(0.001), a, b.fijo + off(0.001), c, s.alto - hp, hp, mPared, b.normal, s.id);
        }
      }
    }

    // Decorado y luces de la sala
    for (const [tipo, x, z, rot = 0, op = {}] of s.props || []) colocarProp(tipo, x, z, rot, { techo: s.alto, ...op }, s.id);
  }

  /* ---------------- Mallas de las puertas ---------------- */
  for (const p of puertas) {
    if (p.tipo === "arco") continue;
    const marco = new THREE.Group();
    const mMarco = material("madera_oscura");
    const hoja = new THREE.Group();
    const matHoja = p.tipo === "metal" ? material("metal") : p.tipo === "reja" ? new THREE.MeshStandardMaterial({ color: "#151515", metalness: 0.8, roughness: 0.5 }) : material("madera_oscura");
    if (p.tipo === "reja") {
      for (let i = 0; i < 8; i++) {
        const barra = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, p.alto, 6), matHoja);
        barra.position.set(0.08 + i * (p.ancho - 0.16) / 7, p.alto / 2, 0);
        barra.castShadow = true;
        hoja.add(barra);
      }
    } else {
      const g = escalarUV(new THREE.BoxGeometry(p.ancho - 0.04, p.alto - 0.02, 0.06), p.ancho, p.alto, 1.2);
      const leaf = new THREE.Mesh(g, matHoja);
      leaf.position.set(p.ancho / 2, p.alto / 2, 0);
      leaf.castShadow = leaf.receiveShadow = true;
      hoja.add(leaf);
      const pomo = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshStandardMaterial({ color: "#8a6a2a", metalness: 0.9, roughness: 0.3 }));
      pomo.position.set(p.ancho - 0.15, 1.05, 0.06);
      hoja.add(pomo);
      if (p.llave) {
        // Símbolo de la llave pintado en la puerta (como en los RE clásicos).
        const sim = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), new THREE.MeshStandardMaterial({ color: p.colorLlave || "#c8a030", emissive: p.colorLlave || "#c8a030", emissiveIntensity: 0.15, metalness: 0.6 }));
        sim.position.set(p.ancho / 2, 1.45, 0.035);
        hoja.add(sim);
      }
    }
    // Marco
    for (const lado of [0, p.ancho]) {
      const j = new THREE.Mesh(new THREE.BoxGeometry(0.1, p.alto, 0.22), mMarco);
      j.position.set(lado, p.alto / 2, 0);
      j.castShadow = true;
      marco.add(j);
    }
    const dintel = new THREE.Mesh(new THREE.BoxGeometry(p.ancho + 0.1, 0.1, 0.22), mMarco);
    dintel.position.set(p.ancho / 2, p.alto, 0);
    marco.add(dintel);
    marco.add(hoja);
    if (p.eje === "x") marco.position.set(p.x - p.ancho / 2, 0, p.z);
    else { marco.position.set(p.x, 0, p.z + p.ancho / 2); marco.rotation.y = Math.PI / 2; }
    escena.add(marco);
    p.malla = hoja;
    hoja.traverse((o) => { if (o.isMesh) { o.userData.puerta = p; solidos.push(o); } });
    p.caja = p.eje === "x" ? { x0: p.x - p.ancho / 2, x1: p.x + p.ancho / 2, z0: p.z - 0.08, z1: p.z + 0.08, puerta: p }
      : { x0: p.x - 0.08, x1: p.x + 0.08, z0: p.z - p.ancho / 2, z1: p.z + p.ancho / 2, puerta: p };
    cajas.push(p.caja);
    if (p.abierta) { p.angulo = 1; hoja.rotation.y = -Math.PI * 0.55; }
  }

  /* ---------------- Props ---------------- */
  function colocarProp(tipo, x, z, rot, op, sala) {
    const r = crearProp(tipo, op, ctx);
    if (!r) return null;
    r.obj.position.set(x, op.y0 || 0, z);
    r.obj.rotation.y = rot;
    r.obj.traverse((o) => {
      if (o.isMesh && o.castShadow === undefined) o.castShadow = true;
      if (o.userData.billboard || o.userData.balanceo) animados.push(o);
    });
    if (r.obj.userData.balanceo) animados.push(r.obj);
    escena.add(r.obj);
    if (r.solido) {
      // Huella rotada → AABB
      const c = Math.abs(Math.cos(rot)), sn = Math.abs(Math.sin(rot));
      const hw = (r.ancho * c + r.fondo * sn) / 2, hd = (r.ancho * sn + r.fondo * c) / 2;
      cajas.push({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd, prop: tipo });
      r.obj.traverse((o) => { if (o.isMesh) solidos.push(o); });
    }
    if (r.luz) {
      const dx = (r.luz.x || 0), dz = (r.luz.z || 0);
      const wx = x + dx * Math.cos(rot) + dz * Math.sin(rot), wz = z - dx * Math.sin(rot) + dz * Math.cos(rot);
      fuentesLuz.push({ pos: new THREE.Vector3(wx, r.luz.y ?? 2, wz), color: new THREE.Color(r.luz.color), intensidad: r.luz.intensidad, distancia: r.luz.distancia || 8, parpadeo: r.luz.parpadeo || 0, fluor: r.luz.fluorescente, sala, apagada: false });
    }
    return r;
  }

  const minX = Math.min(...def.salas.map((s) => s.x)), minZ = Math.min(...def.salas.map((s) => s.z));
  const maxX = Math.max(...def.salas.map((s) => s.x + s.w)), maxZ = Math.max(...def.salas.map((s) => s.z + s.d));
  /* ---------------- Iluminación ---------------- */
  const hemi = new THREE.HemisphereLight(amb.luzCielo || "#3a4256", amb.luzSuelo || "#0a0806", amb.ambiente ?? 0.08);
  escena.add(hemi);
  if (amb.luna) {
    // Sol o luna con sombras: los techos y paredes dejan los interiores a oscuras.
    const luna = new THREE.DirectionalLight(amb.colorLuna || "#6a82b8", amb.luna);
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2, r = Math.max(maxX - minX, maxZ - minZ) / 2 + 4;
    luna.position.set(cx - 18, 40, cz - 12);
    luna.target.position.set(cx, 0, cz);
    luna.castShadow = ctx.sombrasSol !== false;
    luna.shadow.mapSize.set(2048, 2048);
    Object.assign(luna.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 120 });
    luna.shadow.bias = -0.0006;
    luna.shadow.normalBias = 0.04;
    escena.add(luna, luna.target);
  }
  const pool = [];
  for (let i = 0; i < MAX_LUCES; i++) {
    const l = new THREE.PointLight("#ffffff", 0, 8, 2);
    escena.add(l);
    pool.push(l);
  }
  let relojLuces = 0, apagonGlobal = 0;
  function actualizarLuces(dt, camPos, t) {
    relojLuces -= dt;
    if (relojLuces <= 0) {
      relojLuces = 0.3;
      const orden = fuentesLuz.filter((f) => !f.apagada).sort((a, b) => a.pos.distanceToSquared(camPos) - b.pos.distanceToSquared(camPos));
      for (let i = 0; i < pool.length; i++) pool[i].userData.fuente = orden[i] || null;
    }
    for (const l of pool) {
      const f = l.userData.fuente;
      if (!f) { l.intensity = 0; continue; }
      l.position.copy(f.pos);
      l.color.copy(f.color);
      l.distance = f.distancia;
      let k = 1;
      if (f.parpadeo) {
        k = 1 - f.parpadeo * 0.5 + Math.sin(t * 13 + f.pos.x) * f.parpadeo * 0.25 + Math.sin(t * 29 + f.pos.z) * f.parpadeo * 0.25;
        if (f.fluor && Math.random() < dt * 0.6) f.corte = 0.08 + Math.random() * 0.2;
        if (f.corte > 0) { f.corte -= dt; k = Math.random() < 0.5 ? 0.05 : 0.6; }
      }
      if (apagonGlobal > 0) k *= Math.random() < 0.1 ? 0.5 : 0.03;
      l.intensity = f.intensidad * k;
    }
    if (apagonGlobal > 0) apagonGlobal -= dt;
  }

  /* ---------------- Consultas ---------------- */
  function salaEn(x, z) {
    for (const s of def.salas) if (x >= s.x && x <= s.x + s.w && z >= s.z && z <= s.z + s.d) return s;
    return null;
  }
  /** ¿Choca un círculo de radio r en (x,z)? */
  function colisiona(x, z, r, ignorar) {
    if (!salaEn(x, z)) return true;
    for (const c of cajas) {
      if (c === ignorar) continue;
      if (c.puerta && c.puerta.abierta) continue;
      if (x + r > c.x0 && x - r < c.x1 && z + r > c.z0 && z - r < c.z1) return true;
    }
    return false;
  }
  const raycaster = new THREE.Raycaster();
  /** Primer impacto contra paredes/puertas/props en una dirección (o null). */
  function rayo(origen, dir, max = 60) {
    raycaster.set(origen, dir);
    raycaster.far = max;
    const h = raycaster.intersectObjects(solidos, false);
    for (const i of h) {
      if (i.object.userData.puerta && i.object.userData.puerta.abierta) continue;
      return i;
    }
    return null;
  }
  const _v = new THREE.Vector3(), _d = new THREE.Vector3();
  function lineaVision(a, b) {
    _d.subVectors(b, a);
    const dist = _d.length();
    _d.normalize();
    const h = rayo(a, _d, dist);
    return !h || h.distance >= dist - 0.2;
  }

  /* ---------------- Rejilla de navegación (IA) ---------------- */
  const CEL = 0.5;
  const NX = Math.ceil((maxX - minX) / CEL), NZ = Math.ceil((maxZ - minZ) / CEL);
  // Ocupación estática (paredes y muebles) calculada una vez; las puertas se miran al vuelo.
  const estatica = new Uint8Array(NX * NZ);
  const puertaDeCelda = new Map();
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const x = minX + (i + 0.5) * CEL, z = minZ + (j + 0.5) * CEL;
    let libre = !!salaEn(x, z);
    if (libre) {
      for (const c of cajas) {
        if (!(x + 0.28 > c.x0 && x - 0.28 < c.x1 && z + 0.28 > c.z0 && z - 0.28 < c.z1)) continue;
        if (c.puerta) { puertaDeCelda.set(j * NX + i, c.puerta); continue; }
        libre = false;
        break;
      }
    }
    estatica[j * NX + i] = libre ? 1 : 0;
  }
  function libreCelda(i, j) {
    const k = j * NX + i;
    if (!estatica[k]) return false;
    const p = puertaDeCelda.get(k);
    return !p || p.abierta;
  }
  function celda(x, z) { return [Math.floor((x - minX) / CEL), Math.floor((z - minZ) / CEL)]; }
  /** A* en la rejilla (con las puertas en su estado actual). Devuelve [[x,z],...] o null. */
  function camino(desde, hasta, maxNodos = 2500) {
    const [si, sj] = celda(desde.x, desde.z), [ei, ej] = celda(hasta.x, hasta.z);
    if (si === ei && sj === ej) return [[hasta.x, hasta.z]];
    const clave = (i, j) => j * NX + i;
    const abierto = new Map(), cerrado = new Set(), g = new Map(), padre = new Map();
    const h = (i, j) => Math.hypot(i - ei, j - ej);
    g.set(clave(si, sj), 0);
    abierto.set(clave(si, sj), h(si, sj));
    let n = 0;
    while (abierto.size && n++ < maxNodos) {
      let mejor = null, fm = Infinity;
      for (const [k, f] of abierto) if (f < fm) { fm = f; mejor = k; }
      abierto.delete(mejor);
      cerrado.add(mejor);
      const i = mejor % NX, j = Math.floor(mejor / NX);
      if (i === ei && j === ej) {
        const ruta = [];
        let k = mejor;
        while (k !== undefined && k !== clave(si, sj)) { ruta.unshift([minX + (k % NX + 0.5) * CEL, minZ + (Math.floor(k / NX) + 0.5) * CEL]); k = padre.get(k); }
        ruta.push([hasta.x, hasta.z]);
        return ruta;
      }
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= NX || nj >= NZ) continue;
        const k = clave(ni, nj);
        if (cerrado.has(k) || !libreCelda(ni, nj)) continue;
        if (di && dj && (!libreCelda(i + di, j) || !libreCelda(i, j + dj))) continue;
        const ng = g.get(mejor) + (di && dj ? 1.414 : 1);
        if (ng < (g.get(k) ?? Infinity)) { g.set(k, ng); padre.set(k, mejor); abierto.set(k, ng + h(ni, nj)); }
      }
    }
    return null;
  }

  /* ---------------- Animación de puertas y decorado ---------------- */
  function actualizar(dt, camara, t) {
    for (const p of puertas) {
      if (!p.malla) continue;
      const obj = p.abierta ? 1 : 0;
      if (p.angulo !== obj) {
        p.angulo += Math.sign(obj - p.angulo) * dt * 1.6;
        p.angulo = Math.max(0, Math.min(1, p.angulo));
        p.malla.rotation.y = -Math.PI * 0.55 * p.angulo * (p.sentido || 1);
      }
    }
    for (const o of animados) {
      if (o.userData.billboard) {
        o.getWorldPosition(_v);
        const yaw = Math.atan2(camara.position.x - _v.x, camara.position.z - _v.z);
        const padreYaw = o.parent ? o.parent.getWorldQuaternion(new THREE.Quaternion()) : null;
        o.rotation.y = yaw - (padreYaw ? new THREE.Euler().setFromQuaternion(padreYaw).y : 0);
      }
      if (o.userData.balanceo) o.rotation.z = Math.sin(t * 0.9 + o.id) * 0.04;
    }
    actualizarLuces(dt, camara.position, t);
  }

  return {
    def, escena, salas: def.salas, salasPorId, puertas, cajas, solidos, fuentesLuz,
    colisiona, salaEn, rayo, lineaVision, camino, actualizar, colocarProp,
    apagon(seg) { apagonGlobal = Math.max(apagonGlobal, seg); },
    limites: { minX, minZ, maxX, maxZ }
  };
}
