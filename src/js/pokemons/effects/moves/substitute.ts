import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Substitute }])
export class Substitute implements Effect {
	move_effect_id: number = 80;
	abr: string = 'SUB';
	duration: number = -1; // Lasts until broken
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;
	hp: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		// Calculate HP cost (1/4 of max HP)
		const hpCost = Math.floor(user.stats.hp / 4);

		// Check if user has enough HP
		if (user.currentHp <= hpCost) {
			return new EffectResult(undefined, 'But it failed!');
		}

		// Create substitute
		user.removeHp(hpCost);
		this.hp = hpCost;

		return new EffectResult(this, `${user.name} created a substitute!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		// The substitute's effects (blocking status moves, taking damage, etc.)
		// are handled in the battle system
		return new EffectForTurn(true);
	}
}
