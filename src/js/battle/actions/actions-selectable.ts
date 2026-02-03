import { ComboMove, MoveEffect, MoveInstance, PokemonInstance } from '../../pokemons/pokedex';
import { ActionType, type ActionV2Interface } from './actions-model';
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
import { getWeatherDamageMultiplier } from '../../pokemons/effects/weather-effects';
import { Screen } from '../battle-field';

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
			const avgPokeSpeed =
				ctx.oppSide.reduce((total, next) => total + next.battleStats.speed, 0) / ctx.oppSide.length;
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
	public target: PokemonInstance[];
	public initiator: PokemonInstance;

	constructor(
		move: MoveInstance | ComboMove,
		target: PokemonInstance[],
		initiator: PokemonInstance
	) {
		this.type = ActionType.ATTACK;
		this.name = move.name;
		this.description = move.description;
		this.move = move;
		this.target = target;
		this.initiator = initiator;
	}

	execute(ctx: BattleContext): void {
		const attacker = this.initiator;
		// TODO : this.target[0] is not always the target, it's the first target of the move
		const controller = ctx.playerSide.includes(this.target[0]) ? ctx.player : ctx.opponent;

		const actionsToPush: ActionV2Interface[] = [];

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

		this.target
			.filter((tgt) => !!tgt && !tgt.fainted)
			.forEach((tgt) => {
				const success = this.accuracyApplies(attacker, tgt, this.move);
				if (!success) {
					actionsToPush.push(new Message('But it failed!', this.initiator));
				} else {
					const result = this.calculateDamage(attacker, tgt, this.move, ctx, controller, 1);

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
							0.5 + comboDmgModifier / 100
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
		const validTargets = this.target.filter((tgt) => !!tgt && !tgt.fainted);
		if (validTargets.length === 0 && !(this.move instanceof ComboMove)) {
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

		this.flushActions(ctx, actionsToPush);
	}

	private flushActions(ctx: BattleContext, actionsToPush: ActionV2Interface[]) {
		// console.log(actionsToPush);
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
		modifier: number = 1
	): DamageResults {
		const result = new DamageResults();
		const typeEffectiveness = this.calculateTypeEffectiveness(move.type, defender.types, ctx);
		result.superEffective = typeEffectiveness > 1;
		result.notVeryEffective = typeEffectiveness < 1;
		result.immune = typeEffectiveness === 0;
		const critical = result.immune ? 0 : this.calculateCritical(controller, move);
		result.critical = critical > 1;

		if (move.category !== 'no-damage' && move.power > 0) {
			let attack =
				move.category === 'physical'
					? attacker?.battleStats.attack
					: attacker?.battleStats.specialAttack;
			const defense =
				move.category === 'physical'
					? defender?.battleStats.defense
					: defender?.battleStats.specialDefense;

			if (move.category === 'physical' && attacker?.status === 'burn') {
				attack = Math.floor(attack * 0.5);
			}

			const random = Math.random() * (1 - 0.85) + 0.85;
			const stab = this.calculateStab(attacker, move, controller);
			const weatherMultiplier = getWeatherDamageMultiplier(ctx.battleField, move.type);
			const screenMultiplier = this.calculateScreenMultiplier(move.category, defender, ctx);
			const other = weatherMultiplier * screenMultiplier;
			const modifiers = typeEffectiveness * critical * random * stab * other;
			result.damages = Math.floor(
				((((2 * attacker.level) / 5 + 2) * move.power * attack) / defense / 50 + 2) *
					modifiers *
					modifier
			);
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
		move: MoveInstance | ComboMove,
		controller: Character | PokemonInstance
	) {
		if (attacker.types.includes(move.type)) {
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
		defender: PokemonInstance,
		ctx: BattleContext
	): number {
		if (category === 'no-damage') {
			return 1;
		}

		const defenderSide = ctx.playerSide.includes(defender) ? 'ally' : 'enemy';
		const relevantScreen = category === 'physical' ? Screen.REFLECT : Screen.LIGHT_SCREEN;

		if (ctx.battleField.hasScreen(defenderSide, relevantScreen)) {
			return ctx.battleType === BattleType.DOUBLE ? 2 / 3 : 0.5;
		}

		return 1;
	}

	private accuracyApplies(
		attacker: PokemonInstance,
		defender: PokemonInstance,
		move: MoveInstance | ComboMove
	) {
		if (!move.accuracy || move.accuracy === 0) {
			return true;
		}
		const accStage = attacker.statsChanges.accuracy - defender.statsChanges.evasion;
		const stageMod = accStage >= 0 ? (3 + accStage) / 3 : 3 / (3 - accStage);
		const finalAccuracy = move.accuracy * stageMod;
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
		//console.log('UseItem', this.itemId, this.target, this.initiator, this.owner);

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
