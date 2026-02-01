<script lang="ts">
	import { container } from 'tsyringe';
	import { Pokedex, Move } from '$js/pokemons/pokedex';
	import { typeChart, type PokemonType } from '$js/battle/battle-model';
	import { onMount } from 'svelte';

	interface Props {
		onSelectMove?: (move: Move) => void;
	}

	let { onSelectMove }: Props = $props();

	let pokedex: Pokedex;
	let allMoves: Move[] = $state([]);
	let searchQuery = $state('');
	let typeFilter = $state('');
	let categoryFilter = $state('');
	let selectedIndex = $state(0);

	const pokemonTypes = Object.keys(typeChart) as PokemonType[];
	const categories = ['physical', 'special', 'no-damage'];

	let filteredMoves = $derived(() => {
		let result = allMoves;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter((m) => m.name.toLowerCase().includes(query));
		}

		if (typeFilter) {
			result = result.filter((m) => m.type.toLowerCase() === typeFilter.toLowerCase());
		}

		if (categoryFilter) {
			result = result.filter((m) => m.category === categoryFilter);
		}

		return result;
	});

	onMount(async () => {
		pokedex = container.resolve(Pokedex);
		await pokedex.ensureLoaded();

		// Aggregate unique moves from all Pokemon
		const moveMap = new Map<string, Move>();
		for (const pokemon of pokedex.entries) {
			if (pokemon.moves) {
				for (const move of pokemon.moves) {
					// Use name as key for deduplication
					if (!moveMap.has(move.name)) {
						moveMap.set(move.name, move);
					}
				}
			}
		}

		// Sort by name
		allMoves = Array.from(moveMap.values()).sort((a, b) => a.name.localeCompare(b.name));
	});

	function handleSelect(move: Move) {
		if (onSelectMove) {
			onSelectMove(move);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		const list = filteredMoves();
		if (list.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, list.length - 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			handleSelect(list[selectedIndex]);
		}
	}

	$effect(() => {
		// Reset selection when filter changes
		if (searchQuery || typeFilter || categoryFilter) {
			selectedIndex = 0;
		}
	});
</script>

<div class="moves-browser" data-testid="moves-browser">
	<div class="filters">
		<div class="filter-group">
			<label for="search">Search</label>
			<input
				id="search"
				type="text"
				placeholder="Move name..."
				bind:value={searchQuery}
				onkeydown={handleKeydown}
			/>
		</div>
		<div class="filter-group">
			<label for="type-filter">Type</label>
			<select id="type-filter" bind:value={typeFilter}>
				<option value="">All Types</option>
				{#each pokemonTypes as type}
					<option value={type}>{type}</option>
				{/each}
			</select>
		</div>
		<div class="filter-group">
			<label for="category-filter">Category</label>
			<select id="category-filter" bind:value={categoryFilter}>
				<option value="">All Categories</option>
				{#each categories as cat}
					<option value={cat}>{cat}</option>
				{/each}
			</select>
		</div>
		<div class="result-count">
			{filteredMoves().length} Moves
		</div>
	</div>

	<div class="moves-list" data-testid="moves-list">
		{#each filteredMoves() as move, index}
			<button
				class="move-item"
				class:selected={index === selectedIndex}
				onclick={() => {
					selectedIndex = index;
					handleSelect(move);
				}}
			>
				<span class="move-name">{move.name}</span>
				<span class="move-type type-badge" data-type={move.type.toLowerCase()}>{move.type}</span>
				<span class="move-category">{move.category}</span>
				<span class="move-power">{move.power || '-'}</span>
				<span class="move-accuracy">{move.accuracy || '-'}%</span>
				<span class="move-pp">{move.pp} PP</span>
			</button>
		{:else}
			<div class="no-results">No moves found</div>
		{/each}
	</div>
</div>

<style>
	.moves-browser {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 1rem;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: flex-end;
		padding: 0.5rem;
		background: var(--pixel-bg-panel);
		border: 2px solid var(--pixel-border-color);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.filter-group label {
		font-size: 0.75rem;
		color: var(--pixel-text-muted);
	}

	.filter-group input,
	.filter-group select {
		padding: 0.5rem;
		background: var(--pixel-bg-primary);
		border: 2px solid var(--pixel-accent-blue);
		color: var(--pixel-text-white);
		font-family: inherit;
		font-size: 0.875rem;
		min-width: 120px;
	}

	.result-count {
		font-size: 0.75rem;
		color: var(--pixel-text-muted);
		margin-left: auto;
		padding: 0.5rem;
	}

	.moves-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.move-item {
		display: grid;
		grid-template-columns: 1fr 80px 80px 50px 60px 50px;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--pixel-bg-panel);
		border: 2px solid transparent;
		color: var(--pixel-text-white);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.75rem;
		text-align: left;
		transition: all 0.1s;
	}

	.move-item:hover {
		background: var(--pixel-bg-header);
	}

	.move-item.selected {
		border-color: var(--pixel-text-gold);
		background: var(--pixel-bg-header);
	}

	.move-name {
		font-weight: bold;
	}

	.move-category {
		text-transform: capitalize;
		color: var(--pixel-text-muted);
	}

	.move-power,
	.move-accuracy,
	.move-pp {
		text-align: right;
		color: var(--pixel-text-muted);
	}

	.type-badge {
		padding: 0.125rem 0.5rem;
		font-size: 0.625rem;
		border-radius: 2px;
		text-transform: uppercase;
		text-align: center;
		background: var(--pixel-accent-blue);
	}

	.type-badge[data-type='fire'] {
		background: #f08030;
	}
	.type-badge[data-type='water'] {
		background: #6890f0;
	}
	.type-badge[data-type='grass'] {
		background: #78c850;
	}
	.type-badge[data-type='electric'] {
		background: #f8d030;
		color: #000;
	}
	.type-badge[data-type='psychic'] {
		background: #f85888;
	}
	.type-badge[data-type='ice'] {
		background: #98d8d8;
		color: #000;
	}
	.type-badge[data-type='dragon'] {
		background: #7038f8;
	}
	.type-badge[data-type='dark'] {
		background: #705848;
	}
	.type-badge[data-type='fairy'] {
		background: #ee99ac;
	}
	.type-badge[data-type='normal'] {
		background: #a8a878;
	}
	.type-badge[data-type='fighting'] {
		background: #c03028;
	}
	.type-badge[data-type='flying'] {
		background: #a890f0;
	}
	.type-badge[data-type='poison'] {
		background: #a040a0;
	}
	.type-badge[data-type='ground'] {
		background: #e0c068;
		color: #000;
	}
	.type-badge[data-type='rock'] {
		background: #b8a038;
	}
	.type-badge[data-type='bug'] {
		background: #a8b820;
	}
	.type-badge[data-type='ghost'] {
		background: #705898;
	}
	.type-badge[data-type='steel'] {
		background: #b8b8d0;
		color: #000;
	}

	.no-results {
		padding: 2rem;
		text-align: center;
		color: var(--pixel-text-muted);
	}
</style>
