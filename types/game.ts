export type GameMode = '501' | '301' | 'cricket';
export type GameState = 'setup' | 'playing' | 'finished';

export interface CricketMarks {
  [num: number]: number; // Maps 15, 16, 17, 18, 19, 20, 25 to marks (0-3)
}

export interface Player {
  id: string;
  name: string;
  score: number;
  cricketMarks?: CricketMarks;
}

export interface Move {
  playerIndex: number;
  playerName: string;
  dartScore: number | string; // Points for X01, or mark description for Cricket
  previousScore: number;
  newScore: number;
  previousMarks?: CricketMarks; // For Cricket undo
  timestamp: number;
  wasCurrentPlayer: boolean;
}

export interface GameSettings {
  mode: GameMode;
  playerCount: number;
  startingScore: number;
}

export type SoundType =
  | '180'
  | '67'
  | 'indian-song'
  | 'luke-the-nuke'
  | 'seven nation army'
  | 'messi'
  | 'kip'
  | 'trap'
  | 'brainrot'
  | 'fbi'
  | 'granny'
  | 'hema'
  | 'poepen'
  | 'scream'
  | 'sinterklaasjournaal'
  | 'spetterpoep'
  | 'watermeloen'
  | 'running'
  | 'angelo'
  | 'luchtalarm';
