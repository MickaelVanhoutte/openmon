<script lang="ts">
	import type { Move } from '$js/pokemons/pokedex';
	import { typeChart, type PokemonType } from '$js/battle/battle-model';

	interface Props {
		move?: Move;
		onApply?: (edited: Move) => void;
	}

	const { move, onApply }: Props = $props();

	const pokemonTypes = Object.keys(typeChart) as PokemonType[];
	const categories = ['physical', 'special', 'no-damage'];

	// Editable state
	let editedName = $state('');
	let editedType = $state('');
	let editedCategory = $state('');
	let editedPower = $state(0);
	let editedAccuracy = $state(0);
	let editedPp = $state(0);
	let editedPriority = $state(0);
	let editedDescription = $state('');

	// Reset form when move changes
	$effect(() => {
		if (move) {
			editedName = move.name;
			editedType = move.type;
			editedCategory = move.category;
			editedPower = move.power || 0;
			editedAccuracy = move.accuracy || 100;
			editedPp = move.pp;
			editedPriority = move.priority || 0;
			editedDescription = move.description || '';
		}
	});

	function handleApply() {
		if (!move || !onApply) {return;}

		const edited: Move = {
			...move,
			name: editedName,
			type: editedType,
			category: editedCategory as 'physical' | 'special' | 'no-damage',
			power: editedPower || 0,
			accuracy: editedAccuracy || 100,
			pp: editedPp,
			priority: editedPriority,
			description: editedDescription
		};

		onApply(edited);
	}

	function handleReset() {
		if (move) {
			editedName = move.name;
			editedType = move.type;
			editedCategory = move.category;
			editedPower = move.power || 0;
			editedAccuracy = move.accuracy || 100;
			editedPp = move.pp;
			editedPriority = move.priority || 0;
			editedDescription = move.description || '';
		}
	}
</script>

<div class="move-editor" data-testid="move-editor">
	{#if move}
		<div class="editor-header">
			<h2>Editing: {move.name}</h2>
			<span class="move-type type-badge" data-type={move.type.toLowerCase()}>{move.type}</span>
		</div>

		<div class="editor-form">
			<section class="form-section">
				<h3>Basic Info</h3>
				<div class="form-grid">
					<div class="form-group">
						<label for="move-name">Name</label>
						<input id="move-name" type="text" bind:value={editedName} />
					</div>
					<div class="form-group">
						<label for="move-type">Type</label>
						<select id="move-type" bind:value={editedType}>
							{#each pokemonTypes as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label for="move-category">Category</label>
						<select id="move-category" bind:value={editedCategory}>
							{#each categories as cat}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>
				</div>
			</section>

			<section class="form-section">
				<h3>Stats</h3>
				<div class="form-grid stats-grid">
					<div class="form-group">
						<label for="move-power">Power</label>
						<input id="move-power" type="number" min="0" max="255" bind:value={editedPower} />
					</div>
					<div class="form-group">
						<label for="move-accuracy">Accuracy</label>
						<input id="move-accuracy" type="number" min="0" max="100" bind:value={editedAccuracy} />
					</div>
					<div class="form-group">
						<label for="move-pp">PP</label>
						<input id="move-pp" type="number" min="1" max="40" bind:value={editedPp} />
					</div>
					<div class="form-group">
						<label for="move-priority">Priority</label>
						<input id="move-priority" type="number" min="-7" max="5" bind:value={editedPriority} />
					</div>
				</div>
			</section>

			<section class="form-section">
				<h3>Description</h3>
				<div class="form-group full-width">
					<textarea id="move-description" rows="3" bind:value={editedDescription}></textarea>
				</div>
			</section>

			<section class="form-section readonly-section">
				<h3>Read-Only Fields</h3>
				<div class="readonly-info">
					<p><strong>Effect:</strong> {move.effect || 'None'}</p>
					<p><strong>Effect Chance:</strong> {move.effectChance || 'N/A'}%</p>
					<p><strong>Target:</strong> {move.target || 'Single'}</p>
				</div>
			</section>
		</div>

		<div class="editor-actions">
			<button class="btn-apply" onclick={handleApply}>Apply Changes</button>
			<button class="btn-reset" onclick={handleReset}>Reset</button>
		</div>
	{:else}
		<div class="no-selection">
			<h2>No Move Selected</h2>
			<p>Select a Move from the browser to edit</p>
		</div>
	{/if}
</div>

<style>
	.move-editor {
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
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.stats-grid {
		grid-template-columns: repeat(4, 1fr);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		font-size: 0.75rem;
		color: var(--pixel-text-muted);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.5rem;
		background: var(--pixel-bg-primary);
		border: 2px solid var(--pixel-accent-blue);
		color: var(--pixel-text-white);
		font-family: inherit;
		font-size: 0.875rem;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 60px;
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
	.type-badge[data-type='normal'] {
		background: #a8a878;
	}
</style>
