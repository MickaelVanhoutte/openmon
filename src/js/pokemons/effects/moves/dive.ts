import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Dive }])
export class Dive implements Effect {
	move_effect_id: number = 256;
	abr: string = 'DIV';
	duration: number = 1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	diving: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!this.diving) {
			this.diving = true;
			return new EffectResult(this, `${user?.name} dove underwater!`);
		}
		this.diving = false;
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (this.diving) {
			return new EffectForTurn(false);
		}
		return new EffectForTurn(true);
	}
}
