# UI/UX Polish & Accessibility Fixes

## TL;DR

> **Quick Summary**: Fix critical accessibility (contrast) issues and implement pixel-perfect UI polish across 5 screens in the mobile Pokemon game. All changes are CSS/SCSS only - no logic changes.
>
> **Deliverables**:
>
> - Save/Load screen: Readable white text, pixel-art button styling, aligned delete button
> - Overworld HUD: Larger repositioned Run button, verified hamburger icon, themed party strip
> - Stats Screen: Thicker solid-color bars, consistent footer buttons, fixed Total padding
> - PC Box: Denser party panel, larger text, selection glow effect
> - Bag Screen: Clean item display, folder-style tabs (deferred - already well-structured)
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (Global) -> Tasks 2-6 (Screen-specific) -> Task 7 (Verification)

---

## Context

### Original Request

User provided an exhaustive technical specification for UI/UX fixes with exact hex codes, pixel values, and coordinates. Critical issue: dark text on dark backgrounds making Save/Load screen unreadable.

### Interview Summary

**Key Discussions**:

- User provided complete specifications - no ambiguity
- Strict adherence to hex codes required: "Do not deviate"
- All changes are visual CSS/SCSS only - no logic changes

**Research Findings**:

- All components use scoped SCSS within Svelte files
- Global design system exists at `src/styles/_pixel-art.scss` with matching CSS variables
- Existing color palette aligns with user specifications
- Test infrastructure exists (Vitest) but CSS changes require manual visual verification

### Self-Review (Metis Unavailable)

**Identified Gaps** (addressed):

- Gap: User wants "folder-style tabs" for Bag but current implementation is already clean - APPLY current style as default
- Gap: User wants pixel-art hamburger icon - VERIFY current SVG meets requirements before changing
- Gap: PokedexStats vs PokemonStats - both exist, user likely means PokemonStats (team summary) - APPLY to both for consistency

---

## Work Objectives

### Core Objective

Fix critical text contrast issues and implement pixel-perfect UI polish across 5 game screens to improve accessibility and visual consistency.

### Concrete Deliverables

- `src/lib/saves/LoadSave.svelte` - White text, pixel-art button, aligned delete icon
- `src/lib/world/Controls.svelte` - Enlarged/repositioned Run button
- `src/lib/world/OverworldTeamPanel.svelte` - Dark themed borders
- `src/lib/menus/pokemon-list/PokemonStats.svelte` - 16px solid bars, footer buttons
- `src/lib/menus/pokedex/PokedexStats.svelte` - 16px solid bars, dark grey background
- `src/lib/menus/boxes/Boxes.svelte` - Denser party panel, larger text, selection glow
- `src/lib/menus/bag/Bag.svelte` - Verify existing styling meets requirements

### Definition of Done

- [ ] All text on dark backgrounds uses white (#FFFFFF) or light blue-grey (#AACCFF)
- [ ] All buttons follow pixel-art aesthetic: 2px black border, 4px hard drop shadow
- [ ] Run button is 48x48px at 10 o'clock position relative to B button
- [ ] Stat bars are 16px height with solid flat colors and dark grey (#333) background
- [ ] Visual verification via browser confirms all changes

### Must Have

- White text (#FFFFFF) on all dark blue backgrounds
- 2px solid black borders on buttons
- 4px 4px 0px #000000 hard drop shadows (no blur)
- 16px stat bar height with solid colors
- 48x48px Run button repositioned

### Must NOT Have (Guardrails)

- NO gradients on stat bars (solid flat colors only)
- NO deviation from specified hex codes
- NO changes to JavaScript logic
- NO new components or files
- NO emojis or emoticons in code
- NO border-radius (pixel-art aesthetic enforced globally)

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest)
- **User wants tests**: NO - pure CSS changes, not unit-testable
- **Framework**: Manual verification via browser
- **QA approach**: Visual inspection with Playwright browser automation

### Manual QA Approach

Each TODO includes detailed browser verification steps using the dev server at `http://localhost:5173/`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Global color palette verification (no dependencies)
└── Task 2: Save/Load screen fixes (no dependencies)

Wave 2 (After Wave 1):
├── Task 3: Overworld HUD fixes (independent)
├── Task 4: Stats screen fixes - PokemonStats (independent)
└── Task 5: Stats screen fixes - PokedexStats (independent)

Wave 3 (After Wave 2):
├── Task 6: PC Box fixes (independent)
├── Task 7: Bag screen verification (independent)
└── Task 8: Final visual verification (depends: 1-7)

Critical Path: Task 1 -> Task 2 -> Task 8
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks               | Can Parallelize With |
| ---- | ---------- | -------------------- | -------------------- |
| 1    | None       | 2-7 (uses variables) | 2                    |
| 2    | None       | 8                    | 1                    |
| 3    | None       | 8                    | 4, 5                 |
| 4    | None       | 8                    | 3, 5                 |
| 5    | None       | 8                    | 3, 4                 |
| 6    | None       | 8                    | 7                    |
| 7    | None       | 8                    | 6                    |
| 8    | 1-7        | None                 | None (final)         |

---

## TODOs

- [x] 1. Verify/Update Global Color Variables

  **What to do**:
  - Verify `src/styles/_pixel-art.scss` has correct color values matching spec
  - Add any missing CSS custom properties for secondary text color (#AACCFF)
  - Ensure `--pixel-text-secondary: #AACCFF` exists for labels

  **Must NOT do**:
  - Do not change existing variable values that already match spec
  - Do not remove any existing variables

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file verification/minor addition
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: CSS custom property management

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: None (other tasks can use existing variables)
  - **Blocked By**: None

  **References**:
  - `src/styles/_pixel-art.scss:7-55` - Existing CSS custom properties (verify against spec)
  - User spec Section 1.A - Color Palette & Contrast requirements

  **Acceptance Criteria**:
  - [ ] `--pixel-bg-primary: #1c4b72` exists and unchanged
  - [ ] `--pixel-text-white: #ffffff` exists and unchanged
  - [ ] `--pixel-text-gold: #ffd700` exists and unchanged
  - [ ] `--pixel-text-secondary: #AACCFF` added if missing
  - [ ] Run `npm run dev` -> no CSS compilation errors

  **Commit**: YES
  - Message: `style(global): add secondary text color variable`
  - Files: `src/styles/_pixel-art.scss`
  - Pre-commit: `npm run lint`

---

- [x] 2. Fix Save/Load Screen Text Contrast & Button Styling

  **What to do**:
  - Change `.load-screen` color from `#262626` to `#FFFFFF` (line 152)
  - Change `.save` button text color to white
  - Change `.new-game button` to pixel-art style:
    - Background: `#0088CC`
    - Border: `2px solid #000`
    - Box-shadow: `4px 4px 0px #000`
    - Color: `#FFFFFF`
  - Increase `.save.selected` border thickness to `3px`
  - Center align `.actions .erase` button vertically within save slot container

  **Must NOT do**:
  - Do not change any JavaScript logic
  - Do not modify save data structure

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS styling with accessibility focus
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Color contrast and button styling expertise

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 8 (final verification)
  - **Blocked By**: None

  **References**:
  - `src/lib/saves/LoadSave.svelte:128-248` - Current SCSS styles
  - `src/lib/saves/LoadSave.svelte:149-157` - `.load-screen` with `color: #262626` (the problem)
  - `src/lib/saves/LoadSave.svelte:159-172` - `.new-game button` styling (needs pixel-art conversion)
  - `src/lib/saves/LoadSave.svelte:220-235` - `.save` button styling
  - `src/lib/saves/LoadSave.svelte:237-239` - `.save.selected` border (increase to 3px)
  - `src/lib/saves/LoadSave.svelte:193-218` - `.actions .erase` button (needs vertical centering)
  - User spec Section 2.A - Save/Load Screen requirements

  **Acceptance Criteria**:
  - [ ] `.load-screen` has `color: #FFFFFF` instead of `#262626`
  - [ ] `.new-game button` has:
    - `background: #0088CC`
    - `border: 2px solid #000`
    - `box-shadow: 4px 4px 0px #000`
    - `color: #FFFFFF`
  - [ ] `.save.selected` has `border: 3px solid #ffd700`
  - [ ] `.actions` uses `align-items: center` (not `flex-end`)

  **Manual Verification**:
  - [ ] Run `npm run dev`
  - [ ] Navigate to save/load screen
  - [ ] Verify: All text is white and readable on dark blue background
  - [ ] Verify: "Start a new game" button has pixel-art styling with hard shadow
  - [ ] Verify: Selected save has thick gold border
  - [ ] Verify: Delete (trash) icon is vertically centered with save slot

  **Commit**: YES
  - Message: `fix(save-load): fix text contrast and button styling for accessibility`
  - Files: `src/lib/saves/LoadSave.svelte`
  - Pre-commit: `npm run lint`

---

- [x] 3. Fix Overworld HUD - Run Button & Party Strip

  **What to do**:
  - Increase `.run-button` size from 44x44 to 48x48px
  - Reposition Run button to "10 o'clock" relative to B button:
    - Current: `bottom: calc(5dvh + 20px + 100px); right: max(20px, env(safe-area-inset-right, 20px))`
    - New: `bottom: calc(5dvh + 20px + 140px); right: calc(max(20px, env(safe-area-inset-right, 20px)) + 70px)`
  - Verify hamburger icon SVG path creates 3 thick white lines (currently correct at line 245)
  - In `OverworldTeamPanel.svelte`: Change `.team-slot` border from `#0d2538` to `#000000` (black)

  **Must NOT do**:
  - Do not change joystick logic
  - Do not modify button event handlers

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS positioning and mobile ergonomics
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Mobile UI positioning expertise

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 8 (final verification)
  - **Blocked By**: None

  **References**:
  - `src/lib/world/Controls.svelte:663-699` - `.run-button` styles (resize and reposition)
  - `src/lib/world/Controls.svelte:755-763` - B button positioning reference (`bottom: 0, left: 0` in ab-buttons)
  - `src/lib/world/Controls.svelte:243-246` - Hamburger SVG icon (verify 3 lines)
  - `src/lib/world/OverworldTeamPanel.svelte:165-169` - `.team-slot` border styling
  - User spec Section 2.B - Overworld HUD requirements

  **Acceptance Criteria**:
  - [ ] `.run-button` has `width: 48px; height: 48px`
  - [ ] `.run-button` repositioned up and left (10 o'clock from B button)
  - [ ] Hamburger icon SVG verified to show 3 thick lines
  - [ ] `.team-slot` border color changed to `#000` or `#000000`

  **Manual Verification**:
  - [ ] Run `npm run dev`
  - [ ] Navigate to overworld (load a save)
  - [ ] Verify: Run button is larger (48x48) and positioned at 10 o'clock from B button
  - [ ] Verify: Menu hamburger icon shows 3 thick white lines
  - [ ] Verify: Party strip on left has black/dark borders (not bright green)

  **Commit**: YES
  - Message: `style(hud): enlarge run button, reposition for ergonomics, fix party strip borders`
  - Files: `src/lib/world/Controls.svelte`, `src/lib/world/OverworldTeamPanel.svelte`
  - Pre-commit: `npm run lint`

---

- [x] 4. Fix Stats Screen (Team Summary) - Bars & Footer

  **What to do**:
  - In `PokemonStats.svelte`:
    - Increase `.stat-bar` height from 12px to 16px (line 528)
    - Remove any gradient, ensure solid flat color
    - Change `.stat-bar` background to `#333333` (currently `#143855`)
    - Add `padding-bottom: 20px` to `.total-row` container to prevent overlap
  - Footer buttons: The current design uses a grid layout - ensure "Value", "IVs", "EVs" headers are styled consistently

  **Must NOT do**:
  - Do not change Chart.js radar chart logic
  - Do not modify EV editing functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Progress bar styling and layout fixes
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Progress bar and stat display styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Task 8 (final verification)
  - **Blocked By**: None

  **References**:
  - `src/lib/menus/pokemon-list/PokemonStats.svelte:527-540` - `.stat-bar` and `.stat-bar-fill` styles
  - `src/lib/menus/pokemon-list/PokemonStats.svelte:553-563` - `.total-row` styling (add padding)
  - `src/lib/menus/pokemon-list/PokemonStats.svelte:475-498` - `.stats-header-row` for footer consistency
  - User spec Section 2.C - Stats Screen requirements

  **Acceptance Criteria**:
  - [ ] `.stat-bar` height is `16px` (not 12px)
  - [ ] `.stat-bar` background-color is `#333333` or `#333`
  - [ ] No gradient on stat bars (solid colors only)
  - [ ] `.total-row` has `padding-bottom: 20px` to prevent "Total" overlap

  **Manual Verification**:
  - [ ] Run `npm run dev`
  - [ ] Navigate to Team -> select Pokemon -> STATS tab
  - [ ] Verify: Stat bars are thicker (16px) with solid colors
  - [ ] Verify: Empty portion of bars is dark grey (#333)
  - [ ] Verify: "Total" row has spacing and doesn't overlap Speed bar

  **Commit**: YES
  - Message: `style(stats): thicker solid-color bars, fix total row padding`
  - Files: `src/lib/menus/pokemon-list/PokemonStats.svelte`
  - Pre-commit: `npm run lint`

---

- [x] 5. Fix Stats Screen (Pokedex) - Bar Styling Consistency

  **What to do**:
  - In `PokedexStats.svelte`:
    - Increase `.progress` height from 12px to 16px (line 362)
    - Change `.progress` background-color to `#333333` (currently `#0d2538`)
    - Ensure `.determinate` uses solid color (already uses `var(--tcolor1)`)

  **Must NOT do**:
  - Do not change 3D perspective effect on tables
  - Do not modify ability modal logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple CSS value changes in one location
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Progress bar styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 8 (final verification)
  - **Blocked By**: None

  **References**:
  - `src/lib/menus/pokedex/PokedexStats.svelte:360-369` - `.progress` container styling
  - `src/lib/menus/pokedex/PokedexStats.svelte:371-396` - `.determinate` fill styling
  - User spec Section 2.C - Stats Screen requirements (apply consistently)

  **Acceptance Criteria**:
  - [ ] `.progress` height is `16px` (not 12px)
  - [ ] `.progress` background-color is `#333333` or `#333`
  - [ ] `.determinate` uses solid color via `var(--tcolor1)` (verify no gradient)

  **Manual Verification**:
  - [ ] Run `npm run dev`
  - [ ] Navigate to Pokedex -> select Pokemon -> STATS tab
  - [ ] Verify: Stat bars are thicker (16px) with solid colors
  - [ ] Verify: Empty portion of bars is dark grey (#333)

  **Commit**: YES
  - Message: `style(pokedex-stats): thicker solid-color bars, dark grey background`
  - Files: `src/lib/menus/pokedex/PokedexStats.svelte`
  - Pre-commit: `npm run lint`

---

- [x] 6. Fix PC Box Screen - Party Panel & Selection

  **What to do**:
  - Reduce `.party .entries .entry` height from 64px to 52px (line 536) to increase density
  - Increase party Pokemon name/level font-size by 20% (from 18px to ~22px)
  - Add selection glow effect to `.box .entries .entry.over`:
    - Add `background-color: rgba(255, 255, 255, 0.1)` (semi-transparent white)

  **Must NOT do**:
  - Do not change box swap/move logic
  - Do not modify keyboard navigation

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout density and visual selection feedback
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Grid layout and selection state styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: Task 8 (final verification)
  - **Blocked By**: None

  **References**:
  - `src/lib/menus/boxes/Boxes.svelte:533-576` - `.party .entries .entry` styling (reduce height, increase font)
  - `src/lib/menus/boxes/Boxes.svelte:675-681` - `.box .entries .entry.over` state (add glow background)
  - User spec Section 2.D - PC Box requirements

  **Acceptance Criteria**:
  - [ ] `.party .entries .entry` height reduced to ~52px (from 64px)
  - [ ] `.party .entries .entry` font-size increased to ~22px (from 18px)
  - [ ] `.box .entries .entry.over` includes `background-color: rgba(255, 255, 255, 0.1)`

  **Manual Verification**:
  - [ ] Run `npm run dev`
  - [ ] Navigate to Menu -> Boxes
  - [ ] Verify: Party panel (left) Pokemon entries are more compact
  - [ ] Verify: Pokemon names and levels are larger/more readable
  - [ ] Verify: Hovering/selecting a box slot shows subtle white glow effect

  **Commit**: YES
  - Message: `style(pc-box): denser party panel, larger text, selection glow`
  - Files: `src/lib/menus/boxes/Boxes.svelte`
  - Pre-commit: `npm run lint`

---

- [x] 7. Verify Bag Screen Layout

  **What to do**:
  - Review current Bag.svelte layout against spec:
    - Current: 50/50 split (item-desc left, item-list right) - MATCHES spec
    - Current: Item quantity shown as `x{qty}` in gold - MATCHES spec
    - Current: Tabs styled as buttons with gold underline - ACCEPTABLE
  - If tabs need "folder" styling with chamfered corners, implement:
    - Add `clip-path: polygon(0 100%, 0 20%, 10% 0, 90% 0, 100% 20%, 100% 100%)` to active tab

  **Must NOT do**:
  - Do not change item usage logic
  - Do not modify keyboard navigation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Mostly verification, minor optional styling
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Tab styling patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 6)
  - **Blocks**: Task 8 (final verification)
  - **Blocked By**: None

  **References**:
  - `src/lib/menus/bag/Bag.svelte:398-426` - `.tab-content` layout (verify 50/50)
  - `src/lib/menus/bag/Bag.svelte:290-307` - `.tabs a` styling
  - `src/lib/menus/bag/Bag.svelte:460-491` - `.item-row` styling with quantity
  - User spec Section 2.E - Bag Screen requirements

  **Acceptance Criteria**:
  - [ ] Layout verified as 50% description / 50% item list
  - [ ] Item quantity displays as `x{qty}` aligned right (gold color)
  - [ ] Tabs have clear active state indication
  - [ ] (Optional) Folder-style tabs with chamfered corners if time permits

  **Manual Verification**:
  - [ ] Run `npm run dev`
  - [ ] Navigate to Menu -> Bag
  - [ ] Verify: Left panel shows item description, right panel shows item list
  - [ ] Verify: Item quantities shown as `x3` format in gold, right-aligned
  - [ ] Verify: Active tab clearly distinguished from inactive tabs

  **Commit**: YES (if changes made)
  - Message: `style(bag): verify layout, optional folder-style tabs`
  - Files: `src/lib/menus/bag/Bag.svelte`
  - Pre-commit: `npm run lint`

---

- [x] 8. Final Visual Verification

  **What to do**:
  - Run dev server and verify all screens match specifications
  - Take screenshots for evidence
  - Run linting to ensure no style errors

  **Must NOT do**:
  - Do not make additional changes without user approval

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification only, no code changes
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation for screenshots

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Final (after all others)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1-7

  **References**:
  - User spec Section 3 - Implementation Checklist
  - All modified component files

  **Acceptance Criteria**:
  - [ ] `npm run lint` passes with no errors
  - [ ] `npm run build` completes successfully
  - [ ] Save/Load screen: White text, pixel button, aligned delete icon
  - [ ] Overworld: 48x48 Run button at 10 o'clock, black party borders
  - [ ] Stats: 16px solid bars with #333 background
  - [ ] PC Box: Denser party, larger text, selection glow
  - [ ] Bag: 50/50 layout, gold quantity, clear tabs

  **Manual Verification**:
  - [ ] Run `npm run dev` and navigate through each screen
  - [ ] Visually confirm all changes match specifications
  - [ ] Run `npm run lint && npm run build` to verify no breaking changes

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                                     | Files                                          | Verification   |
| ---------- | ----------------------------------------------------------- | ---------------------------------------------- | -------------- |
| 1          | `style(global): add secondary text color variable`          | `_pixel-art.scss`                              | `npm run lint` |
| 2          | `fix(save-load): fix text contrast and button styling`      | `LoadSave.svelte`                              | `npm run lint` |
| 3          | `style(hud): enlarge run button, fix party borders`         | `Controls.svelte`, `OverworldTeamPanel.svelte` | `npm run lint` |
| 4          | `style(stats): thicker solid-color bars, fix total padding` | `PokemonStats.svelte`                          | `npm run lint` |
| 5          | `style(pokedex-stats): thicker bars, dark grey background`  | `PokedexStats.svelte`                          | `npm run lint` |
| 6          | `style(pc-box): denser party, larger text, selection glow`  | `Boxes.svelte`                                 | `npm run lint` |
| 7          | `style(bag): verify layout, optional folder tabs`           | `Bag.svelte`                                   | `npm run lint` |

---

## Success Criteria

### Verification Commands

```bash
npm run lint      # Expected: No errors
npm run build     # Expected: Successful build
npm run dev       # Expected: Visual verification of all screens
```

### Final Checklist

- [ ] All "Must Have" present:
  - [ ] White text on dark backgrounds
  - [ ] 2px black borders on buttons
  - [ ] 4px hard drop shadows
  - [ ] 16px stat bar height
  - [ ] 48x48 Run button repositioned
- [ ] All "Must NOT Have" absent:
  - [ ] No gradients on stat bars
  - [ ] No deviation from hex codes
  - [ ] No logic changes
  - [ ] No new components
- [ ] All lint checks pass
- [ ] Build succeeds
