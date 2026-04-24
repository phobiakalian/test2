const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

app.get('/sync', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    const ua = req.headers['user-agent'];
    const device = ua.includes('Mobile') ? '📱 MOBILE_NODE' : '💻 DESKTOP_NODE';
    await bot.telegram.sendMessage(MY_CHAT_ID, `🛰️ *UNIVERSAL SYNC*\nUplink: \`${ip}\`\nDevice: \`${device}\``, { parse_mode: 'Markdown' });
    res.status(200).send('OK');
});

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>KHANSA // NEURAL LINK 2309</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syncopate:wght@700&display=swap" rel="stylesheet">
        <style>
            :root { --accent: #00f3ff; --bg: #000; --glass: rgba(255,255,255,0.03); }
            * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
            body, html { 
                background: var(--bg); color: #fff; font-family: 'Space Mono', monospace; 
                overflow-x: hidden; width: 100%; height: 100%; 
            }
            
            /* Cursor - Hidden on Mobile */
            #cursor, #cursor-ring { position: fixed; pointer-events: none; z-index: 10000; display: none; }
            @media (min-width: 1024px) {
                #cursor { display: block; width: 4px; height: 4px; background: var(--accent); border-radius: 50%; }
                #cursor-ring { display: block; width: 40px; height: 40px; border: 1px solid rgba(0,243,255,0.2); border-radius: 50%; transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1); }
                body { cursor: none; }
            }

            canvas { position: fixed; top: 0; left: 0; z-index: 1; pointer-events: none; }
            .noise { position: fixed; top:0; left:0; width:100%; height:100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.08; pointer-events: none; z-index: 100; }

            /* HUD System - Adaptive */
            .hud { position: fixed; padding: 20px; z-index: 500; font-size: 8px; letter-spacing: 2px; color: #444; text-transform: uppercase; width: 100%; pointer-events: none; }
            .t-l { top: 0; left: 0; } .t-r { top: 0; right: 0; text-align: right; }
            .b-l { bottom: 0; left: 0; } .b-r { bottom: 0; right: 0; text-align: right; }
            @media (min-width: 1024px) { .hud { padding: 40px; font-size: 10px; } }

            /* Main Layout */
            main { position: relative; z-index: 10; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; }
            h1 { font-family: 'Syncopate', sans-serif; font-size: clamp(2.5rem, 12vw, 8rem); letter-spacing: -2px; line-height: 0.8; margin-bottom: 40px; text-align: center; }
            
            /* Deck - Mobile: Scroll / Desktop: Flex */
            .archive-deck { 
                display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 1200px; 
                perspective: 1000px;
            }
            @media (min-width: 1024px) { .archive-deck { flex-direction: row; justify-content: center; } }

            .card { 
                background: var(--glass); border: 1px solid rgba(255,255,255,0.08); 
                backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
                padding: 30px; transition: 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                transform-style: preserve-3d; flex: 1;
            }
            .card:hover { border-color: var(--accent); background: rgba(0, 243, 255, 0.02); }
            .card h3 { font-size: 12px; letter-spacing: 4px; margin-bottom: 15px; color: var(--accent); }
            .card p { font-size: 10px; color: #666; line-height: 1.6; }

            /* Terminal Overlay */
            #cli-layer { 
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: #000; z-index: 10001; display: none; flex-direction: column; 
                padding: 40px 20px; font-family: 'Space Mono', monospace; 
            }
            @media (min-width: 1024px) { #cli-layer { padding: 80px; } }
            #cli-output { flex-grow: 1; overflow-y: auto; color: var(--accent); font-size: 11px; margin-bottom: 20px; }
            .term-prompt { color: var(--accent); font-weight: bold; margin-right: 10px; }
            #cli-input { background: transparent; border: none; color: #fff; width: 100%; outline: none; font-size: 14px; }

            .blink { display: inline-block; width: 5px; height: 5px; background: var(--accent); border-radius: 50%; animation: pulse 1s infinite; margin-right: 10px; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
            
            /* Mobile Terminal Toggle */
            #term-toggle { 
                position: fixed; bottom: 80px; right: 20px; z-index: 600; 
                background: var(--accent); color: #000; border: none; padding: 12px;
                font-family: inherit; font-size: 10px; font-weight: bold; 
                display: block;
            }
            @media (min-width: 1024px) { #term-toggle { display: none; } }
        </style>
    </head>
    <body>
        <div id="cursor"></div>
        <div id="cursor-ring"></div>
        <div class="noise"></div>
        <canvas id="neural-bg"></canvas>

        <div class="hud t-l">LINK: SOVEREIGN<br>V17.0.U</div>
        <div class="hud t-r">BANDUNG_ID<br>107.6°E -6.9°S</div>
        <div class="hud b-l">KHANSA_NODE<br><span style="color:var(--accent)"><span class="blink"></span>SYNC_ACTIVE</span></div>
        <div class="hud b-r">2309_ARCHIVE<br>STABLE_CONNECTION</div>

        <button id="term-toggle" onclick="toggleCLI()">OPEN_TERMINAL</button>

        <div id="cli-layer">
            <div id="cli-output"><div>[ NEURAL_TERMINAL v17.0 ]</div><div>Type 'help' or 'exit'.</div></div>
            <div style="display:flex; align-items:center;">
                <span class="term-prompt">></span>
                <input type="text" id="cli-input" autofocus autocomplete="off">
            </div>
        </div>

        <main>
            <h1 onmouseenter="expand()" onmouseleave="shrink()">KHANSA</h1>
            <div class="archive-deck">
                <div class="card" onmousemove="tilt(event, this)" onmouseleave="resetTilt(this)">
                    <h3>PROJECT_01</h3>
                    <p>OBSCRA: Neural link interface. High-end textile aesthetics meet informatics precision.</p>
                </div>
                <div class="card" onmousemove="tilt(event, this)" onmouseleave="resetTilt(this)">
                    <h3>PROJECT_02</h3>
                    <p>WASTE_PROTOCOL: Environmental data architecture for localized waste management systems.</p>
                </div>
            </div>
        </main>

        <script>
            const canvas = document.getElementById('neural-bg');
            const ctx = canvas.getContext('2d');
            const cliLayer = document.getElementById('cli-layer');
            const cliInput = document.getElementById('cli-input');
            const cliOutput = document.getElementById('cli-output');
            let particles = [];
            let mouse = { x: -1000, y: -1000 };

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            window.addEventListener('mousemove', e => {
                mouse.x = e.clientX; mouse.y = e.clientY;
                if (window.innerWidth >= 1024) {
                    document.getElementById('cursor').style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
                    document.getElementById('cursor-ring').style.transform = 'translate(' + (e.clientX - 20) + 'px,' + (e.clientY - 20) + 'px)';
                }
            });

            // CLI Logic
            function toggleCLI() {
                cliLayer.style.display = cliLayer.style.display === 'flex' ? 'none' : 'flex';
                if(cliLayer.style.display === 'flex') cliInput.focus();
            }

            document.addEventListener('keydown', e => {
                if (e.key === '~' || e.key === '\`') toggleCLI();
                if (e.key === 'Escape') cliLayer.style.display = 'none';
            });

            cliInput.addEventListener('keydown', async e => {
                if (e.key === 'Enter') {
                    const val = cliInput.value;
                    const cmd = val.toLowerCase().trim();
                    printOutput('<span class="term-prompt">></span> ' + val);
                    cliInput.value = '';
                    if (cmd === 'help') printOutput('WHOAMI, PROJECTS, STATUS, CLEAR, EXIT');
                    else if (cmd === 'whoami') printOutput('NAME: KHANSA // ROLE: FULLSTACK_ARCHITECT');
                    else if (cmd === 'exit') cliLayer.style.display = 'none';
                    else if (cmd === 'clear') cliOutput.innerHTML = '';
                    else if (cmd !== '') printOutput('UNKNOWN_COMMAND: ' + cmd);
                    cliOutput.scrollTop = cliOutput.scrollHeight;
                }
            });

            function printOutput(t) { const d = document.createElement('div'); d.innerHTML = t; cliOutput.appendChild(d); }

            // Mobile-Friendly Particles
            class Particle {
                constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.baseX = this.x; this.baseY = this.y;
                    this.size = Math.random() * 1.2;
                    this.density = (Math.random() * 20) + 1;
                }
                update() {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    if (distance < 120) {
                        this.x -= (dx / distance) * 5;
                        this.y -= (dy / distance) * 5;
                    } else {
                        if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
                        if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
                    }
                }
                draw() {
                    ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
                    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
                }
            }

            function init() { particles = []; for(let i=0; i< (window.innerWidth < 768 ? 60 : 150); i++) particles.push(new Particle()); }
            function animate() {
                ctx.clearRect(0,0,canvas.width,canvas.height);
                particles.forEach(p => { p.update(); p.draw(); });
                requestAnimationFrame(animate);
            }
            init(); animate();

            // Tilt - Desktop Only for Performance
            function tilt(e, el) {
                if (window.innerWidth < 1024) return;
                const rect = el.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width/2);
                const dy = e.clientY - (rect.top + rect.height/2);
                el.style.transform = 'rotateY('+(dx/15)+'deg) rotateX('+(-dy/15)+'deg) scale(1.02)';
            }
            function resetTilt(el) { el.style.transform = 'none'; }
            function expand() { if(window.innerWidth >= 1024) document.getElementById('cursor-ring').style.transform += ' scale(1.5)'; }
            function shrink() { if(window.innerWidth >= 1024) document.getElementById('cursor-ring').style.transform = document.getElementById('cursor-ring').style.transform.replace(' scale(1.5)', ''); }

            window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); });
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
