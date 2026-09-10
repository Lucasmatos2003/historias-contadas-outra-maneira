import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';

export function ReadNextGrid({ currentSlug, currentCategory, articles }) {
  const go = useNavigation();
  const fallbackImg = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=75';
  const sameCategory = articles.filter((a) => a.slug !== currentSlug && a.categorySlug === currentCategory);
  const others = articles.filter((a) => a.slug !== currentSlug && a.categorySlug !== currentCategory);
  const readNext = [...sameCategory, ...others].slice(0, 3);
  if (!readNext.length) return null;

  return (
    <section className="read-next-section" aria-labelledby="read-next-heading">
      <div className="read-next-header">
        <div className="read-next-badge"><span aria-hidden="true">⟳</span> Continue a Jornada</div>
        <h3 id="read-next-heading">Histórias que você vai querer ler agora</h3>
        <p className="read-next-sub">Selecionadas com base no que você acabou de ler</p>
      </div>
      <div className="read-next-grid">
        {readNext.map((art) => (
          <article
            key={art.slug}
            className="read-next-card"
            onClick={() => {
              go(`/artigo/${art.slug}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                go(`/artigo/${art.slug}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Ler: ${art.title}`}
          >
            <div className="read-next-card-img">
              <img
                src={art.image || art.cover_image || fallbackImg}
                alt={art.title}
                loading="lazy"
              />
              <span className="read-next-card-cat">{art.category}</span>
            </div>
            <div className="read-next-card-body">
              <h4 className="read-next-card-title">{art.title}</h4>
              <p className="read-next-card-excerpt">{art.excerpt}</p>
              <span className="read-next-card-meta">
                {art.readingTime} de leitura <span aria-hidden="true">→</span>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
