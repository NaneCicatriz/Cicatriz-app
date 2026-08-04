import https from 'https';
import * as A from 'astronomy-engine';

// ===== CARTA NATAL (cálculo astronómico real) =====
const SIGNOS = ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];

function signoGrado(lon) {
  lon = ((lon % 360) + 360) % 360;
  return `${SIGNOS[Math.floor(lon / 30)]} ${(lon % 30).toFixed(1)}°`;
}

function calcularCartaNatal(fecha, horaFinal, offsetStr, lat, lon) {
  const [year, month, day] = fecha.split('-').map(Number);
  const [hh, mm] = horaFinal.split(':').map(Number);

  const oSign = offsetStr.startsWith('-') ? -1 : 1;
  const [oh, om] = offsetStr.slice(1).split(':').map(Number);
  const tzHoras = oSign * (oh + (om || 0) / 60);

  const date = new Date(Date.UTC(year, month - 1, day, hh, mm || 0) - tzHoras * 3600000);

  const posiciones = {};
  posiciones.sol = A.SunPosition(date).elon;
  posiciones.luna = A.EclipticGeoMoon(date).lon;
  for (const [clave, cuerpo] of [['mercurio','Mercury'],['venus','Venus'],['marte','Mars'],['jupiter','Jupiter'],['saturno','Saturn']]) {
    posiciones[clave] = A.Ecliptic(A.GeoVector(A.Body[cuerpo], date, true)).elon;
  }

  let ascLon = null;
  if (lat != null && lon != null) {
    const gast = A.SiderealTime(date);
    const ramc = (((gast * 15) + lon + 360) % 360) * Math.PI / 180;
    const eps = 23.44 * Math.PI / 180;
    const phi = lat * Math.PI / 180;
    const y = Math.cos(ramc);
    const x = -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps));
    ascLon = ((Math.atan2(y, x) * 180 / Math.PI) % 360 + 360) % 360;
  }

  const casaDe = (l) => ascLon == null ? null : Math.floor((((l - ascLon) % 360) + 360) % 360 / 30) + 1;
  const carta = {};
  for (const [clave, l] of Object.entries(posiciones)) {
    carta[clave] = signoGrado(l) + (ascLon != null ? ` (Casa ${casaDe(l)})` : '');
  }
  if (ascLon != null) carta.ascendente = signoGrado(ascLon);
  return carta;
}
// ===== FIN CARTA NATAL =====

// Helper para hacer POST a la API de Human Design Hub
function hdRequest(path, bodyObj) {
  const postData = JSON.stringify(bodyObj);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.humandesignhub.app',
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.HD_API_KEY,
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Helper para GET (búsqueda de ubicación)
function hdGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.humandesignhub.app',
      path: path,
      method: 'GET',
      headers: { 'X-API-KEY': process.env.HD_API_KEY },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { fecha, hora, ciudad } = req.body;
  if (!fecha || !ciudad) {
    return res.status(400).json({ error: 'Faltan datos: fecha y ciudad son obligatorios' });
  }

  try {
    // 1. Buscar la ciudad para obtener coordenadas y timezone
    const locResult = await hdGet(`/v1/locations/search?q=${encodeURIComponent(ciudad)}`);
    const locations = locResult.body?.results || locResult.body?.locations || locResult.body || [];
    const loc = Array.isArray(locations) ? locations[0] : locations;

    if (!loc) {
      return res.status(200).json({ error: 'No se encontró la ciudad. Verifica el nombre.' });
    }

    // Extraer offset de timezone. Si no viene, usar Chile por defecto (-04:00)
    let tzOffset = loc.timezone_offset || loc.utc_offset || loc.offset || null;

    // Construir el string de offset en formato +HH:MM o -HH:MM
    let offsetStr;
    if (typeof tzOffset === 'number') {
      const sign = tzOffset >= 0 ? '+' : '-';
      const abs = Math.abs(tzOffset);
      const hh = String(Math.floor(abs)).padStart(2, '0');
      const mm = String(Math.round((abs % 1) * 60)).padStart(2, '0');
      offsetStr = `${sign}${hh}:${mm}`;
    } else if (typeof tzOffset === 'string' && tzOffset.match(/[+-]\d{2}:\d{2}/)) {
      offsetStr = tzOffset;
    } else {
      offsetStr = '-04:00'; // fallback Chile
    }

    // 2. Construir datetime con timezone
    const horaFinal = hora && hora.length >= 4 ? hora : '12:00';
    const datetime = `${fecha}T${horaFinal}${offsetStr}`;

    // 2b. Calcular la carta natal con astronomía real (nunca rompe el DH si falla)
    let cartaNatal = null;
    try {
      const latLoc = loc.latitude ?? loc.lat ?? null;
      const lonLoc = loc.longitude ?? loc.lng ?? loc.lon ?? null;
      const conHora = !!(hora && hora.length >= 4);
      cartaNatal = calcularCartaNatal(fecha, horaFinal, offsetStr, conHora ? latLoc : null, conHora ? lonLoc : null);
    } catch { cartaNatal = null; }

    // 3. Llamar al simple-bodygraph (incluido en plan Free)
    const hdResult = await hdRequest('/v1/simple-bodygraph', { datetime, verbose: true });

    if (hdResult.status !== 200) {
      return res.status(200).json({ error: 'Error al calcular el diseño', detalle: hdResult.body, cartaNatal });
    }

    const d = hdResult.body;

    // Inferir estrategia, tema no-self y firma desde el tipo (son fijos por tipo en Diseño Humano)
    const porTipo = {
      'Generator':            { estrategia: 'Responder',                     tema_no_self: 'Frustración', firma: 'Satisfacción' },
      'Manifesting Generator':{ estrategia: 'Responder, luego informar',     tema_no_self: 'Frustración', firma: 'Satisfacción' },
      'Manifestor':           { estrategia: 'Informar antes de actuar',      tema_no_self: 'Rabia',       firma: 'Paz' },
      'Projector':            { estrategia: 'Esperar la invitación',         tema_no_self: 'Amargura',    firma: 'Éxito' },
      'Reflector':            { estrategia: 'Esperar un ciclo lunar',        tema_no_self: 'Decepción',   firma: 'Sorpresa' },
    };
    const inf = porTipo[d.type] || { estrategia: null, tema_no_self: null, firma: null };

    // 4. Extraer solo lo relevante para la lectura
    const resumen = {
  tipo: d.type || null,
  estrategia: inf.estrategia,
  autoridad: d.authority || null,
  perfil: d.profile || null,
  definicion: d.definition || null,
  cruz: d.incarnation_cross || null,
  ascendente: d.ascendant || d.rising_sign || d.rising || null,
  centros_definidos: d.centers || [],
  canales: d.channels_short || d.channels || [],
  tema_no_self: inf.tema_no_self,
  firma: inf.firma,
};

    return res.status(200).json({ diseno: resumen, ciudad_encontrada: loc.name || ciudad, timezone: offsetStr, cartaNatal });

  } catch (error) {
    return res.status(200).json({ error: 'Error de conexión con el servicio de Diseño Humano', detalle: error.message });
  }
}
