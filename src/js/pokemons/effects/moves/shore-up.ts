import '@abraham/reflection';
import { injectable, registry, container } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Weather, type BattleField } from '../../../battle/battle-field';

@injectable()
@registry([{ token: 'Effect', useClass: ShoreUp }])
export class ShoreUp implements Effect {
	move_effect_id: number = 369;
	abr: string = 'SHU';
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

		const isSandstorm = battleField?.weather === Weather.SAND;
		const healPercent = isSandstorm ? 2 / 3 : 0.5;

		const healAmount = Math.floor(user.currentStats.hp * healPercent);
		user.heal(healAmount);
		return new EffectResult(undefined, `${user.name} regained health!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn();
	}
}
