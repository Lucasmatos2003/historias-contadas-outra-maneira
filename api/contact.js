import { publicError, rateLimit, RequestError, supabaseAdmin } from './_lib/server.js';

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

    return response.status(200).json({
      ok: true,
      message: 'Sua mensagem foi enviada com sucesso! A equipe da revista responderá em breve.'
    });
  } catch (error) {
    const result = publicError(error, 'Não foi possível enviar a mensagem. Tente novamente mais tarde.');
    return response.status(result.status).json({ error: result.message });
  }
}
