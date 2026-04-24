const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const app = express();
app.use(express.json());

// Inisialisasi Bot & Konfigurasi
const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

let pendingTransmissions = {};

// --- API: TRANSMISSION RECEIVER ---
app.post('/api/confess', async (req, res) => {
    const { message, to } = req.body;
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    const transId = Math.floor(100000 + Math.random() * 900000); // 6 Digit Unique ID

    // Validasi Minimalis namun Tegas
    if (!message || message.length < 5) {
        return res.status(400).json({ error: 'SYS.ERROR: MSG_TOO_SHORT' });
    }

    try {
        // Simpan data ke dalam memory sementara
        pendingTransmissions[transId] = { to, message, ip, time: new Date() };
        
        const adminMsg = `🛡️ *INCOMING TRANSMISSION [${transId}]*\n\n` +
                         `*To:* ${to || 'Unknown Entity'}\n` +
                         `*Content:* "${message}"\n\n` +
                         `📍 *Source:* \`${ip}\`\n` +
                         `⏳ *Status:* Awaiting Manual Override...`;
        
        await bot.telegram.sendMessage(MY_CHAT_ID, adminMsg, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('✅ AUTHORIZE', `auth_${transId}`), 
                 Markup.button.callback('❌ TERMINATE', `term_${transId}`)]
            ])
        });

        res.status(200).json({ success: true, id: transId });
    } catch (error) {
        res.status(500).json({ error: 'SYS.FAULT: TRANSMISSION_FAILED' });
    }
});

// --- BOT HANDLER: AUTHORIZATION PROTOCOL ---
bot.on('callback_query', async (ctx) => {
    const [action, id] = ctx.callbackQuery.data.split('_');
    const data = pendingTransmissions[id];

    if (!data) return ctx.answerCbQuery('ERROR: ID_NOT_FOUND_OR_EXPIRED');

    if (action === 'auth') {
        const channelMsg = `🌑 *OBSCRA MENFESS #${id}*\n\n*To:* ${data.to || 'Anyone'}\n*Message:* \n"${data.message}"\n\n───\n_Neural Link Verified_`;
        
        try {
            await bot.telegram.sendMessage(CHANNEL_ID, channelMsg, { parse_mode: 'Markdown' });
            await ctx.editMessageText(`✅ *TRANSMISSION #${id} PUBLISHED*`);
        } catch (e) {
            await ctx.answerCbQuery('CHANNEL_POST_ERROR');
        }
    } else {
        await ctx.editMessageText(`❌ *TRANSMISSION #${id} DELETED*`);
    }
    
    delete pendingTransmissions[id];
});


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
            
            #cursor { 
                width: 20px; height: 20px; border: 1px solid var(--accent); 
                border-radius: 50%; position: fixed; pointer-events: none; 
                z-index: 9999; transition: transform 0.1s ease; mix-blend-mode: difference;
            }

            .grid-bg {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-image: linear-gradient(var(--border) 1px, transparent 1px),
                                  linear-gradient(90deg, var(--border) 1px, transparent 1px);
                background-size: 50px 50px;
                mask-image: radial-gradient(circle at center, black, transparent 80%);
                z-index: 1; opacity: 0.3;
            }

            .container { position: relative; z-index: 10; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
            
            .glass-card {
                width: 90%; max-width: 450px; padding: 50px;
                background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(30px);
                border: 1px solid var(--border); border-radius: 20px;
                box-shadow: 0 40px 100px rgba(0,0,0,0.8);
                animation: slideUp 1s ease forwards;
            }

            h1 { font-weight: 200; letter-spacing: 15px; text-align: center; margin-bottom: 40px; font-size: 1.2rem; opacity: 0.8; }
            .field { margin-bottom: 30px; }
            label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #555; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 10px; }
            input, textarea { width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--border); padding: 12px 0; color: #fff; font-family: inherit; outline: none; transition: 0.4s; }
            input:focus, textarea:focus { border-bottom-color: #fff; }

            button {
                width: 100%; background: #fff; color: #000; border: none; padding: 20px; 
                font-family: inherit; font-weight: 700; text-transform: uppercase; 
                letter-spacing: 5px; font-size: 0.7rem; border-radius: 4px; margin-top: 20px;
                transition: 0.3s;
            }
            button:hover { background: #000; color: #fff; border: 1px solid #fff; }
            
            #status { margin-top: 30px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #333; text-align: center; }
            
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .noise { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.05; pointer-events: none; z-index: 100; }
        </style>
    </head>
    <body>
        <div id="cursor"></div>
        <div class="noise"></div>
        <div class="grid-bg"></div>
        <div class="container">
            <div class="glass-card">
                <h1>OBSCRA</h1>
                <div class="field"><label>// RECIPIENT</label><input type="text" id="to" placeholder="ID.000" onmouseenter="grow()" onmouseleave="shrink()"></div>
                <div class="field"><label>// MESSAGE</label><textarea id="msg" rows="4" placeholder="TYPE_MESSAGE..." onmouseenter="grow()" onmouseleave="shrink()"></textarea></div>
                <button onclick="send()" onmouseenter="grow()" onmouseleave="shrink()">Run Transmission</button>
                <div id="status">SYS.AWAITING_INPUT</div>
            </div>
        </div>
        <script>
            const cursor = document.getElementById('cursor');
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX - 10 + 'px';
                cursor.style.top = e.clientY - 10 + 'px';
            });
            function grow() { cursor.style.transform = 'scale(2.5)'; cursor.style.background = 'rgba(255,255,255,0.1)'; }
            function shrink() { cursor.style.transform = 'scale(1)'; cursor.style.background = 'transparent'; }

            async function send() {
                const st = document.getElementById('status');
                st.innerText = "SYS.TRANSMITTING...";
                try {
                    const res = await fetch('/api/confess', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ to: document.getElementById('to').value, message: document.getElementById('msg').value })
                    });
                    const d = await res.json();
                    if(res.ok) {
                        st.innerText = "SUCCESS: ID_" + d.id;
                        document.getElementById('msg').value = "";
                    } else { st.innerText = "ERROR: " + d.error; }
                } catch(e) { st.innerText = "SYS.CRITICAL_FAULT"; }
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
