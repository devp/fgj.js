import type { GameDefinition } from './types';

export type { GameDefinition } from './types';

/*
 * ============================================================================
 * ADDING A NEW GAME
 * ============================================================================
 * Games are auto-discovered from src/games/<game-name>/ directories.
 *
 * To add a new game, create a folder with these files:
 *   - Game.ts    : boardgame.io game definition
 *   - Board.tsx  : React component for the game board
 *   - index.ts   : exports a `definition` object of type GameDefinition
 *   - rules.md   : Markdown file with game rules
 *
 * Example index.ts:
 *   import type { GameDefinition } from '../../types';
 *   import { MyGame as game } from './Game';
 *   import { Board } from './Board';
 *   import rules from './rules.md?raw';
 *
 *   export const definition: GameDefinition = {
 *     game,
 *     Board,
 *     name: 'My Game',
 *     description: 'A fun game',
 *     minPlayers: 2,
 *     maxPlayers: 4,
 *     rules,
 *   };
 * ============================================================================
 */

const gameModules = import.meta.glob<{ definition: GameDefinition }>(
  './games/*/index.ts',
  { eager: true }
);

export const games: Record<string, GameDefinition> = {};

for (const [path, module] of Object.entries(gameModules)) {
  const id = path.match(/\.\/games\/([^/]+)\//)?.[1];
  if (id && module.definition) {
    games[id] = module.definition;
  }
}

export const gameIds = Object.keys(games);
