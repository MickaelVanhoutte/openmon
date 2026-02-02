<script lang="ts">
	import { MoveInstance, PokemonInstance } from '../../../js/pokemons/pokedex';
	import PokemonSummary from './PokemonSummary.svelte';
	import { onMount } from 'svelte';
	import { backInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import Bag from '../bag/Bag.svelte';
	import type { GameContext } from '../../../js/context/gameContext';
	import { MenuType } from '../../../js/context/overworldContext';
	import type { BattleContext } from '../../../js/context/battleContext';

	interface Props {
		context: GameContext;
		isBattle: boolean;
		combo?: boolean;
		comboPokemon?: PokemonInstance | undefined;
		battleSwitchOpened?: boolean;
		forceChange?: boolean;
		selected?: number;
		itemToUse?: number | undefined;
		zIndex: number;
		onChange: (poke: PokemonInstance | undefined) => void;
		onCombo: (combo: { pokemon: PokemonInstance; move: MoveInstance } | undefined) => void;
	}

	let {
		context,
		isBattle,
		combo = $bindable(false),
		comboPokemon = $bindable(undefined),
		battleSwitchOpened = $bindable(false),
		forceChange = false,
		selected = $bindable(0),
		itemToUse = undefined,
		zIndex,
		onChange,
		onCombo
	}: Props = $props();

	let battleSummaryOpened = $state(false);
	let summaryOpened = $state(context.overWorldContext.menus.openSummary);
	let numberOfOptions = $derived(
		!!itemToUse
			? 2
			: isBattle
				? combo
					? context.player.monsters.at(selected)?.moves?.length || 0
					: 3
				: 4
	);
	let switchToIdx: number | undefined = $state(undefined);
	let openOptions = $state(false);
	let optionSelected = $state(0);
	let emptyslots = $state(new Array(6 - context.player.monsters.length).fill(0));

	let first: PokemonInstance | undefined = $state(context.player.monsters?.[0]);
	let others: PokemonInstance[] = $state(context.player.monsters.slice(1));
	let battleContext: BattleContext | undefined = $state(undefined);

	$effect(() => {
		if (!battleContext) {
			first = context.player.monsters?.[0];
			others = context.player.monsters.slice(1);
		}
	});

	let itemName = $derived(itemToUse && context.ITEMS.getItem(itemToUse)?.name);
	let zIndexNext = $derived(zIndex + 1);

	$effect(() => {
		const unsubscribe = context.battleContext.subscribe((value) => {
			battleContext = value;
			if (value) {
				first = battleContext?.playerSide?.[0];
				others = context.player.monsters.filter((pkmn) => pkmn !== first);
			}
		});
		return () => unsubscribe();
	});

	$effect(() => {
		const unsubscribe = context.overWorldContext.menus.openSummary$.subscribe((value) => {
			summaryOpened = value;
		});
		return () => unsubscribe();
	});

	function getPercentage(monster: PokemonInstance | undefined) {
		if (!monster) return 0;
		return (monster.currentHp / monster.currentStats.hp) * 100 || 0;
	}

	function select(index: number) {
		if (index === selected) {
			if (switchToIdx != undefined && selected != undefined) {
				switchTo();
			} else {
				openOptions = !openOptions;
			}
		} else {
			selected = index;
			openOptions = false;
		}
	}

	let currentBattlePokemon: PokemonInstance | undefined = $state(undefined);
	$effect(() => {
		onChange(currentBattlePokemon);
	});

	let currentCombo: { pokemon: PokemonInstance; move: MoveInstance } | undefined =
		$state(undefined);
	$effect(() => {
		onCombo(currentCombo);
	});

	function switchNow() {
		//swap(save.player.monsters, selected, 0);
		closeList();
		currentBattlePokemon = others[selected - 1];
	}

	function saveSwitch() {
		switchToIdx = selected;
		openOptions = false;
	}

	function switchTo() {
		if (switchToIdx != undefined && selected != undefined) {
			swap(context.player.monsters, selected, switchToIdx);
			first = context.player.monsters?.[0];
			others = context.player.monsters.slice(1);
			switchToIdx = undefined;
			context.player.setFollower(first);
		}
	}

	const swap = (array: PokemonInstance[], index1: number, index2: number) => {
		array[index1] = array.splice(index2, 1, array[index1])[0];
	};

	function summarize() {
		if (isBattle) {
			battleSummaryOpened = true;
		} else {
			context.overWorldContext.menus.summaryIndex = selected;
			context.overWorldContext.openMenu(MenuType.SUMMARY);
		}
	}

	function closeList() {
		if (isBattle && combo) {
			combo = false;
		} else if (isBattle && !itemToUse) {
			//context.overWorldContext.closeMenu(MenuType.SWITCH);
			battleSwitchOpened = false;
		} else {
			context.overWorldContext.closeMenu(MenuType.POKEMON_LIST);
			if (context.overWorldContext.menus.bagOpened) {
				context.overWorldContext.closeMenu(MenuType.BAG);
			}
		}
	}

	function useItem() {
		if (!isBattle && itemToUse) {
			let selectedMons = context.player.monsters.at(selected);
			context.player.bag.use(itemToUse, context.ITEMS, selectedMons);
			context.player.name = context.player.name;
		} else {
			let selectedMons = selected === 0 ? first : others[selected - 1];
			onChange(selectedMons);
		}
		openOptions = false;
		setTimeout(() => {
			closeList();
		}, 1000);
	}

	function selectCombo(index: number) {
		comboPokemon = context.player.monsters.at(selected);
		if (combo && comboPokemon) {
			combo = false;
			currentCombo = { pokemon: comboPokemon, move: comboPokemon.moves[index] };
		}
	}

	const listener = (e: KeyboardEvent) => {
		if (summaryOpened || battleSummaryOpened) return;
		if (!openOptions) {
			if (e.key === 'ArrowUp') {
				selected = selected === 0 ? others.length : selected - 1;
			} else if (e.key === 'ArrowDown') {
				selected = selected === others.length ? 0 : selected + 1;
			} else if (e.key === 'Enter') {
				if (switchToIdx != undefined && selected != undefined) {
					switchTo();
				} else {
					openOptions = true;
				}
			} else if (e.key === 'Escape') {
				closeList();
			}
		} else {
			if (e.key === 'ArrowUp') {
				optionSelected = optionSelected === 0 ? numberOfOptions : optionSelected - 1;
			} else if (e.key === 'ArrowDown') {
				optionSelected = optionSelected === numberOfOptions ? 0 : optionSelected + 1;
			} else if (e.key === 'Enter') {
				if (!!itemToUse) {
					if (optionSelected === 0) {
						useItem();
					} else if (optionSelected === numberOfOptions) {
						openOptions = false;
					}
				} else {
					if (optionSelected === 0) {
						summarize();
					} else if (optionSelected === numberOfOptions) {
						openOptions = false;
					} else if (optionSelected === 1 && !isBattle && !itemToUse) {
						saveSwitch();
					} else if (optionSelected === 2 && !isBattle) {
						context.overWorldContext.openMenu(MenuType.BAG);
					}
				}
			} else if (e.key === 'Escape') {
				openOptions = false;
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
	class="pokemon-list"
	style="--zIndex:{zIndex}"
	in:slide={{ duration: 500, delay: 100, axis: 'x', easing: backInOut }}
	out:fade
>
	<div class="close">
		{#if !forceChange}
			<button onclick={() => closeList()} aria-label="Close Pokemon list">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
					></path></svg
				>
			</button>
		{/if}
	</div>
	<div class="pokemons">
		<div class="first">
			<div
				class="poke-card big"
				class:selected={selected === 0}
				class:switching={switchToIdx === 0}
				onclick={() => select(0)}
			>
				<div class="header">
					<div class="img-wrapper">
						<img src={first?.getSprite()} alt={first?.name} />
					</div>
					<div>
						<span>{first?.name}</span>
						<span>Lv{first?.level}</span>
					</div>
					<!-- img, name, level, gender-->
				</div>

				<div class="footer">
					<div class="hp">
						<span>HP</span>
						<div class="progressbar-wrapper">
							<div
								class="progressbar"
								class:warning={getPercentage(first) <= 50}
								class:danger={getPercentage(first) < 15}
								style="--width:{getPercentage(first) + '%'}"
							></div>
						</div>
					</div>
					<span class="hp-value">{first?.currentHp} / {first?.currentStats?.hp}</span>
				</div>
			</div>
		</div>
		<div class="others">
			{#each others as monster, index}
				<div
					class="poke-card"
					class:selected={selected === index + 1}
					class:switching={switchToIdx === index + 1}
					onclick={() => select(index + 1)}
				>
					<div class="header">
						<div class="img-wrapper">
							<img src={monster?.getSprite()} alt={monster.name} />
						</div>
						<div>
							<span>{monster.name}</span>
							<span>Lv{monster.level}</span>
						</div>
						<!-- img, name, level, gender-->
					</div>

					<div class="footer">
						<div class="hp">
							<span>HP</span>
							<div class="progressbar-wrapper">
								<div
									class="progressbar"
									class:warning={getPercentage(monster) <= 50}
									class:danger={getPercentage(monster) < 15}
									style="--width:{getPercentage(monster) + '%'}"
								></div>
							</div>
						</div>
						<span class="hp-value">{monster?.currentHp} / {monster?.currentStats.hp}</span>
					</div>
				</div>
			{/each}

			{#each emptyslots as _}
				<div class="poke-card empty"></div>
			{/each}
		</div>
	</div>

	<div class="options" class:hidden={!openOptions} role="menu" aria-label="Pokemon options">
		{#if combo && battleContext && battleContext.player.monsters.at(selected)}
			<ul>
				{#each battleContext.player.monsters.at(selected)?.moves || [] as move, index}
					<li
						class:selected={optionSelected === index}
						onclick={() => {
							selectCombo(index);
							closeList();
						}}
						role="menuitem"
					>
						{move?.name}
					</li>
				{/each}
			</ul>
		{:else}
			<ul>
				{#if !!itemToUse}
					<li class:selected={optionSelected === 0} onclick={() => useItem()} role="menuitem">
						USE ({itemName})
					</li>
					<li
						class:selected={optionSelected === 1}
						onclick={() => (openOptions = false)}
						role="menuitem"
					>
						CANCEL
					</li>
				{:else}
					<li class:selected={optionSelected === 0} onclick={() => summarize()} role="menuitem">
						SUMMARY
					</li>
					{#if !isBattle || selected !== 0}
						<li
							class:selected={optionSelected === 1}
							onclick={() => (isBattle ? switchNow() : saveSwitch())}
							role="menuitem"
						>
							SWITCH
						</li>
					{/if}
					{#if !isBattle}
						<li
							class:selected={optionSelected === 2}
							onclick={() => {
								context.overWorldContext.openMenu(MenuType.BAG);
								openOptions = false;
							}}
							role="menuitem"
						>
							ITEM
						</li>
					{/if}
					<li
						class:selected={optionSelected === 3}
						onclick={() => (openOptions = false)}
						role="menuitem"
					>
						CANCEL
					</li>
				{/if}
			</ul>
		{/if}
	</div>
</div>

{#if summaryOpened || battleSummaryOpened}
	<PokemonSummary
		bind:context
		{selected}
		bind:isBattle
		bind:battleSummaryOpened
		zIndex={zIndex + 100}
		pkmnList={context.player.monsters}
	/>
{/if}

{#if context.overWorldContext.menus.bagOpened && !itemToUse}
	<Bag
		bind:context
		{isBattle}
		selectedMons={selected}
		zIndex={zIndexNext}
		onChange={() => context.overWorldContext.closeMenu(MenuType.BAG)}
	/>
{/if}

<style lang="scss">
	.close {
		position: absolute;
		top: 4%;
		left: 2%;
		width: 46px;

		button {
			height: 46px;
			width: 46px;
			color: white;
			background-color: transparent;
			border: none;
			outline: none;
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
		background: var(--pixel-bg-panel);
		border: 2px solid var(--pixel-border-color);
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		border-radius: 0;
		color: var(--pixel-text-white);
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
				cursor: pointer;
				&.selected::before {
					content: '';
					width: 0;
					height: 0;
					border-top: 12px solid transparent;
					border-bottom: 12px solid transparent;
					border-left: 12px solid var(--pixel-text-gold);
					position: absolute;
					left: 5px;
					margin-top: 2px;
				}
			}
		}
	}

	.pokemon-list {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		background-color: var(--pixel-bg-primary);
		background-position: top left;
		background-repeat: round;
		z-index: var(--zIndex, 8);

		.pokemons {
			height: 100%;
			width: 100%;
			display: flex;
			background-color: transparent;

			.first {
				width: 40%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			}

			.others {
				width: 60%;
				padding: 1%;
				display: flex;
				flex-direction: column;
				gap: 1%;
				box-sizing: border-box;
				align-items: flex-start;
				justify-content: center;

				.poke-card {
					/*flex-grow: 1;*/
					height: calc((100dvh - (4px * 6)) / 5);

					&.empty {
						background: none;
						border: none;
					}
				}
			}

			.poke-card {
				font-size: 32px;
				color: white;
				text-shadow: 1px 1px 1px black;
				display: flex;
				flex-direction: row;
				gap: 5%;
				width: 100%;

				padding: 0 2% 0 0;
				box-sizing: border-box;
				border-radius: 0;
				justify-content: space-between;
				align-items: center;

				border: 2px solid #000;
				background-color: #143855;
				background-size: 100% 100%;

				&.big {
					flex-direction: column;
					width: 86%;
					padding: 4%;
					align-items: normal;

					.header {
						padding-right: 2%;
						width: 100%;

						.img-wrapper {
							img {
								max-width: 70%;
								height: auto;
							}
						}
					}

					.footer {
						width: 100%;

						.hp {
							width: 60%;
						}
					}
				}

				&.selected {
					border: 3px solid var(--pixel-text-gold);
					animation: pixel-pulse 1s infinite;
					background-color: var(--pixel-bg-panel);
					color: var(--pixel-text-white);
					text-shadow: 1px 1px 1px black;
				}

				&.switching {
					border: 6px solid greenyellow;
				}

				.header {
					display: flex;
					flex-direction: row;
					position: relative;
					justify-content: space-around;
					//gap: 2%;
					height: 100%;
					width: 55%;
					align-items: center;

					div {
						display: flex;
						flex-direction: column;
						align-items: center;
						width: 33%;
						//text-shadow: 2px 1px 1px black;
					}

					.img-wrapper {
						img {
							max-width: 50%;
							height: auto;
						}
					}
				}

				.footer {
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					justify-content: center;
					width: 45%;
					/*background-color: #95cfe0;*/

					.hp {
						width: 100%;
						display: flex;
						height: 18px;
						//gap: 16px;
						background-color: #262626;
						font-size: 24px;
						color: orange;
						align-items: center;
						justify-content: space-evenly;
						border-radius: 0;
						padding: 3px;

						& > span {
							padding: 0 12px;
							font-weight: bold;
						}

						.progressbar-wrapper {
							height: 12px;
							width: 100%;
							background-color: #595b59;
							border-radius: 0;
							border: 2px solid #000;

							.hp-value {
								text-shadow: 2px 1px 1px black;
							}

							.progressbar {
								width: var(--width);
								height: 100%;
								background: rgb(86, 170, 58);
								text-align: center;
								border-radius: 0;

								transition:
									width 1s ease-in-out,
									background 1s ease-in-out 1s;

								&.warning {
									background: rgba(255, 194, 16, 1);
								}

								&.danger {
									background: rgba(223, 85, 48, 1);
								}
							}
						}
					}
				}
			}
		}

		.actions {
			position: absolute;
			bottom: 4px;
			left: 4px;
			width: calc(100% / 5);

			button {
				width: 100%;
				font-size: 32px;
				text-align: center;
				font-family: pokemon, serif;
				color: white;
				text-shadow: 3px 1px 2px #54506c;
				background-color: #5c438966;
				border-radius: 0;
				border: 2px solid rgba(0, 0, 0, 0.7);
			}
		}
	}

	@keyframes pixel-pulse {
		0%,
		100% {
			border-color: #ffd700;
		}
		50% {
			border-color: #fff;
		}
	}
</style>
