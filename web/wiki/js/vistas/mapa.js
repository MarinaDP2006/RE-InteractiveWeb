/* ============================================================================
 *  wiki/js/vistas/mapa.js — Mapa de la saga (rutas #/mapa y #/mapa/raccoon)
 * ============================================================================
 *  · Pestaña «Mundo»: mapa real (Leaflet + teselas oscuras de Esri) con un
 *    marcador por ubicación.
 *  · Pestaña «Raccoon City»: plano dibujado a mano en SVG con los lugares
 *    de la ciudad y la zona cero del misil.
 *  A la derecha, la lista de lugares; al pulsar uno se centra en el mapa.
 * ========================================================================== */
"use strict";

(() => {
  const { $, $$, esc, W, enlace, pintar } = Wiki;

  function vistaMapa(pestana = "mundo") {
    pintar(`
      <header class="cab-seccion"><div class="contenedor">
        <p class="migas"><a href="#/">Archivos</a> / Mapa</p>
        <h1 class="titulo-seccion">Mapa de la saga</h1>
        <p>Todas las ubicaciones de los juegos y películas. Muchas son ficticias: su posición es aproximada según lo que cuentan los juegos.</p>
        <div class="mapa-pestanas" role="tablist">
          <button class="chip" role="tab" data-pestana="mundo" aria-selected="${pestana === "mundo"}">Mundo</button>
          <button class="chip" role="tab" data-pestana="raccoon" aria-selected="${pestana === "raccoon"}">Raccoon City · 1998</button>
        </div>
      </div></header>
      <div class="contenedor mapa-zona">
        <div class="mapa-lienzo" id="mapa-lienzo"></div>
        <div class="mapa-lista" id="mapa-lista"></div>
      </div>`, "Mapa");
    // Cambiar de pestaña cambia la ruta (así funciona el botón «atrás»).
    $$("[data-pestana]").forEach((b) => b.addEventListener("click", () => { location.hash = b.dataset.pestana === "mundo" ? "#/mapa" : "#/mapa/raccoon"; }));
    if (pestana === "raccoon") mapaRaccoon(); else mapaMundo();
  }

  /** Contenido de la ventanita de un lugar (imagen, nombre, resumen y enlace). */
  function popupHtml(u) {
    return `${u.imagen ? `<img src="${esc(u.imagen)}" alt="">` : ""}<h4>${esc(u.titulo)}</h4>
      <div style="color:#999;font-size:.8rem;margin-bottom:6px">${esc([u.region, u.pais].filter(Boolean).join(" · "))} · ${esc(u.anio || "")}</div>
      <div style="margin-bottom:8px">${esc(u.resumen || "")}</div><a href="${enlace("ubicaciones", u.id)}">Abrir expediente →</a>`;
  }

  /** Mapa del mundo con Leaflet. */
  function mapaMundo() {
    const lienzo = $("#mapa-lienzo");
    lienzo.innerHTML = '<div id="mapa-mundo"></div><div class="mapa-aviso">Posición aproximada en los lugares ficticios</div>';
    const lugares = (W.datos.ubicaciones || []).filter((u) => u.mapa !== "raccoon" && u.lat != null);
    const lista = $("#mapa-lista");
    lista.innerHTML = lugares.map((u) => `<button type="button" data-lugar="${esc(u.id)}">${esc(u.titulo)}<small>${esc(String(u.anio || "").slice(0, 9))}</small></button>`).join("");

    const montar = () => {
      // Leaflet se carga desde internet; sin conexión no hay mapa.
      if (!window.L) {
        lienzo.innerHTML = '<p class="vacio">No se pudo cargar el mapa (¿sin conexión a internet?).</p>';
        return;
      }
      const mapa = L.map("mapa-mundo", { worldCopyJump: true, minZoom: 2, maxZoom: 16, zoomControl: true, attributionControl: true }).setView([30, 0], 2);
      // Mapa base oscuro de Esri (gratuito, sin clave) + etiquetas de referencia.
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 16, attribution: "Mapa base &copy; Esri, HERE, Garmin, &copy; OpenStreetMap"
      }).addTo(mapa);
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 16, opacity: 0.7
      }).addTo(mapa);
      // Un marcador por lugar; los que solo salen en películas llevan otro color.
      const marcadores = {};
      for (const u of lugares) {
        const soloPeli = !(u.juegos || []).length && (u.peliculas || []).length;
        const icono = L.divIcon({ className: `marcador ${soloPeli ? "peli" : ""}`, html: "<i></i>", iconSize: [26, 26] });
        marcadores[u.id] = L.marker([u.lat, u.lng], { icon: icono, title: u.titulo }).addTo(mapa).bindPopup(popupHtml(u), { maxWidth: 280 });
      }
      // Al pulsar un lugar de la lista, el mapa vuela hasta él y abre su ventana.
      lista.addEventListener("click", (e) => {
        const b = e.target.closest("[data-lugar]");
        if (!b) return;
        $$("button", lista).forEach((x) => x.classList.toggle("sel", x === b));
        const u = lugares.find((x) => x.id === b.dataset.lugar);
        mapa.flyTo([u.lat, u.lng], 6, { duration: 1.4 });
        setTimeout(() => marcadores[u.id].openPopup(), 1400);
      });
      // Recalcula el tamaño cuando el contenedor ya está en la página.
      setTimeout(() => mapa.invalidateSize(), 200);
    };
    if (window.L) montar(); else addEventListener("load", montar, { once: true });
  }

  /** Plano esquemático de Raccoon City (SVG de 1000×700 dibujado a mano). */
  function mapaRaccoon() {
    const lienzo = $("#mapa-lienzo");
    const puntos = (W.datos.ubicaciones || []).filter((u) => u.mapa === "raccoon");
    lienzo.innerHTML = `
      <svg class="raccoon" viewBox="0 0 1000 700" role="img" aria-label="Plano de Raccoon City">
        <defs>
          <radialGradient id="gradExplosion"><stop offset="0" stop-color="#ff6a2a" stop-opacity=".9"/><stop offset=".35" stop-color="#c8102e" stop-opacity=".5"/><stop offset="1" stop-color="#c8102e" stop-opacity="0"/></radialGradient>
          <pattern id="rejillaR" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#111116" stroke-width="1"/></pattern>
        </defs>
        <rect width="1000" height="700" fill="url(#rejillaR)"/>
        <!-- Distritos -->
        <path class="distrito" d="M60 60 L380 50 L420 230 L300 300 L80 280 Z"/>
        <path class="distrito" d="M420 230 L380 50 L760 40 L800 220 L620 260 Z"/>
        <path class="distrito" d="M300 300 L420 230 L620 260 L640 520 L380 560 L280 470 Z"/>
        <path class="distrito" d="M620 260 L800 220 L940 300 L920 560 L640 520 Z"/>
        <path class="distrito" d="M80 280 L300 300 L280 470 L380 560 L320 660 L70 640 Z"/>
        <path class="distrito" d="M380 560 L640 520 L920 560 L940 660 L320 660 Z"/>
        <!-- Río y calles -->
        <path class="rio" d="M0 520 C 200 480, 260 600, 420 610 S 700 560, 1000 640"/>
        <path class="calle principal" d="M60 420 L940 380"/><path class="calle principal" d="M520 40 L560 660"/>
        <path class="calle" d="M200 60 L240 660"/><path class="calle" d="M760 40 L800 660"/><path class="calle" d="M60 200 L940 220"/><path class="calle" d="M60 560 L940 520"/>
        <text class="etq-distrito" x="140" y="160">Afueras · Arklay ↑</text>
        <text class="etq-distrito" x="520" y="120">Uptown</text>
        <text class="etq-distrito" x="400" y="330">Centro</text>
        <text class="etq-distrito" x="720" y="470">Downtown</text>
        <text class="etq-distrito" x="120" y="520">Distrito industrial</text>
        <text class="etq-distrito" x="560" y="640">Subsuelo · NEST</text>
        <!-- Zona cero del misil -->
        <circle class="explosion" cx="520" cy="380" r="330"/>
        <!-- Lugares (posición x, y guardada en cada ficha) -->
        ${puntos.map((u) => `<g class="punto" data-lugar="${esc(u.id)}" tabindex="0" role="button" aria-label="${esc(u.titulo)}">
          <circle class="o" cx="${u.x}" cy="${u.y}" r="9"/><circle class="n" cx="${u.x}" cy="${u.y}" r="8"/>
          <text x="${u.x + 14}" y="${u.y + 5}">${esc(u.titulo)}</text></g>`).join("")}
      </svg>
      <div class="mapa-aviso">Zona cero · misil del 1 de octubre de 1998</div>
      <div class="mapa-ficha" id="mapa-ficha" hidden></div>`;
    const lista = $("#mapa-lista");
    lista.innerHTML = puntos.map((u) => `<button type="button" data-lugar="${esc(u.id)}">${esc(u.titulo)}</button>`).join("");
    const ficha = $("#mapa-ficha");
    // Marca el lugar elegido en el plano y en la lista y muestra su ficha.
    const mostrar = (id) => {
      const u = puntos.find((x) => x.id === id);
      if (!u) return;
      $$(".punto", lienzo).forEach((g) => g.classList.toggle("sel", g.dataset.lugar === id));
      $$("button", lista).forEach((b) => b.classList.toggle("sel", b.dataset.lugar === id));
      ficha.hidden = false;
      ficha.innerHTML = popupHtml(u);
    };
    lienzo.addEventListener("click", (e) => { const g = e.target.closest("[data-lugar]"); if (g) mostrar(g.dataset.lugar); });
    lienzo.addEventListener("keydown", (e) => { if (e.key === "Enter") { const g = e.target.closest("[data-lugar]"); if (g) mostrar(g.dataset.lugar); } });
    lista.addEventListener("click", (e) => { const b = e.target.closest("[data-lugar]"); if (b) mostrar(b.dataset.lugar); });
  }

  Wiki.vistaMapa = vistaMapa;
})();
