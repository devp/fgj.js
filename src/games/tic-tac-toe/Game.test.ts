import { describe, it, expect } from 'vitest';
import { isVictory, isDraw } from './Game';

describe('isVictory', () => {
  describe('returns false for non-winning boards', () => {
    it('returns false for empty board', () => {
      const cells = Array(9).fill(null);
      expect(isVictory(cells)).toBe(false);
    });

    it('returns false for partial game with no winner', () => {
      const cells = [
        '0', '1', '0',
        '1', '0', '1',
        null, null, null,
      ];
      expect(isVictory(cells)).toBe(false);
    });

    it('returns false for a draw board', () => {
      const cells = [
        '0', '1', '0',
        '0', '1', '1',
        '1', '0', '0',
      ];
      expect(isVictory(cells)).toBe(false);
    });
  });

  describe('detects row wins', () => {
    it('detects top row win', () => {
      const cells = [
        '0', '0', '0',
        '1', '1', null,
        null, null, null,
      ];
      expect(isVictory(cells)).toBe(true);
    });

    it('detects middle row win', () => {
      const cells = [
        '0', '1', null,
        '1', '1', '1',
        '0', null, '0',
      ];
      expect(isVictory(cells)).toBe(true);
    });

    it('detects bottom row win', () => {
      const cells = [
        '0', '1', '0',
        '1', null, null,
        '0', '0', '0',
      ];
      expect(isVictory(cells)).toBe(true);
    });
  });

  describe('detects column wins', () => {
    it('detects left column win', () => {
      const cells = [
        '0', '1', null,
        '0', '1', null,
        '0', null, null,
      ];
      expect(isVictory(cells)).toBe(true);
    });

    it('detects middle column win', () => {
      const cells = [
        '0', '1', null,
        null, '1', '0',
        null, '1', null,
      ];
      expect(isVictory(cells)).toBe(true);
    });

    it('detects right column win', () => {
      const cells = [
        '0', '1', '0',
        '1', null, '0',
        null, null, '0',
      ];
      expect(isVictory(cells)).toBe(true);
    });
  });

  describe('detects diagonal wins', () => {
    it('detects main diagonal win (top-left to bottom-right)', () => {
      const cells = [
        '0', '1', null,
        '1', '0', null,
        null, null, '0',
      ];
      expect(isVictory(cells)).toBe(true);
    });

    it('detects anti-diagonal win (top-right to bottom-left)', () => {
      const cells = [
        '1', null, '0',
        '1', '0', null,
        '0', null, null,
      ];
      expect(isVictory(cells)).toBe(true);
    });
  });
});

describe('isDraw', () => {
  it('returns false for empty board', () => {
    const cells = Array(9).fill(null);
    expect(isDraw(cells)).toBe(false);
  });

  it('returns false for partial board', () => {
    const cells = [
      '0', '1', '0',
      '1', '0', '1',
      null, null, null,
    ];
    expect(isDraw(cells)).toBe(false);
  });

  it('returns false for board with one empty cell', () => {
    const cells = [
      '0', '1', '0',
      '1', '0', '1',
      '1', '0', null,
    ];
    expect(isDraw(cells)).toBe(false);
  });

  it('returns true for full board', () => {
    const cells = [
      '0', '1', '0',
      '0', '1', '1',
      '1', '0', '0',
    ];
    expect(isDraw(cells)).toBe(true);
  });
});
