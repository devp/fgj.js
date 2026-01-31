import type { Game } from 'boardgame.io';
import type { BoardProps } from 'boardgame.io/react';
import type { ComponentType } from 'react';

import * as TicTacToe from './games/tic-tac-toe';

export interface GameDefinition {
  game: Game;
  Board: ComponentType<BoardProps>;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
}

export const games: Record<string, GameDefinition> = {
  'tic-tac-toe': {
    game: TicTacToe.game,
    Board: TicTacToe.Board,
    name: 'Tic-Tac-Toe',
    description: 'Classic 3x3 grid game',
    minPlayers: 2,
    maxPlayers: 2,
  },
};

export const gameIds = Object.keys(games);
