"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { SoundType, SOUNDS } from "@/src/types/sounds";
import { playSound } from "@/src/lib/sounds/sounds";
import { useWebSocket } from "@/src/hooks/useWebSocket";
import { TalkButton } from "./TalkButton";

type OutputMode = "client" | "server" | "server-talk";
type Role = "controller" | "player";
type PlaybackTarget = "device" | "server";

const BORDER_COLORS = [
  "emerald", "purple", "green", "indigo", "teal", "orange", "red", "yellow"
];

export const BigSoundboard: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  const [role, setRole] = React.useState<Role>("controller");
  const [outputMode, setOutputMode] = React.useState<OutputMode>("client");
  const [playbackTarget, setPlaybackTarget] =
    React.useState<PlaybackTarget>("device");
  const [talkMode, setTalkMode] = React.useState(false);

  const {
    socket,
    connectionStatus,
    emitPlaySound,
    emitStartVoice,
    emitStopVoice,
    emitVoiceData,
    isConnected,
  } = useWebSocket({ role, outputMode: talkMode ? "server" : outputMode === "client" ? "client" : "server", playbackTarget });

  const canUseServer = connectionStatus !== "idle";

  React.useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const qRole = params.get("role");
    const qMode = params.get("mode");
    const qPlayback = params.get("playback");

    if (qRole === "controller" || qRole === "player") setRole(qRole);
    if (qMode === "client" || qMode === "server") setOutputMode(qMode);
    if (qPlayback === "device" || qPlayback === "server")
      setPlaybackTarget(qPlayback);

    try {
      const lsRole = window.localStorage.getItem("darts.role");
      const lsMode = window.localStorage.getItem("darts.outputMode");
      const lsPlayback = window.localStorage.getItem("darts.playbackTarget");

      if (!qRole && (lsRole === "controller" || lsRole === "player"))
        setRole(lsRole);
      if (!qMode && (lsMode === "client" || lsMode === "server"))
        setOutputMode(lsMode);
      if (!qPlayback && (lsPlayback === "device" || lsPlayback === "server"))
        setPlaybackTarget(lsPlayback);
    } catch {
      // ignore
    }
  }, []);

  const handlePlay = (type: SoundType) => {
    if (outputMode === "client") {
      playSound(type);
    } else if (outputMode === "server") {
      emitPlaySound(type);
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

  const sounds = SOUNDS;

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
          onClick={() => {
            setOutputMode("client");
            setTalkMode(false);
          }}
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
          onClick={() => {
            setOutputMode("server");
            setTalkMode(false);
          }}
          className={`px-3 py-1 rounded-full border text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
            outputMode === "server" && !talkMode
              ? "bg-emerald-500 text-black border-emerald-400"
              : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
          }`}
        >
          Remote player
        </button>
        <button
          type="button"
          disabled={!canUseServer}
          onClick={() => {
            setOutputMode("server");
            setTalkMode(true);
          }}
          className={`px-3 py-1 rounded-full border text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
            talkMode
              ? "bg-emerald-500 text-black border-emerald-400"
              : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
          }`}
        >
          Talk to remote player
        </button>
      </div>
      {!talkMode ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sounds.map((sound, idx) => {
            const borderColor = BORDER_COLORS[idx % BORDER_COLORS.length];
            return (
              <button
                key={sound.id}
                onClick={() => handlePlay(sound.id)}
                className={`border font-bold text-lg py-4 rounded-xl transition-all active:scale-95 ${
                  `bg-zinc-800 hover:bg-zinc-700 border-zinc-700 ${
                      soundBorderClass[borderColor] || ""
                    } text-white`
                } ${sound.id === "180" ? "font-black italic text-xl" : ""}`}
              >
                {sound.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 text-center">
          <TalkButton
            onStartVoice={emitStartVoice}
            onStopVoice={emitStopVoice}
            onVoiceData={emitVoiceData}
            socketConnected={isConnected}
          />
        </div>
      )}
    </div>
  );
};
