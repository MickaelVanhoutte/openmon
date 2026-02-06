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
