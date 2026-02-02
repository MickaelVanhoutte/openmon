<script lang="ts">
	import type { PokedexEntry, Move } from '$js/pokemons/pokedex';

	interface Props {
		editedPokemon: Map<number, PokedexEntry>;
		editedMoves: Map<string, Move>;
		allPokemon?: PokedexEntry[];
	}

	const { editedPokemon, editedMoves, allPokemon = [] }: Props = $props();

	function exportToJson() {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

		// Build export data
		const exportData = {
			exportedAt: new Date().toISOString(),
			editedPokemonCount: editedPokemon.size,
			editedMovesCount: editedMoves.size,
			totalPokemonCount: allPokemon.length,
			editedPokemon: Array.from(editedPokemon.values()).map((p) => ({
				id: p.id,
				name: p.name,
				types: p.types,
				abilities: p.abilities,
				stats: {
					hp: p.stats.hp,
					attack: p.stats.attack,
					defense: p.stats.defense,
					specialAttack: p.stats.specialAttack,
					specialDefense: p.stats.specialDefense,
					speed: p.stats.speed
				},
				captureRate: p.captureRate,
				baseXp: p.baseXp,
				moves: p.moves.map((m) => ({
					id: m.id,
					name: m.name,
					type: m.type,
					category: m.category,
					power: m.power,
					accuracy: m.accuracy,
					pp: m.pp
				}))
			})),
			editedMoves: Array.from(editedMoves.values()).map((m) => ({
				id: m.id,
				name: m.name,
				type: m.type,
				category: m.category,
				power: m.power,
				accuracy: m.accuracy,
				pp: m.pp,
				priority: m.priority,
				description: m.description
			})),
			allPokemon: allPokemon.map((p) => ({
				id: p.id,
				name: p.name,
				types: p.types,
				abilities: p.abilities,
				stats: {
					hp: p.stats.hp,
					attack: p.stats.attack,
					defense: p.stats.defense,
					specialAttack: p.stats.specialAttack,
					specialDefense: p.stats.specialDefense,
					speed: p.stats.speed
				},
				moves: p.moves.map((m) => ({
					id: m.id,
					name: m.name,
					type: m.type,
					power: m.power,
					accuracy: m.accuracy,
					pp: m.pp,
					level: m.level
				}))
			}))
		};

		// Create and download file
		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `pokedex-modified-${timestamp}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	const hasChanges = $derived(() => editedPokemon.size > 0 || editedMoves.size > 0);
</script>

<button class="export-btn" onclick={exportToJson} data-testid="export-button">
	Export JSON
	{#if hasChanges()}
		<span class="badge">{editedPokemon.size + editedMoves.size}</span>
	{/if}
</button>

<style>
	.export-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--pixel-accent-blue);
		border: 2px solid var(--pixel-border-color);
		color: var(--pixel-text-white);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.875rem;
		transition: filter 0.1s;
	}

	.export-btn:hover {
		filter: brightness(1.1);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.25rem;
		background: var(--pixel-text-gold);
		color: var(--pixel-bg-primary);
		border-radius: 2px;
		font-size: 0.625rem;
		font-weight: bold;
	}
</style>
