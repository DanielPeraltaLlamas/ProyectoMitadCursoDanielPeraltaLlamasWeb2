import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

export const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: '"Proyecto Mitad Curso" <no-reply@tuapp.com>',
    to: email,
    subject: "Código de verificación de registro",
    html: `
      <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px;">
        <h2>¡Bienvenido a nuestra plataforma!</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="color: #4A90E2; letter-spacing: 5px;">${code}</h1>
        <p>Este código expirará en breve.</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};