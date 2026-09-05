import { getArticlesByAuthor, verifyUser } from '../_lib/server.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await verifyUser(request);
    const articles = await getArticlesByAuthor(user.uid);
    return response.status(200).json({ articles });
  } catch (error) {
    return response.status(error.message === 'Autenticação necessária.' ? 401 : 500).json({ error: error.message });
  }
}
