import type { Stats, Move, Evolution } from '../pokedex';
import { EXPERIENCE_CHART } from '../experience';

export interface XpOwner {
	level: number;
	currentXp: number;
	xpToNextLevel: number;
	evsToDistribute: number;
	currentHp: number;
	currentStats: Stats;
	evs: Stats;
	evolution: Evolution[];
	growthRateId: number;
	baseXp: number;
	totalEvs: number;
	moves: Move[];
	updateCurrentStats(): void;
}

export class XpManager {
	private owner: XpOwner;

	constructor(owner: XpOwner) {
		this.owner = owner;
	}

	computeXpToNextLevel(): number {
		return EXPERIENCE_CHART.howMuchINeed(this.owner.level, this.owner.growthRateId);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	howMuchXpWon(participated: number = 1, fromTrainer: boolean = false, xpShare: boolean): number {
		return EXPERIENCE_CHART.howMuchIGet(this.owner as any, participated, fromTrainer, xpShare);
	}

	addXpResult(
		totalXp: number,
		evs: number
	): { levelup: boolean; xpLeft: number; newMove: string[] } {
		this.owner.evsToDistribute +=
			this.owner.totalEvs + evs <= 510 ? evs : this.owner.totalEvs + evs - 510;
		if (this.owner.level < 100) {
			let xpLeft = 0;
			if (this.owner.xpToNextLevel < this.owner.currentXp + totalXp) {
				xpLeft = totalXp - (this.owner.xpToNextLevel - this.owner.currentXp);
				const xpToAddNow = totalXp - xpLeft;
				this.owner.currentXp += xpToAddNow;

				return {
					levelup: true,
					xpLeft: xpLeft,
					newMove: []
				};
			} else {
				this.owner.currentXp += totalXp;
			}
		}

		return {
			levelup: false,
			xpLeft: 0,
			newMove: []
		};
	}

	addEv(
		ev: 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed',
		value: number
	) {
		const total = this.owner.totalEvs;
		if (
			this.owner.evsToDistribute >= value &&
			this.owner.evs[ev] + value <= 252 &&
			this.owner.evs[ev] + value > 0 &&
			total + value <= 510
		) {
			const toAdd = this.owner.evs[ev] + value <= 252 && total + value <= 510 ? value : 0;
			this.owner.evs[ev] += toAdd;
			this.owner.evsToDistribute -= toAdd;
			this.owner.updateCurrentStats();
		}
	}

	canEvolve(): boolean {
		return (
			this.owner.evolution?.filter((evo) => evo.method === 'level' && evo.level <= this.owner.level)
				?.length > 0
		);
	}

	levelUp(): { oldStats?: Stats; newStats?: Stats; moves?: Move[] } {
		if (this.owner.level >= 100) {
			return {};
		}
		const oldStats = { ...this.owner.currentStats };

		let currentHp = this.owner.currentStats.hp;
		this.owner.level += 1;
		this.owner.updateCurrentStats();
		const newStats = { ...this.owner.currentStats };

		// heal added hp
		currentHp = this.owner.currentStats.hp - currentHp;
		this.owner.currentHp += currentHp;
		this.owner.currentXp = 0;

		return { oldStats, newStats, moves: this.checkForNewMoves() };
	}

	private checkForNewMoves(): Move[] {
		return this.owner.moves.filter((move) => move.level === this.owner.level);
	}
}
