# Code Review Notepad

## Learnings

### 2026-02-02 - Task 1: ESLint Auto-Fix

- `npm run lint:fix` reduced errors from 1786 to 1128 (658 auto-fixed)
- Main auto-fixes: curly braces, prefer-const violations
- 95 files touched

### 2026-02-02 - Task 2: Manual ESLint Fixes

- Added `import { Howl } from 'howler';` to App.svelte
- Installed @types/node for vitest.config.ts process reference
- Removed unused Position import from game-context.test.ts

### 2026-02-02 - Task 3: ExperienceCalculator Test Fix

- Converted from fetch() to static JSON import
- Pattern: `import xpChartData from '../../assets/data/final/beta/xp-chart.json';`
- Vite handles JSON imports at build time - works in Node and browser
- `ready` flag kept for backward compatibility (set to true immediately)

### 2026-02-02 - Task 4: App.svelte Svelte 5 Migration

- Converted `$:` reactive statements to `$effect()` with cleanup
- Pattern for subscription with cleanup:
  ```typescript
  $effect(() => {
  	if (!gameContext) return;
  	const unsub = gameContext.battleContext.subscribe((value) => {
  		battleCtx = value;
  	});
  	return () => unsub();
  });
  ```
- All variables converted to `$state()` rune

### 2026-02-02 - Task 5: $bindable Fixes

- Changed `bind:context={gameContext}` to `context={gameContext}` (one-way props)
- Components don't write back to parent - bind: was unnecessary
- Same fix for overWorldCtx and battleCtx props

### 2026-02-02 - Task 6: svelte-check Recovery

- svelte-check was NOT hanging due to infinite reactive loop
- It was running out of memory (4GB heap limit reached)
- Fix: `NODE_OPTIONS="--max-old-space-size=8192" npm run check`
- With 8GB memory, completes in ~90 seconds with proper diagnostics
- Remaining errors: SCSS deprecation warnings + unused variables in move-effects.ts (interface signature requirements)

## Decisions

- Kept `ready` flag in ExperienceCalculator for backward compatibility
- Used one-way props instead of $bindable (children don't write back)
- svelte-check requires 8GB memory to complete - add NODE_OPTIONS to package.json

## Issues

- ESLint still at 1128 errors - many are svelte/valid-compile warnings from unused variables
- move-effects.ts has ~150 unused variable errors - these are interface implementations that require full signatures

## Problems

- svelte-check needs NODE_OPTIONS memory increase to work on this codebase
