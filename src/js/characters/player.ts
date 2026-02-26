import { Pokedex, PokemonInstance } from '../pokemons/pokedex';
import { VolatileTracker } from '../pokemons/volatile-status';
import { Bag } from '../items/bag';
import { Position } from '../mapping/positions';
import { CHARACTER_SPRITES, PlayerSprite } from '../sprites/sprites';
import { type Character, CharacterPosition } from './characters-model';
import { Follower } from './follower';
import type { OverworldContext } from '../context/overworldContext';
import { Mastery, MasteryType, PlayerMasteries } from './mastery-model';
import { preloadFollowerSprite } from '../preload';
import { applyClassBonuses } from './trainer-class';
import { waitFor, delay } from '../utils/async-utils';

export class ComboJauge {
	public value: number = 0;
	public stored: number = 0;

	constructor(value: number = 0, stored: number = 0) {
		this.value = value;
		this.stored = stored;
	}

	public addValue(value: number) {
		this.value = this.value + value;
		if (this.value >= 100) {
			if (this.stored < 3) {
				this.stored++;
				this.value = this.value - 100;
			} else {
				this.value = 100;
			}
		}
	}

	public consume() {
		if (this.stored > 0) {
			this.stored--;
		}
	}
}

export class Player implements Character {
	public spriteId: number;
	public name: string;
	public gender: 'MALE' | 'FEMALE';
	public trainerClass: string = 'ace-trainer';
	public monsters: PokemonInstance[];
	public comboJauge: ComboJauge = new ComboJauge();
	public bag = new Bag();
	public lvl: number = 1;
	public moving: boolean = false;
	public running: boolean = false;
	public sprite: PlayerSprite;
	public position: CharacterPosition = new CharacterPosition();

	public playerMasteries: PlayerMasteries = new PlayerMasteries();

	// followerIdx (chose a monster to follow you TODO)
	public follower?: Follower;

	constructor(
		spriteId: number,
		name: string,
		gender: 'MALE' | 'FEMALE',
		monsters: PokemonInstance[],
		bag: Bag,
		lvl: number,
		moving: boolean,
		comboJauge: ComboJauge,
		masteries?: PlayerMasteries,
		follower?: Follower
	) {
		this.spriteId = spriteId;
		this.name = name;
		this.gender = gender;
		this.monsters = monsters;
		this.bag = bag;
		this.lvl = lvl;
		this.moving = moving;
		this.position = new CharacterPosition();
		this.sprite = CHARACTER_SPRITES.getSprite(spriteId);
		this.comboJauge = comboJauge;
		this.playerMasteries = PlayerMasteries.fromInstance(masteries);
		this.follower = follower;
	}

	public static fromScratch(
		spriteId: number,
		name: string,
		gender: 'MALE' | 'FEMALE',
		trainerClass: string = 'ace-trainer'
	): Player {
		const player = new Player(spriteId, name, gender, [], new Bag(), 1, false, new ComboJauge());
		player.trainerClass = trainerClass;
		applyClassBonuses(player.playerMasteries.bonuses, trainerClass);
		return player;
	}

	public static fromInstance(character: Player): Player {
		const player = new Player(
			character.spriteId,
			character.name,
			character.gender,
			character.monsters,
			character.bag,
			character.lvl,
			character.moving,
			character.comboJauge
				? new ComboJauge(character.comboJauge.value, character.comboJauge.stored)
				: new ComboJauge(),
			character.playerMasteries,
			character.follower
		);
		player.trainerClass = character.trainerClass || 'ace-trainer';
		return player;
	}

	public setPrototypes(pokedex?: Pokedex): Player {
		this.monsters.forEach((monster) => {
			Object.setPrototypeOf(monster, PokemonInstance.prototype);
			monster.rehydrate(pokedex);
			monster.volatiles = new VolatileTracker();
		});
		this.bag = new Bag(this.bag);
		if (this.follower) {
			this.follower = Follower.fromInstance(this.follower, pokedex);
		}
		return this;
	}

	setMastery(mastery: Mastery) {
		this.playerMasteries.setMastery(mastery);
		this.playerMasteries = PlayerMasteries.fromInstance(this.playerMasteries);
	}

	getMasteryBonus(type: MasteryType): number {
		return this.playerMasteries.bonuses.getMastery(type);
	}

	public setFollower(monster: PokemonInstance): Follower {
		this.follower = new Follower(
			new CharacterPosition(this.behindPlayer(), this.position.direction),
			monster
		);
		// Warm up the follower's sprite + AnimData.xml in the background
		preloadFollowerSprite(monster.regionalId, monster.isShiny);
		return this.follower;
	}

	public async followerCharge(context: OverworldContext, battle: boolean = true) {
		if (!this.follower) return;

		// Wait for follower to stop moving
		await waitFor(() => !!this.follower && !this.follower.moving, 100);
		if (!this.follower) return;

		context.setPaused(true, 'followerCharge');
		this.follower.moving = true;
		this.follower.position.direction = this.position.direction;
		const playerSide = this.aroundPlayer(this.playerSide());

		// Move follower to the side of the player
		await new Promise<void>((resolve) => {
			this.follower!.position.setFuturePosition(playerSide.x, playerSide.y, resolve);
		});

		if (!this.follower) { context.setPaused(false, 'followerCharge'); return; }

		// Move follower to the front of the player
		const playerFront = this.aroundPlayer(this.position.direction);
		this.follower.moving = true;
		await new Promise<void>((resolve) => {
			this.follower!.position.setFuturePosition(playerFront.x, playerFront.y, resolve);
		});

		// Wait for the charge animation
		await delay(battle ? 2000 : 800);

		if (!this.follower || this.moving) { context.setPaused(false, 'followerCharge'); return; }

		// Move follower back to the side
		this.follower.position.direction = this.followerOpositeDirection();
		this.follower.moving = true;
		await new Promise<void>((resolve) => {
			this.follower!.position.setFuturePosition(playerSide.x, playerSide.y, resolve);
		});

		if (!this.follower || this.moving) { context.setPaused(false, 'followerCharge'); return; }

		// Move follower back behind the player
		const playerBack = this.behindPlayer();
		this.follower.moving = true;
		await new Promise<void>((resolve) => {
			this.follower!.position.setFuturePosition(playerBack.x, playerBack.y, resolve);
		});

		if (this.follower) {
			this.follower.position.direction = this.followerOpositeDirection();
		}
		context.setPaused(false, 'followerCharge');
	}

	public followerOpositeDirection(): 'up' | 'down' | 'left' | 'right' {
		switch (this.follower?.position.direction) {
			case 'up':
				return 'down';
			case 'down':
				return 'up';
			case 'left':
				return 'right';
			case 'right':
				return 'left';
		}
		return 'down';
	}

	public playerSide(): 'up' | 'down' | 'left' | 'right' {
		switch (this.position.direction) {
			case 'up':
				return 'right';
			case 'down':
				return 'left';
			case 'left':
				return 'up';
			case 'right':
				return 'down';
		}
	}

	public aroundPlayer(direction: 'up' | 'down' | 'left' | 'right'): Position {
		let x = this.position.positionOnMap.x;
		let y = this.position.positionOnMap.y;
		switch (direction) {
			case 'up':
				y -= 1;
				break;
			case 'down':
				y += 1;
				break;
			case 'left':
				x -= 1;
				break;
			case 'right':
				x += 1;
				break;
		}
		return { x, y };
	}

	public behindPlayer(): Position {
		let x = this.position.positionOnMap.x;
		let y = this.position.positionOnMap.y;
		switch (this.position.direction) {
			case 'up':
				y += 1;
				break;
			case 'down':
				y -= 1;
				break;
			case 'left':
				x += 1;
				break;
			case 'right':
				x -= 1;
				break;
		}
		return { x, y };
	}

	public reverseDirection(): 'up' | 'down' | 'left' | 'right' {
		switch (this.position.direction) {
			case 'up':
				return 'down';
			case 'down':
				return 'up';
			case 'left':
				return 'right';
			case 'right':
				return 'left';
		}
	}
}
