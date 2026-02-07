<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import type { PokemonInstance, MoveInstance } from '../../../js/pokemons/pokedex';
	import type { BattleContext } from '../../../js/context/battleContext';

	interface Props {
		possibleTargets: PokemonInstance[];
		selectedTargetIdx?: number;
		selectedMove?: MoveInstance;
		battleCtx: BattleContext;
		show: boolean;
		spriteElement?: HTMLElement | null;
		onTargetClick: (target: PokemonInstance) => void;
	}

	const {
		possibleTargets,
		selectedTargetIdx,
		selectedMove,
		battleCtx,
		show,
		spriteElement = null,
		onTargetClick
	}: Props = $props();

	const allyButtons: HTMLButtonElement[] = [];
	const opponentButtons: HTMLButtonElement[] = [];
	let spriteReady = $state(false);

	function getEffectiveness(target: PokemonInstance): number {
		if (!selectedMove?.type) {
			return 1;
		}
		return battleCtx?.calculateTypeEffectiveness(selectedMove.type, target.types) ?? 1;
	}

	function getTargetSide(target: PokemonInstance): 'ally' | 'opponent' {
		return battleCtx.getPokemonSide(target) === 'ally' ? 'ally' : 'opponent';
	}

	function getTargetColor(target: PokemonInstance): string {
		return getTargetSide(target) === 'ally' ? '#4ade80' : '#f87171';
	}

	const allyTargets = $derived(possibleTargets.filter((t) => getTargetSide(t) === 'ally'));
	const opponentTargets = $derived(possibleTargets.filter((t) => getTargetSide(t) === 'opponent'));

	function isSpritePositioned(): boolean {
		if (!spriteElement) {
			return false;
		}
		const rect = spriteElement.getBoundingClientRect();
		return rect.x > 0 || rect.y > 0;
	}

	function waitForSpritePosition() {
		if (isSpritePositioned()) {
			spriteReady = true;
			// Delay position update to allow DOM to render buttons first
			setTimeout(() => {
				updatePositions();
				animateEntrance();
			}, 50);
		} else {
			requestAnimationFrame(waitForSpritePosition);
		}
	}

	function getPositions(side: 'ally' | 'opponent', count: number) {
		const viewportHeight = window.innerHeight || 600;
		const viewportWidth = window.innerWidth || 800;

		if (!spriteElement) {
			const baseLeft = side === 'ally' ? 5 : 60;
			return Array.from({ length: count }, (_, i) => ({
				top: 45 + i * 12,
				left: baseLeft
			}));
		}

		const rect = spriteElement.getBoundingClientRect();
		const spriteCenter = {
			x: rect.left + rect.width / 2 - 100,
			y: rect.top + rect.height / 2
		};

		const horizontalOffset = rect.width * 0.7 + 100;
		const baseX =
			side === 'ally' ? spriteCenter.x - horizontalOffset : spriteCenter.x + horizontalOffset - 80;

		return Array.from({ length: count }, (_, i) => {
			const topY = spriteCenter.y - 50 + i * 65;
			return {
				top: Math.max(0, (topY / viewportHeight) * 100),
				left: Math.max(0, (baseX / viewportWidth) * 100)
			};
		});
	}

	function updatePositions() {
		const allyPositions = getPositions('ally', allyTargets.length);
		const opponentPositions = getPositions('opponent', opponentTargets.length);

		allyButtons.forEach((btn, i) => {
			if (btn && allyPositions[i]) {
				btn.style.top = `${allyPositions[i].top}%`;
				btn.style.left = `${allyPositions[i].left}%`;
			}
		});

		opponentButtons.forEach((btn, i) => {
			if (btn && opponentPositions[i]) {
				btn.style.top = `${opponentPositions[i].top}%`;
				btn.style.left = `${opponentPositions[i].left}%`;
			}
		});
	}

	function animateEntrance() {
		const allButtons = [...allyButtons, ...opponentButtons].filter(Boolean);
		if (allButtons.length === 0) {
			return;
		}

		gsap.fromTo(
			allButtons,
			{ opacity: 0, scale: 0.7, x: -30 },
			{
				opacity: 1,
				scale: 1,
				x: 0,
				duration: 0.4,
				stagger: 0.08,
				ease: 'back.out(1.4)'
			}
		);
	}

	onMount(() => {
		window.addEventListener('resize', updatePositions);
		return () => {
			window.removeEventListener('resize', updatePositions);
		};
	});

	$effect(() => {
		if (spriteElement) {
			spriteReady = false;
			waitForSpritePosition();
		}
	});

	$effect(() => {
		if (show && spriteReady) {
			updatePositions();
		}
	});
</script>

{#if show && spriteReady}
	{#each allyTargets as target, index}
		<button
			bind:this={allyButtons[index]}
			class="target-plate ally"
			class:selected={selectedTargetIdx === possibleTargets.indexOf(target)}
			style="--target-color: {getTargetColor(target)}"
			onclick={() => onTargetClick(target)}
			role="menuitem"
			aria-label="Target {target.name}, ally, effectiveness {getEffectiveness(target)}x"
		>
			<div class="card-body">
				<span class="target-label">{target.name.toUpperCase()}</span>
				{#if getEffectiveness(target) !== 1}
					<span
						class="effectiveness"
						class:super-effective={getEffectiveness(target) > 1}
						class:not-effective={getEffectiveness(target) < 1}
					>
						x{getEffectiveness(target)}
					</span>
				{/if}
			</div>
		</button>
	{/each}

	{#each opponentTargets as target, index}
		<button
			bind:this={opponentButtons[index]}
			class="target-plate opponent"
			class:selected={selectedTargetIdx === possibleTargets.indexOf(target)}
			style="--target-color: {getTargetColor(target)}"
			onclick={() => onTargetClick(target)}
			role="menuitem"
			aria-label="Target {target.name}, opponent, effectiveness {getEffectiveness(target)}x"
		>
			<div class="card-body">
				<span class="target-label">{target.name.toUpperCase()}</span>
				{#if getEffectiveness(target) !== 1}
					<span
						class="effectiveness"
						class:super-effective={getEffectiveness(target) > 1}
						class:not-effective={getEffectiveness(target) < 1}
					>
						x{getEffectiveness(target)}
					</span>
				{/if}
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

	.target-plate {
		position: absolute;
		min-width: 120px;
		height: 45px;
		padding: 0;
		transform: skewX(var(--skew-angle));
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		z-index: 100;
		pointer-events: auto;
		overflow: visible;
	}

	.target-plate::before {
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

	.target-plate::after {
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
		background-color: var(--target-color);
		border: 4px solid var(--ink-color);
		z-index: 2;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.target-label {
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

	.effectiveness {
		display: inline-block;
		transform: skewX(var(--skew-counter));
		font-size: 1.5rem;
		font-weight: bold;
		padding: 2px 6px;
		color: var(--ink-color);
	}

	.effectiveness.super-effective {
		color: #92400e;
	}

	.effectiveness.not-effective {
		color: #475569;
	}

	.target-plate:hover,
	.target-plate.selected {
		transform: skewX(var(--skew-angle)) scale(1.08);
		z-index: 110;
	}

	.target-plate:hover::before,
	.target-plate:hover::after,
	.target-plate.selected::before,
	.target-plate.selected::after {
		border-color: white;
		box-shadow: 0 0 15px color-mix(in srgb, var(--target-color) 60%, transparent);
	}

	.target-plate:hover > .card-body > .target-label,
	.target-plate.selected > .card-body > .target-label {
		color: white !important;
	}

	.target-plate:hover > .card-body > .effectiveness,
	.target-plate.selected > .card-body > .effectiveness {
		color: white !important;
	}

	.target-plate:hover > .card-body > .effectiveness.super-effective,
	.target-plate.selected > .card-body > .effectiveness.super-effective {
		color: #fef08a !important;
		text-shadow: 0 0 8px rgba(250, 204, 21, 0.6);
	}

	.target-plate:active {
		transform: skewX(var(--skew-angle)) scale(0.98);
	}
</style>
