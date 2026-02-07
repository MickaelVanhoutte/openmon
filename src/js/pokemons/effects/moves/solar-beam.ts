import '@abraham/reflection';
import { injectable, registry, container } from 'tsyringe';
import type { PokemonInstance } from '../../pokedex';
import { EffectTiming, EffectResult, EffectForTurn, type Effect } from '../types';
import { Weather, type BattleField } from '../../../battle/battle-field';

@injectable()
@registry([{ token: 'Effect', useClass: SolarBeam }])
export class SolarBeam implements Effect {
	move_effect_id: number = 152;
	abr: string = 'SOL';
	duration: number = 1;
	when: EffectTiming = EffectTiming.BEFORE_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;
	charging: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		let battleField: BattleField | undefined;
		try {
			battleField = container.resolve<BattleField>('BattleField');
		} catch (e) {}

		const isSun = battleField?.weather === Weather.SUN;

		if (!this.charging && !isSun) {
			this.charging = true;
			return new EffectResult(this, `${user?.name} is absorbing light!`);
		}
		this.charging = false;
		return new EffectResult();
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		if (this.charging) {
			return new EffectForTurn(false);
		}
		return new EffectForTurn(true);
	}
}
