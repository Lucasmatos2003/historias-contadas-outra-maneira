import { publicError, rateLimit, supabaseAdmin, validateProfilePhoto, verifyUser } from '../_lib/server.js';

export default async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) return response.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await verifyUser(request);
    rateLimit(request, `profile:${user.uid}`, 20, 15 * 60 * 1000);
    const database = supabaseAdmin();
    if (request.method === 'GET') {
      const { data: profile, error } = await database.from('profiles').select('*').eq('uid', user.uid).maybeSingle();
      if (error) throw error;
      return response.status(200).json({
        displayName: profile?.display_name || user.name || user.email?.split('@')[0] || 'Escritor',
        photoURL: profile?.photo_url || '',
        role: profile?.role || 'writer'
      });
    }
    if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
      return response.status(400).json({ error: 'Dados de perfil inválidos.' });
    }
    const displayName = typeof request.body?.displayName === 'string'
      ? request.body.displayName.trim().slice(0, 80)
      : '';
    if (displayName.length < 2 || displayName.length > 80) {
      return response.status(400).json({ error: 'O nome público deve ter entre 2 e 80 caracteres.' });
    }
    const photoURL = validateProfilePhoto(request.body?.photoURL);
    const { error: profileError } = await database.from('profiles').upsert({
      uid: user.uid,
      display_name: displayName || user.name || user.email?.split('@')[0] || 'Escritor',
      photo_url: photoURL,
      email: user.email || '',
      role: 'writer',
      updated_at: new Date().toISOString()
    }, { onConflict: 'uid' });
    if (profileError) throw profileError;
    const { error: articlesError } = await database.from('articles')
      .update({ author_name: displayName, updated_at: new Date().toISOString() })
      .eq('author_uid', user.uid);
    if (articlesError) throw articlesError;
    return response.status(204).end();
  } catch (error) {
    const result = publicError(error, 'Não foi possível salvar o perfil.');
    return response.status(result.status).json({ error: result.message });
  }
}
