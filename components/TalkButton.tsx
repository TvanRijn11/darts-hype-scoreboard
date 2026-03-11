"use client";

import React, { useRef, useState, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { Socket } from "socket.io-client";

export const TalkButton: React.FC<{ socket: Socket | null }> = ({ socket }) => {
  const [isTalking, setIsTalking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopTalking = useCallback(() => {
    if (!isTalking) return;

    socket?.emit("stop-voice");
    streamRef.current?.getTracks().forEach((t) => t.stop());

    // Safety check: close context only if it's open
    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
    }

    setIsTalking(false);
  }, [isTalking, socket]);

  const startTalking = async (e: React.PointerEvent) => {
    // 1. Prevent "ghost clicks" and default browser behavior
    e.preventDefault();

    // 2. Capture the pointer so that if the finger moves off the button, we still get the "up" event
    (e.target as HTMLButtonElement).setPointerCapture(e.pointerId);

    if (!socket?.connected) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 44100 });
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);

      socket.emit("start-voice");

      processor.onaudioprocess = (ev) => {
        const inputData = ev.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        if (socket.connected) {
          socket.emit("voice-data", pcmData.buffer);
        }
      };

      source.connect(processor);
      processor.connect(ctx.destination);
      setIsTalking(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  return (
    <button
      // Use PointerEvents to handle both Mouse and Touch simultaneously
      onPointerDown={startTalking}
      onPointerUp={stopTalking}
      // Handle the case where the finger/mouse leaves the button area
      onPointerLeave={stopTalking}
      className={`p-4 rounded-full transition-all active:scale-95 touch-none select-none ${
        isTalking ? "bg-red-500 animate-pulse" : "bg-zinc-700"
      }`}
      style={{
        // CRITICAL: prevents browser from scrolling or showing context menus while holding
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {isTalking ? (
        <Mic className="text-white w-6 h-6" />
      ) : (
        <MicOff className="text-zinc-400 w-6 h-6" />
      )}
    </button>
  );
};
