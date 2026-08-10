import Anthropic from '@anthropic-ai/sdk';

export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Sin prompt' });
  }

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 9000,
      messages: [{ role: 'user', content: prompt }],
    });

    const texto = message.content[0]?.text ?? '';
    res.status(200).json({ lectura: texto });
  } catch (error) {
    console.error('ERROR COMPLETO lectura-cosmica:', JSON.stringify(error, null, 2));
    console.error('Error status:', error.status);
    console.error('Error response:', error.response?.data || error.error);
    res.status(200).json({ lectura: '', error: error.message });
  }
}
