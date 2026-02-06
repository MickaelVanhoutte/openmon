import { Script } from '../scripting/scripts';
import {
	CharacterPosition,
	type Character,
	WALKING_SPEED,
	type Interactive
} from './characters-model';
import { Bag } from '../items/bag';
import type { PokemonInstance } from '../pokemons/pokedex';
import { Position } from '../mapping/positions';
import { centerObject, CHARACTER_SPRITES, PlayerSprite } from '../sprites/sprites';
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

	private orientationIndexes = {
		down: 0,
		left: 1,
		right: 2,
		up: 3
	};
	private images: Record<string, HTMLImageElement> = {};
	private frames = { max: 4, val: 0, elapsed: 0 };

	draw(
		ctx: CanvasRenderingContext2D,
		playerPosition: Position,
		npc: NPC,
		scale: number,
		mapDim: {
			width: number;
			height: number;
		},
		center: { centerX: number; centerY: number; offsetX: number; offsetY: number } | undefined
	) {
		let image = this.images[npc.spriteId];
		if (image && image.complete) {
			this.drawImage(ctx, image, playerPosition, npc.direction, scale, mapDim, center);
		} else {
			image = new Image();
			image.src = this.spriteSheet.overworld.walking.source;
			image.onload = () => {
				this.images[npc.spriteId] = image;
				this.drawImage(ctx, image, playerPosition, npc.direction, scale, mapDim, center);
			};
		}
	}

	private drawImage(
		ctx: CanvasRenderingContext2D,
		image: HTMLImageElement,
		playerPosition: Position,
		orientation: 'up' | 'down' | 'left' | 'right',
		scale: number,
		mapDim: {
			width: number;
			height: number;
		},
		center: { centerX: number; centerY: number; offsetX: number; offsetY: number } | undefined
	) {
		const _frameNumber = this.spriteSheet.overworld.walking.frameNumber;
		const frameWidth = this.spriteSheet.overworld.walking.width;
		const frameHeight = this.spriteSheet.overworld.walking.height;
		const scaleX = frameWidth < 64 ? (56 / frameWidth) * scale : scale;
		const scaleY = frameHeight < 64 ? (56 / frameHeight) * scale : scale;
		const finalScale = Math.min(scaleX, scaleY);
		if (this.moving) {
			if (this.frames.max > 1) {
				this.frames.elapsed += 1;
			}
			if (this.frames.elapsed % 2 === 0) {
				this.frames.val += 1;
			}
			if (this.frames.val > this.frames.max - 1) {
				this.frames.val = 0;
			}
		} else {
			this.frames.val = 0;
		}

		const sY = this.orientationIndexes[orientation] * this.spriteSheet.overworld.walking.height;

		if (this.moving) {
			const speed = WALKING_SPEED;

			const deltaX = this.position.targetPosition.x - this.position.positionOnMap.x;
			const deltaY = this.position.targetPosition.y - this.position.positionOnMap.y;

			const deltaXPx = this.position.targetPositionInPx.x - this.position.positionInPx.x;
			const deltaYPx = this.position.targetPositionInPx.y - this.position.positionInPx.y;

			const moveByX = ((16 * 2.5) / 2) * speed * deltaX;
			const moveByY = ((16 * 2.5) / 2) * speed * deltaY;

			const distance = Math.sqrt(deltaXPx * deltaXPx + deltaYPx * deltaYPx);
			if (distance < Math.abs(moveByX) + Math.abs(moveByY) + 1) {
				this.position.positionInPx.x = this.position.targetPositionInPx.x;
				this.position.positionInPx.y = this.position.targetPositionInPx.y;
				this.position.positionOnMap = this.position.targetPosition;
				this.moving = false;
				if (this.position.onReachTarget) {
					const callback = this.position.onReachTarget;
					this.position.onReachTarget = undefined;
					callback();
				}
			} else {
				this.position.positionInPx.x += moveByX;
				this.position.positionInPx.y += moveByY;
			}
		}

		// Calculate the position of the NPC relative to the player
		const relativeX = this.position.positionInPx.x - playerPosition.x;
		const relativeY = this.position.positionInPx.y - playerPosition.y;

		const centered = center
			? center
			: centerObject(ctx, scaleX, scaleY, playerPosition, frameWidth / 4, frameHeight / 4, mapDim);
		const { centerX, centerY } = centered;
		let { offsetX, offsetY } = centered;
		offsetY -= relativeY - (frameHeight < 64 ? frameHeight / 6 : frameHeight / 5);
		offsetX -= relativeX - (frameWidth < 64 ? -(frameWidth / 4) : frameWidth / 16);

		ctx.save();
		ctx.translate(centerX - offsetX, centerY - offsetY);

		ctx.drawImage(
			image,
			this.frames.val * this.spriteSheet.overworld.walking.width,
			sY,
			this.spriteSheet.overworld.walking.width,
			this.spriteSheet.overworld.walking.height,
			0,
			0,
			this.spriteSheet.overworld.walking.width * finalScale,
			this.spriteSheet.overworld.walking.height * finalScale
		);

		if (this.alerted) {
			this.drawAlertBubble(ctx, this.spriteSheet.overworld.walking.width, finalScale);
		}

		ctx.restore();
	}

	private drawAlertBubble(ctx: CanvasRenderingContext2D, spriteWidth: number, scale: number) {
		const elapsed = Date.now() - this.alertedAt;
		const bubbleSize = 20 * scale;
		const x = (spriteWidth * scale) / 2 - bubbleSize / 2;
		const y = -bubbleSize - 8 * scale;

		const bounce = Math.sin(elapsed / 50) * 2 * scale;

		ctx.fillStyle = 'white';
		ctx.beginPath();
		ctx.ellipse(
			x + bubbleSize / 2,
			y + bubbleSize / 2 + bounce,
			bubbleSize / 2,
			bubbleSize / 2,
			0,
			0,
			Math.PI * 2
		);
		ctx.fill();

		ctx.fillStyle = '#e74c3c';
		ctx.font = `bold ${16 * scale}px sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('!', x + bubbleSize / 2, y + bubbleSize / 2 + bounce);
	}
}
