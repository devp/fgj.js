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
// Commit Validation
// =============================================================================

export function isValidBishopTarget(kingPos: Position, target: Position): boolean {
  if (posEquals(kingPos, target)) return false;
  const dx = Math.abs(target.x - kingPos.x);
  const dy = Math.abs(target.y - kingPos.y);
  return dx === dy && dx > 0;
}

export function isValidRookTarget(kingPos: Position, target: Position): boolean {
  if (posEquals(kingPos, target)) return false;
  return (kingPos.x === target.x || kingPos.y === target.y);
}

export function isValidKnightTarget(kingPos: Position, target: Position): boolean {
  if (posEquals(kingPos, target)) return false;
  const dx = Math.abs(target.x - kingPos.x);
  const dy = Math.abs(target.y - kingPos.y);
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
}

export function isValidQueenTarget(kingPos: Position, target: Position): boolean {
  return isValidBishopTarget(kingPos, target) || isValidRookTarget(kingPos, target);
}

export function isValidCommitTarget(
  pieceType: PieceType,
  kingPos: Position,
  target: Position
): boolean {
  switch (pieceType) {
    case 'bishop':
      return isValidBishopTarget(kingPos, target);
    case 'rook':
      return isValidRookTarget(kingPos, target);
    case 'knight':
      return isValidKnightTarget(kingPos, target);
    case 'queen':
      return isValidQueenTarget(kingPos, target);
  }
}

// =============================================================================
// Raycast & Strike Resolution
// =============================================================================

function getDirection(from: Position, toward: Position): Position | null {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;

  if (dx === 0 && dy === 0) return null;

  // Normalize to unit direction
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (dx === 0) {
    return { x: 0, y: dy > 0 ? 1 : -1 };
  }
  if (dy === 0) {
    return { x: dx > 0 ? 1 : -1, y: 0 };
  }
  if (absDx === absDy) {
    return { x: dx > 0 ? 1 : -1, y: dy > 0 ? 1 : -1 };
  }

  // Not a valid line direction
  return null;
}

export function raycast(
  from: Position,
  toward: Position,
  cells: CellContent[]
): Position | null {
  const dir = getDirection(from, toward);
  if (!dir) return null;

  let current = { x: from.x + dir.x, y: from.y + dir.y };

  while (isValidPos(current)) {
    const content = cells[posToIndex(current)];
    if (content !== null) {
      return current;
    }
    current = { x: current.x + dir.x, y: current.y + dir.y };
  }

  return null;
}

export interface StrikeResult {
  hit: Position | null;
  destroyed: CellContent;
}

export function resolveStrike(
  state: MechaDuelState,
  kingPos: Position,
  targetPos: Position
): StrikeResult {
  const hitPos = raycast(kingPos, targetPos, state.cells);
  if (!hitPos) {
    return { hit: null, destroyed: null };
  }

  const destroyed = state.cells[posToIndex(hitPos)];
  return { hit: hitPos, destroyed };
}

// =============================================================================
// Knight Resolution
// =============================================================================

export function isValidKnightJump(from: Position, to: Position): boolean {
  return isValidKnightTarget(from, to);
}

export interface KnightResult {
  success: boolean;
  newKingPos?: Position;
  destroyed?: CellContent;
}

export function resolveKnight(
  state: MechaDuelState,
  playerId: string,
  targetPos: Position
): KnightResult {
  const kingPos = state.kings[playerId as '0' | '1'];
  if (!kingPos) {
    return { success: false };
  }

  if (!isValidKnightJump(kingPos, targetPos)) {
    return { success: false };
  }

  const destroyed = state.cells[posToIndex(targetPos)];
  return {
    success: true,
    newKingPos: targetPos,
    destroyed: destroyed ?? undefined,
  };
}

// =============================================================================
// KingStep Resolution
// =============================================================================

export function isValidKingStep(from: Position, to: Position): boolean {
  if (!isValidPos(to)) return false;
  if (posEquals(from, to)) return false;

  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);

  return dx <= 1 && dy <= 1;
}

export interface KingStepResult {
  success: boolean;
  newKingPos?: Position;
  destroyed?: CellContent;
}

export function resolveKingStep(
  state: MechaDuelState,
  playerId: string,
  targetPos: Position
): KingStepResult {
  const kingPos = state.kings[playerId as '0' | '1'];
  if (!kingPos) {
    return { success: false };
  }

  if (!isValidKingStep(kingPos, targetPos)) {
    return { success: false };
  }

  const destroyed = state.cells[posToIndex(targetPos)];
  return {
    success: true,
    newKingPos: targetPos,
    destroyed: destroyed ?? undefined,
  };
}

// =============================================================================
// Piece State Transitions
// =============================================================================

export function transitionPieceState(
  piece: Piece,
  newState: PieceState
): PieceState {
  return newState;
}

export function refreshPieces(pieces: Piece[]): Piece[] {
  return pieces.map((piece) => {
    if (piece.state === 'committed') {
      return { ...piece, state: 'exhausted' as PieceState };
    }
    if (piece.state === 'exhausted') {
      return { ...piece, state: 'ready' as PieceState };
    }
    return piece;
  });
}

function exhaustCommittedPieces(pieces: Piece[]): Piece[] {
  return pieces.map((piece) => {
    if (piece.state === 'committed') {
      return { ...piece, state: 'exhausted' as PieceState };
    }
    return piece;
  });
}

// =============================================================================
// Win Conditions
// =============================================================================

export function checkWinCondition(
  state: MechaDuelState
): { winner: string } | null {
  if (state.kings['0'] === null) {
    return { winner: '1' };
  }
  if (state.kings['1'] === null) {
    return { winner: '0' };
  }
  return null;
}

// =============================================================================
// Game Definition
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
    commit: ({ G, playerID }, pieceId: number, target: Position) => {
      if (!playerID) return;
      const pid = playerID as '0' | '1';
      const kingPos = G.kings[pid];
      if (!kingPos) return;

      const piece = G.pieces[pid].find((p) => p.id === pieceId);
      if (!piece || piece.state !== 'ready') return;

      if (!isValidCommitTarget(piece.type, kingPos, target)) return;

      // Update piece state
      piece.state = 'committed';

      // Add to committed pieces
      G.committedPieces.push({
        pieceId,
        playerId: playerID,
        type: piece.type,
        target,
      });
    },

    execute: ({ G, playerID }, pieceIds: number[]) => {
      if (!playerID) return;
      if (pieceIds.length === 0) return;

      const pid = playerID as '0' | '1';
      const opponentId = pid === '0' ? '1' : '0';

      // Get all committed pieces for this player
      const playerCommitted = G.committedPieces.filter(
        (cp) => cp.playerId === playerID
      );

      // Validate all pieceIds are committed
      const toExecute = pieceIds
        .map((id) => playerCommitted.find((cp) => cp.pieceId === id))
        .filter((cp): cp is CommittedPiece => cp !== undefined);

      if (toExecute.length !== pieceIds.length) return;

      // Separate strikes and knights
      const strikes = toExecute.filter((cp) => cp.type !== 'knight');
      const knights = toExecute.filter((cp) => cp.type === 'knight');

      // Resolve all strikes first (simultaneously)
      for (const strike of strikes) {
        const kingPos = G.kings[pid];
        if (!kingPos) continue;

        const result = resolveStrike(G, kingPos, strike.target);
        if (result.hit) {
          // Destroy the target
          G.cells[posToIndex(result.hit)] = null;
          // Check if opponent king was destroyed
          if (result.destroyed === `king${opponentId}`) {
            G.kings[opponentId] = null;
          }
        }
      }

      // Resolve knights sequentially
      for (const knight of knights) {
        const kingPos = G.kings[pid];
        if (!kingPos) continue;

        const result = resolveKnight(G, playerID, knight.target);
        if (result.success && result.newKingPos) {
          // Clear old king position
          G.cells[posToIndex(kingPos)] = null;
          // Check if landing on opponent king
          if (result.destroyed === `king${opponentId}`) {
            G.kings[opponentId] = null;
          } else {
            // Clear any pawn at destination
            G.cells[posToIndex(result.newKingPos)] = null;
          }
          // Move king
          G.kings[pid] = result.newKingPos;
          G.cells[posToIndex(result.newKingPos)] = `king${pid}` as CellContent;
        }
      }

      // Mark executed pieces as exhausted
      for (const pieceId of pieceIds) {
        const piece = G.pieces[pid].find((p) => p.id === pieceId);
        if (piece) {
          piece.state = 'exhausted';
        }
      }

      // Mark remaining committed pieces as exhausted
      const executedIds = new Set(pieceIds);
      for (const cp of playerCommitted) {
        if (!executedIds.has(cp.pieceId)) {
          const piece = G.pieces[pid].find((p) => p.id === cp.pieceId);
          if (piece) {
            piece.state = 'exhausted';
          }
        }
      }

      // Remove all player's committed pieces
      G.committedPieces = G.committedPieces.filter(
        (cp) => cp.playerId !== playerID
      );
    },

    kingStep: ({ G, playerID }, target: Position) => {
      if (!playerID) return;
      const pid = playerID as '0' | '1';
      const opponentId = pid === '0' ? '1' : '0';
      const kingPos = G.kings[pid];
      if (!kingPos) return;

      const result = resolveKingStep(G, playerID, target);
      if (!result.success || !result.newKingPos) return;

      // Clear old king position
      G.cells[posToIndex(kingPos)] = null;

      // Check if stepping on opponent king
      if (result.destroyed === `king${opponentId}`) {
        G.kings[opponentId] = null;
      }
      // Clear any pawn at destination
      G.cells[posToIndex(result.newKingPos)] = null;

      // Move king
      G.kings[pid] = result.newKingPos;
      G.cells[posToIndex(result.newKingPos)] = `king${pid}` as CellContent;

      // All committed pieces become exhausted
      G.pieces[pid] = exhaustCommittedPieces(G.pieces[pid]);
      G.committedPieces = G.committedPieces.filter(
        (cp) => cp.playerId !== playerID
      );
    },

    pass: ({ G, playerID }) => {
      if (!playerID) return;
      const pid = playerID as '0' | '1';

      // Refresh pieces: committed -> exhausted, exhausted -> ready
      G.pieces[pid] = refreshPieces(G.pieces[pid]);

      // Remove all player's committed pieces from board
      G.committedPieces = G.committedPieces.filter(
        (cp) => cp.playerId !== playerID
      );
    },
  },

  endIf: ({ G }) => {
    return checkWinCondition(G);
  },
};
