<script lang="ts">
	import type { GameContext } from '../../js/context/gameContext';
	import { MenuType } from '../../js/context/overworldContext';
	import type { SavesHolder } from '../../js/context/savesHolder';
	import Bag from './bag/Bag.svelte';
	import Boxes from './boxes/Boxes.svelte';
	import Pokedex from './pokedex/Pokedex.svelte';
	import PokemonList from './pokemon-list/PokemonList.svelte';
	import PokemonSummary from './pokemon-list/PokemonSummary.svelte';
	import Trainer from './trainer/Trainer.svelte';

	export let context: GameContext;
	export let savesHolder: SavesHolder;

	const isBattle = false;

	function open(type: MenuType) {
		context.overWorldContext.openMenu(type);
	}

	function save() {
		savesHolder.persist(context.toSaveContext());
		context.notifications.notify('Game successfully saved');
		context.overWorldContext.closeMenu(MenuType.MAIN);
	}

	function close() {
		context.overWorldContext.closeMenu(MenuType.MAIN);
	}
</script>

{#if context.overWorldContext.menus.pokemonListOpened}
	<PokemonList bind:context {isBattle} onChange={() => 0} zIndex={10} onCombo={() => {}} />
{/if}

{#if context.overWorldContext.menus.openSummary && !context.overWorldContext.menus.pokemonListOpened}
	<PokemonSummary
		bind:context
		bind:selected={context.overWorldContext.menus.summaryIndex}
		{isBattle}
		zIndex={20}
		bind:pkmnList={context.player.monsters}
	/>
{/if}

{#if context.overWorldContext.menus.bagOpened}
	<Bag bind:context {isBattle} zIndex={10} />
{/if}

{#if context.overWorldContext.menus.boxOpened}
	<Boxes bind:context />
{/if}

{#if context.overWorldContext.menus.trainerOpened}
	<Trainer bind:context />
{/if}

{#if context.overWorldContext.menus.pokedexOpened}
	<Pokedex bind:context />
{/if}

{#if context.overWorldContext.menus.menuOpened}
	<div class="menu-wrapper">
		<div class="menu-container">
			{#if context.isMenuAvailable(MenuType.POKEDEX)}
				<button class="menu-item" on:click={() => open(MenuType.POKEDEX)}>Pokedex</button>
			{/if}
			{#if context.isMenuAvailable(MenuType.POKEMON_LIST)}
				<button class="menu-item" on:click={() => open(MenuType.POKEMON_LIST)}>Pokemon</button>
			{/if}
			{#if context.isMenuAvailable(MenuType.BAG)}
				<button class="menu-item" on:click={() => open(MenuType.BAG)}>Bag</button>
			{/if}
			{#if context.isMenuAvailable(MenuType.TRAINER)}
				<button class="menu-item" on:click={() => open(MenuType.TRAINER)}>Trainer</button>
			{/if}
			{#if context.isMenuAvailable(MenuType.BOX)}
				<button class="menu-item" on:click={() => open(MenuType.BOX)}>Boxes</button>
			{/if}
			{#if context.isMenuAvailable(MenuType.MAP)}
				<button class="menu-item" on:click={() => open(MenuType.MAP)}>Map</button>
			{/if}
			<button class="menu-item" on:click={save}>Save</button>
			<button class="menu-item" on:click={close}>Exit</button>
		</div>
	</div>
{/if}

<style lang="scss">
	.menu-wrapper {
		position: absolute;
		top: 0;
		right: 0;
		height: 100%;
		display: flex;
		align-items: center;
		padding-right: 20px;
		z-index: 50;
		pointer-events: none;
	}

	.menu-container {
		background: #143855;
		border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		padding: 8px;
		display: flex;
		flex-direction: column;
		pointer-events: auto;
		min-width: 160px;
	}

	.menu-item {
		background: #1c4b72;
		border: 2px solid #000;
		padding: 12px 16px;
		margin: 4px 0;
		min-height: 44px;
		color: #ffffff;
		font-family: inherit;
		font-size: 16px;
		text-align: left;
		width: 100%;
		box-sizing: border-box;

		&:hover {
			filter: brightness(1.1);
			cursor: pointer;
		}

		&.selected,
		&:focus {
			border: 3px solid #ffd700;
			outline: none;
			margin: 3px -1px; /* Adjust for border width change to prevent layout shift */
		}
	}
</style>
