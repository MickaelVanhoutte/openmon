<script lang="ts">
	import { onMount } from 'svelte';
	import ActionBar from './ActionBar.svelte';
	import FloatingPokemonInfo from './FloatingPokemonInfo.svelte';
	import { BattleContext } from '../../js/context/battleContext';
	import { BattleType } from '../../js/battle/battle-model';
	import type { GameContext } from '../../js/context/gameContext';
	import type { OverworldContext } from '../../js/context/overworldContext';
	import {
		animateEntry,
		animateFaint,
		animateRun,
		initializeAnimationEngine,
		destroyAnimationEngine,
		animateAttackWithNewEngine
	} from '../../js/battle/animations';
	import beachesImage from '../../assets/battle/beaches.png';

	import { ComboMove, PokemonInstance } from '../../js/pokemons/pokedex';
	import type { Move } from '../../js/pokemons/pokedex';
	import { get } from 'svelte/store';

	interface Props {
		context: GameContext;
		battleCtx: BattleContext;
		overWorldCtx: OverworldContext;
	}

	let { context, battleCtx, overWorldCtx }: Props = $props();

	const backgroundOffset = get(context.timeOfDay.backgroundOffset);

	let gifsWrapper: HTMLDivElement;
	let scene: HTMLDivElement;
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

	let ally: HTMLImageElement[] = $state([]);
	let opponent: HTMLImageElement[] = $state([]);

	let entryAnimationsComplete = $state(false);
	let isInitialBattleEntrance = $state(true);
	const uiEntranceDelays = {
		opponentHp: 0,
		allyHp: 200,
		actionButtons: 400
	};

	$effect(() => {
		if (isInitialBattleEntrance && entryAnimationsComplete) {
			const timer = setTimeout(() => {
				isInitialBattleEntrance = false;
			}, 1500);
			return () => clearTimeout(timer);
		}
	});

	// Helper to play move animation with new engine
	function playMoveAnimation(
		move: Move,
		initiatorElement: HTMLElement,
		targetElement: HTMLElement,
		initiatorPokemon: PokemonInstance,
		targetPokemon: PokemonInstance,
		hitCount?: number
	): void {
		const initiatorSide = battleCtx.getPokemonSide(initiatorPokemon);
		const targetSide = battleCtx.getPokemonSide(targetPokemon);

		const initiatorIdx =
			initiatorSide === 'ally'
				? battleCtx.playerSide.indexOf(initiatorPokemon)
				: battleCtx.oppSide.indexOf(initiatorPokemon);
		const targetIdx =
			targetSide === 'opponent'
				? battleCtx.oppSide.indexOf(targetPokemon)
				: battleCtx.playerSide.indexOf(targetPokemon);

		animateAttackWithNewEngine({
			initiator: initiatorElement,
			target: targetElement,
			initiatorSlot: {
				side: initiatorSide === 'ally' ? 'player' : 'opponent',
				index: initiatorIdx
			},
			targetSlot: {
				side: targetSide === 'opponent' ? 'opponent' : 'player',
				index: targetIdx
			},
			moveName: move.name,
			moveCategory: move.category as 'physical' | 'special' | 'status',
			moveType: move.type,
			hitCount: hitCount
		});
	}

	// Helper for combo move animations with dynamic partner element
	function playComboMoveAnimation(
		move: Move,
		initiatorElement: HTMLElement,
		targetElement: HTMLElement,
		initiatorSide: 'ally' | 'opponent',
		initiatorIdx: number,
		targetSide: 'opponent' | 'player',
		targetIdx: number
	): Promise<void> {
		return animateAttackWithNewEngine({
			initiator: initiatorElement,
			target: targetElement,
			initiatorSlot: {
				side: initiatorSide === 'ally' ? 'player' : 'opponent',
				index: initiatorIdx
			},
			targetSlot: {
				side: targetSide,
				index: targetIdx
			},
			moveName: move.name,
			moveCategory: move.category as 'physical' | 'special' | 'status',
			moveType: move.type
		});
	}

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
			let animTarget =
				battleCtx.getPokemonSide(value.target) === 'opponent'
					? opponent[battleCtx.oppSide.indexOf(value.target)]
					: ally[battleCtx.playerSide.indexOf(value.target)];
			let animInitiator =
				battleCtx.getPokemonSide(value.initiator) === 'ally'
					? ally[battleCtx.playerSide.indexOf(value.initiator)]
					: opponent[battleCtx.oppSide.indexOf(value.initiator)];

			if (value.move instanceof ComboMove) {
				let move: ComboMove = value.move;
				addPartner(
					battleCtx.getPokemonSide(value.target) === 'opponent' ? 'ally' : 'opponent',
					move.pokemon2
				).then((partner) => {
					animateEntry(
						partner,
						battleCtx.getPokemonSide(value.target) === 'opponent' ? 'ally' : 'opponent',
						battleCtx.playerSide.length,
						true,
						battleCtx.battleType === BattleType.DOUBLE
					).then(() => {
						const initiatorSide = battleCtx.getPokemonSide(value.initiator);
						const targetSide =
							battleCtx.getPokemonSide(value.target) === 'opponent' ? 'opponent' : 'player';
						const initiatorIdx =
							initiatorSide === 'ally'
								? battleCtx.playerSide.indexOf(value.initiator)
								: battleCtx.oppSide.indexOf(value.initiator);
						const targetIdx =
							targetSide === 'opponent'
								? battleCtx.oppSide.indexOf(value.target)
								: battleCtx.playerSide.indexOf(value.target);

						// Partner's move (move2)
						playComboMoveAnimation(
							move.move2,
							partner,
							animTarget,
							initiatorSide,
							battleCtx.playerSide.length, // partner slot
							targetSide,
							targetIdx
						);

						// Main initiator's move (move1)
						playComboMoveAnimation(
							move.move1,
							animInitiator,
							animTarget,
							initiatorSide,
							initiatorIdx,
							targetSide,
							targetIdx
						).then(() => {
							animateRun(
								partner,
								battleCtx.getPokemonSide(value.target) === 'opponent' ? 'ally' : 'opponent'
							).then(() => {
								partner.remove();
							});
						});
					});
				});
			} else {
				playMoveAnimation(
					value.move,
					animInitiator,
					animTarget,
					value.initiator,
					value.target,
					value.hitCount
				);
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
				if (opponent?.length !== battleCtx.oppSide.length) {
					battleCtx.oppSide.forEach((element, idx) => {
						let img = document.createElement('img') as HTMLImageElement;
						img.addEventListener('click', () => {
							// Click handler - no action needed
						});
						img.classList.add('opponent-sprite');
						img.style.setProperty('--offSet', `${idx}`);
						opponent[idx] = img;
					});
				} else {
					const entryPromises: Promise<gsap.core.Timeline>[] = [];
					opponent.forEach((element, idx) => {
						const pokemon = battleCtx?.oppSide[idx];
						if (!pokemon) {
							return;
						}
						element.src = pokemon.getSprite();
						element.onload = () => {
							let imgHeight = element.naturalHeight;
							let screenHeight = window.innerHeight;
							let scale = Math.min(imgHeight / (screenHeight * 0.15), 0.5);

							//element.style.transform = 'scale(' + scale + ')';
							element.style.setProperty('--scale', scale + '');
							element.style.setProperty('--width', element.naturalWidth + 'px');
							element.style.setProperty('--height', element.naturalHeight + 'px');
							gifsWrapper.appendChild(element);

							const entryPromise = animateEntry(
								element,
								'opponent',
								idx,
								false,
								battleCtx.battleType === BattleType.DOUBLE
							);
							entryPromises.push(entryPromise);

							const validOpponents = opponent.filter((_, i) => battleCtx?.oppSide[i]);
							if (entryPromises.length === validOpponents.length) {
								Promise.all(entryPromises).then(() => {
									if (battleLoopContext.allydrawn) {
										entryAnimationsComplete = true;
									}
								});
							}
						};
					});
					battleLoopContext.opponentdrawn = true;
				}
			}

			if (!battleLoopContext.allydrawn && battleLoopContext.bgDrawn) {
				if (ally?.length !== battleCtx.playerSide.length) {
					battleCtx.playerSide.forEach((element, idx) => {
						let img = document.createElement('img') as HTMLImageElement;
						img.addEventListener('click', () => {
							// Click handler - no action needed
						});
						img.classList.add('ally-sprite');
						img.style.setProperty('--offSet', `${idx}`);
						ally[idx] = img;
					});
				} else {
					const allyEntryPromises: Promise<gsap.core.Timeline>[] = [];
					ally.forEach((element, idx) => {
						element.src = battleCtx?.playerSide[idx]?.getSprite(true);
						element.onload = () => {
							let imgHeight = element.naturalHeight;
							let screenHeight = window.innerHeight;
							let scale = Math.min(imgHeight / (screenHeight * 0.15), 0.5);

							//element.style.transform = 'scale(' + scale + ')';
							element.style.setProperty('--scale', scale + '');
							element.style.setProperty('--width', element.naturalWidth + 'px');
							element.style.setProperty('--height', element.naturalHeight + 'px');
							gifsWrapper.appendChild(element);

							const entryPromise = animateEntry(
								element,
								'ally',
								idx,
								false,
								battleCtx.battleType === BattleType.DOUBLE
							);
							allyEntryPromises.push(entryPromise);

							if (allyEntryPromises.length === ally.length) {
								Promise.all(allyEntryPromises).then(() => {
									if (battleLoopContext.opponentdrawn) {
										entryAnimationsComplete = true;
									}
								});
							}
						};
					});
					battleLoopContext.allydrawn = true;
				}
			}

			// }
		}, 200);
	}

	onMount(() => {
		// Initialize the new animation engine with the wrapper container (not scene which is z-index: 0)
		initializeAnimationEngine(gifsWrapper);

		// set events
		battleCtx.events.pokemonChange.subscribe((change) => {
			if (change) {
				if (change?.side === 'ally') {
					const pokemon = battleCtx.playerSide[change?.idx];
					if (pokemon) {
						animateRun(ally[change?.idx], 'ally').then(() => {
							battleLoopContext.allydrawn = false;
						});
					}
				} else {
					const pokemon = battleCtx.oppSide[change?.idx];
					if (pokemon) {
						animateRun(opponent[change?.idx], 'opponent').then(() => {
							battleLoopContext.opponentdrawn = false;
						});
					}
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
			destroyAnimationEngine();
			clearInterval(drawInterval);
		};
	});
</script>

<div class="battle" data-testid="battle-screen">
	<div bind:this={gifsWrapper} class="wrapper">
		<div
			bind:this={scene}
			class="battle-bg"
			style="background-image: url({beachesImage}); --bg-offset: {backgroundOffset}"
		></div>
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
	{#if battleCtx.oppSide[0] && entryAnimationsComplete}
		<FloatingPokemonInfo
			pokemon={battleCtx.oppSide[0]}
			position={{ bottom: '78%', left: '62%' }}
			isAlly={false}
			spriteElement={opponent[0]}
			entranceDelay={isInitialBattleEntrance ? uiEntranceDelays.opponentHp : 0}
		/>
	{/if}
	{#if battleCtx.playerSide[0] && entryAnimationsComplete}
		<FloatingPokemonInfo
			pokemon={battleCtx.playerSide[0]}
			position={{ bottom: '62%', left: '22%' }}
			isAlly={true}
			spriteElement={ally[0]}
			entranceDelay={isInitialBattleEntrance ? uiEntranceDelays.allyHp : 0}
		/>
	{/if}

	{#if battleCtx.battleType === BattleType.DOUBLE}
		{#if battleCtx.oppSide[1] && entryAnimationsComplete}
			<FloatingPokemonInfo
				pokemon={battleCtx.oppSide[1]}
				position={{ bottom: '82%', left: '58%' }}
				isAlly={false}
				spriteElement={opponent[1]}
				entranceDelay={isInitialBattleEntrance ? uiEntranceDelays.opponentHp : 0}
			/>
		{/if}
		{#if battleCtx.playerSide[1] && entryAnimationsComplete}
			<FloatingPokemonInfo
				pokemon={battleCtx.playerSide[1]}
				position={{ bottom: '46%', left: '8%' }}
				isAlly={true}
				spriteElement={ally[1]}
				entranceDelay={isInitialBattleEntrance ? uiEntranceDelays.allyHp : 0}
			/>
		{/if}
	{/if}

	<ActionBar
		bind:context
		bind:battleCtx
		bind:overWorldCtx={context.overWorldContext}
		allySprites={ally}
		entranceDelay={isInitialBattleEntrance && entryAnimationsComplete
			? uiEntranceDelays.actionButtons
			: 0}
		isInitialEntrance={isInitialBattleEntrance}
		visible={entryAnimationsComplete}
	/>
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

	@keyframes -global-impatience {
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
		height: 50%;
		width: auto;
		//transform: scale(var(--scale));
		transform-origin: bottom left;
		bottom: calc(12% + var(--offSet) * 5%);
		left: calc(25% + var(--offSet) * -15%);
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
		height: 50%;
		width: auto;
		image-rendering: pixelated;
		transform-origin: bottom right;
		bottom: calc(22% - (var(--offSet) * -5%));
		right: calc(18% + var(--offSet) * -18%);
		animation: impatience calc(8s + var(--offSet) * 1.5s) infinite;
		animation-delay: calc(2s + var(--offSet) * 1.5s);
	}

	.wrapper :global(.opponent-partner-sprite) {
		position: absolute;
		z-index: 6;
		height: 100%;
		width: auto;
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
		background-size: 100% 300%;
		background-position: 0 var(--bg-offset, 0%);
		background-repeat: no-repeat;
		image-rendering: pixelated;
		pointer-events: none;
	}
</style>
