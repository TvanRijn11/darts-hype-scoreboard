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
  "180": "sounds/180.mp3",
  bust: "sounds/bust.mp3",
  winner: "sounds/winner.mp3",
  "67": "sounds/67.mp3",
  "indian-song": "sounds/indian-song.mp3",
  "luke-the-nuke": "sounds/luke-the-nuke.mp3",
  "seven nation army": "sounds/seven-nation-army.mp3",
  shame: "sounds/shame.mp3",
};

let currentAudioProcess = null;


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
});

const PORT = process.env.WS_PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on :${PORT}`);
});

