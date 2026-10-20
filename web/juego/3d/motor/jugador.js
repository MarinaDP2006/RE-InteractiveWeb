/* ============================================================================
 *  3d/motor/jugador.js — Jugador en primera persona, linterna y armas
 * ============================================================================
 *  Controles: ratón para mirar (puntero bloqueado) · WASD moverse · Shift
 *  correr · clic derecho apuntar (láser) · clic izquierdo disparar · R recargar
 *  · V cuchillo · F linterna · E interactuar · 1/2 cambiar de arma.
 *  En móvil: joystick a la izquierda, arrastrar a la derecha para mirar y
 *  botones de acción.
 * ========================================================================== */
import * as THREE from "../lib/three.module.min.js";

export const ARMAS = {
  pistola: { nombre: "PISTOLA", cargador: 15, dano: 22, cadencia: 0.28, recarga: 1.5, dispersion: 0.035, municion: "municion", perdigones: 1, alcance: 60, ruido: 1.4 },
  escopeta: { nombre: "ESCOPETA", cargador: 6, dano: 16, cadencia: 0.9, recarga: 2.4, dispersion: 0.09, municion: "cartuchos", perdigones: 7, alcance: 22, ruido: 2.2 }
};

function modeloPistola() {
  const metal = new THREE.MeshStandardMaterial({ color: "#1c1d20", metalness: 0.85, roughness: 0.35 });
  const goma = new THREE.MeshStandardMaterial({ color: "#121212", roughness: 0.9 });
  const g = new THREE.Group();
  const corredera = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.2), metal);
  corredera.position.set(0, 0.02, -0.06);
  const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.03, 0.16), metal);
  cuerpo.position.set(0, -0.012, -0.04);
  const empunadura = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.11, 0.045), goma);
  empunadura.position.set(0, -0.07, 0.02);
  empunadura.rotation.x = 0.25;
  const guarda = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 6, 12, Math.PI), metal);
  guarda.position.set(0, -0.03, -0.035);
  guarda.rotation.set(0, Math.PI / 2, Math.PI);
  // Mano y manga (silueta sencilla para que el arma no flote)
  const piel = new THREE.MeshStandardMaterial({ color: "#a07a62", roughness: 0.8 });
  const manga = new THREE.MeshStandardMaterial({ color: "#1e2430", roughness: 1 });
  const mano = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.08), piel);
  mano.position.set(0.005, -0.065, 0.035);
  const brazo = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.35, 10), manga);
  brazo.rotation.x = Math.PI / 2 - 0.25;
  brazo.position.set(0.02, -0.11, 0.21);
  g.add(corredera, cuerpo, empunadura, guarda, mano, brazo);
  g.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  g.userData.boca = new THREE.Vector3(0, 0.02, -0.17);
  g.userData.corredera = corredera;
  return g;
}
function modeloEscopeta() {
  const metal = new THREE.MeshStandardMaterial({ color: "#1a1a1c", metalness: 0.85, roughness: 0.4 });
  const madera = new THREE.MeshStandardMaterial({ color: "#4a2e1a", roughness: 0.7 });
  const g = new THREE.Group();
  const canon = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.6, 10), metal);
  canon.rotation.x = Math.PI / 2;
  canon.position.set(0, 0.02, -0.28);
  const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.45, 10), metal);
  tubo.rotation.x = Math.PI / 2;
  tubo.position.set(0, -0.005, -0.22);
  const bomba = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.035, 0.14), madera);
  bomba.position.set(0, -0.005, -0.22);
  const cajon = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.16), metal);
  cajon.position.set(0, 0.0, 0.0);
  const culata = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.06, 0.26), madera);
  culata.position.set(0, -0.03, 0.2);
  culata.rotation.x = 0.15;
  g.add(canon, tubo, bomba, cajon, culata);
  g.userData.boca = new THREE.Vector3(0, 0.02, -0.58);
  g.userData.corredera = bomba;
  return g;
}
function modeloCuchillo() {
  const g = new THREE.Group();
  const hoja = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.03, 0.18), new THREE.MeshStandardMaterial({ color: "#c8ccd0", metalness: 1, roughness: 0.2 }));
  hoja.position.z = -0.12;
  const mango = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.1), new THREE.MeshStandardMaterial({ color: "#151515" }));
  g.add(hoja, mango);
  return g;
}

/** requestPointerLock devuelve una promesa que puede fallar (pestaña sin foco, iframe...). */
export function pedirBloqueo(el) {
  try { const p = el.requestPointerLock?.(); if (p && p.catch) p.catch(() => {}); } catch { /* sin bloqueo */ }
}

export function crearJugador(ctx) {
  const camara = new THREE.PerspectiveCamera(72, 1, 0.05, 160);
  camara.rotation.order = "YXZ";
  const j = {
    x: 0, z: 0, yaw: 0, pitch: 0, vx: 0, vz: 0, salud: 100,
    arma: "pistola", armas: { pistola: { cargador: 15 } }, recargando: 0, cdDisparo: 0, cdCuchillo: 0,
    apuntado: 0, apuntando: false, corriendo: false, moviendo: false, sacudida: 0, empuje: { x: 0, z: 0 },
    linterna: true, bloqueado: false, retroceso: 0, fasePaso: 0, enfoque: 0, tiros: 0, aciertos: 0
  };

  /* ---------------- Linterna ---------------- */
  const linterna = new THREE.SpotLight("#fff1dc", 70, 30, 0.42, 0.55, 1.6);
  linterna.castShadow = true;
  linterna.shadow.mapSize.set(1024, 1024);
  linterna.shadow.bias = -0.0008;
  linterna.shadow.normalBias = 0.02;
  linterna.shadow.camera.near = 0.2;
  // En el eje de la cámara: el arma queda fuera del cono y no se "quema".
  linterna.position.set(0.02, 0.04, 0);
  const objetivoLuz = new THREE.Object3D();
  objetivoLuz.position.set(0.05, -0.3, -6);
  camara.add(linterna, objetivoLuz);
  linterna.target = objetivoLuz;
  // Luz de relleno muy tenue alrededor del jugador (rebote de la linterna)
  const relleno = new THREE.PointLight("#c8b8a0", 0.9, 5, 2);
  relleno.position.set(0, 0.4, -2.2);
  camara.add(relleno);

  /* ---------------- Armas en primera persona ---------------- */
  const modelos = { pistola: modeloPistola(), escopeta: modeloEscopeta(), cuchillo: modeloCuchillo() };
  const soporte = new THREE.Group();
  camara.add(soporte);
  for (const k in modelos) { modelos[k].visible = false; soporte.add(modelos[k]); }
  const posCadera = new THREE.Vector3(0.17, -0.17, -0.32), posApuntar = new THREE.Vector3(0, -0.105, -0.27);
  // Láser
  const laserMat = new THREE.LineBasicMaterial({ color: "#ff2020", transparent: true, opacity: 0.55 });
  const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]);
  const laser = new THREE.Line(laserGeo, laserMat);
  laser.frustumCulled = false;
  ctx.escena.add(laser);
  const punto = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: "#ff3030" }));
  ctx.escena.add(punto);
  const destelloBoca = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12), new THREE.MeshBasicMaterial({ color: "#ffd890", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  soporte.add(destelloBoca);
  ctx.escena.add(camara);

  /* ---------------- Entrada ---------------- */
  const teclas = new Set();
  let ratonDx = 0, ratonDy = 0;
  const tactil = { mx: 0, mz: 0, activo: false };
  const lienzo = ctx.lienzo;
  const bloqueado = () => document.pointerLockElement === lienzo;
  const enJuego = () => ctx.activo() && !j.bloqueado;

  addEventListener("keydown", (e) => {
    if (!enJuego()) return;
    teclas.add(e.code);
    if (e.repeat) return;
    if (e.code === "KeyR") recargar();
    if (e.code === "KeyF") { j.linterna = !j.linterna; Sonido.golpeSeco(); }
    if (e.code === "KeyV") cuchillada();
    if (e.code === "Digit1") cambiarArma("pistola");
    if (e.code === "Digit2") cambiarArma("escopeta");
  });
  addEventListener("keyup", (e) => teclas.delete(e.code));
  addEventListener("blur", () => { teclas.clear(); j.apuntando = false; });
  lienzo.addEventListener("mousedown", (e) => {
    if (!enJuego()) return;
    if (!bloqueado()) { pedirBloqueo(lienzo); return; }
    if (e.button === 2) j.apuntando = true;
    if (e.button === 0) disparar();
  });
  addEventListener("mouseup", (e) => { if (e.button === 2) j.apuntando = false; });
  lienzo.addEventListener("contextmenu", (e) => e.preventDefault());
  addEventListener("mousemove", (e) => { if (bloqueado() && enJuego()) { ratonDx += e.movementX; ratonDy += e.movementY; } });

  // Táctil: joystick (mitad izquierda) y mirar (mitad derecha)
  let idJoy = null, idMirar = null, joy0 = null, mirar0 = null;
  lienzo.addEventListener("touchstart", (e) => {
    for (const t of e.changedTouches) {
      if (t.clientX < innerWidth * 0.45 && idJoy === null) { idJoy = t.identifier; joy0 = [t.clientX, t.clientY]; tactil.activo = true; }
      else if (idMirar === null) { idMirar = t.identifier; mirar0 = [t.clientX, t.clientY]; }
    }
    e.preventDefault();
  }, { passive: false });
  lienzo.addEventListener("touchmove", (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === idJoy) {
        const dx = (t.clientX - joy0[0]) / 60, dy = (t.clientY - joy0[1]) / 60;
        const m = Math.hypot(dx, dy) || 1;
        tactil.mx = dx / Math.max(1, m); tactil.mz = dy / Math.max(1, m);
      } else if (t.identifier === idMirar) {
        ratonDx += (t.clientX - mirar0[0]) * 2.2; ratonDy += (t.clientY - mirar0[1]) * 2.2;
        mirar0 = [t.clientX, t.clientY];
      }
    }
    e.preventDefault();
  }, { passive: false });
  lienzo.addEventListener("touchend", (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === idJoy) { idJoy = null; tactil.activo = false; tactil.mx = tactil.mz = 0; }
      if (t.identifier === idMirar) idMirar = null;
    }
  });

  /* ---------------- Acciones ---------------- */
  function cambiarArma(a) {
    if (!j.armas[a] || j.arma === a || j.recargando > 0) return;
    j.arma = a;
    j.cambio = 0.35;
    Sonido.golpeSeco();
    ctx.alCambiarArma();
  }
  function recargar() {
    const a = ARMAS[j.arma], st = j.armas[j.arma];
    if (!a || j.recargando > 0 || st.cargador >= a.cargador) return;
    if (ctx.municion(a.municion) <= 0) { ctx.aviso("No te queda munición para la " + a.nombre.toLowerCase() + "."); Sonido.error(); return; }
    j.recargando = a.recarga;
    Sonido.golpeSeco();
    setTimeout(() => Sonido.golpeSeco(), a.recarga * 600);
  }
  function terminarRecarga() {
    const a = ARMAS[j.arma], st = j.armas[j.arma];
    const tomar = Math.min(a.cargador - st.cargador, ctx.municion(a.municion));
    ctx.gastar(a.municion, tomar);
    st.cargador += tomar;
    ctx.alCambiarArma();
  }

  const _o = new THREE.Vector3(), _d = new THREE.Vector3();
  function disparar() {
    if (j.cdDisparo > 0 || j.recargando > 0 || j.cambio > 0) return;
    const a = ARMAS[j.arma], st = j.armas[j.arma];
    if (st.cargador <= 0) { Sonido.error(); recargar(); return; }
    st.cargador--;
    j.cdDisparo = a.cadencia;
    j.retroceso = 1;
    j.tiros++;
    Sonido.disparo(j.arma === "escopeta" ? 1.4 : 1);
    camara.getWorldPosition(_o);
    // Dispersión: menor cuanto más tiempo llevas apuntando (la mira se cierra).
    const disp = a.dispersion * (j.apuntado > 0.5 ? 0.25 + 0.75 * (1 - j.enfoque) : 1.6) * (j.moviendo ? 1.5 : 1);
    let acierto = false;
    for (let p = 0; p < a.perdigones; p++) {
      camara.getWorldDirection(_d);
      _d.x += (Math.random() - 0.5) * disp; _d.y += (Math.random() - 0.5) * disp; _d.z += (Math.random() - 0.5) * disp;
      _d.normalize();
      const pared = ctx.mundo.rayo(_o, _d, a.alcance);
      const hit = ctx.actores.impacto(_o, _d, a.alcance);
      if (hit && (!pared || hit.distancia < pared.distance)) {
        const caida = a.perdigones > 1 ? Math.max(0.3, 1 - hit.distancia / a.alcance) : 1;
        ctx.actores.herir(hit.actor, a.dano * caida, hit.cabeza, hit.punto, _d.clone());
        if (hit.cabeza) ctx.alTiroCabeza(hit.actor);
        acierto = true;
        // Salpicadura en la pared de detrás
        const tras = ctx.mundo.rayo(hit.punto, _d, 3);
        if (tras && Math.random() < 0.5) ctx.efectos.salpicaduraPared(tras.point, tras.face.normal.clone().transformDirection(tras.object.matrixWorld));
      } else if (pared) {
        ctx.efectos.impactoPared(pared.point, pared.face.normal.clone().transformDirection(pared.object.matrixWorld));
      }
    }
    if (acierto) j.aciertos++;
    ctx.efectos.fogonazo(modelos[j.arma].localToWorld(modelos[j.arma].userData.boca.clone()));
    destelloBoca.material.opacity = 1;
    ctx.ruido(j.x, j.z, a.ruido);
    j.sacudida = Math.max(j.sacudida, j.arma === "escopeta" ? 0.18 : 0.06);
    ctx.alCambiarArma();
    if (st.cargador === 0) setTimeout(recargar, 250);
  }
  function cuchillada() {
    if (j.cdCuchillo > 0 || j.recargando > 0) return;
    j.cdCuchillo = 0.6;
    j.tajo = 0.3;
    Sonido.golpeSeco();
    camara.getWorldPosition(_o);
    camara.getWorldDirection(_d);
    for (const off of [0, -0.25, 0.25]) {
      const dd = _d.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), off);
      const hit = ctx.actores.impacto(_o, dd, 1.9);
      if (hit) { ctx.actores.herir(hit.actor, 30, hit.cabeza, hit.punto, dd); Sonido.golpe(); break; }
    }
  }

  /* ---------------- Actualización ---------------- */
  function actualizar(dt, t) {
    const sens = ctx.sensibilidad() * (j.apuntado > 0.5 ? 0.6 : 1);
    j.yaw -= ratonDx * 0.0022 * sens;
    j.pitch -= ratonDy * 0.0022 * sens * (ctx.invertirY() ? -1 : 1);
    j.pitch = Math.max(-1.35, Math.min(1.35, j.pitch));
    const swayX = ratonDx, swayY = ratonDy;
    ratonDx = ratonDy = 0;

    // Movimiento
    let mx = 0, mz = 0;
    if (!j.bloqueado && ctx.activo()) {
      if (teclas.has("KeyW") || teclas.has("ArrowUp")) mz -= 1;
      if (teclas.has("KeyS") || teclas.has("ArrowDown")) mz += 1;
      if (teclas.has("KeyA") || teclas.has("ArrowLeft")) mx -= 1;
      if (teclas.has("KeyD") || teclas.has("ArrowRight")) mx += 1;
      if (tactil.activo) { mx = tactil.mx; mz = tactil.mz; }
    }
    const m = Math.hypot(mx, mz);
    j.corriendo = (teclas.has("ShiftLeft") || teclas.has("ShiftRight") || (tactil.activo && m > 0.9)) && !j.apuntando && mz < 0;
    const velMax = j.apuntando ? 1.2 : j.corriendo ? 4.6 : 2.4;
    const herido = j.salud < 34 ? 0.75 : 1;   // cojea si está muy herido
    let ax = 0, az = 0;
    if (m > 0.05) {
      const fx = mx / Math.max(1, m), fz = mz / Math.max(1, m);
      // Ejes locales según hacia dónde mira la cámara
      ax = (fx * Math.cos(j.yaw) + fz * Math.sin(j.yaw)) * velMax * herido;
      az = (-fx * Math.sin(j.yaw) + fz * Math.cos(j.yaw)) * velMax * herido;
    }
    const k = Math.min(1, dt * 10);
    j.vx += (ax - j.vx) * k;
    j.vz += (az - j.vz) * k;
    j.vx += j.empuje.x; j.vz += j.empuje.z;
    j.empuje.x *= 0.8; j.empuje.z *= 0.8;
    const r = 0.3;
    const nx = j.x + j.vx * dt, nz = j.z + j.vz * dt;
    if (!ctx.mundo.colisiona(nx, j.z, r)) j.x = nx; else j.vx = 0;
    if (!ctx.mundo.colisiona(j.x, nz, r)) j.z = nz; else j.vz = 0;
    const vel = Math.hypot(j.vx, j.vz);
    j.moviendo = vel > 0.3;
    if (j.corriendo && j.moviendo) ctx.ruido(j.x, j.z, 0.5);

    // Pasos y balanceo de cabeza
    const antes = Math.floor(j.fasePaso / Math.PI);
    j.fasePaso += dt * vel * 2.7;
    if (Math.floor(j.fasePaso / Math.PI) !== antes && j.moviendo) Sonido.paso();
    const bob = Math.sin(j.fasePaso) * 0.035 * Math.min(1, vel / 2.4) * (j.apuntado > 0.5 ? 0.3 : 1);
    const bobX = Math.cos(j.fasePaso * 0.5) * 0.02 * Math.min(1, vel / 2.4);

    // Cámara
    j.sacudida = Math.min(1, Math.max(0, j.sacudida - dt * 1.5));
    const s = j.sacudida * j.sacudida;
    camara.position.set(j.x + bobX, 1.62 + bob - (herido < 1 ? 0.05 : 0), j.z);
    camara.rotation.set(j.pitch + (Math.random() - 0.5) * s * 0.3 + j.retroceso * 0.012, j.yaw + (Math.random() - 0.5) * s * 0.3, (Math.random() - 0.5) * s * 0.2 + bobX * 0.4);
    j.apuntado += ((j.apuntando ? 1 : 0) - j.apuntado) * Math.min(1, dt * 9);
    j.enfoque = j.apuntado > 0.5 ? Math.min(1, j.enfoque + dt * 1.6) : 0;
    const fov = ctx.fov() - j.apuntado * 18;
    if (Math.abs(camara.fov - fov) > 0.05) { camara.fov = fov; camara.updateProjectionMatrix(); }

    // Linterna: sigue a la mirada con un ligero retraso (inercia de la mano)
    linterna.intensity = j.linterna ? (ctx.apagon() ? (Math.random() < 0.1 ? 40 : 2) : 70) : 0;
    objetivoLuz.position.x += ((-swayX * 0.004 + 0.05) - objetivoLuz.position.x) * Math.min(1, dt * 6);
    objetivoLuz.position.y += ((swayY * 0.004 - 0.3) - objetivoLuz.position.y) * Math.min(1, dt * 6);

    // Arma
    j.cdDisparo -= dt; j.cdCuchillo -= dt;
    if (j.cambio > 0) j.cambio -= dt;
    if (j.recargando > 0) { j.recargando -= dt; if (j.recargando <= 0) terminarRecarga(); }
    j.retroceso = Math.max(0, j.retroceso - dt * 9);
    for (const kk in modelos) modelos[kk].visible = false;
    const mod = j.tajo > 0 ? modelos.cuchillo : modelos[j.arma];
    mod.visible = true;
    const p = posCadera.clone().lerp(posApuntar, j.apuntado);
    p.x += -swayX * 0.00012 + bobX * 0.5; p.y += bob * 0.4 + swayY * 0.0001 - (j.recargando > 0 ? 0.12 : 0) - (j.cambio > 0 ? j.cambio * 0.4 : 0);
    p.z += j.retroceso * 0.05;
    soporte.position.lerp(p, Math.min(1, dt * 18));
    soporte.rotation.set(j.retroceso * 0.25 + (j.recargando > 0 ? 0.5 : 0), j.corriendo ? 0.45 : 0, j.corriendo ? 0.25 : 0);
    if (j.tajo > 0) { j.tajo -= dt; soporte.rotation.set(-0.4, 0.9 - j.tajo * 5, 0.5); }
    const corr = modelos[j.arma].userData.corredera;
    if (corr) corr.position.z = (j.arma === "pistola" ? -0.06 : -0.22) + j.retroceso * 0.03;
    destelloBoca.position.copy(modelos[j.arma].userData.boca);
    destelloBoca.material.opacity = Math.max(0, destelloBoca.material.opacity - dt * 30);
    destelloBoca.rotation.z = Math.random() * 6;

    // Láser (solo apuntando)
    const verLaser = j.apuntado > 0.6 && j.tajo <= 0 && !j.bloqueado;
    laser.visible = punto.visible = verLaser;
    if (verLaser) {
      camara.updateMatrixWorld();
      const boca = modelos[j.arma].localToWorld(modelos[j.arma].userData.boca.clone());
      camara.getWorldDirection(_d);
      camara.getWorldPosition(_o);
      const pared = ctx.mundo.rayo(_o, _d, 40);
      const hit = ctx.actores.impacto(_o, _d, 40);
      let dist = pared ? pared.distance : 40;
      if (hit && hit.distancia < dist) dist = hit.distancia;
      const fin = _o.clone().addScaledVector(_d, dist - 0.02);
      laserGeo.attributes.position.setXYZ(0, boca.x, boca.y, boca.z);
      laserGeo.attributes.position.setXYZ(1, fin.x, fin.y, fin.z);
      laserGeo.attributes.position.needsUpdate = true;
      punto.position.copy(fin);
      j.apuntaA = hit ? hit.actor : null;
    } else j.apuntaA = null;
  }

  return { j, camara, actualizar, disparar, recargar, cambiarArma, linterna };
}
