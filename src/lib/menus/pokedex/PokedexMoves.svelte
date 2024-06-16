<script lang="ts">
	import { typeChart } from '../../../js/battle/battle-model';
	import { Move, PokedexEntry } from '../../../js/pokemons/pokedex';
	import { backInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import Modal from '../../common/Modal.svelte';
	import { inlineSvg } from '@svelte-put/inline-svg';

	export let pokemon: PokedexEntry;

	let currentMove: Move = pokemon.moves[0];
	let showModal = false;
	let showDetail = false;
	const mechanicRegex = /\{mechanic:.*?\}/g;

	function openModal(move: Move): any {
		if (!pokemon.viewed) {
			return;
		}

		currentMove = move;

		showDetail =
			currentMove?.effect?.effect
				?.replace(mechanicRegex, '')
				?.replace(/\[/g, '')
				?.replace(/\]/g, '')
				?.replaceAll('$effect_chance', currentMove?.effectChance + '')?.length >
			currentMove?.description?.replaceAll('$effect_chance', currentMove?.effectChance + '')
				?.length;

		showModal = true;
	}
</script>

<div class="moves-tab column" in:slide={{ duration: 500, delay: 50, axis: 'x', easing: backInOut }}>
	<div class="row moves" class:hide={!pokemon.viewed}>
		{#if !pokemon.viewed}
			<h3 style="color: white; text-align: center; margin-top: 10%">
				No information on this pokemon
			</h3>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Lvl</th>
						<th>Name</th>
						<th>Type</th>
						<th>Category</th>
						<th>Power</th>
						<th>Accuracy</th>
						<th>PP</th>
					</tr>
				</thead>
				<tbody>
					{#each pokemon.moves as move}
						<tr on:click={() => openModal(move)}>
							<td>
								{pokemon.viewed ? move.level : '???'}
							</td>
							<td>
								{move.name}
							</td>
							<td>
								<div class="types">
									<div class="type" style="--tcolor:{typeChart[move.type].color}">
										<!-- <img alt={move.type} src="src/assets/types/{move.type}.svg" /> -->
										<svg use:inlineSvg={`src/assets/types/${move.type}.svg`} fill="currentColor"> </svg>
									</div>
								</div>
							</td>
							<td>
								<img
									class="move-cat"
									alt={move.type}
									src="src/assets/moves-cat/{move.category}.png"
								/>
							</td>
							<td>
								{move.power || '-'}
							</td>
							<td>
								{move.accuracy || '-'}
							</td>
							<td>
								{move.pp}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<Modal bind:showModal>
	<h3 slot="header" style="margin: 2% 0">
		{currentMove?.name}
	</h3>

	<p style="margin: 0">
		{currentMove?.description?.replaceAll('$effect_chance', currentMove?.effectChance + '')}
	</p>

	{#if currentMove?.effect && showDetail}
		<hr />
		<h5>Detail</h5>
		<p  style="margin: 0">
			{currentMove?.effect?.effect
				.replace(mechanicRegex, '')
				.replace(/\[/g, '')
				.replace(/\]/g, '')
				?.replaceAll('$effect_chance', currentMove?.effectChance + '')}
		</p>
	{/if}
</Modal>

<style lang="scss">
	.column {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
	}

	.moves-tab {
		height: calc(100% - 80px);
		width: 100%;
		background-position: center;
		background-size: contain;
		background-repeat: no-repeat;
		background-blend-mode: hard-light;

		.moves {
			width: 100%;
			height: 100%;
			overflow-y: auto;
			scrollbar-width: thin;
			scrollbar-color: #68c0c8 #0e2742f0;
			display: block;
			padding: 2%;
			box-sizing: border-box;

			&.hide {
				filter: brightness(0);
			}

			table {
				width: 100%;
				border-collapse: separate;
				border-spacing: 0;
				font-size: 22px;

				th {
					color: #000;
					padding: 8px;
					background-color: #fff;
				}

				//odd rows
				tr:nth-child(even) {
					background-color: rgba(0, 0, 0, 0.4);
				}

				td {
					padding: 8px;
					text-align: center;
					box-sizing: border-box;
					.move-cat {
						height: 22px;
						width: auto;
					}
				}
			}
		}
	}

	.types {
		display: flex;
		gap: 8px;
		flex-direction: row;
		justify-content: flex-start;
		flex-wrap: wrap;

		&.smaller {
			gap: 4px;

			.type {
				height: 22px;
				width: auto;
			}
		}

		.type {
			font-size: 20px;
			text-transform: uppercase;
			border-radius: 4px;
			height: 30px;
			text-shadow: 0 0 3px #000;
			filter: saturate(100%) brightness(110%);
			transition: all 0.2s;
			background: var(--tcolor);
			box-shadow: 0 0 6px var(--tcolor);
			display: flex;
			justify-content: space-around;
			align-items: center;
			align-content: center;
			flex-wrap: nowrap;
			gap: 8px;
			padding: 2px 6px;

			span {
				color: white;
			}
			img,svg {
				height: 22px;
				width: auto;
			}
		}
	}
</style>
