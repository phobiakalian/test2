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
            body, html { background: var(--bg); color: #fff; font-family: 'Space Mono', monospace; height: 100vh; width: 100vw; overflow: hidden; }
            #cursor { width: 4px; height: 4px; background: var(--accent); border-radius: 50%; position: fixed; pointer-events: none; z-index: 10000; }
            #cursor-ring { width: 40px; height: 40px; border: 1px solid rgba(0, 243, 255, 0.2); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1); }
            canvas { position: fixed; top: 0; left: 0; z-index: 1; pointer-events: none; }
            .noise { position: fixed; top:0; left:0; width:100%; height:100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.08; pointer-events: none; z-index: 100; }
            .hud { position: fixed; padding: 40px; z-index: 500; font-size: 9px; letter-spacing: 3px; color: #444; text-transform: uppercase; }
            .top-left { top: 0; left: 0; }
            .top-right { top: 0; right: 0; text-align: right; }
            .bottom-left { bottom: 0; left: 0; }
            .bottom-right { bottom: 0; right: 0; text-align: right; }
            .glitch-text { animation: glitch 5s infinite; color: var(--accent); }
            @keyframes glitch { 0% { opacity: 1; } 50% { opacity: 0.5; } 52% { opacity: 1; } 100% { opacity: 1; } }
            .main-frame { position: relative; z-index: 10; height: 100vh; display: flex; align-items: center; justify-content: center; }
            .central-hub { text-align: center; }
            h1 { font-family: 'Syncopate', sans-serif; font-size: clamp(3rem, 10vw, 8rem); letter-spacing: -5px; line-height: 0.8; margin-bottom: 20px; }
            .archive-deck { display: flex; gap: 30px; margin-top: 50px; perspective: 1000px; }
            .card { width: 300px; height: 400px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); padding: 30px; transition: 0.5s ease; transform-style: preserve-3d; }
            .card:hover { border-color: var(--accent); background: rgba(0, 243, 255, 0.03); }
            .card h3 { font-size: 14px; letter-spacing: 5px; margin-bottom: 20px; }
            .card p { font-size: 10px; color: #666; line-height: 1.8; }
            #cli-layer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.95); z-index: 10001; display: none; flex-direction: column; padding: 60px; font-family: 'Space Mono', monospace; border: 1px solid var(--accent); }
            #cli-output { flex-grow: 1; overflow-y: auto; color: var(--accent); font-size: 12px; line-height: 1.6; margin-bottom: 20px; }
            #cli-input-wrapper { display: flex; align-items: center; gap: 10px; }
            #cli-input { background: transparent; border: none; color: #fff; width: 100%; outline: none; font-family: inherit; font-size: 14px; }
            .term-prompt { color: var(--accent); font-weight: bold; }
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
        <div class="hud top-left"><div class="glitch-text">SIGNAL: SOVEREIGN</div><div>VER: 16.0.8 / 2309</div></div>
        <div class="hud top-right"><div>LOC: BANDUNG_ID // 107.6°E -6.9°S</div><div>UPLINK: ACTIVE</div></div>
        <div class="hud bottom-left"><div>KHANSA_NET_NODE</div><div class="status-bar"><div class="blink"></div> DATA_STREAMING...</div></div>
        <div id="cli-layer">
            <div id="cli-output"><div style="color: #fff; margin-bottom: 20px;">[ OBSCRA TERMINAL v1.0.4 - AUTHORIZED ACCESS ONLY ]</div><div>Type 'help' to see available protocols.</div></div>
            <div id="cli-input-wrapper"><span class="term-prompt">khansa@neural_archive:~$</span><input type="text" id="cli-input" autofocus autocomplete="off"></div>
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
            const canvas = document.getElementById('neural-bg');
            const ctx = canvas.getContext('2d');
            const cliLayer = document.getElementById('cli-layer');
            const cliInput = document.getElementById('cli-input');
            const cliOutput = document.getElementById('cli-output');
            let particles = [];
            let mouse = { x: -100, y: -100 };
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            window.addEventListener('mousemove', e => {
                mouse.x = e.clientX; mouse.y = e.clientY;
                document.getElementById('cursor').style.left = e.clientX + 'px';
                document.getElementById('cursor').style.top = e.clientY + 'px';
                document.getElementById('cursor-ring').style.left = (e.clientX - 20) + 'px';
                document.getElementById('cursor-ring').style.top = (e.clientY - 20) + 'px';
            });
            document.addEventListener('keydown', e => {
                if (e.key === '~' || e.key === '\`') {
                    cliLayer.style.display = cliLayer.style.display === 'flex' ? 'none' : 'flex';
                    if (cliLayer.style.display === 'flex') setTimeout(() => cliInput.focus(), 10);
                }
                if (e.key === 'Escape') cliLayer.style.display = 'none';
            });
            cliInput.addEventListener('keydown', async e => {
                if (e.key === 'Enter') {
                    const val = cliInput.value;
                    const cmd = val.toLowerCase().trim();
                    printOutput('<span class="term-prompt">khansa@neural_archive:~$</span> ' + val);
                    cliInput.value = '';
                    await processCommand(cmd);
                    cliOutput.scrollTop = cliOutput.scrollHeight;
                }
            });
            class Particle {
                constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.size = Math.random() * 1.5;
                    this.baseX = this.x; this.baseY = this.y;
                    this.density = (Math.random() * 30) + 1;
                }
                draw() {
                    ctx.fillStyle = 'rgba(0, 243, 255, 0.3)';
                    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.closePath(); ctx.fill();
                }
                update() {
                    let dx = mouse.x - this.x; let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    let forceDirectionX = dx / distance; let forceDirectionY = dy / distance;
                    let maxDistance = 150;
                    let force = (maxDistance - distance) / maxDistance;
                    if (distance < maxDistance) {
                        this.x += forceDirectionX * force * this.density;
                        this.y += forceDirectionY * force * this.density;
                    } else {
                        if (this.x !== this.baseX) this.x -= (this.x - this.baseX)/10;
                        if (this.y !== this.baseY) this.y -= (this.y - this.baseY)/10;
                    }
                }
            }
            function init() { particles = []; for (let i = 0; i < 200; i++) particles.push(new Particle()); }
            function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); }
            init(); animate();
            function tilt(e, el) {
                const rect = el.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width/2);
                const dy = e.clientY - (rect.top + rect.height/2);
                el.style.transform = 'rotateY(' + (dx/10) + 'deg) rotateX(' + (-dy/10) + 'deg) scale(1.05)';
            }
            function resetTilt(el) { el.style.transform = 'rotateY(0) rotateX(0) scale(1)'; }
            function expand() { document.getElementById('cursor-ring').style.transform = 'scale(2)'; }
            function shrink() { document.getElementById('cursor-ring').style.transform = 'scale(1)'; }
            function printOutput(text) { const div = document.createElement('div'); div.innerHTML = text; cliOutput.appendChild(div); }
            async function processCommand(cmd) {
                switch(cmd) {
                    case 'help': printOutput('Available protocols:<br>- whoami : Identification<br>- projects : Extraction list<br>- status : Neural health<br>- clear : Wipe screen<br>- exit : Close terminal'); break;
                    case 'whoami': printOutput('IDENTITY: KHANSA<br>ROLE: FULL-STACK ARCHITECT<br>STATUS: INFORMATICS ENGINEERING STUDENT'); break;
                    case 'projects': printOutput('EXTRACTING ARCHIVES...<br>1. OBSCRA_INTERFACE [LIVE]<br>2. WASTE_BANK_SYS [STABLE]<br>3. NEURAL_PORTFOLIO_V16 [ACTIVE]'); break;
                    case 'status': printOutput('CPU: 100% | NEURAL_LINK: STABLE | YEAR: 2309 | UPLINK: VERIFIED'); break;
                    case 'clear': cliOutput.innerHTML = ''; break;
                    case 'exit': cliLayer.style.display = 'none'; break;
                    default: if(cmd !== '') printOutput('COMMAND NOT RECOGNIZED: ' + cmd);
                }
            }
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
