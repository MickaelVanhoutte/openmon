import { describe, it, expect } from 'vitest';
import { AbilityTrigger } from '../../battle/abilities/ability-types';
import type { Ability, AbilityContext } from '../../battle/abilities/ability-types';

describe('Ability Types', () => {
	it('should have AbilityTrigger enum defined with correct values', () => {
		expect(AbilityTrigger).toBeDefined();
		expect(AbilityTrigger.ON_SWITCH_IN).toBe('ON_SWITCH_IN');
		expect(AbilityTrigger.ON_BEFORE_MOVE).toBe('ON_BEFORE_MOVE');
		expect(AbilityTrigger.ON_AFTER_MOVE).toBe('ON_AFTER_MOVE');
		expect(AbilityTrigger.ON_DAMAGE_CALC).toBe('ON_DAMAGE_CALC');
		expect(AbilityTrigger.ON_CONTACT).toBe('ON_CONTACT');
		expect(AbilityTrigger.ON_TURN_END).toBe('ON_TURN_END');
		expect(AbilityTrigger.ON_TURN_START).toBe('ON_TURN_START');
		expect(AbilityTrigger.ON_FAINT).toBe('ON_FAINT');
		expect(AbilityTrigger.ON_STATUS).toBe('ON_STATUS');
		expect(AbilityTrigger.ON_STAT_CHANGE).toBe('ON_STAT_CHANGE');
	});

	it('should allow creating an object that implements Ability interface', () => {
		const testAbility: Ability = {
			id: 1,
			name: 'Test Ability',
			description: 'A test ability',
			onSwitchIn: (ctx: AbilityContext) => {
				console.log(`${ctx.pokemon.name} switched in!`);
			},
			onModifyAtk: (_ctx: AbilityContext, atk: number) => atk * 1.5,
			priority: 0
		};

		expect(testAbility.id).toBe(1);
		expect(testAbility.name).toBe('Test Ability');
		expect(testAbility.onSwitchIn).toBeDefined();
		expect(testAbility.onModifyAtk).toBeDefined();
	});
});
