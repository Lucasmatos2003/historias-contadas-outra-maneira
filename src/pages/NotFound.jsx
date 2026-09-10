import React from 'react';
import { useNavigation } from '../hooks/useNavigation';

export function NotFound() {
  const go = useNavigation();

  return (
    <main className="container single-page">
      <section className="contact-card not-found-page">
        <p className="eyebrow">Erro 404</p>
        <h2>Página não encontrada</h2>
        <p>Esse caminho não existe ou foi movido. Volte para a página inicial e continue explorando.</p>
        <button className="button button-primary" onClick={() => go('/')} type="button">
          Voltar para a Home
        </button>
      </section>
    </main>
  );
}
