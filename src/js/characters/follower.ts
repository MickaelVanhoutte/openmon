import type { GameContext } from '../context/gameContext';
import { Bag } from '../items/bag';
import type { Position } from '../mapping/positions';
import { Pokedex, PokemonInstance } from '../pokemons/pokedex';
import { Dialog, GiveItem, Message, Script } from '../scripting/scripts';
import { centerObject } from '../sprites/sprites';
import {
	getPMDSpritePath,
	getPMDSpriteInfoFromAnimData,
	PMD_DIRECTION_MAP,
	type PMDSpriteInfo
} from '../sprites/pmd-sprite-data';
import { loadAnimData, getCachedAnimData, type PMDAnimDataFile } from '../sprites/pmd-anim-data';
import {
	WALKING_SPEED,
	type Character,
	CharacterPosition,
	type Interactive,
	RUNNING_SPEED
} from './characters-model';
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

	interact(playerPosition: Position, gameContext: GameContext): (Script | undefined)[] {
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

	private images: Record<string, HTMLImageElement> = {};
	private animDataFile: PMDAnimDataFile | null = null;
	private walkSpriteInfo: PMDSpriteInfo | null = null;
	private idleSpriteInfo: PMDSpriteInfo | null = null;
	private animDataLoading: boolean = false;
	private frames = { max: 4, val: 0, elapsed: 0 };
	private stationaryTime: number = 0;
	private lastDrawTime: number = 0;
	private readonly IDLE_THRESHOLD_MS: number = 2000;
	private shinySpritesAvailable: boolean | null = null;

	draw(
		ctx: CanvasRenderingContext2D,
		playerPosition: Position,
		scale: number,
		mapDim: {
			width: number;
			height: number;
		},
		drawGrass: boolean,
		running: boolean,
		center: { centerX: number; centerY: number; offsetX: number; offsetY: number } | undefined
	) {
		const now = performance.now();
		if (this.lastDrawTime > 0) {
			const deltaTime = now - this.lastDrawTime;
			if (!this.moving) {
				this.stationaryTime += deltaTime;
			} else {
				this.stationaryTime = 0;
			}
		}
		this.lastDrawTime = now;

		const useIdle = !this.moving && this.stationaryTime >= this.IDLE_THRESHOLD_MS;
		const animationType = useIdle ? 'Idle' : 'Walk';
		const pokemonId = this.pokemon.regionalId;
		const isShiny = this.pokemon.isShiny && this.shinySpritesAvailable !== false;
		const source = getPMDSpritePath(pokemonId, animationType, isShiny);
		let image = this.images[source];

		if (!this.animDataFile && !this.animDataLoading) {
			this.animDataLoading = true;
			const cached = getCachedAnimData(pokemonId, isShiny);
			if (cached) {
				this.animDataFile = cached;
				this.walkSpriteInfo = getPMDSpriteInfoFromAnimData(cached, 'Walk', pokemonId);
				this.idleSpriteInfo = getPMDSpriteInfoFromAnimData(cached, 'Idle', pokemonId);
				this.animDataLoading = false;
				this.shinySpritesAvailable = true;
			} else {
				loadAnimData(pokemonId, isShiny).then((data) => {
					if (data) {
						this.animDataFile = data;
						this.walkSpriteInfo = getPMDSpriteInfoFromAnimData(data, 'Walk', pokemonId);
						this.idleSpriteInfo = getPMDSpriteInfoFromAnimData(data, 'Idle', pokemonId);
						this.shinySpritesAvailable = true;
					} else if (isShiny) {
						this.shinySpritesAvailable = false;
						loadAnimData(pokemonId, false).then((normalData) => {
							this.animDataFile = normalData;
							this.walkSpriteInfo = getPMDSpriteInfoFromAnimData(normalData, 'Walk', pokemonId);
							this.idleSpriteInfo = getPMDSpriteInfoFromAnimData(normalData, 'Idle', pokemonId);
						});
					}
					this.animDataLoading = false;
				});
			}
		}

		const spriteInfo = useIdle ? this.idleSpriteInfo : this.walkSpriteInfo;
		if (spriteInfo) {
			this.frames.max = spriteInfo.frameCount;
		}

		if (image && image.complete && spriteInfo) {
			return this.drawPMDImage(
				ctx,
				image,
				playerPosition,
				scale,
				mapDim,
				drawGrass,
				running,
				center,
				spriteInfo
			);
		} else if (!image) {
			image = new Image();
			image.src = source;
			image.onload = () => {
				this.images[source] = image;
			};
			if (isShiny) {
				image.onerror = () => {
					this.shinySpritesAvailable = false;
				};
			}
		}
		return undefined;
	}

	private drawPMDImage(
		ctx: CanvasRenderingContext2D,
		image: HTMLImageElement,
		playerPosition: Position,
		scale: number,
		mapDim: {
			width: number;
			height: number;
		},
		drawGrass: boolean,
		running: boolean,
		center: { centerX: number; centerY: number; offsetX: number; offsetY: number } | undefined,
		spriteInfo: PMDSpriteInfo
	) {
		const useIdle = !this.moving && this.stationaryTime >= this.IDLE_THRESHOLD_MS;

		if (this.moving || useIdle) {
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
			this.frames.elapsed = 0;
		}

		const frameWidth = spriteInfo.frameWidth;
		const frameHeight = spriteInfo.frameHeight;

		const directionRow = PMD_DIRECTION_MAP[this.position.direction];
		const sX = this.frames.val * frameWidth;
		const sY = directionRow * frameHeight;

		if (this.moving) {
			const speed = running ? RUNNING_SPEED : WALKING_SPEED;

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

		const imageWidth = frameWidth * scale;
		const imageHeight = frameHeight * scale;

		const relativeX = this.position.positionInPx.x - playerPosition.x;
		const relativeY = this.position.positionInPx.y - playerPosition.y;

		const { centerX, centerY, offsetX, offsetY } = center
			? center
			: centerObject(ctx, scale, scale, playerPosition, 16, 16, mapDim);

		const mapTileSize = 16 * 2.8;
		const baseX = centerX - offsetX + relativeX;
		const baseY = centerY - offsetY + relativeY;

		const spriteOffsetX = (imageWidth - mapTileSize - 16) / 2;
		// bottomOffset = pixels of empty space below sprite's feet in the frame
		const bottomOffsetScaled = spriteInfo.bottomOffset * scale;
		const spriteOffsetY = imageHeight - mapTileSize - bottomOffsetScaled;

		ctx.drawImage(
			image,
			sX,
			sY,
			frameWidth,
			drawGrass ? frameHeight * 0.85 : frameHeight,
			baseX - spriteOffsetX,
			baseY - spriteOffsetY,
			imageWidth,
			drawGrass ? imageHeight * 0.85 : imageHeight
		);
		return { centerX, centerY, offsetX, offsetY };
	}
}

//todo: make interactive
export class PokeWalkerSpriteDrawer {
	private images: Record<string, HTMLImageElement> = {};
	private animDataFile: PMDAnimDataFile | null = null;
	private spriteInfo: PMDSpriteInfo | null = null;
	private animDataLoading: boolean = false;
	private currentPokemonId: number = 0;
	private currentIsShiny: boolean = false;
	private shinySpritesAvailable: boolean | null = null;
	private frames = { max: 4, val: 0, elapsed: 0 };

	draw(
		ctx: CanvasRenderingContext2D,
		playerPosition: Position,
		orientation: 'up' | 'down' | 'left' | 'right',
		scale: number,
		moving: boolean,
		walkerPosition: Position,
		pokemon: PokemonInstance,
		mapDim: {
			width: number;
			height: number;
		},
		_drawGrass: boolean = true
	) {
		const pokemonId = pokemon.regionalId;
		const isShiny = pokemon.isShiny && this.shinySpritesAvailable !== false;
		const source = getPMDSpritePath(pokemonId, 'Walk', isShiny);
		let image = this.images[source];

		if (this.currentPokemonId !== pokemonId || this.currentIsShiny !== isShiny) {
			this.currentPokemonId = pokemonId;
			this.currentIsShiny = isShiny;
			this.animDataFile = null;
			this.spriteInfo = null;
			this.animDataLoading = false;
		}

		if (!this.animDataFile && !this.animDataLoading) {
			this.animDataLoading = true;
			const cached = getCachedAnimData(pokemonId, isShiny);
			if (cached) {
				this.animDataFile = cached;
				this.spriteInfo = getPMDSpriteInfoFromAnimData(cached, 'Walk', pokemonId);
				this.frames.max = this.spriteInfo.frameCount;
				this.animDataLoading = false;
				this.shinySpritesAvailable = true;
			} else {
				loadAnimData(pokemonId, isShiny).then((data) => {
					if (data) {
						this.animDataFile = data;
						this.spriteInfo = getPMDSpriteInfoFromAnimData(data, 'Walk', pokemonId);
						this.frames.max = this.spriteInfo.frameCount;
						this.shinySpritesAvailable = true;
					} else if (isShiny) {
						this.shinySpritesAvailable = false;
						loadAnimData(pokemonId, false).then((normalData) => {
							this.animDataFile = normalData;
							this.spriteInfo = getPMDSpriteInfoFromAnimData(normalData, 'Walk', pokemonId);
							this.frames.max = this.spriteInfo?.frameCount ?? 4;
						});
					}
					this.animDataLoading = false;
				});
			}
		}

		if (image && image.complete && this.spriteInfo) {
			this.drawPMDImage(
				ctx,
				image,
				playerPosition,
				orientation,
				scale,
				moving,
				walkerPosition,
				mapDim
			);
		} else if (!image) {
			image = new Image();
			image.src = source;
			image.onload = () => {
				this.images[source] = image;
			};
		}
	}

	private drawPMDImage(
		ctx: CanvasRenderingContext2D,
		image: HTMLImageElement,
		playerPosition: Position,
		orientation: 'up' | 'down' | 'left' | 'right',
		scale: number,
		moving: boolean,
		walkerPosition: Position,
		mapDim: {
			width: number;
			height: number;
		}
	) {
		if (moving) {
			if (this.frames.max > 1) {
				this.frames.elapsed += 1;
			}
			this.frames.val += 1;
			if (this.frames.val > this.frames.max - 1) {
				this.frames.val = 0;
			}
		} else {
			this.frames.val = 0;
		}

		const info = this.spriteInfo!;
		const frameWidth = info.frameWidth;
		const frameHeight = info.frameHeight;

		const directionRow = PMD_DIRECTION_MAP[orientation];
		const sX = this.frames.val * frameWidth;
		const sY = directionRow * frameHeight;

		const relativeX = walkerPosition.x - playerPosition.x;
		const relativeY = walkerPosition.y - playerPosition.y;

		const centered = centerObject(ctx, scale, scale, playerPosition, 16, 16, mapDim);
		const { centerX, centerY } = centered;
		let { offsetX, offsetY } = centered;
		offsetY -= relativeY - 6;
		offsetX -= relativeX;

		ctx.save();
		ctx.translate(centerX - offsetX, centerY - offsetY);

		ctx.drawImage(
			image,
			sX,
			sY,
			frameWidth,
			frameHeight,
			0,
			0,
			frameWidth * scale,
			frameHeight * scale
		);
		ctx.restore();
	}
}
