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
			if ((qty + 1) * selectedItem.price <= context.player.bag.money) {
				qty = qty + 1 > 99 ? 0 : qty + 1;
			}
		}
		if (e.key === 'ArrowDown' && openQty) {
			qty = qty - 1 < 1 ? Math.floor(context.player.bag.money / selectedItem.price) : qty - 1;
		}
		if (e.key === 'Enter') {
			if (!openQty) {
				openQty = true;
			} else {
				buy();
			}
		}
	};

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
			<span>{items[selected].name}</span>
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
				<li class:selected={selected === index}>
					<span>{item.name}</span>
					<span>{item.price} $</span>
				</li>
			{/each}
		</ul>

		{#if openQty}
			<div class="qty">
				<span>
					x{qty} = {qty * selectedItem.price}$
				</span>

				<div>
					<button class="button error" on:click={() => cancel()}>Cancel</button>
					<button class="button primary" on:click={() => buy()}>Buy</button>
				</div>
			</div>
		{/if}
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
				bottom: 16px;
				left: 16px;
				width: calc(50dvw - 32px);
				height: calc(25dvh - 32px);
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
				height: calc(25dvh - 32px);
				background-color: rgba(0, 0, 0, 0.5);
				z-index: 101;
				display: flex;
				justify-content: space-around;
				align-items: center;

				span {
					// width: 50%;
					// height: 50%;
					padding: 16px;
					font-size: 32 px;
					text-align: center;
					background-color: rgba(0, 0, 0, 0.5);
					color: white;
					border: none;
					border-radius: 9px;
				}

				button {
					font-size: 32px;
				}
			}
		}
	}
</style>
