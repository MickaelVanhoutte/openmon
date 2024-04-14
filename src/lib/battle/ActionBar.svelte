<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { ComboMove, type MoveInstance, type PokemonInstance } from '../../js/pokemons/pokedex';
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
	let combo = false;
	let currentCombo: { pokemon: PokemonInstance; move: MoveInstance } | undefined = undefined;
	let changePokemon = false;
	let isBattle = true;
	let battleBagOpened = false;
	let battleSwitchOpened = false;
	let zIndexNext = 10;
	const mechanicRegex = /{[^}]*}/g;
	const effectRegex = /\$effect_chance/g;

	$: comboDisabled =
		battleCtx.usedCombo || battleCtx.player.monsters?.filter((p) => !p.fainted).length === 1;
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
			// TODO if currentCombo, send combo action
			if(!!currentCombo){
				battleCtx.startTurn(new Attack(
				new ComboMove(move, currentCombo.move, currentCombo.pokemon),	
				 'opponent', battleCtx.playerPokemon));
				currentCombo = undefined;
				combo = false;
				moveOpened = false;
				return;
			}else {
				battleCtx.startTurn(new Attack(move, 'opponent', battleCtx.playerPokemon));
				moveOpened = false;
			}

			
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

	function toggleCombo() {
		if(!combo && !currentCombo){
			combo = true;
		}else if(!combo && currentCombo){
			currentCombo = undefined;
		}
	}

	function prepareCombo(pokemon: PokemonInstance, move: MoveInstance) {
		//console.log(pokemon, move);
		currentCombo = { pokemon, move };
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
			if (pkmn && !battleCtx?.player.monsters.every((p) => p.fainted)) {
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

	<div class="additionnal">
		<div class="combo">
			<button class="combo-btn" on:click={() => (toggleCombo())} disabled={comboDisabled}>
				{#if !currentCombo}
					<svg
						version="1.0"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 1920.000000 1920.000000"
						preserveAspectRatio="xMidYMid meet"
					>
						<g
							transform="translate(0.000000,1920.000000) scale(0.100000,-0.100000)"
							fill="currentColor"
							stroke="none"
						>
							<path
								d="M14625 16153 c-213 -182 -365 -323 -599 -553 -398 -393 -707 -738
-1093 -1219 l-132 -164 182 -91 c278 -140 470 -268 639 -425 42 -39 80 -71 84
-70 5 0 54 57 109 126 450 567 1017 1161 1477 1549 64 55 117 101 117 104 1 7
-678 814 -687 818 -4 1 -48 -32 -97 -75z"
							/>
							<path
								d="M11375 14259 c-483 -58 -957 -257 -1345 -566 -111 -88 -329 -305
-414 -413 -279 -354 -563 -876 -886 -1630 -152 -355 -747 -1868 -738 -1875 2
-1 93 -7 203 -14 110 -7 340 -23 510 -36 171 -13 332 -25 358 -26 l49 -3 162
419 c586 1512 883 2130 1208 2520 319 382 821 598 1288 556 239 -22 422 -76
666 -196 237 -117 355 -210 469 -369 367 -515 301 -1483 -149 -2165 -82 -125
-109 -157 -219 -269 -243 -247 -565 -422 -998 -542 l-116 -33 -107 -229 c-181
-385 -422 -935 -414 -943 5 -6 189 18 388 50 928 151 1651 510 2124 1055 420
483 684 1094 782 1805 26 184 26 630 1 800 -60 405 -177 733 -364 1020 -220
338 -495 576 -903 780 -300 150 -572 239 -886 291 -118 19 -548 28 -669 13z"
							/>
							<path
								d="M11897 12952 c-457 -692 -995 -1615 -1449 -2487 -440 -845 -653
-1317 -1092 -2423 -281 -705 -456 -1100 -612 -1373 -71 -125 -223 -353 -297
-444 -310 -384 -736 -644 -1211 -740 -68 -14 -137 -25 -153 -25 -38 0 -43 -4
-158 -145 -182 -222 -319 -375 -599 -669 -94 -98 -171 -184 -171 -189 0 -11
120 -36 305 -64 88 -13 181 -17 395 -18 242 0 300 3 427 23 920 142 1681 636
2210 1432 133 202 242 395 374 665 141 290 225 487 514 1210 378 945 481 1178
809 1835 518 1037 1001 1888 1533 2702 l110 168 -36 57 c-43 72 -116 157 -179
212 -108 92 -345 212 -532 269 -161 49 -158 49 -188 4z"
							/>
							<path
								d="M7180 9600 c-593 -45 -1004 -172 -1388 -427 -332 -220 -632 -553
-886 -982 -164 -276 -307 -600 -390 -881 -119 -401 -139 -851 -56 -1234 61
-278 208 -587 390 -817 l38 -49 264 278 c336 353 478 508 478 522 0 6 -13 34
-29 63 -39 69 -85 205 -102 297 -19 103 -16 322 6 445 75 435 364 973 671
1254 283 259 634 398 1119 441 208 19 772 5 1210 -30 467 -36 820 -58 827 -52
4 4 64 142 133 307 69 165 169 398 221 518 53 121 94 220 92 222 -2 2 -100 8
-218 14 -255 14 -490 30 -1095 77 -485 37 -1047 52 -1285 34z"
							/>
							<path
								d="M7393 8338 c-5 -7 -33 -65 -63 -128 -144 -307 -282 -555 -499 -895
-369 -580 -796 -1142 -1202 -1581 -787 -850 -1346 -1406 -1687 -1677 -48 -38
-102 -81 -119 -95 l-33 -27 245 -475 c135 -261 246 -479 248 -485 9 -25 440
316 706 559 455 415 1583 1616 1942 2068 430 541 861 1179 1133 1676 132 240
495 1006 483 1018 -4 4 -382 32 -602 44 -265 14 -540 13 -552 -2z"
							/>
						</g>
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
						><path
							d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
						></path></svg
					>
				{/if}
			</button>
			{#if currentCombo}
				<span class="combo-info" style="--color:{typeChart[currentCombo?.move?.type]?.color}">
					{currentCombo.move.name} by {currentCombo.pokemon.name}
				</span>
			{/if}
		</div>
		<div>
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
		</div>
	</div>

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
		onCombo={() => {}}
	/>
{/if}

{#if changePokemon || combo}
	<PokemonList
		bind:context
		{isBattle}
		bind:combo
		bind:forceChange={changePokemon}
		zIndex={zIndexNext}
		onChange={(pkm) => !!pkm && send(pkm)}
		onCombo={(combo) => {
			!!combo && prepareCombo(combo.pokemon, combo.move);
		}}
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
			bottom: -40%;
			opacity: 0;
		}
		to {
			opacity: 1;
			bottom: 42%;
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
		bottom: -40%;
		width: 34%;
		text-transform: initial;
		text-align: left;
		font-size: 30px;
		word-break: break-word;
		box-sizing: border-box;
		max-height: 50%;
		background-color: rgba(255, 255, 255, 0.3);
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

	.additionnal {
		position: absolute;
		bottom: 32%;
		left: 51dvw;
		z-index: 9;
		height: 8.25dvh;
		width: 47dvw;
		color: white;
		display: flex;
		justify-content: space-between;

		.combo {
			width: 70%;
			gap: 3%;
			height: 100%;
			display: flex;
			justify-content: space-between;

			.combo-btn {
				height: 100%;
				width: 6dvw;
				background-color: rgba(44, 56, 69, 0.45);
				border-radius: 6px;
				color: white;

				svg {
					height: 100%;
				}
			}

			.combo-info {
				height: 100%;
				width: calc(100% - 6dvw);
				max-width: calc(100% - 6dvw);
				font-size: 26px;
				padding: 1% 4%;
				background-color: rgba(44, 56, 69, 0.45);
				border-radius: 6px;
				color: var(--color, white);
				text-shadow: 1px 0px 0px black;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				text-align: left;
			}
		}

		.back-btn {
			height: 100%;
			width: 6dvw;
			background-color: rgba(44, 56, 69, 0.45);
			border-radius: 6px;
			color: white;

			svg {
				height: 100%;
			}
		}

		.info-btn {
			height: 100%;
			width: 6dvw;
			background-color: rgba(44, 56, 69, 0.45);
			border-radius: 6px;
			color: white;

			svg {
				height: 100%;
			}
		}
	}

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

			--main-bg: conic-gradient(from 0, #213, #112 5%, #112 60%, #213 95%);

			background: var(--main-bg) border-box;

			background-position: center center;

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
