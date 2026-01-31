# Learnings - Spatial Battle UI

## Conventions

- Use `typeChart[type].color` for type colors (RGB format like `'rgb(241,163,98)'`)
- GSAP patterns established in `SplitMoveSelector.svelte`
- Type icons at `src/assets/types/{type}.svg`
- Status icons at `src/assets/status/*.svg`
- Use `inlineSvg` directive for SVG imports

## Architecture

- Battle.svelte has `ally[]` and `opponent[]` HTMLImageElement arrays
- FloatingPokemonInfo uses clip-path polygon (will be replaced with skew)
- SplitMoveSelector is the active move selector (not MoveSelector)
