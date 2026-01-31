# Issues - OpenMon Codebase Improvement

## Problems and Gotchas Discovered

---

## 2026-01-30: CSS Design Token Migration - PARTIALLY BLOCKED

### Issue
CSS design token migration (Phase 4, Tasks 19-22) has failed multiple times despite subagent completion reports.

### Root Cause
Subagents report success but do not actually make CSS replacements. The files still contain ~450+ hardcoded hex colors.

### Evidence
- `grep -r "var(--pixel-" src/lib/ | wc -l` returns 1 (should be 100+)
- ActionBar.svelte still has: `#0088cc`, `#000`, `#ffd700`, `#ffffff` in style blocks
- Multiple delegation attempts (4 parallel tasks + 1 deep task) all failed

### Recommendation
1. Create a separate issue/PR for manual CSS migration
2. Consider using ast-grep for systematic replacements
3. Or perform replacements in a dedicated session with explicit file-by-file editing

### Impact
- Phase 4 incomplete
- CSS design system not consistently applied
- This is cosmetic/maintainability issue, not functional

### Workaround
Move to Phase 5 which has clearer tasks. Address CSS in a follow-up effort.
