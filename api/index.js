const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

// Intel tracking tetap aktif untuk monitoring traffic
app.get('/intel', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    await bot.telegram.sendMessage(MY_CHAT_ID, `👁️ *PORTFOLIO VIEWED*\nIP: \`${ip}\``, { parse_mode: 'Markdown' });
    res.status(200).send('OK');
});

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Khansa — Digital Archive</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;700&family=JetBrains+Mono:wght@100&display=swap" rel="stylesheet">
        <style>
            :root { --bg: #050505; --fg: #ffffff; --border: rgba(255,255,255,0.05); }
            * { margin: 0; padding: 0; box-sizing: border-box; cursor: none; }
            body { background: var(--bg); color: var(--fg); font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
            
            #cursor { width: 8px; height: 8px; background: #fff; border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transition: transform 0.1s ease; mix-blend-mode: difference; }
            .noise { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.05; pointer-events: none; z-index: 100; }

            nav { position: fixed; top: 0; width: 100%; height: 90px; display: flex; align-items: center; justify-content: space-between; padding: 0 5%; z-index: 200; backdrop-filter: blur(10px); }
            .nav-link { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 3px; text-decoration: none; color: #444; transition: 0.3s; }
            .nav-link:hover { color: #fff; }

            /* HERO SECTION */
            .hero { height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 0 10%; border-bottom: 1px solid var(--border); }
            .hero-label { font-family: 'JetBrains Mono', monospace; color: #333; font-size: 11px; margin-bottom: 30px; letter-spacing: 5px; }
            .hero h1 { font-size: clamp(3.5rem, 12vw, 9rem); font-weight: 700; letter-spacing: -5px; line-height: 0.85; }

            /* WORK SECTION (BARISAN PROYEK) */
            .work-container { padding: 0 0 100px 0; }
            .work-item { 
                display: flex; flex-direction: column; padding: 100px 10%;
                border-bottom: 1px solid var(--border); transition: 0.5s;
            }
            .work-item:hover { background: rgba(255,255,255,0.01); }
            
            .work-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
            .work-number { font-family: 'JetBrains Mono', monospace; color: #222; font-size: 4rem; font-weight: 100; line-height: 1; }
            .work-title { font-size: 3rem; font-weight: 400; letter-spacing: -2px; }
            
            .work-content { display: grid; grid-template-columns: 1fr 1.5fr; gap: 60px; align-items: center; }
            .work-desc { font-size: 16px; color: #666; line-height: 1.8; max-width: 400px; }
            .work-preview { 
                width: 100%; height: 500px; background: #0a0a0a; border: 1px solid var(--border);
                overflow: hidden; display: flex; align-items: center; justify-content: center;
            }
            .work-preview img { width: 100%; height: 100%; object-fit: cover; opacity: 0.4; transition: 0.8s cubic-bezier(0.19, 1, 0.22, 1); filter: grayscale(1); }
            .work-item:hover .work-preview img { opacity: 1; transform: scale(1.05); filter: grayscale(0); }

            /* ABOUT FOOTER */
            footer { padding: 150px 10%; text-align: center; }
            .footer-text { font-size: 1.5rem; font-weight: 200; color: #888; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            .contact-btn { display: inline-block; margin-top: 50px; padding: 20px 60px; border: 1px solid #333; color: #fff; text-decoration: none; font-size: 11px; letter-spacing: 5px; transition: 0.3s; }
            .contact-btn:hover { background: #fff; color: #000; border-color: #fff; }

            @media (max-width: 768px) {
                .work-content { grid-template-columns: 1fr; }
                .work-header { flex-direction: column; align-items: flex-start; }
                .work-title { font-size: 2rem; }
            }
        </style>
    </head>
    <body>
        <div id="cursor"></div>
        <div class="noise"></div>
        
        <nav>
            <div style="font-weight:700; letter-spacing:3px;">KHANSA</div>
            <div style="display:flex; gap:40px;">
                <a href="#work" class="nav-link">PROJECTS</a>
                <a href="mailto:your@email.com" class="nav-link">CONTACT</a>
            </div>
        </nav>

        <section class="hero">
            <div class="hero-label">/ / INFORMATICS ENGINEERING</div>
            <h1>BUILDING<br>DIGITAL<br>SYSTEMS.</h1>
        </section>

        <div class="work-container" id="work">
            <div class="work-item">
                <div class="work-header">
                    <h2 class="work-title">Obscra Interface</h2>
                    <span class="work-number">01</span>
                </div>
                <div class="work-content">
                    <p class="work-desc">Sebuah eksperimen desain yang menggabungkan estetika fashion minimalis dengan performa backend Node.js. Menjelajahi batas interaktivitas user dalam ruang digital yang gelap.</p>
                    <div class="work-preview">
                        <img src="https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=1200">
                    </div>
                </div>
            </div>

            <div class="work-item">
                <div class="work-header">
                    <h2 class="work-title">Waste Bank System</h2>
                    <span class="work-number">02</span>
                </div>
                <div class="work-content">
                    <p class="work-desc">Aplikasi manajemen data untuk optimalisasi bank sampah lokal. Fokus pada integritas data transaksi dan kemudahan penggunaan bagi nasabah di lapangan.</p>
                    <div class="work-preview">
                        <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200">
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <p class="footer-text">Saya percaya bahwa kode bukan hanya tentang fungsi, tapi tentang menciptakan pengalaman yang bermakna. Saat ini sedang mendalami arsitektur sistem di Bandung, Indonesia.</p>
            <a href="https://github.com/phobiakalian" class="contact-btn">VISIT GITHUB</a>
        </section>

        <script>
            const cursor = document.getElementById('cursor');
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX - 4 + 'px';
                cursor.style.top = e.clientY - 4 + 'px';
            });
            window.onload = () => fetch('/intel');
        </script>
    </body>
    </html>
    `);
});

app.post('/api/bot', async (req, res) => {
    try { await bot.handleUpdate(req.body); res.status(200).send('OK'); } catch (e) { res.status(500).send('ERR'); }
});

module.exports = app;
