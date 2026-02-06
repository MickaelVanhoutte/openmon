# Draft: FloatingPokemonInfo Positioning Review

## User's Request Summary

Review and fix FloatingPokemonInfo positioning in battle UI, specifically for 2v2 battles.

## Reference Image Analysis (.sisyphus/drafts/positioning.png)

### Desired Layout

| Pokemon                | Position             | FloatingInfo Position | Leader Line Angle         |
| ---------------------- | -------------------- | --------------------- | ------------------------- |
| Player 1 (Front)       | Higher, left         | Above + slightly left | ~135° diagonal down-right |
| Player 2 (Back)        | Lower, right         | Directly above        | 90° vertical              |
| Opponent 1 (Main)      | Center-right, larger | Directly above        | 90° vertical              |
| Opponent 2 (Secondary) | Far right, smaller   | Above + slightly left | ~45° diagonal down-left   |

## User's Explicit Requirements

1. **Spacing**: Space pokemons more in 2v2
2. **Position Above**: FloatingPokemonInfo should be above their respective pokemon
3. **No Overlap**: Info boxes should not touch/overlap each other
4. **No Offscreen**: Should not go offscreen (even partially)
5. **No Sprite Touching**: Should not touch the pokemon sprites
6. **Stay on Side**: Ally info boxes right border shouldn't reach 50% of screen
7. **Leader Line Angle**: Points toward center of pokemon sprite

## Current Implementation Analysis

### FloatingPokemonInfo.svelte

- **WIDGET_HEIGHT**: 80px
- **WIDGET_WIDTH**: 180px
- **MIN_GAP**: 8px (gap between leader-line end and sprite top)
- **Positioning Logic**: `updatePositionFromSprite()`
  - Gets sprite via `getBoundingClientRect()`
  - Places box at `top = spriteTopY - WIDGET_HEIGHT - MIN_GAP`
  - Centers horizontally: `left = spriteCenterX - WIDGET_WIDTH / 2`
  - Collision avoidance with priority (index 0 > index 1)
  - Side boundaries: allies stay in left 50%, opponents in right 50%

### Battle.svelte Sprite CSS (2v2)

```scss
// Ally sprites
bottom: calc(12% + var(--offSet) * 5%); // idx 0: 12%, idx 1: 17%
left: calc(25% + var(--offSet) * -15%); // idx 0: 25%, idx 1: 10%

// Opponent sprites
bottom: calc(22% - (var(--offSet) * -5%)); // idx 0: 22%, idx 1: 27%
right: calc(18% + var(--offSet) * -18%); // idx 0: 18%, idx 1: 0%
```

### Position System (position-system.ts)

Double battle slots:

- `player-0`: { x: 20, y: 70 }
- `player-1`: { x: 40, y: 75 }
- `opponent-0`: { x: 60, y: 20 }
- `opponent-1`: { x: 80, y: 25 }

## Identified Issues

### 1. Sprite Spacing

- Current horizontal spacing for 2v2 may be too tight
- User wants MORE spacing between pokemon in 2v2

### 2. FloatingInfo Positioning

- MIN_GAP = 8px seems small; may appear to "touch" sprite
- Current collision avoidance may need tuning
- No explicit padding from screen edges currently enforced

### 3. Leader Line

- Current calculation uses `atan2(deltaX, deltaY)` - appears correct
- Should verify angles match reference image expectations

## User Decisions (Confirmed)

| Question            | Decision                                                  |
| ------------------- | --------------------------------------------------------- |
| 2v2 Sprite Spacing  | **Yes, increase spacing** - Move idx 1 further from idx 0 |
| Info-to-Sprite Gap  | **Increase to 24-32px** (currently 8px)                   |
| Screen Edge Padding | **~20px** (match widget padding)                          |
| Leader Line Style   | **Also review thickness** - not just angle/position       |

## Scope Definition

### IN SCOPE

1. Adjust 2v2 sprite CSS positions for better horizontal spacing
2. Increase MIN_GAP from 8px to 24-32px
3. Add screen edge padding constraint (20px from edges)
4. Tune collision avoidance to prevent overlap
5. Ensure side boundary constraint (ally stays <50%, opponent stays >50%)
6. Review leader line thickness/visibility
7. Verify leader line angle calculation points to sprite center

### OUT OF SCOPE

- 1v1 battle positioning (focus is 2v2)
- ActionBar positioning
- Pokemon sprite sizes/scaling
- HP bar internals (color, animation, etc.)

## Research Findings

- The system is already dynamic (uses getBoundingClientRect)
- Leader line angle is procedurally calculated using atan2
- Collision avoidance exists but may need parameter tuning
- Side boundary logic already exists in `getSideBounds()` and `isWithinBounds()`
