import '@abraham/reflection';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionType } from '../../battle/actions/actions-model';
import {
	Message,
	Sleep,
	RemoveHP,
	ComboBoost,
	EndBattle,
	WeatherDamage,
	EndTurnChecks,
	ChangePokemon
} from '../../battle/actions/actions-derived';
import { createTestPokemon, createTestBattleContext } from '../abilities/test-helpers';
import { Weather } from '../../battle/battle-field';
import { PokemonInstance } from '../../pokemons/pokedex';
import { Player, ComboJauge } from '../../characters/player';
import { NPC } from '../../characters/npc';
import { AbilityTrigger } from '../../battle/abilities/ability-types';

function createExtendedCtx(overrides: Record<string, unknown> = {}) {
	const base = createTestBattleContext();
	const pokemon1 = createTestPokemon({ name: 'Pikachu', hp: 100 });
	const pokemon2 = createTestPokemon({ name: 'Charmander', hp: 100 });
	base.playerSide[0] = pokemon1;
	base.oppSide[0] = pokemon2;

	const ctx = Object.assign(base, {
		currentMessage: { set: vi.fn() },
		sleep: vi.fn().mockResolvedValue(undefined),
		checkFainted: vi.fn().mockReturnValue([]),
		clearStack: vi.fn(),
		participants: new Set<PokemonInstance>(),
		events: {
			pokemonChange: { set: vi.fn() },
			hazardDamage: { set: vi.fn() },
			weatherDamage: { set: vi.fn() },
			animateAttack: { set: vi.fn() },
			statChangeAnimation: { set: vi.fn() },
			weatherChange: { set: vi.fn() },
			levelUp: { set: vi.fn() },
			playerPokemonFaint: { set: vi.fn() },
			end: { set: vi.fn() },
			battleEnded: false
		},
		player: {
			monsters: [pokemon1]
		},
		opponent: pokemon2,
		isWild: true,
		battleResult: { win: false },
		settings: { difficulty: 'NORMAL' },
		findBestPokemon: vi.fn(),
		leveledUpMonsterIds: new Set<number>(),
		...overrides
	});
	return ctx;
}

describe('Derived Actions', () => {
	let pokemon: ReturnType<typeof createTestPokemon>;

	beforeEach(() => {
		pokemon = createTestPokemon({ name: 'Pikachu', hp: 100 });
	});

	describe('Message', () => {
		it('should set currentMessage on ctx', () => {
			const ctx = createExtendedCtx();
			const msg = new Message('Hello World!', pokemon);

			expect(msg.type).toBe(ActionType.MESSAGE);
			expect(msg.description).toBe('Hello World!');

			msg.execute(ctx as any);
			expect(ctx.currentMessage.set).toHaveBeenCalledWith('Hello World!');
		});
	});

	describe('Sleep', () => {
		it('should call ctx.sleep with duration', async () => {
			const ctx = createExtendedCtx();
			const sleep = new Sleep(500, pokemon);

			expect(sleep.type).toBe(ActionType.SLEEP);
			expect(sleep.duration).toBe(500);

			await sleep.execute(ctx as any);
			expect(ctx.sleep).toHaveBeenCalledWith(500);
		});

		it('should handle missing initiator', () => {
			const sleep = new Sleep(300);
			expect(sleep.initiator).toBeDefined();
		});
	});

	describe('RemoveHP', () => {
		it('should subtract damage from target HP', () => {
			const ctx = createExtendedCtx();
			const target = createTestPokemon({ name: 'Bulbasaur', hp: 100 });
			const removeHp = new RemoveHP(30, target, pokemon);

			expect(removeHp.type).toBe(ActionType.REMOVE_HP);

			removeHp.execute(ctx as any);
			expect(target.currentHp).toBe(70);
			expect(ctx.checkFainted).toHaveBeenCalledWith(target, pokemon);
		});

		it('should push Sleep(400) when HP drops to 0', () => {
			const ctx = createExtendedCtx();
			const target = createTestPokemon({ name: 'Bulbasaur', hp: 50 });
			const removeHp = new RemoveHP(60, target, pokemon);

			removeHp.execute(ctx as any);
			expect(target.currentHp).toBe(-10);
			// Sleep(400) should be added to stack
			expect(ctx.addToStack).toHaveBeenCalled();
			const sleepCall = (ctx.addToStack as ReturnType<typeof vi.fn>).mock.calls.find(
				(call: unknown[]) => call[0] instanceof Sleep
			);
			expect(sleepCall).toBeDefined();
			expect(sleepCall![0].duration).toBe(400);
		});

		it('should push checkFainted return actions to stack', () => {
			const ctx = createExtendedCtx();
			const faintAction = {
				type: ActionType.MESSAGE,
				description: 'fainted',
				initiator: pokemon,
				execute: vi.fn()
			};
			(ctx.checkFainted as ReturnType<typeof vi.fn>).mockReturnValue([faintAction]);
			const target = createTestPokemon({ name: 'Bulbasaur', hp: 100 });
			const removeHp = new RemoveHP(30, target, pokemon);

			removeHp.execute(ctx as any);
			expect(ctx.addToStack).toHaveBeenCalledWith(faintAction);
		});
	});

	describe('ComboBoost', () => {
		it('should add base 5 combo points', () => {
			const comboJauge = new ComboJauge(0, 0);
			const addValueSpy = vi.spyOn(comboJauge, 'addValue');
			const controller = {
				comboJauge,
				getMasteryBonus: vi.fn().mockReturnValue(0)
			};
			const combo = new ComboBoost(pokemon, controller as any, false, false);

			expect(combo.type).toBe(ActionType.COMBO_BOOST);

			combo.execute({} as any);
			expect(addValueSpy).toHaveBeenCalledWith(5);
		});

		it('should add +5 for super effective', () => {
			const comboJauge = new ComboJauge(0, 0);
			const addValueSpy = vi.spyOn(comboJauge, 'addValue');
			const controller = {
				comboJauge,
				getMasteryBonus: vi.fn().mockReturnValue(0)
			};
			const combo = new ComboBoost(pokemon, controller as any, true, false);

			combo.execute({} as any);
			expect(addValueSpy).toHaveBeenCalledWith(10);
		});

		it('should add +5 for critical hit', () => {
			const comboJauge = new ComboJauge(0, 0);
			const addValueSpy = vi.spyOn(comboJauge, 'addValue');
			const controller = {
				comboJauge,
				getMasteryBonus: vi.fn().mockReturnValue(0)
			};
			const combo = new ComboBoost(pokemon, controller as any, false, true);

			combo.execute({} as any);
			expect(addValueSpy).toHaveBeenCalledWith(10);
		});

		it('should add mastery bonus', () => {
			const comboJauge = new ComboJauge(0, 0);
			const addValueSpy = vi.spyOn(comboJauge, 'addValue');
			const controller = {
				comboJauge,
				getMasteryBonus: vi.fn().mockReturnValue(3)
			};
			const combo = new ComboBoost(pokemon, controller as any, true, true);

			combo.execute({} as any);
			// 5 base + 5 super + 5 crit + 3 mastery = 18
			expect(addValueSpy).toHaveBeenCalledWith(18);
		});

		it('should not boost if controller is PokemonInstance', () => {
			const pokemonController = createTestPokemon({ name: 'Pikachu' });
			const combo = new ComboBoost(pokemon, pokemonController as any, true, true);

			// Should not throw
			combo.execute({} as any);
		});

		it('should not boost if controller has no comboJauge', () => {
			const controller = { getMasteryBonus: vi.fn() };
			const combo = new ComboBoost(pokemon, controller as any, true, true);

			combo.execute({} as any);
			// No error thrown
		});
	});

	describe('EndBattle', () => {
		it('should reset player monster battle stats', () => {
			const ctx = createExtendedCtx();
			const endBattle = new EndBattle(pokemon);

			expect(endBattle.type).toBe(ActionType.END_BATTLE);

			endBattle.execute(ctx as any);
			expect(ctx.player.monsters[0].resetBattleStats).toHaveBeenCalled();
		});

		it('should reset NPC opponent battle stats', () => {
			const npcMonster = createTestPokemon({ name: 'Rattata' });
			const npc = Object.create(NPC.prototype);
			Object.assign(npc, { name: 'Trainer', monsters: [npcMonster] });
			const ctx = createExtendedCtx({ opponent: npc });

			const endBattle = new EndBattle(pokemon);
			endBattle.execute(ctx as any);

			expect(npcMonster.resetBattleStats).toHaveBeenCalled();
		});

		it('should clear stack and set end event', () => {
			const ctx = createExtendedCtx();
			const endBattle = new EndBattle(pokemon);

			endBattle.execute(ctx as any);

			expect(ctx.clearStack).toHaveBeenCalled();
			expect(ctx.events.end.set).toHaveBeenCalledWith(ctx.battleResult);
			expect(ctx.events.battleEnded).toBe(true);
		});
	});

	describe('WeatherDamage', () => {
		it('should do nothing when weather is NONE', () => {
			const ctx = createExtendedCtx();
			ctx.battleField.weather = Weather.NONE;
			const weatherDmg = new WeatherDamage(pokemon);

			weatherDmg.execute(ctx as any);
			expect(ctx.addToStack).not.toHaveBeenCalled();
		});

		it('should push weather raging message for Sand', () => {
			const ctx = createExtendedCtx();
			ctx.battleField.weather = Weather.SAND;
			// Need non-fainted pokemon in sides
			const p1 = createTestPokemon({ name: 'Pikachu', hp: 100, types: ['Electric'] });
			(p1 as any).currentAbility = 'Static';
			ctx.playerSide[0] = p1;
			ctx.oppSide[0] = createTestPokemon({ name: 'Geodude', hp: 100, types: ['Rock'] });
			(ctx.oppSide[0] as any).currentAbility = 'Sturdy';

			const weatherDmg = new WeatherDamage(pokemon);
			weatherDmg.execute(ctx as any);

			// Should push weather message
			const msgCalls = (ctx.addToStack as ReturnType<typeof vi.fn>).mock.calls;
			const weatherMsg = msgCalls.find(
				(call: unknown[]) =>
					call[0] instanceof Message && (call[0] as Message).description.includes('rages')
			);
			expect(weatherMsg).toBeDefined();
		});

		it('should update weatherVersion', () => {
			const ctx = createExtendedCtx();
			ctx.battleField.weather = Weather.SAND;
			const weatherDmg = new WeatherDamage(pokemon);

			weatherDmg.execute(ctx as any);
			expect(ctx.weatherVersion.update).toHaveBeenCalled();
		});
	});

	describe('ChangePokemon', () => {
		it('should replace pokemon on player side when owner is Player', () => {
			const ctx = createExtendedCtx();
			const initiator = ctx.playerSide[0]!;
			const target = createTestPokemon({ name: 'Squirtle', hp: 80 });
			const owner = Object.create(Player.prototype);

			const changePoke = new ChangePokemon(initiator, target, owner);
			expect(changePoke.type).toBe(ActionType.SWITCH_EFFECT);

			changePoke.execute(ctx as any);
			expect(ctx.playerSide[0]).toBe(target);
			expect(ctx.participants.has(target)).toBe(true);
		});

		it('should replace pokemon on opponent side when owner is not Player', () => {
			const ctx = createExtendedCtx();
			const initiator = ctx.oppSide[0]!;
			const target = createTestPokemon({ name: 'Squirtle', hp: 80 });
			const owner = { name: 'Trainer' } as any;

			const changePoke = new ChangePokemon(initiator, target, owner);
			changePoke.execute(ctx as any);

			expect(ctx.oppSide[0]).toBe(target);
		});

		it('should fire pokemonChange event', () => {
			const ctx = createExtendedCtx();
			const initiator = ctx.playerSide[0]!;
			const target = createTestPokemon({ name: 'Squirtle', hp: 80 });
			const owner = Object.create(Player.prototype);

			const changePoke = new ChangePokemon(initiator, target, owner);
			changePoke.execute(ctx as any);

			expect(ctx.events.pokemonChange.set).toHaveBeenCalledWith({ side: 'ally', idx: 0 });
		});

		it('should trigger ON_SWITCH_IN ability event', () => {
			const ctx = createExtendedCtx();
			const initiator = ctx.playerSide[0]!;
			const target = createTestPokemon({ name: 'Squirtle', hp: 80 });
			const owner = Object.create(Player.prototype);

			const changePoke = new ChangePokemon(initiator, target, owner);
			changePoke.execute(ctx as any);

			expect(ctx.runAbilityEvent).toHaveBeenCalledWith(AbilityTrigger.ON_SWITCH_IN, target);
		});
	});

	describe('EndTurnChecks', () => {
		it('should fire ON_TURN_END ability event', () => {
			const ctx = createExtendedCtx();
			const endTurn = new EndTurnChecks(pokemon);

			endTurn.execute(ctx as any);
			expect(ctx.runAbilityEvent).toHaveBeenCalledWith(AbilityTrigger.ON_TURN_END, pokemon);
		});

		it('should detect win when wild opponent is fainted', () => {
			const ctx = createExtendedCtx({ isWild: true });
			const wildOpp = createTestPokemon({ name: 'Rattata', hp: 0 });
			Object.setPrototypeOf(wildOpp, PokemonInstance.prototype);
			wildOpp.fainted = true;
			ctx.opponent = wildOpp;

			const endTurn = new EndTurnChecks(pokemon);
			endTurn.execute(ctx as any);

			expect(ctx.battleResult.win).toBe(true);
			const endBattleCalls = (ctx.addToStack as ReturnType<typeof vi.fn>).mock.calls.filter(
				(call: unknown[]) => call[0] instanceof EndBattle
			);
			expect(endBattleCalls.length).toBeGreaterThan(0);
		});

		it('should detect loss when all player pokemon fainted', () => {
			const ctx = createExtendedCtx();
			ctx.player.monsters[0].fainted = true;

			const endTurn = new EndTurnChecks(pokemon);
			endTurn.execute(ctx as any);

			expect(ctx.battleResult.win).toBe(false);
		});

		it('should apply end-turn status damage', () => {
			const ctx = createExtendedCtx();
			pokemon.status = {
				when: 'end-turn',
				playEffect: vi.fn().mockReturnValue({ canPlay: true, message: 'hurt by burn' })
			} as any;
			pokemon.fainted = false;

			const endTurn = new EndTurnChecks(pokemon);
			endTurn.execute(ctx as any);

			expect(pokemon.status!.playEffect).toHaveBeenCalledWith(pokemon);
		});

		it('should fire playerPokemonFaint event when player pokemon faints', () => {
			const ctx = createExtendedCtx();
			const faintedPoke = createTestPokemon({ name: 'Fainted', hp: 0 });
			faintedPoke.fainted = true;
			ctx.playerSide[0] = faintedPoke;

			const endTurn = new EndTurnChecks(pokemon);
			endTurn.execute(ctx as any);

			expect(ctx.events.playerPokemonFaint.set).toHaveBeenCalledWith(faintedPoke);
		});
	});
});
