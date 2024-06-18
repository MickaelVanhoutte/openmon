<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		ComboMove,
		Stats,
		type MoveInstance,
		type PokemonInstance
	} from '../../js/pokemons/pokedex';
	import type { GameContext } from '../../js/context/gameContext';
	import { typeChart } from '../../js/battle/battle-model';
	import { BattleContext } from '../../js/context/battleContext';
	import { Attack, RunAway, Switch, UseItem } from '../../js/battle/actions/actions-selectable';
	import PokemonList from '../menus/pokemon-list/PokemonList.svelte';
	import Bag from '../menus/bag/Bag.svelte';
	import { Pokeball } from '../../js/items/items';
	import { MenuType, OverworldContext } from '../../js/context/overworldContext';
	import { inlineSvg } from '@svelte-put/inline-svg';
	import MiniPkmn from './mini-menus/MiniPkmn.svelte';
	import MiniBag from './mini-menus/MiniBag.svelte';

	export let context: GameContext;
	export let battleCtx: BattleContext;
	export let overWorldCtx: OverworldContext;
	let moveOpened = false;
	let infoOpened = false;
	let showInfoBack = false;
	let show = false;
	let showAdd = false;

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

	let comboJauge = battleCtx.player.comboJauge;
	let comboValue = comboJauge.value;
	let comboStored = comboJauge.stored;
	let comboDisabled =
		battleCtx.player.comboJauge.stored === 0 ||
		battleCtx.player.monsters?.filter((p) => !p.fainted).length === 1;
	let updating = false;
	let disableComboTransition = false;

	let levelUpRecap: { pokemon: PokemonInstance; oldStats?: Stats; newStats?: Stats } | undefined;
	const statSkip = ['total', 'accuracy', 'evasion'];

	$: menuType = (battleSwitchOpened ? 'switch' : combo ? 'combo' : 'change') as
		| 'switch'
		| 'combo'
		| 'change';

	battleCtx.currentMessage.subscribe((message) => {
		currentMessage = message;
	});
	battleCtx.isPlayerTurn.subscribe((isPlayerTurn) => {
		disabled = !isPlayerTurn;
	});
	battleCtx.events.levelUp.subscribe((lvlUp) => {
		if (lvlUp && lvlUp.newStats) {
			setTimeout(() => {
				levelUpRecap = lvlUp;
				infoOpened = true;
			}, 500);
			setTimeout(() => {
				infoOpened = false;
				levelUpRecap = undefined;
			}, 3500);
		}
	});

	battleCtx.currentAction.subscribe((action) => {
		if (battleCtx.player.comboJauge.value != comboValue && !updating) {
			updating = true;
			showAdd = true;
			setTimeout(() => {
				showAdd = false;
			}, 4000);

			if (
				battleCtx.player.comboJauge.value < comboValue &&
				battleCtx.player.comboJauge.stored >= comboStored
			) {
				console.log('combo value reset');
				setTimeout(() => {
					// goes to 100 animated
					console.log('set to 100', new Date().getTime());
					disableComboTransition = false;
					comboValue = 100;
				}, 50);

				setTimeout(() => {
					// then 0 without transition
					console.log('set to 0', new Date().getTime());
					disableComboTransition = true;
					comboValue = 0;
				}, 950);

				setTimeout(() => {
					// then set new values
					console.log('set to ' + battleCtx.player.comboJauge.value, new Date().getTime());
					disableComboTransition = false;
					comboValue = battleCtx.player.comboJauge.value;
					comboStored = battleCtx.player.comboJauge.stored;
					updating = false;
				}, 1900);
			} else {
				comboValue = battleCtx.player.comboJauge.value;
				comboStored = battleCtx.player.comboJauge.stored;
				updating = false;
			}
			comboDisabled =
				battleCtx.player.comboJauge.stored === 0 ||
				battleCtx.player.monsters?.filter((p) => !p.fainted).length === 1;
		}
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
			if (!!currentCombo) {
				battleCtx.startTurn(
					new Attack(
						new ComboMove(move, currentCombo.move, currentCombo.pokemon),
						'opponent',
						battleCtx.playerPokemon
					)
				);
				infoOpened = false;
				currentCombo = undefined;
				combo = false;
				moveOpened = false;
				showAdd = false;
				return;
			} else {
				battleCtx.startTurn(new Attack(move, 'opponent', battleCtx.playerPokemon));
				moveOpened = false;
				showAdd = false;
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
		if (!combo && !currentCombo) {
			combo = true;
		} else if (!combo && currentCombo) {
			currentCombo = undefined;
			infoOpened = false;
			showInfoBack = false;
		}
	}

	function prepareCombo(pokemon: PokemonInstance, move: MoveInstance) {
		//console.log(pokemon, move);
		currentCombo = { pokemon, move };
		infoOpened = true;
		showInfoBack = true;
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
		if (battleSwitchOpened || changePokemon || combo || battleBagOpened) {
			if (e.key === 'Escape') {
				battleSwitchOpened = false;
				changePokemon = false;
				combo = false;
				battleBagOpened = false;
			} else {
				return;
			}
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
						show = true;
						showAdd = true;
						showInfoBack = true;
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
				showAdd = false;
				showInfoBack = false;
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


<div
	class="info"
	class:show={show && !moveOpened && !(battleSwitchOpened || changePokemon || combo || battleBagOpened)}
>
	<div class="_inner">
		<span>
			{currentMessage?.toUpperCase()}
		</span>
	</div>
</div>

<div class="combo" class:show={showAdd}>
	{#if currentCombo}
		<span class="combo-info" style="--color:{typeChart[currentCombo?.move?.type]?.color}">
			{currentCombo.move.name} by {currentCombo.pokemon.name}
		</span>
	{:else}
		<div class="combo-jauge">
			<div class="counter">
				<svg use:inlineSvg={'src/assets/menus/combo.svg'} />
				<span>
					{comboStored}
				</span>
			</div>
			<div class="progressbar-wrapper">
				<div
					class:noTransition={disableComboTransition}
					class="progressbar"
					class:warning={comboValue <= 50}
					class:danger={comboValue < 15}
					style="--width:{comboValue + '%'}"
				>
					<span></span>
				</div>
			</div>
		</div>
	{/if}
</div>

{#if moveOpened}
	<div class="left-infos">
		<div class="info-back">
			<button
				class="back-btn"
				on:click={() => {
					moveOpened = false;
					showAdd = false;
				}}
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M5.82843 6.99955L8.36396 9.53509L6.94975 10.9493L2 5.99955L6.94975 1.0498L8.36396 2.46402L5.82843 4.99955H13C17.4183 4.99955 21 8.58127 21 12.9996C21 17.4178 17.4183 20.9996 13 20.9996H4V18.9996H13C16.3137 18.9996 19 16.3133 19 12.9996C19 9.68584 16.3137 6.99955 13 6.99955H5.82843Z"
					></path></svg
				>
			</button>
		</div>

		<div class="move-desc show">
			<div class="wrapper">
				<div class="_desc">
					{#if !!currentCombo}
						<div class="head">
							<span
								>Types: {currentCombo.move.type}, {battleCtx?.playerPokemon?.moves[selectedMoveIdx]
									.type}</span
							>
							<span
								>Pwr. {currentCombo.move.power / 2 +
									battleCtx?.playerPokemon?.moves[selectedMoveIdx].power}
								({currentCombo.move.power | 0} * 0.5 + {battleCtx?.playerPokemon?.moves[
									selectedMoveIdx
								].power | 0})</span
							>
						</div>
						<hr />
						<ul style="font-size: 18px">
							<li>
								{currentCombo.move.effect.effect
									?.replace(mechanicRegex, '')
									?.replace(
										effectRegex,
										(currentCombo.move.effectChance * 1.5 > 100
											? 100
											: currentCombo.move.effectChance * 1.5) + ''
									)}
							</li>
							<li>
								{battleCtx?.playerPokemon?.moves[selectedMoveIdx].effect.effect
									?.replace(mechanicRegex, '')
									?.replace(
										effectRegex,
										(battleCtx?.playerPokemon?.moves[selectedMoveIdx].effectChance * 1.5 > 100
											? 100
											: battleCtx?.playerPokemon?.moves[selectedMoveIdx].effectChance * 1.5) + ''
									)}
							</li>
						</ul>
					{:else}
						<div class="head">
							<span>Acc. {battleCtx?.playerPokemon?.moves[selectedMoveIdx].accuracy} %</span>
							<span>Pwr. {battleCtx?.playerPokemon?.moves[selectedMoveIdx].power}</span>
						</div>
						<hr />
						<p class="desc-txt">
							{battleCtx?.playerPokemon?.moves[selectedMoveIdx].description
								?.replaceAll(mechanicRegex, '')
								?.replaceAll(
									effectRegex,
									battleCtx?.playerPokemon?.moves[selectedMoveIdx].effectChance + ''
								)}
						</p>
						<img
							class="move-cat"
							src={`src/assets/moves-cat/${battleCtx?.playerPokemon?.moves[selectedMoveIdx].category}.png`}
							alt={battleCtx?.playerPokemon?.moves[selectedMoveIdx].category}
						/>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<button
		class="combo-btn"
		class:shine={!comboDisabled && !disabled}
		class:close={!!currentCombo}
		on:click={() => toggleCombo()}
		disabled={comboDisabled}
	>
		{#if !currentCombo}
			<svg
				version="1.0"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 1920.000000 1920.000000"
				preserveAspectRatio="xMidYMid meet"
			>
				<defs>
					<linearGradient id="myGradient2" x2="1" y2="1">
						<stop offset="0%" stop-color="#01a9da" />
						<stop offset="20%" stop-color="#e876ac" />
					</linearGradient>
					<linearGradient id="myGradient3" x2="1" y2="1">
						<stop offset="0%" stop-color="#00a658" />
						<stop offset="50%" stop-color="#01a9da" />
						<stop offset="100%" stop-color="#e876ac" />
					</linearGradient>
					<linearGradient id="myGradient4" x2="1" y2="1">
						<stop offset="0%" stop-color="#f4e90e" />
						<stop offset="33%" stop-color="#00a658" />
						<stop offset="90%" stop-color="#01a9da" />
						<stop offset="100%" stop-color="#e876ac" />
					</linearGradient>
					<linearGradient id="myGradient5" x2="1" y2="1">
						<stop offset="0%" stop-color="#f4e90e" />
						<stop offset="100%" stop-color="#00a658" />
					</linearGradient>
				</defs>

				<g transform="translate(0.000000,1920.000000) scale(0.100000,-0.100000)" stroke="none">
					<path
						fill="url(#myGradient2)"
						d="M14625 16153 c-213 -182 -365 -323 -599 -553 -398 -393 -707 -738
-1093 -1219 l-132 -164 182 -91 c278 -140 470 -268 639 -425 42 -39 80 -71 84
-70 5 0 54 57 109 126 450 567 1017 1161 1477 1549 64 55 117 101 117 104 1 7
-678 814 -687 818 -4 1 -48 -32 -97 -75z"
					/>
					<path
						fill="url(#myGradient3)"
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
						fill="url(#myGradient4)"
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
						fill="url(#myGradient5)"
						d="M7180 9600 c-593 -45 -1004 -172 -1388 -427 -332 -220 -632 -553
-886 -982 -164 -276 -307 -600 -390 -881 -119 -401 -139 -851 -56 -1234 61
-278 208 -587 390 -817 l38 -49 264 278 c336 353 478 508 478 522 0 6 -13 34
-29 63 -39 69 -85 205 -102 297 -19 103 -16 322 6 445 75 435 364 973 671
1254 283 259 634 398 1119 441 208 19 772 5 1210 -30 467 -36 820 -58 827 -52
4 4 64 142 133 307 69 165 169 398 221 518 53 121 94 220 92 222 -2 2 -100 8
-218 14 -255 14 -490 30 -1095 77 -485 37 -1047 52 -1285 34z"
					/>
					<path
						fill="url(#myGradient5)"
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

	<div class="moves2" class:show>
		{#each battleCtx?.playerPokemon?.moves as move, index}
			<button
				class="move-btn move"
				style="--color:{typeChart[move.type].color}; --offset: {index * 3}%"
				{disabled}
				class:selected={!disabled && selectedMoveIdx === index}
				on:click={() => launchMove(index, move)}
			>
				<span class="move-type" style="--offset: {index * 1.5}%">
					<!-- <img src={`src/assets/types/${move.type}.svg`} alt={move.type} /> -->

					<svg use:inlineSvg={`src/assets/types/${move.type}.svg`} fill="currentColor"> </svg>
				</span>
				<span class="move-name">{move.name.toUpperCase()}</span>

				<span class="move-pp">
					{move.currentPp}/{move.pp}
				</span>

				<!-- <span class="move-cat">
					<img src={`src/assets/moves-cat/${move.category}.png`} alt={move.category} />
				</span> -->

				<!-- <span class="move-power">
					pwr. {move.power}
				</span> -->
			</button>
		{/each}
	</div>
{:else}
	<div class="actions2" class:show>
		<button
			class="action2-btn"
			style="--color:#dc5959; --color2:#431515; --offset: 0"
			{disabled}
			on:click={() => {
				moveOpened = true;
				showInfoBack = true;
				showAdd = true;
			}}
			on:mouseenter={() => {
				selectedOptionIdx = 0;
			}}
			class:selected={!disabled && selectedOptionIdx === 0}
		>
			FIGHT
		</button>

		<button
			class="action2-btn"
			style="--color:#eca859; --color2:#4f310d; --offset: 3%"
			{disabled}
			class:selected={!disabled && selectedOptionIdx === 1}
			on:click={() => openBag()}
			on:mouseenter={() => {
				selectedOptionIdx = 1;
			}}
		>
			BAG
		</button>

		<button
			class="action2-btn"
			style="--color:#7EAF53; --color2:#11420a; --offset: 6%"
			{disabled}
			class:selected={!disabled && selectedOptionIdx === 2}
			on:click={() => switchOpen()}
			on:mouseenter={() => {
				selectedOptionIdx = 2;
			}}
		>
			POKEMONS
		</button>

		<button
			class="action2-btn"
			style="--color:#599bdc; --color2:#092536; --offset: 9%"
			{disabled}
			class:selected={!disabled && selectedOptionIdx === 3}
			on:click={() => escape()}
			on:mouseenter={() => {
				selectedOptionIdx = 3;
			}}
		>
			RUN
		</button>
	</div>
{/if}

{#if levelUpRecap}
	<div class="level-up">
		<ul>
			{#each Object.keys(levelUpRecap.oldStats) as stat}
				{#if !statSkip.includes(stat)}
					<li
						class="lvl-stat"
						data-stat={stat
							.replace(/attack/i, 'atk')
							.replace(/defense/i, 'def')
							.replace('special', 'sp.')
							.toUpperCase()}
						data-val1="{levelUpRecap.oldStats[stat]} + {levelUpRecap.newStats[stat] -
							levelUpRecap.oldStats[stat]}"
						data-val2={levelUpRecap.newStats[stat]}
					></li>
				{/if}
			{/each}
		</ul>
	</div>
{/if}

{#if battleSwitchOpened || changePokemon || combo}
	{#if battleSwitchOpened || combo}
		<button
			class="back-mini-pkmn-btn"
			on:click={() => {
				battleSwitchOpened = false;
				combo = false;
			}}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
				></path></svg
			>
		</button>
	{/if}

	<MiniPkmn
		bind:context
		bind:currentPkmn={battleCtx.playerPokemon}
		bind:type={menuType}
		zIndex={zIndexNext}
		onCombo={(cb) => {
			!!cb && prepareCombo(cb.pokemon, cb.move);
			combo = false;
		}}
		onChange={(pkm) => {
			if (!!pkm && battleSwitchOpened) {
				sendSwitchAction(pkm);
			} else if (!!pkm && changePokemon) {
				send(pkm);
			} else {
				console.log('Wtf ?');
			}
		}}
	/>
{/if}

{#if battleBagOpened}
	<button
		class="back-mini-pkmn-btn"
		on:click={() => {
			battleBagOpened = false;
		}}
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
			><path
				d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
			></path></svg
		>
	</button>

	<MiniBag
		bind:context
		bind:currentPkmn={battleCtx.playerPokemon}
		bind:battleCtx={battleCtx}
		zIndex={zIndexNext}
		onChange={(result) => sendObjectAction(result)}
	/>
	<!-- <Bag
		bind:context
		{isBattle}
		bind:battleBagOpened
		zIndex={zIndexNext}
		onChange={(result) => sendObjectAction(result)}
	/> -->
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

	@keyframes add-appear {
		from {
			left: 150dvw;
		}
		to {
			left: 50.5dvw;
		}
	}

	@keyframes info-appear {
		from {
			left: -40%;
			opacity: 0;
		}
		to {
			opacity: 1;
			left: 3%;
		}
	}

	@keyframes sparkle {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 0 -64px;
		}
	}

	.level-up {
		position: absolute;
		top: 30%;
		left: 2%;
		min-width: 25%;
		max-width: 33%;
		height: 40%;
		color: white;
		z-index: 9;

		ul {
			height: 100%;
			list-style: none;
			padding: 0;
			margin: 0;
			overflow: hidden;
			background-color: rgba(88, 83, 100, 0.7);
			border-radius: 8px;
			box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.45);
			padding: 1%;
			display: flex;
			flex-direction: column;
			align-content: flex-end;
			justify-content: flex-start;
			align-items: flex-start;
			li {
				padding: 1%;
				margin: 1%;
				flex-grow: 1;
				position: relative;
				width: 100%;
				font-size: 20px;

				&:after {
					content: attr(data-val1);
					position: absolute;
					top: 0;
					right: 0;
					height: 100%;
					width: 50%;
					padding: 0 4% 0 2%;
					transition: all 0.2s ease-in-out;
					animation: displayData 3s ease-in forwards;
				}

				&::before {
					content: attr(data-stat);
					position: absolute;
					top: 0;
					left: 0;
					height: 100%;
					width: 50%;
					padding: 0 4% 0 2%;
				}

				@keyframes displayData {
					0% {
						content: attr(data-val1);
					}
					50% {
						content: attr(data-val2);
					}
					100% {
						content: attr(data-val2);
					}
				}
			}
		}
	}

	.info {
		width: 62%;
		position: absolute;
		left: -40%;
		bottom: 1%;
		transition: left 0.5s ease-in-out;
		//animation: appear 0.5s ease-in forwards;
		border-radius: 12px;
		display: flex;
		align-items: center;
		align-content: center;
		justify-content: space-around;
		box-sizing: border-box;
		padding: 1%;
		transform: skew(-15deg);
		height: 25%;
		background-color: rgba(88, 83, 100, 0.7);
		opacity: 0;

		&.show {
			animation: info-appear 0.5s ease-in forwards;
		}

		._inner {
			z-index: 1;
			height: 100%;
			font-size: 36px;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			text-transform: uppercase;
			text-align: center;
			box-sizing: border-box;
			filter: drop-shadow(2px 2px 5px white) invert(1);
		}
	}

	@keyframes blink {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	.actions2,
	.moves2 {
		width: 30%;
		height: 50%;
		position: absolute;
		bottom: -20%;
		right: 3%;
		transition: bottom 0.5s ease-in-out;
		animation: appear 0.5s ease-in forwards;
		align-items: flex-end;
		gap: 4%;
		display: flex;
		flex-direction: column;
		z-index: 2;
		transform: skew(-15deg);
		transition: transform 0.5s ease-in-out;

		.action2-btn {
			width: 100%;
			//margin-right: var(--offset);
			height: calc(88% / 4);
			background-color: rgba(44, 56, 69, 0.65);
			border-left: 6px solid var(--color);
			color: white;
			transform: translateX(50%);
			display: flex;
			justify-content: flex-start;
			align-items: center;
			padding: 0 20px;
			font-size: 36px;
			transition: transform 0.5s ease-in-out;

			&:hover,
			&.selected {
				transform: translateX(0);
				background-color: rgba(255, 255, 255, 0.85);
				color: #123;
				justify-content: center;
				animation: float 2s infinite;
			}
		}

		.move-btn {
			width: 100%;
			//margin-right: var(--offset);
			height: calc(76% / 4);
			background-color: rgba(44, 56, 69, 0.65);
			color: white;
			display: flex;
			align-items: center;
			justify-content: space-around;
			transform: translateX(30%);
			font-size: 20px;
			transition: transform 0.5s ease-in-out;

			&:hover,
			&.selected {
				transform: translateX(0);
				background-color: var(--color); //rgba(255, 255, 255, 0.95);
				color: #123;
				animation: float 3s infinite;

				.move-type {
					//background-color: rgba(44, 56, 69, 0.45);
				}
			}

			.move-type {
				display: flex;
				position: relative;
				left: 5%; //calc(-5% + var(--offset));
				border-radius: 4px;
				height: 9dvh;
				width: 9dvh;
				background: white;
				color: var(--color);
				aspect-ratio: 0.866;
				clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
				align-items: center;
				justify-content: center;

				svg {
					//transform: rotate(-35deg);
					color: var(--color);
					height: calc(8dvh - 8px);
					width: calc(9dvh - 8px);
				}
			}

			.move-name {
				max-width: 50%;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}

	.moves2 {
		gap: 8%;
	}

	.combo {
		width: 60%;
		height: 7dvh;
		display: flex;
		justify-content: flex-end;
		position: absolute;
		right: 34.5%;
		bottom: 29%;
		transform: skew(-15deg);
		opacity: 0;
		transition: opacity 0.5s ease-in-out;
		transition-delay: 0.3s;

		&.show {
			opacity: 1;
		}

		.counter {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			height: 100%;
			width: 15%;
			gap: 1%;

			svg {
				height: 175%;
				width: auto;
			}
		}

		.combo-info {
			height: 100%;
			width: 85%;
			font-size: 26px;
			padding: 1% 4%;
			background-color: rgba(44, 56, 69, 0.45);
			border-radius: 6px;
			color: white;
			text-shadow: 1px 0px 0px black;
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: nowrap;
			text-align: left;
		}

		.combo-jauge {
			height: 100%;
			width: 85%;
			font-size: 26px;
			padding: 1% 2%;
			background-color: rgba(44, 56, 69, 0.85);
			border-radius: 6px;
			color: white;
			display: flex;
			gap: 2%;
			align-items: center;

			.progressbar-wrapper {
				height: 100%;
				width: 100%;
				background-color: rgba(0, 0, 0, 0.25);
				border-radius: 4px;
				position: relative;

				.progressbar {
					width: var(--width);
					background: linear-gradient(to bottom, rgba(232, 25, 87, 1) 0%, rgba(170, 0, 51, 1) 100%);
					height: 100%;
					position: relative;
					overflow: hidden;
					border-radius: 4px;
					display: flex;
					text-align: center;
					align-items: center;
					justify-content: center;
					transition: width 1s ease-in-out;

					&.noTransition {
						transition: none;
					}

					&:after {
						position: absolute;
						display: block;
						content: '';
						width: 20%;
						height: 100%;
						right: 0;
						top: 0;
						-webkit-border-radius: 0px 4px 4px 0px;
						border-radius: 0px 4px 4px 0px;
						background: -moz-linear-gradient(
							left,
							rgba(255, 255, 255, 0) 0%,
							rgba(255, 255, 255, 0.6) 98%,
							rgba(255, 255, 255, 0) 100%
						);
						background: -webkit-gradient(
							linear,
							left top,
							right top,
							color-stop(0%, rgba(255, 255, 255, 0)),
							color-stop(98%, rgba(255, 255, 255, 0.6)),
							color-stop(100%, rgba(255, 255, 255, 0))
						);
						background: -webkit-linear-gradient(
							left,
							rgba(255, 255, 255, 0) 0%,
							rgba(255, 255, 255, 0.6) 98%,
							rgba(255, 255, 255, 0) 100%
						);
						background: -o-linear-gradient(
							left,
							rgba(255, 255, 255, 0) 0%,
							rgba(255, 255, 255, 0.6) 98%,
							rgba(255, 255, 255, 0) 100%
						);
						background: -ms-linear-gradient(
							left,
							rgba(255, 255, 255, 0) 0%,
							rgba(255, 255, 255, 0.6) 98%,
							rgba(255, 255, 255, 0) 100%
						);
						background: linear-gradient(
							to right,
							rgba(255, 255, 255, 0) 0%,
							rgba(255, 255, 255, 0.6) 98%,
							rgba(255, 255, 255, 0) 100%
						);
					}

					span {
						position: absolute;
						display: block;
						width: 100%;
						height: 64px;
						-webkit-border-radius: 16px;
						border-radius: 16px;
						top: 0;
						left: 0;
						background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAABACAYAAAD7/UK9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MjdFQ0M2MzdDQThBMTFFMUE3NzJFNzY4M0ZDMTA3MTIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MjdFQ0M2MzhDQThBMTFFMUE3NzJFNzY4M0ZDMTA3MTIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyN0VDQzYzNUNBOEExMUUxQTc3MkU3NjgzRkMxMDcxMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyN0VDQzYzNkNBOEExMUUxQTc3MkU3NjgzRkMxMDcxMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoTG0pMAABr+SURBVHjavJ1nj1zX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)
							0 0;
						-webkit-animation: sparkle 1500ms linear infinite;
						-moz-animation: sparkle 1500ms linear infinite;
						-o-animation: sparkle 1500ms linear infinite;
						animation: sparkle 1500ms linear infinite;
						opacity: 0.2;
					}
				}
			}
		}
	}

	.left-infos {
		position: absolute;
		left: 3%;
		bottom: 1%;
		width: 60%;
		height: 27%;
		display: flex;
		justify-content: flex-end;
		transform: skew(-15deg);
		animation: info-appear 0.5s ease-in forwards;
		gap: 1%;

		.info-back {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: flex-end;
			width: 10%;
			height: 42px;
			gap: 3%;

			.back-btn {
				height: 100%;
				width: 6dvw;
				background-color: rgba(44, 56, 69, 0.45);
				border-radius: 6px;
				color: white;
				overflow: hidden;

				svg {
					height: 100%;
					max-height: 100%;
					max-width: 100%;
				}
			}

			.info-btn {
				height: 100%;
				width: 6dvw;
				background-color: rgba(44, 56, 69, 0.45);
				border-radius: 6px;
				color: white;
				overflow: hidden;

				svg {
					height: 100%;
					max-height: 100%;
					max-width: 100%;
				}
			}
		}

		.move-desc {
			//position: absolute;
			//right: 35%;
			//bottom: -25%;
			width: 85%;
			color: white;
			text-transform: initial;
			text-align: left;
			font-size: 26px;
			word-break: break-word;
			box-sizing: border-box;
			height: 100%;
			overflow: auto;
			-webkit-overflow-scrolling: touch;
			scrollbar-width: thin;
			scrollbar-color: #68c0c8 #0e2742f0;
			background-color: rgb(88, 83, 100, 0.7);
			transition: bottom 0.5s ease-in-out;
			border-radius: 8px;
			opacity: 1;
			z-index: 9;

			h4,
			h5,
			ul,
			p {
				margin: 0;
			}

			&.show {
				animation: appear 0.5s ease-in forwards;
			}

			.wrapper {
				box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.45);
				background: rgba(0, 0, 0, 0.05);
				height: 100%;
			}

			._desc {
				width: 100%;
				height: 100%;
				padding: 2%;
				box-sizing: border-box;
				position: relative;
				overflow: hidden;

				hr {
					margin: 0.5rem 0;
				}

				.head {
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				.desc-txt {
					font-size: 20px;
				}

				.move-cat {
					position: absolute;
					bottom: 1%;
					right: 1%;
					height: 32px;
					width: 32px;
				}
			}
		}
	}

	.combo-btn {
		position: absolute;
		right: -1%;
		bottom: 55%;
		height: 8dvh;
		width: 20dvh;
		background-color: rgba(44, 56, 69, 0.85);
		border-radius: 6px;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: skew(-15deg);
		z-index: 9;

		&.shine {
			animation: sparkle 3s infinite;
			border: 1px solid rgba(44, 56, 69, 0.85);
			right: 1%;

			// svg {
			// 	animation: pulse 3s infinite;
			// }
		}

		&.close svg {
			height: 100%;
		}

		svg {
			height: 133%;
			filter: drop-shadow(0px 0px 2px rgba(44, 56, 69, 1));
		}
	}

	.back-mini-pkmn-btn {
		position: absolute;
		top: 1%;
		right: 1%;
		height: 8dvh;
		width: 6dvw;
		background-color: transparent;
		border-radius: 6px;
		color: white;
		overflow: hidden;
		z-index: 100;

		svg {
			height: 100%;
			max-height: 100%;
			max-width: 100%;
		}
	}

	@keyframes sparkle {
		0% {
			//background-color: rgba(1, 163, 88, .3);
			box-shadow: 0 0 10px rgba(1, 163, 88, 0.9);
			scale: 1;
		}
		40% {
			//background-color: rgba(232, 118, 172, .3);
			box-shadow: 0 0 10px rgba(232, 118, 172, 0.9);
			scale: 1.1;
		}
		90% {
			//background-color: rgba(1, 169, 218, .3);
			box-shadow: 0 0 10px rgba(1, 169, 218, 0.9);
			scale: 1;
		}
		100% {
			//background-color: rgba(1, 155, 145, .3);
			box-shadow: 0 0 10px rgba(1, 155, 145, 0.9);
			scale: 1;
		}
	}

	@keyframes float {
		0% {
			margin-right: 0;
		}
		60% {
			margin-right: -2%;
		}
		100% {
			margin-right: 0;
		}
	}

	@keyframes pulse {
		0% {
			//background-color: rgba(1, 163, 88, .3);
			box-shadow: 0 0 10px rgba(1, 163, 88, 0.9);
			right: 1%;
		}
		40% {
			//background-color: rgba(232, 118, 172, .3);
			box-shadow: 0 0 10px rgba(232, 118, 172, 0.9);
			right: 2%;
		}
		90% {
			//background-color: rgba(1, 169, 218, .3);
			box-shadow: 0 0 10px rgba(1, 169, 218, 0.9);
			right: 1%;
		}
		100% {
			//background-color: rgba(1, 155, 145, .3);
			box-shadow: 0 0 10px rgba(1, 155, 145, 0.9);
			right: 1%;
		}
	}
</style>
