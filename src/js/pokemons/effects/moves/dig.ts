import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Dig }])
export class Dig implements Effect {
	move_effect_id: number = 257;
	abr: string = 'DIG';
	duration: number = 1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	digging: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!this.digging) {
			this.digging = true;
			return new EffectResult(this, `${user?.name} dug a hole!`);
		}
		this.digging = false;
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (this.digging) {
			return new EffectForTurn(false);
		}
		return new EffectForTurn(true);
	}
}
