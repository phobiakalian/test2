const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

app.get('/intel', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    const ua = req.headers['user-agent'];
    const device = ua.includes('Mobile') ? '📱 Mobile' : '💻 Desktop';
    const page = req.query.view || 'Unknown';
    
    await bot.telegram.sendMessage(MY_CHAT_ID, 
        `🌑 *OBSCRA ACCESS LOG*\n` +
        `────────────────────\n` +
        `👁️ View: *${page.toUpperCase()}*\n` +
        `🌐 IP: \`${ip}\`\n` +
        `📟 Dev: ${device}\n` +
        `────────────────────`, { parse_mode: 'Markdown' });
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
        <title>OBSCRA — ARCHIVE 23.10</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;600&family=Playfair+Display:ital,wght@1,300&display=swap" rel="stylesheet">
        <style>
            :root { --bg: #000000; --fg: #ffffff; --accent: #666666; --glass: rgba(255,255,255,0.03); }
            * { margin: 0; padding: 0; box-sizing: border-box; cursor: none; }
            
            body, html { 
                background: var(--bg); color: var(--fg); 
                font-family: 'Inter', sans-serif; overflow: hidden; 
                height: 100vh; width: 100vw;
            }

            /* Premium Custom Cursor */
            #cursor { 
                width: 8px; height: 8px; background: #fff; 
                border-radius: 50%; position: fixed; pointer-events: none; 
                z-index: 9999; transition: transform 0.15s ease-out; 
            }
            #cursor-follower { 
                width: 40px; height: 40px; border: 1px solid rgba(255,255,255,0.2); 
                border-radius: 50%; position: fixed; pointer-events: none; 
                z-index: 9998; transition: transform 0.3s ease-out; 
            }

            /* Grainy Texture */
            .noise { 
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: url('https://grainy-gradients.vercel.app/noise.svg'); 
                opacity: 0.05; pointer-events: none; z-index: 100; 
            }

            /* Navigation Elite */
            nav { 
                position: fixed; top: 0; left: 0; width: 100%; height: 100px;
                display: flex; align-items: center; justify-content: space-between;
                padding: 0 60px; z-index: 200; backdrop-filter: blur(10px);
            }
            .brand { font-weight: 600; letter-spacing: 10px; font-size: 0.8rem; }
            .nav-links { display: flex; gap: 40px; }
            .nav-link { 
                font-size: 9px; text-transform: uppercase; letter-spacing: 4px; 
                text-decoration: none; color: var(--accent); transition: 0.4s; 
            }
            .nav-link:hover, .nav-link.active { color: #fff; }

            /* Page Architecture */
            .container { position: relative; width: 100%; height: 100%; }
            .section { 
                position: absolute; width: 100%; height: 100%; 
                display: none; padding: 120px 60px 60px;
                flex-direction: column; align-items: center; justify-content: center;
            }
            .section.active { display: flex; animation: pageIn 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards; }

            /* Home Content */
            .hero-title { font-size: clamp(4rem, 18vw, 12rem); font-weight: 100; letter-spacing: -5px; line-height: 0.8; }
            .hero-sub { font-family: 'Playfair Display', serif; font-style: italic; color: var(--accent); margin-top: 20px; font-size: 1.5rem; }

            /* Archive Grid */
            .archive-grid { 
                display: grid; grid-template-columns: repeat(3, 1fr); 
                gap: 20px; width: 100%; max-width: 1400px; height: 70vh; 
            }
            .archive-item { 
                position: relative; background: var(--glass); 
                border: 1px solid rgba(255,255,255,0.05); overflow: hidden;
                transition: 0.6s cubic-bezier(0.19, 1, 0.22, 1);
            }
            .archive-item img { width: 100%; height: 100%; object-fit: cover; opacity: 0.5; transition: 0.8s; }
            .archive-item:hover img { opacity: 1; transform: scale(1.05); }
            .archive-label { 
                position: absolute; bottom: 30px; left: 30px; 
                font-size: 10px; letter-spacing: 3px; font-weight: 600; 
                opacity: 0; transform: translateY(10px); transition: 0.4s;
            }
            .archive-item:hover .archive-label { opacity: 1; transform: translateY(0); }

            /* About Content */
            .about-text { max-width: 800px; text-align: center; line-height: 2; letter-spacing: 1px; color: #aaa; font-weight: 100; font-size: 14px;}

            @keyframes pageIn {
                from { opacity: 0; transform: scale(1.05); filter: blur(10px); }
                to { opacity: 1; transform: scale(1); filter: blur(0); }
            }

            @media (max-width: 768px) {
                nav { padding: 0 30px; }
                .nav-links { display: none; } /* Mobile simplicity */
                .archive-grid { grid-template-columns: 1fr; }
            }
        </style>
    </head>
    <body>
        <div id="cursor"></div>
        <div id="cursor-follower"></div>
        <div class="noise"></div>
        
        <nav>
            <div class="brand">OBSCRA</div>
            <div class="nav-links">
                <a href="#" class="nav-link active" onclick="navigate('home')">Home</a>
                <a href="#" class="nav-link" onclick="navigate('archive')">Archive</a>
                <a href="#" class="nav-link" onclick="navigate('about')">The Studio</a>
            </div>
        </nav>

        <div class="container">
            <section id="home" class="section active">
                <h1 class="hero-title">OBSCRA</h1>
                <p class="hero-sub">The Architecture of Silence</p>
            </section>

            <section id="archive" class="section">
                <div class="archive-grid">
                    <div class="archive-item">
                        <img src="https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=1000">
                        <div class="archive-label">01 / NOIR SHADOW</div>
                    </div>
                    <div class="archive-item">
                        <img src="https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?q=80&w=1000">
                        <div class="archive-label">02 / GRIS OVERSIZE</div>
                    </div>
                    <div class="archive-item">
                        <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000">
                        <div class="archive-label">03 / BLANC MINIMAL</div>
                    </div>
                </div>
            </section>

            <section id="about" class="section">
                <p class="about-text">
                    <span style="color:#fff; font-weight:600;">OBSCRA</span> IS A MULTIDISCIPLINARY DESIGN ENTITY. WE EXPLORE THE INTERSECTION OF INFORMATICS PRECISION AND TEXTILE AESTHETICS. EVERY COLLECTION IS A DATA POINT IN OUR ONGOING EVOLUTION. BASED IN BANDUNG, INDONESIA.
                </p>
            </section>
        </div>

        <script>
            // Elite Navigation Logic
            function navigate(id) {
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                
                document.getElementById(id).classList.add('active');
                event.target.classList.add('active');
                
                // Trigger Intel Report
                fetch('/intel?view=' + id);
            }

            // Premium Cursor Tracking
            const cursor = document.getElementById('cursor');
            const follower = document.getElementById('cursor-follower');
            
            document.addEventListener('mousemove', e => {
                const x = e.clientX;
                const y = e.clientY;
                
                cursor.style.transform = \`translate3d(\${x - 4}px, \${y - 4}px, 0)\`;
                follower.style.transform = \`translate3d(\${x - 20}px, \${y - 20}px, 0)\`;
            });

            // Hover interactions
            document.querySelectorAll('a, .archive-item').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    follower.style.transform += ' scale(1.5)';
                    follower.style.background = 'rgba(255,255,255,0.1)';
                });
                el.addEventListener('mouseleave', () => {
                    follower.style.transform = follower.style.transform.replace(' scale(1.5)', '');
                    follower.style.background = 'transparent';
                });
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
