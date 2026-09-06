import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { publicError, rateLimit, validateProfilePhoto } from '../_lib/server.js';

function getAdminApp() {
  return getApps()[0] || initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

export default async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) return response.status(405).json({ error: 'Method not allowed' });
  try {
    const header = request.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return response.status(401).json({ error: 'Autenticação necessária.' });
    const user = await getAuth(getAdminApp()).verifyIdToken(header.slice(7));
    rateLimit(request, `profile:${user.uid}`, 20, 15 * 60 * 1000);
    const database = getFirestore(getAdminApp());
    if (request.method === 'GET') {
      const snapshot = await database.collection('profiles').doc(user.uid).get();
      const profile = snapshot.exists ? snapshot.data() : {};
      return response.status(200).json({
        displayName: profile.displayName || user.name || user.email?.split('@')[0] || 'Escritor',
        photoURL: profile.photoURL || '',
        role: profile.role || 'writer'
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
    await database.collection('profiles').doc(user.uid).set({
      uid: user.uid,
      displayName: displayName || user.name || user.email?.split('@')[0] || 'Escritor',
      photoURL,
      email: user.email || '',
      role: 'writer',
      updated_at: FieldValue.serverTimestamp()
    }, { merge: true });
    const articles = await database.collection('articles').where('author_uid', '==', user.uid).get();
    if (!articles.empty) {
      const batch = database.batch();
      articles.docs.forEach((article) => batch.update(article.ref, {
        author_name: displayName,
        updated_at: FieldValue.serverTimestamp()
      }));
      await batch.commit();
    }
    return response.status(204).end();
  } catch (error) {
    const result = publicError(error, 'Não foi possível salvar o perfil.');
    return response.status(result.status).json({ error: result.message });
  }
}
