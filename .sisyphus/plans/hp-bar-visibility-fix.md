# HP Bar Visibility Bug Fix

## TL;DR

> **Quick Summary**: Fix HP bars disappearing when user switches browser tabs and returns during battle
>
> **Deliverables**:
>
> - FloatingPokemonInfo.svelte patched with visibility change handler
>
> **Estimated Effort**: Quick (<15 min)
> **Parallel Execution**: NO
> **Critical Path**: Single fix

---

## Context

### Bug Description

When user switches browser tabs and returns to the game during a battle, the HP bar UI (FloatingPokemonInfo component) sometimes disappears.

### Root Cause

The `FloatingPokemonInfo.svelte` component:

1. Uses GSAP animation that starts with `opacity: 0` (line 227)
2. Relies on `animateEntrance()` to animate opacity to 1
3. Uses `requestAnimationFrame` for sprite position polling (pauses when tab hidden)
4. Has **no visibility change handler** to restore state when tab regains focus

When tab loses focus:

- GSAP animations can pause mid-animation
- rAF callbacks stop firing
- When tab returns, the component may be stuck at `opacity: 0`

---

## TODOs

- [x] 1. Add visibility change handler to FloatingPokemonInfo.svelte

  **What to do**:
  - Add `visibilitychange` event listener in the second `onMount` block (lines 155-172)
  - When `document.visibilityState === 'visible'`, restore container opacity to 1 using `gsap.set()`
  - Clean up listener in the return cleanup function

  **Must NOT do**:
  - Do NOT change any other component logic
  - Do NOT modify the animation entrance timing

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]

  **References**:
  - `src/lib/battle/FloatingPokemonInfo.svelte:155-172` - The onMount block to modify
  - `src/lib/battle/FloatingPokemonInfo.svelte:35-49` - The animateEntrance function using GSAP
  - `src/lib/battle/FloatingPokemonInfo.svelte:227` - Initial `opacity: 0` style

  **Code to add** (inside onMount at line 155, before the return statement):

  ```typescript
  // Fix for tab switch bug: restore opacity when tab regains visibility
  function handleVisibilityChange() {
  	if (document.visibilityState === 'visible' && containerElement && spriteReady) {
  		// GSAP animations can pause when tab is hidden, leaving opacity at 0
  		// Force restore the correct state
  		gsap.set(containerElement, { opacity: 1, y: 0, scale: 1 });
  	}
  }
  document.addEventListener('visibilitychange', handleVisibilityChange);
  ```

  **And add cleanup in return statement**:

  ```typescript
  return () => {
  	window.removeEventListener('resize', updatePositionFromSprite);
  	observer?.disconnect();
  	document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
  ```

  **Acceptance Criteria**:

  ```bash
  # Verify visibilitychange handler added
  grep -c "visibilitychange" src/lib/battle/FloatingPokemonInfo.svelte
  # Assert: >= 2 (addEventListener and removeEventListener)

  # Verify gsap.set usage
  grep -c "gsap.set" src/lib/battle/FloatingPokemonInfo.svelte
  # Assert: >= 1

  # Build passes
  npm run build
  # Assert: Exit code 0
  ```

  **Manual Verification**:
  1. Start dev server: `npm run dev`
  2. Start a battle
  3. Switch to another browser tab for 5+ seconds
  4. Switch back - HP bars should still be visible

  **Commit**: YES
  - Message: `fix(battle): restore HP bar visibility on tab switch using visibilitychange handler`
  - Files: `src/lib/battle/FloatingPokemonInfo.svelte`
  - Pre-commit: `npm run build`

---

## Success Criteria

- [ ] HP bars remain visible when switching browser tabs and returning
- [ ] No console errors related to visibility
- [ ] Build passes
