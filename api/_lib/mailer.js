import nodemailer from 'nodemailer';

const SITE_NAME = 'Histórias Contadas de Outra Maneira';
const CONTACT_EMAIL = 'contato@historiasdeoutramaneira.com.br';

/**
 * Retorna um transporter Nodemailer configurado via SMTP da Hostinger.
 * Se as variáveis não estiverem definidas, retorna null (modo degradado).
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: 465,
    secure: true, // SSL
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' }
  });
}

/**
 * Envia um e-mail.
 * @param {{ to: string, subject: string, html: string, replyTo?: string }} options
 * @returns {Promise<boolean>} true se enviado, false se SMTP não configurado
 */
async function sendMail({ to, subject, html, replyTo }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[mailer] SMTP não configurado. E-mail não enviado:', { to, subject });
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${CONTACT_EMAIL}>`,
      to,
      subject,
      html,
      replyTo: replyTo || CONTACT_EMAIL
    });
    return true;
  } catch (error) {
    // Não deixa o erro de e-mail derrubar a operação principal
    console.error('[mailer] Falha ao enviar e-mail:', error?.message || error);
    return false;
  }
}

/**
 * Template base HTML para e-mails do site.
 */
function emailTemplate({ title, preheader, body }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0f; font-family: 'Segoe UI', Arial, sans-serif; color: #e0e0e0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .header { background: linear-gradient(135deg, #1a0a2e 0%, #16213e 100%); border-radius: 12px 12px 0 0; padding: 32px 32px 24px; text-align: center; border-bottom: 2px solid #7c3aed; }
    .brand-mark { display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 50%; font-size: 22px; font-weight: 900; color: #fff; line-height: 48px; text-align: center; margin-bottom: 12px; }
    .brand-name { font-size: 15px; font-weight: 700; color: #a78bfa; letter-spacing: 0.05em; text-transform: uppercase; margin: 0; }
    .card { background: #13131a; border-radius: 0 0 12px 12px; padding: 32px; border: 1px solid #2a2a3a; border-top: none; }
    h1 { font-size: 22px; font-weight: 800; color: #f3f4f6; margin: 0 0 16px; line-height: 1.3; }
    p { font-size: 15px; line-height: 1.7; color: #9ca3af; margin: 0 0 16px; }
    .data-box { background: #1a1a2e; border-radius: 8px; padding: 16px 20px; margin: 20px 0; border-left: 3px solid #7c3aed; }
    .data-row { margin-bottom: 8px; font-size: 14px; }
    .data-label { color: #7c3aed; font-weight: 700; display: inline-block; min-width: 90px; }
    .data-value { color: #e5e7eb; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; margin: 20px 0 8px; }
    .footer { text-align: center; padding: 20px 0 0; font-size: 12px; color: #4b5563; }
    .footer a { color: #7c3aed; text-decoration: none; }
    .divider { height: 1px; background: #2a2a3a; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-mark">H</div>
      <p class="brand-name">Histórias Contadas de Outra Maneira</p>
    </div>
    <div class="card">
      ${body}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${SITE_NAME}<br/>
      <a href="https://www.historiasdeoutramaneira.com.br">www.historiasdeoutramaneira.com.br</a><br/>
      <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>`;
}

export { sendMail, emailTemplate, CONTACT_EMAIL, SITE_NAME };
