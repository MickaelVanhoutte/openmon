import { writable, type Writable } from 'svelte/store';
import type { GameContext } from '../context/gameContext';
import { PlayerStats } from './player-stats';
import { AchievementState, type AchievementProgress } from './achievement-state';
import { ACHIEVEMENTS } from './achievement-registry';
import type { AchievementDefinition, AchievementReward } from './achievement-definitions';

export interface AchievementUnlock {
	definition: AchievementDefinition;
	tier: number;
	tierLabel: string;
	reward: AchievementReward;
}

export class AchievementManager {
	stats: PlayerStats;
	state: AchievementState;

	/** Svelte store emitting newly unlocked achievements for the notification UI */
	unlocked$: Writable<AchievementUnlock | undefined> = writable(undefined);

	private notificationQueue: AchievementUnlock[] = [];

	constructor(stats?: Partial<PlayerStats>, stateEntries?: [string, AchievementProgress][]) {
		this.stats = new PlayerStats(stats);
		this.state = new AchievementState(stateEntries);
	}

	/**
	 * Check all achievements against current stats.
	 * Returns array of newly unlocked achievements.
	 */
	checkAll(ctx: GameContext): AchievementUnlock[] {
		const unlocks: AchievementUnlock[] = [];

		for (const def of ACHIEVEMENTS) {
			const currentValue = def.getProgress(this.stats, ctx);
			const progress = this.state.getProgress(def.id);

			for (const tier of def.tiers) {
				if (tier.tier > progress.currentTier && currentValue >= tier.threshold) {
					progress.currentTier = tier.tier;
					unlocks.push({
						definition: def,
						tier: tier.tier,
						tierLabel: tier.label,
						reward: tier.reward
					});
				}
			}
		}

		return unlocks;
	}

	/**
	 * Check achievements, grant rewards, and emit notifications.
	 */
	checkAndNotify(ctx: GameContext): void {
		// Sync itemsUsed from bag counter
		this.stats.itemsUsed = ctx.player.bag.itemsUsedCount;

		const unlocks = this.checkAll(ctx);

		for (const unlock of unlocks) {
			// Grant rewards
			if (unlock.reward.money) {
				ctx.player.bag.money += unlock.reward.money;
			}
			if (unlock.reward.items) {
				for (const item of unlock.reward.items) {
					ctx.player.bag.addItems(item.itemId, item.quantity, ctx.ITEMS);
				}
			}
			if (unlock.reward.masteryPoints) {
				ctx.player.playerMasteries.points += unlock.reward.masteryPoints;
			}
			if (unlock.reward.pokemon) {
				for (const poke of unlock.reward.pokemon) {
					const entry = ctx.POKEDEX.findById(poke.pokedexId);
					if (entry.result) {
						const instance = entry.result.instanciate(poke.level);
						if (ctx.player.monsters.length < 6) {
							ctx.player.monsters.push(instance);
						} else {
							ctx.player.boxes.store(instance);
						}
						ctx.POKEDEX.setCaught(poke.pokedexId);
					}
				}
			}

			// Queue notification
			const progress = this.state.getProgress(unlock.definition.id);
			if (progress.notifiedTier < unlock.tier) {
				progress.notifiedTier = unlock.tier;
				this.notificationQueue.push(unlock);
			}
		}

		// Emit first queued notification
		if (this.notificationQueue.length > 0) {
			this.unlocked$.set(this.notificationQueue.shift());
		}
	}

	/**
	 * Called by notification UI when the current notification is dismissed.
	 * Shows the next queued notification if any.
	 */
	dismissNotification(): void {
		if (this.notificationQueue.length > 0) {
			this.unlocked$.set(this.notificationQueue.shift());
		} else {
			this.unlocked$.set(undefined);
		}
	}

	/**
	 * Get total unlocked achievement count and total possible.
	 */
	getSummary(): { unlocked: number; total: number } {
		let unlocked = 0;
		let total = 0;
		for (const def of ACHIEVEMENTS) {
			total += def.tiers.length;
			const progress = this.state.getProgress(def.id);
			unlocked += progress.currentTier;
		}
		return { unlocked, total };
	}
}
