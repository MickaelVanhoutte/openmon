import seedrandom from 'seedrandom';

export class SeededRNG {
	private rng: seedrandom.PRNG;

	constructor(seed: string) {
		this.rng = seedrandom(seed);
	}

	public next(): number {
		return this.rng();
	}

	public nextInt(min: number, max: number): number {
		return Math.floor(this.rng() * (max - min + 1)) + min;
	}

	public nextBool(prob: number = 0.5): boolean {
		return this.rng() < prob;
	}

	public shuffle<T>(arr: T[]): T[] {
		const result = [...arr];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(this.rng() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}

	public pick<T>(arr: T[]): T {
		if (arr.length === 0) {
			throw new Error('Cannot pick from an empty array');
		}
		return arr[this.nextInt(0, arr.length - 1)];
	}
}

export function deriveSeed(runSeed: string, floorNumber: number): string {
	return `${runSeed}-floor-${floorNumber}`;
}
