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
	import { TimeOfDay } from '../../js/time/time-of-day';
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
	import Decorations3D from './Decorations3D.svelte';
	import { getThrelteMap } from '$js/mapping/threlte-maps/threlte-map-registry';
	import { getOrConvertMap } from '$js/mapping/threlte-maps/openmap-converter';

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
	let minimap: HTMLCanvasElement;
	const canvasWidth: number = 1024;
	let currentMessages: string[] = $state([]);
	let mapEnlarged = $state(false);

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

	function getTimeFilter(tod: TimeOfDay): string {
		switch (tod) {
			case TimeOfDay.DAWN:
				return 'brightness(0.9) saturate(1.1) sepia(0.15) hue-rotate(-5deg)';
			case TimeOfDay.DAY:
				return 'none';
			case TimeOfDay.DUSK:
				return 'sepia(0.3) brightness(0.85) hue-rotate(-10deg)';
			case TimeOfDay.NIGHT:
				return 'brightness(0.55) saturate(0.6) sepia(0.3) hue-rotate(180deg)';
		}
	}

	// spawned used for future Task 10 (items and spawns in 3D)
	const spawned = $derived(context.spawned);
	void spawned;

	const timeOfDay = context.timeOfDay.timeOfDay;
	const progress = context.timeOfDay.progress;

	const TIME_ICONS: Record<TimeOfDay, string> = {
		[TimeOfDay.DAWN]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2v2m0 16v2M4 12H2m20 0h-2m-2.05-6.36 1.41-1.41m-12.72 0 1.41 1.41M5.64 18.36l1.41-1.41m12.72 0-1.41-1.41"/><circle cx="12" cy="12" r="4"/><path d="M12 8v-2"/></svg>`,
		[TimeOfDay.DAY]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
		[TimeOfDay.DUSK]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 10V2m-6 8a6 6 0 1 0 12 0"/><path d="M4 22h16"/><path d="M6 18h12"/></svg>`,
		[TimeOfDay.NIGHT]: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
	};

	function formatGameTime(prog: number): string {
		const totalMinutes = Math.floor(prog * 24 * 60);
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	}

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

	function enlargeMap() {
		mapEnlarged = !mapEnlarged;
		overWorldCtx.setPaused(mapEnlarged, 'map-enlarge');
	}

	onMount(() => {
		context.notifications.subscribe((value) => {
			currentMessages = value;
		});

		// Poll plain class properties into reactive $state for Svelte 5 template reactivity
		const pollInterval = setInterval(() => {
			currentFollower = context.player.follower;
			playerIsRunning = context.player.running;
			currentMap = context.map;
			isChangingMap = overWorldCtx.changingMap;
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
	style="--time-filter: {getTimeFilter($timeOfDay)}"
>
	<div class="canvas-wrapper">
		<Canvas autoRender={false}>
			<Renderer3D />
			<Lighting3D timeOfDay={$timeOfDay} playerPosition={playerVisualPosition} />
			<WeatherParticles3D
				weatherType={context.weather?.type}
				running={context.weather?.running ?? false}
			/>
			<GameCamera3D targetPosition={playerVisualPosition} {mapData} />
			<InstancedTerrain {mapData} />
			<Decorations3D {mapData} />
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
		</Canvas>
	</div>

	{#if !battleCtx}
		<div class="minimap-wrapper" class:enlarged={overWorldCtx.menus.mapOpened && mapEnlarged}>
			<canvas
				bind:this={minimap}
				id="minimap"
				width="1024"
				height={1024 * (window.innerHeight / window.innerWidth)}
				style="z-index: 5"
				class:opened={overWorldCtx.menus.mapOpened}
			></canvas>
			<button
				class="enlarge"
				class:opened={overWorldCtx.menus.mapOpened}
				onclick={() => enlargeMap()}
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M17.5858 5H14V3H21V10H19V6.41421L14.7071 10.7071L13.2929 9.29289L17.5858 5ZM3 14H5V17.5858L9.29289 13.2929L10.7071 14.7071L6.41421 19H10V21H3V14Z"
					></path></svg
				>
			</button>
		</div>

		<div class="time-clock">
			<span class="time-icon">{@html TIME_ICONS[$timeOfDay]}</span>
			<span class="time-text">{formatGameTime($progress)}</span>
		</div>

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
			filter: var(--time-filter, none);
			transition: filter 2s ease-in-out;
		}

		&.blur {
			animation: blurry 5s linear infinite;
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

	canvas {
		&#minimap {
			position: relative;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			border: 1px solid black;
			border-radius: 4px;
			box-shadow: 0 0 4px black;
			transform: none;
			visibility: hidden;

			&.opened {
				visibility: visible;
			}
		}
	}

	.minimap-wrapper {
		position: absolute;
		top: calc(4% + 56px);
		left: 1%;
		z-index: 7;

		width: 33dvw;
		max-height: 33dvh;
		overflow: hidden;

		&.enlarged {
			top: 5dvh;
			left: 5dvw;
			width: 90dvw;
			max-height: 90dvh;
			z-index: 10;

			box-shadow: 0 0 8px black;

			.enlarge {
				height: 32px;
				width: 32px;
			}
		}

		.enlarge {
			position: absolute;
			top: 0;
			right: 0;
			background-color: rgba(0, 0, 0, 0.75);
			color: white;
			border: 1px solid black;
			height: 24px;
			width: 24px;
			border-radius: 4px;
			padding: 4px;
			z-index: 6;
			cursor: pointer;
			visibility: hidden;

			&.opened {
				visibility: visible;
			}
		}
	}

	.time-clock {
		position: absolute;
		top: max(20px, env(safe-area-inset-top, 20px));
		left: max(20px, env(safe-area-inset-left, 20px));
		z-index: 7;
		display: flex;
		align-items: center;
		gap: 6px;
		background-color: rgba(0, 0, 0, 0.6);
		padding: 6px 12px;
		border-radius: 8px;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);

		.time-icon {
			font-size: 20px;
		}

		.time-text {
			font-size: 16px;
			font-weight: 600;
			color: white;
			font-family: monospace;
			text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		}
	}
</style>
