"use client";

import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { playSound } from "@/lib/sounds";
import type { SoundType } from "@/types/game";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== "undefined"
    ? `http://${window.location.hostname}:4000`
    : "");
const ROOM_ID = "default";

export default function PlayerPage() {
  useEffect(() => {
    let socket: Socket | null = null;

    // Only run in the browser
    if (typeof window !== "undefined") {
      socket = io(WS_URL, {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        socket?.emit("join-room", {
          roomId: ROOM_ID,
          role: "player",
        });
      });

      socket.on("play-sound", ({ soundId }: { soundId: SoundType }) => {
        playSound(soundId);
      });
    }

    return () => {
      socket?.disconnect();
    };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-black tracking-tight">
          Darts Hype Player
        </h1>
        <p className="text-zinc-400 text-sm">
          Keep this page open on the device that should play the sounds.
          When you trigger sounds from the main app, they will play here.
        </p>
        <div className="mt-6 text-xs text-zinc-500">
          Connected to room: <span className="font-mono">{ROOM_ID}</span>
        </div>
      </div>
    </main>
  );
}

