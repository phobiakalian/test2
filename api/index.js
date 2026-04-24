const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

// Intel tracking: Transmisi data ke bot Telegram Anda
app.get('/sync', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    await bot.telegram.sendMessage(MY_CHAT_ID, `🛰️ *NEURAL SYNC ESTABLISHED*\nUplink IP: \`${ip}\`\nStatus: Sovereign`, { parse_mode: 'Markdown' });
    res.status(200).send('SYNC_OK');
});

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KHANSA // SOVEREIGN ARCHIVE 2309</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syncopate:wght@400;700&display=swap" rel="stylesheet">
        <style>
            :root { --bg: #000; --accent: #00f3ff; --dim: #111; }
            * { margin: 0; padding: 0; box-sizing: border-box; cursor: none; }
            body, html { 
                background: var(--bg); color: #fff; 
                font-family: 'Space Mono', monospace; 
                height: 100vh; width: 100vw; overflow: hidden; 
            }

            /* Custom Cursor System */
            #cursor { width: 4px; height: 4px; background: var(--accent); border-radius: 50%; position: fixed; pointer-events: none; z-index: 10000; }
            #cursor-ring { 
                width: 40px; height: 40px; border: 1px solid rgba(0, 243, 255, 0.2); 
                border-radius: 50%; position: fixed; pointer-events: none; 
                z-index: 9999; transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
            }

            canvas { position: fixed; top: 0; left: 0; z-index: 1; pointer-events: none; }
            .noise { position: fixed; top:0; left:0; width:100%; height:100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.08; pointer-events: none; z-index: 100; }

            /* HUD Interface */
            .hud { position: fixed; padding: 40px; z-index: 500; font-size: 9px; letter-spacing: 3px; color: #444; text-transform: uppercase; }
            .top-left { top: 0; left: 0; }
            .top-right { top: 0; right: 0; text-align: right; }
            .bottom-left { bottom: 0; left: 0; }
            .bottom-right { bottom: 0; right: 0; text-align: right; }

            .glitch-text { animation: glitch 5s infinite; color: var(--accent); }
            @keyframes glitch { 0% { opacity: 1; } 50% { opacity: 0.5; } 52% { opacity: 1; } 100% { opacity: 1; } }

            /* Main Content */
            .main-frame { position: relative; z-index: 10; height: 100vh; display: flex; align-items: center; justify-content: center; }
            .central-hub { text-align: center; }
            h1 { font-family: 'Syncopate', sans-serif; font-size: clamp(3rem, 10vw, 8rem); letter-spacing: -5px; line-height: 0.8; margin-bottom: 20px; }
            
            /* Project Cards with 3D Tilt */
            .archive-deck { display: flex; gap: 30px; margin-top: 50px; perspective: 1000px; }
            .card { 
                width: 300px; height: 400px; background: rgba(255,255,255,0.02); 
                border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px);
                padding: 30px; transition: 0.5s ease; transform-style: preserve-3d;
            }
            .card:hover { border-color: var(--accent); background: rgba(0, 243, 255, 0.03); }
            .card h3 { font-size: 14px; letter-spacing: 5px; margin-bottom: 20px; }
            .card p { font-size: 10px; color: #666; line-height: 1.8; }

            /* Transmission Status */
            .status-bar { display: flex; align-items: center; gap: 10px; color: var(--accent); margin-top: 10px; }
            .blink { width: 5px; height: 5px; background: var(--accent); border-radius: 50%; animation: blink 1s infinite; }
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        </style>
    </head>
    <body>
        <div id="cursor"></div>
        <div id="cursor-ring"></div>
        <div class="noise"></div>
        <canvas id="neural-bg"></canvas>

        <div class="hud top-left">
            <div class="glitch-text">SIGNAL: SOVEREIGN</div>
            <div>VER: 16.0.8 / 2309</div>
        </div>
        <div class="hud top-right">
            <div>LOC: BANDUNG_ID // 107.6°E -6.9°S</div>
            <div>UPLINK: ACTIVE</div>
        </div>
        <div class="hud bottom-left">
            <div>KHANSA_NET_NODE</div>
            <div class="status-bar"><div class="blink"></div> DATA_STREAMING...</div>
        </div>

        <main class="main-frame">
            <div class="central-hub">
                <h1 onmouseenter="expand()" onmouseleave="shrink()">KHANSA</h1>
                <div class="archive-deck">
                    <div class="card" onmousemove="tilt(event, this)" onmouseleave="resetTilt(this)">
                        <div style="font-size: 9px; color: #333; margin-bottom: 100px;">DATA_01</div>
                        <h3>OBSCRA_V1</h3>
                        <p>Experimental neural link interface for modern garments.</p>
                    </div>
                    <div class="card" onmousemove="tilt(event, this)" onmouseleave="resetTilt(this)">
                        <div style="font-size: 9px; color: #333; margin-bottom: 100px;">DATA_02</div>
                        <h3>WASTE_SYS</h3>
                        <p>Logic-driven environmental data structure management.</p>
                    </div>
                </div>
            </div>
        </main>

        <script>
            // Advanced Particle Gravity System
            const canvas = document.getElementById('neural-bg');
            const ctx = canvas.getContext('2d');
            let particles = [];
            let mouse = { x: -100, y: -100 };

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            window.addEventListener('mousemove', e => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
                document.getElementById('cursor').style.left = e.clientX + 'px';
                document.getElementById('cursor').style.top = e.clientY + 'px';
                document.getElementById('cursor-ring').style.left = (e.clientX - 20) + 'px';
                document.getElementById('cursor-ring').style.top = (e.clientY - 20) + 'px';
            });

            class Particle {
                constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.size = Math.random() * 1.5;
                    this.baseX = this.x;
                    this.baseY = this.y;
                    this.density = (Math.random() * 30) + 1;
                }
                draw() {
                    ctx.fillStyle = 'rgba(0, 243, 255, 0.3)';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();
                }
                update() {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = 150;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;

                    if (distance < maxDistance) {
                        this.x += directionX;
                        this.y += directionY;
                    } else {
                        if (this.x !== this.baseX) {
                            let dx = this.x - this.baseX;
                            this.x -= dx/10;
                        }
                        if (this.y !== this.baseY) {
                            let dy = this.y - this.baseY;
                            this.y -= dy/10;
                        }
                    }
                }
            }

            function init() {
                particles = [];
                for (let i = 0; i < 200; i++) particles.push(new Particle());
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => { p.update(); p.draw(); });
                requestAnimationFrame(animate);
            }

            init(); animate();

            // 3D Tilt Logic
            function tilt(e, el) {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xc = rect.width / 2;
                const yc = rect.height / 2;
                const dx = x - xc;
                const dy = y - yc;
                el.style.transform = \`rotateY(\${dx / 10}deg) rotateX(\${-dy / 10}deg) scale(1.05)\`;
            }
            function resetTilt(el) { el.style.transform = 'rotateY(0) rotateX(0) scale(1)'; }
            
            function expand() { document.getElementById('cursor-ring').style.transform = 'scale(2)'; }
            function shrink() { document.getElementById('cursor-ring').style.transform = 'scale(1)'; }

            window.onload = () => fetch('/sync');
        </script>
    </body>
    </html>
    `);
});

app.post('/api/bot', async (req, res) => {
    try { await bot.handleUpdate(req.body); res.status(200).send('OK'); } catch (e) { res.status(500).send('ERR'); }
});

module.exports = app;
