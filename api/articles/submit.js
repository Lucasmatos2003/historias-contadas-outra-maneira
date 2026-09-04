import { createArticle, mercadoPagoRequest, updateArticle, validateArticle } from '../_lib/server.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const article = validateArticle(request.body);
    const saved = await createArticle({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      author_email: article.authorEmail,
      status: 'pendente_pagamento'
    });

    const payment = await mercadoPagoRequest('/v1/payments', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': `article-${saved.id}` },
      body: JSON.stringify({
        transaction_amount: 5,
        description: `Taxa de submissão: ${article.title}`,
        payment_method_id: 'pix',
        payer: { email: article.authorEmail },
        external_reference: String(saved.id),
        notification_url: `${process.env.PUBLIC_APP_URL || `https://${request.headers.host}`}/api/payments/webhook`
      })
    });

    await updateArticle(saved.id, {
      payment_id: String(payment.id),
      payment_status: payment.status
    });

    return response.status(201).json({
      articleId: saved.id,
      paymentId: payment.id,
      status: payment.status,
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code || null,
      qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || null
    }, 201);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
}
