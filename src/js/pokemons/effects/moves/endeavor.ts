import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Endeavor }])
export class Endeavor implements Effect {
	move_effect_id: number = 190;
	abr: string = 'END';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		if (target[0].currentHp <= user.currentHp) {
			return new EffectResult(undefined, 'But it failed!');
		}

		const damage = target[0].currentHp - user.currentHp;
		target[0].removeHp(damage);
		return new EffectResult(undefined, `${target[0].name}'s HP was reduced to ${user.currentHp}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
