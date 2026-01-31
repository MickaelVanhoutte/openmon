<script lang="ts">
	import type { BattleContext } from '../../../js/context/battleContext';
	import type { GameContext } from '../../../js/context/gameContext';
	import { Pokeball, getCaptureRate } from '../../../js/items/items';
	import { UseItemAction } from '../../../js/items/items-model';
	import type { PokemonInstance } from '../../../js/pokemons/pokedex';
	import { backInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	interface Props {
		context: GameContext;
		battleCtx: BattleContext;
		currentPkmn: PokemonInstance;
		zIndex: number;
		onChange?: (item: UseItemAction) => void;
	}

	let { context, battleCtx, currentPkmn, zIndex, onChange = () => {} }: Props = $props();

	const categories: Record<number, string> = {
		0: 'potions',
		1: 'revives',
		2: 'balls'
	};

	let isWild = battleCtx.isWild;
	let selectedIdx = $state(0);
	let itemIdx = $state(0);

	let pocket = $derived(
		Object.keys(context.player.bag[categories[selectedIdx]])?.map((id) => [
			id,
			context.player.bag[categories[selectedIdx]][id]
		])
	);
	let itemToUse = $derived((pocket && pocket[itemIdx]?.[0]) || undefined);
	let item = $derived(context.ITEMS.getItem(itemToUse));

	let disabled = $derived(
		(categories[selectedIdx] === 'potions' &&
			currentPkmn.currentHp === currentPkmn.currentStats.hp) ||
			(categories[selectedIdx] === 'revives' && !currentPkmn.fainted)
	);

	function catchPkmn() {
		let instance = context.ITEMS.getItem(itemToUse)?.instanciate();
		if (instance && instance instanceof Pokeball) {
			onChange(new UseItemAction(itemToUse));
		}
	}

	function useItem(pkmnIndex: number) {
		let instance = context.ITEMS.getItem(itemToUse)?.instanciate();
		let pkmn = context.player.monsters[pkmnIndex];
		if (instance && !(instance instanceof Pokeball)) {
			onChange(new UseItemAction(itemToUse, pkmn));
		}
	}
</script>

<div
	class="mini-bag"
	style="--zIndex: {zIndex}"
	in:slide={{ duration: 500, delay: 100, axis: 'y', easing: backInOut }}
	out:slide={{ duration: 500, delay: 100, axis: 'y', easing: backInOut }}
>
	<nav class="nav" role="navigation" aria-label="Battle bag">
		<div class="nav-left">
			<div class="tabs" role="tablist">
				<a
					class:active={selectedIdx === 0}
					onclick={() => (selectedIdx = 0)}
					role="tab"
					aria-selected={selectedIdx === 0}>Healing</a
				>
				<a
					class:active={selectedIdx === 1}
					onclick={() => (selectedIdx = 1)}
					role="tab"
					aria-selected={selectedIdx === 1}>Revive</a
				>
				{#if isWild}
					<a
						class:active={selectedIdx === 2}
						onclick={() => (selectedIdx = 2)}
						role="tab"
						aria-selected={selectedIdx === 2}>Pokeballs</a
					>
				{/if}
			</div>
		</div>

		<div class="items">
			<div class="item-list">
				<ul>
					{#each pocket as [id, qty], idx}
						<li>
							<div
								class="item"
								class:selected={itemIdx === idx}
								onclick={() => {
									itemIdx = idx;
								}}
							>
								<span>{context.ITEMS.getItem(id)?.name}</span>
								<span>x {qty}</span>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</nav>

	{#if selectedIdx !== 2}
		<div class="pokes">
			<ul>
				{#each context.player.monsters as poke, idx}
					<li>
						<div class="poke">
							<button
								{disabled}
								class="button"
								onclick={() => useItem(idx)}
								aria-label="Use item on {poke.name}">Use</button
							>
							<img src={poke.getSprite()} alt={poke.name} />
							<div class="hp-status">
								<div class="hp">
									<span>HP</span>
									<div class="progressbar-wrapper">
										<span class="hp-value">{poke.currentHp} / {poke.currentStats.hp}</span>
										<div
											class="progressbar"
											class:warning={(poke.currentHp / poke.currentStats.hp) * 100 <= 50}
											class:danger={(poke.currentHp / poke.currentStats.hp) * 100 < 15}
											style="--width:{(poke.currentHp / poke.currentStats.hp) * 100 + '%'}"
										></div>
									</div>
								</div>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<div class="pokes" style="height: calc(100% / 8); margin-top: 10%">
			<ul>
				<li style="height: 100%">
					<div
						class="poke catch"
						style="height: 100%"
						data-rate={`Catch rate: ${Math.floor(getCaptureRate(battleCtx.opponentPokemon, item?.power || 0) * 100)}%`}
					>
						<button class="button" onclick={() => catchPkmn()} aria-label="Catch wild Pokemon"
							>Catch</button
						>
						<img
							src={battleCtx.opponentPokemon?.sprites?.[battleCtx.opponentPokemon?.gender]?.front[
								battleCtx.opponentPokemon.isShiny ? 'shiny1' : 'frame1'
							] ||
								battleCtx.opponentPokemon?.sprites?.male?.front[
									battleCtx.opponentPokemon.isShiny ? 'shiny1' : 'frame1'
								]}
							alt={battleCtx.opponentPokemon.name}
						/>
						<div class="hp-status">
							<div class="hp">
								<span>HP</span>
								<div class="progressbar-wrapper">
									<div
										class="progressbar"
										class:warning={(battleCtx.opponentPokemon.currentHp /
											battleCtx.opponentPokemon.currentStats.hp) *
											100 <=
											50}
										class:danger={(battleCtx.opponentPokemon.currentHp /
											battleCtx.opponentPokemon.currentStats.hp) *
											100 <
											15}
										style="--width:{(battleCtx.opponentPokemon.currentHp /
											battleCtx.opponentPokemon.currentStats.hp) *
											100 +
											'%'}"
									></div>
								</div>
							</div>
						</div>
					</div>
				</li>
			</ul>
		</div>
	{/if}
</div>

<style lang="scss">
	.mini-bag {
		position: absolute;
		bottom: 1%;
		left: 1%;
		width: 98%;
		height: 98%;
		background-color: rgba(88, 83, 100, 0.95);
		box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.7);
		z-index: var(--zIndex, 100);
		border-radius: 8px;
		gap: 2%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		color: white;
		padding: 1%;

		.pokes {
			width: 50%;
			height: 90%;
			margin-top: 5%;
			ul {
				list-style: none;
				padding: 0;
				margin: 0;
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-around;
				align-items: flex-start;

				li {
					margin: 0;
					padding: 0;
					height: calc(100% / 8);
					width: 100%;
					display: flex;
					flex-direction: row;
					padding: 0 1%;

					border: 1px solid black;
					border-radius: 32px;
					background: rgba(0, 0, 0, 0.36);
				}
			}
		}

		.poke {
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 100%;
			position: relative;

			&.catch:before {
				content: attr(data-rate);
				position: absolute;
				top: -46px;
				left: 0;
				background: rgba(0, 0, 0, 0.36);
				color: white;
				padding: 4px 12px;
				border-radius: 12px;
			}

			img {
				max-height: 100%;
			}

			button.button {
				padding: 0;
				aspect-ratio: 1 / 1;
				height: 80%;
				border-radius: 50%;
			}

			.hp-status {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				width: calc(100% / 2);

				.hp {
					width: 100%;
					display: flex;
					background-color: rgba(0, 0, 0, 0.45);
					color: orange;
					align-items: center;
					justify-content: space-evenly;
					border-radius: 5px;
					padding: 2px 4px;

					& > span {
						font-size: 20px;
						padding: 0 12px;
						font-weight: bold;
					}

					.progressbar-wrapper {
						height: 14px;
						width: 100%;
						background-color: #595b59;
						border-radius: 4px;
						//border: 2px solid white;
						position: relative;

						.hp-value {
							position: absolute;
							//mix-blend-mode: difference;
							font-size: 18px;
							color: white;
							left: 50%;
							top: 50%;
							transform: translate(-50%, -50%);
						}

						.progressbar {
							width: var(--width);
							height: 100%;
							background: rgb(184, 244, 166);
							background: linear-gradient(
								0deg,
								rgb(86, 170, 58) 0%,
								rgb(86, 170, 58) 50%,
								rgb(86, 170, 58) 100%
							);
							border-radius: 2px;
							display: flex;
							text-align: center;
							align-items: center;
							justify-content: center;
							transition: width 1s ease-in-out;

							&.warning {
								background: rgb(255, 241, 164);
								background: linear-gradient(
									0deg,
									rgba(255, 194, 16, 1) 0%,
									rgba(255, 194, 16, 1) 50%,
									rgba(255, 194, 16, 1) 100%
								);
							}

							&.danger {
								background: rgb(244, 177, 159);
								background: linear-gradient(
									0deg,
									rgba(223, 85, 48, 1) 0%,
									rgba(223, 85, 48, 1) 50%,
									rgba(223, 85, 48, 1) 100%
								);
							}
						}
					}
				}
			}
		}

		nav.nav {
			height: 100%;
			width: 50%;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			justify-content: flex-start;
			gap: 4%;

			.tabs {
				a {
					color: white;
				}
			}
		}

		.items {
			height: 80%;
			width: 100%;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
			gap: 2%;

			.item-list {
				width: 70%;
				height: 100%;
				overflow-y: auto;
				ul {
					list-style: none;
					padding: 0;
					margin: 0;
					li {
						margin: 0;
						padding: 0;
						.item {
							width: 100%;
							height: 50px;
							display: flex;
							flex-direction: row;
							justify-content: space-between;
							align-items: center;
							padding: 0 2%;
							cursor: pointer;
							&:hover {
								background-color: rgba(255, 255, 255, 0.1);
							}
							&:not(.selected) {
								&:hover {
									background-color: rgba(255, 255, 255, 0.1);
								}
							}
							&.selected {
								background-color: rgba(255, 255, 255, 0.2);
							}
						}
					}
				}
			}
		}
	}
</style>
