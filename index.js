const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const qrcode = require('qrcode-terminal'); // Tambahkan ini

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    auth: state
    // HAPUS: printQRInTerminal
  });

  sock.ev.on('creds.update', saveCreds);

  // Tampilkan QR manual
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true }); // QR tampil di terminal
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Koneksi terputus. Reconnecting...', shouldReconnect);
      if (shouldReconnect) startBot();
    }

    if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung!');
    }
  });

  // Plugin handler
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (!messages || !messages[0]) return;
    const msg = messages[0];
    const from = msg.key.remoteJid;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

    if (!from || !text) return;

    const pluginFolder = path.join(__dirname, 'plugins');
    const files = fs.readdirSync(pluginFolder);

    for (const file of files) {
      const plugin = require(path.join(pluginFolder, file));
      if (typeof plugin === 'function') {
        try {
          await plugin(sock, msg, text, from);
        } catch (e) {
          console.error(`[PLUGIN ERROR] ${file}:`, e.message);
        }
      }
    }
  });
}

startBot();
