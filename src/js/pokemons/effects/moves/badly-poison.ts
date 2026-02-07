import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: BadlyPoison }])
export class BadlyPoison implements Effect {
	move_effect_id: number = 34;
	abr: string = 'PSN+';
	duration: number = -1;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		const badlyPoison = new BadlyPoison();
		badlyPoison.damages = Math.floor(target[0].currentStats.hp / 16);
		return new EffectResult(badlyPoison, `${target[0].name} was badly poisoned!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		this.turnsPassed++;
		// Damage increases by 1/16 each turn
		const damage = Math.floor(this.damages * this.turnsPassed);
		target.removeHp(damage);
		return new EffectForTurn(true, `${target.name} is hurt by poison!`);
	}
}
