<script lang="ts">
	import AnimationsTab from './tabs/AnimationsTab.svelte';
	import PokemonBrowser from './tabs/PokemonBrowser.svelte';
	import MovesBrowser from './tabs/MovesBrowser.svelte';
	import PokemonEditor from './tabs/PokemonEditor.svelte';
	import MoveEditor from './tabs/MoveEditor.svelte';
	import AddContent from './tabs/AddContent.svelte';

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

	function handleClose() {
		if (onClose) {
			onClose();
		} else {
			window.location.hash = '';
		}
	}
</script>

<div class="admin-page" data-testid="admin-page">
	<header class="admin-header">
		<h1>Admin Panel</h1>
		<button class="close-btn" onclick={handleClose}>Close</button>
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
			<PokemonBrowser />
		{:else if activeTab === 'moves-browser'}
			<MovesBrowser />
		{:else if activeTab === 'pokemon-editor'}
			<PokemonEditor />
		{:else if activeTab === 'move-editor'}
			<MoveEditor />
		{:else if activeTab === 'add-content'}
			<AddContent />
		{/if}
	</main>
</div>

<style>
	.admin-page {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--pixel-bg-primary);
		color: var(--pixel-text-white);
		font-family: 'Press Start 2P', monospace;
	}

	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: var(--pixel-bg-header);
		border-bottom: 2px solid var(--pixel-border-color);
	}

	.admin-header h1 {
		font-size: 1.5rem;
		margin: 0;
	}

	.close-btn {
		padding: 0.5rem 1rem;
		background: var(--pixel-text-stat-red);
		border: 2px solid var(--pixel-border-color);
		color: var(--pixel-text-white);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.875rem;
	}

	.close-btn:hover {
		filter: brightness(1.1);
	}

	.tab-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		background: var(--pixel-bg-panel);
		border-bottom: 2px solid var(--pixel-border-color);
	}

	.tab-btn {
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-bottom: 3px solid transparent;
		color: var(--pixel-text-white);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.75rem;
		opacity: 0.7;
		transition: opacity 0.2s;
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
		overflow: auto;
		padding: 1rem;
	}
</style>
