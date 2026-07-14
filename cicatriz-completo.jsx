import { useState, useEffect } from "react";

// Año actual dinámico — cambia solo cada año (2026, 2027, 2028...)
const ANIO = new Date().getFullYear();

const SUPABASE_URL = "https://deejemkhchkxupqnxakr.supabase.co";
const SUPABASE_KEY = "sb_publishable_yoMN4BHw6Tv_ndSvJ6Zzjg_7qFTFlD4";

const sbFetch = async (path, options = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const validarCodigo = async (codigo, producto) => {
  const data = await sbFetch(`CODIGOS?codigo=eq.${encodeURIComponent(codigo)}&usado=eq.FALSE&select=*`);
  if (!data || data.length === 0) return null;
  const row = data[0];
  if (row.producto !== "all" && row.producto !== producto) return null;
  return row;
};

const buscarAccesoPorEmail = async (email, producto) => {
  const data = await sbFetch(`CODIGOS?email=eq.${encodeURIComponent(email.trim().toLowerCase())}&usado=eq.TRUE&select=producto`);
  if (!data || data.length === 0) return false;
  return data.some(r => r.producto === "all" || r.producto === producto);
};

const marcarCodigoUsado = async (id, email) => {
  await sbFetch(`CODIGOS?id=eq.${id}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: JSON.stringify({ usado: true, email: email.trim().toLowerCase() }),
  });
};

const buscarLectura = async (tabla, nombre, fecha) => {
  const data = await sbFetch(`${tabla}?nombre=eq.${encodeURIComponent(nombre.trim().toLowerCase())}&fecha_nacimiento=eq.${encodeURIComponent(fecha)}&anio=eq.${ANIO}&select=informe`);
  if (!data || data.length === 0) return null;
  return data[0].informe;
};
  
const guardarLectura = async (tabla, nombre, fecha, ciudad, informe, email) => {
 const payload = { nombre: nombre.trim().toLowerCase(), fecha_nacimiento: fecha, ciudad, informe, anio: ANIO };
  if (email) payload.email = email;
  await sbFetch(tabla, {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify(payload),
  });
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,400;1,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── LINKS DE PAGO ───────────────────────────────────────────
const LINKS = {
  oraculo:  "https://mpago.la/2jNnE83",
  programa: "https://mpago.la/1TNvxTE",
  cosmico:  "https://mpago.la/2UAJ4SD",
  cosmica:  "https://mpago.la/1U7qumM",
  combo:    "https://mpago.la/29xD1mj",
  upgrade:  "https://mpago.la/2nXpjG3", // $8.990 — upgrade Año → Lectura Cósmica
};
// ─── I CHING · MEI HUA YI SHU (Numerología de la Flor de Ciruelo, Shao Yong, s. XI) ───
// Tabla del Rey Wen verificada contra fuente. Fórmula determinista: los mismos datos
// dan siempre el mismo hexagrama. No hay azar y no interviene la IA.

// Numeración Xiantian (Cielo Anterior): 1 Cielo · 2 Lago · 3 Fuego · 4 Trueno
//                                       5 Viento · 6 Agua · 7 Montaña · 8 Tierra
const HEX_TRIGRAMAS = ["","Cielo","Lago","Fuego","Trueno","Viento","Agua","Montaña","Tierra"];

// Filas = trigrama SUPERIOR (1-8) · Columnas = trigrama INFERIOR (1-8)
const HEX_KINGWEN = [
  [ 1,10,13,25,44, 6,33,12],
  [43,58,49,17,28,47,31,45],
  [14,38,30,21,50,64,56,35],
  [34,54,55,51,32,40,62,16],
  [ 9,61,37,42,57,59,53,20],
  [ 5,60,63, 3,48,29,39, 8],
  [26,41,22,27,18, 4,52,23],
  [11,19,36,24,46, 7,15, 2],
];

const HEX_NOMBRES = ["",
"Lo Creativo","Lo Receptivo","La Dificultad Inicial","La Necedad Juvenil","La Espera",
"El Conflicto","El Ejército","La Solidaridad","La Fuerza Domesticadora de lo Pequeño","El Porte",
"La Paz","El Estancamiento","La Comunidad con los Hombres","La Posesión de lo Grande","La Modestia",
"El Entusiasmo","El Seguimiento","El Trabajo en lo Echado a Perder","El Acercamiento","La Contemplación",
"La Mordedura Tajante","La Gracia","La Desintegración","El Retorno","La Inocencia",
"La Fuerza Domesticadora de lo Grande","La Nutrición","La Preponderancia de lo Grande","Lo Abismal (El Agua)","Lo Adherente (El Fuego)",
"El Influjo","La Duración","La Retirada","El Poder de lo Grande","El Progreso",
"El Oscurecimiento de la Luz","El Clan","El Antagonismo","El Impedimento","La Liberación",
"La Merma","El Aumento","La Resolución","El Ir al Encuentro","La Reunión",
"La Subida","La Desazón","El Pozo de Agua","La Revolución","El Caldero",
"Lo Suscitativo (El Trueno)","El Aquietamiento (La Montaña)","La Evolución","La Muchacha que se Casa","La Plenitud",
"El Andariego","Lo Suave (El Viento)","Lo Sereno (El Lago)","La Disolución","La Restricción",
"La Verdad Interior","La Preponderancia de lo Pequeño","Después de la Consumación","Antes de la Consumación"];

// Bits de cada trigrama, de abajo hacia arriba (1 = yang)
const HEX_BITS = {1:[1,1,1],2:[1,1,0],3:[1,0,1],4:[1,0,0],5:[0,1,1],6:[0,1,0],7:[0,0,1],8:[0,0,0]};
const HEX_DESDE_BITS = {}; for (const k in HEX_BITS) HEX_DESDE_BITS[HEX_BITS[k].join("")] = +k;

const hexNum = (sup, inf) => HEX_KINGWEN[sup-1][inf-1];

// Devuelve el hexagrama del año para una persona, o null si faltan datos.
function meiHua(anio, fechaNac, horaNac) {
  if (!anio || !fechaNac || !horaNac) return null;
  const p = String(fechaNac).split("-");
  const mes = parseInt(p[1], 10);
  const dia = parseInt(p[2], 10);
  const hora = parseInt(String(horaNac).split(":")[0], 10);
  if (isNaN(mes) || isNaN(dia) || isNaN(hora)) return null;

  const s1 = anio + mes + dia;
  const s2 = s1 + hora;
  const sup = (s1 % 8) || 8;
  const inf = (s2 % 8) || 8;
  const linea = (s2 % 6) || 6;
  const principal = hexNum(sup, inf);

  // La línea móvil muta: líneas 1-3 pertenecen al trigrama inferior, 4-6 al superior
  let sup2 = sup, inf2 = inf;
  if (linea <= 3) {
    const b = HEX_BITS[inf].slice(); b[linea-1] = b[linea-1] ? 0 : 1;
    inf2 = HEX_DESDE_BITS[b.join("")];
  } else {
    const b = HEX_BITS[sup].slice(); b[linea-4] = b[linea-4] ? 0 : 1;
    sup2 = HEX_DESDE_BITS[b.join("")];
  }
  const mutado = hexNum(sup2, inf2);

  return {
    principal,
    nombre: HEX_NOMBRES[principal],
    supNombre: HEX_TRIGRAMAS[sup],
    infNombre: HEX_TRIGRAMAS[inf],
    linea,
    mutado,
    mutadoNombre: HEX_NOMBRES[mutado],
  };
}
// ─── TAROT · CARTAS CALCULADAS ───────────────────────────────
// Carta del Año: método de Mary K. Greer (mes + día de nacimiento + año en curso).
// Cartas de Nacimiento: método de la Tarot School (Amberstone), fecha completa.
// Ambos son deterministas y verificados contra ejemplos documentados. La IA no elige.

const ARCANOS = ["El Loco","El Mago","La Suma Sacerdotisa","La Emperatriz","El Emperador",
"El Sumo Sacerdote","Los Enamorados","El Carro","La Fuerza","El Ermitaño","La Rueda de la Fortuna",
"La Justicia","El Colgado","La Muerte","La Templanza","El Diablo","La Torre","La Estrella",
"La Luna","El Sol","El Juicio","El Mundo"];

const nombreArcano = (n) => (n === 22 ? "El Loco" : ARCANOS[n]);
const sumarDigitos = (n) => String(n).split("").reduce((a, b) => a + Number(b), 0);

// Devuelve las cartas de Tarot de una persona, o null si faltan datos.
function tarotCartas(anio, fechaNac) {
  if (!anio || !fechaNac) return null;
  const p = String(fechaNac).split("-");
  const anioNac = parseInt(p[0], 10);
  const mes = parseInt(p[1], 10);
  const dia = parseInt(p[2], 10);
  if (isNaN(anioNac) || isNaN(mes) || isNaN(dia)) return null;

  // Carta del Año (Greer): mes + día + año en curso, reducir hasta 1-22
  let a = mes + dia + anio;
  while (a > 22) a = sumarDigitos(a);

  // Cartas de Nacimiento (Tarot School): día + mes + siglo + resto del año
  let s = dia + mes + Math.floor(anioNac / 100) + (anioNac % 100);
  if (s > 21) {
    const d = String(s).split("");
    s = d.length === 3 ? Number(d[0] + d[1]) + Number(d[2]) : sumarDigitos(s);
  }
  if (s > 21) s = sumarDigitos(s);
  const personalidad = s;
  const alma = s > 9 ? sumarDigitos(s) : s;

  return {
    anio: a,
    anioNombre: nombreArcano(a),
    personalidad,
    personalidadNombre: nombreArcano(personalidad),
    alma,
    almaNombre: nombreArcano(alma),
    mismaCarta: personalidad === alma,
  };
}
// ─── TRÁNSITOS POR AÑO (verificar y actualizar cada enero) ───
const TRANSITOS = {
  2026: `Júpiter: en Cáncer hasta el 29 de junio de 2026; en Leo desde el 30 de junio de 2026 en adelante. Retrógrado hasta el 10 de marzo.
Saturno: en Piscis hasta el 13 de febrero de 2026; en Aries desde el 13 de febrero de 2026 en adelante. Retrógrado del 26 de julio al 10 de diciembre.
Urano: en Tauro hasta el 25 de abril de 2026; en Géminis desde el 25 de abril de 2026 en adelante.
Neptuno: en Piscis hasta el 26 de enero de 2026; en Aries desde el 26 de enero de 2026 en adelante.
Plutón: en Acuario durante todo 2026. Retrógrado desde el 6 de mayo.
Quirón: en Aries hasta el 19 de junio de 2026; en Tauro desde el 19 de junio de 2026.
Nodo Norte: en Piscis hasta el 26 de julio de 2026; en Acuario desde el 26 de julio (Nodo Sur en Leo).
Aspectos mayores: Saturno conjunción Neptuno en Aries (20 de febrero); Saturno sextil Plutón (28 de marzo); Urano trígono Plutón (17 de julio y 29 de noviembre); Júpiter oposición Plutón (20 de julio); Júpiter trígono Neptuno (20 de julio); Júpiter trígono Saturno (31 de agosto).`,
};
// ─── ORACLE DATA ─────────────────────────────────────────────
const CATS = [
  { id:1, name:"Reconociendo el Dolor", color:"#e89090", bg:"linear-gradient(145deg,#2a0e0e,#1a0808)", border:"rgba(220,100,100,0.25)", emoji:"💔",
    cards:[
      {id:1,name:"El Tiempo del Dolor",phrase:"No necesitas apresurarte a estar bien; el dolor merece su tiempo.",accion:"Escribe una carta sin filtro, léela y quémala.",emocion:"Catarsis",canal:"Escritura"},
      {id:2,name:"La Validez de tus Lágrimas",phrase:"Permítete sentir sin juicio.",accion:"Escucha música que te haga llorar.",emocion:"Liberación",canal:"Auditivo"},
      {id:3,name:"Tu Herida No Te Define",phrase:"La historia no eres tú.",accion:"Separa objetos del pasado.",emocion:"Desidentificación",canal:"Visual"},
      {id:4,name:"Respira Aquí y Ahora",phrase:"Solo respira.",accion:"Hielo en la muñeca + respiración.",emocion:"Regulación",canal:"Sensorial"},
      {id:5,name:"La Fortaleza del Amor",phrase:"El dolor existe porque amaste.",accion:"Enciende una vela.",emocion:"Contención",canal:"Visual"},
      {id:6,name:"El Camino Se Mostrará",phrase:"No saber es parte del camino.",accion:"Escribe y entrega al viento.",emocion:"Rendición",canal:"Escritura"},
      {id:7,name:"La Valentía de Sentir",phrase:"Sentir también es valentía.",accion:"Di en voz alta: 'Sigo aquí'.",emocion:"Presencia",canal:"Verbal"},
      {id:8,name:"Nunca Estás Sola",phrase:"No eres la única.",accion:"Graba un audio.",emocion:"Descarga",canal:"Auditivo"},
      {id:9,name:"Honrar la Tristeza",phrase:"Tu tristeza merece espacio.",accion:"Pinta tu emoción.",emocion:"Expresión",canal:"Visual"},
      {id:10,name:"Transformación",phrase:"Esto también te cambia.",accion:"Masajea tus pies.",emocion:"Reconexión",canal:"Corporal"},
      {id:11,name:"Permiso para Romperte",phrase:"Romperte es parte de estar viva.",accion:"Grita donde puedas.",emocion:"Catarsis",canal:"Corporal"},
      {id:12,name:"El Peso del Silencio",phrase:"Lo no dicho duele.",accion:"Dite al espejo lo que no has podido decir.",emocion:"Confrontación",canal:"Visual"},
      {id:13,name:"La Lluvia Sagrada",phrase:"Llorar limpia.",accion:"Busca una foto de tu niña.",emocion:"Ternura",canal:"Visual"},
    ]},
  { id:2, name:"Sanando desde el Amor", color:"#e8c880", bg:"linear-gradient(145deg,#2a1e08,#1a1206)", border:"rgba(220,180,80,0.25)", emoji:"🌿",
    cards:[
      {id:14,name:"El Amor Perdura",phrase:"El amor cambia de forma, nunca desaparece.",accion:"Graba un audio de gratitud.",emocion:"Continuidad",canal:"Auditivo"},
      {id:15,name:"Amor Propio",phrase:"Amarte reconstruye todo lo demás.",accion:"Automasaje en manos y brazos.",emocion:"Autocuidado",canal:"Corporal"},
      {id:16,name:"El Amor Permanece",phrase:"El amor que viviste sigue siendo real.",accion:"Ocupa un espacio que antes evitabas.",emocion:"Apropiación",canal:"Sensorial"},
      {id:17,name:"Un Acto de Amor",phrase:"Sanar es el mayor acto de amor propio.",accion:"Escríbete una carta.",emocion:"Autoamor",canal:"Escritura"},
      {id:18,name:"Lazos Invisibles",phrase:"No todo vínculo necesita presencia.",accion:"Escribe los nombres de quienes te sostienen.",emocion:"Contención",canal:"Visual"},
      {id:19,name:"Amor Expansivo",phrase:"Tu capacidad de amar no se agota.",accion:"Dibuja un corazón.",emocion:"Apertura",canal:"Visual"},
      {id:20,name:"Amor en el Corazón",phrase:"El amor real empieza en ti.",accion:"Mano en pecho. Di: 'Me quiero'.",emocion:"Dignidad",canal:"Verbal"},
      {id:21,name:"Ámate",phrase:"Háblate como le hablarías a quien amas.",accion:"Frente al espejo, dite algo amable.",emocion:"Autoempatía",canal:"Visual"},
      {id:22,name:"El Amor Guía",phrase:"Puedes elegir desde el amor.",accion:"Enciende una vela y decide.",emocion:"Dirección",canal:"Ritual"},
      {id:23,name:"Integrar el Amor",phrase:"No olvidar — integrar.",accion:"Graba lo que quieres integrar.",emocion:"Integración",canal:"Auditivo"},
      {id:24,name:"Amar lo Roto",phrase:"Lo roto también tiene belleza.",accion:"Crea una caja simbólica.",emocion:"Compasión",canal:"Simbólico"},
      {id:25,name:"Recipiente",phrase:"Puedes sostenerte a ti misma.",accion:"Grábate con ternura.",emocion:"Merecimiento",canal:"Auditivo"},
      {id:26,name:"El Amor No Muere",phrase:"El amor que viviste sigue existiendo.",accion:"Háblale a tu niña interior.",emocion:"Permanencia",canal:"Visual"},
    ]},
  { id:3, name:"Esperanza y Luz", color:"#90d8a0", bg:"linear-gradient(145deg,#0a1e10,#061408)", border:"rgba(100,200,120,0.22)", emoji:"☀️",
    cards:[
      {id:27,name:"La Luz al Final",phrase:"Siempre amanece, aunque no lo creas.",accion:"Sostén hielo 30 segundos.",emocion:"Esperanza",canal:"Sensorial"},
      {id:28,name:"Confía",phrase:"El camino aparece cuando das el siguiente paso.",accion:"Apoya la espalda en un árbol.",emocion:"Confianza",canal:"Corporal"},
      {id:29,name:"Destello",phrase:"Hay luz, aunque hoy no la veas.",accion:"Escribe tres cosas que todavía existen.",emocion:"Fe",canal:"Escritura"},
      {id:30,name:"Fe",phrase:"Confía en ti. Más de lo que crees.",accion:"Di al espejo: 'Confío en ti'.",emocion:"Confianza",canal:"Visual"},
      {id:31,name:"Posible",phrase:"Lo mejor aún puede llegar.",accion:"Pon las manos abiertas hacia arriba.",emocion:"Apertura",canal:"Corporal"},
      {id:32,name:"Ahora",phrase:"Aquí, ahora, hay algo que ya está bien.",accion:"Nombra un pequeño cambio de hoy.",emocion:"Presencia",canal:"Sensorial"},
      {id:33,name:"Renueva",phrase:"Sigues viva. Eso es suficiente.",accion:"Escríbele una carta a quien serás.",emocion:"Reconexión",canal:"Escritura"},
      {id:34,name:"Eres Luz",phrase:"La luz está en ti.",accion:"Crea una playlist que te eleve.",emocion:"Energía",canal:"Auditivo"},
      {id:35,name:"Nuevo Día",phrase:"Empieza hoy. No mañana.",accion:"Grábate diciendo lo que quieres comenzar.",emocion:"Inicio",canal:"Verbal"},
      {id:36,name:"Sol",phrase:"El sol siempre vuelve.",accion:"Enciende una vela y mírala.",emocion:"Calma",canal:"Visual"},
      {id:37,name:"Ciclo",phrase:"Todo cambia. Incluso esto.",accion:"Crea una caja de cierre.",emocion:"Cierre",canal:"Simbólico"},
      {id:38,name:"Corazón",phrase:"Recuerda: sigues aquí.",accion:"Di: 'Sigo aquí'.",emocion:"Resistencia",canal:"Verbal"},
      {id:39,name:"Camina",phrase:"Un paso. Solo uno.",accion:"Sal a caminar 5 minutos.",emocion:"Movimiento",canal:"Corporal"},
    ]},
  { id:4, name:"Resiliencia", color:"#90b8e8", bg:"linear-gradient(145deg,#0a0e22,#06081a)", border:"rgba(100,140,220,0.22)", emoji:"🔥",
    cards:[
      {id:40,name:"Fortaleza",phrase:"Caminas con dolor y eso mismo es fuerza.",accion:"Graba un audio de reafirmación.",emocion:"Reafirmación",canal:"Auditivo"},
      {id:41,name:"Resiliencia",phrase:"Creces aunque no lo sientas todavía.",accion:"Dibuja cómo te ves en un año.",emocion:"Expresión",canal:"Visual"},
      {id:42,name:"Adaptarte",phrase:"Te transformas. Eso no es debilidad.",accion:"Escribe cómo has cambiado.",emocion:"Aceptación",canal:"Escritura"},
      {id:43,name:"Historia",phrase:"Tu historia completa te hace quien eres.",accion:"Di: 'Soy fuerza'.",emocion:"Integración",canal:"Visual"},
      {id:44,name:"Soltar",phrase:"Soltar no es perder. Es liberar.",accion:"Masajea tus hombros y suéltalos.",emocion:"Liberación",canal:"Corporal"},
      {id:45,name:"Pasos",phrase:"Avanzas, aunque no lo veas.",accion:"Da un pequeño paso diferente.",emocion:"Avance",canal:"Corporal"},
      {id:46,name:"Agradece",phrase:"En cada experiencia hay algo que aprender.",accion:"Enciende una vela y agradece.",emocion:"Gratitud",canal:"Ritual"},
      {id:47,name:"Cambio",phrase:"El poder de cambiar está en ti.",accion:"Suelta un objeto que ya no necesitas.",emocion:"Poder",canal:"Simbólico"},
      {id:48,name:"Adversidad",phrase:"Lo que te forjó también te hizo capaz.",accion:"Grábate: ¿en qué eres más fuerte?",emocion:"Valentía",canal:"Verbal"},
      {id:49,name:"Solo Hoy",phrase:"Solo hoy. No mañana, no ayer.",accion:"Sostén algo frío y vuelve.",emocion:"Presencia",canal:"Sensorial"},
      {id:50,name:"Raíz",phrase:"Siempre puedes volver a ti.",accion:"Pon las manos en la tierra.",emocion:"Seguridad",canal:"Corporal"},
      {id:51,name:"Ritmo",phrase:"No te apures. Tu ritmo es válido.",accion:"Habla con tu niña interior.",emocion:"Validación",canal:"Visual"},
      {id:52,name:"Silenciosa",phrase:"Sigues. Eso ya es todo.",accion:"Escríbete una carta de tu fuerza.",emocion:"Fuerza",canal:"Escritura"},
    ]},
];
const ALL_CARDS = CATS.flatMap(c => c.cards.map(card => ({...card, cat:c})));

const DIAS = {
  1:{titulo:"Nombrar lo real",bloque:1,manana:"Si hoy hay confusión, tiene sentido. No necesitas resolverlo.",accion:"1 palabra + 1 frase (sin explicar) + 3 respiraciones.",aterrizaje:"Hoy nombré sin analizar."},
  2:{titulo:"No todo es verdad",bloque:1,manana:"No todo lo que piensas es una verdad absoluta.",accion:"Identifica 1 pensamiento y dite: 'esto puede no ser cierto'.",aterrizaje:"Hoy no seguí todo lo que pensé."},
  3:{titulo:"Bajar la exigencia",bloque:1,manana:"No necesitas hacerlo todo hoy.",accion:"Haz 1 acción cotidiana más lento de lo habitual.",aterrizaje:"Hoy hice menos."},
  4:{titulo:"Dejar sin resolver",bloque:1,manana:"No todo necesita respuesta inmediata.",accion:"Escribe 1 preocupación y déjala ahí. No la toques hoy.",aterrizaje:"Hoy dejé algo sin resolver."},
  5:{titulo:"Volver al cuerpo",bloque:1,manana:"Tu cuerpo también tiene información.",accion:"Nota 1 tensión física + 3 respiraciones hacia ese lugar.",aterrizaje:"Hoy escuché mi cuerpo."},
  6:{titulo:"Menos estímulo",bloque:1,manana:"El ruido también entra por los sentidos.",accion:"Reduce 1 estímulo: silencia notificaciones o evita el scroll.",aterrizaje:"Hoy bajé el volumen externo."},
  7:{titulo:"Elegir energía",bloque:1,manana:"No todo merece tu atención. Tú decides.",accion:"Elige qué asunto NO vas a atender hoy.",aterrizaje:"Hoy elegí en qué no estar."},
  8:{titulo:"Nombrar emoción",bloque:2,manana:"Sentir no es perder el control. Es ser humano.",accion:"Identifica una emoción actual. Solo ponle nombre.",aterrizaje:"Hoy sentí sin desbordarme."},
  9:{titulo:"La pausa",bloque:2,manana:"Entre el estímulo y tu respuesta, hay un espacio.",accion:"Haz una pausa de 10 segundos antes de responder.",aterrizaje:"Hoy hice una pausa."},
  10:{titulo:"Separar",bloque:2,manana:"Una cosa es lo que sucede y otra lo que te cuentas.",accion:"Distingue: 1 hecho objetivo + 1 emoción asociada.",aterrizaje:"Hoy separé lo que siento de los hechos."},
  11:{titulo:"No explicar",bloque:2,manana:"No tienes la obligación de justificar cómo te sientes.",accion:"Permítete sentir algo sin buscarle la lógica.",aterrizaje:"Hoy me quedé conmigo, sin explicaciones."},
  12:{titulo:"Dejar pasar",bloque:2,manana:"Las emociones son como olas; pasan si no te aferras.",accion:"Observa un pensamiento incómodo y déjalo estar.",aterrizaje:"Hoy dejé pasar."},
  13:{titulo:"No responder",bloque:2,manana:"El silencio también es una respuesta válida.",accion:"Elige una situación y decide no reaccionar.",aterrizaje:"Hoy no respondí a todo."},
  14:{titulo:"Funcionar igual",bloque:2,manana:"Puedes avanzar aunque el clima interno sea nublado.",accion:"Realiza una acción necesaria con calma.",aterrizaje:"Hoy avancé igual."},
  15:{titulo:"Reconocer",bloque:3,manana:"El camino recorrido cuenta. Mírate con objetividad.",accion:"Escribe 1 pequeño cambio que hayas notado.",aterrizaje:"Hoy reconocí mi proceso."},
  16:{titulo:"Volver a ti",bloque:3,manana:"Tu estabilidad no depende de que el resto cambie.",accion:"Haz algo pequeño que te dé calma solo a ti.",aterrizaje:"Hoy volví a mi centro."},
  17:{titulo:"Menos afuera",bloque:3,manana:"Si tú sabes lo que vales, la opinión ajena pierde volumen.",accion:"Toma una decisión pequeña sin consultar a nadie.",aterrizaje:"Hoy me validé a mí misma."},
  18:{titulo:"Soltar",bloque:3,manana:"No tienes que demostrar nada a nadie hoy.",accion:"Identifica una expectativa sobre cómo 'deberías' ser y suéltala.",aterrizaje:"Hoy solté una carga."},
  19:{titulo:"Sostenerte",bloque:3,manana:"Tienes los recursos para estar bien contigo.",accion:"Haz un gesto de autocuidado: un té, un estiramiento.",aterrizaje:"Hoy me sostuve."},
  20:{titulo:"Bajar urgencia",bloque:3,manana:"Casi nada es tan urgente como tu sistema nervioso cree.",accion:"Baja el ritmo en una tarea que te cause estrés.",aterrizaje:"Hoy fui más lenta."},
  21:{titulo:"Cierre",bloque:3,manana:"Hoy tienes un espacio interno más grande que hace 21 días.",accion:"Escribe una frase que resuma lo que te llevas.",aterrizaje:"Gracias por haberte dado este espacio."},
};
const BLOQUES = {1:{name:"Bajar ruido interno",color:"#5a9a6a",days:[1,2,3,4,5,6,7]},2:{name:"Regular emoción",color:"#6a8aaa",days:[8,9,10,11,12,13,14]},3:{name:"Volver al centro",color:"#9a7a5a",days:[15,16,17,18,19,20,21]}};

const reduce = n => { while(n>9&&n!==11&&n!==22&&n!==33){n=String(n).split('').map(Number).reduce((a,b)=>a+b,0);} return n; };
const lifePathNum = d => { if(!d)return null; return reduce(d.replace(/-/g,'').split('').map(Number).reduce((a,b)=>a+b,0)); };
const expressionNum = n => { if(!n)return null; const m={a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8}; return reduce(n.toLowerCase().replace(/[^a-z]/g,'').split('').reduce((a,c)=>a+(m[c]||0),0)); };
const personalYear = d => { if(!d)return null; const p=d.match(/(\d{4})-(\d{2})-(\d{2})/); if(!p)return null; return reduce([...String(p[3]),...String(p[2]),...String(ANIO)].map(Number).reduce((a,b)=>a+b,0)); };

const S = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#110d08;--surface:#1c1508;--gold:#c8900a;--gold-l:#e8c060;--text:#F5ECD7;--muted:#8a7a60;--border:rgba(200,150,40,0.12);
}
body{background:var(--bg);}
.app{background:var(--bg);min-height:100vh;font-family:'DM Sans',sans-serif;color:var(--text);max-width:480px;margin:0 auto;position:relative;overflow-x:hidden;}
.app::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 20% 20%,rgba(180,120,20,0.07) 0%,transparent 50%),radial-gradient(ellipse at 80% 70%,rgba(100,50,180,0.06) 0%,transparent 50%);pointer-events:none;z-index:0;}
.z1{position:relative;z-index:1;}
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:rgba(8,5,14,0.97);border-top:1px solid var(--border);display:flex;padding:8px 0 14px;z-index:100;backdrop-filter:blur(12px);}
.bni{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;transition:all 0.2s;}
.bni-icon{width:22px;height:22px;display:flex;align-items:center;justify-content:center;}
.bni-label{font-size:8px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;}
.bni.on .bni-label{color:var(--gold-l);}
.bni.on .bni-icon{filter:drop-shadow(0 0 6px rgba(200,160,40,0.5));}
.bni:not(.on) .bni-label{color:rgba(140,110,40,0.3);}
.bni:not(.on) .bni-icon{opacity:0.2;}
.header{background:rgba(8,5,14,0.95);padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:50;backdrop-filter:blur(10px);}
.hbk{background:transparent;border:none;color:rgba(200,160,40,0.5);font-size:22px;cursor:pointer;line-height:1;padding:0;}
.htitle{font-family:'Fraunces',serif;font-size:18px;color:var(--gold-l);flex:1;}
.hsub{font-size:10px;color:rgba(160,130,50,0.4);letter-spacing:2px;}
.pb80{padding-bottom:90px;}
.sec-label{font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:14px;opacity:.8;display:flex;align-items:center;gap:10px;}
.sec-label::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--border),transparent);}
.hl{background:rgba(180,140,20,0.07);border:1px solid rgba(180,140,20,0.18);border-left:3px solid var(--gold);border-radius:0 10px 10px 0;padding:16px 18px;margin:14px 0;}
.hl p{font-size:14px;line-height:1.72;color:rgba(200,170,100,.7);}
.field{margin-bottom:16px;}
.flabel{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(180,140,60,.6);margin-bottom:7px;display:block;}
.finput{width:100%;background:rgba(180,140,30,.06);border:1px solid rgba(180,140,30,.18);border-radius:10px;padding:13px 16px;font-family:'DM Sans',sans-serif;font-size:15px;color:var(--text);outline:none;transition:border-color .2s;}
.finput::placeholder{color:rgba(180,140,60,.25);}
.finput:focus{border-color:rgba(200,160,40,.4);}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.btn-primary{background:linear-gradient(135deg,#7a5010,#c07820);color:#f5e8c0;border:none;border-radius:12px;padding:16px;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;cursor:pointer;width:100%;transition:all .2s;box-shadow:0 4px 20px rgba(180,100,20,.2);}
.btn-primary:hover{transform:translateY(-1px);}
.btn-primary:disabled{opacity:.4;cursor:not-allowed;transform:none;}

.mini-intro{background:rgba(180,140,20,.05);border-left:2px solid rgba(200,160,40,.3);border-radius:0 8px 8px 0;padding:12px 14px;margin-bottom:14px;font-size:13px;line-height:1.7;color:rgba(200,170,100,.6);font-style:italic;}
/* ── GATE ── */
.gate-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;}
.gate-glyph{width:72px;height:72px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background:rgba(200,144,10,.06);border:1px solid rgba(200,144,10,.2);border-radius:20px;}
.gate-title{font-family:'Fraunces',serif;font-size:26px;color:var(--gold-l);margin-bottom:8px;}
.gate-price{font-family:'Fraunces',serif;font-size:20px;color:rgba(200,160,60,.6);margin-bottom:6px;}
.gate-sub{font-size:13px;color:rgba(200,170,100,.4);font-style:italic;margin-bottom:28px;line-height:1.6;}
.gate-input{width:100%;max-width:300px;background:rgba(180,140,30,.06);border:1px solid rgba(180,140,30,.25);border-radius:12px;padding:16px;font-family:'DM Sans',sans-serif;font-size:16px;color:var(--text);outline:none;text-align:center;letter-spacing:2px;margin-bottom:12px;}
.gate-input::placeholder{color:rgba(180,140,60,.25);letter-spacing:0;}
.gate-input:focus{border-color:rgba(200,160,40,.5);}
.gate-btn{background:linear-gradient(135deg,#7a5010,#c07820);color:#f5e8c0;border:none;border-radius:12px;padding:14px 32px;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;margin-bottom:16px;}
.gate-btn:disabled{opacity:.4;cursor:not-allowed;}
.gate-error{font-size:13px;color:#e08080;margin-bottom:12px;font-style:italic;}
.gate-divider{font-size:10px;color:rgba(180,140,60,.25);letter-spacing:3px;text-transform:uppercase;margin:16px 0;}
.gate-buy{background:rgba(180,140,20,.08);border:1px solid rgba(180,140,20,.2);border-radius:12px;padding:16px;width:100%;max-width:300px;text-align:center;cursor:pointer;text-decoration:none;display:block;transition:all .2s;}
.gate-buy:hover{border-color:rgba(180,140,20,.4);}
.gate-buy-label{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(180,140,60,.5);margin-bottom:4px;}
.gate-buy-price{font-family:'Fraunces',serif;font-size:18px;color:var(--gold-l);margin-bottom:2px;}
.gate-buy-sub{font-size:11px;color:rgba(180,140,60,.35);}
.gate-combo{background:linear-gradient(135deg,rgba(200,144,10,.1),rgba(160,100,10,.06));border:1px solid rgba(200,144,10,.3);border-radius:12px;padding:16px;width:100%;max-width:300px;text-align:center;cursor:pointer;text-decoration:none;display:block;margin-top:10px;transition:all .2s;}
.gate-combo:hover{border-color:rgba(200,144,10,.5);}
.gate-combo-label{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(200,144,10,.6);margin-bottom:4px;}
.gate-combo-price{font-family:'Fraunces',serif;font-size:18px;color:var(--gold-l);margin-bottom:2px;}
.gate-combo-sub{font-size:11px;color:rgba(200,144,10,.4);}

/* ── HOME ── */
.home-hero{text-align:center;padding:56px 24px 32px;border-bottom:1px solid var(--border);background:radial-gradient(ellipse at 50% 40%,rgba(200,144,10,.08) 0%,transparent 70%);}
.home-glyph{display:none;}
.home-eyebrow{font-size:13px;font-weight:700;letter-spacing:8px;text-transform:uppercase;color:var(--gold);margin-bottom:32px;opacity:.85;}
.home-title{font-family:'Fraunces',serif;font-size:clamp(36px,9vw,58px);font-weight:900;color:var(--gold-l);letter-spacing:-1px;line-height:1.1;margin-bottom:20px;}
.home-sub{font-family:'Fraunces',serif;font-style:italic;font-size:16px;color:rgba(245,236,215,.5);margin-bottom:0;line-height:1.6;}
.home-desc{display:none;}
.tool-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:22px;margin-bottom:12px;cursor:pointer;transition:all .25s;display:flex;align-items:center;gap:16px;}
.tool-card:hover{border-color:rgba(200,150,40,.3);transform:translateY(-1px);}
.tc-icon{width:44px;height:44px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(200,144,10,.06);border:1px solid rgba(200,144,10,.15);border-radius:12px;}
.tc-body{flex:1;}
.tc-tag{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:3px;opacity:.7;}
.tc-title{font-family:'Fraunces',serif;font-size:18px;color:var(--gold-l);margin-bottom:2px;}
.tc-desc{font-size:12px;color:var(--muted);}
.tc-price{font-size:11px;color:rgba(180,140,60,.5);margin-top:4px;font-weight:600;}
.tc-arrow{color:rgba(200,150,40,.3);font-size:20px;}
.home-by{text-align:center;padding:20px;font-family:'Fraunces',serif;font-style:italic;font-size:12px;color:rgba(160,130,50,.3);}

/* ── COSMIC / COSMICA ── */
.cy-hero{text-align:center;padding:36px 20px 24px;background:radial-gradient(ellipse at 50% 30%,rgba(200,144,10,.08) 0%,transparent 60%),linear-gradient(170deg,#1a1008 0%,var(--bg) 70%);border-bottom:1px solid var(--border);}
.cy-glyph{width:60px;height:60px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;background:rgba(200,144,10,.06);border:1px solid rgba(200,144,10,.18);border-radius:16px;}
.cy-title{font-family:'Fraunces',serif;font-size:clamp(22px,5vw,36px);font-weight:900;color:var(--gold-l);margin-bottom:4px;}
.cy-sub{font-family:'Fraunces',serif;font-style:italic;font-size:13px;color:rgba(200,144,10,.4);margin-bottom:8px;}
.cy-desc{font-size:13px;line-height:1.7;color:rgba(180,150,200,.5);max-width:360px;margin:0 auto;}
.num-preview{background:rgba(180,140,20,.06);border:1px solid rgba(180,140,20,.15);border-radius:10px;padding:14px 16px;margin-bottom:16px;}
.np-title{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(180,140,60,.5);margin-bottom:8px;}
.np-item{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;border-bottom:1px solid rgba(180,140,30,.07);}
.np-item:last-child{border-bottom:none;}
.np-k{color:rgba(180,150,80,.5);}
.np-v{color:#c8a840;font-weight:600;font-family:'Fraunces',serif;}
.loading{text-align:center;padding:60px 20px;}
.spin{font-size:48px;display:block;margin-bottom:16px;animation:spin 8s linear infinite;}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
.ls-items{text-align:left;max-width:280px;margin:20px auto 0;}
.ls-item{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:13px;color:rgba(180,150,80,.4);}
.ls-item.on{color:var(--gold-l);}
.ls-item.done{color:#80c080;}
.ls-dot{width:8px;height:8px;border-radius:50%;border:1px solid currentColor;flex-shrink:0;}
.ls-item.on .ls-dot{background:var(--gold-l);animation:pulse 1s ease-in-out infinite;}
.ls-item.done .ls-dot{background:#80c080;border-color:#80c080;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.report-hdr{background:linear-gradient(135deg,rgba(30,20,8,.97),rgba(20,14,4,.98));border:1px solid rgba(200,160,40,.2);border-radius:14px;padding:24px;text-align:center;margin-bottom:16px;}
.rh-glyph{font-size:36px;display:block;margin-bottom:8px;}
.rh-name{font-family:'Fraunces',serif;font-size:22px;color:var(--gold-l);margin-bottom:3px;}
.rh-data{font-size:11px;color:rgba(180,150,80,.45);margin-bottom:10px;}
.rh-badges{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;}
.rh-badge{background:rgba(180,140,20,.15);border:1px solid rgba(180,140,20,.25);color:#c8a040;font-size:10px;padding:2px 9px;border-radius:10px;}
.rs{background:rgba(16,12,4,.97);border:1px solid rgba(180,140,30,.12);border-radius:12px;padding:20px;margin-bottom:12px;position:relative;overflow:hidden;}
.rs::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(180,140,30,.35),transparent);}
.rs-hdr{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.rs-icon{font-size:24px;flex-shrink:0;}
.rs-label{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(180,140,60,.5);margin-bottom:2px;}
.rs-title{font-family:'Fraunces',serif;font-size:17px;color:var(--gold-l);}
.rs-content{font-size:14.5px;line-height:1.8;color:#b8a880;white-space:pre-wrap;}
.restart-btn{background:transparent;border:1px solid rgba(180,140,30,.18);border-radius:10px;padding:12px;color:rgba(180,150,80,.45);font-size:13px;cursor:pointer;width:100%;transition:all .2s;margin-bottom:8px;}
.restart-btn:hover{border-color:rgba(180,140,30,.35);color:var(--gold);}
.powered{text-align:center;padding:14px 0 0;font-size:10px;color:rgba(140,110,40,.25);letter-spacing:2px;text-transform:uppercase;}

/* ── ORACLE ── */
.or-hero{text-align:center;padding:32px 20px 24px;background:radial-gradient(ellipse at 50% 30%,rgba(200,144,10,.08) 0%,transparent 60%),linear-gradient(170deg,#1a1008 0%,var(--bg) 80%);border-bottom:1px solid var(--border);}
.or-title{font-family:'Fraunces',serif;font-size:26px;color:var(--gold-l);margin-bottom:4px;}
.or-sub{font-size:13px;color:rgba(200,144,10,.4);font-style:italic;}
.streak-bar{background:rgba(17,13,8,.97);padding:12px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.streak-n{font-family:'Fraunces',serif;font-size:20px;color:var(--gold-l);font-weight:700;}
.streak-lbl{font-size:10px;color:rgba(200,144,10,.4);letter-spacing:1px;text-transform:uppercase;}
.streak-dots{display:flex;gap:5px;}
.sd{width:8px;height:8px;border-radius:50%;border:1px solid rgba(140,80,200,.25);}
.sd.done{background:#9a50c0;border-color:#9a50c0;}
.sd.today{border-color:rgba(180,110,240,.45);animation:pulse 2s ease-in-out infinite;}
.today-card{background:linear-gradient(135deg,rgba(200,144,10,.1),rgba(160,100,10,.06));border:1px solid rgba(200,144,10,.25);border-radius:16px;padding:24px;text-align:center;cursor:pointer;transition:all .25s;}
.today-card:hover{border-color:rgba(200,144,10,.45);transform:translateY(-1px);}
.tc-status{font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(200,144,10,.6);text-transform:uppercase;margin-bottom:10px;}
.tc-big-icon{font-size:40px;margin-bottom:8px;display:block;}
.tc-big-t{font-family:'Fraunces',serif;font-size:20px;color:var(--gold-l);margin-bottom:4px;}
.tc-big-s{font-size:13px;color:rgba(200,144,10,.4);font-style:italic;margin-bottom:16px;}
.tc-go{display:inline-block;background:linear-gradient(135deg,rgba(200,144,10,.8),rgba(180,120,10,.9));color:#1a1008;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:700;border:none;cursor:pointer;}
.past-c{background:rgba(20,12,36,.8);border:1px solid rgba(140,80,200,.1);border-radius:11px;padding:13px 16px;margin-bottom:9px;cursor:pointer;display:flex;align-items:flex-start;gap:12px;}
.pc-date{font-size:10px;color:rgba(140,100,200,.4);min-width:55px;margin-top:2px;}
.pc-n{font-family:'Fraunces',serif;font-size:15px;color:#c4a0e0;margin-bottom:2px;}
.pc-p{font-size:12px;color:rgba(180,130,220,.35);font-style:italic;}
.ritual-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;background:radial-gradient(ellipse at 50% 35%,rgba(140,80,200,.15) 0%,transparent 65%);min-height:calc(100vh - 60px);}
.rg{font-size:60px;margin-bottom:20px;display:block;animation:breathe 4s ease-in-out infinite;}
@keyframes breathe{0%,100%{transform:scale(1);}50%{transform:scale(1.07);}}
.rt{font-family:'Fraunces',serif;font-size:32px;color:var(--gold-l);margin-bottom:4px;}
.rs2{font-family:'Fraunces',serif;font-style:italic;font-size:14px;color:rgba(200,144,10,.4);margin-bottom:24px;}
.breathe-c{width:76px;height:76px;border-radius:50%;border:1.5px solid rgba(160,100,220,.3);display:flex;align-items:center;justify-content:center;font-size:26px;animation:breathe 4s ease-in-out infinite;margin:0 auto 8px;}
.breathe-lbl{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(160,120,220,.4);margin-bottom:28px;}
.int-wrap{width:100%;max-width:300px;margin-bottom:28px;}
.int-lbl{font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:rgba(160,100,220,.45);margin-bottom:8px;text-align:left;}
.int-input{width:100%;background:rgba(200,144,10,.06);border:1px solid rgba(200,144,10,.18);border-radius:11px;padding:13px 16px;font-family:'Fraunces',serif;font-style:italic;font-size:15px;color:var(--gold-l);outline:none;text-align:center;}
.int-input::placeholder{color:rgba(160,120,220,.3);}
.draw-btn{width:150px;height:150px;border-radius:50%;border:1.5px solid rgba(160,100,220,.25);background:radial-gradient(circle,rgba(140,80,200,.15),rgba(80,40,140,.08));display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;gap:7px;transition:all .3s;}
.draw-btn:hover{border-color:rgba(160,100,220,.5);transform:scale(1.04);}
.db-icon{font-size:34px;}
.db-lbl{font-family:'Fraunces',serif;font-size:14px;color:rgba(200,155,240,.65);}
.db-sub{font-size:9px;color:rgba(160,110,220,.35);letter-spacing:1px;}
.card-stage{padding:32px 20px 0;display:flex;flex-direction:column;align-items:center;}
.oracle-card{width:100%;max-width:300px;aspect-ratio:2/3;border-radius:22px;position:relative;perspective:1000px;margin-bottom:22px;}
.card-flip{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.4,0,.2,1);}
.card-flip.flipped{transform:rotateY(180deg);}
.card-face{position:absolute;inset:0;border-radius:22px;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;}
.card-back{background:linear-gradient(145deg,#1c1408,#110d08);border:1px solid rgba(200,144,10,.2);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;gap:10px;}
.cbp{position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(160,100,220,.03) 20px,rgba(160,100,220,.03) 21px);}
.cb-g{font-size:44px;position:relative;z-index:1;animation:breathe 3s ease-in-out infinite;}
.cb-t{font-family:'Fraunces',serif;font-style:italic;font-size:13px;color:rgba(180,130,220,.35);position:relative;z-index:1;}
.cb-h{font-size:9px;color:rgba(140,100,200,.28);letter-spacing:2px;text-transform:uppercase;position:relative;z-index:1;}
.card-front{transform:rotateY(180deg);display:flex;flex-direction:column;padding:24px 20px;border:1px solid;}
.cf-cat{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;opacity:.6;}
.cf-name{font-family:'Fraunces',serif;font-size:20px;font-weight:700;line-height:1.2;margin-bottom:6px;}
.cf-emo{font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;opacity:.5;margin-bottom:4px;}
.cf-canal{font-size:8px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;opacity:.3;margin-bottom:auto;}
.cf-div{width:28px;height:1px;background:currentColor;opacity:.14;margin:14px 0;}
.cf-phrase{font-family:'Fraunces',serif;font-style:italic;font-size:16px;line-height:1.6;opacity:.9;flex:1;display:flex;align-items:center;}
.cf-al{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.35;margin-top:14px;margin-bottom:3px;}
.cf-a{font-size:12.5px;line-height:1.5;opacity:.6;}
.below-card{width:100%;padding:0 20px 90px;}
.int-display{background:rgba(140,80,200,.06);border:1px solid rgba(140,80,200,.12);border-radius:9px;padding:11px 14px;margin-bottom:14px;text-align:center;}
.id-lbl{font-size:9px;letter-spacing:3px;color:rgba(160,100,220,.4);text-transform:uppercase;margin-bottom:3px;}
.id-t{font-family:'Fraunces',serif;font-style:italic;font-size:14px;color:rgba(200,160,240,.65);}
.journal{background:rgba(140,80,200,.06);border:1px solid rgba(140,80,200,.12);border-radius:13px;padding:16px;margin-bottom:12px;}
.jlbl{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(160,100,220,.45);margin-bottom:8px;}
.jq{font-family:'Fraunces',serif;font-style:italic;font-size:14px;color:rgba(200,155,240,.65);margin-bottom:10px;line-height:1.5;}
.jta{width:100%;background:rgba(200,144,10,.04);border:1px solid rgba(200,144,10,.12);border-radius:7px;padding:11px 13px;font-family:'DM Sans',sans-serif;font-size:13.5px;color:var(--gold-l);resize:none;min-height:75px;outline:none;line-height:1.6;}
.jta::placeholder{color:rgba(160,100,220,.2);font-style:italic;}
.act-row{display:flex;gap:9px;margin-bottom:10px;}
.act-btn{flex:1;padding:12px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;text-align:center;}
.act-p{background:linear-gradient(135deg,rgba(200,144,10,.35),rgba(160,100,10,.25));border:1px solid rgba(200,144,10,.3);color:var(--gold-l);}
.act-s{background:transparent;border:1px solid rgba(200,144,10,.12);color:rgba(200,144,10,.4);}
.save-btn{width:100%;padding:14px;border-radius:11px;border:none;background:linear-gradient(135deg,#7a3a9a,#9a50c0);color:#f0e8fc;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;}
.saved-conf{text-align:center;padding:14px;background:rgba(140,80,200,.06);border:1px solid rgba(140,80,200,.12);border-radius:11px;}
.sc-ico{font-size:20px;margin-bottom:5px;}
.sc-t{font-family:'Fraunces',serif;font-size:15px;color:rgba(200,155,240,.65);margin-bottom:3px;}
.sc-s{font-size:11px;color:rgba(160,110,220,.35);font-style:italic;margin-bottom:12px;}
.sc-btn{background:transparent;border:1px solid rgba(200,144,10,.18);border-radius:7px;padding:8px 18px;color:rgba(180,120,230,.55);font-size:12px;cursor:pointer;}

/* ── CATS & GRID ── */
.cats-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;text-align:center;}
.cats-title{font-family:'Fraunces',serif;font-size:22px;color:var(--gold-l);margin-bottom:4px;}
.cats-sub{font-size:12px;color:rgba(200,144,10,.4);font-style:italic;margin-bottom:6px;}
.cats-int{font-family:'Fraunces',serif;font-style:italic;font-size:14px;color:rgba(200,160,240,.55);background:rgba(140,80,200,.06);border:1px solid rgba(140,80,200,.12);border-radius:10px;padding:8px 14px;margin-bottom:24px;max-width:280px;}
.cat-cards{display:flex;flex-direction:column;gap:10px;width:100%;max-width:320px;}
.cat-card{border-radius:14px;padding:16px 18px;cursor:pointer;transition:all .25s;text-align:left;border:1px solid;display:flex;align-items:center;gap:14px;}
.cat-card:hover{transform:translateY(-2px);filter:brightness(1.1);}
.cat-card-emoji{font-size:32px;flex-shrink:0;}
.cat-card-body{flex:1;}
.cat-card-name{font-family:'Fraunces',serif;font-size:17px;font-weight:700;margin-bottom:2px;}
.cat-card-desc{font-size:11px;opacity:.55;}
.emo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;width:100%;max-width:320px;margin-bottom:10px;}
.emo-btn{border-radius:12px;padding:13px 10px;cursor:pointer;transition:all .2s;text-align:center;border:1px solid rgba(140,80,200,.18);background:rgba(140,80,200,.06);display:flex;flex-direction:column;align-items:center;gap:4px;}
.emo-btn:hover{background:rgba(140,80,200,.14);border-color:rgba(140,80,200,.35);transform:scale(1.03);}
.emo-emoji{font-size:22px;line-height:1;}
.emo-label{font-family:'Fraunces',serif;font-size:13px;color:rgba(200,155,240,.8);}
.emo-otra{width:100%;max-width:320px;border-radius:12px;padding:13px;cursor:pointer;transition:all .2s;text-align:center;border:1px dashed rgba(140,80,200,.25);background:transparent;font-family:'Fraunces',serif;font-style:italic;font-size:13px;color:rgba(160,110,220,.45);}
.emo-otra:hover{border-color:rgba(140,80,200,.45);color:rgba(200,155,240,.7);}

.grid-header{text-align:center;margin-bottom:20px;}
.grid-title{font-family:'Fraunces',serif;font-size:20px;margin-bottom:4px;}
.grid-sub{font-size:12px;opacity:.5;font-style:italic;}
.cards-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.grid-card{aspect-ratio:2/3;border-radius:12px;border:1px solid;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;}
.grid-card:hover{transform:scale(1.05);}
.grid-card-back{font-size:20px;opacity:.45;}
.grid-card-num{font-size:8px;letter-spacing:1px;opacity:.2;margin-top:3px;text-transform:uppercase;}

/* ── 21 DIAS ── */
.prog-hero{background:linear-gradient(170deg,#1a1008 0%,var(--bg) 70%);padding:30px 20px 22px;text-align:center;border-bottom:1px solid var(--border);}
.prog-t{font-family:'Fraunces',serif;font-size:24px;color:#7ecf94;margin-bottom:3px;}
.prog-s{font-size:13px;color:rgba(120,180,130,.4);font-style:italic;}
.day-scroll{display:flex;gap:7px;overflow-x:auto;padding-bottom:3px;margin-bottom:20px;scrollbar-width:none;}
.day-scroll::-webkit-scrollbar{display:none;}
.day-b{flex-shrink:0;width:42px;height:42px;border-radius:9px;border:1px solid rgba(80,160,80,.15);background:transparent;color:rgba(160,200,165,.45);font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.day-b.done{background:rgba(60,120,60,.2);border-color:rgba(80,160,80,.3);color:#7ecf94;}
.day-b.active{background:linear-gradient(135deg,#2d7a4a,#3a9a5c);border-color:#3a9a5c;color:#e8f5ec;}
.day-b.locked{opacity:.28;cursor:default;}
.prog-bar-wrap{background:var(--bg);padding:8px 20px 12px;border-bottom:1px solid rgba(80,160,80,.06);}
.prog-bar-row{display:flex;justify-content:space-between;margin-bottom:5px;font-size:10px;color:rgba(120,180,130,.4);}
.prog-bar{height:3px;background:rgba(80,160,80,.1);border-radius:2px;overflow:hidden;}
.prog-fill{height:100%;background:linear-gradient(90deg,#2d7a4a,#7ecf94);border-radius:2px;transition:width .4s;}
.today-box{background:linear-gradient(135deg,rgba(40,100,50,.25),rgba(30,80,40,.15));border:1px solid rgba(80,180,80,.18);border-radius:14px;padding:22px;cursor:pointer;transition:all .25s;text-align:center;}
.tb-lbl{font-size:9px;font-weight:700;letter-spacing:3px;color:#7ecf94;text-transform:uppercase;margin-bottom:6px;opacity:.8;}
.tb-t{font-family:'Fraunces',serif;font-size:19px;color:#c8e8cc;margin-bottom:4px;}
.tb-s{font-size:12px;color:rgba(140,200,150,.45);font-style:italic;margin-bottom:14px;}
.go-btn{display:inline-block;background:linear-gradient(135deg,#2d7a4a,#3a9a5c);color:#e8f5ec;padding:9px 22px;border-radius:8px;font-size:13px;font-weight:600;border:none;cursor:pointer;}
.day-card{background:#101a12;border:1px solid rgba(80,160,80,.1);border-radius:15px;overflow:hidden;margin-bottom:14px;}
.dc-head{padding:20px 20px 16px;border-bottom:1px solid rgba(80,160,80,.07);}
.dc-blq{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;opacity:.7;}
.dc-num{font-family:'Fraunces',serif;font-size:12px;color:rgba(120,180,130,.45);margin-bottom:3px;}
.dc-t{font-family:'Fraunces',serif;font-size:22px;color:#c8e8cc;}
.momento{padding:16px 20px;border-bottom:1px solid rgba(80,160,80,.06);}
.m-badge{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:3px 9px;border-radius:8px;display:inline-block;margin-bottom:7px;}
.m-title{font-family:'Fraunces',serif;font-size:15px;margin-bottom:6px;}
.m-text{font-size:14px;line-height:1.7;color:rgba(180,220,190,.6);}
.aterrizaje{background:rgba(60,100,60,.12);border:1px solid rgba(80,160,80,.15);border-radius:11px;padding:16px;margin:14px 0;}
.at-lbl{font-size:9px;font-weight:700;letter-spacing:3px;color:#7ecf94;text-transform:uppercase;margin-bottom:7px;opacity:.8;}
.at-t{font-family:'Fraunces',serif;font-style:italic;font-size:15px;color:#b0d8b8;margin-bottom:12px;line-height:1.5;}
.check-row{display:flex;gap:9px;}
.check-btn{flex:1;border-radius:8px;border:1px solid;padding:10px;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:5px;}
.check-min{background:transparent;border-color:rgba(120,180,130,.22);color:rgba(120,180,130,.55);}
.check-min.on{background:rgba(60,100,60,.3);border-color:rgba(120,180,130,.5);color:#7ecf94;}
.check-full{background:linear-gradient(135deg,#2d7a4a,#3a9a5c);border-color:#3a9a5c;color:#e8f5ec;}
.check-full.on{background:linear-gradient(135deg,#3a9a5c,#4ab86e);}
.note-wrap{background:#101a12;border:1px solid rgba(80,160,80,.1);border-radius:11px;padding:16px;margin-bottom:14px;}
.note-lbl{font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(120,180,130,.4);text-transform:uppercase;margin-bottom:9px;}
.note-inp{width:100%;background:rgba(60,100,60,.08);border:1px solid rgba(80,160,80,.1);border-radius:7px;padding:11px 13px;font-family:'DM Sans',sans-serif;font-size:13.5px;color:#dde8e0;resize:none;min-height:65px;outline:none;line-height:1.6;}
.note-inp::placeholder{color:rgba(120,180,130,.22);}
.day-nav{display:flex;gap:9px;margin-top:6px;}
.dn-btn{flex:1;border-radius:9px;border:1px solid rgba(80,160,80,.15);padding:11px;background:transparent;color:rgba(120,180,130,.5);font-size:13px;cursor:pointer;}
.dn-btn:hover{border-color:rgba(80,160,80,.3);color:#7ecf94;}
.dn-btn.fwd{background:linear-gradient(135deg,#2d7a4a,#3a9a5c);border-color:#3a9a5c;color:#e8f5ec;font-weight:600;}

/* ── PRINT / PDF ── */
@media print {
  .bnav,.header,.restart-btn,.powered{display:none !important;}
  .app{max-width:100%;}
  .rs,.report-hdr{break-inside:avoid;page-break-inside:avoid;}
  .rs{border:1px solid #ddd;background:#fff;}
  .rs-content{color:#333;}
  .rs-title{color:#8a6010;}
  .rh-name{color:#8a6010;}
  body,.app{background:#fff;color:#333;}
}
`;

const JQ = ["¿Qué resuena de esta carta en lo que vives hoy?","¿Qué parte de ti necesitaba escuchar esto?","¿Qué harás diferente después de esta carta?","¿Qué emoción se mueve en ti al leerla?"];
const LOADING_STEPS = ["Calculando camino de vida y expresión...","Analizando tránsitos planetarios...","Consultando el I Ching...","Interpretando las 12 casas...","Sintetizando todos los sistemas...","Preparando tu informe personalizado..."];
const LOADING_STEPS_COSMICA = ["Calculando perfil numerológico...","Analizando tránsitos...","Consultando el I Ching...","Calculando las cartas del Tarot...","Calculando carta natal completa...","Analizando Diseño Humano...","Integrando todos los sistemas...","Preparando tu mapa..."];
const SECTION_META = {
  "PERFIL NUMEROLÓGICO":{icon:"🔢",lbl:"Numerología"},
  "EL AÑO EN SÍNTESIS":{icon:"🪐",lbl:"Astrología"},
  "EL MENSAJE DEL I CHING":{icon:"☯️",lbl:"I Ching"},
  "LECTURA DE LAS 12 CASAS":{icon:"🏛️",lbl:"Casas"},
  "LENORMAND Y TAROT":{icon:"🃏",lbl:"Oráculos"},
  "TAROT":{icon:"🃏",lbl:"Tarot"},
  "PROPÓSITO Y MISIÓN DE VIDA":{icon:"🔱",lbl:"Propósito"},
  "GUÍA DE ACCIÓN":{icon:"🗓️",lbl:"Acción"},
  "DISEÑO HUMANO":{icon:"⬡",lbl:"Diseño Humano"},
  "CARTA NATAL COMPLETA":{icon:"🌟",lbl:"Carta Natal"},
  "INTEGRACIÓN CÓSMICA":{icon:"🔮",lbl:"Integración"},
  "Tu Lectura":{icon:"✨",lbl:"Tu Mapa"},
  "Tu Mapa":{icon:"✨",lbl:"Tu Mapa"},
};

function cleanText(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/---/g, '')
    .replace(/#{1,6}\s/g, '')
    .trim();
}

function parseSections(text) {
  if (!text) return [];
  const sections = [];
  const rx = /\[([^\]]+)\]([\s\S]*?)(?=\[|$)/g;
  let m;
  while ((m = rx.exec(text)) !== null) {
    const content = cleanText(m[2]);
    if (content) sections.push({title:m[1].trim(), content});
  }
  if (!sections.length && text.trim()) sections.push({title:"Tu Lectura", content:cleanText(text)});
  return sections;
}
// ─── MINI-INTROS por sistema ──────────────────────────────────
const buildMiniIntros = (sections) => {
  const get = (title) => sections.find(s => s.title === title)?.content || "";
  const num = get("PERFIL NUMEROLÓGICO");
  const camino = num.match(/Camino de Vida\s+(\w+)/i)?.[1] || "—";
  const expresion = num.match(/Expresi[oó]n\s+(\w+)/i)?.[1] || "—";
  const anio = num.match(/A[nñ]o Personal\s+(\w+)/i)?.[1] || "—";

  const ast = get("EL AÑO EN SÍNTESIS");
  const transito = ast.match(/([A-ZÁÉÍÓÚ][a-záéíóú]+)\s+(?:en|entra|ingresa|conjunci)/)?.[1] || "";
  const casa = ast.match(/Casa\s+(\d+)/i)?.[1] || "";
  const transitoTexto = transito && casa ? `${transito} en tu Casa ${casa}` : transito || "—";

  const cn = get("CARTA NATAL COMPLETA");
  const sol = cn.match(/Sol\s+en\s+([^,.\n]+)/i)?.[1]?.trim() || "—";
  const luna = cn.match(/Luna\s+en\s+([^,.\n]+)/i)?.[1]?.trim() || "—";
  const asc = cn.match(/Ascendente\s+(?:en\s+)?([^,.\n]+)/i)?.[1]?.trim() || null;

  const ic = get("EL MENSAJE DEL I CHING");
  const hexNatal = ic.match(/hexagrama\s+natal[^:]*:\s*([^\n.]+)/i)?.[1]?.trim() ||
                   ic.match(/hexagrama\s+(\d+[^,.\n]*)/i)?.[1]?.trim() || "—";
  const hexAnio = ic.match(/hexagrama\s+del\s+a[nñ]o[^:]*:\s*([^\n.]+)/i)?.[1]?.trim() ||
                  ic.match(/hexagrama\s+mutado[^:]*:\s*([^\n.]+)/i)?.[1]?.trim() || "—";

  const tar = get("TAROT");
  const cardPersonalidad = tar.match(/Personalidad[^:]*:\s*([^\n.]+)/i)?.[1]?.trim() ||
                           tar.match(/Arcano\s+\d+[^—]*—\s*([^\n.]+)/i)?.[1]?.trim() || "—";
  const cardAlma = tar.match(/Alma[^:]*:\s*([^\n.]+)/i)?.[1]?.trim() || "—";
  const cardAnio = tar.match(/A[nñ]o[^:]*:\s*([^\n.]+)/i)?.[1]?.trim() || "—";

  const dh = get("DISEÑO HUMANO");
  const tipo = dh.match(/tipo\s*:?\s*([^\n,.|]+)/i)?.[1]?.trim() || "—";
  const autoridad = dh.match(/autoridad\s*:?\s*([^\n,.|]+)/i)?.[1]?.trim() || "—";
  const perfil = dh.match(/perfil\s*:?\s*([^\n,.|]+)/i)?.[1]?.trim() || "—";

  const casas = get("LECTURA DE LAS 12 CASAS");
  const casaActivada = casas.match(/Casa\s+(\d+)[^.]*activ/i)
    ? `Casa ${casas.match(/Casa\s+(\d+)[^.]*activ/i)[1]}`
    : casas.match(/Casa\s+(\d+)/i)
    ? `Casa ${casas.match(/Casa\s+(\d+)/i)[1]}`
    : "—";

  return {
    "PERFIL NUMEROLÓGICO": `Tu Camino de Vida es ${camino}, tu Expresión es ${expresion}, y este año transitas un Año Personal ${anio}. Estos tres números describen quién eres, cómo te expresas y el ciclo específico que estás viviendo ahora.`,
    "EL AÑO EN SÍNTESIS": `El tránsito más relevante para ti este año es ${transitoTexto}. No es una tendencia general — es lo que está activando tu carta natal en particular durante ${ANIO}.`,
    "CARTA NATAL COMPLETA": `Tu Sol está en ${sol}, tu Luna en ${luna}${asc ? `, y tu Ascendente es ${asc}` : ""}. Esta es la estructura psicológica con la que llegaste — no cambia, define el terreno sobre el que opera todo lo demás.`,
    "LECTURA DE LAS 12 CASAS": `La casa más activada este año en tu carta es la ${casaActivada}. Esta es el área concreta de tu vida que los tránsitos actuales están moviendo con más fuerza.`,
    "EL MENSAJE DEL I CHING": `Tu hexagrama natal es el ${hexNatal} — el mismo patrón de tu Diseño Humano leído en otro lenguaje. Este año se mueve hacia el ${hexAnio}, indicando la dirección de tu situación actual.`,
    "TAROT": `Tus cartas permanentes son ${cardPersonalidad} (Personalidad) y ${cardAlma} (Alma). Tu Carta del Año es ${cardAnio}: el arquetipo que rige este ciclo específico.`,
    "DISEÑO HUMANO": `Tu diseño es ${tipo}, con ${autoridad} y Perfil ${perfil}. Este es el eje del que se desprenden los otros sistemas — cómo tomas decisiones, cómo usas tu energía, y qué necesitas para no operar contra tu propia naturaleza.`,
    "INTEGRACIÓN CÓSMICA": `Hasta aquí viste los sistemas por separado. Esta sección los cruza: donde el mismo patrón aparece en lenguajes distintos, no es coincidencia — es confirmación.`,
    "PROPÓSITO Y MISIÓN DE VIDA": `Con todos los sistemas integrados, esta sección responde la pregunta de fondo: para qué estás aquí, qué viniste a hacer con este diseño específico.`,
    "GUÍA DE ACCIÓN": `La parte que se usa, no solo se lee: qué hacer cada trimestre de ${ANIO}, aplicando los tránsitos a tu Estrategia y Autoridad — concreto, sin adornos.`,
  };
};
// ── ICONOS SVG ───────────────────────────────────────────────────
const SVG = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 4l9 8v8a1 1 0 01-1 1h-5v-5H9v5H4a1 1 0 01-1-1v-8z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/></svg>,
  cosmico: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 12.5A9 9 0 1 1 11.5 3a6.5 6.5 0 0 0 9.5 9.5z" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>,
  cosmica: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.5 4.5h4.5l-3.5 2.5 1.5 4.5L12 11l-4 2.5 1.5-4.5L6 6.5h4.5z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/></svg>,
  oraculo: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>,
  programa: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="4" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

const SVGLarge = {
  cosmico: <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><path d="M42 26a18 18 0 1 1-18-18 13 13 0 0 0 18 18z" stroke="#c8900a" strokeWidth="1.3" fill="none"/><circle cx="39" cy="13" r="2.5" fill="#c8900a"/></svg>,
  cosmica: <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><path d="M26 6l4.5 13.5H44l-11 8 4.5 13.5L26 33l-11.5 8 4.5-13.5-11-8H22z" stroke="#c8900a" strokeWidth="1.3" fill="none" strokeLinejoin="round"/></svg>,
  oraculo: <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="20" stroke="#c8900a" strokeWidth="1.3"/><path d="M26 6 Q32 16 26 26 Q20 36 26 46" stroke="#c8900a" strokeWidth="1.3" fill="none"/><path d="M6 26 Q16 20 26 26 Q36 32 46 26" stroke="#c8900a" strokeWidth="1.3" fill="none"/></svg>,
  programa: <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><path d="M26 26 Q28 20 26 13 Q24 6 26 2" stroke="#c8900a" strokeWidth="1.3" fill="none" strokeLinecap="round"/><path d="M26 26 Q33 24 38 18 Q43 12 50 12" stroke="#c8900a" strokeWidth="1.3" fill="none" strokeLinecap="round"/><path d="M26 26 Q33 30 36 38 Q39 46 44 48" stroke="#c8900a" strokeWidth="1.3" fill="none" strokeLinecap="round"/><path d="M26 26 Q19 30 16 38 Q13 46 8 50" stroke="#c8900a" strokeWidth="1.3" fill="none" strokeLinecap="round"/><path d="M26 26 Q19 24 14 18 Q9 12 2 12" stroke="#c8900a" strokeWidth="1.3" fill="none" strokeLinecap="round"/><circle cx="26" cy="26" r="3" fill="#c8900a" opacity="0.6"/></svg>,
};

// ── GATE ────────────────────────────────────────────────────────
function Gate({ producto, emoji, titulo, precio, precioAntes, subtitulo, linkCompra, onAccess, onBack }) {
  const [codigo, setCodigo] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modo, setModo] = useState("codigo");

  const darAccesoLocal = (productoRow) => {
    const accesos = JSON.parse(localStorage.getItem("cicatriz_accesos") || "{}");
    if (productoRow === "all") {
      accesos["cosmico"] = true; accesos["cosmica"] = true;
      accesos["oraculo"] = true; accesos["programa"] = true;
    } else {
      accesos[producto] = true;
    }
    localStorage.setItem("cicatriz_accesos", JSON.stringify(accesos));
    onAccess();
  };

  const handleValidar = async () => {
    if (!codigo.trim() || !emailInput.trim()) return;
    setLoading(true); setError("");
    try {
      const row = await validarCodigo(codigo.trim().toUpperCase(), producto);
      if (!row) {
        setError("Código inválido o ya utilizado. Verifica e intenta de nuevo.");
      } else {
        await marcarCodigoUsado(row.id, emailInput);
        darAccesoLocal(row.producto);
      }
    } catch { setError("Error de conexión. Intenta nuevamente."); }
    setLoading(false);
  };

  const handleRecuperar = async () => {
    if (!emailInput.trim()) return;
    setLoading(true); setError("");
    try {
      const tiene = await buscarAccesoPorEmail(emailInput, producto);
      if (!tiene) {
        setError("No encontramos acceso asociado a este email. Verifica o usa tu código.");
      } else {
        darAccesoLocal(producto);
      }
    } catch { setError("Error de conexión. Intenta nuevamente."); }
    setLoading(false);
  };

  return (
    <div className="z1" style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div className="header">
        <button className="hbk" onClick={onBack}>‹</button>
        <div className="htitle">{titulo}</div>
      </div>
      <div className="gate-wrap" style={{minHeight:"calc(100vh - 57px)"}}>
      <span className="gate-glyph">{SVGLarge[producto] || emoji}</span>
      <div className="gate-title">{titulo}</div>
      <div className="gate-price">
        {precioAntes && <span style={{textDecoration:"line-through",opacity:.4,fontSize:"0.78em",marginRight:8}}>{precioAntes}</span>}
        {precio}
      </div>
      
      <div className="gate-sub">{subtitulo}</div>
      {modo === "codigo" ? (<>
        <input className="gate-input" placeholder="tu@correo.com" type="email" value={emailInput}
          onChange={e=>{setEmailInput(e.target.value);setError("");}}
          style={{marginBottom:8}}/>
        <input className="gate-input" placeholder="CZXX-XXXX-XXXX" value={codigo}
          onChange={e=>{setCodigo(e.target.value.toUpperCase());setError("");}}
          onKeyDown={e=>e.key==="Enter"&&handleValidar()}/>
        {error && <div className="gate-error">{error}</div>}
        <button className="gate-btn" onClick={handleValidar} disabled={loading||!codigo.trim()||!emailInput.trim()}>
          {loading?"Verificando...":"✦ Ingresar con mi código"}
        </button>
        <div className="gate-divider">¿Ya compraste antes?</div>
        <button onClick={()=>{setModo("email");setError("");}} style={{background:"transparent",border:"none",color:"rgba(180,140,60,.45)",fontSize:13,cursor:"pointer",marginBottom:8,fontStyle:"italic"}}>
          Recuperar acceso con mi email →
        </button>
        <div className="gate-divider">¿No tienes código?</div>
      </>) : (<>
        <input className="gate-input" placeholder="tu@correo.com" type="email" value={emailInput}
          onChange={e=>{setEmailInput(e.target.value);setError("");}}
          onKeyDown={e=>e.key==="Enter"&&handleRecuperar()}/>
        {error && <div className="gate-error">{error}</div>}
        <button className="gate-btn" onClick={handleRecuperar} disabled={loading||!emailInput.trim()}>
          {loading?"Buscando...":"✦ Recuperar mi acceso"}
        </button>
        <div className="gate-divider">¿Tienes tu código?</div>
        <button onClick={()=>{setModo("codigo");setError("");}} style={{background:"transparent",border:"none",color:"rgba(180,140,60,.45)",fontSize:13,cursor:"pointer",marginBottom:8,fontStyle:"italic"}}>
          ← Ingresar con código
        </button>
        <div className="gate-divider">¿No tienes código?</div>
      </>)}
      <a href={linkCompra} target="_blank" rel="noopener noreferrer" className="gate-buy">
        <div className="gate-buy-label">Comprar acceso</div>
        <div className="gate-buy-price">{precio}</div>
        <div className="gate-buy-sub">Pago único · Mercado Pago →</div>
      </a>
      <a href={LINKS.combo} target="_blank" rel="noopener noreferrer" className="gate-combo">
        <div className="gate-combo-label">✦ Combo completo · Todos los productos</div>
        <div className="gate-combo-price">$39.990 CLP · pack de lanzamiento hasta el 3 de agosto</div>
        <div className="gate-combo-sub">Año Cósmico + Tu Mapa + Oráculo + 21 Días →</div>
      </a>
      </div>
    </div>
  );
}

// ── REPORT VIEWER ────────────────────────────────────────────────
function ReportView({ nombre, fecha, ciudad, hora, lp, exp, py, sections, onReset, glyph }) {
  const intros = buildMiniIntros(sections);
  return (
    <>
      <div className="report-hdr">
        <span className="rh-glyph">{glyph}</span>
        <div className="rh-name">{nombre.split(' ')[0]}</div>
        <div className="rh-data">{fecha} · {ciudad}{hora?` · ${hora}`:""}</div>
        <div className="rh-badges">
          {lp&&<span className="rh-badge">Camino {lp}</span>}
          {exp&&<span className="rh-badge">Expresión {exp}</span>}
          {py&&<span className="rh-badge">Año {py}</span>}
        </div>
      </div>
      {sections.map((sec,i) => {
        const meta = SECTION_META[sec.title]||{icon:"✨",lbl:"Tu Mapa"};
        const intro = intros[sec.title];
        return (
          <div key={i} className="rs">
            <div className="rs-hdr">
              <span className="rs-icon">{meta.icon}</span>
              <div><div className="rs-label">{meta.lbl}</div><div className="rs-title">{sec.title}</div></div>
            </div>
            {intro && <div className="mini-intro">{intro}</div>}
            <div className="rs-content">{sec.content}</div>
          </div>
        );
      })}
      <button className="restart-btn" style={{background:"linear-gradient(135deg,#2d7a4a,#3a9a5c)",color:"#e8f5ec",border:"none"}} onClick={()=>window.print()}>✦ Descargar en PDF</button>
      <button className="restart-btn" onClick={onReset}>↩ Nueva lectura</button>
      <div className="powered">Tu Mapa · Cicatriz · by Nanette Vezanka</div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function Cicatriz() {
  const [tab, setTab] = useState("home");
  const [breathCount, setBreathCount] = useState(0);
  const [accesos, setAccesos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cicatriz_accesos") || "{}"); }
    catch { return {}; }
  });

  const tieneAcceso = (prod) => accesos[prod] || accesos["all"];
  const darAcceso = (prod) => {
  const actual = JSON.parse(localStorage.getItem("cicatriz_accesos") || "{}");
  const nuevo = {...actual, [prod]:true};
  setAccesos(nuevo);
  localStorage.setItem("cicatriz_accesos", JSON.stringify(nuevo));
};

  // Oracle state
  const [orPhase, setOrPhase] = useState("home");
  const [intention, setIntention] = useState("");
  const [orCats, setOrCats] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [cardSaved, setCardSaved] = useState(false);
  const [streak, setStreak] = useState(() => {
    try { const s = localStorage.getItem("or_streak"); return s ? parseInt(s) : 0; } catch { return 0; }
  });
  const [orHistory, setOrHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("or_history") || "[]"); } catch { return []; }
  });
  const todayKey = new Date().toISOString().slice(0,10);
  const drawnToday = orHistory.length > 0 && orHistory[0].date === todayKey;

  // Año Cósmico state
  const [cyScreen, setCyScreen] = useState("form");
  const [cyForm, setCyForm] = useState({nombre:"",fecha:"",hora:"",ciudad:""});
  const [cyLoadStep, setCyLoadStep] = useState(0);
  const [cyReport, setCyReport] = useState("");

  // Lectura Cósmica state
  const [lcScreen, setLcScreen] = useState("form");
  const [lcForm, setLcForm] = useState({nombre:"",fecha:"",hora:"",ciudad:"",tipo:"",autoridad:"",perfil:"",centros:""});
  const [lcLoadStep, setLcLoadStep] = useState(0);
  const [lcReport, setLcReport] = useState("");

  // Programa state
  const [currentDay, setCurrentDay] = useState(1);
  const [activeDay, setActiveDay] = useState(1);
  const [done, setDone] = useState({});
  const [notes, setNotes] = useState({});
  const [progView, setProgView] = useState("home");

  useEffect(() => {
    if (orPhase !== "breathe") return;
    const t = setInterval(() => setBreathCount(c => c+1), 2000);
    return () => clearInterval(t);
  }, [orPhase]);

  const lp = lifePathNum(cyForm.fecha);
  const exp = expressionNum(cyForm.nombre);
  const py = personalYear(cyForm.fecha);
  const lcLp = lifePathNum(lcForm.fecha);
  const lcExp = expressionNum(lcForm.nombre);
  const lcPy = personalYear(lcForm.fecha);

  const completedDays = Object.keys(done).filter(k => done[k]?.min || done[k]?.full).length;
  const progress = Math.round((completedDays/21)*100);
  const isDone = d => done[d]?.min || done[d]?.full;
  const isActive = d => d <= currentDay;
  const dia = DIAS[activeDay];
  const bloque = BLOQUES[dia?.bloque];
  const cat = currentCard?.cat;

  const EMOCIONES = [
    {label:"Tristeza",     emoji:"💧", cats:[1,3]},
    {label:"Vacío",        emoji:"🕳️", cats:[1,2]},
    {label:"Angustia",     emoji:"🌀", cats:[1,4]},
    {label:"Llanto",       emoji:"😢", cats:[1,2]},
    {label:"Rabia",        emoji:"🔥", cats:[1,4]},
    {label:"Frustración",  emoji:"😤", cats:[4,1]},
    {label:"Miedo",        emoji:"🫧", cats:[4,1]},
    {label:"Soledad",      emoji:"🌑", cats:[2,1]},
    {label:"Culpa",        emoji:"🪢", cats:[1,2]},
    {label:"Confusión",    emoji:"🌫️", cats:[2,4]},
    {label:"Nostalgia",    emoji:"🍂", cats:[2,1]},
    {label:"Cansancio",    emoji:"🌿", cats:[4,2]},
    {label:"Esperanza",    emoji:"🌱", cats:[3,4]},
    {label:"Gratitud",     emoji:"🌸", cats:[2,3]},
  ];

  const handleEmocion = (emocion) => {
    setIntention(emocion.label);
    const sugeridas = emocion.cats.map(id => CATS.find(c=>c.id===id));
    setOrCats(sugeridas);
    setOrPhase("cats");
  };

  const handleOtra = () => {
    setIntention("otra");
    setOrCats(CATS);
    setOrPhase("cats");
  };

  const selectCat = (cat) => {
    setSelectedCat(cat);
    setOrPhase("grid");
  };

  const selectCardFromGrid = (card) => {
    setCurrentCard({...card, cat: selectedCat});
    setFlipped(false); setJournalText(""); setCardSaved(false);
    setOrPhase("card");
    setTimeout(() => setFlipped(true), 500);
  };

  const saveCard = () => {
    if (!currentCard) return;
    const entry = {date: todayKey, card: currentCard, note: journalText};
    const newHistory = [entry, ...orHistory].slice(0, 30);
    setOrHistory(newHistory);
    localStorage.setItem("or_history", JSON.stringify(newHistory));
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("or_streak", String(newStreak));
    setCardSaved(true);
  };

  const submitCosmic = async () => {
    if (!cyForm.nombre||!cyForm.fecha||!cyForm.ciudad) return;
    setCyScreen("loading"); setCyLoadStep(0);
    const guardada = await buscarLectura("lecturas", cyForm.nombre, cyForm.fecha);
    if (guardada) { setCyReport(guardada); setCyScreen("report"); return; }
    for (let i=0;i<LOADING_STEPS.length;i++) { await new Promise(r=>setTimeout(r,850)); setCyLoadStep(i+1); }
    try {
      const hexAnio = meiHua(ANIO, cyForm.fecha, cyForm.hora);
      const tarot = tarotCartas(ANIO, cyForm.fecha);
      const prompt = `Eres un astrólogo experto en sistemas esotéricos. Genera una lectura COMPLETA y personalizada para el año ${ANIO}.
DATOS: Nombre: ${cyForm.nombre} | Fecha: ${cyForm.fecha} | Hora: ${cyForm.hora||"desconocida"} | Ciudad: ${cyForm.ciudad}
Camino de Vida: ${lp} | Expresión: ${exp} | Año Personal ${ANIO}: ${py}
${TRANSITOS[ANIO] ? `TRÁNSITOS PLANETARIOS REALES DE ${ANIO} — datos verificados. Úsalos EXACTAMENTE como están escritos. NO los corrijas, NO los reemplaces por tu propio conocimiento, NO inventes fechas ni signos distintos:
${TRANSITOS[ANIO]}` : `NO TIENES DATOS DE TRÁNSITOS PARA ${ANIO}. Está TERMINANTEMENTE PROHIBIDO inventarlos. Omite por completo la sección [EL AÑO EN SÍNTESIS] y no menciones ningún tránsito planetario en ninguna otra sección.`}
${hexAnio ? `HEXAGRAMA DEL AÑO ${ANIO} — calculado con el método Mei Hua Yi Shu (Shao Yong, siglo XI). Cálculo determinista, NO una elección tuya. PROHIBIDO usar otro hexagrama:
Hexagrama principal: ${hexAnio.principal} — ${hexAnio.nombre}. Trigrama superior: ${hexAnio.supNombre}. Trigrama inferior: ${hexAnio.infNombre}.
Línea móvil: ${hexAnio.linea}.
Hexagrama mutado (hacia dónde se dirige la situación): ${hexAnio.mutado} — ${hexAnio.mutadoNombre}.` : `NO SE PUDO CALCULAR el hexagrama (falta hora de nacimiento). PROHIBIDO inventarlo: omite la sección [EL MENSAJE DEL I CHING].`}
${tarot ? `CARTAS DE TAROT — CALCULADAS, no elegidas. PROHIBIDO usar otros arcanos:
Carta del Año ${ANIO} (método Mary K. Greer): Arcano ${tarot.anio} — ${tarot.anioNombre}.
Carta de Personalidad (método Tarot School): Arcano ${tarot.personalidad} — ${tarot.personalidadNombre}.
Carta del Alma: Arcano ${tarot.alma} — ${tarot.almaNombre}.` : `NO SE PUDIERON CALCULAR las cartas. PROHIBIDO inventarlas: omite la sección [LENORMAND Y TAROT].`}
REGLA DE HONESTIDAD, obligatoria: nunca escribas un dato del que no estés seguro. Prohibido usar "probable", "probablemente", "si está presente", "posiblemente" o cualquier fórmula que revele que estás adivinando. Si un dato astrológico no se puede calcular con certeza, NO lo menciones — omítelo en vez de conjeturarlo. Prohibido cerrar el informe con una nota sobre la calidad o verificación de los datos.
Genera el informe con estos encabezados exactos entre corchetes:
[PERFIL NUMEROLÓGICO] Análisis del Camino de Vida ${lp}, Expresión ${exp} y Año Personal ${py}. 2-3 párrafos.
[EL AÑO EN SÍNTESIS] Los 3 tránsitos más importantes de ${ANIO}. 2-3 párrafos.
[EL MENSAJE DEL I CHING] Usa EXACTAMENTE el hexagrama calculado arriba. Nómbralo con su número y nombre, di qué situación plantea, qué pide la línea móvil, y hacia dónde apunta el hexagrama mutado. PROHIBIDO usar otro hexagrama. 1-2 párrafos.
[LECTURA DE LAS 12 CASAS] Las casas más activadas en ${ANIO}. 2-3 párrafos.
[TAROT] Usa EXACTAMENTE los tres arcanos calculados arriba. NO menciones Lenormand: este informe no incluye tirada de Lenormand. Explica las Cartas de Personalidad y del Alma (permanentes, salen de la fecha de nacimiento) y la Carta del Año ${ANIO}. Cierra cruzándolas con el hexagrama. Nombra cada arcano con su número y nombre. Prohibido titubear entre varias cartas o explicar métodos alternativos. 1-2 párrafos.
[PROPÓSITO Y MISIÓN DE VIDA] El propósito profundo. 2 párrafos.
[GUÍA DE ACCIÓN] Recomendaciones por trimestre Q1, Q2, Q3, Q4 del año ${ANIO}.
Tono: profesional, directo e informativo. Sin metáforas poéticas, sin frases tipo "eres el río" o "busca el mar". Usa el nombre de pila. Máximo 200 palabras por sección. No uses asteriscos ni markdown.`;
      const res = await fetch("https://function-bun-production-0725.up.railway.app/api/lectura-cosmica",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
      const data = await res.json();
      const texto = data.lectura||"Error al generar la lectura.";
      await guardarLectura("lecturas", cyForm.nombre, cyForm.fecha, cyForm.ciudad, texto);
      setCyReport(texto);
    } catch { setCyReport("Error de conexión. Por favor intenta nuevamente."); }
    setCyScreen("report");
  };

  const submitCosmica = async () => {
    if (!lcForm.nombre||!lcForm.fecha||!lcForm.ciudad) return;
    setLcScreen("loading"); setLcLoadStep(0);
    const guardada = await buscarLectura("lecturas_cosmicas", lcForm.nombre, lcForm.fecha);
    if (guardada) { setLcReport(guardada); setLcScreen("report"); return; }

    let dh = null;
    try {
      const dhRes = await fetch("/api/diseno-humano",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fecha:lcForm.fecha,hora:lcForm.hora,ciudad:lcForm.ciudad})});
      const dhData = await dhRes.json();
      if (dhData.diseno) dh = dhData.diseno;
    } catch { dh = null; }

    for (let i=0;i<LOADING_STEPS_COSMICA.length;i++) { await new Promise(r=>setTimeout(r,900)); setLcLoadStep(i+1); }

    const dhTexto = dh
      ? `DISEÑO HUMANO (calculado con precisión astronómica): Tipo: ${dh.tipo} | Estrategia: ${dh.estrategia} | Autoridad: ${dh.autoridad} | Perfil: ${dh.perfil} | Definición: ${dh.definicion} | Cruz de Encarnación: ${dh.cruz} | Centros definidos: ${(dh.centros_definidos||[]).join(", ")} | Canales: ${(dh.canales||[]).join(", ")} | Tema No-Self: ${dh.tema_no_self} | Firma: ${dh.firma}`
      : 'DISEÑO HUMANO: No se pudo calcular automáticamente (verificar hora y ciudad de nacimiento). Interpreta desde la carta natal y numerología disponibles.';
    const hexAnio = meiHua(ANIO, lcForm.fecha, lcForm.hora);
    const tarot = tarotCartas(ANIO, lcForm.fecha);
    try {
      const prompt = `Eres un astrólogo y analista de Diseño Humano experto. Genera un informe llamado "Tu Mapa", profundo y personalizado. Nunca lo llames "Lectura Cósmica": su nombre es Tu Mapa. Esta es la lectura más completa que existe — integra numerología, astrología, I Ching, Lenormand, carta natal y Diseño Humano en un solo informe.

DATOS PERSONALES: Nombre: ${lcForm.nombre} | Fecha: ${lcForm.fecha} | Hora: ${lcForm.hora||"desconocida"} | Ciudad: ${lcForm.ciudad}
Camino de Vida: ${lcLp} | Expresión: ${lcExp} | Año Personal ${ANIO}: ${lcPy}

${dhTexto}
${dh && dh.cruz ? `HEXAGRAMA NATAL DEL I CHING — dato exacto, calculado, NO lo inventes ni lo cambies: Las 64 puertas del Diseño Humano son los mismos 64 hexagramas del I Ching, con idéntica numeración. La Cruz de Encarnación de esta persona es "${dh.cruz}". El PRIMER número que aparece en esa cruz es su Sol de Personalidad y, por lo tanto, ES su hexagrama natal del I Ching. Úsalo EXACTAMENTE, con su nombre tradicional correcto. Está terminantemente prohibido elegir otro hexagrama.` : `NO HAY DATOS DE DISEÑO HUMANO, así que no se puede determinar el hexagrama. Está PROHIBIDO inventarlo. Omite por completo la sección [EL MENSAJE DEL I CHING].`}
${hexAnio ? `HEXAGRAMA DEL AÑO ${ANIO} — calculado con el método Mei Hua Yi Shu (Numerología de la Flor de Ciruelo, Shao Yong, siglo XI). Es un cálculo determinista, NO una elección tuya. Está terminantemente PROHIBIDO usar otro hexagrama o inventar uno distinto:
Hexagrama principal: ${hexAnio.principal} — ${hexAnio.nombre}. Trigrama superior: ${hexAnio.supNombre}. Trigrama inferior: ${hexAnio.infNombre}.
Línea móvil: ${hexAnio.linea}.
Hexagrama mutado (hacia dónde se dirige la situación): ${hexAnio.mutado} — ${hexAnio.mutadoNombre}.` : `NO SE PUDO CALCULAR el hexagrama del año (falta hora de nacimiento). PROHIBIDO inventarlo: no menciones ningún hexagrama del año.`}
${tarot ? `CARTAS DE TAROT — CALCULADAS, no elegidas. Está terminantemente PROHIBIDO usar otros arcanos o inventar cartas distintas:
Carta del Año ${ANIO} (método de Mary K. Greer: mes + día de nacimiento + año en curso): Arcano ${tarot.anio} — ${tarot.anioNombre}.
Carta de Personalidad (método de la Tarot School, fecha completa de nacimiento): Arcano ${tarot.personalidad} — ${tarot.personalidadNombre}.
Carta del Alma: Arcano ${tarot.alma} — ${tarot.almaNombre}.` : `NO SE PUDIERON CALCULAR las cartas de Tarot. PROHIBIDO inventarlas: omite por completo la sección [LENORMAND Y TAROT].`}
IMPORTANTE: Los datos de Diseño Humano son REALES y calculados astronómicamente. Interprétalos con precisión y autoridad — NO digas "probablemente" ni "intuyo" respecto al Diseño Humano, porque son datos exactos.
${TRANSITOS[ANIO] ? `TRÁNSITOS PLANETARIOS REALES DE ${ANIO} — datos verificados. Úsalos EXACTAMENTE como están escritos. NO los corrijas, NO los reemplaces por tu propio conocimiento, NO inventes fechas ni signos distintos:
${TRANSITOS[ANIO]}` : `NO TIENES DATOS DE TRÁNSITOS PARA ${ANIO}. Está TERMINANTEMENTE PROHIBIDO inventarlos. Omite por completo la sección [EL AÑO EN SÍNTESIS] y no menciones ningún tránsito planetario en ninguna otra sección del informe.`}
REGLA DE HONESTIDAD, obligatoria: nunca escribas un dato del que no estés seguro. Prohibido usar "probable", "probablemente", "si está presente", "posiblemente" o cualquier fórmula que revele que estás adivinando. Si un dato astrológico no se puede calcular con certeza a partir de la información entregada, simplemente NO lo menciones — omítelo por completo en vez de conjeturarlo. Está prohibido también cerrar el informe con una nota final sobre la calidad, exactitud o verificación de los datos: no escribas ese cierre.
Traduce los términos al español de forma natural.

Genera el informe con estos encabezados exactos entre corchetes:

[PERFIL NUMEROLÓGICO]
Análisis técnico del Camino de Vida ${lcLp}, Expresión ${lcExp} y Año Personal ${lcPy}. Qué significa cada número, cómo interactúan y qué define a esta persona según la numerología. Usa el nombre de pila. 2-3 párrafos informativos.

[EL AÑO EN SÍNTESIS]
Los 3 tránsitos planetarios más importantes para esta persona nacida el ${lcForm.fecha} durante ${ANIO}. Para cada tránsito indica: qué planeta, en qué signo, qué área de vida afecta, y la fecha exacta aproximada de inicio y término (día y mes). Menciona Júpiter, Saturno o Plutón según corresponda. 2-3 párrafos concretos.

[EL MENSAJE DEL I CHING]
Dos lecturas, ambas calculadas, ninguna elegida por ti. PRIMERO, el hexagrama natal (el de la Cruz de Encarnación): explica que las 64 puertas del Diseño Humano son los mismos 64 hexagramas del I Ching, nómbralo con su número y nombre tradicional, y di qué describe de forma permanente en esta persona. SEGUNDO, el hexagrama del año ${ANIO} calculado por Mei Hua Yi Shu: nómbralo con su número y nombre, describe qué situación plantea, qué pide la línea móvil, y hacia dónde apunta el hexagrama mutado. Cierra diciendo si ambos hexagramas se refuerzan o se tensionan entre sí. 2-3 párrafos.[LECTURA DE LAS 12 CASAS]
Las casas astrológicas más activadas en ${ANIO} y qué área concreta de vida impactan. 2-3 párrafos.

[TAROT]
Usa EXACTAMENTE los tres arcanos calculados arriba. NO menciones Lenormand: este informe no incluye tirada de Lenormand. Explica: (1) la Carta de Personalidad y la Carta del Alma, que salen de la fecha completa de nacimiento y no cambian nunca — qué arquetipo permanente describen; (2) la Carta del Año ${ANIO} — qué prueba, lección o tono trae este año concreto. Cierra cruzando estas cartas con el hexagrama natal y el del año: di si se refuerzan o se tensionan. Nombra cada arcano con su número y su nombre. Prohibido titubear entre varias cartas o explicar métodos alternativos de cálculo: las cartas ya están dadas. 2-3 párrafos.

[CARTA NATAL COMPLETA]
Análisis técnico de la carta natal: Sol, Luna, Ascendente (si hay hora exacta), planetas en casas principales, aspectos más relevantes. Cómo esta carta define la personalidad y el destino de ${lcForm.nombre.split(' ')[0]}. 3-4 párrafos informativos y precisos.

[DISEÑO HUMANO]
Análisis preciso del Diseño Humano calculado: tipo y lo que significa en la práctica diaria, estrategia y cómo aplicarla, autoridad y cómo tomar decisiones con ella. Perfil y propósito. Centros definidos y abiertos: qué significa cada uno para esta persona específica. Canales activos y cómo condicionan su energía. Tema no-self y firma como indicadores de alineación. Cómo operar correctamente según este diseño. 3-4 párrafos técnicos y directos.

[INTEGRACIÓN CÓSMICA]
Cómo la carta natal y el Diseño Humano se confirman mutuamente. Los patrones de vida que emergen cuando ambos sistemas se leen juntos. Lo que la numerología agrega. 2-3 párrafos.

[PROPÓSITO Y MISIÓN DE VIDA]
El propósito profundo de ${lcForm.nombre.split(' ')[0]} según todos los sistemas combinados: numerología, astrología, I Ching y Diseño Humano. Lo que vino a hacer en esta vida. 2 párrafos.

[GUÍA DE ACCIÓN]
Recomendaciones concretas por trimestre del año ${ANIO} considerando los tránsitos Y la estrategia/autoridad del Diseño Humano:
Q1 (enero-marzo): acción principal + señal de alerta si se va al extremo + cómo volver al centro.
Q2 (abril-junio): acción principal + señal de alerta si se va al extremo + cómo volver al centro.
Q3 (julio-septiembre): acción principal + señal de alerta si se va al extremo + cómo volver al centro.
Q4 (octubre-diciembre): acción principal + señal de alerta si se va al extremo + cómo volver al centro.

Tono del informe: profesional, directo e informativo. Como un informe técnico experto. Sin metáforas poéticas, sin lenguaje emocional, sin frases tipo "cierra los ojos" o "escúchame desde adentro". Usa el nombre de pila en todo el informe. Máximo 220 palabras por sección.
`;
      const res = await fetch("https://function-bun-production-0725.up.railway.app/api/lectura-cosmica",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
      const data = await res.json();
      const texto = data.lectura||"Error al generar la lectura.";
      await guardarLectura("lecturas_cosmicas", lcForm.nombre, lcForm.fecha, lcForm.ciudad, texto, lcForm.email);
      setLcReport(texto);
    } catch { setLcReport("Error de conexión. Por favor intenta nuevamente."); }
    setLcScreen("report");
  };

  const cySections = parseSections(cyReport);
  const lcSections = parseSections(lcReport);

  return (
    <>
      <style>{S}</style>
      <div className="app">

        {/* ════ HOME ════ */}
        {tab==="home" && (
          <div className="z1 pb80">
            <div className="home-hero">
              <div className="home-eyebrow">· · · CICATRIZ 777 · · ·</div>
              <h1 className="home-title">Llevas tiempo<br/>funcionando.<br/>Ya es hora de<br/>entenderte.</h1>
              <div className="home-sub">Lecturas y herramientas para mujeres<br/>que saben que algo tiene que cambiar.</div>
            </div>

              <div style={{padding:"16px 16px 0"}}>
              <CardTuMapa
  onMapa={()=>setTab("cosmica")}
  onAno={()=>setTab("cosmico")}
  onRuido={()=>{setTab("programa");setProgView("home");}}
  onOraculo={()=>{setTab("oraculo");setOrPhase("home");}}
  onCombo={()=>window.open(LINKS.combo,"_blank")}
/>
              <div className="hl" style={{marginTop:16}}>
                <p>"Cicatriz nació porque la vida no me esperó. Tuve que seguir caminando mientras estaba rota por dentro — y para eso necesité herramientas reales. Las busqué, las creé, las fusioné. Eso es lo que hoy te ofrezco."</p>
              </div>
            </div>
            <div className="home-by">by Nane · Antofagasta, Chile · {ANIO}</div>
          </div>
        )}

        {/* ════ AÑO CÓSMICO ════ */}
        {tab==="cosmico" && (
          <div className="z1 pb80">
            {!tieneAcceso("cosmico") ? (
              <Gate producto="cosmico" emoji="🌌" titulo="Tu Año Cósmico" precio="$19.990 CLP" precioAntes="$27.990"
                subtitulo="Ingresa tu código de acceso para recibir tu lectura personalizada."
                linkCompra={LINKS.cosmico} onAccess={()=>darAcceso("cosmico")} onBack={()=>setTab("home")}/>
            ) : (
              <>
                <div className="header">
                  <button className="hbk" onClick={()=>setTab("home")}>‹</button>
                  <div className="htitle">Tu Año Cósmico</div>
                </div>
                <div className="cy-hero">
                  <span className="cy-glyph">{SVGLarge.cosmico}</span>
                  <div className="cy-title">Año Cósmico {ANIO}</div>
                  <div className="cy-sub">Numerología · I Ching · Tarot · Astrología</div>
                  <p className="cy-desc">Tu informe queda guardado durante todo el año. Cada año nuevo se recalcula con los tránsitos que corresponden.</p>
                </div>
                <div style={{padding:"28px 20px 0"}}>
                  {cyScreen==="form" && (
                    <>
                      <div className="field"><label className="flabel">Nombre completo</label>
                        <input className="finput" placeholder="Como aparece en tu documento" value={cyForm.nombre} onChange={e=>setCyForm({...cyForm,nombre:e.target.value})}/></div>
                      <div className="frow">
                        <div className="field"><label className="flabel">Fecha de nacimiento</label>
                          <input className="finput" type="date" value={cyForm.fecha} onChange={e=>setCyForm({...cyForm,fecha:e.target.value})}/></div>
                        <div className="field"><label className="flabel">Hora (opcional)</label>
                          <input className="finput" type="time" value={cyForm.hora} onChange={e=>setCyForm({...cyForm,hora:e.target.value})}/></div>
                      </div>
                      <div className="field"><label className="flabel">Ciudad y país de nacimiento</label>
                        <input className="finput" placeholder="Ej: Santiago, Chile" value={cyForm.ciudad} onChange={e=>setCyForm({...cyForm,ciudad:e.target.value})}/></div>
                      {lp && <div className="num-preview">
                        <div className="np-title">Tus números</div>
                        <div className="np-item"><span className="np-k">Camino de Vida</span><span className="np-v">{lp}</span></div>
                        <div className="np-item"><span className="np-k">Expresión</span><span className="np-v">{exp||"—"}</span></div>
                        <div className="np-item"><span className="np-k">Año Personal {ANIO}</span><span className="np-v">{py}</span></div>
                      </div>}
                      <button className="btn-primary" onClick={submitCosmic} disabled={!cyForm.nombre||!cyForm.fecha||!cyForm.ciudad}>✦ Generar mi lectura</button>
                    </>
                  )}
                  {cyScreen==="loading" && (
                    <div className="loading">
                      <span className="spin">🔮</span>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:"#e8c060",marginBottom:6}}>Consultando los astros</div>
                      <div className="ls-items">{LOADING_STEPS.map((s,i)=>(
                        <div key={i} className={`ls-item ${i<cyLoadStep?"done":i===cyLoadStep?"on":""}`}><div className="ls-dot"/>{s}</div>
                      ))}</div>
                    </div>
                  )}
                  {cyScreen==="report" && (
                    <ReportView nombre={cyForm.nombre} fecha={cyForm.fecha} ciudad={cyForm.ciudad} hora={cyForm.hora}
                      lp={lp} exp={exp} py={py} sections={cySections} glyph="🌟"
                      onReset={()=>{setCyScreen("form");setCyReport("");setCyForm({nombre:"",fecha:"",hora:"",ciudad:""});}}/>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════ Tu Mapa ════ */}
        {tab==="cosmica" && (
          <div className="z1 pb80">
            {!tieneAcceso("cosmica") ? (
              <Gate producto="cosmica" emoji="🔮" titulo="Tu Mapa" precio="$27.990 CLP"
                subtitulo="El mapa de cómo estás diseñada."
                linkCompra={LINKS.cosmica} onAccess={()=>darAcceso("cosmica")} onBack={()=>setTab("home")}/>
            ) : (
              <>
                <div className="header">
                  <button className="hbk" onClick={()=>setTab("home")}>‹</button>
                  <div className="htitle">Tu Mapa</div>
                </div>
                <div className="cy-hero" style={{background:"radial-gradient(ellipse at 50% 30%,rgba(200,144,10,.08) 0%,transparent 60%),linear-gradient(170deg,#1a1008 0%,var(--bg) 70%)"}}>
                  <span className="cy-glyph">{SVGLarge.cosmica}</span>
                  <div className="cy-title" style={{color:"var(--gold-l)"}}>Tu Mapa</div>
                  <div className="cy-sub" style={{color:"rgba(200,144,10,.45)"}}>Carta Natal · Diseño Humano · Integración profunda</div>
                  <p className="cy-desc">Tu carta natal y Diseño Humano se calculan automáticamente. Solo necesitas tu fecha, hora y ciudad de nacimiento.</p>
                </div>
                <div style={{padding:"28px 20px 0"}}>
                  {lcScreen==="form" && (
                    <>
                      <div className="sec-label">Datos personales</div>
                      <div className="field"><label className="flabel">Nombre completo</label>
                        <input className="finput" placeholder="Como aparece en tu documento" value={lcForm.nombre} onChange={e=>setLcForm({...lcForm,nombre:e.target.value})}/></div>
                        <div className="field"><label className="flabel">Correo electrónico</label><input className="finput" type="email" placeholder="tu@correo.com" value={lcForm.email} onChange={(e)=>setLcForm({...lcForm,email:e.target.value})} required/></div>
                      <div className="frow">
                        <div className="field"><label className="flabel">Fecha de nacimiento</label>
                          <input className="finput" type="date" value={lcForm.fecha} onChange={e=>setLcForm({...lcForm,fecha:e.target.value})}/></div>
                        <div className="field"><label className="flabel">Hora exacta</label>
                          <input className="finput" type="time" value={lcForm.hora} onChange={e=>setLcForm({...lcForm,hora:e.target.value})}/></div>
                      </div>
                      <div className="field"><label className="flabel">Ciudad y país de nacimiento</label>
                        <input className="finput" placeholder="Ej: Santiago, Chile" value={lcForm.ciudad} onChange={e=>setLcForm({...lcForm,ciudad:e.target.value})}/></div>

                      <div style={{background:"rgba(20,60,100,.12)",border:"1px solid rgba(80,140,200,.15)",borderRadius:10,padding:"14px 16px",marginTop:8,marginBottom:18,fontSize:12.5,color:"rgba(160,200,240,.6)",lineHeight:1.7}}>
                        ⬡ Tu Diseño Humano se calcula automáticamente a partir de tu fecha, hora exacta y ciudad de nacimiento. Mientras más exacta la hora, más preciso el resultado.
                      </div>
                      <button className="btn-primary" style={{background:"linear-gradient(135deg,#1a4a7a,#2a6aaa)"}} onClick={submitCosmica} disabled={!lcForm.nombre||!lcForm.fecha||!lcForm.ciudad||!lcForm.email}>✦ Generar mi Mapa</button>
                    </>
                  )}
                  {lcScreen==="loading" && (
                    <div className="loading">
                      <span className="spin">🔮</span>
                      <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:"#a8d4f8",marginBottom:6}}>Integrando los sistemas</div>
                      <div className="ls-items">{LOADING_STEPS_COSMICA.map((s,i)=>(
                        <div key={i} className={`ls-item ${i<lcLoadStep?"done":i===lcLoadStep?"on":""}`}><div className="ls-dot"/>{s}</div>
                      ))}</div>
                    </div>
                  )}
                  {lcScreen==="report" && (
                    <ReportView nombre={lcForm.nombre} fecha={lcForm.fecha} ciudad={lcForm.ciudad} hora={lcForm.hora}
                      lp={lcLp} exp={lcExp} py={lcPy} sections={lcSections} glyph="🔮"
                      onReset={()=>{setLcScreen("form");setLcReport("");setLcForm({nombre:"",fecha:"",hora:"",ciudad:"",tipo:"",autoridad:"",perfil:"",centros:""});}}/>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════ ORÁCULO ════ */}
        {tab==="oraculo" && (
          <div className="z1">
            {!tieneAcceso("oraculo") ? (
              <Gate producto="oraculo" emoji="🌸" titulo="Oráculo Kintsugi" precio="$9.990 CLP"
                subtitulo="Una carta al día. Un ritual de presencia."
                linkCompra={LINKS.oraculo} onAccess={()=>darAcceso("oraculo")} onBack={()=>setTab("home")}/>
            ) : (
              <>
                {orPhase==="home" && (
                  <div className="pb80">
                    <div className="or-hero">
                      <div className="or-title" style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}><span style={{display:"flex"}}>{SVGLarge.oraculo}</span> Oráculo Kintsugi</div>
                      <div className="or-sub">Una carta al día · Ritual de presencia</div>
                    </div>
                    <div className="streak-bar">
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:18}}>🔥</span>
                        <div><div className="streak-n">{streak}</div><div className="streak-lbl">días seguidos</div></div>
                      </div>
                      <div className="streak-dots">{[0,1,2,3,4,5,6].map(i=>(
                        <div key={i} className={`sd ${i<streak?"done":i===streak?"today":""}`}/>
                      ))}</div>
                    </div>
                    <div style={{padding:"20px 20px 0"}}>
                      {drawnToday ? (
                        <div style={{background:"rgba(140,80,200,.06)",border:"1px solid rgba(140,80,200,.12)",borderRadius:16,padding:28,textAlign:"center",marginBottom:14}}>
                          <div style={{fontSize:36,marginBottom:10,opacity:.6}}>🌙</div>
                          <div style={{fontFamily:"'Fraunces',serif",fontSize:17,color:"rgba(200,160,240,.55)",marginBottom:6}}>Ya recibiste tu carta de hoy</div>
                          <div style={{fontSize:13,color:"rgba(160,120,220,.35)",fontStyle:"italic"}}>Vuelve mañana para una nueva.</div>
                        </div>
                      ) : (
                        <div className="today-card" onClick={()=>setOrPhase("breathe")}>
                          <div className="tc-status">✦ Disponible ahora</div>
                          <span className="tc-big-icon" style={{display:"flex",justifyContent:"center"}}>{SVGLarge.oraculo}</span>
                          <div className="tc-big-t">Tu carta de hoy</div>
                          <div className="tc-big-s">Una carta. Un momento. Solo para ti.</div>
                          <button className="tc-go">Comenzar el ritual →</button>
                        </div>
                      )}
                      {orHistory.length>0 && <div style={{marginTop:20}}>
                        <div className="sec-label">Cartas recientes</div>
                        {orHistory.slice(0,4).map((h,i)=>(
                          <div key={i} className="past-c" onClick={()=>{setCurrentCard(h.card);setFlipped(true);setJournalText(h.note||"");setCardSaved(true);setOrPhase("card");}}>
                            <div className="pc-date">{h.date===todayKey?"Hoy":h.date}</div>
                            <div><div className="pc-n">{h.card.name}</div><div className="pc-p">"{h.card.phrase.slice(0,48)}..."</div></div>
                          </div>
                        ))}
                      </div>}
                    </div>
                  </div>
                )}

                {orPhase==="breathe" && (
                  <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
                    <div className="ritual-wrap">
                      <span className="rg">🌬️</span>
                      <div className="rt">Antes de recibir</div>
                      <div className="rs2">un momento de presencia</div>
                      <p style={{fontSize:14,color:"rgba(200,175,240,.55)",marginBottom:28,maxWidth:280,textAlign:"center",lineHeight:1.7}}>Toma tres respiraciones contigo.</p>
                      <div className="breathe-c">{breathCount%2===0?"↑":"↓"}</div>
                      <div className="breathe-lbl">{breathCount%2===0?"Inhala...":"Exhala..."}</div>
                      <button className="draw-btn" onClick={()=>setOrPhase("intention")}>
                        <span className="db-icon">✦</span><span className="db-lbl">Estoy presente</span><span className="db-sub">continuar</span>
                      </button>
                    </div>
                  </div>
                )}

                {orPhase==="intention" && (
                  <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
                    <div className="header" style={{background:"rgba(8,5,14,.95)",borderBottom:"1px solid rgba(140,80,200,.08)"}}>
                      <button className="hbk" onClick={()=>setOrPhase("breathe")}>‹</button>
                      <div className="htitle" style={{color:"var(--gold-l)"}}>¿Cómo estás hoy?</div>
                    </div>
                    <div style={{padding:"28px 20px 90px",display:"flex",flexDirection:"column",alignItems:"center"}}>
                      <p style={{fontSize:13,color:"rgba(180,130,220,.45)",fontStyle:"italic",marginBottom:22,textAlign:"center"}}>Toca lo que más se acerca a lo que sientes</p>
                      <div className="emo-grid">
                        {EMOCIONES.map((e,i) => (
                          <button key={i} className="emo-btn" onClick={()=>handleEmocion(e)}>
                            <span className="emo-emoji">{e.emoji}</span>
                            <span className="emo-label">{e.label}</span>
                          </button>
                        ))}
                      </div>
                      <button className="emo-otra" onClick={handleOtra}>
                        Otra cosa que no veo aquí...
                      </button>
                    </div>
                  </div>
                )}

                {orPhase==="cats" && (
                  <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
                    <div className="header" style={{background:"rgba(8,5,14,.95)",borderBottom:"1px solid rgba(140,80,200,.08)"}}>
                      <button className="hbk" onClick={()=>setOrPhase("intention")}>‹</button>
                      <div className="htitle" style={{color:"var(--gold-l)"}}>Elige tu camino</div>
                    </div>
                    <div className="cats-wrap">
                      <div className="cats-title">Para lo que sientes</div>
                      <div className="cats-sub">¿desde dónde quieres trabajarlo?</div>
                      {intention && intention !== "otra" && <div className="cats-int">"{intention}"</div>}
                      <div className="cat-cards">
                        {orCats.map(c => (
                          <div key={c.id} className="cat-card"
                            style={{background:`rgba(${c.id===1?"232,144,144":c.id===2?"232,200,128":c.id===3?"144,216,160":"144,184,232"},.08)`,borderColor:`rgba(${c.id===1?"220,100,100":c.id===2?"220,180,80":c.id===3?"100,200,120":"100,140,220"},.22)`}}
                            onClick={()=>selectCat(c)}>
                            <span className="cat-card-emoji">{c.emoji}</span>
                            <div className="cat-card-body">
                              <div className="cat-card-name" style={{color:c.color}}>{c.name}</div>
                              <div className="cat-card-desc" style={{color:c.color}}>{c.cards.length} cartas · toca para elegir →</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {orPhase==="grid" && selectedCat && (
                  <div className="z1">
                    <div className="header" style={{background:"rgba(8,5,14,.95)",borderBottom:`1px solid ${selectedCat.border}`}}>
                      <button className="hbk" onClick={()=>setOrPhase("cats")}>‹</button>
                      <div className="htitle" style={{color:selectedCat.color}}>{selectedCat.emoji} {selectedCat.name}</div>
                    </div>
                    <div className="grid-wrap">
                      <div className="grid-header">
                        <div className="grid-title" style={{color:selectedCat.color}}>Elige tu carta</div>
                        <div className="grid-sub">Toca la que te llame</div>
                      </div>
                      <div className="cards-grid">
                        {selectedCat.cards.map((card,i) => (
                          <div key={card.id} className="grid-card"
                            style={{background:`rgba(${selectedCat.id===1?"232,144,144":selectedCat.id===2?"232,200,128":selectedCat.id===3?"144,216,160":"144,184,232"},.07)`,borderColor:`rgba(${selectedCat.id===1?"220,100,100":selectedCat.id===2?"220,180,80":selectedCat.id===3?"100,200,120":"100,140,220"},.18)`}}
                            onClick={()=>selectCardFromGrid(card)}>
                            <span className="grid-card-back">{selectedCat.emoji}</span>
                            <span className="grid-card-num" style={{color:selectedCat.color}}>carta {i+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {orPhase==="card" && currentCard && currentCard.cat && (
                  <div className="z1">
                    <div className="header" style={{background:"rgba(8,5,14,.95)",borderBottom:"1px solid rgba(140,80,200,.08)"}}>
                      <button className="hbk" onClick={()=>setOrPhase("grid")}>‹</button>
                      <div className="htitle" style={{color:currentCard.cat.color}}>{currentCard.cat.emoji} {currentCard.cat.name}</div>
                    </div>
                    <div className="card-stage">
                      <div className="oracle-card">
                        <div className={`card-flip${flipped?" flipped":""}`}>
                          <div className="card-face card-back" onClick={()=>setFlipped(true)}>
                            <div className="cbp"/>
                            <span className="cb-g" style={{display:"flex",justifyContent:"center"}}>{SVGLarge.oraculo}</span>
                            <div className="cb-t">Kintsugi</div>
                            <div className="cb-h">Toca para revelar</div>
                          </div>
                          <div className="card-face card-front" style={{background:currentCard.cat.bg,borderColor:currentCard.cat.border}}>
                            <div className="cf-cat" style={{color:currentCard.cat.color}}>{currentCard.cat.emoji} {currentCard.cat.name}</div>
                            <div className="cf-name" style={{color:currentCard.cat.color}}>{currentCard.name}</div>
                            <div className="cf-emo" style={{color:currentCard.cat.color}}>{currentCard.emocion}</div>
                            <div className="cf-canal" style={{color:currentCard.cat.color}}>Canal · {currentCard.canal}</div>
                            <div className="cf-div" style={{background:currentCard.cat.color}}/>
                            <div className="cf-phrase" style={{color:currentCard.cat.color}}>"{currentCard.phrase}"</div>
                            <div className="cf-al" style={{color:currentCard.cat.color}}>Acción</div>
                            <div className="cf-a" style={{color:currentCard.cat.color}}>{currentCard.accion}</div>
                          </div>
                        </div>
                      </div>
                      {intention && <div className="int-display" style={{width:"100%",maxWidth:300}}>
                        <div className="id-lbl">Lo que trajiste hoy</div>
                        <div className="id-t">"{intention}"</div>
                      </div>}
                    </div>
                    {flipped && (
                      <div className="below-card">
                        <div className="journal">
                          <div className="jlbl">Tu reflexión</div>
                          <div className="jq">{JQ[currentCard.id%JQ.length]}</div>
                          <textarea className="jta" placeholder="Escribe lo que resuena..." value={journalText} onChange={e=>setJournalText(e.target.value)} rows={3} readOnly={cardSaved}/>
                        </div>
                        {!cardSaved ? (
                          <button className="save-btn" onClick={saveCard}>✦ Guardar en mi diario</button>
                        ) : (
                          <div className="saved-conf">
                            <div className="sc-ico">✨</div>
                            <div className="sc-t">Guardada en tu diario</div>
                            <div className="sc-s">Vuelve mañana para tu próxima carta.</div>
                            <button className="sc-btn" onClick={()=>setOrPhase("home")}>Volver al inicio</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ════ PROGRAMA ════ */}
        {tab==="programa" && (
          <div className="z1">
            {!tieneAcceso("programa") ? (
              <Gate producto="programa" emoji="🌿" titulo="21 Días para Bajar el Ruido" precio="$19.990 CLP" precioAntes="$24.990"
                subtitulo="5 minutos al día para recuperar tu centro."
                linkCompra={LINKS.programa} onAccess={()=>darAcceso("programa")} onBack={()=>setTab("home")}/>
            ) : (
              <>
                {progView==="home" && (
                  <div className="pb80">
                    <div className="prog-hero">
                      <div className="prog-t">🌿 Bajar el Ruido</div>
                      <div className="prog-s">21 días · 5 minutos al día</div>
                    </div>
                    <div className="prog-bar-wrap">
                      <div className="prog-bar-row"><span>Día {currentDay} de 21</span><span>{progress}% completado</span></div>
                      <div className="prog-bar"><div className="prog-fill" style={{width:`${progress}%`}}/></div>
                    </div>
                    <div style={{padding:"20px 20px 0"}}>
                      <div className="day-scroll">
                        {Array.from({length:21},(_,i)=>i+1).map(d=>(
                          <button key={d} className={`day-b ${isDone(d)?"done":""} ${d===currentDay?"active":""} ${!isActive(d)?"locked":""}`}
                            onClick={()=>{if(isActive(d)){setActiveDay(d);setProgView("day");}}}>
                            {isDone(d)?"✓":d}
                          </button>
                        ))}
                      </div>
                      <div className="today-box" onClick={()=>{setActiveDay(currentDay);setProgView("day");}}>
                        <div className="tb-lbl">Tu día de hoy</div>
                        <div className="tb-t">Día {currentDay} — {DIAS[currentDay]?.titulo}</div>
                        <div className="tb-s">{BLOQUES[DIAS[currentDay]?.bloque]?.name}</div>
                        <button className="go-btn">Ir al día →</button>
                      </div>
                      <div style={{marginTop:20}}>
                        <div className="sec-label">Los 3 bloques</div>
                        {[1,2,3].map(b=>(
                          <div key={b} style={{background:b===1?"rgba(60,120,60,.1)":b===2?"rgba(80,100,160,.1)":"rgba(140,100,60,.1)",border:`1px solid ${b===1?"rgba(80,160,80,.12)":b===2?"rgba(100,130,200,.12)":"rgba(160,120,60,.12)"}`,borderRadius:12,padding:"14px 16px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12}} onClick={()=>{setActiveDay(BLOQUES[b].days[0]);setProgView("day");}}>
                            <span style={{fontSize:24}}>{b===1?"🌬️":b===2?"🌊":"🌱"}</span>
                            <div style={{flex:1}}>
                              <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:BLOQUES[b].color,textTransform:"uppercase",opacity:.7,marginBottom:2}}>Bloque {b} · Días {BLOQUES[b].days[0]}–{BLOQUES[b].days[6]}</div>
                              <div style={{fontFamily:"'Fraunces',serif",fontSize:15,color:"#b8d8bc"}}>{BLOQUES[b].name}</div>
                            </div>
                            <span style={{color:"rgba(120,180,130,.3)",fontSize:16}}>›</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {progView==="day" && dia && bloque && (
                  <div className="pb80">
                    <div className="header" style={{background:"rgba(8,14,10,.95)",borderBottom:"1px solid rgba(80,160,80,.07)"}}>
                      <button className="hbk" style={{color:"rgba(120,200,130,.45)"}} onClick={()=>setProgView("home")}>‹</button>
                      <div className="htitle" style={{color:"#7ecf94"}}>{dia.titulo}</div>
                      <div className="hsub">Día {activeDay}</div>
                    </div>
                    <div style={{padding:"20px"}}>
                      <div className="day-card">
                        <div className="dc-head">
                          <div className="dc-blq" style={{color:bloque.color}}>Bloque {dia.bloque} · {bloque.name}</div>
                          <div className="dc-num">Día {activeDay} de 21</div>
                          <div className="dc-t">{dia.titulo}</div>
                        </div>
                        <div className="momento">
                          <span className="m-badge" style={{background:"rgba(60,120,80,.2)",border:"1px solid rgba(80,180,80,.2)",color:"#7ecf94"}}>Mañana</span>
                          <div className="m-title" style={{color:"#c8e8cc"}}>Enfoque del día</div>
                          <div className="m-text" style={{fontFamily:"'Fraunces',serif",fontStyle:"italic",fontSize:16,color:"rgba(180,220,190,.75)"}}>{dia.manana}</div>
                        </div>
                        <div className="momento">
                          <span className="m-badge" style={{background:"rgba(80,100,140,.2)",border:"1px solid rgba(100,130,180,.2)",color:"#90a8d0"}}>Acción</span>
                          <div className="m-title" style={{color:"#a8c0d8"}}>Tu acción de hoy</div>
                          <div className="m-text">{dia.accion}</div>
                        </div>
                      </div>
                      <div className="aterrizaje">
                        <div className="at-lbl">Aterrizaje</div>
                        <div className="at-t">"{dia.aterrizaje}"</div>
                        <div className="check-row">
                          <button className={`check-btn check-min${done[activeDay]?.min?" on":""}`} onClick={()=>setDone(p=>({...p,[activeDay]:{...p[activeDay],min:!p[activeDay]?.min}}))}>
                            {done[activeDay]?.min?"✓":"○"} Mínimo
                          </button>
                          <button className={`check-btn check-full${done[activeDay]?.full?" on":""}`} onClick={()=>{setDone(p=>({...p,[activeDay]:{...p[activeDay],full:!p[activeDay]?.full}}));if(!done[activeDay]?.full&&activeDay===currentDay&&currentDay<21)setTimeout(()=>setCurrentDay(d=>Math.max(d,activeDay+1)),300);}}>
                            {done[activeDay]?.full?"✓ Completo":"◉ Completo"}
                          </button>
                        </div>
                      </div>
                      <div className="note-wrap">
                        <div className="note-lbl">Nota rápida</div>
                        <textarea className="note-inp" placeholder="¿Qué gatilló tu estado hoy?" value={notes[activeDay]||""} onChange={e=>setNotes(p=>({...p,[activeDay]:e.target.value}))} rows={2}/>
                      </div>
                      <div className="day-nav">
                        {activeDay>1 && <button className="dn-btn" onClick={()=>setActiveDay(d=>d-1)}>‹ Día {activeDay-1}</button>}
                        {activeDay<21&&isActive(activeDay+1) && <button className="dn-btn fwd" onClick={()=>setActiveDay(d=>d+1)}>Día {activeDay+1} ›</button>}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ════ BOTTOM NAV ════ */}
        <div className="bnav">
          {[
            {id:"home",icon:SVG.home,lbl:"Inicio"},
            {id:"cosmico",icon:SVG.cosmico,lbl:"Cósmico"},
            {id:"cosmica",icon:SVG.cosmica,lbl:"Tu Mapa"},
            {id:"oraculo",icon:SVG.oraculo,lbl:"Oráculo"},
            {id:"programa",icon:SVG.programa,lbl:"21 Días"},
          ].map(n=>(
            <div key={n.id} className={`bni${tab===n.id?" on":""}`} onClick={()=>setTab(n.id)}>
              <span className="bni-icon">{n.icon}</span>
              <span className="bni-label">{n.lbl}</span>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}

/* =========================================================
   CARD DESTACADA — TU MAPA  (Cicatriz)
   Pegar al FINAL de cicatriz-completo.jsx.
   Se usa en la home así:

     <CardTuMapa
       onMapa={()=>setTab("cosmica")}
       onAno={()=>setTab("cosmico")}
       onRuido={()=>{setTab("programa");setProgView("home");}}
       onOraculo={()=>{setTab("oraculo");setOrPhase("home");}}
       onCombo={()=>window.open(LINKS.combo,"_blank")}
     />
   ========================================================= */

const TM_SISTEMAS = [
  { n: "Numerología", t: "Los números de tu fecha y tu nombre: el carácter con el que llegaste." },
  { n: "Carta Natal", t: "La foto del cielo el día que naciste: tu temperamento de base." },
  { n: "Astrología del año", t: "Qué está activo en tu vida ahora y hasta cuándo dura." },
  { n: "Las 12 Casas", t: "En qué área concreta —dinero, vínculos, trabajo— se juega cada energía." },
  { n: "I Ching", t: "La lectura del momento: qué pide moverse y qué pide esperar." },
  { n: "Tarot + Lenormand", t: "La imagen que resume el ciclo que estás atravesando." },
  { n: "Diseño Humano", t: "Cómo tomas decisiones correctas y cómo funciona tu energía." },
];

const TM_CAPAS = [
  { n: "Integración Cósmica", t: "Donde los 7 sistemas dicen lo mismo. El patrón que se repite sin que nadie se ponga de acuerdo." },
  { n: "Propósito y Misión", t: "A qué viniste, dicho en una frase que vas a reconocer apenas la leas." },
  { n: "Guía de Acción Trimestral", t: "Qué hacer con todo esto en los próximos tres meses. Concreto." },
];

const TM_TESTIMONIOS = [
  { q: "No es un consejo ni una guía. Es certeza de quién eres de verdad.", a: "Andrea G." },
  { q: "Me sentí súper identificada. La sentí mucho más personalizada de lo que creía.", a: "Giselle M." },
  { q: "Me voló la cabeza cuando leí mi propósito, a qué vine.", a: "Carolina Q." },
];

function CardTuMapa({ onMapa, onAno, onRuido, onOraculo, onCombo }) {
  const TM_OTROS = [
    { n: "Tu Año Cósmico", p: "$19.990", go: onAno },
    { n: "Bajar el Ruido", p: "$19.990", go: onRuido },
    { n: "Oráculo Kintsugi", p: "$9.990", go: onOraculo },
  ];

  return (
    <div className="tm-wrap">
      <style>{`
        .tm-wrap { padding: 0; }

        .tm-card {
          background: var(--surface);
          border: 1px solid rgba(200,144,10,.3);
          border-radius: 16px;
          padding: 26px 20px 30px;
          position: relative;
          overflow: hidden;
        }
        .tm-card::before {
          content: "";
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg,transparent,rgba(200,144,10,.6),transparent);
        }

        .tm-badge {
          display: inline-block;
          font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(200,144,10,.8);
          border: 1px solid rgba(200,144,10,.3);
          border-radius: 20px;
          padding: 5px 12px;
          margin-bottom: 16px;
        }
        .tm-titulo {
          font-family: 'Fraunces', serif;
          font-size: 40px; font-weight: 900; line-height: 1.05;
          color: var(--gold-l);
          margin: 0 0 8px;
        }
        .tm-bajada {
          font-family: 'Fraunces', serif; font-style: italic;
          font-size: 17px; color: rgba(200,144,10,.8);
          margin: 0 0 6px;
        }
        .tm-promesa {
          font-size: 14.5px; line-height: 1.6;
          color: rgba(245,236,215,.75);
          margin: 0 0 24px;
        }

        .tm-ancla {
          border-left: 3px solid rgba(200,144,10,.6);
          background: rgba(200,144,10,.04);
          border-radius: 0 12px 12px 0;
          padding: 16px 16px 16px 18px;
          margin: 0 0 30px;
          font-family: 'Fraunces', serif;
          font-size: 14.5px; line-height: 1.7;
          color: rgba(245,236,215,.85);
        }

        .tm-h3 {
          font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(200,144,10,.7);
          margin: 0 0 16px;
        }

        .tm-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px 14px;
          margin-bottom: 30px;
        }
        .tm-n {
          font-family: 'Fraunces', serif;
          font-size: 14px; color: var(--gold-l);
          margin: 0 0 3px; line-height: 1.25;
        }
        .tm-t {
          font-size: 11.5px; line-height: 1.45;
          color: rgba(245,236,215,.65);
          margin: 0;
        }

        .tm-capas { margin-bottom: 30px; }
        .tm-capa {
          border-top: 1px solid var(--border);
          padding: 13px 0;
        }
        .tm-capa:last-child { border-bottom: 1px solid var(--border); }

        .tm-muestra {
          background: rgba(245,236,215,.03);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px 18px;
          margin-bottom: 30px;
        }
        .tm-muestra p {
          font-family: 'Fraunces', serif;
          font-size: 14px; line-height: 1.75;
          color: rgba(245,236,215,.8);
          margin: 0 0 14px;
        }
        .tm-pie {
          font-size: 11.5px !important;
          font-style: italic;
          color: rgba(200,144,10,.6) !important;
          margin: 0 !important;
        }

        .tm-testis { display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px; padding-top: 4px; }
        .tm-testi { border-left: 2px solid rgba(200,144,10,.25); padding-left: 14px; }
        .tm-testi q {
          display: block; quotes: none;
          font-family: 'Fraunces', serif; font-style: italic;
          font-size: 13.5px; line-height: 1.65;
          color: rgba(245,236,215,.72);
          margin-bottom: 6px;
        }
        .tm-testi span {
          font-size: 9px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(200,144,10,.6);
        }

        .tm-cierre { text-align: center; }
        .tm-precio {
          font-family: 'Fraunces', serif;
          font-size: 32px; color: var(--gold-l);
          margin: 0 0 4px;
        }
        .tm-pago {
          font-size: 11px; letter-spacing: 1px;
          color: rgba(200,144,10,.5);
          margin: 0 0 18px;
        }
        .tm-cta {
          width: 100%;
          background: linear-gradient(135deg,#c8900a,#a06a0a);
          color: #110d08;
          font-size: 15px; font-weight: 700; letter-spacing: .5px;
          border: none; border-radius: 12px;
          padding: 16px 0;
          cursor: pointer;
          transition: filter 160ms ease, transform 160ms ease;
        }
        .tm-cta:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .tm-cta:focus-visible { outline: 2px solid var(--gold-l); outline-offset: 3px; }

        .tm-otros {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 8px 20px;
          margin: 22px 0 0;
        }
        .tm-otro {
          background: none; border: none; cursor: pointer;
          font-size: 12px;
          color: rgba(245,236,215,.4);
          padding: 4px 0;
          transition: color 160ms ease;
        }
        .tm-otro:hover { color: rgba(245,236,215,.75); }
        .tm-otro b { font-weight: 600; color: inherit; }

        .tm-combo {
          margin-top: 22px;
          background: rgba(200,144,10,.04);
          border: 1px solid rgba(200,144,10,.15);
          border-radius: 12px;
          padding: 18px 18px 16px;
          text-align: center;
          cursor: pointer;
          transition: border-color 160ms ease;
        }
        .tm-combo:hover { border-color: rgba(200,144,10,.35); }
        .tm-combo-t {
          font-family: 'Fraunces', serif;
          font-size: 15px; color: var(--gold-l);
          margin: 0 0 6px; line-height: 1.35;
        }
        .tm-combo-s {
          font-size: 12px; line-height: 1.5;
          color: rgba(245,236,215,.5);
          margin: 0 0 10px;
        }
        .tm-combo-p {
          font-size: 12px; color: rgba(200,144,10,.7); letter-spacing: .5px;
        }
        .tm-combo-f {
          font-size: 10.5px; letter-spacing: .5px;
          color: rgba(245,236,215,.35);
          margin-top: 8px;
        }

        @media (max-width: 420px) {
          .tm-grid { grid-template-columns: 1fr; gap: 14px; }
          .tm-titulo { font-size: 34px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tm-cta { transition: none; }
          .tm-cta:hover { transform: none; }
        }
      `}</style>

      <div className="tm-card">
        <div className="tm-badge">✦ Producto estrella</div>

        <h2 className="tm-titulo">Tu Mapa</h2>
        <div className="tm-bajada">El mapa de cómo estás diseñada.</div>
        <div className="tm-promesa">Entiende, por primera vez, por qué eres como eres.</div>

        <div className="tm-ancla">
          No es un horóscopo. Son 7 sistemas leyendo lo mismo desde 7 ángulos
          distintos, y 3 capas de síntesis que revelan el patrón que todos confirman.
        </div>

        <div className="tm-h3">· Qué te dice cada sistema ·</div>
        <div className="tm-grid">
          {TM_SISTEMAS.map((s) => (
            <div key={s.n}>
              <div className="tm-n">{s.n}</div>
              <p className="tm-t">{s.t}</p>
            </div>
          ))}
        </div>

        <div className="tm-h3">· Las 3 capas que lo unen todo ·</div>
        <div className="tm-capas">
          {TM_CAPAS.map((c) => (
            <div className="tm-capa" key={c.n}>
              <div className="tm-n">{c.n}</div>
              <p className="tm-t">{c.t}</p>
            </div>
          ))}
        </div>

        <div className="tm-h3">· Un fragmento real del informe ·</div>
        <div className="tm-muestra">
          <p>
            Tu Sol en Leo en la Casa 2 y el Canal 2-14, el «Pulso del Dinero»,
            están diciendo lo mismo desde dos idiomas distintos: los recursos
            llegan a ti cuando te muestras tal como eres, no cuando te esfuerzas
            de más. Tu valor no se construye a fuerza de trabajo; se revela cuando
            dejas de esconder lo que te hace distinta. Cada vez que forzaste el
            esfuerzo para merecer, remaste contra tu propio diseño.
          </p>
          <p className="tm-pie">
            Este es un fragmento de un mapa real. El tuyo se calcula con tus datos.
          </p>
        </div>

        <div className="tm-testis">
          {TM_TESTIMONIOS.map((t) => (
            <div className="tm-testi" key={t.a}>
              <q>«{t.q}»</q>
              <span>— {t.a}</span>
            </div>
          ))}
        </div>

        <div className="tm-cierre">
          <div className="tm-precio">$27.990 CLP</div>
          <div className="tm-pago">Pago único · Acceso inmediato</div>
          <button className="tm-cta" onClick={onMapa}>Quiero mi Mapa →</button>
        </div>
      </div>

      <div className="tm-otros">
        {TM_OTROS.map((o) => (
          <button className="tm-otro" key={o.n} onClick={o.go}>
            <b>{o.n}</b> · {o.p}
          </button>
        ))}
      </div>

      <div className="tm-combo" onClick={onCombo}>
        <div className="tm-combo-t">Tu Mapa + todo lo demás</div>
        <div className="tm-combo-s">
          Por $12.000 más te llevas también Tu Año Cósmico, el Oráculo Kintsugi y
          los 21 días de Bajar el Ruido.
        </div>
        <div className="tm-combo-p">$39.990 CLP · Comprar ahora →</div>
        <div className="tm-combo-f">Pack de lanzamiento · disponible hasta el 3 de agosto</div>
      </div>
    </div>
  );
}

