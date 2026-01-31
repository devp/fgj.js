import { describe, it, expect } from 'vitest';
import * as Game from './Game';

const {
  posToIndex,
  indexToPos,
  isValidPos,
  posEquals,
  BOARD_SIZE,
  TOTAL_CELLS,
  createInitialPieces,
  createInitialBoard,
} = Game;

type CellContent = Game.CellContent;
type MechaDuelState = Game.MechaDuelState;

// =============================================================================
// Position Helpers
// =============================================================================

describe('posToIndex', () => {
  it('converts (0,0) to index 0', () => {
    expect(posToIndex({ x: 0, y: 0 })).toBe(0);
  });

  it('converts (7,0) to index 7', () => {
    expect(posToIndex({ x: 7, y: 0 })).toBe(7);
  });

  it('converts (0,1) to index 8', () => {
    expect(posToIndex({ x: 0, y: 1 })).toBe(8);
  });

  it('converts (4,7) to index 60', () => {
    expect(posToIndex({ x: 4, y: 7 })).toBe(60);
  });

  it('converts (7,7) to index 63', () => {
    expect(posToIndex({ x: 7, y: 7 })).toBe(63);
  });
});

describe('indexToPos', () => {
  it('converts index 0 to (0,0)', () => {
    expect(indexToPos(0)).toEqual({ x: 0, y: 0 });
  });

  it('converts index 7 to (7,0)', () => {
    expect(indexToPos(7)).toEqual({ x: 7, y: 0 });
  });

  it('converts index 8 to (0,1)', () => {
    expect(indexToPos(8)).toEqual({ x: 0, y: 1 });
  });

  it('converts index 60 to (4,7)', () => {
    expect(indexToPos(60)).toEqual({ x: 4, y: 7 });
  });

  it('converts index 63 to (7,7)', () => {
    expect(indexToPos(63)).toEqual({ x: 7, y: 7 });
  });
});

describe('isValidPos', () => {
  it('returns true for (0,0)', () => {
    expect(isValidPos({ x: 0, y: 0 })).toBe(true);
  });

  it('returns true for (7,7)', () => {
    expect(isValidPos({ x: 7, y: 7 })).toBe(true);
  });

  it('returns true for center position (4,4)', () => {
    expect(isValidPos({ x: 4, y: 4 })).toBe(true);
  });

  it('returns false for negative x', () => {
    expect(isValidPos({ x: -1, y: 0 })).toBe(false);
  });

  it('returns false for negative y', () => {
    expect(isValidPos({ x: 0, y: -1 })).toBe(false);
  });

  it('returns false for x >= BOARD_SIZE', () => {
    expect(isValidPos({ x: 8, y: 0 })).toBe(false);
  });

  it('returns false for y >= BOARD_SIZE', () => {
    expect(isValidPos({ x: 0, y: 8 })).toBe(false);
  });
});

describe('posEquals', () => {
  it('returns true for identical positions', () => {
    expect(posEquals({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(true);
  });

  it('returns false for different x', () => {
    expect(posEquals({ x: 3, y: 4 }, { x: 4, y: 4 })).toBe(false);
  });

  it('returns false for different y', () => {
    expect(posEquals({ x: 3, y: 4 }, { x: 3, y: 5 })).toBe(false);
  });
});

// =============================================================================
// Board Setup
// =============================================================================

describe('createInitialBoard', () => {
  it('creates a board with correct size', () => {
    const { cells } = createInitialBoard();
    expect(cells.length).toBe(TOTAL_CELLS);
  });

  it('places player 0 king at (4,0)', () => {
    const { cells, kings } = createInitialBoard();
    expect(kings['0']).toEqual({ x: 4, y: 0 });
    expect(cells[posToIndex({ x: 4, y: 0 })]).toBe('king0');
  });

  it('places player 1 king at (4,7)', () => {
    const { cells, kings } = createInitialBoard();
    expect(kings['1']).toEqual({ x: 4, y: 7 });
    expect(cells[posToIndex({ x: 4, y: 7 })]).toBe('king1');
  });

  it('places pawns at scenario positions', () => {
    const { cells } = createInitialBoard('simple');
    // Simple scenario has pawns at (2,2), (5,2), (2,5), (5,5)
    expect(cells[posToIndex({ x: 2, y: 2 })]).toBe('pawn');
    expect(cells[posToIndex({ x: 5, y: 2 })]).toBe('pawn');
    expect(cells[posToIndex({ x: 2, y: 5 })]).toBe('pawn');
    expect(cells[posToIndex({ x: 5, y: 5 })]).toBe('pawn');
  });
});

describe('createInitialPieces', () => {
  it('creates 7 pieces', () => {
    const pieces = createInitialPieces();
    expect(pieces.length).toBe(7);
  });

  it('creates 2 bishops', () => {
    const pieces = createInitialPieces();
    const bishops = pieces.filter((p) => p.type === 'bishop');
    expect(bishops.length).toBe(2);
  });

  it('creates 2 rooks', () => {
    const pieces = createInitialPieces();
    const rooks = pieces.filter((p) => p.type === 'rook');
    expect(rooks.length).toBe(2);
  });

  it('creates 2 knights', () => {
    const pieces = createInitialPieces();
    const knights = pieces.filter((p) => p.type === 'knight');
    expect(knights.length).toBe(2);
  });

  it('creates 1 queen', () => {
    const pieces = createInitialPieces();
    const queens = pieces.filter((p) => p.type === 'queen');
    expect(queens.length).toBe(1);
  });

  it('all pieces start in ready state', () => {
    const pieces = createInitialPieces();
    expect(pieces.every((p) => p.state === 'ready')).toBe(true);
  });

  it('all pieces have unique ids', () => {
    const pieces = createInitialPieces();
    const ids = pieces.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(pieces.length);
  });
});

// =============================================================================
// Commit Validation Tests
// These tests will fail until the functions are implemented in Phase 3
// =============================================================================

describe('isValidBishopTarget', () => {
  it('allows diagonal squares from King', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidBishopTarget(kingPos, { x: 5, y: 5 })).toBe(true);
    expect(Game.isValidBishopTarget(kingPos, { x: 3, y: 3 })).toBe(true);
    expect(Game.isValidBishopTarget(kingPos, { x: 6, y: 2 })).toBe(true);
    expect(Game.isValidBishopTarget(kingPos, { x: 2, y: 6 })).toBe(true);
  });

  it('rejects non-diagonal squares', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidBishopTarget(kingPos, { x: 4, y: 5 })).toBe(false);
    expect(Game.isValidBishopTarget(kingPos, { x: 5, y: 4 })).toBe(false);
    expect(Game.isValidBishopTarget(kingPos, { x: 5, y: 6 })).toBe(false);
  });

  it('rejects same position as King', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidBishopTarget(kingPos, { x: 4, y: 4 })).toBe(false);
  });
});

describe('isValidRookTarget', () => {
  it('allows orthogonal squares from King', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidRookTarget(kingPos, { x: 4, y: 7 })).toBe(true);
    expect(Game.isValidRookTarget(kingPos, { x: 4, y: 0 })).toBe(true);
    expect(Game.isValidRookTarget(kingPos, { x: 7, y: 4 })).toBe(true);
    expect(Game.isValidRookTarget(kingPos, { x: 0, y: 4 })).toBe(true);
  });

  it('rejects diagonal squares', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidRookTarget(kingPos, { x: 5, y: 5 })).toBe(false);
    expect(Game.isValidRookTarget(kingPos, { x: 3, y: 3 })).toBe(false);
  });

  it('rejects same position as King', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidRookTarget(kingPos, { x: 4, y: 4 })).toBe(false);
  });
});

describe('isValidKnightTarget', () => {
  it('allows L-shaped squares from King', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidKnightTarget(kingPos, { x: 5, y: 6 })).toBe(true);
    expect(Game.isValidKnightTarget(kingPos, { x: 6, y: 5 })).toBe(true);
    expect(Game.isValidKnightTarget(kingPos, { x: 6, y: 3 })).toBe(true);
    expect(Game.isValidKnightTarget(kingPos, { x: 5, y: 2 })).toBe(true);
    expect(Game.isValidKnightTarget(kingPos, { x: 3, y: 2 })).toBe(true);
    expect(Game.isValidKnightTarget(kingPos, { x: 2, y: 3 })).toBe(true);
    expect(Game.isValidKnightTarget(kingPos, { x: 2, y: 5 })).toBe(true);
    expect(Game.isValidKnightTarget(kingPos, { x: 3, y: 6 })).toBe(true);
  });

  it('rejects non-L-shaped squares', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidKnightTarget(kingPos, { x: 5, y: 5 })).toBe(false);
    expect(Game.isValidKnightTarget(kingPos, { x: 4, y: 5 })).toBe(false);
    expect(Game.isValidKnightTarget(kingPos, { x: 6, y: 6 })).toBe(false);
  });

  it('rejects same position as King', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidKnightTarget(kingPos, { x: 4, y: 4 })).toBe(false);
  });
});

describe('isValidQueenTarget', () => {
  it('allows diagonal squares from King', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidQueenTarget(kingPos, { x: 5, y: 5 })).toBe(true);
    expect(Game.isValidQueenTarget(kingPos, { x: 7, y: 1 })).toBe(true);
  });

  it('allows orthogonal squares from King', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidQueenTarget(kingPos, { x: 4, y: 7 })).toBe(true);
    expect(Game.isValidQueenTarget(kingPos, { x: 0, y: 4 })).toBe(true);
  });

  it('rejects non-queen-move squares', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidQueenTarget(kingPos, { x: 5, y: 6 })).toBe(false);
    expect(Game.isValidQueenTarget(kingPos, { x: 6, y: 7 })).toBe(false);
  });

  it('rejects same position as King', () => {
    const kingPos = { x: 4, y: 4 };
    expect(Game.isValidQueenTarget(kingPos, { x: 4, y: 4 })).toBe(false);
  });
});

// =============================================================================
// Strike Resolution Tests
// =============================================================================

describe('raycast', () => {
  function createEmptyBoard(): CellContent[] {
    return Array(TOTAL_CELLS).fill(null);
  }

  it('returns null when no obstacle in path', () => {
    const cells = createEmptyBoard();
    const from = { x: 4, y: 0 };
    const toward = { x: 4, y: 7 };
    expect(Game.raycast(from, toward, cells)).toBe(null);
  });

  it('finds first pawn in path', () => {
    const cells = createEmptyBoard();
    cells[posToIndex({ x: 4, y: 3 })] = 'pawn';
    cells[posToIndex({ x: 4, y: 5 })] = 'pawn';
    const from = { x: 4, y: 0 };
    const toward = { x: 4, y: 7 };
    const result = Game.raycast(from, toward, cells);
    expect(result).toEqual({ x: 4, y: 3 });
  });

  it('finds opponent king in path', () => {
    const cells = createEmptyBoard();
    cells[posToIndex({ x: 4, y: 5 })] = 'king1';
    const from = { x: 4, y: 0 };
    const toward = { x: 4, y: 7 };
    const result = Game.raycast(from, toward, cells);
    expect(result).toEqual({ x: 4, y: 5 });
  });

  it('works for diagonal directions', () => {
    const cells = createEmptyBoard();
    cells[posToIndex({ x: 6, y: 6 })] = 'pawn';
    const from = { x: 4, y: 4 };
    const toward = { x: 7, y: 7 };
    const result = Game.raycast(from, toward, cells);
    expect(result).toEqual({ x: 6, y: 6 });
  });

  it('does not include starting position', () => {
    const cells = createEmptyBoard();
    cells[posToIndex({ x: 4, y: 4 })] = 'king0';
    const from = { x: 4, y: 4 };
    const toward = { x: 4, y: 7 };
    const result = Game.raycast(from, toward, cells);
    expect(result).toBe(null);
  });
});

describe('resolveStrike', () => {
  function createTestState(): MechaDuelState {
    const { cells, kings } = createInitialBoard();
    return {
      cells,
      kings,
      pieces: {
        '0': createInitialPieces(),
        '1': createInitialPieces(),
      },
      committedPieces: [],
    };
  }

  it('destroys first pawn in strike path', () => {
    const state = createTestState();
    const pawnPos = { x: 4, y: 3 };
    state.cells[posToIndex(pawnPos)] = 'pawn';

    const kingPos = state.kings['0']!;
    const targetPos = { x: 4, y: 7 };
    const result = Game.resolveStrike(state, kingPos, targetPos);

    expect(result.hit).toEqual(pawnPos);
    expect(result.destroyed).toBe('pawn');
  });

  it('destroys opponent king in strike path', () => {
    const state = createTestState();
    const kingPos = state.kings['0']!;
    const targetPos = { x: 4, y: 7 };

    const result = Game.resolveStrike(state, kingPos, targetPos);

    expect(result.hit).toEqual({ x: 4, y: 7 });
    expect(result.destroyed).toBe('king1');
  });

  it('returns null hit when no target in path', () => {
    const state = createTestState();
    const kingPos = state.kings['0']!;
    const targetPos = { x: 0, y: 0 };

    const result = Game.resolveStrike(state, kingPos, targetPos);

    expect(result.hit).toBe(null);
    expect(result.destroyed).toBe(null);
  });
});

// =============================================================================
// Knight Resolution Tests
// =============================================================================

describe('isValidKnightJump', () => {
  it('returns true for valid L-shaped jump', () => {
    expect(Game.isValidKnightJump({ x: 4, y: 4 }, { x: 5, y: 6 })).toBe(true);
    expect(Game.isValidKnightJump({ x: 4, y: 4 }, { x: 6, y: 5 })).toBe(true);
  });

  it('returns false for non-L-shaped positions', () => {
    expect(Game.isValidKnightJump({ x: 4, y: 4 }, { x: 5, y: 5 })).toBe(false);
    expect(Game.isValidKnightJump({ x: 4, y: 4 }, { x: 4, y: 6 })).toBe(false);
  });

  it('returns false for same position', () => {
    expect(Game.isValidKnightJump({ x: 4, y: 4 }, { x: 4, y: 4 })).toBe(false);
  });
});

describe('resolveKnight', () => {
  function createTestState(): MechaDuelState {
    const { cells, kings } = createInitialBoard();
    return {
      cells,
      kings,
      pieces: {
        '0': createInitialPieces(),
        '1': createInitialPieces(),
      },
      committedPieces: [],
    };
  }

  it('moves king to target square', () => {
    const state = createTestState();
    const targetPos = { x: 5, y: 2 };

    const result = Game.resolveKnight(state, '0', targetPos);

    expect(result.success).toBe(true);
    expect(result.newKingPos).toEqual(targetPos);
  });

  it('fails if target is not valid knight jump', () => {
    const state = createTestState();
    const targetPos = { x: 5, y: 5 };

    const result = Game.resolveKnight(state, '0', targetPos);

    expect(result.success).toBe(false);
  });

  it('destroys pawn at landing square', () => {
    const state = createTestState();
    const targetPos = { x: 5, y: 2 };
    state.cells[posToIndex(targetPos)] = 'pawn';

    const result = Game.resolveKnight(state, '0', targetPos);

    expect(result.success).toBe(true);
    expect(result.destroyed).toBe('pawn');
  });

  it('destroys opponent king at landing square', () => {
    const state = createTestState();
    state.kings['1'] = { x: 5, y: 2 };
    state.cells[posToIndex({ x: 4, y: 7 })] = null;
    state.cells[posToIndex({ x: 5, y: 2 })] = 'king1';

    const result = Game.resolveKnight(state, '0', { x: 5, y: 2 });

    expect(result.success).toBe(true);
    expect(result.destroyed).toBe('king1');
  });
});

// =============================================================================
// KingStep Resolution Tests
// =============================================================================

describe('isValidKingStep', () => {
  it('allows orthogonal moves', () => {
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 4, y: 5 })).toBe(true);
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 5, y: 4 })).toBe(true);
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 4, y: 3 })).toBe(true);
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 3, y: 4 })).toBe(true);
  });

  it('allows diagonal moves', () => {
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 5, y: 5 })).toBe(true);
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 3, y: 3 })).toBe(true);
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 5, y: 3 })).toBe(true);
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 3, y: 5 })).toBe(true);
  });

  it('rejects moves more than 1 square', () => {
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 4, y: 6 })).toBe(false);
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 6, y: 6 })).toBe(false);
  });

  it('rejects same position', () => {
    expect(Game.isValidKingStep({ x: 4, y: 4 }, { x: 4, y: 4 })).toBe(false);
  });

  it('rejects moves off board', () => {
    expect(Game.isValidKingStep({ x: 0, y: 0 }, { x: -1, y: 0 })).toBe(false);
    expect(Game.isValidKingStep({ x: 7, y: 7 }, { x: 8, y: 7 })).toBe(false);
  });
});

describe('resolveKingStep', () => {
  function createTestState(): MechaDuelState {
    const { cells, kings } = createInitialBoard();
    return {
      cells,
      kings,
      pieces: {
        '0': createInitialPieces(),
        '1': createInitialPieces(),
      },
      committedPieces: [],
    };
  }

  it('moves king one square', () => {
    const state = createTestState();
    const targetPos = { x: 4, y: 1 };

    const result = Game.resolveKingStep(state, '0', targetPos);

    expect(result.success).toBe(true);
    expect(result.newKingPos).toEqual(targetPos);
  });

  it('destroys pawn when entering pawn square', () => {
    const state = createTestState();
    const targetPos = { x: 4, y: 1 };
    state.cells[posToIndex(targetPos)] = 'pawn';

    const result = Game.resolveKingStep(state, '0', targetPos);

    expect(result.success).toBe(true);
    expect(result.destroyed).toBe('pawn');
  });

  it('destroys opponent king when stepping on', () => {
    const state = createTestState();
    state.kings['1'] = { x: 4, y: 1 };
    state.cells[posToIndex({ x: 4, y: 7 })] = null;
    state.cells[posToIndex({ x: 4, y: 1 })] = 'king1';

    const result = Game.resolveKingStep(state, '0', { x: 4, y: 1 });

    expect(result.success).toBe(true);
    expect(result.destroyed).toBe('king1');
  });

  it('fails for invalid step distance', () => {
    const state = createTestState();
    const targetPos = { x: 4, y: 2 };

    const result = Game.resolveKingStep(state, '0', targetPos);

    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Piece State Transition Tests
// =============================================================================

describe('piece state transitions', () => {
  it('transitions Ready to Committed', () => {
    const piece = { type: 'bishop' as const, state: 'ready' as const, id: 0 };
    const newState = Game.transitionPieceState(piece, 'committed');
    expect(newState).toBe('committed');
  });

  it('transitions Committed to Exhausted', () => {
    const piece = { type: 'bishop' as const, state: 'committed' as const, id: 0 };
    const newState = Game.transitionPieceState(piece, 'exhausted');
    expect(newState).toBe('exhausted');
  });

  describe('refreshPieces (pass action)', () => {
    it('changes Committed pieces to Exhausted', () => {
      const pieces = [
        { type: 'bishop' as const, state: 'committed' as const, id: 0 },
        { type: 'rook' as const, state: 'ready' as const, id: 1 },
      ];
      const refreshed = Game.refreshPieces(pieces);
      expect(refreshed[0].state).toBe('exhausted');
    });

    it('changes Exhausted pieces to Ready', () => {
      const pieces = [
        { type: 'bishop' as const, state: 'exhausted' as const, id: 0 },
        { type: 'rook' as const, state: 'ready' as const, id: 1 },
      ];
      const refreshed = Game.refreshPieces(pieces);
      expect(refreshed[0].state).toBe('ready');
    });

    it('keeps Ready pieces as Ready', () => {
      const pieces = [{ type: 'bishop' as const, state: 'ready' as const, id: 0 }];
      const refreshed = Game.refreshPieces(pieces);
      expect(refreshed[0].state).toBe('ready');
    });
  });
});

// =============================================================================
// Win Condition Tests
// =============================================================================

describe('checkWinCondition', () => {
  function createTestState(): MechaDuelState {
    const { cells, kings } = createInitialBoard();
    return {
      cells,
      kings,
      pieces: {
        '0': createInitialPieces(),
        '1': createInitialPieces(),
      },
      committedPieces: [],
    };
  }

  it('returns null when both kings alive', () => {
    const state = createTestState();
    expect(Game.checkWinCondition(state)).toBe(null);
  });

  it('returns player 1 as winner when player 0 king destroyed', () => {
    const state = createTestState();
    state.kings['0'] = null;
    expect(Game.checkWinCondition(state)).toEqual({ winner: '1' });
  });

  it('returns player 0 as winner when player 1 king destroyed', () => {
    const state = createTestState();
    state.kings['1'] = null;
    expect(Game.checkWinCondition(state)).toEqual({ winner: '0' });
  });
});
