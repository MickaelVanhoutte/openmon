import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: SunnyDay }])
export class SunnyDay implements Effect {
	move_effect_id: number = 138;
	abr: string = 'SUN';
	duration: number = 5;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		const duration = user?.hasItem('Heat Rock') ? 8 : 5;
		const effect = new SunnyDay();
		effect.duration = duration;
		return new EffectResult(effect, 'The sunlight turned harsh!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		if (this.turnsPassed >= this.duration) {
			this.healed = true;
			return new EffectForTurn(true, 'The sunlight faded.');
		}
		return new EffectForTurn(true);
	}
}
