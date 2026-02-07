import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: DreamEater }])
export class DreamEater implements Effect {
	move_effect_id: number = 9;
	abr: string = 'DRM';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && target[0]) {
			// Check if target is sleeping
			if (target[0].status?.abr !== 'SLP') {
				return new EffectResult(undefined, `${target[0].name} must be sleeping!`);
			}

			// Drain half the damage dealt
			const healAmount = Math.floor(this.damages / 2);
			user.heal(healAmount);
			return new EffectResult(undefined, `${user.name} ate ${target[0].name}'s dreams!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
