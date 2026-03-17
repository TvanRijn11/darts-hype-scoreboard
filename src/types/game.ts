export type GameMode = '501' | '301' | 'cricket';
export type GameState = 'setup' | 'playing' | 'finished';

export type DoubleInMode = 'none' | 'double';
export type DoubleOutMode = 'none' | 'double';

export interface GameOptions {
  doubleIn: DoubleInMode;
  doubleOut: DoubleOutMode;
  bestOfLegs: number;
  bestOfSets: number;
  dartsPerTurn?: 1 | 2 | 3;
}

export interface CricketMarks {
  [num: number]: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  cricketMarks?: CricketMarks;
  legsWon?: number;
  setsWon?: number;
}

export type DartModifier = 'S' | 'D' | 'T';

export interface DartInput {
  modifier: DartModifier | null;
  value: number;
}

export interface Move {
  playerIndex: number;
  playerName: string;
  dartScore: number | string;
  previousScore: number;
  newScore: number;
  previousMarks?: CricketMarks;
  timestamp: number;
  wasCurrentPlayer: boolean;
  modifier?: DartModifier;
}

export interface GameSettings {
  mode: GameMode;
  playerCount: number;
  startingScore: number;
}

export type { SoundType } from './sounds';
