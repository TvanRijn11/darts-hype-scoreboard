"use client";

import React, { useRef, useState, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";

interface TalkButtonProps {
  onStartVoice?: () => void;
  onStopVoice?: () => void;
  onVoiceData?: (data: ArrayBuffer) => void;
  socketConnected?: boolean;
}

export const TalkButton: React.FC<TalkButtonProps> = ({
  onStartVoice,
  onStopVoice,
  onVoiceData,
  socketConnected = false,
}) => {
  const [isTalking, setIsTalking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopTalking = useCallback(() => {
    if (!isTalking) return;

    onStopVoice?.();
    streamRef.current?.getTracks().forEach((t) => t.stop());

    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
    }

    setIsTalking(false);
  }, [isTalking, onStopVoice]);

  const startTalking = async (e: React.PointerEvent) => {
    e.preventDefault();

    (e.target as HTMLButtonElement).setPointerCapture(e.pointerId);

    if (!socketConnected) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 44100 });
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);

      onStartVoice?.();

      processor.onaudioprocess = (ev) => {
        const inputData = ev.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        onVoiceData?.(pcmData.buffer);
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
      onPointerDown={startTalking}
      onPointerUp={stopTalking}
      onPointerLeave={stopTalking}
      className={`p-4 rounded-full transition-all active:scale-95 touch-none select-none ${
        isTalking ? "bg-red-500 animate-pulse" : "bg-zinc-700"
      }`}
      style={{
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
