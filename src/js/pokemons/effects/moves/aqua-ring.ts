import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: AquaRing }])
export class AquaRing implements Effect {
	move_effect_id: number = 252;
	abr: string = 'AQR';
	duration: number = -1;
	when: EffectTiming = EffectTiming.END_TURN;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		return new EffectResult(this, `${user.name} surrounded itself with a veil of water!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		const healAmount = Math.floor(target.stats.hp / 16);
		target.heal(healAmount);
		return new EffectForTurn(true, `Aqua Ring restored ${target.name}'s HP!`);
	}
}
