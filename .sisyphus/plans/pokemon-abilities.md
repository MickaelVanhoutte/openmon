# Pokemon Abilities Implementation

## TL;DR

> **Quick Summary**: Implement a complete Pokemon ability system with ~300 abilities using an event-driven hook pattern integrated into the battle engine. Follows Pokemon Showdown's object-based ability definition pattern with central event dispatch through BattleContext.
>
> **Deliverables**:
>
> - Ability interface and type definitions
> - Central event dispatcher (`runAbilityEvent`) on BattleContext
> - 5 tiers of ability implementations (~300 total)
> - UI: Ability popup banner component + battle log messages
> - Ability suppression mechanics (Mold Breaker, Neutralizing Gas)
> - Full test coverage with TDD (Vitest)
>
> **Estimated Effort**: XL (Multi-week project)
> **Parallel Execution**: YES - Multiple ability tiers can be implemented in parallel after core architecture
> **Critical Path**: Architecture → Tier 1 → Tier 2 → UI → Remaining Tiers

---

## Context

### Original Request

User requested implementation of ALL Pokemon abilities (~300) as described in abilities.json. Abilities trigger at various battle moments (start of battle, switch, on hit, etc.).

### Interview Summary

**Key Discussions**:

- **Scope**: Full implementation of all ~300 abilities, tiered approach
- **Architecture**: Object-based ability definitions (Pokemon Showdown pattern) with central event dispatcher
- **UI**: Battle log messages + ability popup banner visual indicator
- **Testing**: TDD with Vitest
- **Complex mechanics**: Include ability suppression (Mold Breaker, Neutralizing Gas)

**Research Findings**:

- abilities.json exists with ~300 abilities (id, names, description)
- `PokemonInstance.currentAbility` field exists but is non-functional (just a string)
- Existing Effect system in `move-effects.ts` provides a good pattern reference
- `EffectTiming` enum already has relevant triggers (ON_SWITCH_IN, ON_HIT, etc.)
- Pokemon Showdown uses hook-based object definitions with priority ordering

### Metis Review

**Identified Gaps (addressed)**:

- **Class vs Object pattern**: Decided on object-based (simpler, aligns with Showdown)
- **Event dispatcher scope**: Will add `runAbilityEvent()` to BattleContext
- **UI trigger mechanism**: Ability popup on activation, queued display
- **Double battle handling**: Single battle focus for Phase 1
- **Ability ordering**: Speed-based order for simultaneous triggers

---

## Work Objectives

### Core Objective

Create a complete, event-driven Pokemon ability system that integrates with the existing battle engine, providing accurate ability mechanics for all ~300 abilities with visual feedback.

### Concrete Deliverables

1. `src/js/battle/abilities/` - New directory structure
2. `src/js/battle/abilities/ability-types.ts` - Ability interface and types
3. `src/js/battle/abilities/ability-registry.ts` - Central ability lookup
4. `src/js/battle/abilities/ability-engine.ts` - Event dispatch logic
5. `src/js/battle/abilities/tiers/` - Ability implementations by tier
6. `src/lib/battle/AbilityPopup.svelte` - UI component
7. Modified `BattleContext.ts` - `runAbilityEvent()` method
8. Modified attack/switch actions - Ability hook calls
9. `src/js/__tests__/abilities/` - Test files

### Definition of Done

- [ ] All ~300 abilities have implementations
- [ ] Ability triggers correctly at all relevant battle phases
- [ ] Ability popup banner displays on activation
- [ ] Battle log shows ability messages
- [ ] Suppression mechanics work (Mold Breaker ignores defensive abilities)
- [ ] All tests pass: `npm run test:run -- --grep abilities`
- [ ] svelte-check passes: `npm run check`
- [ ] ESLint passes: `npm run lint`

### Must Have

- Event-driven ability trigger system
- Ability definitions for all ~300 abilities
- UI feedback (popup + messages)
- Type immunity abilities (Levitate, Water Absorb, Flash Fire)
- Stat modifier abilities (Huge Power, Guts)
- On-switch abilities (Intimidate, Drizzle)
- Contact abilities (Rough Skin, Static)
- Suppression mechanics (Mold Breaker)
- Speed-based trigger ordering
- TDD test coverage

### Must NOT Have (Guardrails)

- **No modification to abilities.json schema** - Keep data/logic separation
- **No new global singletons** - All state in BattleContext
- **No refactoring of existing Effect system** - Abilities are separate from move effects
- **No held item interactions** - Items + abilities is Phase 2
- **No ability-changing moves** - Skill Swap, Worry Seed are advanced edge cases
- **No GSAP/AnimeJS animations for abilities** - Text banner + message only
- **No double battle ability interactions** - Single battle focus
- **No combo system integration** - ComboMove and abilities don't interact
- **Maximum 2-3 new EffectTiming values if absolutely needed**
- **No switch statements for ability dispatch** - Use lookup object pattern
- **One file per ability tier maximum** - Avoid 6000-line files

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional - it applies to EVERY task, regardless of test strategy.

### Test Decision

- **Infrastructure exists**: YES (Vitest configured)
- **Automated tests**: TDD
- **Framework**: Vitest

### If TDD Enabled

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**

1. **RED**: Write failing test first
   - Test file: `src/js/__tests__/abilities/[ability-name].test.ts`
   - Test command: `npm run test:run -- --grep "[ability-name]"`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `npm run test:run -- --grep "[ability-name]"`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `npm run test:run`
   - Expected: PASS (all tests)

### Agent-Executed QA Scenarios (MANDATORY - ALL tasks)

> Whether TDD is enabled or not, EVERY task MUST include Agent-Executed QA Scenarios.
> These describe how the executing agent DIRECTLY verifies the deliverable
> by running it - opening browsers, executing commands, sending API requests.

**Verification Tool by Deliverable Type:**

| Type                   | Tool                    | How Agent Verifies             |
| ---------------------- | ----------------------- | ------------------------------ |
| **TypeScript files**   | Bash (npm run check)    | Type checking passes           |
| **Unit tests**         | Bash (npm run test:run) | All tests pass                 |
| **Svelte components**  | Playwright              | Visual verification in browser |
| **Battle integration** | Playwright              | End-to-end battle test         |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Ability Types & Interface
└── Task 2: Ability Registry Structure

Wave 2 (After Wave 1):
├── Task 3: Ability Engine (runAbilityEvent)
├── Task 4: Tier 1 - Passive Stat Modifiers (~50 abilities)
└── Task 5: Unit Tests for Core Architecture

Wave 3 (After Wave 2):
├── Task 6: Tier 2 - On-Switch Abilities (~40 abilities)
├── Task 7: Tier 3 - Damage Modifiers & Contact (~60 abilities)
├── Task 8: BattleContext Integration
└── Task 9: Attack/Switch Action Modifications

Wave 4 (After Wave 3):
├── Task 10: Tier 4 - Turn-Based & Status (~80 abilities)
├── Task 11: Tier 5 - Suppression Mechanics (~30 abilities)
└── Task 12: AbilityPopup.svelte Component

Wave 5 (After Wave 4):
├── Task 13: Tier 6 - Remaining Complex Abilities (~40 abilities)
├── Task 14: Integration Tests
└── Task 15: UI Polish & Final QA

Critical Path: Task 1 → Task 3 → Task 8 → Task 12 → Task 15
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks  | Can Parallelize With |
| ---- | ---------- | ------- | -------------------- |
| 1    | None       | 2, 3, 4 | 2                    |
| 2    | 1          | 3, 4, 5 | 1                    |
| 3    | 1, 2       | 6, 7, 8 | 4, 5                 |
| 4    | 1          | 6, 7    | 3, 5                 |
| 5    | 1, 2       | 14      | 3, 4                 |
| 6    | 3, 4       | 10      | 7, 8, 9              |
| 7    | 3, 4       | 10      | 6, 8, 9              |
| 8    | 3          | 9, 12   | 6, 7                 |
| 9    | 8          | 10, 11  | None                 |
| 10   | 6, 7, 9    | 13      | 11, 12               |
| 11   | 9          | 13      | 10, 12               |
| 12   | 8          | 14, 15  | 10, 11               |
| 13   | 10, 11     | 14, 15  | None                 |
| 14   | 5, 12, 13  | 15      | None                 |
| 15   | 12, 14     | None    | None                 |

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info.

---

- [x] 1. Create Ability Types & Interface Definitions

  **What to do**:
  - Create directory `src/js/battle/abilities/`
  - Create `src/js/battle/abilities/ability-types.ts` with:
    - `AbilityTrigger` enum: `ON_SWITCH_IN`, `ON_BEFORE_MOVE`, `ON_AFTER_MOVE`, `ON_DAMAGE_CALC`, `ON_CONTACT`, `ON_TURN_END`, `ON_TURN_START`, `ON_FAINT`, `ON_STATUS`, `ON_STAT_CHANGE`
    - `AbilityContext` interface: Contains battle context, pokemon, target, move info
    - `Ability` interface with hooks:
      ```typescript
      interface Ability {
      	id: number;
      	name: string;
      	description: string;
      	// Hooks - return modified values or void
      	onSwitchIn?: (ctx: AbilityContext) => void;
      	onBeforeMove?: (ctx: AbilityContext) => boolean; // false = prevent move
      	onModifyAtk?: (ctx: AbilityContext, attack: number) => number;
      	onModifyDef?: (ctx: AbilityContext, defense: number) => number;
      	onModifySpA?: (ctx: AbilityContext, spAtk: number) => number;
      	onModifySpD?: (ctx: AbilityContext, spDef: number) => number;
      	onModifySpe?: (ctx: AbilityContext, speed: number) => number;
      	onModifyDamage?: (ctx: AbilityContext, damage: number) => number;
      	onSourceModifyDamage?: (ctx: AbilityContext, damage: number) => number;
      	onTryHit?: (ctx: AbilityContext) => boolean; // false = immune
      	onDamagingHit?: (ctx: AbilityContext, damage: number) => void;
      	onAfterMove?: (ctx: AbilityContext) => void;
      	onTurnEnd?: (ctx: AbilityContext) => void;
      	onTurnStart?: (ctx: AbilityContext) => void;
      	onFaint?: (ctx: AbilityContext) => void;
      	onStatus?: (ctx: AbilityContext, status: string) => boolean; // false = immune
      	onStatChange?: (ctx: AbilityContext, stat: string, change: number) => number;
      	suppressedBy?: string[]; // List of abilities that suppress this one (Mold Breaker, etc.)
      	priority?: number; // For ordering when multiple abilities trigger
      }
      ```
  - Write unit tests first (TDD)

  **Must NOT do**:
  - Do not create class-based abilities (use object literals)
  - Do not import from move-effects.ts
  - Do not add runtime logic, just type definitions

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure TypeScript type definitions, no complex logic
  - **Skills**: [`git-master`]
    - `git-master`: Will need to commit the new directory structure

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 2, 3, 4
  - **Blocked By**: None (can start immediately)

  **References**:
  - `src/js/pokemons/effects/types.ts:3-15` - EffectTiming enum pattern to follow
  - `src/js/pokemons/effects/types.ts:39-52` - Effect interface pattern
  - `src/js/battle/battle-model.ts:37-41` - TurnPhase enum for reference
  - Pokemon Showdown pattern: abilities are objects with hook functions

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/abilities/ability-types.test.ts`
  - [ ] Test covers: AbilityTrigger enum has all required values
  - [ ] Test covers: Ability interface accepts valid ability object
  - [ ] `npm run test:run -- --grep "ability-types"` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: TypeScript compiles without errors
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run check
      2. Assert: Exit code 0
      3. Assert: No errors mentioning "ability-types"
    Expected Result: Clean compilation
    Evidence: Command output captured

  Scenario: New directory structure exists
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: ls -la src/js/battle/abilities/
      2. Assert: Directory exists
      3. Assert: ability-types.ts exists
    Expected Result: Files created in correct location
    Evidence: ls output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): add ability types and interface definitions`
  - Files: `src/js/battle/abilities/ability-types.ts`, `src/js/__tests__/abilities/ability-types.test.ts`
  - Pre-commit: `npm run check && npm run test:run -- --grep "ability-types"`

---

- [x] 2. Create Ability Registry Structure

  **What to do**:
  - Create `src/js/battle/abilities/ability-registry.ts`
  - Import abilities.json data
  - Create lookup map: `Record<string, Ability>` keyed by ability name (lowercase, kebab-case)
  - Create `getAbility(name: string): Ability | undefined` function
  - Create `hasAbility(pokemon: PokemonInstance, abilityName: string): boolean` helper
  - Handle unknown abilities gracefully (return undefined, log warning)
  - Write unit tests first (TDD)

  **Must NOT do**:
  - Do not implement ability logic here, just registry structure
  - Do not modify abilities.json
  - Do not use tsyringe DI (keep it simple)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple registry pattern, JSON import, lookup function
  - **Skills**: [`git-master`]
    - `git-master`: Commit the registry file

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: Task 1 (needs Ability interface)

  **References**:
  - `src/assets/data/final/beta/abilities.json` - Ability data source
  - `src/js/pokemons/pokedex.ts:185-288` - Pokedex class pattern for data loading
  - `src/js/pokemons/pokedex.ts:730` - PokemonInstance.currentAbility field

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/abilities/ability-registry.test.ts`
  - [ ] Test covers: getAbility returns correct ability for "intimidate"
  - [ ] Test covers: getAbility returns undefined for unknown ability
  - [ ] Test covers: hasAbility correctly checks PokemonInstance.currentAbility
  - [ ] `npm run test:run -- --grep "ability-registry"` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Registry loads all abilities from JSON
    Tool: Bash
    Preconditions: abilities.json exists
    Steps:
      1. Run: npm run test:run -- --grep "ability-registry"
      2. Assert: Test "loads all abilities" passes
      3. Assert: Count matches ~300 abilities
    Expected Result: All abilities accessible via getAbility
    Evidence: Test output captured

  Scenario: Unknown ability handled gracefully
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run test:run -- --grep "unknown ability"
      2. Assert: Test passes
      3. Assert: No runtime errors
    Expected Result: Returns undefined, no crash
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): add ability registry with lookup functions`
  - Files: `src/js/battle/abilities/ability-registry.ts`, `src/js/__tests__/abilities/ability-registry.test.ts`
  - Pre-commit: `npm run check && npm run test:run -- --grep "ability-registry"`

---

- [ ] 3. Create Ability Engine (Event Dispatcher)

  **What to do**:
  - Create `src/js/battle/abilities/ability-engine.ts`
  - Implement `AbilityEngine` class with:
    - `runEvent(eventName: AbilityTrigger, pokemon: PokemonInstance, ctx: BattleContext, ...args): any`
    - Handles ability lookup, suppression checks, priority ordering
    - Returns modified value or undefined
  - Implement suppression logic:
    - Check if attacker has Mold Breaker/Teravolt/Turboblaze
    - If so, skip defensive abilities on target
  - Implement speed-based ordering when multiple Pokemon have triggering abilities
  - Push Message actions to BattleContext.actionStack for ability messages
  - Write unit tests first (TDD)

  **Must NOT do**:
  - Do not implement individual abilities here
  - Do not create global state outside the engine
  - Do not modify BattleContext yet (that's Task 8)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core engine with suppression logic, priority ordering, event dispatch
  - **Skills**: [`git-master`]
    - `git-master`: Commit the engine

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Tasks 1, 2 (needs types and registry)

  **References**:
  - `src/js/context/battleContext.ts:301-307` - actionStack pattern for queueing messages
  - `src/js/battle/actions/actions-derived.ts:17-29` - Message action class
  - `src/js/pokemons/move-effects.ts:1933-1950` - MoveEffectApplier pattern (DI registry lookup)
  - Pokemon Showdown's `runEvent` pattern in sim/battle.ts

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/abilities/ability-engine.test.ts`
  - [ ] Test covers: runEvent calls ability hook when ability exists
  - [ ] Test covers: runEvent returns modified value from hook
  - [ ] Test covers: Mold Breaker suppresses defensive abilities
  - [ ] Test covers: Speed-based ordering when two Pokemon have abilities
  - [ ] `npm run test:run -- --grep "ability-engine"` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Engine dispatches ability events correctly
    Tool: Bash
    Preconditions: Ability types and registry exist
    Steps:
      1. Run: npm run test:run -- --grep "ability-engine"
      2. Assert: All tests pass
      3. Assert: "dispatches to correct hook" test passes
    Expected Result: Events routed to ability hooks
    Evidence: Test output captured

  Scenario: Suppression mechanics work
    Tool: Bash
    Preconditions: Mold Breaker ability defined
    Steps:
      1. Run: npm run test:run -- --grep "Mold Breaker"
      2. Assert: Test passes
      3. Assert: Defensive abilities skipped when Mold Breaker active
    Expected Result: Suppression works correctly
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): add ability engine with event dispatch and suppression`
  - Files: `src/js/battle/abilities/ability-engine.ts`, `src/js/__tests__/abilities/ability-engine.test.ts`
  - Pre-commit: `npm run check && npm run test:run -- --grep "ability-engine"`

---

- [ ] 4. Implement Tier 1 - Passive Stat Modifier Abilities (~50)

  **What to do**:
  - Create `src/js/battle/abilities/tiers/tier1-passive-stats.ts`
  - Implement ~50 passive stat modifier abilities:
    - **Attack modifiers**: Huge Power (2x Atk), Pure Power (2x Atk), Hustle (1.5x Atk, 0.8x Acc), Guts (1.5x Atk when statused), Defeatist (0.5x Atk/SpA below 50% HP)
    - **Defense modifiers**: Fur Coat (2x Def), Marvel Scale (1.5x Def when statused), Fluffy (0.5x contact damage, 2x Fire damage)
    - **Speed modifiers**: Chlorophyll (2x Spe in sun), Swift Swim (2x Spe in rain), Sand Rush (2x Spe in sand), Slush Rush (2x Spe in hail), Quick Feet (1.5x Spe when statused)
    - **Special modifiers**: Solar Power (1.5x SpA in sun, HP loss), Sniper (2.25x crit damage)
    - **STAB modifiers**: Adaptability (2x STAB instead of 1.5x)
  - Each ability uses appropriate hook (onModifyAtk, onModifySpe, etc.)
  - Write unit tests first (TDD)

  **Must NOT do**:
  - Do not implement on-switch abilities (Tier 2)
  - Do not implement contact abilities (Tier 3)
  - Do not modify damage calculation function yet

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Many abilities with stat math, weather checks, status checks
  - **Skills**: [`git-master`]
    - `git-master`: Commit the tier file

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Tasks 6, 7
  - **Blocked By**: Task 1 (needs Ability interface)

  **References**:
  - `src/js/pokemons/pokedex.ts:769-794` - battleStats calculation (where modifiers apply)
  - `src/js/battle/actions/actions-selectable.ts:316-327` - Attack stat used in damage calc
  - `src/js/pokemons/effects/weather-effects.ts` - Weather multiplier pattern to follow
  - `src/js/battle/battle-field.ts` - Weather enum for weather-based abilities

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/abilities/tier1-passive-stats.test.ts`
  - [ ] Test covers: Huge Power doubles physical attack
  - [ ] Test covers: Chlorophyll doubles speed in sun
  - [ ] Test covers: Guts boosts attack when poisoned/burned
  - [ ] Test covers: Defeatist halves stats below 50% HP
  - [ ] Test covers: Adaptability changes STAB to 2x
  - [ ] `npm run test:run -- --grep "tier1"` → PASS (all ~50 abilities)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Huge Power doubles Attack stat
    Tool: Bash
    Preconditions: Tier 1 abilities defined
    Steps:
      1. Run: npm run test:run -- --grep "Huge Power"
      2. Assert: Test passes
      3. Assert: Attack value is 2x base in test
    Expected Result: Physical attack doubled
    Evidence: Test output captured

  Scenario: Weather-based abilities check weather
    Tool: Bash
    Preconditions: Weather system exists
    Steps:
      1. Run: npm run test:run -- --grep "Chlorophyll|Swift Swim"
      2. Assert: Tests pass
      3. Assert: Speed only doubled when correct weather active
    Expected Result: Weather check works
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): implement Tier 1 passive stat modifier abilities`
  - Files: `src/js/battle/abilities/tiers/tier1-passive-stats.ts`, `src/js/__tests__/abilities/tier1-passive-stats.test.ts`
  - Pre-commit: `npm run check && npm run test:run -- --grep "tier1"`

---

- [ ] 5. Create Unit Test Infrastructure for Abilities

  **What to do**:
  - Create `src/js/__tests__/abilities/test-helpers.ts` with:
    - `createTestPokemon(overrides)`: Creates PokemonInstance with specified ability
    - `createTestBattleContext(options)`: Creates minimal BattleContext for testing
    - `mockAbilityEngine()`: Creates testable ability engine instance
  - Create `src/js/__tests__/abilities/index.test.ts` as test suite entry point
  - Ensure tests can run without full battle context (isolation)
  - Add npm script for running ability tests: update package.json

  **Must NOT do**:
  - Do not create end-to-end tests (that's Task 14)
  - Do not test UI components here

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Test helpers and infrastructure, straightforward
  - **Skills**: [`git-master`]
    - `git-master`: Commit test infrastructure

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 14
  - **Blocked By**: Tasks 1, 2 (needs types and registry)

  **References**:
  - `src/js/__tests__/` - Existing test directory structure
  - `vitest.config.ts` - Vitest configuration
  - `src/js/pokemons/pokedex.ts:796-874` - PokemonInstance constructor

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test helper file created: `src/js/__tests__/abilities/test-helpers.ts`
  - [ ] Test covers: createTestPokemon creates valid PokemonInstance
  - [ ] Test covers: createTestBattleContext provides minimal context
  - [ ] `npm run test:run -- --grep "abilities"` → runs all ability tests

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Test helpers create valid instances
    Tool: Bash
    Preconditions: Helper files created
    Steps:
      1. Run: npm run test:run -- --grep "test-helpers"
      2. Assert: All helper tests pass
      3. Assert: No null reference errors
    Expected Result: Helpers work correctly
    Evidence: Test output captured

  Scenario: Ability tests run in isolation
    Tool: Bash
    Preconditions: Helpers available
    Steps:
      1. Run: npm run test:run -- --grep "abilities" --reporter=verbose
      2. Assert: Tests don't require full battle
      3. Assert: Each test runs independently
    Expected Result: Isolated test execution
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `test(abilities): add test infrastructure and helpers`
  - Files: `src/js/__tests__/abilities/test-helpers.ts`, `src/js/__tests__/abilities/index.test.ts`
  - Pre-commit: `npm run test:run -- --grep "abilities"`

---

- [ ] 6. Implement Tier 2 - On-Switch Abilities (~40)

  **What to do**:
  - Create `src/js/battle/abilities/tiers/tier2-on-switch.ts`
  - Implement ~40 on-switch-in abilities using `onSwitchIn` hook:
    - **Stat lowering**: Intimidate (-1 Atk to opponents), Unnerve (prevents berry use)
    - **Weather**: Drizzle (rain), Drought (sun), Sand Stream (sandstorm), Snow Warning (hail)
    - **Terrain**: Grassy Surge, Electric Surge, Psychic Surge, Misty Surge
    - **Copy abilities**: Trace (copies opponent ability), Download (boosts based on defenses)
    - **Form changes**: Forecast (Castform), Imposter (Ditto transforms)
    - **Entry hazard immunity**: Magic Guard (no hazard damage)
  - Push ability activation messages to action stack
  - Write unit tests first (TDD)

  **Must NOT do**:
  - Do not implement exit abilities (Regenerator)
  - Do not implement damage-based abilities

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex on-switch logic, weather/terrain setup, stat changes
  - **Skills**: [`git-master`]
    - `git-master`: Commit tier file

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 3, 4 (needs engine and Tier 1)

  **References**:
  - `src/js/battle/actions/actions-derived.ts:71-141` - ChangePokemon.execute() (switch-in point)
  - `src/js/battle/battle-field.ts` - Weather and BattleField class
  - `src/js/context/battleContext.ts:301-303` - addToStack for messages

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/abilities/tier2-on-switch.test.ts`
  - [ ] Test covers: Intimidate lowers opponent Attack by 1 stage
  - [ ] Test covers: Drizzle sets rain weather
  - [ ] Test covers: Trace copies opponent's ability
  - [ ] Test covers: Download checks target defenses
  - [ ] `npm run test:run -- --grep "tier2"` → PASS (all ~40 abilities)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Intimidate triggers on switch-in
    Tool: Bash
    Preconditions: Tier 2 abilities defined
    Steps:
      1. Run: npm run test:run -- --grep "Intimidate"
      2. Assert: Test passes
      3. Assert: Opponent Attack stage is -1
    Expected Result: Stat lowered correctly
    Evidence: Test output captured

  Scenario: Weather abilities set weather
    Tool: Bash
    Preconditions: Weather system exists
    Steps:
      1. Run: npm run test:run -- --grep "Drizzle|Drought"
      2. Assert: Tests pass
      3. Assert: BattleField.weather is correct value
    Expected Result: Weather set on switch-in
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): implement Tier 2 on-switch abilities`
  - Files: `src/js/battle/abilities/tiers/tier2-on-switch.ts`, `src/js/__tests__/abilities/tier2-on-switch.test.ts`
  - Pre-commit: `npm run check && npm run test:run -- --grep "tier2"`

---

- [ ] 7. Implement Tier 3 - Damage Modifiers & Contact Abilities (~60)

  **What to do**:
  - Create `src/js/battle/abilities/tiers/tier3-damage-contact.ts`
  - Implement ~60 abilities:
    - **Damage reduction**: Filter (0.75x super-effective), Solid Rock (0.75x super-effective), Multiscale (0.5x at full HP)
    - **Damage increase**: Tinted Lens (2x not-very-effective), Technician (1.5x for power ≤60)
    - **Contact abilities**: Rough Skin (1/8 max HP damage on contact), Iron Barbs (1/8 max HP damage), Static (30% paralyze on contact), Flame Body (30% burn on contact), Poison Point (30% poison on contact), Cute Charm (30% infatuation on contact)
    - **Type immunities**: Levitate (Ground immune), Water Absorb (Water heals), Volt Absorb (Electric heals), Flash Fire (Fire boosts Fire moves), Sap Sipper (Grass boosts Attack), Motor Drive (Electric boosts Speed), Lightning Rod (Electric boosts SpA), Storm Drain (Water boosts SpA)
  - Use `onTryHit` for immunities, `onDamagingHit` for contact
  - Write unit tests first (TDD)

  **Must NOT do**:
  - Do not implement turn-based abilities (Tier 4)
  - Do not implement complex form changes

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Many abilities with damage math, type checks, contact checks
  - **Skills**: [`git-master`]
    - `git-master`: Commit tier file

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 8, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 3, 4 (needs engine and Tier 1)

  **References**:
  - `src/js/battle/actions/actions-selectable.ts:299-345` - calculateDamage() for damage modifiers
  - `src/js/battle/battle-model.ts:112-123` - DamageResults class
  - `src/js/pokemons/pokedex.ts:446-506` - Move class (check category for physical = contact)

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/abilities/tier3-damage-contact.test.ts`
  - [ ] Test covers: Levitate makes Ground moves miss (onTryHit returns false)
  - [ ] Test covers: Water Absorb heals when hit by Water move
  - [ ] Test covers: Rough Skin damages attacker on contact
  - [ ] Test covers: Filter reduces super-effective damage
  - [ ] Test covers: Technician boosts moves with power ≤60
  - [ ] `npm run test:run -- --grep "tier3"` → PASS (all ~60 abilities)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Type immunity abilities block moves
    Tool: Bash
    Preconditions: Tier 3 abilities defined
    Steps:
      1. Run: npm run test:run -- --grep "Levitate|Water Absorb"
      2. Assert: Tests pass
      3. Assert: onTryHit returns false for immune type
    Expected Result: Immunity works
    Evidence: Test output captured

  Scenario: Contact abilities trigger on physical moves
    Tool: Bash
    Preconditions: Move category system exists
    Steps:
      1. Run: npm run test:run -- --grep "Rough Skin|Static"
      2. Assert: Tests pass
      3. Assert: Effect only triggers on physical moves
    Expected Result: Contact check works
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): implement Tier 3 damage modifiers and contact abilities`
  - Files: `src/js/battle/abilities/tiers/tier3-damage-contact.ts`, `src/js/__tests__/abilities/tier3-damage-contact.test.ts`
  - Pre-commit: `npm run check && npm run test:run -- --grep "tier3"`

---

- [ ] 8. Integrate Ability Engine into BattleContext

  **What to do**:
  - Modify `src/js/context/battleContext.ts`:
    - Import AbilityEngine
    - Add `abilityEngine: AbilityEngine` property
    - Add `runAbilityEvent(event: AbilityTrigger, pokemon: PokemonInstance, ...args): any` method
    - Add `runAbilityEventForAll(event: AbilityTrigger, side: 'ally' | 'opponent' | 'all', ...args): void` for multi-Pokemon events
  - Ensure engine is initialized in constructor
  - Write unit tests for integration (TDD)

  **Must NOT do**:
  - Do not modify attack/switch actions yet (Task 9)
  - Do not add UI components

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Integration work, adding properties and methods to existing class
  - **Skills**: [`git-master`]
    - `git-master`: Commit the modification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7)
  - **Blocks**: Tasks 9, 12
  - **Blocked By**: Task 3 (needs AbilityEngine)

  **References**:
  - `src/js/context/battleContext.ts:30-108` - BattleContext constructor
  - `src/js/battle/abilities/ability-engine.ts` - AbilityEngine class (from Task 3)
  - `src/js/context/battleContext.ts:301-307` - addToStack pattern

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test covers: BattleContext has runAbilityEvent method
  - [ ] Test covers: runAbilityEvent delegates to AbilityEngine
  - [ ] Test covers: runAbilityEventForAll iterates correct Pokemon
  - [ ] `npm run test:run -- --grep "BattleContext ability"` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: BattleContext exposes ability methods
    Tool: Bash
    Preconditions: AbilityEngine exists
    Steps:
      1. Run: npm run check
      2. Assert: No type errors for runAbilityEvent
      3. Assert: No missing property errors
    Expected Result: Methods added correctly
    Evidence: Type check output captured

  Scenario: Integration with existing battle flow
    Tool: Bash
    Preconditions: BattleContext modified
    Steps:
      1. Run: npm run test:run -- --grep "battleContext"
      2. Assert: Existing tests still pass
      3. Assert: No regressions
    Expected Result: Non-breaking integration
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): integrate AbilityEngine into BattleContext`
  - Files: `src/js/context/battleContext.ts`
  - Pre-commit: `npm run check && npm run test:run`

---

- [ ] 9. Modify Attack and Switch Actions to Call Ability Hooks

  **What to do**:
  - Modify `src/js/battle/actions/actions-selectable.ts`:
    - In `Attack.execute()`:
      - Call `ctx.runAbilityEvent('ON_BEFORE_MOVE', this.initiator)` before move execution
      - Check return value to potentially block move
    - In `Attack.calculateDamage()`:
      - Call ability hooks for attack/defense modifiers
      - Call `ctx.runAbilityEvent('ON_DAMAGE_CALC', ...)` for damage modification
      - Check for type immunities via `onTryHit`
    - After damage applied:
      - Call `ctx.runAbilityEvent('ON_CONTACT', ...)` if move is physical contact
      - Call `ctx.runAbilityEvent('ON_AFTER_MOVE', ...)`
  - Modify `src/js/battle/actions/actions-derived.ts`:
    - In `ChangePokemon.execute()`:
      - Call `ctx.runAbilityEvent('ON_SWITCH_IN', this.target)` after Pokemon enters
      - Handle speed-based ordering for multiple switch-ins (double battles)
  - Write integration tests (TDD)

  **Must NOT do**:
  - Do not modify turn start/end yet (separate task)
  - Do not add UI calls

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core battle flow modifications, multiple integration points
  - **Skills**: [`git-master`]
    - `git-master`: Commit the modifications

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential with Task 8)
  - **Parallel Group**: After Wave 3
  - **Blocks**: Tasks 10, 11
  - **Blocked By**: Task 8 (needs BattleContext integration)

  **References**:
  - `src/js/battle/actions/actions-selectable.ts:104-290` - Attack.execute() method
  - `src/js/battle/actions/actions-selectable.ts:299-345` - calculateDamage() method
  - `src/js/battle/actions/actions-derived.ts:71-141` - ChangePokemon.execute() method
  - `src/js/pokemons/pokedex.ts:446-450` - Move.category for contact check

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test covers: Attack calls onBeforeMove hook
  - [ ] Test covers: Damage calculation includes ability modifiers
  - [ ] Test covers: Type immunity blocks damage (onTryHit)
  - [ ] Test covers: Contact abilities trigger after physical moves
  - [ ] Test covers: Switch triggers onSwitchIn for entering Pokemon
  - [ ] `npm run test:run` → PASS (all tests including existing)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Ability hooks called during attack
    Tool: Bash
    Preconditions: BattleContext integrated, Tier 1-3 abilities exist
    Steps:
      1. Run: npm run test:run -- --grep "attack ability hooks"
      2. Assert: Tests pass
      3. Assert: Hooks called in correct order
    Expected Result: Attack flow includes abilities
    Evidence: Test output captured

  Scenario: Existing battle tests still pass
    Tool: Bash
    Preconditions: Modifications complete
    Steps:
      1. Run: npm run test:run
      2. Assert: All existing tests pass
      3. Assert: No regressions in battle behavior
    Expected Result: Non-breaking changes
    Evidence: Full test output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): add ability hook calls to attack and switch actions`
  - Files: `src/js/battle/actions/actions-selectable.ts`, `src/js/battle/actions/actions-derived.ts`
  - Pre-commit: `npm run check && npm run test:run`

---

- [ ] 10. Implement Tier 4 - Turn-Based & Status Abilities (~80)

  **What to do**:
  - Create `src/js/battle/abilities/tiers/tier4-turn-status.ts`
  - Implement ~80 abilities:
    - **Turn end**: Speed Boost (+1 Spe), Moody (random stat +2/-1), Poison Heal (heal 1/8 if poisoned), Rain Dish (heal 1/16 in rain), Ice Body (heal 1/16 in hail), Dry Skin (heal 1/8 in rain, damage 1/8 in sun), Shed Skin (30% cure status)
    - **Turn start**: Slow Start (halve Atk/Spe for 5 turns), Truant (skip every other turn)
    - **Status immunity**: Immunity (Poison), Limber (Paralysis), Insomnia (Sleep), Vital Spirit (Sleep), Oblivious (Infatuation/Taunt), Own Tempo (Confusion), Magma Armor (Freeze), Water Veil (Burn)
    - **Status boost**: Guts (1.5x Atk when statused), Quick Feet (1.5x Spe when statused), Marvel Scale (1.5x Def when statused), Toxic Boost (1.5x Atk when poisoned), Flare Boost (1.5x SpA when burned)
    - **Priority modifiers**: Prankster (+1 priority to status moves), Gale Wings (+1 priority to Flying moves at full HP)
  - Use `onTurnEnd`, `onTurnStart`, `onStatus` hooks
  - Write unit tests first (TDD)

  **Must NOT do**:
  - Do not implement suppression abilities yet (Tier 5)
  - Do not implement form changes

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Many abilities with status checks, turn tracking, priority modification
  - **Skills**: [`git-master`]
    - `git-master`: Commit tier file

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 11, 12)
  - **Blocks**: Task 13
  - **Blocked By**: Tasks 6, 7, 9 (needs Tier 2, Tier 3, action integration)

  **References**:
  - `src/js/context/battleContext.ts:163-180` - EndTurnChecks action usage
  - `src/js/pokemons/move-effects.ts:36-66` - Sleep effect pattern (status)
  - `src/js/battle/actions/actions-selectable.ts:229-236` - Priority handling in sortActions

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/abilities/tier4-turn-status.test.ts`
  - [ ] Test covers: Speed Boost raises Speed at turn end
  - [ ] Test covers: Immunity prevents Poison status
  - [ ] Test covers: Poison Heal heals instead of damages
  - [ ] Test covers: Prankster adds +1 priority to status moves
  - [ ] Test covers: Slow Start tracks turn count
  - [ ] `npm run test:run -- --grep "tier4"` → PASS (all ~80 abilities)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Turn end abilities trigger correctly
    Tool: Bash
    Preconditions: Tier 4 abilities defined
    Steps:
      1. Run: npm run test:run -- --grep "Speed Boost|Moody"
      2. Assert: Tests pass
      3. Assert: Stats change at turn end only
    Expected Result: Turn timing correct
    Evidence: Test output captured

  Scenario: Status immunity abilities block status
    Tool: Bash
    Preconditions: Status system exists
    Steps:
      1. Run: npm run test:run -- --grep "Immunity|Limber"
      2. Assert: Tests pass
      3. Assert: onStatus returns false for immune status
    Expected Result: Status blocked
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): implement Tier 4 turn-based and status abilities`
  - Files: `src/js/battle/abilities/tiers/tier4-turn-status.ts`, `src/js/__tests__/abilities/tier4-turn-status.test.ts`
  - Pre-commit: `npm run check && npm run test:run -- --grep "tier4"`

---

- [ ] 11. Implement Tier 5 - Suppression Mechanics (~30)

  **What to do**:
  - Create `src/js/battle/abilities/tiers/tier5-suppression.ts`
  - Implement ~30 suppression-related abilities:
    - **Ability ignorers**: Mold Breaker, Teravolt, Turboblaze (ignore target's ability)
    - **Global suppression**: Neutralizing Gas (suppress all abilities while on field)
    - **Ability changers**: Mummy (change attacker's ability to Mummy on contact)
    - **Ability copiers**: Trace (copy opponent's ability), Receiver/Power of Alchemy (copy fainted ally's ability)
    - **Ability blockers**: Damp (blocks Explosion, Self-Destruct, Aftermath)
  - Add suppression state tracking to AbilityEngine
  - Modify `runEvent` to check suppression before calling hooks
  - Write unit tests first (TDD)

  **Must NOT do**:
  - Do not implement ability-changing moves (Skill Swap, etc.)
  - Do not implement held item interactions

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex suppression logic, state tracking, edge cases
  - **Skills**: [`git-master`]
    - `git-master`: Commit tier file

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 10, 12)
  - **Blocks**: Task 13
  - **Blocked By**: Task 9 (needs action integration)

  **References**:
  - `src/js/battle/abilities/ability-engine.ts` - AbilityEngine.runEvent for suppression check
  - `src/js/battle/abilities/ability-types.ts` - Ability.suppressedBy field
  - Pokemon Showdown: Neutralizing Gas implementation pattern

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/abilities/tier5-suppression.test.ts`
  - [ ] Test covers: Mold Breaker ignores Levitate (Ground hits)
  - [ ] Test covers: Neutralizing Gas suppresses all other abilities
  - [ ] Test covers: Mummy changes attacker's ability
  - [ ] Test covers: Trace copies opponent's ability on switch-in
  - [ ] Test covers: Damp prevents Explosion from working
  - [ ] `npm run test:run -- --grep "tier5"` → PASS (all ~30 abilities)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Mold Breaker ignores defensive abilities
    Tool: Bash
    Preconditions: Tier 5 abilities defined
    Steps:
      1. Run: npm run test:run -- --grep "Mold Breaker"
      2. Assert: Test passes
      3. Assert: Levitate doesn't block Ground move
    Expected Result: Suppression works
    Evidence: Test output captured

  Scenario: Neutralizing Gas affects all Pokemon
    Tool: Bash
    Preconditions: AbilityEngine tracks suppression state
    Steps:
      1. Run: npm run test:run -- --grep "Neutralizing Gas"
      2. Assert: Tests pass
      3. Assert: Other abilities don't trigger while active
    Expected Result: Global suppression works
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): implement Tier 5 suppression mechanics`
  - Files: `src/js/battle/abilities/tiers/tier5-suppression.ts`, `src/js/__tests__/abilities/tier5-suppression.test.ts`
  - Pre-commit: `npm run check && npm run test:run -- --grep "tier5"`

---

- [ ] 12. Create AbilityPopup.svelte Component

  **What to do**:
  - Create `src/lib/battle/AbilityPopup.svelte` with:
    - Props: `abilityName: string`, `pokemonName: string`, `visible: boolean`
    - Design: Horizontal banner that slides in from side, shows "[Pokemon]'s [Ability]!"
    - Auto-dismiss after 1.5 seconds
    - Queue multiple popups if abilities trigger in sequence
    - Use Svelte 5 runes ($state, $props, $effect)
  - Create `src/js/battle/ability-popup-store.ts` for popup state management
  - Add popup trigger in AbilityEngine when ability activates
  - Style using existing SCSS patterns from `src/app.scss`
  - Write component tests

  **Must NOT do**:
  - Do not use GSAP or AnimeJS for animations (CSS transitions only)
  - Do not block battle execution while popup displays
  - Do not modify battle message log (that's separate)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with animations, Svelte 5 runes, styling
  - **Skills**: [`frontend-ui-ux`, `git-master`]
    - `frontend-ui-ux`: UI design and Svelte component
    - `git-master`: Commit the component

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 10, 11)
  - **Blocks**: Tasks 14, 15
  - **Blocked By**: Task 8 (needs BattleContext integration)

  **References**:
  - `src/lib/battle/` - Existing battle UI components
  - `src/lib/common/Modal.svelte` - Modal pattern for overlay
  - `src/app.scss` - Global styles and CSS variables
  - AGENTS.md: Svelte 5 runes migration reference

  **Acceptance Criteria**:

  **TDD (Svelte component testing):**
  - [ ] Component file created: `src/lib/battle/AbilityPopup.svelte`
  - [ ] Store file created: `src/js/battle/ability-popup-store.ts`
  - [ ] Test covers: Popup renders with correct ability name
  - [ ] Test covers: Popup auto-dismisses after 1.5s
  - [ ] Test covers: Multiple popups queue correctly
  - [ ] `npm run check` → PASS (no Svelte errors)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Ability popup displays correctly
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173/
      2. Start a battle with Pokemon that has Intimidate
      3. Switch in the Intimidate Pokemon
      4. Wait for: .ability-popup visible (timeout: 5s)
      5. Assert: .ability-popup text contains "Intimidate"
      6. Wait for: .ability-popup not visible (timeout: 3s)
      7. Screenshot: .sisyphus/evidence/task-12-ability-popup.png
    Expected Result: Popup appears and dismisses
    Evidence: .sisyphus/evidence/task-12-ability-popup.png

  Scenario: Multiple popups queue
    Tool: Playwright (playwright skill)
    Preconditions: Battle with two Pokemon having switch-in abilities
    Steps:
      1. Trigger double switch-in (double battle or setup)
      2. Assert: First popup appears
      3. Assert: Second popup appears after first dismisses
      4. Screenshot: .sisyphus/evidence/task-12-popup-queue.png
    Expected Result: Popups display in sequence
    Evidence: .sisyphus/evidence/task-12-popup-queue.png
  ```

  **Commit**: YES
  - Message: `feat(abilities): add AbilityPopup UI component`
  - Files: `src/lib/battle/AbilityPopup.svelte`, `src/js/battle/ability-popup-store.ts`
  - Pre-commit: `npm run check`

---

- [ ] 13. Implement Tier 6 - Remaining Complex Abilities (~40)

  **What to do**:
  - Create `src/js/battle/abilities/tiers/tier6-complex.ts`
  - Implement remaining ~40 complex abilities:
    - **Form changes**: Stance Change (Aegislash), Zen Mode (Darmanitan), Battle Bond (Greninja), Disguise (Mimikyu)
    - **Multi-effect**: Parental Bond (hit twice at reduced power), Skill Link (multi-hit always 5)
    - **Field interactions**: Aura Break (reverse Fairy/Dark Auras), Teravolt/Turboblaze (Mold Breaker variants)
    - **Special conditions**: Contrary (invert stat changes), Simple (double stat changes), Unaware (ignore stat changes)
    - **Redirect**: Lightning Rod (redirect Electric moves), Storm Drain (redirect Water moves), Follow Me-like behavior
    - **Exit abilities**: Regenerator (heal 1/3 on switch-out), Natural Cure (cure status on switch-out)
  - Some abilities may be stubs if extremely complex (note in code)
  - Write unit tests first (TDD)

  **Must NOT do**:
  - Do not implement Mega Evolution triggers
  - Do not implement Z-Move interactions

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex edge cases, form changes, multi-effect abilities
  - **Skills**: [`git-master`]
    - `git-master`: Commit tier file

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential after Tier 4, 5)
  - **Parallel Group**: Wave 5
  - **Blocks**: Tasks 14, 15
  - **Blocked By**: Tasks 10, 11 (needs Tier 4, 5)

  **References**:
  - `src/js/pokemons/pokedex.ts:1097-1110` - Pokemon evolve() for form change pattern
  - `src/js/battle/actions/actions-selectable.ts:60-81` - Switch action for exit abilities
  - Pokemon Showdown: Parental Bond, Disguise implementations

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/abilities/tier6-complex.test.ts`
  - [ ] Test covers: Contrary inverts stat changes
  - [ ] Test covers: Simple doubles stat changes
  - [ ] Test covers: Regenerator heals on switch-out
  - [ ] Test covers: Parental Bond hits twice
  - [ ] Test covers: Disguise blocks first hit
  - [ ] `npm run test:run -- --grep "tier6"` → PASS (all ~40 abilities)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Contrary inverts stat changes
    Tool: Bash
    Preconditions: Tier 6 abilities defined
    Steps:
      1. Run: npm run test:run -- --grep "Contrary"
      2. Assert: Test passes
      3. Assert: +1 becomes -1, -1 becomes +1
    Expected Result: Inversion works
    Evidence: Test output captured

  Scenario: Exit abilities trigger on switch
    Tool: Bash
    Preconditions: Switch action calls ability hook
    Steps:
      1. Run: npm run test:run -- --grep "Regenerator|Natural Cure"
      2. Assert: Tests pass
      3. Assert: Heal/cure happens before Pokemon leaves
    Expected Result: Exit timing correct
    Evidence: Test output captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): implement Tier 6 complex abilities`
  - Files: `src/js/battle/abilities/tiers/tier6-complex.ts`, `src/js/__tests__/abilities/tier6-complex.test.ts`
  - Pre-commit: `npm run check && npm run test:run -- --grep "tier6"`

---

- [ ] 14. Create Integration Tests

  **What to do**:
  - Create `src/js/__tests__/abilities/integration.test.ts`
  - Test complete battle flows with abilities:
    - Full battle with Intimidate → attack → Speed Boost → turn end
    - Type immunity blocking damage (Levitate vs Earthquake)
    - Weather ability setting weather and affecting other abilities
    - Suppression (Mold Breaker vs Levitate)
    - Contact ability triggering (Rough Skin damage)
  - Create `src/js/__tests__/abilities/regression.test.ts`
  - Test that existing battle behavior works with ability system added

  **Must NOT do**:
  - Do not test UI (that's E2E in Task 15)
  - Do not test individual abilities (covered in tier tests)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Integration testing with existing patterns
  - **Skills**: [`git-master`]
    - `git-master`: Commit test files

  **Parallelization**:
  - **Can Run In Parallel**: NO (needs most components)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 5, 12, 13 (needs test infra, UI, all abilities)

  **References**:
  - `src/js/__tests__/` - Existing test patterns
  - `src/js/__tests__/abilities/test-helpers.ts` - Test helpers from Task 5
  - `vitest.config.ts` - Vitest configuration

  **Acceptance Criteria**:

  **TDD (tests first):**
  - [ ] Test file created: `src/js/__tests__/abilities/integration.test.ts`
  - [ ] Test file created: `src/js/__tests__/abilities/regression.test.ts`
  - [ ] Test covers: Full battle with multiple ability triggers
  - [ ] Test covers: Ability interactions (suppression, weather)
  - [ ] Test covers: No regression in existing battle tests
  - [ ] `npm run test:run` → PASS (all tests)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Full integration test suite passes
    Tool: Bash
    Preconditions: All tiers implemented
    Steps:
      1. Run: npm run test:run -- --grep "integration"
      2. Assert: All integration tests pass
      3. Assert: No flaky tests
    Expected Result: Integration verified
    Evidence: Test output captured

  Scenario: No regressions in existing tests
    Tool: Bash
    Preconditions: Ability system integrated
    Steps:
      1. Run: npm run test:run
      2. Assert: All tests pass
      3. Assert: Test count same or higher than before
    Expected Result: Non-breaking changes
    Evidence: Full test output captured
  ```

  **Commit**: YES
  - Message: `test(abilities): add integration and regression tests`
  - Files: `src/js/__tests__/abilities/integration.test.ts`, `src/js/__tests__/abilities/regression.test.ts`
  - Pre-commit: `npm run test:run`

---

- [ ] 15. UI Polish and Final QA

  **What to do**:
  - Integrate AbilityPopup into Battle.svelte component
  - Add ability messages to battle log format: "[Pokemon]'s [Ability]! [Effect]"
  - Polish popup styling (colors, fonts, animations)
  - Test all ability UI in browser with Playwright
  - Run full test suite and fix any issues
  - Run `npm run check` and `npm run lint` and fix issues
  - Performance check: Battle turn with abilities < 100ms

  **Must NOT do**:
  - Do not add new features
  - Do not refactor existing code

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI polish, E2E testing, visual verification
  - **Skills**: [`playwright`, `frontend-ui-ux`, `git-master`]
    - `playwright`: E2E browser testing
    - `frontend-ui-ux`: UI polish
    - `git-master`: Final commits

  **Parallelization**:
  - **Can Run In Parallel**: NO (final task)
  - **Parallel Group**: After Wave 5
  - **Blocks**: None (final)
  - **Blocked By**: Tasks 12, 14 (needs UI and integration tests)

  **References**:
  - `src/lib/battle/Battle.svelte` - Main battle component
  - `src/lib/battle/AbilityPopup.svelte` - Popup component from Task 12
  - `src/app.scss` - Global styles

  **Acceptance Criteria**:

  **All checks pass:**
  - [ ] `npm run check` → 0 errors
  - [ ] `npm run lint` → 0 errors
  - [ ] `npm run test:run` → All tests pass
  - [ ] `npm run build` → Builds successfully

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Complete battle with abilities works visually
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173/
      2. Load a save or start new game
      3. Enter a wild battle
      4. Switch to Pokemon with Intimidate
      5. Wait for: .ability-popup visible (timeout: 5s)
      6. Assert: Popup shows "Intimidate"
      7. Assert: Battle log contains "Intimidate"
      8. Use a move, verify damage calculation includes abilities
      9. Screenshot: .sisyphus/evidence/task-15-full-battle.png
    Expected Result: Full battle flow works with abilities
    Evidence: .sisyphus/evidence/task-15-full-battle.png

  Scenario: Performance within acceptable limits
    Tool: Bash
    Preconditions: All abilities implemented
    Steps:
      1. Run: npm run test:run -- --grep "performance"
      2. Assert: Battle turn with 4 ability triggers < 100ms
    Expected Result: Performance acceptable
    Evidence: Performance test output captured

  Scenario: All linting and checks pass
    Tool: Bash
    Preconditions: All code complete
    Steps:
      1. Run: npm run check
      2. Assert: Exit code 0
      3. Run: npm run lint
      4. Assert: Exit code 0
      5. Run: npm run build
      6. Assert: Build succeeds
    Expected Result: Production ready
    Evidence: Command outputs captured
  ```

  **Commit**: YES
  - Message: `feat(abilities): complete ability system with UI integration`
  - Files: Various polish files
  - Pre-commit: `npm run check && npm run lint && npm run test:run && npm run build`

---

## Commit Strategy

| After Task | Message                                                        | Files                   | Verification     |
| ---------- | -------------------------------------------------------------- | ----------------------- | ---------------- |
| 1          | `feat(abilities): add ability types and interface definitions` | ability-types.ts        | npm run check    |
| 2          | `feat(abilities): add ability registry with lookup functions`  | ability-registry.ts     | npm run test:run |
| 3          | `feat(abilities): add ability engine with event dispatch`      | ability-engine.ts       | npm run test:run |
| 4          | `feat(abilities): implement Tier 1 passive stat modifiers`     | tier1-passive-stats.ts  | npm run test:run |
| 5          | `test(abilities): add test infrastructure and helpers`         | test-helpers.ts         | npm run test:run |
| 6          | `feat(abilities): implement Tier 2 on-switch abilities`        | tier2-on-switch.ts      | npm run test:run |
| 7          | `feat(abilities): implement Tier 3 damage/contact abilities`   | tier3-damage-contact.ts | npm run test:run |
| 8          | `feat(abilities): integrate AbilityEngine into BattleContext`  | battleContext.ts        | npm run test:run |
| 9          | `feat(abilities): add ability hooks to attack/switch actions`  | actions-selectable.ts   | npm run test:run |
| 10         | `feat(abilities): implement Tier 4 turn/status abilities`      | tier4-turn-status.ts    | npm run test:run |
| 11         | `feat(abilities): implement Tier 5 suppression mechanics`      | tier5-suppression.ts    | npm run test:run |
| 12         | `feat(abilities): add AbilityPopup UI component`               | AbilityPopup.svelte     | npm run check    |
| 13         | `feat(abilities): implement Tier 6 complex abilities`          | tier6-complex.ts        | npm run test:run |
| 14         | `test(abilities): add integration and regression tests`        | integration.test.ts     | npm run test:run |
| 15         | `feat(abilities): complete ability system with UI`             | Various                 | npm run build    |

---

## Success Criteria

### Verification Commands

```bash
# All unit tests pass
npm run test:run  # Expected: 0 failures

# All ability tests pass
npm run test:run -- --grep "abilities"  # Expected: ~300+ passing tests

# Type checking passes
npm run check  # Expected: 0 errors

# Linting passes
npm run lint  # Expected: 0 errors

# Production build works
npm run build  # Expected: Successful build

# Dev server runs
npm run dev  # Expected: Server starts on localhost:5173
```

### Final Checklist

- [ ] All ~300 abilities implemented
- [ ] Ability triggers work at all relevant battle phases
- [ ] AbilityPopup displays when abilities activate
- [ ] Battle log shows ability messages
- [ ] Mold Breaker/Neutralizing Gas suppression works
- [ ] Speed-based ability ordering works
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build succeeds
- [ ] Performance: Battle turn with abilities < 100ms
