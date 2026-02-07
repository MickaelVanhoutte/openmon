import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Burn } from './burn';

@injectable()
@registry([{ token: 'Effect', useClass: ChanceBurn }])
export class ChanceBurn implements Effect {
	move_effect_id: number = 274;
	abr: string = 'BRN?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10; // Default 10% chance

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && Math.random() * 100 < this.effectChance) {
			// Check if target can be burned (not Fire type, not already burned)
			if (target[0].status || target[0].types.includes('fire')) {
				return new EffectResult();
			}
			const burn = new Burn();
			burn.damages = Math.floor(target[0].currentStats.hp / 16);
			target[0].status = burn;
			return new EffectResult(burn, `${target[0].name} was burned!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
