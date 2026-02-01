import type { GameDefinition } from '../../types';
import { RPS as game } from './Game';
import { Board } from './Board';
import rules from './rules.md?raw';

export type { RPSState } from './Game';

export const definition: GameDefinition = {
  game,
  Board,
  name: 'Rock Paper Scissors',
  description: 'Best of three',
  minPlayers: 2,
  maxPlayers: 2,
  rules,
};
