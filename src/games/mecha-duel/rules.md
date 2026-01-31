# Mecha Game - Version ALPHA Rules

## Setup
- 8×12 board (or 8×8 for faster games)
- Each player starts with King on opposite ends
- Scenario determines pawn placement (static obstacles/stakes)
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

1. **Commit:** Place one Ready piece on a board square showing direction/target
   - Bishops: diagonal lines from King
   - Rooks: orthogonal lines from King
   - Knights: L-shaped landing square from King
   - Queen: diagonal or orthogonal line from King

2. **Execute:** Choose one or more Committed pieces to resolve
   - All Strikes (Bishop/Rook/Queen) resolve from King's current position
   - Strike destroys first piece on its line (opponent's King or pawn)
   - Knights jump King to committed square
   - Resolve all chosen Strikes, then Knight (if chosen)
   - Executed pieces → Exhausted
   - Unchosen Committed pieces → Exhausted (discarded)

3. **KingStep:** Move King 1 square (cannot enter pawn squares)
   - Destroys opponent's King if stepped on
   - All Committed pieces → Exhausted (discarded)

4. **Pass:** Refresh your piece supply
   - All Committed pieces → Exhausted
   - All Exhausted pieces → Ready

## Key Mechanics
- Pawns block King movement and stop Strike attacks (first obstacle hit)
- Commitments lock to board squares when placed
- King can only be in one place (can only execute one Knight per turn)
- All pieces follow cooldown cycle: Ready → Committed → Exhausted → (Pass) → Ready

----

Author: Dev Purkayastha, 2026