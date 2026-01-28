# Pokemon Move Effects - Full Implementation

## TL;DR

> **Quick Summary**: Implement all Pokemon move effects for Gen 3-5 mechanics, including stat changes, status conditions, weather, two-turn moves, recoil, multi-hit, binding, rampage, and protection moves. Add full field system (weather, screens, hazards, terrain, Trick Room) with UI indicators.
>
> **Deliverables**:
>
> - Complete move effect system with all effect types
> - BattleField state management (weather, screens, hazards, terrain)
> - UI indicators for field effects and volatiles
> - Damage calculation with weather/screen modifiers
> - TDD test coverage for all effect mechanics
>
> **Estimated Effort**: XL (40-60 hours)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Core Infrastructure → Status/Stats Effects → Field System → Complex Moves

---

## Context

### Original Request

> "I want ALL pokemon moves effects fully implemented and working, including stat changes, status, recoil, weather, 2 turn moves etc. the stat changes and status should be visible in the UI. Everything must work as in a real pokemon game."

### Interview Summary

**Key Discussions**:

- **Generation**: Gen 3-5 Mechanics (classic formulas, well-documented)
- **Volatiles**: Core + Common (Flinch, Infatuation, Bound, Seeded, Cursed)
- **Field**: Full Field System (Weather, Terrain, Trick Room, Screens, Hazards)
- **Move Categories**: ALL (Two-Turn, Recoil, Multi-Hit, Binding, Rampage, Protection, Priority)
- **Testing**: TDD with Vitest

**Research Findings**:

- Well-architected Action Stack pattern already exists
- Effect Strategy pattern with timing system (START_TURN, END_TURN, BEFORE/AFTER_MOVE)
- Stat stages (-6 to +6) and status badges already working in UI
- Damage calculation has TODO placeholders for weather
- Weather partially implemented (Rain Dance sets weather, Moonlight uses it)

### Gap Analysis (Self-Review)

**Identified Gaps Addressed**:

1. Switch-in hazard timing needs new EffectTiming.ON_SWITCH_IN
2. Protect stale counter (Gen 3+ uses 1/2, 1/4, 1/8 success chain)
3. Sleep/Freeze clause handling for competitive fairness
4. Multi-hit damage display in UI (show each hit)
5. Weather turn counter and auto-expire logic
6. **Test directory `src/js/__tests__/` does not exist** - Task 1 will create it
7. **EffectTiming enum exists in two locations** - Task 3 will consolidate
8. **Existing weather implementation exists** (WeatherHeal, GameContext.weather) - Task 4 will migrate
9. **Turn order is in BattleContext.sortActions()** - Task 16 reference corrected

---

## Work Objectives

### Core Objective

Implement a complete, production-ready Pokemon battle effect system following Gen 3-5 mechanics, where every move effect works correctly and field states are visible in the UI.

### Concrete Deliverables

- `src/js/pokemons/effects/` - Complete effect implementations organized by category
- `src/js/battle/battle-field.ts` - BattleField state class (weather, screens, hazards, terrain)
- `src/js/pokemons/volatile-status.ts` - Volatile status tracking system
- `src/lib/battle/FieldIndicators.svelte` - UI for weather/screens/hazards
- Updated damage calculation with all modifiers
- Move-to-effect mapping for all moves in pokedex

### Definition of Done

- [x] `npm run test:run` passes with all effect tests green
- [x] `npm run check` passes with no TypeScript errors
- [x] All moves in pokedex have working effects
- [x] Weather UI updates dynamically during battle
- [x] Status badges visible for all statuses including volatiles

### Must Have

- Gen 3-5 accurate damage formulas with weather/screen modifiers
- All stat stage changes apply correctly (-6 to +6)
- All status conditions (burn, poison, paralysis, sleep, freeze, confusion)
- Common volatiles (flinch, infatuation, bound, seeded, cursed)
- Weather system (Rain, Sun, Sand, Hail) with turn counter
- Screens (Reflect, Light Screen) with turn counter
- Entry hazards (Stealth Rock, Spikes, Toxic Spikes)
- Two-turn moves with semi-invulnerable state
- Recoil damage calculation
- Multi-hit moves (2-5 hits)
- Binding moves with trap mechanic
- Rampage moves with confusion after
- Protection moves with stale counter
- Priority move ordering

### Must NOT Have (Guardrails)

- NO Abilities implementation (separate feature scope)
- NO Mega Evolution / Z-Moves / Dynamax mechanics
- NO new move animations (use existing animation system)
- NO AI behavior changes (just make mechanics work)
- NO held item effects beyond scope (separate feature)
- NO changing existing move data JSON structure (extend, don't break)
- NO breaking existing tests (all current tests must continue passing)

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest configured)
- **User wants tests**: TDD
- **Framework**: Vitest

### TDD Approach

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**

1. **RED**: Write failing test first
   - Test file: `src/js/__tests__/{feature}.test.ts`
   - Test command: `npm run test:run -- {feature}`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `npm run test:run -- {feature}`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `npm run test:run`
   - Expected: PASS (full suite)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately) - Core Infrastructure:
├── Task 1: BattleField State Class
├── Task 2: Volatile Status System
└── Task 3: Effect Registry Extension

Wave 2 (After Wave 1) - Primary Effects:
├── Task 4: Weather Effects (Rain/Sun/Sand/Hail)
├── Task 5: Screen Effects (Reflect/Light Screen)
├── Task 6: Status Effect Refinements
└── Task 7: Stat Change Effect Fixes

Wave 3 (After Wave 2) - Complex Mechanics:
├── Task 8: Two-Turn Move System
├── Task 9: Recoil & Drain Moves
├── Task 10: Multi-Hit Moves
├── Task 11: Binding Moves
├── Task 12: Rampage Moves
└── Task 13: Protection Moves

Wave 4 (After Wave 3) - Field & Polish:
├── Task 14: Entry Hazards
├── Task 15: Terrain Effects
├── Task 16: Trick Room
├── Task 17: Field UI Component
├── Task 18: Volatile UI Indicators
└── Task 19: Damage Calc Integration

Wave 5 (Final):
└── Task 20: Move Mapping & Integration Test
```

### Dependency Matrix

| Task | Depends On | Blocks               | Can Parallelize With |
| ---- | ---------- | -------------------- | -------------------- |
| 1    | None       | 4, 5, 14, 15, 16, 17 | 2, 3                 |
| 2    | None       | 6, 8, 11, 12, 18     | 1, 3                 |
| 3    | None       | 4-16                 | 1, 2                 |
| 4    | 1, 3       | 19                   | 5, 6, 7              |
| 5    | 1, 3       | 19                   | 4, 6, 7              |
| 6    | 2, 3       | 19                   | 4, 5, 7              |
| 7    | 3          | 19                   | 4, 5, 6              |
| 8    | 2, 3       | 20                   | 9, 10, 11, 12, 13    |
| 9    | 3          | 20                   | 8, 10, 11, 12, 13    |
| 10   | 3          | 20                   | 8, 9, 11, 12, 13     |
| 11   | 2, 3       | 20                   | 8, 9, 10, 12, 13     |
| 12   | 2, 3       | 20                   | 8, 9, 10, 11, 13     |
| 13   | 3          | 20                   | 8, 9, 10, 11, 12     |
| 14   | 1, 3       | 20                   | 15, 16               |
| 15   | 1, 3       | 20                   | 14, 16               |
| 16   | 1, 3       | 20                   | 14, 15               |
| 17   | 1          | 20                   | 18                   |
| 18   | 2          | 20                   | 17                   |
| 19   | 4, 5, 6, 7 | 20                   | None                 |
| 20   | All above  | None                 | None                 |

---

## TODOs

### Wave 1: Core Infrastructure

---

- [x] 1. Create BattleField State Class

  **What to do**:
  - **First**: Create test directory `mkdir -p src/js/__tests__/`
  - Create `src/js/battle/battle-field.ts` with BattleField class
  - Track: weather (type + turns remaining), screens (ally/enemy + turns), hazards (by side), terrain, trick room
  - Add methods: setWeather(), addScreen(), addHazard(), tickTurn(), clearField()
  - Integrate with BattleContext (add battleField property)
  - Write tests first for all state transitions

  **Must NOT do**:
  - Do not modify existing BattleContext structure beyond adding battleField
  - Do not implement effect logic here (just state tracking)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core architecture work requiring careful design
  - **Skills**: []
    - No special skills needed - pure TypeScript model

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: 4, 5, 14, 15, 16, 17
  - **Blocked By**: None

  **References**:
  - `src/js/context/battleContext.ts` - BattleContext class to extend
  - `src/js/context/gameContext.ts:weather` - Existing global weather (to migrate)
  - `src/js/pokemons/effects/types.ts` - EffectTiming enum pattern
  - Bulbapedia Weather mechanics: https://bulbapedia.bulbagarden.net/wiki/Weather

  **Acceptance Criteria**:
  - [x] Test directory created: `src/js/__tests__/` exists
  - [x] Test file created: `src/js/__tests__/battle-field.test.ts`
  - [x] Test covers: weather set/expire, screen set/expire, hazard add/clear
  - [x] `npm run test:run -- battle-field` → PASS
  - [x] `npm run check` → No errors in battle-field.ts

  **Automated Verification**:

  ```bash
  mkdir -p src/js/__tests__  # Create test directory if not exists
  npm run test:run -- battle-field
  # Assert: All tests pass
  npm run check
  # Assert: No TypeScript errors
  ```

  **Commit**: YES
  - Message: `feat(battle): add BattleField state class for weather/screens/hazards`
  - Files: `src/js/battle/battle-field.ts`, `src/js/__tests__/battle-field.test.ts`, `src/js/context/battleContext.ts`

---

- [x] 2. Create Volatile Status System

  **What to do**:
  - Create `src/js/pokemons/volatile-status.ts` with VolatileStatus enum and tracker
  - Implement volatiles: FLINCH, INFATUATION, BOUND, SEEDED, CURSED, CONFUSED, DROWSY
  - Add `volatiles: Set<VolatileStatus>` to PokemonInstance
  - Add methods: addVolatile(), removeVolatile(), hasVolatile(), clearVolatiles()
  - Add volatile tick logic (Leech Seed damage at END_TURN, etc.)
  - Write tests for volatile application and removal

  **Must NOT do**:
  - Do not change status (non-volatile) system - that already works
  - Do not add UI changes here (separate task)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core model extension with careful design
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: 6, 8, 11, 12, 18
  - **Blocked By**: None

  **References**:
  - `src/js/pokemons/pokedex.ts:PokemonInstance` - Class to extend with volatiles
  - `src/js/pokemons/pokedex.ts:Status` - Existing status enum pattern
  - Bulbapedia Volatile status: https://bulbapedia.bulbagarden.net/wiki/Status_condition#Volatile_status

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/volatile-status.test.ts`
  - [x] Tests cover: add/remove/has volatile, Leech Seed tick damage
  - [x] `npm run test:run -- volatile-status` → PASS
  - [x] PokemonInstance has volatiles property
  - [x] Verify no conflict with existing Status enum (volatiles are separate)

  **Automated Verification**:

  ```bash
  npm run test:run -- volatile-status
  npm run check
  ```

  **Commit**: YES
  - Message: `feat(pokemon): add volatile status system with common volatiles`
  - Files: `src/js/pokemons/volatile-status.ts`, `src/js/pokemons/pokedex.ts`, `src/js/__tests__/volatile-status.test.ts`

---

- [x] 3. Extend Effect Registry and Types

  **What to do**:
  - **CRITICAL**: Consolidate EffectTiming enum - it exists in BOTH `src/js/pokemons/effects/types.ts` AND `src/js/pokemons/move-effects.ts`. Choose one canonical location (types.ts) and update all imports.
  - Add new EffectTiming values: ON_SWITCH_IN, ON_HIT, ON_FAINT
  - Create effect category files in `src/js/pokemons/effects/`:
    - `weather-effects.ts`
    - `screen-effects.ts`
    - `hazard-effects.ts`
    - `volatile-effects.ts`
    - `complex-move-effects.ts`
  - Create effect registry mapping effect_id → Effect class
  - Ensure all effects implement the Effect interface consistently

  **Must NOT do**:
  - Do not implement actual effect logic yet (just scaffolding)
  - Do not break existing effects in move-effects.ts

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Scaffolding work, straightforward structure
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: 4-16
  - **Blocked By**: None

  **References**:
  - `src/js/pokemons/effects/types.ts` - Effect interface, EffectTiming enum (CANONICAL)
  - `src/js/pokemons/move-effects.ts:6-15` - Duplicate EffectTiming to REMOVE
  - `src/js/pokemons/move-effects.ts:effectFromId()` - Registry function to extend

  **Acceptance Criteria**:
  - [x] Only ONE EffectTiming enum exists (in types.ts)
  - [x] All imports updated to use types.ts
  - [x] EffectTiming has ON_SWITCH_IN, ON_HIT, ON_FAINT
  - [x] Effect category files exist with exports
  - [x] `npm run check` → No errors
  - [x] Existing tests still pass: `npm run test:run`

  **Automated Verification**:

  ```bash
  npm run check
  npm run test:run
  # Assert: No regressions
  ```

  **Commit**: YES
  - Message: `feat(effects): extend effect registry with new timing and categories`
  - Files: `src/js/pokemons/effects/*.ts`

---

### Wave 2: Primary Effects

---

- [x] 4. Implement Weather Effects

  **What to do**:
  - **NOTE**: Weather system partially exists - WeatherHeal effect at move-effects.ts:2914-2949, and GameContext.weather at line 74
  - **Migrate** existing weather from GameContext to BattleField
  - **Update** existing WeatherHeal effect to use new BattleField system
  - Implement RainDanceEffect, SunnyDayEffect, SandstormEffect, HailEffect
  - Weather sets for 5 turns (or 8 with item, but items out of scope)
  - Sandstorm: 1/16 damage to non-Rock/Ground/Steel at END_TURN
  - Hail: 1/16 damage to non-Ice at END_TURN
  - Sun: Fire 1.5x, Water 0.5x
  - Rain: Water 1.5x, Fire 0.5x
  - Add weather modifiers to damage calculation
  - TDD: Write weather damage/modifier tests first

  **Must NOT do**:
  - Do not implement weather-extending items (out of scope)
  - Do not change weather for abilities (out of scope)
  - Do not break existing WeatherHeal functionality

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex game mechanics with precise formulas
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
  - **Blocks**: 19
  - **Blocked By**: 1, 3

  **References**:
  - `src/js/pokemons/effects/weather-effects.ts` - File created in Task 3
  - `src/js/battle/battle-field.ts` - BattleField from Task 1
  - `src/js/battle/actions/actions-selectable.ts:271` - Damage calc to modify
  - `src/js/pokemons/move-effects.ts:RainDanceEffect` - Existing partial implementation
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Weather#Generation_III_onwards

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/weather-effects.test.ts`
  - [x] Tests: weather sets correctly, expires after 5 turns, damage modifiers apply
  - [x] Test: Sandstorm/Hail damage at END_TURN
  - [x] `npm run test:run -- weather` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- weather-effects
  npm run check
  ```

  **Commit**: YES
  - Message: `feat(effects): implement full weather system with damage modifiers`
  - Files: `src/js/pokemons/effects/weather-effects.ts`, damage calc file, tests

---

- [x] 5. Implement Screen Effects

  **What to do**:
  - Implement ReflectEffect, LightScreenEffect
  - Screens last 5 turns (or 8 with Light Clay, out of scope)
  - Reflect: 0.5x physical damage to team
  - Light Screen: 0.5x special damage to team
  - In doubles: 0.66x instead of 0.5x (if applicable)
  - Integrate with damage calculation
  - TDD for screen damage reduction

  **Must NOT do**:
  - Do not implement Brick Break screen-breaking (move effect, can add later)
  - Do not implement Aurora Veil (Gen 7+)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Damage formula integration requires precision
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6, 7)
  - **Blocks**: 19
  - **Blocked By**: 1, 3

  **References**:
  - `src/js/pokemons/effects/screen-effects.ts` - File from Task 3
  - `src/js/battle/battle-field.ts` - BattleField from Task 1
  - `src/js/battle/actions/actions-selectable.ts` - Damage calc
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Reflect_(move)

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/screen-effects.test.ts`
  - [x] Tests: screen sets, expires, reduces damage correctly
  - [x] `npm run test:run -- screen-effects` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- screen-effects
  ```

  **Commit**: YES
  - Message: `feat(effects): implement Reflect and Light Screen with damage reduction`
  - Files: screen-effects.ts, damage calc, tests

---

- [x] 6. Refine Status Effect Implementations

  **What to do**:
  - Verify/fix Sleep: 1-3 turns (Gen 5+), can't act, wake on hit with certain moves
  - Verify/fix Freeze: 20% thaw each turn, thaw from Fire moves
  - Verify/fix Paralysis: 25% full paralysis, 50% Speed (Gen 7: 50% para)
  - Verify/fix Poison: 1/8 HP per turn
  - Verify/fix Toxic: 1/16, 2/16, 3/16... HP per turn (resets on switch)
  - Verify/fix Burn: 1/8 HP per turn, 0.5x physical attack
  - Verify/fix Confusion: 50% self-hit (Gen 7: 33%), 1-4 turns
  - Add confusion to volatile system from Task 2

  **Must NOT do**:
  - Do not implement ability-based status immunity (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Precise Gen 3-5 mechanics verification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7)
  - **Blocks**: 19
  - **Blocked By**: 2, 3

  **References**:
  - `src/js/pokemons/pokedex.ts:Status` - Current status enum
  - `src/js/pokemons/move-effects.ts` - Current status effects
  - `src/js/battle/actions/actions-derived.ts` - Status tick logic
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Status_condition

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/status-effects.test.ts`
  - [x] Tests for each status: duration, damage tick, effects
  - [x] `npm run test:run -- status-effects` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- status-effects
  ```

  **Commit**: YES
  - Message: `fix(effects): refine status effects to match Gen 3-5 mechanics`
  - Files: move-effects.ts, actions-derived.ts, tests

---

- [x] 7. Verify/Fix Stat Change Effects

  **What to do**:
  - Verify stat stage multipliers: -6 to +6 (2/8 to 8/2)
  - Verify stat changes apply immediately
  - Implement stat change messages ("Attack rose!", "Defense sharply fell!")
  - Handle stat cap ("Attack won't go any higher!")
  - Verify Accuracy/Evasion stages work correctly
  - TDD for edge cases

  **Must NOT do**:
  - Do not change existing stat change UI (already works)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task, likely minor fixes
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6)
  - **Blocks**: 19
  - **Blocked By**: 3

  **References**:
  - `src/js/pokemons/pokedex.ts:battleStats` - Stat getter with multipliers
  - `src/js/pokemons/pokedex.ts:statsChanges` - Stage storage
  - `src/js/pokemons/move-effects.ts:StatsEffect` - Current implementation
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Stat_modifier

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/stat-changes.test.ts`
  - [x] Tests: each stage multiplier, cap at +6/-6, accuracy/evasion
  - [x] `npm run test:run -- stat-changes` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- stat-changes
  ```

  **Commit**: YES (group with Task 6 if small changes)
  - Message: `fix(effects): verify and fix stat change mechanics`

---

### Wave 3: Complex Move Mechanics

---

- [x] 8. Implement Two-Turn Move System

  **What to do**:
  - Create TwoTurnMoveEffect base class
  - Implement: Fly, Dig, Dive, Bounce, Shadow Force, Phantom Force
  - Implement: Solar Beam, Skull Bash, Razor Wind, Sky Attack
  - Handle semi-invulnerable state (Fly/Dig/Dive/Bounce)
  - Handle charge turn vs attack turn
  - Sun makes Solar Beam instant
  - TDD for each move type

  **Must NOT do**:
  - Do not add Power Herb item (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex state machine for move phases
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9-13)
  - **Blocks**: 20
  - **Blocked By**: 2, 3

  **References**:
  - `src/js/pokemons/effects/complex-move-effects.ts` - File from Task 3
  - `src/js/pokemons/volatile-status.ts` - SEMI_INVULNERABLE volatile
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Semi-invulnerable_turn

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/two-turn-moves.test.ts`
  - [x] Tests: charge turn, attack turn, semi-invulnerable dodge, Sun+Solar Beam
  - [x] `npm run test:run -- two-turn` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- two-turn-moves
  ```

  **Commit**: YES
  - Message: `feat(effects): implement two-turn moves with semi-invulnerable state`

---

- [x] 9. Implement Recoil and Drain Moves

  **What to do**:
  - Implement RecoilEffect with configurable percentage (25%, 33%, 50%)
  - Moves: Take Down (25%), Double-Edge (33%), Brave Bird (33%), Flare Blitz (33%)
  - Struggle: Special case (25% of max HP, not damage dealt)
  - Implement DrainEffect with percentage (50%, 75%)
  - Moves: Absorb, Mega Drain, Giga Drain (50%), Drain Punch, Horn Leech
  - TDD for damage/heal amounts

  **Must NOT do**:
  - Do not implement Big Root item (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Straightforward percentage calculations
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 10-13)
  - **Blocks**: 20
  - **Blocked By**: 3

  **References**:
  - `src/js/pokemons/effects/complex-move-effects.ts` - Target file
  - `src/js/pokemons/move-effects.ts` - Check if partial exists
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Recoil

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/recoil-drain.test.ts`
  - [x] Tests: recoil percentages, drain heal amounts, Struggle special case
  - [x] `npm run test:run -- recoil-drain` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- recoil-drain
  ```

  **Commit**: YES
  - Message: `feat(effects): implement recoil and drain move effects`

---

- [x] 10. Implement Multi-Hit Moves

  **What to do**:
  - Implement MultiHitEffect with hit count logic
  - 2-5 hits: 35% 2 hits, 35% 3 hits, 15% 4 hits, 15% 5 hits
  - Fixed hits: Double Kick (2), Triple Kick (3, increasing power)
  - Moves: Fury Attack, Pin Missile, Bullet Seed, Icicle Spear, Rock Blast
  - Each hit can crit independently
  - Display hit count in battle message
  - TDD for hit distribution

  **Must NOT do**:
  - Do not implement Skill Link ability (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Probability logic, straightforward
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 11-13)
  - **Blocks**: 20
  - **Blocked By**: 3

  **References**:
  - `src/js/pokemons/effects/complex-move-effects.ts` - Target file
  - `src/js/battle/actions/actions-selectable.ts` - Damage per hit
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Multi-strike_move

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/multi-hit.test.ts`
  - [x] Tests: hit count distribution, Triple Kick power scaling
  - [x] `npm run test:run -- multi-hit` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- multi-hit
  ```

  **Commit**: YES
  - Message: `feat(effects): implement multi-hit moves with proper distribution`

---

- [x] 11. Implement Binding Moves

  **What to do**:
  - Implement BindEffect for trap moves
  - Trap lasts 4-5 turns (or 7 with Grip Claw, out of scope)
  - Damage: 1/8 max HP per turn (1/6 with Binding Band, out of scope)
  - Trapping prevents switching
  - Moves: Bind, Wrap, Fire Spin, Whirlpool, Sand Tomb, Magma Storm
  - Use BOUND volatile from Task 2
  - TDD for duration and damage

  **Must NOT do**:
  - Do not implement Binding Band/Grip Claw items

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: State management + switching prevention
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8-10, 12, 13)
  - **Blocks**: 20
  - **Blocked By**: 2, 3

  **References**:
  - `src/js/pokemons/effects/complex-move-effects.ts` - Target file
  - `src/js/pokemons/volatile-status.ts:BOUND` - Volatile from Task 2
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Bound

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/binding-moves.test.ts`
  - [x] Tests: trap duration, per-turn damage, switch prevention
  - [x] `npm run test:run -- binding` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- binding-moves
  ```

  **Commit**: YES
  - Message: `feat(effects): implement binding moves with trap mechanic`

---

- [x] 12. Implement Rampage Moves

  **What to do**:
  - Implement RampageEffect for multi-turn lock moves
  - Duration: 2-3 turns randomly
  - After rampage ends: user becomes confused
  - Moves: Outrage, Thrash, Petal Dance
  - Cannot switch during rampage (locked in)
  - TDD for duration and confusion

  **Must NOT do**:
  - Do not implement Lum Berry cure (items out of scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: State machine for multi-turn lock
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8-11, 13)
  - **Blocks**: 20
  - **Blocked By**: 2, 3

  **References**:
  - `src/js/pokemons/effects/complex-move-effects.ts` - Target file
  - `src/js/pokemons/volatile-status.ts:CONFUSED` - For after-effect
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Outrage_(move)

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/rampage-moves.test.ts`
  - [x] Tests: 2-3 turn duration, confusion after, move lock
  - [x] `npm run test:run -- rampage` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- rampage-moves
  ```

  **Commit**: YES
  - Message: `feat(effects): implement rampage moves with confusion aftermath`

---

- [x] 13. Implement Protection Moves

  **What to do**:
  - Implement ProtectEffect base class
  - Protect/Detect: Blocks all moves
  - Endure: Survives with 1 HP
  - Success chance: 100% first use, 50% if used last turn, 25% if twice, etc.
  - Stale counter resets if different move used
  - Some moves bypass Protect (Feint)
  - TDD for success rates and blocking

  **Must NOT do**:
  - Do not implement Quick Guard/Wide Guard (doubles-specific)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Stale counter logic is tricky
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8-12)
  - **Blocks**: 20
  - **Blocked By**: 3

  **References**:
  - `src/js/pokemons/effects/complex-move-effects.ts` - Target file
  - `src/js/pokemons/pokedex.ts:PokemonInstance` - Add lastMoveUsed tracking
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Protect_(move)

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/protection-moves.test.ts`
  - [x] Tests: first use success, stale counter, Endure mechanics
  - [x] `npm run test:run -- protection` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- protection-moves
  ```

  **Commit**: YES
  - Message: `feat(effects): implement Protect/Detect/Endure with stale counter`

---

### Wave 4: Field System & UI

---

- [x] 14. Implement Entry Hazards

  **What to do**:
  - Implement StealthRockEffect: Type-based damage on switch-in (1/8 to 1/2)
  - Implement SpikesEffect: 1/8 (1 layer), 1/6 (2), 1/4 (3 layers)
  - Implement ToxicSpikesEffect: Poison (1 layer), Toxic (2 layers)
  - Add ON_SWITCH_IN timing to trigger hazards
  - Flying/Levitate immune to Spikes/Toxic Spikes
  - Rapid Spin/Defog clears hazards
  - TDD for each hazard type

  **Must NOT do**:
  - Do not implement Sticky Web (Gen 6)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex type-based calculations and switch-in logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 15, 16)
  - **Blocks**: 20
  - **Blocked By**: 1, 3

  **References**:
  - `src/js/pokemons/effects/hazard-effects.ts` - File from Task 3
  - `src/js/battle/battle-field.ts` - Hazard storage
  - `src/js/pokemons/types.ts` - Type chart for Stealth Rock
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Entry_hazard

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/hazard-effects.test.ts`
  - [x] Tests: SR type damage, Spikes layers, Toxic Spikes poison level
  - [x] Tests: Flying immunity, Rapid Spin clear
  - [x] `npm run test:run -- hazard` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- hazard-effects
  ```

  **Commit**: YES
  - Message: `feat(effects): implement entry hazards (SR, Spikes, T-Spikes)`

---

- [x] 15. Implement Terrain Effects

  **What to do**:
  - Implement Electric Terrain: Grounded can't sleep, Electric 1.3x
  - Implement Grassy Terrain: 1/16 HP heal, Grass 1.3x, Earthquake 0.5x
  - Implement Psychic Terrain: Blocks priority, Psychic 1.3x
  - Implement Misty Terrain: Blocks status, Dragon 0.5x
  - Terrain lasts 5 turns
  - Integrate with damage calc and status application
  - TDD for each terrain

  **Must NOT do**:
  - Do not implement terrain-extending items

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multiple damage/status modifiers
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 14, 16)
  - **Blocks**: 20
  - **Blocked By**: 1, 3

  **References**:
  - `src/js/pokemons/effects/` - Terrain effects file
  - `src/js/battle/battle-field.ts` - Terrain storage
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Terrain

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/terrain-effects.test.ts`
  - [x] Tests: each terrain's type boost, each terrain's special effect
  - [x] `npm run test:run -- terrain` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- terrain-effects
  ```

  **Commit**: YES
  - Message: `feat(effects): implement terrain effects with damage modifiers`

---

- [x] 16. Implement Trick Room

  **What to do**:
  - Implement TrickRoomEffect
  - Lasts 5 turns
  - Reverses speed priority (slower moves first)
  - Modify turn order calculation
  - Priority moves still go first (priority bracket, then reversed speed)
  - TDD for turn order changes

  **Must NOT do**:
  - Do not change priority move handling (still goes first)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Turn order logic is sensitive
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 14, 15)
  - **Blocks**: 20
  - **Blocked By**: 1, 3

  **References**:
  - `src/js/battle/battle-field.ts` - Trick Room flag
  - `src/js/context/battleContext.ts:174` - sortActions() - Turn order determination
  - Bulbapedia: https://bulbapedia.bulbagarden.net/wiki/Trick_Room_(move)

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/trick-room.test.ts`
  - [x] Tests: slower goes first, priority still works, expires after 5
  - [x] `npm run test:run -- trick-room` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- trick-room
  ```

  **Commit**: YES
  - Message: `feat(effects): implement Trick Room with reversed speed priority`

---

- [x] 17. Create Field UI Component

  **What to do**:
  - Create `src/lib/battle/FieldIndicators.svelte`
  - Show active weather with icon and turn counter
  - Show active screens per side with turn counter
  - Show hazard indicators per side (SR rock icon, Spikes layers)
  - Show terrain with appropriate coloring
  - Show Trick Room indicator if active
  - Subscribe to BattleContext.battleField store
  - Style with SCSS following existing patterns

  **Must NOT do**:
  - Do not add complex animations (keep simple)
  - Do not change Battle.svelte layout significantly

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: UI component with visual indicators
  - **Skills**: [`frontend-ui-ux`]
    - For proper Svelte 5 patterns and styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 18)
  - **Blocks**: 20
  - **Blocked By**: 1

  **References**:
  - `src/lib/battle/Battle.svelte` - Where to integrate component
  - `src/lib/battle/AllyInfo.svelte` - Existing status display pattern
  - `src/lib/battle/EnemyInfo.svelte` - Styling patterns
  - Existing Svelte components in `src/lib/battle/` - UI guidelines and patterns

  **Acceptance Criteria**:
  - [x] Component created with weather/screen/hazard/terrain indicators
  - [x] `npm run check` → No errors
  - [x] Visual verification: weather icon visible when weather active

  **Automated Verification**:

  ```bash
  npm run check
  npm run build
  # Assert: No build errors
  ```

  **Manual Verification (Browser)**:

  ```
  1. Start dev server: npm run dev
  2. Navigate to battle screen at http://localhost:5173/
  3. Trigger weather move in battle
  4. Verify: Weather indicator appears with turn counter
  5. Take screenshot manually if needed
  ```

  **Commit**: YES
  - Message: `feat(ui): add FieldIndicators component for battle field state`

---

- [x] 18. Add Volatile Status UI Indicators

  **What to do**:
  - Extend existing status badge system for volatiles
  - Add volatile indicators to AllyInfo/EnemyInfo
  - Icons/badges for: Flinch (not visible, too fast), Confused, Infatuation, Bound, Seeded, Cursed
  - Different styling from permanent statuses (perhaps outline vs filled)
  - Subscribe to pokemon.volatiles

  **Must NOT do**:
  - Do not redesign existing status badges

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: UI extension with visual elements
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 17)
  - **Blocks**: 20
  - **Blocked By**: 2

  **References**:
  - `src/lib/battle/AllyInfo.svelte` - Status badge implementation
  - `src/lib/battle/EnemyInfo.svelte` - Status badge implementation
  - `src/js/pokemons/volatile-status.ts` - Volatile enum

  **Acceptance Criteria**:
  - [x] Volatile badges appear when volatile applied
  - [x] `npm run check` → No errors
  - [x] Visual distinction from permanent statuses

  **Automated Verification**:

  ```bash
  npm run check
  npm run build
  ```

  **Commit**: YES
  - Message: `feat(ui): add volatile status indicators to battle UI`

---

- [x] 19. Integrate All Modifiers into Damage Calculation

  **What to do**:
  - Update damage formula in actions-selectable.ts
  - Add weather modifiers (Rain/Sun fire/water)
  - Add screen modifiers (Reflect/Light Screen)
  - Add terrain modifiers (type boosts)
  - Ensure modifier stacking is correct (multiplicative)
  - Verify STAB, type effectiveness, crit still work
  - TDD for combined modifier scenarios

  **Must NOT do**:
  - Do not break existing damage calculation
  - Do not add ability modifiers

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Critical formula work
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Wave 2)
  - **Blocks**: 20
  - **Blocked By**: 4, 5, 6, 7

  **References**:
  - `src/js/battle/actions/actions-selectable.ts:271` - Damage calculation
  - Tasks 4, 5, 15 for modifier values
  - Bulbapedia damage formula: https://bulbapedia.bulbagarden.net/wiki/Damage

  **Acceptance Criteria**:
  - [x] Test file: `src/js/__tests__/damage-calc.test.ts`
  - [x] Tests: weather modifier, screen modifier, terrain modifier, combined
  - [x] Existing damage tests still pass
  - [x] `npm run test:run -- damage` → PASS

  **Automated Verification**:

  ```bash
  npm run test:run -- damage-calc
  npm run test:run # Full suite
  ```

  **Commit**: YES
  - Message: `feat(battle): integrate weather/screen/terrain into damage calculation`

---

### Wave 5: Integration

---

- [x] 20. Move Mapping and Integration Testing

  **What to do**:
  - Map all move effect_ids in pokedex JSON to new Effect implementations
  - Update effectFromId() registry to return correct effects
  - Create integration tests for representative moves of each category:
    - **Two-turn**: Fly (id 19), Solar Beam (id 76)
    - **Recoil**: Take Down (id 36), Double-Edge (id 38)
    - **Multi-hit**: Fury Attack (id 31), Pin Missile (id 42)
    - **Binding**: Bind (id 20), Wrap (id 35)
    - **Rampage**: Thrash (id 37), Petal Dance (id 80)
    - **Protection**: Protect (id 182), Detect (id 197)
    - **Weather**: Rain Dance (id 240), Sunny Day (id 241)
    - **Status**: Thunder Wave (id 86), Will-O-Wisp (id 261)
  - Test full battle flow with various move combinations
  - Verify no regressions in existing functionality
  - Document any unmapped or special-case moves

  **Must NOT do**:
  - Do not modify move JSON structure
  - Do not skip any move category

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Final integration requiring full system knowledge
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None (final)
  - **Blocked By**: All previous tasks

  **References**:
  - `src/assets/data/final/beta/pokedex-animatedV3.json` - Move data
  - `src/js/pokemons/move-effects.ts:effectFromId()` - Registry
  - All effect implementation files from Tasks 4-16

  **Acceptance Criteria**:
  - [x] All move effect_ids mapped
  - [x] Integration test file: `src/js/__tests__/move-integration.test.ts`
  - [x] `npm run test:run` → ALL PASS
  - [x] `npm run check` → No errors
  - [x] `npm run build` → Builds successfully

  **Automated Verification**:

  ```bash
  npm run test:run
  npm run check
  npm run build
  # Assert: All pass, no errors
  ```

  **Commit**: YES
  - Message: `feat(effects): complete move effect mapping and integration`

---

## Commit Strategy

| After Task | Message                                     | Key Files               |
| ---------- | ------------------------------------------- | ----------------------- |
| 1          | `feat(battle): add BattleField state class` | battle-field.ts         |
| 2          | `feat(pokemon): add volatile status system` | volatile-status.ts      |
| 3          | `feat(effects): extend effect registry`     | effects/\*.ts           |
| 4          | `feat(effects): implement weather system`   | weather-effects.ts      |
| 5          | `feat(effects): implement screens`          | screen-effects.ts       |
| 6          | `fix(effects): refine status effects`       | move-effects.ts         |
| 7          | `fix(effects): verify stat changes`         | move-effects.ts         |
| 8          | `feat(effects): two-turn moves`             | complex-move-effects.ts |
| 9          | `feat(effects): recoil/drain moves`         | complex-move-effects.ts |
| 10         | `feat(effects): multi-hit moves`            | complex-move-effects.ts |
| 11         | `feat(effects): binding moves`              | complex-move-effects.ts |
| 12         | `feat(effects): rampage moves`              | complex-move-effects.ts |
| 13         | `feat(effects): protection moves`           | complex-move-effects.ts |
| 14         | `feat(effects): entry hazards`              | hazard-effects.ts       |
| 15         | `feat(effects): terrain effects`            | terrain-effects.ts      |
| 16         | `feat(effects): Trick Room`                 | complex-move-effects.ts |
| 17         | `feat(ui): field indicators`                | FieldIndicators.svelte  |
| 18         | `feat(ui): volatile indicators`             | AllyInfo.svelte         |
| 19         | `feat(battle): integrate damage modifiers`  | actions-selectable.ts   |
| 20         | `feat(effects): complete integration`       | move-effects.ts         |

---

## Success Criteria

### Verification Commands

```bash
npm run test:run        # Expected: All tests pass
npm run check           # Expected: No TypeScript errors
npm run build           # Expected: Successful build
npm run lint            # Expected: No lint errors
```

### Final Checklist

- [x] All "Must Have" features implemented
- [x] All "Must NOT Have" guardrails respected
- [x] All 20 tasks completed with passing tests
- [x] Weather/Screen/Hazard/Terrain UI visible in battle
- [x] Volatile status badges visible
- [x] No regressions in existing battle functionality
- [x] All move effect_ids mapped to implementations
