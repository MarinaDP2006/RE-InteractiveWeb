/* ============================================================================
 *  3d/juego3d.js — UMBRELLA ARCHIVES · El Juego en 3D (motor principal)
 * ============================================================================
 *  Survival horror en primera persona con los 9 Resident Evil principales.
 *
 *  Flujo: título → (nombre) → tarjeta del archivo → cinemática de entrada →
 *  exploración en 3D (llaves, puertas, documentos, puzzles, máquinas de
 *  escribir, enemigos, perseguidores, jefe) → cinemática final → resultado
 *  (rango) → siguiente archivo… → ranking de la campaña completa.
 *
 *  Estado guardable (E): archivo, posición, salud, inventario, llaves,
 *  documentos, puertas abiertas, objetos recogidos, enemigos muertos, salas
 *  visitadas, marcas de la historia, tiempo y estadísticas.
 * ========================================================================== */
import * as THREE from "./lib/three.module.min.js";
import { configurar as configurarTexturas } from "./motor/texturas.js";
import { crearMundo } from "./motor/mundo.js";
import { crearActores } from "./motor/actores.js";
import { crearJugador, pedirBloqueo, ARMAS } from "./motor/jugador.js";
import { crearEfectos, crearPost } from "./motor/efectos3d.js";
import { OBJETOS, ICONOS, ENEMIGOS, COMPANEROS } from "./niveles/comun.js";
import { NIVELES } from "./niveles/index.js";

const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const almacen = {
  leer(k) { try { return localStorage.getItem(k); } catch { return null; } },
  escribir(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
  borrar(k) { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } }
};
const CLAVE_PARTIDA = "umbrella3d_partida", CLAVE_OPC = "umbrella3d_opciones", CLAVE_AVISO = "archivos_umbrella_aviso18";
const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

/* ---------------- Imágenes de cuerpo entero disponibles ---------------- */
const CUERPOS = new Set(("ada ada_re4 ada_re6 alyssa angie benford birkin carla carlos chris chris_re6 chris_re7 chris_re8 claire dimitrescu donna duque ethan excella g_adulto ganado gideon gigante grace heisenberg helena hija hunnigan hunter ivy jake jill jill_p30 jill_re5 jo josh krauser leon leon_re2 leon_re6 leon_re9 licantropo licker luis majini mendez mia mikhail miranda moldeado monje moreau mrx nemesis nikolai perro piers regenerador rose saddler sherry sherry_nina sheva tyrell ustanak wesker wesker_re4 zeno zombi").split(" "));
function cuerpo(id) {
  const v = R && R.def.variantes && R.def.variantes[id];
  if (v && CUERPOS.has(v)) return `img/cuerpos/${v}.webp`;
  return CUERPOS.has(id) ? `img/cuerpos/${id}.webp` : Retratos.cuerpo(id);
}
const retrato = (id) => Retratos.de(id);
const nombreDe = (id) => (PERSONAJES[id] ? PERSONAJES[id].nombre : id);

const cargador = new THREE.TextureLoader();
const texturas = new Map();
function textura(url) {
  if (!texturas.has(url)) {
    const t = cargador.load(url, (tx) => { (tx.userData.alCargar || []).forEach((f) => f()); });
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    texturas.set(url, t);
  }
  return texturas.get(url);
}

/* ---------------- Opciones ---------------- */
const opciones = { calidad: "alta", brillo: 1.08, fov: 72, sens: 1, invertir: false, sonido: true, reducir: false };
try { Object.assign(opciones, JSON.parse(almacen.leer(CLAVE_OPC) || "{}")); } catch { /* por defecto */ }
const CALIDAD = {
  ultra: { escala: 1.5, sombra: 2048, tex: 1024, aniso: 16 },
  alta: { escala: 1, sombra: 1024, tex: 512, aniso: 8 },
  media: { escala: 0.8, sombra: 1024, tex: 512, aniso: 4 },
  baja: { escala: 0.6, sombra: 512, tex: 256, aniso: 2 }
};
function guardarOpciones() { almacen.escribir(CLAVE_OPC, JSON.stringify(opciones)); }

/* ---------------- Renderizador ---------------- */
const lienzo = $("#lienzo");
const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const post = crearPost(renderer);
function aplicarCalidad() {
  const q = CALIDAD[opciones.calidad] || CALIDAD.alta;
  // Ultra: supermuestreo hasta acercarse a 4K aunque la pantalla sea 1080p.
  const objetivo4k = opciones.calidad === "ultra" ? Math.min(2, 3840 / Math.max(1, innerWidth * renderer.getPixelRatio())) : 1;
  post.escala(q.escala * Math.max(1, objetivo4k));
  configurarTexturas({ tam: q.tex, anisotropia: q.aniso });
  post.tam(innerWidth, innerHeight);
  post.uniforms.uBrillo.value = opciones.brillo;
  post.uniforms.uGrano.value = opciones.reducir ? 0.03 : 0.065;
  post.uniforms.uAberracion.value = opciones.reducir ? 0.3 : 1;
}
function redimensionar() {
  renderer.setSize(innerWidth, innerHeight, false);
  aplicarCalidad();
  if (R && R.jug) { R.jug.camara.aspect = innerWidth / innerHeight; R.jug.camara.updateProjectionMatrix(); }
  if (T) { T.camara.aspect = innerWidth / innerHeight; T.camara.updateProjectionMatrix(); }
}
addEventListener("resize", redimensionar);

/* ======================================================================
 *  ESTADO
 * ==================================================================== */
let CONFIG = { archivos: {}, videos: {} };
let E = null;        // estado de la partida
let R = null;        // nivel en ejecución
let T = null;        // escena del título
let ultimoGuardado = null;
let modo = "titulo"; // titulo | jugando | pausa | cine | menu
let reloj = 0;

const archivoActivo = (i) => (CONFIG.archivos || {})[NIVELES[i].id] !== false;
function siguienteActivo(desde) {
  for (let i = desde + 1; i < NIVELES.length; i++) if (archivoActivo(i)) return i;
  return -1;
}
function nuevoEstado(nombre, nivel, modoPartida) {
  return {
    version: 3, id: null, nombre, modo: modoPartida, nivel, salud: 100,
    inventario: { hierba_verde: 1, municion: 15, cinta: 1 }, claves: [], docs: [],
    armas: { pistola: { cargador: 15 } }, arma: "pistola",
    puertas: [], recogidos: [], muertos: [], visitadas: [], marcas: {}, eventos: [], pos: null,
    tiempo: 0, muertes: 0, stats: { bajas: 0, tiros: 0, aciertos: 0, cabezas: 0, tiempoArchivo: 0 }
  };
}
const snapshot = () => JSON.stringify(E);

/* ======================================================================
 *  INTERFAZ: pantallas, ventanas, avisos
 * ==================================================================== */
function pantalla(id) {
  document.querySelectorAll(".pantalla").forEach((p) => p.classList.toggle("activa", p.id === id));
}
function ventana(id, ver = true) {
  const v = document.getElementById(id);
  v.hidden = !ver;
  if (ver) { if (document.pointerLockElement) document.exitPointerLock(); }
}
const ventanaAbierta = () => document.querySelector(".ventana:not([hidden])");
document.querySelectorAll(".ventana .cerrar").forEach((b) => b.addEventListener("click", () => cerrarVentanas()));
function cerrarVentanas() {
  document.querySelectorAll(".ventana").forEach((v) => { if (v.id !== "v-aviso") v.hidden = true; });
  if (modo === "pausa" || modo === "menu") reanudar();
}

function aviso(texto) {
  const d = document.createElement("div");
  d.textContent = texto;
  $("#hud-avisos").appendChild(d);
  setTimeout(() => d.remove(), 3500);
}
let tSub = null;
function subtitulo(nombre, texto, enemigo) {
  const s = $("#hud-subtitulo");
  s.innerHTML = `<b style="color:${enemigo ? "#ff6a6a" : "#7fd4ff"}">${esc(nombre)}</b>${esc(texto)}`;
  s.classList.add("visible");
  clearTimeout(tSub);
  tSub = setTimeout(() => s.classList.remove("visible"), 2500 + texto.length * 45);
}
function objetivo(texto) {
  if (!E) return;
  E.objetivo = texto;
  $("#hud-objetivo").textContent = texto ? "▸ " + texto : "";
  if (texto) Sonido.campana();
}

/* ======================================================================
 *  CARGA DE UN NIVEL
 * ==================================================================== */
const CONSEJOS = [
  "Apunta a la cabeza: hace el triple de daño y puede decapitar.",
  "Si un zombi te agarra, pulsa E o Espacio muy rápido para soltarte.",
  "Los perseguidores no mueren. Derríbalos y corre.",
  "Combina una hierba verde con una roja: curan del todo.",
  "Las máquinas de escribir guardan la partida si tienes cintas de tinta.",
  "Lee los documentos: guardan las soluciones de los puzzles.",
  "Los cadáveres del suelo no siempre están muertos.",
  "Con la mira quieta unos segundos, el disparo es más preciso.",
  "El mapa (M) marca en rojo las salas donde aún quedan objetos."
];

async function cargarNivel(estado) {
  E = estado;
  const def = NIVELES[E.nivel];
  modo = "cargando";
  $("#hud").hidden = true;
  pantalla("pantalla-carga");
  $("#carga-texto").textContent = `CARGANDO ${def.juego.toUpperCase()}…`;
  $("#carga-consejo").textContent = CONSEJOS[Math.floor(Math.random() * CONSEJOS.length)];
  await esperar(60);
  destruirNivel();
  destruirTitulo();
  aplicarCalidad();

  for (const [id, p] of Object.entries(def.personajes || {})) if (!PERSONAJES[id]) PERSONAJES[id] = p;
  // Un jefe que no llegó a morir vuelve a aparecer al cargar la partida.
  for (const ev of def.eventos || []) {
    if ((ev.acciones || []).some((a) => a.jefe) && !E.marcas["jefe_" + def.id]) E.eventos = E.eventos.filter((x) => x !== ev.id);
  }
  Efectos.limpiar();
  const ctxMundo = { imagen: textura, cuerpo, sombrasSol: opciones.calidad !== "baja" };
  const mundo = crearMundo(def, ctxMundo);
  const efectos = crearEfectos(mundo.escena);
  const ctxJug = {
    escena: mundo.escena, lienzo, mundo, efectos,
    activo: () => modo === "jugando", sensibilidad: () => opciones.sens, invertirY: () => opciones.invertir, fov: () => opciones.fov,
    apagon: () => R && R.apagon > 0,
    municion: (tipo) => E.inventario[tipo] || 0,
    gastar: (tipo, n) => { E.inventario[tipo] = Math.max(0, (E.inventario[tipo] || 0) - n); },
    aviso, alCambiarArma: () => pintarArma(), alTiroCabeza: () => { E.stats.cabezas++; },
    ruido: (x, z, fuerza) => { R.ruido = { x, z, fuerza, t: 0.4 }; },
    actores: null
  };
  const jug = crearJugador(ctxJug);
  jug.linterna.shadow.mapSize.set((CALIDAD[opciones.calidad] || CALIDAD.alta).sombra, (CALIDAD[opciones.calidad] || CALIDAD.alta).sombra);
  jug.camara.aspect = innerWidth / innerHeight;
  jug.camara.updateProjectionMatrix();

  interActual = null;
  $("#hud-accion").classList.remove("visible");
  R = { def, mundo, efectos, jug, items: [], eventosHechos: new Set(E.eventos), jefe: null, perseguidores: [], ruido: null, apagon: 0, agarre: null, salaActual: null, tSala: 0, inicioArchivo: performance.now(), visitas: new Set(E.visitadas), siluetas: [], ojos: [] };
  const actores = crearActores(mundo, {
    camara: jug.camara, cuerpo, textura, efectos, nombre: nombreDe,
    get ultimoRuido() { return R.ruido; },
    jugadorApunta: () => jug.j.apuntado > 0.6,
    agarreActivo: () => !!R.agarre,
    alHerirJugador: (dano, e) => herirJugador(dano, e),
    alAgarrar: (e) => iniciarAgarre(e),
    alMatar: (e, cabeza) => enemigoMuerto(e, cabeza),
    alAturdir: (e) => { aviso(`${e.nombre} cae al suelo… pero se levantará.`); Sonido.grunido(); },
    alLevantarse: (e) => { Sonido.stinger(); subtitulo(e.nombre, "se vuelve a levantar.", true); },
    alDespertar: () => { Sonido.stinger(); Sonido.gemido(); R.terror.subir(0.3); },
    alDetectar: (e) => { if (e.def.jefe || e.def.invencible) Sonido.stinger(); },
    alHablar: (n, t, enemigo) => subtitulo(n, t, enemigo),
    sacudir: (v) => { jug.j.sacudida = Math.max(jug.j.sacudida, opciones.reducir ? v * 0.3 : v); },
    empujar: (dx, dz, f) => { jug.j.empuje.x += dx * f * 0.016; jug.j.empuje.z += dz * f * 0.016; }
  });
  ctxJug.actores = actores;
  R.actores = actores;

  // Jugador: posición guardada o inicio del nivel
  const p = E.pos || def.inicio;
  jug.j.x = p.x; jug.j.z = p.z; jug.j.yaw = p.yaw ?? def.inicio.yaw ?? 0;
  jug.j.salud = E.salud;
  jug.j.armas = JSON.parse(JSON.stringify(E.armas));
  jug.j.arma = E.arma && E.armas[E.arma] ? E.arma : "pistola";

  // Puertas abiertas en la partida guardada
  for (const pu of mundo.puertas) if (E.puertas.includes(pu.id)) { pu.abierta = true; pu.angulo = 1; if (pu.malla) pu.malla.rotation.y = -Math.PI * 0.55; }

  // Objetos interactivos y enemigos
  (def.objetos || []).forEach((o, i) => crearItem({ id: o.id || `${def.id}_o${i}`, ...o }));
  (def.enemigos || []).forEach((d, i) => {
    const id = d.id || `${def.id}_e${i}`;
    if (!E.muertos.includes(id)) actores.crearEnemigo({ ...d, id });
  });
  if (def.companero && !E.marcas["sin_companero"]) {
    const c = actores.crearCompanero(def.companero, jug.j.x - Math.sin(jug.j.yaw) * -1.2, jug.j.z + 1.2);
    R.companero = c;
  }
  // Eventos ya disparados que dejan cosas en el mundo (perseguidores, compañero tardío...)
  for (const ev of def.eventos || []) {
    if (!R.eventosHechos.has(ev.id)) continue;
    for (const a of ev.acciones || []) {
      if (a.perseguidor && !E.muertos.includes(a.perseguidor.id)) R.perseguidores.push(actores.crearEnemigo({ ...a.perseguidor, alerta: false }));
      if (a.companero && !R.companero) R.companero = actores.crearCompanero(a.companero, jug.j.x, jug.j.z + 1);
    }
  }

  // Director del miedo
  R.terror = Terror.crear({
    tema: def.tema, reducir: opciones.reducir,
    sala: {
      apagon: (s) => { R.apagon = s; mundo.apagon(s); },
      silueta: (lado) => crearSilueta(lado),
      ojos: () => crearOjos(),
      sacudir: (v) => { jug.j.sacudida = Math.max(jug.j.sacudida, v); },
      polvo: () => efectos.sangre(new THREE.Vector3(jug.j.x + (Math.random() - 0.5), 2.8, jug.j.z + (Math.random() - 0.5)), null, 0)
    }
  });

  // Música y ambiente del juego
  Sonido.ambienteOn(def.temaMusica || def.id);
  Retratos.setVariantes(def.variantes || {});
  pintarArma();
  pintarCompanero();
  objetivo(E.objetivo || def.objetivo || "");
  Efectos.ECG.iniciar($("#hud-ecg"));
  actualizarSalud();
  if (!ultimoGuardado) ultimoGuardado = snapshot();
  return R;
}

function destruirNivel() {
  if (!R) return;
  R.terror.destruir();
  R.mundo.escena.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
  });
  Sonido.tension(false);
  R = null;
}

/* ---------------- Objetos interactivos ---------------- */
const matBrillo = new THREE.SpriteMaterial({ map: (() => {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,230,1)"); gr.addColorStop(0.2, "rgba(255,240,180,.6)"); gr.addColorStop(1, "rgba(255,240,180,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = "rgba(255,255,240,.9)"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(32, 4); g.lineTo(32, 60); g.moveTo(4, 32); g.lineTo(60, 32); g.stroke();
  const t = new THREE.CanvasTexture(c); return t;
})(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

function mallaItem(o) {
  const g = new THREE.Group();
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...extra });
  const t = o.tipo;
  if (t === "objeto" || t === "arma") {
    const def = OBJETOS[o.objeto || o.arma] || {};
    if ((o.objeto || "").startsWith("hierba")) {
      const maceta = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.12, 10), std("#6a3a1a"));
      maceta.position.y = 0.06;
      g.add(maceta);
      for (let i = 0; i < 6; i++) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 4), std(def.color || "#3aa04a")); h.position.set(Math.cos(i) * 0.04, 0.22, Math.sin(i) * 0.04); h.rotation.set(Math.cos(i) * 0.5, 0, Math.sin(i) * 0.5); g.add(h); }
    } else if (o.arma === "escopeta") {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.08), std("#2a2a2a", { metalness: 0.8 }));
      c.position.y = 0.05; c.rotation.y = 0.4; g.add(c);
    } else {
      const caja = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.14), std(def.color || "#8a7a5a"));
      caja.position.y = 0.06;
      g.add(caja);
    }
  } else if (t === "llave") {
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 14), std(o.color || "#c8a030", { metalness: 0.9, roughness: 0.3 }));
    anillo.rotation.x = Math.PI / 2; anillo.position.y = 0.02;
    const vara = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.012, 0.02), anillo.material);
    vara.position.set(0.08, 0.02, 0);
    g.add(anillo, vara);
  } else if (t === "documento" || t === "mapa") {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.3), std(t === "mapa" ? "#cbbd94" : "#e0d6bc", { side: THREE.DoubleSide, roughness: 1 }));
    p.rotation.x = -Math.PI / 2; p.rotation.z = 0.3; p.position.y = 0.01;
    g.add(p);
  } else if (t === "puzzle" || t === "examinar" || t === "salida" || t === "npc" || t === "maquina") {
    // Sin malla propia (el decorado ya lo representa) o se crea un prop.
    if (t === "maquina") { R.mundo.colocarProp("maquina", o.x, o.z, o.rot || 0, {}, null); }
    if (t === "npc") {
      const tex = textura(cuerpo(o.personaje));
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.8), new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
      m.position.y = 0.9; m.castShadow = true; m.userData.billboard = true; g.add(m);
    }
  }
  if (!["examinar", "salida", "npc", "maquina", "puzzle"].includes(t) || o.brillo) {
    const s = new THREE.Sprite(matBrillo);
    s.scale.set(0.35, 0.35, 1);
    s.position.y = 0.2;
    s.userData.brillo = true;
    g.add(s);
  }
  return g;
}
function crearItem(o) {
  if (E.recogidos.includes(o.id)) return;
  if (o.si && !E.marcas[o.si]) { R.items.push({ ...o, oculto: true }); return; }
  const malla = mallaItem(o);
  malla.position.set(o.x, o.y ?? (o.enMesa ? 0.81 : 0), o.z);
  R.mundo.escena.add(malla);
  R.items.push({ ...o, malla });
}
function quitarItem(it) {
  E.recogidos.push(it.id);
  if (it.malla) R.mundo.escena.remove(it.malla);
  R.items.splice(R.items.indexOf(it), 1);
}

/* ---------------- Interacción ---------------- */
function itemCercano() {
  const j = R.jug.j;
  const dir = new THREE.Vector3();
  R.jug.camara.getWorldDirection(dir);
  let mejor = null, dMin = 1.9;
  for (const it of R.items) {
    if (it.oculto) continue;
    const dx = it.x - j.x, dz = it.z - j.z, d = Math.hypot(dx, dz);
    const alcance = it.tipo === "salida" || it.tipo === "npc" ? 2.4 : 1.9;
    if (d > alcance) continue;
    const ang = (dx * dir.x + dz * dir.z) / (d * Math.hypot(dir.x, dir.z) || 1);
    if (d > 0.7 && ang < 0.55) continue;
    if (d < dMin) { dMin = d; mejor = it; }
  }
  // Puertas cercanas (para mensajes de cerrada/abrir)
  let puerta = null, dP = 1.8;
  for (const p of R.mundo.puertas) {
    if (p.tipo === "arco" || p.abierta) continue;
    const d = Math.hypot(p.x - j.x, p.z - j.z);
    const ang = ((p.x - j.x) * dir.x + (p.z - j.z) * dir.z) / (d * Math.hypot(dir.x, dir.z) || 1);
    if (d < dP && ang > 0.4) { dP = d; puerta = p; }
  }
  if (puerta && (!mejor || dP < dMin)) return { puerta };
  return mejor ? { item: mejor } : null;
}
function textoAccion(o) {
  if (o.puerta) {
    const p = o.puerta;
    if (p.llave && !E.claves.includes(p.llave)) return `Cerrada · Necesitas: ${p.nombreLlave || nombreLlave(p.llave)}`;
    if (p.bloqueada) return "Puerta bloqueada";
    return `Abrir${p.nombre ? " · " + p.nombre : ""}`;
  }
  const it = o.item;
  switch (it.tipo) {
    case "objeto": return `Recoger · ${(OBJETOS[it.objeto] || {}).nombre || it.objeto}${it.cantidad > 1 ? " ×" + it.cantidad : ""}`;
    case "arma": return `Recoger · ${(OBJETOS[it.arma] || {}).nombre}`;
    case "llave": return `Recoger · ${it.nombre}`;
    case "documento": return `Leer · ${documento(it.doc)?.titulo || "documento"}`;
    case "mapa": return "Recoger · Mapa de la zona";
    case "maquina": return "Usar la máquina de escribir";
    case "puzzle": return `Examinar · ${it.nombre || "mecanismo"}`;
    case "salida": return it.nombre || "Salir";
    case "npc": return `Hablar · ${it.nombre || nombreDe(it.personaje)}`;
    default: return `Examinar · ${it.nombre || ""}`;
  }
}
function nombreLlave(k) {
  const l = (R.def.llaves || {})[k] || (R.def.objetos || []).find((o) => o.llave === k);
  return l ? l.nombre : k;
}
function documento(id) {
  return (R && R.def.documentos && R.def.documentos[id]) || DOCUMENTOS[id];
}
function usar(o) {
  const j = R.jug.j;
  if (o.puerta) {
    const p = o.puerta;
    if (p.bloqueada) { aviso("Está bloqueada desde el otro lado."); Sonido.error(); return; }
    if (p.llave && !E.claves.includes(p.llave)) { aviso(`Necesitas: ${p.nombreLlave || nombreLlave(p.llave)}`); Sonido.error(); return; }
    p.abierta = true;
    // Se abre alejándose del jugador
    p.sentido = (p.eje === "x" ? (j.z < p.z ? -1 : 1) : (j.x < p.x ? 1 : -1));
    if (!E.puertas.includes(p.id)) E.puertas.push(p.id);
    if (p.llave && !E.marcas["usada_" + p.llave]) { E.marcas["usada_" + p.llave] = true; aviso(`Has usado: ${p.nombreLlave || nombreLlave(p.llave)}`); }
    Sonido.portazo(0);
    return;
  }
  const it = o.item;
  switch (it.tipo) {
    case "objeto": {
      const def = OBJETOS[it.objeto];
      E.inventario[it.objeto] = (E.inventario[it.objeto] || 0) + (it.cantidad || 1);
      aviso(`Has obtenido: ${def.nombre}${it.cantidad > 1 ? " ×" + it.cantidad : ""}`);
      Sonido.exito();
      quitarItem(it);
      pintarArma();
      break;
      comprobarEventos("recoger", it.id);
    }
    case "arma": {
      j.armas[it.arma] = { cargador: ARMAS[it.arma].cargador };
      E.armas = JSON.parse(JSON.stringify(j.armas));
      aviso(`Has obtenido: ${OBJETOS[it.arma].nombre} (tecla 2)`);
      Sonido.exito();
      quitarItem(it);
      comprobarEventos("recoger", it.id);
      break;
    }
    case "llave":
      E.claves.push(it.llave);
      aviso(`Has obtenido: ${it.nombre}`);
      Sonido.exito();
      quitarItem(it);
      comprobarEventos("recoger", it.id);
      break;
    case "mapa":
      E.marcas["mapa_" + R.def.id] = true;
      aviso("Has obtenido el mapa. Ábrelo con M.");
      Sonido.exito();
      quitarItem(it);
      break;
    case "documento":
      if (!E.docs.includes(it.doc)) E.docs.push(it.doc);
      abrirDocumento(it.doc);
      if (!it.permanece) quitarItem(it);
      comprobarEventos("recoger", it.id);
      break;
    case "maquina": abrirMaquina(); break;
    case "puzzle": abrirPuzzle(it); break;
    case "salida":
      if (it.requiere && !E.marcas[it.requiere]) { aviso(it.bloqueo || "Todavía no puedes salir de aquí."); Sonido.error(); return; }
      terminarArchivo(it);
      break;
    case "npc": {
      const l = it.lineas || ["…"];
      it.linea = ((it.linea ?? -1) + 1) % l.length;
      subtitulo(it.nombre || nombreDe(it.personaje), l[it.linea]);
      if (it.da && !it.dado) { it.dado = true; for (const [k, n] of Object.entries(it.da)) { E.inventario[k] = (E.inventario[k] || 0) + n; aviso(`Has obtenido: ${OBJETOS[k].nombre} ×${n}`); } pintarArma(); }
      break;
    }
    default: {
      subtitulo(nombreDe(R.def.protagonista), it.texto || "…");
      if (!it.hecho) {
        it.hecho = true;
        ejecutarAcciones(it.acciones || [], it);
        if (it.marca) marcar(it.marca);
        if (it.unaVez) quitarItem(it);
      }
    }
  }
}

/* ---------------- Eventos de la historia ---------------- */
function marcar(m) {
  if (!m || E.marcas[m]) return;
  E.marcas[m] = true;
  for (const it of [...R.items]) if (it.oculto && it.si === m) { R.items.splice(R.items.indexOf(it), 1); delete it.oculto; crearItem(it); }
  comprobarEventos("marca", m);
}
function comprobarEventos(cuando, dato) {
  for (const ev of R.def.eventos || []) {
    if (R.eventosHechos.has(ev.id)) continue;
    if (ev.cuando !== cuando) continue;
    if (cuando === "entrar" && ev.sala !== dato) continue;
    if (cuando === "marca" && !E.marcas[ev.marca]) continue;
    if (cuando === "recoger" && ev.objeto !== dato) continue;
    if (cuando === "matar" && ev.enemigo !== dato) continue;
    if (ev.si && !E.marcas[ev.si]) continue;
    R.eventosHechos.add(ev.id);
    E.eventos.push(ev.id);
    ejecutarAcciones(ev.acciones || [], ev);
  }
}
async function ejecutarAcciones(acciones, origen) {
  for (const a of acciones) {
    if (!R) return;
    if (a.cine) await cinematica(a.cine);
    if (a.texto) subtitulo(a.quien ? nombreDe(a.quien) : nombreDe(R.def.protagonista), a.texto);
    if (a.objetivo) objetivo(a.objetivo);
    if (a.marca) marcar(a.marca);
    if (a.susto) { Efectos.susto(a.susto); Sonido.susto(); if (a.dano) herirJugador(a.dano, { nombre: a.causa || "un monstruo" }); }
    if (a.apagon) { R.apagon = a.apagon; R.mundo.apagon(a.apagon); Sonido.chispazo(); }
    if (a.sonido && Sonido[a.sonido]) Sonido[a.sonido]();
    if (a.aparecen) for (const d of a.aparecen) { const e = R.actores.crearEnemigo({ ...d, alerta: d.alerta ?? true }); if (d.susto !== false) { Sonido.stinger(); } e.id = d.id || e.id; }
    if (a.perseguidor) { R.perseguidores.push(R.actores.crearEnemigo({ ...a.perseguidor, alerta: true })); Sonido.stinger(); }
    if (a.jefe) {
      const e = R.actores.crearEnemigo({ ...a.jefe, alerta: true });
      R.jefe = e;
      $("#hud-jefe").hidden = false;
      $("#hud-jefe-nombre").textContent = e.nombre.toUpperCase();
      Sonido.tension(true);
    }
    if (a.bloquear) for (const id of a.bloquear) { const p = R.mundo.puertas.find((x) => x.id === id); if (p) { p.abierta = false; p.bloqueada = true; } }
    if (a.desbloquear) for (const id of a.desbloquear) { const p = R.mundo.puertas.find((x) => x.id === id); if (p) { p.bloqueada = false; p.llave = null; p.abierta = true; if (!E.puertas.includes(p.id)) E.puertas.push(p.id); } }
    if (a.abrir) for (const id of [].concat(a.abrir)) { const p = R.mundo.puertas.find((x) => x.id === id); if (p) { p.abierta = true; p.bloqueada = false; if (!E.puertas.includes(p.id)) E.puertas.push(p.id); } }
    if (a.companero && !R.companero) { R.companero = R.actores.crearCompanero(a.companero, R.jug.j.x, R.jug.j.z + 1.2); pintarCompanero(); }
    if (a.clave && !E.claves.includes(a.clave)) { E.claves.push(a.clave); aviso(`Has obtenido: ${nombreLlave(a.clave)}`); Sonido.exito(); }
    if (a.quitarPerseguidores) { for (const p of R.perseguidores) { R.actores.quitar(p); if (!E.muertos.includes(p.id)) E.muertos.push(p.id); } R.perseguidores = []; }
    if (a.dar) for (const [k, n] of Object.entries(a.dar)) { E.inventario[k] = (E.inventario[k] || 0) + n; aviso(`Has obtenido: ${OBJETOS[k].nombre}${n > 1 ? " ×" + n : ""}`); }
    if (a.esperar) await esperar(a.esperar * 1000);
  }
}

/* ---------------- Cinemáticas (estilo RE, reutiliza cinematica.js) ---------------- */
async function cinematica(paso) {
  const antes = modo;
  modo = "cine";
  if (document.pointerLockElement) document.exitPointerLock();
  $("#hud").hidden = true;
  const ok = await Cinematica.reproducir({ tipo: "chat", ...paso }, {
    contenedor: $("#cine-capa"), protagonista: R.def.protagonista, fondo: paso.imagen || R.def.fondo,
    personaje: (id) => PERSONAJES[id], nombre: nombreDe, retrato, cuerpo,
    cumple: (x) => (!x.si || E.marcas[x.si]) && (!x.siNo || !E.marcas[x.siNo]),
    marcar: (m) => marcar(m),
    aplicarEfecto: (ef) => {
      const f = typeof ef === "string" ? { [ef]: true } : ef;
      if (f.sangre) Efectos.salpicar(0.6);
      if (f.temblor) Efectos.temblor();
      if (f.marca) marcar(f.marca);
      if (f.dano) return herirJugador(f.dano, { nombre: f.muerte || "la pesadilla" }) !== false;
      return true;
    },
    vigente: () => !!R && E.salud > 0
  });
  $("#cine-capa").innerHTML = "";
  if (!R) return;
  $("#hud").hidden = false;
  modo = antes === "cine" ? "jugando" : antes;
  if (modo !== "jugando") modo = "jugando";
  return ok;
}

/* ---------------- Daño, agarres y muerte ---------------- */
function herirJugador(dano, e) {
  if (!R || E.salud <= 0) return true;
  const j = R.jug.j;
  E.salud = Math.max(0, E.salud - dano);
  j.salud = E.salud;
  Sonido.golpe();
  Efectos.salpicar(Math.min(1.4, 0.4 + dano / 40));
  post.uniforms.uDano.value = 1;
  j.sacudida = Math.max(j.sacudida, opciones.reducir ? 0.1 : 0.35);
  actualizarSalud();
  if (E.salud <= 0) { morir(e && e.def && e.def.muerte ? e.def.muerte : `${e && e.nombre ? e.nombre : "Algo"} acabó contigo.`); return false; }
  return true;
}
function iniciarAgarre(e) {
  R.agarre = { e, t: 2.3, pulsos: 0, meta: 8 + Math.floor(Math.random() * 3) };
  $("#hud-agarre").hidden = false;
  $("#hud-agarre-barra").style.width = "0%";
  Sonido.stinger();
  R.jug.j.bloqueado = true;
  R.jug.j.sacudida = 0.5;
}
function forcejear() {
  const a = R && R.agarre;
  if (!a) return;
  a.pulsos++;
  Sonido.golpeSeco();
  $("#hud-agarre-barra").style.width = `${Math.min(100, a.pulsos / a.meta * 100)}%`;
  R.jug.j.sacudida = Math.max(R.jug.j.sacudida, 0.12);
  if (a.pulsos >= a.meta) terminarAgarre(true);
}
function terminarAgarre(libre) {
  const a = R.agarre;
  R.agarre = null;
  $("#hud-agarre").hidden = true;
  R.jug.j.bloqueado = false;
  const e = a.e;
  if (libre) {
    const dx = e.x - R.jug.j.x, dz = e.z - R.jug.j.z, d = Math.hypot(dx, dz) || 1;
    e.x += dx / d * 1.2; e.z += dz / d * 1.2;
    e.estado = "aturdido"; e.aturdido = e.def.invencible ? 3 : 1.6;
    aviso("Te lo quitas de encima. ¡Dispárale a la cabeza!");
  } else {
    R.efectos.sangre(new THREE.Vector3(R.jug.j.x, 1.5, R.jug.j.z), null, 50);
    herirJugador(Math.round(e.def.dano * 1.6), { ...e, def: { ...e.def, muerte: `${e.nombre} te mordió el cuello y no te soltó hasta llegar al hueso.` } });
  }
}
function morir(causa) {
  E.muertes++;
  modo = "muerto";
  if (document.pointerLockElement) document.exitPointerLock();
  Sonido.muerte();
  Sonido.tension(false);
  Efectos.salpicar(1.6, true);
  $("#muerte-causa").textContent = causa;
  setTimeout(() => { $("#hud").hidden = true; pantalla("pantalla-muerte"); }, 1400);
}

function enemigoMuerto(e, cabeza) {
  E.stats.bajas++;
  E.muertos.push(e.id);
  comprobarEventos("matar", e.id);
  if (cabeza) aviso("¡Disparo a la cabeza!");
  if (e === R.jefe) {
    $("#hud-jefe").hidden = true;
    Sonido.tension(false);
    Sonido.exito();
    R.jefe = null;
    marcar("jefe_" + R.def.id);
  }
  // Algunos enemigos sueltan objetos
  if (!e.def.jefe && Math.random() < 0.28) {
    const k = Math.random() < 0.65 ? "municion" : "hierba_verde";
    const id = `${R.def.id}_suelta_${E.stats.bajas}`;
    const o = { id, tipo: "objeto", objeto: k, cantidad: k === "municion" ? 6 + Math.floor(Math.random() * 6) : 1, x: e.x + 0.3, z: e.z + 0.3 };
    crearItem(o);
  }
}

/* ---------------- Sustos del director: siluetas y ojos ---------------- */
function crearSilueta(lado) {
  const j = R.jug.j;
  const dir = new THREE.Vector3(); R.jug.camara.getWorldDirection(dir);
  const base = new THREE.Vector3(j.x + dir.x * 9, 0, j.z + dir.z * 9);
  if (R.mundo.colisiona(base.x, base.z, 0.2)) return;
  const tex = textura(cuerpo(["zombi", "licker", "hunter", "moldeado"][Math.floor(Math.random() * 4)]));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.8), new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, color: "#000", transparent: true, opacity: 0.85, fog: true }));
  m.position.set(base.x, 0.9, base.z);
  R.mundo.escena.add(m);
  R.siluetas.push({ m, t: 0, lado, perp: new THREE.Vector3(-dir.z, 0, dir.x) });
}
function crearOjos() {
  const j = R.jug.j;
  for (let i = 0; i < 6; i++) {
    const ang = Math.random() * Math.PI * 2, d = 7 + Math.random() * 6;
    const x = j.x + Math.cos(ang) * d, z = j.z + Math.sin(ang) * d;
    if (R.mundo.colisiona(x, z, 0.3)) continue;
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: Math.random() < 0.5 ? "#ff2010" : "#ffc030" });
    for (const s of [-0.06, 0.06]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 4), mat); o.position.x = s; g.add(o); }
    g.position.set(x, 1.6, z);
    g.lookAt(j.x, 1.6, j.z);
    R.mundo.escena.add(g);
    R.ojos.push({ g, t: 0 });
    return;
  }
}

/* ======================================================================
 *  BUCLE PRINCIPAL
 * ==================================================================== */
let ultimo = performance.now();
let tInter = 0, interActual = null;
function bucle(ahora) {
  requestAnimationFrame(bucle);
  cuadro(ahora);
}
function cuadro(ahora) {
  const dt = Math.min(0.05, Math.max(0, (ahora - ultimo) / 1000));
  ultimo = ahora;
  reloj += dt;
  if (T && modo === "titulo") { animarTitulo(dt); post.render(T.escena, T.camara, reloj); return; }
  if (!R) return;
  const jugando = modo === "jugando";
  const j = R.jug.j;
  if (jugando) {
    E.tiempo += dt;
    E.stats.tiempoArchivo += dt;
    R.jug.actualizar(dt, reloj);
    R.actores.actualizar(dt, reloj, j);
    if (R.ruido) { R.ruido.t -= dt; if (R.ruido.t <= 0) R.ruido = null; }
    if (R.apagon > 0) R.apagon -= dt;
    // Agarre
    if (R.agarre) { R.agarre.t -= dt; if (R.agarre.t <= 0) terminarAgarre(false); }
    // Sala actual → eventos de entrada y nombre en el HUD
    const sala = R.mundo.salaEn(j.x, j.z);
    if (sala && sala !== R.salaActual) {
      R.salaActual = sala;
      $("#hud-sala").textContent = (sala.nombre || "").toUpperCase();
      if (!R.visitas.has(sala.id)) { R.visitas.add(sala.id); E.visitadas.push(sala.id); }
      comprobarEventos("entrar", sala.id);
      Sonido.salaSegura(!!sala.segura);
    }
    // Director del miedo
    const persiguen = R.actores.enemigos().some((e) => e.estado === "persigue");
    Sonido.tension(persiguen || !!R.jefe);
    R.terror.actualizar(dt, { persiguen, salud: E.salud / 100, quieto: j.moviendo ? 0 : (R.quieto = (R.quieto || 0) + dt) });
    if (j.moviendo) R.quieto = 0;
    // Interacción
    tInter -= dt;
    if (tInter <= 0) {
      tInter = 0.1;
      interActual = itemCercano();
      const p = $("#hud-accion");
      if (interActual) { p.innerHTML = `<kbd>E</kbd> ${esc(textoAccion(interActual))}`; p.classList.add("visible"); }
      else p.classList.remove("visible");
    }
    // Barra del jefe
    if (R.jefe) $("#hud-jefe-vida").style.width = `${Math.max(0, R.jefe.vida / R.jefe.vidaMax * 100)}%`;
    // Mira: se cierra con el tiempo apuntando y se pone roja sobre un enemigo
    const mira = $("#hud-mira");
    mira.style.setProperty("--abre", `${(j.apuntado > 0.5 ? 6 + (1 - j.enfoque) * 14 : 22) + (j.moviendo ? 6 : 0)}px`);
    mira.classList.toggle("blanco", !!j.apuntaA);
    mira.classList.toggle("punto", j.apuntado < 0.3);
  }
  // Siluetas y ojos
  for (let i = R.siluetas.length - 1; i >= 0; i--) {
    const s = R.siluetas[i];
    s.t += dt;
    s.m.position.addScaledVector(s.perp, s.lado * dt * 7);
    s.m.lookAt(R.jug.camara.position.x, 0.9, R.jug.camara.position.z);
    s.m.material.opacity = Math.sin(Math.min(1, s.t / 1) * Math.PI) * 0.85;
    if (s.t > 1) { R.mundo.escena.remove(s.m); R.siluetas.splice(i, 1); }
  }
  for (let i = R.ojos.length - 1; i >= 0; i--) {
    const o = R.ojos[i];
    o.t += dt;
    o.g.visible = (o.t % 1.4) < 1.3;
    if (o.t > 2.6) { R.mundo.escena.remove(o.g); R.ojos.splice(i, 1); }
  }
  for (const it of R.items) if (it.malla) it.malla.children.forEach((c) => { if (c.userData.brillo) { c.material.opacity = 0.5 + Math.sin(reloj * 3 + it.x) * 0.35; } if (c.userData.billboard) c.rotation.y = Math.atan2(R.jug.camara.position.x - it.x, R.jug.camara.position.z - it.z); });
  R.mundo.actualizar(dt, R.jug.camara, reloj);
  R.efectos.actualizar(dt);
  post.uniforms.uSalud.value = Math.min(1, Math.max(0, E.salud / 100));
  post.uniforms.uDano.value = Math.max(0, post.uniforms.uDano.value - dt * 2);
  post.render(R.mundo.escena, R.jug.camara, reloj);
}

/* ---------------- Teclado global ---------------- */
addEventListener("keydown", (e) => {
  if (!R) return;
  if (R.agarre && ["KeyE", "Space", "Enter"].includes(e.code) && !e.repeat) { e.preventDefault(); forcejear(); return; }
  if (modo === "jugando") {
    if (e.code === "KeyE" && interActual) { usar(interActual); tInter = 0; }
    if (e.code === "Tab" || e.code === "KeyI") { e.preventDefault(); abrirInventario(); }
    if (e.code === "KeyM") abrirMapa();
    if (e.code === "KeyJ") abrirArchivos();
    if (e.code === "KeyH") curarse();
  } else if (modo === "menu" && ["Tab", "KeyI", "KeyM", "KeyJ"].includes(e.code)) { e.preventDefault(); cerrarVentanas(); }
});
document.addEventListener("pointerlockchange", () => {
  if (!document.pointerLockElement && modo === "jugando" && !ventanaAbierta() && E.salud > 0) pausar();
});
lienzo.addEventListener("click", () => { if (modo === "jugando" && !document.pointerLockElement) pedirBloqueo(lienzo); });

function pausar() {
  modo = "pausa";
  $("#pausa-info").textContent = `${R.def.juego} · ${Math.floor(E.tiempo / 60)} min · ${E.stats.bajas} bajas`;
  ventana("v-pausa");
}
function reanudar() {
  if (!R) return;
  modo = "jugando";
  document.querySelectorAll(".ventana").forEach((v) => { if (v.id !== "v-aviso") v.hidden = true; });
  pedirBloqueo(lienzo);
}
document.querySelectorAll("#v-pausa [data-p]").forEach((b) => b.addEventListener("click", () => {
  const p = b.dataset.p;
  if (p === "seguir") reanudar();
  if (p === "inventario") { $("#v-pausa").hidden = true; abrirInventario(); }
  if (p === "mapa") { $("#v-pausa").hidden = true; abrirMapa(); }
  if (p === "archivos") { $("#v-pausa").hidden = true; abrirArchivos(); }
  if (p === "opciones") { $("#v-pausa").hidden = true; abrirOpciones(); }
  if (p === "titulo") { if (E) almacen.escribir(CLAVE_PARTIDA, ultimoGuardado || snapshot()); volverTitulo(); }
}));

/* ======================================================================
 *  HUD: salud, arma, compañero
 * ==================================================================== */
function estadoSalud() { return E.salud >= 67 ? "bien" : E.salud >= 34 ? "precaucion" : "peligro"; }
function actualizarSalud() {
  const est = estadoSalud();
  const t = { bien: "BIEN", precaucion: "PRECAUCIÓN", peligro: "PELIGRO" }[est];
  $("#hud-salud").textContent = t;
  $("#hud-salud").dataset.estado = est;
  Efectos.ECG.setEstado(est);
  if (est === "peligro") Sonido.latidoOn(700); else Sonido.latidoOff();
}
function pintarArma() {
  if (!R) return;
  const j = R.jug.j, a = ARMAS[j.arma];
  $("#hud-arma-nombre").textContent = a.nombre;
  $("#hud-cargador").textContent = j.armas[j.arma].cargador;
  $("#hud-reserva").textContent = "/ " + (E.inventario[a.municion] || 0);
  E.armas = JSON.parse(JSON.stringify(j.armas));
  E.arma = j.arma;
}
function pintarCompanero() {
  const c = R && R.companero;
  $("#hud-companero").hidden = !c;
  if (c) { $("#hud-companero img").src = retrato(c.idPersonaje); $("#hud-companero span").textContent = nombreDe(c.idPersonaje); }
}
function curarse() {
  const orden = ["hierba_verde", "hierba_mixta", "spray"];
  if (E.salud >= 100) { aviso("Estás bien."); return; }
  for (const k of orden) if ((E.inventario[k] || 0) > 0) { usarObjeto(k); return; }
  aviso("No tienes nada para curarte.");
}
function usarObjeto(k) {
  const o = OBJETOS[k];
  if (!o || !(E.inventario[k] > 0)) return;
  if (o.cura) {
    if (E.salud >= 100) { aviso("Ya estás en plena forma."); return; }
    E.inventario[k]--;
    E.salud = Math.min(100, E.salud + o.cura);
    if (R) R.jug.j.salud = E.salud;
    Sonido.curar();
    aviso(`Has usado: ${o.nombre}`);
    actualizarSalud();
  }
}

/* ======================================================================
 *  INVENTARIO, MAPA, ARCHIVOS, DOCUMENTOS
 * ==================================================================== */
let invSel = null;
function abrirInventario() {
  modo = "menu";
  ventana("v-inventario");
  pintarInventario();
}
function pintarInventario() {
  const est = estadoSalud();
  $("#inv-salud").textContent = { bien: "BIEN", precaucion: "PRECAUCIÓN", peligro: "PELIGRO" }[est];
  $("#inv-salud").dataset.estado = est;
  $("#inv-retrato").src = retrato(R.def.protagonista);
  const items = Object.entries(E.inventario).filter(([k, n]) => n > 0 && OBJETOS[k]);
  const casillas = [];
  for (const a of Object.keys(R.jug.j.armas)) casillas.push({ arma: a });
  for (const [k, n] of items) casillas.push({ k, n });
  while (casillas.length < 12) casillas.push(null);
  $("#inv-rejilla").innerHTML = casillas.map((c, i) => {
    if (!c) return `<div class="inv-casilla vacia"></div>`;
    if (c.arma) return `<button class="inv-casilla ${invSel === "arma:" + c.arma ? "sel" : ""}" data-i="arma:${c.arma}">${ICONOS[c.arma === "escopeta" ? "escopeta" : "balas"](OBJETOS[c.arma] ? OBJETOS[c.arma].color : "#888")}<b>${R.jug.j.armas[c.arma].cargador}</b></button>`;
    const o = OBJETOS[c.k];
    return `<button class="inv-casilla ${invSel === c.k ? "sel" : ""}" data-i="${c.k}">${(ICONOS[o.icono] || ICONOS.documento)(o.color)}<b>${c.n}</b></button>`;
  }).join("");
  $("#inv-claves").innerHTML = E.claves.length ? E.claves.map((k) => {
    const it = (R.def.llaves || {})[k] || (R.def.objetos || []).find((o) => o.llave === k);
    return `<div>${ICONOS[it && it.icono || "llave"](it && it.color || "#c8a030")}${esc(it ? it.nombre : k)}</div>`;
  }).join("") : `<p class="nota">Ninguno.</p>`;
  document.querySelectorAll("#inv-rejilla [data-i]").forEach((b) => b.addEventListener("click", () => { invSel = b.dataset.i; pintarInventario(); }));
  const det = $("#inv-detalle");
  if (invSel && invSel.startsWith("arma:")) {
    const a = invSel.slice(5), ar = ARMAS[a];
    det.innerHTML = `<h4>${ar.nombre}</h4><p>Cargador: ${R.jug.j.armas[a].cargador}/${ar.cargador} · Munición: ${E.inventario[ar.municion] || 0}</p><button class="boton" id="inv-equipar">EQUIPAR</button>`;
    $("#inv-equipar").onclick = () => { R.jug.cambiarArma(a); pintarInventario(); };
  } else if (invSel && E.inventario[invSel] > 0) {
    const o = OBJETOS[invSel];
    det.innerHTML = `<h4>${esc(o.nombre)}</h4><p>${esc(o.desc)}</p>${o.cura ? `<button class="boton" id="inv-usar">USAR</button>` : ""}${o.combina && E.inventario[o.combina] > 0 ? `<button class="boton secundario" id="inv-combinar">COMBINAR CON ${esc(OBJETOS[o.combina].nombre.toUpperCase())}</button>` : ""}`;
    const u = $("#inv-usar"); if (u) u.onclick = () => { usarObjeto(invSel); pintarInventario(); };
    const c = $("#inv-combinar"); if (c) c.onclick = () => {
      E.inventario[invSel]--; E.inventario[o.combina]--; E.inventario.hierba_mixta = (E.inventario.hierba_mixta || 0) + 1;
      Sonido.exito(); aviso("Has creado: Hierba mixta"); invSel = "hierba_mixta"; pintarInventario();
    };
  } else det.innerHTML = `<p class="nota">Selecciona un objeto.</p>`;
}

function abrirMapa() {
  modo = "menu";
  ventana("v-mapa");
  $("#mapa-titulo").textContent = `MAPA · ${R.def.juego.toUpperCase()} · ${(R.salaActual && R.salaActual.nombre || "").toUpperCase()}`;
  const c = $("#mapa-lienzo"), g = c.getContext("2d");
  const { minX, minZ, maxX, maxZ } = R.mundo.limites;
  const esc2 = Math.min((c.width - 80) / (maxX - minX), (c.height - 80) / (maxZ - minZ));
  const ox = (c.width - (maxX - minX) * esc2) / 2, oz = (c.height - (maxZ - minZ) * esc2) / 2;
  const X = (x) => ox + (x - minX) * esc2, Z = (z) => oz + (z - minZ) * esc2;
  g.fillStyle = "#04060a"; g.fillRect(0, 0, c.width, c.height);
  const tieneMapa = E.marcas["mapa_" + R.def.id];
  for (const s of R.mundo.salas) {
    const visitada = R.visitas.has(s.id);
    if (!visitada && !tieneMapa) continue;
    const pendiente = R.items.some((it) => !it.oculto && ["objeto", "llave", "documento", "arma", "mapa"].includes(it.tipo) && s === R.mundo.salaEn(it.x, it.z));
    const actual = s === R.salaActual;
    g.fillStyle = actual ? "#1f4f9e" : !visitada ? "#111821" : pendiente ? "#5a1616" : "#22324a";
    g.fillRect(X(s.x), Z(s.z), s.w * esc2, s.d * esc2);
    g.strokeStyle = "#8aa0c0"; g.lineWidth = 2;
    g.strokeRect(X(s.x), Z(s.z), s.w * esc2, s.d * esc2);
    if (s.w * esc2 > 60) {
      g.fillStyle = "#d8e0ec"; g.font = "13px Oswald, sans-serif"; g.textAlign = "center";
      g.fillText((s.nombre || "").toUpperCase(), X(s.x + s.w / 2), Z(s.z + s.d / 2) + 4, s.w * esc2 - 6);
    }
    if ((R.def.objetos || []).some((o) => o.tipo === "maquina" && s === R.mundo.salaEn(o.x, o.z))) { g.fillStyle = "#e0b040"; g.fillRect(X(s.x) + 5, Z(s.z) + 5, 9, 9); }
  }
  for (const p of R.mundo.puertas) {
    if (p.tipo === "arco") continue;
    // Sin mapa solo se ven las puertas de las salas que ya has pisado.
    const lados = p.eje === "x" ? [R.mundo.salaEn(p.x, p.z - 0.3), R.mundo.salaEn(p.x, p.z + 0.3)] : [R.mundo.salaEn(p.x - 0.3, p.z), R.mundo.salaEn(p.x + 0.3, p.z)];
    if (!tieneMapa && !lados.some((s) => s && R.visitas.has(s.id))) continue;
    g.fillStyle = p.abierta ? "#3ac0ff" : p.llave || p.bloqueada ? "#e03030" : "#9ab0c8";
    const w = p.ancho * esc2;
    if (p.eje === "x") g.fillRect(X(p.x) - w / 2, Z(p.z) - 3, w, 6); else g.fillRect(X(p.x) - 3, Z(p.z) - w / 2, 6, w);
  }
  // Jugador (flecha)
  const j = R.jug.j;
  g.save(); g.translate(X(j.x), Z(j.z)); g.rotate(-j.yaw + Math.PI);
  g.fillStyle = "#fff"; g.beginPath(); g.moveTo(0, -10); g.lineTo(7, 8); g.lineTo(-7, 8); g.closePath(); g.fill(); g.restore();
  if (!tieneMapa) { g.fillStyle = "#6e6a63"; g.font = "13px Share Tech Mono, monospace"; g.textAlign = "left"; g.fillText("Busca el mapa de la zona para ver las salas que no has visitado.", 20, c.height - 16); }
}

function abrirArchivos() {
  modo = "menu";
  ventana("v-archivos");
  $("#lista-archivos").innerHTML = E.docs.length ? E.docs.map((id) => `<li><button data-d="${esc(id)}">📄 ${esc(documento(id)?.titulo || id)}</button></li>`).join("") : `<li class="nota">Todavía no has encontrado ningún archivo.</li>`;
  document.querySelectorAll("#lista-archivos [data-d]").forEach((b) => b.addEventListener("click", () => abrirDocumento(b.dataset.d)));
}
function abrirDocumento(id) {
  const d = documento(id);
  if (!d) return;
  modo = "menu";
  $("#doc-papel").className = `papel estilo-${d.estilo || "papel"}`;
  $("#doc-titulo").textContent = d.titulo;
  $("#doc-texto").textContent = d.texto;
  Sonido.tecla();
  document.querySelectorAll(".ventana").forEach((v) => { if (v.id !== "v-documento") v.hidden = true; });
  ventana("v-documento");
}

/* ======================================================================
 *  PUZZLES (validados en el servidor)
 * ==================================================================== */
function definicionPuzzle(it) {
  if (it.def) return { id: it.puzzle, ...it.def };
  for (const c of HISTORIA.capitulos) for (const r of c.rutas) for (const p of r.pasos) if (p.tipo === "puzzle" && p.id === it.puzzle) return p;
  return null;
}
function abrirPuzzle(it) {
  const p = definicionPuzzle(it);
  if (!p) { aviso("El mecanismo no responde."); return; }
  modo = "menu";
  ventana("v-puzzle");
  $("#puzzle-titulo").textContent = p.titulo;
  $("#puzzle-enunciado").textContent = p.enunciado;
  $("#puzzle-mensaje").textContent = "";
  $("#puzzle-mensaje").className = "puzzle-mensaje";
  $("#puzzle-pista-texto").classList.add("oculto");
  $("#puzzle-pista").onclick = () => { $("#puzzle-pista-texto").textContent = "💡 " + (p.pista || "Revisa tus archivos."); $("#puzzle-pista-texto").classList.remove("oculto"); };
  $("#puzzle-archivos").onclick = () => { $("#v-puzzle").hidden = true; abrirArchivos(); };
  const ui = $("#puzzle-ui");
  let ocupado = false;
  async function comprobar(resp) {
    if (ocupado) return;
    ocupado = true;
    $("#puzzle-mensaje").textContent = "Comprobando…";
    try {
      const r = await Api.verificar(p.id, resp);
      $("#puzzle-mensaje").textContent = r.mensaje;
      $("#puzzle-mensaje").className = "puzzle-mensaje " + (r.correcto ? "bien" : "mal");
      if (r.correcto) {
        Sonido.exito();
        quitarItem(it);
        setTimeout(() => { cerrarVentanas(); ejecutarAcciones(it.acciones || [], it); marcar("puzzle_" + p.id); }, 1600);
      } else {
        Sonido.error();
        if (p.danoFallo) herirJugador(Math.round(p.danoFallo * 0.6), { nombre: "La trampa" });
        reiniciar();
      }
    } catch (err) {
      $("#puzzle-mensaje").textContent = err.message;
      reiniciar();
    }
    ocupado = false;
  }
  let reiniciar = () => {};
  if (p.ui === "orden") {
    const sel = [];
    const pintar = () => {
      ui.innerHTML = `<div class="orden-huecos">${Array.from({ length: p.huecos }, (_, i) => { const o = p.opciones.find((x) => x.id === sel[i]); return `<button class="hueco" data-h="${i}">${o ? `${o.icono ? `<span class="ficha-icono">${o.icono}</span>` : ""}${esc(o.t)}` : i + 1}</button>`; }).join("")}</div>
        <div class="orden-fichas">${p.opciones.map((o) => `<button class="ficha" data-f="${esc(o.id)}" ${sel.includes(o.id) ? "disabled" : ""} ${o.color ? `style="border-color:${o.color}"` : ""}>${o.icono ? `<span class="ficha-icono">${o.icono}</span>` : ""}${esc(o.t)}</button>`).join("")}</div>`;
      ui.querySelectorAll("[data-f]").forEach((b) => b.onclick = () => { if (sel.length < p.huecos) { sel.push(b.dataset.f); Sonido.golpeSeco(); pintar(); if (sel.length === p.huecos) comprobar(sel.join(",")); } });
      ui.querySelectorAll("[data-h]").forEach((b) => b.onclick = () => { const i = +b.dataset.h; if (i < sel.length) { sel.splice(i, 1); pintar(); } });
    };
    reiniciar = () => setTimeout(() => { sel.length = 0; pintar(); }, 900);
    pintar();
  } else if (p.ui === "codigo") {
    let cod = "";
    ui.innerHTML = `<div class="teclado"><div class="teclado-pantalla"></div><div class="teclado-teclas">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-t="${n}">${n}</button>`).join("")}<button data-t="b">⌫</button><button data-t="0">0</button><button data-t="ok" class="ok">✓</button></div></div>`;
    const pant = ui.querySelector(".teclado-pantalla");
    const pintar = () => { pant.textContent = cod.padEnd(p.digitos, "_").split("").join(" "); };
    ui.querySelectorAll("[data-t]").forEach((b) => b.onclick = () => {
      const t = b.dataset.t;
      if (t === "b") cod = cod.slice(0, -1); else if (t === "ok") { if (cod.length === p.digitos) comprobar(cod); } else if (cod.length < p.digitos) cod += t;
      Sonido.tecla(); pintar();
    });
    reiniciar = () => setTimeout(() => { cod = ""; pintar(); }, 900);
    pintar();
  } else {
    ui.innerHTML = `<form class="texto-form"><input placeholder="${esc(p.placeholder || "Respuesta")}" autocomplete="off"><button class="boton">PROBAR</button></form>`;
    const f = ui.querySelector("form");
    f.onsubmit = (e) => { e.preventDefault(); const v = f.querySelector("input").value.trim(); if (v) comprobar(v); };
    setTimeout(() => f.querySelector("input").focus(), 50);
    reiniciar = () => f.querySelector("input").select();
  }
}

/* ======================================================================
 *  MÁQUINA DE ESCRIBIR (guardar)
 * ==================================================================== */
function abrirMaquina() {
  modo = "menu";
  ventana("v-maquina");
  Sonido.salaSegura(true);
  $("#maq-cintas").textContent = E.inventario.cinta || 0;
  $("#maq-resultado").textContent = "";
  $("#maq-guardar").disabled = false;
}
$("#maq-no").addEventListener("click", () => cerrarVentanas());
$("#maq-guardar").addEventListener("click", async () => {
  if ((E.inventario.cinta || 0) < 1) { $("#maq-resultado").textContent = "No tienes cintas de tinta."; Sonido.error(); return; }
  $("#maq-guardar").disabled = true;
  E.inventario.cinta--;
  const j = R.jug.j;
  E.pos = { x: j.x, z: j.z, yaw: j.yaw };
  E.salud = j.salud;
  pintarArma();
  const datos = snapshot();
  ultimoGuardado = datos;
  almacen.escribir(CLAVE_PARTIDA, datos);
  for (let i = 0; i < 6; i++) { Sonido.tecla(); await esperar(70); }
  try {
    const r = await Api.guardar(E.id, datos, E.nombre);
    E.id = r.id;
    ultimoGuardado = snapshot();
    almacen.escribir(CLAVE_PARTIDA, ultimoGuardado);
    $("#maq-resultado").innerHTML = `Partida guardada. Código: <b>${esc(r.id)}</b> (para seguir en otro dispositivo).`;
  } catch (err) {
    $("#maq-resultado").textContent = `Guardada en este navegador (${err.message}).`;
  }
  $("#maq-cintas").textContent = E.inventario.cinta || 0;
});

/* ======================================================================
 *  FLUJO DE LA PARTIDA
 * ==================================================================== */
async function empezarArchivo(estado) {
  const def = NIVELES[estado.nivel];
  // Vídeo de introducción configurado por el administrador
  const video = (CONFIG.videos || {})[def.id];
  if (video && estado.videoVisto !== def.id && !estado.pos) { estado.videoVisto = def.id; await reproducirVideo(video, `${def.juego} · ${def.titulo}`); }
  // Tarjeta del archivo
  pantalla("pantalla-tarjeta");
  modo = "tarjeta";
  Sonido.campana();
  $("#tarjeta-num").textContent = `ARCHIVO ${ROMANOS[estado.nivel]} DE IX`;
  $("#tarjeta-juego").textContent = def.juego;
  $("#tarjeta-titulo").textContent = def.titulo;
  $("#tarjeta-lugar").textContent = `${def.lugar} · ${def.anio}`;
  $("#tarjeta-prota").innerHTML = [def.protagonista, def.companero].filter(Boolean).map((id, i) => `<figure><img src="${esc(retrato(id))}" alt=""><figcaption>${esc(nombreDe(id))}<small>${i === 0 ? "Juegas como" : "Compañero"}</small></figcaption></figure>`).join("");
  const precarga = cargarTrasTarjeta(estado);
  await new Promise((r) => { $("#tarjeta-entrar").onclick = r; });
  await precarga;
  pantalla("");
  $("#hud").hidden = false;
  modo = "jugando";
  if (!estado.pos && def.intro && !E.eventos.includes("_intro")) {
    E.eventos.push("_intro");
    await cinematica(def.intro);
  }
  pedirBloqueo(lienzo);
  comprobarEventos("entrar", R.mundo.salaEn(R.jug.j.x, R.jug.j.z)?.id);
}
async function cargarTrasTarjeta(estado) {
  await esperar(400);
  const tarjeta = $("#pantalla-tarjeta").classList.contains("activa");
  await cargarNivel(estado);
  // cargarNivel muestra la pantalla de carga: volvemos a la tarjeta hasta que el jugador entre.
  if (tarjeta) pantalla("pantalla-tarjeta");
  modo = "tarjeta";
  // Primer fotograma para compilar sombreadores sin tirones
  R.jug.actualizar(0.016, 0);
  post.render(R.mundo.escena, R.jug.camara, 0);
}

function reproducirVideo(valor, titulo) {
  return new Promise((resolver) => {
    const s = String(valor || "").trim();
    const yt = s.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/);
    const archivo = /\.(mp4|webm)(\?|$)/i.test(s);
    if (!yt && !archivo) { resolver(); return; }
    const capa = document.createElement("div");
    capa.className = "video-intro";
    capa.innerHTML = `<div class="video-intro-marco">${yt ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0" title="${esc(titulo)}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>` : `<video src="${esc(s)}" autoplay playsinline></video>`}</div><p class="video-intro-titulo">${esc(titulo)}</p><button class="boton video-intro-saltar">CONTINUAR ▸</button>`;
    document.body.appendChild(capa);
    const fin = () => { capa.remove(); resolver(); };
    capa.querySelector("button").onclick = fin;
    const v = capa.querySelector("video");
    if (v) v.onended = fin;
  });
}

async function terminarArchivo(salida) {
  modo = "cine";
  if (document.pointerLockElement) document.exitPointerLock();
  if (salida.acciones) await ejecutarAcciones(salida.acciones, salida);
  if (R.def.final) await cinematica(R.def.final);
  const def = R.def;
  const seg = E.stats.tiempoArchivo;
  const precision = R.jug.j.tiros ? Math.round(R.jug.j.aciertos / Math.max(1, R.jug.j.tiros) * 100) : 0;
  const par = def.tiempoPar || 900;
  const rango = E.muertes === 0 && seg < par && precision >= 50 ? "S" : seg < par * 1.5 && E.muertes <= 2 ? "A" : E.muertes <= 5 ? "B" : "C";
  $("#resultado-juego").textContent = def.juego;
  $("#resultado-rango").textContent = rango;
  const mm = (s) => `${Math.floor(s / 60)} min ${String(Math.floor(s % 60)).padStart(2, "0")} s`;
  $("#resultado-stats").innerHTML = [
    ["Tiempo del archivo", mm(seg)], ["Tiempo total", mm(E.tiempo)], ["Enemigos abatidos", E.stats.bajas],
    ["Disparos a la cabeza", E.stats.cabezas], ["Precisión", precision + " %"], ["Muertes", E.muertes], ["Archivos leídos", E.docs.length]
  ].map(([a, b]) => `<li><span>${a}</span><b>${b}</b></li>`).join("");
  $("#hud").hidden = true;
  pantalla("pantalla-resultado");
  Sonido.exito();
  const siguiente = E.modo === "campana" ? siguienteActivo(E.nivel) : -1;
  $("#resultado-ranking").hidden = true;
  if (E.modo === "campana" && siguiente === -1) {
    // Campaña terminada: al ranking
    try {
      const r = await Api.enviarRanking(E.nombre, Math.round(E.tiempo), E.muertes, def.protagonista);
      $("#resultado-ranking").innerHTML = r.ranking.map((x) => `<li>${esc(x.nombre)} · ${mm(x.segundos)} · ☠ ${x.muertes}</li>`).join("");
      $("#resultado-ranking").hidden = false;
    } catch { /* sin servidor */ }
  }
  $("#resultado-seguir").textContent = siguiente >= 0 ? "SIGUIENTE ARCHIVO ▸" : "VOLVER AL TÍTULO";
  $("#resultado-seguir").onclick = () => {
    if (siguiente >= 0) {
      E.nivel = siguiente; E.pos = null; E.claves = []; E.puertas = []; E.recogidos = []; E.muertos = []; E.visitadas = []; E.eventos = []; E.objetivo = null;
      E.salud = Math.min(100, E.salud + 40); E.stats.tiempoArchivo = 0;
      E.inventario.municion = (E.inventario.municion || 0) + 20;
      E.inventario.cinta = (E.inventario.cinta || 0) + 1;
      ultimoGuardado = snapshot();
      almacen.escribir(CLAVE_PARTIDA, ultimoGuardado);
      empezarArchivo(E);
    } else {
      almacen.borrar(CLAVE_PARTIDA);
      volverTitulo();
    }
  };
}

function volverTitulo() {
  destruirNivel();
  E = null;
  ultimoGuardado = null;
  modo = "titulo";
  $("#hud").hidden = true;
  document.querySelectorAll(".ventana").forEach((v) => { if (v.id !== "v-aviso") v.hidden = true; });
  Sonido.latidoOff();
  Sonido.ambienteOn("titulo");
  crearTitulo();
  pantalla("pantalla-titulo");
  $("[data-m=continuar]").hidden = !almacen.leer(CLAVE_PARTIDA);
}

$("#muerte-reintentar").addEventListener("click", () => {
  const est = JSON.parse(ultimoGuardado || snapshot());
  est.muertes = (E ? E.muertes : 0);
  if (est.salud <= 0) est.salud = 100;
  cargarNivel(est).then(() => { pantalla(""); $("#hud").hidden = false; modo = "jugando"; pedirBloqueo(lienzo); });
});
$("#muerte-titulo").addEventListener("click", volverTitulo);

/* ======================================================================
 *  TÍTULO 3D: la mansión de noche, con lluvia y el logo de Umbrella
 * ==================================================================== */
function crearTitulo() {
  if (T) return;
  const def = {
    id: "titulo", ambiente: { niebla: "#05060a", densidad: 0.09, ambiente: 0.05 },
    salas: [{ id: "h", x: 0, z: 0, w: 14, d: 16, alto: 6, suelo: "baldosa", pared: "papel_rojo", techo: "madera_oscura",
      props: [["alfombra", 7, 9, 0, { ancho: 3, fondo: 10 }], ["columna", 3, 4, 0, { alto: 6 }], ["columna", 11, 4, 0, { alto: 6 }], ["columna", 3, 12, 0, { alto: 6 }], ["columna", 11, 12, 0, { alto: 6 }],
        ["estatua", 7, 2.5, 0, {}], ["candelabro", 4.5, 2, 0, {}], ["candelabro", 9.5, 2, 0, {}], ["lampara_techo", 7, 8, 0, { techo: 6, intensidad: 14 }], ["cuadro", 7, 0.1, 0, { imagen: "img/escenarios/re2_vestibulo.webp", ancho: 2.4, alto: 1.6, y: 3.2 }],
        ["ventana", 0.06, 8, Math.PI / 2, { ancho: 1.6, alto: 2.6 }], ["ventana", 13.94, 8, -Math.PI / 2, { ancho: 1.6, alto: 2.6 }], ["cadaver", 9, 11, 0.4, { figura: "zombi" }], ["sangre", 5, 13, 0, { tam: 2.2 }]] }],
    puertas: []
  };
  const m = crearMundo(def, { imagen: textura, cuerpo });
  const camara = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.05, 80);
  const linterna = new THREE.SpotLight("#fff0d8", 40, 25, 0.5, 0.6, 1.5);
  linterna.castShadow = true;
  linterna.shadow.mapSize.set(1024, 1024);
  camara.add(linterna);
  const obj = new THREE.Object3D(); obj.position.set(0, -0.2, -5); camara.add(obj); linterna.target = obj;
  m.escena.add(camara);
  T = { mundo: m, escena: m.escena, camara, t: 0 };
}
function animarTitulo(dt) {
  T.t += dt;
  const a = T.t * 0.05;
  T.camara.position.set(7 + Math.sin(a) * 3.2, 1.7 + Math.sin(T.t * 0.3) * 0.15, 11 + Math.cos(a) * 2.5);
  T.camara.lookAt(7 + Math.sin(T.t * 0.2) * 1.5, 2.2, 3);
  T.mundo.actualizar(dt, T.camara, T.t);
}
function destruirTitulo() { T = null; }

/* ======================================================================
 *  MENÚ PRINCIPAL Y VENTANAS DEL TÍTULO
 * ==================================================================== */
let nivelSuelto = null;
$("#menu-titulo").addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-m]");
  if (!b) return;
  Sonido.iniciar();
  const m = b.dataset.m;
  if (m === "nueva") { nivelSuelto = null; $("#i-nombre").value = ""; ventana("v-nombre"); setTimeout(() => $("#i-nombre").focus(), 50); }
  if (m === "continuar") {
    try { const est = JSON.parse(almacen.leer(CLAVE_PARTIDA)); ultimoGuardado = JSON.stringify(est); empezarArchivo(est); } catch { aviso("La partida guardada está dañada."); }
  }
  if (m === "archivo") abrirSelector();
  if (m === "codigo") { $("#codigo-mensaje").textContent = ""; ventana("v-codigo"); }
  if (m === "ranking") abrirRanking();
  if (m === "opciones") abrirOpciones();
});
$("#f-nombre").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = $("#i-nombre").value.trim().slice(0, 20) || "Superviviente";
  $("#v-nombre").hidden = true;
  const nivel = nivelSuelto ?? Math.max(0, siguienteActivo(-1));
  ultimoGuardado = null;
  empezarArchivo(nuevoEstado(nombre, nivel, nivelSuelto === null ? "campana" : "suelto"));
});
$("#f-codigo").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#codigo-mensaje").textContent = "Buscando en los archivos de Umbrella…";
  try {
    const r = await Api.cargar($("#i-codigo").value.trim().toUpperCase());
    const est = JSON.parse(r.estado);
    if (est.version !== 3) throw new Error("Ese código es de una partida del juego clásico. Ábrela en «Juego clásico 2.5D».");
    est.id = r.id;
    $("#v-codigo").hidden = true;
    ultimoGuardado = JSON.stringify(est);
    empezarArchivo(est);
  } catch (err) { $("#codigo-mensaje").textContent = err.message; }
});
function abrirSelector() {
  ventana("v-selector");
  $("#selector").innerHTML = NIVELES.map((n, i) => `<li><button data-n="${i}" ${archivoActivo(i) ? "" : "disabled title='Cerrado temporalmente'"}><span class="num">${ROMANOS[i]}</span><span><b>${esc(n.juego)}</b><small>${esc(n.titulo)} · ${esc(n.anio)}</small></span><img src="${esc(retrato(n.protagonista))}" alt=""></button></li>`).join("");
  document.querySelectorAll("#selector [data-n]").forEach((b) => b.addEventListener("click", () => { nivelSuelto = +b.dataset.n; $("#v-selector").hidden = true; ventana("v-nombre"); }));
}
async function abrirRanking() {
  ventana("v-ranking");
  $("#ranking-lista").innerHTML = "<li>Consultando…</li>";
  try {
    const r = await Api.ranking();
    $("#ranking-lista").innerHTML = r.ranking.length ? r.ranking.map((x) => `<li><b>${esc(x.nombre)}</b> · ${Math.floor(x.segundos / 60)} min · ☠ ${x.muertes}</li>`).join("") : "<li>Nadie ha sobrevivido todavía.</li>";
  } catch (err) { $("#ranking-lista").innerHTML = `<li>${esc(err.message)}</li>`; }
}
function abrirOpciones() {
  if (R && modo === "jugando") modo = "menu";
  ventana("v-opciones");
  $("#o-calidad").value = opciones.calidad;
  $("#o-brillo").value = opciones.brillo;
  $("#o-fov").value = opciones.fov;
  $("#o-sens").value = opciones.sens;
  $("#o-invertir").checked = opciones.invertir;
  $("#o-sonido").checked = opciones.sonido;
  $("#o-reducir").checked = opciones.reducir;
}
for (const [id, k, conv] of [["o-calidad", "calidad", String], ["o-brillo", "brillo", Number], ["o-fov", "fov", Number], ["o-sens", "sens", Number]]) {
  document.getElementById(id).addEventListener("input", (e) => { opciones[k] = conv(e.target.value); guardarOpciones(); aplicarCalidad(); });
}
for (const [id, k] of [["o-invertir", "invertir"], ["o-sonido", "sonido"], ["o-reducir", "reducir"]]) {
  document.getElementById(id).addEventListener("change", (e) => { opciones[k] = e.target.checked; guardarOpciones(); Sonido.setActivo(opciones.sonido); Efectos.setReducir(opciones.reducir); aplicarCalidad(); });
}

/* ---------------- Controles táctiles ---------------- */
if (matchMedia("(pointer: coarse)").matches) {
  $("#hud-tactil").hidden = false;
  $("#hud-tactil").addEventListener("pointerdown", (e) => {
    const b = e.target.closest("[data-t]");
    if (!b || !R) return;
    e.preventDefault();
    const t = b.dataset.t;
    if (R.agarre) { forcejear(); return; }
    if (t === "apuntar") { R.jug.j.apuntando = !R.jug.j.apuntando; b.classList.toggle("activo", R.jug.j.apuntando); }
    if (t === "disparar") R.jug.disparar();
    if (t === "usar" && interActual) usar(interActual);
    if (t === "recargar") R.jug.recargar();
    if (t === "menu") pausar();
  });
}

/* ======================================================================
 *  ARRANQUE
 * ==================================================================== */
async function iniciar() {
  Efectos.iniciar();
  Sonido.setActivo(opciones.sonido);
  Efectos.setReducir(opciones.reducir);
  redimensionar();
  crearTitulo();
  requestAnimationFrame(bucle);
  if (!almacen.leer(CLAVE_AVISO)) ventana("v-aviso");
  $("#aviso-ok").addEventListener("click", () => { almacen.escribir(CLAVE_AVISO, "1"); Sonido.iniciar(); $("#v-aviso").hidden = true; Sonido.ambienteOn("titulo"); });
  document.addEventListener("pointerdown", () => { Sonido.iniciar(); if (modo === "titulo") Sonido.ambienteOn("titulo"); }, { once: true });
  $("[data-m=continuar]").hidden = !almacen.leer(CLAVE_PARTIDA);
  Api.visita();
  try {
    const r = await Api.config();
    CONFIG = { archivos: {}, videos: {}, ...(r.config || {}) };
    if (!r.abierto) {
      $("#mensaje-dia").textContent = "⛔ " + (r.mensaje || "El juego está cerrado temporalmente.");
      $("#mensaje-dia").hidden = false;
      document.querySelectorAll("#menu-titulo button").forEach((b) => { if (b.dataset.m !== "opciones") b.disabled = true; });
    } else if (CONFIG.mensajeDia) { $("#mensaje-dia").textContent = CONFIG.mensajeDia; $("#mensaje-dia").hidden = false; }
  } catch { $("#aviso-servidor").hidden = false; }
}
iniciar();
window.__juego3d = { get R() { return R; }, get E() { return E; }, get modo() { return modo; },
  /** Depuración: avanza n fotogramas aunque la pestaña esté oculta. */
  renderer, post, THREE,
  nuevo(nivel) { ultimoGuardado = null; return empezarArchivo(nuevoEstado("Prueba", nivel, "suelto")); },
  paso(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) cuadro(ultimo + dt * 1000); }, cargarNivel, empezarArchivo, NIVELES };
