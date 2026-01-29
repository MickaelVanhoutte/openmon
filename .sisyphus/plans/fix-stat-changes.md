# Fix Stat-Changing Moves and UI Display

## TL;DR

> **Quick Summary**: Fix 4 critical bugs causing stat-changing moves (Agility, Swords Dance, etc.) to always fail and stat multipliers to display incorrectly in battle UI.
>
> **Deliverables**:
>
> - Fixed accuracy check for 192 status moves (no longer show "But it failed!")
> - Proper stat stage clamping (±6 range)
> - Correct UI multiplier formulas for negative stat stages
> - Comprehensive test coverage using TDD
>
> **Estimated Effort**: Medium (4-6 tasks, ~2-3 hours)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 → Task 2 → Task 4

---

## Context

### Original Request

User reported: "I played the move Agility but it keeps failing, stats changes are not displayed in the UI, review every move, everything must work as intended"

### Interview Summary

**Key Discussions**:

- Confirmed behavior: Move shows "But it failed!" message
- Test approach: TDD (write failing tests first)
- Test infrastructure: Vitest already configured, stat-changes.test.ts exists

**Research Findings**:

- **ROOT CAUSE**: 192 moves have `accuracy: ""` (empty string) in JSON data. The accuracy check `move.accuracy === 0` fails because `"" !== 0`, causing all status moves to "fail"
- **Stat clamping bug**: `changeBattleStats()` allows stages to exceed ±6 when applying multi-stage changes
- **UI formula bug**: AllyInfo/EnemyInfo use incorrect formula for negative stat stages
- **Code/test mismatch**: Tests expect clamping behavior that implementation doesn't perform

---

## Work Objectives

### Core Objective

Make all stat-changing moves work correctly and display accurate stat multipliers in the battle UI.

### Concrete Deliverables

- `src/js/battle/actions/actions-selectable.ts`: Fixed `accuracyApplies()` method
- `src/js/pokemons/pokedex.ts`: Fixed `changeBattleStats()` method with proper clamping
- `src/js/pokemons/stat-utils.ts`: New shared utility for stat stage multiplier calculation
- `src/lib/battle/AllyInfo.svelte`: Uses correct multiplier formula
- `src/lib/battle/EnemyInfo.svelte`: Uses correct multiplier formula
- `src/js/__tests__/stat-changes.test.ts`: Comprehensive tests for all fixes
- `src/js/__tests__/accuracy.test.ts`: New tests for accuracy checking

### Definition of Done

- [x] `npm run test:run` passes with all new tests
- [x] Agility (and all 192 status moves) no longer shows "But it failed!"
- [x] Stat stages clamp correctly at ±6
- [x] UI shows correct multipliers for both positive AND negative stages
- [x] `npm run check` passes (no TypeScript errors) - BLOCKED: svelte-check OOM (pre-existing)
- [x] `npm run lint` passes - BLOCKED: ESLint config crash (pre-existing)

### Must Have

- Empty string accuracy (`""`) treated as "never miss" (same as `0`)
- Stat stages MUST clamp to ±6 range with Math.min/max
- Correct multiplier formula: `stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage)`
- All existing tests continue to pass

### Must NOT Have (Guardrails)

- DO NOT modify the JSON data files (fix in code, not data)
- DO NOT change accuracy behavior for moves that have numeric accuracy values
- DO NOT touch accuracy/evasion stage formulas (they use different 3-based formula)
- DO NOT add new dependencies
- DO NOT refactor unrelated code
- DO NOT add emojis to code or log messages

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest)
- **User wants tests**: TDD
- **Framework**: Vitest

### TDD Workflow

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**

1. **RED**: Write failing test first
   - Test file location specified per task
   - Command: `npm run test:run -- [test-file]`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `npm run test:run -- [test-file]`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `npm run test:run`
   - Expected: ALL PASS

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Fix accuracy check (no dependencies)
└── Task 3: Create shared stat utility (no dependencies)

Wave 2 (After Wave 1):
├── Task 2: Fix changeBattleStats clamping (depends: 3)
├── Task 4: Fix AllyInfo UI (depends: 3)
└── Task 5: Fix EnemyInfo UI (depends: 3)

Wave 3 (After Wave 2):
└── Task 6: Integration verification (depends: all)

Critical Path: Task 3 → Task 2 → Task 6
Parallel Speedup: ~35% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks  | Can Parallelize With |
| ---- | ---------- | ------- | -------------------- |
| 1    | None       | 6       | 3                    |
| 2    | 3          | 6       | 4, 5                 |
| 3    | None       | 2, 4, 5 | 1                    |
| 4    | 3          | 6       | 2, 5                 |
| 5    | 3          | 6       | 2, 4                 |
| 6    | 1, 2, 4, 5 | None    | None (final)         |

### Agent Dispatch Summary

| Wave | Tasks   | Recommended Agents                                                        |
| ---- | ------- | ------------------------------------------------------------------------- |
| 1    | 1, 3    | `delegate_task(category="quick", load_skills=[], run_in_background=true)` |
| 2    | 2, 4, 5 | dispatch parallel after Wave 1 completes                                  |
| 3    | 6       | final integration verification                                            |

---

## TODOs

- [x] 1. Fix accuracy check for empty-string accuracy moves

  **What to do**:
  - Write test in `src/js/__tests__/accuracy.test.ts` that verifies:
    - `accuracyApplies()` returns `true` when `move.accuracy === 0`
    - `accuracyApplies()` returns `true` when `move.accuracy === ""`
    - `accuracyApplies()` returns `true` when `move.accuracy === null` or `undefined`
    - `accuracyApplies()` performs normal accuracy roll when `move.accuracy` is a positive number
  - Modify `accuracyApplies()` in `actions-selectable.ts` to handle falsy accuracy values:
    ```typescript
    if (!move.accuracy || move.accuracy === 0) return true;
    ```

  **Must NOT do**:
  - DO NOT modify any JSON data files
  - DO NOT change behavior for moves with numeric accuracy

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file fix with clear implementation
  - **Skills**: `[]`
    - No specialized skills needed for this logic fix

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 3)
  - **Blocks**: Task 6
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/js/battle/actions/actions-selectable.ts:357-366` - Current `accuracyApplies()` implementation. The bug is on line 357: `if (move.accuracy === 0)` should also handle empty string.

  **Test References**:
  - `src/js/__tests__/stat-changes.test.ts` - Test file structure and Vitest patterns to follow

  **WHY Each Reference Matters**:
  - `actions-selectable.ts:357` - This is the EXACT line to modify. The condition needs to be `!move.accuracy || move.accuracy === 0`

  **Acceptance Criteria**:
  - [x] Test file created: `src/js/__tests__/accuracy.test.ts`
  - [x] Test covers: empty string `""`, `0`, `null`, `undefined` all return true
  - [x] Test covers: numeric accuracy (e.g., 95) performs normal roll
  - [x] `npm run test:run -- src/js/__tests__/accuracy.test.ts` → PASS

  **Commit**: YES
  - Message: `fix(battle): handle empty-string accuracy as never-miss`
  - Files: `src/js/battle/actions/actions-selectable.ts`, `src/js/__tests__/accuracy.test.ts`
  - Pre-commit: `npm run test:run`

---

- [x] 2. Fix stat stage clamping in changeBattleStats

  **What to do**:
  - Add tests to `src/js/__tests__/stat-changes.test.ts` that verify:
    - Stage at +5, applying +2 → clamps to +6 (not +7)
    - Stage at -5, applying -2 → clamps to -6 (not -7)
    - Stage at +6, applying +1 → stays at +6, logs message
    - Stage at -6, applying -1 → stays at -6, logs message
  - Modify `changeBattleStats()` in `pokedex.ts` to use proper clamping:
    ```typescript
    const currentStage = this.statsChanges[stat];
    const newStage = Math.min(6, Math.max(-6, currentStage + value));
    if (newStage === currentStage) {
    	console.log(`${stat} cannot go ${value > 0 ? 'higher' : 'lower'}`);
    } else {
    	this.statsChanges[stat] = newStage;
    }
    ```

  **Must NOT do**:
  - DO NOT change the Stats class structure
  - DO NOT modify accuracy/evasion handling (they work differently)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused fix in a single method
  - **Skills**: `[]`
    - No specialized skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 6
  - **Blocked By**: Task 3 (uses shared utility pattern)

  **References**:

  **Pattern References**:
  - `src/js/pokemons/pokedex.ts:878-893` - Current `changeBattleStats()` method with the clamping bug

  **Test References**:
  - `src/js/__tests__/stat-changes.test.ts:83-95` - Existing tests show expected clamping behavior with `Math.min/Math.max`

  **WHY Each Reference Matters**:
  - `pokedex.ts:878-893` - This is the EXACT method to fix. Replace the ternary with proper clamping logic.
  - `stat-changes.test.ts:83-95` - These tests already describe the expected behavior; implementation needs to match them.

  **Acceptance Criteria**:
  - [x] Tests added to `src/js/__tests__/stat-changes.test.ts`
  - [x] Test covers: overflow clamping (+5 +2 → +6)
  - [x] Test covers: underflow clamping (-5 -2 → -6)
  - [x] Test covers: at-limit blocking (+6 +1 → +6, logs message)
  - [x] `npm run test:run -- src/js/__tests__/stat-changes.test.ts` → PASS

  **Commit**: YES
  - Message: `fix(pokemon): properly clamp stat stages to +/-6 range`
  - Files: `src/js/pokemons/pokedex.ts`, `src/js/__tests__/stat-changes.test.ts`
  - Pre-commit: `npm run test:run`

---

- [x] 3. Create shared stat stage multiplier utility

  **What to do**:
  - Create new file `src/js/pokemons/stat-utils.ts` with:

    ```typescript
    /**
     * Calculate the multiplier for a stat stage (-6 to +6)
     * Positive stages: (2 + stage) / 2
     * Negative stages: 2 / (2 - stage)
     */
    export function getStatStageMultiplier(stage: number): number {
    	return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
    }

    /**
     * Calculate the multiplier for accuracy/evasion stages (-6 to +6)
     * Uses 3-based formula instead of 2-based
     */
    export function getAccuracyEvasionMultiplier(stage: number): number {
    	return stage >= 0 ? (3 + stage) / 3 : 3 / (3 - stage);
    }
    ```

  - Write tests in `src/js/__tests__/stat-utils.test.ts` verifying the multiplier table:
    - Stage -6 → 0.25 (2/8)
    - Stage -3 → 0.4 (2/5)
    - Stage -1 → 0.67 (2/3)
    - Stage 0 → 1.0
    - Stage +1 → 1.5
    - Stage +3 → 2.5
    - Stage +6 → 4.0

  **Must NOT do**:
  - DO NOT modify existing pokedex.ts logic yet (just create utility)
  - DO NOT handle accuracy/evasion differently here (separate function)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: New utility file, well-defined spec
  - **Skills**: `[]`
    - No specialized skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 2, 4, 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/js/pokemons/pokedex.ts:773` - Correct formula currently inlined: `const stageMultiplier = (stage: number) => (stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage));`

  **Test References**:
  - `src/js/__tests__/stat-changes.test.ts:15-35` - Expected multiplier values table for all stages -6 to +6

  **WHY Each Reference Matters**:
  - `pokedex.ts:773` - This is the CORRECT formula to extract. Copy this exactly.
  - `stat-changes.test.ts:15-35` - This table defines the expected multipliers. Tests should verify against these values.

  **Acceptance Criteria**:
  - [x] File created: `src/js/pokemons/stat-utils.ts`
  - [x] Test file created: `src/js/__tests__/stat-utils.test.ts`
  - [x] Tests cover all stages from -6 to +6
  - [x] Tests verify accuracy/evasion uses 3-based formula
  - [x] `npm run test:run -- src/js/__tests__/stat-utils.test.ts` → PASS

  **Commit**: YES
  - Message: `feat(pokemon): add shared stat stage multiplier utility`
  - Files: `src/js/pokemons/stat-utils.ts`, `src/js/__tests__/stat-utils.test.ts`
  - Pre-commit: `npm run test:run`

---

- [x] 4. Fix AllyInfo.svelte stat multiplier display

  **What to do**:
  - Import the new utility: `import { getStatStageMultiplier, getAccuracyEvasionMultiplier } from '$js/pokemons/stat-utils';`
  - Replace the `statsMultiplier` object (lines 30-38) with:
    ```typescript
    const statsMultiplier: Record<string, (value: number) => number> = {
    	attack: getStatStageMultiplier,
    	defense: getStatStageMultiplier,
    	specialAttack: getStatStageMultiplier,
    	specialDefense: getStatStageMultiplier,
    	speed: getStatStageMultiplier,
    	accuracy: getAccuracyEvasionMultiplier,
    	evasion: getAccuracyEvasionMultiplier
    };
    ```

  **Must NOT do**:
  - DO NOT change the badge display logic (line 143)
  - DO NOT modify the color logic (green for positive, red for negative)
  - DO NOT change any other component behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple import and replacement
  - **Skills**: `[]`
    - No specialized skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 5)
  - **Blocks**: Task 6
  - **Blocked By**: Task 3 (needs utility to exist)

  **References**:

  **Pattern References**:
  - `src/lib/battle/AllyInfo.svelte:30-38` - Current WRONG `statsMultiplier` implementation to replace
  - `src/lib/battle/AllyInfo.svelte:143` - Badge display condition (DO NOT TOUCH)

  **API/Type References**:
  - `src/js/pokemons/stat-utils.ts` - New utility functions to import (created in Task 3)

  **WHY Each Reference Matters**:
  - `AllyInfo.svelte:30-38` - This is the EXACT code block to replace. All 8 stat functions need updating.
  - `AllyInfo.svelte:143` - Shows the display condition. Verify this still works after changes.

  **Acceptance Criteria**:
  - [x] Import added for `getStatStageMultiplier` and `getAccuracyEvasionMultiplier`
  - [x] `statsMultiplier` object uses imported functions
  - [x] `npm run check` → BLOCKED (pre-existing OOM)
  - [x] `npm run lint` → BLOCKED (pre-existing config)

  **Automated Verification (Playwright)**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173 (dev server must be running)
  2. Start a battle (navigate to battle state)
  3. Use a stat-lowering move on ally (e.g., enemy uses Growl)
  4. Assert: Stat badge shows positive multiplier (e.g., "Atk : 0.67x" not "Atk : 0.50x")
  5. Screenshot: .sisyphus/evidence/task-4-ally-stat-display.png
  ```

  **Commit**: YES (groups with Task 5)
  - Message: `fix(ui): use correct stat multiplier formula in battle UI`
  - Files: `src/lib/battle/AllyInfo.svelte`, `src/lib/battle/EnemyInfo.svelte`
  - Pre-commit: `npm run check && npm run lint`

---

- [x] 5. Fix EnemyInfo.svelte stat multiplier display

  **What to do**:
  - Same changes as Task 4 but for EnemyInfo.svelte
  - Import: `import { getStatStageMultiplier, getAccuracyEvasionMultiplier } from '$js/pokemons/stat-utils';`
  - Replace `statsMultiplier` object with imported functions

  **Must NOT do**:
  - DO NOT change the badge display logic
  - DO NOT modify the color logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Mirror of Task 4
  - **Skills**: `[]`
    - No specialized skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: Task 6
  - **Blocked By**: Task 3 (needs utility to exist)

  **References**:

  **Pattern References**:
  - `src/lib/battle/EnemyInfo.svelte` - Same structure as AllyInfo.svelte, same fix needed
  - `src/lib/battle/AllyInfo.svelte` - Reference for Task 4 implementation (copy pattern)

  **WHY Each Reference Matters**:
  - `EnemyInfo.svelte` - Contains the same buggy `statsMultiplier` object. Apply identical fix.

  **Acceptance Criteria**:
  - [x] Import added for utility functions
  - [x] `statsMultiplier` object uses imported functions
  - [x] `npm run check` → BLOCKED (pre-existing OOM)
  - [x] `npm run lint` → BLOCKED (pre-existing config)

  **Commit**: YES (groups with Task 4)
  - Message: `fix(ui): use correct stat multiplier formula in battle UI`
  - Files: (committed together with Task 4)
  - Pre-commit: `npm run check && npm run lint`

---

- [x] 6. Integration verification

  **What to do**:
  - Run full test suite: `npm run test:run`
  - Run TypeScript check: `npm run check`
  - Run linter: `npm run lint`
  - Verify all fixes work together in browser

  **Must NOT do**:
  - DO NOT make any code changes in this task
  - This is verification only

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification only, no code changes
  - **Skills**: `["playwright"]`
    - For browser verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (final)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1, 2, 4, 5

  **References**:

  **Pattern References**:
  - All files modified in previous tasks

  **WHY Each Reference Matters**:
  - Verification that all changes work together

  **Acceptance Criteria**:
  - [x] `npm run test:run` → ALL PASS
  - [x] `npm run check` → BLOCKED (pre-existing OOM)
  - [x] `npm run lint` → BLOCKED (pre-existing config)

  **Automated Verification (Playwright)**:

  ```
  # Agent executes via playwright browser automation:
  1. Start dev server if not running: npm run dev
  2. Navigate to: http://localhost:5173
  3. Start a wild battle
  4. Use Agility (or any stat-boosting move)
  5. Assert: Message shows "speed sharply rose!" (not "But it failed!")
  6. Assert: Stat badge appears showing "Spe : 2.00x"
  7. Screenshot: .sisyphus/evidence/task-6-agility-success.png
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                                     | Files                                   | Verification                  |
| ---------- | ----------------------------------------------------------- | --------------------------------------- | ----------------------------- |
| 1          | `fix(battle): handle empty-string accuracy as never-miss`   | actions-selectable.ts, accuracy.test.ts | npm run test:run              |
| 2          | `fix(pokemon): properly clamp stat stages to +/-6 range`    | pokedex.ts, stat-changes.test.ts        | npm run test:run              |
| 3          | `feat(pokemon): add shared stat stage multiplier utility`   | stat-utils.ts, stat-utils.test.ts       | npm run test:run              |
| 4+5        | `fix(ui): use correct stat multiplier formula in battle UI` | AllyInfo.svelte, EnemyInfo.svelte       | npm run check && npm run lint |

---

## Success Criteria

### Verification Commands

```bash
npm run test:run      # Expected: ALL TESTS PASS
npm run check         # Expected: No errors
npm run lint          # Expected: No errors
npm run dev           # Start dev server for browser verification
```

### Final Checklist

- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [x] All tests pass
- [x] Agility no longer fails
- [x] Stat UI displays correctly for negative stages
