<script lang="ts">
	import type { MoveInstance } from '../../../js/pokemons/pokedex';
	import { typeChart } from '../../../js/battle/battle-model';

	interface Props {
		moves: MoveInstance[];
		selectedMoveIdx?: number;
		disabled: boolean;
		show: boolean;
		onMoveClick: (idx: number, move: MoveInstance) => void;
	}

	let { moves, selectedMoveIdx, disabled, show, onMoveClick }: Props = $props();
</script>

<div class="moves2" class:show role="menu" aria-label="Available moves">
	{#each moves as move, index}
		<button
			class="move-btn move"
			style="--color:{typeChart[move.type as keyof typeof typeChart]?.color}; --offset: {index *
				3}%"
			{disabled}
			class:selected={!disabled && selectedMoveIdx === index}
			onclick={() => onMoveClick(index, move)}
			role="menuitem"
			aria-label="{move.name} - {move.currentPp} of {move.pp} PP remaining, {move.type} type"
		>
			<span class="move-name">{move.name.toUpperCase()}</span>
			<span class="move-pp">
				{move.currentPp}/{move.pp}
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

		.move-btn {
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

			.move-pp {
				font-size: 16px;
			}
		}
	}
</style>
