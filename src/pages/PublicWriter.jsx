import React, { useState, useEffect } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { NotFound } from './NotFound';
import { LoadingState } from '../components/ui/LoadingState';
import { Avatar } from '../components/ui/Avatar';

export function PublicWriter({ uid }) {
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

  if (loading) {
    return (
      <main className="container single-page">
        <section className="contact-card">
          <LoadingState label="Carregando perfil..." />
        </section>
      </main>
    );
  }

  if (error || !writer) return <NotFound />;

  return (
    <main className="container single-page writer-public-page">
      <section className="writer-public-hero">
        <Avatar name={writer.displayName} photoURL={writer.photoURL} />
        <div>
          <p className="eyebrow">Perfil público</p>
          <h2>{writer.displayName}</h2>
          <p>{writer.bio || 'Escritor colaborador da revista Histórias Contadas de Outra Maneira.'}</p>
        </div>
      </section>
      <section className="writer-public-articles">
        <div className="section-head">
          <div>
            <p className="eyebrow">Publicações</p>
            <h3>Artigos aprovados</h3>
          </div>
        </div>
        {!writer.articles.length && (
          <p className="empty-state">Este escritor ainda não possui artigos publicados.</p>
        )}
        {writer.articles.map((article) => (
          <article className="writer-public-card" key={article.id}>
            {article.cover_image && <img src={article.cover_image} alt="" />}
            <div>
              <span className="tag">{article.category}</span>
              <h4>{article.title}</h4>
              <p>{article.excerpt}</p>
              <small>
                {article.created_at ? new Date(article.created_at).toLocaleDateString('pt-BR') : 'Data pendente'}
              </small>
            </div>
          </article>
        ))}
      </section>
      <button className="button button-secondary" onClick={() => go('/')} type="button">
        Voltar para a Home
      </button>
    </main>
  );
}
