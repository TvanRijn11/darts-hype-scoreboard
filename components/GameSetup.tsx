"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Play } from "lucide-react";
import { Player, GameMode } from "@/types/game";

interface GameSetupProps {
  players: Player[];
  onPlayerNameChange: (index: number, name: string) => void;
  onStartGame: (players: Player[]) => void;
  onPlayerCountChange?: (count: number) => void;
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({
  players,
  onPlayerNameChange,
  onStartGame,
  onPlayerCountChange,
  gameMode,
  onGameModeChange,
}) => {
  const [step, setStep] = useState<'mode' | 'count' | 'names'>('mode');

  const handleGameModeSelect = (mode: GameMode) => {
    onGameModeChange(mode);
    setStep('count');
  };

  const handlePlayerCountSelect = (count: number) => {
    onPlayerCountChange?.(count);
    setStep('names');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame(players);
  };

  return (
    <motion.div
      key="setup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm"
    >
      {step === 'mode' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-zinc-100">Choose Game Mode</h3>
            <p className="text-sm text-zinc-400">Select your preferred ruleset</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['501', '301', 'cricket'] as GameMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleGameModeSelect(mode)}
                className={`group relative overflow-hidden p-6 rounded-2xl border transition-all ${
                  gameMode === mode
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500 text-zinc-300'
                }`}
              >
                <div className="text-2xl font-black mb-1">{mode}</div>
                <div className="text-xs font-bold uppercase tracking-wider opacity-60">
                  {mode === 'cricket' ? 'Strategy' : 'Target'}
                </div>
                {gameMode === mode && (
                  <motion.div
                    layoutId="activeMode"
                    className="absolute inset-0 bg-emerald-500/10 pointer-events-none"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'count' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-zinc-100">How many players?</h3>
            <button
              onClick={() => setStep('mode')}
              className="text-xs text-zinc-400 hover:text-zinc-300 font-bold uppercase tracking-wider"
            >
              Change mode
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[2, 3, 4, 5].map((count) => (
              <button
                key={count}
                onClick={() => handlePlayerCountSelect(count)}
                className="bg-zinc-800 hover:bg-emerald-600 active:bg-emerald-700 border border-zinc-700 hover:border-emerald-500 text-white font-bold text-2xl py-8 rounded-xl transition-all"
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 'names' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              Player Names
            </h3>
            <button
              type="button"
              onClick={() => setStep('count')}
              className="text-xs text-zinc-400 hover:text-zinc-300 font-bold uppercase tracking-wider"
            >
              Change count
            </button>
          </div>
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={player.id} className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">
                  Player {index + 1}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => onPlayerNameChange(index, e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    placeholder="Enter name..."
                    autoFocus={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            GAME ON
          </button>
        </form>
      )}
    </motion.div>
  );
};
