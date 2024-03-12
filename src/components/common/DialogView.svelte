<script lang="ts">
	import { onMount } from 'svelte';
	import type { Dialog } from '../../js/scripting/scripts';
	import type { Unsubscriber } from 'svelte/store';
	import type { GameContext } from '../../js/context/gameContext';

	export let dialog: Dialog | undefined;
	export let context: GameContext;
	export let animate: boolean = true;

	let text: HTMLDivElement;
	let unsubscribe: Unsubscriber;

	$: current = dialog?.current?.text || '';

	function next() {
		let tmp = dialog?.next();
		if (tmp) {
			current = tmp;
			text.classList.remove('animate');
			setTimeout(() => {
				if (animate) text.classList.add('animate');
			}, 100);
		}
	}

	const listener = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && animate) {
			next();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', listener);
		setTimeout(() => {
			unsubscribe = context.overWorldContext.keys.a?.subscribe((value) => {
				if (value && text) {
					next();
				}
			});
		}, 1000);

		return () => {
			window.removeEventListener('keydown', listener);
			unsubscribe && unsubscribe();
		};
	});
</script>

<div class="dialog">
	<div class="dialog-content">
		<div class="dialog-text" class:animate bind:this={text}>
			<div>{current}</div>
		</div>
	</div>
</div>

<style lang="scss">
	.dialog {
		position: absolute;
		bottom: 1dvh;
		left: 1dvw;
		width: 98dvw;
		height: 25dvh;
		z-index: 8;

		background: rgb(220, 231, 233);
		border: 2px solid #54506c;
		border-radius: 8px;
		box-sizing: border-box;
		padding: 2%;
		font-size: 32px;
		font-weight: 500;
		color: black;

		.dialog-content {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.dialog-text {
				display: inline-block;

				&.animate div {
					opacity: 1;
					border-right: 0.15em solid orange;
					animation:
						typing 1s steps(20, end) forwards,
						blink-caret 0.5s step-end infinite;
				}

				div {
					opacity: 0;
					overflow: hidden;
					white-space: nowrap;
				}
			}

			@keyframes typing {
				from {
					width: 0;
				}
				to {
					width: 100%;
				}
			}

			/* The typewriter cursor effect */
			@keyframes blink-caret {
				from,
				to {
					border-color: transparent;
				}
				50% {
					border-color: orange;
				}
			}
		}
	}
</style>
