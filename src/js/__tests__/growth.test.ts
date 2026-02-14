import '@abraham/reflection';
import { describe, it, expect, beforeEach } from 'vitest';
import { Weather, BattleField } from '../battle/battle-field';
import { container } from 'tsyringe';

// Mocking the interfaces and classes needed for the test
interface EffectResult {
	message?: string;
	effect?: any;
}

enum EffectTiming {
	AFTER_MOVE = 'after-move'
}

class Growth {
	move_effect_id: number = 317;
	abr: string = 'GRW';
	duration: number = 0;
	when: EffectTiming = EffectTiming.AFTER_MOVE;
	damages: number = 0;
	turnsPassed: number = 0;
	healed = false;

	apply(target: any[], user?: any): EffectResult {
		if (!user) {
			return {};
		}

		let battleField: BattleField | undefined;
		try {
			battleField = container.resolve<BattleField>('BattleField');
		} catch (e) {}

		const isSun = battleField?.weather === Weather.SUN;
		const boost = isSun ? 2 : 1;

		user.changeBattleStats('attack', boost);
		user.changeBattleStats('specialAttack', boost);
		return {
			message: isSun
				? `${user.name}'s Attack and Sp. Attack rose sharply!`
				: `${user.name}'s Attack and Sp. Attack rose!`
		};
	}
}

describe('Growth Move Effect Logic Verification', () => {
	let battleField: BattleField;
	let user: any;
	let target: any;

	beforeEach(() => {
		battleField = new BattleField();
		container.registerInstance('BattleField', battleField);

		user = {
			name: 'Bulbasaur',
			statsChanges: {
				attack: 0,
				specialAttack: 0
			},
			changeBattleStats(stat: string, amount: number) {
				(this.statsChanges as any)[stat] = Math.max(
					-6,
					Math.min(6, (this.statsChanges as any)[stat] + amount)
				);
			}
		};

		target = {
			name: 'Charmander'
		};
	});

	it('should raise Attack and Sp. Attack by 1 stage in neutral weather', () => {
		battleField.setWeather(Weather.NONE);
		const effect = new Growth();

		effect.apply([target], user);

		expect(user.statsChanges.attack).toBe(1);
		expect(user.statsChanges.specialAttack).toBe(1);
	});

	it('should raise Attack and Sp. Attack by 2 stages in Sun', () => {
		battleField.setWeather(Weather.SUN);
		const effect = new Growth();

		effect.apply([target], user);

		expect(user.statsChanges.attack).toBe(2);
		expect(user.statsChanges.specialAttack).toBe(2);
	});
});
