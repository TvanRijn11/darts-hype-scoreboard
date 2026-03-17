'use client';

import { MAX_X01_SCORE, MIN_DART_SCORE, CRICKET_NUMBERS } from '@/src/lib/game/constants';
import { Player, CricketMarks, GameMode, DartInput, DoubleInMode, DoubleOutMode } from '@/src/types/game';

export const parseDartInput = (input: string): DartInput | null => {
  const trimmed = input.trim().toUpperCase();
  
  if (!trimmed) return null;
  
  let modifier: DartInput['modifier'] = null;
  let valueStr = trimmed;
  
  if (trimmed.startsWith('D') || trimmed.startsWith('T')) {
    modifier = trimmed[0] as 'D' | 'T';
    valueStr = trimmed.slice(1);
  } else if (trimmed === 'BULL' || trimmed === 'OUTER' || trimmed === '25') {
    return { modifier: null, value: 25 };
  } else if (trimmed === 'BULLSEYE' || trimmed === 'DOUBLE BULL' || trimmed === '50') {
    return { modifier: 'D', value: 25 };
  }
  
  const value = parseInt(valueStr, 10);
  if (isNaN(value) || value < 1 || value > 20) {
    if (valueStr === '25') return { modifier: null, value: 25 };
    return null;
  }
  
  return { modifier, value };
};

export const calculateDartScore = (input: DartInput): number => {
  const { modifier, value } = input;
  if (!modifier) return value;
  if (modifier === 'D') return value * 2;
  if (modifier === 'T') return value * 3;
  return value;
};

export const formatDartInput = (input: DartInput): string => {
  const { modifier, value } = input;
  if (value === 25 && modifier === 'D') return 'D-Bull';
  if (value === 25 && !modifier) return 'Bull';
  if (modifier) return `${modifier}${value}`;
  return `${value}`;
};

export const validateX01Score = (input: string): number | null => {
  const trimmed = input.trim();
  
  if (!trimmed) return null;
  
  const parsed = parseDartInput(trimmed);
  if (parsed) {
    const score = calculateDartScore(parsed);
    if (score < MIN_DART_SCORE || score > MAX_X01_SCORE) {
      return null;
    }
    return score;
  }
  
  const rawNumber = parseInt(trimmed, 10);
  if (isNaN(rawNumber) || rawNumber < 0 || rawNumber > MAX_X01_SCORE) {
    return null;
  }
  
  return rawNumber;
};

export const calculateNewX01Score = (currentScore: number, dartScore: number): number => {
  return currentScore - dartScore;
};

export const isValidX01Score = (
  newScore: number,
  doubleIn: DoubleInMode = 'none',
  doubleOut: DoubleOutMode = 'double',
  isFirstTurn: boolean = false
): 'valid' | 'bust' | 'winner' | 'need-double-in' | 'need-double-out' => {
  if (newScore === 0) {
    if (doubleOut === 'double') {
      return 'need-double-out';
    }
    return 'winner';
  }
  
  if (newScore < 0) return 'bust';
  if (newScore === 1) return 'bust';
  
  if (doubleIn === 'double' && isFirstTurn && newScore % 2 !== 0 && newScore !== 25) {
    return 'need-double-in';
  }
  
  return 'valid';
};

export const isDouble = (input: DartInput): boolean => {
  return input.modifier === 'D' || (input.value === 25 && !input.modifier);
};

export const getInitialCricketMarks = (): CricketMarks => {
  const marks: CricketMarks = {};
  CRICKET_NUMBERS.forEach((num) => {
    marks[num] = 0;
  });
  return marks;
};

export const calculateCricketScore = (
  currentMarks: CricketMarks,
  input: DartInput,
  opponentMarks: CricketMarks
): { newMarks: CricketMarks; points: number; isClosed: boolean } => {
  const { modifier, value } = input;
  const newMarks = { ...currentMarks };
  let points = 0;
  let isClosed = false;
  
  if (value === 25) {
    const marksToAdd = modifier === 'D' ? 2 : 1;
    const current = newMarks[25] || 0;
    const opponentClosed = (opponentMarks[25] || 0) >= 3;
    
    if (current < 3 || !opponentClosed) {
      newMarks[25] = Math.min(current + marksToAdd, 3);
      if (!opponentClosed && current < 3) {
        points += marksToAdd * 25;
      }
      if (newMarks[25] === 3 && current < 3) {
        isClosed = true;
      }
    }
  } else if (value >= 15 && value <= 20) {
    const marksToAdd = modifier === 'T' ? 3 : (modifier === 'D' ? 2 : 1);
    const current = newMarks[value] || 0;
    const opponentClosed = (opponentMarks[value] || 0) >= 3;
    
    if (current < 3 || !opponentClosed) {
      newMarks[value] = Math.min(current + marksToAdd, 3);
      if (!opponentClosed && current < 3) {
        points += marksToAdd * value;
      }
      if (newMarks[value] === 3 && current < 3) {
        isClosed = true;
      }
    }
  }
  
  return { newMarks, points, isClosed };
};

export const hasClosedAllCricket = (marks: CricketMarks): boolean => {
  return CRICKET_NUMBERS.every((num) => marks[num] >= 3);
};

export const isNumberClosedByAll = (num: number, players: Player[]): boolean => {
  return players.every((p) => p.cricketMarks && p.cricketMarks[num] >= 3);
};

export const isCricketWinner = (
  playerMarks: CricketMarks,
  opponentMarks: Record<number, number>
): boolean => {
  const playerClosed = hasClosedAllCricket(playerMarks);
  if (!playerClosed) return false;
  
  const playerPoints = calculateTotalCricketPoints(playerMarks, opponentMarks);
  const opponentPoints = calculateTotalCricketPoints(opponentMarks, playerMarks);
  
  return playerPoints > opponentPoints;
};

export const calculateTotalCricketPoints = (
  marks: CricketMarks,
  opponentMarks: Record<number, number>
): number => {
  let points = 0;
  
  for (const num of CRICKET_NUMBERS) {
    const playerMark = marks[num] || 0;
    const oppMark = opponentMarks[num] || 0;
    
    if (playerMark >= 3) {
      const diff = Math.max(0, playerMark - oppMark);
      points += diff * num;
    } else if (playerMark > 0 && oppMark < 3) {
      points += playerMark * num;
    }
  }
  
  const playerBull = marks[25] || 0;
  const oppBull = opponentMarks[25] || 0;
  if (playerBull >= 3) {
    const diff = Math.max(0, playerBull - oppBull);
    points += diff * 25;
  } else if (playerBull > 0 && oppBull < 3) {
    points += playerBull * 25;
  }
  
  return points;
};

export const resetPlayersScores = (players: Player[], mode: GameMode, startingScore: number): Player[] => {
  return players.map((p) => ({
    ...p,
    score: startingScore,
    cricketMarks: mode === 'cricket' ? getInitialCricketMarks() : undefined,
    legsWon: 0,
    setsWon: 0,
  }));
};
