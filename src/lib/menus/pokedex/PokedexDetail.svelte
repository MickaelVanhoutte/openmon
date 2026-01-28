<script lang="ts">
	import { onMount } from 'svelte';
	import { typeChart } from '../../../js/battle/battle-model';
	import type { GameContext } from '../../../js/context/gameContext';
	import { PokedexEntry } from '../../../js/pokemons/pokedex';
	import PokedexMore from './PokedexMore.svelte';
	import PokedexMoves from './PokedexMoves.svelte';
	import PokedexStats from './PokedexStats.svelte';

	export let pokemon: PokedexEntry;
	export let selectedIdx: number;
	export let filtered: PokedexEntry[];
	export let detailOpened: boolean;

	const tabs = {
		1: 'Stats',
		2: 'More',
		3: 'Moves'
	};
	let currentTab: 1 | 2 | 3 = 1;

	function selectTab(tab: 1 | 2 | 3) {
		currentTab = tab;
	}

	function select(idx: number) {
		selectedIdx = idx;
	}

	function next() {
		if (selectedIdx < filtered.length - 1) {
			select(selectedIdx + 1);
		}
	}

	function previous() {
		if (selectedIdx > 0) {
			select(selectedIdx - 1);
		}
	}

	function back() {
		detailOpened = false;
	}

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'ArrowLeft') {
			let tab: 1 | 2 | 3 = currentTab === 1 ? 3 : ((currentTab - 1) as 1 | 2 | 3);
			selectTab(tab);
		} else if (e.key === 'ArrowRight') {
			let tab: 1 | 2 | 3 = currentTab === 3 ? 1 : ((currentTab + 1) as 1 | 2 | 3);
			selectTab(tab);
		}
	};

	onMount(() => {
		window.addEventListener('keydown', listener);
		return () => {
			window.removeEventListener('keydown', listener);
		};
	});
</script>

<div class="pokedex-detail" style="--color:{typeChart[pokemon.types[0]].color}">
	<div class="row title">
		<div class="back">
			<button on:click={() => back()}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
					></path></svg
				>
			</button>
		</div>

		<div>
			<h1>{pokemon.name}</h1>
		</div>
		<div class="prev-next">
			<button on:click={() => previous()}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path d="M12 8L18 14H6L12 8Z"></path></svg
				>
			</button>
			<button on:click={() => next()}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path d="M12 16L6 10H18L12 16Z"></path></svg
				>
			</button>
		</div>
	</div>

	{#if currentTab === 1}
		<PokedexStats {pokemon} />
	{:else if currentTab === 2}
		<PokedexMore {pokemon} />
	{:else if currentTab === 3}
		<PokedexMoves {pokemon} />
	{/if}

	<div class="menu row">
		<div class="wrapper">
			<input type="radio" name="tab" id="tab1" class="tab tab--1" checked={currentTab === 1} />
			<label class="tab_label" for="tab1" tabindex="-1" on:click={() => selectTab(1)}>Stats</label>

			<input type="radio" name="tab" id="tab2" class="tab tab--2" checked={currentTab === 2} />
			<label class="tab_label" for="tab2" tabindex="-1" on:click={() => selectTab(2)}>More</label>

			<input type="radio" name="tab" id="tab3" class="tab tab--3" checked={currentTab === 3} />
			<label class="tab_label" for="tab3" tabindex="-1" on:click={() => selectTab(3)}>Moves</label>

			<div class="indicator"></div>
		</div>
	</div>
</div>

<style lang="scss">
	.pokedex-detail {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		background: #143855;
		border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		color: #fff;
		z-index: 10;
		box-sizing: border-box;

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

		.title {
			height: 46px;
			gap: 6%;
			padding: 0 2%;
			box-sizing: border-box;
			background: #0088cc;
			border-bottom: 2px solid #000;

			h1 {
				font-size: 36px;
				text-transform: uppercase;
				margin: 0;
				padding: 0;
				text-align: center;
				text-shadow: 2px 2px 0 #000;
			}

			button {
				width: 60px;
				height: 28px;
				position: relative;
				z-index: 999;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 26px;
				text-transform: uppercase;
				cursor: pointer;
				border-radius: 0;
				color: white;
				background: rgba(0, 0, 0, 0.2);
				border: 2px solid #000;
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

			.prev-next {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				gap: 8px;
			}
		}

		.menu {
			align-items: center;
			height: 33px;
			width: 100%;
			justify-content: center;
			align-content: center;
			flex-wrap: wrap;
			background: #0d2538;
			border-top: 2px solid #000;

			.wrapper {
				display: flex;
				flex-direction: row;
				align-items: flex-start;
				padding: 2px 3px 3px 3px;
				border-radius: 0;
				position: relative;
			}

			.indicator {
				content: '';
				width: 130px;
				height: 28px;
				background: #ffd700;
				position: absolute;
				top: 2px;
				left: 2px;
				z-index: 9;
				border: 2px solid #000;
				box-shadow: none;
				border-radius: 0;
				transition: all 0.2s ease-out;
			}

			.tab {
				width: 130px;
				height: 28px;
				position: absolute;
				z-index: 99;
				outline: none;
				opacity: 0;
			}

			.tab_label {
				width: 130px;
				height: 28px;

				position: relative;
				z-index: 999;

				display: flex;
				align-items: center;
				justify-content: center;

				border: 0;

				color: #fff;
				font-size: 26px;
				opacity: 1;
				text-transform: uppercase;
				cursor: pointer;
				text-shadow: 1px 1px 0 #000;
			}

			.tab--1:checked ~ .indicator {
				left: 2px;
			}

			.tab--2:checked ~ .indicator {
				left: calc(130px + 2px);
			}

			.tab--3:checked ~ .indicator {
				left: calc(130px * 2 + 2px);
			}

			/* Change text color for selected tab */
			.tab:checked + .tab_label {
				color: #000;
				text-shadow: none;
			}
		}
	}
</style>
