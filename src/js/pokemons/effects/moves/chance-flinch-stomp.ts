import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Flinch } from './flinch';

@injectable()
@registry([{ token: 'Effect', useClass: ChanceFlinchStomp }])
export class ChanceFlinchStomp implements Effect {
	move_effect_id: number = 147;
	abr: string = 'FLN?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 30;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && Math.random() * 100 < this.effectChance) {
			return new EffectResult(new Flinch(), `${target[0].name} flinched!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
