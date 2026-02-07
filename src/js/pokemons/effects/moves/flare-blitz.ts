import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Burn } from './burn';

@injectable()
@registry([{ token: 'Effect', useClass: FlareBlitz }])
export class FlareBlitz implements Effect {
	move_effect_id: number = 254;
	abr: string = 'FLB';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	effectChance: number = 10;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		// Recoil damage
		if (this.damages > 0) {
			const recoilDamage = Math.floor(this.damages / 3);
			user.removeHp(recoilDamage);
		}

		// Chance to burn
		if (target[0] && !target[0].status && Math.random() * 100 < this.effectChance) {
			const burn = new Burn();
			burn.damages = Math.floor(target[0].currentStats.hp / 16);
			target[0].status = burn;
			return new EffectResult(
				burn,
				`${user.name} is damaged by recoil! ${target[0].name} was burned!`
			);
		}
		return new EffectResult(undefined, `${user.name} is damaged by recoil!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
