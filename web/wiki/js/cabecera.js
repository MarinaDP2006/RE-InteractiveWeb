/* ============================================================================
 *  wiki/js/cabecera.js — Cabecera, enrutador e interacciones globales
 * ============================================================================
 *  · Menú de secciones, buscador con sugerencias y botón de sonido ambiente.
 *  · Enrutador: lee el hash de la URL (#/s/juegos…) y pinta la vista que toca.
 *  · Interacciones que valen para toda la página: inclinación 3D de las
 *    tarjetas, tráileres, etiquetas, atajos de teclado y barra de lectura.
 * ========================================================================== */
"use strict";

(() => {
  const { $, $$, esc, W, NOMBRES_TIPO, ICONOS, enlace, rutaSeccion } = Wiki;

  /* ------------------------------- Enrutador ------------------------------- */

  /** Elige la vista según la ruta del hash. */
  function enrutar() {
    const partes = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    cerrarMenu();
    switch (partes[0]) {
      case "": case undefined: return Wiki.vistaPortada();
      case "s": return Wiki.vistaSeccion(partes[1]);
      case "f": return Wiki.vistaFicha(partes[1], partes[2]);
      case "cronologia": return Wiki.vistaCronologia();
      case "mapa": return Wiki.vistaMapa(partes[1] === "raccoon" ? "raccoon" : "mundo");
      case "buscar": return Wiki.vistaBuscar(partes.slice(1).join("/"));
      default: return Wiki.vistaError("Ruta desconocida.");
    }
  }

  /** Resalta en el menú la sección en la que se está (también dentro de sus fichas). */
  function marcarMenu() {
    const h = location.hash;
    $$(".menu a").forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("activo", href !== "#/" && (h === href || h.startsWith(href + "/") || (href.startsWith("#/s/") && h.startsWith("#/f/" + href.slice(4) + "/"))));
    });
  }

  /* -------------------------------- Cabecera ------------------------------- */

  function montarCabecera() {
    $("#marca-logo").innerHTML = Umbra.logo();
    // Menú: una entrada por sección visible, más el mapa.
    $("#menu").innerHTML = W.secciones.map((s) => `<a href="${rutaSeccion(s.id)}">${esc(s.titulo)}</a>`).join("") + '<a href="#/mapa">Mapa</a>';
    $("#btn-menu").innerHTML = ICONOS.menu;

    // Menú desplegable en móvil.
    $("#btn-menu").addEventListener("click", () => {
      const abierto = $("#menu").classList.toggle("abierto");
      $("#btn-menu").setAttribute("aria-expanded", String(abierto));
    });

    // Buscador: sugerencias mientras se escribe, flechas para elegir, Intro para ir.
    const input = $("#buscar"), caja = $("#sugerencias");
    let sel = -1;
    const pintarSug = () => {
      const res = Wiki.buscarLocal(input.value, 8);
      sel = -1;
      if (!input.value.trim() || !res.length) { caja.hidden = true; return; }
      caja.innerHTML = res.map((f) => `<a class="sugerencia" role="option" href="${enlace(f._seccion, f.id)}">
        ${f.imagen ? `<img src="${esc(f.imagen)}" alt="">` : '<span class="mini"></span>'}
        <span><b>${esc(f.titulo)}</b><small>${esc(NOMBRES_TIPO[f._seccion] || "")}</small></span></a>`).join("");
      caja.hidden = false;
    };
    input.addEventListener("input", pintarSug);
    input.addEventListener("focus", pintarSug);
    input.addEventListener("keydown", (e) => {
      const items = $$(".sugerencia", caja);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle("sel", i === sel));
      } else if (e.key === "Escape") { caja.hidden = true; input.blur(); }
      else if (e.key === "Enter" && sel >= 0 && items[sel]) { e.preventDefault(); location.hash = items[sel].getAttribute("href"); caja.hidden = true; input.blur(); }
    });
    // Enviar el formulario abre la página completa de resultados.
    $("#buscador").addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value.trim()) { location.hash = `#/buscar/${encodeURIComponent(input.value.trim())}`; caja.hidden = true; input.blur(); }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".buscador")) caja.hidden = true; });
    caja.addEventListener("click", () => { caja.hidden = true; input.value = ""; });

    // Botón de sonido ambiente (lluvia y truenos).
    const bA = $("#btn-ambiente");
    const pintarAmb = () => { bA.innerHTML = Umbra.Audio.encendido ? ICONOS.sonido : ICONOS.silencio; bA.setAttribute("aria-pressed", String(Umbra.Audio.encendido)); };
    pintarAmb();
    bA.addEventListener("click", () => { Umbra.Audio.poner(!Umbra.Audio.encendido); pintarAmb(); });
  }

  /** Cierra el menú móvil (al cambiar de página). */
  function cerrarMenu() {
    $("#menu")?.classList.remove("abierto");
    $("#btn-menu")?.setAttribute("aria-expanded", "false");
  }

  /* ------------------------- Interacciones globales ------------------------ */

  function interacciones() {
    // Inclinación 3D de las tarjetas siguiendo el ratón.
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest?.(".tarjeta");
      if (!card || Umbra.reducir || e.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
      card.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });
    // Al salir de la tarjeta vuelve a su sitio.
    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest?.(".tarjeta");
      if (card && !card.contains(e.relatedTarget)) { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); }
    });
    // Botones de tráiler y etiquetas (#etiqueta → búsqueda).
    document.addEventListener("click", (e) => {
      const v = e.target.closest("[data-video]");
      if (v) { Wiki.abrirVideo(v.dataset.video); return; }
      const b = e.target.closest("[data-buscar]");
      if (b) location.hash = `#/buscar/${encodeURIComponent(b.dataset.buscar)}`;
    });
    $("#visor").addEventListener("click", (e) => { if (e.target.id === "visor" || e.target.closest(".visor-cerrar")) Wiki.cerrarVideo(); });
    // Teclado: Esc cierra el vídeo; «/» salta al buscador.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("#visor").hidden) Wiki.cerrarVideo();
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) { e.preventDefault(); $("#buscar").focus(); }
    });
    // Barra roja de progreso de lectura bajo la cabecera.
    addEventListener("scroll", () => {
      const barra = $("#barra-progreso");
      if (!barra) return;
      const max = document.documentElement.scrollHeight - innerHeight;
      barra.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    }, { passive: true });
    // Cada cambio de ruta pinta la vista correspondiente.
    addEventListener("hashchange", enrutar);
  }

  Object.assign(Wiki, { enrutar, marcarMenu, montarCabecera, interacciones });
})();
