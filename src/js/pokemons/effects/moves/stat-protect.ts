import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([
	{
		token: 'Effect',
		useValue: 'stat-protect'
	}
])
export class StatProtect implements Effect {
	move_effect_id: number = 47;
	abr: string = 'MIST';
	duration: number = 5;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		return new EffectResult(this, 'A protective mist surrounds your team!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true, 'The mist prevents stat changes!');
	}
}
