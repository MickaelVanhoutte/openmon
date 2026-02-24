<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Pokedex } from '$js/pokemons/pokedex';
	import { container } from 'tsyringe';

	interface Props {
		onClose?: () => void;
	}

	const { onClose }: Props = $props();

	const pokedex = container.resolve(Pokedex);
	let pokemonWithEvolutions: { id: number; name: string; evolutionName: string }[] = $state([]);
	let selectedPokemonId = $state(1); // Bulbasaur
	let isPlaying = $state(false);
	let loopEnabled = $state(false);
	let loopInterval: ReturnType<typeof setInterval> | null = null;

	let currentImg: HTMLImageElement;
	let nextImg: HTMLImageElement;
	let circlesWrap: HTMLDivElement;
	let bubblesWrap: HTMLDivElement;

	const animationTime = 13;

	onMount(async () => {
		await pokedex.ensureLoaded();
		pokemonWithEvolutions = pokedex.entries
			.filter((e) => e.evolution?.some((evo) => evo.method === 'level'))
			.map((e) => {
				const evoId = e.evolution.find((evo) => evo.method === 'level')?.id;
				const evoName = evoId ? pokedex.findById(evoId).result?.name : 'Unknown';
				return {
					id: e.id,
					name: e.name,
					evolutionName: evoName
				};
			});

		// Set default if available
		if (pokemonWithEvolutions.length > 0) {
			selectedPokemonId = pokemonWithEvolutions[0].id;
		}
	});

	onDestroy(() => {
		if (loopInterval) {
			clearInterval(loopInterval);
		}
	});

	function playEvolution() {
		if (isPlaying) return;

		const entry = pokedex.entries.find((e) => e.id === selectedPokemonId);
		if (!entry) return;

		const evoData = entry.evolution.find((e) => e.method === 'level');
		if (!evoData) return;

		const evoEntry = pokedex.findById(evoData.id);
		if (!evoEntry.found) return;

		isPlaying = true;

		// Get sprites
		// Use level 5 as default, doesn't matter much for sprite
		const currentSprite = entry.instanciate(5, 0, false).getSprite();
		const nextSprite = evoEntry.result.instanciate(5, 0, false).getSprite();

		// Reset elements
		const circles = [...circlesWrap.children] as HTMLDivElement[];
		const bubbles = [...bubblesWrap.children] as HTMLDivElement[];

		// Setup images
		currentImg.src = currentSprite;
		currentImg.classList.remove('current');
		currentImg.style.animation = `evolve-out ${animationTime}s forwards`;

		nextImg.src = nextSprite;
		nextImg.classList.add('current');
		nextImg.style.animation = `evolve-in ${animationTime}s forwards`;

		// Trigger animations
		circles.map((el, i) => (el.style.animation = `tunnel ${animationTime}s linear ${i * 0.1}s`));
		bubbles.map(
			(el, i) => (el.style.animation = `bubble .4s reverse ${animationTime - 2 + i * 0.05}s`)
		);

		// Cleanup after animation
		setTimeout(
			() => {
				circles.map((el) => (el.style.animation = ``));
				bubbles.map((el) => (el.style.animation = ``));

				currentImg.style.animation = '';
				currentImg.classList.add('current');
				// Reset to initial state visually (though logic would normally swap them)
				// For preview, we just reset so we can play again

				nextImg.style.animation = '';
				nextImg.classList.remove('current');

				isPlaying = false;
			},
			animationTime * 1000 + 2500
		);
	}

	function toggleLoop() {
		loopEnabled = !loopEnabled;
		if (loopEnabled) {
			if (!isPlaying) playEvolution();
			loopInterval = setInterval(() => {
				if (!isPlaying) {
					playEvolution();
				}
			}, 18000);
		} else if (loopInterval) {
			clearInterval(loopInterval);
			loopInterval = null;
		}
	}
</script>

<div class="evolution-test-page">
	<header class="test-header">
		<h1>Evolution Test Page</h1>
		{#if onClose}
			<button class="close-btn" onclick={onClose}>Close</button>
		{/if}
	</header>

	<div class="controls-panel">
		<div class="control-group">
			<label for="pokemon-select">Pokemon:</label>
			<select id="pokemon-select" bind:value={selectedPokemonId}>
				{#each pokemonWithEvolutions as p}
					<option value={p.id}>{p.name} → {p.evolutionName}</option>
				{/each}
			</select>
		</div>

		<div class="control-group buttons">
			<button class="play-btn" onclick={playEvolution} disabled={isPlaying}>
				{isPlaying ? 'Playing...' : 'Play'}
			</button>
			<button class="loop-btn" class:active={loopEnabled} onclick={toggleLoop}>
				{loopEnabled ? 'Stop Loop' : 'Loop'}
			</button>
		</div>
	</div>

	<div class="evolution-scene" class:fullscreen={isPlaying}>
		<div class="evolve">
			<img src="" alt="evolve" class="pokemon current" bind:this={currentImg} />
			<img src="" alt="evolve" class="pokemon" bind:this={nextImg} />
		</div>
		<div class="circle-wrap" bind:this={circlesWrap}>
			<div class="circle c1"></div>
			<div class="circle c2"></div>
			<div class="circle c3"></div>
			<div class="circle c4"></div>
			<div class="circle c5"></div>
		</div>

		<div class="bubble-wrap" bind:this={bubblesWrap}>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
			<div class="bubble"></div>
		</div>
	</div>

	<div class="info-panel">
		<p>Select a Pokemon to preview its evolution animation.</p>
	</div>
</div>

<style lang="scss">
	@use 'sass:math';
	.evolution-test-page {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--pixel-bg-primary);
		color: var(--pixel-text-white);
		font-family: 'Press Start 2P', monospace;
	}

	.test-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: var(--pixel-bg-header);
		border-bottom: 2px solid var(--pixel-border-color);
	}

	.test-header h1 {
		font-size: 2rem;
		margin: 0;
	}

	.close-btn {
		padding: 0.5rem 1rem;
		background: var(--pixel-text-stat-red);
		border: 2px solid var(--pixel-border-color);
		color: var(--pixel-text-white);
		cursor: pointer;
		font-family: inherit;
		font-size: 1rem;
	}

	.controls-panel {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 1rem 2rem;
		background: var(--pixel-bg-panel);
		border-bottom: 2px solid var(--pixel-border-color);
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.control-group label {
		font-size: 1rem;
		color: var(--pixel-text-muted);
	}

	.control-group select {
		padding: 0.5rem;
		background: var(--pixel-bg-primary);
		border: 2px solid var(--pixel-accent-blue);
		color: var(--pixel-text-white);
		font-family: inherit;
		font-size: 16px;
		min-width: 200px;
		border-radius: 4px;
	}

	.control-group.buttons {
		flex-direction: row;
		align-items: flex-end;
		gap: 0.5rem;
	}

	.play-btn,
	.loop-btn {
		padding: 0.5rem 1.5rem;
		border: none;
		cursor: pointer;
		font-family: inherit;
		font-size: 1.5rem;
		border-radius: 4px;
	}

	.play-btn {
		background: var(--pixel-accent-gold);
		color: var(--pixel-bg-primary);
	}

	.play-btn:disabled {
		background: var(--pixel-text-muted);
		cursor: not-allowed;
	}

	.loop-btn {
		background: var(--pixel-accent-blue);
		color: var(--pixel-text-white);
	}

	.loop-btn.active {
		background: var(--pixel-text-gold);
	}

	.info-panel {
		padding: 1rem 2rem;
		background: var(--pixel-bg-panel);
		border-top: 2px solid var(--pixel-border-color);
		font-size: 1rem;
	}

	/* Evolution Scene Styles */
	.evolution-scene {
		flex: 1;
		position: relative;
		background: #1c4b72;
		overflow: hidden;
		min-height: 400px;
		display: flex;
		justify-content: center;
		align-items: center;

		&.fullscreen {
			position: fixed;
			top: 0;
			left: 0;
			width: 100dvw;
			height: 100dvh;
			z-index: 9999;
			min-height: unset;
		}
	}

	.evolve {
		display: flex;
		height: 75%;
		width: 100%;
		justify-content: center;
		align-items: center;
		position: relative;

		img.pokemon {
			width: auto;
			max-height: 60%;
			display: block;
			margin: auto;
			user-select: none;
			position: absolute;
			opacity: 1;
			visibility: visible;

			&:not(.current) {
				opacity: 0;
				visibility: hidden;
			}
		}
	}

	.circle {
		position: absolute;
		left: 50%;
		top: 40%;
		margin: calc(-1 * (45dvh / 2)) 0 0 calc(-1 * (45dvh / 2));
		width: 45dvh;
		height: 45dvh;
		border-radius: 50% !important;
		opacity: 0;

		&.c1 {
			box-shadow: 0 0 8px 65px rgba(128, 206, 255, 0.5);
		}
		&.c2 {
			box-shadow: 0 0 8px 65px rgba(117, 202, 255, 0.65);
		}
		&.c3 {
			box-shadow: 0 0 8px 65px rgba(87, 190, 255, 0.8);
		}
		&.c4 {
			box-shadow: 0 0 8px 65px rgba(117, 202, 255, 0.65);
		}
		&.c5 {
			box-shadow: 0 0 8px 65px rgba(128, 206, 255, 0.5);
		}
	}

	.bubble-wrap {
		.bubble {
			position: absolute;
			left: 50%;
			top: 6%;
			opacity: 0;
			border-radius: 50% !important;
		}

		@for $i from 1 through 20 {
			.bubble:nth-child(#{$i}) {
				$size: math.random(30) + px;
				height: $size;
				width: $size;
				margin: calc(-1 * ($size / 2)) 0 0 calc(-1 * ($size / 2));
				transform: translate(math.random(300) - 150px, math.random(100)-200px);
				animation-delay: $i * 0.05s;
				background: hsl(0deg, 0%, 100%);
			}
		}
	}

	@keyframes -global-evolve-out {
		0% {
			visibility: visible;
			filter: brightness(100%);
			transform: scale(1);
		}
		16.6%,
		33.2%,
		41.5%,
		49.8%,
		53.95%,
		58.1%,
		62.25%,
		66.4%,
		68.475%,
		70.55%,
		72.625%,
		74.7%,
		76.775%,
		78.85%,
		80.925% {
			filter: brightness(0%) invert(100%);
			opacity: 1;
			transform: scale(1);
		}
		24.9%,
		37.35%,
		45.65%,
		51.875%,
		56.025%,
		60.175%,
		64.325%,
		67.4375%,
		69.5125%,
		71.5875%,
		73.6625%,
		75.7375%,
		77.8125%,
		79.8875%,
		81.9625% {
			filter: brightness(0%) invert(100%);
			opacity: 0;
			transform: scale(0.25);
		}
		83.3%,
		100% {
			visibility: hidden;
			filter: brightness(0%) invert(100%);
			opacity: 0;
			transform: scale(0.25);
		}
	}

	@keyframes -global-evolve-in {
		0%,
		16.6%,
		33.2%,
		41.5%,
		49.8%,
		53.95%,
		58.1%,
		62.25%,
		66.4%,
		68.475%,
		70.55%,
		72.625%,
		74.7%,
		76.775%,
		78.85%,
		80.925% {
			visibility: visible;
			filter: brightness(0%) invert(100%);
			opacity: 0;
			transform: scale(0.25);
		}
		24.9%,
		37.35%,
		45.65%,
		51.875%,
		56.025%,
		60.175%,
		64.325%,
		67.4375%,
		69.5125%,
		71.5875%,
		73.6625%,
		75.7375%,
		77.8125%,
		79.8875%,
		81.9625%,
		96% {
			filter: brightness(0%) invert(100%);
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 1;
			filter: brightness(100%);
			transform: scale(1);
			visibility: visible;
		}
	}

	@keyframes -global-tunnel {
		0%,
		16.517%,
		33.283%,
		41.583%,
		49.883%,
		58.183%,
		66.483%,
		83.083% {
			transform: scale(0.6);
			opacity: 0;
		}
		16.6%,
		33.366%,
		41.666%,
		49.966%,
		58.266%,
		66.566%,
		83.166% {
			transform: scale(0.6);
			opacity: 1;
		}
		20.75%,
		37.35%,
		45.65%,
		53.95%,
		62.25%,
		70.55%,
		87.15% {
			transform: scale(3.5);
			opacity: 1;
		}
		24.9%,
		41.5%,
		49.8%,
		58.1%,
		66.4%,
		74.7%,
		91.3% {
			transform: scale(7);
			opacity: 0;
		}
	}

	@keyframes -global-bubble {
		100% {
			transform: translate(0, 140px);
			opacity: 0;
		}
		90%,
		10% {
			opacity: 1;
		}
		5%,
		0% {
			opacity: 0;
		}
	}
</style>
