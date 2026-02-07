import '@abraham/reflection';
import { injectable, registry, container } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Weather, type BattleField } from '../../../battle/battle-field';

@injectable()
@registry([{ token: 'Effect', useClass: Growth }])
export class Growth implements Effect {
	move_effect_id: number = 317;
	abr: string = 'GRW';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		if (!user) {
			return new EffectResult();
		}

		let battleField: BattleField | undefined;
		try {
			battleField = container.resolve<BattleField>('BattleField');
		} catch (e) {}

		const isSun = battleField?.weather === Weather.SUN;
		const boost = isSun ? 2 : 1;

		user.changeBattleStats('attack', boost);
		user.changeBattleStats('specialAttack', boost);
		return new EffectResult(
			undefined,
			isSun
				? `${user.name}'s Attack and Sp. Attack rose sharply!`
				: `${user.name}'s Attack and Sp. Attack rose!`
		);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
