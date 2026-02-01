import type { GameDefinition } from '../../types';
import { MechaDuel as game } from './Game';
import { Board } from './Board';
import rules from './rules.md?raw';

export type { MechaDuelState } from './Game';

export const definition: GameDefinition = {
  game,
  Board,
  name: 'Mecha Duel',
  description: 'Strategic mecha combat with committed attacks',
  minPlayers: 2,
  maxPlayers: 2,
  rules,
};
