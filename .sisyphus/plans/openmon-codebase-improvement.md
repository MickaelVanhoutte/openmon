# OpenMon Codebase Improvement Plan

## TL;DR

> **Quick Summary**: Comprehensive codebase modernization of OpenMon (Pokemon web game) covering component refactoring, Svelte 5 migration, CSS design system adoption, accessibility improvements, and code quality cleanup.
>
> **Deliverables**:
>
> - All large components split to <300 lines
> - 100% Svelte 5 runes migration (38 components)
> - CSS design system consistently used across all components
> - ARIA labels and roles on all interactive elements
> - Zero @ts-ignore, zero debug console.log statements
> - Characterization tests for all refactored components
>
> **Estimated Effort**: XL (multi-week project)
> **Parallel Execution**: YES - 6 phases with parallel tasks within phases
> **Critical Path**: Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

---

## Context

### Original Request

User requested a comprehensive project audit and improvement plan for OpenMon, a Pokemon web game built with Svelte 5 and TypeScript.

### Interview Summary

**Key Discussions**:

- **Priority 1**: Component Refactoring - Split god classes (GameContext 774 lines, ActionBar 1,494 lines)
- **Priority 2**: CSS/Design System - Use existing `_pixel-art.scss` consistently
- **Full Svelte 5 Migration**: Breaking changes acceptable for codebase modernization
- **Landscape Only**: Minimum 568px viewport (game forces landscape)
- **Tests Before Refactoring**: Characterization tests as safety net

**Research Findings**:

- 38 Svelte files, 98 TypeScript files
- `move-effects.ts` is 6,045 lines (largest file - DEFERRED to separate plan)
- `ActionBar.svelte` is 1,494 lines (critical battle UI component)
- Only 28% of components migrated to Svelte 5 runes
- Design system exists but only 1 component uses it!
- 29 @ts-ignore, 28 console.log statements
- Only 3 components have any ARIA labels
- Zero component tests, only logic tests

### Metis Review

**Identified Gaps** (addressed):

- **move-effects.ts** (6,045 lines) explicitly DEFERRED - too large for this plan
- **Migration order critical**: Parent components BEFORE children for Svelte 5
- **CSS scoping risk**: Extract shared styles to design system before splitting
- **Store subscription patterns**: Clarified to keep writable stores for contexts

---

## Work Objectives

### Core Objective

Modernize the OpenMon codebase by refactoring oversized components, completing Svelte 5 migration, unifying CSS under the design system, and adding accessibility - all while maintaining existing functionality through characterization tests.

### Concrete Deliverables

- `ActionBar.svelte` split into 4+ focused components (<300 lines each)
- `GameContext.ts` helper methods extracted to utility classes
- All 38 Svelte components using Svelte 5 runes syntax
- All components using CSS custom properties from `_pixel-art.scss`
- All interactive elements have ARIA labels/roles
- All @ts-ignore comments resolved with proper types
- All debug console.log statements removed

### Definition of Done

- [ ] `npm run check` exits with code 0
- [ ] `npm run test:run` passes (baseline + new tests)
- [ ] `npm run lint` exits with code 0
- [ ] No file exceeds 500 lines (except `move-effects.ts` which is deferred)
- [ ] `grep -c "export let" src/lib/**/*.svelte` returns 0
- [ ] `grep -c "@ts-ignore" src/**/*.ts` returns 0

### Must Have

- Characterization tests BEFORE any refactoring
- Svelte 5 migration in correct order (parents before children)
- CSS changes validated with visual inspection
- All existing functionality preserved

### Must NOT Have (Guardrails)

- DO NOT touch `move-effects.ts` (6,045 lines) - explicitly deferred
- DO NOT change battle calculation logic
- DO NOT add new game features or content
- DO NOT optimize canvas rendering performance
- DO NOT migrate parent component AFTER child (breaks Svelte 5)
- DO NOT remove @ts-ignore without fixing underlying type issue
- DO NOT create any new file >300 lines
- DO NOT leave any existing file >500 lines after refactoring

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest configured)
- **User wants tests**: Tests Before Refactoring
- **Framework**: Vitest (already configured in project)

### Strategy: Characterization Tests First

Each major component gets characterization tests BEFORE refactoring:

**Test Pattern:**

1. Write test that captures CURRENT behavior (not intended behavior)
2. Test should pass before ANY changes
3. Test becomes regression safety net during refactoring
4. If test breaks after refactoring, behavior changed - investigate

**Verification Commands:**

```bash
# Run full test suite
npm run test:run

# Run specific test file
npm run test:run -- src/js/__tests__/[test-file].test.ts

# TypeScript validation
npm run check

# Linting
npm run lint
```

---

## Execution Strategy

### Parallel Execution Waves

```
Phase 0: Baselines (Wave 1 - Start Immediately)
├── Task 1: Capture test baseline
├── Task 2: Document component sizes
└── Task 3: Document CSS token usage

Phase 1: Characterization Tests (Wave 2 - After Phase 0)
├── Task 4: ActionBar tests (parallel)
├── Task 5: Battle tests (parallel)
└── Task 6: GameContext tests (parallel)

Phase 2: Component Splitting (Wave 3 - After Phase 1)
├── Task 7: Split ActionBar.svelte
├── Task 8: Split Boxes.svelte
└── Task 9: Extract GameContext helpers

Phase 3: Svelte 5 Migration (Wave 4 - After Phase 2)
├── Task 10-18: Migrate components (batches of 3)

Phase 4: CSS Design System (Wave 5 - After Phase 3)
├── Task 19-22: Apply design tokens per domain

Phase 5: Accessibility + Cleanup (Wave 6 - After Phase 4)
├── Task 23: Add ARIA labels
├── Task 24: Remove @ts-ignore
└── Task 25: Remove console.log
```

### Dependency Matrix

| Task  | Depends On | Blocks | Can Parallelize With |
| ----- | ---------- | ------ | -------------------- |
| 1-3   | None       | 4-6    | Each other           |
| 4-6   | 1-3        | 7-9    | Each other           |
| 7-9   | 4-6        | 10+    | Each other           |
| 10-18 | 7-9        | 19+    | Within batches       |
| 19-22 | 10-18      | 23+    | Each other           |
| 23-25 | 19-22      | None   | Each other           |

---

## TODOs

---

### PHASE 0: BASELINES

- [x] 1. Capture Test and Build Baseline

  **What to do**:
  - Run `npm run test:run` and record passing/failing test counts
  - Run `npm run check` and record any TypeScript errors
  - Run `npm run lint` and record any linting errors
  - Create `.sisyphus/evidence/baseline.md` with all results

  **Must NOT do**:
  - Do not fix any issues - only document current state

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple command execution and documentation task
  - **Skills**: [`git-master`]
    - `git-master`: May need to check git status, ensure clean state

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 0 (with Tasks 2, 3)
  - **Blocks**: All Phase 1+ tasks
  - **Blocked By**: None

  **References**:
  - `package.json:scripts` - Available npm commands
  - `vitest.config.ts` - Test configuration

  **Acceptance Criteria**:

  ```bash
  # Verify baseline file exists
  cat .sisyphus/evidence/baseline.md
  # Assert: Contains "Test Results:", "TypeScript Check:", "Lint Results:"

  # Verify tests run
  npm run test:run 2>&1 | tail -5
  # Assert: Shows test summary
  ```

  **Commit**: YES
  - Message: `chore(baseline): capture initial test and lint baselines`
  - Files: `.sisyphus/evidence/baseline.md`
  - Pre-commit: `npm run test:run`

---

- [x] 2. Document Component Sizes

  **What to do**:
  - Count lines in all Svelte components
  - Count lines in key TypeScript files
  - Create `.sisyphus/evidence/component-sizes.md` with sorted list
  - Flag all files >500 lines

  **Must NOT do**:
  - Do not modify any files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple file analysis task
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 0 (with Tasks 1, 3)
  - **Blocks**: Phase 1+ tasks
  - **Blocked By**: None

  **References**:
  - `src/lib/**/*.svelte` - All Svelte components
  - `src/js/**/*.ts` - All TypeScript files

  **Acceptance Criteria**:

  ```bash
  cat .sisyphus/evidence/component-sizes.md | grep "ActionBar"
  # Assert: Shows ~1494 lines

  cat .sisyphus/evidence/component-sizes.md | grep ">500"
  # Assert: Lists flagged files
  ```

  **Commit**: YES (group with Task 1)
  - Message: `chore(baseline): capture initial test and lint baselines`
  - Files: `.sisyphus/evidence/component-sizes.md`

---

- [x] 3. Document CSS Token Usage

  **What to do**:
  - List all CSS custom properties in `_pixel-art.scss`
  - Count usage of each token across components
  - Count hardcoded colors (#xxx patterns) in components
  - Create `.sisyphus/evidence/css-usage.md`

  **Must NOT do**:
  - Do not modify any files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple grep and documentation task
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 0 (with Tasks 1, 2)
  - **Blocks**: Phase 4 tasks
  - **Blocked By**: None

  **References**:
  - `src/styles/_pixel-art.scss:1-150` - Design system definitions
  - `src/lib/**/*.svelte` - Component styles

  **Acceptance Criteria**:

  ```bash
  cat .sisyphus/evidence/css-usage.md | grep "pixel-bg-primary"
  # Assert: Shows usage count

  cat .sisyphus/evidence/css-usage.md | grep "Hardcoded Colors"
  # Assert: Shows count of #xxx patterns
  ```

  **Commit**: YES (group with Tasks 1, 2)

---

### PHASE 1: CHARACTERIZATION TESTS

- [x] 4. Write Characterization Tests for ActionBar

  **What to do**:
  - Create `src/js/__tests__/action-bar.test.ts`
  - Test current behavior of ActionBar.svelte:
    - Move selection flow
    - Target selection flow
    - Item usage flow
    - Pokemon switch flow
  - Tests must PASS with current implementation

  **Must NOT do**:
  - Do not change ActionBar.svelte
  - Do not test "intended" behavior - only current behavior

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex test writing requiring understanding of battle UI
  - **Skills**: [`playwright`]
    - `playwright`: Component testing may benefit from browser automation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 5, 6)
  - **Blocks**: Task 7 (ActionBar split)
  - **Blocked By**: Tasks 1-3

  **References**:
  **Pattern References**:
  - `src/js/__tests__/battle/animations.test.ts` - Existing test patterns
  - `src/js/__tests__/battle/damage.test.ts` - Battle logic test examples

  **API/Type References**:
  - `src/lib/battle/ActionBar.svelte:1-100` - Component props and state
  - `src/js/context/battleContext.ts` - Battle state interface

  **Acceptance Criteria**:

  ```bash
  npm run test:run -- src/js/__tests__/action-bar.test.ts
  # Assert: All tests pass
  # Assert: At least 4 test cases (move, target, item, switch)

  grep -c "describe\|it\|test" src/js/__tests__/action-bar.test.ts
  # Assert: >= 8 (at least 4 describes/tests)
  ```

  **Commit**: YES
  - Message: `test(battle): add characterization tests for ActionBar`
  - Files: `src/js/__tests__/action-bar.test.ts`
  - Pre-commit: `npm run test:run`

---

- [x] 5. Write Characterization Tests for Battle Component

  **What to do**:
  - Create `src/js/__tests__/battle-component.test.ts`
  - Test Battle.svelte behavior:
    - Battle start/end flows
    - Turn execution
    - Win/loss conditions
  - Tests must PASS with current implementation

  **Must NOT do**:
  - Do not change Battle.svelte
  - Do not duplicate existing battle logic tests

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex test writing for battle system
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 4, 6)
  - **Blocks**: Task 8 (Battle refactoring)
  - **Blocked By**: Tasks 1-3

  **References**:
  - `src/lib/battle/Battle.svelte:1-100` - Component structure
  - `src/js/__tests__/battle/*.test.ts` - Existing battle tests

  **Acceptance Criteria**:

  ```bash
  npm run test:run -- src/js/__tests__/battle-component.test.ts
  # Assert: All tests pass

  grep -c "describe\|it\|test" src/js/__tests__/battle-component.test.ts
  # Assert: >= 6
  ```

  **Commit**: YES
  - Message: `test(battle): add characterization tests for Battle component`
  - Files: `src/js/__tests__/battle-component.test.ts`

---

- [x] 6. Write Characterization Tests for GameContext

  **What to do**:
  - Create `src/js/__tests__/game-context.test.ts`
  - Test GameContext.ts behavior:
    - State initialization
    - Save/load integration
    - Context transitions (world ↔ battle)
  - Tests must PASS with current implementation

  **Must NOT do**:
  - Do not change GameContext.ts

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex state management testing
  - **Skills**: []
    - No browser needed for context tests

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 4, 5)
  - **Blocks**: Task 9 (GameContext refactoring)
  - **Blocked By**: Tasks 1-3

  **References**:
  - `src/js/context/gameContext.ts:1-200` - Context implementation
  - `src/js/context/saveContext.ts` - Save/load interface

  **Acceptance Criteria**:

  ```bash
  npm run test:run -- src/js/__tests__/game-context.test.ts
  # Assert: All tests pass

  grep -c "describe\|it\|test" src/js/__tests__/game-context.test.ts
  # Assert: >= 6
  ```

  **Commit**: YES
  - Message: `test(context): add characterization tests for GameContext`
  - Files: `src/js/__tests__/game-context.test.ts`

---

### PHASE 2: COMPONENT SPLITTING

- [x] 7. Split ActionBar.svelte into Focused Components

  **What to do**:
  - Create `src/lib/battle/action-bar/` directory
  - Extract components:
    - `MoveSelector.svelte` - Move selection UI
    - `TargetSelector.svelte` - Target selection UI
    - `ItemMenu.svelte` - Item usage UI
    - `SwitchMenu.svelte` - Pokemon switch UI
    - `ActionBar.svelte` - Parent container (orchestration only)
  - Each component <300 lines
  - Update imports in Battle.svelte

  **Must NOT do**:
  - Do not change battle logic
  - Do not create files >300 lines
  - Do not break existing tests

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component splitting requires understanding of visual structure
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Component architecture and prop passing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8, 9)
  - **Blocks**: Svelte 5 migration of these components
  - **Blocked By**: Task 4 (characterization tests)

  **References**:
  **Pattern References**:
  - `src/lib/common/Modal.svelte` - Svelte 5 component pattern to follow
  - `src/lib/battle/AllyInfo.svelte` - Battle component prop pattern

  **Current Implementation**:
  - `src/lib/battle/ActionBar.svelte:1-1494` - Full file to split

  **Acceptance Criteria**:

  ```bash
  ls src/lib/battle/action-bar/
  # Assert: Contains MoveSelector.svelte, TargetSelector.svelte, ItemMenu.svelte, SwitchMenu.svelte, ActionBar.svelte

  wc -l src/lib/battle/action-bar/*.svelte | grep -v total | awk '{if($1>300) print "FAIL: "$2" has "$1" lines"}'
  # Assert: No output (all files <300 lines)

  npm run check
  # Assert: Exit code 0

  npm run test:run -- src/js/__tests__/action-bar.test.ts
  # Assert: All characterization tests still pass
  ```

  **Commit**: YES
  - Message: `refactor(battle): split ActionBar into focused components`
  - Files: `src/lib/battle/action-bar/*.svelte`, `src/lib/battle/Battle.svelte`
  - Pre-commit: `npm run check && npm run test:run`

---

- [x] 8. Split Boxes.svelte into Focused Components

  **What to do**:
  - Create `src/lib/menus/boxes/` directory
  - Extract components:
    - `BoxGrid.svelte` - 5x4 grid display
    - `BoxSlot.svelte` - Individual slot
    - `BoxNavigation.svelte` - Box switching arrows
    - `Boxes.svelte` - Parent container
  - Each component <300 lines

  **Must NOT do**:
  - Do not change box storage logic
  - Do not break keyboard navigation (already fixed)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component splitting
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9)
  - **Blocks**: Svelte 5 migration of these components
  - **Blocked By**: Phase 1 completion

  **References**:
  - `src/lib/menus/Boxes.svelte:1-801` - Current implementation
  - `src/lib/menus/boxes/*.svelte` - May already have some components

  **Acceptance Criteria**:

  ```bash
  ls src/lib/menus/boxes/
  # Assert: Contains BoxGrid.svelte, BoxSlot.svelte, BoxNavigation.svelte, Boxes.svelte

  wc -l src/lib/menus/boxes/*.svelte | grep -v total | awk '{if($1>300) print "FAIL: "$2}'
  # Assert: No output

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `refactor(menus): split Boxes into focused components`
  - Files: `src/lib/menus/boxes/*.svelte`

---

- [x] 9. Extract GameContext Helper Methods

  **What to do**:
  - Create utility files:
    - `src/js/context/helpers/battle-helpers.ts` - Battle-related methods
    - `src/js/context/helpers/movement-helpers.ts` - Movement methods
    - `src/js/context/helpers/time-helpers.ts` - Time-of-day methods
  - GameContext.ts should delegate to helpers
  - Keep GameContext.ts as orchestrator <500 lines

  **Must NOT do**:
  - Do not change state management pattern (keep writable stores)
  - Do not break save/load functionality

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex refactoring of core state management
  - **Skills**: []
    - TypeScript refactoring

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8)
  - **Blocks**: None (GameContext stays TypeScript, not Svelte)
  - **Blocked By**: Task 6 (characterization tests)

  **References**:
  - `src/js/context/gameContext.ts:1-774` - Current implementation
  - `src/js/context/battleContext.ts` - Related context pattern

  **Acceptance Criteria**:

  ```bash
  wc -l src/js/context/gameContext.ts
  # Assert: <500 lines

  ls src/js/context/helpers/
  # Assert: Contains battle-helpers.ts, movement-helpers.ts, time-helpers.ts

  npm run check
  # Assert: Exit code 0

  npm run test:run -- src/js/__tests__/game-context.test.ts
  # Assert: All characterization tests still pass
  ```

  **Commit**: YES
  - Message: `refactor(context): extract GameContext helper methods`
  - Files: `src/js/context/gameContext.ts`, `src/js/context/helpers/*.ts`

---

### PHASE 3: SVELTE 5 MIGRATION

Migration order is CRITICAL: Parent components must be migrated BEFORE children.

- [x] 10. Migrate Battle Domain Components (Batch 1)

  **What to do**:
  - Migrate to Svelte 5 runes:
    - `Battle.svelte` (parent first)
    - `BattleBackground.svelte`
    - `BattleGround.svelte`
  - Replace `export let` → `$props()`
  - Replace `$:` → `$derived()` or `$effect()`
  - Replace `on:click` → `onclick`
  - Replace `<slot>` → `{@render children()}`

  **Must NOT do**:
  - Do not migrate child components before parents
  - Do not change component behavior

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Syntax migration requires careful transformation
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Svelte component patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential within Phase 3)
  - **Parallel Group**: Wave 3 - Batch 1
  - **Blocks**: Batch 2 migrations
  - **Blocked By**: Phase 2 completion

  **References**:
  **Pattern References**:
  - `src/lib/common/Modal.svelte:1-50` - Svelte 5 runes pattern
  - `src/lib/common/DialogView.svelte:1-50` - Props pattern

  **Migration Guide**:

  ```svelte
  <!-- Svelte 4 -->
  <script lang="ts">
    export let name: string;
    $: greeting = `Hello ${name}`;
  </script>
  <button on:click={handler}>

  <!-- Svelte 5 -->
  <script lang="ts">
    interface Props { name: string; }
    let { name }: Props = $props();
    let greeting = $derived(`Hello ${name}`);
  </script>
  <button onclick={handler}>
  ```

  **Acceptance Criteria**:

  ```bash
  grep -c "export let" src/lib/battle/Battle.svelte
  # Assert: 0

  grep -c "\$props()" src/lib/battle/Battle.svelte
  # Assert: >= 1

  npm run check
  # Assert: Exit code 0

  npm run test:run
  # Assert: All tests pass
  ```

  **Commit**: YES
  - Message: `feat(battle): migrate Battle domain to Svelte 5 runes`
  - Files: `src/lib/battle/Battle.svelte`, `src/lib/battle/BattleBackground.svelte`, `src/lib/battle/BattleGround.svelte`

---

- [x] 11. Migrate Battle Info Components (Batch 2)

  **What to do**:
  - Migrate to Svelte 5 runes:
    - `AllyInfo.svelte` (may already be done - verify)
    - `EnemyInfo.svelte` (may already be done - verify)
    - `StatusIcon.svelte`
    - `TypeBadge.svelte`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Smaller components, some may already be migrated
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential within Phase 3)
  - **Parallel Group**: Wave 3 - Batch 2
  - **Blocks**: Batch 3
  - **Blocked By**: Batch 1

  **References**:
  - `src/lib/battle/AllyInfo.svelte` - May already use runes
  - `src/lib/battle/EnemyInfo.svelte` - May already use runes

  **Acceptance Criteria**:

  ```bash
  grep -c "export let" src/lib/battle/AllyInfo.svelte src/lib/battle/EnemyInfo.svelte
  # Assert: 0 for each

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(battle): migrate battle info components to Svelte 5 runes`

---

- [x] 12. Migrate ActionBar Split Components (Batch 3)

  **What to do**:
  - Migrate all components in `src/lib/battle/action-bar/`:
    - `ActionBar.svelte` (parent first)
    - `MoveSelector.svelte`
    - `TargetSelector.svelte`
    - `ItemMenu.svelte`
    - `SwitchMenu.svelte`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple related components
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 - Batch 3
  - **Blocks**: Batch 4
  - **Blocked By**: Batch 2

  **References**:
  - `src/lib/battle/action-bar/*.svelte` - All split components

  **Acceptance Criteria**:

  ```bash
  grep -r "export let" src/lib/battle/action-bar/
  # Assert: No output

  npm run check && npm run test:run
  # Assert: All pass
  ```

  **Commit**: YES
  - Message: `feat(battle): migrate action-bar components to Svelte 5 runes`

---

- [x] 13. Migrate Menu Components (Batch 4)

  **What to do**:
  - Migrate menu components:
    - `Pokedex.svelte`
    - `PokedexEntry.svelte`
    - `Bag.svelte` (may already be done)
    - `PokemonList.svelte`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple menu components
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 - Batch 4
  - **Blocks**: Batch 5
  - **Blocked By**: Batch 3

  **References**:
  - `src/lib/menus/*.svelte` - Menu components

  **Acceptance Criteria**:

  ```bash
  grep -c "export let" src/lib/menus/Pokedex.svelte src/lib/menus/Bag.svelte
  # Assert: 0 for each

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(menus): migrate menu components to Svelte 5 runes`

---

- [x] 14. Migrate Boxes Split Components (Batch 5)

  **What to do**:
  - Migrate all components in `src/lib/menus/boxes/`:
    - `Boxes.svelte` (parent first)
    - `BoxGrid.svelte`
    - `BoxSlot.svelte`
    - `BoxNavigation.svelte`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Smaller split components
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 - Batch 5
  - **Blocks**: Batch 6
  - **Blocked By**: Batch 4

  **References**:
  - `src/lib/menus/boxes/*.svelte`

  **Acceptance Criteria**:

  ```bash
  grep -r "export let" src/lib/menus/boxes/
  # Assert: No output

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(menus): migrate boxes components to Svelte 5 runes`

---

- [x] 15. Migrate World Components (Batch 6)

  **What to do**:
  - Migrate world components:
    - `World.svelte`
    - `Controls.svelte`
    - `Joystick.svelte`
    - `Menu.svelte`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Large World.svelte component
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 - Batch 6
  - **Blocks**: Batch 7
  - **Blocked By**: Batch 5

  **References**:
  - `src/lib/world/*.svelte`

  **Acceptance Criteria**:

  ```bash
  grep -c "export let" src/lib/world/World.svelte src/lib/world/Controls.svelte
  # Assert: 0 for each

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(world): migrate world components to Svelte 5 runes`

---

- [x] 16. Migrate Common Components (Batch 7)

  **What to do**:
  - Migrate remaining common components:
    - Already done: `Modal.svelte`, `DialogView.svelte`
    - Migrate: Any remaining in `src/lib/common/`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Many already migrated
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 - Batch 7
  - **Blocks**: Batch 8
  - **Blocked By**: Batch 6

  **References**:
  - `src/lib/common/*.svelte`

  **Acceptance Criteria**:

  ```bash
  grep -r "export let" src/lib/common/
  # Assert: No output

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(common): migrate remaining common components to Svelte 5 runes`

---

- [x] 17. Migrate Save/Load Components (Batch 8)

  **What to do**:
  - Migrate save/load components:
    - `LoadSave.svelte`
    - `SaveSlot.svelte`
    - Any other in `src/lib/saves/`

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small focused components
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 - Batch 8
  - **Blocks**: Batch 9
  - **Blocked By**: Batch 7

  **References**:
  - `src/lib/saves/*.svelte`

  **Acceptance Criteria**:

  ```bash
  grep -r "export let" src/lib/saves/
  # Assert: No output

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(saves): migrate save/load components to Svelte 5 runes`

---

- [x] 18. Migrate App.svelte and Remaining Components (Batch 9 - Final)

  **What to do**:
  - Migrate root component:
    - `App.svelte`
    - `Intro.svelte`
    - Any remaining unmigrated components

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Root component affects everything
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 - Batch 9 (Final)
  - **Blocks**: Phase 4
  - **Blocked By**: All previous batches

  **References**:
  - `src/App.svelte`
  - `src/lib/Intro.svelte`

  **Acceptance Criteria**:

  ```bash
  # Verify NO export let anywhere
  grep -r "export let" src/lib/ src/App.svelte
  # Assert: No output

  npm run check
  # Assert: Exit code 0

  npm run test:run
  # Assert: All tests pass
  ```

  **Commit**: YES
  - Message: `feat(app): complete Svelte 5 migration`

---

### PHASE 4: CSS DESIGN SYSTEM

- [x] 19. Apply Design System to Battle Components

  **What to do**:
  - Replace hardcoded colors with CSS custom properties
  - Use mixins from `_pixel-art.scss`
  - Apply utility classes where appropriate
  - Document color mappings

  **Must NOT do**:
  - Do not change visual appearance (colors should match existing)
  - Do not add new colors to design system yet

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS styling work
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 20, 21, 22)
  - **Blocks**: Phase 5
  - **Blocked By**: Phase 3 completion

  **References**:
  - `src/styles/_pixel-art.scss:1-150` - Design system definitions
  - `src/lib/battle/**/*.svelte` - All battle components

  **Acceptance Criteria**:

  ```bash
  grep -E "#[0-9a-fA-F]{3,6}" src/lib/battle/*.svelte src/lib/battle/**/*.svelte
  # Assert: No hardcoded colors (or minimal exceptions documented)

  grep -c "var(--pixel-" src/lib/battle/Battle.svelte
  # Assert: >= 3 (uses CSS custom properties)

  # Visual verification: dev server shows same colors as before
  npm run dev
  # Open http://localhost:5173, enter battle, verify colors match
  ```

  **Commit**: YES
  - Message: `style(battle): apply design system tokens`

---

- [x] 20. Apply Design System to Menu Components

  **What to do**:
  - Replace hardcoded colors in menu components
  - Use design system tokens
  - Apply consistent spacing/typography

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS styling work
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 19, 21, 22)
  - **Blocks**: Phase 5
  - **Blocked By**: Phase 3 completion

  **References**:
  - `src/styles/_pixel-art.scss`
  - `src/lib/menus/**/*.svelte`

  **Acceptance Criteria**:

  ```bash
  grep -E "#[0-9a-fA-F]{3,6}" src/lib/menus/*.svelte src/lib/menus/**/*.svelte
  # Assert: No hardcoded colors

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `style(menus): apply design system tokens`

---

- [x] 21. Apply Design System to World Components

  **What to do**:
  - Replace hardcoded colors in world/overworld components
  - Use design system tokens

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Phase 5
  - **Blocked By**: Phase 3 completion

  **References**:
  - `src/lib/world/*.svelte`

  **Acceptance Criteria**:

  ```bash
  grep -E "#[0-9a-fA-F]{3,6}" src/lib/world/*.svelte
  # Assert: Minimal hardcoded colors

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `style(world): apply design system tokens`

---

- [x] 22. Apply Design System to Common and Save Components

  **What to do**:
  - Complete design system adoption for remaining components

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Smaller component set
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: Phase 5
  - **Blocked By**: Phase 3 completion

  **References**:
  - `src/lib/common/*.svelte`
  - `src/lib/saves/*.svelte`

  **Acceptance Criteria**:

  ```bash
  grep -rE "#[0-9a-fA-F]{3,6}" src/lib/common/ src/lib/saves/
  # Assert: Minimal hardcoded colors

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `style(common,saves): apply design system tokens`

---

### PHASE 5: ACCESSIBILITY + CLEANUP

- [x] 23. Add ARIA Labels and Roles to Interactive Elements

  **What to do**:
  - Add `aria-label` to all buttons without visible text
  - Add `role` attributes to custom interactive elements
  - Add `aria-live` regions for battle status updates
  - Focus on battle UI first (most interactive)

  **Must NOT do**:
  - Do not add keyboard navigation (Phase 2 scope)
  - Do not add focus trapping (Phase 2 scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Systematic accessibility audit across codebase
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 24, 25)
  - **Blocks**: None
  - **Blocked By**: Phase 4 completion

  **References**:
  - `src/lib/menus/Boxes.svelte` - Has some ARIA already
  - `src/lib/world/Controls.svelte` - Has some ARIA already

  **Acceptance Criteria**:

  ```bash
  grep -c 'aria-' src/lib/battle/action-bar/*.svelte
  # Assert: >= 10 (significant ARIA coverage)

  grep -c 'role="' src/lib/battle/Battle.svelte
  # Assert: >= 3

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `a11y: add ARIA labels and roles to interactive elements`

---

- [x] 24. Remove All @ts-ignore Comments

  **What to do**:
  - Find all @ts-ignore comments (29 total)
  - Fix underlying TypeScript issues
  - Remove @ts-ignore once fixed
  - Document any that cannot be fixed (with justification)

  **Must NOT do**:
  - Do not remove @ts-ignore without fixing the issue
  - Do not change runtime behavior

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: TypeScript type fixing requires understanding of code
  - **Skills**: []
    - Pure TypeScript work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 23, 25)
  - **Blocks**: None
  - **Blocked By**: Phase 4 completion

  **References**:
  - `src/js/pokemons/pokedex.ts` - 8 @ts-ignore (JSON import typing)
  - `src/js/items/bag.ts` - 4 @ts-ignore

  **Acceptance Criteria**:

  ```bash
  grep -c "@ts-ignore" src/**/*.ts src/**/*.svelte
  # Assert: 0 (or document exceptions)

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `fix(types): resolve all @ts-ignore comments`

---

- [x] 25. Remove Debug Console.log Statements

  **What to do**:
  - Find all console.log statements (28 total)
  - Remove debug logging
  - Keep console.error for legitimate error handling
  - Verify no console noise in dev tools

  **Must NOT do**:
  - Do not remove console.error statements
  - Do not break error handling

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple find and remove
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 23, 24)
  - **Blocks**: None
  - **Blocked By**: Phase 4 completion

  **References**:
  - Search for `console.log` across codebase

  **Acceptance Criteria**:

  ```bash
  grep -c "console.log" src/**/*.ts src/**/*.svelte
  # Assert: 0

  # console.error should still exist for error handling
  grep -c "console.error" src/**/*.ts
  # Assert: >= 1 (legitimate error logging)

  npm run check
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `chore: remove debug console.log statements`

---

## Commit Strategy

| Phase | After Task | Message                                                     | Verification                        |
| ----- | ---------- | ----------------------------------------------------------- | ----------------------------------- |
| 0     | 1-3        | `chore(baseline): capture initial baselines`                | N/A                                 |
| 1     | 4          | `test(battle): add characterization tests for ActionBar`    | `npm run test:run`                  |
| 1     | 5          | `test(battle): add characterization tests for Battle`       | `npm run test:run`                  |
| 1     | 6          | `test(context): add characterization tests for GameContext` | `npm run test:run`                  |
| 2     | 7          | `refactor(battle): split ActionBar into focused components` | `npm run check && npm run test:run` |
| 2     | 8          | `refactor(menus): split Boxes into focused components`      | `npm run check`                     |
| 2     | 9          | `refactor(context): extract GameContext helper methods`     | `npm run check && npm run test:run` |
| 3     | 10-18      | `feat(*): migrate to Svelte 5 runes`                        | `npm run check`                     |
| 4     | 19-22      | `style(*): apply design system tokens`                      | `npm run check`                     |
| 5     | 23         | `a11y: add ARIA labels and roles`                           | `npm run check`                     |
| 5     | 24         | `fix(types): resolve all @ts-ignore comments`               | `npm run check`                     |
| 5     | 25         | `chore: remove debug console.log statements`                | `npm run check`                     |

---

## Success Criteria

### Verification Commands

```bash
# Full test suite passes
npm run test:run
# Expected: All tests pass (baseline + new characterization tests)

# TypeScript check passes
npm run check
# Expected: Exit code 0

# Linting passes
npm run lint
# Expected: Exit code 0

# No Svelte 4 syntax remaining
grep -r "export let" src/lib/ src/App.svelte
# Expected: No output

# No oversized files (except move-effects.ts)
find src -name "*.svelte" -o -name "*.ts" | xargs wc -l | awk '{if($1>500 && !/move-effects/) print}'
# Expected: No output

# No @ts-ignore remaining
grep -r "@ts-ignore" src/
# Expected: No output

# No debug console.log remaining
grep -r "console.log" src/
# Expected: No output

# Design system tokens used
grep -r "var(--pixel-" src/lib/ | wc -l
# Expected: >= 50 (widespread usage)
```

### Final Checklist

- [ ] All characterization tests pass
- [ ] All components migrated to Svelte 5 runes
- [ ] No file exceeds 500 lines (except move-effects.ts)
- [ ] CSS design system tokens used consistently
- [ ] ARIA labels on all interactive elements
- [ ] Zero @ts-ignore comments
- [ ] Zero debug console.log statements
- [ ] `npm run check` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run test:run` passes
