<script lang="ts">
	import { onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';
	import type { GameContext } from '../../js/context/gameContext';
	import type { OpenShop } from '../../js/scripting/scripts';

	interface Props {
		shop: OpenShop | undefined;
		context: GameContext;
	}

	const { shop, context }: Props = $props();

	let unsubscribe: Unsubscriber;
	const items = Object.keys(shop?.items || {}).map((key) => {
		const item = context.ITEMS.getItem(Number.parseInt(key));
		return {
			id: key,
			name: item?.name,
			price: shop?.items[key as unknown as number] || 0,
			desc: item?.description
		};
	});
	let selected = $state(0);
	const selectedItem = $derived(items[selected]);
	let openQty = $state(false);
	let qty = $state(1);

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			if (openQty) {
				cancel();
			} else {
				context.scriptRunner?.playingScript?.nextAction(context);
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
			unsubscribe?.();
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
					onclick={() => {
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
						<button onclick={() => more()} aria-label="Increase quantity">+</button>
						<button onclick={() => less()} aria-label="Decrease quantity">-</button>
					</div>
				</div>

				<div class="buy-cancel">
					<button class="button outline" onclick={() => cancel()}>Cancel</button>
					<button class="button primary" onclick={() => buy()}>Buy</button>
				</div>
			</div>
		{/if}
	</div>

	<div class="close">
		<button
			onclick={() => context.scriptRunner?.playingScript?.nextAction(context)}
			aria-label="Close shop"
		>
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
		background-color: #1c4b72;
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
				background-color: #334455;
				border: 2px solid #000;
				outline: none;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;

				&:hover {
					filter: brightness(1.1);
				}
			}
		}

		.desc {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 50dvw;
			height: 25dvh;
			background: var(--pixel-bg-panel);
			border: 2px solid var(--pixel-border-color);
			box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
			z-index: 101;

			.inner {
				border-radius: 0;
				background-color: transparent;
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
			background: var(--pixel-bg-panel);
			border: 2px solid var(--pixel-border-color);
			box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
			z-index: 101;

			.money {
				padding: 16px;
				height: 10dvh;
				font-size: 24px;
				font-weight: bold;
				color: var(--pixel-text-gold);
			}

			.items {
				padding: 16px;
				height: 90dvh;
				overflow-y: auto;
				list-style: none;
				margin: 0;

				li {
					padding: 12px;
					background: var(--pixel-bg-primary);
					border: 2px solid var(--pixel-border-color);
					margin-bottom: 8px;
					display: flex;
					justify-content: space-between;
					cursor: pointer;

					&.selected {
						border: 3px solid var(--pixel-text-gold);
					}

					span:last-child {
						color: var(--pixel-text-gold);
					}
				}
			}

			.qty {
				position: absolute;
				bottom: 16px;
				right: 16px;
				width: calc(50dvw - 32px);
				padding: 16px;
				background: var(--pixel-bg-panel);
				border: 2px solid var(--pixel-border-color);
				box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
				border-radius: 0;
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
						font-size: 32px;
						text-align: center;
						background: #1c4b72;
						color: white;
						border: 2px solid #000;
						border-radius: 0;
					}

					.more-less {
						display: flex;
						flex-direction: column;
						gap: 8px;

						button {
							height: 28px;
							width: 42px;
							border-radius: 0;
							border: 2px solid #000;
							background: #334455;
							color: white;
							font-size: 28px;
							display: flex;
							align-items: center;
							justify-content: center;
							cursor: pointer;

							&:hover {
								filter: brightness(1.1);
							}
						}
					}
				}

				.buy-cancel {
					display: flex;
					gap: 8px;

					button {
						font-size: 24px;
						color: white;
						background: #334455;
						border: 2px solid #000;
						min-height: 44px;
						padding: 0 16px;
						cursor: pointer;

						&:hover {
							filter: brightness(1.1);
						}
					}
				}
			}
		}
	}
</style>
