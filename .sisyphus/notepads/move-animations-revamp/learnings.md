## Task 1: Pokemon Showdown Analysis - Completed

### Key Findings

**Repository Structure:**

- Main animation engine: `battle-animations.ts` (6,194 lines)
- Move definitions: `battle-animations-moves.ts` (38,444 lines!)
- Effect sprites: `/fx/` folder (139 PNG files, mostly CC0 licensed)
- Commit SHA: 4428a1444c3d39e915b7c7a19c5c76565da5aba3

**Easing Functions (4 custom jQuery extensions):**

1. `ballisticUp`: `-3*x² + 4*x` (upward parabolic arc)
2. `ballisticDown`: Reflected ballisticUp (downward arc)
3. `quadUp`: `1 - (1-x)²` (ease-out, deceleration)
4. `quadDown`: `x²` (ease-in, acceleration)

**Animation Patterns:**

- **Physical moves**: Attacker dashes (ballistic) → impact → return → defender recoil shake
- **Special moves**: Projectile spawns → travels (linear/ballistic) → explode (3x scale + fade)
- **Status moves**: Attacker reacts → effects spawn around defender with time offsets

**Timing Conventions:**

- 75-100ms: Quick recoil shakes
- 300-400ms: Standard dash/projectile travel
- 500ms: Long-distance projectiles
- 200ms: Staggered effect timing offsets

**Effect Sprites We're Missing (High Priority):**

- waterwisp.png, mudwisp.png (elemental projectiles)
- leftslash.png, rightslash.png (cutting moves)
- leftchop.png, rightchop.png (better chops)
- mistball.png (psychic), flareball.png (fire)
- topbite.png, bottombite.png (bite animations)
- rocks.png (Rock Tomb, Stealth Rock)

**Licensing:**

- ✅ Most fx/ sprites: CC0 (public domain) - safe to use
- ⚠️ icicle.png, lightning.png: CC-BY-SA-3.0 - need attribution
- ❌ rocks.png: GPLv3 - skip or make our own

### Architectural Insights

**Position System:**

- 3D coordinates: {x, y, z, scale, xscale, yscale, opacity, time}
- `z` creates depth (0=near, 200=far) with perspective scaling
- Conversion function applies perspective distortion to CSS

**Design Philosophy:**

- Clean separation: BattleScene (orchestration) vs BattleMoveAnims (definitions)
- Reusable effects catalog (50+ sprites)
- Chainable animations via jQuery `.delay()` and `.animate()`
- `waitFor()` pattern tracks all active animations

### Recommendations for Our Project

**Port these 4 patterns:**

1. Easing curves → GSAP CustomEase
2. Dash attack template (400ms dash + return + 75ms shake)
3. Projectile template (spawn → travel → explode)
4. Effect catalog structure (BattleEffects object)

**Adapt, don't copy:**

- jQuery → GSAP (we already use GSAP)
- Keep our sprite sheets (more efficient than individual PNGs)
- Simplify: 38k lines is overkill, extract core patterns only

**Implementation Strategy:**

1. Download CC0 sprites (8-10 missing effects)
2. Create GSAP easing functions (4 curves)
3. Build helper class: `dashAttack()`, `projectile()`, `statusEffect()`
4. Test on 5 moves: Tackle, Flamethrower, Thunder Wave, Fury Swipes, Hyper Beam
5. Tune timings (their 400ms might need adjustment for our system)
6. Scale to ~50 representative moves

**Documented:** Full analysis in `.sisyphus/research/showdown-analysis.md` (600+ lines)

---

## 2026-01-29: Full System Overhaul Complete

### Summary

All 16 tasks completed with 117 tests passing. Build succeeds.

### Final Architecture

```
src/js/battle/animations/
├── animation-engine.ts      # Core engine (8.6KB)
├── position-system.ts       # Container-relative coords
├── easing.ts                # Custom GSAP easing
├── effect-pool.ts           # Sprite pooling (max 20/type)
├── effect-manifest.ts       # Effect definitions
├── audio-sync.ts            # Sound timing
├── field-effects.ts         # Weather/terrain
├── index.ts                 # Public API + integration
└── moves/
    ├── physical.ts          # Punch, kick, slash, bite, tackle
    ├── special.ts           # Beam, projectile, burst, wave
    ├── status.ts            # Buff, debuff, heal, protect
    ├── other.ts             # Multi-hit, OHKO, field, weather
    └── index.ts             # Registry aggregator (200+ moves)
```

### Key Technical Decisions

1. **Container-relative positioning** eliminates all viewport-dependency bugs
2. **Move registry pattern** - extensible without modifying core engine
3. **Fallback animations** - physical/special/status fallbacks for unmapped moves
4. **Effect pooling** - prevents DOM churn and memory leaks

### Gotchas Encountered

1. **Import paths in tests**: Use `$js/...` alias, not relative paths
2. **Floating point precision**: Use `toBeCloseTo()` for easing function tests
3. **Image preload in jsdom**: Don't wait for image load events
4. **GSAP mock**: Must return chainable timeline with `.then()` support

---
