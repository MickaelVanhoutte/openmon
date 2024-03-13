<script lang="ts">
	import { onMount } from 'svelte';
	import Menu from '../menus/Menu.svelte';
	import { OpenMap } from '../../js/mapping/maps.js';
	import type { Jonction } from '../../js/mapping/collisions';
	import DialogView from '../common/DialogView.svelte';
	import type { Dialog, Script } from '../../js/scripting/scripts';
	import type { NPC } from '../../js/characters/npc';
	import Evolution from '../common/Evolution.svelte';
	import { Position } from '../../js/mapping/positions';
	import type { GameContext } from '../../js/context/gameContext';
	import { SceneType, type OverworldContext, Scenes } from '../../js/context/overworldContext';
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
	$: evolutions = context?.player?.monsters?.filter((p) => p.canEvolve());

	function initContext() {
		mainLoop();
		loadMap(context.map);
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
			context?.map &&
			//!battleState?.ending && // TODO ?
			//!overworldContext.displayChangingMap &&
			evolutions?.length === 0
		) {
			overWorldCtx.frames.then = now - (elapsed % overWorldCtx.frames.fpsInterval);

			canvasCtx.fillStyle = 'black';
			canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

			drawElements();

			if (context.player.moving) {
				/*Position checks*/
				checkForStepInScript();
				checkForFunction();
				checkForBattle();
				checkForInSight();
			}

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

	/*
    Scripts
     */

	$: currentScript = context?.playingScript;
	$: currentAction = currentScript?.currentAction;
	$: currentDialog = currentAction?.type === 'Dialog' ? (currentAction as Dialog) : undefined;
	$: hasDialog = currentAction?.type === 'Dialog';

	function checkForGameStart(): boolean {
		console.log(
			'new game ? ',
			context.isNewGame && !overWorldCtx.scenes.wakeUp,
			context.scriptsByTrigger.get('onGameStart')?.at(0)
		);
		if (context.isNewGame && !overWorldCtx.scenes.wakeUp) {
			let script = context.scriptsByTrigger.get('onGameStart')?.at(0);
			overWorldCtx.startScene(SceneType.WAKE_UP);
			setTimeout(() => {
				context.isNewGame = false;
				overWorldCtx.endScene(SceneType.WAKE_UP);
				if (script) {
					context.playScript(script, undefined, () =>
						overWorldCtx.startScene(SceneType.STARTER_SELECTION)
					);
				}
			}, 5000);
			return true;
		}
		return false;
	}

	function checkForStepInScript() {
		let stepScript: Script | undefined;
		if (context.map?.scripts && context.map.scripts?.length > 0 && !context.playingScript) {
			// TODO allow range of positions
			stepScript = context.map.scripts.find(
				(s) =>
					s.triggerType === 'onStep' &&
					s.stepPosition?.x === context.player.position.positionOnMap.x &&
					s.stepPosition?.y === context.player.position.positionOnMap.y
			);
		}

		if ((stepScript !== undefined && !stepScript?.played) || stepScript?.replayable) {
			context.playScript(stepScript);
		}

		return stepScript;
	}

	/*
    Map change (load and junctions)
     */
	function checkForFunction() {
		if (context.map === undefined) return;
		let jonction = context.map.jonctionAt(context.player.position.positionOnMap);
		if (jonction !== undefined) {
			changeMap(jonction);
		}
	}

	function loadMap(map: OpenMap) {
	
		overWorldCtx.changingMap = true;
		//overworldContext.displayChangingMap = true;

		let onEnterScript: Script | undefined;
		if (map.scripts && map.scripts?.length > 0) {
			onEnterScript = map.scripts?.find((s) => s.triggerType === 'onEnter');
		}

		let npcOnEnter = map.npcs.filter((npc) => npc.movingScript);

		// TODO set in overWorldCtx
		context.map = map;

		setTimeout(() => {
			overWorldCtx.changingMap = false;

			if (onEnterScript) {
				context.playScript(onEnterScript);
			}
			if (npcOnEnter?.length > 0) {
				context.playMvts(npcOnEnter);
			}
		}, 4000);
		setTimeout(() => {
			//overworldContext.displayChangingMap = false;
			//checkForGameStart();
		}, 2000);
	}

	function changeMap(jonction: Jonction) {
		let map = OpenMap.fromInstance(context.MAPS[jonction.mapIdx], new Position(0, 0));
		//map.playerInitialPosition = map.jonctions.find(j => j.id === jonction.id)?.start || new Position(0, 0);
		context.player.position.positionOnMap =
			map.jonctions.find((j) => j.id === jonction.id)?.start || new Position(0, 0);
		loadMap(map);
	}

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

		// Player & walker
		context.player.draw(
			canvasCtx,
			'overworld',
			overWorldCtx.frames.playerScale,
			mapDimensions,
			context.map.hasBattleZoneAt(context.player.position.positionOnMap)
		);

		// context.map.npcs.forEach((npc) => {
		// 	npc.draw(
		// 		canvasCtx,
		// 		context.player.position.positionOnMap,
		// 		npc,
		// 		overWorldCtx.frames.playerScale,
		// 		mapDimensions
		// 	);
		// });

		// Foreground
		if (context.map?.foreground !== undefined) {
			context.map.drawFG(
				canvasCtx,
				context.map,
				overWorldCtx.frames.imageScale,
				context.player.position.positionOnMap
			);
		}
	}

	/*
    Battle start
     */
	function checkForBattle() {
		if (
			context.map &&
			context.map.hasBattleZoneAt(context.player.position.positionOnMap) &&
			Math.random() < 0.07
		) {
			let monster = context.map.randomMonster();
			context.startBattle(context.POKEDEX.findById(monster.id).result.instanciate(monster.level));
		}
	}

	function checkForInSight() {
		if (context.map?.npcs && context.map?.npcs?.length > 0) {
			let npcsWithInSightScript: NPC[] = context.map.npcs.filter(
				(npc) =>
					npc.mainScript &&
					(!npc.mainScript.played || npc.mainScript.replayable) &&
					npc.mainScript.triggerType === 'onSight'
			);

			npcsWithInSightScript.forEach((npc) => {
				//let inSight = npc.isInSight(playerPosition);
				// player is in sight if the npc looks in his direction and is within 3 tiles
				//get 3 tiles in front of the npc  :
				let positionsInFront: Position[];
				if (npc.direction === 'down') {
					positionsInFront = [
						new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y + 1),
						new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y + 2),
						new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y + 3)
					];
				} else if (npc.direction === 'up') {
					positionsInFront = [
						new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y - 1),
						new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y - 2),
						new Position(npc.position.positionOnMap.x, npc.position.positionOnMap.y - 3)
					];
				} else if (npc.direction === 'left') {
					positionsInFront = [
						new Position(npc.position.positionOnMap.x - 1, npc.position.positionOnMap.y),
						new Position(npc.position.positionOnMap.x - 2, npc.position.positionOnMap.y),
						new Position(npc.position.positionOnMap.x - 3, npc.position.positionOnMap.y)
					];
				} else {
					positionsInFront = [
						new Position(npc.position.positionOnMap.x + 1, npc.position.positionOnMap.y),
						new Position(npc.position.positionOnMap.x + 2, npc.position.positionOnMap.y),
						new Position(npc.position.positionOnMap.x + 3, npc.position.positionOnMap.y)
					];
				}
				let inSight = positionsInFront.some(
					(p) =>
						p.x === context.player.position.positionOnMap.x &&
						p.y === context.player.position.positionOnMap.y
				);

				if (inSight) {
					console.log('in sight !');
					context.playScript(npc.mainScript);
				}
			});
		}
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

	{#if evolutions?.length > 0}
		<Evolution bind:context />
	{/if}

	<!-- {#if battleState && battleState?.starting && !overWorldCtx.menus.pokemonListOpened && !overWorldCtx.menus.bagOpened }
         <div class="battleStart"></div>
     {/if}

     {#if !overWorldCtx.menus.pokemonListOpened && !overWorldCtx.menus.bagOpened}
         <div class="battleEnd" class:active={battleState && battleState?.ending || overWorldCtx?.changingMap}></div>
     {/if}
 -->


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

	.battleStart {
		opacity: 0;
		background: #000000;
		height: 100dvh;
		width: 100dvw;
		position: absolute;
		top: 0;
		left: 0;
		transition: opacity 0.5s ease-in-out;
		z-index: 2;
		animation: blink 2s ease-in-out;
	}

	@keyframes blink {
		0% {
			opacity: 1;
		}
		20% {
			opacity: 0;
		}
		40% {
			opacity: 1;
		}
		60% {
			opacity: 0;
		}
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	.battleEnd {
		opacity: 0;
		background: #000000;
		height: 100dvh;
		width: 100dvw;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 6;

		&.active {
			animation: fade-out 4s ease-in-out;
		}
	}

	@keyframes fade-out {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	.wakeUp {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		z-index: 10;
		pointer-events: none;

		.top,
		.bot {
			position: absolute;
			width: 100%;
			height: 50dvh;
			background: black;
			z-index: 11;
			pointer-events: none;
		}

		.top {
			top: 0;
			animation: blinkingDown 5s forwards;
		}

		.bot {
			bottom: 0;

			animation: blinkingTop 5s forwards;
		}
	}

	@keyframes -global-blinkingDown {
		20% {
			top: -50%;
		}
		25% {
			top: 0;
		}

		40% {
			top: -50%;
		}
		50% {
			top: 0;
		}
		65% {
			top: -50%;
		}
		75% {
			top: 0;
		}
		100% {
			top: -50%;
		}
	}

	@keyframes -global-blinkingTop {
		20% {
			bottom: -50%;
		}
		25% {
			bottom: 0;
		}
		40% {
			bottom: -50%;
		}
		50% {
			bottom: 0;
		}
		65% {
			bottom: -50%;
		}
		75% {
			bottom: 0;
		}
		100% {
			bottom: -50%;
		}
	}

	@keyframes -global-blurry {
		0% {
			filter: blur(3px) brightness(1.5);
			-webkit-filter: blur(3px) brightness(1.5);
		}
		100% {
			filter: blur(0) brightness(1);
			-webkit-filter: blur(0) brightness(1);
		}
	}
</style>
