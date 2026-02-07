import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Freeze } from './freeze';

@injectable()
@registry([{ token: 'Effect', useClass: ChanceFreeze }])
export class ChanceFreeze implements Effect {
	move_effect_id: number = 261;
	abr: string = 'FRZ?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && !target[0].status && Math.random() * 100 < this.effectChance) {
			if (target[0].types.includes('ice')) {
				return new EffectResult();
			}
			return new EffectResult(new Freeze(), `${target[0].name} was frozen solid!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
