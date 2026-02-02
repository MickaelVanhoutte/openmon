<script lang="ts">
	interface Props {
		opened: boolean;
		selectedOption: number;
		canMove: boolean;
		onMove: () => void;
		onSummary: () => void;
		onCancel: () => void;
	}

	const { opened, selectedOption, canMove, onMove, onSummary, onCancel }: Props = $props();
</script>

<div class="options" class:opened>
	<ul>
		{#if canMove}
			<li class:selected={selectedOption === 0} onclick={onMove} role="menuitem">MOVE</li>
		{/if}
		<li class:selected={selectedOption === 1} onclick={onSummary} role="menuitem">SUMMARY</li>
		<li class:selected={selectedOption === 2} onclick={onCancel} role="menuitem">CANCEL</li>
	</ul>
</div>

<style lang="scss">
	.options {
		position: absolute;
		font-size: clamp(18px, 4vmin, 32px);
		font-weight: 500;
		text-align: left;
		bottom: -100%;
		right: 1%;
		padding: clamp(12px, 3vmin, 22px) clamp(18px, 5vmin, 36px);
		color: var(--pixel-text-white);
		box-sizing: border-box;
		background: var(--pixel-bg-panel);
		border: 2px solid var(--pixel-border-color);
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		transition: bottom 0.3s ease-in-out;
		z-index: 20;

		&.opened {
			bottom: 5%;
		}

		ul {
			list-style: none;
			padding: 0;
			margin: 0;
		}

		li {
			padding: clamp(6px, 1.5vmin, 12px) clamp(12px, 3vmin, 24px);
			cursor: pointer;
			transition: all 0.15s;
			border-left: 4px solid transparent;

			&:hover,
			&.selected {
				background: rgba(255, 215, 0, 0.15);
				border-left-color: var(--pixel-text-gold);
				color: var(--pixel-text-gold);
			}
		}
	}
</style>
