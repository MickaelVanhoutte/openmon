<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		message?: string;
		moveDescription?: string;
	}

	const { message = '', moveDescription = '' }: Props = $props();

	const displayText = $derived(moveDescription || message);
</script>

{#if displayText}
	<div class="battle-info-text" transition:fade={{ duration: 150 }}>
		{displayText}
	</div>
{/if}

<style>
	.battle-info-text {
		position: absolute;
		bottom: 1%;
		right: 5%;
		//transform: translateX(-50%);
		max-width: 70%;
		padding: 0;
		color: white;
		font-size: 4rem;
		font-weight: 500;
		text-align: center;
		text-shadow:
			2px 2px 4px rgba(0, 0, 0, 0.8),
			0 0 10px rgba(0, 0, 0, 0.5);
		pointer-events: none;
		z-index: 90;
	}
</style>
