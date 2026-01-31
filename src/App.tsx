import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { TicTacToe } from './Game';
import { Board } from './Board';

const TicTacToeClient = Client({
  game: TicTacToe,
  board: Board,
  multiplayer: Local(),
});

export function App() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '20px' }}>
      <div>
        <h2 style={{ textAlign: 'center' }}>Player X</h2>
        <TicTacToeClient playerID="0" />
      </div>
      <div>
        <h2 style={{ textAlign: 'center' }}>Player O</h2>
        <TicTacToeClient playerID="1" />
      </div>
    </div>
  );
}
