import { config } from "../config/env.js";

class BrevoService {
  constructor() {
    this.apiKey = config.brevo.apiKey;
    this.baseUrl = "https://api.brevo.com/v3";
    this.senderEmail = config.brevo.senderEmail;
    this.senderName = config.brevo.senderName;
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.apiKey) {
      throw new Error("BREVO_API_KEY não configurada");
    }

    try {
      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: [{ email: to }],
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      console.log("✅ Email enviado via Brevo:", to);
      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error("❌ Erro ao enviar email via Brevo:", error.message);
      throw new Error("Erro ao enviar email: " + error.message);
    }
  }

  getEmailFrontendUrl() {
    const fallbackUrl = "https://teacherediane.com.br";
    const rawUrl = (config.frontendUrl || "").trim();

    if (!rawUrl) return fallbackUrl;

    const normalizedUrl = rawUrl.replace(/\/+$/, "");
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
      normalizedUrl,
    );

    return isLocalhost ? fallbackUrl : normalizedUrl;
  }

  async sendSetPasswordEmail({ name, email, token }) {
    const frontendUrl = this.getEmailFrontendUrl();
    const setPasswordLink = `${frontendUrl}/definir-senha?token=${token}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Defina sua senha</title>
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
      <h1>🎓 Inglês na Mala com Teacher Ediane</h1>
    </div>

    <div class="content">
      <h2>Olá, ${name}! 👋</h2>

      <p>Sua compra foi aprovada! Agora é hora de criar sua senha para acessar o curso.</p>

      <p>Clique no botão abaixo para definir sua senha:</p>

      <div style="text-align: center;">
        <a href="${setPasswordLink}" class="button">DEFINIR MINHA SENHA</a>
      </div>

      <div class="warning">
        <p>⚠️ <strong>ATENÇÃO:</strong> Este link é válido por 24 horas e só pode ser usado uma vez.</p>
      </div>

      <p>Após definir sua senha, você poderá fazer login normalmente e começar a estudar imediatamente!</p>

      <p style="margin-top: 30px;">
        Bons estudos! 📚<br>
        <strong>Teacher Ediane</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

      <p style="color: #666; font-size: 14px;">Já definiu sua senha? Acesse o curso pelo botão abaixo:</p>

      <div style="text-align: center;">
        <a href="${frontendUrl}/login" style="display: inline-block; background: #1E4BA0; color: #ffffff !important; text-decoration: none; padding: 12px 32px; border-radius: 50px; font-weight: bold; font-size: 16px;">
          ACESSAR O CURSO
        </a>
      </div>
    </div>

    <div class="footer">
      <p>MyTime Inglês © ${new Date().getFullYear()} - Todos os direitos reservados</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Olá, ${name}!

Sua compra foi aprovada! Agora é hora de criar sua senha para acessar o curso.

Clique no link abaixo para definir sua senha:
${setPasswordLink}

⚠️ ATENÇÃO: Este link é válido por 24 horas e só pode ser usado uma vez.

Após definir sua senha, você poderá fazer login normalmente e começar a estudar imediatamente!

Bons estudos!
Teacher Ediane
    `;

    return await this.sendEmail({
      to: email,
      subject: "Seja Bem-vindo ao Inglês na Mala com Teacher Ediane",
      html,
      text,
    });
  }
}

export default new BrevoService();
