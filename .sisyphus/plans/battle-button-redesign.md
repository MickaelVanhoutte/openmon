# Battle Button Redesign — Manga-Inspired Parallelograms

## TL;DR

> **Quick Summary**: Replace the current dark-glass-overlay battle buttons with bold manga-inspired parallelogram buttons featuring solid type-color backgrounds, decorative ink borders, type icon watermarks, and a new move info modal triggered by keyboard shortcut or long-touch.
>
> **Deliverables**:
>
> - Redesigned move buttons in `SplitMoveSelector.svelte` with ink borders, solid type colors, type watermark, PP tag, info badge
> - Redesigned action buttons in `SplitActionButtons.svelte` with same parallelogram style (simplified)
> - Restyled back button in `ActionBar.svelte`
> - New `MoveInfoModal.svelte` component showing move details (power, accuracy, effect, etc.)
> - 'i' key handler + long-touch trigger for move info modal
>
> **Estimated Effort**: Medium
> **Parallel Execution**: NO — sequential (each task builds on the previous)
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### Original Request

User wants to redesign battle UI buttons (move buttons + action buttons) to match HTML prototypes they drafted. The prototypes feature a manga/comic-book aesthetic with skewed parallelogram shapes, solid type-colored backgrounds, decorative ink-colored outer borders via pseudo-elements, a type icon watermark, PP tag, and info badge. Action buttons use the same style but simpler (no watermark, no PP, no badge).

### Interview Summary

**Key Discussions**:

- **Info badge**: Shows "i" icon. Pressing 'i' on keyboard or long-touch on mobile opens a modal with move details (power, accuracy, effects)
- **Font**: Keep existing game font (`pokemon` DS-style bitmap font at 32px) — do NOT add Oswald or any Google Font
- **Back button**: Yes, restyle to match new ink-border aesthetic
- **Background color**: Replaced by move type color (from existing `typeColors` mapping)
- **Type watermark**: Use existing type icon assets from `src/assets/types/`

### Research Findings

- Current buttons use `skewX(-10deg)` with dark glass overlay (`rgba(20,25,35,0.75)` via `::before`); new design uses `-15deg` with solid backgrounds
- Type icons exist as PNG (`{type}-small.png`) and SVG (`{type}.svg`) in `src/assets/types/`
- Action button colors already defined: FIGHT=#dc5959, BAG=#eca859, POKEMON=#7EAF53, RUN=#599bdc
- Back button already uses `skewX(-15deg)` — same angle as new design
- Game font is `pokemon` (bitmap pixel font from `pokemon-ds-font.ttf`), set globally at 32px
- Dual keyboard handler architecture: ActionBar handles state machine, SplitMoveSelector handles directional nav within moves — both on `window.addEventListener('keydown')`
- `MoveInstance` exposes: `name`, `type`, `category`, `power`, `accuracy`, `pp`, `currentPp`, `description`, `effect.short_effect`, `effectChance`, `priority`, `target`
- Existing `Modal.svelte` in `src/lib/common/` uses `<dialog>`, Svelte 5 runes, snippet-based API
- Category icons exist in `src/assets/moves-cat/`: `physical.png`, `special.png`, `no-damage.png`

### Metis Review

**Identified Gaps** (addressed):

- **Dual keyboard handler conflict**: 'i' key handler placed in ActionBar.svelte's `listener()` function, guarded by `moveOpened && selectedMoveIdx !== undefined && !disabled`
- **CSS `::before` conflict**: Remove dark glass overlay entirely (solid backgrounds replace it), repurpose pseudo-elements for decorative borders
- **`--skew-counter` desync risk**: Both `--skew-angle` and `--skew-counter` defined as CSS variables, updated together
- **Modal focus trap vs game keyboard**: Add guard in ActionBar's listener to skip all game keys when info modal is open
- **Long-touch vs tap conflict**: Use timer-based approach; clear on touchend/touchmove before 500ms threshold
- **GSAP animation survival**: Keep `.attack-plate` and `.action-plate` class names and `plateElements[]`/`buttonElements[]` bind arrays intact
- **Pixel font vs prototype aesthetic**: Prototype used Oswald (geometric sans); game uses bitmap pixel font — executor must adapt the bold uppercase styling to work with the pixel font

---

## Work Objectives

### Core Objective

Replace the dark-glass-overlay battle button styling with a bold manga-inspired parallelogram design featuring solid type-color backgrounds, decorative ink borders, and add a move info modal feature.

### Concrete Deliverables

- `src/lib/battle/action-bar/SplitMoveSelector.svelte` — restyled CSS + updated template
- `src/lib/battle/action-bar/SplitActionButtons.svelte` — restyled CSS + updated template
- `src/lib/battle/ActionBar.svelte` — restyled back button + info modal integration
- `src/lib/battle/action-bar/MoveInfoModal.svelte` — NEW component

### Definition of Done

- [ ] `npm run check` passes with 0 errors
- [ ] `npm run lint` introduces 0 new errors
- [ ] `npm run test:run` passes (existing tests unchanged)
- [ ] `npm run build` succeeds
- [ ] Move buttons render with solid type-color backgrounds, ink borders, watermark, PP tag, info badge
- [ ] Action buttons render with solid color backgrounds, ink borders, no watermark/PP/badge
- [ ] Back button renders with updated ink-border style
- [ ] 'i' key opens move info modal during move selection
- [ ] Long-touch (~500ms) on move button opens info modal on mobile
- [ ] Keyboard navigation (arrows + enter + escape) still works for all button types
- [ ] GSAP entrance animations still play correctly

### Must Have

- Solid type-color backgrounds replacing dark glass overlay
- `skewX(-15deg)` parallelogram shape on all buttons
- Decorative ink-colored outer border lines (via pseudo-elements)
- Type icon watermark on move buttons (right side, semi-transparent)
- PP tag with purple/indigo background (bottom-right of move buttons)
- Info badge circle (top-left of move buttons) showing "i"
- Move info modal with power, accuracy, category, PP, description, effect
- 'i' keyboard shortcut (during move selection)
- Long-touch trigger on mobile (~500ms threshold)
- All existing keyboard navigation preserved
- All existing GSAP animations preserved

### Must NOT Have (Guardrails)

- DO NOT add Google Fonts (Oswald or any other) — use existing `pokemon` font
- DO NOT add emoji characters in code (per AGENTS.md)
- DO NOT change spatial positioning logic (`getAttackPlatePositions`, `getButtonPositions`, `updatePositions`)
- DO NOT change GSAP animation parameters (duration, easing, stagger)
- DO NOT change the `MoveInstance` or `Move` data model classes
- DO NOT modify `ActionMenu.svelte` or `MoveSelector.svelte` (legacy/unused)
- DO NOT modify `TargetSelector.svelte`
- DO NOT break existing Props interfaces — only ADD optional new props
- DO NOT restructure ActionBar.svelte template conditionals
- DO NOT refactor the dual keyboard handler architecture — just add 'i' to existing pattern
- DO NOT over-design the info modal — keep it simple and informative
- DO NOT add hover tooltips or extra info triggers beyond 'i' key and long-touch
- DO NOT add GSAP to the info badge — CSS transitions only if needed

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks are verified by the executing agent using tools. No human action required.

### Test Decision

- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: Tests-after (add unit test for 'i' key state transition)
- **Framework**: Vitest

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

All visual verification done via Playwright against the dev server at http://localhost:5173/

---

## Execution Strategy

### Sequential Execution (4 Tasks)

```
Task 1: Redesign Move Buttons (SplitMoveSelector.svelte)
    ↓
Task 2: Redesign Action Buttons (SplitActionButtons.svelte)
    ↓
Task 3: Restyle Back Button (ActionBar.svelte CSS)
    ↓
Task 4: Info Badge + Modal Feature (new MoveInfoModal + keyboard/touch handlers)
```

Sequential because:

- Task 2 reuses CSS patterns established in Task 1
- Task 3 needs visual consistency with Tasks 1+2
- Task 4 integrates with components modified in Tasks 1+3

### Dependency Matrix

| Task | Depends On               | Blocks  | Can Parallelize With |
| ---- | ------------------------ | ------- | -------------------- |
| 1    | None                     | 2, 3, 4 | None                 |
| 2    | 1 (CSS patterns)         | 3       | None                 |
| 3    | 2 (visual consistency)   | 4       | None                 |
| 4    | 1, 3 (components stable) | None    | None                 |

### Agent Dispatch Summary

| Task | Recommended Dispatch                                                                         |
| ---- | -------------------------------------------------------------------------------------------- |
| 1    | `delegate_task(category="visual-engineering", load_skills=["frontend-ui-ux", "playwright"])` |
| 2    | `delegate_task(category="visual-engineering", load_skills=["frontend-ui-ux", "playwright"])` |
| 3    | `delegate_task(category="quick", load_skills=["frontend-ui-ux"])`                            |
| 4    | `delegate_task(category="unspecified-high", load_skills=["frontend-ui-ux", "playwright"])`   |

---

## TODOs

- [ ] 1. Redesign Move Buttons (SplitMoveSelector.svelte)

  **What to do**:

  **CSS Changes:**
  - Change `--skew-angle` from `-10deg` to `-15deg` and `--skew-counter` from `10deg` to `15deg`
  - Define `--ink-color: #2A224D` (deep indigo) and `--pp-bg: #5A5288` (muted purple) as CSS variables
  - Remove the `::before` dark glass overlay entirely (currently `background: rgba(20, 25, 35, 0.75)`)
  - Replace the gradient background (`linear-gradient(135deg, var(--type-color) 25%, transparent 100%)`) with a solid `var(--type-color)` background on `.attack-plate`
  - Change `.attack-plate` border from `3px solid var(--type-color)` to `4px solid var(--ink-color)`
  - Repurpose `::before` for decorative top-right outer border (positioned top-right corner, 60% width, 70% height, border-top + border-right in ink color, 3px solid)
  - Repurpose `::after` for decorative bottom-left outer border (positioned bottom-left, ~74% width, full height, border-bottom only in ink color, 3px solid)
  - Both pseudo-elements need `pointer-events: none` and should extend outside the button bounds slightly

  **PP Tag Restyle:**
  - Change `.pp-tag` background from `rgba(15, 20, 30, 0.95)` to `var(--pp-bg)` (#5A5288)
  - Change border from `border-bottom: 3px solid var(--type-color)` to `4px solid var(--ink-color)`
  - Make PP tag a skewed parallelogram shape (skewX matching button)
  - Text color: white, bold
  - Add subtle box-shadow: `4px 4px 0px rgba(0,0,0,0.3)` for hard shadow effect from prototype

  **Type Watermark Update:**
  - Keep existing watermark position (right side, centered vertically)
  - Increase icon size from 32x32 to ~64-80px for more prominent watermark effect
  - Set opacity to ~0.4-0.5 (prototype shows semi-transparent)
  - Apply counter-skew + slight rotation (`rotate(-10deg)`) for the tilted look
  - Use SVG type icons (`{type}.svg`) instead of PNG for sharper rendering at larger size

  **Move Name Styling:**
  - Change text color from white-with-shadow to `var(--ink-color)` (#2A224D) — bold dark text on light type-color background
  - Keep `text-transform: uppercase` and `font-weight: 700`
  - Adjust font-size if needed for the pixel font to look good in the larger button

  **Hover/Selected States:**
  - Keep `transform: scale(1.08)` for hover/selected
  - Change border highlight from white to a lighter/brighter version of ink color or a glow effect
  - Adjust box-shadow glow to complement the new solid-color design

  **Template Changes:**
  - Add info badge element: `<div class="info-badge">i</div>` positioned top-left (absolute, top:-20px, left:-25px), 42x42px circle, white background, ink-color border, with hard shadow
  - The info badge `<div>` is purely decorative/visual in this task — the click/touch handlers are added in Task 4

  **Must NOT do**:
  - DO NOT rename `.attack-plate` class (GSAP targets it)
  - DO NOT remove `bind:this={plateElements[i]}` (GSAP needs the reference)
  - DO NOT change the `typeColors` record or `getTypeColor()` function
  - DO NOT modify the GSAP `animateEntrance()` function
  - DO NOT change the keyboard handler logic
  - DO NOT modify Props interface or callback signatures
  - DO NOT add Google Fonts

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: This is a pure CSS/template visual redesign task requiring design sensibility
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Core skill for crafting the manga-inspired button aesthetic with CSS transforms, pseudo-elements, and visual polish
    - `playwright`: Required for visual QA verification in the browser

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential — Task 1 of 4
  - **Blocks**: Tasks 2, 3, 4 (CSS patterns established here are reused)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `src/lib/battle/action-bar/SplitMoveSelector.svelte` — The ENTIRE file is the modification target. Current styles at bottom (CSS section). Current template structure around line 200+. Pay attention to: `.attack-plate` button structure, `.type-watermark` div, `.pp-tag` div, `.plate-content` div, `.move-name` span
  - `.sisyphus/test-button.html` — The target HTML prototype. Study the CSS carefully: `::before`/`::after` for decorative borders, `.info-badge` positioning, `.pp-tag` skewed shape, `.watermark` sizing and rotation

  **API/Type References**:
  - `src/js/pokemons/pokedex.ts:MoveInstance` — Data model for moves. Fields used in template: `move.name`, `move.type`, `move.currentPp`, `move.pp`

  **Asset References**:
  - `src/assets/types/{type}.svg` — SVG type icons for watermark (18 types: normal, fire, water, grass, electric, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy)
  - `src/assets/types/{type}-small.png` — PNG alternatives (currently used, switch to SVG for sharper watermark)

  **External References**:
  - Prototype visual: See user-provided screenshots showing the "CLOSE COMBAT" button with pink background, ink borders, fist watermark, PP tag "5/5", and "i" badge

  **WHY Each Reference Matters**:
  - `SplitMoveSelector.svelte` is the ONLY file being modified — executor must understand its full structure before changing it
  - `test-button.html` is the design specification — every CSS detail must match this prototype (adapted for the game font)
  - SVG type icons give sharper watermark rendering than PNG at the larger 64-80px display size
  - MoveInstance fields tell the executor what data is available for display

  **Acceptance Criteria**:
  - [ ] `npm run check` passes with 0 errors
  - [ ] `npm run build` succeeds
  - [ ] `.attack-plate` buttons display as skewed parallelograms with `skewX(-15deg)`
  - [ ] Background is solid type color (not gradient with dark overlay)
  - [ ] Decorative ink-colored outer border lines visible (top-right and bottom-left)
  - [ ] Type icon watermark visible on right side, semi-transparent, using SVG
  - [ ] PP tag shows with purple background (#5A5288), positioned bottom-right
  - [ ] Info badge circle ("i") visible top-left with white background and ink border
  - [ ] Move name text is dark ink color (#2A224D), uppercase, bold
  - [ ] Hover/selected state still triggers scale effect
  - [ ] GSAP entrance animation still works (buttons animate in from offscreen)
  - [ ] Keyboard navigation (arrows, enter, escape) still functional

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Move buttons render with new parallelogram design
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173, DEBUG=true in src/js/env.ts to skip intro
    Steps:
      1. Navigate to: http://localhost:5173/
      2. Wait for battle to load (DEBUG mode auto-enters battle)
      3. Click the FIGHT action button (or locate it via .action-plate containing "FIGHT")
      4. Wait for: .attack-plate elements visible (timeout: 5s)
      5. Screenshot: .sisyphus/evidence/task-1-move-buttons-overview.png
      6. Assert: At least 1 .attack-plate element exists
      7. Assert: .attack-plate has computed transform containing skewX
      8. Assert: .info-badge element exists inside .attack-plate
      9. Assert: .pp-tag element exists inside .attack-plate
      10. Assert: .type-watermark img element exists
    Expected Result: Move buttons render with parallelogram shape, solid backgrounds, decorative borders, watermark, PP tag, and info badge
    Evidence: .sisyphus/evidence/task-1-move-buttons-overview.png

  Scenario: Move buttons have correct type colors
    Tool: Playwright (playwright skill)
    Preconditions: Move list is open from previous scenario
    Steps:
      1. For each visible .attack-plate, capture computed background-color
      2. Assert: Background color matches the type color (not dark/black/transparent overlay)
      3. Assert: Text color of .move-name is dark (ink color #2A224D vicinity)
      4. Screenshot: .sisyphus/evidence/task-1-move-type-colors.png
    Expected Result: Each move button's background reflects its type color
    Evidence: .sisyphus/evidence/task-1-move-type-colors.png

  Scenario: Keyboard navigation still works in move selection
    Tool: Playwright (playwright skill)
    Preconditions: Move list is open
    Steps:
      1. Press ArrowDown key
      2. Assert: A different .attack-plate gains .selected class or visual highlight
      3. Press ArrowDown key again
      4. Assert: Selection moves to next move
      5. Press Escape key
      6. Assert: Move list closes, action buttons reappear
      7. Screenshot: .sisyphus/evidence/task-1-keyboard-nav.png
    Expected Result: Keyboard navigation works identically to before the redesign
    Evidence: .sisyphus/evidence/task-1-keyboard-nav.png
  ```

  **Evidence to Capture:**
  - [ ] `.sisyphus/evidence/task-1-move-buttons-overview.png`
  - [ ] `.sisyphus/evidence/task-1-move-type-colors.png`
  - [ ] `.sisyphus/evidence/task-1-keyboard-nav.png`

  **Commit**: YES
  - Message: `feat(battle): redesign move buttons with manga-inspired parallelogram style`
  - Files: `src/lib/battle/action-bar/SplitMoveSelector.svelte`
  - Pre-commit: `npm run check && npm run build`

---

- [ ] 2. Redesign Action Buttons (SplitActionButtons.svelte)

  **What to do**:

  **CSS Changes (mirror Task 1 patterns):**
  - Change `--skew-angle` from `-10deg` to `-15deg` and `--skew-counter` from `10deg` to `15deg`
  - Define `--ink-color: #2A224D` as CSS variable
  - Remove the `::before` dark glass overlay
  - Replace gradient background with solid `var(--action-color)` background
  - Change border to `4px solid var(--ink-color)`
  - Add decorative `::before` top-right border and `::after` bottom-left border (same pattern as move buttons, adapted for action button dimensions — `::after` width at ~84% per prototype)
  - Both pseudo-elements need `pointer-events: none`

  **Action Label Styling:**
  - Change text color from white-with-shadow to `var(--ink-color)` (#2A224D)
  - Keep uppercase, bold weight

  **Hover/Selected States:**
  - Keep `transform: scale(1.1)` for hover/selected
  - Update border/glow to match new ink-color theme

  **Template**: Minimal changes — no new elements needed (no info badge, no PP tag, no watermark). Only CSS styling updates.

  **Must NOT do**:
  - DO NOT add info badge, PP tag, or watermark to action buttons (they are simpler per design)
  - DO NOT rename `.action-plate` class (GSAP targets it)
  - DO NOT remove `bind:this={buttonElements[i]}` (GSAP needs the reference)
  - DO NOT change the `actions[]` array or callback signatures
  - DO NOT modify GSAP animations
  - DO NOT change keyboard handler logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS-focused visual redesign mirroring patterns from Task 1
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: CSS transforms and visual styling
    - `playwright`: Visual QA verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential — Task 2 of 4
  - **Blocks**: Task 3, 4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/lib/battle/action-bar/SplitActionButtons.svelte` — ENTIRE file is the modification target. Similar structure to SplitMoveSelector but simpler (no watermark, no PP tag)
  - `src/lib/battle/action-bar/SplitMoveSelector.svelte` (after Task 1) — Reference for the ink-border CSS patterns just implemented. Copy the `::before`/`::after` pseudo-element approach
  - `.sisyphus/action-button.html` — Target HTML prototype for action buttons. Note: simpler than move button — just the parallelogram with label, ink borders, no extras

  **WHY Each Reference Matters**:
  - `SplitActionButtons.svelte` is the modification target
  - Post-Task-1 `SplitMoveSelector.svelte` provides the proven CSS pattern to replicate
  - `action-button.html` is the design spec — note the `::after` width is 84% (wider than move button's 74%)

  **Acceptance Criteria**:
  - [ ] `npm run check` passes with 0 errors
  - [ ] `npm run build` succeeds
  - [ ] `.action-plate` buttons display as skewed parallelograms with `skewX(-15deg)`
  - [ ] Background is solid action color (FIGHT=red, BAG=orange, POKEMON=green, RUN=blue) — no dark overlay
  - [ ] Decorative ink-colored outer borders visible
  - [ ] Action labels are dark ink color, uppercase, bold
  - [ ] Hover/selected state triggers scale effect
  - [ ] GSAP entrance animation still works
  - [ ] Keyboard navigation (arrows, enter) still functional for action selection

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Action buttons render with new parallelogram design
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, DEBUG=true, battle loaded
    Steps:
      1. Navigate to: http://localhost:5173/
      2. Wait for battle screen to load
      3. Wait for: .action-plate elements visible (timeout: 5s)
      4. Screenshot: .sisyphus/evidence/task-2-action-buttons-overview.png
      5. Assert: 4 .action-plate elements exist (FIGHT, BAG, POKEMON, RUN)
      6. Assert: .action-plate has computed transform containing skewX
      7. Assert: .action-plate does NOT contain .info-badge or .pp-tag elements
      8. Assert: Background colors are solid (not transparent/gradient to dark)
    Expected Result: Four action buttons render as clean parallelograms with solid colors
    Evidence: .sisyphus/evidence/task-2-action-buttons-overview.png

  Scenario: Action button keyboard navigation works
    Tool: Playwright (playwright skill)
    Preconditions: Action buttons visible
    Steps:
      1. Press ArrowDown key
      2. Assert: Selection moves between action buttons
      3. Navigate to FIGHT, press Enter
      4. Assert: Move selection opens (action buttons disappear, .attack-plate elements appear)
      5. Press Escape
      6. Assert: Returns to action buttons
      7. Screenshot: .sisyphus/evidence/task-2-action-nav.png
    Expected Result: Keyboard navigation between action buttons and move selection works correctly
    Evidence: .sisyphus/evidence/task-2-action-nav.png
  ```

  **Evidence to Capture:**
  - [ ] `.sisyphus/evidence/task-2-action-buttons-overview.png`
  - [ ] `.sisyphus/evidence/task-2-action-nav.png`

  **Commit**: YES (groups with Task 1)
  - Message: `feat(battle): redesign action buttons with matching parallelogram style`
  - Files: `src/lib/battle/action-bar/SplitActionButtons.svelte`
  - Pre-commit: `npm run check && npm run build`

---

- [ ] 3. Restyle Back Button (ActionBar.svelte)

  **What to do**:

  **CSS-Only Change to `.back-plate` styles in ActionBar.svelte:**
  - The back button already uses `skewX(-15deg)` — keep this
  - Change background from current gradient/dark style to a muted slate/indigo solid (e.g., `#3D365C` or similar dark indigo that contrasts with the ink borders)
  - Add `4px solid var(--ink-color)` border (define `--ink-color: #2A224D` in the component's style scope)
  - Add decorative `::before` and `::after` pseudo-element borders matching the pattern from Tasks 1 & 2 (scaled down for the smaller back button size)
  - Change text color to white or light color for contrast against dark background
  - Update hover state to complement new style
  - Keep the back arrow icon/text as-is

  **Must NOT do**:
  - DO NOT change ActionBar.svelte logic or state management
  - DO NOT modify template structure beyond the back button area
  - DO NOT change component imports or Props

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small CSS-only change to a single element's styles
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Ensures visual consistency with the newly styled buttons

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential — Task 3 of 4
  - **Blocks**: Task 4
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `src/lib/battle/ActionBar.svelte` — Modification target. `.back-plate` styles are at bottom of the `<style>` section (around lines 1037-1086). The back plate is rendered conditionally when `moveOpened` is true
  - `src/lib/battle/action-bar/SplitMoveSelector.svelte` (after Task 1) — Reference for the ink-border pseudo-element CSS pattern to replicate

  **WHY Each Reference Matters**:
  - ActionBar.svelte `.back-plate` section is the only thing being modified
  - Task 1's completed SplitMoveSelector provides the ink-border pattern to follow

  **Acceptance Criteria**:
  - [ ] `npm run check` passes
  - [ ] Back button renders with ink-border style matching other buttons
  - [ ] Back button visible when move selection is open
  - [ ] Back button click still closes move selection and returns to action buttons

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Back button renders with new style
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, battle loaded, move selection open
    Steps:
      1. Navigate to battle, click FIGHT to open moves
      2. Wait for: .back-plate visible (timeout: 5s)
      3. Screenshot: .sisyphus/evidence/task-3-back-button.png
      4. Assert: .back-plate element has ink-color border
      5. Click .back-plate
      6. Assert: Move selection closes, action buttons reappear
      7. Screenshot: .sisyphus/evidence/task-3-back-return.png
    Expected Result: Back button matches the new manga aesthetic and functions correctly
    Evidence: .sisyphus/evidence/task-3-back-button.png
  ```

  **Evidence to Capture:**
  - [ ] `.sisyphus/evidence/task-3-back-button.png`
  - [ ] `.sisyphus/evidence/task-3-back-return.png`

  **Commit**: YES (groups with Tasks 1+2)
  - Message: `feat(battle): restyle back button with ink-border design`
  - Files: `src/lib/battle/ActionBar.svelte`
  - Pre-commit: `npm run check && npm run build`

---

- [ ] 4. Info Badge + Move Info Modal Feature

  **What to do**:

  **Step A: Create MoveInfoModal.svelte** (NEW file: `src/lib/battle/action-bar/MoveInfoModal.svelte`):
  - Follow `src/lib/common/Modal.svelte` pattern: use `<dialog>`, Svelte 5 runes, `$props()`
  - Props interface:
    ```typescript
    interface Props {
    	move: MoveInstance | undefined;
    	showModal: boolean;
    	onClose?: () => void;
    }
    ```
  - Use `$effect()` to call `dialog.showModal()` / `dialog.close()` based on `showModal` prop
  - Display the following move data in a clean card layout:
    - **Move name** (large, uppercase)
    - **Type** with type color indicator and type icon
    - **Category** with category icon (from `src/assets/moves-cat/{category}.png`)
    - **Power** (show "—" if 0 or null)
    - **Accuracy** (show "—" if 0 or null, otherwise show as percentage)
    - **PP** (currentPp / pp)
    - **Priority** (only if non-zero)
    - **Description** (flavor text from `move.description`)
    - **Effect** (from `move.effect.short_effect`, if available)
  - Style the modal content to match the game's pixel aesthetic (use existing CSS variables from the game)
  - Add backdrop click handler to close
  - Add Escape key handling to close (native `<dialog>` handles this)
  - Keep it simple — this is a read-only information display

  **Step B: Add keyboard handler for 'i' in ActionBar.svelte:**
  - Add `showMoveInfo` state variable: `let showMoveInfo = $state(false)`
  - Add `infoMoveIdx` state variable: `let infoMoveIdx = $state<number | undefined>(undefined)`
  - In the existing `listener()` function (the `window.addEventListener('keydown', ...)` handler around line 282):
    - Add case for key `'i'` or `'I'`:
      - Guard: only when `moveOpened === true && selectedMoveIdx !== undefined && !disabled && !showMoveInfo`
      - Action: set `showMoveInfo = true`, `infoMoveIdx = selectedMoveIdx`
    - Add guard at the TOP of the listener: if `showMoveInfo === true`, skip all keyboard handling (let the modal's native dialog handle Escape)
  - Add close handler: `function closeInfoModal() { showMoveInfo = false; infoMoveIdx = undefined; }`
  - When `showMoveInfo` becomes false, ensure `selectedMoveIdx` stays at its previous value (focus returns to same move)

  **Step C: Add `<MoveInfoModal>` to ActionBar template:**
  - Import `MoveInfoModal` component
  - Import `MoveInstance` type if not already imported
  - Add `<MoveInfoModal move={currentMoves?.[infoMoveIdx ?? 0]} showModal={showMoveInfo} onClose={closeInfoModal} />` in the template (outside the conditional blocks, so it renders as an overlay)
  - Where `currentMoves` is derived from the ally pokemon's moves at the current action index

  **Step D: Add long-touch handler on move buttons in SplitMoveSelector.svelte:**
  - Add optional prop: `onInfoRequest?: (idx: number) => void`
  - Add touch event handlers on each `.attack-plate` button:
    - `ontouchstart`: start a 500ms timer, store timer ID
    - `ontouchend` / `ontouchmove` / `ontouchcancel`: clear the timer
    - If timer fires (500ms elapsed without cancel): call `onInfoRequest?.(index)` and prevent the subsequent click event
  - Connect in ActionBar: pass `onInfoRequest={(idx) => { infoMoveIdx = idx; showMoveInfo = true; }}` to `SplitMoveSelector`

  **Step E: Wire info badge click (desktop alternative):**
  - In SplitMoveSelector, add `onclick` handler on the `.info-badge` element (added in Task 1):
    - Call `onInfoRequest?.(index)` on click
    - Use `event.stopPropagation()` to prevent triggering the parent button's move selection

  **Must NOT do**:
  - DO NOT add hover tooltips or additional info trigger mechanisms
  - DO NOT create a complex animated modal — keep it simple and functional
  - DO NOT modify the `MoveInstance` data model
  - DO NOT refactor the existing keyboard handler architecture
  - DO NOT add new fonts for the modal
  - DO NOT break existing keyboard navigation when modal is closed

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Involves creating a new component + modifying two existing ones + keyboard/touch event handling — non-trivial coordination
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Modal design, touch handling UX
    - `playwright`: QA for modal opening/closing, keyboard interactions

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential — Task 4 of 4 (final)
  - **Blocks**: None (last task)
  - **Blocked By**: Tasks 1, 3

  **References**:

  **Pattern References**:
  - `src/lib/common/Modal.svelte` — Follow this pattern exactly for dialog lifecycle management. It uses `<dialog>`, `bind:this`, `$effect()` to sync `showModal` prop with `dialog.showModal()`/`dialog.close()`. Has backdrop click handling via `dialog.addEventListener('click', ...)` checking `event.target === dialog`
  - `src/lib/battle/ActionBar.svelte` — The `listener()` function around line 282 handles all keyboard events. Add 'i' key case here. Note the guard pattern: existing cases check `moveOpened`, `targetSelectOpened`, `disabled` before acting
  - `src/lib/battle/action-bar/SplitMoveSelector.svelte` (after Task 1) — Add `onInfoRequest` prop, touch handlers, and `.info-badge` click handler

  **API/Type References**:
  - `src/js/pokemons/pokedex.ts:MoveInstance` — Fields to display: `name` (string), `type` (string), `category` ('physical'|'special'|'no-damage'), `power` (number), `accuracy` (number), `pp` (number), `currentPp` (number), `description` (string), `effect.short_effect` (string), `effectChance` (number), `priority` (number)
  - `src/js/pokemons/pokedex.ts:MoveEffect` — Has `short_effect: string` and `effect: string`

  **Asset References**:
  - `src/assets/moves-cat/physical.png`, `special.png`, `no-damage.png` — Category icons for the modal
  - `src/assets/types/{type}.svg` — Type icon for the modal header

  **WHY Each Reference Matters**:
  - `Modal.svelte` is the established pattern for `<dialog>` lifecycle — must be followed to avoid focus trap issues
  - ActionBar's `listener()` function is where 'i' handler MUST go (central state machine, has access to `selectedMoveIdx` and `moveOpened`)
  - MoveInstance fields define exactly what data is available for display
  - Category and type icons make the modal informative without needing text-only descriptions

  **Acceptance Criteria**:
  - [ ] `npm run check` passes with 0 errors
  - [ ] `npm run build` succeeds
  - [ ] `MoveInfoModal.svelte` exists at `src/lib/battle/action-bar/MoveInfoModal.svelte`
  - [ ] Pressing 'i' during move selection opens the modal showing move details
  - [ ] Modal displays: name, type (with icon), category (with icon), power, accuracy, PP, description, effect
  - [ ] Pressing Escape closes the modal
  - [ ] Clicking backdrop closes the modal
  - [ ] After closing modal, keyboard navigation resumes at the same move
  - [ ] While modal is open, arrow keys / enter do NOT navigate moves
  - [ ] Clicking the info badge on a move button opens the modal for that move
  - [ ] Long-touch (~500ms) on mobile opens the modal
  - [ ] Normal tap still selects the move (no accidental info modal triggers)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 'i' key opens move info modal
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, battle loaded, move selection open
    Steps:
      1. Navigate to battle, click FIGHT
      2. Wait for .attack-plate elements visible
      3. Press 'i' key
      4. Wait for: dialog[open] visible (timeout: 3s)
      5. Assert: dialog contains move name text (same as selected move)
      6. Assert: dialog contains text matching "Power" or "Accuracy"
      7. Assert: dialog contains a category icon img
      8. Screenshot: .sisyphus/evidence/task-4-info-modal-open.png
    Expected Result: Modal opens showing detailed move information
    Evidence: .sisyphus/evidence/task-4-info-modal-open.png

  Scenario: Modal closes and returns to move selection
    Tool: Playwright (playwright skill)
    Preconditions: Info modal is open from previous scenario
    Steps:
      1. Press Escape key
      2. Wait for: dialog not visible (timeout: 2s)
      3. Assert: .attack-plate elements still visible (move selection active)
      4. Press ArrowDown key
      5. Assert: Selection moves (keyboard nav restored)
      6. Screenshot: .sisyphus/evidence/task-4-modal-closed-nav-restored.png
    Expected Result: Modal closes, move selection focus is preserved, keyboard nav works
    Evidence: .sisyphus/evidence/task-4-modal-closed-nav-restored.png

  Scenario: Info badge click opens modal for specific move
    Tool: Playwright (playwright skill)
    Preconditions: Move selection open
    Steps:
      1. Find second .attack-plate element
      2. Click the .info-badge inside that element
      3. Wait for: dialog[open] visible (timeout: 3s)
      4. Assert: dialog shows the name of the SECOND move (not first)
      5. Screenshot: .sisyphus/evidence/task-4-badge-click-specific-move.png
    Expected Result: Clicking info badge on a specific move opens modal for THAT move
    Evidence: .sisyphus/evidence/task-4-badge-click-specific-move.png

  Scenario: Keyboard is blocked while modal is open
    Tool: Playwright (playwright skill)
    Preconditions: Info modal is open
    Steps:
      1. Press 'i' to open modal
      2. Press ArrowDown key
      3. Assert: No move selection change (arrows blocked during modal)
      4. Press Enter key
      5. Assert: No move selected/executed (enter blocked during modal)
      6. Press Escape
      7. Assert: Modal closes correctly
    Expected Result: Game keyboard navigation is suppressed while modal is open
    Evidence: Terminal assertion output
  ```

  **Evidence to Capture:**
  - [ ] `.sisyphus/evidence/task-4-info-modal-open.png`
  - [ ] `.sisyphus/evidence/task-4-modal-closed-nav-restored.png`
  - [ ] `.sisyphus/evidence/task-4-badge-click-specific-move.png`

  **Commit**: YES
  - Message: `feat(battle): add move info modal with keyboard and touch triggers`
  - Files: `src/lib/battle/action-bar/MoveInfoModal.svelte`, `src/lib/battle/ActionBar.svelte`, `src/lib/battle/action-bar/SplitMoveSelector.svelte`
  - Pre-commit: `npm run check && npm run build`

---

## Commit Strategy

| After Task | Message                                                                       | Files                                                            | Verification                     |
| ---------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------- |
| 1          | `feat(battle): redesign move buttons with manga-inspired parallelogram style` | SplitMoveSelector.svelte                                         | `npm run check && npm run build` |
| 2          | `feat(battle): redesign action buttons with matching parallelogram style`     | SplitActionButtons.svelte                                        | `npm run check && npm run build` |
| 3          | `feat(battle): restyle back button with ink-border design`                    | ActionBar.svelte                                                 | `npm run check && npm run build` |
| 4          | `feat(battle): add move info modal with keyboard and touch triggers`          | MoveInfoModal.svelte, ActionBar.svelte, SplitMoveSelector.svelte | `npm run check && npm run build` |

---

## Success Criteria

### Verification Commands

```bash
npm run check    # Expected: 0 errors
npm run lint     # Expected: no new errors
npm run test:run # Expected: all existing tests pass
npm run build    # Expected: successful production build
```

### Final Checklist

- [ ] All "Must Have" present (solid backgrounds, ink borders, watermark, PP tag, badge, modal, keyboard/touch triggers)
- [ ] All "Must NOT Have" absent (no Google Fonts, no emoji, no broken GSAP, no changed positioning)
- [ ] All 4 tasks committed with passing builds
- [ ] Visual evidence captured in `.sisyphus/evidence/` for all scenarios
