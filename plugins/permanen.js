const permanenUsers = new Set();

module.exports = async (sock, msg, text, from) => {
  if (!text.startsWith('.permanen')) return;

  const sender = msg.key.participant || msg.key.remoteJid;
  if (sender !== '6282221155218@s.whatsapp.net') {
    return sock.sendMessage(from, { text: 'Hanya owner yang bisa pakai perintah ini.' });
  }

  const args = text.split(' ');
  const user = args[1];
  if (!user) {
    return sock.sendMessage(from, { text: 'Masukkan nomor user untuk ditambahkan/dihapus permanen.' });
  }

  if (permanenUsers.has(user)) {
    permanenUsers.delete(user);
    await sock.sendMessage(from, { text: `User ${user} sudah dihapus dari permanen.` });
  } else {
    permanenUsers.add(user);
    await sock.sendMessage(from, { text: `User ${user} sekarang permanen.` });
  }
};

module.exports.isPermanen = (user) => permanenUsers.has(user);
