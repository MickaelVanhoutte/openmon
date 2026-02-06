# Draft: Battle UI Positioning Fix

## Requirements (confirmed)

- Fix FloatingPokemonInfo positioning for BOTH 1v1 and 2v2 battles
- FloatingPokemonInfo must be ABOVE its respective Pokemon sprite
- FloatingPokemonInfo panels must NOT overlap each other
- FloatingPokemonInfo panels must NOT go offscreen (even partially)
- FloatingPokemonInfo panels must NOT touch/overlap Pokemon sprites
- FloatingPokemonInfo panels must stay on their side (ally right border < 50% screen width)
- Leader line must point toward CENTER of Pokemon sprite (not top)
- 2v2 needs more spacing between Pokemon pairs
- Reference drawing: .sisyphus/drafts/positioning.png

## Test Strategy Decision

- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: NO
- **Agent-Executed QA**: Playwright visual verification

## Technical Findings

### Current Issues Identified

1. **Opp 1 pushed to screen edge**: CSS `right: calc(18% + var(--offSet) * -18%)` → offSet=1 → right:0%
2. **Leader line targets sprite TOP, not CENTER**: `spriteTopY = rect.top - containerRect.top`
3. **MIN_GAP only 8px**: may not prevent visual touching with leader line
4. **Ally 2v2 spread too tight**: only 15% horizontal spread between ally 0 and ally 1

### Key Files to Modify

- `src/lib/battle/FloatingPokemonInfo.svelte` — Leader line target, collision avoidance, MIN_GAP
- `src/lib/battle/Battle.svelte` — Sprite CSS positioning formulas, fallback position props
- `src/js/battle/animations/position-system.ts` — Animation coordinate grid (keep in sync)

## Scope Boundaries

- INCLUDE: Sprite positions, FloatingPokemonInfo positions, leader line angles, collision avoidance
- EXCLUDE: Battle animations, ActionBar, WeatherOverlay, menu systems, game logic
