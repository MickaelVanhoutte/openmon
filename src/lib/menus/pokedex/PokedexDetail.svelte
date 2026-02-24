<script lang="ts">
	import { onMount } from 'svelte';
	import { Howl } from 'howler';
	import { typeChart } from '../../../js/battle/battle-model';
	import type { GameContext } from '../../../js/context/gameContext';
	import { PokedexEntry } from '../../../js/pokemons/pokedex';
	import { getCryPath } from '../../../js/pokemons/cry-utils';
	import PokedexMore from './PokedexMore.svelte';
	import PokedexMoves from './PokedexMoves.svelte';
	import PokedexStats from './PokedexStats.svelte';

	interface Props {
		pokemon: PokedexEntry;
		selectedIdx: number;
		filtered: PokedexEntry[];
		detailOpened: boolean;
	}

	let {
		pokemon,
		selectedIdx = $bindable(),
		filtered = $bindable(),
		detailOpened = $bindable()
	}: Props = $props();

	const tabs = {
		1: 'Stats',
		2: 'More',
		3: 'Moves'
	};
	let currentTab: 1 | 2 | 3 = $state(1);

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

	function playCry() {
		const path = getCryPath(pokemon.name);
		const howl = new Howl({
			src: [path],
			volume: 0.5
		});
		howl.play();
	}

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'ArrowLeft') {
			const tab: 1 | 2 | 3 = currentTab === 1 ? 3 : ((currentTab - 1) as 1 | 2 | 3);
			selectTab(tab);
		} else if (e.key === 'ArrowRight') {
			const tab: 1 | 2 | 3 = currentTab === 3 ? 1 : ((currentTab + 1) as 1 | 2 | 3);
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
			<button onclick={() => back()} aria-label="Go back">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
					></path></svg
				>
			</button>
		</div>

		<div class="name-with-cry">
			<h1>{pokemon.name}</h1>
			<button class="cry-btn" onclick={() => playCry()} aria-label="Play cry">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M13 7.22L9.603 10H6v4h3.603L13 16.78V7.22zM5.889 16H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1.889l4.294-3.435A.5.5 0 0 1 11 5v14a.5.5 0 0 1-.817.385L5.89 16zm14.525-4a6.5 6.5 0 0 1-1.525 4.196l-1.41-1.41A4.5 4.5 0 0 0 18.5 12a4.5 4.5 0 0 0-1.021-2.786l1.41-1.41A6.5 6.5 0 0 1 20.414 12zm-3.535 0a3 3 0 0 1-.707 1.957l-1.415-1.414A1 1 0 0 0 15 12a1 1 0 0 0-.243-.657l1.415-1.414A3 3 0 0 1 16.879 12z"
					/>
				</svg>
			</button>
		</div>
		<div class="prev-next">
			<button onclick={() => previous()} aria-label="Previous Pokemon">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path d="M12 8L18 14H6L12 8Z"></path></svg
				>
			</button>
			<button onclick={() => next()} aria-label="Next Pokemon">
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
		<div class="wrapper" data-tab={currentTab}>
			<button class="tab_label" onclick={() => selectTab(1)} aria-pressed={currentTab === 1}>Stats</button>
			<button class="tab_label" onclick={() => selectTab(2)} aria-pressed={currentTab === 2}>More</button>
			<button class="tab_label" onclick={() => selectTab(3)} aria-pressed={currentTab === 3}>Moves</button>
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
		background: var(--pixel-bg-panel);
		border: 2px solid var(--pixel-border-color);
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		color: var(--pixel-text-white);
		z-index: 10;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;

		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			width: 100%;
		}

		.title {
			width: 100%;
			height: 46px;
			gap: 6%;
			padding: 0 2%;
			margin: 0;
			box-sizing: border-box;
			background: var(--pixel-bg-header);
			border-bottom: 2px solid var(--pixel-border-color);

			h1 {
				font-size: 36px;
				text-transform: uppercase;
				margin: 0;
				padding: 0;
				text-align: center;
				text-shadow: 2px 2px 0 var(--pixel-border-color);
			}

			.name-with-cry {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 8px;
			}

			.cry-btn {
				width: 32px;
				height: 32px;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				border-radius: 0;
				color: white;
				background: rgba(0, 0, 0, 0.2);
				border: 2px solid #000;
				padding: 4px;
				flex-shrink: 0;

				svg {
					width: 20px;
					height: 20px;
				}

				&:hover {
					background: rgba(255, 255, 255, 0.2);
				}
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
			width: calc(100% + 4px);
			margin-left: -2px;
			margin-bottom: -2px;
			justify-content: center;
			align-content: center;
			flex-wrap: wrap;
			background: var(--pixel-border-alt);
			border-top: 2px solid var(--pixel-border-color);
			margin-top: auto;
			box-sizing: border-box;

			.wrapper {
				display: flex;
				flex-direction: row;
				align-items: flex-start;
				width: 100%;
				padding: 2px 0 3px 0;
				border-radius: 0;
				position: relative;
			}

			.indicator {
				content: '';
				width: calc(100% / 3);
				height: 28px;
				background: var(--pixel-text-gold);
				position: absolute;
				top: 2px;
				left: 0;
				z-index: 9;
				border: 2px solid #000;
				box-shadow: none;
				border-radius: 0;
				transition: all 0.2s ease-out;
			}

			.tab_label {
				flex: 1;
				height: 28px;

				position: relative;
				z-index: 999;

				display: flex;
				align-items: center;
				justify-content: center;

				border: 0;
				background: transparent;

				color: #fff;
				font-size: 26px;
				opacity: 1;
				text-transform: uppercase;
				cursor: pointer;
				text-shadow: 1px 1px 0 #000;

				&[aria-pressed='true'] {
					color: #000;
					text-shadow: none;
				}
			}

			.wrapper[data-tab='1'] .indicator {
				left: 0;
			}

			.wrapper[data-tab='2'] .indicator {
				left: calc(100% / 3);
			}

			.wrapper[data-tab='3'] .indicator {
				left: calc(100% / 3 * 2);
			}
		}
	}
</style>
