/* ============================================================================
 *  cinematica.js — Escenas cinemáticas al estilo Resident Evil
 * ============================================================================
 *  Sustituye a las antiguas conversaciones tipo chat. Cada paso { tipo: "chat" }
 *  de la historia se reproduce como una escena de cine:
 *
 *   · Bandas negras (formato panorámico), el escenario de fondo con un lento
 *     movimiento de cámara, niebla y polvo en suspensión.
 *   · PRESENCIAL: los personajes aparecen de cuerpo entero en la escena; quien
 *     habla se ilumina y se acerca a cámara, el otro queda en penumbra.
 *   · TRANSMISIÓN (radio, teléfono, canal...): la cara del interlocutor llega
 *     por un monitor con estática, como las videollamadas de Hunnigan en RE4.
 *   · Subtítulos de película con el nombre de quien habla.
 *   · DECISIONES con cuenta atrás (como el «Live Selection» de RE3).
 *
 *  Uso: await Cinematica.reproducir(paso, ctx) → true si termina, false si
 *  el jugador muere o la escena se interrumpe.
 * ========================================================================== */
"use strict";

const Cinematica = (() => {
  const $ = (s, r) => r.querySelector(s);
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const RE_TRANSMISION = /radio|canal|comunicador|enlace|tel[eé]fono|llamada|mensaje|frecuencia|se[ñn]al|transmisi/i;
  const SEGUNDOS_DECISION = 14;

  /** Estática animada para el monitor de transmisión. */
  function estatica(canvas) {
    const g = canvas.getContext("2d");
    canvas.width = 160; canvas.height = 90;
    const img = g.createImageData(160, 90);
    let raf = 0, vivo = true, intensidad = 0.25;
    (function cuadro() {
      if (!vivo) return;
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255 * intensidad;
      }
      g.putImageData(img, 0, 0);
      raf = requestAnimationFrame(cuadro);
    })();
    return {
      rafaga(ms = 260) { intensidad = 1; setTimeout(() => { intensidad = 0.22; }, ms); },
      parar() { vivo = false; cancelAnimationFrame(raf); }
    };
  }

  function reproducir(paso, ctx) {
    return new Promise((resolver) => {
      const cont = ctx.contenedor;
      const prota = ctx.protagonista;
      const transmision = paso.modo ? paso.modo === "transmision" : RE_TRANSMISION.test(paso.titulo || "");
      const fondo = paso.imagen || ctx.fondo || "";

      cont.innerHTML = `
        <div class="cine ${transmision ? "cine-transmision" : "cine-presencial"}" tabindex="0">
          <div class="cine-fondo" style="${fondo ? `background-image:url('${esc(fondo)}')` : ""}"></div>
          <div class="cine-niebla" aria-hidden="true"><i></i><i></i></div>
          <div class="cine-polvo" aria-hidden="true">${"<i></i>".repeat(28)}</div>
          <div class="cine-actor cine-izq" aria-hidden="true"><img alt=""></div>
          <div class="cine-actor cine-der" aria-hidden="true"><img alt=""></div>
          <div class="cine-monitor" aria-hidden="true" hidden>
            <div class="cine-monitor-pantalla"><img alt=""><canvas></canvas></div>
            <div class="cine-monitor-pie"><span class="cine-monitor-nombre"></span><span class="cine-senal"><i></i><i></i><i></i><i></i></span></div>
          </div>
          <div class="cine-banda cine-arriba"></div>
          <div class="cine-banda cine-abajo"></div>
          <p class="cine-lugar"><span></span></p>
          <div class="cine-subtitulos" aria-live="polite"><b class="cine-nombre"></b><span class="cine-texto"></span></div>
          <div class="cine-decision" hidden>
            <p class="cine-decision-titulo">DECISIÓN</p>
            <div class="cine-opciones"></div>
            <div class="cine-cuenta"><i></i></div>
          </div>
          <button class="cine-saltar" type="button">Saltar escena <kbd>Tab</kbd></button>
          <p class="cine-ayuda">Clic o <kbd>Espacio</kbd> para continuar</p>
        </div>`;

      const raiz = $(".cine", cont);
      const actorIzq = $(".cine-izq", raiz), actorDer = $(".cine-der", raiz);
      const monitor = $(".cine-monitor", raiz);
      const subNombre = $(".cine-nombre", raiz), subTexto = $(".cine-texto", raiz);
      const decision = $(".cine-decision", raiz);
      const zonaOpc = $(".cine-opciones", raiz);
      const est = transmision ? estatica($(".cine-monitor canvas", raiz)) : null;

      let saltar = false;       // avanzar la frase actual
      let saltarTodo = false;   // avanzar hasta la próxima decisión
      let terminado = false;
      let avanzarFrase = null;

      const pulsar = () => { saltar = true; if (avanzarFrase) avanzarFrase(); };
      raiz.addEventListener("click", (e) => {
        if (e.target.closest(".cine-opciones, .cine-saltar")) return;
        pulsar();
      });
      const tecla = (e) => {
        if (!document.body.contains(raiz)) { document.removeEventListener("keydown", tecla); return; }
        if (document.querySelector(".modal:not([hidden])")) return;
        if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); if (decision.hidden) pulsar(); }
        if (e.code === "Tab") { e.preventDefault(); saltarEscena(); }
        if (!decision.hidden && /^Digit[1-4]$/.test(e.code)) {
          const b = zonaOpc.querySelectorAll("button")[Number(e.code.slice(5)) - 1];
          if (b) b.click();
        }
      };
      document.addEventListener("keydown", tecla);
      function saltarEscena() { saltarTodo = true; pulsar(); }
      $(".cine-saltar", raiz).addEventListener("click", saltarEscena);

      function salir(ok) {
        if (terminado) return;
        terminado = true;
        document.removeEventListener("keydown", tecla);
        document.body.classList.remove("en-cinematica");
        if (est) est.parar();
        if (transmision) Sonido.radioEstatica(false);
        raiz.classList.add("saliendo");
        setTimeout(() => resolver(ok), ok ? 650 : 0);
      }
      const vigente = () => !terminado && ctx.vigente();

      /* ---------------- Actores ---------------- */
      const tieneCuerpo = (id) => ctx.cuerpo(id) && ctx.cuerpo(id) !== ctx.retrato(id);
      function colocar(actor, id) {
        if (actor.dataset.id === id) return;
        actor.dataset.id = id;
        const img = $("img", actor);
        actor.classList.remove("visible");
        actor.classList.toggle("busto", !tieneCuerpo(id));
        actor.style.setProperty("--color", (ctx.personaje(id) || {}).color || "#c8102e");
        setTimeout(() => {
          img.src = tieneCuerpo(id) ? ctx.cuerpo(id) : ctx.retrato(id);
          actor.classList.add("visible");
        }, actor.dataset.ocupado ? 260 : 0);
        actor.dataset.ocupado = "1";
      }
      function enMonitor(id) {
        monitor.hidden = false;
        if (monitor.dataset.id !== id) {
          monitor.dataset.id = id;
          if (est) est.rafaga(420);
          Sonido.radioClic();
          setTimeout(() => { $("img", monitor).src = ctx.retrato(id); }, 180);
          $(".cine-monitor-nombre", monitor).textContent = ctx.nombre(id).toUpperCase();
        }
      }
      function enfocar(id) {
        const habla = (a) => a.dataset.id === id;
        actorIzq.classList.toggle("habla", habla(actorIzq));
        actorDer.classList.toggle("habla", habla(actorDer));
        monitor.classList.toggle("habla", monitor.dataset.id === id);
      }
      // El protagonista siempre está en escena, a la izquierda.
      colocar(actorIzq, prota);

      /* ---------------- Subtítulos ---------------- */
      async function decir(linea) {
        saltar = false;
        if (!vigente()) return false;
        if (linea.sistema) {
          raiz.classList.add("narrando");
          subNombre.textContent = "";
          subTexto.innerHTML = `<i>${esc(linea.sistema)}</i>`;
          enfocar(null);
          if (transmision && est) est.rafaga(600);
          if (linea.efecto && !ctx.aplicarEfecto(linea.efecto)) return false;
          await pausa(1500 + linea.sistema.length * 30);
          raiz.classList.remove("narrando");
          return vigente();
        }
        const id = linea.de;
        const p = ctx.personaje(id) || {};
        if (id !== prota) {
          if (transmision) enMonitor(id); else colocar(actorDer, id);
        }
        enfocar(id);
        subNombre.textContent = ctx.nombre(id);
        subNombre.style.color = p.color || "#e8e2d6";
        // Las palabras aparecen una a una, con un leve fundido.
        subTexto.innerHTML = linea.t.split(/(\s+)/).map((w, i) => /\s+/.test(w) ? w : `<span style="animation-delay:${Math.min(i, 60) * 22}ms">${esc(w)}</span>`).join("");
        raiz.classList.remove("cambio"); void raiz.offsetWidth; raiz.classList.add("cambio");
        if (transmision) { Sonido.radioClic(); if (id !== prota && est) est.rafaga(120); }
        if (linea.efecto && !ctx.aplicarEfecto(linea.efecto)) return false;
        await pausa(Math.min(7000, 1300 + linea.t.length * 52));
        if (transmision) Sonido.radioClic(true);
        return vigente();
      }
      /** Espera la duración de la frase o hasta que el jugador la pase. */
      function pausa(ms) {
        if (saltarTodo) return esperar(60);
        return new Promise((r) => {
          const t = setTimeout(fin, ms);
          function fin() { clearTimeout(t); avanzarFrase = null; r(); }
          avanzarFrase = fin;
          if (saltar) fin();
        });
      }

      /* ---------------- Decisiones ---------------- */
      function elegir(opciones) {
        saltarTodo = false;
        return new Promise((r) => {
          decision.hidden = false;
          raiz.classList.add("decidiendo");
          Sonido.crescendo(SEGUNDOS_DECISION * 0.8);
          zonaOpc.innerHTML = "";
          let hecho = false;
          const cuenta = $(".cine-cuenta i", decision);
          cuenta.style.transition = "none"; cuenta.style.width = "100%";
          void cuenta.offsetWidth;
          cuenta.style.transition = `width ${SEGUNDOS_DECISION}s linear`;
          cuenta.style.width = "0%";
          const fin = (o) => {
            if (hecho) return;
            hecho = true;
            clearTimeout(reloj);
            decision.hidden = true;
            raiz.classList.remove("decidiendo");
            Sonido.golpeSeco();
            r(o);
          };
          opciones.forEach((o, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "cine-opcion";
            b.innerHTML = `<kbd>${i + 1}</kbd><span>${esc(o.t)}</span>`;
            b.addEventListener("click", () => fin(o));
            zonaOpc.appendChild(b);
          });
          setTimeout(() => zonaOpc.querySelector("button")?.focus({ preventScroll: true }), 60);
          // Si no decides a tiempo, el personaje hace lo primero que se le ocurre.
          const reloj = setTimeout(() => { if (vigente()) fin(opciones[0]); }, SEGUNDOS_DECISION * 1000);
        });
      }

      /* ---------------- Guion ---------------- */
      (async () => {
        document.body.classList.add("en-cinematica");
        if (transmision) { Sonido.radioEstatica(true); Sonido.radioClic(); }
        // Rótulo del lugar (como en los juegos: texto en la esquina que se escribe solo).
        const lugar = $(".cine-lugar span", raiz);
        const titulo = (paso.titulo || "").toUpperCase();
        for (let i = 1; i <= titulo.length; i++) {
          if (!vigente()) return salir(false);
          lugar.textContent = titulo.slice(0, i);
          if (i % 2) Sonido.tecla();
          await esperar(saltarTodo ? 0 : 28);
        }
        await esperar(500);

        for (const linea of paso.guion || []) {
          if (!vigente()) return salir(false);
          if (!ctx.cumple(linea)) continue;
          if (linea.opciones) {
            const validas = linea.opciones.filter(ctx.cumple);
            if (!validas.length) continue;
            const o = await elegir(validas);
            if (!vigente()) return salir(false);
            if (!(await decir({ de: prota, t: o.t }))) return salir(false);
            if (o.marca) ctx.marcar(o.marca);
            if (o.efecto && !ctx.aplicarEfecto(o.efecto)) return salir(false);
            for (const resp of o.resp || []) {
              if (!ctx.cumple(resp)) continue;
              if (!(await decir(resp))) return salir(false);
            }
          } else if (!(await decir(linea))) {
            return salir(false);
          }
        }
        if (transmision) { Sonido.radioClic(true); if (est) est.rafaga(800); }
        await esperar(saltarTodo ? 100 : 500);
        salir(vigente());
      })();
      setTimeout(() => raiz.focus({ preventScroll: true }), 30);
    });
  }

  return { reproducir };
})();
