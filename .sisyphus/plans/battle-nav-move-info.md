# Battle UI: Keyboard Navigation + Move Info Modal

## TL;DR

> **Quick Summary**: Fix three interconnected battle UI bugs — consolidate duplicate keyboard listeners, add proper 2D grid navigation for action buttons (FIGHT/BAG/POKEMON/RUN), and implement a move info modal triggered by 'i' key, badge tap, or long-touch.
>
> **Deliverables**:
>
> - Consolidated single keyboard listener in `ActionBar.svelte` (remove duplicates from children)
> - 2D grid navigation for action buttons matching visual 2×2 layout
> - Move info modal component with three trigger methods (keyboard, tap, long-touch)
> - Pure navigation logic extracted for TDD coverage
>
> **Estimated Effort**: Medium
> **Parallel Execution**: NO — sequential (each task builds on the previous)
> **Critical Path**: Task 1 (consolidate) → Task 2 (grid nav) → Task 3 (modal)

---

## Context

### Original Request

User reported that: (1) the 'i' badge on move buttons is decorative and doesn't open a move info modal via 'i' key or long-touch; (2) arrow key navigation between action buttons only works up/down despite a 2×2 visual grid; (3) dual keyboard listeners cause double-processing.

### Interview Summary

**Key Discussions**:

- All three modal triggers confirmed: tap badge + 'i' keypress + long-touch
- Dual listener consolidation explicitly included in scope
- TDD with Vitest confirmed (test infrastructure already exists)
- No component testing library installed — tests will cover extracted pure logic only

**Research Findings**:

- `SplitActionButtons.svelte` layout is 2×2: FIGHT(0)/BAG(1) top, POKEMON(2)/RUN(3) bottom
- Navigation uses linear ±1 index, not grid-aware ±2/±1
- Left/Right arrows swallowed with `preventDefault` but do nothing
- Both `ActionBar.svelte` AND children (`SplitActionButtons`, `SplitMoveSelector`) have `window.addEventListener('keydown')` — every keypress fires twice
- `ActionBar` fires first (mounted first), then child fires and calls `onHover()` writing back to parent
- `Modal.svelte` uses Svelte 5 Snippets API (`showModal` bindable, `header?: Snippet`, `children?: Snippet`)
- `PokedexMoves.svelte` has existing move detail modal pattern (L20-37, L100-120)
- `MoveInstance` fields: name, type, category, power, accuracy, pp, currentPp, description, effect, effectChance, priority, target

### Metis Review

**Identified Gaps** (addressed):

- Implementation order must be Bug #3 → #2 → #1 to avoid wasted work → applied
- Grid edge behavior (wrap vs clamp) → defaulted to clamping (no wrap), consistent with move selector
- 'i' key toggle behavior when modal already open → toggle (press 'i' again closes modal)
- Space key is handled in children but NOT in ActionBar → must migrate during consolidation
- Modal keyboard conflict: arrow keys could navigate moves behind open modal → guard with `moveInfoModalOpen` state
- Long-touch conflicts with normal tap → use 500ms threshold + cancel tap on long-touch detection
- No `@testing-library/svelte` installed → extract pure functions for TDD, verify components via Playwright

---

## Work Objectives

### Core Objective

Make battle keyboard navigation work correctly in 2D for action buttons, enable move info modal via three trigger methods, and eliminate the dual-listener double-processing bug.

### Concrete Deliverables

- `src/js/battle/grid-navigation.ts` — Pure 2D grid navigation function
- `src/js/__tests__/battle/grid-navigation.test.ts` — TDD tests for grid navigation
- `src/lib/battle/action-bar/MoveInfoModal.svelte` — Move detail modal component
- Modified `src/lib/battle/ActionBar.svelte` — Consolidated keyboard handler + modal state
- Modified `src/lib/battle/action-bar/SplitActionButtons.svelte` — Remove keyboard listener
- Modified `src/lib/battle/action-bar/SplitMoveSelector.svelte` — Remove keyboard listener, add info badge click + long-touch

### Definition of Done

- [x] `npm run test:run` passes (including new grid-navigation tests)
- [x] `npm run check` passes (no TypeScript errors)
- [x] `npm run lint` passes
- [x] Only 1 battle keyboard listener on `window` (ActionBar's) — verified by grep
- [x] Arrow keys navigate action buttons in 2D matching visual layout
- [x] 'i' key opens move info modal when move selector is visible
- [x] Tapping info badge opens move info modal
- [x] Long-touch (≥500ms) on move button opens move info modal
- [x] Modal displays: name, type (colored), category (icon), power, accuracy, PP, description

### Must Have

- 2D grid navigation with clamping (no wrapping at edges)
- All three modal triggers (keyboard 'i', badge tap, long-touch)
- Guard keyboard listener when modal is open
- Long-touch cancels normal tap to prevent move activation
- Space key as alias for Enter (migrated from children)

### Must NOT Have (Guardrails)

- DO NOT refactor ActionBar's listener into a state machine
- DO NOT install `@testing-library/svelte` or add component tests
- DO NOT add tests for existing keyboard behavior — only test new `grid-navigation.ts`
- DO NOT add transition animations beyond Modal.svelte's built-in zoom
- DO NOT touch `ActionMenu.svelte`, `MoveSelector.svelte` (legacy/unused)
- DO NOT touch `Battle.svelte`'s 'x' key listener (debug, separate concern)
- DO NOT modify `Modal.svelte`, `MoveInstance`, `Move`, or `pokedex.ts`
- DO NOT add aria-\* overhaul — only basic `aria-label` on info-badge
- DO NOT add haptic feedback for long-touch
- DO NOT add keyboard navigation within the modal (native `<dialog>` Escape is sufficient)

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks are verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: YES (Vitest + jsdom)
- **Automated tests**: TDD (test first for extractable logic)
- **Framework**: Vitest
- **Component testing**: NOT available — pure logic TDD + Playwright QA

### Agent-Executed QA Scenarios

**Verification Tool by Deliverable Type:**

| Type                                 | Tool        | How Agent Verifies                             |
| ------------------------------------ | ----------- | ---------------------------------------------- |
| Grid navigation logic                | Vitest      | Unit tests for pure function                   |
| Keyboard navigation (action buttons) | Playwright  | Navigate with arrows, verify focus             |
| Keyboard navigation (moves)          | Playwright  | Navigate with arrows, verify selection         |
| Move info modal triggers             | Playwright  | 'i' key, badge click, simulated long-touch     |
| Listener consolidation               | Bash (grep) | Count window keydown listeners in battle files |

---

## Execution Strategy

### Sequential Execution (Dependencies Require It)

```
Task 1: Consolidate keyboard listeners (Bug #3)
    ↓ (required: creates single listener location)
Task 2: 2D grid navigation for action buttons (Bug #2)
    ↓ (required: navigation handler exists in consolidated listener)
Task 3: Move info modal + triggers (Bug #1)

Critical Path: Task 1 → Task 2 → Task 3
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
| ---- | ---------- | ------ | -------------------- |
| 1    | None       | 2, 3   | None                 |
| 2    | 1          | 3      | None                 |
| 3    | 2          | None   | None                 |

---

## TODOs

- [x] 1. Consolidate Battle Keyboard Listeners (Bug #3)

  **What to do**:
  - Remove `window.addEventListener('keydown', handleKeyDown)` from `SplitActionButtons.svelte` (the `onMount` listener + cleanup in `onDestroy`)
  - Remove `window.addEventListener('keydown', handleKeyDown)` from `SplitMoveSelector.svelte` (the `onMount` listener + cleanup in `onDestroy`)
  - Keep `window.addEventListener('resize', ...)` in both children (unrelated)
  - Keep all mouse/touch event handlers in children (`onclick`, `onmouseenter` — DOM-local, not window)
  - Keep the `$effect(() => { selectedIdx = selectedOptionIdx; })` sync in SplitActionButtons (parent→child prop sync)
  - Keep the `$effect(() => { selectedIdx = selectedMoveIdx; })` sync in SplitMoveSelector (parent→child prop sync)
  - In ActionBar's existing listener (L282-381), add `Space` as alias for `Enter` (currently only in children)
  - In ActionBar's existing listener, add `ArrowLeft` and `ArrowRight` handling (currently not handled — needed for Task 2)
  - Verify ActionBar's listener already handles: ArrowUp, ArrowDown, Enter, Escape for both action and move states
  - Verify ActionBar's `onHover` callbacks to children still work (selection state flows parent→child via props)

  **Must NOT do**:
  - DO NOT remove `handleKeyDown` partially — either remove the function entirely along with its listener registration, or leave it. No half-wired code.
  - DO NOT touch `Battle.svelte`'s 'x' key listener
  - DO NOT touch `ActionMenu.svelte` or `MoveSelector.svelte`
  - DO NOT remove the `$effect` prop-sync blocks in children
  - DO NOT change `getButtonPositions()` or any visual layout code

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Keyboard event consolidation across 3 Svelte components requires careful state management understanding and attention to edge cases
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Svelte 5 component architecture, event handling patterns, DOM lifecycle
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed yet — QA is for after all changes, not mid-consolidation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (first task)
  - **Blocks**: Task 2, Task 3
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `src/lib/battle/ActionBar.svelte:282-381` — The existing consolidated listener that will become the SOLE listener. Study its guard pattern at L286-295 (early return when menus are open)
  - `src/lib/battle/action-bar/SplitActionButtons.svelte:146-176` — The keyboard handler to REMOVE. Note which keys are handled (ArrowUp, ArrowDown, Enter, Space, Escape) to ensure none are lost
  - `src/lib/battle/action-bar/SplitMoveSelector.svelte:67-106` — The keyboard handler to REMOVE. Note Space key handling at L95-96 and arrow key handling with `navigateVertical`/`navigateHorizontal`
  - `src/lib/battle/action-bar/SplitActionButtons.svelte:216` — The `onMount` registration of the listener to remove
  - `src/lib/battle/action-bar/SplitMoveSelector.svelte:159` — The `onMount` registration of the listener to remove

  **API/Type References**:
  - `src/lib/battle/action-bar/SplitActionButtons.svelte:225-227` — The `$effect` prop-sync block that MUST be preserved: `$effect(() => { selectedIdx = selectedOptionIdx; })`

  **Acceptance Criteria**:
  - [x] `SplitActionButtons.svelte` has NO `window.addEventListener('keydown', ...)` call
  - [x] `SplitMoveSelector.svelte` has NO `window.addEventListener('keydown', ...)` call
  - [x] ActionBar's listener handles: ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Enter, Space, Escape
  - [x] `npm run check` passes (no TypeScript errors)
  - [x] `npm run lint` passes
  - [x] `npm run test:run` passes (no regressions)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify listener count after consolidation
    Tool: Bash (grep)
    Preconditions: Code changes applied
    Steps:
      1. Run: grep -rn "addEventListener.*keydown" src/lib/battle/ --include="*.svelte"
      2. Count results
      3. Assert: exactly 2 results (ActionBar.svelte + Battle.svelte's 'x' key debug listener)
    Expected Result: Only ActionBar and Battle have keydown listeners
    Evidence: grep output captured

  Scenario: Verify action button navigation still works
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173, start a battle (DEBUG mode)
    Steps:
      1. Navigate to: http://localhost:5173
      2. Start a battle (trigger encounter via game or debug)
      3. Wait for action buttons to appear (FIGHT/BAG/POKEMON/RUN)
      4. Press ArrowDown key
      5. Assert: selected button changes (visual highlight moves)
      6. Press ArrowUp key
      7. Assert: selected button returns to original position
      8. Press Enter key
      9. Assert: action activates (e.g., moves appear if FIGHT selected)
      10. Press Escape key
      11. Assert: returns to action buttons
      12. Screenshot: .sisyphus/evidence/task-1-action-nav.png
    Expected Result: Up/Down/Enter/Escape all work from single listener
    Evidence: .sisyphus/evidence/task-1-action-nav.png

  Scenario: Verify move navigation still works
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, in battle, FIGHT selected
    Steps:
      1. Press Enter to open moves
      2. Press ArrowDown — assert move selection changes
      3. Press ArrowUp — assert move selection returns
      4. Press ArrowLeft — assert move selection changes (horizontal)
      5. Press ArrowRight — assert move selection changes (horizontal)
      6. Press Space — assert move is activated (same as Enter)
      7. Screenshot: .sisyphus/evidence/task-1-move-nav.png
    Expected Result: All arrow keys + Space + Enter work for moves
    Evidence: .sisyphus/evidence/task-1-move-nav.png
  ```

  **Commit**: YES
  - Message: `fix(battle): consolidate duplicate keyboard listeners into ActionBar`
  - Files: `src/lib/battle/ActionBar.svelte`, `src/lib/battle/action-bar/SplitActionButtons.svelte`, `src/lib/battle/action-bar/SplitMoveSelector.svelte`
  - Pre-commit: `npm run test:run && npm run check`

---

- [x] 2. Add 2D Grid Navigation for Action Buttons (Bug #2 — TDD)

  **What to do**:

  **RED phase — Write failing test first:**
  - Create `src/js/__tests__/battle/grid-navigation.test.ts`
  - Test a pure function `navigateActionGrid(currentIdx, direction, cols, total): number`
  - Grid layout assumed: 2 columns, 4 items total
    ```
    [0] [1]    ← FIGHT, BAG
    [2] [3]    ← POKEMON, RUN
    ```
  - Required test cases:
    - `navigateActionGrid(0, 'right', 2, 4)` → `1` (FIGHT → BAG)
    - `navigateActionGrid(1, 'left', 2, 4)` → `0` (BAG → FIGHT)
    - `navigateActionGrid(0, 'down', 2, 4)` → `2` (FIGHT → POKEMON)
    - `navigateActionGrid(2, 'up', 2, 4)` → `0` (POKEMON → FIGHT)
    - `navigateActionGrid(1, 'down', 2, 4)` → `3` (BAG → RUN)
    - `navigateActionGrid(3, 'up', 2, 4)` → `1` (RUN → BAG)
    - `navigateActionGrid(2, 'right', 2, 4)` → `3` (POKEMON → RUN)
    - `navigateActionGrid(3, 'left', 2, 4)` → `2` (RUN → POKEMON)
    - Edge clamping (no wrap):
      - `navigateActionGrid(0, 'left', 2, 4)` → `0` (FIGHT stays)
      - `navigateActionGrid(0, 'up', 2, 4)` → `0` (FIGHT stays)
      - `navigateActionGrid(3, 'down', 2, 4)` → `3` (RUN stays)
      - `navigateActionGrid(3, 'right', 2, 4)` → `3` (RUN stays)
      - `navigateActionGrid(1, 'right', 2, 4)` → `1` (BAG stays)
      - `navigateActionGrid(2, 'left', 2, 4)` → `2` (POKEMON stays)
  - Run: `npx vitest run src/js/__tests__/battle/grid-navigation.test.ts` → FAIL (function doesn't exist)

  **GREEN phase — Implement minimum code:**
  - Create `src/js/battle/grid-navigation.ts`
  - Export `navigateActionGrid(currentIdx: number, direction: 'up' | 'down' | 'left' | 'right', cols: number = 2, total: number = 4): number`
  - Grid math: row = floor(idx / cols), col = idx % cols
    - up: row - 1 (clamp ≥ 0) → newIdx = (row - 1) \* cols + col
    - down: row + 1 (clamp < totalRows) → newIdx = (row + 1) \* cols + col
    - left: col - 1 (clamp ≥ 0) → newIdx = row \* cols + (col - 1)
    - right: col + 1 (clamp < cols) → newIdx = row \* cols + (col + 1)
  - Run: `npx vitest run src/js/__tests__/battle/grid-navigation.test.ts` → PASS

  **REFACTOR phase:**
  - Clean up if needed, re-run tests → still PASS

  **Wire into ActionBar:**
  - Import `navigateActionGrid` in `ActionBar.svelte`
  - Replace the linear ±1 ArrowUp/ArrowDown logic for action buttons with `navigateActionGrid(selectedOptionIdx, direction)`
  - Wire ArrowLeft/ArrowRight to also call `navigateActionGrid`

  **Must NOT do**:
  - DO NOT change the move selector grid navigation (it already works with `navigateVertical`/`navigateHorizontal`)
  - DO NOT change `getButtonPositions()` layout
  - DO NOT add wrapping behavior

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: TDD workflow with pure function extraction + Svelte integration requires structured discipline
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Understanding Svelte 5 state updates and how selection index flows to visual components
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed yet for unit test phase

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/lib/battle/ActionBar.svelte:282-381` — The consolidated listener (from Task 1) where grid navigation will be wired
  - `src/lib/battle/action-bar/SplitActionButtons.svelte:71-137` — `getButtonPositions()` defines the visual 2×2 layout. This confirms the grid mapping: top-left(0), top-right(1), bottom-left(2), bottom-right(3)

  **Test References**:
  - `src/js/__tests__/` — Existing test directory structure. Tests use `describe/it/expect` from Vitest

  **Acceptance Criteria**:
  - [x] Test file exists: `src/js/__tests__/battle/grid-navigation.test.ts`
  - [x] Test covers all 14+ navigation scenarios (4 directions × 4 positions, including edge clamping)
  - [x] `npx vitest run src/js/__tests__/battle/grid-navigation.test.ts` → PASS
  - [x] `npm run test:run` → PASS (all tests including new ones)
  - [x] `npm run check` passes

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: TDD Red phase — tests fail before implementation
    Tool: Bash
    Preconditions: Test file created, implementation file does NOT exist yet
    Steps:
      1. Run: npx vitest run src/js/__tests__/battle/grid-navigation.test.ts
      2. Assert: exit code is non-zero (tests fail)
      3. Assert: output contains "FAIL" or import errors
    Expected Result: Tests fail because the function doesn't exist
    Evidence: Terminal output captured

  Scenario: TDD Green phase — tests pass after implementation
    Tool: Bash
    Preconditions: Both test file and implementation file exist
    Steps:
      1. Run: npx vitest run src/js/__tests__/battle/grid-navigation.test.ts
      2. Assert: exit code is 0
      3. Assert: output shows 14+ tests passing, 0 failures
    Expected Result: All grid navigation tests pass
    Evidence: Terminal output captured

  Scenario: 2D navigation works in browser
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173, in a battle
    Steps:
      1. Navigate to battle screen with action buttons visible
      2. Verify FIGHT is initially selected (index 0)
      3. Press ArrowRight → Assert BAG is now highlighted
      4. Press ArrowDown → Assert RUN is now highlighted
      5. Press ArrowLeft → Assert POKEMON is now highlighted
      6. Press ArrowUp → Assert FIGHT is now highlighted
      7. Press ArrowLeft → Assert FIGHT is still highlighted (clamped)
      8. Press ArrowUp → Assert FIGHT is still highlighted (clamped)
      9. Screenshot: .sisyphus/evidence/task-2-grid-nav.png
    Expected Result: 2D navigation matches visual 2×2 grid layout with edge clamping
    Evidence: .sisyphus/evidence/task-2-grid-nav.png
  ```

  **Commit**: YES
  - Message: `feat(battle): add 2D grid navigation for action buttons`
  - Files: `src/js/battle/grid-navigation.ts`, `src/js/__tests__/battle/grid-navigation.test.ts`, `src/lib/battle/ActionBar.svelte`
  - Pre-commit: `npm run test:run && npm run check`

---

- [x] 3. Implement Move Info Modal with Triggers (Bug #1)

  **What to do**:

  **Create MoveInfoModal component:**
  - Create `src/lib/battle/action-bar/MoveInfoModal.svelte`
  - Use Svelte 5 Snippets API with the existing `Modal` component (NOT `slot="header"` legacy syntax)
  - Props: `move: MoveInstance | undefined`, `showModal: boolean` (bindable)
  - Display: move name (header), type with color from `typeChart`, category icon from `src/assets/moves-cat/{category}.png`, power, accuracy, PP (currentPp / pp), description, effect detail
  - Process `$effect_chance` placeholder in effect text (replace with `effectChance` value) — follow pattern from `PokedexMoves.svelte` L20-37

  **Wire 'i' key in ActionBar:**
  - Add `moveInfoModalOpen` state variable to ActionBar
  - In the consolidated keyboard listener, add guard: `if (moveInfoModalOpen) return;` at top (prevent arrow navigation behind modal)
  - When `moveOpened === true` and `key === 'i'`: toggle `moveInfoModalOpen` (open if closed, close if open)
  - Pass the currently selected move to MoveInfoModal

  **Wire info badge click in SplitMoveSelector:**
  - Add `onInfoClick?: (moveIdx: number) => void` callback prop to SplitMoveSelector
  - Add `onclick={(e) => { e.stopPropagation(); onInfoClick?.(i); }}` to the `.info-badge` div (L218-220)
  - Connect `onInfoClick` in ActionBar to set `moveInfoModalOpen = true` and update selected move

  **Wire long-touch on move buttons in SplitMoveSelector:**
  - Add long-touch detection to each move button: `touchstart` starts a 500ms timer, `touchend`/`touchcancel` clears it
  - If timer fires (≥500ms): call `onInfoClick?.(i)` to open the modal
  - On `touchend` after long-touch detected: call `preventDefault()` to cancel the normal move-selection tap
  - Track long-touch state per-button to avoid interfering with normal taps on other buttons

  **Must NOT do**:
  - DO NOT add animations beyond Modal.svelte's built-in
  - DO NOT add keyboard navigation within the modal
  - DO NOT modify `Modal.svelte`
  - DO NOT modify `MoveInstance` or `Move` classes
  - DO NOT allow move info to trigger when moves are NOT visible (`moveOpened` must be true for 'i' key)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Creating a new UI component (modal), touch interaction patterns, visual styling with type colors and category icons
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Svelte 5 component creation with snippets, styling, modal integration
    - `playwright`: QA verification of all three trigger methods including simulated long-touch
  - **Skills Evaluated but Omitted**:
    - `git-master`: Simple commit, not complex git operations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 2)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 1, Task 2

  **References**:

  **Pattern References** (existing code to follow):
  - `src/lib/menus/pokedex/PokedexMoves.svelte:20-37` — Move detail text processing pattern: `$effect_chance` replacement, `mechanicRegex` for effect text cleanup. Copy this pattern for the modal content.
  - `src/lib/menus/pokedex/PokedexMoves.svelte:100-120` — Modal usage with move details. Note: this uses Svelte 4 `slot="header"` syntax. The NEW modal MUST use Svelte 5 `{#snippet header()}` syntax instead.
  - `src/lib/battle/action-bar/SplitMoveSelector.svelte:217-220` — The `.info-badge` div where click handler must be added
  - `src/lib/battle/action-bar/SplitMoveSelector.svelte:186-213` — Move button rendering loop (`{#each moves as move, i}`) where long-touch handlers must be attached

  **API/Type References**:
  - `src/lib/common/Modal.svelte` — API: `showModal: boolean` (bindable), `header?: Snippet`, `children?: Snippet`. Uses native `<dialog>` element, auto-closes on Escape, has backdrop click close.
  - `src/js/pokemons/pokedex.ts` — `MoveInstance` class: `name`, `type`, `category` ('physical'|'special'|'no-damage'), `power`, `accuracy`, `pp`, `currentPp`, `description`, `effect` ({effect, short_effect}), `effectChance`, `priority`, `target`
  - `src/lib/battle/action-bar/SplitMoveSelector.svelte` — Has a `typeColors` map or uses `typeChart` for move type coloring. Check what's currently used for move button background colors.

  **Asset References**:
  - `src/assets/moves-cat/physical.png` — Physical move category icon
  - `src/assets/moves-cat/special.png` — Special move category icon
  - `src/assets/moves-cat/no-damage.png` — Status move category icon
  - `src/assets/types/{type}.svg` — Type icons (optional, for modal header)

  **Acceptance Criteria**:
  - [x] `MoveInfoModal.svelte` exists at `src/lib/battle/action-bar/MoveInfoModal.svelte`
  - [x] Modal displays: move name, type (colored), category (icon), power, accuracy, PP, description
  - [x] `$effect_chance` in effect text is replaced with actual value
  - [x] `npm run check` passes
  - [x] `npm run lint` passes
  - [x] `npm run test:run` passes

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 'i' key opens move info modal
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173, in a battle with move selector open
    Steps:
      1. Navigate to battle
      2. Open move selector (select FIGHT → Enter)
      3. Wait for move buttons to appear
      4. Note which move is currently highlighted (first move)
      5. Press 'i' key
      6. Wait for dialog element to appear (timeout: 3s)
      7. Assert: dialog is visible (open attribute exists)
      8. Assert: dialog contains the name of the highlighted move
      9. Assert: dialog contains power/accuracy/PP text
      10. Screenshot: .sisyphus/evidence/task-3-modal-i-key.png
    Expected Result: Move info modal opens showing details of selected move
    Evidence: .sisyphus/evidence/task-3-modal-i-key.png

  Scenario: 'i' key toggles modal closed
    Tool: Playwright (playwright skill)
    Preconditions: Move info modal is currently open (from previous scenario)
    Steps:
      1. Press 'i' key again
      2. Wait for dialog to close (timeout: 3s)
      3. Assert: no dialog[open] element exists
      4. Assert: move selector is still visible (not dismissed)
    Expected Result: Modal closes, move selector remains active
    Evidence: .sisyphus/evidence/task-3-modal-toggle-close.png

  Scenario: Info badge click opens modal
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, in battle with move selector open
    Steps:
      1. Navigate to move selector
      2. Locate .info-badge element on the first move button
      3. Click the .info-badge element
      4. Wait for dialog element to appear (timeout: 3s)
      5. Assert: dialog is visible and shows the correct move name
      6. Screenshot: .sisyphus/evidence/task-3-modal-badge-click.png
    Expected Result: Clicking the 'i' badge opens move info for that specific move
    Evidence: .sisyphus/evidence/task-3-modal-badge-click.png

  Scenario: Arrow keys do NOT navigate while modal is open
    Tool: Playwright (playwright skill)
    Preconditions: Move info modal is open
    Steps:
      1. Note which move was selected when modal opened
      2. Press ArrowDown key
      3. Press ArrowUp key
      4. Close modal (press Escape)
      5. Assert: same move is still selected (arrows had no effect while modal was open)
    Expected Result: Keyboard navigation is blocked while modal is visible
    Evidence: .sisyphus/evidence/task-3-modal-keyboard-guard.png

  Scenario: Long-touch on move button opens modal (mobile simulation)
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, in battle with move selector open
    Steps:
      1. Navigate to move selector
      2. Locate first move button element
      3. Simulate long-touch: dispatch touchstart event, wait 600ms, dispatch touchend event
      4. Wait for dialog element to appear (timeout: 3s)
      5. Assert: dialog is visible with move details
      6. Assert: move was NOT activated (the move was not executed — still on move selector)
      7. Screenshot: .sisyphus/evidence/task-3-modal-long-touch.png
    Expected Result: Long-touch opens info modal without activating the move
    Evidence: .sisyphus/evidence/task-3-modal-long-touch.png

  Scenario: Normal tap still activates move (not intercepted by long-touch)
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, in battle with move selector open
    Steps:
      1. Navigate to move selector
      2. Quick tap (click) the first move button (not on info badge)
      3. Assert: move selector closes OR battle proceeds (move was activated)
      4. Assert: no dialog appeared (normal tap should not trigger modal)
    Expected Result: Quick taps activate moves normally, unaffected by long-touch logic
    Evidence: .sisyphus/evidence/task-3-normal-tap.png

  Scenario: Modal shows correct data fields
    Tool: Playwright (playwright skill)
    Preconditions: Move info modal is open for a move with known stats
    Steps:
      1. Assert: dialog contains move name text
      2. Assert: dialog contains an img element for category (src contains 'moves-cat/')
      3. Assert: dialog contains text for Power, Accuracy, PP values
      4. Assert: dialog contains description text
      5. Screenshot: .sisyphus/evidence/task-3-modal-content.png
    Expected Result: All required data fields visible in modal
    Evidence: .sisyphus/evidence/task-3-modal-content.png
  ```

  **Commit**: YES
  - Message: `feat(battle): add move info modal with keyboard, tap, and long-touch triggers`
  - Files: `src/lib/battle/action-bar/MoveInfoModal.svelte`, `src/lib/battle/ActionBar.svelte`, `src/lib/battle/action-bar/SplitMoveSelector.svelte`
  - Pre-commit: `npm run test:run && npm run check`

---

## Commit Strategy

| After Task | Message                                                                         | Files                                                                 | Verification                                        |
| ---------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------- |
| 1          | `fix(battle): consolidate duplicate keyboard listeners into ActionBar`          | ActionBar.svelte, SplitActionButtons.svelte, SplitMoveSelector.svelte | `npm run test:run && npm run check`                 |
| 2          | `feat(battle): add 2D grid navigation for action buttons`                       | grid-navigation.ts, grid-navigation.test.ts, ActionBar.svelte         | `npm run test:run && npm run check`                 |
| 3          | `feat(battle): add move info modal with keyboard, tap, and long-touch triggers` | MoveInfoModal.svelte, ActionBar.svelte, SplitMoveSelector.svelte      | `npm run test:run && npm run check && npm run lint` |

---

## Success Criteria

### Verification Commands

```bash
npm run test:run    # Expected: all tests pass including new grid-navigation tests
npm run check       # Expected: no TypeScript errors
npm run lint        # Expected: no lint errors
grep -rn "addEventListener.*keydown" src/lib/battle/ --include="*.svelte" | wc -l  # Expected: 2 (ActionBar + Battle)
```

### Final Checklist

- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [x] All tests pass
- [x] 2D grid navigation clamped at edges
- [x] Move info modal opens via 'i' key, badge tap, and long-touch
- [x] Keyboard blocked while modal is open
- [x] Long-touch does not interfere with normal taps
- [x] Only ActionBar has battle keyboard listener (dual listener bug fixed)
