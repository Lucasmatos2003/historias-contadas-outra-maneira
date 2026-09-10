import React, { useEffect, useState } from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { Avatar } from '../ui/Avatar';

export function Layout({ children, articles, user, profile, isAdmin, onLogout }) {
  const go = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [light, setLight] = useState(() => localStorage.getItem('theme') === 'light');
  const [query, setQuery] = useState('');
  const results = query.trim() ? (articles || []).filter((article) => `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [];

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
      <header className={`site-header ${isAdmin ? 'site-header-admin' : ''}`}>
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
          {user ? (
            <button className="profile-chip" onClick={() => go('/perfil')} title="Abrir perfil">
              <Avatar
                name={profile?.displayName || user.displayName || user.email || 'P'}
                photoURL={profile?.photoURL || user.photoURL}
                className="profile-chip-avatar"
              />
            </button>
          ) : (
            <a className="auth-link" href="/login" onClick={link('/login')}>Entrar</a>
          )}
          {user && <button className="icon-button" aria-label="Sair" onClick={logout}>↪</button>}
          <button
            className="icon-button menu-toggle"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            ☰
          </button>
        </div>
      </header>

      {children}

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <span className="footer-mark">H</span>
            <div>
              <p className="eyebrow">Revista digital</p>
              <strong>Histórias Contadas<br />de Outra Maneira</strong>
            </div>
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

      {searchOpen && (
        <div className="search-overlay is-open" onClick={(event) => event.target === event.currentTarget && setSearchOpen(false)}>
          <div className="search-dialog" role="dialog" aria-modal="true">
            <button className="search-close" aria-label="Fechar busca" onClick={() => setSearchOpen(false)}>×</button>
            <h2>Pesquisar histórias</h2>
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Digite um título, tema ou categoria"
            />
            <div className="search-results">
              {results.map((article) => (
                <a key={article.slug} href={`/artigo/${article.slug}`} onClick={link(`/artigo/${article.slug}`)}>
                  <strong>{article.title}</strong>
                  <span>{article.category} · {article.readingTime}</span>
                </a>
              ))}
              {query && !results.length && <p className="empty-state">Nenhuma história encontrada.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
