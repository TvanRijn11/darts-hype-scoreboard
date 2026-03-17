'use client';

import { useState, useCallback, useRef } from 'react';
import { GameState, Player, Move, GameMode, GameOptions, DartInput, CricketMarks, DoubleInMode, DoubleOutMode } from '@/src/types/game';
import { STARTING_SCORES, MAX_X01_SCORE, MAX_SCORE_INPUT_LENGTH, HIGH_SCORE_THRESHOLD } from '@/src/lib/game/constants';
import {
  validateX01Score as validateScore,
  calculateNewX01Score as calculateNewScore,
  isValidX01Score as validateX01Score,
  parseDartInput,
  calculateDartScore,
  formatDartInput,
  isDouble,
  getInitialCricketMarks,
  calculateCricketScore,
  isCricketWinner,
  resetPlayersScores
} from '@/src/lib/game/gameLogic';
import { playSound, speakScore } from '@/src/lib/sounds/sounds';

const DEFAULT_OPTIONS: GameOptions = {
  doubleIn: 'none',
  doubleOut: 'double',
  bestOfLegs: 1,
  bestOfSets: 1,
};

export const useGameLogic = (initialPlayers?: Player[]) => {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [gameMode, setGameMode] = useState<GameMode>('501');
  const [gameOptions, setGameOptions] = useState<GameOptions>(DEFAULT_OPTIONS);
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
  const [currentDarts, setCurrentDarts] = useState<DartInput[]>([]);
  
  const firstTurnRef = useRef<Record<string, boolean>>({});

  const undo = useCallback(() => {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];

    setPlayers((prev) => {
      const updated = [...prev];
      updated[lastMove.playerIndex].score = lastMove.previousScore;
      
      if (lastMove.previousMarks) {
        updated[lastMove.playerIndex].cricketMarks = lastMove.previousMarks;
      }
      return updated;
    });

    setMoveHistory((prev) => prev.slice(0, -1));

    if (lastMove.wasCurrentPlayer === false) {
      setCurrentPlayerIndex(lastMove.playerIndex);
    }

    if (gameMode === 'cricket') {
      const playerDarts = currentDarts;
      if (playerDarts.length > 0) {
        setCurrentDarts(playerDarts.slice(0, -1));
      }
    }

    setInputValue('');
  }, [moveHistory, currentDarts, gameMode]);

  const createPlayers = useCallback((count: number, currentStartingScore: number): Player[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      score: currentStartingScore,
      cricketMarks: gameMode === 'cricket' ? getInitialCricketMarks() : undefined,
      legsWon: 0,
      setsWon: 0,
    }));
  }, [gameMode]);

  const handlePlayerCountChange = useCallback((count: number) => {
    setPlayers(createPlayers(count, startingScore));
    setCurrentPlayerIndex(0);
  }, [startingScore, createPlayers]);

  const switchTurn = useCallback(() => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setInputValue('');
    setCurrentDarts([]);
  }, [players.length]);

  const checkForLegWinner = useCallback((currentPlayer: Player): Player | null => {
    const playerKey = `${currentPlayer.id}-legs`;
    const legsToWin = gameOptions.bestOfLegs;
    
    const newLegsWon = (currentPlayer.legsWon || 0) + 1;
    
    if (legsToWin > 1) {
      if (newLegsWon >= Math.ceil(legsToWin / 2)) {
        return { ...currentPlayer, legsWon: newLegsWon };
      }
    }
    return null;
  }, [gameOptions.bestOfLegs]);

  const handleStartGame = useCallback(
    (newPlayers: Player[]) => {
      firstTurnRef.current = {};
      
      const validatedPlayers = newPlayers.map((p, idx) => {
        const playerKey = `p${idx}`;
        firstTurnRef.current[playerKey] = true;
        
        return {
          ...p,
          name: p.name.trim() || `Player ${idx + 1}`,
          score: startingScore,
          cricketMarks: gameMode === 'cricket' ? getInitialCricketMarks() : undefined,
          legsWon: 0,
          setsWon: 0,
        };
      });

      setPlayers(validatedPlayers);
      setCurrentPlayerIndex(0);
      setWinner(null);
      setMoveHistory([]);
      setGameState('playing');
      setInputValue('');
      setCurrentDarts([]);
    },
    [startingScore, gameMode]
  );

  const handleScoreSubmit = useCallback(
    (score: string) => {
      if (gameMode === 'cricket') {
        const parsed = parseDartInput(score);
        if (!parsed) {
          setInputValue('');
          return;
        }

        const dartScore = calculateDartScore(parsed);
        const currentPlayer = players[currentPlayerIndex];
        const opponentIndex = (currentPlayerIndex + 1) % players.length;
        const opponentMarks = players[opponentIndex]?.cricketMarks || getInitialCricketMarks();
        const playerMarks = currentPlayer.cricketMarks || getInitialCricketMarks();

        const { newMarks, points } = calculateCricketScore(playerMarks, parsed, opponentMarks);

        const move: Move = {
          playerIndex: currentPlayerIndex,
          playerName: currentPlayer.name,
          dartScore: formatDartInput(parsed),
          previousScore: currentPlayer.score,
          newScore: currentPlayer.score + points,
          previousMarks: { ...playerMarks },
          timestamp: Date.now(),
          wasCurrentPlayer: true,
          modifier: parsed.modifier || undefined,
        };

        if (isCricketWinner(newMarks, opponentMarks)) {
          setPlayers((prev) => {
            const updated = [...prev];
            updated[currentPlayerIndex].cricketMarks = newMarks;
            updated[currentPlayerIndex].score = currentPlayer.score + points;
            return updated;
          });
          
          const legWinner = checkForLegWinner({ ...currentPlayer, score: currentPlayer.score + points });
          
          if (legWinner && gameOptions.bestOfLegs > 1) {
            setPlayers((prev) => {
              const updated = [...prev];
              updated[currentPlayerIndex].legsWon = (updated[currentPlayerIndex].legsWon || 0) + 1;
              
              const allReset = updated.map(p => ({
                ...p,
                score: 0,
                cricketMarks: getInitialCricketMarks(),
              }));
              return allReset;
            });
            setWinner(currentPlayer);
            setGameState('finished');
            playSound('trap');
          } else {
            setMoveHistory((prev) => [...prev, move]);
            setWinner(currentPlayer);
            setGameState('finished');
            playSound('trap');
          }
        } else {
          setPlayers((prev) => {
            const updated = [...prev];
            updated[currentPlayerIndex].cricketMarks = newMarks;
            updated[currentPlayerIndex].score = currentPlayer.score + points;
            return updated;
          });
          
          move.wasCurrentPlayer = false;
          setMoveHistory((prev) => [...prev, move]);
          switchTurn();
        }

        if (commentaryEnabled) {
          speakScore(formatDartInput(parsed));
        } else if (dartScore >= HIGH_SCORE_THRESHOLD) {
          playSound('180');
        }

        setInputValue('');
        return;
      }

      const scoreEntered = validateScore(score);
      if (scoreEntered === null) {
        setInputValue('');
        return;
      }

      const currentPlayer = players[currentPlayerIndex];
      const playerKey = `p${currentPlayerIndex}`;
      const isFirstTurn = firstTurnRef.current[playerKey] || false;
      
      const newTotalScore = currentPlayer.score - scoreEntered;
      const validationResult = validateX01Score(
        newTotalScore,
        gameOptions.doubleIn,
        gameOptions.doubleOut,
        isFirstTurn
      );

      if (validationResult === 'need-double-in') {
        setInputValue('');
        firstTurnRef.current[playerKey] = false;
        switchTurn();
        return;
      }

      if (validationResult === 'winner') {
        setPlayers((prev) => {
          const updated = [...prev];
          updated[currentPlayerIndex].score = 0;
          return updated;
        });
        
        if (commentaryEnabled) {
          speakScore(0);
        } else {
          playSound('trap');
        }

        const move: Move = {
          playerIndex: currentPlayerIndex,
          playerName: currentPlayer.name,
          dartScore: scoreEntered,
          previousScore: currentPlayer.score,
          newScore: 0,
          timestamp: Date.now(),
          wasCurrentPlayer: true,
        };
        
        const legWinner = checkForLegWinner(currentPlayer);
        
        if (legWinner && gameOptions.bestOfLegs > 1) {
          setPlayers((prev) => {
            const updated = [...prev];
            updated[currentPlayerIndex].legsWon = (updated[currentPlayerIndex].legsWon || 0) + 1;
            
            const allReset = updated.map(p => ({
              ...p,
              score: startingScore,
            }));
            firstTurnRef.current = {};
            return allReset;
          });
          setWinner(currentPlayer);
          setGameState('finished');
        } else {
          setMoveHistory((prev) => [...prev, move]);
          setWinner(currentPlayer);
          setGameState('finished');
        }
      } else if (validationResult === 'bust') {
        if (commentaryEnabled) {
          speakScore(0);
        }
        
        const move: Move = {
          playerIndex: currentPlayerIndex,
          playerName: currentPlayer.name,
          dartScore: 'BUST',
          previousScore: currentPlayer.score,
          newScore: currentPlayer.score,
          timestamp: Date.now(),
          wasCurrentPlayer: false,
        };
        setMoveHistory((prev) => [...prev, move]);
        switchTurn();
      } else {
        firstTurnRef.current[playerKey] = false;
        
        if (commentaryEnabled) {
          speakScore(newTotalScore);
        } else if (scoreEntered === 180) {
          playSound('180');
        }
        
        setPlayers((prev) => {
          const updated = [...prev];
          updated[currentPlayerIndex].score = newTotalScore;
          return updated;
        });
        
        const move: Move = {
          playerIndex: currentPlayerIndex,
          playerName: currentPlayer.name,
          dartScore: scoreEntered,
          previousScore: currentPlayer.score,
          newScore: newTotalScore,
          timestamp: Date.now(),
          wasCurrentPlayer: false,
        };
        
        setMoveHistory((prev) => [...prev, move]);
        switchTurn();
      }
    },
    [players, currentPlayerIndex, switchTurn, commentaryEnabled, gameMode, gameOptions, startingScore, checkForLegWinner]
  );

  const handleNumpadClick = useCallback((num: string) => {
    setInputValue((prev) => {
      const newVal = prev + num;
      const parsed = parseInt(newVal, 10);
      if (parsed >= 0 && parsed <= MAX_X01_SCORE && newVal.length <= MAX_SCORE_INPUT_LENGTH) {
        return newVal;
      }
      return prev;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setInputValue((prev) => prev.slice(0, -1));
  }, []);

  const resetGame = useCallback(() => {
    firstTurnRef.current = {};
    setGameState('setup');
    setPlayers(resetPlayersScores(players, gameMode, startingScore));
    setInputValue('');
    setWinner(null);
    setMoveHistory([]);
    setCurrentDarts([]);
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
    setPlayers((prev) => resetPlayersScores(prev, mode, STARTING_SCORES[mode]));
  }, []);

  const updateGameOptions = useCallback((options: Partial<GameOptions>) => {
    setGameOptions((prev) => ({ ...prev, ...options }));
  }, []);

  return {
    gameState,
    gameMode,
    gameOptions,
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
    updateGameOptions,
  };
};
