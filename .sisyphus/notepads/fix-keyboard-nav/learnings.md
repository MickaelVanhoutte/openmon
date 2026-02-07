## Keyboard Navigation Fix
- Replaced manual ±1/±2 math for move navigation in ActionBar.svelte with .
- This ensures consistency between action buttons and move buttons.
-  handles 2D grid logic correctly (Up/Down = ±cols, Left/Right = ±1).
## Keyboard Navigation Fix
- Replaced manual ±1/±2 math for move navigation in ActionBar.svelte with `navigateActionGrid`.
- This ensures consistency between action buttons and move buttons.
- `navigateActionGrid` handles 2D grid logic correctly (Up/Down = ±cols, Left/Right = ±1).
