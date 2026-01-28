import '@abraham/reflection';

export enum EffectTiming {
	START_TURN = 'start-turn',
	END_TURN = 'end-turn',
	BEFORE_MOVE = 'before-move',
	AFTER_MOVE = 'after-move',
	BEFORE_SWITCH = 'before-switch',
	AFTER_SWITCH = 'after-switch',
	BEFORE_FAINT = 'before-faint',
	AFTER_FAINT = 'after-faint',
	ON_SWITCH_IN = 'on-switch-in',
	ON_HIT = 'on-hit',
	ON_FAINT = 'on-faint'
}

export class EffectResult {
	message?: string;
	effect?: Effect;

	constructor(effect?: Effect, message?: string) {
		this.message = message;
		this.effect = effect;
	}
}

export class EffectForTurn {
	message?: string;
	canPlay?: boolean = true;

	constructor(canPlay?: boolean, message?: string) {
		this.canPlay = canPlay;
		this.message = message;
	}
}

export interface Effect {
	move_effect_id: number;
	abr: string;
	duration: number;
	when: EffectTiming;
	damages: number;

	turnsPassed: number;
	healed: boolean;

	apply(target: unknown[], user?: unknown): EffectResult;

	playEffect(target: unknown, user?: unknown): EffectForTurn;
}

export const DEFAULT_EFFECT_PROPS = {
	abr: '',
	duration: -1,
	when: EffectTiming.AFTER_MOVE,
	damages: 0,
	turnsPassed: 0,
	healed: false
};
