import React, { useEffect } from 'react';
import { useNavigation } from '../hooks/useNavigation';

export function PrivacyPolicyPage() {
  const go = useNavigation();

  useEffect(() => {
    document.title = 'Política de Privacidade | Histórias Contadas de Outra Maneira';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <main className="container single-page">
      <article className="contact-card legal-document">
        <p className="eyebrow">Transparência e Conformidade</p>
        <h2>Política de Privacidade</h2>
        <p className="legal-updated">Última atualização: Setembro de 2026</p>

        <section className="legal-section">
          <h3>1. Introdução e Compromisso</h3>
          <p>A revista digital <strong>Histórias Contadas de Outra Maneira</strong> tem o compromisso de proteger a privacidade, a segurança e a transparência no tratamento dos dados pessoais de seus leitores, colaboradores e escritores, em estrita conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong> e demais legislações aplicáveis.</p>
        </section>

        <section className="legal-section">
          <h3>2. Coleta de Informações</h3>
          <p>Coletamos informações nas seguintes circunstâncias:</p>
          <ul>
            <li><strong>Navegação geral:</strong> Dados anônimos de acesso (endereço IP resumido, tipo de navegador, páginas visualizadas e tempo de permanência) para aprimoramento da experiência editorial.</li>
            <li><strong>Cadastro de Escritores e Submissão:</strong> Nome público de autor, endereço de e-mail e biografia fornecidos voluntariamente para criação de conta e revisão de textos.</li>
            <li><strong>Mensagens de Contato:</strong> Nome, e-mail e conteúdo enviados espontaneamente através do formulário de contato da revista.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>3. Uso de Cookies e Google AdSense</h3>
          <p>Este site utiliza cookies para personalizar conteúdo, anúncios e analisar nosso tráfego:</p>
          <ul>
            <li><strong>Google AdSense:</strong> O Google, como fornecedor terceiro, utiliza cookies (incluindo o cookie DoubleClick DART) para veicular anúncios com base nas visitas anteriores dos usuários a este ou a outros sites na internet.</li>
            <li><strong>Desativação de Anúncios Personalizados:</strong> Os leitores podem desativar a publicidade personalizada acessando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Configurações de Anúncios do Google</a> ou visitando o portal <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">AboutAds.info</a>.</li>
            <li><strong>Google Analytics:</strong> Utilizamos o Google Analytics (código de acompanhamento G-Y7MQ743JVQ) para compreender de maneira agregada como o público interage com nossos artigos.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>4. Direitos do Titular (LGPD)</h3>
          <p>Em conformidade com a LGPD, todo usuário possui o direito de solicitar a qualquer momento a confirmação da existência de tratamento de dados, acesso aos seus dados pessoais, correção de dados incompletos ou inexatos, ou a exclusão definitiva de sua conta de escritor.</p>
        </section>

        <section className="legal-section">
          <h3>5. Contato sobre Privacidade</h3>
          <p>Para dúvidas, solicitações ou exercício de direitos referentes aos seus dados pessoais, entre em contato através da nossa página de <a href="/contato" onClick={(e) => { e.preventDefault(); go('/contato'); }}>Contato</a> ou pelo e-mail da equipe editorial.</p>
        </section>

        <div className="legal-actions">
          <a className="button button-secondary" href="/" onClick={(e) => { e.preventDefault(); go('/'); }}>Voltar para a Home</a>
        </div>
      </article>
    </main>
  );
}
