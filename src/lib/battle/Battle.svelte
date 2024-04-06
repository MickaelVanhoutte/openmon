<script lang="ts">
	import { onMount } from 'svelte';
	import ActionBar from './ActionBar.svelte';
	import EnemyInfo from './EnemyInfo.svelte';
	import AllyInfo from './AllyInfo.svelte';
	import { BattleContext } from '../../js/context/battleContext';
	import type { GameContext } from '../../js/context/gameContext';
	import type { OverworldContext } from '../../js/context/overworldContext';
	import {
		animateEntry,
		animateFaint,
		animateMove,
		animateRun
	} from '../../js/battle/animations/battle-animations';

	import moves from '../../assets/data/raw/moves/moves.json';
				import { Move, MoveEffect } from '../../js/pokemons/pokedex';

	/**
	 * Battle screen component, handles pokemons display.
	 *
	 */
	export let context: GameContext;
	export let battleCtx: BattleContext;
	export let overWorldCtx: OverworldContext;

	let gifsWrapper: HTMLDivElement;
	let scene: HTMLImageElement;
	let fx: HTMLImageElement[] = [];
	let spriteFx: HTMLDivElement;
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

	battleCtx.events.playerPokemonFaint.subscribe((value) => {
		if (value && ally) {
			animateFaint(ally);
		}
	});

	battleCtx.events.opponentPokemonFaint.subscribe((value) => {
		if (value && opponent) {
			animateFaint(opponent);
		}
	});

	battleCtx.events.runnaway.subscribe((value) => {
		if (value) {
			animateRun(ally, 'ally');
		}
	});

	battleCtx.events.animateAttack.subscribe((value) => {
		if (value) {
			let animTarget = value.target === 'opponent' ? opponent : ally;
			let animInitiator = value.initiator === 'ally' ? ally : opponent;
			animateMove(
				value.move,
				value.initiator,
				animTarget,
				animInitiator,
				scene,
				spriteFx,
				fx
			);
		}
	});

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
					// scale based on pokemon height

				
					opponent.src =
						(battleCtx?.opponentPokemon.isShiny
							? battleCtx?.opponentPokemon.sprites?.male?.front.shiny1
							: battleCtx?.opponentPokemon.sprites?.male?.front.frame1) ||
						'src/assets/monsters/bw/0.png';
					opponent.onload = () => {
						//let scale = Math.min(battleCtx?.opponentPokemon.height / 4, 1);
						//let scale = Math.max(Math.min(battleCtx?.opponentPokemon.height / 3, .7), 0.2);
						let scale = Math.max(Math.min(opponent.naturalHeight / 200, .9), 0.1);
						console.log(battleCtx?.opponentPokemon.name, opponent.naturalHeight / 100, scale);



						opponent.style.setProperty('--scale', scale + '');
						opponent.style.setProperty('--width', opponent.naturalWidth + 'px');
						opponent.style.setProperty('--height', opponent.naturalHeight + 'px');
						opponent.style.setProperty('--grassHeight', opponentGrassHeight + 'px');
						gifsWrapper.appendChild(opponent);
						battleLoopContext.opponentdrawn = true;
						animateEntry(opponent, 'opponent');
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
						//let scale = Math.min(battleCtx?.playerPokemon.height / 4, 1);
						let scale = Math.max(Math.min(ally.naturalHeight / 200, 1), 0.2);
						//let scale = Math.max(Math.min(battleCtx?.playerPokemon.height / 3, .9), 0.3);
						console.log(battleCtx?.playerPokemon.name, ally.naturalHeight / 100, scale);
						ally.style.setProperty('--scale', scale + '')
						ally.style.setProperty('--width', ally.naturalWidth + 'px');
						ally.style.setProperty('--height', ally.naturalHeight + 'px');
						ally.style.setProperty('--grassHeight', allyGrassHeight + 'px');
						gifsWrapper.appendChild(ally);
						battleLoopContext.allydrawn = true;
						animateEntry(ally, 'ally');
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
				testMoves();
			}
		});
		
		return () => {
			clearInterval(drawInterval);
		};
	});

	// TEST

	function testMoves(){
		
				// test moves
				
				//@ts-ignore
				let movesImpl = moves.map((m) => new Move(m.id, m.identifier, typeById[m.type_id] as string, 'physical', 40, 100, 35, 1, new MoveEffect(1, 1, '',''), 0, '', 1));
				
				
				// @ts-ignore
				animateMove(movesImpl.find(m => m.name === 'stomp'), 'ally', opponent, ally, scene, spriteFx, fx)
				.then(() => {
					// @ts-ignore
					animateMove(movesImpl.find(m => m.name === 'blaze-kick'), 'ally', opponent, ally, scene, spriteFx, fx)
					.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'triple-axel'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'thunderous-kick'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'comet-punch'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'fire-punch'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'ice-punch'), 'ally', opponent, ally, scene, spriteFx, fx)

						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'thunder-punch'), 'ally', opponent, ally, scene, spriteFx, fx)

						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'shadow-punch'), 'ally', opponent, ally, scene, spriteFx, fx)

						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'poison-jab'), 'ally', opponent, ally, scene, spriteFx, fx)

						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'karate-chop'), 'ally', opponent, ally, scene, spriteFx, fx)

						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'pound'), 'ally', opponent, ally, scene, spriteFx, fx)

						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'poison-tail'), 'ally', opponent, ally, scene, spriteFx, fx)

						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'aqua-tail'), 'ally', opponent, ally, scene, spriteFx, fx)

						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'volt-tackle'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'wood-hammer'), 'ally', opponent, ally, scene, spriteFx, fx)

						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'ice-hammer'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'flame-charge'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'aqua-jet'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'double-slap'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'scratch'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'cross-poison'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'metal-claw'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'shadow-claw'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'bite'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'fire-fang'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'ice-fang'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'thunder-fang'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'poison-fang'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'thunder-shock'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'spark'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'ember'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'hyper-beam'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'razor-wind'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'dazzling-gleam'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'shadow-ball'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'leech-seed'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'leafage'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'venoshock'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'toxic'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'rock-slide'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'waterfall'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'surf'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'nasty-plot'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'swagger'), 'ally', opponent, ally, scene, spriteFx, fx)
						.then(() => {
						// @ts-ignore
						animateMove(movesImpl.find(m => m.name === 'fake-tears'), 'ally', opponent, ally, scene, spriteFx, fx)
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
					});
				});

	}

	const typeById = {
    1: 'normal',
    2: 'fighting',
    3: 'flying',
    4: 'poison',
    5: 'ground',
    6: 'rock',
    7: 'bug',
    8: 'ghost',
    9: 'steel',
    10: 'fire',
    11: 'water',
    12: 'grass',
    13: 'electric',
    14: 'psychic',
    15: 'ice',
    16: 'dragon',
    17: 'dark',
    18: 'dragon'
}

</script>

<div class="battle">
	<div bind:this={gifsWrapper} class="wrapper">
		<img class="battle-bg" bind:this={scene} alt="background" src="src/assets/battle/bg-beach.png" />
		<div class="fx" bind:this={spriteFx}></div>
		<img
			bind:this={fx[0]}
			class="fx"
			alt="fx"
			src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
		/>
		<img
			bind:this={fx[1]}
			class="fx"
			alt="fx"
			src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
		/>
		<img
			bind:this={fx[2]}
			class="fx"
			alt="fx"
			src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
		/>
		<img
			bind:this={fx[3]}
			class="fx"
			alt="fx"
			src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
		/>
		<img
			bind:this={fx[4]}
			class="fx"
			alt="fx"
			src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
		/>
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
		background-color: black;
		box-sizing: border-box;
		border: solid 3px transparent;
	}

	.wrapper {
		height: 100%;
		width: 100%;
		font-size: 23px;
		position: absolute;
		z-index: -1;
	}

	.wrapper :global(.fx) {
		visibility: hidden;
		opacity: 0;
		position: absolute;
		bottom: 0;
		left: 0;
		z-index: 9;
	}
	.wrapper :global(div.fx) {
		background-repeat: no-repeat;
		background-position: 0 50%;
		background-size: cover;
		scale: .2;
		transform-origin: bottom left;
	}

	.wrapper :global(.ally-sprite) {
		position: absolute;
		z-index: 8;
		height: 100%;
		width: auto;
		transform: scale(var(--scale));
		transform-origin: bottom left;
		bottom: 15%;
		left: 0;
	}


	.wrapper :global(.opponent-sprite) {
		position: absolute;
		z-index: 7;
		height: 100%;
		width: auto;
		transform: scale(var(--scale));
		transform-origin: bottom left;
		bottom: 35%;
		left: 0;
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
</style>
