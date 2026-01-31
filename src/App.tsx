import { useState, useEffect, useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { games, gameIds, type GameDefinition } from './registry';

function GameSelector({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '40px' }}>
      <h1>FGJ - Game Foundry</h1>
      <p style={{ marginBottom: '30px' }}>Select a game to play:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        {gameIds.map((id) => {
          const game = games[id];
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              style={{
                padding: '16px 32px',
                fontSize: '18px',
                cursor: 'pointer',
                border: '2px solid #333',
                borderRadius: '8px',
                backgroundColor: '#fff',
                minWidth: '250px',
              }}
            >
              <strong>{game.name}</strong>
              <br />
              <span style={{ fontSize: '14px', color: '#666' }}>{game.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Rules({ rules }: { rules: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          cursor: 'pointer',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#f5f5f5',
          width: '100%',
          textAlign: 'left',
        }}
      >
        {isOpen ? '▼' : '▶'} Rules
      </button>
      {isOpen && (
        <div
          style={{
            padding: '16px',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            backgroundColor: '#fafafa',
            whiteSpace: 'pre-wrap',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        >
          {rules}
        </div>
      )}
    </div>
  );
}

function GameView({ gameId, definition }: { gameId: string; definition: GameDefinition }) {
  const GameClient = useMemo(
    () =>
      Client({
        game: definition.game,
        board: definition.Board,
        multiplayer: Local(),
      }),
    [gameId, definition]
  );

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid #ccc' }}>
        <a
          href="#"
          style={{ textDecoration: 'none', color: '#333' }}
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '';
          }}
        >
          &larr; Back to games
        </a>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '20px' }}>
        <div>
          <h2 style={{ textAlign: 'center' }}>Player 1</h2>
          <GameClient playerID="0" />
        </div>
        <div>
          <h2 style={{ textAlign: 'center' }}>Player 2</h2>
          <GameClient playerID="1" />
        </div>
      </div>
      <Rules rules={definition.rules} />
    </div>
  );
}

export function App() {
  const [currentGame, setCurrentGame] = useState<string | null>(() => {
    const hash = window.location.hash.slice(1);
    return hash && games[hash] ? hash : null;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setCurrentGame(hash && games[hash] ? hash : null);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const selectGame = (id: string) => {
    window.location.hash = id;
  };

  if (currentGame && games[currentGame]) {
    return <GameView gameId={currentGame} definition={games[currentGame]} />;
  }

  return <GameSelector onSelect={selectGame} />;
}
