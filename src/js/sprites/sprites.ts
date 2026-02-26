import charactersJson from '../../assets/characts/final/characters.json';
import { Position } from '../mapping/positions';

export class SpriteFromSheet {
	source: string;
	height: number;
	width: number;
	frameNumber: number = 4;

	constructor(source: string, height: number, width: number, frameNumber: number = 4) {
		this.source = source;
		this.height = height;
		this.width = width;
		this.frameNumber = frameNumber;
	}
}

export class SpritesHolder {
	private spritesByCharacter: Record<number, PlayerSprite> = {};
	public ready = false;

	constructor() {
		charactersJson.forEach((value) => {
			this.spritesByCharacter[value.id] = new PlayerSprite(
				value.id,
				value.name,
				value.full
					? new SpriteFromSheet(
							value.full.source,
							value.full.height,
							value.full.width,
							value.full.frameNumber
						)
					: undefined,
				{
					walking: new SpriteFromSheet(
						value.overworld.walking.source,
						value.overworld.walking.height,
						value.overworld.walking.width,
						value.overworld.walking.frameNumber
					),
					running: value.overworld.running
						? new SpriteFromSheet(
								value.overworld.running.source,
								value.overworld.running.height,
								value.overworld.running.width,
								value.overworld.running.frameNumber
							)
						: undefined,
					biking: value.overworld.biking
						? new SpriteFromSheet(
								value.overworld.biking.source,
								value.overworld.biking.height,
								value.overworld.biking.width,
								value.overworld.biking.frameNumber
							)
						: undefined,
					surfing: value.overworld.surfing
						? new SpriteFromSheet(
								value.overworld.surfing.source,
								value.overworld.surfing.height,
								value.overworld.surfing.width,
								value.overworld.surfing.frameNumber
							)
						: undefined
				},
				value.throwing
					? new SpriteFromSheet(
							value.throwing.source,
							value.throwing.height,
							value.throwing.width,
							value.throwing.frameNumber
						)
					: undefined,
				value.face
					? new SpriteFromSheet(
							value.face.source,
							value.face.height,
							value.face.width,
							value.face.frameNumber
						)
					: undefined
			);
		});
		this.ready = true;
	}

	getSprite(id: number): PlayerSprite {
		return this.spritesByCharacter[id];
	}
}

export function centerObject(
	canvas: CanvasRenderingContext2D,
	scaleX: number,
	scaleY: number,
	objectPosition: Position,
	objectWidth: number,
	objectHeight: number,
	mapDim: {
		width: number;
		height: number;
	}
) {
	const centerX = canvas.canvas.width / 2 - (objectWidth * scaleX) / 2;
	// canvas half - half character height scaled
	const centerY = canvas.canvas.height / 2 - (objectHeight * scaleY) / 2;

	let offsetX = 0;
	let offsetY = 0;

	// translate near the edges
	const minLeftSide = Math.min(centerX / 2, window.innerWidth / 4 - (objectWidth * scaleX) / 2);
	const minTopSide = Math.min(centerY / 2, window.innerHeight / 4 - (objectHeight * scaleY) / 2);
	const minRightSide =
		mapDim.width - Math.min(centerX / 2, window.innerWidth / 4 - (objectWidth * scaleX) / 2);
	const minBottomSide =
		mapDim.height - Math.min(centerY / 2, window.innerHeight / 4 - (objectWidth * scaleY) / 2);

	const leftThreshold = objectPosition.x < minLeftSide;
	const topThreshold = objectPosition.y < minTopSide;
	const rightThreshold = objectPosition.x > minRightSide;
	const bottomThreshold = objectPosition.y > minBottomSide;

	if (leftThreshold) {
		offsetX = minLeftSide - objectPosition.x;
	}
	if (topThreshold) {
		offsetY = minTopSide - objectPosition.y;
	}
	if (rightThreshold) {
		offsetX = minRightSide - objectPosition.x;
	}
	if (bottomThreshold) {
		offsetY = minBottomSide - objectPosition.y;
	}
	return { centerX, centerY, offsetX, offsetY };
}

export class PlayerSprite {
	public id: number;
	public name: string;
	public full?: SpriteFromSheet;
	public face?: SpriteFromSheet;
	public throwing?: SpriteFromSheet;
	public overworld: {
		walking: SpriteFromSheet;
		running?: SpriteFromSheet;
		biking?: SpriteFromSheet;
		surfing?: SpriteFromSheet;
	};

	public fullImg: HTMLImageElement;
	public faceImg?: HTMLImageElement;
	public throwingImg?: HTMLImageElement;
	public worldWalkingImg: HTMLImageElement;
	public worldRunningImg?: HTMLImageElement;
	public portraitSource: string = '';

	public frames = { max: 4, val: 0, elapsed: 0 };

	public orientationIndexes = {
		down: 0,
		left: 1,
		right: 2,
		up: 3
	};

	constructor(
		id: number,
		name: string,
		full: SpriteFromSheet | undefined,
		overworld: {
			walking: SpriteFromSheet;
			running?: SpriteFromSheet;
			biking?: SpriteFromSheet;
			surfing?: SpriteFromSheet;
		},
		throwing?: SpriteFromSheet,
		face?: SpriteFromSheet
	) {
		this.id = id;
		this.name = name;
		this.full = full;
		this.face = face;
		this.overworld = overworld;

		this.fullImg = new Image();
		if (full) this.fullImg.src = full.source;

		if (face) {
			this.faceImg = new Image();
			this.faceImg.src = face.source;
		}

		if (throwing) {
			this.throwing = throwing;
			this.throwingImg = new Image();
			this.throwingImg.src = throwing.source;
		}

		this.worldWalkingImg = new Image();
		this.worldWalkingImg.src = overworld.walking.source;

		// Build portrait: prefer face > full > first frame of walking sheet
		if (face) {
			this.portraitSource = face.source;
		} else if (full) {
			this.portraitSource = full.source;
		} else {
			this.portraitSource = overworld.walking.source;
			this.worldWalkingImg.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = overworld.walking.width;
				canvas.height = overworld.walking.height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(
						this.worldWalkingImg,
						0, 0, overworld.walking.width, overworld.walking.height,
						0, 0, overworld.walking.width, overworld.walking.height
					);
					this.portraitSource = canvas.toDataURL();
				}
			};
		}

		if (overworld.running?.source) {
			this.worldRunningImg = new Image();
			this.worldRunningImg.src = overworld.running.source;
		}
	}
}

export const CHARACTER_SPRITES = new SpritesHolder();
