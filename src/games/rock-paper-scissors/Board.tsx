import type { BoardProps } from 'boardgame.io/react';
import type { RPSState, Move } from './Game';

const MOVES: Move[] = ['rock', 'paper', 'scissors'];
const EMOJI: Record<string, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

export function Board({ G, ctx, moves, playerID }: BoardProps<RPSState>) {
  const myMove = playerID ? G.moves[playerID as '0' | '1'] : null;
  const opponentID = playerID === '0' ? '1' : '0';
  const opponentMove = G.moves[opponentID];

  const handleChoice = (move: Move) => {
    if (myMove || ctx.gameover) return;
    moves.choose(move);
  };

  let status: string;
  if (ctx.gameover) {
    status = ctx.gameover.winner === playerID ? 'You win the match!' : 'You lose the match!';
  } else if (myMove) {
    status = 'Waiting for opponent...';
  } else {
    status = 'Choose your move!';
  }

  const buttonStyle = (move: Move): React.CSSProperties => ({
    padding: '20px 30px',
    fontSize: '36px',
    cursor: myMove || ctx.gameover ? 'not-allowed' : 'pointer',
    border: myMove === move ? '3px solid #007bff' : '2px solid #333',
    borderRadius: '12px',
    backgroundColor: myMove === move ? '#e7f1ff' : '#fff',
    opacity: myMove && myMove !== move ? 0.5 : 1,
  });

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <strong>Round {G.round}</strong> | Score: You {G.scores[playerID as '0' | '1']} - {G.scores[opponentID]} Opponent
      </div>

      {G.lastResult && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          {G.lastResult}
        </div>
      )}

      <p style={{ fontSize: '20px', marginBottom: '20px' }}>{status}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
        {MOVES.map((move) => (
          <button
            key={move}
            style={buttonStyle(move)}
            onClick={() => handleChoice(move)}
            disabled={!!myMove || !!ctx.gameover}
            title={move ?? undefined}
          >
            {EMOJI[move!]}
          </button>
        ))}
      </div>

      {myMove && !ctx.gameover && (
        <p style={{ color: '#666' }}>
          You chose {EMOJI[myMove]} {myMove}
          {opponentMove ? ` | Opponent chose ${EMOJI[opponentMove]} ${opponentMove}` : ''}
        </p>
      )}
    </div>
  );
}
