/**
 * DungeonService - Handles dungeon floor generation, transitions, and legendary rooms.
 * Extracted from GameContext to reduce its size.
 */
import type { GameContext } from '../gameContext';
import type { SavesHolder } from '../savesHolder';
import { DungeonContext, dungeonContext } from '../../dungeon/dungeon-context';
import { generateFloor, type FloorData } from '../../dungeon/floor-generator';
import { generateRestFloor, generateBossFloor } from '../../dungeon/special-floors';
import { generateLegendaryRoom } from '../../dungeon/legendary-room';
import { getBiomeForFloor } from '../../dungeon/biomes';
import { populateFloor } from '../../dungeon/trainer-factory';
import { placeItems as placeDungeonItems } from '../../dungeon/item-placer';
import { persistDungeonState } from '../../dungeon/dungeon-save';
import {
	registerThrelteMap,
	clearThrelteMapCache,
	getThrelteMap
} from '../../mapping/threlte-maps/threlte-map-registry';
import { TileType3D } from '../../mapping/threlte-maps/types';
import { SeededRNG } from '../../dungeon/prng';
import { OverworldItem } from '../../items/overworldItem';
import { CustomScriptable, Dialog, Message, Script } from '../../scripting/scripts';
import { Position } from '../../mapping/positions';
import { get } from 'svelte/store';
import { PROLOGUE_MAP_ID } from '../../mapping/prologue-map';
import { delay } from '../../utils/async-utils';

export class DungeonService {

	generateFloorData(ctx: GameContext, dungeonCtx: DungeonContext): FloorData {
		const floor = dungeonCtx.currentFloor;

		if (dungeonCtx.isFloorRest(floor)) {
			return generateRestFloor(floor, dungeonCtx.runSeed);
		}

		if (dungeonCtx.isFloorBoss(floor)) {
			return generateBossFloor(floor, dungeonCtx.runSeed);
		}

		const biome = getBiomeForFloor(floor);
		const floorData = generateFloor(dungeonCtx.runSeed, floor, biome);

		if (floor === 1 && !dungeonCtx.starterPicked && !dungeonCtx.prologueCompleted) {
			const STARTERS = [1, 4, 7];
			const rng = new SeededRNG(dungeonCtx.runSeed + '-starter');
			const starterId = rng.pick(STARTERS);
			const starterBall = new OverworldItem(
				'Pokeball',
				true,
				floorData.starterItemPosition,
				'src/assets/menus/pokeball.png',
				undefined,
				[
					new Script('onInteract', [
						new Dialog([new Message('You found a starter Pokemon!', 'System')]),
						new CustomScriptable((gameCtx: GameContext) => {
							const pokemon = gameCtx.POKEDEX.findById(starterId).result?.instanciate(5);
							if (pokemon) {
								gameCtx.player.monsters.push(pokemon);
								gameCtx.player.setFollower(pokemon);
								gameCtx.POKEDEX.setCaught(starterId);
								dungeonCtx.starterPicked = true;
								gameCtx.updateMenuAvailability();
							}
						})
					])
				]
			);
			floorData.openMap.items.push(starterBall);
		}

		const populateRng = new SeededRNG(dungeonCtx.runSeed + '-populate-' + floor);
		const npcs = populateFloor(floorData, floor, biome, populateRng);
		floorData.openMap.npcs.push(...npcs);
		const dungeonItems = placeDungeonItems(floorData.itemPositions, floor, populateRng);
		floorData.openMap.items.push(...dungeonItems);

		// Legendary side room
		const legendaryId = dungeonCtx.legendaryFloors.get(floor);
		console.log(`[Legendary] floor=${floor} legendaryId=${legendaryId}`);
		if (legendaryId !== undefined) {
			const alreadyEncountered = dungeonCtx.encounteredLegendaries.has(legendaryId);
			const portalResult = this.findLegendaryPortalPosition(floorData, populateRng);
			console.log(`[Legendary] floor=${floor} portalResult=`, portalResult);
			if (portalResult) {
				const { pos: portalPos, wallPos } = portalResult;
				const { sideRoomFloorData, mainFloorJonction } = generateLegendaryRoom(
					floor,
					legendaryId,
					floorData.openMap.mapId,
					portalPos,
					wallPos,
					alreadyEncountered
				);
				registerThrelteMap(sideRoomFloorData.threlteMap.mapId, sideRoomFloorData.threlteMap);
				ctx.MAPS[sideRoomFloorData.openMap.mapId] = sideRoomFloorData.openMap;
				floorData.openMap.jonctions.push(mainFloorJonction);
				floorData.openMap.removeCollisionAt(wallPos.y * floorData.threlteMap.width + wallPos.x);
				if (!floorData.threlteMap.legendaryPortals) floorData.threlteMap.legendaryPortals = [];
				floorData.threlteMap.legendaryPortals.push({ x: wallPos.x, y: wallPos.y });
			}
		}

		return floorData;
	}

	private findLegendaryPortalPosition(
		floorData: FloorData,
		rng: SeededRNG
	): { pos: Position; wallPos: Position } | undefined {
		const { threlteMap, playerStart, stairsPosition } = floorData;
		const { width, height, tiles } = threlteMap;

		interface Candidate {
			pos: Position;
			wallPos: Position;
			score: number;
		}
		const candidates: Candidate[] = [];

		for (let y = 2; y < height - 1; y++) {
			for (let x = 1; x < width - 1; x++) {
				const tile = tiles[y][x];
				if (tile !== TileType3D.DUNGEON_FLOOR && tile !== TileType3D.REST_FLOOR) continue;
				const distPlayer = Math.abs(x - playerStart.x) + Math.abs(y - playerStart.y);
				const distStairs = Math.abs(x - stairsPosition.x) + Math.abs(y - stairsPosition.y);
				if (distPlayer < 5 || distStairs < 3) continue;

				if (tiles[y - 1]?.[x] !== TileType3D.WALL) continue;

				const topQuarter = Math.floor(height / 4);
				const topHalf    = Math.floor(height / 2);
				const score = y <= topQuarter ? 3 : y <= topHalf ? 2 : 1;
				candidates.push({ pos: new Position(x, y), wallPos: new Position(x, y - 1), score });
			}
		}

		if (candidates.length === 0) return undefined;

		const bestScore = Math.max(...candidates.map(c => c.score));
		const pool = candidates.filter(c => c.score === bestScore);
		return rng.shuffle(pool)[0];
	}

	async changeFloor(ctx: GameContext, dungeonCtx: DungeonContext, savesHolder?: SavesHolder): Promise<void> {
		if (savesHolder) ctx.savesHolder = savesHolder;

		if (!dungeonCtx.prologueCompleted && ctx.map?.mapId === PROLOGUE_MAP_ID) {
			dungeonCtx.advanceFloor();
			const floorData = this.generateFloorData(ctx, dungeonCtx);
			registerThrelteMap(floorData.threlteMap.mapId, floorData.threlteMap);
			ctx.MAPS[floorData.openMap.mapId] = floorData.openMap;
			dungeonContext.set(dungeonCtx);
			if (savesHolder) {
				persistDungeonState(dungeonCtx, savesHolder);
			}
			return;
		}

		ctx.overWorldContext.setPaused(true, 'dungeon-floor-transition');
		ctx.audioManager.fadeOutMapSound();
		ctx.scriptRunner.interruptCurrent();
		ctx.map?.npcs.forEach((npc) => npc.movingScript?.interrupt());
		ctx.scriptRunner.clear();
		ctx.overWorldContext.changingMap = true;

		await delay(500);

		const previousMapId = 1000 + dungeonCtx.currentFloor;
		dungeonCtx.advanceFloor();
		const floorData = this.generateFloorData(ctx, dungeonCtx);

		clearThrelteMapCache(previousMapId);
		registerThrelteMap(floorData.threlteMap.mapId, floorData.threlteMap);
		ctx.MAPS[floorData.openMap.mapId] = floorData.openMap;

		ctx.map = floorData.openMap;
		ctx.overWorldContext.map = floorData.openMap;

		const activeSave = savesHolder?.getActiveSave?.();
		const savedPos =
			activeSave?.dungeonFloor === dungeonCtx.currentFloor &&
			activeSave.dungeonPlayerX !== undefined &&
			activeSave.dungeonPlayerY !== undefined
				? new Position(activeSave.dungeonPlayerX, activeSave.dungeonPlayerY)
				: null;
		ctx.player.position.setPosition(savedPos ?? floorData.playerStart);

		const allScripts = ctx.scriptRunner.collectAllScripts(
			floorData.openMap.scripts,
			floorData.openMap.npcs
		);
		ctx.scriptRunner.indexScripts(allScripts);

		dungeonContext.set(dungeonCtx);

		if (savesHolder) {
			persistDungeonState(dungeonCtx, savesHolder);
		}

		await delay(500);

		ctx.overWorldContext.changingMap = false;
		ctx.overWorldContext.setPaused(false, 'dungeon-floor-transition');
		ctx.playMapSound();
	}

	async jumpToFloor(ctx: GameContext, targetFloor: number, dungeonCtx: DungeonContext): Promise<void> {
		if (!dungeonCtx.isRunActive) return;

		ctx.overWorldContext.setPaused(true, 'dungeon-floor-transition');
		ctx.audioManager.fadeOutMapSound();
		ctx.scriptRunner.interruptCurrent();
		ctx.map?.npcs.forEach((npc) => npc.movingScript?.interrupt());
		ctx.scriptRunner.clear();
		ctx.overWorldContext.changingMap = true;

		await delay(500);

		const previousMapId = 1000 + dungeonCtx.currentFloor;
		dungeonCtx.currentFloor = targetFloor;
		dungeonCtx.currentBiome = getBiomeForFloor(targetFloor);

		const floorData = this.generateFloorData(ctx, dungeonCtx);

		clearThrelteMapCache(previousMapId);
		registerThrelteMap(floorData.threlteMap.mapId, floorData.threlteMap);
		ctx.MAPS[floorData.openMap.mapId] = floorData.openMap;

		ctx.map = floorData.openMap;
		ctx.overWorldContext.map = floorData.openMap;
		ctx.player.position.setPosition(floorData.playerStart);

		const allScripts = ctx.scriptRunner.collectAllScripts(
			floorData.openMap.scripts,
			floorData.openMap.npcs
		);
		ctx.scriptRunner.indexScripts(allScripts);

		dungeonContext.set(dungeonCtx);

		await delay(500);

		ctx.overWorldContext.changingMap = false;
		ctx.overWorldContext.setPaused(false, 'dungeon-floor-transition');
		ctx.playMapSound();
	}

	async restartFloor(ctx: GameContext, dungeonCtx: DungeonContext): Promise<void> {
		ctx.overWorldContext.changingMap = true;
		ctx.scriptRunner.interruptCurrent();
		ctx.map?.npcs.forEach((npc) => npc.movingScript?.interrupt());
		ctx.scriptRunner.clear();

		const currentMapId = 1000 + dungeonCtx.currentFloor;
		dungeonCtx.defeatedTrainers.clear();
		dungeonCtx.pickedItems.clear();

		const floorData = this.generateFloorData(ctx, dungeonCtx);

		clearThrelteMapCache(currentMapId);
		registerThrelteMap(floorData.threlteMap.mapId, floorData.threlteMap);
		ctx.MAPS[floorData.openMap.mapId] = floorData.openMap;

		ctx.map = floorData.openMap;
		ctx.overWorldContext.map = floorData.openMap;
		ctx.player.position.setPosition(floorData.playerStart);

		const allScripts = ctx.scriptRunner.collectAllScripts(
			floorData.openMap.scripts,
			floorData.openMap.npcs
		);
		ctx.scriptRunner.indexScripts(allScripts);

		dungeonContext.set(dungeonCtx);

		await delay(500);
		ctx.overWorldContext.changingMap = false;
	}

	/**
	 * Check if the player is at a floor door and handle the transition.
	 * Returns true if a door was found and transition started.
	 */
	checkFloorDoor(ctx: GameContext, futureX: number, futureY: number): boolean {
		const threlteMap = ctx.map ? getThrelteMap(ctx.map.mapId) : undefined;
		if (
			threlteMap &&
			threlteMap.tiles[futureY]?.[futureX] === TileType3D.WALL &&
			threlteMap.tiles[futureY + 1]?.[futureX] === TileType3D.STAIRS_DOWN
		) {
			const dc = get(dungeonContext);
			if (dc?.isDungeonMode) {
				if (dc.isFloorBoss(dc.currentFloor)) {
					const bossId = `boss_floor_${dc.currentFloor}`;
					if (!dc.defeatedTrainers.has(bossId)) {
						ctx.playScript(
							new Script('onStep', [
								new Dialog([new Message('The way forward is blocked. Defeat the boss first!')])
							])
						);
						return true;
					}
				}
				this.changeFloor(ctx, dc);
				return true;
			}
		}
		return false;
	}
}
