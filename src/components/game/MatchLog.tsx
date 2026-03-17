"use client";

import React from "react";
import { Move } from "@/src/types/game";

interface MatchLogProps {
  moves: Move[];
}

export const MatchLog: React.FC<MatchLogProps> = ({ moves }) => {
  if (moves.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-center text-zinc-500">
        No moves yet
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Match Log
        </h3>
      </div>

      <div className="max-h-60 overflow-y-auto">
        {/* Display moves in reverse chronological order (newest first) */}
        {[...moves].reverse().map((move, idx) => {
          const moveNumber = moves.length - idx;
          const isBust =
            move.newScore === move.previousScore && Number(move.dartScore) > 0;
          const isWinning = move.newScore === 0;

          return (
            <div
              key={`${move.timestamp}-${move.playerIndex}`}
              className="border-b border-zinc-800 p-4 transition-colors last:border-b-0 hover:bg-zinc-900/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-500">
                      #{moveNumber}
                    </span>
                    <span className="font-semibold text-zinc-100 truncate">
                      {move.playerName}
                    </span>
                    {isBust && (
                      <span className="ml-auto inline-block bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded">
                        BUST
                      </span>
                    )}
                    {isWinning && (
                      <span className="ml-auto inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded">
                        WINNER
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-400">Scored:</span>
                    <span className="font-bold text-emerald-400">
                      {move.dartScore}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">
                      {move.previousScore} →{" "}
                      <span
                        className={
                          isWinning
                            ? "text-emerald-400 font-bold"
                            : "text-zinc-200"
                        }
                      >
                        {move.newScore}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
