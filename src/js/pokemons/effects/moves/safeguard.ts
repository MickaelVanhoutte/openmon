import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Safeguard }])
export class Safeguard implements Effect {
	move_effect_id: number = 125;
	abr: string = 'SFG';
	duration: number = 5;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			if (user.hasEffect('Safeguard')) {
				return new EffectResult(undefined, 'But it failed!');
			}
			return new EffectResult(new Safeguard(), `${user.name}'s team is protected by Safeguard!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, `The Safeguard wore off!`);
		}
		return new EffectForTurn(true);
	}
}
