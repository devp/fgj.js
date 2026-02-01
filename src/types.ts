import type { Game } from 'boardgame.io';
import type { BoardProps } from 'boardgame.io/react';
import type { ComponentType } from 'react';

export interface GameDefinition {
  game: Game;
  Board: ComponentType<BoardProps>;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  rules: string;
}
