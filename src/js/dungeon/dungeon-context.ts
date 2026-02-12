import { writable, type Writable } from 'svelte/store';
import { getBiomeForFloor } from './biomes';
import type { BiomeConfig } from './biomes';
import { deriveSeed } from './prng';
import { updateMetaProgress, loadMetaProgress, type MetaProgress } from './meta-progress';

export class DungeonContext {
	runSeed: string = '';
	currentFloor: number = 0;
	isDungeonMode: boolean = false;
	isRunActive: boolean = false;
	currentBiome: BiomeConfig | undefined;
	defeatedTrainers: Set<string> = new Set();
	pickedItems: Set<string> = new Set();
	bestFloor: number = 0;
	runCurrency: number = 0;

	constructor() {
		const meta = loadMetaProgress();
		this.bestFloor = meta.bestFloor;
	}

	startRun(seed?: string): void {
		this.isDungeonMode = true;
		this.isRunActive = true;
		this.currentFloor = 1;
		this.runSeed = seed ?? Date.now().toString();
		this.currentBiome = getBiomeForFloor(1);
		this.defeatedTrainers.clear();
		this.pickedItems.clear();
		this.runCurrency = 0;
	}

	advanceFloor(): void {
		this.currentFloor++;
		this.currentBiome = getBiomeForFloor(this.currentFloor);
	}

	endRun(won: boolean): MetaProgress {
		this.isRunActive = false;
		if (this.currentFloor > this.bestFloor) {
			this.bestFloor = this.currentFloor;
		}
		if (!won) {
			this.isDungeonMode = false;
		}
		return updateMetaProgress(this);
	}

	getCurrentFloorType(): 'normal' | 'rest' | 'boss' {
		if (this.isFloorBoss(this.currentFloor)) {
			return 'boss';
		}
		if (this.isFloorRest(this.currentFloor)) {
			return 'rest';
		}
		return 'normal';
	}

	isFloorBoss(floor: number): boolean {
		return floor % 5 === 0 && floor > 0;
	}

	isFloorRest(floor: number): boolean {
		return floor % 5 === 4 && floor > 0;
	}

	getFloorSeed(): string {
		return deriveSeed(this.runSeed, this.currentFloor);
	}
}

export const dungeonContext: Writable<DungeonContext | undefined> = writable(undefined);
