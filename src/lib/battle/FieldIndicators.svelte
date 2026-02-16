<script lang="ts">
	import type { BattleField } from '../../js/battle/battle-field';
	import { Weather, Screen, Hazard, Terrain } from '../../js/battle/battle-field';

	interface Props {
		battleField: BattleField;
	}

	const { battleField }: Props = $props();

	const weatherLabels: Record<Weather, string> = {
		[Weather.NONE]: '',
		[Weather.RAIN]: 'Rain',
		[Weather.SUN]: 'Sun',
		[Weather.SAND]: 'Sandstorm',
		[Weather.HAIL]: 'Hail',
		[Weather.STRONG_WINDS]: 'Strong Winds'
	};

	const weatherColors: Record<Weather, string> = {
		[Weather.NONE]: 'transparent',
		[Weather.RAIN]: '#5090D0',
		[Weather.SUN]: '#F5AC3C',
		[Weather.SAND]: '#D2B070',
		[Weather.HAIL]: '#A0D0E0',
		[Weather.STRONG_WINDS]: '#A8C8A8'
	};

	const terrainColors: Record<Terrain, string> = {
		[Terrain.NONE]: 'transparent',
		[Terrain.ELECTRIC]: '#F8D030',
		[Terrain.GRASSY]: '#78C850',
		[Terrain.PSYCHIC]: '#F85888',
		[Terrain.MISTY]: '#EE99AC'
	};

	const terrainLabels: Record<Terrain, string> = {
		[Terrain.NONE]: '',
		[Terrain.ELECTRIC]: 'Electric Terrain',
		[Terrain.GRASSY]: 'Grassy Terrain',
		[Terrain.PSYCHIC]: 'Psychic Terrain',
		[Terrain.MISTY]: 'Misty Terrain'
	};
</script>

<div class="field-indicators">
	{#if battleField.weather !== Weather.NONE}
		<div class="indicator weather" style="--indicator-color: {weatherColors[battleField.weather]}">
			<span class="label">{weatherLabels[battleField.weather]}</span>
			<span class="turns">{battleField.weatherTurns}</span>
		</div>
	{/if}

	{#if battleField.terrain !== Terrain.NONE}
		<div class="indicator terrain" style="--indicator-color: {terrainColors[battleField.terrain]}">
			<span class="label">{terrainLabels[battleField.terrain]}</span>
			<span class="turns">{battleField.terrainTurns}</span>
		</div>
	{/if}

	{#if battleField.trickRoom}
		<div class="indicator trick-room">
			<span class="label">Trick Room</span>
			<span class="turns">{battleField.trickRoomTurns}</span>
		</div>
	{/if}

	<div class="side-indicators">
		<div class="side ally-side">
			{#if battleField.allySide.screens.has(Screen.REFLECT)}
				<div class="screen reflect">Reflect {battleField.allySide.screens.get(Screen.REFLECT)}</div>
			{/if}
			{#if battleField.allySide.screens.has(Screen.LIGHT_SCREEN)}
				<div class="screen light-screen">
					L.Screen {battleField.allySide.screens.get(Screen.LIGHT_SCREEN)}
				</div>
			{/if}
			{#if battleField.allySide.hazards.has(Hazard.STEALTH_ROCK)}
				<div class="hazard stealth-rock">SR</div>
			{/if}
			{#if battleField.allySide.hazards.has(Hazard.SPIKES)}
				<div class="hazard spikes">Spikes x{battleField.allySide.hazards.get(Hazard.SPIKES)}</div>
			{/if}
			{#if battleField.allySide.hazards.has(Hazard.TOXIC_SPIKES)}
				<div class="hazard toxic-spikes">
					T.Spikes x{battleField.allySide.hazards.get(Hazard.TOXIC_SPIKES)}
				</div>
			{/if}
			{#if battleField.allySide.hazards.has(Hazard.STICKY_WEB)}
				<div class="hazard sticky-web">Web</div>
			{/if}
		</div>

		<div class="side enemy-side">
			{#if battleField.enemySide.screens.has(Screen.REFLECT)}
				<div class="screen reflect">
					Reflect {battleField.enemySide.screens.get(Screen.REFLECT)}
				</div>
			{/if}
			{#if battleField.enemySide.screens.has(Screen.LIGHT_SCREEN)}
				<div class="screen light-screen">
					L.Screen {battleField.enemySide.screens.get(Screen.LIGHT_SCREEN)}
				</div>
			{/if}
			{#if battleField.enemySide.hazards.has(Hazard.STEALTH_ROCK)}
				<div class="hazard stealth-rock">SR</div>
			{/if}
			{#if battleField.enemySide.hazards.has(Hazard.SPIKES)}
				<div class="hazard spikes">Spikes x{battleField.enemySide.hazards.get(Hazard.SPIKES)}</div>
			{/if}
			{#if battleField.enemySide.hazards.has(Hazard.TOXIC_SPIKES)}
				<div class="hazard toxic-spikes">
					T.Spikes x{battleField.enemySide.hazards.get(Hazard.TOXIC_SPIKES)}
				</div>
			{/if}
			{#if battleField.enemySide.hazards.has(Hazard.STICKY_WEB)}
				<div class="hazard sticky-web">Web</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.field-indicators {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 5;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		pointer-events: none;

		.indicator {
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 4px 12px;
			background: var(--indicator-color, #333);
			border: 2px solid #000;
			box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.4);
			font-size: 14px;
			font-weight: bold;
			color: #000;
			text-shadow: 0 0 2px #fff;

			.turns {
				background: rgba(0, 0, 0, 0.3);
				color: #fff;
				padding: 2px 6px;
				border-radius: 4px;
				font-size: 12px;
			}

			&.trick-room {
				background: linear-gradient(45deg, #6a0dad, #9400d3);
				color: #fff;
				text-shadow: 1px 1px 2px #000;
				animation: trickRoomPulse 1s ease-in-out infinite;
			}
		}

		.side-indicators {
			display: flex;
			justify-content: space-between;
			width: 100%;
			gap: 20px;
			margin-top: 8px;

			.side {
				display: flex;
				flex-wrap: wrap;
				gap: 4px;

				.screen {
					padding: 2px 8px;
					font-size: 12px;
					font-weight: bold;
					border: 2px solid #000;
					box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);

					&.reflect {
						background: #78c8f0;
						color: #000;
					}

					&.light-screen {
						background: #f8d858;
						color: #000;
					}
				}

				.hazard {
					padding: 2px 6px;
					font-size: 11px;
					font-weight: bold;
					border: 2px solid #000;
					box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);

					&.stealth-rock {
						background: #b8a070;
						color: #fff;
					}

					&.spikes {
						background: #a08050;
						color: #fff;
					}

					&.toxic-spikes {
						background: #a040a0;
						color: #fff;
					}
				}
			}

			.ally-side {
				justify-content: flex-start;
			}

			.enemy-side {
				justify-content: flex-end;
			}
		}
	}

	@keyframes trickRoomPulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}
</style>
