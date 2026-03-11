"use client";

import React from "react";
import { Player } from "@/types/game";

interface ScoreboardProps {
  players: Player[];
  currentPlayerIndex: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  currentPlayerIndex,
}) => {
  // Determine grid columns based on player count
  const getGridColsClass = () => {
    switch (players.length) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-2 md:grid-cols-4";
      case 5:
        return "grid-cols-2 md:grid-cols-5";
      default:
        return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  return (
    <div className={`grid gap-4 ${getGridColsClass()}`}>
      {players.map((player, idx) => {
        const isActive = currentPlayerIndex === idx;
        return (
          <div
            key={player.id}
            className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
              isActive
                ? "bg-zinc-900 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                : "bg-zinc-950 border-zinc-800 opacity-60"
            }`}
          >
            {isActive && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
            )}
            <div className="p-4 md:p-6 flex flex-col items-center justify-center text-center">
              <h2
                className={`text-sm md:text-lg font-bold mb-2 truncate w-full ${
                  isActive ? "text-zinc-100" : "text-zinc-500"
                }`}
              >
                {player.name}
              </h2>
              <div
                className={`text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter ${
                  isActive ? "text-white" : "text-zinc-600"
                }`}
              >
                {player.score}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
