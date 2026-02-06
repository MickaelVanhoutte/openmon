# Draft: Full Code Review - Abilities, Weather, Effects

## Requirements (confirmed)

- Full code review of recently added features (abilities, weather, etc.)
- Clean code and remove dead code
- Fix bugs and implementation holes
- Linting compliance
- Add missing test coverage

## Research Findings

### 1. Abilities System

**Source**: Explore agent analysis

**Architecture**:

- Hook-based system with 27 triggers in `AbilityTrigger` enum
- 6 tier files (passive-stats, on-switch, damage-contact, turn-status, suppression, complex)
- Registry in `ability-registry.ts`, Engine in `ability-engine.ts`

**Critical Issues Found**:

1. **Only 4 of 27 triggers are wired up**: ON_SWITCH_IN, ON_BEFORE_MOVE, ON_TRY_HIT, ON_CONTACT
2. **Missing triggers**: ON_TURN_END, ON_TURN_START, ON_MODIFY_ATK/DEF/etc, ON_STAT_CHANGE, ON_STATUS, ON_FAINT
3. **Massive redundancy**: Same abilities defined multiple times (e.g., `slowStart` in Tiers 1, 2, 4)
4. **Dead code**: `hushedVoice`, `assaultVest`, `psychicSurge_priority` defined but not registered
5. **Incomplete damage logic**: `Attack.calculateDamage` ignores ability modifiers (Huge Power, Thick Fat)
6. **Broad suppression bug**: `isSuppressed` disables ALL abilities when attacker has Mold Breaker
7. **Empty hooks**: `healer`, `harvest` have empty function bodies

### 2. Weather System

**Source**: Explore agent analysis

**Working**:

- Core state in `BattleField` (Weather enum: NONE, RAIN, SUN, SAND, HAIL)
- Damage multipliers: Rain boosts Water, Sun boosts Fire
- Residual damage: Sand/Hail deal 1/16 damage
- Weather-setting abilities: Drizzle, Drought, Sand Stream, Snow Warning
- UI overlays working

**Missing/Broken**:

1. **Sandstorm Sp.Def boost**: Rock types should get 1.5x Special Defense - NOT IMPLEMENTED
2. **Snow/Hail inconsistency**: Gen 9 uses "Snow" but enum has "HAIL", Defense boost for Ice types missing
3. **Move accuracy changes**: Thunder/Hurricane 100% accuracy in Rain - NOT IMPLEMENTED
4. **Charge turn skips**: Solar Beam instant in Sun - NOT IMPLEMENTED
5. **Primal weather placeholders**: Primordial Sea/Desolate Land act as standard Rain/Sun
6. **Delta Stream placeholder**: Only shows message, doesn't reduce Flying weaknesses

### 3. Effects System

**Source**: Explore agent analysis

**Architecture**:

- Interface-based DI system with `Effect` interface and `EffectTiming` enum
- Monolithic `move-effects.ts` (6000+ lines) with legacy implementations
- New modular `effects/` directory with: volatile, weather, hazard, terrain, screen, complex-move effects

**Issues**:

1. **Split-brain logic**: Same effects implemented twice (e.g., RainDance in move-effects.ts AND RainEffect in weather-effects.ts)
2. **Incomplete migration**: Battle system favors older implementations
3. **Type safety issues**: Many `apply` methods use `unknown[]` or `any`
4. **Logic duplication**: Toxic poison damage in multiple places

### 4. Test Coverage

**Source**: Explore agent analysis

**Well-Tested**:

- Battle engine (high unit + E2E)
- Abilities (very high - 13+ test files, 6 tiers)
- Weather/Terrain (high)
- Animations (high with GSAP mock)

**Missing Tests**:

- Items/Bag (no unit tests)
- Scripting/Quests (no tests)
- Persistence (no unit tests, E2E only)

**Test Utilities Available**:

- `createTestPokemon()` and `createTestBattleContext()` in `test-helpers.ts`
- GSAP mock in `test-utils.ts`

### 5. Code Quality (from grep)

**55 TODOs found** - many in:

- `mastery-model.ts` - 18 TODOs (all empty implementations)
- `gameContext.ts` - 4 TODOs
- `pokedex.ts` - 4 TODOs (shiny chance, held item, hard AI)
- `battleContext.ts` - 4 TODOs
- `tier6-complex.ts` - 6 TODOs (form changes)

**Console.log statements to remove**:

- `battleContext.ts` - 5 debug console.logs
- `ability-registry.ts` - 1 console.warn
- `experience.ts` - 1 console.error
- `joystick-controller.ts` - 1 console.error

## Open Questions

- None - scope is clear from user request

## Scope Boundaries

- INCLUDE: Abilities, Weather, Effects systems. Dead code. Linting. Test coverage.
- EXCLUDE: New feature development (focus on cleanup/fixes)

## Test Strategy Decision

- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: YES (tests-after for new coverage)
- **Agent-Executed QA**: YES for all verification
