import '@abraham/reflection';
import { injectable, registry } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';

@injectable()
@registry([{ token: 'Effect', useClass: ShellSmash }])
export class ShellSmash implements Effect {
	move_effect_id: number = 309;
	abr: string = 'SMS';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		user.changeBattleStats('attack', 2);
		user.changeBattleStats('specialAttack', 2);
		user.changeBattleStats('speed', 2);
		user.changeBattleStats('defense', -1);
		user.changeBattleStats('specialDefense', -1);
		return new EffectResult(undefined, `${user.name} smashed its shell!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
