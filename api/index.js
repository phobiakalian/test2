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
        <title>KHANSA // KICAU PRECISION 2309</title>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syncopate:wght@700&display=swap" rel="stylesheet">
        
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>

        <style>
            :root { --accent: #00f3ff; --bg: #000; --glass: rgba(255,255,255,0.03); }
            * { margin: 0; padding: 0; box-sizing: border-box; cursor: none; }
            body, html { background: var(--bg); color: #fff; font-family: 'Space Mono', monospace; height: 100vh; width: 100vw; overflow: hidden; }
            
            #cursor { width: 4px; height: 4px; background: var(--accent); border-radius: 50%; position: fixed; pointer-events: none; z-index: 10000; }
            #cursor-ring { width: 40px; height: 40px; border: 1px solid rgba(0, 243, 255, 0.2); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1); }
            
            .hud { position: fixed; padding: 30px; z-index: 500; font-size: 9px; letter-spacing: 3px; color: #444; text-transform: uppercase; }
            .t-l { top: 0; left: 0; } .t-r { top: 0; right: 0; text-align: right; }
            
            /* SENSOR UI */
            #video-ui { position: fixed; bottom: 20px; right: 20px; width: 240px; border: 1px solid var(--accent); z-index: 600; background: #000; padding: 10px; display: none; }
            #webcam { width: 100%; height: auto; transform: scaleX(-1); border: 1px solid #222; }
            .debug-info { font-size: 8px; color: var(--accent); margin-top: 5px; font-family: monospace; }

            /* KUCING OVERLAY */
            #kucing-layer { 
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); 
                width: 80%; max-width: 500px; z-index: 10002; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
            }
            #kucing-layer.active { transform: translate(-50%, -50%) scale(1); }
            video#cat-vid { width: 100%; border: 2px solid var(--accent); box-shadow: 0 0 50px rgba(0,243,255,0.3); }

            /* CLI */
            #cli { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10001; display: none; flex-direction: column; padding: 60px; }
            #cli-out { flex-grow: 1; overflow-y: auto; color: var(--accent); font-size: 12px; }
            #cli-in { background: transparent; border: none; color: #fff; width: 100%; outline: none; font-family: inherit; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div id="cursor"></div><div id="cursor-ring"></div>
        <div class="hud t-l">KHANSA // NEURAL LINK<br>PRECISION_MODE: ACTIVE</div>
        <div class="hud t-r">BANDUNG_ID<br>2309_ARCHIVE</div>

        <div id="video-ui">
            <video id="webcam" autoplay playsinline></video>
            <div class="debug-info" id="db-mouth">MOUTH: NO</div>
            <div class="debug-info" id="db-wave">WAVE: NO</div>
            <div class="debug-info" id="db-count">GESTURE_COUNT: 0</div>
        </div>

        <div id="kucing-layer">
            <video id="cat-vid" loop muted playsinline>
                <source src="https://test2-gold-theta.vercel.app/cat.mp4" type="video/mp4">
            </video>
            <audio id="cat-audio" loop src="https://test2-gold-theta.vercel.app/cat_audio.mp3"></audio>
        </div>

        <div id="cli">
            <div id="cli-out"><div>[ OBSCRA PRECISION TERMINAL ]</div><div>Type 'kicau --start' to bind sensor.</div></div>
            <input type="text" id="cli-in" autofocus>
        </div>

        <main style="display:flex; height:100vh; align-items:center; justify-content:center;">
            <h1 style="font-family:'Syncopate'; font-size:10vw; letter-spacing:-10px;">KHANSA</h1>
        </main>

        <script>
            const videoElement = document.getElementById('webcam');
            const catVid = document.getElementById('cat-vid');
            const catAudio = document.getElementById('cat-audio');
            const cli = document.getElementById('cli');
            const cliIn = document.getElementById('cli-in');
            const dbMouth = document.getElementById('db-mouth');
            const dbWave = document.getElementById('db-wave');
            const dbCount = document.getElementById('db-count');

            let gestureCount = 0;
            let xHistory = [];
            const WINDOW_SIZE = 20;
            const MOVE_THRESHOLD = 0.08;
            const GESTURE_THRESHOLD = 8;
            let faceLandmarks = null;

            // 1. Setup MediaPipe Hands
            const hands = new Hands({locateFile: (file) => \`https://cdn.jsdelivr.net/npm/@mediapipe/hands/\${file}\`});
            hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.3 });
            hands.onResults(onHandResults);

            // 2. Setup MediaPipe FaceMesh
            const faceMesh = new FaceMesh({locateFile: (file) => \`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/\${file}\`});
            faceMesh.setOptions({ maxNumFaces: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.3 });
            faceMesh.onResults(results => { faceLandmarks = results.multiFaceLandmarks ? results.multiFaceLandmarks[0] : null; });

            function onHandResults(results) {
                let handNearMouth = false;
                let handWaving = false;

                if (results.multiHandLandmarks && faceLandmarks) {
                    const mouth = faceLandmarks[13]; // Titik bibir tengah
                    
                    results.multiHandLandmarks.forEach((hand, index) => {
                        const palm = hand[9]; // Middle finger MCP
                        const dist = Math.sqrt(Math.pow(palm.x - mouth.x, 2) + Math.pow(palm.y - mouth.y, 2));
                        
                        if (dist < 0.15) handNearMouth = true;

                        // Tracking gerakan untuk tangan kedua atau tangan yang sama
                        xHistory.push(palm.x);
                        if (xHistory.length > WINDOW_SIZE) xHistory.shift();

                        if (xHistory.length === WINDOW_SIZE) {
                            const movement = Math.max(...xHistory) - Math.min(...xHistory);
                            if (movement > MOVE_THRESHOLD) handWaving = true;
                        }
                    });
                }

                dbMouth.innerText = "MOUTH: " + (handNearMouth ? "YES" : "NO");
                dbWave.innerText = "WAVE: " + (handWaving ? "YES" : "NO");

                // Debounce Logic (Mirip Python Anda)
                if (handNearMouth && handWaving) {
                    gestureCount = Math.min(gestureCount + 2, GESTURE_THRESHOLD);
                } else {
                    gestureCount = Math.max(gestureCount - 1, 0);
                }

                dbCount.innerText = "GESTURE_COUNT: " + gestureCount;

                if (gestureCount >= GESTURE_THRESHOLD) {
                    if (catVid.paused) {
                        document.getElementById('kucing-layer').classList.add('active');
                        catVid.play();
                        catAudio.play();
                    }
                } else {
                    if (!catVid.paused) {
                        document.getElementById('kucing-layer').classList.remove('active');
                        catVid.pause();
                        catAudio.pause();
                        catVid.currentTime = 0;
                    }
                }
            }

            // 3. Camera Start
            async function startKicau() {
                document.getElementById('video-ui').style.display = 'block';
                const camera = new Camera(videoElement, {
                    onFrame: async () => {
                        await faceMesh.send({image: videoElement});
                        await hands.send({image: videoElement});
                    },
                    width: 240, height: 180
                });
                camera.start();
            }

            // 4. CLI Interaction
            cliIn.addEventListener('keydown', e => {
                if(e.key === 'Enter') {
                    if(cliIn.value === 'kicau --start') startKicau();
                    if(cliIn.value === 'exit') cli.style.display = 'none';
                    cliIn.value = '';
                }
            });
            document.addEventListener('keydown', e => { if(e.key === '~') cli.style.display = 'flex'; });

            // Cursor
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

module.exports = app;
