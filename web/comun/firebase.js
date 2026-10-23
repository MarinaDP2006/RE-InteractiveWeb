// Conexión con Firebase (Firestore + Authentication) y datos de la wiki.
// Es el único sitio donde va la configuración: las páginas importan este módulo.
//
// Mientras la configuración tenga los marcadores "TU_...", la web funciona igual
// usando los datos de SEMILLA (sin conexión). Al rellenarla, lee de Firestore.

const VERSION_SDK = "10.12.2";
const CDN = `https://www.gstatic.com/firebasejs/${VERSION_SDK}`;

// Pega aquí los datos de "Configuración del SDK" de tu proyecto de Firebase
// (Consola > Configuración del proyecto > Tus apps > Web). No son secretos:
// la seguridad la ponen las reglas de Firestore, no esta clave.
export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "archivos-umbrella",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "1:709530308208:web:73ddfba0b4db877d35aeb5"
};

export const configurado = !firebaseConfig.apiKey.startsWith("TU_");

// Colecciones públicas de la wiki: nombre en Firestore → título visible.
export const COLECCIONES = {
  juegos: "Juegos",
  personajes: "Personajes",
  criaturas: "Bestiario",
  virus: "Virus y parásitos",
  organizaciones: "Organizaciones",
  lugares: "Ubicaciones",
  peliculas: "Películas y series",
  cronologia: "Cronología"
};

// Etiquetas de los campos propios de cada colección (se muestran en la ficha).
export const CAMPOS = {
  juegos: { anio: "Año", plataforma: "Plataforma original", protagonistas: "Protagonistas", ambientacion: "Ambientación" },
  personajes: { primeraAparicion: "Primera aparición", afiliacion: "Afiliación", estado: "Estado", nacimiento: "Nacimiento" },
  criaturas: { origen: "Origen", primeraAparicion: "Primera aparición", peligrosidad: "Peligrosidad (1-5)" },
  virus: { tipo: "Tipo", creador: "Creador", primeraAparicion: "Primera aparición" },
  organizaciones: { tipo: "Tipo", fundacion: "Fundación", lider: "Figuras clave", estado: "Estado" },
  lugares: { region: "Región", primeraAparicion: "Primera aparición", anio: "Año de los hechos" },
  peliculas: { anio: "Estreno", formato: "Formato", protagonistas: "Protagonistas" },
  cronologia: { periodo: "Periodo", juego: "Juego" }
};

// ---------- Conexión (se carga solo si hay configuración) ----------

let conexion = null;

export function conectar() {
  if (!configurado) return Promise.resolve(null);
  if (!conexion) {
    conexion = Promise.all([
      import(`${CDN}/firebase-app.js`),
      import(`${CDN}/firebase-firestore.js`),
      import(`${CDN}/firebase-auth.js`)
    ]).then(([appSdk, fs, authSdk]) => {
      const app = appSdk.initializeApp(firebaseConfig);
      return { app, fs, authSdk, db: fs.getFirestore(app), auth: authSdk.getAuth(app) };
    });
  }
  return conexion;
}

// Evita que una página se quede esperando si Firestore no responde.
function conLimite(promesa, ms = 6000) {
  return Promise.race([promesa, new Promise((_, rechazar) => setTimeout(() => rechazar(new Error("Tiempo de espera agotado")), ms))]);
}

// ---------- Lectura de la wiki ----------

// Devuelve los documentos de una colección ordenados por "orden".
// Si Firestore no está configurado, falla o está vacío, usa SEMILLA.
export async function leerColeccion(nombre) {
  const c = await conectar().catch(() => null);
  if (c) {
    try {
      const { collection, getDocs, query, orderBy } = c.fs;
      const resultado = await conLimite(getDocs(query(collection(c.db, nombre), orderBy("orden"))));
      if (!resultado.empty) return resultado.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.warn(`[Firestore] No se pudo leer "${nombre}", se usan los datos locales.`, error);
    }
  }
  return (SEMILLA[nombre] || []).map(d => ({ ...d }));
}

export async function leerDocumento(nombre, id) {
  const c = await conectar().catch(() => null);
  if (c) {
    try {
      const { doc, getDoc } = c.fs;
      const d = await conLimite(getDoc(doc(c.db, nombre, id)));
      if (d.exists()) return { id: d.id, ...d.data() };
    } catch (error) {
      console.warn(`[Firestore] No se pudo leer "${nombre}/${id}", se usan los datos locales.`, error);
    }
  }
  return (SEMILLA[nombre] || []).find(d => d.id === id) || null;
}

// Expedientes clasificados: solo existen en Firestore y las reglas exigen sesión.
export async function leerExpedientes() {
  const c = await conectar();
  if (!c) return [];
  const { collection, getDocs, query, orderBy } = c.fs;
  const resultado = await getDocs(query(collection(c.db, "expedientes"), orderBy("orden")));
  return resultado.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ---------- Usuarios ----------

// Resuelve con el usuario actual (o null) cuando Firebase sabe si hay sesión.
export async function usuarioActual() {
  const c = await conectar().catch(() => null);
  if (!c) return null;
  return new Promise(resolver => {
    const parar = c.authSdk.onAuthStateChanged(c.auth, usuario => { parar(); resolver(usuario); });
  });
}

// Crea o actualiza usuarios/{uid}. "rol" solo se escribe al crear y siempre
// como "miembro": las reglas rechazan cualquier otro valor o cambio posterior.
export async function guardarUsuario(usuario) {
  const c = await conectar();
  if (!c || !usuario) return;
  const { doc, getDoc, setDoc, serverTimestamp } = c.fs;
  const ref = doc(c.db, "usuarios", usuario.uid);
  const datos = {
    nombre: usuario.displayName || "",
    email: usuario.email || "",
    foto: usuario.photoURL || "",
    proveedor: usuario.providerData[0]?.providerId || "password",
    ultimoAcceso: serverTimestamp()
  };
  const existe = (await getDoc(ref)).exists();
  if (existe) await setDoc(ref, datos, { merge: true });
  else await setDoc(ref, { uid: usuario.uid, ...datos, rol: "miembro", creado: serverTimestamp() });
}

export async function esAdmin(usuario) {
  const c = await conectar();
  if (!c || !usuario) return false;
  const d = await c.fs.getDoc(c.fs.doc(c.db, "usuarios", usuario.uid));
  return d.exists() && d.data().rol === "admin";
}

// Copia SEMILLA a Firestore. Solo funciona con una cuenta con rol "admin".
export async function sembrarDatos() {
  const c = await conectar();
  if (!c) throw new Error("Firebase no está configurado en web/comun/firebase.js");
  const { writeBatch, doc } = c.fs;
  const lote = writeBatch(c.db);
  let total = 0;
  for (const [nombre, documentos] of Object.entries(SEMILLA)) {
    for (const { id, ...datos } of documentos) {
      lote.set(doc(c.db, nombre, id), datos);
      total++;
    }
  }
  await lote.commit();
  return total;
}

// ---------- Pintado en las páginas ----------

// Las rutas de imagen se guardan desde web/ ("img/..."); las páginas están en web/wiki/.
export const rutaImagen = ruta => (ruta ? `../${ruta}` : "../img/escenarios/re2_vestibulo.webp");

export function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

// Tarjeta con el mismo marcado que las de la maqueta (.proto-card).
export function tarjeta(item, coleccion, etiqueta) {
  const art = crear("article", "proto-card");
  const img = crear("div", "proto-img");
  img.style.setProperty("--img", `url('${rutaImagen(item.imagen)}')`);
  img.setAttribute("role", "img");
  img.setAttribute("aria-label", item.nombre);
  const copia = crear("div", "proto-copy");
  const h3 = crear("h3");
  const enlace = crear("a", "", item.nombre);
  enlace.href = `ficha.html?c=${encodeURIComponent(coleccion)}&id=${encodeURIComponent(item.id)}`;
  enlace.style.cssText = "color:inherit;text-decoration:none";
  h3.append(enlace);
  copia.append(crear("span", "proto-tag", etiqueta), h3, crear("p", "", item.resumen));
  art.append(img, copia);
  return art;
}

// Sustituye las tarjetas de muestra de una página por las de la colección.
export async function pintarColeccion(nombre, contenedor = document.querySelector(".proto-grid")) {
  if (!contenedor) return;
  const items = await leerColeccion(nombre);
  if (!items.length) return;
  contenedor.replaceChildren(...items.map((item, i) => tarjeta(item, nombre, `ARCHIVO ${String(i + 1).padStart(3, "0")}`)));
}

// ---------- Datos iniciales de la wiki ----------
// Se usan sin conexión y para cargar Firestore la primera vez (sembrarDatos).
// "id" es el identificador del documento; "orden" decide la posición.

export const SEMILLA = {
  juegos: [
    { id: "re1", orden: 1, nombre: "Resident Evil (1996)", imagen: "img/ilustraciones/ubicaciones/mansion-spencer.svg",
      resumen: "El origen de la saga: el equipo Alpha de S.T.A.R.S. queda atrapado en la Mansión Spencer.",
      descripcion: "Julio de 1998. Tras la desaparición del equipo Bravo en las montañas Arklay, el equipo Alpha de S.T.A.R.S. se refugia en una mansión aislada. Chris Redfield y Jill Valentine descubren que es la fachada de un laboratorio de Umbrella donde se experimenta con el Virus-T.",
      anio: 1996, plataforma: "PlayStation", protagonistas: ["Chris Redfield", "Jill Valentine"], ambientacion: "Mansión Spencer, montañas Arklay (1998)" },
    { id: "re0", orden: 2, nombre: "Resident Evil 0", imagen: "img/ilustraciones/ubicaciones/ecliptic-express.svg",
      resumen: "Precuela directa: Rebecca Chambers y Billy Coen sobreviven al tren Ecliptic Express.",
      descripcion: "Horas antes de los hechos de la mansión, la novata del equipo Bravo, Rebecca Chambers, se une al exmarine Billy Coen. Juntos recorren el Ecliptic Express y el centro de formación de Umbrella, donde descubren a James Marcus, uno de los fundadores de la compañía.",
      anio: 2002, plataforma: "Nintendo GameCube", protagonistas: ["Rebecca Chambers", "Billy Coen"], ambientacion: "Ecliptic Express y centro de formación de Umbrella (1998)" },
    { id: "re2", orden: 3, nombre: "Resident Evil 2", imagen: "img/escenarios/re2.webp",
      resumen: "Leon y Claire llegan a una Raccoon City devorada por el brote del Virus-T.",
      descripcion: "Septiembre de 1998. En su primer día como policía, Leon S. Kennedy coincide con Claire Redfield, que busca a su hermano Chris. La comisaría R.P.D. y los laboratorios subterráneos de Umbrella esconden el Virus-G de William Birkin.",
      anio: 1998, plataforma: "PlayStation", protagonistas: ["Leon S. Kennedy", "Claire Redfield"], ambientacion: "Raccoon City (1998)" },
    { id: "re3", orden: 4, nombre: "Resident Evil 3", imagen: "img/escenarios/re3.webp",
      resumen: "Jill Valentine intenta escapar de Raccoon City mientras Nemesis la persigue.",
      descripcion: "Jill Valentine, superviviente de la mansión, trata de huir de la ciudad con la ayuda del mercenario Carlos Oliveira. Umbrella envía a Nemesis para eliminar a los miembros de S.T.A.R.S. antes de que el gobierno destruya Raccoon City.",
      anio: 1999, plataforma: "PlayStation", protagonistas: ["Jill Valentine", "Carlos Oliveira"], ambientacion: "Raccoon City (1998)" },
    { id: "re4", orden: 5, nombre: "Resident Evil 4", imagen: "img/escenarios/re4.webp",
      resumen: "Leon viaja a un pueblo de España para rescatar a la hija del presidente.",
      descripcion: "2004. Leon, ya agente del gobierno, busca a Ashley Graham en una región rural de España. Los aldeanos están controlados por Las Plagas, el parásito de la secta Los Iluminados liderada por Osmund Saddler.",
      anio: 2005, plataforma: "Nintendo GameCube", protagonistas: ["Leon S. Kennedy", "Ada Wong"], ambientacion: "Pueblo de España, castillo e isla (2004)" },
    { id: "re8", orden: 6, nombre: "Resident Evil Village", imagen: "img/escenarios/re8.webp",
      resumen: "Ethan Winters busca a su hija Rose en una aldea de Europa del Este.",
      descripcion: "2021. Tras el secuestro de Rose, Ethan Winters llega a una aldea dominada por Madre Miranda y sus cuatro señores, entre ellos Lady Dimitrescu. El poder de todos ellos procede del Megamiceto, el origen del Moho.",
      anio: 2021, plataforma: "PlayStation 5, Xbox Series X|S, PC", protagonistas: ["Ethan Winters"], ambientacion: "Aldea de Europa del Este (2021)" }
  ],
  personajes: [
    { id: "leon", orden: 1, nombre: "Leon S. Kennedy", imagen: "img/retratos/leon.webp",
      resumen: "Policía novato en Raccoon City y después agente especial del gobierno de EE. UU.",
      descripcion: "Leon sobrevivió a su primer día como agente de la R.P.D. durante el brote de Raccoon City. El gobierno lo reclutó y lo entrenó como agente especial: rescató a Ashley Graham en España y ha combatido el bioterrorismo por todo el mundo.",
      primeraAparicion: "Resident Evil 2", afiliacion: "R.P.D., gobierno de EE. UU. (DSO)", estado: "Vivo", nacimiento: 1977 },
    { id: "jill", orden: 2, nombre: "Jill Valentine", imagen: "img/retratos/jill.webp",
      resumen: "Miembro de S.T.A.R.S., superviviente de la mansión y de Raccoon City.",
      descripcion: "Experta en desactivar explosivos y forzar cerraduras, Jill sobrevivió a la Mansión Spencer y escapó de Raccoon City perseguida por Nemesis. Más tarde fue una de las fundadoras de la BSAA.",
      primeraAparicion: "Resident Evil (1996)", afiliacion: "S.T.A.R.S., BSAA", estado: "Viva", nacimiento: 1974 },
    { id: "chris", orden: 3, nombre: "Chris Redfield", imagen: "img/retratos/chris.webp",
      resumen: "Miembro de S.T.A.R.S. que dedicó su vida a acabar con Umbrella y el bioterrorismo.",
      descripcion: "Expiloto de las fuerzas aéreas, Chris formaba parte del equipo Alpha. Tras la mansión persiguió a Umbrella por todo el mundo, cofundó la BSAA y se enfrentó a Albert Wesker en África.",
      primeraAparicion: "Resident Evil (1996)", afiliacion: "S.T.A.R.S., BSAA", estado: "Vivo", nacimiento: 1973 },
    { id: "claire", orden: 4, nombre: "Claire Redfield", imagen: "img/retratos/claire.webp",
      resumen: "Hermana de Chris; llegó a Raccoon City buscándolo y acabó luchando contra el bioterrorismo.",
      descripcion: "Universitaria y motorista, Claire sobrevivió a Raccoon City junto a Leon y protegió a Sherry Birkin. Después se infiltró en las instalaciones de Umbrella y trabajó en la ONG TerraSave ayudando a víctimas de ataques biológicos.",
      primeraAparicion: "Resident Evil 2", afiliacion: "TerraSave", estado: "Viva", nacimiento: 1979 },
    { id: "ada", orden: 5, nombre: "Ada Wong", imagen: "img/retratos/ada.webp",
      resumen: "Espía misteriosa que aparece siempre donde hay una muestra valiosa.",
      descripcion: "Ada se infiltró en Raccoon City para robar una muestra del Virus-G y desde entonces trabaja para clientes que nunca revela. Sus caminos se cruzan una y otra vez con los de Leon.",
      primeraAparicion: "Resident Evil 2", afiliacion: "Independiente", estado: "Viva", nacimiento: "Desconocido" },
    { id: "wesker", orden: 6, nombre: "Albert Wesker", imagen: "img/retratos/wesker.webp",
      resumen: "Capitán de S.T.A.R.S. e investigador de Umbrella que traicionó a su equipo.",
      descripcion: "Wesker llevó a su propio equipo a la mansión para recoger datos de combate de las bioarmas. Sobrevivió gracias a un virus experimental y años después, con Tricell, intentó liberar el Uroboros en todo el planeta. Murió en África en 2009.",
      primeraAparicion: "Resident Evil (1996)", afiliacion: "Umbrella, S.T.A.R.S., Tricell", estado: "Fallecido (2009)", nacimiento: 1960 }
  ],
  criaturas: [
    { id: "zombi", orden: 1, nombre: "Zombi", imagen: "img/retratos/zombi.webp",
      resumen: "Persona infectada por el Virus-T que ha perdido la razón y solo busca alimentarse.",
      descripcion: "El Virus-T destruye la mayor parte del cerebro y deja al huésped con un hambre constante. Son lentos pero resistentes y se cuentan por miles tras un brote como el de Raccoon City.",
      origen: "Virus-T", primeraAparicion: "Resident Evil (1996)", peligrosidad: 2 },
    { id: "licker", orden: 2, nombre: "Licker", imagen: "img/retratos/licker.webp",
      resumen: "Zombi mutado, ciego y con una lengua larga y afilada como arma.",
      descripcion: "Cuando un zombi sigue mutando, pierde la piel y los ojos y desarrolla un cerebro expuesto y unas garras enormes. Caza guiándose por el sonido, así que caminar despacio puede salvarte.",
      origen: "Virus-T", primeraAparicion: "Resident Evil 2", peligrosidad: 3 },
    { id: "tyrant", orden: 3, nombre: "Tyrant", imagen: "img/retratos/mrx.webp",
      resumen: "Bioarma humanoide de Umbrella diseñada como soldado perfecto.",
      descripcion: "Los Tyrant se crean infectando con Virus-T a personas seleccionadas genéticamente. El modelo T-103, conocido como Mr. X, persigue a Leon y Claire por la comisaría de Raccoon City.",
      origen: "Virus-T", primeraAparicion: "Resident Evil (1996)", peligrosidad: 4 },
    { id: "nemesis", orden: 4, nombre: "Nemesis", imagen: "img/retratos/nemesis.webp",
      resumen: "Tyrant controlado por un parásito y enviado a eliminar a los miembros de S.T.A.R.S.",
      descripcion: "Nemesis es un Tyrant al que se implantó el parásito NE-α, que le da inteligencia para usar armas y seguir órdenes. Su objetivo en Raccoon City es acabar con Jill Valentine.",
      origen: "Virus-T y parásito NE-α", primeraAparicion: "Resident Evil 3", peligrosidad: 5 },
    { id: "ganados", orden: 5, nombre: "Ganados", imagen: "img/retratos/ganado.webp",
      resumen: "Aldeanos controlados por Las Plagas que conservan su inteligencia.",
      descripcion: "A diferencia de los zombis, los Ganados hablan, se organizan y usan herramientas. Obedecen a Los Iluminados porque el parásito de su cuerpo responde a una Plaga dominante.",
      origen: "Las Plagas", primeraAparicion: "Resident Evil 4", peligrosidad: 2 },
    { id: "regenerador", orden: 6, nombre: "Regenerador", imagen: "img/retratos/regenerador.webp",
      resumen: "Criatura capaz de regenerar cualquier herida mientras sus Plagas sigan vivas.",
      descripcion: "Creado en el laboratorio de la isla de Los Iluminados, el Regenerador solo cae si se destruyen las Plagas que lleva en el cuerpo, que se ven con una mira térmica. Su respiración se oye antes de verlo.",
      origen: "Las Plagas", primeraAparicion: "Resident Evil 4", peligrosidad: 4 }
  ],
  virus: [
    { id: "virus-t", orden: 1, nombre: "Virus-T", imagen: "img/ilustraciones/virus/t-virus.svg",
      resumen: "El virus de Umbrella que convirtió Raccoon City en una ciudad de muertos.",
      descripcion: "Desarrollado a partir del virus Progenitor, el Virus-T (Tyrant) reactiva las células muertas y provoca mutaciones. Su fuga en la Mansión Spencer y después en Raccoon City dio inicio a la saga.",
      tipo: "Virus", creador: "James Marcus / Umbrella", primeraAparicion: "Resident Evil (1996)" },
    { id: "virus-g", orden: 2, nombre: "Virus-G", imagen: "img/ilustraciones/virus/g-virus.svg",
      resumen: "Creación de William Birkin que provoca mutaciones casi ilimitadas.",
      descripcion: "El Virus-G hace que el huésped evolucione sin parar y pueda reproducirse implantando embriones en otros seres. Birkin se lo inyectó a sí mismo para no entregarlo a Umbrella.",
      tipo: "Virus", creador: "William Birkin", primeraAparicion: "Resident Evil 2" },
    { id: "virus-c", orden: 3, nombre: "Virus-C", imagen: "img/ilustraciones/virus/c-virus.svg",
      resumen: "Virus de Neo-Umbrella responsable de los ataques mundiales de 2013.",
      descripcion: "Creado por Carla Radames a partir de los virus T-Veronica y G, el Virus-C puede producir zombis, J'avo o crisálidas. Fue usado en Tall Oaks y Lanshiang.",
      tipo: "Virus", creador: "Carla Radames / Neo-Umbrella", primeraAparicion: "Resident Evil 6" },
    { id: "uroboros", orden: 4, nombre: "Uroboros", imagen: "img/ilustraciones/virus/uroboros.svg",
      resumen: "El virus con el que Wesker quería elegir a los supervivientes de la humanidad.",
      descripcion: "Creado a partir de la flor de las Escaleras del Sol, el Uroboros destruye a quien no es compatible con él y da un enorme poder a los pocos que lo son. Wesker planeaba dispersarlo con misiles.",
      tipo: "Virus", creador: "Albert Wesker / Tricell", primeraAparicion: "Resident Evil 5" },
    { id: "plagas", orden: 5, nombre: "Las Plagas", imagen: "img/ilustraciones/virus/las-plagas.svg",
      resumen: "Parásito antiguo que permite controlar a las personas infectadas.",
      descripcion: "Las Plagas estuvieron encerradas bajo un castillo español durante siglos. Los Iluminados las recuperaron para controlar a los aldeanos y planeaban infectar al gobierno de EE. UU. a través de Ashley Graham.",
      tipo: "Parásito", creador: "Los Iluminados (Osmund Saddler)", primeraAparicion: "Resident Evil 4" },
    { id: "moho", orden: 6, nombre: "Moho", imagen: "img/ilustraciones/virus/moho-e.svg",
      resumen: "Hongo con memoria procedente del Megamiceto, origen de los horrores de Luisiana y la aldea.",
      descripcion: "El Moho, o Mutamiceto, guarda la información de los seres que absorbe y permite regenerarse o cambiar de forma. Madre Miranda lo estudió durante un siglo y de él nació Eveline.",
      tipo: "Hongo", creador: "Megamiceto (natural) / Madre Miranda", primeraAparicion: "Resident Evil 7" }
  ],
  organizaciones: [
    { id: "umbrella", orden: 1, nombre: "Umbrella Corporation", imagen: "img/ilustraciones/organizaciones/umbrella.svg",
      resumen: "Farmacéutica que escondía un programa secreto de armas biológicas.",
      descripcion: "Fundada por Oswell E. Spencer, Edward Ashford y James Marcus, Umbrella vendía medicamentos mientras desarrollaba el Virus-T y bioarmas. Tras el desastre de Raccoon City, quebró en 2003.",
      tipo: "Corporación farmacéutica", fundacion: 1968, lider: "Oswell E. Spencer", estado: "Disuelta (2003)" },
    { id: "stars", orden: 2, nombre: "S.T.A.R.S.", imagen: "img/ilustraciones/organizaciones/stars.svg",
      resumen: "Unidad de operaciones especiales de la policía de Raccoon City.",
      descripcion: "Special Tactics And Rescue Service. Sus equipos Alpha y Bravo investigaron los asesinatos de las montañas Arklay y descubrieron la verdad sobre Umbrella. Su capitán, Albert Wesker, los traicionó.",
      tipo: "Unidad policial", fundacion: "Años 60", lider: "Albert Wesker (capitán)", estado: "Disuelta (1998)" },
    { id: "bsaa", orden: 3, nombre: "BSAA", imagen: "img/ilustraciones/organizaciones/bsaa.svg",
      resumen: "Alianza internacional contra el bioterrorismo.",
      descripcion: "La Bioterrorism Security Assessment Alliance nació para responder a los ataques con armas biológicas tras la caída de Umbrella. Chris Redfield y Jill Valentine estuvieron entre sus primeros miembros.",
      tipo: "Organización antiterrorista", fundacion: 2003, lider: "Chris Redfield, Jill Valentine", estado: "Activa" },
    { id: "iluminados", orden: 4, nombre: "Los Iluminados", imagen: "img/escenarios/re4_castillo.webp",
      resumen: "Secta religiosa española que controla Las Plagas.",
      descripcion: "Liderada por Osmund Saddler, la secta recuperó Las Plagas de los sótanos del castillo de Ramón Salazar y las usó para someter al pueblo. Su objetivo era dominar el mundo infectando a los poderosos.",
      tipo: "Secta religiosa", fundacion: "Siglos atrás", lider: "Osmund Saddler", estado: "Desmantelada (2004)" },
    { id: "tricell", orden: 5, nombre: "Tricell", imagen: "img/ilustraciones/organizaciones/tricell.svg",
      resumen: "Multinacional que heredó la investigación de Umbrella en África.",
      descripcion: "Bajo la dirección de Excella Gionne en su división africana, Tricell financió en secreto el proyecto Uroboros de Albert Wesker. El escándalo de Kijuju la llevó a la ruina.",
      tipo: "Corporación multinacional", fundacion: "Siglo XIX", lider: "Excella Gionne", estado: "En decadencia" },
    { id: "terrasave", orden: 6, nombre: "TerraSave", imagen: "img/ilustraciones/organizaciones/terrasave.svg",
      resumen: "ONG que ayuda a las víctimas del bioterrorismo.",
      descripcion: "TerraSave denuncia a las corporaciones que fabrican armas biológicas y asiste a los supervivientes de los brotes. Claire Redfield es su miembro más conocida.",
      tipo: "ONG", fundacion: "Años 2000", lider: "Claire Redfield", estado: "Activa" }
  ],
  lugares: [
    { id: "raccoon-city", orden: 1, nombre: "Raccoon City", imagen: "img/escenarios/re2_calle.webp",
      resumen: "Ciudad del Medio Oeste de EE. UU. destruida tras el brote del Virus-T.",
      descripcion: "Umbrella era la mayor empresa de la ciudad y tenía bajo ella un laboratorio secreto. En septiembre de 1998 el virus se extendió por todas las calles y el 1 de octubre el gobierno la arrasó con un misil.",
      region: "Medio Oeste, EE. UU.", primeraAparicion: "Resident Evil 2", anio: 1998 },
    { id: "mansion-spencer", orden: 2, nombre: "Mansión Spencer", imagen: "img/ilustraciones/ubicaciones/mansion-spencer.svg",
      resumen: "Mansión llena de trampas que escondía el laboratorio de Arklay.",
      descripcion: "Construida en las montañas Arklay para Oswell E. Spencer, la mansión ocultaba pasadizos, acertijos y un laboratorio subterráneo. Fue destruida en julio de 1998.",
      region: "Montañas Arklay, EE. UU.", primeraAparicion: "Resident Evil (1996)", anio: 1998 },
    { id: "rpd", orden: 3, nombre: "Comisaría R.P.D.", imagen: "img/escenarios/re2_vestibulo.webp",
      resumen: "Comisaría de Raccoon City instalada en un antiguo museo de arte.",
      descripcion: "Su jefe, Brian Irons, la llenó de estatuas, mecanismos y pasadizos. Durante el brote fue refugio y trampa a la vez para Leon y Claire.",
      region: "Raccoon City", primeraAparicion: "Resident Evil 2", anio: 1998 },
    { id: "isla-rockfort", orden: 4, nombre: "Isla Rockfort", imagen: "img/ilustraciones/ubicaciones/isla-rockfort.svg",
      resumen: "Isla prisión de la familia Ashford donde Claire es encarcelada.",
      descripcion: "En la isla había una prisión y un centro de entrenamiento de Umbrella. Un ataque liberó el Virus-T y Claire tuvo que huir junto a Steve Burnside.",
      region: "Hemisferio sur", primeraAparicion: "Resident Evil Code: Veronica", anio: 1998 },
    { id: "pueblo-espana", orden: 5, nombre: "Pueblo de España", imagen: "img/escenarios/re4_plaza.webp",
      resumen: "Aldea rural dominada por Los Iluminados y sus Ganados.",
      descripcion: "Leon llega al pueblo siguiendo la pista de Ashley Graham. De la plaza a la granja, todos los vecinos están infectados por Las Plagas.",
      region: "España", primeraAparicion: "Resident Evil 4", anio: 2004 },
    { id: "castillo-dimitrescu", orden: 6, nombre: "Castillo Dimitrescu", imagen: "img/escenarios/re8_castillo.webp",
      resumen: "Residencia de Lady Dimitrescu y sus tres hijas sobre la aldea.",
      descripcion: "El castillo domina la aldea de Europa del Este. Lady Alcina Dimitrescu, una de las cuatro señoras al servicio de Madre Miranda, caza en sus salones a quien se atreve a entrar.",
      region: "Europa del Este", primeraAparicion: "Resident Evil Village", anio: 2021 }
  ],
  peliculas: [
    { id: "degeneration", orden: 1, nombre: "Resident Evil: Degeneration", imagen: "img/ilustraciones/ubicaciones/harvardville.svg",
      resumen: "Leon y Claire se reencuentran durante un brote en el aeropuerto de Harvardville.",
      descripcion: "Primera película de animación por ordenador de la saga. Un ataque con Virus-T en un aeropuerto lleva a Leon y Claire a descubrir el Virus-G en manos de la farmacéutica WilPharma.",
      anio: 2008, formato: "Película CGI", protagonistas: ["Leon S. Kennedy", "Claire Redfield"] },
    { id: "damnation", orden: 2, nombre: "Resident Evil: Damnation", imagen: "img/ilustraciones/ubicaciones/republica-eslava.svg",
      resumen: "Leon se infiltra en una guerra civil donde se usan Plagas como armas.",
      descripcion: "En la República Eslava, la presidenta Svetlana Belikova controla a sus soldados con Plagas. Leon contará con la ayuda inesperada de Ada Wong.",
      anio: 2012, formato: "Película CGI", protagonistas: ["Leon S. Kennedy", "Ada Wong"] },
    { id: "vendetta", orden: 3, nombre: "Resident Evil: Vendetta", imagen: "img/ilustraciones/ubicaciones/nueva-york.svg",
      resumen: "Chris, Leon y Rebecca intentan detener un ataque viral sobre Nueva York.",
      descripcion: "El traficante de armas Glenn Arias quiere vengarse liberando un nuevo virus en Manhattan. Es la primera película en la que Chris y Leon luchan juntos.",
      anio: 2017, formato: "Película CGI", protagonistas: ["Chris Redfield", "Leon S. Kennedy", "Rebecca Chambers"] },
    { id: "infinite-darkness", orden: 4, nombre: "Infinite Darkness", imagen: "img/ilustraciones/ubicaciones/penamstan.svg",
      resumen: "Serie de Netflix sobre una conspiración en la Casa Blanca en 2006.",
      descripcion: "Un ciberataque a la Casa Blanca y un brote zombi en su interior conectan a Leon y Claire con una conspiración que se remonta a la guerra de Penamstan.",
      anio: 2021, formato: "Serie CGI", protagonistas: ["Leon S. Kennedy", "Claire Redfield"] },
    { id: "death-island", orden: 5, nombre: "Resident Evil: Death Island", imagen: "img/ilustraciones/ubicaciones/alcatraz.svg",
      resumen: "Los cinco grandes héroes de la saga se reúnen en Alcatraz.",
      descripcion: "Un nuevo brote en la isla de Alcatraz reúne por primera vez a Leon, Chris, Jill, Claire y Rebecca para enfrentarse a una amenaza que viaja por el agua.",
      anio: 2023, formato: "Película CGI", protagonistas: ["Leon S. Kennedy", "Chris Redfield", "Jill Valentine", "Claire Redfield", "Rebecca Chambers"] },
    { id: "adaptaciones", orden: 6, nombre: "Adaptaciones cinematográficas", imagen: "img/escenarios/re3_calles.webp",
      resumen: "Las películas de acción real basadas en la saga, de 2002 a 2021.",
      descripcion: "Paul W. S. Anderson dirigió y produjo seis películas con Milla Jovovich como Alice (2002-2016), con una historia propia. En 2021 se estrenó Welcome to Raccoon City, más fiel a los dos primeros juegos.",
      anio: 2002, formato: "Acción real", protagonistas: ["Alice (Milla Jovovich)"] }
  ],
  cronologia: [
    { id: "origenes", orden: 1, nombre: "Orígenes de las investigaciones clandestinas", imagen: "img/ilustraciones/virus/progenitor.svg",
      resumen: "Spencer, Marcus y Ashford descubren el virus Progenitor y fundan Umbrella.",
      descripcion: "En los años sesenta se descubre el virus Progenitor en África. A partir de él, los fundadores de Umbrella inician en secreto la investigación que daría lugar al Virus-T.",
      periodo: "1960-1980", anio: 1966, juego: "Resident Evil 0" },
    { id: "raccoon-1998", orden: 2, nombre: "Incidente de Raccoon City", imagen: "img/escenarios/re2_calle.webp",
      resumen: "El Virus-T escapa de la mansión y arrasa Raccoon City.",
      descripcion: "En julio, S.T.A.R.S. descubre el laboratorio de la Mansión Spencer. En septiembre el virus se extiende por la ciudad y el 1 de octubre de 1998 Raccoon City es destruida.",
      periodo: "1998", anio: 1998, juego: "Resident Evil, Resident Evil 2 y Resident Evil 3" },
    { id: "espana-2004", orden: 3, nombre: "Acontecimientos en España", imagen: "img/escenarios/re4_plaza.webp",
      resumen: "Leon rescata a Ashley Graham de Los Iluminados.",
      descripcion: "Leon viaja a España, se enfrenta a Las Plagas y acaba con Osmund Saddler. Ada Wong se lleva una muestra del parásito.",
      periodo: "2004", anio: 2004, juego: "Resident Evil 4" },
    { id: "luisiana-2017", orden: 4, nombre: "Incidente de Luisiana", imagen: "img/escenarios/re7.webp",
      resumen: "Ethan Winters busca a su mujer en la granja de los Baker.",
      descripcion: "Ethan recibe un mensaje de Mia, desaparecida hace tres años, y llega a una casa de Dulvey donde la familia Baker está controlada por Eveline, un arma biológica creada con el Moho.",
      periodo: "2017", anio: 2017, juego: "Resident Evil 7" },
    { id: "aldea-2021", orden: 5, nombre: "La aldea europea", imagen: "img/escenarios/re8_aldea.webp",
      resumen: "Ethan se enfrenta a Madre Miranda para recuperar a Rose.",
      descripcion: "Tres años después de Luisiana, Ethan persigue a quienes secuestraron a su hija por una aldea gobernada por Madre Miranda y sus cuatro señores.",
      periodo: "2021", anio: 2021, juego: "Resident Evil Village" }
  ]
};
