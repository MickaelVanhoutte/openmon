<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { MoveInstance, PokemonInstance } from '../../js/pokemons/pokedex';
	import type { GameContext } from '../../js/context/gameContext';
	import { typeChart } from '../../js/battle/battle-model';
	import { BattleContext } from '../../js/context/battleContext';
	import { Attack, RunAway, Switch, UseItem } from '../../js/battle/actions/actions-selectable';
	import PokemonList from '../menus/pokemon-list/PokemonList.svelte';
	import Bag from '../menus/bag/Bag.svelte';
	import { Pokeball } from '../../js/items/items';
	import { MenuType, OverworldContext } from '../../js/context/overworldContext';

	export let context: GameContext;
	export let battleCtx: BattleContext;
	export let overWorldCtx: OverworldContext;
	let moveOpened = false;
	let show = false;

	let currentMessage: String | undefined;
	let disabled = false;
	let selectedMoveIdx = 0;
	let selectedOptionIdx = 0;

	let changePokemon = false;
	let isBattle = true;
	let battleBagOpened = false;
	let battleSwitchOpened = false;
	let zIndexNext = 10;

	battleCtx.currentMessage.subscribe((message) => {
		currentMessage = message;
	});
	battleCtx.isPlayerTurn.subscribe((isPlayerTurn) => {
		disabled = !isPlayerTurn;
	});

	function escape() {
		if (battleCtx) {
			battleCtx.startTurn(new RunAway(battleCtx.playerPokemon));
		}
	}

	function switchOpen() {
		//overWorldCtx.openMenu(MenuType.SWITCH);
		battleSwitchOpened = true;
	}

	function openBag() {
		//overWorldCtx.openMenu(MenuType.BAG);
		battleBagOpened = true;
	}

	function selectMove(idx: number) {
		selectedMoveIdx = idx;
	}

	function launchMove(idx: number, move: MoveInstance) {
		if (idx != selectedMoveIdx) {
			selectedMoveIdx = idx;
		} else if (battleCtx) {
			console.log('launching move', move);
			battleCtx.startTurn(new Attack(move, 'opponent', battleCtx.playerPokemon));
			moveOpened = false;
		}
	}

	/*
    Handle actions from menus (bag, switch)
     */

	function sendSwitchAction(newMonster: PokemonInstance) {
		battleSwitchOpened = false;
		if (battleCtx?.playerPokemon) {
			battleCtx?.startTurn(new Switch(newMonster, battleCtx.player));
		}
	}

	function send(pokemon: PokemonInstance) {
		// TODO this code should be in the battle state
		if (battleCtx && battleCtx?.playerPokemon) {
			let pkmnIndex = battleCtx.player.monsters.indexOf(pokemon);
			// exchange 0 and pkmnIndex in the array
			[battleCtx.player.monsters[0], battleCtx.player.monsters[pkmnIndex]] = [
				battleCtx.player.monsters[pkmnIndex],
				battleCtx.player.monsters[0]
			];
			battleCtx.playerPokemon = battleCtx.player.monsters[0];
			battleCtx.participants.add(battleCtx.playerPokemon);
			changePokemon = false;
			selectedOptionIdx = 0;
			selectedMoveIdx = 0;
			battleCtx.events.pokemonChange.set(battleCtx.player);
			battleCtx.currentMessage.set(`What should ${battleCtx.playerPokemon.name} do?`);
			//BATTLE_STATE.set(new BattleContext(battleState));
			//battleLoopContext.allydrawn = false;
		}
	}

	function sendObjectAction(result: { item: number; target?: PokemonInstance }) {
		battleBagOpened = false;
		let itm = context.ITEMS.getItem(result.item)?.instanciate();
		if (result.target && battleCtx) {
			if (itm && battleCtx && itm.doesApply(result.target, battleCtx?.playerPokemon, battleCtx)) {
				battleCtx?.startTurn(
					new UseItem(result.item, result.target, battleCtx.playerPokemon, battleCtx.player)
				);
				overWorldCtx.closeMenu(MenuType.BAG);
			} else {
				//TODO message
				alert('This item cannot be used here');
			}
		} else if (
			itm instanceof Pokeball &&
			battleCtx &&
			itm.doesApply(battleCtx.opponentPokemon, battleCtx.playerPokemon, battleCtx)
		) {
			battleCtx?.startTurn(
				new UseItem(
					result.item,
					battleCtx.opponentPokemon,
					battleCtx.playerPokemon,
					battleCtx.player
				)
			);
			overWorldCtx.closeMenu(MenuType.BAG);
		} else {
			//TODO message
			alert('This item cannot be used here');
		}
	}

	const listener = (e: KeyboardEvent) => {
		if (!battleCtx) {
			return;
		}
		if (
			!context.overWorldContext.menus.bagOpened &&
			!context.overWorldContext.menus.switchOpened &&
			!disabled
		) {
			if (e.key === 'ArrowUp') {
				if (moveOpened) {
					selectedMoveIdx =
						selectedMoveIdx === 0 ? battleCtx.playerPokemon.moves.length - 1 : selectedMoveIdx - 1;
				} else {
					selectedOptionIdx = selectedOptionIdx === 0 ? 3 : selectedOptionIdx - 1;
				}
			} else if (e.key === 'ArrowDown') {
				if (moveOpened) {
					selectedMoveIdx =
						selectedMoveIdx === battleCtx.playerPokemon.moves.length - 1 ? 0 : selectedMoveIdx + 1;
				} else {
					selectedOptionIdx = selectedOptionIdx === 3 ? 0 : selectedOptionIdx + 1;
				}
			} else if (e.key === 'Enter') {
				if (moveOpened) {
					launchMove(selectedMoveIdx, battleCtx.playerPokemon.moves[selectedMoveIdx]);
				} else {
					if (selectedOptionIdx === 0) {
						moveOpened = true;
					} else if (selectedOptionIdx === 1) {
						openBag();
					} else if (selectedOptionIdx === 2) {
						switchOpen();
					} else if (selectedOptionIdx === 3) {
						escape();
					}
				}
			} else if (e.key === 'Escape') {
				moveOpened = false;
			}
		}
	};

	onMount(() => {
		show = true;
		window.addEventListener('keydown', listener);

		battleCtx.events.playerPokemonFaint.subscribe((pkmn) => {
			if (pkmn) {
				changePokemon = true;
			}
		});
	});

	onDestroy(() => {
		window.removeEventListener('keydown', listener);
	});
</script>

<!-- <div class="action-bar" class:show> -->
<div class="info" class:show class:move-desc-opened={moveOpened}>
	<div class="_inner">
		{#if !moveOpened}
			{currentMessage?.toUpperCase()}
		{:else}
			<div class="move-desc">
				<div class="_desc">
					<p>
						{battleCtx?.playerPokemon?.moves[selectedMoveIdx].description.replace(
							'$effect_chance',
							battleCtx?.playerPokemon?.moves[selectedMoveIdx].effectChance + '%'
						)}
					</p>
				</div>
				<div class="stats">
					<p>
						PP :
						{battleCtx?.playerPokemon?.moves[selectedMoveIdx].currentPp}
						/ {battleCtx?.playerPokemon?.moves[selectedMoveIdx].pp}
					</p>
					<p>Type : {battleCtx?.playerPokemon?.moves[selectedMoveIdx].category}</p>
					<p>
						Power/ACC
						{battleCtx?.playerPokemon?.moves[selectedMoveIdx].power}
						/ {battleCtx?.playerPokemon?.moves[selectedMoveIdx].accuracy} %
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if moveOpened}
	<div class="moves" class:show>
		<button class="back" on:click={() => (moveOpened = false)}> ◄ </button>
		{#each battleCtx?.playerPokemon?.moves as move, index}
			<button
				class="action-btn move"
				style="--color:{typeChart[move.type].color}"
				{disabled}
				class:selected={selectedMoveIdx === index}
				on:click={() => launchMove(index, move)}
			>
				<span class="move-type">
					<img src={`src/assets/types/${move.type}.svg`} alt={move.type} />
				</span>
				<span class="move-cat">
					<img src={`src/assets/moves-cat/${move.category}.png`} alt={move.category} />
				</span>
				{move.name.toUpperCase()}
			</button>
		{/each}
	</div>
{:else}
	<div class="actions" class:show>
		<button
			class="action-btn"
			style="--color:#dc5959"
			{disabled}
			on:click={() => (moveOpened = true)}
			class:selected={selectedOptionIdx === 0}
		>
			FIGHT
		</button>

		<button
			class="action-btn"
			style="--color:#eca859"
			{disabled}
			class:selected={selectedOptionIdx === 1}
			on:click={() => openBag()}
		>
			BAG
		</button>

		<button
			class="action-btn"
			style="--color:#7EAF53"
			{disabled}
			class:selected={selectedOptionIdx === 2}
			on:click={() => switchOpen()}
		>
			POKEMONS
		</button>

		<button
			class="action-btn"
			style="--color:#599bdc"
			{disabled}
			class:selected={selectedOptionIdx === 3}
			on:click={() => escape()}
		>
			RUN
		</button>
	</div>
{/if}
<!-- </div> -->

<!-- Menus -->
{#if battleSwitchOpened}
	<PokemonList
		bind:context
		{isBattle}
		bind:battleSwitchOpened
		zIndex={zIndexNext}
		onChange={(pkm) => !!pkm && sendSwitchAction(pkm)}
	/>
{/if}

{#if changePokemon}
	<PokemonList
		bind:context
		{isBattle}
		bind:forceChange={changePokemon}
		zIndex={zIndexNext}
		onChange={(pkm) => !!pkm && send(pkm)}
	/>
{/if}

{#if battleBagOpened}
	<Bag
		bind:context
		{isBattle}
		bind:battleBagOpened
		zIndex={zIndexNext}
		onChange={(result) => sendObjectAction(result)}
	/>
{/if}

<style lang="scss">
	@keyframes appear {
		from {
			bottom: -25%;
		}
		to {
			bottom: 1%;
		}
	}

	// .action-bar {
	// 	z-index: 7;
	// 	height: 25%;
	// 	width: 98%;
	// 	position: absolute;
	// 	bottom: -25%;
	// 	left: 1%;
	// 	transition: bottom 0.5s ease-in-out;
	// 	//text-shadow: 3px 3px 1px #bfecf7;
	// 	display: flex;
	// 	font-size: 26px;
	// 	animation: appear 0.5s ease-in forwards;

	.info {
		width: 49%;
		height: 15%;
		position: absolute;
		bottom: -20%;
		left: 1%;
		transition: bottom 0.5s ease-in-out;
		animation: appear 0.5s ease-in forwards;
		// background: rgb(220, 231, 233);
		// background: linear-gradient(
		// 	180deg,
		// 	rgba(220, 231, 233, 0.7) 0%,
		// 	rgba(255, 255, 255, 0.9) 50%,
		// 	rgba(220, 231, 233, 0.7) 100%
		// );
		border-radius: 12px;
		display: flex;
		align-items: center;
		align-content: center;
		justify-content: space-around;
		//position: relative;
		box-sizing: border-box;
		padding: 1%;

		// -webkit-box-shadow: 5px 10px 21px 7px #000000;
		// box-shadow: 5px 10px 21px 7px #000000;

		&.move-desc-opened {
			background: rgba(255, 255, 255, 0.6);
			height: 25%;
		}

		._inner {
			z-index: 1;
			height: 100%;

			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			text-transform: capitalize;
			text-align: center;
			box-sizing: border-box;

			.move-desc {
				text-transform: initial;
				text-align: left;
				font-size: 20px;
				word-break: break-word;
				box-sizing: border-box;
				padding: 0 1%;

				display: flex;
				align-items: center;
				gap: 1%;

				p {
					margin: 0;
				}

				._desc {
					width: 50%;
				}

				.stats {
					width: 50%;
				}
			}
		}
	}

	.actions,
	.moves {
		width: 50%;
		height: 25%;
		position: absolute;
		bottom: -20%;
		right: 1%;
		transition: bottom 0.5s ease-in-out;
		animation: appear 0.5s ease-in forwards;

		display: flex;
		border-radius: 8px;
		box-sizing: border-box;
		padding: 0 0 0 2%;
		z-index: 2;

		flex-wrap: wrap;
		gap: 2%;

		.back {
			position: absolute;
			top: -9.5dvh;
			left: 2dvw;
			height: 8.25dvh;
			width: 6dvw;
			background-color: rgba(44, 56, 69, 0.84);
			border-radius: 6px;
			color: white;

			svg {
				height: 30px;
			}
		}
	}
	// }

	.action-btn {
		$color: var(--color);
		border: 2px solid var(--color);

		font-size: 26px;
		color: white;
		text-shadow: 1px 1px 1px var(--color);
		background-color: rgba(44, 56, 69, 0.66);
		//background: var(--color);
		border-radius: 8px;
		box-sizing: border-box;
		font-family: pokemon, serif;
		position: relative;

		transition:
			color 0.3s ease-in-out,
			opacity 0.3s ease-in-out;
		flex: 48%;
		max-height: 49%;
		max-width: 49%;

		-webkit-box-shadow: 3px 5px 10px 1px rgba(0, 0, 0, 0.7);
		box-shadow: 3px 5px 10px 1px rgba(0, 0, 0, 0.7);

		&.move {
			background: var(--color);
		}

		&:hover,
		&.selected {
			cursor: pointer;
			//);
			//background-color: rgba(44, 56, 69, 0.5);
			color: var(--color);
			text-shadow: 1px 1px 1px black;
			-webkit-box-shadow: inset 2px -2px 10px 0px rgba(0, 0, 0, 0.7);
			box-shadow: inset 2px -2px 10px 0px rgba(0, 0, 0, 0.7);
		}

		&[disabled] {
			opacity: 0.5;
			cursor: not-allowed;
			pointer-events: none;
		}

		.move-type {
			display: block;
			width: 30px;
			height: 30px;
			position: absolute;
			top: 0;
			right: 0;
			img {
				width: 100%;
				height: 100%;
			}
		}

		.move-cat {
			display: block;
			width: 30px;
			height: 30px;
			position: absolute;
			top: 0;
			left: 0;
			img {
				width: 100%;
				height: 100%;
			}
		}
	}

	.moves .action-btn {
		font-size: 20px;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
</style>
