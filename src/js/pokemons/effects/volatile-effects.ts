import { Effect, EffectTiming, EffectResult, EffectForTurn, DEFAULT_EFFECT_PROPS } from './types';
import { PokemonInstance } from '../pokedex';
import { VolatileStatus, VolatileTracker } from '../volatile-status';

export { VolatileStatus };

export abstract class VolatileEffect implements Effect {
	abstract move_effect_id: number;
	abstract volatileType: VolatileStatus;
	abstract defaultTurns: number;
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

	applyVolatile(target: PokemonInstance, turns?: number): void {
		target.volatiles.add(this.volatileType, turns ?? this.defaultTurns);
	}
}

export class ConfuseEffect extends VolatileEffect {
	move_effect_id: number = 77;
	volatileType: VolatileStatus = VolatileStatus.CONFUSED;
	defaultTurns: number = 4;
}

export class FlinchEffect extends VolatileEffect {
	move_effect_id: number = 32;
	volatileType: VolatileStatus = VolatileStatus.FLINCH;
	defaultTurns: number = 0;
}

export class InfatuateEffect extends VolatileEffect {
	move_effect_id: number = 78;
	volatileType: VolatileStatus = VolatileStatus.INFATUATION;
	defaultTurns: number = 0;
}

export class LeechSeedEffect extends VolatileEffect {
	move_effect_id: number = 84;
	volatileType: VolatileStatus = VolatileStatus.SEEDED;
	defaultTurns: number = 0;
}

export class NightmareEffect extends VolatileEffect {
	move_effect_id: number = 108;
	volatileType: VolatileStatus = VolatileStatus.NIGHTMARE;
	defaultTurns: number = 0;
}

export class CurseEffect extends VolatileEffect {
	move_effect_id: number = 110;
	volatileType: VolatileStatus = VolatileStatus.CURSED;
	defaultTurns: number = 0;
}

export class TauntEffect extends VolatileEffect {
	move_effect_id: number = 169;
	volatileType: VolatileStatus = VolatileStatus.TAUNT;
	defaultTurns: number = 3;
}

export class EncoreEffect extends VolatileEffect {
	move_effect_id: number = 91;
	volatileType: VolatileStatus = VolatileStatus.ENCORE;
	defaultTurns: number = 3;
}
