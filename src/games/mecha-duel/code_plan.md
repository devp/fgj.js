# Mecha Duel - Implementation Plan

## Overview

Implement the Mecha Duel game following the boardgame.io patterns established in the codebase. Each phase should be committed separately.

## File Structure

```
src/games/mecha-duel/
├── Game.ts          # boardgame.io game definition & logic
├── Board.tsx        # React component for UI
├── index.ts         # Module exports
├── rules.md         # Game rules (already exists)
├── code_plan.md     # This file
├── scenarios.ts     # Scenario definitions (pawn layouts)
└── Game.test.ts     # Unit tests
```

---

## Phase 1: Core Types & State

**File:** `Game.ts`

### Types to Define

```typescript
// Board coordinates
type Position = { x: number; y: number };

// Piece types for attacks
type PieceType = 'bishop' | 'rook' | 'knight' | 'queen';

// Piece lifecycle states
type PieceState = 'ready' | 'committed' | 'exhausted';

// A single piece in player's supply
interface Piece {
  type: PieceType;
  state: PieceState;
  id: number;  // Unique identifier within player's supply
}

// A committed piece on the board
interface CommittedPiece {
  pieceId: number;       // Reference to piece in supply
  playerId: string;      // '0' or '1'
  type: PieceType;
  target: Position;      // Committed target square
}

// Cell contents
type CellContent = 'pawn' | 'king0' | 'king1' | null;

// Main game state
interface MechaDuelState {
  cells: CellContent[];          // 8x8 = 64 cells, row-major order
  kings: {
    '0': Position | null;        // null if destroyed
    '1': Position | null;
  };
  pieces: {
    '0': Piece[];                // Player 0's piece supply
    '1': Piece[];                // Player 1's piece supply
  };
  committedPieces: CommittedPiece[];
}
```

### Helper Functions

- `posToIndex(pos: Position): number` - Convert x,y to cell index
- `indexToPos(index: number): Position` - Convert cell index to x,y
- `isValidPos(pos: Position): boolean` - Check if position is on board

### Commit

- Define empty game shell with types
- Export state interface

---

## Phase 2: Board Setup & Scenarios

**Files:** `Game.ts`, `scenarios.ts`

### Scenarios Module

```typescript
// scenarios.ts
interface Scenario {
  name: string;
  description: string;
  pawns: Position[];  // Pawn positions
}

export const scenarios: Record<string, Scenario> = {
  simple: {
    name: 'Simple',
    description: 'A basic symmetric layout with minimal pawns',
    pawns: [
      // Symmetric pawn placement for 8x8
    ],
  },
};

export const defaultScenario = 'simple';
```

### Setup Function

```typescript
setup: () => ({
  cells: initializeBoardWithPawns(scenarios[defaultScenario].pawns),
  kings: {
    '0': { x: 4, y: 0 },   // Player 0 King at row 0
    '1': { x: 4, y: 7 },   // Player 1 King at row 7
  },
  pieces: {
    '0': createInitialPieces(),  // 2B, 2R, 2N, 1Q all Ready
    '1': createInitialPieces(),
  },
  committedPieces: [],
})
```

### Simple Scenario Design (8x8)

```
Row 7: [ ][ ][ ][ ][K1][ ][ ][ ]    ← Player 1's King
Row 6: [ ][ ][ ][ ][ ][ ][ ][ ]
Row 5: [ ][ ][P][ ][ ][P][ ][ ]    ← Pawns
Row 4: [ ][ ][ ][ ][ ][ ][ ][ ]
Row 3: [ ][ ][ ][ ][ ][ ][ ][ ]
Row 2: [ ][ ][P][ ][ ][P][ ][ ]    ← Pawns
Row 1: [ ][ ][ ][ ][ ][ ][ ][ ]
Row 0: [ ][ ][ ][ ][K0][ ][ ][ ]    ← Player 0's King
       0  1  2  3  4  5  6  7
```

### Commit

- Scenarios module with simple scenario
- Setup function initializing board state

---

## Phase 8: Unit Tests (Write Tests First)

**File:** `Game.test.ts`

Write tests BEFORE implementing moves. Tests define expected behavior.

### Test Categories

#### 1. Position Helpers
```typescript
describe('position helpers', () => {
  it('converts position to index correctly');
  it('converts index to position correctly');
  it('validates board positions');
});
```

#### 2. Commit Validation
```typescript
describe('isValidCommitSquare', () => {
  describe('bishop commits', () => {
    it('allows diagonal squares from King');
    it('rejects non-diagonal squares');
    it('rejects squares blocked by pawns'); // If applicable
  });

  describe('rook commits', () => {
    it('allows orthogonal squares from King');
    it('rejects non-orthogonal squares');
  });

  describe('knight commits', () => {
    it('allows L-shaped squares from King');
    it('rejects non-L-shaped squares');
  });

  describe('queen commits', () => {
    it('allows diagonal and orthogonal squares');
  });
});
```

#### 3. Strike Resolution
```typescript
describe('resolveStrike', () => {
  it('destroys first pawn in path');
  it('destroys opponent King in path');
  it('misses if no target in path');
  it('stops at first obstacle');
  it('ray-casts from current King position');
});
```

#### 4. Knight Resolution
```typescript
describe('resolveKnight', () => {
  it('moves King to committed square');
  it('fails if square not valid L-jump from current position');
  it('destroys pawn at landing square');
  it('destroys opponent King at landing square');
});
```

#### 5. KingStep Resolution
```typescript
describe('resolveKingStep', () => {
  it('moves King one square');
  it('allows all 8 directions');
  it('destroys pawn when entering pawn square');
  it('destroys opponent King when stepping on');
  it('rejects moves off board');
});
```

#### 6. Piece State Transitions
```typescript
describe('piece state transitions', () => {
  it('commit changes piece from Ready to Committed');
  it('execute changes piece from Committed to Exhausted');
  it('pass changes Committed to Exhausted');
  it('pass changes Exhausted to Ready');
});
```

#### 7. Win Conditions
```typescript
describe('win conditions', () => {
  it('detects win when opponent King destroyed by Strike');
  it('detects win when opponent King destroyed by Knight');
  it('detects win when opponent King destroyed by KingStep');
  it('returns no winner when both Kings alive');
});
```

### Commit

- Full test suite with pending/skeleton tests
- Tests define expected behavior for Phase 3

---

## Phase 3: Game Moves Implementation

**File:** `Game.ts`

### Move: `commit`

```typescript
commit: ({ G, playerID }, pieceId: number, target: Position) => {
  // 1. Validate piece exists and is Ready
  // 2. Validate target is valid for piece type from King position
  // 3. Update piece state to Committed
  // 4. Add to committedPieces array
}
```

### Move: `execute`

```typescript
execute: ({ G, playerID }, pieceIds: number[]) => {
  // 1. Validate all pieces are Committed and belong to player
  // 2. Separate into strikes and knights
  // 3. Resolve all strikes (simultaneously)
  //    - Ray-cast from King toward each target
  //    - Destroy first obstacle (pawn or opponent King)
  // 4. Resolve knights sequentially
  //    - Validate L-jump from current King position
  //    - Move King, destroy any pawn at destination
  // 5. Mark executed pieces as Exhausted
  // 6. Mark unchosen Committed pieces as Exhausted
}
```

### Move: `kingStep`

```typescript
kingStep: ({ G, playerID }, direction: Position) => {
  // 1. Validate direction is 1 square (orthogonal/diagonal)
  // 2. Calculate target position
  // 3. Validate target is on board
  // 4. Move King, destroy pawn if present
  // 5. Check if opponent King destroyed
  // 6. Mark all Committed pieces as Exhausted
}
```

### Move: `pass`

```typescript
pass: ({ G, playerID }) => {
  // 1. Mark all Committed pieces as Exhausted
  // 2. Mark all Exhausted pieces as Ready
}
```

### Helper Functions

- `isValidBishopTarget(kingPos, target): boolean`
- `isValidRookTarget(kingPos, target): boolean`
- `isValidKnightTarget(kingPos, target): boolean`
- `isValidQueenTarget(kingPos, target): boolean`
- `raycast(from, toward, cells): Position | null` - Find first hit
- `isValidKnightJump(from, to): boolean`

### Commit

- All move implementations
- All helper functions
- Tests should pass

---

## Phase 4: Win Condition Logic

**File:** `Game.ts`

### endIf Implementation

```typescript
endIf: ({ G }) => {
  if (G.kings['0'] === null) {
    return { winner: '1' };
  }
  if (G.kings['1'] === null) {
    return { winner: '0' };
  }
  return undefined;  // Game continues
}
```

### Commit

- Win condition checks
- endIf function

---

## Phase 5: Board UI

**File:** `Board.tsx`

### Component Structure

```tsx
function Board({ G, ctx, moves, playerID }: BoardProps<MechaDuelState>) {
  // State for UI interaction
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [selectedPiecesToExecute, setSelectedPiecesToExecute] = useState<number[]>([]);

  return (
    <div className="mecha-duel">
      <h1>Mecha Duel</h1>
      <StatusDisplay ctx={ctx} />
      <GameBoard G={G} onCellClick={handleCellClick} />
      <ActionPanel
        onCommit={() => setSelectedAction('commit')}
        onExecute={() => setSelectedAction('execute')}
        onKingStep={() => setSelectedAction('kingstep')}
        onPass={() => moves.pass()}
      />
      <PieceSupply pieces={G.pieces[playerID]} onSelect={handlePieceSelect} />
    </div>
  );
}
```

### Sub-components

1. **StatusDisplay** - Current player, turn info, winner
2. **GameBoard** - 8x8 grid with Kings, Pawns, committed pieces
3. **ActionPanel** - Buttons for Commit/Execute/KingStep/Pass
4. **PieceSupply** - Shows player's pieces with states

### Visual Elements

- Grid with coordinates (a-h, 1-8 or 0-7)
- Kings shown with distinct colors per player
- Pawns as obstacles
- Committed pieces shown on target squares with indicators
- Valid move highlights when selecting

### Commit

- Board component with full UI
- Styling for game elements

---

## Phase 6: AI Support

**File:** `Game.ts`

### ai.enumerate Implementation

```typescript
ai: {
  enumerate: (G: MechaDuelState, ctx: Ctx) => {
    const moves: Array<{ move: string; args: unknown[] }> = [];
    const playerID = ctx.currentPlayer;
    const kingPos = G.kings[playerID as '0' | '1'];

    if (!kingPos) return moves;  // King destroyed, no moves

    // Enumerate all valid Commit moves
    for (const piece of G.pieces[playerID]) {
      if (piece.state === 'ready') {
        for (const target of getValidCommitTargets(piece.type, kingPos, G)) {
          moves.push({ move: 'commit', args: [piece.id, target] });
        }
      }
    }

    // Enumerate Execute combinations
    const committedPieces = G.committedPieces.filter(p => p.playerId === playerID);
    if (committedPieces.length > 0) {
      // All non-empty subsets of committed pieces
      for (const subset of powerSet(committedPieces)) {
        if (subset.length > 0) {
          moves.push({ move: 'execute', args: [subset.map(p => p.pieceId)] });
        }
      }
    }

    // Enumerate KingStep moves (8 directions)
    for (const dir of DIRECTIONS) {
      const target = { x: kingPos.x + dir.x, y: kingPos.y + dir.y };
      if (isValidPos(target)) {
        moves.push({ move: 'kingStep', args: [dir] });
      }
    }

    // Pass is always valid
    moves.push({ move: 'pass', args: [] });

    return moves;
  },
}
```

### Commit

- AI enumerate function
- Helper functions for move enumeration

---

## Phase 7: Registration

**File:** `src/registry.ts`

### Updates

```typescript
import * as MechaDuel from './games/mecha-duel';
import MechaDuelRules from './games/mecha-duel/rules.md?raw';

export const games: Record<string, GameDefinition> = {
  // ... existing games
  'mecha-duel': {
    game: MechaDuel.game,
    Board: MechaDuel.Board,
    name: 'Mecha Duel',
    description: 'Strategic mecha combat with committed attacks',
    minPlayers: 2,
    maxPlayers: 2,
    rules: MechaDuelRules,
  },
};
```

**File:** `src/games/mecha-duel/index.ts`

```typescript
export { MechaDuel as game, type MechaDuelState } from './Game';
export { Board } from './Board';
```

### Commit

- Index exports
- Registry entry
- Game playable in UI

---

## Implementation Order Summary

1. **Phase 1:** Core Types & State → Commit
2. **Phase 2:** Board Setup & Scenarios → Commit
3. **Phase 8:** Unit Tests (skeleton/pending) → Commit
4. **Phase 3:** Game Moves Implementation → Commit (tests pass)
5. **Phase 4:** Win Condition Logic → Commit
6. **Phase 5:** Board UI → Commit
7. **Phase 6:** AI Support → Commit
8. **Phase 7:** Registration → Commit

---

## Notes

- Use MCTSBot for AI (turn-based game)
- Follow existing patterns from tic-tac-toe and rock-paper-scissors
- Keep UI simple but functional
- Ensure all tests pass before moving to next phase
