import { describe, it, expect } from 'vitest';
import {
  parseDartInput,
  calculateDartScore,
  formatDartInput,
  validateX01Score,
  calculateNewX01Score,
  isValidX01Score,
  isDouble,
  getInitialCricketMarks,
  calculateCricketScore,
  hasClosedAllCricket,
  isNumberClosedByAll,
  isCricketWinner,
  calculateTotalCricketPoints,
  resetPlayersScores,
} from './gameLogic';
import { Player, CricketMarks } from '@/src/types/game';

describe('parseDartInput', () => {
  it('parses single numbers', () => {
    expect(parseDartInput('20')).toEqual({ modifier: null, value: 20 });
    expect(parseDartInput('1')).toEqual({ modifier: null, value: 1 });
    expect(parseDartInput('  15  ')).toEqual({ modifier: null, value: 15 });
  });

  it('parses treble numbers', () => {
    expect(parseDartInput('T20')).toEqual({ modifier: 'T', value: 20 });
    expect(parseDartInput('t15')).toEqual({ modifier: 'T', value: 15 });
  });

  it('parses double numbers', () => {
    expect(parseDartInput('D20')).toEqual({ modifier: 'D', value: 20 });
    expect(parseDartInput('d10')).toEqual({ modifier: 'D', value: 10 });
  });

  it('parses bullseye inputs', () => {
    expect(parseDartInput('BULLSEYE')).toEqual({ modifier: 'D', value: 25 });
    expect(parseDartInput('50')).toEqual({ modifier: 'D', value: 25 });
  });

  it('parses outer bull inputs', () => {
    expect(parseDartInput('BULL')).toEqual({ modifier: null, value: 25 });
    expect(parseDartInput('OUTER')).toEqual({ modifier: null, value: 25 });
    expect(parseDartInput('25')).toEqual({ modifier: null, value: 25 });
  });

  it('returns null for invalid inputs', () => {
    expect(parseDartInput('')).toBeNull();
    expect(parseDartInput('   ')).toBeNull();
    expect(parseDartInput('0')).toBeNull();
    expect(parseDartInput('21')).toBeNull();
    expect(parseDartInput('T0')).toBeNull();
    expect(parseDartInput('D0')).toBeNull();
    expect(parseDartInput('ABC')).toBeNull();
  });
});

describe('calculateDartScore', () => {
  it('calculates single scores', () => {
    expect(calculateDartScore({ modifier: null, value: 20 })).toBe(20);
    expect(calculateDartScore({ modifier: null, value: 25 })).toBe(25);
  });

  it('calculates double scores', () => {
    expect(calculateDartScore({ modifier: 'D', value: 20 })).toBe(40);
    expect(calculateDartScore({ modifier: 'D', value: 25 })).toBe(50);
  });

  it('calculates treble scores', () => {
    expect(calculateDartScore({ modifier: 'T', value: 20 })).toBe(60);
    expect(calculateDartScore({ modifier: 'T', value: 19 })).toBe(57);
  });
});

describe('formatDartInput', () => {
  it('formats single numbers', () => {
    expect(formatDartInput({ modifier: null, value: 20 })).toBe('20');
    expect(formatDartInput({ modifier: null, value: 1 })).toBe('1');
  });

  it('formats double numbers', () => {
    expect(formatDartInput({ modifier: 'D', value: 20 })).toBe('D20');
    expect(formatDartInput({ modifier: 'D', value: 10 })).toBe('D10');
  });

  it('formats treble numbers', () => {
    expect(formatDartInput({ modifier: 'T', value: 20 })).toBe('T20');
    expect(formatDartInput({ modifier: 'T', value: 19 })).toBe('T19');
  });

  it('formats bullseye specially', () => {
    expect(formatDartInput({ modifier: 'D', value: 25 })).toBe('D-Bull');
    expect(formatDartInput({ modifier: null, value: 25 })).toBe('Bull');
  });
});

describe('validateX01Score', () => {
  it('returns score for valid inputs', () => {
    expect(validateX01Score('20')).toBe(20);
    expect(validateX01Score('T20')).toBe(60);
    expect(validateX01Score('D10')).toBe(20);
    expect(validateX01Score('BULL')).toBe(25);
    expect(validateX01Score('BULLSEYE')).toBe(50);
  });

  it('returns null for invalid inputs', () => {
    expect(validateX01Score('')).toBeNull();
    expect(validateX01Score('181')).toBeNull();
    expect(validateX01Score('ABC')).toBeNull();
  });

  it('returns 0 for input "0"', () => {
    expect(validateX01Score('0')).toBe(0);
  });
});

describe('calculateNewX01Score', () => {
  it('subtracts dart score from current score', () => {
    expect(calculateNewX01Score(501, 60)).toBe(441);
    expect(calculateNewX01Score(100, 50)).toBe(50);
    expect(calculateNewX01Score(50, 50)).toBe(0);
  });
});

describe('isValidX01Score', () => {
  describe('with double out (default)', () => {
    it('returns winner when score is 0', () => {
      expect(isValidX01Score(0, 'none', 'double', false)).toBe('need-double-out');
    });

    it('returns valid for normal scores', () => {
      expect(isValidX01Score(100, 'none', 'double', false)).toBe('valid');
    });

    it('returns bust for negative scores', () => {
      expect(isValidX01Score(-1, 'none', 'double', false)).toBe('bust');
    });

    it('returns bust for score of 1', () => {
      expect(isValidX01Score(1, 'none', 'double', false)).toBe('bust');
    });
  });

  describe('with double in', () => {
    it('returns need-double-in on first turn with odd score', () => {
      expect(isValidX01Score(301, 'double', 'none', true)).toBe('need-double-in');
    });

    it('returns valid on first turn with even score', () => {
      expect(isValidX01Score(300, 'double', 'none', true)).toBe('valid');
    });

    it('returns valid after first turn with double in', () => {
      expect(isValidX01Score(200, 'double', 'none', false)).toBe('valid');
    });

    it('returns need-double-in for 25 on first turn', () => {
      expect(isValidX01Score(25, 'double', 'none', true)).toBe('valid');
    });
  });

  describe('with double out', () => {
    it('returns need-double-out when score reaches 0', () => {
      expect(isValidX01Score(0, 'none', 'double', false)).toBe('need-double-out');
    });

    it('returns winner when score is 0 with double out disabled', () => {
      expect(isValidX01Score(0, 'none', 'none', false)).toBe('winner');
    });
  });
});

describe('isDouble', () => {
  it('returns true for double modifier', () => {
    expect(isDouble({ modifier: 'D', value: 20 })).toBe(true);
  });

  it('returns true for bull (outer bull without modifier)', () => {
    expect(isDouble({ modifier: null, value: 25 })).toBe(true);
  });

  it('returns false for single and treble', () => {
    expect(isDouble({ modifier: null, value: 20 })).toBe(false);
    expect(isDouble({ modifier: 'T', value: 20 })).toBe(false);
  });
});

describe('getInitialCricketMarks', () => {
  it('returns marks with 0 for all cricket numbers', () => {
    const marks = getInitialCricketMarks();
    expect(marks[20]).toBe(0);
    expect(marks[19]).toBe(0);
    expect(marks[18]).toBe(0);
    expect(marks[17]).toBe(0);
    expect(marks[16]).toBe(0);
    expect(marks[15]).toBe(0);
    expect(marks[25]).toBe(0);
  });
});

describe('calculateCricketScore', () => {
  const emptyMarks: CricketMarks = { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 };
  const opponentMarks: CricketMarks = { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 };

  it('adds single marks to number', () => {
    const result = calculateCricketScore(emptyMarks, { modifier: null, value: 20 }, opponentMarks);
    expect(result.newMarks[20]).toBe(1);
    expect(result.points).toBe(20);
    expect(result.isClosed).toBe(false);
  });

  it('adds double marks to number', () => {
    const result = calculateCricketScore(emptyMarks, { modifier: 'D', value: 20 }, opponentMarks);
    expect(result.newMarks[20]).toBe(2);
    expect(result.points).toBe(40);
  });

  it('adds treble marks to number', () => {
    const result = calculateCricketScore(emptyMarks, { modifier: 'T', value: 20 }, opponentMarks);
    expect(result.newMarks[20]).toBe(3);
    expect(result.points).toBe(60);
    expect(result.isClosed).toBe(true);
  });

  it('closes number at 3 marks', () => {
    const marks: CricketMarks = { 20: 2, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    const result = calculateCricketScore(marks, { modifier: null, value: 20 }, opponentMarks);
    expect(result.newMarks[20]).toBe(3);
    expect(result.isClosed).toBe(true);
  });

  it('does not add points when opponent has closed', () => {
    const opponentClosed: CricketMarks = { 20: 3, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    const result = calculateCricketScore(emptyMarks, { modifier: null, value: 20 }, opponentClosed);
    expect(result.points).toBe(0);
    expect(result.newMarks[20]).toBe(1);
  });

  it('handles outer bull', () => {
    const result = calculateCricketScore(emptyMarks, { modifier: null, value: 25 }, opponentMarks);
    expect(result.newMarks[25]).toBe(1);
    expect(result.points).toBe(25);
  });

  it('handles bullseye (double bull)', () => {
    const result = calculateCricketScore(emptyMarks, { modifier: 'D', value: 25 }, opponentMarks);
    expect(result.newMarks[25]).toBe(2);
    expect(result.points).toBe(50);
  });

  it('does not score non-cricket numbers', () => {
    const result = calculateCricketScore(emptyMarks, { modifier: null, value: 14 }, opponentMarks);
    expect(result.newMarks).toEqual(emptyMarks);
    expect(result.points).toBe(0);
  });
});

describe('hasClosedAllCricket', () => {
  it('returns true when all numbers are closed', () => {
    const marks: CricketMarks = { 20: 3, 19: 3, 18: 3, 17: 3, 16: 3, 15: 3, 25: 3 };
    expect(hasClosedAllCricket(marks)).toBe(true);
  });

  it('returns false when not all numbers are closed', () => {
    const marks: CricketMarks = { 20: 3, 19: 3, 18: 3, 17: 3, 16: 3, 15: 0, 25: 3 };
    expect(hasClosedAllCricket(marks)).toBe(false);
  });
});

describe('isNumberClosedByAll', () => {
  it('returns true when all players have closed the number', () => {
    const players: Player[] = [
      { id: '1', name: 'Player 1', score: 0, cricketMarks: { 20: 3, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 } },
      { id: '2', name: 'Player 2', score: 0, cricketMarks: { 20: 3, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 } },
    ];
    expect(isNumberClosedByAll(20, players)).toBe(true);
  });

  it('returns false when not all players have closed', () => {
    const players: Player[] = [
      { id: '1', name: 'Player 1', score: 0, cricketMarks: { 20: 3, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 } },
      { id: '2', name: 'Player 2', score: 0, cricketMarks: { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 } },
    ];
    expect(isNumberClosedByAll(20, players)).toBe(false);
  });
});

describe('calculateTotalCricketPoints', () => {
  it('calculates points for closed numbers', () => {
    const marks: CricketMarks = { 20: 3, 19: 3, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    const opponentMarks: CricketMarks = { 20: 1, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    expect(calculateTotalCricketPoints(marks, opponentMarks)).toBe(97); // (3-1)*20 + (3-0)*19 = 40 + 57
  });

  it('calculates points for open numbers', () => {
    const marks: CricketMarks = { 20: 2, 19: 1, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    const opponentMarks: CricketMarks = { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    expect(calculateTotalCricketPoints(marks, opponentMarks)).toBe(59); // 2*20 + 1*19
  });

  it('does not count points for opponent closed numbers', () => {
    const marks: CricketMarks = { 20: 2, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    const opponentMarks: CricketMarks = { 20: 3, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    expect(calculateTotalCricketPoints(marks, opponentMarks)).toBe(0);
  });

  it('handles bull marks', () => {
    const marks: CricketMarks = { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 3 };
    const opponentMarks: CricketMarks = { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    expect(calculateTotalCricketPoints(marks, opponentMarks)).toBe(150); // 3*25 (from loop) + 3*25 (from bull-specific code)
  });
});

describe('isCricketWinner', () => {
  it('returns true when player has closed all and has more points', () => {
    const playerMarks: CricketMarks = { 20: 3, 19: 3, 18: 3, 17: 3, 16: 3, 15: 3, 25: 3 };
    const opponentMarks: CricketMarks = { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    expect(isCricketWinner(playerMarks, opponentMarks)).toBe(true);
  });

  it('returns false when player has not closed all', () => {
    const playerMarks: CricketMarks = { 20: 3, 19: 3, 18: 3, 17: 3, 16: 3, 15: 0, 25: 3 };
    const opponentMarks: CricketMarks = { 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    expect(isCricketWinner(playerMarks, opponentMarks)).toBe(false);
  });

  it('returns false when opponent has more points', () => {
    const playerMarks: CricketMarks = { 20: 3, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 };
    const opponentMarks: CricketMarks = { 20: 3, 19: 3, 18: 3, 17: 3, 16: 3, 15: 3, 25: 3 };
    expect(isCricketWinner(playerMarks, opponentMarks)).toBe(false);
  });
});

describe('resetPlayersScores', () => {
  it('resets X01 scores', () => {
    const players: Player[] = [
      { id: '1', name: 'Player 1', score: 100, legsWon: 2, setsWon: 1 },
      { id: '2', name: 'Player 2', score: 50, legsWon: 1, setsWon: 0 },
    ];
    const result = resetPlayersScores(players, '501', 501);
    expect(result[0].score).toBe(501);
    expect(result[1].score).toBe(501);
    expect(result[0].legsWon).toBe(0);
    expect(result[1].setsWon).toBe(0);
  });

  it('resets cricket marks for cricket mode', () => {
    const players: Player[] = [
      { id: '1', name: 'Player 1', score: 0, cricketMarks: { 20: 3, 19: 2, 18: 1, 17: 0, 16: 0, 15: 0, 25: 3 } },
    ];
    const result = resetPlayersScores(players, 'cricket', 0);
    expect(result[0].cricketMarks).toEqual({ 20: 0, 19: 0, 18: 0, 17: 0, 16: 0, 15: 0, 25: 0 });
  });

  it('removes cricket marks for X01 modes', () => {
    const players: Player[] = [
      { id: '1', name: 'Player 1', score: 0, cricketMarks: { 20: 3, 19: 2, 18: 1, 17: 0, 16: 0, 15: 0, 25: 3 } },
    ];
    const result = resetPlayersScores(players, '501', 501);
    expect(result[0].cricketMarks).toBeUndefined();
  });
});
