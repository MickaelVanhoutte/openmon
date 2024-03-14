<script lang="ts">
	/**
	 * Ally HP bar
	 * TODO : status style, team pokeballs;
	 */

	import type { GameContext } from '../../js/context/gameContext';
	import { BattleContext } from '../../js/context/battleContext';

	export let battleCtx: BattleContext;

	let currentHp = 0;
	let percent = 0;
	let expPercent = 0;

	battleCtx.currentAction.subscribe((_value) => {
		currentHp = battleCtx?.playerPokemon?.currentHp || 0;
		percent = Math.floor((currentHp * 100) / battleCtx.playerPokemon.currentStats.hp);
		expPercent = Math.floor(
			(battleCtx?.playerPokemon?.currentXp * 100) / battleCtx?.playerPokemon?.xpToNextLevel
		);
	});
</script>

<div class="ally-info">
	<div class="name-lvl">
		<div class="status">
			{#if battleCtx?.playerPokemon?.status}
				{battleCtx?.playerPokemon?.status?.abr}
			{/if}
		</div>
		<div>
			<span>{battleCtx?.playerPokemon?.name}</span>
			<span>Lv.{battleCtx?.playerPokemon.level}</span>
		</div>
	</div>

	<div class="hp-status">
		<div class="hp">
			<span>HP</span>
			<div class="progressbar-wrapper">
				<span class="hp-value">{currentHp} / {battleCtx?.playerPokemon.currentStats.hp}</span>
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
</div>

<style lang="scss">
	@keyframes appear {
		from {
			right: -30%;
		}
		to {
			right: 2%;
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

		height: fit-content;
		min-width: 35%;
		position: absolute;
		bottom: 28%;
		right: -30%;

		display: flex;
		flex-direction: column;
		gap: 8px;
		box-sizing: border-box;
		justify-content: space-evenly;

		font-size: 24px;

		animation:
			appear 0.5s ease-in forwards,
			bounce 2s ease-in-out infinite;

		.name-lvl {
			display: flex;
			justify-content: space-between;
			align-items: center;

			font-size: 28px;
			font-weight: 500;
			text-shadow: 1px 1px 1px #787b7e;
		}

		.hp-status {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
		}

		.status {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
		}

		.exp {
			width: 100%;
			display: flex;
			border: 2px solid #262626;
			background-color: #262626;
			align-items: center;
			justify-content: space-evenly;
			margin-top: -10px;
			border-radius: 0 0 11px 0;
			box-sizing: border-box;

			&:before {
				content: '';
				display: inline-block;
				height: 0;
				width: 0;
				position: absolute;
				left: -14px;
				bottom: 0;
				border-bottom: 28px solid #262626;
				border-left: 14px solid transparent;
			}

			.progressbar-wrapper {
				height: 10px;
				width: 100%;
				background-color: #595b59;
				border-radius: 4px 0 9px 4px;
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
			background-color: #262626;
			font-size: 24px;
			color: orange;
			align-items: center;
			justify-content: space-evenly;
			border-radius: 4px 4px 0 0;
			padding: 2px;

			& > span {
				padding: 0 12px;
				font-weight: bold;
			}

			.progressbar-wrapper {
				height: 20px;
				width: 100%;
				background-color: #595b59;
				border-radius: 4px;
				border: 2px solid white;
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
</style>
