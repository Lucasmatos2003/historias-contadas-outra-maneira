import { useEffect, useState } from 'react';

export const getPath = () => window.location.pathname.replace(/\/+$/, '') || '/';
export const navigate = (url) => window.history.pushState({}, '', url);

export function useNavigation() {
  const [, refresh] = useState(0);
  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  return (url) => {
    if (window.__unsavedArticle && !window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) return;
    navigate(url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
}
