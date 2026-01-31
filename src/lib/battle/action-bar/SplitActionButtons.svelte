<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	interface Props {
		disabled?: boolean;
		selectedOptionIdx?: number;
		show?: boolean;
		onFight?: () => void;
		onBag?: () => void;
		onSwitch?: () => void;
		onRun?: () => void;
		onHover?: (idx: number) => void;
	}

	let {
		disabled = false,
		selectedOptionIdx = 0,
		show = true,
		onFight = () => {},
		onBag = () => {},
		onSwitch = () => {},
		onRun = () => {},
		onHover = () => {}
	}: Props = $props();

	let containerEl: HTMLDivElement;
	let selectedIdx = $state(selectedOptionIdx);

	const actions = [
		{ label: 'ATTACK', color: '#e74c3c', action: onFight, position: 'left-top' },
		{ label: 'BAG', color: '#e67e22', action: onBag, position: 'left-bottom' },
		{ label: 'POKEMON', color: '#27ae60', action: onSwitch, position: 'right-top' },
		{ label: 'RUN', color: '#3498db', action: onRun, position: 'right-bottom' }
	];

	// Keyboard navigation
	function handleKeyDown(event: KeyboardEvent) {
		if (disabled || !show) return;

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				// Move up: 1->0, 3->2, or wrap
				if (selectedIdx === 1) selectedIdx = 0;
				else if (selectedIdx === 3) selectedIdx = 2;
				else if (selectedIdx === 0) selectedIdx = 1;
				else if (selectedIdx === 2) selectedIdx = 3;
				onHover(selectedIdx);
				break;
			case 'ArrowDown':
				event.preventDefault();
				// Move down: 0->1, 2->3, or wrap
				if (selectedIdx === 0) selectedIdx = 1;
				else if (selectedIdx === 2) selectedIdx = 3;
				else if (selectedIdx === 1) selectedIdx = 0;
				else if (selectedIdx === 3) selectedIdx = 2;
				onHover(selectedIdx);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				// Move left: right side to left side
				if (selectedIdx === 2) selectedIdx = 0;
				else if (selectedIdx === 3) selectedIdx = 1;
				else if (selectedIdx === 0) selectedIdx = 2;
				else if (selectedIdx === 1) selectedIdx = 3;
				onHover(selectedIdx);
				break;
			case 'ArrowRight':
				event.preventDefault();
				// Move right: left side to right side
				if (selectedIdx === 0) selectedIdx = 2;
				else if (selectedIdx === 1) selectedIdx = 3;
				else if (selectedIdx === 2) selectedIdx = 0;
				else if (selectedIdx === 3) selectedIdx = 1;
				onHover(selectedIdx);
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				actions[selectedIdx].action();
				break;
			case 'Escape':
				event.preventDefault();
				onRun();
				break;
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);

		// GSAP stagger animation
		if (containerEl && show) {
			const buttons = containerEl.querySelectorAll('.split-action-btn');
			gsap.fromTo(
				buttons,
				{ scale: 0, opacity: 0 },
				{
					scale: 1,
					opacity: 1,
					duration: 0.3,
					stagger: 0.08,
					ease: 'back.out(1.7)'
				}
			);
		}

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	$effect(() => {
		selectedIdx = selectedOptionIdx;
	});
</script>

{#if show}
	<div class="split-action-container" bind:this={containerEl}>
		<!-- Left side buttons -->
		<div class="left-buttons">
			{#each actions.filter((a) => a.position.startsWith('left')) as action, i}
				<button
					class="split-action-btn"
					class:selected={selectedIdx === (i === 0 ? 0 : 1)}
					style="--btn-color: {action.color}"
					onclick={() => action.action()}
					onmouseenter={() => {
						selectedIdx = i === 0 ? 0 : 1;
						onHover(selectedIdx);
					}}
					{disabled}
				>
					<span class="btn-label">{action.label}</span>
				</button>
			{/each}
		</div>

		<!-- Right side buttons -->
		<div class="right-buttons">
			{#each actions.filter((a) => a.position.startsWith('right')) as action, i}
				<button
					class="split-action-btn"
					class:selected={selectedIdx === (i === 0 ? 2 : 3)}
					style="--btn-color: {action.color}"
					onclick={() => action.action()}
					onmouseenter={() => {
						selectedIdx = i === 0 ? 2 : 3;
						onHover(selectedIdx);
					}}
					{disabled}
				>
					<span class="btn-label">{action.label}</span>
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.split-action-container {
		position: absolute;
		bottom: 15%;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
		padding: 0 8%;
		pointer-events: none;
		z-index: 100;
	}

	.left-buttons,
	.right-buttons {
		display: flex;
		flex-direction: column;
		gap: 12px;
		pointer-events: auto;
	}

	.split-action-btn {
		position: relative;
		min-width: 140px;
		padding: 14px 24px;
		background: linear-gradient(
			135deg,
			var(--btn-color) 0%,
			color-mix(in srgb, var(--btn-color) 80%, black) 100%
		);
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		color: white;
		font-size: 1.1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		cursor: pointer;
		transition: all 0.15s ease;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}

	.split-action-btn:hover,
	.split-action-btn.selected {
		transform: scale(1.08);
		border-color: rgba(255, 255, 255, 0.7);
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.split-action-btn:active {
		transform: scale(0.98);
	}

	.split-action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.btn-label {
		position: relative;
		z-index: 1;
	}

	/* Add subtle key hint indicator */
	.split-action-btn::before {
		content: '';
		position: absolute;
		top: -8px;
		left: -8px;
		width: 24px;
		height: 24px;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		color: #333;
		font-weight: bold;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.split-action-btn.selected::before {
		opacity: 1;
	}
</style>
