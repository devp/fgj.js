import type { GameDefinition } from '../../types';
import { HexDemo as game } from './Game';
import { Board } from './Board';
import rules from './rules.md?raw';

export type { HexDemoState } from './Game';

export const definition: GameDefinition = {
  game,
  Board,
  name: 'Hex Demo Soccer Board',
  description: 'A sandbox hex board for prototyping game concepts',
  minPlayers: 1,
  maxPlayers: 2,
  rules,
};
