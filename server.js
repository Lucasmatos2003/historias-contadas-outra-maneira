import { createReadStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import http from 'node:http';
import { URL } from 'node:url';

const rootDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)));
const publicDirectory = join(rootDirectory, 'dist');
const port = Number(process.env.PORT || 3000);
const apiHandlers = {
  '/api/admin/access': './api/admin/access.js',
  '/api/admin/articles': './api/admin/articles.js',
  '/api/articles/mine': './api/articles/mine.js',
  '/api/articles/status': './api/articles/status.js',
  '/api/articles/submit': './api/articles/submit.js',
  '/api/payments/webhook': './api/payments/webhook.js',
  '/api/profiles/upsert': './api/profiles/upsert.js',
  '/api/writers/profile': './api/writers/profile.js'
};
const handlerCache = new Map();

function getHandler(pathname) {
  const modulePath = apiHandlers[pathname];
  if (!modulePath) return null;
  if (!handlerCache.has(pathname)) {
    handlerCache.set(pathname, import(pathToFileURL(join(rootDirectory, modulePath)).href));
  }
  return handlerCache.get(pathname).then((module) => module.default);
}

function responseAdapter(nativeResponse) {
  let statusCode = 200;
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      if (nativeResponse.writableEnded) return this;
      nativeResponse.statusCode = statusCode;
      nativeResponse.setHeader('Content-Type', 'application/json; charset=utf-8');
      nativeResponse.end(JSON.stringify(payload));
      return this;
    },
    end(payload = '') {
      if (nativeResponse.writableEnded) return this;
      nativeResponse.statusCode = statusCode;
      nativeResponse.end(payload);
      return this;
    }
  };
}

async function readBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return {};
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 2 * 1024 * 1024) throw new Error('Payload muito grande.');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const rawBody = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error('JSON inválido.');
  }
}

async function handleApi(request, nativeResponse, parsedUrl) {
  const handler = await getHandler(parsedUrl.pathname);
  if (!handler) return false;
  try {
    request.query = Object.fromEntries(parsedUrl.searchParams.entries());
    request.body = await readBody(request);
    await handler(request, responseAdapter(nativeResponse));
  } catch (error) {
    if (!nativeResponse.writableEnded) {
      nativeResponse.statusCode = error.message === 'Payload muito grande.' ? 413 : 400;
      nativeResponse.setHeader('Content-Type', 'application/json; charset=utf-8');
      nativeResponse.end(JSON.stringify({ error: error.message }));
    }
  }
  return true;
}

function contentType(filePath) {
  return {
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  }[extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function serveStatic(nativeResponse, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = normalize(join(publicDirectory, requestedPath));
  if (!filePath.startsWith(publicDirectory)) return false;
  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) return false;
    nativeResponse.statusCode = 200;
    nativeResponse.setHeader('Content-Type', contentType(filePath));
    createReadStream(filePath).pipe(nativeResponse);
    return true;
  } catch {
    if (extname(requestedPath)) return false;
    const fallback = join(publicDirectory, 'index.html');
    nativeResponse.statusCode = 200;
    nativeResponse.setHeader('Content-Type', 'text/html; charset=utf-8');
    createReadStream(fallback).pipe(nativeResponse);
    return true;
  }
}

const server = http.createServer(async (request, nativeResponse) => {
  const parsedUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (parsedUrl.pathname === '/api/health') {
    nativeResponse.statusCode = 200;
    nativeResponse.setHeader('Content-Type', 'application/json; charset=utf-8');
    nativeResponse.end(JSON.stringify({ ok: true }));
    return;
  }
  if (parsedUrl.pathname.startsWith('/api/')) {
    const handled = await handleApi(request, nativeResponse, parsedUrl);
    if (handled) return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    nativeResponse.statusCode = 405;
    nativeResponse.setHeader('Allow', 'GET, HEAD');
    nativeResponse.end('Method not allowed');
    return;
  }
  const served = await serveStatic(nativeResponse, parsedUrl.pathname);
  if (!served && !nativeResponse.writableEnded) {
    nativeResponse.statusCode = 404;
    nativeResponse.end('Not found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Application listening on port ${port}`);
});
