# Draft: Battle Navigation & Move Info Modal Fix

## Requirements (confirmed)

- 'i' key press should open move info modal for the currently selected move
- Long-touch on a move button should also open move info modal (mobile support)
- Arrow key navigation between action buttons (FIGHT/BAG/POKEMON/RUN) should work in 2D grid
- Arrow key navigation currently only works vertically (up/down) — needs left/right too

## Technical Findings

### Current Action Button Layout (SplitActionButtons)

```
[FIGHT (0)]    [BAG (1)]
   (sprite)
[POKEMON (2)]  [RUN (3)]
```

- ArrowUp/Down: works (linear index, wraps)
- ArrowLeft/Right: SWALLOWED (preventDefault only, no navigation)
- BUG: Can't navigate FIGHT→BAG or POKEMON→RUN

### Current Move Selector (SplitMoveSelector)

- Has 2D grid nav (ArrowLeft/Right = ±2, ArrowUp/Down = ±1)
- Info badge `<div class="info-badge">i</div>` exists visually but has NO click handler
- NO 'i' key listener in handleKeyDown
- NO long-touch/long-press detection

### Move Info Modal

- NO move info modal exists in battle context
- `Modal` component exists in `src/lib/common/Modal.svelte` (Svelte 5, bindable showModal, header/children snippets)
- Move details already displayed in PokedexMoves.svelte — can reuse pattern
- MoveInstance has: name, type, category, power, accuracy, pp, currentPp, description, effect, effectChance, priority, target

### Dual Listener Problem

- Both ActionBar.svelte AND child components listen to window keydown
- Both handle ArrowUp/Down/Enter/Escape → potential double-processing

## Open Questions

- Expected navigation mapping for action buttons (2x2 grid)?
- Should long press threshold be standard (~500ms)?
- Should 'i' key toggle modal or is it press-to-open, any-key-to-close?

## Scope Boundaries

- INCLUDE: Fix arrow nav for action buttons, add 'i' key + long touch for move info, create battle move info modal
- EXCLUDE: Refactoring the dual listener problem (separate concern), overworld controls
