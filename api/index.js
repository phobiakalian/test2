const express = require('express');
const { Telegraf } = require('telegraf');
const axios = require('axios'); // Pastikan sudah npm install axios

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

// Fungsi untuk melacak lokasi berdasarkan IP
const getGeoInfo = async (ip) => {
    try {
        // Melakukan request ke database intelijen IP
        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,city,isp,org`);
        if (response.data.status === 'success') {
            return response.data;
        }
        return null;
    } catch (error) {
        return null;
    }
};

// Fungsi Notifikasi Intelijen
const sendVisitorAlert = async (req) => {
    if (!MY_CHAT_ID) return;

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const geo = await getGeoInfo(ip.split(',')[0]); // Ambil IP pertama jika ada proxy
    const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    let report = `🌑 *OBSCRA INTEL REPORT*\n\n`;
    report += `🌐 *IP:* \`${ip}\`\n`;
    
    if (geo) {
        report += `📍 *Lokasi:* ${geo.city}, ${geo.country}\n`;
        report += `🏢 *Provider:* ${geo.isp}\n`;
    }
    
    report += `⏰ *Waktu:* ${time}\n\n`;
    report += `_Sistem memantau pergerakan target..._`;

    bot.telegram.sendMessage(MY_CHAT_ID, report, { parse_mode: 'Markdown' }).catch(() => {});
};

// --- INTERFACE VISUAL OBSCRA ---
app.get('/', async (req, res) => {
    await sendVisitorAlert(req);
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OBSCRA | Beyond Darkness</title>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,700&family=Montserrat:wght@200;400&display=swap" rel="stylesheet">
            <style>
                :root { --accent: #ffffff; --bg: #000000; }
                body, html { margin: 0; padding: 0; background: var(--bg); color: var(--accent); font-family: 'Montserrat', sans-serif; height: 100%; overflow: hidden; }
                .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.05; pointer-events: none; z-index: 10; }
                .main-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; text-align: center; z-index: 5; position: relative; }
                .brand-logo { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 10vw, 6rem); font-weight: 700; letter-spacing: 15px; margin: 0; text-transform: uppercase; opacity: 0; transform: translateY(30px); animation: fadeInUp 2s forwards; }
                .tagline { font-size: 0.7rem; letter-spacing: 10px; margin-top: 15px; text-transform: uppercase; color: #666; opacity: 0; animation: fadeIn 3s 1s forwards; }
                .line { width: 1px; height: 80px; background: linear-gradient(to bottom, transparent, var(--accent), transparent); margin: 40px 0; opacity: 0; animation: scaleY 2s 1.5s forwards; }
                .coming-soon { font-size: 0.8rem; letter-spacing: 5px; font-weight: 200; font-style: italic; opacity: 0; animation: fadeIn 2s 2.5s forwards; }
                @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { to { opacity: 1; } }
                @keyframes scaleY { from { transform: scaleY(0); } to { opacity: 1; transform: scaleY(1); } }
                .nav-footer { position: absolute; bottom: 50px; display: flex; gap: 40px; font-size: 0.6rem; letter-spacing: 3px; color: #333; text-transform: uppercase; }
            </style>
        </head>
        <body>
            <div class="overlay"></div>
            <div class="main-container">
                <h1 class="brand-logo">OBSCRA</h1>
                <p class="tagline">The Art of Silence</p>
                <div class="line"></div>
                <p class="coming-soon">Collection I — Coming Soon</p>
                <div class="nav-footer">
                    <span>Instagram</span>
                    <span>Lookbook</span>
                    <span>Archive</span>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.post('/api/bot', async (req, res) => {
    try { await bot.handleUpdate(req.body); res.status(200).send('OK'); } catch (e) { res.status(500).send('ERR'); }
});

module.exports = app;
