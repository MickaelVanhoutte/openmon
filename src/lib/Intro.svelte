<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	export let started: boolean;
	let intro: HTMLDivElement;
	let pkmnListShuffled: number[] = fisherYates(Array.from({ length: 233 }, (_, i) => i));
	let ready = false;

	function fisherYates(array) {
		var count = array.length,
			randomnumber,
			temp;
		while (count) {
			randomnumber = (Math.random() * count--) | 0;
			temp = array[count];
			array[count] = array[randomnumber];
			array[randomnumber] = temp;
		}
		return array;
	}

	onMount(() => {
		//playAnimation();
		setTimeout(() => {
			ready = true;
		}, 8000);
		intro.addEventListener('click', () => {
			if (ready) started = true;
		});
	});
</script>

<div class="intro" bind:this={intro}>
	{#each Array.from({ length: 15 }) as i}
		<div class="firefly"></div>
	{/each}

	<img class="logo" src="src/assets/menus/pokemon-logo.png" alt="pokemon logo" />
	<h3 class="animate-charcter title">UNISON</h3>
	<img class="combo" src="src/assets/menus/combo.svg" alt="gimmick logo" />

	<span class="touch">Touch to start</span>

	<div class="horde">
		{#each pkmnListShuffled as i, index}
			<i
				class="sprite pokemon move"
				style="-webkit-animation-delay: {(index * 2 + Math.random() * 2).toFixed(3)}s; z-index: {i}"
			>
				<i
					style="animation: anim-sprite 0.5s infinite steps(1); background: url('src/assets/monsters/walking/{(
						'00' +
						(i + 1)
					).slice(-3)}{Math.random() > 0.5 ? 's' : ''}.png')"
				></i>
			</i>
		{/each}
	</div>
</div>

<style lang="scss">
	@keyframes poke-move {
		0% {
			transform: translateX(0);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		77% {
			transform: translateX(100vw);
		}
		80% {
			opacity: 0;
		}
		100% {
			opacity: 0;
		}
	}

	@keyframes -global-anim-sprite {
		0% {
			background-position: 0 -128px;
		}
		25% {
			background-position: 64px -128px;
		}
		50% {
			background-position: 128px -128px;
		}
		75% {
			background-position: 192px -128px;
		}
	}

	@keyframes fall {
		0% {
			transform: translateY(-100vh) translateX(-50%) rotate(10deg);
		}
		40% {
			transform: translateY(0) translateX(-50%) rotate(6deg);
		}
		48% {
			transform: translateY(-10px) translateX(-50%) rotate(2deg);
		}
		50% {
			transform: translateY(0) translateX(-50%) rotate(-2deg);
		}
		100% {
			transform: translateY(0) translateX(-50%) rotate(0deg);
		}
	}

	@keyframes bounce-7 {
		0% {
			transform: scale(1, 1) translateY(-100vh) translateX(-50%);
		}
		10% {
			transform: scale(1.1, 0.9) translateY(0) translateX(-50%);
		}
		30% {
			transform: scale(0.9, 1.1) translateY(-20px) translateX(-50%);
		}
		50% {
			transform: scale(1.05, 0.95) translateY(0) translateX(-50%);
		}
		57% {
			transform: scale(1, 1) translateY(-7px) translateX(-50%);
		}
		64% {
			transform: scale(1, 1) translateY(0) translateX(-50%);
		}
		100% {
			transform: scale(1, 1) translateY(0) translateX(-50%);
		}
	}

	@keyframes fadeIn {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes fadeIn2 {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 0.5;
		}
	}

	.intro {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100dvw;
		background-color: #fff;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 100;

		.logo {
			position: absolute;
			top: 3%;
			left: 50%;
			transform: translateY(-100vh) translateX(-50%);
			transform-origin: -50% 50%;
			z-index: 100;
			width: 60%;
			height: auto;
			animation: bounce-7 3.5s cubic-bezier(0.28, 0.84, 0.42, 1) forwards;
			animation-delay: 3s;
			will-change: transform;
		}

		.title {
			position: absolute;
			top: 38%;
			left: 47%;
			transform: translateX(-47%);
			z-index: 100;
			width: 100%;
			text-align: center;
			margin: 0;
			font-size: clamp(120px, 240px, 36dvh);
			opacity: 0;
			//animation: fadeIn 2s ease-in-out forwards;
		}

		.combo {
			position: absolute;
			top: 32.6%;
			left: 72%;
			transform: translateX(-50%);
			z-index: 99;
			height: 40%;
			width: auto;
			opacity: 0;
			animation: fadeIn2 3s ease-in-out forwards;
			animation-delay: 7s;
			will-change: opacity;
		}

		.animate-charcter {
			text-transform: uppercase;
			background-image: linear-gradient(
				-225deg,
				#fff800 0%,
				#ff1361 29%,
				#50107a 67%,
				#2d1b6f 100%
			);
			background-size: auto auto;
			background-clip: border-box;
			background-size: 200% auto;
			color: #fff;
			background-clip: text;
			text-fill-color: transparent;
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			animation:
				fadeIn 2s ease-in-out forwards,
				textclip 4s linear infinite;
				//svg-shadow 3s ease-in-out infinite alternate;
			animation-delay: 5s;
			display: inline-block;
			font-weight: 900;
			will-change: filter, background-position, opacity;
		}

		@keyframes svg-shadow {
			from {
				filter: drop-shadow(0 0 5px #fff) drop-shadow(0 0 10px #e6007f4b)
					drop-shadow(0 0 20px #e6007f4b);
			}

			to {
				filter: drop-shadow(0 0 40px #fff) drop-shadow(0 0 15px #e6007f4b)
					drop-shadow(0 0 60px #e6007f4b);
			}
		}

		@keyframes textclip {
			to {
				background-position: 200% center;
			}
		}

		.touch {
			position: absolute;
			bottom: 4%;
			left: 50%;
			transform: translateX(-50%);
			font-size: 2.5rem;
			color: white;
			text-shadow: 0 0 2px #fff;
			z-index: 100;
			opacity: 0;
			animation: blink 8s ease-in-out infinite;
			animation-delay: 7s;
		}

		.horde {
			//display: none;
			//position: absolute;

			background: #0f0c29; /* fallback for old browsers */
			background: -webkit-linear-gradient(
				to right, #24243e, #5b53b2, #0f0c29
			); /* Chrome 10-25, Safari 5.1-6 */
			background: linear-gradient(
				to right, #24243e, #5b53b2, #0f0c29
			); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
      
			position: fixed;
			//z-index: 9999;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			//background: #1d1f20;

			.sprite {
				position: absolute;
				bottom: 14%;
				left: 0%;
				opacity: 0;
				will-change: transform, opacity;

				&.pokemon {
					margin-bottom: -3px;
					&.move {
						animation: poke-move 20s linear forwards;
					}
					&:after {
						content: '';
						width: 80%;
						height: 2px;
						position: absolute;
						z-index: -1;
						border-radius: 50%;
						margin-left: -40%;
						bottom: -22%;
						left: 40%;
						background: rgba(0, 0, 0, 0.5);
						box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.6);
					}
					i {
						display: block;
						width: 64px;
						height: 64px;
						background-repeat: no-repeat;
						background-size: contain;
						background-position: 0 -128px;
						transform: scale(1.5);
					}
				}
			}
		}
	}
</style>
