import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

class EmailService {
  constructor() {
    // Configurar transporter do Nodemailer
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false, // true para 465, false para outras portas
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  /**
   * Garante URL publica para links enviados por e-mail.
   * Evita envio de localhost em ambiente hospedado.
   */
  getEmailFrontendUrl() {
    const fallbackUrl = 'https://teacherediane.com.br';
    const rawUrl = (config.frontendUrl || '').trim();

    if (!rawUrl) return fallbackUrl;

    const normalizedUrl = rawUrl.replace(/\/+$/, '');
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedUrl);

    return isLocalhost ? fallbackUrl : normalizedUrl;
  }

  /**
   * Enviar e-mail genérico
   */
  async sendMail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        text,
        html,
      });

      console.log('✅ E-mail enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      throw new Error('Erro ao enviar e-mail: ' + error.message);
    }
  }

  /**
   * E-mail de boas-vindas com link de cadastro
   */
  async sendWelcomeEmail({ name, email, token }) {
    const frontendUrl = this.getEmailFrontendUrl();
    const signupLink = `${frontendUrl}/cadastro?token=${token}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sua compra foi aprovada!</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1E4BA0 0%, #E3242B 100%);
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #1E4BA0;
      font-size: 24px;
      margin-top: 0;
    }
    .content p {
      color: #333;
      line-height: 1.6;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #E3242B 0%, #1E4BA0 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 18px;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning p {
      margin: 0;
      color: #856404;
    }
    .purchase-details {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .purchase-details p {
      margin: 8px 0;
      color: #333;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer a {
      color: #1E4BA0;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 MyTime Inglês</h1>
    </div>

    <div class="content">
      <h2>Olá, ${name}! 👋</h2>

      <p>Parabéns! Sua compra do curso <strong>"Inglês na Mala com Teacher Ediane - 25 Frases Essenciais"</strong> foi aprovada!</p>
      <p>Seja muito bem-vindo(a) ao curso! Fico muito feliz em ter você comigo nessa jornada para falar inglês com mais confiança nas suas viagens.</p>

      <p>Clique no botão abaixo para criar sua conta e começar a estudar imediatamente:</p>

      <div style="text-align: center;">
        <a href="${signupLink}" class="button">CRIAR MINHA CONTA E COMEÇAR</a>
      </div>

      <p>Para sua segurança, na tela de cadastro clique em <strong>"Enviar código"</strong>. O código será enviado para este mesmo e-mail e será obrigatório para concluir o cadastro.</p>

      <div class="warning">
        <p>⚠️ <strong>ATENÇÃO:</strong> Este link é válido por 48 horas e só pode ser usado uma vez.</p>
      </div>

      <div class="purchase-details">
        <p><strong>Dados da compra:</strong></p>
        <p>• Produto: Inglês na Mala com Teacher Ediane - 25 Frases Essenciais</p>
        <p>• Valor pago: R$ ${config.mercadoPago.coursePrice.toFixed(2)}</p>
        <p>• Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <p>Precisa de ajuda? Responda este e-mail ou entre em contato conosco.</p>

      <p style="margin-top: 30px;">
        Bons estudos! 📚<br>
        <strong>Teacher Ediane</strong>
      </p>
    </div>

    <div class="footer">
      <p>MyTime Inglês © ${new Date().getFullYear()} - Todos os direitos reservados</p>
      <p>
        <a href="${frontendUrl}">Visitar site</a> |
        <a href="${frontendUrl}/contato">Contato</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Olá, ${name}!

Parabéns! Sua compra do curso "Inglês na Mala com Teacher Ediane - 25 Frases Essenciais" foi aprovada!
Seja muito bem-vindo(a) ao curso! Fico muito feliz em ter você comigo nessa jornada para falar inglês com mais confiança nas suas viagens.

Clique no link abaixo para criar sua conta e começar a estudar:
${signupLink}

Para sua segurança, na tela de cadastro clique em "Enviar código". O código será enviado para este mesmo e-mail e será obrigatório para concluir o cadastro.

⚠️ ATENÇÃO: Este link é válido por 48 horas e só pode ser usado uma vez.

Dados da compra:
- Produto: Inglês na Mala com Teacher Ediane - 25 Frases Essenciais
- Valor pago: R$ ${config.mercadoPago.coursePrice.toFixed(2)}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Precisa de ajuda? Responda este e-mail.

Bons estudos!
Teacher Ediane
    `;

    return await this.sendMail({
      to: email,
      subject: '✅ Sua compra foi aprovada! Acesse o curso agora',
      html,
      text,
    });
  }

  /**
   * E-mail com código de verificação para concluir cadastro
   */
  async sendSignupVerificationCode({ name, email, code }) {
    const frontendUrl = this.getEmailFrontendUrl();

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de verificação</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1E4BA0 0%, #E3242B 100%);
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }
    .content {
      padding: 32px 28px;
      color: #333;
    }
    .code-box {
      margin: 24px 0;
      padding: 18px;
      text-align: center;
      background: #f8f9fa;
      border: 1px dashed #1E4BA0;
      border-radius: 8px;
    }
    .code {
      font-size: 34px;
      letter-spacing: 8px;
      font-weight: 700;
      color: #1E4BA0;
      margin: 8px 0;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
      padding: 14px;
      color: #856404;
      margin-top: 20px;
    }
    .footer {
      background: #f8f9fa;
      padding: 16px;
      text-align: center;
      font-size: 13px;
      color: #666;
    }
    .footer a {
      color: #1E4BA0;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Verificação de Cadastro</h1>
    </div>
    <div class="content">
      <p>Olá, ${name}!</p>
      <p>Para concluir seu cadastro com segurança, use o código abaixo na tela de cadastro:</p>

      <div class="code-box">
        <p style="margin: 0; color: #64748b;">Seu código</p>
        <div class="code">${code}</div>
        <p style="margin: 0; color: #64748b;">Válido por 1 hora</p>
      </div>

      <div class="warning">
        <strong>Importante:</strong> não compartilhe este código com ninguém.
      </div>
    </div>
    <div class="footer">
      <p>Teacher Ediane © ${new Date().getFullYear()}</p>
      <p><a href="${frontendUrl}">Visitar site</a></p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Olá, ${name}!

Para concluir seu cadastro com segurança, use o código abaixo:

${code}

Este código é válido por 1 hora.
Importante: não compartilhe este código com ninguém.
    `;

    return await this.sendMail({
      to: email,
      subject: '🔐 Código de verificação para concluir seu cadastro',
      html,
      text,
    });
  }

  /**
   * E-mail de reset de senha
   */
  async sendPasswordResetEmail({ name, email, resetToken }) {
    const frontendUrl = this.getEmailFrontendUrl();
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de senha</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1E4BA0 0%, #E3242B 100%);
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      color: #333;
      line-height: 1.6;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #E3242B 0%, #1E4BA0 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 18px;
      margin: 20px 0;
    }
    .warning {
      background-color: #fff3cd;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      color: #856404;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 MyTime Inglês</h1>
    </div>

    <div class="content">
      <h2>Olá, ${name}!</h2>

      <p>Recebemos uma solicitação para redefinir sua senha.</p>

      <p>Clique no botão abaixo para criar uma nova senha:</p>

      <div style="text-align: center;">
        <a href="${resetLink}" class="button">REDEFINIR MINHA SENHA</a>
      </div>

      <div class="warning">
        <p>⚠️ Este link expira em 1 hora.</p>
        <p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
      </div>
    </div>

    <div class="footer">
      <p>MyTime Inglês © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
    `;

    return await this.sendMail({
      to: email,
      subject: '🔒 Recuperação de senha - MyTime Inglês',
      html,
      text: `Olá, ${name}!\n\nClique no link para redefinir sua senha: ${resetLink}\n\nEste link expira em 1 hora.`,
    });
  }

  /**
   * Verificar configuração do e-mail
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Servidor de e-mail está pronto');
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar servidor de e-mail:', error);
      return false;
    }
  }
}

export default new EmailService();
