import { writable, type Writable } from 'svelte/store';
import { RunManager } from './run-manager';
import { RoomTheme } from './types';
import { Player, ComboJauge } from '../characters/player';
import { Bag } from '../items/bag';
import { MapSave, type OpenMap } from '../mapping/maps';
import type { PokemonInstance } from '../pokemons/pokedex';
import { PokemonBox } from '../pokemons/boxes';
import { Settings } from '../characters/settings';
import { SaveContext } from '../context/savesHolder';
import { FlagEntry, Flags } from '../scripting/quests';
import { GameContext } from '../context/gameContext';

export enum RoguelikePhase {
	STARTER_SELECT = 'STARTER_SELECT',
	PLAYING = 'PLAYING',
	VICTORY = 'VICTORY',
	DEFEAT = 'DEFEAT'
}

export interface RoguelikeState {
	phase: RoguelikePhase;
	floor: number;
	roomsCleared: number;
	money: number;
	theme: RoomTheme;
	team: PokemonInstance[];
	isRoomCleared: boolean;
}

export class RoguelikeContext {
	phase: Writable<RoguelikePhase> = writable(RoguelikePhase.STARTER_SELECT);
	runManager: RunManager | null = null;
	currentMap: Writable<OpenMap | null> = writable(null);
	runState: Writable<RoguelikeState | null> = writable(null);
	player: Writable<Player | null> = writable(null);

	private _player: Player | null = null;

	getPlayer(): Player | null {
		return this._player;
	}

	async startRun(starterPokemonId: number, playerName: string = 'Player'): Promise<OpenMap | null> {
		const seed = Date.now();
		this.runManager = new RunManager(starterPokemonId, seed);

		this._player = new Player(
			1,
			playerName,
			'MALE',
			[...this.runManager.getTeam()],
			new Bag(),
			1,
			false,
			new ComboJauge()
		);
		this._player.bag.money = this.runManager.getState().money;

		this.player.set(this._player);

		const map = this.runManager.startRun();
		if (!map) return null;

		await map.preloadBackground();

		this._player.position.positionOnMap = map.playerInitialPosition;
		this._player.position.targetPosition = { ...map.playerInitialPosition };

		this.currentMap.set(map);
		this.updateRunState();

		return map;
	}

	private updateRunState(): void {
		if (!this.runManager) return;

		const state = this.runManager.getState();
		const roomInfo = this.runManager.getRoomInfo();

		this.runState.set({
			phase: RoguelikePhase.PLAYING,
			floor: roomInfo?.floor ?? 1,
			roomsCleared: roomInfo?.roomsCleared ?? 0,
			money: state.money,
			theme: roomInfo?.theme ?? RoomTheme.FOREST,
			team: state.team,
			isRoomCleared: this.runManager.isRoomCleared()
		});
	}

	onNpcDefeated(npcId: number): void {
		if (!this.runManager) return;

		this.runManager.onNpcDefeated(npcId);
		this.updateRunState();

		if (this.runManager.isRunComplete()) {
			this.runManager.handleVictory();
			this.phase.set(RoguelikePhase.VICTORY);
		}
	}

	onPlayerDefeated(): void {
		if (!this.runManager) return;

		this.runManager.handleDefeat();
		this.phase.set(RoguelikePhase.DEFEAT);
	}

	proceedToNextRoom(exitIndex: number = 0): OpenMap | null {
		if (!this.runManager || !this._player) return null;

		if (!this.runManager.isRoomCleared()) {
			return null;
		}

		const nextMap = this.runManager.selectExit(exitIndex);
		if (!nextMap) return null;

		this._player.position.positionOnMap = nextMap.playerInitialPosition;
		this._player.position.targetPosition = { ...nextMap.playerInitialPosition };

		this.currentMap.set(nextMap);
		this.updateRunState();

		return nextMap;
	}

	getCurrentMap(): OpenMap | null {
		return this.runManager?.getCurrentMap() ?? null;
	}

	isRoomCleared(): boolean {
		return this.runManager?.isRoomCleared() ?? false;
	}

	getEncounterDescription(): string {
		return this.runManager?.getEncounterDescription() ?? '';
	}

	addMoney(amount: number): void {
		if (!this.runManager || !this._player) return;
		this.runManager.addMoney(amount);
		this._player.bag.money = this.runManager.getState().money;
		this.updateRunState();
	}

	syncPlayerTeam(): void {
		if (!this.runManager || !this._player) return;
		this._player.monsters = [...this.runManager.getTeam()];
		this.updateRunState();
	}

	reset(): void {
		this.runManager = null;
		this._player = null;
		this.currentMap.set(null);
		this.runState.set(null);
		this.player.set(null);
		this.phase.set(RoguelikePhase.STARTER_SELECT);
	}

	createSaveContext(map: OpenMap): SaveContext {
		if (!this._player) {
			throw new Error('Player not initialized');
		}

		const mapSave = new MapSave(map.mapId, []);
		const flags = new Flags();
		flags.setFlag(FlagEntry.RUNNING_SHOES_UNLOCKED, true);

		return new SaveContext(
			Date.now(),
			Date.now(),
			mapSave,
			this._player,
			[new PokemonBox('Box 1', [])],
			new Settings(),
			false,
			[],
			[],
			[],
			flags,
			map,
			true,
			true
		);
	}

	createGameContext(map: OpenMap): GameContext {
		const saveContext = this.createSaveContext(map);
		return new GameContext(saveContext);
	}
}

export const roguelikeContext = new RoguelikeContext();
