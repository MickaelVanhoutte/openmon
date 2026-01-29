import { describe, it, expect } from 'vitest';
import {
	getMoveCount,
	getAllMoveNames,
	physicalMoves,
	specialMoves,
	statusMoves,
	otherMoves
} from '$js/battle/animations/moves';

describe('Move Animation Registry', () => {
	describe('getMoveCount', () => {
		it('should return total number of registered moves', () => {
			const count = getMoveCount();
			expect(count).toBeGreaterThan(100);
		});
	});

	describe('getAllMoveNames', () => {
		it('should return array of all move names', () => {
			const names = getAllMoveNames();
			expect(Array.isArray(names)).toBe(true);
			expect(names.length).toBeGreaterThan(100);
		});

		it('should include common moves', () => {
			const names = getAllMoveNames();
			expect(names).toContain('tackle');
			expect(names).toContain('thunderbolt');
			expect(names).toContain('swords-dance');
		});
	});

	describe('physicalMoves', () => {
		it('should have punch moves', () => {
			expect(physicalMoves['mega-punch']).toBeDefined();
			expect(physicalMoves['thunder-punch']).toBeDefined();
		});

		it('should have kick moves', () => {
			expect(physicalMoves['mega-kick']).toBeDefined();
			expect(physicalMoves['hi-jump-kick']).toBeDefined();
		});

		it('should have slash moves', () => {
			expect(physicalMoves['slash']).toBeDefined();
			expect(physicalMoves['night-slash']).toBeDefined();
		});

		it('should have bite moves', () => {
			expect(physicalMoves['bite']).toBeDefined();
			expect(physicalMoves['crunch']).toBeDefined();
		});

		it('should have tackle moves', () => {
			expect(physicalMoves['tackle']).toBeDefined();
			expect(physicalMoves['body-slam']).toBeDefined();
		});
	});

	describe('specialMoves', () => {
		it('should have beam moves', () => {
			expect(specialMoves['hyper-beam']).toBeDefined();
			expect(specialMoves['ice-beam']).toBeDefined();
		});

		it('should have projectile moves', () => {
			expect(specialMoves['ember']).toBeDefined();
			expect(specialMoves['flamethrower']).toBeDefined();
		});

		it('should have burst moves', () => {
			expect(specialMoves['explosion']).toBeDefined();
			expect(specialMoves['earthquake']).toBeDefined();
		});
	});

	describe('statusMoves', () => {
		it('should have buff moves', () => {
			expect(statusMoves['swords-dance']).toBeDefined();
			expect(statusMoves['dragon-dance']).toBeDefined();
		});

		it('should have debuff moves', () => {
			expect(statusMoves['growl']).toBeDefined();
			expect(statusMoves['leer']).toBeDefined();
		});

		it('should have heal moves', () => {
			expect(statusMoves['recover']).toBeDefined();
			expect(statusMoves['rest']).toBeDefined();
		});

		it('should have status condition moves', () => {
			expect(statusMoves['thunder-wave']).toBeDefined();
			expect(statusMoves['toxic']).toBeDefined();
		});

		it('should have protect moves', () => {
			expect(statusMoves['protect']).toBeDefined();
			expect(statusMoves['detect']).toBeDefined();
		});
	});

	describe('otherMoves', () => {
		it('should have multi-hit moves', () => {
			expect(otherMoves['bullet-seed']).toBeDefined();
			expect(otherMoves['icicle-spear']).toBeDefined();
		});

		it('should have OHKO moves', () => {
			expect(otherMoves['guillotine']).toBeDefined();
			expect(otherMoves['fissure']).toBeDefined();
		});

		it('should have field moves', () => {
			expect(otherMoves['stealth-rock']).toBeDefined();
			expect(otherMoves['spikes']).toBeDefined();
		});

		it('should have weather moves', () => {
			expect(otherMoves['rain-dance']).toBeDefined();
			expect(otherMoves['sunny-day']).toBeDefined();
		});

		it('should have terrain moves', () => {
			expect(otherMoves['electric-terrain']).toBeDefined();
			expect(otherMoves['grassy-terrain']).toBeDefined();
		});
	});
});
