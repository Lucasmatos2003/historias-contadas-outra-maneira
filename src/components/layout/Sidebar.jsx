import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { amazonLink } from '../../data';

export function Sidebar({ user }) {
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

      {/* BIBLIOTECA DA REVISTA — AMAZON SIDEBAR */}
      <div className="sidebar-amazon-card">
        <div className="sidebar-amazon-header">
          <span className="sidebar-amazon-icon">📚</span>
          <div>
            <p className="sidebar-amazon-eyebrow">Biblioteca da Revista</p>
            <strong className="sidebar-amazon-title">Livros para ir mais fundo</strong>
          </div>
        </div>
        <div className="sidebar-amazon-books">
          {[
            {
              asin: '8535928308',
              title: 'SPQR: Uma História de Roma Antiga',
              author: 'Mary Beard',
              price: 'R$ 64,90'
            },
            {
              asin: '8576160285',
              title: 'Colapso: Como as Sociedades Escolhem Fracassar ou Sobreviver',
              author: 'Jared Diamond',
              price: 'R$ 89,90'
            },
            {
              asin: '8535919082',
              title: '1453: A Queda de Constantinopla',
              author: 'Roger Crowley',
              price: 'R$ 59,90'
            }
          ].map((book) => (
            <a
              key={book.asin}
              href={amazonLink(book.asin)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="sidebar-amazon-book-row"
              aria-label={`Ver ${book.title} na Amazon`}
            >
              <span className="sidebar-amazon-book-thumb">📖</span>
              <div className="sidebar-amazon-book-info">
                <span className="sidebar-amazon-book-title">{book.title}</span>
                <span className="sidebar-amazon-book-meta">{book.author} · {book.price}</span>
              </div>
              <span className="sidebar-amazon-book-arrow">›</span>
            </a>
          ))}
        </div>
        <p className="sidebar-amazon-disclosure">* Links de afiliado Amazon Associates</p>
      </div>
    </aside>
  );
}
