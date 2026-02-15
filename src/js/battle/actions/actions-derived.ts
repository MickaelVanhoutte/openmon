// DERIVED FROM MAIN ACTIONS

import { ActionType, type ActionV2Interface } from './actions-model';
import { Move, MoveEffect, PokemonInstance } from '../../pokemons/pokedex';
import type { BattleContext } from '../../context/battleContext';
import { ComboJauge, Player } from '../../characters/player';
import { type Character } from '../../characters/characters-model';
import { NPC } from '../../characters/npc';
import { MOVE_EFFECT_APPLIER } from '../battle-model';
import { MasteryType } from '../../characters/mastery-model';
import { Hazard, type Side } from '../battle-field';
import {
	calculateStealthRockDamage,
	calculateSpikesDamage,
	applyToxicSpikes,
	isGroundedForHazards
} from '../../pokemons/effects/hazard-effects';
import { applyWeatherDamage, applyWeather } from '../../pokemons/effects/weather-effects';
import { Weather } from '../battle-field';
import { EffectTiming } from '../../pokemons/effects/types';
import { AbilityTrigger } from '../abilities/ability-types';
import { HeldItemTrigger } from '../../items/held-items-model';

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
			side = 'ally';
			idx = ctx.playerSide.findIndex(
				(monster: PokemonInstance | undefined) => monster === this.initiator
			);
			pokemonChanged = ctx.playerSide[idx];
			ctx.playerSide[idx] = this.target;
			ctx.participants.add(this.target);
		} else {
			side = 'opponent';
			idx = ctx.oppSide.findIndex(
				(monster: PokemonInstance | undefined) => monster === this.initiator
			);
			pokemonChanged = ctx.oppSide[idx];
			ctx.oppSide[idx] = this.target;
		}
		if (pokemonChanged) {
			ctx.events.pokemonChange.set({ side, idx });
		}

		this.applyEntryHazards(ctx, this.target, side);

		this.target.choiceLockedMove = undefined;
		ctx.runAbilityEvent(AbilityTrigger.ON_SWITCH_IN, this.target);
		ctx.runItemEvent(HeldItemTrigger.ON_SWITCH_IN, this.target);
	}

	private applyEntryHazards(
		ctx: BattleContext,
		pokemon: PokemonInstance,
		side: 'ally' | 'opponent'
	): void {
		const hazardSide = side === 'ally' ? 'ally' : 'enemy';
		const battleField = ctx.battleField;
		const types = pokemon.types;
		const isGrounded = isGroundedForHazards(types);
		const isPoisonType = types.some((t) => t.toLowerCase() === 'poison');

		const stealthRockLayers = battleField.getHazardLayers(hazardSide, Hazard.STEALTH_ROCK);
		if (stealthRockLayers > 0) {
			const damage = calculateStealthRockDamage(pokemon.stats.hp, types);
			pokemon.removeHp(damage);
			ctx.events.hazardDamage.set({ pokemon, hazard: 'stealth-rock' });
			ctx.addToStack(new Message(`${pokemon.name} was hurt by Stealth Rock!`, pokemon));
			const faintActions = ctx.checkFainted(pokemon, pokemon);
			faintActions.forEach((action) => ctx.addToStack(action));
		}

		if (isGrounded) {
			const spikesLayers = battleField.getHazardLayers(hazardSide, Hazard.SPIKES);
			if (spikesLayers > 0 && !pokemon.fainted) {
				const damage = calculateSpikesDamage(pokemon.stats.hp, spikesLayers);
				pokemon.removeHp(damage);
				ctx.events.hazardDamage.set({ pokemon, hazard: 'spikes' });
				ctx.addToStack(new Message(`${pokemon.name} was hurt by Spikes!`, pokemon));
				const faintActions = ctx.checkFainted(pokemon, pokemon);
				faintActions.forEach((action) => ctx.addToStack(action));
			}
		}

		if (isGrounded && !pokemon.fainted) {
			const toxicSpikesLayers = battleField.getHazardLayers(hazardSide, Hazard.TOXIC_SPIKES);
			if (toxicSpikesLayers > 0) {
				if (isPoisonType) {
					battleField.removeHazard(hazardSide, Hazard.TOXIC_SPIKES);
					ctx.addToStack(new Message(`${pokemon.name} absorbed the Toxic Spikes!`, pokemon));
				} else if (!pokemon.status) {
					const poisonResult = applyToxicSpikes(toxicSpikesLayers);
					if (poisonResult === 'poison') {
						const poisonDamage = Math.floor(pokemon.stats.hp / 16);
						pokemon.status = {
							move_effect_id: 3,
							abr: 'PSN',
							duration: -1,
							when: EffectTiming.END_TURN,
							damages: poisonDamage,
							turnsPassed: 0,
							healed: false,
							apply: () => ({ message: `${pokemon.name} is poisoned` }),
							playEffect: (target: PokemonInstance) => {
								target.removeHp(poisonDamage);
								return { canPlay: true, message: `${target.name} is hurt by poison` };
							}
						};
						ctx.addToStack(new Message(`${pokemon.name} was poisoned!`, pokemon));
					} else if (poisonResult === 'toxic') {
						const baseDamage = Math.floor(pokemon.stats.hp / 16);
						let turnCount = 0;
						pokemon.status = {
							move_effect_id: 34,
							abr: 'PSN+',
							duration: -1,
							when: EffectTiming.END_TURN,
							damages: baseDamage,
							turnsPassed: 0,
							healed: false,
							apply: () => ({ message: `${pokemon.name} was badly poisoned!` }),
							playEffect: (target: PokemonInstance) => {
								turnCount++;
								const damage = Math.floor(baseDamage * turnCount);
								target.removeHp(damage);
								return { canPlay: true, message: `${target.name} is hurt by poison!` };
							}
						};
						ctx.addToStack(new Message(`${pokemon.name} was badly poisoned!`, pokemon));
					}
				}
			}
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
			const effect = MOVE_EFFECT_APPLIER.findEffect(this.moveEffect);

			if (!effect) {
				return;
			}

			// Weather effects - check by move_effect_id since instanceof doesn't work
			// (the Effect classes in move-effects.ts don't extend WeatherEffect)
			const WEATHER_MAP: Record<number, Weather> = {
				116: Weather.SAND, // Sandstorm
				137: Weather.RAIN, // Rain Dance
				138: Weather.SUN, // Sunny Day
				165: Weather.HAIL // Hail
			};

			const weatherType = WEATHER_MAP[effect.move_effect_id];
			if (weatherType !== undefined) {
				applyWeather(ctx.battleField, weatherType, 5, this.initiator);
				ctx.weatherVersion.update((v) => v + 1);
				const weatherMessages: Record<Weather, string> = {
					[Weather.SAND]: 'A sandstorm kicked up!',
					[Weather.RAIN]: 'It started to rain!',
					[Weather.SUN]: 'The sunlight turned harsh!',
					[Weather.HAIL]: 'It started to hail!',
					[Weather.NONE]: ''
				};
				ctx.addToStack(new Message(weatherMessages[weatherType], this.initiator));
				return;
			}

			// Hazard effects - check by move_effect_id
			// (the Effect classes in move-effects.ts don't extend HazardEffect)
			const HAZARD_MAP: Record<number, Hazard> = {
				267: Hazard.STEALTH_ROCK,
				113: Hazard.SPIKES,
				250: Hazard.TOXIC_SPIKES,
				341: Hazard.STICKY_WEB
			};

			const hazardType = HAZARD_MAP[effect.move_effect_id];
			if (hazardType !== undefined) {
				const initiatorSide = ctx.getPokemonSide(this.initiator);
				const targetSide: Side = initiatorSide === 'ally' ? 'enemy' : 'ally';
				ctx.battleField.addHazard(targetSide, hazardType);
				ctx.hazardsVersion.update((v) => v + 1);
				const hazardMessages: Record<Hazard, string> = {
					[Hazard.STEALTH_ROCK]: 'Pointed stones float in the air!',
					[Hazard.SPIKES]: 'Spikes were scattered on the ground!',
					[Hazard.TOXIC_SPIKES]: 'Poison spikes were scattered!',
					[Hazard.STICKY_WEB]: 'A sticky web spreads out on the ground!'
				};
				ctx.addToStack(new Message(hazardMessages[hazardType], this.initiator));
				return;
			}

			// Default: status effects on Pokemon
			const result = MOVE_EFFECT_APPLIER.apply(this.moveEffect, [this.target], this.initiator);
			if (result?.effect) {
				this.target.status = result.effect;
				ctx.runItemEvent(HeldItemTrigger.ON_STATUS_INFLICTED, this.target);
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

export class PlayStatChange implements ActionV2Interface {
	public type: ActionType;
	public description: string;
	public initiator: PokemonInstance;
	public target: PokemonInstance;
	public stat: string;
	public stages: number;

	constructor(target: PokemonInstance, stat: string, stages: number, initiator: PokemonInstance) {
		this.type = ActionType.STAT_CHANGE;
		this.description = 'Stat Change Animation';
		this.target = target;
		this.stat = stat;
		this.stages = stages;
		this.initiator = initiator;
	}

	execute(ctx: BattleContext): void {
		ctx.events.statChangeAnimation.set({
			target: this.target,
			stat: this.stat,
			stages: this.stages
		});
	}
}

export class PlayWeatherChange implements ActionV2Interface {
	public type: ActionType;
	public description: string;
	public initiator: PokemonInstance;
	public weather: Weather;

	constructor(weather: Weather, initiator: PokemonInstance) {
		this.type = ActionType.WEATHER_CHANGE;
		this.description = 'Weather Change';
		this.weather = weather;
		this.initiator = initiator;
	}

	execute(ctx: BattleContext): void {
		applyWeather(ctx.battleField, this.weather, 5, this.initiator);
		ctx.weatherVersion.update((v) => v + 1);
		ctx.events.weatherChange.set({
			weather: this.weather,
			pokemon: this.initiator
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
		this.target.currentHp = Math.max(0, this.target.currentHp - this.damages);
		if (isNaN(this.target.currentHp)) {
			this.target.currentHp = 0;
		}
		ctx.runItemEvent(HeldItemTrigger.ON_HP_CHANGED, this.target);

		if (this.target.currentHp <= 0) {
			ctx.addToStack(new Sleep(400));
		}

		const actions = ctx.checkFainted(this.target, this.initiator);
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

	execute(_ctx: BattleContext): void {
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
		const result = this.initiator.addXpResult(this.xp, ctx.opponent instanceof Player ? 3 : 1);

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
		const result = this.initiator.levelUp();
		ctx.leveledUpMonsterIds.add(this.initiator.id);
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

const WEATHER_NAMES: Record<Weather, string> = {
	[Weather.NONE]: '',
	[Weather.RAIN]: 'Rain',
	[Weather.SUN]: 'Harsh Sunlight',
	[Weather.SAND]: 'Sandstorm',
	[Weather.HAIL]: 'Hail'
};

export class WeatherDamage implements ActionV2Interface {
	type: ActionType;
	description: string;
	initiator: PokemonInstance;

	constructor(initiator: PokemonInstance) {
		this.type = ActionType.END_CHECKS;
		this.description = 'Weather Damage';
		this.initiator = initiator;
	}

	execute(ctx: BattleContext): void {
		const weather = ctx.battleField.weather;
		if (weather === Weather.NONE) {
			return;
		}

		ctx.weatherVersion.update((v) => v + 1);

		const allPokemon = [...ctx.playerSide, ...ctx.oppSide].filter(
			(p): p is PokemonInstance => !!p && !p.fainted
		);
		const damagingWeather = weather === Weather.SAND || weather === Weather.HAIL;

		if (damagingWeather) {
			ctx.events.weatherDamage.set(weather);

			for (const pokemon of allPokemon) {
				const damage = applyWeatherDamage(
					ctx.battleField,
					pokemon.currentStats.hp,
					pokemon.types,
					pokemon.currentAbility
				);
				if (damage > 0) {
					pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
					const actions = ctx.checkFainted(pokemon, pokemon);
					actions.forEach((a) => ctx.addToStack(a));
				}
			}
		}

		ctx.addToStack(new Message(`The ${WEATHER_NAMES[weather]} rages.`, this.initiator));
	}
}

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
		ctx.runAbilityEvent(AbilityTrigger.ON_TURN_END, this.initiator);
		ctx.runItemEvent(HeldItemTrigger.ON_TURN_END, this.initiator);

		let actions: ActionV2Interface[] = [];
		if (
			!this.initiator.fainted &&
			this.initiator.status &&
			this.initiator.status.when === 'end-turn'
		) {
			const effect = this.initiator.status.playEffect(this.initiator);
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
			const faintedIdx = ctx.oppSide.findIndex((pk) => pk?.fainted);
			if (ctx.settings?.difficulty === 'NORMAL') {
				// random non fainted
				const nonFainted = ctx.opponent.monsters
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
				const nonFainted = ctx.opponent.monsters
					.filter((monster: PokemonInstance) => !monster.fainted)
					.filter((poke) => !ctx.oppSide.includes(poke));
				const bestTypeAdvantage = ctx.findBestPokemon(
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
		} else if (ctx.playerSide.find((pk) => pk?.fainted)) {
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
		if (ctx?.opponent instanceof NPC) {
			ctx.opponent.monsters.forEach((monster: PokemonInstance) => {
				monster.resetBattleStats();
			});
		}
		ctx.clearStack();
		ctx.events.end.set(ctx.battleResult);
		ctx.events.battleEnded = true;
	}
}
