import type { BoardProps } from 'boardgame.io/react';
import type { TicTacToeState } from './Game';

export function Board({ G, ctx, moves }: BoardProps<TicTacToeState>) {
  const onClick = (id: number) => {
    if (ctx.gameover) return;
    moves.clickCell(id);
  };

  let status: string;
  if (ctx.gameover) {
    if (ctx.gameover.winner !== undefined) {
      status = `Winner: Player ${ctx.gameover.winner === '0' ? 'X' : 'O'}`;
    } else {
      status = "It's a draw!";
    }
  } else {
    status = `Current player: ${ctx.currentPlayer === '0' ? 'X' : 'O'}`;
  }

  const cellStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    fontSize: '48px',
    fontWeight: 'bold',
    border: '2px solid #333',
    backgroundColor: '#fff',
    cursor: 'pointer',
  };

  const boardStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 80px)',
    gap: '4px',
    marginBottom: '20px',
  };

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
      <h1>Tic-Tac-Toe</h1>
      <p style={{ fontSize: '24px', marginBottom: '20px' }}>{status}</p>
      <div style={boardStyle}>
        {G.cells.map((cell, id) => (
          <button key={id} style={cellStyle} onClick={() => onClick(id)}>
            {cell === '0' ? 'X' : cell === '1' ? 'O' : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
