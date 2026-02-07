import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Burn }])
export class Burn implements Effect {
	move_effect_id = 5;
	abr: string = 'BRN';
	duration: number = -1;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	constructor() {}

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		const burn = new Burn();
		burn.damages = Math.floor(target[0].currentStats.hp / 16);
		return new EffectResult(burn, `${target[0].name} is burnt`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		target.removeHp(this.damages);
		return new EffectForTurn(true, `${target.name} is hurt by burn`);
	}
}
