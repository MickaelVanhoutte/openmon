# Weather Completion - Learnings

## 2026-02-06 Session Start

### Existing Patterns

- Weather state in `BattleField.weather` enum (NONE, RAIN, SUN, SAND, HAIL)
- Weather damage multiplier: `getWeatherDamageMultiplier(battleField, moveType)` in weather-effects.ts
- Accuracy calculation: `accuracyApplies()` in actions-selectable.ts:537-549
- Turn-end abilities: `onTurnEnd(ctx)` pattern in tier4-turn-status.ts
- Status immunity: `onStatus` hook returning `false` to block

### Test Patterns

- Use `beforeEach` with fresh `BattleField`
- Test file: `src/js/__tests__/weather-effects.test.ts`
- Command: `npm run test:run`

## Leaf Guard Ability Implementation

- Implemented Leaf Guard (ID: 102) in `src/js/battle/abilities/tiers/tier4-turn-status.ts`.
- Added tests in `src/js/__tests__/abilities/tier4-turn-status.test.ts`.
- Leaf Guard prevents status conditions when weather is SUN.
- Verified with `npm run test:run -- -t "Leaf Guard"`.
- Followed existing patterns for status immunity abilities.

## Weather-Based Accuracy Overrides

- Implemented `getWeatherAccuracyOverride` in `weather-effects.ts` to handle move-specific accuracy changes under different weather conditions.
- Integrated the override into `accuracyApplies` in `actions-selectable.ts`.
- Accuracy rules:
  - Thunder/Hurricane: 100% in Rain, 50% in Sun.
  - Blizzard: 100% in Hail.
- The override is applied before stage modifiers, meaning a 100% accuracy move can still miss if accuracy is lowered or evasion is raised (consistent with the instruction to use it as the "accuracy value").

## Solar Beam / Solar Blade Weather Mechanics

- Implemented weather-dependent charge and power for Solar Beam and Solar Blade (Effect ID: 152).
- Modified `getWeatherDamageMultiplier` in `weather-effects.ts` to accept an optional `moveName` parameter.
- Updated `Attack.calculateDamage` in `actions-selectable.ts` to pass the move name to the multiplier function.
- Solar Beam/Blade power is halved (0.5x) in Rain, Sandstorm, and Hail.
- Modified `SolarBeam.apply` in `move-effects.ts` to skip the charge turn in Sun.
- Used `container.resolve<BattleField>('BattleField')` inside `SolarBeam.apply` to access the current weather.
- Registered the `BattleField` instance in the `BattleContext` constructor to make it available for injection/resolution.
- Verified with TDD using `src/js/__tests__/solar-beam.test.ts`.
- Note: Solar Beam and Solar Blade share the same effect ID (152), so the logic applies to both.
## Growth Move Effect Implementation
- Growth move (effect ID 317) now gives +2 Attack and +2 Special Attack in Sun.
- Implementation uses `container.resolve<BattleField>('BattleField')` to access current weather.
- Verified with isolated test `src/js/__tests__/growth.test.ts`.
- Note: The class was previously named `WorkUp` in `move-effects.ts` but had ID 317 (which is Growth). Renamed class to `Growth` and updated registry.
