// Plain Node.js WebSocket server (CommonJS)
const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // TODO: lock down to your domain in production
  },
});

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

    // Send to everyone in this room
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

