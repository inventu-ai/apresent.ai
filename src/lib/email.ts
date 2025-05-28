import nodemailer from 'nodemailer';

// Configuração do transporter Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verificar configuração do email
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

// Enviar email de reset de senha
export const sendPasswordResetEmail = async (
  email: string,
  resetCode: string
) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: '🔐 Código de Verificação - Inventu.ai',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de Verificação</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .title {
              font-size: 20px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .code-container {
              background: #f3f4f6;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #2563eb;
              letter-spacing: 4px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: #2563eb;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀 Inventu.ai</div>
              <h1 class="title">Código de Verificação</h1>
            </div>
            
            <p>Olá!</p>
            
            <p>Você solicitou a redefinição de sua senha. Use o código abaixo para continuar:</p>
            
            <div class="code-container">
              <div class="code">${resetCode}</div>
            </div>
            
            <div class="warning">
              <strong>⏰ Importante:</strong> Este código expira em <strong>15 minutos</strong>.
            </div>
            
            <p>Se você não solicitou esta redefinição de senha, pode ignorar este email com segurança.</p>
            
            <div class="footer">
              <p>Atenciosamente,<br><strong>Equipe Inventu.ai</strong></p>
              <p>Este é um email automático, não responda a esta mensagem.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
🔐 Código de Verificação - Inventu.ai

Olá!

Você solicitou a redefinição de sua senha. Use o código abaixo:

Código: ${resetCode}

⏰ Este código expira em 15 minutos.
🔒 Se você não solicitou, ignore este email.

Atenciosamente,
Equipe Inventu.ai
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Gerar código de 6 dígitos
export const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash do código para armazenamento seguro
export const hashResetCode = async (code: string): Promise<string> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(code, 12);
};

// Verificar código
export const verifyResetCode = async (
  code: string,
  hashedCode: string
): Promise<boolean> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(code, hashedCode);
};
