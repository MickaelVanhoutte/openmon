<script lang="ts">
	import { onMount } from 'svelte';
	import { Howl } from 'howler';
	import { fade } from 'svelte/transition';

	interface Props {
		started: boolean;
	}

	let { started = $bindable() }: Props = $props();
	let intro: HTMLDivElement;
	let sound: Howl;
	let soundPlaying = $state(false);

	const messages = [
		'',
		'Porygon is generating a digital masterpiece!',
		'Gengar is playing tricks with the data!',
		'Training Magikarp... this might take a while!',
		'Snorlax is waking up... slowly...'
	];
	let messageIdx = $state(0);
	let loaded = $state(false);
	let animationFinished = $state(false);
	let ready = $state(false);
	let messageInterval: number;
	let readyCheckInterval: number;

	function toggleSound() {
		soundPlaying = !soundPlaying;
		sound.mute(!soundPlaying);
	}

	function loadSound() {
		sound = new Howl({
			src: ['src/assets/audio/intro.mp3'],
			autoplay: true,
			loop: true,
			volume: 0.5,
			preload: true
		});
		sound.once('load', () => {
			soundPlaying = sound.playing();
		});
	}

	async function preloadAssets() {
		// const imagePromises = all.flatMap(i => [
		// 	preloadImage(`src/assets/monsters/walking/${i}.png`),
		// 	preloadImage(`src/assets/monsters/walking/${i}s.png`),
		// 	preloadImage(`src/assets/monsters/animated/${i}.gif`),
		// 	preloadImage(`src/assets/monsters/animated/${i}b.gif`),
		// 	preloadImage(`src/assets/monsters/animated/${i}s.gif`),
		// 	preloadImage(`src/assets/monsters/animated/${i}sb.gif`),
		// 	preloadImage(`src/assets/monsters/pokedex/${i}sb.png`)
		// ]);

		// await Promise.all(imagePromises);
		loaded = true;
	}

	function preloadImage(src: string): Promise<void> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve();
			img.onerror = () => resolve();
			img.src = src;
		});
	}

	onMount(() => {
		preloadAssets();

		messageInterval = setInterval(() => {
			messageIdx = messageIdx === messages.length - 1 ? 0 : messageIdx + 1;
		}, 3000);

		loadSound();

		setTimeout(() => {
			animationFinished = true;
			readyCheckInterval = setInterval(() => {
				if (loaded && animationFinished) {
					clearInterval(readyCheckInterval);
					ready = true;
				}
			}, 300);
		}, 14000);

		intro.addEventListener('click', () => {
			if (ready) {started = true;}
		});

		return () => {
			clearInterval(messageInterval);
			clearInterval(readyCheckInterval);
			sound.fade(0.5, 0, 1000);
			setTimeout(() => {
				sound.stop();
			}, 1000);
		};
	});
</script>

<svelte:window onload={() => preloadAssets()} />

<div class="intro" data-testid="intro-screen" bind:this={intro} out:fade>
	{#each Array.from({ length: 5 }) as i}
		<div class="firefly"></div>
	{/each}

	<span class="sound" onclick={toggleSound}>
		{#if soundPlaying}
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M5.88889 16H2C1.44772 16 1 15.5523 1 15V9.00001C1 8.44772 1.44772 8.00001 2 8.00001H5.88889L11.1834 3.66815C11.3971 3.49329 11.7121 3.52479 11.887 3.73851C11.9601 3.82784 12 3.93971 12 4.05513V19.9449C12 20.221 11.7761 20.4449 11.5 20.4449C11.3846 20.4449 11.2727 20.405 11.1834 20.3319L5.88889 16ZM20.4142 12L23.9497 15.5355L22.5355 16.9498L19 13.4142L15.4645 16.9498L14.0503 15.5355L17.5858 12L14.0503 8.46447L15.4645 7.05026L19 10.5858L22.5355 7.05026L23.9497 8.46447L20.4142 12Z"
				></path></svg
			>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M2 16.0001H5.88889L11.1834 20.3319C11.2727 20.405 11.3846 20.4449 11.5 20.4449C11.7761 20.4449 12 20.2211 12 19.9449V4.05519C12 3.93977 11.9601 3.8279 11.887 3.73857C11.7121 3.52485 11.3971 3.49335 11.1834 3.66821L5.88889 8.00007H2C1.44772 8.00007 1 8.44778 1 9.00007V15.0001C1 15.5524 1.44772 16.0001 2 16.0001ZM23 12C23 15.292 21.5539 18.2463 19.2622 20.2622L17.8445 18.8444C19.7758 17.1937 21 14.7398 21 12C21 9.26016 19.7758 6.80629 17.8445 5.15557L19.2622 3.73779C21.5539 5.75368 23 8.70795 23 12ZM18 12C18 10.0883 17.106 8.38548 15.7133 7.28673L14.2842 8.71584C15.3213 9.43855 16 10.64 16 12C16 13.36 15.3213 14.5614 14.2842 15.2841L15.7133 16.7132C17.106 15.6145 18 13.9116 18 12Z"
				></path></svg
			>
		{/if}
	</span>

	<img class="logo" src="src/assets/menus/pokemon-logo.png" alt="pokemon logo" />

	<div class="links">
		<a href="https://www.tiktok.com/@azkaiser" target="_blank" class="tiktok">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M16 8.24537V15.5C16 19.0899 13.0899 22 9.5 22C5.91015 22 3 19.0899 3 15.5C3 11.9101 5.91015 9 9.5 9C10.0163 9 10.5185 9.06019 11 9.17393V12.3368C10.5454 12.1208 10.0368 12 9.5 12C7.567 12 6 13.567 6 15.5C6 17.433 7.567 19 9.5 19C11.433 19 13 17.433 13 15.5V2H16C16 4.76142 18.2386 7 21 7V10C19.1081 10 17.3696 9.34328 16 8.24537Z"
				></path></svg
			>
			<span>@Azkaiser</span>
		</a>
		<a href="https://github.com/MickaelVanhoutte/openmon" target="_blank" class="github">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z"
				></path></svg
			>
			<span>@openmon</span>
		</a>
	</div>

	<h3 class="animate-charcter title">UNISON</h3>
	<!-- <img class="combo" src="src/assets/menus/combo.svg" alt="gimmick logo" /> -->
	<img class="darkrai" src="src/assets/darkrai.png" alt="darkrai" />
	<img class="diancie" src="src/assets/diancie.png" alt="diancie" />
	<span class="touch" data-testid="start-button">
		{#if ready}
			Touch to start
		{:else}
			{messages[messageIdx]}
		{/if}
	</span>
</div>

{#if !started}
	<audio src="src/assets/audio/intro.mp3" preload="auto" style="display: none"></audio>
	<audio src="src/assets/audio/beach.mp3" preload="auto" style="display: none"></audio>
	<audio src="src/assets/audio/forest.mp3" preload="auto" style="display: none"></audio>
	<audio src="src/assets/audio/save.mp3" preload="auto" style="display: none"></audio>
	<audio src="src/assets/audio/battle/battle-start.mp3" preload="auto" style="display: none"
	></audio>
	<audio src="src/assets/audio/battle/battle1.mp3" preload="auto" style="display: none"></audio>
{/if}

<style lang="scss">
	.sprite {
		will-change: transform, opacity;
	}

	.pokemon {
		contain: paint;
	}

	@keyframes blink {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

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
			transform: scale(0.3) translateX(-85%) translateY(0);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateX(-50%) translateY(-15%);
		}
	}

	@keyframes fromRight {
		to {
			transform: translateX(1%) rotate(-15deg) scale(1) rotateY(10deg);
			opacity: 0.95;
		}
	}

	@keyframes fromLeft {
		to {
			transform: translateX(-1%) rotate(15deg) scale(1) rotateY(-10deg);
			opacity: 0.85;
		}
	}

	@keyframes minimize {
		to {
			transform: scale(0.5) translateX(-100%) translateY(-45%);
		}
	}

	@keyframes shadow1 {
		0% {
			filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 3px #4444dd) drop-shadow(0 0 5px #4444dd);
			bottom: 25%;
		}
		100% {
			filter: drop-shadow(0 0 5px #fff) drop-shadow(0 0 6px #4444dd) drop-shadow(0 0 10px #4444dd);
			bottom: 22%;
		}
	}

	@keyframes shadow2 {
		0% {
			filter: drop-shadow(0 0 4px #000) drop-shadow(0 0 3px #7f7fef) drop-shadow(0 0 5px #a8a8ec);
			bottom: 22%;
		}
		100% {
			filter: drop-shadow(0 0 7px #000) drop-shadow(0 0 6px #7f7fef) drop-shadow(0 0 10px #a8a8ec);
			bottom: 25%;
		}
	}

	.intro {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100.1vh;
		width: 100dvw;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 100;
		overflow: hidden;
		perspective: 100dvw;
		font-size: 22px;

		background: #143855;
		border: 2px solid #000;

		.sound {
			position: absolute;
			top: 3%;
			left: 3%;
			z-index: 110;
			width: 42px;
			height: 42px;
			color: white;
			opacity: 0.7;

			svg {
				width: 32px;
				height: 32px;
			}
		}

		.links {
			position: absolute;
			top: 3%;
			right: 3%;
			z-index: 100;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-around;
			width: 200px;

			a {
				width: 32px;
				display: flex;
				flex-direction: column;
				align-items: center;
				font-size: 26px;
				color: white;
				opacity: 0.6;
				&:hover {
					opacity: 1;
				}
			}
		}

		.darkrai {
			will-change: transform, opacity;
			position: absolute;
			bottom: 22%;
			left: 3%;
			width: 100%;
			max-width: 24dvw;
			opacity: 0;
			transform: translateX(-100%);
			filter: drop-shadow(0 0 4px #4444dd);
			animation: slide-in-left 1.5s ease-out forwards;
			animation-delay: 6s;
			z-index: 96;
		}
		.diancie {
			will-change: transform, opacity;
			position: absolute;
			bottom: 22%;
			right: 3%;
			width: 100%;
			max-width: 24dvw;
			opacity: 0;
			transform: translateX(100%);
			filter: drop-shadow(0 0 4px #7f7fef);
			animation: slide-in-right 1.5s ease-out forwards;
			animation-delay: 6s;
			z-index: 96;
		}

		@keyframes slide-in-left {
			0% {
				opacity: 0;
				transform: translateX(-100%);
			}
			100% {
				opacity: 0.85;
				transform: translateX(0);
			}
		}

		@keyframes slide-in-right {
			0% {
				opacity: 0;
				transform: translateX(100%);
			}
			100% {
				opacity: 0.95;
				transform: translateX(0);
			}
		}

		.logo {
			will-change: transform;
			position: absolute;
			top: 3%;
			left: 50%;
			transform: translateY(-100vh) translateX(-50%);
			transform-origin: -50% 50%;
			z-index: 98;
			width: 60%;
			height: auto;
			animation:
				bounce-7 3.5s cubic-bezier(0.28, 0.84, 0.42, 1) forwards,
				minimize 1.5s linear forwards;
			animation-delay: 3s, 6.5s;
		}

		.title {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: 100;
			text-align: center;
			margin: 0;
			font-size: clamp(120px, 240px, 32dvh);
			opacity: 0;
			transform-origin: center;
			will-change: transform, opacity;
		}

		.animate-charcter {
			will-change: transform, opacity;
			text-transform: uppercase;
			background-image: linear-gradient(
				-225deg,
				#fff800 0%,
				#ff1361 29%,
				#50107a 67%,
				#2d1b6f 100%
			);
			background-size: 200% auto;
			background-clip: text;
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			animation:
				title-appear 2s cubic-bezier(0.22, 0.68, 0, 1.31) forwards,
				textclip 4s linear forwards;
			animation-delay: 8s, 15s;
			display: inline-block;
			font-weight: 900;
		}

		@keyframes title-appear {
			0% {
				opacity: 0;
				transform: translate(-50%, -50%) scale(0.1);
			}
			50% {
				opacity: 0.5;
				transform: translate(-50%, -50%) scale(1.2);
			}
			100% {
				opacity: 1;
				transform: translate(-50%, -50%) scale(1);
			}
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
			font-size: clamp(1rem, 3dvw, 4rem);
			color: white;
			text-shadow: 0 0 2px #fff;
			z-index: 97;
			opacity: 0;
			animation: blink 8s ease-in-out infinite;
			animation-delay: 3s;
		}
	}

	@media (max-width: 968px) {
		.intro {
			.links {
				width: 120px;
				a {
					font-size: 16px;
				}
			}
			.logo {
				top: 5%;
				width: 55%;
			}
			.title {
				top: 35%;
				font-size: clamp(60px, 160px, 30dvh);
			}
			.touch {
				bottom: 33%;
			}
		}
	}
</style>
