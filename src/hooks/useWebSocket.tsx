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
  wsUrl?: string;
}

export interface UseWebSocketReturn {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
  lastError: string | null;
  isConnected: boolean;
  playingSound: SoundType | null;
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

  // Get values from options or fall back to env/localStorage
  const wsUrl = options?.wsUrl || WS_URL;
  const role = options?.role || "controller";
  const outputMode = options?.outputMode || "client";
  const playbackTarget = options?.playbackTarget || "device";

  useEffect(() => {
    setMounted(true);
  }, []);

  const connectSocket = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = wsUrl.trim();
    if (!url) {
      return;
    }

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

    s.on("error", (err) => {
      // Socket error
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

    // Listen for server's sound-playing state
    s.on("sound-playing", ({ soundId }: { soundId: SoundType | null }) => {
      if (serverPlayingTimeoutRef.current) {
        window.clearTimeout(serverPlayingTimeoutRef.current);
        serverPlayingTimeoutRef.current = null;
      }
      setPlayingSound(soundId);
      if (soundId) {
        // Clear after reasonable duration (sounds are typically <10s)
        serverPlayingTimeoutRef.current = window.setTimeout(() => {
          setPlayingSound(null);
          serverPlayingTimeoutRef.current = null;
        }, 8000);
      }
    });

    return s;
  }, [wsUrl, playbackTarget, role]);

  const [playingSound, setPlayingSound] = useState<SoundType | null>(null);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;

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
  }, [mounted, outputMode, role, wsUrl, playbackTarget, connectSocket]);

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
    playingSound,
    emitPlaySound,
    emitStartVoice,
    emitStopVoice,
    emitVoiceData,
  };
};
