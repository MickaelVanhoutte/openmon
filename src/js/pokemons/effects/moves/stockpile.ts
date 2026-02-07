import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: Stockpile }])
export class Stockpile implements Effect {
	move_effect_id: number = 161;
	abr: string = 'STK';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	stockpileCount: number = 0;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		if (this.stockpileCount >= 3) {
			return new EffectResult(undefined, 'But it failed!');
		}

		this.stockpileCount++;
		user.changeBattleStats('defense', 1);
		user.changeBattleStats('specialDefense', 1);
		return new EffectResult(this, `${user.name} stockpiled ${this.stockpileCount}!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
