/* ============================================================================
 *  terror.js — El «director del miedo»
 * ============================================================================
 *  Mientras recorres una sala, decide CUÁNDO y QUÉ ocurre a tu alrededor para
 *  que nunca te sientas a salvo, igual que en los Resident Evil:
 *
 *   · Pasos pesados que se acercan por un lado y se pierden.
 *   · Alguien corre en la oscuridad y una silueta cruza al fondo.
 *   · Portazos, metal arrastrado, golpes en el techo, cristales rotos.
 *   · Un susurro junto a tu oído. Una respiración a tu espalda.
 *   · La luz falla y la sala se queda a oscuras unos segundos.
 *   · Dos ojos te observan desde la negrura... y desaparecen.
 *   · Falsas alarmas: la música sube... y no pasa nada. (La siguiente, sí.)
 *
 *  La tensión sube con el tiempo que pasas en la sala y baja cuando algo te
 *  persigue (entonces el miedo ya lo pone el monstruo). Los eventos usan la
 *  posición del jugador para sonar a la izquierda o a la derecha.
 *
 *  Terror.crear({ tema, reducir, sala }) → { actualizar(dt, estado), destruir() }
 *  sala: callbacks visuales del motor (apagon, silueta, ojos, sacudir, polvo).
 * ========================================================================== */
"use strict";

const Terror = (() => {
  const azar = (a, b) => a + Math.random() * (b - a);
  const lado = () => (Math.random() < 0.5 ? -1 : 1) * azar(0.45, 1);

  /** Catálogo de eventos: peso base, si pide calma (sin enemigos) y qué hace. */
  const EVENTOS = {
    pasos:      { peso: 3, calma: true,  fn: (s) => { const p = lado(); Sonido.pasosPesados(p, 5 + Math.floor(azar(0, 4)), Math.random() < 0.6); } },
    carrera:    { peso: 2, calma: true,  fn: (s) => { const p = lado(); Sonido.carrera(p); setTimeout(() => s.silueta(p > 0 ? 1 : -1), 350); } },
    portazo:    { peso: 2, calma: false, fn: (s) => { Sonido.portazo(lado()); s.sacudir(0.15); } },
    susurro:    { peso: 2, calma: true,  fn: () => Sonido.susurro(lado() * 0.8) },
    arrastre:   { peso: 2, calma: true,  fn: () => Sonido.arrastre(lado()) },
    techo:      { peso: 2, calma: false, fn: (s) => { Sonido.golpeSordo(azar(-0.3, 0.3)); setTimeout(() => Sonido.golpeSordo(azar(-0.3, 0.3)), 700); s.polvo(); } },
    grito:      { peso: 1, calma: true,  fn: () => Sonido.gritoLejano(lado()) },
    apagon:     { peso: 2, calma: false, fn: (s) => { Sonido.chispazo(); s.apagon(azar(1.2, 3.2)); } },
    cristal:    { peso: 1, calma: false, fn: () => Sonido.cristal(lado()) },
    respiracion:{ peso: 1, calma: true,  fn: (s) => { Sonido.respiracion(azar(-0.25, 0.25)); s.sacudir(0.05); } },
    ojos:       { peso: 2, calma: true,  fn: (s) => { s.ojos(); Sonido.susurro(lado() * 0.3); } },
    falsa:      { peso: 1, calma: true,  fn: () => Sonido.crescendo(azar(2, 3.5)) },
    llanto:     { peso: 0, calma: true,  fn: () => Sonido.llanto(lado()) }
  };

  /** Ajustes por juego: algunos sustos encajan mejor en ciertas historias. */
  const POR_TEMA = {
    "tema-re2": { pasos: 5, carrera: 2 },            // Mr. X recorre la comisaría
    "tema-re3": { pasos: 3, grito: 3, cristal: 2 },  // la ciudad cae a tu alrededor
    "tema-re4": { susurro: 3, grito: 2 },
    "tema-re5": { grito: 2, carrera: 3 },
    "tema-re6": { cristal: 3, portazo: 3 },
    "tema-re7": { pasos: 5, techo: 3, respiracion: 2, arrastre: 3 }, // la casa Baker
    "tema-re8": { llanto: 3, susurro: 3, grito: 2 },
    "tema-re9": { susurro: 3, apagon: 3, ojos: 3, llanto: 1 }
  };

  function crear({ tema, reducir, sala }) {
    let tension = 0.15;              // 0 calma … 1 terror
    let proximo = azar(6, 11);        // segundos hasta el próximo evento
    let ultimo = "";
    let vivo = true;
    const pesos = { ...Object.fromEntries(Object.entries(EVENTOS).map(([k, v]) => [k, v.peso])), ...(POR_TEMA[tema] || {}) };

    function elegir(persiguen) {
      const lista = Object.entries(pesos).filter(([k, p]) => p > 0 && k !== ultimo && (!persiguen || !EVENTOS[k].calma));
      const total = lista.reduce((a, [, p]) => a + p, 0);
      let r = Math.random() * total;
      for (const [k, p] of lista) { r -= p; if (r <= 0) return k; }
      return lista.length ? lista[0][0] : null;
    }

    return {
      /** estado: { persiguen, salud (0-1), quieto (s sin moverse) } */
      actualizar(dt, estado) {
        if (!vivo) return;
        // La tensión crece poco a poco; estar quieto en la oscuridad la acelera.
        tension = Math.min(1, tension + dt * (0.012 + (estado.quieto > 4 ? 0.02 : 0)));
        if (estado.persiguen) tension = Math.max(0.1, tension - dt * 0.05);
        proximo -= dt * (0.6 + tension * 0.9) * (estado.salud < 0.34 ? 1.3 : 1);
        if (proximo > 0) return;
        const ev = elegir(estado.persiguen);
        proximo = azar(9, 20) * (estado.persiguen ? 1.8 : 1) * (reducir ? 1.6 : 1);
        if (!ev) return;
        ultimo = ev;
        try { EVENTOS[ev].fn(sala); } catch (e) { console.warn("terror:", e); }
        if (ev !== "falsa") tension = Math.max(0.1, tension - 0.25);
      },
      /** Sube la tensión de golpe (al examinar algo horrible, al oír un grito...). */
      subir(cantidad = 0.2) { tension = Math.min(1, tension + cantidad); proximo = Math.min(proximo, azar(2, 5)); },
      destruir() { vivo = false; }
    };
  }

  return { crear };
})();
