import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Poison }])
export class Poison implements Effect {
	move_effect_id: number = 3;
	abr: string = 'PSN';
	duration: number = -1;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	constructor() {}

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		const poison = new Poison();
		poison.damages = Math.floor(target[0].currentStats.hp / 8);
		return new EffectResult(poison, `${target[0].name} is poisoned`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		target.removeHp(this.damages);
		return new EffectForTurn(true, `${target.name} is hurt by poison`);
	}
}
