import React, { useEffect, useState } from 'react';
import { articles } from './data';
import { getAccessToken, supabase } from './supabase';
import { useAuth } from './hooks/useAuth';
import { getPath } from './hooks/useNavigation';
import { formatSupabaseArticle } from './utils/articleUtils';
import { Layout } from './components/layout/Layout';
import { LoadingState } from './components/ui/LoadingState';
import { Home } from './pages/Home';
import { Category } from './pages/Category';
import { Article } from './pages/Article';
import { StaticPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { AuthPage } from './pages/AuthPage';
import { Profile } from './pages/Profile';
import { SubmitArticle } from './pages/SubmitArticle';
import { ReviewAdmin } from './pages/ReviewAdmin';
import { PublicWriter } from './pages/PublicWriter';
import { NotFound } from './pages/NotFound';

export function App() {
  const { user, profile, loading, refreshUser, updateProfileState } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [, refresh] = useState(0);
  const [allArticles, setAllArticles] = useState(articles);

  const loadArticles = async () => {
    try {
      let publicRows = null;
      const response = await fetch('/api/articles/public').catch(() => null);
      if (response && response.ok) {
        const result = await response.json();
        if (Array.isArray(result.articles)) {
          publicRows = result.articles;
        }
      }
      if (!publicRows && supabase) {
        const { data } = await supabase
          .from('articles')
          .select('id, title, excerpt, content, category, author_name, author_uid, cover_image, status, created_at')
          .eq('status', 'aprovado')
          .order('created_at', { ascending: false });
        if (Array.isArray(data)) {
          publicRows = data;
        }
      }
      if (Array.isArray(publicRows)) {
        const formatted = publicRows.map(formatSupabaseArticle);
        const combined = [
          ...formatted,
          ...articles.filter((a) => !formatted.some((f) => f.slug === a.slug || f.slugBase === a.slug))
        ];
        setAllArticles(combined);
      }
    } catch (err) {
      console.error('Erro ao carregar artigos:', err);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const path = getPath();

  useEffect(() => {
    loadArticles();
  }, [path]);

  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      setIsAdmin(false);
      return undefined;
    }
    getAccessToken()
      .then((token) => fetch('/api/admin/access', { headers: { Authorization: `Bearer ${token}` } }))
      .then((response) => (response.ok ? response.json() : { isAdmin: false }))
      .then((result) => {
        if (active) setIsAdmin(Boolean(result.isAdmin));
      })
      .catch(() => {
        if (active) setIsAdmin(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const registrationSuccess = new URLSearchParams(window.location.search).get('cadastro') === 'sucesso';
  const isEmailVerified = Boolean(user?.emailVerified || profile?.role === 'admin' || isAdmin);

  if (loading) {
    return (
      <Layout articles={allArticles} profile={profile} isAdmin={false}>
        <main className="container single-page">
          <section className="contact-card">
            <LoadingState label="Carregando sua conta..." />
          </section>
        </main>
      </Layout>
    );
  }

  let content = <Home articles={allArticles} user={user} />;
  if (path.startsWith('/categoria/')) {
    content = <Category slug={path.split('/')[2]} articles={allArticles} />;
  } else if (path.startsWith('/artigo/')) {
    content = <Article slug={path.split('/')[2]} articles={allArticles} user={user} />;
  } else if (path === '/sobre') {
    content = <StaticPage type="sobre" />;
  } else if (path === '/contato') {
    content = <ContactPage />;
  } else if (path === '/politica-de-privacidade' || path === '/privacidade') {
    content = <PrivacyPolicyPage />;
  } else if (path === '/login') {
    content = user ? (
      <Profile
        user={user}
        profile={profile}
        isAdmin={isAdmin}
        onVerified={refreshUser}
        onProfileUpdated={updateProfileState}
        onLogout={() => supabase.auth.signOut()}
      />
    ) : (
      <AuthPage />
    );
  } else if (path === '/cadastro') {
    content = user ? (
      <Profile
        user={user}
        profile={profile}
        isAdmin={isAdmin}
        onVerified={refreshUser}
        onProfileUpdated={updateProfileState}
        onLogout={() => supabase.auth.signOut()}
      />
    ) : (
      <AuthPage mode="register" />
    );
  } else if (path === '/perfil') {
    content = user ? (
      <Profile
        user={user}
        profile={profile}
        isAdmin={isAdmin}
        registrationSuccess={registrationSuccess}
        onVerified={refreshUser}
        onProfileUpdated={updateProfileState}
        onLogout={() => supabase.auth.signOut()}
      />
    ) : (
      <AuthPage registrationSuccess={registrationSuccess} />
    );
  } else if (path === '/submeter') {
    content = user ? (
      isEmailVerified ? (
        <SubmitArticle user={user} />
      ) : (
        <Profile
          user={user}
          profile={profile}
          isAdmin={isAdmin}
          onVerified={refreshUser}
          onProfileUpdated={() => refresh((value) => value + 1)}
          onLogout={() => supabase.auth.signOut()}
        />
      )
    ) : (
      <AuthPage />
    );
  } else if (path === '/admin') {
    content = user ? <ReviewAdmin user={user} onArticleApproved={loadArticles} /> : <AuthPage />;
  } else if (path.startsWith('/escritor/')) {
    content = <PublicWriter uid={path.split('/')[2]} />;
  } else if (
    !['/', '/login', '/cadastro', '/perfil', '/submeter', '/admin', '/politica-de-privacidade', '/privacidade'].includes(
      path
    )
  ) {
    content = <NotFound />;
  }

  return (
    <Layout
      articles={allArticles}
      user={user}
      profile={profile}
      isAdmin={isAdmin}
      onLogout={() => supabase.auth.signOut()}
    >
      {content}
    </Layout>
  );
}

export default App;
