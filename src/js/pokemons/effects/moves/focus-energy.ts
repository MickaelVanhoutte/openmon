import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: FocusEnergy }])
export class FocusEnergy implements Effect {
	move_effect_id: number = 48;
	abr: string = 'FOC';
	duration: number = -1; // Lasts until the user leaves the field
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		// Check if user already has Focus Energy
		if (user.status?.abr === 'FOC') {
			return new EffectResult(undefined, 'But it failed!');
		}

		return new EffectResult(this, `${user.name} is getting pumped!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}
}
