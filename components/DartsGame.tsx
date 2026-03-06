"use client";

import React, { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { useGameLogic } from "@/hooks/useGameLogic";
import { Header } from "@/components/Header";
import { GameSetup } from "@/components/GameSetup";
import { Scoreboard } from "@/components/Scoreboard";
import { ScoreInput } from "@/components/ScoreInput";
import { WinnerScreen } from "@/components/WinnerScreen";
import { MatchLog } from "@/components/MatchLog";
import { Soundboard } from "@/components/Soundboard";
import { initializeSounds } from "@/lib/soundConfig";

export default function DartsGame() {
  // Initialize sounds on component mount
  useEffect(() => {
    initializeSounds();
  }, []);

  const {
    gameState,
    gameMode,
    players,
    commentaryEnabled,
    setCommentaryEnabled,
    currentPlayerIndex,
    inputValue,
    winner,
    moveHistory,
    setInputValue,
    handleStartGame,
    handleScoreSubmit,
    handleNumpadClick,
    handleBackspace,
    resetGame,
    updatePlayerName,
    undo,
    handlePlayerCountChange,
    changeGameMode,
  } = useGameLogic();

  const handleScoreFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScoreSubmit(inputValue);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <Header />

      <AnimatePresence mode="wait" initial={false}>
        {gameState === "setup" && (
          <GameSetup
            players={players}
            onPlayerNameChange={updatePlayerName}
            onStartGame={handleStartGame}
            onPlayerCountChange={handlePlayerCountChange}
            gameMode={gameMode}
            onGameModeChange={changeGameMode}
          />
        )}

        {gameState === "playing" && (
          <div key="playing" className="space-y-8">
            <Scoreboard
              players={players}
              currentPlayerIndex={currentPlayerIndex}
            />
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCommentaryEnabled((v) => !v)}
                className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition ${
                  commentaryEnabled
                    ? "bg-emerald-500 text-black border-emerald-400"
                    : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
                }`}
              >
                Commentary {commentaryEnabled ? "On" : "Off"}
              </button>
            </div>
            <ScoreInput
              currentPlayerName={players[currentPlayerIndex].name}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSubmit={handleScoreFormSubmit}
              onNumpadClick={handleNumpadClick}
              onBackspace={handleBackspace}
              onUndo={undo}
              canUndo={moveHistory.length > 0}
              gameMode={gameMode}
            />
            <MatchLog moves={moveHistory} />
          </div>
        )}

        {gameState === "finished" && winner && (
          <WinnerScreen winner={winner} onPlayAgain={resetGame} />
        )}
      </AnimatePresence>

      <Soundboard />
    </div>
  );
}
