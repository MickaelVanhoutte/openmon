# Fix Field Effects Logic

## TL;DR

> **Quick Summary**: Fix the critical bug where hazard and weather effects are applied to Pokemon status instead of BattleField. The visual components exist but the backend logic doesn't trigger them.
>
> **Deliverables**:
>
> - Fix `ApplyEffect.execute()` to call `applyHazard()` / weather setter on BattleField
> - Ensure hazard animations play when move is used (rocks/caltrops fly to opponent side)
> - Ensure weather is set on BattleField and visual overlay appears
>
> **Estimated Effort**: Medium
> **Critical Path**: Fix ApplyEffect → Test hazards → Test weather

---

## Context

### Root Cause Analysis

**BUG LOCATION**: `src/js/battle/actions/actions-derived.ts` lines 198-207

```typescript
execute(ctx: BattleContext): void {
    if (!this.target.fainted && this.moveEffect) {
        const result = MOVE_EFFECT_APPLIER.apply(this.moveEffect, [this.target], this.initiator);
        if (result?.effect) {
            this.target.status = result.effect;  // <-- BUG: Sets Pokemon status!
        }
        // ...
    }
}
```

**Problem**:

1. For `HazardEffect`, the `applyHazard(battleField, side)` method exists but is **NEVER called**
2. For `WeatherEffect`, the `apply()` method should call `battleField.setWeather()` but the current code path may not reach it
3. The generic `result.effect` is being set on `this.target.status` which is wrong for field effects

### Current State

- `HazardSprites.svelte` - EXISTS and uses caltrop assets ✓
- `WeatherOverlay.svelte` - EXISTS ✓
- `battleField.addHazard()` - EXISTS ✓
- `battleField.setWeather()` - EXISTS ✓
- `HazardEffect.applyHazard()` - EXISTS but **NEVER CALLED** ✗
- Visual components are integrated in `Battle.svelte` ✓

### What's Broken

1. Using Stealth Rock → No caltrops appear (hazard not added to BattleField)
2. Using Sandstorm → No weather overlay (weather not set on BattleField)
3. Effects incorrectly applied to Pokemon status instead of field

---

## Work Objectives

### Core Deliverables

1. **Fix ApplyEffect to detect and handle field effects properly**
2. **Call `applyHazard(battleField, side)` for hazard moves**
3. **Call weather effect's field setter for weather moves**
4. **Ensure visual components react to field state changes**

### Definition of Done

- [x] Using Stealth Rock shows caltrop sprites on opponent's field side
- [x] Using Sandstorm shows weather overlay
- [x] Weather damage applies at end of turn to non-immune Pokemon
- [x] Entry hazard damage applies when Pokemon switches in
- [x] Build passes

### Must NOT Have

- Effects being set on `Pokemon.status` for field moves
- Duplicate effect applications

---

## TODOs

- [x] 1. Fix ApplyEffect to Handle Field Effects

  **What to do**:
  - In `ApplyEffect.execute()`, detect if effect is a `HazardEffect` or `WeatherEffect`
  - For `HazardEffect`: call `effect.applyHazard(ctx.battleField, targetSide)` where `targetSide` is determined by initiator's side (opposite side for hazard-setting)
  - For `WeatherEffect`: ensure `apply()` receives the battleField context
  - Do NOT set `this.target.status` for field effects

  **Key Code Change**:

  ```typescript
  execute(ctx: BattleContext): void {
      if (!this.target.fainted && this.moveEffect) {
          const effect = MOVE_EFFECT_APPLIER.findEffect(this.moveEffect);

          if (effect instanceof HazardEffect) {
              // Hazards go on opponent's side
              const initiatorSide = ctx.getPokemonSide(this.initiator);
              const targetSide = initiatorSide === 'ally' ? 'enemy' : 'ally';
              effect.applyHazard(ctx.battleField, targetSide);
              ctx.addToStack(new Message(`${effect.constructor.name} was set!`, this.initiator));
              return;
          }

          if (effect instanceof WeatherEffect) {
              effect.apply([ctx.battleField], this.initiator);
              ctx.addToStack(new Message(`The weather changed!`, this.initiator));
              return;
          }

          // Default: status effects on Pokemon
          const result = MOVE_EFFECT_APPLIER.apply(this.moveEffect, [this.target], this.initiator);
          if (result?.effect) {
              this.target.status = result.effect;
          }
          if (result?.message) {
              ctx.addToStack(new Message(result.message, this.initiator));
          }
      }
  }
  ```

  **References**:
  - `src/js/battle/actions/actions-derived.ts:183-209` - ApplyEffect class
  - `src/js/pokemons/effects/hazard-effects.ts:88-90` - applyHazard method
  - `src/js/pokemons/effects/weather-effects.ts:74` - setWeather call

  **Acceptance Criteria**:
  - [ ] Import `HazardEffect` and `WeatherEffect` types
  - [ ] Add instanceof checks for field effects
  - [ ] Call `applyHazard()` with correct side for hazards
  - [ ] Call weather apply with battleField
  - [ ] Do not set `target.status` for field effects
  - [ ] `npm run build` passes

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Commit**: YES
  - Message: `fix(battle): apply hazard/weather effects to battlefield not pokemon status`
  - Files: `src/js/battle/actions/actions-derived.ts`

---

- [ ] 2. Fix Import for Weather Damage

  **What to do**:
  - The current import of `applyWeatherDamage` is for the damage function
  - Need to also import `WeatherEffect` class for instanceof check
  - Verify `HazardEffect` import works correctly

  **References**:
  - `src/js/battle/actions/actions-derived.ts:18` - current imports
  - `src/js/pokemons/effects/hazard-effects.ts` - HazardEffect export
  - `src/js/pokemons/effects/weather-effects.ts` - WeatherEffect export

  **Acceptance Criteria**:
  - [ ] `HazardEffect` imported from hazard-effects.ts
  - [ ] `WeatherEffect` imported from weather-effects.ts
  - [ ] No TypeScript errors

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with TODO 1 - same file changes)

---

- [ ] 3. Verify Weather Effect Application

  **What to do**:
  - Check that `WeatherEffect.apply()` properly receives battleField
  - Ensure `battleField.setWeather()` is called with correct parameters
  - May need to adjust `WeatherEffect.apply()` signature to accept battleField

  **References**:
  - `src/js/pokemons/effects/weather-effects.ts:60-80` - WeatherEffect class
  - `src/js/battle/battle-field.ts:65-70` - setWeather method

  **Acceptance Criteria**:
  - [ ] Using Sandstorm → `battleField.weather` = `Weather.SAND`
  - [ ] Using Rain Dance → `battleField.weather` = `Weather.RAIN`
  - [ ] Weather overlay appears in Battle.svelte

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

---

- [ ] 4. Test Hazard Visual Appearance

  **What to do**:
  - Verify that after using Stealth Rock, `battleField.enemySide.hazards` contains the hazard
  - Verify HazardSprites.svelte renders the caltrop images
  - Check z-index and positioning of hazard sprites

  **References**:
  - `src/lib/battle/HazardSprites.svelte` - renders based on side.hazards
  - `src/lib/battle/Battle.svelte:493-495` - HazardSprites integration

  **Acceptance Criteria**:
  - [ ] Stealth Rock → floating rocks appear on opponent side
  - [ ] Spikes → caltrops appear on opponent side (using caltrop.png asset)
  - [ ] Toxic Spikes → purple caltrops appear

  **Verification**:

  ```
  # Using playwright browser automation:
  1. Start battle
  2. Use Stealth Rock move
  3. Assert: opponent field shows rock sprites
  4. Screenshot: .sisyphus/evidence/stealth-rock-visual.png
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["playwright"]`

---

- [ ] 5. Test Weather Visual Appearance

  **What to do**:
  - Verify that after using Sandstorm, `battleField.weather` is set
  - Verify WeatherOverlay.svelte renders the sand effect
  - Check weather damage applies at end of turn

  **References**:
  - `src/lib/battle/WeatherOverlay.svelte` - renders based on battleField.weather
  - `src/lib/battle/Battle.svelte:488-492` - WeatherOverlay integration

  **Acceptance Criteria**:
  - [ ] Sandstorm → sand overlay appears
  - [ ] End of turn → weather flash + damage to non-immune Pokemon
  - [ ] Message "The Sandstorm rages." appears

  **Verification**:

  ```
  # Using playwright browser automation:
  1. Start battle with Pokemon that knows Sandstorm
  2. Use Sandstorm move
  3. Assert: weather overlay visible with sand effect
  4. End turn
  5. Assert: message about sandstorm appears
  6. Screenshot: .sisyphus/evidence/sandstorm-visual.png
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `["playwright"]`

---

## Execution Strategy

### Sequential Order (dependencies)

1. TODO 1 + 2 (same file, can be done together)
2. TODO 3 (verify weather path works)
3. TODO 4 (test hazard visuals)
4. TODO 5 (test weather visuals)

### Critical Path

TODO 1 (fix ApplyEffect) → All others depend on this

---

## Success Criteria

- [ ] Stealth Rock shows caltrop sprites on opponent field
- [ ] Spikes shows caltrops (scaling with layers)
- [ ] Sandstorm shows weather overlay
- [ ] Weather damage at end of turn works
- [ ] Entry hazard damage on switch-in works
- [ ] Build passes
- [ ] No effects incorrectly applied to Pokemon.status
