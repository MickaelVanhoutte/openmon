<script lang="ts">
	import type { Stats } from '$js/pokemons/pokedex';
	import type { PokemonInstance } from '$js/pokemons/pokedex';

	interface Props {
		pokemon: PokemonInstance;
		oldStats: Stats;
	}

	let { pokemon, oldStats }: Props = $props();

	const statSkip = ['total', 'accuracy', 'evasion', 'level'];
</script>

<div class="level-up">
	<ul>
		{#each Object.keys(oldStats) as stat}
			{#if !statSkip.includes(stat)}
				<li
					class="lvl-stat"
					data-stat={stat
						.replace(/attack/i, 'atk')
						.replace(/defense/i, 'def')
						.replace('special', 'sp.')
						.toUpperCase()}
					data-val1="{(oldStats as any)[stat]} + {(pokemon.stats as any)[stat] -
						(oldStats as any)[stat]}"
					data-val2={(pokemon.stats as any)[stat]}
				></li>
			{/if}
		{/each}
	</ul>
</div>

<style lang="scss">
	.level-up {
		position: absolute;
		top: 30%;
		left: 2%;
		min-width: 25%;
		max-width: 33%;
		height: 40%;
		color: white;
		z-index: 9;

		ul {
			height: 100%;
			list-style: none;
			padding: 0;
			margin: 0;
			overflow: hidden;
			background-color: rgba(88, 83, 100, 0.7);
			border-radius: 8px;
			box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.45);
			padding: 1%;
			display: flex;
			flex-direction: column;
			align-content: flex-end;
			justify-content: flex-start;
			align-items: flex-start;
			li {
				padding: 1%;
				margin: 1%;
				flex-grow: 1;
				position: relative;
				width: 100%;
				font-size: 20px;

				&:after {
					content: attr(data-val1);
					position: absolute;
					top: 0;
					right: 0;
					height: 100%;
					width: 50%;
					padding: 0 4% 0 2%;
					transition: all 0.2s ease-in-out;
					animation: displayData 3s ease-in forwards;
				}

				&::before {
					content: attr(data-stat);
					position: absolute;
					top: 0;
					left: 0;
					height: 100%;
					width: 50%;
					padding: 0 4% 0 2%;
				}

				@keyframes displayData {
					0% {
						content: attr(data-val1);
					}
					50% {
						content: attr(data-val2);
					}
					100% {
						content: attr(data-val2);
					}
				}
			}
		}
	}
</style>
