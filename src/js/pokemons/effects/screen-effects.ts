import { Effect, EffectTiming, EffectResult, EffectForTurn } from './types';
import { Screen, BattleField, Side } from '../../battle/battle-field';

export { Screen };

export function getScreenDamageMultiplier(
	battleField: BattleField,
	defendingSide: Side,
	moveCategory: string
): number {
	const category = moveCategory.toLowerCase();

	if (category === 'physical' && battleField.hasScreen(defendingSide, Screen.REFLECT)) {
		return 0.5;
	}

	if (category === 'special' && battleField.hasScreen(defendingSide, Screen.LIGHT_SCREEN)) {
		return 0.5;
	}

	return 1;
}

export abstract class ScreenEffect implements Effect {
	abstract move_effect_id: number;
	abstract screenType: Screen;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: unknown[], user?: unknown): EffectResult {
		return new EffectResult(this, `Screen set up!`);
	}

	playEffect(target: unknown, user?: unknown): EffectForTurn {
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
