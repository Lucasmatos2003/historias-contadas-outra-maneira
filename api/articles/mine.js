import { getArticlesByAuthor, publicError, rateLimit, verifyUser } from '../_lib/server.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await verifyUser(request);
    rateLimit(request, `mine:${user.uid}`, 30, 60 * 1000);
    const articles = await getArticlesByAuthor(user.uid);
    return response.status(200).json({ articles });
  } catch (error) {
    const result = publicError(error, 'Não foi possível carregar seus artigos.');
    return response.status(result.status).json({ error: result.message });
  }
}
