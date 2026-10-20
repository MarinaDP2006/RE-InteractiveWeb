/* ============================================================================
 *  3d/motor/efectos3d.js — Sangre, impactos, fogonazos y post-procesado
 * ============================================================================
 *  · Partículas de sangre con gravedad que manchan el suelo al caer.
 *  · Charcos que crecen bajo los cadáveres, salpicaduras y agujeros de bala.
 *  · Chispas y polvo al disparar a las paredes. Fogonazo con luz real.
 *  · Post-procesado propio: grano de película, viñeta, aberración cromática,
 *    desaturación y bordes rojos con poca salud, destello de daño, brillo y
 *    escala de resolución (de rendimiento a supermuestreo 4K).
 * ========================================================================== */
import * as THREE from "../lib/three.module.min.js";
import { texturaSangre } from "./texturas.js";

export function crearEfectos(escena) {
  /* ---------------- Partículas ---------------- */
  const MAX = 900;
  const pos = new Float32Array(MAX * 3), col = new Float32Array(MAX * 3);
  const vel = new Float32Array(MAX * 3), vida = new Float32Array(MAX), tipo = new Uint8Array(MAX);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const puntos = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, sizeAttenuation: true, transparent: true, depthWrite: false }));
  puntos.frustumCulled = false;
  escena.add(puntos);
  let siguiente = 0;
  for (let i = 0; i < MAX; i++) pos[i * 3 + 1] = -100;

  function emitir(p, dir, n, t, color, fuerza = 2.2) {
    for (let k = 0; k < n; k++) {
      const i = siguiente;
      siguiente = (siguiente + 1) % MAX;
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      const dx = (dir ? dir.x : 0) * 1.2 + (Math.random() - 0.5) * fuerza;
      const dy = (dir ? dir.y : 0) * 1.2 + Math.random() * fuerza * 0.9;
      const dz = (dir ? dir.z : 0) * 1.2 + (Math.random() - 0.5) * fuerza;
      vel[i * 3] = dx; vel[i * 3 + 1] = dy; vel[i * 3 + 2] = dz;
      vida[i] = 0.6 + Math.random() * 0.9;
      tipo[i] = t;
      col[i * 3] = color[0] * (0.7 + Math.random() * 0.3); col[i * 3 + 1] = color[1]; col[i * 3 + 2] = color[2];
    }
  }

  /* ---------------- Manchas (decals) ---------------- */
  const texS = texturaSangre();
  const matMancha = new THREE.MeshStandardMaterial({ map: texS, transparent: true, depthWrite: false, roughness: 0.2, polygonOffset: true, polygonOffsetFactor: -4 });
  const matAgujero = new THREE.MeshStandardMaterial({ color: "#050505", transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, roughness: 1 });
  const manchas = [];
  function mancha(p, normal, tam, mat = matMancha) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(tam, tam), mat);
    m.position.copy(p).addScaledVector(normal, 0.01);
    m.lookAt(p.clone().add(normal));
    m.rotateZ(Math.random() * 6);
    m.receiveShadow = true;
    escena.add(m);
    manchas.push(m);
    if (manchas.length > 140) { const v = manchas.shift(); escena.remove(v); v.geometry.dispose(); }
    return m;
  }
  const charcos = [];
  function charco(x, z, tam) {
    const m = mancha(new THREE.Vector3(x, 0.006 + Math.random() * 0.003, z), new THREE.Vector3(0, 1, 0), 0.1);
    charcos.push({ m, tam, t: 0 });
  }
  const ARRIBA = new THREE.Vector3(0, 1, 0);

  /* ---------------- Fogonazo ---------------- */
  const luzFogonazo = new THREE.PointLight("#ffb060", 0, 9, 2);
  escena.add(luzFogonazo);
  let tFogonazo = 0;
  function fogonazo(p) {
    luzFogonazo.position.copy(p);
    luzFogonazo.intensity = 22;
    tFogonazo = 0.06;
  }

  function actualizar(dt) {
    for (let i = 0; i < MAX; i++) {
      if (vida[i] <= 0) continue;
      vida[i] -= dt;
      vel[i * 3 + 1] -= 9.8 * dt;
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (pos[i * 3 + 1] < 0.01) {
        // La sangre que toca el suelo deja una gota.
        if (tipo[i] === 0 && Math.random() < 0.12) mancha(new THREE.Vector3(pos[i * 3], 0.007, pos[i * 3 + 2]), ARRIBA, 0.08 + Math.random() * 0.14);
        vida[i] = 0;
      }
      if (vida[i] <= 0) pos[i * 3 + 1] = -100;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    for (let k = charcos.length - 1; k >= 0; k--) {
      const c = charcos[k];
      c.t += dt * 0.35;
      const s = Math.min(1, c.t) * c.tam / 0.1;
      c.m.scale.set(s, s, 1);
      if (c.t >= 1) charcos.splice(k, 1);
    }
    if (tFogonazo > 0) { tFogonazo -= dt; if (tFogonazo <= 0) luzFogonazo.intensity = 0; }
  }

  return {
    actualizar, fogonazo, charco,
    sangre(p, dir, n = 20) { emitir(p, dir, n, 0, [0.45, 0.01, 0.01]); },
    estela(e) { emitir(new THREE.Vector3(e.x, 1, e.z), null, 14, 1, [0.08, 0.08, 0.08], 1); },
    impactoPared(p, normal) {
      emitir(p.clone().addScaledVector(normal, 0.02), normal, 10, 1, [0.5, 0.45, 0.4], 1.6);
      emitir(p.clone().addScaledVector(normal, 0.02), normal, 4, 1, [1, 0.75, 0.3], 3);
      mancha(p, normal, 0.05, matAgujero);
    },
    salpicaduraPared(p, normal) { mancha(p, normal, 0.6 + Math.random() * 0.6); }
  };
}

/* ======================================================================
 *  POST-PROCESADO
 * ==================================================================== */
const FS = `
uniform sampler2D tEscena;
uniform vec2 uRes;
uniform float uT, uSalud, uDano, uBrillo, uGrano, uAberracion, uFlash;
varying vec2 vUv;
float azar(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uT * 37.1) * 43758.5453); }
void main() {
  vec2 c = vUv - 0.5;
  float r2 = dot(c, c);
  // Aberración cromática en los bordes (más fuerte con poca salud)
  float ab = uAberracion * (0.6 + r2 * 3.0) * (1.0 + (1.0 - uSalud) * 1.5);
  vec2 off = c * ab * 0.012;
  vec3 col;
  col.r = texture2D(tEscena, vUv + off).r;
  col.g = texture2D(tEscena, vUv).g;
  col.b = texture2D(tEscena, vUv - off).b;
  // Brillo / gamma de calibración
  col = pow(max(col, 0.0), vec3(1.0 / uBrillo));
  // Desaturación y tinte rojo con la salud baja
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float herido = clamp((0.6 - uSalud) / 0.6, 0.0, 1.0);
  col = mix(col, vec3(lum), herido * 0.6);
  // Viñeta (roja si estás herido) + destello de daño
  float vin = smoothstep(0.85, 0.18, r2 * 2.2);
  vec3 bordeRojo = vec3(0.35, 0.0, 0.0) * (herido * (0.6 + 0.4 * sin(uT * 6.0)) + uDano);
  col = col * mix(0.25, 1.0, vin) + bordeRojo * (1.0 - vin) * 1.6;
  col += vec3(uFlash);
  // Grano de película
  col += (azar(vUv * uRes) - 0.5) * uGrano;
  // Líneas de exploración muy sutiles
  col *= 0.985 + 0.015 * sin(vUv.y * uRes.y * 1.4);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
const VS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export function crearPost(renderer) {
  const rt = new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType, samples: 4 });
  rt.texture.colorSpace = THREE.LinearSRGBColorSpace;
  const mat = new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS,
    uniforms: {
      tEscena: { value: rt.texture }, uRes: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 },
      uSalud: { value: 1 }, uDano: { value: 0 }, uBrillo: { value: 1 }, uGrano: { value: 0.06 }, uAberracion: { value: 1 }, uFlash: { value: 0 }
    },
    depthTest: false, depthWrite: false
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  const escenaQuad = new THREE.Scene();
  escenaQuad.add(quad);
  const camQuad = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let escala = 1;
  return {
    uniforms: mat.uniforms, rt,
    escala(e) { escala = e; },
    tam(w, h) {
      const pr = renderer.getPixelRatio();
      rt.setSize(Math.max(1, Math.round(w * pr * escala)), Math.max(1, Math.round(h * pr * escala)));
      mat.uniforms.uRes.value.set(w * pr, h * pr);
    },
    render(escena, camara, t) {
      mat.uniforms.uT.value = t;
      renderer.setRenderTarget(rt);
      renderer.render(escena, camara);
      renderer.setRenderTarget(null);
      renderer.render(escenaQuad, camQuad);
    }
  };
}
