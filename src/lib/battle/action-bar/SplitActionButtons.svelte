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
	}

	let {
		disabled = false,
		selectedOptionIdx = 0,
		show = true,
		onFight = () => {},
		onBag = () => {},
		onSwitch = () => {},
		onRun = () => {},
		onHover = () => {},
		spriteElement = null
	}: Props = $props();

	let buttonElements: HTMLButtonElement[] = [];
	let selectedIdx = $state(selectedOptionIdx);

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

		if (!spritePos) {
			// Fallback positions around center-left where ally typically is
			return [
				{ top: 42, left: 8, rotation: -3 }, // FIGHT - top left
				{ top: 42, left: 38, rotation: 3 }, // BAG - top right
				{ top: 62, left: 8, rotation: -3 }, // POKEMON - bottom left
				{ top: 62, left: 38, rotation: 3 } // RUN - bottom right
			];
		}

		const viewportHeight = window.innerHeight || 600;
		const viewportWidth = window.innerWidth || 800;

		const spriteCenter = {
			x: spritePos.x + spritePos.width / 2,
			y: spritePos.y + spritePos.height / 2
		};

		const horizontalOffset = spritePos.width * 0.7 + 60;
		const verticalOffset = 50;

		const leftX = spriteCenter.x - horizontalOffset;
		const rightX = spriteCenter.x + horizontalOffset - 100;
		const topY = spriteCenter.y - verticalOffset;
		const bottomY = spriteCenter.y + verticalOffset + 20;

		return [
			{
				// FIGHT - top left
				top: (topY / viewportHeight) * 100,
				left: (leftX / viewportWidth) * 100,
				rotation: -3
			},
			{
				// BAG - top right
				top: (topY / viewportHeight) * 100,
				left: (rightX / viewportWidth) * 100,
				rotation: 3
			},
			{
				// POKEMON - bottom left
				top: (bottomY / viewportHeight) * 100,
				left: (leftX / viewportWidth) * 100,
				rotation: -3
			},
			{
				// RUN - bottom right
				top: (bottomY / viewportHeight) * 100,
				left: (rightX / viewportWidth) * 100,
				rotation: 3
			}
		];
	}

	let positions = $state(getButtonPositions(null));

	function updatePositions() {
		const spritePos = getSpritePosition(spriteElement);
		positions = getButtonPositions(spritePos);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled || !show) return;

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
		if (validButtons.length === 0) return;

		gsap.fromTo(
			validButtons,
			{
				scale: 0.5,
				opacity: 0,
				x: -60
			},
			{
				scale: 1,
				opacity: 1,
				x: 0,
				duration: 0.4,
				stagger: 0.1,
				ease: 'back.out(1.4)'
			}
		);
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('resize', updatePositions);
		updatePositions();

		const animationTimer = setTimeout(() => {
			if (show) animateEntrance();
		}, 50);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('resize', updatePositions);
			clearTimeout(animationTimer);
		};
	});

	$effect(() => {
		selectedIdx = selectedOptionIdx;
	});

	$effect(() => {
		if (spriteElement) {
			updatePositions();
		}
	});

	$effect(() => {
		if (show && buttonElements.length > 0) {
			updatePositions();
		}
	});
</script>

{#if show}
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
			<span class="action-label">{action.label}</span>
		</button>
	{/each}
{/if}

<style>
	:root {
		--skew-angle: -15deg;
		--skew-counter: 15deg;
	}

	.action-plate {
		position: absolute;
		min-width: 150px;
		padding: 14px 28px;
		transform: skewX(var(--skew-angle)) rotate(var(--plate-rotation, 0deg));
		background: linear-gradient(90deg, var(--action-color) 30%, transparent 100%);
		border: 3px solid var(--action-color);
		border-left: 5px solid var(--action-color);
		color: white;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
		z-index: 100;
		pointer-events: auto;
	}

	.action-plate::before {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(20, 25, 35, 0.7);
		z-index: 0;
	}

	.action-plate:hover:not(:disabled),
	.action-plate.selected:not(:disabled) {
		transform: skewX(var(--skew-angle)) rotate(var(--plate-rotation, 0deg)) scale(1.1);
		border-color: rgba(255, 255, 255, 0.9);
		z-index: 110;
		box-shadow:
			0 8px 30px rgba(0, 0, 0, 0.5),
			0 0 30px color-mix(in srgb, var(--action-color) 60%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.25);
	}

	.action-plate:active:not(:disabled) {
		transform: skewX(var(--skew-angle)) rotate(var(--plate-rotation, 0deg)) scale(0.95);
	}

	.action-plate:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
	}

	.action-label {
		position: relative;
		z-index: 2;
		display: inline-block;
		transform: skewX(var(--skew-counter));
		font-size: 1.15rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
	}
</style>
