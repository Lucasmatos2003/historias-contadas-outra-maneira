import { getArticle, mercadoPagoRequest, publicError, rateLimit, RequestError, updateArticle, verifyMercadoPagoSignature } from '../_lib/server.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  try {
    rateLimit(request, 'webhook', 120, 60 * 1000);
    const payload = request.body;
    const paymentId = payload?.data?.id || payload?.id;
    if (!paymentId) throw new RequestError('Notificação inválida.', 400);
    verifyMercadoPagoSignature(request, String(paymentId));

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
    const result = publicError(error, 'Não foi possível processar a notificação.');
    return response.status(result.status).json({ error: result.message });
  }
}
