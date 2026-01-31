<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import type { MoveInstance } from '../../../js/pokemons/pokedex';

	interface Props {
		moves: MoveInstance[];
		disabled?: boolean;
		selectedMoveIdx?: number;
		show?: boolean;
		onMoveClick?: (idx: number) => void;
		onCancel?: () => void;
		onHover?: (idx: number) => void;
	}

	let {
		moves,
		disabled = false,
		selectedMoveIdx = 0,
		show = true,
		onMoveClick = () => {},
		onCancel = () => {},
		onHover = () => {}
	}: Props = $props();

	let containerEl: HTMLDivElement;
	let selectedIdx = $state(selectedMoveIdx);

	const typeColors: Record<string, string> = {
		normal: '#A8A878',
		fire: '#F08030',
		water: '#6890F0',
		electric: '#F8D030',
		grass: '#78C850',
		ice: '#98D8D8',
		fighting: '#C03028',
		poison: '#A040A0',
		ground: '#E0C068',
		flying: '#A890F0',
		psychic: '#F85888',
		bug: '#A8B820',
		rock: '#B8A038',
		ghost: '#705898',
		dragon: '#7038F8',
		dark: '#705848',
		steel: '#B8B8D0',
		fairy: '#EE99AC'
	};

	function getTypeColor(type: string): string {
		return typeColors[type.toLowerCase()] || '#A8A878';
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled || !show) return;

		const validMoves = moves.filter((m) => m.pp > 0);
		if (validMoves.length === 0) return;

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				navigateVertical(-1);
				break;
			case 'ArrowDown':
				event.preventDefault();
				navigateVertical(1);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				navigateHorizontal(-1);
				break;
			case 'ArrowRight':
				event.preventDefault();
				navigateHorizontal(1);
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				if (moves[selectedIdx] && moves[selectedIdx].pp > 0) {
					onMoveClick(selectedIdx);
				}
				break;
			case 'Escape':
				event.preventDefault();
				onCancel();
				break;
		}
	}

	function navigateVertical(direction: number) {
		const newIdx =
			direction > 0
				? selectedIdx % 2 === 0
					? selectedIdx + 1
					: selectedIdx - 1
				: selectedIdx % 2 === 1
					? selectedIdx - 1
					: selectedIdx + 1;

		if (newIdx >= 0 && newIdx < moves.length && moves[newIdx].pp > 0) {
			selectedIdx = newIdx;
			onHover(selectedIdx);
		}
	}

	function navigateHorizontal(direction: number) {
		const newIdx =
			direction > 0
				? selectedIdx < 2
					? selectedIdx + 2
					: selectedIdx - 2
				: selectedIdx >= 2
					? selectedIdx - 2
					: selectedIdx + 2;

		if (newIdx >= 0 && newIdx < moves.length && moves[newIdx].pp > 0) {
			selectedIdx = newIdx;
			onHover(selectedIdx);
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);

		if (containerEl && show) {
			const buttons = containerEl.querySelectorAll('.split-move-btn');
			gsap.fromTo(
				buttons,
				{ scale: 0, opacity: 0 },
				{
					scale: 1,
					opacity: 1,
					duration: 0.25,
					stagger: 0.06,
					ease: 'back.out(1.7)'
				}
			);
		}

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	$effect(() => {
		selectedIdx = selectedMoveIdx;
	});
</script>

{#if show}
	<div class="split-move-container" bind:this={containerEl}>
		<div class="left-moves">
			{#each moves.slice(0, 2) as move, i}
				<button
					class="split-move-btn"
					class:selected={selectedIdx === i}
					class:disabled-move={move.pp <= 0}
					style="--type-color: {getTypeColor(move.type)}"
					onclick={() => move.pp > 0 && onMoveClick(i)}
					onmouseenter={() => {
						if (move.pp > 0) {
							selectedIdx = i;
							onHover(i);
						}
					}}
					disabled={disabled || move.pp <= 0}
				>
					<div class="move-content">
						<span class="move-name">{move.name.toUpperCase()}</span>
						<span class="move-pp">{move.currentPp}/{move.pp}</span>
					</div>
					<div class="type-indicator" style="background: {getTypeColor(move.type)}"></div>
				</button>
			{/each}
		</div>

		<div class="right-moves">
			{#each moves.slice(2, 4) as move, i}
				<button
					class="split-move-btn"
					class:selected={selectedIdx === i + 2}
					class:disabled-move={move.pp <= 0}
					style="--type-color: {getTypeColor(move.type)}"
					onclick={() => move.pp > 0 && onMoveClick(i + 2)}
					onmouseenter={() => {
						if (move.pp > 0) {
							selectedIdx = i + 2;
							onHover(i + 2);
						}
					}}
					disabled={disabled || move.pp <= 0}
				>
					<div class="move-content">
						<span class="move-name">{move.name.toUpperCase()}</span>
						<span class="move-pp">{move.currentPp}/{move.pp}</span>
					</div>
					<div class="type-indicator" style="background: {getTypeColor(move.type)}"></div>
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.split-move-container {
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

	.left-moves,
	.right-moves {
		display: flex;
		flex-direction: column;
		gap: 10px;
		pointer-events: auto;
	}

	.split-move-btn {
		position: relative;
		min-width: 160px;
		padding: 12px 18px;
		background: linear-gradient(
			135deg,
			var(--type-color) 0%,
			color-mix(in srgb, var(--type-color) 75%, black) 100%
		);
		border: 3px solid rgba(255, 255, 255, 0.25);
		border-radius: 8px;
		color: white;
		cursor: pointer;
		transition: all 0.15s ease;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		overflow: hidden;
	}

	.split-move-btn:hover:not(:disabled),
	.split-move-btn.selected:not(:disabled) {
		transform: scale(1.06);
		border-color: rgba(255, 255, 255, 0.6);
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
	}

	.split-move-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.split-move-btn.disabled-move {
		opacity: 0.4;
		cursor: not-allowed;
		filter: grayscale(0.7);
	}

	.move-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		position: relative;
		z-index: 1;
	}

	.move-name {
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}

	.move-pp {
		font-size: 0.8rem;
		font-weight: 500;
		opacity: 0.9;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
	}

	.type-indicator {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		width: 28px;
		height: 28px;
		border-radius: 50%;
		opacity: 0.6;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
	}
</style>
