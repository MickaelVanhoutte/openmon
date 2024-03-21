<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameContext } from '../../../js/context/gameContext';
	import { MenuType } from '../../../js/context/overworldContext';
	import type { PokedexSearchResult } from '../../../js/pokemons/pokedex';
	import PokedexDetail from './PokedexDetail.svelte';

	export let context: GameContext;
	// viewed / caught
	// search
	// list

	let wrapper: HTMLDivElement;
	let elements: HTMLElement[] = [];
	let selectedIdx = 0;
	let searchTerm: string = '';
	$: selectedPokemon = filtered[selectedIdx];
	let filtered = context.POKEDEX.entries;
	let detailOpened = false;

	$: if (!detailOpened && elements?.length > 0) {
		wrapper.scrollTop = elements[selectedIdx].offsetTop - 142;
	}

	const openDetail = () => {
		detailOpened = true;
	};

	const search = () => {
		selectedIdx = 0;
		if (searchTerm.trim() === '') {
			return (filtered = context.POKEDEX.entries);
		}
		if (Number(searchTerm) > 0 && Number(searchTerm) < 252) {
			return (filtered = context.POKEDEX.findById(Number(searchTerm))?.result
				? [context.POKEDEX.findById(Number(searchTerm))?.result]
				: []);
		}

		return (filtered = context.POKEDEX.findByName(searchTerm).map(
			(p: PokedexSearchResult) => p.result
		));
	};

	function select(idx: number) {
		selectedIdx = idx;
		//wrapper.scrollTop = elements[selectedIdx].offsetTop - 100;
	}

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			if (detailOpened) {
				detailOpened = false;
				return;
			} else {
				context.overWorldContext.closeMenu(MenuType.POKEDEX);
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (selectedIdx < filtered.length - 1) {
				select(selectedIdx + 1);
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (selectedIdx > 0) {
				select(selectedIdx - 1);
			}
		} else if (e.key === 'Enter') {
			openDetail();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', listener);
		return () => {
			window.removeEventListener('keydown', listener);
		};
	});
</script>

<div class="pokedex">
	<div class="row">
		<div class="preview">
			<div class="image">
				{#if selectedPokemon?.id}
					<img
						src={`src/assets/monsters/pokedex/${('00' + selectedPokemon?.id).slice(-3)}.png`}
						class:hide={!selectedPokemon?.viewed}
						alt={selectedPokemon?.name}
					/>
				{:else}
					<img src="src/assets/monsters/bw-animated/000.png" alt="unknown" />
				{/if}
			</div>
			<div>
				<h2>
					{selectedPokemon?.id ? ('00' + (selectedIdx + 1)).slice(-3) : '???'}
					-
					{selectedPokemon?.name}
				</h2>
			</div>
		</div>
		<div class="search">
			<div class="filters">
				<input type="text" placeholder="Search" bind:value={searchTerm} on:input={search} />
			</div>

			<div class="list" bind:this={wrapper}>
				{#each filtered as pokemon, index}
					<div
						class:selected={selectedPokemon?.id === pokemon.id}
						bind:this={elements[index]}
						on:click={() => select(index)}
					>
						{#if pokemon.caught}
							<img src="src/assets/menus/pokeball.png" alt="pokemons" />
						{:else}
							<span style="height:28px; width:24px"></span>
						{/if}
						<span>
							{('00' + pokemon.id).slice(-3)} - {pokemon.name}
						</span>

						<button on:click={() => openDetail()}>►</button>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

{#if detailOpened}
	<PokedexDetail pokemon={selectedPokemon} bind:filtered bind:selectedIdx bind:detailOpened />
{/if}

<style lang="scss">
	.pokedex {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		//background-image: url('src/assets/menus/p-sum.jpg');
		//background-size: cover;
		//background-position: top left;
		//background-repeat: round;
		background: rgb(0, 29, 43);
		background: -moz-linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		background: -webkit-linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		background: linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		color: #fff;
		z-index: 9;

		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			height: 100%;
			background-color: rgba(44, 56, 69, 0.3);

			.preview {
				width: 50%;
				height: 100%;

				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: center;

				.image {
					width: 100%;
					height: 80%;
					display: flex;
					justify-content: center;
					align-items: flex-end;

					img {
						height: 80%;
						object-fit: contain;

						&.hide {
							filter: brightness(0);
						}
					}
				}
			}

			.search {
				width: 50%;
				height: 100%;

				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: center;

				.list {
					width: 100%;
					height: 80%;
					overflow-y: auto;
					box-sizing: border-box;
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: center;
					gap: 8px;
					padding: 2% 4%;
					scrollbar-width: thin;
					scrollbar-color: #68c0c8 #0e2742f0;
					div {
						padding: 8px;
						border-bottom: 1px solid #000;
						border: 2px solid #000;
						border-radius: 4px;
						background: rgba(255, 255, 255, 0.5);
						width: 100%;
						box-sizing: border-box;
						display: flex;
						flex-direction: row;
						justify-content: space-between;

						&.selected {
							background: rgba(255, 255, 255, 0.8);
						}
					}
				}
			}
		}
	}
</style>
