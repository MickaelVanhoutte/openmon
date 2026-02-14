import type { GameContext } from '../context/gameContext';
import { Bag } from '../items/bag';
import type { Position } from '../mapping/positions';
import { Pokedex, PokemonInstance } from '../pokemons/pokedex';
import { Dialog, GiveItem, Message, Script } from '../scripting/scripts';
import { type Character, CharacterPosition, type Interactive } from './characters-model';
import type { MasteryType } from './mastery-model';
import { ComboJauge } from './player';

export class Follower implements Character, Interactive {
	position: CharacterPosition;
	spriteId: number = 0;
	name: string = 'Follower';
	gender: 'MALE' | 'FEMALE' = 'MALE';
	monsters: PokemonInstance[] = [];
	bag: Bag = new Bag();
	moving: boolean = false;

	pokemon: PokemonInstance;
	comboJauge: ComboJauge = new ComboJauge();

	interactions: string[] = [];

	stepCounter = 0;

	constructor(position: CharacterPosition, pokemon: PokemonInstance) {
		this.position = position;
		this.pokemon = pokemon;
		this.interactions = [
			`${this.pokemon.name} is happy to be with you!`,
			`${this.pokemon.name} is following you!`,
			`${this.pokemon.name} wants to play!`
		];
	}
	getMasteryBonus(_type: MasteryType): number {
		return 0;
	}

	isBehindCounter(): boolean {
		return false;
	}

	static fromInstance(follower: Follower, pokedex?: Pokedex): Follower {
		const followerProto = new Follower(
			new CharacterPosition(follower.position.positionOnMap, follower.position.direction),
			follower.pokemon
		);
		Object.setPrototypeOf(followerProto.pokemon, PokemonInstance.prototype);
		followerProto.pokemon.rehydrate(pokedex);
		return followerProto;
	}

	interact(_playerPosition: Position, gameContext: GameContext): (Script | undefined)[] {
		if (this.stepCounter > 100) {
			// TODO: add a selection of items, based on level
			const max = Object.keys(gameContext.ITEMS.references).length;
			const idx = Math.floor(Math.random() * (max - 0 + 1)) + 0;
			const id = gameContext.ITEMS.ids[idx];
			if (gameContext.ITEMS.getItem(id)) {
				this.stepCounter = 0;
				return [
					new Script('onInteract', [
						new GiveItem(id, 1),
						new Dialog([
							new Message(
								`${this.pokemon.name} found a ${gameContext.ITEMS.getItem(id)?.name}!`,
								'follower'
							)
						])
					])
				];
			}
		}
		return [
			new Script('onInteract', [
				new Dialog([
					new Message(
						this.interactions[Math.floor(Math.random() * this.interactions.length)],
						'follower'
					)
				])
			])
		];
	}
}
