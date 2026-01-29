# Decisions - move-animations

## Session: ses_3f44e74f8ffe432VmQtfu6nD7Y (2026-01-29)

### Architecture Decisions

1. **New Engine Only**: Don't use legacy `battle-animations.ts` - recreate everything from scratch
2. **Categories, Not Moves**: Animate by category (punch, kick, slash, etc.) - individual move animations are out of scope
3. **CSS Filters for Type Coloring**: Use hue-rotate filter instead of separate sprites per type
4. **Test Page Hidden Route**: Accessible at `/debug/animations` but not linked in production nav

### Technical Choices

(To be populated during task execution)
