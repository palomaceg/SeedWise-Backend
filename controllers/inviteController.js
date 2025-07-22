const { sendInviteEmail } = require('../utils/emailService');

const inviteUser = async (req, res) => {
  try {
    const { role, email } = req.body;

    if (!role || !email) {
      return res.status(400).json({ message: 'Rol y correo son requeridos' });
    }

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${baseUrl}/registro?role=${role}&email=${encodeURIComponent(email)}`;

    await sendInviteEmail({ to: email, role, link: inviteLink });

    res.status(200).json({ message: 'Invitación enviada con éxito.' });
  } catch (error) {
    console.error('Error al enviar la invitación:', error);
    res.status(500).json({ message: 'Error al enviar la invitación' });
  }
};

module.exports = { inviteUser };
