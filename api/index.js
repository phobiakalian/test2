const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MY_CHAT_ID = process.env.MY_CHAT_ID;

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KHANSA // NEURAL PRECISION 2309</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syncopate:wght@700&display=swap" rel="stylesheet">
        
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>

        <style>
            :root { --accent: #00f3ff; --bg: #000; --glass: rgba(255,255,255,0.03); }
            * { margin: 0; padding: 0; box-sizing: border-box; cursor: none; }
            body, html { background: var(--bg); color: #fff; font-family: 'Space Mono', monospace; height: 100vh; width: 100vw; overflow: hidden; }
            
            #cursor { width: 4px; height: 4px; background: var(--accent); border-radius: 50%; position: fixed; pointer-events: none; z-index: 10000; }
            #cursor-ring { width: 40px; height: 40px; border: 1px solid rgba(0, 243, 255, 0.2); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transition: transform 0.2s ease; }
            
            .hud { position: fixed; padding: 30px; z-index: 500; font-size: 9px; letter-spacing: 3px; color: #444; text-transform: uppercase; }
            .t-l { top: 0; left: 0; } .t-r { top: 0; right: 0; text-align: right; }

            /* SENSOR INTERFACE */
            #video-module { position: fixed; bottom: 20px; right: 20px; width: 220px; border: 1px solid var(--accent); z-index: 600; background: #000; padding: 10px; display: none; }
            #webcam { width: 100%; height: auto; transform: scaleX(-1); border: 1px solid #111; }
            .log { font-size: 8px; color: var(--accent); margin-top: 5px; font-family: monospace; }

            /* KICAU MANIA OVERLAY */
            #kicau-overlay { 
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); 
                width: 85%; max-width: 550px; z-index: 10002; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            }
            #kicau-overlay.active { transform: translate(-50%, -50%) scale(1); }
            video#cat-media { width: 100%; border: 1px solid var(--accent); }

            /* CLI TERMINAL */
            #cli { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.98); z-index: 10001; display: none; flex-direction: column; padding: 60px; }
            #cli-out { flex-grow: 1; overflow-y: auto; color: var(--accent); font-size: 11px; line-height: 1.8; }
            #cli-in { background: transparent; border: none; color: #fff; width: 100%; outline: none; font-family: inherit; margin-top: 20px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div id="cursor"></div><div id="cursor-ring"></div>
        <div class="hud t-l">KHANSA // NEURAL LINK<br>MODE: GESTURE_RECOGNITION</div>
        <div class="hud t-r">BANDUNG // ID<br>UPLINK: STABLE</div>

        <div id="video-module">
            <video id="webcam" autoplay playsinline></video>
            <div class="log" id="mouth-stat">MOUTH_PROXIMITY: NO</div>
            <div class="log" id="wave-stat">WAVE_MOTION: NO</div>
            <div class="log" id="count-stat">VOLTAGE_LEVEL: 0</div>
        </div>

        <div id="kicau-overlay">
            <video id="cat-media" loop muted playsinline>
                <source src="/cat.mp4" type="video/mp4">
            </video>
            <audio id="cat-audio" loop src="/cat_audio.mp3"></audio>
            <div style="text-align:center; padding:10px; font-size:9px; letter-spacing:5px; background:var(--accent); color:#000; font-weight:bold;">KICAU_MANIA_PROTOCOL_ENGAGED</div>
        </div>

        <div id="cli">
            <div id="cli-out"><div>[ KHANSA NEURAL COMMAND ]</div><div>Enter 'kicau --init' to bind gesture sensors.</div></div>
            <div style="display:flex; align-items:center;">
                <span style="color:var(--accent); margin-right:10px;">></span>
                <input type="text" id="cli-in" autofocus autocomplete="off">
            </div>
        </div>

        <main style="display:flex; height:100vh; align-items:center; justify-content:center;">
            <h1 style="font-family:'Syncopate'; font-size:12vw; letter-spacing:-12px; color:rgba(255,255,255,0.05);">KHANSA</h1>
        </main>

        <script>
            const videoElement = document.getElementById('webcam');
            const catMedia = document.getElementById('cat-media');
            const catAudio = document.getElementById('cat-audio');
            const cli = document.getElementById('cli');
            const cliIn = document.getElementById('cli-in');
            
            let gestureCount = 0;
            let xHistory = [];
            let faceLandmarks = null;
            const WINDOW_SIZE = 20;
            const MOVE_THRESHOLD = 0.07;
            const GESTURE_THRESHOLD = 8;

            // MediaPipe Logic
            const hands = new Hands({locateFile: (file) => \`https://cdn.jsdelivr.net/npm/@mediapipe/hands/\${file}\`});
            hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.4 });
            hands.onResults(onHandResults);

            const faceMesh = new FaceMesh({locateFile: (file) => \`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/\${file}\`});
            faceMesh.setOptions({ maxNumFaces: 1, minDetectionConfidence: 0.5 });
            faceMesh.onResults(results => { faceLandmarks = results.multiFaceLandmarks ? results.multiFaceLandmarks[0] : null; });

            function onHandResults(results) {
                let isNearMouth = false;
                let isWaving = false;

                if (results.multiHandLandmarks && faceLandmarks) {
                    const mouth = faceLandmarks[13]; // Middle lip
                    
                    results.multiHandLandmarks.forEach((hand) => {
                        const palm = hand[9]; // Palm center
                        const dist = Math.sqrt(Math.pow(palm.x - mouth.x, 2) + Math.pow(palm.y - mouth.y, 2));
                        
                        if (dist < 0.16) isNearMouth = true;

                        xHistory.push(palm.x);
                        if (xHistory.length > WINDOW_SIZE) xHistory.shift();

                        if (xHistory.length === WINDOW_SIZE) {
                            const moveRange = Math.max(...xHistory) - Math.min(...xHistory);
                            if (moveRange > MOVE_THRESHOLD) isWaving = true;
                        }
                    });
                }

                document.getElementById('mouth-stat').innerText = "MOUTH_PROXIMITY: " + (isNearMouth ? "YES" : "NO");
                document.getElementById('wave-stat').innerText = "WAVE_MOTION: " + (isWaving ? "YES" : "NO");

                // Debounce Logic
                if (isNearMouth && isWaving) {
                    gestureCount = Math.min(gestureCount + 2, GESTURE_THRESHOLD);
                } else {
                    gestureCount = Math.max(gestureCount - 1, 0);
                }

                document.getElementById('count-stat').innerText = "VOLTAGE_LEVEL: " + gestureCount;

                if (gestureCount >= GESTURE_THRESHOLD) {
                    if (catMedia.paused) {
                        document.getElementById('kicau-overlay').classList.add('active');
                        catMedia.play();
                        catAudio.play();
                    }
                } else {
                    if (!catMedia.paused) {
                        document.getElementById('kicau-overlay').classList.remove('active');
                        catMedia.pause();
                        catAudio.pause();
                        catMedia.currentTime = 0;
                    }
                }
            }

            async function initSensor() {
                document.getElementById('video-module').style.display = 'block';
                const camera = new Camera(videoElement, {
                    onFrame: async () => {
                        await faceMesh.send({image: videoElement});
                        await hands.send({image: videoElement});
                    },
                    width: 220, height: 165
                });
                camera.start();
            }

            // Interface Control
            cliIn.addEventListener('keydown', e => {
                if(e.key === 'Enter') {
                    if(cliIn.value === 'kicau --init') initSensor();
                    if(cliIn.value === 'exit') cli.style.display = 'none';
                    cliIn.value = '';
                }
            });
            document.addEventListener('keydown', e => { if(e.key === '~') cli.style.display = 'flex'; });

            // Neural Cursor
            document.addEventListener('mousemove', e => {
                document.getElementById('cursor').style.left = e.clientX + 'px';
                document.getElementById('cursor').style.top = e.clientY + 'px';
                document.getElementById('cursor-ring').style.transform = \`translate(\${e.clientX - 20}px, \${e.clientY - 20}px)\`;
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
