import type { Game } from 'boardgame.io';
import { getScenario, defaultScenarioId } from './scenarios';

// =============================================================================
// Types
// =============================================================================

export interface Position {
  x: number;
  y: number;
}

export type PieceType = 'bishop' | 'rook' | 'knight' | 'queen';

export type PieceState = 'ready' | 'committed' | 'exhausted';

export interface Piece {
  type: PieceType;
  state: PieceState;
  id: number;
}

export interface CommittedPiece {
  pieceId: number;
  playerId: string;
  type: PieceType;
  target: Position;
}

export type CellContent = 'pawn' | 'king0' | 'king1' | null;

export interface MechaDuelState {
  cells: CellContent[];
  kings: {
    '0': Position | null;
    '1': Position | null;
  };
  pieces: {
    '0': Piece[];
    '1': Piece[];
  };
  committedPieces: CommittedPiece[];
}

// =============================================================================
// Constants
// =============================================================================

export const BOARD_SIZE = 8;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

export const DIRECTIONS = {
  orthogonal: [
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
  ],
  diagonal: [
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
  ],
  all: [
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
  ],
};

export const KNIGHT_JUMPS = [
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 2, y: -1 },
  { x: 1, y: -2 },
  { x: -1, y: -2 },
  { x: -2, y: -1 },
  { x: -2, y: 1 },
  { x: -1, y: 2 },
];

// =============================================================================
// Position Helpers
// =============================================================================

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

export function posEquals(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

// =============================================================================
// Piece Helpers
// =============================================================================

export function createInitialPieces(): Piece[] {
  return [
    { type: 'bishop', state: 'ready', id: 0 },
    { type: 'bishop', state: 'ready', id: 1 },
    { type: 'rook', state: 'ready', id: 2 },
    { type: 'rook', state: 'ready', id: 3 },
    { type: 'knight', state: 'ready', id: 4 },
    { type: 'knight', state: 'ready', id: 5 },
    { type: 'queen', state: 'ready', id: 6 },
  ];
}

// =============================================================================
// Board Setup
// =============================================================================

export function createInitialBoard(scenarioId: string = defaultScenarioId): {
  cells: CellContent[];
  kings: { '0': Position; '1': Position };
} {
  const scenario = getScenario(scenarioId);
  const cells: CellContent[] = Array(TOTAL_CELLS).fill(null);

  // Place pawns
  for (const pawnPos of scenario.pawns) {
    cells[posToIndex(pawnPos)] = 'pawn';
  }

  // Place kings on the cells
  cells[posToIndex(scenario.kingPositions['0'])] = 'king0';
  cells[posToIndex(scenario.kingPositions['1'])] = 'king1';

  return {
    cells,
    kings: {
      '0': { ...scenario.kingPositions['0'] },
      '1': { ...scenario.kingPositions['1'] },
    },
  };
}

// =============================================================================
// Game Definition (stub - to be implemented in later phases)
// =============================================================================

export const MechaDuel: Game<MechaDuelState> = {
  name: 'mecha-duel',

  setup: () => {
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
  },

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },

  moves: {
    // To be implemented in Phase 3
  },
};
