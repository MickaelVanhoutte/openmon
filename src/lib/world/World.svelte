<script lang="ts">
	import { onMount } from 'svelte';
	import Menu from '../menus/Menu.svelte';
	import DialogView from '../common/DialogView.svelte';
	import type { Dialog, OpenShop } from '../../js/scripting/scripts';
	import type { GameContext } from '../../js/context/gameContext';
	import { type OverworldContext } from '../../js/context/overworldContext';
	import type { SavesHolder } from '../../js/context/savesHolder';
	import ScenesView from './ScenesView.svelte';
	import Controls from './Controls.svelte';
	import type { BattleContext } from '../../js/context/battleContext';
	import Shop from '../common/Shop.svelte';
	import { backInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { TimeOfDay } from '../../js/time/time-of-day';

	/**
	 * Overworld component.
	 * Main game loop, menus, battle starting...
	 */

	interface Props {
		context: GameContext;
		overWorldCtx: OverworldContext;
		savesHolder: SavesHolder;
	}

	const { context, overWorldCtx, savesHolder }: Props = $props();

	let canvas: HTMLCanvasElement;
	let buffer: HTMLCanvasElement;
	let minimap: HTMLCanvasElement;
	let bufferCtx: CanvasRenderingContext2D;
	let canvasCtx: CanvasRenderingContext2D;
	let minimapCtx: CanvasRenderingContext2D;
	let wrapper: HTMLDivElement;
	let canvasWidth: number;
	let currentMessages: string[] = $state([]);
	let mapEnlarged = $state(false);
	let weatherParticles: Array<{ x: number; y: number; l: number; xs: number; ys: number }> = $state(
		[]
	);

	/*
    Scripts - subscribe to reactive store
     */
	import type { Script, Scriptable } from '../../js/scripting/scripts';
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

	const spawned = $derived(context.spawned);

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

	/*
    Game loop
     */
	function mainLoop() {
		const now = Date.now();
		const elapsed = now - overWorldCtx.frames.then;

		if (elapsed > overWorldCtx.frames.fpsInterval && context?.map) {
			overWorldCtx.frames.then = now - (elapsed % overWorldCtx.frames.fpsInterval);
			drawElements();
		}
		overWorldCtx.frames.frameId = window.requestAnimationFrame(mainLoop);
	}

	// TEST -> TODO : smash rock, cut trees... using pkmn charge
	document.addEventListener('keydown', (e) => {
		if (e.key === 'c') {
			context.player.followerCharge(overWorldCtx, false);
		}
	});

	function drawElements() {
		if (context.map === undefined) {
			return;
		}

		// Clear
		bufferCtx.fillRect(0, 0, buffer.width, buffer.height);
		minimapCtx.fillRect(0, 0, minimap.width, minimap.height);
		//canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

		// Background
		const mapDimensions = context.map.draw(
			bufferCtx,
			context.map,
			overWorldCtx.frames.imageScale,
			context.player.position.positionInPx,
			overWorldCtx.frames.debug
		);

		// draw tile borders if debug:
		if (overWorldCtx.frames.debug) {
			for (let x = 0; x < context.map.width; x++) {
				for (let y = 0; y < context.map.height; y++) {
					bufferCtx.strokeRect(x * 16, y * 16, 16, 16);
				}
			}
		}

		context.map.drawMini(
			minimapCtx,
			context.map,
			overWorldCtx.frames.imageScale,
			context.player.position.positionOnMap,
			mapEnlarged
		);

		context.map.npcs.forEach((npc) => {
			npc.draw(
				bufferCtx,
				context.player.position.positionInPx,
				npc,
				overWorldCtx.frames.playerScale,
				mapDimensions,
				undefined
			);
		});

		if (context.map.items.length > 0) {
			context.map.items.forEach((item) => {
				item.draw(
					bufferCtx,
					context.player.position.positionInPx,
					overWorldCtx.frames.imageScale,
					mapDimensions,
					undefined
				);
			});
		}

		// Player & walker
		let center;
		//if follower y < player y, draw follower first
		if (
			context.player.follower &&
			context.player.follower.position.positionOnMap.y < context.player.position.positionOnMap.y
		) {
			context.player?.follower?.draw(
				bufferCtx,
				context.player.position.positionInPx,
				overWorldCtx.frames.followerScale,
				mapDimensions,
				context.map.hasBattleZoneAt(context.player.follower.position.positionOnMap),
				context.player.running,
				undefined
			);
			center = context.player.draw(
				bufferCtx,
				overWorldCtx.frames.playerScale,
				mapDimensions,
				context.map.hasBattleZoneAt(context.player.position.positionOnMap)
			);
		} else {
			center = context.player.draw(
				bufferCtx,
				overWorldCtx.frames.playerScale,
				mapDimensions,
				context.map.hasBattleZoneAt(context.player.position.positionOnMap)
			);
			context.player?.follower?.draw(
				bufferCtx,
				context.player.position.positionInPx,
				overWorldCtx.frames.followerScale,
				mapDimensions,
				context.map.hasBattleZoneAt(context.player.follower.position.positionOnMap),
				context.player.running,
				undefined
			);
		}

		// Foreground
		if (context.map?.foreground) {
			context.map.drawFG(
				bufferCtx,
				context.map,
				overWorldCtx.frames.imageScale,
				context.player.position.positionInPx,
				mapDimensions
			);
		}

		spawned?.draw(
			bufferCtx,
			context.player.position.positionInPx,
			overWorldCtx.frames.playerScale,
			mapDimensions,
			center
		);

		if (context.weather?.running) {
			const w = buffer.width;
			const h = buffer.height;

			if (weatherParticles.length === 0) {
				const maxParts = 1000;
				for (let a = 0; a < maxParts; a++) {
					weatherParticles.push({
						x: Math.random() * w,
						y: Math.random() * h,
						l: Math.random() * 1,
						xs: -4 + Math.random() * 4 + 2,
						ys: Math.random() * 10 + 10
					});
				}
			}

			bufferCtx.strokeStyle = 'rgba(174,194,224,0.5)';
			bufferCtx.lineWidth = 1;
			bufferCtx.lineCap = 'round';

			for (let c = 0; c < weatherParticles.length; c++) {
				const p = weatherParticles[c];
				bufferCtx.beginPath();
				bufferCtx.moveTo(p.x, p.y);
				bufferCtx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
				bufferCtx.stroke();
				p.x += p.xs;
				p.y += p.ys;
				if (p.x > w || p.y > h) {
					p.x = Math.random() * w;
					p.y = -20;
				}
			}
		} else if (weatherParticles.length > 0) {
			weatherParticles = [];
		}
		canvasCtx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
	}

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
	void battleCtx;

	function enlargeMap() {
		mapEnlarged = !mapEnlarged;
		overWorldCtx.setPaused(mapEnlarged, 'map-enlarge');
	}

	onMount(() => {
		bufferCtx = buffer.getContext('2d')!;
		bufferCtx.imageSmoothingEnabled = true;
		bufferCtx.imageSmoothingQuality = 'high';
		bufferCtx.fillStyle = 'black';
		canvasCtx = canvas.getContext('2d')!;
		canvasCtx.imageSmoothingEnabled = true;
		canvasCtx.imageSmoothingQuality = 'high';
		canvasCtx.fillStyle = 'black';

		minimapCtx = minimap.getContext('2d')!;
		minimapCtx.imageSmoothingEnabled = true;
		minimapCtx.imageSmoothingQuality = 'high';
		minimapCtx.fillStyle = 'black';

		canvasWidth = Math.min(window.innerWidth, canvas.width);
		mainLoop();
		context.notifications.subscribe((value) => {
			currentMessages = value;
		});

		return () => {
			if (canvasCtx) {
				canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
			}
			window.cancelAnimationFrame(overWorldCtx.frames.frameId);
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
	<canvas bind:this={buffer} id="buffer" width="1024" height="1024" style="z-index: -2"></canvas>
	<canvas bind:this={canvas} id="main" width="1024" height="1024"></canvas>

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

	{#if hasDialog}
		<DialogView dialog={currentDialog} {context} />
	{/if}
	{#if hasShop}
		<Shop shop={currentShop} {context} />
	{/if}

	<div class="healing" class:show={isHealing}></div>

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

		#main,
		#buffer {
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
	}

	canvas {
		z-index: -1;
		width: 1024px;
		height: auto;
		overflow: hidden;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);

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
