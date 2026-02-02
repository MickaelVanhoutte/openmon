# Battle Engine Gen 7+ Mechanics Fixes

## TL;DR

> **Quick Summary**: Fix battle engine to accurately implement Gen 7+ Pokemon mechanics - correct status damage values, integrate unused weather/screen/hazard systems, and fix crit rate calculation for high-crit moves.
>
> **Deliverables**:
>
> - Poison/Burn damage fixed to Gen 7+ values (1/16 HP)
> - Confusion self-hit reduced to 33%
> - Weather type multipliers integrated into damage formula
> - Screen damage reduction integrated (with doubles support)
> - Entry hazards connected to switch-in logic
> - High-crit moves properly boost crit rate
>
> **Estimated Effort**: Medium (8-12 tasks, ~1-2 days)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 5 → Task 8 → Task 10

---

## Context

### Original Request

Review and fix the OpenMon battle engine to match Gen 4-5 mechanics (later clarified to Gen 7+ mechanics).

### Interview Summary

**Key Discussions**:

- Target: **Gen 7+ mechanics** (Confusion=33%, Paralysis Speed penalty still 25%)
- Hazards: **Include** switch-in integration in this plan
- Battle format: **Doubles support needed** (screens use 2/3x in doubles, 0.5x in singles)

**Research Findings**:

- Poison/Burn damage is correctly 1/16 HP in Gen 7+ (current code correct)
- Confusion self-hit is 33% in Gen 7+ (current code has 50% - needs fix)
- Weather modifiers exist but aren't called from damage calculation
- Screen modifiers exist but aren't called from damage calculation
- Hazard calculations exist but aren't connected to switch-in
- HighCritical effect exists but doesn't modify crit rate

### Metis Review

**Identified Gaps** (addressed):

- Generation target ambiguity: Resolved to Gen 7+
- Hazard scope: Included in plan
- Doubles vs Singles: Added doubles support requirement

---

## Work Objectives

### Core Objective

Align the OpenMon battle engine with Gen 7+ mechanics by fixing incorrect values, integrating unused systems, and ensuring damage calculation follows the correct modifier order.

### Concrete Deliverables

- `src/js/pokemons/volatile-status.ts` - Confusion self-hit changed to 33%
- `src/js/battle/actions/actions-selectable.ts` - Weather and screen modifiers integrated
- `src/js/battle/actions/actions-selectable.ts` - Crit calculation accepts move for high-crit check
- `src/js/context/battleContext.ts` or relevant file - Hazards applied on switch-in
- New/updated tests for all changed mechanics

### Definition of Done

- [x] `npm run test:run` passes with 0 failures
- [x] Confusion self-hit rate is 33% (verified by test)
- [x] Water moves do 1.5x in Rain, 0.5x in Sun (verified by test)
- [x] Fire moves do 1.5x in Sun, 0.5x in Rain (verified by test)
- [x] Reflect reduces physical damage by 0.5x singles / 0.67x doubles
- [x] Light Screen reduces special damage by 0.5x singles / 0.67x doubles
- [x] Stealth Rock damages on switch-in based on type effectiveness
- [x] Spikes damages on switch-in (1/8, 1/6, 1/4 per layer)
- [x] High-crit moves have 12.5% crit rate vs 6.25% base

### Must Have

- Gen 7+ Confusion self-hit rate (33%)
- Weather type multipliers in damage calculation
- Screen damage reduction in damage calculation
- Doubles-aware screen reduction (2/3 in doubles)
- Hazard damage on switch-in
- High-crit move support (+1 crit stage = 12.5%)

### Must NOT Have (Guardrails)

- Do NOT change base crit rate (6.25%) or crit multiplier (1.5x Gen 7+)
- Do NOT implement abilities (Phase 2)
- Do NOT implement held item effects (Phase 2)
- Do NOT change weather duration or setting logic
- Do NOT change screen duration
- Do NOT add terrain damage modifiers
- Do NOT touch Trick Room speed logic
- Do NOT implement type-based status immunity (Fire immune to burn, etc.)
- Do NOT refactor effect class structure - only change values/integration

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (Vitest)
- **User wants tests**: TDD where practical, tests-after for integration
- **Framework**: Vitest (`npm run test`)

### Executable Verification Commands

```bash
# Full regression after each task
npm run test:run

# Specific test suites
npm run test -- --grep "Confusion"
npm run test -- --grep "Weather"
npm run test -- --grep "Screen"
npm run test -- --grep "Hazard"
npm run test -- --grep "Critical"

# TypeScript validation
npm run check
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Independent fixes):
├── Task 1: Fix Confusion self-hit rate (33%)
├── Task 2: Add weather integration to damage calc
└── Task 3: Add screen integration to damage calc (with doubles)

Wave 2 (After Wave 1 - Requires damage calc stable):
├── Task 4: Integrate hazards on switch-in
├── Task 5: Fix high-crit move crit rate
└── Task 6: Update/add tests for weather modifiers

Wave 3 (After Wave 2 - Integration tests):
├── Task 7: Add tests for screen modifiers
├── Task 8: Add tests for hazard switch-in
└── Task 9: Add integration test for full damage path

Wave 4 (Final):
└── Task 10: Full regression and cleanup

Critical Path: Task 1 → Task 6 → Task 9 → Task 10
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
| ---- | ---------- | ------ | -------------------- |
| 1    | None       | 6      | 2, 3                 |
| 2    | None       | 6, 9   | 1, 3                 |
| 3    | None       | 7, 9   | 1, 2                 |
| 4    | None       | 8      | 5                    |
| 5    | None       | 9      | 4                    |
| 6    | 1, 2       | 9      | 7, 8                 |
| 7    | 3          | 9      | 6, 8                 |
| 8    | 4          | 9      | 6, 7                 |
| 9    | 6, 7, 8    | 10     | None                 |
| 10   | 9          | None   | None                 |

---

## TODOs

- [x] 1. Fix Confusion Self-Hit Rate to 33%

  **What to do**:
  - Locate confusion self-hit logic in `src/js/pokemons/volatile-status.ts`
  - Change self-hit probability from 0.5 (50%) to 0.33 (33%)
  - Update any related constants or documentation

  **Must NOT do**:
  - Change confusion duration (stays 2-5 turns)
  - Change self-hit damage calculation
  - Modify other volatile status logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, single value change, isolated scope
  - **Skills**: `[]`
    - No special skills needed for simple edit

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 6 (test updates)
  - **Blocked By**: None

  **References**:
  - `src/js/pokemons/volatile-status.ts:116` - Current 50% self-hit check
  - `src/js/__tests__/status-effects.test.ts:73` - Test documents Gen 7+ is 33%

  **Acceptance Criteria**:
  - [ ] `grep -n "0.5" src/js/pokemons/volatile-status.ts` shows no confusion-related 0.5
  - [ ] `grep -n "0.33" src/js/pokemons/volatile-status.ts` shows confusion self-hit at 0.33
  - [ ] `npm run test:run` passes

  **Commit**: YES
  - Message: `fix(battle): change confusion self-hit to 33% for Gen 7+`
  - Files: `src/js/pokemons/volatile-status.ts`
  - Pre-commit: `npm run test:run`

---

- [x] 2. Integrate Weather Type Multipliers into Damage Calculation

  **What to do**:
  - Import weather utilities into `actions-selectable.ts`
  - Call `getWeatherDamageMultiplier(weather, moveType)` in `calculateDamage()`
  - Apply multiplier in correct position (before STAB, after base damage)
  - Pass `battleField` or weather state to damage calculation

  **Must NOT do**:
  - Change weather duration or turn counting
  - Change how weather is set or cleared
  - Add weather end-of-turn damage (Sand/Hail chip) - that's separate
  - Modify weather ability interactions (abilities not in scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Integration task requiring understanding of data flow
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 6, 9
  - **Blocked By**: None

  **References**:
  - `src/js/pokemons/effects/weather-effects.ts:30-45` - `getWeatherDamageMultiplier()` function
  - `src/js/battle/actions/actions-selectable.ts:274-318` - Damage calculation location
  - `src/js/battle/battle-field.ts:15-25` - BattleField with weather property
  - `src/js/context/battleContext.ts` - How to access battleField in context

  **Acceptance Criteria**:
  - [ ] `grep -n "getWeatherDamageMultiplier" src/js/battle/actions/actions-selectable.ts` returns match
  - [ ] `npm run check` passes (no TypeScript errors)
  - [ ] `npm run test:run` passes

  **Commit**: YES
  - Message: `feat(battle): integrate weather type multipliers in damage calc`
  - Files: `src/js/battle/actions/actions-selectable.ts`
  - Pre-commit: `npm run test:run`

---

- [x] 3. Integrate Screen Damage Reduction with Doubles Support

  **What to do**:
  - Create or use function to check active screens on target side
  - Apply 0.5x for singles, 2/3x (~0.67) for doubles based on battle type
  - Check `Reflect` for physical moves, `Light Screen` for special moves
  - Apply after type effectiveness, before final modifiers
  - Need access to battle type (singles/doubles) in damage calc

  **Must NOT do**:
  - Change screen duration (5 turns, 8 with Light Clay)
  - Implement Light Clay item effect
  - Change how screens are set or cleared
  - Make crits ignore screens (that's Gen 2-5, not Gen 7+)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Integration with conditional logic (singles vs doubles)
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 7, 9
  - **Blocked By**: None

  **References**:
  - `src/js/battle/battle-field.ts:45-60` - SideState with screens Map
  - `src/js/battle/battle-field.ts:8-12` - Screen enum (REFLECT, LIGHT_SCREEN)
  - `src/js/battle/actions/actions-selectable.ts:274-318` - Damage calculation
  - `src/js/battle/battle-model.ts:5-15` - BattleType enum (SINGLE, DOUBLE)

  **Acceptance Criteria**:
  - [ ] `grep -n "REFLECT\|LIGHT_SCREEN" src/js/battle/actions/actions-selectable.ts` returns matches
  - [ ] Code handles both singles (0.5x) and doubles (0.67x) cases
  - [ ] `npm run check` passes
  - [ ] `npm run test:run` passes

  **Commit**: YES
  - Message: `feat(battle): integrate screen damage reduction with doubles support`
  - Files: `src/js/battle/actions/actions-selectable.ts`
  - Pre-commit: `npm run test:run`

---

- [x] 4. Integrate Entry Hazards on Switch-In

  **What to do**:
  - Find switch-in logic (likely in battleContext or action handling)
  - Call hazard damage functions when Pokemon enters battle
  - Apply Stealth Rock damage (type-based: 1/8 to 1/2 HP)
  - Apply Spikes damage (1/8, 1/6, 1/4 per layer) - skip if Flying type
  - Apply Toxic Spikes (poison or toxic based on layers) - skip if Flying/Steel/Poison
  - Poison types entering ground absorb Toxic Spikes

  **Must NOT do**:
  - Implement Levitate ability immunity (abilities not in scope)
  - Implement Magic Guard ability (abilities not in scope)
  - Add Heavy-Duty Boots item immunity (items not in scope)
  - Change hazard layer limits or damage formulas
  - Implement Rapid Spin/Defog (already exists, just verify)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires understanding battle flow and switch-in timing
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: Task 8
  - **Blocked By**: None

  **References**:
  - `src/js/pokemons/effects/hazard-effects.ts:15-40` - `calculateStealthRockDamage()`
  - `src/js/pokemons/effects/hazard-effects.ts:45-60` - `calculateSpikesDamage()`
  - `src/js/pokemons/effects/hazard-effects.ts:65-80` - `applyToxicSpikes()`
  - `src/js/context/battleContext.ts` - Battle context for switch handling
  - `src/js/battle/battle-field.ts:70-85` - Hazard layer tracking

  **Acceptance Criteria**:
  - [ ] `grep -rn "calculateStealthRockDamage\|calculateSpikesDamage" src/js/` shows calls outside hazard-effects.ts
  - [ ] Switch-in triggers hazard damage application
  - [ ] `npm run check` passes
  - [ ] `npm run test:run` passes

  **Commit**: YES
  - Message: `feat(battle): apply entry hazard damage on switch-in`
  - Files: `src/js/context/battleContext.ts` (or relevant switch handler)
  - Pre-commit: `npm run test:run`

---

- [x] 5. Fix High-Crit Move Crit Rate Calculation

  **What to do**:
  - Modify `calculateCritical()` to accept `move` parameter
  - Check if move has HighCritical effect (effect_id=44 or similar)
  - Apply crit stage system: +1 stage = 12.5% (1/8), +2 = 25% (1/4)
  - Gen 7+ crit stages: 0=1/24, +1=1/8, +2=1/2, +3+=guaranteed
  - Update all call sites of `calculateCritical()`

  **Must NOT do**:
  - Change base crit rate formula structure
  - Change crit damage multiplier (1.5x in Gen 7+, but currently 2.0x - verify if this should change)
  - Implement Super Luck ability (+1 crit stage)
  - Implement Scope Lens/Razor Claw items (+1 crit stage)
  - Implement Focus Energy (+2 crit stages)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Signature change with multiple call sites
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  - `src/js/battle/actions/actions-selectable.ts:329-336` - `calculateCritical()` function
  - `src/js/pokemons/move-effects.ts` - HighCritical effect class (search for effect 44)
  - `src/js/pokemons/pokedex.ts:450-470` - Move class with effectId

  **Acceptance Criteria**:
  - [ ] `calculateCritical` signature includes move parameter
  - [ ] High-crit moves (Slash, Stone Edge, etc.) have higher crit rate in tests
  - [ ] `npm run check` passes
  - [ ] `npm run test:run` passes

  **Commit**: YES
  - Message: `feat(battle): implement high-crit move crit rate bonus`
  - Files: `src/js/battle/actions/actions-selectable.ts`
  - Pre-commit: `npm run test:run`

---

- [x] 6. Add/Update Tests for Weather Damage Modifiers

  **What to do**:
  - Create or update test file for damage calculation
  - Test Rain boosts Water by 1.5x
  - Test Rain reduces Fire by 0.5x
  - Test Sun boosts Fire by 1.5x
  - Test Sun reduces Water by 0.5x
  - Test neutral weather (none) applies 1.0x
  - Test weather affects damage, not base power

  **Must NOT do**:
  - Test weather setting/clearing (different scope)
  - Test Sand/Hail chip damage (end-of-turn, different scope)
  - Test weather abilities (Drizzle, etc. - not in scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Test-only task, patterns exist
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `src/js/__tests__/status-effects.test.ts` - Existing test patterns
  - `src/js/pokemons/effects/weather-effects.ts` - Functions to test

  **Acceptance Criteria**:
  - [ ] Test file exists with weather modifier tests
  - [ ] `npm run test -- --grep "Weather"` passes with 5+ tests
  - [ ] `npm run test:run` passes

  **Commit**: YES (groups with Task 2)
  - Message: `test(battle): add weather damage modifier tests`
  - Files: `src/js/__tests__/weather-modifiers.test.ts` (or similar)
  - Pre-commit: `npm run test:run`

---

- [x] 7. Add Tests for Screen Damage Modifiers

  **What to do**:
  - Create or update test file for screen modifiers
  - Test Reflect reduces physical damage by 0.5x in singles
  - Test Light Screen reduces special damage by 0.5x in singles
  - Test Reflect reduces physical damage by ~0.67x in doubles
  - Test Light Screen reduces special damage by ~0.67x in doubles
  - Test screens don't affect status moves

  **Must NOT do**:
  - Test screen duration
  - Test screen setting/clearing
  - Test critical hits vs screens (Gen 7+ crits don't ignore screens)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Test-only task
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8)
  - **Blocks**: Task 9
  - **Blocked By**: Task 3

  **References**:
  - `src/js/__tests__/status-effects.test.ts` - Existing test patterns
  - `src/js/battle/battle-field.ts` - Screen enum and SideState

  **Acceptance Criteria**:
  - [ ] Test file exists with screen modifier tests
  - [ ] `npm run test -- --grep "Screen"` passes with 4+ tests
  - [ ] `npm run test:run` passes

  **Commit**: YES (groups with Task 3)
  - Message: `test(battle): add screen damage modifier tests`
  - Files: `src/js/__tests__/screen-modifiers.test.ts` (or similar)
  - Pre-commit: `npm run test:run`

---

- [x] 8. Add Tests for Hazard Switch-In Damage

  **What to do**:
  - Create test file for hazard switch-in mechanics
  - Test Stealth Rock damage scales with type effectiveness
  - Test Spikes damage scales with layers (1/8, 1/6, 1/4)
  - Test Toxic Spikes applies poison (1 layer) or toxic (2 layers)
  - Test Flying types immune to Spikes and Toxic Spikes
  - Test Poison types absorb Toxic Spikes

  **Must NOT do**:
  - Test Levitate immunity (ability not in scope)
  - Test Magic Guard immunity (ability not in scope)
  - Test Heavy-Duty Boots immunity (item not in scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Test-only task
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 4

  **References**:
  - `src/js/pokemons/effects/hazard-effects.ts` - Hazard damage functions
  - `src/js/__tests__/status-effects.test.ts` - Existing test patterns

  **Acceptance Criteria**:
  - [ ] Test file exists with hazard tests
  - [ ] `npm run test -- --grep "Hazard\|Stealth\|Spikes"` passes with 5+ tests
  - [ ] `npm run test:run` passes

  **Commit**: YES (groups with Task 4)
  - Message: `test(battle): add entry hazard switch-in tests`
  - Files: `src/js/__tests__/hazard-effects.test.ts` (or similar)
  - Pre-commit: `npm run test:run`

---

- [x] 9. Add Integration Test for Full Damage Calculation Path

  **What to do**:
  - Create integration test that exercises complete damage path
  - Set up scenario with Weather + Screen + STAB + Type effectiveness
  - Verify modifiers applied in correct order
  - Test critical hit interaction with other modifiers
  - Verify final damage is within expected range

  **Must NOT do**:
  - Test abilities or items
  - Duplicate unit tests - focus on integration

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Integration test requiring setup of multiple systems
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential after Wave 2)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 6, 7, 8

  **References**:
  - `src/js/battle/actions/actions-selectable.ts:274-318` - Damage calculation
  - All test files created in Tasks 6-8

  **Acceptance Criteria**:
  - [ ] Integration test file exists
  - [ ] `npm run test -- --grep "damage.*integration\|full.*damage"` passes
  - [ ] Test verifies Weather → Crit → Random → STAB → Type → Screen order
  - [ ] `npm run test:run` passes

  **Commit**: YES
  - Message: `test(battle): add damage calculation integration test`
  - Files: `src/js/__tests__/damage-integration.test.ts`
  - Pre-commit: `npm run test:run`

---

- [x] 10. Full Regression Test and Cleanup

  **What to do**:
  - Run full test suite
  - Run TypeScript check
  - Run linter
  - Fix any issues found
  - Verify no console.log or debug code left behind
  - Update documentation draft if needed

  **Must NOT do**:
  - Add new features
  - Refactor unrelated code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification and cleanup only
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final, sequential)
  - **Blocks**: None (final task)
  - **Blocked By**: Task 9

  **References**:
  - All files modified in previous tasks

  **Acceptance Criteria**:
  - [ ] `npm run test:run` exits with code 0
  - [ ] `npm run check` exits with code 0
  - [ ] `npm run lint` exits with code 0
  - [ ] `grep -rn "console.log" src/js/battle/` returns no new debug logs

  **Commit**: NO (or small fixup if needed)

---

## Commit Strategy

| After Task | Message                                                                | Files                      | Verification                                      |
| ---------- | ---------------------------------------------------------------------- | -------------------------- | ------------------------------------------------- |
| 1          | `fix(battle): change confusion self-hit to 33% for Gen 7+`             | volatile-status.ts         | npm run test:run                                  |
| 2          | `feat(battle): integrate weather type multipliers in damage calc`      | actions-selectable.ts      | npm run test:run                                  |
| 3          | `feat(battle): integrate screen damage reduction with doubles support` | actions-selectable.ts      | npm run test:run                                  |
| 4          | `feat(battle): apply entry hazard damage on switch-in`                 | battleContext.ts           | npm run test:run                                  |
| 5          | `feat(battle): implement high-crit move crit rate bonus`               | actions-selectable.ts      | npm run test:run                                  |
| 6          | `test(battle): add weather damage modifier tests`                      | weather-modifiers.test.ts  | npm run test:run                                  |
| 7          | `test(battle): add screen damage modifier tests`                       | screen-modifiers.test.ts   | npm run test:run                                  |
| 8          | `test(battle): add entry hazard switch-in tests`                       | hazard-effects.test.ts     | npm run test:run                                  |
| 9          | `test(battle): add damage calculation integration test`                | damage-integration.test.ts | npm run test:run                                  |
| 10         | -                                                                      | -                          | npm run test:run && npm run check && npm run lint |

---

## Success Criteria

### Verification Commands

```bash
npm run test:run      # Expected: 0 failures
npm run check         # Expected: 0 errors
npm run lint          # Expected: 0 errors
```

### Final Checklist

- [ ] Confusion self-hit is 33%
- [ ] Weather modifies damage (Rain/Sun on Water/Fire)
- [ ] Screens reduce damage (singles 0.5x, doubles 0.67x)
- [ ] Hazards damage on switch-in
- [ ] High-crit moves have boosted crit rate
- [ ] All existing tests still pass
- [ ] No abilities or items were implemented (explicitly out of scope)
- [ ] No terrain modifiers were added (explicitly out of scope)
