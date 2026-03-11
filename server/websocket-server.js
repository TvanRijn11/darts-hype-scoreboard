// Plain Node.js WebSocket server (CommonJS)
const { createServer } = require("http");
const path = require("path");
const { spawn } = require("child_process");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const parseAllowedOrigins = () => {
  const raw = process.env.WS_ALLOWED_ORIGINS;
  if (!raw) return "*";
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return "*";
  if (parts.includes("*")) return "*";
  return parts;
};

const io = new Server(httpServer, {
  cors: {
    origin: parseAllowedOrigins(),
  },
});

// Map sound IDs to audio file paths relative to /public
const SOUND_PATHS = {
  '180': '/sounds/180.mp3',
  '67': '/sounds/67.mp3',
  'indian-song': '/sounds/indian-song.mp3',
  'luke-the-nuke': '/sounds/luke-the-nuke.mp3',
  'seven nation army': '/sounds/seven-nation-army.mp3',
  'kip': '/sounds/kip.mp3',
  'messi': '/sounds/messi.mp3',
  'trap': '/sounds/trap.mp3',
  'brainrot': '/sounds/brainrot.mp3',
  'fbi': '/sounds/fbi.mp3',
  'granny': '/sounds/granny.mp3',
  'hema': '/sounds/hema.mp3',
  'poepen': '/sounds/poepen.mp3',
  'scream': '/sounds/scream.mp3',
  'sinterklaasjournaal': '/sounds/sinterklaasjournaal.mp3',
  'spetterpoep': '/sounds/spetterpoep.mp3',
  'watermeloen': '/sounds/watermeloen.mp3',
  'running': '/sounds/running.mp3',
  'angelo': '/sounds/angelo.mp3',
  'luchtalarm': '/sounds/luchtalarm.mp3',
  'kale-dikke': '/sounds/kale-dikke.mp3',
  'boef': '/sounds/boef-x-mooie-dag.mp3',
  'dat-moet-jeniet-willen': '/sounds/dat-moet-jeniet-willen.mp3',
  'ik-dacht-dat-dat-kon': '/sounds/ik-dacht-dat-dat-kon.mp3',
  'joel': '/sounds/joel.mp3',
  'noortje': '/sounds/noortje.mp3',
  'wervelstorm': '/sounds/wervelstorm.mp3',
};

let currentAudioProcess = null;
let voicePlayerProcess = null;


function playSoundOnServer(soundId) {
  const relativePath = SOUND_PATHS[soundId];
  if (!relativePath) {
    console.warn("Unknown soundId:", soundId);
    return;
  }

  const filePath = path.join(__dirname, "..", "public", relativePath);

  // Choose a simple CLI audio player depending on platform
  const isMac = process.platform === "darwin";
  const player = isMac ? "afplay" : "mpg123";
  const args = [filePath];

  // Stop any currently playing sound before starting the next
  if (currentAudioProcess && !currentAudioProcess.killed) {
    try {
      currentAudioProcess.kill("SIGKILL");
    } catch (e) {
      // ignore
    }
  }

  const child = spawn(player, args, { stdio: "ignore" });
  currentAudioProcess = child;

  child.on("error", (err) => {
    console.error("Failed to play sound on server:", err.message);
  });

  child.on("exit", () => {
    if (currentAudioProcess === child) currentAudioProcess = null;
  });
}

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  // client: socket.emit("play-sound", { soundId })
  // (also accepts legacy payloads like { roomId, soundId } or just "soundId")
  socket.on("play-sound", (payload) => {
    const soundId =
      typeof payload === "string" ? payload : payload && payload.soundId;
    if (!soundId) return;
    console.log(`play-sound ${soundId}`);

    // Play sound on the server machine
    playSoundOnServer(soundId);

    // Optionally still broadcast to any connected players
    io.emit("play-sound", { soundId });
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
  });

  socket.on("start-voice", () => {
    console.log("Mic stream started");

    const command = "aplay";
    // We add "-D bluealsa" for bluetooth, or "-D hw:1,0" or "-D plughw:CARD=Headphones"
    // Let's try "default" first, then a specific hardware path
    const args = [
      "-D", "plughw:2,0", // or try "plughw:CARD=Headphones,DEV=0"
      "-f", "S16_LE",
      "-r", "44100",
      "-c", "1",
      "-t", "raw",
      "-"
    ];

    voicePlayerProcess = spawn(command, args);
    // ... rest of your code

  voicePlayerProcess.stdin.on("error", (err) => {
    // This catches the EPIPE so the server doesn't crash
    console.error("Stdin Error (usually voice stop):", err.message);
  });

  voicePlayerProcess.on("error", (err) => {
    console.error("Failed to start aplay. Is it installed?", err.message);
  });
});

  socket.on("voice-data", (data) => {
    // 1. Check if data actually exists
    if (!data) return;

    try {
      // 2. Convert to Node.js Buffer (Socket.io usually sends a Buffer or ArrayBuffer)
      const audioBuffer = Buffer.from(data);

      // 3. Debug: Only log every ~100th packet to see it's working without lag
      if (Math.random() > 0.99) {
        console.log(`Streaming ${audioBuffer.length} bytes to audio player...`);
      }

      // 4. Write to the player's stdin
      if (voicePlayerProcess && voicePlayerProcess.stdin.writable) {
        voicePlayerProcess.stdin.write(audioBuffer);
      }
    } catch (err) {
      console.error("Error processing voice-data:", err);
    }
  });

  socket.on("stop-voice", () => {
    console.log("Mic stream stopped");
    if (voicePlayerProcess) {
      voicePlayerProcess.kill();
      voicePlayerProcess = null;
    }
  });
});

const PORT = process.env.WS_PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on :${PORT}`);
});

