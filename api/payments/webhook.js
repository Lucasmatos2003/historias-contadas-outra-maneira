import { getArticle, mercadoPagoRequest, updateArticle } from '../_lib/server.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = request.body;
    const paymentId = payload?.data?.id || payload?.id;
    if (!paymentId) return response.json({ received: true });

    const payment = await mercadoPagoRequest(`/v1/payments/${encodeURIComponent(paymentId)}`);
    const articleId = payment.external_reference;
    if (!articleId) return response.json({ received: true });

    const article = await getArticle(articleId);
    if (!article) return response.json({ received: true });

    const update = { payment_status: payment.status };
    if (payment.status === 'approved' && article.status === 'pendente_pagamento') {
      update.status = 'pendente_revisao';
    }

    if (article.payment_id !== String(paymentId)) return response.json({ received: true });
    await updateArticle(articleId, update);
    return response.json({ received: true });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
