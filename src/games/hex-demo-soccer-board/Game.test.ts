import { describe, it, expect } from 'vitest';
import {
  makeBoard,
  nextBackground,
  nextChecker,
  rowSizes,
  validateConfig,
  type BoardMode,
} from './Game';

describe('nextChecker', () => {
  it('cycles clear -> red -> blue -> black -> clear', () => {
    expect(nextChecker('clear')).toBe('red');
    expect(nextChecker('red')).toBe('blue');
    expect(nextChecker('blue')).toBe('black');
    expect(nextChecker('black')).toBe('clear');
  });
});

describe('nextBackground', () => {
  it('toggles between white and gray', () => {
    expect(nextBackground('white')).toBe('gray');
    expect(nextBackground('gray')).toBe('white');
  });
});

describe('rowSizes', () => {
  it('alternates X, X+1, X, ... in plus mode', () => {
    expect(rowSizes(5, 7, 'plus')).toEqual([5, 6, 5, 6, 5, 6, 5]);
  });

  it('alternates X, X-1, X, ... in minus mode', () => {
    expect(rowSizes(5, 7, 'minus')).toEqual([5, 4, 5, 4, 5, 4, 5]);
  });

  it('produces a vertically symmetric board for odd row counts', () => {
    for (const mode of ['plus', 'minus'] as BoardMode[]) {
      const sizes = rowSizes(4, 5, mode);
      const reversed = [...sizes].reverse();
      expect(sizes).toEqual(reversed);
    }
  });

  it('keeps top and bottom rows equal to the base size', () => {
    const sizes = rowSizes(3, 9, 'plus');
    expect(sizes[0]).toBe(3);
    expect(sizes[sizes.length - 1]).toBe(3);
  });
});

describe('validateConfig', () => {
  it('accepts a valid odd-row configuration', () => {
    expect(validateConfig(5, 7, 'plus')).toBeNull();
    expect(validateConfig(2, 1, 'plus')).toBeNull();
  });

  it('rejects an even row count (breaks symmetry)', () => {
    expect(validateConfig(5, 6, 'plus')).not.toBeNull();
  });

  it('rejects non-positive or non-integer values', () => {
    expect(validateConfig(0, 5, 'plus')).not.toBeNull();
    expect(validateConfig(5, 0, 'plus')).not.toBeNull();
    expect(validateConfig(2.5, 5, 'plus')).not.toBeNull();
    expect(validateConfig(5, 5.5, 'plus')).not.toBeNull();
  });

  it('rejects minus mode that would empty the middle rows', () => {
    expect(validateConfig(1, 5, 'minus')).not.toBeNull();
    expect(validateConfig(2, 5, 'minus')).toBeNull();
  });
});

describe('makeBoard', () => {
  it('creates rows matching rowSizes with all tiles empty', () => {
    const board = makeBoard(5, 7, 'plus');
    expect(board.tiles.map((r) => r.length)).toEqual(rowSizes(5, 7, 'plus'));
    for (const row of board.tiles) {
      for (const tile of row) {
        expect(tile).toEqual({ checker: 'clear', bg: 'white' });
      }
    }
  });

  it('records the configuration on the state', () => {
    const board = makeBoard(4, 3, 'minus');
    expect(board.baseSize).toBe(4);
    expect(board.rows).toBe(3);
    expect(board.mode).toBe('minus');
  });
});
