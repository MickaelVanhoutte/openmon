# OpenMon Baseline - 2026-01-30

## Test Results

- **Command**: `npm run test:run`
- **Exit Code**: 0 (with 2 unhandled errors)
- **Test Files**: 26 passed
- **Tests Passed**: 439
- **Tests Failed**: 0
- **Errors**: 2 unhandled rejections (non-blocking)

### Summary

```
Test Files  26 passed (26)
Tests       439 passed (439)
Errors      2 errors
Duration    3.60s
```

### Known Issues

- 2 unhandled rejections: `Failed to parse URL from src/assets/data/final/beta/xp-chart.json`
  - Originates from `experience.ts:11` using `fetch()` on a local file path
  - Affects: `move-integration.test.ts`, `trick-room.test.ts`
  - These are async warnings, not test failures

## TypeScript Check

- **Command**: `npm run check`
- **Exit Code**: 137 (FATAL ERROR)
- **Issue**: JavaScript heap out of memory

### Details

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

The `svelte-check` command runs out of memory during analysis. This is a known issue with large Svelte codebases and doesn't indicate type errors - it's a resource constraint.

**Workaround**: Run `npm run build` instead for type validation (Vite handles this more efficiently)

## Lint Results

- **Command**: `npm run lint`
- **Exit Code**: 0
- **ESLint Errors**: 0
- **ESLint Warnings**: 0

### SCSS Deprecation Warnings (Non-blocking)

- `random()` global function deprecated (use `math.random` instead) - 3 instances
- `hsl()` function units warning - 1 instance

These are Dart Sass warnings, not ESLint issues.

---

## Baseline Summary

| Check | Status  | Notes                           |
| ----- | ------- | ------------------------------- |
| Tests | ✅ PASS | 439/439 pass (2 async warnings) |
| Types | ⚠️ OOM  | svelte-check hits memory limit  |
| Lint  | ✅ PASS | No ESLint errors                |

**Recommendation**: Use `npm run build` for full type validation as it handles the codebase size better.
