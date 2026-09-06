# Histórias Contadas de Outra Maneira

Blog e portal de conteúdo construído com React + Vite, com foco em história alternativa, eventos históricos fascinantes e curiosidades do mundo.

## Estrutura do projeto

- `src/main.jsx` — aplicação React, navegação, componentes e interações.
- `src/data.js` — catálogo central de categorias e artigos.
- `src/responsive.css` — ajustes específicos da camada React.
- `assets/css/style.css` — estilo visual do projeto.
- `api/` — funções serverless da Vercel para submissão, pagamento e webhook.
- `package.json` — scripts e dependências do projeto.
- `vite.config.js` — configuração do Vite.

## Recursos incluídos

- Busca global com resultados instantâneos.
- Filtro e ordenação nas páginas de categoria.
- Favoritos persistidos no navegador com `localStorage`.
- Alternância entre tema escuro e claro.
- Menu responsivo para dispositivos móveis.
- Barra de progresso de leitura nos artigos.
- Layout preparado para áreas de publicidade.

## Rotas disponíveis

- `/` — página inicial.
- `/categoria/historia-alternativa` — categoria de história alternativa.
- `/categoria/curiosidades-geradas` — categoria de curiosidades.
- `/artigo/:slug` — leitura individual de um artigo.
- `/sobre` — sobre o autor.
- `/contato` — formulário de contato.
- `/admin` — painel administrativo protegido para revisar artigos do Firestore.
- `/submeter` — submissão com validação e cobrança Pix de R$ 5,00.
- `/login` e `/cadastro` — autenticação de leitores e escritores.
- `/perfil` — perfil do escritor autenticado.
- `/escritor/:uid` — perfil público com artigos aprovados do escritor.

## Como visualizar

A partir da pasta do projeto, instale as dependências e rode:

```bash
npm install
npm run dev
```

Depois acesse `http://localhost:5173`.

Para gerar a versão de produção:

```bash
npm run build
```

O script de build chama o Vite diretamente pelo Node para evitar problemas de permissão do executável `.bin` em ambientes Linux de CI/CD.

## Painel administrativo

O `/admin` exige login no Firebase e valida o UID do token no servidor contra `ADMIN_UID`. Configure essa variável com o UID da conta administrativa em todos os ambientes da Vercel. O painel lista os artigos reais do Firestore, permite filtrar por status, aprovar e rejeitar textos; rejeições exigem uma justificativa que aparece no perfil do escritor.

Para descobrir o UID, abra **Firebase Console > Authentication > Users**, copie o UID do administrador e salve-o como `ADMIN_UID`. Não confie em um campo `role` enviado pelo navegador: a autorização é sempre feita no endpoint server-side.

## Deploy

O projeto já inclui `netlify.toml` e `vercel.json`. No Netlify ou Vercel, use o repositório como origem; o build será executado com `npm run build` e a pasta publicada será `dist`.

## Submissão paga via Pix

O fluxo de `/submeter` grava o artigo como `pendente_pagamento` no Cloud Firestore, cria uma cobrança Pix no Mercado Pago, exibe QR Code/Copia e Cola e consulta o status até o webhook ou polling confirmar o pagamento. Os tokens e credenciais ficam somente nas funções serverless.

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/), ative o Cloud Firestore e gere uma conta de serviço.
2. Configure as variáveis de [.env.example](./.env.example) no Vercel. Preserve as quebras de linha da chave privada usando `\n`.
3. Configure o endpoint do webhook como `/api/payments/webhook` no Mercado Pago e salve o segredo de assinatura em `MERCADOPAGO_WEBHOOK_SECRET`.

### Login e perfil do escritor

Para ativar o login:

1. No Firebase Console, abra **Authentication > Sign-in method** e ative **E-mail/senha**.
2. Em **Configurações do projeto > Seus apps**, registre um aplicativo Web e copie as seis configurações para as variáveis `VITE_FIREBASE_*` do `.env.example`.
3. Cadastre essas variáveis na Vercel nos ambientes Production, Preview e Development.

O cadastro cria um perfil na coleção `profiles` com a função `writer`. A rota `/submeter` exige login e envia o token do Firebase ao backend antes de aceitar o artigo. A cobrança continua dependendo da configuração do Mercado Pago.

A submissão aceita uma URL HTTPS opcional para a imagem de capa. O servidor valida o formato antes de salvar, registra o nome público do autor no artigo e disponibiliza os textos aprovados no perfil público do escritor.

O cadastro também envia um link de verificação para o e-mail informado. A área de submissão permanece bloqueada até o usuário clicar nesse link. Para testar, use um endereço que você controla e confira também a pasta de spam. O Firebase permite personalizar o remetente e o texto em **Authentication > Templates > Email address verification**.

O valor de R$ 5,00 está fixado no endpoint de submissão para evitar que o cliente altere o preço. Em produção, adicione autenticação, rate limiting e validação da assinatura do webhook antes de abrir o fluxo ao público.

As APIs autenticadas aplicam limites de requisições, validam o tamanho e o formato dos campos no servidor e não devolvem detalhes internos de Firebase ou Firestore. O painel administrativo exige o `ADMIN_UID`; usuários escritores não conseguem listar ou alterar artigos pela API administrativa. O rate limiting atual usa a memória da função serverless; para escalar horizontalmente, substitua o armazenamento por Vercel KV ou Redis compartilhado.

Enquanto `MERCADOPAGO_ACCESS_TOKEN` não estiver configurado, o modo temporário salva os artigos diretamente como `pendente_revisao`, sem cobrança. A conta cujo UID corresponde a `ADMIN_UID` também é isenta da taxa e entra diretamente em revisão. Se a criação da cobrança falhar, o artigo é marcado como `pagamento_erro`, evitando registros presos em `pendente_pagamento`. Webhooks sem assinatura válida são rejeitados.
## Deploy na Hostinger

Este projeto usa um servidor Node próprio para servir o `dist/` e encaminhar as rotas `/api/...` para os handlers do Firebase e Mercado Pago.

Configure a aplicação Node com:

- Diretório raiz: `./`
- Arquivo de inicialização: `server.js`
- Comando de build: `npm run build`
- Comando de inicialização: `npm start`
- Versão do Node: 22.x
- Porta: use a variável `PORT` fornecida pela Hostinger

Após a implantação, verifique `https://seu-dominio/api/health`. A resposta esperada é `{"ok":true}`.

As variáveis server-side devem ser cadastradas no painel da Hostinger, sem aspas:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `ADMIN_UID`
- `PUBLIC_APP_URL=https://historiasdeoutramaneira.com.br`

As variáveis `VITE_FIREBASE_*` continuam sendo usadas no build do frontend.
