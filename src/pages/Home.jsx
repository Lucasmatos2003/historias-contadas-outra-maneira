import React from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { ArticleCard } from '../components/articles/ArticleCard';
import { FavoriteButton } from '../components/ui/FavoriteButton';
import { Sidebar } from '../components/layout/Sidebar';

export function Home({ articles = [], user }) {
  const go = useNavigation();

  if (!articles.length) {
    return (
      <main className="container home-layout">
        <div className="content-column">
          <section className="empty-home">
            <p className="eyebrow">Revista em preparação</p>
            <h2>Em breve, novas histórias.</h2>
            <p>Estamos preparando os primeiros artigos da revista. Volte em breve para descobrir histórias, hipóteses e curiosidades contadas de outra maneira.</p>
            <a className="button button-primary" href="/sobre" onClick={(e) => { e.preventDefault(); go('/sobre'); }}>Conheça a revista</a>
          </section>
        </div>
        <Sidebar user={user} />
      </main>
    );
  }

  const featured = articles.find((article) => article.featured) || articles[0];
  const otherArticles = articles.filter((article) => article.slug !== featured.slug);
  const coverUrl = featured.image || featured.cover_image || 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80';

  return (
    <main className="container home-layout">
      <div className="content-column">
        {/* BANNER MANIFESTO DE PROPOSTA DE VALOR & CONVERSÃO */}
        <section className="magazine-manifesto-card">
          <div className="manifesto-badge">
            <span className="sparkle-symbol">✦</span> Revista de História Alternativa & Curiosidades
          </div>
          <h1 className="manifesto-title">
            E se os rumos da história tivessem sido diferentes?
          </h1>
          <p className="manifesto-desc">
            Exploramos hipóteses contrafactuais bem fundamentadas, enigmas arqueológicos esquecidos e geopolítica ficcional para quem gosta de imaginar outros caminhos para a humanidade.
          </p>
          <div className="manifesto-actions">
            <a
              href="#feed-artigos"
              className="button button-primary manifesto-btn-read"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('feed-artigos')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>📖 Ler artigos</span>
            </a>
            <a
              href={user ? '/submeter' : '/cadastro'}
              className="button button-secondary manifesto-btn-write"
              onClick={(e) => {
                e.preventDefault();
                go(user ? '/submeter' : '/cadastro');
              }}
            >
              <span>✍️ Enviar meu artigo</span>
            </a>
          </div>
        </section>

        {/* HERO EDITORIAL REDESIGN */}
        <section className="hero-article-modern">
          <div className="hero-copy-modern">
            <div className="hero-kicker-row">
              <span className="hero-live-badge">
                <span className="hero-live-dot" /> Destaque Editorial
              </span>
              <span className="hero-tag-accent">{featured.category}</span>
            </div>

            <h2 className="hero-title-modern">
              <a href={`/artigo/${featured.slug}`} onClick={(e) => { e.preventDefault(); go(`/artigo/${featured.slug}`); }}>
                {featured.title}
              </a>
            </h2>

            <p className="hero-lead-text">{featured.excerpt}</p>

            <div className="hero-byline-bar">
              <div className="hero-author-pill">
                <div className="hero-author-avatar">
                  {featured.author?.[0] || 'R'}
                </div>
                <div className="hero-author-details">
                  <span className="hero-author-name">{featured.author || 'Equipe Editorial'}</span>
                  <span className="hero-author-time">{featured.date} · {featured.readingTime} de leitura</span>
                </div>
              </div>
            </div>

            <div className="hero-action-buttons">
              <a
                className="button button-primary hero-main-cta"
                href={`/artigo/${featured.slug}`}
                onClick={(e) => { e.preventDefault(); go(`/artigo/${featured.slug}`); }}
              >
                <span>Ler história completa</span>
                <span className="cta-arrow-icon" aria-hidden="true">→</span>
              </a>
              <FavoriteButton slug={featured.slug} />
            </div>
          </div>

          <div className="hero-visual-modern">
            <a
              className="hero-magazine-cover"
              href={`/artigo/${featured.slug}`}
              onClick={(e) => { e.preventDefault(); go(`/artigo/${featured.slug}`); }}
              style={{ backgroundImage: `url('${coverUrl}')` }}
              aria-label={`Ler artigo em destaque: ${featured.title}`}
            >
              <div className="cover-scrim" />
              <div className="cover-border-inlay" />
              <div className="cover-content">
                <div className="cover-top-badge">
                  <span className="cover-brand-stamp">Histórias Contadas</span>
                  <span className="cover-pill-category">{featured.category}</span>
                </div>
                <div className="cover-bottom-details">
                  <span className="cover-badge-kicker">✦ Edição Principal</span>
                  <p className="cover-title-display">{featured.title}</p>
                  <span className="cover-read-hint">Clique para abrir a edição completa →</span>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* FEED DE HISTÓRIAS */}
        <section className="feed-section" id="feed-artigos">
          <div className="section-head">
            <div>
              <p className="eyebrow">Edição corrente</p>
              <h3>Mais histórias e hipóteses</h3>
            </div>
            <a href="/categoria/historia-alternativa" onClick={(e) => { e.preventDefault(); go('/categoria/historia-alternativa'); }}>
              Ver acervo completo →
            </a>
          </div>
          <div className="stories-grid">
            {otherArticles.map((article, index) => (
              <ArticleCard key={article.slug} article={article} index={index} />
            ))}
          </div>
        </section>

        {/* CURIOSIDADES HISTÓRICAS: NOVO DESIGN MODERNO EM CARDS */}
        <section className="curiosity-feature-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Fatos que desafiam a linha do tempo</p>
              <h3>Curiosidades & Fragmentos do Passado</h3>
            </div>
            <a href="/categoria/curiosidades-geradas" onClick={(e) => { e.preventDefault(); go('/categoria/curiosidades-geradas'); }}>
              Explorar curiosidades →
            </a>
          </div>

          <div className="curiosity-cards-grid">
            <div
              className="curiosity-feature-card clickable-card"
              role="button"
              tabIndex={0}
              onClick={() => go('/artigo/objetos-estranhos-mundo-antigo')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('/artigo/objetos-estranhos-mundo-antigo'); } }}
            >
              <div className="curiosity-card-top">
                <span className="curiosity-icon-badge">⚙️</span>
                <span className="curiosity-number">01</span>
              </div>
              <span className="curiosity-category-tag">Arqueologia Mecânica</span>
              <h4>O computador de bronze grego de 2.100 anos</h4>
              <p>
                Resgatado dos destroços no mar Egeu, o Mecanismo de Anticítera previa eclipses com precisão de minutos e simulava órbitas planetárias com 30 engrenagens de bronze — séculos antes da relojoaria moderna.
              </p>
              <span className="curiosity-read-more">Ler curiosidade completa →</span>
            </div>

            <div
              className="curiosity-feature-card clickable-card"
              role="button"
              tabIndex={0}
              onClick={() => go('/artigo/reino-diario-secreto')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('/artigo/reino-diario-secreto'); } }}
            >
              <div className="curiosity-card-top">
                <span className="curiosity-icon-badge">📜</span>
                <span className="curiosity-number">02</span>
              </div>
              <span className="curiosity-category-tag">Arquivos Secretos</span>
              <h4>O manuscrito proibido que desmanchou um império</h4>
              <p>
                Cronista oficial de Justiniano, Procópio escreveu de dia louvores à corte bizantina e à noite, em segredo, a devastadora "História Secreta" — que permaneceu oculta nos arquivos vaticanos por mil anos.
              </p>
              <span className="curiosity-read-more">Ler curiosidade completa →</span>
            </div>

            <div
              className="curiosity-feature-card clickable-card"
              role="button"
              tabIndex={0}
              onClick={() => go('/artigo/cidades-abandonadas')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('/artigo/cidades-abandonadas'); } }}
            >
              <div className="curiosity-card-top">
                <span className="curiosity-icon-badge">🏛️</span>
                <span className="curiosity-number">03</span>
              </div>
              <span className="curiosity-category-tag">Metrópoles Ocultas</span>
              <h4>A colmeia subterrânea para 20.000 almas na Capadócia</h4>
              <p>
                Escavada a mais de 85 metros sob o solo da Turquia em 18 níveis interligados, Derinkuyu continha dutos de ar puro, escolas, prensas e portas monolíticas de meia tonelada que só trancavam por dentro.
              </p>
              <span className="curiosity-read-more">Ler curiosidade completa →</span>
            </div>
          </div>
        </section>

        {/* FINAL DA HOME: CHAMADA PARA ESCRITORES & CANAL YOUTUBE ALTERNATIVA HISTÓRIA */}
        <section className="writer-spotlight-banner">
          <div className="writer-banner-content">
            <div className="writer-banner-eyebrow-row">
              <span className="writer-badge-accent">✦ Chamada para Escritores</span>
              <a
                href="https://www.youtube.com/@ALTERNATIVAHISTORIA"
                target="_blank"
                rel="noopener noreferrer"
                className="youtube-badge-tag"
                title="Visitar canal Alternativa História no YouTube"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>@ALTERNATIVAHISTORIA</span>
              </a>
            </div>

            <h3 className="writer-banner-title">
              Escreva para o blog e veja sua história virar <span className="title-highlight">roteiro de vídeo</span>!
            </h3>

            <p className="writer-banner-desc">
              Gosta de imaginar caminhos diferentes para os grandes momentos da humanidade? Junte-se à nossa comunidade de autores. Ao submeter seu artigo contrafactual ou curiosidade inédita, sua história pode ser selecionada para se transformar no roteiro narrado de um vídeo oficial no canal <strong>Alternativa História</strong> no YouTube, com menção honrosa e todos os créditos à sua autoria!
            </p>

            <div className="writer-banner-actions">
              <a
                href={user ? "/submeter" : "/cadastro"}
                onClick={(e) => { e.preventDefault(); go(user ? "/submeter" : "/cadastro"); }}
                className="button button-primary writer-cta-btn"
              >
                <span>{user ? "Submeter meu artigo agora" : "Inscreva-se como Escritor"}</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </a>

              <a
                href="https://www.youtube.com/@ALTERNATIVAHISTORIA"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-youtube"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Conhecer o canal no YouTube</span>
              </a>
            </div>
          </div>

          <div className="writer-banner-card">
            <div className="writer-card-header">
              <div className="yt-card-icon">🎬</div>
              <div>
                <strong>Do Artigo ao Vídeo</strong>
                <span>Como funciona a curadoria</span>
              </div>
            </div>
            <ul className="writer-card-steps">
              <li>
                <span className="step-num">1</span>
                <div>
                  <strong>Cadastre-se como escritor</strong>
                  <p>Crie sua conta para publicar e acompanhar seus artigos.</p>
                </div>
              </li>
              <li>
                <span className="step-num">2</span>
                <div>
                  <strong>Envie sua hipótese ou pesquisa</strong>
                  <p>Escreva ucronias bem fundamentadas ou curiosidades que surpreendam.</p>
                </div>
              </li>
              <li>
                <span className="step-num">3</span>
                <div>
                  <strong>Estreie no YouTube</strong>
                  <p>Artigos selecionados viram roteiros narrados em vídeo com seus créditos!</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <Sidebar user={user} />
    </main>
  );
}
