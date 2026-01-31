import { useState, useEffect, useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { RandomBot, MCTSBot } from 'boardgame.io/ai';
import { games, gameIds, type GameDefinition } from './registry';

type AISettings = {
  player0: boolean;
  player1: boolean;
};

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

function AIToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: checked ? '#e8f4e8' : '#fff',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ cursor: 'pointer' }}
      />
      <span>{label}</span>
      {checked && <span style={{ color: '#666', fontSize: '12px' }}>(AI)</span>}
    </label>
  );
}

// Factory to create MCTSBot with game-specific options
function createMCTSBot(game: GameDefinition['game']) {
  return class extends MCTSBot {
    constructor(opts: ConstructorParameters<typeof MCTSBot>[0]) {
      super({
        ...opts,
        game,
        iterations: 500,
        playoutDepth: 20,
      });
    }
  };
}

function GameView({ gameId, definition }: { gameId: string; definition: GameDefinition }) {
  const [aiSettings, setAiSettings] = useState<AISettings>({ player0: false, player1: false });

  const GameClient = useMemo(() => {
    // Use MCTSBot for tic-tac-toe (turn-based), RandomBot for others (like simultaneous RPS)
    const useMCTS = gameId === 'tic-tac-toe';
    const BotClass = useMCTS ? createMCTSBot(definition.game) : RandomBot;

    // Build the bots configuration based on AI settings
    const bots: Record<string, typeof RandomBot> = {};
    if (aiSettings.player0) {
      bots['0'] = BotClass;
    }
    if (aiSettings.player1) {
      bots['1'] = BotClass;
    }

    return Client({
      game: definition.game,
      board: definition.Board,
      multiplayer: Local({ bots: Object.keys(bots).length > 0 ? bots : undefined }),
    });
  }, [gameId, definition, aiSettings]);

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

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ccc',
        }}
      >
        <span style={{ fontWeight: 'bold', alignSelf: 'center' }}>AI Players:</span>
        <AIToggle
          label="Player 1"
          checked={aiSettings.player0}
          onChange={(checked) => setAiSettings((s) => ({ ...s, player0: checked }))}
        />
        <AIToggle
          label="Player 2"
          checked={aiSettings.player1}
          onChange={(checked) => setAiSettings((s) => ({ ...s, player1: checked }))}
        />
      </div>

      <div className="player-container" style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '20px' }}>
        <div>
          <h2 style={{ textAlign: 'center' }}>
            Player 1 {aiSettings.player0 && <span style={{ color: '#666', fontSize: '14px' }}>(AI)</span>}
          </h2>
          <GameClient playerID="0" />
        </div>
        <div>
          <h2 style={{ textAlign: 'center' }}>
            Player 2 {aiSettings.player1 && <span style={{ color: '#666', fontSize: '14px' }}>(AI)</span>}
          </h2>
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
