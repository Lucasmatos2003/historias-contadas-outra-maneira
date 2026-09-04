import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { cert, getApps, initializeApp } from 'firebase-admin/app';

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
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  try {
    const header = request.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return response.status(401).json({ error: 'Autenticação necessária.' });
    const user = await getAuth(getAdminApp()).verifyIdToken(header.slice(7));
    const displayName = typeof request.body?.displayName === 'string'
      ? request.body.displayName.trim().slice(0, 80)
      : '';
    await getFirestore(getAdminApp()).collection('profiles').doc(user.uid).set({
      uid: user.uid,
      displayName: displayName || user.name || user.email?.split('@')[0] || 'Escritor',
      email: user.email || '',
      role: 'writer',
      updated_at: FieldValue.serverTimestamp()
    }, { merge: true });
    return response.status(204).end();
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
