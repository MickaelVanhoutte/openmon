import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Burn } from './burn';
import { Freeze } from './freeze';
import { Paralyze } from './paralyze';

@injectable()
@registry([{ token: 'Effect', useClass: TriStatus }])
export class TriStatus implements Effect {
	move_effect_id: number = 37;
	abr: string = 'TRI';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user) {
			// Randomly select one of the three status effects
			const rand = Math.random();
			if (rand < 0.33) {
				// Burn
				const burn = new Burn();
				burn.damages = Math.floor(target[0].currentStats.hp / 16);
				return new EffectResult(burn, `${target[0].name} was burned!`);
			} else if (rand < 0.66) {
				// Freeze
				return new EffectResult(new Freeze(), `${target[0].name} was frozen solid!`);
			} else {
				// Paralyze
				return new EffectResult(new Paralyze(), `${target[0].name} was paralyzed!`);
			}
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
