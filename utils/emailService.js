const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

const sendInviteEmail = async ({ to, role, link }) => {
  const subject = `Invitación para registrarte como ${role}`;
  const html = `
    <h3>¡Hola!</h3>
    <p>Has sido invitado a registrarte como <strong>${role}</strong>.</p>
    <p>Haz clic en el siguiente enlace para completar tu registro:</p>
    <p><a href="${link}">${link}</a></p>
  `;

  await transporter.sendMail({
    from: `"Seed Startup Program" <${process.env.USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendInviteEmail };