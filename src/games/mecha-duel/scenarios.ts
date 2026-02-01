import type { Position } from './Game';

export interface PawnPlacement {
  position: Position;
  player: '0' | '1';
}

export interface Scenario {
  name: string;
  description: string;
  pawns: PawnPlacement[];
  kingPositions: {
    '0': Position;
    '1': Position;
  };
}

/**
 * Simple scenario with minimal symmetric pawn placement.
 * Good for learning the game mechanics.
 *
 * Layout (8x8):
 * Row 7: [ ][ ][ ][ ][K1][ ][ ][ ]
 * Row 6: [ ][ ][ ][ ][ ][ ][ ][ ]
 * Row 5: [ ][ ][p1][ ][ ][p1][ ][ ]   (Player 1's pawns)
 * Row 4: [ ][ ][ ][ ][ ][ ][ ][ ]
 * Row 3: [ ][ ][ ][ ][ ][ ][ ][ ]
 * Row 2: [ ][ ][p0][ ][ ][p0][ ][ ]   (Player 0's pawns)
 * Row 1: [ ][ ][ ][ ][ ][ ][ ][ ]
 * Row 0: [ ][ ][ ][ ][K0][ ][ ][ ]
 *        0  1  2  3  4  5  6  7
 */
export const simpleScenario: Scenario = {
  name: 'Simple',
  description: 'A basic symmetric layout with minimal pawns',
  pawns: [
    { position: { x: 2, y: 2 }, player: '0' },
    { position: { x: 5, y: 2 }, player: '0' },
    { position: { x: 2, y: 5 }, player: '1' },
    { position: { x: 5, y: 5 }, player: '1' },
  ],
  kingPositions: {
    '0': { x: 4, y: 0 },
    '1': { x: 4, y: 7 },
  },
};

export const scenarios: Record<string, Scenario> = {
  simple: simpleScenario,
};

export const defaultScenarioId = 'simple';

export function getScenario(id: string): Scenario {
  return scenarios[id] ?? scenarios[defaultScenarioId];
}
