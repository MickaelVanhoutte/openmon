<script lang="ts">
	import type { GameContext } from '../../js/context/gameContext';
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

<style lang="scss">
</style>
