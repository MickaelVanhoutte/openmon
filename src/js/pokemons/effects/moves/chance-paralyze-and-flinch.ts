import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Paralyze } from './paralyze';
import { Flinch } from './flinch';

@injectable()
@registry([{ token: 'Effect', useClass: ChanceParalyzeAndFlinch }])
export class ChanceParalyzeAndFlinch implements Effect {
	move_effect_id: number = 276;
	abr: string = 'PFN';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!target[0]) {
			return new EffectResult();
		}

		let message = '';

		// Chance to paralyze
		if (!target[0].status && Math.random() * 100 < this.effectChance) {
			target[0].status = new Paralyze();
			message += `${target[0].name} is paralyzed! `;
		}

		// Chance to flinch
		if (Math.random() * 100 < this.effectChance) {
			return new EffectResult(new Flinch(), message + `${target[0].name} flinched!`);
		}

		return message ? new EffectResult(undefined, message) : new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
