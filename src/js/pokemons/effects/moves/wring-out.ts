import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: WringOut }])
export class WringOut implements Effect {
	move_effect_id: number = 238;
	abr: string = 'WRO';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Power calculation based on target HP is handled in damage calculation
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}
