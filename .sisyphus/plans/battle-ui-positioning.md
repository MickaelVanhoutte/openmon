# Battle UI Positioning Fix

## TL;DR

> **Quick Summary**: Fix Pokemon sprite positioning and FloatingPokemonInfo panel placement for both 1v1 and 2v2 battles to match the reference drawing. Fix leader lines, spacing, offscreen issues, and collision avoidance.
>
> **Deliverables**:
>
> - Fixed sprite CSS positioning formulas (1v1 and 2v2)
> - Fixed FloatingPokemonInfo panel placement (above sprites, no overlaps, no offscreen)
> - Fixed leader lines pointing to sprite centers
> - Synced animation grid coordinates
> - Updated test assertions
>
> **Estimated Effort**: Medium
> **Parallel Execution**: NO — sequential (each change builds on the previous)
> **Critical Path**: Task 1 (sprites) → Task 2 (panels) → Task 3 (leader lines) → Task 4 (animation grid sync) → Task 5 (visual QA)

---

## Context

### Original Request

Fix the battle UI element positioning — specifically FloatingPokemonInfo panels and Pokemon sprites. Panels should be above their respective Pokemon, not overlap each other, not go offscreen, not touch sprites, and stay on their side. Leader lines should point toward the center of each Pokemon sprite. Both 1v1 and 2v2 layouts need adjustment. Reference drawing provided at `.sisyphus/drafts/positioning.png`.

### Interview Summary

**Key Discussions**:

- No automated tests needed — purely visual tuning
- Both 1v1 and 2v2 positions should be adjusted (not just 2v2)
- Leader lines should point to sprite CENTER (not top)

**Research Findings**:

- **BUG**: Opponent-1 in 2v2 has `right: calc(18% + 1 * -18%)` = `right: 0%` — pushed flush against screen edge
- **BUG**: Leader line `atan2` targets sprite TOP (`rect.top`) instead of sprite CENTER (`rect.top + rect.height/2`)
- **BUG**: MIN_GAP = 8px is too small — panels visually touch sprites
- **BUG**: Ally 2v2 horizontal spread is only 15% — too tight
- FloatingPokemonInfo uses `ResizeObserver` + `requestAnimationFrame` polling to track sprite DOM position
- Collision avoidance exists: up to 10 iterations, index-0 has priority over index-1
- Side bounds exist: ally panels ≤ 50% viewport width, opponent panels ≥ 50%
- TWO independent coordinate systems must stay synced: CSS layout (Battle.svelte) and animation grid (position-system.ts)

### Metis Review

**Identified Gaps** (addressed):

- **4 files needed, not 3**: position-system.test.ts assertions will break → added Task 4
- **Leader line target ambiguity**: "center" means geometric center (50% height), not head area — clarified in Task 3
- **Viewport consistency**: Playwright QA should use fixed 1280×720 viewport → specified in QA scenarios
- **Coupled changes risk**: CSS ↔ animation grid must update together → Task 4 explicitly syncs them
- **Mobile not supported**: WIDGET_WIDTH=180px consumes 92% of ally half on 390px screens → documented as known limitation, desktop-only

---

## Work Objectives

### Core Objective

Tune all battle UI element positions (sprites, FloatingPokemonInfo panels, leader lines) to match the reference drawing for both 1v1 and 2v2 battle types.

### Concrete Deliverables

- Updated sprite CSS formulas in `src/lib/battle/Battle.svelte`
- Updated panel positioning constants in `src/lib/battle/FloatingPokemonInfo.svelte`
- Fixed leader line targeting in `src/lib/battle/FloatingPokemonInfo.svelte`
- Synced animation grid in `src/js/battle/animations/position-system.ts`
- Updated test assertions in `src/js/__tests__/battle/animations/position-system.test.ts`

### Definition of Done

- [ ] All 4 panels visible and positioned above their respective sprites in 2v2
- [ ] No panel overlaps another panel on the same side
- [ ] No panel extends offscreen (top, left, or right)
- [ ] Ally panels stay within left 50% of screen
- [ ] Opponent panels stay within right 50% of screen
- [ ] Leader lines point toward sprite centers (not tops)
- [ ] Opponent-1 sprite is NOT flush against right edge
- [ ] 1v1 layout matches reference proportions
- [ ] `npm run check` passes
- [ ] `npm run test:run` passes (with updated assertions)
- [ ] `npm run lint` passes

### Must Have

- Sprite positions adjusted for both 1v1 and 2v2
- FloatingPokemonInfo panels above sprites with adequate gap
- Leader lines targeting sprite center
- Animation grid synced with CSS positions

### Must NOT Have (Guardrails)

- **DO NOT** touch `src/js/battle/sprite-position.ts` — it's for ActionBar only, unrelated to FloatingPokemonInfo
- **DO NOT** change z-index hierarchy (panels at z:50, sprites at z:5-8, fx at z:9)
- **DO NOT** change the skew transform (`--skew-angle: -15deg`) — part of the design language
- **DO NOT** restructure the collision avoidance algorithm — only tune constants
- **DO NOT** change the HP polling mechanism (`setInterval 100ms` / `requestAnimationFrame`)
- **DO NOT** alter `isSpritePositioned()` readiness thresholds (opacity >= 0.5, scale >= 90%)
- **DO NOT** touch entry/faint/run animation functions in `animations/index.ts`
- **DO NOT** add cross-side collision avoidance (ally panels vs opponent panels)
- **DO NOT** refactor CSS formula structure (keep `calc()` + `var(--offSet)` pattern) — change coefficients only
- **DO NOT** make WIDGET_WIDTH/WIDGET_HEIGHT dynamic — keep hardcoded, just tune values if needed
- **DO NOT** add emojis to code

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: NO (purely visual tuning task)
- **Framework**: Vitest (existing tests need assertion updates only)
- **Agent-Executed QA**: ALWAYS — Playwright visual verification at viewport 1280×720

---

## Execution Strategy

### Sequential Execution

All tasks are sequential — each builds on the previous:

```
Task 1: Fix sprite CSS positions (Battle.svelte)
    ↓
Task 2: Fix FloatingPokemonInfo positioning (FloatingPokemonInfo.svelte)
    ↓
Task 3: Fix leader line targeting (FloatingPokemonInfo.svelte)
    ↓
Task 4: Sync animation grid + update tests (position-system.ts + test)
    ↓
Task 5: Visual QA — Playwright verification of final result
```

### Dependency Matrix

| Task | Depends On | Blocks     | Can Parallelize With                     |
| ---- | ---------- | ---------- | ---------------------------------------- |
| 1    | None       | 2, 3, 4, 5 | None                                     |
| 2    | 1          | 5          | None                                     |
| 3    | 1          | 5          | None (same file as 2, edit sequentially) |
| 4    | 1          | 5          | None                                     |
| 5    | 1, 2, 3, 4 | None       | None (final)                             |

### Agent Dispatch Summary

| Task | Recommended Agent                                                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------------------ |
| 1-4  | Single `delegate_task(category="unspecified-high", load_skills=["playwright"])` — all CSS/JS tuning in one session |
| 5    | Same session — Playwright visual QA                                                                                |

---

## TODOs

- [ ] 1. Fix Sprite CSS Positioning in Battle.svelte

  **What to do**:
  - Open `src/lib/battle/Battle.svelte`
  - **Understand the current CSS** (lines ~810-841):
    ```scss
    // ALLY SPRITES
    .ally-sprite {
    	bottom: calc(12% + var(--offSet) * 5%); // 0→12%, 1→17%
    	left: calc(25% + var(--offSet) * -15%); // 0→25%, 1→10%
    }
    // OPPONENT SPRITES
    .opponent-sprite {
    	bottom: calc(22% - (var(--offSet) * -5%)); // 0→22%, 1→27%
    	right: calc(18% + var(--offSet) * -18%); // 0→18%, 1→0% ← BUG
    }
    ```
  - **Adjust the formulas** to match the reference drawing. The key issues:
    1. **Opponent 2v2 `right` formula**: The `-18%` multiplier causes `right: 0%` for offSet=1. Reduce to approximately `-10%` so opponent-1 lands around `right: 8%` (away from edge)
    2. **Ally 2v2 `left` formula**: The `-15%` spread is too tight. Change to approximately `-20%` so ally-1 is at `left: 5%` (more separation)
    3. **1v1 base values**: Adjust the base percentages to match the reference drawing proportions
    4. **Vertical spread (`bottom`)**: Evaluate if the 5% vertical offset per slot is adequate — compare against the reference
  - Keep the `calc()` + `var(--offSet)` pattern — only change the coefficient values
  - **DO NOT** change z-index formulas or `transform-origin`
  - Run `npm run dev` and visually compare sprite positions against reference drawing at `.sisyphus/drafts/positioning.png`

  **Must NOT do**:
  - Touch `sprite-position.ts` (ActionBar-only, unrelated)
  - Restructure CSS formula expressions (change values only)
  - Alter sprite `height: 50%` or `width: auto` sizing
  - Change z-index hierarchy

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multi-file visual tuning requiring careful value iteration
  - **Skills**: [`playwright`]
    - `playwright`: Needed for visual QA verification screenshots
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not needed — this is CSS value tuning, not design/component work

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (first task)
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `src/lib/battle/Battle.svelte:810-841` — Current sprite CSS formulas with `calc()` and `var(--offSet)` pattern. Change the coefficient numbers while keeping the formula structure.
  - `src/lib/battle/Battle.svelte:381-490` — The `draw()` function that creates `<img>` sprites and sets `--offSet` CSS variable via `style.setProperty('--offSet', String(index))`. Understand how index maps to slot.

  **Visual References**:
  - `.sisyphus/drafts/positioning.png` — The reference drawing showing target sprite positions for 2v2 layout. ALL position changes must visually match this drawing.

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 2v2 opponent sprites properly spaced
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173, 2v2 battle loaded
    Steps:
      1. Navigate to: http://localhost:5173 (or trigger 2v2 battle via debug mode)
      2. Wait for: .opponent-sprite elements visible (timeout: 15s)
      3. Measure: all .opponent-sprite elements' boundingBox
      4. Assert: opponent-1 sprite right edge is at least 30px from viewport right edge (NOT flush at right:0%)
      5. Assert: horizontal gap between opponent-0 and opponent-1 is at least 50px
      6. Screenshot: .sisyphus/evidence/task-1-opponent-sprites-2v2.png
    Expected Result: Both opponent sprites visible with clear spacing, neither at screen edge
    Evidence: .sisyphus/evidence/task-1-opponent-sprites-2v2.png

  Scenario: 2v2 ally sprites properly spaced
    Tool: Playwright (playwright skill)
    Preconditions: 2v2 battle loaded
    Steps:
      1. Measure: all .ally-sprite elements' boundingBox
      2. Assert: horizontal gap between ally-0 and ally-1 is at least 80px
      3. Assert: ally-0 is to the right and higher than ally-1 (front vs back)
      4. Screenshot: .sisyphus/evidence/task-1-ally-sprites-2v2.png
    Expected Result: Ally sprites clearly separated with proper depth staggering
    Evidence: .sisyphus/evidence/task-1-ally-sprites-2v2.png

  Scenario: 1v1 sprite positions reasonable
    Tool: Playwright (playwright skill)
    Preconditions: 1v1 battle loaded
    Steps:
      1. Measure: .ally-sprite and .opponent-sprite boundingBox
      2. Assert: ally sprite is in bottom-left quadrant (x < 50% viewport, y > 50% viewport)
      3. Assert: opponent sprite is in upper-right quadrant (x > 50% viewport, y < 50% viewport)
      4. Assert: clear separation between ally and opponent zones
      5. Screenshot: .sisyphus/evidence/task-1-sprites-1v1.png
    Expected Result: Single battle sprites positioned in correct quadrants matching reference
    Evidence: .sisyphus/evidence/task-1-sprites-1v1.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshots in .sisyphus/evidence/ for all sprite position scenarios
  - [ ] Each evidence file named: task-1-{scenario-slug}.png

  **Commit**: YES
  - Message: `fix(battle): adjust sprite CSS positions for 1v1 and 2v2`
  - Files: `src/lib/battle/Battle.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 2. Fix FloatingPokemonInfo Panel Positioning

  **What to do**:
  - Open `src/lib/battle/FloatingPokemonInfo.svelte`
  - **Increase MIN_GAP** (line 201): Change from `8` to `20` (or similar value that creates visible separation between panel bottom and sprite top)
  - **Verify collision avoidance tuning**:
    - The collision avoidance already exists (lines 350-440). Verify that with the new sprite positions from Task 1, the 10-iteration loop still converges (panels don't get stuck)
    - The `shouldYieldTo()` function (same-side, lower-index wins) should still work correctly
  - **Verify side bounds** (`getSideBounds` function):
    - Ally panels: right edge must NOT exceed 50% viewport width
    - Opponent panels: left edge must NOT go below 50% viewport width
    - These bounds already exist but verify they work with new positions
  - **WIDGET_WIDTH and WIDGET_HEIGHT**: Keep at 180/80 unless panels visually mismatch. Only tune if needed.
  - **Update fallback `position` props in Battle.svelte** (lines ~631/645/661/675) to approximately match new computed positions. These are low priority since they're only visible at opacity:0 during sprite tracking initialization, but update for consistency:
    - Ally 0: update `bottom` and `left` to approximate new positions
    - Ally 1: update similarly
    - Opponent 0 and 1: update similarly

  **Must NOT do**:
  - Restructure the collision avoidance algorithm
  - Make WIDGET_WIDTH/WIDGET_HEIGHT dynamic
  - Add cross-side collision avoidance
  - Change z-index (stays at 50)
  - Alter skew transform

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires careful constant tuning with visual verification
  - **Skills**: [`playwright`]
    - `playwright`: Visual QA of panel positions

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 1)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/lib/battle/FloatingPokemonInfo.svelte:201` — `const MIN_GAP = 8;` — change this value
  - `src/lib/battle/FloatingPokemonInfo.svelte:295-474` — `updatePositionFromSprite()` — the main positioning function. Understand the flow: measure sprite → compute initial position → collision check loop → apply side bounds → set style
  - `src/lib/battle/FloatingPokemonInfo.svelte:350-440` — Collision avoidance loop (10 iterations max). Reads other `.floating-pokemon-info` elements and sprites. Uses `shouldYieldTo()` for priority.
  - `src/lib/battle/FloatingPokemonInfo.svelte:197-204` — Constants block: `WIDGET_HEIGHT = 80`, `WIDGET_WIDTH = 180`, `MIN_GAP = 8`

  **Visual References**:
  - `.sisyphus/drafts/positioning.png` — Reference drawing showing panel positions above sprites with clear gaps

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 2v2 panels above sprites with gap
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, 2v2 battle loaded, all 4 panels visible
    Steps:
      1. Wait for: .floating-pokemon-info elements (4 expected, timeout: 15s)
      2. For each panel-sprite pair:
         a. Get panel boundingBox (bottom edge = y + height)
         b. Get corresponding sprite boundingBox (top edge = y)
         c. Assert: panel bottom edge + MIN_GAP <= sprite top edge (panel is ABOVE sprite with gap)
      3. Screenshot: .sisyphus/evidence/task-2-panels-above-sprites.png
    Expected Result: All 4 panels float above their sprites with visible gap (no touching)
    Evidence: .sisyphus/evidence/task-2-panels-above-sprites.png

  Scenario: Panels do not overlap same-side
    Tool: Playwright (playwright skill)
    Preconditions: 2v2 battle loaded
    Steps:
      1. Get boundingBox of ally panel 0 and ally panel 1
      2. Assert: no horizontal or vertical overlap between them
      3. Get boundingBox of opponent panel 0 and opponent panel 1
      4. Assert: no horizontal or vertical overlap between them
      5. Screenshot: .sisyphus/evidence/task-2-no-overlap.png
    Expected Result: Same-side panels have clear separation
    Evidence: .sisyphus/evidence/task-2-no-overlap.png

  Scenario: Panels stay on their side
    Tool: Playwright (playwright skill)
    Preconditions: 2v2 battle loaded, viewport 1280x720
    Steps:
      1. Get boundingBox of each ally panel
      2. Assert: ally panel right edge (x + width) < 640 (50% of 1280)
      3. Get boundingBox of each opponent panel
      4. Assert: opponent panel left edge (x) >= 640
      5. Screenshot: .sisyphus/evidence/task-2-side-bounds.png
    Expected Result: Ally panels in left half, opponent panels in right half
    Evidence: .sisyphus/evidence/task-2-side-bounds.png

  Scenario: No panel goes offscreen
    Tool: Playwright (playwright skill)
    Preconditions: 2v2 battle loaded, viewport 1280x720
    Steps:
      1. Get boundingBox of all 4 panels
      2. Assert: each panel top edge (y) >= 0 (not above viewport)
      3. Assert: each panel left edge (x) >= 0 (not left of viewport)
      4. Assert: each panel right edge (x + width) <= 1280 (not right of viewport)
      5. Screenshot: .sisyphus/evidence/task-2-no-offscreen.png
    Expected Result: All panels fully visible within viewport
    Evidence: .sisyphus/evidence/task-2-no-offscreen.png
  ```

  **Evidence to Capture:**
  - [ ] Screenshots in .sisyphus/evidence/ for panel positioning scenarios

  **Commit**: YES
  - Message: `fix(battle): increase panel-to-sprite gap and verify collision avoidance`
  - Files: `src/lib/battle/FloatingPokemonInfo.svelte`, `src/lib/battle/Battle.svelte` (fallback props)
  - Pre-commit: `npm run check`

---

- [ ] 3. Fix Leader Line Targeting

  **What to do**:
  - Open `src/lib/battle/FloatingPokemonInfo.svelte`
  - **Fix the leader line target point** — currently targets sprite TOP, should target sprite CENTER:
    - Find line ~314 where `spriteTopY` is calculated: `spriteTopY = rect.top - containerRect.top`
    - This value is used in the leader line angle calculation (line ~454): `const deltaY = spriteTopY - boxBottomY`
    - Change the target to sprite CENTER: `const spriteCenterY = rect.top - containerRect.top + rect.height / 2`
    - Update the `deltaY` calculation to use `spriteCenterY` instead of `spriteTopY`
    - The `atan2` calculation for `angleDeg` should then naturally compute the correct angle pointing toward sprite center
  - **Verify leader line length**: After changing the target from top to center, the leader line will be longer (additional `rect.height / 2` distance). Verify the line doesn't look too long. The `MIN_LENGTH = 15` constant should still be fine.
  - **IMPORTANT**: The `spriteTopY` value is ALSO used for initial panel placement (panel sits above sprite top). Only change the leader line's target reference, NOT the panel placement reference. The panel should still sit above the sprite's TOP edge, but the leader line should POINT to the sprite's CENTER.
  - This means you may need to introduce a separate variable for the leader line target (e.g., `leaderTarget.y = spriteTopY + rect.height / 2`) while keeping `spriteTopY` for panel placement.

  **Must NOT do**:
  - Change leader line width (2px), color, or gradient
  - Alter the CSS transform approach (rotate + translateX(-50%))
  - Change how panel initial position is computed (still uses sprite top)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires understanding trigonometry and coordinate math
  - **Skills**: [`playwright`]
    - `playwright`: Visual QA of leader line angles

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 2, same file)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/lib/battle/FloatingPokemonInfo.svelte:314` — `spriteTopY = rect.top - containerRect.top` — this is the current target point (sprite TOP edge)
  - `src/lib/battle/FloatingPokemonInfo.svelte:454-460` — Leader line angle calculation using `atan2(deltaX, deltaY)` and distance calculation. The `deltaY = spriteTopY - boxBottomY` needs to change to `spriteCenterY - boxBottomY`
  - `src/lib/battle/FloatingPokemonInfo.svelte:317` — Initial panel top position: `top = spriteTopY - WIDGET_HEIGHT - MIN_GAP` — this should KEEP using sprite top, not center
  - `src/lib/battle/FloatingPokemonInfo.svelte:772-785` — Leader line CSS: `.leader-line { position:absolute; width:2px; top:100%; left:50%; ... }` with dynamic `height` and `transform: rotate()`

  **Visual References**:
  - `.sisyphus/drafts/positioning.png` — Shows leader lines angling from panel bottom toward sprite body centers, not top edges

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Leader lines point toward sprite centers
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, 2v2 battle loaded, all 4 panels visible
    Steps:
      1. Wait for: .leader-line elements visible (4 expected, timeout: 15s)
      2. For each leader line:
         a. Get the computed style — extract transform rotation angle
         b. Get the parent panel's position and the corresponding sprite's position
         c. Compute expected angle: atan2(spriteCenterX - panelCenterX, spriteCenterY - panelBottomY)
         d. Assert: actual rotation angle matches expected within ±5 degrees
      3. Assert: each leader line has height > 15px (MIN_LENGTH)
      4. Screenshot: .sisyphus/evidence/task-3-leader-lines-2v2.png
    Expected Result: Leader lines visually point toward the center mass of each Pokemon sprite, not their top edges
    Evidence: .sisyphus/evidence/task-3-leader-lines-2v2.png

  Scenario: 1v1 leader lines also correct
    Tool: Playwright (playwright skill)
    Preconditions: 1v1 battle loaded
    Steps:
      1. Wait for: .leader-line elements (2 expected)
      2. Screenshot: .sisyphus/evidence/task-3-leader-lines-1v1.png
      3. Visually verify lines point toward sprite bodies, not above them
    Expected Result: Both leader lines angle correctly in single battle
    Evidence: .sisyphus/evidence/task-3-leader-lines-1v1.png
  ```

  **Commit**: YES (group with Task 2)
  - Message: `fix(battle): leader lines point to sprite center instead of top`
  - Files: `src/lib/battle/FloatingPokemonInfo.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 4. Sync Animation Grid and Update Tests

  **What to do**:
  - Open `src/js/battle/animations/position-system.ts`
  - **Update the grid coordinates** to approximately match the new CSS positions from Task 1:
    - The CSS uses `bottom`/`left`/`right` percentages; the grid uses `x` (from-left %) and `y` (from-top %)
    - Conversion rules:
      - CSS `left: L%` → Grid `x ≈ L + (sprite-visual-width-% / 2)` (center of sprite)
      - CSS `right: R%` → Grid `x ≈ 100 - R - (sprite-visual-width-% / 2)`
      - CSS `bottom: B%` → Grid `y ≈ 100 - B - (sprite-height-%)`
    - Update `SINGLE_BATTLE_SLOTS` (currently: player-0 `{x:25, y:70}`, opponent-0 `{x:75, y:25}`)
    - Update `DOUBLE_BATTLE_SLOTS` (currently: player-0 `{x:20, y:70}`, player-1 `{x:40, y:75}`, opponent-0 `{x:60, y:20}`, opponent-1 `{x:80, y:25}`)
    - The grid values don't need to be pixel-perfect — they're used for move animation paths, not static layout. Approximate sync is sufficient.
  - Open `src/js/__tests__/battle/animations/position-system.test.ts`
  - **Update test assertions** to match the new grid values:
    - Lines 17-20: Single player-0 x/y/z/scale assertions
    - Lines 27-30: Single opponent-0 x/y/z/scale assertions
    - Lines 41-44: Double battle positions (player-0.x, player-1.x, opponent-0.x, opponent-1.x)
    - Only change the expected values — don't restructure tests
  - Run `npm run test:run` to verify all tests pass

  **Must NOT do**:
  - Touch `sprite-position.ts` (different purpose — ActionBar)
  - Change the `BattlePositionSystem` class methods (lerp, toScreenCoords, etc.)
  - Alter z or scale values unless directly affected by position changes
  - Restructure test file

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires coordinate system translation and test updates
  - **Skills**: [`playwright`]
    - `playwright`: Already loaded from prior tasks

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 1)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/position-system.ts:12-15` — `SINGLE_BATTLE_SLOTS`: player-0 `{x:25, y:70, z:0, scale:1.0}`, opponent-0 `{x:75, y:25, z:200, scale:0.85}`
  - `src/js/battle/animations/position-system.ts:29-34` — `DOUBLE_BATTLE_SLOTS`: positions for all 4 slots
  - `src/js/__tests__/battle/animations/position-system.test.ts:17-20` — Single player-0 assertions (x=25, y=70, z=0, scale=1.0)
  - `src/js/__tests__/battle/animations/position-system.test.ts:27-30` — Single opponent-0 assertions (x=75, y=25, z=200, scale=0.85)
  - `src/js/__tests__/battle/animations/position-system.test.ts:41-44` — Double battle position assertions

  **Acceptance Criteria**:

  ```
  Scenario: Tests pass after grid update
    Tool: Bash
    Preconditions: Grid values updated in position-system.ts, assertions updated in test file
    Steps:
      1. Run: npm run test:run -- --reporter=verbose src/js/__tests__/battle/animations/position-system.test.ts
      2. Assert: exit code 0
      3. Assert: all tests pass (0 failures)
    Expected Result: All position-system tests green
    Evidence: Terminal output captured

  Scenario: Type check passes
    Tool: Bash
    Steps:
      1. Run: npm run check
      2. Assert: exit code 0
    Expected Result: No TypeScript errors
    Evidence: Terminal output captured

  Scenario: Lint passes
    Tool: Bash
    Steps:
      1. Run: npm run lint
      2. Assert: exit code 0
    Expected Result: No lint errors
    Evidence: Terminal output captured
  ```

  **Commit**: YES
  - Message: `fix(battle): sync animation grid coords with new sprite positions`
  - Files: `src/js/battle/animations/position-system.ts`, `src/js/__tests__/battle/animations/position-system.test.ts`
  - Pre-commit: `npm run test:run`

---

- [ ] 5. Visual QA — Final Verification

  **What to do**:
  - This is the comprehensive visual verification task
  - Use Playwright at viewport **1280×720** to capture final screenshots of both 1v1 and 2v2 battles
  - Compare against the reference drawing at `.sisyphus/drafts/positioning.png`
  - If any position doesn't match the reference, go back and adjust values in the relevant task's file
  - **How to trigger battles**: Check if `DEBUG = true` in `src/js/env.ts` allows skipping to battles. If not, navigate through the game UI to trigger encounters. Look for any debug/test battle triggers.

  **Must NOT do**:
  - Add new test infrastructure
  - Create automated visual regression tests
  - Modify game logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Final verification requiring careful visual comparison
  - **Skills**: [`playwright`]
    - `playwright`: Core tool for browser-based visual verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 2, 3, 4

  **References**:

  **Visual References**:
  - `.sisyphus/drafts/positioning.png` — THE reference drawing. All positions must match.
  - `.sisyphus/evidence/task-1-*.png` — Sprite position screenshots from Task 1
  - `.sisyphus/evidence/task-2-*.png` — Panel position screenshots from Task 2
  - `.sisyphus/evidence/task-3-*.png` — Leader line screenshots from Task 3

  **Code References**:
  - `src/js/env.ts` — DEBUG flag to skip intro sequences

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Full 2v2 battle layout matches reference
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, viewport 1280x720, 2v2 battle loaded
    Steps:
      1. Navigate to battle
      2. Wait for all 4 FloatingPokemonInfo panels visible (timeout: 20s)
      3. Full-page screenshot: .sisyphus/evidence/task-5-final-2v2.png
      4. Verify against reference:
         a. Allies in bottom-left quadrant, staggered depth
         b. Opponents in upper-right quadrant, properly spaced
         c. All 4 panels above their sprites with gap
         d. No overlapping panels
         e. Leader lines pointing toward sprite centers
         f. No elements offscreen
    Expected Result: Layout matches reference drawing at .sisyphus/drafts/positioning.png
    Evidence: .sisyphus/evidence/task-5-final-2v2.png

  Scenario: Full 1v1 battle layout matches reference
    Tool: Playwright (playwright skill)
    Preconditions: 1v1 battle loaded, viewport 1280x720
    Steps:
      1. Full-page screenshot: .sisyphus/evidence/task-5-final-1v1.png
      2. Verify:
         a. Ally in bottom-left area with panel above
         b. Opponent in upper-right area with panel above
         c. Leader lines pointing to sprite centers
         d. Good separation between ally and opponent zones
    Expected Result: Clean 1v1 layout
    Evidence: .sisyphus/evidence/task-5-final-1v1.png

  Scenario: Final build and quality checks pass
    Tool: Bash
    Steps:
      1. Run: npm run check && npm run lint && npm run test:run
      2. Assert: all exit code 0
    Expected Result: No type errors, lint errors, or test failures
    Evidence: Terminal output captured
  ```

  **Evidence to Capture:**
  - [ ] .sisyphus/evidence/task-5-final-2v2.png — The definitive 2v2 screenshot
  - [ ] .sisyphus/evidence/task-5-final-1v1.png — The definitive 1v1 screenshot
  - [ ] Terminal output for build/lint/test

  **Commit**: NO (verification only — no code changes unless corrections needed)

---

## Commit Strategy

| After Task | Message                                                             | Files                                                          | Verification       |
| ---------- | ------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------ |
| 1          | `fix(battle): adjust sprite CSS positions for 1v1 and 2v2`          | `Battle.svelte`                                                | `npm run check`    |
| 2+3        | `fix(battle): tune panel positioning and leader line targeting`     | `FloatingPokemonInfo.svelte`, `Battle.svelte` (fallback props) | `npm run check`    |
| 4          | `fix(battle): sync animation grid coords with new sprite positions` | `position-system.ts`, `position-system.test.ts`                | `npm run test:run` |

---

## Success Criteria

### Verification Commands

```bash
npm run check    # Expected: 0 errors
npm run lint     # Expected: 0 errors
npm run test:run # Expected: all tests pass
```

### Final Checklist

- [ ] Sprites properly spaced in 2v2 (opponents NOT at screen edge)
- [ ] Sprites properly positioned in 1v1
- [ ] All FloatingPokemonInfo panels above their sprites
- [ ] No panel-to-panel overlap on same side
- [ ] No panels offscreen (even partially)
- [ ] Ally panels within left 50%, opponent panels within right 50%
- [ ] Leader lines point to sprite centers, not tops
- [ ] Animation grid synced with CSS positions
- [ ] All existing tests pass (with updated assertions)
- [ ] Final screenshots match reference drawing

### Known Limitations (Out of Scope)

- **Mobile viewport**: WIDGET_WIDTH=180px consumes 92% of ally half on 390px screens. Desktop-only for now.
- **Impatience animation jitter**: Sprites shift ±2px periodically; panels may lag 1-2 frames. Pre-existing, minor.
- **Switch-in transition**: When a Pokemon faints and is replaced, panels briefly rearrange. Pre-existing behavior.
- **Cross-side collision**: Ally and opponent panels can theoretically overlap at the 50% boundary. Not addressed.
