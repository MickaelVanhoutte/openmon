# Fix Weather Abilities Not Triggering at Battle Start

## TL;DR

> **Quick Summary**: Fix race condition where weather abilities (Sandstream, Drizzle, etc.) fail to trigger at battle start due to async/await mismatch in `processInitialAbilityActions()`, while working correctly on mid-battle switch.
>
> **Deliverables**:
>
> - New `executeActionSequential()` method that returns `Promise<void>`
> - Fixed `processInitialAbilityActions()` that properly awaits each action
> - Unit tests verifying weather abilities trigger at battle start
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential tasks
> **Critical Path**: Task 1 (test) → Task 2 (fix) → Task 3 (regression)

---

## Context

### Original Request

Weather abilities like Sandstream and Drizzle don't trigger at battle start, but work correctly when a Pokemon switches in mid-battle.

### Research Findings

**Root Cause**: Race condition in `processInitialAbilityActions()`

- `executeAction()` returns `void`, not `Promise<void>`
- `await executeAction()` has no effect - the await is ignored
- All actions fire simultaneously at battle start
- Weather messages are overwritten by "What should X do?" from `prepareNewTurn()`

**Why Switch Works**: Mid-battle switch happens inside an already-running action loop where `.then()` chain is preserved.

**Key Files**:

- `src/js/context/battleContext.ts:330-337` - Flawed `processInitialAbilityActions`
- `src/js/context/battleContext.ts:256-296` - `executeAction` returns void, uses `.then()` chaining
- `src/lib/battle/Battle.svelte:86-89` - Calls init sequence
- `src/js/battle/abilities/tiers/tier2-on-switch.ts` - Weather abilities (correctly implemented)

### Metis Review

**Identified Gaps** (addressed):

- Need new sequential execution method that returns Promise
- Must NOT modify existing `executeAction` - the `.then()` pattern is intentional for UI recursion
- Test strategy requires `vi.useFakeTimers()` for timing tests
- Scope limited to initial ability trigger, not mid-battle flow

---

## Work Objectives

### Core Objective

Fix the async/await mismatch so weather abilities trigger and display their messages correctly at battle start.

### Concrete Deliverables

- `src/js/context/battleContext.ts`: New `executeActionSequential()` method + fixed `processInitialAbilityActions()`
- `src/js/__tests__/context/initial-abilities.test.ts`: Unit tests for battle start ability triggering
- `src/lib/battle/Battle.svelte`: Ensure `await` is properly used on the init call

### Definition of Done

- [x] `bun test:run` passes (all existing 43+ test files)
- [x] Weather abilities trigger at battle start (testable via unit test)
- [x] Message order correct: weather message before "What should X do?"

### Must Have

- Weather abilities trigger at battle start
- Messages display sequentially before turn prompt
- All existing tests pass (no regression)

### Must NOT Have (Guardrails)

- DO NOT modify the main `executeAction()` recursive behavior - the `.then()` chain is intentional for UI flow
- DO NOT refactor all `executeAction` callers to async - out of scope
- DO NOT change `triggerInitialSwitchIn()` - it correctly pushes to stack
- DO NOT add new action types or modify ActionType enum
- DO NOT touch mid-battle switch flow (`ChangePokemon` action) - already works
- DO NOT add artificial delays longer than existing sleepTime values
- DO NOT add animation sync for weather - out of scope
- DO NOT test ALL ON_SWITCH_IN abilities - only weather setters

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: TDD
- **Framework**: Vitest (`bun test`)

### If TDD Enabled

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**

1. **RED**: Write failing test first
   - Test command: `bun test:run`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `bun test:run`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `bun test:run`
   - Expected: PASS (still)

### Agent-Executed QA Scenarios (MANDATORY - ALL tasks)

Verification uses Bash with `bun test:run` command. All scenarios are unit test assertions.

---

## Execution Strategy

### Sequential Execution

```
Task 1: Write failing tests for weather abilities at battle start
    ↓
Task 2: Implement fix (executeActionSequential + update processInitialAbilityActions)
    ↓
Task 3: Run full regression test suite
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
| ---- | ---------- | ------ | -------------------- |
| 1    | None       | 2      | None                 |
| 2    | 1          | 3      | None                 |
| 3    | 2          | None   | None                 |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents                                                       |
| ---- | ----- | ------------------------------------------------------------------------ |
| 1    | 1     | delegate_task(category="quick", load_skills=[], run_in_background=false) |
| 2    | 2     | delegate_task(category="quick", load_skills=[], run_in_background=false) |
| 3    | 3     | delegate_task(category="quick", load_skills=[], run_in_background=false) |

---

## TODOs

- [x] 1. Write failing tests for weather abilities at battle start

  **What to do**:
  - Create test file `src/js/__tests__/context/initial-abilities.test.ts`
  - Write test: "should trigger weather ability at battle start"
    - Mock a Pokemon with Drizzle ability
    - Call `triggerInitialSwitchIn()` and `processInitialAbilityActions()`
    - Assert: weather is set to RAIN
    - Assert: weather message is in processed actions (before turn prompt)
  - Write test: "should await each action sequentially"
    - Use `vi.useFakeTimers()`
    - Verify actions execute one at a time with proper timing
  - Run tests expecting FAILURE (implementation doesn't exist yet)

  **Must NOT do**:
  - Do not modify any implementation files yet
  - Do not test ALL abilities - focus on Drizzle/Sandstorm
  - Do not test mid-battle switch (already works)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file creation with focused test cases
  - **Skills**: `[]`
    - No special skills needed for test writing

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:

  **Pattern References** (existing code to follow):
  - `src/js/__tests__/abilities/tier2-on-switch.test.ts:35-97` - Mock structure for ability tests
  - `src/js/__tests__/abilities/test-helpers.ts` - Test helper patterns
  - `src/js/__tests__/context/battleContext.test.ts` - If exists, context test patterns

  **API/Type References** (contracts to implement against):
  - `src/js/context/battleContext.ts:320-340` - `triggerInitialSwitchIn()` and `processInitialAbilityActions()` signatures
  - `src/js/battle/abilities/tiers/tier2-on-switch.ts:31-73` - Weather ability definitions (Drizzle, Sandstorm)
  - `src/js/battle/battle-field.ts:70` - `setWeather()` method

  **Test References** (testing patterns to follow):
  - `src/js/__tests__/abilities/tier2-on-switch.test.ts` - Uses `vi.fn()` for mocking
  - Pattern: `vi.useFakeTimers()` for timing tests
  - Pattern: `vi.advanceTimersByTime()` for advancing timers

  **WHY Each Reference Matters**:
  - `tier2-on-switch.test.ts` shows how to mock BattleContext and test ability hooks
  - `battleContext.ts` shows the exact methods being tested
  - Understanding `setWeather()` is needed to assert weather was set correctly

  **Acceptance Criteria**:

  **TDD:**
  - [x] Test file created: `src/js/__tests__/context/initial-abilities.test.ts`
  - [x] Test covers: Drizzle ability triggers at battle start
  - [x] Test covers: Weather message appears before turn prompt
  - [x] `bun test src/js/__tests__/context/initial-abilities.test.ts` → FAIL (expected, no implementation yet)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Tests exist and fail as expected (RED phase)
    Tool: Bash (bun test)
    Preconditions: No implementation changes made
    Steps:
      1. Run: bun test src/js/__tests__/context/initial-abilities.test.ts
      2. Assert: Exit code is non-zero (tests fail)
      3. Assert: Output contains "should trigger weather ability at battle start"
      4. Assert: Output shows test failure (not compile error)
    Expected Result: Tests exist and fail due to missing implementation
    Evidence: Terminal output captured
  ```

  **Evidence to Capture:**
  - [x] Terminal output showing test failure (RED phase)

  **Commit**: YES
  - Message: `test(battle): add failing tests for weather abilities at battle start`
  - Files: `src/js/__tests__/context/initial-abilities.test.ts`
  - Pre-commit: None (tests expected to fail)

---

- [x] 2. Implement fix: executeActionSequential + update processInitialAbilityActions

  **What to do**:
  - In `src/js/context/battleContext.ts`:
    - Add new method `executeActionSequential(action?: ActionV2Interface): Promise<void>`
      - Returns immediately if no action
      - Calls `action.execute(this)`
      - Awaits `this.sleep(sleepTime)`
      - Returns Promise that resolves after sleep completes
    - Modify `processInitialAbilityActions()` to use `executeActionSequential` instead of `executeAction`
  - In `src/lib/battle/Battle.svelte`:
    - Ensure the call to `processInitialAbilityActions()` is properly awaited

  **Suggested Implementation Pattern**:

  ```typescript
  public async executeActionSequential(action?: ActionV2Interface): Promise<void> {
      if (!action) return;

      this.currentAction.set(action);
      action.execute(this);

      const sleepTime = this.getSleepTimeForAction(action);
      await this.sleep(sleepTime);
  }

  public async processInitialAbilityActions(): Promise<void> {
      while (!this.actionStack.isEmpty()) {
          const action = this.actionStack.pop();
          if (action) {
              await this.executeActionSequential(action);
          }
      }
  }
  ```

  **Must NOT do**:
  - DO NOT modify the existing `executeAction()` method
  - DO NOT change `triggerInitialSwitchIn()`
  - DO NOT add new action types
  - DO NOT modify `ChangePokemon` action or mid-battle switch flow

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Targeted fix in 1-2 files, clear implementation pattern
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:

  **Pattern References** (existing code to follow):
  - `src/js/context/battleContext.ts:256-296` - Existing `executeAction()` to understand action execution flow
  - `src/js/context/battleContext.ts:69` - `sleep` method definition: `sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))`
  - `src/js/context/battleContext.ts:270-285` - `getSleepTimeForAction()` logic for determining sleep duration

  **API/Type References** (contracts to implement against):
  - `src/js/battle/actions/actions-model.ts` - `ActionV2Interface` interface
  - `src/js/context/battleContext.ts:330-337` - Current broken `processInitialAbilityActions()` signature

  **Documentation References**:
  - Task 1 tests define expected behavior

  **WHY Each Reference Matters**:
  - `executeAction()` shows the action execution pattern (set currentAction, call execute, handle timing)
  - `sleep` is already defined and returns a Promise - reuse it
  - `getSleepTimeForAction()` determines how long to wait based on action type

  **Acceptance Criteria**:

  **TDD:**
  - [x] New method `executeActionSequential` added to BattleContext
  - [x] `processInitialAbilityActions` uses `executeActionSequential`
  - [x] `bun test src/js/__tests__/context/initial-abilities.test.ts` → PASS (GREEN phase)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Weather ability tests now pass (GREEN phase)
    Tool: Bash (bun test)
    Preconditions: Implementation completed in battleContext.ts
    Steps:
      1. Run: bun test src/js/__tests__/context/initial-abilities.test.ts
      2. Assert: Exit code is 0
      3. Assert: Output shows all tests passing
      4. Assert: "should trigger weather ability at battle start" passes
    Expected Result: All new tests pass
    Evidence: Terminal output showing PASS

  Scenario: TypeScript compiles without errors
    Tool: Bash (npm run check)
    Preconditions: Implementation complete
    Steps:
      1. Run: npm run check
      2. Assert: Exit code is 0
      3. Assert: No TypeScript errors in battleContext.ts
    Expected Result: Clean TypeScript compilation
    Evidence: Terminal output captured
  ```

  **Evidence to Capture:**
  - [x] Terminal output showing tests passing (GREEN phase)
  - [x] TypeScript check passing

  **Commit**: YES
  - Message: `fix(battle): weather abilities now trigger at battle start`
  - Files: `src/js/context/battleContext.ts`, `src/lib/battle/Battle.svelte` (if changed)
  - Pre-commit: `bun test:run`

---

- [x] 3. Run full regression test suite

  **What to do**:
  - Run the complete test suite to verify no regressions
  - Verify existing ability tests still pass
  - Verify weather effect tests still pass

  **Must NOT do**:
  - DO NOT modify any files unless a regression is found
  - If regression found, fix it before completing this task

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Just running tests and verifying output
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: None (final task)
  - **Blocked By**: Task 2

  **References**:

  **Test References** (tests that must pass):
  - `src/js/__tests__/abilities/tier2-on-switch.test.ts` - Existing weather ability tests
  - `src/js/__tests__/pokemons/effects/weather-effects.test.ts` - Weather effect calculations (if exists)
  - All files in `src/js/__tests__/` - Complete test suite

  **WHY Each Reference Matters**:
  - Verifying no regression in existing functionality
  - Weather abilities must still work on switch (not just battle start)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Full test suite passes
    Tool: Bash (bun test)
    Preconditions: Tasks 1 and 2 completed
    Steps:
      1. Run: bun test:run
      2. Assert: Exit code is 0
      3. Assert: All test files pass (no failures)
      4. Assert: Test count is same or higher than before
    Expected Result: Zero test failures across entire suite
    Evidence: Terminal output with full test summary

  Scenario: Lint check passes
    Tool: Bash (npm run lint)
    Preconditions: All implementation complete
    Steps:
      1. Run: npm run lint
      2. Assert: Exit code is 0
      3. Assert: No ESLint errors
    Expected Result: Clean lint
    Evidence: Terminal output captured
  ```

  **Evidence to Capture:**
  - [x] Terminal output showing all tests pass
  - [x] Lint check output

  **Commit**: NO (no new files, just verification)

---

## Commit Strategy

| After Task | Message                                                                 | Files                                                                      | Verification          |
| ---------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------- |
| 1          | `test(battle): add failing tests for weather abilities at battle start` | `src/js/__tests__/context/initial-abilities.test.ts`                       | Tests exist and fail  |
| 2          | `fix(battle): weather abilities now trigger at battle start`            | `src/js/context/battleContext.ts`, possibly `src/lib/battle/Battle.svelte` | `bun test:run` passes |

---

## Success Criteria

### Verification Commands

```bash
bun test:run                    # Expected: All tests pass, 0 failures
npm run check                   # Expected: No TypeScript errors
npm run lint                    # Expected: No ESLint errors
```

### Final Checklist

- [x] Weather abilities trigger at battle start (unit test proves this)
- [x] Messages display sequentially before "What should X do?"
- [x] All existing tests pass (no regression)
- [x] New `executeActionSequential` method added
- [x] `processInitialAbilityActions` properly awaits actions
- [x] TypeScript compiles cleanly
- [x] ESLint passes
