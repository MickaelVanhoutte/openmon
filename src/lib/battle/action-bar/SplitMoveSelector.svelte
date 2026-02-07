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
		if (disabled || !show) {
			return;
		}

		const validMoves = moves.filter((m) => m.pp > 0);
		if (validMoves.length === 0) {
			return;
		}

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
		if (plateElements.length === 0) {
			return;
		}

		const validPlates = plateElements.filter(Boolean);
		if (validPlates.length === 0) {
			return;
		}

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
			if (show) {
				animateEntrance();
			}
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
			<!-- Info badge circle -->
			<div class="info-badge">
				<span class="info-badge-text">i</span>
			</div>

			<!-- Main card body with type color bg -->
			<div class="card-body">
				<div class="plate-content">
					<span class="move-name">{move.name.toUpperCase()}</span>
				</div>
				<!-- Type icon watermark -->
				<div class="type-watermark">
					<div class="type-icon">
						<img src="src/assets/types/{move.type.toLowerCase()}-small.png" alt={move.type} />
					</div>
				</div>
			</div>

			<!-- PP tag -->
			<div class="pp-tag">
				<span class="pp-text">{move.currentPp}/{move.pp}</span>
			</div>
		</button>
	{/each}
{/if}

<style>
	:root {
		--skew-angle: -15deg;
		--skew-counter: 15deg;
		--ink-color: #2a224d;
		--pp-bg: #5a5288;
	}

	.attack-plate {
		position: absolute;
		min-width: 140px;
		height: 40px;
		margin-top: 10px;
		transform: skewX(var(--skew-angle));
		cursor: pointer;
		transition: all 0.2s ease;
		z-index: 100;
		pointer-events: auto;
		overflow: visible;
		background: transparent;
		border: none;
		padding: 0;
	}

	.attack-plate::before {
		content: '';
		position: absolute;
		top: -5px;
		right: -5px;
		width: 60%;
		height: 70%;
		background-color: transparent;
		border-top: 3px solid var(--ink-color);
		border-right: 3px solid var(--ink-color);
		z-index: -1;
	}

	.attack-plate::after {
		content: '';
		position: absolute;
		bottom: -5px;
		left: 3px;
		width: 74%;
		height: 100%;
		background-color: transparent;
		border-bottom: 3px solid var(--ink-color);
		z-index: -1;
	}

	.card-body {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--type-color);
		border: 4px solid var(--ink-color);
		z-index: 2;
		overflow: hidden;
	}

	.plate-content {
		position: relative;
		height: 100%;
		display: flex;
		align-items: center;
		padding-left: 28px;
		transform: skewX(var(--skew-counter));
		z-index: 2;
	}

	.move-name {
		color: var(--ink-color);
		font-size: 1.5rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 1px;
		text-shadow: none;
	}

	.info-badge {
		position: absolute;
		top: -15px;
		left: -15px;
		width: 30px;
		height: 30px;
		background: white;
		border: 3px solid var(--ink-color);
		border-radius: 50% !important;
		z-index: 5;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 2px 2px 0px var(--ink-color);
		transform: skewX(var(--skew-counter));
		cursor: pointer;
	}

	.info-badge-text {
		font-family: 'Arial', sans-serif;
		font-style: italic;
		color: var(--ink-color);
		font-size: 1rem;
		font-weight: 700;
	}

	.pp-tag {
		position: absolute;
		bottom: -12px;
		right: -6px;
		background: var(--pp-bg);
		border: 3px solid var(--ink-color);
		padding: 3px 12px;
		z-index: 5;
		transform: skewX(var(--skew-angle));
		box-shadow: 2px 2px 0px var(--ink-color);
	}

	.pp-text {
		display: inline-block;
		transform: skewX(var(--skew-counter));
		font-size: 1rem;
		font-weight: 700;
		color: white;
	}

	.type-watermark {
		position: absolute;
		right: -5px;
		top: 50%;
		transform: translateY(-50%) skewX(var(--skew-counter)) rotate(-10deg);
		width: 64px;
		height: 64px;
		opacity: 0.45;
		pointer-events: none;
		z-index: 1;
		overflow: hidden;
	}

	.type-icon {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.type-icon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.attack-plate:hover:not(:disabled),
	.attack-plate.selected:not(:disabled) {
		transform: skewX(var(--skew-angle)) scale(1.08);
		z-index: 110;
	}

	.attack-plate:hover:not(:disabled):before,
	.attack-plate:hover:not(:disabled):after,
	.attack-plate.selected:not(:disabled):before,
	.attack-plate.selected:not(:disabled):after {
		border-color: white;
		box-shadow: 0 0 15px color-mix(in srgb, var(--type-color) 60%, transparent);
	}

	.attack-plate:hover:not(:disabled) > .card-body > .plate-content > .move-name,
	.attack-plate:hover:not(:disabled) > .card-body > .plate-content > .move-name,
	.attack-plate.selected:not(:disabled) > .card-body > .plate-content > .move-name,
	.attack-plate.selected:not(:disabled) > .card-body > .plate-content > .move-name{
		color: white !important;
	}

	.attack-plate:active:not(:disabled) {
		transform: skewX(var(--skew-angle)) scale(0.98);
	}

	.attack-plate.disabled-move {
		opacity: 0.4;
		cursor: not-allowed;
		filter: grayscale(0.7);
	}
</style>
