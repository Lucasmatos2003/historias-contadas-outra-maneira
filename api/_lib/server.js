import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function adminApp() {
  return getApps()[0] || initializeApp({
    credential: cert({
      projectId: requireEnv('FIREBASE_PROJECT_ID'),
      clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey: requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n')
    })
  });
}

function firestore() {
  return getFirestore(adminApp());
}

async function createArticle(data) {
  const reference = await firestore().collection('articles').add({
    ...data,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp()
  });
  return { id: reference.id, ...data };
}

async function getArticle(id) {
  const snapshot = await firestore().collection('articles').doc(id).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
}

async function updateArticle(id, data) {
  await firestore().collection('articles').doc(id).update({
    ...data,
    updated_at: FieldValue.serverTimestamp()
  });
}

async function verifyUser(request) {
  const header = request.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new Error('Autenticação necessária.');
  return getAuth(adminApp()).verifyIdToken(header.slice(7));
}

async function mercadoPagoRequest(path, options = {}) {
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${requireEnv('MERCADOPAGO_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Mercado Pago request failed (${response.status}): ${details}`);
  }
  return response.json();
}

function validateArticle(payload) {
  const title = typeof payload?.title === 'string' ? payload.title.trim() : '';
  const excerpt = typeof payload?.excerpt === 'string' ? payload.excerpt.trim() : '';
  const content = typeof payload?.content === 'string' ? payload.content.trim() : '';
  const authorEmail = typeof payload?.authorEmail === 'string' ? payload.authorEmail.trim().toLowerCase() : '';
  const category = payload?.category === 'historia-alternativa' || payload?.category === 'curiosidades-geradas'
    ? payload.category
    : '';

  if (title.length < 10 || title.length > 160) throw new Error('O título deve ter entre 10 e 160 caracteres.');
  if (excerpt.length < 20 || excerpt.length > 500) throw new Error('O resumo deve ter entre 20 e 500 caracteres.');
  if (content.length < 100 || content.length > 50000) throw new Error('O texto deve ter entre 100 e 50.000 caracteres.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) throw new Error('Informe um e-mail válido.');
  if (!category) throw new Error('Selecione uma categoria válida.');

  return { title, excerpt, content, authorEmail, category };
}

export { createArticle, getArticle, mercadoPagoRequest, requireEnv, updateArticle, validateArticle, verifyUser };
