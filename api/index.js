const express = require('express');
const { Telegraf } = require('telegraf');
const axios = require('axios');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

let stealthMode = false;

// --- KONTROL BOT ---
bot.command('stealth_on', (ctx) => {
    if (ctx.chat.id.toString() === MY_CHAT_ID) {
        stealthMode = true;
        ctx.reply('⚠️ OBSCRA STATUS: UNDER CLOAK (404 Mode Active)');
    }
});

bot.command('stealth_off', (ctx) => {
    if (ctx.chat.id.toString() === MY_CHAT_ID) {
        stealthMode = false;
        ctx.reply('🌐 OBSCRA STATUS: VISIBLE (Public Mode Active)');
    }
});

// --- INTELIJEN REPORT ---
const sendIntelReport = async (req) => {
    if (!MY_CHAT_ID) return;
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    const ref = req.headers['referer'] || 'Direct Access';
    const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    let geo = "Unknown Location";
    try {
        const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,city,country`);
        if (res.data.status === 'success') geo = `${res.data.city}, ${res.data.country}`;
    } catch (e) {}

    const msg = `🌑 *OBSCRA INTEL*\nStatus: ${stealthMode ? 'STEALTH' : 'VISIT'}\nIP: \`${ip}\`\nLoc: ${geo}\nRef: \`${ref}\`\nTime: ${time}`;
    bot.telegram.sendMessage(MY_CHAT_ID, msg, { parse_mode: 'Markdown' }).catch(() => {});
};

// --- FRONTEND DESIGN: LUXE EDITION ---
app.get('/', async (req, res) => {
    await sendIntelReport(req);
    if (stealthMode) {
        return res.status(404).send('<title>404 Not Found</title><body style="font-family:sans-serif;padding:50px"><h1>404 Not Found</h1><hr>Apache/2.4.41</body>');
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OBSCRA</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;700&family=Playfair+Display:ital@1&display=swap" rel="stylesheet">
        <style>
            :root { --bg: #0a0a0a; --fg: #ffffff; --accent: #666; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                background: var(--bg); color: var(--fg); 
                font-family: 'Inter', sans-serif; overflow: hidden;
                height: 100vh; display: flex; flex-direction: column;
                justify-content: center; align-items: center;
            }

            /* Grain Overlay */
            .noise { position: fixed; top:0; left:0; width:100%; height:100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.04; pointer-events: none; z-index: 10; }

            /* Coordinates Tracker */
            #coords { position: fixed; top: 30px; left: 30px; font-size: 10px; letter-spacing: 3px; color: var(--accent); z-index: 20; }

            /* Main Title with Cipher Animation */
            .hero-title { 
                font-size: clamp(2rem, 15vw, 8rem); font-weight: 700; 
                letter-spacing: -0.05em; margin: 0; cursor: default;
                transition: transform 0.5s cubic-bezier(0.2, 0, 0.2, 1);
            }
            .hero-title:hover { transform: skewX(-10deg) scale(1.02); }

            /* Professional Menu */
            .nav-container { position: fixed; bottom: 50px; display: flex; gap: 50px; z-index: 20; }
            .nav-item { 
                font-size: 11px; text-transform: uppercase; letter-spacing: 5px; 
                color: var(--accent); cursor: pointer; transition: 0.3s;
                text-decoration: none;
            }
            .nav-item:hover { color: var(--fg); text-shadow: 0 0 10px rgba(255,255,255,0.5); }

            /* Tagline */
            .tagline { 
                font-family: 'Playfair Display', serif; font-style: italic;
                font-size: 1.2rem; color: var(--accent); margin-top: -10px;
                opacity: 0; animation: fadeIn 2s 1s forwards;
            }

            @keyframes fadeIn { to { opacity: 1; } }
        </style>
    </head>
    <body>
        <div class="noise"></div>
        <div id="coords">X: 000 / Y: 000</div>

        <h1 class="hero-title" data-value="OBSCRA">OBSCRA</h1>
        <p class="tagline">The art of silence.</p>

        <nav class="nav-container">
            <a class="nav-item" data-value="COLLECTIONS">Collections</a>
            <a class="nav-item" data-value="ARCHIVE">Archive</a>
            <a class="nav-item" data-value="ABOUT">About</a>
        </nav>

        <script>
            // Coordinates Logic
            document.addEventListener('mousemove', (e) => {
                const x = e.clientX.toString().padStart(3, '0');
                const y = e.clientY.toString().padStart(3, '0');
                document.getElementById('coords').innerText = "LAT: " + x + " / LONG: " + y;
            });

            // Cipher Effect Logic
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const cipherEffect = (element) => {
                let iteration = 0;
                const originalText = element.dataset.value;
                const interval = setInterval(() => {
                    element.innerText = element.innerText
                        .split("")
                        .map((letter, index) => {
                            if(index < iteration) return originalText[index];
                            return letters[Math.floor(Math.random() * 26)]
                        })
                        .join("");
                    if(iteration >= originalText.length) clearInterval(interval);
                    iteration += 1 / 3;
                }, 30);
            };

            // Apply Cipher to Title on Load
            window.onload = () => cipherEffect(document.querySelector('.hero-title'));

            // Apply Cipher to Nav Items on Hover
            document.querySelectorAll('.nav-item').forEach(item => {
                item.onmouseover = event => cipherEffect(event.target);
            });
        </script>
    </body>
    </html>
    `);
});

app.post('/api/bot', async (req, res) => {
    try { await bot.handleUpdate(req.body); res.status(200).send('OK'); } catch (e) { res.status(500).send('ERR'); }
});

module.exports = app;
