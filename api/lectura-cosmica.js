import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Sin prompt' });
  }

  const postData = JSON.stringify({
   model: 'claude-opus-4-7',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        const parsed = JSON.parse(data);
        const texto = parsed.content?.[0]?.text ?? '';
        res.status(200).json({ lectura: texto, httpStatus: response.statusCode, debug: parsed });
        resolve();
      });
    });

    request.on('error', (error) => {
      res.status(200).json({ lectura: '', error: error.message });
      resolve();
    });

    request.write(postData);
    request.end();
  });
}
