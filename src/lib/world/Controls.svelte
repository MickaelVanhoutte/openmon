<script lang="ts">
	import { onMount } from 'svelte';
	import { MenuType, type OverworldContext } from '../../js/context/overworldContext';
	import { ABButtons, KeyMap, lastKey } from '../../js/commands/controls';
	import { JoystickController } from '../../js/commands/joystick-controller';
	import type { GameContext } from '../../js/context/gameContext';
	import { FlagEntry } from '../../js/scripting/quests';
	import type { SavesHolder } from '../../js/context/savesHolder';
	import { backInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	export let context: GameContext;
	export let overWorldCtx: OverworldContext;
	export let savesHolder: SavesHolder;

	let abButtonsC: HTMLDivElement;
	let joysticks: HTMLDivElement;
	let abButtons: ABButtons;
	let joystick: JoystickController;
	let displayedQuests = false;
	let menu = false;
	// Joystick listener

	const jsCallback = (data: any) => {
		if (!overWorldCtx.getPaused()) {
			if (data.angle) {
				let degrees = data.angle * (180 / Math.PI);

				if (degrees < 0) {
					degrees = 360 + degrees;
				}

				overWorldCtx.keys.resetAll();

				if (degrees > 45 && degrees < 135) {
					overWorldCtx.keys.pressKey(KeyMap.Down);
					lastKey.key = 'ArrowDown';
				} else if (degrees > 135 && degrees < 225) {
					overWorldCtx.keys.pressKey(KeyMap.Left);
					lastKey.key = 'ArrowLeft';
				} else if (degrees > 225 && degrees < 315) {
					overWorldCtx.keys.pressKey(KeyMap.Up);
					lastKey.key = 'ArrowUp';
				} else {
					overWorldCtx.keys.pressKey(KeyMap.Right);
					lastKey.key = 'ArrowRight';
				}
				displayedQuests = false;
			} else {
				overWorldCtx.keys.resetAll();
			}
		}
	};

	// Keyboard listeners

	const keyUpListener = (e: KeyboardEvent) => {
		if (!overWorldCtx.getPaused()) {
			switch (e.key) {
				case 'ArrowDown':
					overWorldCtx.keys.unpressKey(KeyMap.Down);
					break;
				case 'ArrowUp':
					overWorldCtx.keys.unpressKey(KeyMap.Up);
					break;
				case 'ArrowRight':
					overWorldCtx.keys.unpressKey(KeyMap.Right);
					break;
				case 'ArrowLeft':
					overWorldCtx.keys.unpressKey(KeyMap.Left);
					break;
			}
		}
	};
	const keyDownListener = (e: KeyboardEvent) => {
		overWorldCtx.keys.resetAll();
		displayedQuests = false;
		if (!overWorldCtx.getPaused()) {
			switch (e.key) {
				case 'ArrowDown':
					lastKey.key = 'ArrowDown';
					overWorldCtx.keys.pressKey(KeyMap.Down);
					break;
				case 'ArrowUp':
					lastKey.key = 'ArrowUp';
					overWorldCtx.keys.pressKey(KeyMap.Up);
					break;
				case 'ArrowRight':
					lastKey.key = 'ArrowRight';
					overWorldCtx.keys.pressKey(KeyMap.Right);
					break;
				case 'ArrowLeft':
					lastKey.key = 'ArrowLeft';
					overWorldCtx.keys.pressKey(KeyMap.Left);
					break;
				case 'Shift':
					if (context.flags.getFlag(FlagEntry.RUNNING_SHOES_UNLOCKED)) {
						context.player.running = !context.player.running;
					}
					break;
				case 'x':
					overWorldCtx.frames.debug = !overWorldCtx.frames.debug;
					break;
				case 'Escape':
					overWorldCtx.menus.menuOpened
						? overWorldCtx.closeMenu(MenuType.MAIN)
						: overWorldCtx.openMenu(MenuType.MAIN);
			}
		} else {
			switch (e.key) {
				case 'Escape':
					overWorldCtx.closeMenu(MenuType.MAIN);
			}
		}
	};

	function toggleQuests() {
		displayedQuests = !displayedQuests;
	}

	function toggleMap() {
		overWorldCtx.toggleMenu(MenuType.MAP);
	}

	function toggleMenu() {
		menu = !menu;
	}

	function save() {
		savesHolder.persist(context.toSaveContext());
		context.notifications.notify('Game successfuly saved');
	}

	onMount(() => {
		abButtons = new ABButtons(abButtonsC);

		abButtons.aButtonValue.subscribe((val) => {
			if (val) {
				overWorldCtx.keys.pressKey(KeyMap.A);
			} else {
				overWorldCtx.keys.unpressKey(KeyMap.A);
			}
		});

		abButtons.bButtonValue.subscribe((val) => {
			if (val) {
				overWorldCtx.keys.pressKey(KeyMap.B);
			} else {
				overWorldCtx.keys.unpressKey(KeyMap.B);
			}
		});

		joystick = new JoystickController(
			{
				dynamicPosition: true,
				dynamicPositionTarget: joysticks,
				containerClass: 'joysticks',
				distortion: true,
				opacity: 0.2
			},
			jsCallback
		);

		window.addEventListener('keydown', keyDownListener);
		window.addEventListener('keyup', keyUpListener);

		overWorldCtx.menus.menuOpened$.subscribe((val) => {
			menu = val;
		});

		return () => {
			joystick?.destroy();
			abButtons?.destroy();
			window.removeEventListener('keydown', keyDownListener);
			window.removeEventListener('keyup', keyUpListener);
		};
	});

	function toggleRunning() {
		if (context.flags.getFlag(FlagEntry.RUNNING_SHOES_UNLOCKED)) {
			context.player.running = !context.player.running;
		}
	}
</script>

<div class="joysticks" bind:this={joysticks}></div>

<div class="quests" class:overlay={displayedQuests}>
	<!-- Might be a component -->
	{#if displayedQuests}
		<div class="quest-list" in:slide={{ duration: 300, axis: 'y', easing: backInOut }} out:fade>
			{#if context.currentQuest}
				<div class="quest">
					<h4>{context.currentQuest?.name}</h4>
					<p>{context.currentQuest?.description}</p>
				</div>
				{#each context.currentQuest?.objectives as obj}
					<div class="obj">
						<span>{obj.description}</span>
						<span>
							{#if obj.completed}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
									><path
										d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5ZM11.0026 16L6.75999 11.7574L8.17421 10.3431L11.0026 13.1716L16.6595 7.51472L18.0737 8.92893L11.0026 16Z"
									></path></svg
								>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
									><path
										d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5Z"
									></path></svg
								>
							{/if}
						</span>
					</div>
				{/each}
			{:else}
				<div class="quest">
					<h3>No Quests</h3>
				</div>
			{/if}
		</div>
	{/if}
</div>

<nav class="menu-dock">
	<!-- Trigger button - always visible -->
	<button
		class="dock-trigger"
		class:expanded={menu}
		onclick={toggleMenu}
		aria-label={menu ? 'Close menu' : 'Open menu'}
		aria-expanded={menu}
	>
		{#if menu}
			<!-- X icon -->
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
				<path
					d="M12 10.586L6.707 5.293 5.293 6.707 10.586 12l-5.293 5.293 1.414 1.414L12 13.414l5.293 5.293 1.414-1.414L13.414 12l5.293-5.293-1.414-1.414L12 10.586z"
				/>
			</svg>
		{:else}
			<!-- Hamburger icon -->
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
				<path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
			</svg>
		{/if}
	</button>

	<!-- Expandable dock panel -->
	{#if menu}
		<div class="dock-panel" transition:slide={{ duration: 350, axis: 'x', easing: backInOut }}>
			<!-- Quests -->
			<button class="dock-item" style="--item-color: #daba2e" onclick={toggleQuests}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M8.00008 6V9H5.00008V6H8.00008ZM3.00008 4V11H10.0001V4H3.00008ZM13.0001 4H21.0001V6H13.0001V4ZM13.0001 11H21.0001V13H13.0001V11ZM13.0001 18H21.0001V20H13.0001V18ZM10.7072 16.2071L9.29297 14.7929L6.00008 18.0858L4.20718 16.2929L2.79297 17.7071L6.00008 20.9142L10.7072 16.2071Z"
					/>
				</svg>
				<span class="dock-label">Quests</span>
			</button>

			<!-- Team -->
			{#if context.isMenuAvailable(MenuType.POKEMON_LIST)}
				<button
					class="dock-item"
					style="--item-color: #d4344b"
					onclick={() => overWorldCtx.toggleMenu(MenuType.POKEMON_LIST)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						version="1.0"
						viewBox="0 0 512 512"
						preserveAspectRatio="xMidYMid meet"
					>
						<g transform="translate(0,512) scale(0.1,-0.1)" fill="currentColor" stroke="none">
							<path
								d="M2367 4549 c-221 -22 -473 -93 -682 -194 -570 -276 -981 -820 -1089 -1442 l-13 -73 701 0 701 0 30 52 c41 71 147 175 225 221 178 104 395 114 582 29 118 -54 238 -165 292 -269 l17 -33 699 0 700 0 0 23 c0 42 -38 202 -75 317 -139 431 -435 814 -824 1065 -361 233 -830 346 -1264 304z"
							/>
							<path
								d="M2462 2934 c-114 -30 -222 -125 -263 -232 -32 -81 -31 -204 1 -287 32 -84 132 -183 214 -214 238 -89 477 46 526 297 39 196 -107 404 -312 442 -66 13 -102 12 -166 -6z m169 -155 c86 -26 159 -126 159 -219 0 -59 -38 -139 -84 -177 -88 -72 -214 -70 -298 5 -53 48 -78 102 -78 172 0 71 26 126 81 173 64 55 138 70 220 46z"
							/>
							<path
								d="M576 2323 c80 -601 399 -1112 894 -1435 844 -552 1968 -385 2618 387 245 292 403 654 456 1048 l5 37 -692 -1 -692 0 -43 -90 c-73 -151 -211 -269 -377 -322 -94 -30 -282 -31 -365 -3 -187 63 -330 190 -405 360 l-25 56 -689 0 -690 0 5 -37z"
							/>
						</g>
					</svg>
					<span class="dock-label">Team</span>
				</button>
			{/if}

			<!-- Bag -->
			{#if context.isMenuAvailable(MenuType.BAG)}
				<button
					class="dock-item"
					style="--item-color: #e57f15"
					onclick={() => overWorldCtx.openMenu(MenuType.BAG)}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M7 5V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V6C2 5.44772 2.44772 5 3 5H7ZM16 15H13V16H11V15H8V19H16V15ZM8 7V13H11V12H13V13H16V7H8ZM6 13V7H4V13H6ZM18 13H20V7H18V13ZM6 15H4V19H6V15ZM18 15V19H20V15H18ZM9 3V5H15V3H9Z"
						/>
					</svg>
					<span class="dock-label">Bag</span>
				</button>
			{/if}

			<!-- Boxes -->
			{#if context.isMenuAvailable(MenuType.BOX)}
				<button
					class="dock-item"
					style="--item-color: #594ae5"
					onclick={() => overWorldCtx.openMenu(MenuType.BOX)}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM5.49388 7.0777L12.0001 10.8444L18.5062 7.07774L12 3.311L5.49388 7.0777ZM4.5 8.81329V16.3469L11.0001 20.1101V12.5765L4.5 8.81329ZM13.0001 20.11L19.5 16.3469V8.81337L13.0001 12.5765V20.11Z"
						/>
					</svg>
					<span class="dock-label">Boxes</span>
				</button>
			{/if}

			<!-- Pokédex -->
			{#if context.isMenuAvailable(MenuType.POKEDEX)}
				<button
					class="dock-item"
					style="--item-color: #f6411b"
					onclick={() => overWorldCtx.openMenu(MenuType.POKEDEX)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						version="1.0"
						viewBox="0 0 512 512"
						preserveAspectRatio="xMidYMid meet"
					>
						<g transform="translate(0,512) scale(0.1,-0.1)" fill="currentColor" stroke="none">
							<path
								d="M903 5100 c-21 -13 -35 -31 -42 -57 -15 -53 -15 -4913 0 -4966 7 -26 21 -44 42 -57 31 -20 65 -20 1657 -20 1598 0 1626 0 1657 20 18 11 36 32 40 47 10 37 10 4949 0 4986 -4 15 -22 36 -40 47 -31 20 -59 20 -1657 20 -1592 0 -1626 0 -1657 -20z m940 -429 c129 -45 229 -148 272 -280 26 -80 18 -217 -18 -295 -127 -277 -479 -343 -691 -130 -228 228 -131 612 179 710 63 20 193 17 258 -5z m673 1 c55 -44 59 -109 10 -158 -70 -70 -175 -26 -176 74 0 61 41 102 102 102 26 0 52 -7 64 -18z m433 -8 c75 -63 30 -184 -69 -184 -43 0 -75 21 -96 62 -35 67 18 148 96 148 27 0 48 -8 69 -26z m432 -3 c23 -24 29 -38 29 -73 -1 -100 -106 -144 -176 -74 -70 70 -26 175 74 176 35 0 49 -6 73 -29z m669 -501 l0 -110 -105 0 -105 0 0 -210 0 -210 105 0 105 0 0 -110 0 -110 -105 0 -105 0 0 -1280 0 -1280 105 0 105 0 0 -105 0 -105 -105 0 -105 0 0 -215 0 -215 -105 0 -105 0 0 1920 0 1920 -278 0 c-418 0 -425 -3 -712 -284 -203 -199 -269 -251 -380 -297 -126 -53 -196 -59 -716 -59 l-474 0 0 110 0 110 488 0 c535 0 545 1 664 61 48 24 106 74 258 223 203 200 269 251 381 298 123 52 180 56 707 57 l482 1 0 -110z m-2483 -1952 c143 -143 159 -169 130 -224 -9 -16 -71 -84 -140 -151 -121 -120 -125 -123 -168 -123 -47 0 -78 19 -98 57 -15 29 -15 496 0 524 18 34 70 61 109 55 28 -4 59 -30 167 -138z m1599 -1602 c49 -49 45 -114 -10 -158 -19 -16 -66 -18 -596 -18 -530 0 -577 2 -596 18 -55 44 -59 109 -10 158 l34 34 572 0 572 0 34 -34z"
							/>
						</g>
					</svg>
					<span class="dock-label">Dex</span>
				</button>
			{/if}

			<!-- Trainer -->
			{#if context.isMenuAvailable(MenuType.TRAINER)}
				<button
					class="dock-item"
					style="--item-color: #10ad6f"
					onclick={() => overWorldCtx.openMenu(MenuType.TRAINER)}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M3 6H21V18H3V6ZM2 4C1.44772 4 1 4.44772 1 5V19C1 19.5523 1.44772 20 2 20H22C22.5523 20 23 19.5523 23 19V5C23 4.44772 22.5523 4 22 4H2ZM13 8H19V10H13V8ZM18 12H13V14H18V12ZM10.5 10C10.5 11.3807 9.38071 12.5 8 12.5C6.61929 12.5 5.5 11.3807 5.5 10C5.5 8.61929 6.61929 7.5 8 7.5C9.38071 7.5 10.5 8.61929 10.5 10ZM8 13.5C6.067 13.5 4.5 15.067 4.5 17H11.5C11.5 15.067 9.933 13.5 8 13.5Z"
						/>
					</svg>
					<span class="dock-label">Trainer</span>
				</button>
			{/if}

			<!-- Map -->
			{#if context.isMenuAvailable(MenuType.BAG)}
				<button class="dock-item" style="--item-color: #5ab142" onclick={toggleMap}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M2 5L9 2L15 5L21.303 2.2987C21.5569 2.18992 21.8508 2.30749 21.9596 2.56131C21.9862 2.62355 22 2.69056 22 2.75827V19L15 22L9 19L2.69696 21.7013C2.44314 21.8101 2.14921 21.6925 2.04043 21.4387C2.01375 21.3765 2 21.3094 2 21.2417V5ZM6 11V13H8V11H6ZM10 11V13H12V11H10ZM16 10.9393L14.7626 9.7019L13.7019 10.7626L14.9393 12L13.7019 13.2374L14.7626 14.2981L16 13.0607L17.2374 14.2981L18.2981 13.2374L17.0607 12L18.2981 10.7626L17.2374 9.7019L16 10.9393Z"
						/>
					</svg>
					<span class="dock-label">Map</span>
				</button>
			{/if}

			<!-- Save -->
			<button class="dock-item" style="--item-color: #05aab3" onclick={save}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M18 19H19V6.82843L17.1716 5H16V9H7V5H5V19H6V12H18V19ZM4 3H18L20.7071 5.70711C20.8946 5.89464 21 6.149 21 6.41421V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM8 14V19H16V14H8Z"
					/>
				</svg>
				<span class="dock-label">Save</span>
			</button>
		</div>
	{/if}
</nav>

{#if context.flags.getFlag(FlagEntry.RUNNING_SHOES_UNLOCKED) && !displayedQuests}
	<button
		class="run-button"
		class:active={context.player?.running}
		onclick={toggleRunning}
		aria-label="Toggle Run"
	>
		<svg viewBox="0 0 24 24" class="shoe-icon" fill="currentColor">
			<path
				d="M13.5 5.5c1 0 2.23.32 3.64.96 2.05.95 2.36 1.58 2.36 2.54 0 .46-.15.88-.44 1.26l-2.75 3.74H4l-.5-4 3.5-2.5c1.35-1.25 3.5-2 5.5-2h1z"
			/>
			<path d="M2 17h18v2H2z" />
		</svg>
	</button>
{/if}

<div class="ab-buttons" bind:this={abButtonsC}></div>

<style lang="scss">
	@keyframes appear {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	// ==========================================
	// DOCK MENU
	// ==========================================

	.menu-dock {
		position: absolute;
		top: max(20px, env(safe-area-inset-top, 20px));
		right: max(20px, env(safe-area-inset-right, 20px));
		z-index: 7;
		display: flex;
		align-items: center;
		flex-direction: row-reverse;
	}

	.dock-trigger {
		background: #0088cc;
		border: 2px solid #000;
		border-radius: 8px;
		width: 52px;
		height: 52px;
		padding: 10px;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		cursor: pointer;
		transition: transform 0.1s ease;

		svg {
			width: 100%;
			height: 100%;
			fill: white;
		}

		&.expanded {
			border-radius: 0 8px 8px 0;
			border-left: none;
		}

		&:hover {
			background: #0099e6;
		}

		&:active {
			transform: translate(2px, 2px);
			box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.4);
		}
	}

	.dock-panel {
		display: flex;
		align-items: center;
		gap: 6px;
		background: #2c3845;
		padding: 4px 8px 4px 12px;
		border: 2px solid #000;
		border-right: none;
		border-radius: 8px 0 0 8px;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
	}

	.dock-item {
		position: relative;
		background: transparent;
		border: 2px solid transparent;
		width: 40px;
		height: 40px;
		padding: 6px;
		border-radius: 6px;
		cursor: pointer;
		color: var(--item-color, white);
		transition: transform 0.1s ease;

		svg {
			width: 100%;
			height: 100%;
		}

		&:hover,
		&:focus-visible {
			background: rgba(255, 255, 255, 0.1);
			transform: scale(1.05);
			border-color: rgba(255, 255, 255, 0.5);

			.dock-label {
				opacity: 1;
				transform: translateX(-50%) translateY(0);
			}
		}

		&:focus-visible {
			outline: 2px solid white;
			outline-offset: 2px;
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.dock-label {
		position: absolute;
		bottom: -28px;
		left: 50%;
		transform: translateX(-50%) translateY(-4px);
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 4px 10px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;

		&::before {
			content: '';
			position: absolute;
			top: -6px;
			left: 50%;
			transform: translateX(-50%);
			border: 6px solid transparent;
			border-bottom-color: rgba(0, 0, 0, 0.9);
		}
	}

	@media (hover: none) {
		.dock-item:active {
			.dock-label {
				opacity: 1;
				transform: translateX(-50%) translateY(0);
			}
		}
	}

	.quests {
		$paper-color: #f1ede9;
		$paper-line: #94acd4;

		&.overlay::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			display: block;
			width: 100dvw;
			height: 100dvh;

			background: rgba(44, 56, 69, 0.6);
			background: radial-gradient(
				circle,
				rgba(0, 0, 0, 0.1) 0%,
				rgba(0, 0, 0, 0.6) 36%,
				rgba(0, 0, 0, 0.75) 50%,
				rgb(0, 0, 0) 100%
			);
			z-index: 6;
		}

		.toggle {
			position: absolute;
			top: 2%;
			left: 1%;
			background-color: rgba(44, 56, 69, 0.95);
			color: white;
			padding: 8px;
			border-radius: 50% 50% 0 0;
			width: 48px;
			height: 48px;
			z-index: 9;
			border: none;

			&:after {
				content: attr(data-title);
				position: absolute;
				bottom: -10px;
				left: 50%;
				transform: translateX(-50%);
				background: rgba(44, 56, 69, 0.95);
				color: white;
				padding: 4px;
				border-radius: 4px;
				font-size: 12px;
				width: 100%;
			}
		}

		.quest-list {
			position: absolute;
			top: calc(4% + 56px);
			left: 1%;
			background: #333;
			color: white;
			font-size: 22px;
			outline: 0;
			padding: 8px;
			border-radius: 4px;
			z-index: 9;
			max-height: 96dvh;
			max-width: 60dvw;
			overflow: auto;

			.quest {
				margin-bottom: 8px;

				h4 {
					text-align: center;
				}
			}

			.obj {
				display: flex;
				justify-content: space-between;
				align-items: center;

				background: repeating-linear-gradient(
					$paper-color,
					$paper-color 31px,
					$paper-line 31px,
					$paper-line 32px
				);
				color: black;
				line-height: 32px;
				outline: 0;
				font-size: 22px;
				padding: 0 8px;

				svg {
					height: 32px;
					width: 32px;
					color: black;
				}
			}
		}
	}

	.joysticks {
		height: calc(96dvh - 40px);
		width: 100dvw;
		z-index: 6;
		position: absolute;
		left: 0;
		top: calc(40px + 4dvh);
	}

	.run-button {
		position: absolute;
		bottom: calc(5dvh + 20px + 140px);
		right: calc(max(20px, env(safe-area-inset-right, 20px)) + 70px);
		z-index: 6;

		width: 48px;
		height: 48px;
		background: #334455;
		border: 2px solid #000;
		border-radius: 50%;
		box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.1s;

		svg {
			width: 24px;
			height: 24px;
			color: white;
		}

		&.active {
			background: #ffd700;
			transform: translate(2px, 2px);
			box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
			svg {
				color: #000;
			}
		}

		&:hover {
			filter: brightness(1.1);
		}
	}

	/* Global overrides for A/B buttons */
	:global(.ab-buttons) {
		width: 110px !important;
		height: 110px !important;
		position: absolute !important;
		bottom: max(5dvh, env(safe-area-inset-bottom, 20px)) !important;
		right: max(3dvw, env(safe-area-inset-right, 20px)) !important;
		display: block !important;
	}

	:global(.ab-buttons button) {
		position: absolute !important;
		border-radius: 50% !important;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4) !important;
		border: 2px solid #000 !important;
		transition: transform 0.1s !important;
		margin: 0 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;
	}

	:global(.ab-buttons button:hover) {
		filter: brightness(1.1);
		box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.4) !important;
	}

	:global(.ab-buttons button:active) {
		transform: translate(2px, 2px) !important;
		box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4) !important;
	}

	/* A Button */
	:global(.ab-buttons button:first-child) {
		width: 64px !important;
		height: 64px !important;
		top: 0 !important;
		right: 0 !important;
		background-color: #334455 !important;
		font-size: 24px !important;
	}

	:global(.ab-buttons button:first-child::after) {
		content: '[Z]';
		position: absolute;
		bottom: -20px;
		font-size: 12px;
		color: white;
		text-shadow: 1px 1px 0 #000;
		pointer-events: none;
		opacity: 0.8;
	}

	/* B Button */
	:global(.ab-buttons button:last-child) {
		width: 48px !important;
		height: 48px !important;
		bottom: 0 !important;
		left: 0 !important;
		background-color: #334455 !important;
		font-size: 20px !important;
	}

	:global(.ab-buttons button:last-child::after) {
		content: '[X]';
		position: absolute;
		bottom: -20px;
		font-size: 12px;
		color: white;
		text-shadow: 1px 1px 0 #000;
		pointer-events: none;
		opacity: 0.8;
	}
</style>
