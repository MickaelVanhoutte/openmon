import { Effect, EffectTiming, EffectResult, EffectForTurn, DEFAULT_EFFECT_PROPS } from './types';
import { PokemonInstance } from '../pokedex';
import { VolatileStatus } from '../volatile-status';
import { Terrain, BattleField } from '../../battle/battle-field';

export { Terrain };

export abstract class TwoTurnEffect implements Effect {
	abstract move_effect_id: number;
	abstract chargingMessage: string;
	abstract isSemiInvulnerable: boolean;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}

export abstract class RecoilEffect implements Effect {
	abstract move_effect_id: number;
	abstract recoilPercent: number;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}

	calculateRecoil(damageDealt: number): number {
		return Math.floor(damageDealt * this.recoilPercent);
	}
}

export abstract class DrainEffect implements Effect {
	abstract move_effect_id: number;
	abstract drainPercent: number;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}

	calculateDrain(damageDealt: number): number {
		return Math.floor(damageDealt * this.drainPercent);
	}
}

export abstract class MultiHitEffect implements Effect {
	abstract move_effect_id: number;
	abstract minHits: number;
	abstract maxHits: number;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}

	rollHitCount(): number {
		if (this.minHits === this.maxHits) {
			return this.minHits;
		}
		const roll = Math.random();
		if (roll < 0.35) {
			return 2;
		}
		if (roll < 0.7) {
			return 3;
		}
		if (roll < 0.85) {
			return 4;
		}
		return 5;
	}
}

export abstract class BindingEffect implements Effect {
	abstract move_effect_id: number;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}

	rollDuration(): number {
		return Math.random() < 0.5 ? 4 : 5;
	}

	calculateDamage(targetMaxHp: number): number {
		return Math.floor(targetMaxHp / 8);
	}
}

export abstract class RampageEffect implements Effect {
	abstract move_effect_id: number;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}

	rollDuration(): number {
		return Math.random() < 0.5 ? 2 : 3;
	}
}

export abstract class ProtectionEffect implements Effect {
	abstract move_effect_id: number;
	abstract blocksAll: boolean;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}

	checkSuccess(staleCounter: number): boolean {
		if (staleCounter === 0) {
			return true;
		}
		const successChance = Math.pow(0.5, staleCounter);
		return Math.random() < successChance;
	}
}

export abstract class TerrainEffect implements Effect {
	abstract move_effect_id: number;
	abstract terrainType: Terrain;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, `Terrain changed!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}

	applyTerrain(battleField: BattleField, turns: number = 5): void {
		battleField.setTerrain(this.terrainType, turns);
	}
}

export class TrickRoomEffect implements Effect {
	move_effect_id: number = 218;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, `Trick Room activated!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}

	activateTrickRoom(battleField: BattleField): void {
		battleField.setTrickRoom(true, 5);
	}
}

export interface ActionWithSpeed {
	priority: number;
	speed: number;
}

export function sortActionsWithTrickRoom<T extends ActionWithSpeed>(
	actions: T[],
	trickRoomActive: boolean
): T[] {
	return [...actions].sort((a, b) => {
		if (a.priority !== b.priority) {
			return b.priority - a.priority;
		}
		if (trickRoomActive) {
			return a.speed - b.speed;
		}
		return b.speed - a.speed;
	});
}
