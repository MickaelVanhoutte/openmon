# Move Animation System Overhaul

## TL;DR

> **Quick Summary**: Complete architectural overhaul of the move animation system, porting Pokemon Showdown's battle-tested animation engine (adapted to GSAP) with a new container-relative positioning system and full animation implementations for all 505 moves.
>
> **Deliverables**:
>
> - New animation engine with Showdown-inspired architecture
> - Container-relative positioning system (fixing inaccuracy issues)
> - Animation definitions for all 505 moves in the game
> - Extended effect sprite library (new assets)
> - Support for double/multi battles, field effects, and transformations
> - Full TDD test suite for animation engine
>
> **Estimated Effort**: XL (Major system rewrite + 505 move implementations)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Engine Architecture → Positioning System → Effect System → Move Implementations → Integration

---

## Context

### Original Request

User wants the move animations to look like a real Pokemon game. Current issues:

1. Inaccurate positioning (Pokemon move to wrong locations)
2. Move effects aren't visually appealing
3. Current GSAP animations are hand-coded and inconsistent

### Interview Summary

**Key Discussions**:

- Scope: All ~505 moves in game, but extensible for future additions
- Port Pokemon Showdown's animation system (MIT licensed, 33,000+ lines of battle-tested code)
- Keep GSAP as animation library (convert Showdown's jQuery to GSAP)
- Add new effect assets for visual quality
- Include double/multi battles, field effects, transformations
- TDD approach with Vitest
- Complete overhaul in one plan (not phased)

**Research Findings**:

- Pokemon Showdown uses x/y/z 3D coordinate system for pseudo-depth
- Physical moves: ballistic arcs, wind-up, impact, recoil patterns
- Special moves: charge, projectile, trail particles, explosion
- Status moves: shake, icons, color overlays
- Custom easing: ballistic, quadUp, quadDown, swing
- Current system: 7 animation types, 1,122 lines, uses `getBoundingClientRect()` (source of inaccuracy)

### Self-Analysis (Gap Check)

**Identified Gaps** (addressed in plan):

1. **Effect asset sourcing**: Need to identify where new assets come from → Plan includes asset audit and sourcing task
2. **Migration strategy**: Old animation code coexists during development → Plan includes fallback mechanism
3. **Performance monitoring**: 505 animations could impact performance → Plan includes performance testing task
4. **Sound synchronization**: Animations should sync with sounds → Plan includes audio integration task
5. **Battle context awareness**: Animations must respect battle state → Plan includes context integration

---

## Work Objectives

### Core Objective

Replace the current inaccurate, visually basic animation system with a Pokemon Showdown-inspired engine that delivers authentic Pokemon game feel with pixel-perfect positioning and polished effects.

### Concrete Deliverables

1. `src/js/battle/animations/animation-engine.ts` - New GSAP-based animation engine
2. `src/js/battle/animations/position-system.ts` - Container-relative positioning
3. `src/js/battle/animations/effect-pool.ts` - Effect sprite pooling system
4. `src/js/battle/animations/easing.ts` - Pokemon-style easing functions
5. `src/js/battle/animations/moves/*.ts` - Move animation definitions (organized by type)
6. `src/assets/battle/fx/` - Expanded effect sprite library
7. Updated `Battle.svelte` integration

### Definition of Done

- [x] `npm run test:run` passes with all new animation tests
- [x] All 505 moves have animation definitions
- [x] Manual play-through shows accurate positioning (no "wrong location" bugs)
- [x] Visual quality matches Gen 4-5 Pokemon games
- [x] Double battle animations work correctly
- [x] Field effect animations (weather, terrain) work correctly
- [x] Build succeeds: `npm run build`

### Must Have

- Container-relative positioning (not viewport-dependent)
- All 7 current animation types preserved + new patterns
- Backward compatibility with existing battle flow
- Effect pooling for performance
- Extensible move animation registration

### Must NOT Have (Guardrails)

- NO viewport-based calculations (`getBoundingClientRect()` for positioning)
- NO magic numbers for offsets (use calculated or configurable values)
- NO blocking animations (all async with proper sequencing)
- NO jQuery dependencies (pure GSAP + vanilla JS)
- NO hardcoded sprite dimensions (read from metadata or config)
- NO changes to battle logic (animations are visual only)

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest configured)
- **User wants tests**: TDD
- **Framework**: Vitest

### TDD Structure

Each animation engine component follows RED-GREEN-REFACTOR:

**For Engine Components:**

1. **RED**: Write failing test for positioning/timing/effect behavior
2. **GREEN**: Implement minimum code to pass
3. **REFACTOR**: Clean up while keeping tests green

**For Move Animations:**

- Unit tests for animation config validation
- Integration tests for animation execution (mocked GSAP timeline)
- Visual regression via Playwright snapshots (optional, if time permits)

**Test Commands:**

```bash
# Run all animation tests
npm run test:run -- src/js/__tests__/battle/animations/

# Run specific test file
npm run test:run -- src/js/__tests__/battle/animations/animation-engine.test.ts

# Watch mode during development
npm run test -- src/js/__tests__/battle/animations/
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Research & Download Showdown Assets
├── Task 2: Design Animation Engine Architecture
└── Task 3: Create Test Infrastructure

Wave 2 (After Wave 1):
├── Task 4: Implement Positioning System (depends: 2)
├── Task 5: Implement Easing Functions (depends: 2)
└── Task 6: Implement Effect Pool (depends: 2)

Wave 3 (After Wave 2):
├── Task 7: Implement Core Animation Engine (depends: 4, 5, 6)
├── Task 8: Port Physical Move Animations (depends: 7)
├── Task 9: Port Special Move Animations (depends: 7)
├── Task 10: Port Status Move Animations (depends: 7)
└── Task 11: Implement "Other" Category Animations (depends: 7)

Wave 4 (After Wave 3):
├── Task 12: Integrate with Battle.svelte (depends: 1, 7, 8, 9, 10, 11)
├── Task 13: Audio Synchronization (depends: 12)
├── Task 14: Double/Multi Battle Support (depends: 12)
├── Task 15: Field Effects & Transformations (depends: 12)
└── Task 16: Performance Testing & Optimization (depends: 12)

Critical Path: Task 2 → Task 4/5/6 → Task 7 → Task 8-11 → Task 12
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On         | Blocks           | Can Parallelize With |
| ---- | ------------------ | ---------------- | -------------------- |
| 1    | None               | 7, 8, 9, 10, 11  | 2, 3                 |
| 2    | None               | 4, 5, 6          | 1, 3                 |
| 3    | None               | 4, 5, 6, 7       | 1, 2                 |
| 4    | 2, 3               | 7                | 5, 6                 |
| 5    | 2, 3               | 7                | 4, 6                 |
| 6    | 2, 3               | 7                | 4, 5                 |
| 7    | 4, 5, 6            | 8, 9, 10, 11, 12 | None                 |
| 8    | 1, 7               | 12               | 9, 10, 11            |
| 9    | 1, 7               | 12               | 8, 10, 11            |
| 10   | 1, 7               | 12               | 8, 9, 11             |
| 11   | 1, 7               | 12               | 8, 9, 10             |
| 12   | 1, 7, 8, 9, 10, 11 | 13, 14, 15, 16   | None                 |
| 13   | 12                 | None             | 14, 15, 16           |
| 14   | 12                 | None             | 13, 15, 16           |
| 15   | 12                 | None             | 13, 14, 16           |
| 16   | 12                 | None             | 13, 14, 15           |

### Agent Dispatch Summary

| Wave | Tasks              | Recommended Agents                                              |
| ---- | ------------------ | --------------------------------------------------------------- |
| 1    | 1, 2, 3            | librarian (research), oracle (architecture), quick (test setup) |
| 2    | 4, 5, 6            | unspecified-high (systems work)                                 |
| 3    | 7, 8, 9, 10, 11    | unspecified-high (engine), writing (move definitions - bulk)    |
| 4    | 12, 13, 14, 15, 16 | visual-engineering (integration), unspecified-high (features)   |

---

## TODOs

### Wave 1: Foundation

- [x] 1. Research & Download Pokemon Showdown Animation Assets

  **What to do**:
  - Clone/download Pokemon Showdown client repository
  - Extract `battle-animations.ts` and `battle-animations-moves.ts`
  - Analyze their effect sprite library (`/fx/` folder)
  - Document their animation patterns and easing functions
  - Identify which Showdown effects we need to add to our `/assets/battle/fx/`
  - Download/acquire needed effect sprites (respecting MIT license)

  **Must NOT do**:
  - Copy code verbatim without adaptation
  - Include copyrighted Nintendo assets
  - Download more than needed (be selective)

  **Recommended Agent Profile**:
  - **Category**: N/A (use subagent directly)
  - **Subagent**: `librarian`
  - **Skills**: None required
    - librarian has web search and github access

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 7, 8, 9, 10, 11 (need assets and patterns)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/battle-animations.ts` - Current animation system to understand what we're replacing

  **External References**:
  - Pokemon Showdown client: `https://github.com/smogon/pokemon-showdown-client`
  - Key file: `src/battle-animations.ts` in Showdown repo
  - Key file: `src/battle-animations-moves.ts` in Showdown repo (33,000+ lines of move definitions)

  **WHY Each Reference Matters**:
  - Showdown's battle-animations.ts shows their core engine architecture
  - battle-animations-moves.ts contains production-tested definitions for ALL Pokemon moves
  - Their `/fx/` folder has the effect sprites we may need to add

  **Acceptance Criteria**:

  **TDD**:
  - N/A (research task)

  **Automated Verification**:

  ```bash
  # Verify research deliverables exist
  ls -la .sisyphus/research/showdown-analysis.md
  # Should contain: animation patterns, easing functions, asset list

  ls -la src/assets/battle/fx/
  # Should have new effect sprites added (count > current ~50)
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/research/showdown-analysis.md` with documented patterns
  - [ ] List of new effect sprites added to project
  - [ ] Mapping of Showdown effects to our equivalent

  **Commit**: YES
  - Message: `feat(animations): add showdown research and new effect sprites`
  - Files: `.sisyphus/research/showdown-analysis.md`, `src/assets/battle/fx/*`
  - Pre-commit: `npm run lint`

---

- [x] 2. Design Animation Engine Architecture

  **What to do**:
  - Design the new animation engine class structure
  - Define TypeScript interfaces for:
    - `Position` (x, y, z, scale, opacity)
    - `AnimationConfig` (move definition shape)
    - `EffectConfig` (effect sprite config)
    - `EasingType` (ballistic, quadUp, quadDown, swing, linear)
  - Design the container-relative coordinate system
  - Plan the BattleScene abstraction (Pokemon positions, screen bounds)
  - Document architecture in markdown for executor reference
  - Consult Oracle agent for architecture validation

  **Must NOT do**:
  - Implement actual code (design only)
  - Modify existing files
  - Over-engineer beyond immediate needs

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex architecture decisions requiring deep analysis
  - **Skills**: None required
    - Architecture design is reasoning-heavy, no specific skill needed
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Design, not UI work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4, 5, 6 (positioning, easing, effects depend on architecture)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/battle-animations.ts:1-50` - Current architecture to understand
  - `src/js/context/battleContext.ts` - How battle state is managed (context pattern)

  **Type References**:
  - `src/js/pokemons/pokedex.ts:Move` - Move type definition
  - `src/js/pokemons/pokedex.ts:MoveEffect` - Move effect enum

  **External References**:
  - Pokemon Showdown: `battle-animations.ts` - Their BattleScene class architecture

  **WHY Each Reference Matters**:
  - battle-animations.ts shows current 7 animation types (dash, toTarget, etc.) - must preserve or evolve
  - battleContext.ts shows how battle state flows - animation engine must integrate
  - Showdown's BattleScene is the reference architecture to adapt

  **Acceptance Criteria**:

  **TDD**:
  - N/A (design task - no code)

  **Automated Verification**:

  ```bash
  # Verify architecture document exists and has content
  wc -l .sisyphus/research/animation-architecture.md
  # Should be > 100 lines with detailed design

  grep -c "interface" .sisyphus/research/animation-architecture.md
  # Should find multiple interface definitions
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/research/animation-architecture.md` with full design
  - [ ] TypeScript interfaces (in doc, ready to copy)
  - [ ] Coordinate system diagram or explanation
  - [ ] BattleScene abstraction design

  **Commit**: YES
  - Message: `docs(animations): add animation engine architecture design`
  - Files: `.sisyphus/research/animation-architecture.md`
  - Pre-commit: None (markdown only)

---

- [x] 3. Create Animation Test Infrastructure

  **What to do**:
  - Create test directory: `src/js/__tests__/battle/animations/`
  - Set up test utilities for mocking GSAP timelines
  - Create test fixtures for:
    - Mock Pokemon positions
    - Mock battle container dimensions
    - Mock effect sprites
  - Write example test showing TDD pattern for animations
  - Ensure tests can run in jsdom environment

  **Must NOT do**:
  - Write actual animation implementation
  - Modify vitest.config.ts unless necessary
  - Create overly complex test utilities

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Test setup is straightforward boilerplate
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - All: Simple file creation task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4, 5, 6, 7 (all need test infrastructure)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/__tests__/pokedex.test.ts` - Existing test pattern in project
  - `vitest.config.ts` - Current test configuration

  **External References**:
  - GSAP testing: `https://greensock.com/docs/v3/GSAP/gsap.globalTimeline`

  **WHY Each Reference Matters**:
  - Existing tests show project's testing conventions (describe/it, expect)
  - GSAP's globalTimeline can be paused/controlled for deterministic tests

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file created: `src/js/__tests__/battle/animations/setup.test.ts`
  - [ ] Tests verify mock utilities work
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- src/js/__tests__/battle/animations/
  # Expected: 1+ tests passing
  ```

  **Evidence to Capture**:
  - [ ] Test output showing passes
  - [ ] List of created test utility files

  **Commit**: YES
  - Message: `test(animations): add animation test infrastructure`
  - Files: `src/js/__tests__/battle/animations/*`
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/`

---

### Wave 2: Core Systems

- [x] 4. Implement Container-Relative Positioning System

  **What to do**:
  - Create `src/js/battle/animations/position-system.ts`
  - Implement `BattlePositionSystem` class:
    - `setContainer(element: HTMLElement)` - Bind to `.wrapper` element in Battle.svelte as reference frame
    - `setContainerBounds(width: number, height: number)` - Set reference frame dimensions
    - `pokemonPosition(slot: number, side: 'player' | 'opponent')` - Get position using index-based slots (matching existing `playerSide[index]` pattern)
    - `toScreenCoords(pos: Position)` - Convert abstract to pixels within container
    - `behind(pos: Position, distance: number)` - Calculate "behind" position (z-axis)
  - **Container Reference**: Use `.wrapper` element (not `.battle` or `.battle-bg`) as the coordinate reference frame
  - Use percentage-based positioning within container
  - Support single AND double battle layouts
  - Add z-depth calculation for pseudo-3D effects
  - Write comprehensive tests first (TDD)

  **Must NOT do**:
  - Use `getBoundingClientRect()` for positioning
  - Use `window.innerWidth` or viewport dimensions
  - Hardcode pixel values (use percentages or config)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Systems programming requiring careful coordinate math
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not UI work, it's math/geometry

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 7 (engine needs positioning)
  - **Blocked By**: Tasks 2 (architecture), 3 (tests)

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/battle-animations.ts:animateMove()` - Current positioning logic to replace
  - `.sisyphus/research/animation-architecture.md` - Architecture design (from Task 2)

  **External References**:
  - Pokemon Showdown positioning: Their `pos()` and `posT()` functions

  **WHY Each Reference Matters**:
  - Current animateMove shows what's broken (getBoundingClientRect usage)
  - Showdown's pos() is the reference for how to do it correctly

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file created: `src/js/__tests__/battle/animations/position-system.test.ts`
  - [ ] Tests cover: single battle positions, double battle positions, z-depth calculations
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/position-system.test.ts` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- src/js/__tests__/battle/animations/position-system.test.ts
  # Expected: All tests pass (8+ test cases)

  # Verify no viewport dependencies
  grep -r "getBoundingClientRect\|window.innerWidth\|window.innerHeight" src/js/battle/animations/position-system.ts
  # Expected: No matches (exit code 1)
  ```

  **Evidence to Capture**:
  - [ ] Test output showing all position tests pass
  - [ ] Grep output confirming no viewport dependencies

  **Commit**: YES
  - Message: `feat(animations): add container-relative positioning system`
  - Files: `src/js/battle/animations/position-system.ts`, `src/js/__tests__/battle/animations/position-system.test.ts`
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/position-system.test.ts`

---

- [x] 5. Implement Pokemon-Style Easing Functions

  **What to do**:
  - Create `src/js/battle/animations/easing.ts`
  - Implement GSAP-compatible easing functions:
    - `ballistic` - Parabolic arc (for physical attacks jumping to target)
    - `ballistic2` - Double parabola (attack + return arc)
    - `quadUp` - Deceleration (sqrt curve)
    - `quadDown` - Acceleration (square curve)
    - `swing` - Oscillating return (for knockback recovery)
    - `accel` / `decel` - Simple acceleration/deceleration
  - Register as GSAP custom eases
  - Write tests for each easing curve

  **Must NOT do**:
  - Modify GSAP core
  - Create complex dependencies
  - Deviate from Showdown's proven easing math

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Mathematical functions requiring precision
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Task 7 (engine needs easing)
  - **Blocked By**: Tasks 2 (architecture), 3 (tests)

  **References**:

  **Pattern References**:
  - `.sisyphus/research/showdown-analysis.md` - Easing function documentation (from Task 1)

  **External References**:
  - GSAP CustomEase: `https://greensock.com/docs/v3/Eases/CustomEase`
  - Pokemon Showdown easing: Their `$.easing` extensions

  **WHY Each Reference Matters**:
  - Showdown's easing math is battle-tested for Pokemon feel
  - GSAP CustomEase is the extension point for custom curves

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file: `src/js/__tests__/battle/animations/easing.test.ts`
  - [ ] Tests verify: ballistic peaks at 0.5, quadUp/quadDown curves, swing oscillation
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/easing.test.ts` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- src/js/__tests__/battle/animations/easing.test.ts
  # Expected: 6+ tests pass (one per easing type)
  ```

  **Evidence to Capture**:
  - [ ] Test output for all easing functions

  **Commit**: YES
  - Message: `feat(animations): add pokemon-style easing functions`
  - Files: `src/js/battle/animations/easing.ts`, `src/js/__tests__/battle/animations/easing.test.ts`
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/easing.test.ts`

---

- [x] 6. Implement Effect Sprite Pool System

  **What to do**:
  - Create `src/js/battle/animations/effect-pool.ts`
  - Implement `EffectPool` class:
    - Pre-load effect sprite images
    - Pool DOM elements for reuse (avoid create/destroy overhead)
    - `acquire(effectName: string): HTMLImageElement` - Get pooled element
    - `release(element: HTMLImageElement)` - Return to pool
    - `preload(effectNames: string[])` - Warm the cache
  - **Pool Configuration**:
    - Max 20 elements per effect type
    - LRU eviction when pool is full
    - Automatic cleanup on battle end
  - Create effect manifest: `src/js/battle/animations/effect-manifest.ts`
    - Map effect names to sprite paths and dimensions
    - Define spritesheet format: horizontal strips, frame dimensions per effect
  - Support sprite sheet frame extraction using CSS `backgroundPosition`

  **Must NOT do**:
  - Load all effects upfront (lazy load)
  - Create memory leaks (proper cleanup)
  - Block main thread during preload

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Performance-critical pooling system
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 7 (engine needs effects)
  - **Blocked By**: Tasks 2 (architecture), 3 (tests)

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/battle-animations.ts:createSpriteElement()` - Current sprite creation
  - `src/assets/battle/fx/` - Effect sprite files

  **WHY Each Reference Matters**:
  - Current createSpriteElement shows what we're optimizing (creates new elements)
  - Asset folder shows available effects for manifest

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file: `src/js/__tests__/battle/animations/effect-pool.test.ts`
  - [ ] Tests verify: acquire returns element, release returns to pool, preload caches
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/effect-pool.test.ts` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- src/js/__tests__/battle/animations/effect-pool.test.ts
  # Expected: 5+ tests pass
  ```

  **Evidence to Capture**:
  - [ ] Test output for pool operations

  **Commit**: YES
  - Message: `feat(animations): add effect sprite pooling system`
  - Files: `src/js/battle/animations/effect-pool.ts`, `src/js/battle/animations/effect-manifest.ts`, tests
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/effect-pool.test.ts`

---

### Wave 3: Engine & Move Animations

- [x] 7. Implement Core Animation Engine

  **What to do**:
  - Create `src/js/battle/animations/animation-engine.ts`
  - Implement `AnimationEngine` class:
    - Constructor takes battle container reference
    - `playMove(moveName: string, attacker: PokemonSprite, defender: PokemonSprite): Promise<void>`
    - `showEffect(effectName: string, position: Position, config: EffectConfig): Promise<void>`
    - `backgroundEffect(color: string, duration: number, opacity: number): Promise<void>`
    - `shake(target: PokemonSprite, intensity: number, duration: number): Promise<void>`
    - `wait(ms: number): Promise<void>`
  - Use GSAP timelines for sequencing
  - Integrate positioning system, easing, and effect pool
  - Create `MoveAnimation` type for move definitions
  - Implement fallback for unmapped moves with category-based generic animations:
    - **Physical fallback**: dash to target + impact effect + return (like Tackle)
    - **Special fallback**: beam/projectile from attacker to target + explosion effect
    - **Status fallback**: self-sparkle effect + stat arrow (up for buff, down for debuff)

  **Must NOT do**:
  - Block the main thread
  - Throw on missing move animation (fallback instead)
  - Couple to Battle.svelte implementation details

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core engine implementation requiring integration of multiple systems
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Wave 2)
  - **Blocks**: Tasks 8, 9, 10, 11, 12 (all move animations and integration)
  - **Blocked By**: Tasks 4, 5, 6 (needs positioning, easing, effects)

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/position-system.ts` - Positioning (from Task 4)
  - `src/js/battle/animations/easing.ts` - Easing (from Task 5)
  - `src/js/battle/animations/effect-pool.ts` - Effects (from Task 6)
  - `.sisyphus/research/animation-architecture.md` - Architecture (from Task 2)

  **Type References**:
  - `src/js/pokemons/pokedex.ts:MoveEffect` - Move effect enum for fallback logic

  **External References**:
  - Pokemon Showdown: BattleScene class methods

  **WHY Each Reference Matters**:
  - Wave 2 deliverables are direct dependencies
  - Architecture doc provides the class design
  - Showdown's BattleScene is the reference implementation

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file: `src/js/__tests__/battle/animations/animation-engine.test.ts`
  - [ ] Tests verify: playMove queues timeline, showEffect creates element, wait delays correctly
  - [ ] Tests verify: fallback animation works for unknown moves
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/animation-engine.test.ts` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- src/js/__tests__/battle/animations/animation-engine.test.ts
  # Expected: 10+ tests pass

  # Verify engine integrates all systems
  grep -E "PositionSystem|EffectPool|ballistic|quadUp" src/js/battle/animations/animation-engine.ts
  # Expected: Matches found (integration verified)
  ```

  **Evidence to Capture**:
  - [ ] Test output
  - [ ] Grep showing system integration

  **Commit**: YES
  - Message: `feat(animations): add core animation engine`
  - Files: `src/js/battle/animations/animation-engine.ts`, tests
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/`

---

- [x] 8. Port Physical Move Animations

  **What to do**:
  - Create `src/js/battle/animations/moves/physical.ts`
  - Port physical move animations from Showdown (adapted to our engine):
    - Contact moves: tackle, slash, punch, kick patterns
    - Ballistic arcs for approach and return
    - Impact effects at point of contact
    - Defender recoil/knockback
  - Estimate ~150-180 physical moves
  - Group similar moves with shared base animations
  - Use move power/type for effect intensity scaling

  **Must NOT do**:
  - Implement each move from scratch (use patterns)
  - Copy Showdown code verbatim (adapt to our engine)
  - Create 150 separate functions (use config + templates)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Bulk implementation requiring pattern application
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11)
  - **Blocks**: Task 12 (integration needs moves)
  - **Blocked By**: Tasks 1 (research), 7 (engine)

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/animation-engine.ts` - Engine API (from Task 7)
  - `.sisyphus/research/showdown-analysis.md` - Physical move patterns (from Task 1)

  **Data References**:
  - `src/assets/data/raw/moves/moves.json` - Full move list with categories

  **WHY Each Reference Matters**:
  - Engine provides the API for animations
  - Showdown analysis has the physical move patterns to port
  - moves.json identifies which moves are physical category

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file: `src/js/__tests__/battle/animations/moves/physical.test.ts`
  - [ ] Tests verify: tackle animation executes, slash has correct slash effect, punch impacts correctly
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/moves/physical.test.ts` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- src/js/__tests__/battle/animations/moves/physical.test.ts

  # Count implemented physical moves
  grep -c "export const" src/js/battle/animations/moves/physical.ts
  # Expected: 150+ move definitions
  ```

  **Evidence to Capture**:
  - [ ] Test output
  - [ ] Count of implemented moves

  **Commit**: YES
  - Message: `feat(animations): add physical move animations`
  - Files: `src/js/battle/animations/moves/physical.ts`, tests
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/moves/`

---

- [x] 9. Port Special Move Animations

  **What to do**:
  - Create `src/js/battle/animations/moves/special.ts`
  - Port special move animations from Showdown:
    - Beam attacks: projectile from attacker to defender
    - Elemental effects: fire, water, electric, etc.
    - Charge-up phases for powerful moves
    - Trail particles and explosions
  - Estimate ~170-200 special moves
  - Type-based coloring and effects
  - Power-based effect scaling

  **Must NOT do**:
  - Implement each move from scratch
  - Miss type-specific visual treatments
  - Ignore signature moves (they need unique animations)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Bulk implementation with visual complexity
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 10, 11)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 1, 7

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/animation-engine.ts` - Engine API
  - `.sisyphus/research/showdown-analysis.md` - Special move patterns
  - `src/js/battle/animations/battle-animations.ts:TYPE_HUE_ANGLES` - Type colorization

  **WHY Each Reference Matters**:
  - Engine API for creating animations
  - Showdown patterns for special moves (beams, bursts, etc.)
  - TYPE_HUE_ANGLES should be preserved for consistent type coloring

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file: `src/js/__tests__/battle/animations/moves/special.test.ts`
  - [ ] Tests verify: flamethrower has fire particles, thunderbolt has electric effect
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/moves/special.test.ts` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- src/js/__tests__/battle/animations/moves/special.test.ts

  grep -c "export const" src/js/battle/animations/moves/special.ts
  # Expected: 170+ move definitions
  ```

  **Commit**: YES
  - Message: `feat(animations): add special move animations`
  - Files: `src/js/battle/animations/moves/special.ts`, tests
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/moves/`

---

- [x] 10. Port Status Move Animations

  **What to do**:
  - Create `src/js/battle/animations/moves/status.ts`
  - Port status move animations from Showdown:
    - Stat boost/drop: arrows, sparkles, aura effects
    - Status conditions: poison bubbles, burn flames, sleep Zs, etc.
    - Recovery moves: healing sparkles, HP restoration effect
    - Protection moves: shields, barriers
    - Weather/terrain setup moves
  - Estimate ~100-130 status moves
  - Use color coding for buff (blue/green) vs debuff (red/orange)

  **Must NOT do**:
  - Use generic "status" animation for all (differentiate)
  - Miss iconic status animations (swords dance, dragon dance, etc.)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Varied animation types requiring careful categorization
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 11)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 1, 7

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/animation-engine.ts` - Engine API
  - `.sisyphus/research/showdown-analysis.md` - Status move patterns
  - `src/assets/battle/fx/buff-sprite.png`, `debuff-sprite.png` - Existing status effects

  **WHY Each Reference Matters**:
  - Existing buff/debuff sprites can be reused
  - Showdown has patterns for all status move categories

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file: `src/js/__tests__/battle/animations/moves/status.test.ts`
  - [ ] Tests verify: swords-dance shows swords, recover shows healing, toxic shows poison
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/moves/status.test.ts` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- src/js/__tests__/battle/animations/moves/status.test.ts

  grep -c "export const" src/js/battle/animations/moves/status.ts
  # Expected: 100+ move definitions
  ```

  **Commit**: YES
  - Message: `feat(animations): add status move animations`
  - Files: `src/js/battle/animations/moves/status.ts`, tests
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/moves/`

---

- [x] 11. Implement "Other" Category Move Animations

  **What to do**:
  - Create `src/js/battle/animations/moves/other.ts`
  - Handle edge case moves:
    - Multi-hit moves (with hit counter display)
    - OHKO moves (dramatic full-screen effects)
    - Self-destruct/explosion (screen flash + fade out)
    - Transform (morph effect)
    - Field moves (entry hazards visual)
    - Sound-based moves (visual representation of sound waves)
    - **ComboMove animations** (partner Pokemon entry + coordinated dual attacks) - see `src/js/pokemons/pokedex.ts:ComboMove` class
  - Create index file: `src/js/battle/animations/moves/index.ts`
    - Aggregate all move animations into single registry
    - Export `getMoveAnimation(moveName: string): MoveAnimation`

  **Must NOT do**:
  - Leave any of the 505 moves without at least a fallback
  - Create broken animation for edge cases

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Edge cases require careful handling
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 10)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 1, 7

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/moves/physical.ts` - Pattern for move registry
  - `.sisyphus/research/showdown-analysis.md` - Special case patterns

  **Data References**:
  - `src/assets/data/raw/moves/moves.json` - Identify "other" category moves

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file: `src/js/__tests__/battle/animations/moves/other.test.ts`
  - [ ] Test file: `src/js/__tests__/battle/animations/moves/index.test.ts`
  - [ ] Tests verify: getMoveAnimation returns animation for all 505 moves (no undefined)
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/moves/` → PASS (all move tests)

  **Automated Verification**:

  ```bash
  npm run test:run -- src/js/__tests__/battle/animations/moves/
  # Expected: All move animation tests pass

  # Verify all 505 moves have coverage
  # (Test in index.test.ts should iterate all moves from pokedex and verify each has animation)
  ```

  **Commit**: YES
  - Message: `feat(animations): add other category and move index`
  - Files: `src/js/battle/animations/moves/other.ts`, `src/js/battle/animations/moves/index.ts`, tests
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/moves/`

---

### Wave 4: Integration & Polish

- [x] 12. Integrate Animation Engine with Battle.svelte

  **What to do**:
  - Update `src/lib/battle/Battle.svelte`:
    - Replace current animation trigger with new engine
    - Pass container reference to engine
    - Create Pokemon sprite wrappers for engine interface
  - Create adapter layer if needed for gradual migration
  - Ensure `animateAttack` store still works (for compatibility)
  - Test with actual battle to verify positioning accuracy
  - Remove old animation code once verified

  **Must NOT do**:
  - Break existing battle flow
  - Remove old code before new code is verified
  - Change battle logic (animations are visual only)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Svelte component integration with visual verification
  - **Skills**: `frontend-ui-ux`
    - Reason: UI integration work

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (critical integration point)
  - **Blocks**: Tasks 13, 14, 15, 16
  - **Blocked By**: Tasks 1, 7, 8, 9, 10, 11 (needs assets from Task 1)

  **References**:

  **Pattern References**:
  - `src/lib/battle/Battle.svelte` - Current animation integration point
  - `src/js/context/battleContext.ts:animateAttack` - Store trigger
  - `src/js/battle/animations/animation-engine.ts` - New engine (from Task 7)

  **WHY Each Reference Matters**:
  - Battle.svelte is where animations are triggered from stores
  - animateAttack store is the interface between battle logic and visuals
  - New engine needs to be wired in place of old functions

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Integration test: `src/js/__tests__/battle/animations/integration.test.ts`
  - [ ] Tests verify: animateAttack store trigger calls new engine
  - [ ] Tests verify: `battleContext.events.animateAttack.subscribe()` pattern still works
  - [ ] Tests verify: ComboMove animations work (partner entry + dual attacks)
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/integration.test.ts` → PASS

  **Automated Verification (Playwright browser)**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to: http://localhost:5173
  2. Start a battle (or load battle test scenario)
  3. Trigger a move (e.g., Tackle)
  4. Observe: Pokemon moves to correct position (not wrong location)
  5. Observe: Effect plays at correct location
  6. Screenshot: .sisyphus/evidence/task-12-tackle-animation.png
  7. Trigger special move (e.g., Flamethrower)
  8. Screenshot: .sisyphus/evidence/task-12-flamethrower-animation.png
  ```

  **Evidence to Capture**:
  - [ ] Test output
  - [ ] Screenshots of working animations
  - [ ] Confirmation: no "wrong location" bugs

  **Commit**: YES
  - Message: `feat(animations): integrate new animation engine with Battle.svelte`
  - Files: `src/lib/battle/Battle.svelte`, tests
  - Pre-commit: `npm run test:run && npm run check`

---

- [x] 13. Audio Synchronization

  **What to do**:
  - Create `src/js/battle/animations/audio-sync.ts`
  - Integrate with existing Howler.js audio system
  - Define audio cue points in move animations:
    - Impact sounds at contact point
    - Charge-up sounds before projectile
    - Type-specific ambient sounds
  - Add `playSound(soundId: string, options?: SoundOptions)` to engine
  - Map moves to appropriate sound effects

  **Must NOT do**:
  - Create new sound assets (use existing)
  - Block animation for sound loading
  - Make sounds too loud or jarring

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Audio timing integration
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 14, 15, 16)
  - **Blocks**: None
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - Find existing Howler.js usage in codebase (grep for Howler/howl)
  - `src/js/battle/animations/animation-engine.ts` - Engine to extend

  **Acceptance Criteria**:

  **Automated Verification (Playwright browser)**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to battle
  2. Trigger move
  3. Verify: Sound plays (check Howler state or audio element)
  4. Verify: Sound timing matches animation impact point
  ```

  **Commit**: YES
  - Message: `feat(animations): add audio synchronization`
  - Files: `src/js/battle/animations/audio-sync.ts`
  - Pre-commit: `npm run check`

---

- [x] 14. Double/Multi Battle Animation Support

  **What to do**:
  - Extend positioning system for 4-Pokemon layouts
  - Use index-based slot system (matching existing `playerSide[index]`, `opponentSide[index]` pattern)
  - Add helper function: `getSlotPosition(side: 'player' | 'opponent', index: number): Position`
  - Update animations to support:
    - Moves hitting single target (select which)
    - Moves hitting multiple targets (spread moves)
    - Moves hitting all opponents (e.g., Earthquake)
    - Moves hitting allies (support moves)
  - Test double battle scenario end-to-end

  **Must NOT do**:
  - Break single battle (must work for both)
  - Assume all moves hit one target

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex targeting logic
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13, 15, 16)
  - **Blocks**: None
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - `src/js/battle/animations/position-system.ts` - Extend for double battle
  - Pokemon Showdown double battle positioning

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file: `src/js/__tests__/battle/animations/double-battle.test.ts`
  - [ ] Tests verify: 4 Pokemon positions calculated, spread move hits all targets
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/double-battle.test.ts` → PASS

  **Commit**: YES
  - Message: `feat(animations): add double/multi battle support`
  - Files: Position system updates, tests
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/`

---

- [x] 15. Field Effects & Transformation Animations

  **What to do**:
  - Create `src/js/battle/animations/field-effects.ts`:
    - Weather: rain, sun, sandstorm, hail, snow
    - Terrain: grassy, electric, psychic, misty
    - Entry hazards: spikes, stealth rock, toxic spikes
  - Create `src/js/battle/animations/transformations.ts`:
    - Mega Evolution (if applicable)
    - Z-Move activation (if applicable)
    - Dynamax/Gigantamax (if applicable)
    - Regular Transform move
  - Integrate with battle state (weather/terrain should persist visually)

  **Must NOT do**:
  - Implement features not in the game (check what's supported)
  - Create overly intensive background effects (performance)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Visual effects requiring creative approach
  - **Skills**: `frontend-ui-ux`
    - Reason: Visual polish work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13, 14, 16)
  - **Blocks**: None
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - `src/js/context/battleContext.ts` - Check for weather/terrain state
  - Pokemon Showdown field effect implementations

  **Acceptance Criteria**:

  **TDD**:
  - [ ] Test file: `src/js/__tests__/battle/animations/field-effects.test.ts`
  - [ ] Tests verify: weather animation plays, terrain overlay appears
  - [ ] `npm run test:run -- src/js/__tests__/battle/animations/field-effects.test.ts` → PASS

  **Commit**: YES
  - Message: `feat(animations): add field effects and transformations`
  - Files: Field effects, transformations, tests
  - Pre-commit: `npm run test:run -- src/js/__tests__/battle/animations/`

---

- [x] 16. Performance Testing & Optimization

  **What to do**:
  - Create performance benchmarks:
    - Animation frame rate during complex moves
    - Memory usage with effect pooling
    - Load time for effect sprites
  - Profile animation engine in Chrome DevTools
  - Optimize any bottlenecks found:
    - Effect pool sizing
    - Timeline cleanup
    - Sprite sheet optimization
  - Document performance characteristics

  **Must NOT do**:
  - Premature optimization
  - Break functionality for performance
  - Ignore mobile performance

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Performance analysis requiring profiling
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13, 14, 15)
  - **Blocks**: None
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - All animation files created in this plan

  **Acceptance Criteria**:

  **Automated Verification**:

  ```bash
  # Run build to ensure no bundle size explosion
  npm run build
  # Check bundle size didn't increase dramatically

  # Run all animation tests
  npm run test:run -- src/js/__tests__/battle/animations/
  # Expected: All pass, no timeouts (performance indicator)
  ```

  **Automated Verification (Playwright browser)**:

  ```
  # Agent executes via playwright browser automation:
  1. Navigate to battle
  2. Run 10 consecutive moves rapidly
  3. Observe: No frame drops, no memory leaks
  4. Check: Page doesn't become sluggish
  ```

  **Evidence to Capture**:
  - [ ] Build output size
  - [ ] Test run times
  - [ ] Performance notes in `.sisyphus/research/performance-report.md`

  **Commit**: YES
  - Message: `perf(animations): optimize animation engine performance`
  - Files: Optimized files, performance report
  - Pre-commit: `npm run build`

---

## Commit Strategy

| After Task | Message                                                               | Files                    | Verification       |
| ---------- | --------------------------------------------------------------------- | ------------------------ | ------------------ |
| 1          | `feat(animations): add showdown research and new effect sprites`      | research, assets         | `npm run lint`     |
| 2          | `docs(animations): add animation engine architecture design`          | docs                     | None               |
| 3          | `test(animations): add animation test infrastructure`                 | tests                    | `npm run test:run` |
| 4          | `feat(animations): add container-relative positioning system`         | position-system.ts       | `npm run test:run` |
| 5          | `feat(animations): add pokemon-style easing functions`                | easing.ts                | `npm run test:run` |
| 6          | `feat(animations): add effect sprite pooling system`                  | effect-pool.ts           | `npm run test:run` |
| 7          | `feat(animations): add core animation engine`                         | animation-engine.ts      | `npm run test:run` |
| 8          | `feat(animations): add physical move animations`                      | moves/physical.ts        | `npm run test:run` |
| 9          | `feat(animations): add special move animations`                       | moves/special.ts         | `npm run test:run` |
| 10         | `feat(animations): add status move animations`                        | moves/status.ts          | `npm run test:run` |
| 11         | `feat(animations): add other category and move index`                 | moves/other.ts, index.ts | `npm run test:run` |
| 12         | `feat(animations): integrate new animation engine with Battle.svelte` | Battle.svelte            | `npm run check`    |
| 13         | `feat(animations): add audio synchronization`                         | audio-sync.ts            | `npm run check`    |
| 14         | `feat(animations): add double/multi battle support`                   | position system          | `npm run test:run` |
| 15         | `feat(animations): add field effects and transformations`             | field-effects.ts         | `npm run test:run` |
| 16         | `perf(animations): optimize animation engine performance`             | various                  | `npm run build`    |

---

## Success Criteria

### Verification Commands

```bash
# All tests pass
npm run test:run

# TypeScript compiles
npm run check

# Build succeeds
npm run build

# Lint passes
npm run lint
```

### Final Checklist

- [x] All 505 moves have animation definitions (verified by index.test.ts)
- [x] Positioning is container-relative (no getBoundingClientRect for positioning)
- [x] GSAP timelines sequence correctly (no animation overlap bugs)
- [x] Effect pooling reduces DOM churn (pool.acquire/release used)
- [x] Pokemon-style easing functions implemented (ballistic, swing, etc.)
- [x] Double battle layouts work correctly
- [x] Field effects and transformations animate
- [x] Audio syncs with impacts
- [x] Performance is acceptable (no frame drops on moderate hardware)
- [x] All "Must NOT Have" guardrails respected
- [x] No regressions in existing battle functionality
