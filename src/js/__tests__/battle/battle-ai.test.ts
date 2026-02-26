import { describe, it, expect, vi } from 'vitest';
import { BattleAI, type AiPersonality } from '../../battle/battle-ai';
import { Weather } from '../../battle/battle-field';
import { ActionType } from '../../battle/actions/actions-model';

// Access private static methods for testing
const AI = BattleAI as any;

function createMove(overrides: any = {}) {
	return {
		name: overrides.name ?? 'Tackle',
		type: overrides.type ?? 'normal',
		power: overrides.power ?? 50,
		category: overrides.category ?? 'physical',
		accuracy: overrides.accuracy ?? 100,
		priority: overrides.priority ?? 0,
		currentPp: overrides.currentPp ?? 10,
		effect: overrides.effect ?? undefined,
		effectChance: overrides.effectChance ?? 0,
		description: overrides.description ?? ''
	};
}

function createPokemon(overrides: any = {}) {
	return {
		name: overrides.name ?? 'TestMon',
		level: overrides.level ?? 50,
		types: overrides.types ?? ['normal'],
		currentHp: overrides.currentHp ?? 100,
		fainted: overrides.fainted ?? false,
		status: overrides.status ?? undefined,
		currentStats: overrides.currentStats ?? { hp: 100 },
		battleStats: overrides.battleStats ?? {
			hp: 100,
			attack: 80,
			defense: 80,
			specialAttack: 80,
			specialDefense: 80,
			speed: 80
		},
		moves: overrides.moves ?? [createMove()],
		lastHitCritical: false
	};
}

function createCtx(overrides: any = {}) {
	return {
		playerSide: overrides.playerSide ?? [createPokemon({ name: 'Player Mon' })],
		oppSide: overrides.oppSide ?? [createPokemon({ name: 'Opp Mon' })],
		opponent: overrides.opponent ?? {},
		turnCount: overrides.turnCount ?? 1,
		opponentTurnActions: overrides.opponentTurnActions ?? [],
		battleField: overrides.battleField ?? { weather: Weather.NONE },
		calculateTypeEffectiveness: overrides.calculateTypeEffectiveness ?? (() => 1),
		getPossibleTargets: overrides.getPossibleTargets ?? ((poke: any, move: any) => ({
			selectOne: true,
			slots: [{ side: 'player', index: 0 }]
		})),
		getPokemonSide: overrides.getPokemonSide ?? (() => 'enemy'),
		battleResult: { win: false, caught: null },
		escapeAttempts: 0,
		fromTypeChart: overrides.fromTypeChart ?? (() => 1)
	} as any;
}

describe('BattleAI', () => {
	describe('evaluateMove (private)', () => {
		it('scores damaging moves based on power', () => {
			const user = createPokemon();
			const target = createPokemon();
			const ctx = createCtx();
			const weak = createMove({ power: 30 });
			const strong = createMove({ power: 100 });

			const weakScore = AI.evaluateMove(user, weak, target, ctx, 'balanced');
			const strongScore = AI.evaluateMove(user, strong, target, ctx, 'balanced');
			expect(strongScore).toBeGreaterThan(weakScore);
		});

		it('boosts score for super effective moves', () => {
			const user = createPokemon();
			const target = createPokemon();
			const move = createMove();

			const neutralCtx = createCtx({ calculateTypeEffectiveness: () => 1 });
			const superCtx = createCtx({ calculateTypeEffectiveness: () => 2 });

			const neutral = AI.evaluateMove(user, move, target, neutralCtx, 'balanced');
			const superEff = AI.evaluateMove(user, move, target, superCtx, 'balanced');
			expect(superEff).toBeGreaterThan(neutral);
		});

		it('returns 0 for immune moves', () => {
			const user = createPokemon();
			const target = createPokemon();
			const move = createMove();
			const ctx = createCtx({ calculateTypeEffectiveness: () => 0 });

			const score = AI.evaluateMove(user, move, target, ctx, 'balanced');
			expect(score).toBe(0);
		});

		it('reduces score for not very effective moves', () => {
			const user = createPokemon();
			const target = createPokemon();
			const move = createMove();

			const neutralCtx = createCtx({ calculateTypeEffectiveness: () => 1 });
			const nveCtx = createCtx({ calculateTypeEffectiveness: () => 0.5 });

			const neutral = AI.evaluateMove(user, move, target, neutralCtx, 'balanced');
			const nve = AI.evaluateMove(user, move, target, nveCtx, 'balanced');
			expect(nve).toBeLessThan(neutral);
		});

		it('applies STAB bonus', () => {
			const noStab = createPokemon({ types: ['water'] });
			const withStab = createPokemon({ types: ['normal'] });
			const target = createPokemon();
			const move = createMove({ type: 'normal' });
			const ctx = createCtx();

			const noStabScore = AI.evaluateMove(noStab, move, target, ctx, 'balanced');
			const stabScore = AI.evaluateMove(withStab, move, target, ctx, 'balanced');
			expect(stabScore).toBeGreaterThan(noStabScore);
		});

		it('considers physical stat advantage', () => {
			const highAtk = createPokemon({
				battleStats: { attack: 200, defense: 80, specialAttack: 80, specialDefense: 80, speed: 80 }
			});
			const lowAtk = createPokemon({
				battleStats: { attack: 30, defense: 80, specialAttack: 80, specialDefense: 80, speed: 80 }
			});
			const target = createPokemon();
			const move = createMove({ category: 'physical' });
			const ctx = createCtx();

			const highScore = AI.evaluateMove(highAtk, move, target, ctx, 'balanced');
			const lowScore = AI.evaluateMove(lowAtk, move, target, ctx, 'balanced');
			expect(highScore).toBeGreaterThan(lowScore);
		});

		it('considers special stat advantage', () => {
			const highSpa = createPokemon({
				battleStats: { attack: 80, defense: 80, specialAttack: 200, specialDefense: 80, speed: 80 }
			});
			const lowSpa = createPokemon({
				battleStats: { attack: 80, defense: 80, specialAttack: 30, specialDefense: 80, speed: 80 }
			});
			const target = createPokemon();
			const move = createMove({ category: 'special' });
			const ctx = createCtx();

			const highScore = AI.evaluateMove(highSpa, move, target, ctx, 'balanced');
			const lowScore = AI.evaluateMove(lowSpa, move, target, ctx, 'balanced');
			expect(highScore).toBeGreaterThan(lowScore);
		});

		it('penalizes low accuracy', () => {
			const user = createPokemon();
			const target = createPokemon();
			const ctx = createCtx();
			const accurate = createMove({ accuracy: 100 });
			const inaccurate = createMove({ accuracy: 50 });

			const accScore = AI.evaluateMove(user, accurate, target, ctx, 'balanced');
			const inaccScore = AI.evaluateMove(user, inaccurate, target, ctx, 'balanced');
			expect(inaccScore).toBeLessThan(accScore);
		});

		it('boosts priority moves vs low HP targets', () => {
			const user = createPokemon();
			const lowHpTarget = createPokemon({ currentHp: 10, currentStats: { hp: 100 } });
			const fullTarget = createPokemon({ currentHp: 100, currentStats: { hp: 100 } });
			const move = createMove({ priority: 1 });
			const ctx = createCtx();

			const lowHpScore = AI.evaluateMove(user, move, lowHpTarget, ctx, 'balanced');
			const fullHpScore = AI.evaluateMove(user, move, fullTarget, ctx, 'balanced');
			expect(lowHpScore).toBeGreaterThan(fullHpScore);
		});

		it('aggressive personality boosts damaging moves', () => {
			const user = createPokemon();
			const target = createPokemon();
			const move = createMove();
			const ctx = createCtx();

			const balanced = AI.evaluateMove(user, move, target, ctx, 'balanced');
			const aggressive = AI.evaluateMove(user, move, target, ctx, 'aggressive');
			expect(aggressive).toBeGreaterThan(balanced);
		});

		it('defensive personality reduces damaging move score', () => {
			const user = createPokemon();
			const target = createPokemon();
			const move = createMove();
			const ctx = createCtx();

			const balanced = AI.evaluateMove(user, move, target, ctx, 'balanced');
			const defensive = AI.evaluateMove(user, move, target, ctx, 'defensive');
			expect(defensive).toBeLessThan(balanced);
		});

		it('scores 4x super effective higher than 2x', () => {
			const user = createPokemon();
			const target = createPokemon();
			const move = createMove();
			const ctx2x = createCtx({ calculateTypeEffectiveness: () => 2 });
			const ctx4x = createCtx({ calculateTypeEffectiveness: () => 4 });

			const score2x = AI.evaluateMove(user, move, target, ctx2x, 'balanced');
			const score4x = AI.evaluateMove(user, move, target, ctx4x, 'balanced');
			expect(score4x).toBeGreaterThan(score2x);
		});
	});

	describe('evaluateStatusMove (private)', () => {
		it('scores setup moves high early at high HP', () => {
			const user = createPokemon({ currentHp: 90, currentStats: { hp: 100 } });
			const target = createPokemon();
			const move = createMove({ power: 0, effect: { move_effect_id: 11 } });
			const ctx = createCtx({ turnCount: 1 });

			const score = AI.evaluateStatusMove(user, move, target, ctx, 'balanced');
			expect(score).toBe(60);
		});

		it('scores setup moves lower at medium HP', () => {
			const user = createPokemon({ currentHp: 55, currentStats: { hp: 100 } });
			const target = createPokemon();
			const move = createMove({ power: 0, effect: { move_effect_id: 11 } });
			const ctx = createCtx({ turnCount: 1 });

			const score = AI.evaluateStatusMove(user, move, target, ctx, 'balanced');
			expect(score).toBe(35);
		});

		it('scores setup moves very low at low HP', () => {
			const user = createPokemon({ currentHp: 20, currentStats: { hp: 100 } });
			const target = createPokemon();
			const move = createMove({ power: 0, effect: { move_effect_id: 11 } });
			const ctx = createCtx({ turnCount: 1 });

			const score = AI.evaluateStatusMove(user, move, target, ctx, 'balanced');
			expect(score).toBe(10);
		});

		it('scores status moves at 0 when target already has status', () => {
			const user = createPokemon();
			const target = createPokemon({ status: { move_effect_id: 3 } });
			const move = createMove({ power: 0, effect: { move_effect_id: 1 } });
			const ctx = createCtx();

			const score = AI.evaluateStatusMove(user, move, target, ctx, 'balanced');
			expect(score).toBe(0);
		});

		it('scores sleep/paralysis higher than other status moves', () => {
			const user = createPokemon();
			const target = createPokemon({ status: undefined });
			const sleep = createMove({ power: 0, effect: { move_effect_id: 2 } });
			const poison = createMove({ power: 0, effect: { move_effect_id: 3 } });
			const ctx = createCtx();

			const sleepScore = AI.evaluateStatusMove(user, sleep, target, ctx, 'balanced');
			const poisonScore = AI.evaluateStatusMove(user, poison, target, ctx, 'balanced');
			expect(sleepScore).toBeGreaterThan(poisonScore);
		});

		it('scores recovery moves high at low HP', () => {
			const user = createPokemon({ currentHp: 20, currentStats: { hp: 100 } });
			const target = createPokemon();
			const move = createMove({ power: 0, effect: { move_effect_id: 33 } });
			const ctx = createCtx();

			const score = AI.evaluateStatusMove(user, move, target, ctx, 'balanced');
			expect(score).toBe(80);
		});

		it('scores recovery moves low at high HP', () => {
			const user = createPokemon({ currentHp: 90, currentStats: { hp: 100 } });
			const target = createPokemon();
			const move = createMove({ power: 0, effect: { move_effect_id: 33 } });
			const ctx = createCtx();

			const score = AI.evaluateStatusMove(user, move, target, ctx, 'balanced');
			expect(score).toBe(5);
		});

		it('scores hazard moves higher early', () => {
			const user = createPokemon();
			const target = createPokemon();
			const move = createMove({ power: 0, effect: { move_effect_id: 113 } });
			const earlyCtx = createCtx({ turnCount: 1 });
			const lateCtx = createCtx({ turnCount: 10 });

			const earlyScore = AI.evaluateStatusMove(user, move, target, earlyCtx, 'balanced');
			const lateScore = AI.evaluateStatusMove(user, move, target, lateCtx, 'balanced');
			expect(earlyScore).toBeGreaterThan(lateScore);
		});

		it('scores weather moves lower when weather is already active', () => {
			const user = createPokemon();
			const target = createPokemon();
			const move = createMove({ power: 0, effect: { move_effect_id: 116 } });
			const noWeather = createCtx({ battleField: { weather: Weather.NONE } });
			const hasWeather = createCtx({ battleField: { weather: Weather.RAIN } });

			const noWeatherScore = AI.evaluateStatusMove(user, move, target, noWeather, 'balanced');
			const hasWeatherScore = AI.evaluateStatusMove(user, move, target, hasWeather, 'balanced');
			expect(hasWeatherScore).toBeLessThan(noWeatherScore);
		});
	});

	describe('estimateDamage (private)', () => {
		it('returns 0 for non-damaging moves', () => {
			const user = createPokemon();
			const target = createPokemon();
			const move = createMove({ power: 0 });
			const ctx = createCtx();

			expect(AI.estimateDamage(user, move, target, ctx)).toBe(0);
		});

		it('returns positive damage for damaging moves', () => {
			const user = createPokemon();
			const target = createPokemon();
			const move = createMove({ power: 80 });
			const ctx = createCtx();

			expect(AI.estimateDamage(user, move, target, ctx)).toBeGreaterThan(0);
		});

		it('higher power gives more damage', () => {
			const user = createPokemon();
			const target = createPokemon();
			const ctx = createCtx();
			const weak = createMove({ power: 40 });
			const strong = createMove({ power: 120 });

			expect(AI.estimateDamage(user, strong, target, ctx)).toBeGreaterThan(
				AI.estimateDamage(user, weak, target, ctx)
			);
		});

		it('STAB gives 1.5x damage', () => {
			const noStab = createPokemon({ types: ['water'] });
			const withStab = createPokemon({ types: ['normal'] });
			const target = createPokemon();
			const move = createMove({ type: 'normal' });
			const ctx = createCtx();

			const noStabDmg = AI.estimateDamage(noStab, move, target, ctx);
			const stabDmg = AI.estimateDamage(withStab, move, target, ctx);
			expect(stabDmg / noStabDmg).toBeCloseTo(1.5, 1);
		});
	});

	describe('getWeatherMoveMultiplier (private)', () => {
		it('returns 1 for no weather', () => {
			const move = createMove({ type: 'water' });
			const ctx = createCtx({ battleField: { weather: Weather.NONE } });
			expect(AI.getWeatherMoveMultiplier(move, ctx)).toBe(1);
		});

		it('boosts water in rain', () => {
			const move = createMove({ type: 'water' });
			const ctx = createCtx({ battleField: { weather: Weather.RAIN } });
			expect(AI.getWeatherMoveMultiplier(move, ctx)).toBe(1.5);
		});

		it('weakens fire in rain', () => {
			const move = createMove({ type: 'fire' });
			const ctx = createCtx({ battleField: { weather: Weather.RAIN } });
			expect(AI.getWeatherMoveMultiplier(move, ctx)).toBe(0.5);
		});

		it('boosts fire in sun', () => {
			const move = createMove({ type: 'fire' });
			const ctx = createCtx({ battleField: { weather: Weather.SUN } });
			expect(AI.getWeatherMoveMultiplier(move, ctx)).toBe(1.5);
		});

		it('weakens water in sun', () => {
			const move = createMove({ type: 'water' });
			const ctx = createCtx({ battleField: { weather: Weather.SUN } });
			expect(AI.getWeatherMoveMultiplier(move, ctx)).toBe(0.5);
		});

		it('returns 1 for neutral type in weather', () => {
			const move = createMove({ type: 'grass' });
			const ctx = createCtx({ battleField: { weather: Weather.RAIN } });
			expect(AI.getWeatherMoveMultiplier(move, ctx)).toBe(1);
		});
	});

	describe('move classification helpers (private)', () => {
		it('isStatBoostingMove recognizes swords dance', () => {
			expect(AI.isStatBoostingMove(11)).toBe(true);
		});

		it('isStatBoostingMove returns false for undefined', () => {
			expect(AI.isStatBoostingMove(undefined)).toBe(false);
		});

		it('isStatBoostingMove returns false for non-boost effect', () => {
			expect(AI.isStatBoostingMove(999)).toBe(false);
		});

		it('isStatusInflicting recognizes paralysis', () => {
			expect(AI.isStatusInflicting(1)).toBe(true);
		});

		it('isStatusInflicting recognizes sleep', () => {
			expect(AI.isStatusInflicting(2)).toBe(true);
		});

		it('isStatusInflicting returns false for undefined', () => {
			expect(AI.isStatusInflicting(undefined)).toBe(false);
		});

		it('isHazardMove recognizes stealth rock', () => {
			expect(AI.isHazardMove(113)).toBe(true);
		});

		it('isHazardMove returns false for non-hazard', () => {
			expect(AI.isHazardMove(1)).toBe(false);
		});

		it('isWeatherMove recognizes weather effects', () => {
			expect(AI.isWeatherMove(116)).toBe(true);
			expect(AI.isWeatherMove(137)).toBe(true);
		});

		it('isWeatherMove returns false for undefined', () => {
			expect(AI.isWeatherMove(undefined)).toBe(false);
		});

		it('isRecoveryMove recognizes recovery', () => {
			expect(AI.isRecoveryMove(33)).toBe(true);
			expect(AI.isRecoveryMove(110)).toBe(true);
		});

		it('isRecoveryMove returns false for non-recovery', () => {
			expect(AI.isRecoveryMove(1)).toBe(false);
		});
	});

	describe('scoreItemAction (private)', () => {
		it('returns undefined for non-NPC opponent', () => {
			const poke = createPokemon();
			const ctx = createCtx({ opponent: {} });
			expect(AI.scoreItemAction(poke, ctx)).toBeUndefined();
		});

		it('returns undefined when already used item this turn', () => {
			const poke = createPokemon();
			const ctx = createCtx({
				opponent: { monsters: [], bag: { potions: { 1: 1 }, getPocketByCategory: () => [1] } },
				opponentTurnActions: [{ type: ActionType.ITEM }]
			});
			expect(AI.scoreItemAction(poke, ctx)).toBeUndefined();
		});

		it('returns undefined when HP is high', () => {
			const poke = createPokemon({ currentHp: 80, currentStats: { hp: 100 } });
			const ctx = createCtx({
				opponent: { monsters: [], bag: { potions: { 1: 1 }, getPocketByCategory: () => [1] } },
				opponentTurnActions: []
			});
			expect(AI.scoreItemAction(poke, ctx)).toBeUndefined();
		});

		it('returns high score when HP is very low', () => {
			const poke = createPokemon({ currentHp: 10, currentStats: { hp: 100 } });
			const ctx = createCtx({
				opponent: { monsters: [], bag: { potions: { 1: 1 }, getPocketByCategory: () => [1] } },
				opponentTurnActions: []
			});
			const result = AI.scoreItemAction(poke, ctx);
			expect(result).toBeDefined();
			expect(result.score).toBe(90);
		});
	});

	describe('evaluateCurrentMatchup (private)', () => {
		it('returns positive score when user has super effective moves', () => {
			const user = createPokemon({
				moves: [createMove({ type: 'water', power: 80 })]
			});
			const target = createPokemon({
				moves: [createMove({ type: 'normal', power: 50 })]
			});
			const ctx = createCtx({
				calculateTypeEffectiveness: (type: string, types: string[]) => {
					if (type === 'water') return 2;
					return 1;
				}
			});

			const score = AI.evaluateCurrentMatchup(user, target, ctx);
			expect(score).toBeGreaterThan(0);
		});

		it('returns negative score when target has super effective moves', () => {
			const user = createPokemon({
				moves: [createMove({ type: 'normal', power: 50 })]
			});
			const target = createPokemon({
				moves: [createMove({ type: 'fighting', power: 80 })]
			});
			const ctx = createCtx({
				calculateTypeEffectiveness: (type: string, types: string[]) => {
					if (type === 'fighting') return 2;
					return 1;
				}
			});

			const score = AI.evaluateCurrentMatchup(user, target, ctx);
			expect(score).toBeLessThan(0);
		});

		it('ignores status moves (power 0)', () => {
			const user = createPokemon({
				moves: [createMove({ type: 'normal', power: 0 })]
			});
			const target = createPokemon({
				moves: [createMove({ type: 'normal', power: 0 })]
			});
			const ctx = createCtx();

			const score = AI.evaluateCurrentMatchup(user, target, ctx);
			expect(score).toBe(0);
		});
	});

	describe('getTargetPokemon (private)', () => {
		it('returns player side pokemon', () => {
			const playerMon = createPokemon({ name: 'Player' });
			const ctx = createCtx({
				playerSide: [playerMon],
				oppSide: [createPokemon({ name: 'Opp' })]
			});
			const result = AI.getTargetPokemon({ side: 'player', index: 0 }, ctx);
			expect(result.name).toBe('Player');
		});

		it('returns opponent side pokemon', () => {
			const oppMon = createPokemon({ name: 'Opp' });
			const ctx = createCtx({
				playerSide: [createPokemon({ name: 'Player' })],
				oppSide: [oppMon]
			});
			const result = AI.getTargetPokemon({ side: 'opponent', index: 0 }, ctx);
			expect(result.name).toBe('Opp');
		});

		it('returns undefined for out of bounds', () => {
			const ctx = createCtx({
				playerSide: [createPokemon()],
				oppSide: []
			});
			const result = AI.getTargetPokemon({ side: 'opponent', index: 5 }, ctx);
			expect(result).toBeUndefined();
		});
	});

	describe('selectAction', () => {
		it('returns undefined for fainted pokemon', () => {
			const poke = createPokemon({ fainted: true });
			const ctx = createCtx();
			expect(BattleAI.selectAction(poke, ctx as any)).toBeUndefined();
		});

		it('returns undefined for null pokemon', () => {
			expect(BattleAI.selectAction(null as any, createCtx() as any)).toBeUndefined();
		});

		it('returns an action for a pokemon with available moves', () => {
			const poke = createPokemon({
				moves: [createMove({ power: 80, currentPp: 10 })]
			});
			const ctx = createCtx();
			const action = BattleAI.selectAction(poke, ctx as any);
			expect(action).toBeDefined();
			expect(action!.type).toBe(ActionType.ATTACK);
		});

		it('skips moves with 0 PP', () => {
			const poke = createPokemon({
				moves: [
					createMove({ power: 80, currentPp: 0 }),
					createMove({ name: 'Splash', power: 0, currentPp: 5, effect: { move_effect_id: 999 } })
				]
			});
			const ctx = createCtx();
			const action = BattleAI.selectAction(poke, ctx as any);
			// Should still return something (fallback or status move)
			expect(action).toBeDefined();
		});

		it('defaults to balanced personality', () => {
			const poke = createPokemon({
				moves: [createMove({ power: 80 })]
			});
			const ctx = createCtx();
			// Should not throw
			const action = BattleAI.selectAction(poke, ctx as any);
			expect(action).toBeDefined();
		});
	});
});
