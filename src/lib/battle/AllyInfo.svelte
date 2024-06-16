<script lang="ts">
	/**
	 * Ally HP bar
	 * TODO : status style, team pokeballs;
	 */

	import { BattleContext } from '../../js/context/battleContext';
	import type { PokemonInstance } from '../../js/pokemons/pokedex';

	export let battleCtx: BattleContext;

	let currentHp = 0;
	let percent = 0;
	let expPercent = 0;
	let pokemon: PokemonInstance;

	const statsFormat = {
		attack: 'Atk',
		defense: 'Def',
		specialAttack: 'SpA',
		specialDefense: 'SpD',
		speed: 'Spe',
		hp: 'HP',
		accuracy: 'Acc',
		evasion: 'Eva',
	};

	const statsMultiplier = {
		attack: ((value: number) => (value + 2) / 2),
		defense: ((value: number) => (value + 2) / 2),
		specialAttack: ((value: number) => (value + 2) / 2),
		specialDefense: ((value: number) => (value + 2) / 2),
		speed: ((value: number) => (value + 2) / 2),
		hp: ((value: number) => (value + 2) / 2),
		accuracy: ((value: number) => (value + 3) / 3),
		evasion: ((value: number) => (value + 3) / 3)
	};


	battleCtx.currentAction.subscribe((_value) => {
		pokemon = battleCtx?.playerPokemon;
		currentHp = pokemon?.currentHp || 0;
		percent = Math.floor((currentHp * 100) / pokemon.currentStats.hp);
		expPercent = Math.floor((pokemon?.currentXp * 100) / pokemon?.xpToNextLevel);
	});
</script>

<div class="ally-info">
	<div class="rotate">
		<div class="name-lvl">
			<div class="status">
				{#if pokemon?.status}
					{pokemon?.status?.abr}
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

		<div class="stats">
			{#each Object.entries(pokemon.statsChanges) as [stat, value], index}
			{#if statsFormat[stat] && statsMultiplier[stat](value) !== 1}
				<div class="mult" style="--color:{statsMultiplier[stat](value) >= 1 ? '#7EAF53' : '#dc5959'}">
					{statsFormat[stat]} : {statsMultiplier[stat](value)}x
				</div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	@keyframes appear {
		from {
			left: -30%;
		}
		to {
			left: 2%;
		}
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-2px);
		}
	}

	.ally-info {
		z-index: 7;

		position: absolute;
		top: 3%;
		left: -30%;

		font-size: 20px;

		animation:
			appear 0.5s ease-in forwards,
			bounce 2s ease-in-out infinite;

		height: 50%;
		width: 25%;
		perspective: 100dvw;

		.rotate {
			height: 100%;
			width: 100%;
			transform: rotateY(40deg);
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
					background-color: rgba(255, 255, 255, .85);
					border-radius: 4px;
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
				text-shadow: 1px 1px 1px #787b7e;
				filter: drop-shadow(2px 2px 5px white) invert(1);
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
			}

			.exp {
				width: 98%;
				display: flex;
				//border: 2px solid rgba(0, 0, 0, 0.45);
				//border-top-color: transparent;
				padding: 2px;
				background-color: rgba(0, 0, 0, 0.45);
				align-items: center;
				justify-content: space-evenly;
				border-radius: 4px;
				//box-sizing: border-box;

				.progressbar-wrapper {
					height: 10px;
					width: 100%;
					background-color: rgba(0, 0, 0, 0.25);
					border-radius: 4px;
					position: relative;

					.progressbar {
						width: var(--width);
						height: 100%;

						background: #0e73cf;

						border-radius: 2px;
						display: flex;
						text-align: center;
						align-items: center;
						justify-content: center;
						transition: width 1s ease-in-out;
					}
				}
			}

			.hp {
				width: 100%;
				display: flex;
				background-color: rgba(0, 0, 0, 0.45);
				font-size: 20px;
				color: orange;
				align-items: center;
				justify-content: space-evenly;
				border-radius: 4px;
				padding: 2px;

				& > span {
					padding: 0 12px;
					font-weight: bold;
				}

				.progressbar-wrapper {
					height: 16px;
					width: 100%;
					background-color: rgba(0, 0, 0, 0.25);
					border-radius: 2px;
					//border: 2px solid white;
					position: relative;

					.hp-value {
						position: absolute;
						//mix-blend-mode: difference;
						font-size: 18px;
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
</style>
