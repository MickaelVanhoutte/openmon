<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameContext } from '../../../js/context/gameContext';
	import { MenuType } from '../../../js/context/overworldContext';

	export let context: GameContext;
	let optionsOpened = false;

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
	<div class="row head">
		<div class="column back">
			<button on:click={() => close()}>BACK</button>
		</div>
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

		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			width: 100%;
		}

		.column {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
		}

		.head {
			height: 12%;
			padding: 2%;
			box-sizing: border-box;
		}

		.back {
			button {
				padding: 4px 16px;
				height: 28px;
				position: relative;
				z-index: 999;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 26px;
				text-transform: uppercase;
				cursor: pointer;
				border-radius: 4px;
				font-family: 'pokemon';
				color: white;
				background: rgba(0, 0, 0, 0.2);
				border: 1px solid white;
			}
		}
	}
</style>
