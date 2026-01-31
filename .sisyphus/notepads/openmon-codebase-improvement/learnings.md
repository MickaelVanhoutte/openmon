# Learnings - OpenMon Codebase Improvement

## Conventions, Patterns, Best Practices

---

## 2026-01-30: Phase 0 Baselines

### Test Infrastructure

- Vitest configured with 26 test files, 439 tests total
- All tests pass but 2 unhandled rejections exist (async fetch issue in experience.ts)
- Tests are logic-only (battle, animations) - no component tests exist

### TypeScript Check Issue

- `npm run check` (svelte-check) runs out of memory on this codebase
- Use `npm run build` for type validation instead
- This is a resource issue, not a code issue

### File Size Findings

- 10 Svelte files exceed 500 lines (need refactoring)
- ActionBar.svelte is the largest at 1494 lines (CRITICAL)
- move-effects.ts at 6045 lines is explicitly DEFERRED

### CSS Design System Gap (MAJOR)

- Design system exists in `_pixel-art.scss` with 26 tokens
- **Only 1 usage of design tokens in entire codebase!**
- ~450+ hardcoded hex colors found
- Top offenders: #000 (135x), #ffd700 (37x), #143855 (32x)
- Phase 4 will need to migrate these systematically

### Project Commands

```bash
npm run test:run  # 439 tests, ~3.6s
npm run build     # Use this for type checking (check OOMs)
npm run lint      # Clean, only SCSS deprecation warnings
```

---

## 2026-01-30: Phase 1 Characterization Tests

### Test File Locations

- `src/lib/battle/__tests__/ActionBar.test.ts` - 10 test cases
- `src/lib/battle/__tests__/Battle.test.ts` - 8 test cases
- `src/js/__tests__/game-context.test.ts` - 7 test cases

### Key Patterns Documented

**ActionBar State Machine**:

- States: moveOpened, targetSelectOpened, battleSwitchOpened, battleBagOpened, combo, disabled
- menuType derived: battleSwitchOpened ? 'switch' : combo ? 'combo' : 'change'
- Keyboard cycling: options 0-3, moves 0-length
- Escape priority: closes battle menus first, then move selection

**Battle Animation Logic**:

- battleLoopContext: tracks allydrawn, opponentdrawn, bgDrawn states
- Sprite scaling: opponent capped at 0.5, partner 0.1-0.9 range
- Pokemon side logic: initiator isAlly → 'ally', else 'opponent'

**GameContext Utilities**:

- isOutsideQuestBounds: x/y boundary check
- behindPlayerPosition: opposite of facing direction
- haveInSight: 3 tiles in NPC facing direction
- isMenuAvailable: quest 0 objectives → menu unlock mapping

### Test Count Update

- Before: 26 files, 439 tests
- After: 29 files, 464 tests (+25 tests added)

---


## 2026-01-30: Phase 2 Component Splitting (In Progress)

### Task 7: ActionBar Sub-Components Created

Created `src/lib/battle/action-bar/` directory with:
- `MoveSelector.svelte` (~80 lines) - Move list with type colors, PP display
- `TargetSelector.svelte` (~110 lines) - Target selection with effectiveness display
- `ActionMenu.svelte` (~100 lines) - Main action buttons (FIGHT, BAG, POKEMONS, RUN)

All sub-components are TypeScript error-free and follow existing patterns.

### Integration Notes
- Sub-components use Svelte 4 syntax (export let, on:click)
- Callback props pattern for events (onMoveClick, onTargetClick, etc.)
- TypeChart access requires: `typeChart[move.type as keyof typeof typeChart]?.color`
- BattleContext passed as prop for type effectiveness calculations

### Remaining Work
- Full integration into ActionBar.svelte (replace inline templates with components)
- Tasks 8 (Boxes) and 9 (GameContext helpers) still pending

---

## 2026-01-31: Svelte 5 Reactivity Fixes

### Critical Issue: Svelte 5 Fine-Grained Reactivity
Svelte 5's reactivity ONLY detects changes to:
1. `$state()` variables
2. Svelte store subscriptions via `$effect()`

Plain JavaScript object properties are NOT reactive in Svelte 5, even when used with `$derived()`.

### Pattern for TypeScript → Svelte 5 Reactivity

**In TypeScript classes**, add Svelte stores alongside plain properties:
```typescript
import { writable, type Writable } from 'svelte/store';

class MyClass {
    myProperty?: SomeType;
    myProperty$: Writable<SomeType | undefined> = writable(undefined);
    
    updateProperty(value: SomeType) {
        this.myProperty = value;
        this.myProperty$.set(value);
    }
}
```

**In Svelte 5 components**, subscribe to stores via `$effect()`:
```svelte
let localState = $state<SomeType | undefined>(undefined);

$effect(() => {
    const unsub = myClass.myProperty$.subscribe((val) => {
        localState = val;
    });
    return unsub;
});
```

### Files Fixed with This Pattern
- ScriptRunner.ts: Added `playingScript$` store
- Script class: Added `currentAction$` store
- Dialog class: Added `current$` store
- Menu.svelte: Subscribed to all menu stores
- World.svelte: Subscribed to script/action stores
- DialogView.svelte: Subscribed to dialog.current$
- ActionBar.svelte: Converted all local state to `$state()`
- Controls.svelte: Added menuAvailability subscription

### Key Lesson
When migrating to Svelte 5 with `$props()`, you MUST also:
1. Convert local reactive variables from `let x = value` to `let x = $state(value)`
2. Subscribe to TypeScript class state via `$effect()` + stores

## 2026-01-31: Final Session Summary

### Completed Tasks
All 25 tasks from the codebase improvement plan are now complete:

1. **Phase 0 (Dependency Cleanup)**: Removed lodash, standardized on native JS
2. **Phase 1 (TypeScript Improvements)**: JSDoc migration, @ts-ignore removal
3. **Phase 2 (Svelte 5 Migration)**: Full migration to runes syntax ($props, $state, $derived, $effect)
4. **Phase 3 (Critical Rune Fixes)**: Fixed reactivity issues breaking menus, dialogs, battles
5. **Phase 4 (CSS Design System)**: 209 design token usages added
6. **Phase 5 (Cleanup)**: Console.log removal, accessibility improvements

### Critical Svelte 5 Migration Lessons

**Pattern: TypeScript Class → Svelte 5 Reactivity**

Problem: Svelte 5 fine-grained reactivity only detects:
- `$state()` variable changes
- Svelte store subscriptions

Plain object/class properties are NOT reactive!

Solution: Dual-property pattern:
```typescript
// In TypeScript class
class MyClass {
    myProperty?: T;                              // For internal use
    myProperty$: Writable<T> = writable();       // For Svelte reactivity
    
    updateProperty(value: T) {
        this.myProperty = value;
        this.myProperty$.set(value);  // MUST update both!
    }
}

// In Svelte 5 component
let localState = $state<T>(undefined);

$effect(() => {
    const unsub = myClass.myProperty$.subscribe(v => { localState = v; });
    return unsub;
});
```

### Stores Added This Session
- `ScriptRunner.playingScript$` - Script start/end detection
- `Script.currentAction$` - Action progression detection  
- `Dialog.current$` - Message change detection
- `GameContext.menuAvailability$` - Menu unlock detection

### Other Fixes
- `openMenu()` now sets `isPaused=true` for ALL menu types
- Battle sprite reuse now clears GSAP transforms with `clearProps: 'all'`
- `GameContext.validateQuestObjective()` now triggers menu availability update

### Final Metrics
- Build: Succeeds
- Tests: 494/494 pass
- Svelte 5: 0 `export let` remaining
- CSS Tokens: 209 usages
- @ts-ignore: 0 remaining
- Active console.log: 0 remaining
