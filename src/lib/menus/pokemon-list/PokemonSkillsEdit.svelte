<script lang="ts">
	import type { Move, PokemonInstance } from '../../../js/pokemons/pokedex';
	import MovesDualList from './MovesDualList.svelte';
	import type { GameContext } from '../../../js/context/gameContext';

	interface Props {
		context: GameContext;
		selectedMons: PokemonInstance;
		moveEdit: boolean;
		zIndex: number;
	}

	let {
		context = $bindable(),
		selectedMons = $bindable(),
		moveEdit = $bindable(false),
		zIndex = $bindable()
	}: Props = $props();

	// Calculate available moves (what the Pokemon can learn at current level, excluding already selected)
	const availableMoves = $derived([
		...new Map(
			(
				context.POKEDEX.findById(selectedMons.id)
					?.result?.moves?.filter((move) => move.level <= selectedMons.level)
					?.filter((move) => !selectedMons.moves.find((m) => m.id === move.id)) || []
			).map((item) => [item.id, item])
		).values()
	]);

	function handleMovesUpdate(newMoves: Move[]) {
		selectedMons.moves = newMoves;
		// Trigger reactivity by reassigning the object
		selectedMons = selectedMons;
	}
</script>

<div class="moveEdit" style="--zIndex:{zIndex}" class:open={moveEdit}>
	<MovesDualList {availableMoves} selectedMoves={selectedMons.moves} onUpdate={handleMovesUpdate} />
</div>

<style lang="scss">
	.moveEdit {
		background: rgba(0, 29, 43, 0.95);
		height: calc(100% - 46px);
		width: 100%;
		box-sizing: border-box;
		position: absolute;

		z-index: var(--zIndex, 11);
		left: 0;
		bottom: -100%;
		transition: bottom 0.5s ease-in-out;

		text-shadow: 1px 1px 1px black;

		&.open {
			bottom: 0;
		}
	}
</style>
