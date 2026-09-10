import React, { useState, useEffect } from 'react';
import { getAccessToken } from '../supabase';
import { ImageUploadField } from '../components/articles/ImageUploadField';

export function SubmitArticle({ user }) {
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
            {payment.qrCodeBase64 && (
              <img className="pix-qr" src={`data:image/png;base64,${payment.qrCodeBase64}`} alt="QR Code Pix para pagamento" />
            )}
            <label className="copy-field">
              Pix Copia e Cola
              <input readOnly value={payment.qrCode || ''} onFocus={(event) => event.target.select()} />
            </label>
            <button className="button button-primary" onClick={() => navigator.clipboard?.writeText(payment.qrCode || '')} type="button">
              Copiar código Pix
            </button>
            <span className="payment-status">Aguardando confirmação automática...</span>
          </div>
        </div>
      )}
    </main>
  );
}
