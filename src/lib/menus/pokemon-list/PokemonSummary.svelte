<script lang="ts">
	import { onMount } from 'svelte';
	import PokemonInfo from './PokemonInfo.svelte';
	import PokemonStats from './PokemonStats.svelte';
	import PokemonSkills from './PokemonSkills.svelte';
	import type { PokemonInstance } from '../../../js/pokemons/pokedex';
	import { fade, slide } from 'svelte/transition';
	import { backInOut } from 'svelte/easing';
	import type { GameContext } from '../../../js/context/gameContext';
	import { MenuType } from '../../../js/context/overworldContext';

	export let context: GameContext;
	export let selected: number;
	export let selectedMove = 0;
	export let statEdit = false;
	export let moveEdit = false;
	export let isBattle: boolean;
	export let battleSummaryOpened = false;
	export let pkmnList: (PokemonInstance | undefined)[];

	export let zIndex: number;
	$: zIndexNext = zIndex + 1;

	let tab = 0;
	//let pkmnList: PokemonInstance[] = context.player.monsters;

	const tabs: Record<number, string> = {
		0: '$POKEMON INFO',
		1: '$POKEMON STATS',
		2: '$POKEMON MOVES'
	};

	$: filteredList = <Array<PokemonInstance>>pkmnList.filter((pkmn) => pkmn !== undefined);
	$: selectedMons = filteredList[selected];
	$: evs = selectedMons.evs;

	function back() {
		if (statEdit) {
			statEdit = false;
			return;
		} else if (moveEdit) {
			moveEdit = false;
			return;
		} else {
			if (isBattle) {
				battleSummaryOpened = false;
			} else {
				context.overWorldContext.closeMenu(MenuType.SUMMARY);
			}
		}
	}

	function previous() {
		selectedMove = 0;
		statEdit = false;
		selected = selected === 0 ? filteredList.length - 1 : selected - 1;
	}

	function next() {
		selectedMove = 0;
		statEdit = false;
		selected = selected === filteredList.length - 1 ? 0 : selected + 1;
	}

	const listener = (e: KeyboardEvent) => {
		if (context.overWorldContext.menus.openSummary || battleSummaryOpened) {
			if (e.key === 'ArrowRight') {
				tab = (tab + 1) % 3;
			} else if (e.key === 'ArrowLeft') {
				tab = (tab + 2) % 3;
			} else if (e.key === 'Escape') {
				back();
			}

			if (tab === 2) {
				if (e.key === 'ArrowDown') {
					selectedMove = (selectedMove + 1) % selectedMons.moves.length;
				} else if (e.key === 'ArrowUp') {
					selectedMove = (selectedMove + selectedMons.moves.length - 1) % selectedMons.moves.length;
				}
			} else {
				if (e.key === 'ArrowDown') {
					next();
				} else if (e.key === 'ArrowUp') {
					previous();
				}
			}
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
	class="screen"
	style="--zIndex:{zIndex}"
	in:slide={{ duration: 500, delay: 100, axis: 'x', easing: backInOut }}
	out:fade
>
	<nav class="nav">
		<div class="nav-left">
			<a class="brand">{selectedMons.name}</a>
			<div class="tabs">
				<a class:active={tab === 0} on:click={() => (tab = 0)}>{tabs[0].replace('$POKEMON', '')}</a>
				<a class:active={tab === 1} on:click={() => (tab = 1)}>{tabs[1].replace('$POKEMON', '')}</a>
				<a class:active={tab === 2} on:click={() => (tab = 2)}>{tabs[2].replace('$POKEMON', '')}</a>
			</div>
		</div>
		<div class="nav-right">
			<button class="previous" on:click={() => previous()}>
				<span class="arrow"></span>
			</button>
			<button class="next" on:click={() => next()}>
				<span class="arrow"></span>
			</button>

			<button class="back" on:click={() => back()}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
					></path></svg
				>
			</button>
		</div>
	</nav>

	<div class="tab-content">
		{#if tab === 0}
			<PokemonInfo
				bind:context
				bind:selected
				bind:zIndex={zIndexNext}
				bind:pkmnList={filteredList}
			/>
		{:else if tab === 1}
			<PokemonStats
				bind:context
				bind:selected
				bind:statEdit
				bind:isBattle
				bind:zIndex={zIndexNext}
				bind:pkmnList={filteredList}
			/>
		{:else if tab === 2}
			<PokemonSkills
				bind:context
				bind:selected
				bind:selectedMove
				bind:moveEdit
				bind:zIndex={zIndexNext}
				bind:pkmnList={filteredList}
			/>
		{/if}
	</div>
</div>

<style lang="scss">
	.screen {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;
		width: 100dvw;
		height: 100dvh;
		z-index: var(--zIndex, 10);
		background-color: rgb(0, 29, 43);

		.nav {
			height: 46px;
			width: 100%;

			display: flex;
			align-items: center;

			background-color: #0088cc;
			border-bottom: 2px solid #000;
			font-size: 32px;
			color: white;
			text-shadow: 1px 1px 1px black;

			.nav-left {
				width: 72dvw;
				color: white;

				.brand {
					flex: unset;
					font-size: 36px;
					width: 40%;
					color: white;
				}
			}
			.nav-right {
				width: 28dvw;
				display: flex;
				justify-content: space-between;
				justify-content: flex-end;
				gap: 12%;
			}

			.tabs a {
				color: white;
				border: none;
				padding-bottom: 4px;
				border-bottom: 3px solid transparent;

				&.active {
					color: #68c0c8;
					border-bottom: 3px solid #ffd700;
				}
			}

			button {
				background-color: #68c0c8;
				border: none;
				width: 80px;
				height: 46px;
				display: flex;
				align-items: center;
				justify-content: center;
				z-index: 1;

				-webkit-touch-callout: none;
				-webkit-user-select: none;
				-khtml-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				user-select: none;
				-webkit-tap-highlight-color: rgba(0, 0, 0, 0);

				touch-action: pan-x pan-y;
				outline: none;

				&.back {
					font-family: pokemon, serif;
					background: none;
					font-size: 20px;
					color: white;
					text-shadow: 1px 1px 1px black;

					svg {
						height: 70%;
					}
				}

				&.previous,
				&.next {
					background: none;
					font-size: 32px;
					color: white;
					text-align: center;
					z-index: 9;

					span.arrow {
						border: solid white;
						border-width: 0 5px 5px 0;
						display: inline-block;
						padding: 5px;
					}
				}

				&.previous {
					right: 14%;
					width: 40px;

					.arrow {
						transform: rotate(-135deg);
						-webkit-transform: rotate(-135deg);
						margin-top: 5px;
					}
				}

				&.next {
					right: 20%;
					width: 40px;

					.arrow {
						transform: rotate(45deg);
						-webkit-transform: rotate(45deg);
						margin-bottom: 5px;
					}
				}

				&:nth-child(4) {
					border-radius: 0;
				}

				span:not(.arrow) {
					height: 26px;
					width: 18px;
					background-color: #0078c0;
					border-radius: 0;
					position: absolute;
					z-index: 9;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
			}
		}

		.tab-content {
			height: calc(100% - 46px);
			width: 100%;
			box-sizing: border-box;
			background: transparent;
			color: #fff;
		}
	}
</style>
