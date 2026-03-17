// Plain Node.js WebSocket server (CommonJS)
const { createServer } = require("http");
const path = require("path");
const { spawn, exec } = require("child_process");
const express = require("express");
const { Server } = require("socket.io");

// Auto-generated sound paths from sounds.json
const { SOUND_PATHS } = require("./sounds");

const app = express();
const httpServer = createServer(app);

// Parse CORS origins from environment
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

const corsOrigins = parseAllowedOrigins();
console.log("CORS origins:", corsOrigins);

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Required for ngrok free tier WebSocket support
  allowEIO3: true,
  // Help with connection stability through ngrok
  pingTimeout: 60000,
  pingInterval: 25000,
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
const USE_NGROK = process.env.USE_NGROK === "true";
let ngrokProcess = null;

async function startNgrokTunnel() {
  return new Promise((resolve, reject) => {
    console.log("Starting ngrok tunnel...");

    // Check if ngrok is installed
    exec("which ngrok", (err) => {
      if (err) {
        console.error("ngrok not found. Install it from https://ngrok.com/download");
        reject(new Error("ngrok not installed"));
        return;
      }

      // Start ngrok tunnel
      ngrokProcess = spawn("ngrok", [
        "http",
        "--log=stdout",
        PORT.toString(),
      ], {
        stdio: ["ignore", "pipe", "pipe"],
      });

      let urlFound = false;

      ngrokProcess.stdout.on("data", (data) => {
        const output = data.toString();
        // Look for the ngrok URL in the output
        const urlMatch = output.match(/https:\/\/[a-zA-Z0-9\-]+\.ngrok-free\.app/);
        if (urlMatch && !urlFound) {
          urlFound = true;
          const ngrokUrl = urlMatch[0];
          console.log("\n========================================");
          console.log("NGROK TUNNEL URL:");
          console.log(ngrokUrl);
          console.log("========================================\n");
          console.log("Use this URL in your frontend (set NEXT_PUBLIC_WS_URL)");
          console.log("Or pass it via ?ws=<url> query parameter\n");

          // Optionally save to a file for easy access
          const fs = require("fs");
          fs.writeFileSync(
            path.join(__dirname, "ngrok-url.txt"),
            ngrokUrl
          );
          console.log("URL also saved to server/ngrok-url.txt");

          resolve(ngrokUrl);
        }
      });

      ngrokProcess.stderr.on("data", (data) => {
        // ngrok outputs some info to stderr, that's normal
        const output = data.toString();
        if (!output.includes("ts=conn") && !output.includes("msg=")) {
          console.error("ngrok:", output.trim());
        }
      });

      ngrokProcess.on("error", (err) => {
        console.error("Failed to start ngrok:", err.message);
        reject(err);
      });

      ngrokProcess.on("exit", (code) => {
        if (code !== 0) {
          console.log(`ngrok exited with code ${code}`);
        }
      });

      // Timeout after 10 seconds if no URL found
      setTimeout(() => {
        if (!urlFound) {
          console.log("Waiting for ngrok tunnel... (this may take a moment)");
        }
      }, 10000);
    });
  });
}

// Graceful shutdown
function shutdown() {
  console.log("\nShutting down...");
  if (ngrokProcess) {
    ngrokProcess.kill();
  }
  if (currentAudioProcess) {
    currentAudioProcess.kill("SIGKILL");
  }
  if (voicePlayerProcess) {
    voicePlayerProcess.kill();
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start server
httpServer.listen(PORT, async () => {
  console.log(`WebSocket server listening on :${PORT}`);

  if (USE_NGROK) {
    try {
      await startNgrokTunnel();
    } catch (err) {
      console.log("Running without ngrok tunnel");
    }
  }
});
