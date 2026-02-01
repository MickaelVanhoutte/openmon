<script lang="ts">
	import AnimationTestPage from '$lib/debug/AnimationTestPage.svelte';
</script>

<div class="animations-tab-wrapper">
	<AnimationTestPage />
</div>

<style>
	.animations-tab-wrapper {
		height: 100%;
		overflow: auto;
	}

	/* Override AnimationTestPage styles when embedded */
	.animations-tab-wrapper :global(.animation-test-page) {
		height: auto;
		min-height: 100%;
	}

	/* Hide the close button and header when embedded in admin */
	.animations-tab-wrapper :global(.test-header) {
		display: none;
	}
</style>
