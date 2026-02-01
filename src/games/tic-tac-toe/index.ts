import type { GameDefinition } from '../../types';
import { TicTacToe as game } from './Game';
import { Board } from './Board';
import rules from './rules.md?raw';

export type { TicTacToeState } from './Game';

export const definition: GameDefinition = {
  game,
  Board,
  name: 'Tic-Tac-Toe',
  description: 'Classic 3x3 grid game',
  minPlayers: 2,
  maxPlayers: 2,
  rules,
};
