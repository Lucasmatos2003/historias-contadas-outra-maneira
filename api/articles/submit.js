import { createArticle, mercadoPagoRequest, publicError, rateLimit, updateArticle, validateArticle, verifyUser } from '../_lib/server.js';
import { sendMail, emailTemplate, CONTACT_EMAIL } from '../_lib/mailer.js';

const CATEGORY_LABELS = {
  'historia-alternativa': 'História Alternativa',
  'curiosidades-geradas': 'Curiosidades Históricas',
  'geopolitica-ficticia': 'Geopolítica Fictícia'
};

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await verifyUser(request);
    rateLimit(request, `submit:${user.uid}`, 5, 15 * 60 * 1000);
    const article = validateArticle({ ...request.body, authorEmail: user.email });
    const isAdmin = Boolean(process.env.ADMIN_UID && user.uid === process.env.ADMIN_UID);
    const saved = await createArticle({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      author_email: article.authorEmail,
      author_name: user.name || user.email?.split('@')[0] || 'Escritor',
      author_uid: user.uid,
      cover_image: article.coverImage,
      secondary_image: article.secondaryImage || '',
      status: process.env.MERCADOPAGO_ACCESS_TOKEN && !isAdmin ? 'pendente_pagamento' : 'pendente_revisao'
    });

    const categoryLabel = CATEGORY_LABELS[article.category] || article.category;
    const authorName = user.name || user.email?.split('@')[0] || 'Escritor';
    const appUrl = (process.env.PUBLIC_APP_URL || `https://${request.headers.host}`).replace(/\/+$/, '');

    // Notificação interna para o administrador
    const adminHtml = emailTemplate({
      title: `Novo artigo submetido: ${article.title}`,
      preheader: `${authorName} enviou um novo artigo para revisão.`,
      body: `
        <h1>📝 Novo Artigo Submetido</h1>
        <p>Um escritor acabou de submeter um artigo para revisão.</p>
        <div class="data-box">
          <div class="data-row"><span class="data-label">Título:</span> <span class="data-value">${article.title}</span></div>
          <div class="data-row"><span class="data-label">Categoria:</span> <span class="data-value">${categoryLabel}</span></div>
          <div class="data-row"><span class="data-label">Autor:</span> <span class="data-value">${authorName}</span></div>
          <div class="data-row"><span class="data-label">E-mail:</span> <span class="data-value">${article.authorEmail}</span></div>
          <div class="data-row"><span class="data-label">ID do artigo:</span> <span class="data-value">${saved.id}</span></div>
          <div class="data-row"><span class="data-label">Status:</span> <span class="data-value">${saved.status}</span></div>
        </div>
        <p>Resumo do artigo:</p>
        <div class="data-box">
          <p style="margin:0; color:#e5e7eb;">${article.excerpt}</p>
        </div>
        <a href="${appUrl}/admin" class="btn">Acessar Painel Admin →</a>
      `
    });

    // Confirmação automática para o escritor
    const writerHtml = emailTemplate({
      title: 'Artigo recebido — Histórias Contadas de Outra Maneira',
      preheader: 'Seu artigo foi submetido com sucesso e está em análise.',
      body: `
        <h1>Artigo recebido com sucesso! 🎉</h1>
        <p>Olá, <strong>${authorName}</strong>! Seu artigo foi submetido para <strong>Histórias Contadas de Outra Maneira</strong> e já está em fila de revisão.</p>
        <div class="data-box">
          <div class="data-row"><span class="data-label">Título:</span> <span class="data-value">${article.title}</span></div>
          <div class="data-row"><span class="data-label">Categoria:</span> <span class="data-value">${categoryLabel}</span></div>
          <div class="data-row"><span class="data-label">Status:</span> <span class="data-value">Em revisão editorial</span></div>
        </div>
        <div class="divider"></div>
        <h1 style="font-size:17px;">Próximos passos</h1>
        <p>📋 Nossa equipe editorial revisará seu artigo em até <strong>5 dias úteis</strong>.</p>
        <p>📧 Você receberá um e-mail com o resultado da revisão — aprovação, pedido de ajustes, ou feedback.</p>
        <p>✍️ Se seu artigo for aprovado, ele será publicado e ficará visível para todos os leitores da revista.</p>
        <p>🎬 Artigos de alta qualidade também podem ser adaptados como roteiro para o canal <strong>Alternativa História</strong> no YouTube.</p>
        <div class="divider"></div>
        <p style="font-size:13px; color:#6b7280;">Dúvidas? Fale conosco em <a href="mailto:${CONTACT_EMAIL}" style="color:#7c3aed">${CONTACT_EMAIL}</a></p>
        <a href="${appUrl}/meus-artigos" class="btn">Ver meus artigos →</a>
      `
    });

    // Envia ambas as notificações sem bloquear o fluxo principal
    Promise.allSettled([
      sendMail({ to: CONTACT_EMAIL, subject: `[Novo Artigo] ${article.title.slice(0, 80)}`, html: adminHtml }),
      sendMail({ to: article.authorEmail, subject: 'Seu artigo foi recebido — Histórias Contadas de Outra Maneira', html: writerHtml })
    ]).catch((err) => console.error('[submit] Falha ao enviar notificações:', err));

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN || isAdmin) {
      return response.status(201).json({
        articleId: saved.id,
        paymentRequired: false,
        status: 'pendente_revisao'
      });
    }

    let payment;
    try {
        payment = await mercadoPagoRequest('/v1/payments', {
          method: 'POST',
          headers: { 'X-Idempotency-Key': `article-${saved.id}` },
          body: JSON.stringify({
            transaction_amount: 5,
            description: `Taxa de submissão: ${article.title}`,
            payment_method_id: 'pix',
            payer: { email: article.authorEmail },
            external_reference: String(saved.id),
            notification_url: `${appUrl}/api/payments/webhook`
          })
        });
    } catch (paymentError) {
      await updateArticle(saved.id, { status: 'pagamento_erro', payment_status: 'error' });
      throw paymentError;
    }

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
    const result = publicError(error, 'Não foi possível enviar o artigo.');
    return response.status(result.status).json({ error: result.message });
  }
}
