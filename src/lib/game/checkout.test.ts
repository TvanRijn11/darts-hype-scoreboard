import { describe, it, expect } from 'vitest';
import {
  getCheckouts,
  formatCheckout,
  formatCheckoutShort,
  getDifficultyColor,
} from './checkout';

describe('getCheckouts', () => {
  it('returns empty array for scores <= 0', () => {
    expect(getCheckouts(0)).toEqual([]);
    expect(getCheckouts(-1)).toEqual([]);
  });

  it('returns empty array for scores > 170', () => {
    expect(getCheckouts(171)).toEqual([]);
    expect(getCheckouts(180)).toEqual([]);
    expect(getCheckouts(200)).toEqual([]);
  });

  it('returns 170 checkout', () => {
    const checkouts = getCheckouts(170);
    expect(checkouts).toHaveLength(1);
    expect(checkouts[0].dartCount).toBe(3);
    expect(checkouts[0].difficulty).toBe('hard');
    expect(checkouts[0].throws.map(t => t.label)).toEqual(['T20', 'T20', 'BULL']);
  });

  it('returns one-dart checkouts for doubles', () => {
    const checkouts = getCheckouts(40);
    expect(checkouts.length).toBeGreaterThan(0);
    expect(checkouts[0].dartCount).toBe(1);
    expect(checkouts[0].difficulty).toBe('easy');
    expect(checkouts[0].throws[0].isDouble).toBe(true);
  });

  it('returns one-dart checkout for bullseye (50)', () => {
    const checkouts = getCheckouts(50);
    expect(checkouts.length).toBeGreaterThan(0);
    expect(checkouts[0].dartCount).toBe(1);
    expect(checkouts[0].throws[0].isBull).toBe(true);
  });

  it('returns two-dart checkouts when available', () => {
    const checkouts = getCheckouts(100);
    const hasTwoDart = checkouts.some(c => c.dartCount === 2);
    expect(hasTwoDart).toBe(true);
  });

  it('returns three-dart checkouts as fallback', () => {
    const checkouts = getCheckouts(165);
    expect(checkouts.length).toBeGreaterThan(0);
    const hasThreeDart = checkouts.some(c => c.dartCount === 3);
    expect(hasThreeDart).toBe(true);
  });

  it('sorts checkouts by difficulty (dart count)', () => {
    const checkouts = getCheckouts(100);
    if (checkouts.length > 1) {
      expect(checkouts[0].dartCount).toBeLessThanOrEqual(checkouts[1].dartCount);
    }
  });

  it('returns correct difficulty labels', () => {
    const doubleCheckouts = getCheckouts(40);
    expect(doubleCheckouts[0].difficulty).toBe('easy');

    const twoDartCheckouts = getCheckouts(100);
    const twoDart = twoDartCheckouts.find(c => c.dartCount === 2);
    if (twoDart) {
      expect(twoDart.difficulty).toBe('medium');
    }

    const threeDartCheckouts = getCheckouts(165);
    const threeDart = threeDartCheckouts.find(c => c.dartCount === 3);
    if (threeDart) {
      expect(threeDart.difficulty).toBe('hard');
    }
  });

  it('handles common checkout scores', () => {
    const scores = [16, 32, 50, 60, 80, 100, 120, 140, 160, 170];
    scores.forEach(score => {
      const checkouts = getCheckouts(score);
      expect(checkouts.length).toBeGreaterThan(0);
    });
  });
});

describe('formatCheckout', () => {
  it('formats single dart checkout', () => {
    const checkouts = getCheckouts(40);
    const formatted = formatCheckout(checkouts[0]);
    expect(formatted).toBe('D20');
  });

  it('formats multi-dart checkout with comma and space', () => {
    const checkouts = getCheckouts(100);
    const checkout = checkouts.find(c => c.dartCount === 2) || checkouts[0];
    const formatted = formatCheckout(checkout);
    expect(formatted).toContain(', ');
  });
});

describe('formatCheckoutShort', () => {
  it('formats checkout with + separator', () => {
    const checkouts = getCheckouts(100);
    const checkout = checkouts.find(c => c.dartCount === 2) || checkouts[0];
    const formatted = formatCheckoutShort(checkout);
    expect(formatted).toContain(' + ');
  });
});

describe('getDifficultyColor', () => {
  it('returns green for easy', () => {
    expect(getDifficultyColor('easy')).toBe('text-green-400');
  });

  it('returns yellow for medium', () => {
    expect(getDifficultyColor('medium')).toBe('text-yellow-400');
  });

  it('returns red for hard', () => {
    expect(getDifficultyColor('hard')).toBe('text-red-400');
  });
});
