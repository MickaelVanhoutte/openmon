# Showdown Data Import + Animated Battle Sprites (Phase 1-3)

## Context

The game has 248 Pokemon with static PNG battle sprites rendered as HTML `<img>` elements over the 3D scene. The dex/moves/learnsets come from a custom PokeAPI export pipeline. We need:

- A **complete Showdown-sourced pokedex** (all ~1200 Pokemon) with a **game filter** controlling which are in-game
- Animated GIF battle sprites from Showdown replacing static PNGs
- Supplementary species data from PokeAPI for fields Showdown lacks
- (Phase 4, later milestone): 3D Threlte battle sprite rendering with sprite sheet conversion

**Scope for this milestone:** Phases 1-3 only (data pipeline + animated GIFs in current HTML battle system). Phase 4 (3D rendering) is deferred.

---

## Phase 1: Download Showdown Data & Sprites

### 1a. `scripts/download-showdown-data.ts`

Downloads 3 JSON files to `src/assets/data/raw/showdown/`:

| Source URL | Output |
|---|---|
| `play.pokemonshowdown.com/data/pokedex.json` | `showdown/pokedex.json` |
| `play.pokemonshowdown.com/data/moves.json` | `showdown/moves.json` |
| `play.pokemonshowdown.com/data/learnsets.json` | `showdown/learnsets.json` |

Simple fetch + writeFileSync. Follow `scripts/download-cries.ts` pattern.

### 1b. `scripts/download-showdown-sprites.ts`

For every Pokemon in downloaded `pokedex.json`, fetch GIFs from 4 Showdown directories:

| Showdown URL | Local path |
|---|---|
| `sprites/ani/{name}.gif` | `src/assets/monsters/showdown/ani/` |
| `sprites/ani-back/{name}.gif` | `src/assets/monsters/showdown/ani-back/` |
| `sprites/ani-shiny/{name}.gif` | `src/assets/monsters/showdown/ani-shiny/` |
| `sprites/ani-back-shiny/{name}.gif` | `src/assets/monsters/showdown/ani-back-shiny/` |

**Name derivation:** Showdown pokedex keys are like `charizardmegax` (no hyphens). Sprite filenames use hyphens: `charizard-megax.gif`. Derive sprite name from `pokemon.name`: lowercase, strip spaces/special chars, keep hyphens between name parts. Use `download-cries.ts`'s `normalizeName()` as starting point, but for sprites we need the hyphenated Showdown form (not the ID form).

The Showdown sprite filename convention follows a simple rule: take the Pokemon's display name (e.g., "Charizard-Mega-X"), lowercase it, and remove spaces (→ `charizard-mega-x`). Then simplify form suffixes: `mega-x` → `megax`, `mega-y` → `megay`. The pokedex key removes ALL non-alphanumeric chars, but the sprite file keeps the hyphens that separate meaningful parts.

**Implementation:**
- Concurrency: 10 parallel downloads max
- Skip existing files (idempotent)
- Log missing sprites (some forms may lack animated versions)
- Estimated: ~1200 Pokemon × 4 variants = ~4800 GIFs

### 1c. `scripts/download-pokeapi-species.ts`

Downloads supplementary species data from PokeAPI for fields Showdown doesn't provide:

For each unique `num` in Showdown pokedex, fetch `https://pokeapi.co/api/v2/pokemon-species/{num}` and `https://pokeapi.co/api/v2/pokemon/{num}`.

Extract and save to `src/assets/data/raw/showdown/species-extra.json`:
```json
{
  "1": {
    "captureRate": 45,
    "growthRateId": 4,
    "baseXp": 64,
    "genderRate": 1,
    "description": "A strange seed was planted...",
    "isLegendary": false,
    "isMythical": false
  },
  ...
}
```

Fields: `capture_rate`, `growth_rate.name` → numeric ID, `base_experience`, `gender_rate` (PokeAPI: -1=genderless, 0=100%male, 8=100%female → convert to percentageMale), `flavor_text_entries` (English, latest gen), `is_legendary`, `is_mythical`.

**Rate limiting:** PokeAPI has rate limits. Use 5 parallel + 200ms delay between batches. Cache to disk, skip existing.

### 1d. `scripts/build-showdown-pokedex.ts`

Transforms all downloaded data into game format.

**Inputs:**
- `src/assets/data/raw/showdown/pokedex.json`
- `src/assets/data/raw/showdown/moves.json`
- `src/assets/data/raw/showdown/learnsets.json`
- `src/assets/data/raw/showdown/species-extra.json`

**Outputs:**

| File | Description |
|---|---|
| `public/data/pokedex-full.json` | ALL Pokemon in game PokedexEntry format |
| `public/data/moves-full.json` | ALL moves in game Move format |
| `src/assets/data/game-pokemon.json` | Filter: ordered list of Showdown keys for in-game Pokemon |
| `public/data/pokedex-game.json` | Filtered pokedex for runtime (replaces `pokedex-animatedV3.json`) |

**Data mapping — Pokemon:**
- `num` → `regionalId`
- `name` → `name`
- `types` → `types` (lowercased)
- `baseStats.hp/atk/def/spa/spd/spe` → `stats.hp/attack/defense/specialAttack/specialDefense/speed`
- `abilities` (object values) → `abilities[]`
- `heightm` → `height`, `weightkg` → `weight`
- `evos`/`prevo`/`evoLevel`/`evoType`/`evoItem` → `Evolution[]` (resolve to game IDs)
- From species-extra: `captureRate`, `growthRateId`, `baseXp`, `percentageMale`, `description`, `isLegendary`
- Add `spriteName` field (hyphenated Showdown sprite filename, e.g., `"charizard-megax"`)
- `sprites` object pointing to `src/assets/monsters/showdown/ani/{spriteName}.gif` etc.

**Data mapping — Moves:**
- `type` → lowercase
- `category`: `"Physical"` → `"physical"`, `"Special"` → `"special"`, `"Status"` → `"no-damage"`
- `basePower` → `power`
- `accuracy`: `true` → `101` (never-miss), number stays as-is
- `pp`, `priority`, `target` → direct map (target needs string normalization)
- `secondary` → `MoveEffect` format
- `shortDesc` → `description`

**Data mapping — Learnsets:**
Showdown format: `"tackle": ["9L1", "8L1", "7L1"]`
- Filter to gen 9 entries (prefix `9`), fallback to latest gen available
- `L{n}` → level-up at level n (method 1)
- `M` → TM/machine (method 4)
- `E` → egg move (method 2)
- `T` → tutor (method 3)
- Each Pokemon's `moves[]` array combines learnset entries with full move data

**Game filter — `game-pokemon.json`:**
Initial content: map current 248 Pokemon (from `pokemon-ids.json`) to Showdown keys. The build script assigns sequential game IDs (1-248) matching the current order, preserving save compatibility.

Format:
```json
["chikorita", "bayleef", "meganium", "mudkip", "marshtomp", "swampert", ...]
```

**Add npm scripts:**
```json
"download:showdown": "npx tsx scripts/download-showdown-data.ts && npx tsx scripts/download-showdown-sprites.ts && npx tsx scripts/download-pokeapi-species.ts",
"build:pokedex": "npx tsx scripts/build-showdown-pokedex.ts"
```

---

## Phase 2: Pokedex & Data Integration

### `src/js/pokemons/pokedex.ts`

**`PokedexEntry` class:**
- Add field: `spriteName: string` (populated from JSON, e.g., `"charizard-megax"`)
- Constructor: accept `spriteName` parameter, store it
- `normalizedName`: keep as-is for backward compat (used in saves/lookups)
- Update `getSprite()`:
  ```typescript
  getSprite(): string {
      return `src/assets/monsters/showdown/ani/${this.spriteName}.gif`;
  }
  ```

**`PokemonInstance` class:**
- Add getter: `get spriteName() { return this.entry.spriteName; }`
- Update `getSprite(back?)`:
  ```typescript
  getSprite(back?: boolean): string {
      const dir = this.isShiny
          ? (back ? 'ani-back-shiny' : 'ani-shiny')
          : (back ? 'ani-back' : 'ani');
      return `src/assets/monsters/showdown/${dir}/${this.spriteName}.gif`;
  }
  ```

**`Pokedex` class:**
- `loadPokedex()`: change fetch URL from `pokedex-animatedV3.json` to `pokedex-game.json`
- `importFromJson()`: pass `spriteName` to PokedexEntry constructor

### `src/js/pokemons/move-hydration.ts`
- Review if still needed — if moves are embedded in the new pokedex JSON (as they are today), this may only need path updates
- If learnsets are stored separately, update to fetch from `moves-full.json` / `learnsets-full.json`

---

## Phase 3: Animated GIF Battle Sprites

Since `getSprite()` now returns `.gif` paths, battles automatically use animated sprites. Minor tweaks:

### `src/lib/battle/Battle.svelte`

**CSS changes (lines ~980, ~1013):**
- Remove or change `image-rendering: pixelated` to `image-rendering: auto` on `.ally-sprite` and `.opponent-sprite` — Showdown sprites are anti-aliased, not pixel art

**Scale review (lines ~529, ~598):**
- Current: `Math.min(imgHeight / (screenHeight * 0.15), 0.5)`
- Showdown GIFs may be different dimensions — test and adjust the 0.15 divisor if sprites appear too large/small

**Shadow calculation:**
- `findFeetOffset()` draws to canvas — this captures GIF's first frame, which is fine

**Optional: Remove CSS bounce animation:**
- The `impatience` keyframe animation may look odd layered on already-animated GIFs
- Consider removing or reducing it

---

## Critical Files to Modify

| File | Changes |
|---|---|
| `scripts/download-cries.ts` | Reference for naming pattern — reuse `normalizeName()`, `SPECIAL_CASES`, `REGIONAL_FORMS` |
| `src/js/pokemons/pokedex.ts` | Add `spriteName` field, update `getSprite()`, change fetch URL |
| `src/lib/battle/Battle.svelte` | Remove `image-rendering: pixelated`, review scaling |
| `src/assets/data/raw/dex/pokemon-ids.json` | Reference for building initial game-pokemon.json mapping |
| `src/assets/data/raw/dex/exportDex.js` | Reference for current data pipeline (being replaced) |

## New Files

| File | Purpose |
|---|---|
| `scripts/download-showdown-data.ts` | Download Showdown JSON data |
| `scripts/download-showdown-sprites.ts` | Download animated GIF sprites |
| `scripts/download-pokeapi-species.ts` | Download supplementary species data |
| `scripts/build-showdown-pokedex.ts` | Transform all data into game format |
| `src/assets/data/game-pokemon.json` | Game filter (which Pokemon are available) |
| `src/assets/data/raw/showdown/` | Downloaded raw Showdown data directory |
| `src/assets/monsters/showdown/` | Downloaded animated sprites directory |
| `public/data/pokedex-full.json` | Complete pokedex (all Pokemon) |
| `public/data/pokedex-game.json` | Filtered pokedex (replaces pokedex-animatedV3.json) |
| `public/data/moves-full.json` | Complete move database |

## Verification

1. **Run download scripts** — verify all 3 Showdown JSONs downloaded, sprites exist for current 248 Pokemon
2. **Run build script** — verify `pokedex-game.json` has 248 entries with correct data, moves are populated
3. **Start the game** — verify Pokedex loads without errors
4. **Check Pokedex UI** — verify Pokemon names, types, stats, sprites display correctly
5. **Enter a battle** — verify animated GIFs display, scale correctly, shadows work
6. **Test shiny** — verify shiny sprites load from correct directory
7. **Test double battle** — verify both ally/opponent pairs render
8. **Save & reload** — verify save compatibility (game IDs preserved for current 248)
9. **Check battle animations** — verify GSAP entry/exit/move animations still work with GIF elements

## Future Phase 4 (separate milestone)

After this milestone is validated:
- Convert GIFs to sprite sheets at build time (`scripts/convert-gifs-to-sheets.ts`)
- Create `BattlePokemonSprite3D.svelte` (Billboard + animated texture in Threlte)
- Refactor Battle.svelte to use 3D sprites
- Port animation engine to operate on Three.js objects
- Project UI elements (HP bars) from 3D to screen space
