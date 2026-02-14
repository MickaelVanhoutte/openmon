import { Script } from '../scripting/scripts';
import { CharacterPosition, type Character, type Interactive } from './characters-model';
import { Bag } from '../items/bag';
import type { PokemonInstance } from '../pokemons/pokedex';
import { Position } from '../mapping/positions';
import { CHARACTER_SPRITES, PlayerSprite } from '../sprites/sprites';
import { ComboJauge } from './player';
import type { MasteryType } from './mastery-model';
import type { GameContext } from '../context/gameContext';

export class NPC implements Character, Interactive {
	id: number;
	spriteId: number;
	spriteSheet: PlayerSprite;
	name: string;
	gender: 'MALE' | 'FEMALE';
	monsterIds: number[];
	monsters: PokemonInstance[];
	comboJauge: ComboJauge = new ComboJauge();
	bag: Bag;
	moving: boolean = false;
	alerted: boolean = false;
	alertedAt: number = 0;
	direction: 'up' | 'down' | 'left' | 'right' = 'down';
	behindCounter: boolean = false;

	mainScript?: Script;
	dialogScripts: Script[];
	movingScript?: Script;

	position: CharacterPosition;

	constructor(
		id: number,
		name: string,
		spriteId: number,
		position: Position,
		direction: 'up' | 'down' | 'left' | 'right',
		gender: 'MALE' | 'FEMALE',
		monstersIds?: number[],
		bag?: Bag,
		mainScript?: Script,
		dialogScripts?: Script[],
		movingScript?: Script,
		behindCounter: boolean = false
	) {
		this.id = id;
		this.name = name;
		this.spriteId = spriteId;
		this.spriteSheet = CHARACTER_SPRITES.getSprite(spriteId);
		this.position = new CharacterPosition(position, direction);
		this.gender = gender;
		this.monsterIds = monstersIds || [];
		this.monsters = [];
		this.bag = bag || new Bag();
		this.mainScript = mainScript
			? new Script(
					mainScript?.triggerType,
					mainScript?.actions,
					mainScript?.stepPosition,
					mainScript?.replayable
				)
			: undefined;
		this.dialogScripts =
			dialogScripts?.map(
				(script) =>
					new Script(script.triggerType, script.actions, script.stepPosition, script.replayable)
			) || [];
		this.movingScript = movingScript
			? new Script(
					movingScript?.triggerType,
					movingScript?.actions,
					movingScript?.stepPosition,
					movingScript?.replayable
				)
			: undefined;
		this.behindCounter = behindCounter;
	}

	isBehindCounter(): boolean {
		return this.behindCounter;
	}

	getMasteryBonus(_type: MasteryType): number {
		return 0;
	}

	interact(playerPosition: Position, _gameContext: GameContext): (Script | undefined)[] {
		const previous = this.movingScript?.interrupt();
		let newScript: Script | undefined;

		// change direction toward player
		if (this.position.positionOnMap.x > playerPosition.x) {
			this.direction = 'left';
		} else if (this.position.positionOnMap.x < playerPosition.x) {
			this.direction = 'right';
		} else if (this.position.positionOnMap.y > playerPosition.y) {
			this.direction = 'up';
		} else if (this.position.positionOnMap.y < playerPosition.y) {
			this.direction = 'down';
		}

		if (this.mainScript && (!this.mainScript?.played || this.mainScript?.replayable)) {
			newScript = this.mainScript;
		} else if (this.dialogScripts) {
			const randomIndex = Math.floor(Math.random() * this.dialogScripts.length);
			newScript = this.dialogScripts[randomIndex];
		}
		return [newScript, previous];
	}
}
