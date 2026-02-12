<script lang="ts">
	import '@abraham/reflection';
	import { Howl } from 'howler';
	import { onMount } from 'svelte';
	import LoadSave from './lib/saves/LoadSave.svelte';
	import PlayerCreation from './lib/saves/PlayerCreation.svelte';
	import DungeonLobby from './lib/dungeon/DungeonLobby.svelte';
	import { SaveContext, SavesHolder } from './js/context/savesHolder';
	import { GameContext } from './js/context/gameContext';
	import type { BattleContext } from './js/context/battleContext';
	import { DEBUG } from './js/env';
	import { DungeonContext, dungeonContext } from './js/dungeon/dungeon-context';
	import { loadDungeonRun } from './js/dungeon/dungeon-save';
	import { Player } from './js/characters/player';
	import { PokemonBox } from './js/pokemons/boxes';
	import { Settings } from './js/characters/settings';
	import { MapSave } from './js/mapping/maps';
	import { Flags } from './js/scripting/quests';

	/**
	 * Main component, handling screens transitions
	 */

	const savesHolder = new SavesHolder();
	let ready = $state(false);
	savesHolder.init().then(() => {
		ready = true;
	});
	let gameContext = $state<GameContext | undefined>(undefined);
	let newGame = $state(false);
	let started = $state(DEBUG);
	let showAdmin = $state(false);
	let showDungeonLobby = $state(false);

	function checkDebugRoute(): void {
		const hash = window.location.hash;
		showAdmin = hash === '#admin';
	}

	savesHolder.selectedSave$.subscribe((value: SaveContext | undefined) => {
		if (value) {
			gameContext = value.toGameContext();
		}
	});

	savesHolder.requestNexGame$.subscribe((value) => {
		if (value) {
			newGame = true;
		}
	});

	function createDungeonSaveContext(): SaveContext {
		const player = Player.fromScratch(1, 'Explorer', 'MALE');

		const boxes: Array<PokemonBox> = new Array<PokemonBox>(32);
		for (let i = 0; i < 32; i++) {
			boxes[i] = new PokemonBox('Box ' + (i + 1), new Array(20).fill(undefined));
		}

		return new SaveContext(
			-1,
			Date.now(),
			new MapSave(0),
			player,
			boxes,
			new Settings(),
			false,
			[],
			[],
			[],
			new Flags()
		);
	}

	function startDungeonRun() {
		const save = createDungeonSaveContext();
		const ctx = save.toGameContext();

		const dCtx = new DungeonContext();
		dCtx.startRun();
		dungeonContext.set(dCtx);

		gameContext = ctx;
		started = true;
		showDungeonLobby = false;

		setTimeout(() => {
			gameContext?.changeDungeonFloor(dCtx);
		}, 100);
	}

	function continueDungeonRun() {
		const run = loadDungeonRun();
		if (!run) {
			return;
		}

		const save = createDungeonSaveContext();
		const ctx = save.toGameContext();

		const dCtx = new DungeonContext();
		dCtx.runSeed = run.runSeed;
		dCtx.currentFloor = run.currentFloor;
		dCtx.isDungeonMode = true;
		dCtx.isRunActive = true;
		dCtx.defeatedTrainers = new Set(run.defeatedTrainers);
		dCtx.pickedItems = new Set(run.pickedItems);
		dCtx.runCurrency = run.runCurrency;

		dungeonContext.set(dCtx);

		gameContext = ctx;
		started = true;
		showDungeonLobby = false;

		setTimeout(() => {
			gameContext?.changeDungeonFloor(dCtx);
		}, 100);
	}

	let battleCtx = $state<BattleContext | undefined>(undefined);

	$effect(() => {
		if (!gameContext) {
			return;
		}
		const unsub = gameContext.battleContext.subscribe((value) => {
			battleCtx = value;
		});
		return () => unsub();
	});

	const sound: Howl = new Howl({
		src: ['src/assets/audio/battle/battle-start.mp3'],
		autoplay: false,
		loop: true,
		volume: 0.7
	});
	let battleStarting = $state(false);
	let battleEnding = $state(false);

	$effect(() => {
		if (!battleCtx) {
			return;
		}
		const unsub1 = battleCtx.events.starting.subscribe((value) => {
			if (value) {
				battleStarting = value;
				if (!sound.playing()) {
					sound.play();
				}
				setTimeout(() => {
					sound.fade(0.5, 0, 500);
					battleCtx?.events?.starting?.set(false);
					battleStarting = false;
					sound.stop();
				}, 2000);
			}
		});
		const unsub2 = battleCtx.events.ending.subscribe((value) => {
			if (value) {
				battleEnding = value;
				setTimeout(() => {
					battleCtx?.events?.ending?.set(false);
					battleEnding = false;
				}, 4000);
			}
		});
		return () => {
			unsub1();
			unsub2();
		};
	});

	let rotate = $state(false);

	// Avoid IOS zoom on double tap
	if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
		window.document.addEventListener(
			'touchmove',
			(e) => {
				if ((e as TouchEvent & { scale?: number }).scale !== 1) {
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
		checkDebugRoute();
		window.addEventListener('hashchange', checkDebugRoute);
		const elem = document.getElementById('wrapper');
		if (elem?.requestFullscreen) {
			// requestFullscreen requires user gesture, wrap in try-catch
			elem.requestFullscreen().catch(() => {
				// Silently ignore - fullscreen requires user interaction
			});
		}
		//window.scrollTo(0, 1);
	});
</script>

<div id="wrapper">
	{#if showAdmin}
		{#await import('./lib/admin/AdminPage.svelte') then { default: AdminPage }}
			<AdminPage
				onClose={() => {
					showAdmin = false;
					window.location.hash = '';
				}}
			/>
		{/await}
	{:else if started}
		{#if gameContext}
			<!-- game started -->
			{#if gameContext.overWorldContext !== undefined}
				{#await import('./lib/world3d/ThrelteWorld.svelte') then { default: World }}
					<World context={gameContext} overWorldCtx={gameContext.overWorldContext} {savesHolder} />
				{/await}
			{/if}

			{#if battleCtx !== undefined && !battleStarting}
				{#await import('./lib/battle/Battle.svelte') then { default: Battle }}
					<Battle context={gameContext} overWorldCtx={gameContext.overWorldContext} {battleCtx} />
				{/await}
			{/if}

			{#if battleStarting}
				<div class="battleStart"></div>
			{/if}
			{#if battleEnding}
				<div class="battleEnd"></div>
			{/if}
		{:else if !ready}{:else if savesHolder.saves?.length > 0 && !newGame}
			<!-- select a save / start new -->
			<LoadSave {savesHolder} />
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div
				class="dungeon-entry"
				onclick={() => {
					showDungeonLobby = true;
				}}
			>
				Dungeon Mode
			</div>
		{:else}
			<!-- create a new save -->
			<PlayerCreation {savesHolder} />
		{/if}
	{:else}
		<!-- game not started -->
		{#await import('./lib/Intro.svelte') then { default: Intro }}
			<Intro bind:started />
		{/await}
	{/if}
	{#if showDungeonLobby}
		<DungeonLobby
			onStartRun={startDungeonRun}
			onContinueRun={continueDungeonRun}
			onBack={() => {
				showDungeonLobby = false;
			}}
		/>
	{/if}

	{#if rotate}
		<div class="rotate">
			<img src="src/assets/common/rotate.gif" alt="Please rotate your device" />
		</div>
	{/if}
</div>

<!-- preload every images -->

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

	#wrapper {
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

	.dungeon-entry {
		position: fixed;
		bottom: 20px;
		right: 20px;
		background: #1a1a2e;
		border: 2px solid #333;
		color: #fff;
		padding: 12px 24px;
		font-size: 1rem;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		z-index: 10;
		box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.4);

		&:hover {
			filter: brightness(1.3);
		}
	}

	.battleStart {
		opacity: 0;
		background: #000000;
		height: 100dvh;
		width: 100dvw;
		position: fixed;
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
		position: fixed;
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
</style>
