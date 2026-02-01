<script lang="ts">
	import { container } from 'tsyringe';
	import { Pokedex, PokedexEntry, Move, Stats, Sprites, MoveEffect } from '$js/pokemons/pokedex';
	import { onMount } from 'svelte';

	let pokedex: Pokedex;

	// Raw data from JSON files
	let rawPokemon: RawPokedexEntry[] = $state([]);
	let rawMoves: RawMove[] = $state([]);

	// Current Pokedex state
	let currentPokemon: PokedexEntry[] = $state([]);

	// UI state
	let pokemonSearch = $state('');
	let moveSearch = $state('');
	let selectedRawPokemon: RawPokedexEntry | null = $state(null);
	let selectedCurrentPokemon: PokedexEntry | null = $state(null);
	let selectedMoves: string[] = $state([]);
	let statusMessage = $state('');

	interface RawPokedexEntry {
		id: number;
		name: { english: string; japanese?: string; chinese?: string; french?: string };
		type: string[];
		base: {
			HP: number;
			Attack: number;
			Defense: number;
			'Sp. Attack': number;
			'Sp. Defense': number;
			Speed: number;
		};
		species?: string;
		description?: string;
		evolution?: { prev?: string[]; next?: string[][] };
		profile?: {
			height?: string;
			weight?: string;
			egg?: string[];
			ability?: string[][];
			gender?: string;
		};
	}

	interface RawMove {
		id: number;
		identifier: string;
		type_id: number;
		power: number | null;
		pp: number | null;
		accuracy: number | null;
		priority: number;
		damage_class_id: number;
		effect_id: number;
	}

	const typeIdToName: Record<number, string> = {
		1: 'normal',
		2: 'fighting',
		3: 'flying',
		4: 'poison',
		5: 'ground',
		6: 'rock',
		7: 'bug',
		8: 'ghost',
		9: 'steel',
		10: 'fire',
		11: 'water',
		12: 'grass',
		13: 'electric',
		14: 'psychic',
		15: 'ice',
		16: 'dragon',
		17: 'dark',
		18: 'fairy'
	};

	const categoryIdToName: Record<number, string> = {
		1: 'no-damage',
		2: 'physical',
		3: 'special'
	};

	let filteredRawPokemon = $derived(() => {
		if (!pokemonSearch) return rawPokemon;
		const query = pokemonSearch.toLowerCase();
		return rawPokemon.filter(
			(p) => p.name.english.toLowerCase().includes(query) || p.id.toString().includes(query)
		);
	});

	let availableRawPokemon = $derived(() => {
		const existingIds = new Set(currentPokemon.map((p) => p.id));
		return filteredRawPokemon().filter((p) => !existingIds.has(p.id));
	});

	let filteredRawMoves = $derived(() => {
		if (!moveSearch) return rawMoves;
		const query = moveSearch.toLowerCase();
		return rawMoves.filter((m) => m.identifier.toLowerCase().includes(query));
	});

	onMount(async () => {
		pokedex = container.resolve(Pokedex);
		await pokedex.ensureLoaded();
		currentPokemon = [...pokedex.entries];

		// Load raw Pokemon JSON
		try {
			const pokemonResponse = await fetch('/data/raw/dex/pokedex.json');
			if (pokemonResponse.ok) {
				rawPokemon = await pokemonResponse.json();
			}
		} catch (e) {
			console.error('Failed to load raw Pokemon:', e);
		}

		// Load raw Moves JSON
		try {
			const movesResponse = await fetch('/data/raw/moves/moves.json');
			if (movesResponse.ok) {
				rawMoves = await movesResponse.json();
			}
		} catch (e) {
			console.error('Failed to load raw Moves:', e);
		}
	});

	function addPokemonToPokedex() {
		if (!selectedRawPokemon) return;

		const raw = selectedRawPokemon;
		const newEntry = new PokedexEntry(
			raw.id,
			raw.id,
			raw.name.english,
			raw.type,
			raw.profile?.ability?.map((a) => a[0]) || [],
			[],
			new Stats(
				raw.base.HP,
				raw.base.Attack,
				raw.base.Defense,
				raw.base['Sp. Attack'],
				raw.base['Sp. Defense'],
				raw.base.Speed
			),
			parseFloat(raw.profile?.height || '0'),
			parseFloat(raw.profile?.weight || '0'),
			raw.description || '',
			false,
			45,
			4,
			64,
			50,
			[],
			{ front: '', back: '' } as unknown as Sprites
		);

		currentPokemon = [...currentPokemon, newEntry];
		statusMessage = `Added ${raw.name.english} to Pokedex!`;
		selectedRawPokemon = null;

		setTimeout(() => {
			statusMessage = '';
		}, 3000);
	}

	function assignMovesToPokemon() {
		if (!selectedCurrentPokemon || selectedMoves.length === 0) return;

		const movesToAdd = selectedMoves
			.map((moveId) => {
				const rawMove = rawMoves.find((m) => m.id.toString() === moveId);
				if (!rawMove) return null;

				return new Move(
					rawMove.id,
					formatMoveName(rawMove.identifier),
					typeIdToName[rawMove.type_id] || 'normal',
					(categoryIdToName[rawMove.damage_class_id] as 'physical' | 'special' | 'no-damage') ||
						'physical',
					rawMove.power || 0,
					rawMove.accuracy || 100,
					rawMove.pp || 10,
					rawMove.priority,
					'selected-pokemon',
					new MoveEffect(0, 9, '', ''),
					0,
					'',
					1
				);
			})
			.filter((m): m is Move => m !== null);

		// Find and update the Pokemon
		const idx = currentPokemon.findIndex((p) => p.id === selectedCurrentPokemon!.id);
		if (idx !== -1) {
			const pokemon = currentPokemon[idx];
			const existingMoveNames = new Set(pokemon.moves.map((m) => m.name));
			const newMoves = movesToAdd.filter((m) => !existingMoveNames.has(m.name));

			if (newMoves.length > 0) {
				pokemon.moves = [...pokemon.moves, ...newMoves];
				currentPokemon = [...currentPokemon];
				statusMessage = `Added ${newMoves.length} move(s) to ${pokemon.name}!`;
			} else {
				statusMessage = 'All selected moves already exist on this Pokemon.';
			}
		}

		selectedMoves = [];
		setTimeout(() => {
			statusMessage = '';
		}, 3000);
	}

	function formatMoveName(identifier: string): string {
		return identifier
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	function toggleMoveSelection(moveId: string) {
		if (selectedMoves.includes(moveId)) {
			selectedMoves = selectedMoves.filter((id) => id !== moveId);
		} else {
			selectedMoves = [...selectedMoves, moveId];
		}
	}
</script>

<div class="add-content" data-testid="add-content">
	{#if statusMessage}
		<div class="status-message">{statusMessage}</div>
	{/if}

	<div class="content-panels">
		<section class="panel add-pokemon-panel">
			<h3>Add Pokemon from Raw Data</h3>
			<div class="filter-row">
				<input type="text" placeholder="Search Pokemon..." bind:value={pokemonSearch} />
				<span class="count">{availableRawPokemon().length} available</span>
			</div>

			<div class="list-container">
				{#each availableRawPokemon().slice(0, 50) as pokemon}
					<button
						class="list-item"
						class:selected={selectedRawPokemon?.id === pokemon.id}
						onclick={() => (selectedRawPokemon = pokemon)}
					>
						<span class="id">#{pokemon.id}</span>
						<span class="name">{pokemon.name.english}</span>
						<span class="types">
							{#each pokemon.type as type}
								<span class="type-badge" data-type={type.toLowerCase()}>{type}</span>
							{/each}
						</span>
					</button>
				{/each}
			</div>

			{#if selectedRawPokemon}
				<div class="selection-info">
					<strong>Selected:</strong>
					{selectedRawPokemon.name.english}
					<button class="btn-add" onclick={addPokemonToPokedex}>Add to Pokedex</button>
				</div>
			{/if}
		</section>

		<section class="panel assign-moves-panel">
			<h3>Assign Moves to Pokemon</h3>

			<div class="filter-row">
				<select
					bind:value={selectedCurrentPokemon}
					onchange={(e) => {
						const id = parseInt((e.target as HTMLSelectElement).value);
						selectedCurrentPokemon = currentPokemon.find((p) => p.id === id) || null;
					}}
				>
					<option value="">Select Pokemon...</option>
					{#each currentPokemon as pokemon}
						<option value={pokemon.id}>{pokemon.name}</option>
					{/each}
				</select>
			</div>

			<div class="filter-row">
				<input type="text" placeholder="Search moves..." bind:value={moveSearch} />
				<span class="count">{selectedMoves.length} selected</span>
			</div>

			<div class="list-container moves-list">
				{#each filteredRawMoves().slice(0, 100) as move}
					<button
						class="list-item move-item"
						class:selected={selectedMoves.includes(move.id.toString())}
						onclick={() => toggleMoveSelection(move.id.toString())}
					>
						<span class="name">{formatMoveName(move.identifier)}</span>
						<span class="type-badge" data-type={typeIdToName[move.type_id]}>
							{typeIdToName[move.type_id]}
						</span>
						<span class="stats">
							{move.power || '-'} | {move.accuracy || '-'}% | {move.pp} PP
						</span>
					</button>
				{/each}
			</div>

			{#if selectedCurrentPokemon && selectedMoves.length > 0}
				<div class="selection-info">
					<strong>Assigning to:</strong>
					{selectedCurrentPokemon.name}
					<button class="btn-add" onclick={assignMovesToPokemon}>
						Assign {selectedMoves.length} Move(s)
					</button>
				</div>
			{/if}
		</section>
	</div>
</div>

<style>
	.add-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 1rem;
	}

	.status-message {
		padding: 0.75rem 1rem;
		background: var(--pixel-accent-green);
		color: var(--pixel-bg-primary);
		text-align: center;
		font-size: 0.875rem;
	}

	.content-panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		flex: 1;
		overflow: hidden;
	}

	.panel {
		display: flex;
		flex-direction: column;
		background: var(--pixel-bg-panel);
		border: 2px solid var(--pixel-border-color);
		padding: 1rem;
		overflow: hidden;
	}

	.panel h3 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		color: var(--pixel-text-gold);
	}

	.filter-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.filter-row input,
	.filter-row select {
		flex: 1;
		padding: 0.5rem;
		background: var(--pixel-bg-primary);
		border: 2px solid var(--pixel-accent-blue);
		color: var(--pixel-text-white);
		font-family: inherit;
		font-size: 0.75rem;
	}

	.count {
		font-size: 0.625rem;
		color: var(--pixel-text-muted);
		white-space: nowrap;
	}

	.list-container {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.list-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: var(--pixel-bg-primary);
		border: 2px solid transparent;
		color: var(--pixel-text-white);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.625rem;
		text-align: left;
	}

	.list-item:hover {
		background: var(--pixel-bg-header);
	}

	.list-item.selected {
		border-color: var(--pixel-text-gold);
	}

	.list-item .id {
		color: var(--pixel-text-muted);
		min-width: 35px;
	}

	.list-item .name {
		flex: 1;
	}

	.move-item .stats {
		color: var(--pixel-text-muted);
		font-size: 0.5rem;
	}

	.selection-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem;
		background: var(--pixel-bg-header);
		margin-top: 0.5rem;
		font-size: 0.75rem;
	}

	.btn-add {
		padding: 0.5rem 1rem;
		background: var(--pixel-accent-green);
		color: var(--pixel-bg-primary);
		border: 2px solid var(--pixel-border-color);
		font-family: inherit;
		font-size: 0.625rem;
		cursor: pointer;
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
	.type-badge[data-type='normal'] {
		background: #a8a878;
	}
	.type-badge[data-type='psychic'] {
		background: #f85888;
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
</style>
