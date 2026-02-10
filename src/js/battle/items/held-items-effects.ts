import { registerItem } from './item-registry';
import type { HeldItemEffect } from '../../items/held-items-model';
import type { ItemContext } from './item-engine';

// Choice Band (4001) — 1.5x ATK + move lock
const choiceBand: HeldItemEffect = {
	name: 'Choice Band',
	onModifyAtk(ctx: ItemContext): number {
		return Math.floor((ctx.statValue ?? 0) * 1.5);
	},
	onMoveSelected(ctx: ItemContext): void {
		if (!ctx.pokemon.choiceLockedMove && ctx.move) {
			ctx.pokemon.choiceLockedMove = ctx.move.name;
		}
	}
};

// Choice Specs (4002) — 1.5x SPA + move lock
const choiceSpecs: HeldItemEffect = {
	name: 'Choice Specs',
	onModifySpa(ctx: ItemContext): number {
		return Math.floor((ctx.statValue ?? 0) * 1.5);
	},
	onMoveSelected(ctx: ItemContext): void {
		if (!ctx.pokemon.choiceLockedMove && ctx.move) {
			ctx.pokemon.choiceLockedMove = ctx.move.name;
		}
	}
};

// Choice Scarf (4003) — 1.5x Speed + move lock
const choiceScarf: HeldItemEffect = {
	name: 'Choice Scarf',
	onModifySpeed(ctx: ItemContext): number {
		return Math.floor((ctx.statValue ?? 0) * 1.5);
	},
	onMoveSelected(ctx: ItemContext): void {
		if (!ctx.pokemon.choiceLockedMove && ctx.move) {
			ctx.pokemon.choiceLockedMove = ctx.move.name;
		}
	}
};

// Life Orb (4004) — 1.3x damage + 10% HP recoil
const lifeOrb: HeldItemEffect = {
	name: 'Life Orb',
	onModifyDamage(ctx: ItemContext): number {
		return Math.floor((ctx.damage ?? 0) * 1.3);
	},
	onAfterHit(ctx: ItemContext): void {
		const recoil = Math.max(1, Math.floor(ctx.pokemon.currentStats.hp / 10));
		ctx.pokemon.currentHp -= recoil;
		if (ctx.pokemon.currentHp < 0) {
			ctx.pokemon.currentHp = 0;
		}
	}
};

// Expert Belt (4005) — 1.2x damage on super-effective only
const expertBelt: HeldItemEffect = {
	name: 'Expert Belt',
	onModifyDamage(ctx: ItemContext): number {
		if (ctx.effectiveness !== undefined && ctx.effectiveness > 1) {
			return Math.floor((ctx.damage ?? 0) * 1.2);
		}
		return ctx.damage ?? 0;
	}
};

// Leftovers (4006) — heal 1/16 HP per turn
const leftovers: HeldItemEffect = {
	name: 'Leftovers',
	onTurnEnd(ctx: ItemContext): void {
		const heal = Math.max(1, Math.floor(ctx.pokemon.currentStats.hp / 16));
		ctx.pokemon.currentHp = Math.min(ctx.pokemon.currentStats.hp, ctx.pokemon.currentHp + heal);
	}
};

// Focus Sash (4007) — survive lethal hit from full HP at 1 HP (consumable)
const focusSash: HeldItemEffect = {
	name: 'Focus Sash',
	onModifyDamage(ctx: ItemContext): number {
		if (
			ctx.pokemon.currentHp === ctx.pokemon.currentStats.hp &&
			(ctx.damage ?? 0) >= ctx.pokemon.currentHp
		) {
			return ctx.pokemon.currentHp - 1;
		}
		return ctx.damage ?? 0;
	}
};

// Assault Vest (4008) — 1.5x SpDef
const assaultVest: HeldItemEffect = {
	name: 'Assault Vest',
	onModifySpd(ctx: ItemContext): number {
		return Math.floor((ctx.statValue ?? 0) * 1.5);
	}
};

// Eviolite (4009) — 1.5x Def + 1.5x SpDef for pokemon that can evolve
const eviolite: HeldItemEffect = {
	name: 'Eviolite',
	onModifyDef(ctx: ItemContext): number {
		// TODO: Add evolution check when evolution data is available in ItemContext
		if (ctx.pokemon.evolution && ctx.pokemon.evolution.length > 0) {
			return Math.floor((ctx.statValue ?? 0) * 1.5);
		}
		return ctx.statValue ?? 0;
	},
	onModifySpd(ctx: ItemContext): number {
		if (ctx.pokemon.evolution && ctx.pokemon.evolution.length > 0) {
			return Math.floor((ctx.statValue ?? 0) * 1.5);
		}
		return ctx.statValue ?? 0;
	}
};

// Mystic Water (4010) — 1.2x Water move power
const mysticWater: HeldItemEffect = {
	name: 'Mystic Water',
	onModifyMovePower(ctx: ItemContext): number {
		if (ctx.move?.type === 'water') {
			return Math.floor((ctx.statValue ?? 0) * 1.2);
		}
		return ctx.statValue ?? 0;
	}
};

// Charcoal (4011) — 1.2x Fire move power
const charcoal: HeldItemEffect = {
	name: 'Charcoal',
	onModifyMovePower(ctx: ItemContext): number {
		if (ctx.move?.type === 'fire') {
			return Math.floor((ctx.statValue ?? 0) * 1.2);
		}
		return ctx.statValue ?? 0;
	}
};

// Magnet (4012) — 1.2x Electric move power
const magnet: HeldItemEffect = {
	name: 'Magnet',
	onModifyMovePower(ctx: ItemContext): number {
		if (ctx.move?.type === 'electric') {
			return Math.floor((ctx.statValue ?? 0) * 1.2);
		}
		return ctx.statValue ?? 0;
	}
};

// Sitrus Berry (4013) — heal 25% when below 50% HP (consumable)
const sitrusBerry: HeldItemEffect = {
	name: 'Sitrus Berry',
	onHpChanged(ctx: ItemContext): void {
		const maxHp = ctx.pokemon.currentStats.hp;
		if (ctx.pokemon.currentHp > 0 && ctx.pokemon.currentHp <= Math.floor(maxHp / 2)) {
			ctx.pokemon.currentHp = Math.min(maxHp, ctx.pokemon.currentHp + Math.floor(maxHp / 4));
		}
	}
};

// Lum Berry (4014) — cure any status (consumable)
const lumBerry: HeldItemEffect = {
	name: 'Lum Berry',
	onStatusInflicted(ctx: ItemContext): boolean {
		ctx.pokemon.status = undefined;
		return true;
	}
};

// Rawst Berry (4015) — cure burn only (consumable, returns false for non-burn)
const rawstBerry: HeldItemEffect = {
	name: 'Rawst Berry',
	onStatusInflicted(ctx: ItemContext): boolean {
		if (ctx.pokemon.status?.abr === 'BRN') {
			ctx.pokemon.status = undefined;
			return true;
		}
		return false;
	}
};

// Chesto Berry (4016) — cure sleep only (consumable, returns false for non-sleep)
const chestoBerry: HeldItemEffect = {
	name: 'Chesto Berry',
	onStatusInflicted(ctx: ItemContext): boolean {
		if (ctx.pokemon.status?.abr === 'SLP') {
			ctx.pokemon.status = undefined;
			return true;
		}
		return false;
	}
};

registerItem('Choice Band', choiceBand);
registerItem('Choice Specs', choiceSpecs);
registerItem('Choice Scarf', choiceScarf);
registerItem('Life Orb', lifeOrb);
registerItem('Expert Belt', expertBelt);
registerItem('Leftovers', leftovers);
registerItem('Focus Sash', focusSash);
registerItem('Assault Vest', assaultVest);
registerItem('Eviolite', eviolite);
registerItem('Mystic Water', mysticWater);
registerItem('Charcoal', charcoal);
registerItem('Magnet', magnet);
registerItem('Sitrus Berry', sitrusBerry);
registerItem('Lum Berry', lumBerry);
registerItem('Rawst Berry', rawstBerry);
registerItem('Chesto Berry', chestoBerry);
