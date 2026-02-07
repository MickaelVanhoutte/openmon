<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { getSpritePosition, type SpritePosition } from '../../../js/battle/sprite-position';

	interface Props {
		disabled?: boolean;
		selectedOptionIdx?: number;
		show?: boolean;
		onFight?: () => void;
		onBag?: () => void;
		onSwitch?: () => void;
		onRun?: () => void;
		onHover?: (idx: number) => void;
		spriteElement?: HTMLElement | null;
		entranceDelay?: number;
		isInitialEntrance?: boolean;
	}

	const {
		disabled = false,
		selectedOptionIdx = 0,
		show = true,
		onFight = () => {},
		onBag = () => {},
		onSwitch = () => {},
		onRun = () => {},
		onHover = () => {},
		spriteElement = null,
		entranceDelay = 0,
		isInitialEntrance = true
	}: Props = $props();

	const buttonElements: HTMLButtonElement[] = [];
	let selectedIdx = $state(selectedOptionIdx);
	let spriteReady = $state(false);

	// Check if sprite has valid position (not at 0,0)
	function isSpritePositioned(): boolean {
		if (!spriteElement) {
			return false;
		}
		const rect = spriteElement.getBoundingClientRect();
		return rect.x > 0 || rect.y > 0;
	}

	// Poll until sprite is positioned
	function waitForSpritePosition() {
		if (isSpritePositioned()) {
			spriteReady = true;
			updatePositions();
			animateEntrance();
		} else {
			requestAnimationFrame(waitForSpritePosition);
		}
	}

	interface ActionButton {
		label: string;
		color: string;
		action: () => void;
	}

	const actions: ActionButton[] = [
		{ label: 'FIGHT', color: '#dc5959', action: onFight },
		{ label: 'BAG', color: '#eca859', action: onBag },
		{ label: 'POKEMON', color: '#7EAF53', action: onSwitch },
		{ label: 'RUN', color: '#599bdc', action: onRun }
	];

	function getButtonPositions(
		spritePos: SpritePosition | null
	): Array<{ top: number; left: number; rotation: number }> {
		// 2 buttons on LEFT of sprite, 2 on RIGHT - surrounding the Pokemon
		// Layout:  [FIGHT]     [BAG]
		//              (sprite)
		//        [POKEMON]   [RUN]
		console.log(spritePos);
		if (!spritePos) {
			// Fallback positions around center-left where ally typically is
			return [
				{ top: 42, left: 8, rotation: -1 }, // FIGHT - top left
				{ top: 42, left: 38, rotation: 1 }, // BAG - top right
				{ top: 62, left: 8, rotation: -1 }, // POKEMON - bottom left
				{ top: 62, left: 38, rotation: 1 } // RUN - bottom right
			];
		}

		const viewportHeight = window.innerHeight || 600;
		const viewportWidth = window.innerWidth || 800;

		const spriteCenter = {
			x: spritePos.x + spritePos.width / 2,
			y: spritePos.y + spritePos.height / 2
		};

		const horizontalOffset = spritePos.width * 0.7 + 80;
		const verticalOffset = 50;

		const leftX = spriteCenter.x - horizontalOffset;
		const rightX = spriteCenter.x + horizontalOffset - 150;
		const topY = spriteCenter.y - verticalOffset;
		const bottomY = spriteCenter.y + verticalOffset - 15;

		// Convert to percentages and clamp to screen bounds (min 0%)
		const leftXPercent = Math.max(0, (leftX / viewportWidth) * 100);
		const rightXPercent = Math.max(0, (rightX / viewportWidth) * 100);
		const topYPercent = Math.max(0, (topY / viewportHeight) * 100);
		const bottomYPercent = Math.max(0, (bottomY / viewportHeight) * 100);

		return [
			{
				// FIGHT - top left
				top: topYPercent - 10,
				left: leftXPercent,
				rotation: -1
			},
			{
				// BAG - top right
				top: topYPercent,
				left: rightXPercent,
				rotation: 1
			},
			{
				// POKEMON - bottom left
				top: bottomYPercent - 10,
				left: leftXPercent,
				rotation: -1
			},
			{
				// RUN - bottom right
				top: bottomYPercent,
				left: rightXPercent,
				rotation: 1
			}
		];
	}

	let positions = $state(getButtonPositions(null));

	function updatePositions() {
		const spritePos = getSpritePosition(spriteElement);
		positions = getButtonPositions(spritePos);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled || !show) {
			return;
		}

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				selectedIdx = selectedIdx > 0 ? selectedIdx - 1 : actions.length - 1;
				onHover(selectedIdx);
				break;
			case 'ArrowDown':
				event.preventDefault();
				selectedIdx = selectedIdx < actions.length - 1 ? selectedIdx + 1 : 0;
				onHover(selectedIdx);
				break;
			case 'ArrowLeft':
			case 'ArrowRight':
				event.preventDefault();
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

	function animateEntrance() {
		const validButtons = buttonElements.filter(Boolean);
		if (validButtons.length === 0) {
			return;
		}

		if (isInitialEntrance) {
			// Full staggered animation for battle start
			gsap.fromTo(
				validButtons,
				{ scale: 0.5, opacity: 0, x: -60 },
				{
					scale: 1,
					opacity: 1,
					x: 0,
					duration: 0.4,
					delay: entranceDelay / 1000,
					stagger: 0.1,
					ease: 'back.out(1.4)'
				}
			);
		} else {
			// Quick fade-in for button reappearance
			gsap.fromTo(
				validButtons,
				{ opacity: 0, scale: 0.9 },
				{
					opacity: 1,
					scale: 1,
					duration: 0.15,
					stagger: 0.03,
					ease: 'power2.out'
				}
			);
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('resize', updatePositions);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('resize', updatePositions);
		};
	});

	$effect(() => {
		selectedIdx = selectedOptionIdx;
	});

	$effect(() => {
		if (spriteElement) {
			// Reset and wait for sprite to be positioned
			spriteReady = false;
			waitForSpritePosition();
		}
	});

	$effect(() => {
		if (show && spriteReady && buttonElements.length > 0) {
			updatePositions();
		}
	});

	// Trigger entrance animation when buttons become visible
	$effect(() => {
		if (show && !disabled && spriteReady) {
			// Small delay to ensure DOM elements are rendered
			setTimeout(() => {
				animateEntrance();
			}, 50);
		}
	});
</script>

{#if show && !disabled && spriteReady}
	{#each actions as action, i}
		{@const pos = positions[i] || { top: 50 + i * 11, left: 18, rotation: 0 }}
		<button
			bind:this={buttonElements[i]}
			class="action-plate"
			class:selected={!disabled && selectedIdx === i}
			style="
				--action-color: {action.color};
				top: {pos.top}%;
				left: {pos.left}%;
				--plate-rotation: {pos.rotation}deg;
				opacity: 0;
			"
			{disabled}
			onclick={() => action.action()}
			onmouseenter={() => {
				selectedIdx = i;
				onHover(i);
			}}
			role="menuitem"
			aria-label={action.label}
		>
			<div class="card-body">
				<span class="action-label">{action.label}</span>
			</div>
		</button>
	{/each}
{/if}

<style>
	:root {
		--skew-angle: -15deg;
		--skew-counter: 15deg;
		--ink-color: #2a224d;
	}

	.action-plate {
		position: absolute;
		min-width: 120px;
		height: 45px;
		padding: 0;
		margin-top: 10px;
		transform: skewX(var(--skew-angle));
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		z-index: 100;
		pointer-events: auto;
		overflow: visible;
	}

	.action-plate::before {
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

	.action-plate::after {
		content: '';
		position: absolute;
		bottom: -5px;
		left: 3px;
		width: 84%;
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
		background-color: var(--action-color);
		border: 4px solid var(--ink-color);
		z-index: 2;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-label {
		position: relative;
		z-index: 2;
		display: inline-block;
		transform: skewX(var(--skew-counter));
		font-size: 1.5rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--ink-color);
		text-shadow: none;
	}

	.action-plate:hover:not(:disabled),
	.action-plate.selected:not(:disabled) {
		transform: skewX(var(--skew-angle)) scale(1.08);
		z-index: 110;
	}

	.action-plate:hover:not(:disabled):before,
	.action-plate:hover:not(:disabled):after,
	.action-plate.selected:not(:disabled):before,
	.action-plate.selected:not(:disabled):after {
		border-color: white;
		box-shadow: 0 0 15px color-mix(in srgb, var(--type-color) 60%, transparent);
	}

	.action-plate:hover:not(:disabled) > .card-body > .action-label,
	.action-plate:hover:not(:disabled) > .card-body > .action-label,
	.action-plate.selected:not(:disabled) > .card-body > .action-label,
	.action-plate.selected:not(:disabled) > .card-body > .action-label{
		color: white !important;
	}

	.action-plate:active:not(:disabled) {
		transform: skewX(var(--skew-angle)) scale(0.98);
	}

	.action-plate:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
	}
</style>
