/**
 * BattleService - Handles battle initiation and wild encounter checks.
 * Extracted from GameContext to reduce its size.
 */
import type { GameContext } from '../gameContext';
import type { Character } from '../../characters/characters-model';
import { NPC } from '../../characters/npc';
import { PokemonInstance } from '../../pokemons/pokedex';
import { BattleContext } from '../battleContext';
import { BattleType } from '../../battle/battle-model';
import { DungeonContext, dungeonContext } from '../../dungeon/dungeon-context';
import { getBiomeForFloor } from '../../dungeon/biomes';
import { persistDungeonState } from '../../dungeon/dungeon-save';
import { get } from 'svelte/store';
import { delay, waitFor } from '../../utils/async-utils';

export class BattleService {

	checkForBattle(ctx: GameContext): void {
		const dc = get(dungeonContext);
		const encounterRate =
			dc?.isDungeonMode && dc?.isRunActive ? getBiomeForFloor(dc.currentFloor).encounterRate : 0.07;

		if (
			ctx.map &&
			ctx.map.hasBattleZoneAt(ctx.player.position.positionOnMap) &&
			Math.random() < encounterRate
		) {
			const monster = ctx.map.randomMonster();

			let level: number;
			if (dc?.isDungeonMode && dc?.isRunActive) {
				const variance = Math.floor(Math.random() * 3) - 1;
				level = Math.max(1, Math.min(dc.currentFloor + 2 + variance, 100));
			} else {
				level =
					Math.floor(
						ctx.player.monsters.reduce((acc, pkmn) => acc + pkmn.level, 0) /
							ctx.player.monsters.length
					) - 1;
			}

			this.startBattle(
				ctx,
				ctx.POKEDEX.findById(monster.id).result.instanciate(level),
				BattleType.SINGLE
			);
		}
	}

	async startBattle(
		ctx: GameContext,
		opponent: PokemonInstance | Character,
		battleType: BattleType,
		onEnd?: () => void
	): Promise<void> {
		ctx.overWorldContext.setPaused(true, 'battle-start gameContext');

		const isLegendaryWild =
			opponent instanceof PokemonInstance &&
			!!ctx.POKEDEX.findById(opponent.id)?.result?.isLegendary;

		ctx.audioManager.startBattleTransition();

		delay(1500).then(() => {
			if (isLegendaryWild) {
				ctx.audioManager.playLegendaryBattleMusic();
			} else {
				ctx.audioManager.playBattleMusic();
			}
		});

		if (battleType === BattleType.DOUBLE && ctx.player.monsters.length < 2) {
			battleType = BattleType.SINGLE;
		}

		if (opponent instanceof NPC && opponent?.monsterIds?.length > 0) {
			if (opponent.dungeonTeam && opponent.dungeonTeam.length > 0) {
				opponent.monsters = opponent.dungeonTeam.map((config) => {
					const pokemon = ctx.POKEDEX.findById(config.speciesId).result.instanciate(config.level);
					if (config.heldItemId) {
						const heldItem = ctx.ITEMS.getHeldItemById(config.heldItemId);
						if (heldItem) {
							pokemon.heldItem = heldItem;
						}
					}
					return pokemon;
				});
			} else {
				opponent.monsters = opponent.monsterIds.map((id) => {
					let level = Math.floor(
						ctx.player.monsters.reduce((acc, pkmn) => acc + pkmn.level, 0) /
							ctx.player.monsters.length
					);
					level += Math.floor(Math.random() * 4) - 1;
					return ctx.POKEDEX.findById(id).result.instanciate(level);
				});
			}
		}

		const battleContext = new BattleContext(
			ctx.player,
			opponent,
			ctx.settings,
			battleType,
			isLegendaryWild ? 'mountains' : 'beaches'
		);

		const unsubscribe = battleContext.events.end.subscribe((result) => {
			if (result) {
				ctx.audioManager.fadeOutBattleMusic();
				battleContext.events.ending.set(true);

				if (opponent instanceof PokemonInstance) {
					ctx.POKEDEX.setViewed(opponent.id);
				} else {
					opponent.monsters.forEach((pkmn) => ctx.POKEDEX.setViewed(pkmn.id));
				}

				unsubscribe();
				try {
					this.handleBattleEnd(ctx, result, opponent, battleContext);
				} catch (e) {
					console.error('Error during battle end handling:', e);
				} finally {
					this.cleanupBattle(ctx, battleContext, onEnd);
				}
			}
		});

		// Wait for player to stop moving before starting battle
		await waitFor(() => !ctx.player.moving);
		ctx.battleContext.set(battleContext);
		battleContext.events.starting.set(true);
	}

	private handleBattleEnd(
		ctx: GameContext,
		result: { win: boolean; caught?: PokemonInstance },
		opponent: PokemonInstance | Character,
		battleContext: BattleContext
	): void {
		if (!result.win) {
			const dc = get(dungeonContext);
			if (dc?.isDungeonMode && dc?.isRunActive) {
				ctx.player.monsters.forEach((pkmn) => pkmn.fullHeal());
				dc.defeatedTrainers.clear();
				dc.pickedItems.clear();
				dc.currentFloor = 1;
				dc.currentBiome = getBiomeForFloor(1);
				dungeonContext.set(dc);
				ctx.dungeonService.restartFloor(ctx, dc);
			} else {
				ctx.player.position.positionOnMap = ctx.map.playerInitialPosition;
				ctx.player.monsters.forEach((pkmn) => pkmn.fullHeal());
			}
		} else if (result.win && opponent instanceof PokemonInstance && !result.caught) {
			const reward = Math.floor(opponent.level * 10 + 20);
			ctx.player.bag.money += reward;
		} else if (result.win && opponent instanceof NPC) {
			const dc = get(dungeonContext);
			if (dc?.isDungeonMode && dc?.isRunActive) {
				if (dc.isFloorBoss(dc.currentFloor)) {
					dc.defeatedTrainers.add(`boss_floor_${dc.currentFloor}`);
				} else {
					dc.defeatedTrainers.add(`trainer_${dc.currentFloor}_${opponent.id}`);
				}
				dungeonContext.set(dc);
				if (ctx.savesHolder) {
					persistDungeonState(dc, ctx.savesHolder);
				}
			}
		}

		if (result.caught) {
			ctx.POKEDEX.setCaught(result.caught.id);
			if (ctx.player.monsters.length < 6) {
				ctx.player.monsters.push(result.caught);
			} else {
				const availableBox = ctx.boxes.find((box) => !box.isFull());
				if (availableBox) {
					availableBox.add(result.caught);
				}
			}
			if (!ctx.player.follower) {
				ctx.player.setFollower(result.caught);
			}
		}
	}

	private async cleanupBattle(
		ctx: GameContext,
		battleContext: BattleContext,
		onEnd?: () => void
	): Promise<void> {
		await delay(1000);
		ctx.playMapSound();

		await delay(1000);
		ctx.overWorldContext.setPaused(false, 'battle-end gameContext');
		ctx.battleContext.set(undefined);
		ctx.audioManager.stopBattleMusic();
		ctx.hasEvolutions = ctx.player.monsters.some(
			(pkmn) => battleContext.leveledUpMonsterIds.has(pkmn.id) && pkmn.canEvolve()
		);
		if (onEnd) {
			onEnd();
		}
	}
}
