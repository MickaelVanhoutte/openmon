<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import World from '../world/World.svelte';
	import Battle from '../battle/Battle.svelte';
	import { roguelikeContext, RoguelikePhase } from '../../js/roguelike/roguelike-context';
	import { GameContext } from '../../js/context/gameContext';
	import { SavesHolder } from '../../js/context/savesHolder';
	import type { BattleContext } from '../../js/context/battleContext';
	import type { OpenMap } from '../../js/mapping/maps';
	import { Howl } from 'howler';
	import { Pokedex } from '../../js/pokemons/pokedex';

	const TYPE_COLORS: Record<string, string> = {
		Normal: '#A8A878',
		Fire: '#F08030',
		Water: '#6890F0',
		Electric: '#F8D030',
		Grass: '#78C850',
		Ice: '#98D8D8',
		Fighting: '#C03028',
		Poison: '#A040A0',
		Ground: '#E0C068',
		Flying: '#A890F0',
		Psychic: '#F85888',
		Bug: '#A8B820',
		Rock: '#B8A038',
		Ghost: '#705898',
		Dragon: '#7038F8',
		Dark: '#705848',
		Steel: '#B8B8D0',
		Fairy: '#EE99AC'
	};

	function buildStarters() {
		const pokedex = new Pokedex();
		const starterIds = [1, 4, 7];
		return starterIds.map((id) => {
			const entry = pokedex.findById(id).result;
			const types = entry.types || [];
			return {
				id: entry.id,
				name: entry.name,
				type: types.join('/'),
				color: TYPE_COLORS[types[0]] || '#A8A878',
				sprite: entry.getSprite()
			};
		});
	}

	const starters = buildStarters();

	let phase = roguelikeContext.phase;
	let runState = roguelikeContext.runState;

	let gameContext: GameContext | undefined = undefined;
	let battleCtx: BattleContext | undefined = undefined;
	let savesHolder = new SavesHolder();
	let battleStarting = false;
	let battleEnding = false;

	let sound: Howl = new Howl({
		src: ['src/assets/audio/battle/battle-start.mp3'],
		autoplay: false,
		loop: true,
		volume: 0.7
	});

	async function selectStarter(id: number) {
		const map = await roguelikeContext.startRun(id, 'Rogue');
		if (!map) return;

		setupGameContext(map);
		roguelikeContext.phase.set(RoguelikePhase.PLAYING);
	}

	function setupGameContext(map: OpenMap) {
		gameContext = roguelikeContext.createGameContext(map);

		gameContext.battleContext.subscribe((ctx) => {
			battleCtx = ctx;
			if (ctx) {
				setupBattleSubscriptions(ctx);
			}
		});
	}

	function setupBattleSubscriptions(ctx: BattleContext) {
		ctx.events.starting.subscribe((value) => {
			if (value) {
				battleStarting = value;
				if (!sound.playing()) {
					sound.play();
				}
				setTimeout(() => {
					sound.fade(0.5, 0, 500);
					ctx.events.starting.set(false);
					battleStarting = false;
					sound.stop();
				}, 2000);
			}
		});

		ctx.events.ending.subscribe((value) => {
			if (value) {
				battleEnding = value;
				setTimeout(() => {
					ctx.events.ending.set(false);
					battleEnding = false;
				}, 4000);
			}
		});

		ctx.events.end.subscribe((result) => {
			if (result) {
				handleBattleEnd(result.win, ctx.opponent?.id);
			}
		});
	}

	function handleBattleEnd(victory: boolean, npcId?: number) {
		if (victory && npcId !== undefined) {
			roguelikeContext.onNpcDefeated(npcId);
		} else if (!victory) {
			if (roguelikeContext.runManager?.isTeamWiped()) {
				roguelikeContext.onPlayerDefeated();
			}
		}
		roguelikeContext.syncPlayerTeam();
	}

	function restart() {
		roguelikeContext.reset();
		gameContext = undefined;
		battleCtx = undefined;
		battleStarting = false;
		battleEnding = false;
	}

	onDestroy(() => {
		if (gameContext?.overWorldContext?.frames?.frameId) {
			cancelAnimationFrame(gameContext.overWorldContext.frames.frameId);
		}
		sound.unload();
	});
</script>

<div class="roguelike-container">
	{#if $runState && $phase !== RoguelikePhase.STARTER_SELECT}
		<header class="hud" transition:fly={{ y: -20, duration: 400 }}>
			<div class="hud-stat">
				<span class="label">FLOOR</span>
				<span class="value">{$runState.floor}</span>
			</div>
			<div class="hud-stat">
				<span class="label">ROOMS</span>
				<span class="value">{$runState.roomsCleared}</span>
			</div>
			<div class="hud-stat">
				<span class="label">MONEY</span>
				<span class="value">${$runState.money}</span>
			</div>
			<div class="hud-stat">
				<span class="label">TEAM</span>
				<span class="value">{$runState.team.length}/6</span>
			</div>
			{#if $runState.isRoomCleared}
				<div class="hud-stat cleared">
					<span class="value">CLEARED</span>
				</div>
			{/if}
		</header>
	{/if}

	<main class="viewport">
		{#if $phase === RoguelikePhase.STARTER_SELECT}
			<section class="starter-select" in:fade>
				<h1 class="title">Choose Your Partner</h1>
				<div class="cards">
					{#each starters as starter, i}
						<button
							class="card"
							style="--accent-color: {starter.color}; --delay: {i * 100}ms"
							onclick={() => selectStarter(starter.id)}
							in:fly={{ y: 50, delay: i * 100, duration: 500 }}
						>
							<div class="card-bg"></div>
							<div class="pokemon-sprite">
								<img src={starter.sprite} alt={starter.name} />
							</div>
							<h2>{starter.name}</h2>
							<span class="type-badge">{starter.type}</span>
						</button>
					{/each}
				</div>
			</section>
		{:else if $phase === RoguelikePhase.PLAYING && gameContext}
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
		{:else if $phase === RoguelikePhase.VICTORY}
			<section class="victory-view" in:scale>
				<h1>VICTORY!</h1>
				<p>You have conquered the dungeon.</p>
				<p>Rooms cleared: {$runState?.roomsCleared ?? 0}</p>
				<button class="btn btn-primary" onclick={restart}>Start New Run</button>
			</section>
		{:else if $phase === RoguelikePhase.DEFEAT}
			<section class="defeat-view" in:scale>
				<h1>DEFEAT</h1>
				<p>Your team was wiped out...</p>
				<button class="btn btn-danger" onclick={restart}>Try Again</button>
			</section>
		{/if}
	</main>
</div>

<style lang="scss">
	$color-bg: #1a1b26;
	$color-text: #a9b1d6;
	$color-primary: #7aa2f7;
	$color-secondary: #bb9af7;
	$color-success: #9ece6a;
	$color-danger: #f7768e;

	.roguelike-container {
		width: 100%;
		height: 100vh;
		background-color: transparent;
		color: $color-text;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.hud {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		padding: 0.5rem 1rem;
		display: flex;
		justify-content: center;
		gap: 2rem;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		z-index: 100;

		.hud-stat {
			display: flex;
			flex-direction: column;
			align-items: center;

			.label {
				font-size: 0.6rem;
				opacity: 0.7;
				letter-spacing: 1px;
			}
			.value {
				font-size: 1rem;
				font-weight: bold;
				color: $color-primary;
			}

			&.cleared .value {
				color: $color-success;
			}
		}
	}

	.viewport {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		width: 100%;
		height: 100%;
		background: transparent;

		:global(.world-wrapper) {
			width: 100%;
			height: 100%;
			position: relative;
			z-index: 1;
		}

		:global(canvas) {
			z-index: 10 !important;
		}
	}

	section {
		width: 100%;
		max-width: 800px;
		padding: 2rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	h1 {
		font-size: 3rem;
		margin: 0;
		background: linear-gradient(135deg, $color-primary, $color-secondary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		text-transform: uppercase;
		letter-spacing: 2px;
	}

	.btn {
		padding: 1rem 2rem;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: bold;
		cursor: pointer;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		text-transform: uppercase;
		letter-spacing: 1px;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
		}

		&-primary {
			background: $color-primary;
			color: #000;
		}
		&-danger {
			background: $color-danger;
			color: #000;
		}
	}

	.starter-select {
		.cards {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 2rem;
			width: 100%;
			margin-top: 2rem;
		}

		.card {
			position: relative;
			background: rgba(255, 255, 255, 0.05);
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 16px;
			padding: 2rem;
			display: flex;
			flex-direction: column;
			align-items: center;
			cursor: pointer;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			overflow: hidden;

			&:hover {
				transform: translateY(-10px);
				border-color: var(--accent-color);

				.card-bg {
					opacity: 0.2;
				}

				.pokemon-sprite img {
					transform: scale(1.2);
				}
			}

			.card-bg {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(135deg, transparent, var(--accent-color));
				opacity: 0;
				transition: opacity 0.3s;
				z-index: 0;
			}

			.pokemon-sprite {
				width: 120px;
				height: 120px;
				position: relative;
				z-index: 1;

				img {
					width: 100%;
					height: 100%;
					object-fit: contain;
					image-rendering: pixelated;
					transition: transform 0.3s;
				}
			}

			h2 {
				margin: 1rem 0 0.5rem;
				font-size: 1.5rem;
				z-index: 1;
			}

			.type-badge {
				background: rgba(0, 0, 0, 0.3);
				padding: 0.25rem 0.75rem;
				border-radius: 20px;
				font-size: 0.8rem;
				z-index: 1;
			}
		}
	}

	.battleStart {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: black;
		animation: flash 0.15s ease-in-out infinite;
		z-index: 1000;
	}

	.battleEnd {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: black;
		opacity: 0;
		animation: fadeIn 2s ease-in-out forwards;
		z-index: 1000;
	}

	@keyframes flash {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	@keyframes fadeIn {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
