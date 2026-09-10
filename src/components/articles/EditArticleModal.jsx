import React, { useState, useEffect } from 'react';
import { getAccessToken } from '../../supabase';
import { ImageUploadField } from './ImageUploadField';

export function EditArticleModal({ article, onClose, onUpdated }) {
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
              <option value="curiosidades-geradas">Curiosidades Históricas</option>
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
