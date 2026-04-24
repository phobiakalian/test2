const express = require('express');
const { Telegraf, Markup } = require('telegraf');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

let pendingTransmissions = {};

// --- API: CONFESS RECEIVER ---
app.post('/api/confess', async (req, res) => {
    const { message, to } = req.body;
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    const transId = Math.floor(100000 + Math.random() * 900000);

    if (!message || message.length < 5) return res.status(400).json({ error: 'MSG_TOO_SHORT' });

    try {
        pendingTransmissions[transId] = { to, message, ip };
        await bot.telegram.sendMessage(MY_CHAT_ID, `🛡️ *INCOMING [${transId}]*\nTo: ${to}\nMsg: ${message}\nIP: \`${ip}\``, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[
                Markup.button.callback('✅ AUTH', `auth_${transId}`), 
                Markup.button.callback('❌ TERM', `term_${transId}`)
            ]])
        });
        res.status(200).json({ success: true, id: transId });
    } catch (e) { res.status(500).json({ error: 'CORE_FAULT' }); }
});

// --- BOT HANDLER ---
bot.on('callback_query', async (ctx) => {
    const [action, id] = ctx.callbackQuery.data.split('_');
    const data = pendingTransmissions[id];
    if (!data) return ctx.answerCbQuery('EXPIRED');

    if (action === 'auth') {
        try {
            await bot.telegram.sendMessage(CHANNEL_ID, `🌑 *OBSCRA #${id}*\nTo: ${data.to}\n"${data.message}"`, { parse_mode: 'Markdown' });
            await ctx.editMessageText(`✅ PUBLISHED #${id}`);
        } catch (e) { await ctx.answerCbQuery('CHANNEL_ERROR'); }
    } else { await ctx.editMessageText(`❌ DELETED #${id}`); }
    delete pendingTransmissions[id];
});

// --- FRONTEND: MULTI-PAGE ARCHITECTURE ---
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OBSCRA | Interface</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;700&family=JetBrains+Mono:wght@100&display=swap" rel="stylesheet">
        <style>
            :root { --bg: #050505; --accent: #ffffff; --border: rgba(255,255,255,0.1); }
            * { margin: 0; padding: 0; box-sizing: border-box; cursor: none; }
            body, html { background: var(--bg); color: var(--accent); font-family: 'Plus Jakarta Sans', sans-serif; height: 100vh; overflow: hidden; }
            
            #cursor { width: 20px; height: 20px; border: 1px solid var(--accent); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transition: transform 0.1s ease; mix-blend-mode: difference; }
            .noise { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.05; pointer-events: none; z-index: 100; }
            
            /* Navigation */
            nav { position: fixed; top: 40px; width: 100%; display: flex; justify-content: center; gap: 40px; z-index: 150; }
            .nav-link { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #555; text-decoration: none; transition: 0.3s; }
            .nav-link:hover, .nav-link.active { color: #fff; }

            /* Page System */
            .page { position: absolute; width: 100%; height: 100%; display: none; flex-direction: column; align-items: center; justify-content: center; transition: 0.5s; }
            .page.active { display: flex; animation: fadeIn 1s forwards; }

            .glass-card { width: 90%; max-width: 450px; padding: 40px; background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(30px); border: 1px solid var(--border); border-radius: 20px; text-align: center; }
            
            input, textarea { width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--border); padding: 12px 0; color: #fff; font-family: inherit; outline: none; margin-bottom: 20px; }
            button { width: 100%; background: #fff; color: #000; border: none; padding: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 5px; font-size: 0.7rem; cursor: pointer; }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        </style>
    </head>
    <body>
        <div id="cursor"></div>
        <div class="noise"></div>
        
        <nav>
            <a href="#" class="nav-link active" onclick="showPage('home')">Home</a>
            <a href="#" class="nav-link" onclick="showPage('lookbook')">Lookbook</a>
            <a href="#" class="nav-link" onclick="showPage('confess')">Confess</a>
        </nav>

        <div id="home" class="page active">
            <h1 style="font-weight: 200; letter-spacing: 20px;">OBSCRA</h1>
            <p style="font-size: 10px; color: #444; letter-spacing: 5px; margin-top: 20px;">EST. 2026 / BANDUNG</p>
        </div>

        <div id="lookbook" class="page">
            <div class="glass-card">
                <h2 style="font-weight: 200; letter-spacing: 10px; margin-bottom: 20px;">COLLECTION I</h2>
                <div style="width: 100%; height: 200px; background: #111; border: 1px solid #222; display: flex; align-items: center; justify-content: center; color: #333; font-size: 10px;">[IMAGE_PLACEHOLDER]</div>
                <p style="font-size: 11px; margin-top: 20px; color: #666; line-height: 1.6;">Minimalism is the ultimate sophistication. Discover the archive.</p>
            </div>
        </div>

        <div id="confess" class="page">
            <div class="glass-card">
                <h2 style="font-weight: 200; letter-spacing: 10px; margin-bottom: 30px;">NEURAL LINK</h2>
                <input type="text" id="to" placeholder="// RECIPIENT">
                <textarea id="msg" rows="4" placeholder="// SECRET_MESSAGE"></textarea>
                <button onclick="send()">Transmit</button>
                <p id="status" style="font-size: 9px; margin-top: 20px; color: #444;"></p>
            </div>
        </div>

        <script>
            // Page Switcher Logic
            function showPage(pageId) {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                document.getElementById(pageId).classList.add('active');
                event.target.classList.add('active');
            }

            // Cursor Logic
            const cursor = document.getElementById('cursor');
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX - 10 + 'px';
                cursor.style.top = e.clientY - 10 + 'px';
            });

            async function send() {
                const st = document.getElementById('status');
                st.innerText = "TRANSMITTING...";
                const res = await fetch('/api/confess', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: document.getElementById('to').value, message: document.getElementById('msg').value })
                });
                if(res.ok) { st.innerText = "SUCCESS SENT."; document.getElementById('msg').value = ""; }
                else { st.innerText = "FAULT."; }
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/api/bot', async (req, res) => {
    try { await bot.handleUpdate(req.body); res.status(200).send('OK'); } catch (e) { res.status(500).send('ERR'); }
});

module.exports = app;
