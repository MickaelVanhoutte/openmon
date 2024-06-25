<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameContext } from '../../../js/context/gameContext';
	import { MenuType } from '../../../js/context/overworldContext';
	import type { PokedexSearchResult } from '../../../js/pokemons/pokedex';
	import PokedexDetail from './PokedexDetail.svelte';
	import { typeChart } from '../../../js/battle/battle-model';
	import { backInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	export let context: GameContext;
	// viewed / caught
	// search
	// list

	let showFullDexImg = true; // debug

	let wrapper: HTMLDivElement;
	let elements: HTMLElement[] = [];
	let selectedIdx = 0;
	let searchTerm: string = '';
	$: selectedPokemon = filtered[selectedIdx];
	let filtered = context.POKEDEX.entries;
	let detailOpened = false;
	let selectedType: string | undefined = undefined;

	$: if (!detailOpened && elements?.length > 0) {
		if (selectedIdx === 0) {
			wrapper.scrollTop = 0;
		} else {
			wrapper.scrollTop = elements[selectedIdx]?.offsetTop - 142;
		}
	}

	const openDetail = () => {
		detailOpened = true;
	};

	const search = () => {
		selectedIdx = 0;
		if (searchTerm.trim()?.length === 0) {
			return (filtered = context.POKEDEX.entries?.filter(
				(p) => !selectedType || p.types.includes(selectedType)
			));
		}
		if (Number(searchTerm) > 0 && Number(searchTerm) < 252) {
			return (filtered = context.POKEDEX.findById(Number(searchTerm))?.result
				? [context.POKEDEX.findById(Number(searchTerm))?.result]
				: []).filter((p) => !selectedType || p.types.includes(selectedType));
		}

		return (filtered = context.POKEDEX.findByName(searchTerm).map(
			(p: PokedexSearchResult) => p.result
		))?.filter((p) => !selectedType || p.types.includes(selectedType));
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

<div
	class="pokedex"
	in:slide={{ duration: 500, delay: 100, axis: 'x', easing: backInOut }}
	out:fade
>
{#if showFullDexImg}
	 <div class="row head">
		<div class="col-2 back">
			<button on:click={() => context.overWorldContext.closeMenu(MenuType.POKEDEX)}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
					></path></svg
				>
			</button>
		</div>

		<div class="col-2"></div>

		<div class="col-4">
			<select bind:value={selectedType} on:change={search}>
				<option value={undefined}>Type</option>
				{#each Object.keys(typeChart) as type}
					<option value={type}>{type.toUpperCase()}</option>
				{/each}
			</select>
		</div>

		<div class="col-4">
			<input
				type="input"
				class="form__field"
				placeholder="Search"
				bind:value={searchTerm}
				on:input={search}
			/>
		</div>
	</div>
	<div class="row content">
		<div class="col-6 preview">
			<div class="image">
				{#if selectedPokemon?.id}
					<img
						src={`src/assets/monsters/pokedex/${('00' + selectedPokemon?.id).slice(-3)}.png`}
						class:hide={!selectedPokemon?.viewed}
						alt={selectedPokemon?.name}
					/>
				{:else}
					<img src="src/assets/monsters/animated/000.png" alt="unknown" />
				{/if}
			</div>
			<div>
				<span>
					{selectedPokemon?.id ? '#' + ('00' + selectedPokemon?.id).slice(-3) : '???'}
					{selectedPokemon?.name ? '- ' + selectedPokemon?.name : ''}
				</span>
			</div>
		</div>
		<div class="col-6 list" bind:this={wrapper}>
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
						{'#' + ('00' + pokemon.id).slice(-3)} - {pokemon.name}
					</span>

					<button on:click={() => openDetail()}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
							><path d="M16 12L10 18V6L16 12Z"></path></svg
						>
					</button>
				</div>
			{/each}
		</div>
	</div>

	{:else}

	 <div style="display: flex; flex-wrap: wrap;overflow-y: scroll;overflow-x: hidden;height: 100dvh;">
		{#each filtered as pokemon}
			<div
				style="position:relative; height:calc(100dvw / 16); width: calc(100dvw / 16); overflow:hidden; box-sizing:border-box; height: auto; border: 1px solid black;
				background: linear-gradient(
    to bottom,
    {typeChart[pokemon.types[0]].color} 0%,
	{typeChart[pokemon.types[0]].color} 50%,
	 {typeChart[pokemon.types[1]]?.color || typeChart[pokemon.types[0]].color} 50%,
	 {typeChart[pokemon.types[1]]?.color || typeChart[pokemon.types[0]].color} 100%
  );"
				class:hide={pokemon.types.includes('')}
			>
				<span
					style="position: absolute; top:4px; left: 50%;
					transform: translate(-50%, 0%); font-size:18px; color: white; z-index: 10; font-weight: bold; "
					>{pokemon.name}</span
				>
				<img
					style="width: 100%; opacity: 0.1"
					src={`src/assets/monsters/pokedex/${('00' + pokemon?.id).slice(-3)}.png`}
				/>

				<img
					style="width: auto; height:80%; position: absolute; top: 50%; left: 50%; z-index:2; transform:translate(-50%, -50%); filter: brightness(1);"
					src={`src/assets/monsters/animated/${('00' + pokemon?.id).slice(-3)}.gif`}
				/>

				<span
					style="position: absolute; bottom:4px; left: 50%;
					transform: translate(-50%, 0%); font-size:18px; color: white; z-index: 10; font-weight: bold; "
					>{pokemon.regionalId} {pokemon.id}</span
				>
			</div>
		{/each}
	</div> 
	{/if}

</div>

{#if detailOpened}
	<PokedexDetail pokemon={selectedPokemon} bind:filtered bind:selectedIdx bind:detailOpened />
{/if}

<style lang="scss">
	.hide {
		img {
			opacity: 0.1;
		}
	}

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
		z-index: 10;

		.head {
			height: 12%;
			padding: 1% 2% 0 2%;
			font-size: 14px;
			box-sizing: border-box;
		}

		.content {
			height: 88%;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
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
				height: 46px;
				width: 46px;
				color: white;
				background-color: transparent;
				border: none;
				outline: none;
			}
		}
	}
</style>
