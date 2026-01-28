import { Effect, EffectTiming, EffectResult, EffectForTurn } from './types';
import { Hazard, BattleField, Side, Screen } from '../../battle/battle-field';

export { Hazard };

const ROCK_TYPE_CHART: Record<string, number> = {
	fire: 2,
	flying: 2,
	bug: 2,
	ice: 2,
	fighting: 0.5,
	ground: 0.5,
	steel: 0.5
};

export function getRockEffectiveness(types: string[]): number {
	let multiplier = 1;
	for (const type of types) {
		const typeLower = type.toLowerCase();
		if (typeLower in ROCK_TYPE_CHART) {
			multiplier *= ROCK_TYPE_CHART[typeLower];
		}
	}
	return multiplier;
}

export function calculateStealthRockDamage(maxHp: number, types: string[]): number {
	const effectiveness = getRockEffectiveness(types);
	const divisor = 8 / effectiveness;
	const damage = Math.floor(maxHp / divisor);
	return Math.max(1, damage);
}

export function calculateSpikesDamage(maxHp: number, layers: number): number {
	if (layers <= 0) return 0;
	if (layers === 1) return Math.floor(maxHp / 8);
	if (layers === 2) return Math.floor(maxHp / 6);
	return Math.floor(maxHp / 4);
}

export function applyToxicSpikes(layers: number): 'none' | 'poison' | 'toxic' {
	if (layers <= 0) return 'none';
	if (layers === 1) return 'poison';
	return 'toxic';
}

export function isGroundedForHazards(types: string[]): boolean {
	return !types.some((t) => t.toLowerCase() === 'flying');
}

export function clearHazardsForSide(battleField: BattleField, side: Side): void {
	battleField.clearHazards(side);
}

export function clearAllHazards(battleField: BattleField): void {
	battleField.clearHazards('ally');
	battleField.clearHazards('enemy');
}

export abstract class HazardEffect implements Effect {
	abstract move_effect_id: number;
	abstract hazardType: Hazard;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: unknown[], user?: unknown): EffectResult {
		return new EffectResult(this, `Hazard set!`);
	}

	playEffect(target: unknown, user?: unknown): EffectForTurn {
		return new EffectForTurn(true);
	}

	applyHazard(battleField: BattleField, side: Side): void {
		battleField.addHazard(side, this.hazardType);
	}
}

export class StealthRockEffect extends HazardEffect {
	move_effect_id: number = 153;
	hazardType: Hazard = Hazard.STEALTH_ROCK;
}

export class SpikesEffect extends HazardEffect {
	move_effect_id: number = 113;
	hazardType: Hazard = Hazard.SPIKES;
}

export class ToxicSpikesEffect extends HazardEffect {
	move_effect_id: number = 191;
	hazardType: Hazard = Hazard.TOXIC_SPIKES;
}

export class RapidSpinEffect implements Effect {
	move_effect_id: number = 110;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: unknown[], user?: unknown): EffectResult {
		return new EffectResult(this, `Hazards cleared!`);
	}

	playEffect(target: unknown, user?: unknown): EffectForTurn {
		return new EffectForTurn(true);
	}

	clearHazards(battleField: BattleField, userSide: Side): void {
		clearHazardsForSide(battleField, userSide);
	}
}

export class DefogEffect implements Effect {
	move_effect_id: number = 259;
	abr: string = '';
	duration: number = -1;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: unknown[], user?: unknown): EffectResult {
		return new EffectResult(this, `All hazards and screens cleared!`);
	}

	playEffect(target: unknown, user?: unknown): EffectForTurn {
		return new EffectForTurn(true);
	}

	clearAll(battleField: BattleField): void {
		clearAllHazards(battleField);
		battleField.removeScreen('ally', Screen.REFLECT);
		battleField.removeScreen('ally', Screen.LIGHT_SCREEN);
		battleField.removeScreen('enemy', Screen.REFLECT);
		battleField.removeScreen('enemy', Screen.LIGHT_SCREEN);
	}
}
