import { describe, it, expect, vi } from 'vitest';
import { Weather, Terrain, BattleField } from '../../battle/battle-field';
import type { AbilityContext } from '../../battle/abilities/ability-types';
import type { BattleContext } from '../../context/battleContext';
import type { PokemonInstance } from '../../pokemons/pokedex';
import { VolatileStatus } from '../../pokemons/volatile-status';
import { createTestPokemon } from './test-helpers';
import {
	intimidate,
	drizzle,
	drought,
	sandStream,
	snowWarning,
	electricSurge,
	grassySurge,
	psychicSurge,
	mistySurge,
	download,
	unnerve,
	frisk,
	anticipation,
	forewarn,
	airLock,
	cloudNine,
	pressure,
	intrepidSword,
	dauntlessShield,
	tier2OnSwitchAbilities
} from '../../battle/abilities/tiers/tier2-on-switch';
import {
	trace,
	moldBreaker,
	teravolt,
	turboblaze
} from '../../battle/abilities/tiers/tier5-suppression';

function createMockContextWithSides(
	overrides: {
		pokemon?: Partial<PokemonInstance>;
		oppSide?: PokemonInstance[];
		playerSide?: PokemonInstance[];
		weather?: Weather;
		terrain?: Terrain;
	} = {}
): AbilityContext {
	const mockPokemon = {
		name: 'Test Pokemon',
		currentAbility: 'Intimidate',
		currentHp: 100,
		currentStats: {
			hp: 100,
			attack: 100,
			defense: 100,
			specialAttack: 100,
			specialDefense: 100,
			speed: 100
		},
		battleStats: {
			hp: 100,
			attack: 100,
			defense: 100,
			specialAttack: 100,
			specialDefense: 100,
			speed: 100
		},
		statsChanges: {
			hp: 0,
			attack: 0,
			defense: 0,
			specialAttack: 0,
			specialDefense: 0,
			speed: 0,
			accuracy: 0,
			evasion: 0
		},
		changeBattleStats: vi.fn(),
		...overrides.pokemon
	} as unknown as PokemonInstance;

	const battleField = new BattleField();
	if (overrides.weather) {
		battleField.weather = overrides.weather;
	}
	if (overrides.terrain) {
		battleField.terrain = overrides.terrain;
	}

	const mockBattleContext = {
		battleField,
		playerSide: overrides.playerSide || [mockPokemon],
		oppSide: overrides.oppSide || [],
		addToStack: vi.fn(),
		weatherVersion: {
			update: vi.fn((cb) => cb(0))
		}
	} as unknown as BattleContext;

	return {
		battleContext: mockBattleContext,
		pokemon: mockPokemon
	};
}

describe('Tier 2 On-Switch Abilities', () => {
	describe('Intimidate', () => {
		it('should lower all opponent Attack stats by 1 stage', () => {
			const opponent1 = createTestPokemon({ name: 'Opponent1' });
			const opponent2 = createTestPokemon({ name: 'Opponent2' });
			const ctx = createMockContextWithSides({
				oppSide: [opponent1, opponent2]
			});

			intimidate.onSwitchIn!(ctx);

			expect(opponent1.changeBattleStats).toHaveBeenCalledWith('attack', -1);
			expect(opponent2.changeBattleStats).toHaveBeenCalledWith('attack', -1);
		});

		it('should have correct metadata', () => {
			expect(intimidate.id).toBe(22);
			expect(intimidate.name).toBe('Intimidate');
		});
	});

	describe('Weather Setting Abilities', () => {
		it('Drizzle should set rain weather', () => {
			const ctx = createMockContextWithSides();
			drizzle.onSwitchIn!(ctx);
			expect(ctx.battleContext.battleField.weather).toBe(Weather.RAIN);
		});

		it('Drought should set sun weather', () => {
			const ctx = createMockContextWithSides();
			drought.onSwitchIn!(ctx);
			expect(ctx.battleContext.battleField.weather).toBe(Weather.SUN);
		});

		it('Sand Stream should set sandstorm weather', () => {
			const ctx = createMockContextWithSides();
			sandStream.onSwitchIn!(ctx);
			expect(ctx.battleContext.battleField.weather).toBe(Weather.SAND);
		});

		it('Snow Warning should set hail weather', () => {
			const ctx = createMockContextWithSides();
			snowWarning.onSwitchIn!(ctx);
			expect(ctx.battleContext.battleField.weather).toBe(Weather.HAIL);
		});
	});

	describe('Terrain Setting Abilities', () => {
		it('Electric Surge should set electric terrain', () => {
			const ctx = createMockContextWithSides();
			electricSurge.onSwitchIn!(ctx);
			expect(ctx.battleContext.battleField.terrain).toBe(Terrain.ELECTRIC);
		});

		it('Grassy Surge should set grassy terrain', () => {
			const ctx = createMockContextWithSides();
			grassySurge.onSwitchIn!(ctx);
			expect(ctx.battleContext.battleField.terrain).toBe(Terrain.GRASSY);
		});

		it('Psychic Surge should set psychic terrain', () => {
			const ctx = createMockContextWithSides();
			psychicSurge.onSwitchIn!(ctx);
			expect(ctx.battleContext.battleField.terrain).toBe(Terrain.PSYCHIC);
		});

		it('Misty Surge should set misty terrain', () => {
			const ctx = createMockContextWithSides();
			mistySurge.onSwitchIn!(ctx);
			expect(ctx.battleContext.battleField.terrain).toBe(Terrain.MISTY);
		});
	});

	describe('Trace', () => {
		it('should copy opponent ability', () => {
			const opponent = createTestPokemon({ ability: 'Levitate' });
			const pokemon = createTestPokemon({ ability: 'Trace' });
			const ctx = createMockContextWithSides({
				pokemon: pokemon as Partial<PokemonInstance>,
				oppSide: [opponent]
			});

			trace.onSwitchIn!(ctx);

			expect(ctx.pokemon.currentAbility).toBe('Levitate');
		});

		it('should have correct metadata', () => {
			expect(trace.id).toBe(36);
			expect(trace.name).toBe('Trace');
		});
	});

	describe('Download', () => {
		it('should boost Attack when opponent SpDef > Def', () => {
			const opponent = createTestPokemon({ defense: 80, spDefense: 100 });
			const pokemon = createTestPokemon({ ability: 'Download' });
			const ctx = createMockContextWithSides({
				pokemon: pokemon as Partial<PokemonInstance>,
				oppSide: [opponent]
			});

			download.onSwitchIn!(ctx);

			expect(pokemon.changeBattleStats).toHaveBeenCalledWith('attack', 1);
		});

		it('should boost SpAtk when opponent Def >= SpDef', () => {
			const opponent = createTestPokemon({ defense: 100, spDefense: 80 });
			const pokemon = createTestPokemon({ ability: 'Download' });
			const ctx = createMockContextWithSides({
				pokemon: pokemon as Partial<PokemonInstance>,
				oppSide: [opponent]
			});

			download.onSwitchIn!(ctx);

			expect(pokemon.changeBattleStats).toHaveBeenCalledWith('specialAttack', 1);
		});

		it('should have correct metadata', () => {
			expect(download.id).toBe(88);
			expect(download.name).toBe('Download');
		});
	});

	describe('Unnerve', () => {
		it('should set unnerved flag on opponents', () => {
			const opponent1 = createTestPokemon({ name: 'Opponent1' });
			const opponent2 = createTestPokemon({ name: 'Opponent2' });
			const ctx = createMockContextWithSides({
				oppSide: [opponent1, opponent2]
			});

			unnerve.onSwitchIn!(ctx);

			expect(opponent1.volatiles.add).toHaveBeenCalledWith(VolatileStatus.UNNERVED);
			expect(opponent2.volatiles.add).toHaveBeenCalledWith(VolatileStatus.UNNERVED);
		});

		it('should have correct metadata', () => {
			expect(unnerve.id).toBe(127);
			expect(unnerve.name).toBe('Unnerve');
		});
	});

	describe('Pressure', () => {
		it('should have correct metadata', () => {
			expect(pressure.id).toBe(46);
			expect(pressure.name).toBe('Pressure');
		});

		it('should have onSwitchIn hook defined', () => {
			expect(pressure.onSwitchIn).toBeDefined();
		});
	});

	describe('Weather Suppression Abilities', () => {
		it('Air Lock should suppress weather effects', () => {
			const ctx = createMockContextWithSides({ weather: Weather.RAIN });
			airLock.onSwitchIn!(ctx);
			expect(ctx.battleContext.battleField.weather).toBe(Weather.NONE);
		});

		it('Cloud Nine should suppress weather effects', () => {
			const ctx = createMockContextWithSides({ weather: Weather.SUN });
			cloudNine.onSwitchIn!(ctx);
			expect(ctx.battleContext.battleField.weather).toBe(Weather.NONE);
		});
	});

	describe('Stat Boosting On-Switch Abilities', () => {
		it('Intrepid Sword should boost Attack by 1 stage', () => {
			const pokemon = createTestPokemon({ ability: 'Intrepid Sword' });
			const ctx = createMockContextWithSides({
				pokemon: pokemon as Partial<PokemonInstance>
			});

			intrepidSword.onSwitchIn!(ctx);

			expect(pokemon.changeBattleStats).toHaveBeenCalledWith('attack', 1);
		});

		it('Dauntless Shield should boost Defense by 1 stage', () => {
			const pokemon = createTestPokemon({ ability: 'Dauntless Shield' });
			const ctx = createMockContextWithSides({
				pokemon: pokemon as Partial<PokemonInstance>
			});

			dauntlessShield.onSwitchIn!(ctx);

			expect(pokemon.changeBattleStats).toHaveBeenCalledWith('defense', 1);
		});
	});

	describe('Mold Breaker Family', () => {
		it('Mold Breaker should have correct metadata', () => {
			expect(moldBreaker.id).toBe(104);
			expect(moldBreaker.name).toBe('Mold Breaker');
		});

		it('Teravolt should have correct metadata', () => {
			expect(teravolt.id).toBe(164);
			expect(teravolt.name).toBe('Teravolt');
		});

		it('Turboblaze should have correct metadata', () => {
			expect(turboblaze.id).toBe(163);
			expect(turboblaze.name).toBe('Turboblaze');
		});
	});

	describe('Information Abilities', () => {
		it('Frisk should have onSwitchIn hook', () => {
			expect(frisk.onSwitchIn).toBeDefined();
			expect(frisk.id).toBe(119);
		});

		it('Anticipation should have onSwitchIn hook', () => {
			expect(anticipation.onSwitchIn).toBeDefined();
			expect(anticipation.id).toBe(107);
		});

		it('Forewarn should have onSwitchIn hook', () => {
			expect(forewarn.onSwitchIn).toBeDefined();
			expect(forewarn.id).toBe(108);
		});
	});

	describe('Ability Export', () => {
		it('should export all tier 2 abilities as an array', () => {
			expect(Array.isArray(tier2OnSwitchAbilities)).toBe(true);
			expect(tier2OnSwitchAbilities.length).toBeGreaterThanOrEqual(12);
		});

		it('all abilities should have required properties', () => {
			tier2OnSwitchAbilities.forEach((ability) => {
				expect(ability.id).toBeDefined();
				expect(typeof ability.id).toBe('number');
				expect(ability.name).toBeDefined();
				expect(typeof ability.name).toBe('string');
				expect(ability.description).toBeDefined();
				expect(ability.onSwitchIn).toBeDefined();
			});
		});
	});
});
