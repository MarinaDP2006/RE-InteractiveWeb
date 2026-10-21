/* ============================================================================
 *  wiki/js/nucleo.js — Estado compartido y utilidades de la wiki
 * ============================================================================
 *  Es el primer archivo que se carga. Crea el objeto global «Wiki», donde el
 *  resto de archivos (piezas, vistas, cabecera, miembros, arranque) dejan y
 *  leen sus funciones. Aquí viven:
 *    · Atajos del DOM ($, $$) y el escapado de HTML.
 *    · El estado: secciones, fichas por sección e índices para enlazarlas.
 *    · La carga de datos desde la API.
 *    · pintar(): pone una vista en la página.
 * ========================================================================== */
"use strict";

const Wiki = (() => {
  // Atajos para buscar elementos: $ devuelve uno, $$ devuelve una lista.
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // Escapa texto antes de meterlo en HTML (evita inyectar código).
  const esc = Umbra.esc;

  /** Estado global de la wiki. */
  const W = {
    secciones: [],       // [{id, titulo, descripcion}] en el orden del menú
    portada: {},         // textos de la portada (título, lema, intro, destacados)
    datos: {},           // id de sección → lista de fichas ordenadas
    indice: new Map(),   // "seccion/id" → ficha
    porId: new Map(),    // id → {seccion, ficha} (primera coincidencia)
    vistaAdmin: false,   // el administrador está viendo la web («Ver como admin»)
    miembro: null        // datos del miembro con sesión de Google, o null
  };

  /** Nombre en singular de cada sección (para etiquetas y resultados). */
  const NOMBRES_TIPO = { juegos: "Juego", peliculas: "Película", personajes: "Personaje", criaturas: "Criatura", virus: "Agente", organizaciones: "Organización", ubicaciones: "Ubicación", cronologia: "Evento" };

  /** Pide a la API las secciones y todas sus fichas, y construye los índices. */
  async function cargar() {
    const r = await Umbra.api("/api/wiki");
    W.secciones = r.secciones || [];
    W.portada = r.portada || {};
    W.datos = {};
    W.indice.clear();
    W.porId.clear();
    // Todas las secciones se piden a la vez para tardar menos.
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

  /** ¿Es una ficha oculta que este visitante no puede ver? (llega sin título) */
  const sellada = (f) => !!(f && f.oculto && !f.titulo);

  /** Busca una ficha visible: primero en la sección indicada y si no, en cualquiera. */
  function resolver(id, seccionPreferida) {
    if (!id) return null;
    let r = null;
    if (seccionPreferida && W.indice.has(`${seccionPreferida}/${id}`)) r = { seccion: seccionPreferida, ficha: W.indice.get(`${seccionPreferida}/${id}`) };
    else r = W.porId.get(id) || null;
    // Las fichas selladas no se enlazan desde otras fichas.
    return r && !sellada(r.ficha) ? r : null;
  }

  /** Datos de una sección por su id. */
  const seccion = (id) => W.secciones.find((s) => s.id === id);
  /** Enlace (hash) a una ficha. */
  const enlace = (sec, id) => `#/f/${encodeURIComponent(sec)}/${encodeURIComponent(id)}`;
  /** Ruta (hash) de una sección: la cronología tiene vista propia. */
  const rutaSeccion = (id) => (id === "cronologia" ? "#/cronologia" : "#/s/" + encodeURIComponent(id));

  /** Texto sin tildes y en minúsculas, para comparar en búsquedas y filtros. */
  function normal(s) {
    return String(s || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  }

  /** Pinta una vista en <main>, cambia el título de la pestaña y sube arriba. */
  function pintar(html, titulo) {
    const main = $("#contenido");
    main.innerHTML = `<div class="vista">${html}</div>`;
    document.title = titulo ? `${titulo} · Umbrella Archives` : "Umbrella Archives";
    scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    // Activa la animación de aparición de los bloques nuevos.
    Umbra.observarRevelar(main);
    Wiki.marcarMenu();
  }

  /** Pequeños iconos en SVG (la web no usa emojis). */
  const ICONOS = {
    play: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>',
    candado: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    sonido: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    silencio: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2"/></svg>',
    menu: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2"/></svg>'
  };

  // Lo que se comparte con el resto de archivos de la wiki.
  return { $, $$, esc, W, NOMBRES_TIPO, ICONOS, cargar, sellada, resolver, seccion, enlace, rutaSeccion, normal, pintar };
})();
