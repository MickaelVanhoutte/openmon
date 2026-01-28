import { Effect, EffectTiming, EffectResult, EffectForTurn, DEFAULT_EFFECT_PROPS } from './types';
import { PokemonInstance } from '../pokedex';
import { Screen, BattleField, Side } from '../../battle/battle-field';

export { Screen };

export abstract class ScreenEffect implements Effect {
	abstract move_effect_id: number;
	abstract screenType: Screen;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: PokemonInstance[], user?: PokemonInstance): EffectResult {
		return new EffectResult(this, `Screen set up!`);
	}

	playEffect(target: PokemonInstance, user?: PokemonInstance): EffectForTurn {
		return new EffectForTurn(true);
	}

	applyScreen(battleField: BattleField, side: Side, turns: number = 5): void {
		battleField.addScreen(side, this.screenType, turns);
	}
}

export class ReflectEffect extends ScreenEffect {
	move_effect_id: number = 66;
	screenType: Screen = Screen.REFLECT;
}

export class LightScreenEffect extends ScreenEffect {
	move_effect_id: number = 36;
	screenType: Screen = Screen.LIGHT_SCREEN;
}
