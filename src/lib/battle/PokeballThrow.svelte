<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import pokeballImg from '../../assets/menus/pokeball.png';

	let allyBall: HTMLImageElement;
	let opponentBall: HTMLImageElement;
	let allyFlash: HTMLDivElement;
	let opponentFlash: HTMLDivElement;

	onMount(() => {
		const tl = gsap.timeline();

		// Ally pokeball (left → center-left)
		tl.fromTo(
			allyBall,
			{ x: '15vw', y: '85vh', scale: 0.5, rotation: 0, opacity: 1 },
			{ x: '30vw', y: '50vh', scale: 1, rotation: 720, duration: 0.8, ease: 'power1.out' },
			0
		);

		// Opponent pokeball (right → center-right)
		tl.fromTo(
			opponentBall,
			{ x: '85vw', y: '15vh', scale: 0.5, rotation: 0, opacity: 1 },
			{ x: '70vw', y: '50vh', scale: 1, rotation: -720, duration: 0.8, ease: 'power1.out' },
			0
		);

		// Ally flash
		tl.to(allyFlash, { scale: 3, opacity: 0, duration: 0.4, ease: 'power2.out' }, 0.7);

		// Opponent flash
		tl.to(opponentFlash, { scale: 3, opacity: 0, duration: 0.4, ease: 'power2.out' }, 0.7);

		// Fade out pokeballs after flash
		tl.to([allyBall, opponentBall], { opacity: 0, duration: 0.3 }, 0.9);
	});
</script>

<div class="pokeball-throw-container">
	<img bind:this={allyBall} src={pokeballImg} alt="Ally Pokeball" class="pokeball ally" />
	<div bind:this={allyFlash} class="flash ally-flash"></div>

	<img
		bind:this={opponentBall}
		src={pokeballImg}
		alt="Opponent Pokeball"
		class="pokeball opponent"
	/>
	<div bind:this={opponentFlash} class="flash opponent-flash"></div>
</div>

<style>
	.pokeball-throw-container {
		position: fixed;
		inset: 0;
		z-index: 3;
		pointer-events: none;
		overflow: hidden;
	}

	.pokeball {
		width: 40px;
		height: 40px;
		position: absolute;
		image-rendering: pixelated;
		/* Initial positions are handled by GSAP, but setting defaults helps avoid FOUC */
		opacity: 0;
	}

	.flash {
		position: absolute;
		width: 50px;
		height: 50px;
		background: white;
		border-radius: 50%;
		transform: scale(0);
		opacity: 1;
		pointer-events: none;
	}

	/* Positioning flashes to match the end coordinates of the pokeballs */
	.ally-flash {
		left: 30vw;
		top: 50vh;
		transform: translate(-50%, -50%) scale(0); /* Center on the point */
		margin-left: -25px; /* Half width */
		margin-top: -25px; /* Half height */
	}

	.opponent-flash {
		left: 70vw;
		top: 50vh;
		transform: translate(-50%, -50%) scale(0);
		margin-left: -25px;
		margin-top: -25px;
	}
</style>
