/* ============================================================================
 *  wiki/js/vistas/portada.js — Portada de la wiki (ruta #/)
 * ============================================================================
 *  Cabecera grande con el lema, accesos a todas las secciones, expedientes
 *  destacados y la saga canon en orden de lanzamiento.
 * ========================================================================== */
"use strict";

(() => {
  const { $, esc, W, resolver, rutaSeccion, pintar, tarjeta } = Wiki;

  function vistaPortada() {
    const p = W.portada;
    // Fondo: la imagen de Raccoon City si existe.
    const fondo = (W.datos.ubicaciones || []).find((u) => u.id === "raccoon-city")?.imagen || "/img/escenarios/re2.webp";
    const destacados = (p.destacados || []).map((d) => resolver(d.id, d.seccion)).filter(Boolean);
    const juegosCanon = (W.datos.juegos || []).filter((j) => j.canon !== false);

    pintar(`
      <section class="hero" id="hero">
        <div class="hero-fondo" style="--img:url('${esc(fondo)}')"></div>
        <div class="niebla" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="hero-logo" aria-hidden="true">${Umbra.logo()}</div>
        <div class="hero-in">
          <span class="hero-etiqueta">Archivo clasificado</span>
          <h1><span class="glitch" data-t="${esc(p.titulo || "UMBRELLA ARCHIVES")}">${esc(p.titulo || "UMBRELLA ARCHIVES")}</span></h1>
          <p class="hero-lema">«${esc(p.lema || "Nuestro negocio es la vida misma.")}»</p>
          <p class="hero-intro">${esc(p.intro || "")}</p>
          <div class="hero-acciones">
            <a class="btn btn-rojo" href="#/s/juegos">Explorar la saga</a>
            <a class="btn" href="#/cronologia">Cronología</a>
            <a class="btn" href="#/mapa">Mapa</a>
          </div>
        </div>
        <div class="hero-scroll">DESCENDER</div>
      </section>

      <div class="contenedor">
        <!-- Accesos a cada sección (solo el nombre y su descripción) -->
        <section class="bloque">
          <div class="bloque-cab revelar"><div><span class="supra">Explorar la saga</span><h2>Secciones</h2></div></div>
          <div class="rejilla-secciones">
            ${W.secciones.map((s, i) => `<a class="tarjeta-seccion revelar" href="${rutaSeccion(s.id)}" style="transition-delay:${i * 50}ms">
              <h3>${esc(s.titulo)}</h3><p>${esc(s.descripcion || "")}</p></a>`).join("")}
            <a class="tarjeta-seccion revelar" href="#/mapa"><h3>Mapa</h3><p>Del bosque de Arklay a Lanshiang: cada lugar en el mapa del mundo y el plano de Raccoon City.</p></a>
          </div>
        </section>

        ${destacados.length ? `<section class="bloque">
          <div class="bloque-cab revelar"><div><span class="supra">Expedientes destacados</span><h2>Desde los archivos</h2></div></div>
          <div class="rejilla">${destacados.map((d, i) => tarjeta(d.ficha, i)).join("")}</div>
        </section>` : ""}

        <section class="bloque">
          <div class="bloque-cab revelar"><div><span class="supra">Orden de lanzamiento</span><h2>La saga canon</h2><p>De la mansión Spencer al regreso a Raccoon City.</p></div>
            <a class="btn btn-peque" href="#/s/juegos">Ver todos</a></div>
          <div class="rejilla ancha">${juegosCanon.slice(0, 9).map((f, i) => tarjeta(f, i)).join("")}</div>
        </section>
      </div>`);

    parallaxHero();
  }

  /** El fondo de la portada se desplaza un poco siguiendo el ratón. */
  function parallaxHero() {
    const hero = $("#hero");
    if (!hero || Umbra.reducir) return;
    const fondo = $(".hero-fondo", hero);
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      fondo.style.setProperty("--px", `${((e.clientX - r.left) / r.width - 0.5) * -24}px`);
      fondo.style.setProperty("--py", `${((e.clientY - r.top) / r.height - 0.5) * -16}px`);
    });
  }

  Wiki.vistaPortada = vistaPortada;
})();
