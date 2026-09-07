import { publicError, rateLimit, RequestError, supabaseAdmin } from './_lib/server.js';
import { sendMail, emailTemplate, CONTACT_EMAIL } from './_lib/mailer.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Limite de envio por IP: 5 envios a cada 10 minutos para evitar spam
    rateLimit(request, 'contact:submit', 5, 10 * 60 * 1000);

    const body = request.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : 'Mensagem do leitor';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (name.length < 2 || name.length > 100) {
      throw new RequestError('Informe seu nome (pelo menos 2 caracteres).', 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      throw new RequestError('Informe um e-mail válido para contato.', 400);
    }
    if (message.length < 10 || message.length > 5000) {
      throw new RequestError('A mensagem deve ter entre 10 e 5.000 caracteres.', 400);
    }

    const database = supabaseAdmin();
    const { error: insertError } = await database
      .from('contact_messages')
      .insert({
        name,
        email,
        subject: subject.slice(0, 150),
        message,
        status: 'unread',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Contact insert error in Supabase:', insertError.message);
      console.log('Mensagem de contato recebida (backup log):', { name, email, subject, message });
    }

    // Notificação interna para o administrador do site
    const adminHtml = emailTemplate({
      title: `Nova mensagem de contato: ${subject}`,
      preheader: `${name} (${email}) enviou uma mensagem pelo formulário de contato.`,
      body: `
        <h1>📬 Nova Mensagem de Contato</h1>
        <p>Uma nova mensagem foi recebida pelo formulário de contato do site.</p>
        <div class="data-box">
          <div class="data-row"><span class="data-label">Nome:</span> <span class="data-value">${name}</span></div>
          <div class="data-row"><span class="data-label">E-mail:</span> <span class="data-value">${email}</span></div>
          <div class="data-row"><span class="data-label">Assunto:</span> <span class="data-value">${subject.slice(0, 150)}</span></div>
        </div>
        <div class="data-box">
          <p style="margin:0; color:#e5e7eb; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
        <p>Para responder, basta responder este e-mail diretamente — o reply-to está configurado para o remetente.</p>
      `
    });

    // Confirmação automática para o leitor
    const readerHtml = emailTemplate({
      title: 'Recebemos sua mensagem — Histórias Contadas de Outra Maneira',
      preheader: 'Obrigado por entrar em contato! Responderemos em breve.',
      body: `
        <h1>Mensagem recebida! ✅</h1>
        <p>Olá, <strong>${name}</strong>! Obrigado por entrar em contato com a equipe de <strong>Histórias Contadas de Outra Maneira</strong>.</p>
        <p>Recebemos sua mensagem e entraremos em contato em até <strong>48 horas</strong> pelo e-mail <strong>${email}</strong>.</p>
        <div class="data-box">
          <div class="data-row"><span class="data-label">Assunto:</span> <span class="data-value">${subject.slice(0, 150)}</span></div>
        </div>
        <div class="divider"></div>
        <p style="font-size:13px; color:#6b7280;">Se você não enviou esta mensagem, pode ignorar este e-mail com segurança.</p>
        <p style="font-size:13px; color:#6b7280;">Em caso de dúvidas, fale conosco diretamente em <a href="mailto:${CONTACT_EMAIL}" style="color:#7c3aed">${CONTACT_EMAIL}</a>.</p>
      `
    });

    // Enviamos ambos os e-mails em paralelo, sem bloquear a resposta em caso de falha
    await Promise.allSettled([
      sendMail({ to: CONTACT_EMAIL, subject: `[Contato] ${subject.slice(0, 100)}`, html: adminHtml, replyTo: email }),
      sendMail({ to: email, subject: 'Recebemos sua mensagem — Histórias Contadas de Outra Maneira', html: readerHtml })
    ]);

    return response.status(200).json({
      ok: true,
      message: 'Sua mensagem foi enviada com sucesso! A equipe da revista responderá em breve.'
    });
  } catch (error) {
    const result = publicError(error, 'Não foi possível enviar a mensagem. Tente novamente mais tarde.');
    return response.status(result.status).json({ error: result.message });
  }
}
