# Learnings - Save PlayTime Feature

## 2026-01-28 Session

### Implementation Pattern

- TimeOfDayService tracks elapsed time via `Date.now() - startTime`
- To restore elapsed time, offset the startTime: `startTime = Date.now() - savedElapsedMs`
- Add `getElapsedMs()` getter to expose current elapsed time for saving

### SaveContext Schema Extension

- Add new fields with default values for backward compatibility: `playTime: number = 0`
- Add as LAST parameter in constructor with default to avoid breaking existing calls
- Old saves without the field will deserialize with undefined, so use `|| 0` when reading

### Build Verification

- `npm run check` (svelte-check) runs out of memory on this project
- Use `npm run build` instead for TypeScript verification
- `lsp_diagnostics` provides quick file-level type checking

### Related Fix: Wild Grass Battles

- `battleIndices` in map files controls both:
  1. Random wild Pokemon encounters
  2. Player/follower sprite grass clipping (bottom 15-20%)
- The `hasBattleZoneAt()` method checks against `battleSet` built from `battleIndices`
- Empty `battleIndices: []` breaks both features simultaneously
