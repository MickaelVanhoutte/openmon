# Learnings from fix-stat-changes plan

## Session: ses_3f79f2ea1ffeG9P85TdJi2Fyfg

## Date: 2026-01-29

### Key Discoveries

1. **Empty string accuracy bug**: 192 moves in `moves-patched.json` have `"accuracy": ""` instead of `0`. The check `move.accuracy === 0` fails for empty strings. Fix: `!move.accuracy || move.accuracy === 0`.

2. **Stat stage multiplier formulas**:
   - Regular stats: `stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage)`
   - Accuracy/Evasion: `stage >= 0 ? (3 + stage) / 3 : 3 / (3 - stage)`

3. **Stat clamping**: Always use `Math.min(6, Math.max(-6, newValue))` to clamp stat stages.

### Patterns Established

1. Created shared utility file `stat-utils.ts` for reusable stat calculations
2. Both AllyInfo.svelte and EnemyInfo.svelte now import from the same utility

### Pre-existing Issues (Out of Scope)

- `ActionBar.svelte` has many LSP errors (unused variables, type mismatches)
- `Battle.svelte` has unused imports and type issues
- `experience.ts` has Invalid URL errors for xp-chart.json loading
- ESLint has configuration issues causing crashes
- svelte-check runs out of memory

### Files Created

- `src/js/pokemons/stat-utils.ts` - Shared stat multiplier utilities
- `src/js/__tests__/stat-utils.test.ts` - 22 tests for stat utilities
- `src/js/__tests__/accuracy.test.ts` - 8 tests for accuracy mechanics

### Files Modified

- `src/js/battle/actions/actions-selectable.ts:362` - Fixed accuracy check
- `src/js/pokemons/pokedex.ts:878-893` - Fixed stat clamping
- `src/lib/battle/AllyInfo.svelte` - Import and use shared utilities
- `src/lib/battle/EnemyInfo.svelte` - Import and use shared utilities
