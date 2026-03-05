// Plain Node.js WebSocket server (CommonJS)
const { createServer } = require("http");
const path = require("path");
const { spawn } = require("child_process");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // TODO: lock down to your domain in production
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

  const child = spawn(player, args, { stdio: "ignore" });

  child.on("error", (err) => {
    console.error("Failed to play sound on server:", err.message);
  });
}

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  // client: socket.emit("join-room", { roomId, role: "controller" | "player" })
  socket.on("join-room", ({ roomId, role }) => {
    socket.join(roomId);
    socket.data = socket.data || {};
    socket.data.role = role;
    socket.data.roomId = roomId;
    console.log(`${socket.id} joined room ${roomId} as ${role}`);
  });

  // client: socket.emit("play-sound", { roomId, soundId })
  socket.on("play-sound", ({ roomId, soundId }) => {
    console.log(`play-sound ${soundId} in room ${roomId}`);

    // Play sound on the server machine
    playSoundOnServer(soundId);

    // Optionally still broadcast to any connected players
    io.to(roomId).emit("play-sound", { soundId });
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
  });
});

const PORT = process.env.WS_PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server listening on :${PORT}`);
});

