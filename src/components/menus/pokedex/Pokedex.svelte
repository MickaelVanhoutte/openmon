<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameContext } from '../../../js/context/gameContext';
	import { MenuType } from '../../../js/context/overworldContext';
	import type { PokedexSearchResult } from '../../../js/pokemons/pokedex';
	import PokedexDetail from './PokedexDetail.svelte';
	import { typeChart } from '../../../js/battle/battle-model';

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
		wrapper.scrollTop = elements[selectedIdx]?.offsetTop - 142;
	}

	const openDetail = () => {
		detailOpened = true;
	};

	const search = () => {
		selectedIdx = 0;
		if (searchTerm.trim()?.length === 0) {
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
		if (selectedIdx === idx) {
			openDetail();
			return;
		} else {
			selectedIdx = idx;
		}

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
	<div class="row head">
		<div class="column back">
			<button on:click={() => context.overWorldContext.closeMenu(MenuType.POKEDEX)}>BACK</button>
		</div>

		<div class="column">
			<div class="filters">
				<div class="form__group field">
					<input
						type="input"
						class="form__field"
						placeholder="Search"
						bind:value={searchTerm}
						on:input={search}
					/>
					<label for="name" class="form__label">Name</label>
				</div>
			</div>
		</div>
	</div>
	<div class="row content">
		<div class="column preview">
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
					{selectedPokemon?.id ? ('00' + (selectedPokemon?.id)).slice(-3) : '???'} (#{selectedPokemon?.regionalId})
					{selectedPokemon?.name ? ('- ' + selectedPokemon?.name) : ''}
				</h2>
			</div>
		</div>

		<div class="column list" bind:this={wrapper}>
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

		<!-- <div style="display: flex; flex-wrap: wrap;overflow-y: scroll;overflow-x: hidden;height: 100dvh;">
			{#each filtered as pokemon}
				<div style="position:relative; width: calc(100% / 9); box-sizing:border-box; height: auto; border: 1px solid black;
				background: linear-gradient(
    to bottom,
    {typeChart[pokemon.types[0]].color} 0%,
	{typeChart[pokemon.types[0]].color} 50%,
	 {typeChart[pokemon.types[1]]?.color || typeChart[pokemon.types[0]].color} 50%,
	 {typeChart[pokemon.types[1]]?.color || typeChart[pokemon.types[0]].color} 100%
  );">
					<img
						style="width: 100%; opacity: .5" 
						src={`src/assets/monsters/pokedex/${('00' + pokemon?.id).slice(-3)}.png`}
					/>

					<img
						style="width: 100%; position: absolute; top: 0; left: 0; filter: brightness(1);"
						src={`src/assets/monsters/walking/${('00' + pokemon?.id).slice(-3)}.png`}
					/>

					<span style="position: absolute; bottom:4px; left: 50%;
					transform: translate(-50%, 0%); font-size:12px; color: black">{pokemon.regionalId + ' - ' +pokemon.id + ' - ' + pokemon.name}</span>
				</div>
			{/each}
		</div> -->
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
			width: 100%;
		}

		.column {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
		}

		.head {
			height: 12%;
			padding: 2%;
			box-sizing: border-box;

			.filters {
				width: 46dvw;
				height: 100%;

				.form__group {
					position: relative;
					padding: 15px 0 0;
					width: 94%;
				}

				.form__field {
					font-family: inherit;
					width: 100%;
					border: 0;
					border-bottom: 2px solid rgba(0, 0, 0, 0.4);
					outline: 0;
					font-size: 1.2rem;
					color: white;
					padding: 4px 0;
					background: transparent;
					transition: border-color 0.2s;

					&::placeholder {
						color: transparent;
					}

					&:placeholder-shown ~ .form__label {
						font-size: 1.2rem;
						cursor: text;
						top: 20px;
						color: white;
					}
				}

				.form__label {
					position: absolute;
					top: 0;
					display: block;
					transition: 0.2s;
					font-size: 1rem;
					color: rgba(0, 0, 0, 0.4);
				}

				.form__field:focus {
					~ .form__label {
						position: absolute;
						top: 0;
						display: block;
						transition: 0.2s;
						font-size: 1rem;
						color: white;
						font-weight: 700;
					}
					padding-bottom: 6px;
					font-weight: 700;
					border-width: 3px;
					border-image: linear-gradient(to right, white, white);
					border-image-slice: 1;
				}
				/* reset input */
				.form__field {
					&:required,
					&:invalid {
						box-shadow: none;
					}
				}
			}
		}

		.content {
			height: 88%;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			padding: 0 2%;
			box-sizing: border-box;
		}

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

			h2 {
				margin: 0;
			}
		}

		.list {
			width: 50%;
			height: 96%;
			overflow-y: auto;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: center;
			gap: 4px;
			padding: 2%;
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

			button {
				width: 40px;
				height: 30px;
				position: relative;
				z-index: 999;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 26px;
				text-transform: uppercase;
				cursor: pointer;
				border-radius: 4px;
				color: white;
				background: rgba(0, 0, 0, 0.4);
				border: 1px solid white;
			}
		}

		.back {
			button {
				padding: 4px 16px;
				height: 28px;
				position: relative;
				z-index: 999;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 26px;
				text-transform: uppercase;
				cursor: pointer;
				border-radius: 4px;
				font-family: 'pokemon';
				color: white;
				background: rgba(0, 0, 0, 0.2);
				border: 1px solid white;
			}
		}
	}
</style>
