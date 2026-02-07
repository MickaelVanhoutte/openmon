import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: PainSplit }])
export class PainSplit implements Effect {
	move_effect_id: number = 92;
	abr: string = 'PSP';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		// Calculate the average HP
		const totalHP = user.currentHp + target[0].currentHp;
		const averageHP = Math.floor(totalHP / 2);

		// Set both Pokémon to the average HP
		const userOldHP = user.currentHp;
		const targetOldHP = target[0].currentHp;

		user.setHp(averageHP);
		target[0].setHp(averageHP);

		return new EffectResult(undefined, `The battlers shared their pain!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
