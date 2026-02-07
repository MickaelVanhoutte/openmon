import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { BadlyPoison } from './badly-poison';

@injectable()
@registry([{ token: 'Effect', useClass: ChanceBadlyPoison }])
export class ChanceBadlyPoison implements Effect {
	move_effect_id: number = 203;
	abr: string = 'TOX?';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (target[0] && !target[0].status && Math.random() * 100 < this.effectChance) {
			const badlyPoison = new BadlyPoison();
			badlyPoison.damages = Math.floor(target[0].currentStats.hp / 16);
			target[0].status = badlyPoison;
			return new EffectResult(badlyPoison, `${target[0].name} was badly poisoned!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
