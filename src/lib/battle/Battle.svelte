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
	import {
		ComboMove,
		Move,
		MoveEffect,
		MoveInstance,
		PokemonInstance
	} from '../../js/pokemons/pokedex';

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
	let spriteFxPartner: HTMLDivElement;
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
			if (value.move instanceof ComboMove) {
				let move: ComboMove = value.move;
				let animTarget = value.target === 'opponent' ? opponent : ally;
				let animInitiator = value.initiator === 'ally' ? ally : opponent;
				addPartner(value.target === 'opponent' ? 'ally' : 'opponent', move.pokemon2).then(
					(partner) => {
						animateEntry(partner, value.target === 'opponent' ? 'ally' : 'opponent', true).then(
							() => {
								animateMove(
									move.move2,
									value.initiator,
									animTarget,
									partner,
									scene,
									spriteFxPartner,
									fx
								);
								animateMove(
									move.move1,
									value.initiator,
									animTarget,
									animInitiator,
									scene,
									spriteFx,
									fx
								).then(() => {
									animateRun(partner, value.target === 'opponent' ? 'ally' : 'opponent').then(
										() => {
											partner.remove();
										}
									);
								});
							}
						);
					}
				);
			} else {
				let animTarget = value.target === 'opponent' ? opponent : ally;
				let animInitiator = value.initiator === 'ally' ? ally : opponent;
				animateMove(value.move, value.initiator, animTarget, animInitiator, scene, spriteFx, fx);
			}
		}
	});

	function addPartner(target: string, pokemon: PokemonInstance): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			let partner = document.createElement('img') as HTMLImageElement;
			partner.classList.add(target + '-partner-sprite');
			if (target === 'opponent') {
				partner.src =
					(pokemon.isShiny
						? pokemon.sprites?.male?.front?.shiny1
						: pokemon.sprites?.male?.front?.frame1) || 'src/assets/monsters/bw/0.png';
			} else {
				partner.src =
					(pokemon.isShiny
						? pokemon.sprites?.male?.back?.shiny1
						: pokemon.sprites?.male?.back?.frame1) || 'src/assets/monsters/bw/0.png';
			}

			partner.onload = () => {
				let scale = Math.max(Math.min(partner.naturalHeight / 200, 0.9), 0.1);
				partner.style.setProperty('--scale', scale + '');
				partner.style.setProperty('--width', partner.naturalWidth + 'px');
				partner.style.setProperty('--height', partner.naturalHeight + 'px');
				gifsWrapper.appendChild(partner);
				return resolve(partner);
			};
		});
	}

	function draw() {
		drawInterval = setInterval(() => {
			
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
						let scale = .6;
						//let scale = Math.min(battleCtx?.opponentPokemon.height / 4, 1);
						//let scale = Math.max(Math.min(battleCtx?.opponentPokemon.height / 3, .6), 0.4);
						//let scale = Math.max(Math.min(opponent.naturalHeight / 200, 0.9), 0.1);
						//console.log(battleCtx?.opponentPokemon.name, opponent.naturalHeight / 100, scale);
						console.log('opponent', scale, opponent.naturalHeight);
						opponent.style.transform = 'scale(' + scale + ') translateY(50%)';
						opponent.style.setProperty('--scale', scale + '');
						opponent.style.setProperty('--width', opponent.naturalWidth + 'px');
						opponent.style.setProperty('--height', opponent.naturalHeight + 'px');
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
						let scale = .65;
						//let scale = Math.min(battleCtx?.playerPokemon.height / 4, 1);
						//let scale = Math.max(Math.min(ally.naturalHeight / 200, 1), 0.2);
						//let scale = Math.max(Math.min(battleCtx?.playerPokemon.height / 3, .7), 0.4);
						//console.log(battleCtx?.playerPokemon.name, ally.naturalHeight / 100, scale);
						console.log('ally', scale, ally.naturalHeight);
						ally.style.transform = 'scale(' + scale + ') translateY(65%)';
						ally.style.setProperty('--scale', scale + '');
						ally.style.setProperty('--width', ally.naturalWidth + 'px');
						ally.style.setProperty('--height', ally.naturalHeight + 'px');
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
				if (owner === battleCtx.player) {
					animateRun(ally, 'ally').then(() => {
						battleLoopContext.allydrawn = false;
					});
				} else {
					animateRun(opponent, 'opponent').then(() => {
						battleLoopContext.opponentdrawn = false;
					});
				}
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
		<img
			class="battle-bg"
			bind:this={scene}
			alt="background"
			src="src/assets/battle/bg-beach6.jpg"
		/>
		<div class="fx" bind:this={spriteFx}></div>
		<div class="fx" bind:this={spriteFxPartner}></div>
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

		// &:after {
		// 	content: '';
		// 	position: absolute;
		// 	left: 0;
		// 	top: 0;
		// 	width: 100dvw;
		// 	height: 108dvh;
		// 	border-radius: 30p;
		// 	border: 31px solid rgba(0, 0, 0, 0.6);
		// 	box-shadow: inset 5px 5px 33px 72px rgba(0, 0, 0, 0.6);
		// }
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
		scale: 0.2;
		transform-origin: bottom left;
	}

	@keyframes impatience {
		0% {
			margin-bottom: 0;
			margin-left: 0;
		}
		10% {
			margin-bottom: 2px;
			margin-left: 0;
		}
		20% {
			margin-bottom: 0;
			margin-left: 0;
		}
		30% {
			margin-bottom: 2px;
			margin-left: 0;
		}
		40% {
			margin-bottom: 0;
			margin-left: 0;
		}
		50% {
			margin-bottom: 2px;
			margin-left: 0;
		}
		60% {
			margin-bottom: 0;
			margin-left: 0;
		}
		70% {
			margin-bottom: 2px;
			margin-left: 0;
		}
		80% {
			margin-bottom: 0;
			margin-left: 0;
		}
		83% {
			margin-bottom: 2px;
			margin-left: 0;
		}
		86% {
			margin-bottom: 0;
			margin-left: 4px;
		}
		89% {
			margin-bottom: 2px;
			margin-left: 0;
		}
		92% {
			margin-bottom: 0;
			margin-left: -4px;
		}
		95% {
			margin-bottom: 2px;
			margin-left: 0;
		}
		100% {
			margin-bottom: 0;
			margin-left: 0;
		}
	}

	.wrapper :global(.ally-sprite) {
		position: absolute;
		display: block;
		z-index: 8;
		height: 100%;
		width: auto;
		transform: scale(var(--scale)) translateY(62%);
		transform-origin: bottom left;
		bottom: 50%;
		left: 0;
		animation: impatience 8s infinite;
		animation-delay: 1.5s;
	}

	.wrapper :global(.ally-sprite::after) {
		content: '';
            position: absolute;
            bottom: -10px; /* Adjust this value to position the shadow correctly */
            left: 50%;
            transform: translateX(-50%);
            width: 80px; /* Adjust the width to match the character's width */
            height: 20px; /* Adjust the height for the desired shadow size */
            background: rgba(0, 0, 0, 0.5); /* Adjust the color and opacity for a shadow effect */
            border-radius: 50%; /* Make the shadow oval-shaped */
            border: 1px solid red; /* Debugging: Add a border to see the element */
	}

	.wrapper :global(.ally-partner-sprite) {
		position: absolute;
		z-index: 7;
		height: 100%;
		width: auto;
		transform: scale(var(--scale))  translateY(59%);
		transform-origin: bottom left;
		bottom: 50%;
		left: 0;
		animation: impatience 8s infinite;
		animation-delay: 1.6s;
	}

	.wrapper :global(.opponent-sprite) {
		position: absolute;
		z-index: 7;
		height: 100%;
		width: auto;
		transform: scale(var(--scale))  translateY(50%);
		transform-origin: bottom left;
		bottom: 50%;
		left: 0;
		animation: impatience 8s infinite;
		animation-delay: 2s;
	}

	.wrapper :global(.opponent-partner-sprite) {
		position: absolute;
		z-index: 6;
		height: 100%;
		width: auto;
		transform: scale(var(--scale))  translateY(47%);
		transform-origin: bottom left;
		bottom: 50%;
		left: 0;
		animation: impatience 8s infinite;
		animation-delay: 1.8s;
	}

	.wrapper .battle-bg {
		z-index: 0;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		filter: blur(1px);
	}
</style>
