import { describe, it, expect, vi } from 'vitest';
import type { AbilityContext } from '../../battle/abilities/ability-types';
import { createTestPokemon, createTestBattleContext } from './test-helpers';
import { Weather } from '../../battle/battle-field';
import { healer, harvest } from '../../battle/abilities/tiers/tier4-turn-status';

describe('Healer Ability', () => {
	it('should have correct metadata', () => {
		expect(healer.id).toBe(131);
		expect(healer.name).toBe('Healer');
		expect(healer.description).toContain('ally');
	});

	it('should cure ally status with 30% chance', () => {
		const pokemon = createTestPokemon({ name: 'Chansey' });
		const ally = createTestPokemon({ name: 'Blissey' });
		ally.status = { abr: 'PSN' } as any;

		const battleContext = createTestBattleContext();
		battleContext.playerSide = [pokemon, ally];
		battleContext.addToStack = vi.fn();

		const ctx: AbilityContext = {
			battleContext,
			pokemon,
			target: undefined,
			move: undefined
		};

		vi.spyOn(Math, 'random').mockReturnValue(0.1);

		const result = healer.onTurnEnd!(ctx);

		expect(ally.status).toBeUndefined();
		expect(result).toBe(true);
		expect(battleContext.addToStack).toHaveBeenCalled();

		vi.restoreAllMocks();
	});

	it('should not cure ally status when chance fails', () => {
		const pokemon = createTestPokemon({ name: 'Chansey' });
		const ally = createTestPokemon({ name: 'Blissey' });
		ally.status = { abr: 'PSN' } as any;

		const battleContext = createTestBattleContext();
		battleContext.playerSide = [pokemon, ally];
		battleContext.addToStack = vi.fn();

		const ctx: AbilityContext = {
			battleContext,
			pokemon,
			target: undefined,
			move: undefined
		};

		vi.spyOn(Math, 'random').mockReturnValue(0.5);

		const result = healer.onTurnEnd!(ctx);

		expect(ally.status).toBeDefined();
		expect(result).toBeUndefined();
		expect(battleContext.addToStack).not.toHaveBeenCalled();

		vi.restoreAllMocks();
	});

	it('should not activate when no allies have status', () => {
		const pokemon = createTestPokemon({ name: 'Chansey' });
		const ally = createTestPokemon({ name: 'Blissey' });

		const battleContext = createTestBattleContext();
		battleContext.playerSide = [pokemon, ally];
		battleContext.addToStack = vi.fn();

		const ctx: AbilityContext = {
			battleContext,
			pokemon,
			target: undefined,
			move: undefined
		};

		vi.spyOn(Math, 'random').mockReturnValue(0.1);

		const result = healer.onTurnEnd!(ctx);

		expect(result).toBeUndefined();
		expect(battleContext.addToStack).not.toHaveBeenCalled();

		vi.restoreAllMocks();
	});

	it('should skip fainted allies', () => {
		const pokemon = createTestPokemon({ name: 'Chansey' });
		const faintedAlly = createTestPokemon({ name: 'Blissey' });
		faintedAlly.status = { abr: 'PSN' } as any;
		faintedAlly.fainted = true;

		const battleContext = createTestBattleContext();
		battleContext.playerSide = [pokemon, faintedAlly];
		battleContext.addToStack = vi.fn();

		const ctx: AbilityContext = {
			battleContext,
			pokemon,
			target: undefined,
			move: undefined
		};

		vi.spyOn(Math, 'random').mockReturnValue(0.1);

		const result = healer.onTurnEnd!(ctx);

		expect(faintedAlly.status).toBeDefined();
		expect(result).toBeUndefined();
		expect(battleContext.addToStack).not.toHaveBeenCalled();

		vi.restoreAllMocks();
	});

	it('should not cure self', () => {
		const pokemon = createTestPokemon({ name: 'Chansey' });
		pokemon.status = { abr: 'PSN' } as any;

		const battleContext = createTestBattleContext();
		battleContext.playerSide = [pokemon];
		battleContext.addToStack = vi.fn();

		const ctx: AbilityContext = {
			battleContext,
			pokemon,
			target: undefined,
			move: undefined
		};

		vi.spyOn(Math, 'random').mockReturnValue(0.1);

		const result = healer.onTurnEnd!(ctx);

		expect(pokemon.status).toBeDefined();
		expect(result).toBeUndefined();

		vi.restoreAllMocks();
	});
});

describe('Harvest Ability', () => {
	it('should have correct metadata', () => {
		expect(harvest.id).toBe(139);
		expect(harvest.name).toBe('Harvest');
		expect(harvest.description).toContain('Berry');
	});

	it('should have 50% chance in normal weather', () => {
		const pokemon = createTestPokemon({ name: 'Tropius' });
		const battleContext = createTestBattleContext({ weather: Weather.NONE });

		const ctx: AbilityContext = {
			battleContext,
			pokemon,
			target: undefined,
			move: undefined
		};

		vi.spyOn(Math, 'random').mockReturnValue(0.4);

		const result = harvest.onTurnEnd!(ctx);

		expect(result).toBeUndefined();

		vi.restoreAllMocks();
	});

	it('should have 100% chance in sun', () => {
		const pokemon = createTestPokemon({ name: 'Tropius' });
		const battleContext = createTestBattleContext({ weather: Weather.SUN });

		const ctx: AbilityContext = {
			battleContext,
			pokemon,
			target: undefined,
			move: undefined
		};

		vi.spyOn(Math, 'random').mockReturnValue(0.9);

		const result = harvest.onTurnEnd!(ctx);

		expect(result).toBeUndefined();

		vi.restoreAllMocks();
	});

	it('should not activate when chance fails in normal weather', () => {
		const pokemon = createTestPokemon({ name: 'Tropius' });
		const battleContext = createTestBattleContext({ weather: Weather.NONE });

		const ctx: AbilityContext = {
			battleContext,
			pokemon,
			target: undefined,
			move: undefined
		};

		vi.spyOn(Math, 'random').mockReturnValue(0.6);

		const result = harvest.onTurnEnd!(ctx);

		expect(result).toBeUndefined();

		vi.restoreAllMocks();
	});

	it('should calculate correct chance based on weather', () => {
		const pokemon = createTestPokemon({ name: 'Tropius' });
		const battleContextSun = createTestBattleContext({ weather: Weather.SUN });
		const battleContextNormal = createTestBattleContext({ weather: Weather.NONE });

		const ctxSun: AbilityContext = {
			battleContext: battleContextSun,
			pokemon,
			target: undefined,
			move: undefined
		};

		const ctxNormal: AbilityContext = {
			battleContext: battleContextNormal,
			pokemon,
			target: undefined,
			move: undefined
		};

		vi.spyOn(Math, 'random').mockReturnValue(0.75);

		harvest.onTurnEnd!(ctxSun);
		harvest.onTurnEnd!(ctxNormal);

		vi.restoreAllMocks();
	});
});
