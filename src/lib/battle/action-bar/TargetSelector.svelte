<script lang="ts">
	import type { PokemonInstance, MoveInstance } from '../../../js/pokemons/pokedex';
	import type { BattleContext } from '../../../js/context/battleContext';

	interface Props {
		possibleTargets: PokemonInstance[];
		selectedTargetIdx?: number;
		selectedMove?: MoveInstance;
		battleCtx: BattleContext;
		show: boolean;
		onTargetClick: (target: PokemonInstance) => void;
	}

	let { possibleTargets, selectedTargetIdx, selectedMove, battleCtx, show, onTargetClick }: Props =
		$props();

	function getEffectiveness(target: PokemonInstance): number {
		if (!selectedMove?.type) return 1;
		return battleCtx?.calculateTypeEffectiveness(selectedMove.type, target.types) ?? 1;
	}

	function getTargetColor(target: PokemonInstance): string {
		const side = battleCtx.getPokemonSide(target);
		return side === 'ally' ? '#4ade80' : '#f87171';
	}
</script>

{#if show}
	<div class="target-selector" role="menu" aria-label="Select target">
		{#each possibleTargets as target, index}
			<button
				class="target-plate"
				class:selected={selectedTargetIdx === index}
				style="--target-color: {getTargetColor(target)}"
				onclick={() => onTargetClick(target)}
				role="menuitem"
				aria-label="Target {target.name}, {battleCtx.getPokemonSide(target) === 'ally'
					? 'ally'
					: 'opponent'}, effectiveness {getEffectiveness(target)}x"
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
	</div>
{/if}

<style>
	:root {
		--skew-angle: -15deg;
		--skew-counter: 15deg;
	}

	.target-selector {
		position: absolute;
		bottom: 12%;
		right: 5%;
		display: flex;
		flex-direction: column;
		gap: 8px;
		z-index: 100;
		animation: slideIn 0.3s ease-out forwards;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.target-plate {
		position: relative;
		min-width: 180px;
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
		max-width: 140px;
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
