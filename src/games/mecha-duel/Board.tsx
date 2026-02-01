import { useState } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { MechaDuelState, PieceType, Piece } from './Game';
import {
  BOARD_SIZE,
  indexToPos,
  isValidCommitTarget,
  isValidKingStep,
} from './Game';

type ActionType = 'commit' | 'execute' | 'kingStep' | null;

const PIECE_SYMBOLS: Record<PieceType, string> = {
  bishop: 'B',
  rook: 'R',
  knight: 'N',
  queen: 'Q',
};

const CELL_SIZE = 50;

export function Board({ G, ctx, moves, playerID }: BoardProps<MechaDuelState>) {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [selectedExecutePieces, setSelectedExecutePieces] = useState<number[]>([]);

  const currentPlayerId = (playerID ?? ctx.currentPlayer) as '0' | '1';
  const isMyTurn = ctx.currentPlayer === currentPlayerId;
  const kingPos = G.kings[currentPlayerId];

  // Get player's pieces
  const myPieces = G.pieces[currentPlayerId];
  const readyPieces = myPieces.filter((p) => p.state === 'ready');
  const committedPieces = G.committedPieces.filter((cp) => cp.playerId === currentPlayerId);

  // Selected piece for commit
  const selectedPiece = selectedPieceId !== null
    ? myPieces.find((p) => p.id === selectedPieceId)
    : null;

  const handleCellClick = (index: number) => {
    if (ctx.gameover || !isMyTurn) return;

    const pos = indexToPos(index);

    if (selectedAction === 'commit' && selectedPiece && kingPos) {
      if (isValidCommitTarget(selectedPiece.type, kingPos, pos)) {
        moves.commit(selectedPiece.id, pos);
        setSelectedAction(null);
        setSelectedPieceId(null);
      }
    } else if (selectedAction === 'kingStep' && kingPos) {
      if (isValidKingStep(kingPos, pos)) {
        moves.kingStep(pos);
        setSelectedAction(null);
      }
    }
  };

  const handleExecute = () => {
    if (selectedExecutePieces.length > 0) {
      moves.execute(selectedExecutePieces);
      setSelectedAction(null);
      setSelectedExecutePieces([]);
    }
  };

  const handlePass = () => {
    moves.pass();
    setSelectedAction(null);
    setSelectedPieceId(null);
    setSelectedExecutePieces([]);
  };

  const toggleExecutePiece = (pieceId: number) => {
    setSelectedExecutePieces((prev) =>
      prev.includes(pieceId)
        ? prev.filter((id) => id !== pieceId)
        : [...prev, pieceId]
    );
  };

  // Calculate valid cells for current action
  const getValidCells = (): Set<number> => {
    const valid = new Set<number>();
    if (!kingPos) return valid;

    if (selectedAction === 'commit' && selectedPiece) {
      for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const pos = indexToPos(i);
        if (isValidCommitTarget(selectedPiece.type, kingPos, pos)) {
          valid.add(i);
        }
      }
    } else if (selectedAction === 'kingStep') {
      for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const pos = indexToPos(i);
        if (isValidKingStep(kingPos, pos)) {
          valid.add(i);
        }
      }
    }

    return valid;
  };

  const validCells = getValidCells();

  // Status message
  let status: string;
  if (ctx.gameover) {
    status = `Winner: Player ${ctx.gameover.winner === '0' ? '1' : '2'}`;
  } else if (!isMyTurn) {
    status = `Waiting for Player ${ctx.currentPlayer === '0' ? '1' : '2'}`;
  } else {
    status = `Your turn (Player ${currentPlayerId === '0' ? '1' : '2'})`;
  }

  // Render cell content
  const renderCell = (index: number) => {
    const content = G.cells[index];
    const pos = indexToPos(index);
    const isValid = validCells.has(index);

    // Check for committed pieces at this position
    const committedHere = G.committedPieces.filter(
      (cp) => cp.target.x === pos.x && cp.target.y === pos.y
    );

    let cellContent = '';
    let cellColor = '#f5f5dc'; // default tan
    let textColor = '#333';

    if (content === 'king0') {
      cellContent = 'K';
      cellColor = '#4a90d9';
      textColor = '#fff';
    } else if (content === 'king1') {
      cellContent = 'K';
      cellColor = '#d94a4a';
      textColor = '#fff';
    } else if (content === 'pawn') {
      cellContent = 'P';
      cellColor = '#888';
      textColor = '#fff';
    }

    // Show committed pieces
    if (committedHere.length > 0) {
      const cp = committedHere[0];
      cellContent = PIECE_SYMBOLS[cp.type];
      cellColor = cp.playerId === '0' ? '#7ab8e6' : '#e67a7a';
      textColor = '#000';
    }

    // Highlight valid cells
    if (isValid) {
      cellColor = '#90EE90';
    }

    const cellStyle: React.CSSProperties = {
      width: `${CELL_SIZE}px`,
      height: `${CELL_SIZE}px`,
      fontSize: '24px',
      fontWeight: 'bold',
      border: '1px solid #333',
      backgroundColor: cellColor,
      color: textColor,
      cursor: isValid ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    return (
      <div
        key={index}
        style={cellStyle}
        onClick={() => handleCellClick(index)}
      >
        {cellContent}
      </div>
    );
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    margin: '5px',
    fontSize: '14px',
    cursor: 'pointer',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: 'white',
  };

  const pieceButtonStyle = (piece: Piece, isSelected: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    margin: '3px',
    fontSize: '12px',
    cursor: piece.state === 'ready' ? 'pointer' : 'default',
    backgroundColor: isSelected ? '#4CAF50' : piece.state === 'ready' ? '#fff' : '#ccc',
    color: isSelected ? 'white' : '#333',
    border: '1px solid #333',
    opacity: piece.state === 'exhausted' ? 0.5 : 1,
  });

  // Render rows in reverse order (row 7 at top, row 0 at bottom)
  const renderBoard = () => {
    const rows = [];
    for (let y = BOARD_SIZE - 1; y >= 0; y--) {
      const row = [];
      for (let x = 0; x < BOARD_SIZE; x++) {
        row.push(renderCell(y * BOARD_SIZE + x));
      }
      rows.push(<div key={y} style={{ display: 'flex' }}>{row}</div>);
    }
    return rows;
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Mecha Duel</h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>{status}</p>

      {/* Board */}
      <div style={{ marginBottom: '20px' }}>
        {renderBoard()}
      </div>

      {/* Action Buttons */}
      {isMyTurn && !ctx.gameover && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Actions</h3>
          <button
            style={selectedAction === 'commit' ? activeButtonStyle : buttonStyle}
            onClick={() => {
              setSelectedAction('commit');
              setSelectedPieceId(null);
              setSelectedExecutePieces([]);
            }}
            disabled={readyPieces.length === 0}
          >
            Commit
          </button>
          <button
            style={selectedAction === 'execute' ? activeButtonStyle : buttonStyle}
            onClick={() => {
              setSelectedAction('execute');
              setSelectedPieceId(null);
              setSelectedExecutePieces([]);
            }}
            disabled={committedPieces.length === 0}
          >
            Execute
          </button>
          <button
            style={selectedAction === 'kingStep' ? activeButtonStyle : buttonStyle}
            onClick={() => {
              setSelectedAction('kingStep');
              setSelectedPieceId(null);
              setSelectedExecutePieces([]);
            }}
          >
            King Step
          </button>
          <button style={buttonStyle} onClick={handlePass}>
            Pass
          </button>
        </div>
      )}

      {/* Commit: Select Piece */}
      {selectedAction === 'commit' && isMyTurn && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Select Piece to Commit</h3>
          {readyPieces.map((piece) => (
            <button
              key={piece.id}
              style={pieceButtonStyle(piece, selectedPieceId === piece.id)}
              onClick={() => setSelectedPieceId(piece.id)}
            >
              {PIECE_SYMBOLS[piece.type]}
            </button>
          ))}
          {selectedPiece && <p>Click a highlighted cell to commit {PIECE_SYMBOLS[selectedPiece.type]}</p>}
        </div>
      )}

      {/* Execute: Select Pieces */}
      {selectedAction === 'execute' && isMyTurn && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Select Committed Pieces to Execute</h3>
          {committedPieces.map((cp) => (
            <button
              key={cp.pieceId}
              style={pieceButtonStyle(
                { type: cp.type, state: 'committed', id: cp.pieceId },
                selectedExecutePieces.includes(cp.pieceId)
              )}
              onClick={() => toggleExecutePiece(cp.pieceId)}
            >
              {PIECE_SYMBOLS[cp.type]} @ ({cp.target.x},{cp.target.y})
            </button>
          ))}
          {selectedExecutePieces.length > 0 && (
            <button style={activeButtonStyle} onClick={handleExecute}>
              Execute Selected
            </button>
          )}
        </div>
      )}

      {/* King Step instruction */}
      {selectedAction === 'kingStep' && isMyTurn && (
        <p>Click a highlighted cell to move your King</p>
      )}

      {/* Piece Supply */}
      <div style={{ marginTop: '20px' }}>
        <h3>Your Pieces</h3>
        <div>
          <strong>Ready:</strong>{' '}
          {myPieces.filter((p) => p.state === 'ready').map((p) => PIECE_SYMBOLS[p.type]).join(', ') || 'None'}
        </div>
        <div>
          <strong>Committed:</strong>{' '}
          {myPieces.filter((p) => p.state === 'committed').map((p) => PIECE_SYMBOLS[p.type]).join(', ') || 'None'}
        </div>
        <div>
          <strong>Exhausted:</strong>{' '}
          {myPieces.filter((p) => p.state === 'exhausted').map((p) => PIECE_SYMBOLS[p.type]).join(', ') || 'None'}
        </div>
      </div>
    </div>
  );
}
