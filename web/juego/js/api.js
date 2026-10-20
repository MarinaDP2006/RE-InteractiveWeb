/* ============================================================================
 *  api.js — Comunicación con el servidor (fetch + JSON)
 * ============================================================================
 *  Rutas absolutas bajo /api/juego/ (el juego vive en /juego/ y la API en la
 *  raíz del mismo servidor, tanto en local como en Render).
 * ========================================================================== */

"use strict";

const Api = (() => {
  /**
   * Petición genérica. Lanza un Error con el mensaje del servidor si falla.
   * @param {string} ruta    p. ej. "/api/juego/verificar"
   * @param {object} cuerpo  objeto a enviar como JSON (si se omite → GET)
   */
  async function peticion(ruta, cuerpo) {
    const opciones = cuerpo === undefined
      ? { method: "GET" }
      : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) };

    let respuesta;
    try {
      respuesta = await fetch(ruta, opciones);
    } catch {
      throw new Error("No hay conexión con el servidor de Umbrella.");
    }
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok || datos.ok === false) {
      const e = new Error(datos.error || `Error del servidor (${respuesta.status})`);
      e.codigo = respuesta.status;
      throw e;
    }
    return datos;
  }

  return {
    /** ¿Está vivo el servidor? */
    estado: () => peticion("/api/estado"),

    /** Configuración del juego que gestiona el administrador (archivos activos, vídeos...). */
    config: () => peticion("/api/juego/config"),

    /** Envía la respuesta de un puzzle → {correcto, mensaje} */
    verificar: (puzzle, respuesta) => peticion("/api/juego/verificar", { puzzle, respuesta }),

    /** Guarda la partida (estado = texto JSON) → {id} */
    guardar: (id, estado, nombre) => peticion("/api/juego/guardar", { id: id || null, estado, nombre: nombre || "" }),

    /** Carga una partida por su código → {id, estado} */
    cargar: (id) => peticion(`/api/juego/cargar?id=${encodeURIComponent(id)}`),

    /** Top 10 del ranking → {ranking: [...]} */
    ranking: () => peticion("/api/juego/ranking"),

    /** Registra un superviviente y devuelve el ranking actualizado. */
    enviarRanking: (nombre, segundos, muertes, personaje) => peticion("/api/juego/ranking", { nombre, segundos, muertes, personaje }),

    /** Estadística de visita (no importa si falla). */
    visita: () => peticion("/api/visita", { seccion: "juego" }).catch(() => {})
  };
})();
