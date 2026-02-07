import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance, MoveInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Transform }])
export class Transform implements Effect {
	move_effect_id = 58;
	abr = 'TRN';
	duration = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!targets || targets.length === 0 || !user) {
			return new EffectResult();
		}

		const target = targets[0];

		// Copy only necessary attributes
		user.types = [...target.types];
		user.moves = target.moves.map(
			(move) =>
				new MoveInstance(
					move.id,
					move.name,
					move.type,
					move.category,
					move.power,
					move.accuracy,
					5, // PP is set to 5 for all moves
					move.priority,
					move.target,
					move.effect,
					move.effectChance,
					move.description,
					move.level
				)
		);

		// Copy current stats (except HP)
		const oldHp = user.currentStats.hp;
		const oldCurrentHp = user.currentHp;
		user.stats = { ...target.stats };
		user.currentStats = { ...target.currentStats };
		user.currentStats.hp = oldHp;
		user.currentHp = oldCurrentHp;

		// Set sprite to target's sprite
		user.sprites = target.sprites;

		return new EffectResult(undefined, `${user.name} transformed into ${target.name}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
