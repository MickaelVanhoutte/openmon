import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Freeze }])
export class Freeze implements Effect {
	move_effect_id = 6;
	abr: string = 'FRZ';
	duration: number = -1;
	when: EffectTiming = EffectTiming.START_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	constructor() {}

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(new Freeze(), `${target[0].name} is frozen`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (Math.random() < 0.2) {
			this.healed = true;
			target.status = undefined;
		}

		return new EffectForTurn(
			this.healed,
			this.healed ? `${target.name} thawed out` : `${target.name} is frozen solid`
		);
	}
}
