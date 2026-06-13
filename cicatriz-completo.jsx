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
  const data = await sbFetch(`CODIGOS?codigo=eq.${encodeURIComponent(codigo)}&usado=eq.false&select=*`);
  if (!data || data.length === 0) return null;
  const row = data[0];
  if (row.producto !== "all" && row.producto !== producto) return null;
  return row;
};

const buscarLectura = async (tabla, nombre, fecha) => {
  const data = await sbFetch(`${tabla}?nombre=eq.${encodeURIComponent(nombre.trim().toLowerCase())}&fecha_nacimiento=eq.${encodeURIComponent(fecha)}&select=informe`);
  if (!data || data.length === 0) return null;
  return data[0].informe;
};

const guardarLectura = async (tabla, nombre, fecha, ciudad, informe) => {
  await sbFetch(tabla, {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify({ nombre: nombre.trim().toLowerCase(), fecha_nacimiento: fecha, ciudad, informe }),
  });
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,400;1,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── LINKS DE PAGO ───────────────────────────────────────────
const LINKS = {
  cosmico:  "https://mpago.la/1PnezC6",   // actualizar cuando tengas links nuevos
  cosmica:  "https://mpago.la/PENDIENTE",
  oraculo:  "https://mpago.la/PENDIENTE",
  programa: "https://mpago.la/1aYsaBZ",
  combo:    "https://mpago.la/PENDIENTE",
  upgrade:  "https://mpago.la/PENDIENTE",
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
  --bg:#08060e;--surface:#110f1a;--gold:#c8900a;--gold-l:#e8c060;--text:#e8e0d0;--muted:#7a6a50;--border:rgba(200,150,40,0.12);
}
body{background:var(--bg);}
.app{background:var(--bg);min-height:100vh;font-family:'DM Sans',sans-serif;color:var(--text);max-width:480px;margin:0 auto;position:relative;overflow-x:hidden;}
.app::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 20% 20%,rgba(180,120,20,0.07) 0%,transparent 50%),radial-gradient(ellipse at 80% 70%,rgba(100,50,180,0.06) 0%,transparent 50%);pointer-events:none;z-index:0;}
.z1{position:relative;z-index:1;}
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:rgba(8,5,14,0.97);border-top:1px solid var(--border);display:flex;padding:8px 0 14px;z-index:100;backdrop-filter:blur(12px);}
.bni{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;transition:all 0.2s;}
.bni-icon{font-size:20px;line-height:1;}
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

/* ── GATE ── */
.gate-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;}
.gate-glyph{font-size:56px;margin-bottom:20px;display:block;}
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
.gate-combo{background:linear-gradient(135deg,rgba(140,80,200,.15),rgba(80,40,140,.1));border:1px solid rgba(160,90,220,.25);border-radius:12px;padding:16px;width:100%;max-width:300px;text-align:center;cursor:pointer;text-decoration:none;display:block;margin-top:10px;transition:all .2s;}
.gate-combo:hover{border-color:rgba(160,90,220,.5);}
.gate-combo-label{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(160,100,220,.5);margin-bottom:4px;}
.gate-combo-price{font-family:'Fraunces',serif;font-size:18px;color:#d4a8f8;margin-bottom:2px;}
.gate-combo-sub{font-size:11px;color:rgba(160,100,220,.35);}

/* ── HOME ── */
.home-hero{text-align:center;padding:56px 20px 44px;border-bottom:1px solid var(--border);background:radial-gradient(ellipse at 50% 30%,rgba(180,120,20,.1) 0%,transparent 65%);}
.home-glyph{font-size:56px;display:block;margin-bottom:16px;filter:drop-shadow(0 0 24px rgba(200,160,30,.4));}
.home-eyebrow{font-size:10px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:12px;opacity:.8;}
.home-title{font-family:'Fraunces',serif;font-size:clamp(44px,12vw,80px);font-weight:900;color:var(--gold-l);letter-spacing:-2px;line-height:.95;margin-bottom:8px;}
.home-sub{font-family:'Fraunces',serif;font-style:italic;font-size:15px;color:rgba(200,160,60,.45);margin-bottom:14px;}
.home-desc{font-size:15px;line-height:1.75;color:rgba(200,180,140,.55);max-width:380px;margin:0 auto;}
.tool-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:22px;margin-bottom:12px;cursor:pointer;transition:all .25s;display:flex;align-items:center;gap:16px;}
.tool-card:hover{border-color:rgba(200,150,40,.3);transform:translateY(-1px);}
.tc-icon{font-size:36px;flex-shrink:0;}
.tc-body{flex:1;}
.tc-tag{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:3px;opacity:.7;}
.tc-title{font-family:'Fraunces',serif;font-size:18px;color:var(--gold-l);margin-bottom:2px;}
.tc-desc{font-size:12px;color:var(--muted);}
.tc-price{font-size:11px;color:rgba(180,140,60,.5);margin-top:4px;font-weight:600;}
.tc-arrow{color:rgba(200,150,40,.3);font-size:20px;}
.home-by{text-align:center;padding:20px;font-family:'Fraunces',serif;font-style:italic;font-size:12px;color:rgba(160,130,50,.3);}

/* ── COSMIC / COSMICA ── */
.cy-hero{text-align:center;padding:36px 20px 24px;background:radial-gradient(ellipse at 50% 30%,rgba(120,60,180,.12) 0%,transparent 60%),linear-gradient(170deg,#12080e 0%,var(--bg) 70%);border-bottom:1px solid var(--border);}
.cy-glyph{font-size:44px;display:block;margin-bottom:10px;}
.cy-title{font-family:'Fraunces',serif;font-size:clamp(22px,5vw,36px);font-weight:900;color:#d4a8f8;margin-bottom:4px;}
.cy-sub{font-family:'Fraunces',serif;font-style:italic;font-size:13px;color:rgba(180,130,220,.4);margin-bottom:8px;}
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
.or-hero{text-align:center;padding:32px 20px 24px;background:radial-gradient(ellipse at 50% 30%,rgba(140,70,200,.12) 0%,transparent 60%),linear-gradient(170deg,#120a22 0%,var(--bg) 80%);border-bottom:1px solid rgba(140,80,200,.08);}
.or-title{font-family:'Fraunces',serif;font-size:26px;color:#d4a8f0;margin-bottom:4px;}
.or-sub{font-size:13px;color:rgba(180,130,220,.4);font-style:italic;}
.streak-bar{background:rgba(12,8,22,.95);padding:12px 20px;border-bottom:1px solid rgba(140,80,200,.08);display:flex;align-items:center;justify-content:space-between;}
.streak-n{font-family:'Fraunces',serif;font-size:20px;color:#d4a8f0;font-weight:700;}
.streak-lbl{font-size:10px;color:rgba(160,110,220,.4);letter-spacing:1px;text-transform:uppercase;}
.streak-dots{display:flex;gap:5px;}
.sd{width:8px;height:8px;border-radius:50%;border:1px solid rgba(140,80,200,.25);}
.sd.done{background:#9a50c0;border-color:#9a50c0;}
.sd.today{border-color:rgba(180,110,240,.45);animation:pulse 2s ease-in-out infinite;}
.today-card{background:linear-gradient(135deg,rgba(140,80,200,.18),rgba(80,40,140,.1));border:1px solid rgba(160,90,220,.2);border-radius:16px;padding:24px;text-align:center;cursor:pointer;transition:all .25s;}
.today-card:hover{border-color:rgba(160,90,220,.4);transform:translateY(-1px);}
.tc-status{font-size:9px;font-weight:700;letter-spacing:3px;color:rgba(160,100,220,.5);text-transform:uppercase;margin-bottom:10px;}
.tc-big-icon{font-size:40px;margin-bottom:8px;display:block;}
.tc-big-t{font-family:'Fraunces',serif;font-size:20px;color:#d4a8f0;margin-bottom:4px;}
.tc-big-s{font-size:13px;color:rgba(180,130,220,.4);font-style:italic;margin-bottom:16px;}
.tc-go{display:inline-block;background:linear-gradient(135deg,#7a3a9a,#9a50c0);color:#f0e8fc;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;border:none;cursor:pointer;}
.past-c{background:rgba(20,12,36,.8);border:1px solid rgba(140,80,200,.1);border-radius:11px;padding:13px 16px;margin-bottom:9px;cursor:pointer;display:flex;align-items:flex-start;gap:12px;}
.pc-date{font-size:10px;color:rgba(140,100,200,.4);min-width:55px;margin-top:2px;}
.pc-n{font-family:'Fraunces',serif;font-size:15px;color:#c4a0e0;margin-bottom:2px;}
.pc-p{font-size:12px;color:rgba(180,130,220,.35);font-style:italic;}
.ritual-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;background:radial-gradient(ellipse at 50% 35%,rgba(140,80,200,.15) 0%,transparent 65%);min-height:calc(100vh - 60px);}
.rg{font-size:60px;margin-bottom:20px;display:block;animation:breathe 4s ease-in-out infinite;}
@keyframes breathe{0%,100%{transform:scale(1);}50%{transform:scale(1.07);}}
.rt{font-family:'Fraunces',serif;font-size:32px;color:#d4a8f0;margin-bottom:4px;}
.rs2{font-family:'Fraunces',serif;font-style:italic;font-size:14px;color:rgba(180,130,220,.4);margin-bottom:24px;}
.breathe-c{width:76px;height:76px;border-radius:50%;border:1.5px solid rgba(160,100,220,.3);display:flex;align-items:center;justify-content:center;font-size:26px;animation:breathe 4s ease-in-out infinite;margin:0 auto 8px;}
.breathe-lbl{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(160,120,220,.4);margin-bottom:28px;}
.int-wrap{width:100%;max-width:300px;margin-bottom:28px;}
.int-lbl{font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:rgba(160,100,220,.45);margin-bottom:8px;text-align:left;}
.int-input{width:100%;background:rgba(140,80,200,.08);border:1px solid rgba(140,80,200,.2);border-radius:11px;padding:13px 16px;font-family:'Fraunces',serif;font-style:italic;font-size:15px;color:#d4a8f8;outline:none;text-align:center;}
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
.card-back{background:linear-gradient(145deg,#1a0e2e,#120a22);border:1px solid rgba(160,100,220,.2);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;gap:10px;}
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
.jta{width:100%;background:rgba(100,50,160,.08);border:1px solid rgba(140,80,200,.15);border-radius:7px;padding:11px 13px;font-family:'DM Sans',sans-serif;font-size:13.5px;color:#d4a8f8;resize:none;min-height:75px;outline:none;line-height:1.6;}
.jta::placeholder{color:rgba(160,100,220,.2);font-style:italic;}
.act-row{display:flex;gap:9px;margin-bottom:10px;}
.act-btn{flex:1;padding:12px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;text-align:center;}
.act-p{background:linear-gradient(135deg,rgba(140,80,200,.4),rgba(100,50,160,.3));border:1px solid rgba(160,100,220,.3);color:#d4a8f8;}
.act-s{background:transparent;border:1px solid rgba(140,80,200,.15);color:rgba(180,130,220,.4);}
.save-btn{width:100%;padding:14px;border-radius:11px;border:none;background:linear-gradient(135deg,#7a3a9a,#9a50c0);color:#f0e8fc;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;}
.saved-conf{text-align:center;padding:14px;background:rgba(140,80,200,.06);border:1px solid rgba(140,80,200,.12);border-radius:11px;}
.sc-ico{font-size:20px;margin-bottom:5px;}
.sc-t{font-family:'Fraunces',serif;font-size:15px;color:rgba(200,155,240,.65);margin-bottom:3px;}
.sc-s{font-size:11px;color:rgba(160,110,220,.35);font-style:italic;margin-bottom:12px;}
.sc-btn{background:transparent;border:1px solid rgba(140,80,200,.2);border-radius:7px;padding:8px 18px;color:rgba(180,120,230,.55);font-size:12px;cursor:pointer;}

/* ── CATS & GRID ── */
.cats-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 20px;text-align:center;}
.cats-title{font-family:'Fraunces',serif;font-size:22px;color:#d4a8f0;margin-bottom:4px;}
.cats-sub{font-size:12px;color:rgba(180,130,220,.4);font-style:italic;margin-bottom:6px;}
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
.prog-hero{background:linear-gradient(170deg,#0c1a14 0%,var(--bg) 70%);padding:30px 20px 22px;text-align:center;border-bottom:1px solid rgba(80,160,80,.07);}
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
const LOADING_STEPS = ["Calculando camino de vida y expresión...","Analizando tránsitos planetarios...","Consultando el I Ching...","Leyendo el Lenormand...","Interpretando las 12 casas...","Sintetizando todos los sistemas...","Preparando tu informe personalizado..."];
const LOADING_STEPS_COSMICA = ["Calculando perfil numerológico...","Analizando tránsitos...","Consultando I Ching y Lenormand...","Calculando carta natal completa...","Analizando Diseño Humano...","Integrando todos los sistemas...","Preparando tu lectura cósmica completa..."];
const SECTION_META = {
  "PERFIL NUMEROLÓGICO":{icon:"🔢",lbl:"Numerología"},
  "EL AÑO EN SÍNTESIS":{icon:"🪐",lbl:"Astrología"},
  "EL MENSAJE DEL I CHING":{icon:"☯️",lbl:"I Ching"},
  "LECTURA DE LAS 12 CASAS":{icon:"🏛️",lbl:"Casas"},
  "LENORMAND Y TAROT":{icon:"🃏",lbl:"Oráculos"},
  "PROPÓSITO Y MISIÓN DE VIDA":{icon:"🔱",lbl:"Propósito"},
  "GUÍA DE ACCIÓN":{icon:"🗓️",lbl:"Acción"},
  "DISEÑO HUMANO":{icon:"⬡",lbl:"Diseño Humano"},
  "CARTA NATAL COMPLETA":{icon:"🌟",lbl:"Carta Natal"},
  "INTEGRACIÓN CÓSMICA":{icon:"🔮",lbl:"Integración"},
  "Tu Lectura":{icon:"✨",lbl:"Lectura"},
};

function cleanText(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // quita **negritas**
    .replace(/\*([^*]+)\*/g, '$1')       // quita *itálicas*
    .replace(/---/g, '')                  // quita separadores
    .replace(/#{1,6}\s/g, '')            // quita headers markdown
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

// ── GATE ────────────────────────────────────────────────────────
function Gate({ producto, emoji, titulo, precio, subtitulo, linkCompra, onAccess, onBack }) {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValidar = async () => {
    if (!codigo.trim()) return;
    setLoading(true); setError("");
    try {
      const row = await validarCodigo(codigo.trim().toUpperCase(), producto);
      if (!row) {
        setError("Código inválido o ya utilizado. Verifica e intenta de nuevo.");
      } else {
        const accesos = JSON.parse(localStorage.getItem("cicatriz_accesos") || "{}");
        if (row.producto === "all") {
          accesos["cosmico"] = true; accesos["cosmica"] = true;
          accesos["oraculo"] = true; accesos["programa"] = true;
        } else {
          accesos[producto] = true;
        }
        localStorage.setItem("cicatriz_accesos", JSON.stringify(accesos));
        onAccess();
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
      <span className="gate-glyph">{emoji}</span>
      <div className="gate-title">{titulo}</div>
      <div className="gate-price">{precio}</div>
      <div className="gate-sub">{subtitulo}</div>
      <input className="gate-input" placeholder="CZ-XXXX-XXXX" value={codigo}
        onChange={e=>{setCodigo(e.target.value.toUpperCase());setError("");}}
        onKeyDown={e=>e.key==="Enter"&&handleValidar()}/>
      {error && <div className="gate-error">{error}</div>}
      <button className="gate-btn" onClick={handleValidar} disabled={loading||!codigo.trim()}>
        {loading?"Verificando...":"✦ Ingresar con mi código"}
      </button>
      <div className="gate-divider">¿No tienes código?</div>
      <a href={linkCompra} target="_blank" rel="noopener noreferrer" className="gate-buy">
        <div className="gate-buy-label">Comprar acceso</div>
        <div className="gate-buy-price">{precio}</div>
        <div className="gate-buy-sub">Pago único · Mercado Pago →</div>
      </a>
      <a href={LINKS.combo} target="_blank" rel="noopener noreferrer" className="gate-combo">
        <div className="gate-combo-label">✦ Combo completo · Todos los productos</div>
        <div className="gate-combo-price">$59.990 CLP</div>
        <div className="gate-combo-sub">Año Cósmico + Lectura Cósmica + Oráculo + 21 Días →</div>
      </a>
      </div>
    </div>
  );
}

// ── REPORT VIEWER ────────────────────────────────────────────────
function ReportView({ nombre, fecha, ciudad, hora, lp, exp, py, sections, onReset, glyph }) {
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
        const meta = SECTION_META[sec.title]||{icon:"✨",lbl:"Lectura"};
        return (
          <div key={i} className="rs">
            <div className="rs-hdr">
              <span className="rs-icon">{meta.icon}</span>
              <div><div className="rs-label">{meta.lbl}</div><div className="rs-title">{sec.title}</div></div>
            </div>
            <div className="rs-content">{sec.content}</div>
          </div>
        );
      })}
      <button className="restart-btn" style={{background:"linear-gradient(135deg,#2d7a4a,#3a9a5c)",color:"#e8f5ec",border:"none"}} onClick={()=>window.print()}>✦ Descargar en PDF</button>
      <button className="restart-btn" onClick={onReset}>↩ Nueva lectura</button>
      <div className="powered">Cicatriz · IA · by Nanette Vezanka</div>
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
    const nuevo = {...accesos, [prod]:true};
    setAccesos(nuevo);
    localStorage.setItem("cicatriz_accesos", JSON.stringify(nuevo));
  };

  // Oracle state
  const [orPhase, setOrPhase] = useState("home");
  const [intention, setIntention] = useState("");
  const [orCats, setOrCats] = useState([]); // categorías sugeridas según emoción
  const [selectedCat, setSelectedCat] = useState(null); // categoría elegida
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


  // Emociones predefinidas con mapeo exacto a categorías
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
    setOrCats(CATS); // las 4 categorías completas
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
      const prompt = `Eres un astrólogo experto en sistemas esotéricos. Genera una lectura COMPLETA y personalizada para el año ${ANIO}.
DATOS: Nombre: ${cyForm.nombre} | Fecha: ${cyForm.fecha} | Hora: ${cyForm.hora||"desconocida"} | Ciudad: ${cyForm.ciudad}
Camino de Vida: ${lp} | Expresión: ${exp} | Año Personal ${ANIO}: ${py}
Genera el informe con estos encabezados exactos entre corchetes:
[PERFIL NUMEROLÓGICO] Análisis del Camino de Vida ${lp}, Expresión ${exp} y Año Personal ${py}. 2-3 párrafos.
[EL AÑO EN SÍNTESIS] Los 3 tránsitos más importantes de ${ANIO}. 2-3 párrafos.
[EL MENSAJE DEL I CHING] El hexagrama más relevante. 1-2 párrafos.
[LECTURA DE LAS 12 CASAS] Las casas más activadas en ${ANIO}. 2-3 párrafos.
[LENORMAND Y TAROT] Las cartas que rigen el año ${ANIO}. 1-2 párrafos.
[PROPÓSITO Y MISIÓN DE VIDA] El propósito profundo. 2 párrafos.
[GUÍA DE ACCIÓN] Recomendaciones por trimestre Q1, Q2, Q3, Q4 del año ${ANIO}.
Lenguaje poético pero concreto. Máximo 200 palabras por sección. No uses asteriscos ni markdown.`;
      const res = await fetch("/api/lectura-cosmica",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
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

    // Paso 1: Calcular el Diseño Humano real con la API
    let dh = null;
    try {
      const dhRes = await fetch("/api/diseno-humano",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fecha:lcForm.fecha,hora:lcForm.hora,ciudad:lcForm.ciudad})});
      const dhData = await dhRes.json();
      if (dhData.diseno) dh = dhData.diseno;
    } catch { dh = null; }

    for (let i=0;i<LOADING_STEPS_COSMICA.length;i++) { await new Promise(r=>setTimeout(r,900)); setLcLoadStep(i+1); }

    // Construir el bloque de Diseño Humano para el prompt
    const dhTexto = dh
      ? `DISEÑO HUMANO (calculado con precisión astronómica): Tipo: ${dh.tipo} | Estrategia: ${dh.estrategia} | Autoridad: ${dh.autoridad} | Perfil: ${dh.perfil} | Definición: ${dh.definicion} | Cruz de Encarnación: ${dh.cruz} | Centros definidos: ${(dh.centros_definidos||[]).join(", ")} | Canales: ${(dh.canales||[]).join(", ")} | Tema No-Self: ${dh.tema_no_self} | Firma: ${dh.firma}`
      : `DISEÑO HUMANO: No se pudo calcular automáticamente (verificar hora y ciudad de nacimiento). Interpreta desde la carta natal y numerología disponibles.`;

    try {
      const prompt = `Eres un astrólogo y analista de Diseño Humano experto. Genera una Lectura Cósmica Completa profunda y personalizada. Esta es la lectura más completa que existe — integra numerología, astrología, I Ching, Lenormand, carta natal y Diseño Humano en un solo informe.

DATOS PERSONALES: Nombre: ${lcForm.nombre} | Fecha: ${lcForm.fecha} | Hora: ${lcForm.hora||"desconocida"} | Ciudad: ${lcForm.ciudad}
${dhTexto}
Camino de Vida: ${lcLp} | Expresión: ${lcExp} | Año Personal ${ANIO}: ${lcPy}

IMPORTANTE: Los datos de Diseño Humano arriba son REALES y calculados astronómicamente. Interprétalos con precisión y autoridad — NO digas "probablemente" ni "intuyo" respecto al Diseño Humano, porque son datos exactos. Traduce los términos al español de forma natural.

Genera el informe con estos encabezados exactos entre corchetes:

[PERFIL NUMEROLÓGICO]
Análisis profundo del Camino de Vida ${lcLp}, Expresión ${lcExp} y Año Personal ${lcPy}. Usa el nombre de pila. 2-3 párrafos ricos y personalizados.

[EL AÑO EN SÍNTESIS]
Los 3 tránsitos planetarios más importantes de ${ANIO} para esta persona nacida el ${lcForm.fecha}. Menciona Júpiter, Saturno o Plutón según corresponda. 2-3 párrafos.

[EL MENSAJE DEL I CHING]
El hexagrama más relevante para esta persona en ${ANIO} y su mensaje profundo. 1-2 párrafos.

[LECTURA DE LAS 12 CASAS]
Las casas astrológicas más activadas en ${ANIO} y su significado específico. 2-3 párrafos.

[LENORMAND Y TAROT]
Las cartas Lenormand y el arcano mayor que rigen el año ${ANIO} para esta persona. 1-2 párrafos.

[CARTA NATAL COMPLETA]
Análisis profundo de la carta natal: Sol, Luna, Ascendente (si hay hora exacta), planetas en casas principales, aspectos más relevantes. Cómo esta carta define la personalidad y el destino de ${lcForm.nombre.split(' ')[0]}. 3-4 párrafos.

[DISEÑO HUMANO]
Análisis preciso del Diseño Humano calculado: su tipo, estrategia y autoridad, qué significan para tomar decisiones correctamente. Su perfil y propósito. Los centros definidos y canales activos, y cómo condicionan su energía. El tema no-self y la firma como brújula de alineación. Cómo operar correctamente según este diseño exacto. 3-4 párrafos. Habla con certeza, son datos reales.

[INTEGRACIÓN CÓSMICA]
Cómo la carta natal y el Diseño Humano se complementan y confirman mutuamente. Los grandes temas de vida que emergen cuando ambos sistemas se leen juntos. Lo que la numerología agrega a esta imagen. 2-3 párrafos profundos.

[PROPÓSITO Y MISIÓN DE VIDA]
El propósito profundo de ${lcForm.nombre.split(' ')[0]} según todos los sistemas combinados: numerología, astrología, I Ching y Diseño Humano. Lo que vino a hacer en esta vida. 2 párrafos.

[GUÍA DE ACCIÓN]
Recomendaciones concretas por trimestre del año ${ANIO} considerando los tránsitos Y la estrategia/autoridad del Diseño Humano de esta persona. Q1, Q2, Q3, Q4 — cada uno con foco específico.

Lenguaje poético pero concreto y profundo. Máximo 220 palabras por sección. Usa el nombre de pila en todo el informe. No uses asteriscos ni markdown.`;
      const res = await fetch("/api/lectura-cosmica",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
      const data = await res.json();
      const texto = data.lectura||"Error al generar la lectura.";
      await guardarLectura("lecturas_cosmicas", lcForm.nombre, lcForm.fecha, lcForm.ciudad, texto);
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
              <span className="home-glyph">🪷</span>
              <div className="home-eyebrow">Herramientas de acompañamiento emocional</div>
              <h1 className="home-title">Cicatriz</h1>
              <div className="home-sub">by Nanette Vezanka</div>
              <p className="home-desc">Herramientas simples y reales para personas en duelo, crisis y pérdida.</p>
            </div>
            <div style={{padding:"24px 20px 0"}}>
              {[
                {icon:"🌌",tag:"Lectura Esotérica · IA",title:"Tu Año Cósmico",desc:"Numerología · I Ching · Lenormand · Tránsitos",price:"$24.990 CLP",go:()=>setTab("cosmico")},
                {icon:"🔮",tag:"Lectura Premium · IA",title:"Lectura Cósmica Completa",desc:"Carta Natal + Diseño Humano integrados",price:"$39.990 CLP",go:()=>setTab("cosmica")},
                {icon:"🌸",tag:"Oráculo · Ritual Diario",title:"Oráculo Kintsugi",desc:"52 cartas · Una por día · Ritual de presencia",price:"$9.990 CLP",go:()=>{setTab("oraculo");setOrPhase("home");}},
                {icon:"🌿",tag:"Programa · 21 Días",title:"Bajar el Ruido",desc:"5 minutos al día para recuperar tu centro",price:"$19.990 CLP",go:()=>{setTab("programa");setProgView("home");}},
              ].map((t,i)=>(
                <div key={i} className="tool-card" onClick={t.go}>
                  <span className="tc-icon">{t.icon}</span>
                  <div className="tc-body">
                    <div className="tc-tag">{t.tag}</div>
                    <div className="tc-title">{t.title}</div>
                    <div className="tc-desc">{t.desc}</div>
                    <div className="tc-price">{t.price}</div>
                  </div>
                  <span className="tc-arrow">›</span>
                </div>
              ))}
              <div style={{background:"linear-gradient(135deg,rgba(140,80,200,.12),rgba(80,40,140,.08))",border:"1px solid rgba(160,90,220,.2)",borderRadius:14,padding:"18px 20px",marginTop:4,cursor:"pointer",textAlign:"center"}} onClick={()=>window.open(LINKS.combo,"_blank")}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:3,color:"rgba(160,100,220,.6)",textTransform:"uppercase",marginBottom:6}}>✦ Mejor valor · Combo completo</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:"#d4a8f8",marginBottom:2}}>Todos los productos</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:24,color:"#d4a8f8",marginBottom:4}}>$59.990 CLP</div>
                <div style={{fontSize:11,color:"rgba(160,100,220,.4)"}}>Año Cósmico + Lectura Cósmica + Oráculo + 21 Días →</div>
              </div>
              <div className="hl" style={{marginTop:16}}>
                <p>"Lo que ofrezco no viene de libros.<br/>Viene de haber caminado el duelo, la pérdida, y haberme reconstruido desde cero."</p>
              </div>
            </div>
            <div className="home-by">Antofagasta, Chile · {ANIO}</div>
          </div>
        )}

        {/* ════ AÑO CÓSMICO ════ */}
        {tab==="cosmico" && (
          <div className="z1 pb80">
            {!tieneAcceso("cosmico") ? (
              <Gate producto="cosmico" emoji="🌌" titulo="Tu Año Cósmico" precio="$24.990 CLP"
                subtitulo="Ingresa tu código de acceso para recibir tu lectura personalizada."
                linkCompra={LINKS.cosmico} onAccess={()=>darAcceso("cosmico")} onBack={()=>setTab("home")}/>
            ) : (
              <>
                <div className="header">
                  <button className="hbk" onClick={()=>setTab("home")}>‹</button>
                  <div className="htitle">Tu Año Cósmico</div>
                </div>
                <div className="cy-hero">
                  <span className="cy-glyph">🌌</span>
                  <div className="cy-title">Año Cósmico {ANIO}</div>
                  <div className="cy-sub">Numerología · I Ching · Lenormand · Astrología</div>
                  <p className="cy-desc">Tu informe queda guardado permanentemente — siempre verás el mismo.</p>
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

        {/* ════ LECTURA CÓSMICA COMPLETA ════ */}
        {tab==="cosmica" && (
          <div className="z1 pb80">
            {!tieneAcceso("cosmica") ? (
              <Gate producto="cosmica" emoji="🔮" titulo="Lectura Cósmica Completa" precio="$39.990 CLP"
                subtitulo="Carta Natal + Diseño Humano integrados en una lectura profunda."
                linkCompra={LINKS.cosmica} onAccess={()=>darAcceso("cosmica")} onBack={()=>setTab("home")}/>
            ) : (
              <>
                <div className="header">
                  <button className="hbk" onClick={()=>setTab("home")}>‹</button>
                  <div className="htitle">Lectura Cósmica</div>
                </div>
                <div className="cy-hero" style={{background:"radial-gradient(ellipse at 50% 30%,rgba(20,80,160,.15) 0%,transparent 60%),linear-gradient(170deg,#080e1a 0%,var(--bg) 70%)"}}>
                  <span className="cy-glyph">🔮</span>
                  <div className="cy-title" style={{color:"#a8d4f8"}}>Lectura Cósmica Completa</div>
                  <div className="cy-sub" style={{color:"rgba(130,180,220,.4)"}}>Carta Natal · Diseño Humano · Integración profunda</div>
                  <p className="cy-desc">Para esta lectura necesitas tu hora exacta de nacimiento y tu Diseño Humano.</p>
                </div>
                <div style={{padding:"28px 20px 0"}}>
                  {lcScreen==="form" && (
                    <>
                      <div className="sec-label">Datos personales</div>
                      <div className="field"><label className="flabel">Nombre completo</label>
                        <input className="finput" placeholder="Como aparece en tu documento" value={lcForm.nombre} onChange={e=>setLcForm({...lcForm,nombre:e.target.value})}/></div>
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
                      <button className="btn-primary" style={{background:"linear-gradient(135deg,#1a4a7a,#2a6aaa)"}} onClick={submitCosmica} disabled={!lcForm.nombre||!lcForm.fecha||!lcForm.ciudad}>✦ Generar mi lectura cósmica</button>
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
                {/* HOME */}
                {orPhase==="home" && (
                  <div className="pb80">
                    <div className="or-hero">
                      <div className="or-title">🌸 Oráculo Kintsugi</div>
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
                          <span className="tc-big-icon">🌸</span>
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

                {/* RESPIRACIÓN */}
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

                {/* GRILLA DE EMOCIONES */}
                {orPhase==="intention" && (
                  <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
                    <div className="header" style={{background:"rgba(8,5,14,.95)",borderBottom:"1px solid rgba(140,80,200,.08)"}}>
                      <button className="hbk" onClick={()=>setOrPhase("breathe")}>‹</button>
                      <div className="htitle" style={{color:"#d4a8f0"}}>¿Cómo estás hoy?</div>
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

                {/* SELECCIÓN DE CATEGORÍA */}
                {orPhase==="cats" && (
                  <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
                    <div className="header" style={{background:"rgba(8,5,14,.95)",borderBottom:"1px solid rgba(140,80,200,.08)"}}>
                      <button className="hbk" onClick={()=>setOrPhase("intention")}>‹</button>
                      <div className="htitle" style={{color:"#d4a8f0"}}>Elige tu camino</div>
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

                {/* GRILLA DE CARTAS */}
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

                {/* CARTA REVELADA */}
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
                            <span className="cb-g">🌸</span>
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
              <Gate producto="programa" emoji="🌿" titulo="21 Días para Bajar el Ruido" precio="$19.990 CLP"
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
            {id:"home",icon:"🪷",lbl:"Inicio"},
            {id:"cosmico",icon:"🌌",lbl:"Cósmico"},
            {id:"cosmica",icon:"🔮",lbl:"Lectura"},
            {id:"oraculo",icon:"🌸",lbl:"Oráculo"},
            {id:"programa",icon:"🌿",lbl:"21 Días"},
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
