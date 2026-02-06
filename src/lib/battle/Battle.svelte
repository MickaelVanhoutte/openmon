<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import ActionBar from './ActionBar.svelte';
	import FloatingPokemonInfo from './FloatingPokemonInfo.svelte';
	import WeatherOverlay from './WeatherOverlay.svelte';
	import HazardSprites from './HazardSprites.svelte';
	import ScreenBarrier from './ScreenBarrier.svelte';
	import { BattleContext } from '../../js/context/battleContext';
	import { BattleType, TurnPhase } from '../../js/battle/battle-model';
	import { Weather } from '../../js/battle/battle-field';
	import type { GameContext } from '../../js/context/gameContext';
	import type { OverworldContext } from '../../js/context/overworldContext';
	import {
		animateEntry,
		animateFaint,
		animateRun,
		initializeAnimationEngine,
		destroyAnimationEngine,
		animateAttackWithNewEngine,
		getAnimationEngine
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

	let {
		context = $bindable(),
		battleCtx = $bindable(),
		overWorldCtx = $bindable()
	}: Props = $props();

	const backgroundOffset = get(context.timeOfDay.backgroundOffset);

	const hazardsVersion = battleCtx.hazardsVersion;

	let gifsWrapper: HTMLDivElement;
	const fx: HTMLImageElement[] = [];
	let drawInterval: number;

	const battleLoopContext = {
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

	const ally: HTMLImageElement[] = $state([]);
	const opponent: HTMLImageElement[] = $state([]);

	const allyFainted = $state([false, false]);
	const opponentFainted = $state([false, false]);

	let entryAnimationsComplete = $state(false);
	let isInitialBattleEntrance = $state(true);
	let weatherFlash = $state(false);
	let weatherIntensify = $state(false);
	let currentWeather = $state(battleCtx.battleField.weather);
	let currentWeatherTurns = $state(battleCtx.battleField.weatherTurns);
	let initialAbilitiesTriggered = $state(false);

	// Reactive state for pokemon names to trigger {#key} updates
	const allyNames = $state(['', '']);
	const oppNames = $state(['', '']);

	const uiEntranceDelays = {
		opponentHp: 0,
		allyHp: 200,
		actionButtons: 400
	};

	$effect(() => {
		if (isInitialBattleEntrance && entryAnimationsComplete && !initialAbilitiesTriggered) {
			console.log('[Battle.svelte] Initial battle entrance triggered');
			initialAbilitiesTriggered = true;
			window.setTimeout(async () => {
				console.log('[Battle.svelte] Calling triggerInitialSwitchIn');
				battleCtx.triggerInitialSwitchIn();
				await battleCtx.processInitialAbilityActions();
				isInitialBattleEntrance = false;
			}, 300);
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
			const idx = battleCtx.playerSide.indexOf(value);
			animateFaint(ally[idx]).then(() => {
				allyFainted[idx] = true;
			});
		}
	});

	// Subscribe to weather version changes to update local reactive weather state
	battleCtx.weatherVersion.subscribe(() => {
		currentWeather = battleCtx.battleField.weather;
		currentWeatherTurns = battleCtx.battleField.weatherTurns;
	});

	// Subscribe to turn phases to trigger weather flash at turn start
	battleCtx.turnPhases.subscribe((phase) => {
		if (phase === TurnPhase.UPKEEP && battleCtx.battleField.weather !== Weather.NONE) {
			// Trigger weather flash
			weatherFlash = true;
			// Reset flash after animation completes
			window.setTimeout(() => {
				weatherFlash = false;
			}, 600);
		}
	});

	// Subscribe to weather damage events to intensify weather animation
	battleCtx.events.weatherDamage.subscribe((weather) => {
		if (weather && weather !== Weather.NONE) {
			// Trigger intensified weather animation when damage occurs
			weatherIntensify = true;
			// Reset after animation completes
			window.setTimeout(() => {
				weatherFlash = false;
			}, 1000);
		}
	});

	battleCtx.events.statChangeAnimation.subscribe(async (data) => {
		if (data) {
			const animEngine = getAnimationEngine();
			if (animEngine) {
				const isOpponent = battleCtx.oppSide.includes(data.target);
				const idx = isOpponent
					? battleCtx.oppSide.indexOf(data.target)
					: battleCtx.playerSide.indexOf(data.target);

				const spriteEl = isOpponent ? opponent[idx] : ally[idx];

				if (spriteEl) {
					const slot = {
						side: (isOpponent ? 'opponent' : 'player') as 'opponent' | 'player',
						index: idx
					};
					const effectName = data.stages > 0 ? 'buff' : 'debuff';
					await animEngine.showSpriteEffect(
						effectName,
						{
							element: spriteEl,
							slot,
							homePosition: animEngine.getPosition(slot)
						},
						{
							scale: 1.2,
							zIndex: animEngine.getEffectZIndex(slot)
						}
					);
				}
			}
			battleCtx.events.statChangeAnimation.set(null);
		}
	});

	// Subscribe to weather change events for animation and UI update
	battleCtx.events.weatherChange.subscribe((data) => {
		if (data) {
			currentWeather = data.weather;
			weatherFlash = true;
			window.setTimeout(() => {
				weatherFlash = false;
			}, 600);
			battleCtx.events.weatherChange.set(null);
		}
	});

	battleCtx.events.opponentPokemonFaint.subscribe((value) => {
		if (value && opponent) {
			const idx = battleCtx.oppSide.indexOf(value);
			animateFaint(opponent[idx]).then(() => {
				opponentFainted[idx] = true;
			});
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
			const animInitiator =
				battleCtx.getPokemonSide(value.initiator) === 'ally'
					? ally[battleCtx.playerSide.indexOf(value.initiator)]
					: opponent[battleCtx.oppSide.indexOf(value.initiator)];

			// For self-targeting moves (weather, field effects), use initiator as target
			// This handles cases where target === initiator or target element not found
			let animTarget: HTMLImageElement | undefined;
			if (value.target === value.initiator) {
				// Self-targeting move (e.g., Sandstorm, Stealth Rock)
				animTarget = animInitiator;
			} else {
				const targetSide = battleCtx.getPokemonSide(value.target);
				animTarget =
					targetSide === 'opponent'
						? opponent[battleCtx.oppSide.indexOf(value.target)]
						: ally[battleCtx.playerSide.indexOf(value.target)];
				// Fallback to initiator if target element not found
				if (!animTarget) {
					animTarget = animInitiator;
				}
			}

			if (value.move instanceof ComboMove) {
				const move: ComboMove = value.move;
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
		return new Promise((resolve, _reject) => {
			const partner = document.createElement('img') as HTMLImageElement;
			partner.classList.add(target + '-partner-sprite');
			if (target === 'opponent') {
				partner.src = pokemon.getSprite();
			} else {
				partner.src = pokemon.getSprite(true);
			}

			partner.onload = () => {
				const scale = Math.max(Math.min(partner.naturalHeight / 200, 0.9), 0.1);
				partner.style.setProperty('--scale', scale + '');
				partner.style.setProperty('--width', partner.naturalWidth + 'px');
				partner.style.setProperty('--height', partner.naturalHeight + 'px');
				gifsWrapper.appendChild(partner);
				return resolve(partner);
			};
		});
	}

	function draw() {
		drawInterval = window.setInterval(() => {
			if (!battleLoopContext.opponentdrawn && battleLoopContext.bgDrawn) {
				if (opponent?.length !== battleCtx.oppSide.length) {
					battleCtx.oppSide.forEach((_element, idx) => {
						const img = document.createElement('img') as HTMLImageElement;
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
							const imgHeight = element.naturalHeight;
							const screenHeight = window.innerHeight;
							const scale = Math.min(imgHeight / (screenHeight * 0.15), 0.5);

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
					battleCtx.playerSide.forEach((_element, idx) => {
						const img = document.createElement('img') as HTMLImageElement;
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
						const pokemon = battleCtx?.playerSide[idx];
						if (!pokemon) {
							return;
						}
						element.src = pokemon.getSprite(true);
						element.onload = () => {
							const imgHeight = element.naturalHeight;
							const screenHeight = window.innerHeight;
							const scale = Math.min(imgHeight / (screenHeight * 0.15), 0.5);

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
					if (pokemon && ally[change.idx]) {
						// Reset fainted state to show HP bar
						allyFainted[change.idx] = false;
						// Update sprite src
						const newSrc = pokemon.getSprite(true);
						ally[change.idx].onload = () => {
							// Reset GSAP transforms from faint animation
							gsap.set(ally[change.idx], {
								x: 0,
								y: 0,
								filter: 'brightness(1)',
								opacity: 1,
								scale: 1,
								transform: ''
							});
							// Animate entry after sprite loads
							animateEntry(ally[change.idx], 'ally', change.idx);
							// Update reactive name AFTER animation starts to trigger {#key} re-render
							allyNames[change.idx] = pokemon.name;
						};
						// Force onload to fire even for cached images
						ally[change.idx].src = '';
						ally[change.idx].src = newSrc;
					}
				} else {
					const pokemon = battleCtx.oppSide[change?.idx];
					if (pokemon && opponent[change.idx]) {
						// Reset fainted state to show HP bar
						opponentFainted[change.idx] = false;
						// Update sprite src
						const newSrc = pokemon.getSprite();
						opponent[change.idx].onload = () => {
							// Reset GSAP transforms from faint animation
							gsap.set(opponent[change.idx], {
								x: 0,
								y: 0,
								filter: 'brightness(1)',
								opacity: 1,
								scale: 1,
								transform: ''
							});
							// Animate entry after sprite loads
							animateEntry(opponent[change.idx], 'opponent', change.idx);
							// Update reactive name AFTER animation starts to trigger {#key} re-render
							oppNames[change.idx] = pokemon.name;
						};
						// Force onload to fire even for cached images
						opponent[change.idx].src = '';
						opponent[change.idx].src = newSrc;
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
			class="battle-bg"
			style="background-image: url({beachesImage}); --bg-offset: {backgroundOffset}"
		></div>

		<WeatherOverlay
			weather={currentWeather}
			weatherTurns={currentWeatherTurns}
			flash={weatherFlash}
			intensify={weatherIntensify}
		/>
		<HazardSprites
			allySide={battleCtx.battleField.allySide}
			enemySide={battleCtx.battleField.enemySide}
			{hazardsVersion}
		/>
		<ScreenBarrier
			allySide={battleCtx.battleField.allySide}
			enemySide={battleCtx.battleField.enemySide}
		/>

		<div class="fx"></div>
		<div class="fx"></div>
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
		{#key oppNames[0]}
			<FloatingPokemonInfo
				pokemon={battleCtx.oppSide[0]}
				position={{ bottom: '78%', left: '62%' }}
				isAlly={false}
				spriteElement={opponent[0]}
				entranceDelay={isInitialBattleEntrance ? uiEntranceDelays.opponentHp : 0}
				visible={!opponentFainted[0]}
				side="opponent"
				index={0}
			/>
		{/key}
	{/if}
	{#if battleCtx.playerSide[0] && entryAnimationsComplete}
		{#key allyNames[0]}
			<FloatingPokemonInfo
				pokemon={battleCtx.playerSide[0]}
				position={{ bottom: '62%', left: '22%' }}
				isAlly={true}
				spriteElement={ally[0]}
				entranceDelay={isInitialBattleEntrance ? uiEntranceDelays.allyHp : 0}
				visible={!allyFainted[0]}
				side="ally"
				index={0}
			/>
		{/key}
	{/if}

	{#if battleCtx.battleType === BattleType.DOUBLE}
		{#if battleCtx.oppSide[1] && entryAnimationsComplete}
			{#key oppNames[1]}
				<FloatingPokemonInfo
					pokemon={battleCtx.oppSide[1]}
					position={{ bottom: '82%', left: '58%' }}
					isAlly={false}
					spriteElement={opponent[1]}
					entranceDelay={isInitialBattleEntrance ? uiEntranceDelays.opponentHp : 0}
					visible={!opponentFainted[1]}
					side="opponent"
					index={1}
				/>
			{/key}
		{/if}
		{#if battleCtx.playerSide[1] && entryAnimationsComplete}
			{#key allyNames[1]}
				<FloatingPokemonInfo
					pokemon={battleCtx.playerSide[1]}
					position={{ bottom: '46%', left: '8%' }}
					isAlly={true}
					spriteElement={ally[1]}
					entranceDelay={isInitialBattleEntrance ? uiEntranceDelays.allyHp : 0}
					visible={!allyFainted[1]}
					side="ally"
					index={1}
				/>
			{/key}
		{/if}
	{/if}

	<ActionBar
		bind:context
		bind:battleCtx
		bind:overWorldCtx
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
		/* offSet=0 -> bottom: 12%, left: 22% */
		/* offSet=1 -> bottom: 17%, left: 4% */
		bottom: calc(12% + var(--offSet) * 5%);
		left: calc(22% + var(--offSet) * -18%);
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
		/* offSet=0 -> bottom: 22%, right: 18% */
		/* offSet=1 -> bottom: 27%, right: 8% */
		bottom: calc(22% + var(--offSet) * 5%);
		right: calc(18% + var(--offSet) * -10%);
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
