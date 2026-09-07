import { getArticle, publicError, rateLimit, updateArticle, validateArticle, verifyUser } from '../_lib/server.js';

export default async function handler(request, response) {
  if (request.method !== 'POST' && request.method !== 'PUT') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyUser(request);
    rateLimit(request, `update:${user.uid}`, 20, 15 * 60 * 1000);

    const articleId = request.body?.id || request.query?.id;
    if (!articleId) {
      return response.status(400).json({ error: 'ID do artigo não informado.' });
    }

    const existing = await getArticle(articleId);
    if (!existing) {
      return response.status(404).json({ error: 'Artigo não encontrado.' });
    }

    const isAdmin = Boolean(process.env.ADMIN_UID && user.uid === process.env.ADMIN_UID);
    if (existing.author_uid !== user.uid && !isAdmin) {
      return response.status(403).json({ error: 'Você não tem permissão para editar este artigo.' });
    }

    const validated = validateArticle({ ...request.body, authorEmail: user.email });

    const updates = {
      title: validated.title,
      excerpt: validated.excerpt,
      content: validated.content,
      category: validated.category,
      cover_image: validated.coverImage || '',
      secondary_image: validated.secondaryImage || '',
      updated_at: new Date().toISOString()
    };

    // Se o artigo foi rejeitado pela revisão editorial, ao ser editado volta para a fila de análise
    if (existing.status === 'rejeitado') {
      updates.status = 'pendente_revisao';
      updates.review_note = '';
    }

    await updateArticle(articleId, updates);

    return response.status(200).json({
      success: true,
      message: 'Artigo atualizado com sucesso!',
      article: {
        id: articleId,
        ...updates
      }
    });
  } catch (error) {
    const result = publicError(error, 'Não foi possível atualizar o artigo.');
    return response.status(result.status).json({ error: result.message });
  }
}
