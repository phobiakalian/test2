const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

// Log akses ke bot Telegram
app.get('/log', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    await bot.telegram.sendMessage(MY_CHAT_ID, `👁️ *GALLERY ACCESS*\nIP: \`${ip}\`\nPage: ${req.query.page || 'Unknown'}`, { parse_mode: 'Markdown' });
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
        <title>OBSCRA | Digital Archive</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;700&family=Playfair+Display:ital@1&display=swap" rel="stylesheet">
        <style>
            :root { --bg: #050505; --accent: #ffffff; --border: rgba(255,255,255,0.08); }
            * { margin: 0; padding: 0; box-sizing: border-box; cursor: none; }
            body, html { background: var(--bg); color: var(--accent); font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }
            
            #cursor { width: 15px; height: 15px; border: 1px solid var(--accent); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transition: transform 0.1s ease; mix-blend-mode: difference; }
            .noise { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.04; pointer-events: none; z-index: 100; }
            
            nav { position: fixed; top: 40px; width: 100%; display: flex; justify-content: center; gap: 50px; z-index: 150; mix-blend-mode: difference; }
            .nav-link { font-size: 10px; letter-spacing: 5px; text-transform: uppercase; color: #555; text-decoration: none; transition: 0.4s; }
            .nav-link:hover, .nav-link.active { color: #fff; }

            .page { display: none; width: 100%; min-height: 100vh; padding: 120px 20px 60px; flex-direction: column; align-items: center; }
            .page.active { display: flex; animation: slideUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; }

            /* Gallery System */
            .gallery-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; width: 100%; max-width: 1200px; }
            .gallery-item { position: relative; overflow: hidden; border: 1px solid var(--border); aspect-ratio: 3/4; background: #0a0a0a; transition: 0.5s; }
            .gallery-item:hover { border-color: #555; }
            .gallery-item img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; transition: 0.8s cubic-bezier(0.19, 1, 0.22, 1); }
            .gallery-item:hover img { opacity: 1; transform: scale(1.05); }
            
            .item-info { position: absolute; bottom: 20px; left: 20px; opacity: 0; transition: 0.4s; }
            .gallery-item:hover .item-info { opacity: 1; }
            .item-title { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; }

            /* Modal System */
            #modal { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.95); display: none; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(10px); }
            #modal img { max-width: 90%; max-height: 80%; border: 1px solid var(--border); }

            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        </style>
    </head>
    <body>
        <div id="cursor"></div>
        <div class="noise"></div>
        
        <nav>
            <a href="#" class="nav-link active" onclick="showPage('index')">Index</a>
            <a href="#" class="nav-link" onclick="showPage('collection')">Archive</a>
            <a href="#" class="nav-link" onclick="showPage('about')">About</a>
        </nav>

        <div id="index" class="page active">
            <h1 style="font-size: clamp(3rem, 15vw, 8rem); font-weight: 700; letter-spacing: -2px; margin-top: 15vh;">OBSCRA</h1>
            <p style="font-family:'Playfair Display', serif; font-style:italic; color:#666; font-size: 1.2rem;">Silence is a statement.</p>
        </div>

        <div id="collection" class="page">
            <div class="gallery-container">
                <div class="gallery-item" onclick="openModal('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000')">
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000">
                    <div class="item-info"><p class="item-title">ARCHIVE_01 / NOIR</p></div>
                </div>
                <div class="gallery-item" onclick="openModal('https://images.unsplash.com/photo-1539109132304-972993896197?auto=format&fit=crop&q=80&w=1000')">
                    <img src="https://images.unsplash.com/photo-1539109132304-972993896197?auto=format&fit=crop&q=80&w=1000">
                    <div class="item-info"><p class="item-title">ARCHIVE_02 / GRIS</p></div>
                </div>
                <div class="gallery-item" onclick="openModal('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000')">
                    <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000">
                    <div class="item-info"><p class="item-title">ARCHIVE_03 / BLANC</p></div>
                </div>
            </div>
        </div>

        <div id="about" class="page">
            <div style="max-width: 600px; text-align: center;">
                <h2 style="font-family:'Playfair Display', serif; font-style:italic; font-size: 2.5rem; margin-bottom: 30px;">The Studio</h2>
                <p style="font-size: 11px; line-height: 2.5; color: #888; letter-spacing: 2px;">
                    OBSCRA IS A MULTIDISCIPLINARY CREATIVE UNIT BASED IN BANDUNG. WE MERGE THE PRECISION OF COMPUTER SCIENCE WITH THE CHAOS OF STREETWEAR AESTHETICS. EVERY PIECE IS A FRAGMENT OF A LARGER DATA STREAM.
                </p>
            </div>
        </div>

        <div id="modal" onclick="this.style.display='none'"><img id="modalImg"></div>

        <script>
            function showPage(id) {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                document.getElementById(id).classList.add('active');
                event.target.classList.add('active');
                fetch('/log?page=' + id);
                window.scrollTo(0,0);
            }

            function openModal(src) {
                document.getElementById('modal').style.display = 'flex';
                document.getElementById('modalImg').src = src;
            }

            const cursor = document.getElementById('cursor');
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX - 7 + 'px';
                cursor.style.top = e.clientY - 7 + 'px';
            });
            
            document.addEventListener('mousedown', () => cursor.style.transform = 'scale(0.5)');
            document.addEventListener('mouseup', () => cursor.style.transform = 'scale(1)');
        </script>
    </body>
    </html>
    `);
});

app.post('/api/bot', async (req, res) => {
    try { await bot.handleUpdate(req.body); res.status(200).send('OK'); } catch (e) { res.status(500).send('ERR'); }
});

module.exports = app;
