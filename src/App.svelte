<svelte:options customElement="open-mon" />

<script lang="ts">
	import '@abraham/reflection';
	import { onMount } from 'svelte';
	import Battle from './components/battle/Battle.svelte';
	import World from './components/world/World.svelte';
	import LoadSave from './components/saves/LoadSave.svelte';
	import PlayerCreation from './components/saves/PlayerCreation.svelte';
	import { SaveContext, SavesHolder } from './js/context/savesHolder';
	import type { GameContext } from './js/context/gameContext';
	import type { BattleContext } from './js/context/battleContext';

	import '../node_modules/@sjmc11/tourguidejs/dist/css/tour.min.css';

	/**
	 * Main component, handling screens transitions
	 */

	const savesHolder = new SavesHolder();
	let gameContext: GameContext;
	savesHolder.selectedSave$.subscribe((value: SaveContext | undefined) => {
		if (value) {
			gameContext = value.toGameContext();
		}
	});

	let battleCtx: BattleContext | undefined = undefined;
	$: if (gameContext) {
		gameContext.battleContext.subscribe((value) => {
			battleCtx = value;
		});
	}

	let battleStarting = false;
	let battleEnding = false;
	$: if (battleCtx) {
		battleCtx.events.starting.subscribe((value) => {
			if (value) {
				battleStarting = value;
				setTimeout(() => {
					battleCtx?.events?.starting?.set(false);
					battleStarting = false;
				}, 2000);
			}
		});
		battleCtx.events.ending.subscribe((value) => {
			if (value) {
				battleEnding = value;
				setTimeout(() => {
					battleCtx?.events?.ending?.set(false);
					battleEnding = false;
				}, 4000);
			}
		});
	}

	let rotate = false;

	// Avoid IOS zoom on double tap
	if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
		window.document.addEventListener(
			'touchmove',
			(e) => {
				// @ts-ignore
				if (e.scale !== 1) {
					e.preventDefault();
				}
			},
			{ passive: false }
		);
	}

	// todo uncomment
	// Avoid leaving game by error
	/* window.addEventListener('beforeunload', function (event) {
         event.preventDefault();
         event.returnValue = 'Leaving already ?';
     });*/

	// Screen orientation checks
	function checkOrientation() {
		rotate =
			!window.matchMedia('(orientation: landscape)').matches ||
			window.innerWidth < window.innerHeight;
	}

	window.addEventListener('resize', () => {
		checkOrientation();
	});

	onMount(() => {
		checkOrientation();
	});
</script>

{#if gameContext}
	<!-- game started -->
	{#if battleCtx !== undefined && !battleStarting}
		<Battle
			bind:context={gameContext}
			bind:overWorldCtx={gameContext.overWorldContext}
			bind:battleCtx
		/>
	{:else if gameContext.overWorldContext !== undefined}
		<World
			bind:context={gameContext}
			bind:overWorldCtx={gameContext.overWorldContext}
			{savesHolder}
		/>
	{/if}

	{#if battleStarting}
		<div class="battleStart"></div>
	{/if}
	{#if battleEnding}
		<div class="battleEnd"></div>
	{/if}
{:else if savesHolder.saves?.length > 0}
	<!-- select a save / start new -->
	<LoadSave {savesHolder} />
{:else}
	<!-- create a new save -->
	<PlayerCreation {savesHolder} />
{/if}

{#if rotate}
	<div class="rotate">
		<img src="src/assets/common/rotate.gif" alt="Please rotate your device" />
	</div>
{/if}

<style lang="scss" global>
	:root {
		box-sizing: border-box;
		touch-action: none;
		-webkit-touch-callout: none;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		-o-user-select: none;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);

		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;

		* {
			box-sizing: border-box;
			touch-action: none;
			-webkit-touch-callout: none;
			user-select: none;
			-webkit-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			-o-user-select: none;
			-webkit-tap-highlight-color: rgba(0, 0, 0, 0);

			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
		}
	}

	.rotate {
		position: fixed;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100svh;
		background-color: rgba(0, 0, 0, 1);
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: center;

		img {
			width: 100dvw;
		}
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
		z-index: 10;
		animation: fade-out 4s ease-in-out;
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

	:global(.guide-dialog) {
		font-family: pokemon, serif;
		font-size: 28px !important;
	}

	:global(.guide-dialog .tg-dialog-title) {
		font-size: 32px !important;
	}
</style>
