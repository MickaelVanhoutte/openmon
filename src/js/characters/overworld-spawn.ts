import { Bag } from '../items/bag';
import type { PokemonInstance } from '../pokemons/pokedex';
import { type Character, type CharacterPosition } from './characters-model';
import type { MasteryType } from './mastery-model';
import { ComboJauge } from './player';

export class OverworldSpawn implements Character {
	spriteId: number = 0;
	name: string = 'OverworldSpawn';
	gender: 'MALE' | 'FEMALE' = 'MALE';
	monsters: PokemonInstance[] = [];
	bag: Bag = new Bag();
	moving: boolean = true;
	position: CharacterPosition;
	comboJauge: ComboJauge = new ComboJauge();
	pokemon: PokemonInstance;

	constructor(position: CharacterPosition, pokemon: PokemonInstance) {
		this.position = position;
		this.pokemon = pokemon;
	}

	getMasteryBonus(_type: MasteryType): number {
		throw new Error('Method not implemented.');
	}
}
