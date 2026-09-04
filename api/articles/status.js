import { getArticle, mercadoPagoRequest, updateArticle } from '../_lib/server.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  const id = request.query.id;
  if (!id || !/^[A-Za-z0-9_-]{8,}$/.test(id)) return response.status(400).json({ error: 'Invalid article id' });

  try {
    const article = await getArticle(id);
    if (!article) return response.status(404).json({ error: 'Article not found' });
    if (article.status === 'pendente_revisao') return response.json({ status: article.status });
    if (!article.payment_id) return response.json({ status: article.status });

    const payment = await mercadoPagoRequest(`/v1/payments/${encodeURIComponent(article.payment_id)}`);
    if (payment.status === 'approved' && article.status !== 'pendente_revisao') {
      await updateArticle(id, { status: 'pendente_revisao', payment_status: 'approved' });
      return response.json({ status: 'pendente_revisao' });
    }

    return response.json({ status: article.status, paymentStatus: payment.status });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
