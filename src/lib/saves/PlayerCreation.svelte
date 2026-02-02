<script lang="ts">
	import { onMount } from 'svelte';
	import { SavesHolder } from '../../js/context/savesHolder';
	import { CHARACTER_SPRITES } from '../../js/sprites/sprites';

	/**
	 * Player creation component
	 * lots todo here (design, classes, etc)
	 */

	interface Props {
		savesHolder: SavesHolder;
	}

	const { savesHolder }: Props = $props();

	let selected = $state(1);
	const templates = [1, 2];
	const sprite = $derived(CHARACTER_SPRITES.getSprite(selected));
	let playerName = $state('');
	let sound: Howl;

	function loadSound() {
		sound = new Howl({
			src: ['src/assets/audio/save.mp3'],
			autoplay: true,
			loop: true,
			volume: 0.5
		});
	}

	function handleSubmit() {
		savesHolder.newGame(selected, playerName, selected === 0 ? 'MALE' : 'FEMALE');
	}

	onMount(() => {
		loadSound();
		return () => {
			sound.fade(0.5, 0, 1000);
			setTimeout(() => {
				sound.stop();
			}, 1000);
		};
	});
</script>

<div class="create" data-testid="player-creation">
	{#each Array.from({ length: 15 }) as _}
		<div class="firefly"></div>
	{/each}

	<img src={sprite.full.source} alt="player" class="preview" />
	<img src="src/assets/monsters/pokedex/050.png" alt="player" class="preview-poke" />

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
	>
		<h1>New game</h1>
		<label for="template">Are you a</label>
		<select id="template" bind:value={selected}>
			{#each templates as template}
				<option value={template}>
					{template === 1 ? 'Boy' : 'Girl'}
				</option>
			{/each}
		</select>

		<label for="name">What's your name?</label>
		<input id="name" placeholder={sprite.name} bind:value={playerName} data-testid="name-input" />

		<button type="submit" disabled={playerName?.length === 0} data-testid="confirm-button"
			>Start</button
		>
	</form>
</div>

<style lang="scss">
	.create {
		position: absolute;
		top: 0;
		left: 0;
		width: 100dvw;
		height: 100dvh;
		padding: 2%;

		color: #e0e0e0;
		background: #0f0c29; /* fallback for old browsers */
		background: -webkit-linear-gradient(
			to right,
			#24243e,
			#302b63,
			#0f0c29
		); /* Chrome 10-25, Safari 5.1-6 */
		background: linear-gradient(
			to right,
			#24243e,
			#302b63,
			#0f0c29
		); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

		h1 {
			margin: 0.35em 0;
		}

		form {
			max-width: 40%;
			margin: 0 auto;
			display: flex;
			flex-direction: column;
			gap: 16px;
			position: relative;
			z-index: 2;
		}

		.preview {
			position: absolute;
			right: -7%;
			top: 0;
			z-index: 0;
			height: 100%;
		}

		.preview-poke {
			position: absolute;
			left: 0;
			bottom: 10%;
			z-index: 0;
			height: 60%;
			filter: blur(1px);
		}
	}
</style>
