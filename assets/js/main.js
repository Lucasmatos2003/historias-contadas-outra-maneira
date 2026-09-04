document.addEventListener('DOMContentLoaded', () => {
  const siteData = window.siteData;
  const page = document.body.dataset.page;
  const articles = siteData?.articles || [];
  const storageKey = 'historias-contadas-preferences';
  const preferences = JSON.parse(localStorage.getItem(storageKey) || '{}');

  const yearNode = document.querySelector('#year');
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  function savePreferences() {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }

  function createArticleLink(article) {
    return `artigo.html?slug=${encodeURIComponent(article.slug)}`;
  }

  function getArticleBySlug(slug) {
    return articles.find((article) => article.slug === slug) || articles[0];
  }

  function isFavorite(slug) {
    return Array.isArray(preferences.favorites) && preferences.favorites.includes(slug);
  }

  function toggleFavorite(slug) {
    preferences.favorites = Array.isArray(preferences.favorites) ? preferences.favorites : [];
    preferences.favorites = isFavorite(slug)
      ? preferences.favorites.filter((favorite) => favorite !== slug)
      : [...preferences.favorites, slug];
    savePreferences();
    document.querySelectorAll(`[data-favorite="${slug}"]`).forEach((button) => {
      const active = isFavorite(slug);
      button.classList.toggle('is-favorite', active);
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? '★ Salvo' : '☆ Salvar';
    });
  }

  function articleCard(article, index = 0) {
    return `
      <article class="story-card ${index === 0 ? 'large-card' : ''}">
        <div>
          <span class="tag">${article.category}</span>
          <h4><a href="${createArticleLink(article)}">${article.title}</a></h4>
          <p>${article.excerpt}</p>
        </div>
        <div class="card-footer">
          <div class="meta-row small"><span>${article.readingTime}</span><span>${article.date}</span></div>
          <button class="save-button ${isFavorite(article.slug) ? 'is-favorite' : ''}" data-favorite="${article.slug}" aria-pressed="${isFavorite(article.slug)}">${isFavorite(article.slug) ? '★ Salvo' : '☆ Salvar'}</button>
        </div>
      </article>
    `;
  }

  function renderFeaturedArticle() {
    const featured = articles.find((article) => article.featured) || articles[0];
    const container = document.getElementById('featured-article');
    if (!container || !featured) return;

    container.innerHTML = `
      <div class="hero-copy">
        <p class="eyebrow">Artigo principal</p>
        <h2>${featured.title}</h2>
        <p>${featured.excerpt}</p>
        <div class="meta-row"><span>Por ${featured.author}</span><span>${featured.readingTime} de leitura</span></div>
        <a class="button button-primary" href="${createArticleLink(featured)}">Ler artigo</a>
      </div>
      <div class="hero-visual" aria-label="Arte do artigo principal">
        <div class="visual-card" style="background-image: linear-gradient(180deg, rgba(8,18,26,0.25), rgba(7,11,17,0.8)), url('${featured.image}')">
          <span>${featured.category}</span><strong>Impérios que não foram</strong>
        </div>
      </div>
    `;
  }

  function renderLatestArticles() {
    const container = document.getElementById('latest-articles');
    if (!container) return;
    const featured = articles.find((article) => article.featured) || articles[0];
    container.innerHTML = articles.filter((article) => article.slug !== featured?.slug).slice(0, 4).map(articleCard).join('');
  }

  function renderCategoryArticles() {
    const container = document.getElementById('category-articles');
    const categorySlug = document.body.dataset.category;
    if (!container || !categorySlug) return;
    const filtered = articles.filter((article) => article.categorySlug === categorySlug);
    container.innerHTML = filtered.map(articleCard).join('');
    setupCategoryTools(filtered);
  }

  function setupCategoryTools(categoryArticles) {
    const intro = document.querySelector('.page-intro');
    const grid = document.getElementById('category-articles');
    if (!intro || !grid || document.querySelector('.category-tools')) return;
    const tools = document.createElement('div');
    tools.className = 'category-tools';
    tools.innerHTML = `
      <label class="search-field"><span>Pesquisar nesta categoria</span><input type="search" placeholder="Digite um título ou tema" aria-label="Pesquisar nesta categoria"></label>
      <select aria-label="Ordenar artigos"><option value="recent">Mais recentes</option><option value="reading">Leitura mais curta</option><option value="title">Ordem alfabética</option></select>
    `;
    intro.appendChild(tools);
    const search = tools.querySelector('input');
    const sort = tools.querySelector('select');
    const update = () => {
      const query = search.value.toLowerCase().trim();
      let result = categoryArticles.filter((article) => `${article.title} ${article.excerpt}`.toLowerCase().includes(query));
      if (sort.value === 'title') result = [...result].sort((a, b) => a.title.localeCompare(b.title));
      if (sort.value === 'reading') result = [...result].sort((a, b) => parseInt(a.readingTime, 10) - parseInt(b.readingTime, 10));
      grid.innerHTML = result.length ? result.map(articleCard).join('') : '<p class="empty-state">Nenhum artigo encontrado.</p>';
    };
    search.addEventListener('input', update);
    sort.addEventListener('change', update);
  }

  function renderArticlePage() {
    const articleRoot = document.getElementById('article-content');
    const relatedRoot = document.getElementById('related-links');
    const currentArticle = getArticleBySlug(new URLSearchParams(window.location.search).get('slug'));
    if (!currentArticle) return;

    if (articleRoot) {
      document.title = `${currentArticle.title} | Histórias Contadas de Outra Maneira`;
      articleRoot.innerHTML = `
        <div class="article-header">
          <p class="eyebrow">${currentArticle.category}</p><h2>${currentArticle.title}</h2>
          <div class="meta-row"><span>Por ${currentArticle.author}</span><span>${currentArticle.readingTime}</span><span>${currentArticle.date}</span></div>
          <button class="save-button article-save ${isFavorite(currentArticle.slug) ? 'is-favorite' : ''}" data-favorite="${currentArticle.slug}" aria-pressed="${isFavorite(currentArticle.slug)}">${isFavorite(currentArticle.slug) ? '★ Salvo' : '☆ Salvar artigo'}</button>
        </div>
        <div class="article-hero-image" style="background-image: url('${currentArticle.image}')"></div>
        <div class="article-body">${currentArticle.content.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>
      `;
    }
    if (relatedRoot) {
      relatedRoot.innerHTML = articles.filter((article) => article.slug !== currentArticle.slug).slice(0, 4)
        .map((article) => `<li><a href="${createArticleLink(article)}">${article.title}</a></li>`).join('');
    }
    setupReadingProgress();
  }

  function setupReadingProgress() {
    const progress = document.createElement('div');
    progress.className = 'reading-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function setupGlobalControls() {
    const header = document.querySelector('.site-header');
    const nav = document.querySelector('.main-nav');
    if (!header || !nav) return;
    const controls = document.createElement('div');
    controls.className = 'header-controls';
    controls.innerHTML = '<button class="icon-button search-trigger" aria-label="Abrir busca">⌕</button><button class="icon-button theme-toggle" aria-label="Alternar tema">◐</button><button class="icon-button menu-toggle" aria-label="Abrir menu">☰</button>';
    header.appendChild(controls);

    const overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.innerHTML = '<div class="search-dialog" role="dialog" aria-modal="true" aria-label="Busca"><button class="search-close" aria-label="Fechar busca">×</button><h2>Pesquisar histórias</h2><input type="search" placeholder="Digite um título, tema ou categoria" autofocus><div class="search-results"></div></div>';
    document.body.appendChild(overlay);
    const searchInput = overlay.querySelector('input');
    const results = overlay.querySelector('.search-results');
    const renderSearch = () => {
      const query = searchInput.value.toLowerCase().trim();
      const matches = query ? articles.filter((article) => `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(query)).slice(0, 6) : [];
      results.innerHTML = matches.map((article) => `<a href="${createArticleLink(article)}"><strong>${article.title}</strong><span>${article.category} · ${article.readingTime}</span></a>`).join('') || (query ? '<p class="empty-state">Nenhuma história encontrada.</p>' : '<p class="search-hint">Comece digitando uma palavra-chave.</p>');
    };
    controls.querySelector('.search-trigger').addEventListener('click', () => { overlay.classList.add('is-open'); searchInput.focus(); });
    overlay.querySelector('.search-close').addEventListener('click', () => overlay.classList.remove('is-open'));
    overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.classList.remove('is-open'); });
    searchInput.addEventListener('input', renderSearch);

    const themeToggle = controls.querySelector('.theme-toggle');
    if (preferences.theme === 'light') document.body.classList.add('light-theme');
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      preferences.theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
      savePreferences();
    });
    controls.querySelector('.menu-toggle').addEventListener('click', () => {
      nav.classList.toggle('is-open');
      controls.querySelector('.menu-toggle').setAttribute('aria-expanded', String(nav.classList.contains('is-open')));
    });
  }

  document.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-favorite]');
    if (favoriteButton) toggleFavorite(favoriteButton.dataset.favorite);
  });

  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const button = form.querySelector('button');
      if (!button) return;
      const originalText = button.textContent;
      button.textContent = 'Enviado';
      button.disabled = true;
      setTimeout(() => { button.textContent = originalText; button.disabled = false; form.reset(); }, 1400);
    });
  });

  setupGlobalControls();
  if (page === 'home') { renderFeaturedArticle(); renderLatestArticles(); }
  if (page === 'category') renderCategoryArticles();
  if (page === 'article') renderArticlePage();
});
