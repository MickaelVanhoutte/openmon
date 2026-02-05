# Admin Panel Rework

## TL;DR

> **Quick Summary**: Complete UX overhaul of the admin panel (#admin) - consolidating 6 tabs to 3, adding drag-drop pokedex ordering with regionalId updates, full-screen pokemon editing, and auto-populating moves when adding pokemon from raw data.
>
> **Deliverables**:
>
> - Move hydration utility with TDD (getMovesByPokemonId)
> - New 3-tab admin layout: Pokedex Manager, Add Pokemon, Animations
> - Drag-drop reorderable pokemon list with regionalId updates
> - Full-screen pokemon editor with inline moves editing
> - Add pokemon feature with ALL deduplicated moves included
> - Remove pokemon feature
> - Mobile-optimized touch targets (min 44px)
> - Desktop-optimized layout
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (move hydration) → Task 3 (Add Pokemon tab) → Task 5 (integration)

---

## Context

### Original Request

Rework the admin (#admin) to make it usable. Goals: visualize pokedex, edit pokemon stats/types/abilities/moves, add pokemon from raw pokedex with their moves, manage pokedex order. Current UI doesn't work well on mobile or desktop.

### Interview Summary

**Key Discussions**:

- Layout: Full-screen editor with pokemon navigation preferred
- Tab consolidation: 6 tabs → 3 tabs (Pokedex Manager, Add Pokemon, Animations)
- Remove standalone Moves Browser/Editor - only edit moves via Pokemon context
- Add pokemon: Include ALL learnable moves (deduplicated across game versions)
- Ordering: Drag-drop reorder that updates regionalId values
- Remove: Add ability to remove pokemon from custom pokedex
- Animations tab: Keep as-is (no feature changes, OK to restyle for consistency)

**Research Findings**:

- AddContent.svelte creates pokemon with EMPTY moves array - needs fix
- pokemon-moves.json has moves per version_group_id - must deduplicate
- PokemonEditor.svelte (lines 340-481) has inline moves editing - reuse this
- Tab buttons use 0.5rem font on mobile - too small
- Export downloads JSON, doesn't persist - keep this behavior

### Metis Review

**Identified Gaps** (addressed):

- Move version ambiguity: Resolved → ALL moves (deduplicated)
- Drag-drop scope: Resolved → Updates regionalId values
- Remove pokemon: Added to scope
- Bulk add: Explicitly excluded (single add only)

---

## Work Objectives

### Core Objective

Transform the admin panel from a 6-tab, hard-to-navigate interface into a streamlined 3-tab design with full-screen editing, drag-drop ordering, and complete move auto-population when adding pokemon.

### Concrete Deliverables

- `src/js/pokemons/move-hydration.ts` - Utility to get all moves for a pokemon
- `src/js/__tests__/move-hydration.test.ts` - Unit tests for move hydration
- `src/lib/admin/AdminPage.svelte` - Refactored with 3-tab structure
- `src/lib/admin/tabs/PokedexManager.svelte` - New combined browser/editor
- `src/lib/admin/tabs/AddPokemon.svelte` - Refactored from AddContent.svelte
- `src/lib/admin/tabs/AnimationsTab.svelte` - Kept (styling updates only)
- Removed: `MovesBrowser.svelte`, `MoveEditor.svelte` as tabs

### Definition of Done

- [ ] `npm run test:run` passes all move-hydration tests
- [ ] Playwright: Can navigate #admin, see 3 tabs
- [ ] Playwright: Can reorder pokemon via drag-drop
- [ ] Playwright: Can add pokemon with moves auto-populated
- [ ] Playwright: Can remove pokemon from pokedex
- [ ] Mobile touch targets ≥ 44px verified via Playwright measurement

### Must Have

- Move hydration utility that returns all deduplicated moves for a pokemon ID
- 3-tab structure replacing current 6-tab
- Drag-drop pokemon reordering that updates regionalId
- Full-screen pokemon editor accessible from list
- Add pokemon includes all moves by default
- Remove pokemon button
- Mobile touch targets ≥ 44px
- Export button functionality preserved

### Must NOT Have (Guardrails)

- No standalone Move Browser/Editor tabs
- No version_group selector - always use ALL moves deduplicated
- No bulk add operations
- No undo/history features
- No import functionality
- No move effects editing (MoveEffect objects)
- No evolution chain editing
- No file system persistence (keep download-only export)
- No changes to Animations tab functionality (styling OK)

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> ALL verification is executed by the agent using tools (Playwright, Vitest, curl, etc.).

### Test Decision

- **Infrastructure exists**: YES (Vitest with 32 test files)
- **Automated tests**: TDD for data logic only
- **Framework**: Vitest

### TDD Coverage

- `src/js/pokemons/move-hydration.ts` - Unit tests for move lookup/hydration
- Deduplication logic - Unit tests for version merging

### Agent-Executed QA Scenarios

- Playwright for all UI verification (navigation, drag-drop, forms)
- All scenarios include exact selectors and evidence capture

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Move Hydration Utility (TDD) - no dependencies
└── Task 2: AdminPage 3-Tab Structure - no dependencies

Wave 2 (After Wave 1):
├── Task 3: Add Pokemon Tab (depends: 1) - needs move hydration
├── Task 4: Pokedex Manager Tab (depends: 2) - needs new structure
└── Task 5: Mobile/Desktop Optimization (depends: 2)

Wave 3 (After Wave 2):
└── Task 6: Integration Testing & Cleanup (depends: 3, 4, 5)

Critical Path: Task 1 → Task 3 → Task 6
Parallel Speedup: ~35% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
| ---- | ---------- | ------ | -------------------- |
| 1    | None       | 3      | 2                    |
| 2    | None       | 4, 5   | 1                    |
| 3    | 1          | 6      | 4, 5                 |
| 4    | 2          | 6      | 3, 5                 |
| 5    | 2          | 6      | 3, 4                 |
| 6    | 3, 4, 5    | None   | None (final)         |

### Agent Dispatch Summary

| Wave | Tasks   | Recommended Dispatch                   |
| ---- | ------- | -------------------------------------- |
| 1    | 1, 2    | Parallel: Two sisyphus-junior agents   |
| 2    | 3, 4, 5 | Parallel: Three sisyphus-junior agents |
| 3    | 6       | Sequential: Integration agent          |

---

## TODOs

- [ ] 1. Create Move Hydration Utility (TDD)

  **What to do**:
  - Create `src/js/pokemons/move-hydration.ts` with function `getMovesByPokemonId(pokemonId: number): Move[]`
  - Load pokemon-moves.json (raw move mappings per version)
  - Load moves.json (full move data)
  - For given pokemonId: collect all move_ids across ALL version_group_ids
  - Deduplicate by move_id (keep highest level if duplicates exist)
  - Hydrate each move_id to full Move object matching PokedexEntry.moves structure
  - Handle edge case: pokemon with 0 moves in raw data → return empty array
  - Write tests FIRST (RED), then implement (GREEN), then refactor

  **Must NOT do**:
  - Do not add version_group filtering - always return ALL moves
  - Do not modify existing pokedex.ts or Pokedex class
  - Do not touch any Svelte components

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Isolated utility function with clear TDD scope, no UI complexity
  - **Skills**: [`git-master`]
    - `git-master`: Clean atomic commit after tests pass
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No UI work in this task
    - `playwright`: No browser testing needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3 (Add Pokemon needs move hydration)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/js/pokemons/pokedex.ts:Move` interface - Target output structure for hydrated moves
  - `src/lib/admin/tabs/AddContent.svelte:24-25` - Current raw JSON imports pattern

  **Data References**:
  - `src/assets/data/raw/moves/pokemon-moves.json` - Move mappings: {pokemon_id, move_id, level, method, version_group_id}
  - `src/assets/data/raw/moves/moves.json` - Full move data keyed by move_id
  - `src/assets/data/final/beta/pokedex-animatedV3.json` - Example of expected Move structure in output

  **Test References**:
  - `src/js/__tests__/pokedex.test.ts` - Testing patterns for pokedex utilities

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/move-hydration.test.ts`
  - [ ] Test: getMovesByPokemonId(1) returns array of moves for Bulbasaur
  - [ ] Test: Each returned move has required fields (id, name, type, level, method)
  - [ ] Test: Moves are deduplicated (no duplicate move_ids)
  - [ ] Test: getMovesByPokemonId(999999) returns empty array for non-existent pokemon
  - [ ] `npm run test:run -- move-hydration` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Move hydration returns valid moves
    Tool: Bash (node/bun)
    Preconditions: Utility implemented, raw JSON files exist
    Steps:
      1. npm run test:run -- move-hydration
      2. Assert: All tests pass
      3. Assert: Exit code 0
    Expected Result: All unit tests pass
    Evidence: Test output captured in terminal
  ```

  **Commit**: YES
  - Message: `feat(admin): add move hydration utility for pokemon`
  - Files: `src/js/pokemons/move-hydration.ts`, `src/js/__tests__/move-hydration.test.ts`
  - Pre-commit: `npm run test:run -- move-hydration`

---

- [ ] 2. Refactor AdminPage to 3-Tab Structure

  **What to do**:
  - Modify `src/lib/admin/AdminPage.svelte` to have 3 tabs: `pokedex-manager`, `add-pokemon`, `animations`
  - Update TabId type union to match new tabs
  - Remove references to `pokemon-browser`, `moves-browser`, `pokemon-editor`, `move-editor`, `add-content`
  - Keep shared state (editedPokemon, editedMoves maps) for tracking changes
  - Keep ExportButton in header
  - Update tab button styling for better touch targets (min 44px height)
  - Add `data-testid` attributes: `pokedex-manager-tab`, `add-pokemon-tab`, `animations-tab`

  **Must NOT do**:
  - Do not change Animations tab functionality - only update import path if needed
  - Do not implement PokedexManager or AddPokemon content yet - just structure

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Structural UI refactoring with styling considerations
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Tab navigation, responsive design, touch targets
  - **Skills Evaluated but Omitted**:
    - `playwright`: QA done in separate integration task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 4, 5 (need new structure)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/lib/admin/AdminPage.svelte:11-16` - Current TabId union type
  - `src/lib/admin/AdminPage.svelte:82-145` - Current tab button rendering

  **Style References**:
  - `src/lib/admin/AdminPage.svelte:174-227` - Current SCSS styles, mobile breakpoints

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Admin shows 3 tabs
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Wait for: .admin-page visible (timeout: 5s)
      3. Assert: Exactly 3 tab buttons exist
      4. Assert: Tab with data-testid="pokedex-manager-tab" exists
      5. Assert: Tab with data-testid="add-pokemon-tab" exists
      6. Assert: Tab with data-testid="animations-tab" exists
      7. Screenshot: .sisyphus/evidence/task-2-three-tabs.png
    Expected Result: 3 tabs visible in admin header
    Evidence: .sisyphus/evidence/task-2-three-tabs.png

  Scenario: Tab buttons have adequate touch targets
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, mobile viewport (375x667)
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Set viewport: 375x667 (iPhone SE)
      3. Get bounding box of [data-testid="pokedex-manager-tab"]
      4. Assert: height >= 44
      5. Screenshot: .sisyphus/evidence/task-2-mobile-tabs.png
    Expected Result: Touch target at least 44px tall
    Evidence: .sisyphus/evidence/task-2-mobile-tabs.png
  ```

  **Commit**: YES
  - Message: `refactor(admin): consolidate to 3-tab structure`
  - Files: `src/lib/admin/AdminPage.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 3. Implement Add Pokemon Tab with Move Auto-Population

  **What to do**:
  - Rename/refactor `AddContent.svelte` → `AddPokemon.svelte` (or create new)
  - Display pokemon from raw pokedex that are NOT in custom pokedex
  - Add search/filter functionality
  - When adding pokemon: use `getMovesByPokemonId()` to populate ALL moves
  - Include a "Remove" button for each pokemon already in custom pokedex
  - Remove the "Assign Moves" panel (moves come with pokemon now)
  - Emit events/callbacks when pokemon added or removed

  **Must NOT do**:
  - No bulk add feature - single pokemon at a time only
  - No manual move assignment in this tab - all moves auto-included
  - Do not modify raw pokedex or moves data

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI-heavy feature with state management
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: List rendering, search/filter, action buttons
  - **Skills Evaluated but Omitted**:
    - `playwright`: QA in integration task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 6 (integration)
  - **Blocked By**: Task 1 (needs move hydration utility)

  **References**:

  **Pattern References**:
  - `src/lib/admin/tabs/AddContent.svelte:74-158` - Current pokemon add flow
  - `src/lib/admin/tabs/AddContent.svelte:24-30` - Raw JSON imports

  **Utility References**:
  - `src/js/pokemons/move-hydration.ts:getMovesByPokemonId` - Use this for move population (from Task 1)

  **Type References**:
  - `src/js/pokemons/pokedex.ts:PokedexEntry` - Structure for added pokemon

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Add pokemon includes all moves
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, at least one pokemon not in custom pokedex
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Click: [data-testid="add-pokemon-tab"]
      3. Wait for: Pokemon list visible (timeout: 5s)
      4. Click: First "Add" button in available pokemon list
      5. Wait for: Success indicator or list update (timeout: 3s)
      6. Navigate to Pokedex Manager tab
      7. Find newly added pokemon
      8. Assert: Pokemon has moves.length > 0
      9. Screenshot: .sisyphus/evidence/task-3-add-with-moves.png
    Expected Result: Added pokemon has moves auto-populated
    Evidence: .sisyphus/evidence/task-3-add-with-moves.png

  Scenario: Remove pokemon from pokedex
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, custom pokedex has at least one pokemon
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Click: [data-testid="add-pokemon-tab"]
      3. Find pokemon currently in custom pokedex (should show Remove button)
      4. Note pokemon name
      5. Click: Remove button
      6. Wait for: List update (timeout: 3s)
      7. Assert: Pokemon now shows "Add" button instead of "Remove"
      8. Screenshot: .sisyphus/evidence/task-3-remove-pokemon.png
    Expected Result: Pokemon removed from custom pokedex
    Evidence: .sisyphus/evidence/task-3-remove-pokemon.png
  ```

  **Commit**: YES
  - Message: `feat(admin): add pokemon tab with auto-populated moves`
  - Files: `src/lib/admin/tabs/AddPokemon.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 4. Build Pokedex Manager with Drag-Drop Reordering

  **What to do**:
  - Create `src/lib/admin/tabs/PokedexManager.svelte`
  - Display ALL pokemon in custom pokedex as a reorderable list
  - Implement drag-drop reordering using svelte-dnd-action or SortableJS
  - When reordered: update `regionalId` values to match new order
  - Clicking a pokemon opens full-screen editor overlay/modal
  - Full-screen editor includes:
    - All fields from PokemonEditor (name, types, stats, moves, etc.)
    - Navigation (prev/next pokemon) or swipe gestures
    - Close button to return to list
  - Add search/filter by name or type
  - Show visual indicator for unsaved changes

  **Must NOT do**:
  - Do not implement undo/history for reordering
  - Do not change pokemon `id` - only `regionalId` updates
  - Do not add bulk actions

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI with drag-drop, overlay, responsive design
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Drag-drop, overlays, responsive editing
  - **Skills Evaluated but Omitted**:
    - `playwright`: QA in integration task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Task 6 (integration)
  - **Blocked By**: Task 2 (needs new tab structure)

  **References**:

  **Pattern References**:
  - `src/lib/admin/tabs/PokemonBrowser.svelte:37-91` - List rendering pattern
  - `src/lib/admin/tabs/PokemonEditor.svelte:340-481` - Moves editing UI to embed
  - `src/lib/admin/tabs/PokemonEditor.svelte:1-100` - Editor form structure

  **Library References**:
  - `svelte-dnd-action` - Recommended drag-drop library for Svelte 5
  - `@dnd-kit/core` - Alternative if svelte-dnd-action has issues

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Drag pokemon to reorder updates regionalId
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, pokedex has 3+ pokemon
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Click: [data-testid="pokedex-manager-tab"]
      3. Wait for: Pokemon list visible (timeout: 5s)
      4. Note: First pokemon name and regionalId
      5. Drag: First pokemon item to third position
      6. Wait for: List update (timeout: 2s)
      7. Assert: Pokemon that was first now has regionalId matching position 3
      8. Screenshot: .sisyphus/evidence/task-4-drag-reorder.png
    Expected Result: Drag-drop updates regionalId
    Evidence: .sisyphus/evidence/task-4-drag-reorder.png

  Scenario: Click pokemon opens full-screen editor
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, pokedex has pokemon
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Click: [data-testid="pokedex-manager-tab"]
      3. Wait for: Pokemon list visible (timeout: 5s)
      4. Click: First pokemon item (not drag)
      5. Wait for: Editor overlay/modal visible (timeout: 3s)
      6. Assert: Pokemon name field visible and editable
      7. Assert: Stats fields visible
      8. Assert: Moves section visible
      9. Assert: Close button visible
      10. Screenshot: .sisyphus/evidence/task-4-fullscreen-editor.png
    Expected Result: Full-screen editor opens
    Evidence: .sisyphus/evidence/task-4-fullscreen-editor.png

  Scenario: Editor has prev/next navigation
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, pokedex has 3+ pokemon, editor open
    Steps:
      1. From previous scenario, editor is open
      2. Note: Current pokemon name
      3. Click: Next button
      4. Wait for: Editor updates (timeout: 2s)
      5. Assert: Pokemon name changed
      6. Click: Prev button
      7. Assert: Original pokemon name restored
      8. Screenshot: .sisyphus/evidence/task-4-editor-navigation.png
    Expected Result: Can navigate between pokemon in editor
    Evidence: .sisyphus/evidence/task-4-editor-navigation.png
  ```

  **Commit**: YES
  - Message: `feat(admin): pokedex manager with drag-drop and full-screen editor`
  - Files: `src/lib/admin/tabs/PokedexManager.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 5. Mobile & Desktop Layout Optimization

  **What to do**:
  - Ensure all touch targets ≥ 44px on mobile (buttons, list items, form fields)
  - Optimize Pokedex Manager for desktop: side-by-side list + editor if screen wide enough
  - Optimize Add Pokemon for desktop: larger cards, better grid layout
  - Add responsive breakpoints:
    - Mobile (<768px): Full-screen panels, stacked layout
    - Tablet (768-1024px): Optional side panel
    - Desktop (>1024px): Side-by-side layout where appropriate
  - Ensure drag-drop works on touch devices (long-press to drag)
  - Test and fix any scroll issues with editor overlay

  **Must NOT do**:
  - Do not add tablet-specific features - just responsive styling
  - Do not change any functionality - only layout/styling

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Pure CSS/responsive work
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Responsive design, touch optimization
  - **Skills Evaluated but Omitted**:
    - `playwright`: QA in this task for verification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 6 (integration)
  - **Blocked By**: Task 2 (needs new structure to style)

  **References**:

  **Style References**:
  - `src/lib/admin/AdminPage.svelte:174-227` - Current responsive breakpoints
  - `src/lib/admin/tabs/PokemonEditor.svelte:745-859` - Current editor styles

  **Pattern References**:
  - `src/lib/menus/PokemonMenuList.svelte` - Example of list styling
  - `src/lib/common/Modal.svelte` - Modal/overlay patterns

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Mobile touch targets adequate
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Set viewport: 375x667 (iPhone SE)
      3. For each interactive element:
         - Get bounding box
         - Assert: min(width, height) >= 44
      4. Screenshot: .sisyphus/evidence/task-5-mobile-touch.png
    Expected Result: All touch targets at least 44px
    Evidence: .sisyphus/evidence/task-5-mobile-touch.png

  Scenario: Desktop layout uses space efficiently
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Set viewport: 1920x1080 (desktop)
      3. Click: [data-testid="pokedex-manager-tab"]
      4. Assert: Layout is not single-column (uses horizontal space)
      5. Screenshot: .sisyphus/evidence/task-5-desktop-layout.png
    Expected Result: Desktop uses horizontal layout
    Evidence: .sisyphus/evidence/task-5-desktop-layout.png

  Scenario: Touch drag works on mobile
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, pokedex has pokemon
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Set viewport: 375x667 (iPhone SE)
      3. Click: [data-testid="pokedex-manager-tab"]
      4. Perform touch-and-hold on first pokemon (500ms)
      5. Drag to third position
      6. Assert: Order changed
      7. Screenshot: .sisyphus/evidence/task-5-touch-drag.png
    Expected Result: Touch drag-and-drop works
    Evidence: .sisyphus/evidence/task-5-touch-drag.png
  ```

  **Commit**: YES
  - Message: `style(admin): optimize mobile and desktop layouts`
  - Files: `src/lib/admin/*.svelte`, `src/lib/admin/tabs/*.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 6. Integration Testing & Cleanup

  **What to do**:
  - Run full end-to-end verification of all features
  - Verify Export button still works with new structure
  - Remove old unused components (MovesBrowser, MoveEditor if unused)
  - Use `lsp_find_references` before deleting to confirm no external dependencies
  - Update any imports in AdminPage that reference old tabs
  - Final mobile + desktop Playwright verification
  - Verify Animations tab still works unchanged

  **Must NOT do**:
  - Do not change Animations tab functionality
  - Do not add new features - only integration verification

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Cleanup and verification, not complex implementation
  - **Skills**: [`playwright`, `git-master`]
    - `playwright`: Full integration testing
    - `git-master`: Final cleanup commit
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No new UI work

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None (final)
  - **Blocked By**: Tasks 3, 4, 5

  **References**:

  **Component References**:
  - `src/lib/admin/tabs/MovesBrowser.svelte` - Candidate for removal
  - `src/lib/admin/tabs/MoveEditor.svelte` - Candidate for removal
  - `src/lib/admin/components/ExportButton.svelte` - Verify still works

  **Test References**:
  - All QA scenarios from Tasks 2-5 - Re-run as integration suite

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Full admin workflow
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Assert: 3 tabs visible
      3. Click: Add Pokemon tab
      4. Add a new pokemon
      5. Assert: Pokemon added with moves
      6. Click: Pokedex Manager tab
      7. Find newly added pokemon
      8. Drag to reorder
      9. Click to edit
      10. Change a stat
      11. Close editor
      12. Click Export button
      13. Assert: Download triggered
      14. Click: Animations tab
      15. Assert: Animations content visible
      16. Screenshot: .sisyphus/evidence/task-6-full-workflow.png
    Expected Result: Complete workflow succeeds
    Evidence: .sisyphus/evidence/task-6-full-workflow.png

  Scenario: No broken imports after cleanup
    Tool: Bash
    Preconditions: Old components removed
    Steps:
      1. npm run check
      2. Assert: No TypeScript errors
      3. Assert: Exit code 0
    Expected Result: Build succeeds
    Evidence: Terminal output captured

  Scenario: Animations tab unchanged
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:5173/#admin
      2. Click: [data-testid="animations-tab"]
      3. Assert: Animation controls visible
      4. Assert: Can trigger animation preview
      5. Screenshot: .sisyphus/evidence/task-6-animations-intact.png
    Expected Result: Animations functionality intact
    Evidence: .sisyphus/evidence/task-6-animations-intact.png
  ```

  **Commit**: YES
  - Message: `chore(admin): cleanup old components and finalize integration`
  - Files: Removed `MovesBrowser.svelte`, `MoveEditor.svelte` if unused
  - Pre-commit: `npm run check && npm run test:run`

---

## Commit Strategy

| After Task | Message                                                              | Files                        | Verification                       |
| ---------- | -------------------------------------------------------------------- | ---------------------------- | ---------------------------------- |
| 1          | `feat(admin): add move hydration utility for pokemon`                | move-hydration.ts, test file | npm run test:run -- move-hydration |
| 2          | `refactor(admin): consolidate to 3-tab structure`                    | AdminPage.svelte             | npm run check                      |
| 3          | `feat(admin): add pokemon tab with auto-populated moves`             | AddPokemon.svelte            | npm run check                      |
| 4          | `feat(admin): pokedex manager with drag-drop and full-screen editor` | PokedexManager.svelte        | npm run check                      |
| 5          | `style(admin): optimize mobile and desktop layouts`                  | Multiple .svelte files       | npm run check                      |
| 6          | `chore(admin): cleanup old components and finalize integration`      | Remove old tabs              | npm run check && npm run test:run  |

---

## Success Criteria

### Verification Commands

```bash
npm run check        # Expected: No TypeScript errors
npm run test:run     # Expected: All tests pass including move-hydration
npm run lint         # Expected: No linting errors
```

### Final Checklist

- [ ] 3-tab structure: Pokedex Manager, Add Pokemon, Animations
- [ ] Drag-drop reordering updates regionalId
- [ ] Add pokemon includes ALL deduplicated moves
- [ ] Remove pokemon button works
- [ ] Full-screen editor accessible from list
- [ ] Mobile touch targets ≥ 44px
- [ ] Desktop layout uses horizontal space
- [ ] Export button works
- [ ] Animations tab unchanged
- [ ] No standalone Moves Browser/Editor tabs
- [ ] No bulk add functionality
- [ ] All Playwright QA scenarios pass
