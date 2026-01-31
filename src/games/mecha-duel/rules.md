# Mecha Duel - Version ALPHA Rules

## Setup
- 8×8 board
- Each player starts with King on opposite ends (row 0 and row 7)
- Scenario determines pawn placement (static obstacles)
- Each player has piece supply: 2 Bishops, 2 Rooks, 2 Knights, 1 Queen (all start Ready)

## Piece States
- **Ready:** Available to commit
- **Committed:** Placed on board as threat
- **Exhausted:** Recently used, unavailable

## Win Condition
- Opponent's King is destroyed when struck by executed attack or stepped on
- Opponent resigns

## Turn Structure
On your turn, choose ONE action:

1. **Commit:** Place one Ready piece on a target square
   - Bishops: any square on a diagonal line from King's current position
   - Rooks: any square on an orthogonal line from King's current position
   - Knights: any square an L-shaped jump from King's current position
   - Queen: any square on a diagonal or orthogonal line from King's current position
   - The committed piece marks the target; the attack direction is determined at execution time

2. **Execute:** Choose one or more Committed pieces to resolve
   - All Strikes (Bishop/Rook/Queen) resolve from King's position at execution time
   - Strike ray-casts from King toward the committed square, destroying first piece hit (opponent's King or pawn)
   - Knights jump King to committed square (must be valid L-jump from current King position at execution time)
   - Knight landing on a pawn destroys the pawn
   - Resolve all chosen Strikes first, then all Knights in order chosen
   - Executed pieces → Exhausted
   - Unchosen Committed pieces → Exhausted (discarded)

3. **KingStep:** Move King 1 square orthogonally or diagonally
   - Can enter pawn squares, destroying the pawn
   - Destroys opponent's King if stepped on
   - All Committed pieces → Exhausted (discarded)

4. **Pass:** Refresh your piece supply
   - All Committed pieces → Exhausted
   - All Exhausted pieces → Ready

## Key Mechanics
- Pawns stop Strike attacks (first obstacle hit destroys the pawn)
- Commit squares are chosen at commit time; attack validity/direction computed at execution time
- Knights: committed square must be a valid L-jump from King's position at execution time (not commit time)
- Multiple Knights can be executed in one turn; they resolve sequentially, each jumping King to its committed square
- All pieces follow cooldown cycle: Ready → Committed → Exhausted → (Pass) → Ready

---

## Clarifications (Implementation Notes)

1. **Commit Targeting:** When committing a piece, you select a target square. For Strikes (Bishop/Rook/Queen), the attack ray-casts from the King's position at execution time toward that target square. This means the King can move (via earlier Knight execution) before a Strike resolves.

2. **Multiple Knights:** You may execute multiple Knights in one Execute action. They resolve sequentially—each jumps the King to its committed square. The second Knight's committed square must be valid from the King's new position after the first Knight resolves.

3. **Knight Validity:** A Knight's committed square is only validated at execution time. If the King has moved such that the committed square is no longer a valid L-jump, that Knight cannot be executed.

4. **Pawn Destruction:** Pawns can be destroyed by:
   - Strike attacks (first piece in the ray path)
   - Knight landing on a pawn square
   - KingStep entering a pawn square

5. **Execution Order:** When executing, all Strikes resolve first (simultaneously), then Knights resolve in the order chosen by the player.

----

Author: Dev Purkayastha, 2026