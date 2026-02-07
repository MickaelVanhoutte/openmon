# Draft: Battle Button Redesign

## Requirements (confirmed)

- Redesign move buttons in SplitMoveSelector.svelte to match new parallelogram design
- Redesign action buttons in SplitActionButtons.svelte with same style (simplified)
- Background color = move type color (replaces placeholder `--card-bg`)
- Type icon watermark uses existing assets from `src/assets/types/`
- New design uses `skewX(-15deg)` (vs current `-10deg`)
- Decorative ink-colored outer borders via pseudo-elements
- Input badge circle on move buttons (purpose TBD)
- PP tag with purple background, positioned bottom-right
- Bold uppercase text in ink color (#2A224D)
- Action buttons: simpler version — no badge, no PP tag, no watermark
- Font: Oswald (Google Fonts) — needs confirmation
- Existing spatial positioning system (around Pokemon sprite) is preserved
- Existing GSAP entrance animations preserved
- Existing keyboard navigation preserved

## Technical Decisions

- Only CSS/template changes in SplitMoveSelector.svelte and SplitActionButtons.svelte
- No changes to ActionBar.svelte logic or props
- Type colors already mapped in SplitMoveSelector.svelte (typeColors record)
- Action button colors already defined (FIGHT=#dc5959, BAG=#eca859, POKEMON=#7EAF53, RUN=#599bdc)

## Research Findings

- Current buttons: dark glass overlay (::before rgba(20,25,35,0.7)) over type-color gradient
- Current skew: -10deg, new design: -15deg
- Type icons exist as both PNG and SVG in src/assets/types/
- Back button in ActionBar.svelte already uses skewX(-15deg) — matches new design angle

## Open Questions

- **Input badge**: What should the circle badge show? Keyboard shortcut? Index number? Info icon?
- **Font**: Prototype uses Oswald (Google Font) — is this an intentional choice? Should we add it?
- **Hover/selected states**: Current uses scale(1.08) + glow. What for new design?
- **Back button**: Should ActionBar's `.back-plate` also be updated to match?

## Scope Boundaries

- INCLUDE: SplitMoveSelector.svelte styling + template, SplitActionButtons.svelte styling + template
- INCLUDE: Possibly back button style in ActionBar.svelte
- EXCLUDE: ActionBar.svelte logic, positioning system, GSAP animations, keyboard navigation
- EXCLUDE: MoveSelector.svelte / ActionMenu.svelte (non-spatial fallbacks)
