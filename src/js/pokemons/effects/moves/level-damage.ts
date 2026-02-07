import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: LevelDamage }])
export class LevelDamage implements Effect {
	move_effect_id: number = 88;
	abr: string = 'LVL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		// Damage equal to user's level
		this.damages = user.level;

		// Apply damage
		target[0].removeHp(this.damages);

		return new EffectResult(undefined, `${target[0].name} took ${this.damages} damage!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
