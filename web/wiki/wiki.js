/* ============================================================================
 *  wiki/wiki.js — Motor de la wiki UMBRELLA ARCHIVES
 * ============================================================================
 *  1. Carga desde la API todas las secciones y sus fichas (base de datos).
 *  2. Construye un índice global id → ficha para enlazar todo con todo.
 *  3. Enrutador por hash (#/s/juegos, #/f/personajes/leon, #/mapa...).
 *  4. Vistas: portada, sección, ficha, cronología, mapa y búsqueda.
 * ========================================================================== */
"use strict";

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = Umbra.esc;
  const main = $("#contenido");

  /** Estado global */
  const W = {
    secciones: [],       // [{id, titulo, icono, descripcion, fichas}]
    portada: {},
    datos: {},           // seccion → [fichas ordenadas]
    indice: new Map(),   // "seccion/id" → ficha
    porId: new Map(),    // id → {seccion, ficha} (primera coincidencia)
    vistaAdmin: false
  };

  const NOMBRES_TIPO = { juegos: "Juego", peliculas: "Película", personajes: "Personaje", criaturas: "Criatura", virus: "Agente", organizaciones: "Organización", ubicaciones: "Ubicación", cronologia: "Evento" };

  /* =====================================================================
   *  CARGA DE DATOS
   * =================================================================== */
  async function cargar() {
    const r = await Umbra.api("/api/wiki");
    W.secciones = r.secciones || [];
    W.portada = r.portada || {};
    await Promise.all(W.secciones.map(async (s) => {
      try {
        const d = await Umbra.api(`/api/wiki/${encodeURIComponent(s.id)}`);
        W.datos[s.id] = d.fichas || [];
      } catch {
        W.datos[s.id] = [];
      }
    }));
    // Índices: la prioridad de porId sigue el orden de las secciones.
    for (const s of W.secciones) {
      for (const f of W.datos[s.id]) {
        f._seccion = s.id;
        W.indice.set(`${s.id}/${f.id}`, f);
        if (!W.porId.has(f.id)) W.porId.set(f.id, { seccion: s.id, ficha: f });
      }
    }
  }

  /** Busca una ficha: primero en la sección indicada y si no, en cualquiera. */
  function resolver(id, seccionPreferida) {
    if (!id) return null;
    if (seccionPreferida && W.indice.has(`${seccionPreferida}/${id}`)) return { seccion: seccionPreferida, ficha: W.indice.get(`${seccionPreferida}/${id}`) };
    return W.porId.get(id) || null;
  }
  const seccion = (id) => W.secciones.find((s) => s.id === id);
  const enlace = (sec, id) => `#/f/${encodeURIComponent(sec)}/${encodeURIComponent(id)}`;

  /* =====================================================================
   *  PIEZAS DE INTERFAZ
   * =================================================================== */

  /** Portada procedural (SVG con símbolo de riesgo biológico) cuando no hay imagen. */
  function portadaProc(f) {
    const titulo = (f.titulo || "?").replace(/^Resident Evil:?\s*/i, "").replace(/^[–-]\s*/, "");
    const iniciales = titulo.split(/[\s:–-]+/).filter((p) => p && /[A-Za-zÁÉÍÓÚÑ0-9]/.test(p)).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "RE";
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

  function imagenFicha(f, clase = "") {
    const src = f.imagen || f.cuerpoImagen;
    if (!src) return portadaProc(f);
    return `<img class="${clase}" src="${esc(src)}" alt="" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'portada-proc',innerHTML:'<span>☣</span>'}))">`;
  }

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

  function tarjeta(f, i = 0) {
    const canon = f.canon === false;
    const chips = [];
    if (f._seccion === "juegos" || f._seccion === "peliculas") chips.push(`<span class="chip ${canon ? "" : "chip-rojo"}">${canon ? "No canon" : "Canon"}</span>`);
    if (f.estado && f._seccion === "personajes") chips.push(`<span class="chip">${esc(f.estado)}</span>`);
    if (f.peligrosidad) chips.push(`<span class="chip chip-rojo">Peligro ${"☣".repeat(Math.min(5, f.peligrosidad))}</span>`);
    return `<a class="tarjeta revelar ${canon ? "no-canon" : ""}" href="${enlace(f._seccion, f.id)}" style="--c:${esc(f.color || "#c8102e")};transition-delay:${Math.min(i, 12) * 40}ms">
      <div class="tarjeta-img">${imagenFicha(f)}</div>
      <div class="tarjeta-brillo"></div>
      ${f.video ? '<span class="tarjeta-esquina chip chip-rojo">▶ Tráiler</span>' : ""}
      <div class="tarjeta-cuerpo">
        <div class="tarjeta-meta">${chips.join("")}</div>
        <h3>${esc(f.titulo)}</h3>
        <p>${esc(subtituloDe(f))}</p>
      </div></a>`;
  }

  function miniTarjeta(sec, f) {
    return `<a class="mini-tarjeta" href="${enlace(sec, f.id)}" title="${esc(NOMBRES_TIPO[sec] || "")}">
      <div class="tarjeta-img">${imagenFicha(f)}</div><b>${esc(f.titulo)}</b></a>`;
  }

  /** Lista de ids → mini tarjetas (o chips si no existen como ficha). */
  function galeria(ids, seccionPreferida) {
    const piezas = [];
    for (const id of ids || []) {
      const r = resolver(id, seccionPreferida);
      if (r) piezas.push(miniTarjeta(r.seccion, r.ficha));
    }
    return piezas.length ? `<div class="galeria-rel">${piezas.join("")}</div>` : "";
  }

  function chipsEnlace(ids, seccionPreferida) {
    return (ids || []).map((id) => {
      const r = resolver(id, seccionPreferida);
      return r ? `<a class="chip" href="${enlace(r.seccion, r.ficha.id)}">${esc(r.ficha.titulo)}</a>` : "";
    }).join("");
  }

  /** Texto con formato mínimo: "## título", "> nota", **negrita** y párrafos. */
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

  /** Miniatura del vídeo: YouTube (id o URL) o archivo .mp4/.webm subido. */
  function videoInfo(v) {
    if (!v) return null;
    const s = String(v).trim();
    if (/\.(mp4|webm)(\?|$)/i.test(s)) return { tipo: "archivo", src: s };
    const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || s.match(/^([\w-]{11})$/);
    return m ? { tipo: "youtube", id: m[1] } : null;
  }
  function videoTarjeta(f) {
    const v = videoInfo(f.video);
    if (!v) return "";
    const miniatura = v.tipo === "youtube" ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` : (f.imagen || "");
    return `<button class="video-tarjeta revelar" type="button" data-video="${esc(f.video)}" aria-label="Reproducir tráiler de ${esc(f.titulo)}">
      ${miniatura ? `<img src="${esc(miniatura)}" alt="" loading="lazy">` : ""}
      <span class="play"><span>▶</span></span><span class="etq">TRÁILER · ${esc(f.titulo).toUpperCase()}</span></button>`;
  }
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
  function cerrarVideo() {
    $("#visor").hidden = true;
    $("#visor-marco").innerHTML = "";
  }

  function pintar(html, titulo) {
    main.innerHTML = `<div class="vista">${html}</div>`;
    document.title = titulo ? `${titulo} · Umbrella Archives` : "Umbrella Archives · Wiki de Resident Evil";
    scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    Umbra.observarRevelar(main);
    marcarMenu();
  }

  /* =====================================================================
   *  VISTAS
   * =================================================================== */
  function vistaPortada() {
    const p = W.portada;
    const total = Object.values(W.datos).reduce((a, l) => a + l.length, 0);
    const n = (s) => (W.datos[s] || []).length;
    const fondo = (W.datos.ubicaciones || []).find((u) => u.id === "raccoon-city")?.imagen || "/juego/img/escenarios/re2.webp";
    const destacados = (p.destacados || []).map((d) => resolver(d.id, d.seccion)).filter(Boolean);
    const juegosCanon = (W.datos.juegos || []).filter((j) => j.canon !== false);

    pintar(`
      <section class="hero" id="hero">
        <div class="hero-fondo" style="--img:url('${esc(fondo)}')"></div>
        <div class="niebla" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="hero-logo" aria-hidden="true">${Umbra.logo()}</div>
        <div class="hero-in">
          <span class="hero-etiqueta">Archivo clasificado · Nivel de acceso 5</span>
          <h1><span class="glitch" data-t="${esc(p.titulo || "UMBRELLA ARCHIVES")}">${esc(p.titulo || "UMBRELLA ARCHIVES")}</span></h1>
          <p class="hero-lema">«${esc(p.lema || "Nuestro negocio es la vida misma.")}»</p>
          <p class="hero-intro">${esc(p.intro || "")}</p>
          <div class="hero-acciones">
            <a class="btn btn-rojo" href="#/s/juegos">☣ Explorar la saga</a>
            <a class="btn" href="#/cronologia">⏳ Cronología</a>
            <a class="btn" href="#/mapa">🗺 Mapa</a>
            <a class="btn btn-fantasma" href="/juego/">🎮 Jugar</a>
          </div>
        </div>
        <div class="hero-scroll">DESCENDER</div>
      </section>

      <div class="contenedor">
        <div class="contadores revelar">
          <div class="contador"><b data-contar="${n("juegos")}">0</b><span>Juegos</span></div>
          <div class="contador"><b data-contar="${n("peliculas")}">0</b><span>Películas y series</span></div>
          <div class="contador"><b data-contar="${n("personajes")}">0</b><span>Personajes</span></div>
          <div class="contador"><b data-contar="${n("criaturas")}">0</b><span>Criaturas</span></div>
          <div class="contador"><b data-contar="${total}">0</b><span>Fichas totales</span></div>
        </div>

        <section class="bloque">
          <div class="bloque-cab revelar"><div><span class="supra">Índice de archivos</span><h2>Secciones</h2></div></div>
          <div class="rejilla-secciones">
            ${W.secciones.map((s, i) => `<a class="tarjeta-seccion revelar" href="${s.id === "cronologia" ? "#/cronologia" : "#/s/" + esc(s.id)}" style="transition-delay:${i * 50}ms">
              <span class="icono">${esc(s.icono || "☣")}</span><span class="num">${String((W.datos[s.id] || []).length).padStart(2, "0")}</span>
              <h3>${esc(s.titulo)}</h3><p>${esc(s.descripcion || "")}</p></a>`).join("")}
            <a class="tarjeta-seccion revelar" href="#/mapa"><span class="icono">🗺</span><h3>Mapa interactivo</h3><p>Del bosque de Arklay a Lanshiang: cada lugar en el mapa del mundo y el plano de Raccoon City.</p></a>
          </div>
        </section>

        ${destacados.length ? `<section class="bloque">
          <div class="bloque-cab revelar"><div><span class="supra">Expedientes destacados</span><h2>Desde los archivos</h2></div></div>
          <div class="rejilla">${destacados.map((d, i) => tarjeta(d.ficha, i)).join("")}</div>
        </section>` : ""}

        <section class="bloque">
          <div class="bloque-cab revelar"><div><span class="supra">Orden de lanzamiento</span><h2>La saga canon</h2><p>De la mansión Spencer al regreso a Raccoon City.</p></div>
            <a class="btn btn-peque" href="#/s/juegos">Ver todos →</a></div>
          <div class="rejilla ancha">${juegosCanon.slice(0, 9).map((f, i) => tarjeta(f, i)).join("")}</div>
        </section>
      </div>`);

    animarContadores();
    parallaxHero();
  }

  function animarContadores() {
    $$("[data-contar]").forEach((el) => {
      const fin = Number(el.dataset.contar) || 0;
      const t0 = performance.now();
      const paso = (t) => {
        const k = Math.min(1, (t - t0) / 1400);
        el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
  }

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

  /* ---------------------------- Sección ---------------------------- */
  function vistaSeccion(id) {
    const s = seccion(id);
    if (!s) return vistaError("Sección no encontrada");
    if (id === "cronologia") return vistaCronologia();
    const fichas = W.datos[id] || [];
    const conCanon = id === "juegos" || id === "peliculas";
    const filtros = conCanon
      ? [["todos", "Todos"], ["canon", "Canon"], ["nocanon", "No canon"]]
      : id === "personajes" ? [["todos", "Todos"], ["Protagonista", "Protagonistas"], ["Antagonista", "Antagonistas"], ["Aliad", "Aliados"]]
        : id === "criaturas" ? [["todos", "Todas"], ["5", "Peligro máximo"], ["t-virus", "Virus-T"], ["las-plagas", "Las Plagas"], ["moho", "Moho"]] : [];

    pintar(`
      <header class="cab-seccion" data-icono="${esc(s.icono || "☣")}">
        <div class="contenedor">
          <p class="migas"><a href="#/">Archivos</a> / ${esc(s.titulo)}</p>
          <h1 class="titulo-seccion">${esc(s.icono || "")} ${esc(s.titulo)}</h1>
          <p>${esc(s.descripcion || "")} <span class="mono" style="color:var(--rojo-vivo)">· ${fichas.length} expedientes</span></p>
        </div>
      </header>
      <div class="contenedor lista-seccion">
        <div class="filtros">
          <input id="filtro-texto" type="search" placeholder="Filtrar ${esc(s.titulo.toLowerCase())}…" aria-label="Filtrar">
          ${filtros.map(([v, t], i) => `<button class="chip" type="button" data-filtro="${esc(v)}" aria-pressed="${i === 0}">${esc(t)}</button>`).join("")}
        </div>
        <div class="rejilla ${["juegos", "peliculas", "ubicaciones", "organizaciones", "virus"].includes(id) ? "ancha" : ""}" id="rejilla"></div>
      </div>`, s.titulo);

    let filtro = "todos";
    const pintarRejilla = () => {
      const q = normal($("#filtro-texto").value);
      const lista = fichas.filter((f) => {
        if (q && !normal(`${f.titulo} ${f.alias || ""} ${f.resumen || ""} ${(f.etiquetas || []).join(" ")}`).includes(q)) return false;
        if (filtro === "todos") return true;
        if (filtro === "canon") return f.canon !== false;
        if (filtro === "nocanon") return f.canon === false;
        if (id === "personajes") return String(f.rol || "").includes(filtro);
        if (id === "criaturas") return filtro === "5" ? f.peligrosidad >= 5 : filtro === "moho" ? ["moho-e", "cadou", "megamiceto"].includes(f.origen) : f.origen === filtro;
        return true;
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

  /* ----------------------------- Ficha ----------------------------- */
  function filaDossier(etq, valor) {
    if (valor === undefined || valor === null || valor === "" || (Array.isArray(valor) && !valor.length)) return "";
    return `<dt>${esc(etq)}</dt><dd>${valor}</dd>`;
  }
  const t = (v) => esc(v ?? "");

  function dossier(f) {
    const s = f._seccion;
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
        + filaDossier("Peligro", `<span class="peligro">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= (f.peligrosidad || 0) ? "on" : ""}"></i>`).join("")}</span>`)
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
      <h3>UMBRELLA · EXP. ${esc(String(f.id).toUpperCase().slice(0, 14))}</h3>
      ${foto}<dl>${filas}</dl></div></aside>`;
  }

  function relacionadosDe(f) {
    const s = f._seccion;
    const bloques = [];
    const bloque = (titulo, html) => { if (html) bloques.push(`<div class="panel revelar"><h3>${esc(titulo)}</h3>${html}</div>`); };
    if (s === "juegos") {
      bloque("Protagonistas", galeria(f.protagonistas, "personajes"));
      bloque("Antagonistas", galeria(f.antagonistas, "personajes"));
      bloque("Amenazas", galeria(f.amenazas, "criaturas"));
      bloque("Agentes biológicos", `<div class="chips">${chipsEnlace(f.virus, "virus")}</div>`.replace('<div class="chips"></div>', ""));
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

  function vistaFicha(sec, id) {
    const f = W.indice.get(`${sec}/${id}`);
    if (!f) return vistaError("Este expediente fue destruido… o nunca existió.");
    const s = seccion(sec);
    const lista = W.datos[sec] || [];
    const pos = lista.indexOf(f);
    const ant = lista[pos - 1], sig = lista[pos + 1];
    const fondo = f.imagen || f.cuerpoImagen || "";
    const cuerpoImg = sec === "personajes" && f.cuerpoImagen ? `<img class="ficha-cuerpo-img" src="${esc(f.cuerpoImagen)}" alt="">` : "";
    const chips = [];
    if (s) chips.push(`<a class="chip chip-rojo" href="#/s/${esc(sec)}">${esc(s.icono || "")} ${esc(NOMBRES_TIPO[sec] || s.titulo)}</a>`);
    if (f.anio) chips.push(`<span class="chip">${esc(f.anio)}</span>`);
    (f.etiquetas || []).slice(0, 6).forEach((e) => chips.push(`<button class="chip" type="button" data-buscar="${esc(e)}">#${esc(e)}</button>`));

    Umbra.api(`/api/wiki/${encodeURIComponent(sec)}/${encodeURIComponent(id)}`).catch(() => {}); // cuenta la visita a la ficha

    pintar(`
      <section class="ficha-hero" style="--c:${esc(f.color || "#c8102e")}">
        <div class="ficha-hero-fondo" style="--img:${fondo ? `url('${esc(fondo)}')` : "none"};--blur:${cuerpoImg ? "6px" : "0"}"></div>
        ${cuerpoImg}
        <div class="ficha-hero-in">
          <p class="migas"><a href="#/">Archivos</a> / <a href="#/s/${esc(sec)}">${esc(s ? s.titulo : sec)}</a> / ${esc(f.titulo)}</p>
          <h1>${esc(f.titulo)}</h1>
          ${subtituloDe(f) || f.subtitulo ? `<p class="ficha-sub">${esc(f.subtitulo || subtituloDe(f))}</p>` : ""}
          <div class="ficha-chips">${chips.join("")}</div>
          ${f.video ? `<div class="ficha-acciones"><button class="btn btn-rojo" type="button" data-video="${esc(f.video)}">▶ Ver tráiler</button></div>` : ""}
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

  /* --------------------------- Cronología --------------------------- */
  function vistaCronologia() {
    const eventos = [...(W.datos.cronologia || [])].sort((a, b) => (a.orden || a.anio * 100) - (b.orden || b.anio * 100));
    let html = "", era = "";
    for (const e of eventos) {
      if (e.era !== era) { era = e.era; html += `<div class="crono-era revelar">${esc(era || "")}</div>`; }
      const rel = (e.relacionados || []).map((r) => resolver(r.id, r.seccion)).filter(Boolean);
      html += `<div class="crono-evento revelar" data-tipo="${esc(e.tipo || "hito")}">
        <span class="crono-anio">${esc(e.anio)}</span>
        <div class="crono-caja"><span class="crono-fecha">${esc(e.fecha || e.anio)} · ${esc({ juego: "Juego", pelicula: "Película", hito: "Historia" }[e.tipo] || "Historia")}</span>
          <h3>${esc(e.titulo)}</h3><p>${esc(e.resumen || "")}</p>
          <div class="chips" style="display:flex;flex-wrap:wrap;gap:6px">${rel.map((r) => `<a class="chip" href="${enlace(r.seccion, r.ficha.id)}">${esc(r.ficha.titulo)}</a>`).join("")}</div>
        </div></div>`;
    }
    pintar(`
      <header class="cab-seccion" data-icono="⏳"><div class="contenedor">
        <p class="migas"><a href="#/">Archivos</a> / Cronología</p>
        <h1 class="titulo-seccion">⏳ Cronología de la saga</h1>
        <p>Más de un siglo de historia: del hongo de Miranda en 1919 a las ruinas de Raccoon City. <span class="chip chip-rojo">● Juego</span> <span class="chip chip-ambar">● Película</span> <span class="chip">○ Historia</span></p>
      </div></header>
      <div class="contenedor crono">${html}</div>`, "Cronología");
  }

  /* ------------------------------ Mapa ------------------------------ */
  function vistaMapa(pestana = "mundo") {
    pintar(`
      <header class="cab-seccion" data-icono="🗺"><div class="contenedor">
        <p class="migas"><a href="#/">Archivos</a> / Mapa</p>
        <h1 class="titulo-seccion">🗺 Mapa de la saga</h1>
        <p>Todas las ubicaciones de los juegos y películas. Muchas son ficticias: su posición es aproximada según lo que cuentan los juegos.</p>
        <div class="mapa-pestanas" role="tablist">
          <button class="chip" role="tab" data-pestana="mundo" aria-selected="${pestana === "mundo"}">🌍 Mundo</button>
          <button class="chip" role="tab" data-pestana="raccoon" aria-selected="${pestana === "raccoon"}">☣ Raccoon City · 1998</button>
        </div>
      </div></header>
      <div class="contenedor mapa-zona">
        <div class="mapa-lienzo" id="mapa-lienzo"></div>
        <div class="mapa-lista" id="mapa-lista"></div>
      </div>`, "Mapa");
    $$("[data-pestana]").forEach((b) => b.addEventListener("click", () => { location.hash = b.dataset.pestana === "mundo" ? "#/mapa" : "#/mapa/raccoon"; }));
    if (pestana === "raccoon") mapaRaccoon(); else mapaMundo();
  }

  function popupHtml(u) {
    return `${u.imagen ? `<img src="${esc(u.imagen)}" alt="">` : ""}<h4>${esc(u.titulo)}</h4>
      <div style="color:#999;font-size:.8rem;margin-bottom:6px">${esc([u.region, u.pais].filter(Boolean).join(" · "))} · ${esc(u.anio || "")}</div>
      <div style="margin-bottom:8px">${esc(u.resumen || "")}</div><a href="${enlace("ubicaciones", u.id)}">Abrir expediente →</a>`;
  }

  function mapaMundo() {
    const lienzo = $("#mapa-lienzo");
    lienzo.innerHTML = '<div id="mapa-mundo"></div><div class="mapa-aviso">○ posición aproximada (lugar ficticio)</div>';
    const lugares = (W.datos.ubicaciones || []).filter((u) => u.mapa !== "raccoon" && u.lat != null);
    const lista = $("#mapa-lista");
    lista.innerHTML = lugares.map((u) => `<button type="button" data-lugar="${esc(u.id)}">📍 ${esc(u.titulo)}<small>${esc(String(u.anio || "").slice(0, 9))}</small></button>`).join("");

    const montar = () => {
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
      const marcadores = {};
      for (const u of lugares) {
        const soloPeli = !(u.juegos || []).length && (u.peliculas || []).length;
        const icono = L.divIcon({ className: `marcador ${soloPeli ? "peli" : ""}`, html: "<i></i>", iconSize: [26, 26] });
        marcadores[u.id] = L.marker([u.lat, u.lng], { icon: icono, title: u.titulo }).addTo(mapa).bindPopup(popupHtml(u), { maxWidth: 280 });
      }
      lista.addEventListener("click", (e) => {
        const b = e.target.closest("[data-lugar]");
        if (!b) return;
        $$("button", lista).forEach((x) => x.classList.toggle("sel", x === b));
        const u = lugares.find((x) => x.id === b.dataset.lugar);
        mapa.flyTo([u.lat, u.lng], 6, { duration: 1.4 });
        setTimeout(() => marcadores[u.id].openPopup(), 1400);
      });
      setTimeout(() => mapa.invalidateSize(), 200);
    };
    if (window.L) montar(); else addEventListener("load", montar, { once: true });
  }

  function mapaRaccoon() {
    const lienzo = $("#mapa-lienzo");
    const puntos = (W.datos.ubicaciones || []).filter((u) => u.mapa === "raccoon");
    // Plano esquemático de la ciudad (dibujado a mano, 1000×700).
    lienzo.innerHTML = `
      <svg class="raccoon" viewBox="0 0 1000 700" role="img" aria-label="Plano de Raccoon City">
        <defs>
          <radialGradient id="gradExplosion"><stop offset="0" stop-color="#ff6a2a" stop-opacity=".9"/><stop offset=".35" stop-color="#c8102e" stop-opacity=".5"/><stop offset="1" stop-color="#c8102e" stop-opacity="0"/></radialGradient>
          <pattern id="rejillaR" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#111116" stroke-width="1"/></pattern>
        </defs>
        <rect width="1000" height="700" fill="url(#rejillaR)"/>
        <path class="distrito" d="M60 60 L380 50 L420 230 L300 300 L80 280 Z"/>
        <path class="distrito" d="M420 230 L380 50 L760 40 L800 220 L620 260 Z"/>
        <path class="distrito" d="M300 300 L420 230 L620 260 L640 520 L380 560 L280 470 Z"/>
        <path class="distrito" d="M620 260 L800 220 L940 300 L920 560 L640 520 Z"/>
        <path class="distrito" d="M80 280 L300 300 L280 470 L380 560 L320 660 L70 640 Z"/>
        <path class="distrito" d="M380 560 L640 520 L920 560 L940 660 L320 660 Z"/>
        <path class="rio" d="M0 520 C 200 480, 260 600, 420 610 S 700 560, 1000 640"/>
        <path class="calle principal" d="M60 420 L940 380"/><path class="calle principal" d="M520 40 L560 660"/>
        <path class="calle" d="M200 60 L240 660"/><path class="calle" d="M760 40 L800 660"/><path class="calle" d="M60 200 L940 220"/><path class="calle" d="M60 560 L940 520"/>
        <text class="etq-distrito" x="140" y="160">Afueras · Arklay ↑</text>
        <text class="etq-distrito" x="520" y="120">Uptown</text>
        <text class="etq-distrito" x="400" y="330">Centro</text>
        <text class="etq-distrito" x="720" y="470">Downtown</text>
        <text class="etq-distrito" x="120" y="520">Distrito industrial</text>
        <text class="etq-distrito" x="560" y="640">Subsuelo · NEST</text>
        <circle class="explosion" cx="520" cy="380" r="330"/>
        ${puntos.map((u) => `<g class="punto" data-lugar="${esc(u.id)}" tabindex="0" role="button" aria-label="${esc(u.titulo)}">
          <circle class="o" cx="${u.x}" cy="${u.y}" r="9"/><circle class="n" cx="${u.x}" cy="${u.y}" r="8"/>
          <text x="${u.x + 14}" y="${u.y + 5}">${esc(u.titulo)}</text></g>`).join("")}
      </svg>
      <div class="mapa-aviso">☢ Zona cero · misil del 1 de octubre de 1998</div>
      <div class="mapa-ficha" id="mapa-ficha" hidden></div>`;
    const lista = $("#mapa-lista");
    lista.innerHTML = puntos.map((u) => `<button type="button" data-lugar="${esc(u.id)}">☣ ${esc(u.titulo)}</button>`).join("");
    const ficha = $("#mapa-ficha");
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

  /* ----------------------------- Búsqueda ----------------------------- */
  function normal(s) {
    return String(s || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  }
  function buscarLocal(q, max = 40) {
    const palabras = normal(q).trim().split(/\s+/).filter((w) => w.length > 1);
    if (!palabras.length) return [];
    const res = [];
    for (const f of W.indice.values()) {
      const titulo = normal(f.titulo), resto = normal(`${f.alias || ""} ${f.resumen || ""} ${(f.etiquetas || []).join(" ")}`), cuerpo = normal(JSON.stringify(f.cuerpo || ""));
      let p = 0, todas = true;
      for (const w of palabras) {
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
      <header class="cab-seccion" data-icono="🔎"><div class="contenedor">
        <p class="migas"><a href="#/">Archivos</a> / Búsqueda</p>
        <h1 class="titulo-seccion">🔎 «${esc(q)}»</h1>
        <p>${res.length} expedientes encontrados.</p>
      </div></header>
      <div class="contenedor resultados" style="padding-top:20px">
        ${res.length ? res.map((f) => `<a class="resultado" href="${enlace(f._seccion, f.id)}">
          <div class="tarjeta-img">${imagenFicha(f)}</div>
          <div><small>${esc(NOMBRES_TIPO[f._seccion] || f._seccion)}</small><b>${esc(f.titulo)}</b><span style="color:var(--texto-suave)">${esc(f.resumen || subtituloDe(f)).slice(0, 180)}</span></div></a>`).join("")
          : '<p class="vacio">SIN RESULTADOS. QUIZÁ UMBRELLA LOS BORRÓ.</p>'}
      </div>`, `Buscar: ${q}`);
  }

  function vistaError(msg) {
    pintar(`<div class="error-vista"><h1>ARCHIVO PERDIDO</h1><p>${esc(msg)}</p><a class="btn" href="#/">Volver a los archivos</a></div>`, "Archivo perdido");
  }

  /* =====================================================================
   *  ENRUTADOR
   * =================================================================== */
  function enrutar() {
    const partes = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    cerrarMenu();
    switch (partes[0]) {
      case "": case undefined: return vistaPortada();
      case "s": return vistaSeccion(partes[1]);
      case "f": return vistaFicha(partes[1], partes[2]);
      case "cronologia": return vistaCronologia();
      case "mapa": return vistaMapa(partes[1] === "raccoon" ? "raccoon" : "mundo");
      case "buscar": return vistaBuscar(partes.slice(1).join("/"));
      default: return vistaError("Ruta desconocida.");
    }
  }

  function marcarMenu() {
    const h = location.hash;
    $$(".menu a").forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("activo", href !== "#/" && (h === href || h.startsWith(href + "/") || (href.startsWith("#/s/") && h.startsWith("#/f/" + href.slice(4) + "/"))));
    });
  }

  /* =====================================================================
   *  CABECERA: menú, buscador con sugerencias, ambiente
   * =================================================================== */
  function montarCabecera() {
    $("#marca-logo").innerHTML = Umbra.logo();
    $("#pie-logo").innerHTML = Umbra.logo();
    $("#menu").innerHTML = W.secciones.map((s) => `<a href="${s.id === "cronologia" ? "#/cronologia" : "#/s/" + esc(s.id)}">${esc(s.titulo)}</a>`).join("") + '<a href="#/mapa">Mapa</a>';

    $("#btn-menu").addEventListener("click", () => {
      const abierto = $("#menu").classList.toggle("abierto");
      $("#btn-menu").setAttribute("aria-expanded", String(abierto));
    });

    const input = $("#buscar"), caja = $("#sugerencias");
    let sel = -1;
    const pintarSug = () => {
      const res = buscarLocal(input.value, 8);
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
    $("#buscador").addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value.trim()) { location.hash = `#/buscar/${encodeURIComponent(input.value.trim())}`; caja.hidden = true; input.blur(); }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".buscador")) caja.hidden = true; });
    caja.addEventListener("click", () => { caja.hidden = true; input.value = ""; });

    const bA = $("#btn-ambiente");
    const pintarAmb = () => { bA.textContent = Umbra.Audio.encendido ? "🔊" : "🔇"; bA.setAttribute("aria-pressed", String(Umbra.Audio.encendido)); };
    bA.addEventListener("click", () => { Umbra.Audio.poner(!Umbra.Audio.encendido); pintarAmb(); });
  }
  function cerrarMenu() {
    $("#menu")?.classList.remove("abierto");
    $("#btn-menu")?.setAttribute("aria-expanded", "false");
  }

  /* =====================================================================
   *  INTERACCIONES GLOBALES
   * =================================================================== */
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
    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest?.(".tarjeta");
      if (card && !card.contains(e.relatedTarget)) { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); }
    });
    // Vídeos y etiquetas.
    document.addEventListener("click", (e) => {
      const v = e.target.closest("[data-video]");
      if (v) { abrirVideo(v.dataset.video); return; }
      const b = e.target.closest("[data-buscar]");
      if (b) location.hash = `#/buscar/${encodeURIComponent(b.dataset.buscar)}`;
    });
    $("#visor").addEventListener("click", (e) => { if (e.target.id === "visor" || e.target.closest(".visor-cerrar")) cerrarVideo(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !$("#visor").hidden) cerrarVideo();
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) { e.preventDefault(); $("#buscar").focus(); }
    });
    // Barra de progreso de lectura.
    addEventListener("scroll", () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      $("#barra-progreso").style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    }, { passive: true });
    addEventListener("hashchange", enrutar);
  }

  /* =====================================================================
   *  ARRANQUE
   * =================================================================== */
  async function iniciar() {
    Umbra.iniciar();
    try {
      const estado = await Umbra.api("/api/estado");
      W.vistaAdmin = !!estado.vistaAdmin;
      await cargar();
    } catch (err) {
      main.innerHTML = `<div class="error-vista"><h1>${err.codigo === 503 ? "ACCESO RESTRINGIDO" : "SIN CONEXIÓN"}</h1><p>${esc(err.message)}</p><a class="btn" href="/">Volver al portal</a></div>`;
      $("#marca-logo").innerHTML = Umbra.logo();
      return;
    }
    montarCabecera();
    interacciones();
    if (W.vistaAdmin) document.body.insertAdjacentHTML("beforeend", '<div class="aviso-admin">👁 Vista previa de administrador</div>');
    Umbra.visita("wiki");
    enrutar();
  }

  iniciar();
})();
