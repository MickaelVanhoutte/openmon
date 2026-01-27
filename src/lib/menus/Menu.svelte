<script lang="ts">
	import type { GameContext } from '../../js/context/gameContext';
	import Bag from './bag/Bag.svelte';
	import Boxes from './boxes/Boxes.svelte';
	import Pokedex from './pokedex/Pokedex.svelte';
	import PokemonList from './pokemon-list/PokemonList.svelte';
	import PokemonSummary from './pokemon-list/PokemonSummary.svelte';
	import Trainer from './trainer/Trainer.svelte';

	export let context: GameContext;

	const isBattle = false;
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

<style lang="scss">
</style>
