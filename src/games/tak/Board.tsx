import { useState } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { TakState, Stack, Piece, PieceType } from './Game';
import { getTopPiece } from './Game';

type ActionMode = 'select' | 'place' | 'move';

interface MoveState {
  fromRow: number;
  fromCol: number;
  direction: string | null;
  picked: number;
  drops: number[];
}

const BOARD_SIZE = 5;
const DIRECTIONS = ['up', 'down', 'left', 'right'];
const DIRECTION_LABELS: Record<string, string> = {
  up: '\u2191 Up',
  down: '\u2193 Down',
  left: '\u2190 Left',
  right: '\u2192 Right',
};
const DIRECTION_VECTORS: Record<string, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

export function Board({ G, ctx, moves, playerID }: BoardProps<TakState>) {
  const [mode, setMode] = useState<ActionMode>('select');
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [moveState, setMoveState] = useState<MoveState | null>(null);

  const isMyTurn = playerID === ctx.currentPlayer;
  const isOpening = G.turnNumber < 2;
  const currentPlayerLabel = ctx.currentPlayer === '0' ? 'White' : 'Black';
  const myLabel = playerID === '0' ? 'White' : 'Black';

  const resetSelection = () => {
    setMode('select');
    setSelectedCell(null);
    setMoveState(null);
  };

  const handleCellClick = (row: number, col: number) => {
    if (ctx.gameover || !isMyTurn) return;

    const stack = G.board[row][col];
    const top = getTopPiece(stack);
    const isEmpty = stack.length === 0;
    const isMyStack = top?.owner === playerID;

    if (mode === 'select') {
      if (isEmpty) {
        // Empty cell - start place mode
        setSelectedCell([row, col]);
        setMode('place');
      } else if (isMyStack && !isOpening) {
        // My stack - start move mode
        setSelectedCell([row, col]);
        setMode('move');
        setMoveState({
          fromRow: row,
          fromCol: col,
          direction: null,
          picked: 1,
          drops: [1],
        });
      }
    } else if (mode === 'place') {
      if (isEmpty) {
        setSelectedCell([row, col]);
      } else {
        resetSelection();
      }
    } else if (mode === 'move') {
      // Clicking another cell cancels move mode
      resetSelection();
      // If clicked on empty or my stack, start fresh
      if (isEmpty) {
        setSelectedCell([row, col]);
        setMode('place');
      } else if (isMyStack) {
        setSelectedCell([row, col]);
        setMode('move');
        setMoveState({
          fromRow: row,
          fromCol: col,
          direction: null,
          picked: 1,
          drops: [1],
        });
      }
    }
  };

  const handlePlace = (pieceType: PieceType) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    moves.place(row, col, pieceType);
    resetSelection();
  };

  const handleMove = () => {
    if (!moveState || !moveState.direction) return;
    moves.move(moveState.fromRow, moveState.fromCol, moveState.direction, moveState.drops);
    resetSelection();
  };

  const updateDrops = (picked: number, direction: string) => {
    // Default: drop 1 piece on each square
    const drops = Array(picked).fill(1);
    setMoveState((prev) =>
      prev ? { ...prev, picked, direction, drops } : null
    );
  };

  const setDropAt = (index: number, value: number) => {
    if (!moveState) return;
    const newDrops = [...moveState.drops];
    newDrops[index] = value;
    setMoveState({ ...moveState, drops: newDrops });
  };

  const addDropSquare = () => {
    if (!moveState) return;
    const total = moveState.drops.reduce((a, b) => a + b, 0);
    if (total < moveState.picked) {
      setMoveState({
        ...moveState,
        drops: [...moveState.drops, 1],
      });
    }
  };

  const removeDropSquare = () => {
    if (!moveState || moveState.drops.length <= 1) return;
    const newDrops = moveState.drops.slice(0, -1);
    // Ensure total equals picked
    const total = newDrops.reduce((a, b) => a + b, 0);
    if (total < moveState.picked) {
      newDrops[newDrops.length - 1] += moveState.picked - total;
    }
    setMoveState({ ...moveState, drops: newDrops });
  };

  const canMoveInDirection = (row: number, col: number, dir: string): boolean => {
    const [dr, dc] = DIRECTION_VECTORS[dir];
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) return false;

    const targetStack = G.board[newRow][newCol];
    const targetTop = getTopPiece(targetStack);
    if (!targetTop) return true;
    if (targetTop.type === 'capstone') return false;
    if (targetTop.type === 'standing') {
      // Only capstone can flatten
      const sourceTop = getTopPiece(G.board[row][col]);
      return sourceTop?.type === 'capstone';
    }
    return true;
  };

  const renderPiece = (piece: Piece) => {
    const color = piece.owner === '0' ? '#f5f5f5' : '#333';
    const borderColor = piece.owner === '0' ? '#999' : '#000';
    const textColor = piece.owner === '0' ? '#333' : '#fff';

    if (piece.type === 'capstone') {
      return (
        <div
          style={{
            width: '30px',
            height: '40px',
            backgroundColor: color,
            border: `2px solid ${borderColor}`,
            borderRadius: '50% 50% 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: textColor,
          }}
        >
          C
        </div>
      );
    }

    if (piece.type === 'standing') {
      return (
        <div
          style={{
            width: '8px',
            height: '35px',
            backgroundColor: color,
            border: `2px solid ${borderColor}`,
            borderRadius: '2px',
          }}
        />
      );
    }

    // Flat stone
    return (
      <div
        style={{
          width: '35px',
          height: '10px',
          backgroundColor: color,
          border: `2px solid ${borderColor}`,
          borderRadius: '3px',
        }}
      />
    );
  };

  const renderStack = (stack: Stack, row: number, col: number) => {
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;

    return (
      <div
        key={`${row}-${col}`}
        onClick={() => handleCellClick(row, col)}
        style={{
          width: '70px',
          height: '70px',
          border: isSelected ? '3px solid #4CAF50' : '1px solid #8B4513',
          backgroundColor: (row + col) % 2 === 0 ? '#DEB887' : '#D2691E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          cursor: 'pointer',
          padding: '2px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {stack.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              fontSize: '10px',
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '1px 3px',
              borderRadius: '2px',
            }}
          >
            {stack.length}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center',
            gap: '1px',
            maxHeight: '60px',
            overflow: 'hidden',
          }}
        >
          {stack.slice(-3).map((piece, i) => (
            <div key={i} style={{ marginTop: i > 0 ? '-5px' : '0' }}>
              {renderPiece(piece)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlaceControls = () => {
    if (mode !== 'place' || !selectedCell) return null;

    const pieces = G.pieces[playerID as '0' | '1'];
    const [row, col] = selectedCell;

    return (
      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p>
          <strong>Place piece at ({row}, {col})</strong>
        </p>
        {isOpening ? (
          <div>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Opening move: Place opponent&apos;s flat stone
            </p>
            <button onClick={() => handlePlace('flat')} style={buttonStyle}>
              Place Flat Stone
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handlePlace('flat')}
              disabled={pieces.flats <= 0}
              style={{ ...buttonStyle, opacity: pieces.flats <= 0 ? 0.5 : 1 }}
            >
              Flat ({pieces.flats})
            </button>
            <button
              onClick={() => handlePlace('standing')}
              disabled={pieces.flats <= 0}
              style={{ ...buttonStyle, opacity: pieces.flats <= 0 ? 0.5 : 1 }}
            >
              Wall ({pieces.flats})
            </button>
            <button
              onClick={() => handlePlace('capstone')}
              disabled={pieces.capstones <= 0}
              style={{ ...buttonStyle, opacity: pieces.capstones <= 0 ? 0.5 : 1 }}
            >
              Capstone ({pieces.capstones})
            </button>
          </div>
        )}
        <button onClick={resetSelection} style={{ ...buttonStyle, marginTop: '10px', backgroundColor: '#999' }}>
          Cancel
        </button>
      </div>
    );
  };

  const renderMoveControls = () => {
    if (mode !== 'move' || !moveState) return null;

    const stack = G.board[moveState.fromRow][moveState.fromCol];
    const maxPick = Math.min(5, stack.length);
    const currentTotal = moveState.drops.reduce((a, b) => a + b, 0);

    return (
      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p>
          <strong>Move stack from ({moveState.fromRow}, {moveState.fromCol})</strong>
        </p>
        <p style={{ fontSize: '12px', color: '#666' }}>Stack height: {stack.length}</p>

        <div style={{ marginTop: '10px' }}>
          <label>Pick up pieces: </label>
          <select
            value={moveState.picked}
            onChange={(e) => {
              const picked = parseInt(e.target.value);
              if (moveState.direction) {
                updateDrops(picked, moveState.direction);
              } else {
                setMoveState({ ...moveState, picked, drops: [picked] });
              }
            }}
            style={selectStyle}
          >
            {Array.from({ length: maxPick }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Direction: </label>
          <select
            value={moveState.direction || ''}
            onChange={(e) => {
              const dir = e.target.value;
              if (dir) {
                updateDrops(moveState.picked, dir);
              }
            }}
            style={selectStyle}
          >
            <option value="">Select direction...</option>
            {DIRECTIONS.filter((d) => canMoveInDirection(moveState.fromRow, moveState.fromCol, d)).map((d) => (
              <option key={d} value={d}>
                {DIRECTION_LABELS[d]}
              </option>
            ))}
          </select>
        </div>

        {moveState.direction && (
          <div style={{ marginTop: '10px' }}>
            <label>Drops per square: </label>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
              {moveState.drops.map((drop, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '12px' }}>Sq{i + 1}:</span>
                  <select
                    value={drop}
                    onChange={(e) => setDropAt(i, parseInt(e.target.value))}
                    style={{ ...selectStyle, width: '50px' }}
                  >
                    {Array.from({ length: moveState.picked }, (_, j) => j + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '5px', display: 'flex', gap: '10px' }}>
              <button
                onClick={addDropSquare}
                disabled={currentTotal >= moveState.picked}
                style={{ ...buttonStyle, fontSize: '12px', padding: '3px 8px' }}
              >
                + Square
              </button>
              <button
                onClick={removeDropSquare}
                disabled={moveState.drops.length <= 1}
                style={{ ...buttonStyle, fontSize: '12px', padding: '3px 8px' }}
              >
                - Square
              </button>
            </div>
            <p style={{ fontSize: '11px', color: currentTotal !== moveState.picked ? 'red' : '#666' }}>
              Total: {currentTotal} / {moveState.picked} pieces
            </p>
          </div>
        )}

        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleMove}
            disabled={!moveState.direction || currentTotal !== moveState.picked}
            style={{
              ...buttonStyle,
              backgroundColor: '#4CAF50',
              opacity: !moveState.direction || currentTotal !== moveState.picked ? 0.5 : 1,
            }}
          >
            Execute Move
          </button>
          <button onClick={resetSelection} style={{ ...buttonStyle, backgroundColor: '#999' }}>
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderPieceCount = () => {
    return (
      <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
        <div>
          <strong>White:</strong> {G.pieces['0'].flats} flats, {G.pieces['0'].capstones} caps
        </div>
        <div>
          <strong>Black:</strong> {G.pieces['1'].flats} flats, {G.pieces['1'].capstones} caps
        </div>
      </div>
    );
  };

  let status: string;
  if (ctx.gameover) {
    if (ctx.gameover.draw) {
      status = "It's a draw!";
    } else {
      const winnerLabel = ctx.gameover.winner === '0' ? 'White' : 'Black';
      status = `${winnerLabel} wins!`;
    }
  } else if (isOpening) {
    status = `Opening: ${currentPlayerLabel} places opponent's flat stone`;
  } else {
    status = `${currentPlayerLabel}'s turn${isMyTurn ? ' (You)' : ''}`;
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h1>Tak</h1>
      <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{status}</p>
      <p style={{ fontSize: '14px', color: '#666' }}>You are playing as {myLabel}</p>
      {renderPieceCount()}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 70px)`,
          gap: '0px',
          marginTop: '15px',
          border: '3px solid #5D4037',
        }}
      >
        {G.board.map((row, rowIdx) =>
          row.map((stack, colIdx) => renderStack(stack, rowIdx, colIdx))
        )}
      </div>

      {renderPlaceControls()}
      {renderMoveControls()}

      {mode === 'select' && !ctx.gameover && isMyTurn && (
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          Click an empty cell to place a piece, or click your stack to move it.
        </p>
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '14px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#2196F3',
  color: 'white',
  cursor: 'pointer',
};

const selectStyle: React.CSSProperties = {
  padding: '5px',
  fontSize: '14px',
  borderRadius: '4px',
};
