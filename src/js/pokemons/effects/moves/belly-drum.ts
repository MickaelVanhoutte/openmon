import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: BellyDrum }])
export class BellyDrum implements Effect {
	move_effect_id: number = 143;
	abr: string = 'BLD';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		const hpCost = Math.floor(user.stats.hp / 2);
		if (user.currentHp <= hpCost) {
			return new EffectResult(undefined, 'But it failed!');
		}

		user.removeHp(hpCost);
		user.statsChanges.attack = 6; // Max out attack
		return new EffectResult(undefined, `${user.name} maximized its Attack!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
