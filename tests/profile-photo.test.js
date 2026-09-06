import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProfilePhoto } from '../api/_lib/server.js';

test('accepts an empty profile photo', () => {
  assert.equal(validateProfilePhoto(''), '');
});

test('accepts HTTPS profile photo URLs', () => {
  assert.equal(validateProfilePhoto(' https://example.com/avatar.webp '), 'https://example.com/avatar.webp');
});

test('accepts supported base64 profile photos', () => {
  assert.equal(validateProfilePhoto('data:image/png;base64,AAAA'), 'data:image/png;base64,AAAA');
});

test('rejects unsupported profile photo URLs', () => {
  assert.throws(() => validateProfilePhoto('javascript:alert(1)'), /imagem JPG, PNG ou WebP válida/);
});
