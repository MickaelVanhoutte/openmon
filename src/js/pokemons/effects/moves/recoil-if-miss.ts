import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: RecoilIfMiss }])
export class RecoilIfMiss implements Effect {
	move_effect_id: number = 46;
	abr: string = 'RCL';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;

	turnsPassed: number = 0;
	healed = false;
	missed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (user && this.missed) {
			// If the move missed, deal half of user's max HP as recoil
			const recoilDamage = Math.floor(user.currentStats.hp / 2);
			user.removeHp(recoilDamage);
			return new EffectResult(undefined, `${user.name} kept going and crashed!`);
		}
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
