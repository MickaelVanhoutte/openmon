import type {PokemonInstance} from "./pokedex";


export class ExperienceCalculator {

    public ready = false;

    public chartById = new Map<number, ExperienceEntry[]>();

    constructor() {
        fetch('src/assets/data/final/beta/xp-chart.json')
            .then(response => response.json())
            .then(data => {

                // @ts-ignore
                data.forEach((entry) => {
                    if (!this.chartById.has(entry.growth_rate_id)) {
                        this.chartById.set(entry.growth_rate_id, []);
                    }
                    // @ts-ignore
                    this.chartById.get(entry.growth_rate_id).push(new ExperienceEntry(entry.level, entry.experience));
                });
                this.ready = true;
            });
    }

    public howMuchINeed(level: number, growthRateId: number): number {
        if (!this.ready || level < 1 || level >= 100 || !this.chartById.has(growthRateId)) {
            console.error('ERROR', level, growthRateId)
            return Number.MAX_SAFE_INTEGER;
        }
        let chart = this.chartById.get(growthRateId);
        let entry = chart?.find((entry) => entry.level === level);
        return entry?.experience || 0;
    }

    public howMuchIGet(opponent: PokemonInstance, participated: number, isTrainer: boolean = false, xpShare: boolean = false) {
        let b = opponent.baseXp;
        let l = opponent.level;
        let a = isTrainer ? 1.5 : 1;
        let s = xpShare ? 2 * participated : participated;
        let t = 1; // if traded 1.5, probably won't be implemented
        let e = 1; // if lucky egg 1.5, probably won't be implemented
        let v = 1; // if about to evolve 1.5, probably won't be implemented
        let f = 1; // if affection 1.2, probably won't be implemented
        let p = 1; // if pokemon exp point power 1.2, probably won't be implemented



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
