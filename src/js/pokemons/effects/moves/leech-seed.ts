import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: LeechSeed }])
export class LeechSeed implements Effect {
	move_effect_id: number = 85;
	abr: string = 'SEED';
	duration: number = -1; // Lasts until the Pokémon leaves the field
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) {
			return new EffectResult();
		}

		// Check if target is Grass type (immune to Leech Seed)
		if (target[0].hasType('Grass')) {
			return new EffectResult(undefined, "It doesn't affect the target!");
		}

		return new EffectResult(this, `${target[0].name} was seeded!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (!target || !user) {
			return new EffectForTurn();
		}

		// Calculate damage (1/8 of target's max HP)
		const damage = Math.floor(target.stats.hp / 8);

		// Damage target and heal user
		target.removeHp(damage);
		user.restoreHp(damage);

		return new EffectForTurn(true, `${target.name}'s health is sapped by Leech Seed!`);
	}
}
