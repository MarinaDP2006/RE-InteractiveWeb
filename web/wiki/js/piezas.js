/* ============================================================================
 *  wiki/js/piezas.js — Piezas de interfaz reutilizadas por todas las vistas
 * ============================================================================
 *  · Imagen de una ficha (o una portada dibujada si no tiene).
 *  · Tarjetas: normal, sellada (expediente oculto) y mini tarjeta.
 *  · Galerías y chips de fichas relacionadas.
 *  · Texto con formato sencillo.
 *  · Tráileres: miniatura, visor a pantalla completa.
 * ========================================================================== */
"use strict";

(() => {
  const { $, esc, NOMBRES_TIPO, ICONOS, resolver, enlace } = Wiki;

  /** Nivel de peligro en palabras (1 a 5). */
  const PELIGRO = ["", "Bajo", "Moderado", "Alto", "Muy alto", "Extremo"];

  /** Portada dibujada (símbolo de riesgo biológico + iniciales) cuando la ficha no tiene imagen. */
  function portadaProc(f) {
    const titulo = (f.titulo || "?").replace(/^Resident Evil:?\s*/i, "").replace(/^[–-]\s*/, "");
    // Iniciales de las dos primeras palabras del título.
    const iniciales = titulo.split(/[\s:–-]+/).filter((p) => p && /[A-Za-zÁÉÍÓÚÑ0-9]/.test(p)).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "RE";
    // La semilla hace que cada ficha tenga siempre el mismo giro y la misma textura.
    const semilla = [...(f.id || "x")].reduce((a, c) => a + c.charCodeAt(0), 0);
    const rot = semilla % 360;
    return `<div class="portada-proc" style="--c:${esc(f.color || "#7a0a12")}">
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><filter id="ru${semilla}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${semilla % 50}"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .5 0"/></filter></defs>
        <rect width="200" height="200" filter="url(#ru${semilla})" opacity=".35"/>
        <g transform="translate(100 100) rotate(${rot}) scale(1.35)" fill="none" stroke="#fff" stroke-width="6" opacity=".55">
          <circle r="16"/><circle cy="-26" r="26"/><circle cx="22.5" cy="13" r="26"/><circle cx="-22.5" cy="13" r="26"/>
        </g>
      </svg>
      <span>${esc(iniciales)}</span></div>`;
  }

  /** <img> de la ficha; si la imagen falla al cargar, se cambia por la portada dibujada. */
  function imagenFicha(f, clase = "") {
    const src = f.imagen || f.cuerpoImagen;
    if (!src) return portadaProc(f);
    return `<img class="${clase}" src="${esc(src)}" alt="" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'portada-proc',innerHTML:'<span>RE</span>'}))">`;
  }

  /** Línea secundaria de una tarjeta según la sección (año, tipo, alias…). */
  function subtituloDe(f) {
    switch (f._seccion) {
      case "juegos": return `${f.anio || ""} · ${f.tipo || ""}`;
      case "peliculas": return `${f.anio || ""} · ${f.tipo || ""}`;
      case "personajes": return f.alias || f.rol || "";
      case "criaturas": return f.tipo || "";
      case "virus": return `${f.tipo || ""}${f.anio ? " · " + f.anio : ""}`;
      case "organizaciones": return f.tipo || "";
      case "ubicaciones": return [f.region, f.pais].filter(Boolean).join(" · ");
      case "cronologia": return f.fecha || "";
      default: return f.subtitulo || "";
    }
  }

  /** Tarjeta de un expediente oculto: solo el candado y la invitación a unirse. */
  function tarjetaSellada(i = 0) {
    return `<button class="tarjeta tarjeta-sellada revelar" type="button" data-unirse style="transition-delay:${Math.min(i, 12) * 40}ms">
      <div class="tarjeta-img"><div class="sellado">${ICONOS.candado}</div></div>
      <div class="tarjeta-cuerpo"><h3>Únete para ver lo oculto</h3></div></button>`;
  }

  /** Tarjeta de una ficha en las rejillas (imagen, chips, título y subtítulo). */
  function tarjeta(f, i = 0) {
    if (Wiki.sellada(f)) return tarjetaSellada(i);
    const noCanon = f.canon === false;
    const chips = [];
    if (f._seccion === "juegos" || f._seccion === "peliculas") chips.push(`<span class="chip ${noCanon ? "" : "chip-rojo"}">${noCanon ? "No canon" : "Canon"}</span>`);
    if (f.estado && f._seccion === "personajes") chips.push(`<span class="chip">${esc(f.estado)}</span>`);
    if (f.peligrosidad) chips.push(`<span class="chip chip-rojo">Peligro ${esc(PELIGRO[Math.min(5, f.peligrosidad)] || "")}</span>`);
    return `<a class="tarjeta revelar ${noCanon ? "no-canon" : ""}" href="${enlace(f._seccion, f.id)}" style="--c:${esc(f.color || "#c8102e")};transition-delay:${Math.min(i, 12) * 40}ms">
      <div class="tarjeta-img">${imagenFicha(f)}</div>
      <div class="tarjeta-brillo"></div>
      ${f.video ? `<span class="tarjeta-esquina chip chip-rojo">${ICONOS.play} Tráiler</span>` : ""}
      <div class="tarjeta-cuerpo">
        <div class="tarjeta-meta">${chips.join("")}</div>
        <h3>${esc(f.titulo)}</h3>
        <p>${esc(subtituloDe(f))}</p>
      </div></a>`;
  }

  /** Tarjeta pequeña para las galerías de fichas relacionadas. */
  function miniTarjeta(sec, f) {
    return `<a class="mini-tarjeta" href="${enlace(sec, f.id)}" title="${esc(NOMBRES_TIPO[sec] || "")}">
      <div class="tarjeta-img">${imagenFicha(f)}</div><b>${esc(f.titulo)}</b></a>`;
  }

  /** Lista de ids → galería de mini tarjetas (se saltan las que no existen o están selladas). */
  function galeria(ids, seccionPreferida) {
    const piezas = [];
    for (const id of ids || []) {
      const r = resolver(id, seccionPreferida);
      if (r) piezas.push(miniTarjeta(r.seccion, r.ficha));
    }
    return piezas.length ? `<div class="galeria-rel">${piezas.join("")}</div>` : "";
  }

  /** Lista de ids → chips con enlace a cada ficha. */
  function chipsEnlace(ids, seccionPreferida) {
    return (ids || []).map((id) => {
      const r = resolver(id, seccionPreferida);
      return r ? `<a class="chip" href="${enlace(r.seccion, r.ficha.id)}">${esc(r.ficha.titulo)}</a>` : "";
    }).join("");
  }

  /** Texto con formato mínimo: "## título", "> nota", **negrita**, *cursiva* y párrafos. */
  function formatear(cuerpo) {
    const lineas = Array.isArray(cuerpo) ? cuerpo : String(cuerpo || "").split(/\n{2,}/);
    return lineas.map((l) => {
      const t = String(l).trim();
      if (!t) return "";
      const negrita = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
      if (t.startsWith("## ")) return `<h2>${negrita(t.slice(3))}</h2>`;
      if (t.startsWith("> ")) return `<blockquote>${negrita(t.slice(2))}</blockquote>`;
      return `<p>${negrita(t)}</p>`;
    }).join("");
  }

  /* ------------------------------- Tráileres ------------------------------- */

  /** Interpreta el campo «video»: id o enlace de YouTube, o un archivo .mp4/.webm subido. */
  function videoInfo(v) {
    if (!v) return null;
    const s = String(v).trim();
    if (/\.(mp4|webm)(\?|$)/i.test(s)) return { tipo: "archivo", src: s };
    const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/);
    return m ? { tipo: "youtube", id: m[1] } : null;
  }

  /** Bloque grande con la miniatura del tráiler; al pulsarlo se abre el visor. */
  function videoTarjeta(f) {
    const v = videoInfo(f.video);
    if (!v) return "";
    const miniatura = v.tipo === "youtube" ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` : (f.imagen || "");
    return `<button class="video-tarjeta revelar" type="button" data-video="${esc(f.video)}" aria-label="Reproducir tráiler de ${esc(f.titulo)}">
      ${miniatura ? `<img src="${esc(miniatura)}" alt="" loading="lazy">` : ""}
      <span class="play"><span>${ICONOS.play}</span></span><span class="etq">TRÁILER · ${esc(f.titulo).toUpperCase()}</span></button>`;
  }

  /** Abre el visor con el vídeo (YouTube sin cookies o archivo propio) y silencia el ambiente. */
  function abrirVideo(valor) {
    const v = videoInfo(valor);
    if (!v) return;
    const marco = $("#visor-marco");
    marco.innerHTML = v.tipo === "youtube"
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1" title="Tráiler" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
      : `<video src="${esc(v.src)}" controls autoplay playsinline style="width:100%;height:100%;background:#000"></video>`;
    $("#visor").hidden = false;
    if (Umbra.Audio.encendido) Umbra.Audio.poner(false);
  }

  /** Cierra el visor y detiene el vídeo (vaciando el marco). */
  function cerrarVideo() {
    $("#visor").hidden = true;
    $("#visor-marco").innerHTML = "";
  }

  Object.assign(Wiki, { PELIGRO, portadaProc, imagenFicha, subtituloDe, tarjeta, tarjetaSellada, miniTarjeta, galeria, chipsEnlace, formatear, videoInfo, videoTarjeta, abrirVideo, cerrarVideo });
})();
