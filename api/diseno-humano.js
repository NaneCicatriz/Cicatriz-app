import https from 'https';

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

    // 3. Llamar al bodygraph
    const hdResult = await hdRequest('/v1/bodygraph', { datetime, verbose: true });

    if (hdResult.status !== 200) {
      return res.status(200).json({ error: 'Error al calcular el diseño', detalle: hdResult.body });
    }

    const d = hdResult.body;

    // 4. Extraer solo lo relevante para la lectura
    const resumen = {
      tipo: d.type || null,
      estrategia: d.strategy || null,
      autoridad: d.authority || null,
      perfil: d.profile || null,
      definicion: d.definition || null,
      cruz: d.incarnation_cross || null,
      centros_definidos: d.centers || [],
      canales: (d.channels || []).map(c => c.name).filter(Boolean),
      tema_no_self: d.not_self_theme || null,
      firma: d.signature || null,
    };

    return res.status(200).json({ diseno: resumen, ciudad_encontrada: loc.name || ciudad, timezone: offsetStr });

  } catch (error) {
    return res.status(200).json({ error: 'Error de conexión con el servicio de Diseño Humano', detalle: error.message });
  }
}
