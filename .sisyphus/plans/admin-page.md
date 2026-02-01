# Admin Page - Pokédex Administration System

## TL;DR

> **Quick Summary**: Merge AnimationTestPage with a full Pokédex administration system into a unified tabbed interface at `#admin` route. Allows browsing, editing, and adding Pokemon/moves with JSON export.
>
> **Deliverables**:
>
> - AdminPage.svelte with 6 tabs (Animations, Pokemon Browser, Moves Browser, Pokemon Editor, Move Editor, Add Content)
> - Restyled AnimationTestPage matching game pixel-art UI
> - Search/filter for Pokemon and moves by name/type
> - Add new Pokemon from raw/pokedex.json
> - Assign moves from raw/moves.json to Pokemon
> - JSON export of modified data
>
> **Estimated Effort**: Large (8-10 tasks)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 8

---

## Context

### Original Request

Merge the debug-animation page with a full administration system for customizing the Pokédex JSON - adding/removing Pokemon, updating stats/types/moves.

### Interview Summary

**Key Discussions**:

- Route: `#admin` replacing `#debug-animations`
- 6 tabs: Animations, Pokemon Browser, Moves Browser, Pokemon Editor, Move Editor, Add Content
- Restyle AnimationTestPage to match game UI (--pixel-\* CSS variables)
- Conservative protection: id, evolution, sprites, effects are read-only
- Add Pokemon from `src/assets/data/raw/dex/pokedex.json`
- Assign moves from `src/assets/data/raw/moves/moves.json`
- In-memory editing with JSON export (no backend)
- No automated tests

**Research Findings**:

- AnimationTestPage uses hardcoded colors, needs restyling
- Moves are embedded in Pokemon entries, need aggregation for Moves Browser
- Raw JSON files have different structure than final pokedex
- Game uses pixel-tab-active()/pixel-tab-inactive() mixins for tabs

### Metis Review

**Identified Gaps** (addressed):

- Move data aggregation: Resolved - aggregate unique moves from all Pokemon
- AnimationTestPage styling: Resolved - user chose to restyle
- Read-only fields: Resolved - conservative protection chosen
- Raw data structure differences: Resolved - user confirmed file paths

---

## Work Objectives

### Core Objective

Create a unified admin interface that combines animation testing with full Pokédex data management capabilities.

### Concrete Deliverables

- `src/lib/admin/AdminPage.svelte` - Main tabbed container
- `src/lib/admin/tabs/AnimationsTab.svelte` - Restyled wrapper
- `src/lib/admin/tabs/PokemonBrowser.svelte` - List + search + filter
- `src/lib/admin/tabs/MovesBrowser.svelte` - Aggregated moves list
- `src/lib/admin/tabs/PokemonEditor.svelte` - Edit form
- `src/lib/admin/tabs/MoveEditor.svelte` - Edit form
- `src/lib/admin/tabs/AddContent.svelte` - Add Pokemon/assign moves
- `src/lib/admin/components/ExportButton.svelte` - JSON download
- Updated `src/App.svelte` routing

### Definition of Done

- [ ] `npm run dev` starts successfully
- [ ] `npm run check` passes with no errors
- [ ] Navigate to `#admin` shows admin page with 6 tabs
- [ ] All tabs are functional and styled consistently

### Must Have

- Tab navigation with pixel-art styling
- Pokemon browser with name/type search
- Moves browser with aggregated moves
- Pokemon editor (stats, types, abilities editable)
- Move editor (power, accuracy, PP editable)
- Add Pokemon from raw pokedex.json
- Assign moves from raw moves.json
- JSON export button
- AnimationTestPage restyled to match

### Must NOT Have (Guardrails)

- NO backend/database persistence
- NO import/load JSON feature (export only)
- NO editing of id, evolution chains, sprite paths
- NO editing of move effect system
- NO undo/redo functionality
- NO batch operations (one item at a time)
- NO form validation beyond required fields
- NO confirmation dialogs for edits
- NO loading spinners (data is in-memory)
- NO virtualized lists (simple scroll is fine for ~250 Pokemon)

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest configured)
- **User wants tests**: NO (manual verification only)
- **Framework**: None for this feature

### Automated Verification (Playwright-based)

Each TODO includes executable verification procedures:

**For Frontend/UI changes** (using Playwright skill):

```
# Agent navigates, clicks, fills forms, takes screenshots
1. Navigate to URL
2. Click elements by selector
3. Fill inputs
4. Assert visibility/text content
5. Screenshot evidence to .sisyphus/evidence/
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: AdminPage shell + tab navigation
└── Task 2: Restyle AnimationTestPage

Wave 2 (After Wave 1):
├── Task 3: Pokemon Browser
├── Task 4: Moves Browser (aggregation)
└── Task 5: Pokemon Editor

Wave 3 (After Wave 2):
├── Task 6: Move Editor
├── Task 7: Add Content tab
└── Task 8: Export functionality + App.svelte routing

Critical Path: Task 1 → Task 3 → Task 8
Parallel Speedup: ~40% faster than sequential
```

### Dependency Matrix

| Task | Depends On    | Blocks           | Can Parallelize With |
| ---- | ------------- | ---------------- | -------------------- |
| 1    | None          | 3, 4, 5, 6, 7, 8 | 2                    |
| 2    | None          | None             | 1                    |
| 3    | 1             | 5, 8             | 4                    |
| 4    | 1             | 6, 8             | 3, 5                 |
| 5    | 1, 3          | 8                | 4, 6                 |
| 6    | 1, 4          | 8                | 5, 7                 |
| 7    | 1             | 8                | 5, 6                 |
| 8    | 3, 4, 5, 6, 7 | None             | None (final)         |

### Agent Dispatch Summary

| Wave | Tasks   | Recommended Agents                           |
| ---- | ------- | -------------------------------------------- |
| 1    | 1, 2    | visual-engineering with frontend-ui-ux skill |
| 2    | 3, 4, 5 | visual-engineering parallel dispatch         |
| 3    | 6, 7, 8 | visual-engineering, final integration        |

---

## TODOs

- [x] 1. Create AdminPage shell with tab navigation

  **What to do**:
  - Create directory structure: `src/lib/admin/`, `src/lib/admin/tabs/`, `src/lib/admin/components/`
  - Create `AdminPage.svelte` with:
    - 6 tab buttons: Animations, Pokemon Browser, Moves Browser, Pokemon Editor, Move Editor, Add Content
    - Tab state using Svelte 5 `$state()` rune
    - Conditional rendering of tab content
    - Pixel-art styling using `--pixel-*` CSS variables
    - Use `pixel-tab-active()` and `pixel-tab-inactive()` mixins from `_pixel-art.scss`
  - Create placeholder components for each tab

  **Must NOT do**:
  - Do NOT add routing logic yet (Task 8)
  - Do NOT implement actual tab content yet (Tasks 2-7)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component creation with specific styling requirements
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for pixel-art styling and tab navigation patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5, 6, 7, 8
  - **Blocked By**: None (can start immediately)

  **References**:
  - `src/lib/menus/pokedex/Pokedex.svelte:1-60` - Tab/panel structure pattern
  - `src/styles/_pixel-art.scss:87-96` - Tab styling mixins
  - `src/lib/debug/AnimationTestPage.svelte:256-280` - Header styling example

  **Acceptance Criteria**:

  ```playwright
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/
  2. Execute: window.location.hash = '#admin'
  3. Wait for: selector ".admin-page" to be visible
  4. Assert: 6 tab buttons visible with text "Animations", "Pokemon Browser", etc.
  5. Click: tab "Pokemon Browser"
  6. Assert: Pokemon Browser tab content area visible
  7. Screenshot: .sisyphus/evidence/task-1-admin-tabs.png
  ```

  **Commit**: YES
  - Message: `feat(admin): create AdminPage shell with tab navigation`
  - Files: `src/lib/admin/AdminPage.svelte`, `src/lib/admin/tabs/*.svelte`
  - Pre-commit: `npm run check`

---

- [x] 2. Restyle AnimationTestPage to match game UI

  **What to do**:
  - Update `AnimationTestPage.svelte` to use CSS variables instead of hardcoded colors:
    - Replace `#1a1a2e` → `var(--pixel-bg-primary)`
    - Replace `#16213e` → `var(--pixel-bg-panel)`
    - Replace `#0f3460` → `var(--pixel-border-color)`
    - Replace `#e94560` → `var(--pixel-accent-red)`
    - Replace `#3b82f6` → `var(--pixel-accent-blue)`
    - Replace `#4ade80` → `var(--pixel-accent-green)`
  - Update header to match game menu headers
  - Ensure font-family uses game font stack
  - Test animation functionality still works after restyling

  **Must NOT do**:
  - Do NOT change animation logic or functionality
  - Do NOT restructure the component
  - Do NOT move the file (keep in `src/lib/debug/`)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS styling changes with design system alignment
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for CSS variable usage and consistent styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: None (AnimationsTab will import this)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `src/lib/debug/AnimationTestPage.svelte:256-412` - Current styles to update
  - `src/styles/_pixel-art.scss:1-50` - CSS variable definitions
  - `src/lib/menus/pokedex/Pokedex.svelte` - Example of styled game component

  **Acceptance Criteria**:

  ```playwright
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/#debug-animations
  2. Wait for: selector ".animation-test-page" to be visible
  3. Execute: getComputedStyle(document.querySelector('.animation-test-page')).backgroundColor
  4. Assert: Background uses CSS variable value (not hardcoded #1a1a2e)
  5. Click: button "Play"
  6. Wait for: 2 seconds (animation plays)
  7. Assert: No console errors
  8. Screenshot: .sisyphus/evidence/task-2-restyled-animations.png
  ```

  **Commit**: YES
  - Message: `style(debug): restyle AnimationTestPage to match game UI`
  - Files: `src/lib/debug/AnimationTestPage.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 3. Create Pokemon Browser tab with search/filter

  **What to do**:
  - Create `src/lib/admin/tabs/PokemonBrowser.svelte`:
    - Load Pokemon from Pokedex class via tsyringe container
    - Display scrollable list of all Pokemon (id, name, types, sprite thumbnail)
    - Name search input (filters as user types)
    - Type filter dropdown (using typeChart keys)
    - Click to select Pokemon (emit event or callback for editor)
    - Keyboard navigation (up/down arrows, Enter to select)
  - Use Svelte 5 runes ($state, $derived for filtered list)
  - Style to match Pokedex.svelte patterns

  **Must NOT do**:
  - Do NOT implement Pokemon editing (Task 5)
  - Do NOT add pagination (simple scroll is sufficient)
  - Do NOT add sorting options

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: List UI with search/filter and game styling
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for list design and filter UX

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 5 (editor needs selection), Task 8
  - **Blocked By**: Task 1 (needs AdminPage shell)

  **References**:
  - `src/lib/menus/pokedex/Pokedex.svelte:22-80` - Search/filter pattern
  - `src/js/pokemons/pokedex.ts:185-288` - Pokedex class, findByName, entries
  - `src/js/battle/battle-model.ts` - typeChart for type filter dropdown

  **Acceptance Criteria**:

  ```playwright
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/#admin
  2. Click: tab "Pokemon Browser"
  3. Wait for: selector "[data-testid='pokemon-list']" to be visible
  4. Assert: List contains at least 150 Pokemon entries
  5. Fill: input[placeholder*="Search"] with "pika"
  6. Assert: Only Pokemon with "pika" in name visible (Pikachu, etc.)
  7. Select: type filter dropdown → "Electric"
  8. Assert: All visible Pokemon have Electric type
  9. Screenshot: .sisyphus/evidence/task-3-pokemon-browser.png
  ```

  **Commit**: YES
  - Message: `feat(admin): add Pokemon Browser tab with search and type filter`
  - Files: `src/lib/admin/tabs/PokemonBrowser.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 4. Create Moves Browser tab with aggregated moves

  **What to do**:
  - Create `src/lib/admin/tabs/MovesBrowser.svelte`:
    - Aggregate unique moves from all Pokemon entries on component mount
    - Store in local $state (do NOT modify Pokedex)
    - Display scrollable list: move name, type, category, power, accuracy, PP
    - Name search input
    - Type filter dropdown
    - Category filter (physical/special/status)
    - Click to select move (for editor)
  - Handle move deduplication (same move appears on multiple Pokemon)
  - Use $derived for filtered list

  **Must NOT do**:
  - Do NOT modify the Pokedex class or Move class
  - Do NOT implement move editing (Task 6)
  - Do NOT create a separate moves database file

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: List UI with data aggregation and filtering
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for list design and filter patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Task 6 (editor needs selection), Task 8
  - **Blocked By**: Task 1 (needs AdminPage shell)

  **References**:
  - `src/js/pokemons/pokedex.ts:446-529` - Move class structure
  - `src/lib/menus/pokedex/Pokedex.svelte:22-80` - Filter pattern to follow
  - `src/js/pokemons/pokedex.ts:185-236` - Pokedex.entries access

  **Acceptance Criteria**:

  ```playwright
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/#admin
  2. Click: tab "Moves Browser"
  3. Wait for: selector "[data-testid='moves-list']" to be visible
  4. Assert: List contains at least 100 unique moves
  5. Fill: input[placeholder*="Search"] with "thunder"
  6. Assert: Moves containing "thunder" visible (Thunderbolt, Thunder, etc.)
  7. Select: category filter → "special"
  8. Assert: All visible moves have "special" category
  9. Screenshot: .sisyphus/evidence/task-4-moves-browser.png
  ```

  **Commit**: YES
  - Message: `feat(admin): add Moves Browser tab with aggregated moves and filters`
  - Files: `src/lib/admin/tabs/MovesBrowser.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 5. Create Pokemon Editor tab

  **What to do**:
  - Create `src/lib/admin/tabs/PokemonEditor.svelte`:
    - Receive selected Pokemon from browser (via prop or store)
    - Display form with editable fields:
      - name (text input)
      - types (multi-select dropdown, max 2)
      - abilities (text inputs, array)
      - stats: hp, attack, defense, spAttack, spDefense, speed (number inputs)
      - captureRate, baseXp (number inputs)
    - Display read-only fields (styled differently):
      - id, regionalId
      - evolution chain (display only)
      - sprites (display paths only)
    - Store edits in local component state (clone Pokemon object)
    - "Apply" button to update in-memory edited data
    - "Reset" button to discard changes

  **Must NOT do**:
  - Do NOT allow editing id, evolution, sprites
  - Do NOT modify the original Pokedex.entries
  - Do NOT add validation beyond required fields
  - Do NOT add confirmation dialogs

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form UI with specific field layout and read-only styling
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for form design and field organization

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1, Task 3 (needs Pokemon selection)

  **References**:
  - `src/js/pokemons/pokedex.ts:300-438` - PokedexEntry class, all fields
  - `src/js/pokemons/pokedex.ts:531-574` - Stats class structure
  - `src/lib/menus/pokedex/Pokedex.svelte` - Detail panel styling

  **Acceptance Criteria**:

  ```playwright
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/#admin
  2. Click: tab "Pokemon Browser"
  3. Click: Pokemon "Pikachu" in list
  4. Click: tab "Pokemon Editor"
  5. Assert: Form displays Pikachu data
  6. Assert: id field is disabled/read-only
  7. Clear and fill: input[name="hp"] with "50"
  8. Click: button "Apply"
  9. Assert: Success feedback (visual change or text)
  10. Screenshot: .sisyphus/evidence/task-5-pokemon-editor.png
  ```

  **Commit**: YES
  - Message: `feat(admin): add Pokemon Editor tab with editable stats and types`
  - Files: `src/lib/admin/tabs/PokemonEditor.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 6. Create Move Editor tab

  **What to do**:
  - Create `src/lib/admin/tabs/MoveEditor.svelte`:
    - Receive selected Move from browser (via prop or store)
    - Display form with editable fields:
      - name (text input)
      - type (single-select dropdown)
      - category (physical/special/no-damage dropdown)
      - power (number input, 0-255)
      - accuracy (number input, 0-100)
      - pp (number input, 1-40)
      - priority (number input, -7 to +5)
      - description (textarea)
    - Display read-only fields:
      - id
      - effect system (effect_id, effectChance - display only)
      - target (display only)
    - Store edits in local state
    - "Apply" and "Reset" buttons

  **Must NOT do**:
  - Do NOT allow editing effect system
  - Do NOT allow editing target type
  - Do NOT add complex validation

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form UI with dropdowns and number inputs
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for form layout

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1, Task 4 (needs Move selection)

  **References**:
  - `src/js/pokemons/pokedex.ts:446-529` - Move class structure
  - `src/js/battle/battle-model.ts` - typeChart for type dropdown
  - `src/lib/admin/tabs/PokemonEditor.svelte` - Similar form pattern (from Task 5)

  **Acceptance Criteria**:

  ```playwright
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/#admin
  2. Click: tab "Moves Browser"
  3. Click: Move "Thunderbolt" in list
  4. Click: tab "Move Editor"
  5. Assert: Form displays Thunderbolt data (power: 90, accuracy: 100)
  6. Assert: effect fields are disabled/read-only
  7. Clear and fill: input[name="power"] with "95"
  8. Click: button "Apply"
  9. Assert: Success feedback
  10. Screenshot: .sisyphus/evidence/task-6-move-editor.png
  ```

  **Commit**: YES
  - Message: `feat(admin): add Move Editor tab for power, accuracy, PP editing`
  - Files: `src/lib/admin/tabs/MoveEditor.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 7. Create Add Content tab (Pokemon + Moves from raw JSON)

  **What to do**:
  - Create `src/lib/admin/tabs/AddContent.svelte`:
    - Two sections: "Add Pokemon" and "Assign Moves"

    **Add Pokemon section**:
    - Load `src/assets/data/raw/dex/pokedex.json` via fetch
    - Display list of Pokemon not yet in active Pokedex
    - Search by name
    - Click to select, then "Add to Pokedex" button
    - Transform raw format to PokedexEntry format:
      - `name.english` → `name`
      - `base.HP/Attack/etc` → `stats`
      - `type[]` → `types`

    **Assign Moves section**:
    - Load `src/assets/data/raw/moves/moves.json` via fetch
    - Display list of available moves
    - Search by name
    - Select a Pokemon from current Pokedex
    - Select moves to assign
    - "Assign Moves" button adds to Pokemon's move list
    - Transform raw format: `identifier` → `name`, map `type_id` to type name

  **Must NOT do**:
  - Do NOT modify original JSON files
  - Do NOT add moves that already exist on the Pokemon
  - Do NOT allow removing Pokemon (only adding)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI with dual lists and data transformation
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for dual-panel UX design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 6)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1 (needs AdminPage shell)

  **References**:
  - `src/assets/data/raw/dex/pokedex.json` - Raw Pokemon format: id, name.english, type[], base{}
  - `src/assets/data/raw/moves/moves.json` - Raw move format: id, identifier, type_id, power, pp, accuracy
  - `src/js/pokemons/pokedex.ts:300-374` - PokedexEntry constructor for format mapping
  - `src/js/pokemons/pokedex.ts:446-505` - Move constructor for format mapping

  **Acceptance Criteria**:

  ```playwright
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/#admin
  2. Click: tab "Add Content"
  3. Wait for: "Add Pokemon" section visible
  4. Fill: input[placeholder*="Search Pokemon"] with "mewtwo"
  5. Assert: Mewtwo appears in available list (if not already in Pokedex)
  6. Click: "Add to Pokedex" button
  7. Assert: Success feedback
  8. Navigate to: Pokemon Browser tab
  9. Assert: Newly added Pokemon appears in list
  10. Screenshot: .sisyphus/evidence/task-7-add-content.png
  ```

  **Commit**: YES
  - Message: `feat(admin): add Add Content tab for Pokemon/move additions from raw JSON`
  - Files: `src/lib/admin/tabs/AddContent.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 8. Add Export functionality and update App.svelte routing

  **What to do**:
  - Create `src/lib/admin/components/ExportButton.svelte`:
    - Button styled to match game UI
    - On click: gather all modified data (edited Pokemon, edited moves, added Pokemon)
    - Generate JSON blob
    - Trigger browser download with filename `pokedex-modified-{timestamp}.json`
  - Update `src/App.svelte`:
    - Change routing from `#debug-animations` to `#admin`
    - Import and conditionally render AdminPage
    - Keep backward compatibility: `#debug-animations` redirects to `#admin`
  - Integrate ExportButton into AdminPage header

  **Must NOT do**:
  - Do NOT create import functionality
  - Do NOT use localStorage
  - Do NOT break existing game functionality

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small integration task with routing update
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Needed for button styling

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 3, 4, 5, 6, 7 (needs all data to export)

  **References**:
  - `src/App.svelte:20-30` - Current routing pattern with hash
  - `src/lib/debug/AnimationTestPage.svelte:182-184` - Close button pattern
  - Web API: `URL.createObjectURL()`, `Blob`, `<a download>` pattern

  **Acceptance Criteria**:

  ```playwright
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173/#admin
  2. Assert: AdminPage visible (routing works)
  3. Navigate to: http://localhost:5173/#debug-animations
  4. Assert: Redirects to #admin OR shows AdminPage
  5. Click: "Export JSON" button in header
  6. Wait for: Download triggered
  7. Assert: Downloaded file has .json extension
  8. Screenshot: .sisyphus/evidence/task-8-export-routing.png
  ```

  **Commit**: YES
  - Message: `feat(admin): add JSON export and update routing to #admin`
  - Files: `src/lib/admin/components/ExportButton.svelte`, `src/App.svelte`
  - Pre-commit: `npm run check`

---

## Commit Strategy

| After Task | Message                                                                     | Files                            | Verification  |
| ---------- | --------------------------------------------------------------------------- | -------------------------------- | ------------- |
| 1          | `feat(admin): create AdminPage shell with tab navigation`                   | AdminPage.svelte, tabs/\*.svelte | npm run check |
| 2          | `style(debug): restyle AnimationTestPage to match game UI`                  | AnimationTestPage.svelte         | npm run check |
| 3          | `feat(admin): add Pokemon Browser tab with search and type filter`          | PokemonBrowser.svelte            | npm run check |
| 4          | `feat(admin): add Moves Browser tab with aggregated moves and filters`      | MovesBrowser.svelte              | npm run check |
| 5          | `feat(admin): add Pokemon Editor tab with editable stats and types`         | PokemonEditor.svelte             | npm run check |
| 6          | `feat(admin): add Move Editor tab for power, accuracy, PP editing`          | MoveEditor.svelte                | npm run check |
| 7          | `feat(admin): add Add Content tab for Pokemon/move additions from raw JSON` | AddContent.svelte                | npm run check |
| 8          | `feat(admin): add JSON export and update routing to #admin`                 | ExportButton.svelte, App.svelte  | npm run check |

---

## Success Criteria

### Verification Commands

```bash
npm run check  # Expected: No errors
npm run dev    # Expected: Starts successfully
```

### Final Checklist

- [ ] Navigate to `#admin` shows 6-tab admin interface
- [ ] All tabs switch correctly
- [ ] AnimationTestPage restyled to match game UI
- [ ] Pokemon Browser shows all Pokemon with working search/filter
- [ ] Moves Browser shows aggregated moves with working search/filter
- [ ] Pokemon Editor allows editing stats, types, abilities (not id/evolution/sprites)
- [ ] Move Editor allows editing power, accuracy, PP (not effects)
- [ ] Add Content allows adding Pokemon from raw JSON
- [ ] Add Content allows assigning moves from raw JSON
- [ ] Export button downloads valid JSON file
- [ ] `npm run check` passes
- [ ] All "Must NOT Have" items are absent
