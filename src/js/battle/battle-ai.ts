import type { PokemonInstance, MoveInstance } from '../pokemons/pokedex';
import type { BattleContext } from '../context/battleContext';
import type { ActionV2Interface, TargetSlot } from './actions/actions-model';
import { ActionType } from './actions/actions-model';
import { Attack, Switch, UseItem } from './actions/actions-selectable';
import type { NPC } from '../characters/npc';
import { Weather } from './battle-field';

export type AiPersonality = 'aggressive' | 'defensive' | 'balanced';

interface ScoredAction {
	action: ActionV2Interface;
	score: number;
}

/**
 * Battle AI with threat-scoring system.
 * Evaluates all available actions and picks the best one based on
 * type matchups, damage potential, HP thresholds, and field conditions.
 */
export class BattleAI {
	/**
	 * Select the best action for an opponent Pokemon.
	 */
	static selectAction(
		poke: PokemonInstance,
		ctx: BattleContext,
		personality: AiPersonality = 'balanced'
	): ActionV2Interface | undefined {
		if (!poke || poke.fainted) return undefined;

		const candidates: ScoredAction[] = [];

		// Score each available move
		for (const move of poke.moves) {
			if (move.currentPp <= 0) continue;
			const scored = this.scoreMoveAction(poke, move, ctx, personality);
			if (scored) candidates.push(scored);
		}

		// Score switching (NPC trainers only)
		if (ctx.opponent instanceof Object && 'monsters' in ctx.opponent) {
			const switchAction = this.scoreSwitchAction(poke, ctx, personality);
			if (switchAction) candidates.push(switchAction);
		}

		// Score item usage (NPC trainers only)
		const itemAction = this.scoreItemAction(poke, ctx);
		if (itemAction) candidates.push(itemAction);

		if (candidates.length === 0) {
			// Fallback: random move (e.g., all PP depleted — struggle scenario)
			const move = poke.moves[Math.floor(Math.random() * poke.moves.length)];
			const found = ctx.getPossibleTargets(poke, move);
			if (found.selectOne) {
				const idx = Math.floor(Math.random() * found.slots.length);
				return new Attack(move, [found.slots[idx]], poke);
			}
			return new Attack(move, found.slots, poke);
		}

		// Sort by score descending, add some randomness to avoid being perfectly predictable
		candidates.sort((a, b) => b.score - a.score);

		// Top candidate with small random variation
		const topScore = candidates[0].score;
		const viableCandidates = candidates.filter((c) => c.score >= topScore * 0.8);

		// Weighted random selection from viable candidates
		const totalWeight = viableCandidates.reduce((sum, c) => sum + c.score, 0);
		if (totalWeight <= 0) return viableCandidates[0].action;

		let roll = Math.random() * totalWeight;
		for (const candidate of viableCandidates) {
			roll -= candidate.score;
			if (roll <= 0) return candidate.action;
		}

		return viableCandidates[0].action;
	}

	/**
	 * Score an attack action considering type effectiveness, STAB, power, and field conditions.
	 */
	private static scoreMoveAction(
		poke: PokemonInstance,
		move: MoveInstance,
		ctx: BattleContext,
		personality: AiPersonality
	): ScoredAction | undefined {
		const targets = ctx.getPossibleTargets(poke, move);
		if (targets.slots.length === 0) return undefined;

		let bestScore = 0;
		let bestSlot: TargetSlot[] = targets.slots;

		if (targets.selectOne) {
			// Evaluate each possible target and pick the best
			for (const slot of targets.slots) {
				const target = this.getTargetPokemon(slot, ctx);
				if (!target || target.fainted) continue;
				const score = this.evaluateMove(poke, move, target, ctx, personality);
				if (score > bestScore) {
					bestScore = score;
					bestSlot = [slot];
				}
			}
		} else {
			// Multi-target or self-target move — evaluate against primary opponent
			const primaryTarget = ctx.playerSide.find((p) => p && !p.fainted);
			if (primaryTarget) {
				bestScore = this.evaluateMove(poke, move, primaryTarget, ctx, personality);
			}
		}

		if (bestScore <= 0) return undefined;

		return {
			action: new Attack(move, bestSlot, poke),
			score: bestScore
		};
	}

	/**
	 * Core move evaluation: returns a score from 0-200+
	 */
	private static evaluateMove(
		user: PokemonInstance,
		move: MoveInstance,
		target: PokemonInstance,
		ctx: BattleContext,
		personality: AiPersonality
	): number {
		let score = 0;

		if (move.power > 0) {
			// --- Damaging move scoring ---
			const effectiveness = ctx.calculateTypeEffectiveness(move.type, target.types);

			// Base power score (normalized 0-100)
			score = Math.min(move.power, 150) * 0.5;

			// Type effectiveness multiplier
			if (effectiveness >= 4) score *= 3.0;
			else if (effectiveness >= 2) score *= 2.0;
			else if (effectiveness <= 0) return 0; // immune
			else if (effectiveness < 1) score *= 0.3;

			// STAB bonus (Same Type Attack Bonus)
			if (user.types.includes(move.type)) {
				score *= 1.5;
			}

			// Category advantage: use the stat matchup
			if (move.category === 'physical') {
				const atkDef = user.battleStats.attack / Math.max(target.battleStats.defense, 1);
				score *= Math.min(atkDef, 3);
			} else if (move.category === 'special') {
				const spaDef =
					user.battleStats.specialAttack / Math.max(target.battleStats.specialDefense, 1);
				score *= Math.min(spaDef, 3);
			}

			// Accuracy penalty
			if (move.accuracy < 100 && move.accuracy > 0) {
				score *= move.accuracy / 100;
			}

			// Priority moves get a bonus when target is low HP (can finish off)
			if (move.priority > 0 && target.currentHp < target.currentStats.hp * 0.3) {
				score *= 1.5;
			}

			// KO potential bonus: estimate if this can KO
			const estimatedDamage = this.estimateDamage(user, move, target, ctx);
			if (estimatedDamage >= target.currentHp) {
				score *= 2.0; // Big bonus for likely KOs
			}

			// Weather synergy
			score *= this.getWeatherMoveMultiplier(move, ctx);

			// Personality adjustments for damaging moves
			if (personality === 'aggressive') score *= 1.3;
			else if (personality === 'defensive') score *= 0.9;
		} else {
			// --- Status/setup move scoring ---
			score = this.evaluateStatusMove(user, move, target, ctx, personality);
		}

		return Math.max(0, score);
	}

	/**
	 * Evaluate non-damaging (status/setup) moves.
	 */
	private static evaluateStatusMove(
		user: PokemonInstance,
		move: MoveInstance,
		target: PokemonInstance,
		ctx: BattleContext,
		personality: AiPersonality
	): number {
		let score = 30; // Base score for status moves

		const effectId = move.effect?.move_effect_id;

		// Stat-boosting moves: valuable early in battle or when at high HP
		const isSetupMove = this.isStatBoostingMove(effectId);
		if (isSetupMove) {
			const hpPercent = user.currentHp / user.currentStats.hp;
			if (hpPercent > 0.7 && ctx.turnCount <= 3) {
				score = 60; // Setup is great early and at high HP
			} else if (hpPercent > 0.5) {
				score = 35;
			} else {
				score = 10; // Don't set up at low HP
			}
			if (personality === 'defensive') score *= 1.3;
		}

		// Status-inflicting moves
		if (this.isStatusInflicting(effectId)) {
			if (target.status) {
				score = 0; // Target already has a status
			} else {
				score = 50;
				// Paralysis/sleep are more valuable than others
				if (effectId === 1 || effectId === 2 || effectId === 68) score = 65;
				if (personality === 'defensive') score *= 1.2;
			}
		}

		// Hazard moves: very valuable if no hazards set
		if (this.isHazardMove(effectId)) {
			const side = ctx.getPokemonSide(user) === 'ally' ? 'enemy' : 'ally';
			score = 55;
			if (personality === 'defensive') score *= 1.4;
			// Less valuable as turns progress
			if (ctx.turnCount > 5) score *= 0.6;
		}

		// Weather moves
		if (this.isWeatherMove(effectId)) {
			score = 40;
			if (ctx.battleField.weather !== Weather.NONE) score *= 0.3;
		}

		// Recovery moves
		if (this.isRecoveryMove(effectId)) {
			const hpPercent = user.currentHp / user.currentStats.hp;
			if (hpPercent < 0.4) score = 80;
			else if (hpPercent < 0.6) score = 50;
			else score = 5; // Don't heal at high HP
			if (personality === 'defensive') score *= 1.3;
		}

		return Math.max(0, score);
	}

	/**
	 * Rough damage estimate without full calculation — good enough for AI decisions.
	 */
	private static estimateDamage(
		user: PokemonInstance,
		move: MoveInstance,
		target: PokemonInstance,
		ctx: BattleContext
	): number {
		if (move.power <= 0) return 0;

		const atk =
			move.category === 'physical' ? user.battleStats.attack : user.battleStats.specialAttack;
		const def =
			move.category === 'physical' ? target.battleStats.defense : target.battleStats.specialDefense;
		const effectiveness = ctx.calculateTypeEffectiveness(move.type, target.types);
		const stab = user.types.includes(move.type) ? 1.5 : 1;

		// Simplified damage formula
		const baseDamage = ((2 * user.level) / 5 + 2) * move.power * (atk / def);
		return (baseDamage / 50 + 2) * stab * effectiveness * (move.accuracy / 100);
	}

	/**
	 * Score switching to a better Pokemon.
	 */
	private static scoreSwitchAction(
		currentPoke: PokemonInstance,
		ctx: BattleContext,
		personality: AiPersonality
	): ScoredAction | undefined {
		if (!('monsters' in ctx.opponent)) return undefined;
		const npc = ctx.opponent as NPC;

		// Don't switch if already switched this turn
		if (ctx.opponentTurnActions.some((a) => a.type === ActionType.SWITCH)) return undefined;

		const primaryTarget = ctx.playerSide.find((p) => p && !p.fainted);
		if (!primaryTarget) return undefined;

		// Find the best available switch-in
		const available = npc.monsters.filter(
			(p) => p && !p.fainted && !ctx.oppSide.includes(p)
		);

		let bestScore = 0;
		let bestMon: PokemonInstance | undefined;

		for (const candidate of available) {
			let score = 0;

			// Does the candidate resist the opponent's types?
			const playerMoveTypes = primaryTarget.moves
				.filter((m) => m.power > 0)
				.map((m) => m.type);

			// How well does the candidate match up defensively?
			for (const moveType of playerMoveTypes) {
				const eff = ctx.calculateTypeEffectiveness(moveType, candidate.types);
				if (eff < 1) score += 20;
				if (eff > 1) score -= 15;
			}

			// Does the candidate have super-effective STAB moves?
			for (const candidateMove of candidate.moves) {
				if (candidateMove.power <= 0) continue;
				const eff = ctx.calculateTypeEffectiveness(candidateMove.type, primaryTarget.types);
				if (eff > 1 && candidate.types.includes(candidateMove.type)) {
					score += 25;
				} else if (eff > 1) {
					score += 15;
				}
			}

			if (score > bestScore) {
				bestScore = score;
				bestMon = candidate;
			}
		}

		if (!bestMon || bestScore <= 0) return undefined;

		// Switching penalty: you lose a turn
		const switchPenalty = personality === 'aggressive' ? 30 : 15;
		const currentMatchup = this.evaluateCurrentMatchup(currentPoke, primaryTarget, ctx);

		// Only switch if the new matchup is significantly better
		const finalScore = bestScore - switchPenalty - currentMatchup;
		if (finalScore <= 0) return undefined;

		return {
			action: new Switch(currentPoke, bestMon, npc),
			score: finalScore
		};
	}

	/**
	 * Score using an item (healing).
	 */
	private static scoreItemAction(
		poke: PokemonInstance,
		ctx: BattleContext
	): ScoredAction | undefined {
		if (!('monsters' in ctx.opponent)) return undefined;
		const npc = ctx.opponent as NPC;

		if (ctx.opponentTurnActions.some((a) => a.type === ActionType.ITEM)) return undefined;

		// Check for potions
		const hasPotions =
			Object.keys(npc.bag?.potions || {}).length > 0 &&
			Object.values(npc.bag?.potions || {}).some((v) => v > 0);

		if (!hasPotions) return undefined;

		const hpPercent = poke.currentHp / poke.currentStats.hp;

		// Only heal when meaningfully low
		let score = 0;
		if (hpPercent < 0.2) score = 90;
		else if (hpPercent < 0.35) score = 60;
		else if (hpPercent < 0.5) score = 30;
		else return undefined;

		const itemId = npc.bag.getPocketByCategory(27)?.[0];
		if (!itemId) return undefined;

		return {
			action: new UseItem(itemId, poke, poke, npc),
			score
		};
	}

	/**
	 * Evaluate how well the current Pokemon matches up against the target.
	 * Higher = better matchup = less reason to switch.
	 */
	private static evaluateCurrentMatchup(
		current: PokemonInstance,
		target: PokemonInstance,
		ctx: BattleContext
	): number {
		let score = 0;

		for (const move of current.moves) {
			if (move.power <= 0) continue;
			const eff = ctx.calculateTypeEffectiveness(move.type, target.types);
			if (eff > 1) score += 15;
			if (eff > 1 && current.types.includes(move.type)) score += 10;
		}

		// Defensive matchup
		for (const move of target.moves) {
			if (move.power <= 0) continue;
			const eff = ctx.calculateTypeEffectiveness(move.type, current.types);
			if (eff > 1) score -= 10;
			if (eff < 1) score += 5;
		}

		return score;
	}

	private static getTargetPokemon(
		slot: TargetSlot,
		ctx: BattleContext
	): PokemonInstance | undefined {
		const side = slot.side === 'player' ? ctx.playerSide : ctx.oppSide;
		return side[slot.index] ?? undefined;
	}

	private static getWeatherMoveMultiplier(move: MoveInstance, ctx: BattleContext): number {
		const weather = ctx.battleField.weather;
		if (weather === Weather.RAIN) {
			if (move.type === 'water') return 1.5;
			if (move.type === 'fire') return 0.5;
		} else if (weather === Weather.SUN) {
			if (move.type === 'fire') return 1.5;
			if (move.type === 'water') return 0.5;
		}
		return 1;
	}

	// --- Move classification helpers ---

	private static isStatBoostingMove(effectId?: number): boolean {
		if (!effectId) return false;
		// Common stat boost effect IDs (swords dance, calm mind, dragon dance, etc.)
		return [11, 12, 13, 14, 51, 52, 53, 54, 141, 142, 143, 151, 309, 310, 311, 312, 313, 314, 316, 317, 318, 319, 322, 323, 324].includes(effectId);
	}

	private static isStatusInflicting(effectId?: number): boolean {
		if (!effectId) return false;
		// Paralysis, sleep, poison, burn, freeze, toxic
		return [1, 2, 3, 5, 6, 7, 67, 68, 78].includes(effectId);
	}

	private static isHazardMove(effectId?: number): boolean {
		if (!effectId) return false;
		return [113, 191, 192, 228].includes(effectId);
	}

	private static isWeatherMove(effectId?: number): boolean {
		if (!effectId) return false;
		return [116, 137, 138, 139].includes(effectId);
	}

	private static isRecoveryMove(effectId?: number): boolean {
		if (!effectId) return false;
		return [33, 49, 110, 133, 215].includes(effectId);
	}
}
