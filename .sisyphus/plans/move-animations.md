# Move Animations Complete Rewrite

## TL;DR

> **Quick Summary**: Complete rewrite of all move animations using the new AnimationEngine with Pokemon Showdown-quality visuals. Create a test page at `/debug/animations` with mock battle and animation previewer.
>
> **Deliverables**:
>
> - 20+ distinct animation implementations:
>   - Physical: punch, kick, slash, bite, tackle, chop, claw
>   - Special: beam, projectile, burst, wave, drain
>   - Status: buff, debuff, heal
>   - Environmental: background-change, weather
>   - Transformation: size-change, form-change
> - Test page component with Pokemon selectors and animation loop playback
> - Unit tests for animation behavior
> - Legacy battle-animations.ts deleted
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (AnimationEngine setup) -> Task 2-4 (animation implementations) -> Task 5 (test page)

---

## Context

### Original Request

"I thought we agreed to implement every move animations as close as possible as a real pokemon game (like showdown), and all you did was 'dash' for physical and 'beam' for special. Finish the work. And create a test page where every animations are played so i can see them."

### Interview Summary

**Key Discussions**:

- Architecture: Don't use legacy implementation (it's bad/inaccurate). Recreate EVERYTHING using the new AnimationEngine.
- Test Page: Hidden route at `/debug/animations`, accessible but not linked in production.
- Test Pokemon: Pikachu vs Charizard by default, with dropdown selectors to change them.
- Test Strategy: Unit tests with Vitest + manual visual verification via test page.
- Legacy Cleanup: Delete `battle-animations.ts` after migration.
- Scope: All animation types at once (physical, special, status).

**Research Findings**:

- Pokemon Showdown uses ~38,444 lines of move animations with 157 effect sprites
- Key patterns: contactattack (sprite jumps to target), punchattack (fast lunge + fist sprite), slashattack (quick strike), ballistic easing for jumps
- Visual effects: background flash, screen shake, particle trails, multiple overlapping effects
- OpenMon has 62 existing sprites in `src/assets/battle/fx/` - sufficient for implementation

---

## Work Objectives

### Core Objective

Implement distinct, visually authentic animations for every move category in the new AnimationEngine, matching Pokemon Showdown quality.

### Concrete Deliverables

- `src/js/battle/animations/moves/physical.ts` - Rewritten with 7 distinct animation implementations
- `src/js/battle/animations/moves/special.ts` - Rewritten with 5 distinct animation implementations
- `src/js/battle/animations/moves/status.ts` - New file with 3 distinct animation implementations
- `src/js/battle/animations/moves/environmental.ts` - New file with background/weather/transformation animations
- `src/lib/debug/AnimationTestPage.svelte` - New test page component
- `src/js/__tests__/animations.test.ts` - Unit tests for animation functions
- `battle-animations.ts` - DELETED

### Definition of Done

- [ ] All 20 animation categories have unique visual implementations
- [ ] Test page accessible at `/debug/animations` route
- [ ] `npm run test:run` passes for animation tests
- [ ] `npm run check` passes (no TypeScript errors)
- [ ] Legacy battle-animations.ts deleted with no remaining imports

### Must Have

- Sprite movement for physical attacks (attacker moves toward defender)
- Sprite sheet animations for contact effects (fist, slash, bite, etc.)
- Projectile animations for special attacks (sprites traveling to target)
- Screen shake on impact
- Type-colored effects where appropriate
- Loop playback in test page
- **Background effect animations** (color tint, particle overlay for moves like Cosmic Power, weather moves)
- **Sprite transformation animations** (size changes for Growth/Minimize, form changes)

### Must NOT Have (Guardrails)

- DO NOT create new sprite assets - use existing 62 sprites only
- DO NOT modify the AnimationEngine core API - use existing methods
- DO NOT add animations for individual moves (just categories) - this is phase 1
- DO NOT make test page visible in production navigation
- DO NOT over-engineer with particle systems - keep it GSAP + CSS filter based
- DO NOT add sound effects (out of scope)

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest configured)
- **User wants tests**: YES (unit tests)
- **Framework**: vitest

### TDD Approach for Animation Logic

Each animation function will have tests that:

1. Mock GSAP to verify animation calls are made correctly
2. Verify proper element targeting (attacker vs defender)
3. Verify timing/duration values
4. Verify sprite/effect selection

### Automated Verification

**For Animation Tests** (using Bash vitest):

```bash
npm run test:run -- --reporter=verbose 2>&1 | head -50
# Assert: All tests pass, 0 failures
```

**For Test Page** (using playwright skill):

```
1. Navigate to: http://localhost:5173/debug/animations
2. Wait for: Pokemon sprites to load (ally and enemy visible)
3. Assert: Animation selector dropdown exists
4. Select: "punch" from animation type dropdown
5. Click: Play button
6. Wait: 2 seconds for animation to complete
7. Assert: No JavaScript errors in console
8. Screenshot: .sisyphus/evidence/animation-test-page.png
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Enhance AnimationEngine with helper methods
└── Task 6: Set up test file structure and GSAP mocks

Wave 2 (After Wave 1):
├── Task 2: Implement physical animations (punch, kick, slash, bite, tackle, chop, claw)
├── Task 3: Implement special animations (beam, projectile, burst, wave, drain)
├── Task 4: Implement status animations (buff, debuff, heal)
└── Task 4B: Implement environmental/transformation animations (background-change, weather, size-change, form-change)

Wave 3 (After Wave 2):
├── Task 5: Create animation test page
├── Task 7: Write unit tests for all animations
└── Task 8: Delete legacy and clean up imports

Wave 4 (Final):
└── Task 9: Final integration test
```

### Dependency Matrix

| Task | Depends On     | Blocks         | Can Parallelize With |
| ---- | -------------- | -------------- | -------------------- |
| 1    | None           | 2, 3, 4, 4B, 5 | 6                    |
| 2    | 1              | 7, 8, 9        | 3, 4, 4B             |
| 3    | 1              | 7, 8, 9        | 2, 4, 4B             |
| 4    | 1              | 7, 8, 9        | 2, 3, 4B             |
| 4B   | 1              | 7, 8, 9        | 2, 3, 4              |
| 5    | 2, 3, 4, 4B    | 9              | 7, 8                 |
| 6    | None           | 7              | 1                    |
| 7    | 2, 3, 4, 4B, 6 | 9              | 5, 8                 |
| 8    | 2, 3, 4, 4B    | 9              | 5, 7                 |
| 9    | 5, 7, 8        | None           | None (final)         |

---

## TODOs

- [ ] 1. Enhance AnimationEngine with Sprite Effect Helpers

  **What to do**:
  - Add `showSpriteEffect()` method that plays a sprite sheet animation at a position
  - Add `moveSpriteTo()` method that animates a Pokemon sprite to a position and back
  - Add `showImpact()` helper for hit confirmation effects
  - Add type color mapping (fire -> orange, water -> blue, etc.)
  - Export these as part of AnimationEngine API

  **Must NOT do**:
  - Don't change existing method signatures
  - Don't add new dependencies

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core infrastructure work that requires understanding GSAP and existing engine patterns
  - **Skills**: [`playwright`]
    - `playwright`: For eventual browser testing of animations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 6)
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/animation-engine.ts:166-196` - Existing `showEffectAt()` pattern to follow
  - `src/js/battle/animations/animation-engine.ts:95-132` - `dashAttack()` for sprite movement pattern

  **API/Type References**:
  - `src/js/battle/animations/animation-engine.ts:12-31` - PokemonSprite, MoveContext interfaces
  - `src/js/battle/animations/effect-manifest.ts` - Effect sprite definitions

  **External References**:
  - Pokemon Showdown's `battle-animations.ts` L3295-3321: contactattack pattern (sprite jumps via ballistic easing)

  **WHY Each Reference Matters**:
  - `showEffectAt()` shows how to acquire sprites from pool and animate them - follow this pattern for sprite sheets
  - `dashAttack()` shows relative positioning with transforms - key for sprite movement

  **Acceptance Criteria**:
  - [ ] New method `showSpriteEffect(spriteName, position, frameCount, options)` exists
  - [ ] New method `moveSpriteTo(sprite, targetPosition, options)` exists with return-to-home
  - [ ] Type color map exported (fire: '#ff6600', water: '#3399ff', etc.)
  - [ ] `npm run check` passes with no new errors

  **Commit**: YES
  - Message: `feat(battle): add sprite effect helpers to AnimationEngine`
  - Files: `src/js/battle/animations/animation-engine.ts`
  - Pre-commit: `npm run check`

---

- [ ] 2. Implement Physical Move Animations

  **What to do**:
  - Rewrite `punchAnimation()` - Fast lunge to target + fist-sprite overlay on impact + shake
  - Rewrite `kickAnimation()` - Jump arc (ballistic) + foot-sprite overlay + stronger shake
  - Rewrite `slashAnimation()` - Quick dash + slash-sprite (diagonal) overlay + invert flash
  - Rewrite `biteAnimation()` - Dash + crunch-sprite overlay (jaws closing) + shake
  - Rewrite `tackleAnimation()` - Full body slam (sprite moves all the way) + impact-sprite + heavy shake
  - Implement `chopAnimation()` - Similar to slash but uses chop-sprite
  - Implement `clawAnimation()` - X-pattern double slash using claws-sprite
  - Each should use appropriate sprite from assets, type coloring via hue-rotate filter

  **Must NOT do**:
  - Don't add new sprites - use existing fist-sprite, foot-sprite, slash-sprite, crunch-sprite, claws-sprite, chop-sprite, impact-sprite
  - Don't over-engineer with particle systems

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Heavy animation/visual work requiring understanding of GSAP timelines and sprite sheets
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Animation quality and timing requires visual design sensibility

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Tasks 5, 7, 8, 9
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/moves/physical.ts:5-31` - Current dashToTarget pattern (base to improve upon)
  - `src/js/battle/animations/battle-animations.ts:1029-1121` - Legacy animateSpriteDash (for reference, NOT to copy)

  **Asset References**:
  - `src/assets/battle/fx/fist-sprite.png` - For punch animations
  - `src/assets/battle/fx/foot-sprite.png` - For kick animations
  - `src/assets/battle/fx/slash-sprite.png` - For slash animations
  - `src/assets/battle/fx/crunch-sprite.png` - For bite animations
  - `src/assets/battle/fx/claws-sprite.png` - For claw animations
  - `src/assets/battle/fx/chop-sprite.png` - For chop animations
  - `src/assets/battle/fx/impact-sprite.png` - For tackle/body slam

  **External References**:
  - Pokemon Showdown punchattack pattern: Fast lunge, fist sprite appears at impact point, scales up and fades

  **WHY Each Reference Matters**:
  - Current dashToTarget shows the base pattern but needs enhancement with sprite overlays
  - Sprite files determine what visual assets are available for each category

  **Acceptance Criteria**:
  - [ ] `punchAnimation()` - Attacker dashes, fist-sprite appears on target, target shakes
  - [ ] `kickAnimation()` - Attacker jumps in arc (ballistic ease), foot-sprite on target
  - [ ] `slashAnimation()` - Quick dash, diagonal slash-sprite overlay
  - [ ] `biteAnimation()` - Dash, crunch-sprite (jaws animation), target shakes
  - [ ] `tackleAnimation()` - Full dash, impact-sprite, heavy screen shake
  - [ ] `chopAnimation()` - Similar to slash with chop-sprite
  - [ ] `clawAnimation()` - X-pattern, claws-sprite

  **Commit**: YES
  - Message: `feat(battle): implement distinct physical move animations`
  - Files: `src/js/battle/animations/moves/physical.ts`
  - Pre-commit: `npm run check`

---

- [ ] 3. Implement Special Move Animations

  **What to do**:
  - Rewrite `beamAnimation()` - Beam sprite extends from attacker to defender, type-colored via hue-rotate, background dims
  - Rewrite `projectileAnimation()` - Single sprite travels from attacker to defender with type-appropriate sprite (fire-sprite, water-sprite, etc.)
  - Rewrite `burstAnimation()` - Effect explodes on target (scales up rapidly), screen shake
  - Rewrite `waveAnimation()` - Multiple staggered projectiles (3-5) traveling to target
  - Implement `drainAnimation()` - Effect on target + wisps travel back to attacker (drain-sprite)
  - Each should select appropriate sprite based on move type

  **Must NOT do**:
  - Don't create type-specific animations for every element - use hue-rotate filter
  - Don't add elaborate particle trails

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex projectile timing and visual effects
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Animation polish and timing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: Tasks 5, 7, 8, 9
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/moves/special.ts:5-48` - Current beamAnimation (base to improve)
  - `src/js/battle/animations/battle-animations.ts:818-872` - Legacy animateBeam (reference)

  **Asset References**:
  - `src/assets/battle/fx/fire-sprite.png` - Fire type projectiles
  - `src/assets/battle/fx/water-sprite.png` - Water type
  - `src/assets/battle/fx/thunder-sprite.png` - Electric on-target
  - `src/assets/battle/fx/thunderball-sprite.png` - Electric projectiles
  - `src/assets/battle/fx/ice-sprite.png` - Ice type
  - `src/assets/battle/fx/beam.png` - Generic beam
  - `src/assets/battle/fx/drain-sprite.png` - Drain animations

  **API/Type References**:
  - `src/js/battle/animations/moves/special.ts:9-28` - Type color mapping

  **WHY Each Reference Matters**:
  - Type color mapping already exists in special.ts - enhance it with more colors
  - Sprite assets determine visual options per type

  **Acceptance Criteria**:
  - [ ] `beamAnimation()` - Beam extends across screen, type-colored, background dims briefly
  - [ ] `projectileAnimation()` - Sprite travels attacker->defender, type-appropriate sprite selected
  - [ ] `burstAnimation()` - Explosion effect at target (scale 0->2), screen shake
  - [ ] `waveAnimation()` - 3-5 staggered projectiles with slight delays
  - [ ] `drainAnimation()` - Effect on target, then particles travel back to attacker
  - [ ] Type-to-sprite mapping: fire->fire-sprite, water->water-sprite, electric->thunderball-sprite, etc.

  **Commit**: YES
  - Message: `feat(battle): implement distinct special move animations`
  - Files: `src/js/battle/animations/moves/special.ts`
  - Pre-commit: `npm run check`

---

- [ ] 4. Implement Status Move Animations

  **What to do**:
  - Create new file `src/js/battle/animations/moves/status.ts`
  - Implement `buffAnimation()` - Buff-sprite rises around user, brightness flash, scale pulse
  - Implement `debuffAnimation()` - Debuff-sprite descends on target, dim effect
  - Implement `healAnimation()` - Heal-sprite wisps rise around user, green/white glow
  - Export statusMoves record and registerStatusMoves function
  - Add status move categories (BUFF_MOVES, DEBUFF_MOVES, HEAL_MOVES)

  **Must NOT do**:
  - Don't add elaborate status condition animations (those are separate)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Status animations with timing
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Visual effects

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3)
  - **Blocks**: Tasks 5, 7, 8, 9
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/moves/physical.ts:168-192` - Registration pattern to follow
  - `src/js/battle/animations/battle-animations.ts:874-921` - Legacy animateSpriteSelf (self-targeting pattern)

  **Asset References**:
  - `src/assets/battle/fx/buff-sprite.png` - Stat boost effects
  - `src/assets/battle/fx/debuff-sprite.png` - Stat lowering effects
  - `src/assets/battle/fx/heal-sprite.png` - Healing effects

  **API/Type References**:
  - `src/js/battle/animations/animation-engine.ts:33` - MoveAnimation type definition

  **WHY Each Reference Matters**:
  - Registration pattern in physical.ts shows how to export and register moves
  - animateSpriteSelf shows how to target the user instead of opponent

  **Acceptance Criteria**:
  - [ ] New file `src/js/battle/animations/moves/status.ts` created
  - [ ] `buffAnimation()` - Buff-sprite around user, upward motion, brightness pulse
  - [ ] `debuffAnimation()` - Debuff-sprite on target, downward motion, dim effect
  - [ ] `healAnimation()` - Heal-sprite rises, green glow effect
  - [ ] Move lists: BUFF_MOVES (swords-dance, dragon-dance, etc.), DEBUFF_MOVES (growl, leer, etc.), HEAL_MOVES (recover, etc.)
  - [ ] `registerStatusMoves(engine)` function exported

  **Commit**: YES
  - Message: `feat(battle): add status move animations`
  - Files: `src/js/battle/animations/moves/status.ts`
  - Pre-commit: `npm run check`

---

- [ ] 4B. Implement Environmental and Transformation Animations

  **What to do**:
  - Create new file `src/js/battle/animations/moves/environmental.ts`
  - Implement `backgroundChangeAnimation()` - Screen tint/color overlay (for Cosmic Power, Moonlight, etc.)
    - Overlay div with color fade in/out
    - Optional particle effects using existing sprites
  - Implement `weatherAnimation()` - Weather effect overlay (Rain Dance, Sunny Day, Sandstorm, Hail)
    - Rain: blue tint + animated rain lines
    - Sun: orange/yellow brightness boost
    - Sand: brown tint + particle effect
    - Hail: white/blue tint + ice particle effect
  - Implement `sizeChangeAnimation()` - Sprite scale transform (Growth, Minimize, Belly Drum)
    - Growth: scale 1.0 -> 1.2 -> 1.0 with glow
    - Minimize: scale 1.0 -> 0.6 -> 1.0
    - Includes buff-sprite overlay
  - Implement `formChangeAnimation()` - Sprite morph effect (for transformation moves)
    - Flash white, scale pulse, optional sprite swap callback
  - Export environmentalMoves record and registerEnvironmentalMoves function
  - Add move categories: BACKGROUND_MOVES, WEATHER_MOVES, SIZE_CHANGE_MOVES, FORM_CHANGE_MOVES

  **Must NOT do**:
  - Don't persist weather effects beyond the animation (that's battle state management)
  - Don't permanently change sprite scale (animation only, return to original)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex screen effects and transformations
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Visual effect design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5, 7, 8, 9
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/animation-engine.ts:198-220` - `backgroundFlash()` method for screen effects
  - `src/js/battle/animations/moves/status.ts` - Registration pattern from Task 4
  - `src/lib/battle/Battle.svelte:343-350` - Scene structure for overlay placement

  **Asset References**:
  - `src/assets/battle/fx/psychic-sprite.png` - For cosmic/psychic background effects
  - `src/assets/battle/fx/elements/water.png` - For rain weather
  - `src/assets/battle/fx/elements/ice.png` - For hail weather
  - `src/assets/battle/fx/elements/burn.png` - For sunny day
  - `src/assets/battle/fx/elements/rock.png` - For sandstorm
  - `src/assets/battle/fx/buff-sprite.png` - For growth/size change overlay

  **External References**:
  - Pokemon Showdown cosmicpower: `scene.backgroundEffect('#000033', 1000, 0.5)` pattern
  - Pokemon Showdown growth: Sprite scale animation + floating effect sprites

  **WHY Each Reference Matters**:
  - `backgroundFlash()` shows existing screen overlay pattern
  - Element sprites provide weather particle visuals

  **Acceptance Criteria**:
  - [ ] New file `src/js/battle/animations/moves/environmental.ts` created
  - [ ] `backgroundChangeAnimation()` - Screen color tint overlay (fades in/out)
  - [ ] `weatherAnimation(type)` - Different effect based on weather type:
    - Rain: blue overlay + particle effect
    - Sun: orange/yellow brightness
    - Sand: brown overlay + particles
    - Hail: blue/white overlay + ice particles
  - [ ] `sizeChangeAnimation(direction)` - Sprite scales up (growth) or down (minimize) and returns
  - [ ] `formChangeAnimation()` - Flash white + scale pulse
  - [ ] Move lists: BACKGROUND_MOVES (cosmic-power, moonlight, etc.), WEATHER_MOVES (rain-dance, sunny-day, etc.), SIZE_CHANGE_MOVES (growth, minimize, belly-drum), FORM_CHANGE_MOVES (transform, etc.)
  - [ ] `registerEnvironmentalMoves(engine)` function exported

  **Commit**: YES
  - Message: `feat(battle): add environmental and transformation animations`
  - Files: `src/js/battle/animations/moves/environmental.ts`
  - Pre-commit: `npm run check`

---

- [ ] 5. Create Animation Test Page

  **What to do**:
  - Create `src/lib/debug/AnimationTestPage.svelte` using Svelte 5 runes syntax
  - Mock battle scene with two Pokemon sprites (ally and enemy positions)
  - Pokemon selector dropdowns (default: Pikachu ally, Charizard enemy)
  - Animation type dropdown (all categories: punch, kick, slash, bite, tackle, chop, claw, beam, projectile, burst, wave, drain, buff, debuff, heal, background-change, weather, size-change, form-change)
  - Move type selector (fire, water, electric, grass, etc.) for type-colored effects
  - Play button that triggers selected animation
  - Loop toggle checkbox
  - Add route in App.svelte for `/debug/animations`

  **Must NOT do**:
  - Don't add link to this page in main navigation
  - Don't add complex battle logic - just animation preview

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with visual focus
  - **Skills**: [`frontend-ui-ux`, `playwright`]
    - `frontend-ui-ux`: Clean UI design
    - `playwright`: For verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 2, 3, 4

  **References**:

  **Pattern References**:
  - `src/lib/battle/Battle.svelte:1-50` - Battle scene structure with sprite positioning
  - `src/lib/battle/Battle.svelte:340-380` - Sprite elements and scene div structure
  - `src/App.svelte` - Routing pattern for adding new pages

  **API/Type References**:
  - `src/js/battle/animations/animation-engine.ts:35-76` - AnimationEngine API
  - `src/js/pokemons/pokedex.ts` - Pokedex for Pokemon data

  **Asset References**:
  - Pokemon sprites are in assets - dynamically load based on selection

  **WHY Each Reference Matters**:
  - Battle.svelte shows exact structure for positioning sprites (ally bottom-left, enemy top-right)
  - AnimationEngine API shows available methods for triggering animations

  **Acceptance Criteria**:
  - [ ] File created: `src/lib/debug/AnimationTestPage.svelte`
  - [ ] Route `/debug/animations` works in App.svelte
  - [ ] Two Pokemon visible (ally position, enemy position)
  - [ ] Pokemon selector dropdowns functional (loads from Pokedex)
  - [ ] Animation type dropdown with all 20 categories
  - [ ] Move type dropdown (for hue coloring)
  - [ ] Play button triggers animation on click
  - [ ] Loop toggle replays animation every 2 seconds when enabled

  **Commit**: YES
  - Message: `feat(debug): add animation test page at /debug/animations`
  - Files: `src/lib/debug/AnimationTestPage.svelte`, `src/App.svelte`
  - Pre-commit: `npm run check`

---

- [ ] 6. Set Up Test Infrastructure for Animations

  **What to do**:
  - Create `src/js/__tests__/animations.test.ts`
  - Set up GSAP mocks (vi.mock('gsap'))
  - Create mock PokemonSprite and MoveContext factories
  - Create mock AnimationEngine or spy on real one
  - Set up DOM environment for element manipulation tests

  **Must NOT do**:
  - Don't test visual output (that's what test page is for)
  - Don't test GSAP internals

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Test setup is fairly standard
  - **Skills**: [`playwright`]
    - `playwright`: Testing patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 7
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/__tests__/` - Existing test patterns in the project
  - `vitest.config.ts` or `vite.config.ts` - Test configuration

  **External References**:
  - Vitest mocking docs: https://vitest.dev/guide/mocking.html

  **WHY Each Reference Matters**:
  - Existing tests show project conventions for test structure
  - GSAP needs to be mocked since it manipulates DOM

  **Acceptance Criteria**:
  - [ ] File created: `src/js/__tests__/animations.test.ts`
  - [ ] GSAP properly mocked with `vi.mock('gsap')`
  - [ ] Helper function to create mock PokemonSprite
  - [ ] Helper function to create mock MoveContext
  - [ ] At least one passing placeholder test
  - [ ] `npm run test:run` passes

  **Commit**: YES
  - Message: `test(battle): set up animation test infrastructure`
  - Files: `src/js/__tests__/animations.test.ts`
  - Pre-commit: `npm run test:run`

---

- [ ] 7. Write Unit Tests for All Animation Categories

  **What to do**:
  - Write tests for each physical animation (punch, kick, slash, bite, tackle, chop, claw)
  - Write tests for each special animation (beam, projectile, burst, wave, drain)
  - Write tests for each status animation (buff, debuff, heal)
  - Write tests for each environmental animation (background-change, weather, size-change, form-change)
  - Each test should verify: correct target element, animation calls made, proper timing values
  - Test edge cases: multiple defenders (for area moves), missing elements

  **Must NOT do**:
  - Don't test visual appearance - just behavioral correctness

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Comprehensive test coverage requires careful analysis
  - **Skills**: [`playwright`]
    - `playwright`: Testing patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 2, 3, 4, 4B, 6

  **References**:

  **Pattern References**:
  - `src/js/__tests__/animations.test.ts` - Test infrastructure from Task 6
  - `src/js/battle/animations/moves/physical.ts` - Functions to test
  - `src/js/battle/animations/moves/special.ts` - Functions to test
  - `src/js/battle/animations/moves/status.ts` - Functions to test
  - `src/js/battle/animations/moves/environmental.ts` - Functions to test

  **WHY Each Reference Matters**:
  - Need to test the actual implemented functions

  **Acceptance Criteria**:
  - [ ] Tests for all 7 physical animations
  - [ ] Tests for all 5 special animations
  - [ ] Tests for all 3 status animations
  - [ ] Tests for all 4 environmental animations
  - [ ] Each test verifies animation was called with correct targets
  - [ ] Edge case: test with array of defenders
  - [ ] All tests pass: `npm run test:run`

  **Commit**: YES
  - Message: `test(battle): add comprehensive animation unit tests`
  - Files: `src/js/__tests__/animations.test.ts`
  - Pre-commit: `npm run test:run`

---

- [ ] 8. Delete Legacy battle-animations.ts and Clean Up

  **What to do**:
  - Delete `src/js/battle/animations/battle-animations.ts` (1122 lines)
  - Find and update any imports of deleted file
  - Update Battle.svelte if it imports from legacy file
  - Ensure all animation calls use new engine exclusively

  **Must NOT do**:
  - Don't delete if new animations aren't working yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File deletion and import cleanup is straightforward
  - **Skills**: [`git-master`]
    - `git-master`: Clean commit for deletion

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 7)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 2, 3, 4

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/battle-animations.ts` - File to delete
  - `src/lib/battle/Battle.svelte` - May import from legacy file
  - `src/js/battle/animations/index.ts` - May re-export from legacy

  **WHY Each Reference Matters**:
  - Need to find all imports before deletion to avoid breaking builds

  **Acceptance Criteria**:
  - [ ] File deleted: `src/js/battle/animations/battle-animations.ts`
  - [ ] No remaining imports of deleted file
  - [ ] `npm run check` passes
  - [ ] `npm run build` passes

  **Commit**: YES
  - Message: `refactor(battle): remove legacy battle-animations.ts`
  - Files: Multiple (deletions and import updates)
  - Pre-commit: `npm run check && npm run build`

---

- [ ] 9. Final Integration Test

  **What to do**:
  - Run dev server and navigate to `/debug/animations`
  - Test each animation type with play button
  - Verify loop toggle works
  - Test Pokemon selector changes
  - Run full test suite
  - Run build to ensure production build works

  **Must NOT do**:
  - Don't merge if any animation is broken

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task, no implementation
  - **Skills**: [`playwright`]
    - `playwright`: Browser verification

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 5, 7, 8

  **References**:

  **Pattern References**:
  - All previous tasks

  **Acceptance Criteria**:

  **Automated Verification (using playwright skill)**:

  ```
  1. Start dev server in background: npm run dev
  2. Navigate to: http://localhost:5173/debug/animations
  3. Wait for: Page load complete
  4. For each animation type in dropdown:
     a. Select animation type
     b. Click Play button
     c. Wait 2 seconds
     d. Assert: No console errors
  5. Toggle: Loop checkbox ON
  6. Wait: 5 seconds (should see animation repeat)
  7. Change: Ally Pokemon selector to different Pokemon
  8. Assert: Sprite changes
  9. Screenshot: .sisyphus/evidence/final-animation-test.png
  ```

  **CLI Verification (using Bash)**:

  ```bash
  npm run test:run
  # Assert: All tests pass

  npm run check
  # Assert: No TypeScript errors

  npm run build
  # Assert: Build succeeds
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                                         | Files                                | Verification                   |
| ---------- | --------------------------------------------------------------- | ------------------------------------ | ------------------------------ |
| 1          | `feat(battle): add sprite effect helpers to AnimationEngine`    | animation-engine.ts                  | npm run check                  |
| 2          | `feat(battle): implement distinct physical move animations`     | physical.ts                          | npm run check                  |
| 3          | `feat(battle): implement distinct special move animations`      | special.ts                           | npm run check                  |
| 4          | `feat(battle): add status move animations`                      | status.ts                            | npm run check                  |
| 4B         | `feat(battle): add environmental and transformation animations` | environmental.ts                     | npm run check                  |
| 5          | `feat(debug): add animation test page at /debug/animations`     | AnimationTestPage.svelte, App.svelte | npm run check                  |
| 6          | `test(battle): set up animation test infrastructure`            | animations.test.ts                   | npm run test:run               |
| 7          | `test(battle): add comprehensive animation unit tests`          | animations.test.ts                   | npm run test:run               |
| 8          | `refactor(battle): remove legacy battle-animations.ts`          | multiple                             | npm run check && npm run build |

---

## Success Criteria

### Verification Commands

```bash
npm run check        # Expected: No errors
npm run test:run     # Expected: All tests pass
npm run build        # Expected: Build succeeds
```

### Final Checklist

- [ ] All 20 animation categories have distinct visual implementations
- [ ] Test page loads at `/debug/animations`
- [ ] Each animation type selectable and playable
- [ ] Loop toggle functional
- [ ] Pokemon selectors functional
- [ ] All unit tests pass
- [ ] Legacy file deleted
- [ ] No TypeScript errors
- [ ] Production build succeeds
