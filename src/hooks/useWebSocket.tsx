"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { SoundType } from "@/src/types/game";
import { WS_RECONNECTION_DELAY, WS_RECONNECTION_DELAY_MAX, WS_SERVER_PLAYING_TIMEOUT } from "@/src/lib/game/constants";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface UseWebSocketOptions {
  role?: "controller" | "player";
  outputMode?: "client" | "server";
  playbackTarget?: "device" | "server";
}

export interface UseWebSocketReturn {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
  lastError: string | null;
  isConnected: boolean;
  emitPlaySound: (soundId: SoundType) => void;
  emitStartVoice: () => void;
  emitStopVoice: () => void;
  emitVoiceData: (data: ArrayBuffer) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";

export const useWebSocket = (options?: UseWebSocketOptions): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const serverPlayingTimeoutRef = useRef<number | null>(null);

  const [mounted, setMounted] = useState(false);
  const [wsUrl, setWsUrl] = useState<string>(WS_URL);
  const [role, setRole] = useState<"controller" | "player">(
    options?.role ?? "controller"
  );
  const [outputMode, setOutputMode] = useState<"client" | "server">(
    options?.outputMode ?? "client"
  );
  const [playbackTarget, setPlaybackTarget] = useState<"device" | "server">(
    options?.playbackTarget ?? "device"
  );

  useEffect(() => {
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
    if (typeof qWs === "string" && qWs.trim()) setWsUrl(qWs.trim());

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
      if (!qWs && lsWs) setWsUrl(lsWs);
    } catch {
      // ignore
    }
  }, []);

  const connectSocket = useCallback(() => {
    console.log("[WS Client] connectSocket called, URL:", wsUrl);
    console.log("[WS Client] outputMode:", options?.outputMode, "role:", options?.role);
    if (typeof window === "undefined") return;
    const url = wsUrl.trim();
    if (!url) {
      console.log("[WS Client] No URL configured, skipping connection");
      return;
    }

    console.log("[WS Client] Attempting to connect to:", url);
    setLastError(null);
    setConnectionStatus("connecting");

    const s = io(url, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: WS_RECONNECTION_DELAY,
      reconnectionDelayMax: WS_RECONNECTION_DELAY_MAX,
    });

    console.log("[WS Client] Socket instance created, id:", s.id);

    setSocket(s);

    s.on("connect", () => {
      console.log("[WS Client] Connected! Socket id:", s.id);
      setConnectionStatus("connected");
    });

    s.on("connect_error", (err) => {
      console.log("[WS Client] Connect error:", err.message);
      console.log("[WS Client] Error type:", err.name);
      setConnectionStatus("error");
      setLastError(err?.message || "connect_error");
    });

    s.on("disconnect", (reason) => {
      console.log("[WS Client] Disconnected, reason:", reason);
      setConnectionStatus("disconnected");
      setLastError(reason || null);
    });

    s.on("error", (err) => {
      console.log("[WS Client] Socket error:", err);
    });

    s.on("error-message", ({ message }: { message: string }) => {
      setLastError(message || "Server error");
    });

    s.on("play-sound", ({ soundId }: { soundId: SoundType }) => {
      if (role === "player" && playbackTarget === "device") {
        import("@/src/lib/sounds/sounds").then(({ playSound }) => {
          playSound(soundId);
        });
      }

      if (serverPlayingTimeoutRef.current) {
        window.clearTimeout(serverPlayingTimeoutRef.current);
        serverPlayingTimeoutRef.current = null;
      }
      setPlayingSound(soundId);
      serverPlayingTimeoutRef.current = window.setTimeout(() => {
        setPlayingSound((prev) => (prev === soundId ? null : prev));
        serverPlayingTimeoutRef.current = null;
      }, WS_SERVER_PLAYING_TIMEOUT);
    });

    return s;
  }, [wsUrl, playbackTarget, role]);

  const [playingSound, setPlayingSound] = useState<SoundType | null>(null);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;

    console.log("[WS Client] useEffect triggered, outputMode:", outputMode, "role:", role, "wsUrl:", wsUrl);

    const shouldConnect = outputMode === "server" || role === "player";
    console.log("[WS Client] shouldConnect:", shouldConnect);
    if (!shouldConnect) {
      setConnectionStatus("idle");
      setLastError(null);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

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
  }, [mounted, outputMode, role, wsUrl, playbackTarget, connectSocket, socket]);

  useEffect(() => {
    if (!mounted) return;
    import("@/src/lib/sounds/sounds").then(({ onSoundPlayback }) => {
      const unsubscribe = onSoundPlayback((event) => {
        if (outputMode !== "client") return;
        if (event.status === "playing") setPlayingSound(event.type);
        if (event.status === "stopped") {
          setPlayingSound((prev) => (prev === event.type ? null : prev));
        }
      });
      return unsubscribe;
    });
  }, [mounted, outputMode]);

  const emitPlaySound = useCallback(
    (soundId: SoundType) => {
      socket?.emit("play-sound", { soundId });
    },
    [socket]
  );

  const emitStartVoice = useCallback(() => {
    socket?.emit("start-voice");
  }, [socket]);

  const emitStopVoice = useCallback(() => {
    socket?.emit("stop-voice");
  }, [socket]);

  const emitVoiceData = useCallback(
    (data: ArrayBuffer) => {
      socket?.emit("voice-data", data);
    },
    [socket]
  );

  return {
    socket,
    connectionStatus,
    lastError,
    isConnected: connectionStatus === "connected",
    emitPlaySound,
    emitStartVoice,
    emitStopVoice,
    emitVoiceData,
  };
};
