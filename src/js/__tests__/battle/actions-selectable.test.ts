import '@abraham/reflection';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActionType } from '../../battle/actions/actions-model';
import { RunAway, Switch, Attack } from '../../battle/actions/actions-selectable';
import { Message, EndBattle, RemoveHP, ChangePokemon } from '../../battle/actions/actions-derived';
import { createTestPokemon, createTestBattleContext } from '../abilities/test-helpers';
import { PokemonInstance } from '../../pokemons/pokedex';
import { Player } from '../../characters/player';
import { NPC } from '../../characters/npc';
import { AbilityTrigger } from '../../battle/abilities/ability-types';

function createExtendedCtx(overrides: Record<string, unknown> = {}) {
	const base = createTestBattleContext();
	const pokemon1 = createTestPokemon({ name: 'Pikachu', hp: 100, types: ['Electric'] });
	const pokemon2 = createTestPokemon({ name: 'Charmander', hp: 100, types: ['Fire'] });
	base.playerSide[0] = pokemon1;
	base.oppSide[0] = pokemon2;

	const ctx = Object.assign(base, {
		currentMessage: { set: vi.fn() },
		sleep: vi.fn().mockResolvedValue(undefined),
		checkFainted: vi.fn().mockReturnValue([]),
		clearStack: vi.fn(),
		participants: new Set<PokemonInstance>(),
		events: {
			pokemonChange: { set: vi.fn() },
			hazardDamage: { set: vi.fn() },
			weatherDamage: { set: vi.fn() },
			animateAttack: { set: vi.fn() },
			statChangeAnimation: { set: vi.fn() },
			weatherChange: { set: vi.fn() },
			levelUp: { set: vi.fn() },
			playerPokemonFaint: { set: vi.fn() },
			end: { set: vi.fn() },
			runnaway: { set: vi.fn() },
			battleEnded: false
		},
		player: Object.create(Player.prototype),
		opponent: pokemon2,
		isWild: true,
		battleResult: { win: false },
		settings: { difficulty: 'NORMAL' },
		findBestPokemon: vi.fn(),
		fromTypeChart: vi.fn().mockReturnValue(1),
		leveledUpMonsterIds: new Set<number>(),
		escapeAttempts: 0,
		...overrides
	});
	(ctx.player as any).monsters = [pokemon1];
	(ctx.player as any).name = 'Player';
	return ctx;
}

function createMockMove(overrides: Record<string, unknown> = {}) {
	return {
		name: 'Thunderbolt',
		power: 90,
		accuracy: 100,
		type: 'Electric',
		category: 'Special',
		priority: 0,
		target: 'selected-pokemon',
		flags: {},
		effect: { move_effect_id: 0, chance: 0, target: 'target', quantity: 0, value: 0 },
		pp: 15,
		maxPp: 15,
		...overrides
	};
}

describe('Selectable Actions', () => {
	let pokemon: ReturnType<typeof createTestPokemon>;
	let randomSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		pokemon = createTestPokemon({ name: 'Pikachu', hp: 100, speed: 90, types: ['Electric'] });
		randomSpy = vi.spyOn(Math, 'random');
	});

	afterEach(() => {
		randomSpy.mockRestore();
	});

	describe('RunAway', () => {
		it('should have RUN action type', () => {
			const run = new RunAway(pokemon);
			expect(run.type).toBe(ActionType.RUN);
		});

		it('should allow escape in wild battle when random is favorable', () => {
			const ctx = createExtendedCtx({ isWild: true });
			// Make escape succeed - random returns 1 (high value)
			randomSpy.mockReturnValue(1);

			const run = new RunAway(pokemon);
			run.execute(ctx as any);

			// Should push EndBattle on success
			const calls = (ctx.addToStack as ReturnType<typeof vi.fn>).mock.calls;
			const hasEndBattle = calls.some((call: unknown[]) => call[0] instanceof EndBattle);
			const hasEscapeMsg = calls.some(
				(call: unknown[]) =>
					call[0] instanceof Message && (call[0] as Message).description.includes('Got away safely')
			);
			expect(hasEndBattle || hasEscapeMsg).toBe(true);
		});

		it('should fail to escape when random is unfavorable', () => {
			const ctx = createExtendedCtx({ isWild: true });
			// Make escape fail - random returns 0 (low value)
			randomSpy.mockReturnValue(0);
			// Make opponent slower to ensure escape fails (formula: oppSpeed * 128 / mySpeed)
			const fastOpp = createTestPokemon({ name: 'Electrode', hp: 100, speed: 100 });
			ctx.oppSide[0] = fastOpp;

			const run = new RunAway(pokemon);
			run.execute(ctx as any);

			// Should NOT push EndBattle on failure
			const calls = (ctx.addToStack as ReturnType<typeof vi.fn>).mock.calls;
			const hasEndBattle = calls.some((call: unknown[]) => call[0] instanceof EndBattle);
			// Either no EndBattle, or there's a "Can't escape" message
			const hasFailMsg = calls.some(
				(call: unknown[]) =>
					call[0] instanceof Message &&
					(call[0] as Message).description.toLowerCase().includes('run away')
			);
			expect(hasEndBattle === false || hasFailMsg).toBe(true);
		});

		it('should not allow escape in trainer battle', () => {
			const npc = Object.create(NPC.prototype);
			Object.assign(npc, { name: 'Trainer', monsters: [] });
			const ctx = createExtendedCtx({ isWild: false, opponent: npc });

			const run = new RunAway(pokemon);
			run.execute(ctx as any);

			// Should push "can't run" message
			const calls = (ctx.addToStack as ReturnType<typeof vi.fn>).mock.calls;
			const hasCantRunMsg = calls.some(
				(call: unknown[]) =>
					call[0] instanceof Message &&
					(call[0] as Message).description.toLowerCase().includes('can')
			);
			expect(hasCantRunMsg).toBe(true);
		});
	});

	describe('Switch', () => {
		it('should have SWITCH action type', () => {
			const replacement = createTestPokemon({ name: 'Squirtle', hp: 80 });
			const owner = Object.create(Player.prototype);
			const switchAction = new Switch(pokemon, replacement, owner);
			expect(switchAction.type).toBe(ActionType.SWITCH);
		});

		it('should push ChangePokemon action', () => {
			const ctx = createExtendedCtx();
			const replacement = createTestPokemon({ name: 'Squirtle', hp: 80 });
			const owner = Object.create(Player.prototype);
			const switchAction = new Switch(pokemon, replacement, owner);

			switchAction.execute(ctx as any);

			const calls = (ctx.addToStack as ReturnType<typeof vi.fn>).mock.calls;
			const hasChangePokemon = calls.some((call: unknown[]) => call[0] instanceof ChangePokemon);
			expect(hasChangePokemon).toBe(true);
		});

		it('should push switch messages', () => {
			const ctx = createExtendedCtx();
			const replacement = createTestPokemon({ name: 'Squirtle', hp: 80 });
			const owner = Object.create(Player.prototype);
			const switchAction = new Switch(pokemon, replacement, owner);

			switchAction.execute(ctx as any);

			const calls = (ctx.addToStack as ReturnType<typeof vi.fn>).mock.calls;
			const hasMessage = calls.some((call: unknown[]) => call[0] instanceof Message);
			expect(hasMessage).toBe(true);
		});
	});

	describe('Attack', () => {
		it('should have ATTACK action type', () => {
			const move = createMockMove();
			const target = { side: 'opponent' as const, index: 0 };
			const attack = new Attack(move as any, [target], pokemon);
			expect(attack.type).toBe(ActionType.ATTACK);
		});

		it('should push RemoveHP on successful hit', () => {
			const ctx = createExtendedCtx();
			randomSpy.mockReturnValue(0.5); // Hit succeeds (0.5 < 1.0 accuracy)
			const move = createMockMove({ accuracy: 100 });
			const target = { side: 'opponent' as const, index: 0 };

			const attack = new Attack(move as any, [target], pokemon);
			attack.execute(ctx as any);

			const calls = (ctx.addToStack as ReturnType<typeof vi.fn>).mock.calls;
			const hasRemoveHP = calls.some((call: unknown[]) => call[0] instanceof RemoveHP);
			expect(hasRemoveHP).toBe(true);
		});

		it('should push miss message when accuracy check fails', () => {
			const ctx = createExtendedCtx();
			// accuracy=50, random needs to be > 0.5 to miss
			randomSpy.mockReturnValue(0.99);
			const move = createMockMove({ accuracy: 1 }); // very low accuracy
			const target = { side: 'opponent' as const, index: 0 };

			const attack = new Attack(move as any, [target], pokemon);
			attack.execute(ctx as any);

			const calls = (ctx.addToStack as ReturnType<typeof vi.fn>).mock.calls;
			const hasMissMsg = calls.some(
				(call: unknown[]) =>
					call[0] instanceof Message &&
					(call[0] as Message).description.toLowerCase().includes('failed')
			);
			// Either miss message or RemoveHP (depends on exact accuracy logic)
			expect(hasMissMsg).toBe(true);
		});

		it('should trigger ON_BEFORE_MOVE ability event', () => {
			const ctx = createExtendedCtx();
			randomSpy.mockReturnValue(0.5);
			const move = createMockMove();
			const target = { side: 'opponent' as const, index: 0 };

			const attack = new Attack(move as any, [target], pokemon);
			attack.execute(ctx as any);

			expect(ctx.runAbilityEvent).toHaveBeenCalledWith(
				AbilityTrigger.ON_BEFORE_MOVE,
				pokemon,
				expect.anything()
			);
		});

		it('should trigger ON_AFTER_MOVE ability event', () => {
			const ctx = createExtendedCtx();
			randomSpy.mockReturnValue(0.5);
			const move = createMockMove({ accuracy: 100 });
			const target = { side: 'opponent' as const, index: 0 };

			const attack = new Attack(move as any, [target], pokemon);
			attack.execute(ctx as any);

			const afterMoveCalls = (ctx.runAbilityEvent as ReturnType<typeof vi.fn>).mock.calls.filter(
				(call: unknown[]) => call[0] === AbilityTrigger.ON_AFTER_MOVE
			);
			expect(afterMoveCalls.length).toBeGreaterThan(0);
		});
	});
});
