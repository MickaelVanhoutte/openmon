<script lang="ts">
	import ExportButton from './components/ExportButton.svelte';
	import type { PokedexEntry, Move } from '$js/pokemons/pokedex';

	// Lazy-load all heavy tabs so their dependencies (AnimationEngine, Pokedex, etc.)
	// are split into separate async chunks and not bundled with the AdminPage shell.
	const PokedexManager = import('./tabs/PokedexManager.svelte').then((m) => m.default);
	const AddPokemon = import('./tabs/AddPokemon.svelte').then((m) => m.default);
	const AnimationsTab = import('./tabs/AnimationsTab.svelte').then((m) => m.default);
	const EvolutionTab = import('./tabs/EvolutionTab.svelte').then((m) => m.default);

	interface Props {
		onClose?: () => void;
	}

	const { onClose }: Props = $props();

	type TabId = 'pokedex-manager' | 'add-pokemon' | 'animations' | 'evolution';

	const tabs: { id: TabId; label: string }[] = [
		{ id: 'pokedex-manager', label: 'Pokedex Manager' },
		{ id: 'add-pokemon', label: 'Add Pokemon' },
		{ id: 'animations', label: 'Animations' },
		{ id: 'evolution', label: 'Evolution' }
	];

	let activeTab: TabId = $state('pokedex-manager');

	const editedPokemon: Map<number, PokedexEntry> = $state(new Map());
	const editedMoves: Map<string, Move> = $state(new Map());

	function handleClose() {
		if (onClose) {
			onClose();
		} else {
			window.location.hash = '';
		}
	}

	function handlePokemonAdded(pokemon: PokedexEntry) {
		editedPokemon.set(pokemon.id, pokemon);
	}

	function handlePokemonRemoved(pokemon: PokedexEntry) {
		editedPokemon.delete(pokemon.id);
	}
</script>

<div class="admin-page" data-testid="admin-page">
	<header class="admin-header">
		<h1>Admin Panel</h1>
		<div class="header-actions">
			<ExportButton {editedPokemon} {editedMoves} />
			<button class="close-btn" onclick={handleClose}>Close</button>
		</div>
	</header>

	<nav class="tab-nav">
		{#each tabs as tab}
			<button
				class="tab-btn"
				class:active={activeTab === tab.id}
				data-testid="{tab.id}-tab"
				onclick={() => (activeTab = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</nav>

	<main class="tab-content">
		{#if activeTab === 'pokedex-manager'}
			{#await PokedexManager then PokedexManagerCmp}
				<PokedexManagerCmp onPokemonEdited={handlePokemonAdded} />
			{/await}
		{:else if activeTab === 'add-pokemon'}
			{#await AddPokemon then AddPokemonCmp}
				<AddPokemonCmp onPokemonAdded={handlePokemonAdded} onPokemonRemoved={handlePokemonRemoved} />
			{/await}
		{:else if activeTab === 'animations'}
			{#await AnimationsTab then AnimationsTabCmp}
				<AnimationsTabCmp />
			{/await}
		{:else if activeTab === 'evolution'}
			{#await EvolutionTab then EvolutionTabCmp}
				<EvolutionTabCmp />
			{/await}
		{/if}
	</main>
</div>

<style>
	.admin-page {
		width: 100%;
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--pixel-bg-primary);
		color: var(--pixel-text-white);
		font-family: 'Press Start 2P', monospace;
		overflow: hidden;
	}

	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: var(--pixel-bg-header);
		border-bottom: 2px solid var(--pixel-border-color);
		flex-shrink: 0;
	}

	.admin-header h1 {
		font-size: 1rem;
		margin: 0;
	}

	.close-btn {
		padding: 0.375rem 0.75rem;
		background: var(--pixel-text-stat-red);
		border: 2px solid var(--pixel-border-color);
		color: var(--pixel-text-white);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.75rem;
		min-height: 44px;
	}

	.close-btn:hover {
		filter: brightness(1.1);
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.tab-nav {
		display: flex;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		background: var(--pixel-bg-panel);
		border-bottom: 2px solid var(--pixel-border-color);
		flex-shrink: 0;
	}

	.tab-nav::-webkit-scrollbar {
		display: none;
	}

	.tab-btn {
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-bottom: 3px solid transparent;
		color: var(--pixel-text-white);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.875rem;
		opacity: 0.7;
		transition: opacity 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
		min-height: 44px;
	}

	.tab-btn:hover {
		opacity: 1;
	}

	.tab-btn.active {
		opacity: 1;
		border-bottom: 3px solid var(--pixel-text-gold);
		color: var(--pixel-text-gold);
	}

	.tab-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
		padding: 0.5rem;
		min-height: 0;
	}

	@media (max-width: 768px) {
		.admin-header {
			padding: 0.375rem 0.5rem;
		}

		.admin-header h1 {
			font-size: 0.75rem;
		}

		.tab-btn {
			padding: 0.75rem 0.75rem;
			font-size: 0.625rem;
			min-height: 44px;
		}

		.tab-content {
			padding: 0.25rem;
		}
	}
</style>
