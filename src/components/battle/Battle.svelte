<script lang="ts">
	import { onMount } from 'svelte';
	import ActionBar from './ActionBar.svelte';
	import EnemyInfo from './EnemyInfo.svelte';
	import AllyInfo from './AllyInfo.svelte';
	import { BattleContext } from '../../js/context/battleContext';
	import type { GameContext } from '../../js/context/gameContext';
	import type { OverworldContext } from '../../js/context/overworldContext';

	/**
	 * Battle screen component, handles pokemons display.
	 *
	 */
	export let context: GameContext;
	export let battleCtx: BattleContext;
	export let overWorldCtx: OverworldContext;

	let gifsWrapper: HTMLDivElement;

	let drawInterval: number;

	let battleLoopContext = {
		then: Date.now(),
		fpsInterval: 1000 / 18,
		goDown: true,
		frameElapsed: 0,
		id: 0,
		debug: false,
		allydrawn: false,
		opponentdrawn: false,
		bgDrawn: true
	};

	let allyGrassHeight = 0;
	let opponentGrassHeight = 0;

	let ally: HTMLImageElement;
	let opponent: HTMLImageElement;

	function draw() {
		drawInterval = setInterval(() => {
			// if (!battleLoopContext.bgDrawn) {
			// 	let opponentGrass = document.createElement('img') as HTMLImageElement;
			// 	opponentGrass.src = 'src/assets/battle/opponent-sand.png';
			// 	opponentGrass.classList.add('opponent-grass');

			// 	let allyGrass = document.createElement('img') as HTMLImageElement;
			// 	allyGrass.src = 'src/assets/battle/opponent-sand.png';
			// 	allyGrass.classList.add('ally-grass');

			// 	Promise.all([
			// 		new Promise((resolve) => {
			// 			opponentGrass.onload = resolve;
			// 		}),
			// 		new Promise((resolve) => {
			// 			allyGrass.onload = resolve;
			// 		})
			// 	]).then(() => {
			// 		gifsWrapper.appendChild(opponentGrass);
			// 		gifsWrapper.appendChild(allyGrass);
			// 		opponentGrassHeight = opponentGrass.naturalHeight;
			// 		opponentGrass.style.setProperty('--width', opponentGrass.naturalWidth + 'px');
			// 		opponentGrass.style.setProperty('--height', opponentGrass.naturalHeight + 'px');
			// 		console.log(window.innerHeight);
			// 		// calculate grassHeight based on window height
			// 		allyGrassHeight =
			// 			(allyGrass.naturalHeight * (window.innerHeight * 1.5)) / window.innerWidth;
			// 		allyGrass.style.setProperty('--width', allyGrass.naturalWidth + 'px');
			// 		allyGrass.style.setProperty('--height', allyGrass.naturalHeight + 'px');
			// 		battleLoopContext.bgDrawn = true;
			// 	});
			// }

			// TODO : animation
			//if (!battleState?.pokemonsAppearing) {

			// animated gifs, handle them outside the canvas
			// TODO : handle gender/shinys
			if (!battleLoopContext.opponentdrawn && battleLoopContext.bgDrawn) {
				if (!opponent) {
					opponent = document.createElement('img') as HTMLImageElement;
					opponent.classList.add('opponent-sprite');
				}
				if (opponent) {
					opponent.src =
						(battleCtx?.opponentPokemon.isShiny
							? battleCtx?.opponentPokemon.sprites?.male?.front.shiny1
							: battleCtx?.opponentPokemon.sprites?.male?.front.frame1) ||
						'src/assets/monsters/bw/0.png';
					opponent.onload = () => {
						opponent.style.setProperty('--width', opponent.naturalWidth + 'px');
						opponent.style.setProperty('--height', opponent.naturalHeight + 'px');
						opponent.style.setProperty('--grassHeight', opponentGrassHeight + 'px');
						gifsWrapper.appendChild(opponent);
						battleLoopContext.opponentdrawn = true;
					};
				}
			}
			if (!battleLoopContext.allydrawn && battleLoopContext.bgDrawn) {
				if (!ally) {
					ally = document.createElement('img') as HTMLImageElement;
					ally.classList.add('ally-sprite');
				}
				if (ally) {
					ally.src =
						(battleCtx?.playerPokemon.isShiny
							? battleCtx?.playerPokemon.sprites?.male?.back.shiny1
							: battleCtx?.playerPokemon.sprites?.male?.back.frame1) ||
						'src/assets/monsters/bw/0.png';

					ally.onload = () => {
						ally.style.setProperty('--width', ally.naturalWidth + 'px');
						ally.style.setProperty('--height', ally.naturalHeight + 'px');
						ally.style.setProperty('--grassHeight', allyGrassHeight + 'px');
						gifsWrapper.appendChild(ally);
						battleLoopContext.allydrawn = true;
					};
				}
			}

			// }
		}, 200);
	}

	onMount(() => {
		// set events
		battleCtx.events.pokemonChange.subscribe((owner) => {
			if (owner) {
				battleLoopContext.allydrawn = false;
				battleLoopContext.opponentdrawn = false;
			}
		});

		draw();
		window.addEventListener('keydown', (e) => {
			if (e.key === 'x') {
				battleLoopContext.debug = !battleLoopContext.debug;
			}
		});
		return () => {
			clearInterval(drawInterval);
		};
	});
</script>

<div class="battle">
	<div bind:this={gifsWrapper} class="wrapper">
		<img class="battle-bg" alt="background" src="src/assets/battle/beach-bg2.jpg" />
	</div>

	<!-- UI -->
	<EnemyInfo {battleCtx} />
	<AllyInfo {battleCtx} />
	<ActionBar bind:context bind:battleCtx bind:overWorldCtx={context.overWorldContext} />
</div>

<style lang="scss">

	.battle {
		z-index: 7;
		width: 100dvw;
		height: 100dvh;
		overflow: hidden;
		position: relative;
		background-color: white;
		box-sizing: border-box;

		--border-angle: 0turn; // For animation.
		--main-bg: conic-gradient(from var(--border-angle), #213, #112 5%, #112 60%, #213 95%);

		border: solid 3px transparent;
		--gradient-border: conic-gradient(
			from var(--border-angle),
			transparent 25%,
			#08f,
			#f03 99%,
			transparent
		);

		background: 
    // padding-box clip this background in to the overall element except the border.
			var(--main-bg) padding-box,
			// border-box extends this background to the border space
			var(--gradient-border) border-box,
			// Duplicate main background to fill in behind the gradient border. You can remove this if you want the border to extend "outside" the box background.
			var(--main-bg) border-box;

		background-position: center center;

		animation: bg-spin 10s linear infinite;
		-webkit-animation: bg-spin 10s linear infinite;
		@keyframes bg-spin {
			to {
				--border-angle: 1turn;
			}
		}
	}

	.wrapper {
		height: 100%;
		width: 100%;
		font-size: 23px;
		position: absolute;
		z-index: -1;
		//background-image: url('src/assets/battle/beach-bg.jpg');
	}

	.wrapper :global(.ally-sprite) {
		position: absolute;
		//bottom: 30%;
		bottom: 10%;
		left: calc(14% - var(--width) / 2);
		z-index: 7;
		transform: scale(2.2);
		transform-origin: bottom left;
		//filter: drop-shadow(-4px 6px 2px rgba(0, 0, 0, 0.45));
	}

	.wrapper :global(.opponent-sprite) {
		position: absolute;
		bottom: 40%;
		right: calc(25% - var(--width) / 2);
		transform: scale(1.4);
		z-index: 7;
		transform-origin: bottom left;
		//filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.66));
	}

	.wrapper :global(.battle-bg) {
		z-index: 0;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		filter: opacity(0.85) blur(3px);
	}

	.wrapper :global(.opponent-grass) {
		position: absolute;
		bottom: 28%;
		right: 5%;
		height: 18%;
		width: 35%;
		z-index: 1;
	}

	.wrapper :global(.ally-grass) {
		position: absolute;
		bottom: 0;
		//height: 50%;
		//scale: 4;
		height: 30%;
		width: 50%;
		left: 0; //calc(25% - (var(--width) * 40%) / 2);
		z-index: 1;
	}
</style>
