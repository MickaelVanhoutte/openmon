export enum VolatileStatus {
	CONFUSED = 'confused',
	FLINCH = 'flinch',
	INFATUATION = 'infatuation',
	BOUND = 'bound',
	SEEDED = 'seeded',
	CURSED = 'cursed',
	DROWSY = 'drowsy',
	NIGHTMARE = 'nightmare',
	PERISH_SONG = 'perish_song',
	TAUNT = 'taunt',
	ENCORE = 'encore',
	TORMENT = 'torment',
	DISABLE = 'disable',
	SEMI_INVULNERABLE = 'semi_invulnerable',
	CHARGING = 'charging',
	RECHARGING = 'recharging',
	RAMPAGE = 'rampage',
	PROTECTED = 'protected'
}

interface VolatileData {
	turns: number;
}

interface BoundData {
	sourceId: string;
	damagePerTurn: number;
}

export class VolatileTracker {
	private volatiles: Map<VolatileStatus, VolatileData> = new Map();
	private boundData?: BoundData;
	private seededBy?: string;
	private protectStaleCounter: number = 0;

	add(status: VolatileStatus, turns: number = 0): void {
		this.volatiles.set(status, { turns });
	}

	remove(status: VolatileStatus): void {
		this.volatiles.delete(status);
		if (status === VolatileStatus.BOUND) {
			this.boundData = undefined;
		}
		if (status === VolatileStatus.SEEDED) {
			this.seededBy = undefined;
		}
	}

	has(status: VolatileStatus): boolean {
		return this.volatiles.has(status);
	}

	getTurns(status: VolatileStatus): number {
		return this.volatiles.get(status)?.turns ?? 0;
	}

	setTurns(status: VolatileStatus, turns: number): void {
		const data = this.volatiles.get(status);
		if (data) {
			data.turns = turns;
		}
	}

	getAll(): VolatileStatus[] {
		return Array.from(this.volatiles.keys());
	}

	clear(): void {
		this.volatiles.clear();
		this.boundData = undefined;
		this.seededBy = undefined;
		this.protectStaleCounter = 0;
	}

	tickTurn(): void {
		for (const [status, data] of this.volatiles) {
			if (data.turns > 0) {
				data.turns--;
				if (data.turns === 0) {
					this.remove(status);
				}
			}
		}
	}

	endTurn(): void {
		this.remove(VolatileStatus.FLINCH);
		this.remove(VolatileStatus.PROTECTED);
	}

	setBoundData(sourceId: string, damagePerTurn: number): void {
		this.boundData = { sourceId, damagePerTurn };
	}

	getBoundData(): BoundData | undefined {
		if (!this.has(VolatileStatus.BOUND)) {
			return undefined;
		}
		return this.boundData;
	}

	setSeededBy(seederId: string): void {
		this.seededBy = seederId;
	}

	getSeededBy(): string | undefined {
		return this.seededBy;
	}

	checkConfusionSelfHit(): boolean {
		if (!this.has(VolatileStatus.CONFUSED)) {
			return false;
		}
		return Math.random() < 0.5;
	}

	isFlinched(): boolean {
		return this.has(VolatileStatus.FLINCH);
	}

	checkInfatuationImmobilize(): boolean {
		if (!this.has(VolatileStatus.INFATUATION)) {
			return false;
		}
		return Math.random() < 0.5;
	}

	getProtectStaleCounter(): number {
		return this.protectStaleCounter;
	}

	incrementProtectStale(): void {
		this.protectStaleCounter++;
	}

	resetProtectStale(): void {
		this.protectStaleCounter = 0;
	}
}
