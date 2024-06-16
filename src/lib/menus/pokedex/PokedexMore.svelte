<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { typeChart } from '../../../js/battle/battle-model';
	import { PokedexEntry } from '../../../js/pokemons/pokedex';
	import { backInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	export let pokemon: PokedexEntry;

	function calculateTypeEffectiveness(type: string, types: string[]) {
		return types.reduce((acc, type2) => {
			const effectiveness = fromTypeChart(type, type2);
			return acc * effectiveness;
		}, 1);
	}

	function fromTypeChart(type1: string, type2: string): number {
		//@ts-ignore
		return typeChart[type1.toLowerCase()][type2.toLowerCase()] as number;
	}
</script>

<div
	class="more-tab row"
	in:slide={{ duration: 500, delay: 50, axis: 'x', easing: backInOut }}
	class:hide={!pokemon.viewed}
>
	<div class="column weaknesses">
		<h4>Weaknesses & Resistances</h4>
		<table>
			<tr>
				<td>0x</td>
				<td>
					<div class="types smaller">
						{#each Object.keys(typeChart) as type}
							{#if calculateTypeEffectiveness(type, pokemon.types) === 0}
								<div class="type" style="--tcolor:{typeChart[type].color}">
									<!-- <img alt={type} src="src/assets/types/{type}.svg" /> -->
									<svg use:inlineSvg={`src/assets/types/${type}.svg`} fill="currentColor"> </svg>
								</div>
							{/if}
						{/each}
					</div>
				</td>
			</tr>
			<tr>
				<td>0.25x</td>
				<td>
					<div class="types smaller">
						{#each Object.keys(typeChart) as type}
							{#if calculateTypeEffectiveness(type, pokemon.types) === 0.25}
								<div class="type" style="--tcolor:{typeChart[type].color}">
									<!-- <img alt={type} src="src/assets/types/{type}.svg" /> -->
									<svg use:inlineSvg={`src/assets/types/${type}.svg`} fill="currentColor"> </svg>
								</div>
							{/if}
						{/each}
					</div>
				</td>
			</tr>
			<tr>
				<td>0.5x</td>
				<td>
					<div class="types smaller">
						{#each Object.keys(typeChart) as type}
							{#if calculateTypeEffectiveness(type, pokemon.types) === 0.5}
								<div class="type" style="--tcolor:{typeChart[type].color}">
									<!-- <img alt={type} src="src/assets/types/{type}.svg" /> -->
									<svg use:inlineSvg={`src/assets/types/${type}.svg`} fill="currentColor"> </svg>
								</div>
							{/if}
						{/each}
					</div>
				</td>
			</tr>
			<tr>
				<td>2</td>
				<td>
					<div class="types smaller">
						{#each Object.keys(typeChart) as type}
							{#if calculateTypeEffectiveness(type, pokemon.types) === 2}
								<div class="type" style="--tcolor:{typeChart[type].color}">
									<!-- <img alt={type} src="src/assets/types/{type}.svg" /> -->
									<svg use:inlineSvg={`src/assets/types/${type}.svg`} fill="currentColor"> </svg>
								</div>
							{/if}
						{/each}
					</div>
				</td>
			</tr>
			<tr>
				<td>4</td>
				<td>
					<div class="types smaller">
						{#each Object.keys(typeChart) as type}
							{#if calculateTypeEffectiveness(type, pokemon.types) === 4}
								<div class="type" style="--tcolor:{typeChart[type].color}">
									<!-- <img alt={type} src="src/assets/types/{type}.svg" /> -->
									<svg use:inlineSvg={`src/assets/types/${type}.svg`} fill="currentColor"> </svg>
								</div>
							{/if}
						{/each}
					</div>
				</td>
			</tr>
		</table>
	</div>
	<div class="column evolutions">
		<h4>Evolutions</h4>
		{#if pokemon.evolution?.length === 0}
			<div class="evolution noEvolution">
				<img
					src={`src/assets/monsters/pokedex/${('00' + pokemon?.id).slice(-3)}.png`}
					alt="current pokemon"
				/>
				<div class="method">
					<span>No evolution</span>
				</div>
			</div>
		{:else}
			{#each pokemon.evolution as evolution}
				<div class="evolution">
					<img
						src={`src/assets/monsters/pokedex/${('00' + pokemon?.id).slice(-3)}.png`}
						alt="current pokemon"
					/>
					<div class="method">
						{#if pokemon.viewed}
							<span>{evolution?.method} {evolution?.level || ''}</span>
						{:else}
							<span>???</span>
						{/if}
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
							><path
								d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
							></path></svg
						>
					</div>
					<img
						src={`src/assets/monsters/pokedex/${('00' + evolution?.id).slice(-3)}.png`}
						alt="next evolution"
					/>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style lang="scss">
	
	.more-tab {
		height: calc(100% - 80px);
		background-position: center;
		background-size: contain;
		background-repeat: no-repeat;
		background-blend-mode: hard-light;
		padding: 0 4%;
		box-sizing: border-box;
		perspective: 150dvw;

		h4 {
			margin: 4dvh 0 2dvh 0;
		}

		&.hide {
			filter: brightness(0);
		}

		.weaknesses {
			height: 100%;
			width: 50%;
			justify-content: flex-start;
			height: calc(100dvh - 66px);
			overflow-y: auto;
			scrollbar-width: thin;
			scrollbar-color: #68c0c8 #0e2742f0;
			transform: rotateY(30deg);

			table {
				width: 100%;
				height: 80%;
				border-spacing: 0;
				border-collapse: unset;
				table-layout: fixed;

				tr td:first-of-type {
					width: 20%;
				}

				tr:not(:first-of-type) td {
					border-top: 1px solid white;
				}
				tr td {
					padding: 4px 8px;
					font-size: 28px;
				}
			}
		}

		.evolutions {
			width: 50%;
			justify-content: flex-start;

			height: calc(94dvh - 66px);
			overflow-y: auto;
			scrollbar-width: thin;
			scrollbar-color: #68c0c8 #0e2742f0;
			transform: rotateY(-30deg);

			.evolution {
				width: 100%;
				display: flex;
				align-items: center;
				gap: 16px;
				justify-content: space-between;

				&.noEvolution {
					justify-content: center;
				}

				.method {
					display: flex;
					flex-direction: column;
					align-items: center;

					span {
						font-size: 20px;
					}

					svg {
						max-height: 50px;
					}
				}
				img {
					height: auto;
					width: 17dvw;
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
			svg {
				height: 22px;
				width: auto;
			}
		}
	}
</style>
