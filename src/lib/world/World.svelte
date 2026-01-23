<script lang="ts">
	import { onMount } from 'svelte';
	import Menu from '../menus/Menu.svelte';
	import DialogView from '../common/DialogView.svelte';
	import type { Dialog, OpenShop } from '../../js/scripting/scripts';
	import type { GameContext } from '../../js/context/gameContext';
	import { type OverworldContext } from '../../js/context/overworldContext';
	import { SavesHolder } from '../../js/context/savesHolder';
	import ScenesView from './ScenesView.svelte';
	import Controls from './Controls.svelte';
	import type { BattleContext } from '../../js/context/battleContext';
	import Shop from '../common/Shop.svelte';
	import { backInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	/**
	 * Overworld component.
	 * Main game loop, menus, battle starting...
	 */

	export let context: GameContext;
	export let overWorldCtx: OverworldContext;
	export let savesHolder: SavesHolder;

	let canvas: HTMLCanvasElement;
	let buffer: HTMLCanvasElement;
	let minimap: HTMLCanvasElement;
	let bufferCtx: CanvasRenderingContext2D;
	let canvasCtx: CanvasRenderingContext2D;
	let minimapCtx: CanvasRenderingContext2D;
	let ctx: CanvasRenderingContext2D;
	let wrapper: HTMLDivElement;
	let canvasWidth: number;
	let currentMessages: string[] = [];
	let mapEnlarged = false;
	let weatherParticles: Array<{ x: number; y: number; l: number; xs: number; ys: number }> = [];

	/*
    Scripts
     */
	$: currentScript = context?.scriptRunner?.playingScript;
	$: currentAction = currentScript?.currentAction;
	$: currentDialog = currentAction?.type === 'Dialog' ? (currentAction as Dialog) : undefined;
	$: hasDialog = currentAction?.type === 'Dialog';
	$: hasShop = currentAction?.type === 'OpenShop';
	$: currentShop = currentAction?.type === 'OpenShop' ? (currentAction as OpenShop) : undefined;
	$: isHealing = currentAction?.type === 'HealAll';
	$: spawned = context.spawned;

	/*
    Game loop
     */
	function mainLoop() {
		let now = Date.now();
		let elapsed = now - overWorldCtx.frames.then;

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
		if (context.map === undefined) return;

		// Clear
		bufferCtx.fillRect(0, 0, buffer.width, buffer.height);
		minimapCtx.fillRect(0, 0, minimap.width, minimap.height);
		//canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

		// Background
		let mapDimensions = context.map.draw(
			bufferCtx,
			context.map,
			overWorldCtx.frames.imageScale,
			context.player.position.positionInPx,
			overWorldCtx.frames.debug
		);

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
				overWorldCtx.frames.playerScale,
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
				overWorldCtx.frames.playerScale,
				mapDimensions,
				context.map.hasBattleZoneAt(context.player.follower.position.positionOnMap),
				context.player.running,
				undefined
			);
		}

		// Foreground
		if (!!context.map?.foreground) {
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
			var w = buffer.width;
			var h = buffer.height;

			if (weatherParticles.length === 0) {
				var maxParts = 1000;
				for (var a = 0; a < maxParts; a++) {
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

			for (var c = 0; c < weatherParticles.length; c++) {
				var p = weatherParticles[c];
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

	let battleCtx: BattleContext | undefined = undefined;
	$: if (context) {
		context.battleContext.subscribe((value) => {
			battleCtx = value;
		});
	}

	function enlargeMap() {
		mapEnlarged = !mapEnlarged;
		overWorldCtx.setPaused(mapEnlarged, 'map-enlarge');
	}

	onMount(() => {
		//@ts-ignore
		bufferCtx = buffer.getContext('2d');
		bufferCtx.imageSmoothingEnabled = true;
		bufferCtx.imageSmoothingQuality = 'high';
		bufferCtx.fillStyle = 'black';
		//@ts-ignore
		canvasCtx = canvas.getContext('2d');
		canvasCtx.imageSmoothingEnabled = true;
		canvasCtx.imageSmoothingQuality = 'high';
		canvasCtx.fillStyle = 'black';

		//@ts-ignore
		minimapCtx = minimap.getContext('2d');
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

<div class="world-wrapper" bind:this={wrapper} class:blur={overWorldCtx.scenes.wakeUp}>
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
			on:click={() => enlargeMap()}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M17.5858 5H14V3H21V10H19V6.41421L14.7071 10.7071L13.2929 9.29289L17.5858 5ZM3 14H5V17.5858L9.29289 13.2929L10.7071 14.7071L6.41421 19H10V21H3V14Z"
				></path></svg
			>
		</button>
	</div>

	<Menu bind:context />

	{#if hasDialog}
		<DialogView bind:dialog={currentDialog} {context} />
	{/if}
	{#if hasShop}
		<Shop bind:shop={currentShop} {context} />
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

		&.blur {
			animation: blurry 5s linear infinite;
		}

		.notifications {
			position: absolute;
			top: calc(4% + 56px);
			left: 1%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: flex-start;
			z-index: 7;

			.notification {
				background-color: rgba(0, 0, 0, 0.5);
				color: white;
				padding: 8px;
				border-radius: 4px;

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
</style>
