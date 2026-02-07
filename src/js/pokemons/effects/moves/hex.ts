import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Hex }])
export class Hex implements Effect {
	move_effect_id: number = 311;
	abr: string = 'HEX';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power doubling for status is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}
