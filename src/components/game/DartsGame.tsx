"use client";

import React, { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { useGameLogic } from "@/src/hooks/useGameLogic";
import { Header } from "@/src/components/ui/Header";
import { GameSetup } from "@/src/components/game/GameSetup";
import { Scoreboard } from "@/src/components/game/Scoreboard";
import { ScoreInput } from "@/src/components/game/ScoreInput";
import { WinnerScreen } from "@/src/components/game/WinnerScreen";
import { MatchLog } from "@/src/components/game/MatchLog";
import { CommentaryButton } from "@/src/components/game/CommentaryButton";
import { Soundboard } from "@/src/components/soundboard/Soundboard";
import { initializeSounds } from "@/src/lib/sounds/soundConfig";

export default function DartsGame() {
  useEffect(() => {
    initializeSounds();
  }, []);

  const {
    gameState,
    gameMode,
    gameOptions,
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
    updateGameOptions,
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
            gameOptions={gameOptions}
            onGameOptionsChange={updateGameOptions}
          />
        )}

        {gameState === "playing" && (
          <div key="playing" className="space-y-8">
            <Scoreboard
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              gameOptions={gameOptions}
            />
            <CommentaryButton
              enabled={commentaryEnabled}
              onToggle={() => setCommentaryEnabled((v) => !v)}
            />
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
