const express = require('express');
const { Telegraf, Markup } = require('telegraf');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

// Log akses tetap aktif untuk monitoring traffic modern
app.get('/intel', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    const userAgent = req.headers['user-agent'];
    const device = userAgent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop';
    
    // Kirim notifikasi intelijen ke bot Anda
    const report = `🌑 *NEURAL ARCHIVE ACCESSED*\n` +
                   `Status: 🟢 ACTIVE\n` +
                   `🌐 IP: \`${ip}\`\n` +
                   `📟 Dev: ${device}\n` +
                   `────────────────────\n` +
                   `_Transmitting to year 2309..._`;

    await bot.telegram.sendMessage(MY_CHAT_ID, report, { parse_mode: 'Markdown' });
    res.status(200).send('OK');
});

// --- RENDER FRONTEND (The Holographic Interface) ---
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Khansa | Neural Archive v15.0</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;700&family=JetBrains+Mono:wght@100;300&display=swap" rel="stylesheet">
        <style>
            :root { --bg: #000000; --accent: #00ffff; --border: rgba(0, 255, 255, 0.1); --glass: rgba(255, 255, 255, 0.02); }
            * { margin: 0; padding: 0; box-sizing: border-box; cursor: none; }
            body, html { background: var(--bg); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; height: 100vh; width: 100vw; overflow: hidden; }
            
            /* Grain Texture */
            .noise { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.05; pointer-events: none; z-index: 100; }
            
            /* Custom Cursor */
            #cursor { width: 15px; height: 15px; border: 1px solid var(--accent); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transition: transform 0.1s ease; mix-blend-mode: difference; }

            /* Grid Background */
            #canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }

            /* Header Elite */
            nav { position: fixed; top: 0; width: 100%; height: 90px; display: flex; align-items: center; justify-content: center; padding: 0 5%; z-index: 200; border-bottom: 1px solid var(--border); backdrop-filter: blur(20px); }
            .brand { font-family: 'JetBrains Mono', monospace; font-weight: 300; letter-spacing: 5px; font-size: 14px; text-align: center; }
            .nav-link { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #444; text-decoration: none; transition: 0.3s; margin: 0 15px; }
            .nav-link:hover { color: #fff; }

            /* Coordinates & Year Tracker */
            .coordinates { position: fixed; top: 20px; right: 40px; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #333; letter-spacing: 2px; text-align: right; z-index: 200; }
            .year { position: fixed; top: 20px; left: 40px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #444; z-index: 200; }

            /* Main Container */
            .container { position: relative; z-index: 10; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .hero-title { font-size: 3rem; font-weight: 200; letter-spacing: 5px; text-align: center; margin-bottom: 50px; text-transform: uppercase; }

            /* Neural Archive Grid */
            .archive-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 90%; max-width: 1400px; height: 60vh; }
            .archive-item { background: var(--glass); backdrop-filter: blur(30px); border: 1px solid var(--border); padding: 40px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; transition: 0.5s; }
            .archive-item:hover { border-color: var(--accent); transform: translateY(-5px); box-shadow: 0 0 30px rgba(0,255,255,0.1); }
            
            .item-header { display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #444; letter-spacing: 2px; }
            .item-body h3 { font-size: 1.5rem; font-weight: 400; letter-spacing: 1px; margin: 15px 0; color: #fff; }
            .item-body p { font-size: 11px; line-height: 1.8; color: #888; font-weight: 200; }
            .item-body a { display: inline-block; margin-top: 15px; color: var(--accent); font-size: 10px; text-decoration: none; letter-spacing: 2px; text-transform: uppercase; }

            .item-preview { margin-top: 20px; width: 100%; height: 100px; background: rgba(0,255,255,0.02); display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #222; }

            /* Bot Control Panel (The 2309 Simulation) */
            .bot-control { position: fixed; bottom: 30px; right: 40px; width: 250px; background: var(--glass); backdrop-filter: blur(30px); border: 1px solid var(--border); padding: 20px; font-family: 'JetBrains Mono', monospace; font-size: 9px; z-index: 200; }
            .bot-status { display: flex; align-items: center; gap: 10px; margin-top: 10px; color: #fff; }
            .dot { width: 6px; height: 6px; background: #0f0; border-radius: 50%; box-shadow: 0 0 10px #0f0; }

            @media (max-width: 1024px) { .archive-grid { grid-template-columns: 1fr; height: auto; padding-top: 100px; } }
        </style>
    </head>
    <body>
        <div id="cursor"></div>
        <div class="noise"></div>
        <div class="year">2309</div>
        <div class="coordinates">LAT: 107.6 E<br>LONG: -6.9 S<br>BANDUNG / INDONESIA</div>
        <canvas id="canvas"></canvas>
        
        <nav>
            <div class="brand">OBSCRA NEURAL ARCHIVE: PERSONAL PORTFOLIO | KHANSA v15.0</div>
        </nav>

        <div class="container">
            <h1 class="hero-title">NEURAL ARCHIVE: SELECTED WORK v14.0</h1>
            
            <div class="archive-grid">
                <div class="archive-item">
                    <div class="item-header">
                        <span>Archive Project</span>
                        <span style="color:var(--accent);">#OBS-7721</span>
                    </div>
                    <div class="item-body">
                        <h3>The Shadow Hoodie</h3>
                        <p>A structural experiment in physical-digital convergence, where text and form merge.</p>
                        <a href="#">Neural Link</a>
                        <div class="item-preview">[DATA_PACKET_01]</div>
                    </div>
                </div>

                <div class="archive-item">
                    <div class="item-header">
                        <span>Archive Project</span>
                        <span style="color:var(--accent);">#OBS-9104</span>
                    </div>
                    <div class="item-body">
                        <h3>Waste Protocol</h3>
                        <p>Cognitive waste optimization system, enliminating dash location data structures.</p>
                        <a href="#">Neural Link</a>
                        <div class="item-preview">[DATA_PACKET_02]</div>
                    </div>
                </div>

                <div class="archive-item">
                    <div class="item-header">
                        <span>Archive Project</span>
                        <span style="color:var(--accent);">#OBS-9156</span>
                    </div>
                    <div class="item-body">
                        <h3>VOID Interface</h3>
                        <p>Merging informatics with aesthetic chaos. Deep neural link interface.</p>
                        <a href="#">Neural Link</a>
                        <div class="item-preview">[DATA_PACKET_03]</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bot-control">
            <div style="color:#555;">Bot Control Panel v8.0</div>
            <div class="bot-status">
                <div class="dot"></div>
                <div>OBSCRA Status: <span style="color:#fff;">🟢 ACTIVE</span></div>
            </div>
            <div style="color:#444; margin-top:10px;">LAT LONG BANDUNG [ Indonesia ]</div>
        </div>

        <script>
            // Cursor Follower
            const cursor = document.getElementById('cursor');
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX - 7 + 'px';
                cursor.style.top = e.clientY - 7 + 'px';
            });

            // Intel report activation
            window.onload = () => fetch('/intel');

            // Neural Grid Canvas Animation
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            let particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                });
            }

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#0f0';
                ctx.globalAlpha = 0.1;
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                    ctx.fillRect(p.x, p.y, 1, 1);
                });
                requestAnimationFrame(draw);
            }
            draw();
        </script>
    </body>
    </html>
    `);
});

app.post('/api/bot', async (req, res) => {
    try { await bot.handleUpdate(req.body); res.status(200).send('OK'); } catch (e) { res.status(500).send('ERR'); }
});

module.exports = app;
