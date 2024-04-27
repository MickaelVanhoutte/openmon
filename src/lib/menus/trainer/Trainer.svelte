<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameContext } from '../../../js/context/gameContext';
	import { MenuType } from '../../../js/context/overworldContext';
	import TrainerCard from './TrainerCard.svelte';
	import TrainerMastery from './TrainerMastery.svelte';

	export let context: GameContext;
	let optionsOpened = false;
	let tab = 0;

	const tabs: Record<number, string> = {
		0: 'CARD',
		1: 'MASTERIES',
		2: 'SETTINGS'
	};

	function close() {
		if (optionsOpened) {
			optionsOpened = false;
			return;
		} else {
			context.overWorldContext.closeMenu(MenuType.TRAINER);
		}
	}

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			close();
		} else if (e.key === 'ArrowRight') {
			tab = (tab + 1) % 3;
		} else if (e.key === 'ArrowLeft') {
			tab = (tab + 2) % 3;
		}
	};

	onMount(() => {
		window.addEventListener('keydown', listener);
		return () => {
			window.removeEventListener('keydown', listener);
		};
	});
</script>

<div class="trainer">
	<nav class="nav">
		<div class="nav-left">
			<a class="brand">{context.player.name}</a>
			<div class="tabs">
				<a class:active={tab === 0} on:click={() => (tab = 0)}>{tabs[0]}</a>
				<a class:active={tab === 1} on:click={() => (tab = 1)}>{tabs[1]}</a>
				<a class:active={tab === 2} on:click={() => (tab = 2)}>{tabs[2]}</a>
			</div>
		</div>
		<div class="nav-right">
			<button class="back" on:click={() => close()}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
					><path
						d="M10.5859 12L2.79297 4.20706L4.20718 2.79285L12.0001 10.5857L19.793 2.79285L21.2072 4.20706L13.4143 12L21.2072 19.7928L19.793 21.2071L12.0001 13.4142L4.20718 21.2071L2.79297 19.7928L10.5859 12Z"
					></path></svg
				>
			</button>
		</div>
	</nav>

	<div class="tab-content">
		{#if tab === 0}
			<TrainerCard {context} />
		{:else if tab === 1}
			<TrainerMastery {context} />
		{:else if tab === 2}
		{/if}
	</div>
</div>

<style lang="scss">
	.trainer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;

		background: rgb(0, 29, 43);
		background: -moz-linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		background: -webkit-linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		background: linear-gradient(
			140deg,
			rgba(0, 29, 43, 1) 0%,
			rgba(3, 84, 142, 1) 42%,
			rgba(0, 195, 230, 1) 100%
		);
		color: #fff;
		z-index: 9;

		.nav {
			height: 46px;
			width: 100%;

			display: flex;
			align-items: center;

			background-color: #0078c0;
			font-size: 32px;
			color: white;
			text-shadow: 1px 1px 1px black;

			.nav-left {
				width: 72dvw;
				color: white;

				.brand {
					flex: unset;
					font-size: 36px;
					width: 40%;
					color: white;
					max-width: 40%;
					text-overflow: ellipsis;
					overflow: hidden;
					white-space: nowrap;
					text-align: left;
				}
			}
			.nav-right {
				width: 28dvw;
				display: flex;
				justify-content: space-between;
				justify-content: flex-end;
				gap: 12%;
			}

			.tabs a {
				color: white;
				border: none;

				&.active {
					color: #68c0c8;
				}
			}

			button {
				background-color: #68c0c8;
				border: none;
				width: 80px;
				height: 46px;
				display: flex;
				align-items: center;
				justify-content: center;
				z-index: 1;

				-webkit-touch-callout: none;
				-webkit-user-select: none;
				-khtml-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				user-select: none;
				-webkit-tap-highlight-color: rgba(0, 0, 0, 0);

				touch-action: pan-x pan-y;
				outline: none;

				&.back {
					font-family: pokemon, serif;
					background: none;
					font-size: 20px;
					color: white;
					text-shadow: 1px 1px 1px black;

					svg {
						height: 70%;
					}
				}
			}
		}

		.tab-content {
			height: calc(100% - 46px);
			width: 100%;
			box-sizing: border-box;
			background-color: #0e2742f0;
			//background-image: url('src/assets/menus/p-sum.jpg');
			background: rgb(0, 29, 43);
			background: -moz-linear-gradient(
				140deg,
				rgba(0, 29, 43, 1) 0%,
				rgba(3, 84, 142, 1) 42%,
				rgba(0, 195, 230, 1) 100%
			);
			background: -webkit-linear-gradient(
				140deg,
				rgba(0, 29, 43, 1) 0%,
				rgba(3, 84, 142, 1) 42%,
				rgba(0, 195, 230, 1) 100%
			);
			background: linear-gradient(
				140deg,
				rgba(0, 29, 43, 1) 0%,
				rgba(3, 84, 142, 1) 42%,
				rgba(0, 195, 230, 1) 100%
			);
			color: #fff;
			background-blend-mode: soft-light;
		}
	}
</style>
