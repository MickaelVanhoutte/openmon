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

	/**
	 * Overworld component.
	 * Main game loop, menus, battle starting...
	 */

	export let context: GameContext;
	export let overWorldCtx: OverworldContext;
	export let savesHolder: SavesHolder;

	let canvas: HTMLCanvasElement;
	let buffer: HTMLCanvasElement;
	let bufferCtx: CanvasRenderingContext2D;
	let canvasCtx: CanvasRenderingContext2D;
	let wrapper: HTMLDivElement;
	let canvasWidth: number;

	/*
    Scripts
     */
	$: currentScript = context?.playingScript;
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
		//canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

		// Background
		let mapDimensions = context.map.draw(
			bufferCtx,
			context.map,
			overWorldCtx.frames.imageScale,
			context.player.position.positionInPx,
			overWorldCtx.frames.debug
		);

		context.map.npcs.forEach((npc) => {
			npc.draw(
				bufferCtx,
				context.player.position.positionInPx,
				npc,
				overWorldCtx.frames.playerScale,
				mapDimensions, undefined
			);
		});

		// Player & walker

		context.player?.follower?.draw(
			bufferCtx,
			context.player.position.positionInPx,
			overWorldCtx.frames.playerScale,
			mapDimensions,
			context.map.hasBattleZoneAt(context.player.follower.position.positionOnMap),
			context.player.running,
			undefined
		);

		let center = context.player.draw(
			bufferCtx,
			overWorldCtx.frames.playerScale,
			mapDimensions,
			context.map.hasBattleZoneAt(context.player.position.positionOnMap)
		);

	

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

		canvasCtx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
	}

	let battleCtx: BattleContext | undefined = undefined;
	$: if (context) {
		context.battleContext.subscribe((value) => {
			battleCtx = value;
		});
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

		canvasWidth = Math.min(window.innerWidth, canvas.width);
		mainLoop();

		return () => {
			canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
			window.cancelAnimationFrame(overWorldCtx.frames.frameId);
		};
	});
</script>

<div class="world-wrapper" bind:this={wrapper} class:blur={overWorldCtx.scenes.wakeUp}>
	<canvas bind:this={buffer} id="buffer" width="1024" height="1024" style="z-index: -2"></canvas>
	<canvas bind:this={canvas} id="main" width="1024" height="1024"></canvas>

	<Menu bind:context {savesHolder} />

	{#if hasDialog}
		<DialogView bind:dialog={currentDialog} {context} />
	{/if}
	{#if hasShop}
		<Shop bind:shop={currentShop} {context} />
	{/if}

	<div class="healing" class:show={isHealing}></div>

	<Controls {context} {overWorldCtx} />
	<ScenesView {context} {canvasWidth} />
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
	}
</style>
