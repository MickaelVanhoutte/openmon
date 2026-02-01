<script lang="ts">
	import AnimationsTab from './tabs/AnimationsTab.svelte';
	import PokemonBrowser from './tabs/PokemonBrowser.svelte';
	import MovesBrowser from './tabs/MovesBrowser.svelte';
	import PokemonEditor from './tabs/PokemonEditor.svelte';
	import MoveEditor from './tabs/MoveEditor.svelte';
	import AddContent from './tabs/AddContent.svelte';
	import ExportButton from './components/ExportButton.svelte';
	import type { PokedexEntry, Move } from '$js/pokemons/pokedex';

	interface Props {
		onClose?: () => void;
	}

	let { onClose }: Props = $props();

	type TabId =
		| 'animations'
		| 'pokemon-browser'
		| 'moves-browser'
		| 'pokemon-editor'
		| 'move-editor'
		| 'add-content';

	const tabs: { id: TabId; label: string }[] = [
		{ id: 'animations', label: 'Animations' },
		{ id: 'pokemon-browser', label: 'Pokemon Browser' },
		{ id: 'moves-browser', label: 'Moves Browser' },
		{ id: 'pokemon-editor', label: 'Pokemon Editor' },
		{ id: 'move-editor', label: 'Move Editor' },
		{ id: 'add-content', label: 'Add Content' }
	];

	let activeTab: TabId = $state('animations');

	// Shared state for selections
	let selectedPokemon: PokedexEntry | undefined = $state(undefined);
	let selectedMove: Move | undefined = $state(undefined);

	// Edited data storage
	let editedPokemon: Map<number, PokedexEntry> = $state(new Map());
	let editedMoves: Map<string, Move> = $state(new Map());

	function handleClose() {
		if (onClose) {
			onClose();
		} else {
			window.location.hash = '';
		}
	}

	function handleSelectPokemon(pokemon: PokedexEntry) {
		selectedPokemon = pokemon;
		activeTab = 'pokemon-editor';
	}

	function handleSelectMove(move: Move) {
		selectedMove = move;
		activeTab = 'move-editor';
	}

	function handleApplyPokemon(edited: PokedexEntry) {
		editedPokemon.set(edited.id, edited);
		selectedPokemon = edited;
	}

	function handleApplyMove(edited: Move) {
		editedMoves.set(edited.name, edited);
		selectedMove = edited;
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
				onclick={() => (activeTab = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</nav>

	<main class="tab-content">
		{#if activeTab === 'animations'}
			<AnimationsTab />
		{:else if activeTab === 'pokemon-browser'}
			<PokemonBrowser onSelectPokemon={handleSelectPokemon} />
		{:else if activeTab === 'moves-browser'}
			<MovesBrowser onSelectMove={handleSelectMove} />
		{:else if activeTab === 'pokemon-editor'}
			<PokemonEditor pokemon={selectedPokemon} onApply={handleApplyPokemon} />
		{:else if activeTab === 'move-editor'}
			<MoveEditor move={selectedMove} onApply={handleApplyMove} />
		{:else if activeTab === 'add-content'}
			<AddContent />
		{/if}
	</main>
</div>

<style>
	.admin-page {
		width: 100%;
		height: 100vh;
		height: 100dvh; /* Dynamic viewport height for mobile */
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
		padding: 0.5rem 0.75rem;
		background: transparent;
		border: none;
		border-bottom: 3px solid transparent;
		color: var(--pixel-text-white);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.625rem;
		opacity: 0.7;
		transition: opacity 0.2s;
		white-space: nowrap;
		flex-shrink: 0;
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
		min-height: 0; /* Important for flex child scrolling */
	}

	/* Mobile-specific adjustments */
	@media (max-width: 768px) {
		.admin-header {
			padding: 0.375rem 0.5rem;
		}

		.admin-header h1 {
			font-size: 0.75rem;
		}

		.tab-btn {
			padding: 0.375rem 0.5rem;
			font-size: 0.5rem;
		}

		.tab-content {
			padding: 0.25rem;
		}
	}
</style>
