import { describe, it, expect, vi } from 'vitest';

vi.mock('../../sprites/pmd-sprite-data', () => ({
	getSpriteAnchor: vi.fn(),
	inferPMDSpriteInfo: vi.fn(),
	getPMDSpriteInfoFromAnimData: vi.fn(),
	getPMDSpritePath: vi.fn(),
	PMD_DIRECTION_MAP: {},
	PMD_DIRECTION_COUNT: 8
}));

import { createTestPokemon, createTestBattleContext } from './test-helpers';
import { AbilityTrigger } from '../../battle/abilities/ability-types';
import { AbilityEngine } from '../../battle/abilities/ability-engine';

describe('Ability System Regression Tests', () => {
	it('should not break battles without abilities', () => {
		const engine = new AbilityEngine();
		const pokemon1 = createTestPokemon({ ability: '' });
		const pokemon2 = createTestPokemon({ ability: '' });
		const ctx = createTestBattleContext({
			allySide: [pokemon1],
			oppSide: [pokemon2]
		});

		const result = engine.runEvent(AbilityTrigger.ON_SWITCH_IN, pokemon1, ctx);

		expect(result).toBeUndefined();
	});

	it('should handle unknown abilities gracefully', () => {
		const engine = new AbilityEngine();
		const pokemon = createTestPokemon({ ability: 'NonExistentAbility' });
		const ctx = createTestBattleContext({ allySide: [pokemon] });

		vi.spyOn(console, 'warn').mockImplementation(() => {});

		expect(() => {
			engine.runEvent(AbilityTrigger.ON_SWITCH_IN, pokemon, ctx);
		}).not.toThrow();
	});
});
