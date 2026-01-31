# Battle UI Rework - Learnings

## 2026-01-31 Session

### Pattern: Split Button Layout

- Created 4 buttons positioned around player sprite (2 left, 2 right)
- Uses absolute positioning with percentage-based placement
- Left buttons at ~8% from left, right buttons at ~80% from left
- GSAP staggered animation for smooth entry

### Pattern: FloatingPokemonInfo

- Replaces old AllyInfo/EnemyInfo corner HP bars
- Uses `statusAbr` prop (string) instead of status object with color
- Derives status color internally using getStatusColor() function
- Status color mappings: PSN=#A040A0, BRN=#F08030, PAR=#F8D030, SLP=#A8A8A8, FRZ=#98D8D8

### Pattern: Type Colors for Moves

- Already defined in codebase as typeColors Record<string, string>
- Fire=#F08030, Water=#6890F0, Electric=#F8D030, Grass=#78C850, etc.
- Apply via CSS custom property: style="--type-color: {color}"

### Pattern: Svelte 5 Keyboard Navigation

- Use onMount to add window.addEventListener('keydown', handler)
- Return cleanup function to remove listener
- Handle ArrowUp/Down/Left/Right for navigation
- Enter/Space for activation, Escape for cancel

### Integration Notes

- BattleInfoText replaces .info div for messages
- SplitActionButtons replaces .actions2 div
- SplitMoveSelector replaces .moves2 div (non-target-select)
- Target selection div still uses old inline buttons (to be updated)

### Build Verification

- `npm run build` passed successfully
- No TypeScript errors in new components
