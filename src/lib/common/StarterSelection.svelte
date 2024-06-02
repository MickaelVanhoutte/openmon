<script lang="ts">
	import { onMount } from 'svelte';
	import DialogView from './DialogView.svelte';
	import { Dialog, Message } from '../../js/scripting/scripts';
	import type { GameContext } from '../../js/context/gameContext';
	import { SceneType } from '../../js/context/overworldContext';
	import type { Unsubscriber } from 'svelte/motion';

	export let context: GameContext;
	export let canvasWidth: number;

	let pokeballs: HTMLDivElement;
	let aUnsubscribe: Unsubscriber;
	let bUnsubscribe: Unsubscriber;

	let translateZ = canvasWidth * 0.33;

	let monsters = [
		context.POKEDEX.findById(1).result,
		context.POKEDEX.findById(4).result,
		context.POKEDEX.findById(7).result,
	];

	let angle = 0;

	let currentIndex = 0;
	let currentPokemon = monsters[0];

	$: dialog = new Dialog([new Message(`Hmm... Is ${currentPokemon.name} my Pokemon ?`)]);

	function prev() {
		angle -= 360 / monsters?.length;
		currentIndex = (currentIndex + 1) % monsters.length;
		currentPokemon = monsters[currentIndex];
	}

	function next() {
		angle += 360 / monsters?.length;
		currentIndex = (currentIndex - 1 + monsters.length) % monsters.length;
		currentPokemon = monsters[currentIndex];
	}

	function select() {
		context.player.monsters[0]= currentPokemon.instanciate(5, 20);
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
		let te = e.changedTouches[0].clientX;
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
		let te = e.clientX;
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
			pokeballs.removeEventListener('touchmove', touchDown);
			pokeballs.removeEventListener('touchend', touchUp);
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
				style="--translateZ:{translateZ}px;
                 --rotateY: {index * (360 / monsters?.length)}deg;"
			>
				<img
					class="image"
					alt="poke-{monster.id}"
					src={monster.sprites?.male?.front?.frame1}
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
		background: rgba(0, 0, 0, 0.6);
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
				border-radius: 50%;
				width: 25dvh;
				height: 25dvh;
				position: absolute;
				margin-top: -10dvh;
				background: rgba(0, 0, 0, 0.6);
				transform: rotateY(var(--rotateY, 0deg)) translateZ(var(--translateZ, 0px));

				&::before {
					content: '';
					height: 100%;
					width: 100%;
					opacity: 0.4;
					z-index: -1;
					border-radius: 50%;
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
