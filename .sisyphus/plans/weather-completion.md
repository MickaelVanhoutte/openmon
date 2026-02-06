# Complete Weather System Implementation

## TL;DR

> **Quick Summary**: Implement all missing Gen 5-8 weather effects including move accuracy changes (Thunder/Hurricane/Blizzard), Solar Beam charge mechanics, Weather Ball, Growth +2 in Sun, Shore Up healing in Sandstorm, status abilities (Leaf Guard, Overcoat), and weather-extending Rock items.
>
> **Deliverables**:
>
> - Weather-based accuracy overrides for Thunder, Hurricane, Blizzard
> - Solar Beam/Solar Blade no-charge in Sun, half-power in other weathers
> - Weather Ball type/power transformation
> - Growth +2 Attack stages in Sun
> - Shore Up 66% healing in Sandstorm
> - Leaf Guard ability (status immunity in Sun)
> - Overcoat ability (weather damage immunity)
> - Damp Rock, Heat Rock, Icy Rock, Smooth Rock duration extension
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 5 → Task 8

---

## Context

### Original Request

User wants complete weather implementation per Gen 5-8 mechanics, including move accuracy changes (Thunder 100% in Rain), which were missed in a previous plan.

### Interview Summary

**Key Discussions**:

- Target Generation: Gen 5-8 (Hail deals damage, no Snow mechanics)
- Primal Weathers: Excluded (no Primordial Sea, Desolate Land, Delta Stream)
- Form Changes: Excluded (no Castform/Cherrim)
- Duration Items: Included (Rock items extend weather to 8 turns)
- Test Strategy: TDD with Vitest

**Research Findings**:

- **Already Implemented**: Rain Dish, Ice Body, Dry Skin, Hydration abilities in `tier4-turn-status.ts`
- **Accuracy System**: `accuracyApplies()` in `actions-selectable.ts:537-549` has NO weather checks
- **Weather State**: `BattleField.weather` enum (NONE, RAIN, SUN, SAND, HAIL)
- **Test Patterns**: `weather-effects.test.ts` uses `beforeEach` with fresh `BattleField`

### Gap Analysis

**Already Implemented** (skip these):

- Rain Dish (id:44): 1/16 HP in Rain
- Ice Body (id:115): 1/16 HP in Hail
- Dry Skin (id:87): 1/8 HP in Rain, -1/8 HP in Sun, Water absorption, Fire weakness
- Hydration (id:93): Cures status in Rain

**Still Missing**:

1. Move accuracy changes (Thunder, Hurricane, Blizzard)
2. Solar Beam/Solar Blade charge mechanics
3. Weather Ball type/power changes
4. Growth +2 Atk in Sun
5. Shore Up 66% healing in Sandstorm
6. Leaf Guard ability
7. Overcoat ability
8. Rock duration items

---

## Work Objectives

### Core Objective

Complete the weather system by implementing all missing Gen 5-8 weather interactions for moves, abilities, and items.

### Concrete Deliverables

- `src/js/pokemons/effects/weather-effects.ts` - Add `getWeatherAccuracyOverride()` function
- `src/js/battle/actions/actions-selectable.ts` - Integrate weather accuracy in `accuracyApplies()`
- `src/js/pokemons/move-effects.ts` - Update Solar Beam, add Weather Ball, Growth, Shore Up logic
- `src/js/battle/abilities/tiers/tier4-turn-status.ts` - Add Leaf Guard
- `src/js/battle/abilities/tiers/tier1-passive-stats.ts` - Add Overcoat
- `src/js/items/held-items.ts` - Add Rock item duration extension logic
- `src/js/__tests__/weather-effects.test.ts` - Extend with accuracy/move tests

### Definition of Done

- [ ] `npm run test:run` - All tests pass
- [ ] `npm run check` - No TypeScript errors
- [ ] Thunder has 100% accuracy in Rain, 50% in Sun
- [ ] Blizzard has 100% accuracy in Hail
- [ ] Solar Beam skips charge turn in Sun
- [ ] Weather Ball changes type and doubles power

### Must Have

- Accuracy override for Thunder (100% Rain, 50% Sun)
- Accuracy override for Hurricane (100% Rain, 50% Sun)
- Accuracy override for Blizzard (100% Hail)
- Solar Beam no-charge in Sun, half-power in Rain/Sand/Hail
- Weather Ball type transformation + 2x power
- Growth +2 Atk in Sun
- Shore Up 66% healing in Sandstorm
- Leaf Guard status immunity in Sun
- Overcoat weather damage immunity
- Rock items extend weather to 8 turns

### Must NOT Have (Guardrails)

- NO Gen 9 Snow mechanics (keep Hail)
- NO Primal weathers (Primordial Sea, Desolate Land, Delta Stream)
- NO Form changes (Castform, Cherrim)
- NO Utility Umbrella item
- NO Legends Arceus moves (Bleakwind Storm, etc.)
- NO over-engineering accuracy system beyond weather checks
- NO creating new enums or major refactors to Weather type

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> Verification is executed by the agent using tools (Bash for tests, REPL for logic).

### Test Decision

- **Infrastructure exists**: YES (Vitest configured)
- **Automated tests**: TDD (RED-GREEN-REFACTOR)
- **Framework**: Vitest (`npm run test:run`)

### TDD Workflow

Each TODO follows RED-GREEN-REFACTOR:

1. **RED**: Write failing test first
   - Test file: `src/js/__tests__/weather-effects.test.ts` (or new test file)
   - Test command: `npm run test:run`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `npm run test:run`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `npm run test:run`
   - Expected: PASS (still)

### Agent-Executed QA Scenarios (MANDATORY)

Every task includes verification scenarios the agent executes directly:

- **Unit Tests**: Run via `npm run test:run` with assertions
- **TypeScript Check**: Run via `npm run check` for type safety
- **REPL Verification**: Import and test functions directly

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Weather accuracy function + integration
├── Task 2: Leaf Guard ability
└── Task 3: Overcoat ability

Wave 2 (After Wave 1):
├── Task 4: Growth +2 in Sun
├── Task 5: Solar Beam charge mechanics
└── Task 6: Shore Up healing

Wave 3 (After Wave 2):
├── Task 7: Weather Ball
└── Task 8: Rock duration items

Final:
└── Task 9: Integration test & verification
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
| ---- | ---------- | ------ | -------------------- |
| 1    | None       | 9      | 2, 3                 |
| 2    | None       | 9      | 1, 3                 |
| 3    | None       | 9      | 1, 2                 |
| 4    | None       | 9      | 5, 6                 |
| 5    | None       | 7, 9   | 4, 6                 |
| 6    | None       | 9      | 4, 5                 |
| 7    | 5          | 9      | 8                    |
| 8    | None       | 9      | 7                    |
| 9    | 1-8        | None   | None (final)         |

### Agent Dispatch Summary

| Wave  | Tasks   | Recommended Approach                         |
| ----- | ------- | -------------------------------------------- |
| 1     | 1, 2, 3 | Parallel - independent ability/accuracy work |
| 2     | 4, 5, 6 | Parallel - independent move effect work      |
| 3     | 7, 8    | Parallel - Weather Ball + Rock items         |
| Final | 9       | Sequential - integration verification        |

---

## TODOs

---

- [ ] 1. Implement Weather-Based Move Accuracy Overrides (TDD)

  **What to do**:
  - Create `getWeatherAccuracyOverride(battleField, moveName, baseAccuracy)` in `weather-effects.ts`
  - Returns: `{ override: boolean, accuracy: number }` or `null` for no override
  - Thunder/Hurricane: 100 in Rain, 50 in Sun
  - Blizzard: 100 in Hail
  - Integrate into `accuracyApplies()` in `actions-selectable.ts:537-549`
  - Call before the random check, override if returned

  **TDD Cycle**:
  1. RED: Write tests for Thunder accuracy in Rain/Sun/neutral, Blizzard in Hail
  2. GREEN: Implement `getWeatherAccuracyOverride()` function
  3. REFACTOR: Clean up, ensure no duplicate logic

  **Must NOT do**:
  - Do NOT modify the base accuracy values in move data
  - Do NOT change accuracy for non-weather-affected moves
  - Do NOT add weather checks to other parts of damage calculation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Focused single-file changes with clear acceptance criteria
  - **Skills**: [`playwright`]
    - `playwright`: Not strictly needed for unit test task, but available for browser verification
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No UI work required

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/pokemons/effects/weather-effects.ts:9-30` - Existing `getWeatherDamageMultiplier()` pattern to follow
  - `src/js/battle/actions/actions-selectable.ts:537-549` - `accuracyApplies()` method to integrate with

  **Test References**:
  - `src/js/__tests__/weather-effects.test.ts:56-85` - Weather damage multiplier test pattern

  **WHY Each Reference Matters**:
  - `weather-effects.ts:9-30`: Follow same pattern of checking `battleField.weather` and returning multiplier
  - `actions-selectable.ts:537-549`: This is WHERE accuracy is calculated, need to inject weather override

  **Acceptance Criteria**:

  **TDD Tests (RED then GREEN):**
  - [ ] Test file: `src/js/__tests__/weather-effects.test.ts`
  - [ ] Test: Thunder accuracy is 100 in Rain
  - [ ] Test: Thunder accuracy is 50 in Sun
  - [ ] Test: Thunder accuracy is unchanged (70) in neutral weather
  - [ ] Test: Hurricane accuracy is 100 in Rain, 50 in Sun
  - [ ] Test: Blizzard accuracy is 100 in Hail
  - [ ] Test: Other moves return no override
  - [ ] `npm run test:run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify Thunder accuracy override function
    Tool: Bash (node REPL)
    Preconditions: Implementation complete
    Steps:
      1. npm run test:run -- --reporter=verbose src/js/__tests__/weather-effects.test.ts
      2. Assert: All "Weather Accuracy" describe block tests pass
      3. Assert: Exit code 0
    Expected Result: All accuracy override tests pass
    Evidence: Test output captured

  Scenario: TypeScript compilation check
    Tool: Bash
    Preconditions: Code written
    Steps:
      1. npm run check
      2. Assert: No errors in weather-effects.ts or actions-selectable.ts
    Expected Result: Clean TypeScript check
    Evidence: Command output
  ```

  **Commit**: YES
  - Message: `feat(weather): add accuracy overrides for Thunder/Hurricane/Blizzard`
  - Files: `src/js/pokemons/effects/weather-effects.ts`, `src/js/battle/actions/actions-selectable.ts`, `src/js/__tests__/weather-effects.test.ts`
  - Pre-commit: `npm run test:run`

---

- [ ] 2. Implement Leaf Guard Ability (TDD)

  **What to do**:
  - Add `leafGuard` ability to `tier4-turn-status.ts` or appropriate tier file
  - Ability ID: 102
  - Effect: Prevents status conditions while Sun is active
  - Use `onStatus` hook returning `false` to block status

  **TDD Cycle**:
  1. RED: Write test for Leaf Guard preventing PSN/PAR/BRN/SLP in Sun
  2. GREEN: Implement ability with `onStatus` hook
  3. REFACTOR: Ensure consistent with other status immunity abilities

  **Must NOT do**:
  - Do NOT cure existing status (only prevents new status)
  - Do NOT affect moves, only status application

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single ability implementation with existing patterns
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - All skills: Pure backend ability work

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/battle/abilities/tiers/tier4-turn-status.ts:258-268` - `immunity` ability pattern with `onStatus` hook
  - `src/js/battle/abilities/tiers/tier4-turn-status.ts:59-69` - `rainDish` weather check pattern

  **Test References**:
  - `src/js/__tests__/abilities/tier4-turn-status.test.ts` - Existing ability test patterns

  **WHY Each Reference Matters**:
  - `immunity` ability: Same `onStatus` hook pattern, return `false` to block
  - `rainDish`: How to check `ctx.battleContext.battleField.weather === Weather.SUN`

  **Acceptance Criteria**:

  **TDD Tests:**
  - [ ] Test: Leaf Guard prevents PSN in Sun
  - [ ] Test: Leaf Guard prevents PAR in Sun
  - [ ] Test: Leaf Guard allows status when NOT in Sun
  - [ ] Test: Leaf Guard does NOT cure existing status
  - [ ] `npm run test:run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify Leaf Guard blocks status in Sun
    Tool: Bash
    Steps:
      1. npm run test:run -- src/js/__tests__/abilities/tier4-turn-status.test.ts
      2. Assert: Leaf Guard tests pass
    Expected Result: All tests pass
    Evidence: Test output

  Scenario: Verify Leaf Guard exported in ability list
    Tool: Bash (grep)
    Steps:
      1. grep -n "leafGuard" src/js/battle/abilities/tiers/tier4-turn-status.ts
      2. Assert: Found in tier4TurnStatusAbilities array
    Expected Result: Ability exported correctly
    Evidence: Grep output
  ```

  **Commit**: YES
  - Message: `feat(abilities): add Leaf Guard - status immunity in Sun`
  - Files: `src/js/battle/abilities/tiers/tier4-turn-status.ts`, test file
  - Pre-commit: `npm run test:run`

---

- [ ] 3. Implement Overcoat Ability (TDD)

  **What to do**:
  - Add `overcoat` ability (ID: 142)
  - Effect: Immune to weather damage (Sandstorm, Hail)
  - Also immune to powder/spore moves (secondary effect, can implement if time)
  - Integrate with `applyWeatherDamage()` or ability system

  **TDD Cycle**:
  1. RED: Write test for Overcoat preventing Sandstorm/Hail damage
  2. GREEN: Implement ability
  3. REFACTOR: Clean up integration

  **Must NOT do**:
  - Do NOT affect Rock/Ground/Steel/Ice type immunities (those still work)
  - Do NOT implement powder move immunity in this task (optional enhancement)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single ability with clear integration point
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/pokemons/effects/weather-effects.ts:46-67` - `applyWeatherDamage()` function
  - `src/js/battle/abilities/tiers/tier1-passive-stats.ts` - Passive abilities location

  **WHY Each Reference Matters**:
  - Need to add ability check to weather damage calculation or use ability hook

  **Acceptance Criteria**:

  **TDD Tests:**
  - [ ] Test: Overcoat prevents Sandstorm damage
  - [ ] Test: Overcoat prevents Hail damage
  - [ ] Test: Non-Overcoat Pokemon still take weather damage
  - [ ] `npm run test:run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify Overcoat blocks weather damage
    Tool: Bash
    Steps:
      1. npm run test:run -- --grep "Overcoat"
      2. Assert: All Overcoat tests pass
    Expected Result: Weather immunity works
    Evidence: Test output
  ```

  **Commit**: YES
  - Message: `feat(abilities): add Overcoat - weather damage immunity`
  - Files: Ability tier file, test file
  - Pre-commit: `npm run test:run`

---

- [ ] 4. Implement Growth +2 Attack in Sun (TDD)

  **What to do**:
  - Modify Growth move effect to give +2 Attack stages in Sun instead of +1
  - Also +2 Special Attack stages in Sun
  - Find Growth in move effects and add weather check

  **TDD Cycle**:
  1. RED: Write test for Growth +2/+2 in Sun, +1/+1 otherwise
  2. GREEN: Add Sun check to Growth effect
  3. REFACTOR: Clean up

  **Must NOT do**:
  - Do NOT affect other stat-boosting moves

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small move effect modification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/pokemons/move-effects.ts` - Move effects location
  - `src/js/battle/battle-field.ts:1-7` - Weather enum import

  **Acceptance Criteria**:

  **TDD Tests:**
  - [ ] Test: Growth gives +2 Atk, +2 SpAtk in Sun
  - [ ] Test: Growth gives +1 Atk, +1 SpAtk in neutral weather
  - [ ] `npm run test:run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify Growth boosts doubled in Sun
    Tool: Bash
    Steps:
      1. npm run test:run -- --grep "Growth"
      2. Assert: Growth Sun tests pass
    Expected Result: +2/+2 in Sun confirmed
    Evidence: Test output
  ```

  **Commit**: YES
  - Message: `feat(moves): Growth gives +2 Atk/SpAtk in Sun`
  - Files: `src/js/pokemons/move-effects.ts`, test file
  - Pre-commit: `npm run test:run`

---

- [ ] 5. Implement Solar Beam/Solar Blade Charge Mechanics (TDD)

  **What to do**:
  - Solar Beam: Skip charge turn in Sun
  - Solar Beam: Half power (60 → 60, base 120 → 60) in Rain, Sandstorm, Hail
  - Solar Blade: Same mechanics as Solar Beam
  - Check `battleField.weather` before charge phase

  **TDD Cycle**:
  1. RED: Write tests for no-charge in Sun, half-power in other weathers
  2. GREEN: Implement weather checks in charge move logic
  3. REFACTOR: Extract shared logic if both moves exist

  **Must NOT do**:
  - Do NOT change base power in move data
  - Do NOT affect other charging moves (Sky Attack, etc.)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Moderate complexity with charge phase integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Task 7 (Weather Ball may use similar pattern), Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/pokemons/move-effects.ts` - Find existing Solar Beam implementation
  - Search for `SolarBeam` or move_effect_id for charge moves

  **WHY Each Reference Matters**:
  - Need to find existing charge move implementation and add weather bypass

  **Acceptance Criteria**:

  **TDD Tests:**
  - [ ] Test: Solar Beam skips charge in Sun
  - [ ] Test: Solar Beam has half power in Rain
  - [ ] Test: Solar Beam has half power in Sandstorm
  - [ ] Test: Solar Beam has half power in Hail
  - [ ] Test: Solar Beam has normal behavior in neutral weather
  - [ ] `npm run test:run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify Solar Beam charge skip in Sun
    Tool: Bash
    Steps:
      1. npm run test:run -- --grep "Solar"
      2. Assert: All Solar Beam weather tests pass
    Expected Result: Charge mechanics work correctly
    Evidence: Test output
  ```

  **Commit**: YES
  - Message: `feat(moves): Solar Beam/Blade weather-dependent charge and power`
  - Files: `src/js/pokemons/move-effects.ts`, test file
  - Pre-commit: `npm run test:run`

---

- [ ] 6. Implement Shore Up 66% Healing in Sandstorm (TDD)

  **What to do**:
  - Shore Up move heals 50% HP normally
  - In Sandstorm, heals 66% HP instead
  - Find Shore Up move effect and add weather check

  **TDD Cycle**:
  1. RED: Write test for 66% healing in Sandstorm, 50% otherwise
  2. GREEN: Add Sandstorm check to Shore Up
  3. REFACTOR: Clean up

  **Must NOT do**:
  - Do NOT affect other healing moves (Recover, Roost, etc.)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple move effect modification
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/pokemons/move-effects.ts` - Healing move effects
  - Find existing Recover/Roost implementation for healing pattern

  **Acceptance Criteria**:

  **TDD Tests:**
  - [ ] Test: Shore Up heals 66% in Sandstorm
  - [ ] Test: Shore Up heals 50% in neutral weather
  - [ ] `npm run test:run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify Shore Up enhanced healing in Sandstorm
    Tool: Bash
    Steps:
      1. npm run test:run -- --grep "Shore Up"
      2. Assert: Shore Up Sandstorm tests pass
    Expected Result: 66% healing in Sandstorm
    Evidence: Test output
  ```

  **Commit**: YES
  - Message: `feat(moves): Shore Up heals 66% HP in Sandstorm`
  - Files: `src/js/pokemons/move-effects.ts`, test file
  - Pre-commit: `npm run test:run`

---

- [ ] 7. Implement Weather Ball Type/Power Changes (TDD)

  **What to do**:
  - Weather Ball: Base 50 power, Normal type
  - In Sun: Fire type, 100 power
  - In Rain: Water type, 100 power
  - In Sandstorm: Rock type, 100 power
  - In Hail: Ice type, 100 power
  - Modify move type and power dynamically based on `battleField.weather`

  **TDD Cycle**:
  1. RED: Write tests for each weather type/power transformation
  2. GREEN: Implement type/power override in Weather Ball effect
  3. REFACTOR: Clean up, ensure type effectiveness calculation uses transformed type

  **Must NOT do**:
  - Do NOT create new Weather Ball move entry, modify dynamically
  - Do NOT permanently change move data

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Requires understanding move type/power flow
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: Task 9
  - **Blocked By**: Task 5 (may share type override pattern)

  **References**:

  **Pattern References**:
  - `src/js/pokemons/move-effects.ts` - Move effects
  - `src/js/battle/actions/actions-selectable.ts` - Where move type is used for damage

  **WHY Each Reference Matters**:
  - Need to understand how move type affects damage calculation to inject override

  **Acceptance Criteria**:

  **TDD Tests:**
  - [ ] Test: Weather Ball is Normal/50 with no weather
  - [ ] Test: Weather Ball is Fire/100 in Sun
  - [ ] Test: Weather Ball is Water/100 in Rain
  - [ ] Test: Weather Ball is Rock/100 in Sandstorm
  - [ ] Test: Weather Ball is Ice/100 in Hail
  - [ ] `npm run test:run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify Weather Ball transforms correctly
    Tool: Bash
    Steps:
      1. npm run test:run -- --grep "Weather Ball"
      2. Assert: All Weather Ball type/power tests pass
    Expected Result: Type and power transform per weather
    Evidence: Test output
  ```

  **Commit**: YES
  - Message: `feat(moves): Weather Ball type/power changes based on active weather`
  - Files: `src/js/pokemons/move-effects.ts`, test file
  - Pre-commit: `npm run test:run`

---

- [ ] 8. Implement Weather Duration Rock Items (TDD)

  **What to do**:
  - Damp Rock: Rain lasts 8 turns instead of 5
  - Heat Rock: Sun lasts 8 turns instead of 5
  - Icy Rock: Hail lasts 8 turns instead of 5
  - Smooth Rock: Sandstorm lasts 8 turns instead of 5
  - Check holder's item when `applyWeather()` is called

  **TDD Cycle**:
  1. RED: Write tests for each Rock item extending weather
  2. GREEN: Modify `applyWeather()` to accept/check holder's item
  3. REFACTOR: Clean up item checking logic

  **Must NOT do**:
  - Do NOT affect weather set by abilities (Drizzle, etc.) unless holder has item
  - Do NOT change existing item data structure

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Requires item system integration
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/js/pokemons/effects/weather-effects.ts:87-89` - `applyWeather(battleField, turns=5)` method
  - `src/js/items/held-items.ts` - Held items location (if exists)
  - `src/js/battle/abilities/tiers/tier2-on-switch.ts` - Weather-setting abilities (may need integration)

  **WHY Each Reference Matters**:
  - `applyWeather()` is where duration is set, need to check holder's item here
  - Need to understand how abilities set weather to ensure Rock items work with them

  **Acceptance Criteria**:

  **TDD Tests:**
  - [ ] Test: Damp Rock makes Rain Dance last 8 turns
  - [ ] Test: Heat Rock makes Sunny Day last 8 turns
  - [ ] Test: Icy Rock makes Hail last 8 turns
  - [ ] Test: Smooth Rock makes Sandstorm last 8 turns
  - [ ] Test: Without Rock item, weather lasts 5 turns
  - [ ] Test: Rock items work with abilities (Drizzle + Damp Rock = 8 turns)
  - [ ] `npm run test:run` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify Rock items extend weather duration
    Tool: Bash
    Steps:
      1. npm run test:run -- --grep "Rock"
      2. Assert: All Rock item tests pass
    Expected Result: Weather lasts 8 turns with Rock items
    Evidence: Test output
  ```

  **Commit**: YES
  - Message: `feat(items): add weather-extending Rock items (Damp/Heat/Icy/Smooth)`
  - Files: Weather effects, item integration, test file
  - Pre-commit: `npm run test:run`

---

- [ ] 9. Integration Test & Final Verification

  **What to do**:
  - Run full test suite
  - Verify all weather interactions work together
  - Check for regressions in existing weather tests
  - Run TypeScript check for any type errors

  **Must NOT do**:
  - Do NOT add new features
  - Do NOT refactor unrelated code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification only, no implementation
  - **Skills**: [`playwright`]
    - `playwright`: For browser verification if needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: None (final sequential task)
  - **Blocks**: None (final)
  - **Blocked By**: Tasks 1-8

  **References**:
  - All previously created test files

  **Acceptance Criteria**:
  - [ ] `npm run test:run` → ALL tests pass (0 failures)
  - [ ] `npm run check` → No TypeScript errors
  - [ ] `npm run lint` → No new lint errors

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Full test suite passes
    Tool: Bash
    Steps:
      1. npm run test:run
      2. Assert: Exit code 0
      3. Assert: 0 test failures
    Expected Result: All tests pass
    Evidence: Full test output captured

  Scenario: TypeScript compilation clean
    Tool: Bash
    Steps:
      1. npm run check
      2. Assert: No errors in modified files
    Expected Result: Clean TypeScript build
    Evidence: Check output

  Scenario: Lint passes
    Tool: Bash
    Steps:
      1. npm run lint
      2. Assert: No new errors introduced
    Expected Result: Clean lint
    Evidence: Lint output
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                                                | Files                                     | Verification     |
| ---------- | ---------------------------------------------------------------------- | ----------------------------------------- | ---------------- |
| 1          | `feat(weather): add accuracy overrides for Thunder/Hurricane/Blizzard` | weather-effects.ts, actions-selectable.ts | npm run test:run |
| 2          | `feat(abilities): add Leaf Guard - status immunity in Sun`             | tier4-turn-status.ts                      | npm run test:run |
| 3          | `feat(abilities): add Overcoat - weather damage immunity`              | ability tier file                         | npm run test:run |
| 4          | `feat(moves): Growth gives +2 Atk/SpAtk in Sun`                        | move-effects.ts                           | npm run test:run |
| 5          | `feat(moves): Solar Beam/Blade weather-dependent charge and power`     | move-effects.ts                           | npm run test:run |
| 6          | `feat(moves): Shore Up heals 66% HP in Sandstorm`                      | move-effects.ts                           | npm run test:run |
| 7          | `feat(moves): Weather Ball type/power changes based on active weather` | move-effects.ts                           | npm run test:run |
| 8          | `feat(items): add weather-extending Rock items`                        | weather-effects.ts, items                 | npm run test:run |

---

## Success Criteria

### Verification Commands

```bash
npm run test:run          # Expected: All tests pass, 0 failures
npm run check             # Expected: No TypeScript errors
npm run lint              # Expected: No lint errors
```

### Final Checklist

- [ ] Thunder/Hurricane 100% accuracy in Rain, 50% in Sun
- [ ] Blizzard 100% accuracy in Hail
- [ ] Solar Beam skips charge in Sun, half power in Rain/Sand/Hail
- [ ] Weather Ball changes type and doubles power per weather
- [ ] Growth gives +2/+2 in Sun
- [ ] Shore Up heals 66% in Sandstorm
- [ ] Leaf Guard prevents status in Sun
- [ ] Overcoat prevents weather damage
- [ ] Rock items extend weather to 8 turns
- [ ] All existing weather tests still pass
- [ ] NO Primal weathers, NO form changes, NO Snow mechanics
