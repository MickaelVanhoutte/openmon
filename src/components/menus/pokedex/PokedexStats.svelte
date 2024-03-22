<script lang="ts">
	import { typeChart } from '../../../js/battle/battle-model';
	import { PokedexEntry } from '../../../js/pokemons/pokedex';
	import { backInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	export let pokemon: PokedexEntry;
</script>

<div
	class="stats-tab column"
	in:slide={{ duration: 500, delay: 50, axis: 'x', easing: backInOut }}
    class:hide={!pokemon.viewed}
	style="background-image: url({`src/assets/monsters/pokedex/${('00' + pokemon?.id).slice(-3)}.png`})"
>
	<div class="main row">
		<div class="desc">
			<table>
				<tr>
					<td>ID</td>
					<td>#{('00' + pokemon?.id).slice(-3)}</td>
				</tr>
				<tr>
					<td>Height</td>
					<td>{pokemon.height}m</td>
				</tr>

				<tr>
					<td>Weight</td>
					<td>{pokemon.weight}kg</td>
				</tr>
				<tr>
					<td>Abilities</td>
					<td>
						<div class="abilities">
							{#each pokemon.abilities as ability}
								<span class="ability">{ability}</span>
							{/each}
						</div>
					</td>
				</tr>
				<tr>
					<td>Type</td>
					<td>
						<div class="types">
							{#each pokemon.types as type}
								<div class="type" style="--tcolor:{typeChart[type].color}">
									<span>{type}</span>
									<img alt={type} src="src/assets/types/{type}.svg" />
								</div>
							{/each}
						</div>
					</td>
				</tr>
			</table>
		</div>
		<div class="stats">
			<table>
				<tr>
					<td>HP</td>
					<td>
						<div class="progress">
							<div
								class="determinate"
								data-value={pokemon.stats.hp}
								style="width: {(pokemon.stats.hp / 255) * 100}%; --tcolor1: {typeChart[
									pokemon.types[0]
								].color}; --tcolor2: {pokemon.types?.length > 1
									? typeChart[pokemon.types[1]].color
									: typeChart[pokemon.types[0]].color}"
							></div>
						</div>
					</td>
				</tr>
				<tr>
					<td>Atk</td>
					<td>
						<div class="progress">
							<div
								class="determinate"
								data-value={pokemon.stats.attack}
								style="width: {(pokemon.stats.attack / 255) * 100}%; --tcolor1: {typeChart[
									pokemon.types[0]
								].color}; --tcolor2: {pokemon.types?.length > 1
									? typeChart[pokemon.types[1]].color
									: typeChart[pokemon.types[0]].color}"
							></div>
						</div>
					</td>
				</tr>
				<tr>
					<td>Def</td>
					<td>
						<div class="progress">
							<div
								class="determinate"
								data-value={pokemon.stats.defense}
								style="width: {(pokemon.stats.defense / 255) * 100}%; --tcolor1: {typeChart[
									pokemon.types[0]
								].color}; --tcolor2: {pokemon.types?.length > 1
									? typeChart[pokemon.types[1]].color
									: typeChart[pokemon.types[0]].color}"
							></div>
						</div>
					</td>
				</tr>
				<tr>
					<td>Sp.A</td>
					<td>
						<div class="progress">
							<div
								class="determinate"
								data-value={pokemon.stats.specialAttack}
								style="width: {(pokemon.stats.specialAttack / 255) * 100}%; --tcolor1: {typeChart[
									pokemon.types[0]
								].color}; --tcolor2: {pokemon.types?.length > 1
									? typeChart[pokemon.types[1]].color
									: typeChart[pokemon.types[0]].color}"
							></div>
						</div>
					</td>
				</tr>
				<tr>
					<td>Sp.D</td>
					<td>
						<div class="progress">
							<div
								class="determinate"
								data-value={pokemon.stats.specialDefense}
								style="width: {(pokemon.stats.specialDefense / 255) * 100}%; --tcolor1: {typeChart[
									pokemon.types[0]
								].color}; --tcolor2: {pokemon.types?.length > 1
									? typeChart[pokemon.types[1]].color
									: typeChart[pokemon.types[0]].color}"
							></div>
						</div>
					</td>
				</tr>
				<tr>
					<td>Speed</td>
					<td>
						<div class="progress">
							<div
								class="determinate"
								data-value={pokemon.stats.speed}
								style="width: {(pokemon.stats.attack / 255) * 100}%; --tcolor1: {typeChart[
									pokemon.types[0]
								].color}; --tcolor2: {pokemon.types?.length > 1
									? typeChart[pokemon.types[1]].color
									: typeChart[pokemon.types[0]].color}"
							></div>
						</div>
					</td>
				</tr>
				<tr>
					<td>Total</td>
					<td>
						<div class="progress">
							<div
								class="determinate"
								data-value={pokemon.stats.total}
								style="width: {(pokemon.stats.total / 800) * 100}%; --tcolor1: {typeChart[
									pokemon.types[0]
								].color}; --tcolor2: {pokemon.types?.length > 1
									? typeChart[pokemon.types[1]].color
									: typeChart[pokemon.types[0]].color}"
							></div>
						</div>
					</td>
				</tr>
			</table>
		</div>
	</div>
</div>

<style lang="scss">
	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.column {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
	}

	.stats-tab {
		height: calc(100% - 66px);
		width: 100%;
		background-position: center;
		background-size: contain;
		background-repeat: no-repeat;
		background-blend-mode: hard-light;
		background-size: clamp(33vw, 70vh, 45vw);

        &.hide {
            filter: brightness(0);
        }

		.main {
			justify-content: space-between;
			height: 100%;
			.desc {
				width: calc(76% / 2);
				height: 100%;
				perspective: calc(60dvw);
				box-sizing: border-box;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 26px;

				table {
					transform: rotateY(30deg);
					width: 100%;
					height: calc(100% - 44px);
					margin-top: 24px;
					box-sizing: border-box;
					table-layout: fixed;
					padding: 0 2%;
					font-size: clamp(0.6em, 3vw, 2em);

					tr td:first-child {
						width: 33%;
					}

					tr {
						td {
							padding: 1% 0%;
							box-sizing: border-box;

							.abilities {
								display: flex;
								gap: 8px;
								flex-direction: row;
								justify-content: flex-start;
								flex-wrap: wrap;

								.ability {
									font-size: 20px;
									background-color: rgba(0, 0, 0, 0.4);
									padding: 2px 6px;
									word-break: keep-all;
									display: flex;
									justify-content: space-between;
									align-items: center;
									align-content: center;
									flex-wrap: nowrap;

									border-radius: 4px;
									height: 30px;
								}
							}
						}
					}
				}
			}

			.stats {
				width: 33%;
				height: 100%;
				perspective: calc(60dvw);
				box-sizing: border-box;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 26px;

				table {
					transform: rotateY(-30deg);
					width: 100%;
					height: calc(100% - 44px);
					box-sizing: border-box;
					table-layout: fixed;
					padding: 0 2%;
					direction: rtl;
					font-size: clamp(0.6em, 3vw, 2em);
					margin-top: 24px;

					tr td:first-child {
						width: 30%;
					}

					tr {
						td {
							padding: 1% 0%;
							box-sizing: border-box;

							.progress {
								position: relative;
								height: 26px;
								display: block;
								width: 100%;
								background-color: rgba(0, 0, 0, 0.4);
								border-radius: 4px;
								overflow: visible;
							}

							.determinate {
								position: absolute;
								top: 0;
								left: 0;
								bottom: 0;
								//background-color: #26a69a;
								background-color: var(--tcolor1);
								-webkit-transition: width 0.3s linear;
								transition: width 0.3s linear;

								&:after {
									content: attr(data-value);
									position: absolute;
									top: 0;
									//right: 0;
									left: 0;
									bottom: 0;
									padding: 0 4px;
									text-align: center;
									line-height: 26px;
									font-size: 30px;
									font-weight: bold;
									color: #fff;
									text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
								}
							}
						}
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
			img {
				height: 22px;
				width: auto;
			}
		}
	}
</style>
