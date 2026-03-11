/**
 * Perk Handlers — Implementations for all 48 class perks.
 * Each handler is registered via registerPerkHandler() and is called
 * by the PerkEngine when the matching trigger fires.
 */

import { registerPerkHandler, type PerkContext, type PerkResult } from './perk-engine';
import type { ActivePerk } from '../../characters/perks';
import { Player } from '../../characters/player';

// ─── Berserker Perks ────────────────────────────────────────────────────────

// Fury: After crit, next attack +15% damage
registerPerkHandler('brs-fury', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	// ON_CRIT trigger: set fury buff state
	perk.state.furyActive = true;
	return { message: 'Fury activates!' };
});

// Reckless: +20% damage dealt, +10% taken (PASSIVE — checked inline in damage calc)
// No handler needed; checked via hasPassivePerk in damage calculation

// Overkill: Excess KO damage → combo gauge
registerPerkHandler('brs-overkill', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.excessDamage && ctx.excessDamage > 0 && ctx.target) {
		const maxHp = ctx.target.currentStats?.hp || 100;
		const comboFill = Math.floor((ctx.excessDamage / maxHp) * 20);
		if (comboFill > 0) {
			return { comboGauge: comboFill };
		}
	}
});

// Bloodlust: +10% crit chance for 2 turns after KO
registerPerkHandler('brs-bloodlust', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	// ON_KO trigger: set bloodlust state
	perk.state.bloodlustTurns = 2;
	return { message: 'Bloodlust surges!' };
});

// Berserk Rage: Below 30% HP → +25% damage
registerPerkHandler('brs-berserk', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.pokemon) {
		const hpPercent = (ctx.pokemon.currentHp / ctx.pokemon.currentStats.hp) * 100;
		if (hpPercent < 30) {
			return { damageModifier: 25 };
		}
	}
});

// Unstoppable (capstone): Crits ignore resistance (handled inline in damage calc)
// No handler needed; checked via hasPassivePerk

// ─── Medic Perks ────────────────────────────────────────────────────────────

// Triage: Below 25% HP → 2x healing (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Regeneration: Heal 3% max HP at end of turn
registerPerkHandler('med-regen', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.pokemon && !ctx.pokemon.fainted) {
		const healAmount = Math.floor(ctx.pokemon.currentStats.hp * 0.03);
		if (healAmount > 0 && ctx.pokemon.currentHp < ctx.pokemon.currentStats.hp) {
			return { healAmount };
		}
	}
});

// Second Wind: Once per dungeon, auto-revive at 25% HP
registerPerkHandler('med-secondwind', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (!perk.state.used && ctx.pokemon && ctx.pokemon.fainted) {
		perk.state.used = true;
		const reviveHp = Math.floor(ctx.pokemon.currentStats.hp * 0.25);
		ctx.pokemon.fainted = false;
		ctx.pokemon.currentHp = reviveHp;
		return { message: `Second Wind revives ${ctx.pokemon.name}!` };
	}
});

// Cleanse: 15% chance to cure status at end of turn
registerPerkHandler('med-cleanse', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.pokemon && !ctx.pokemon.fainted && ctx.pokemon.status) {
		if (Math.random() * 100 < 15) {
			const statusName = ctx.pokemon.status.name;
			ctx.pokemon.status = undefined as any;
			return { message: `Cleanse cured ${ctx.pokemon.name}'s ${statusName}!` };
		}
	}
});

// Overheal: Healing beyond max HP → shield (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Miracle (capstone): Survive fatal hit with 1 HP
registerPerkHandler('med-miracle', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (!perk.state.usedThisBattle && ctx.pokemon && ctx.pokemon.currentHp <= 0) {
		perk.state.usedThisBattle = true;
		return { preventFaint: true, message: `Miracle saves ${ctx.pokemon.name}!` };
	}
});

// ─── Guardian Perks ─────────────────────────────────────────────────────────

// Iron Wall: First hit in battle deals 30% less
registerPerkHandler('grd-ironwall', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (!perk.state.triggered && ctx.damage && ctx.damage > 0) {
		perk.state.triggered = true;
		const reduced = Math.floor(ctx.damage * 0.7);
		return { modifiedDamage: reduced, message: 'Iron Wall absorbs the blow!' };
	}
});

// Last Stand: Below 20% HP → +50% Def/SpDef (handled inline)
// No handler needed; checked via hasPassivePerk

// Team Shield: Reduce entry hazard damage by 50% (handled inline)
// No handler needed; checked via hasPassivePerk

// Fortify: +1 Defense stage at battle start
registerPerkHandler('grd-fortify', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.pokemon && !ctx.pokemon.fainted) {
		ctx.pokemon.applyStatChange('defense', 1);
		return { message: `${ctx.pokemon.name}'s defense rose!` };
	}
});

// Absorb Impact: SE hits deal 10% less (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Unbreakable (capstone): Can't be one-shot from full HP
registerPerkHandler('grd-unbreakable', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.pokemon && ctx.damage && ctx.damage >= ctx.pokemon.currentHp && ctx.pokemon.currentHp === ctx.pokemon.currentStats.hp) {
		return { preventFaint: true, message: `${ctx.pokemon.name} is Unbreakable!` };
	}
});

// ─── Explorer Perks ─────────────────────────────────────────────────────────

// Scout's Eye: See wild Pokemon type (handled in UI/battle-service)
registerPerkHandler('exp-scout', (_perk: ActivePerk, _ctx: PerkContext): PerkResult | void => {
	// Handled in battle-service.ts / battle UI
});

// Lucky Find: 10% chance for bonus item after wild battle
registerPerkHandler('exp-lucky', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (Math.random() * 100 < 10) {
		return { message: 'Lucky Find! You found a bonus item!' };
	}
});

// Quick Escape: 100% flee rate (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Tracker: Shiny 2x for already-caught Pokemon (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Wanderer: +15% XP in unexplored dungeon floors
registerPerkHandler('exp-wanderer', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	// XP bonus is applied inline when XP is distributed
	return { xpMultiplier: 1.15 };
});

// Fortune (capstone): Shiny 3x + guaranteed boss drops (PASSIVE)
// No handler needed; checked via hasPassivePerk

// ─── Weather Master Perks ───────────────────────────────────────────────────

// Storm Surge: Auto-weather on battle start
registerPerkHandler('wtm-stormsurge', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	// Handled inline in battle start — sets weather matching lead Pokemon type
	return { message: 'Storm Surge activates!' };
});

// Adaptation: No weather chip damage (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Tempest: Weather chip damage to opponents doubled (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Forecast: Weather-boosted moves +10% damage (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Climate Control: Opponent can't change weather for 2 turns (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Cataclysm (capstone): Free weather at battle start, +3 turns
registerPerkHandler('wtm-cataclysm', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	// Handled inline in battle start — stronger version of Storm Surge
	return { message: 'Cataclysm unleashes the elements!' };
});

// ─── Strategist Perks ───────────────────────────────────────────────────────

// Mind Games: Status effects last 1 extra turn
registerPerkHandler('str-mindgames', (_perk: ActivePerk, _ctx: PerkContext): PerkResult | void => {
	// Handled inline when status is applied (extends duration)
});

// Chain Reaction: 20% chance DoT ticks lower target speed
registerPerkHandler('str-chain', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.target && !ctx.target.fainted && Math.random() * 100 < 20) {
		ctx.target.applyStatChange('speed', -1);
		return { message: `Chain Reaction slows ${ctx.target.name}!` };
	}
});

// Calculated: Combo gauge doesn't decay between battles
registerPerkHandler('str-calculated', (_perk: ActivePerk, _ctx: PerkContext): PerkResult | void => {
	// Handled inline in EndBattle — skip combo gauge reset
});

// Exploit Weakness: +10% damage vs statused Pokemon (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Setup: Start battle with 15 combo gauge
registerPerkHandler('str-setup', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.player && ctx.player.comboJauge) {
		ctx.player.comboJauge.addValue(15);
	}
});

// Mastermind (capstone): Status chances 2x, combo moves +25% (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// ─── Breeder Perks ──────────────────────────────────────────────────────────

// Prodigy: 2x EVs for first 5 battles after catch (tracked per-Pokemon, complex — simplified)
registerPerkHandler('brd-prodigy', (_perk: ActivePerk, _ctx: PerkContext): PerkResult | void => {
	// Handled inline in XP/EV distribution
});

// Affinity: +50% catch rate for same-type as lead
registerPerkHandler('brd-affinity', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.pokemon && ctx.target) {
		const leadTypes = ctx.pokemon.types || [];
		const targetTypes = ctx.target.types || [];
		const sharesType = leadTypes.some((t: string) => targetTypes.includes(t));
		if (sharesType) {
			return { catchRateBonus: 50 };
		}
	}
});

// Growth Spurt: Pokemon under level 20 get 2x XP
registerPerkHandler('brd-growth', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.pokemon && ctx.pokemon.level < 20) {
		return { xpMultiplier: 2 };
	}
});

// Nurture: Benched party gains 25% XP after win (handled inline in XP distribution)
// No handler needed; handled inline

// Bonding: Lead always gets full XP even when swapped (handled inline)
// No handler needed; handled inline

// Master Breeder (capstone): 3 perfect IVs + 3x EV (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// ─── Ace Trainer Perks ──────────────────────────────────────────────────────

// Versatile: Non-STAB gets 50% of STAB bonus (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Quick Study: SE attacks gain +1% permanent damage per type matchup
registerPerkHandler('ace-quickstudy', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.isSuperEffective && ctx.target) {
		const typeKey = `type_${ctx.target.types.join('_')}`;
		const current = (perk.state[typeKey] as number) || 0;
		if (current < 10) {
			perk.state[typeKey] = current + 1;
		}
	}
});

// Momentum: +3% XP per consecutive dungeon win
registerPerkHandler('ace-momentum', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.ctx.battleResult.win) {
		const streak = ((perk.state.winStreak as number) || 0) + 1;
		perk.state.winStreak = streak;
		const xpBonus = 1 + (streak * 3) / 100;
		return { xpMultiplier: xpBonus };
	} else {
		perk.state.winStreak = 0;
	}
});

// Adaptive: Switched-in Pokemon gets +1 speed
registerPerkHandler('ace-adaptive', (perk: ActivePerk, ctx: PerkContext): PerkResult | void => {
	if (ctx.pokemon && !ctx.pokemon.fainted) {
		ctx.pokemon.applyStatChange('speed', 1);
		return { message: `${ctx.pokemon.name} adapts quickly!` };
	}
});

// Focus: 80-95% accuracy becomes 100% (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk

// Grand Master (capstone): All mastery bonuses +50% (PASSIVE — checked inline)
// No handler needed; checked via hasPassivePerk
