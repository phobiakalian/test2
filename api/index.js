const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

// Log akses tetap aktif
app.get('/intel', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    const page = req.query.view || 'Home';
    await bot.telegram.sendMessage(MY_CHAT_ID, `🌑 *OBSCRA LOG*: View ${page} from ${ip}`, { parse_mode: 'Markdown' });
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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;700&family=Playfair+Display:ital,wght@1,400&display=swap" rel="stylesheet">
        <style>
            :root { --bg: #050505; --fg: #ffffff; --accent: #666; --border: rgba(255,255,255,0.05); }
            * { margin: 0; padding: 0; box-sizing: border-box; cursor: none; }
            body { background: var(--bg); color: var(--fg); font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
            
            #cursor { width: 8px; height: 8px; background: #fff; border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transition: transform 0.1s ease; mix-blend-mode: difference; }
            .noise { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: url('https://grainy-gradients.vercel.app/noise.svg'); opacity: 0.05; pointer-events: none; z-index: 100; }

            nav { position: fixed; top: 0; width: 100%; height: 80px; display: flex; align-items: center; justify-content: space-between; padding: 0 5%; z-index: 200; backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
            .nav-link { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; text-decoration: none; color: var(--accent); transition: 0.4s; }
            .nav-link:hover { color: #fff; }

            /* HERO SECTION */
            .hero { height: 110vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 10%; }
            .hero-title { font-size: clamp(4rem, 15vw, 10rem); font-weight: 700; letter-spacing: -5px; line-height: 0.9; }
            .hero-manifesto { max-width: 500px; margin-top: 40px; font-size: 14px; line-height: 1.8; color: #888; font-weight: 200; letter-spacing: 1px; }

            /* PRODUCT SHOWCASE SECTION */
            .showcase { padding: 100px 5%; display: grid; grid-template-columns: 1fr 1fr; gap: 100px; align-items: center; }
            .showcase-img { width: 100%; height: 700px; background: #111; overflow: hidden; border: 1px solid var(--border); }
            .showcase-img img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1); transition: 1s cubic-bezier(0.19, 1, 0.22, 1); }
            .showcase-img:hover img { filter: grayscale(0); transform: scale(1.05); }
            
            .showcase-text { padding: 40px; }
            .showcase-text h2 { font-family: 'Playfair Display', serif; font-style: italic; font-size: 3rem; font-weight: 200; margin-bottom: 20px; }
            .showcase-text p { font-size: 13px; color: #666; line-height: 2; margin-bottom: 30px; letter-spacing: 1px; }

            /* FOOTER STORY */
            .story { padding: 150px 10%; text-align: center; border-top: 1px solid var(--border); }
            .story h3 { font-size: 10px; letter-spacing: 8px; color: #444; margin-bottom: 30px; }
            .story p { font-size: 2rem; font-weight: 200; line-height: 1.4; max-width: 900px; margin: 0 auto; color: #ccc; }

            .btn-minimal { display: inline-block; padding: 15px 40px; border: 1px solid #fff; color: #fff; text-decoration: none; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; transition: 0.3s; }
            .btn-minimal:hover { background: #fff; color: #000; }

            @media (max-width: 768px) { .showcase { grid-template-columns: 1fr; gap: 40px; } }
        </style>
    </head>
    <body>
        <div id="cursor"></div>
        <div class="noise"></div>
        
        <nav>
            <div style="font-weight:700; letter-spacing:8px; font-size:12px;">OBSCRA</div>
            <div style="display:flex; gap:30px;">
                <a href="/" class="nav-link">Index</a>
                <a href="#" class="nav-link">Collections</a>
            </div>
        </nav>

        <section class="hero">
            <h1 class="hero-title">BEYOND<br>THE VOID</h1>
            <p class="hero-manifesto">
                In a world of constant noise, we choose the elegance of silence. OBSCRA is an experiment in digital minimalism, where informatics meets the raw texture of modern garments.
            </p>
            <div style="margin-top: 50px;">
                <a href="#explore" class="btn-minimal">Explore Archive</a>
            </div>
        </section>

        <section id="explore" class="showcase">
            <div class="showcase-img">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000">
            </div>
            <div class="showcase-text">
                <p style="color:#444; font-size:10px; letter-spacing:4px;">01 / CORE PIECE</p>
                <h2>The Shadow Hoodie</h2>
                <p>Designed with a structural silhouette that defies standard proportions. Made from 100% heavyweight cotton with a specialized noir-dye finish. Every stitch is a line of code in our physical reality.</p>
                <a href="#" class="btn-minimal">View Details</a>
            </div>
        </section>

        <section class="showcase" style="direction: rtl;">
            <div class="showcase-img">
                <img src="https://images.unsplash.com/photo-1539109132304-972993896197?q=80&w=1000">
            </div>
            <div class="showcase-text" style="direction: ltr;">
                <p style="color:#444; font-size:10px; letter-spacing:4px;">02 / ESSENTIAL</p>
                <h2>Gris Tech Overcoat</h2>
                <p>A fusion of utility and aesthetic. The Gris Tech Overcoat features water-resistant fabric and hidden internal pockets, designed for the modern architect of data. Minimalism refined to its purest state.</p>
                <a href="#" class="btn-minimal">View Details</a>
            </div>
        </section>

        <section class="story">
            <h3>OUR PHILOSOPHY</h3>
            <p>"We don't just create clothes. We build interfaces for the human body. Every collection is an update, every garment is a patch for the modern world."</p>
            <div style="margin-top: 60px; font-size: 11px; letter-spacing: 2px; color: #444;">
                OBSCRA DIGITAL ARCHIVE — BANDUNG 2026
            </div>
        </section>

        <script>
            const cursor = document.getElementById('cursor');
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX - 4 + 'px';
                cursor.style.top = e.clientY - 4 + 'px';
            });
            
            // Intel Log
            window.onload = () => fetch('/intel?view=homepage_story');
        </script>
    </body>
    </html>
    `);
});

app.post('/api/bot', async (req, res) => {
    try { await bot.handleUpdate(req.body); res.status(200).send('OK'); } catch (e) { res.status(500).send('ERR'); }
});

module.exports = app;
