# Draft: Battle UI Staggered Entrance Animation

## Requirements (confirmed)

- **Goal**: When battle starts, UI elements should appear one-by-one in a staggered sequence
- **Sequence**: Pokemon sprites slide in -> Opponent HP bar -> Player HP bar -> Action buttons
- **Constraint**: Only apply full stagger on battle initialization, not when buttons reappear after being hidden
- **Technology**: Use GSAP (already in project)

## Technical Decisions

- **Approach**: Delay props passed to each component + initial battle entrance flag
  - Reason: Cleanest pattern, maintains component encapsulation, minimal coupling
- **Double battle HP bars**: Group by side (opponents together, then allies together)
  - Reason: Simpler, more intuitive visual grouping
- **Animation timing**: Fast (~900ms total from sprites to action buttons ready)
  - Reason: Keeps gameplay snappy, players don't want to wait
- **Reappearance**: Quick animation without stagger when buttons return from being hidden
  - Reason: Good UX - responsive feel without the initial dramatic entrance

## Research Findings

### Current Component Analysis

| Component       | File                       | Current Animation               | Trigger                                 |
| --------------- | -------------------------- | ------------------------------- | --------------------------------------- |
| Pokemon sprites | Battle.svelte              | `animateEntry()` on image load  | When sprite loads                       |
| HP bars         | FloatingPokemonInfo.svelte | Svelte `fade` transition        | When `spriteReady`                      |
| Action buttons  | SplitActionButtons.svelte  | GSAP `fromTo` with 0.1s stagger | When `spriteReady && show && !disabled` |

### Key Patterns Discovered

1. **Sprite positioning wait pattern**: Both FloatingPokemonInfo and SplitActionButtons use `waitForSpritePosition()` to poll until sprite has valid position
2. **GSAP already in use**: SplitActionButtons has working `animateEntrance()` function with stagger
3. **No centralized sequence controller**: Each component animates independently

### Existing Animation Code

**SplitActionButtons.animateEntrance()** (lines 170-189):

```typescript
gsap.fromTo(
	validButtons,
	{ scale: 0.5, opacity: 0, x: -60 },
	{ scale: 1, opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'back.out(1.4)' }
);
```

**FloatingPokemonInfo** uses Svelte's `transition:fade={{ duration: 200 }}` (line 174)

## Open Questions

- None - requirements are clear from user request

## Scope Boundaries

### INCLUDE

- FloatingPokemonInfo: Add GSAP entrance animation with delay prop
- SplitActionButtons: Add delay prop for initial entrance only
- Battle.svelte: Add sequence coordination logic
- Support both single and double battles

### EXCLUDE

- SplitMoveSelector animation (separate flow, not part of initial battle entrance)
- TargetSelector animation (separate flow)
- Pokemon sprite entry animation (already handled, serves as trigger point)
- Audio synchronization (not requested)

## Proposed Timeline

### Single Battle

```
0ms      - Battle starts, sprites begin loading
~200ms   - Sprites positioned and visible
300ms    - Opponent HP bar animates in (300ms duration)
600ms    - Ally HP bar animates in (300ms duration)
900ms    - Action buttons animate in (with existing 0.1s stagger between buttons)
```

### Double Battle

```
0ms      - Battle starts
~200ms   - Sprites positioned
300ms    - Both opponent HP bars animate in together
600ms    - Both ally HP bars animate in together
900ms    - Action buttons animate in
```

## Implementation Strategy

### Option 2: Delay Props (CHOSEN)

1. **Add `entranceDelay` prop** to FloatingPokemonInfo and SplitActionButtons
2. **Add `isInitialEntrance` flag** to Battle.svelte to distinguish initial load from reappearance
3. **Calculate delays** in Battle.svelte based on battle type and component position
4. **Pass delays as props** to child components
5. **Components delay their animations** by the specified amount

This approach:

- Keeps components decoupled
- Easy to adjust timing
- No complex event system needed
- Components still own their animation logic
