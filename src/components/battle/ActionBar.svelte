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
	let infoOpened = false;
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
	const mechanicRegex = /{[^}]*}/g;
	const effectRegex = /\$effect_chance/g;

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

	function launchMove(idx: number, move: MoveInstance) {
		if (idx != selectedMoveIdx) {
			selectedMoveIdx = idx;
		} else if (battleCtx) {
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
		<span>
			{currentMessage?.toUpperCase()}
		</span>
	</div>
</div>

{#if moveOpened}
	<div class="move-desc" class:show={infoOpened}>
		<div class="wrapper">
			<div class="_desc">
				<p>Acc. {battleCtx?.playerPokemon?.moves[selectedMoveIdx].accuracy} %</p>
				<hr />
				<p>
					{battleCtx?.playerPokemon?.moves[selectedMoveIdx].description
						?.replace(mechanicRegex, '')
						?.replace(
							effectRegex,
							battleCtx?.playerPokemon?.moves[selectedMoveIdx].effectChance + ''
						)}
				</p>
			</div>
		</div>
	</div>

	<button class="info-btn" on:click={() => (infoOpened = !infoOpened)}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
			><path
				d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"
			></path></svg
		>
	</button>
	<button class="back-btn" on:click={() => (moveOpened = false)}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
			><path
				d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 11V8L8 12L12 16V13H16V11H12Z"
			></path></svg
		></button
	>

	<div class="moves" class:show>
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
				<span class="move-pp">
					{move.currentPp}/{move.pp}
				</span>
				<span class="move-power">
					pwr. {move.power}
				</span>
				<span class="move-name">{move.name.toUpperCase()}</span>
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

	@keyframes info-appear {
		from {
			bottom: -32%;
			opacity: 0;
		}
		to {
			opacity: 1;
			bottom: 32%;
		}
	}

	.info {
		width: 63%;
		position: absolute;
		bottom: -32%;
		left: 1%;
		transition: bottom 0.5s ease-in-out;
		animation: appear 0.5s ease-in forwards;
		border-radius: 12px;
		display: flex;
		align-items: center;
		align-content: center;
		justify-content: space-around;
		box-sizing: border-box;
		padding: 1%;
		perspective: 100dvw;
		

		._inner {
			z-index: 1;
			height: 100%;
			font-size: 46px;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			text-transform: uppercase;
			text-align: center;
			box-sizing: border-box;
			filter: drop-shadow(2px 2px 5px white) invert(1);
			transform: rotateY(30deg);
			transform-origin: left;
		}
	}

	.move-desc {
		position: absolute;
		left: 51%;
		bottom: -30%;
		width: 34%;
		text-transform: initial;
		text-align: left;
		font-size: 30px;
		word-break: break-word;
		box-sizing: border-box;

		transition: bottom 0.5s ease-in-out;
		opacity: 0;

		&.show {
			animation: info-appear 0.5s ease-in forwards;
		}

		.wrapper {
			box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.45);
			background: rgba(0, 0, 0, 0.05);
		}

		p {
			margin: 0;
		}

		._desc {
			width: 100%;
			padding: 2%;
			box-sizing: border-box;
		}
	}

	.actions,
	.moves {
		width: 48%;
		height: 30%;
		position: absolute;
		bottom: -20%;
		right: 1%;
		transition: bottom 0.5s ease-in-out;
		animation: appear 0.5s ease-in forwards;

		display: flex;
		border-radius: 8px;
		box-sizing: border-box;
		z-index: 2;

		flex-wrap: wrap;
		gap: 5% 2%;
	}
	.back-btn {
		position: absolute;
		bottom: 32%;
		right: 1dvw;
		height: 8.25dvh;
		width: 6dvw;
		background-color: rgba(44, 56, 69, 0.45);
		border-radius: 6px;
		color: white;

		svg {
			height: 100%;
		}
	}

	.info-btn {
		position: absolute;
		bottom: 32%;
		right: 8dvw;
		height: 8.25dvh;
		width: 6dvw;
		background-color: rgba(44, 56, 69, 0.45);
		border-radius: 6px;
		color: white;

		svg {
			height: 100%;
		}
	}
	// }

	.action-btn {
		$color: var(--color);
		border: 2px solid var(--color);

		font-size: 28px;
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
			//color: white !important;
			text-shadow: none !important;
		}

		.move-name {
			position: absolute;
			transform: translate(-50%, -80%);
		}

		.move-pp {
			font-size: 18px;
			color: white;
			position: absolute;
			bottom: 4px;
			right: 30px;
		}

		.move-power {
			font-size: 18px;
			color: white;
			position: absolute;
			bottom: 4px;
			left: 30px;
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

			--border-angle: 0turn; // For animation.
			--main-bg: conic-gradient(from var(--border-angle), #213, #112 5%, #112 60%, #213 95%);

			border: solid 2px transparent;
			--gradient-border: conic-gradient(
				from var(--border-angle),
				transparent 25%,
				#08f,
				#f03 99%,
				transparent
			);

			background: 
    			// padding-box clip this background in to the overall element except the border.
				var(--main-bg) padding-box,
				// border-box extends this background to the border space
				var(--gradient-border) border-box,
				// Duplicate main background to fill in behind the gradient border. You can remove this if you want the border to extend "outside" the box background.
				var(--main-bg) border-box;

			background-position: center center;

			animation: bg-spin 3s linear infinite;
			-webkit-animation: bg-spin 3s linear infinite;
			@keyframes bg-spin {
				to {
					--border-angle: -1turn;
				}
			}

			.move-cat {
				color: var(--color);
			}
		}

		&[disabled] {
			opacity: 0.5;
			cursor: not-allowed;
			pointer-events: none;
		}

		.move-type {
			display: block;
			width: 24px;
			height: 24px;
			position: absolute;
			top: 2px;
			right: 2px;
			color: white;
			img {
				width: 100%;
				height: 100%;
			}
		}

		.move-cat {
			display: block;
			width: 24px;
			height: 24px;
			position: absolute;
			top: 2px;
			left: 2px;
			color: white;
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
