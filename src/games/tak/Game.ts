import type { Game } from 'boardgame.io';

// Piece types
export type PieceType = 'flat' | 'standing' | 'capstone';

export interface Piece {
  owner: string; // '0' or '1'
  type: PieceType;
}

// A cell can have a stack of pieces (bottom to top)
export type Stack = Piece[];

export interface TakState {
  board: Stack[][]; // 5x5 grid of stacks
  pieces: {
    '0': { flats: number; capstones: number };
    '1': { flats: number; capstones: number };
  };
  turnNumber: number; // Track turn number for opening rule
}

const BOARD_SIZE = 5;
const INITIAL_FLATS = 21;
const INITIAL_CAPSTONES = 1;
const CARRY_LIMIT = BOARD_SIZE;

// Direction vectors for orthogonal movement
const DIRECTIONS: { [key: string]: [number, number] } = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

export function createEmptyBoard(): Stack[][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() =>
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => [])
    );
}

export function getTopPiece(stack: Stack): Piece | undefined {
  return stack.length > 0 ? stack[stack.length - 1] : undefined;
}

export function stackOwner(stack: Stack): string | undefined {
  const top = getTopPiece(stack);
  return top?.owner;
}

export function canPlaceOn(stack: Stack): boolean {
  if (stack.length === 0) return true;
  const top = getTopPiece(stack);
  // Can only place on empty or flat stones (not standing or capstone)
  return top?.type === 'flat';
}

export function canMoveOnto(stack: Stack, movingPiece: Piece): boolean {
  if (stack.length === 0) return true;
  const top = getTopPiece(stack);
  if (!top) return true;

  // Capstone can flatten a standing stone when moving alone
  if (movingPiece.type === 'capstone' && top.type === 'standing') {
    return true; // Will be flattened
  }

  // Can move onto flat stones only
  return top.type === 'flat';
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

// Check if a player has a road from one edge to the opposite
export function hasRoad(board: Stack[][], player: string): boolean {
  // Check for top-to-bottom road
  const topBottomRoad = checkRoadTopBottom(board, player);
  if (topBottomRoad) return true;

  // Check for left-to-right road
  const leftRightRoad = checkRoadLeftRight(board, player);
  return leftRightRoad;
}

function checkRoadTopBottom(board: Stack[][], player: string): boolean {
  // Start from top row, try to reach bottom row
  const visited = new Set<string>();

  function dfs(row: number, col: number): boolean {
    if (row === BOARD_SIZE - 1) return true; // Reached bottom

    const key = `${row},${col}`;
    if (visited.has(key)) return false;
    visited.add(key);

    // Check all orthogonal neighbors
    for (const [dr, dc] of Object.values(DIRECTIONS)) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (isValidPosition(newRow, newCol)) {
        const stack = board[newRow][newCol];
        const top = getTopPiece(stack);
        if (top && top.owner === player && (top.type === 'flat' || top.type === 'capstone')) {
          if (dfs(newRow, newCol)) return true;
        }
      }
    }

    return false;
  }

  // Try starting from each cell in top row
  for (let col = 0; col < BOARD_SIZE; col++) {
    const stack = board[0][col];
    const top = getTopPiece(stack);
    if (top && top.owner === player && (top.type === 'flat' || top.type === 'capstone')) {
      if (dfs(0, col)) return true;
    }
  }

  return false;
}

function checkRoadLeftRight(board: Stack[][], player: string): boolean {
  // Start from left column, try to reach right column
  const visited = new Set<string>();

  function dfs(row: number, col: number): boolean {
    if (col === BOARD_SIZE - 1) return true; // Reached right edge

    const key = `${row},${col}`;
    if (visited.has(key)) return false;
    visited.add(key);

    // Check all orthogonal neighbors
    for (const [dr, dc] of Object.values(DIRECTIONS)) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (isValidPosition(newRow, newCol)) {
        const stack = board[newRow][newCol];
        const top = getTopPiece(stack);
        if (top && top.owner === player && (top.type === 'flat' || top.type === 'capstone')) {
          if (dfs(newRow, newCol)) return true;
        }
      }
    }

    return false;
  }

  // Try starting from each cell in left column
  for (let row = 0; row < BOARD_SIZE; row++) {
    const stack = board[row][0];
    const top = getTopPiece(stack);
    if (top && top.owner === player && (top.type === 'flat' || top.type === 'capstone')) {
      if (dfs(row, 0)) return true;
    }
  }

  return false;
}

// Count visible flat stones for a player
export function countFlats(board: Stack[][], player: string): number {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const top = getTopPiece(board[row][col]);
      if (top && top.owner === player && top.type === 'flat') {
        count++;
      }
    }
  }
  return count;
}

// Check if a player has any pieces left to place
export function hasPiecesToPlace(pieces: TakState['pieces'], player: string): boolean {
  const p = pieces[player as '0' | '1'];
  return p.flats > 0 || p.capstones > 0;
}

// Check if the board is full
export function isBoardFull(board: Stack[][]): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].length === 0) return false;
    }
  }
  return true;
}

// Get the opponent player ID
function opponent(player: string): string {
  return player === '0' ? '1' : '0';
}

export const Tak: Game<TakState> = {
  name: 'tak',

  setup: () => ({
    board: createEmptyBoard(),
    pieces: {
      '0': { flats: INITIAL_FLATS, capstones: INITIAL_CAPSTONES },
      '1': { flats: INITIAL_FLATS, capstones: INITIAL_CAPSTONES },
    },
    turnNumber: 0,
  }),

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },

  moves: {
    // Place a piece on an empty cell
    place: ({ G, playerID }, row: number, col: number, pieceType: PieceType) => {
      if (!playerID) return;
      if (!isValidPosition(row, col)) return;

      const stack = G.board[row][col];
      if (stack.length > 0) return; // Must be empty

      // First two moves: place opponent's flat stone
      if (G.turnNumber < 2) {
        const opponentId = opponent(playerID);
        if (G.pieces[opponentId as '0' | '1'].flats <= 0) return;
        if (pieceType !== 'flat') return; // Must be flat on opening

        G.pieces[opponentId as '0' | '1'].flats--;
        stack.push({ owner: opponentId, type: 'flat' });
        G.turnNumber++;
        return;
      }

      // Normal placement
      const pieces = G.pieces[playerID as '0' | '1'];

      if (pieceType === 'capstone') {
        if (pieces.capstones <= 0) return;
        pieces.capstones--;
      } else {
        // flat or standing
        if (pieces.flats <= 0) return;
        pieces.flats--;
      }

      stack.push({ owner: playerID, type: pieceType });
      G.turnNumber++;
    },

    // Move a stack
    move: (
      { G, playerID },
      fromRow: number,
      fromCol: number,
      direction: string,
      drops: number[]
    ) => {
      if (!playerID) return;
      if (G.turnNumber < 2) return; // Can't move on opening turns

      if (!isValidPosition(fromRow, fromCol)) return;
      if (!DIRECTIONS[direction]) return;

      const stack = G.board[fromRow][fromCol];
      if (stack.length === 0) return;

      // Must control the stack (your piece on top)
      const top = getTopPiece(stack);
      if (!top || top.owner !== playerID) return;

      // Calculate total pieces to pick up
      const totalPicked = drops.reduce((a, b) => a + b, 0);
      if (totalPicked < 1 || totalPicked > Math.min(CARRY_LIMIT, stack.length)) return;

      // Must drop at least 1 on each square
      if (drops.some((d) => d < 1)) return;

      const [dr, dc] = DIRECTIONS[direction];

      // Validate the entire move path first
      let checkRow = fromRow;
      let checkCol = fromCol;
      for (let i = 0; i < drops.length; i++) {
        checkRow += dr;
        checkCol += dc;

        if (!isValidPosition(checkRow, checkCol)) return;

        const targetStack = G.board[checkRow][checkCol];
        // Check what piece is being dropped on this square
        // The last drop might be just the capstone
        const isLastDrop = i === drops.length - 1;
        const dropsRemaining = drops.slice(i).reduce((a, b) => a + b, 0);
        const movingPieceIsCapstone = top.type === 'capstone' && dropsRemaining === 1;

        // For intermediate drops, check if we can stack
        if (!canMoveOnto(targetStack, movingPieceIsCapstone ? top : { owner: playerID, type: 'flat' })) {
          // Special case: capstone can flatten wall on last square
          const targetTop = getTopPiece(targetStack);
          if (isLastDrop && movingPieceIsCapstone && targetTop?.type === 'standing') {
            // This is allowed - capstone will flatten it
          } else {
            return; // Invalid move
          }
        }
      }

      // Execute the move
      const pickedPieces = stack.splice(stack.length - totalPicked, totalPicked);
      let currentRow = fromRow;
      let currentCol = fromCol;
      let pieceIndex = 0;

      for (const dropCount of drops) {
        currentRow += dr;
        currentCol += dc;

        const targetStack = G.board[currentRow][currentCol];

        // If dropping capstone on a wall, flatten it
        const targetTop = getTopPiece(targetStack);
        if (targetTop?.type === 'standing') {
          targetTop.type = 'flat';
        }

        // Drop pieces
        for (let i = 0; i < dropCount; i++) {
          targetStack.push(pickedPieces[pieceIndex]);
          pieceIndex++;
        }
      }

      G.turnNumber++;
    },
  },

  endIf: ({ G, ctx }) => {
    // Check for road win (current player who just moved)
    const justPlayed = ctx.currentPlayer === '0' ? '1' : '0';
    if (hasRoad(G.board, justPlayed)) {
      return { winner: justPlayed };
    }

    // Check if opponent also has a road (created by our move)
    if (hasRoad(G.board, ctx.currentPlayer)) {
      return { winner: ctx.currentPlayer };
    }

    // Check for flat win condition
    const player0HasPieces = hasPiecesToPlace(G.pieces, '0');
    const player1HasPieces = hasPiecesToPlace(G.pieces, '1');
    const boardFull = isBoardFull(G.board);

    if (boardFull || !player0HasPieces || !player1HasPieces) {
      const flats0 = countFlats(G.board, '0');
      const flats1 = countFlats(G.board, '1');

      if (flats0 > flats1) return { winner: '0' };
      if (flats1 > flats0) return { winner: '1' };
      return { draw: true };
    }

    return undefined;
  },

  ai: {
    enumerate: (G: TakState, ctx?: { currentPlayer?: string }, playerID?: string) => {
      const moves: Array<{ move: string; args: unknown[] }> = [];
      const player = playerID || ctx?.currentPlayer || '0';

      // Opening moves: place opponent's flat
      if (G.turnNumber < 2) {
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            if (G.board[row][col].length === 0) {
              moves.push({ move: 'place', args: [row, col, 'flat'] });
            }
          }
        }
        return moves;
      }

      const pieces = G.pieces[player as '0' | '1'];

      // Place moves on empty cells
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (G.board[row][col].length === 0) {
            if (pieces.flats > 0) {
              moves.push({ move: 'place', args: [row, col, 'flat'] });
              moves.push({ move: 'place', args: [row, col, 'standing'] });
            }
            if (pieces.capstones > 0) {
              moves.push({ move: 'place', args: [row, col, 'capstone'] });
            }
          }
        }
      }

      // Move moves: find all stacks controlled by player
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const stack = G.board[row][col];
          if (stack.length === 0) continue;

          const top = getTopPiece(stack);
          if (!top || top.owner !== player) continue;

          // Try all directions
          for (const direction of Object.keys(DIRECTIONS)) {
            const [dr, dc] = DIRECTIONS[direction];

            // Calculate max distance in this direction
            let maxDist = 0;
            let checkRow = row + dr;
            let checkCol = col + dc;

            while (isValidPosition(checkRow, checkCol)) {
              const targetStack = G.board[checkRow][checkCol];
              const targetTop = getTopPiece(targetStack);

              if (targetTop) {
                if (targetTop.type === 'capstone') break; // Can't move onto capstone
                if (targetTop.type === 'standing') {
                  // Only capstone can flatten, and only as last piece
                  if (top.type === 'capstone') {
                    maxDist++; // Can flatten as last move
                  }
                  break;
                }
              }

              maxDist++;
              checkRow += dr;
              checkCol += dc;
            }

            if (maxDist === 0) continue;

            // Generate all valid drop patterns
            const maxPick = Math.min(CARRY_LIMIT, stack.length);
            const dropPatterns = generateDropPatterns(maxPick, maxDist);

            for (const drops of dropPatterns) {
              // Validate this specific pattern
              if (isValidDropPattern(G.board, row, col, direction, drops, top.type)) {
                moves.push({ move: 'move', args: [row, col, direction, drops] });
              }
            }
          }
        }
      }

      return moves;
    },
  },
};

// Generate all valid drop patterns for picking up 1..maxPick pieces and dropping across 1..maxDist squares
function generateDropPatterns(maxPick: number, maxDist: number): number[][] {
  const patterns: number[][] = [];

  for (let pick = 1; pick <= maxPick; pick++) {
    // Generate all ways to partition 'pick' pieces into 1..min(pick, maxDist) squares
    generatePartitions(pick, Math.min(pick, maxDist), [], patterns);
  }

  return patterns;
}

// Generate all partitions of 'total' into 'maxParts' parts, each >= 1
function generatePartitions(total: number, maxParts: number, current: number[], result: number[][]): void {
  if (total === 0) {
    if (current.length > 0) {
      result.push([...current]);
    }
    return;
  }

  if (maxParts === 0) return;

  const minDrop = 1;
  const maxDrop = total - (maxParts - 1); // Leave at least 1 for remaining parts

  for (let drop = minDrop; drop <= maxDrop; drop++) {
    current.push(drop);
    generatePartitions(total - drop, maxParts - 1, current, result);
    current.pop();
  }
}

// Validate a specific drop pattern
function isValidDropPattern(
  board: Stack[][],
  fromRow: number,
  fromCol: number,
  direction: string,
  drops: number[],
  topPieceType: PieceType
): boolean {
  const [dr, dc] = DIRECTIONS[direction];
  let row = fromRow;
  let col = fromCol;
  const totalPicked = drops.reduce((a, b) => a + b, 0);
  let remaining = totalPicked;

  for (let i = 0; i < drops.length; i++) {
    row += dr;
    col += dc;

    if (!isValidPosition(row, col)) return false;

    const targetStack = board[row][col];
    const targetTop = getTopPiece(targetStack);

    remaining -= drops[i];
    const isCapstoneOnTop = topPieceType === 'capstone' && remaining === 0;

    if (targetTop) {
      if (targetTop.type === 'capstone') return false;
      if (targetTop.type === 'standing') {
        // Only capstone can flatten, and only when it's the last piece dropped
        if (!isCapstoneOnTop) return false;
      }
    }
  }

  return true;
}
