import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, rateLimit, publicError, RequestError } from '../api/_lib/server.js';

test('escapeHtml properly sanitizes potentially dangerous HTML/XSS characters', () => {
  const payload = '<script>alert("xss")</script> & \'test\'';
  const escaped = escapeHtml(payload);
  assert.equal(escaped, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#039;test&#039;');
  assert.equal(escapeHtml(''), '');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(123), '123');
});

test('rateLimit allows requests within limit and throws 429 when exceeded', () => {
  const fakeRequest = {
    headers: { 'x-forwarded-for': '192.168.1.100' }
  };
  const scope = 'test-scope-' + Date.now();

  // Permite até 3 requisições
  assert.doesNotThrow(() => rateLimit(fakeRequest, scope, 3, 10000));
  assert.doesNotThrow(() => rateLimit(fakeRequest, scope, 3, 10000));
  assert.doesNotThrow(() => rateLimit(fakeRequest, scope, 3, 10000));

  // A 4ª requisição deve lançar RequestError com status 429
  assert.throws(
    () => rateLimit(fakeRequest, scope, 3, 10000),
    (err) => err instanceof RequestError && err.status === 429
  );
});

test('publicError does not leak internal SQL or infrastructure errors to clients', () => {
  const secretError = new Error('syntax error at or near "DROP TABLE" on public.articles; SECRET_KEY=123');
  const sanitized = publicError(secretError, 'Erro ao processar requisição.');

  assert.equal(sanitized.status, 500);
  assert.equal(sanitized.message, 'Erro ao processar requisição.');
  assert.ok(!sanitized.message.includes('DROP TABLE'));
  assert.ok(!sanitized.message.includes('SECRET_KEY'));
});

test('publicError preserves user-facing RequestError messages and status', () => {
  const clientError = new RequestError('Informe um e-mail válido.', 400);
  const result = publicError(clientError);

  assert.equal(result.status, 400);
  assert.equal(result.message, 'Informe um e-mail válido.');
});
