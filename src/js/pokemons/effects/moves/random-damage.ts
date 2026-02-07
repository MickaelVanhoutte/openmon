import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: RandomDamage }])
export class RandomDamage implements Effect {
	move_effect_id: number = 89;
	abr: string = 'RND';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		// Random damage between 50% and 150% of user's level
		const baseLevel = user.level;
		const percentage = (Math.floor(Math.random() * 11) + 5) * 10; // 50% to 150% in increments of 10%
		this.damages = Math.floor((baseLevel * percentage) / 100);

		// Apply damage
		target[0].removeHp(this.damages);

		return new EffectResult(undefined, `${target[0].name} took ${this.damages} damage!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
