import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Confusion } from './confusion';

@injectable()
@registry([{ token: 'Effect', useClass: Flatter }])
export class Flatter implements Effect {
	move_effect_id: number = 167;
	abr: string = 'FLT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) {
			return new EffectResult();
		}

		target[0].changeBattleStats('specialAttack', 1);
		const confusion = new Confusion();
		confusion.duration = Math.floor(Math.random() * 4) + 2;
		target[0].status = confusion;
		return new EffectResult(confusion, `${target[0].name}'s Sp. Attack rose! It became confused!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
