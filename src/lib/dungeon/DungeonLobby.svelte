<script lang="ts">
	import { onMount } from 'svelte';
	import { loadMetaProgress, type MetaProgress } from '../../js/dungeon/meta-progress';
	import { loadDungeonRun, type DungeonRunSave } from '../../js/dungeon/dungeon-save';

	interface Props {
		onStartRun: () => void;
		onContinueRun: () => void;
		onBack: () => void;
	}

	let { onStartRun, onContinueRun, onBack }: Props = $props();

	let metaProgress = $state<MetaProgress>({ bestFloor: 0, totalRuns: 0, totalCurrency: 0 });
	let savedRun = $state<DungeonRunSave | null>(null);

	onMount(() => {
		metaProgress = loadMetaProgress();
		savedRun = loadDungeonRun();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="dungeon-lobby">
	<div class="panel">
		<h1 class="title">Dungeon</h1>

		<div class="stats">
			<div class="stat-row">
				<span class="stat-label">Best Floor</span>
				<span class="stat-value">{metaProgress.bestFloor}</span>
			</div>
			<div class="stat-row">
				<span class="stat-label">Total Runs</span>
				<span class="stat-value">{metaProgress.totalRuns}</span>
			</div>
			<div class="stat-row">
				<span class="stat-label">Total Currency</span>
				<span class="stat-value">{metaProgress.totalCurrency}</span>
			</div>
		</div>

		<div class="actions">
			{#if savedRun}
				<button class="pixel-button continue" onclick={onContinueRun}>Continue Run</button>
			{/if}
			<button class="pixel-button start" onclick={onStartRun}>Start Run</button>
			<button class="pixel-button back" onclick={onBack}>Back</button>
		</div>
	</div>
</div>

<style lang="scss">
	.dungeon-lobby {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.panel {
		background: var(--pixel-bg-panel, #1a1a2e);
		border: 2px solid var(--pixel-border-color, #333);
		padding: 32px;
		min-width: 320px;
		max-width: 400px;
		text-align: center;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.title {
		color: var(--pixel-text-white, #fff);
		margin: 0;
		font-size: 2rem;
		letter-spacing: 2px;
		text-transform: uppercase;
		text-shadow: 2px 2px 0 #000;
	}

	.stats {
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: rgba(0, 0, 0, 0.2);
		padding: 16px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.stat-label {
		color: var(--pixel-text-white, #ccc);
		opacity: 0.8;
		font-size: 1rem;
	}

	.stat-value {
		color: var(--pixel-text-white, #fff);
		font-weight: bold;
		font-size: 1.2rem;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.pixel-button {
		background: var(--pixel-bg-button, #334455);
		border: 2px solid var(--pixel-border-color, #000);
		color: var(--pixel-text-white, #fff);
		padding: 12px 24px;
		font-size: 1.1rem;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: filter 0.2s;

		&:hover {
			filter: brightness(1.2);
		}

		&.continue {
			background: #2e7d32;
		}

		&.start {
			background: #1565c0;
		}

		&.back {
			background: #c62828;
		}
	}
</style>
