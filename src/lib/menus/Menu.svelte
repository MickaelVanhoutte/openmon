<script lang="ts">
	import type { GameContext } from '../../js/context/gameContext';
	import Bag from './bag/Bag.svelte';
	import Boxes from './boxes/Boxes.svelte';
	import Pokedex from './pokedex/Pokedex.svelte';
	import PokemonList from './pokemon-list/PokemonList.svelte';
	import PokemonSummary from './pokemon-list/PokemonSummary.svelte';
	import Trainer from './trainer/Trainer.svelte';

	interface Props {
		context: GameContext;
	}

	const { context }: Props = $props();

	const isBattle = false;

	// Local reactive state that subscribes to Svelte stores
	let pokemonListOpened = $state(false);
	let openSummary = $state(false);
	let bagOpened = $state(false);
	let boxOpened = $state(false);
	let trainerOpened = $state(false);
	let pokedexOpened = $state(false);

	// Subscribe to stores - this is the key fix for Svelte 5 reactivity
	$effect(() => {
		const menus = context.overWorldContext.menus;

		const unsubs = [
			menus.pokemonListOpened$.subscribe((v) => {
				pokemonListOpened = v;
			}),
			menus.openSummary$.subscribe((v) => {
				openSummary = v;
			}),
			menus.bagOpened$.subscribe((v) => {
				bagOpened = v;
			}),
			menus.boxOpened$.subscribe((v) => {
				boxOpened = v;
			}),
			menus.trainerOpened$.subscribe((v) => {
				trainerOpened = v;
			}),
			menus.pokedexOpened$.subscribe((v) => {
				pokedexOpened = v;
			})
		];

		return () => unsubs.forEach((unsub) => unsub());
	});
</script>

{#if pokemonListOpened}
	<PokemonList {context} {isBattle} onChange={() => 0} zIndex={10} onCombo={() => {}} />
{/if}

{#if openSummary && !pokemonListOpened && !boxOpened}
	<PokemonSummary
		{context}
		selected={context.overWorldContext.menus.summaryIndex}
		{isBattle}
		zIndex={20}
		pkmnList={context.player.monsters}
	/>
{/if}

{#if bagOpened}
	<Bag {context} {isBattle} zIndex={10} />
{/if}

{#if boxOpened}
	<Boxes {context} />
{/if}

{#if trainerOpened}
	<Trainer {context} />
{/if}

{#if pokedexOpened}
	<Pokedex {context} />
{/if}

<style lang="scss">
</style>
