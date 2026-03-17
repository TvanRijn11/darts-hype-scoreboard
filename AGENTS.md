# Agent Guidelines for Darts Hype Scoreboard

## Project Overview

This is a Next.js 15 + React 19 + TypeScript darts scoring application with soundboard features, WebSocket support for remote play, and cricket/X01 game modes.

## Commands

### Development
```bash
npm run dev          # Start dev server with turbopack
npm run build        # Production build
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run clean        # Clean Next.js cache
```

### Testing
```bash
npm test             # Run tests in watch mode
npm run test:run    # Run tests once
```

To run a single test file:
```bash
n vitest run src/lib/game/gameLogic.test.ts
```

To run tests matching a pattern:
```bash
n vitest run --testNamePattern="parseDartInput"
```

## Code Style Guidelines

### TypeScript

- Use explicit types for function parameters and return values
- Use `type` for unions, interfaces for object shapes
- Enable strict mode (already configured in tsconfig.json)

### Imports

- Use path aliases: `@/` or `@/src/` for imports
- Order imports: external libraries → internal modules → relative imports
- Group imports logically within files

```typescript
// Good
import React, { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useGameLogic } from "@/src/hooks/useGameLogic";
import { Header } from "@/src/components/ui/Header";
import { playSound } from "@/src/lib/sounds/sounds";
```

### File Organization

- Client components: `'use client'` directive at top
- Hooks: `useXxx.ts` naming convention in `/src/hooks/`
- Game logic: Pure functions in `/src/lib/game/`
- Components: PascalCase, co-located with tests

### Naming Conventions

- Components: PascalCase (`DartsGame`, `ScoreInput`)
- Hooks: camelCase with `use` prefix (`useGameLogic`, `useWebSocket`)
- Types/Interfaces: PascalCase (`Player`, `GameMode`, `CricketMarks`)
- Constants: SCREAMING_SNAKE_CASE for config values
- Files: kebab-case for utilities, PascalCase for components

### React Patterns

- Use functional components with arrow functions or `function` keyword
- Destructure props in component signature
- Use `useCallback` for callbacks passed to child components
- Use `useMemo` for expensive computations

```typescript
// Good
export const ScoreInput: React.FC<ScoreInputProps> = ({ value, onChange }) => {
  return <input value={value} onChange={onChange} />;
};

// Custom hook
export const useGameLogic = () => {
  const [state, setState] = useState(initialState);
  return { state, setState };
};
```

### Error Handling

- Use try/catch for async operations with meaningful error handling
- Avoid silently catching errors - at minimum log or provide user feedback
- Handle null/undefined cases explicitly

```typescript
// Good
try {
  const audio = new Audio(url);
  audio.play().catch(() => fallbackBehavior());
} catch (error) {
  console.error('Audio playback failed:', error);
  fallbackBehavior();
}
```

### Tailwind CSS

- Use Tailwind 4.0 patterns (utility-first)
- Use semantic class names for colors (emerald, zinc, etc.)
- Co-locate component styles when possible

### Testing

- Test files: `*.test.ts` or `*.test.tsx` in same directory as source
- Use Vitest with @testing-library/react
- Test behavior, not implementation details

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });
});
```

### Sound Configuration

- Sound files are auto-generated from JSON via `npm run generate:sounds`
- Edit `public/sounds/` to add new sounds, then regenerate types
- Sound IDs are defined in types/sounds.ts (auto-generated)

### WebSocket Patterns

- Use the `useWebSocket` hook for WebSocket functionality
- Handle connection states: 'idle' | 'connecting' | 'connected' | 'disconnected'

### Things to Avoid

- Don't add comments unless explicitly requested
- Don't commit secrets or API keys
- Don't modify auto-generated files manually (sounds, types)
- Don't use `any` type - use `unknown` or proper typing instead
- Avoid default exports unless necessary (named exports preferred)
