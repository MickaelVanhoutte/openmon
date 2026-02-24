<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import DialogView from './DialogView.svelte';
	import { Dialog, Message } from '../../js/scripting/scripts';
	import type { GameContext } from '../../js/context/gameContext';
	import { SceneType } from '../../js/context/overworldContext';
	import type { Unsubscriber } from 'svelte/store';

	interface Props {
		context: GameContext;
		canvasWidth: number;
	}

	const { context, canvasWidth }: Props = $props();

	let pokeballs: HTMLDivElement;
	let aUnsubscribe: Unsubscriber;
	let bUnsubscribe: Unsubscriber;

	const translateZ = untrack(() => canvasWidth * 0.33);

	const monsters = untrack(() => [
		context.POKEDEX.findById(1).result,
		context.POKEDEX.findById(4).result,
		context.POKEDEX.findById(7).result
	]);

	let angle = $state(0);
	let currentIndex = $state(0);
	const currentPokemon = $derived(monsters[currentIndex]);
	const dialog = $derived(
		new Dialog([new Message(`Hmm... Is ${currentPokemon.name} my Pokemon ?`)])
	);

	function prev() {
		angle -= 360 / monsters?.length;
		currentIndex = (currentIndex + 1) % monsters.length;
	}

	function next() {
		angle += 360 / monsters?.length;
		currentIndex = (currentIndex - 1 + monsters.length) % monsters.length;
	}

	function select() {
		context.player.monsters[0] = currentPokemon.instanciate(5, 20);
		context.POKEDEX.setCaught(currentPokemon.id);
		context.player.setFollower(context.player.monsters[0]);
		context.overWorldContext.endScene(SceneType.STARTER_SELECTION);
		context.validateQuestObjective(0, 0);
	}

	const keyDownListener = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'ArrowRight':
				next();
				break;
			case 'ArrowLeft':
				prev();
				break;
			case 'Enter':
				select();
		}
	};

	let ts: number;
	const touchDown = (e: TouchEvent) => {
		ts = e.touches[0].clientX;
	};

	const touchUp = (e: TouchEvent) => {
		const te = e.changedTouches[0].clientX;
		if (Math.abs(ts - te) < 30) {
			return;
		}
		if (ts > te) {
			prev();
		} else {
			next();
		}
	};
	const mouseDown = (e: MouseEvent) => {
		ts = e.clientX;
	};
	const mouseUp = (e: MouseEvent) => {
		const te = e.clientX;
		if (Math.abs(ts - te) < 30) {
			return;
		}
		if (ts > te) {
			prev();
		} else {
			next();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', keyDownListener);
		pokeballs.addEventListener('touchstart', touchDown);
		pokeballs.addEventListener('touchend', touchUp);
		pokeballs.addEventListener('mousedown', mouseDown);
		pokeballs.addEventListener('mouseup', mouseUp);

		setTimeout(() => {
			aUnsubscribe = context.overWorldContext.keys.a?.subscribe((value) => {
				if (value) {
					select();
				}
			});
			bUnsubscribe = context.overWorldContext.keys.b?.subscribe((value) => {
				if (value) {
					next();
				}
			});
		}, 1000);

		return () => {
			window.removeEventListener('keydown', keyDownListener);
			pokeballs.removeEventListener('touchstart', touchDown);
			pokeballs.removeEventListener('touchend', touchUp);
			pokeballs.removeEventListener('mousedown', mouseDown);
			pokeballs.removeEventListener('mouseup', mouseUp);
			aUnsubscribe?.();
			bUnsubscribe?.();
		};
	});
</script>

<div class="starter-select" style="--cnv-width: {canvasWidth}px" bind:this={pokeballs}>
	<div class="pokeballs" style="--ang:{angle}">
		{#each monsters as monster, index}
			<div
				class="pokeball"
				class:selected={monster.id === currentPokemon.id}
				style="--translateZ:{translateZ}px;
                 --rotateY: {index * (360 / monsters?.length)}deg;"
			>
				<img
					class="image"
					alt="poke-{monster.id}"
					src={monster.getSprite()}
					class:current={monster.id === currentPokemon.id}
				/>
			</div>
		{/each}
	</div>
</div>

<DialogView {dialog} {context} />

<style lang="scss">
	.starter-select {
		position: absolute;
		top: 0;
		left: calc(50dvw - var(--cnv-width, 100dvw) / 2);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100dvh;
		width: var(--cnv-width, 100dvw);
		z-index: 7;
		background: #1c4b72;
		perspective: 700px;
		perspective-origin: center;

		.pokeballs {
			transform-style: preserve-3d;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 75dvh;
			width: var(--cnv-width, 100dvw);
			transform: rotateY(calc(var(--ang, 0) * 1deg)) translateY(-7dvh);
			transition: all 0.5s ease-in-out;

			.pokeball {
				width: 25dvh;
				height: 25dvh;
				position: absolute;
				margin-top: -10dvh;
				background: var(--pixel-bg-panel);
				border: 2px solid var(--pixel-border-color);
				box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
				transform: rotateY(var(--rotateY, 0deg)) translateZ(var(--translateZ, 0px));

				&.selected {
					border: 3px solid var(--pixel-text-gold);
				}

				&::before {
					content: '';
					height: 100%;
					width: 100%;
					opacity: 0.4;
					z-index: -1;
					border: 4px solid black;
					box-sizing: border-box;
					background: url(src/assets/common/squared-ball.png);
					background-repeat: no-repeat;
					background-size: cover;
					background-position: 50% 50%;
					position: absolute;
				}

				.image {
					height: 60%;

					// center
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);

					&:not(.current) {
						filter: brightness(0);
					}
				}
			}
		}

		@keyframes spin {
			0% {
				transform: rotateY(0deg);
			}
			100% {
				transform: rotateY(360deg);
			}
		}
	}
</style>
