<script lang="ts">
	import { container } from 'tsyringe';
	import { Pokedex, type PokedexEntry } from '$js/pokemons/pokedex';
	import { typeChart, type PokemonType } from '$js/battle/battle-model';
	import { onMount } from 'svelte';

	interface Props {
		onSelectPokemon?: (pokemon: PokedexEntry) => void;
	}

	const { onSelectPokemon }: Props = $props();

	let pokedex: Pokedex;
	let allPokemon: PokedexEntry[] = $state([]);
	let searchQuery = $state('');
	let typeFilter = $state('');
	let selectedIndex = $state(0);

	const pokemonTypes = Object.keys(typeChart) as PokemonType[];

	const filteredPokemon = $derived(() => {
		let result = allPokemon;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(p) => p.name.toLowerCase().includes(query) || p.id.toString().includes(query)
			);
		}

		if (typeFilter) {
			result = result.filter((p) =>
				p.types.some((t: string) => t.toLowerCase() === typeFilter.toLowerCase())
			);
		}

		return result;
	});

	onMount(async () => {
		pokedex = container.resolve(Pokedex);
		await pokedex.ensureLoaded();
		allPokemon = [...pokedex.entries];
	});

	function handleSelect(pokemon: PokedexEntry) {
		if (onSelectPokemon) {
			onSelectPokemon(pokemon);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		const list = filteredPokemon();
		if (list.length === 0) {return;}

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
		if (searchQuery || typeFilter) {
			selectedIndex = 0;
		}
	});
</script>

<div class="pokemon-browser" data-testid="pokemon-browser">
	<div class="filters">
		<div class="filter-group">
			<label for="search">Search</label>
			<input
				id="search"
				type="text"
				placeholder="Name or ID..."
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
		<div class="result-count">
			{filteredPokemon().length} Pokemon
		</div>
	</div>

	<div class="pokemon-list" data-testid="pokemon-list">
		{#each filteredPokemon() as pokemon, index}
			<button
				class="pokemon-item"
				class:selected={index === selectedIndex}
				onclick={() => {
					selectedIndex = index;
					handleSelect(pokemon);
				}}
			>
				<span class="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</span>
				<span class="pokemon-name">{pokemon.name}</span>
				<span class="pokemon-types">
					{#each pokemon.types as type}
						<span class="type-badge" data-type={type.toLowerCase()}>{type}</span>
					{/each}
				</span>
			</button>
		{:else}
			<div class="no-results">No Pokemon found</div>
		{/each}
	</div>
</div>

<style>
	.pokemon-browser {
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
		min-width: 150px;
	}

	.result-count {
		font-size: 0.75rem;
		color: var(--pixel-text-muted);
		margin-left: auto;
		padding: 0.5rem;
	}

	.pokemon-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.pokemon-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem 1rem;
		background: var(--pixel-bg-panel);
		border: 2px solid transparent;
		color: var(--pixel-text-white);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.875rem;
		text-align: left;
		transition: all 0.1s;
	}

	.pokemon-item:hover {
		background: var(--pixel-bg-header);
	}

	.pokemon-item.selected {
		border-color: var(--pixel-text-gold);
		background: var(--pixel-bg-header);
	}

	.pokemon-id {
		color: var(--pixel-text-muted);
		min-width: 50px;
	}

	.pokemon-name {
		flex: 1;
	}

	.pokemon-types {
		display: flex;
		gap: 0.25rem;
	}

	.type-badge {
		padding: 0.125rem 0.5rem;
		font-size: 0.625rem;
		border-radius: 2px;
		text-transform: uppercase;
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
