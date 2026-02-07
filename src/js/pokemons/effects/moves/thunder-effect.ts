import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Paralyze } from './paralyze';

@injectable()
@registry([{ token: 'Effect', useClass: ThunderEffect }])
export class ThunderEffect implements Effect {
	move_effect_id: number = 153;
	abr: string = 'THN';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 30;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && !target[0].status && Math.random() * 100 < this.effectChance) {
			return new EffectResult(new Paralyze(), `${target[0].name} is paralyzed!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
