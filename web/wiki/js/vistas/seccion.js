/* ============================================================================
 *  wiki/js/vistas/seccion.js — Listado de una sección (ruta #/s/<seccion>)
 * ============================================================================
 *  Rejilla de tarjetas con un filtro por texto y botones de filtro propios
 *  de cada sección (canon, protagonistas, peligro extremo…).
 * ========================================================================== */
"use strict";

(() => {
  const { $, $$, esc, W, seccion, normal, pintar, tarjeta } = Wiki;

  /** Filtros rápidos de cada sección: [valor, texto del botón]. */
  function filtrosDe(id) {
    if (id === "juegos" || id === "peliculas") return [["todos", "Todos"], ["canon", "Canon"], ["nocanon", "No canon"]];
    if (id === "personajes") return [["todos", "Todos"], ["Protagonista", "Protagonistas"], ["Antagonista", "Antagonistas"], ["Aliad", "Aliados"]];
    if (id === "criaturas") return [["todos", "Todas"], ["5", "Peligro extremo"], ["t-virus", "Virus-T"], ["las-plagas", "Las Plagas"], ["moho", "Moho"]];
    return [];
  }

  /** ¿La ficha pasa el filtro rápido elegido? */
  function pasaFiltro(id, f, filtro) {
    if (filtro === "todos") return true;
    if (Wiki.sellada(f)) return false;
    if (filtro === "canon") return f.canon !== false;
    if (filtro === "nocanon") return f.canon === false;
    if (id === "personajes") return String(f.rol || "").includes(filtro);
    if (id === "criaturas") return filtro === "5" ? f.peligrosidad >= 5 : filtro === "moho" ? ["moho-e", "cadou", "megamiceto"].includes(f.origen) : f.origen === filtro;
    return true;
  }

  function vistaSeccion(id) {
    const s = seccion(id);
    if (!s) return Wiki.vistaError("Sección no encontrada");
    if (id === "cronologia") return Wiki.vistaCronologia();
    const fichas = W.datos[id] || [];
    const filtros = filtrosDe(id);
    // Estas secciones usan tarjetas apaisadas (16:9).
    const ancha = ["juegos", "peliculas", "ubicaciones", "organizaciones", "virus"].includes(id);

    pintar(`
      <header class="cab-seccion">
        <div class="contenedor">
          <p class="migas"><a href="#/">Archivos</a> / ${esc(s.titulo)}</p>
          <h1 class="titulo-seccion">${esc(s.titulo)}</h1>
          <p>${esc(s.descripcion || "")}</p>
        </div>
      </header>
      <div class="contenedor lista-seccion">
        <div class="filtros">
          <input id="filtro-texto" type="search" placeholder="Filtrar ${esc(s.titulo.toLowerCase())}…" aria-label="Filtrar">
          ${filtros.map(([v, t], i) => `<button class="chip" type="button" data-filtro="${esc(v)}" aria-pressed="${i === 0}">${esc(t)}</button>`).join("")}
        </div>
        <div class="rejilla ${ancha ? "ancha" : ""}" id="rejilla"></div>
      </div>`, s.titulo);

    let filtro = "todos";
    // Vuelve a pintar la rejilla con el texto y el filtro actuales.
    const pintarRejilla = () => {
      const q = normal($("#filtro-texto").value);
      const lista = fichas.filter((f) => {
        // Con texto escrito, las selladas no aparecen (no tienen texto que comparar).
        if (q && !normal(`${f.titulo || ""} ${f.alias || ""} ${f.resumen || ""} ${(f.etiquetas || []).join(" ")}`).includes(q)) return false;
        return pasaFiltro(id, f, filtro);
      });
      $("#rejilla").innerHTML = lista.length ? lista.map((f, i) => tarjeta(f, i)).join("") : '<p class="vacio">NINGÚN EXPEDIENTE COINCIDE</p>';
      Umbra.observarRevelar($("#rejilla"));
    };
    $("#filtro-texto").addEventListener("input", pintarRejilla);
    $$("[data-filtro]").forEach((b) => b.addEventListener("click", () => {
      filtro = b.dataset.filtro;
      $$("[data-filtro]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      pintarRejilla();
    }));
    pintarRejilla();
  }

  Wiki.vistaSeccion = vistaSeccion;
})();
