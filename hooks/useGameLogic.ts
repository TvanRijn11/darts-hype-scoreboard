'use client';

import { useState, useCallback } from 'react';
import { GameState, Player, Move, GameMode } from '@/types/game';
import { STARTING_SCORES, MAX_X01_SCORE } from '@/lib/constants';
import {
  validateX01Score as validateScore,
  calculateNewX01Score as calculateNewScore,
  isValidX01Score as isValidScore,
  resetPlayersScores
} from '@/lib/gameLogic';
import { playSound, speakScore } from '@/lib/sounds';

export const useGameLogic = (initialPlayers?: Player[]) => {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [gameMode, setGameMode] = useState<GameMode>('501');
  const [startingScore, setStartingScore] = useState(STARTING_SCORES['501']);
  const [commentaryEnabled, setCommentaryEnabled] = useState(false);

  const [players, setPlayers] = useState<Player[]>(
    initialPlayers || [
      { id: 'p1', name: 'Player 1', score: STARTING_SCORES['501'] },
      { id: 'p2', name: 'Player 2', score: STARTING_SCORES['501'] },
    ]
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [winner, setWinner] = useState<Player | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

  const undo = useCallback(() => {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];

    setPlayers((prev) => {
      const updated = [...prev];
      updated[lastMove.playerIndex].score = lastMove.previousScore;
      // Also undo marks if it were cricket (to be implemented)
      if (lastMove.previousMarks) {
        updated[lastMove.playerIndex].cricketMarks = lastMove.previousMarks;
      }
      return updated;
    });

    setMoveHistory((prev) => prev.slice(0, -1));

    // If the player switched turns after the move, switch back
    if (lastMove.wasCurrentPlayer === false) {
      setCurrentPlayerIndex(lastMove.playerIndex);
    }

    setInputValue('');
  }, [moveHistory]);

  const createPlayers = (count: number, currentStartingScore: number): Player[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      score: currentStartingScore,
    }));
  };

  const handlePlayerCountChange = useCallback((count: number) => {
    setPlayers(createPlayers(count, startingScore));
    setCurrentPlayerIndex(0);
  }, [startingScore]);

  const switchTurn = useCallback(() => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setInputValue('');
  }, [players.length]);

  const handleStartGame = useCallback(
    (newPlayers: Player[]) => {
      const validatedPlayers = newPlayers.map((p) => ({
        ...p,
        name: p.name.trim() || `Player ${newPlayers.indexOf(p) + 1}`,
        score: startingScore,
      }));

      setPlayers(validatedPlayers);
      setCurrentPlayerIndex(0);
      setWinner(null);
      setMoveHistory([]);
      setGameState('playing');
      setInputValue('');
    },
    [startingScore]
  );

  const handleScoreSubmit = useCallback(
    (score: string) => {
      const scoreEntered = validateScore(score);
      if (scoreEntered === null) {
        setInputValue('');
        return;
      }

      const currentPlayer = players[currentPlayerIndex];
      const newScore = calculateNewScore(currentPlayer.score, scoreEntered);
      const scoreStatus = isValidScore(newScore);

      // Record the move
      const move: Move = {
        playerIndex: currentPlayerIndex,
        playerName: currentPlayer.name,
        dartScore: scoreEntered,
        previousScore: currentPlayer.score,
        newScore: scoreStatus === 'bust' ? currentPlayer.score : newScore,
        timestamp: Date.now(),
        wasCurrentPlayer: true, // will be set to false if turn switches
      };

      if (commentaryEnabled) {
        // Speak what was entered each turn; avoid overlapping "hype" sounds.
        speakScore(scoreEntered);
      } else if (scoreEntered === 180) {
        playSound('180');
      }

      if (scoreStatus === 'winner') {
        setPlayers((prev) => {
          const updated = [...prev];
          updated[currentPlayerIndex].score = 0;
          return updated;
        });
        setMoveHistory((prev) => [...prev, move]);
        setWinner(currentPlayer);
        setGameState('finished');
        playSound('trap');
      } else {
        setPlayers((prev) => {
          const updated = [...prev];
          updated[currentPlayerIndex].score = newScore;
          return updated;
        });
        move.wasCurrentPlayer = false;
        setMoveHistory((prev) => [...prev, move]);
        switchTurn();
      }
    },
    [players, currentPlayerIndex, switchTurn, commentaryEnabled]
  );

  const handleNumpadClick = useCallback((num: string) => {
    setInputValue((prev) => {
      if (prev.length < 3) {
        const newVal = prev + num;
        if (parseInt(newVal, 10) <= MAX_X01_SCORE) {
          return newVal;
        }
      }
      return prev;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setInputValue((prev) => prev.slice(0, -1));
  }, []);

  const resetGame = useCallback(() => {
    setGameState('setup');
    setPlayers(resetPlayersScores(players, gameMode, startingScore));
    setInputValue('');
    setWinner(null);
    setMoveHistory([]);
  }, [players, gameMode, startingScore]);

  const updatePlayerName = useCallback((index: number, name: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index].name = name;
      return updated;
    });
  }, []);

  const changeGameMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setStartingScore(STARTING_SCORES[mode]);
    // Reset playerers for the new mode
    setPlayers((prev) => resetPlayersScores(prev, mode, STARTING_SCORES[mode]));
  }, []);

  return {
    gameState,
    gameMode,
    startingScore,
    commentaryEnabled,
    setCommentaryEnabled,
    players,
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
  };
};

