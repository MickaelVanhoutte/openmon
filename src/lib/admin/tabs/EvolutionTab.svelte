<script lang="ts">
	import EvolutionTestPage from '$lib/debug/EvolutionTestPage.svelte';
</script>

<div class="evolution-tab-wrapper">
	<EvolutionTestPage />
</div>

<style>
	.evolution-tab-wrapper {
		height: 100%;
		overflow: auto;
	}

	.evolution-tab-wrapper :global(.evolution-test-page) {
		height: 100%;
		min-height: 100%;
	}

	.evolution-tab-wrapper :global(.test-header) {
		display: none;
	}
</style>
