<script lang="ts">
	import type { PokedexEntry } from '$js/pokemons/pokedex';
	import { typeChart, type PokemonType } from '$js/battle/battle-model';

	interface Props {
		pokemon?: PokedexEntry;
		onApply?: (edited: PokedexEntry) => void;
	}

	let { pokemon, onApply }: Props = $props();

	const pokemonTypes = Object.keys(typeChart) as PokemonType[];

	// Editable state
	let editedName = $state('');
	let editedType1 = $state('');
	let editedType2 = $state('');
	let editedHp = $state(0);
	let editedAttack = $state(0);
	let editedDefense = $state(0);
	let editedSpAttack = $state(0);
	let editedSpDefense = $state(0);
	let editedSpeed = $state(0);
	let editedCaptureRate = $state(0);
	let editedBaseXp = $state(0);

	// Reset form when pokemon changes
	$effect(() => {
		if (pokemon) {
			editedName = pokemon.name;
			editedType1 = pokemon.types[0] || '';
			editedType2 = pokemon.types[1] || '';
			editedHp = pokemon.stats.hp;
			editedAttack = pokemon.stats.attack;
			editedDefense = pokemon.stats.defense;
			editedSpAttack = pokemon.stats.specialAttack;
			editedSpDefense = pokemon.stats.specialDefense;
			editedSpeed = pokemon.stats.speed;
			editedCaptureRate = pokemon.captureRate;
			editedBaseXp = pokemon.baseXp;
		}
	});

	function handleApply() {
		if (!pokemon || !onApply) return;

		// Create a shallow copy with updated values
		const edited = {
			...pokemon,
			name: editedName,
			types: editedType2 ? [editedType1, editedType2] : [editedType1],
			stats: {
				...pokemon.stats,
				hp: editedHp,
				attack: editedAttack,
				defense: editedDefense,
				specialAttack: editedSpAttack,
				specialDefense: editedSpDefense,
				speed: editedSpeed
			},
			captureRate: editedCaptureRate,
			baseXp: editedBaseXp
		} as PokedexEntry;

		onApply(edited);
	}

	function handleReset() {
		if (pokemon) {
			editedName = pokemon.name;
			editedType1 = pokemon.types[0] || '';
			editedType2 = pokemon.types[1] || '';
			editedHp = pokemon.stats.hp;
			editedAttack = pokemon.stats.attack;
			editedDefense = pokemon.stats.defense;
			editedSpAttack = pokemon.stats.specialAttack;
			editedSpDefense = pokemon.stats.specialDefense;
			editedSpeed = pokemon.stats.speed;
			editedCaptureRate = pokemon.captureRate;
			editedBaseXp = pokemon.baseXp;
		}
	}
</script>

<div class="pokemon-editor" data-testid="pokemon-editor">
	{#if pokemon}
		<div class="editor-header">
			<h2>Editing: {pokemon.name}</h2>
			<span class="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</span>
		</div>

		<div class="editor-form">
			<section class="form-section">
				<h3>Basic Info</h3>
				<div class="form-grid">
					<div class="form-group">
						<label for="pokemon-id">ID (read-only)</label>
						<input id="pokemon-id" type="text" value={pokemon.id} disabled />
					</div>
					<div class="form-group">
						<label for="pokemon-name">Name</label>
						<input id="pokemon-name" type="text" bind:value={editedName} />
					</div>
				</div>
			</section>

			<section class="form-section">
				<h3>Types</h3>
				<div class="form-grid">
					<div class="form-group">
						<label for="type1">Primary Type</label>
						<select id="type1" bind:value={editedType1}>
							{#each pokemonTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label for="type2">Secondary Type</label>
						<select id="type2" bind:value={editedType2}>
							<option value="">None</option>
							{#each pokemonTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
				</div>
			</section>

			<section class="form-section">
				<h3>Base Stats</h3>
				<div class="form-grid stats-grid">
					<div class="form-group">
						<label for="stat-hp">HP</label>
						<input id="stat-hp" type="number" min="1" max="255" bind:value={editedHp} />
					</div>
					<div class="form-group">
						<label for="stat-attack">Attack</label>
						<input id="stat-attack" type="number" min="1" max="255" bind:value={editedAttack} />
					</div>
					<div class="form-group">
						<label for="stat-defense">Defense</label>
						<input id="stat-defense" type="number" min="1" max="255" bind:value={editedDefense} />
					</div>
					<div class="form-group">
						<label for="stat-spattack">Sp. Attack</label>
						<input id="stat-spattack" type="number" min="1" max="255" bind:value={editedSpAttack} />
					</div>
					<div class="form-group">
						<label for="stat-spdefense">Sp. Defense</label>
						<input
							id="stat-spdefense"
							type="number"
							min="1"
							max="255"
							bind:value={editedSpDefense}
						/>
					</div>
					<div class="form-group">
						<label for="stat-speed">Speed</label>
						<input id="stat-speed" type="number" min="1" max="255" bind:value={editedSpeed} />
					</div>
				</div>
			</section>

			<section class="form-section">
				<h3>Other</h3>
				<div class="form-grid">
					<div class="form-group">
						<label for="capture-rate">Capture Rate</label>
						<input
							id="capture-rate"
							type="number"
							min="1"
							max="255"
							bind:value={editedCaptureRate}
						/>
					</div>
					<div class="form-group">
						<label for="base-xp">Base XP</label>
						<input id="base-xp" type="number" min="1" max="500" bind:value={editedBaseXp} />
					</div>
				</div>
			</section>

			<section class="form-section readonly-section">
				<h3>Read-Only Fields</h3>
				<div class="readonly-info">
					<p><strong>Evolution:</strong> {pokemon.evolution?.length || 0} stages</p>
					<p><strong>Sprites:</strong> Configured</p>
					<p><strong>Abilities:</strong> {pokemon.abilities?.join(', ') || 'None'}</p>
					<p><strong>Moves:</strong> {pokemon.moves?.length || 0} available</p>
				</div>
			</section>
		</div>

		<div class="editor-actions">
			<button class="btn-apply" onclick={handleApply}>Apply Changes</button>
			<button class="btn-reset" onclick={handleReset}>Reset</button>
		</div>
	{:else}
		<div class="no-selection">
			<h2>No Pokemon Selected</h2>
			<p>Select a Pokemon from the browser to edit</p>
		</div>
	{/if}
</div>

<style>
	.pokemon-editor {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 1rem;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: var(--pixel-bg-header);
		border: 2px solid var(--pixel-border-color);
	}

	.editor-header h2 {
		margin: 0;
		font-size: 1rem;
	}

	.pokemon-id {
		color: var(--pixel-text-muted);
	}

	.editor-form {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-section {
		background: var(--pixel-bg-panel);
		border: 2px solid var(--pixel-border-color);
		padding: 1rem;
	}

	.form-section h3 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		color: var(--pixel-text-gold);
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.stats-grid {
		grid-template-columns: repeat(3, 1fr);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group label {
		font-size: 0.75rem;
		color: var(--pixel-text-muted);
	}

	.form-group input,
	.form-group select {
		padding: 0.5rem;
		background: var(--pixel-bg-primary);
		border: 2px solid var(--pixel-accent-blue);
		color: var(--pixel-text-white);
		font-family: inherit;
		font-size: 0.875rem;
	}

	.form-group input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		border-color: var(--pixel-text-muted);
	}

	.readonly-section {
		background: var(--pixel-bg-primary);
		opacity: 0.8;
	}

	.readonly-info {
		font-size: 0.75rem;
		color: var(--pixel-text-muted);
	}

	.readonly-info p {
		margin: 0.25rem 0;
	}

	.editor-actions {
		display: flex;
		gap: 1rem;
		padding: 0.5rem;
	}

	.btn-apply,
	.btn-reset {
		padding: 0.75rem 1.5rem;
		border: 2px solid var(--pixel-border-color);
		font-family: inherit;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.btn-apply {
		background: var(--pixel-accent-green);
		color: var(--pixel-bg-primary);
	}

	.btn-reset {
		background: var(--pixel-text-muted);
		color: var(--pixel-text-white);
	}

	.no-selection {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--pixel-text-muted);
	}

	.no-selection h2 {
		margin-bottom: 0.5rem;
	}
</style>
