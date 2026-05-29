import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetCode = async (email: string, code: string) => {
  await transporter.sendMail({
    from: `"Deportes UCB" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Código para restablecer tu contraseña',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #1a1a2e;">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Tu código de verificación es:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; margin: 24px 0;">
          ${code}
        </div>
        <p style="color: #666;">Este código expira en <strong>15 minutos</strong>.</p>
        <p style="color: #666;">Si no solicitaste esto, ignora este correo.</p>
      </div>
    `,
  });
};
