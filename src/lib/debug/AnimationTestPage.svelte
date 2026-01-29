<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		AnimationEngine,
		TYPE_COLORS,
		type PokemonSprite,
		type MoveContext
	} from '$js/battle/animations/animation-engine';
	import { type Position, type BattleSlot } from '$js/battle/animations/position-system';
	import { registerPhysicalMoves } from '$js/battle/animations/moves/physical';
	import { registerSpecialMoves } from '$js/battle/animations/moves/special';
	import { registerStatusMoves } from '$js/battle/animations/moves/status';
	import { registerOtherMoves } from '$js/battle/animations/moves/other';
	import { Pokedex } from '$js/pokemons/pokedex';
	import { container } from 'tsyringe';

	interface Props {
		onClose?: () => void;
	}

	let { onClose }: Props = $props();

	let sceneElement: HTMLDivElement;
	let engine: AnimationEngine | null = $state(null);
	let isPlaying = $state(false);
	let loopEnabled = $state(false);
	let loopInterval: ReturnType<typeof setInterval> | null = null;

	const pokedex = container.resolve(Pokedex);
	const pokemonList = pokedex.entries.slice(0, 151).map((p) => ({ id: p.id, name: p.name }));

	let allyPokemonId = $state(25);
	let enemyPokemonId = $state(6);
	let selectedCategory = $state('punch');
	let selectedType = $state('normal');

	const animationCategories = [
		{ group: 'Physical', items: ['punch', 'kick', 'slash', 'claw', 'bite', 'tackle', 'chop'] },
		{ group: 'Special', items: ['beam', 'projectile', 'burst', 'wave', 'drain'] },
		{ group: 'Status', items: ['buff', 'debuff', 'heal', 'protect', 'status-condition'] },
		{
			group: 'Other',
			items: ['multi-hit', 'ohko', 'field', 'transform', 'weather', 'terrain', 'size-change']
		}
	];

	const typeList = Object.keys(TYPE_COLORS);

	let allySprite: PokemonSprite | null = $state(null);
	let enemySprite: PokemonSprite | null = $state(null);

	function getPokemonSpritePath(id: number, isBack: boolean): string {
		const paddedId = String(id).padStart(3, '0');
		const suffix = isBack ? '_b' : '_f';
		return `/assets/sprites/pokemons/animated/${paddedId}${suffix}.gif`;
	}

	function createPosition(x: number, y: number): Position {
		return { x, y, z: 0, scale: 1, opacity: 1 };
	}

	function createSlot(side: 'player' | 'opponent', index: number): BattleSlot {
		return { side, index };
	}

	onMount(async () => {
		if (!sceneElement) return;

		engine = new AnimationEngine(sceneElement);
		engine.initialize();
		engine.setLayout('SINGLE');

		registerPhysicalMoves(engine);
		registerSpecialMoves(engine);
		registerStatusMoves(engine);
		registerOtherMoves(engine);

		setupSprites();
	});

	onDestroy(() => {
		if (loopInterval) clearInterval(loopInterval);
		engine?.cancelAll();
	});

	function setupSprites(): void {
		const allyEl = sceneElement?.querySelector('.ally-sprite') as HTMLElement;
		const enemyEl = sceneElement?.querySelector('.enemy-sprite') as HTMLElement;

		if (allyEl && enemyEl) {
			allySprite = {
				slot: createSlot('player', 0),
				element: allyEl,
				homePosition: createPosition(100, 300)
			};
			enemySprite = {
				slot: createSlot('opponent', 0),
				element: enemyEl,
				homePosition: createPosition(400, 60)
			};
		}
	}

	async function playAnimation(): Promise<void> {
		if (!engine || !allySprite || !enemySprite || isPlaying) return;

		isPlaying = true;

		const categoryToMove: Record<string, string> = {
			punch: 'mega-punch',
			kick: 'mega-kick',
			slash: 'slash',
			claw: 'scratch',
			bite: 'bite',
			tackle: 'tackle',
			chop: 'karate-chop',
			beam: 'hyper-beam',
			projectile: 'ember',
			burst: 'explosion',
			wave: 'psychic',
			drain: 'giga-drain',
			buff: 'swords-dance',
			debuff: 'growl',
			heal: 'recover',
			protect: 'protect',
			'status-condition': 'toxic',
			'multi-hit': 'fury-attack',
			ohko: 'fissure',
			field: 'stealth-rock',
			transform: 'transform',
			weather: 'rain-dance',
			terrain: 'electric-terrain',
			'size-change': 'growth'
		};

		const moveName = categoryToMove[selectedCategory] || 'tackle';
		const context: MoveContext = {
			attacker: allySprite,
			defender: enemySprite,
			moveName,
			moveCategory: getCategoryType(selectedCategory),
			moveType: selectedType
		};

		try {
			await engine.playMove(context);
		} catch (error) {
			console.error('Animation error:', error);
		}

		isPlaying = false;
	}

	function getCategoryType(category: string): 'physical' | 'special' | 'status' {
		const physicalCategories = ['punch', 'kick', 'slash', 'claw', 'bite', 'tackle', 'chop'];
		const specialCategories = ['beam', 'projectile', 'burst', 'wave', 'drain'];
		if (physicalCategories.includes(category)) return 'physical';
		if (specialCategories.includes(category)) return 'special';
		return 'status';
	}

	function toggleLoop(): void {
		loopEnabled = !loopEnabled;
		if (loopEnabled) {
			loopInterval = setInterval(() => {
				if (!isPlaying) playAnimation();
			}, 2000);
		} else if (loopInterval) {
			clearInterval(loopInterval);
			loopInterval = null;
		}
	}
</script>

<div class="animation-test-page">
	<header class="test-header">
		<h1>Animation Test Page</h1>
		{#if onClose}
			<button class="close-btn" onclick={onClose}>Close</button>
		{/if}
	</header>

	<div class="controls-panel">
		<div class="control-group">
			<label for="ally-select">Ally Pokemon:</label>
			<select id="ally-select" bind:value={allyPokemonId} onchange={setupSprites}>
				{#each pokemonList as pokemon}
					<option value={pokemon.id}>{pokemon.name}</option>
				{/each}
			</select>
		</div>

		<div class="control-group">
			<label for="enemy-select">Enemy Pokemon:</label>
			<select id="enemy-select" bind:value={enemyPokemonId} onchange={setupSprites}>
				{#each pokemonList as pokemon}
					<option value={pokemon.id}>{pokemon.name}</option>
				{/each}
			</select>
		</div>

		<div class="control-group">
			<label for="category-select">Animation:</label>
			<select id="category-select" bind:value={selectedCategory}>
				{#each animationCategories as group}
					<optgroup label={group.group}>
						{#each group.items as item}
							<option value={item}>{item}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
		</div>

		<div class="control-group">
			<label for="type-select">Type:</label>
			<select id="type-select" bind:value={selectedType}>
				{#each typeList as type}
					<option value={type}>{type}</option>
				{/each}
			</select>
		</div>

		<div class="control-group buttons">
			<button class="play-btn" onclick={playAnimation} disabled={isPlaying}>
				{isPlaying ? 'Playing...' : 'Play'}
			</button>
			<button class="loop-btn" class:active={loopEnabled} onclick={toggleLoop}>
				{loopEnabled ? 'Stop Loop' : 'Loop'}
			</button>
		</div>
	</div>

	<div class="battle-scene" bind:this={sceneElement}>
		<div class="scene-background"></div>

		<div class="ally-sprite pokemon-sprite" style="bottom: 80px; left: 100px;">
			<img src={getPokemonSpritePath(allyPokemonId, true)} alt="Ally Pokemon" />
		</div>

		<div class="enemy-sprite pokemon-sprite" style="top: 60px; right: 100px;">
			<img src={getPokemonSpritePath(enemyPokemonId, false)} alt="Enemy Pokemon" />
		</div>
	</div>

	<div class="info-panel">
		<p>Selected: <strong>{selectedCategory}</strong> ({selectedType} type)</p>
		<p>Use the controls above to test different animation categories with different type colors.</p>
	</div>
</div>

<style>
	.animation-test-page {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #1a1a2e;
		color: #eee;
		font-family: 'Press Start 2P', monospace;
	}

	.test-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: #16213e;
		border-bottom: 2px solid #0f3460;
	}

	.test-header h1 {
		font-size: 1rem;
		margin: 0;
	}

	.close-btn {
		padding: 0.5rem 1rem;
		background: #e94560;
		border: none;
		color: white;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.6rem;
	}

	.controls-panel {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 1rem 2rem;
		background: #16213e;
		border-bottom: 2px solid #0f3460;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.control-group label {
		font-size: 0.5rem;
		color: #aaa;
	}

	.control-group select {
		padding: 0.5rem;
		background: #0f3460;
		border: 1px solid #e94560;
		color: white;
		font-family: inherit;
		font-size: 0.6rem;
		min-width: 120px;
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
		font-size: 0.6rem;
	}

	.play-btn {
		background: #4ade80;
		color: #1a1a2e;
	}

	.play-btn:disabled {
		background: #666;
		cursor: not-allowed;
	}

	.loop-btn {
		background: #3b82f6;
		color: white;
	}

	.loop-btn.active {
		background: #f59e0b;
	}

	.battle-scene {
		flex: 1;
		position: relative;
		background: linear-gradient(to bottom, #87ceeb 0%, #98d8c8 50%, #90ee90 100%);
		overflow: hidden;
		min-height: 300px;
	}

	.scene-background {
		position: absolute;
		inset: 0;
		background-image: url('/assets/battle/backgrounds/grass.png');
		background-size: cover;
		background-position: center;
		opacity: 0.5;
	}

	.pokemon-sprite {
		position: absolute;
		z-index: 10;
	}

	.pokemon-sprite img {
		width: 150px;
		height: auto;
		image-rendering: pixelated;
	}

	.info-panel {
		padding: 1rem 2rem;
		background: #16213e;
		border-top: 2px solid #0f3460;
		font-size: 0.6rem;
	}

	.info-panel p {
		margin: 0.25rem 0;
	}
</style>
