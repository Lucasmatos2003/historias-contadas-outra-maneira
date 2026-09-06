import { publicError, verifyAdmin } from '../_lib/server.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  try {
    await verifyAdmin(request);
    return response.status(200).json({ isAdmin: true });
  } catch (error) {
    const result = publicError(error, 'Não foi possível verificar o acesso.');
    return response.status(result.status).json({ isAdmin: false, error: result.message });
  }
}
