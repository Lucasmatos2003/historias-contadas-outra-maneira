import React from 'react';

export function AuthNotice() {
  return (
    <div className="auth-notice" role="status">
      O login ainda não foi configurado no Supabase. Crie um projeto e adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.
    </div>
  );
}
