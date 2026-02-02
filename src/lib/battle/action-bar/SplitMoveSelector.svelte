<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import type { MoveInstance } from '../../../js/pokemons/pokedex';
	import {
		getSpritePosition,
		getAttackPlatePositions,
		type AttackPlatePosition
	} from '../../../js/battle/sprite-position';

	interface Props {
		moves: MoveInstance[];
		disabled?: boolean;
		selectedMoveIdx?: number;
		show?: boolean;
		onMoveClick?: (idx: number) => void;
		onCancel?: () => void;
		onHover?: (idx: number) => void;
		spriteElement?: HTMLElement | null;
	}

	const {
		moves,
		disabled = false,
		selectedMoveIdx = 0,
		show = true,
		onMoveClick = () => {},
		onCancel = () => {},
		onHover = () => {},
		spriteElement = null
	}: Props = $props();

	const plateElements: HTMLButtonElement[] = [];
	let selectedIdx = $state(selectedMoveIdx);
	let platePositions = $state<AttackPlatePosition[]>([]);

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

	function updatePositions() {
		const spritePos = getSpritePosition(spriteElement);
		platePositions = getAttackPlatePositions(spritePos, moves.length);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled || !show) {return;}

		const validMoves = moves.filter((m) => m.pp > 0);
		if (validMoves.length === 0) {return;}

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
		const newIdx = selectedIdx + direction;
		if (newIdx >= 0 && newIdx < moves.length && moves[newIdx].pp > 0) {
			selectedIdx = newIdx;
			onHover(selectedIdx);
		}
	}

	function navigateHorizontal(direction: number) {
		const newIdx = selectedIdx + direction * 2;
		if (newIdx >= 0 && newIdx < moves.length && moves[newIdx].pp > 0) {
			selectedIdx = newIdx;
			onHover(selectedIdx);
		}
	}

	function animateEntrance() {
		if (plateElements.length === 0) {return;}

		const validPlates = plateElements.filter(Boolean);
		if (validPlates.length === 0) {return;}

		const spritePos = getSpritePosition(spriteElement);
		const startX = spritePos ? 0 : -100;
		const startY = spritePos ? 0 : 50;

		gsap.fromTo(
			validPlates,
			{
				scale: 0.6,
				opacity: 0,
				x: startX,
				y: startY
			},
			{
				scale: 1,
				opacity: 1,
				x: 0,
				y: 0,
				duration: 0.35,
				stagger: 0.1,
				ease: 'back.out(1.2)'
			}
		);
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('resize', updatePositions);

		updatePositions();

		const animationTimer = setTimeout(() => {
			if (show) {animateEntrance();}
		}, 50);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('resize', updatePositions);
			clearTimeout(animationTimer);
		};
	});

	$effect(() => {
		selectedIdx = selectedMoveIdx;
	});

	$effect(() => {
		if (spriteElement) {
			updatePositions();
		}
	});

	$effect(() => {
		if (show && plateElements.length > 0) {
			updatePositions();
		}
	});
</script>

{#if show}
	{#each moves as move, i}
		{@const pos = platePositions[i] || { top: 50 + i * 12, left: 20, rotation: 0 }}
		<button
			bind:this={plateElements[i]}
			class="attack-plate"
			class:selected={selectedIdx === i}
			class:disabled-move={move.pp <= 0}
			style="
				--type-color: {getTypeColor(move.type)};
				top: {pos.top}%;
				left: {pos.left}%;
				--plate-rotation: {pos.rotation}deg;
			"
			onclick={() => move.pp > 0 && onMoveClick(i)}
			onmouseenter={() => {
				if (move.pp > 0) {
					selectedIdx = i;
					onHover(i);
				}
			}}
			disabled={disabled || move.pp <= 0}
		>
			<div class="type-watermark">
				<div class="type-icon" style="background-color: {getTypeColor(move.type)}"></div>
			</div>

			<div class="plate-content">
				<span class="move-name">{move.name.toUpperCase()}</span>
			</div>

			<div class="pp-tag">
				<span class="pp-text">{move.currentPp}/{move.pp}</span>
			</div>
		</button>
	{/each}
{/if}

<style>
	:root {
		--skew-angle: -10deg;
		--skew-counter: 10deg;
	}

	.attack-plate {
		position: absolute;
		min-width: 180px;
		padding: 12px 22px 12px 16px;
		transform: skewX(var(--skew-angle)) rotate(var(--plate-rotation, 0deg));
		background: linear-gradient(90deg, var(--type-color) 25%, transparent 100%);
		border: 3px solid var(--type-color);
		border-left: 5px solid var(--type-color);
		color: white;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
		overflow: visible;
		z-index: 100;
		pointer-events: auto;
	}

	.attack-plate::before {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(20, 25, 35, 0.75);
		z-index: 0;
	}

	.attack-plate:hover:not(:disabled),
	.attack-plate.selected:not(:disabled) {
		transform: skewX(var(--skew-angle)) rotate(var(--plate-rotation, 0deg)) scale(1.08);
		border-color: rgba(255, 255, 255, 0.85);
		z-index: 110;
		box-shadow:
			0 8px 28px rgba(0, 0, 0, 0.5),
			0 0 25px color-mix(in srgb, var(--type-color) 60%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.25);
	}

	.attack-plate:active:not(:disabled) {
		transform: skewX(var(--skew-angle)) rotate(var(--plate-rotation, 0deg)) scale(0.98);
	}

	.attack-plate.disabled-move {
		opacity: 0.4;
		cursor: not-allowed;
		filter: grayscale(0.7);
	}

	.type-watermark {
		position: absolute;
		right: -8px;
		top: 50%;
		transform: translateY(-50%) skewX(var(--skew-counter));
		width: 45px;
		height: 45px;
		opacity: 0.2;
		pointer-events: none;
		z-index: 1;
		overflow: hidden;
	}

	.type-icon {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.plate-content {
		position: relative;
		z-index: 2;
		transform: skewX(var(--skew-counter));
	}

	.move-name {
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
	}

	.pp-tag {
		position: absolute;
		right: 6px;
		bottom: -10px;
		padding: 2px 8px;
		background: rgba(15, 20, 30, 0.95);
		transform: skewX(var(--skew-angle));
		border-bottom: 2px solid var(--type-color);
		z-index: 3;
	}

	.pp-text {
		display: inline-block;
		transform: skewX(var(--skew-counter));
		font-size: 0.7rem;
		font-weight: 600;
		color: #94a3b8;
	}

	.attack-plate.selected .pp-text,
	.attack-plate:hover .pp-text {
		color: white;
	}
</style>
