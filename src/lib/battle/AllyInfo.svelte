<script lang="ts">
	import { BattleType } from '../../js/battle/battle-model';
	import { BattleContext } from '../../js/context/battleContext';
	import type { PokemonInstance } from '../../js/pokemons/pokedex';
	import { VolatileStatus } from '../../js/pokemons/volatile-status';

	interface Props {
		battleCtx: BattleContext;
		idx: number;
	}

	let { battleCtx, idx }: Props = $props();

	let currentHp = $state(0);
	let percent = $state(0);
	let expPercent = $state(0);
	let pokemon: PokemonInstance | undefined = $state();

	const statsFormat: Record<string, string> = {
		attack: 'Atk',
		defense: 'Def',
		specialAttack: 'SpA',
		specialDefense: 'SpD',
		speed: 'Spe',
		hp: 'HP',
		accuracy: 'Acc',
		evasion: 'Eva'
	};

	const statsMultiplier: Record<string, (value: number) => number> = {
		attack: (value: number) => (value + 2) / 2,
		defense: (value: number) => (value + 2) / 2,
		specialAttack: (value: number) => (value + 2) / 2,
		specialDefense: (value: number) => (value + 2) / 2,
		speed: (value: number) => (value + 2) / 2,
		hp: (value: number) => (value + 2) / 2,
		accuracy: (value: number) => (value + 3) / 3,
		evasion: (value: number) => (value + 3) / 3
	};

	const volatileColors: Record<string, string> = {
		[VolatileStatus.CONFUSED]: '#F8D030',
		[VolatileStatus.INFATUATION]: '#F85888',
		[VolatileStatus.BOUND]: '#B8A070',
		[VolatileStatus.SEEDED]: '#78C850',
		[VolatileStatus.CURSED]: '#705898'
	};

	const volatileLabels: Record<string, string> = {
		[VolatileStatus.CONFUSED]: 'CNF',
		[VolatileStatus.INFATUATION]: 'INF',
		[VolatileStatus.BOUND]: 'BND',
		[VolatileStatus.SEEDED]: 'SED',
		[VolatileStatus.CURSED]: 'CRS'
	};

	const displayedVolatiles = [
		VolatileStatus.CONFUSED,
		VolatileStatus.INFATUATION,
		VolatileStatus.BOUND,
		VolatileStatus.SEEDED,
		VolatileStatus.CURSED
	];

	function getStatusColor(status?: string): string {
		const colors: Record<string, string> = {
			PSN: '#A040A0',
			TOX: '#700070',
			BRN: '#F08030',
			PAR: '#F8D030',
			SLP: '#A8A8A8',
			FRZ: '#98D8D8'
		};
		return colors[status || ''] || '#666666';
	}

	$effect(() => {
		const unsubscribe = battleCtx.currentAction.subscribe(() => {
			if (battleCtx?.playerSide[idx]) {
				pokemon = battleCtx?.playerSide[idx];
				currentHp = pokemon?.currentHp || 0;
				percent = Math.floor((currentHp * 100) / (pokemon?.currentStats.hp || 1));
				expPercent = Math.floor(((pokemon?.currentXp || 0) * 100) / (pokemon?.xpToNextLevel || 1));
			}
		});
		return () => unsubscribe();
	});
</script>

<div
	class="ally-info"
	style="--offSet:{idx};"
	class:double={battleCtx.battleType === BattleType.DOUBLE}
>
	<div class="rotate" style="--rotate:{idx === 0 ? '40deg' : '-40deg'}">
		<div class="name-lvl">
			<div class="status">
				{#if pokemon?.status}
					<span class="status-badge" style="--status-color: {getStatusColor(pokemon?.status?.abr)}"
						>{pokemon?.status?.abr}</span
					>
				{/if}
				{#if pokemon?.volatiles}
					{#each displayedVolatiles as vol}
						{#if pokemon.volatiles.has(vol)}
							<span class="volatile-badge" style="--volatile-color: {volatileColors[vol]}"
								>{volatileLabels[vol]}</span
							>
						{/if}
					{/each}
				{/if}
			</div>
			<div>
				<span>{pokemon?.name}</span>
				<span>Lv.{pokemon?.level}</span>
			</div>
		</div>

		<div class="hp-status">
			<div class="hp">
				<span>HP</span>
				<div class="progressbar-wrapper">
					<span class="hp-value">{currentHp} / {pokemon?.currentStats.hp}</span>
					<div
						class="progressbar"
						class:warning={percent <= 50}
						class:danger={percent < 15}
						style="--width:{percent + '%'}"
					></div>
				</div>
			</div>
		</div>

		<div class="exp">
			<div class="progressbar-wrapper">
				<div class="progressbar" style="--width:{expPercent + '%'}"></div>
			</div>
		</div>

		{#if pokemon?.statsChanges}
			<div class="stats">
				{#each Object.entries(pokemon.statsChanges) as [stat, value]}
					{#if statsFormat[stat] && statsMultiplier[stat](value) !== 1}
						<div
							class="mult"
							style="--color:{statsMultiplier[stat](value) >= 1 ? '#7EAF53' : '#dc5959'}"
						>
							{statsFormat[stat]} : {statsMultiplier[stat](value).toFixed(2)}x
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes statusPulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.85;
			transform: scale(1.02);
		}
	}

	.ally-info {
		z-index: 7;
		position: absolute;
		top: 3%;
		left: 2%;
		font-size: 20px;
		animation: fadeIn 0.5s ease-in forwards;
		opacity: 0;
		height: auto;
		width: 25%;
		pointer-events: none;
		background: #143855;
		border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		padding: 8px;

		&.double {
			left: calc(22% + var(--offSet) * -1 * 22%);
		}

		.rotate {
			height: 100%;
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 4px;
			box-sizing: border-box;
			justify-content: flex-start;
			background: transparent;

			.stats {
				width: 100%;
				display: flex;
				flex-wrap: wrap;
				gap: 4px;

				.mult {
					font-size: 16px;
					color: var(--color);
					text-shadow: 1px 0px 0px var(--color);
					letter-spacing: 1.5px;
					background-color: #ffffff;
					border: 2px solid #000;
					padding: 4px;
				}
			}

			.name-lvl {
				width: 100%;
				display: flex;
				justify-content: space-between;
				align-items: center;

				font-size: 24px;
				font-weight: 500;
				text-shadow: 1px 1px 1px #000;

				span:first-child {
					color: #ffffff;
				}
				span:last-child {
					color: #ffd700;
				}
			}

			.hp-status {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				width: 100%;
			}

			.status {
				display: flex;
				flex-direction: column;
				align-items: flex-end;

				.status-badge {
					display: inline-block;
					padding: 2px 8px;
					border: 2px solid #000;
					box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
					font-size: 12px;
					font-weight: bold;
					color: white;
					background-color: var(--status-color);
					text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
					animation: statusPulse 2s ease-in-out infinite;
				}

				.volatile-badge {
					display: inline-block;
					padding: 2px 6px;
					border: 2px solid var(--volatile-color);
					box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
					font-size: 10px;
					font-weight: bold;
					color: var(--volatile-color);
					background-color: transparent;
					text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
				}
			}

			.exp {
				width: 100%;
				display: flex;
				padding: 0;
				background-color: transparent;
				align-items: center;
				justify-content: space-evenly;

				.progressbar-wrapper {
					height: 6px;
					width: 100%;
					background-color: #0d2538;
					border: 2px solid #000;
					position: relative;

					.progressbar {
						width: var(--width);
						height: 100%;
						background: #0e73cf;
						transition: width 1s ease-in-out;
					}
				}
			}

			.hp {
				width: 100%;
				display: flex;
				background-color: transparent;
				font-size: 20px;
				color: orange;
				align-items: center;
				justify-content: space-evenly;
				padding: 2px;

				& > span {
					padding: 0 12px;
					font-weight: bold;
				}

				.progressbar-wrapper {
					height: 12px;
					width: 100%;
					background-color: #0d2538;
					border: 2px solid #000;
					position: relative;

					.hp-value {
						position: absolute;
						font-size: 18px;
						color: white;
						left: 50%;
						top: 50%;
						transform: translate(-50%, -50%);
						text-shadow: 1px 1px 0 #000;
						z-index: 1;
					}

					.progressbar {
						width: var(--width);
						height: 100%;
						background: rgb(86, 170, 58);
						display: flex;
						text-align: center;
						align-items: center;
						justify-content: center;
						transition: width 1s ease-in-out;

						&.warning {
							background: rgba(255, 194, 16, 1);
						}

						&.danger {
							background: rgba(223, 85, 48, 1);
						}
					}
				}
			}
		}
	}
</style>
