/* ============================================================================
 *  wiki/js/vistas/buscar.js — Búsqueda (ruta #/buscar/<texto>) y página de error
 * ============================================================================
 *  La búsqueda se hace en el navegador con todas las fichas ya cargadas:
 *  puntúa más si la palabra está en el título que en el resumen o el texto.
 *  También la usa el buscador de la cabecera para sus sugerencias.
 * ========================================================================== */
"use strict";

(() => {
  const { esc, W, NOMBRES_TIPO, enlace, normal, pintar, sellada } = Wiki;

  /** Devuelve las fichas que contienen todas las palabras, de más a menos relevantes. */
  function buscarLocal(q, max = 40) {
    const palabras = normal(q).trim().split(/\s+/).filter((w) => w.length > 1);
    if (!palabras.length) return [];
    const res = [];
    for (const f of W.indice.values()) {
      if (sellada(f)) continue;
      const titulo = normal(f.titulo), resto = normal(`${f.alias || ""} ${f.resumen || ""} ${(f.etiquetas || []).join(" ")}`), cuerpo = normal(JSON.stringify(f.cuerpo || ""));
      let p = 0, todas = true;
      for (const w of palabras) {
        // Título: 12 si empieza por la palabra, 8 si la contiene; resumen 4; texto 1.
        let pw = 0;
        if (titulo.includes(w)) pw += titulo.startsWith(w) ? 12 : 8;
        if (resto.includes(w)) pw += 4;
        if (cuerpo.includes(w)) pw += 1;
        if (!pw) todas = false;
        p += pw;
      }
      if (todas && p) res.push({ f, p });
    }
    return res.sort((a, b) => b.p - a.p).slice(0, max).map((r) => r.f);
  }

  function vistaBuscar(q) {
    const res = buscarLocal(q, 80);
    pintar(`
      <header class="cab-seccion"><div class="contenedor">
        <p class="migas"><a href="#/">Archivos</a> / Búsqueda</p>
        <h1 class="titulo-seccion">«${esc(q)}»</h1>
        <p>Resultados de la búsqueda.</p>
      </div></header>
      <div class="contenedor resultados" style="padding-top:20px">
        ${res.length ? res.map((f) => `<a class="resultado" href="${enlace(f._seccion, f.id)}">
          <div class="tarjeta-img">${Wiki.imagenFicha(f)}</div>
          <div><small>${esc(NOMBRES_TIPO[f._seccion] || f._seccion)}</small><b>${esc(f.titulo)}</b><span style="color:var(--texto-suave)">${esc(f.resumen || Wiki.subtituloDe(f)).slice(0, 180)}</span></div></a>`).join("")
          : '<p class="vacio">SIN RESULTADOS. QUIZÁ UMBRELLA LOS BORRÓ.</p>'}
      </div>`, `Buscar: ${q}`);
  }

  /** Página de «archivo perdido» para rutas o fichas que no existen. */
  function vistaError(msg) {
    pintar(`<div class="error-vista"><h1>ARCHIVO PERDIDO</h1><p>${esc(msg)}</p><a class="btn" href="#/">Volver a los archivos</a></div>`, "Archivo perdido");
  }

  Object.assign(Wiki, { buscarLocal, vistaBuscar, vistaError });
})();
