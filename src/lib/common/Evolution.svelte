<script lang="ts">
	import type { PokemonInstance } from '../../js/pokemons/pokedex';
	import { onMount } from 'svelte';
	import DialogView from './DialogView.svelte';
	import { Dialog, Message } from '../../js/scripting/scripts';
	import { fade } from 'svelte/transition';
	import type { GameContext } from '../../js/context/gameContext';

	export let context: GameContext;

	let currentImg: HTMLImageElement;
	let nextImg: HTMLImageElement;

	let circlesWrap: HTMLDivElement;
	let bubblesWrap: HTMLDivElement;

	const animationTime = 13;

	let animateD = true;
	let dialog: Dialog | undefined;

	let currentSprite: string | undefined;
	let nextSprite: string | undefined;

	function evolveAnimation(poke?: PokemonInstance) {
		if (poke) {
			let circles = [...circlesWrap.children] as HTMLDivElement[];
			let bubbles = [...bubblesWrap.children] as HTMLDivElement[];

			currentSprite =
				(poke?.sprites && poke?.sprites[poke?.gender]?.front?.frame1) ||
				poke?.sprites?.male?.front?.frame1;
			let nextResult =
				poke?.evolution[0]?.id && context.POKEDEX.findById(poke?.evolution[0]?.id)?.result;
			nextSprite =
				(nextResult && nextResult?.sprites && nextResult?.sprites[poke?.gender]?.front?.frame1) ||
				(nextResult && nextResult?.sprites?.male?.front?.frame1) ||
				'';

			if (currentSprite && nextSprite) {
				console.log('setting classes');

				currentImg.src = currentSprite;
				currentImg.classList.remove('current');
				currentImg.style.animation = `evolve-out ${animationTime}s forwards`;
				nextImg.src = nextSprite;
				nextImg.classList.add('current');
				nextImg.style.animation = `evolve-in ${animationTime}s forwards`;
			}

			circles.map((el, i) => (el.style.animation = `tunnel ${animationTime}s linear ${i * 0.1}s`));
			bubbles.map(
				(el, i) => (el.style.animation = `bubble .4s reverse ${animationTime - 2 + i * 0.05}s`)
			);

			dialog = new Dialog([new Message(`What ? ${poke?.name} is evolving!`, 'System')]);

			setTimeout(
				() => {
					dialog = undefined;
					setTimeout(() => {
						dialog = new Dialog([
							new Message(
								`Congratulations! Your ${poke?.name} has evolved into ${nextResult?.name}!`,
								'System'
							)
						]);
					}, 200);
					context.player.monsters[context.player.monsters.indexOf(poke)] = poke.evolve(
						context.POKEDEX.findById(parseInt(poke?.evolution[0]?.id + '' || '0'))
					);

					setTimeout(() => {
						circles.map((el, i) => (el.style.animation = ``));
						bubbles.map((el, i) => (el.style.animation = ``));

						currentImg.style.animation = '';
						currentImg.classList.add('current');
						currentImg.src =
							'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
						nextImg.style.animation = '';
						nextImg.classList.remove('current');
						nextImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
					}, 2000);
				},
				500 + animationTime * 1000
			);
		} else {
			return;
		}
	}

	async function iteration(toEvolve: PokemonInstance[]) {
		let i = 1;
		evolveAnimation(toEvolve[0]);
		setTimeout(() => {}, 16000);
		if (toEvolve.length === 1) return;
		const interval = setInterval(() => {
			if (i === toEvolve.length) {
				clearInterval(interval);
			} else {
				evolveAnimation(toEvolve[i++]);
			}
		}, 16000);
	}

	onMount(() => {
		iteration(context.player.monsters.filter((p) => p.canEvolve()));
	});
</script>

<div
	class="evolution"
	in:fade={{ duration: 500, delay: 2000 }}
	out:fade={{ duration: 500, delay: 2000 }}
>
	<div class="evolve">
		<img src="" alt="evolve" class="pokemon" bind:this={currentImg} />
		<img src="" alt="evolve" class="pokemon" bind:this={nextImg} />
	</div>
	<div class="circle-wrap" bind:this={circlesWrap}>
		<div class="circle c1"></div>
		<div class="circle c2"></div>
		<div class="circle c3"></div>
		<div class="circle c4"></div>
		<div class="circle c5"></div>
	</div>

	<div class="bubble-wrap" bind:this={bubblesWrap}>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
		<div class="bubble"></div>
	</div>

	{#if dialog}
		<DialogView bind:dialog bind:animate={animateD} {context} />
	{/if}
</div>

<style lang="scss">
	@keyframes -global-evolve-out {
		0% {
			visibility: visible;
			filter: brightness(100%);
			transform: scale(1);
		}
		16.6%,
		33.2%,
		41.5%,
		49.8%,
		53.95%,
		58.1%,
		62.25%,
		66.4%,
		68.475%,
		70.55%,
		72.625%,
		74.7%,
		76.775%,
		78.85%,
		80.925% {
			filter: brightness(0%) invert(100%);
			opacity: 1;
			transform: scale(1);
		}
		24.9%,
		37.35%,
		45.65%,
		51.875%,
		56.025%,
		60.175%,
		64.325%,
		67.4375%,
		69.5125%,
		71.5875%,
		73.6625%,
		75.7375%,
		77.8125%,
		79.8875%,
		81.9625% {
			filter: brightness(0%) invert(100%);
			opacity: 0;
			transform: scale(0.25);
		}
		83.3%,
		100% {
			visibility: hidden;
			filter: brightness(0%) invert(100%);
			opacity: 0;
			transform: scale(0.25);
		}
	}

	@keyframes -global-evolve-in {
		0%,
		16.6%,
		33.2%,
		41.5%,
		49.8%,
		53.95%,
		58.1%,
		62.25%,
		66.4%,
		68.475%,
		70.55%,
		72.625%,
		74.7%,
		76.775%,
		78.85%,
		80.925% {
			visibility: visible;
			filter: brightness(0%) invert(100%);
			opacity: 0;
			transform: scale(0.25);
		}
		24.9%,
		37.35%,
		45.65%,
		51.875%,
		56.025%,
		60.175%,
		64.325%,
		67.4375%,
		69.5125%,
		71.5875%,
		73.6625%,
		75.7375%,
		77.8125%,
		79.8875%,
		81.9625%,
		96% {
			filter: brightness(0%) invert(100%);
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 1;
			filter: brightness(100%);
			transform: scale(1);
			visibility: visible;
		}
	}

	@keyframes -global-tunnel {
		0%,
		16.517%,
		33.283%,
		41.583%,
		49.883%,
		58.183%,
		66.483%,
		83.083% {
			transform: scale(0.6);
			opacity: 0;
		}
		16.6%,
		33.366%,
		41.666%,
		49.966%,
		58.266%,
		66.566%,
		83.166% {
			transform: scale(0.6);
			opacity: 1;
		}
		20.75%,
		37.35%,
		45.65%,
		53.95%,
		62.25%,
		70.55%,
		87.15% {
			transform: scale(3.5);
			opacity: 1;
		}
		24.9%,
		41.5%,
		49.8%,
		58.1%,
		66.4%,
		74.7%,
		91.3% {
			transform: scale(7);
			opacity: 0;
		}
	}

	@keyframes -global-bubble {
		100% {
			transform: translate(0, 140px);
			opacity: 0;
		}
		90%,
		10% {
			opacity: 1;
		}
		5%,
		0% {
			opacity: 0;
		}
	}

	.evolution {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		background: rgba(0, 0, 0, 1);

		z-index: 12;

		.evolve {
			display: flex;
			height: 75%;
			width: 100%;
			justify-content: center;
			align-items: center;
			position: relative;

			img.pokemon {
				width: auto;
				max-height: 60%;
				display: block;
				margin: auto;
				user-select: none;

				position: absolute;
				opacity: 1;
				visibility: visible;

				&:not(.current) {
					opacity: 0;
					visibility: hidden;
				}
			}
		}

		.circle {
			position: absolute;
			left: 50%;
			top: 40%;
			margin: calc(-1 * (45dvh / 2)) 0 0 calc(-1 * (45dvh / 2));
			width: 45dvh;
			height: 45dvh;
			border-radius: 50%;
			opacity: 0;

			&.c1 {
				box-shadow: 0 0 8px 65px rgba(128, 206, 255, 0.5);
			}

			&.c2 {
				box-shadow: 0 0 8px 65px rgba(117, 202, 255, 0.65);
			}

			&.c3 {
				box-shadow: 0 0 8px 65px rgba(87, 190, 255, 0.8);
			}

			&.c4 {
				box-shadow: 0 0 8px 65px rgba(117, 202, 255, 0.65);
			}

			&.c5 {
				box-shadow: 0 0 8px 65px rgba(128, 206, 255, 0.5);
			}
		}

		//Bubbles
		.bubble-wrap {
			.bubble {
				position: absolute;
				left: 50%;
				top: 6%;
				opacity: 0;
				border-radius: 50%;
			}

			@for $i from 1 through 20 {
				.bubble:nth-child(#{$i}) {
					$size: random(30) + px;
					height: $size;
					width: $size;
					margin: calc(-1 * ($size / 2)) 0 0 calc(-1 * ($size / 2));
					transform: translate(random(300) - 150px, random(100)-200px);
					animation-delay: $i * 0.05s;
					background: hsl(0%, 0%, 100%);
				}
			}
		}
	}
</style>
