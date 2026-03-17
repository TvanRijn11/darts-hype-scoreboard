export interface Throw {
  value: number;
  sector: number;
  isTreble: boolean;
  isDouble: boolean;
  isBull: boolean;
  isOuterBull: boolean;
  label: string;
}

export interface Checkout {
  throws: Throw[];
  dartCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const SECTORS = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const TREBLES = SECTORS.map(s => s * 3);
const DOUBLES = SECTORS.map(s => s * 2);
const SINGLES = [...SECTORS];

const ALL_SCORES = [
  ...SINGLES,
  ...DOUBLES,
  ...TREBLES,
  25, 50
];

const getThrow = (score: number): Throw | null => {
  if (score === 50) return { value: 50, sector: 25, isTreble: false, isDouble: false, isBull: true, isOuterBull: false, label: 'BULL' };
  if (score === 25) return { value: 25, sector: 25, isTreble: false, isDouble: false, isBull: false, isOuterBull: true, label: 'OUTER BULL' };
  
  const isTreble = score % 3 === 0 && score <= 60 && score > 0;
  const isDouble = score % 2 === 0 && score <= 40 && score > 0;
  
  if (isTreble) {
    const sector = score / 3;
    return { value: score, sector, isTreble: true, isDouble: false, isBull: false, isOuterBull: false, label: `T${sector}` };
  }
  
  if (isDouble) {
    const sector = score / 2;
    return { value: score, sector, isTreble: false, isDouble: true, isBull: false, isOuterBull: false, label: `D${sector}` };
  }
  
  if (score <= 20 && score >= 1) {
    return { value: score, sector: score, isTreble: false, isDouble: false, isBull: false, isOuterBull: false, label: `${score}` };
  }
  
  return null;
};

const findOneDartCheckout = (score: number): Throw[] | null => {
  if (score <= 40 && score % 2 === 0) {
    const throw_ = getThrow(score);
    if (throw_ && throw_.isDouble) {
      return [throw_];
    }
  }
  if (score === 50) return [getThrow(50)!];
  return null;
};

const findTwoDartCheckout = (score: number): Throw[] | null => {
  for (const first of ALL_SCORES) {
    const remaining = score - first;
    if (remaining <= 0) continue;
    
    const secondOptions = ALL_SCORES.filter(s => s <= remaining);
    
    for (const second of secondOptions) {
      const third = remaining - second;
      if (third <= 0) continue;
      
      if (third === 50) {
        return [getThrow(first)!, getThrow(second)!, getThrow(50)!];
      }
      
      if (third <= 40 && third % 2 === 0) {
        const thirdThrow = getThrow(third);
        if (thirdThrow && thirdThrow.isDouble) {
          return [getThrow(first)!, getThrow(second)!, thirdThrow];
        }
      }
    }
  }
  return null;
};

const findThreeDartCheckout = (score: number): Throw[] | null => {
  for (const first of ALL_SCORES) {
    for (const second of ALL_SCORES) {
      const afterTwo = score - first - second;
      if (afterTwo <= 0) continue;
      
      const thirdOptions = ALL_SCORES.filter(s => s <= afterTwo);
      
      for (const third of thirdOptions) {
        const remaining = afterTwo - third;
        
        if (remaining === 50) {
          return [getThrow(first)!, getThrow(second)!, getThrow(third)!, getThrow(50)!];
        }
        
        if (remaining <= 40 && remaining % 2 === 0) {
          const finalThrow = getThrow(remaining);
          if (finalThrow && finalThrow.isDouble) {
            return [getThrow(first)!, getThrow(second)!, getThrow(third)!, finalThrow];
          }
        }
      }
    }
  }
  return null;
};

export const getCheckouts = (score: number): Checkout[] => {
  if (score <= 0 || score > 170) return [];
  
  const checkouts: Checkout[] = [];
  
  if (score === 170) {
    return [{
      throws: [getThrow(60)!, getThrow(60)!, getThrow(50)!],
      dartCount: 3,
      difficulty: 'hard'
    }];
  }
  
  const oneDart = findOneDartCheckout(score);
  if (oneDart) {
    checkouts.push({
      throws: oneDart,
      dartCount: 1,
      difficulty: 'easy'
    });
  }
  
  const twoDart = findTwoDartCheckout(score);
  if (twoDart) {
    checkouts.push({
      throws: twoDart,
      dartCount: 2,
      difficulty: 'medium'
    });
  }
  
  const threeDart = findThreeDartCheckout(score);
  if (threeDart) {
    checkouts.push({
      throws: threeDart,
      dartCount: 3,
      difficulty: 'hard'
    });
  }
  
  return checkouts.sort((a, b) => a.dartCount - b.dartCount);
};

export const formatCheckout = (checkout: Checkout): string => {
  return checkout.throws.map(t => t.label).join(', ');
};

export const formatCheckoutShort = (checkout: Checkout): string => {
  return checkout.throws.map(t => t.label).join(' + ');
};

export const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  switch (difficulty) {
    case 'easy': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'hard': return 'text-red-400';
  }
};
