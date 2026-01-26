import { Pokedex, PokemonInstance } from '../pokemons/pokedex';
import { OpenMap } from '../mapping/maps';
import {
	generateRoguelikeRoom,
	areAllTrainersDefeated,
	unlockRoomExits,
	spawnMerchantOnMap,
	type RoguelikeRoomConfig,
	type GeneratedRoom
} from './roguelike-map-factory';
import {
	type RunState,
	type RunConfig,
	EncounterType,
	RoomTheme,
	DEFAULT_RUN_CONFIG,
	type RoomExit
} from './types';

export interface RoomTracker {
	roomId: string;
	floor: number;
	encounterType: EncounterType;
	theme: RoomTheme;
	trainerNpcIds: number[];
	cleared: boolean;
}

export class RunManager {
	private state: RunState;
	private config: RunConfig;
	private pokedex: Pokedex;
	private currentGeneratedRoom: GeneratedRoom | null = null;
	private currentRoomTracker: RoomTracker | null = null;
	private defeatedNpcIds: Set<number> = new Set();
	private roomCounter: number = 0;
	private seed: number;

	constructor(starterPokemonId: number, seed?: number, config: RunConfig = DEFAULT_RUN_CONFIG) {
		const actualSeed = seed ?? Date.now();
		this.config = config;
		this.pokedex = new Pokedex();
		this.seed = actualSeed;

		const starter = this.createPokemon(starterPokemonId, 5);

		this.state = {
			id: `run_${actualSeed}`,
			seed: actualSeed,
			currentFloor: 1,
			currentRoom: null,
			team: starter ? [starter] : [],
			starterPokemonId,
			money: config.startingMoney,
			itemsCollected: [],
			roomsCleared: 0,
			isActive: true
		};
	}

	private createPokemon(id: number, level: number): PokemonInstance | null {
		const result = this.pokedex.findById(id);
		if (!result.result || result.result.id === 0) {
			return null;
		}
		return result.result.instanciate(level);
	}

	private getThemeForFloor(floor: number): RoomTheme {
		const themes = this.config.themeProgression;
		const index = Math.min(floor - 1, themes.length - 1);
		return themes[index];
	}

	private selectEncounterType(roomsCleared: number): EncounterType {
		if (roomsCleared === 0) {
			return EncounterType.TRAINER_BATTLE;
		}

		if (roomsCleared > 0 && roomsCleared % this.config.bossEveryNRooms === 0) {
			return EncounterType.BOSS;
		}

		const weights = this.config.encounterWeights;
		const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
		let random = Math.random() * total;

		for (const [type, weight] of Object.entries(weights)) {
			if (type === EncounterType.BOSS) continue;
			random -= weight;
			if (random <= 0) {
				return type as EncounterType;
			}
		}

		return EncounterType.WILD_BATTLE;
	}

	private generateExits(roomsCleared: number): RoomExit[] {
		const isFloorEnd = (roomsCleared + 1) % this.config.roomsPerFloor === 0;
		const isRunEnd =
			this.state.currentFloor >= this.config.maxFloors &&
			(roomsCleared + 1) % this.config.roomsPerFloor === 0;

		if (isRunEnd) {
			return [];
		}

		const exits: RoomExit[] = [
			{ direction: 'north', nextRoomType: this.selectEncounterType(roomsCleared + 1) }
		];

		if (!isFloorEnd && Math.random() > 0.5) {
			exits.push({
				direction: 'east',
				nextRoomType: this.selectEncounterType(roomsCleared + 1)
			});
		}

		return exits;
	}

	getState(): RunState {
		return this.state;
	}

	startRun(): OpenMap {
		return this.generateNextRoom();
	}

	private generateNextRoom(): OpenMap {
		this.roomCounter++;
		const roomId = `room_${this.roomCounter}`;
		const theme = this.getThemeForFloor(this.state.currentFloor);
		const encounterType = this.selectEncounterType(this.state.roomsCleared);
		const exits = this.generateExits(this.state.roomsCleared);

		const trainerCount =
			encounterType === EncounterType.TRAINER_BATTLE ? Math.floor(Math.random() * 3) + 1 : 0;

		const config: RoguelikeRoomConfig = {
			roomId,
			floor: this.state.currentFloor,
			theme,
			encounterType,
			trainerCount,
			exits,
			seed: this.seed + this.roomCounter * 1000
		};

		this.currentGeneratedRoom = generateRoguelikeRoom(config);

		this.currentRoomTracker = {
			roomId,
			floor: this.state.currentFloor,
			encounterType,
			theme,
			trainerNpcIds: this.currentGeneratedRoom.trainerNpcIds,
			cleared: false
		};

		return this.currentGeneratedRoom.map;
	}

	getCurrentMap(): OpenMap | null {
		return this.currentGeneratedRoom?.map ?? null;
	}

	getTeam(): PokemonInstance[] {
		return this.state.team;
	}

	addPokemonToTeam(pokemon: PokemonInstance): boolean {
		if (this.state.team.length >= 6) {
			return false;
		}
		this.state.team.push(pokemon);
		return true;
	}

	removePokemonFromTeam(index: number): PokemonInstance | null {
		if (index < 0 || index >= this.state.team.length || this.state.team.length <= 1) {
			return null;
		}
		return this.state.team.splice(index, 1)[0];
	}

	onNpcDefeated(npcId: number): void {
		this.defeatedNpcIds.add(npcId);
		this.checkRoomCleared();
	}

	private checkRoomCleared(): void {
		if (!this.currentRoomTracker || !this.currentGeneratedRoom) return;

		const noTrainers = this.currentRoomTracker.trainerNpcIds.length === 0;
		const allDefeated = areAllTrainersDefeated(
			this.currentRoomTracker.trainerNpcIds,
			this.defeatedNpcIds
		);

		if (noTrainers || allDefeated) {
			this.currentRoomTracker.cleared = true;
			unlockRoomExits(this.currentGeneratedRoom.map);
			spawnMerchantOnMap(this.currentGeneratedRoom.map, this.state.currentFloor);
			this.state.roomsCleared++;
		}
	}

	isRoomCleared(): boolean {
		return this.currentRoomTracker?.cleared ?? false;
	}

	selectExit(_exitIndex: number): OpenMap | null {
		if (!this.currentRoomTracker?.cleared) {
			return null;
		}

		const isFloorEnd = this.state.roomsCleared % this.config.roomsPerFloor === 0;
		if (isFloorEnd) {
			this.state.currentFloor++;
		}

		return this.generateNextRoom();
	}

	addMoney(amount: number): void {
		this.state.money += amount;
	}

	spendMoney(amount: number): boolean {
		if (this.state.money < amount) {
			return false;
		}
		this.state.money -= amount;
		return true;
	}

	addItem(itemId: number): void {
		this.state.itemsCollected.push(itemId);
	}

	handleDefeat(): void {
		this.state.money = 0;
		this.state.isActive = false;
	}

	handleVictory(): void {
		this.state.isActive = false;
	}

	isRunComplete(): boolean {
		if (!this.currentRoomTracker) return false;

		const isCleared = this.currentRoomTracker.cleared;
		const noExits = this.currentGeneratedRoom?.map.jonctions.length === 0;
		const maxFloorReached = this.state.currentFloor >= this.config.maxFloors;
		const floorComplete = this.state.roomsCleared % this.config.roomsPerFloor === 0;

		return isCleared && noExits && maxFloorReached && floorComplete;
	}

	isTeamWiped(): boolean {
		return this.state.team.every((pokemon) => pokemon.currentHp <= 0);
	}

	healTeam(): void {
		for (const pokemon of this.state.team) {
			pokemon.currentHp = pokemon.stats.hp;
			pokemon.status = undefined;
		}
	}

	generateWildPokemon(monsterId: number, levelRange: [number, number]): PokemonInstance | null {
		const level = Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1)) + levelRange[0];
		return this.createPokemon(monsterId, level);
	}

	getEncounterDescription(): string {
		if (!this.currentRoomTracker) return 'No room';

		switch (this.currentRoomTracker.encounterType) {
			case EncounterType.WILD_BATTLE:
				return 'A wild Pokemon appears!';
			case EncounterType.TRAINER_BATTLE:
				return 'Trainers block your path!';
			case EncounterType.CATCH_EVENT:
				return 'A rare Pokemon appeared! You might be able to catch it...';
			case EncounterType.SHOP:
				return 'A traveling merchant is here.';
			case EncounterType.HEAL:
				return 'A rest area. Your Pokemon can recover here.';
			case EncounterType.BOSS:
				return 'A powerful trainer blocks your path!';
			case EncounterType.TREASURE:
				return 'You found a treasure chest!';
			default:
				return 'Unknown encounter';
		}
	}

	getRoomInfo(): { floor: number; roomsCleared: number; theme: RoomTheme } | null {
		if (!this.currentRoomTracker) return null;
		return {
			floor: this.state.currentFloor,
			roomsCleared: this.state.roomsCleared,
			theme: this.currentRoomTracker.theme
		};
	}
}
