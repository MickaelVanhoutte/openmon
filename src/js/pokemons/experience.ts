import type { PokemonInstance } from './pokedex';

interface XpChartEntry {
	growth_rate_id: number;
	level: number;
	experience: number;
}

export class ExperienceCalculator {
	public ready = false;

	public chartById = new Map<number, ExperienceEntry[]>();

	constructor() {
		fetch('src/assets/data/final/beta/xp-chart.json')
			.then((response) => response.json())
			.then((data: XpChartEntry[]) => {
				data.forEach((entry) => {
					if (!this.chartById.has(entry.growth_rate_id)) {
						this.chartById.set(entry.growth_rate_id, []);
					}
					this.chartById
						.get(entry.growth_rate_id)!
						.push(new ExperienceEntry(entry.level, entry.experience));
				});
				this.ready = true;
			});
	}

	public howMuchINeed(level: number, growthRateId: number): number {
		if (!this.ready || level < 1 || level >= 100 || !this.chartById.has(growthRateId)) {
			console.error('ERROR', level, growthRateId);
			return Number.MAX_SAFE_INTEGER;
		}
		const chart = this.chartById.get(growthRateId);
		const entry = chart?.find((entry) => entry.level === level);
		return entry?.experience || 0;
	}

	public howMuchIGet(
		opponent: PokemonInstance,
		participated: number,
		isTrainer: boolean = false,
		xpShare: boolean = false
	) {
		const b = opponent.baseXp;
		const l = opponent.level;
		const a = isTrainer ? 1.5 : 1;
		const s = xpShare ? 2 * participated : participated;
		const t = 1; // if traded 1.5, probably won't be implemented
		const e = 1; // if lucky egg 1.5, probably won't be implemented
		const v = 1; // if about to evolve 1.5, probably won't be implemented
		const f = 1; // if affection 1.2, probably won't be implemented
		const p = 1; // if pokemon exp point power 1.2, probably won't be implemented

		return Math.floor(((b * l) / 7) * a * (1 / s) * t * e * v * f * p) * 2; // bonus, might be removed TODO;
	}
}

export class ExperienceEntry {
	public level: number;
	public experience: number;

	constructor(level: number, experience: number) {
		this.level = level;
		this.experience = experience;
	}
}

export const EXPERIENCE_CHART = new ExperienceCalculator();
