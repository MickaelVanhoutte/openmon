# Draft: Complete Weather System Implementation

## Current State (from exploration)

### Already Implemented ✓

- **Weather state management**: `BattleField` tracks active weather + turns
- **Core damage multipliers**: Rain (Water 1.5x, Fire 0.5x), Sun (Fire 1.5x, Water 0.5x)
- **End-of-turn damage**: Sandstorm/Hail deal 1/16 to non-immune types
- **Stat boosts**: Sandstorm gives Rock-types 1.5x SpDef
- **Weather-setting moves**: Rain Dance, Sunny Day, Sandstorm, Hail
- **Weather-setting abilities**: Drizzle, Drought, Sand Stream, Snow Warning
- **Speed abilities**: Swift Swim, Chlorophyll, Sand Rush, Slush Rush
- **Power abilities**: Solar Power, Sand Force
- **Team support**: Flower Gift
- **Suppression**: Air Lock, Cloud Nine
- **Healing moves**: Moonlight/Morning Sun/Synthesis (reduced healing in non-Sun)

### Identified Gaps (from Serebii reference)

#### Move Accuracy Changes

- Thunder: 100% in Rain, 50% in Sun
- Hurricane: 100% in Rain, 50% in Sun
- Blizzard: 100% in Hail/Snow

#### Move Behavior Changes

- Solar Beam: No charge in Sun, half power in Rain/Sand/Hail
- Solar Blade: No charge in Sun
- Weather Ball: Type changes + power doubles based on weather
- Growth: +2 Attack stages in Sun (instead of +1)
- Shore Up: 66% healing in Sandstorm

#### Passive Abilities (HP each turn)

- Rain Dish: 1/16 HP recovery in Rain
- Ice Body: 1/16 HP recovery in Hail/Snow
- Dry Skin: 1/8 HP recovery in Rain, 1/8 HP damage in Sun + Fire weakness

#### Status Abilities

- Hydration: Cures status at end of turn in Rain
- Leaf Guard: Prevents status in Sun

#### Duration Items

- Damp Rock: Rain lasts 8 turns
- Heat Rock: Sun lasts 8 turns
- Icy Rock: Hail/Snow lasts 8 turns
- Smooth Rock: Sandstorm lasts 8 turns

#### Generation 9 Changes (Snow replaces Hail)

- Snow: Ice-types get 1.5x Defense (no damage to non-Ice)
- Hail still exists but Snow is the new default from Snow Warning

#### Form Changes

- Castform: Changes form based on weather (Normal/Fire/Water/Ice)
- Cherrim: Sunshine Form in Sun (boosts team stats)

#### Primal Weathers

- Primordial Sea: Heavy Rain (Fire moves fail entirely)
- Desolate Land: Harsh Sun (Water moves fail entirely)
- Delta Stream: Strong Winds (removes Flying weaknesses)

## Research Findings (Serebii)

### Utility Umbrella Item

- Holder ignores effects of Sun and Rain

### Overcoat Ability

- Prevents weather damage (already immune to Sandstorm/Hail)

## User Decisions (Confirmed)

- **Target Generation**: Gen 5-8 (Hail with damage, no Snow mechanics)
- **Primal Weathers**: SKIP (no Primordial Sea, Desolate Land, Delta Stream)
- **Form Changes**: SKIP (no Castform/Cherrim form logic)
- **Duration Items**: INCLUDE (Damp/Heat/Icy/Smooth Rock → 8 turns)

## Scope Boundaries

### INCLUDE

1. Move accuracy changes (Thunder/Hurricane in Rain/Sun, Blizzard in Hail)
2. Solar Beam no-charge in Sun, reduced power in Rain/Sand/Hail
3. Weather Ball type/power changes
4. Growth +2 Atk in Sun
5. Shore Up 66% healing in Sandstorm
6. Recovery abilities: Rain Dish, Ice Body, Dry Skin
7. Status abilities: Hydration, Leaf Guard
8. Duration items: Rock items extending weather to 8 turns
9. Overcoat ability preventing weather damage

### EXCLUDE

- Snow mechanics (Gen 9)
- Primal weathers
- Form changes (Castform, Cherrim)
- Utility Umbrella item (can add later)
- Legends Arceus moves (Bleakwind Storm, etc.)

## Technical Decisions

- Weather duration check must consider holder's item when weather is set
- Accuracy override should be integrated into existing accuracy calculation
- Recovery/damage abilities go in end-of-turn phase alongside existing weather damage
