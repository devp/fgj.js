import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  getTopPiece,
  stackOwner,
  canPlaceOn,
  canMoveOnto,
  isValidPosition,
  hasRoad,
  countFlats,
  hasPiecesToPlace,
  isBoardFull,
  type Stack,
  type Piece,
} from './Game';

describe('createEmptyBoard', () => {
  it('creates a 5x5 board of empty stacks', () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(5);
    expect(board[0].length).toBe(5);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        expect(board[row][col]).toEqual([]);
      }
    }
  });
});

describe('getTopPiece', () => {
  it('returns undefined for empty stack', () => {
    expect(getTopPiece([])).toBeUndefined();
  });

  it('returns the top piece of a stack', () => {
    const stack: Stack = [
      { owner: '0', type: 'flat' },
      { owner: '1', type: 'flat' },
    ];
    expect(getTopPiece(stack)).toEqual({ owner: '1', type: 'flat' });
  });
});

describe('stackOwner', () => {
  it('returns undefined for empty stack', () => {
    expect(stackOwner([])).toBeUndefined();
  });

  it('returns the owner of the top piece', () => {
    const stack: Stack = [
      { owner: '0', type: 'flat' },
      { owner: '1', type: 'flat' },
    ];
    expect(stackOwner(stack)).toBe('1');
  });
});

describe('canPlaceOn', () => {
  it('returns true for empty stack', () => {
    expect(canPlaceOn([])).toBe(true);
  });

  it('returns true for stack with flat on top', () => {
    const stack: Stack = [{ owner: '0', type: 'flat' }];
    expect(canPlaceOn(stack)).toBe(true);
  });

  it('returns false for stack with standing stone on top', () => {
    const stack: Stack = [{ owner: '0', type: 'standing' }];
    expect(canPlaceOn(stack)).toBe(false);
  });

  it('returns false for stack with capstone on top', () => {
    const stack: Stack = [{ owner: '0', type: 'capstone' }];
    expect(canPlaceOn(stack)).toBe(false);
  });
});

describe('canMoveOnto', () => {
  it('returns true for empty stack', () => {
    const piece: Piece = { owner: '0', type: 'flat' };
    expect(canMoveOnto([], piece)).toBe(true);
  });

  it('returns true for moving onto flat stone', () => {
    const stack: Stack = [{ owner: '1', type: 'flat' }];
    const piece: Piece = { owner: '0', type: 'flat' };
    expect(canMoveOnto(stack, piece)).toBe(true);
  });

  it('returns false for moving flat onto standing stone', () => {
    const stack: Stack = [{ owner: '1', type: 'standing' }];
    const piece: Piece = { owner: '0', type: 'flat' };
    expect(canMoveOnto(stack, piece)).toBe(false);
  });

  it('returns true for moving capstone onto standing stone (flattening)', () => {
    const stack: Stack = [{ owner: '1', type: 'standing' }];
    const piece: Piece = { owner: '0', type: 'capstone' };
    expect(canMoveOnto(stack, piece)).toBe(true);
  });

  it('returns false for moving onto capstone', () => {
    const stack: Stack = [{ owner: '1', type: 'capstone' }];
    const piece: Piece = { owner: '0', type: 'flat' };
    expect(canMoveOnto(stack, piece)).toBe(false);
  });
});

describe('isValidPosition', () => {
  it('returns true for valid positions', () => {
    expect(isValidPosition(0, 0)).toBe(true);
    expect(isValidPosition(2, 2)).toBe(true);
    expect(isValidPosition(4, 4)).toBe(true);
  });

  it('returns false for invalid positions', () => {
    expect(isValidPosition(-1, 0)).toBe(false);
    expect(isValidPosition(0, -1)).toBe(false);
    expect(isValidPosition(5, 0)).toBe(false);
    expect(isValidPosition(0, 5)).toBe(false);
  });
});

describe('hasRoad', () => {
  it('returns false for empty board', () => {
    const board = createEmptyBoard();
    expect(hasRoad(board, '0')).toBe(false);
  });

  it('detects top-to-bottom road', () => {
    const board = createEmptyBoard();
    // Create a road down column 2
    for (let row = 0; row < 5; row++) {
      board[row][2] = [{ owner: '0', type: 'flat' }];
    }
    expect(hasRoad(board, '0')).toBe(true);
    expect(hasRoad(board, '1')).toBe(false);
  });

  it('detects left-to-right road', () => {
    const board = createEmptyBoard();
    // Create a road across row 2
    for (let col = 0; col < 5; col++) {
      board[2][col] = [{ owner: '1', type: 'flat' }];
    }
    expect(hasRoad(board, '1')).toBe(true);
    expect(hasRoad(board, '0')).toBe(false);
  });

  it('detects winding road', () => {
    const board = createEmptyBoard();
    // Create a winding path
    board[0][0] = [{ owner: '0', type: 'flat' }];
    board[1][0] = [{ owner: '0', type: 'flat' }];
    board[1][1] = [{ owner: '0', type: 'flat' }];
    board[2][1] = [{ owner: '0', type: 'flat' }];
    board[2][2] = [{ owner: '0', type: 'flat' }];
    board[3][2] = [{ owner: '0', type: 'flat' }];
    board[4][2] = [{ owner: '0', type: 'flat' }];
    expect(hasRoad(board, '0')).toBe(true);
  });

  it('standing stones do not count as road', () => {
    const board = createEmptyBoard();
    // Create a road with standing stone in middle
    for (let row = 0; row < 5; row++) {
      if (row === 2) {
        board[row][0] = [{ owner: '0', type: 'standing' }];
      } else {
        board[row][0] = [{ owner: '0', type: 'flat' }];
      }
    }
    expect(hasRoad(board, '0')).toBe(false);
  });

  it('capstones count as road', () => {
    const board = createEmptyBoard();
    // Create a road with capstone in middle
    for (let row = 0; row < 5; row++) {
      if (row === 2) {
        board[row][0] = [{ owner: '0', type: 'capstone' }];
      } else {
        board[row][0] = [{ owner: '0', type: 'flat' }];
      }
    }
    expect(hasRoad(board, '0')).toBe(true);
  });

  it('does not detect diagonal-only connections', () => {
    const board = createEmptyBoard();
    // Create a diagonal path - should NOT be a road
    board[0][0] = [{ owner: '0', type: 'flat' }];
    board[1][1] = [{ owner: '0', type: 'flat' }];
    board[2][2] = [{ owner: '0', type: 'flat' }];
    board[3][3] = [{ owner: '0', type: 'flat' }];
    board[4][4] = [{ owner: '0', type: 'flat' }];
    expect(hasRoad(board, '0')).toBe(false);
  });
});

describe('countFlats', () => {
  it('returns 0 for empty board', () => {
    const board = createEmptyBoard();
    expect(countFlats(board, '0')).toBe(0);
  });

  it('counts only visible flat stones', () => {
    const board = createEmptyBoard();
    board[0][0] = [{ owner: '0', type: 'flat' }];
    board[0][1] = [{ owner: '0', type: 'flat' }, { owner: '1', type: 'flat' }];
    board[0][2] = [{ owner: '0', type: 'standing' }];
    board[0][3] = [{ owner: '0', type: 'capstone' }];

    expect(countFlats(board, '0')).toBe(1); // Only the first cell counts
    expect(countFlats(board, '1')).toBe(1); // The top of second stack
  });

  it('does not count standing stones or capstones', () => {
    const board = createEmptyBoard();
    board[0][0] = [{ owner: '0', type: 'standing' }];
    board[0][1] = [{ owner: '0', type: 'capstone' }];
    expect(countFlats(board, '0')).toBe(0);
  });
});

describe('hasPiecesToPlace', () => {
  it('returns true when player has pieces', () => {
    const pieces = {
      '0': { flats: 21, capstones: 1 },
      '1': { flats: 21, capstones: 1 },
    };
    expect(hasPiecesToPlace(pieces, '0')).toBe(true);
  });

  it('returns false when player has no pieces', () => {
    const pieces = {
      '0': { flats: 0, capstones: 0 },
      '1': { flats: 21, capstones: 1 },
    };
    expect(hasPiecesToPlace(pieces, '0')).toBe(false);
  });

  it('returns true when player only has capstone', () => {
    const pieces = {
      '0': { flats: 0, capstones: 1 },
      '1': { flats: 21, capstones: 1 },
    };
    expect(hasPiecesToPlace(pieces, '0')).toBe(true);
  });

  it('returns true when player only has flats', () => {
    const pieces = {
      '0': { flats: 5, capstones: 0 },
      '1': { flats: 21, capstones: 1 },
    };
    expect(hasPiecesToPlace(pieces, '0')).toBe(true);
  });
});

describe('isBoardFull', () => {
  it('returns false for empty board', () => {
    const board = createEmptyBoard();
    expect(isBoardFull(board)).toBe(false);
  });

  it('returns false for partially filled board', () => {
    const board = createEmptyBoard();
    board[0][0] = [{ owner: '0', type: 'flat' }];
    expect(isBoardFull(board)).toBe(false);
  });

  it('returns false for board with one empty cell', () => {
    const board = createEmptyBoard();
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (row === 4 && col === 4) continue;
        board[row][col] = [{ owner: row % 2 === 0 ? '0' : '1', type: 'flat' }];
      }
    }
    expect(isBoardFull(board)).toBe(false);
  });

  it('returns true for full board', () => {
    const board = createEmptyBoard();
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        board[row][col] = [{ owner: row % 2 === 0 ? '0' : '1', type: 'flat' }];
      }
    }
    expect(isBoardFull(board)).toBe(true);
  });
});
