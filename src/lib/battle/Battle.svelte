<script lang="ts">
	import { onMount } from 'svelte';
	import ActionBar from './ActionBar.svelte';
	import EnemyInfo from './EnemyInfo.svelte';
	import AllyInfo from './AllyInfo.svelte';
	import { BattleContext } from '../../js/context/battleContext';
	import { BattleType } from "../../js/battle/battle-model";
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

	let ally: HTMLImageElement[] = [];
	let opponent: HTMLImageElement[] = [];

	battleCtx.events.playerPokemonFaint.subscribe((value) => {
		if (value && ally) {
			animateFaint(ally[battleCtx.playerSide.indexOf(value)]);
		}
	});

	battleCtx.events.opponentPokemonFaint.subscribe((value) => {
		if (value && opponent) {
			animateFaint(opponent[battleCtx.oppSide.indexOf(value)]);
		}
	});

	battleCtx.events.runnaway.subscribe((value) => {
		if (value) {
			animateRun(ally[0], 'ally').then(() => {
				animateRun(ally[1], 'ally');
			});
		}
	});

	battleCtx.events.animateAttack.subscribe((value) => {
		if (value) {
			let animTarget = battleCtx.getPokemonSide(value.target) === 'opponent' ? opponent[battleCtx.oppSide.indexOf(value.target)] : ally[battleCtx.playerSide.indexOf(value.target)];
			let animInitiator = battleCtx.getPokemonSide(value.initiator) === 'ally' ? ally[battleCtx.playerSide.indexOf(value.initiator)] : opponent[battleCtx.oppSide.indexOf(value.initiator)];

			if (value.move instanceof ComboMove) {
				let move: ComboMove = value.move;
				addPartner(battleCtx.getPokemonSide(value.target) === 'opponent' ? 'ally' : 'opponent', move.pokemon2).then(
					(partner) => {
						animateEntry(partner, battleCtx.getPokemonSide(value.target) === 'opponent' ? 'ally' : 'opponent', battleCtx.playerSide.length, true, battleCtx.battleType === BattleType.DOUBLE).then(
							() => {
								animateMove(
									move.move2,
									battleCtx.getPokemonSide(value.initiator),
									animTarget,
									partner,
									scene,
									spriteFxPartner,
									fx
								);
								animateMove(
									move.move1,
									battleCtx.getPokemonSide(value.initiator),
									animTarget,
									animInitiator,
									scene,
									spriteFx,
									fx
								).then(() => {
									animateRun(partner, battleCtx.getPokemonSide(value.target) === 'opponent' ? 'ally' : 'opponent').then(
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
				animateMove(value.move, battleCtx.getPokemonSide(value.initiator), animTarget, animInitiator, scene, spriteFx, fx);
			}
		}
	});

	function addPartner(target: string, pokemon: PokemonInstance): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			let partner = document.createElement('img') as HTMLImageElement;
			partner.classList.add(target + '-partner-sprite');
			if (target === 'opponent') {
				partner.src = pokemon.getSprite();
			} else {
				partner.src = pokemon.getSprite(true);
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
			
			if (!battleLoopContext.opponentdrawn && battleLoopContext.bgDrawn) {
				if(opponent?.length !== battleCtx.oppSide.length){
					battleCtx.oppSide.forEach((element, idx) => {
						let img = document.createElement('img') as HTMLImageElement;
						img.addEventListener('click', () => {
							console.log('clicked' + element.name);
						});
						img.classList.add('opponent-sprite');
						img.style.setProperty('--offSet', `${idx}`);
						opponent[idx] = img;
					});
				}else{
					opponent.forEach((element, idx) => {
						element.src = battleCtx?.oppSide[idx]?.getSprite();
						element.onload = () => {
							let imgHeight = element.naturalHeight;
							let screenHeight = window.innerHeight;
							let scale = Math.min(imgHeight / (screenHeight * 0.15), 0.5);
						
							element.style.transform = 'scale(' + scale + ')';
							element.style.setProperty('--scale', scale + '');
							element.style.setProperty('--width', element.naturalWidth + 'px');
							element.style.setProperty('--height', element.naturalHeight + 'px');
							gifsWrapper.appendChild(element);
							
							animateEntry(element, 'opponent', idx, false, battleCtx.battleType === BattleType.DOUBLE);
						};
					});
					battleLoopContext.opponentdrawn = true;
				}

			}


			if (!battleLoopContext.allydrawn && battleLoopContext.bgDrawn) {
				if(ally?.length !== battleCtx.playerSide.length){
					battleCtx.playerSide.forEach((element, idx) => {
						let img = document.createElement('img') as HTMLImageElement;
						img.addEventListener('click', () => {
							console.log('clicked' + element.name);
						});
						img.classList.add('ally-sprite');
						img.style.setProperty('--offSet', `${idx}`);
						ally[idx] = img;
					});
				}else{
					ally.forEach((element, idx) => {
						element.src =
						battleCtx?.playerSide[idx]?.getSprite(true);
						element.onload = () => {
							let imgHeight = element.naturalHeight;
							let screenHeight = window.innerHeight;
							let scale = Math.min(imgHeight / (screenHeight * 0.15), 0.5);
						
							element.style.transform = 'scale(' + scale + ')';
							element.style.setProperty('--scale', scale + '');
							element.style.setProperty('--width', element.naturalWidth + 'px');
							element.style.setProperty('--height', element.naturalHeight + 'px');
							gifsWrapper.appendChild(element);
							animateEntry(element, 'ally', idx, false, battleCtx.battleType === BattleType.DOUBLE);
						};
					});
					battleLoopContext.allydrawn = true;
				}

			}

			// }
		}, 200);
	}

	onMount(() => {
		// set events
		battleCtx.events.pokemonChange.subscribe((change) => {
			if (change) {
				if (change?.side === 'ally') {
					animateRun(ally[change?.idx], 'ally').then(() => {
						battleLoopContext.allydrawn = false;
					});
				} else {
					animateRun(opponent[change?.idx], 'opponent').then(() => {
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
	<EnemyInfo {battleCtx} idx={0}/>
	<AllyInfo {battleCtx} idx={0}/>

	{#if battleCtx.battleType === BattleType.DOUBLE}
		{#if battleCtx.oppSide[1]}
			<EnemyInfo {battleCtx} idx={1}/>
		{/if}
		{#if battleCtx.playerSide[1]}
			<AllyInfo {battleCtx} idx={1}/>
		{/if}
	{/if}

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
		pointer-events: none;
	}
	.wrapper :global(div.fx) {
		background-repeat: no-repeat;
		background-position: 0 50%;
		background-size: cover;
		scale: 0.2;
		transform-origin: bottom left;
		pointer-events: none;
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
		z-index: calc(8 + var(--offSet) * -1);
		image-rendering: pixelated;
		height: 100%;
		width: auto;
		transform: scale(var(--scale));
		transform-origin: bottom left;
		bottom: calc(var(--offSet) * 5%);
		left: 0;
		animation: impatience calc(8s + var(--offSet) * 1.5s) infinite;
		animation-delay: calc(1.5s + var(--offSet) * 1.5s);
	}

	.wrapper :global(.ally-partner-sprite) {
		position: absolute;
		z-index: 7;
		height: 100%;
		width: auto;
		transform: scale(var(--scale));
		transform-origin: bottom left;
		bottom: 35%;
		left: 0;
		animation: impatience 8s infinite;
		animation-delay: 1.6s;
		pointer-events: none;
	}

	.wrapper :global(.opponent-sprite) {
		position: absolute;
		z-index: calc(5 + var(--offSet));
		height: 100%;
		width: auto;
		image-rendering: pixelated;
		transform: scale(var(--scale))  translateY(50%);
		transform-origin: bottom left;
		bottom: calc(20% - (var(--offSet) * -5%));
		left: 0;
		animation: impatience calc(8s + var(--offSet) * 1.5s) infinite;
		animation-delay: calc(2s + var(--offSet) * 1.5s);
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
		pointer-events: none;
	}

	.wrapper .battle-bg {
		z-index: 0;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		//filter: blur(1px);
		image-rendering: pixelated;
		pointer-events: none;
	}
</style>
