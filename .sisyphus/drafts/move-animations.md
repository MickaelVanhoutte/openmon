# Draft: Complete Move Animations Implementation

## Requirements (confirmed)

- User wants Pokemon-style move animations like Pokemon Showdown
- Current implementation has the structure but all animations fall back to generic "dash" (physical) and "beam/flash" (special)
- Need a test page to preview all animations in a loop

## User Decisions

- **Architecture**: DON'T use legacy implementation (it's bad/inaccurate). Recreate EVERYTHING using the new engine.
- **Test Page**: Hidden route (accessible but not linked in production)
- **Test Pokemon**: Pikachu vs Charizard by default, with selectors to change them

## Current State Analysis

### TWO Animation Systems Exist:

**1. Legacy System (`battle-animations.ts`)** - TO BE IGNORED (user says it's bad):

- 371 lines of move-to-animation mappings
- Uses sprite sheets but user considers the animations inaccurate

**2. New Engine (`physical.ts` + `special.ts`)** - STUB IMPLEMENTATIONS TO REPLACE:

- Has category lists (PUNCH, KICK, SLASH, BITE, TACKLE, BEAM, PROJECTILE, BURST, WAVE)
- BUT all implementations just call the same fallback - this is what we need to fix

## Pokemon Showdown Reference (from research)

### Animation Architecture (source: smogon/pokemon-showdown-client)

- `battle-animations.ts` (~4,500 lines) - Core animation engine
- `battle-animations-moves.ts` (~38,444 lines) - Individual move definitions
- Uses jQuery animations with custom easing

### Animation Categories in Showdown:

| Category             | Pattern                        | Key Effects                           |
| -------------------- | ------------------------------ | ------------------------------------- |
| **Contact/Physical** | Sprite jumps to target         | contactattack pattern, impact effects |
| **Punch**            | Fast lunge + fist sprite       | fist sprite, wisp trails              |
| **Slash**            | Quick strike + slash           | rightslash, leftslash sprites         |
| **Claw**             | X-pattern movement             | leftclaw, rightclaw                   |
| **Bite**             | Jaw sprites close on target    | topbite, bottombite                   |
| **Beams**            | Multiple rapid projectiles     | electroball, energyball               |
| **Projectiles**      | Single traveling sprite        | fireball, icicle, rock                |
| **Waves**            | Multiple staggered projectiles | waterwisp, mudwisp                    |
| **Explosions**       | Scaling fireball at target     | fireball (expanding)                  |
| **Status/Buffs**     | Floating symbols around sprite | sword, wisp, flareball                |
| **Debuffs**          | Negative indicators            | angry, stare, pointer                 |
| **Healing**          | Energy orbs to user            | energyball, wisp                      |

### Key Visual Effects in Showdown:

- **Screen shake** via sprite position manipulation
- **Background flash** via color overlays (#000000 for dramatic, #987058 for stat boosts)
- **Easing functions**: ballistic (arc), swing (pendulum), linear, accel, decel

### Available Sprites in OpenMon (62 files):

- Physical: `fist-sprite`, `foot-sprite`, `claws-sprite`, `crunch-sprite`, `slash-sprite`, `chop-sprite`, `impact-sprite`
- Elemental: `fire-sprite`, `thunder-sprite`, `thunderball-sprite`, `ice-sprite`, `water-sprite`, `waterdrop-sprite`, `poison-sprite`, `rock-sprite`, `leaf-sprite`, `wind-sprite`
- Energy: `lightball-sprite`, `shadowball-sprite`, `psychic-sprite`
- Status: `heal-sprite`, `buff-sprite`, `debuff-sprite`, `drain-sprite`
- Props: `beam`, `lightning`, `sting`, `shard`, `sword`, `angry`, `heart`, `pointer`, `stare`
- After-effects in `elements/`: water, ice, poison, rock, static, burn, grass, ghost

## Scope Boundaries

- **INCLUDE**: Implement unique animations for all physical categories (PUNCH, KICK, SLASH, CLAW, BITE, TACKLE, CHOP)
- **INCLUDE**: Implement unique animations for all special categories (BEAM, PROJECTILE, BURST, WAVE, DRAIN)
- **INCLUDE**: Implement status animations (BUFF, DEBUFF, HEAL)
- **INCLUDE**: Test page at `/debug/animations` with mock battle, Pokemon selectors, animation type selector, loop playback
- **EXCLUDE**: Legacy `battle-animations.ts` - can be deleted after migration
- **EXCLUDE**: Adding new sprite assets (use existing 62 sprites)
