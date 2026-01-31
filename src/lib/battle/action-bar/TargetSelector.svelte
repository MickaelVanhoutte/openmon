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
</script>

<div class="moves2 target-select" class:show role="menu" aria-label="Select target">
	{#each possibleTargets as target, index}
		<button
			class="move-btn target-btn move"
			style="--offset: {index * 3}%; --color: {battleCtx.getPokemonSide(target) === 'ally'
				? '#7EAF53'
				: '#dc5959'}"
			class:selected={selectedTargetIdx === index}
			onclick={() => onTargetClick(target)}
			role="menuitem"
			aria-label="Target {target.name}, {battleCtx.getPokemonSide(target) === 'ally'
				? 'ally'
				: 'opponent'}, effectiveness {getEffectiveness(target)}x"
		>
			<span class="move-name">{target.name.toUpperCase()}</span>
			<span
				class="effectiveness"
				style="--eff-color: {getEffectiveness(target) > 1 ? 'yellow' : 'transparent'}"
			>
				x{getEffectiveness(target)}
			</span>
		</button>
	{/each}
</div>

<style lang="scss">
	@keyframes appear {
		from {
			bottom: -25%;
		}
		to {
			bottom: 2%;
		}
	}

	.moves2 {
		width: 30%;
		max-height: 220px;
		position: absolute;
		bottom: -25%;
		right: 5%;
		transition: bottom 0.5s ease-in-out;
		animation: appear 0.5s ease-in forwards;
		align-items: flex-end;
		gap: 6px;
		display: flex;
		flex-direction: column;
		z-index: 9;

		&.target-select {
			justify-content: center;
		}

		.move-btn,
		.target-btn {
			width: 100%;
			height: calc(80% / 4);
			background-color: var(--pixel-bg-header);
			border: 2px solid var(--pixel-border-color);
			border-left: 5px solid var(--color, var(--pixel-bg-header));
			color: var(--pixel-text-white);
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 12px 0 10px;
			transform: translateX(8%);
			font-size: 24px;
			min-width: 44px;
			min-height: 44px;
			transition: transform 0.5s ease-in-out;
			box-sizing: border-box;

			&.target-btn {
				border: 2px solid var(--pixel-border-color);
				border-left: 5px solid var(--color, var(--pixel-bg-header));
				justify-content: flex-start;
				gap: 10%;

				&:hover,
				&.selected {
					background-color: var(--pixel-bg-header);
					color: var(--pixel-text-white);
				}

				span:first-child {
					margin-left: 10%;
				}
				span:last-child {
					font-size: 26px;
					font-weight: bold;
					text-shadow: 0px 0px 5px var(--eff-color, transparent);
				}
			}

			&:hover,
			&.selected {
				filter: brightness(1.1);
				border: 3px solid var(--pixel-text-gold);
				border-left: 5px solid var(--color, var(--pixel-bg-header));
				color: var(--pixel-text-white);
				opacity: 1;
			}

			.move-name {
				max-width: 70%;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}
</style>
