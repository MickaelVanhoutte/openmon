import { Stats } from '../pokedex';
import type { Nature } from '../pokedex';
import type { Effect } from '../effects/types';

export type BattleStatKey =
	| 'hp'
	| 'attack'
	| 'defense'
	| 'specialAttack'
	| 'specialDefense'
	| 'speed'
	| 'evasion'
	| 'accuracy';

export interface StatOwner {
	stats: Stats;
	ivs: Stats;
	evs: Stats;
	nature: Nature;
	level: number;
	currentStats: Stats;
	statsChanges: Stats;
	status?: Effect;
}

export class StatCalculator {
	private owner: StatOwner;

	constructor(owner: StatOwner) {
		this.owner = owner;
	}

	computeFromBaseStats(): Stats {
		const { ivs, stats, evs, nature, level } = this.owner;
		const natureMod = (statId: string) =>
			nature.increasedStatId === statId ? 1.1 : nature.decreasedStatId === statId ? 0.9 : 1;

		return new Stats(
			Math.floor(((ivs.hp + stats.hp * 2 + evs.hp / 4) * level) / 100 + 10 + level),
			Math.floor(
				(((ivs.attack + stats.attack * 2 + evs.attack / 4) * level) / 100 + 5) * natureMod('attack')
			),
			Math.floor(
				(((ivs.defense + stats.defense * 2 + evs.defense / 4) * level) / 100 + 5) *
					natureMod('defense')
			),
			Math.floor(
				(((ivs.specialAttack + stats.specialAttack * 2 + evs.specialAttack / 4) * level) / 100 +
					5) *
					natureMod('specialAttack')
			),
			Math.floor(
				(((ivs.specialDefense + stats.specialDefense * 2 + evs.specialDefense / 4) * level) / 100 +
					5) *
					natureMod('specialDefense')
			),
			Math.floor(
				(((ivs.speed + stats.speed * 2 + evs.speed / 4) * level) / 100 + 5) * natureMod('speed')
			)
		);
	}

	computeBattleStats(): Stats {
		const { currentStats, statsChanges, status } = this.owner;
		// Gen 4 stat stage multipliers: +1 = 1.5x, +2 = 2x, +6 = 4x, -1 = 0.67x, -6 = 0.25x
		const stageMultiplier = (stage: number) => (stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage));
		// Accuracy/Evasion use different formula: +1 = 1.33x, -1 = 0.75x
		const accEvaMultiplier = (stage: number) => (stage >= 0 ? (3 + stage) / 3 : 3 / (3 - stage));

		// Apply paralysis speed reduction (50% of normal, Gen 7+)
		const paralysisSpeedMod = status === 'paralysis' ? 0.5 : 1;

		return new Stats(
			currentStats.hp,
			Math.floor(currentStats.attack * stageMultiplier(statsChanges.attack)),
			Math.floor(currentStats.defense * stageMultiplier(statsChanges.defense)),
			Math.floor(currentStats.specialAttack * stageMultiplier(statsChanges.specialAttack)),
			Math.floor(currentStats.specialDefense * stageMultiplier(statsChanges.specialDefense)),
			Math.floor(currentStats.speed * stageMultiplier(statsChanges.speed) * paralysisSpeedMod),
			Math.floor(currentStats.evasion * accEvaMultiplier(statsChanges.evasion)),
			Math.floor(currentStats.accuracy * accEvaMultiplier(statsChanges.accuracy))
		);
	}

	changeBattleStats(stat: BattleStatKey, value: number) {
		const currentStage = this.owner.statsChanges[stat];
		const newStage = Math.min(6, Math.max(-6, currentStage + value));
		if (newStage !== currentStage) {
			this.owner.statsChanges[stat] = newStage;
		}
	}

	resetBattleStats() {
		this.owner.statsChanges = new Stats();
	}
}
