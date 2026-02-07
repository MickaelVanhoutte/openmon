import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Confusion } from './confusion';

@injectable()
@registry([{ token: 'Effect', useClass: SimpleConfuse }])
export class SimpleConfuse implements Effect {
	move_effect_id: number = 50;
	abr: string = 'CNF';
	duration: number = 0;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		// Confusion lasts 2-5 turns
		const confusion = new Confusion();
		confusion.duration = Math.floor(Math.random() * 4) + 2;
		return new EffectResult(confusion, `${target[0].name} became confused!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
