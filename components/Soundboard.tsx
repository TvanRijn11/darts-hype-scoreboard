"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { SoundType } from "@/types/game";
import { playSound } from "@/lib/sounds";
import { io, Socket } from "socket.io-client";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== "undefined"
    ? `http://${window.location.hostname}:4000`
    : "");
const ROOM_ID = "default";

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
  { type: "shame", label: "SHAME!", borderColor: "orange" },
  { type: "bust", label: "BUST", borderColor: "red" },
  { type: "winner", label: "WINNER", borderColor: "yellow" },
];

export const Soundboard: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [outputMode, setOutputMode] = React.useState<"client" | "server">(
    "client",
  );

  React.useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    console.log("WS_URL", WS_URL);

    const s = io("http://192.168.3.136:4000", {
      transports: ["websocket"],
    });
    setSocket(s);

    s.on("connect", () => {
      s.emit("join-room", { roomId: ROOM_ID, role: "controller" });
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const handlePlay = (type: SoundType) => {
    if (outputMode === "client") {
      playSound(type);
    } else if (outputMode === "server") {
      console.log("playing sound", type);
      socket?.emit("play-sound", {
        roomId: ROOM_ID,
        soundId: type,
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4 justify-center">
        <Volume2 className="w-5 h-5 text-zinc-500" />
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
          Hype Soundboard
        </h3>
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
          onClick={() => setOutputMode("server")}
          className={`px-3 py-1 rounded-full border text-xs font-medium transition ${
            outputMode === "server"
              ? "bg-emerald-500 text-black border-emerald-400"
              : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
          }`}
        >
          Remote player
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SOUNDS.map(({ type, label, borderColor }) => (
          <button
            key={type}
            onClick={() => handlePlay(type)}
            className={`bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-${borderColor}-500/50 text-white font-bold text-lg py-4 rounded-xl transition-all active:scale-95 ${
              type === "180" ? "font-black italic text-xl" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
