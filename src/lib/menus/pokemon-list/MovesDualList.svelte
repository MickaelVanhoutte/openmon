<script lang="ts">
	import type { Move } from '$js/pokemons/pokedex';
	import { MoveInstance } from '$js/pokemons/pokedex';

	// Import type icons
	import bugIcon from '../../../assets/types/bug-small.png';
	import darkIcon from '../../../assets/types/dark-small.png';
	import dragonIcon from '../../../assets/types/dragon-small.png';
	import electricIcon from '../../../assets/types/electric-small.png';
	import fairyIcon from '../../../assets/types/fairy-small.png';
	import fightingIcon from '../../../assets/types/fighting-small.png';
	import fireIcon from '../../../assets/types/fire-small.png';
	import flyingIcon from '../../../assets/types/flying-small.png';
	import ghostIcon from '../../../assets/types/ghost-small.png';
	import grassIcon from '../../../assets/types/grass-small.png';
	import groundIcon from '../../../assets/types/ground-small.png';
	import iceIcon from '../../../assets/types/ice-small.png';
	import normalIcon from '../../../assets/types/normal-small.png';
	import poisonIcon from '../../../assets/types/poison-small.png';
	import psychicIcon from '../../../assets/types/psychic-small.png';
	import rockIcon from '../../../assets/types/rock-small.png';
	import steelIcon from '../../../assets/types/steel-small.png';
	import waterIcon from '../../../assets/types/water-small.png';

	const typeIcons: Record<string, string> = {
		bug: bugIcon,
		dark: darkIcon,
		dragon: dragonIcon,
		electric: electricIcon,
		fairy: fairyIcon,
		fighting: fightingIcon,
		fire: fireIcon,
		flying: flyingIcon,
		ghost: ghostIcon,
		grass: grassIcon,
		ground: groundIcon,
		ice: iceIcon,
		normal: normalIcon,
		poison: poisonIcon,
		psychic: psychicIcon,
		rock: rockIcon,
		steel: steelIcon,
		water: waterIcon
	};

	// Import category icons
	import physicalIcon from '../../../assets/moves-cat/physical.png';
	import specialIcon from '../../../assets/moves-cat/special.png';
	import statusIcon from '../../../assets/moves-cat/no-damage.png';

	const categoryIcons: Record<string, string> = {
		physical: physicalIcon,
		special: specialIcon,
		'no-damage': statusIcon
	};

	interface Props {
		availableMoves: Move[];
		selectedMoves: Move[];
		onUpdate: (selectedMoves: Move[]) => void;
	}

	const { availableMoves, selectedMoves, onUpdate }: Props = $props();

	// Local state that tracks the selected moves
	let localSelected: Move[] = $state([...selectedMoves]);

	// Search query for filtering available moves
	let searchQuery = $state('');

	// Sync when parent's selectedMoves changes
	$effect(() => {
		localSelected = [...selectedMoves];
	});

	// Filter available moves to exclude already selected ones and match search query
	const filteredAvailable = $derived(
		availableMoves
			.filter((m) => !localSelected.find((s) => s.id === m.id))
			.filter((m) => {
				if (!searchQuery) {
					return true;
				}
				const query = searchQuery.toLowerCase();
				return m.name.toLowerCase().includes(query) || m.type.toLowerCase().includes(query);
			})
	);

	function addMove(move: Move) {
		if (localSelected.length >= 4) {
			return;
		}
		const newMove = new MoveInstance(
			move.id,
			move.name,
			move.type,
			move.category,
			move.power,
			move.accuracy,
			move.pp,
			move.priority,
			move.target,
			move.effect,
			move.effectChance,
			move.description,
			move.level
		);
		localSelected = [...localSelected, newMove];
		onUpdate(localSelected);
	}

	function removeMove(move: Move) {
		if (localSelected.length <= 1) {
			return;
		}
		localSelected = localSelected.filter((m) => m.id !== move.id);
		onUpdate(localSelected);
	}

	const canAdd = $derived(localSelected.length < 4);
	const canRemove = $derived(localSelected.length > 1);
</script>

<div class="dual-list-container">
	<div class="list-section all-moves">
		<div class="search-bar">
			<input type="text" placeholder="Search moves..." bind:value={searchQuery} />
		</div>
		<div class="__wrapper">
			{#each filteredAvailable as move (move.id)}
				<div class="move-row">
					<div class="move">
						<span class="type">
							<img src={typeIcons[move.type]} alt={move.type} />
						</span>
						<div class="flex-row">
							<div class="flex-col">
								<span class="name">{move.name}</span>
								<img class="category" src={categoryIcons[move.category]} alt={move.category} />
							</div>
							<div class="flex-col">
								<span>power {move.power ? move.power : '/'}</span>
								<span class="pp">PP {move.pp}</span>
							</div>
						</div>
					</div>
					<button
						class="arrow-btn add"
						onclick={() => addMove(move)}
						disabled={!canAdd}
						title={canAdd ? 'Add move' : 'Max 4 moves'}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M16.172 11L10.808 5.636 12.222 4.222 20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
							/>
						</svg>
					</button>
				</div>
			{/each}
			{#if filteredAvailable.length === 0}
				<div class="empty-message">
					{#if searchQuery}
						No moves matching "{searchQuery}"
					{:else}
						No more moves available
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<div class="icon">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
			><path
				d="M16.0503 12.0498L21 16.9996L16.0503 21.9493L14.636 20.5351L17.172 17.9988L4 17.9996V15.9996L17.172 15.9988L14.636 13.464L16.0503 12.0498ZM7.94975 2.0498L9.36396 3.46402L6.828 5.9988L20 5.99955V7.99955L6.828 7.9988L9.36396 10.5351L7.94975 11.9493L3 6.99955L7.94975 2.0498Z"
			></path></svg
		>
	</div>

	<div class="list-section monster-moves">
		<div class="__wrapper">
			{#each localSelected as move (move.id)}
				<div class="move-row">
					<button
						class="arrow-btn remove"
						onclick={() => removeMove(move)}
						disabled={!canRemove}
						title={canRemove ? 'Remove move' : 'Must have at least 1 move'}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z"
							/>
						</svg>
					</button>
					<div class="move">
						<span class="type">
							<img src={typeIcons[move.type]} alt={move.type} />
						</span>
						<div class="flex-row">
							<div class="flex-col">
								<span class="name">{move.name}</span>
								<img class="category" src={categoryIcons[move.category]} alt={move.category} />
							</div>
							<div class="flex-col">
								<span class="power">power {move.power ? move.power : '/'}</span>
								<span class="pp">PP {move.pp}</span>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.dual-list-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 2%;
		height: 100%;
		width: 100%;
	}

	.list-section {
		width: 47%;
		height: 100%;
		box-sizing: border-box;
		padding: 1%;
		display: flex;
		flex-direction: column;
	}

	.search-bar {
		flex-shrink: 0;
		margin-bottom: 8px;
	}

	.search-bar input {
		width: 100%;
		padding: 10px 12px;
		background: #0e2742;
		border: 2px solid #68c0c8;
		color: #fff;
		font-family: inherit;
		font-size: 1rem;
		box-sizing: border-box;
		text-shadow: 1px 1px 1px black;
	}

	.search-bar input::placeholder {
		color: #68c0c8;
		opacity: 0.7;
	}

	.search-bar input:focus {
		outline: none;
		border-color: #fff;
	}

	.icon {
		height: 4%;
		width: 4%;
		color: white;
	}

	.__wrapper {
		display: flex;
		flex-direction: column;
		position: relative;
		gap: 4%;
		padding: 1% 5%;
		flex: 1;
		min-height: 0;
		box-sizing: border-box;
		align-items: flex-end;
		overflow-y: auto;

		scrollbar-width: thin;
		scrollbar-color: #68c0c8 #0e2742f0;
	}

	.move-row {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		height: calc((100dvh - 46px) * 0.21);
	}

	.arrow-btn {
		width: 48px;
		height: 48px;
		min-width: 48px;
		border: 2px solid #000;
		border-radius: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.4);

		svg {
			width: 28px;
			height: 28px;
		}

		&.add {
			background: #2d8f3d;
			color: white;

			&:hover:not(:disabled) {
				background: #3ba84d;
				transform: translateX(2px);
			}
		}

		&.remove {
			background: #c73e3e;
			color: white;

			&:hover:not(:disabled) {
				background: #e04545;
				transform: translateX(-2px);
			}
		}

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
			box-shadow: none;
		}

		&:active:not(:disabled) {
			box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
			transform: translate(2px, 2px);
		}
	}

	.move {
		flex: 1;
		background: #143855;
		border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		color: #fff;
		padding: 12px;
		border-radius: 0;
		position: relative;
		height: 100%;
		box-sizing: border-box;
		text-shadow: 2px 2px 0 black;

		.flex-row {
			gap: 6%;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			height: 100%;
			width: 100%;
			padding-left: 20%;
			box-sizing: border-box;
		}

		.flex-col {
			display: flex;
			flex-direction: column;
		}

		.type {
			position: absolute;
			top: 8px;
			left: 8px;

			img {
				width: 32px;
				height: 32px;
				display: block;
				filter: drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.5));
			}
		}

		.category {
			width: 18px;
			height: 18px;
			display: block;
			filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5));
		}

		.name {
			font-size: 2rem;
			text-transform: uppercase;
		}

		.power {
			font-size: 1rem;
			text-transform: uppercase;
		}

		.pp {
			font-size: 1.5rem;
			text-transform: uppercase;
		}
	}

	.empty-message {
		color: #68c0c8;
		text-align: center;
		padding: 20px;
		font-style: italic;
		opacity: 0.7;
	}
</style>
