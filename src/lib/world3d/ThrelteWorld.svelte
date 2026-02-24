<script lang="ts">
	import { onMount, untrack } from 'svelte';
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
	import { fade } from 'svelte/transition';

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
	import LegendaryParticles3D from './LegendaryParticles3D.svelte';
	import Decorations3D from './Decorations3D.svelte';
	import { getThrelteMap } from '$js/mapping/threlte-maps/threlte-map-registry';
	import { getOrConvertMap } from '$js/mapping/threlte-maps/openmap-converter';
	import { PROLOGUE_MAP_ID } from '$js/mapping/prologue-map';
	import { DEBUG } from '$js/env';
	import { TileType3D } from '$js/mapping/threlte-maps/types';

	// Dungeon system — lazy-loaded only when entering dungeon mode
	import type { ExplorationTracker } from '$js/dungeon/exploration-tracker';
	import type { BiomeConfig } from '$js/dungeon/biomes';

	const DungeonMinimap = import('../world/DungeonMinimap.svelte').then((m) => m.default);
	const DebugBiomePicker = import('../world/DebugBiomePicker.svelte').then((m) => m.default);
	import { getLightingMood } from '$js/lighting/biome-lighting';
	import { persistDungeonState } from '$js/dungeon/dungeon-save';
	import { dungeonContext } from '$js/dungeon/dungeon-context';
	import { get } from 'svelte/store';

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
	// untrack: these are intentional one-time initial values; updates happen in useTask/onMount polls.
	let currentMap = $state(untrack(() => context.map));
	// currentNpcs is polled separately: RemoveNpc mutates map.npcs in-place (reassigns the array),
	// but currentMap still points to the same object so Svelte never re-renders the NPC list.
	let currentNpcs = $state(untrack(() => context.map.npcs));
	let currentFollower = $state<Follower | undefined>(untrack(() => context.player.follower));
	let playerIsRunning = $state(false);
	let isChangingMap = $state(false);
	let isPortalAnimating = $state(false);

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
	let lastTrackedFloor = -1; // -1 so floor 0 (prologue) triggers tracker creation
	let isGamePaused = $state(false);
	let playerMoney = $state(untrack(() => context.player.bag.money));

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

	// Polled reactive state for overworld spawn (plain class property, not reactive in Svelte 5)
	let spawned = $state(untrack(() => context.spawned));

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

	// Subscribe to dungeon context store — imported lazily to keep dungeon code
	// out of the main bundle. The dynamic import resolves once and is then stable.
	$effect(() => {
		let unsub: (() => void) | undefined;
		import('$js/dungeon/dungeon-context').then(({ dungeonContext }) => {
			unsub = dungeonContext.subscribe((value) => {
				isDungeonMode = value?.isDungeonMode ?? false;
				currentDungeonFloor = value?.currentFloor ?? 0;
				currentDungeonBiome = value?.currentBiome;
				dungeonFloorType = value?.getCurrentFloorType() ?? 'normal';
			});
		});
		return () => unsub?.();
	});

	let dungeonMapData = $derived(
		isDungeonMode
			? currentDungeonFloor === 0
				? getThrelteMap(PROLOGUE_MAP_ID)            // prologue map
				: getThrelteMap(1000 + currentDungeonFloor) // regular dungeon floor
			: undefined
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

	// ExplorationTracker lifecycle: create on dungeon entry, reset on floor change.
	// Floor 0 = prologue map (mapId 99), floor > 0 = regular dungeon floors.
	// lastTrackedFloor starts at -1 so floor 0 triggers correctly.
	$effect(() => {
		if (
			isDungeonMode &&
			dungeonMapData &&
			currentDungeonFloor !== lastTrackedFloor
		) {
			const floor = currentDungeonFloor;
			const w = dungeonMapData.width;
			const h = dungeonMapData.height;
			import('$js/dungeon/exploration-tracker').then(({ ExplorationTracker }) => {
				const tracker = new ExplorationTracker(w, h, 5);
				// Restore saved exploration for regular floors (prologue has no saved exploration)
				const save = savesHolder.getActiveSave();
				if (floor > 0 && save?.dungeonExplored?.length && save.dungeonFloor === floor) {
					tracker.importVisited(save.dungeonExplored);
				}
				explorationTracker = tracker;
				lastTrackedFloor = floor;
				explorationTracker.updatePlayerPosition(playerGridX, playerGridY);
			});
		}
	});

	// Clean up tracker when leaving dungeon mode
	$effect(() => {
		if (!isDungeonMode) {
			explorationTracker = undefined;
			lastTrackedFloor = -1;
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
			if (newMap !== currentMap) {
				currentMap = newMap;
				currentNpcs = newMap.npcs;
			} else if (newMap.npcs !== currentNpcs) {
				// npcs array was replaced in-place (e.g. RemoveNpc) — force reactive update
				currentNpcs = newMap.npcs;
			}

			const newChangingMap = overWorldCtx.changingMap;
			if (newChangingMap !== isChangingMap) isChangingMap = newChangingMap;

			const newPortalAnimating = overWorldCtx.portalAnimating;
			if (newPortalAnimating !== isPortalAnimating) isPortalAnimating = newPortalAnimating;

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
				// Auto-save exploration + player position on every tile move in dungeon
				// Skip while changing map to avoid overwriting the saved position with a transient one
				if (isDungeonMode && !overWorldCtx.changingMap) {
					const dc = get(dungeonContext);
					if (dc?.isRunActive) {
						persistDungeonState(dc, savesHolder, {
							explorationTracker: explorationTracker ?? undefined,
							playerX: newGridX,
							playerY: newGridY
						});
					}
				}
			}

			const newSpawned = context.spawned;
			if (newSpawned !== spawned) spawned = newSpawned;

			const newMoney = context.player.bag.money;
			if (newMoney !== playerMoney) playerMoney = newMoney;
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
			<LegendaryParticles3D
				active={(battleCtx?.legendaryTypes?.length ?? 0) > 0}
				types={battleCtx?.legendaryTypes ?? []}
				playerPosition={playerVisualPosition}
			/>
			<GameCamera3D targetPosition={playerVisualPosition} {mapData} battleActive={!!battleCtx} portalAnimating={isPortalAnimating} />
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
					portalAnimating={isPortalAnimating}
				/>
				{#each currentNpcs as npc (npc.id)}
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
			{#await DungeonMinimap then DungeonMinimapCmp}
				<DungeonMinimapCmp
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
					legendaryPortals={dungeonMapData.legendaryPortals}
					visible={showDungeonMinimap}
				/>
			{/await}
		{/if}

		<!-- <OverworldTeamPanel {context} /> -->

		{#if DEBUG && isDungeonMode}
			{#await DebugBiomePicker then DebugBiomePickerCmp}
				<DebugBiomePickerCmp {context} />
			{/await}
		{/if}

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
			<div class="notifications">
				{#each currentMessages as message}
					<div class="notification" in:fade={{ duration: 200 }} out:fade={{ duration: 300 }}>{message}</div>
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
			bottom: 4%;
			left: 50%;
			transform: translateX(-50%);
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 4px;
			z-index: 7;
			pointer-events: none;

			.notification {
				color: white;
				font-size: 26px;
				text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
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
			transition: opacity 0.3s ease-in;
			z-index: 100;
			pointer-events: none;

			&.show {
				opacity: 1;
				transition: opacity 0.3s ease-in;
			}
		}
	}
</style>
