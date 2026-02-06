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

## Overcoat Ability Implementation
- Implemented Overcoat (ID: 142) which provides immunity to weather damage (Sandstorm, Hail).
- Modified `applyWeatherDamage` in `src/js/pokemons/effects/weather-effects.ts` to accept an optional `ability` parameter.
- Updated `actions-derived.ts` to pass the pokemon's current ability to `applyWeatherDamage`.
- Added Overcoat to `tier1-passive-stats.ts` and registered it in `tier1PassiveStatAbilities`.
- Verified with TDD using `src/js/__tests__/abilities/overcoat.test.ts`.
- Also included immunity for Magic Guard, Sand Veil, Sand Force, Sand Rush, Ice Body, and Snow Cloak in `applyWeatherDamage` for completeness, as they are standard weather immunity abilities.
