import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Counter }])
export class Counter implements Effect {
	move_effect_id: number = 90;
	abr: string = 'CNT';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user || !target[0]) {
			return new EffectResult();
		}

		// In a real implementation, this would check if the user was hit by a physical move
		// and return double the damage. For now, we'll just simulate it.
		const lastDamageTaken = user.lastDamageTaken || 0;

		if (lastDamageTaken <= 0 || !user.lastAttacker) {
			return new EffectResult(undefined, 'But it failed!');
		}

		// Double the damage
		this.damages = lastDamageTaken * 2;

		// Apply damage to the last attacker
		user.lastAttacker.removeHp(this.damages);

		return new EffectResult(undefined, `${user.lastAttacker.name} took ${this.damages} damage!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
