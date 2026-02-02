// DERIVED FROM MAIN ACTIONS

import { ActionType, type ActionV2Interface } from './actions-model';
import { Move, MoveEffect, PokemonInstance } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';
import { ComboJauge, Player } from '../../characters/player';
import { type Character } from '../../characters/characters-model';
import { NPC } from '../../characters/npc';
import { MOVE_EFFECT_APPLIER } from '../battle-model';
import { MasteryType } from '../../characters/mastery-model';

export class Message implements ActionV2Interface {
	public type: ActionType;
	public description: string;
	public initiator: PokemonInstance;

	constructor(message: string, initiator: PokemonInstance) {
		this.type = ActionType.MESSAGE;
		this.description = message;
		this.initiator = initiator;
	}

	execute(ctx: BattleContext): void {
		ctx.currentMessage.set(this.description);
	}
}

export class Sleep implements ActionV2Interface {
	public type: ActionType;
	public description: string;
	public initiator: PokemonInstance;
	public duration: number;

	constructor(duration: number, initiator?: PokemonInstance) {
		this.type = ActionType.SLEEP;
		this.description = `Sleep ${duration}ms`;
		this.duration = duration;
		this.initiator = initiator ?? ({} as PokemonInstance);
	}

	async execute(ctx: BattleContext): Promise<void> {
		await ctx.sleep(this.duration);
	}
}

export class ChangePokemon implements ActionV2Interface {
	public type: ActionType;
	public description: string;
	public initiator: PokemonInstance;
	public target: PokemonInstance;
	public owner: Character;

	constructor(initiator: PokemonInstance, target: PokemonInstance, owner: Character) {
		this.type = ActionType.SWITCH_EFFECT;
		this.description = 'Change the current pokemon';
		this.initiator = initiator;
		this.target = target;
		this.owner = owner;
	}

	execute(ctx: BattleContext): void {
		let pokemonChanged: PokemonInstance | undefined;
		let idx = 0;
		let side: 'ally' | 'opponent' = 'ally';
		if (this.owner instanceof Player) {
			//replace initiator with target in  ctx.playerSide
			side = 'ally';
			idx = ctx.playerSide.findIndex(
				(monster: PokemonInstance | undefined) => monster === this.initiator
			);
			pokemonChanged = ctx.playerSide[idx];
			ctx.playerSide[idx] = this.target;
			ctx.participants.add(this.target);
		} else {
			//replace initiator with target in  ctx.opponentSide
			side = 'opponent';
			idx = ctx.oppSide.findIndex(
				(monster: PokemonInstance | undefined) => monster === this.initiator
			);
			pokemonChanged = ctx.oppSide[idx];
			ctx.oppSide[idx] = this.target;
		}
		// order to change sprite to component
		if (pokemonChanged) {
			ctx.events.pokemonChange.set({ side, idx });
		}
	}
}

export class ApplyEffect implements ActionV2Interface {
	public type: ActionType;
	public description: string;
	public moveEffect?: MoveEffect;
	public target: PokemonInstance;
	public initiator: PokemonInstance;

	constructor(moveEffect: MoveEffect, target: PokemonInstance, initiator: PokemonInstance) {
		this.type = ActionType.APPLY_EFFECT;
		this.description = 'Apply Effect';
		this.moveEffect = moveEffect;
		this.target = target;
		this.initiator = initiator;
	}

	execute(ctx: BattleContext): void {
		if (!this.target.fainted && this.moveEffect) {
			let result = MOVE_EFFECT_APPLIER.apply(this.moveEffect, [this.target], this.initiator);
			if (result?.effect) {
				this.target.status = result.effect;
			}
			if (result?.message) {
				ctx.addToStack(new Message(result.message, this.initiator));
			}
		}
	}
}

export class PlayAnimation implements ActionV2Interface {
	public type: ActionType;
	public description: string;
	public move: Move;
	public target: PokemonInstance;
	public initiator: PokemonInstance;
	public hitCount?: number;

	constructor(move: Move, target: PokemonInstance, initiator: PokemonInstance, hitCount?: number) {
		this.type = ActionType.PLAY_ANIMATION;
		this.description = 'Play Animation';
		this.move = move;
		this.target = target;
		this.initiator = initiator;
		this.hitCount = hitCount;
	}
	execute(ctx: BattleContext): void {
		ctx.events.animateAttack.set({
			move: this.move,
			target: this.target,
			initiator: this.initiator,
			hitCount: this.hitCount
		});
	}
}

export class RemoveHP implements ActionV2Interface {
	public type: ActionType;
	public description: string;
	public damages: number;
	public target: PokemonInstance;
	public initiator: PokemonInstance;

	constructor(damages: number, target: PokemonInstance, initiator: PokemonInstance) {
		this.type = ActionType.REMOVE_HP;
		this.description = 'Remove HP';
		this.damages = damages;
		this.target = target;
		this.initiator = initiator;
	}

	execute(ctx: BattleContext): void {
		this.target.currentHp = this.target.currentHp - this.damages;

		if (this.target.currentHp <= 0) {
			ctx.addToStack(new Sleep(400));
		}

		let actions = ctx.checkFainted(this.target, this.initiator);
		if (actions) {
			actions.forEach((action: ActionV2Interface) => {
				ctx.addToStack(action);
			});
		}
	}
}

export class ComboBoost implements ActionV2Interface {
	type: ActionType;
	description: string;
	initiator: PokemonInstance;
	controller: Character | PokemonInstance;
	superEffective: boolean;
	critical: boolean;

	constructor(
		initiator: PokemonInstance,
		controller: Character | PokemonInstance,
		superEffective: boolean,
		critical: boolean
	) {
		this.type = ActionType.COMBO_BOOST;
		this.description = 'Combo Boost';
		this.initiator = initiator;
		this.controller = controller;
		this.superEffective = superEffective;
		this.critical = critical;
	}

	execute(ctx: BattleContext): void {
		if (!(this.controller instanceof PokemonInstance) && !!this.controller.comboJauge) {
			let valueToAdd = 5;
			if (this.superEffective) {
				valueToAdd += 5;
			}
			if (this.critical) {
				valueToAdd += 5;
			}

			valueToAdd += this.controller.getMasteryBonus(MasteryType.COMBO_JAUGE);

			this.controller.comboJauge.addValue(valueToAdd);
			this.controller.comboJauge = new ComboJauge(
				this.controller.comboJauge.value,
				this.controller.comboJauge.stored
			);
		}
	}
}

// ON KILL
export class XPWin implements ActionV2Interface {
	type: ActionType;
	description: string;
	initiator: PokemonInstance;
	xp: number;

	constructor(initiator: PokemonInstance, xp: number) {
		this.type = ActionType.XP_WIN;
		this.description = `${initiator.name} won ${xp} XP!`;
		this.initiator = initiator;
		this.xp = xp;
	}

	execute(ctx: BattleContext): void {
		let result = this.initiator.addXpResult(this.xp, ctx.opponent instanceof Player ? 3 : 1);

		if (result.newMove?.length > 0) {
			result.newMove.forEach((move: string) => {
				ctx.addToStack(
					new Message(`${this.initiator.name} can now learn ${move}!`, this.initiator)
				);
			});
		}

		if (result.levelup) {
			ctx.addToStack(new LvlUp(this.initiator, result.xpLeft));
		}
	}
}

export class LvlUp implements ActionV2Interface {
	type: ActionType;
	description: string;
	initiator: PokemonInstance;
	xpLeft: number;

	constructor(initiator: PokemonInstance, xpLeft: number = 0) {
		this.type = ActionType.LEVEL_UP;
		this.description = `${initiator.name} grew to level ${initiator.level + 1}!`;
		this.initiator = initiator;
		this.xpLeft = xpLeft;
	}

	execute(ctx: BattleContext): void {
		if (this.xpLeft > 0) {
			ctx.addToStack(new XPWin(this.initiator, this.xpLeft));
		}

		ctx.addToStack(new Message(this.description, this.initiator));
		let result = this.initiator.levelUp();
		ctx.events.levelUp.set({ pokemon: this.initiator, ...result });
		if (result?.moves && result.moves.length > 0) {
			result.moves.forEach((move: Move) => {
				ctx.addToStack(new Message(`${this.initiator.name} learned ${move.name}!`, this.initiator));
			});
		}

		// todo display stats (ctx onLvlUp)
	}
}

// END CHECKS, END BATTLE

export class EndTurnChecks implements ActionV2Interface {
	type: ActionType;
	description: string;
	initiator: PokemonInstance;

	constructor(initiator: PokemonInstance) {
		this.type = ActionType.END_CHECKS;
		this.description = 'End Turn Checks';
		this.initiator = initiator;
	}

	execute(ctx: BattleContext): void {
		// end turn effects (burn, poison..)
		let actions: ActionV2Interface[] = [];
		if (
			!this.initiator.fainted &&
			this.initiator.status &&
			this.initiator.status.when === 'end-turn'
		) {
			let effect = this.initiator.status.playEffect(this.initiator);
			actions = ctx.checkFainted(this.initiator, this.initiator);

			if (effect?.message) {
				actions.push(new Message(effect.message, this.initiator));
			}
		}

		if (
			(ctx.isWild && ctx.opponent instanceof PokemonInstance && ctx.opponent.fainted) ||
			(ctx.opponent instanceof NPC &&
				ctx.opponent.monsters.every((monster: PokemonInstance) => monster.fainted))
		) {
			//remove end turn action from stack
			ctx.actionStack.stack = ctx.actionStack.stack.filter((action: ActionV2Interface) => {
				return !(
					action.type === ActionType.MESSAGE && action?.description.startsWith('What should')
				);
			});
			ctx.battleResult.win = true;
			ctx.addToStack(new EndBattle(this.initiator));
			ctx.addToStack(new Message('You won the battle!', this.initiator));
		} else if (ctx.player.monsters.every((monster: PokemonInstance) => monster.fainted)) {
			ctx.battleResult.win = false;
			ctx.addToStack(new EndBattle(this.initiator));
			ctx.addToStack(new Message('You lost the battle...', this.initiator));
		} else if (!!ctx.oppSide.find((pk) => pk?.fainted) && ctx.opponent instanceof NPC) {
			let faintedIdx = ctx.oppSide.findIndex((pk) => pk?.fainted);
			if (ctx.settings?.difficulty === 'NORMAL') {
				// random non fainted
				let nonFainted = ctx.opponent.monsters
					.filter((monster: PokemonInstance) => !monster.fainted)
					.filter((poke) => !ctx.oppSide.includes(poke));

				if (nonFainted.length === 0) {
					ctx.oppSide[faintedIdx] = undefined;
				} else {
					ctx.oppSide[faintedIdx] = nonFainted[Math.floor(Math.random() * nonFainted.length)];
					ctx.addToStack(
						new Message(
							`${ctx.opponent.name} sent out ${ctx.oppSide[faintedIdx]?.name}!`,
							ctx.oppSide[faintedIdx]
						)
					);
					ctx.events.pokemonChange.set({ side: 'opponent', idx: faintedIdx });
				}
			} else {
				// non fainted, non already on board with best type advantage
				let nonFainted = ctx.opponent.monsters
					.filter((monster: PokemonInstance) => !monster.fainted)
					.filter((poke) => !ctx.oppSide.includes(poke));
				let bestTypeAdvantage = ctx.findBestPokemon(
					ctx.opponent.monsters,
					ctx.playerSide?.find((pk) => !!pk && !pk.fainted)
				); // TODO should check all player side (mutualize code with battleContext)

				if (bestTypeAdvantage) {
					ctx.oppSide[faintedIdx] = bestTypeAdvantage;
					ctx.addToStack(
						new Message(
							`${ctx.opponent.name} sent out ${ctx.oppSide[faintedIdx]?.name}!`,
							ctx.oppSide[faintedIdx]
						)
					);
					ctx.events.pokemonChange.set({ side: 'opponent', idx: faintedIdx });
				} else if (nonFainted && nonFainted.length > 0) {
					ctx.oppSide[faintedIdx] = nonFainted[Math.floor(Math.random() * nonFainted.length)];
					ctx.addToStack(
						new Message(
							`${ctx.opponent.name} sent out ${ctx.oppSide[faintedIdx]?.name}!`,
							ctx.oppSide[faintedIdx]
						)
					);
					ctx.events.pokemonChange.set({ side: 'opponent', idx: faintedIdx });
				} else {
					ctx.oppSide[faintedIdx] = undefined;
				}
			}
		} else if (!!ctx.playerSide.find((pk) => pk?.fainted)) {
			ctx.events.playerPokemonFaint.set(ctx.playerSide.find((pk) => pk?.fainted));
		}
		if (actions) {
			actions.forEach((action: ActionV2Interface) => {
				ctx.addToStack(action);
			});
		}
	}
}

export class EndBattle implements ActionV2Interface {
	public type: ActionType;
	public description: string;
	public initiator: PokemonInstance;

	constructor(initiator: PokemonInstance) {
		this.type = ActionType.END_BATTLE;
		this.description = 'End Battle';
		this.initiator = initiator;
	}

	execute(ctx: BattleContext): void {
		ctx.player.monsters?.forEach((monster: PokemonInstance) => {
			monster.resetBattleStats();
		});
		ctx?.opponent instanceof NPC &&
			ctx.opponent.monsters.forEach((monster: PokemonInstance) => {
				monster.resetBattleStats();
			});
		ctx.clearStack();
		ctx.events.end.set(ctx.battleResult);
		ctx.events.battleEnded = true;
	}
}
