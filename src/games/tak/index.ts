import type { GameDefinition } from '../../types';
import { Tak as game } from './Game';
import { Board } from './Board';
import rules from './rules.md?raw';

export type { TakState } from './Game';

export const definition: GameDefinition = {
  game,
  Board,
  name: 'Tak',
  description: 'Abstract strategy game - build a road',
  minPlayers: 2,
  maxPlayers: 2,
  rules,
};
