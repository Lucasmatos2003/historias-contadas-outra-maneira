import React from 'react';

export function AboutPage() {
  return (
    <main className="container single-page">
      <section className="about-hero">
        <div className="author-photo" role="img" aria-label="Foto de Lucas David Carvalho Vieira de Matos" />
        <div className="author-copy">
          <p className="eyebrow">Sobre o criador</p>
          <h2>Lucas David Carvalho Vieira de Matos</h2>
          <p>Recém-formado em Ciência da Computação e apaixonado por história desde a escola, Lucas une tecnologia e narrativa para explorar os caminhos que a história não tomou.</p>
        </div>
      </section>
      <section className="about-story">
        <p>A ideia de dar vida a este blog nasceu de uma vontade muito simples, mas inegavelmente poderosa: unir duas grandes paixões que sempre caminharam lado a lado na minha trajetória. Desde a época da escola, a história sempre foi a disciplina que mais capturava a minha atenção e despertava minha curiosidade. Porém, o que realmente me fascinava nunca foi apenas memorizar datas ou aceitar o curso natural dos eventos, mas sim questionar as infinitas possibilidades do que poderia ter acontecido. Aquele famoso e intrigante "e se?" sempre funcionou como o verdadeiro motor da minha imaginação, transformando fatos consumados em universos inteiros de possibilidades inexploradas.</p>
        <p>Depois de se formar em Ciência da Computação, Lucas criou o <strong>Histórias Contadas de Outra Maneira</strong> para ser um espaço aberto: um lugar onde ele mesmo pudesse escrever, mas também onde outras pessoas pudessem trazer suas próprias versões e hipóteses sobre o passado.</p>
        <p>Espero que gostem e se divirtam tanto quanto eu me divirto pensando nesses outros caminhos que a história poderia ter tomado!</p>
      </section>
    </main>
  );
}

export function StaticPage({ type }) {
  if (type === 'sobre') {
    return <AboutPage />;
  }
  return null;
}
