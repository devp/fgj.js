import type { Game } from 'boardgame.io';

// ---------------------------------------------------------------------------
// Hex Demo Soccer Board
//
// A sandbox board for prototyping game concepts. There are no win conditions
// or turns to speak of - it is a scratch pad. You configure a symmetric hex
// board, then paint checkers and shade tile backgrounds freely.
// ---------------------------------------------------------------------------

export type Checker = 'clear' | 'red' | 'blue' | 'black';
export type Background = 'white' | 'gray';

// 'plus'  -> middle rows are X + 1 (they bulge out)
// 'minus' -> middle rows are X - 1 (they tuck in)
export type BoardMode = 'plus' | 'minus';

export interface Tile {
  checker: Checker;
  bg: Background;
}

export interface HexDemoState {
  baseSize: number; // X: number of tiles in the top / bottom rows
  rows: number; // N: number of rows (must be odd for symmetry)
  mode: BoardMode; // whether odd rows are X+1 or X-1
  tiles: Tile[][]; // tiles[y][i]
}

// Tap cycle order for a tile's checker.
export const CHECKER_CYCLE: Checker[] = ['clear', 'red', 'blue', 'black'];

export const DEFAULT_BASE_SIZE = 5;
export const DEFAULT_ROWS = 7;
export const DEFAULT_MODE: BoardMode = 'plus';

export function nextChecker(current: Checker): Checker {
  const idx = CHECKER_CYCLE.indexOf(current);
  return CHECKER_CYCLE[(idx + 1) % CHECKER_CYCLE.length];
}

export function nextBackground(current: Background): Background {
  return current === 'white' ? 'gray' : 'white';
}

/**
 * Size of each row for the given configuration.
 *
 * Even rows (0, 2, 4, ... including the top row 0 and, when N is odd, the
 * bottom row N-1) have `baseSize` tiles. Odd rows alternate to baseSize +/- 1
 * depending on the mode. Requiring N to be odd keeps the board vertically
 * symmetric: row y and row N-1-y always share the same parity, hence size.
 */
export function rowSizes(baseSize: number, rows: number, mode: BoardMode): number[] {
  const delta = mode === 'plus' ? 1 : -1;
  const sizes: number[] = [];
  for (let y = 0; y < rows; y++) {
    sizes.push(y % 2 === 0 ? baseSize : baseSize + delta);
  }
  return sizes;
}

/**
 * Validate a board configuration. Returns an error message for an invalid
 * config, or null when the config is valid. An even row count is rejected
 * because it would break top/bottom symmetry ("reject invalid Y").
 */
export function validateConfig(baseSize: number, rows: number, mode: BoardMode): string | null {
  if (!Number.isInteger(rows)) return 'Rows must be a whole number.';
  if (rows < 1) return 'Rows must be at least 1.';
  if (rows % 2 === 0) return 'Rows must be odd so the top and bottom rows match (reject invalid Y).';
  if (!Number.isInteger(baseSize)) return 'Base row size must be a whole number.';
  if (baseSize < 1) return 'Base row size must be at least 1.';
  const midSize = mode === 'plus' ? baseSize + 1 : baseSize - 1;
  if (midSize < 1) return 'With X-1 the middle rows would be empty; increase the base size.';
  return null;
}

/** Build a fresh, empty board (every tile clear + white). */
export function makeBoard(baseSize: number, rows: number, mode: BoardMode): HexDemoState {
  const sizes = rowSizes(baseSize, rows, mode);
  const tiles = sizes.map((count) =>
    Array.from({ length: count }, (): Tile => ({ checker: 'clear', bg: 'white' }))
  );
  return { baseSize, rows, mode, tiles };
}

// Shared move implementations. Referenced both at the top level and inside the
// `play` stage so that every player may edit the board at any time.
const moves = {
  cycleChecker: ({ G }: { G: HexDemoState }, y: number, i: number) => {
    const tile = G.tiles[y]?.[i];
    if (!tile) return;
    tile.checker = nextChecker(tile.checker);
  },
  toggleBackground: ({ G }: { G: HexDemoState }, y: number, i: number) => {
    const tile = G.tiles[y]?.[i];
    if (!tile) return;
    tile.bg = nextBackground(tile.bg);
  },
  resetBoard: ({ G }: { G: HexDemoState }, baseSize: number, rows: number, mode: BoardMode) => {
    if (validateConfig(baseSize, rows, mode)) return;
    const next = makeBoard(baseSize, rows, mode);
    G.baseSize = next.baseSize;
    G.rows = next.rows;
    G.mode = next.mode;
    G.tiles = next.tiles;
  },
};

export const HexDemo: Game<HexDemoState> = {
  name: 'hex-demo-soccer-board',
  setup: () => makeBoard(DEFAULT_BASE_SIZE, DEFAULT_ROWS, DEFAULT_MODE),
  moves,
  turn: {
    // Everyone is always active: this is a shared sandbox, not a turn game.
    activePlayers: { all: 'play' },
    stages: { play: { moves } },
  },
  // No AI for a sandbox, but provide a no-op enumerator so enabling the
  // app-level AI toggle can't crash the bot.
  ai: {
    enumerate: () => [],
  },
};
