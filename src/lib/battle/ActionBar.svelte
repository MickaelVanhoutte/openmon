<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		ComboMove,
		Stats,
		type MoveInstance,
		type PokemonInstance
	} from '../../js/pokemons/pokedex';
	import type { GameContext } from '../../js/context/gameContext';
	import { BattleType, typeChart } from '../../js/battle/battle-model';
	import { BattleContext } from '../../js/context/battleContext';
	import { Attack, RunAway, Switch, UseItem } from '../../js/battle/actions/actions-selectable';
	import PokemonList from '../menus/pokemon-list/PokemonList.svelte';
	import Bag from '../menus/bag/Bag.svelte';
	import { Pokeball } from '../../js/items/items';
	import { MenuType, OverworldContext } from '../../js/context/overworldContext';
	import { inlineSvg } from '@svelte-put/inline-svg';
	import MiniPkmn from './mini-menus/MiniPkmn.svelte';
	import MiniBag from './mini-menus/MiniBag.svelte';
	import SplitActionButtons from './action-bar/SplitActionButtons.svelte';
	import SplitMoveSelector from './action-bar/SplitMoveSelector.svelte';
	import TargetSelector from './action-bar/TargetSelector.svelte';
	import BattleInfoText from './BattleInfoText.svelte';

	interface Props {
		context: GameContext;
		battleCtx: BattleContext;
		overWorldCtx: OverworldContext;
		allySprites?: HTMLElement[];
		entranceDelay?: number;
		isInitialEntrance?: boolean;
		visible?: boolean;
	}

	let {
		context,
		battleCtx,
		overWorldCtx,
		allySprites = [],
		entranceDelay = 0,
		isInitialEntrance = true,
		visible = true
	}: Props = $props();

	// Track actionIdx reactively (poll for changes since battleCtx is not reactive)
	let currentActionIdx = $state(battleCtx?.actionIdx ?? 0);

	// Get the active sprite based on current action index (for double battles)
	const activeSprite = $derived(allySprites[currentActionIdx] ?? allySprites[0] ?? null);
	let moveOpened = $state(false);
	let targetSelectOpened = $state(false);
	let possibleTargets: PokemonInstance[] = $state([]);
	let infoOpened = $state(false);
	let showInfoBack = $state(false);
	let show = $state(false);
	let showAdd = $state(false);

	let currentMessage: String | undefined = $state(undefined);
	let disabled = $state(false);
	let selectedMoveIdx: number | undefined = $state(undefined);
	let selectedOptionIdx: number | undefined = $state(undefined);
	let selectedTargetIdx: number | undefined = $state(undefined);
	let combo = $state(false);
	let currentCombo: { pokemon: PokemonInstance; move: MoveInstance } | undefined =
		$state(undefined);
	let changePokemon = $state(false);
	let isBattle = true;
	let battleBagOpened = $state(false);
	let battleSwitchOpened = $state(false);
	let zIndexNext = 10;
	const mechanicRegex = /{[^}]*}/g;
	const effectRegex = /\$effect_chance/g;

	let comboJauge = battleCtx.player.comboJauge;
	let comboValue = $state(comboJauge.value);
	let comboStored = $state(comboJauge.stored);
	let comboDisabled = $state(
		battleCtx.player.comboJauge.stored === 0 ||
			battleCtx.player.monsters?.filter((p) => !p.fainted).length === 1
	);
	let updating = $state(false);
	let disableComboTransition = $state(false);

	let levelUpRecap: { pokemon: PokemonInstance; oldStats?: Stats; newStats?: Stats } | undefined =
		$state(undefined);
	const statSkip = ['total', 'accuracy', 'evasion'];

	let menuType = $derived(
		(battleSwitchOpened ? 'switch' : combo ? 'combo' : 'change') as 'switch' | 'combo' | 'change'
	);

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
				setTimeout(() => {
					// goes to 100 animated
					disableComboTransition = false;
					comboValue = 100;
				}, 50);

				setTimeout(() => {
					// then 0 without transition
					disableComboTransition = true;
					comboValue = 0;
				}, 950);

				setTimeout(() => {
					// then set new values
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
			battleCtx.setPlayerAction(new RunAway(battleCtx.playerSide[battleCtx.actionIdx]));
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

	function launchMove(idx: number, move: MoveInstance, selectedTargets?: PokemonInstance[]) {
		if (!selectedTargets && idx !== selectedMoveIdx) {
			selectedMoveIdx = idx;
			return;
		}

		let targets: PokemonInstance[];

		if (selectedTargets && selectedTargets.length > 0) {
			targets = [...selectedTargets];
		} else {
			let found = battleCtx.getPossibleTargets(battleCtx.playerSide[battleCtx.actionIdx], move);
			if (found.selectOne) {
				targetSelectOpened = true;
				possibleTargets = found.possibleTargets;
				return;
			} else {
				targets = found.possibleTargets;
			}
		}

		if (battleCtx && targets) {
			if (!!currentCombo) {
				battleCtx.setPlayerAction(
					new Attack(
						new ComboMove(move, currentCombo.move, currentCombo.pokemon),
						targets,
						battleCtx.playerSide[battleCtx.actionIdx]
					)
				);

				currentCombo = undefined;
				combo = false;

				return;
			} else {
				battleCtx.setPlayerAction(
					new Attack(move, targets, battleCtx.playerSide[battleCtx.actionIdx])
				);
			}

			selectedTargetIdx = undefined;
			selectedMoveIdx = undefined;
			possibleTargets = [];
			targetSelectOpened = false;
			infoOpened = false;
			moveOpened = false;
			showAdd = false;
		}
	}

	/*
    Handle actions from menus (bag, switch)
     */

	function sendSwitchAction(newMonster: PokemonInstance) {
		battleSwitchOpened = false;
		if (battleCtx?.playerSide[battleCtx.actionIdx]) {
			battleCtx?.setPlayerAction(
				new Switch(battleCtx.playerSide[battleCtx.actionIdx], newMonster, battleCtx.player)
			);
		}
	}

	function send(pokemon: PokemonInstance, replaced: PokemonInstance) {
		// TODO this code should be in the battle state
		if (battleCtx) {
			let replacedIdx = battleCtx.playerSide.indexOf(replaced);
			let pkmnIdx = battleCtx.player.monsters.indexOf(pokemon);
			[battleCtx.player.monsters[replacedIdx], battleCtx.player.monsters[pkmnIdx]] = [
				battleCtx.player.monsters[pkmnIdx],
				battleCtx.player.monsters[replacedIdx]
			];
			battleCtx.playerSide[replacedIdx] = battleCtx.player.monsters[replacedIdx];
			battleCtx.participants.add(battleCtx.playerSide[replacedIdx]);
			changePokemon = false;
			selectedOptionIdx = 0;
			selectedMoveIdx = 0;
			battleCtx.events.pokemonChange.set({ side: 'ally', idx: replacedIdx });
			battleCtx.currentMessage.set(`What should ${battleCtx.playerSide[replacedIdx].name} do?`);
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
		let pokemonIdx = 0;
		if (result.target) {
			pokemonIdx = battleCtx?.playerSide.indexOf(result.target);
		}
		if (result.target && battleCtx) {
			if (
				itm &&
				battleCtx &&
				itm.doesApply(result.target, battleCtx.playerSide[pokemonIdx], battleCtx)
			) {
				battleCtx?.setPlayerAction(
					new UseItem(
						result.item,
						result.target,
						battleCtx.playerSide[pokemonIdx],
						battleCtx.player
					)
				);
				overWorldCtx.closeMenu(MenuType.BAG);
			} else {
				//TODO message
				alert('This item cannot be used here');
			}
		} else if (
			itm instanceof Pokeball &&
			battleCtx &&
			itm.doesApply(target, battleCtx.playerSide[pokemonIdx], battleCtx)
		) {
			battleCtx?.setPlayerAction(
				new UseItem(result.item, target, battleCtx.playerSide[pokemonIdx], battleCtx.player)
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
				if (moveOpened && targetSelectOpened) {
					if (selectedTargetIdx === undefined) {
						selectedTargetIdx = 0;
					} else {
						selectedTargetIdx =
							selectedTargetIdx === 0 ? possibleTargets.length - 1 : selectedTargetIdx - 1;
					}
				} else if (moveOpened) {
					if (selectedMoveIdx === undefined) {
						selectedMoveIdx = 0;
					} else {
						selectedMoveIdx =
							selectedMoveIdx === 0
								? battleCtx.playerSide[battleCtx.actionIdx].moves.length - 1
								: selectedMoveIdx - 1;
					}
				} else {
					if (selectedOptionIdx === undefined) {
						selectedOptionIdx = 0;
					} else {
						selectedOptionIdx = selectedOptionIdx === 0 ? 3 : selectedOptionIdx - 1;
					}
				}
			} else if (e.key === 'ArrowDown') {
				if (moveOpened && targetSelectOpened) {
					if (selectedTargetIdx === undefined) {
						selectedTargetIdx = 0;
					} else {
						selectedTargetIdx =
							selectedTargetIdx === possibleTargets.length - 1 ? 0 : selectedTargetIdx + 1;
					}
				} else if (moveOpened) {
					selectedMoveIdx =
						selectedMoveIdx === battleCtx.playerSide[battleCtx.actionIdx].moves.length - 1
							? 0
							: selectedMoveIdx + 1;
				} else {
					if (selectedOptionIdx === undefined) {
						selectedOptionIdx = 0;
					} else {
						selectedOptionIdx = selectedOptionIdx === 3 ? 0 : selectedOptionIdx + 1;
					}
				}
			} else if (e.key === 'Enter' && selectedMoveIdx !== undefined) {
				if (moveOpened && targetSelectOpened && selectedTargetIdx !== undefined) {
					launchMove(
						selectedMoveIdx,
						battleCtx.playerSide[battleCtx.actionIdx].moves[selectedMoveIdx],
						[possibleTargets[selectedTargetIdx]]
					);
				} else if (moveOpened) {
					launchMove(
						selectedMoveIdx,
						battleCtx.playerSide[battleCtx.actionIdx].moves[selectedMoveIdx]
					);
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
				if (
					!moveOpened &&
					!showAdd &&
					!showInfoBack &&
					!targetSelectOpened &&
					battleCtx.playerTurnActions?.length > 0
				) {
					battleCtx.cancelLastAction();
				} else {
					targetSelectOpened = false;
					moveOpened = false;
					showAdd = false;
					showInfoBack = false;
				}
			}
		}
	};

	function haveRemainingPokemons() {
		return (
			battleCtx.player.monsters?.filter((p) => !!p && !p.fainted)?.length >
			(battleCtx.battleType === BattleType.SINGLE ? 1 : 2)
		);
	}

	onMount(() => {
		show = true;
		window.addEventListener('keydown', listener);

		// Poll for actionIdx changes (for double battles)
		const actionIdxPoll = setInterval(() => {
			if (battleCtx?.actionIdx !== currentActionIdx) {
				currentActionIdx = battleCtx?.actionIdx ?? 0;
			}
		}, 100);

		battleCtx.events.playerPokemonFaint.subscribe((pkmn) => {
			if (pkmn && haveRemainingPokemons()) {
				changePokemon = true;
			}
		});
		return () => {
			window.removeEventListener('keydown', listener);
			clearInterval(actionIdxPoll);
		};
	});
</script>

{#if visible}
	{#if battleCtx?.playerTurnActions?.length > 0 && battleCtx?.playerSide?.length > 1 && !moveOpened && !targetSelectOpened}
		<div class="cancel-wrapper">
			<button
				class="cancel-last button"
				onclick={() => battleCtx.cancelLastAction()}
				aria-label="Cancel last action">Cancel</button
			>
		</div>
	{/if}

	<BattleInfoText message={currentMessage} />

	<!--
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
-->

	{#if moveOpened && !disabled}
		<button
			class="back-plate"
			onclick={() => {
				moveOpened = false;
				showAdd = false;
				targetSelectOpened = false;
			}}
			aria-label="Go back to action menu"
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
				<path
					d="M5.82843 6.99955L8.36396 9.53509L6.94975 10.9493L2 5.99955L6.94975 1.0498L8.36396 2.46402L5.82843 4.99955H13C17.4183 4.99955 21 8.58127 21 12.9996C21 17.4178 17.4183 20.9996 13 20.9996H4V18.9996H13C16.3137 18.9996 19 16.3133 19 12.9996C19 9.68584 16.3137 6.99955 13 6.99955H5.82843Z"
				></path>
			</svg>
			<span class="back-label">BACK</span>
		</button>

		<!--
	<button
		class="combo-btn"
		class:shine={!comboDisabled && !disabled}
		class:close={!!currentCombo}
		onclick={() => toggleCombo()}
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
-->
		{#if !targetSelectOpened}
			<SplitMoveSelector
				show={true}
				moves={battleCtx?.playerSide[battleCtx.actionIdx]?.moves || []}
				{disabled}
				{selectedMoveIdx}
				spriteElement={activeSprite}
				onMoveClick={(index) =>
					launchMove(index, battleCtx?.playerSide[battleCtx.actionIdx]?.moves[index])}
				onCancel={() => {
					moveOpened = false;
					showAdd = false;
				}}
				onHover={(idx) => {
					selectedMoveIdx = idx;
				}}
			/>
		{:else}
			<!-- targets -->
			<TargetSelector
				{possibleTargets}
				{selectedTargetIdx}
				selectedMove={battleCtx?.playerSide[battleCtx.actionIdx]?.moves[selectedMoveIdx]}
				{battleCtx}
				show={true}
				spriteElement={activeSprite}
				onTargetClick={(target) => {
					const targetIdx = possibleTargets.indexOf(target);
					launchMove(
						targetIdx,
						battleCtx?.playerSide[battleCtx.actionIdx]?.moves[selectedMoveIdx],
						[target]
					);
				}}
			/>
		{/if}
	{:else}
		<SplitActionButtons
			show={true}
			{disabled}
			{selectedOptionIdx}
			spriteElement={activeSprite}
			{entranceDelay}
			{isInitialEntrance}
			onFight={() => {
				moveOpened = true;
				showInfoBack = true;
				showAdd = true;
			}}
			onBag={() => openBag()}
			onSwitch={() => switchOpen()}
			onRun={() => escape()}
			onHover={(idx) => {
				selectedOptionIdx = idx;
			}}
		/>
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
				onclick={() => {
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
			bind:currentPkmn={battleCtx.playerSide[battleCtx.actionIdx]}
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
				}
			}}
		/>
	{/if}

	{#if battleBagOpened}
		<button
			class="back-mini-pkmn-btn"
			onclick={() => {
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
			bind:currentPkmn={battleCtx.playerSide[battleCtx.actionIdx]}
			bind:battleCtx
			zIndex={zIndexNext}
			onChange={(result) => sendObjectAction(result)}
		/>
	{/if}
{/if}

<style lang="scss">
	@keyframes appear {
		from {
			bottom: -25%;
		}
		to {
			bottom: 2%;
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

	.cancel-wrapper {
		z-index: 99;
		position: absolute;
		left: 5%;
		bottom: 28%;

		.cancel-last.button {
			background-color: var(--pixel-bg-header);
			border: 2px solid var(--pixel-border-color);
			color: var(--pixel-text-white);
			display: flex;
			text-transform: uppercase;
			justify-content: flex-start;
			align-items: center;
			padding: 0 20px;
			font-size: 36px;
			min-width: 44px;
			min-height: 44px;
			transition: transform 0.5s ease-in-out;

			&:hover,
			&.selected {
				transform: translateX(0);
				filter: brightness(1.1);
				border: 3px solid var(--pixel-text-gold);
				color: var(--pixel-text-white);
				justify-content: center;
			}
		}
	}

	.info {
		z-index: 1;
		width: 62%;
		position: absolute;
		left: -40%;
		bottom: 1%;
		transition: left 0.5s ease-in-out;
		border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		align-content: center;
		justify-content: space-around;
		box-sizing: border-box;
		padding: 1%;
		height: 25%;
		background-color: hsl(206.77deg 61.9% 20.59% / 62%);
		opacity: 0;

		&.show {
			animation: info-appear 0.5s ease-in forwards;
		}

		._inner {
			z-index: 1;
			height: 100%;
			font-size: 32px;
			font-weight: 500;
			letter-spacing: 0.5px;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			text-align: center;
			box-sizing: border-box;
			color: var(--pixel-text-white);
		}
	}

	.actions2,
	.moves2 {
		width: 30%;
		max-height: 220px;
		position: absolute;
		bottom: -25%;
		right: 5%;
		transition: bottom 0.5s ease-in-out;
		animation: appear 0.5s ease-in forwards;
		align-items: flex-end;
		gap: 6px;
		display: flex;
		flex-direction: column;
		z-index: 9;

		&.target-select {
			justify-content: center;
		}

		.action2-btn {
			width: 100%;
			height: 44px;
			background-color: var(--pixel-bg-header);
			border: 2px solid var(--pixel-border-color);
			color: var(--pixel-text-white);
			transform: translateX(20%);
			display: flex;
			justify-content: flex-start;
			align-items: center;
			padding: 0 20px;
			font-size: 36px;
			min-width: 44px;
			min-height: 44px;
			transition: transform 0.3s ease-in-out;

			&:hover,
			&.selected {
				filter: brightness(1.1);
				border: 3px solid var(--pixel-text-gold);
				color: var(--pixel-text-white);
			}
		}

		.move-btn,
		.target-btn {
			width: 100%;
			height: calc(80% / 4);
			background-color: var(--pixel-bg-header);
			border: 2px solid var(--pixel-border-color);
			border-left: 5px solid var(--color, var(--pixel-bg-header));
			color: var(--pixel-text-white);
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 12px 0 10px;
			transform: translateX(8%);
			font-size: 24px;
			min-width: 44px;
			min-height: 44px;
			transition: transform 0.5s ease-in-out;
			box-sizing: border-box;

			&.target-btn {
				border: 2px solid var(--pixel-border-color);
				border-left: 5px solid var(--color, var(--pixel-bg-header));
				justify-content: flex-start;
				gap: 10%;

				&:hover,
				&.selected {
					background-color: var(--pixel-bg-header);
					color: var(--pixel-text-white);
				}

				span:first-child {
					margin-left: 10%;
				}
				span:last-child {
					font-size: 26px;
					font-weight: bold;
					text-shadow: 0px 0px 5px var(--eff-color, transparent);
				}
			}

			&:hover,
			&.selected {
				//transform: translateX(0);
				filter: brightness(1.1);
				border: 3px solid var(--pixel-text-gold);
				border-left: 5px solid var(--color, var(--pixel-bg-header));
				color: var(--pixel-text-white);
				opacity: 1;
			}

			.move-name {
				max-width: 70%;
				//overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.move-pp {
				font-size: 16px;
			}
		}
	}

	.combo {
		width: 60%;
		height: 7dvh;
		display: flex;
		justify-content: flex-end;
		position: absolute;
		right: 37%;
		bottom: 29%;
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
			background-color: var(--pixel-bg-panel);
			border: 2px solid var(--pixel-border-color);
			box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
			color: var(--pixel-text-white);
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
			background-color: var(--pixel-bg-panel);
			border: 2px solid var(--pixel-border-color);
			box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
			color: var(--pixel-text-white);
			display: flex;
			gap: 2%;
			align-items: center;

			.progressbar-wrapper {
				height: 100%;
				width: 100%;
				background-color: rgba(0, 0, 0, 0.25);
				position: relative;

				.progressbar {
					width: var(--width);
					background: var(--pixel-bg-header);
					height: 100%;
					position: relative;
					overflow: hidden;
					display: flex;
					text-align: center;
					align-items: center;
					justify-content: center;
					transition: width 1s ease-in-out;

					&.noTransition {
						transition: none;
					}

					&:after {
						display: none;
					}

					span {
						position: absolute;
						display: block;
						width: 100%;
						height: 64px;
						top: 0;
						left: 0;
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
		animation: info-appear 0.5s ease-in forwards;
		gap: 1%;
		z-index: 99;

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
				background-color: var(--pixel-bg-panel);
				border: 2px solid var(--pixel-border-color);
				box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
				color: var(--pixel-text-white);
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
				background-color: var(--pixel-bg-panel);
				border: 2px solid var(--pixel-border-color);
				box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
				color: var(--pixel-text-white);
				overflow: hidden;

				svg {
					height: 100%;
					max-height: 100%;
					max-width: 100%;
				}
			}
		}

		.move-desc {
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
			background-color: hsl(206.77deg 61.9% 20.59% / 62%);
			border: 2px solid #000;
			box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
			transition: bottom 0.5s ease-in-out;
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
				box-shadow: none;
				background: transparent;
				height: 100%;
			}

			._desc {
				width: 100%;
				height: 100%;
				padding: 2%;
				box-sizing: border-box;
				position: relative;
				overflow: hidden;

				visibility: hidden;

				&.show {
					visibility: visible;
				}

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
		background-color: var(--pixel-bg-panel);
		border: 2px solid var(--pixel-border-color);
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		color: var(--pixel-text-white);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9;

		&.shine {
			animation: sparkle 3s infinite;
			border: 2px solid #000;
			right: 1%;
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
		color: white;
		overflow: hidden;
		z-index: 100;

		svg {
			height: 100%;
			max-height: 100%;
			max-width: 100%;
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

	/* Angular Back Button - Spatial UI Style */
	.back-plate {
		position: absolute;
		bottom: 4%;
		left: 5%;
		padding: 12px 24px;
		transform: skewX(-15deg);
		background: linear-gradient(135deg, rgba(71, 85, 105, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%);
		border: none;
		border-left: 4px solid #94a3b8;
		color: white;
		cursor: pointer;
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: inherit;
		font-size: 0.9rem;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		transition: all 0.2s ease;
	}

	.back-plate:hover {
		background: linear-gradient(135deg, rgba(100, 116, 139, 0.95) 0%, rgba(71, 85, 105, 0.9) 100%);
		border-left-color: #cbd5e1;
		transform: skewX(-15deg) translateX(-3px);
		box-shadow:
			0 6px 16px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	.back-plate:active {
		transform: skewX(-15deg) translateX(-1px) scale(0.98);
	}

	.back-plate svg {
		width: 20px;
		height: 20px;
		transform: skewX(15deg);
		opacity: 0.9;
	}

	.back-label {
		transform: skewX(15deg);
		font-weight: 700;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}
</style>
