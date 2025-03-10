<script lang="ts">
	import { onMount } from 'svelte';
	import { backInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import PokemonList from '../pokemon-list/PokemonList.svelte';
	import { PokemonInstance } from '../../../js/pokemons/pokedex';
	import { Bag } from '../../../js/items/bag';
	import { Pokeball } from '../../../js/items/items';
	import type { GameContext } from '../../../js/context/gameContext';
	import { UseItemAction } from '../../../js/items/items-model';
	import { MenuType } from '../../../js/context/overworldContext';

	export let context: GameContext;
	export let isBattle = false;
	export let battleBagOpened: boolean = false;
	export let selectedMons: number | undefined = undefined;
	export let zIndex: number;
	export let onChange: (item: UseItemAction) => void = () => {};

	let list: HTMLUListElement;

	let openOptions = false;
	let optionSelected = 0;

	let openPokemonList = false;

	let tab = 0;
	const tabs = {
		0: 'HEALING',
		1: 'REVIVE',
		2: 'POKEBALLS'
	};

	const categories = {
		0: 'potions',
		1: 'revives',
		2: 'balls'
	};

	let selected = 0;
	$: pocket = Object.keys(context.player.bag[categories[tab]])?.map((id) => [
		id,
		context.player.bag[categories[tab]][id]
	]);
	$: itemToUse = (pocket && pocket[selected]?.[0]) || undefined;

	function back() {
		if (isBattle) {
			battleBagOpened = false;
		} else {
			context.overWorldContext.closeMenu(MenuType.BAG);
		}
	}

	function use(pkmn?: PokemonInstance) {
		openOptions = false;

		let item = pocket[selected][0];
		let instance = context.ITEMS.getItem(item)?.instanciate();

		if (isBattle && !(instance instanceof Pokeball) && !pkmn) {
			openPokemonList = true;
		} else if (isBattle && instance instanceof Pokeball) {
			onChange(new UseItemAction(item));
		} else if (isBattle && pkmn !== undefined) {
			onChange(new UseItemAction(item, pkmn));
		} else if (!isBattle) {
			if (selectedMons !== undefined) {
				context.player.bag.use(item, context.ITEMS, context.player.monsters[selectedMons]);
				context.player.bag = new Bag(context.player.bag);
				back();
			} else {
				openPokemonList = true;
			}
		}
	}

	function changeTab(number: number) {
		tab = number;
		selected = 0;
	}

	function consumeItem() {
		context.player.bag[categories[tab]][itemToUse]--;
		if (context.player.bag[categories[tab]][itemToUse] === 0) {
			delete context.player.bag[categories[tab]][itemToUse];
		}
		//openPokemonList = false;
	}

	const listener = (e: KeyboardEvent) => {
		if (!openOptions) {
			if (e.key === 'ArrowRight') {
				tab = (tab + 1) % 3;
				selected = 0;
			} else if (e.key === 'ArrowLeft') {
				tab = (tab + 2) % 3;
				selected = 0;
			} else if (e.key === 'ArrowUp') {
				selected = (selected + pocket.length - 1) % pocket.length;
				if (selected === pocket.length - 1) {
					list.scroll({
						top: list.clientHeight - list.children[0].clientHeight,
						behavior: 'smooth'
					});
				}
			} else if (e.key === 'ArrowDown') {
				selected = (selected + 1) % pocket.length;
				if (selected === 0) {
					list.scroll({ top: 0, behavior: 'smooth' });
				}
			} else if (e.key === 'Enter') {
				openOptions = true;
			} else if (e.key === 'Escape') {
				back();
			}
		} else {
			e.preventDefault();
			if (e.key === 'ArrowUp') {
				optionSelected = optionSelected === 0 ? 1 : optionSelected - 1;
			} else if (e.key === 'ArrowDown') {
				optionSelected = optionSelected === 1 ? 0 : optionSelected + 1;
			} else if (e.key === 'Enter') {
				if (optionSelected === 0) {
					use();
				} else if (optionSelected === 1) {
					openOptions = false;
				}
			} else if (e.key === 'Escape') {
				openOptions = false;
				optionSelected = 0;
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
	class="bag"
	style="--zIndex: {zIndex}"
	in:slide={{ duration: 500, delay: 100, axis: 'x', easing: backInOut }}
	out:fade
>
	<nav class="nav">
		<div class="nav-left">
			<a class="brand">BAG</a>
			<div class="tabs">
				<a class:active={tab === 0} on:click={() => changeTab(0)}
					>{tabs[0].replace('$POKEMON', '')}</a
				>
				<a class:active={tab === 1} on:click={() => changeTab(1)}
					>{tabs[1].replace('$POKEMON', '')}</a
				>
				<a class:active={tab === 2} on:click={() => changeTab(2)}
					>{tabs[2].replace('$POKEMON', '')}</a
				>
			</div>
		</div>
		<div class="nav-right">
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
		<div class="item-desc">
			<div class="content">
				<p>{context.ITEMS.getItem(itemToUse)?.name || ''}</p>
				<p>{context.ITEMS.getItem(itemToUse)?.description || ''}</p>
			</div>
		</div>

		<div class="item-list">
			<ul bind:this={list}>
				{#each pocket as [id, qty], idx}
					<li>
						<div
							class="item"
							class:selected={selected === idx}
							on:click={() => {
								selected = idx;
								openOptions = true;
							}}
						>
							<span>{context.ITEMS.getItem(id)?.name}</span>
							<span>x {qty}</span>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="options" class:hidden={!openOptions}>
		<ul>
			<li class:selected={optionSelected === 0} on:click={() => use()}>USE</li>
			<li class:selected={optionSelected === 1} on:click={() => (openOptions = false)}>CANCEL</li>
		</ul>
	</div>
</div>

{#if openPokemonList}
	<PokemonList
		bind:context
		bind:isBattle
		bind:itemToUse
		onChange={(pkmn) => use(pkmn)}
		onCombo={() => {}}
		zIndex={zIndex + 1}
	/>
{/if}

<style lang="scss">
	.bag {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		//background-image: url('src/assets/menus/p-sum.jpg');
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
		z-index: var(--zIndex, 8);

		.nav {
			height: 46px;
			width: 100%;

			display: flex;
			align-items: center;

			background-color: #0078c0;
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

				&.active {
					color: #68c0c8;
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
					right: 1%;
					background: none;
					font-size: 32px;
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
					border-radius: 0 50px 50px 0;
				}

				span:not(.arrow) {
					height: 26px;
					width: 18px;
					background-color: #0078c0;
					border-radius: 16px;
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
			background-color: rgba(0, 0, 0, 0.3);
			background-blend-mode: soft-light;

			display: flex;
			gap: 2%;

			.item-desc {
				height: 100%;
				width: 50%;
				padding: 1%;
				box-sizing: border-box;
				font-size: 32px;
				color: white;
				text-shadow: 1px 1px 1px black;

				.content {
					display: flex;
					flex-direction: column;
					height: 100%;
					align-items: center;
					justify-content: center;
					padding: 4%;
					box-sizing: border-box;
					background: rgba(0, 0, 0, 0.5);
					border-radius: 8px;
				}
			}

			.item-list {
				max-height: 100%;
				width: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 32px;
				color: white;
				text-shadow: 1px 1px 1px black;
				padding: 2%;

				ul {
					list-style: none;
					margin: 0;
					display: flex;
					flex-direction: column;
					width: 100%;
					height: 100%;
					overflow-y: scroll;
					padding: 2%;
					box-sizing: border-box;

					scrollbar-width: thin;
					scrollbar-color: #68c0c8 #0e2742f0;

					li {
						display: flex;
						width: 100%;
						align-items: center;
						justify-content: center;
					}

					.item {
						display: flex;
						width: 100%;
						justify-content: space-between;
						padding: 2%;

						&.selected {
							// underline
							border-bottom: 2px solid rgba(255, 255, 255, 0.5);
						}
					}
				}
			}
		}

		.options {
			position: absolute;
			font-size: 32px;
			font-weight: 500;
			text-align: left;
			bottom: 1%;
			right: 1%;
			padding: 22px 36px 22px 36px;
			background: rgb(220, 231, 233);
			background: linear-gradient(
				180deg,
				rgba(220, 231, 233, 1) 0%,
				rgba(255, 255, 255, 1) 50%,
				rgba(220, 231, 233, 0.713344712885154) 100%
			);
			border: 2px solid #54506c;
			border-radius: 8px;
			box-sizing: border-box;
			transition: bottom 0.3s ease-in-out;

			&.hidden {
				bottom: -100dvh;
			}

			ul {
				margin: 0;
				padding: 0;
				list-style: none;
				display: flex;
				flex-direction: column;
				gap: 16px;

				li {
					&.selected {
						&:before {
							content: '';
							width: 0;
							height: 0;
							border-top: 12px solid transparent;
							border-bottom: 12px solid transparent;
							border-left: 12px solid #262626;
							position: absolute;
							left: 5px;
							margin-top: 2px;
						}
					}
				}
			}
		}
	}
</style>
