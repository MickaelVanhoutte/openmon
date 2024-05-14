<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	export let started: boolean;
	let intro: HTMLDivElement;
	let pkmnListShuffled: number[] = fisherYates(Array.from({ length: 233 }, (_, i) => i)).slice(0, 35);

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
	{#each Array.from({ length: 10 }) as i}
		<div class="firefly"></div>
	{/each}

	<img class="logo" src="src/assets/menus/pokemon-logo.png" alt="pokemon logo" />
	<h3 class="animate-charcter title">UNISON</h3>
	<!-- <img class="combo" src="src/assets/menus/combo.svg" alt="gimmick logo" /> -->
	<img class="darkrai" src="src/assets/darkrai.png" alt="darkrai" />
	<img class="diancie" src="src/assets/diancie.png" alt="diancie" />
	<span class="touch">Touch to start</span>

	<div class="horde">
		{#each pkmnListShuffled as i, index}
			<i
				class="sprite pokemon move"
				style="animation: poke-move {Math.random() * (20 - 13 + 1) +
					13}s linear forwards;-webkit-animation-delay: {(index * 2 + Math.random() * 2).toFixed(
					3
				)}s; z-index: {i};"
			>
				<i
					style="will-change: background-position; animation: anim-sprite 0.5s infinite steps(1); background: url('src/assets/monsters/walking/{(
						'00' +
						(i + 1)
					).slice(-3)}{Math.random() > 0.5 ? 's' : ''}.png')"
				></i>
			</i>
		{/each}
	</div>
</div>

<style lang="scss">
	@keyframes -global-poke-move {
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
			transform: scale(0.9, 1.1) translateY(0px) translateX(-50%);
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
      transform:  scale(.3) translateX(-85%) translateY(0);
		}
		100% {
			opacity: 1;
      transform:  scale(1) translateX(-50%) translateY(-15%);
		}
	}

  @keyframes fromRight {
    0% {
      transform: translateX(100%) rotate(-15deg) scale(.55);
      opacity: 0;
    }
    50% {
      transform: translateX(60%) rotate(5deg) scale(.75);
    }
    100% {
      transform: translateX(1%) rotate(-15deg) scale(1);
      opacity: 0.55;
    }
  }

  @keyframes fromLeft {
    0% {
      transform: translateX(-100%) rotate(15deg) scale(.55);
      opacity: 0;
    }
    50% {
      transform: translateX(-60%) rotate(-5deg) scale(.75);
    }
    100% {
      transform: translateX(-1%) rotate(15deg) scale(1);
      opacity: 0.55;
    }
  }

  @keyframes minimize {
    0% {
      transform: scale(1) translateX(-50%) translateY(0);
    }
    100% {
      transform:  scale(.5) translateX(-100%) translateY(-45%);
    }
  }

  @keyframes shadow {
    0% {
      filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 3px #4444dd)
        drop-shadow(0 0 5px #4444dd);
    }
    100% {
      filter: drop-shadow(0 0 5px #fff) drop-shadow(0 0 6px #4444dd)
        drop-shadow(0 0 10px #4444dd);
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

		.darkrai {
      will-change: transform, opacity, drop-shadow;
			position: absolute;
			bottom: 22%;
			left: 3%;
			width: 100%;
			max-width: 24dvw;
			opacity: 0;
			animation: fromLeft 8s ease-in-out forwards,
                 shadow 3s ease-in-out infinite alternate;
			animation-delay: 6s;
			z-index: 99;
      filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 3px #4444dd)
        drop-shadow(0 0 5px #4444dd);
		}
		.diancie {
      will-change: transform, opacity, drop-shadow;
			position: absolute;
			bottom: 22%;
			right: 3%;
			width: 100%;
			max-width: 24dvw;
			opacity: 0;
			animation: fromRight 8s ease-in-out forwards,
                 shadow 3s ease-in-out infinite alternate;
			animation-delay: 6s;
			z-index: 99;
      filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 3px #4444dd)
        drop-shadow(0 0 5px #4444dd);
		}

		.logo {
			position: absolute;
			top: 3%;
			left: 50%;
			transform: translateY(-100vh) translateX(-50%);
			transform-origin: -50% 50%;
			z-index: 98;
			width: 60%;
			height: auto;
			animation: bounce-7 3.5s cubic-bezier(0.28, 0.84, 0.42, 1) forwards,
                 minimize 3.5s ease-in-out forwards;
			animation-delay: 3s, 6.5s;
			will-change: transform;
		}

		.title {
			position: absolute;
			top: 38%;
			left: 50%;
			transform: translateX(-50%);
			z-index: 100;
			// width: 100%;
			text-align: center;
			margin: 0;
			font-size: clamp(120px, 240px, 32dvh);
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
			animation: fadeIn 3s ease-in-out forwards;
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
				textclip 4s linear forwards;
			//svg-shadow 3s ease-in-out infinite alternate;
			animation-delay: 8s,8s;
			display: inline-block;
			font-weight: 900;
			will-change: filter, background-position, opacity;
		}

		@keyframes textclip {
			to {
				background-position: 200% center;
			}
		}

		.touch {
			position: absolute;
			bottom: 28%;
			left: 50%;
			transform: translateX(-50%);
			font-size: 4rem;
			color: white;
			text-shadow: 0 0 2px #fff;
			z-index: 120;
			opacity: 0;
			animation: blink 8s ease-in-out infinite;
			animation-delay: 10s;
		}

		.horde {
			//display: none;
			//position: absolute;

			background: #0f0c29; /* fallback for old browsers */
			background: -webkit-linear-gradient(
				to right,
				#24243e,
				#5b53b2,
				#0f0c29
			); /* Chrome 10-25, Safari 5.1-6 */
			background: linear-gradient(
				to right,
				#24243e,
				#5b53b2,
				#0f0c29
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
				bottom: 6%;
				left: 0%;
				opacity: 0;

				&.pokemon {
					margin-bottom: -3px;
					&.move {
						will-change: transform, opacity;
					}
          // &:after {
					// 	content: '';
					// 	width: 80%;
					// 	height: 2px;
					// 	position: absolute;
					// 	z-index: -1;
					// 	border-radius: 50%;
					// 	margin-left: -40%;
					// 	bottom: -22%;
					// 	left: 40%;
					// 	background: rgba(0, 0, 0, 0.5);
					// 	box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.6);
					// }
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

	@media (max-width: 768px) {
		.intro {
			.logo {
				top: 5%;
				width: 55%;
			}
			.title {
				top: 35%;
				font-size: clamp(60px, 160px, 30dvh);
			}
			.combo {
				top: 30%;
				left: 69%;
				height: 40%;
			}
			.touch {
				bottom: 30%;
				font-size: 2.5rem;
			}
			.horde {
				.sprite {
					bottom: 10%;
				}
			}
		}
	}
</style>
