import { publicError, rateLimit, supabaseAdmin, verifyAdmin } from '../_lib/server.js';

export default async function handler(request, response) {
  try {
    const admin = await verifyAdmin(request);
    rateLimit(request, `admin:${admin.uid}`, 60, 60 * 1000);

    const database = supabaseAdmin();

    if (request.method === 'GET') {
      const { data, error } = await database
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela ainda não existir no banco, retorna array vazio sem falhar a tela
        return response.status(200).json({ messages: [] });
      }

      return response.status(200).json({ messages: data || [] });
    }

    if (request.method === 'PATCH') {
      const { id, status } = request.body || {};
      if (!id || !['unread', 'read', 'archived'].includes(status)) {
        return response.status(400).json({ error: 'Informe um ID e status válido.' });
      }

      const { error } = await database
        .from('contact_messages')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return response.status(200).json({ ok: true, id, status });
    }

    if (request.method === 'DELETE') {
      const id = request.query?.id || request.body?.id;
      if (!id) {
        return response.status(400).json({ error: 'Informe o ID da mensagem para exclusão.' });
      }

      const { error } = await database
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return response.status(200).json({ ok: true, id });
    }

    return response.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const result = publicError(error, 'Não foi possível processar a requisição de mensagens.');
    return response.status(result.status).json({ error: result.message });
  }
}
