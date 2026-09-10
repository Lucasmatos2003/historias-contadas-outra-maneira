import React, { useState, useEffect } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { getAccessToken, supabase } from '../supabase';
import { Avatar } from '../components/ui/Avatar';
import { LoadingState } from '../components/ui/LoadingState';
import { WriterArticleReview } from '../components/articles/WriterArticleReview';
import { EditArticleModal } from '../components/articles/EditArticleModal';

export function Profile({
  user,
  profile,
  isAdmin = false,
  onLogout,
  onVerified,
  onProfileUpdated,
  registrationSuccess = false
}) {
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
    return () => {
      active = false;
    };
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
      {registrationSuccess && (
        <p className="success-message" role="status">Cadastro feito com sucesso! Enviamos um link de confirmação para seu e-mail.</p>
      )}
      <section className="profile-hero">
        <label className="profile-photo-picker" title="Escolher foto de perfil">
          <Avatar name={user.displayName || user.email || 'P'} photoURL={photoURL || user.photoURL} />
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} aria-label="Escolher foto de perfil" />
        </label>
        <div>
          <p className="eyebrow">Perfil do escritor</p>
          <h2>{user.displayName || 'Escritor'}</h2>
          <p>{user.email}</p>
          <span className={`tag ${isEmailVerified ? '' : 'tag-warning'}`}>
            {isEmailVerified ? 'E-mail verificado' : 'E-mail pendente de verificação'}
          </span>
          <small className="photo-hint">Clique na foto para alterar</small>
        </div>
      </section>

      <form className="profile-name-form" onSubmit={saveProfile}>
        <label>
          Nome público
          <input
            required
            minLength="2"
            maxLength="80"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Como você quer aparecer nos artigos?"
          />
        </label>
        <button className="button button-secondary" disabled={savingProfile} type="submit">
          {savingProfile ? 'Salvando...' : 'Salvar perfil'}
        </button>
      </form>

      {!isEmailVerified && (
        <div className="verification-box">
          <strong>Confirme seu e-mail para escrever artigos</strong>
          <p>Enviamos um link de confirmação para <b>{user.email}</b>. A submissão ficará bloqueada até a confirmação.</p>
          <div className="profile-actions">
            <button className="button button-primary" onClick={verify} type="button">
              Já confirmei meu e-mail
            </button>
            <button className="button button-secondary" onClick={resend} type="button">
              Reenviar e-mail
            </button>
          </div>
        </div>
      )}

      {message && <p className="form-message" role="status">{message}</p>}

      <section className="profile-actions">
        <button className="button button-primary" disabled={!isEmailVerified} onClick={() => go('/submeter')} type="button">
          Escrever novo artigo
        </button>
        <button className="button button-secondary" onClick={() => go(`/escritor/${user.uid}`)} type="button">
          Ver perfil público
        </button>
        <button
          className="button button-secondary"
          onClick={() => {
            if (!window.__unsavedArticle || window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
              onLogout();
            }
          }}
          type="button"
        >
          Sair da conta
        </button>
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
        {!articlesLoading && !articlesError && !myArticles.length && (
          <p className="empty-state">Você ainda não enviou nenhum artigo.</p>
        )}
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
