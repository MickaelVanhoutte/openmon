<script lang="ts">
	import { Stats, type PokedexEntry } from '../../../js/pokemons/pokedex';

	export let pokemon: PokedexEntry;
</script>

<div class="pokedex-detail">
	<div class="column">
		<div class="main row">
			<div class="desc"></div>
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
								<div class="determinate" style="width: {(pokemon.stats.defense / 255) * 100}%"></div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Sp.Attack</td>
						<td>
							<div class="progress">
								<div class="determinate" style="width: {(pokemon.stats.specialAttack / 255) * 100}%"></div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Sp.Defense</td>
						<td>
							<div class="progress">
								<div class="determinate" style="width: {(pokemon.stats.specialDefense / 255) * 100}%"></div>
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
		<div class="menu row"></div>
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
					width: calc(75% / 2);
					height: 100%;
				}
				.pkmn {
					width: 25%;
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: flex-end;
					img {
						height: 80%;
						object-fit: contain;
						&.hide {
							//display: none;
						}
					}
				}
				.stats {
					width: calc(75% / 2 - 20px);
					height: 90%;
					margin-top: 5%;
					perspective: 400px;
					box-sizing: border-box;

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
		}
	}
</style>
