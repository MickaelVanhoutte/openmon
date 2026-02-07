import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: SpitUp }])
export class SpitUp implements Effect {
	move_effect_id: number = 162;
	abr: string = 'SPU';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power calculation based on stockpile is handled in damage calculation
		return new EffectResult(undefined, 'Stockpile power was released!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}
