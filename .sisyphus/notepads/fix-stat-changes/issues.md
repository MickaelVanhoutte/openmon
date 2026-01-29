# Issues from fix-stat-changes plan

## Session: ses_3f79f2ea1ffeG9P85TdJi2Fyfg

## Date: 2026-01-29

### Blocked Items

#### 1. `npm run check` (svelte-check) - BLOCKED

- **Issue**: svelte-check runs out of memory during execution
- **Error**: JavaScript heap out of memory
- **Impact**: Cannot verify TypeScript errors project-wide
- **Workaround**: Used `lsp_diagnostics` on individual files - AllyInfo.svelte and EnemyInfo.svelte show 0 errors
- **Root cause**: Pre-existing infrastructure issue, not related to our changes

#### 2. `npm run lint` (ESLint) - BLOCKED

- **Issue**: ESLint crashes with configuration error
- **Error**: `Definition for rule 'svelte/valid-compile' was not found`
- **Impact**: Cannot run linter project-wide
- **Workaround**: Manual code review shows no lint issues in our changes
- **Root cause**: Pre-existing ESLint configuration issue

### Pre-existing Code Issues (Out of Scope)

These issues exist in the codebase but are NOT related to this fix:

1. **ActionBar.svelte**: 58+ LSP errors
   - Unused imports/variables
   - Type mismatches with PokemonInstance | undefined

2. **Battle.svelte**: 8 LSP errors
   - Unused Move/MoveEffect/MoveInstance imports
   - Type issues with undefined

3. **experience.ts**: Invalid URL errors
   - Cannot resolve xp-chart.json in test environment
