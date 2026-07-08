# Hex Demo Soccer Board — code plan

## Purpose

A sandbox / scratch board for prototyping game concepts on a hex grid. Unlike
the other games in this repo, it has no turns, scoring, or win conditions — it
is a shared, freely-editable board.

## Files

- `Game.ts` — state, pure helpers (`rowSizes`, `validateConfig`, `makeBoard`,
  `nextChecker`, `nextBackground`) and the boardgame.io definition.
- `Board.tsx` — configuration controls (base size / rows / mode + reset) and the
  hex rendering with tap / long-press interaction.
- `Game.test.ts` — unit tests for the pure board-geometry and validation logic.
- `rules.md` — user-facing description.

## Model

State (`HexDemoState`):

- `baseSize` (X), `rows` (N), `mode` (`'plus'` | `'minus'`)
- `tiles: Tile[][]` indexed `[y][i]`, each `{ checker, bg }`.

Row sizes alternate by parity of Y: even rows = X, odd rows = X ± 1. N must be
odd so row Y and row N-1-Y share a parity and thus a size (vertical symmetry).
`validateConfig` rejects even N, non-integers, non-positive values, and a
`minus` mode that would empty the middle rows.

## boardgame.io notes

- No turn structure is wanted, so `turn.activePlayers = { all: 'play' }` keeps
  every player active in a `play` stage at all times. Moves are shared between
  the top level and the stage so any panel can edit at any time.
- Moves: `cycleChecker(y, i)`, `toggleBackground(y, i)`, `resetBoard(X, N, mode)`.
  `resetBoard` re-validates before mutating.
- `ai.enumerate` returns `[]` — a no-op so the app-level AI toggle can't crash a
  bot on a game that has no meaningful moves to search.

## Rendering

Pointy-top hexagons via CSS `clip-path`. Each row is horizontally centered;
rows overlap vertically by a quarter hex height (`ROW_STEP = HEX_H * 0.75`), so
the ± 1 size difference interlocks the rows. A dark rim is drawn as a slightly
larger hex behind an `inset: 2` face. Long-press is a pointer timer
(`LONG_PRESS_MS`); a plain pointer up within that window counts as a tap.

## Possible future work

- Column/axial coordinate labels for referencing tiles in a real ruleset.
- More checker colors / piece shapes.
- Save / load a board layout (e.g. to localStorage or a shareable hash).
