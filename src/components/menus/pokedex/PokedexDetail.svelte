<script lang="ts">
	import { onMount } from 'svelte';
	import { typeChart } from '../../../js/battle/battle-model';
	import type { GameContext } from '../../../js/context/gameContext';
	import { PokedexEntry } from '../../../js/pokemons/pokedex';
	import { backInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	export let context: GameContext;
	export let pokemon: PokedexEntry;
	export let selectedIdx: number;
	export let filtered: PokedexEntry[];
	export let detailOpened: boolean;
	console.log(pokemon);

	const tabs = {
		1: 'Stats',
		2: 'More',
		3: 'Moves'
	};
	let currentTab: 1 | 2 | 3 = 1;

	function selectTab(tab: 1 | 2 | 3) {
		currentTab = tab;
	}

	function select(idx: number) {
		selectedIdx = idx;
	}

	function next() {
		if (selectedIdx < filtered.length - 1) {
			select(selectedIdx + 1);
		}
	}

	function previous() {
		if (selectedIdx > 0) {
			select(selectedIdx - 1);
		}
	}

	function back() {
		detailOpened = false;
	}

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

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'ArrowLeft') {
			let tab: 1 | 2 | 3 = currentTab === 1 ? 3 : ((currentTab - 1) as 1 | 2 | 3);
			selectTab(tab);
		} else if (e.key === 'ArrowRight') {
			let tab: 1 | 2 | 3 = currentTab === 3 ? 1 : ((currentTab + 1) as 1 | 2 | 3);
			selectTab(tab);
		}
	};

	onMount(() => {
		window.addEventListener('keydown', listener);
		return () => {
			window.removeEventListener('keydown', listener);
		};
	});
</script>

<div class="pokedex-detail" style="--color:{typeChart[pokemon.types[0]].color}">
	<div class="row title">
		<div class="back">
			<button on:click={() => back()}> BACK </button>
		</div>

		<div>
			<h1>{pokemon.name}</h1>
		</div>
		<div class="prev-next">
			<button on:click={() => previous()}>▲</button>
			<button on:click={() => next()}>▼</button>
		</div>
	</div>

	{#if currentTab === 1}
		<div
			class="stats-tab column"
			in:slide={{ duration: 500, delay: 50, axis: 'x', easing: backInOut }}
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
										style="width: {(pokemon.stats.specialAttack / 255) *
											100}%; --tcolor1: {typeChart[pokemon.types[0]].color}; --tcolor2: {pokemon
											.types?.length > 1
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
										style="width: {(pokemon.stats.specialDefense / 255) *
											100}%; --tcolor1: {typeChart[pokemon.types[0]].color}; --tcolor2: {pokemon
											.types?.length > 1
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
	{:else if currentTab === 2}
		<div class="more-tab row" in:slide={{ duration: 500, delay: 50, axis: 'x', easing: backInOut }}>
			<div class="column weaknesses">
				<h4>Weaknesses & Resistances</h4>
				<table>
					<tr>
						<td>0x</td>
						<td>
							<div class="types">
								{#each Object.keys(typeChart) as type}
									{#if calculateTypeEffectiveness(type, pokemon.types) === 0}
										<div class="type" style="--tcolor:{typeChart[type].color}">
											<img alt={type} src="src/assets/types/{type}.svg" />
										</div>
									{/if}
								{/each}
							</div>
						</td>
					</tr>
					<tr>
						<td>0.25x</td>
						<td>
							<div class="types">
								{#each Object.keys(typeChart) as type}
									{#if calculateTypeEffectiveness(type, pokemon.types) === 0.25}
										<div class="type" style="--tcolor:{typeChart[type].color}">
											<img alt={type} src="src/assets/types/{type}.svg" />
										</div>
									{/if}
								{/each}
							</div>
						</td>
					</tr>
					<tr>
						<td>0.5x</td>
						<td>
							<div class="types">
								{#each Object.keys(typeChart) as type}
									{#if calculateTypeEffectiveness(type, pokemon.types) === 0.5}
										<div class="type" style="--tcolor:{typeChart[type].color}">
											<img alt={type} src="src/assets/types/{type}.svg" />
										</div>
									{/if}
								{/each}
							</div>
						</td>
					</tr>
					<tr>
						<td>2</td>
						<td>
							<div class="types">
								{#each Object.keys(typeChart) as type}
									{#if calculateTypeEffectiveness(type, pokemon.types) === 2}
										<div class="type" style="--tcolor:{typeChart[type].color}">
											<img alt={type} src="src/assets/types/{type}.svg" />
										</div>
									{/if}
								{/each}
							</div>
						</td>
					</tr>
					<tr>
						<td>4</td>
						<td>
							<div class="types">
								{#each Object.keys(typeChart) as type}
									{#if calculateTypeEffectiveness(type, pokemon.types) === 4}
										<div class="type" style="--tcolor:{typeChart[type].color}">
											<img alt={type} src="src/assets/types/{type}.svg" />
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
					<div class="evolution">
						<img
							src={`src/assets/monsters/pokedex/${('00' + pokemon?.id).slice(-3)}.png`}
							alt="current pokemon"
						/>
						<div>No evolution</div>
					</div>
				{:else}
					{#each pokemon.evolution as evolution}
						<div class="evolution">
							<img
								src={`src/assets/monsters/pokedex/${('00' + pokemon?.id).slice(-3)}.png`}
								alt="current pokemon"
							/>
							<div class="method">
								<span>{evolution?.method} {evolution?.level || ''}</span>
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
	{:else if currentTab === 3}
		<div
			class="moves-tab column"
			in:slide={{ duration: 500, delay: 50, axis: 'x', easing: backInOut }}
		>
			<div class="row moves">
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
							<tr>
								<td>
									{move.level}
								</td>
								<td>
									{move.name}
								</td>
								<td>
									<div class="types">
										<div class="type" style="--tcolor:{typeChart[move.type].color}">
											<img alt={move.type} src="src/assets/types/{move.type}.svg" />
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
			</div>
		</div>
	{/if}
	<div class="menu row">
		<div class="wrapper">
			<input type="radio" name="tab" id="tab1" class="tab tab--1" checked={currentTab === 1} />
			<label class="tab_label" for="tab1" on:click={() => selectTab(1)}>Stats</label>

			<input type="radio" name="tab" id="tab2" class="tab tab--2" checked={currentTab === 2} />
			<label class="tab_label" for="tab2" on:click={() => selectTab(2)}>More</label>

			<input type="radio" name="tab" id="tab3" class="tab tab--3" checked={currentTab === 3} />
			<label class="tab_label" for="tab3" on:click={() => selectTab(3)}>Moves</label>

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

		.column {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
		}

		.title {
			height: 33px;
			gap: 6%;
			padding: 0 1%;
			box-sizing: border-box;

			h1 {
				font-size: 36px;
				text-transform: uppercase;
				margin: 0;
				padding: 0;
				text-align: center;
			}

			button {
				width: 60px;
				height: 28px;
				position: relative;
				z-index: 999;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 26px;
				text-transform: uppercase;
				cursor: pointer;
				border-radius: 4px;
				color: white;
				background: rgba(0, 0, 0, 0.2);
				border: 1px solid white;
			}

			.prev-next {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				gap: 8px;
			}
		}

		.menu {
			align-items: center;
			height: 33px;
			width: 100%;
			justify-content: center;
			align-content: center;
			flex-wrap: wrap;

			.wrapper {
				display: flex;
				flex-direction: row;
				align-items: flex-start;
				padding: 2px 3px 3px 3px;
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

		.stats-tab {
			height: calc(100% - 66px);
			width: 100%;
			background-position: center;
			background-size: contain;
			background-repeat: no-repeat;
			background-blend-mode: hard-light;
			background-size: clamp(33vw, 85vh, 60vw);

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

		.more-tab {
			height: calc(100% - 66px);
			width: 100%;
			background-position: center;
			background-size: contain;
			background-repeat: no-repeat;
			background-blend-mode: hard-light;
			padding: 0 2%;
			box-sizing: border-box;

			.weaknesses {
				height: 100%;
				justify-content: flex-start;

				table {
					border-spacing: 0;
					border-collapse: unset;
					tr:not(:first-of-type) td {
						border-top: 1px solid white;
					}
					tr td {
						padding: 4px 8px;
					}
				}
			}

			.evolutions {
				width: 45%;
				height: 100%;
				justify-content: flex-start;

				overflow-y: auto;
				scrollbar-width: thin;
				scrollbar-color: #68c0c8 #0e2742f0;

				.evolution {
					display: flex;
					align-items: center;
					gap: 16px;

					.method {
						display: flex;
						flex-direction: column;
						align-items: center;

						svg {
							max-height: 60px;
						}
					}
					img {
						height: 100px;
						width: auto;
					}
				}
			}
		}

		.moves-tab {
			height: calc(100% - 66px);
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

				table {
					width: 100%;
					border-collapse: separate;
					border-spacing: 0;
					font-size: 22px;
					height: 100%;

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
						.move-cat {
							height: 22px;
							width: auto;
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

	.back {
		button {
			padding: 4px 16px;
			height: 28px;
			position: relative;
			z-index: 999;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 26px;
			text-transform: uppercase;
			cursor: pointer;
			border-radius: 4px;
			font-family: 'pokemon';
			color: white;
			background: rgba(0, 0, 0, 0.2);
			border: 1px solid white;
		}
	}
</style>
