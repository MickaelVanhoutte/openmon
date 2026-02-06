# Learnings - Battle UI Positioning

## 2026-02-06 Session Start

- Battle.svelte uses CSS calc() with --offSet variable for sprite positions
- FloatingPokemonInfo.svelte has collision avoidance with 10-iteration loop
- position-system.ts defines animation grid slots separate from CSS positioning
- Leader line currently targets spriteTopY (bug), should target spriteCenterY
- MIN_GAP=8 is too small, plan calls for ~20
- Opponent sprite at offSet=1 goes flush to right edge (right: 0%) - main positioning bug
- GUARDRAILS: Don't touch sprite-position.ts, z-index, skew, collision algo structure, HP polling, entry/faint animations
- Successfully committed sprite CSS position adjustments with exact semantic message.
- Repository follows English Semantic commit style (93% match).
Increased edge margin in FloatingPokemonInfo.svelte from 16 to 28 to account for skewX(-15deg) transform.
