import type { Interactive } from '../characters/characters-model';
import type { GameContext } from '../context/gameContext';
import type { Position } from '../mapping/positions';
import type { Script } from '../scripting/scripts';
import type { AItem } from './items-model';

export class OverworldItem implements Interactive {
	id?: number;
	item?: AItem;
	name: string;
	visible: boolean;
	position: Position;
	spriteSrc: string;
	pickedUp: boolean = false;
	scripts?: Script[];

	constructor(
		name: string,
		visible: boolean,
		position: Position,
		spriteSrc: string,
		item?: AItem,
		scripts?: Script[]
	) {
		this.name = name;
		this.item = item;
		this.visible = visible;
		this.position = position;
		this.spriteSrc = spriteSrc;
		this.scripts = scripts;
	}

	isBehindCounter(): boolean {
		return false;
	}

	isBlocking(): boolean {
		return !this.pickedUp && this.visible;
	}

	interact(_playerPosition: Position, _context: GameContext): (Script | undefined)[] {
		if (!this.pickedUp) {
			this.pickedUp = true;
			return this.scripts ? this.scripts : [];
		}
		return [];
	}
}
