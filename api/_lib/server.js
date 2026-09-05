import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createHmac, timingSafeEqual } from 'node:crypto';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

class RequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function rateLimit(request, scope, limit, windowMs) {
  const forwardedFor = request.headers['x-forwarded-for'];
  const ip = (forwardedFor || request.headers['x-real-ip'] || 'unknown').split(',')[0].trim();
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const buckets = globalThis.__mentoraRateLimits || (globalThis.__mentoraRateLimits = new Map());
  const bucket = buckets.get(key) || { count: 0, startedAt: now };
  if (now - bucket.startedAt >= windowMs) {
    bucket.count = 0;
    bucket.startedAt = now;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  if (bucket.count > limit) {
    throw new RequestError('Muitas tentativas. Aguarde alguns minutos e tente novamente.', 429);
  }
}

function publicError(error, fallback = 'Não foi possível concluir a operação.') {
  if (error instanceof RequestError) return { status: error.status, message: error.message };
  if (error?.message === 'Autenticação necessária.') return { status: 401, message: error.message };
  if (error?.message === 'Acesso de administrador necessário.') return { status: 403, message: error.message };
  if (error?.status === 400) return { status: 400, message: error.message };
  console.error(error);
  return { status: 500, message: fallback };
}

function verifyMercadoPagoSignature(request, paymentId) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) throw new RequestError('Webhook não configurado.', 500);
  const signature = request.headers['x-signature'] || '';
  const requestId = request.headers['x-request-id'] || '';
  const parts = Object.fromEntries(signature.split(',').map((part) => part.trim().split('=')));
  const timestamp = Number(parts.ts);
  const received = parts.v1;
  if (!requestId || !received || !Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp * 1000) > 5 * 60 * 1000) {
    throw new RequestError('Assinatura inválida.', 401);
  }
  const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(received, 'hex');
  if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
    throw new RequestError('Assinatura inválida.', 401);
  }
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

function serializeDate(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.toDate?.().toISOString() || null;
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

async function getArticlesByAuthor(uid) {
  const snapshot = await firestore().collection('articles')
    .where('author_uid', '==', uid)
    .get();
  return snapshot.docs
    .map((document) => {
      const data = document.data();
      return {
        id: document.id,
        title: data.title,
        excerpt: data.excerpt,
        category: data.category,
        author_name: data.author_name || 'Escritor',
        cover_image: data.cover_image || '',
        status: data.status,
        review_note: data.review_note || '',
        created_at: serializeDate(data.created_at),
        reviewed_at: serializeDate(data.reviewed_at),
        updated_at: serializeDate(data.updated_at)
      };
    })
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

async function getPublicWriter(uid) {
  const profileSnapshot = await firestore().collection('profiles').doc(uid).get();
  if (!profileSnapshot.exists) return null;
  const articleSnapshot = await firestore().collection('articles')
    .where('author_uid', '==', uid)
    .get();
  const profile = profileSnapshot.data();
  return {
    uid,
    displayName: profile.displayName || 'Escritor',
    bio: profile.bio || '',
    articles: articleSnapshot.docs.filter((document) => document.data().status === 'aprovado').map((document) => {
      const data = document.data();
      return {
        id: document.id,
        title: data.title,
        excerpt: data.excerpt,
        category: data.category,
        cover_image: data.cover_image || '',
        created_at: serializeDate(data.created_at)
      };
    }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  };
}

async function getAllArticles() {
  const snapshot = await firestore().collection('articles').get();
  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      author_email: data.author_email,
      author_name: data.author_name || 'Escritor',
      author_uid: data.author_uid,
      status: data.status,
      created_at: data.created_at?.toDate?.().toISOString() || null,
      review_note: data.review_note || ''
    };
  }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
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
  try {
    return await getAuth(adminApp()).verifyIdToken(header.slice(7));
  } catch {
    throw new RequestError('Autenticação necessária.', 401);
  }
}

async function verifyAdmin(request) {
  const user = await verifyUser(request);
  if (user.uid !== requireEnv('ADMIN_UID')) throw new Error('Acesso de administrador necessário.');
  return user;
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
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestError('Informe os dados do artigo.', 400);
  }
  const title = typeof payload?.title === 'string' ? payload.title.trim() : '';
  const excerpt = typeof payload?.excerpt === 'string' ? payload.excerpt.trim() : '';
  const content = typeof payload?.content === 'string' ? payload.content.trim() : '';
  const authorEmail = typeof payload?.authorEmail === 'string' ? payload.authorEmail.trim().toLowerCase() : '';
  const coverImage = typeof payload?.coverImage === 'string' ? payload.coverImage.trim() : '';
  const category = payload?.category === 'historia-alternativa' || payload?.category === 'curiosidades-geradas'
    ? payload.category
    : '';

  if (title.length < 10 || title.length > 160) throw new RequestError('O título deve ter entre 10 e 160 caracteres.');
  if (excerpt.length < 20 || excerpt.length > 500) throw new RequestError('O resumo deve ter entre 20 e 500 caracteres.');
  if (content.length < 100 || content.length > 50000) throw new RequestError('O texto deve ter entre 100 e 50.000 caracteres.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(authorEmail)) throw new RequestError('Informe um e-mail válido.');
  if (!category) throw new RequestError('Selecione uma categoria válida.');
  if (coverImage && (!/^https?:\/\/[^\s]{1,1900}$/i.test(coverImage))) throw new RequestError('Informe uma URL de imagem válida.');
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(`${title}${excerpt}${content}`)) {
    throw new RequestError('O conteúdo contém caracteres inválidos.');
  }

  return { title, excerpt, content, authorEmail, category, coverImage };
}

export { createArticle, getAllArticles, getArticle, getArticlesByAuthor, getPublicWriter, mercadoPagoRequest, publicError, rateLimit, requireEnv, RequestError, updateArticle, validateArticle, verifyAdmin, verifyMercadoPagoSignature, verifyUser };
