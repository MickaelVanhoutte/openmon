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
			const topY = spriteCenter.y - 30 + i * 55;
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
			<span class="target-name">{target.name.toUpperCase()}</span>
			{#if getEffectiveness(target) !== 1}
				<span
					class="effectiveness"
					class:super-effective={getEffectiveness(target) > 1}
					class:not-effective={getEffectiveness(target) < 1}
				>
					x{getEffectiveness(target)}
				</span>
			{/if}
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
			<span class="target-name">{target.name.toUpperCase()}</span>
			{#if getEffectiveness(target) !== 1}
				<span
					class="effectiveness"
					class:super-effective={getEffectiveness(target) > 1}
					class:not-effective={getEffectiveness(target) < 1}
				>
					x{getEffectiveness(target)}
				</span>
			{/if}
		</button>
	{/each}
{/if}

<style>
	:root {
		--skew-angle: -10deg;
		--skew-counter: 10deg;
	}

	.target-plate {
		position: absolute;
		min-width: 160px;
		padding: 12px 20px;
		transform: skewX(var(--skew-angle));
		background: rgba(20, 25, 35, 0.92);
		border: 3px solid var(--target-color);
		border-left: 5px solid var(--target-color);
		color: white;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		z-index: 100;
	}

	.target-plate.ally {
		border-left: 5px solid var(--target-color);
		border-right: 3px solid var(--target-color);
	}

	.target-plate.opponent {
		border-right: 5px solid var(--target-color);
		border-left: 3px solid var(--target-color);
	}

	.target-plate:hover,
	.target-plate.selected {
		transform: skewX(var(--skew-angle)) scale(1.03);
		border-color: rgba(255, 255, 255, 0.8);
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.5),
			0 0 15px color-mix(in srgb, var(--target-color) 40%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.target-plate:active {
		transform: skewX(var(--skew-angle)) scale(0.98);
	}

	.target-name {
		display: inline-block;
		transform: skewX(var(--skew-counter));
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.effectiveness {
		display: inline-block;
		transform: skewX(var(--skew-counter));
		font-size: 0.9rem;
		font-weight: 700;
		padding: 2px 8px;
	}

	.effectiveness.super-effective {
		color: #facc15;
		text-shadow: 0 0 8px rgba(250, 204, 21, 0.6);
	}

	.effectiveness.not-effective {
		color: #94a3b8;
	}
</style>
