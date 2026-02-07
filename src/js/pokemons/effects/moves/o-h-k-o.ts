import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: OHKO }])
export class OHKO implements Effect {
	move_effect_id: number = 39;
	abr: string = 'OHKO';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0] || !user) {
			return new EffectResult(undefined, 'But it failed!');
		}
		// OHKO only works if user level >= target level
		if (user.level < target[0].level) {
			return new EffectResult(undefined, 'But it failed!');
		}
		target[0].currentStats.hp = 0;
		target[0].fainted = true;
		return new EffectResult(undefined, "It's a one-hit KO!");
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
