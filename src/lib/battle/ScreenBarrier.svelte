<script lang="ts">
	import { Screen, type SideState } from '../../js/battle/battle-field';

	interface Props {
		allySide: SideState;
		enemySide: SideState;
	}

	const { allySide, enemySide }: Props = $props();

	function hasScreen(side: SideState, screen: Screen): boolean {
		return (side.screens.get(screen) || 0) > 0;
	}

	function getScreenTurns(side: SideState, screen: Screen): number {
		return side.screens.get(screen) || 0;
	}
</script>

<div class="screen-barriers">
	{#if hasScreen(allySide, Screen.REFLECT)}
		<div class="barrier ally reflect">
			<div class="barrier-glow"></div>
			<span class="turns">{getScreenTurns(allySide, Screen.REFLECT)}</span>
		</div>
	{/if}

	{#if hasScreen(allySide, Screen.LIGHT_SCREEN)}
		<div class="barrier ally light-screen">
			<div class="barrier-glow"></div>
			<span class="turns">{getScreenTurns(allySide, Screen.LIGHT_SCREEN)}</span>
		</div>
	{/if}

	{#if hasScreen(enemySide, Screen.REFLECT)}
		<div class="barrier enemy reflect">
			<div class="barrier-glow"></div>
			<span class="turns">{getScreenTurns(enemySide, Screen.REFLECT)}</span>
		</div>
	{/if}

	{#if hasScreen(enemySide, Screen.LIGHT_SCREEN)}
		<div class="barrier enemy light-screen">
			<div class="barrier-glow"></div>
			<span class="turns">{getScreenTurns(enemySide, Screen.LIGHT_SCREEN)}</span>
		</div>
	{/if}
</div>

<style lang="scss">
	.screen-barriers {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 4;
	}

	.barrier {
		position: absolute;
		width: 35%;
		height: 45%;
		border-radius: 8px;
		animation: barrierAppear 0.4s ease-out forwards;
		opacity: 0;

		&.ally {
			left: 5%;
			bottom: 20%;
		}

		&.enemy {
			right: 5%;
			top: 15%;
		}

		&.reflect {
			background: linear-gradient(
				135deg,
				rgba(100, 150, 255, 0.1) 0%,
				rgba(100, 150, 255, 0.2) 50%,
				rgba(100, 150, 255, 0.1) 100%
			);
			border: 2px solid rgba(100, 150, 255, 0.4);
			box-shadow:
				inset 0 0 20px rgba(100, 150, 255, 0.2),
				0 0 15px rgba(100, 150, 255, 0.3);

			.barrier-glow {
				background: linear-gradient(90deg, transparent, rgba(100, 150, 255, 0.3), transparent);
			}
		}

		&.light-screen {
			background: linear-gradient(
				135deg,
				rgba(255, 220, 100, 0.1) 0%,
				rgba(255, 220, 100, 0.2) 50%,
				rgba(255, 220, 100, 0.1) 100%
			);
			border: 2px solid rgba(255, 220, 100, 0.4);
			box-shadow:
				inset 0 0 20px rgba(255, 220, 100, 0.2),
				0 0 15px rgba(255, 220, 100, 0.3);

			.barrier-glow {
				background: linear-gradient(90deg, transparent, rgba(255, 220, 100, 0.3), transparent);
			}
		}

		.barrier-glow {
			position: absolute;
			top: 0;
			left: -100%;
			width: 100%;
			height: 100%;
			animation: shimmer 2s linear infinite;
		}

		.turns {
			position: absolute;
			bottom: 4px;
			right: 8px;
			font-size: 11px;
			font-weight: bold;
			color: rgba(255, 255, 255, 0.9);
			text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
			background: rgba(0, 0, 0, 0.4);
			padding: 2px 6px;
			border-radius: 3px;
		}
	}

	@keyframes barrierAppear {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 200%;
		}
	}
</style>
