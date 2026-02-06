import type { Ability, AbilityContext } from '../ability-types';
import { VolatileStatus } from '../../../pokemons/volatile-status';

interface StatusEffect {
	abr: string;
	move_effect_id?: number;
	duration?: number;
}

function createParalyze(): StatusEffect {
	return { abr: 'PAR', move_effect_id: 7, duration: -1 };
}

function createBurn(): StatusEffect {
	return { abr: 'BRN', move_effect_id: 5, duration: -1 };
}

function createPoison(): StatusEffect {
	return { abr: 'PSN', move_effect_id: 3, duration: -1 };
}

export const roughSkin: Ability = {
	id: 24,
	name: 'Rough Skin',
	description: 'Inflicts damage to the attacker on contact.',
	onDamagingHit: (ctx: AbilityContext, _damage: number): void => {
		if (ctx.move?.category === 'physical' && ctx.target) {
			const recoil = Math.max(1, Math.floor(ctx.target.currentStats.hp / 8));
			ctx.target.currentHp = Math.max(0, ctx.target.currentHp - recoil);
		}
	}
};

export const ironBarbs: Ability = {
	id: 160,
	name: 'Iron Barbs',
	description: 'Inflicts damage to the attacker on contact.',
	onDamagingHit: (ctx: AbilityContext, _damage: number): void => {
		if (ctx.move?.category === 'physical' && ctx.target) {
			const recoil = Math.max(1, Math.floor(ctx.target.currentStats.hp / 8));
			ctx.target.currentHp = Math.max(0, ctx.target.currentHp - recoil);
		}
	}
};

export const staticAbility: Ability = {
	id: 9,
	name: 'Static',
	description: 'May paralyze the attacker on contact (30% chance).',
	onDamagingHit: (ctx: AbilityContext, _damage: number): void => {
		if (ctx.move?.category === 'physical' && ctx.target && !ctx.target.status) {
			if (Math.random() < 0.3) {
				ctx.target.status = createParalyze() as any;
			}
		}
	}
};

export const flameBody: Ability = {
	id: 49,
	name: 'Flame Body',
	description: 'May burn the attacker on contact (30% chance).',
	onDamagingHit: (ctx: AbilityContext, _damage: number): void => {
		if (ctx.move?.category === 'physical' && ctx.target && !ctx.target.status) {
			if (Math.random() < 0.3) {
				ctx.target.status = createBurn() as any;
			}
		}
	}
};

export const poisonPoint: Ability = {
	id: 38,
	name: 'Poison Point',
	description: 'May poison the attacker on contact (30% chance).',
	onDamagingHit: (ctx: AbilityContext, _damage: number): void => {
		if (ctx.move?.category === 'physical' && ctx.target && !ctx.target.status) {
			if (Math.random() < 0.3) {
				ctx.target.status = createPoison() as any;
			}
		}
	}
};

export const cuteCharm: Ability = {
	id: 56,
	name: 'Cute Charm',
	description: 'May cause infatuation on contact (30% chance).',
	onDamagingHit: (ctx: AbilityContext, _damage: number): void => {
		if (ctx.move?.category === 'physical' && ctx.target) {
			if (Math.random() < 0.3) {
				ctx.target.volatiles.add(VolatileStatus.INFATUATION, 0);
			}
		}
	}
};

export const effectSpore: Ability = {
	id: 27,
	name: 'Effect Spore',
	description: 'May inflict poison, paralysis, or sleep on contact (10% each).',
	onDamagingHit: (ctx: AbilityContext, _damage: number): void => {
		if (ctx.move?.category === 'physical' && ctx.target && !ctx.target.status) {
			const roll = Math.random();
			if (roll < 0.1) {
				ctx.target.status = createPoison() as any;
			} else if (roll < 0.2) {
				ctx.target.status = createParalyze() as any;
			} else if (roll < 0.3) {
				ctx.target.status = { abr: 'SLP', move_effect_id: 2, duration: -1 } as any;
			}
		}
	}
};

export const levitate: Ability = {
	id: 26,
	name: 'Levitate',
	description: 'Gives immunity to Ground-type moves.',
	onTryHit: (ctx: AbilityContext): boolean => {
		if (ctx.move?.type?.toLowerCase() === 'ground') {
			return false;
		}
		return true;
	}
};

export const waterAbsorb: Ability = {
	id: 11,
	name: 'Water Absorb',
	description: 'Restores HP if hit by a Water-type move.',
	onTryHit: (ctx: AbilityContext): boolean => {
		if (ctx.move?.type?.toLowerCase() === 'water') {
			const healAmount = Math.floor(ctx.pokemon.currentStats.hp / 4);
			ctx.pokemon.currentHp = Math.min(
				ctx.pokemon.currentHp + healAmount,
				ctx.pokemon.currentStats.hp
			);
			return false;
		}
		return true;
	}
};

export const voltAbsorb: Ability = {
	id: 10,
	name: 'Volt Absorb',
	description: 'Restores HP if hit by an Electric-type move.',
	onTryHit: (ctx: AbilityContext): boolean => {
		if (ctx.move?.type?.toLowerCase() === 'electric') {
			const healAmount = Math.floor(ctx.pokemon.currentStats.hp / 4);
			ctx.pokemon.currentHp = Math.min(
				ctx.pokemon.currentHp + healAmount,
				ctx.pokemon.currentStats.hp
			);
			return false;
		}
		return true;
	}
};

let flashFireActivated = false;

export const flashFire: Ability = {
	id: 18,
	name: 'Flash Fire',
	description: 'Powers up Fire-type moves if hit by one. Grants immunity to Fire.',
	onTryHit: (ctx: AbilityContext): boolean => {
		if (ctx.move?.type?.toLowerCase() === 'fire') {
			flashFireActivated = true;
			return false;
		}
		return true;
	},
	onModifyDamage: (ctx: AbilityContext, damage: number): number => {
		if (flashFireActivated && ctx.move?.type?.toLowerCase() === 'fire') {
			return Math.floor(damage * 1.5);
		}
		return damage;
	}
};

export const sapSipper: Ability = {
	id: 157,
	name: 'Sap Sipper',
	description: 'Boosts Attack when hit by Grass-type moves. Grants immunity.',
	onTryHit: (ctx: AbilityContext): boolean => {
		if (ctx.move?.type?.toLowerCase() === 'grass') {
			ctx.pokemon.changeBattleStats('attack', 1);
			return false;
		}
		return true;
	}
};

export const motorDrive: Ability = {
	id: 78,
	name: 'Motor Drive',
	description: 'Boosts Speed when hit by Electric-type moves. Grants immunity.',
	onTryHit: (ctx: AbilityContext): boolean => {
		if (ctx.move?.type?.toLowerCase() === 'electric') {
			ctx.pokemon.changeBattleStats('speed', 1);
			return false;
		}
		return true;
	}
};

export const lightningRod: Ability = {
	id: 31,
	name: 'Lightning Rod',
	description: 'Draws Electric moves. Boosts Special Attack when hit.',
	onTryHit: (ctx: AbilityContext): boolean => {
		if (ctx.move?.type?.toLowerCase() === 'electric') {
			ctx.pokemon.changeBattleStats('specialAttack', 1);
			return false;
		}
		return true;
	}
};

export const stormDrain: Ability = {
	id: 114,
	name: 'Storm Drain',
	description: 'Draws Water moves. Boosts Special Attack when hit.',
	onTryHit: (ctx: AbilityContext): boolean => {
		if (ctx.move?.type?.toLowerCase() === 'water') {
			ctx.pokemon.changeBattleStats('specialAttack', 1);
			return false;
		}
		return true;
	}
};

export const wonderGuard: Ability = {
	id: 25,
	name: 'Wonder Guard',
	description: 'Only super-effective moves can hit.',
	onTryHit: (_ctx: AbilityContext): boolean => {
		return true;
	}
};

export const soundproof: Ability = {
	id: 43,
	name: 'Soundproof',
	description: 'Gives immunity to sound-based moves.',
	onTryHit: (_ctx: AbilityContext): boolean => {
		return true;
	}
};

export const bulletproof: Ability = {
	id: 171,
	name: 'Bulletproof',
	description: 'Gives immunity to ball and bomb moves.',
	onTryHit: (_ctx: AbilityContext): boolean => {
		return true;
	}
};

export const overcoat: Ability = {
	id: 142,
	name: 'Overcoat',
	description: 'Protects from weather damage and powder moves.',
	onTryHit: (_ctx: AbilityContext): boolean => {
		return true;
	}
};

export const tier3DamageContactAbilities: Ability[] = [
	roughSkin,
	ironBarbs,
	staticAbility,
	flameBody,
	poisonPoint,
	cuteCharm,
	effectSpore,
	levitate,
	waterAbsorb,
	voltAbsorb,
	flashFire,
	sapSipper,
	motorDrive,
	lightningRod,
	stormDrain,
	wonderGuard,
	soundproof,
	bulletproof,
	overcoat
];
