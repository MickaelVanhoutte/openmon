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

	interface Props {
		context: GameContext;
		isBattle?: boolean;
		battleBagOpened?: boolean;
		selectedMons?: number | undefined;
		zIndex: number;
		onChange?: (item: UseItemAction) => void;
	}

	let {
		context = $bindable(),
		isBattle = false,
		battleBagOpened = $bindable(false),
		selectedMons = undefined,
		zIndex,
		onChange = () => {}
	}: Props = $props();

	let list: HTMLUListElement | undefined = $state(undefined);

	let openOptions = $state(false);
	let optionSelected = $state(0);

	let openPokemonList = $state(false);

	let tab = $state(0);
	const tabs: Record<number, string> = {
		0: 'HEALING',
		1: 'REVIVE',
		2: 'POKEBALLS',
		3: 'HELD ITEMS'
	};

	const categories: Record<number, string> = {
		0: 'potions',
		1: 'revives',
		2: 'balls',
		3: 'heldItems'
	};

	let selected = $state(0);
	const pocket = $derived(
		Object.keys(
			context.player.bag[categories[tab] as 'balls' | 'potions' | 'revives' | 'heldItems']
		)?.map((id) => [
			id,
			context.player.bag[categories[tab] as 'balls' | 'potions' | 'revives' | 'heldItems'][id]
		])
	);
	let itemToUse = $derived(
		pocket && pocket[selected]?.[0] ? Number(pocket[selected][0]) : undefined
	);
	const isHeldItemTab = $derived(tab === 3);

	function getItemName(id: string | number | undefined): string {
		if (!id) return '';
		if (isHeldItemTab) {
			return context.ITEMS.getHeldItemById(Number(id))?.name || '';
		}
		return context.ITEMS.getItem(Number(id))?.name || '';
	}

	function getItemDescription(id: string | number | undefined): string {
		if (!id) return '';
		if (isHeldItemTab) {
			return context.ITEMS.getHeldItemById(Number(id))?.description || '';
		}
		return context.ITEMS.getItem(Number(id))?.description || '';
	}

	function back() {
		context.soundManager.playUISFX('cancel');
		if (isBattle) {
			battleBagOpened = false;
		} else {
			context.overWorldContext.closeMenu(MenuType.BAG);
		}
	}

	function use(pkmn?: PokemonInstance) {
		openOptions = false;
		context.soundManager.playUISFX('item-use');

		const item = pocket[selected][0];

		if (isHeldItemTab) {
			if (pkmn) {
				context.player.bag.giveHeldItem(Number(item), pkmn, context.ITEMS);
				context.player.bag = new Bag(context.player.bag);
				back();
			} else if (selectedMons !== undefined) {
				context.player.bag.giveHeldItem(
					Number(item),
					context.player.monsters[selectedMons],
					context.ITEMS
				);
				context.player.bag = new Bag(context.player.bag);
				back();
				context.overWorldContext.closeMenu(MenuType.POKEMON_LIST);
			} else {
				openPokemonList = true;
			}
			return;
		}

		const instance = context.ITEMS.getItem(Number(item))?.instanciate();

		if (isBattle && !(instance instanceof Pokeball) && !pkmn) {
			openPokemonList = true;
		} else if (isBattle && instance instanceof Pokeball) {
			onChange(new UseItemAction(Number(item)));
		} else if (isBattle && pkmn !== undefined) {
			onChange(new UseItemAction(Number(item), pkmn));
		} else if (!isBattle) {
			if (selectedMons !== undefined) {
				context.player.bag.use(Number(item), context.ITEMS, context.player.monsters[selectedMons]);
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
	}

	const listener = (e: KeyboardEvent) => {
		if (!openOptions) {
			if (e.key === 'ArrowRight') {
				tab = (tab + 1) % 4;
				selected = 0;
			} else if (e.key === 'ArrowLeft') {
				tab = (tab + 3) % 4;
				selected = 0;
			} else if (e.key === 'ArrowUp') {
				selected = (selected + pocket.length - 1) % pocket.length;
				if (selected === pocket.length - 1 && list) {
					list.scroll({
						top: list.clientHeight - list.children[0].clientHeight,
						behavior: 'smooth'
					});
				}
			} else if (e.key === 'ArrowDown') {
				selected = (selected + 1) % pocket.length;
				if (selected === 0 && list) {
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
	<nav class="nav" aria-label="Bag navigation">
		<div class="nav-left">
			<span class="brand">BAG</span>
			<div class="tabs" role="tablist">
				<button
					class:active={tab === 0}
					onclick={() => changeTab(0)}
					role="tab"
					aria-selected={tab === 0}
					type="button">{tabs[0].replace('$POKEMON', '')}</button
				>
				<button
					class:active={tab === 1}
					onclick={() => changeTab(1)}
					role="tab"
					aria-selected={tab === 1}
					type="button">{tabs[1].replace('$POKEMON', '')}</button
				>
				<button
					class:active={tab === 2}
					onclick={() => changeTab(2)}
					role="tab"
					aria-selected={tab === 2}
					type="button">{tabs[2].replace('$POKEMON', '')}</button
				>
				<button
					class:active={tab === 3}
					onclick={() => changeTab(3)}
					role="tab"
					aria-selected={tab === 3}
					type="button">{tabs[3].replace('$POKEMON', '')}</button
				>
			</div>
		</div>
		<div class="nav-right">
			<button class="back" onclick={() => back()} aria-label="Close bag">
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
				<p>{getItemName(itemToUse)}</p>
				<p>{getItemDescription(itemToUse)}</p>
			</div>
		</div>

		<div class="item-list">
			<ul bind:this={list}>
				{#each pocket as [id, qty], idx}
					<li>
						<button
							class="item-row"
							class:selected={selected === idx}
							onclick={() => {
								selected = idx;
								openOptions = true;
							}}
						>
							<span class="item-name">{getItemName(id)}</span>
							<span class="item-qty">x{qty}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="options" class:hidden={!openOptions} role="menu" aria-label="Item options">
		<ul>
			<li class:selected={optionSelected === 0} onclick={() => use()} role="menuitem" tabindex="0" onkeydown={(e) => e.key === 'Enter' ? use() : undefined}>
				{isHeldItemTab ? 'GIVE' : 'USE'}
			</li>
			<li
				class:selected={optionSelected === 1}
				onclick={() => (openOptions = false)}
				role="menuitem"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' ? (openOptions = false) : undefined}
			>
				CANCEL
			</li>
		</ul>
	</div>
</div>

{#if openPokemonList}
	<PokemonList
		{context}
		{isBattle}
		{itemToUse}
		onChange={(pkmn) => use(pkmn)}
		onCombo={() => {}}
		zIndex={zIndex + 1}
	/>
{/if}

<style lang="scss">
	@keyframes pixel-pulse {
		0% {
			border-color: var(--pixel-text-gold);
		}
		50% {
			border-color: var(--pixel-text-white);
		}
		100% {
			border-color: var(--pixel-text-gold);
		}
	}

	.bag {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		background: #282828;
		z-index: var(--zIndex, 8);

		.nav {
			height: 46px;
			width: 100%;

			display: flex;
			align-items: center;

			background-color: #54506c;
			border-bottom: 4px solid #2d2a3d;
			font-size: 32px;
			color: white;
			text-shadow: 2px 2px 0px #000;

			.nav-left {
				width: 72dvw;
				color: white;

				.brand {
					flex: unset;
					font-size: 36px;
					width: 40%;
					color: white;
					// Override Chota .nav .brand which adds padding: 1rem 2rem
					padding: 0 0 0 16px;
				}
			}
			.nav-right {
				width: 28dvw;
				display: flex;
				justify-content: flex-end;
				gap: 12%;
			}

			.tabs button {
				// Reset width/height overridden by the general nav button{} rule below
				width: auto;
				height: auto;
				color: var(--pixel-text-white);
				padding: 4px 12px;
				margin-right: 8px;
				cursor: pointer;
				text-decoration: none;

				background: var(--pixel-bg-header);
				border: 2px solid var(--pixel-border-color);
				min-height: 44px;
				display: inline-flex;
				align-items: center;
				white-space: nowrap;
				font-size: inherit;
				font-family: inherit;

				&.active {
					color: var(--pixel-text-white);
					border-bottom: 3px solid var(--pixel-text-gold);
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

			}
		}

		.tab-content {
			height: calc(100% - 46px);
			width: 100%;
			box-sizing: border-box;
			padding: 16px;

			display: flex;
			gap: 2%;

			.item-desc {
				height: 100%;
				width: 50%;
				box-sizing: border-box;
				font-size: 32px;

				.content {
					display: flex;
					flex-direction: column;
					height: 100%;
					align-items: flex-start;
					justify-content: flex-start;
					text-align: left;
					padding: 12px;
					background: var(--pixel-bg-panel);
					border: 2px solid var(--pixel-border-color);
					box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
					color: var(--pixel-text-white);
				}
			}

			.item-list {
				max-height: 100%;
				width: 50%;
				display: flex;
				align-items: flex-start;
				justify-content: flex-start;
				font-size: 32px;
				color: white;
				text-shadow: 2px 2px 0px #000;

				ul {
					list-style: none;
					margin: 0;
					display: flex;
					flex-direction: column;
					width: 100%;
					height: 100%;
					overflow-y: scroll;
					padding: 0;
					box-sizing: border-box;
					gap: 8px;

					scrollbar-width: thin;
					scrollbar-color: #54506c #282828;

					li {
						display: flex;
						width: 100%;
						align-items: center;
						justify-content: flex-start;
					}

					.item-row {
						height: 60px;
						display: flex;
						flex-direction: row;
						align-items: center;
						padding: 0 12px;
						background: var(--pixel-bg-panel);
						border: 2px solid var(--pixel-border-color);
						box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
						margin-bottom: 4px;
						width: 100%;
						box-sizing: border-box;
						cursor: pointer;
						font: inherit;
						color: inherit;
						text-align: left;

						.item-name {
							flex-grow: 1;
							text-align: left;
							color: var(--pixel-text-white);
						}

						.item-qty {
							font-family: monospace;
							color: var(--pixel-text-gold);
							text-align: right;
							min-width: 50px;
						}

						&.selected {
							border: 3px solid var(--pixel-text-gold);
							animation: pixel-pulse 1s ease-in-out infinite;
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
			bottom: 32px;
			right: 32px;
			padding: 16px 24px;
			background: var(--pixel-bg-panel);
			color: var(--pixel-text-white);
			border: 2px solid var(--pixel-border-color);
			box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
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
					padding-left: 24px;
					cursor: pointer;
					position: relative;

					&.selected {
						&:before {
							content: '';
							width: 0;
							height: 0;
							border-top: 10px solid transparent;
							border-bottom: 10px solid transparent;
							border-left: 10px solid var(--pixel-text-gold);
							position: absolute;
							left: 0;
							top: 50%;
							transform: translateY(-50%);
						}
					}
				}
			}
		}
	}
</style>
