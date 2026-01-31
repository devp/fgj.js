import { Game } from 'boardgame.io';

export interface TicTacToeState {
  cells: (string | null)[];
}

export const TicTacToe: Game<TicTacToeState> = {
  name: 'tic-tac-toe',

  setup: () => ({
    cells: Array(9).fill(null),
  }),

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },

  moves: {
    clickCell: ({ G, playerID }, id: number) => {
      if (G.cells[id] !== null) {
        return;
      }
      G.cells[id] = playerID;
    },
  },

  endIf: ({ G, ctx }) => {
    if (isVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
    if (isDraw(G.cells)) {
      return { draw: true };
    }
  },
};

function isVictory(cells: (string | null)[]): boolean {
  const positions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of positions) {
    if (cells[a] !== null && cells[a] === cells[b] && cells[a] === cells[c]) {
      return true;
    }
  }
  return false;
}

function isDraw(cells: (string | null)[]): boolean {
  return cells.every((cell) => cell !== null);
}
