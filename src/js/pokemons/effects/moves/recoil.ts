import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Recoil }])
export class Recoil implements Effect {
	move_effect_id: number = 49;
	abr: string = 'RCL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && this.damages > 0) {
			// User takes 1/4 of the damage it inflicted as recoil
			const recoilDamage = Math.floor(this.damages / 4);
			user.removeHp(recoilDamage);
			return new EffectResult(undefined, `${user.name} is hit with recoil!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
