<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { getSpritePosition, type SpritePosition } from '../../../js/battle/sprite-position';

	interface Props {
		disabled: boolean;
		selectedOptionIdx?: number;
		show: boolean;
		onFight: () => void;
		onBag: () => void;
		onSwitch: () => void;
		onRun: () => void;
		onHover: (idx: number) => void;
		spriteElement?: HTMLElement | null;
	}

	const {
		disabled,
		selectedOptionIdx = 0,
		show,
		onFight,
		onBag,
		onSwitch,
		onRun,
		onHover,
		spriteElement = null
	}: Props = $props();

	const buttonElements: HTMLButtonElement[] = [];

	interface ActionButton {
		label: string;
		color: string;
		action: () => void;
	}

	const actions: ActionButton[] = [
		{ label: 'FIGHT', color: '#dc5959', action: () => onFight() },
		{ label: 'BAG', color: '#eca859', action: () => onBag() },
		{ label: 'POKEMON', color: '#7EAF53', action: () => onSwitch() },
		{ label: 'RUN', color: '#599bdc', action: () => onRun() }
	];

	function getButtonPositions(
		spritePos: SpritePosition | null
	): Array<{ top: number; left: number; rotation: number }> {
		const viewportHeight = window.innerHeight || 600;
		const viewportWidth = window.innerWidth || 800;

		if (!spritePos) {
			return actions.map((_, i) => ({
				top: 55 + i * 10,
				left: 75,
				rotation: 0
			}));
		}

		const baseX = spritePos.x + spritePos.width * 1.1;
		const baseY = spritePos.y + spritePos.height * 0.3;

		const arcRadius = 90;
		const totalArcAngle = 50;
		const startAngle = -totalArcAngle / 2;
		const angleStep = totalArcAngle / (actions.length - 1);

		return actions.map((_, i) => {
			const angleDeg = startAngle + angleStep * i;
			const angleRad = (angleDeg * Math.PI) / 180;

			const offsetX = Math.cos(angleRad) * arcRadius;
			const offsetY = Math.sin(angleRad) * arcRadius + i * 45;

			const plateX = baseX + offsetX;
			const plateY = baseY + offsetY;

			return {
				top: (plateY / viewportHeight) * 100,
				left: (plateX / viewportWidth) * 100,
				rotation: angleDeg * 0.2
			};
		});
	}

	let positions = $state(getButtonPositions(null));

	function updatePositions() {
		const spritePos = getSpritePosition(spriteElement);
		positions = getButtonPositions(spritePos);
	}

	function animateEntrance() {
		const validButtons = buttonElements.filter(Boolean);
		if (validButtons.length === 0) {return;}

		gsap.fromTo(
			validButtons,
			{
				scale: 0.6,
				opacity: 0,
				x: -80
			},
			{
				scale: 1,
				opacity: 1,
				x: 0,
				duration: 0.4,
				stagger: 0.08,
				ease: 'back.out(1.3)'
			}
		);
	}

	onMount(() => {
		window.addEventListener('resize', updatePositions);
		updatePositions();

		const animationTimer = setTimeout(() => {
			if (show) {animateEntrance();}
		}, 50);

		return () => {
			window.removeEventListener('resize', updatePositions);
			clearTimeout(animationTimer);
		};
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
		{@const pos = positions[i] || { top: 50 + i * 12, left: 70, rotation: 0 }}
		<button
			bind:this={buttonElements[i]}
			class="action-plate"
			class:selected={!disabled && selectedOptionIdx === i}
			style="
				--action-color: {action.color};
				top: {pos.top}%;
				left: {pos.left}%;
				--plate-rotation: {pos.rotation}deg;
			"
			{disabled}
			onclick={action.action}
			onmouseenter={() => onHover(i)}
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
		min-width: 140px;
		padding: 12px 24px;
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
		transform: skewX(var(--skew-angle)) rotate(var(--plate-rotation, 0deg)) scale(1.08);
		border-color: rgba(255, 255, 255, 0.85);
		z-index: 110;
		box-shadow:
			0 8px 28px rgba(0, 0, 0, 0.5),
			0 0 25px color-mix(in srgb, var(--action-color) 60%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.25);
	}

	.action-plate:active:not(:disabled) {
		transform: skewX(var(--skew-angle)) rotate(var(--plate-rotation, 0deg)) scale(0.96);
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
		font-size: 1.1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
	}
</style>
