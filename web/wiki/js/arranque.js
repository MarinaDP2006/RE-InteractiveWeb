/* ============================================================================
 *  wiki/js/arranque.js — Puesta en marcha de la wiki (último archivo en cargar)
 * ============================================================================
 *  1. Monta los efectos de ambiente (lluvia, grano, relámpagos).
 *  2. Comprueba que la wiki está abierta y si hay sesión de miembro.
 *  3. Carga todas las fichas, monta la cabecera y pinta la ruta actual.
 * ========================================================================== */
"use strict";

(async () => {
  const { $, esc, W } = Wiki;
  Umbra.iniciar();
  try {
    // /api/estado dice si el administrador está en «Ver como admin».
    const estado = await Umbra.api("/api/estado");
    W.vistaAdmin = !!estado.vistaAdmin;
    await Wiki.miembros.comprobar();
    await Wiki.cargar();
  } catch (err) {
    // 503 = la wiki está cerrada por mantenimiento; otro error = sin conexión.
    $("#contenido").innerHTML = `<div class="error-vista"><h1>${err.codigo === 503 ? "ACCESO RESTRINGIDO" : "SIN CONEXIÓN"}</h1><p>${esc(err.message)}</p><a class="btn" href="/">Volver al portal</a></div>`;
    $("#marca-logo").innerHTML = Umbra.logo();
    return;
  }
  Wiki.montarCabecera();
  Wiki.miembros.montar();
  Wiki.interacciones();
  if (W.vistaAdmin) document.body.insertAdjacentHTML("beforeend", '<div class="aviso-admin">Vista previa de administrador</div>');
  // Cuenta la visita para las estadísticas del panel de administración.
  Umbra.visita("wiki");
  Wiki.enrutar();
})();
