<script lang="ts">
	import { container } from 'tsyringe';
	import { Pokedex, PokedexEntry, Move, MoveEffect } from '$js/pokemons/pokedex';
	import { onMount } from 'svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	interface Props {
		onPokemonEdited?: (pokemon: PokedexEntry) => void;
	}

	const { onPokemonEdited }: Props = $props();

	let pokedex: Pokedex;
	let pokemonList: PokedexEntry[] = $state([]);
	let searchQuery = $state('');
	let isLoading = $state(true);
	let editingPokemon: PokedexEntry | null = $state(null);
	let editingIndex = $state(0);
	let hasChanges = $state(false);

	const filteredPokemon = $derived(() => {
		if (!searchQuery) return pokemonList;
		const query = searchQuery.toLowerCase();
		return pokemonList.filter(
			(p) =>
				p.name.toLowerCase().includes(query) ||
				p.id.toString().includes(query) ||
				p.types.some((t) => t.toLowerCase().includes(query))
		);
	});

	onMount(async () => {
		pokedex = container.resolve(Pokedex);
		await pokedex.ensureLoaded();
		pokemonList = [...pokedex.entries].map((p, i) => ({
			...p,
			_dndId: p.id
		})) as PokedexEntry[];
		isLoading = false;
	});

	function handleDndConsider(e: CustomEvent) {
		pokemonList = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent) {
		pokemonList = e.detail.items;
		updateRegionalIds();
		hasChanges = true;
	}

	function updateRegionalIds() {
		pokemonList.forEach((p, index) => {
			p.regionalId = index + 1;
		});
		pokedex.entries = [...pokemonList];
	}

	function openEditor(pokemon: PokedexEntry) {
		editingIndex = pokemonList.findIndex((p) => p.id === pokemon.id);
		editingPokemon = { ...pokemon };
	}

	function closeEditor() {
		editingPokemon = null;
	}

	function saveAndClose() {
		if (editingPokemon) {
			const idx = pokemonList.findIndex((p) => p.id === editingPokemon!.id);
			if (idx !== -1) {
				pokemonList[idx] = { ...editingPokemon };
				pokemonList = [...pokemonList];
				pokedex.entries = [...pokemonList];
				hasChanges = true;
				onPokemonEdited?.(editingPokemon);
			}
		}
		closeEditor();
	}

	function navigatePrev() {
		if (editingIndex > 0) {
			saveCurrentEdits();
			editingIndex--;
			editingPokemon = { ...pokemonList[editingIndex] };
		}
	}

	function navigateNext() {
		if (editingIndex < pokemonList.length - 1) {
			saveCurrentEdits();
			editingIndex++;
			editingPokemon = { ...pokemonList[editingIndex] };
		}
	}

	function saveCurrentEdits() {
		if (editingPokemon) {
			const idx = pokemonList.findIndex((p) => p.id === editingPokemon!.id);
			if (idx !== -1) {
				pokemonList[idx] = { ...editingPokemon };
				pokemonList = [...pokemonList];
				hasChanges = true;
			}
		}
	}

	function updateStat(stat: string, value: number) {
		if (editingPokemon && editingPokemon.stats) {
			(editingPokemon.stats as Record<string, number>)[stat] = value;
			editingPokemon = { ...editingPokemon };
		}
	}

	function removeMove(moveIndex: number) {
		if (editingPokemon) {
			editingPokemon.moves = editingPokemon.moves.filter((_, i) => i !== moveIndex);
			editingPokemon = { ...editingPokemon };
		}
	}
</script>

<div class="pokedex-manager" data-testid="pokedex-manager-tab">
	{#if editingPokemon}
		<div class="fullscreen-editor" data-testid="fullscreen-editor">
			<header class="editor-header">
				<button class="nav-btn" onclick={navigatePrev} disabled={editingIndex === 0}> Prev </button>
				<span class="editor-title">
					#{editingPokemon.id}
					{editingPokemon.name}
					<span class="position">({editingIndex + 1}/{pokemonList.length})</span>
				</span>
				<button
					class="nav-btn"
					onclick={navigateNext}
					disabled={editingIndex === pokemonList.length - 1}
				>
					Next
				</button>
			</header>

			<div class="editor-content">
				<section class="editor-section">
					<h3>Basic Info</h3>
					<div class="form-row">
						<label>Name</label>
						<input type="text" bind:value={editingPokemon.name} />
					</div>
					<div class="form-row">
						<label>Regional ID</label>
						<input type="number" bind:value={editingPokemon.regionalId} readonly />
					</div>
					<div class="form-row">
						<label>Types</label>
						<div class="types-display">
							{#each editingPokemon.types as type}
								<span class="type-badge {type}">{type}</span>
							{/each}
						</div>
					</div>
				</section>

				<section class="editor-section">
					<h3>Base Stats</h3>
					<div class="stats-grid">
						<div class="stat-row">
							<label>HP</label>
							<input
								type="number"
								value={editingPokemon.stats?.hp ?? 0}
								onchange={(e) => updateStat('hp', parseInt(e.currentTarget.value))}
							/>
						</div>
						<div class="stat-row">
							<label>Attack</label>
							<input
								type="number"
								value={editingPokemon.stats?.attack ?? 0}
								onchange={(e) => updateStat('attack', parseInt(e.currentTarget.value))}
							/>
						</div>
						<div class="stat-row">
							<label>Defense</label>
							<input
								type="number"
								value={editingPokemon.stats?.defense ?? 0}
								onchange={(e) => updateStat('defense', parseInt(e.currentTarget.value))}
							/>
						</div>
						<div class="stat-row">
							<label>Sp.Atk</label>
							<input
								type="number"
								value={editingPokemon.stats?.spAttack ?? 0}
								onchange={(e) => updateStat('spAttack', parseInt(e.currentTarget.value))}
							/>
						</div>
						<div class="stat-row">
							<label>Sp.Def</label>
							<input
								type="number"
								value={editingPokemon.stats?.spDefense ?? 0}
								onchange={(e) => updateStat('spDefense', parseInt(e.currentTarget.value))}
							/>
						</div>
						<div class="stat-row">
							<label>Speed</label>
							<input
								type="number"
								value={editingPokemon.stats?.speed ?? 0}
								onchange={(e) => updateStat('speed', parseInt(e.currentTarget.value))}
							/>
						</div>
					</div>
				</section>

				<section class="editor-section">
					<h3>Moves ({editingPokemon.moves?.length ?? 0})</h3>
					<div class="moves-list">
						{#each editingPokemon.moves ?? [] as move, i (move.id + '-' + i)}
							<div class="move-item">
								<span class="move-name">{move.name}</span>
								<span class="move-type type-badge {move.type}">{move.type}</span>
								<span class="move-power">{move.power || '-'}</span>
								<button class="remove-move-btn" onclick={() => removeMove(i)}>X</button>
							</div>
						{/each}
					</div>
				</section>
			</div>

			<footer class="editor-footer">
				<button class="cancel-btn" onclick={closeEditor}>Cancel</button>
				<button class="save-btn" onclick={saveAndClose}>Save & Close</button>
			</footer>
		</div>
	{:else}
		<div class="list-view">
			<div class="search-bar">
				<input
					type="text"
					placeholder="Search by name, ID, or type..."
					bind:value={searchQuery}
					data-testid="pokemon-search"
				/>
				{#if hasChanges}
					<span class="changes-indicator">Unsaved changes</span>
				{/if}
			</div>

			{#if isLoading}
				<div class="loading">Loading...</div>
			{:else}
				<div class="pokemon-count">
					{filteredPokemon().length} Pokemon
					{#if searchQuery}(filtered){/if}
				</div>
				<div
					class="pokemon-list"
					use:dndzone={{
						items: searchQuery ? filteredPokemon() : pokemonList,
						flipDurationMs: 200
					}}
					onconsider={handleDndConsider}
					onfinalize={handleDndFinalize}
				>
					{#each searchQuery ? filteredPokemon() : pokemonList as pokemon (pokemon.id)}
						<div
							class="pokemon-item"
							data-testid="pokemon-list-item"
							animate:flip={{ duration: 200 }}
						>
							<div class="drag-handle">&#9776;</div>
							<div class="pokemon-info" onclick={() => openEditor(pokemon)}>
								<span class="regional-id">#{pokemon.regionalId}</span>
								<span class="pokemon-name">{pokemon.name}</span>
								<span class="pokemon-types">
									{#each pokemon.types as type}
										<span class="type-badge {type}">{type}</span>
									{/each}
								</span>
								<span class="move-count">{pokemon.moves?.length ?? 0} moves</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.pokedex-manager {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.list-view {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.search-bar {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-shrink: 0;
		margin-bottom: 0.5rem;
	}

	.search-bar input {
		flex: 1;
		padding: 0.75rem;
		background: var(--pixel-bg-input, #1a1a2e);
		border: 2px solid var(--pixel-border-color, #3d3d5c);
		color: var(--pixel-text-white, #fff);
		font-family: inherit;
		font-size: 0.75rem;
		min-height: 44px;
	}

	.changes-indicator {
		font-size: 0.625rem;
		color: var(--pixel-text-gold, #ffd700);
		white-space: nowrap;
	}

	.loading,
	.pokemon-count {
		text-align: center;
		padding: 0.5rem;
		font-size: 0.625rem;
		opacity: 0.7;
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
		padding: 0.5rem;
		background: var(--pixel-bg-panel, #252540);
		border: 2px solid var(--pixel-border-color, #3d3d5c);
		cursor: grab;
		min-height: 44px;
	}

	.pokemon-item:active {
		cursor: grabbing;
	}

	.drag-handle {
		padding: 0.5rem;
		opacity: 0.5;
		font-size: 1rem;
	}

	.pokemon-info {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.25rem;
	}

	.pokemon-info:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.regional-id {
		font-size: 0.625rem;
		opacity: 0.6;
		min-width: 30px;
	}

	.pokemon-name {
		font-size: 0.75rem;
		flex: 1;
	}

	.pokemon-types {
		display: flex;
		gap: 0.25rem;
	}

	.move-count {
		font-size: 0.5rem;
		opacity: 0.5;
	}

	.type-badge {
		font-size: 0.5rem;
		padding: 0.125rem 0.25rem;
		border-radius: 2px;
		text-transform: capitalize;
	}

	.type-badge.fire {
		background: #f08030;
	}
	.type-badge.water {
		background: #6890f0;
	}
	.type-badge.grass {
		background: #78c850;
	}
	.type-badge.electric {
		background: #f8d030;
		color: #000;
	}
	.type-badge.psychic {
		background: #f85888;
	}
	.type-badge.ice {
		background: #98d8d8;
		color: #000;
	}
	.type-badge.dragon {
		background: #7038f8;
	}
	.type-badge.dark {
		background: #705848;
	}
	.type-badge.fairy {
		background: #ee99ac;
	}
	.type-badge.normal {
		background: #a8a878;
	}
	.type-badge.fighting {
		background: #c03028;
	}
	.type-badge.flying {
		background: #a890f0;
	}
	.type-badge.poison {
		background: #a040a0;
	}
	.type-badge.ground {
		background: #e0c068;
		color: #000;
	}
	.type-badge.rock {
		background: #b8a038;
	}
	.type-badge.bug {
		background: #a8b820;
	}
	.type-badge.ghost {
		background: #705898;
	}
	.type-badge.steel {
		background: #b8b8d0;
		color: #000;
	}

	.fullscreen-editor {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--pixel-bg-primary, #0f0f23);
		display: flex;
		flex-direction: column;
		z-index: 100;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: var(--pixel-bg-header, #1a1a2e);
		border-bottom: 2px solid var(--pixel-border-color, #3d3d5c);
	}

	.editor-title {
		font-size: 0.875rem;
	}

	.position {
		font-size: 0.625rem;
		opacity: 0.6;
	}

	.nav-btn {
		padding: 0.5rem 1rem;
		background: var(--pixel-bg-panel, #252540);
		border: 2px solid var(--pixel-border-color, #3d3d5c);
		color: var(--pixel-text-white, #fff);
		font-family: inherit;
		font-size: 0.625rem;
		cursor: pointer;
		min-height: 44px;
	}

	.nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.editor-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.editor-section {
		background: var(--pixel-bg-panel, #252540);
		border: 2px solid var(--pixel-border-color, #3d3d5c);
		padding: 0.75rem;
	}

	.editor-section h3 {
		font-size: 0.75rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--pixel-border-color, #3d3d5c);
		padding-bottom: 0.25rem;
	}

	.form-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.form-row label {
		font-size: 0.625rem;
		min-width: 80px;
	}

	.form-row input {
		flex: 1;
		padding: 0.5rem;
		background: var(--pixel-bg-input, #1a1a2e);
		border: 2px solid var(--pixel-border-color, #3d3d5c);
		color: var(--pixel-text-white, #fff);
		font-family: inherit;
		font-size: 0.625rem;
		min-height: 44px;
	}

	.types-display {
		display: flex;
		gap: 0.25rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.stat-row {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-row label {
		font-size: 0.5rem;
		opacity: 0.7;
	}

	.stat-row input {
		padding: 0.375rem;
		background: var(--pixel-bg-input, #1a1a2e);
		border: 2px solid var(--pixel-border-color, #3d3d5c);
		color: var(--pixel-text-white, #fff);
		font-family: inherit;
		font-size: 0.625rem;
		text-align: center;
		min-height: 44px;
	}

	.moves-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		max-height: 300px;
		overflow-y: auto;
	}

	.move-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem;
		background: var(--pixel-bg-input, #1a1a2e);
		border: 1px solid var(--pixel-border-color, #3d3d5c);
	}

	.move-name {
		flex: 1;
		font-size: 0.625rem;
	}

	.move-power {
		font-size: 0.5rem;
		opacity: 0.6;
		min-width: 30px;
		text-align: right;
	}

	.remove-move-btn {
		padding: 0.25rem 0.5rem;
		background: var(--pixel-text-stat-red, #f44336);
		border: none;
		color: var(--pixel-text-white, #fff);
		font-family: inherit;
		font-size: 0.5rem;
		cursor: pointer;
		min-height: 32px;
	}

	.editor-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.75rem;
		background: var(--pixel-bg-header, #1a1a2e);
		border-top: 2px solid var(--pixel-border-color, #3d3d5c);
	}

	.cancel-btn,
	.save-btn {
		padding: 0.75rem 1.5rem;
		border: 2px solid var(--pixel-border-color, #3d3d5c);
		font-family: inherit;
		font-size: 0.75rem;
		cursor: pointer;
		min-height: 44px;
	}

	.cancel-btn {
		background: var(--pixel-bg-panel, #252540);
		color: var(--pixel-text-white, #fff);
	}

	.save-btn {
		background: var(--pixel-text-stat-green, #4caf50);
		color: var(--pixel-text-white, #fff);
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.editor-header {
			padding: 0.5rem;
		}

		.editor-title {
			font-size: 0.75rem;
		}

		.nav-btn {
			padding: 0.5rem;
			font-size: 0.5rem;
		}
	}

	@media (min-width: 1024px) {
		.pokemon-list {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 0.5rem;
		}

		.editor-content {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1rem;
		}

		.editor-section:last-child {
			grid-column: 1 / -1;
		}
	}
</style>
