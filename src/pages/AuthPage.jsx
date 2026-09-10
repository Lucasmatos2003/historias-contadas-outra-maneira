import React, { useState } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { supabase, isConfigured, getAccessToken } from '../supabase';
import { AuthNotice } from '../components/ui/AuthNotice';

export function AuthPage({ mode = 'login', registrationSuccess = false }) {
  const go = useNavigation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';

  const submit = async (event) => {
    event.preventDefault();
    if (!supabase) return setError('Configure primeiro o Supabase.');
    setLoading(true);
    setError('');

    try {
      let user;
      if (isLogin) {
        const result = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (result.error) throw result.error;
        user = result.data.user;
      } else {
        const result = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { display_name: form.name.trim() } }
        });
        if (result.error) throw result.error;
        user = result.data.user;
        if (result.data.session) {
          const token = await getAccessToken();
          const profileResponse = await fetch('/api/profiles/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ displayName: form.name.trim() })
          });
          if (!profileResponse.ok) throw new Error('Não foi possível salvar o perfil.');
        }
      }
      if (!user) throw new Error('Não foi possível criar a conta.');
      go(isLogin ? '/perfil' : '/perfil?cadastro=sucesso');
    } catch (submitError) {
      const messages = {
        user_already_exists: 'Este e-mail já possui uma conta. Use “Já tenho uma conta” para entrar.',
        invalid_credentials: 'E-mail ou senha incorretos.',
        email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
        email_address_invalid: 'Informe um e-mail válido.',
        weak_password: 'A senha precisa ter pelo menos 6 caracteres.',
        over_request_rate_limit: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
        auth_network_request_failed: 'Não foi possível conectar ao Supabase. Verifique sua internet.'
      };
      setError(messages[submitError.code] || submitError.message || 'Não foi possível concluir. Verifique seus dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container single-page">
      <section className="contact-card auth-card">
        <p className="eyebrow">Área do escritor</p>
        <h2>{isLogin ? 'Entrar na sua conta' : 'Criar cadastro de escritor'}</h2>
        {!isLogin && (
          <p className="writer-auth-intro">
            Publique suas histórias contrafatuais e participe da seleção para os roteiros em vídeo do canal oficial <strong>Alternativa História</strong> no YouTube!
          </p>
        )}
        {registrationSuccess && (
          <p className="success-message" role="status">Cadastro feito com sucesso! Confirme seu e-mail antes de entrar.</p>
        )}
        {!isConfigured && <AuthNotice />}
        <form className="contact-form" onSubmit={submit}>
          {!isLogin && (
            <label>
              Nome público
              <input
                required
                minLength="2"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
          )}
          <label>
            E-mail
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            Senha
            <input
              required
              minLength="6"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          {error && <p className="form-message" role="alert">{error}</p>}
          <button className="button button-primary" disabled={loading || !isConfigured} type="submit">
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
        <button className="text-button" onClick={() => go(isLogin ? '/cadastro' : '/login')} type="button">
          {isLogin ? 'Ainda não tenho cadastro' : 'Já tenho uma conta'}
        </button>
      </section>
    </main>
  );
}
