import test from 'node:test';
import assert from 'node:assert/strict';
import { validateArticle } from '../api/_lib/server.js';

test('accepts valid article with URL cover image and optional secondary image', () => {
  const result = validateArticle({
    title: 'O Enigma do Computador de Bronze de Anticítera',
    excerpt: 'Uma descoberta fascinante sobre tecnologia antiga que desafia a linha do tempo.',
    content: 'Este é um texto com mais de cem caracteres para testar a validação de artigos com riqueza de detalhes históricos e profundidade.'.repeat(2),
    category: 'curiosidades-geradas',
    authorEmail: 'autor@exemplo.com',
    coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    secondaryImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b'
  });

  assert.equal(result.title, 'O Enigma do Computador de Bronze de Anticítera');
  assert.equal(result.coverImage, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee');
  assert.equal(result.secondaryImage, 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b');
  assert.equal(result.category, 'curiosidades-geradas');
});

test('accepts valid article with uploaded base64 images', () => {
  const result = validateArticle({
    title: 'A Cidade Subterrânea de Derinkuyu na Capadócia',
    excerpt: 'Dezoito níveis escavados na rocha vulcânica para abrigar vinte mil pessoas.',
    content: 'Este é um texto longo o suficiente para atender ao requisito de pelo menos cem caracteres exigidos pelo comitê editorial da revista.'.repeat(2),
    category: 'curiosidades-geradas',
    authorEmail: 'escritor@exemplo.com',
    coverImage: 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/1/z/0f//1f/9z8/9f//R//8f//T//3v/9X///9A=',
    secondaryImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
  });

  assert.ok(result.coverImage.startsWith('data:image/webp;base64,'));
  assert.ok(result.secondaryImage.startsWith('data:image/jpeg;base64,'));
});

test('accepts article without secondary image (optional)', () => {
  const result = validateArticle({
    title: 'O Manuscrito Secreto de Procópio de Cesareia',
    excerpt: 'Os bastidores censurados do Império Bizantino revelados pelo cronista de Justiniano.',
    content: 'Texto longo para validação de artigo contendo mais de cem caracteres completos e bem formulados para o teste da aplicação.'.repeat(2),
    category: 'historia-alternativa',
    authorEmail: 'procopio@bizancio.com',
    coverImage: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8',
    secondaryImage: ''
  });

  assert.equal(result.secondaryImage, '');
});

test('rejects invalid image formats', () => {
  assert.throws(() => {
    validateArticle({
      title: 'Artigo com imagem maliciosa para teste de validação',
      excerpt: 'Resumo com caracteres suficientes para passar na verificação do artigo.',
      content: 'Conteúdo suficientemente longo com mais de cem caracteres para testar a rejeição de imagens inválidas.'.repeat(2),
      category: 'curiosidades-geradas',
      authorEmail: 'teste@exemplo.com',
      coverImage: 'javascript:alert("hacked")'
    });
  }, /A imagem de capa deve ser uma URL válida ou upload/);
});
