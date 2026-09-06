import { publicError, rateLimit, supabaseAdmin } from '../_lib/server.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  try {
    rateLimit(request, 'public-articles', 120, 60 * 1000);
    const database = supabaseAdmin();
    const { data: articles, error } = await database
      .from('articles')
      .select('id, title, excerpt, content, category, author_name, author_uid, cover_image, status, created_at')
      .eq('status', 'aprovado')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return response.status(200).json({ articles: articles || [] });
  } catch (error) {
    const result = publicError(error, 'Não foi possível carregar os artigos.');
    return response.status(result.status).json({ error: result.message });
  }
}
