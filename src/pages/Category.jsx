import React, { useState, useMemo, useEffect } from 'react';
import { categoryInfo } from '../data';
import { ArticleCard } from '../components/articles/ArticleCard';
import { NotFound } from './NotFound';

export function Category({ slug, articles = [] }) {
  const info = categoryInfo[slug];
  if (!info) return <NotFound />;

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const filtered = useMemo(() => {
    const value = articles.filter(
      (article) =>
        article.categorySlug === slug &&
        `${article.title} ${article.excerpt}`.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === 'title') return [...value].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'reading') return [...value].sort((a, b) => parseInt(a.readingTime, 10) - parseInt(b.readingTime, 10));
    return value;
  }, [articles, query, sort, slug]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [query, sort, slug]);

  return (
    <main className="container category-page">
      <section className="category-hero">
        <div className="category-hero-header">
          <p className="eyebrow"><span className="eyebrow-accent">/</span> Categoria Editorial</p>
          <h2>{info?.name || 'Categoria'}</h2>
          <p>{info?.description || 'Explore as histórias publicadas.'} Neste espaço, indícios, hipóteses e cenários possíveis redefinem o rastro das civilizações.</p>
        </div>
        <div className="category-controls-bar">
          <div className="category-search-box">
            <span className="category-search-icon" aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar nesta categoria..."
              aria-label="Pesquisar nesta categoria"
            />
            {query && (
              <button className="clear-search-btn" onClick={() => setQuery('')} aria-label="Limpar busca" type="button">
                ×
              </button>
            )}
          </div>
          <div className="category-sort-box">
            <label htmlFor="category-sort-select">Ordenar por:</label>
            <select
              id="category-sort-select"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Ordenar artigos"
            >
              <option value="recent">Mais recentes</option>
              <option value="reading">Leitura mais curta</option>
              <option value="title">Ordem alfabética (A-Z)</option>
            </select>
          </div>
          <div className="category-count-badge">
            <span>{filtered.length} {filtered.length === 1 ? 'história' : 'histórias'}</span>
          </div>
        </div>
      </section>

      {visible.length > 0 ? (
        <section className="category-grid">
          {visible.map((article, index) => (
            <ArticleCard key={article.slug || article.id} article={article} index={index} />
          ))}
        </section>
      ) : (
        <div className="empty-category-state">
          <div className="empty-category-icon">⌕</div>
          <h3>Nenhum artigo encontrado</h3>
          <p>{query ? `Nenhum texto corresponde à busca "${query}" nesta categoria.` : 'Ainda não há artigos cadastrados nesta categoria.'}</p>
          {query && (
            <button className="button button-secondary" onClick={() => setQuery('')} type="button">
              Limpar pesquisa
            </button>
          )}
        </div>
      )}

      {filtered.length > pageSize && (
        <nav className="pagination" aria-label="Paginação">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={page === index + 1 ? 'active' : ''}
              onClick={() => setPage(index + 1)}
              type="button"
            >
              {index + 1}
            </button>
          ))}
        </nav>
      )}
    </main>
  );
}
