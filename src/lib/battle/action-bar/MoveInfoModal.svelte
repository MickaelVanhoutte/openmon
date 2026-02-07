<script lang="ts">
	import Modal from '../../common/Modal.svelte';
	import type { MoveInstance } from '../../../js/pokemons/pokedex';

	interface Props {
		showModal: boolean;
		move?: MoveInstance;
	}

	let { showModal = $bindable(), move }: Props = $props();

	const typeColors: Record<string, string> = {
		normal: '#A8A878',
		fire: '#F08030',
		water: '#6890F0',
		electric: '#F8D030',
		grass: '#78C850',
		ice: '#98D8D8',
		fighting: '#C03028',
		poison: '#A040A0',
		ground: '#E0C068',
		flying: '#A890F0',
		psychic: '#F85888',
		bug: '#A8B820',
		rock: '#B8A038',
		ghost: '#705898',
		dragon: '#7038F8',
		dark: '#705848',
		steel: '#B8B8D0',
		fairy: '#EE99AC'
	};

	const mechanicRegex = /\{mechanic:.*?\}/g;

	let showDetail = $derived.by(() => {
		if (!move) {
			return false;
		}
		const effectText =
			move.effect?.effect
				?.replace(mechanicRegex, '')
				?.replace(/\[/g, '')
				?.replace(/\]/g, '')
				?.replaceAll('$effect_chance', move.effectChance + '') || '';

		const descText = move.description?.replaceAll('$effect_chance', move.effectChance + '') || '';

		return effectText.length > descText.length;
	});
</script>

<Modal bind:showModal>
	{#snippet header()}
		<h3 style="margin: 0; text-transform: uppercase; letter-spacing: 1px; font-size: 1.5rem">
			{move?.name}
		</h3>
	{/snippet}

	{#if move}
		<div class="move-info-body">
			<div class="badges-row">
				<div
					class="type-badge"
					style="background-color: {typeColors[move.type.toLowerCase()] || '#A8A878'}"
				>
					<img src="src/assets/types/{move.type.toLowerCase()}-small.png" alt={move.type} />
					<span>{move.type}</span>
				</div>
				<div class="category-badge">
					<img src="src/assets/moves-cat/{move.category}.png" alt={move.category} />
					<span>{move.category}</span>
				</div>
			</div>

			<table class="stats-table">
				<thead>
					<tr>
						<th>Power</th>
						<th>Acc</th>
						<th>PP</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>{move.power || '-'}</td>
						<td>{move.accuracy || '-'}</td>
						<td>{move.currentPp}/{move.pp}</td>
					</tr>
				</tbody>
			</table>

			<div class="description-box">
				<p>
					{move.description?.replaceAll('$effect_chance', move.effectChance + '')}
				</p>
			</div>
		</div>
	{/if}
</Modal>

<style>
	.move-info-body {
		display: flex;
		flex-direction: column;
		gap: 6px;
		color: white;
	}

	.badges-row {
		display: flex;
		justify-content: center;
		gap: 8px;
	}

	.type-badge,
	.category-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: 4px;
		border: 2px solid rgba(0, 0, 0, 0.5);
		box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
		text-transform: uppercase;
		font-weight: bold;
		font-size: 12px;
		text-shadow: 1px 1px 0 #000;
	}

	.category-badge {
		background-color: #4a4a4a;
	}

	.type-badge img,
	.category-badge img {
		height: 16px;
		width: auto;
		filter: drop-shadow(1px 1px 0 #000);
	}

	.stats-table {
		width: 100%;
		border-collapse: collapse;
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		overflow: hidden;
	}

	.stats-table th {
		background-color: rgba(0, 0, 0, 0.4);
		padding: 4px 8px;
		font-size: 12px;
		text-transform: uppercase;
		color: #ccc;
	}

	.stats-table td {
		padding: 4px 8px;
		text-align: center;
		font-size: 14px;
		font-weight: bold;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.description-box {
		background-color: rgba(0, 0, 0, 0.2);
		padding: 6px 8px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.description-box p {
		margin: 0;
		line-height: 1.3;
		font-size: 13px;
	}
</style>
