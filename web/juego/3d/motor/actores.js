/* ============================================================================
 *  3d/motor/actores.js — Enemigos y compañeros en 3D (con su inteligencia)
 * ============================================================================
 *  Cada personaje es la foto de cuerpo entero del juego original sobre un
 *  plano que siempre mira a la cámara, iluminado por la linterna y con sombra.
 *  Los impactos se calculan sobre la SILUETA real (canal alfa de la imagen):
 *  la parte superior es la cabeza (disparo a la cabeza ×3 y decapitación).
 *
 *  IA de los enemigos: dormido → oye/ve → persigue (A* por la rejilla del
 *  mundo) → ataca o agarra → aturdido / muere. Los perseguidores (Mr. X,
 *  Némesis, Jack...) no mueren: caen y se levantan. Los jefes embisten.
 *  Compañeros: te siguen, disparan a lo que ven y hablan de vez en cuando.
 * ========================================================================== */
import * as THREE from "../lib/three.module.min.js";
import { ENEMIGOS, COMPANEROS } from "../niveles/comun.js";

const PROB_CABEZA_UV = 0.83;   // por encima de esta altura de la imagen: cabeza
const ALFA = new Map();        // url → { w, h, datos } para pruebas de impacto

function cargarAlfa(url) {
  if (ALFA.has(url)) return;
  ALFA.set(url, null);
  const img = new Image();
  img.onload = () => {
    const w = 96, h = Math.max(1, Math.round(96 * img.naturalHeight / img.naturalWidth));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, w, h);
    ALFA.set(url, { w, h, datos: g.getImageData(0, 0, w, h).data, aspecto: img.naturalWidth / img.naturalHeight });
  };
  img.src = url;
}
function opaco(url, u, v) {
  const a = ALFA.get(url);
  if (!a) return true;
  const x = Math.min(a.w - 1, Math.max(0, Math.floor(u * a.w)));
  const y = Math.min(a.h - 1, Math.max(0, Math.floor((1 - v) * a.h)));
  return a.datos[(y * a.w + x) * 4 + 3] > 100;
}

export function crearActores(mundo, ctx) {
  const lista = [];
  const grupo = new THREE.Group();
  mundo.escena.add(grupo);
  const _v = new THREE.Vector3(), _w = new THREE.Vector3();
  let idSec = 0;

  /* ---------------- Figura (billboard) ---------------- */
  function figura(idFigura, alto, tinte) {
    const url = ctx.cuerpo(idFigura);
    cargarAlfa(url);
    const tex = ctx.textura(url);
    const mat = new THREE.MeshStandardMaterial({
      map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85,
      color: tinte || "#ffffff", emissive: "#000000", emissiveMap: tex
    });
    const geo = new THREE.PlaneGeometry(1, 1);
    geo.translate(0, 0.5, 0);
    const malla = new THREE.Mesh(geo, mat);
    malla.castShadow = true;
    malla.receiveShadow = true;
    malla.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
    const ajustar = () => {
      const a = ALFA.get(url);
      const asp = a ? a.aspecto : (tex.image && tex.image.width ? tex.image.width / tex.image.height : 0.45);
      malla.scale.set(alto * asp, alto, 1);
    };
    malla.scale.set(alto * 0.45, alto, 1);
    if (tex.image && tex.image.complete) ajustar();
    else tex.userData.alCargar = (tex.userData.alCargar || []).concat(ajustar);
    setTimeout(ajustar, 1500);
    const raiz = new THREE.Group();
    raiz.add(malla);
    grupo.add(raiz);
    return { raiz, malla, url, mat };
  }

  /* ---------------- Enemigos ---------------- */
  function crearEnemigo(d) {
    const def = { ...ENEMIGOS[d.tipo] || ENEMIGOS.zombi, ...(d.def || {}) };
    const figuraId = d.figura || def.figuras[Math.floor(Math.random() * def.figuras.length)];
    const escala = d.escala || (def.jefe || def.invencible ? 1 : 0.94 + Math.random() * 0.12);
    const alto = def.alto * escala;
    const f = figura(figuraId, alto, d.tinte || def.tinte);
    const e = {
      id: d.id || "e" + (idSec++), tipo: d.tipo, def, nombre: d.nombre || def.nombre, enemigo: true,
      x: d.x, z: d.z, alto, radio: (def.ancho || 0.7) * 0.4,
      vida: d.vida || def.vida, vidaMax: d.vida || def.vida,
      estado: d.dormido ? "dormido" : d.alerta ? "persigue" : "quieto",
      ruta: null, tRuta: 0, tVista: 0, veJugador: false, cdAtaque: 1, preparando: 0,
      aturdido: 0, destello: 0, caida: d.dormido ? 1 : 0, fase: Math.random() * 6, yaw: 0,
      cdSonido: 2 + Math.random() * 4, cdFrase: 6 + Math.random() * 10, embestida: 0, cdEmbestida: 6,
      sinCabeza: false, levantando: 0, retroceso: 0, ...f
    };
    e.raiz.position.set(e.x, 0, e.z);
    e.raiz.userData.actor = e;
    e.malla.userData.actor = e;
    lista.push(e);
    return e;
  }

  /* ---------------- Compañeros ---------------- */
  function crearCompanero(id, x, z) {
    const c = COMPANEROS[id];
    if (!c) return null;
    const f = figura(c.figura, 1.76);
    const a = { id: "comp_" + id, idPersonaje: id, def: c, companero: true, x, z, alto: 1.76, radio: 0.3, vida: 1, ruta: null, tRuta: 0, cdDisparo: 1.5, cdFrase: 25 + Math.random() * 20, fase: 0, destello: 0, caida: 0, ...f };
    a.raiz.position.set(x, 0, z);
    lista.push(a);
    return a;
  }

  /* ---------------- Movimiento con colisión ---------------- */
  function mover(a, dx, dz) {
    const nx = a.x + dx, nz = a.z + dz;
    if (!mundo.colisiona(nx, a.z, a.radio)) a.x = nx;
    if (!mundo.colisiona(a.x, nz, a.radio)) a.z = nz;
  }
  function seguirRuta(a, objetivo, vel, dt, directo) {
    let tx = objetivo.x, tz = objetivo.z;
    if (!directo) {
      a.tRuta -= dt;
      if (a.tRuta <= 0 || !a.ruta) {
        a.tRuta = 0.6 + Math.random() * 0.3;
        a.ruta = mundo.camino(a, objetivo, 1600);
      }
      if (a.ruta && a.ruta.length) {
        const [px, pz] = a.ruta[0];
        if (Math.hypot(px - a.x, pz - a.z) < 0.35) a.ruta.shift();
        if (a.ruta.length) [tx, tz] = a.ruta[0];
      }
    }
    const dx = tx - a.x, dz = tz - a.z, d = Math.hypot(dx, dz);
    if (d < 0.05) return 0;
    const paso = Math.min(d, vel * dt);
    mover(a, (dx / d) * paso, (dz / d) * paso);
    // Separación entre actores
    for (const o of lista) {
      if (o === a || o.estado === "muerto") continue;
      const sx = a.x - o.x, sz = a.z - o.z, s = Math.hypot(sx, sz);
      if (s > 0.001 && s < 0.6) mover(a, (sx / s) * dt * 0.8, (sz / s) * dt * 0.8);
    }
    return paso;
  }

  /** Panorámica estéreo (-1…1) de un punto respecto a la cámara. */
  function pan(x, z) {
    const cam = ctx.camara;
    cam.getWorldDirection(_v);
    const derecha = new THREE.Vector3(-_v.z, 0, _v.x).normalize();
    _w.set(x - cam.position.x, 0, z - cam.position.z).normalize();
    return Math.max(-1, Math.min(1, derecha.dot(_w)));
  }
  function sonar(e, tipo) {
    const p = pan(e.x, e.z);
    if (tipo === "gemido") Sonido.gemido();
    else if (tipo === "grunido") Sonido.grunido();
    else if (tipo === "respiracion") Sonido.respiracion(p);
    else if (tipo === "susurro") Sonido.susurro(p);
    else if (tipo === "motosierra") Sonido.arrastre(p);
  }

  /* ---------------- Daño a enemigos ---------------- */
  function herir(e, dano, cabeza, punto, dir) {
    if (!e.enemigo || e.estado === "muerto") return;
    if (e.estado === "dormido") despertar(e);
    if (e.estado !== "aturdido") e.estado = "persigue";
    e.destello = 0.12;
    e.retroceso = Math.min(0.6, e.retroceso + dano / 120);
    ctx.efectos.sangre(punto || new THREE.Vector3(e.x, e.alto * (cabeza ? 0.9 : 0.6), e.z), dir, cabeza ? 40 : 18);
    e.vida -= dano * (cabeza ? 3 : 1);
    if (e.vida > 0) return;
    if (e.def.invencible) {
      e.vida = e.vidaMax;
      e.estado = "aturdido";
      e.aturdido = 9;
      ctx.alAturdir(e);
      return;
    }
    morir(e, cabeza);
  }
  function morir(e, cabeza) {
    e.estado = "muerto";
    e.caidaObjetivo = 1;
    if (cabeza && !e.def.jefe) {
      // Decapitación: se recorta la parte superior de la figura y brota sangre.
      e.sinCabeza = true;
      const geo = new THREE.PlaneGeometry(1, PROB_CABEZA_UV);
      geo.translate(0, PROB_CABEZA_UV / 2, 0);
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * PROB_CABEZA_UV);
      e.malla.geometry.dispose();
      e.malla.geometry = geo;
      e.fuente = 1.5;
      ctx.efectos.sangre(new THREE.Vector3(e.x, e.alto * 0.92, e.z), null, 80);
    }
    ctx.efectos.charco(e.x, e.z, 1.2 + e.alto * 0.3);
    ctx.alMatar(e, cabeza);
  }
  function despertar(e) {
    e.estado = "persigue";
    e.levantando = 1.4;
    ctx.alDespertar(e);
  }

  /** Impacto de un disparo: devuelve {actor, cabeza, punto, distancia} o null. */
  const ray = new THREE.Raycaster();
  function impacto(origen, dir, max = 60) {
    ray.set(origen, dir);
    ray.far = max;
    const mallas = lista.filter((a) => a.enemigo && a.estado !== "muerto").map((a) => a.malla);
    const hits = ray.intersectObjects(mallas, false);
    for (const h of hits) {
      if (!h.uv) continue;
      const a = h.object.userData.actor;
      if (a.caida > 0.5) {
        // Tumbado: cualquier parte cuenta.
        return { actor: a, cabeza: h.uv.y > 0.8, punto: h.point, distancia: h.distance };
      }
      if (!opaco(a.url, h.uv.x, h.uv.y * (a.sinCabeza ? PROB_CABEZA_UV : 1))) continue;
      return { actor: a, cabeza: !a.sinCabeza && h.uv.y > PROB_CABEZA_UV, punto: h.point, distancia: h.distance };
    }
    return null;
  }

  /* ---------------- Actualización ---------------- */
  function actualizar(dt, t, jugador) {
    const cam = ctx.camara;
    const cabezaJ = new THREE.Vector3(jugador.x, 1.6, jugador.z);
    for (const a of lista) {
      a.fase += dt;
      if (a.enemigo) actualizarEnemigo(a, dt, jugador, cabezaJ);
      else if (a.companero) actualizarCompanero(a, dt, jugador);

      // Visual: posición, mirar a cámara, caída, balanceo y destello rojo.
      if (a.caida < (a.caidaObjetivo ?? 0)) a.caida = Math.min(1, a.caida + dt * 2.2);
      if (a.levantando > 0) { a.levantando -= dt; a.caida = Math.max(0, a.levantando / 1.4); }
      const yawCam = Math.atan2(cam.position.x - a.x, cam.position.z - a.z);
      if (a.caida < 0.05) a.yaw = yawCam;
      a.raiz.position.set(a.x, 0, a.z);
      a.raiz.rotation.y = a.yaw;
      const andando = a.velActual > 0.1;
      const bob = andando ? Math.abs(Math.sin(a.fase * (3 + a.velActual * 1.6))) * 0.035 * Math.min(1, a.velActual) : Math.sin(a.fase * 1.4) * 0.006;
      const lunge = a.preparando > 0 ? Math.sin((1 - a.preparando / 0.45) * Math.PI) * 0.25 : 0;
      a.malla.position.set(0, bob, lunge - a.retroceso * 0.5);
      a.malla.rotation.set(-a.caida * Math.PI / 2 + (a.estado === "aturdido" ? 0.25 : 0), 0, andando ? Math.sin(a.fase * (3 + a.velActual * 1.6)) * 0.03 : 0);
      if (a.estado === "aturdido") a.malla.scale.y = a.alto * 0.72; else if (a.malla.scale.y !== a.alto && ALFA.get(a.url)) a.malla.scale.y = a.alto;
      a.retroceso = Math.max(0, a.retroceso - dt * 2.5);
      if (a.destello > 0) { a.destello -= dt; a.mat.emissive.setRGB(0.5, 0, 0); } else a.mat.emissive.setRGB(0, 0, 0);
      if (a.fuente > 0) { a.fuente -= dt; if (Math.random() < 0.5) ctx.efectos.sangre(new THREE.Vector3(a.x, a.alto * 0.85 * (1 - a.caida * 0.9), a.z), new THREE.Vector3(0, 1, 0), 3); }
    }
  }

  function actualizarEnemigo(e, dt, j, cabezaJ) {
    e.velActual = 0;
    if (e.estado === "muerto") return;
    const dx = j.x - e.x, dz = j.z - e.z, d = Math.hypot(dx, dz);
    // Visión (cada 0,25 s)
    e.tVista -= dt;
    if (e.tVista <= 0) {
      e.tVista = 0.25;
      const ojos = new THREE.Vector3(e.x, e.alto * 0.9, e.z);
      e.veJugador = d < 40 && mundo.lineaVision(ojos, cabezaJ);
    }
    if (e.estado === "dormido") {
      if (d < 2.5 || (ctx.ultimoRuido && Math.hypot(ctx.ultimoRuido.x - e.x, ctx.ultimoRuido.z - e.z) < 4 && ctx.ultimoRuido.t > 0)) despertar(e);
      return;
    }
    if (e.levantando > 0) return;
    if (e.estado === "aturdido") {
      e.aturdido -= dt;
      if (e.aturdido <= 0) { e.estado = "persigue"; ctx.alLevantarse(e); }
      return;
    }
    // Detección
    if (e.estado === "quieto") {
      const oye = ctx.ultimoRuido && ctx.ultimoRuido.t > 0 && Math.hypot(ctx.ultimoRuido.x - e.x, ctx.ultimoRuido.z - e.z) < (e.def.oido || 10) * ctx.ultimoRuido.fuerza;
      const ve = !e.def.ciego && e.veJugador && d < (e.def.vista || 12);
      if (oye || ve || d < 1.8) { e.estado = "persigue"; ctx.alDetectar(e); }
      else {
        // Deambula despacio
        e.vagar = (e.vagar || 0) - dt;
        if (e.vagar <= 0) { e.vagar = 3 + Math.random() * 4; e.destinoVagar = { x: e.x + (Math.random() - 0.5) * 3, z: e.z + (Math.random() - 0.5) * 3 }; }
        if (e.destinoVagar) e.velActual = seguirRuta(e, e.destinoVagar, e.def.vel * 0.5, dt, true) / dt;
      }
      return;
    }
    // Sonidos y frases
    e.cdSonido -= dt;
    if (e.cdSonido <= 0 && d < 14) { e.cdSonido = 3 + Math.random() * 5; sonar(e, e.def.sonido); }
    e.cdFrase -= dt;
    if (e.cdFrase <= 0 && e.def.frases && d < 16) { e.cdFrase = 8 + Math.random() * 10; ctx.alHablar(e.nombre, e.def.frases[Math.floor(Math.random() * e.def.frases.length)], true); }
    if (e.def.pasos) {
      e.cdPaso = (e.cdPaso || 0) - dt;
      if (e.cdPaso <= 0) { e.cdPaso = 0.62; Sonido.golpeSordo(pan(e.x, e.z)); if (d < 6) ctx.sacudir(0.03); }
    }
    // Ataque en curso
    if (e.preparando > 0) {
      e.preparando -= dt;
      if (e.preparando <= 0) {
        const alcance = 1.35 + (e.def.ancho || 0.7) * 0.3;
        if (d < alcance && !ctx.agarreActivo()) {
          if (e.def.agarra && Math.random() < 0.42) ctx.alAgarrar(e);
          else ctx.alHerirJugador(e.def.dano, e);
        }
      }
      return;
    }
    e.cdAtaque -= dt;
    // Esquiva de Wesker / Miranda cuando les apuntas
    if (e.def.esquiva && ctx.jugadorApunta() && d < 16 && Math.random() < dt * 1.6) {
      const lado = Math.random() < 0.5 ? -1 : 1;
      mover(e, (-dz / d) * lado * 1.6, (dx / d) * lado * 1.6);
      ctx.efectos.estela(e);
    }
    // Embestida de los jefes
    e.cdEmbestida -= dt;
    if (e.def.embestida && e.embestida <= 0 && e.cdEmbestida <= 0 && d > 4 && d < 14 && e.veJugador) {
      e.embestida = 1.3; e.cdEmbestida = 6 + Math.random() * 4; Sonido.stinger(); ctx.alHablar(e.nombre, "¡RUGE Y EMBISTE!", true);
    }
    let vel = e.def.velPersecucion || e.def.vel;
    if (e.embestida > 0) {
      e.embestida -= dt;
      vel *= 3;
      if (d < 1.4) { e.embestida = 0; ctx.alHerirJugador(Math.round(e.def.dano * 1.3), e); ctx.empujar(dx / d, dz / d, 7); }
    }
    if (d > 1.15 + (e.def.ancho || 0.7) * 0.25) {
      e.velActual = seguirRuta(e, j, vel, dt, e.veJugador && d < 8) / Math.max(dt, 1e-4);
    } else if (e.cdAtaque <= 0) {
      e.cdAtaque = 1.5 + Math.random() * 0.6;
      e.preparando = 0.45;
      sonar(e, e.def.sonido);
    }
  }

  function actualizarCompanero(c, dt, j) {
    c.velActual = 0;
    const dx = j.x - c.x, dz = j.z - c.z, d = Math.hypot(dx, dz);
    // Seguir al jugador (detrás y a un lado)
    if (d > 2.2) {
      const objetivo = { x: j.x - Math.sin(j.yaw) * -1.5 + Math.cos(j.yaw) * 0.8, z: j.z - Math.cos(j.yaw) * -1.5 - Math.sin(j.yaw) * 0.8 };
      if (mundo.colisiona(objetivo.x, objetivo.z, 0.3)) { objetivo.x = j.x; objetivo.z = j.z; }
      c.velActual = seguirRuta(c, objetivo, d > 6 ? 4 : 2.6, dt, d < 4) / Math.max(dt, 1e-4);
      if (d > 25) { c.x = j.x - Math.sin(j.yaw); c.z = j.z - Math.cos(j.yaw); }
    }
    // Disparar al enemigo visible más cercano
    c.cdDisparo -= dt;
    if (c.cdDisparo <= 0) {
      c.cdDisparo = 0.4;
      let blanco = null, mejor = 14;
      const ojos = new THREE.Vector3(c.x, 1.55, c.z);
      for (const e of lista) {
        if (!e.enemigo || e.estado === "muerto" || e.estado === "dormido") continue;
        const de = Math.hypot(e.x - c.x, e.z - c.z);
        if (de < mejor && mundo.lineaVision(ojos, new THREE.Vector3(e.x, e.alto * 0.7, e.z))) { mejor = de; blanco = e; }
      }
      if (blanco && blanco.estado !== "aturdido") {
        c.cdDisparo = c.def.arma === "fusil" ? 0.7 : 1.25;
        const cabeza = Math.random() < 0.18;
        ctx.efectos.fogonazo(new THREE.Vector3(c.x, 1.4, c.z));
        Sonido.disparo(0.45);
        herir(blanco, c.def.arma === "fusil" ? 16 : 20, cabeza, new THREE.Vector3(blanco.x, blanco.alto * (cabeza ? 0.9 : 0.6), blanco.z), null);
      }
    }
    c.cdFrase -= dt;
    if (c.cdFrase <= 0) { c.cdFrase = 30 + Math.random() * 30; ctx.alHablar(ctx.nombre(c.idPersonaje), c.def.frases[Math.floor(Math.random() * c.def.frases.length)]); }
  }

  function quitar(a) {
    grupo.remove(a.raiz);
    lista.splice(lista.indexOf(a), 1);
  }

  return { lista, crearEnemigo, crearCompanero, actualizar, impacto, herir, quitar, enemigos: () => lista.filter((a) => a.enemigo) };
}
