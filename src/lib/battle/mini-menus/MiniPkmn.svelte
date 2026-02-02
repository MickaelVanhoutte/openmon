<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import {
		Chart,
		RadarController,
		RadialLinearScale,
		PointElement,
		LineElement,
		Filler
	} from 'chart.js';
	import { backInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { typeChart } from '../../../js/battle/battle-model';
	import type { GameContext } from '../../../js/context/gameContext';
	import type { MoveInstance, Nature, PokemonInstance } from '../../../js/pokemons/pokedex';

	Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler);

	interface Props {
		context: GameContext;
		currentPkmn: PokemonInstance;
		zIndex: number;
		type: 'change' | 'combo' | 'switch';
		onChange: (poke: PokemonInstance | undefined) => void;
		onCombo: (combo: { pokemon: PokemonInstance; move: MoveInstance } | undefined) => void;
	}

	const { context, currentPkmn, zIndex, type, onChange, onCombo }: Props = $props();

	let selectedMons: PokemonInstance = $state(currentPkmn);
	let selectedMoveIdx = $state(0);
	let graphWrapper: HTMLDivElement | undefined = $state(undefined);
	let graph: HTMLCanvasElement | undefined = $state(undefined);

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
				pointStyle: false,
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
				pointStyle: false,
				spanGaps: true,
				tension: 0
			}
		]
	});

	const config = $derived({
		type: 'radar',
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
							size: 18,
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

	function natureColor(stat: string, nature: Nature) {
		if (nature.increasedStatId === nature.decreasedStatId) {
			return 'white';
		} else if (nature.increasedStatId === stat) {
			return '#fb607c';
		} else if (nature.decreasedStatId === stat) {
			return '#50aeff';
		} else {
			return 'white';
		}
	}

	function makeChart(ctx: HTMLCanvasElement) {
		const myChart = new Chart(ctx, config as Parameters<typeof Chart>[1]);
		return {
			update(u: { data: typeof data }) {
				myChart.data = u.data;
				myChart.config.options = config.options as typeof myChart.config.options;
				myChart.update('none');
			},
			destroy() {
				myChart.destroy();
			}
		};
	}
</script>

<div
	class="mini-pkmn-menu"
	style="--zIndex: {zIndex}"
	in:slide={{ duration: 500, delay: 100, axis: 'y', easing: backInOut }}
	out:slide={{ duration: 500, delay: 100, axis: 'y', easing: backInOut }}
>
	<div class="head">
		{#each context.player.monsters as poke}
			<div
				class="pkmn"
				class:out={poke.fainted}
				onclick={() => (selectedMons = poke)}
				class:selected={poke === selectedMons}
				role="button"
				tabindex="0"
				aria-label="Select {poke.name}, HP {poke.currentHp} of {poke.currentStats.hp}"
			>
				<img src={poke.getSprite()} alt={poke.name} />
				<span>{poke.name}</span>
				<div class="hp-status">
					<div class="hp">
						<span>HP</span>
						<div class="progressbar-wrapper">
							<span class="hp-value">{poke.currentHp} / {poke.currentStats.hp}</span>
							<div
								class="progressbar"
								class:warning={(poke.currentHp / poke.currentStats.hp) * 100 <= 50}
								class:danger={(poke.currentHp / poke.currentStats.hp) * 100 < 15}
								style="--width:{(poke.currentHp / poke.currentStats.hp) * 100 + '%'}"
							></div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="body">
		<div class="actions">
			{#if type === 'combo' && selectedMons}
				<div class="combo-info">
					{#if selectedMons === currentPkmn}
						<p>
							Select a different Pokémon to launch a <strong>unison attack</strong>
						</p>
					{:else}
						<p>
							<strong>{selectedMons.name}</strong> will join the battle to launch
							<strong>{selectedMons.moves[selectedMoveIdx].name}</strong>
							with {currentPkmn.name}
						</p>
						<p>
							The damage of this move will be halved but both moves have a bonus in accuracy and
							effect chances.
						</p>

						<button
							class="combo-btn shine"
							disabled={selectedMons === currentPkmn || selectedMons.fainted}
							onclick={() =>
								onCombo({ pokemon: selectedMons, move: selectedMons.moves[selectedMoveIdx] })}
						>
							<svg
								version="1.0"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 1920.000000 1920.000000"
								preserveAspectRatio="xMidYMid meet"
							>
								<defs>
									<linearGradient id="myGradient2" x2="1" y2="1">
										<stop offset="0%" stop-color="#01a9da" />
										<stop offset="20%" stop-color="#e876ac" />
									</linearGradient>
									<linearGradient id="myGradient3" x2="1" y2="1">
										<stop offset="0%" stop-color="#00a658" />
										<stop offset="50%" stop-color="#01a9da" />
										<stop offset="100%" stop-color="#e876ac" />
									</linearGradient>
									<linearGradient id="myGradient4" x2="1" y2="1">
										<stop offset="0%" stop-color="#f4e90e" />
										<stop offset="33%" stop-color="#00a658" />
										<stop offset="90%" stop-color="#01a9da" />
										<stop offset="100%" stop-color="#e876ac" />
									</linearGradient>
									<linearGradient id="myGradient5" x2="1" y2="1">
										<stop offset="0%" stop-color="#f4e90e" />
										<stop offset="100%" stop-color="#00a658" />
									</linearGradient>
								</defs>

								<g
									transform="translate(0.000000,1920.000000) scale(0.100000,-0.100000)"
									stroke="none"
								>
									<path
										fill="url(#myGradient2)"
										d="M14625 16153 c-213 -182 -365 -323 -599 -553 -398 -393 -707 -738
-1093 -1219 l-132 -164 182 -91 c278 -140 470 -268 639 -425 42 -39 80 -71 84
-70 5 0 54 57 109 126 450 567 1017 1161 1477 1549 64 55 117 101 117 104 1 7
-678 814 -687 818 -4 1 -48 -32 -97 -75z"
									/>
									<path
										fill="url(#myGradient3)"
										d="M11375 14259 c-483 -58 -957 -257 -1345 -566 -111 -88 -329 -305
-414 -413 -279 -354 -563 -876 -886 -1630 -152 -355 -747 -1868 -738 -1875 2
-1 93 -7 203 -14 110 -7 340 -23 510 -36 171 -13 332 -25 358 -26 l49 -3 162
419 c586 1512 883 2130 1208 2520 319 382 821 598 1288 556 239 -22 422 -76
666 -196 237 -117 355 -210 469 -369 367 -515 301 -1483 -149 -2165 -82 -125
-109 -157 -219 -269 -243 -247 -565 -422 -998 -542 l-116 -33 -107 -229 c-181
-385 -422 -935 -414 -943 5 -6 189 18 388 50 928 151 1651 510 2124 1055 420
483 684 1094 782 1805 26 184 26 630 1 800 -60 405 -177 733 -364 1020 -220
338 -495 576 -903 780 -300 150 -572 239 -886 291 -118 19 -548 28 -669 13z"
									/>
									<path
										fill="url(#myGradient4)"
										d="M11897 12952 c-457 -692 -995 -1615 -1449 -2487 -440 -845 -653
-1317 -1092 -2423 -281 -705 -456 -1100 -612 -1373 -71 -125 -223 -353 -297
-444 -310 -384 -736 -644 -1211 -740 -68 -14 -137 -25 -153 -25 -38 0 -43 -4
-158 -145 -182 -222 -319 -375 -599 -669 -94 -98 -171 -184 -171 -189 0 -11
120 -36 305 -64 88 -13 181 -17 395 -18 242 0 300 3 427 23 920 142 1681 636
2210 1432 133 202 242 395 374 665 141 290 225 487 514 1210 378 945 481 1178
809 1835 518 1037 1001 1888 1533 2702 l110 168 -36 57 c-43 72 -116 157 -179
212 -108 92 -345 212 -532 269 -161 49 -158 49 -188 4z"
									/>
									<path
										fill="url(#myGradient5)"
										d="M7180 9600 c-593 -45 -1004 -172 -1388 -427 -332 -220 -632 -553
-886 -982 -164 -276 -307 -600 -390 -881 -119 -401 -139 -851 -56 -1234 61
-278 208 -587 390 -817 l38 -49 264 278 c336 353 478 508 478 522 0 6 -13 34
-29 63 -39 69 -85 205 -102 297 -19 103 -16 322 6 445 75 435 364 973 671
1254 283 259 634 398 1119 441 208 19 772 5 1210 -30 467 -36 820 -58 827 -52
4 4 64 142 133 307 69 165 169 398 221 518 53 121 94 220 92 222 -2 2 -100 8
-218 14 -255 14 -490 30 -1095 77 -485 37 -1047 52 -1285 34z"
									/>
									<path
										fill="url(#myGradient5)"
										d="M7393 8338 c-5 -7 -33 -65 -63 -128 -144 -307 -282 -555 -499 -895
-369 -580 -796 -1142 -1202 -1581 -787 -850 -1346 -1406 -1687 -1677 -48 -38
-102 -81 -119 -95 l-33 -27 245 -475 c135 -261 246 -479 248 -485 9 -25 440
316 706 559 455 415 1583 1616 1942 2068 430 541 861 1179 1133 1676 132 240
495 1006 483 1018 -4 4 -382 32 -602 44 -265 14 -540 13 -552 -2z"
									/>
								</g>
							</svg>
						</button>
					{/if}
				</div>
			{:else}
				<div class="switch">
					{#if selectedMons === currentPkmn}
						<p>Select a different Pokémon to switch</p>
					{:else}
						<p>
							<strong>{selectedMons.name}</strong> will join the battle
						</p>
					{/if}

					<button
						class="button btn-switch"
						onclick={() => onChange(selectedMons)}
						disabled={selectedMons === currentPkmn || selectedMons.fainted}
					>
						<span>Switch</span>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
							><path d="M16 16V12L21 17L16 22V18H4V16H16ZM8 2V5.999L20 6V8H8V12L3 7L8 2Z"
							></path></svg
						>
					</button>
				</div>
			{/if}
		</div>
		<div class="stats">
			<div class="stats-wrapper" bind:this={graphWrapper}>
				<canvas bind:this={graph} use:makeChart={(data, config)}></canvas>
			</div>
		</div>
		<div class="moves">
			{#if type !== 'combo'}
				{#each selectedMons?.moves as move}
					<div class="move-btn move" style="--color:{typeChart[move.type].color};">
						<span class="move-type">
							<svg use:inlineSvg={`src/assets/types/${move.type}.svg`} fill="currentColor"> </svg>
						</span>
						<span class="move-name">{move.name.toUpperCase()}</span>

						<span class="move-pp">
							{move.currentPp}/{move.pp}
						</span>
					</div>
				{/each}
			{:else}
				{#each selectedMons.moves as move, index}
					<button
						class="move-btn move"
						class:selected={selectedMoveIdx === index}
						style="--color:{typeChart[move.type].color};"
						onclick={() => (selectedMoveIdx = index)}
					>
						<span class="move-type">
							<svg use:inlineSvg={`src/assets/types/${move.type}.svg`} fill="currentColor"> </svg>
						</span>
						<span class="move-name">{move.name.toUpperCase()}</span>

						<span class="move-pp">
							{move.currentPp}/{move.pp}
						</span>
					</button>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.mini-pkmn-menu {
		position: absolute;
		bottom: 1%;
		left: 1%;
		width: 98%;
		height: 98%;
		background-color: rgba(88, 83, 100, 0.95);
		box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.7);
		z-index: var(--zIndex, 100);
		border-radius: 8px;
		gap: 2%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		color: white;
		padding: 1%;

		.head {
			display: flex;
			justify-content: space-around;
			//height: 34%;
			max-height: 35%;

			.pkmn {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 2px;

				span {
					font-size: 22px;
					color: white;
				}

				img {
					//height: calc(100% - 26px);
					height: 15dvh;
				}

				&.selected {
					img {
						filter: drop-shadow(0 0 5px white);
						animation: pulse 1s infinite;
					}
				}

				&.out {
					filter: grayscale(100%) brightness(0.5);
					img {
						animation: none;
					}
				}
			}

			.hp-status {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				width: calc(98dvw / 8);

				.hp {
					width: 100%;
					display: flex;
					background-color: rgba(0, 0, 0, 0.45);
					color: orange;
					align-items: center;
					justify-content: space-evenly;
					border-radius: 5px;
					padding: 2px 4px;

					& > span {
						font-size: 20px;
						padding: 0 6px;
						font-weight: bold;
					}

					.progressbar-wrapper {
						height: 16px;
						width: 100%;
						background-color: #595b59;
						border-radius: 4px;
						//border: 2px solid white;

						position: relative;

						.hp-value {
							position: absolute;
							//mix-blend-mode: difference;
							font-size: clamp(12px, 1vw, 20px);
							color: white;
							left: 50%;
							top: 50%;
							transform: translate(-50%, -50%);
						}

						.progressbar {
							width: var(--width);
							height: 100%;
							background: rgb(184, 244, 166);
							background: linear-gradient(
								0deg,
								rgb(86, 170, 58) 0%,
								rgb(86, 170, 58) 50%,
								rgb(86, 170, 58) 100%
							);
							border-radius: 2px;
							display: flex;
							text-align: center;
							align-items: center;
							justify-content: center;
							transition: width 1s ease-in-out;

							&.warning {
								background: rgb(255, 241, 164);
								background: linear-gradient(
									0deg,
									rgba(255, 194, 16, 1) 0%,
									rgba(255, 194, 16, 1) 50%,
									rgba(255, 194, 16, 1) 100%
								);
							}

							&.danger {
								background: rgb(244, 177, 159);
								background: linear-gradient(
									0deg,
									rgba(223, 85, 48, 1) 0%,
									rgba(223, 85, 48, 1) 50%,
									rgba(223, 85, 48, 1) 100%
								);
							}
						}
					}
				}
			}
		}

		.body {
			display: flex;
			flex-direction: row;
			height: -webkit-fill-available;
			// height: 66%;
			gap: 2%;
			//padding: 2%;
			border-top: 1px solid rgba(255, 255, 255, 0.3);

			.actions {
				display: flex;
				justify-content: flex-start;
				gap: 8px;
				width: calc(100% / 3);
				align-items: center;
				font-size: clamp(16px, 5dvh, 32px);

				.switch {
					display: flex;
					flex-direction: column;
					align-items: center;

					.btn-switch {
						display: flex;
						align-items: center;
						justify-content: space-between;
						gap: 4px;
						font-size: 22px;
						height: 40px;
						background-color: #4c69bf;
						border: 1px solid #2a3043;
						color: white;
						border-radius: 4px;
						width: unset;

						svg {
							width: 22px;
						}
					}
				}

				.button {
					width: 100px;
					height: 40px;
					background-color: rgba(255, 255, 255, 0.5);
					border-radius: 4px;
					display: flex;
					justify-content: center;
					align-items: center;
					cursor: pointer;
					transition: all 0.3s;

					&:hover {
						background-color: rgba(255, 255, 255, 0.7);
					}

					.move {
						background-color: rgba(255, 0, 0, 0.5);
					}

					.switch {
						background-color: rgba(0, 255, 0, 0.5);
					}
				}
			}

			.stats {
				display: flex;
				justify-content: center;
				width: calc(100% / 3);
				align-items: center;
				flex-direction: column;
				flex-wrap: wrap;
				font-size: 22px;
				max-height: 60dvh;

				span {
					width: 50%;
					height: 33%;
				}

				.stats-wrapper {
					width: 100%;
					height: 100%;
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: center;

					canvas {
						width: 100%;
						height: 100%;
					}
				}
			}

			.moves {
				display: flex;
				justify-content: flex-start;
				width: calc(100% / 3);
				align-items: center;
				flex-direction: column;
				flex-wrap: wrap;
				gap: 8%;
				padding: 2% 0;

				p {
					margin: 6px 0;
				}
			}
		}
	}

	.combo-info {
		font-size: 22px;
		display: flex;
		flex-direction: column;
		justify-content: space-around;

		strong {
			text-transform: uppercase;
			font-size: 24px;
		}

		.combo-btn {
			height: 8dvh;
			width: 20dvh;
			background-color: rgba(44, 56, 69, 0.85);
			border-radius: 6px;
			color: white;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 3% auto;

			&.shine {
				animation: sparkle 3s infinite;
				border: 1px solid rgba(44, 56, 69, 0.85);
			}

			svg {
				height: 133%;
				filter: drop-shadow(0px 0px 2px rgba(44, 56, 69, 1));
			}
		}
	}

	button.move-btn {
		&:hover,
		&.selected {
			background-color: var(--color); //rgba(255, 255, 255, 0.95);
			color: #123;

			.move-type svg {
				color: #123;
			}
		}
	}

	.move-btn {
		width: 100%;
		height: calc(76% / 4);
		background-color: rgba(44, 56, 69, 0.65);
		color: white;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: clamp(16px, 5dvh, 32px);
		padding: 0 3%;
		transition: transform 0.5s ease-in-out;

		.move-type {
			display: flex;
			position: relative;
			left: 5%; //calc(-5% + var(--offset));
			border-radius: 4px;
			height: 9dvh;
			width: 9dvh;
			//background: white;
			color: var(--color);
			//aspect-ratio: 0.866;
			//clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
			align-items: center;
			justify-content: center;

			svg {
				//transform: rotate(-35deg);
				color: var(--color);
				height: calc(8dvh - 8px);
				width: calc(9dvh - 8px);
			}
		}

		.move-name {
			max-width: 50%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes sparkle {
		0% {
			//background-color: rgba(1, 163, 88, .3);
			box-shadow: 0 0 10px rgba(1, 163, 88, 0.9);
			scale: 1;
		}
		40% {
			//background-color: rgba(232, 118, 172, .3);
			box-shadow: 0 0 10px rgba(232, 118, 172, 0.9);
			scale: 1.1;
		}
		90% {
			//background-color: rgba(1, 169, 218, .3);
			box-shadow: 0 0 10px rgba(1, 169, 218, 0.9);
			scale: 1;
		}
		100% {
			//background-color: rgba(1, 155, 145, .3);
			box-shadow: 0 0 10px rgba(1, 155, 145, 0.9);
			scale: 1;
		}
	}
</style>
