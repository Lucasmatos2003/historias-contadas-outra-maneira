import React, { useState } from 'react';

export function ContactPage() {
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
