<script lang="ts">
	import { typeChart } from '../../../js/battle/battle-model';
	import { Stats, type PokedexEntry } from '../../../js/pokemons/pokedex';

	export let pokemon: PokedexEntry;

	console.log(pokemon);
</script>

<div class="pokedex-detail" style="--color:{typeChart[pokemon.types[0]].color}">
	<div class="back">
		<button class="pushable">
			<span class="edge"></span>
			<span class="front"> BACK </span>
		</button>
	</div>

	<div class="row title">
		<h1>{pokemon.name}</h1>
	</div>

	<div class="column">
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
			<div class="pkmn">
				<img
					src={`src/assets/monsters/pokedex/${('00' + pokemon?.id).slice(-3)}.png`}
					class:hide={!pokemon?.viewed}
					alt={pokemon?.name}
				/>
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
									style="width: {(pokemon.stats.hp / 255) * 100}%"
								></div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Attack</td>
						<td>
							<div class="progress">
								<div
									class="determinate"
									data-value={pokemon.stats.attack}
									style="width: {(pokemon.stats.attack / 255) * 100}%"
								></div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Defense</td>
						<td>
							<div class="progress">
								<div
									class="determinate"
									data-value={pokemon.stats.defense}
									style="width: {(pokemon.stats.defense / 255) * 100}%"
								></div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Sp.Attack</td>
						<td>
							<div class="progress">
								<div
									class="determinate"
									data-value={pokemon.stats.specialAttack}
									style="width: {(pokemon.stats.specialAttack / 255) * 100}%"
								></div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Sp.Defense</td>
						<td>
							<div class="progress">
								<div
									class="determinate"
									data-value={pokemon.stats.specialDefense}
									style="width: {(pokemon.stats.specialDefense / 255) * 100}%"
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
									style="width: {(pokemon.stats.attack / 255) * 100}%"
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
									style="width: {(pokemon.stats.total / 800) * 100}%"
								></div>
							</div>
						</td>
					</tr>
				</table>
			</div>
		</div>
	</div>

	<div class="menu row">
		<div class="wrapper">
			<input type="radio" name="tab" id="tab1" class="tab tab--1" />
			<label class="tab_label" for="tab1">Stats</label>

			<input type="radio" name="tab" id="tab2" class="tab tab--2" />
			<label class="tab_label" for="tab2">More</label>

			<input type="radio" name="tab" id="tab3" class="tab tab--3" />
			<label class="tab_label" for="tab3">Moves</label>

			<div class="indicator"></div>
		</div>
	</div>
</div>

<style lang="scss">
	.pokedex-detail {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		// background-image: url('src/assets/menus/p-sum.jpg');
		// background-size: cover;
		// background-position: top left;
		// background-repeat: round;
		background: rgb(0, 29, 43);
		background: -moz-linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		background: -webkit-linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		background: linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		color: #fff;
		z-index: 9;

		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			width: 100%;
		}

		.title {
			height: 10%;
			justify-content: center;
			background-color: rgba(44, 56, 69, 0.3);
			h1 {
				font-size: 36px;
				text-transform: uppercase;
				margin: 0;
				padding: 0;
				text-align: center;
			}
		}

		.menu {
			align-items: center;
			height: 10%;
			width: 100%;
			justify-content: center;
			align-content: center;
			flex-wrap: wrap;
			background-color: rgba(44, 56, 69, 0.3);

			.wrapper {
				display: flex;
				flex-direction: row;
				align-items: flex-start;
				padding: 3px;
				border-radius: 9px;
				position: relative;
			}

			.indicator {
				content: '';
				width: 130px;
				height: 28px;
				background: #ffffff;
				position: absolute;
				top: 2px;
				left: 2px;
				z-index: 9;
				border: 0.5px solid rgba(0, 0, 0, 0.04);
				box-shadow:
					0px 3px 8px rgba(0, 0, 0, 0.12),
					0px 3px 1px rgba(0, 0, 0, 0.04);
				border-radius: 7px;
				transition: all 0.2s ease-out;
			}

			.tab {
				width: 130px;
				height: 28px;
				position: absolute;
				z-index: 99;
				outline: none;
				opacity: 0;
			}

			.tab_label {
				width: 130px;
				height: 28px;

				position: relative;
				z-index: 999;

				display: flex;
				align-items: center;
				justify-content: center;

				border: 0;

				color: #000;
				font-size: 26px;
				opacity: 0.6;
				text-transform: uppercase;
				cursor: pointer;
			}

			.tab--1:checked ~ .indicator {
				left: 2px;
			}

			.tab--2:checked ~ .indicator {
				left: calc(130px + 2px);
			}

			.tab--3:checked ~ .indicator {
				left: calc(130px * 2 + 2px);
			}
		}

		.column {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			height: 80%;
			width: 100%;
			background-color: rgba(44, 56, 69, 0.3);

			.main {
				justify-content: space-between;
				height: 100%;
				.desc {
					width: calc(72% / 2);
					height: 100%;
					perspective: calc(100dvw / 2);
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 26px;

					table {
						transform: rotateY(30deg);
						width: 100%;
						box-sizing: border-box;
						table-layout: fixed;
						padding: 0 4%;

						tr td:first-child {
							width: 40%;
						}

						tr {
							td {
								padding: 2% 4%;
								box-sizing: border-box;

								.types {
									display: flex;
									gap: 8px;
									flex-direction: row;
									justify-content: flex-start;

									.type {
										border-radius: 4px;
										height: 30px;
										width: 100px;
										max-width: 100px;
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
										padding: 2px 8px;
										

										span {
											color: white;
										}
										img {
											height: 22px;
											width: auto;
										}
									}
								}

								.abilities {
									display: flex;
									gap: 8px;
									flex-direction: row;
									justify-content: flex-start;
									flex-wrap: wrap;

									.ability {
										background-color: var(--color);
										padding: 2px 8px;
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
				.pkmn {
					width: 28%;
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: flex-end;
					align-items: center;

					h1 {
						margin: 0;
					}

					img {
						max-height: 80%;
						width: 100%;
						object-fit: contain;
						&.hide {
							//display: none;
						}
					}
				}
				.stats {
					width: calc(72% / 2);
					height: 100%;
					perspective: calc(100dvw / 2);
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 26px;

					table {
						transform: rotateY(-30deg);
						width: 100%;
						box-sizing: border-box;
						table-layout: fixed;
						padding: 0 4%;

						tr td:first-child {
							width: 40%;
						}

						tr {
							td {
								padding: 2% 4%;
								box-sizing: border-box;

								.progress {
									position: relative;
									height: 18px;
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
									background-color: var(--color);
									-webkit-transition: width 0.3s linear;
									transition: width 0.3s linear;
									box-shadow: 0 0 6px var(--color);

									&:after {
										content: attr(data-value);
										position: absolute;
										top: 0;
										right: 0;
										left: 0;
										bottom: 0;
										padding: 0 4px;
										text-align: center;
										line-height: 18px;
										font-size: 22px;
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
	}

	.back {
		position: absolute;
		bottom: 3%;
		left: 1%;
	}

	.pushable {
		position: relative;
		background: transparent;
		padding: 0px;
		border: none;
		cursor: pointer;
		outline: none;
		transition: filter 250ms;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
	}

	.edge {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		border-radius: 8px;
		background: linear-gradient(
			to right,
			hsl(248, 9%, 75%) 0%,
			hsl(248, 9%, 75%) 8%,
			hsl(248, 9%, 75%) 92%,
			hsl(248, 9%, 75%) 100%
		);
	}

	.front {
		display: block;
		position: relative;
		border-radius: 8px;
		background: hsl(248, 17%, 85%);
		padding: 8px 22px;
		font-family: pokemon;
		text-transform: uppercase;
		font-size: 24px;
		transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);
	}

	.pushable:hover {
		filter: brightness(110%);
	}

	.pushable:hover .front {
		transform: translateY(-6px);
		transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
	}

	.pushable:active .front {
		transform: translateY(-2px);
		transition: transform 34ms;
	}

	.pushable:hover .shadow {
		transform: translateY(4px);
		transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
	}

	.pushable:active .shadow {
		transform: translateY(1px);
		transition: transform 34ms;
	}

	.pushable:focus:not(:focus-visible) {
		outline: none;
	}
</style>
