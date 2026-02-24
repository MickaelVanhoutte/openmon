<script lang="ts">
	import { container } from 'tsyringe';
	import { Pokedex, PokedexEntry, Move, Stats, Sprites } from '$js/pokemons/pokedex';
	import { getMovesByPokemonId } from '$js/pokemons/move-hydration';
	import { onMount } from 'svelte';
	// Use ?url so Vite emits the JSON as a separate hashed file instead of inlining it.
	// We fetch it lazily in onMount so the 1.1 MB raw dex is never bundled into JS.
	import rawPokedexUrl from '../../../assets/data/raw/dex/pokedex.json?url';

	interface Props {
		onPokemonAdded?: (pokemon: PokedexEntry) => void;
		onPokemonRemoved?: (pokemon: PokedexEntry) => void;
	}

	const { onPokemonAdded, onPokemonRemoved }: Props = $props();

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
		profile?: {
			height?: string;
			weight?: string;
			egg?: string[];
			ability?: string[][];
			gender?: string;
		};
	}

	let pokedex: Pokedex;
	let rawPokemon: RawPokedexEntry[] = $state([]);
	let currentPokemonIds: Set<number> = $state(new Set());
	let searchQuery = $state('');
	let statusMessage = $state('');
	let isLoading = $state(true);

	const filteredPokemon = $derived(() => {
		if (!searchQuery) {
			return rawPokemon;
		}
		const query = searchQuery.toLowerCase();
		return rawPokemon.filter(
			(p) => p.name.english.toLowerCase().includes(query) || p.id.toString().includes(query)
		);
	});

	const availablePokemon = $derived(() => {
		return filteredPokemon().filter((p) => !currentPokemonIds.has(p.id));
	});

	const addedPokemon = $derived(() => {
		return filteredPokemon().filter((p) => currentPokemonIds.has(p.id));
	});

	onMount(async () => {
		pokedex = container.resolve(Pokedex);
		const [, json] = await Promise.all([
			pokedex.ensureLoaded(),
			fetch(rawPokedexUrl).then((r) => r.json() as Promise<RawPokedexEntry[]>)
		]);
		currentPokemonIds = new Set(pokedex.entries.map((p) => p.id));
		rawPokemon = json.slice(0, 898);
		isLoading = false;
	});

	async function addPokemon(raw: RawPokedexEntry) {
		const moves = await getMovesByPokemonId(raw.id);
		const hydratedMoves = moves.map(
			(m) =>
				new Move(
					m.id,
					m.name,
					m.type,
					m.category,
					m.power,
					m.accuracy,
					m.pp,
					m.priority,
					m.target as 'selected-pokemon',
					m.effect,
					m.effectChance,
					m.description,
					m.level,
					m.method
				)
		);

		const newEntry = new PokedexEntry(
			raw.id,
			currentPokemonIds.size + 1,
			raw.name.english,
			raw.type.map((t) => t.toLowerCase()),
			raw.profile?.ability?.map((a) => a[0]) || [],
			hydratedMoves,
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

		currentPokemonIds = new Set([...currentPokemonIds, raw.id]);
		pokedex.entries.push(newEntry);
		statusMessage = `Added ${raw.name.english} with ${hydratedMoves.length} moves!`;
		onPokemonAdded?.(newEntry);

		setTimeout(() => {
			statusMessage = '';
		}, 3000);
	}

	function removePokemon(raw: RawPokedexEntry) {
		const idx = pokedex.entries.findIndex((p) => p.id === raw.id);
		if (idx !== -1) {
			const removed = pokedex.entries.splice(idx, 1)[0];
			const newIds = new Set(currentPokemonIds);
			newIds.delete(raw.id);
			currentPokemonIds = newIds;
			statusMessage = `Removed ${raw.name.english}`;
			onPokemonRemoved?.(removed);

			setTimeout(() => {
				statusMessage = '';
			}, 3000);
		}
	}
</script>

<div class="add-pokemon" data-testid="add-pokemon-tab">
	<div class="search-bar">
		<input
			type="text"
			placeholder="Search Pokemon..."
			bind:value={searchQuery}
			data-testid="pokemon-search"
		/>
	</div>

	{#if statusMessage}
		<div class="status-message" data-testid="status-message">{statusMessage}</div>
	{/if}

	{#if isLoading}
		<div class="loading">Loading...</div>
	{:else}
		<div class="pokemon-sections">
			<section class="section available">
				<h3>Available to Add ({availablePokemon().length})</h3>
				<div class="pokemon-grid">
					{#each availablePokemon().slice(0, 50) as pokemon (pokemon.id)}
						<div class="pokemon-card" data-testid="available-pokemon">
							<div class="pokemon-info">
								<span class="pokemon-id">#{pokemon.id}</span>
								<span class="pokemon-name">{pokemon.name.english}</span>
								<span class="pokemon-types">
									{#each pokemon.type as type}
										<span class="type-badge {type.toLowerCase()}">{type}</span>
									{/each}
								</span>
							</div>
							<button
								class="add-btn"
								onclick={() => addPokemon(pokemon)}
								data-testid="add-pokemon-btn"
							>
								Add
							</button>
						</div>
					{/each}
					{#if availablePokemon().length > 50}
						<div class="more-hint">...and {availablePokemon().length - 50} more (use search)</div>
					{/if}
				</div>
			</section>

			<section class="section added">
				<h3>In Custom Pokedex ({addedPokemon().length})</h3>
				<div class="pokemon-grid">
					{#each addedPokemon() as pokemon (pokemon.id)}
						<div class="pokemon-card in-pokedex" data-testid="added-pokemon">
							<div class="pokemon-info">
								<span class="pokemon-id">#{pokemon.id}</span>
								<span class="pokemon-name">{pokemon.name.english}</span>
								<span class="pokemon-types">
									{#each pokemon.type as type}
										<span class="type-badge {type.toLowerCase()}">{type}</span>
									{/each}
								</span>
							</div>
							<button
								class="remove-btn"
								onclick={() => removePokemon(pokemon)}
								data-testid="remove-pokemon-btn"
							>
								Remove
							</button>
						</div>
					{/each}
				</div>
			</section>
		</div>
	{/if}
</div>

<style>
	.add-pokemon {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		overflow: hidden;
	}

	.search-bar {
		flex-shrink: 0;
	}

	.search-bar input {
		width: 100%;
		padding: 0.75rem;
		background: var(--pixel-bg-input, #1a1a2e);
		border: 2px solid var(--pixel-border-color, #3d3d5c);
		color: var(--pixel-text-white, #fff);
		font-family: inherit;
		font-size: 0.75rem;
		min-height: 44px;
	}

	.status-message {
		padding: 0.5rem;
		background: var(--pixel-text-stat-green, #4caf50);
		color: var(--pixel-text-white, #fff);
		text-align: center;
		font-size: 0.625rem;
		flex-shrink: 0;
	}

	.loading {
		text-align: center;
		padding: 2rem;
		opacity: 0.6;
	}

	.pokemon-sections {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section {
		flex-shrink: 0;
	}

	.section h3 {
		font-size: 0.75rem;
		margin-bottom: 0.5rem;
		padding: 0.25rem 0;
		border-bottom: 1px solid var(--pixel-border-color, #3d3d5c);
	}

	.pokemon-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.5rem;
	}

	.pokemon-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: var(--pixel-bg-panel, #252540);
		border: 2px solid var(--pixel-border-color, #3d3d5c);
		gap: 0.5rem;
	}

	.pokemon-card.in-pokedex {
		border-color: var(--pixel-text-gold, #ffd700);
	}

	.pokemon-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
		min-width: 0;
	}

	.pokemon-id {
		font-size: 0.5rem;
		opacity: 0.6;
	}

	.pokemon-name {
		font-size: 0.625rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pokemon-types {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
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

	.add-btn,
	.remove-btn {
		padding: 0.5rem 0.75rem;
		border: 2px solid var(--pixel-border-color, #3d3d5c);
		font-family: inherit;
		font-size: 0.625rem;
		cursor: pointer;
		min-height: 44px;
		min-width: 60px;
		flex-shrink: 0;
	}

	.add-btn {
		background: var(--pixel-text-stat-green, #4caf50);
		color: var(--pixel-text-white, #fff);
	}

	.remove-btn {
		background: var(--pixel-text-stat-red, #f44336);
		color: var(--pixel-text-white, #fff);
	}

	.add-btn:hover,
	.remove-btn:hover {
		filter: brightness(1.1);
	}

	.more-hint {
		grid-column: 1 / -1;
		text-align: center;
		padding: 0.5rem;
		font-size: 0.625rem;
		opacity: 0.6;
	}

	@media (max-width: 768px) {
		.pokemon-grid {
			grid-template-columns: 1fr;
		}

		.pokemon-card {
			padding: 0.75rem;
		}
	}
</style>
