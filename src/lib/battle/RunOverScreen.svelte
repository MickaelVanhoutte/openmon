<script lang="ts">
	interface Props {
		floorReached: number;
		currencyEarned: number;
		bestFloor: number;
		isNewRecord: boolean;
		onClose: () => void;
	}

	let { floorReached, currencyEarned, bestFloor, isNewRecord, onClose }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="run-over-overlay" onclick={(e) => e.stopPropagation()}>
	<div class="run-over-panel">
		<h2 class="run-over-title">Run Over</h2>

		<div class="run-over-stats">
			<div class="stat-row">
				<span class="stat-label">Floor Reached</span>
				<span class="stat-value">{floorReached}</span>
			</div>

			<div class="stat-row">
				<span class="stat-label">Currency Earned</span>
				<span class="stat-value">{currencyEarned}</span>
			</div>

			<div class="stat-row best-floor" class:new-record={isNewRecord}>
				<span class="stat-label">Best Floor</span>
				<span class="stat-value">
					{bestFloor}
					{#if isNewRecord}
						<span class="record-tag">NEW</span>
					{/if}
				</span>
			</div>
		</div>

		<button class="return-button" onclick={onClose}>Return</button>
	</div>
</div>

<style lang="scss">
	.run-over-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fade-in 0.3s ease-out;
	}

	.run-over-panel {
		background: var(--pixel-bg-panel, #1a1a2e);
		border: 2px solid var(--pixel-border-color, #333);
		padding: 24px 32px;
		min-width: 280px;
		max-width: 400px;
		text-align: center;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
	}

	.run-over-title {
		color: var(--pixel-text-white, #fff);
		margin: 0 0 20px 0;
		font-size: 1.5rem;
		letter-spacing: 2px;
		text-transform: uppercase;
	}

	.run-over-stats {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 24px;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.stat-label {
		color: var(--pixel-text-white, #ccc);
		opacity: 0.8;
		font-size: 0.9rem;
	}

	.stat-value {
		color: var(--pixel-text-white, #fff);
		font-weight: bold;
		font-size: 1.1rem;
	}

	.best-floor {
		border-color: rgba(255, 215, 0, 0.3);
	}

	.new-record {
		background: rgba(255, 215, 0, 0.1);
		border-color: rgba(255, 215, 0, 0.5);
	}

	.record-tag {
		display: inline-block;
		background: #d4a017;
		color: #1a1a2e;
		font-size: 0.65rem;
		font-weight: bold;
		padding: 1px 6px;
		margin-left: 6px;
		vertical-align: middle;
		letter-spacing: 1px;
	}

	.return-button {
		background: var(--pixel-bg-button, #334455);
		border: 2px solid var(--pixel-border-color, #000);
		color: var(--pixel-text-white, #fff);
		padding: 10px 32px;
		font-size: 1rem;
		cursor: pointer;
		min-height: 44px;
		width: 100%;
		text-transform: uppercase;
		letter-spacing: 1px;

		&:hover {
			filter: brightness(1.2);
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
