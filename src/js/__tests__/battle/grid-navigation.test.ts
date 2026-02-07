import { describe, it, expect } from 'vitest';
import { navigateActionGrid } from '../../battle/grid-navigation';

describe('navigateActionGrid', () => {
	// 2x2 grid: [0,1] / [2,3], cols=2, total=4

	// Right navigation
	it('FIGHT(0) + right → BAG(1)', () => {
		expect(navigateActionGrid(0, 'right', 2, 4)).toBe(1);
	});
	it('POKEMON(2) + right → RUN(3)', () => {
		expect(navigateActionGrid(2, 'right', 2, 4)).toBe(3);
	});
	it('BAG(1) + right → BAG(1) (clamped)', () => {
		expect(navigateActionGrid(1, 'right', 2, 4)).toBe(1);
	});
	it('RUN(3) + right → RUN(3) (clamped)', () => {
		expect(navigateActionGrid(3, 'right', 2, 4)).toBe(3);
	});

	// Left navigation
	it('BAG(1) + left → FIGHT(0)', () => {
		expect(navigateActionGrid(1, 'left', 2, 4)).toBe(0);
	});
	it('RUN(3) + left → POKEMON(2)', () => {
		expect(navigateActionGrid(3, 'left', 2, 4)).toBe(2);
	});
	it('FIGHT(0) + left → FIGHT(0) (clamped)', () => {
		expect(navigateActionGrid(0, 'left', 2, 4)).toBe(0);
	});
	it('POKEMON(2) + left → POKEMON(2) (clamped)', () => {
		expect(navigateActionGrid(2, 'left', 2, 4)).toBe(2);
	});

	// Down navigation
	it('FIGHT(0) + down → POKEMON(2)', () => {
		expect(navigateActionGrid(0, 'down', 2, 4)).toBe(2);
	});
	it('BAG(1) + down → RUN(3)', () => {
		expect(navigateActionGrid(1, 'down', 2, 4)).toBe(3);
	});
	it('POKEMON(2) + down → POKEMON(2) (clamped)', () => {
		expect(navigateActionGrid(2, 'down', 2, 4)).toBe(2);
	});
	it('RUN(3) + down → RUN(3) (clamped)', () => {
		expect(navigateActionGrid(3, 'down', 2, 4)).toBe(3);
	});

	// Up navigation
	it('POKEMON(2) + up → FIGHT(0)', () => {
		expect(navigateActionGrid(2, 'up', 2, 4)).toBe(0);
	});
	it('RUN(3) + up → BAG(1)', () => {
		expect(navigateActionGrid(3, 'up', 2, 4)).toBe(1);
	});
	it('FIGHT(0) + up → FIGHT(0) (clamped)', () => {
		expect(navigateActionGrid(0, 'up', 2, 4)).toBe(0);
	});
	it('BAG(1) + up → BAG(1) (clamped)', () => {
		expect(navigateActionGrid(1, 'up', 2, 4)).toBe(1);
	});
});
