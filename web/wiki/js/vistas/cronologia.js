/* ============================================================================
 *  wiki/js/vistas/cronologia.js — Línea temporal de la saga (ruta #/cronologia)
 * ============================================================================
 *  Eventos ordenados y agrupados por era. Cada evento enlaza con las fichas
 *  que menciona (juegos, personajes, lugares…).
 * ========================================================================== */
"use strict";

(() => {
  const { esc, W, resolver, enlace, pintar } = Wiki;

  /** Nombre del tipo de evento (cambia el color de su punto en la línea). */
  const TIPOS = { juego: "Juego", pelicula: "Película", hito: "Historia" };

  function vistaCronologia() {
    // Orden: el campo «orden» si existe; si no, el año.
    const eventos = [...(W.datos.cronologia || [])].sort((a, b) => (a.orden || a.anio * 100) - (b.orden || b.anio * 100));
    let html = "", era = "";
    for (const e of eventos) {
      // Un rótulo cada vez que empieza una era nueva.
      if (e.era !== era) { era = e.era; html += `<div class="crono-era revelar">${esc(era || "")}</div>`; }
      const rel = (e.relacionados || []).map((r) => resolver(r.id, r.seccion)).filter(Boolean);
      html += `<div class="crono-evento revelar" data-tipo="${esc(e.tipo || "hito")}">
        <span class="crono-anio">${esc(e.anio)}</span>
        <div class="crono-caja"><span class="crono-fecha">${esc(e.fecha || e.anio)} · ${esc(TIPOS[e.tipo] || "Historia")}</span>
          <h3>${esc(e.titulo)}</h3><p>${esc(e.resumen || "")}</p>
          <div class="chips" style="display:flex;flex-wrap:wrap;gap:6px">${rel.map((r) => `<a class="chip" href="${enlace(r.seccion, r.ficha.id)}">${esc(r.ficha.titulo)}</a>`).join("")}</div>
        </div></div>`;
    }
    pintar(`
      <header class="cab-seccion"><div class="contenedor">
        <p class="migas"><a href="#/">Archivos</a> / Cronología</p>
        <h1 class="titulo-seccion">Cronología de la saga</h1>
        <p>Más de un siglo de historia: del hongo de Miranda en 1919 a las ruinas de Raccoon City. <span class="chip chip-rojo">Juego</span> <span class="chip chip-ambar">Película</span> <span class="chip">Historia</span></p>
      </div></header>
      <div class="contenedor crono">${html}</div>`, "Cronología");
  }

  Wiki.vistaCronologia = vistaCronologia;
})();
