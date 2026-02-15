<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '@threlte/core';
	import Menu from '../menus/Menu.svelte';
	import DialogView from '../common/DialogView.svelte';
	import type { Dialog, OpenShop, Script, Scriptable } from '../../js/scripting/scripts';
	import type { GameContext } from '../../js/context/gameContext';
	import { type OverworldContext } from '../../js/context/overworldContext';
	import type { SavesHolder } from '../../js/context/savesHolder';
	import ScenesView from '../world/ScenesView.svelte';
	import Controls from '../world/Controls.svelte';
	import type { BattleContext } from '../../js/context/battleContext';
	import Shop from '../common/Shop.svelte';
	import { backInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	import InstancedTerrain from './InstancedTerrain.svelte';
	import PlayerSprite3D from './PlayerSprite3D.svelte';
	import NPCSprite3D from './NPCSprite3D.svelte';
	import OverworldItem3D from './OverworldItem3D.svelte';
	import OverworldSpawn3D from './OverworldSpawn3D.svelte';
	import FollowerSprite3D from './FollowerSprite3D.svelte';
	import type { Follower } from '$js/characters/follower';
	import GameCamera3D from './GameCamera3D.svelte';
	import Renderer3D from './Renderer3D.svelte';
	import Lighting3D from './Lighting3D.svelte';
	import WeatherParticles3D from './WeatherParticles3D.svelte';
	import BattleDustParticles3D from './BattleDustParticles3D.svelte';
	import BattleWindStreaks3D from './BattleWindStreaks3D.svelte';
	import Decorations3D from './Decorations3D.svelte';
	import { getThrelteMap } from '$js/mapping/threlte-maps/threlte-map-registry';
	import { getOrConvertMap } from '$js/mapping/threlte-maps/openmap-converter';
	import DungeonMinimap from '../world/DungeonMinimap.svelte';
	import { ExplorationTracker } from '$js/dungeon/exploration-tracker';
	import { dungeonContext } from '$js/dungeon/dungeon-context';
	import type { BiomeConfig } from '$js/dungeon/biomes';
	import { TileType3D } from '$js/mapping/threlte-maps/types';
	import { getLightingMood } from '$js/lighting/biome-lighting';

	/**
	 * 3D Overworld component.
	 * Replaces World.svelte with Threlte 3D canvas while preserving all DOM overlays.
	 */

	interface Props {
		context: GameContext;
		overWorldCtx: OverworldContext;
		savesHolder: SavesHolder;
	}

	const { context, overWorldCtx, savesHolder }: Props = $props();

	// Mobile device pixel ratio optimization
	const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
	const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio;

	// Polled reactive state for map, follower and running (plain class properties not reactive in Svelte 5)
	let currentMap = $state(context.map);
	let currentFollower = $state<Follower | undefined>(context.player.follower);
	let playerIsRunning = $state(false);
	let isChangingMap = $state(false);

	// Resolve ThrelteMapData from the current map
	let mapData = $derived(getThrelteMap(currentMap.mapId) ?? getOrConvertMap(currentMap));

	// Visual position for player sprite, bound from PlayerSprite3D and passed to GameCamera3D
	let playerVisualPosition = $state({ x: 0, y: 0, z: 0 });

	let wrapper: HTMLDivElement;
	const canvasWidth: number = 1024;
	let currentMessages: string[] = $state([]);

	// Dungeon minimap state - extract primitives to avoid same-reference $state reactivity issues
	let isDungeonMode = $state(false);
	let currentDungeonFloor = $state(0);
	let currentDungeonBiome = $state<BiomeConfig | undefined>(undefined);
	let dungeonFloorType = $state<'normal' | 'rest' | 'boss'>('normal');
	let playerGridX = $state(0);
	let playerGridY = $state(0);
	let explorationTracker = $state<ExplorationTracker | undefined>(undefined);
	let lastTrackedFloor = 0;
	let isGamePaused = $state(false);

	/*
	Scripts - subscribe to reactive store
	 */
	let currentScript = $state<Script | undefined>(undefined);
	let currentAction = $state<Scriptable | undefined>(undefined);
	let actionUnsubscribe: (() => void) | undefined;

	$effect(() => {
		const unsub = context.scriptRunner.playingScript$.subscribe((script) => {
			currentScript = script;

			// Unsubscribe from previous script's currentAction
			actionUnsubscribe?.();

			if (script) {
				// Subscribe to currentAction$ store
				actionUnsubscribe = script.currentAction$.subscribe((action) => {
					currentAction = action;
				});
			} else {
				currentAction = undefined;
			}
		});
		return () => {
			unsub();
			actionUnsubscribe?.();
		};
	});

	const currentDialog = $derived(
		currentAction?.type === 'Dialog' ? (currentAction as Dialog) : undefined
	);
	const hasDialog = $derived(currentAction?.type === 'Dialog');
	const hasShop = $derived(currentAction?.type === 'OpenShop');
	const currentShop = $derived(
		currentAction?.type === 'OpenShop' ? (currentAction as OpenShop) : undefined
	);
	const isHealing = $derived(currentAction?.type === 'HealAll');

	// spawned used for future Task 10 (items and spawns in 3D)
	const spawned = $derived(context.spawned);
	void spawned;

	// TEST -> TODO : smash rock, cut trees... using pkmn charge
	function handleChargeKeydown(e: KeyboardEvent) {
		if (e.key === 'c') {
			context.player.followerCharge(overWorldCtx, false);
		}
	}
	document.addEventListener('keydown', handleChargeKeydown);

	let battleCtx: BattleContext | undefined = $state(undefined);

	$effect(() => {
		if (context) {
			const unsubscribe = context.battleContext.subscribe((value) => {
				battleCtx = value;
			});
			return unsubscribe;
		}
		return undefined;
	});
	// battleCtx used for future battle integration
	// void battleCtx;

	// Subscribe to dungeon context store - extract primitives directly to avoid
	// same-reference reactivity issues (DungeonContext is mutated in-place and re-set)
	$effect(() => {
		const unsub = dungeonContext.subscribe((value) => {
			isDungeonMode = value?.isDungeonMode ?? false;
			currentDungeonFloor = value?.currentFloor ?? 0;
			currentDungeonBiome = value?.currentBiome;
			dungeonFloorType = value?.getCurrentFloorType() ?? 'normal';
		});
		return unsub;
	});

	let dungeonMapData = $derived(
		isDungeonMode && currentDungeonFloor > 0 ? getThrelteMap(1000 + currentDungeonFloor) : undefined
	);

	function findStairsPosition(
		tiles: TileType3D[][],
		width: number,
		height: number
	): { x: number; y: number } | undefined {
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				if (tiles[y][x] === TileType3D.STAIRS_DOWN) {
					return { x, y };
				}
			}
		}
		return undefined;
	}

	let stairsPos = $derived(
		dungeonMapData
			? findStairsPosition(dungeonMapData.tiles, dungeonMapData.width, dungeonMapData.height)
			: undefined
	);

	// ExplorationTracker lifecycle: create on dungeon entry, reset on floor change
	// Split into separate effects to avoid race conditions where isDungeonMode
	// toggling in a single reactive batch could destroy a just-created tracker.
	$effect(() => {
		if (
			isDungeonMode &&
			dungeonMapData &&
			currentDungeonFloor > 0 &&
			currentDungeonFloor !== lastTrackedFloor
		) {
			explorationTracker = new ExplorationTracker(dungeonMapData.width, dungeonMapData.height, 5);
			lastTrackedFloor = currentDungeonFloor;
			explorationTracker.updatePlayerPosition(playerGridX, playerGridY);
		}
	});

	// Clean up tracker when leaving dungeon mode
	$effect(() => {
		if (!isDungeonMode) {
			explorationTracker = undefined;
			lastTrackedFloor = 0;
		}
	});

	let currentLightingMood = $derived(
		isDungeonMode && currentDungeonBiome ? getLightingMood(currentDungeonBiome.name) : 'day'
	);

	// isChangingMap removed: the black overlay (.changing-map, z-index:100) already covers
	// the minimap (z-index:5) during map transitions, so the minimap can stay "visible"
	// underneath. Previously isChangingMap stayed true due to overlapping timers from
	// loadMap (GameContext constructor) and changeDungeonFloor, causing the minimap to
	// disappear permanently after briefly showing.
	let showDungeonMinimap = $derived(isDungeonMode && !battleCtx && !isGamePaused);

	onMount(() => {
		context.notifications.subscribe((value) => {
			currentMessages = value;
		});

		// Poll plain class properties into reactive $state for Svelte 5 template reactivity
		const pollInterval = setInterval(() => {
			const newFollower = context.player.follower;
			if (newFollower !== currentFollower) currentFollower = newFollower;

			const newRunning = context.player.running;
			if (newRunning !== playerIsRunning) playerIsRunning = newRunning;

			const newMap = context.map;
			if (newMap !== currentMap) currentMap = newMap;

			const newChangingMap = overWorldCtx.changingMap;
			if (newChangingMap !== isChangingMap) isChangingMap = newChangingMap;

			const newPaused = overWorldCtx.isPaused;
			if (newPaused !== isGamePaused) isGamePaused = newPaused;

			// Poll player grid position for dungeon minimap
			const newGridX = context.player.position.positionOnMap.x;
			const newGridY = context.player.position.positionOnMap.y;
			if (newGridX !== playerGridX || newGridY !== playerGridY) {
				playerGridX = newGridX;
				playerGridY = newGridY;
				if (explorationTracker) {
					explorationTracker.updatePlayerPosition(newGridX, newGridY);
				}
			}
		}, 100);

		return () => {
			clearInterval(pollInterval);
			document.removeEventListener('keydown', handleChargeKeydown);
		};
	});
</script>

<div
	class="world-wrapper"
	data-testid="world-screen"
	bind:this={wrapper}
	class:blur={overWorldCtx.scenes.wakeUp}
>
	<div class="canvas-wrapper">
		<Canvas autoRender={false} {dpr}>
			<Renderer3D />
			<Lighting3D mood={currentLightingMood} playerPosition={playerVisualPosition} />
			<WeatherParticles3D
				weatherType={context.weather?.type}
				running={context.weather?.running ?? false}
			/>
			<BattleDustParticles3D active={!!battleCtx} playerPosition={playerVisualPosition} />
			<BattleWindStreaks3D active={!!battleCtx} playerPosition={playerVisualPosition} />
			<GameCamera3D targetPosition={playerVisualPosition} {mapData} battleActive={!!battleCtx} />
			<InstancedTerrain
				{mapData}
				battleActive={!!battleCtx}
				playerPosition={playerVisualPosition}
			/>
			<Decorations3D {mapData} playerPosition={playerVisualPosition} battleActive={!!battleCtx} />
			{#if !battleCtx}
				<PlayerSprite3D
					player={context.player}
					{mapData}
					bind:visualPosition={playerVisualPosition}
				/>
				{#each currentMap.npcs as npc (npc.id)}
					<NPCSprite3D {npc} {mapData} />
				{/each}
				{#if currentFollower}
					<FollowerSprite3D follower={currentFollower} {mapData} running={playerIsRunning} />
				{/if}
				{#each currentMap.items as item (item.id ?? item.name)}
					<OverworldItem3D {item} {mapData} />
				{/each}
				{#if spawned}
					<OverworldSpawn3D spawn={spawned} {mapData} />
				{/if}
			{/if}
		</Canvas>
	</div>

	{#if !battleCtx}
		{#if dungeonMapData && explorationTracker}
			<DungeonMinimap
				tiles={dungeonMapData.tiles}
				width={dungeonMapData.width}
				height={dungeonMapData.height}
				playerX={playerGridX}
				playerY={playerGridY}
				{explorationTracker}
				floorNumber={currentDungeonFloor}
				biomeName={currentDungeonBiome?.name ?? ''}
				floorType={dungeonFloorType}
				tileColorOverrides={currentDungeonBiome?.tileColorOverrides}
				stairsX={stairsPos?.x}
				stairsY={stairsPos?.y}
				visible={showDungeonMinimap}
			/>
		{/if}

		<!-- <OverworldTeamPanel {context} /> -->

		<Menu {context} />
	{/if}

	{#if hasDialog}
		<DialogView dialog={currentDialog} {context} />
	{/if}
	{#if hasShop}
		<Shop shop={currentShop} {context} />
	{/if}

	<div class="healing" class:show={isHealing}></div>

	<div class="changing-map" class:show={isChangingMap}></div>

	{#if !battleCtx}
		<Controls {context} {overWorldCtx} {savesHolder} />
		<ScenesView {context} {canvasWidth} />

		{#if currentMessages.length > 0}
			<div
				class="notifications"
				in:slide={{ duration: 500, delay: 100, axis: 'y', easing: backInOut }}
				out:fade
			>
				{#each currentMessages as message}
					<div class="notification">{message}</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style lang="scss">
	.world-wrapper {
		position: absolute;
		width: 100dvw;
		height: 100dvh;
		overflow: hidden;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;

		.canvas-wrapper {
			position: absolute;
			inset: 0;
		}

		&.blur {
			animation: blurry 5s linear forwards;
		}

		.notifications {
			position: absolute;
			top: calc(5% + 56px);
			right: 1%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: flex-end;
			z-index: 7;

			.notification {
				background-color: rgba(0, 0, 0, 0.5);
				color: white;
				padding: 4px;
				border-radius: 4px;
				font-size: 16px;

				&:not(:last-child) {
					margin-bottom: 4px;
				}
			}
		}

		.healing {
			position: absolute;
			width: 100dvw;
			height: 100dvh;
			top: 0;
			left: 0;
			background-color: white;
			opacity: 0;
			transition: all 1s;
			z-index: -100;

			&.show {
				z-index: 100;
				opacity: 1;
			}
		}

		.changing-map {
			position: absolute;
			width: 100dvw;
			height: 100dvh;
			top: 0;
			left: 0;
			background-color: black;
			opacity: 0;
			transition: opacity 0.5s ease-in-out;
			z-index: 100;
			pointer-events: none;

			&.show {
				opacity: 1;
			}
		}
	}
</style>
