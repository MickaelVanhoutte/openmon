# UI/UX Polish - Learnings

## Conventions

- All colors must use exact hex codes from spec
- Pixel-art aesthetic: 2px borders, 4px hard drop shadows, no border-radius
- No gradients on stat bars - solid flat colors only
- No emojis in code

## CSS/SCSS Patterns

- Global design system at `src/styles/_pixel-art.scss`
- Components use scoped SCSS within Svelte files
- CSS variables prefixed with `--pixel-`

## Session 2026-01-28

### Completed Tasks

1. Added `--pixel-text-secondary: #aaccff` to `_pixel-art.scss`
2. Fixed LoadSave.svelte text contrast (#262626 -> #FFFFFF), pixel-art button styling
3. Resized run button (44x44 -> 48x48), repositioned to 10 o'clock
4. Fixed party strip borders (#0d2538 -> #000)
5. Fixed stat bars: 12px -> 16px height, #333 background, removed border-radius
6. Fixed PC box: 64px -> 52px entries, 18px -> 22px font, added selection glow

### Key CSS Changes

- `.load-screen`: `color: #ffffff` instead of `#262626`
- `.new-game button`: Added `box-shadow: 4px 4px 0px #000` for pixel-art effect
- `.stat-bar`: Removed `border-radius`, set `background: #333333`
- `.run-button`: Repositioned with `bottom: calc(5dvh + 20px + 140px)` and `right: calc(...) + 70px)`

### Verification

- npm run lint: PASS (no errors)
- npm run build: PASS (4.37s)
- All 3 commits made successfully
