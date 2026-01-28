import { Effect, EffectTiming, EffectResult, EffectForTurn, DEFAULT_EFFECT_PROPS } from './types';
import { PokemonInstance } from '../pokedex';
import { Hazard, BattleField, Side } from '../../battle/battle-field';

export { Hazard };

export abstract class HazardEffect implements Effect {
	abstract move_effect_id: number;
	abstract hazardType: Hazard;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, `Hazard set!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}

	applyHazard(battleField: BattleField, side: Side): void {
		battleField.addHazard(side, this.hazardType);
	}
}

export class StealthRockEffect extends HazardEffect {
	move_effect_id: number = 153;
	hazardType: Hazard = Hazard.STEALTH_ROCK;
}

export class SpikesEffect extends HazardEffect {
	move_effect_id: number = 113;
	hazardType: Hazard = Hazard.SPIKES;
}

export class ToxicSpikesEffect extends HazardEffect {
	move_effect_id: number = 191;
	hazardType: Hazard = Hazard.TOXIC_SPIKES;
}
