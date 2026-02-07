import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Tailwind }])
export class Tailwind implements Effect {
	move_effect_id: number = 226;
	abr: string = 'TLW';
	duration: number = 4;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, 'A tailwind blew from behind your team!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The tailwind petered out!');
		}
		return new EffectForTurn(true);
	}
}
