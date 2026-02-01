# How to Add New Games

This guide is written for LLM agents implementing new games in this codebase. Follow these patterns exactly to minimize errors and ensure consistency.

## Quick Reference

### File Structure Required

```
src/games/<game-name>/
├── Game.ts          # boardgame.io game definition & logic
├── Board.tsx        # React component for UI
├── index.ts         # Module exports
├── rules.md         # Game rules documentation
└── Game.test.ts     # Unit tests (write BEFORE implementation)
```

### Registration (src/registry.ts)

```typescript
import * as MyGame from './games/my-game';
import MyGameRules from './games/my-game/rules.md?raw';

// Add to games object:
'my-game': {
  game: MyGame.game,
  Board: MyGame.Board,
  name: 'My Game',
  description: 'Short description',
  minPlayers: 2,
  maxPlayers: 2,
  rules: MyGameRules,
},
```

---

## Implementation Phases

**IMPORTANT**: Commit each phase separately. Write tests BEFORE implementation (TDD).

### Phase 1: Core Types & State

Create `Game.ts` with type definitions:

```typescript
import type { Game } from 'boardgame.io';

// Define your state interface
export interface MyGameState {
  // Game state fields
}

// Define constants
export const BOARD_SIZE = 8;

// Define helper functions
export function helperFunction(): void {
  // ...
}

// Stub game definition (moves added later)
export const MyGame: Game<MyGameState> = {
  name: 'my-game',
  setup: () => ({
    // Initial state
  }),
  turn: {
    minMoves: 1,
    maxMoves: 1,
  },
  moves: {},
};
```

**Commit**: `feat(my-game): add core types and state definitions (Phase 1)`

### Phase 2: Board Setup

If your game has scenarios or complex setup:

```typescript
// scenarios.ts
export interface Scenario {
  name: string;
  description: string;
  // scenario-specific fields
}

export const scenarios: Record<string, Scenario> = {
  default: { /* ... */ },
};

export const defaultScenarioId = 'default';
```

Update `Game.ts` setup function to use scenarios.

**Commit**: `feat(my-game): add board setup and scenarios (Phase 2)`

### Phase 3: Unit Tests (TDD - Write BEFORE Implementation)

Create `Game.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import * as Game from './Game';

// Destructure what you need
const { helperFunction, CONSTANT } = Game;

describe('helperFunction', () => {
  it('does expected behavior', () => {
    expect(helperFunction()).toBe(expectedValue);
  });
});

// Test game logic functions
describe('isValidMove', () => {
  it('returns true for valid moves', () => {
    expect(Game.isValidMove(/* args */)).toBe(true);
  });

  it('returns false for invalid moves', () => {
    expect(Game.isValidMove(/* args */)).toBe(false);
  });
});
```

**Test Categories to Include**:
1. Position/coordinate helpers
2. Move validation functions
3. Game action resolution
4. State transitions
5. Win conditions

**Commit**: `test(my-game): add unit tests for game logic (TDD)`

### Phase 4: Game Moves Implementation

Add helper functions and moves to `Game.ts`:

```typescript
// Validation functions
export function isValidMove(/* args */): boolean {
  // Implementation
}

// Resolution functions
export function resolveAction(state: MyGameState, /* args */): Result {
  // Implementation
}

// In game definition:
moves: {
  myMove: ({ G, playerID }, arg1, arg2) => {
    if (!playerID) return;
    // Validate
    if (!isValidMove(arg1, arg2)) return;
    // Mutate state
    G.field = newValue;
  },
},
```

**Commit**: `feat(my-game): implement game moves (Phase 4)`

### Phase 5: Win Conditions

```typescript
export function checkWinCondition(state: MyGameState): { winner: string } | null {
  if (/* player 0 wins */) return { winner: '0' };
  if (/* player 1 wins */) return { winner: '1' };
  return null;
}

// In game definition:
endIf: ({ G }) => {
  return checkWinCondition(G);
},
```

**Commit**: `feat(my-game): add win condition logic (Phase 5)`

### Phase 6: Board UI

Create `Board.tsx`:

```typescript
import { useState } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { MyGameState } from './Game';
import { helperFunction } from './Game';

export function Board({ G, ctx, moves, playerID }: BoardProps<MyGameState>) {
  const [uiState, setUiState] = useState(initialValue);

  const isMyTurn = ctx.currentPlayer === playerID;

  // Status display
  let status: string;
  if (ctx.gameover) {
    status = `Winner: Player ${ctx.gameover.winner}`;
  } else {
    status = `Current player: ${ctx.currentPlayer}`;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>My Game</h1>
      <p>{status}</p>
      {/* Game board rendering */}
      {/* Action buttons */}
    </div>
  );
}
```

**Commit**: `feat(my-game): add Board UI component (Phase 6)`

### Phase 7: AI Support

Add to game definition:

```typescript
ai: {
  enumerate: (G: MyGameState, ctx) => {
    const moves: Array<{ move: string; args: unknown[] }> = [];
    const playerID = ctx.currentPlayer;

    // Enumerate all legal moves for current player
    // Example: all valid positions for a "place" move
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (isValidMove(G, i)) {
        moves.push({ move: 'place', args: [i] });
      }
    }

    return moves;
  },
},
```

**Commit**: `feat(my-game): add AI support with move enumeration (Phase 7)`

### Phase 8: Registration & Exports

Create `index.ts`:

```typescript
export { MyGame as game, type MyGameState } from './Game';
export { Board } from './Board';
```

Update `src/registry.ts` (see Quick Reference above).

**Commit**: `feat(my-game): register game in registry (Phase 8)`

---

## Patterns & Conventions

### boardgame.io Patterns

**Turn-based games** (like Tic-Tac-Toe):
```typescript
turn: {
  minMoves: 1,
  maxMoves: 1,
},
```

**Simultaneous games** (like Rock-Paper-Scissors):
```typescript
turn: {
  activePlayers: { all: 'play' },
},
phases: {
  play: {
    start: true,
    moves: { /* ... */ },
    endIf: ({ G }) => /* condition */,
    onEnd: ({ G }) => { /* cleanup */ },
    next: 'play',
  },
},
```

### State Mutation

boardgame.io uses Immer - mutate state directly:

```typescript
// Correct - direct mutation
G.cells[id] = playerID;
G.score++;

// Wrong - don't return new state
return { ...G, cells: newCells }; // DON'T DO THIS
```

### Player IDs

Always `'0'` or `'1'` as strings:

```typescript
const pid = playerID as '0' | '1';
const opponentId = pid === '0' ? '1' : '0';
```

### Position Helpers (for grid games)

```typescript
export const BOARD_SIZE = 8;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

export interface Position {
  x: number;
  y: number;
}

export function posToIndex(pos: Position): number {
  return pos.y * BOARD_SIZE + pos.x;
}

export function indexToPos(index: number): Position {
  return {
    x: index % BOARD_SIZE,
    y: Math.floor(index / BOARD_SIZE),
  };
}

export function isValidPos(pos: Position): boolean {
  return pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE;
}
```

### Move Validation Pattern

Always validate before mutating:

```typescript
myMove: ({ G, playerID }, target) => {
  // 1. Check playerID exists
  if (!playerID) return;

  // 2. Validate the move
  if (!isValidMove(G, target)) return;

  // 3. Only then mutate state
  G.field = newValue;
},
```

---

## TypeScript Considerations

### Avoid Unused Variables

Prefix intentionally unused parameters with `_`:

```typescript
export function helper(_unusedParam: Type, usedParam: Type): void {
  // ...
}
```

### Type Imports

Use `type` imports for types only:

```typescript
import type { Game } from 'boardgame.io';
import type { BoardProps } from 'boardgame.io/react';
```

### Export Types

Export state types for use in tests and Board:

```typescript
export type { MyGameState, Position, PieceType };
```

---

## Testing Guidelines

### Test File Structure

```typescript
import { describe, it, expect } from 'vitest';
import * as Game from './Game';

// Group related tests
describe('functionName', () => {
  it('handles normal case', () => { /* ... */ });
  it('handles edge case', () => { /* ... */ });
  it('rejects invalid input', () => { /* ... */ });
});
```

### What to Test

1. **Helper functions**: Position conversion, validation
2. **Move validation**: Valid/invalid inputs
3. **Game resolution**: Action outcomes
4. **Win conditions**: All winning scenarios
5. **State transitions**: Piece states, turn progression

### What NOT to Test

- boardgame.io framework behavior
- React component rendering (unless complex logic)
- Trivial getters/setters

---

## Common Pitfalls

### 1. Forgetting to return early on invalid moves

```typescript
// Wrong - continues execution
if (!isValid) {
  console.log('invalid');
}
G.field = value; // Still runs!

// Correct
if (!isValid) return;
G.field = value;
```

### 2. Not handling null playerID

```typescript
// Wrong
const pid = playerID as '0' | '1'; // Could crash

// Correct
if (!playerID) return;
const pid = playerID as '0' | '1';
```

### 3. Forgetting to update cells AND position tracking

If tracking positions separately from cell contents:

```typescript
// Must update both
G.cells[posToIndex(oldPos)] = null;
G.cells[posToIndex(newPos)] = 'piece';
G.piecePosition = newPos;
```

### 4. Not registering in registry.ts

The game won't appear in the UI until added to `registry.ts`.

---

## Verification Checklist

Before considering implementation complete:

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Game appears in UI game selector
- [ ] Can play a complete game
- [ ] Win condition triggers correctly
- [ ] AI can play (if applicable)
- [ ] Rules.md is accurate and complete

---

## Example Games to Reference

| Game | Complexity | Key Patterns |
|------|------------|--------------|
| `tic-tac-toe` | Simple | Turn-based, grid, win detection |
| `rock-paper-scissors` | Simple | Simultaneous moves, phases |
| `mecha-duel` | Complex | Scenarios, piece states, raycast, multi-step moves |

---

## Commands Reference

```bash
# Run all tests
npm test

# Run specific game tests
npm test -- src/games/my-game/Game.test.ts

# Build (also runs TypeScript check)
npm run build

# Development server
npm run dev
```
