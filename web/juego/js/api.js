/* ============================================================================
 *  api.js — Comunicación con el servidor Java (fetch + JSON)
 * ============================================================================
 *
 *  Todas las rutas son RELATIVAS ("api/..."), así la web funciona igual en
 *  http://localhost:8080 que en https://tu-juego.onrender.com o en una subruta.
 * ========================================================================== */

"use strict";

const Api = (() => {
  /**
   * Petición genérica. Lanza un Error con el mensaje del servidor si falla.
   * @param {string} ruta    p. ej. "api/verificar"
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
      throw new Error("No hay conexión con el servidor de Umbrella. ¿Está arrancado el servidor Java?");
    }
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok || datos.ok === false) {
      throw new Error(datos.error || `Error del servidor (${respuesta.status})`);
    }
    return datos;
  }

  return {
    /** ¿Está vivo el servidor? */
    estado: () => peticion("api/estado"),

    /** Envía la respuesta de un puzzle → {correcto, mensaje} */
    verificar: (puzzle, respuesta) => peticion("api/verificar", { puzzle, respuesta }),

    /** Guarda la partida (estado = texto JSON) → {id} */
    guardar: (id, estado) => peticion("api/guardar", { id: id || null, estado }),

    /** Carga una partida por su código → {id, estado} */
    cargar: (id) => peticion(`api/cargar?id=${encodeURIComponent(id)}`),

    /** Top 10 del ranking → {ranking: [...]} */
    ranking: () => peticion("api/ranking"),

    /** Registra un superviviente y devuelve el ranking actualizado. */
    enviarRanking: (nombre, segundos, muertes) => peticion("api/ranking", { nombre, segundos, muertes })
  };
})();
