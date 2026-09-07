import React, { useEffect, useMemo, useState } from 'react';
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
          <a href="/categoria/curiosidades-geradas" onClick={link('/categoria/curiosidades-geradas')}>Curiosidades Geradas</a>
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
          <div className="footer-column"><span className="footer-title">Explorar</span><a href="/" onClick={link('/')}>Início</a><a href="/categoria/historia-alternativa" onClick={link('/categoria/historia-alternativa')}>História alternativa</a><a href="/categoria/curiosidades-geradas" onClick={link('/categoria/curiosidades-geradas')}>Curiosidades</a></div>
          <div className="footer-column"><span className="footer-title">Revista</span><a href="/sobre" onClick={link('/sobre')}>Sobre o autor</a><a href="/contato" onClick={link('/contato')}>Contato</a><a href={user ? '/submeter' : '/cadastro'} onClick={link(user ? '/submeter' : '/cadastro')}>Escreva conosco</a><a href="https://www.youtube.com/@ALTERNATIVAHISTORIA" target="_blank" rel="noopener noreferrer">Canal YouTube ↗</a></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Histórias Contadas de Outra Maneira</span><span>Feito para quem gosta de imaginar outros caminhos.</span></div>
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
        <section className="feed-section">
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
            <div className="curiosity-feature-card">
              <div className="curiosity-card-top">
                <span className="curiosity-icon-badge">🏛️</span>
                <span className="curiosity-number">01</span>
              </div>
              <span className="curiosity-category-tag">Roma & Cartago</span>
              <h4>A vitória cartaginesa que quase desfez Roma</h4>
              <p>
                Após Canas, Aníbal esteve a um cerco de mudar toda a história do Mediterrâneo ocidental e do direito moderno que herdamos.
              </p>
            </div>

            <div className="curiosity-feature-card">
              <div className="curiosity-card-top">
                <span className="curiosity-icon-badge">⚙️</span>
                <span className="curiosity-number">02</span>
              </div>
              <span className="curiosity-category-tag">Grécia Helenística</span>
              <h4>O computador analógico perdido de Anticítera</h4>
              <p>
                Engrenagens de bronze do século II a.C. calculavam eclipses e movimentos planetários séculos antes da revolução mecânica europeia.
              </p>
            </div>

            <div className="curiosity-feature-card">
              <div className="curiosity-card-top">
                <span className="curiosity-icon-badge">🗺️</span>
                <span className="curiosity-number">03</span>
              </div>
              <span className="curiosity-category-tag">Navegações</span>
              <h4>Mapas deliberadamente desenhados para naufragar</h4>
              <p>
                Durante a corrida marítima renascentista, coroas desenhavam ilhas fantasmas e recifes fictícios em cópias de cartas náuticas para fazer espiões rivais naufragarem em alto-mar.
              </p>
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
    'curiosidades-geradas': 'Curiosidades Geradas'
  };
  const category = categoryNames[row.category] || row.category || 'História Alternativa';
  const categorySlug = row.category === 'curiosidades-geradas' ? 'curiosidades-geradas' : 'historia-alternativa';
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
    content,
    featured: false
  };
}

function Article({ slug, articles, user }) {
  const article = articles.find((item) => item.slug === slug || item.id === slug || item.slugBase === slug);
  if (!article) return <NotFound />;
  useEffect(() => { document.title = `${article.title} | Histórias Contadas de Outra Maneira`; }, [article]);
  const paragraphs = (Array.isArray(article.content) ? article.content : String(article.content).split('\n')).filter(Boolean);
  return <main className="container article-layout"><article className="article-content-panel"><div className="article-header"><p className="eyebrow">{article.category}</p><h2>{article.title}</h2><div className="meta-row"><span>Por {article.author}</span><span>{article.readingTime}</span><span>{article.date}</span></div><FavoriteButton slug={article.slug} /></div><div className="article-hero-image" style={{ backgroundImage: `url('${article.image}')` }} /><div className="article-body">{paragraphs.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)}</div></article><Sidebar user={user} /></main>;
}

function Admin({ articles, onChange }) {
  const empty = { title: '', excerpt: '', category: 'História Alternativa', readingTime: '5 min', author: 'Lucas Matos', content: '' };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const slugify = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const submit = (event) => {
    event.preventDefault();
    const categorySlug = form.category === 'História Alternativa' ? 'historia-alternativa' : 'curiosidades-geradas';
    const article = { ...form, slug: editing || slugify(form.title), categorySlug, date: 'Agora', image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=80', content: form.content.split('\n').filter(Boolean) };
    onChange(editing ? articles.map((item) => item.slug === editing ? { ...item, ...article } : item) : [...articles, article]);
    setForm(empty); setEditing(null);
  };
  const edit = (article) => { setEditing(article.slug); setForm({ ...article, content: article.content.join('\n') }); };
  const remove = (slug) => onChange(articles.filter((article) => article.slug !== slug));
  return <main className="container admin-layout"><section className="contact-card"><p className="eyebrow">CMS local</p><h2>{editing ? 'Editar artigo' : 'Novo artigo'}</h2><form className="contact-form" onSubmit={submit}><label>Título<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label>Resumo<textarea required rows="3" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} /></label><label>Categoria<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>História Alternativa</option><option>Curiosidades Geradas</option></select></label><label>Conteúdo <span className="field-hint">Um parágrafo por linha</span><textarea required rows="7" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label><button className="button button-primary" type="submit">{editing ? 'Salvar alterações' : 'Publicar artigo'}</button></form></section><section className="admin-list"><p className="eyebrow">Publicados localmente</p>{articles.map((article) => <div className="admin-item" key={article.slug}><strong>{article.title}</strong><div><button className="save-button" onClick={() => edit(article)}>Editar</button><button className="save-button danger" onClick={() => remove(article.slug)}>Excluir</button></div></div>)}</section></main>;
}

function ReviewAdmin({ user, onArticleApproved }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pendente_revisao');
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
      const response = await fetch('/api/admin/articles', { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (response.status === 403) {
        setAccessDenied(true);
        return;
      }
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar os artigos.');
      setItems(result.articles || []);
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
  const visible = filter === 'todos' ? items : items.filter((article) => article.status === filter);
  return <main className="container single-page admin-review-page">
    <section className="page-intro"><p className="eyebrow">Administração</p><h2>Fila de revisão</h2><p>Analise os artigos enviados e decida quais serão aprovados para publicação.</p><div className="admin-toolbar"><label>Status<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="pendente_revisao">Aguardando revisão</option><option value="aprovado">Aprovados</option><option value="rejeitado">Rejeitados</option><option value="todos">Todos</option></select></label><button className="button button-secondary" onClick={load} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar fila'}</button></div></section>
    {error && <p className="form-message" role="alert">{error}</p>}
    {loading && <section className="admin-review-list"><LoadingState label="Carregando artigos..." /></section>}
    {!loading && !visible.length && <section className="admin-review-list"><p className="empty-state">Nenhum artigo nesta categoria.</p></section>}
    {!loading && visible.length > 0 && <section className="admin-review-list">{visible.map((article) => <article className="review-admin-item" key={article.id}><div className="review-admin-content"><div className="review-admin-heading"><span className="tag">{article.category}</span><span className={`review-status status-${article.status}`}>{article.status === 'pendente_revisao' ? 'Em revisão' : article.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}</span></div><h3>{article.title}</h3><p>{article.excerpt}</p><div className="review-admin-meta"><span>{article.author_name} · {article.author_email}</span><span>{article.created_at ? new Date(article.created_at).toLocaleDateString('pt-BR') : 'Data pendente'}</span></div>{article.cover_image && <img className="review-cover-preview" src={article.cover_image} alt="" />}<details><summary>Ver texto completo</summary><div className="review-text">{Array.isArray(article.content) ? article.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>{article.content}</p>}</div></details>{article.review_note && <p className="review-note"><strong>Justificativa:</strong> {article.review_note}</p>}</div>{article.status === 'pendente_revisao' && <div className="review-admin-actions"><button className="button button-primary" onClick={() => updateStatus(article, 'aprovado')}>Aprovar</button><button className="button button-secondary" onClick={() => { setReviewing(article.id); setReviewNote(''); }}>Rejeitar</button></div>}{reviewing === article.id && <div className="review-dialog"><label>Justificativa da rejeição<textarea rows="4" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Explique ao escritor o que precisa ser ajustado." /></label><div className="profile-actions"><button className="button button-secondary" onClick={() => setReviewing(null)}>Cancelar</button><button className="button button-primary" onClick={() => updateStatus(article, 'rejeitado')}>Confirmar rejeição</button></div></div>}</article>)}</section>}
  </main>;
}

function SubmitArticle({ user }) {
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', category: 'historia-alternativa', coverImage: '' });
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

  return <main className="container single-page submit-page">
    <section className="contact-card">
      <p className="eyebrow">Publicação</p>
      <h2>Submeter artigo</h2>
      <p className="form-intro">Envie seu texto para avaliação. A taxa de submissão é de R$ 5,00 via Pix.</p>
      
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
        <label>Título<input required minLength="10" maxLength="160" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label>E-mail do autor<input required type="email" value={user.email || ''} readOnly /></label>
        <label>Categoria<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="historia-alternativa">História Alternativa</option><option value="curiosidades-geradas">Curiosidades Geradas</option></select></label>
        <label>Imagem de capa (URL)<input type="url" value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} placeholder="https://exemplo.com/imagem.jpg" /><span className="field-hint">Opcional. Use uma imagem pública e autorizada.</span></label>
        <label>Resumo<textarea required minLength="20" maxLength="500" rows="3" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} /></label>
        <label>Texto<textarea required minLength="100" rows="10" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label>
        <button className="button button-primary" type="submit" disabled={loading}>{loading ? 'Gerando Pix...' : 'Submeter artigo — R$ 5,00'}</button>
      </form>
      {message && <p className="form-message" role="status">{message}</p>}
    </section>
    {payment && <div className="payment-overlay" role="dialog" aria-modal="true" aria-labelledby="payment-title">
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
    </div>}
  </main>;
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

function WriterArticleReview({ article }) {
  const details = reviewStatusDetails[article.status] || { label: article.status, description: 'Status atualizado pela equipe editorial.' };
  return <article className="review-item">
    <div className="review-item-content">
      <div className="review-item-heading"><span className="tag">{article.category}</span><span className={`review-status status-${article.status}`}>{details.label}</span></div>
      <h4>{article.title}</h4>
      <p>{article.excerpt}</p>
      <div className="review-timeline"><span>Enviado em {formatReviewDate(article.created_at)}</span>{article.reviewed_at && <span>Revisado em {formatReviewDate(article.reviewed_at)}</span>}</div>
      <p className="review-description">{details.description}</p>
      {article.status === 'rejeitado' && article.review_note && <div className="review-note"><strong>Orientação da equipe:</strong><p>{article.review_note}</p></div>}
    </div>
  </article>;
}

function Profile({ user, profile, isAdmin = false, onLogout, onVerified, onProfileUpdated, registrationSuccess = false }) {
  const go = useNavigation();
  const [message, setMessage] = useState('');
  const [myArticles, setMyArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState('');
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
  return <main className="container single-page profile-page">{registrationSuccess && <p className="success-message" role="status">Cadastro feito com sucesso! Enviamos um link de confirmação para seu e-mail.</p>}<section className="profile-hero"><label className="profile-photo-picker" title="Escolher foto de perfil"><Avatar name={user.displayName || user.email || 'P'} photoURL={photoURL || user.photoURL} /><input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} aria-label="Escolher foto de perfil" /></label><div><p className="eyebrow">Perfil do escritor</p><h2>{user.displayName || 'Escritor'}</h2><p>{user.email}</p><span className={`tag ${isEmailVerified ? '' : 'tag-warning'}`}>{isEmailVerified ? 'E-mail verificado' : 'E-mail pendente de verificação'}</span><small className="photo-hint">Clique na foto para alterar</small></div></section><form className="profile-name-form" onSubmit={saveProfile}><label>Nome público<input required minLength="2" maxLength="80" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Como você quer aparecer nos artigos?" /></label><button className="button button-secondary" disabled={savingProfile}>{savingProfile ? 'Salvando...' : 'Salvar perfil'}</button></form>{!isEmailVerified && <div className="verification-box"><strong>Confirme seu e-mail para escrever artigos</strong><p>Enviamos um link de confirmação para <b>{user.email}</b>. A submissão ficará bloqueada até a confirmação.</p><div className="profile-actions"><button className="button button-primary" onClick={verify}>Já confirmei meu e-mail</button><button className="button button-secondary" onClick={resend}>Reenviar e-mail</button></div></div>}{message && <p className="form-message" role="status">{message}</p>}<section className="profile-actions"><button className="button button-primary" disabled={!isEmailVerified} onClick={() => go('/submeter')}>Escrever novo artigo</button><button className="button button-secondary" onClick={() => go(`/escritor/${user.uid}`)}>Ver perfil público</button><button className="button button-secondary" onClick={() => { if (!window.__unsavedArticle || window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) onLogout(); }}>Sair da conta</button></section><section className="my-articles"><div className="section-head"><div><p className="eyebrow">Área do escritor</p><h3>Meus artigos</h3><p className="section-caption">Acompanhe o andamento de cada envio e as orientações da equipe editorial.</p></div></div>{articlesLoading && <LoadingState label="Carregando seus artigos..." />}{articlesError && <p className="form-message" role="alert">{articlesError}</p>}{!articlesLoading && !articlesError && !myArticles.length && <p className="empty-state">Você ainda não enviou nenhum artigo.</p>}{myArticles.map((article) => <WriterArticleReview article={article} key={article.id} />)}</section></main>;
}

function StaticPage({ type }) {
  if (type === 'sobre') return <main className="container single-page"><section className="about-hero"><div className="author-photo" role="img" aria-label="Foto de Lucas David Carvalho Vieira de Matos" /><div className="author-copy"><p className="eyebrow">Sobre o criador</p><h2>Lucas David Carvalho Vieira de Matos</h2><p>Recém-formado em Ciência da Computação e apaixonado por história desde a escola, Lucas une tecnologia e narrativa para explorar os caminhos que a história não tomou.</p></div></section><section className="about-story"><p>A ideia de dar vida a este blog nasceu de uma vontade muito simples, mas inegavelmente poderosa: unir duas grandes paixões que sempre caminharam lado a lado na minha trajetória. Desde a época da escola, a história sempre foi a disciplina que mais capturava a minha atenção e despertava minha curiosidade. Porém, o que realmente me fascinava nunca foi apenas memorizar datas ou aceitar o curso natural dos eventos, mas sim questionar as infinitas possibilidades do que poderia ter acontecido. Aquele famoso e intrigante "e se?" sempre funcionou como o verdadeiro motor da minha imaginação, transformando fatos consumados em universos inteiros de possibilidades inexploradas.</p><p>Depois de se formar em Ciência da Computação, Lucas criou o <strong>Histórias Contadas de Outra Maneira</strong> para ser um espaço aberto: um lugar onde ele mesmo pudesse escrever, mas também onde outras pessoas pudessem trazer suas próprias versões e hipóteses sobre o passado.</p><p>Espero que gostem e se divirtam tanto quanto eu me divirto pensando nesses outros caminhos que a história poderia ter tomado!</p></section></main>;
  return <main className="container single-page"><section className="contact-card"><p className="eyebrow">Contato</p><h2>Parcerias, sugestões e mensagens dos leitores</h2><form className="contact-form" onSubmit={(event) => { event.preventDefault(); alert('Mensagem enviada.'); }}><label>Nome<input required name="nome" placeholder="Seu nome" /></label><label>E-mail<input required type="email" name="email" placeholder="Seu e-mail" /></label><label>Mensagem<textarea required name="mensagem" rows="5" placeholder="Escreva sua mensagem" /></label><button className="button button-primary" type="submit">Enviar mensagem</button></form></section></main>;
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
  else if (path === '/contato') content = <StaticPage type="contato" />;
  else if (path === '/login') content = user ? <Profile user={user} profile={profile} isAdmin={isAdmin} onVerified={refreshUser} onProfileUpdated={updateProfileState} onLogout={() => supabase.auth.signOut()} /> : <AuthPage />;
  else if (path === '/cadastro') content = user ? <Profile user={user} profile={profile} isAdmin={isAdmin} onVerified={refreshUser} onProfileUpdated={updateProfileState} onLogout={() => supabase.auth.signOut()} /> : <AuthPage mode="register" />;
  else if (path === '/perfil') content = user ? <Profile user={user} profile={profile} isAdmin={isAdmin} registrationSuccess={registrationSuccess} onVerified={refreshUser} onProfileUpdated={updateProfileState} onLogout={() => supabase.auth.signOut()} /> : <AuthPage registrationSuccess={registrationSuccess} />;
  else if (path === '/submeter') content = user ? (isEmailVerified ? <SubmitArticle user={user} /> : <Profile user={user} profile={profile} isAdmin={isAdmin} onVerified={refreshUser} onProfileUpdated={() => refresh((value) => value + 1)} onLogout={() => supabase.auth.signOut()} />) : <AuthPage />;
  else if (path === '/admin') content = user ? <ReviewAdmin user={user} onArticleApproved={loadArticles} /> : <AuthPage />;
  else if (path.startsWith('/escritor/')) content = <PublicWriter uid={path.split('/')[2]} />;
  else if (!['/', '/login', '/cadastro', '/perfil', '/submeter', '/admin'].includes(path)) content = <NotFound />;
  return <Layout articles={allArticles} user={user} profile={profile} isAdmin={isAdmin} onLogout={() => supabase.auth.signOut()}>{content}</Layout>;
}

createRoot(document.getElementById('root')).render(<App />);
