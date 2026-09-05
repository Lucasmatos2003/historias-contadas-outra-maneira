import { getPublicWriter, publicError, rateLimit, RequestError } from '../_lib/server.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  try {
    rateLimit(request, 'public-writer', 60, 60 * 1000);
    const uid = typeof request.query.uid === 'string' ? request.query.uid.trim() : '';
    if (!/^[A-Za-z0-9_-]{8,}$/.test(uid)) throw new RequestError('Escritor inválido.', 400);
    const writer = await getPublicWriter(uid);
    if (!writer) return response.status(404).json({ error: 'Escritor não encontrado.' });
    return response.status(200).json({ writer });
  } catch (error) {
    const result = publicError(error, 'Não foi possível carregar o escritor.');
    return response.status(result.status).json({ error: result.message });
  }
}
