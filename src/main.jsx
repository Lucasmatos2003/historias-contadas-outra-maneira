import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { articles, categoryInfo } from './data';
import { getAccessToken, isConfigured, mapUser, supabase } from './supabase';
import '../assets/css/style.css';
import './responsive.css';

const getPath = () => window.location.pathname.replace(/\/+$/, '') || '/';
const navigate = (url) => window.history.pushState({}, '', url);

function LoadingState({ label = 'Carregando...' }) {
  return <div className="loading-state" role="status" aria-live="polite"><span className="loading-spinner" aria-hidden="true" />{label}</div>;
}

function Avatar({ name, photoURL, className = 'profile-avatar' }) {
  return <div className={className}>{photoURL ? <img src={photoURL} alt="" /> : name.slice(0, 1).toUpperCase()}</div>;
}

function useAuth() {
  const [state, setState] = useState({ user: null, profile: null, loading: Boolean(supabase) });
  const refreshUser = async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const mapped = mapUser(data.user);
    setState((current) => ({ ...current, user: mapped }));
    return mapped;
  };
  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    const update = async (userOrSession) => {
      const user = userOrSession?.user || userOrSession;
      if (!user) return setState({ user: null, profile: null, loading: false });
      const mappedUser = mapUser(user);
      let profile = { role: 'writer', displayName: mappedUser.displayName, photoURL: mappedUser.photoURL };
      try {
        const token = await getAccessToken();
        const response = await fetch('/api/profiles/upsert', { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Não foi possível carregar o perfil.');
        profile = { ...profile, ...result };
      } catch (error) {
        console.error('Não foi possível carregar o perfil salvo.', error);
      }
      if (active) setState({ user: mappedUser, profile, loading: false });
    };
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        update(data.user);
      } else {
        supabase.auth.getSession().then(({ data: sessionData }) => update(sessionData.session?.user)).catch(() => {
          if (active) setState({ user: null, profile: null, loading: false });
        });
      }
    }).catch(() => {
      supabase.auth.getSession().then(({ data: sessionData }) => update(sessionData.session?.user)).catch(() => {
        if (active) setState({ user: null, profile: null, loading: false });
      });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        const user = session?.user ?? null;
        update(user);
      }, 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);
  const updateProfileState = (data) => setState((current) => ({
    ...current,
    profile: { ...current.profile, ...data },
    user: current.user ? { ...current.user, displayName: data.displayName ?? current.user.displayName, photoURL: data.photoURL ?? current.user.photoURL } : current.user
  }));
  return { ...state, refreshUser, updateProfileState };
}

function AuthNotice() {
  return <div className="auth-notice" role="status">O login ainda não foi configurado no Supabase. Crie um projeto e adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.</div>;
}

function useNavigation() {
  const [, refresh] = useState(0);
  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  return (url) => {
    if (window.__unsavedArticle && !window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) return;
    navigate(url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
}

function Layout({ children, articles, user, profile, isAdmin, onLogout }) {
  const go = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [light, setLight] = useState(() => localStorage.getItem('theme') === 'light');
  const [query, setQuery] = useState('');
  const results = query.trim() ? articles.filter((article) => `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [];

  useEffect(() => {
    document.body.classList.toggle('light-theme', light);
    localStorage.setItem('theme', light ? 'light' : 'dark');
  }, [light]);

  const link = (url) => (event) => {
    event.preventDefault();
    setMenuOpen(false);
    go(url);
  };
  const logout = () => {
    if (window.__unsavedArticle && !window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) return;
    onLogout();
  };

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand-row brand-link" href="/" onClick={link('/')}>
          <span className="brand-mark">H</span>
          <span className="brand-text-block">
            <span className="eyebrow">Revista digital</span>
            <h1>Histórias Contadas de Outra Maneira</h1>
          </span>
        </a>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegação principal">
          <a href="/" onClick={link('/')}>Home</a>
          <a href="/categoria/historia-alternativa" onClick={link('/categoria/historia-alternativa')}>História Alternativa</a>
          <a href="/categoria/curiosidades-geradas" onClick={link('/categoria/curiosidades-geradas')}>Curiosidades Históricas</a>
          <a href="/categoria/geopolitica-ficticia" onClick={link('/categoria/geopolitica-ficticia')}>Geopolítica Fictícia</a>
          <a href="/sobre" onClick={link('/sobre')}>Sobre</a>
          <a href="/contato" onClick={link('/contato')}>Contato</a>
          {user && <a className="nav-badge-submit" href="/submeter" onClick={link('/submeter')}>+ Artigo</a>}
          {isAdmin && <a className="nav-badge-admin" href="/admin" onClick={link('/admin')}>⚙ Admin</a>}
        </nav>
        <div className="header-controls">
          <button className="icon-button" aria-label="Abrir busca" onClick={() => setSearchOpen(true)}>⌕</button>
          <button className="icon-button" aria-label="Alternar tema" onClick={() => setLight((value) => !value)}>◐</button>
          {user ? <button className="profile-chip" onClick={() => go('/perfil')} title="Abrir perfil"><Avatar name={profile?.displayName || user.displayName || user.email || 'P'} photoURL={profile?.photoURL || user.photoURL} className="profile-chip-avatar" /></button> : <a className="auth-link" href="/login" onClick={link('/login')}>Entrar</a>}
          {user && <button className="icon-button" aria-label="Sair" onClick={logout}>↪</button>}
          <button className="icon-button menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <span className="footer-mark">H</span>
            <div><p className="eyebrow">Revista digital</p><strong>Histórias Contadas<br />de Outra Maneira</strong></div>
          </div>
          <p className="footer-description">Ideias, hipóteses e histórias que atravessam os caminhos conhecidos.</p>
          <div className="footer-column">
            <span className="footer-title">Categorias</span>
            <a href="/" onClick={link('/')}>Início</a>
            <a href="/categoria/historia-alternativa" onClick={link('/categoria/historia-alternativa')}>História Alternativa</a>
            <a href="/categoria/curiosidades-geradas" onClick={link('/categoria/curiosidades-geradas')}>Curiosidades Históricas</a>
            <a href="/categoria/geopolitica-ficticia" onClick={link('/categoria/geopolitica-ficticia')}>Geopolítica Fictícia</a>
          </div>
          <div className="footer-column">
            <span className="footer-title">Institucional</span>
            <a href="/sobre" onClick={link('/sobre')}>Sobre o autor</a>
            <a href="/contato" onClick={link('/contato')}>Contato</a>
            <a href="/politica-de-privacidade" onClick={link('/politica-de-privacidade')}>Política de Privacidade</a>
            <a href={user ? '/submeter' : '/cadastro'} onClick={link(user ? '/submeter' : '/cadastro')}>Escreva conosco</a>
            <a href="https://www.youtube.com/@ALTERNATIVAHISTORIA" target="_blank" rel="noopener noreferrer">Canal YouTube ↗</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Histórias Contadas de Outra Maneira</span>
          <span>Feito para quem gosta de imaginar outros caminhos · LGPD & Privacidade</span>
        </div>
      </footer>
      {searchOpen && <div className="search-overlay is-open" onClick={(event) => event.target === event.currentTarget && setSearchOpen(false)}>
        <div className="search-dialog" role="dialog" aria-modal="true">
          <button className="search-close" aria-label="Fechar busca" onClick={() => setSearchOpen(false)}>×</button>
          <h2>Pesquisar histórias</h2>
          <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Digite um título, tema ou categoria" />
          <div className="search-results">{results.map((article) => <a key={article.slug} href={`/artigo/${article.slug}`} onClick={link(`/artigo/${article.slug}`)}><strong>{article.title}</strong><span>{article.category} · {article.readingTime}</span></a>)}{query && !results.length && <p className="empty-state">Nenhuma história encontrada.</p>}</div>
        </div>
      </div>}
    </div>
  );
}

function FavoriteButton({ slug }) {
  const [favorite, setFavorite] = useState(() => JSON.parse(localStorage.getItem('favorites') || '[]').includes(slug));
  const toggle = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const next = favorite ? favorites.filter((item) => item !== slug) : [...favorites, slug];
    localStorage.setItem('favorites', JSON.stringify(next));
    setFavorite(!favorite);
  };
  return <button className={`save-button ${favorite ? 'is-favorite' : ''}`} aria-pressed={favorite} onClick={toggle}>{favorite ? '★ Salvo' : '☆ Salvar'}</button>;
}

function ArticleCard({ article, index = 0 }) {
  const go = useNavigation();
  const cover = article.image || article.cover_image || 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80';
  return (
    <article className="story-card">
      <div className="story-card-thumb" onClick={() => go(`/artigo/${article.slug}`)}>
        <img src={cover} alt={article.title} loading="lazy" />
        <span className="tag">{article.category}</span>
      </div>
      <div className="story-card-body">
        <h4><a href={`/artigo/${article.slug}`} onClick={(event) => { event.preventDefault(); go(`/artigo/${article.slug}`); }}>{article.title}</a></h4>
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

function Home({ articles, user }) {
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

function Sidebar({ user }) {
  const go = useNavigation();
  return (
    <aside className="sidebar-column">
      {/* Mini Perfil Editorial do Autor */}
      <div className="sidebar-author-widget">
        <div className="sidebar-author-header">
          <img
            src="/images/lucas-matos.jpg"
            alt="Lucas Matos"
            className="sidebar-author-thumb"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div>
            <span className="eyebrow">Fundador & Autor</span>
            <strong>Lucas Matos</strong>
          </div>
        </div>
        <p className="sidebar-author-text">
          Criador da revista Histórias Contadas de Outra Maneira. Explorando o que acontece quando perguntamos "e se?".
        </p>
        <a
          href="/sobre"
          onClick={(e) => { e.preventDefault(); go('/sobre'); }}
          className="sidebar-author-btn"
        >
          Conheça o autor & manifesto →
        </a>
      </div>

      {/* Navegação de Seções */}
      <div className="sidebar-panel">
        <p className="eyebrow">Seções Editoriais</p>
        <ul className="sidebar-nav-list">
          <li>
            <a href="/categoria/historia-alternativa" onClick={(e) => { e.preventDefault(); go('/categoria/historia-alternativa'); }}>
              <span className="sidebar-cat-left">
                <span className="sidebar-cat-icon">🏛️</span>
                <span>História Alternativa</span>
              </span>
              <span className="sidebar-cat-arrow">›</span>
            </a>
          </li>
          <li>
            <a href="/categoria/curiosidades-geradas" onClick={(e) => { e.preventDefault(); go('/categoria/curiosidades-geradas'); }}>
              <span className="sidebar-cat-left">
                <span className="sidebar-cat-icon">💡</span>
                <span>Curiosidades Geradas</span>
              </span>
              <span className="sidebar-cat-arrow">›</span>
            </a>
          </li>
          <li>
            <a href="/sobre" onClick={(e) => { e.preventDefault(); go('/sobre'); }}>
              <span className="sidebar-cat-left">
                <span className="sidebar-cat-icon">📖</span>
                <span>Sobre a Revista</span>
              </span>
              <span className="sidebar-cat-arrow">›</span>
            </a>
          </li>
          <li>
            <a href="/contato" onClick={(e) => { e.preventDefault(); go('/contato'); }}>
              <span className="sidebar-cat-left">
                <span className="sidebar-cat-icon">✉️</span>
                <span>Fale Conosco</span>
              </span>
              <span className="sidebar-cat-arrow">›</span>
            </a>
          </li>
        </ul>
      </div>

      {/* Tópicos em Alta */}
      <div className="sidebar-panel">
        <p className="eyebrow">Tópicos em Alta</p>
        <div className="sidebar-topic-cloud">
          <span className="topic-pill">#RomaAntiga</span>
          <span className="topic-pill">#Cartago</span>
          <span className="topic-pill">#GrandesNavegações</span>
          <span className="topic-pill">#BrasilImperial</span>
          <span className="topic-pill">#Ucronias</span>
          <span className="topic-pill">#Anticítera</span>
        </div>
      </div>

      {/* Canal no YouTube & Chamada para Escritores */}
      <div className="sidebar-youtube-card">
        <div className="yt-card-top">
          <span className="yt-live-pill">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Canal no YouTube
          </span>
          <span className="yt-handle">@ALTERNATIVAHISTORIA</span>
        </div>
        <div className="yt-card-content">
          <strong>Alternativa História</strong>
          <p>O canal oficial da revista! As melhores histórias enviadas pelos escritores são transformadas em roteiros narrados em vídeo.</p>
          <div className="yt-card-actions">
            <a
              href="https://www.youtube.com/@ALTERNATIVAHISTORIA"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-youtube-sm"
            >
              Visitar canal ↗
            </a>
            <a
              href={user ? "/submeter" : "/cadastro"}
              onClick={(e) => { e.preventDefault(); go(user ? "/submeter" : "/cadastro"); }}
              className="sidebar-author-btn"
            >
              {user ? "Submeter artigo →" : "Inscreva-se como escritor →"}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Category({ slug, articles }) {
  const info = categoryInfo[slug];
  if (!info) return <NotFound />;
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const filtered = useMemo(() => {
    const value = articles.filter((article) => article.categorySlug === slug && `${article.title} ${article.excerpt}`.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'title') return [...value].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'reading') return [...value].sort((a, b) => parseInt(a.readingTime) - parseInt(b.readingTime));
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
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar nesta categoria..." aria-label="Pesquisar nesta categoria" />
            {query && <button className="clear-search-btn" onClick={() => setQuery('')} aria-label="Limpar busca">×</button>}
          </div>
          <div className="category-sort-box">
            <label htmlFor="category-sort-select">Ordenar por:</label>
            <select id="category-sort-select" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar artigos">
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
          {visible.map((article, index) => <ArticleCard key={article.slug || article.id} article={article} index={index} />)}
        </section>
      ) : (
        <div className="empty-category-state">
          <div className="empty-category-icon">⌕</div>
          <h3>Nenhum artigo encontrado</h3>
          <p>{query ? `Nenhum texto corresponde à busca "${query}" nesta categoria.` : 'Ainda não há artigos cadastrados nesta categoria.'}</p>
          {query && <button className="button button-secondary" onClick={() => setQuery('')}>Limpar pesquisa</button>}
        </div>
      )}

      {filtered.length > pageSize && (
        <nav className="pagination" aria-label="Paginação">
          {Array.from({ length: totalPages }, (_, index) => (
            <button key={index + 1} className={page === index + 1 ? 'active' : ''} onClick={() => setPage(index + 1)}>
              {index + 1}
            </button>
          ))}
        </nav>
      )}
    </main>
  );
}

function formatSupabaseArticle(row) {
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
    content,
    featured: false
  };
}

function Article({ slug, articles, user }) {
  const article = articles.find((item) => item.slug === slug || item.id === slug || item.slugBase === slug);
  if (!article) return <NotFound />;
  const go = useNavigation();

  useEffect(() => {
    document.title = `${article.title} | Histórias Contadas de Outra Maneira`;
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', article.excerpt || article.title);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', article.title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', article.excerpt || article.title);

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', article.image || article.cover_image || '');

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [article]);

  const paragraphs = (Array.isArray(article.content) ? article.content : String(article.content).split('\n')).filter(Boolean);
  const midPoint = Math.max(1, Math.floor(paragraphs.length / 2));
  const firstHalf = paragraphs.slice(0, midPoint);
  const secondHalf = paragraphs.slice(midPoint);

  const isFact = article.editorialType === 'fato' || article.categorySlug === 'curiosidades-geradas';
  const isGeo = article.editorialType === 'geopolitica' || article.categorySlug === 'geopolitica-ficticia';
  const natureBadge = isFact ? '📜 Fato Histórico Documentado' : (isGeo ? '🌐 Simulação Geopolítica' : '⏳ Hipótese Especulativa');
  const natureBadgeClass = isFact ? 'nature-fact' : (isGeo ? 'nature-geo' : 'nature-spec');

  const related = articles
    .filter((item) => item.slug !== article.slug && (item.categorySlug === article.categorySlug || item.category === article.category))
    .slice(0, 2);
  const fallbackRelated = related.length ? related : articles.filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <main className="container article-layout">
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
          {firstHalf.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}
          {article.secondaryImage && (
            <figure className="article-body-figure">
              <img src={article.secondaryImage} alt={`Ilustração para ${article.title}`} className="article-body-image" />
              <figcaption className="article-body-caption">Ilustração enviada pelo autor</figcaption>
            </figure>
          )}
          {secondHalf.map((paragraph, idx) => <p key={idx + midPoint}>{paragraph}</p>)}

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

          {/* HISTÓRIAS RELACIONADAS / RETENÇÃO */}
          <div className="related-articles-section">
            <div className="related-head">
              <p className="eyebrow">Continue explorando</p>
              <h3>Histórias Relacionadas</h3>
            </div>
            <div className="related-cards-grid">
              {fallbackRelated.map((rel) => (
                <div
                  key={rel.slug}
                  className="related-card"
                  onClick={() => {
                    go(`/artigo/${rel.slug}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img src={rel.image || rel.cover_image} alt={rel.title} className="related-card-thumb" />
                  <div className="related-card-content">
                    <span className="related-cat">{rel.category}</span>
                    <h5>{rel.title}</h5>
                    <small>{rel.readingTime} de leitura</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
      <Sidebar user={user} />
    </main>
  );
}

function ReviewAdmin({ user, onArticleApproved }) {
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'messages'
  const [items, setItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('pendente_revisao');
  const [messageFilter, setMessageFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [reviewing, setReviewing] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getAccessToken();
      const [articlesRes, messagesRes] = await Promise.all([
        fetch('/api/admin/articles', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (articlesRes.status === 403 || messagesRes.status === 403) {
        setAccessDenied(true);
        return;
      }

      const articlesData = await articlesRes.json();
      const messagesData = await messagesRes.json();

      if (!articlesRes.ok) throw new Error(articlesData.error || 'Não foi possível carregar os artigos.');
      setItems(articlesData.articles || []);
      setMessages(messagesData.messages || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  if (accessDenied) {
    return <main className="container single-page"><section className="contact-card access-denied"><p className="eyebrow">Acesso restrito</p><h2>Você não é administrador</h2><p>Esta área está disponível somente para a conta administrativa configurada no servidor.</p></section></main>;
  }

  const updateStatus = async (article, status) => {
    if (status === 'rejeitado' && reviewNote.trim().length < 10) {
      setError('Informe uma justificativa com pelo menos 10 caracteres.');
      return;
    }
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/admin/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: article.id, status, reviewNote })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível atualizar o artigo.');
      setItems((current) => current.map((item) => item.id === article.id ? { ...item, status: result.status, review_note: reviewNote } : item));
      setReviewing(null);
      setReviewNote('');
      setError('');
      if (status === 'aprovado') {
        onArticleApproved?.();
      }
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  const updateMessageStatus = async (msgId, newStatus) => {
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: msgId, status: newStatus })
      });
      if (!res.ok) throw new Error('Falha ao atualizar mensagem');
      setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, status: newStatus } : m));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteMessage = async (msgId) => {
    if (!window.confirm('Deseja realmente excluir esta mensagem permanentemente?')) return;
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/messages?id=${encodeURIComponent(msgId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha ao excluir mensagem');
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      setError(err.message);
    }
  };

  const visibleArticles = filter === 'todos' ? items : items.filter((article) => article.status === filter);
  const visibleMessages = messageFilter === 'todos' ? messages : messages.filter((msg) => msg.status === messageFilter);
  const pendingArticlesCount = items.filter((i) => i.status === 'pendente_revisao').length;
  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <main className="container single-page admin-review-page">
      <section className="page-intro">
        <p className="eyebrow">Painel de Controle</p>
        <h2>Administração Editorial</h2>
        <p>Gerencie a fila de artigos submetidos e as mensagens enviadas pelos leitores através do formulário de contato.</p>

        {/* Abas de Navegação */}
        <div className="admin-nav-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            <span>📑 Fila de Artigos</span>
            {pendingArticlesCount > 0 && <span className="tab-badge-pill">{pendingArticlesCount}</span>}
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <span>✉️ Mensagens de Contato</span>
            {unreadMessagesCount > 0 && <span className="tab-badge-pill unread">{unreadMessagesCount}</span>}
          </button>
        </div>
      </section>

      {error && <p className="form-message" role="alert">{error}</p>}

      {/* ABA 1: ARTIGOS */}
      {activeTab === 'articles' && (
        <>
          <div className="admin-toolbar">
            <label>
              Filtrar Status
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="pendente_revisao">Aguardando revisão ({pendingArticlesCount})</option>
                <option value="aprovado">Aprovados</option>
                <option value="rejeitado">Rejeitados</option>
                <option value="todos">Todos os artigos ({items.length})</option>
              </select>
            </label>
            <button className="button button-secondary" onClick={load} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar fila'}
            </button>
          </div>

          {loading && <section className="admin-review-list"><LoadingState label="Carregando artigos..." /></section>}
          {!loading && !visibleArticles.length && (
            <section className="admin-review-list"><p className="empty-state">Nenhum artigo nesta categoria.</p></section>
          )}
          {!loading && visibleArticles.length > 0 && (
            <section className="admin-review-list">
              {visibleArticles.map((article) => (
                <article className="review-admin-item" key={article.id}>
                  <div className="review-admin-content">
                    <div className="review-admin-heading">
                      <span className="tag">{article.category}</span>
                      <span className={`review-status status-${article.status}`}>
                        {article.status === 'pendente_revisao' ? 'Em revisão' : article.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </div>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <div className="review-admin-meta">
                      <span>{article.author_name} · {article.author_email}</span>
                      <span>{article.created_at ? new Date(article.created_at).toLocaleDateString('pt-BR') : 'Data pendente'}</span>
                    </div>
                    <div className="review-item-images-preview">
                      {article.cover_image && <img className="review-cover-preview" src={article.cover_image} alt="Capa" title="Foto de Capa" />}
                      {article.secondary_image && <img className="review-cover-preview" src={article.secondary_image} alt="Segunda foto" title="Segunda Imagem" />}
                    </div>
                    <details>
                      <summary>Ver texto completo</summary>
                      <div className="review-text">
                        {Array.isArray(article.content)
                          ? article.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                          : <p>{article.content}</p>}
                      </div>
                    </details>
                    {article.review_note && (
                      <p className="review-note"><strong>Justificativa:</strong> {article.review_note}</p>
                    )}
                  </div>
                  {article.status === 'pendente_revisao' && (
                    <div className="review-admin-actions">
                      <button className="button button-primary" onClick={() => updateStatus(article, 'aprovado')}>
                        Aprovar
                      </button>
                      <button className="button button-secondary" onClick={() => { setReviewing(article.id); setReviewNote(''); }}>
                        Rejeitar
                      </button>
                    </div>
                  )}
                  {reviewing === article.id && (
                    <div className="review-dialog">
                      <label>
                        Justificativa da rejeição
                        <textarea
                          rows="4"
                          value={reviewNote}
                          onChange={(event) => setReviewNote(event.target.value)}
                          placeholder="Explique ao escritor o que precisa ser ajustado."
                        />
                      </label>
                      <div className="profile-actions">
                        <button className="button button-secondary" onClick={() => setReviewing(null)}>
                          Cancelar
                        </button>
                        <button className="button button-primary" onClick={() => updateStatus(article, 'rejeitado')}>
                          Confirmar rejeição
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </section>
          )}
        </>
      )}

      {/* ABA 2: MENSAGENS DE CONTATO */}
      {activeTab === 'messages' && (
        <>
          <div className="admin-toolbar">
            <label>
              Filtrar Mensagens
              <select value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)}>
                <option value="todos">Todas as mensagens ({messages.length})</option>
                <option value="unread">Não lidas ({unreadMessagesCount})</option>
                <option value="read">Lidas</option>
              </select>
            </label>
            <button className="button button-secondary" onClick={load} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar mensagens'}
            </button>
          </div>

          {loading && <section className="admin-review-list"><LoadingState label="Carregando mensagens..." /></section>}
          {!loading && !visibleMessages.length && (
            <section className="admin-review-list">
              <p className="empty-state">Nenhuma mensagem recebida até o momento.</p>
            </section>
          )}
          {!loading && visibleMessages.length > 0 && (
            <section className="admin-review-list">
              {visibleMessages.map((msg) => (
                <article className={`admin-message-card ${msg.status === 'unread' ? 'is-unread' : ''}`} key={msg.id}>
                  <div className="msg-card-header">
                    <div className="msg-author-info">
                      <strong>{msg.name}</strong>
                      <span className="msg-email-badge">✉️ {msg.email}</span>
                      <span className="msg-subject-tag">{msg.subject}</span>
                    </div>
                    <div className="msg-date">
                      {msg.created_at ? new Date(msg.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                    </div>
                  </div>

                  <div className="msg-body-content">
                    <p>{msg.message}</p>
                  </div>

                  <div className="msg-actions-row">
                    <a
                      href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject} - Histórias Contadas`)}`}
                      className="button button-primary msg-reply-btn"
                    >
                      Responder por E-mail ↗
                    </a>
                    {msg.status === 'unread' ? (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => updateMessageStatus(msg.id, 'read')}
                      >
                        Marcar como lida
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => updateMessageStatus(msg.id, 'unread')}
                      >
                        Marcar como não lida
                      </button>
                    )}
                    <button
                      type="button"
                      className="save-button danger"
                      onClick={() => deleteMessage(msg.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}

function processImageFile(file, maxWidth = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Nenhum arquivo selecionado.'));
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return reject(new Error('Formato inválido. Selecione uma imagem JPG, PNG ou WebP.'));
    }
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('A imagem deve ter no máximo 10 MB.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler a imagem.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erro ao processar dados da imagem.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            return resolve(webpData);
          }
        } catch {}
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function ImageUploadField({ label, hint, value, onChange, secondary = false, id = 'img-input' }) {
  const [mode, setMode] = useState(value && !value.startsWith('data:') ? 'url' : 'file');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    setError('');
    try {
      const optimized = await processImageFile(file);
      onChange(optimized);
    } catch (err) {
      setError(err.message || 'Erro ao processar imagem.');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onChange('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-header">
        <label className="image-upload-label" htmlFor={mode === 'url' ? `${id}-url` : id}>
          {label}
          {secondary && <span className="optional-badge">Opcional</span>}
        </label>
        <div className="image-upload-mode-toggle">
          <button
            type="button"
            className={`mode-btn ${mode === 'file' ? 'active' : ''}`}
            onClick={() => setMode('file')}
          >
            Upload do aparelho
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'url' ? 'active' : ''}`}
            onClick={() => setMode('url')}
          >
            Link URL
          </button>
        </div>
      </div>

      {mode === 'file' ? (
        <div className="file-upload-dropzone">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            id={id}
            className="file-input-hidden"
          />
          {!value ? (
            <label htmlFor={id} className="dropzone-trigger">
              <span className="dropzone-icon">📷</span>
              <strong>{processing ? 'Processando e otimizando imagem...' : 'Clique para selecionar foto do seu dispositivo'}</strong>
              <span className="dropzone-hint">Formatos JPG, PNG ou WebP (compressão automática de alta qualidade)</span>
            </label>
          ) : (
            <div className="image-preview-card">
              <img src={value} alt="Prévia da foto" className="image-preview-thumb" />
              <div className="image-preview-info">
                <span className="image-preview-tag">✓ Foto carregada com sucesso</span>
                <div className="image-preview-actions">
                  <label htmlFor={id} className="button button-secondary button-sm">
                    {processing ? 'Processando...' : 'Trocar foto'}
                  </label>
                  <button type="button" className="button button-danger-ghost button-sm" onClick={handleClear}>
                    Remover foto
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="url-input-block">
          <input
            id={`${id}-url`}
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="url-input-field"
          />
          {value && (
            <div className="image-preview-card">
              <img
                src={value}
                alt="Prévia via URL"
                className="image-preview-thumb"
                onError={() => setError('Não foi possível carregar a imagem deste endereço URL.')}
              />
              <div className="image-preview-info">
                <span className="image-preview-tag">Prévia via URL</span>
                <button type="button" className="button button-danger-ghost button-sm" onClick={handleClear}>
                  Limpar URL
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="image-upload-error">{error}</p>}
      {hint && !error && <span className="field-hint">{hint}</span>}
    </div>
  );
}

function SubmitArticle({ user }) {
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'historia-alternativa',
    coverImage: '',
    secondaryImage: ''
  });
  const [payment, setPayment] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const hasDraft = [form.title, form.excerpt, form.content].some((value) => value.trim());

  useEffect(() => {
    window.__unsavedArticle = hasDraft && !loading;
    const handleBeforeUnload = (event) => {
      if (!window.__unsavedArticle) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.__unsavedArticle = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasDraft, loading]);

  useEffect(() => {
    if (!payment?.articleId) return undefined;
    const timer = window.setInterval(async () => {
      const token = await getAccessToken();
      const response = await fetch(`/api/articles/status?id=${encodeURIComponent(payment.articleId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) return;
      const result = await response.json();
      if (result.status === 'pendente_revisao') {
        window.clearInterval(timer);
        setPayment(null);
        setMessage('Pagamento confirmado. Seu artigo foi enviado para a fila de revisão.');
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [payment?.articleId, user]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/articles/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, authorEmail: user.email })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível gerar a cobrança.');
      if (result.paymentRequired === false) {
        setMessage('Artigo enviado com sucesso para a fila de revisão.');
      } else {
        setPayment(result);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container single-page submit-page">
      <section className="contact-card">
        <p className="eyebrow">Publicação</p>
        <h2>Submeter artigo</h2>
        <p className="form-intro">Envie seu texto e imagens para avaliação editorial. A taxa de submissão é de R$ 5,00 via Pix.</p>
        
        <div className="submission-youtube-notice">
          <div className="yt-notice-icon">🎬</div>
          <div className="yt-notice-content">
            <strong>Sua história pode virar vídeo no YouTube!</strong>
            <p>
              Artigos aprovados pela nossa curadoria podem ser selecionados para serem gravados e narrados como roteiros no canal oficial{' '}
              <a href="https://www.youtube.com/@ALTERNATIVAHISTORIA" target="_blank" rel="noopener noreferrer">
                @ALTERNATIVAHISTORIA
              </a>, com menção e todos os créditos à sua autoria.
            </p>
          </div>
        </div>

        <form className="contact-form" onSubmit={submit}>
          <label>
            Título
            <input
              required
              minLength="10"
              maxLength="160"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Ex: E se Roma tivesse perdido a Segunda Guerra Púnica?"
            />
          </label>
          <label>
            E-mail do autor
            <input required type="email" value={user.email || ''} readOnly />
          </label>
          <label>
            Categoria
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              <option value="historia-alternativa">História Alternativa</option>
              <option value="curiosidades-geradas">Curiosidades Geradas</option>
            </select>
          </label>

          <ImageUploadField
            label="Foto 1: Imagem de Capa (Principal)"
            hint="Exibida em destaque no topo do artigo e nos cards de listagem."
            value={form.coverImage}
            onChange={(val) => setForm({ ...form, coverImage: val })}
            id="submit-cover"
          />

          <ImageUploadField
            label="Foto 2: Segunda Imagem do Artigo"
            hint="Opcional. Exibida no corpo do texto para ilustrar a narrativa."
            value={form.secondaryImage}
            onChange={(val) => setForm({ ...form, secondaryImage: val })}
            secondary={true}
            id="submit-sec"
          />

          <label>
            Resumo
            <textarea
              required
              minLength="20"
              maxLength="500"
              rows="3"
              value={form.excerpt}
              onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
              placeholder="Uma síntese cativante do que o leitor encontrará no artigo..."
            />
          </label>
          <label>
            Texto completo
            <textarea
              required
              minLength="100"
              rows="10"
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              placeholder="Desenvolva sua hipótese ou curiosidade histórica com argumentos sólidos e detalhes envolventes..."
            />
          </label>
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Gerando Pix...' : 'Submeter artigo — R$ 5,00'}
          </button>
        </form>
        {message && <p className="form-message" role="status">{message}</p>}
      </section>
      {payment && (
        <div className="payment-overlay" role="dialog" aria-modal="true" aria-labelledby="payment-title">
          <div className="payment-modal">
            <button className="search-close" aria-label="Fechar cobrança" onClick={() => setPayment(null)}>×</button>
            <p className="eyebrow">Pagamento seguro</p>
            <h2 id="payment-title">Pague R$ 5,00 via Pix</h2>
            <p>Após a confirmação, o artigo será encaminhado automaticamente para revisão.</p>
            {payment.qrCodeBase64 && <img className="pix-qr" src={`data:image/png;base64,${payment.qrCodeBase64}`} alt="QR Code Pix para pagamento" />}
            <label className="copy-field">Pix Copia e Cola<input readOnly value={payment.qrCode || ''} onFocus={(event) => event.target.select()} /></label>
            <button className="button button-primary" onClick={() => navigator.clipboard?.writeText(payment.qrCode || '')}>Copiar código Pix</button>
            <span className="payment-status">Aguardando confirmação automática...</span>
          </div>
        </div>
      )}
    </main>
  );
}

function AuthPage({ mode = 'login', registrationSuccess = false }) {
  const go = useNavigation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';
  const submit = async (event) => {
    event.preventDefault();
    if (!supabase) return setError('Configure primeiro o Supabase.');
    setLoading(true); setError('');
    try {
      let user;
      if (isLogin) {
        const result = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (result.error) throw result.error;
        user = result.data.user;
      } else {
        const result = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { display_name: form.name.trim() } }
        });
        if (result.error) throw result.error;
        user = result.data.user;
        if (result.data.session) {
          const token = await getAccessToken();
          const profileResponse = await fetch('/api/profiles/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ displayName: form.name.trim() })
          });
          if (!profileResponse.ok) throw new Error('Não foi possível salvar o perfil.');
        }
      }
      if (!user) throw new Error('Não foi possível criar a conta.');
      go(isLogin ? '/perfil' : '/perfil?cadastro=sucesso');
    } catch (submitError) {
      const messages = {
        user_already_exists: 'Este e-mail já possui uma conta. Use “Já tenho uma conta” para entrar.',
        invalid_credentials: 'E-mail ou senha incorretos.',
        email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
        email_address_invalid: 'Informe um e-mail válido.',
        weak_password: 'A senha precisa ter pelo menos 6 caracteres.',
        over_request_rate_limit: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
        auth_network_request_failed: 'Não foi possível conectar ao Supabase. Verifique sua internet.'
      };
      setError(messages[submitError.code] || submitError.message || 'Não foi possível concluir. Verifique seus dados e tente novamente.');
    } finally { setLoading(false); }
  };
  return <main className="container single-page"><section className="contact-card auth-card">
    <p className="eyebrow">Área do escritor</p><h2>{isLogin ? 'Entrar na sua conta' : 'Criar cadastro de escritor'}</h2>
    {!isLogin && (
      <p className="writer-auth-intro">
        Publique suas histórias contrafatuais e participe da seleção para os roteiros em vídeo do canal oficial <strong>Alternativa História</strong> no YouTube!
      </p>
    )}
    {registrationSuccess && <p className="success-message" role="status">Cadastro feito com sucesso! Confirme seu e-mail antes de entrar.</p>}
    {!isConfigured && <AuthNotice />}
    <form className="contact-form" onSubmit={submit}>
      {!isLogin && <label>Nome público<input required minLength="2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>}
      <label>E-mail<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      <label>Senha<input required minLength="6" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
      {error && <p className="form-message" role="alert">{error}</p>}
      <button className="button button-primary" disabled={loading || !isConfigured}>{loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}</button>
    </form>
    <button className="text-button" onClick={() => go(isLogin ? '/cadastro' : '/login')}>{isLogin ? 'Ainda não tenho cadastro' : 'Já tenho uma conta'}</button>
  </section></main>;
}

const reviewStatusDetails = {
  pendente_revisao: { label: 'Em revisão', description: 'Seu artigo está na fila para análise da equipe editorial.' },
  pendente_pagamento: { label: 'Aguardando pagamento', description: 'Finalize o pagamento da submissão para que o artigo entre na fila de revisão.' },
  pagamento_erro: { label: 'Erro no pagamento', description: 'Não foi possível gerar a cobrança. Envie o artigo novamente ou tente mais tarde.' },
  aprovado: { label: 'Aprovado', description: 'Seu artigo foi aprovado pela equipe editorial.' },
  rejeitado: { label: 'Rejeitado', description: 'Seu artigo precisa de ajustes antes de ser reenviado.' }
};

function formatReviewDate(value) {
  return value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Data pendente';
}

function WriterArticleReview({ article, onEdit }) {
  const details = reviewStatusDetails[article.status] || { label: article.status, description: 'Status atualizado pela equipe editorial.' };
  return (
    <article className="review-item">
      <div className="review-item-content">
        <div className="review-item-heading">
          <span className="tag">{article.category}</span>
          <span className={`review-status status-${article.status}`}>{details.label}</span>
        </div>
        <h4>{article.title}</h4>
        <p>{article.excerpt}</p>
        <div className="review-timeline">
          <span>Enviado em {formatReviewDate(article.created_at)}</span>
          {article.reviewed_at && <span>Revisado em {formatReviewDate(article.reviewed_at)}</span>}
          {article.updated_at && article.updated_at !== article.created_at && <span>Modificado em {formatReviewDate(article.updated_at)}</span>}
        </div>
        <p className="review-description">{details.description}</p>
        {article.status === 'rejeitado' && article.review_note && (
          <div className="review-note">
            <strong>Orientação da equipe:</strong>
            <p>{article.review_note}</p>
          </div>
        )}
        <div className="review-item-footer">
          <div className="review-item-images-preview">
            {article.cover_image && <img src={article.cover_image} alt="Capa" className="review-mini-thumb" title="Foto de capa" />}
            {article.secondary_image && <img src={article.secondary_image} alt="Secundária" className="review-mini-thumb" title="Segunda foto" />}
          </div>
          <button
            type="button"
            className="button button-secondary button-sm writer-edit-btn"
            onClick={() => onEdit?.(article)}
          >
            ✏️ Editar artigo & fotos
          </button>
        </div>
      </div>
    </article>
  );
}

function EditArticleModal({ article, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: article.title || '',
    excerpt: article.excerpt || '',
    content: Array.isArray(article.content) ? article.content.join('\n\n') : (article.content || ''),
    category: article.category === 'curiosidades-geradas' || article.category === 'Curiosidades Geradas' ? 'curiosidades-geradas' : 'historia-alternativa',
    coverImage: article.cover_image || article.image || '',
    secondaryImage: article.secondary_image || article.secondaryImage || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!form.content || form.content.length < 100) {
      getAccessToken().then((token) => {
        if (!token) return;
        fetch('/api/articles/mine', { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => res.json())
          .then((data) => {
            const found = data?.articles?.find((a) => a.id === article.id);
            if (found && found.content && found.content.length >= 100) {
              setForm((prev) => ({
                ...prev,
                content: found.content,
                coverImage: prev.coverImage || found.cover_image || '',
                secondaryImage: prev.secondaryImage || found.secondary_image || ''
              }));
            }
          })
          .catch(() => {});
      });
    }
  }, [article.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!form.title.trim() || form.title.trim().length < 10) {
      setError('O título deve ter pelo menos 10 caracteres.');
      return;
    }
    if (!form.excerpt.trim() || form.excerpt.trim().length < 20) {
      setError('O resumo deve ter pelo menos 20 caracteres.');
      return;
    }
    if (!form.content.trim() || form.content.trim().length < 100) {
      setError('O texto do artigo deve ter pelo menos 100 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/articles/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: article.id,
          ...form
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível salvar as alterações.');
      }
      setSuccessMsg('Artigo e fotos atualizados com sucesso!');
      setTimeout(() => {
        onUpdated?.(data.article || { id: article.id, ...form });
      }, 900);
    } catch (err) {
      setError(err.message || 'Erro ao salvar alterações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-article-title">
      <div className="payment-modal edit-article-modal">
        <div className="edit-modal-header">
          <div>
            <p className="eyebrow">Edição do Escritor</p>
            <h2 id="edit-article-title">Modificar artigo & imagens</h2>
          </div>
          <button className="search-close" aria-label="Fechar edição" onClick={onClose}>×</button>
        </div>

        {article.status === 'rejeitado' && article.review_note && (
          <div className="review-note review-note-alert">
            <strong>Orientação da equipe editorial:</strong>
            <p>{article.review_note}</p>
            <small>Ao salvar suas correções, o artigo voltará para a fila de revisão automaticamente.</small>
          </div>
        )}

        <form className="contact-form edit-form" onSubmit={handleSave}>
          <label>
            Título
            <input
              required
              minLength="10"
              maxLength="160"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>

          <label>
            Categoria
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="historia-alternativa">História Alternativa</option>
              <option value="curiosidades-geradas">Curiosidades Geradas</option>
            </select>
          </label>

          <ImageUploadField
            label="Foto 1: Imagem de Capa (Principal)"
            hint="Exibida no topo do artigo e nos cards de listagem."
            value={form.coverImage}
            onChange={(val) => setForm({ ...form, coverImage: val })}
            id="edit-cover"
          />

          <ImageUploadField
            label="Foto 2: Segunda Imagem do Artigo"
            hint="Opcional. Exibida no corpo do texto para ilustrar o conteúdo."
            value={form.secondaryImage}
            onChange={(val) => setForm({ ...form, secondaryImage: val })}
            secondary={true}
            id="edit-sec"
          />

          <label>
            Resumo
            <textarea
              required
              minLength="20"
              maxLength="500"
              rows="3"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </label>

          <label>
            Texto completo
            <textarea
              required
              minLength="100"
              rows="10"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </label>

          {error && <p className="form-message" role="alert">{error}</p>}
          {successMsg && <p className="success-message" role="status">{successMsg}</p>}

          <div className="edit-modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Profile({ user, profile, isAdmin = false, onLogout, onVerified, onProfileUpdated, registrationSuccess = false }) {
  const go = useNavigation();
  const [message, setMessage] = useState('');
  const [myArticles, setMyArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState('');
  const [editingArticle, setEditingArticle] = useState(null);
  const [displayName, setDisplayName] = useState(profile?.displayName || user.displayName || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || user.photoURL || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const isEmailVerified = Boolean(user.emailVerified || profile?.role === 'admin' || isAdmin);

  useEffect(() => {
    let active = true;
    const loadArticles = async () => {
      try {
        const token = await getAccessToken();
        const response = await fetch('/api/articles/mine', { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Não foi possível carregar seus artigos.');
        if (active) setMyArticles(result.articles || []);
      } catch (error) {
        if (active) setArticlesError(error.message);
      } finally {
        if (active) setArticlesLoading(false);
      }
    };
    loadArticles();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    setDisplayName(profile?.displayName || user.displayName || '');
    setPhotoURL(profile?.photoURL || user.photoURL || '');
  }, [profile?.displayName, profile?.photoURL, user.displayName, user.photoURL]);

  const saveProfile = async (event) => {
    event.preventDefault();
    const name = displayName.trim();
    if (name.length < 2 || name.length > 80) {
      setMessage('O nome público deve ter entre 2 e 80 caracteres.');
      return;
    }
    setSavingProfile(true);
    try {
      await supabase.auth.updateUser({ data: { display_name: name } });
      const token = await getAccessToken();
      const response = await fetch('/api/profiles/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: name, photoURL: photoURL.trim() })
      });
      const result = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(result?.error || 'Não foi possível atualizar o nome.');
      onProfileUpdated?.({ displayName: name, photoURL: photoURL.trim() });
      setMessage('Perfil atualizado com sucesso.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const resend = async () => {
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
      if (error) throw error;
      setMessage('E-mail de verificação reenviado. Confira sua caixa de entrada e a pasta de spam.');
    } catch (err) {
      setMessage(err?.message || 'Erro ao reenviar e-mail.');
    }
  };

  const verify = async () => {
    try {
      const refreshed = await onVerified?.();
      if (refreshed?.emailVerified || profile?.role === 'admin' || isAdmin) {
        setMessage('E-mail confirmado com sucesso.');
      } else {
        setMessage('Ainda não confirmamos o e-mail. Clique no link recebido e tente novamente.');
      }
    } catch (err) {
      setMessage(err?.message || 'Não foi possível verificar no momento.');
    }
  };

  const selectPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 500000) {
      setMessage('Escolha uma imagem JPG, PNG ou WebP de até 500 KB.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoURL(String(reader.result));
    reader.onerror = () => setMessage('Não foi possível carregar a imagem.');
    reader.readAsDataURL(file);
  };

  return (
    <main className="container single-page profile-page">
      {registrationSuccess && <p className="success-message" role="status">Cadastro feito com sucesso! Enviamos um link de confirmação para seu e-mail.</p>}
      <section className="profile-hero">
        <label className="profile-photo-picker" title="Escolher foto de perfil">
          <Avatar name={user.displayName || user.email || 'P'} photoURL={photoURL || user.photoURL} />
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} aria-label="Escolher foto de perfil" />
        </label>
        <div>
          <p className="eyebrow">Perfil do escritor</p>
          <h2>{user.displayName || 'Escritor'}</h2>
          <p>{user.email}</p>
          <span className={`tag ${isEmailVerified ? '' : 'tag-warning'}`}>{isEmailVerified ? 'E-mail verificado' : 'E-mail pendente de verificação'}</span>
          <small className="photo-hint">Clique na foto para alterar</small>
        </div>
      </section>
      <form className="profile-name-form" onSubmit={saveProfile}>
        <label>
          Nome público
          <input required minLength="2" maxLength="80" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Como você quer aparecer nos artigos?" />
        </label>
        <button className="button button-secondary" disabled={savingProfile}>{savingProfile ? 'Salvando...' : 'Salvar perfil'}</button>
      </form>
      {!isEmailVerified && (
        <div className="verification-box">
          <strong>Confirme seu e-mail para escrever artigos</strong>
          <p>Enviamos um link de confirmação para <b>{user.email}</b>. A submissão ficará bloqueada até a confirmação.</p>
          <div className="profile-actions">
            <button className="button button-primary" onClick={verify}>Já confirmei meu e-mail</button>
            <button className="button button-secondary" onClick={resend}>Reenviar e-mail</button>
          </div>
        </div>
      )}
      {message && <p className="form-message" role="status">{message}</p>}
      <section className="profile-actions">
        <button className="button button-primary" disabled={!isEmailVerified} onClick={() => go('/submeter')}>Escrever novo artigo</button>
        <button className="button button-secondary" onClick={() => go(`/escritor/${user.uid}`)}>Ver perfil público</button>
        <button className="button button-secondary" onClick={() => { if (!window.__unsavedArticle || window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) onLogout(); }}>Sair da conta</button>
      </section>
      <section className="my-articles">
        <div className="section-head">
          <div>
            <p className="eyebrow">Área do escritor</p>
            <h3>Meus artigos</h3>
            <p className="section-caption">Acompanhe o andamento de cada envio, modifique textos ou fotos e visualize as orientações da equipe editorial.</p>
          </div>
        </div>
        {articlesLoading && <LoadingState label="Carregando seus artigos..." />}
        {articlesError && <p className="form-message" role="alert">{articlesError}</p>}
        {!articlesLoading && !articlesError && !myArticles.length && <p className="empty-state">Você ainda não enviou nenhum artigo.</p>}
        {myArticles.map((article) => (
          <WriterArticleReview
            article={article}
            key={article.id}
            onEdit={(art) => setEditingArticle(art)}
          />
        ))}
      </section>

      {editingArticle && (
        <EditArticleModal
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onUpdated={(updated) => {
            setMyArticles((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
            setEditingArticle(null);
            setMessage('Artigo e imagens atualizados com sucesso!');
          }}
        />
      )}
    </main>
  );
}

function StaticPage({ type }) {
  if (type === 'sobre') {
    return (
      <main className="container single-page">
        <section className="about-hero">
          <div className="author-photo" role="img" aria-label="Foto de Lucas David Carvalho Vieira de Matos" />
          <div className="author-copy">
            <p className="eyebrow">Sobre o criador</p>
            <h2>Lucas David Carvalho Vieira de Matos</h2>
            <p>Recém-formado em Ciência da Computação e apaixonado por história desde a escola, Lucas une tecnologia e narrativa para explorar os caminhos que a história não tomou.</p>
          </div>
        </section>
        <section className="about-story">
          <p>A ideia de dar vida a este blog nasceu de uma vontade muito simples, mas inegavelmente poderosa: unir duas grandes paixões que sempre caminharam lado a lado na minha trajetória. Desde a época da escola, a história sempre foi a disciplina que mais capturava a minha atenção e despertava minha curiosidade. Porém, o que realmente me fascinava nunca foi apenas memorizar datas ou aceitar o curso natural dos eventos, mas sim questionar as infinitas possibilidades do que poderia ter acontecido. Aquele famoso e intrigante "e se?" sempre funcionou como o verdadeiro motor da minha imaginação, transformando fatos consumados em universos inteiros de possibilidades inexploradas.</p>
          <p>Depois de se formar em Ciência da Computação, Lucas criou o <strong>Histórias Contadas de Outra Maneira</strong> para ser um espaço aberto: um lugar onde ele mesmo pudesse escrever, mas também onde outras pessoas pudessem trazer suas próprias versões e hipóteses sobre o passado.</p>
          <p>Espero que gostem e se divirtam tanto quanto eu me divirto pensando nesses outros caminhos que a história poderia ter tomado!</p>
        </section>
      </main>
    );
  }
  return <ContactPage />;
}

function ContactPage() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    assunto: 'Sugestão de Pauta / "E se?"',
    mensagem: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.nome,
          email: form.email,
          subject: form.assunto,
          message: form.mensagem
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível enviar a mensagem.');
      }

      setStatus({
        type: 'success',
        text: 'Sua mensagem foi enviada com sucesso para a equipe editorial! Responderemos no seu e-mail em até 48 horas úteis.'
      });
      setForm({
        nome: '',
        email: '',
        assunto: 'Sugestão de Pauta / "E se?"',
        mensagem: ''
      });
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.message || 'Não foi possível enviar sua mensagem no momento. Tente novamente mais tarde.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container single-page contact-page-wrapper">
      <div className="contact-page-header">
        <p className="eyebrow">Canal Aberto com a Redação</p>
        <h2>Contato & Parcerias</h2>
        <p className="contact-header-lead">
          Tem dúvidas, sugestões de pautas contrafatuais, propostas de parcerias ou quer conversar com o autor? Envie uma mensagem diretamente para nossa equipe.
        </p>
      </div>

      <div className="contact-layout-grid">
        {/* Formulário Principal */}
        <section className="contact-card contact-form-card">
          <h3>Envie sua mensagem</h3>
          <p className="form-intro">Preencha os campos abaixo com seus dados para entrarmos em contato.</p>

          {status.type === 'success' && (
            <div className="contact-alert success" role="status">
              <span className="alert-icon">✓</span>
              <div>
                <strong>Mensagem entregue com sucesso!</strong>
                <p>{status.text}</p>
              </div>
            </div>
          )}

          {status.type === 'error' && (
            <div className="contact-alert error" role="alert">
              <span className="alert-icon">✕</span>
              <div>
                <strong>Falha no envio</strong>
                <p>{status.text}</p>
              </div>
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group-row">
              <label>
                Seu Nome Completo *
                <input
                  required
                  name="nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Carlos Eduardo"
                  minLength="2"
                  maxLength="100"
                />
              </label>

              <label>
                Seu E-mail *
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seuemail@exemplo.com"
                  maxLength="150"
                />
              </label>
            </div>

            <label>
              Assunto da Mensagem *
              <select
                name="assunto"
                value={form.assunto}
                onChange={(e) => setForm({ ...form, assunto: e.target.value })}
              >
                <option value="Sugestão de Pauta / 'E se?'">Sugestão de Pauta / Teoria "E se?"</option>
                <option value="Dúvida sobre Submissão de Artigo">Dúvida sobre Submissão de Artigo</option>
                <option value="Parceria Editorial ou Divulgação">Parceria Editorial ou Divulgação</option>
                <option value="Canal do YouTube @ALTERNATIVAHISTORIA">Canal do YouTube @ALTERNATIVAHISTORIA</option>
                <option value="Outros assuntos">Outro assunto</option>
              </select>
            </label>

            <label>
              Mensagem detalhada *
              <textarea
                required
                name="mensagem"
                rows="6"
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                placeholder="Compartilhe suas ideias, dúvidas ou propostas com a nossa equipe..."
                minLength="10"
                maxLength="5000"
              />
            </label>

            <button
              className="button button-primary contact-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" aria-hidden="true" />
                  <span>Enviando mensagem...</span>
                </>
              ) : (
                <>
                  <span>Enviar mensagem agora</span>
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Painel Lateral com Informações Oficiais */}
        <aside className="contact-info-panel">
          {/* Card do Canal do YouTube */}
          <div className="contact-info-card youtube-highlight-card">
            <div className="info-card-badge">🎬 Canal Oficial</div>
            <h4>Alternativa História</h4>
            <p>
              Tem uma sugestão de roteiro para o canal? Nossos vídeos no YouTube nascem das hipóteses enviadas pelos leitores e escritores.
            </p>
            <a
              href="https://www.youtube.com/@ALTERNATIVAHISTORIA"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-youtube-sm"
            >
              Conhecer @ALTERNATIVAHISTORIA ↗
            </a>
          </div>

          {/* Card de Prazo & Atendimento */}
          <div className="contact-info-card">
            <div className="info-card-badge">⏱ Atendimento</div>
            <h4>Tempo de Resposta</h4>
            <p>
              Nossa equipe editorial lê e responde todas as mensagens recebidas. Nosso prazo padrão de retorno é de <strong>24h a 48h úteis</strong>.
            </p>
          </div>

          {/* Card de Submissão de Artigo */}
          <div className="contact-info-card">
            <div className="info-card-badge">✍️ É Escritor?</div>
            <h4>Quer publicar um artigo?</h4>
            <p>
              Você não precisa usar o formulário de contato! Crie uma conta de escritor para submeter seu texto para curadoria editorial.
            </p>
            <a href="/cadastro" className="sidebar-author-btn">
              Inscrever-se como escritor →
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}

function PrivacyPolicyPage() {
  const go = useNavigation();
  useEffect(() => {
    document.title = 'Política de Privacidade | Histórias Contadas de Outra Maneira';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <main className="container single-page">
      <article className="contact-card legal-document">
        <p className="eyebrow">Transparência e Conformidade</p>
        <h2>Política de Privacidade</h2>
        <p className="legal-updated">Última atualização: Setembro de 2026</p>

        <section className="legal-section">
          <h3>1. Introdução e Compromisso</h3>
          <p>A revista digital <strong>Histórias Contadas de Outra Maneira</strong> tem o compromisso de proteger a privacidade, a segurança e a transparência no tratamento dos dados pessoais de seus leitores, colaboradores e escritores, em estrita conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong> e demais legislações aplicáveis.</p>
        </section>

        <section className="legal-section">
          <h3>2. Coleta de Informações</h3>
          <p>Coletamos informações nas seguintes circunstâncias:</p>
          <ul>
            <li><strong>Navegação geral:</strong> Dados anônimos de acesso (endereço IP resumido, tipo de navegador, páginas visualizadas e tempo de permanência) para aprimoramento da experiência editorial.</li>
            <li><strong>Cadastro de Escritores e Submissão:</strong> Nome público de autor, endereço de e-mail e biografia fornecidos voluntariamente para criação de conta e revisão de textos.</li>
            <li><strong>Mensagens de Contato:</strong> Nome, e-mail e conteúdo enviados espontaneamente através do formulário de contato da revista.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>3. Uso de Cookies e Google AdSense</h3>
          <p>Este site utiliza cookies para personalizar conteúdo, anúncios e analisar nosso tráfego:</p>
          <ul>
            <li><strong>Google AdSense:</strong> O Google, como fornecedor terceiro, utiliza cookies (incluindo o cookie DoubleClick DART) para veicular anúncios com base nas visitas anteriores dos usuários a este ou a outros sites na internet.</li>
            <li><strong>Desativação de Anúncios Personalizados:</strong> Os leitores podem desativar a publicidade personalizada acessando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Configurações de Anúncios do Google</a> ou visitando o portal <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">AboutAds.info</a>.</li>
            <li><strong>Google Analytics:</strong> Utilizamos o Google Analytics (código de acompanhamento G-Y7MQ743JVQ) para compreender de maneira agregada como o público interage com nossos artigos.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>4. Direitos do Titular (LGPD)</h3>
          <p>Em conformidade com a LGPD, todo usuário possui o direito de solicitar a qualquer momento a confirmação da existência de tratamento de dados, acesso aos seus dados pessoais, correção de dados incompletos ou inexatos, ou a exclusão definitiva de sua conta de escritor.</p>
        </section>

        <section className="legal-section">
          <h3>5. Contato sobre Privacidade</h3>
          <p>Para dúvidas, solicitações ou exercício de direitos referentes aos seus dados pessoais, entre em contato através da nossa página de <a href="/contato" onClick={(e) => { e.preventDefault(); go('/contato'); }}>Contato</a> ou pelo e-mail da equipe editorial.</p>
        </section>

        <div className="legal-actions">
          <a className="button button-secondary" href="/" onClick={(e) => { e.preventDefault(); go('/'); }}>Voltar para a Home</a>
        </div>
      </article>
    </main>
  );
}

function NotFound() {
  const go = useNavigation();
  return <main className="container single-page"><section className="contact-card not-found-page"><p className="eyebrow">Erro 404</p><h2>Página não encontrada</h2><p>Esse caminho não existe ou foi movido. Volte para a página inicial e continue explorando.</p><button className="button button-primary" onClick={() => go('/')}>Voltar para a Home</button></section></main>;
}

function PublicWriter({ uid }) {
  const [writer, setWriter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const go = useNavigation();
  useEffect(() => {
    fetch(`/api/writers/profile?uid=${encodeURIComponent(uid)}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Escritor não encontrado.');
        setWriter(result.writer);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [uid]);
  if (loading) return <main className="container single-page"><section className="contact-card"><LoadingState label="Carregando perfil..." /></section></main>;
  if (error || !writer) return <NotFound />;
  return <main className="container single-page writer-public-page"><section className="writer-public-hero"><Avatar name={writer.displayName} photoURL={writer.photoURL} /><div><p className="eyebrow">Perfil público</p><h2>{writer.displayName}</h2><p>{writer.bio || 'Escritor colaborador da revista Histórias Contadas de Outra Maneira.'}</p></div></section><section className="writer-public-articles"><div className="section-head"><div><p className="eyebrow">Publicações</p><h3>Artigos aprovados</h3></div></div>{!writer.articles.length && <p className="empty-state">Este escritor ainda não possui artigos publicados.</p>}{writer.articles.map((article) => <article className="writer-public-card" key={article.id}>{article.cover_image && <img src={article.cover_image} alt="" /> }<div><span className="tag">{article.category}</span><h4>{article.title}</h4><p>{article.excerpt}</p><small>{article.created_at ? new Date(article.created_at).toLocaleDateString('pt-BR') : 'Data pendente'}</small></div></article>)}</section><button className="button button-secondary" onClick={() => go('/')}>Voltar para a Home</button></main>;
}

function App() {
  const { user, profile, loading, refreshUser, updateProfileState } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [, refresh] = useState(0);
  const [allArticles, setAllArticles] = useState(articles);

  const loadArticles = async () => {
    try {
      let publicRows = null;
      const response = await fetch('/api/articles/public').catch(() => null);
      if (response && response.ok) {
        const result = await response.json();
        if (Array.isArray(result.articles)) {
          publicRows = result.articles;
        }
      }
      if (!publicRows && supabase) {
        const { data } = await supabase
          .from('articles')
          .select('id, title, excerpt, content, category, author_name, author_uid, cover_image, status, created_at')
          .eq('status', 'aprovado')
          .order('created_at', { ascending: false });
        if (Array.isArray(data)) {
          publicRows = data;
        }
      }
      if (Array.isArray(publicRows)) {
        const formatted = publicRows.map(formatSupabaseArticle);
        const combined = [...formatted, ...articles.filter((a) => !formatted.some((f) => f.slug === a.slug || f.slugBase === a.slug))];
        setAllArticles(combined);
      }
    } catch (err) {
      console.error('Erro ao carregar artigos:', err);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const path = getPath();

  useEffect(() => {
    loadArticles();
  }, [path]);

  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      setIsAdmin(false);
      return undefined;
    }
    getAccessToken()
      .then((token) => fetch('/api/admin/access', { headers: { Authorization: `Bearer ${token}` } }))
      .then((response) => response.ok ? response.json() : { isAdmin: false })
      .then((result) => { if (active) setIsAdmin(Boolean(result.isAdmin)); })
      .catch(() => { if (active) setIsAdmin(false); });
    return () => { active = false; };
  }, [user]);

  const registrationSuccess = new URLSearchParams(window.location.search).get('cadastro') === 'sucesso';
  const isEmailVerified = Boolean(user?.emailVerified || profile?.role === 'admin' || isAdmin);
  if (loading) return <Layout articles={allArticles} profile={profile} isAdmin={false}><main className="container single-page"><section className="contact-card"><LoadingState label="Carregando sua conta..." /></section></main></Layout>;
  let content = <Home articles={allArticles} user={user} />;
  if (path.startsWith('/categoria/')) content = <Category slug={path.split('/')[2]} articles={allArticles} />;
  else if (path.startsWith('/artigo/')) content = <Article slug={path.split('/')[2]} articles={allArticles} user={user} />;
  else if (path === '/sobre') content = <StaticPage type="sobre" />;
  else if (path === '/contato') content = <ContactPage />;
  else if (path === '/politica-de-privacidade' || path === '/privacidade') content = <PrivacyPolicyPage />;
  else if (path === '/login') content = user ? <Profile user={user} profile={profile} isAdmin={isAdmin} onVerified={refreshUser} onProfileUpdated={updateProfileState} onLogout={() => supabase.auth.signOut()} /> : <AuthPage />;
  else if (path === '/cadastro') content = user ? <Profile user={user} profile={profile} isAdmin={isAdmin} onVerified={refreshUser} onProfileUpdated={updateProfileState} onLogout={() => supabase.auth.signOut()} /> : <AuthPage mode="register" />;
  else if (path === '/perfil') content = user ? <Profile user={user} profile={profile} isAdmin={isAdmin} registrationSuccess={registrationSuccess} onVerified={refreshUser} onProfileUpdated={updateProfileState} onLogout={() => supabase.auth.signOut()} /> : <AuthPage registrationSuccess={registrationSuccess} />;
  else if (path === '/submeter') content = user ? (isEmailVerified ? <SubmitArticle user={user} /> : <Profile user={user} profile={profile} isAdmin={isAdmin} onVerified={refreshUser} onProfileUpdated={() => refresh((value) => value + 1)} onLogout={() => supabase.auth.signOut()} />) : <AuthPage />;
  else if (path === '/admin') content = user ? <ReviewAdmin user={user} onArticleApproved={loadArticles} /> : <AuthPage />;
  else if (path.startsWith('/escritor/')) content = <PublicWriter uid={path.split('/')[2]} />;
  else if (!['/', '/login', '/cadastro', '/perfil', '/submeter', '/admin', '/politica-de-privacidade', '/privacidade'].includes(path)) content = <NotFound />;
  return <Layout articles={allArticles} user={user} profile={profile} isAdmin={isAdmin} onLogout={() => supabase.auth.signOut()}>{content}</Layout>;
}

createRoot(document.getElementById('root')).render(<App />);
