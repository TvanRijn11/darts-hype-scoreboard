"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { SoundType } from "@/types/game";
import { onSoundPlayback, playSound } from "@/lib/sounds";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";

type OutputMode = "client" | "server";
type Role = "controller" | "player";
type PlaybackTarget = "device" | "server";
type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

const SOUNDS: Array<{ type: SoundType; label: string; borderColor: string }> = [
  { type: "180", label: "180!", borderColor: "emerald" },
  { type: "67", label: "67", borderColor: "purple" },
  { type: "indian-song", label: "INDIAN SONG", borderColor: "green" },
  { type: "luke-the-nuke", label: "LUKE THE NUKE", borderColor: "indigo" },
  {
    type: "seven nation army",
    label: "SEVEN NATION ARMY",
    borderColor: "teal",
  },
  { type: "kip", label: "KIP!", borderColor: "orange" },
  { type: "messi", label: "MESSI!", borderColor: "red" },
  { type: "trap", label: "TRAP!", borderColor: "yellow" },
  { type: "brainrot", label: "BRAINROT!", borderColor: "emerald" },
  { type: "fbi", label: "FBI OPEN UP!", borderColor: "purple" },
  { type: "granny", label: "GRANNY!", borderColor: "green" },
  { type: "hema", label: "HEMA!", borderColor: "indigo" },
  { type: "poepen", label: "POEPEN!", borderColor: "teal" },
  { type: "scream", label: "SCREAM!", borderColor: "orange" },
  {
    type: "sinterklaasjournaal",
    label: "SINTERKLAASJOURNAAL!",
    borderColor: "red",
  },
  { type: "spetterpoep", label: "SPETTERPOEP!", borderColor: "yellow" },
  { type: "watermeloen", label: "WATERMELOEN!", borderColor: "emerald" },
  { type: "running", label: "RUNNING!", borderColor: "purple" },
  { type: "angelo", label: "ANGELO!", borderColor: "green" },
  { type: "luchtalarm", label: "LUCHTALARM!", borderColor: "indigo" },
];

export const BigSoundboard: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [playingSound, setPlayingSound] = React.useState<SoundType | null>(
    null,
  );
  const [lastError, setLastError] = React.useState<string | null>(null);
  const serverPlayingTimeoutRef = React.useRef<number | null>(null);
  const wsUrl = WS_URL;
  // const [wsUrl, setWsUrl] = React.useState<string>(() => {
  //   if (WS_URL) return WS_URL;
  //   console.log("url");
  //   if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  //     return "http://localhost:4000";
  //   }
  //   return "";
  // });
  const [role, setRole] = React.useState<Role>("controller");
  const [outputMode, setOutputMode] = React.useState<OutputMode>("client");
  const [playbackTarget, setPlaybackTarget] =
    React.useState<PlaybackTarget>("device");
  const [connectionStatus, setConnectionStatus] =
    React.useState<ConnectionStatus>("idle");
  const [showServerConfig, setShowServerConfig] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const qRole = params.get("role");
    const qMode = params.get("mode");
    const qPlayback = params.get("playback");
    const qWs = params.get("ws");

    if (qRole === "controller" || qRole === "player") setRole(qRole);
    if (qMode === "client" || qMode === "server") setOutputMode(qMode);
    if (qPlayback === "device" || qPlayback === "server")
      setPlaybackTarget(qPlayback);
    // if (typeof qWs === "string" && qWs.trim()) setWsUrl(qWs.trim());

    // Fall back to localStorage (only if query param not provided)
    try {
      const lsRole = window.localStorage.getItem("darts.role");
      const lsMode = window.localStorage.getItem("darts.outputMode");
      const lsPlayback = window.localStorage.getItem("darts.playbackTarget");
      const lsWs = window.localStorage.getItem("darts.wsUrl");

      if (!qRole && (lsRole === "controller" || lsRole === "player"))
        setRole(lsRole);
      if (!qMode && (lsMode === "client" || lsMode === "server"))
        setOutputMode(lsMode);
      if (!qPlayback && (lsPlayback === "device" || lsPlayback === "server"))
        setPlaybackTarget(lsPlayback);
      // if (!qWs && lsWs) setWsUrl(lsWs);
    } catch {
      // ignore
    }

    return () => {};
  }, []);

  const connectSocket = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const url = wsUrl.trim();
    if (!url) return;

    setLastError(null);
    setConnectionStatus("connecting");

    const s = io(url, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
    });

    setSocket(s);

    s.on("connect", () => {
      setConnectionStatus("connected");
    });

    s.on("connect_error", (err) => {
      setConnectionStatus("error");
      setLastError(err?.message || "connect_error");
    });

    s.on("disconnect", (reason) => {
      setConnectionStatus("disconnected");
      setLastError(reason || null);
    });

    s.on("error-message", ({ message }) => {
      setLastError(message || "Server error");
    });

    s.on("play-sound", ({ soundId }: { soundId: SoundType }) => {
      // If we're a player and targeting device playback, play locally.
      if (role === "player" && playbackTarget === "device") {
        playSound(soundId);
      }

      // Highlight briefly (remote events don't have durations).
      if (serverPlayingTimeoutRef.current) {
        window.clearTimeout(serverPlayingTimeoutRef.current);
        serverPlayingTimeoutRef.current = null;
      }
      setPlayingSound(soundId);
      serverPlayingTimeoutRef.current = window.setTimeout(() => {
        setPlayingSound((prev) => (prev === soundId ? null : prev));
        serverPlayingTimeoutRef.current = null;
      }, 2500);
    });

    return s;
  }, [wsUrl, playbackTarget, role]);

  // Reconnect when WS settings change.
  React.useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;

    // Only connect when server mode is relevant (controller wants to emit, or player wants to receive).
    const shouldConnect = outputMode === "server" || role === "player";
    if (!shouldConnect) {
      setConnectionStatus("idle");
      setLastError(null);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Tear down prior socket before creating a new one.
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    const s = connectSocket();
    return () => {
      if (serverPlayingTimeoutRef.current) {
        window.clearTimeout(serverPlayingTimeoutRef.current);
        serverPlayingTimeoutRef.current = null;
      }
      if (s) s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, outputMode, role, wsUrl, playbackTarget]);

  React.useEffect(() => {
    if (!mounted) return;
    const unsubscribe = onSoundPlayback((event) => {
      if (outputMode !== "client") return;
      if (event.status === "playing") setPlayingSound(event.type);
      if (event.status === "stopped") {
        setPlayingSound((prev) => (prev === event.type ? null : prev));
      }
    });
    return unsubscribe;
  }, [mounted, outputMode]);

  const handlePlay = (type: SoundType) => {
    if (outputMode === "client") {
      playSound(type);
    } else if (outputMode === "server") {
      socket?.emit("play-sound", {
        soundId: type,
      });
    }
  };

  if (!mounted) return null;

  const soundBorderClass: Record<string, string> = {
    emerald: "hover:border-emerald-500/50",
    purple: "hover:border-purple-500/50",
    green: "hover:border-green-500/50",
    indigo: "hover:border-indigo-500/50",
    teal: "hover:border-teal-500/50",
    orange: "hover:border-orange-500/50",
    red: "hover:border-red-500/50",
    yellow: "hover:border-yellow-500/50",
  };

  const canUseServer = wsUrl.trim().length > 0;
  const serverConnected = connectionStatus === "connected";

  const makePairLink = (nextRole: Role) => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set("role", nextRole);
    url.searchParams.set(
      "mode",
      nextRole === "controller" ? outputMode : "server",
    );
    url.searchParams.set("playback", playbackTarget);
    if (wsUrl.trim()) url.searchParams.set("ws", wsUrl.trim());
    return url.toString();
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
            Hype Soundboard
          </h3>
        </div>
      </div>
      <div className="flex justify-center mb-4 gap-2 text-xs">
        <button
          type="button"
          onClick={() => setOutputMode("client")}
          className={`px-3 py-1 rounded-full border text-xs font-medium transition ${
            outputMode === "client"
              ? "bg-emerald-500 text-black border-emerald-400"
              : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
          }`}
        >
          This device
        </button>
        <button
          type="button"
          disabled={!canUseServer}
          onClick={() => setOutputMode("server")}
          className={`px-3 py-1 rounded-full border text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
            outputMode === "server"
              ? "bg-emerald-500 text-black border-emerald-400"
              : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
          }`}
        >
          Remote player
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SOUNDS.map(({ type, label, borderColor }) =>
          (() => {
            const isPlaying = playingSound === type;
            return (
              <button
                key={type}
                onClick={() => handlePlay(type)}
                className={`border font-bold text-lg py-4 rounded-xl transition-all active:scale-95 ${
                  isPlaying
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : `bg-zinc-800 hover:bg-zinc-700 border-zinc-700 ${
                        soundBorderClass[borderColor] || ""
                      } text-white`
                } ${type === "180" ? "font-black italic text-xl" : ""}`}
              >
                {label}
              </button>
            );
          })(),
        )}
      </div>
    </div>
  );
};
