// Plain Node.js WebSocket server (CommonJS)
const { createServer } = require("http");
const path = require("path");
const { spawn } = require("child_process");
const express = require("express");
const { Server } = require("socket.io");

// Auto-generated sound paths from sounds.json
const { SOUND_PATHS } = require("./sounds");

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
    const args = [
      "-D", "plughw:2,0",
      "-f", "S16_LE",
      "-r", "44100",
      "-c", "1",
      "-t", "raw",
      "-"
    ];

    voicePlayerProcess = spawn(command, args);

  voicePlayerProcess.stdin.on("error", (err) => {
    console.error("Stdin Error (usually voice stop):", err.message);
  });

  voicePlayerProcess.on("error", (err) => {
    console.error("Failed to start aplay. Is it installed?", err.message);
  });
});

  socket.on("voice-data", (data) => {
    if (!data) return;

    try {
      const audioBuffer = Buffer.from(data);

      if (Math.random() > 0.99) {
        console.log(`Streaming ${audioBuffer.length} bytes to audio player...`);
      }

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
