import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: LightScreen }])
export class LightScreen implements Effect {
	move_effect_id = 66;
	abr = 'LSCR';
	duration = 5;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages = 0;
	turnsPassed = 0;
	healed = false;

	apply(targets: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}
		// Light Screen reduces physical damage by half for 5 turns
		// In double battles, the reduction is 1/3 (not implemented yet)
		// If the user is holding Light Clay, the barrier lasts for 8 turns
		if (user.hasEffect('LightScreen')) {
			return new EffectResult(undefined, 'But it failed!');
		}
		this.duration = user.hasItem('Light Clay') ? 8 : 5;
		return new EffectResult(this, 'A barrier of light appeared!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
