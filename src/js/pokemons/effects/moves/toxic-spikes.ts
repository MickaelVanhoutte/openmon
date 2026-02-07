import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Poison } from './poison';
import { BadlyPoison } from './badly-poison';

@injectable()
@registry([{ token: 'Effect', useClass: ToxicSpikes }])
export class ToxicSpikes implements Effect {
	move_effect_id: number = 250;
	abr: string = 'TSK';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_SWITCH;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	layers: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (this.layers >= 2) {
			return new EffectResult(undefined, 'But it failed!');
		}
		this.layers++;
		return new EffectResult(this, 'Poison spikes were scattered on the ground!');
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (!target.hasType('Poison') && !target.hasType('Steel') && !target.hasType('Flying')) {
			if (this.layers === 1) {
				const poison = new Poison();
				poison.damages = Math.floor(target.currentStats.hp / 8);
				target.status = poison;
				return new EffectForTurn(true, `${target.name} was poisoned!`);
			} else {
				const badlyPoison = new BadlyPoison();
				badlyPoison.damages = Math.floor(target.currentStats.hp / 16);
				target.status = badlyPoison;
				return new EffectForTurn(true, `${target.name} was badly poisoned!`);
			}
		}
		return new EffectForTurn(true);
	}
}
