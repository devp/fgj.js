import type { Position } from './Game';

export interface Scenario {
  name: string;
  description: string;
  pawns: Position[];
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
 * Row 5: [ ][ ][P][ ][ ][P][ ][ ]
 * Row 4: [ ][ ][ ][ ][ ][ ][ ][ ]
 * Row 3: [ ][ ][ ][ ][ ][ ][ ][ ]
 * Row 2: [ ][ ][P][ ][ ][P][ ][ ]
 * Row 1: [ ][ ][ ][ ][ ][ ][ ][ ]
 * Row 0: [ ][ ][ ][ ][K0][ ][ ][ ]
 *        0  1  2  3  4  5  6  7
 */
export const simpleScenario: Scenario = {
  name: 'Simple',
  description: 'A basic symmetric layout with minimal pawns',
  pawns: [
    { x: 2, y: 2 },
    { x: 5, y: 2 },
    { x: 2, y: 5 },
    { x: 5, y: 5 },
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
