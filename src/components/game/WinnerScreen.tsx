"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Trophy, RotateCcw } from "lucide-react";
import { Player } from "@/src/types/game";

interface WinnerScreenProps {
  winner: Player;
  onPlayAgain: () => void;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({
  winner,
  onPlayAgain,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Container: React.ElementType = mounted ? motion.div : "div";
  const Inner: React.ElementType = mounted ? motion.div : "div";

  return (
    <Container
      key="finished"
      {...(mounted
        ? {
            initial: false,
            animate: { opacity: 1, scale: 1 },
          }
        : {})}
      className="bg-zinc-900/80 border border-emerald-500/30 rounded-3xl p-8 md:p-12 text-center space-y-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] pointer-events-none" />

      <Inner
        {...(mounted
          ? {
              initial: false,
              animate: { y: 0, opacity: 1 },
              transition: { delay: 0.2 },
            }
          : {})}
      >
        <Trophy className="w-24 h-24 mx-auto text-yellow-400 mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
        <h2 className="text-3xl md:text-5xl font-black uppercase italic mb-2">
          {winner.name} Wins!
        </h2>
        <p className="text-zinc-400 text-lg">Game shot, and the match.</p>
      </Inner>

      <button
        onClick={onPlayAgain}
        className="bg-zinc-100 hover:bg-white text-zinc-900 font-bold text-lg py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 mx-auto"
      >
        <RotateCcw className="w-5 h-5" />
        Play Again
      </button>
    </Container>
  );
};
