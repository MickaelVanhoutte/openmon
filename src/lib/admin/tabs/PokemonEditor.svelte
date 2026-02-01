<script lang="ts">
	import { Move, MoveEffect, type PokedexEntry } from '$js/pokemons/pokedex';
	import { typeChart, type PokemonType } from '$js/battle/battle-model';

	interface Props {
		pokemon?: PokedexEntry;
		onApply?: (edited: PokedexEntry) => void;
	}

	let { pokemon, onApply }: Props = $props();

	const pokemonTypes = Object.keys(typeChart) as PokemonType[];
	const learnMethods = [
		{ value: 1, label: 'Level Up' },
		{ value: 2, label: 'Egg Move' },
		{ value: 3, label: 'Tutor' },
		{ value: 4, label: 'TM/HM' }
	];

	// Editable state - Basic Info
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

	// Editable state - Moves
	interface EditableMove {
		id: number;
		name: string;
		type: string;
		category: 'physical' | 'special' | 'no-damage';
		power: number;
		accuracy: number;
		pp: number;
		level: number;
		method: number;
		original: Move;
	}
	let editedMoves: EditableMove[] = $state([]);
	let selectedMoveIndex: number | null = $state(null);

	// New move form
	let showAddMoveForm = $state(false);
	let newMoveName = $state('');
	let newMoveType = $state('normal');
	let newMoveCategory = $state<'physical' | 'special' | 'no-damage'>('physical');
	let newMovePower = $state(50);
	let newMoveAccuracy = $state(100);
	let newMovePp = $state(10);
	let newMoveLevel = $state(1);
	let newMoveMethod = $state(1);

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

			// Load moves
			editedMoves = (pokemon.moves || []).map((m) => ({
				id: m.id,
				name: m.name,
				type: m.type,
				category: m.category,
				power: m.power,
				accuracy: m.accuracy,
				pp: m.pp,
				level: m.level || 1,
				method: m.method || 1,
				original: m
			}));
			selectedMoveIndex = null;
			showAddMoveForm = false;
		}
	});

	function handleApply() {
		if (!pokemon || !onApply) return;

		// Rebuild moves from editedMoves
		const updatedMoves = editedMoves.map((em) => {
			return new Move(
				em.original.id,
				em.name,
				em.type,
				em.category,
				em.power,
				em.accuracy,
				em.pp,
				em.original.priority,
				em.original.target as
					| 'all-opponents'
					| 'selected-pokemon'
					| 'users-field'
					| 'user'
					| 'user-and-allies'
					| 'entire-field'
					| 'random-opponent'
					| 'all-other-pokemon'
					| 'specific-move'
					| 'opponents-field'
					| 'ally'
					| 'all-pokemon'
					| 'user-or-ally',
				em.original.effect,
				em.original.effectChance,
				em.original.description,
				em.level,
				em.method
			);
		});

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
			baseXp: editedBaseXp,
			moves: updatedMoves
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

			editedMoves = (pokemon.moves || []).map((m) => ({
				id: m.id,
				name: m.name,
				type: m.type,
				category: m.category,
				power: m.power,
				accuracy: m.accuracy,
				pp: m.pp,
				level: m.level || 1,
				method: m.method || 1,
				original: m
			}));
			selectedMoveIndex = null;
		}
	}

	function removeMove(index: number) {
		editedMoves = editedMoves.filter((_, i) => i !== index);
		if (selectedMoveIndex === index) {
			selectedMoveIndex = null;
		} else if (selectedMoveIndex !== null && selectedMoveIndex > index) {
			selectedMoveIndex--;
		}
	}

	function addNewMove() {
		if (!newMoveName.trim()) return;

		const newMove: EditableMove = {
			id: Date.now(), // Temporary ID
			name: newMoveName.trim(),
			type: newMoveType,
			category: newMoveCategory,
			power: newMovePower,
			accuracy: newMoveAccuracy,
			pp: newMovePp,
			level: newMoveLevel,
			method: newMoveMethod,
			original: new Move(
				Date.now(),
				newMoveName.trim(),
				newMoveType,
				newMoveCategory,
				newMovePower,
				newMoveAccuracy,
				newMovePp,
				0,
				'selected-pokemon',
				new MoveEffect(0, 9, '', ''),
				0,
				'',
				newMoveLevel,
				newMoveMethod
			)
		};

		editedMoves = [...editedMoves, newMove];

		// Reset form
		newMoveName = '';
		newMoveType = 'normal';
		newMoveCategory = 'physical';
		newMovePower = 50;
		newMoveAccuracy = 100;
		newMovePp = 10;
		newMoveLevel = 1;
		newMoveMethod = 1;
		showAddMoveForm = false;
	}

	function getMethodLabel(method: number): string {
		return learnMethods.find((m) => m.value === method)?.label || 'Unknown';
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

			<section class="form-section moves-section">
				<div class="section-header">
					<h3>Moves ({editedMoves.length})</h3>
					<button class="btn-add-move" onclick={() => (showAddMoveForm = !showAddMoveForm)}>
						{showAddMoveForm ? 'Cancel' : '+ Add Move'}
					</button>
				</div>

				{#if showAddMoveForm}
					<div class="add-move-form">
						<div class="form-grid add-move-grid">
							<div class="form-group">
								<label for="new-move-name">Name</label>
								<input id="new-move-name" type="text" bind:value={newMoveName} />
							</div>
							<div class="form-group">
								<label for="new-move-type">Type</label>
								<select id="new-move-type" bind:value={newMoveType}>
									{#each pokemonTypes as type}
										<option value={type}>{type}</option>
									{/each}
								</select>
							</div>
							<div class="form-group">
								<label for="new-move-category">Category</label>
								<select id="new-move-category" bind:value={newMoveCategory}>
									<option value="physical">Physical</option>
									<option value="special">Special</option>
									<option value="no-damage">Status</option>
								</select>
							</div>
							<div class="form-group">
								<label for="new-move-power">Power</label>
								<input
									id="new-move-power"
									type="number"
									min="0"
									max="255"
									bind:value={newMovePower}
								/>
							</div>
							<div class="form-group">
								<label for="new-move-accuracy">Accuracy</label>
								<input
									id="new-move-accuracy"
									type="number"
									min="0"
									max="100"
									bind:value={newMoveAccuracy}
								/>
							</div>
							<div class="form-group">
								<label for="new-move-pp">PP</label>
								<input id="new-move-pp" type="number" min="1" max="40" bind:value={newMovePp} />
							</div>
							<div class="form-group">
								<label for="new-move-level">Level</label>
								<input
									id="new-move-level"
									type="number"
									min="1"
									max="100"
									bind:value={newMoveLevel}
								/>
							</div>
							<div class="form-group">
								<label for="new-move-method">Method</label>
								<select id="new-move-method" bind:value={newMoveMethod}>
									{#each learnMethods as method}
										<option value={method.value}>{method.label}</option>
									{/each}
								</select>
							</div>
						</div>
						<button class="btn-confirm-add" onclick={addNewMove}>Add Move</button>
					</div>
				{/if}

				<div class="moves-list">
					{#each editedMoves as move, index}
						<div
							class="move-item"
							class:selected={selectedMoveIndex === index}
							onclick={() => (selectedMoveIndex = selectedMoveIndex === index ? null : index)}
						>
							<div class="move-summary">
								<span class="move-name">{move.name}</span>
								<span class="type-badge" data-type={move.type.toLowerCase()}>{move.type}</span>
								<span class="move-info">Lv.{move.level} | {getMethodLabel(move.method)}</span>
								<button
									class="btn-remove"
									onclick={(e) => {
										e.stopPropagation();
										removeMove(index);
									}}>X</button
								>
							</div>

							{#if selectedMoveIndex === index}
								<div class="move-edit-form">
									<div class="form-grid move-edit-grid">
										<div class="form-group">
											<label>Level</label>
											<input type="number" min="1" max="100" bind:value={move.level} />
										</div>
										<div class="form-group">
											<label>Method</label>
											<select bind:value={move.method}>
												{#each learnMethods as method}
													<option value={method.value}>{method.label}</option>
												{/each}
											</select>
										</div>
										<div class="form-group">
											<label>Power</label>
											<input type="number" min="0" max="255" bind:value={move.power} />
										</div>
										<div class="form-group">
											<label>Accuracy</label>
											<input type="number" min="0" max="100" bind:value={move.accuracy} />
										</div>
										<div class="form-group">
											<label>PP</label>
											<input type="number" min="1" max="40" bind:value={move.pp} />
										</div>
										<div class="form-group">
											<label>Category</label>
											<select bind:value={move.category}>
												<option value="physical">Physical</option>
												<option value="special">Special</option>
												<option value="no-damage">Status</option>
											</select>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<div class="no-moves">No moves available</div>
					{/each}
				</div>
			</section>

			<section class="form-section readonly-section">
				<h3>Read-Only Fields</h3>
				<div class="readonly-info">
					<p><strong>Evolution:</strong> {pokemon.evolution?.length || 0} stages</p>
					<p><strong>Sprites:</strong> Configured</p>
					<p><strong>Abilities:</strong> {pokemon.abilities?.join(', ') || 'None'}</p>
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

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.section-header h3 {
		margin: 0;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.stats-grid {
		grid-template-columns: repeat(3, 1fr);
	}

	.add-move-grid {
		grid-template-columns: repeat(4, 1fr);
	}

	.move-edit-grid {
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

	/* Moves Section */
	.moves-section {
		max-height: 400px;
		display: flex;
		flex-direction: column;
	}

	.btn-add-move {
		padding: 0.25rem 0.5rem;
		background: var(--pixel-accent-blue);
		border: 2px solid var(--pixel-border-color);
		color: var(--pixel-text-white);
		font-family: inherit;
		font-size: 0.625rem;
		cursor: pointer;
	}

	.add-move-form {
		background: var(--pixel-bg-primary);
		padding: 0.75rem;
		margin-bottom: 0.75rem;
		border: 1px solid var(--pixel-accent-blue);
	}

	.btn-confirm-add {
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--pixel-accent-green);
		border: 2px solid var(--pixel-border-color);
		color: var(--pixel-bg-primary);
		font-family: inherit;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.moves-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.move-item {
		background: var(--pixel-bg-primary);
		border: 2px solid transparent;
		cursor: pointer;
		transition: border-color 0.1s;
	}

	.move-item:hover {
		border-color: var(--pixel-accent-blue);
	}

	.move-item.selected {
		border-color: var(--pixel-text-gold);
	}

	.move-summary {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
	}

	.move-name {
		flex: 1;
		font-size: 0.75rem;
	}

	.move-info {
		font-size: 0.625rem;
		color: var(--pixel-text-muted);
	}

	.btn-remove {
		padding: 0.125rem 0.375rem;
		background: var(--pixel-text-stat-red);
		border: none;
		color: var(--pixel-text-white);
		font-family: inherit;
		font-size: 0.625rem;
		cursor: pointer;
	}

	.move-edit-form {
		padding: 0.5rem;
		background: var(--pixel-bg-panel);
		border-top: 1px solid var(--pixel-border-color);
	}

	.no-moves {
		padding: 1rem;
		text-align: center;
		color: var(--pixel-text-muted);
		font-size: 0.75rem;
	}

	.type-badge {
		padding: 0.125rem 0.375rem;
		font-size: 0.5rem;
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
	.type-badge[data-type='steel'] {
		background: #b8b8d0;
		color: #000;
	}
	.type-badge[data-type='fairy'] {
		background: #ee99ac;
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
