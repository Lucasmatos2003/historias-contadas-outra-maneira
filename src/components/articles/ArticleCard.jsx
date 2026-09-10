import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { FavoriteButton } from '../ui/FavoriteButton';

export function ArticleCard({ article, index = 0 }) {
  const go = useNavigation();
  const cover = article.image || article.cover_image || 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80';

  return (
    <article className="story-card">
      <div className="story-card-thumb" onClick={() => go(`/artigo/${article.slug}`)}>
        <img src={cover} alt={article.title} loading="lazy" />
        <span className="tag">{article.category}</span>
      </div>
      <div className="story-card-body">
        <h4>
          <a
            href={`/artigo/${article.slug}`}
            onClick={(event) => {
              event.preventDefault();
              go(`/artigo/${article.slug}`);
            }}
          >
            {article.title}
          </a>
        </h4>
        <p>{article.excerpt}</p>
      </div>
      <div className="card-footer">
        <div className="meta-row small">
          <span>{article.author ? `${article.author} · ` : ''}{article.readingTime}</span>
          <span>{article.date}</span>
        </div>
        <FavoriteButton slug={article.slug} />
      </div>
    </article>
  );
}
