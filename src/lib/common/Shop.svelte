<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameContext } from '../../js/context/gameContext';
	import type { OpenShop } from '../../js/scripting/scripts';

	export let shop: OpenShop | undefined;
	export let context: GameContext;
	let unsubscribe: Unsubscriber;
	// @ts-ignore
	let items = Object.keys(shop.items).map((key) => {
		let item = context.ITEMS.getItem(Number.parseInt(key));
		// @ts-ignore
		return { id: key, name: item?.name, price: shop.items[key], desc: item?.description };
	});
	let selected = 0;
	$: selectedItem = items[selected];
	let openQty = false;
	let qty = 1;

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			if (openQty) {
				cancel();
			} else {
				context.playingScript?.nextAction(context);
			}
		}
		if (e.key === 'ArrowDown' && !openQty) {
			selected = Math.min(selected + 1, items.length - 1);
		}
		if (e.key === 'ArrowUp' && !openQty) {
			selected = Math.max(selected - 1, 0);
		}
		if (e.key === 'ArrowUp' && openQty) {
			more();
		}
		if (e.key === 'ArrowDown' && openQty) {
			less();
		}
		if (e.key === 'Enter') {
			if (!openQty) {
				openQty = true;
			} else {
				buy();
			}
		}
	};

	function more() {
		if ((qty + 1) * selectedItem.price <= context.player.bag.money) {
			qty = qty + 1 > 99 ? 0 : qty + 1;
		}
	}

	function less() {
		qty = qty - 1 < 1 ? Math.floor(context.player.bag.money / selectedItem.price) : qty - 1;
	}

	function cancel() {
		openQty = false;
		qty = 1;
	}

	function buy() {
		if (qty * selectedItem.price <= context.player.bag.money) {
			context.player.bag.money -= qty * selectedItem.price;
			context.player.bag.addItems(Number.parseInt(selectedItem.id), qty, context.ITEMS);
			openQty = false;
			qty = 1;
		}
	}

	onMount(() => {
		window.addEventListener('keydown', listener);
		setTimeout(() => {
			unsubscribe = context.overWorldContext.keys.a?.subscribe((value) => {
				if (value) {
					if (!openQty) {
						openQty = true;
					} else {
						buy();
					}
				}
			});
		}, 200);

		return () => {
			window.removeEventListener('keydown', listener);
		};
	});
</script>

<div class="shop">
	<div class="desc">
		<div class="inner">
			<span>{items[selected].desc}</span>
		</div>
	</div>
	<div class="right">
		<div class="money">
			{context.player.name}
			{context.player.bag.money | 0}$
		</div>
		<ul class="items">
			{#each items as item, index}
				<li
					class:selected={selected === index}
					on:click={() => {
						selected = index;
						openQty = true;
					}}
				>
					<span>{item.name}</span>
					<span>{item.price} $</span>
				</li>
			{/each}
		</ul>

		{#if openQty}
			<div class="qty">
				<div class="value">
					<span>
						x{qty} = {qty * selectedItem.price}$
					</span>
					<div class="more-less">
						<button on:click={() => more()}>+</button>
						<button on:click={() => less()}>-</button>
					</div>
				</div>

				<div class="buy-cancel">
					<button class="button outline" on:click={() => cancel()}>Cancel</button>
					<button class="button primary" on:click={() => buy()}>Buy</button>
				</div>
			</div>
		{/if}
	</div>

	<div class="close">
		<button on:click={() => context.playingScript?.nextAction(context)}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
				></path></svg
			>
		</button>
	</div>
</div>

<style lang="scss">
	.shop {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 100;
		color: white;

		.close {
			position: absolute;
			top: 4%;
			left: 2%;
			width: 60px;

			button {
				height: 60px;
				width: 60px;
				color: white;
				background-color: transparent;
				border: none;
				outline: none;
			}
		}

		.desc {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 50dvw;
			height: 25dvh;
			background: rgb(0, 29, 43);
			background: -moz-linear-gradient(
				140deg,
				rgb(0, 29, 43) 0%,
				rgb(3, 84, 142) 42%,
				rgb(0, 195, 230) 100%
			);
			background: -webkit-linear-gradient(
				140deg,
				rgb(0, 29, 43) 0%,
				rgb(3, 84, 142) 42%,
				rgb(0, 195, 230) 100%
			);
			background: linear-gradient(
				140deg,
				rgb(0, 29, 43) 0%,
				rgb(3, 84, 142) 42%,
				rgb(0, 195, 230) 100%
			);
			z-index: 101;

			.inner {
				border-radius: 9px;
				background-color: rgba(0, 0, 0, 0.5);
				position: absolute;
				bottom: 8px;
				left: 8px;
				width: calc(50dvw - 16px);
				height: calc(25dvh - 16px);
				display: flex;
				flex-direction: column;
				justify-content: space-around;
				align-items: center;
			}
		}

		.right {
			position: absolute;
			top: 0;
			right: 0;
			width: 50dvw;
			height: 100dvh;
			background: rgb(0, 29, 43);
			background: -moz-linear-gradient(
				140deg,
				rgb(0, 29, 43) 0%,
				rgb(3, 84, 142) 42%,
				rgb(0, 195, 230) 100%
			);
			background: -webkit-linear-gradient(
				140deg,
				rgb(0, 29, 43) 0%,
				rgb(3, 84, 142) 42%,
				rgb(0, 195, 230) 100%
			);
			background: linear-gradient(
				140deg,
				rgb(0, 29, 43) 0%,
				rgb(3, 84, 142) 42%,
				rgb(0, 195, 230) 100%
			);
			z-index: 101;

			.money {
				padding: 16px;
				height: 10dvh;
			}

			.items {
				padding: 16px;
				height: 90dvh;
				overflow-y: auto;
				list-style: none;
				margin: 0;

				li {
					padding: 8px;
					border-bottom: 1px solid rgba(255, 255, 255, 0.1);
					display: flex;
					justify-content: space-between;

					&.selected {
						border-bottom: 1px solid rgba(255, 255, 255, 1);
					}
				}
			}

			.qty {
				position: absolute;
				bottom: 16px;
				right: 16px;
				width: calc(50dvw - 32px);
				padding: 8px;
				background-color: rgba(0, 0, 0, 0.5);
                border-radius: 8px;
				z-index: 102;
				display: flex;
				gap: 8px;
				flex-wrap: wrap;
				justify-content: space-between;
				align-items: center;

				.value {
					display: flex;
					gap: 8px;
					align-items: center;

					span {
						padding: 16px;
						font-size: 32 px;
						text-align: center;
						background-color: rgba(0, 0, 0, 0.5);
						color: white;
						border: none;
						border-radius: 9px;
					}

					.more-less {
						display: flex;
						flex-direction: column;
						gap: 8px;

						button {
							height: 28px;
							width: 42px;

							border-radius: 4px;
							border: 1px solid black;
							background: rgba(84, 80, 108, 0.2);
							color: white;
                            font-size: 28px;
						}
					}
				}

				.buy-cancel {
					button {
						font-size: 32px;
                        color: white;
					}
				}
			}
		}
	}
</style>
