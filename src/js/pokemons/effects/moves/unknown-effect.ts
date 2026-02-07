import '@abraham/reflection';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

export class UnknownEffect implements Effect {
	damages: number = 0;
	abr: string = '???';
	duration: number = 0;
	move_effect_id: number = 0;
	when: EffectTiming = EffectTiming.START_TURN;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[]): EffectResult {
		return new EffectResult(undefined, 'Effect not implemented yet...');
	}

	playEffect(target: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true, 'Effect not implemented yet...');
	}
}
