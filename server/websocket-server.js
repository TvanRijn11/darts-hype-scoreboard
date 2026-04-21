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

io.on("connection", (socket) => {
  socket.on("play-sound", (payload) => {
    const soundId =
      typeof payload === "string" ? payload : payload && payload.soundId;
    if (!soundId) return;

    // Play sound on the server machine
    playSoundOnServer(soundId);

    // Optionally still broadcast to any connected players
    io.emit("play-sound", { soundId });
  });

  socket.on("start-voice", () => {
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

  voicePlayerProcess.stdin.on("error", () => {
    // Stdin error (usually voice stop)
  });

  voicePlayerProcess.on("error", (err) => {
    // Failed to start aplay
  });
});

socket.on("voice-data", (data) => {
    if (!data) return;

    try {
      const audioBuffer = Buffer.from(data);

      if (voicePlayerProcess && voicePlayerProcess.stdin.writable) {
        voicePlayerProcess.stdin.write(audioBuffer);
      }
    } catch {
      // Error processing voice data
    }
  });

  socket.on("stop-voice", () => {
    if (voicePlayerProcess) {
      voicePlayerProcess.kill();
      voicePlayerProcess = null;
    }
  });
});

// Play sound on the server's audio output
let currentAudioProcess = null;

// Get audio device from env or auto-detect
const AUDIO_DEVICE = process.env.AUDIO_DEVICE || null;

// Detect correct sounds directory
function getSoundsDir() {
  // Try common locations
  const possiblePaths = [
    process.env.SOUNDS_DIR || "",
    path.join(__dirname, "..", "public", "sounds"),
    path.join(__dirname, "..", "..", "public", "sounds"),
    "/home/pi/darts-hype-scoreboard/public/sounds",
    "/root/darts-hype-scoreboard/public/sounds",
  ];

  for (const dir of possiblePaths) {
    if (dir && require("fs").existsSync(dir)) {
      return dir;
    }
  }

  // Fallback to __dirname parent
  return path.join(__dirname, "..", "public", "sounds");
}

const SOUNDS_DIR = getSoundsDir();

function playSoundOnServer(soundId) {
  const soundPath = SOUND_PATHS[soundId];
  if (!soundPath) {
    return;
  }

  // Kill any currently playing sound
  if (currentAudioProcess) {
    currentAudioProcess.kill("SIGKILL");
    currentAudioProcess = null;
  }

  // Full path to sound file
  const fullPath = path.join(SOUNDS_DIR, path.basename(soundPath));

  // Try ffplay first (handles MP3 better), fallback to aplay
  const useFFplay = true; // Set to false to use aplay

  if (useFFplay) {
    // Use ffplay - nodisp (no video), autoexit (close when done)
    const ffplayArgs = ["-nodisp", "-autoexit", "-volume", "150", fullPath];
    currentAudioProcess = spawn("ffplay", ffplayArgs);
  } else {
    // Build aplay command with optional device
    const aplayArgs = AUDIO_DEVICE ? ["-D", AUDIO_DEVICE, fullPath] : [fullPath];
    currentAudioProcess = spawn("aplay", aplayArgs);
  }

  currentAudioProcess.on("error", () => {
    currentAudioProcess = null;
  });

  currentAudioProcess.on("close", () => {
    currentAudioProcess = null;
  });
}

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
httpServer.on("error", (err) => {
  console.log("[WS] Server error:", err.message);
  console.log("[WS] Error code:", err.code);
});

httpServer.listen(PORT, async () => {
  console.log(`[WS] Server listening on :${PORT}`);

  if (USE_NGROK) {
    try {
      await startNgrokTunnel();
    } catch (err) {
      console.log("Running without ngrok tunnel");
    }
  }
});
