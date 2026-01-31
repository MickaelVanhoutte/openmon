# Component Sizes - OpenMon

Generated: 2026-01-30

## Summary

- **Total Svelte components**: 38
- **Total TypeScript files**: ~98
- **Files >500 lines**: 10 (needs refactoring)
- **Files >300 lines**: 21

---

## Svelte Components (by size)

| Lines | File                                                 | Status                            |
| ----- | ---------------------------------------------------- | --------------------------------- |
| 1494  | src/lib/battle/ActionBar.svelte                      | ⛔ >500 LINES - CRITICAL          |
| 801   | src/lib/menus/boxes/Boxes.svelte                     | ⛔ >500 LINES - NEEDS REFACTORING |
| 775   | src/lib/world/Controls.svelte                        | ⛔ >500 LINES - NEEDS REFACTORING |
| 763   | src/lib/battle/mini-menus/MiniPkmn.svelte            | ⛔ >500 LINES - NEEDS REFACTORING |
| 715   | src/lib/menus/pokemon-list/PokemonStats.svelte       | ⛔ >500 LINES - NEEDS REFACTORING |
| 653   | src/lib/menus/pokemon-list/PokemonList.svelte        | ⛔ >500 LINES - NEEDS REFACTORING |
| 563   | src/lib/battle/Battle.svelte                         | ⛔ >500 LINES - NEEDS REFACTORING |
| 546   | src/lib/menus/bag/Bag.svelte                         | ⛔ >500 LINES - NEEDS REFACTORING |
| 536   | src/lib/Intro.svelte                                 | ⛔ >500 LINES - NEEDS REFACTORING |
| 530   | src/lib/world/World.svelte                           | ⛔ >500 LINES - NEEDS REFACTORING |
| 450   | src/lib/menus/pokedex/PokedexStats.svelte            | >300 lines                        |
| 431   | src/lib/menus/trainer/TrainerMastery.svelte          | >300 lines                        |
| 428   | src/lib/battle/AllyInfo.svelte                       | >300 lines                        |
| 412   | src/lib/debug/AnimationTestPage.svelte               | >300 lines                        |
| 412   | src/lib/common/Evolution.svelte                      | >300 lines                        |
| 401   | src/lib/battle/mini-menus/MiniBag.svelte             | >300 lines                        |
| 372   | src/lib/menus/pokedex/Pokedex.svelte                 | >300 lines                        |
| 356   | src/lib/menus/pokemon-list/PokemonSkills.svelte      | >300 lines                        |
| 340   | src/lib/battle/EnemyInfo.svelte                      | >300 lines                        |
| 334   | src/lib/common/Shop.svelte                           | >300 lines                        |
| 316   | src/lib/menus/pokemon-list/PokemonSummary.svelte     | >300 lines                        |
| 301   | src/App.svelte                                       | >300 lines                        |
| 292   | src/lib/menus/pokedex/PokedexDetail.svelte           | OK                                |
| 287   | src/lib/menus/pokedex/PokedexMore.svelte             | OK                                |
| 282   | src/lib/menus/pokemon-list/PokemonInfo.svelte        | OK                                |
| 272   | src/lib/common/DialogView.svelte                     | OK                                |
| 256   | src/lib/saves/LoadSave.svelte                        | OK                                |
| 253   | src/lib/world/OverworldTeamPanel.svelte              | OK                                |
| 242   | src/lib/menus/pokedex/PokedexMoves.svelte            | OK                                |
| 230   | src/lib/battle/FieldIndicators.svelte                | OK                                |
| 228   | src/lib/common/StarterSelection.svelte               | OK                                |
| 221   | src/lib/menus/trainer/Trainer.svelte                 | OK                                |
| 177   | src/lib/menus/pokemon-list/MovesDraggableList.svelte | OK                                |
| 157   | src/lib/common/Modal.svelte                          | OK                                |
| 128   | src/lib/saves/PlayerCreation.svelte                  | OK                                |
| 117   | src/lib/world/ScenesView.svelte                      | OK                                |
| 82    | src/lib/menus/pokemon-list/PokemonSkillsEdit.svelte  | OK                                |
| 70    | src/lib/menus/trainer/TrainerCard.svelte             | OK                                |
| 49    | src/lib/menus/Menu.svelte                            | OK                                |

---

## TypeScript Files (by size)

| Lines | File                                         | Status                            |
| ----- | -------------------------------------------- | --------------------------------- |
| 6045  | src/js/pokemons/move-effects.ts              | 📌 DEFERRED (separate plan)       |
| 1174  | src/js/pokemons/pokedex.ts                   | ⛔ >500 LINES - NEEDS REFACTORING |
| 773   | src/js/context/gameContext.ts                | ⛔ >500 LINES - NEEDS REFACTORING |
| 665   | src/js/mapping/maps.ts                       | ⛔ >500 LINES - NEEDS REFACTORING |
| 582   | src/js/commands/joystick-controller.ts       | ⛔ >500 LINES - NEEDS REFACTORING |
| 576   | src/js/battle/animations/animation-engine.ts | ⛔ >500 LINES - NEEDS REFACTORING |
| 551   | src/js/context/battleContext.ts              | ⛔ >500 LINES - NEEDS REFACTORING |
| 516   | src/js/mapping/maps/forest.ts                | ⛔ >500 LINES - NEEDS REFACTORING |
| 465   | src/js/battle/battle-model.ts                | OK                                |
| 457   | src/js/scripting/scripts.ts                  | OK                                |
| 454   | src/js/characters/follower.ts                | OK                                |
| 429   | src/js/mapping/maps/firstBeach.ts            | OK                                |
| 428   | src/js/battle/actions/actions-selectable.ts  | OK                                |
| 397   | src/js/characters/player.ts                  | OK                                |
| 352   | src/js/battle/actions/actions-derived.ts     | OK                                |
| 340   | src/js/battle/animations/moves/special.ts    | OK                                |
| 311   | src/js/battle/animations/moves/status.ts     | OK                                |
| 272   | src/js/characters/npc.ts                     | OK                                |
| 268   | src/js/context/overworldContext.ts           | OK                                |
| 268   | src/js/battle/animations/moves/physical.ts   | OK                                |

---

## Priority Refactoring Targets (This Plan)

1. **ActionBar.svelte** (1494 lines) - CRITICAL, will be split in Phase 2
2. **Boxes.svelte** (801 lines) - Will be split in Phase 2
3. **GameContext.ts** (773 lines) - Helpers will be extracted in Phase 2

## Deferred (Separate Plan)

- **move-effects.ts** (6045 lines) - Explicitly deferred per plan requirements
