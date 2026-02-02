<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Chart,
		RadarController,
		RadialLinearScale,
		PointElement,
		LineElement,
		Filler
	} from 'chart.js';
	import { Nature, PokemonInstance } from '../../../js/pokemons/pokedex';
	import { fade, slide } from 'svelte/transition';
	import { backInOut } from 'svelte/easing';
	import type { GameContext } from '../../../js/context/gameContext';
	import { GUIDES_STEPS } from '../../../js/context/guides-steps';

	Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler);

	interface Props {
		context: GameContext;
		selected: number;
		statEdit: boolean;
		isBattle: boolean;
		zIndex: number;
		pkmnList: PokemonInstance[];
	}

	let {
		context,
		selected = $bindable(),
		statEdit = $bindable(false),
		isBattle = $bindable(),
		zIndex = $bindable(),
		pkmnList = $bindable()
	}: Props = $props();

	let graphWrapper: HTMLDivElement | undefined = $state(undefined);
	let graph: HTMLCanvasElement | undefined = $state(undefined);
	let editBtn: HTMLButtonElement | undefined = $state(undefined);
	let editLines: HTMLTableSectionElement | undefined = $state(undefined);

	type StatKey = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed';

	const selectedMons = $derived(pkmnList[selected]);
	const statsKeys = $derived(
		Object.keys(selectedMons.stats).filter(
			(key) => key !== 'total' && key !== 'accuracy' && key !== 'evasion'
		) as Array<StatKey>
	);
	const totalStats = $derived(Object.values(selectedMons.currentStats).reduce((a, b) => a + b, 0));

	function disabled(key: StatKey, testValue: number) {
		if (testValue > 0) {
			return (
				selectedMons.evsToDistribute - testValue < 0 || selectedMons.evs[key] + testValue > 252
			);
		} else {
			return selectedMons.evs[key] === 0 || selectedMons.evs[key] + testValue <= 0;
		}
	}

	function ivColor(value: number) {
		if (value >= 21) {
			return '#27d227';
		} else if (value >= 11) {
			return '#fbb841';
		} else {
			return '#fb607c';
		}
	}

	function natureColor(stat: string, nature: Nature) {
		if (nature.increasedStatId === nature.decreasedStatId) {
			return 'white';
		} else if (nature.increasedStatId === stat) {
			return '#FF4444';
		} else if (nature.decreasedStatId === stat) {
			return '#4488FF';
		} else {
			return 'white';
		}
	}

	function openEdition() {
		statEdit = !statEdit;
		setTimeout(() => {
			if (
				statEdit &&
				editLines?.rows?.length &&
				editLines.rows.length > 0 &&
				!context.viewedGuides.includes(GUIDES_STEPS.EVS_EDIT.order)
			) {
				context.tg.setOptions({
					steps: [GUIDES_STEPS.EVS_EDIT].map((step) => ({
						...step,
						target: editLines?.rows[1]
					}))
				});
				context.tg.refresh();
			}
		}, 510);
	}

	function addEv(stat: StatKey, number: number) {
		selectedMons.addEv(stat, number);
		pkmnList = [...pkmnList];
	}

	const data = $derived({
		labels: [
			['HP', selectedMons.currentStats.hp],
			['Attack', selectedMons.currentStats.attack],
			['Defense', selectedMons.currentStats.defense],
			['Speed', selectedMons.currentStats.speed],
			['Sp. Def', selectedMons.currentStats.specialDefense],
			['Sp. Atk', selectedMons.currentStats.specialAttack]
		],
		datasets: [
			{
				label: 'current',
				data: [
					selectedMons.currentStats.hp,
					selectedMons.currentStats.attack,
					selectedMons.currentStats.defense,
					selectedMons.currentStats.speed,
					selectedMons.currentStats.specialDefense,
					selectedMons.currentStats.specialAttack
				],
				fill: true,
				backgroundColor: 'rgba(242, 228, 3, .3)',
				borderColor: 'rgba(242, 228, 3, 0)',
				borderWidth: 2,
				pointBorderWidth: 0,
				pointStyle: false as const,
				spanGaps: true,
				tension: 0
			},
			{
				label: 'EVs',
				data: [
					selectedMons.evs.hp,
					selectedMons.evs.attack,
					selectedMons.evs.defense,
					selectedMons.evs.speed,
					selectedMons.evs.specialDefense,
					selectedMons.evs.specialAttack
				],
				fill: true,
				backgroundColor: 'rgba(242, 228, 3, 1)',
				borderColor: 'rgba(242, 228, 3, 0)',
				borderWidth: 2,
				pointBorderWidth: 0,
				pointStyle: false as const,
				spanGaps: true,
				tension: 0
			}
		]
	});

	const config = $derived({
		type: 'radar' as const,
		data: data,
		responsive: true,
		maintainAspectRatio: false,
		options: {
			scales: {
				r: {
					min: -30,
					max: Math.max(
						Math.max(
							...Object.values({
								...selectedMons.currentStats,
								total: 0
							})
						),
						Math.max(...Object.values({ ...selectedMons.evs, total: 0 }))
					),
					beginAtZero: true,

					pointLabels: {
						display: true,
						color: [
							natureColor('hp', selectedMons.nature),
							natureColor('attack', selectedMons.nature),
							natureColor('defense', selectedMons.nature),
							natureColor('speed', selectedMons.nature),
							natureColor('specialDefense', selectedMons.nature),
							natureColor('specialAttack', selectedMons.nature)
						],
						font: {
							size: 22,
							family: 'pokemon, serif',
							weight: '500'
						}
					},
					ticks: {
						display: false,
						maxTicksLimit: 3,
						color: 'white'
					},
					grid: {
						color: 'rgba(255, 255, 255, 0.3)'
					},
					gridLines: {
						display: false
					}
				}
			},
			plugins: {
				legend: {
					display: false
				},
				title: {
					display: false
				},
				datalabels: {
					display: false
				}
			},
			elements: {
				line: {
					borderWidth: 2
				}
			}
		}
	});

	function makeChart(ctx: HTMLCanvasElement) {
		const myChart = new Chart(ctx, config);
		return {
			update() {
				myChart.data = data;
				myChart.config.options = config.options;
				myChart.update('none');
			},
			destroy() {
				myChart.destroy();
			}
		};
	}

	onMount(() => {
		setTimeout(() => {
			if (editBtn && !context.viewedGuides.includes(GUIDES_STEPS.EVS.order)) {
				context.tg.setOptions({
					steps: [GUIDES_STEPS.EVS].map((step) => ({
						...step,
						target: editBtn
					}))
				});
				context.tg.refresh();
			}
		}, 610);
	});

	function getStatBarWidth(value: number) {
		const max = 300;
		return Math.min(100, (value / max) * 100) + '%';
	}
</script>

<div
	class="stats"
	style="--zIndex:{zIndex}"
	in:slide={{ duration: 500, delay: 100, axis: 'x', easing: backInOut }}
	out:fade
>
	<div class="content-grid">
		<div class="left-panel">
			<div class="img-ability">
				<div class="img-wrapper">
					<img src={selectedMons.getSprite()} alt="{selectedMons.name} img" />
				</div>
				<div class="ability-simple">
					<span class="ability-label">Ability:</span>
					<span class="ability-name">{selectedMons.currentAbility}</span>
				</div>
			</div>
		</div>

		<div class="right-panel">
			<div class="stats-table">
				<div class="stats-header-row">
					<div class="col-label">
						{#if !isBattle}
							<button
								bind:this={editBtn}
								class="edit-btn"
								class:flash={selectedMons.evsToDistribute > 0}
								onclick={() => openEdition()}
							>
								Edit EVs
							</button>
						{/if}
					</div>
					<div class="col-val">Value</div>
					<div class="col-iv">IVs</div>
					<div class="col-ev">EVs</div>
				</div>

				{#each statsKeys as key}
					<div class="stats-row">
						<div class="stat-label" style="color:{natureColor(key, selectedMons.nature)}">
							{key
								.replace(/attack/i, 'Atk')
								.replace(/defense/i, 'Def')
								.replace('special', 'Sp.')
								.toUpperCase()}
						</div>
						<div class="stat-value-container">
							<span class="stat-val-text">
								{#if key === 'hp'}{selectedMons.currentHp}/{/if}{selectedMons.currentStats[key]}
							</span>
							<div class="stat-bar">
								<div
									class="stat-bar-fill"
									style="width: {getStatBarWidth(
										selectedMons.currentStats[key]
									)}; background-color: {key === 'hp' ? '#FF0000' : '#F8D030'};"
								></div>
							</div>
						</div>
						<div class="stat-iv" style="color: {ivColor(selectedMons.ivs[key])}">
							{selectedMons.ivs[key]}
						</div>
						<div class="stat-ev">
							{selectedMons.evs[key]}
						</div>
					</div>
				{/each}

				<div class="stats-row total-row">
					<div class="stat-label">TOTAL</div>
					<div class="stat-value-container">
						<span class="stat-val-text">{totalStats}</span>
					</div>
					<div class="stat-iv">-</div>
					<div class="stat-ev">{selectedMons.evsToDistribute}</div>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="stats-edit" style="--zIndex:{zIndex + 1}" class:open={statEdit}>
	<div class="stats-wrapper" bind:this={graphWrapper}>
		{#if graph}
			<canvas bind:this={graph} use:makeChart></canvas>
		{:else}
			<canvas bind:this={graph} use:makeChart></canvas>
		{/if}
	</div>

	<div class="stat-values">
		<table>
			<thead>
				<tr>
					<th>STAT</th>
					<th>VALUE</th>
					<th>IV</th>
					<th width="50%">EV ({selectedMons.evsToDistribute})</th>
				</tr>
			</thead>
			<tbody bind:this={editLines}>
				{#each statsKeys as key}
					<tr>
						<td style="color:{natureColor(key, selectedMons.nature)}"
							>{key
								.replace(/attack/i, 'atk')
								.replace(/defense/i, 'def')
								.replace('special', 'sp.')
								.toUpperCase()}</td
						>
						<td>
							{#if key === 'hp'}{selectedMons.currentHp} /{/if}{selectedMons.currentStats[key]}</td
						>

						<td style="color: {ivColor(selectedMons.ivs[key])}">{selectedMons.ivs[key]}</td>
						<td>
							<div class="inputs">
								<div class="double">
									<button disabled={disabled(key, 10)} onclick={() => addEv(key, 10)}>++</button>
									<button disabled={disabled(key, 1)} onclick={() => addEv(key, 1)}>+</button>
								</div>
								<div>
									<span>{selectedMons.evs[key]}</span>
								</div>
								<div class="double">
									<button disabled={disabled(key, -1)} onclick={() => addEv(key, -1)}>-</button>
									<button disabled={disabled(key, -10)} onclick={() => addEv(key, -10)}>- -</button>
								</div>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style lang="scss">
	.stats {
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: column;
		background: rgb(0, 29, 43);
		color: #fff;
		text-shadow: 2px 2px 0 black;
		z-index: var(--zIndex, 11);
		font-family: 'pokemon', serif;

		.content-grid {
			display: flex;
			flex: 1;
			padding: 20px;
			gap: 20px;
		}

		.left-panel {
			width: 35%;
			display: flex;
			flex-direction: column;
			gap: 20px;
		}

		.img-ability {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 10px;
		}

		.img-wrapper {
			width: 100%;
			max-height: 50%;
			aspect-ratio: 1;
			background: rgba(44, 56, 69, 0.65);
			border: 2px solid #000;
			display: flex;
			align-items: center;
			justify-content: center;

			img {
				width: 90%;
				height: 90%;
				object-fit: contain;
				image-rendering: pixelated;
			}
		}

		.ability-simple {
			width: 100%;
			background: #1c4b72;
			border: 2px solid #000;
			padding: 10px;
			box-sizing: border-box;
			text-align: center;

			.ability-label {
				color: #aaa;
				font-size: 16px;
				display: block;
				margin-bottom: 4px;
			}

			.ability-name {
				font-size: 20px;
				text-transform: uppercase;
			}
		}

		.right-panel {
			flex: 1;
		}

		.stats-table {
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		.stats-header-row {
			display: grid;
			grid-template-columns: 30% 20% 20% 20%;
			padding-bottom: 10px;
			border-bottom: 2px solid rgba(44, 56, 69, 0.8);
			margin-bottom: 10px;
			font-size: 18px;
			color: #aaa;
			text-align: center;

			.col-label {
				text-align: left;
				padding-left: 10px;
			}
			.col-val {
				text-align: right;
			}
			.col-iv {
				text-align: right;
			}
			.col-ev {
				text-align: right;
			}
		}

		.stats-row {
			height: 32px;
			display: grid;
			grid-template-columns: 30% 20% 20% 20%;
			align-items: center;
			font-size: 22px;

			.stat-label {
				text-align: left;
				padding-left: 10px;
			}

			.stat-value-container {
				text-align: right;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: flex-end;
				position: relative;
				padding-right: 10px;
			}

			.stat-val-text {
				z-index: 2;
				position: relative;
			}

			.stat-bar {
				height: 16px;
				width: 100%;
				background: #333333;
				border: 2px solid #000;
				margin-top: 2px;
				overflow: hidden;

				.stat-bar-fill {
					height: 100%;
				}
			}

			.stat-iv {
				text-align: right;
				padding-right: 10px;
			}

			.stat-ev {
				text-align: right;
				padding-right: 10px;
			}
		}

		.total-row {
			margin-top: 10px;
			border-top: 2px solid rgba(44, 56, 69, 0.8);
			padding-top: 10px;
			padding-bottom: 20px;
			font-weight: bold;

			.stat-value-container {
				justify-content: center;
			}
		}

		.edit-btn {
			background: none;
			border: 1px solid #aaa;
			color: #aaa;
			cursor: pointer;
			font-family: inherit;
			font-size: 14px;
			padding: 2px 6px;

			&:hover {
				color: white;
				border-color: white;
			}
		}
	}

	.stats-edit {
		background: rgba(0, 29, 43, 0.95);
		height: calc(100% - 46px);
		width: 100%;
		box-sizing: border-box;
		position: absolute;
		z-index: var(--zIndex, 11);
		left: 0;
		bottom: -100%;
		transition: bottom 0.5s ease-in-out;
		display: flex;
		flex-direction: row;
		text-shadow: 2px 2px 0 black;

		&.open {
			bottom: 0;
		}

		.stats-wrapper {
			width: 40%;
			height: 100%;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			border-right: 4px solid #000;

			canvas {
				width: 100%;
				height: 100%;
			}
		}

		.stat-values {
			width: 60%;
			height: 100%;
			box-sizing: border-box;
			padding: 1%;
			background: rgb(0, 29, 43);

			table {
				table-layout: fixed;
				margin: 0;
				padding: 0;
				height: 100%;
				width: 100%;
				box-sizing: border-box;
				color: #fff;
				max-height: calc(100dvh - 46px);
				font-size: 20px;

				thead {
					tr th {
						text-align: center;
						font-weight: 400;
						font-size: 20px;
						border-bottom: 4px solid #000;

						&:first-child {
							text-align: left;
						}
					}
				}

				tbody {
					height: calc(100% - 30px);

					tr {
						height: calc(100% / 7);
						max-height: calc(100% / 7);

						td {
							height: calc((100dvh - 46px - 16) / 6);
							border-bottom: 2px solid rgba(44, 56, 69, 0.8);
							text-align: center;
							color: var(--color, white);
							font-size: 18px;
							padding: 1%;
							box-sizing: border-box;

							&:first-of-type {
								text-align: left;
							}

							div.value {
								display: flex;
								justify-content: space-between;
								span {
									color: var(--color, white);
								}
							}

							.inputs {
								display: flex;
								flex-direction: row;
								justify-content: center;
								align-items: center;
								gap: 10px;

								.double {
									display: flex;
									flex-direction: row;
									gap: 4px;

									button {
										outline: none;
										border-radius: 0;
										border: 2px solid #000;
										background: #1c4b72;
										color: white;
										padding: 6px 12px;
										box-shadow: 2px 2px 0 black;
										cursor: pointer;

										&:active {
											transform: translate(2px, 2px);
											box-shadow: none;
										}

										&[disabled] {
											background-color: rgba(44, 56, 69, 0.5);
											color: #666;
											border-color: rgba(0, 29, 43, 0.8);
											box-shadow: none;
											transform: none;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
</style>
