/* ============================================================================
 *  wiki/js/miembros.js — «Únete para ver lo oculto» (acceso con Google)
 * ============================================================================
 *  · Pregunta al servidor si hay sesión de miembro y qué id de Google usar.
 *  · Cualquier elemento con el atributo data-unirse abre la ventana de acceso,
 *    que muestra el botón oficial de Google.
 *  · Al entrar, el servidor valida el token de Google, deja una cookie de
 *    sesión y la wiki vuelve a cargar los datos (ya con lo oculto).
 *  · El botón de la cabecera cambia a «Salir» cuando hay sesión.
 * ========================================================================== */
"use strict";

(() => {
  const { $, esc, W } = Wiki;
  let clienteGoogle = "";   // id de cliente OAuth (vacío = acceso no configurado)
  let googleListo = null;   // promesa de carga de la librería de Google

  /** Consulta la sesión actual al servidor. */
  async function comprobar() {
    try {
      const r = await Umbra.api("/api/miembro");
      W.miembro = r.miembro || null;
      clienteGoogle = r.google || "";
    } catch {
      W.miembro = null;
    }
  }

  /** Carga una sola vez la librería «Sign in with Google». */
  function cargarGoogle() {
    googleListo = googleListo || new Promise((ok, mal) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = ok;
      s.onerror = mal;
      document.head.appendChild(s);
    });
    return googleListo;
  }

  /** Google devuelve aquí el token tras elegir la cuenta: se envía al servidor. */
  async function alEntrar(respuesta) {
    try {
      await Umbra.api("/api/miembro/google", { credential: respuesta.credential });
      cerrar();
      await comprobar();
      // Vuelve a pedir los datos: ahora llegan también los expedientes ocultos.
      await Wiki.cargar();
      pintarBoton();
      Wiki.enrutar();
    } catch (e) {
      $("#unirse-aviso").textContent = e.message;
    }
  }

  /** Abre la ventana de acceso con el botón de Google. */
  async function abrir() {
    const caja = $("#unirse");
    caja.hidden = false;
    $("#unirse-aviso").textContent = "";
    const destino = $("#google-boton");
    destino.innerHTML = "";
    if (!clienteGoogle) {
      // Sin configurar en el servidor: no hay botón que mostrar.
      $("#unirse-aviso").textContent = "Acceso no disponible en este momento.";
      return;
    }
    try {
      await cargarGoogle();
      google.accounts.id.initialize({ client_id: clienteGoogle, callback: alEntrar });
      google.accounts.id.renderButton(destino, { theme: "filled_black", size: "large", shape: "pill", text: "continue_with", locale: "es" });
    } catch {
      $("#unirse-aviso").textContent = "No se pudo conectar con Google.";
    }
  }

  /** Cierra la ventana de acceso. */
  function cerrar() {
    $("#unirse").hidden = true;
  }

  /** Cierra la sesión del miembro y recarga los datos sin lo oculto. */
  async function salir() {
    try {
      await Umbra.api("/api/miembro/salir", {});
    } catch (e) {
      const aviso = $("#unirse-aviso");
      if (aviso) aviso.textContent = "No se pudo cerrar la sesión. Inténtalo de nuevo.";
      abrir();
      return;
    }
    if (window.google?.accounts?.id) google.accounts.id.disableAutoSelect();
    W.miembro = null;
    await Wiki.cargar();
    pintarBoton();
    Wiki.enrutar();
  }

  /** Botón de la cabecera: «Únete» sin sesión, «Salir» con sesión. */
  function pintarBoton() {
    const b = $("#btn-unirse");
    if (!b) return;
    if (W.miembro) {
      b.innerHTML = `${W.miembro.foto ? `<img src="${esc(W.miembro.foto)}" alt="" referrerpolicy="no-referrer">` : ""}<span>Salir</span>`;
      b.title = W.miembro.nombre || "";
      b.dataset.accion = "salir";
    } else {
      b.innerHTML = "<span>Únete</span>";
      b.title = "Únete para ver lo oculto";
      b.dataset.accion = "unirse";
    }
  }

  /** Conecta los clics: [data-unirse], el botón de la cabecera y el cierre de la ventana. */
  function montar() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-unirse]")) { e.preventDefault(); abrir(); return; }
      const b = e.target.closest("#btn-unirse");
      if (b) { if (b.dataset.accion === "salir") salir(); else abrir(); return; }
      if (e.target.id === "unirse" || e.target.closest(".unirse-cerrar")) cerrar();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#unirse").hidden) cerrar(); });
    $("#unirse-logo").innerHTML = Umbra.logo();
    pintarBoton();
  }

  Wiki.miembros = { comprobar, montar, abrir };
})();
