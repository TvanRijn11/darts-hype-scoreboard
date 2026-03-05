'use client';

import { MAX_X01_SCORE, MIN_DART_SCORE, CRICKET_NUMBERS } from '@/lib/constants';
import { Player, CricketMarks, GameMode } from '@/types/game';

/**
 * Validates a score input string and returns a valid number or null for X01
 */
export const validateX01Score = (input: string): number | null => {
  const score = parseInt(input, 10);
  if (isNaN(score) || score < MIN_DART_SCORE || score > MAX_X01_SCORE) {
    return null;
  }
  return score;
};

/**
 * Calculates the new score after a dart throw for X01
 */
export const calculateNewX01Score = (currentScore: number, dartScore: number): number => {
  return currentScore - dartScore;
};

/**
 * Determines if a score is valid, a bust, or a winner for X01
 */
export const isValidX01Score = (newScore: number): 'valid' | 'bust' | 'winner' => {
  if (newScore === 0) return 'winner';
  if (newScore < 0) return 'bust';
  if (newScore === 1) return 'bust'; // Cannot finish on 1 in double-out, but keeping it simple for now
  return 'valid';
};

/**
 * Initial Cricket marks
 */
export const getInitialCricketMarks = (): CricketMarks => {
  const marks: CricketMarks = {};
  CRICKET_NUMBERS.forEach((num) => {
    marks[num] = 0;
  });
  return marks;
};

/**
 * Checks if a player has closed all numbers in Cricket
 */
export const hasClosedAllCricket = (marks: CricketMarks): boolean => {
  return CRICKET_NUMBERS.every((num) => marks[num] >= 3);
};

/**
 * Checks if a number is closed by all players
 */
export const isNumberClosedByAll = (num: number, players: Player[]): boolean => {
  return players.every((p) => p.cricketMarks && p.cricketMarks[num] >= 3);
};

/**
 * Resets all players' scores based on game mode
 */
export const resetPlayersScores = (players: Player[], mode: GameMode, startingScore: number): Player[] => {
  return players.map((p) => ({
    ...p,
    score: startingScore,
    cricketMarks: mode === 'cricket' ? getInitialCricketMarks() : undefined,
  }));
};
