import { describe, it, expect } from 'vitest';
import { getCaptureRate, Pokeball, HealingItem, ReviveItem } from '../../items/items';
import { Stats } from '../../pokemons/pokedex';

function createTarget(overrides: any = {}) {
	return {
		currentHp: overrides.currentHp ?? 50,
		currentStats: overrides.currentStats ?? new Stats(100, 50, 50, 50, 50, 50),
		captureRate: overrides.captureRate ?? 45,
		status: overrides.status ?? undefined,
		fainted: overrides.fainted ?? false,
		heal: overrides.heal ?? (() => {}),
		revive: overrides.revive ?? (() => {})
	} as any;
}

describe('getCaptureRate', () => {
	it('returns a positive number for a valid target', () => {
		const target = createTarget();
		const rate = getCaptureRate(target, 1);
		expect(rate).toBeGreaterThan(0);
	});

	it('higher power ball increases capture rate', () => {
		const target = createTarget();
		const lowPower = getCaptureRate(target, 1);
		const highPower = getCaptureRate(target, 2);
		expect(highPower).toBeGreaterThan(lowPower);
	});

	it('lower HP increases capture rate', () => {
		const fullHp = createTarget({ currentHp: 100 });
		const lowHp = createTarget({ currentHp: 10 });
		const fullRate = getCaptureRate(fullHp, 1);
		const lowRate = getCaptureRate(lowHp, 1);
		expect(lowRate).toBeGreaterThan(fullRate);
	});

	it('status condition increases capture rate', () => {
		const noStatus = createTarget();
		const withStatus = createTarget({ status: { move_effect_id: 3 } });
		const noStatusRate = getCaptureRate(noStatus, 1);
		const statusRate = getCaptureRate(withStatus, 1);
		expect(statusRate).toBeGreaterThan(noStatusRate);
	});

	it('sleep gives higher bonus than other statuses', () => {
		const paralyze = createTarget({ status: { move_effect_id: 3 } });
		const sleep = createTarget({ status: { move_effect_id: 2 } });
		const paralyzeRate = getCaptureRate(paralyze, 1);
		const sleepRate = getCaptureRate(sleep, 1);
		expect(sleepRate).toBeGreaterThan(paralyzeRate);
	});

	it('freeze gives same bonus as sleep', () => {
		const sleep = createTarget({ status: { move_effect_id: 2 } });
		const freeze = createTarget({ status: { move_effect_id: 6 } });
		const sleepRate = getCaptureRate(sleep, 1);
		const freezeRate = getCaptureRate(freeze, 1);
		expect(freezeRate).toBe(sleepRate);
	});

	it('higher capture rate species is easier to catch', () => {
		const hard = createTarget({ captureRate: 3 });
		const easy = createTarget({ captureRate: 255 });
		expect(getCaptureRate(easy, 1)).toBeGreaterThan(getCaptureRate(hard, 1));
	});
});

describe('Pokeball', () => {
	it('creates a pokeball instance', () => {
		const ball = new Pokeball(1, 1, 'Poke Ball', 'A basic ball', 1);
		expect(ball.name).toBe('Poke Ball');
		expect(ball.power).toBe(1);
	});

	it('instanciates a copy', () => {
		const ball = new Pokeball(1, 1, 'Poke Ball', 'A basic ball', 1);
		const copy = ball.instanciate();
		expect(copy).toBeInstanceOf(Pokeball);
		expect(copy.name).toBe('Poke Ball');
	});
});

describe('HealingItem', () => {
	it('doesApply returns true when pokemon is damaged', () => {
		const item = new HealingItem(1, 27, 'Potion', 'Heals HP', 20);
		const target = createTarget({ currentHp: 50, currentStats: new Stats(100) });
		expect(item.doesApply(target)).toBe(true);
	});

	it('doesApply returns false when pokemon is at full HP', () => {
		const item = new HealingItem(1, 27, 'Potion', 'Heals HP', 20);
		const target = createTarget({ currentHp: 100, currentStats: new Stats(100) });
		expect(item.doesApply(target)).toBe(false);
	});
});

describe('ReviveItem', () => {
	it('doesApply returns true when pokemon is fainted', () => {
		const item = new ReviveItem(1, 28, 'Revive', 'Revives pokemon', 50);
		const target = createTarget({ fainted: true });
		expect(item.doesApply(target)).toBe(true);
	});

	it('doesApply returns false when pokemon is alive', () => {
		const item = new ReviveItem(1, 28, 'Revive', 'Revives pokemon', 50);
		const target = createTarget({ fainted: false });
		expect(item.doesApply(target)).toBe(false);
	});
});
