## Opponent Sprite Positioning Fix
- Adjusted `.opponent-sprite` CSS `right` property in `src/lib/battle/Battle.svelte` to match ally spread (18%).
- New formula: `right: calc(22% + var(--offSet) * -18%)`.
- Updated comments to reflect new values (22% and 4%).
