# Decisions - Spatial Battle UI

## Design Decisions

- **Skew angle**: 15 degrees (`transform: skewX(-15deg)`)
- **Counter-skew for text**: 15 degrees opposite (`transform: skewX(15deg)`)
- **Positioning**: Dynamic sprite-relative using `getBoundingClientRect()`
- **Attack plates layout**: Radial fan-out around Pokemon sprite
- **Leader lines**: Solid thin line (2px)
- **HP widget visibility**: Hide during attack animations

## Technical Decisions

- Use `typeChart[type].color` (RGB format, already established)
- Modify existing components rather than create new ones
- GSAP for all animations
