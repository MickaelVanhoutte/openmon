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
		bgDrawn: false
	};

	let ally: HTMLImageElement;
	let opponent: HTMLImageElement;


	function draw() {
		drawInterval = setInterval(() => {
			if (!battleLoopContext.bgDrawn) {
				let bg = document.createElement('img') as HTMLImageElement;
				bg.src = 'src/assets/battle/battle-grass.png';
				bg.classList.add('battle-bg');
				bg.onload = () => {
					gifsWrapper.appendChild(bg);
					battleLoopContext.bgDrawn = true;
				};
			}

			// TODO : animation
			//if (!battleState?.pokemonsAppearing) {

			// animated gifs, handle them outside the canvas
			// TODO : handle gender/shinys
			if (!battleLoopContext.opponentdrawn) {
				if (!opponent) {
					opponent = document.createElement('img') as HTMLImageElement;
					opponent.classList.add('opponent-sprite');
				}
				if (opponent) {
					opponent.src =
						battleCtx?.opponentPokemon.sprites?.male?.front.frame1 ||
						'src/assets/monsters/bw/0.png';
					opponent.onload = () => {
						opponent.style.setProperty('--width', opponent.naturalWidth + 'px');
						opponent.style.setProperty('--height', opponent.naturalHeight + 'px');
						gifsWrapper.appendChild(opponent);
						battleLoopContext.opponentdrawn = true;
					};
				}
			}
			if (!battleLoopContext.allydrawn) {
				if (!ally) {
					ally = document.createElement('img') as HTMLImageElement;
					ally.classList.add('ally-sprite');
				}
				if (ally) {
					ally.src =
						battleCtx?.playerPokemon.sprites?.male?.back.frame1 || 'src/assets/monsters/bw/0.png';
					ally.onload = () => {
						ally.style.setProperty('--width', ally.naturalWidth + 'px');
						ally.style.setProperty('--height', ally.naturalHeight + 'px');
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
	<div bind:this={gifsWrapper} class="wrapper"></div>

	<!-- UI -->
	<EnemyInfo {battleCtx} />
	<AllyInfo {battleCtx} />
	<ActionBar bind:context bind:battleCtx bind:overWorldCtx={context.overWorldContext}/>
</div>

<style lang="scss">
	.battle {
		z-index: 7;
		width: 100dvw;
		height: 100dvh;
		overflow: hidden;
		position: relative;
		margin: auto;
	}

	.wrapper {
		font-size: 23px;
	}

	.wrapper :global(.ally-sprite) {
		position: absolute;
		bottom: 25%;
		left: calc(25% - var(--width) / 2);
		z-index: 7;
	}

	.wrapper :global(.opponent-sprite) {
		position: absolute;
		bottom: 44%;
		right: calc(25% - var(--width) / 2);
		z-index: 7;
	}

	.wrapper :global(.battle-bg) {
		z-index: 0;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
