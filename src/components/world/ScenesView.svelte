<script lang="ts">
	import type { GameContext } from '../../js/context/gameContext';
	import Evolution from '../common/Evolution.svelte';
	import StarterSelection from '../common/StarterSelection.svelte';

	export let context: GameContext;
	export let canvasWidth: number;
</script>

{#if context.overWorldContext.scenes.wakeUp}
	<div class="wakeUp">
		<div class="top"></div>
		<div class="bot"></div>
	</div>
{/if}

{#if context.overWorldContext.scenes.starterSelection}
	<StarterSelection bind:context bind:canvasWidth />
{/if}

{#if context.hasEvolutions}
	<Evolution bind:context />
{/if}


<style lang="scss">
	.wakeUp {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		z-index: 10;
		pointer-events: none;

		.top,
		.bot {
			position: absolute;
			width: 100%;
			height: 50dvh;
			background: black;
			z-index: 11;
			pointer-events: none;
		}

		.top {
			top: 0;
			animation: blinkingDown 5s forwards;
		}

		.bot {
			bottom: 0;

			animation: blinkingTop 5s forwards;
		}
	}

	@keyframes -global-blinkingDown {
		20% {
			top: -50%;
		}
		25% {
			top: 0;
		}

		40% {
			top: -50%;
		}
		50% {
			top: 0;
		}
		65% {
			top: -50%;
		}
		75% {
			top: 0;
		}
		100% {
			top: -50%;
		}
	}

	@keyframes -global-blinkingTop {
		20% {
			bottom: -50%;
		}
		25% {
			bottom: 0;
		}
		40% {
			bottom: -50%;
		}
		50% {
			bottom: 0;
		}
		65% {
			bottom: -50%;
		}
		75% {
			bottom: 0;
		}
		100% {
			bottom: -50%;
		}
	}

	@keyframes -global-blurry {
		0% {
			filter: blur(3px) brightness(1.5);
			-webkit-filter: blur(3px) brightness(1.5);
		}
		100% {
			filter: blur(0) brightness(1);
			-webkit-filter: blur(0) brightness(1);
		}
	}
</style>
