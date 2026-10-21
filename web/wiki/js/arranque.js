/* ============================================================================
 *  wiki/js/arranque.js — Puesta en marcha de la wiki (último archivo en cargar)
 * ============================================================================
 *  1. Monta los efectos de ambiente (lluvia, grano, relámpagos).
 *  2. Comprueba si hay sesión de miembro (acceso con Google).
 *  3. Carga todas las fichas, monta la cabecera y pinta la ruta actual.
 * ========================================================================== */
"use strict";

(async () => {
  const { $, esc } = Wiki;
  Umbra.iniciar();
  try {
    await Wiki.miembros.comprobar();
    await Wiki.cargar();
  } catch (err) {
    // El servidor no responde: probablemente no está arrancado.
    $("#contenido").innerHTML = `<div class="error-vista"><h1>SIN CONEXIÓN</h1><p>${esc(err.message)}</p><a class="btn" href="/">Volver al portal</a></div>`;
    $("#marca-logo").innerHTML = Umbra.logo();
    return;
  }
  Wiki.montarCabecera();
  Wiki.miembros.montar();
  Wiki.interacciones();
  Wiki.enrutar();
})();
