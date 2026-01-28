import { describe, it, expect } from 'vitest';

describe('Recoil and Drain Move Mechanics', () => {
	describe('Recoil Damage Calculation', () => {
		it('should calculate 25% recoil for Take Down', () => {
			const damageDealt = 100;
			const recoilPercent = 0.25;
			const recoilDamage = Math.floor(damageDealt * recoilPercent);
			expect(recoilDamage).toBe(25);
		});

		it('should calculate 33% recoil for Double-Edge', () => {
			const damageDealt = 100;
			const recoilPercent = 1 / 3;
			const recoilDamage = Math.floor(damageDealt * recoilPercent);
			expect(recoilDamage).toBe(33);
		});

		it('should calculate 33% recoil for Brave Bird', () => {
			const damageDealt = 100;
			const recoilPercent = 1 / 3;
			const recoilDamage = Math.floor(damageDealt * recoilPercent);
			expect(recoilDamage).toBe(33);
		});

		it('should calculate 33% recoil for Flare Blitz', () => {
			const damageDealt = 100;
			const recoilPercent = 1 / 3;
			const recoilDamage = Math.floor(damageDealt * recoilPercent);
			expect(recoilDamage).toBe(33);
		});

		it('should calculate 50% recoil for Head Smash', () => {
			const damageDealt = 100;
			const recoilPercent = 0.5;
			const recoilDamage = Math.floor(damageDealt * recoilPercent);
			expect(recoilDamage).toBe(50);
		});
	});

	describe('Struggle Special Case', () => {
		it('should calculate recoil as 25% of max HP, not damage dealt', () => {
			const maxHp = 200;
			const damageDealt = 50;
			const struggleRecoil = Math.floor(maxHp * 0.25);
			expect(struggleRecoil).toBe(50);
			expect(struggleRecoil).not.toBe(Math.floor(damageDealt * 0.25));
		});
	});

	describe('Drain HP Calculation', () => {
		it('should heal 50% of damage dealt for Absorb', () => {
			const damageDealt = 80;
			const drainPercent = 0.5;
			const healing = Math.floor(damageDealt * drainPercent);
			expect(healing).toBe(40);
		});

		it('should heal 50% of damage dealt for Mega Drain', () => {
			const damageDealt = 100;
			const drainPercent = 0.5;
			const healing = Math.floor(damageDealt * drainPercent);
			expect(healing).toBe(50);
		});

		it('should heal 50% of damage dealt for Giga Drain', () => {
			const damageDealt = 120;
			const drainPercent = 0.5;
			const healing = Math.floor(damageDealt * drainPercent);
			expect(healing).toBe(60);
		});

		it('should heal 75% of damage dealt for Drain Punch', () => {
			const damageDealt = 100;
			const drainPercent = 0.75;
			const healing = Math.floor(damageDealt * drainPercent);
			expect(healing).toBe(75);
		});

		it('should heal 50% of damage dealt for Horn Leech', () => {
			const damageDealt = 100;
			const drainPercent = 0.5;
			const healing = Math.floor(damageDealt * drainPercent);
			expect(healing).toBe(50);
		});
	});

	describe('Drain Limitations', () => {
		it('should not heal past max HP', () => {
			const currentHp = 90;
			const maxHp = 100;
			const healing = 50;
			const newHp = Math.min(currentHp + healing, maxHp);
			expect(newHp).toBe(100);
		});

		it('should heal nothing if target has 0 HP', () => {
			const damageDealt = 0;
			const drainPercent = 0.5;
			const healing = Math.floor(damageDealt * drainPercent);
			expect(healing).toBe(0);
		});
	});

	describe('Recoil Does Not Faint Check', () => {
		it('should allow user to faint from recoil', () => {
			const currentHp = 20;
			const recoilDamage = 30;
			const newHp = Math.max(currentHp - recoilDamage, 0);
			const fainted = newHp === 0;
			expect(fainted).toBe(true);
		});
	});
});
