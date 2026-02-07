import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: FinalGambit }])
export class FinalGambit implements Effect {
	move_effect_id: number = 321;
	abr: string = 'FGB';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		const damage = user.currentHp;
		target[0].removeHp(damage);
		user.currentStats.hp = 0;
		user.fainted = true;
		return new EffectResult(undefined, `${user.name} sacrificed itself to deal ${damage} damage!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
