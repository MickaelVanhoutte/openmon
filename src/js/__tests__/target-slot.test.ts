import '@abraham/reflection';
import { describe, it, expect, beforeEach } from 'vitest';
import { PokemonInstance, MoveInstance } from '../pokemons/pokedex';
import { Attack } from '../battle/actions/actions-selectable';
import type { TargetSlot } from '../battle/actions/actions-model';
import { BattleContext } from '../context/battleContext';
import { BattleField } from '../battle/battle-field';

describe('Slot-Based Target Resolution', () => {
	let battleField: BattleField;
	let user: PokemonInstance;
	let ctx: BattleContext;

	const makePokemon = (name: string, fainted = false) =>
		({
			name,
			level: 50,
			types: ['normal'],
			fainted,
			battleStats: {
				attack: 100,
				defense: 100,
				specialAttack: 100,
				specialDefense: 100,
				speed: 100
			},
			statsChanges: {
				attack: 0,
				defense: 0,
				specialAttack: 0,
				specialDefense: 0,
				speed: 0,
				accuracy: 0,
				evasion: 0
			}
		}) as unknown as PokemonInstance;

	const makeMove = () =>
		new MoveInstance(
			33,
			'Tackle',
			'normal',
			'physical',
			40,
			100,
			35,
			0,
			'selected-pokemon',
			{ move_effect_id: 1 } as any,
			0,
			'Tackle',
			1
		);

	beforeEach(() => {
		battleField = new BattleField();
		user = makePokemon('Attacker');

		ctx = {
			battleField,
			playerSide: [user],
			oppSide: [makePokemon('Defender')],
			fromTypeChart: () => 1.0,
			runAbilityEvent: () => undefined
		} as unknown as BattleContext;
	});

	it('should resolve to the current Pokemon in the slot, not the original', () => {
		const originalPokemon = makePokemon('Original');
		const newPokemon = makePokemon('Newcomer');

		ctx.oppSide = [originalPokemon];
		const attack = new Attack(makeMove(), [{ side: 'opponent', index: 0 }] as TargetSlot[], user);

		ctx.oppSide[0] = newPokemon;

		const result = attack.resolveTargets(ctx);

		expect(result).toHaveLength(1);
		expect(result[0]).toBe(newPokemon);
		expect(result[0]).not.toBe(originalPokemon);
	});

	it('should return empty array when target slot is empty', () => {
		const attack = new Attack(makeMove(), [{ side: 'opponent', index: 0 }] as TargetSlot[], user);

		ctx.oppSide[0] = undefined as unknown as PokemonInstance;

		const result = attack.resolveTargets(ctx);

		expect(result).toEqual([]);
	});

	it('should resolve correctly in doubles after switch', () => {
		const pokemon1 = makePokemon('Slot0-Original');
		const pokemon2 = makePokemon('Slot1-Pokemon');
		const pokemon3 = makePokemon('Slot0-Replacement');

		ctx.oppSide = [pokemon1, pokemon2];

		const attack = new Attack(makeMove(), [{ side: 'opponent', index: 0 }] as TargetSlot[], user);

		ctx.oppSide[0] = pokemon3;

		const result = attack.resolveTargets(ctx);

		expect(result).toHaveLength(1);
		expect(result[0]).toBe(pokemon3);
		expect(result).not.toContain(pokemon1);
	});

	it('should resolve all opponent slots in doubles', () => {
		const pokemon1 = makePokemon('Slot0');
		const pokemon2 = makePokemon('Slot1');

		ctx.oppSide = [pokemon1, pokemon2];

		const attack = new Attack(
			makeMove(),
			[
				{ side: 'opponent', index: 0 },
				{ side: 'opponent', index: 1 }
			] as TargetSlot[],
			user
		);

		const result = attack.resolveTargets(ctx);

		expect(result).toHaveLength(2);
		expect(result).toContain(pokemon1);
		expect(result).toContain(pokemon2);
	});

	it('should skip fainted Pokemon in resolved targets', () => {
		const faintedPokemon = makePokemon('FaintedMon', true);

		ctx.oppSide = [faintedPokemon];

		const attack = new Attack(makeMove(), [{ side: 'opponent', index: 0 }] as TargetSlot[], user);

		const result = attack.resolveTargets(ctx);

		expect(result).toEqual([]);
	});
});
