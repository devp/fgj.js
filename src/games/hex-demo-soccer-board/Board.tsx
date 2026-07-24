import { useRef, useState } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { BoardMode, Checker, HexDemoState, Tile } from './Game';
import { rowSizes, validateConfig } from './Game';

// Pointy-top hexagon clip path.
const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

// Geometry. Height of a pointy-top regular hexagon is width * 2/sqrt(3).
const HEX_W = 46;
const HEX_H = HEX_W * 1.1547;
const ROW_STEP = HEX_H * 0.75; // rows interlock, overlapping by a quarter height

const CHECKER_COLOR: Record<Exclude<Checker, 'clear'>, string> = {
  red: '#d33a3a',
  blue: '#3366cc',
  black: '#222222',
};

const LONG_PRESS_MS = 450;

function HexTile({
  tile,
  left,
  top,
  onTap,
  onHold,
}: {
  tile: Tile;
  left: number;
  top: number;
  onTap: () => void;
  onHold: () => void;
}) {
  const timer = useRef<number | null>(null);
  const held = useRef(false);

  const clearTimer = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    held.current = false;
    timer.current = window.setTimeout(() => {
      held.current = true;
      onHold();
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = () => {
    clearTimer();
    if (!held.current) onTap();
  };

  const handlePointerLeave = () => {
    clearTimer();
    held.current = false;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // Right-click is a handy desktop shortcut for the background toggle.
    e.preventDefault();
    onHold();
  };

  const bgColor = tile.bg === 'gray' ? '#b9b9b9' : '#ffffff';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute',
        left,
        top,
        width: HEX_W,
        height: HEX_H,
        cursor: 'pointer',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {/* dark rim */}
      <div style={{ position: 'absolute', inset: 0, clipPath: HEX_CLIP, background: '#555' }} />
      {/* tile face */}
      <div
        style={{
          position: 'absolute',
          inset: 2,
          clipPath: HEX_CLIP,
          background: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {tile.checker !== 'clear' && (
          <div
            style={{
              width: '48%',
              height: '48%',
              borderRadius: '50%',
              background: CHECKER_COLOR[tile.checker],
              boxShadow: 'inset 0 -3px 4px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.45)',
            }}
          />
        )}
      </div>
    </div>
  );
}

export function Board({ G, moves }: BoardProps<HexDemoState>) {
  const [baseSize, setBaseSize] = useState(String(G.baseSize));
  const [rows, setRows] = useState(String(G.rows));
  const [mode, setMode] = useState<BoardMode>(G.mode);
  const [error, setError] = useState<string | null>(null);

  const applyReset = () => {
    const b = parseInt(baseSize, 10);
    const r = parseInt(rows, 10);
    const err = validateConfig(b, r, mode);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    moves.resetBoard(b, r, mode);
  };

  const sizes = rowSizes(G.baseSize, G.rows, G.mode);
  const maxCount = Math.max(...sizes);
  const boardWidth = maxCount * HEX_W;
  const boardHeight = (G.rows - 1) * ROW_STEP + HEX_H;

  const inputStyle: React.CSSProperties = {
    width: '56px',
    padding: '4px 6px',
    fontSize: '14px',
    border: '1px solid #bbb',
    borderRadius: '4px',
  };
  const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '13px',
    color: '#444',
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '16px', maxWidth: '520px' }}>
      <h1 style={{ fontSize: '20px', margin: '0 0 4px' }}>Hex Demo Soccer Board</h1>
      <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px' }}>
        Tap a tile to cycle its checker (clear → red → blue → black). Long-press (or right-click)
        a tile to toggle its background between white and gray.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          gap: '12px',
          padding: '12px',
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '6px',
          marginBottom: '12px',
        }}
      >
        <label style={labelStyle}>
          Base rows (X)
          <input
            type="number"
            min={1}
            value={baseSize}
            onChange={(e) => setBaseSize(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          Rows (N, odd)
          <input
            type="number"
            min={1}
            step={2}
            value={rows}
            onChange={(e) => setRows(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          Middle rows
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as BoardMode)}
            style={{ ...inputStyle, width: 'auto' }}
          >
            <option value="plus">X + 1</option>
            <option value="minus">X − 1</option>
          </select>
        </label>
        <button
          onClick={applyReset}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            border: '2px solid #333',
            borderRadius: '6px',
            background: '#fff',
          }}
        >
          Reset board
        </button>
      </div>

      {error && (
        <p style={{ color: '#c00', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>
      )}

      <div
        style={{
          position: 'relative',
          width: boardWidth,
          height: boardHeight,
          margin: '0 auto',
        }}
      >
        {G.tiles.map((row, y) => {
          const rowWidth = row.length * HEX_W;
          const xOffset = (boardWidth - rowWidth) / 2;
          return row.map((tile, i) => (
            <HexTile
              key={`${y}-${i}`}
              tile={tile}
              left={xOffset + i * HEX_W}
              top={y * ROW_STEP}
              onTap={() => moves.cycleChecker(y, i)}
              onHold={() => moves.toggleBackground(y, i)}
            />
          ));
        })}
      </div>
    </div>
  );
}
