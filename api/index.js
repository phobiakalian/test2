const express = require('express');
const { Telegraf } = require('telegraf');
const axios = require('axios');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

let stealthMode = false; 

// --- LOGIKA BOT ---
bot.start((ctx) => {
    ctx.replyWithMarkdownV2(
        `*OBSCRA COMMAND CENTER*\n\nStatus Stealth: ${stealthMode ? '🔴 ACTIVE' : '🟢 INACTIVE'}\n\n` +
        `*Kendali Penyamaran:*\n/stealth_on \\- Aktifkan 404 Palsu\n/stealth_off \\- Aktifkan Obscra Site`
    );
});

bot.command('stealth_on', (ctx) => {
    if (ctx.chat.id.toString() === MY_CHAT_ID) {
        stealthMode = true;
        ctx.reply('⚠️ STEALTH MODE: ON. Website sekarang disamarkan.');
    }
});

bot.command('stealth_off', (ctx) => {
    if (ctx.chat.id.toString() === MY_CHAT_ID) {
        stealthMode = false;
        ctx.reply('🌐 STEALTH MODE: OFF. Website Obscra kembali online.');
    }
});

// --- FUNGSI INTELIJEN: GEO + REFERRER ---
const sendAdvancedAlert = async (req) => {
    if (!MY_CHAT_ID) return;

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    const referrer = req.headers['referer'] || 'Direct Access (Ketik URL Langsung)';
    const userAgent = req.headers['user-agent'];
    const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    // Cek Geolocation
    let geoText = "Lokasi: Gagal melacak";
    try {
        const geo = await axios.get(`http://ip-api.com/json/${ip}?fields=status,city,country,isp`);
        if (geo.data.status === 'success') {
            geoText = `📍 Lokasi: ${geo.data.city}, ${geo.data.country}\n🏢 ISP: ${geo.data.isp}`;
        }
    } catch (e) {}

    const statusIcon = stealthMode ? "🚫 [STEALTH]" : "👁️ [VISIT]";
    
    const report = `🌑 *OBSCRA ACCESS LOG*\n` +
                   `────────────────────\n` +
                   `${statusIcon}\n` +
                   `🌐 *IP:* \`${ip}\`\n` +
                   `${geoText}\n` +
                   `🔗 *Source:* \`${referrer}\`\n` +
                   `⏰ *Waktu:* ${time}\n` +
                   `────────────────────`;

    bot.telegram.sendMessage(MY_CHAT_ID, report, { parse_mode: 'Markdown' }).catch(() => {});
};

// --- ROUTING INTERFACE ---
app.get('/', async (req, res) => {
    await sendAdvancedAlert(req);

    if (stealthMode) {
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head><title>404 Not Found</title></head>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1>404 Not Found</h1>
                <p>The requested URL was not found on this server.</p>
                <hr><address>Apache/2.4.41 (Ubuntu) Server at Port 443</address>
            </body>
            </html>
        `);
    } else {
        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>OBSCRA | Art of Silence</title>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@200&display=swap" rel="stylesheet">
                <style>
                    body { margin: 0; background: #000; color: #fff; font-family: 'Montserrat', sans-serif; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: hidden; }
                    .overlay { position: fixed; width: 100%; height: 100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.05; pointer-events: none; }
                    h1 { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 10vw, 6rem); letter-spacing: 15px; margin: 0; z-index: 2; }
                    .line { width: 1px; height: 80px; background: #fff; margin: 30px 0; z-index: 2; }
                </style>
            </head>
            <body>
                <div class="overlay"></div>
                <h1>OBSCRA</h1>
                <div class="line"></div>
                <p style="letter-spacing: 10px; font-weight: 200; z-index: 2;">COLLECTION I — 2310</p>
            </body>
            </html>
        `);
    }
});

app.post('/api/bot', async (req, res) => {
    try { await bot.handleUpdate(req.body); res.status(200).send('OK'); } catch (e) { res.status(500).send('ERR'); }
});

module.exports = app;
