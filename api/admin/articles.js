import { getAllArticles, updateArticle, verifyAdmin } from '../_lib/server.js';

export default async function handler(request, response) {
  try {
    const admin = await verifyAdmin(request);

    if (request.method === 'GET') {
      return response.status(200).json({ articles: await getAllArticles() });
    }

    if (request.method !== 'PATCH') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const { id, status, reviewNote = '' } = request.body || {};
    if (!id || !['aprovado', 'rejeitado'].includes(status)) {
      return response.status(400).json({ error: 'Informe um artigo e um status válido.' });
    }
    if (status === 'rejeitado' && (typeof reviewNote !== 'string' || reviewNote.trim().length < 10)) {
      return response.status(400).json({ error: 'Informe uma justificativa de pelo menos 10 caracteres.' });
    }

    await updateArticle(id, {
      status,
      review_note: typeof reviewNote === 'string' ? reviewNote.trim().slice(0, 1000) : '',
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.uid
    });
    return response.status(200).json({ id, status });
  } catch (error) {
    const unauthorized = error.message === 'Autenticação necessária.' || error.message === 'Acesso de administrador necessário.';
    return response.status(unauthorized ? 403 : 500).json({ error: error.message });
  }
}
