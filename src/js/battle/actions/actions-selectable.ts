import { ComboMove, MoveEffect, MoveInstance, PokemonInstance } from '../../pokemons/pokedex';
import { ActionType, type ActionV2Interface, type TargetSlot } from './actions-model';
import type { BattleContext } from '../../context/battleContext';
import { Player } from '../../characters/player';
import { type Character } from '../../characters/characters-model';
import { BattleType, DamageResults, MOVE_EFFECT_APPLIER } from '../battle-model';
import {
	ApplyEffect,
	ChangePokemon,
	ComboBoost,
	EndBattle,
	Message,
	PlayAnimation,
	RemoveHP
} from './actions-derived';
import { Pokeball } from '../../items/items';
import { NPC } from '../../characters/npc';
import { MasteryType } from '../../characters/mastery-model';
import {
	getWeatherDamageMultiplier,
	getWeatherSpDefMultiplier,
	getWeatherAccuracyOverride,
	getWeatherBallType,
	getWeatherBallPower
} from '../../pokemons/effects/weather-effects';
import { Screen } from '../battle-field';
import { AbilityTrigger } from '../abilities/ability-types';

// SELECTABLE ACTIONS
export class RunAway implements ActionV2Interface {
	public type: ActionType;
	public description: string;
	public initiator: PokemonInstance;

	constructor(initiator: PokemonInstance) {
		this.type = ActionType.RUN;
		this.description = 'Run away from the battle';
		this.initiator = initiator;
	}

	execute(ctx: BattleContext): void {
		if (ctx.isWild) {
			// randomized based on opponent speed
			ctx.escapeAttempts++;
			const random = Math.random() * 255;
			const oppSideAlive = ctx.oppSide.filter((p): p is PokemonInstance => !!p);
			const avgPokeSpeed =
				oppSideAlive.reduce((total, next) => total + next.battleStats.speed, 0) /
				(oppSideAlive.length || 1);
			const f =
				Math.floor((avgPokeSpeed * 128) / this.initiator.battleStats.speed) +
				30 * ctx.escapeAttempts * random;

			if (f > 255) {
				ctx.clearStack();
				ctx.battleResult.win = true;
				ctx.events.runnaway.set(true);
				ctx.addToStack(new EndBattle(this.initiator));
				ctx.addToStack(new Message('You ran away safely!', this.initiator));
			} else {
				ctx.addToStack(new Message('Failed to run away!', this.initiator));
			}
		} else {
			ctx.addToStack(new Message("You can't run away from a trainer battle!", this.initiator));
		}
	}
}

export class Switch implements ActionV2Interface {
	type: ActionType;
	description: string;
	initiator: PokemonInstance;
	target: PokemonInstance;
	public owner: Character;

	constructor(initiator: PokemonInstance, target: PokemonInstance, owner: Character) {
		this.type = ActionType.SWITCH;
		this.description = 'Switch';
		this.initiator = initiator;
		this.target = target;
		this.owner = owner;
	}

	execute(ctx: BattleContext): void {
		// Note : actions are pushed in reverse since they are popped from last to first
		ctx.addToStack(new ChangePokemon(this.initiator, this.target, this.owner));
		ctx.addToStack(new Message(`${this.target.name}, go!`, this.target));
		ctx.addToStack(new Message(`${this.initiator.name}, come back!`, this.initiator));
	}
}

export class Attack implements ActionV2Interface {
	public type: ActionType;
	public name: string;
	public description: string;
	public move: MoveInstance | ComboMove;
	public target: TargetSlot[];
	public initiator: PokemonInstance;

	constructor(move: MoveInstance | ComboMove, target: TargetSlot[], initiator: PokemonInstance) {
		this.type = ActionType.ATTACK;
		this.name = move.name;
		this.description = move.description;
		this.move = move;
		this.target = target;
		this.initiator = initiator;
	}

	resolveTargets(ctx: BattleContext): PokemonInstance[] {
		return this.target
			.map((slot) =>
				slot.side === 'player' ? ctx.playerSide[slot.index] : ctx.oppSide[slot.index]
			)
			.filter((p): p is PokemonInstance => !!p && !p.fainted);
	}

	execute(ctx: BattleContext): void {
		const attacker = this.initiator;
		const resolvedTargets = this.resolveTargets(ctx);
		const controller = this.target[0]?.side === 'player' ? ctx.player : ctx.opponent;

		const actionsToPush: ActionV2Interface[] = [];

		// Check if ability prevents the move (ON_BEFORE_MOVE)
		const canMove = ctx.runAbilityEvent<boolean>(
			AbilityTrigger.ON_BEFORE_MOVE,
			attacker,
			resolvedTargets[0]
		);
		if (canMove === false) {
			actionsToPush.push(new Message(`${attacker.name} can't move!`, attacker));
			this.flushActions(ctx, actionsToPush);
			return;
		}

		// start turn statuses (sleep, paralysis..)
		if (attacker.status?.when === 'start-turn') {
			const effect = attacker.status.playEffect(attacker);

			if (effect?.message) {
				actionsToPush.push(new Message(effect.message, attacker));
			}
			if (!effect.canPlay) {
				// Status prevent from attacking, skip the attack
				this.flushActions(ctx, actionsToPush);
				return;
			}
		}

		actionsToPush.push(
			new Message(attacker.name + ' used ' + this.move.name + '!', this.initiator)
		);

		if (resolvedTargets.length === 0 && this.target.length > 0) {
			const isFieldMove =
				!(this.move instanceof ComboMove) &&
				(this.move.category === 'no-damage' || this.move.power === 0);
			if (!isFieldMove) {
				actionsToPush.push(new Message('But there was no target!', this.initiator));
			}
		}

		this.target.forEach((slot) => {
			const tgt = slot.side === 'player' ? ctx.playerSide[slot.index] : ctx.oppSide[slot.index];
			if (!tgt || tgt.fainted) {
				return;
			}

			// Check defender ability for type immunity (ON_TRY_HIT)
			const canHit = ctx.runAbilityEvent<boolean>(
				AbilityTrigger.ON_TRY_HIT,
				tgt,
				attacker,
				this.move
			);
			if (canHit === false) {
				actionsToPush.push(new Message(`It doesn't affect ${tgt.name}...`, this.initiator));
				return;
			}

			const success = this.accuracyApplies(attacker, tgt, this.move, ctx);
			if (!success) {
				actionsToPush.push(new Message('But it failed!', this.initiator));
			} else {
				const result = this.calculateDamage(
					attacker,
					tgt,
					this.move,
					ctx,
					controller,
					1,
					slot.side
				);

				if (this.move instanceof ComboMove) {
					const move: ComboMove = this.move;

					if (
						controller instanceof NPC ||
						(controller instanceof Player && controller?.comboJauge)
					) {
						controller.comboJauge.consume();
					}

					let comboDmgModifier = 0;
					if (controller instanceof Player) {
						comboDmgModifier = controller.getMasteryBonus(MasteryType.COMBO_DAMAGE);
					}
					const result2 = this.calculateDamage(
						attacker,
						tgt,
						move.move2,
						ctx,
						controller,
						0.5 + comboDmgModifier / 100,
						slot.side
					);

					actionsToPush.push(new PlayAnimation(this.move, tgt, this.initiator));

					actionsToPush.push(
						new Message(move.pokemon2.name + ' used ' + move.move2.name + '!', this.initiator)
					);

					move.effects.forEach((eff, index) => {
						const effect = MOVE_EFFECT_APPLIER.findEffect(eff);
						if (
							effect.when === 'before-move' &&
							this.effectApplies(move.effectsChances[index], eff)
						) {
							actionsToPush.push(new ApplyEffect(eff, tgt, this.initiator));
						}
					});

					if (result2.immune) {
						actionsToPush.push(
							new Message(move.move2.name + " doesn't affect " + tgt.name + '...', this.initiator)
						);
					} else if (result2.notVeryEffective) {
						actionsToPush.push(
							new Message(move.move2.name + ' is not very effective...', this.initiator)
						);
					} else if (result2.superEffective) {
						actionsToPush.push(
							new Message(move.move2.name + ' is super effective!', this.initiator)
						);
					}
					if (result2.critical) {
						actionsToPush.push(new Message(move.move2.name + ' critical hit!', this.initiator));
					}

					if (result.immune) {
						actionsToPush.push(
							new Message(move.move1.name + " doesn't affect " + tgt.name + '...', this.initiator)
						);
					} else if (result.notVeryEffective) {
						actionsToPush.push(
							new Message(move.move1.name + ' is not very effective...', this.initiator)
						);
					} else if (result.superEffective) {
						actionsToPush.push(
							new Message(move.move1.name + ' is super effective!', this.initiator)
						);
					}
					if (result.critical) {
						actionsToPush.push(new Message(move.move1.name + ' critical hit!', this.initiator));
					}

					actionsToPush.push(new RemoveHP(result.damages + result2.damages, tgt, this.initiator));

					// Trigger ON_CONTACT for physical/contact moves (for abilities like Rough Skin)
					if (move.move1.category === 'physical') {
						ctx.runAbilityEvent(
							AbilityTrigger.ON_CONTACT,
							tgt,
							attacker,
							move.move1,
							result.damages + result2.damages
						);
					}

					move.effects.forEach((effect, index) => {
						const eff = MOVE_EFFECT_APPLIER.findEffect(effect);
						if (
							this.effectApplies(move.effectsChances[index], effect) &&
							eff.when !== 'before-move'
						) {
							actionsToPush.push(new ApplyEffect(effect, tgt, this.initiator));
						}
					});
				} else {
					const effect = MOVE_EFFECT_APPLIER.findEffect(this.move.effect);
					let hitCount: number | undefined;
					if (
						effect.when === 'before-move' &&
						this.effectApplies(this.move.effectChance, this.move.effect)
					) {
						const effectResult = effect.apply([tgt], this.initiator);
						hitCount = effectResult?.hitCount;
						actionsToPush.push(new ApplyEffect(this.move.effect, tgt, this.initiator));
					}

					if (!result.immune) {
						actionsToPush.push(new PlayAnimation(this.move, tgt, this.initiator, hitCount));
					}
					if (result.immune) {
						actionsToPush.push(
							new Message("It doesn't affect " + tgt.name + '...', this.initiator)
						);
					} else if (result.notVeryEffective) {
						actionsToPush.push(new Message("It's not very effective...", this.initiator));
					} else if (result.superEffective) {
						actionsToPush.push(new Message("It's super effective!", this.initiator));
					}
					if (result.critical) {
						actionsToPush.push(new Message('A critical hit!', this.initiator));
					}

					actionsToPush.push(new RemoveHP(result.damages, tgt, this.initiator));
					actionsToPush.push(
						new ComboBoost(this.initiator, controller, result.superEffective, result.critical)
					);

					// ON_CONTACT for physical/contact moves
					if (this.move.category === 'physical' && result.damages > 0) {
						ctx.runAbilityEvent(
							AbilityTrigger.ON_CONTACT,
							tgt,
							attacker,
							this.move,
							result.damages
						);
					}

					if (
						!result.immune &&
						this.effectApplies(this.move.effectChance, this.move.effect) &&
						effect.when !== 'before-move'
					) {
						actionsToPush.push(new ApplyEffect(this.move.effect, tgt, this.initiator));
					}
				}
			}
		});

		// Handle field moves with no target (weather, hazards, etc.)
		// These moves target the field, not specific Pokemon, so we use initiator as the visual target
		if (resolvedTargets.length === 0 && !(this.move instanceof ComboMove)) {
			const hazardMoves = ['spikes', 'toxic-spikes', 'stealth-rock', 'sticky-web'];
			const isHazardMove = hazardMoves.includes(this.move.name.toLowerCase());

			let animationTarget = this.initiator;
			if (isHazardMove) {
				const initiatorSide = ctx.getPokemonSide(this.initiator);
				const opponentSide = initiatorSide === 'ally' ? ctx.oppSide : ctx.playerSide;
				const validOpponent = opponentSide.find((p) => p && !p.fainted);
				if (validOpponent) {
					animationTarget = validOpponent;
				}
			}

			actionsToPush.push(new PlayAnimation(this.move, animationTarget, this.initiator));
			if (this.effectApplies(this.move.effectChance, this.move.effect)) {
				actionsToPush.push(new ApplyEffect(this.move.effect, this.initiator, this.initiator));
			}
		}

		// ON_AFTER_MOVE
		if (resolvedTargets[0]) {
			ctx.runAbilityEvent(AbilityTrigger.ON_AFTER_MOVE, attacker, resolvedTargets[0]);
		}

		this.flushActions(ctx, actionsToPush);
	}

	private flushActions(ctx: BattleContext, actionsToPush: ActionV2Interface[]) {
		if (actionsToPush && actionsToPush.length > 0) {
			actionsToPush.reverse().forEach((action: ActionV2Interface) => ctx.addToStack(action));
		}
	}

	private calculateDamage(
		attacker: PokemonInstance,
		defender: PokemonInstance,
		move: MoveInstance | ComboMove,
		ctx: BattleContext,
		controller: Character | PokemonInstance,
		modifier: number = 1,
		defenderSide: 'player' | 'opponent' = 'opponent'
	): DamageResults {
		const result = new DamageResults();
		const isWeatherBall = move.effect?.move_effect_id === 204;
		const moveType = isWeatherBall ? getWeatherBallType(ctx.battleField.weather) : move.type;
		const movePower = isWeatherBall ? getWeatherBallPower(ctx.battleField.weather) : move.power;

		const typeEffectiveness = this.calculateTypeEffectiveness(moveType, defender.types, ctx);
		result.superEffective = typeEffectiveness > 1;
		result.notVeryEffective = typeEffectiveness < 1;
		result.immune = typeEffectiveness === 0;
		const critical = result.immune ? 0 : this.calculateCritical(controller, move);
		result.critical = critical > 1;

		if (move.category !== 'no-damage' && movePower > 0) {
			let attack =
				move.category === 'physical'
					? attacker?.battleStats.attack
					: attacker?.battleStats.specialAttack;
			let defense =
				move.category === 'physical'
					? defender?.battleStats.defense
					: defender?.battleStats.specialDefense;

			if (move.category === 'physical') {
				const modifiedAtk = ctx.runAbilityEvent<number>(
					AbilityTrigger.ON_MODIFY_ATK,
					attacker,
					defender,
					move,
					attack
				);
				if (modifiedAtk !== undefined) {
					attack = modifiedAtk;
				}
				const modifiedDef = ctx.runAbilityEvent<number>(
					AbilityTrigger.ON_MODIFY_DEF,
					defender,
					attacker,
					move,
					defense
				);
				if (modifiedDef !== undefined) {
					defense = modifiedDef;
				}
			} else {
				const modifiedSpA = ctx.runAbilityEvent<number>(
					AbilityTrigger.ON_MODIFY_SPA,
					attacker,
					defender,
					move,
					attack
				);
				if (modifiedSpA !== undefined) {
					attack = modifiedSpA;
				}
				const modifiedSpD = ctx.runAbilityEvent<number>(
					AbilityTrigger.ON_MODIFY_SPD,
					defender,
					attacker,
					move,
					defense
				);
				if (modifiedSpD !== undefined) {
					defense = modifiedSpD;
				}
			}

			if (move.category === 'special') {
				const spDefMultiplier = getWeatherSpDefMultiplier(ctx.battleField, defender.types);
				defense = Math.floor(defense * spDefMultiplier);
			}

			if (move.category === 'physical' && attacker?.status?.abr === 'BRN') {
				attack = Math.floor(attack * 0.5);
			}

			const random = Math.random() * (1 - 0.85) + 0.85;
			const stab = this.calculateStab(attacker, moveType, controller);
			const weatherMultiplier = getWeatherDamageMultiplier(ctx.battleField, moveType, move.name);
			const screenMultiplier = this.calculateScreenMultiplier(move.category, defenderSide, ctx);
			const other = weatherMultiplier * screenMultiplier;
			const modifiers = typeEffectiveness * critical * random * stab * other;
			result.damages = Math.floor(
				((((2 * attacker.level) / 5 + 2) * movePower * attack) / defense / 50 + 2) *
					modifiers *
					modifier
			);

			const attackerDamageMod = ctx.runAbilityEvent<number>(
				AbilityTrigger.ON_MODIFY_DAMAGE,
				attacker,
				defender,
				move,
				result.damages
			);
			if (attackerDamageMod !== undefined) {
				result.damages = attackerDamageMod;
			}

			const defenderDamageMod = ctx.runAbilityEvent<number>(
				AbilityTrigger.ON_SOURCE_MODIFY_DAMAGE,
				defender,
				attacker,
				move,
				result.damages
			);
			if (defenderDamageMod !== undefined) {
				result.damages = defenderDamageMod;
			}
		} else {
			result.damages = 0;
		}

		return result;
	}

	private calculateTypeEffectiveness(type: string, types: string[], ctx: BattleContext) {
		return (
			types?.reduce((acc, type2) => {
				const effectiveness = ctx.fromTypeChart(type, type2);
				return acc * effectiveness;
			}, 1) || 1
		);
	}

	private calculateCritical(
		controller: Character | PokemonInstance,
		move: MoveInstance | ComboMove
	) {
		let modifier = 0;
		if (controller instanceof Player) {
			modifier = controller.getMasteryBonus(MasteryType.CRITICAL);
		}

		const isHighCrit = move.effect?.move_effect_id === 44 || move.effect?.move_effect_id === 144;
		const critRate = isHighCrit ? 0.125 : 0.0625;

		return Math.random() < critRate ? 2.0 + modifier / 100 : 1;
	}

	private calculateStab(
		attacker: PokemonInstance,
		moveType: string,
		controller: Character | PokemonInstance
	) {
		if (attacker.types.includes(moveType)) {
			let modifier = 0;
			if (controller instanceof Player) {
				// TODO handle opponents
				modifier = controller.getMasteryBonus(MasteryType.STAB);
			}
			return 1.5 + modifier / 100;
		} else {
			let modifier = 0;
			if (controller instanceof Player) {
				// TODO handle opponents
				modifier = controller.getMasteryBonus(MasteryType.NON_STAB);
			}
			return 1 + modifier / 100;
		}
	}

	private calculateScreenMultiplier(
		category: string,
		defenderSide: 'player' | 'opponent',
		ctx: BattleContext
	): number {
		if (category === 'no-damage') {
			return 1;
		}

		const sideKey = defenderSide === 'player' ? 'ally' : 'enemy';
		const relevantScreen = category === 'physical' ? Screen.REFLECT : Screen.LIGHT_SCREEN;

		if (ctx.battleField.hasScreen(sideKey, relevantScreen)) {
			return ctx.battleType === BattleType.DOUBLE ? 2 / 3 : 0.5;
		}

		return 1;
	}

	private accuracyApplies(
		attacker: PokemonInstance,
		defender: PokemonInstance,
		move: MoveInstance | ComboMove,
		ctx: BattleContext
	) {
		if (!move.accuracy || move.accuracy === 0) {
			return true;
		}

		const weatherAccuracy = getWeatherAccuracyOverride(ctx.battleField, move.name, move.accuracy);

		const accStage = attacker.statsChanges.accuracy - defender.statsChanges.evasion;
		const stageMod = accStage >= 0 ? (3 + accStage) / 3 : 3 / (3 - accStage);
		const finalAccuracy = (weatherAccuracy ?? move.accuracy) * stageMod;
		return Math.random() * 100 < finalAccuracy;
	}

	private effectApplies(effectChance: number, moveEffect?: MoveEffect) {
		return (
			moveEffect &&
			((Number.isInteger(effectChance) && Math.random() * 100 < effectChance) ||
				//  100%
				Number.isNaN(effectChance))
		);
	}
}

export class UseItem implements ActionV2Interface {
	type: ActionType;
	description: string;
	itemId: number;
	target: PokemonInstance;
	initiator: PokemonInstance;
	owner: Character;

	constructor(
		itemId: number,
		target: PokemonInstance,
		initiator: PokemonInstance,
		owner: Character
	) {
		this.type = ActionType.ITEM;
		this.description = 'Use a bag object';
		this.itemId = itemId;
		this.target = target;
		this.initiator = initiator;
		this.owner = owner;
	}

	execute(ctx: BattleContext): void {
		const item = this.owner.bag.getItem(this.itemId, ctx.ITEMS);

		if (item && !(item instanceof Pokeball)) {
			const result = item.apply(this.target);
			if (!result.success) {
				ctx.addToStack(new Message('It failed!', this.initiator));
			}
		}

		if (item instanceof Pokeball) {
			const result = item.apply(this.target);
			if (result.success) {
				ctx.battleResult.caught = this.target;
				ctx.battleResult.win = true;
				ctx.addToStack(new EndBattle(this.initiator));
				// TODO, shakes (calculate number of shakes, use an Action for each, that throws a shake event to the view)
				ctx.addToStack(new Message('Gotcha! ' + this.target.name + ' was caught!', this.initiator));
			} else {
				ctx.addToStack(new Message('Oh no! The Pokémon broke free!', this.initiator));
			}
		}

		ctx.addToStack(new Message(`${this.owner.name} used ${item?.name}!`, this.initiator));
	}
}
