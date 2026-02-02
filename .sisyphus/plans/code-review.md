# OpenMon Code Review & Improvement

## TL;DR

> **Quick Summary**: Comprehensive code quality fix tackling 1786 ESLint errors, svelte-check hang, test failures, and Svelte 5 migration completion. Four-phase approach following Oracle's risk-minimized order.
>
> **Deliverables**:
>
> - ESLint errors reduced from 1786 to <100
> - svelte-check completes within 60 seconds
> - All 503 tests pass (0 errors)
> - App.svelte fully migrated to Svelte 5 runes
>
> **Estimated Effort**: Medium (1-2 days)
> **Parallel Execution**: NO - sequential dependency chain
> **Critical Path**: ESLint fix → App.svelte migration → Test fix → svelte-check verification

---

## Context

### Original Request

User requested a comprehensive code review covering: patterns, code quality, tests, style, dead code, errors, svelte-check crash fix, and optimizations.

### Interview Summary

**Key Discussions**:

- Priority order: Follow Oracle's recommendation (ESLint → App.svelte → Tests → svelte-check)
- ESLint: Single commit with --fix, then manual remainder
- Additional issues: Include $bindable errors, @types/node
- Verification: Automated checks only (no manual browser testing)

**Research Findings**:

- 1786 ESLint errors (95% automatable with --fix)
- svelte-check hangs due to infinite reactive loop in App.svelte (lines 66, 76)
- Only 2 legacy `$:` statements remain (both in App.svelte)
- ExperienceCalculator uses fetch() with relative path → fails in Node/Vitest
- 5 non-bindable prop errors in App.svelte

### Metis Review

**Identified Gaps** (addressed):

- Subscription cleanup strategy → Use $effect() with cleanup return
- $bindable vs two-way binding → Check if actually needed, fix in child components
- ExperienceCalculator ready flag → Keep for backward compatibility
- Missing svelte-check timeout criterion → Added 60-second timeout verification

---

## Work Objectives

### Core Objective

Restore code quality tooling (ESLint passing, svelte-check working, tests green) and complete Svelte 5 migration.

### Concrete Deliverables

- ESLint: <100 errors (down from 1786)
- svelte-check: Completes in <60 seconds
- Tests: 0 errors, 503+ tests pass
- App.svelte: Zero `$:` statements, proper Howl import, $bindable fixes

### Definition of Done

- [ ] `npm run lint` exits with <100 errors
- [ ] `timeout 60 npm run check` exits with code 0
- [ ] `npm run test:run` shows 0 errors
- [ ] `npm run build` succeeds

### Must Have

- ESLint auto-fix applied
- App.svelte migrated to Svelte 5 runes
- ExperienceCalculator uses static JSON import
- Howl properly imported in App.svelte
- @types/node installed for vitest.config.ts

### Must NOT Have (Guardrails)

- **MUST NOT** touch any `.svelte` files except `App.svelte` and child components with `$bindable` issues
- **MUST NOT** change `ExperienceCalculator`'s public API (method signatures stay identical)
- **MUST NOT** remove `ready` flag from ExperienceCalculator (keep for backward compat)
- **MUST NOT** commit ESLint auto-fix with manual fixes (separate commits)
- **MUST NOT** add new dependencies (except @types/node as devDep)
- **MUST NOT** fix the 15 `:any` types (OUT OF SCOPE - low risk, touch opportunistically)
- **MUST NOT** fix SCSS deprecation warnings (OUT OF SCOPE)
- **MUST NOT** migrate any `$:` statements in other files (only App.svelte)

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest configured)
- **User wants tests**: Automated verification only
- **Framework**: Vitest

### Automated Verification Only (NO User Intervention)

> **CRITICAL PRINCIPLE: ZERO USER INTERVENTION**
>
> ALL verification is automated. Agent runs commands, validates outputs.

**Verification Commands (run after each task):**

```bash
# ESLint error count
npm run lint 2>&1 | grep -c "error"

# Test status
npm run test:run 2>&1 | tail -10

# svelte-check with timeout
timeout 60 npm run check || echo "svelte-check timeout"
```

---

## Execution Strategy

### Sequential Execution (Dependencies Exist)

```
Task 1: ESLint Auto-Fix
    ↓ (must verify tests still pass)
Task 2: Manual ESLint Fixes (remaining errors)
    ↓ (must complete before touching App.svelte)
Task 3: ExperienceCalculator Test Fix
    ↓ (isolated, can validate independently)
Task 4: App.svelte Svelte 5 Migration
    ↓ (highest risk, needs clean baseline)
Task 5: Child Components $bindable Fixes
    ↓ (depends on App.svelte changes)
Task 6: svelte-check Verification & Final Validation
```

### Dependency Matrix

| Task | Depends On | Blocks | Why Sequential                                 |
| ---- | ---------- | ------ | ---------------------------------------------- |
| 1    | None       | 2, 3   | Must verify no regressions before more changes |
| 2    | 1          | 4      | Need clean lint baseline                       |
| 3    | 1          | 6      | Test infrastructure must work first            |
| 4    | 2          | 5, 6   | App.svelte is high-risk, needs stable baseline |
| 5    | 4          | 6      | Child components depend on App.svelte pattern  |
| 6    | 3, 4, 5    | None   | Final validation of all changes                |

---

## TODOs

- [x] 1. ESLint Auto-Fix (Bulk)

  **What to do**:
  - Run `npm run lint:fix` to auto-fix curly, prefer-const, and formatting errors
  - Capture before/after error counts
  - Verify tests still pass after auto-fix
  - Commit changes with clear message

  **Must NOT do**:
  - Do NOT manually edit any files during this task
  - Do NOT combine with manual fixes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single command execution with verification
  - **Skills**: [`git-master`]
    - `git-master`: Needed for atomic commit of auto-fix changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 1)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None (start immediately)

  **References**:
  - `eslint.config.js` - ESLint rules configured (curly: error, prefer-const: error)
  - `package.json:scripts.lint:fix` - The command to run

  **Acceptance Criteria**:

  ```bash
  # Before (baseline)
  npm run lint 2>&1 | grep -c "error"
  # Assert: ~1786

  # Run fix
  npm run lint:fix

  # After
  npm run lint 2>&1 | grep -c "error"
  # Assert: <300 (significant reduction)

  # Regression test
  npm run test:run 2>&1 | grep -E "passed|failed"
  # Assert: Same pass count, no new failures
  ```

  **Commit**: YES
  - Message: `chore(lint): apply ESLint auto-fix for curly and prefer-const rules`
  - Files: `All auto-fixed files`
  - Pre-commit: `npm run test:run`

---

- [x] 2. Manual ESLint Fixes (Remaining Errors)

  **What to do**:
  - Add missing Howl import to App.svelte: `import { Howl } from 'howler';`
  - Install @types/node: `npm install -D @types/node`
  - Fix unused imports/variables (remove or prefix with `_`)
  - Address remaining lint errors (console.log → console.warn/error if needed)

  **Must NOT do**:
  - Do NOT fix `:any` types (out of scope)
  - Do NOT touch files outside those with lint errors

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, isolated fixes across a few files
  - **Skills**: [`git-master`]
    - `git-master`: Needed for commit

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 2)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:
  - `src/App.svelte:48` - Howl usage without import
  - `src/lib/Intro.svelte:3` - Pattern for Howl import: `import { Howl } from 'howler';`
  - `vitest.config.ts:5` - Uses `process` without @types/node
  - `src/js/__tests__/game-context.test.ts:2` - Unused Position import

  **Acceptance Criteria**:

  ```bash
  # Verify Howl import added
  grep "import.*Howl.*from 'howler'" src/App.svelte
  # Assert: Returns line

  # Verify @types/node installed
  grep "@types/node" package.json
  # Assert: Present in devDependencies

  # ESLint error count
  npm run lint 2>&1 | grep -c "error"
  # Assert: <100
  ```

  **Commit**: YES
  - Message: `fix(lint): add missing imports and install @types/node`
  - Files: `src/App.svelte`, `package.json`, `package-lock.json`, affected test files
  - Pre-commit: `npm run lint`

---

- [x] 3. ExperienceCalculator Test Fix

  **What to do**:
  - Change ExperienceCalculator from fetch() to static JSON import
  - Use pattern: `import xpChartData from '../../assets/data/final/beta/xp-chart.json';`
  - Keep `ready` flag for backward compatibility (set to `true` immediately)
  - Verify all tests pass

  **Must NOT do**:
  - Do NOT change public API (getExperienceForLevel, etc.)
  - Do NOT remove the `ready` flag

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Single file refactor with test verification
  - **Skills**: [`git-master`]
    - `git-master`: Needed for commit

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1 for clean test baseline)
  - **Parallel Group**: Sequential (Wave 2)
  - **Blocks**: Task 6
  - **Blocked By**: Task 1

  **References**:
  - `src/js/pokemons/experience.ts:15` - Current fetch() implementation
  - `src/js/pokemons/experience.ts:70` - EXPERIENCE_CHART singleton export
  - `src/assets/data/final/beta/xp-chart.json` - Data file to import
  - `src/js/__tests__/boxes.test.ts` - Test file that was failing

  **WHY Each Reference Matters**:
  - `experience.ts:15`: The fetch() call that fails in Node - this is what to replace
  - `experience.ts:70`: Singleton pattern to preserve
  - `xp-chart.json`: The data to import statically instead of fetching
  - `boxes.test.ts`: Primary failing test to verify fix works

  **Acceptance Criteria**:

  ```bash
  # Verify no fetch() in experience.ts
  grep -c "fetch(" src/js/pokemons/experience.ts
  # Assert: 0

  # Verify static import exists
  grep "import.*xp.*json" src/js/pokemons/experience.ts
  # Assert: Returns line

  # All tests pass
  npm run test:run 2>&1 | grep "Errors"
  # Assert: Contains "0 errors" or no Errors line

  npm run test:run 2>&1 | grep -E "passed"
  # Assert: 503 or more passed
  ```

  **Commit**: YES
  - Message: `fix(tests): convert ExperienceCalculator to static JSON import`
  - Files: `src/js/pokemons/experience.ts`
  - Pre-commit: `npm run test:run`

---

- [x] 4. App.svelte Svelte 5 Migration

  **What to do**:
  - Convert `$:` reactive statements (lines 43, 56) to `$effect()` with proper cleanup
  - Pattern for subscription:
    ```typescript
    $effect(() => {
    	if (!gameContext) return;
    	const unsub = gameContext.battleContext.subscribe((value) => {
    		battleCtx = value;
    	});
    	return () => unsub();
    });
    ```
  - Ensure all state variables use `$state()` rune
  - Verify no infinite-reactive-loop warnings after migration

  **Must NOT do**:
  - Do NOT touch other .svelte files in this task
  - Do NOT change the DEBUG skip behavior (line 22)
  - Do NOT remove or significantly restructure component logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex Svelte 5 migration with reactive patterns, needs careful attention
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Svelte 5 runes expertise needed

  **Parallelization**:
  - **Can Run In Parallel**: NO (highest risk task, needs stable baseline)
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: Task 2

  **References**:
  - `src/App.svelte:43-56` - Legacy `$:` reactive statements to migrate
  - `src/App.svelte:66,76` - ESLint infinite-reactive-loop warnings
  - `src/lib/world/World.svelte:48-50` - Pattern for subscription with cleanup
  - `src/lib/battle/Battle.svelte` - Child component receiving context props

  **WHY Each Reference Matters**:
  - `App.svelte:43-56`: The exact lines to convert to $effect()
  - `App.svelte:66,76`: ESLint warning locations - must be eliminated
  - `World.svelte:48-50`: Reference pattern for proper subscription cleanup in existing codebase
  - `Battle.svelte`: Understand how context is consumed to ensure changes are compatible

  **Acceptance Criteria**:

  ```bash
  # Verify no legacy $: statements
  grep -c '\$:' src/App.svelte
  # Assert: 0

  # Verify no infinite loop warnings
  npm run lint 2>&1 | grep -c "infinite-reactive-loop"
  # Assert: 0

  # Verify $effect usage
  grep -c '\$effect' src/App.svelte
  # Assert: >= 2 (replaced the $: statements)

  # App still builds
  npm run build 2>&1 | tail -5
  # Assert: Build succeeds
  ```

  **Commit**: YES
  - Message: `refactor(svelte5): migrate App.svelte from $: to $effect() with proper cleanup`
  - Files: `src/App.svelte`
  - Pre-commit: `npm run lint && npm run build`

---

- [x] 5. Child Components $bindable Fixes

  **What to do**:
  - Check which props in Battle.svelte, World.svelte need `$bindable()`
  - If two-way binding is NOT needed: Remove `bind:` from App.svelte, use one-way props
  - If two-way binding IS needed: Add `$bindable()` to child component props
  - Fix all 5 non-bindable prop errors from LSP

  **Must NOT do**:
  - Do NOT change component logic beyond prop declarations
  - Do NOT touch components that aren't referenced in the LSP errors

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small targeted fixes based on LSP errors
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Svelte 5 $bindable pattern knowledge

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on App.svelte migration)
  - **Parallel Group**: Sequential (Wave 4)
  - **Blocks**: Task 6
  - **Blocked By**: Task 4

  **References**:
  - `src/App.svelte:143-150` - Lines with bind: to non-bindable props
  - `src/lib/battle/Battle.svelte` - Check Props interface for context, battleCtx
  - `src/lib/world/World.svelte` - Check Props interface for context, overWorldCtx
  - Svelte 5 docs: `$bindable()` usage in $props destructuring

  **WHY Each Reference Matters**:
  - `App.svelte:143-150`: LSP error locations - exactly what needs fixing
  - `Battle.svelte`: Determine if context really needs two-way binding (likely NO)
  - `World.svelte`: Same analysis - check if overWorldCtx writes back to parent

  **Acceptance Criteria**:

  ```bash
  # No LSP errors about non-bindable props
  # (Run svelte-check and verify no $bindable errors)
  npm run check 2>&1 | grep -c "non-bindable"
  # Assert: 0

  # Or verify bind: removed if one-way is sufficient
  grep -c "bind:context" src/App.svelte
  # Assert: 0 (if converted to one-way)
  ```

  **Commit**: YES
  - Message: `fix(svelte5): resolve $bindable prop warnings in Battle and World components`
  - Files: `src/App.svelte`, `src/lib/battle/Battle.svelte`, `src/lib/world/World.svelte`
  - Pre-commit: `npm run check`

---

- [x] 6. Final Validation & svelte-check Recovery

  **What to do**:
  - Run full svelte-check with 60-second timeout
  - Run full ESLint check
  - Run all tests
  - Run production build
  - Document any remaining issues for future work

  **Must NOT do**:
  - Do NOT make any code changes in this task (validation only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Just running validation commands
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO (final validation)
  - **Parallel Group**: Sequential (Wave 5 - Final)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4, 5

  **References**:
  - `package.json:scripts.check` - svelte-check command
  - `package.json:scripts.lint` - ESLint command
  - `package.json:scripts.test:run` - Vitest command
  - `package.json:scripts.build` - Production build

  **Acceptance Criteria**:

  ```bash
  # svelte-check completes within timeout
  timeout 60 npm run check
  # Assert: Exit code 0

  # ESLint under threshold
  npm run lint 2>&1 | grep -c "error"
  # Assert: <100

  # All tests pass
  npm run test:run 2>&1 | grep -E "passed"
  # Assert: 503+ passed, 0 errors

  # Production build succeeds
  npm run build
  # Assert: Exit code 0
  ```

  **Commit**: NO (validation only - no changes)

---

## Commit Strategy

| After Task | Message                                                                          | Files                                   | Verification                    |
| ---------- | -------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------- |
| 1          | `chore(lint): apply ESLint auto-fix for curly and prefer-const rules`            | All auto-fixed                          | `npm run test:run`              |
| 2          | `fix(lint): add missing imports and install @types/node`                         | App.svelte, package.json, tests         | `npm run lint`                  |
| 3          | `fix(tests): convert ExperienceCalculator to static JSON import`                 | experience.ts                           | `npm run test:run`              |
| 4          | `refactor(svelte5): migrate App.svelte from $: to $effect() with proper cleanup` | App.svelte                              | `npm run lint && npm run build` |
| 5          | `fix(svelte5): resolve $bindable prop warnings in Battle and World components`   | App.svelte, Battle.svelte, World.svelte | `npm run check`                 |

---

## Success Criteria

### Verification Commands

```bash
# ESLint: <100 errors (was 1786)
npm run lint 2>&1 | grep -c "error"

# svelte-check: completes in <60s
timeout 60 npm run check && echo "SUCCESS" || echo "FAILED"

# Tests: 0 errors, 503+ pass
npm run test:run 2>&1 | tail -10

# Build: succeeds
npm run build && echo "BUILD SUCCESS"
```

### Final Checklist

- [ ] ESLint errors reduced from 1786 to <100
- [ ] svelte-check completes within 60 seconds
- [ ] All 503 tests pass with 0 errors
- [ ] No legacy `$:` statements in App.svelte
- [ ] Howl properly imported
- [ ] No infinite-reactive-loop warnings
- [ ] Production build succeeds
- [ ] All "Must NOT Have" guardrails preserved
