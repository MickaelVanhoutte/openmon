<script lang="ts">
	import { onMount } from 'svelte';
	import type { Dialog } from '../../js/scripting/scripts';
	import type { Unsubscriber } from 'svelte/store';
	import type { GameContext } from '../../js/context/gameContext';
	import { CHARACTER_SPRITES } from '../../js/sprites/sprites';

	interface Props {
		dialog: Dialog | undefined;
		context: GameContext;
		animate?: boolean;
	}

	let { dialog = $bindable(), context, animate = true }: Props = $props();

	let text: HTMLDivElement | undefined = $state();
	let unsubscribe: Unsubscriber | undefined;
	let selectedOption = $state(0);
	let src = $state('');
	let npcName = $state('');

	let current = $derived(dialog?.current || undefined);

	$effect(() => {
		if (current?.speaker) {
			if (current.speaker === 'follower' && context.player.follower) {
				const id = ('00' + context.player.follower.pokemon.id).slice(-3);
				src = 'src/assets/monsters/pokedex/' + id + '.png';
			} else if (current.speaker !== 'self' && Number(current.speaker)) {
				const sprite = CHARACTER_SPRITES.getSprite(Number.parseInt(current.speaker));
				src = sprite.full.source;
				npcName = sprite.name;
			}
		}
	});

	function next() {
		const tmp = dialog?.next();
		if (tmp && text) {
			text.classList?.remove('animate');
			setTimeout(() => {
				if (animate && text) {
					text.classList?.add('animate');
				}
			}, 100);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (current?.options?.length) {
				dialog?.selectOption(selectedOption);
				next();
			} else if (animate) {
				next();
			}
		} else if (e.key === 'ArrowUp' && current?.options?.length) {
			selectedOption = Math.max(0, selectedOption - 1);
		} else if (e.key === 'ArrowDown' && current?.options?.length) {
			selectedOption = Math.min(current.options.length - 1, selectedOption + 1);
		}
	}

	function handleOptionClick(index: number) {
		dialog?.selectOption(index);
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		setTimeout(() => {
			unsubscribe = context.overWorldContext.keys.a?.subscribe((value) => {
				if (value) {
					if (current?.options?.length) {
						dialog?.selectOption(selectedOption);
						next();
					} else if (animate) {
						next();
					}
				}
			});
		}, 200);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
			unsubscribe?.();
		};
	});
</script>

{#if current?.speaker && current?.speaker === 'self'}
	<img src={context.player.sprite.full.source} alt="speaker" class="speaker-img" />
	<div class="speaker-name">
		{context.player.name}
	</div>
{:else if current?.speaker && current?.speaker === 'follower'}
	<img src={src.replaceAll('"', '')} alt="speaker" class="speaker-img" />
	<div class="speaker-name">
		{context.player.monsters[0].name}
	</div>
{:else if current?.speaker === 'System'}
	<!-- System speaker - no image -->
{:else if !Number.isNaN(current?.speaker)}
	<img {src} alt="speaker" class="speaker-img" />
	<div class="speaker-name">
		{npcName}
	</div>
{/if}

<div class="dialog">
	<div class="dialog-content">
		<div class="dialog-text" class:animate bind:this={text}>
			<div>{current?.text}</div>
		</div>
	</div>
</div>

{#if current?.options?.length}
	<div class="options" class:hidden={!current?.options?.length}>
		<ul>
			{#each current.options as option, index}
				<li
					class:selected={selectedOption === index}
					onclick={() => handleOptionClick(index)}
					onkeydown={(e) => e.key === 'Enter' && handleOptionClick(index)}
					role="button"
					tabindex="0"
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
		bottom: 27%;
		right: 1%;
		padding: 22px 36px 22px 36px;
		background: #143855;
		border: 2px solid #000;
		border-radius: 0;
		box-sizing: border-box;
		transition: bottom 0.3s ease-in-out;
		z-index: 8;
		color: #ffffff;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);

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
				cursor: pointer;

				&.selected::before {
					content: '';
					width: 0;
					height: 0;
					border-top: 12px solid transparent;
					border-bottom: 12px solid transparent;
					border-left: 12px solid #ffd700;
					position: absolute;
					left: 5px;
					margin-top: 2px;
				}
			}
		}
	}

	.speaker-img {
		position: absolute;
		bottom: 20dvh;
		left: 1dvw;
		height: 60dvh;
		z-index: 5;
		border-radius: 0;
		border: 2px solid #000;
		background: rgba(0, 0, 0, 0.5);
	}

	.speaker-name {
		position: absolute;
		bottom: 27dvh;
		left: 1dvw;
		z-index: 7;
		font-size: 32px;
		font-weight: 500;
		color: #ffffff;
		border: 2px solid #000;
		border-radius: 0;
		padding: 4px;
		min-width: 20dvw;
		text-align: center;
		background: #0088cc;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
	}

	.dialog {
		position: absolute;
		bottom: 1dvh;
		left: 1dvw;
		width: calc(92dvw - 110px);
		height: 25dvh;
		z-index: 7;

		background: #143855;
		border: 2px solid #000;
		border-radius: 0;
		box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
		box-sizing: border-box;
		padding: 16px;
		font-size: 32px;
		font-weight: 500;
		color: #ffffff;

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
