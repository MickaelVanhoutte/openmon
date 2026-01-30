# Pokemon Box UI Fix

## TL;DR

> **Quick Summary**: Fix box grid to 5x4 (20 slots), update keyboard navigation, and fix team panel text overflow.
>
> **Deliverables**:
>
> - Box initialization creates 20 slots instead of 40
> - Keyboard navigation works correctly with 5-column grid
> - Team panel text uses responsive sizing to prevent overflow
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential (Task 2 depends on Task 1's verification context)
> **Critical Path**: Task 1 → Task 2 → Task 3

---

## Context

### Original Request

"boxes are wrong in many ways. Our team text overflows the slot, on the left side, there is too many slots for mobile it overflows the screen. We should do 5x4 boxes, that's 20 pokemons per box. boxes are initialized at player's creation, change that to match 5x4 and fix the UI accordingly."

### Interview Summary

**Key Discussions**:

- Grid: 5 columns x 4 rows = 20 slots per box (user explicitly requested)
- Keep 32 boxes total (unchanged)
- Existing saves: Only new games get 20 slots; old saves keep 40 but UI shows first 20
- Accept that Pokemon in slots 20-39 of old saves become inaccessible
- Font size: Use responsive sizing with CSS clamp()
- Direct replacement of hardcoded values (no constants extraction)

**Research Findings**:

- `savesHolder.ts:131-132`: Creates 40-slot arrays
- `Boxes.svelte:659-661`: CSS grid already 5x4 but data overflows
- Keyboard navigation uses hardcoded `6` in 8+ places
- Team panel has 22px fixed font causing overflow

### Metis Review

**Identified Gaps** (addressed):

1. **CRITICAL: Modulo arithmetic for rightmost column check**
   - Wrong: `% 6 === 5` → `% 5 === 5` (always false!)
   - Correct: `% 6 === 5` → `% 5 === 4` (rightmost of 5-column)

2. **CRITICAL: Line 220 cursor cap for old saves**
   - Current: `over = box.values.length - 1` (could be 39 on old saves)
   - Fix: `over = Math.min(box.values.length - 1, 19)` (cap to visible slots)

3. **File boundaries locked down**:
   - `savesHolder.ts`: Lines 128-142 ONLY
   - `Boxes.svelte`: Keyboard nav + CSS styles

---

## Work Objectives

### Core Objective

Fix Pokemon box UI: change to 5x4 grid (20 slots), fix keyboard navigation for 5 columns, and make team panel text responsive.

### Concrete Deliverables

- `src/js/context/savesHolder.ts` - Box initialization creates 20 slots
- `src/lib/menus/boxes/Boxes.svelte` - Keyboard navigation + responsive CSS

### Definition of Done

- [ ] New game creates boxes with exactly 20 slots
- [ ] Box grid displays 5 columns x 4 rows without overflow
- [ ] Keyboard navigation works correctly (right edge at column 4, bottom at row 3)
- [ ] Team panel text truncates properly on mobile

### Must Have

- 5x4 grid = 20 slots per box
- Correct keyboard navigation boundaries
- Responsive team text that doesn't overflow

### Must NOT Have (Guardrails)

- NO migration logic for old saves (accept inaccessible slots 20-39)
- NO changes to `boxes.ts` PokemonBox class
- NO changes outside `savesHolder.ts:128-142` and `Boxes.svelte` keyboard nav + styles
- NO constants extraction (use direct values)
- NO other visual/styling changes beyond scope

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest)
- **User wants tests**: Manual-only (UI verification)
- **Framework**: Playwright for browser automation

### Automated Verification (NO User Intervention)

Each TODO includes Playwright-executable acceptance criteria.

---

## Execution Strategy

### Dependency Chain

```
Task 1: Fix Box Initialization (savesHolder.ts)
    ↓
Task 2: Fix Keyboard Navigation (Boxes.svelte)
    ↓
Task 3: Fix Team Panel Text Overflow (Boxes.svelte CSS)
```

**Sequential Execution Required**: Task 2 keyboard nav testing requires Task 1's 20-slot boxes.

---

## TODOs

- [ ] 1. Fix Box Initialization to 20 Slots

  **What to do**:
  - Change `savesHolder.ts` line 131: `new Array<PokemonInstance | undefined>(40)` → `new Array<PokemonInstance | undefined>(20)`
  - Change `savesHolder.ts` line 132: `for (let j = 0; j < 40; j++)` → `for (let j = 0; j < 20; j++)`

  **Must NOT do**:
  - Do NOT change loop that creates 32 boxes (line 130)
  - Do NOT change any other code in savesHolder.ts
  - Do NOT modify PokemonBox class or boxes.ts

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Two-line change, exact locations known, minimal complexity
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit of data model change

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2 (verification needs 20-slot boxes)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/context/savesHolder.ts:127-142` - The newGame() method that creates boxes. Lines 131-132 are the exact targets.

  **Type References**:
  - `src/js/pokemons/boxes.ts:20-25` - PokemonBox constructor takes `values: Array<PokemonInstance | undefined>`. This array size is what we're changing.

  **Acceptance Criteria**:

  **Automated Verification (using Playwright browser automation):**

  ```
  # Agent executes via playwright skill:
  1. Clear localStorage (fresh state)
  2. Navigate to: http://localhost:3000/ (or dev server URL)
  3. Create new game (complete player creation flow)
  4. Open Pokemon box menu (navigate to PC/boxes)
  5. Count visible grid slots in .box .entries
  6. Assert: Exactly 20 .entry elements exist in .box .entries
  7. Assert: Grid is 5 columns (check CSS grid-template-columns)
  8. Screenshot: .sisyphus/evidence/task-1-box-grid.png
  ```

  **Commit**: YES
  - Message: `fix(boxes): change box size from 40 to 20 slots (5x4 grid)`
  - Files: `src/js/context/savesHolder.ts`
  - Pre-commit: `npm run check` (TypeScript validation)

---

- [ ] 2. Fix Keyboard Navigation for 5-Column Grid

  **What to do**:
  Update ALL hardcoded `6` values in keyboard navigation (lines 160-280) to work with 5-column grid:

  | Line | Current                          | Fix                                          |
  | ---- | -------------------------------- | -------------------------------------------- |
  | 175  | `over === 0 \|\| over % 6 === 0` | `over % 5 === 0`                             |
  | 177  | `over = over / 6`                | `over = Math.floor(over / 5)`                |
  | 183  | `over = (over + 1) * 6 - 1`      | `over = (over + 1) * 5 - 1`                  |
  | 191  | `over === 5 \|\| over % 6 === 5` | `over % 5 === 4`                             |
  | 193  | `over = (over + 1) / 6 - 1`      | `over = Math.floor((over + 1) / 5) - 1`      |
  | 207  | `over - 6 >= 0`                  | `over - 5 >= 0`                              |
  | 208  | `over -= 6`                      | `over -= 5`                                  |
  | 220  | `over = box.values.length - 1`   | `over = Math.min(box.values.length - 1, 19)` |
  | 226  | `over + 6 < box.values.length`   | `over + 5 < 20`                              |
  | 227  | `over += 6`                      | `over += 5`                                  |

  **CRITICAL - Rightmost column arithmetic**:
  - `over % 6 === 5` checks if position is rightmost in 6-column grid (positions 5, 11, 17...)
  - `over % 5 === 4` checks if position is rightmost in 5-column grid (positions 4, 9, 14, 19)
  - DO NOT use `over % 5 === 5` - this is ALWAYS false (no remainder can equal divisor)

  **CRITICAL - Cursor cap for old saves**:
  - Line 220: When navigating UP from box-change, cap cursor to visible area
  - Old saves have 40 slots, but UI only shows 20
  - Use `Math.min(box.values.length - 1, 19)` to prevent cursor going to invisible slot 39

  **Must NOT do**:
  - Do NOT change any code outside keyboard listener (lines 160-280)
  - Do NOT change touch handlers
  - Do NOT change box-change navigation (prev/next box buttons)
  - Do NOT add constants - use literal values as agreed

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Line-by-line arithmetic fixes, exact locations known
  - **Skills**: [`git-master`]
    - `git-master`: Atomic commit of navigation changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/lib/menus/boxes/Boxes.svelte:160-280` - The `listener` function handling keyboard navigation. This is the ONLY area to modify.

  **Existing Grid Layout Reference**:
  - `src/lib/menus/boxes/Boxes.svelte:659-661` - CSS grid already uses 5 columns: `grid-template-columns: repeat(5, 1fr)`. Navigation must match this.

  **Acceptance Criteria**:

  **Automated Verification (using Playwright browser automation):**

  ```
  # Agent executes via playwright skill:
  # Prerequisite: Dev server running, new game created (from Task 1)

  1. Navigate to boxes menu
  2. Focus on box grid (click first slot)

  # Test rightmost boundary (column 4 is rightmost of 5-column grid):
  3. Press ArrowRight 4 times (move from slot 0 to slot 4)
  4. Press ArrowRight 1 more time
  5. Assert: Focus moves to party panel (selectZone changes to 'party')

  # Test row navigation:
  6. Click slot 0, press ArrowDown
  7. Assert: Focus is on slot 5 (row 2, column 0)

  # Test bottom boundary:
  8. Click slot 15, press ArrowDown
  9. Assert: Focus is on slot 20... wait, slot 19 is last visible slot
  10. Click slot 15 (row 4), press ArrowDown
  11. Assert: Focus moves to box-change (row 4 is last row)

  # Test navigation from box-change back to grid:
  12. Press ArrowUp from box-change
  13. Assert: Focus is on slot 19 (last visible slot, NOT slot 39)

  14. Screenshot: .sisyphus/evidence/task-2-keyboard-nav.png
  ```

  **Commit**: YES
  - Message: `fix(boxes): update keyboard navigation for 5-column grid`
  - Files: `src/lib/menus/boxes/Boxes.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 3. Fix Team Panel Text Overflow with Responsive Sizing

  **What to do**:
  - Update `.party .entries .entry` CSS (around line 535) to use responsive font sizing
  - Change `font-size: 22px` to `font-size: clamp(14px, 3.5vw, 22px)`
  - Verify existing ellipsis handling (lines 568-573) works with new sizing

  **CSS Change**:

  ```scss
  .entry {
  	color: white;
  	font-size: clamp(14px, 3.5vw, 22px); // Was: font-size: 22px;
  	// ... rest unchanged
  }
  ```

  **Must NOT do**:
  - Do NOT change any other styles
  - Do NOT modify box grid styles
  - Do NOT change the ellipsis/overflow handling (already correct)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single CSS property change
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Responsive sizing expertise

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None
  - **Blocked By**: Task 2 (same file, sequential editing)

  **References**:

  **Pattern References**:
  - `src/lib/menus/boxes/Boxes.svelte:533-586` - The `.party .entries .entry` style block. Line 535 is the target.
  - `src/lib/menus/boxes/Boxes.svelte:568-573` - Existing overflow handling with `text-overflow: ellipsis`. Keep this intact.

  **Acceptance Criteria**:

  **Automated Verification (using Playwright browser automation):**

  ```
  # Agent executes via playwright skill:

  # Test on mobile viewport:
  1. Set viewport to 375x667 (iPhone SE)
  2. Navigate to boxes menu with a party
  3. Assert: Team panel entries have font-size between 14px and 22px
  4. Assert: No horizontal overflow on .party .entries
  5. Assert: Pokemon names with ellipsis visible if truncated
  6. Screenshot: .sisyphus/evidence/task-3-mobile-text.png

  # Test on desktop viewport:
  7. Set viewport to 1280x800
  8. Assert: Font-size is at or near 22px maximum
  9. Screenshot: .sisyphus/evidence/task-3-desktop-text.png
  ```

  **Commit**: YES
  - Message: `fix(boxes): use responsive font size for team panel entries`
  - Files: `src/lib/menus/boxes/Boxes.svelte`
  - Pre-commit: `npm run check`

---

## Commit Strategy

| After Task | Message                                                       | Files          | Verification  |
| ---------- | ------------------------------------------------------------- | -------------- | ------------- |
| 1          | `fix(boxes): change box size from 40 to 20 slots (5x4 grid)`  | savesHolder.ts | npm run check |
| 2          | `fix(boxes): update keyboard navigation for 5-column grid`    | Boxes.svelte   | npm run check |
| 3          | `fix(boxes): use responsive font size for team panel entries` | Boxes.svelte   | npm run check |

---

## Success Criteria

### Verification Commands

```bash
npm run check  # TypeScript validation - no errors
npm run dev    # Start dev server for Playwright testing
```

### Final Checklist

- [ ] New game creates 20-slot boxes
- [ ] Box grid displays 5x4 without overflow
- [ ] Keyboard navigation: right boundary at column 4
- [ ] Keyboard navigation: bottom boundary at row 3 (slot 15-19)
- [ ] Keyboard up from box-change goes to slot 19 (not 39)
- [ ] Team panel text responsive on mobile (no overflow)
- [ ] All commits pass pre-commit checks
