<script lang="ts">
	import { onMount } from 'svelte';
	import { MenuType, type OverworldContext } from '../../js/context/overworldContext';
	import { ABButtons, KeyMap, lastKey } from '../../js/commands/controls';
	import { JoystickController } from '../../js/commands/js-control';
	import type { GameContext } from '../../js/context/gameContext';

	export let context: GameContext;
	export let overWorldCtx: OverworldContext;

	let abButtonsC: HTMLDivElement;
	let joysticks: HTMLDivElement;
	let abButtons: ABButtons;
	let joystick: JoystickController;
	let i = 0;
	// Joystick listener
	const jsCallback = (data: any) => {
		// convert data.angle (radian) to a direction (top, bottom, left, right)

		if (!overWorldCtx.isPaused) {
			if (data.angle) {
				let degrees = data.angle * (180 / Math.PI);

				if (degrees < 0) {
					degrees = 360 + degrees;
				}

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
				overWorldCtx.keys.resetAll();
			}
		}
	};

	// Keyboard listeners

	const keyUpListener = (e: KeyboardEvent) => {
		if (!overWorldCtx.isPaused) {
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
		if (!overWorldCtx.isPaused) {
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
					context.player.running = !context.player.running;
					break;
				case 'x':
					overWorldCtx.frames.debug = !overWorldCtx.frames.debug;
					break;
				case 'Escape':
					if (!context.overWorldContext.isPaused)
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
				distortion: true
			},
			jsCallback
		);

		window.addEventListener('keydown', keyDownListener);
		window.addEventListener('keyup', keyUpListener);

		return () => {
			joystick?.destroy();
			abButtons?.destroy();
			window.removeEventListener('keydown', keyDownListener);
			window.removeEventListener('keyup', keyUpListener);
		};
	});
</script>

<div class="joysticks" bind:this={joysticks}></div>

<div class="run-toggle">
	{#if context.player?.running}
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
			<path
				d="M9.82986 8.78986L7.99998 9.45588V13H5.99998V8.05H6.015L11.2834 6.13247C11.5274 6.03855 11.7922 5.99162 12.0648 6.0008C13.1762 6.02813 14.1522 6.75668 14.4917 7.82036C14.678 8.40431 14.848 8.79836 15.0015 9.0025C15.9138 10.2155 17.3653 11 19 11V13C16.8253 13 14.8823 12.0083 13.5984 10.4526L12.9008 14.4085L15 16.17V23H13V17.1025L10.7307 15.1984L10.003 19.3253L3.10938 18.1098L3.45667 16.1401L8.38071 17.0084L9.82986 8.78986ZM13.5 5.5C12.3954 5.5 11.5 4.60457 11.5 3.5C11.5 2.39543 12.3954 1.5 13.5 1.5C14.6046 1.5 15.5 2.39543 15.5 3.5C15.5 4.60457 14.6046 5.5 13.5 5.5Z"
			></path>
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
			<path
				d="M7.61713 8.71233L10.8222 6.38373C11.174 6.12735 11.6087 5.98543 12.065 6.0008C13.1764 6.02813 14.1524 6.75668 14.4919 7.82036C14.6782 8.40431 14.8481 8.79836 15.0017 9.0025C15.914 10.2155 17.3655 11 19.0002 11V13C16.8255 13 14.8825 12.0083 13.5986 10.4526L12.901 14.4085L14.9621 16.138L17.1853 22.246L15.3059 22.93L13.266 17.3256L9.87576 14.4808C9.32821 14.0382 9.03139 13.3192 9.16231 12.5767L9.67091 9.6923L8.99407 10.1841L6.86706 13.1116L5.24902 11.9361L7.60016 8.7L7.61713 8.71233ZM13.5002 5.5C12.3956 5.5 11.5002 4.60457 11.5002 3.5C11.5002 2.39543 12.3956 1.5 13.5002 1.5C14.6047 1.5 15.5002 2.39543 15.5002 3.5C15.5002 4.60457 14.6047 5.5 13.5002 5.5ZM10.5286 18.6813L7.31465 22.5116L5.78257 21.226L8.75774 17.6803L9.50426 15.5L11.2954 17L10.5286 18.6813Z"
			></path>
		</svg>
	{/if}

	<label class="switch">
		<input
			type="checkbox"
			checked={context.player?.running ? true : undefined}
			on:change={() => (context.player.running = !context.player?.running)}
		/>
		<span> </span>
	</label>
</div>

{#if !overWorldCtx.isPaused}
	<button on:click={() => overWorldCtx.openMenu(MenuType.MAIN)} class="start">start </button>
{/if}

<div class="ab-buttons" bind:this={abButtonsC}></div>

<style lang="scss">
	.joysticks {
		height: 100dvh;
		width: calc(99dvw - 130px);
		z-index: 6;
		position: absolute;
		left: 0;
		top: 0;
	}

	.start {
		font-family: pokemon, serif;
		position: absolute;
		bottom: 2dvh;
		left: calc(50% - 25px);
		height: 24px;
		box-sizing: border-box;
		text-align: center;
		padding: 0 16px;
		display: flex;
		border-radius: 12px;
		background-color: rgba(44, 56, 69, 0.95);
		outline: none;
		z-index: 7;
		font-size: 18px;
		border: none;
		color: white;
		justify-content: center;
		align-items: center;
	}

	.run-toggle {
		position: absolute;
		bottom: 2dvh;
		left: 1dvw;
		z-index: 6;

		display: flex;

		svg {
			height: 24px;
			color: rgba(44, 56, 69, 0.95);
		}

		$primary: rgba(44, 56, 69, 0.95);
		$lightGrey: rgba(44, 56, 69, 0.95);

		.switch {
			height: 24px;
			display: block;
			position: relative;
			cursor: pointer;

			input {
				display: none;

				& + span {
					padding-left: 50px;
					min-height: 24px;
					line-height: 24px;
					display: block;
					color: $lightGrey;
					position: relative;
					white-space: nowrap;
					transition: color 0.3s ease;

					&:before,
					&:after {
						content: '';
						display: block;
						position: absolute;
						border-radius: 12px;
					}

					&:before {
						top: 0;
						left: 0;
						width: 42px;
						height: 24px;
						background: $lightGrey;
						transition: all 0.3s ease;
					}

					&:after {
						width: 18px;
						height: 18px;
						background: #fff;
						top: 3px;
						left: 3px;
						box-shadow: 0 1px 3px rgba(#121621, 0.1);
						transition: all 0.45s ease;
					}
				}

				&:checked {
					& + span {
						&:before {
							background: rgba($primary, 0.85);
						}

						&:after {
							background: #fff;
							transform: translate(18px, 0);
						}
					}
				}
			}
		}
	}
</style>
