const premiumUsers = new Set();

module.exports = async (sock, msg, text, from) => {
  if (!text.startsWith('.premium')) return;

  const sender = msg.key.participant || msg.key.remoteJid;
  if (sender !== '6282261246128@s.whatsapp.net') {
    return sock.sendMessage(from, { text: 'Hanya owner yang bisa pakai perintah ini.' });
  }

  const args = text.split(' ');
  const user = args[1];
  if (!user) {
    return sock.sendMessage(from, { text: 'Masukkan nomor user untuk ditambahkan/dihapus premium.' });
  }

  if (premiumUsers.has(user)) {
    premiumUsers.delete(user);
    await sock.sendMessage(from, { text: `User ${user} sudah dihapus dari premium.` });
  } else {
    premiumUsers.add(user);
    await sock.sendMessage(from, { text: `User ${user} sekarang premium.` });
  }
};

module.exports.isPremium = (user) => premiumUsers.has(user);
