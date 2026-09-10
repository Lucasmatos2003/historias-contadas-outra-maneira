import React from 'react';
import { getArticleAmazonBooks } from '../data';

export function enhanceArticleContent(id, title, content) {
  if (!Array.isArray(content) || content.length === 0) return content;
  const copy = [...content];
  const lastIdx = copy.length - 1;
  const lastParagraph = copy[lastIdx];
  const t = (title || '').toLowerCase();

  // Se já tem link de amazon no último parágrafo, não altera
  if (lastParagraph && lastParagraph.includes('amazon.com')) return copy;

  if (id === '6cac4c2e-e107-44e3-badc-2494a99cc76c' || t.includes('asteca') || t.includes('obsidiana')) {
    copy[lastIdx] = lastParagraph.replace(
      /Armas,\s*Germes e Aço de Jared Diamond\.?$/i,
      '[Armas, Germes e Aço de Jared Diamond](https://www.amazon.com.br/dp/8501111656?tag=historiasco0b-20&linkCode=as2) e o aprofundamento essencial em [1491: Novas Revelações das Américas Antes de Colombo de Charles C. Mann](https://www.amazon.com.br/dp/8535921478?tag=historiasco0b-20&linkCode=as2).'
    );
    if (!copy[lastIdx].includes('amazon.com')) {
      copy[lastIdx] = `${lastParagraph} Para entender as mecânicas reais de como a biologia e a tecnologia selaram o destino das civilizações pré-colombianas, a leitura definitiva é [Armas, Germes e Aço de Jared Diamond](https://www.amazon.com.br/dp/8501111656?tag=historiasco0b-20&linkCode=as2) e [1491: Novas Revelações das Américas Antes de Colombo de Charles C. Mann](https://www.amazon.com.br/dp/8535921478?tag=historiasco0b-20&linkCode=as2).`;
    }
  } else if (id === '813fdec6-d047-4caf-b894-1e0911fb5f5b' || t.includes('alexandria') || t.includes('biblioteca')) {
    copy[lastIdx] = `${lastParagraph} Para quem deseja mergulhar nas ideias extraordinárias que sobreviveram a essa tragédia, recomendamos as obras [Cosmos de Carl Sagan](https://www.amazon.com.br/dp/8535929177?tag=historiasco0b-20&linkCode=as2) e [O Infinito em um Junco: A Invenção dos Livros no Mundo Antigo de Irene Vallejo](https://www.amazon.com.br/dp/8551007802?tag=historiasco0b-20&linkCode=as2).`;
  } else if (id === '944356ff-7c91-4e69-b7fc-080b679c7e41' || t.includes('luso-brasileiro') || t.includes('setembro')) {
    copy[lastIdx] = `${lastParagraph} Para conhecer os bastidores reais das tensões que quase mantiveram os dois mundos sob uma mesma coroa, vale a leitura da clássica investigação [1822 de Laurentino Gomes](https://www.amazon.com.br/dp/8525061604?tag=historiasco0b-20&linkCode=as2) e [D. Pedro: A História Não Contada de Paulo Rezzutti](https://www.amazon.com.br/dp/8577345831?tag=historiasco0b-20&linkCode=as2).`;
  }
  return copy;
}

export function formatSupabaseArticle(row) {
  const categoryNames = {
    'historia-alternativa': 'História Alternativa',
    'curiosidades-geradas': 'Curiosidades Históricas',
    'geopolitica-ficticia': 'Geopolítica Fictícia'
  };
  const category = categoryNames[row.category] || row.category || 'História Alternativa';
  const categorySlug = row.category === 'curiosidades-geradas'
    ? 'curiosidades-geradas'
    : (row.category === 'geopolitica-ficticia' ? 'geopolitica-ficticia' : 'historia-alternativa');
  const words = (row.content || '').split(/\s+/).length;
  const readingTime = `${Math.max(1, Math.round(words / 160))} min`;
  const date = row.created_at
    ? new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    : 'Recentemente';
  const slugBase = (row.title || 'artigo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = `${slugBase}-${(row.id || '').slice(0, 8)}`;

  let content = [];
  if (Array.isArray(row.content)) {
    content = row.content;
  } else if (typeof row.content === 'string') {
    try {
      const parsed = JSON.parse(row.content);
      content = Array.isArray(parsed) ? parsed : row.content.split('\n').filter(Boolean);
    } catch {
      content = row.content.split('\n').filter(Boolean);
    }
  }

  const amazonBooks = getArticleAmazonBooks({ id: row.id, title: row.title, category: row.category, slugBase });
  const enhancedContent = enhanceArticleContent(row.id, row.title, content);

  return {
    id: row.id,
    slug,
    slugBase,
    title: row.title,
    excerpt: row.excerpt,
    category,
    categorySlug,
    author: row.author_name || 'Escritor',
    author_uid: row.author_uid,
    readingTime,
    date,
    image: row.cover_image || 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1400&q=85',
    secondaryImage: row.secondary_image || '',
    content: enhancedContent,
    amazonBooks,
    featured: false
  };
}

export function renderParagraphContent(text) {
  if (typeof text !== 'string') return text;
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }
    const label = match[1];
    const href = match[2];
    const isAmazon = href.includes('amazon.com');
    elements.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel={isAmazon ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
        className={isAmazon ? 'article-affiliate-link' : 'article-inline-link'}
        title={isAmazon ? `Ver "${label}" na Amazon` : label}
      >
        {isAmazon && <span className="affiliate-book-icon" aria-hidden="true">📖 </span>}
        {label}
      </a>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex === 0) return text;
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }
  return elements;
}

export function formatReviewDate(value) {
  return value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Data pendente';
}
