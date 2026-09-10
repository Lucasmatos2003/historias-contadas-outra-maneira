import React, { useEffect } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { NotFound } from './NotFound';
import { ReadingProgressBar } from '../components/ui/ReadingProgressBar';
import { ShareBar } from '../components/ui/ShareBar';
import { FavoriteButton } from '../components/ui/FavoriteButton';
import { AmazonBookWidget } from '../components/ui/AmazonBookWidget';
import { ReadNextGrid } from '../components/articles/ReadNextGrid';
import { Sidebar } from '../components/layout/Sidebar';
import { renderParagraphContent } from '../utils/articleUtils';

export function Article({ slug, articles = [], user }) {
  const article = articles.find((item) => item.slug === slug || item.id === slug || item.slugBase === slug);
  if (!article) return <NotFound />;
  const go = useNavigation();

  useEffect(() => {
    const pageUrl = window.location.href;
    const imgUrl = article.image || article.cover_image || '';
    const desc = article.excerpt || article.title;

    // Helper: upsert a meta tag
    const setMeta = (attrs, value) => {
      const selector = Object.entries(attrs).map(([k, v]) => `[${k}="${v}"]`).join('');
      let el = document.querySelector(`meta${selector}`);
      if (!el) {
        el = document.createElement('meta');
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    // Basic
    document.title = `${article.title} | Histórias Contadas de Outra Maneira`;
    setMeta({ name: 'description' }, desc);

    // Open Graph
    setMeta({ property: 'og:type' }, 'article');
    setMeta({ property: 'og:site_name' }, 'Histórias Contadas de Outra Maneira');
    setMeta({ property: 'og:locale' }, 'pt_BR');
    setMeta({ property: 'og:title' }, article.title);
    setMeta({ property: 'og:description' }, desc);
    setMeta({ property: 'og:url' }, pageUrl);
    setMeta({ property: 'og:image' }, imgUrl);
    setMeta({ property: 'og:image:width' }, '1200');
    setMeta({ property: 'og:image:height' }, '630');
    setMeta({ property: 'og:image:alt' }, article.title);

    // Twitter / X Cards
    setMeta({ name: 'twitter:card' }, 'summary_large_image');
    setMeta({ name: 'twitter:title' }, article.title);
    setMeta({ name: 'twitter:description' }, desc);
    setMeta({ name: 'twitter:image' }, imgUrl);
    setMeta({ name: 'twitter:image:alt' }, article.title);

    // JSON-LD Article Schema
    let jsonLd = document.getElementById('article-jsonld');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.type = 'application/ld+json';
      jsonLd.id = 'article-jsonld';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: desc,
      image: imgUrl,
      author: { '@type': 'Person', name: article.author || 'Equipe Editorial' },
      publisher: {
        '@type': 'Organization',
        name: 'Histórias Contadas de Outra Maneira',
        logo: { '@type': 'ImageObject', url: `${window.location.origin}/favicon.ico` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl }
    });

    window.scrollTo({ top: 0, behavior: 'instant' });

    return () => {
      document.getElementById('article-jsonld')?.remove();
    };
  }, [article]);

  const paragraphs = (Array.isArray(article.content) ? article.content : String(article.content).split('\n')).filter(Boolean);
  const midPoint = Math.max(1, Math.floor(paragraphs.length / 2));
  const firstHalf = paragraphs.slice(0, midPoint);
  const secondHalf = paragraphs.slice(midPoint);

  const isFact = article.editorialType === 'fato' || article.categorySlug === 'curiosidades-geradas';
  const isGeo = article.editorialType === 'geopolitica' || article.categorySlug === 'geopolitica-ficticia';
  const natureBadge = isFact ? '📜 Fato Histórico Documentado' : (isGeo ? '🌐 Simulação Geopolítica' : '⏳ Hipótese Especulativa');
  const natureBadgeClass = isFact ? 'nature-fact' : (isGeo ? 'nature-geo' : 'nature-spec');

  return (
    <main className="container article-layout">
      <ReadingProgressBar />
      <ShareBar title={article.title} url={window.location.href} />
      <article className="article-content-panel">
        <div className="article-header">
          <div className="article-category-row">
            <span className="eyebrow">{article.category}</span>
            <span className={`editorial-nature-tag ${natureBadgeClass}`}>{natureBadge}</span>
          </div>
          <h2>{article.title}</h2>
          <div className="meta-row">
            <span>Por {article.author}</span>
            <span>{article.readingTime}</span>
            <span>{article.date}</span>
          </div>
          <FavoriteButton slug={article.slug} />
        </div>
        <div className="article-hero-image" style={{ backgroundImage: `url('${article.image}')` }} />
        <div className="article-body">
          {firstHalf.map((paragraph, idx) => (
            <p key={idx}>{renderParagraphContent(paragraph)}</p>
          ))}

          {/* BLOCO AMAZON NO MEIO DO ARTIGO */}
          {article.amazonBooks && article.amazonBooks.length > 0 && (
            <AmazonBookWidget books={article.amazonBooks.slice(0, 2)} />
          )}

          {article.secondaryImage && (
            <figure className="article-body-figure">
              <img src={article.secondaryImage} alt={`Ilustração para ${article.title}`} className="article-body-image" />
              <figcaption className="article-body-caption">Ilustração enviada pelo autor</figcaption>
            </figure>
          )}
          {secondHalf.map((paragraph, idx) => (
            <p key={idx + midPoint}>{renderParagraphContent(paragraph)}</p>
          ))}

          {/* QUADRO DE FONTES & REFERÊNCIAS HISTÓRICAS */}
          {article.sources && article.sources.length > 0 && (
            <div className="article-sources-box">
              <div className="sources-title-row">
                <span className="sources-icon">📚</span>
                <h4>Fontes & Referências Históricas</h4>
              </div>
              <p className="sources-lead">Documentação, cronistas antigos e obras historiográficas de base:</p>
              <ul className="sources-list">
                {article.sources.map((src, i) => <li key={i}>{src}</li>)}
              </ul>
            </div>
          )}

          {/* AVISO EDITORIAL / TRANSPARÊNCIA */}
          <div className="editorial-disclaimer-box">
            <div className="disclaimer-header">
              <span className="disclaimer-icon">✦</span>
              <strong>Transparência Editorial</strong>
            </div>
            <p>
              {article.disclaimer || (isFact
                ? 'Este artigo aborda eventos, artefatos ou relatos preservados em museus e registros arqueológicos comprovados.'
                : 'Esta obra é um exercício de história alternativa fundamentado em premissas e eventos reais, explorando caminhos não trilhados pela narrativa convencional.')}
            </p>
          </div>

          {/* BLOCO AMAZON NO FINAL DO ARTIGO */}
          {article.amazonBooks && article.amazonBooks.length > 0 && (
            <AmazonBookWidget books={article.amazonBooks} />
          )}

          {/* READ NEXT — RETENÇÃO E LOOP DE LEITURA */}
          <ReadNextGrid currentSlug={article.slug} currentCategory={article.categorySlug} articles={articles} />
        </div>
      </article>
      <Sidebar user={user} />
    </main>
  );
}
