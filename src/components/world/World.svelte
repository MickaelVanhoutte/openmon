<script lang="ts">
	import { onMount } from 'svelte';
	import Menu from '../menus/Menu.svelte';
	import DialogView from '../common/DialogView.svelte';
	import type { Dialog } from '../../js/scripting/scripts';
	import type { GameContext } from '../../js/context/gameContext';
	import { type OverworldContext } from '../../js/context/overworldContext';
	import { SavesHolder } from '../../js/context/savesHolder';
	import ScenesView from './ScenesView.svelte';
	import Controls from './Controls.svelte';

	/**
	 * Overworld component.
	 * Main game loop, menus, battle starting...
	 */

	export let context: GameContext;
	export let overWorldCtx: OverworldContext;
	export let savesHolder: SavesHolder;

	let canvas: HTMLCanvasElement;
	let wrapper: HTMLDivElement;
	let canvasWidth: number;
	let canvasCtx: CanvasRenderingContext2D;

	/*
    Scripts
     */
	$: currentScript = context?.playingScript;
	$: currentAction = currentScript?.currentAction;
	$: currentDialog = currentAction?.type === 'Dialog' ? (currentAction as Dialog) : undefined;
	$: hasDialog = currentAction?.type === 'Dialog';

	function initContext() {
		mainLoop();
		//loadMap(context.map);
	}

	/*
    Game loop
     */
	function mainLoop() {
		overWorldCtx.frames.frameId = window.requestAnimationFrame(mainLoop);

		canvasCtx.imageSmoothingEnabled = true;
		canvasCtx.imageSmoothingQuality = 'high';

		let now = Date.now();
		let elapsed = now - overWorldCtx.frames.then;

		if (
			elapsed > overWorldCtx.frames.fpsInterval &&
			context?.map
			//!battleState?.ending && // TODO ?
			//!overworldContext.displayChangingMap &&
		) {
			overWorldCtx.frames.then = now - (elapsed % overWorldCtx.frames.fpsInterval);

			canvasCtx.fillStyle = 'black';
			canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

			drawElements();

			/*
          		use "x" to display debug info
      		*/
			if (overWorldCtx.frames.debug) {
				canvasCtx.font = '12px Arial';
				let fps = Math.round((1 / elapsed) * 1000);

				let x = canvasWidth / 2 - window.innerWidth / 3.5;
				let y = canvas.height / 2 - window.innerHeight / 3.5;

				canvasCtx.fillStyle = 'black';
				canvasCtx.fillRect(x, y, 200, 100);

				canvasCtx.fillStyle = 'white';
				canvasCtx.fillText(`fps: ${fps}`, x + 10, y + 10);
				canvasCtx.fillText(`Player moving: ${context.player.moving}`, x + 10, y + 20);
				canvasCtx.fillText(
					`Player offset: ${context.player.position.positionOnMap.x}, ${context.player.position.positionOnMap.y}`,
					x + 10,
					y + 30
				);
				canvasCtx.fillText(`paused: ${context.overWorldContext.isPaused}`, x + 10, y + 40);
			}
		}
	}
	
	// TEST -> TODO : smash rock, cut trees... using pkmn charge
	document.addEventListener("keydown", (e) => {
		if (e.key === "c") {
			context.player.followerCharge(overWorldCtx, false);
		}
	});

	function drawElements() {
		if (context.map === undefined) return;

		// Background
		let mapDimensions = context.map.draw(
			canvasCtx,
			context.map,
			overWorldCtx.frames.imageScale,
			context.player.position.positionInPx,
			overWorldCtx.frames.debug
		);

		context.map.npcs.forEach((npc) => {
			npc.draw(
				canvasCtx,
				context.player.position.positionInPx,
				npc,
				overWorldCtx.frames.playerScale,
				mapDimensions
			);
		});

		// Player & walker
		context.player?.follower?.draw(
			canvasCtx,
			context.player.position.positionInPx,
			overWorldCtx.frames.playerScale,
			mapDimensions,
			context.map.hasBattleZoneAt(context.player.follower.position.positionOnMap),
			context.player.running
		);

		context.player.draw(
			canvasCtx,
			overWorldCtx.frames.playerScale,
			mapDimensions,
			context.map.hasBattleZoneAt(context.player.position.positionOnMap)
		);

	
		// Foreground
		// if (context.map?.foreground !== undefined) {
		// 	context.map.drawFG(
		// 		canvasCtx,
		// 		context.map,
		// 		overWorldCtx.frames.imageScale,
		// 		context.player.position.positionOnMap
		// 	);
		// }
	}

	onMount(() => {
		//@ts-ignore
		canvasCtx = canvas.getContext('2d');
		canvasWidth = Math.min(window.innerWidth, canvas.width);
		initContext();

		return () => {
			canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);
			window.cancelAnimationFrame(overWorldCtx.frames.frameId);
		};
	});
</script>

<div class="world-wrapper" bind:this={wrapper} class:blur={overWorldCtx.scenes.wakeUp}>
	<canvas bind:this={canvas} id="main" width="1024" height="1024"></canvas>

	<Menu bind:context {savesHolder} />

	{#if hasDialog}
		<DialogView bind:dialog={currentDialog} {context} />
	{/if}

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
