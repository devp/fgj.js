import type { Game } from 'boardgame.io';
import type { BoardProps } from 'boardgame.io/react';
import type { ComponentType } from 'react';

import * as TicTacToe from './games/tic-tac-toe';
import TicTacToeRules from './games/tic-tac-toe/rules.md?raw';

import * as RockPaperScissors from './games/rock-paper-scissors';
import RockPaperScissorsRules from './games/rock-paper-scissors/rules.md?raw';

export interface GameDefinition {
  game: Game;
  Board: ComponentType<BoardProps>;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  rules: string;
}

/*
 * ============================================================================
 * ADDING A NEW GAME
 * ============================================================================
 * 1. Create a new folder in src/games/<game-name>/
 * 2. Add the following files:
 *    - Game.ts    : boardgame.io game definition
 *    - Board.tsx  : React component for the game board
 *    - index.ts   : exports { game, Board }
 *    - rules.md   : Markdown file with game rules
 * 3. Import the game and rules below:
 *    import * as MyGame from './games/my-game';
 *    import MyGameRules from './games/my-game/rules.md?raw';
 * 4. Add an entry to the `games` object below
 * ============================================================================
 */

export const games: Record<string, GameDefinition> = {
  'tic-tac-toe': {
    game: TicTacToe.game,
    Board: TicTacToe.Board,
    name: 'Tic-Tac-Toe',
    description: 'Classic 3x3 grid game',
    minPlayers: 2,
    maxPlayers: 2,
    rules: TicTacToeRules,
  },
  'rock-paper-scissors': {
    game: RockPaperScissors.game,
    Board: RockPaperScissors.Board,
    name: 'Rock Paper Scissors',
    description: 'Best of three',
    minPlayers: 2,
    maxPlayers: 2,
    rules: RockPaperScissorsRules,
  },
};

export const gameIds = Object.keys(games);
