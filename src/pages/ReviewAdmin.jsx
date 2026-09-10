import React, { useState, useEffect } from 'react';
import { getAccessToken } from '../supabase';
import { LoadingState } from '../components/ui/LoadingState';

export function ReviewAdmin({ user, onArticleApproved }) {
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

  useEffect(() => {
    load();
  }, [user]);

  if (accessDenied) {
    return (
      <main className="container single-page">
        <section className="contact-card access-denied">
          <p className="eyebrow">Acesso restrito</p>
          <h2>Você não é administrador</h2>
          <p>Esta área está disponível somente para a conta administrativa configurada no servidor.</p>
        </section>
      </main>
    );
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
      setItems((current) =>
        current.map((item) => (item.id === article.id ? { ...item, status: result.status, review_note: reviewNote } : item))
      );
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
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, status: newStatus } : m)));
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
            <button className="button button-secondary" onClick={load} disabled={loading} type="button">
              {loading ? 'Atualizando...' : 'Atualizar fila'}
            </button>
          </div>

          {loading && (
            <section className="admin-review-list">
              <LoadingState label="Carregando artigos..." />
            </section>
          )}
          {!loading && !visibleArticles.length && (
            <section className="admin-review-list">
              <p className="empty-state">Nenhum artigo nesta categoria.</p>
            </section>
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
                          ? article.content.map((paragraph, pIdx) => <p key={pIdx}>{paragraph}</p>)
                          : <p>{article.content}</p>}
                      </div>
                    </details>
                    {article.review_note && (
                      <p className="review-note"><strong>Justificativa:</strong> {article.review_note}</p>
                    )}
                  </div>
                  {article.status === 'pendente_revisao' && (
                    <div className="review-admin-actions">
                      <button className="button button-primary" onClick={() => updateStatus(article, 'aprovado')} type="button">
                        Aprovar
                      </button>
                      <button className="button button-secondary" onClick={() => { setReviewing(article.id); setReviewNote(''); }} type="button">
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
                        <button className="button button-secondary" onClick={() => setReviewing(null)} type="button">
                          Cancelar
                        </button>
                        <button className="button button-primary" onClick={() => updateStatus(article, 'rejeitado')} type="button">
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
            <button className="button button-secondary" onClick={load} disabled={loading} type="button">
              {loading ? 'Atualizando...' : 'Atualizar mensagens'}
            </button>
          </div>

          {loading && (
            <section className="admin-review-list">
              <LoadingState label="Carregando mensagens..." />
            </section>
          )}
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
