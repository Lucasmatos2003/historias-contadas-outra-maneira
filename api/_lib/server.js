import { createClient } from '@supabase/supabase-js';
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
  const detail = error?.message || error?.details;
  if (detail && typeof detail === 'string' && !detail.includes('SUPABASE_') && !detail.includes('SERVICE_ROLE') && !detail.includes('KEY')) {
    return { status: 500, message: `${fallback} (${detail})` };
  }
  return { status: 500, message: fallback };
}

function verifyMercadoPagoSignature(request, paymentId) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return; // Quando o segredo ainda não foi configurado, a validação é feita diretamente via consulta autenticada à API do Mercado Pago
  const signature = request.headers['x-signature'] || '';
  const requestId = request.headers['x-request-id'] || '';
  if (!signature) return;
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

function supabaseAdmin() {
  if (!globalThis.__supabaseAdmin) {
    globalThis.__supabaseAdmin = createClient(
      requireEnv('SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return globalThis.__supabaseAdmin;
}

function serializeDate(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value instanceof Date ? value.toISOString() : null;
}

function validateProfilePhoto(photoURL) {
  const value = typeof photoURL === 'string' ? photoURL.trim() : '';
  if (value && !(/^https:\/\/[^\s]{1,1900}$/i.test(value) || /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]{1,700000}$/.test(value))) {
    throw new RequestError('Envie uma imagem JPG, PNG ou WebP válida.', 400);
  }
  return value;
}

async function createArticle(data) {
  let { data: article, error } = await supabaseAdmin()
    .from('articles')
    .insert(data)
    .select('id')
    .single();

  if (error && (error.code === '42703' || error.code === 'PGRST204' || String(error.message || '').includes('secondary_image') || String(error.details || '').includes('secondary_image'))) {
    console.warn('Aviso: Coluna secondary_image ainda não existe no Supabase. Salvando artigo sem ela...');
    const fallbackData = { ...data };
    delete fallbackData.secondary_image;
    const retry = await supabaseAdmin()
      .from('articles')
      .insert(fallbackData)
      .select('id')
      .single();
    article = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  return { id: article.id, ...data };
}

async function getArticle(id) {
  const { data, error } = await supabaseAdmin().from('articles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function getArticlesByAuthor(uid) {
  const { data, error } = await supabaseAdmin().from('articles')
    .select('*')
    .eq('author_uid', uid);
  if (error) throw error;
  return data
    .map((article) => {
      return {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content || '',
        category: article.category,
        author_name: article.author_name || 'Escritor',
        cover_image: article.cover_image || '',
        secondary_image: article.secondary_image || '',
        status: article.status,
        review_note: article.review_note || '',
        created_at: serializeDate(article.created_at),
        reviewed_at: serializeDate(article.reviewed_at),
        updated_at: serializeDate(article.updated_at)
      };
    })
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

async function getPublicWriter(uid) {
  const [{ data: profile, error: profileError }, { data: articles, error: articleError }] = await Promise.all([
    supabaseAdmin().from('profiles').select('*').eq('uid', uid).maybeSingle(),
    supabaseAdmin().from('articles').select('*').eq('author_uid', uid).eq('status', 'aprovado')
  ]);
  if (profileError) throw profileError;
  if (articleError) throw articleError;
  if (!profile) return null;
  return {
    uid,
    displayName: profile.display_name || 'Escritor',
    photoURL: profile.photo_url || '',
    bio: profile.bio || '',
    articles: articles.map((article) => {
      return {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category,
        cover_image: article.cover_image || '',
        created_at: serializeDate(article.created_at)
      };
    }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  };
}

async function getAllArticles() {
  const { data, error } = await supabaseAdmin().from('articles').select('*');
  if (error) throw error;
  return data.map((article) => {
    return {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      author_email: article.author_email,
      author_name: article.author_name || 'Escritor',
      author_uid: article.author_uid,
      cover_image: article.cover_image || '',
      secondary_image: article.secondary_image || '',
      status: article.status,
      created_at: serializeDate(article.created_at),
      review_note: article.review_note || ''
    };
  }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

async function updateArticle(id, data) {
  const payload = {
    ...data,
    updated_at: new Date().toISOString()
  };

  let { error } = await supabaseAdmin().from('articles').update(payload).eq('id', id);

  if (error && (error.code === '42703' || error.code === 'PGRST204' || String(error.message || '').includes('secondary_image') || String(error.details || '').includes('secondary_image'))) {
    console.warn('Aviso: Coluna secondary_image ainda não existe no Supabase. Atualizando artigo sem ela...');
    const fallbackPayload = { ...payload };
    delete fallbackPayload.secondary_image;
    const retry = await supabaseAdmin().from('articles').update(fallbackPayload).eq('id', id);
    error = retry.error;
  }

  if (error) throw error;
}

async function verifyUser(request) {
  const header = request.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new Error('Autenticação necessária.');
  try {
    const { data, error } = await supabaseAdmin().auth.getUser(header.slice(7));
    if (error || !data.user) throw error || new Error('Usuário inválido.');
    const user = data.user;
    return {
      ...user,
      uid: user.id,
      name: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Escritor'
    };
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
  const secondaryImage = typeof payload?.secondaryImage === 'string' ? payload.secondaryImage.trim() : '';
  const category = payload?.category === 'historia-alternativa' || payload?.category === 'curiosidades-geradas'
    ? payload.category
    : '';

  if (title.length < 10 || title.length > 160) throw new RequestError('O título deve ter entre 10 e 160 caracteres.');
  if (excerpt.length < 20 || excerpt.length > 500) throw new RequestError('O resumo deve ter entre 20 e 500 caracteres.');
  if (content.length < 100 || content.length > 50000) throw new RequestError('O texto deve ter entre 100 e 50.000 caracteres.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(authorEmail)) throw new RequestError('Informe um e-mail válido.');
  if (!category) throw new RequestError('Selecione uma categoria válida.');

  const isValidImage = (value) => {
    if (!value) return true;
    if (typeof value !== 'string') return false;
    const clean = value.trim();
    if (/^https?:\/\/[^\s]{1,2500}$/i.test(clean)) return true;
    if (/^data:image\/(?:jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=\s_-]{1,10000000}$/i.test(clean)) return true;
    return false;
  };

  if (!isValidImage(coverImage)) throw new RequestError('A imagem de capa deve ser uma URL válida ou upload JPG, PNG ou WebP.');
  if (!isValidImage(secondaryImage)) throw new RequestError('A imagem secundária deve ser uma URL válida ou upload JPG, PNG ou WebP.');
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(`${title}${excerpt}${content}`)) {
    throw new RequestError('O conteúdo contém caracteres inválidos.');
  }

  return { title, excerpt, content, authorEmail, category, coverImage, secondaryImage };
}

export { createArticle, getAllArticles, getArticle, getArticlesByAuthor, getPublicWriter, mercadoPagoRequest, publicError, rateLimit, requireEnv, RequestError, supabaseAdmin, updateArticle, validateArticle, validateProfilePhoto, verifyAdmin, verifyMercadoPagoSignature, verifyUser };
