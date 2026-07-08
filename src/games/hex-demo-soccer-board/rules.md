# Hex Demo Soccer Board

This is not a competitive game — it is a sandbox for prototyping game concepts
on a hexagonal board. There are no turns, players, or win conditions. Both
player panels share and edit the same board.

## The board

A symmetric hexagonal board built from these controls:

- **Base rows (X)** — the number of tiles in the top row (row 0) and the bottom
  row (row N-1).
- **Rows (N)** — the total number of rows. Must be **odd** so the top and bottom
  rows match; an even count is rejected.
- **Middle rows** — whether the alternating (odd-indexed) rows are **X + 1**
  (bulging out) or **X − 1** (tucking in).

Row sizes alternate by their vertical index Y:

- Even rows (0, 2, 4, …) have **X** tiles.
- Odd rows (1, 3, 5, …) have **X + 1** or **X − 1** tiles depending on the mode.

Because N is odd, every row Y has the same size as row N-1-Y, so the board is
vertically symmetric.

## Interacting with tiles

- **Tap / click a tile** to cycle its checker: clear → red → blue → black → clear.
- **Long-press a tile** (or **right-click** on desktop) to toggle its background
  between white and gray.

## Reset

The **Reset board** button rebuilds an empty board (all tiles clear and white)
using the current Base / Rows / Middle-rows settings. Invalid configurations
(such as an even row count) are rejected with an error message.
