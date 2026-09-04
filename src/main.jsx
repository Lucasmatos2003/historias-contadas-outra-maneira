import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { articles, categoryInfo } from './data';
import '../assets/css/style.css';
import './responsive.css';

const getPath = () => window.location.pathname.replace(/\/+$/, '') || '/';
const navigate = (url) => window.history.pushState({}, '', url);

function useNavigation() {
  const [, refresh] = useState(0);
  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  return (url) => { navigate(url); window.dispatchEvent(new PopStateEvent('popstate')); };
}

function Layout({ children, articles }) {
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

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand-row brand-link" href="/" onClick={link('/')}>
          <span className="brand-mark">H</span>
          <span><span className="eyebrow">Revista digital</span><h1>Histórias Contadas de Outra Maneira</h1></span>
        </a>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegação principal">
          <a href="/" onClick={link('/')}>Home</a>
          <a href="/categoria/historia-alternativa" onClick={link('/categoria/historia-alternativa')}>História Alternativa</a>
          <a href="/categoria/curiosidades-geradas" onClick={link('/categoria/curiosidades-geradas')}>Curiosidades Geradas</a>
          <a href="/sobre" onClick={link('/sobre')}>Sobre</a>
          <a href="/contato" onClick={link('/contato')}>Contato</a>
          <a href="/submeter" onClick={link('/submeter')}>Submeter artigo</a>
        </nav>
        <div className="header-controls">
          <button className="icon-button" aria-label="Abrir busca" onClick={() => setSearchOpen(true)}>⌕</button>
          <button className="icon-button" aria-label="Alternar tema" onClick={() => setLight((value) => !value)}>◐</button>
          <button className="icon-button menu-toggle" aria-label="Abrir menu" onClick={() => setMenuOpen((value) => !value)}>☰</button>
        </div>
      </header>
      {children}
      <footer className="site-footer">© {new Date().getFullYear()} Histórias Contadas de Outra Maneira</footer>
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
  return <article className={`story-card ${index === 0 ? 'large-card' : ''}`}>
    <div><span className="tag">{article.category}</span><h4><a href={`/artigo/${article.slug}`} onClick={(event) => { event.preventDefault(); go(`/artigo/${article.slug}`); }}>{article.title}</a></h4><p>{article.excerpt}</p></div>
    <div className="card-footer"><div className="meta-row small"><span>{article.readingTime}</span><span>{article.date}</span></div><FavoriteButton slug={article.slug} /></div>
  </article>;
}

function Home({ articles }) {
  const featured = articles.find((article) => article.featured) || articles[0];
  return <main className="container home-layout"><div className="content-column">
    <section className="hero-article">
      <div className="hero-copy"><p className="eyebrow">Artigo principal</p><h2>{featured.title}</h2><p>{featured.excerpt}</p><div className="meta-row"><span>Por {featured.author}</span><span>{featured.readingTime} de leitura</span></div><a className="button button-primary" href={`/artigo/${featured.slug}`}>Ler artigo</a></div>
      <div className="hero-visual"><div className="visual-card" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,18,26,.25), rgba(7,11,17,.8)), url('${featured.image}')` }}><span>{featured.category}</span><strong>Impérios que não foram</strong></div></div>
    </section>
    <section className="section-head"><div><p className="eyebrow">Últimos textos</p><h3>Rumos não traçados</h3></div></section>
    <section className="article-grid">{articles.filter((article) => !article.featured).map((article, index) => <ArticleCard key={article.slug} article={article} index={index} />)}</section>
    <section className="quick-curiosities"><div className="section-head"><div><p className="eyebrow">Curiosidades rápidas</p><h3>Fatos que desafiam a lógica</h3></div></div><div className="facts-list">{['Existiram cidades inteiras que mudaram de país sem que ninguém percebesse no momento.', 'Alguns inventos militares parecem ter sido criados antes de suas épocas por pura coincidência.', 'As rotas comerciais mais lucrativas nem sempre eram as mais visíveis nos mapas.'].map((fact, index) => <div className="fact-item" key={fact}><span className="fact-number">0{index + 1}</span><p>{fact}</p></div>)}</div></section>
  </div><Sidebar /></main>;
}

function Sidebar() {
  return <aside className="sidebar-column"><div className="ad-slot ad-large"><span>Banner / anúncio</span><strong>Espaço para publicidade</strong></div><div className="sidebar-panel"><p className="eyebrow">Categorias</p><ul className="side-list"><li><a href="/categoria/historia-alternativa">História Alternativa</a></li><li><a href="/categoria/curiosidades-geradas">Curiosidades Geradas</a></li><li><a href="/sobre">Sobre o Autor</a></li><li><a href="/contato">Contato</a></li></ul></div><div className="ad-slot ad-small"><span>Google AdSense</span><strong>Área reservada para anúncios</strong></div></aside>;
}

function Category({ slug, articles }) {
  const info = categoryInfo[slug];
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const filtered = useMemo(() => {
    const value = articles.filter((article) => article.categorySlug === slug && `${article.title} ${article.excerpt}`.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'title') return [...value].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'reading') return [...value].sort((a, b) => parseInt(a.readingTime) - parseInt(b.readingTime));
    return value;
  }, [articles, query, sort, slug]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [query, sort, slug]);
  return <main className="container category-page"><section className="page-intro"><p className="eyebrow">Categoria</p><h2>{info?.name || 'Categoria'}</h2><p>{info?.description || 'Explore as histórias publicadas.'} Neste espaço, indícios, hipóteses e cenários possíveis redefinem o rastro das civilizações.</p><div className="category-tools"><label className="search-field"><span>Pesquisar nesta categoria</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Digite um título ou tema" /></label><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar artigos"><option value="recent">Mais recentes</option><option value="reading">Leitura mais curta</option><option value="title">Ordem alfabética</option></select></div></section><section className="article-grid category-grid">{visible.map((article, index) => <ArticleCard key={article.slug} article={article} index={index} />)}</section>{filtered.length > pageSize && <nav className="pagination" aria-label="Paginação">{Array.from({ length: totalPages }, (_, index) => <button key={index + 1} className={page === index + 1 ? 'active' : ''} onClick={() => setPage(index + 1)}>{index + 1}</button>)}</nav>}</main>;
}

function Article({ slug, articles }) {
  const article = articles.find((item) => item.slug === slug) || articles[0];
  useEffect(() => { document.title = `${article.title} | Histórias Contadas de Outra Maneira`; }, [article]);
  return <main className="container article-layout"><article className="article-content-panel"><div className="article-header"><p className="eyebrow">{article.category}</p><h2>{article.title}</h2><div className="meta-row"><span>Por {article.author}</span><span>{article.readingTime}</span><span>{article.date}</span></div><FavoriteButton slug={article.slug} /></div><div className="article-hero-image" style={{ backgroundImage: `url('${article.image}')` }} /><div className="article-body">{article.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article><Sidebar /></main>;
}

function Admin({ articles, onChange }) {
  const empty = { title: '', excerpt: '', category: 'História Alternativa', readingTime: '5 min', author: 'Helena Voss', content: '' };
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

function SubmitArticle() {
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', category: 'historia-alternativa', authorEmail: '' });
  const [payment, setPayment] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!payment?.articleId) return undefined;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/articles/status?id=${encodeURIComponent(payment.articleId)}`);
      if (!response.ok) return;
      const result = await response.json();
      if (result.status === 'pendente_revisao') {
        window.clearInterval(timer);
        setPayment(null);
        setMessage('Pagamento confirmado. Seu artigo foi enviado para a fila de revisão.');
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [payment?.articleId]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/articles/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível gerar a cobrança.');
      setPayment(result);
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
      <form className="contact-form" onSubmit={submit}>
        <label>Título<input required minLength="10" maxLength="160" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
        <label>E-mail do autor<input required type="email" value={form.authorEmail} onChange={(event) => setForm({ ...form, authorEmail: event.target.value })} /></label>
        <label>Categoria<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="historia-alternativa">História Alternativa</option><option value="curiosidades-geradas">Curiosidades Geradas</option></select></label>
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

function StaticPage({ type }) {
  if (type === 'sobre') return <main className="container single-page"><section className="about-hero"><div className="author-photo"><span>HV</span></div><div className="author-copy"><p className="eyebrow">Sobre o autor</p><h2>Helena Voss</h2><p>Escritora, pesquisadora e analista de história, Helena investiga os pontos de inflexão que mudaram o rumo do mundo.</p></div></section><section className="about-story"><p>Seu trabalho combina investigação documental, leitura crítica e curiosidade por tudo aquilo que ficou fora da versão oficial.</p></section></main>;
  return <main className="container single-page"><section className="contact-card"><p className="eyebrow">Contato</p><h2>Parcerias, sugestões e mensagens dos leitores</h2><form className="contact-form" onSubmit={(event) => { event.preventDefault(); alert('Mensagem enviada.'); }}><label>Nome<input required name="nome" placeholder="Seu nome" /></label><label>E-mail<input required type="email" name="email" placeholder="Seu e-mail" /></label><label>Mensagem<textarea required name="mensagem" rows="5" placeholder="Escreva sua mensagem" /></label><button className="button button-primary" type="submit">Enviar mensagem</button></form></section></main>;
}

function App() {
  const [, refresh] = useState(0);
  const [localArticles, setLocalArticles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cms-articles')) || articles; } catch { return articles; }
  });
  useEffect(() => {
    localStorage.setItem('cms-articles', JSON.stringify(localArticles));
    const update = () => refresh((value) => value + 1);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, [localArticles]);
  const path = getPath();
  let content = <Home articles={localArticles} />;
  if (path.startsWith('/categoria/')) content = <Category slug={path.split('/')[2]} articles={localArticles} />;
  else if (path.startsWith('/artigo/')) content = <Article slug={path.split('/')[2]} articles={localArticles} />;
  else if (path === '/sobre') content = <StaticPage type="sobre" />;
  else if (path === '/contato') content = <StaticPage type="contato" />;
  else if (path === '/submeter') content = <SubmitArticle />;
  else if (path === '/admin') content = <Admin articles={localArticles} onChange={setLocalArticles} />;
  return <Layout articles={localArticles}>{content}</Layout>;
}

createRoot(document.getElementById('root')).render(<App />);
