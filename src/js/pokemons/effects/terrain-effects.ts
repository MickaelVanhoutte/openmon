import { Effect, EffectTiming, EffectResult, EffectForTurn } from './types';
import { Terrain, BattleField } from '../../battle/battle-field';

export { Terrain };

const GRASSY_HALVED_MOVES = ['earthquake', 'bulldoze', 'magnitude'];

export function getTerrainDamageMultiplier(
	terrain: Terrain,
	moveType: string,
	isGrounded: boolean,
	moveName?: string
): number {
	if (!isGrounded) {
		return 1;
	}

	const typeLower = moveType.toLowerCase();
	const moveNameLower = moveName?.toLowerCase() ?? '';

	switch (terrain) {
		case Terrain.ELECTRIC:
			if (typeLower === 'electric') {
				return 1.3;
			}
			break;
		case Terrain.GRASSY:
			if (typeLower === 'grass') {
				return 1.3;
			}
			if (GRASSY_HALVED_MOVES.includes(moveNameLower)) {
				return 0.5;
			}
			break;
		case Terrain.PSYCHIC:
			if (typeLower === 'psychic') {
				return 1.3;
			}
			break;
		case Terrain.MISTY:
			if (typeLower === 'dragon') {
				return 0.5;
			}
			break;
	}

	return 1;
}

export function canApplyStatusOnTerrain(terrain: Terrain, isGrounded: boolean): boolean {
	if (terrain === Terrain.MISTY && isGrounded) {
		return false;
	}
	return true;
}

export function canApplySleepOnTerrain(terrain: Terrain, isGrounded: boolean): boolean {
	if (terrain === Terrain.ELECTRIC && isGrounded) {
		return false;
	}
	return canApplyStatusOnTerrain(terrain, isGrounded);
}

export function blocksPriorityOnTerrain(terrain: Terrain, targetIsGrounded: boolean): boolean {
	return terrain === Terrain.PSYCHIC && targetIsGrounded;
}

export function getGrassyTerrainHealing(maxHp: number, isGrounded: boolean): number {
	if (!isGrounded) {
		return 0;
	}
	return Math.floor(maxHp / 16);
}

export function isGroundedForTerrain(types: string[]): boolean {
	return !types.some((t) => t.toLowerCase() === 'flying');
}

export abstract class TerrainEffect implements Effect {
	abstract move_effect_id: number;
	abstract terrainType: Terrain;
	abr: string = '';
	duration: number = 5;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed: boolean = false;

	apply(target: unknown[], user?: unknown): EffectResult {
		return new EffectResult(this, `Terrain activated!`);
	}

	playEffect(target: unknown, user?: unknown): EffectForTurn {
		return new EffectForTurn(true);
	}

	setTerrain(battleField: BattleField): void {
		battleField.setTerrain(this.terrainType, this.duration);
	}
}

export class ElectricTerrainEffect extends TerrainEffect {
	move_effect_id: number = 352;
	terrainType: Terrain = Terrain.ELECTRIC;
}

export class GrassyTerrainEffect extends TerrainEffect {
	move_effect_id: number = 353;
	terrainType: Terrain = Terrain.GRASSY;
}

export class PsychicTerrainEffect extends TerrainEffect {
	move_effect_id: number = 354;
	terrainType: Terrain = Terrain.PSYCHIC;
}

export class MistyTerrainEffect extends TerrainEffect {
	move_effect_id: number = 355;
	terrainType: Terrain = Terrain.MISTY;
}
