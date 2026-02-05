import pokemonMovesJson from '../../assets/data/raw/moves/pokemon-moves.json';
import movesJson from '../../assets/data/raw/moves/moves.json';
import moveEffectsJson from '../../assets/data/raw/moves/move-effects.json';
import { MoveEffect } from './pokedex';

interface RawPokemonMove {
	pokemon_id: string | number;
	version_group_id: string | number;
	move_id: string | number;
	pokemon_move_method_id: string | number;
	level: string | number;
	order: string | number;
}

interface RawMove {
	id: string | number;
	identifier: string;
	generation_id: string | number;
	type_id: string | number;
	power: string | number;
	pp: string | number;
	accuracy: string | number;
	priority: string | number;
	target_id: string | number;
	damage_class_id: string | number;
	effect_id: string | number;
	effect_chance: string | number;
}

interface RawMoveEffect {
	move_effect_id: string | number;
	local_language_id: string | number;
	short_effect: string;
	effect: string;
}

export interface HydratedMove {
	id: number;
	name: string;
	type: string;
	category: 'physical' | 'special' | 'no-damage';
	power: number;
	accuracy: number;
	pp: number;
	priority: number;
	target: string;
	effect: MoveEffect;
	effectChance: number;
	description: string;
	level: number;
	method: string;
}

const TYPE_ID_TO_NAME: Record<number, string> = {
	1: 'normal',
	2: 'fighting',
	3: 'flying',
	4: 'poison',
	5: 'ground',
	6: 'rock',
	7: 'bug',
	8: 'ghost',
	9: 'steel',
	10: 'fire',
	11: 'water',
	12: 'grass',
	13: 'electric',
	14: 'psychic',
	15: 'ice',
	16: 'dragon',
	17: 'dark',
	18: 'fairy'
};

const CATEGORY_ID_TO_NAME: Record<number, 'physical' | 'special' | 'no-damage'> = {
	1: 'no-damage',
	2: 'physical',
	3: 'special'
};

const TARGET_ID_TO_NAME: Record<number, string> = {
	1: 'specific-move',
	2: 'selected-pokemon-me-first',
	3: 'ally',
	4: 'users-field',
	5: 'user-or-ally',
	6: 'opponents-field',
	7: 'user',
	8: 'random-opponent',
	9: 'all-other-pokemon',
	10: 'selected-pokemon',
	11: 'all-opponents',
	12: 'entire-field',
	13: 'user-and-allies',
	14: 'all-pokemon',
	15: 'all-allies',
	16: 'fainting-pokemon'
};

const METHOD_ID_TO_NAME: Record<number, string> = {
	1: 'level-up',
	2: 'egg',
	3: 'tutor',
	4: 'machine',
	5: 'stadium-surfing-pikachu',
	6: 'light-ball-egg',
	7: 'colosseum-purification',
	8: 'xd-shadow',
	9: 'xd-purification',
	10: 'form-change',
	11: 'zygarde-cube'
};

const pokemonMoves = pokemonMovesJson as unknown as RawPokemonMove[];
const moves = movesJson as unknown as RawMove[];
const moveEffects = moveEffectsJson as unknown as RawMoveEffect[];

function toNumber(value: string | number): number {
	return typeof value === 'number' ? value : parseInt(value) || 0;
}

const movesById = new Map<number, RawMove>();
moves.forEach((move) => {
	movesById.set(toNumber(move.id), move);
});

const effectsById = new Map<number, RawMoveEffect>();
moveEffects
	.filter((e) => toNumber(e.local_language_id) === 9)
	.forEach((effect) => {
		effectsById.set(toNumber(effect.move_effect_id), effect);
	});

export function getMovesByPokemonId(pokemonId: number): HydratedMove[] {
	if (pokemonId <= 0) {
		return [];
	}

	const pokemonMoveEntries = pokemonMoves.filter((pm) => toNumber(pm.pokemon_id) === pokemonId);

	if (pokemonMoveEntries.length === 0) {
		return [];
	}

	const moveMap = new Map<number, { level: number; method: string }>();

	pokemonMoveEntries.forEach((pm) => {
		const moveId = toNumber(pm.move_id);
		const level = toNumber(pm.level);
		const method = METHOD_ID_TO_NAME[toNumber(pm.pokemon_move_method_id)] || 'unknown';

		const existing = moveMap.get(moveId);
		if (!existing || level > existing.level) {
			moveMap.set(moveId, { level, method });
		}
	});

	const hydratedMoves: HydratedMove[] = [];

	moveMap.forEach(({ level, method }, moveId) => {
		const rawMove = movesById.get(moveId);
		if (!rawMove) {
			return;
		}

		const typeId = toNumber(rawMove.type_id);
		const damageClassId = toNumber(rawMove.damage_class_id);
		const targetId = toNumber(rawMove.target_id);
		const effectId = toNumber(rawMove.effect_id);

		const rawEffect = effectsById.get(effectId);
		const effect = rawEffect
			? new MoveEffect(
					toNumber(rawEffect.move_effect_id),
					toNumber(rawEffect.local_language_id),
					rawEffect.short_effect,
					rawEffect.effect
				)
			: new MoveEffect(0, 9, '', '');

		const hydratedMove: HydratedMove = {
			id: moveId,
			name: rawMove.identifier,
			type: TYPE_ID_TO_NAME[typeId] || 'normal',
			category: CATEGORY_ID_TO_NAME[damageClassId] || 'no-damage',
			power: toNumber(rawMove.power),
			accuracy: toNumber(rawMove.accuracy),
			pp: toNumber(rawMove.pp),
			priority: toNumber(rawMove.priority),
			target: TARGET_ID_TO_NAME[targetId] || 'selected-pokemon',
			effect,
			effectChance: toNumber(rawMove.effect_chance),
			description: effect.short_effect || '',
			level,
			method
		};

		hydratedMoves.push(hydratedMove);
	});

	hydratedMoves.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

	return hydratedMoves;
}
