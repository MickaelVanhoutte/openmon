<script lang="ts">
	import { Stats, type PokedexEntry } from '../../../js/pokemons/pokedex';

	export let pokemon: PokedexEntry;

	console.log(pokemon);
</script>

<div class="pokedex-detail">
	<div class="back">
		<button class="pushable">
			<span class="edge"></span>
			<span class="front"> BACK </span>
		</button>
	</div>

	<div class="column">
		<div class="main row">
			<div class="desc">
				<table>
					<tr>
						<td>ID</td>
						<td>{('00' + pokemon?.id).slice(-3)}</td>
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
							{#each pokemon.abilities as ability}
								<span>{ability}</span>
							{/each}
						</td>
					</tr>

					<tr>
						<td>Type</td>
						<td>
							{#each pokemon.types as type}
								<span>{type}</span>
							{/each}
						</td>
					</tr>
				</table>
			</div>
			<div class="pkmn">
				<h1>{pokemon.name}</h1>
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
								<div class="determinate" style="width: {(pokemon.stats.hp / 255) * 100}%"></div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Attack</td>
						<td>
							<div class="progress">
								<div class="determinate" style="width: {(pokemon.stats.attack / 255) * 100}%"></div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Defense</td>
						<td>
							<div class="progress">
								<div
									class="determinate"
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
									style="width: {(pokemon.stats.specialDefense / 255) * 100}%"
								></div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Speed</td>
						<td>
							<div class="progress">
								<div class="determinate" style="width: {(pokemon.stats.attack / 255) * 100}%"></div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Total</td>
						<td>
							<div class="progress">
								<div class="determinate" style="width: {(pokemon.stats.total / 800) * 100}%"></div>
							</div>
						</td>
					</tr>
				</table>
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
</div>

<style lang="scss">
	.pokedex-detail {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		background-image: url('src/assets/menus/p-sum.jpg');
		background-size: cover;
		background-position: top left;
		background-repeat: round;
		z-index: 9;

		.column {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			height: 100%;
			width: 100%;
			background-color: rgba(44, 56, 69, 0.3);

			.main {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				height: 80%;
				width: 100%;
				.desc {
					width: calc(70% / 2);
					height: 90%;
					margin-top: 5%;
					perspective: 400px;
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 26px;

					table {
						transform: rotateY(30deg);
						width: 90%;
						box-sizing: border-box;
						table-layout: fixed;

						tr td:first-child {
							width: 40%;
						}

						tr {
							td {
								padding: 2% 4%;
								box-sizing: border-box;
							}
						}
					}
				}
				.pkmn {
					width: 30%;
					height: 90%;
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
					width: calc(70% / 2 - 20px);
					height: 90%;
					margin-top: 5%;
					perspective: 400px;
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 26px;

					table {
						transform: rotateY(-30deg);
						width: 90%;
						box-sizing: border-box;
						table-layout: fixed;

						tr td:first-child {
							width: 40%;
						}

						tr {
							td {
								padding: 2% 4%;
								box-sizing: border-box;

								.progress {
									position: relative;
									height: 12px;
									display: block;
									width: 100%;
									background-color: #acece6;
									border-radius: 2px;
									margin: 0.5rem 0 1rem 0;
									overflow: hidden;
								}

								.determinate {
									position: absolute;
									top: 0;
									left: 0;
									bottom: 0;
									background-color: #26a69a;
									-webkit-transition: width 0.3s linear;
									transition: width 0.3s linear;
								}
							}
						}
					}
				}
			}

			.menu {
				display: flex;
				flex-direction: row;
				align-items: center;
				text-align: center;
				height: 10%;
				width: 100%;
				justify-content: center;
				align-content: center;
				flex-wrap: wrap;

				.wrapper {
					display: flex;
					flex-direction: row;
					align-items: flex-start;
					padding: 3px;
					background-color: rgba(44, 56, 69, 0.3);
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
		}
	}

	.back {
		position: absolute;
		top: 3%;
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
		padding: 10px 22px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		font-size: 1rem;
		transform: translateY(-4px);
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
