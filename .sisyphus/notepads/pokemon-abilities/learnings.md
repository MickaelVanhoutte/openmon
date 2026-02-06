# Pokemon Abilities - Learnings

## Conventions

<!-- Append new learnings below -->

## Ability System Implementation

- Defined `AbilityTrigger` enum to handle various timing hooks in the battle system.
- Created `AbilityContext` to provide necessary battle state to ability hooks without tight coupling.
- Implemented `Ability` interface using a hook-based approach (object-based) for flexibility and ease of definition.
- Followed existing `EffectTiming` patterns for consistency with the codebase.
- Implemented a central `AbilityRegistry` for efficient lookup of abilities by name.
- Used kebab-case normalization for ability keys to ensure case-insensitive and space-tolerant lookups (e.g., "Huge Power" -> "huge-power").
- Integrated `abilities.json` as the data source for the registry, mapping raw data to the `Ability` interface.
- Added `hasAbility` helper to simplify checking a Pokemon's current ability against a target ability name.

## Ability Engine Implementation

- Created `AbilityEngine` class as the central dispatcher for ability events.
- Implemented `runEvent` method that:
  1. Looks up the ability from registry using `getAbility`
  2. Checks suppression before calling hooks
  3. Maps AbilityTrigger to hook names via `TRIGGER_TO_HOOK` constant
  4. Creates AbilityContext and invokes the hook
  5. Pushes ability activation message to the action stack
- Suppressor abilities (Mold Breaker, Teravolt, Turboblaze) stored as kebab-case strings for consistent matching.
- Speed-based ordering implemented via `sortBySpeed` method for handling simultaneous ability triggers.
- Added `runEventForAll` method for batch processing multiple Pokemon (e.g., double battles).
- PokemonInstance uses `name` property (not `nickname`) for display.
- Message class requires both message string and initiator PokemonInstance.

## Tier 1 Passive Stat Modifier Abilities

- Created tiered structure in `src/js/battle/abilities/tiers/` for organizing abilities by complexity.
- Implemented 57 passive stat modifier abilities in `tier1-passive-stats.ts`.
- Weather values use `Weather.SUN`, `Weather.RAIN`, `Weather.SAND`, `Weather.HAIL` (from `battle-field.ts`).
- Status is of type `Effect` (not string) - check `status.abr` for values like 'PSN', 'BRN', 'PAR', 'TOX'.
- HP percentage calculated as `pokemon.currentHp / pokemon.currentStats.hp`.
- All abilities exported individually and as `tier1PassiveStatAbilities` array for registry integration.
- Damage modifier abilities (Sniper, Adaptability) implemented as placeholders - need damage hook integration.
- Section comments are necessary for navigation in 700+ line file with 50+ ability definitions.
- `npm run check` has heap memory issues in this environment; use LSP diagnostics or tsc directly.

# Test Infrastructure Learnings

- Created `createTestPokemon` and `createTestBattleContext` helpers to allow isolated testing of abilities without needing a full battle setup.
- Used `as unknown as PokemonInstance` for mock objects to avoid complex constructor dependencies while maintaining type safety for the fields we care about.
- Added a `test:abilities` npm script to quickly run all ability-related tests.
- Mocking `AbilityEngine` allows testing how other components interact with the ability system before the engine is fully integrated.

## AbilityEngine Integration (Task 8)

- **Circular Dependencies:** Integrating `AbilityEngine` into `BattleContext` while `AbilityEngine` uses `BattleContext` as a type created a circular dependency. This was resolved by using `import type` in the ability-related files.
- **Delegation Pattern:** `BattleContext` now acts as a facade for the `AbilityEngine`, providing `runAbilityEvent` and `runAbilityEventForAll` methods. This keeps the battle logic clean while allowing easy access to ability triggers.
- **Type Safety:** Used TypeScript type guards (`p is PokemonInstance`) when filtering `playerSide` and `oppSide` to ensure `AbilityEngine` receives valid `PokemonInstance` arrays.

## Tier 2 On-Switch Abilities

- Implemented 35+ on-switch abilities in `src/js/battle/abilities/tiers/tier2-on-switch.ts`.
- All abilities use the `onSwitchIn` hook from the `Ability` interface.
- Weather-setting abilities (Drizzle, Drought, Sand Stream, Snow Warning) use `battleField.setWeather()`.
- Terrain-setting abilities (Electric/Grassy/Psychic/Misty Surge) use `battleField.setTerrain()`.
- Added new volatile statuses to `VolatileStatus` enum: `UNNERVED`, `SLOW_START`, `TRUANT`.
- Filtering opponents requires type guard: `filter((p): p is NonNullable<typeof p> => !!p && !p.fainted)`.
- Stat modifications use `pokemon.changeBattleStats('attack', -1)` for stage changes.
- Intimidate affects all opponents in double battles.
- Download compares total opponent Def vs SpDef to determine which stat to boost.
- Trace copies a random opponent's ability using `currentAbility` property assignment.
- Weather suppression abilities (Air Lock, Cloud Nine) set weather to `Weather.NONE`.
- Mold Breaker family abilities are stubs for now - their actual suppression effect is handled by `AbilityEngine`.

## Tier 3 Damage Modifiers and Contact Abilities

- Implemented 20 abilities in `src/js/battle/abilities/tiers/tier3-damage-contact.ts`.
- Contact abilities use `onDamagingHit` hook with `ctx.move?.category === 'physical'` to check for physical contact.
- Status effects created using simple objects with `abr` property (e.g., `{ abr: 'PAR' }`), cast to `any` to match Effect type.
- `VolatileStatus.INFATUATION` (not INFATUATED) for Cute Charm's infatuation effect.
- `changeBattleStats(stat: string, change: number)` takes two separate arguments, not an object.
- Type immunities use `onTryHit` hook returning `false` to prevent move execution.
- Absorb abilities (Water/Volt Absorb) heal 25% max HP: `Math.floor(ctx.pokemon.currentStats.hp / 4)`.
- Contact recoil abilities (Rough Skin, Iron Barbs) deal 1/8 max HP to attacker.
- Flash Fire uses module-level state variable for activation tracking (simplified approach).
- Effect Spore has 10% chance each for poison, paralysis, or sleep (30% total).
- Stat-boosting immunities (Sap Sipper, Motor Drive, Lightning Rod, Storm Drain) call `changeBattleStats` on hit.
- Wonder Guard, Soundproof, Bulletproof, Overcoat implemented as stubs - need move flag checks for full implementation.

## Attack and Switch Action Integration (Task 10)

- Added `ON_TRY_HIT` trigger to `AbilityTrigger` enum (was missing but `onTryHit` existed in interface).
- Integration points in `Attack.execute()`:
  1. `ON_BEFORE_MOVE` at start - return `false` to prevent move execution.
  2. `ON_TRY_HIT` per target before damage - return `false` for type immunity abilities.
  3. `ON_CONTACT` after damage dealt for physical moves - triggers contact abilities like Rough Skin.
  4. `ON_AFTER_MOVE` at end - for post-move effects.
- Integration in `ChangePokemon.execute()`: `ON_SWITCH_IN` called after hazard application.
- Hook call pattern: `ctx.runAbilityEvent<ReturnType>(trigger, pokemon, target, ...args)`.
- ComboMove handling: ON_CONTACT uses combined damage from both moves.
- Pre-existing heap memory issues with `npm run check` and `tsc --noEmit` - use LSP diagnostics instead.
- All 648 tests pass after integration.

## Tier 5 Suppression Mechanics

- Implemented 29 suppression-related abilities in `src/js/battle/abilities/tiers/tier5-suppression.ts`.
- **Mold Breaker family** (Mold Breaker, Teravolt, Turboblaze) are stubs with `onSwitchIn` hooks for display messages - actual suppression is handled by `AbilityEngine.isSuppressed()`.
- **Neutralizing Gas** sets `battleField.neutralizingGasActive = true` on switch-in via type assertion.
- **Ability changers** (Mummy, Lingering Aroma, Wandering Spirit) use `onDamagingHit` with `ctx.move?.category === 'physical'` check.
- **Ability copiers** (Trace, Receiver, Power of Alchemy) need an `UNCOPYABLE_ABILITIES` list to prevent copying abilities like Trace, Stance Change, As One, etc.
- Trace copies from random valid opponent: filter out fainted and those with uncopyable abilities.
- Receiver/Power of Alchemy copy from `ctx.battleContext.faintedAlly` - requires BattleContext extension.
- **Damp** uses `onTryHit` to block Explosion, Self-Destruct, Misty Explosion - returns `false` to prevent move.
- `suppressedBy` field uses kebab-case ability names array: `['mold-breaker', 'teravolt', 'turboblaze']`.
- **Stat-blocking abilities** (Clear Body, White Smoke, Full Metal Body) use `onStatChange` returning 0 for negative changes.
- **Counter abilities** (Competitive, Defiant) boost stats in response to stat drops via `onStatChange`.
- Mirror Armor reflects stat drops to attacker - needs type assertion for stat parameter: `stat as 'attack' | 'defense' | ...`.
- Full Metal Body cannot be suppressed (no `suppressedBy` field) unlike Clear Body/White Smoke.

## Tier 4 Turn-Based and Status Abilities

- Implemented 41 abilities in `src/js/battle/abilities/tiers/tier4-turn-status.ts`.
- **Turn End abilities** (Speed Boost, Moody, Poison Heal, Rain Dish, Ice Body, Dry Skin, Shed Skin, Hydration, Bad Dreams) use `onTurnEnd` hook.
- **Moody** requires explicit `StatName` type for `changeBattleStats` parameter: `type StatName = 'attack' | 'defense' | ...`.
- **Poison Heal** checks `status.abr === 'PSN' || status.abr === 'TOX'` for poison detection.
- **Weather-based healing** (Rain Dish, Ice Body, Dry Skin) uses `ctx.battleContext.battleField.weather === Weather.X`.
- **Slow Start** uses `VolatileStatus.SLOW_START` volatile to track 5-turn duration; needs `onSwitchIn` to set volatile before `onModifyAtk/onModifySpe` can halve stats.
- **Truant** alternates via `VolatileStatus.TRUANT` volatile; `onBeforeMove` returns false on loafing turns.
- **Status immunity abilities** (Immunity, Limber, Insomnia, etc.) use `onStatus` hook returning `false` to block.
- **Status boost abilities** (Guts, Quick Feet, Marvel Scale, Toxic Boost, Flare Boost) use `onModifyAtk/onModifyDef/onModifySpe/onModifySpA` hooks.
- **Priority modifiers** (Prankster, Gale Wings, Triage) set `priority` field; actual application requires battle logic integration.
- Test setup for volatile-dependent abilities (Slow Start) requires: calling `onSwitchIn` first, then mocking `volatiles.has` to return true.
- Section dividers (=====) are necessary for navigation in 700+ line ability files (consistent with tier1 pattern).

## Tier 6 Complex Abilities

- Added `onSwitchOut` hook to `Ability` interface for exit abilities (Regenerator, Natural Cure).
- Added `ON_SWITCH_OUT` to `AbilityTrigger` enum and mapped to `onSwitchOut` in `TRIGGER_TO_HOOK`.
- **Contrary** uses `onStatChange` hook returning `-change` to invert stat modifications. Edge case: `if (change === 0) return 0` to avoid JavaScript `-0` issues.
- **Simple** doubles stat changes and caps at `+/-6` stages using `Math.min/max`.
- **Unaware** is a marker ability - actual damage calc integration ignores stat stages when this ability is present.
- **Regenerator** heals `Math.floor(maxHp / 3)` on switch-out, capped at maxHp.
- **Natural Cure** sets `ctx.pokemon.status = undefined` on switch-out.
- **Parental Bond** and **Skill Link** are marker abilities - their behavior (double hit, 5 hits) is handled in Attack action.
- **Disguise** uses `(ctx.pokemon as any).disguiseBroken` flag to track form state.
- Form change abilities (Stance Change, Zen Mode, Battle Bond, etc.) are stubs with TODO comments for future implementation.
- **Multiscale/Shadow Shield** use `onSourceModifyDamage` to halve damage when at full HP.
- Shadow Shield cannot be suppressed (no `suppressedBy` field) unlike Multiscale.

## Integration and Regression Testing (Task 13)

- **AbilityEngine Expansion:** Added missing triggers to `AbilityTrigger` enum and `AbilityEngine.runEvent` mapping: `ON_MODIFY_ATK`, `ON_MODIFY_DEF`, `ON_MODIFY_SPA`, `ON_MODIFY_SPD`, `ON_MODIFY_SPE`, `ON_MODIFY_DAMAGE`, `ON_SOURCE_MODIFY_DAMAGE`.
- **Context Enrichment:** Updated `AbilityEngine.runEvent` to automatically detect and set the `move` in `AbilityContext` if a `Move` instance is passed in the arguments.
- **Battle Logic Integration:** Fixed `Attack.execute()` to pass the current move to `ON_TRY_HIT` and `ON_CONTACT` events, enabling abilities like Levitate and Rough Skin to function correctly.
- **Test Helpers Improvement:** Updated `createTestBattleContext` in `test-helpers.ts` to use a real `BattleField` instance instead of a plain object, allowing abilities to call methods like `setWeather()`.
- **Integration Scenarios Tested:**
  - **Intimidate:** Verified stat lowering on switch-in.
  - **Levitate:** Verified type immunity against Ground moves (requires `move` in context).
  - **Drizzle + Swift Swim:** Verified weather setting and subsequent speed modification.
  - **Mold Breaker:** Verified suppression of defender's Levitate.
  - **Rough Skin:** Verified contact damage recoil (requires `move` in context).
- **Regression Testing:** Confirmed that the ability system doesn't break battles for Pokemon without abilities or with unknown abilities.
- **Vitest Environment:** Mocked `src/js/sprites/pmd-sprite-data.ts` in tests to prevent unhandled `fetch` errors during module import in the test environment.
