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

	$: current = dialog?.current || undefined;
	let selectedOption = 0;

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
		console.log(current);
		if (e.key === 'Enter') {
			if (current?.options?.length) {
				console.log('selecting option', selectedOption);
				dialog?.selectOption(selectedOption);
			} else if (animate) {
				next();
			}
		} else if (e.key === 'ArrowUp' && current?.options?.length) {
			selectedOption = Math.max(0, selectedOption - 1);
		} else if (e.key === 'ArrowDown' && current?.options?.length) {
			selectedOption = Math.min(current?.options?.length - 1, selectedOption + 1);
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
			<div>{current?.text}</div>
		</div>
	</div>
</div>

{#if current?.options}
	<div class="options">
		<ul>
			{#each current.options as option, index}
				<li
					class:selected={selectedOption === index}
					on:click={() => {
						dialog?.selectOption(index);
					}}
				>
					{option}
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style lang="scss">
	.options {
		position: absolute;
		font-size: 32px;
		font-weight: 500;
		text-align: left;
		bottom: 1%;
		right: 1%;
		padding: 22px 36px 22px 36px;
		background: rgb(220, 231, 233);
		background: linear-gradient(
			180deg,
			rgba(220, 231, 233, 1) 0%,
			rgba(255, 255, 255, 1) 50%,
			rgba(220, 231, 233, 0.713344712885154) 100%
		);
		border: 2px solid #54506c;
		border-radius: 8px;
		box-sizing: border-box;
		transition: bottom 0.3s ease-in-out;
		z-index: 8;

		&.hidden {
			bottom: -100dvh;
		}

		ul {
			margin: 0;
			padding: 0;
			list-style: none;
			display: flex;
			flex-direction: column;
			gap: 16px;

			li {
				&.selected::before {
					content: '';
					width: 0;
					height: 0;
					border-top: 12px solid transparent;
					border-bottom: 12px solid transparent;
					border-left: 12px solid #262626;
					position: absolute;
					left: 5px;
					margin-top: 2px;
				}
			}
		}
	}
	.dialog {
		position: absolute;
		bottom: 1dvh;
		left: 1dvw;
		width: 98dvw;
		height: 25dvh;
		z-index: 7;

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
