import React from 'react';
import { amazonLink } from '../../data';

export function AmazonBookWidget({ books, compact = false }) {
  if (!books || !books.length) return null;

  return (
    <div className={`amazon-widget ${compact ? 'amazon-widget--compact' : ''}`}>
      <div className="amazon-widget-header">
        <span className="amazon-widget-icon">📚</span>
        <div>
          <p className="amazon-widget-eyebrow">Leituras recomendadas</p>
          <h4 className="amazon-widget-title">Aprofunde seu Conhecimento</h4>
        </div>
        <span className="amazon-widget-badge">Amazon Associates</span>
      </div>
      <div className={`amazon-books-grid ${books.length === 1 ? 'amazon-books-grid--single' : ''}`}>
        {books.map((book) => (
          <a
            key={book.asin}
            href={amazonLink(book.asin)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="amazon-book-card"
            aria-label={`Ver ${book.title} na Amazon`}
          >
            <div className="amazon-book-cover">
              <span className="amazon-book-cover-icon">📖</span>
            </div>
            <div className="amazon-book-info">
              <span className="amazon-book-category">Livro</span>
              <h5 className="amazon-book-title">{book.title}</h5>
              <span className="amazon-book-author">{book.author}</span>
              {!compact && <p className="amazon-book-desc">{book.description}</p>}
              <div className="amazon-book-footer">
                <span className="amazon-book-price">{book.price}</span>
                <span className="amazon-book-cta">
                  Ver na Amazon
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="amazon-disclosure">* Links de afiliado. Ao comprar, você apoia a revista sem custo extra.</p>
    </div>
  );
}
