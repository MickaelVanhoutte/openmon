import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: MultiHit }])
export class MultiHit implements Effect {
	move_effect_id: number = 30;
	abr: string = 'MLT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		const rand = Math.random();
		const hits = rand < 0.375 ? 2 : rand < 0.75 ? 3 : rand < 0.875 ? 4 : 5;
		return new EffectResult(undefined, `Hit ${hits} times!`, hits);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}
