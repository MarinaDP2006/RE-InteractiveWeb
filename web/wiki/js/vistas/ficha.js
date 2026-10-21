/* ============================================================================
 *  wiki/js/vistas/ficha.js — Ficha completa (ruta #/f/<seccion>/<id>)
 * ============================================================================
 *  · Cabecera con la imagen de fondo, título, etiquetas y botón de tráiler.
 *  · Texto, curiosidades y fichas relacionadas (personajes, lugares…).
 *  · «Dossier» lateral con los datos clave según la sección.
 *  · Si la ficha está oculta y no hay sesión, solo se invita a unirse.
 * ========================================================================== */
"use strict";

(() => {
  const { esc, W, NOMBRES_TIPO, ICONOS, resolver, seccion, enlace, pintar, sellada } = Wiki;
  const { galeria, chipsEnlace, formatear, videoTarjeta, subtituloDe, PELIGRO } = Wiki;

  /** Una fila del dossier (se omite si no hay valor). */
  function filaDossier(etq, valor) {
    if (valor === undefined || valor === null || valor === "" || (Array.isArray(valor) && !valor.length)) return "";
    return `<dt>${esc(etq)}</dt><dd>${valor}</dd>`;
  }
  const t = (v) => esc(v ?? "");

  /** Dossier lateral: los datos que importan en cada tipo de ficha. */
  function dossier(f) {
    const s = f._seccion;
    // Primera aparición: enlace al juego si existe como ficha.
    const pa = f.primeraAparicion ? resolver(f.primeraAparicion, "juegos") : null;
    const paHtml = pa ? `<a href="${enlace(pa.seccion, pa.ficha.id)}">${esc(pa.ficha.titulo)}</a>` : t(f.primeraAparicion);
    let filas = "";
    if (s === "juegos") {
      filas = filaDossier("Tipo", t(f.tipo)) + filaDossier("Canon", f.canon === false ? "No" : "Sí") + filaDossier("Lanzamiento", t(f.lanzamiento))
        + filaDossier("Plataformas", t(f.plataformas)) + filaDossier("Historia", t(f.ambientacion)) + filaDossier("Lugar", t(f.lugar));
    } else if (s === "peliculas") {
      filas = filaDossier("Tipo", t(f.tipo)) + filaDossier("Año", t(f.anio)) + filaDossier("Dirección", t(f.director))
        + filaDossier("Duración", t(f.duracion)) + filaDossier("Historia", t(f.ambientacion));
    } else if (s === "personajes") {
      filas = filaDossier("Alias", t(f.alias)) + filaDossier("Nacimiento", t(f.nacimiento)) + filaDossier("Estado", t(f.estado))
        + filaDossier("Rol", t(f.rol)) + filaDossier("Afiliación", (f.afiliaciones || []).map(esc).join("<br>")) + filaDossier("1.ª aparición", paHtml);
    } else if (s === "criaturas") {
      const or = f.origen ? resolver(f.origen, "virus") : null;
      filas = filaDossier("Tipo", t(f.tipo)) + filaDossier("Origen", or ? `<a href="${enlace(or.seccion, or.ficha.id)}">${esc(or.ficha.titulo)}</a>` : t(f.origen))
        + filaDossier("1.ª aparición", paHtml)
        // Barra de cinco pasos con el nivel de peligro y su nombre.
        + filaDossier("Peligro", `<span class="peligro">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= (f.peligrosidad || 0) ? "on" : ""}"></i>`).join("")}</span> ${esc(PELIGRO[f.peligrosidad] || "")}`)
        + filaDossier("Debilidad", t(f.debilidad));
    } else if (s === "virus") {
      filas = filaDossier("Tipo", t(f.tipo)) + filaDossier("Creador", t(f.creador)) + filaDossier("Año", t(f.anio)) + filaDossier("Efectos", t(f.efectos)) + filaDossier("1.ª aparición", paHtml);
    } else if (s === "organizaciones") {
      filas = filaDossier("Tipo", t(f.tipo)) + filaDossier("Fundación", t(f.fundacion)) + filaDossier("Disolución", t(f.disolucion) || "Activa") + filaDossier("Lema", t(f.lema));
    } else if (s === "ubicaciones") {
      filas = filaDossier("Tipo", t(f.tipo)) + filaDossier("País", t(f.pais)) + filaDossier("Región", t(f.region)) + filaDossier("Época", t(f.anio)) + filaDossier("Estado", t(f.estado))
        + (f.lat != null ? filaDossier("Coordenadas", `${Number(f.lat).toFixed(2)}, ${Number(f.lng).toFixed(2)}${f.aproximada ? " (aprox.)" : ""}`) : "");
    } else if (s === "cronologia") {
      filas = filaDossier("Fecha", t(f.fecha)) + filaDossier("Era", t(f.era));
    }
    const foto = f.imagen ? `<div class="dossier-foto"><img src="${esc(f.imagen)}" alt="" loading="lazy"></div>` : "";
    return `<aside class="dossier"><div class="dossier-papel">
      <span class="sello">${f.canon === false ? "NO CANON" : "CLASIFICADO"}</span>
      <h3>UMBRELLA</h3>
      ${foto}<dl>${filas}</dl></div></aside>`;
  }

  /** Paneles de fichas relacionadas según la sección. */
  function relacionadosDe(f) {
    const s = f._seccion;
    const bloques = [];
    // Solo se añade el panel si tiene contenido.
    const bloque = (titulo, html) => { if (html) bloques.push(`<div class="panel revelar"><h3>${esc(titulo)}</h3>${html}</div>`); };
    if (s === "juegos") {
      bloque("Protagonistas", galeria(f.protagonistas, "personajes"));
      bloque("Antagonistas", galeria(f.antagonistas, "personajes"));
      bloque("Amenazas", galeria(f.amenazas, "criaturas"));
      const chips = chipsEnlace(f.virus, "virus");
      bloque("Agentes biológicos", chips ? `<div class="chips">${chips}</div>` : "");
      bloque("Ubicaciones", galeria(f.ubicaciones, "ubicaciones"));
    } else if (s === "peliculas") {
      bloque("Personajes", galeria(f.protagonistas, "personajes"));
      bloque("Ubicaciones", galeria(f.ubicaciones, "ubicaciones"));
    } else if (s === "personajes") {
      bloque("Juegos", galeria(f.apariciones, "juegos"));
      bloque("Películas y series", galeria(f.peliculas, "peliculas"));
      const orgs = (W.datos.organizaciones || []).filter((o) => (o.miembros || []).includes(f.id)).map((o) => o.id);
      bloque("Organizaciones", galeria(orgs, "organizaciones"));
    } else if (s === "criaturas") {
      bloque("Aparece en", galeria(f.apariciones, "juegos"));
    } else if (s === "virus") {
      bloque("Variantes derivadas", galeria(f.derivados, "virus"));
      const cri = (W.datos.criaturas || []).filter((c) => c.origen === f.id).map((c) => c.id);
      bloque("Criaturas que produce", galeria(cri, "criaturas"));
    } else if (s === "organizaciones") {
      bloque("Miembros", galeria(f.miembros, "personajes"));
    } else if (s === "ubicaciones") {
      bloque("Juegos", galeria(f.juegos, "juegos"));
      bloque("Películas", galeria(f.peliculas, "peliculas"));
    } else if (s === "cronologia") {
      bloque("Relacionado", galeria((f.relacionados || []).map((r) => r.id), null));
    }
    // Eventos de la cronología que mencionan esta ficha.
    if (s !== "cronologia") {
      const ev = (W.datos.cronologia || []).filter((e) => (e.relacionados || []).some((r) => r.id === f.id));
      if (ev.length) bloque("En la cronología", `<div class="chips">${ev.map((e) => `<a class="chip chip-ambar" href="${enlace("cronologia", e.id)}">${esc(e.anio)} · ${esc(e.titulo)}</a>`).join("")}</div>`);
    }
    return bloques.join("");
  }

  /** Página de un expediente oculto para quien no tiene sesión. */
  function vistaSellada(sec) {
    const s = seccion(sec);
    pintar(`
      <div class="ficha-sellada">
        <p class="migas"><a href="#/">Archivos</a> / <a href="#/s/${esc(sec)}">${esc(s ? s.titulo : sec)}</a></p>
        <div class="sellado grande">${ICONOS.candado}</div>
        <h1>Únete para ver lo oculto</h1>
        <button class="btn btn-rojo" type="button" data-unirse>Únete</button>
      </div>`, "Únete para ver lo oculto");
  }

  function vistaFicha(sec, id) {
    const f = W.indice.get(`${sec}/${id}`);
    if (!f) return Wiki.vistaError("Este expediente fue destruido… o nunca existió.");
    if (sellada(f)) return vistaSellada(sec);
    const s = seccion(sec);
    // Fichas vecinas de la misma sección para «Anterior / Siguiente» (sin las selladas).
    const lista = (W.datos[sec] || []).filter((x) => !sellada(x));
    const pos = lista.indexOf(f);
    const ant = lista[pos - 1], sig = lista[pos + 1];
    const fondo = f.imagen || f.cuerpoImagen || "";
    // Los personajes con imagen de cuerpo entero la muestran recortada a la derecha.
    const cuerpoImg = sec === "personajes" && f.cuerpoImagen ? `<img class="ficha-cuerpo-img" src="${esc(f.cuerpoImagen)}" alt="">` : "";
    const chips = [];
    if (s) chips.push(`<a class="chip chip-rojo" href="#/s/${esc(sec)}">${esc(NOMBRES_TIPO[sec] || s.titulo)}</a>`);
    if (f.anio) chips.push(`<span class="chip">${esc(f.anio)}</span>`);
    (f.etiquetas || []).slice(0, 6).forEach((e) => chips.push(`<button class="chip" type="button" data-buscar="${esc(e)}">#${esc(e)}</button>`));

    // Avisa al servidor de la visita (para las «fichas más vistas» del panel de administración).
    Umbra.api(`/api/wiki/${encodeURIComponent(sec)}/${encodeURIComponent(id)}`).catch(() => {});

    pintar(`
      <section class="ficha-hero" style="--c:${esc(f.color || "#c8102e")}">
        <div class="ficha-hero-fondo" style="--img:${fondo ? `url('${esc(fondo)}')` : "none"};--blur:${cuerpoImg ? "6px" : "0"}"></div>
        ${cuerpoImg}
        <div class="ficha-hero-in">
          <p class="migas"><a href="#/">Archivos</a> / <a href="#/s/${esc(sec)}">${esc(s ? s.titulo : sec)}</a> / ${esc(f.titulo)}</p>
          <h1>${esc(f.titulo)}</h1>
          ${subtituloDe(f) || f.subtitulo ? `<p class="ficha-sub">${esc(f.subtitulo || subtituloDe(f))}</p>` : ""}
          <div class="ficha-chips">${chips.join("")}</div>
          ${f.video ? `<div class="ficha-acciones"><button class="btn btn-rojo" type="button" data-video="${esc(f.video)}">${ICONOS.play} Ver tráiler</button></div>` : ""}
        </div>
      </section>
      <div class="contenedor ficha-layout" style="--c:${esc(f.color || "#c8102e")}">
        <article>
          ${f.resumen ? `<p class="resumen revelar">${esc(f.resumen)}</p>` : ""}
          <div class="texto">${formatear(f.cuerpo)}</div>
          ${videoTarjeta(f)}
          ${(f.curiosidades || []).length ? `<div class="panel revelar"><h3>Curiosidades</h3><ul class="curiosidades">${f.curiosidades.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>` : ""}
          ${relacionadosDe(f)}
          <nav class="ficha-nav" aria-label="Fichas vecinas">
            ${ant ? `<a href="${enlace(sec, ant.id)}"><small>← ANTERIOR</small><b>${esc(ant.titulo)}</b></a>` : "<span></span>"}
            ${sig ? `<a class="sig" href="${enlace(sec, sig.id)}"><small>SIGUIENTE →</small><b>${esc(sig.titulo)}</b></a>` : ""}
          </nav>
        </article>
        ${dossier(f)}
      </div>`, f.titulo);
  }

  Wiki.vistaFicha = vistaFicha;
})();
