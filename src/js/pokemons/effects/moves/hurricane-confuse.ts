import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Confusion } from './confusion';

@injectable()
@registry([{ token: 'Effect', useClass: HurricaneConfuse }])
export class HurricaneConfuse implements Effect {
	move_effect_id: number = 334;
	abr: string = 'HRC';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 30;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && Math.random() * 100 < this.effectChance) {
			const confusion = new Confusion();
			confusion.duration = Math.floor(Math.random() * 4) + 2;
			return new EffectResult(confusion, `${target[0].name} became confused!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
