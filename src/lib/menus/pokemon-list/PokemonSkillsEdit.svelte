<script lang="ts">
	import type { PokemonInstance } from '../../../js/pokemons/pokedex';
	import MovesDraggableList from './MovesDraggableList.svelte';
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

	const monstMoves = $state([...selectedMons.moves]);
	const tmp = $derived(
		context.POKEDEX.findById(selectedMons.id)
			?.result?.moves?.filter((move) => move.level <= selectedMons.level)
			?.filter((move) => !monstMoves.find((m) => m.id === move.id)) || []
	);
	let allMoves = $derived([...new Map(tmp.map((item) => [item.id, item])).values()]);
</script>

<div class="moveEdit" style="--zIndex:{zIndex}" class:open={moveEdit}>
	<div class="all-moves">
		<MovesDraggableList bind:list={allMoves} finalList={false} removable={false} />
	</div>

	<div class="icon">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
			><path
				d="M16.0503 12.0498L21 16.9996L16.0503 21.9493L14.636 20.5351L17.172 17.9988L4 17.9996V15.9996L17.172 15.9988L14.636 13.464L16.0503 12.0498ZM7.94975 2.0498L9.36396 3.46402L6.828 5.9988L20 5.99955V7.99955L6.828 7.9988L9.36396 10.5351L7.94975 11.9493L3 6.99955L7.94975 2.0498Z"
			></path></svg
		>
	</div>

	<div class="monsterMoves">
		<MovesDraggableList bind:list={selectedMons.moves} finalList={true} removable={true} />
	</div>
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

		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 2%;
		text-shadow: 1px 1px 1px black;

		&.open {
			bottom: 0;
		}

		.all-moves {
			width: 47%;
			height: 100%;
			box-sizing: border-box;
			padding: 1%;
		}

		.monsterMoves {
			width: 47%;
			height: 100%;
			box-sizing: border-box;
			padding: 1%;
		}
	}

	.icon {
		height: 4%;
		width: 4%;
		color: white;
	}
</style>
