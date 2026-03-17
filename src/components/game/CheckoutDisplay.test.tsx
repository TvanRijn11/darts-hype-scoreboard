import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CheckoutDisplay } from './CheckoutDisplay';
import { Checkout } from '@/src/lib/game/checkout';

describe('CheckoutDisplay', () => {
  const mockCheckouts: Checkout[] = [
    {
      throws: [
        { value: 40, sector: 20, isTreble: false, isDouble: true, isBull: false, isOuterBull: false, label: 'D20' },
      ],
      dartCount: 1,
      difficulty: 'easy',
    },
    {
      throws: [
        { value: 20, sector: 20, isTreble: false, isDouble: false, isBull: false, isOuterBull: false, label: '20' },
        { value: 40, sector: 20, isTreble: false, isDouble: true, isBull: false, isOuterBull: false, label: 'D20' },
      ],
      dartCount: 2,
      difficulty: 'medium',
    },
    {
      throws: [
        { value: 20, sector: 20, isTreble: false, isDouble: false, isBull: false, isOuterBull: false, label: '20' },
        { value: 20, sector: 20, isTreble: false, isDouble: false, isBull: false, isOuterBull: false, label: '20' },
        { value: 40, sector: 20, isTreble: false, isDouble: true, isBull: false, isOuterBull: false, label: 'D20' },
      ],
      dartCount: 3,
      difficulty: 'hard',
    },
  ];

  it('renders nothing when checkouts array is empty', () => {
    const { container } = render(<CheckoutDisplay checkouts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders checkouts when provided', () => {
    render(<CheckoutDisplay checkouts={mockCheckouts} />);
    
    expect(screen.getByText('Checkout Paths')).toBeInTheDocument();
    expect(screen.getByText('D20')).toBeInTheDocument();
  });

  it('displays only top 3 checkouts', () => {
    const manyCheckouts: Checkout[] = [
      ...mockCheckouts,
      {
        throws: [{ value: 20, sector: 20, isTreble: false, isDouble: false, isBull: false, isOuterBull: false, label: '20' }],
        dartCount: 1,
        difficulty: 'easy',
      },
      {
        throws: [{ value: 18, sector: 18, isTreble: false, isDouble: false, isBull: false, isOuterBull: false, label: '18' }],
        dartCount: 1,
        difficulty: 'easy',
      },
    ];
    
    render(<CheckoutDisplay checkouts={manyCheckouts} />);
    
    const checkoutTexts = screen.getAllByText(/\d+-dart/);
    expect(checkoutTexts).toHaveLength(3);
  });

  it('displays dart count correctly', () => {
    render(<CheckoutDisplay checkouts={mockCheckouts} />);
    
    expect(screen.getByText('1-dart')).toBeInTheDocument();
    expect(screen.getByText('2-dart')).toBeInTheDocument();
    expect(screen.getByText('3-dart')).toBeInTheDocument();
  });
});
